import { WhatsAppAccount, WhatsAppTemplate, Campaign } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

export const mockWhatsAppAccounts: WhatsAppAccount[] = [
  {
    id: "wa-acc-1",
    workspace_id: "ws-1",
    business_account_id: "waba_9823471029",
    phone_number_id: "phone_1092837461",
    phone_number: "+1 (555) 019-2830",
    display_name: "Acme Global Official Support",
    status: "connected",
    created_at: "2026-08-01",
  },
];

export const mockWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: "wa-tpl-1",
    workspace_id: "ws-1",
    whatsapp_account_id: "wa-acc-1",
    meta_template_id: "meta_tpl_001",
    name: "order_shipping_update_v2",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
    header_type: "TEXT",
    header_content: "Order Dispatched 📦",
    body_text: "Hello {{1}},\n\nYour order {{2}} has been shipped via express courier. You can track your package in real time using the link below:\n{{3}}\n\nThank you for choosing Acme Global!",
    footer_text: "Reply STOP to unsubscribe",
    buttons: [
      { type: "URL", text: "Track Package", url: "https://track.acmeglobal.com" },
      { type: "QUICK_REPLY", text: "Contact Support" },
    ],
    variables: ["{{1}}", "{{2}}", "{{3}}"],
    created_at: "2026-08-10",
  },
  {
    id: "wa-tpl-2",
    workspace_id: "ws-1",
    whatsapp_account_id: "wa-acc-1",
    meta_template_id: "meta_tpl_002",
    name: "flash_sale_vip_exclusive",
    category: "MARKETING",
    language: "en_US",
    status: "APPROVED",
    header_type: "IMAGE",
    header_content: null,
    body_text: "Hi {{1}},\n\nExclusive VIP Flash Sale! Get 35% off all communication plans for the next 48 hours only with promo code {{2}}.\n\nClaim before expiry!",
    footer_text: "Opt-out reply STOP",
    buttons: [
      { type: "URL", text: "Claim Discount", url: "https://acmeglobal.com/vip" },
    ],
    variables: ["{{1}}", "{{2}}"],
    created_at: "2026-08-22",
  },
];

export const mockWhatsAppCampaigns: Campaign[] = [
  {
    id: "wa-camp-1",
    workspace_id: "ws-1",
    name: "VIP Early Bird Order Notification",
    channel: "whatsapp",
    status: "completed",
    audience_type: "segment",
    audience_id: "seg-2",
    scheduled_at: null,
    started_at: "2026-09-03T14:00:00Z",
    completed_at: "2026-09-03T14:12:00Z",
    whatsapp_config: {
      account_id: "wa-acc-1",
      template_id: "wa-tpl-1",
      variable_mappings: {
        "{{1}}": "first_name",
        "{{2}}": "order_id",
        "{{3}}": "tracking_link",
      },
    },
    stats: {
      sent: 6400,
      delivered: 6340,
      opened: 0,
      clicked: 1180,
      read: 5720,
      failed: 60,
      bounced: 0,
      complained: 0,
      replied: 840,
    },
    created_at: "2026-09-03",
    updated_at: "2026-09-03",
  },
];

export async function getWhatsAppAccounts(workspaceId = DEFAULT_WORKSPACE_ID): Promise<WhatsAppAccount[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("whatsapp_accounts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockWhatsAppAccounts;
    }

    return data.map((a: any) => ({
      id: a.id,
      workspace_id: a.workspace_id,
      business_account_id: a.business_account_id,
      phone_number_id: a.phone_number_id,
      phone_number: a.phone_number,
      display_name: a.display_name,
      status: (a.status as any) || "connected",
      created_at: a.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching WhatsApp accounts from Supabase:", err);
    return mockWhatsAppAccounts;
  }
}

export async function getWhatsAppTemplates(workspaceId = DEFAULT_WORKSPACE_ID): Promise<WhatsAppTemplate[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockWhatsAppTemplates;
    }

    return data.map((t: any) => ({
      id: t.id,
      workspace_id: t.workspace_id,
      whatsapp_account_id: t.whatsapp_account_id,
      meta_template_id: t.meta_template_id,
      name: t.name,
      category: t.category,
      language: t.language,
      status: t.status,
      header_type: t.header_type as any,
      header_content: t.header_content,
      body_text: t.body_text,
      footer_text: t.footer_text,
      buttons: (t.buttons as any) || [],
      variables: (t.variables as any) || [],
      created_at: t.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching WhatsApp templates from Supabase:", err);
    return mockWhatsAppTemplates;
  }
}

export async function getWhatsAppCampaigns(workspaceId = DEFAULT_WORKSPACE_ID): Promise<Campaign[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("channel", "whatsapp")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockWhatsAppCampaigns;
    }

    return data.map((c: any) => ({
      id: c.id,
      workspace_id: c.workspace_id,
      name: c.name,
      channel: "whatsapp",
      status: (c.status as any) || "draft",
      audience_type: (c.audience_type as any) || "segment",
      audience_id: c.audience_id || "",
      scheduled_at: c.scheduled_at,
      started_at: c.started_at,
      completed_at: c.completed_at,
      whatsapp_config: c.whatsapp_config as any,
      stats: (c.stats as any) || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        read: 0,
        failed: 0,
        bounced: 0,
        complained: 0,
        replied: 0,
      },
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching WhatsApp campaigns from Supabase:", err);
    return mockWhatsAppCampaigns;
  }
}
