'use client';

import React, { useState } from 'react';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { ActiveAutomationsCard } from '@/components/dashboard/ActiveAutomationsCard';
import { ReputationScoreGauge } from '@/components/dashboard/ReputationScoreGauge';
import { KpiCardsRow } from '@/components/dashboard/KpiCardsRow';
import { CampaignPerformanceChart } from '@/components/dashboard/CampaignPerformanceChart';
import { DeliverabilityScoreCard } from '@/components/dashboard/DeliverabilityScoreCard';
import { ScheduleCampaignTimeline } from '@/components/dashboard/ScheduleCampaignTimeline';
import { Plus, X, Mail, MessageSquare, Send, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDiagnosticsDrawer, setShowDiagnosticsDrawer] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'whatsapp' | 'unified'>('unified');

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Bento Grid layout directly matching ref ui.jpg */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Quick Actions + Active Automations + Reputation Score */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* 1. Quick Actions */}
          <div className="flex-1">
            <QuickActionsCard
              onCreateCampaign={() => setShowCreateModal(true)}
              onImportContacts={() => alert('Opening Contact CSV Importer...')}
              onDesignTemplate={() => alert('Opening Template Studio...')}
              onViewReports={() => alert('Navigating to Detailed Analytics...')}
            />
          </div>

          {/* 2. Active Automations */}
          <div className="flex-1">
            <ActiveAutomationsCard
              onManage={() => alert('Navigating to Journey Automation Builder...')}
            />
          </div>

          {/* 3. Reputation Score */}
          <div className="flex-1">
            <ReputationScoreGauge
              score={85.2}
              statusText="Good!"
              onExpand={() => alert('Opening Reputation Breakdown...')}
            />
          </div>
        </div>

        {/* Right Column: KPIs + Campaign Performance Chart + Deliverability & Schedule */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* 1. Top KPI Cards Row */}
          <div>
            <KpiCardsRow
              emailsSent={12430}
              openRate={38.2}
              newSubscribers={1248}
              onCardClick={(metric) => console.log('Metric clicked:', metric)}
            />
          </div>

          {/* 2. Central Campaign Performance Spline Chart */}
          <div>
            <CampaignPerformanceChart />
          </div>

          {/* 3. Bottom Row: Deliverability Score & Schedule Campaign */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DeliverabilityScoreCard
              score={82}
              spamStatus="Low"
              bounceStatus="Stable"
              domainStatus="Verified"
              onOpenDiagnostics={() => setShowDiagnosticsDrawer(true)}
            />
            <ScheduleCampaignTimeline
              onExpand={() => alert('Opening Schedule Calendar...')}
              onCampaignClick={(id) => alert(`Viewing scheduled campaign: ${id}`)}
            />
          </div>
        </div>

      </div>

      {/* Deliverability Diagnostics Slide-over Drawer (Addresses Critique Issue [P1]) */}
      {showDiagnosticsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-950/95 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl h-full overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Deliverability Diagnostics</h3>
                    <p className="text-xs text-slate-400">DNS Records & Reputation Health</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDiagnosticsDrawer(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Breakdown */}
              <div className="space-y-4 py-5">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">SPF Record</span>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passing
                    </span>
                  </div>
                  <code className="text-[10px] text-slate-400 font-mono block bg-black/40 p-2 rounded-lg break-all">
                    v=spf1 include:amazonses.com ~all
                  </code>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">DKIM 2048-bit Signature</span>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  </div>
                  <code className="text-[10px] text-slate-400 font-mono block bg-black/40 p-2 rounded-lg break-all">
                    k1._domainkey.send.acmeglobal.com
                  </code>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">DMARC Policy</span>
                    <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Advisory
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Policy is currently in monitoring mode (p=none). Upgrade to quarantine for maximum inbox deliverability.
                  </p>
                  <button className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <span>How to enforce DMARC</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Bounce Suppression Log */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08]">
                  <span className="text-xs font-bold text-slate-200 block mb-2">Recent Suppressions</span>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span>david.m@outlook.com</span>
                      <span className="text-rose-400 font-medium">Hard Bounce</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>suppressed_user@yahoo.com</span>
                      <span className="text-amber-400 font-medium">Unsubscribed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setShowDiagnosticsDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick Create Campaign Modal (Dark Theme) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-white/10 bg-slate-950/95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Create New Campaign</h3>
                  <p className="text-xs text-slate-400">Reach your audience across Email and WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Flash Sale Announcement"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  defaultValue="Summer Flash Sale"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Channels</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('unified')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedChannel === 'unified'
                        ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 font-semibold shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                        : 'border-white/[0.08] bg-slate-900/50 hover:bg-slate-900 text-slate-400 text-xs'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[11px] block">Unified Both</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('email')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedChannel === 'email'
                        ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 font-semibold shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                        : 'border-white/[0.08] bg-slate-900/50 hover:bg-slate-900 text-slate-400 text-xs'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <span className="text-[11px] block">Email Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('whatsapp')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedChannel === 'whatsapp'
                        ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 font-semibold shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                        : 'border-white/[0.08] bg-slate-900/50 hover:bg-slate-900 text-slate-400 text-xs'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[11px] block">WhatsApp Only</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Audience</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                  <option className="bg-slate-950">All VIP Customers (5,420 contacts)</option>
                  <option className="bg-slate-950">Active Subscribers - Last 30 Days (12,430 contacts)</option>
                  <option className="bg-slate-950">Cart Abandoners (1,150 contacts)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Campaign created and queued for dispatch!');
                  setShowCreateModal(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 ring-1 ring-white/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Queue Campaign</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
