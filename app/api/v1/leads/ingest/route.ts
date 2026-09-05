import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

// CORS headers to permit credentialed requests directly from Chrome extensions
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, x-workspace-id",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

// Workspace resolver supporting Session Auth, API Keys, and explicit Workspace IDs
async function resolveWorkspace(
  request: NextRequest,
  supabase: any,
  rawBody?: any
): Promise<string> {
  // 1. Check explicit header x-workspace-id
  const headerWs = request.headers.get("x-workspace-id");
  if (headerWs && headerWs.trim()) {
    const candidate = headerWs.trim().replace(/^ws_/i, "");
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", candidate)
      .maybeSingle();
    if (ws?.id) return ws.id;
  }

  // 2. Check explicit workspace_id in payload
  const bodyWs =
    rawBody?.workspace_id ||
    rawBody?.workspaceId ||
    (Array.isArray(rawBody) && rawBody[0]?.workspace_id);
  if (bodyWs && typeof bodyWs === "string" && bodyWs.trim()) {
    const candidate = bodyWs.trim().replace(/^ws_/i, "");
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", candidate)
      .maybeSingle();
    if (ws?.id) return ws.id;
  }

  // 3. Check Authorization or x-api-key header
  const authHeader =
    request.headers.get("authorization") || request.headers.get("x-api-key");
  let explicitToken: string | null = null;
  if (authHeader) {
    explicitToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  }

  if (explicitToken) {
    // If token is a Supabase JWT access token
    if (explicitToken.startsWith("ey")) {
      try {
        const { data: { user: jwtUser } } = await supabase.auth.getUser(explicitToken);
        if (jwtUser?.id) {
          const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", jwtUser.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (member?.workspace_id) return member.workspace_id;
        }
      } catch {
        // ignore
      }
    }

    // If token directly contains a UUID (e.g. "ws_f7bfa8ce..." or raw UUID)
    const uuidMatch = explicitToken.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    if (uuidMatch) {
      const { data: ws } = await supabase
        .from("workspaces")
        .select("id")
        .eq("id", uuidMatch[0])
        .maybeSingle();
      if (ws?.id) return ws.id;
    }

    // Check api_keys table if token is NOT the legacy dummy key
    if (explicitToken !== "ewc_live_9a7fe91bc2d8") {
      const prefixCandidate = explicitToken.substring(0, 13);
      const prefix12 = explicitToken.substring(0, 12);
      const { data: keyRecord } = await supabase
        .from("api_keys")
        .select("workspace_id")
        .or(
          `hashed_key.eq.${explicitToken},key_prefix.eq.${prefixCandidate},key_prefix.eq.${prefix12}`
        )
        .maybeSingle();

      if (keyRecord?.workspace_id) {
        return keyRecord.workspace_id;
      }
    }
  }

  // 4. Check active logged-in user via cookies (automatic detection for browser extension)
  try {
    const authServer = await createServerClient();
    const {
      data: { user },
    } = await authServer.auth.getUser();
    if (user?.id) {
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (member?.workspace_id) {
        return member.workspace_id;
      }
    }
  } catch {
    // Ignore cookie resolution error if running headless
  }

  // 5. If explicit token matches legacy key and user has no active session
  if (explicitToken === "ewc_live_9a7fe91bc2d8") {
    const { data: keyRecord } = await supabase
      .from("api_keys")
      .select("workspace_id")
      .eq("key_prefix", "ewc_live_9a7f")
      .maybeSingle();
    if (keyRecord?.workspace_id) return keyRecord.workspace_id;
  }

  return (
    process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ||
    "a0000000-0000-0000-0000-000000000001"
  );
}

// GET endpoint to allow Chrome extension to auto-detect active user workspace
export async function GET(request: NextRequest) {
  const cors = getCorsHeaders(request);
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  let user: any = null;
  let workspaceId: string | null = null;
  let workspaceName: string = "Acme Global Corp";
  let apiKey: string = "ewc_live_9a7fe91bc2d8";

  // Check Supabase Auth session via cookies
  try {
    const authServer = await createServerClient();
    const {
      data: { user: authUser },
    } = await authServer.auth.getUser();
    if (authUser) {
      user = { id: authUser.id, email: authUser.email };
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(id, name)")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (member?.workspace_id) {
        workspaceId = member.workspace_id;
        workspaceName = (member as any).workspaces?.name || "Workspace";
      }
    }
  } catch {
    // ignore
  }

  // Check if header passed an API Key or workspace_id
  if (!workspaceId) {
    const resolved = await resolveWorkspace(request, supabase);
    workspaceId = resolved;
    const { data: ws } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .maybeSingle();
    if (ws?.name) workspaceName = ws.name;
  }

  if (workspaceId) {
    const { data: keyRecord } = await supabase
      .from("api_keys")
      .select("hashed_key, key_prefix")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .maybeSingle();

    if (keyRecord?.hashed_key) {
      apiKey = keyRecord.hashed_key;
    } else {
      apiKey = `ewc_live_${workspaceId.replace(/-/g, "").slice(0, 16)}`;
    }
  }

  return NextResponse.json(
    {
      success: true,
      authenticated: !!user,
      user,
      workspace: {
        id: workspaceId,
        name: workspaceName,
        apiKey,
      },
    },
    { headers: cors }
  );
}

// Phone normalizer tailored for Bangladesh and international numbers
export function normalizePhoneNumber(rawPhone?: string | null): {
  normalized: string | null;
  isValidMobile: boolean;
  phoneType: "mobile" | "landline" | "voip" | "unknown";
} {
  if (!rawPhone) {
    return { normalized: null, isValidMobile: false, phoneType: "unknown" };
  }

  // Strip all non-digit characters except leading +
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Standard BD mobile: 01XXXXXXXXX (11 digits, starts with 013-019)
  if (/^01[3-9]\d{8}$/.test(cleaned)) {
    return {
      normalized: `+88${cleaned}`,
      isValidMobile: true,
      phoneType: "mobile",
    };
  }

  // Already prefixed with 880 (13 digits: 8801[3-9]XXXXXXXX)
  if (/^8801[3-9]\d{8}$/.test(cleaned)) {
    return {
      normalized: `+${cleaned}`,
      isValidMobile: true,
      phoneType: "mobile",
    };
  }

  // Bangladesh Landlines: e.g. 02-XXXXXXX (Dhaka)
  if (/^02\d{6,8}$/.test(cleaned) || /^8802\d{6,8}$/.test(cleaned)) {
    const full = cleaned.startsWith("880") ? `+${cleaned}` : `+88${cleaned}`;
    return {
      normalized: full,
      isValidMobile: false,
      phoneType: "landline",
    };
  }

  // VoIP / Non-geographic (096XX...)
  if (/^096\d{8}$/.test(cleaned) || /^88096\d{8}$/.test(cleaned)) {
    const full = cleaned.startsWith("880") ? `+${cleaned}` : `+88${cleaned}`;
    return {
      normalized: full,
      isValidMobile: false,
      phoneType: "voip",
    };
  }

  // Generic international fallback (minimum 8 digits, starts with country code)
  if (cleaned.length >= 8 && cleaned.length <= 15) {
    return {
      normalized: `+${cleaned}`,
      isValidMobile: true,
      phoneType: "unknown",
    };
  }

  return {
    normalized: cleaned ? `+${cleaned}` : null,
    isValidMobile: false,
    phoneType: "unknown",
  };
}

export async function POST(request: NextRequest) {
  const cors = getCorsHeaders(request);
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Parse Incoming Payload
    const rawBody = await request.json();
    let leads: any[] = [];
    let customListName: string | undefined;
    let customTags: string[] = [];

    if (Array.isArray(rawBody)) {
      leads = rawBody;
    } else if (rawBody && typeof rawBody === "object") {
      leads = Array.isArray(rawBody.leads) ? rawBody.leads : [rawBody];
      customListName = rawBody.list_name || rawBody.listName;
      if (Array.isArray(rawBody.tags)) {
        customTags = rawBody.tags;
      }
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads provided. Please send a JSON array of scraped leads." },
        { status: 400, headers: cors }
      );
    }

    // 2. Resolve Workspace strictly for this account
    const workspaceId = await resolveWorkspace(request, supabase, rawBody);

    // Deduplicate incoming batch by phone to avoid collisions in same batch
    const uniqueIncomingLeads: any[] = [];
    const seenPhonesInBatch = new Set<string>();
    for (const lead of leads) {
      const rawPhone = lead.normalizedPhone || lead.phone;
      const { normalized } = normalizePhoneNumber(rawPhone);
      if (normalized) {
        if (seenPhonesInBatch.has(normalized)) continue;
        seenPhonesInBatch.add(normalized);
      }
      uniqueIncomingLeads.push(lead);
    }

    // 3. Determine List Name from Search Query or fallback
    const firstSearchQuery = uniqueIncomingLeads.find((l) => l.searchQuery)?.searchQuery;
    const nowStr = new Date().toISOString().split("T")[0];
    const targetListName =
      customListName ||
      (firstSearchQuery
        ? `Google Maps: ${firstSearchQuery} (${nowStr})`
        : `Google Maps Leads (${nowStr})`);

    // Create or find target list in one shot
    let listId: string | null = null;
    const { data: existingList } = await supabase
      .from("lists")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("name", targetListName)
      .maybeSingle();

    if (existingList) {
      listId = existingList.id;
    } else {
      const { data: newList } = await supabase
        .from("lists")
        .insert({
          workspace_id: workspaceId,
          name: targetListName,
          description: `Auto-ingested from Chrome Extension scraper (${uniqueIncomingLeads.length} leads on ${nowStr})`,
        })
        .select("id")
        .single();
      if (newList) listId = newList.id;
    }

    // 4. Batch Tag Creation & Resolution
    const tagNamesToEnsure = new Set<string>([
      "Google Maps",
      "Chrome Extension",
      ...customTags,
    ]);

    uniqueIncomingLeads.forEach((l) => {
      if (l.category && typeof l.category === "string") {
        const cleanCat = l.category.split(" No reviews")[0].trim();
        if (cleanCat.length <= 40) tagNamesToEnsure.add(cleanCat);
      }
      if (l.searchQuery && typeof l.searchQuery === "string") {
        tagNamesToEnsure.add(l.searchQuery.trim());
      }
    });

    const tagNamesArray = Array.from(tagNamesToEnsure).filter(Boolean);
    const tagMap = new Map<string, string>(); // name -> tag_id

    if (tagNamesArray.length > 0) {
      const { data: existingTags } = await supabase
        .from("tags")
        .select("id, name")
        .eq("workspace_id", workspaceId)
        .in("name", tagNamesArray);

      if (existingTags) {
        existingTags.forEach((t) => tagMap.set(t.name, t.id));
      }

      const missingTags = tagNamesArray.filter((name) => !tagMap.has(name));
      if (missingTags.length > 0) {
        const colors = ["#6366f1", "#10b981", "#f59e0b", "#38bdf8", "#ec4899", "#8b5cf6"];
        const toInsertTags = missingTags.map((name, i) => ({
          workspace_id: workspaceId,
          name,
          color: colors[i % colors.length],
        }));

        const { data: createdTags } = await supabase
          .from("tags")
          .insert(toInsertTags)
          .select("id, name");

        if (createdTags) {
          createdTags.forEach((t) => tagMap.set(t.name, t.id));
        }
      }
    }

    // 5. Query Existing Contacts in Bulk by Phone
    const validNormalizedPhones = Array.from(seenPhonesInBatch);
    const existingContactsMap = new Map<string, string>(); // phone -> contact_id

    if (validNormalizedPhones.length > 0) {
      // Fetch matching contacts in chunks of 200
      const { data: existingContacts } = await supabase
        .from("contacts")
        .select("id, phone")
        .eq("workspace_id", workspaceId)
        .in("phone", validNormalizedPhones);

      if (existingContacts) {
        existingContacts.forEach((c) => {
          if (c.phone) existingContactsMap.set(c.phone, c.id);
        });
      }
    }

    // 6. Partition into Inserts vs Updates
    let whatsappEligibleCount = 0;
    let landlineCount = 0;
    let skippedNoPhone = 0;

    const toInsertContacts: any[] = [];
    const toUpdateContacts: Array<{ id: string; payload: any }> = [];
    const leadMetaMap = new Map<string, { tags: string[] }>(); // phoneOrName -> tags

    for (const lead of uniqueIncomingLeads) {
      const rawPhone = lead.normalizedPhone || lead.phone;
      const { normalized: phone, isValidMobile, phoneType } = normalizePhoneNumber(rawPhone);

      if (isValidMobile) whatsappEligibleCount++;
      if (phoneType === "landline" || phoneType === "voip") landlineCount++;
      if (!phone) skippedNoPhone++;

      const businessName = lead.businessName?.trim() || "Local Business";
      const address = lead.address?.replace(/\s*(Open 24 hours|Open|Closed)\s*$/i, "").trim() || null;
      const rating = typeof lead.rating === "number" ? lead.rating : null;
      const reviewCount = typeof lead.reviewCount === "number" ? lead.reviewCount : null;

      const metadata = {
        scraped_category: lead.category || null,
        rating,
        review_count: reviewCount,
        address,
        business_status: lead.businessStatus || "Open",
        maps_url: lead.mapsUrl || null,
        latitude: lead.latitude || null,
        longitude: lead.longitude || null,
        search_query: lead.searchQuery || null,
        collected_at: lead.collectedAt || new Date().toISOString(),
        is_whatsapp_eligible: isValidMobile,
        phone_type: phoneType,
      };

      // Calculate tags to attach
      const tagsForThisLead: string[] = ["Google Maps", "Chrome Extension"];
      if (lead.category) {
        const cleanCat = lead.category.split(" No reviews")[0].trim();
        if (tagMap.has(cleanCat)) tagsForThisLead.push(cleanCat);
      }
      if (lead.searchQuery && tagMap.has(lead.searchQuery.trim())) {
        tagsForThisLead.push(lead.searchQuery.trim());
      }
      customTags.forEach((t) => tagsForThisLead.push(t));

      const existingId = phone ? existingContactsMap.get(phone) : null;
      if (existingId) {
        toUpdateContacts.push({
          id: existingId,
          payload: {
            first_name: businessName,
            company: businessName,
            metadata,
            updated_at: new Date().toISOString(),
          },
        });
        leadMetaMap.set(existingId, { tags: tagsForThisLead });
      } else {
        toInsertContacts.push({
          workspace_id: workspaceId,
          first_name: businessName,
          last_name: null,
          email: null,
          phone: phone || null,
          company: businessName,
          country: "Bangladesh",
          status: "subscribed",
          source: "Google Maps Chrome Extension",
          unsubscribe_token: crypto.randomUUID(),
          metadata,
        });
        const refKey = phone || businessName;
        leadMetaMap.set(refKey, { tags: tagsForThisLead });
      }
    }

    // 7. Bulk Insert New Contacts
    const finalContactIds: string[] = [];

    if (toInsertContacts.length > 0) {
      const { data: insertedRecords, error: insertError } = await supabase
        .from("contacts")
        .insert(toInsertContacts)
        .select("id, phone, first_name");

      if (insertError) {
        console.error("Batch insert error:", insertError);
      } else if (insertedRecords) {
        insertedRecords.forEach((rec) => {
          finalContactIds.push(rec.id);
          const refKey = rec.phone || rec.first_name;
          const leadMeta = leadMetaMap.get(refKey);
          if (leadMeta) {
            leadMetaMap.set(rec.id, leadMeta);
          }
        });
      }
    }

    // 8. Bulk Update Existing Contacts in Parallel
    if (toUpdateContacts.length > 0) {
      await Promise.all(
        toUpdateContacts.map((item) => {
          finalContactIds.push(item.id);
          return supabase.from("contacts").update(item.payload).eq("id", item.id);
        })
      );
    }

    // 9. Bulk Link to List
    if (listId && finalContactIds.length > 0) {
      const listMemberRows = finalContactIds.map((cid) => ({
        list_id: listId as string,
        contact_id: cid,
      }));

      await supabase
        .from("list_members")
        .upsert(listMemberRows, { onConflict: "list_id,contact_id", ignoreDuplicates: true });
    }

    // 10. Bulk Link Contact Tags
    const contactTagRows: Array<{ contact_id: string; tag_id: string }> = [];
    for (const cid of finalContactIds) {
      const meta = leadMetaMap.get(cid);
      if (meta?.tags) {
        for (const tName of meta.tags) {
          const tId = tagMap.get(tName);
          if (tId) {
            contactTagRows.push({ contact_id: cid, tag_id: tId });
          }
        }
      }
    }

    if (contactTagRows.length > 0) {
      await supabase
        .from("contact_tags")
        .upsert(contactTagRows, { onConflict: "contact_id,tag_id", ignoreDuplicates: true });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully processed ${uniqueIncomingLeads.length} leads.`,
        stats: {
          totalReceived: leads.length,
          uniqueProcessed: uniqueIncomingLeads.length,
          inserted: toInsertContacts.length,
          updated: toUpdateContacts.length,
          whatsappEligible: whatsappEligibleCount,
          landlines: landlineCount,
          skippedNoPhone,
        },
        list: {
          id: listId,
          name: targetListName,
        },
        campaignUrls: {
          whatsapp: listId
            ? `/whatsapp/campaigns/new?listId=${listId}&name=${encodeURIComponent("WhatsApp Blast - " + targetListName)}`
            : "/whatsapp/campaigns/new",
          email: listId
            ? `/email/campaigns/new?listId=${listId}&name=${encodeURIComponent("Email Blast - " + targetListName)}`
            : "/email/campaigns/new",
        },
      },
      { status: 200, headers: cors }
    );
  } catch (err: any) {
    console.error("Lead Ingestion Error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error during lead ingestion",
        details: err.message,
      },
      { status: 500, headers: cors }
    );
  }
}
