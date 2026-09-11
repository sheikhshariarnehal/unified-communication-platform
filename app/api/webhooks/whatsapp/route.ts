import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";
import { sanitizePhoneForMeta } from "@/lib/whatsapp/phone-utils";

const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

// Meta Webhook Verification (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const DEFAULT_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "unified_webhook_token";

  let isVerified = mode === "subscribe" && token === DEFAULT_VERIFY_TOKEN;

  if (!isVerified && mode === "subscribe" && token) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("whatsapp_config")
        .select("verify_token")
        .eq("verify_token", token)
        .limit(1);

      if (data && data.length > 0) {
        isVerified = true;
      }
    } catch (err) {
      console.warn("[WhatsApp Webhook Verify] Database lookup error:", err);
    }
  }

  if (isVerified) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Meta Webhook Delivery & Message Ingestion (POST)
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    let appSecret = process.env.META_APP_SECRET;
    const supabase = getSupabaseAdmin();

    if (!appSecret) {
      try {
        const { data } = await supabase
          .from("whatsapp_config")
          .select("app_secret")
          .not("app_secret", "is", null)
          .limit(1);

        if (data && data.length > 0 && data[0].app_secret) {
          appSecret = data[0].app_secret;
        }
      } catch (err) {
        console.warn("[WhatsApp Webhook POST] App secret lookup error:", err);
      }
    }

    // Verify HMAC-SHA256 signature if appSecret is present
    if (appSecret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex")}`;

      if (signature !== expectedSignature) {
        console.error("[WhatsApp Webhook] HMAC signature mismatch. Rejecting untrusted request.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // -------------------------------------------------------------
          // 1. PROCESS DELIVERY STATUSES (sent, delivered, read, failed)
          // -------------------------------------------------------------
          if (value.statuses && Array.isArray(value.statuses)) {
            for (const statusItem of value.statuses) {
              const wamid = statusItem.id;
              const newStatus = statusItem.status; // "delivered" | "read" | "failed"

              console.log(`[WhatsApp Webhook] Status update for ${wamid}: ${newStatus}`);

              // Update in messages table
              await supabase
                .from("messages")
                .update({ status: newStatus })
                .eq("message_id", wamid);

              // Update in broadcast_recipients
              const updateRecip: any = { status: newStatus };
              if (newStatus === "delivered") updateRecip.delivered_at = new Date().toISOString();
              if (newStatus === "read") updateRecip.read_at = new Date().toISOString();
              if (newStatus === "failed") {
                updateRecip.error_message = statusItem.errors?.[0]?.title || "Delivery failed";
              }

              await supabase
                .from("broadcast_recipients")
                .update(updateRecip)
                .eq("whatsapp_message_id", wamid);

              // Also update in campaign_recipients if exists
              const { data: updatedRecips } = await supabase
                .from("campaign_recipients")
                .update(updateRecip)
                .eq("provider_message_id", wamid)
                .select("campaign_id");

              if (updatedRecips && updatedRecips.length > 0 && newStatus === "failed") {
                for (const r of updatedRecips) {
                  if (r.campaign_id) {
                    const { data: c } = await supabase
                      .from("campaigns")
                      .select("stats")
                      .eq("id", r.campaign_id)
                      .maybeSingle();

                    if (c) {
                      const st = (c.stats as any) || { sent: 0, failed: 0, delivered: 0 };
                      await supabase
                        .from("campaigns")
                        .update({
                          status: "failed",
                          stats: {
                            ...st,
                            failed: (st.failed || 0) + 1,
                            delivered: Math.max(0, (st.delivered || 0) - 1),
                          },
                        })
                        .eq("id", r.campaign_id);
                    }
                  }
                }
              }
            }
          }

          // -------------------------------------------------------------
          // 2. PROCESS INBOUND CUSTOMER MESSAGES
          // -------------------------------------------------------------
          if (value.messages && Array.isArray(value.messages)) {
            for (const msg of value.messages) {
              const senderPhone = sanitizePhoneForMeta(msg.from);
              const messageId = msg.id;
              const textBody = msg.text?.body || msg.button?.text || "";
              const contentType = msg.type || "text";

              // Check for opt-out STOP / UNSUBSCRIBE keywords
              const upperText = textBody.trim().toUpperCase();
              if (upperText === "STOP" || upperText === "UNSUBSCRIBE") {
                console.log(`[WhatsApp Webhook] Opt-out requested by ${senderPhone}`);
                await supabase.from("suppression_entries").upsert(
                  {
                    workspace_id: DEFAULT_WORKSPACE_ID,
                    type: "phone",
                    value: senderPhone,
                    reason: "opt_out",
                  },
                  { onConflict: "workspace_id, type, value" }
                );
              }

              // Match or create Contact in contacts table
              let contactId: string | null = null;
              const { data: existingContact } = await supabase
                .from("contacts")
                .select("id")
                .eq("workspace_id", DEFAULT_WORKSPACE_ID)
                .or(`phone.eq.${senderPhone},phone.eq.+${senderPhone}`)
                .limit(1)
                .maybeSingle();

              if (existingContact) {
                contactId = existingContact.id;
              } else {
                const profileName = value.contacts?.[0]?.profile?.name || `WhatsApp User ${senderPhone.slice(-4)}`;
                const { data: newContact } = await supabase
                  .from("contacts")
                  .insert({
                    workspace_id: DEFAULT_WORKSPACE_ID,
                    phone: `+${senderPhone}`,
                    first_name: profileName,
                    source: "whatsapp_inbound",
                  })
                  .select("id")
                  .single();

                if (newContact) contactId = newContact.id;
              }

              if (!contactId) continue;

              // Find or create Conversation
              let conversationId: string | null = null;
              const { data: existingConv } = await supabase
                .from("conversations")
                .select("id, unread_count")
                .eq("workspace_id", DEFAULT_WORKSPACE_ID)
                .eq("contact_id", contactId)
                .maybeSingle();

              if (existingConv) {
                conversationId = existingConv.id;
                await supabase
                  .from("conversations")
                  .update({
                    status: "open",
                    last_message_text: textBody || `[${contentType}]`,
                    last_message_at: new Date().toISOString(),
                    unread_count: (existingConv.unread_count || 0) + 1,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", conversationId);
              } else {
                const { data: newConv } = await supabase
                  .from("conversations")
                  .insert({
                    workspace_id: DEFAULT_WORKSPACE_ID,
                    contact_id: contactId,
                    status: "open",
                    last_message_text: textBody || `[${contentType}]`,
                    last_message_at: new Date().toISOString(),
                    unread_count: 1,
                  })
                  .select("id")
                  .single();

                if (newConv) conversationId = newConv.id;
              }

              // Insert into messages table
              if (conversationId) {
                await supabase.from("messages").insert({
                  workspace_id: DEFAULT_WORKSPACE_ID,
                  conversation_id: conversationId,
                  sender_type: "customer",
                  content_type: contentType === "text" ? "text" : "interactive",
                  content_text: textBody,
                  message_id: messageId,
                  status: "delivered",
                });
              }
            }
          }
        }
      }

      return NextResponse.json({ received: true }, { status: 200 });
    }

    return NextResponse.json({ received: false }, { status: 404 });
  } catch (err: any) {
    console.error("[WhatsApp Webhook POST Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
