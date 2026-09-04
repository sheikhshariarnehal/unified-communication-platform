'use client';

import React from 'react';
import { CreditCard, CheckCircle2, Zap } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription & Usage Metering</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time quota monitoring across contacts, email volume, and WhatsApp messages.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20">
          <Zap className="w-4 h-4" />
          <span>Upgrade Tier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Contacts */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Contact Storage</span>
            <span>12,450 / 50,000</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '24.9%' }}></div>
          </div>
          <p className="text-[11px] text-slate-400">24.9% of Business plan quota used</p>
        </div>

        {/* Metric 2: Email Messages */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Monthly Emails</span>
            <span>84,250 / 100,000</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '84.2%' }}></div>
          </div>
          <p className="text-[11px] text-amber-600 font-medium">84.2% used (Approaching 90% threshold)</p>
        </div>

        {/* Metric 3: WhatsApp Messages */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>WhatsApp Messages</span>
            <span>31,820 / 50,000</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '63.6%' }}></div>
          </div>
          <p className="text-[11px] text-slate-400">63.6% of WhatsApp monthly tier used</p>
        </div>
      </div>
    </div>
  );
}
