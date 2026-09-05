"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ListFilter,
  Plus,
  Users,
  Search,
  MoreVertical,
  Calendar,
  SendHorizontal,
  Mail,
  MessageSquare,
  Trash2,
  Edit2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getLists, createList, deleteList } from "@/lib/contacts/service";
import { ContactList } from "@/types/database";
import { useAuth } from "@/components/providers/auth-provider";

export default function ContactListsPage() {
  const { workspace, user, isLoading: authLoading } = useAuth();

  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");

  const loadLists = async (wsId: string) => {
    setIsLoading(true);
    try {
      const data = await getLists(wsId);
      setLists(data || []);
    } catch (err) {
      console.error("Failed to load lists:", err);
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workspace?.id) {
      loadLists(workspace.id);
    } else if (!authLoading && !workspace) {
      setIsLoading(false);
    }
  }, [workspace?.id, authLoading]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !workspace?.id) return;

    setIsSubmitting(true);
    try {
      const created = await createList(
        workspace.id,
        newListName.trim(),
        newListDesc.trim()
      );

      if (created) {
        setLists((prev) => [created, ...prev]);
        setNewListName("");
        setNewListDesc("");
        setIsNewModalOpen(false);
      }
    } catch (err) {
      console.error("Error creating list:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list?")) return;

    const ok = await deleteList(listId);
    if (ok) {
      setLists((prev) => prev.filter((l) => l.id !== listId));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <ListFilter className="h-6 w-6 text-primary" />
              Contact Lists
            </h1>
            {workspace && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-medium">
                {workspace.name}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Segment and organize contacts in your workspace for targeted Email &amp; WhatsApp broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {workspace?.id && (
            <button
              onClick={() => loadLists(workspace.id)}
              title="Refresh lists"
              className="p-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          )}

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all active:scale-[0.99]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New List</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading workspace lists...</p>
        </div>
      ) : lists.length > 0 ? (
        /* Grid of user-scoped lists */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {lists.map((list) => (
            <div
              key={list.id}
              className="glass-card-interactive p-5 rounded-2xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Users className="h-5 w-5" />
                  </div>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    title="Delete list"
                    className="text-muted-foreground hover:text-rose-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h2 className="text-base font-semibold text-foreground mt-3">
                  {list.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {list.description || "No description provided."}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-lg font-bold text-foreground">
                    {list.member_count?.toLocaleString() || 0}
                  </span>{" "}
                  <span className="text-muted-foreground">contacts</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/whatsapp/campaigns/new?listId=${list.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </Link>
                  <span className="text-border">·</span>
                  <Link
                    href={`/email/campaigns/new?listId=${list.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    <span>Email</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State for user who has no lists yet */
        <div className="glass-panel p-10 rounded-3xl border border-dashed border-border/80 text-center max-w-lg mx-auto my-8 space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <ListFilter className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-foreground">
              No contact lists in this workspace yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create a custom static list to segment your contacts, or stream Google Maps leads directly using the Chrome Extension scraper.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25 flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create First List</span>
            </button>

            <Link
              href="/contacts"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold border border-border flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Import Scraped Leads</span>
            </Link>
          </div>
        </div>
      )}

      {/* New List Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Create New Contact List
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Targeting workspace: <strong>{workspace?.name || "My Workspace"}</strong>
              </p>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Dhaka Wholesale Leads"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Describe the audience or purpose of this list..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create List</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
