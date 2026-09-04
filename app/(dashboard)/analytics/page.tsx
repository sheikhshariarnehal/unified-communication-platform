"use client";

import { useState } from "react";
import {
  BarChart3,
  Calendar,
  Filter,
  TrendingUp,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Users,
  Download,
  ArrowUpDown,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [compareA, setCompareA] = useState("c1");
  const [compareB, setCompareB] = useState("c2");

  const campaigns = [
    { id: "c1", name: "Spring Flash Sale 2026", channel: "Email", sent: 25000, openRate: "45.3%", clickRate: "9.4%", delivery: "98.2%" },
    { id: "c2", name: "VIP Order Notification", channel: "WhatsApp", sent: 6400, openRate: "89.3%", clickRate: "18.4%", delivery: "99.1%" },
    { id: "c3", name: "Developer Digest #42", channel: "Email", sent: 8200, openRate: "38.5%", clickRate: "7.1%", delivery: "97.5%" },
  ];

  const selectedCampaignA = campaigns.find((c) => c.id === compareA) || campaigns[0];
  const selectedCampaignB = campaigns.find((c) => c.id === compareB) || campaigns[1];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-primary" />
            Deliverability & Engagement Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Aggregated workspace metrics across Email, WhatsApp, and cross-channel blast performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-lg bg-card border border-border text-xs font-medium text-muted-foreground">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md transition-all ${
                  timeRange === r
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:text-foreground"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Overview (PRD Section 46) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground font-medium">Total Messages Dispatched</span>
          <div className="text-2xl font-bold text-foreground mt-1">116,070</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +28.4% vs last period
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground font-medium">Overall Delivery Rate</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">98.3%</div>
          <div className="text-[11px] text-muted-foreground mt-1">1.7% total bounced</div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground font-medium">Average Open / Read</span>
          <div className="text-2xl font-bold text-primary mt-1">64.2%</div>
          <div className="text-[11px] text-muted-foreground mt-1">WhatsApp 89.3% · Email 45.3%</div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground font-medium">Complaints & Opt-Outs</span>
          <div className="text-2xl font-bold text-foreground mt-1">0.08%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Well below 0.1% threshold ✓</div>
        </div>
      </div>

      {/* Campaign Comparison Tool (PRD Section 48) */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Campaign Comparison Matrix
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select two campaigns to evaluate and compare deliverability, open rates, and click engagement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="bg-card border border-border text-xs rounded-lg px-2.5 py-1.5 text-primary font-medium"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  Campaign A: {c.name}
                </option>
              ))}
            </select>

            <span className="text-xs text-muted-foreground font-bold">VS</span>

            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="bg-card border border-border text-xs rounded-lg px-2.5 py-1.5 text-emerald-300 font-medium"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  Campaign B: {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground bg-secondary/40">
                <th className="py-3 px-4 font-medium">Metric</th>
                <th className="py-3 px-4 font-semibold text-primary">
                  {selectedCampaignA.name} ({selectedCampaignA.channel})
                </th>
                <th className="py-3 px-4 font-semibold text-emerald-400">
                  {selectedCampaignB.name} ({selectedCampaignB.channel})
                </th>
                <th className="py-3 px-4 font-medium text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-3 px-4 text-foreground/90 font-sans">Total Sent</td>
                <td className="py-3 px-4 text-foreground">{selectedCampaignA.sent.toLocaleString()}</td>
                <td className="py-3 px-4 text-foreground">{selectedCampaignB.sent.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">
                  {Math.abs(selectedCampaignA.sent - selectedCampaignB.sent).toLocaleString()} msgs
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-foreground/90 font-sans">Delivery Rate</td>
                <td className="py-3 px-4 text-foreground">{selectedCampaignA.delivery}</td>
                <td className="py-3 px-4 text-foreground">{selectedCampaignB.delivery}</td>
                <td className="py-3 px-4 text-right text-emerald-400">+0.9% in B</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-foreground/90 font-sans">Open / Read Rate</td>
                <td className="py-3 px-4 text-primary font-bold">{selectedCampaignA.openRate}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{selectedCampaignB.openRate}</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">+44.0% in B</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-foreground/90 font-sans">Click Rate</td>
                <td className="py-3 px-4 text-amber-400">{selectedCampaignA.clickRate}</td>
                <td className="py-3 px-4 text-amber-400">{selectedCampaignB.clickRate}</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">+9.0% in B</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
