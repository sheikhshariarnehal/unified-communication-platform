export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          hashed_key: string
          id: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          hashed_key: string
          id?: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          hashed_key?: string
          id?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          created_at: string | null
          description: string | null
          edges: Json
          id: string
          name: string
          nodes: Json
          status: string
          trigger_type: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edges?: Json
          id?: string
          name: string
          nodes?: Json
          status?: string
          trigger_type: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edges?: Json
          id?: string
          name?: string
          nodes?: Json
          status?: string
          trigger_type?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          channel: string
          clicked_at: string | null
          contact_id: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          provider_message_id: string | null
          read_at: string | null
          sent_at: string | null
          status: string
          workspace_id: string
        }
        Insert: {
          campaign_id: string
          channel: string
          clicked_at?: string | null
          contact_id: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          workspace_id: string
        }
        Update: {
          campaign_id?: string
          channel?: string
          clicked_at?: string | null
          contact_id?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_message_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience_id: string | null
          audience_type: string
          channel: string
          completed_at: string | null
          created_at: string | null
          email_config: Json | null
          id: string
          name: string
          scheduled_at: string | null
          started_at: string | null
          stats: Json | null
          status: string
          updated_at: string | null
          whatsapp_config: Json | null
          workspace_id: string
        }
        Insert: {
          audience_id?: string | null
          audience_type: string
          channel: string
          completed_at?: string | null
          created_at?: string | null
          email_config?: Json | null
          id?: string
          name: string
          scheduled_at?: string | null
          started_at?: string | null
          stats?: Json | null
          status?: string
          updated_at?: string | null
          whatsapp_config?: Json | null
          workspace_id: string
        }
        Update: {
          audience_id?: string | null
          audience_type?: string
          channel?: string
          completed_at?: string | null
          created_at?: string | null
          email_config?: Json | null
          id?: string
          name?: string
          scheduled_at?: string | null
          started_at?: string | null
          stats?: Json | null
          status?: string
          updated_at?: string | null
          whatsapp_config?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_custom_field_values: {
        Row: {
          contact_id: string
          field_id: string
          value: string | null
        }
        Insert: {
          contact_id: string
          field_id: string
          value?: string | null
        }
        Update: {
          contact_id?: string
          field_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_custom_field_values_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          source: string | null
          status: string
          unsubscribe_token: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          unsubscribe_token?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          data_type: string
          id: string
          key: string
          name: string
          options: Json | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          data_type: string
          id?: string
          key: string
          name: string
          options?: Json | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          data_type?: string
          id?: string
          key?: string
          name?: string
          options?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string | null
          id: string
          json_content: Json | null
          name: string
          subject: string | null
          thumbnail_url: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          json_content?: Json | null
          name: string
          subject?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          html_content?: string | null
          id?: string
          json_content?: Json | null
          name?: string
          subject?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      list_members: {
        Row: {
          contact_id: string
          list_id: string
        }
        Insert: {
          contact_id: string
          list_id: string
        }
        Update: {
          contact_id?: string
          list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          rules: Json
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          rules?: Json
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          rules?: Json
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sending_domains: {
        Row: {
          created_at: string | null
          dkim_verified: boolean | null
          dmarc_verified: boolean | null
          dns_records: Json | null
          domain: string
          id: string
          spf_verified: boolean | null
          status: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          dkim_verified?: boolean | null
          dmarc_verified?: boolean | null
          dns_records?: Json | null
          domain: string
          id?: string
          spf_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          dkim_verified?: boolean | null
          dmarc_verified?: boolean | null
          dns_records?: Json | null
          domain?: string
          id?: string
          spf_verified?: boolean | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sending_domains_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      suppression_entries: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          type: string
          value: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          type: string
          value: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          type?: string
          value?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppression_entries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          count: number | null
          id: string
          metric: string
          period_end: string
          period_start: string
          workspace_id: string
        }
        Insert: {
          count?: number | null
          id?: string
          metric: string
          period_end: string
          period_start: string
          workspace_id: string
        }
        Update: {
          count?: number | null
          id?: string
          metric?: string
          period_end?: string
          period_start?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: Json
          id: string
          secret: string
          status: string | null
          url: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          events?: Json
          id?: string
          secret: string
          status?: string | null
          url: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          events?: Json
          id?: string
          secret?: string
          status?: string | null
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_accounts: {
        Row: {
          business_account_id: string
          created_at: string | null
          display_name: string | null
          encrypted_access_token: string
          id: string
          phone_number: string
          phone_number_id: string
          status: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          business_account_id: string
          created_at?: string | null
          display_name?: string | null
          encrypted_access_token: string
          id?: string
          phone_number: string
          phone_number_id: string
          status?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          business_account_id?: string
          created_at?: string | null
          display_name?: string | null
          encrypted_access_token?: string
          id?: string
          phone_number?: string
          phone_number_id?: string
          status?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          body_text: string
          buttons: Json | null
          category: string
          created_at: string | null
          footer_text: string | null
          header_content: string | null
          header_type: string | null
          id: string
          language: string
          meta_template_id: string | null
          name: string
          status: string
          updated_at: string | null
          variables: Json | null
          whatsapp_account_id: string | null
          workspace_id: string
        }
        Insert: {
          body_text: string
          buttons?: Json | null
          category: string
          created_at?: string | null
          footer_text?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string
          meta_template_id?: string | null
          name: string
          status?: string
          updated_at?: string | null
          variables?: Json | null
          whatsapp_account_id?: string | null
          workspace_id: string
        }
        Update: {
          body_text?: string
          buttons?: Json | null
          category?: string
          created_at?: string | null
          footer_text?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string
          meta_template_id?: string | null
          name?: string
          status?: string
          updated_at?: string | null
          variables?: Json | null
          whatsapp_account_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_whatsapp_account_id_fkey"
            columns: ["whatsapp_account_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string | null
          id: string
          invited_email: string | null
          role: string
          status: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_email?: string | null
          role: string
          status?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_email?: string | null
          role?: string
          status?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          business_type: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          business_type?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          business_type?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: { Args: { ws_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
