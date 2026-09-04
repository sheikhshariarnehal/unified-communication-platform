'use client';

import React from 'react';
import { MoreHorizontal, ShieldCheck, ChevronRight } from 'lucide-react';

interface DeliverabilityScoreProps {
  score?: number;
  spamStatus?: string;
  bounceStatus?: string;
  domainStatus?: string;
  onOpenDiagnostics?: () => void;
}

export const DeliverabilityScoreCard: React.FC<DeliverabilityScoreProps> = ({
  score = 82,
  spamStatus = 'Low',
  bounceStatus = 'Stable',
  domainStatus = 'Verified',
  onOpenDiagnostics,
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Deliverability Score</h2>
          <p className="text-xs text-slate-400 mt-0.5">Your inbox placement is healthy.</p>
        </div>
        <button 
          onClick={onOpenDiagnostics}
          aria-label="View deliverability diagnostics"
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-white/[0.06]"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Score Header */}
      <div className="mt-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-slate-100 tracking-tight tabular-nums">
            {score}<span className="text-xl font-medium text-slate-500">/100</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Your inbox placement is healthy
          </span>
        </div>

        {/* Placement striped progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span>Placement</span>
            <span className="text-sky-400 font-bold">{score}% Optimal</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex items-center p-0.5 border border-white/[0.08]">
            <div
              className="h-full bg-blue-500 rounded-full diagonal-stripes-dark transition-all duration-700 shadow-md shadow-blue-500/30"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Indicators Section with Clickable Diagnostic Trigger */}
      <div className="pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[10px]">
            Indicators
          </span>
          <button
            onClick={onOpenDiagnostics}
            className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-0.5 transition-colors"
          >
            <span>Diagnostics</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Spam Complaints */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Spam complaints</span>
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-xs shadow-rose-400/60"></span>
              <span>{spamStatus}</span>
            </div>
          </div>

          {/* Bounce Rate */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Bounce rate</span>
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/60"></span>
              <span>{bounceStatus}</span>
            </div>
          </div>

          {/* Domain Authentication */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Domain authentication</span>
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-xs shadow-sky-400/60"></span>
              <span>{domainStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
