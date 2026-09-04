'use client';

import React from 'react';
import { MessageSquare, CheckCircle2, ShieldCheck, Plus, ExternalLink, RefreshCw } from 'lucide-react';

export default function WhatsAppModulePage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WhatsApp Business API</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official Meta Cloud API integration, registered phone numbers, and approved interactive templates.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-md shadow-emerald-500/20">
          <Plus className="w-4 h-4" />
          <span>Connect Meta Phone Number</span>
        </button>
      </div>

      {/* WhatsApp Connected Phone Number Card */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">+1 (555) 019-2831</h2>
              <p className="text-xs text-slate-500">Acme Global Support & Updates (Verified Business)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tier 2 (10k msgs/day)</span>
            </span>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Quality Rating</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-slate-800">High Quality (Green)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Zero spam complaints in last 7 days</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Approved Templates</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">14 Synced</span>
              <button 
                aria-label="Sync with Meta"
                className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" /> Sync Meta
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Utility, Marketing & Authentication</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/70">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Webhook Ingestion</span>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Active & Verified</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Receiving Sent, Delivered, Read receipts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
