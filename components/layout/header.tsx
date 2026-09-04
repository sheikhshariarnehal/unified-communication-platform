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
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

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
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
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

        {/* User profile avatar */}
        <div
          title="Account: Shariar Nehal (Acme Global)"
          className="h-8 w-8 rounded-lg bg-primary hover:opacity-90 flex items-center justify-center text-primary-foreground text-xs font-semibold shadow-2xs cursor-pointer transition-opacity"
        >
          SN
        </div>
      </div>
    </header>
  );
}
