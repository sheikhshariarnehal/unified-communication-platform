'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ChartDataPoint } from '@/types/dashboard';

const samplePerformanceData: ChartDataPoint[] = [
  { date: '2024-02-07', displayDate: 'Feb 7', revenue: 8000, clickRate: 14000, unsubscribes: 12000 },
  { date: '2024-02-08', displayDate: 'Feb 8', revenue: 13000, clickRate: 16000, unsubscribes: 15000 },
  { date: '2024-02-09', displayDate: 'Feb 9', revenue: 21000, clickRate: 24000, unsubscribes: 20000 },
  { date: '2024-02-10', displayDate: 'Feb 10', revenue: 18000, clickRate: 26000, unsubscribes: 22000 },
  { date: '2024-02-11', displayDate: 'Feb 11', revenue: 31000, clickRate: 34000, unsubscribes: 38000 },
  { date: '2024-02-12', displayDate: 'Feb 12', revenue: 27000, clickRate: 32000, unsubscribes: 36000 },
  { date: '2024-02-13', displayDate: 'Feb 13', revenue: 38000, clickRate: 37000, unsubscribes: 39000 },
];

export const CampaignPerformanceChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 07 days');

  return (
    <div className="glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">Campaign Performance</h2>
          <p className="text-xs text-slate-400 mt-0.5">Monitor how your latest sends are performing in real time.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time range dropdown */}
          <div className="relative">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-xs font-semibold text-slate-300 transition-colors">
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Expand icon */}
          <button 
            aria-label="Expand chart"
            className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex items-center gap-5 text-xs text-slate-400 mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 shadow-xs shadow-sky-400/50"></span>
          <span className="font-medium text-slate-300">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400 shadow-xs shadow-rose-400/50"></span>
          <span className="font-medium text-slate-300">Click Rate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 shadow-xs shadow-purple-400/50"></span>
          <span className="font-medium text-slate-300">Unsubscribes</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-64 relative">
        {/* Floating Callout tooltip matching ref ui.jpg with clean SVG arrow */}
        <div className="absolute top-12 left-[48%] -translate-x-1/2 z-10 hidden md:flex flex-col items-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 text-white text-[11px] font-bold shadow-2xl border border-purple-500/30 whitespace-nowrap backdrop-blur-md">
            Unsubscribes: 0.3%
          </div>
          {/* Subtle SVG arrow to eliminate detector border false-positive */}
          <svg width="10" height="6" viewBox="0 0 10 6" className="text-slate-950 -mt-[1px]">
            <polygon points="0,0 10,0 5,6" fill="currentColor" />
          </svg>
          <div className="w-2.5 h-2.5 rounded-full border-2 border-purple-400 bg-slate-950 shadow-md shadow-purple-500/50 mt-1"></div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={samplePerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Luminous Dark Spline Gradients */}
              <linearGradient id="darkColorUnsub" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="darkColorClick" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fb7185" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="darkColorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />

            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000}k`)}
              domain={[0, 40000]}
              ticks={[0, 10000, 20000, 30000, 40000]}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 bg-slate-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 text-xs text-slate-100">
                      <p className="font-bold text-slate-200 mb-1">{label}</p>
                      <p className="text-sky-400 font-semibold">Revenue: ${payload[0]?.value?.toLocaleString()}</p>
                      <p className="text-rose-400 font-semibold">Click Rate: {payload[1]?.value?.toLocaleString()}</p>
                      <p className="text-purple-400 font-semibold">Unsubscribes: {payload[2]?.value?.toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="unsubscribes"
              stroke="#c084fc"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#darkColorUnsub)"
            />
            <Area
              type="monotone"
              dataKey="clickRate"
              stroke="#fb7185"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#darkColorClick)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#darkColorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
