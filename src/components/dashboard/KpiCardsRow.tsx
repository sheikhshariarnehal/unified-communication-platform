'use client';

import React, { useState } from 'react';
import { ChevronRight, ArrowUpRight, ArrowDownRight, Mail, MessageSquare, Layers } from 'lucide-react';

interface KpiCardsRowProps {
  emailsSent?: number;
  openRate?: number;
  newSubscribers?: number;
  onCardClick?: (metric: string) => void;
}

export const KpiCardsRow: React.FC<KpiCardsRowProps> = ({
  emailsSent = 12430,
  openRate = 38.2,
  newSubscribers = 1248,
  onCardClick,
}) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'email' | 'whatsapp'>('all');

  // Multiplier or values based on selected channel filter
  const displayedSends = activeChannel === 'email' ? 8425 : activeChannel === 'whatsapp' ? 4005 : emailsSent;
  const displayedRate = activeChannel === 'email' ? 38.2 : activeChannel === 'whatsapp' ? 88.4 : 54.1;
  const displayedSubs = activeChannel === 'email' ? 820 : activeChannel === 'whatsapp' ? 428 : newSubscribers;

  return (
    <div className="space-y-3">
      {/* Channel Filter Pill Toggle (Requested in Critique /distill) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/[0.08] shadow-inner">
          <button
            onClick={() => setActiveChannel('all')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeChannel === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Channels</span>
          </button>
          <button
            onClick={() => setActiveChannel('email')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeChannel === 'email'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeChannel === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          Live sync active
        </span>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Messages / Emails Sent */}
        <div 
          onClick={() => onCardClick?.('emails')}
          className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {activeChannel === 'whatsapp' ? 'WhatsApp Sent' : activeChannel === 'email' ? 'Emails Sent' : 'Messages Sent'}
            </span>
            <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mb-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+6.3%</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-100 tracking-tight tabular-nums">
                {displayedSends.toLocaleString()}
              </div>
            </div>

            {/* Semi-circular arc mini gauge with dark track */}
            <div className="relative flex flex-col items-center justify-center">
              <svg width="74" height="42" viewBox="0 0 74 42">
                <path
                  d="M 6 38 A 31 31 0 0 1 68 38"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 6 38 A 31 31 0 0 1 54 13"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                />
                <circle cx="54" cy="13" r="3.5" fill="#38bdf8" />
              </svg>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">12k+</span>
            </div>
          </div>
        </div>

        {/* Card 2: Open / Read Rate */}
        <div 
          onClick={() => onCardClick?.('open-rate')}
          className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">
              {activeChannel === 'whatsapp' ? 'Read Rate' : 'Open Rate'}
            </span>
            <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 mb-1">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>-2.7%</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-100 tracking-tight tabular-nums">
                {displayedRate}%
              </div>
            </div>

            {/* Mini 4-bar sparkline with floating dark amber badge */}
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-5 px-1.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[10px] font-bold shadow-xs">
                {displayedRate}%
              </div>
              <div className="flex items-end gap-1.5 h-10 pt-2">
                <div className="w-2.5 h-3 bg-amber-500/30 rounded-sm"></div>
                <div className="w-2.5 h-8 bg-amber-400 rounded-sm shadow-xs shadow-amber-400/40"></div>
                <div className="w-2.5 h-4 bg-amber-500/40 rounded-sm"></div>
                <div className="w-2.5 h-5 bg-amber-500/30 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: New Subscribers */}
        <div 
          onClick={() => onCardClick?.('subscribers')}
          className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">New Subscribers</span>
            <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 mb-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12%</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-100 tracking-tight tabular-nums">
                +{displayedSubs.toLocaleString()}
              </div>
            </div>

            {/* Range Slider Indicator Graphic with dark theme */}
            <div className="flex flex-col items-center w-24">
              <span className="text-[10px] font-bold text-cyan-400 mb-1 self-center">1k+</span>
              <div className="relative w-full h-2 bg-slate-800 rounded-full flex items-center overflow-visible">
                <div className="h-full bg-cyan-500/50 rounded-full" style={{ width: '70%' }}></div>
                <div className="absolute left-[70%] -translate-x-1/2 w-3 h-5 bg-cyan-400 rounded-sm shadow-md shadow-cyan-400/50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
