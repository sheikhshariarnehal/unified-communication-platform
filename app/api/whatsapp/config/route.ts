import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

// Helper to mask sensitive access tokens
function maskToken(token: string): string {
  if (!token || token.length < 12) return "••••••••••••••••";
  return `${token.substring(0, 6)}••••••••••••${token.substring(token.length - 4)}`;
}

// GET /api/whatsapp/config - Retrieve existing WhatsApp credentials
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("whatsapp_accounts")
      .select("*")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.warn("[WhatsApp Config GET] Supabase query warning:", error.message);
    }

    const active = data && data.length > 0 ? data[0] : null;

    if (active) {
      return NextResponse.json({
        connected: active.status === "connected",
        phoneNumberId: active.phone_number_id || "",
        wabaId: active.business_account_id || "",
        phoneNumber: active.phone_number || "",
        displayName: active.display_name || "",
        hasToken: Boolean(active.encrypted_access_token),
        maskedToken: active.encrypted_access_token ? maskToken(active.encrypted_access_token) : "",
        hasAppSecret: Boolean(active.app_secret),
        maskedAppSecret: active.app_secret ? maskToken(active.app_secret) : "",
        webhookVerifyToken: active.webhook_verify_token || "unified_webhook_token",
        status: active.status || "connected",
        updatedAt: active.updated_at || active.created_at,
      });
    }

    // Default / fallback state
    return NextResponse.json({
      connected: false,
      phoneNumberId: "",
      wabaId: "",
      phoneNumber: "",
      displayName: "",
      hasToken: false,
      maskedToken: "",
      hasAppSecret: false,
      maskedAppSecret: "",
      webhookVerifyToken: "unified_webhook_token",
      status: "disconnected",
    });
  } catch (err: any) {
    console.error("[WhatsApp Config GET] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load WhatsApp configuration" },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp/config - Test API connection or Save credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      phoneNumberId,
      wabaId,
      accessToken,
      appSecret,
      webhookVerifyToken,
      phoneNumber,
      displayName,
    } = body;

    const supabase = getSupabaseAdmin();

    // -------------------------------------------------------------
    // ACTION: TEST API CONNECTION
    // -------------------------------------------------------------
    if (action === "test") {
      if (!phoneNumberId?.trim()) {
        return NextResponse.json(
          { success: false, error: "Phone Number ID is required to test connection." },
          { status: 400 }
        );
      }

      let tokenToUse = accessToken?.trim();

      // If token not provided, or contains mask characters ('•'), or is too short to be a valid token,
      // safely fall back to the stored token in the database
      if (!tokenToUse || tokenToUse.includes("•") || tokenToUse.length < 20) {
        const { data } = await supabase
          .from("whatsapp_accounts")
          .select("encrypted_access_token")
          .eq("workspace_id", DEFAULT_WORKSPACE_ID)
          .order("created_at", { ascending: false })
          .limit(1);
        if (data && data.length > 0 && data[0].encrypted_access_token) {
          tokenToUse = data[0].encrypted_access_token;
        }
      }

      if (!tokenToUse) {
        return NextResponse.json(
          { success: false, error: "Access token is required. Please paste your Permanent Access Token." },
          { status: 400 }
        );
      }

      // Query Meta Graph API for Phone Number info
      const metaUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
        phoneNumberId.trim()
      )}?fields=verified_name,display_phone_number,quality_rating,code_verification_status,throughput,health_status&access_token=${encodeURIComponent(
        tokenToUse
      )}`;

      const metaRes = await fetch(metaUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const metaData = await metaRes.json();

      if (!metaRes.ok || metaData.error) {
        const errorMsg =
          metaData.error?.message ||
          metaData.error?.error_user_msg ||
          "Meta Graph API connection failed. Check your Phone Number ID and Access Token.";
        return NextResponse.json(
          {
            success: false,
            error: errorMsg,
            code: metaData.error?.code,
            type: metaData.error?.type,
          },
          { status: 400 }
        );
      }

      // If WABA ID is also provided, query WABA details
      let wabaName: string | null = null;
      if (wabaId?.trim()) {
        try {
          const wabaUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
            wabaId.trim()
          )}?fields=name,currency,timezone_id&access_token=${encodeURIComponent(tokenToUse)}`;
          const wabaRes = await fetch(wabaUrl);
          if (wabaRes.ok) {
            const wabaData = await wabaRes.json();
            wabaName = wabaData.name || null;
          }
        } catch {
          // ignore optional WABA fetch error
        }
      }

      return NextResponse.json({
        success: true,
        message: "Meta Graph API connection verified successfully!",
        verifiedName: metaData.verified_name || "Verified Business",
        displayPhoneNumber: metaData.display_phone_number || "",
        qualityRating: metaData.quality_rating || "GREEN",
        verificationStatus: metaData.code_verification_status || "VERIFIED",
        throughputLevel: metaData.throughput?.level || "STANDARD",
        wabaName,
        phoneNumberId: metaData.id,
      });
    }

    // -------------------------------------------------------------
    // ACTION: SAVE CONFIGURATION
    // -------------------------------------------------------------
    if (action === "save") {
      if (!phoneNumberId?.trim()) {
        return NextResponse.json(
          { success: false, error: "Phone Number ID is required." },
          { status: 400 }
        );
      }

      // Check existing record
      const { data: existing } = await supabase
        .from("whatsapp_accounts")
        .select("id, encrypted_access_token, app_secret")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .order("created_at", { ascending: false })
        .limit(1);

      const existingAccount = existing && existing.length > 0 ? existing[0] : null;

      // Retain existing token if user left blank or if it contains mask characters
      let finalToken = accessToken?.trim();
      if (!finalToken || finalToken.includes("•") || finalToken.length < 20) {
        finalToken = existingAccount?.encrypted_access_token;
      }
      if (!finalToken) {
        return NextResponse.json(
          { success: false, error: "Permanent Access Token is required to save configuration." },
          { status: 400 }
        );
      }

      let finalAppSecret = appSecret?.trim();
      if (!finalAppSecret || finalAppSecret.includes("•")) {
        finalAppSecret = existingAccount?.app_secret || null;
      }

      const accountPayload = {
        workspace_id: DEFAULT_WORKSPACE_ID,
        phone_number_id: phoneNumberId.trim(),
        business_account_id: (wabaId || "waba_meta").trim(),
        phone_number: phoneNumber?.trim() || "+1 (555) 019-2830",
        display_name: displayName?.trim() || "WhatsApp Business Official",
        encrypted_access_token: finalToken,
        app_secret: finalAppSecret,
        webhook_verify_token: (webhookVerifyToken || "unified_webhook_token").trim(),
        status: "connected",
        updated_at: new Date().toISOString(),
      };

      if (existingAccount) {
        const { error: updateError } = await supabase
          .from("whatsapp_accounts")
          .update(accountPayload)
          .eq("id", existingAccount.id);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }
      } else {
        const { error: insertError } = await supabase
          .from("whatsapp_accounts")
          .insert({
            ...accountPayload,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: "WhatsApp Business API configuration saved successfully!",
        connected: true,
        maskedToken: maskToken(finalToken),
        maskedAppSecret: finalAppSecret ? maskToken(finalAppSecret) : null,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action specified." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[WhatsApp Config POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process WhatsApp configuration" },
      { status: 500 }
    );
  }
}
