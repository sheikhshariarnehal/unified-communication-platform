-- Migration 0001: Initial Multi-Tenant Schema for Unified Email & WhatsApp Platform
-- Enables UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  business_type TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'marketing_manager', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended')),
  invited_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- 3. Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained', 'suppressed')),
  source TEXT DEFAULT 'manual',
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contacts_workspace ON contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(workspace_id, email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(workspace_id, phone);

-- 4. Tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, name)
);

-- 5. Contact Tags (Junction)
CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);

-- 6. Lists
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. List Members (Junction)
CREATE TABLE IF NOT EXISTS list_members (
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (list_id, contact_id)
);

-- 8. Custom Field Definitions
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('text', 'number', 'date', 'boolean', 'dropdown')),
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, key)
);

-- 9. Contact Custom Field Values
CREATE TABLE IF NOT EXISTS contact_custom_field_values (
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  value TEXT,
  PRIMARY KEY (contact_id, field_id)
);

-- 10. Segments (Dynamic rule-based audience)
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '{"conditions": []}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Suppression Entries
CREATE TABLE IF NOT EXISTS suppression_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone')),
  value TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribed', 'bounced', 'complaint', 'opt_out', 'manual_block', 'admin_suppression')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, type, value)
);

-- 12. Sending Domains
CREATE TABLE IF NOT EXISTS sending_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  spf_verified BOOLEAN DEFAULT false,
  dkim_verified BOOLEAN DEFAULT false,
  dmarc_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  dns_records JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, domain)
);

-- 13. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  html_content TEXT,
  json_content JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. WhatsApp Accounts
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  business_account_id TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  display_name TEXT,
  encrypted_access_token TEXT NOT NULL,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'rate_limited', 'restricted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. WhatsApp Templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  whatsapp_account_id UUID REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
  meta_template_id TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  language TEXT NOT NULL DEFAULT 'en_US',
  status TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')),
  header_type TEXT,
  header_content TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Campaigns (Unified Email & WhatsApp)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'unified')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'queued', 'sending', 'completed', 'paused', 'cancelled', 'failed')),
  audience_type TEXT NOT NULL CHECK (audience_type IN ('all', 'list', 'segment')),
  audience_id UUID,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  email_config JSONB,
  whatsapp_config JSONB,
  stats JSONB DEFAULT '{"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "read": 0, "failed": 0, "bounced": 0, "complained": 0, "replied": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Campaign Recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'read', 'failed', 'bounced', 'suppressed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (campaign_id, contact_id, channel)
);

-- 18. Automations
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 19. API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  hashed_key TEXT NOT NULL,
  permissions JSONB DEFAULT '["*"]'::jsonb,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 20. Outgoing Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 21. Subscriptions & Billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'business', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 22. Usage Records
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  metric TEXT NOT NULL CHECK (metric IN ('contacts', 'emails_sent', 'whatsapp_sent', 'api_calls')),
  count BIGINT DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  UNIQUE (workspace_id, metric, period_start)
);

-- 23. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 24. Row Level Security Policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppression_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sending_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is a member of the workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If running in anon dev / demo mode or public demo access
  IF auth.uid() IS NULL THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
    AND user_id = auth.uid()
    AND status = 'active'
  );
END;
$$;

-- Workspaces policy
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.workspaces;
DROP POLICY IF EXISTS "Users can access workspaces they belong to" ON public.workspaces;
CREATE POLICY "Users can access workspaces they belong to"
  ON public.workspaces FOR ALL
  TO public
  USING (auth.uid() IS NULL OR EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = public.workspaces.id
    AND workspace_members.user_id = auth.uid()
  ))
  WITH CHECK (auth.uid() IS NULL OR EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.workspace_id = public.workspaces.id
    AND workspace_members.user_id = auth.uid()
  ));

-- Workspace isolation policies for all tables
CREATE POLICY "Workspace members policy" ON public.workspace_members FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access contacts" ON public.contacts FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access tags" ON public.tags FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access contact_tags" ON public.contact_tags FOR ALL TO public USING (EXISTS (SELECT 1 FROM public.contacts WHERE id = contact_tags.contact_id AND is_workspace_member(workspace_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.contacts WHERE id = contact_tags.contact_id AND is_workspace_member(workspace_id)));
CREATE POLICY "Workspace members can access lists" ON public.lists FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access list_members" ON public.list_members FOR ALL TO public USING (EXISTS (SELECT 1 FROM public.contacts WHERE id = list_members.contact_id AND is_workspace_member(workspace_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.contacts WHERE id = list_members.contact_id AND is_workspace_member(workspace_id)));
CREATE POLICY "Workspace members can access custom_field_definitions" ON public.custom_field_definitions FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access contact_custom_field_values" ON public.contact_custom_field_values FOR ALL TO public USING (EXISTS (SELECT 1 FROM public.contacts WHERE id = contact_custom_field_values.contact_id AND is_workspace_member(workspace_id))) WITH CHECK (EXISTS (SELECT 1 FROM public.contacts WHERE id = contact_custom_field_values.contact_id AND is_workspace_member(workspace_id)));
CREATE POLICY "Workspace members can access segments" ON public.segments FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access suppression_entries" ON public.suppression_entries FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access sending_domains" ON public.sending_domains FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access email templates" ON public.email_templates FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access whatsapp_accounts" ON public.whatsapp_accounts FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access whatsapp templates" ON public.whatsapp_templates FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access campaigns" ON public.campaigns FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access campaign recipients" ON public.campaign_recipients FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access automations" ON public.automations FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access api_keys" ON public.api_keys FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access webhooks" ON public.webhooks FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access subscriptions" ON public.subscriptions FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access usage_records" ON public.usage_records FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "Workspace members can access audit_logs" ON public.audit_logs FOR ALL TO public USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
