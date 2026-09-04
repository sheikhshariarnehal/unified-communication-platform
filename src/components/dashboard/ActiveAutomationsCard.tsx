'use client';

import React from 'react';
import { MoreHorizontal, Mail, RefreshCw } from 'lucide-react';
import { AutomationItem } from '@/types/dashboard';

interface ActiveAutomationsCardProps {
  onManage?: () => void;
  automations?: AutomationItem[];
}

const defaultAutomations: AutomationItem[] = [
  {
    id: 'welcome-series',
    name: 'Welcome Series',
    progressPercent: 54,
    stepsSummary: '3 step email',
    channel: 'email',
    status: 'active',
  },
  {
    id: 're-engagement',
    name: 'Re-Engagement Flow',
    progressPercent: 27,
    stepsSummary: 'open rate',
    channel: 'email',
    status: 'active',
  },
];

export const ActiveAutomationsCard: React.FC<ActiveAutomationsCardProps> = ({
  onManage,
  automations = defaultAutomations,
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Active Automations</h2>
            <p className="text-xs text-slate-400 mt-0.5">Automated journeys working behind the scenes.</p>
          </div>
          <button 
            aria-label="More options"
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-white/[0.06]"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Columns & Automation list */}
        <div className="space-y-4 my-2">
          {/* Item 1: Welcome Series */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20 shadow-sm">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Welcome Series</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-xs shadow-blue-400/60"></span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    54% <span className="text-slate-500">/ 3 step email</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical mini bar chart preview */}
            <div className="w-12 h-16 bg-slate-900/80 rounded-xl flex items-end justify-center p-1 border border-white/[0.08] shadow-inner">
              <div 
                className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition-all duration-500"
                style={{ height: '54%' }}
              >
                54%
              </div>
            </div>
          </div>

          {/* Item 2: Re-Engagement Flow */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20 shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Re-Engagement Flow</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/60"></span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    27% <span className="text-slate-500">/ open rate</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical mini bar chart preview */}
            <div className="w-12 h-16 bg-slate-900/80 rounded-xl flex items-end justify-center p-1 border border-white/[0.08] shadow-inner">
              <div 
                className="w-full bg-gradient-to-t from-amber-600 to-orange-400 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition-all duration-500"
                style={{ height: '27%' }}
              >
                27%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dark Action Pill Button */}
      <div className="pt-4">
        <button
          onClick={onManage}
          className="w-full py-3 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs font-semibold tracking-wide border border-white/[0.1] shadow-lg shadow-black/40 hover:border-white/20 transition-all duration-200 active:scale-[0.99]"
        >
          Manage Automations
        </button>
      </div>
    </div>
  );
};
