import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { channel, recipient, template_id, variables, subject, content } = body;

    if (!channel || (channel !== "email" && channel !== "whatsapp")) {
      return NextResponse.json(
        { error: "Invalid channel: Must be 'email' or 'whatsapp'" },
        { status: 400 }
      );
    }

    if (!recipient) {
      return NextResponse.json(
        { error: "Missing required parameter: recipient" },
        { status: 400 }
      );
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return NextResponse.json(
      {
        success: true,
        message_id: messageId,
        channel,
        recipient,
        status: "queued",
        queued_at: new Date().toISOString(),
      },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
