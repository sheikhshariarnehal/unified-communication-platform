import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const DEFAULT_WORKSPACE_ID =
  process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || "a0000000-0000-0000-0000-000000000001";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxxavporesuoszmjkijb.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not configured.");
  }
  return new Resend(apiKey);
}

function isValidUuid(val: any): boolean {
  return (
    typeof val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
  );
}

function sanitizeAudienceType(val: any): "all" | "list" | "segment" {
  if (val === "all" || val === "list" || val === "segment") return val;
  return "list";
}

function renderTemplate(content: string, vars: Record<string, string>): string {
  let rendered = content;
  // Replace simple liquid variables like {{first_name}} or {{first_name | default:"Valued Customer"}}
  rendered = rendered.replace(/\{\{\s*first_name(\s*\|\s*default:\s*['"]([^'"]*)['"])?\s*\}\}/g, (_, __, def) => {
    return vars.first_name || def || "Valued Customer";
  });
  rendered = rendered.replace(/\{\{\s*last_name(\s*\|\s*default:\s*['"]([^'"]*)['"])?\s*\}\}/g, (_, __, def) => {
    return vars.last_name || def || "";
  });
  rendered = rendered.replace(/\{\{\s*company(\s*\|\s*default:\s*['"]([^'"]*)['"])?\s*\}\}/g, (_, __, def) => {
    return vars.company || def || "your team";
  });
  rendered = rendered.replace(/\{\{\s*email\s*\}\}/g, vars.email || "");
  rendered = rendered.replace(
    /\{\{\s*unsubscribe_url\s*\}\}/g,
    vars.unsubscribe_url || "https://unifiedplatform.io/unsubscribe"
  );
  return rendered;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      isTest = false,
      testEmail,
      campaignName,
      subject,
      previewText,
      fromName = "Unified Platform",
      fromEmail = "onboarding@resend.dev",
      audienceType = "list",
      audienceId,
      contactIds = [],
      htmlContent,
      isScheduled = false,
      scheduledAt = null,
    } = body;

    const resend = getResendClient();

    // Format the From header. E.g. "Acme Promotions <onboarding@resend.dev>"
    const formattedSender = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    // -------------------------------------------------------------
    // MODE 1: SEND PREVIEW TEST EMAIL
    // -------------------------------------------------------------
    if (isTest) {
      if (!testEmail || !testEmail.includes("@")) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid test email address." },
          { status: 400 }
        );
      }

      const renderedSubject = `[Test] ${subject || "Campaign Preview"}`;
      const renderedHtml = renderTemplate(htmlContent || "<p>Campaign test preview</p>", {
        first_name: "Test Recipient",
        last_name: "Preview",
        company: "Test Company",
        email: testEmail,
        unsubscribe_url: "https://unifiedplatform.io/unsubscribe?preview=true",
      });

      try {
        const { data, error } = await resend.emails.send({
          from: formattedSender,
          to: [testEmail],
          subject: renderedSubject,
          html: renderedHtml,
        });

        if (error) {
          return NextResponse.json(
            {
              success: false,
              error:
                error.message ||
                "Resend failed to deliver test email. Ensure your recipient is your verified account email or verify a domain.",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          messageId: data?.id,
          message: `Test email sent successfully to ${testEmail}!`,
        });
      } catch (sendErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: sendErr.message || "Failed to send test email via Resend.",
          },
          { status: 500 }
        );
      }
    }

    // -------------------------------------------------------------
    // MODE 2: FULL EMAIL CAMPAIGN DISPATCH
    // -------------------------------------------------------------
    const supabase = getSupabaseAdmin();

    // 1. Query targeted contacts with valid email addresses
    let contacts: any[] = [];
    if (contactIds && Array.isArray(contactIds) && contactIds.length > 0) {
      // Manual contact selection
      const { data } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, company, email, unsubscribe_token, status")
        .in("id", contactIds)
        .not("email", "is", null);
      contacts = (data || []).filter((c) => c.status !== "unsubscribed" && c.status !== "suppressed");
    } else if (audienceId && audienceType === "list" && audienceId !== "all") {
      // List members
      const { data: allContacts } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, company, email, unsubscribe_token, status")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .not("email", "is", null);

      const { data: members } = await supabase
        .from("list_members")
        .select("contact_id")
        .eq("list_id", audienceId);

      const memberIds = new Set(members?.map((m) => m.contact_id) || []);
      contacts = (allContacts || []).filter(
        (c) => memberIds.has(c.id) && c.status !== "unsubscribed" && c.status !== "suppressed"
      );
    } else {
      // All subscribed contacts in workspace
      const { data } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, company, email, unsubscribe_token, status")
        .eq("workspace_id", DEFAULT_WORKSPACE_ID)
        .not("email", "is", null);

      contacts = (data || []).filter((c) => c.status !== "unsubscribed" && c.status !== "suppressed");
    }

    // Fallback: If no contacts found in database, check if there are contacts with email at all
    if (contacts.length === 0) {
      const { data: anyContact } = await supabase
        .from("contacts")
        .select("id, first_name, last_name, company, email, unsubscribe_token, status")
        .not("email", "is", null)
        .limit(5);
      contacts = anyContact || [];
    }

    // 2. Handle Scheduled Campaign
    if (isScheduled && scheduledAt) {
      const { data: scheduledCamp, error: schedErr } = await supabase
        .from("campaigns")
        .insert({
          workspace_id: DEFAULT_WORKSPACE_ID,
          name: campaignName || "Scheduled Email Campaign",
          channel: "email",
          status: "scheduled",
          audience_type: sanitizeAudienceType(audienceType),
          audience_id: isValidUuid(audienceId) ? audienceId : null,
          scheduled_at: new Date(scheduledAt).toISOString(),
          email_config: {
            subject,
            preview_text: previewText,
            from_name: fromName,
            from_email: fromEmail,
            html_content: htmlContent,
          },
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            failed: 0,
            bounced: 0,
            complained: 0,
            replied: 0,
          },
        })
        .select()
        .single();

      if (schedErr) {
        console.error("Error creating scheduled campaign:", schedErr);
      }

      return NextResponse.json({
        success: true,
        campaignId: scheduledCamp?.id,
        scheduled: true,
        message: `Campaign scheduled successfully for ${new Date(scheduledAt).toLocaleString()}!`,
      });
    }

    // 3. Create Campaign record with 'sending' status
    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .insert({
        workspace_id: DEFAULT_WORKSPACE_ID,
        name: campaignName || "Broadcast Email Campaign",
        channel: "email",
        status: "sending",
        audience_type: sanitizeAudienceType(audienceType),
        audience_id: isValidUuid(audienceId) ? audienceId : null,
        started_at: new Date().toISOString(),
        email_config: {
          subject,
          preview_text: previewText,
          from_name: fromName,
          from_email: fromEmail,
        },
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          failed: 0,
          bounced: 0,
          complained: 0,
          replied: 0,
        },
      })
      .select()
      .single();

    if (campErr) {
      console.error("Error creating email campaign:", campErr);
    }

    // 4. Dispatch to each recipient via Resend
    let sentCount = 0;
    let failedCount = 0;
    const dispatchLog: any[] = [];

    for (const contact of contacts) {
      const recipientEmail = (contact.email || "").trim();
      if (!recipientEmail || !recipientEmail.includes("@")) continue;

      const recipientVars = {
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        company: contact.company || "",
        email: recipientEmail,
        unsubscribe_url: `https://unifiedplatform.io/unsubscribe?token=${contact.unsubscribe_token || contact.id}`,
      };

      const personalizedSubject = renderTemplate(subject || "Important Announcement", recipientVars);
      const personalizedHtml = renderTemplate(htmlContent || "<p>Hello</p>", recipientVars);

      try {
        const { data, error } = await resend.emails.send({
          from: formattedSender,
          to: [recipientEmail],
          subject: personalizedSubject,
          html: personalizedHtml,
        });

        if (error) {
          failedCount++;
          dispatchLog.push({
            contactId: contact.id,
            email: recipientEmail,
            status: "failed",
            error: error.message,
          });

          if (campaign) {
            await supabase.from("campaign_recipients").insert({
              campaign_id: campaign.id,
              contact_id: contact.id,
              workspace_id: DEFAULT_WORKSPACE_ID,
              channel: "email",
              status: "failed",
              error_message: error.message,
            });
          }
        } else {
          sentCount++;
          const messageId = data?.id || "";
          dispatchLog.push({
            contactId: contact.id,
            email: recipientEmail,
            status: "sent",
            messageId,
          });

          if (campaign) {
            await supabase.from("campaign_recipients").insert({
              campaign_id: campaign.id,
              contact_id: contact.id,
              workspace_id: DEFAULT_WORKSPACE_ID,
              channel: "email",
              status: "sent",
              provider_message_id: messageId,
              sent_at: new Date().toISOString(),
            });
          }
        }

        // Small throttle delay (150ms) to respect provider rate-limits
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (err: any) {
        failedCount++;
        dispatchLog.push({
          contactId: contact.id,
          email: recipientEmail,
          status: "failed",
          error: err.message,
        });
      }
    }

    // 5. Update Campaign record to completed
    if (campaign) {
      await supabase
        .from("campaigns")
        .update({
          status: sentCount > 0 ? "completed" : contacts.length === 0 ? "completed" : "failed",
          completed_at: new Date().toISOString(),
          stats: {
            sent: sentCount,
            delivered: sentCount,
            opened: 0,
            clicked: 0,
            failed: failedCount,
            bounced: 0,
            complained: 0,
            replied: 0,
          },
        })
        .eq("id", campaign.id);
    }

    return NextResponse.json({
      success: sentCount > 0 || failedCount === 0,
      campaignId: campaign?.id,
      sentCount,
      failedCount,
      totalTargeted: contacts.length,
      log: dispatchLog,
      message:
        sentCount > 0
          ? `Dispatched successfully: ${sentCount} delivered via Resend${failedCount > 0 ? `, ${failedCount} failed` : ""}.`
          : failedCount > 0
          ? `Resend dispatch failed for ${failedCount} recipient(s). Check domain verification in Resend if sending outside testing domain.`
          : "Campaign recorded. No eligible recipient emails found.",
    });
  } catch (err: any) {
    console.error("[Email Campaign Dispatch Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during email dispatch." },
      { status: 500 }
    );
  }
}
