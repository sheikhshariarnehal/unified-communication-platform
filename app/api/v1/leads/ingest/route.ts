import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// CORS headers to permit requests directly from Chrome extensions
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
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
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Resolve Workspace & Auth
    const authHeader =
      request.headers.get("authorization") || request.headers.get("x-api-key");
    let workspaceId =
      process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ||
      "a0000000-0000-0000-0000-000000000001";

    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (token && !token.startsWith("default")) {
        const { data: keyRecord } = await supabase
          .from("api_keys")
          .select("workspace_id")
          .or(`key_prefix.eq.${token.substring(0, 12)},hashed_key.eq.${token}`)
          .maybeSingle();

        if (keyRecord?.workspace_id) {
          workspaceId = keyRecord.workspace_id;
        }
      }
    }

    // 2. Parse Incoming Payload
    const rawBody = await request.json();
    let leads: any[] = [];
    let customListName: string | undefined;
    let customTags: string[] = [];

    if (Array.isArray(rawBody)) {
      leads = rawBody;
      if (rawBody.length > 0 && rawBody[0]?.workspace_id) {
        workspaceId = rawBody[0].workspace_id;
      }
    } else if (rawBody && typeof rawBody === "object") {
      leads = Array.isArray(rawBody.leads) ? rawBody.leads : [rawBody];
      customListName = rawBody.list_name || rawBody.listName;
      if (rawBody.workspace_id || rawBody.workspaceId) {
        workspaceId = rawBody.workspace_id || rawBody.workspaceId;
      }
      if (Array.isArray(rawBody.tags)) {
        customTags = rawBody.tags;
      }
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads provided. Please send a JSON array of scraped leads." },
        { status: 400, headers: corsHeaders }
      );
    }

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
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Lead Ingestion Error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error during lead ingestion",
        details: err.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
