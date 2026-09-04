'use client';

import React from 'react';
import { MoreHorizontal, PlusCircle, ArrowDownToLine, LayoutTemplate, BarChart3 } from 'lucide-react';

interface QuickActionProps {
  onCreateCampaign?: () => void;
  onImportContacts?: () => void;
  onDesignTemplate?: () => void;
  onViewReports?: () => void;
}

export const QuickActionsCard: React.FC<QuickActionProps> = ({
  onCreateCampaign,
  onImportContacts,
  onDesignTemplate,
  onViewReports,
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Quick actions</h2>
          <p className="text-xs text-slate-400 mt-0.5">You can quick action at a time.</p>
        </div>
        <button 
          aria-label="More options"
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-white/[0.06]"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Create Campaign */}
        <button
          onClick={onCreateCampaign}
          className="group flex items-center gap-3 p-3.5 rounded-2xl bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/20 hover:border-blue-500/40 transition-all text-left hover:shadow-lg hover:shadow-blue-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:text-blue-300 transition-all border border-blue-500/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
            Create Campaign
          </span>
        </button>

        {/* Import Contacts */}
        <button
          onClick={onImportContacts}
          className="group flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:text-emerald-300 transition-all border border-emerald-500/20">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
            Import Contacts
          </span>
        </button>

        {/* Design Template */}
        <button
          onClick={onDesignTemplate}
          className="group flex items-center gap-3 p-3.5 rounded-2xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:text-cyan-300 transition-all border border-cyan-500/20">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
            Design Template
          </span>
        </button>

        {/* View Reports */}
        <button
          onClick={onViewReports}
          className="group flex items-center gap-3 p-3.5 rounded-2xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 hover:border-rose-500/40 transition-all text-left hover:shadow-lg hover:shadow-rose-500/10"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:text-rose-300 transition-all border border-rose-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
            View Reports
          </span>
        </button>
      </div>
    </div>
  );
};
