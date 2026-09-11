/**
 * Meta WhatsApp Cloud API Client (v21.0)
 * Adapted from wacrm-main for robust, direct Meta Graph API communication.
 */

const META_API_VERSION = "v21.0";
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaSendResult {
  messageId: string;
}

export interface MetaPhoneInfo {
  id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
  code_verification_status?: string;
}

interface MetaErrorResponse {
  error?: { message?: string; code?: number; type?: string; error_data?: any };
}

async function throwMetaError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const data = (await response.json()) as MetaErrorResponse;
    if (data.error?.message) {
      message = data.error.message;
      if (data.error.code) {
        message = `[Meta Error ${data.error.code}] ${message}`;
      }
    }
  } catch {
    // keep fallback
  }
  throw new Error(message);
}

// -------------------------------------------------------------
// Phone Number & Account Verification
// -------------------------------------------------------------

export interface VerifyPhoneNumberArgs {
  phoneNumberId: string;
  accessToken: string;
}

export async function verifyPhoneNumber(args: VerifyPhoneNumberArgs): Promise<MetaPhoneInfo> {
  const { phoneNumberId, accessToken } = args;
  const url = `${META_API_BASE}/${encodeURIComponent(
    phoneNumberId
  )}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    await throwMetaError(response, `Failed to verify phone number ID: ${response.status}`);
  }

  return response.json();
}

// -------------------------------------------------------------
// Cloud API Registration & Webhook Subscription
// -------------------------------------------------------------

export interface RegisterPhoneNumberArgs {
  phoneNumberId: string;
  accessToken: string;
  pin: string;
}

export async function registerPhoneNumber(args: RegisterPhoneNumberArgs): Promise<{ success: boolean }> {
  const { phoneNumberId, accessToken, pin } = args;
  const url = `${META_API_BASE}/${encodeURIComponent(phoneNumberId)}/register`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      pin,
    }),
  });

  if (!response.ok) {
    await throwMetaError(response, "Failed to register phone number with Meta Cloud API");
  }

  return response.json();
}

export interface SubscribeWabaArgs {
  wabaId: string;
  accessToken: string;
}

export async function subscribeWabaToApp(args: SubscribeWabaArgs): Promise<{ success: boolean }> {
  const { wabaId, accessToken } = args;
  const url = `${META_API_BASE}/${encodeURIComponent(wabaId)}/subscribed_apps`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await throwMetaError(response, "Failed to subscribe WABA to application webhooks");
  }

  return response.json();
}

// -------------------------------------------------------------
// Outbound Messages: Text & Templates
// -------------------------------------------------------------

export interface SendTextMessageArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  text: string;
  previewUrl?: boolean;
}

export async function sendTextMessage(args: SendTextMessageArgs): Promise<MetaSendResult> {
  const { phoneNumberId, accessToken, to, text, previewUrl = false } = args;
  const url = `${META_API_BASE}/${encodeURIComponent(phoneNumberId)}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      body: text,
      preview_url: previewUrl,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwMetaError(response, `Failed to send text message to ${to}`);
  }

  const data = await response.json();
  const messageId = data?.messages?.[0]?.id;
  if (!messageId) {
    throw new Error("Meta responded with 200 but returned no message ID");
  }

  return { messageId };
}

export interface SendTemplateMessageArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  templateName: string;
  language?: string;
  params?: string[];
  headerMediaUrl?: string;
}

export async function sendTemplateMessage(args: SendTemplateMessageArgs): Promise<MetaSendResult> {
  const {
    phoneNumberId,
    accessToken,
    to,
    templateName,
    language = "en_US",
    params = [],
    headerMediaUrl,
  } = args;

  const url = `${META_API_BASE}/${encodeURIComponent(phoneNumberId)}/messages`;

  const components: any[] = [];

  // Header parameter (if media)
  if (headerMediaUrl) {
    components.push({
      type: "header",
      parameters: [
        {
          type: "image",
          image: { link: headerMediaUrl },
        },
      ],
    });
  }

  // Body parameters {{1}}, {{2}}...
  if (params && params.length > 0) {
    components.push({
      type: "body",
      parameters: params.map((val) => ({
        type: "text",
        text: String(val ?? ""),
      })),
    });
  }

  const payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
    },
  };

  if (components.length > 0) {
    payload.template.components = components;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwMetaError(response, `Failed to dispatch template message '${templateName}' to ${to}`);
  }

  const data = await response.json();
  const messageId = data?.messages?.[0]?.id;
  if (!messageId) {
    throw new Error("Meta accepted template send but returned no message ID");
  }

  return { messageId };
}

// -------------------------------------------------------------
// Message Templates Sync & Management
// -------------------------------------------------------------

export interface FetchTemplatesArgs {
  wabaId: string;
  accessToken: string;
  limit?: number;
}

export async function fetchTemplatesFromMeta(args: FetchTemplatesArgs): Promise<any[]> {
  const { wabaId, accessToken, limit = 100 } = args;
  const url = `${META_API_BASE}/${encodeURIComponent(
    wabaId
  )}/message_templates?fields=id,name,status,category,language,components&limit=${limit}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    await throwMetaError(response, "Failed to fetch message templates from Meta WABA");
  }

  const data = await response.json();
  return data?.data || [];
}
