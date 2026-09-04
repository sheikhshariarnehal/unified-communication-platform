import { Contact, Tag, ContactList, Segment, SuppressionEntry, ContactStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

export const mockTags: Tag[] = [
  { id: "tag-1", workspace_id: "ws-1", name: "VIP", color: "#6366f1", created_at: "2026-08-01" },
  { id: "tag-2", workspace_id: "ws-1", name: "Customer", color: "#10b981", created_at: "2026-08-02" },
  { id: "tag-3", workspace_id: "ws-1", name: "Lead", color: "#f59e0b", created_at: "2026-08-03" },
  { id: "tag-4", workspace_id: "ws-1", name: "Trial User", color: "#38bdf8", created_at: "2026-08-10" },
  { id: "tag-5", workspace_id: "ws-1", name: "High Value", color: "#ec4899", created_at: "2026-08-15" },
];

export const mockLists: ContactList[] = [
  { id: "list-1", workspace_id: "ws-1", name: "Newsletter Subscribers", description: "Weekly product insights", member_count: 8420, created_at: "2026-08-01" },
  { id: "list-2", workspace_id: "ws-1", name: "Paying Customers", description: "All active paid subscriptions", member_count: 3200, created_at: "2026-08-05" },
  { id: "list-3", workspace_id: "ws-1", name: "Black Friday Waitlist", description: "Early access VIPs", member_count: 1450, created_at: "2026-08-20" },
];

export const mockContacts: Contact[] = [
  {
    id: "cnt-1",
    workspace_id: "ws-1",
    first_name: "Sarah",
    last_name: "Jenkins",
    email: "sarah.j@acmecorp.com",
    phone: "+1 (555) 234-5678",
    company: "Acme Corp",
    country: "United States",
    status: "subscribed",
    source: "API",
    unsubscribe_token: "tok_1",
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
    tags: [mockTags[0], mockTags[1]],
  },
  {
    id: "cnt-2",
    workspace_id: "ws-1",
    first_name: "Tanvir",
    last_name: "Ahmed",
    email: "tanvir.ahmed@dhakafintech.io",
    phone: "+880 1711 000000",
    company: "Dhaka Fintech",
    country: "Bangladesh",
    status: "subscribed",
    source: "CSV Import",
    unsubscribe_token: "tok_2",
    created_at: "2026-09-02T12:30:00Z",
    updated_at: "2026-09-02T12:30:00Z",
    tags: [mockTags[0], mockTags[4]],
  },
  {
    id: "cnt-3",
    workspace_id: "ws-1",
    first_name: "Elena",
    last_name: "Rostova",
    email: "elena.rostova@berlinlabs.de",
    phone: "+49 152 9876543",
    company: "Berlin Labs",
    country: "Germany",
    status: "subscribed",
    source: "Manual",
    unsubscribe_token: "tok_3",
    created_at: "2026-09-03T09:15:00Z",
    updated_at: "2026-09-03T09:15:00Z",
    tags: [mockTags[2]],
  },
  {
    id: "cnt-4",
    workspace_id: "ws-1",
    first_name: "Marcus",
    last_name: "Vance",
    email: "marcus.v@cloudsystems.net",
    phone: "+44 7700 900077",
    company: "Cloud Systems",
    country: "United Kingdom",
    status: "unsubscribed",
    source: "Website Form",
    unsubscribe_token: "tok_4",
    created_at: "2026-08-25T14:20:00Z",
    updated_at: "2026-08-30T11:00:00Z",
    tags: [mockTags[3]],
  },
  {
    id: "cnt-5",
    workspace_id: "ws-1",
    first_name: "Chloe",
    last_name: "Dubois",
    email: "chloe@dubois-design.fr",
    phone: "+33 6 12 34 56 78",
    company: "Dubois Studio",
    country: "France",
    status: "subscribed",
    source: "CSV Import",
    unsubscribe_token: "tok_5",
    created_at: "2026-09-04T08:00:00Z",
    updated_at: "2026-09-04T08:00:00Z",
    tags: [mockTags[1]],
  },
  {
    id: "cnt-6",
    workspace_id: "ws-1",
    first_name: "Kenji",
    last_name: "Sato",
    email: "kenji.sato@tokyotech.jp",
    phone: "+81 90 1234 5678",
    company: "Tokyo Tech",
    country: "Japan",
    status: "bounced",
    source: "CSV Import",
    unsubscribe_token: "tok_6",
    created_at: "2026-08-29T16:45:00Z",
    updated_at: "2026-08-30T09:00:00Z",
    tags: [mockTags[2]],
  },
];

export const mockSegments: Segment[] = [
  {
    id: "seg-1",
    workspace_id: "ws-1",
    name: "VIP Customers in US & EU",
    description: "High value customers located in United States or Germany",
    rules: {
      conditions: [
        { field: "tags", operator: "contains", value: "VIP" },
        { field: "country", operator: "in", value: ["United States", "Germany"] },
      ],
    },
    contact_count: 2480,
    created_at: "2026-08-15",
    updated_at: "2026-08-20",
  },
  {
    id: "seg-2",
    workspace_id: "ws-1",
    name: "Active WhatsApp Leads",
    description: "Contacts with valid phone number who subscribed in last 30 days",
    rules: {
      conditions: [
        { field: "phone", operator: "not_equals", value: "" },
        { field: "status", operator: "equals", value: "subscribed" },
      ],
    },
    contact_count: 6150,
    created_at: "2026-08-22",
    updated_at: "2026-08-28",
  },
];

export const mockSuppression: SuppressionEntry[] = [
  {
    id: "sup-1",
    workspace_id: "ws-1",
    type: "email",
    value: "marcus.v@cloudsystems.net",
    reason: "unsubscribed",
    created_at: "2026-08-30 11:00 AM",
  },
  {
    id: "sup-2",
    workspace_id: "ws-1",
    type: "email",
    value: "kenji.sato@tokyotech.jp",
    reason: "bounced",
    created_at: "2026-08-30 09:00 AM",
  },
  {
    id: "sup-3",
    workspace_id: "ws-1",
    type: "phone",
    value: "+1 (555) 999-8888",
    reason: "opt_out",
    created_at: "2026-09-01 02:15 PM",
  },
];

export async function getContacts(workspaceId = DEFAULT_WORKSPACE_ID): Promise<Contact[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contacts")
      .select("*, contact_tags(tag_id, tags(*))")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockContacts;
    }

    return data.map((c: any) => ({
      id: c.id,
      workspace_id: c.workspace_id,
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      country: c.country,
      status: (c.status as ContactStatus) || "subscribed",
      source: c.source || "Manual",
      unsubscribe_token: c.unsubscribe_token || c.id,
      created_at: c.created_at || new Date().toISOString(),
      updated_at: c.updated_at || new Date().toISOString(),
      metadata: c.metadata || null,
      tags: c.contact_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
    }));
  } catch (err) {
    console.error("Error fetching contacts from Supabase:", err);
    return mockContacts;
  }
}

export async function getTags(workspaceId = DEFAULT_WORKSPACE_ID): Promise<Tag[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return mockTags;
    }

    return data.map((t: any) => ({
      id: t.id,
      workspace_id: t.workspace_id,
      name: t.name,
      color: t.color || "#6366f1",
      created_at: t.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching tags from Supabase:", err);
    return mockTags;
  }
}

export async function getLists(workspaceId = DEFAULT_WORKSPACE_ID): Promise<ContactList[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lists")
      .select("*, list_members(contact_id)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockLists;
    }

    return data.map((l: any) => ({
      id: l.id,
      workspace_id: l.workspace_id,
      name: l.name,
      description: l.description,
      member_count: l.list_members?.length || 0,
      created_at: l.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching lists from Supabase:", err);
    return mockLists;
  }
}

export async function getListContacts(listId: string): Promise<Contact[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("list_members")
      .select("contact:contacts(*)")
      .eq("list_id", listId);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data
      .map((item: any) => item.contact)
      .filter((c: any) => Boolean(c && c.phone));
  } catch (err) {
    console.error("Error fetching contacts for list:", err);
    return [];
  }
}

export async function getSegments(workspaceId = DEFAULT_WORKSPACE_ID): Promise<Segment[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("segments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockSegments;
    }

    return data.map((s: any) => ({
      id: s.id,
      workspace_id: s.workspace_id,
      name: s.name,
      description: s.description,
      rules: (s.rules as any) || { conditions: [] },
      created_at: s.created_at || new Date().toISOString(),
      updated_at: s.updated_at || new Date().toISOString(),
      contact_count: 0,
    }));
  } catch (err) {
    console.error("Error fetching segments from Supabase:", err);
    return mockSegments;
  }
}

export async function getSuppressionList(workspaceId = DEFAULT_WORKSPACE_ID): Promise<SuppressionEntry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("suppression_entries")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockSuppression;
    }

    return data.map((sp: any) => ({
      id: sp.id,
      workspace_id: sp.workspace_id,
      type: sp.type as 'email' | 'phone',
      value: sp.value,
      reason: sp.reason as any,
      created_at: sp.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching suppression from Supabase:", err);
    return mockSuppression;
  }
}

export async function createContact(
  contactData: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    country?: string;
    tag_ids?: string[];
  },
  workspaceId = DEFAULT_WORKSPACE_ID
): Promise<Contact | null> {
  try {
    const supabase = createClient();
    const { data: newContact, error } = await supabase
      .from("contacts")
      .insert({
        workspace_id: workspaceId,
        first_name: contactData.first_name,
        last_name: contactData.last_name || null,
        email: contactData.email || null,
        phone: contactData.phone || null,
        company: contactData.company || null,
        country: contactData.country || null,
        status: "subscribed",
        source: "Manual",
      })
      .select()
      .single();

    if (error || !newContact) {
      console.error("Failed to insert contact:", error);
      return null;
    }

    if (contactData.tag_ids && contactData.tag_ids.length > 0) {
      await supabase.from("contact_tags").insert(
        contactData.tag_ids.map((tagId) => ({
          contact_id: newContact.id,
          tag_id: tagId,
        }))
      );
    }

    return {
      id: newContact.id,
      workspace_id: newContact.workspace_id,
      first_name: newContact.first_name,
      last_name: newContact.last_name,
      email: newContact.email,
      phone: newContact.phone,
      company: newContact.company,
      country: newContact.country,
      status: (newContact.status as ContactStatus) || "subscribed",
      source: newContact.source || "Manual",
      unsubscribe_token: newContact.unsubscribe_token || newContact.id,
      created_at: newContact.created_at || new Date().toISOString(),
      updated_at: newContact.updated_at || new Date().toISOString(),
    };
  } catch (err) {
    console.error("Error creating contact in Supabase:", err);
    return null;
  }
}

export async function deleteContact(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.error("Error deleting contact in Supabase:", err);
    return false;
  }
}

