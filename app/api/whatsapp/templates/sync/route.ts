import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/whatsapp/encryption";
import { fetchTemplatesFromMeta } from "@/lib/whatsapp/meta-api";

const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Get credentials
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .maybeSingle();

    let wabaId = config?.waba_id;
    let rawToken = config?.access_token;

    if (!wabaId || !rawToken) {
      const { data: accounts } = await supabase
        .from("whatsapp_accounts")
        .select("*")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .limit(1);

      if (accounts && accounts.length > 0) {
        wabaId = accounts[0].business_account_id;
        rawToken = accounts[0].encrypted_access_token;
      }
    }

    if (!wabaId) wabaId = process.env.META_WABA_ID;
    if (!rawToken) rawToken = process.env.META_PERMANENT_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

    if (!wabaId || !rawToken) {
      return NextResponse.json(
        { error: "WABA ID or Access Token is missing. Please configure your Meta credentials in WhatsApp Configuration." },
        { status: 400 }
      );
    }

    const accessToken = decrypt(rawToken);

    // 2. Fetch from Meta Graph API
    const metaTemplates = await fetchTemplatesFromMeta({ wabaId, accessToken });

    let syncedCount = 0;

    for (const mt of metaTemplates) {
      const components = mt.components || [];
      const headerComp = components.find((c: any) => c.type === "HEADER");
      const bodyComp = components.find((c: any) => c.type === "BODY");
      const footerComp = components.find((c: any) => c.type === "FOOTER");
      const buttonsComp = components.find((c: any) => c.type === "BUTTONS");

      const bodyText = bodyComp?.text || "";
      const variables = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g)).map((m: any) => m[0]);

      const templateRecord = {
        workspace_id: DEFAULT_WORKSPACE_ID,
        meta_template_id: mt.id,
        name: mt.name,
        category: (mt.category || "UTILITY").toUpperCase(),
        language: mt.language || "en_US",
        status: mt.status || "APPROVED",
        header_type: headerComp?.format || null,
        header_content: headerComp?.text || null,
        body_text: bodyText,
        footer_text: footerComp?.text || null,
        buttons: buttonsComp?.buttons || [],
        variables,
        updated_at: new Date().toISOString(),
      };

      // Check if already exists by meta_template_id or name
      const { data: existing } = await supabase
        .from("whatsapp_templates")
        .select("id")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .eq("name", mt.name)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("whatsapp_templates")
          .update(templateRecord)
          .eq("id", existing.id);
      } else {
        await supabase.from("whatsapp_templates").insert(templateRecord);
      }

      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      count: syncedCount,
      templates: metaTemplates,
      message: `Successfully synced ${syncedCount} templates from Meta WhatsApp Business Account.`,
    });
  } catch (err: any) {
    console.error("[Template Sync Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sync templates from Meta" },
      { status: 500 }
    );
  }
}
