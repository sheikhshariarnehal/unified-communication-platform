'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Mail,
  MessageSquare,
  Workflow,
  BarChart2,
  Cpu,
  Settings,
  CreditCard,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Email', href: '/email', icon: Mail },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
    { name: 'Automations', href: '/automations', icon: Workflow },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Integrations & API', href: '/integrations', icon: Cpu },
  ];

  const bottomNavItems = [
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col justify-between p-4 bg-slate-950/70 backdrop-blur-2xl border-r border-white/[0.08] z-20">
      {/* Brand & Workspace Switcher */}
      <div>
        <div className="flex items-center gap-3 px-3 py-2 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <span className="font-extrabold text-lg tracking-wider">U</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">
              Unified
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Email & WhatsApp</p>
          </div>
        </div>

        {/* Workspace Dropdown */}
        <div className="mx-1 mb-6 p-2.5 rounded-2xl bg-slate-900/60 border border-white/[0.08] shadow-xs flex items-center justify-between cursor-pointer hover:bg-slate-900/90 hover:border-white/15 transition-all group">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">Acme Global</p>
              <p className="text-[10px] text-slate-500 font-medium">Business Tier</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Nav & Connection Health */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3">
        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Channels Connected</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50"></span> Email (SES)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50"></span> WhatsApp (Meta)
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
