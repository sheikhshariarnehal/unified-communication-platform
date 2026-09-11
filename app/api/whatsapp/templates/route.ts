import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { decrypt } from "@/lib/whatsapp/encryption";

const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

// GET /api/whatsapp/templates - Retrieve live Meta templates + Supabase templates
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch from Supabase whatsapp_templates table
    const { data: dbTemplates } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID);

    const templateMap = new Map<string, any>();

    if (dbTemplates && dbTemplates.length > 0) {
      for (const t of dbTemplates) {
        templateMap.set(t.name, {
          id: t.id,
          name: t.name,
          category: t.category || "UTILITY",
          language: t.language || "en_US",
          status: t.status || "APPROVED",
          body_text: t.body_text || "",
          variables: t.variables || [],
          isLiveMeta: true,
          isTestOnly: t.name === "hello_world",
        });
      }
    }

    // 2. Fetch live templates from Meta Graph API if credentials exist
    let wabaId: string | null = null;
    let rawToken: string | null = null;

    // Check whatsapp_config first
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("waba_id, access_token")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .maybeSingle();

    if (config?.waba_id && config?.access_token) {
      wabaId = config.waba_id;
      rawToken = config.access_token;
    } else {
      const { data: accounts } = await supabase
        .from("whatsapp_accounts")
        .select("business_account_id, encrypted_access_token")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .order("created_at", { ascending: false })
        .limit(1);

      if (accounts && accounts.length > 0) {
        wabaId = accounts[0].business_account_id;
        rawToken = accounts[0].encrypted_access_token;
      }
    }

    if (!wabaId) wabaId = process.env.META_WABA_ID || null;
    if (!rawToken) rawToken = process.env.META_PERMANENT_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || null;

    if (wabaId && rawToken) {
      const token = decrypt(rawToken);
      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v21.0/${encodeURIComponent(
            wabaId
          )}/message_templates?access_token=${encodeURIComponent(token)}&fields=name,status,category,language,components&limit=100`,
          { next: { revalidate: 30 } }
        );

        if (metaRes.ok) {
          const metaJson = await metaRes.json();
          if (metaJson.data && Array.isArray(metaJson.data)) {
            for (const mt of metaJson.data) {
              const bodyComponent = mt.components?.find((c: any) => c.type === "BODY");
              const bodyText = bodyComponent?.text || "";
              const variables = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g)).map((m: any) => m[0]);

              templateMap.set(mt.name, {
                id: mt.id || `meta_${mt.name}`,
                name: mt.name,
                category: mt.category || "MARKETING",
                language: mt.language || "en_US",
                status: mt.status || "APPROVED",
                body_text: bodyText,
                variables,
                isLiveMeta: true,
                isTestOnly: mt.name === "hello_world",
              });
            }
          }
        }
      } catch (metaErr) {
        console.warn("[Templates Meta Fetch Warning]:", metaErr);
      }
    }

    // Default fallback if nothing returned
    if (templateMap.size === 0) {
      templateMap.set("welcome_notice", {
        id: "meta-welcome-notice",
        name: "welcome_notice",
        category: "MARKETING",
        language: "en_US",
        status: "APPROVED",
        body_text: "Hello! Thank you for contacting ntechbd. We look forward to working with you.",
        variables: [],
        isLiveMeta: true,
        isTestOnly: false,
      });
      templateMap.set("hello_world", {
        id: "meta-hello-world",
        name: "hello_world",
        category: "UTILITY",
        language: "en_US",
        status: "APPROVED",
        body_text: "Welcome and congratulations! This message confirms that your WhatsApp Business Cloud API integration is live.",
        variables: [],
        isMetaDefault: true,
        isTestOnly: true,
      });
    }

    // Sort templates: Real verified business templates (e.g. welcome_notice) first, test-only templates (hello_world) last
    const templates = Array.from(templateMap.values()).sort((a, b) => {
      if (a.isTestOnly && !b.isTestOnly) return 1;
      if (!a.isTestOnly && b.isTestOnly) return -1;
      if (a.name === "welcome_notice") return -1;
      if (b.name === "welcome_notice") return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ templates });
  } catch (err: any) {
    console.error("[Templates GET Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve templates" },
      { status: 500 }
    );
  }
}
