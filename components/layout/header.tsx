"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Bell,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  GitFork,
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  Key,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";

export function Header() {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Shariar Nehal";

  const email = user?.email || "admin@acmeglobal.com";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SN";

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Search with Keyboard Shortcut Indicator */}
      <div className="relative w-72 lg:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search contacts, campaigns, templates..."
          className="w-full bg-secondary/50 hover:bg-secondary/80 focus:bg-background border border-border rounded-lg pl-9 pr-14 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
          <kbd className="text-[10px] text-muted-foreground font-mono bg-card border border-border px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Global Create Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setCreateMenuOpen(!createMenuOpen);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create</span>
            <ChevronDown
              className={`h-3 w-3 opacity-70 transition-transform duration-150 ${
                createMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {createMenuOpen && (
            <div
              onMouseLeave={() => setCreateMenuOpen(false)}
              className="absolute right-0 mt-1.5 w-56 rounded-xl bg-popover text-popover-foreground border border-border shadow-lg p-1.5 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Actions
              </div>

              <Link
                href="/email/campaigns/new"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="p-1 rounded bg-primary/20 text-foreground">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Email Campaign</div>
                  <div className="text-[10px] text-muted-foreground">Blast rich responsive email</div>
                </div>
              </Link>

              <Link
                href="/whatsapp/campaigns/new"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-medium text-foreground">WhatsApp Campaign</div>
                  <div className="text-[10px] text-muted-foreground">Send Meta template messages</div>
                </div>
              </Link>

              <Link
                href="/contacts/import"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="p-1 rounded bg-secondary text-muted-foreground">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Import Contacts</div>
                  <div className="text-[10px] text-muted-foreground">Upload CSV or Excel list</div>
                </div>
              </Link>

              <Link
                href="/automations/new"
                onClick={() => setCreateMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="p-1 rounded bg-secondary text-muted-foreground">
                  <GitFork className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-medium text-foreground">New Automation</div>
                  <div className="text-[10px] text-muted-foreground">Multi-step trigger workflow</div>
                </div>
              </Link>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* Theme Toggle (Light / Dark) */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          type="button"
          title="Notifications"
          className="h-8 w-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background" />
        </button>

        {/* User profile avatar with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setCreateMenuOpen(false);
            }}
            title={`Account: ${fullName} (${email})`}
            className="h-8 w-8 rounded-lg bg-primary hover:opacity-90 flex items-center justify-center text-primary-foreground text-xs font-semibold shadow-2xs cursor-pointer transition-all ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {initials}
          </button>

          {userMenuOpen && (
            <div
              onMouseLeave={() => setUserMenuOpen(false)}
              className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-popover text-popover-foreground border border-border shadow-xl p-2 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {/* User identity card */}
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 mb-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-foreground truncate max-w-[140px]">
                    {fullName}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                    Owner
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate font-mono">
                  {email}
                </div>
              </div>

              {/* Navigation items */}
              <div className="space-y-0.5 py-1">
                <Link
                  href="/settings/workspace"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Workspace Settings</span>
                </Link>

                <Link
                  href="/settings/team"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Team Members</span>
                </Link>

                <Link
                  href="/settings/api-keys"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground transition-colors"
                >
                  <Key className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>API Keys &amp; Webhooks</span>
                </Link>
              </div>

              <div className="border-t border-border my-1" />

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={async () => {
                  setUserMenuOpen(false);
                  await signOut();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="font-semibold">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
