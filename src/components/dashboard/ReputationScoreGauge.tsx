'use client';

import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface ReputationScoreGaugeProps {
  score?: number; // e.g. 85.2
  statusText?: string;
  onExpand?: () => void;
}

export const ReputationScoreGauge: React.FC<ReputationScoreGaugeProps> = ({
  score = 85.2,
  statusText = 'Good!',
  onExpand,
}) => {
  const strokeWidth = 14;
  const needleAngle = -90 + (score / 100) * 180;

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Reputation Score</h2>
          <p className="text-xs text-slate-400 mt-0.5">See your details reputation score.</p>
        </div>
        <button
          onClick={onExpand}
          aria-label="Expand reputation details"
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-white/[0.06]"
        >
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between px-2 pt-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rate</span>
        <span className="text-xs font-bold text-sky-400 tracking-wide px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 shadow-xs">
          {statusText}
        </span>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div 
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Sender reputation score gauge"
        className="relative flex flex-col items-center justify-center my-2"
      >
        <svg width="220" height="120" viewBox="0 0 220 125" className="overflow-visible">
          <defs>
            <linearGradient id="darkReputationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <filter id="darkGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f43f5e" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track (semi-circle) */}
          <path
            d="M 25 115 A 85 85 0 0 1 195 115"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Outer dotted tick indicator ring */}
          <path
            d="M 15 115 A 95 95 0 0 1 205 115"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="2 6"
          />

          {/* Active Progress Arc with Neon Glow */}
          <path
            d="M 25 115 A 85 85 0 0 1 195 115"
            fill="none"
            stroke="url(#darkReputationGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={Math.PI * 85}
            strokeDashoffset={Math.PI * 85 * (1 - score / 100)}
            strokeLinecap="round"
            filter="url(#darkGaugeGlow)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Indicator Needle line */}
          <g transform={`translate(110, 115) rotate(${needleAngle})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-75"
              stroke="#fb7185"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="5" fill="#f43f5e" stroke="#1e293b" strokeWidth="1.5" />
          </g>
        </svg>

        {/* Big Score Value in Center */}
        <div className="absolute bottom-1 flex items-baseline justify-center">
          <span className="text-2xl font-black text-rose-400 tracking-tight drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
            {score}%
          </span>
        </div>
      </div>

      {/* Auto-generated Pill Banner with High Contrast */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 mt-2 shadow-inner">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
        <p className="text-[11px] leading-relaxed text-emerald-200/90 font-medium">
          Reputation score auto-computed from engagement:{' '}
          <span className="font-bold text-emerald-300">{score}% high performance</span>
        </p>
      </div>
    </div>
  );
};
