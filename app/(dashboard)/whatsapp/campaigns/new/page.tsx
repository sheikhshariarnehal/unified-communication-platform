"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Check,
  Smartphone,
  Users,
  ShieldCheck,
  SendHorizontal,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
  X,
  Play,
  Pause,
  SkipForward,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  RefreshCw,
  AlertCircle,
  Clock,
  Radio,
  Sliders,
} from "lucide-react";
import { mockWhatsAppAccounts } from "@/lib/whatsapp/service";
import { mockLists, mockSegments, getLists, getListContacts } from "@/lib/contacts/service";
import { ContactList, Contact } from "@/types/database";

export default function NewWhatsAppCampaignWizardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading campaign wizard...</div>}>
      <WizardContent />
    </Suspense>
  );
}

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const initialName = searchParams.get("name") || "Google Maps Lead Outreach";
  const initialListId = searchParams.get("listId");

  const [campaignName, setCampaignName] = useState(initialName);
  const [dispatchMode, setDispatchMode] = useState<"web_runner" | "meta_api">("web_runner");
  const [accountId, setAccountId] = useState(mockWhatsAppAccounts[0].id);
  const [audienceType, setAudienceType] = useState<"list" | "segment">(
    initialListId ? "list" : "segment"
  );
  const [audienceId, setAudienceId] = useState(initialListId || mockSegments[1].id);
  const [availableLists, setAvailableLists] = useState<ContactList[]>(mockLists);

  // Templates
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([
    {
      id: "hello_world",
      name: "hello_world",
      category: "UTILITY",
      language: "en_US",
      status: "APPROVED",
      body_text: "Welcome and congratulations! This message confirms that your WhatsApp Business Cloud API integration is live.",
      isMetaDefault: true,
    },
    {
      id: "order_shipping_update_v2",
      name: "order_shipping_update_v2",
      category: "UTILITY",
      language: "en_US",
      status: "APPROVED",
      body_text: "Hello {{1}}, your order {{2}} has been shipped via express courier. Track: {{3}}",
    },
  ]);
  const [selectedTemplateName, setSelectedTemplateName] = useState("hello_world");

  // Real Contacts State
  const [listContacts, setListContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  // Custom Message Template for Direct WhatsApp Web Runner
  const [customMessage, setCustomMessage] = useState(
    "Assalamu Alaikum {{businessName}},\n\nI found your store on Google Maps! We offer direct wholesale supply and exclusive discounts for {{category}} stores in {{city}}.\n\nWould you like me to send over our price catalog?"
  );

  // Variable Mappings (Meta Cloud API mode)
  const [var1, setVar1] = useState("company");
  const [var2, setVar2] = useState("category");

  // Web Runner State
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [runnerIndex, setRunnerIndex] = useState(0);
  const [sentContactIds, setSentContactIds] = useState<string[]>([]);
  const [skippedContactIds, setSkippedContactIds] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-Pacing State
  const [isAutoPacing, setIsAutoPacing] = useState(false);
  const [pacingIntervalSec, setPacingIntervalSec] = useState(5);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Meta API Server Dispatch State
  const [isDispatchingServer, setIsDispatchingServer] = useState(false);
  const [serverDispatchResult, setServerDispatchResult] = useState<any | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // Load lists on mount
  useEffect(() => {
    async function loadLists() {
      const lists = await getLists();
      if (lists && lists.length > 0) {
        setAvailableLists(lists);
        if (initialListId) {
          setAudienceId(initialListId);
          setAudienceType("list");
        }
      }
    }
    loadLists();
  }, [initialListId]);

  // Load available templates from API
  useEffect(() => {
    fetch("/api/whatsapp/templates")
      .then((r) => r.json())
      .then((data) => {
        if (data.templates && data.templates.length > 0) {
          setAvailableTemplates(data.templates);
          setSelectedTemplateName(data.templates[0].name);
        }
      })
      .catch(() => {});
  }, []);

  // Load contacts for chosen list
  useEffect(() => {
    if (audienceType === "list" && audienceId) {
      setIsLoadingContacts(true);
      getListContacts(audienceId)
        .then((contacts) => {
          // Filter to only contacts with valid phone numbers
          const valid = (contacts || []).filter(
            (c) => c.phone && c.phone.replace(/[^0-9]/g, "").length >= 7
          );
          setListContacts(valid);
        })
        .catch((err) => console.error("Error loading contacts:", err))
        .finally(() => setIsLoadingContacts(false));
    } else {
      setListContacts([]);
    }
  }, [audienceType, audienceId]);

  const selectedList = availableLists.find((l) => l.id === audienceId);
  const selectedTemplate =
    availableTemplates.find((t) => t.name === selectedTemplateName) ||
    availableTemplates[0];

  // Variable replacement helper
  const renderMessageForContact = (contact?: Contact) => {
    if (!contact) return customMessage;
    const businessName = contact.company || contact.first_name || "there";
    const phone = contact.phone || "";
    const category =
      (contact.metadata as any)?.scraped_category ||
      (contact.metadata as any)?.category ||
      "store";
    const city =
      (contact.metadata as any)?.search_query?.split(" ").pop() || "Dhaka";

    return customMessage
      .replace(/{{businessName}}/g, businessName)
      .replace(/{{first_name}}/g, businessName)
      .replace(/{{company}}/g, businessName)
      .replace(/{{phone}}/g, phone)
      .replace(/{{category}}/g, category)
      .replace(/{{city}}/g, city);
  };

  // WhatsApp Web URL builder
  const getWhatsAppWebUrl = (contact: Contact) => {
    const cleanPhone = (contact.phone || "").replace(/[^0-9]/g, "");
    const text = renderMessageForContact(contact);
    return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  // Direct Click-to-Chat URL
  const getWaMeUrl = (contact: Contact) => {
    const cleanPhone = (contact.phone || "").replace(/[^0-9]/g, "");
    const text = renderMessageForContact(contact);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // Runner send action
  const handleOpenAndSendCurrent = useCallback(() => {
    const current = listContacts[runnerIndex];
    if (!current) return;

    // Open WhatsApp Web with pre-filled message
    window.open(getWhatsAppWebUrl(current), "_blank");

    // Mark as sent
    if (!sentContactIds.includes(current.id)) {
      setSentContactIds((prev) => [...prev, current.id]);
    }

    // Advance to next
    if (runnerIndex < listContacts.length - 1) {
      setRunnerIndex((prev) => prev + 1);
    } else {
      // Completed all
      setIsAutoPacing(false);
      handleSaveWebRunnerProgress();
    }
  }, [runnerIndex, listContacts, sentContactIds]);

  const handleSkipCurrent = () => {
    const current = listContacts[runnerIndex];
    if (current && !skippedContactIds.includes(current.id)) {
      setSkippedContactIds((prev) => [...prev, current.id]);
    }
    if (runnerIndex < listContacts.length - 1) {
      setRunnerIndex((prev) => prev + 1);
    } else {
      setIsAutoPacing(false);
      handleSaveWebRunnerProgress();
    }
  };

  // Save web runner progress to database
  const handleSaveWebRunnerProgress = async () => {
    try {
      await fetch("/api/whatsapp/campaigns/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          dispatchMode: "web_runner",
          audienceType,
          audienceId,
          customMessage,
          sentContactIds,
          skippedContactIds,
        }),
      });
    } catch (err) {
      console.error("Failed to save campaign progress:", err);
    }
  };

  // Auto-Pacing Timer
  useEffect(() => {
    if (!isAutoPacing || !isRunnerOpen) {
      setCountdown(null);
      return;
    }

    setCountdown(pacingIntervalSec);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          handleOpenAndSendCurrent();
          return pacingIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoPacing, isRunnerOpen, pacingIntervalSec, handleOpenAndSendCurrent]);

  // Keyboard Shortcuts inside Runner (Space / Enter to send, S to skip)
  useEffect(() => {
    if (!isRunnerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleOpenAndSendCurrent();
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleSkipCurrent();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setRunnerIndex((prev) => Math.min(listContacts.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setRunnerIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunnerOpen, handleOpenAndSendCurrent, listContacts.length]);

  // Launch Server-Side Meta Cloud API Blast
  const handleDispatchMetaApi = async () => {
    setIsDispatchingServer(true);
    setServerDispatchResult(null);
    setIsDispatchModalOpen(true);

    try {
      const res = await fetch("/api/whatsapp/campaigns/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          dispatchMode: "meta_api",
          audienceType,
          audienceId,
          templateName: selectedTemplateName,
          templateLanguage: selectedTemplate.language || "en_US",
        }),
      });

      const data = await res.json();
      setServerDispatchResult(data);
    } catch (err: any) {
      setServerDispatchResult({
        success: false,
        error: err.message || "Network error dispatching campaign",
      });
    } finally {
      setIsDispatchingServer(false);
    }
  };

  // Export CSV of WhatsApp links
  const handleExportCsv = () => {
    if (listContacts.length === 0) return;
    const headers = ["Business Name", "Phone", "Category", "Rating", "WhatsApp Web Link", "Direct WaMe Link"];
    const rows = listContacts.map((c) => [
      `"${(c.company || c.first_name || "").replace(/"/g, '""')}"`,
      `"${c.phone || ""}"`,
      `"${((c.metadata as any)?.scraped_category || "").replace(/"/g, '""')}"`,
      `"${(c.metadata as any)?.rating || "N/A"}"`,
      `"${getWhatsAppWebUrl(c)}"`,
      `"${getWaMeUrl(c)}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whatsapp-leads-${selectedList?.name || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeContact = listContacts[runnerIndex];

  const filteredContacts = contactSearchQuery.trim()
    ? listContacts.filter((c) =>
        (c.company || c.first_name || "")
          .toLowerCase()
          .includes(contactSearchQuery.toLowerCase()) ||
        (c.phone || "").includes(contactSearchQuery)
      )
    : listContacts;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <Link
          href="/whatsapp/campaigns"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to WhatsApp Campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Create WhatsApp Campaign
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Broadcast to your verified Google Maps leads via Official Meta WABA or Fast WhatsApp Web Runner.
            </p>
          </div>

          {/* Quick List Badge */}
          {selectedList && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <Users className="h-3.5 w-3.5" />
              <span>Targeting: <strong>{selectedList.name}</strong> ({listContacts.length} leads)</span>
            </div>
          )}
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: "1. Campaign Details" },
          { num: 2, title: "2. Target Audience" },
          { num: 3, title: "3. Template & Message" },
          { num: 4, title: "4. Review & Dispatch" },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
              step === s.num
                ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-sm"
                : step > s.num
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-secondary/60 border-border text-muted-foreground"
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            WhatsApp Campaign Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Dhaka Bike Shops Outreach"
              />
            </div>

            {/* Choose Dispatch Mode */}
            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-2">
                Choose Dispatch Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDispatchMode("web_runner")}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    dispatchMode === "web_runner"
                      ? "bg-emerald-600/15 border-emerald-500/50 text-foreground shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-card border-border text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      Direct WhatsApp Web Runner
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                      Instant · 100% Free
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Zero setup required. Step through your leads and send personalized messages directly using WhatsApp Web. No Meta approval or API costs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchMode("meta_api")}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    dispatchMode === "meta_api"
                      ? "bg-primary/15 border-primary/50 text-foreground shadow-sm ring-1 ring-primary/30"
                      : "bg-card border-border text-muted-foreground hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Official Meta Cloud API (WABA)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                      Automated Server
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Broadcast hands-free through your official Meta Business Account using pre-approved templates (requires WABA credentials).
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold shadow-md shadow-emerald-600/25"
            >
              <span>Next: Select Audience</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Target Audience */}
      {step === 2 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            Target Audience Selection
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAudienceType("list")}
              className={`p-3 rounded-xl border text-left transition-all ${
                audienceType === "list"
                  ? "bg-emerald-600/20 border-emerald-500 text-foreground font-semibold"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              <Users className="h-4 w-4 mb-1 text-emerald-400" />
              <div className="text-xs font-bold">Contact List</div>
              <div className="text-[10px] text-muted-foreground">e.g. Scraped Google Maps Leads</div>
            </button>

            <button
              type="button"
              onClick={() => setAudienceType("segment")}
              className={`p-3 rounded-xl border text-left transition-all ${
                audienceType === "segment"
                  ? "bg-emerald-600/20 border-emerald-500 text-foreground font-semibold"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              <Smartphone className="h-4 w-4 mb-1 text-emerald-400" />
              <div className="text-xs font-bold">Dynamic Segment</div>
              <div className="text-[10px] text-muted-foreground">Auto-filter by tags or country</div>
            </button>
          </div>

          {audienceType === "list" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/90 mb-1">
                  Choose Contact List
                </label>
                <select
                  value={audienceId}
                  onChange={(e) => setAudienceId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                >
                  {availableLists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.member_count || 0} contacts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Lead Preview Table */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>
                      {listContacts.length} Verified WhatsApp Leads in "{selectedList?.name || "List"}"
                    </span>
                  </span>

                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    placeholder="Search inside this list..."
                    className="bg-background border border-border rounded-lg px-2.5 py-1 text-[11px] text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                  {isLoadingContacts ? (
                    <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Loading verified leads...</span>
                    </div>
                  ) : filteredContacts.length > 0 ? (
                    filteredContacts.map((c) => (
                      <div
                        key={c.id}
                        className="pt-1.5 flex items-center justify-between text-xs hover:bg-secondary/30 p-1.5 rounded-lg"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-foreground truncate">
                            {c.company || c.first_name}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <span>{(c.metadata as any)?.scraped_category || "Business"}</span>
                            {(c.metadata as any)?.rating && (
                              <span className="text-amber-400">★ {(c.metadata as any).rating}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                            {c.phone}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      No contacts found matching your search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-foreground/90 mb-1">
                Choose Segment
              </label>
              <select
                value={audienceId}
                onChange={(e) => setAudienceId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
              >
                {mockSegments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (~{s.contact_count} phone-verified contacts)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold shadow-md shadow-emerald-600/25"
            >
              <span>Next: Compose Message</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Template & Mapping */}
      {step === 3 && (
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            {dispatchMode === "web_runner" ? "Compose Personalized WhatsApp Message" : "Select Approved Meta Template"}
          </h2>

          {dispatchMode === "web_runner" ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-foreground">
                    Message Template Body
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Click tags below to insert dynamic variables
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground font-sans leading-relaxed focus:outline-none focus:border-emerald-500"
                  placeholder="Type your message..."
                />
              </div>

              {/* Dynamic tag insert buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Insert:</span>
                {[
                  { tag: "{{businessName}}", label: "Business Name" },
                  { tag: "{{category}}", label: "Category" },
                  { tag: "{{phone}}", label: "Phone" },
                  { tag: "{{city}}", label: "City" },
                ].map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => setCustomMessage((prev) => prev + " " + t.tag)}
                    className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-[11px] font-mono text-emerald-400 transition-colors"
                  >
                    + {t.label}
                  </button>
                ))}
              </div>

              {/* Real Lead Live Preview */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    Live Personalized Preview (First Lead: {listContacts[0]?.company || listContacts[0]?.first_name || "Lead #1"})
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {listContacts[0]?.phone}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                  {renderMessageForContact(listContacts[0])}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/90 mb-1">
                  Select Meta Approved Template
                </label>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                >
                  {availableTemplates.map((t) => (
                    <option key={t.id || t.name} value={t.name}>
                      {t.name} ({t.category} · {t.language || "en_US"})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Templates marked APPROVED can be dispatched server-side to customers.
                </p>
              </div>

              {/* Dynamic Variable Mapping */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-foreground/90">
                  Template Dynamic Variables Mapping
                </div>

                <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400">{"{{1}}"} (Recipient Name)</span>
                  <select
                    value={var1}
                    onChange={(e) => setVar1(e.target.value)}
                    className="bg-background border border-border text-xs rounded-lg px-3 py-1 text-foreground"
                  >
                    <option value="company">Contact: Business Name / Company</option>
                    <option value="first_name">Contact: First Name</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400">{"{{2}}"} (Category / Offer)</span>
                  <select
                    value={var2}
                    onChange={(e) => setVar2(e.target.value)}
                    className="bg-background border border-border text-xs rounded-lg px-3 py-1 text-foreground"
                  >
                    <option value="category">Scraped Category</option>
                    <option value="promo_code">Custom Field: Promo Code</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold shadow-md shadow-emerald-600/25"
            >
              <span>Next: Review & Launch</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Review & Launch */}
      {step === 4 && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
            Review WhatsApp Campaign Preview
          </h2>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Left side details */}
            <div className="flex-1 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                <div>Campaign: <strong className="text-foreground">{campaignName}</strong></div>
                <div>
                  Method:{" "}
                  <strong className={dispatchMode === "web_runner" ? "text-emerald-400" : "text-primary"}>
                    {dispatchMode === "web_runner" ? "Direct WhatsApp Web Fast Runner (Free / Instant)" : "Meta Cloud API (Automated Server)"}
                  </strong>
                </div>
                <div>
                  Target List: <strong className="text-foreground">{selectedList?.name || "Selected Audience"}</strong>
                </div>
                <div>
                  Target Recipients:{" "}
                  <strong className="text-emerald-400 font-bold">
                    {listContacts.length > 0 ? listContacts.length : selectedList?.member_count || 0} Verified Phone Numbers
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Ready for Immediate Outbound Blast</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {dispatchMode === "web_runner"
                    ? "Clicking Launch will open the interactive Fast Runner modal. You can click through leads or use Spacebar to open WhatsApp Web with each message pre-filled. Zero ban risk & zero fees."
                    : "Messages will be dispatched directly through your verified Meta WhatsApp Business Cloud API number."}
                </p>
              </div>

              {/* CSV Export Option */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="text-[11px] text-muted-foreground">
                  Want to divide leads among your sales team?
                </div>
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-card hover:bg-card/80 border border-border text-xs font-semibold text-foreground transition-all"
                >
                  <Download className="h-3.5 w-3.5 text-primary" />
                  <span>Export Click-to-Chat CSV</span>
                </button>
              </div>
            </div>

            {/* Right side WhatsApp Bubble preview */}
            <div className="w-full md:w-80 bg-[#0b141a] p-4 rounded-2xl border border-border shadow-2xl space-y-2 shrink-0">
              <div className="text-[11px] text-emerald-400/80 font-mono pb-1 border-b border-emerald-950 flex items-center justify-between">
                <span>WhatsApp Message Preview</span>
                <span>Mobile Chat</span>
              </div>
              <div className="bg-[#005c4b] text-foreground p-3.5 rounded-xl rounded-tr-none text-xs leading-relaxed shadow space-y-2">
                <div className="whitespace-pre-line text-slate-100">
                  {dispatchMode === "web_runner"
                    ? renderMessageForContact(listContacts[0])
                    : selectedTemplate.body_text
                        .replace("{{1}}", listContacts[0]?.company || "Business Owner")
                        .replace("{{2}}", "Special Offer")}
                </div>
                <div className="text-[10px] text-emerald-200/70 text-right flex items-center justify-end gap-1">
                  <span>Just now</span>
                  <span className="text-cyan-300 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              {dispatchMode === "web_runner" ? (
                <button
                  onClick={() => setIsRunnerOpen(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99]"
                >
                  <Play className="h-4 w-4" />
                  <span>Launch WhatsApp Web Fast Runner ({listContacts.length} leads)</span>
                </button>
              ) : (
                <button
                  onClick={handleDispatchMetaApi}
                  disabled={isDispatchingServer}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-50"
                >
                  {isDispatchingServer ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Dispatching via Meta Cloud API...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="h-4 w-4" />
                      <span>Queue & Dispatch Server Blast</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE FAST RUNNER MODAL (FOR DIRECT WHATSAPP WEB BULK DISPATCH) */}
      {/* ========================================================================= */}
      {isRunnerOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    WhatsApp Web Fast Dispatcher
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Campaign: {campaignName} · {selectedList?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto Pacing Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAutoPacing(!isAutoPacing)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    isAutoPacing
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {isAutoPacing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isAutoPacing ? `Auto-Sending (${countdown}s)` : "Auto-Pacing"}</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-[11px] font-medium text-foreground transition-colors"
                >
                  <Download className="h-3 w-3 text-primary" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setIsRunnerOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Progress Strip */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">
                  Lead {runnerIndex + 1} of {listContacts.length}
                </span>
                <span className="text-emerald-400">
                  {sentContactIds.length} Sent · {listContacts.length - sentContactIds.length} Remaining
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${listContacts.length > 0 ? (sentContactIds.length / listContacts.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {activeContact ? (
              <div className="space-y-4">
                {/* Active Contact Information Card */}
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-bold text-foreground flex items-center gap-2">
                      <span>{activeContact.company || activeContact.first_name}</span>
                      {(activeContact.metadata as any)?.rating && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans">
                          ★ {(activeContact.metadata as any).rating}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{(activeContact.metadata as any)?.scraped_category || "Local Business"}</span>
                      <span>·</span>
                      <span className="truncate max-w-[200px]">
                        {(activeContact.metadata as any)?.address || "Dhaka, Bangladesh"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-lg border border-emerald-500/30 inline-block">
                      {activeContact.phone}
                    </div>
                    {(activeContact.metadata as any)?.maps_url && (
                      <div className="mt-1">
                        <a
                          href={(activeContact.metadata as any).maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span>View on Maps</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pre-filled Message Content */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Message to Dispatch</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(renderMessageForContact(activeContact));
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 font-normal"
                    >
                      {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedLink ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
                    {renderMessageForContact(activeContact)}
                  </div>
                </div>

                {/* Big Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={handleOpenAndSendCurrent}
                    className="sm:col-span-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99]"
                  >
                    <SendHorizontal className="h-4 w-4" />
                    <span>Open in WhatsApp Web &amp; Next (Spacebar) →</span>
                  </button>

                  <button
                    onClick={handleSkipCurrent}
                    className="py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    <span>Skip Lead (S)</span>
                  </button>
                </div>

                {/* Navigation and Shortcuts hint */}
                <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground border-t border-border">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={runnerIndex === 0}
                      onClick={() => setRunnerIndex((prev) => Math.max(0, prev - 1))}
                      className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span>Jump to Lead</span>
                    <button
                      disabled={runnerIndex >= listContacts.length - 1}
                      onClick={() => setRunnerIndex((prev) => Math.min(listContacts.length - 1, prev + 1))}
                      className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] hidden sm:inline">Hotkey: [Space] to Send, [S] to Skip</span>
                    <div className="font-mono text-[10px] bg-secondary/80 px-2 py-1 rounded">
                      Status: {sentContactIds.includes(activeContact.id) ? "✓ Sent" : "Pending"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    All {listContacts.length} Leads Processed!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    You have dispatched messages to {sentContactIds.length} contacts and skipped {skippedContactIds.length}. The campaign has been recorded in your database.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsRunnerOpen(false);
                      router.push("/whatsapp/campaigns");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25"
                  >
                    View All Campaigns
                  </button>
                  <button
                    onClick={() => setIsRunnerOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SERVER-SIDE META CLOUD API DISPATCH MODAL */}
      {/* ========================================================================= */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <Radio className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Meta Cloud API Server Blast
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {campaignName} · {listContacts.length} leads
                  </p>
                </div>
              </div>

              {!isDispatchingServer && (
                <button
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {isDispatchingServer ? (
              <div className="text-center py-8 space-y-4">
                <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Dispatching Outbound WhatsApp Messages...
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sending to Meta Cloud API graph servers. Please do not close this window.
                  </p>
                </div>
              </div>
            ) : serverDispatchResult?.success ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Broadcast Dispatched Successfully!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {serverDispatchResult.sentCount} messages queued and dispatched through your verified Meta Business number.
                  </p>
                </div>

                {serverDispatchResult.failedCount > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 text-left">
                    Note: {serverDispatchResult.failedCount} messages could not be delivered (e.g. invalid phone formatting or non-WhatsApp number).
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsDispatchModalOpen(false);
                      router.push("/whatsapp/campaigns");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25"
                  >
                    View Campaign Analytics
                  </button>
                  <button
                    onClick={() => setIsDispatchModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Dispatch Failed
                  </h3>
                  <p className="text-xs text-rose-300 mt-1 max-w-sm mx-auto">
                    {serverDispatchResult?.error || "Meta Graph API could not process the broadcast."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Link
                    href="/whatsapp/config"
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold"
                  >
                    Check API Configuration
                  </Link>
                  <button
                    onClick={() => setIsDispatchModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
