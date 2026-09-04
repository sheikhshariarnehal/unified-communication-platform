"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Info,
  Layers,
  Tag,
  Palette,
  User,
} from "lucide-react";

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  verifiedName?: string;
  displayPhoneNumber?: string;
  qualityRating?: string;
  throughputLevel?: string;
  metaId?: string;
}

export default function WhatsAppConfigPage() {
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("unified_webhook_token");
  const [showToken, setShowToken] = useState(false);

  // Status & states
  const [isConnected, setIsConnected] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const [maskedToken, setMaskedToken] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [callbackUrl, setCallbackUrl] = useState(
    "https://unified-communication-platform-xi.vercel.app/api/webhooks/whatsapp"
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Accordion state for Setup Instructions
  const [openStep, setOpenStep] = useState<number | null>(1);

  // Dynamic origin detection on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCallbackUrl(`${window.location.origin}/api/webhooks/whatsapp`);
    }
  }, []);

  // Fetch current config on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/whatsapp/config");
        if (res.ok) {
          const data = await res.json();
          if (data.phoneNumberId) setPhoneNumberId(data.phoneNumberId);
          if (data.wabaId) setWabaId(data.wabaId);
          if (data.webhookVerifyToken) setWebhookVerifyToken(data.webhookVerifyToken);
          if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
          if (data.displayName) setDisplayName(data.displayName);
          if (data.hasToken) setHasStoredToken(true);
          if (data.maskedToken) setMaskedToken(data.maskedToken);
          setIsConnected(Boolean(data.connected));
        }
      } catch (err) {
        console.error("Failed to load WhatsApp config:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          phoneNumberId,
          wabaId,
          accessToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(data);
        setIsConnected(true);
        if (data.displayPhoneNumber) setPhoneNumber(data.displayPhoneNumber);
        if (data.verifiedName) setDisplayName(data.verifiedName);
      } else {
        setTestResult({
          success: false,
          error: data.error || "Connection test failed. Please verify credentials.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || "Failed to reach verification endpoint.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          phoneNumberId,
          wabaId,
          accessToken,
          webhookVerifyToken,
          phoneNumber: phoneNumber || (testResult?.displayPhoneNumber ?? ""),
          displayName: displayName || (testResult?.verifiedName ?? ""),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({
          success: true,
          message: data.message || "Configuration saved successfully!",
        });
        setIsConnected(true);
        if (data.maskedToken) {
          setMaskedToken(data.maskedToken);
          setHasStoredToken(true);
          setAccessToken(""); // clear cleartext input once stored
        }
      } else {
        setSaveStatus({
          success: false,
          message: data.error || "Failed to save configuration.",
        });
      }
    } catch (err: any) {
      setSaveStatus({
        success: false,
        message: err.message || "Network error while saving configuration.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStep = (step: number) => {
    setOpenStep(openStep === step ? null : step);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Subtitle */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Manage your profile, WhatsApp® integration, message templates, and tags.
        </p>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-card/60 backdrop-blur-md border border-border rounded-xl w-fit overflow-x-auto max-w-full">
          <Link
            href="/settings/workspace"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile</span>
          </Link>

          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 text-primary border border-primary/25 shadow-2xs shrink-0"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp Config</span>
          </button>

          <Link
            href="/whatsapp/templates"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Templates</span>
          </Link>

          <Link
            href="/contacts/tags"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Tags</span>
          </Link>

          <Link
            href="/settings/workspace"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Appearance</span>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Config Form (7 or 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-4 ${
              isConnected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isConnected
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">
                  {isConnected ? "Connected & Operational" : "Not Connected"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {isConnected
                    ? `${displayName || "WhatsApp Business"} · ${phoneNumber || phoneNumberId || "Active"} · Meta Cloud API v21.0`
                    : "Configure your Meta API credentials below to connect your WhatsApp Business account."}
                </div>
              </div>
            </div>

            {isConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live API
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Card 1: API Credentials */}
            <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  API Credentials
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter your Meta WhatsApp Business API credentials.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {/* Phone Number ID */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="e.g. 100234567890123"
                    className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                </div>

                {/* WhatsApp Business Account ID */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                    WhatsApp Business Account ID
                  </label>
                  <input
                    type="text"
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="e.g. 100234567890456"
                    className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                </div>

                {/* Permanent Access Token */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-foreground/90">
                      Permanent Access Token
                    </label>
                    {hasStoredToken && !accessToken && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Stored ({maskedToken})
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder={
                        hasStoredToken
                          ? "Leave blank to keep stored token, or enter new token"
                          : "Enter your access token"
                      }
                      className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background border border-border rounded-xl pl-3.5 pr-10 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      title={showToken ? "Hide token" : "Show token"}
                    >
                      {showToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Webhook Verify Token */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-1">
                    Webhook Verify Token
                  </label>
                  <input
                    type="text"
                    value={webhookVerifyToken}
                    onChange={(e) => setWebhookVerifyToken(e.target.value)}
                    placeholder="Create a custom verify token"
                    className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Custom string you create. Must match the token you set in Meta webhook settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Webhook Configuration */}
            <div className="glass-panel p-6 rounded-2xl border border-border space-y-4">
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  Webhook Configuration
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use this URL as your webhook callback in the Meta App Dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                  Webhook Callback URL
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="w-full bg-secondary/30 border border-border rounded-xl pl-3.5 pr-24 py-2 text-xs text-foreground/90 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="absolute right-1.5 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card hover:bg-secondary border border-border text-xs font-medium text-foreground transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Test Result or Save Feedback */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border animate-in fade-in ${
                  testResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
                  )}
                  <div className="text-xs space-y-1">
                    <div className="font-semibold">
                      {testResult.success ? "Meta API Verified" : "Verification Failed"}
                    </div>
                    {testResult.success ? (
                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        <p>Verified Name: <strong className="text-foreground">{testResult.verifiedName}</strong></p>
                        <p>Display Number: <strong className="text-foreground">{testResult.displayPhoneNumber}</strong></p>
                        <p>Quality Rating: <span className="text-emerald-400 font-semibold">{testResult.qualityRating}</span></p>
                      </div>
                    ) : (
                      <p className="text-[11px]">{testResult.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {saveStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                  saveStatus.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {saveStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{saveStatus.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving || isTesting}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25 disabled:opacity-50 transition-all active:scale-95"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Configuration...</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isSaving || !phoneNumberId}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Testing Meta Graph API...</span>
                  </>
                ) : (
                  <>
                    <Radio className="h-3.5 w-3.5 text-primary" />
                    <span>Test API Connection</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Setup Instructions (4 or 5 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Setup Instructions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Follow these steps to connect your WhatsApp Business API.
              </p>
            </div>

            {/* Accordion Steps */}
            <div className="space-y-2.5 pt-1">
              {/* Step 1 */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-card/40 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleStep(1)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold">
                      1
                    </span>
                    <span>Create a Meta App</span>
                  </div>
                  {openStep === 1 ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                {openStep === 1 && (
                  <div className="p-3.5 pt-0 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 space-y-2">
                    <p>
                      Log in to{" "}
                      <a
                        href="https://developers.facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-foreground hover:underline font-semibold"
                      >
                        developers.facebook.com
                      </a>{" "}
                      and click <strong>My Apps</strong> &gt; <strong>Create App</strong>.
                    </p>
                    <p>
                      Select <strong>Other</strong> as your use case, then choose <strong>Business</strong> as the app type. Enter your app name and select your Meta Business Portfolio.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-card/40 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleStep(2)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold">
                      2
                    </span>
                    <span>Add WhatsApp Product</span>
                  </div>
                  {openStep === 2 ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                {openStep === 2 && (
                  <div className="p-3.5 pt-0 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 space-y-2">
                    <p>
                      In your Meta App Dashboard, find <strong>WhatsApp</strong> in the product list and click <strong>Set up</strong>.
                    </p>
                    <p>
                      Choose or link your Meta Business Portfolio and accept the WhatsApp Business Terms of Service.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3 */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-card/40 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleStep(3)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold">
                      3
                    </span>
                    <span>Get API Credentials</span>
                  </div>
                  {openStep === 3 ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                {openStep === 3 && (
                  <div className="p-3.5 pt-0 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 space-y-2">
                    <p>
                      In the left sidebar, navigate to <strong>WhatsApp</strong> &gt; <strong>API Setup</strong>.
                    </p>
                    <p>
                      Copy your <strong>Phone Number ID</strong> and <strong>WhatsApp Business Account ID</strong>.
                    </p>
                    <p>
                      For a permanent token, go to <strong>Meta Business Settings &gt; System Users</strong>, create a system user, assign WhatsApp permissions (<code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code>), and generate a non-expiring token.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 4 */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-card/40 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleStep(4)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-[11px] font-bold">
                      4
                    </span>
                    <span>Configure Webhooks</span>
                  </div>
                  {openStep === 4 ? (
                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                {openStep === 4 && (
                  <div className="p-3.5 pt-0 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 space-y-2">
                    <p>
                      In Meta, click <strong>Configuration</strong> under WhatsApp.
                    </p>
                    <p>
                      Click <strong>Edit</strong> next to Webhook, paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> from this page, and click <strong>Verify and Save</strong>.
                    </p>
                    <p>
                      Under Webhook fields, click <strong>Manage</strong> and subscribe to <code>messages</code> and <code>message_template_status_update</code>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* External Documentation Link */}
            <div className="pt-2 border-t border-border">
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between text-xs text-foreground/90 hover:text-primary font-semibold transition-colors py-1 group"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Meta WhatsApp API Documentation
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Tips card */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <Info className="h-3.5 w-3.5 text-primary" />
              Direct WhatsApp Web Fast Dispatcher
            </div>
            <p className="text-[11px] leading-relaxed">
              Don't have a Meta Business Account yet? You can still bulk dispatch messages to Google Maps scraped leads right away using our client-side WhatsApp Web runner in{" "}
              <Link
                href="/whatsapp/campaigns/new"
                className="text-foreground hover:underline font-semibold"
              >
                Campaigns &gt; New WhatsApp Blast
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
