'use client';

import React, { useState } from 'react';
import { Calendar, ArrowUpRight, MoreVertical, Mail, MessageSquare, Pause, Play, Users } from 'lucide-react';

interface ScheduleCampaignTimelineProps {
  onExpand?: () => void;
  onCampaignClick?: (id: string) => void;
}

export const ScheduleCampaignTimeline: React.FC<ScheduleCampaignTimelineProps> = ({
  onExpand,
  onCampaignClick,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [pausedCampaigns, setPausedCampaigns] = useState<Record<string, boolean>>({});

  const togglePause = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPausedCampaigns((prev) => ({ ...prev, [id]: !prev[id] }));
    setActiveMenuId(null);
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between h-full">
      {/* Header section */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Schedule Campaign</h2>
          <p className="text-xs text-slate-400 mt-0.5">See your schedule campaign score.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/[0.08] text-xs font-semibold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>7 Feb 2024 - 10 Feb 2024</span>
          </div>
          <button
            onClick={onExpand}
            aria-label="Expand campaign calendar"
            className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Time Ruler */}
      <div className="mt-4 pt-2 border-t border-white/[0.08]">
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 px-1 mb-1 tabular-nums">
          <span>07:00</span>
          <span>7:15</span>
          <span>7:30</span>
          <span>7:45</span>
          <span>8:00</span>
          <span>8:15</span>
          <span>8:30</span>
        </div>
        {/* Tick ruler line */}
        <div className="w-full flex justify-between px-2 items-end h-2 border-b border-slate-800">
          {[...Array(19)].map((_, i) => (
            <div
              key={i}
              className={`w-px ${i % 3 === 0 ? 'h-2.5 bg-slate-600' : 'h-1.5 bg-slate-800'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Campaign Timeline Entries */}
      <div className="space-y-3 mt-3">
        {/* Today Marker */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
            Today
          </span>
          <div className="flex-1 border-b border-dashed border-sky-500/40"></div>
        </div>

        {/* Campaign 1: Winter Sale Launch */}
        <div 
          onClick={() => onCampaignClick?.('winter-sale')}
          className="relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-blue-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-blue-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30 shadow-xs shadow-blue-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                  Winter Sale Launch
                </p>
                {pausedCampaigns['winter-sale'] && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                    Paused
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                07:00 - 11:00 AM
              </p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === 'winter-sale' ? null : 'winter-sale');
              }}
              aria-label="Campaign options"
              className="text-slate-500 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/[0.06]"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Inline Quick Action Popover (Addresses Critique Issue [P2]) */}
            {activeMenuId === 'winter-sale' && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl p-1.5 text-xs text-slate-200 backdrop-blur-xl animate-fade-in"
              >
                <button
                  onClick={(e) => togglePause('winter-sale', e)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.08] text-left transition-colors"
                >
                  {pausedCampaigns['winter-sale'] ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{pausedCampaigns['winter-sale'] ? 'Resume Broadcast' : 'Pause Broadcast'}</span>
                </button>
                <button
                  onClick={() => alert('Opening Audience breakdown...')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.08] text-left transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>View Audience</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Date Marker: Sun 8 February */}
        <div className="text-[11px] font-semibold text-slate-500 pt-1">
          Sun 8 February
        </div>

        {/* Campaign 2: New Arrivals Announcement */}
        <div 
          onClick={() => onCampaignClick?.('new-arrivals')}
          className="relative flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-amber-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-amber-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30 shadow-xs shadow-amber-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  New Arrivals Announcement
                </p>
                {pausedCampaigns['new-arrivals'] && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                    Paused
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                08:00 - 12:00 AM
              </p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === 'new-arrivals' ? null : 'new-arrivals');
              }}
              aria-label="Campaign options"
              className="text-slate-500 hover:text-slate-200 p-1.5 rounded-lg hover:bg-white/[0.06]"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {activeMenuId === 'new-arrivals' && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-30 w-44 rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl p-1.5 text-xs text-slate-200 backdrop-blur-xl animate-fade-in"
              >
                <button
                  onClick={(e) => togglePause('new-arrivals', e)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.08] text-left transition-colors"
                >
                  {pausedCampaigns['new-arrivals'] ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{pausedCampaigns['new-arrivals'] ? 'Resume Broadcast' : 'Pause Broadcast'}</span>
                </button>
                <button
                  onClick={() => alert('Opening WhatsApp Template details...')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/[0.08] text-left transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>View Audience</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
