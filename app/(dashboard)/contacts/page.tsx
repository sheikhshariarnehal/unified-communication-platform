"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Trash2,
  Tag as TagIcon,
  MoreVertical,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FolderPlus,
  ArrowUpDown,
  ExternalLink,
  Loader2,
  Sparkles,
  Copy,
  Check,
  FileJson,
  MessageSquare,
  Star,
  Zap,
  Globe,
  X,
} from "lucide-react";
import {
  getContacts,
  getTags,
  createContact,
  deleteContact,
  mockContacts,
  mockTags,
} from "@/lib/contacts/service";
import { Contact, Tag, ContactStatus } from "@/types/database";
import { useAuth } from "@/components/providers/auth-provider";

export default function ContactsPage() {
  const { workspace } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScraperModalOpen, setIsScraperModalOpen] = useState(false);
  const [isUploadingScraper, setIsUploadingScraper] = useState(false);
  const [scraperSyncStats, setScraperSyncStats] = useState<any>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [mapsKeyword, setMapsKeyword] = useState("Mobile shop");
  const [mapsCity, setMapsCity] = useState("Dhaka");
  const [activeSnippetTab, setActiveSnippetTab] = useState<"flow" | "code" | "curl">("flow");

  const refreshContacts = async (wsId?: string) => {
    const targetWs = wsId || workspace?.id;
    if (!targetWs) return;
    const [cData, tData] = await Promise.all([getContacts(targetWs), getTags(targetWs)]);
    setContacts(cData || []);
    setTags(tData || []);
  };

  const handleJsonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingScraper(true);
    setScraperSyncStats(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (workspace?.id && Array.isArray(parsed)) {
        // Embed user's workspace
        parsed.forEach((item: any) => {
          item.workspace_id = workspace.id;
        });
      }
      const res = await fetch("/api/v1/leads/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (data.success) {
        setScraperSyncStats(data);
        await refreshContacts(workspace?.id);
      } else {
        alert(data.error || "Failed to ingest leads");
      }
    } catch (err: any) {
      alert("Invalid JSON file: " + err.message);
    } finally {
      setIsUploadingScraper(false);
    }
  };

  useEffect(() => {
    if (workspace?.id) {
      setIsLoading(true);
      refreshContacts(workspace.id)
        .catch((err) => console.error("Error loading contacts from Supabase:", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openScraper") === "true") {
        setIsScraperModalOpen(true);
      }
    }
  }, [workspace?.id]);

  // New Contact form state
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    country: "United States",
  });

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      `${c.first_name || ""} ${c.last_name || ""} ${c.email || ""} ${c.phone || ""} ${c.company || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;
    const matchesTag =
      selectedTag === "all" ||
      (c.tags && c.tags.some((t) => t.name === selectedTag));
    return matchesSearch && matchesStatus && matchesTag;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredContacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.email && !newContact.phone) return;

    setIsSubmitting(true);
    try {
      const targetWs = workspace?.id || "a0000000-0000-0000-0000-000000000001";
      const saved = await createContact({
        first_name: newContact.first_name,
        last_name: newContact.last_name,
        email: newContact.email || undefined,
        phone: newContact.phone || undefined,
        company: newContact.company || undefined,
        country: newContact.country,
        tag_ids: tags[0]?.id ? [tags[0].id] : [],
      }, targetWs);

      if (saved) {
        setContacts([saved, ...contacts]);
      } else {
        const fallback: Contact = {
          id: `cnt-${Date.now()}`,
          workspace_id: targetWs,
          first_name: newContact.first_name,
          last_name: newContact.last_name,
          email: newContact.email || null,
          phone: newContact.phone || null,
          company: newContact.company || null,
          country: newContact.country,
          status: "subscribed",
          source: "Manual",
          unsubscribe_token: `tok_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: tags.slice(0, 1),
        };
        setContacts([fallback, ...contacts]);
      }
      setIsAddModalOpen(false);
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company: "",
        country: "United States",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = [...selectedIds];
    setSelectedIds([]);
    setContacts((prev) => prev.filter((c) => !idsToDelete.includes(c.id)));
    for (const id of idsToDelete) {
      await deleteContact(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary" />
            Contacts Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Centralized audience directory for unified Email and WhatsApp campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsScraperModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Chrome Scraper Sync</span>
          </button>

          <Link
            href="/contacts/import"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary text-foreground border border-border text-xs font-medium transition-colors"
          >
            <Upload className="h-3.5 w-3.5 text-primary" />
            <span>Import CSV</span>
          </Link>

          <button
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                ["First Name,Last Name,Email,Phone,Company,Status"]
                  .concat(
                    contacts.map(
                      (c) =>
                        `"${c.first_name || ""}","${c.last_name || ""}","${c.email || ""}","${c.phone || ""}","${c.company || ""}","${c.status}"`
                    )
                  )
                  .join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "contacts_export.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary text-foreground border border-border text-xs font-medium transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, company..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "subscribed", "unsubscribed", "bounced"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {st}
            </button>
          ))}

          {/* Tag Filter Dropdown */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-card border border-border text-foreground/90 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary"
          >
            <option value="all">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Selection Bulk Action Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-indigo-950/60 border border-primary/30 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
              {selectedIds.length}
            </span>
            <span>contacts selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/whatsapp/campaigns/new"
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Broadcast WhatsApp ({selectedIds.length})</span>
            </Link>

            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Contacts Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredContacts.length &&
                      filteredContacts.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border bg-secondary text-indigo-600 focus:ring-0 focus:ring-offset-0"
                  />
                </th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">WhatsApp / Phone</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Tags</th>
                <th className="py-3 px-4 font-medium">Source</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No contacts found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try adjusting your search filters or import a new list.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedIds.includes(contact.id);
                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-secondary/30 transition-colors ${
                        isSelected ? "bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(contact.id)}
                          className="rounded border-border bg-secondary text-indigo-600 focus:ring-0 focus:ring-offset-0"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-semibold text-foreground shrink-0">
                            {(contact.first_name?.[0] || "") +
                              (contact.last_name?.[0] || "C")}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground flex items-center gap-1.5 flex-wrap">
                              <span>
                                {contact.first_name || contact.last_name
                                  ? `${contact.first_name || ""} ${contact.last_name || ""}`
                                  : "Unnamed Contact"}
                              </span>
                              {contact.metadata?.rating && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20">
                                  <Star className="h-2.5 w-2.5 fill-amber-500" />
                                  {contact.metadata.rating}
                                  {contact.metadata.review_count ? (
                                    <span className="text-muted-foreground font-normal">
                                      ({contact.metadata.review_count})
                                    </span>
                                  ) : null}
                                </span>
                              )}
                              {contact.metadata?.maps_url && (
                                <a
                                  href={contact.metadata.maps_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary transition-colors inline-block"
                                  title="Open on Google Maps"
                                >
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                            {(contact.metadata?.address || contact.company) && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">
                                {contact.metadata?.address || contact.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-foreground/90">
                        {contact.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{contact.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic">No email</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-foreground/90">
                        {contact.phone ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="h-3 w-3 text-emerald-400" />
                              <span>{contact.phone}</span>
                            </div>
                            {contact.metadata?.is_whatsapp_eligible === true && (
                              <div className="text-[9px] font-medium text-emerald-500 flex items-center gap-0.5">
                                <Check className="h-2 w-2" /> WhatsApp Ready
                              </div>
                            )}
                            {contact.metadata?.phone_type === "landline" && (
                              <div className="text-[9px] font-medium text-amber-500">
                                Landline (Voice only)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic">No phone</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {contact.status === "subscribed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Subscribed
                          </span>
                        )}
                        {contact.status === "unsubscribed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                            <AlertCircle className="h-2.5 w-2.5" /> Unsubscribed
                          </span>
                        )}
                        {contact.status === "bounced" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                            <XCircle className="h-2.5 w-2.5" /> Bounced
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          {contact.tags?.map((t) => (
                            <span
                              key={t.id}
                              style={{
                                backgroundColor: `${t.color}15`,
                                borderColor: `${t.color}35`,
                                color: t.color,
                              }}
                              className="text-[10px] px-1.5 py-0.5 rounded border font-medium"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        {contact.source}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setContacts(contacts.filter((c) => c.id !== contact.id));
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-secondary transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add New Contact
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact.first_name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, first_name: e.target.value })
                    }
                    placeholder="e.g. Jane"
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newContact.last_name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, last_name: e.target.value })
                    }
                    placeholder="e.g. Doe"
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Phone (WhatsApp E.164)
                </label>
                <input
                  type="text"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) =>
                      setNewContact({ ...newContact, company: e.target.value })
                    }
                    placeholder="Company Inc"
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newContact.country}
                    onChange={(e) =>
                      setNewContact({ ...newContact, country: e.target.value })
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {/* Chrome Extension & Google Maps Scraper Integration Modal */}
      {isScraperModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  Google Maps Lead Ingestion
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Stream business contacts from Maps directly into this workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsScraperModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border gap-5">
              <button
                type="button"
                onClick={() => setActiveSnippetTab("flow")}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
                  activeSnippetTab === "flow"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Search &amp; Scrape
              </button>
              <button
                type="button"
                onClick={() => setActiveSnippetTab("curl")}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
                  activeSnippetTab === "curl"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Import JSON
              </button>
              <button
                type="button"
                onClick={() => setActiveSnippetTab("code")}
                className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
                  activeSnippetTab === "code"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                API &amp; Setup
              </button>
            </div>

            {/* Tab 1: Guided Lead Generation Flow */}
            {activeSnippetTab === "flow" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Need the extension?</span>
                  <div className="flex items-center gap-2.5">
                    <a
                      href="/downloads/leadmap-extension.zip"
                      download="leadmap-extension.zip"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download .zip</span>
                    </a>
                    <span className="text-border">·</span>
                    <a
                      href="https://chromewebstore.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Globe className="h-3 w-3" />
                      <span>Web Store</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Category or Keyword
                    </label>
                    <input
                      type="text"
                      value={mapsKeyword}
                      onChange={(e) => setMapsKeyword(e.target.value)}
                      placeholder="e.g. Mobile shop, Clinic"
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      City or Location
                    </label>
                    <input
                      type="text"
                      value={mapsCity}
                      onChange={(e) => setMapsCity(e.target.value)}
                      placeholder="e.g. Dhaka, Banani"
                      className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const q = `${mapsKeyword} ${mapsCity}`.trim();
                    const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
                    window.open(url, "_blank");
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Launch Google Maps &amp; Scrape</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </button>

                <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                  Collected leads stream into this workspace with BD phone normalization (+880) and WhatsApp tagging.
                </p>
              </div>
            )}

            {/* Tab 2: Direct File Upload */}
            {activeSnippetTab === "curl" && (
              <div className="space-y-3">
                <div className="p-6 border-2 border-dashed border-border hover:border-primary/40 rounded-xl bg-secondary/15 text-center space-y-2.5 transition-colors">
                  <FileJson className="h-8 w-8 text-primary/70 mx-auto" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Import leads from JSON
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Select or drop your exported leadmap-leads.json file.
                    </p>
                  </div>
                  <div className="pt-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium transition-colors">
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      <span>{isUploadingScraper ? "Processing Leads..." : "Choose File"}</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleJsonFileUpload}
                        disabled={isUploadingScraper}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: API & Setup */}
            {activeSnippetTab === "code" && (
              <div className="space-y-3.5 text-xs">
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1">
                      <span>Ingestion Endpoint</span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/api/v1/leads/ingest`;
                          navigator.clipboard.writeText(url);
                          setCopiedEndpoint(true);
                          setTimeout(() => setCopiedEndpoint(false), 2000);
                        }}
                        className="text-primary hover:underline flex items-center gap-1 font-normal"
                      >
                        {copiedEndpoint ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedEndpoint ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-foreground truncate select-all">
                      {typeof window !== "undefined" ? `${window.location.origin}/api/v1/leads/ingest` : "/api/v1/leads/ingest"}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground mb-1">
                      <span>Extension API Key</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("ewc_live_9a7fe91bc2d8");
                          setCopiedApiKey(true);
                          setTimeout(() => setCopiedApiKey(false), 2000);
                        }}
                        className="text-primary hover:underline flex items-center gap-1 font-normal"
                      >
                        {copiedApiKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedApiKey ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xs bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-foreground truncate select-all">
                      ewc_live_9a7fe91bc2d8
                    </div>
                  </div>
                </div>

                {typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Local Extension Path</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("D:\\Poject\\Unified Email & WhatsApp Communication Platform\\Chrome Extension\\dist");
                          setCopiedPath(true);
                          setTimeout(() => setCopiedPath(false), 2000);
                        }}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {copiedPath ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedPath ? "Copied" : "Copy path"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded border border-border truncate">
                      Chrome Extension\dist
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats Result Banner */}
            {scraperSyncStats && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{scraperSyncStats.message}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-emerald-500/15 text-center text-[11px]">
                  <div>
                    <div className="font-semibold text-foreground">{scraperSyncStats.stats.totalReceived}</div>
                    <div className="text-[10px] text-muted-foreground">Received</div>
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">{scraperSyncStats.stats.whatsappEligible}</div>
                    <div className="text-[10px] text-muted-foreground">WhatsApp</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{scraperSyncStats.stats.inserted}</div>
                    <div className="text-[10px] text-muted-foreground">New</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{scraperSyncStats.stats.landlines}</div>
                    <div className="text-[10px] text-muted-foreground">Landlines</div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="text-[11px] text-muted-foreground">
                Destination: <span className="font-medium text-foreground">{mapsKeyword ? `${mapsKeyword} (${mapsCity})` : "Google Maps Leads"}</span>
              </div>
              <div className="flex items-center gap-2">
                {scraperSyncStats?.campaignUrls?.whatsapp && (
                  <Link
                    href={scraperSyncStats.campaignUrls.whatsapp}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Start Campaign</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsScraperModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
