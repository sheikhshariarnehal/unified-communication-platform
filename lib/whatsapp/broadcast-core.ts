import { SupabaseClient } from "@supabase/supabase-js";
import { sendTemplateMessage } from "@/lib/whatsapp/meta-api";
import { decrypt } from "@/lib/whatsapp/encryption";
import {
  sanitizePhoneForMeta,
  isValidE164,
  phoneVariants,
  isRecipientNotAllowedError,
} from "@/lib/whatsapp/phone-utils";

export interface BroadcastRecipientInput {
  to: string;
  contactId?: string;
  params?: string[];
}

export interface CreateBroadcastParams {
  name: string;
  templateName: string;
  templateLanguage?: string;
  recipients: BroadcastRecipientInput[];
}

export interface BroadcastPlan {
  broadcastId: string;
  templateName: string;
  templateLanguage: string;
  phoneNumberId: string;
  accessToken: string;
  recipients: Array<{
    recipientRowId: string;
    contactId: string;
    phone: string;
    params: string[];
  }>;
}

/**
 * Creates and initializes a WhatsApp Broadcast record with recipients.
 */
export async function createBroadcast(
  supabase: SupabaseClient,
  workspaceId: string,
  params: CreateBroadcastParams
): Promise<BroadcastPlan> {
  const { name, templateName, templateLanguage = "en_US", recipients } = params;

  if (!templateName) {
    throw new Error("Template name is required");
  }
  if (!recipients || recipients.length === 0) {
    throw new Error("No recipients specified for broadcast");
  }

  // 1. Fetch WhatsApp configuration
  const { data: config, error: configError } = await supabase
    .from("whatsapp_config")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  let phoneNumberId = config?.phone_number_id;
  let rawToken = config?.access_token;

  if (!phoneNumberId || !rawToken) {
    // Check whatsapp_accounts fallback
    const { data: accounts } = await supabase
      .from("whatsapp_accounts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (accounts && accounts.length > 0) {
      phoneNumberId = accounts[0].phone_number_id;
      rawToken = accounts[0].encrypted_access_token;
    }
  }

  if (!phoneNumberId || !rawToken) {
    throw new Error("WhatsApp account is not configured. Please enter your Meta API credentials in WhatsApp Configuration.");
  }

  const accessToken = decrypt(rawToken);

  // 2. Validate and deduplicate recipients by phone
  const validRecipients: Array<{ contactId: string; phone: string; params: string[] }> = [];
  const seenPhones = new Set<string>();

  for (const r of recipients) {
    const sanitized = sanitizePhoneForMeta(r.to);
    if (!sanitized || !isValidE164(sanitized)) continue;
    if (seenPhones.has(sanitized)) continue;
    seenPhones.add(sanitized);

    validRecipients.push({
      contactId: r.contactId || "",
      phone: sanitized,
      params: r.params || [],
    });
  }

  if (validRecipients.length === 0) {
    throw new Error("No valid E.164 phone numbers found in recipient audience.");
  }

  // 3. Insert Broadcast row
  const { data: broadcast, error: broadcastErr } = await supabase
    .from("broadcasts")
    .insert({
      workspace_id: workspaceId,
      name: name || `Blast - ${templateName}`,
      template_name: templateName,
      template_language: templateLanguage,
      status: "sending",
      total_recipients: validRecipients.length,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      failed_count: 0,
    })
    .select()
    .single();

  if (broadcastErr || !broadcast) {
    throw new Error(`Failed to create broadcast row: ${broadcastErr?.message}`);
  }

  // 4. Insert Recipient rows
  const recipientInserts = validRecipients.map((vr) => ({
    broadcast_id: broadcast.id,
    workspace_id: workspaceId,
    contact_id: vr.contactId || null,
    phone: vr.phone,
    params: vr.params,
    status: "pending",
  }));

  const { data: insertedRecipients, error: recipErr } = await supabase
    .from("broadcast_recipients")
    .insert(recipientInserts)
    .select("id, contact_id, phone, params");

  if (recipErr || !insertedRecipients) {
    throw new Error(`Failed to queue broadcast recipients: ${recipErr?.message}`);
  }

  return {
    broadcastId: broadcast.id,
    templateName,
    templateLanguage,
    phoneNumberId,
    accessToken,
    recipients: insertedRecipients.map((r: any) => ({
      recipientRowId: r.id,
      contactId: r.contact_id || "",
      phone: r.phone,
      params: (r.params as string[]) || [],
    })),
  };
}

/**
 * Delivers broadcast messages asynchronously to all planned recipients with retry logic.
 */
export async function deliverBroadcast(
  supabase: SupabaseClient,
  plan: BroadcastPlan
): Promise<{ sent: number; failed: number }> {
  let sentCount = 0;
  let failedCount = 0;

  for (const item of plan.recipients) {
    const variants = phoneVariants(item.phone);
    let sentMessageId: string | null = null;
    let lastError: string | null = null;

    for (const variant of variants) {
      try {
        const result = await sendTemplateMessage({
          phoneNumberId: plan.phoneNumberId,
          accessToken: plan.accessToken,
          to: variant,
          templateName: plan.templateName,
          language: plan.templateLanguage,
          params: item.params,
        });
        sentMessageId = result.messageId;
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err.message || "Unknown error";
        if (lastError && !isRecipientNotAllowedError(lastError)) {
          // If not sandbox recipient restriction, no need to try alternative trunk prefix
          break;
        }
      }
    }

    if (sentMessageId) {
      sentCount++;
      await supabase
        .from("broadcast_recipients")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          whatsapp_message_id: sentMessageId,
          error_message: null,
        })
        .eq("id", item.recipientRowId);
    } else {
      failedCount++;
      await supabase
        .from("broadcast_recipients")
        .update({
          status: "failed",
          error_message: lastError || "Dispatch failed",
        })
        .eq("id", item.recipientRowId);
    }
  }

  // Finalize broadcast status
  const finalStatus = failedCount === plan.recipients.length && sentCount === 0 ? "failed" : "completed";
  await supabase
    .from("broadcasts")
    .update({
      status: finalStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", plan.broadcastId);

  return { sent: sentCount, failed: failedCount };
}
