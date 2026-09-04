'use client';

import React from 'react';
import { BarChart3, TrendingUp, Mail, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Channel & Campaign Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deep dive into delivery rates, engagement metrics, and channel comparisons.
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Email Metrics */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Email Channel Performance</h2>
              <p className="text-xs text-slate-500">84,250 total emails dispatched this month</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Delivery Rate</span>
              <span className="text-xl font-bold text-slate-900">97.8%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Open Rate</span>
              <span className="text-xl font-bold text-slate-900">42.3%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Click Rate</span>
              <span className="text-xl font-bold text-slate-900">8.7%</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Metrics */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">WhatsApp Channel Performance</h2>
              <p className="text-xs text-slate-500">31,820 total messages dispatched this month</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Delivery Rate</span>
              <span className="text-xl font-bold text-slate-900">99.1%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Read Rate</span>
              <span className="text-xl font-bold text-slate-900">88.4%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Reply Rate</span>
              <span className="text-xl font-bold text-slate-900">14.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
