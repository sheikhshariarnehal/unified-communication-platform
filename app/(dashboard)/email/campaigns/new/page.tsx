"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Check,
  SendHorizontal,
  Users,
  Calendar,
  AlertCircle,
  Eye,
  Send,
  Clock,
  ShieldCheck,
  Loader2,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { mockSendingDomains, mockEmailTemplates } from "@/lib/email/service";
import { mockLists, mockSegments, getContacts } from "@/lib/contacts/service";
import { Contact } from "@/types/database";

export default function NewEmailCampaignWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [campaignName, setCampaignName] = useState("Product Announcement 2026");
  const [subject, setSubject] = useState("{{first_name}}, welcome to our platform");
  const [previewText, setPreviewText] = useState("Synchronize your communications faster than ever before.");
  const [fromName, setFromName] = useState("Unified Platform Team");
  const [fromEmail, setFromEmail] = useState("onboarding@resend.dev");
  const [customFromEmail, setCustomFromEmail] = useState("");
  const [isCustomFrom, setIsCustomFrom] = useState(false);
  const [audienceType, setAudienceType] = useState<"all" | "list" | "segment">("all");
  const [audienceId, setAudienceId] = useState(mockLists[0].id);
  const [htmlContent, setHtmlContent] = useState(mockEmailTemplates[0].html_content || "");

  // Pre-flight & Test State
  const [testEmail, setTestEmail] = useState("info.nehal.bd@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    type: "success" | "error";
    message: string;
    messageId?: string;
  } | null>(null);

  // Launch State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<{
    type: "success" | "error";
    message: string;
    sentCount?: number;
    failedCount?: number;
  } | null>(null);

  // Real Contacts State
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  useEffect(() => {
    async function loadContacts() {
      const data = await getContacts();
      if (data && data.length > 0) {
        setAvailableContacts(data.filter((c) => Boolean(c.email)));
      }
    }
    loadContacts();
  }, []);

  const activeFromEmail = isCustomFrom && customFromEmail.trim() ? customFromEmail.trim() : fromEmail;

  const estimatedRecipients =
    audienceType === "all"
      ? availableContacts.length > 0
        ? availableContacts.length
        : 10
      : audienceType === "list"
      ? mockLists.find((l) => l.id === audienceId)?.member_count || 10
      : mockSegments.find((s) => s.id === audienceId)?.contact_count || 5;

  // Send Test Email via Resend
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestStatus({
        type: "error",
        message: "Please enter a valid email address for the test.",
      });
      return;
    }

    setIsSendingTest(true);
    setTestStatus(null);

    try {
      const res = await fetch("/api/email/campaigns/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isTest: true,
          testEmail,
          subject,
          previewText,
          fromName,
          fromEmail: activeFromEmail,
          htmlContent,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestStatus({
          type: "success",
          message: `Preview test email successfully delivered to ${testEmail}! (Resend ID: ${data.messageId})`,
          messageId: data.messageId,
        });
      } else {
        setTestStatus({
          type: "error",
          message: data.error || "Failed to deliver test email via Resend.",
        });
      }
    } catch (err: any) {
      setTestStatus({
        type: "error",
        message: err.message || "Network error while calling email dispatch service.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Launch Full Campaign
  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchStatus(null);

    try {
      const res = await fetch("/api/email/campaigns/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isTest: false,
          campaignName,
          subject,
          previewText,
          fromName,
          fromEmail: activeFromEmail,
          audienceType,
          audienceId,
          htmlContent,
          isScheduled,
          scheduledAt: isScheduled ? scheduledAt : null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLaunchStatus({
          type: "success",
          message: data.message || "Email campaign launched successfully!",
          sentCount: data.sentCount,
          failedCount: data.failedCount,
        });

        // Redirect to campaigns table after 2 seconds
        setTimeout(() => {
          router.push("/email/campaigns");
        }, 2200);
      } else {
        setLaunchStatus({
          type: "error",
          message:
            data.error ||
            "Campaign launch could not be completed. Check Resend domain verification if sending to outside addresses.",
        });
        setIsLaunching(false);
      }
    } catch (err: any) {
      setLaunchStatus({
        type: "error",
        message: err.message || "Network error while launching campaign.",
      });
      setIsLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <Link
          href="/email/campaigns"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Campaigns
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Create Email Campaign
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Configure, personalize with dynamic merge tags, test delivery with Resend, and broadcast.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Resend Connected
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { num: 1, title: "1. Setup" },
          { num: 2, title: "2. Audience" },
          { num: 3, title: "3. Content" },
          { num: 4, title: "4. Review" },
          { num: 5, title: "5. Send" },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num as any)}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
              step === s.num
                ? "bg-primary/20 border-primary/40 text-primary shadow-sm ring-1 ring-primary/30"
                : step > s.num
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Step 1: Campaign Setup */}
      {step === 1 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-border">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Campaign Setup & Sender Details</span>
            <span className="text-[11px] font-normal text-muted-foreground">Step 1 of 5</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Internal Campaign Name
              </label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Q3 Product Announcement"
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Subject Line (Supports dynamic Liquid tags)
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. {{first_name}}, meet your new customer portal"
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Example: <code className="text-primary font-mono">{`{{first_name}}`}</code> will automatically personalize to recipient's name.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Preview / Preheader Text
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Short teaser snippet shown in recipient's inbox preview..."
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground/90 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  required
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your Company or Team"
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/90 mb-1">
                  From Email
                </label>
                {!isCustomFrom ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="onboarding@resend.dev">
                          onboarding@resend.dev (Resend Sandbox ✓)
                        </option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsCustomFrom(true)}
                        className="text-[11px] text-primary hover:underline whitespace-nowrap px-2"
                      >
                        Custom Domain?
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3 text-primary flex-shrink-0" />
                      <span>
                        Resend testing domain delivers to your registered Resend account email (
                        <code className="text-foreground">info.nehal.bd@gmail.com</code>).
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={customFromEmail}
                        onChange={(e) => setCustomFromEmail(e.target.value)}
                        placeholder="updates@yourdomain.com"
                        className="flex-1 bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomFrom(false)}
                        className="text-[11px] text-muted-foreground hover:text-foreground whitespace-nowrap px-2"
                      >
                        Use Sandbox
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Ensure your custom domain is verified in your{" "}
                      <a
                        href="https://resend.com/domains"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        Resend Domains Dashboard
                      </a>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <span>Next: Select Audience</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Audience */}
      {step === 2 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-border">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Choose Target Audience</span>
            <span className="text-[11px] font-normal text-muted-foreground">Step 2 of 5</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { type: "all", title: "All Subscribed", desc: "Every contact with a verified email" },
              { type: "list", title: "Contact List", desc: "Target a specific curated list" },
              { type: "segment", title: "Dynamic Segment", desc: "Filter by rules or behavior" },
            ].map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setAudienceType(t.type as any)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  audienceType === t.type
                    ? "bg-primary/20 border-primary/50 text-foreground shadow-sm ring-1 ring-primary/30"
                    : "bg-secondary/60 border-border text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <div className="text-xs font-semibold text-foreground">{t.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{t.desc}</div>
              </button>
            ))}
          </div>

          {audienceType === "list" && (
            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Choose List
              </label>
              <select
                value={audienceId}
                onChange={(e) => setAudienceId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                {mockLists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.member_count} contacts)
                  </option>
                ))}
              </select>
            </div>
          )}

          {audienceType === "segment" && (
            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Choose Dynamic Segment
              </label>
              <select
                value={audienceId}
                onChange={(e) => setAudienceId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                {mockSegments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (~{s.contact_count} contacts)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Recipient summary card */}
          <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">
                  Target Clean Recipients
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Suppressed, bounced, and unsubscribed contacts are automatically filtered out.
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {estimatedRecipients.toLocaleString()}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <span>Next: Edit Content</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Content Design with Personalization */}
      {step === 3 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Email Content & HTML Design
              </h2>
              <p className="text-xs text-muted-foreground">
                Insert dynamic Liquid variables that auto-populate per recipient.
              </p>
            </div>

            {/* Variable insertion buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: "{{first_name}}", token: "{{first_name | default:'Valued Customer'}}" },
                { label: "{{company}}", token: "{{company}}" },
                { label: "{{email}}", token: "{{email}}" },
                { label: "{{unsubscribe_url}}", token: "{{unsubscribe_url}}" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setHtmlContent((prev) => prev + `\n${item.token}`)}
                  className="px-2.5 py-1 rounded-lg bg-secondary border border-border text-[11px] text-primary font-mono hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  + {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HTML Editor */}
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1">
                HTML Source Code
              </label>
              <textarea
                rows={15}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 font-mono text-xs text-foreground/90 focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>

            {/* Live Render Preview */}
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1">
                Live Inbox Render Preview
              </label>
              <div className="w-full h-[305px] bg-slate-950 rounded-xl overflow-auto shadow-inner border border-border">
                <iframe
                  title="Live Preview"
                  srcDoc={htmlContent
                    .replace(/\{\{first_name.*\}\}/g, "Sheikh")
                    .replace(/\{\{company.*\}\}/g, "Acme Global")
                    .replace(/\{\{unsubscribe_url.*\}\}/g, "#")}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <span>Next: Review & Pre-Flight</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pre-Flight Review & Live Test Send */}
      {step === 4 && (
        <div className="glass-panel p-6 rounded-2xl space-y-6 border border-border">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Pre-Flight Quality Audit & Inbox Test Send</span>
            <span className="text-[11px] font-normal text-muted-foreground">Step 4 of 5</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> Resend API Connected
              </div>
              <p className="text-[11px] text-muted-foreground">
                Sender: <strong className="text-foreground">{activeFromEmail}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check className="h-4 w-4" /> Compliance & Unsubscribe Headers
              </div>
              <p className="text-[11px] text-muted-foreground">
                Automatic CAN-SPAM and GDPR opt-out tokens embedded per recipient.
              </p>
            </div>
          </div>

          {/* Test Email Form */}
          <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/90">
                Send Live Preview Test to Your Inbox
              </label>
              <p className="text-[11px] text-muted-foreground">
                Deliver a real email right now to inspect appearance in your personal email client.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="info.nehal.bd@gmail.com"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={isSendingTest}
                onClick={handleSendTest}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Send Feedback Alert */}
            {testStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  testStatus.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                {testStatus.type === "success" ? (
                  <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-400" />
                )}
                <div className="flex-1 leading-relaxed">{testStatus.message}</div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <span>Next: Final Launch</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Schedule or Dispatch Now */}
      {step === 5 && (
        <div className="glass-panel p-6 rounded-2xl space-y-6 border border-border">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3 flex items-center justify-between">
            <span>Schedule or Broadcast Campaign</span>
            <span className="text-[11px] font-normal text-muted-foreground">Step 5 of 5</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsScheduled(false)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                !isScheduled
                  ? "bg-primary/20 border-primary/50 text-foreground shadow-sm ring-1 ring-primary/30"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <SendHorizontal className="h-4 w-4 text-primary" />
                Send Immediately
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Queue message batch to Resend API right now.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduled(true)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isScheduled
                  ? "bg-primary/20 border-primary/50 text-foreground shadow-sm ring-1 ring-primary/30"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Schedule for Later
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Pick a specific future date and time for automatic dispatch.
              </p>
            </button>
          </div>

          {isScheduled && (
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <label className="block text-xs font-semibold text-foreground/90">
                Scheduled Dispatch Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full sm:w-72 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {/* Review Summary Box */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <div className="text-xs font-semibold text-foreground/90">
              Ready to Dispatch:
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Campaign Name: <strong className="text-foreground">{campaignName}</strong>
              </div>
              <div>
                Subject Line: <strong className="text-foreground">{subject}</strong>
              </div>
              <div>
                Sender:{" "}
                <strong className="text-foreground">
                  {fromName} &lt;{activeFromEmail}&gt;
                </strong>
              </div>
              <div>
                Target Audience:{" "}
                <strong className="text-emerald-400">
                  {estimatedRecipients.toLocaleString()} Recipients
                </strong>
              </div>
            </div>
          </div>

          {/* Launch Status Feedback */}
          {launchStatus && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                launchStatus.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}
            >
              {launchStatus.type === "success" ? (
                <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-400" />
              )}
              <div className="flex-1 leading-relaxed">
                <div>{launchStatus.message}</div>
                {launchStatus.type === "success" && (
                  <div className="text-[11px] text-emerald-500 mt-1">
                    Redirecting to campaigns overview in 2 seconds...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(4)}
              disabled={isLaunching}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleLaunch}
              disabled={isLaunching || (isScheduled && !scheduledAt)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {isScheduled ? "Scheduling..." : "Broadcasting via Resend..."}
                  </span>
                </>
              ) : (
                <>
                  <SendHorizontal className="h-4 w-4" />
                  <span>
                    {isScheduled ? "Confirm Schedule" : "Launch & Send Now"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
