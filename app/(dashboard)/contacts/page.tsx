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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [tags, setTags] = useState<Tag[]>(mockTags);
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

  const refreshContacts = async () => {
    const [cData, tData] = await Promise.all([getContacts(), getTags()]);
    if (cData) setContacts(cData);
    if (tData) setTags(tData);
  };

  const handleJsonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingScraper(true);
    setScraperSyncStats(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch("/api/v1/leads/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (data.success) {
        setScraperSyncStats(data);
        await refreshContacts();
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
    async function loadData() {
      try {
        await refreshContacts();
      } catch (err) {
        console.error("Error loading contacts from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openScraper") === "true") {
        setIsScraperModalOpen(true);
      }
    }
  }, []);

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
      const saved = await createContact({
        first_name: newContact.first_name,
        last_name: newContact.last_name,
        email: newContact.email || undefined,
        phone: newContact.phone || undefined,
        company: newContact.company || undefined,
        country: newContact.country,
        tag_ids: tags[0]?.id ? [tags[0].id] : [],
      });

      if (saved) {
        setContacts([saved, ...contacts]);
      } else {
        const fallback: Contact = {
          id: `cnt-${Date.now()}`,
          workspace_id: "a0000000-0000-0000-0000-000000000001",
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
      )}

      {/* Chrome Extension & Google Maps Scraper Integration Modal */}
      {isScraperModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    Connect Google Maps Chrome Extension
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                      Automated Ingestion API
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Stream scraped leads directly into your contacts with automatic BD phone normalization (+880), deduplication & WhatsApp tagging.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScraperModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-medium p-1 rounded-lg hover:bg-secondary"
              >
                ✕
              </button>
            </div>

            {/* Quick Webhook Endpoint & Key Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Ingestion API URL</span>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/api/v1/leads/ingest`;
                      navigator.clipboard.writeText(url);
                      setCopiedEndpoint(true);
                      setTimeout(() => setCopiedEndpoint(false), 2000);
                    }}
                    className="text-primary hover:underline flex items-center gap-1 normal-case text-[11px]"
                  >
                    {copiedEndpoint ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedEndpoint ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="font-mono text-xs text-foreground truncate select-all">
                  {typeof window !== "undefined" ? `${window.location.origin}/api/v1/leads/ingest` : "/api/v1/leads/ingest"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Extension API Key</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("ewc_live_9a7fe91bc2d8");
                      setCopiedApiKey(true);
                      setTimeout(() => setCopiedApiKey(false), 2000);
                    }}
                    className="text-primary hover:underline flex items-center gap-1 normal-case text-[11px]"
                  >
                    {copiedApiKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copiedApiKey ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="font-mono text-xs text-foreground truncate select-all">
                  ewc_live_9a7fe91bc2d8
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border gap-2">
              <button
                onClick={() => setActiveSnippetTab("flow")}
                className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-all ${
                  activeSnippetTab === "flow"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Find Leads on Google Maps
              </button>
              <button
                onClick={() => setActiveSnippetTab("code")}
                className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-all ${
                  activeSnippetTab === "code"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                2. Extension Setup & Code
              </button>
              <button
                onClick={() => setActiveSnippetTab("curl")}
                className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-all ${
                  activeSnippetTab === "curl"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                3. Direct JSON File Drop
              </button>
            </div>

            {/* Tab 1: Guided Lead Generation Flow */}
            {activeSnippetTab === "flow" && (
              <div className="space-y-4">
                {/* Step 1: Install Extension Card */}
                <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">1</span>
                      Install Chrome Extension
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                      v1.0.0 Production Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option A: Direct ZIP Download */}
                    <a
                      href="/downloads/leadmap-extension.zip"
                      download="leadmap-extension.zip"
                      className="p-3 rounded-xl bg-card hover:bg-card/80 border border-primary/30 hover:border-primary flex items-start gap-2.5 transition-all group shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Download className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>Download Extension (.zip)</span>
                          <span className="text-[10px] px-1 rounded bg-secondary text-muted-foreground font-mono">180KB</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Download package directly from your server &amp; load into Chrome.
                        </p>
                      </div>
                    </a>

                    {/* Option B: Chrome Web Store */}
                    <a
                      href="https://chromewebstore.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-card hover:bg-card/80 border border-border hover:border-border/80 flex items-start gap-2.5 transition-all group shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <span>Chrome Web Store</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          1-click install once published to the Chrome Store.
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* 3-Step Setup Guide */}
                  <div className="p-2.5 rounded-lg bg-card/60 border border-border text-xs text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground text-[11px]">Quick 3-Step Setup (for ZIP Download):</div>
                    <ol className="list-decimal list-inside text-[11px] space-y-0.5 pl-0.5">
                      <li>Download and extract <code className="text-foreground font-mono bg-secondary px-1 rounded">leadmap-extension.zip</code> on your computer.</li>
                      <li>Go to <code className="text-foreground font-mono bg-secondary px-1 rounded">chrome://extensions</code> in Chrome and enable <strong>Developer mode</strong> (top-right).</li>
                      <li>Click <strong>Load unpacked</strong> and select the extracted folder.</li>
                    </ol>
                  </div>

                  {/* Local Developer path (only shown if on localhost) */}
                  {typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
                    <div className="flex items-center justify-between bg-card/40 p-2 rounded-lg border border-border text-[11px] font-mono text-muted-foreground">
                      <span className="truncate">Local Dev: D:\Poject\...\Chrome Extension\dist</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("D:\\Poject\\Unified Email & WhatsApp Communication Platform\\Chrome Extension\\dist");
                          setCopiedPath(true);
                          setTimeout(() => setCopiedPath(false), 2000);
                        }}
                        className="ml-2 text-primary hover:underline text-xs flex items-center gap-1 shrink-0 font-sans"
                      >
                        {copiedPath ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copiedPath ? "Copied!" : "Copy Local Path"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 2: Search Parameters & Launch */}
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-3">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">2</span>
                    Target Audience Search
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Business Keyword / Category
                      </label>
                      <input
                        type="text"
                        value={mapsKeyword}
                        onChange={(e) => setMapsKeyword(e.target.value)}
                        placeholder="e.g. Mobile shop, Restaurant, Clinic"
                        className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={mapsCity}
                        onChange={(e) => setMapsCity(e.target.value)}
                        placeholder="e.g. Dhaka, Gulshan, Banani"
                        className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const q = `${mapsKeyword} ${mapsCity}`.trim();
                      const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
                      window.open(url, "_blank");
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-[0.99]"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Open Google Maps &amp; Start Scraping &quot;{mapsKeyword} {mapsCity}&quot;</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Step 3: Explanation Card */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Automatic Sync on Scrape Complete</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    When Google Maps opens, open the <strong>LeadMap sidepanel</strong> and click <strong>Start Collection</strong>. When you stop collection or click <strong>&quot;Push to Platform&quot;</strong>, all leads are automatically streamed into this platform with E.164 phone formatting and grouped into a campaign list!
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Extension Code & Snippets */}
            {activeSnippetTab === "code" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  The extension is already configured to point to <code className="text-foreground font-mono">http://localhost:3000/api/v1/leads/ingest</code> with key <code className="text-foreground font-mono">ewc_live_9a7fe91bc2d8</code>.
                </p>
                <div className="relative rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                  <pre>{`// In your scraper's service-worker or popup:
fetch("${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/v1/leads/ingest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ewc_live_9a7fe91bc2d8"
  },
  body: JSON.stringify(scrapedLeads)
});`}</pre>
                  <button
                    onClick={() => {
                      const code = `fetch("${window.location.origin}/api/v1/leads/ingest", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer ewc_live_9a7fe91bc2d8"\n  },\n  body: JSON.stringify(scrapedLeads)\n});`;
                      navigator.clipboard.writeText(code);
                      alert("Code copied to clipboard!");
                    }}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 border border-slate-700"
                  >
                    <Copy className="h-3 w-3" /> Copy Code
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Direct File Upload */}
            {activeSnippetTab === "curl" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Already downloaded a <code className="text-foreground font-mono font-semibold">leadmap-leads-*.json</code> file? Drop it here to import immediately without needing to modify the extension!
                </p>

                <div className="p-6 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl bg-secondary/20 text-center space-y-3 transition-colors">
                  <FileJson className="h-10 w-10 text-primary mx-auto opacity-70" />
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md transition-all">
                      <Upload className="h-4 w-4" />
                      <span>{isUploadingScraper ? "Processing Leads..." : "Select JSON Leads File"}</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleJsonFileUpload}
                        disabled={isUploadingScraper}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Accepts Google Maps JSON formats matching businessName, phone, rating, category, etc.
                  </p>
                </div>
              </div>
            )}

            {/* Stats Result Banner */}
            {scraperSyncStats && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{scraperSyncStats.message}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-emerald-500/20 text-xs">
                  <div>
                    <div className="font-bold text-foreground">{scraperSyncStats.stats.totalReceived}</div>
                    <div className="text-[10px] text-muted-foreground">Received</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-400">{scraperSyncStats.stats.whatsappEligible}</div>
                    <div className="text-[10px] text-muted-foreground">WhatsApp Ready</div>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{scraperSyncStats.stats.inserted}</div>
                    <div className="text-[10px] text-muted-foreground">New Inserted</div>
                  </div>
                  <div>
                    <div className="font-bold text-amber-400">{scraperSyncStats.stats.landlines}</div>
                    <div className="text-[10px] text-muted-foreground">Landlines</div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="text-[11px] text-muted-foreground">
                All leads are placed in list: <span className="font-medium text-foreground">Google Maps: mobile shop dhaka</span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={scraperSyncStats?.campaignUrls?.whatsapp || "/whatsapp/campaigns/new"}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Start WhatsApp Campaign</span>
                </Link>
                <button
                  onClick={() => setIsScraperModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
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
