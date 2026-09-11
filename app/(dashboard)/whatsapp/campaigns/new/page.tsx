"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
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
  UserCheck,
  CheckSquare,
  Square,
  Search,
  Filter,
} from "lucide-react";
import { mockWhatsAppAccounts } from "@/lib/whatsapp/service";
import {
  mockLists,
  mockSegments,
  getLists,
  getListContacts,
  getContacts,
  DEFAULT_WORKSPACE_ID,
} from "@/lib/contacts/service";
import { ContactList, Contact } from "@/types/database";
import { useAuth } from "@/components/providers/auth-provider";

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
  const { workspace } = useAuth();
  const currentWorkspaceId = workspace?.id || DEFAULT_WORKSPACE_ID;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const initialName = searchParams.get("name") || "Google Maps Lead Outreach";
  const initialListId = searchParams.get("listId");

  const [campaignName, setCampaignName] = useState(initialName);
  const [campaignObjective, setCampaignObjective] = useState("Cold Lead Outreach");
  const [dispatchMode, setDispatchMode] = useState<"web_runner" | "meta_api">("web_runner");
  const [accountId, setAccountId] = useState(mockWhatsAppAccounts[0].id);
  const [audienceType, setAudienceType] = useState<"list" | "segment" | "manual">(
    initialListId ? "list" : "list"
  );
  const [audienceId, setAudienceId] = useState(initialListId || "all_contacts");
  const [availableLists, setAvailableLists] = useState<ContactList[]>(mockLists);

  // All Workspace Contacts & Manual Selection State
  const [allWorkspaceContacts, setAllWorkspaceContacts] = useState<Contact[]>([]);
  const [isLoadingAllContacts, setIsLoadingAllContacts] = useState(false);
  const [manualSelectedIds, setManualSelectedIds] = useState<string[]>([]);
  const [manualSearchQuery, setManualSearchQuery] = useState("");

  // Templates
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([
    {
      id: "meta-welcome-notice",
      name: "welcome_notice",
      category: "MARKETING",
      language: "en_US",
      status: "APPROVED",
      body_text: "Hello! Thank you for contacting ntechbd. We look forward to working with you.",
      variables: [],
      isLiveMeta: true,
      isTestOnly: false,
    },
    {
      id: "order_shipping_update_v2",
      name: "order_shipping_update_v2",
      category: "UTILITY",
      language: "en_US",
      status: "APPROVED",
      body_text: "Hello {{1}}, your order {{2}} has been shipped via express courier. Track: {{3}}",
      variables: ["{{1}}", "{{2}}", "{{3}}"],
      isLiveMeta: true,
      isTestOnly: false,
    },
    {
      id: "hello_world",
      name: "hello_world",
      category: "UTILITY",
      language: "en_US",
      status: "APPROVED",
      body_text: "Welcome and congratulations! This message confirms that your WhatsApp Business Cloud API integration is live.",
      variables: [],
      isMetaDefault: true,
      isTestOnly: true,
    },
  ]);
  const [selectedTemplateName, setSelectedTemplateName] = useState("welcome_notice");

  // Real Contacts State (Actively targeted for Step 3/4 & Dispatch)
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

  // Load all workspace contacts helper
  const loadAllContacts = useCallback(async () => {
    setIsLoadingAllContacts(true);
    try {
      const data = await getContacts(currentWorkspaceId);
      const valid = (data || []).filter(
        (c) => c.phone && c.phone.replace(/[^0-9]/g, "").length >= 7
      );
      setAllWorkspaceContacts(valid);
      return valid;
    } catch (err) {
      console.error("Error loading all contacts:", err);
      return [];
    } finally {
      setIsLoadingAllContacts(false);
    }
  }, [currentWorkspaceId]);

  // Load lists & all contacts on mount
  useEffect(() => {
    async function initAudience() {
      loadAllContacts();
      const lists = await getLists(currentWorkspaceId);
      if (lists && lists.length > 0) {
        setAvailableLists(lists);
        if (initialListId) {
          setAudienceId(initialListId);
          setAudienceType("list");
        }
      }
    }
    initAudience();
  }, [initialListId, currentWorkspaceId, loadAllContacts]);

  const [isSyncingTemplates, setIsSyncingTemplates] = useState(false);

  // Load available templates from API
  const loadTemplates = useCallback(async () => {
    try {
      const r = await fetch("/api/whatsapp/templates");
      const data = await r.json();
      if (data.templates && data.templates.length > 0) {
        setAvailableTemplates(data.templates);
        // Default to welcome_notice or the first non-test approved template
        setSelectedTemplateName((prev) => {
          if (prev && prev !== "hello_world" && data.templates.some((t: any) => t.name === prev)) {
            return prev;
          }
          const liveTpl = data.templates.find((t: any) => !t.isTestOnly && t.name !== "hello_world");
          return liveTpl ? liveTpl.name : data.templates[0].name;
        });
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSyncMetaTemplates = async () => {
    setIsSyncingTemplates(true);
    try {
      const res = await fetch("/api/whatsapp/templates/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await loadTemplates();
      }
    } catch (err) {
      console.error("Error syncing templates:", err);
    } finally {
      setIsSyncingTemplates(false);
    }
  };

  // Handle switching audience types smoothly
  const handleSelectAudienceType = (type: "list" | "segment" | "manual") => {
    setAudienceType(type);
    if (type === "manual") {
      if (allWorkspaceContacts.length === 0) {
        loadAllContacts().then((valid) => {
          if (manualSelectedIds.length === 0 && listContacts.length > 0) {
            setManualSelectedIds(listContacts.map((c) => c.id));
          } else if (manualSelectedIds.length === 0 && valid.length > 0) {
            // Default to first 10 or all contacts
            setManualSelectedIds(valid.slice(0, 15).map((c) => c.id));
          }
        });
      } else if (manualSelectedIds.length === 0 && listContacts.length > 0) {
        setManualSelectedIds(listContacts.map((c) => c.id));
      } else if (manualSelectedIds.length === 0 && allWorkspaceContacts.length > 0) {
        setManualSelectedIds(allWorkspaceContacts.slice(0, 15).map((c) => c.id));
      }
    }
  };

  // Synchronize listContacts based on current audienceType & selection
  useEffect(() => {
    if (audienceType === "manual") {
      if (allWorkspaceContacts.length > 0) {
        const selected = allWorkspaceContacts.filter((c) => manualSelectedIds.includes(c.id));
        setListContacts(selected);
      }
    } else if (audienceType === "list") {
      if (audienceId === "all_contacts") {
        if (allWorkspaceContacts.length > 0) {
          setListContacts(allWorkspaceContacts);
        } else {
          setIsLoadingContacts(true);
          loadAllContacts()
            .then((valid) => setListContacts(valid))
            .finally(() => setIsLoadingContacts(false));
        }
      } else if (audienceId) {
        setIsLoadingContacts(true);
        getListContacts(audienceId)
          .then((contacts) => {
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
    } else {
      // Dynamic Segment mode
      setListContacts([]);
    }
  }, [audienceType, audienceId, manualSelectedIds, allWorkspaceContacts, loadAllContacts]);

  // Safe selected list reference
  const selectedList =
    audienceId === "all_contacts"
      ? ({
          id: "all_contacts",
          workspace_id: currentWorkspaceId,
          name: "All Workspace Contacts",
          description: "All phone-verified contacts in workspace",
          member_count: allWorkspaceContacts.length || listContacts.length,
          created_at: new Date().toISOString(),
        } as ContactList)
      : availableLists.find((l) => l.id === audienceId);

  const selectedTemplate =
    availableTemplates.find((t) => t.name === selectedTemplateName) ||
    availableTemplates[0];

  // Variable replacement helper with live preview sample fallback
  const renderMessageForContact = (contact?: Contact) => {
    const businessName = contact?.company || contact?.first_name || "Apex Bike Care";
    const phone = contact?.phone || "+880 1711-234567";
    const category =
      (contact?.metadata as any)?.scraped_category ||
      (contact?.metadata as any)?.category ||
      "Bike Repair";
    const city =
      (contact?.metadata as any)?.search_query?.split(" ").pop() || "Dhaka";

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
          contactIds: audienceType === "manual" ? listContacts.map((c) => c.id) : undefined,
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
          contactIds:
            audienceType === "manual"
              ? manualSelectedIds.length > 0
                ? manualSelectedIds
                : listContacts.map((c) => c.id)
              : undefined,
          templateName: selectedTemplateName,
          templateLanguage: selectedTemplate.language || "en_US",
        }),
      });

      const data = await res.json();
      const sentCount = Number(data.sentCount ?? data.summary?.sent ?? 0);
      const failedCount = Number(
        data.failedCount ?? data.summary?.failed ?? (data.success && sentCount > 0 ? 0 : listContacts.length)
      );
      setServerDispatchResult({
        ...data,
        sentCount,
        failedCount,
      });
    } catch (err: any) {
      setServerDispatchResult({
        success: false,
        sentCount: 0,
        failedCount: listContacts.length,
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
    a.download = `whatsapp-leads-${
      audienceType === "manual"
        ? "manual-selection"
        : audienceId === "all_contacts"
        ? "all-workspace-contacts"
        : selectedList?.name || "export"
    }.csv`;
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

  // Filtered contacts for Manual Selection mode
  const filteredManualContacts = useMemo(() => {
    const q = manualSearchQuery.toLowerCase().trim();
    if (!q) return allWorkspaceContacts;

    return allWorkspaceContacts.filter((c) => {
      const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      const company = (c.company || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      const category = String(
        (c.metadata as any)?.scraped_category || (c.metadata as any)?.category || ""
      ).toLowerCase();
      const query = String((c.metadata as any)?.search_query || "").toLowerCase();
      const city = String((c.metadata as any)?.address || "").toLowerCase();

      return (
        name.includes(q) ||
        company.includes(q) ||
        phone.includes(q) ||
        category.includes(q) ||
        query.includes(q) ||
        city.includes(q)
      );
    });
  }, [allWorkspaceContacts, manualSearchQuery]);

  const handleToggleSelectAllFiltered = () => {
    const filteredIds = filteredManualContacts.map((c) => c.id);
    const areAllFilteredSelected =
      filteredIds.length > 0 && filteredIds.every((id) => manualSelectedIds.includes(id));

    if (areAllFilteredSelected) {
      setManualSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setManualSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleClearManualSelection = () => {
    setManualSelectedIds([]);
  };

  const handleToggleSingleContact = (contactId: string) => {
    setManualSelectedIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Page Header */}
      <div>
        <Link
          href="/whatsapp/campaigns"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-2 transition-colors group"
        >
          <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" /> Back to WhatsApp Campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Create WhatsApp Campaign
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Step {step} of 4
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Broadcast to your verified Google Maps leads via Official Meta WABA or Fast WhatsApp Web Runner.
            </p>
          </div>

          {/* Quick List / Audience Badge */}
          {(selectedList || audienceType === "manual") && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/80 border border-border text-xs font-medium text-foreground shadow-sm">
              {audienceType === "manual" ? (
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Users className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>
                Targeting:{" "}
                <strong className="text-emerald-400 font-semibold">
                  {audienceType === "manual"
                    ? "Manual Selection"
                    : audienceId === "all_contacts"
                    ? "All Workspace Contacts"
                    : selectedList?.name}
                </strong>{" "}
                ({listContacts.length} leads)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Connected Sequential Stepper */}
      <div className="p-2 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { num: 1, title: "Campaign Details", sub: "Protocol & Identity" },
            { num: 2, title: "Target Audience", sub: "Verified Leads" },
            { num: 3, title: "Template & Message", sub: "Dynamic Variables" },
            { num: 4, title: "Review & Dispatch", sub: "Safety & Launch" },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num <= step) setStep(s.num as any);
                }}
                disabled={s.num > step}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-emerald-600/15 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/25"
                    : isCompleted
                    ? "bg-secondary/40 border-emerald-500/20 hover:bg-secondary/70 cursor-pointer"
                    : "bg-secondary/15 border-transparent opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : isCompleted ? "text-foreground/90" : "text-muted-foreground"}`}>
                    {s.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {s.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-6 shadow-sm">
              <div className="border-b border-border/70 pb-4">
                <h2 className="text-base font-bold text-foreground">
                  Campaign Identity &amp; Dispatch Protocol
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure campaign name and select the outbound delivery protocol.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground/90">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                      placeholder="e.g. Dhaka Bike Shops Outreach"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground/90">
                      Campaign Objective
                    </label>
                    <select
                      value={campaignObjective}
                      onChange={(e) => setCampaignObjective(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="Cold Lead Outreach">Cold Lead Outreach (Google Maps)</option>
                      <option value="Promotional Offer">Promotional Offer / Discount</option>
                      <option value="VIP Re-engagement">VIP Customer Re-engagement</option>
                      <option value="Order & Service Update">Order &amp; Service Update</option>
                    </select>
                  </div>
                </div>

                {/* Choose Dispatch Method */}
                <div className="space-y-2.5 pt-1">
                  <label className="block text-xs font-semibold text-foreground/90">
                    Choose Dispatch Method
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Web Runner Card */}
                    <div
                      onClick={() => setDispatchMode("web_runner")}
                      className={`p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                        dispatchMode === "web_runner"
                          ? "bg-emerald-600/10 border-emerald-500/60 text-foreground shadow-md ring-1 ring-emerald-500/30"
                          : "bg-card/40 border-border/80 text-muted-foreground hover:border-border hover:bg-card/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${dispatchMode === "web_runner" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                              <Zap className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">
                                Direct WhatsApp Web Runner
                              </div>
                              <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                                Instant · 100% Free
                              </span>
                            </div>
                          </div>

                          {/* Custom Radio Affordance */}
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                            dispatchMode === "web_runner" ? "border-emerald-500 bg-emerald-500" : "border-border bg-background"
                          }`}>
                            {dispatchMode === "web_runner" && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                          Direct browser runner via WhatsApp Web with 1-click or Spacebar shortcut.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>100% Free · Zero API conversation fees</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>No Meta Business verification required</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Built-in anti-ban pacing &amp; hotkey dispatch</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta API Card */}
                    <div
                      onClick={() => setDispatchMode("meta_api")}
                      className={`p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                        dispatchMode === "meta_api"
                          ? "bg-emerald-600/10 border-emerald-500/60 text-foreground shadow-md ring-1 ring-emerald-500/30"
                          : "bg-card/40 border-border/80 text-muted-foreground hover:border-border hover:bg-card/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${dispatchMode === "meta_api" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">
                                Official Meta Cloud API (WABA)
                              </div>
                              <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold border border-border">
                                Automated Server
                              </span>
                            </div>
                          </div>

                          {/* Custom Radio Affordance */}
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                            dispatchMode === "meta_api" ? "border-emerald-500 bg-emerald-500" : "border-border bg-background"
                          }`}>
                            {dispatchMode === "meta_api" && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                          Automated server-side broadcast through verified Meta WhatsApp Cloud API.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Background server queue (hands-free delivery)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Verified Meta green badge sender ID</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Real-time webhook read &amp; delivery receipts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/70">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Quick 4-step guided setup (~1 min)</span>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Next: Select Audience</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Target Audience */}
          {step === 2 && (
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-6 shadow-sm">
              <div className="border-b border-border/70 pb-4">
                <h2 className="text-base font-bold text-foreground">
                  Step 2: Target Audience Selection
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose the contact list or dynamic segment you wish to reach with this campaign.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Contact List */}
                <div
                  onClick={() => handleSelectAudienceType("list")}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    audienceType === "list"
                      ? "bg-emerald-600/15 border-emerald-500/60 text-foreground ring-1 ring-emerald-500/25 shadow-sm"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${audienceType === "list" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">Contact List</div>
                      <div className="text-[10px] text-muted-foreground truncate">Saved &amp; scraped lists</div>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    audienceType === "list" ? "border-emerald-500 bg-emerald-500" : "border-border"
                  }`}>
                    {audienceType === "list" && <div className="w-1 h-1 rounded-full bg-slate-950" />}
                  </div>
                </div>

                {/* Option 2: Manual Selection */}
                <div
                  onClick={() => handleSelectAudienceType("manual")}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    audienceType === "manual"
                      ? "bg-emerald-600/15 border-emerald-500/60 text-foreground ring-1 ring-emerald-500/25 shadow-sm"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${audienceType === "manual" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                        <span>Manual Selection</span>
                        {manualSelectedIds.length > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-400 font-mono font-bold">
                            {manualSelectedIds.length}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">Select contacts manually</div>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    audienceType === "manual" ? "border-emerald-500 bg-emerald-500" : "border-border"
                  }`}>
                    {audienceType === "manual" && <div className="w-1 h-1 rounded-full bg-slate-950" />}
                  </div>
                </div>

                {/* Option 3: Dynamic Segment */}
                <div
                  onClick={() => handleSelectAudienceType("segment")}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    audienceType === "segment"
                      ? "bg-emerald-600/15 border-emerald-500/60 text-foreground ring-1 ring-emerald-500/25 shadow-sm"
                      : "bg-card/40 border-border/80 text-muted-foreground hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${audienceType === "segment" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">Dynamic Segment</div>
                      <div className="text-[10px] text-muted-foreground truncate">Auto-filter by rules</div>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    audienceType === "segment" ? "border-emerald-500 bg-emerald-500" : "border-border"
                  }`}>
                    {audienceType === "segment" && <div className="w-1 h-1 rounded-full bg-slate-950" />}
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* AUDIENCE TYPE 1: CONTACT LIST (SAVED / SCRAPED LISTS)         */}
              {/* ------------------------------------------------------------- */}
              {audienceType === "list" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-foreground/90">
                        Choose Contact List
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        Includes all scraped Google Maps leads &amp; created lists
                      </span>
                    </div>
                    <select
                      value={audienceId}
                      onChange={(e) => setAudienceId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="all_contacts">
                        🌐 All Contacts ({allWorkspaceContacts.length > 0 ? allWorkspaceContacts.length : "All"} contacts across workspace)
                      </option>
                      <optgroup label="Saved &amp; Scraped Lists">
                        {availableLists.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.member_count || 0} contacts)
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Lead Preview Table */}
                  <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
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
                        placeholder="Search leads in this list..."
                        className="bg-background border border-border rounded-lg px-2.5 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                      {isLoadingContacts ? (
                        <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                          <span>Loading verified leads...</span>
                        </div>
                      ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((c) => (
                          <div
                            key={c.id}
                            className="pt-2 flex items-center justify-between text-xs hover:bg-secondary/40 p-2 rounded-lg transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-foreground truncate">
                                {c.company || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Lead"}
                              </div>
                              <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <span>{(c.metadata as any)?.scraped_category || "Business"}</span>
                                {(c.metadata as any)?.rating && (
                                  <span className="text-amber-400 font-semibold">★ {(c.metadata as any).rating}</span>
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
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          No contacts found matching your search.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* AUDIENCE TYPE 2: MANUAL CONTACT SELECTION (HANDPICK CONTACTS) */}
              {/* ------------------------------------------------------------- */}
              {audienceType === "manual" && (
                <div className="space-y-4">
                  {/* Selection Action Bar & Counters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-card/70 border border-border/80 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <span>{manualSelectedIds.length} of {allWorkspaceContacts.length} Contacts Selected</span>
                          {manualSelectedIds.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                              Ready for Campaign
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {filteredManualContacts.length} matching search filter · Check individual contacts below
                        </p>
                      </div>
                    </div>

                    {/* Batch selection buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllFiltered}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground transition-all flex items-center gap-1.5"
                      >
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                        <span>
                          {filteredManualContacts.length > 0 &&
                          filteredManualContacts.every((c) => manualSelectedIds.includes(c.id))
                            ? "Deselect Visible"
                            : `Select Visible (${filteredManualContacts.length})`}
                        </span>
                      </button>

                      {manualSelectedIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearManualSelection}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-400 transition-all"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={manualSearchQuery}
                      onChange={(e) => setManualSearchQuery(e.target.value)}
                      placeholder="Search all contacts by name, company, phone number, category, or city..."
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {manualSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setManualSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Contact Checkbox Table */}
                  <div className="rounded-xl bg-card/60 border border-border/80 overflow-hidden">
                    {/* Table Header */}
                    <div className="p-3 bg-secondary/40 border-b border-border/60 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={
                            filteredManualContacts.length > 0 &&
                            filteredManualContacts.every((c) => manualSelectedIds.includes(c.id))
                          }
                          onChange={handleToggleSelectAllFiltered}
                          className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                        />
                        <span>Contact &amp; Business Name</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="hidden sm:inline">Category &amp; Rating</span>
                        <span>Phone Number</span>
                      </div>
                    </div>

                    {/* Table Body / Rows */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                      {isLoadingAllContacts ? (
                        <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                          <span>Loading all workspace contacts...</span>
                        </div>
                      ) : filteredManualContacts.length > 0 ? (
                        filteredManualContacts.map((c) => {
                          const isSelected = manualSelectedIds.includes(c.id);
                          const category =
                            (c.metadata as any)?.scraped_category ||
                            (c.metadata as any)?.category ||
                            "Lead";
                          const rating = (c.metadata as any)?.rating;
                          const city =
                            (c.metadata as any)?.search_query?.split(" ").pop() ||
                            (c.metadata as any)?.address;

                          return (
                            <div
                              key={c.id}
                              onClick={() => handleToggleSingleContact(c.id)}
                              className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-emerald-500/10 hover:bg-emerald-500/15"
                                  : "hover:bg-secondary/40"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // Handled by row onClick
                                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                                    <span>
                                      {c.company ||
                                        `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
                                        "Unnamed Contact"}
                                    </span>
                                    {isSelected && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground truncate">
                                    {c.company && (c.first_name || c.last_name)
                                      ? `${c.first_name || ""} ${c.last_name || ""}`.trim()
                                      : c.email || "No email"}
                                    {city && ` · ${city}`}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0 text-right">
                                <div className="hidden sm:block text-right">
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground">
                                    {category}
                                  </span>
                                  {rating && (
                                    <span className="text-[10px] text-amber-400 font-semibold ml-1.5">
                                      ★ {rating}
                                    </span>
                                  )}
                                </div>

                                <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {c.phone}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
                          <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto opacity-50" />
                          <p>No contacts found matching "{manualSearchQuery}"</p>
                          {manualSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setManualSearchQuery("")}
                              className="text-xs text-emerald-400 hover:underline"
                            >
                              Clear search filter
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick selection warning if none selected */}
                  {manualSelectedIds.length === 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Please select at least 1 contact using the checkboxes above to proceed.</span>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* AUDIENCE TYPE 3: DYNAMIC SEGMENT                              */}
              {/* ------------------------------------------------------------- */}
              {audienceType === "segment" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground/90">
                    Choose Segment
                  </label>
                  <select
                    value={audienceId}
                    onChange={(e) => setAudienceId(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                  >
                    {mockSegments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (~{s.contact_count} phone-verified contacts)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/70">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Details
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={audienceType === "manual" && manualSelectedIds.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>
                    {audienceType === "manual"
                      ? `Next: Compose Message (${manualSelectedIds.length} selected)`
                      : "Next: Compose Message"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Template & Mapping */}
          {step === 3 && (
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-6 shadow-sm">
              <div className="border-b border-border/70 pb-4">
                <h2 className="text-base font-bold text-foreground">
                  Step 3: {dispatchMode === "web_runner" ? "Compose Personalized WhatsApp Message" : "Select Approved Meta Template"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dispatchMode === "web_runner"
                    ? "Compose custom message copy and insert dynamic variables for each lead."
                    : "Map variables into pre-approved Meta Business Cloud API templates."}
                </p>
              </div>

              {dispatchMode === "web_runner" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-foreground/90">
                        Message Template Body
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        Click tags below to insert dynamic recipient variables
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground font-sans leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Type your message..."
                    />
                  </div>

                  {/* Dynamic tag insert buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground font-medium">Insert dynamic tag:</span>
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-foreground/90">
                        Select Meta Approved Template
                      </label>
                      <button
                        type="button"
                        onClick={handleSyncMetaTemplates}
                        disabled={isSyncingTemplates}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-xs text-emerald-400 hover:text-emerald-300 border border-border/80 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${isSyncingTemplates ? "animate-spin" : ""}`} />
                        <span>{isSyncingTemplates ? "Syncing..." : "Sync from Meta WABA"}</span>
                      </button>
                    </div>
                    <select
                      value={selectedTemplateName}
                      onChange={(e) => setSelectedTemplateName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {availableTemplates.map((t) => (
                        <option key={t.id || t.name} value={t.name}>
                          {t.name === "hello_world" ? "⚠️ [Sandbox Test Only] " : "⭐ [Approved WABA] "}
                          {t.name} ({t.category} · {t.language || "en_US"})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground">
                      Templates must be approved in your Meta Business Account before dispatch.
                    </p>
                  </div>

                  {/* Warning if hello_world is selected on live production number */}
                  {selectedTemplateName === "hello_world" && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-2">
                      <div className="font-semibold flex items-center gap-1.5 text-amber-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Meta Sandbox Template Restriction</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Meta strictly restricts the <code className="text-foreground bg-secondary px-1 py-0.5 rounded font-mono">hello_world</code> template to Meta Public Test Numbers. Since your account uses a live registered number (<strong className="text-foreground">+880 1575-041134</strong>), Meta will reject it with <span className="text-rose-400 font-semibold">Error #131058</span>.
                      </p>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplateName("welcome_notice")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>👉 Switch to Approved "welcome_notice" Template</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Template Message Preview */}
                  {selectedTemplate && (
                    <div className="p-3.5 rounded-xl bg-card/40 border border-border/80 space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>Template Message Preview</span>
                        <span className="font-mono text-[10px] text-emerald-400 font-normal">
                          {selectedTemplate.category} · {selectedTemplate.language || "en_US"}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 font-sans italic leading-relaxed bg-background/50 p-2.5 rounded-lg border border-border/40">
                        "{selectedTemplate.body_text || "No preview available for this template."}"
                      </p>
                    </div>
                  )}

                  {/* Dynamic Variable Mapping if template has variables */}
                  {selectedTemplate?.variables && selectedTemplate.variables.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-semibold text-foreground/90">
                        Template Dynamic Variables Mapping
                      </div>

                      <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 flex items-center justify-between">
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

                      {selectedTemplate.variables.length > 1 && (
                        <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 flex items-center justify-between">
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
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>This template has no variable placeholders. Content is standardized and ready to blast.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/70">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Audience
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Next: Review &amp; Launch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Final Review & Launch */}
          {step === 4 && (
            <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-6 shadow-sm">
              <div className="border-b border-border/70 pb-4">
                <h2 className="text-base font-bold text-foreground">
                  Step 4: Review Campaign &amp; Launch Outbound Blast
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm campaign parameters before launching the interactive runner or server broadcast.
                </p>
              </div>

              <div className="space-y-4">
                {/* Parameters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-1">
                    <span className="text-muted-foreground text-[11px]">Campaign Identity</span>
                    <div className="font-bold text-foreground text-sm truncate">{campaignName}</div>
                    <div className="text-[10px] text-muted-foreground">{campaignObjective}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-1">
                    <span className="text-muted-foreground text-[11px]">Dispatch Engine</span>
                    <div className={`font-bold text-sm ${dispatchMode === "web_runner" ? "text-emerald-400" : "text-primary"}`}>
                      {dispatchMode === "web_runner" ? "Direct WhatsApp Web Runner" : "Official Meta Cloud API"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {dispatchMode === "web_runner" ? "100% Free · Browser Automation" : "Meta Server Queue"}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-1">
                    <span className="text-muted-foreground text-[11px]">Audience Target</span>
                    <div className="font-bold text-foreground text-sm truncate">
                      {audienceType === "manual"
                        ? `Manual Selection (${listContacts.length} contacts)`
                        : audienceId === "all_contacts"
                        ? "All Workspace Contacts"
                        : selectedList?.name || "Selected List"}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      {listContacts.length > 0 ? listContacts.length : selectedList?.member_count || 0} phone-verified leads
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-1">
                    <span className="text-muted-foreground text-[11px]">Estimated Cost</span>
                    <div className="font-bold text-emerald-400 text-sm">
                      {dispatchMode === "web_runner" ? "$0.00 (100% Free)" : `~$${(listContacts.length * 0.038).toFixed(2)}`}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {dispatchMode === "web_runner" ? "Zero Meta fees" : "Standard Meta conversation fee"}
                    </div>
                  </div>
                </div>

                {/* Safety & Launch Notice */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Ready for Immediate Outbound Blast</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {dispatchMode === "web_runner"
                      ? "Clicking Launch will open the interactive Fast Runner modal. You can advance through leads or use Spacebar to open WhatsApp Web with each message pre-filled. Zero ban risk & zero fees."
                      : "Messages will be dispatched directly through your verified Meta WhatsApp Business Cloud API number."}
                  </p>
                </div>

                {/* CSV Export Option */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/40 border border-border/80">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Distribute to Sales Team</div>
                    <div className="text-[11px] text-muted-foreground">
                      Export click-to-chat CSV for manual outreach across multiple agents
                    </div>
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-card/80 border border-border text-xs font-semibold text-foreground transition-all shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-primary" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/70">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Message
                </button>

                <div className="flex items-center gap-3">
                  {dispatchMode === "web_runner" ? (
                    <button
                      onClick={() => setIsRunnerOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99]"
                    >
                      <Play className="h-4 w-4 fill-slate-950" />
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
                          <span>Queue &amp; Dispatch Server Blast</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Campaign Blueprint & Safety Sidebar */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          {/* Blueprint Card */}
          <div className="p-5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Campaign Blueprint</span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Blueprint Overview Specs */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Identity</span>
                <span className="font-semibold text-foreground truncate max-w-[170px]">
                  {campaignName || "Untitled Campaign"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Objective</span>
                <span className="text-muted-foreground truncate max-w-[170px]">
                  {campaignObjective}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Protocol</span>
                <span className={`font-semibold ${dispatchMode === "web_runner" ? "text-emerald-400" : "text-primary"}`}>
                  {dispatchMode === "web_runner" ? "⚡ Web Runner" : "🛡️ Meta WABA"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Audience</span>
                <span className="font-semibold text-foreground truncate max-w-[170px]">
                  {audienceType === "manual"
                    ? `Manual (${listContacts.length} selected)`
                    : audienceId === "all_contacts"
                    ? "All Workspace Contacts"
                    : selectedList?.name || "Selected Audience"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verified Leads</span>
                {listContacts.length > 0 ? (
                  <span className="font-mono text-emerald-400 font-bold">{listContacts.length} numbers</span>
                ) : (
                  <span className="text-muted-foreground/70 italic font-normal text-[11px]">Select in Step 2</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-muted-foreground">Estimated Cost</span>
                <span className="font-bold text-emerald-400">
                  {dispatchMode === "web_runner" ? "$0.00 Free" : `~$${(listContacts.length * 0.038).toFixed(2)}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ban Risk Rating</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>0% (Browser Safe)</span>
                </span>
              </div>
            </div>

            {/* Live WhatsApp Bubble Preview */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Live WhatsApp Bubble</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {listContacts[0]?.phone || "+880 1711-234567"}
                </span>
              </div>

              <div className="bg-[#0b141a] p-3.5 rounded-2xl border border-border/80 shadow-inner space-y-2">
                <div className="text-[10px] text-emerald-400/80 font-mono pb-1 border-b border-emerald-950 flex items-center justify-between">
                  <span>To: {listContacts[0]?.company || listContacts[0]?.first_name || "Apex Bike Care"}</span>
                  <span className="text-slate-400">WhatsApp</span>
                </div>
                <div className="bg-[#005c4b] text-foreground p-3 rounded-xl rounded-tr-none text-xs leading-relaxed shadow space-y-1.5">
                  <div className="whitespace-pre-line text-slate-100 text-[11px]">
                    {dispatchMode === "web_runner"
                      ? renderMessageForContact(listContacts[0])
                      : selectedTemplate?.body_text
                          ?.replace("{{1}}", listContacts[0]?.company || "Business Owner")
                          ?.replace("{{2}}", "Special Offer") || "Official Meta Template Preview"}
                  </div>
                  <div className="text-[9px] text-emerald-200/70 text-right flex items-center justify-end gap-1 pt-0.5">
                    <span>Just now</span>
                    <span className="text-cyan-300 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual Tip */}
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-emerald-400" />
                <span>Pro-Tip for Step {step}</span>
              </div>
              <p className="leading-normal">
                {step === 1 && "Direct Web Runner operates inside your browser, bypassing Meta 24-hour template verification completely."}
                {step === 2 && "Lists imported from Google Maps contain phone numbers sanitized for immediate WhatsApp outreach."}
                {step === 3 && "Dynamic tags like {{businessName}} will automatically personalize the message for each lead."}
                {step === 4 && "Use Spacebar to dispatch and cycle through leads instantly during the interactive runner session."}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                    Campaign: {campaignName} ·{" "}
                    {audienceType === "manual"
                      ? `Manual Selection (${listContacts.length} leads)`
                      : audienceId === "all_contacts"
                      ? "All Workspace Contacts"
                      : selectedList?.name}
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
            ) : serverDispatchResult ? (() => {
              const displaySent = Number(serverDispatchResult.sentCount ?? serverDispatchResult.summary?.sent ?? 0);
              const displayFailed = Number(
                serverDispatchResult.failedCount ?? serverDispatchResult.summary?.failed ?? (displaySent > 0 ? 0 : listContacts.length)
              );
              const has131058Error = serverDispatchResult.log?.some((e: any) => e.error?.includes("131058"));
              const has131030Error = serverDispatchResult.log?.some((e: any) => e.error?.includes("131030"));

              return (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  {displaySent > 0 ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
                  )}
                  <h3 className="text-base font-bold text-foreground">
                    {displaySent > 0
                      ? displayFailed > 0
                        ? "Broadcast Completed with Partial Delivery"
                        : "Broadcast Dispatched Successfully!"
                      : "Outbound Dispatch Failed"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {serverDispatchResult.message ||
                      `${displaySent} sent, ${displayFailed} failed.`}
                  </p>
                  {serverDispatchResult.error && (
                    <div className="text-[11px] text-rose-300 font-mono bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/25 max-w-md mx-auto text-left break-words">
                      <span className="font-bold text-rose-400">Server Error: </span>
                      {serverDispatchResult.error}
                    </div>
                  )}
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Accepted by Meta</span>
                    <div className="text-base font-bold text-emerald-400 font-mono">
                      {displaySent}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Failed / Rejected</span>
                    <div className="text-base font-bold text-rose-400 font-mono">
                      {displayFailed}
                    </div>
                  </div>
                </div>

                {/* Itemized Recipient Delivery Log */}
                {serverDispatchResult.log && serverDispatchResult.log.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted-foreground">
                      Recipient Delivery Details ({serverDispatchResult.log.length})
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40 rounded-xl bg-secondary/30 p-2.5 border border-border">
                      {serverDispatchResult.log.map((entry: any, i: number) => (
                        <div key={i} className="pt-1.5 first:pt-0 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground truncate max-w-[200px]">
                              {entry.name || entry.phone}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                entry.status === "sent"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {entry.status === "sent" ? "✓ Sent" : "✗ Rejected"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                            <span>+{entry.phone}</span>
                            {entry.messageId && (
                              <span className="text-emerald-400/80 truncate max-w-[150px]">
                                ID: {entry.messageId}
                              </span>
                            )}
                          </div>
                          {entry.error && (
                            <p className="text-[10px] text-rose-300 leading-snug bg-rose-950/20 p-1.5 rounded border border-rose-500/20">
                              {entry.error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error #131058 Actionable Guide */}
                {has131058Error && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-2">
                    <div className="font-semibold flex items-center gap-1.5 text-amber-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Resolution for Meta Error #131058</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Meta Cloud API forbids sending the default <code className="text-foreground bg-secondary px-1 py-0.5 rounded font-mono">hello_world</code> template from live production numbers. Since your number is live (<strong className="text-foreground">+880 1575-041134</strong>), select your approved business template:
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedTemplateName("welcome_notice");
                          setIsDispatchModalOpen(false);
                          setStep(3);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <span>👉 Use "welcome_notice" (Approved)</span>
                      </button>
                      <button
                        onClick={() => {
                          setDispatchMode("web_runner");
                          setIsDispatchModalOpen(false);
                          setIsRunnerOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <span>⚡ Launch via Web Runner (Free)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Helpful Sandbox Notice if any failed with 131030 */}
                {has131030Error && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>Meta Developer Sandbox Rule:</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Your Meta WhatsApp Cloud account is currently in development mode. Outbound messages can only be delivered to phone numbers that have been explicitly added to your <strong>Allowed Recipient List</strong> on <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">developers.facebook.com</a> under <em>WhatsApp &gt; API Setup &gt; Manage phone number list</em>.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setIsDispatchModalOpen(false);
                      router.push("/whatsapp/campaigns");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25"
                  >
                    View Campaigns
                  </button>
                  <button
                    onClick={() => setIsDispatchModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
              );
            })() : null}
          </div>
        </div>
      )}
    </div>
  );
}
