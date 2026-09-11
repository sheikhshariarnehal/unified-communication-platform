import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/whatsapp/encryption";
import { sendTextMessage, sendTemplateMessage } from "@/lib/whatsapp/meta-api";
import { sanitizePhoneForMeta } from "@/lib/whatsapp/phone-utils";

const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversation_id,
      contact_id,
      message_type = "text",
      content_text,
      template_name,
      template_language = "en_US",
      template_params = [],
    } = body;

    if (!conversation_id && !contact_id) {
      return NextResponse.json(
        { error: "Either conversation_id or contact_id is required" },
        { status: 400 }
      );
    }

    if (message_type === "text" && !content_text?.trim()) {
      return NextResponse.json({ error: "Message text cannot be empty" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch credentials
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .maybeSingle();

    let phoneNumberId = config?.phone_number_id;
    let rawToken = config?.access_token;

    if (!phoneNumberId || !rawToken) {
      const { data: accounts } = await supabase
        .from("whatsapp_accounts")
        .select("*")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .limit(1);

      if (accounts && accounts.length > 0) {
        phoneNumberId = accounts[0].phone_number_id;
        rawToken = accounts[0].encrypted_access_token;
      }
    }

    // Fallback to environment variables
    if (!phoneNumberId) phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    if (!rawToken) rawToken = process.env.META_PERMANENT_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

    if (!phoneNumberId || !rawToken) {
      return NextResponse.json(
        { error: "WhatsApp Business credentials are not configured in settings." },
        { status: 400 }
      );
    }

    const accessToken = decrypt(rawToken);

    // 2. Resolve or create conversation and contact
    let convId = conversation_id;
    let recipientPhone = "";

    if (convId) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id, contact_id, contact:contacts(phone)")
        .eq("id", convId)
        .maybeSingle();

      if (conv) {
        recipientPhone = (conv.contact as any)?.phone || "";
      }
    } else if (contact_id) {
      const { data: contact } = await supabase
        .from("contacts")
        .select("id, phone")
        .eq("id", contact_id)
        .maybeSingle();

      if (contact) {
        recipientPhone = contact.phone || "";
        // Find or create conversation
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .eq("workspace_id", DEFAULT_WORKSPACE_ID)
          .eq("contact_id", contact.id)
          .maybeSingle();

        if (existingConv) {
          convId = existingConv.id;
        } else {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({
              workspace_id: DEFAULT_WORKSPACE_ID,
              contact_id: contact.id,
              status: "open",
            })
            .select()
            .single();

          if (newConv) convId = newConv.id;
        }
      }
    }

    recipientPhone = sanitizePhoneForMeta(recipientPhone);

    if (!recipientPhone) {
      return NextResponse.json(
        { error: "Recipient contact does not have a valid phone number." },
        { status: 400 }
      );
    }

    // 3. Dispatch to Meta Cloud API
    let metaMessageId = `mock_wamid_${Date.now()}`;
    try {
      if (message_type === "text") {
        const res = await sendTextMessage({
          phoneNumberId,
          accessToken,
          to: recipientPhone,
          text: content_text,
        });
        metaMessageId = res.messageId;
      } else if (message_type === "template") {
        const res = await sendTemplateMessage({
          phoneNumberId,
          accessToken,
          to: recipientPhone,
          templateName: template_name || "hello_world",
          language: template_language,
          params: template_params,
        });
        metaMessageId = res.messageId;
      }
    } catch (metaErr: any) {
      console.error("[WhatsApp Send] Meta Graph API dispatch error:", metaErr);
      return NextResponse.json(
        { error: metaErr.message || "Meta API rejected message send." },
        { status: 502 }
      );
    }

    // 4. Save to messages table
    const messagePayload = {
      workspace_id: DEFAULT_WORKSPACE_ID,
      conversation_id: convId,
      sender_type: "agent",
      content_type: message_type,
      content_text: content_text || `Template: ${template_name}`,
      template_name: message_type === "template" ? template_name : null,
      message_id: metaMessageId,
      status: "sent",
    };

    const { data: insertedMsg, error: msgErr } = await supabase
      .from("messages")
      .insert(messagePayload)
      .select()
      .single();

    if (msgErr) {
      console.warn("[WhatsApp Send] DB message record note:", msgErr.message);
    }

    // Update conversation last message snippet and timestamp
    if (convId) {
      await supabase
        .from("conversations")
        .update({
          last_message_text: content_text || `Template: ${template_name}`,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);
    }

    return NextResponse.json({
      success: true,
      message: insertedMsg || messagePayload,
    });
  } catch (err: any) {
    console.error("[WhatsApp Send] Server exception:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}
