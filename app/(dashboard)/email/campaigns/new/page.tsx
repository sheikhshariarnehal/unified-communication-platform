"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Check,
  SendHorizontal,
  Users,
  Sparkles,
  Calendar,
  AlertCircle,
  Eye,
  Send,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { mockSendingDomains, mockEmailTemplates } from "@/lib/email/service";
import { mockLists, mockSegments } from "@/lib/contacts/service";

export default function NewEmailCampaignWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [campaignName, setCampaignName] = useState("Fall Product Announcement 2026");
  const [subject, setSubject] = useState("{{first_name}}, meet your new customer portal");
  const [previewText, setPreviewText] = useState("Synchronize your communications faster than ever before.");
  const [fromName, setFromName] = useState("Acme Global Team");
  const [fromEmail, setFromEmail] = useState("newsletter@mail.acmeglobal.com");
  const [audienceType, setAudienceType] = useState<"list" | "segment" | "all">("list");
  const [audienceId, setAudienceId] = useState(mockLists[0].id);
  const [htmlContent, setHtmlContent] = useState(mockEmailTemplates[0].html_content || "");
  const [testEmail, setTestEmail] = useState("founder@acmeglobal.com");
  const [testSent, setTestSent] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const estimatedRecipients =
    audienceType === "list"
      ? mockLists.find((l) => l.id === audienceId)?.member_count || 12450
      : audienceType === "segment"
      ? mockSegments.find((s) => s.id === audienceId)?.contact_count || 2480
      : 12450;

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleLaunch = () => {
    router.push("/email/campaigns");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <Link
          href="/email/campaigns"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Create Email Campaign
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Follow the 5-step wizard to configure, personalize, validate, and launch your campaign.
        </p>
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
          <div
            key={s.num}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
              step === s.num
                ? "bg-primary/20 border-primary/40 text-primary shadow-sm"
                : step > s.num
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-secondary/60 border-border text-muted-foreground"
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Step 1: Campaign Setup */}
      {step === 1 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            Campaign Setup & Sender Details
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
                Subject Line (Supports Liquid variables)
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. {{first_name}}, special promotion inside"
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Preview / Preheader Text
              </label>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Short teaser shown in customer inbox preview..."
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
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/90 mb-1">
                  From Email (Must belong to verified domain)
                </label>
                <select
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="newsletter@mail.acmeglobal.com">
                    newsletter@mail.acmeglobal.com (Verified ✓)
                  </option>
                  <option value="promotions@mail.acmeglobal.com">
                    promotions@mail.acmeglobal.com (Verified ✓)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
            >
              <span>Next: Select Audience</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Audience */}
      {step === 2 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            Choose Target Audience
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {[
              { type: "list", title: "Static Contact List", desc: "Select a curated list" },
              { type: "segment", title: "Dynamic Segment", desc: "Rule-based live audience" },
              { type: "all", title: "All Subscribed", desc: "Entire workspace audience" },
            ].map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setAudienceType(t.type as any)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  audienceType === t.type
                    ? "bg-primary/20 border-primary/40 text-foreground shadow-sm"
                    : "bg-secondary/60 border-border text-muted-foreground hover:border-border"
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
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">
                  Estimated Clean Recipients
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Suppressed and unsubscribed addresses are automatically excluded.
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
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
            >
              <span>Next: Edit Content</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Content Design with Personalization */}
      {step === 3 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Email Content & Personalization
              </h2>
              <p className="text-xs text-muted-foreground">
                Insert dynamic merge tags using Liquid template syntax.
              </p>
            </div>

            {/* Variable insertion buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                "{{first_name | default:'Customer'}}",
                "{{company}}",
                "{{unsubscribe_url}}",
              ].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => setHtmlContent((prev) => prev + `\n${token}`)}
                  className="px-2 py-1 rounded bg-secondary border border-border text-[10px] text-primary font-mono hover:bg-secondary/80"
                >
                  + {token}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HTML Editor */}
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1">
                HTML Source
              </label>
              <textarea
                rows={14}
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 font-mono text-xs text-foreground/90 focus:outline-none focus:border-primary leading-relaxed"
              />
            </div>

            {/* Live Render Preview */}
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1">
                Live Preview
              </label>
              <div className="w-full h-[285px] bg-white rounded-xl overflow-auto shadow-inner border border-border">
                <iframe
                  title="Live Preview"
                  srcDoc={htmlContent.replace(
                    /\{\{first_name.*\}\}/g,
                    "Sarah"
                  )}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
            >
              <span>Next: Review & Pre-Flight</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pre-Flight Review & Test Send */}
      {step === 4 && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            Pre-Flight Checklist & Quality Audit
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check className="h-4 w-4" /> Domain Authenticated
              </div>
              <p className="text-[11px] text-muted-foreground">
                mail.acmeglobal.com has valid SPF, DKIM, and DMARC records.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Check className="h-4 w-4" /> Unsubscribe Link Included
              </div>
              <p className="text-[11px] text-muted-foreground">
                Automatic CAN-SPAM and GDPR compliant unsubscribe headers attached.
              </p>
            </div>
          </div>

          {/* Test Email Form */}
          <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-3">
            <label className="block text-xs font-semibold text-foreground/90">
              Send Test Email
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
              />
              <button
                type="button"
                onClick={handleSendTest}
                className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                <span>{testSent ? "Test Sent! ✓" : "Send Test"}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
            >
              <span>Next: Final Schedule & Launch</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Schedule or Dispatch Now */}
      {step === 5 && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            Schedule & Launch Campaign
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setIsScheduled(false)}
              className={`p-4 rounded-xl border text-left transition-all ${
                !isScheduled
                  ? "bg-primary/20 border-primary/40 text-foreground"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <SendHorizontal className="h-4 w-4 text-primary" />
                Send Immediately
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Queue message batch to background workers right now.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduled(true)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isScheduled
                  ? "bg-primary/20 border-primary/40 text-foreground"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Schedule for Later
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Pick specific date, time, and workspace timezone.
              </p>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <div className="text-xs font-semibold text-foreground/90">
              Ready to enqueue:
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Campaign: <strong className="text-foreground">{campaignName}</strong></div>
              <div>Subject: <strong className="text-foreground">{subject}</strong></div>
              <div>Target Audience: <strong className="text-emerald-400">{estimatedRecipients.toLocaleString()} Recipients</strong></div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-bold shadow-lg shadow-emerald-600/25"
            >
              <SendHorizontal className="h-4 w-4" />
              <span>{isScheduled ? "Schedule Campaign" : "Launch & Send Now"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
