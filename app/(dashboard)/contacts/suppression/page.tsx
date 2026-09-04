"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Plus,
  Trash2,
  Search,
  Download,
  Mail,
  Phone,
  AlertCircle,
  XCircle,
  Ban,
} from "lucide-react";
import { mockSuppression, getSuppressionList } from "@/lib/contacts/service";
import { SuppressionEntry } from "@/types/database";

export default function SuppressionPage() {
  const [entries, setEntries] = useState<SuppressionEntry[]>(mockSuppression);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSuppressionList();
      if (data && data.length > 0) setEntries(data);
    }
    load();
  }, []);

  const [newType, setNewType] = useState<"email" | "phone">("email");
  const [newValue, setNewValue] = useState("");
  const [newReason, setNewReason] = useState<
    "unsubscribed" | "bounced" | "complaint" | "opt_out" | "manual_block"
  >("manual_block");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    const created: SuppressionEntry = {
      id: `sup-${Date.now()}`,
      workspace_id: "ws-1",
      type: newType,
      value: newValue.trim(),
      reason: newReason,
      created_at: "Just now",
    };

    setEntries([created, ...entries]);
    setNewValue("");
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-rose-400" />
            Suppression Lists & Opt-Outs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Contacts suppressed from future broadcasts to maintain compliance with email and WhatsApp regulations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-foreground text-xs font-semibold shadow-md shadow-rose-600/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add to Suppression</span>
          </button>
        </div>
      </div>

      {isAddOpen && (
        <form
          onSubmit={handleAdd}
          className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center gap-3 animate-in fade-in"
        >
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as any)}
            className="bg-background border border-border text-foreground text-xs rounded-lg px-3 py-1.5"
          >
            <option value="email">Email Address</option>
            <option value="phone">WhatsApp Phone</option>
          </select>

          <input
            type="text"
            required
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={
              newType === "email" ? "recipient@example.com" : "+1 (555) 000-0000"
            }
            className="flex-1 bg-background border border-border text-foreground text-xs rounded-lg px-3 py-1.5"
          />

          <select
            value={newReason}
            onChange={(e) => setNewReason(e.target.value as any)}
            className="bg-background border border-border text-foreground text-xs rounded-lg px-3 py-1.5"
          >
            <option value="manual_block">Manual Block</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Hard Bounced</option>
            <option value="complaint">Spam Complaint</option>
            <option value="opt_out">WhatsApp Opt-Out</option>
          </select>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-rose-600 text-foreground text-xs font-semibold"
          >
            Block
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(false)}
            className="text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Suppression entries table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-secondary/40">
              <th className="py-3 px-4 font-medium">Channel / Type</th>
              <th className="py-3 px-4 font-medium">Contact Address</th>
              <th className="py-3 px-4 font-medium">Suppression Reason</th>
              <th className="py-3 px-4 font-medium">Date Added</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-secondary/30">
                <td className="py-3 px-4">
                  {entry.type === "email" ? (
                    <span className="inline-flex items-center gap-1.5 text-primary">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 font-mono text-foreground">
                  {entry.value}
                </td>

                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] uppercase font-semibold">
                    <Ban className="h-2.5 w-2.5" /> {entry.reason.replace("_", " ")}
                  </span>
                </td>

                <td className="py-3 px-4 text-muted-foreground">{entry.created_at}</td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() =>
                      setEntries(entries.filter((e) => e.id !== entry.id))
                    }
                    className="text-muted-foreground hover:text-emerald-400 text-xs font-medium"
                  >
                    Unblock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
