import { NextResponse, type NextRequest } from "next/server";

// Meta Webhook Verification (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "unified_webhook_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Meta Webhook Delivery & Message Ingestion (POST)
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

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
