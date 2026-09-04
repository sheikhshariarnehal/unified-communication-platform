import { SendingDomain, EmailTemplate, Campaign } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

export const mockSendingDomains: SendingDomain[] = [
  {
    id: "dom-1",
    workspace_id: "ws-1",
    domain: "mail.acmeglobal.com",
    spf_verified: true,
    dkim_verified: true,
    dmarc_verified: true,
    status: "verified",
    dns_records: [
      { type: "TXT", name: "mail.acmeglobal.com", value: "v=spf1 include:spf.unifiedplatform.io ~all", status: "verified" },
      { type: "CNAME", name: "up1._domainkey.mail.acmeglobal.com", value: "dkim.unifiedplatform.io", status: "verified" },
      { type: "TXT", name: "_dmarc.mail.acmeglobal.com", value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@acmeglobal.com", status: "verified" },
    ],
    created_at: "2026-08-10",
  },
  {
    id: "dom-2",
    workspace_id: "ws-1",
    domain: "updates.customerhub.io",
    spf_verified: true,
    dkim_verified: false,
    dmarc_verified: false,
    status: "pending",
    dns_records: [
      { type: "TXT", name: "updates.customerhub.io", value: "v=spf1 include:spf.unifiedplatform.io ~all", status: "verified" },
      { type: "CNAME", name: "up1._domainkey.updates.customerhub.io", value: "dkim.unifiedplatform.io", status: "pending" },
      { type: "TXT", name: "_dmarc.updates.customerhub.io", value: "v=DMARC1; p=none;", status: "pending" },
    ],
    created_at: "2026-09-02",
  },
];

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "tpl-1",
    workspace_id: "ws-1",
    name: "SaaS Product Announcement",
    subject: "Introducing Unified Platform 2.0 - What's new",
    html_content: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 32px 16px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
    <h1 style="color: #6366f1; font-size: 24px; margin-top: 0;">Exciting Updates, {{first_name | default:"Valued Customer"}}!</h1>
    <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">We have just released major enhancements to your communication dashboard. You can now synchronize WhatsApp and Email campaigns effortlessly.</p>
    <div style="margin: 28px 0; text-align: center;">
      <a href="https://acmeglobal.com" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Explore What's New</a>
    </div>
    <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
    <p style="font-size: 12px; color: #64748b; text-align: center;">You received this email because you are registered with Acme Global Corp.<br><a href="{{unsubscribe_url}}" style="color: #94a3b8;">Unsubscribe</a></p>
  </div>
</body>
</html>`,
    thumbnail_url: null,
    created_at: "2026-08-15",
    updated_at: "2026-08-20",
  },
  {
    id: "tpl-2",
    workspace_id: "ws-1",
    name: "Spring Flash Sale Promo",
    subject: "Limited Time: 40% Off All Annual Plans",
    html_content: `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #090d16; color: #f1f5f9; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0f172a; padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
    <span style="background: rgba(99,102,241,0.2); color: #818cf8; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">SPECIAL OFFER</span>
    <h2 style="font-size: 26px; margin: 12px 0; color: #ffffff;">Exclusive discount for {{first_name | default:"Customer"}}</h2>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Upgrade your workspace today and unlock unlimited high-throughput email and WhatsApp messaging.</p>
    <a href="https://acmeglobal.com/upgrade" style="display: block; background: #10b981; color: #022c22; text-align: center; font-weight: bold; padding: 14px; border-radius: 10px; text-decoration: none; margin-top: 20px;">Claim 40% Discount</a>
  </div>
</body>
</html>`,
    thumbnail_url: null,
    created_at: "2026-08-25",
    updated_at: "2026-08-28",
  },
];

export const mockEmailCampaigns: Campaign[] = [
  {
    id: "camp-1",
    workspace_id: "ws-1",
    name: "Spring Flash Sale 2026",
    channel: "email",
    status: "completed",
    audience_type: "list",
    audience_id: "list-1",
    scheduled_at: null,
    started_at: "2026-09-04T10:00:00Z",
    completed_at: "2026-09-04T10:25:00Z",
    email_config: {
      subject: "Spring Flash Sale - 40% Off",
      sender_name: "Acme Global Promotions",
      sender_email: "promotions@mail.acmeglobal.com",
    },
    stats: {
      sent: 25000,
      delivered: 24550,
      opened: 11125,
      clicked: 2300,
      read: 0,
      failed: 450,
      bounced: 450,
      complained: 12,
      replied: 84,
    },
    created_at: "2026-09-03",
    updated_at: "2026-09-04",
  },
  {
    id: "camp-2",
    workspace_id: "ws-1",
    name: "Monthly Developer Newsletter #42",
    channel: "email",
    status: "draft",
    audience_type: "segment",
    audience_id: "seg-1",
    scheduled_at: null,
    started_at: null,
    completed_at: null,
    email_config: {
      subject: "Developer Digest: Optimizing high-scale queues",
      sender_name: "Unified Engineering",
      sender_email: "dev@mail.acmeglobal.com",
    },
    stats: {
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
    created_at: "2026-09-04",
    updated_at: "2026-09-04",
  },
];

export async function getEmailTemplates(workspaceId = DEFAULT_WORKSPACE_ID): Promise<EmailTemplate[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockEmailTemplates;
    }

    return data.map((t: any) => ({
      id: t.id,
      workspace_id: t.workspace_id,
      name: t.name,
      subject: t.subject,
      html_content: t.html_content || "",
      thumbnail_url: t.thumbnail_url,
      created_at: t.created_at || new Date().toISOString(),
      updated_at: t.updated_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching email templates from Supabase:", err);
    return mockEmailTemplates;
  }
}

export async function getSendingDomains(workspaceId = DEFAULT_WORKSPACE_ID): Promise<SendingDomain[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sending_domains")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockSendingDomains;
    }

    return data.map((d: any) => ({
      id: d.id,
      workspace_id: d.workspace_id,
      domain: d.domain,
      spf_verified: !!d.spf_verified,
      dkim_verified: !!d.dkim_verified,
      dmarc_verified: !!d.dmarc_verified,
      status: (d.status as any) || "pending",
      dns_records: (d.dns_records as any) || [],
      created_at: d.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching sending domains from Supabase:", err);
    return mockSendingDomains;
  }
}

export async function getEmailCampaigns(workspaceId = DEFAULT_WORKSPACE_ID): Promise<Campaign[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("channel", "email")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockEmailCampaigns;
    }

    return data.map((c: any) => ({
      id: c.id,
      workspace_id: c.workspace_id,
      name: c.name,
      channel: "email",
      status: (c.status as any) || "draft",
      audience_type: (c.audience_type as any) || "list",
      audience_id: c.audience_id || "",
      scheduled_at: c.scheduled_at,
      started_at: c.started_at,
      completed_at: c.completed_at,
      email_config: c.email_config as any,
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
    console.error("Error fetching email campaigns from Supabase:", err);
    return mockEmailCampaigns;
  }
}

