"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Shield,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { UserRole } from "@/types/database";

export default function TeamPage() {
  const [members, setMembers] = useState([
    {
      id: "m-1",
      name: "Sheikh Shariar Nehal",
      email: "nehal@acmeglobal.com",
      role: "owner" as UserRole,
      status: "active",
      joined: "2026-08-01",
    },
    {
      id: "m-2",
      name: "Sarah Jenkins",
      email: "sarah.j@acmeglobal.com",
      role: "admin" as UserRole,
      status: "active",
      joined: "2026-08-10",
    },
    {
      id: "m-3",
      name: "Marcus Vance",
      email: "marcus.v@acmeglobal.com",
      role: "marketing_manager" as UserRole,
      status: "invited",
      joined: "2026-09-02",
    },
  ]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("marketing_manager");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setMembers([
      ...members,
      {
        id: `m-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        status: "invited",
        joined: "Just now",
      },
    ]);
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary" />
            Team Members & Roles
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Invite coworkers and configure granular permissions across workspace resources.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Team table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-secondary/40">
              <th className="py-3 px-4 font-medium">User</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Joined</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/30">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-[10px]">
                      {m.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.email}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="capitalize px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground/90 font-medium">
                    {m.role.replace("_", " ")}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  {m.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                      <Clock className="h-3 w-3" /> Invited
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                  {m.joined}
                </td>

                <td className="py-3.5 px-4 text-right">
                  {m.role !== "owner" && (
                    <button
                      onClick={() =>
                        setMembers(members.filter((item) => item.id !== m.id))
                      }
                      className="text-muted-foreground hover:text-rose-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-foreground">
              Invite Team Member
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                >
                  <option value="admin">Administrator</option>
                  <option value="marketing_manager">Marketing Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
