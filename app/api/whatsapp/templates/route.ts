import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // Default template always available on every Meta account
    const defaultTemplates: any[] = [
      {
        id: "meta-hello-world",
        name: "hello_world",
        category: "UTILITY",
        language: "en_US",
        status: "APPROVED",
        body_text: "Welcome and congratulations! This message confirms that your WhatsApp Business Cloud API integration is live.",
        isMetaDefault: true,
      },
      {
        id: "meta-order-update",
        name: "order_shipping_update_v2",
        category: "UTILITY",
        language: "en_US",
        status: "APPROVED",
        body_text: "Hello {{1}}, your order {{2}} has been shipped via express courier. Track: {{3}}",
        variables: ["{{1}}", "{{2}}", "{{3}}"],
      },
    ];

    // 1. Fetch from Supabase
    const { data: dbTemplates } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID);

    if (dbTemplates && dbTemplates.length > 0) {
      for (const t of dbTemplates) {
        if (!defaultTemplates.some((d) => d.name === t.name)) {
          defaultTemplates.push(t);
        }
      }
    }

    // 2. Fetch live templates from Meta Graph API if credentials exist
    const { data: accounts } = await supabase
      .from("whatsapp_accounts")
      .select("business_account_id, encrypted_access_token")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(1);

    if (accounts && accounts.length > 0) {
      const { business_account_id: wabaId, encrypted_access_token: token } = accounts[0];
      if (wabaId && token) {
        try {
          const metaRes = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(
              wabaId
            )}/message_templates?access_token=${encodeURIComponent(token)}&fields=name,status,category,language,components`,
            { next: { revalidate: 60 } }
          );

          if (metaRes.ok) {
            const metaJson = await metaRes.json();
            if (metaJson.data && Array.isArray(metaJson.data)) {
              for (const mt of metaJson.data) {
                const bodyComponent = mt.components?.find((c: any) => c.type === "BODY");
                const existingIndex = defaultTemplates.findIndex((t) => t.name === mt.name);

                const item = {
                  id: mt.id || `meta_${mt.name}`,
                  name: mt.name,
                  category: mt.category || "MARKETING",
                  language: mt.language || "en_US",
                  status: mt.status || "APPROVED",
                  body_text: bodyComponent?.text || "Approved Meta Template",
                  isLiveMeta: true,
                };

                if (existingIndex >= 0) {
                  defaultTemplates[existingIndex] = item;
                } else {
                  defaultTemplates.push(item);
                }
              }
            }
          }
        } catch (metaErr) {
          console.warn("[Templates Meta Fetch Warning]:", metaErr);
        }
      }
    }

    return NextResponse.json({ templates: defaultTemplates });
  } catch (err: any) {
    console.error("[Templates GET Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve templates" },
      { status: 500 }
    );
  }
}
