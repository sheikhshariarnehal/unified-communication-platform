import { WhatsAppAccount, WhatsAppTemplate, Campaign } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

export interface WhatsAppConversation {
  id: string;
  workspace_id: string;
  contact_id: string;
  status: "open" | "pending" | "closed";
  assigned_agent_id?: string;
  last_message_text?: string;
  last_message_at: string;
  unread_count: number;
  contact?: {
    id: string;
    first_name?: string;
    last_name?: string;
    phone: string;
    email?: string;
    company?: string;
    tags?: string[];
  };
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "agent" | "bot";
  content_type: "text" | "image" | "document" | "audio" | "video" | "template";
  content_text?: string;
  media_url?: string;
  template_name?: string;
  message_id?: string;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  error_message?: string;
  created_at: string;
}

export const mockWhatsAppAccounts: WhatsAppAccount[] = [
  {
    id: "wa-acc-1",
    workspace_id: "ws-1",
    business_account_id: "2809986683297346",
    phone_number_id: "1217109014828949",
    phone_number: "+1 (555) 019-2830",
    display_name: "Meta Cloud API Verified Account",
    status: "connected",
    created_at: "2026-08-01",
  },
];

export const mockWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: "wa-tpl-0",
    workspace_id: "ws-1",
    whatsapp_account_id: "wa-acc-1",
    meta_template_id: "meta_hello_world",
    name: "hello_world",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
    header_type: "TEXT",
    header_content: null,
    body_text: "Welcome and congratulations! This message confirms that your WhatsApp Business Cloud API integration is live.",
    footer_text: null,
    buttons: [],
    variables: [],
    created_at: "2026-08-01",
  },
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

export const mockConversations: WhatsAppConversation[] = [
  {
    id: "conv-1",
    workspace_id: DEFAULT_WORKSPACE_ID,
    contact_id: "c-1",
    status: "open",
    last_message_text: "Thanks for the update! Could you send me the invoice?",
    last_message_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unread_count: 1,
    contact: {
      id: "c-1",
      first_name: "Sarah",
      last_name: "Connor",
      phone: "+1 (555) 234-5678",
      email: "sarah.connor@sky-tech.io",
      company: "Cyberdyne Systems",
      tags: ["VIP", "Enterprise", "Outreach"],
    },
  },
  {
    id: "conv-2",
    workspace_id: DEFAULT_WORKSPACE_ID,
    contact_id: "c-2",
    status: "open",
    last_message_text: "Does the template support dynamic variables in the footer?",
    last_message_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    unread_count: 0,
    contact: {
      id: "c-2",
      first_name: "Alex",
      last_name: "Murphy",
      phone: "+1 (555) 876-5432",
      email: "alex.murphy@omnicorp.org",
      company: "Omni Consumer Products",
      tags: ["Lead", "High Priority"],
    },
  },
  {
    id: "conv-3",
    workspace_id: DEFAULT_WORKSPACE_ID,
    contact_id: "c-3",
    status: "closed",
    last_message_text: "Everything is set up and working, thank you!",
    last_message_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unread_count: 0,
    contact: {
      id: "c-3",
      first_name: "Marcus",
      last_name: "Wright",
      phone: "+880 1711-000111",
      email: "marcus@resistance.net",
      company: "Resistance HQ",
      tags: ["Wholesale"],
    },
  },
];

export const mockMessages: Record<string, WhatsAppMessage[]> = {
  "conv-1": [
    {
      id: "m-1",
      conversation_id: "conv-1",
      sender_type: "agent",
      content_type: "template",
      template_name: "order_shipping_update_v2",
      content_text: "Hello Sarah,\n\nYour order #ORD-9821 has been shipped via express courier.",
      status: "read",
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "m-2",
      conversation_id: "conv-1",
      sender_type: "customer",
      content_type: "text",
      content_text: "Thanks for the update! Could you send me the invoice?",
      status: "delivered",
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ],
  "conv-2": [
    {
      id: "m-3",
      conversation_id: "conv-2",
      sender_type: "customer",
      content_type: "text",
      content_text: "Does the template support dynamic variables in the footer?",
      status: "delivered",
      created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    },
  ],
};

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

export async function getWhatsAppConversations(
  workspaceId = DEFAULT_WORKSPACE_ID,
  statusFilter?: "open" | "closed" | "all"
): Promise<WhatsAppConversation[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from("conversations")
      .select(`
        id,
        workspace_id,
        contact_id,
        status,
        assigned_agent_id,
        last_message_text,
        last_message_at,
        unread_count,
        contact:contacts(id, first_name, last_name, phone, email, company)
      `)
      .eq("workspace_id", workspaceId)
      .order("last_message_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (statusFilter && statusFilter !== "all") {
        return mockConversations.filter((c) => c.status === statusFilter);
      }
      return mockConversations;
    }

    return data.map((row: any) => ({
      id: row.id,
      workspace_id: row.workspace_id,
      contact_id: row.contact_id,
      status: row.status,
      assigned_agent_id: row.assigned_agent_id,
      last_message_text: row.last_message_text,
      last_message_at: row.last_message_at,
      unread_count: row.unread_count || 0,
      contact: row.contact
        ? {
            id: row.contact.id,
            first_name: row.contact.first_name,
            last_name: row.contact.last_name,
            phone: row.contact.phone,
            email: row.contact.email,
            company: row.contact.company,
          }
        : undefined,
    }));
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return mockConversations;
  }
}

export async function getConversationMessages(
  conversationId: string
): Promise<WhatsAppMessage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return mockMessages[conversationId] || [];
    }

    return data.map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_type: m.sender_type,
      content_type: m.content_type || "text",
      content_text: m.content_text,
      media_url: m.media_url,
      template_name: m.template_name,
      message_id: m.message_id,
      status: m.status || "sent",
      error_message: m.error_message,
      created_at: m.created_at,
    }));
  } catch (err) {
    console.error("Error fetching messages:", err);
    return mockMessages[conversationId] || [];
  }
}

export const mockWhatsAppCampaigns: Campaign[] = [
  {
    id: "wa-camp-1",
    workspace_id: DEFAULT_WORKSPACE_ID,
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

