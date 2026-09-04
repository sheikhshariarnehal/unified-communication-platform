'use client';

import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';

interface HeaderProps {
  onCreateClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateClick }) => {
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-white/[0.08] bg-[#070a13]/70 backdrop-blur-xl sticky top-0 z-10">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts, campaigns, automations..."
            className="w-full pl-10 pr-12 py-2.5 rounded-2xl bg-slate-900/60 border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-xs text-slate-200 placeholder:text-slate-500 shadow-inner transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-slate-800/80 text-[10px] font-semibold text-slate-400 border border-white/[0.06]">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Create Button */}
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 ring-1 ring-white/20 transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create</span>
        </button>

        {/* Notifications */}
        <button 
          aria-label="View notifications"
          className="w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-slate-100 shadow-xs transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2.5 right-2.5 shadow-sm shadow-rose-500/60"></span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[1.5px] shadow-sm">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-200">
              SN
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
