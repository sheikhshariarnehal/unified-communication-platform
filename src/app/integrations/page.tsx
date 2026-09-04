'use client';

import React from 'react';
import { Cpu, Key, Webhook, Plus, Copy, Check } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API & Webhooks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect external e-commerce systems, programmatic messaging keys, and real-time webhook listeners.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20">
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* API Key Card */}
      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-base font-bold text-slate-900 mb-2">Live Secret Keys</h2>
        <p className="text-xs text-slate-500 mb-4">
          Authenticate API requests from your backend server or Shopify/WooCommerce store.
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Production Key (Full Access)</span>
            <code className="text-xs text-slate-500 font-mono">pk_live_948a3f9102b48d...</code>
          </div>
          <button 
            aria-label="Copy key"
            className="p-2 rounded-xl hover:bg-white text-slate-500 hover:text-slate-800"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
