"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  MessageSquare,
  GitFork,
  BarChart3,
  Key,
  Settings,
  ChevronDown,
  SendHorizontal,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: Array<{ title: string; href: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    href: "/contacts",
    icon: Users,
    badge: "12.4k",
    children: [
      { title: "All Contacts", href: "/contacts" },
      { title: "Import CSV", href: "/contacts/import" },
      { title: "Lists", href: "/contacts/lists" },
      { title: "Segments", href: "/contacts/segments" },
      { title: "Tags", href: "/contacts/tags" },
      { title: "Suppression", href: "/contacts/suppression" },
    ],
  },
  {
    title: "Email Studio",
    href: "/email/campaigns",
    icon: Mail,
    children: [
      { title: "Campaigns", href: "/email/campaigns" },
      { title: "Templates", href: "/email/templates" },
      { title: "Sending Domains", href: "/email/domains" },
    ],
  },
  {
    title: "WhatsApp",
    href: "/whatsapp/campaigns",
    icon: MessageSquare,
    children: [
      { title: "Campaigns", href: "/whatsapp/campaigns" },
      { title: "Templates", href: "/whatsapp/templates" },
      { title: "Configuration", href: "/whatsapp/config" },
      { title: "Accounts", href: "/whatsapp/accounts" },
    ],
  },
  {
    title: "Unified Blasts",
    href: "/campaigns",
    icon: SendHorizontal,
  },
  {
    title: "Automations",
    href: "/automations",
    icon: GitFork,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Developer API",
    href: "/settings/api-keys",
    icon: Key,
    children: [
      { title: "API Keys", href: "/settings/api-keys" },
      { title: "Webhooks", href: "/settings/webhooks" },
    ],
  },
  {
    title: "Settings",
    href: "/settings/workspace",
    icon: Settings,
    children: [
      { title: "Workspace", href: "/settings/workspace" },
      { title: "Team Members", href: "/settings/team" },
      { title: "Billing & Plans", href: "/settings/billing" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Progressive disclosure: only expand the section matching the current URL
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        const matches =
          pathname === item.href ||
          item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
        if (matches) {
          initial[item.title] = true;
        }
      }
    });
    setOpenSections((prev) => ({ ...prev, ...initial }));
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const { workspace } = useAuth();

  return (
    <aside className="w-60 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0 select-none z-30 transition-all">
      {/* Brand & Workspace Header (Distilled single container) */}
      <div className="h-14 px-4 border-b border-sidebar-border flex items-center">
        <Link href="/" className="flex items-center gap-2.5 group w-full">
          <div className="h-7 w-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-foreground shadow-2xs group-hover:bg-primary/30 transition-colors">
            <Radio className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-sidebar-foreground tracking-tight truncate">
              Unified Platform
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">{workspace?.name || "Acme Global"}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrentOrChildActive =
            pathname === item.href ||
            (item.children && item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")));
          const isOpen = !!openSections[item.title];

          if (item.children) {
            return (
              <div key={item.title} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSection(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isCurrentOrChildActive
                      ? "text-sidebar-foreground font-semibold bg-sidebar-accent/60"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground font-medium">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 text-muted-foreground transition-transform duration-150",
                        isOpen && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="pl-6 pr-1 space-y-0.5 py-0.5">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-2 py-1 rounded text-[11px] transition-colors",
                            isChildActive
                              ? "text-sidebar-foreground font-semibold bg-sidebar-accent"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                          )}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                pathname === item.href
                  ? "text-sidebar-foreground font-semibold bg-sidebar-accent border border-sidebar-border/50 shadow-2xs"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quota Meter Footer (Distilled un-nested strip) */}
      <div className="p-3.5 pb-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-medium">84,250 / 100k sent</span>
          <span className="text-foreground font-semibold">84%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: "84%" }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Tier 2 Quota</span>
          <Link
            href="/settings/billing"
            className="text-foreground hover:underline font-semibold"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </aside>
  );
}
