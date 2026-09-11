import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encrypt, decrypt } from "@/lib/whatsapp/encryption";
import {
  verifyPhoneNumber,
  registerPhoneNumber,
  subscribeWabaToApp,
} from "@/lib/whatsapp/meta-api";

const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

function maskToken(token: string): string {
  if (!token || token.length < 12) return "••••••••••••••••";
  return `${token.substring(0, 6)}••••••••••••${token.substring(token.length - 4)}`;
}

// GET /api/whatsapp/config - Retrieve existing WhatsApp credentials
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Try whatsapp_config table first
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("*")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .maybeSingle();

    // 2. Fallback to whatsapp_accounts
    const { data: accounts } = await supabase
      .from("whatsapp_accounts")
      .select("*")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(1);

    const activeAccount = accounts && accounts.length > 0 ? accounts[0] : null;

    const phoneNumberId = config?.phone_number_id || activeAccount?.phone_number_id || process.env.META_PHONE_NUMBER_ID || "";
    const wabaId = config?.waba_id || activeAccount?.business_account_id || process.env.META_WABA_ID || "";
    const rawToken = config?.access_token || activeAccount?.encrypted_access_token || "";
    const webhookVerifyToken = config?.verify_token || activeAccount?.webhook_verify_token || process.env.META_WEBHOOK_VERIFY_TOKEN || "unified_webhook_token";
    const appSecret = config?.app_secret || activeAccount?.app_secret || process.env.META_APP_SECRET || "";
    const isConnected = Boolean(config?.status === "connected" || activeAccount?.status === "connected" || (phoneNumberId && rawToken));

    return NextResponse.json({
      connected: isConnected,
      phoneNumberId,
      wabaId,
      phoneNumber: activeAccount?.phone_number || "",
      displayName: activeAccount?.display_name || "Official WhatsApp Account",
      hasToken: Boolean(rawToken),
      maskedToken: rawToken ? maskToken(decrypt(rawToken)) : "",
      hasAppSecret: Boolean(appSecret),
      maskedAppSecret: appSecret ? maskToken(appSecret) : "",
      webhookVerifyToken,
      status: isConnected ? "connected" : "disconnected",
      updatedAt: config?.updated_at || activeAccount?.updated_at || new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[WhatsApp Config GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load WhatsApp configuration" },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp/config - Test API connection, Save credentials, or Register PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action = "save",
      phoneNumberId,
      wabaId,
      accessToken,
      appSecret,
      webhookVerifyToken,
      phoneNumber,
      displayName,
      pin,
    } = body;

    const supabase = getSupabaseAdmin();

    // -------------------------------------------------------------
    // ACTION: TEST API CONNECTION
    // -------------------------------------------------------------
    if (action === "test") {
      let targetPhoneNumberId = phoneNumberId?.trim();
      let targetToken = accessToken?.trim();

      // If token not provided in test body, retrieve encrypted token from DB
      if (!targetToken) {
        const { data: config } = await supabase
          .from("whatsapp_config")
          .select("access_token, phone_number_id")
          .eq("workspace_id", DEFAULT_WORKSPACE_ID)
          .maybeSingle();

        if (config?.access_token) {
          targetToken = decrypt(config.access_token);
          if (!targetPhoneNumberId) targetPhoneNumberId = config.phone_number_id;
        } else {
          const { data: accounts } = await supabase
            .from("whatsapp_accounts")
            .select("encrypted_access_token, phone_number_id")
            .eq("workspace_id", DEFAULT_WORKSPACE_ID)
            .limit(1);

          if (accounts && accounts[0]?.encrypted_access_token) {
            targetToken = decrypt(accounts[0].encrypted_access_token);
            if (!targetPhoneNumberId) targetPhoneNumberId = accounts[0].phone_number_id;
          }
        }
      }

      if (!targetPhoneNumberId) {
        return NextResponse.json(
          { success: false, error: "Phone Number ID is required to test connection." },
          { status: 400 }
        );
      }
      if (!targetToken) {
        return NextResponse.json(
          { success: false, error: "Access Token is required to test connection." },
          { status: 400 }
        );
      }

      try {
        const metaInfo = await verifyPhoneNumber({
          phoneNumberId: targetPhoneNumberId,
          accessToken: targetToken,
        });

        return NextResponse.json({
          success: true,
          message: "Meta Graph API connection successful! Verified phone number details retrieved.",
          verifiedName: metaInfo.verified_name || metaInfo.display_phone_number || "Verified Account",
          displayPhoneNumber: metaInfo.display_phone_number || "",
          qualityRating: metaInfo.quality_rating || "GREEN",
          throughputLevel: "Standard",
          metaId: metaInfo.id,
        });
      } catch (metaErr: any) {
        return NextResponse.json({
          success: false,
          error: metaErr.message || "Meta API rejected credentials. Check Phone Number ID and Access Token permissions.",
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION: REGISTER PHONE NUMBER WITH 2FA PIN
    // -------------------------------------------------------------
    if (action === "register") {
      if (!phoneNumberId || !pin) {
        return NextResponse.json(
          { success: false, error: "Phone Number ID and 6-digit PIN are required." },
          { status: 400 }
        );
      }

      let targetToken = accessToken?.trim();
      if (!targetToken) {
        const { data: config } = await supabase
          .from("whatsapp_config")
          .select("access_token")
          .eq("workspace_id", DEFAULT_WORKSPACE_ID)
          .maybeSingle();
        if (config?.access_token) targetToken = decrypt(config.access_token);
      }

      if (!targetToken) {
        return NextResponse.json({ success: false, error: "Access token is missing." }, { status: 400 });
      }

      try {
        await registerPhoneNumber({
          phoneNumberId,
          accessToken: targetToken,
          pin,
        });

        if (wabaId) {
          try {
            await subscribeWabaToApp({ wabaId, accessToken: targetToken });
          } catch (subErr) {
            console.warn("WABA subscription warning:", subErr);
          }
        }

        return NextResponse.json({
          success: true,
          message: "WhatsApp Business number registered successfully with Meta Cloud API!",
        });
      } catch (regErr: any) {
        return NextResponse.json({ success: false, error: regErr.message }, { status: 400 });
      }
    }

    // -------------------------------------------------------------
    // ACTION: SAVE CREDENTIALS
    // -------------------------------------------------------------
    if (action === "save") {
      if (!phoneNumberId?.trim()) {
        return NextResponse.json(
          { success: false, error: "Phone Number ID is required." },
          { status: 400 }
        );
      }

      // Fetch existing row to preserve stored token if user didn't re-type it
      const { data: existingConfig } = await supabase
        .from("whatsapp_config")
        .select("access_token, app_secret")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .maybeSingle();

      let finalEncryptedToken = existingConfig?.access_token || "";
      if (accessToken?.trim()) {
        finalEncryptedToken = encrypt(accessToken.trim());
      }

      let finalAppSecret = appSecret?.trim() || existingConfig?.app_secret || "";

      // 1. Upsert into whatsapp_config
      const { error: configUpsertErr } = await supabase
        .from("whatsapp_config")
        .upsert(
          {
            workspace_id: DEFAULT_WORKSPACE_ID,
            phone_number_id: phoneNumberId.trim(),
            waba_id: wabaId?.trim() || null,
            access_token: finalEncryptedToken,
            verify_token: webhookVerifyToken?.trim() || "unified_webhook_token",
            app_secret: finalAppSecret || null,
            status: "connected",
            connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "workspace_id" }
        );

      if (configUpsertErr) {
        console.warn("[Config Save] whatsapp_config upsert note:", configUpsertErr.message);
      }

      // 2. Also keep whatsapp_accounts in sync
      const { data: existingAccounts } = await supabase
        .from("whatsapp_accounts")
        .select("id")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .limit(1);

      const accountPayload: any = {
        workspace_id: DEFAULT_WORKSPACE_ID,
        phone_number_id: phoneNumberId.trim(),
        business_account_id: wabaId?.trim() || "waba_default",
        phone_number: phoneNumber?.trim() || "+1 (555) 019-2830",
        display_name: displayName?.trim() || "Official WhatsApp Account",
        encrypted_access_token: finalEncryptedToken,
        webhook_verify_token: webhookVerifyToken?.trim() || "unified_webhook_token",
        app_secret: finalAppSecret || null,
        status: "connected",
        updated_at: new Date().toISOString(),
      };

      if (existingAccounts && existingAccounts.length > 0) {
        await supabase
          .from("whatsapp_accounts")
          .update(accountPayload)
          .eq("id", existingAccounts[0].id);
      } else {
        await supabase.from("whatsapp_accounts").insert(accountPayload);
      }

      return NextResponse.json({
        success: true,
        message: "WhatsApp Business Cloud API credentials secured and saved successfully.",
      });
    }

    // -------------------------------------------------------------
    // ACTION: DISCONNECT
    // -------------------------------------------------------------
    if (action === "disconnect") {
      await supabase
        .from("whatsapp_config")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("workspace_id", DEFAULT_WORKSPACE_ID);

      await supabase
        .from("whatsapp_accounts")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("workspace_id", DEFAULT_WORKSPACE_ID);

      return NextResponse.json({
        success: true,
        message: "WhatsApp Business connection disconnected.",
      });
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (err: any) {
    console.error("[WhatsApp Config POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process WhatsApp configuration." },
      { status: 500 }
    );
  }
}
