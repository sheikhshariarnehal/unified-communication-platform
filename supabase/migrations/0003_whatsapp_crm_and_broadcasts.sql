-- Migration 0003: WhatsApp CRM, Conversations, Messages, Config & Broadcasts
-- Compatible with Unified Platform multi-tenancy (workspace_id)

-- 1. WhatsApp Configuration Table (Direct Account Setting)
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  phone_number_id TEXT NOT NULL,
  waba_id TEXT,
  access_token TEXT NOT NULL,
  verify_token TEXT DEFAULT 'unified_webhook_token',
  app_secret TEXT,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'rate_limited', 'restricted')),
  connected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_config_workspace ON whatsapp_config(workspace_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_phone_id ON whatsapp_config(phone_number_id);

-- 2. Conversations Table (Live CRM Inbox Threads)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
  assigned_agent_id UUID,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_workspace ON conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(workspace_id, last_message_at DESC);

-- 3. Messages Table (Inbound & Outbound WhatsApp Messages)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'bot')),
  sender_id UUID,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'document', 'audio', 'video', 'template', 'interactive')),
  content_text TEXT,
  media_url TEXT,
  media_type TEXT,
  template_name TEXT,
  message_id TEXT, -- Meta Graph API wamid
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_meta_id ON messages(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_workspace ON messages(workspace_id);

-- 4. Broadcasts Table (WhatsApp Bulk Campaigns)
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_language TEXT NOT NULL DEFAULT 'en_US',
  template_variables JSONB DEFAULT '[]'::jsonb,
  audience_filter JSONB DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'completed', 'failed')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_broadcasts_workspace ON broadcasts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(workspace_id, status);

-- 5. Broadcast Recipients Table (Per-Recipient Delivery Tracking)
CREATE TABLE IF NOT EXISTS broadcast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  phone TEXT,
  params JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'replied', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  error_message TEXT,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_broadcast ON broadcast_recipients(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_wamid ON broadcast_recipients(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_contact ON broadcast_recipients(contact_id);

-- 6. Trigger to automatically keep aggregate counts updated on broadcasts
CREATE OR REPLACE FUNCTION update_broadcast_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE broadcasts
    SET
      sent_count = (SELECT count(*) FROM broadcast_recipients WHERE broadcast_id = NEW.broadcast_id AND status IN ('sent', 'delivered', 'read', 'replied')),
      delivered_count = (SELECT count(*) FROM broadcast_recipients WHERE broadcast_id = NEW.broadcast_id AND status IN ('delivered', 'read', 'replied')),
      read_count = (SELECT count(*) FROM broadcast_recipients WHERE broadcast_id = NEW.broadcast_id AND status IN ('read', 'replied')),
      replied_count = (SELECT count(*) FROM broadcast_recipients WHERE broadcast_id = NEW.broadcast_id AND status = 'replied'),
      failed_count = (SELECT count(*) FROM broadcast_recipients WHERE broadcast_id = NEW.broadcast_id AND status = 'failed'),
      updated_at = now()
    WHERE id = NEW.broadcast_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_broadcast_counts ON broadcast_recipients;
CREATE TRIGGER trg_update_broadcast_counts
AFTER INSERT OR UPDATE OF status ON broadcast_recipients
FOR EACH ROW EXECUTE FUNCTION update_broadcast_counts();

-- 7. Trigger to update last_message_text and timestamp on conversation when a message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_text = COALESCE(NEW.content_text, CASE WHEN NEW.content_type = 'template' THEN 'Template: ' || COALESCE(NEW.template_name, '') ELSE '[' || NEW.content_type || ']' END),
    last_message_at = NEW.created_at,
    unread_count = CASE WHEN NEW.sender_type = 'customer' THEN unread_count + 1 ELSE unread_count END,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON messages;
CREATE TRIGGER trg_update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- 8. Enable Supabase Realtime replication for instant live chat in the shared inbox
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;
END $$;
