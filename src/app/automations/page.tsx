'use client';

import React from 'react';
import { Workflow, Plus, Play, Pause, ArrowRight, Mail, MessageSquare, Clock } from 'lucide-react';

export default function AutomationsPage() {
  const automations = [
    {
      id: '1',
      name: 'Welcome Journey & Onboarding',
      trigger: 'Contact Subscribed',
      steps: 3,
      status: 'Active',
      stats: '54% completion',
      nodes: [
        { label: 'Trigger: New Contact', icon: Workflow },
        { label: 'Send Welcome Email', icon: Mail },
        { label: 'Wait 2 Days', icon: Clock },
        { label: 'Send WhatsApp Follow-up', icon: MessageSquare },
      ],
    },
    {
      id: '2',
      name: 'Abandoned Checkout Re-Engagement',
      trigger: 'Shopify / Webhook Event',
      steps: 2,
      status: 'Active',
      stats: '27% conversion',
      nodes: [
        { label: 'Trigger: Cart Abandoned', icon: Workflow },
        { label: 'Wait 1 Hour', icon: Clock },
        { label: 'Send WhatsApp Recovery Link', icon: MessageSquare },
      ],
    },
    {
      id: '3',
      name: 'VIP Retention Workflow',
      trigger: 'Tag Added: VIP',
      steps: 4,
      status: 'Paused',
      stats: 'Paused 2 days ago',
      nodes: [
        { label: 'Trigger: Tag VIP', icon: Workflow },
        { label: 'Send Founder Note (Email)', icon: Mail },
      ],
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Automations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build multi-step automated customer journeys triggered by subscriber actions.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all">
          <Plus className="w-4 h-4" />
          <span>New Automation Flow</span>
        </button>
      </div>

      <div className="space-y-4">
        {automations.map((auto) => (
          <div
            key={auto.id}
            className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    auto.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {auto.status === 'Active' ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
                  {auto.status}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Trigger: {auto.trigger}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">{auto.name}</h2>
              <p className="text-xs text-blue-600 font-medium mt-0.5">{auto.stats}</p>

              {/* Journey flow visualization mini pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {auto.nodes.map((node, idx) => {
                  const Icon = node.icon;
                  return (
                    <React.Fragment key={idx}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{node.label}</span>
                      </div>
                      {idx < auto.nodes.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <button className="px-4 py-2 rounded-xl glass-panel hover:bg-white text-xs font-semibold text-slate-700">
                Edit Canvas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
