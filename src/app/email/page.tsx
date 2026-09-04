'use client';

import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, Globe, Plus, Send } from 'lucide-react';

export default function EmailModulePage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Channels & Sending</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure custom sending domains, SPF/DKIM verification, and email templates.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20">
          <Plus className="w-4 h-4" />
          <span>Connect New Domain</span>
        </button>
      </div>

      {/* Sending Domain Card */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">send.acmeglobal.com</h2>
              <p className="text-xs text-slate-500">Primary Marketing Sending Domain</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ready for Bulk Dispatch</span>
          </span>
        </div>

        {/* DNS Records Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">SPF Record</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
            <code className="text-[10px] text-slate-500 font-mono block bg-slate-50 p-2 rounded-lg break-all">
              v=spf1 include:amazonses.com ~all
            </code>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">DKIM 2048-bit</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </div>
            <code className="text-[10px] text-slate-500 font-mono block bg-slate-50 p-2 rounded-lg break-all">
              k1._domainkey.send.acmeglobal.com
            </code>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">DMARC Policy</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                <AlertTriangle className="w-3 h-3" /> p=none (monitoring)
              </span>
            </div>
            <code className="text-[10px] text-slate-500 font-mono block bg-slate-50 p-2 rounded-lg break-all">
              v=DMARC1; p=none; rua=mailto:dmarc@acmeglobal.com
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
