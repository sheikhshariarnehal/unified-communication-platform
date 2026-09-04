"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Ban,
  TrendingUp,
  Download,
  Calendar,
  Users,
} from "lucide-react";

export default function CampaignReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const metrics = {
    name: "Spring Flash Sale 2026",
    subject: "Spring Flash Sale - 40% Off",
    sent: 25000,
    delivered: 24550,
    opened: 11125,
    clicked: 2300,
    bounced: 450,
    unsubscribed: 35,
    deliveryRate: "98.2%",
    openRate: "45.3%",
    clickRate: "9.4%",
    ctor: "20.7%",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <Link
          href="/email/campaigns"
          className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Campaigns
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {metrics.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subject: &quot;{metrics.subject}&quot; · Dispatched Sep 04, 2026
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground">Total Sent</span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {metrics.sent.toLocaleString()}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">100% enqueued</div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground">Delivered</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {metrics.delivered.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {metrics.deliveryRate} delivery rate
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground">Unique Opens</span>
          <div className="text-2xl font-bold text-primary mt-1">
            {metrics.opened.toLocaleString()}
          </div>
          <div className="text-[11px] text-primary/80 mt-1">
            {metrics.openRate} open rate
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl">
          <span className="text-xs text-muted-foreground">Unique Clicks</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {metrics.clicked.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            {metrics.clickRate} click rate ({metrics.ctor} CTOR)
          </div>
        </div>
      </div>

      {/* Delivery & Engagement Funnel (PRD Section 32) */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Campaign Funnel</h2>

        <div className="space-y-3">
          {[
            { label: "Sent", count: metrics.sent, pct: 100, color: "bg-slate-600" },
            { label: "Delivered", count: metrics.delivered, pct: 98.2, color: "bg-emerald-500" },
            { label: "Opened", count: metrics.opened, pct: 45.3, color: "bg-indigo-500" },
            { label: "Clicked", count: metrics.clicked, pct: 9.4, color: "bg-amber-500" },
            { label: "Bounced", count: metrics.bounced, pct: 1.8, color: "bg-rose-500" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground/90">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.count.toLocaleString()} ({item.pct}%)
                </span>
              </div>
              <div className="w-full bg-card rounded-full h-2 overflow-hidden">
                <div
                  className={`${item.color} h-full rounded-full transition-all`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
