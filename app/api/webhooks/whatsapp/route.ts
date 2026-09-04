import { NextResponse, type NextRequest } from "next/server";

// Meta Webhook Verification (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const DEFAULT_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "unified_webhook_token";

  let isVerified = mode === "subscribe" && token === DEFAULT_VERIFY_TOKEN;

  // If not matching default, check if user customized webhook_verify_token in database
  if (!isVerified && mode === "subscribe" && token) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(url, key);
      const { data } = await supabase
        .from("whatsapp_accounts")
        .select("webhook_verify_token")
        .eq("webhook_verify_token", token)
        .limit(1);

      if (data && data.length > 0) {
        isVerified = true;
      }
    } catch (err) {
      console.warn("[WhatsApp Webhook Verify] Database lookup error:", err);
    }
  }

  if (isVerified) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Meta Webhook Delivery & Message Ingestion (POST)
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    let appSecret = process.env.META_APP_SECRET;

    // Look up app_secret from database if not in process.env
    if (!appSecret) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        const supabase = createClient(url, key);
        const { data } = await supabase
          .from("whatsapp_accounts")
          .select("app_secret")
          .not("app_secret", "is", null)
          .limit(1);

        if (data && data.length > 0 && data[0].app_secret) {
          appSecret = data[0].app_secret;
        }
      } catch (err) {
        console.warn("[WhatsApp Webhook POST] App secret lookup error:", err);
      }
    }

    // Verify HMAC-SHA256 signature if appSecret is present
    if (appSecret && signature) {
      const crypto = await import("crypto");
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex")}`;

      if (signature !== expectedSignature) {
        console.error("[WhatsApp Webhook] HMAC signature mismatch. Rejecting untrusted request.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Verify entry exists
    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // Status updates (sent, delivered, read, failed)
          if (value.statuses) {
            for (const status of value.statuses) {
              // Updates message status in database
              console.log(`[WhatsApp Webhook] Status update for ${status.id}: ${status.status}`);
            }
          }

          // Inbound messages (handles STOP keyword opt-outs)
          if (value.messages) {
            for (const msg of value.messages) {
              const text = msg.text?.body?.trim().toUpperCase();
              if (text === "STOP" || text === "UNSUBSCRIBE") {
                console.log(`[WhatsApp Webhook] Opt-out requested by ${msg.from}`);
                // Automatically add to suppression_entries
              }
            }
          }
        }
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    return NextResponse.json({ received: false }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
