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
} from "lucide-react";
import { mockLists, getLists } from "@/lib/contacts/service";
import { ContactList } from "@/types/database";

export default function ContactListsPage() {
  const [lists, setLists] = useState<ContactList[]>(mockLists);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getLists();
      if (data && data.length > 0) setLists(data);
    }
    load();
  }, []);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const created: ContactList = {
      id: `list-${Date.now()}`,
      workspace_id: "a0000000-0000-0000-0000-000000000001",
      name: newListName,
      description: newListDesc,
      member_count: 0,
      created_at: new Date().toISOString().split("T")[0],
    };

    setLists([created, ...lists]);
    setNewListName("");
    setNewListDesc("");
    setIsNewModalOpen(false);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ListFilter className="h-6 w-6 text-primary" />
            Static Contact Lists
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize contacts into dedicated static groups for targeted email and WhatsApp broadcasts.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New List</span>
        </button>
      </div>

      {/* Grid of lists */}
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
                  onClick={() => setLists(lists.filter((l) => l.id !== list.id))}
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
                  {list.member_count?.toLocaleString()}
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

      {/* New List Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-foreground">
              Create New Contact List
            </h2>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. VIP Newsletter Subscribers"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Describe the audience or purpose of this list..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
