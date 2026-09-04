export type UserRole = 'owner' | 'admin' | 'marketing_manager' | 'staff';
export type MemberStatus = 'invited' | 'active' | 'suspended';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  business_type: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  status: MemberStatus;
  invited_email: string | null;
  created_at: string;
}

export type ContactStatus = 'subscribed' | 'unsubscribed' | 'bounced' | 'complained' | 'suppressed';

export interface Contact {
  id: string;
  workspace_id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  country: string | null;
  status: ContactStatus;
  source: string;
  unsubscribe_token: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any> | null;
  tags?: Tag[];
  lists?: ContactList[];
}

export interface Tag {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ContactList {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
}

export interface CustomFieldDefinition {
  id: string;
  workspace_id: string;
  key: string;
  name: string;
  data_type: 'text' | 'number' | 'date' | 'boolean' | 'dropdown';
  options?: string[];
  created_at: string;
}

export interface Segment {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  rules: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
      value: string | number | boolean | string[];
    }>;
  };
  created_at: string;
  updated_at: string;
  contact_count?: number;
}

export interface SuppressionEntry {
  id: string;
  workspace_id: string;
  type: 'email' | 'phone';
  value: string;
  reason: 'unsubscribed' | 'bounced' | 'complaint' | 'opt_out' | 'manual_block' | 'admin_suppression';
  created_at: string;
}

export interface SendingDomain {
  id: string;
  workspace_id: string;
  domain: string;
  spf_verified: boolean;
  dkim_verified: boolean;
  dmarc_verified: boolean;
  status: 'pending' | 'verified' | 'failed';
  dns_records: Array<{
    type: 'TXT' | 'CNAME' | 'MX';
    name: string;
    value: string;
    status: 'verified' | 'pending';
  }>;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  workspace_id: string;
  name: string;
  subject: string | null;
  html_content: string | null;
  json_content?: Record<string, unknown>;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppAccount {
  id: string;
  workspace_id: string;
  business_account_id: string;
  phone_number_id: string;
  phone_number: string;
  display_name: string | null;
  status: 'connected' | 'disconnected' | 'rate_limited' | 'restricted';
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  workspace_id: string;
  whatsapp_account_id: string;
  meta_template_id: string | null;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  header_type?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null;
  header_content?: string | null;
  body_text: string;
  footer_text?: string | null;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
  variables: string[];
  created_at: string;
}

export type CampaignChannel = 'email' | 'whatsapp' | 'unified';
export type CampaignStatus = 'draft' | 'scheduled' | 'queued' | 'sending' | 'completed' | 'paused' | 'cancelled' | 'failed';

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  read: number;
  failed: number;
  bounced: number;
  complained: number;
  replied: number;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience_type: 'all' | 'list' | 'segment';
  audience_id: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  email_config?: {
    subject: string;
    sender_name: string;
    sender_email: string;
    template_id?: string;
    html_content?: string;
  };
  whatsapp_config?: {
    account_id: string;
    template_id: string;
    variable_mappings: Record<string, string>;
  };
  stats: CampaignStats;
  created_at: string;
  updated_at: string;
}
