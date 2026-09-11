import { Resend } from "resend";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not configured.");
  }
  return new Resend(apiKey);
}

export interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
}

export async function sendEmail({
  from,
  to,
  subject,
  html,
  replyTo,
  headers,
}: SendEmailOptions) {
  const resend = getResendClient();
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
    headers,
  });
}
