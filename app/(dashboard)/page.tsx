"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  SendHorizontal,
  Calendar,
  Sparkles,
  BarChart3,
  Clock,
  ExternalLink,
  Layers,
  Activity,
  MapPin,
  Zap,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [kpiCategory, setKpiCategory] = useState<"deliverability" | "audience" | "all">("deliverability");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const kpis = [
    {
      title: "Total Contacts",
      category: "audience",
      value: "12,450",
      change: "+12.8%",
      isPositive: true,
      icon: Users,
      iconColor: "text-primary",
      detail: "Across 4 active lists",
    },
    {
      title: "Emails Sent",
      category: "audience",
      value: "84,250",
      change: "+24.5%",
      isPositive: true,
      icon: Mail,
      iconColor: "text-primary",
      detail: "Resend / SES dispatch",
    },
    {
      title: "WhatsApp Sent",
      category: "audience",
      value: "31,820",
      change: "+41.2%",
      isPositive: true,
      icon: MessageSquare,
      iconColor: "text-emerald-400",
      detail: "Meta Cloud WABA",
    },
    {
      title: "Email Delivery Rate",
      category: "deliverability",
      value: "97.8%",
      change: "+0.4%",
      isPositive: true,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      detail: "82,396 successful",
    },
    {
      title: "Email Open Rate",
      category: "deliverability",
      value: "42.3%",
      change: "+3.1%",
      isPositive: true,
      icon: Eye,
      iconColor: "text-cyan-400",
      detail: "34,853 unique opens",
    },
    {
      title: "Email Click Rate",
      category: "deliverability",
      value: "8.7%",
      change: "+1.2%",
      isPositive: true,
      icon: MousePointerClick,
      iconColor: "text-amber-400",
      detail: "7,168 link clicks",
    },
    {
      title: "WhatsApp Delivery",
      category: "deliverability",
      value: "98.9%",
      change: "+0.2%",
      isPositive: true,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      detail: "31,470 delivered",
    },
    {
      title: "WhatsApp Read Rate",
      category: "deliverability",
      value: "86.4%",
      change: "+5.7%",
      isPositive: true,
      icon: Eye,
      iconColor: "text-emerald-400",
      detail: "27,190 read receipts",
    },
  ];

  const filteredKpis = kpis.filter(
    (k) => kpiCategory === "all" || k.category === kpiCategory
  );

  const chartData = [
    { day: "Day 1", email: 65, wa: 30, emailCount: "6,500", waCount: "3,000" },
    { day: "Day 4", email: 80, wa: 45, emailCount: "8,000", waCount: "4,500" },
    { day: "Day 7", email: 55, wa: 25, emailCount: "5,500", waCount: "2,500" },
    { day: "Day 10", email: 90, wa: 60, emailCount: "9,000", waCount: "6,000" },
    { day: "Day 14", email: 75, wa: 40, emailCount: "7,500", waCount: "4,000" },
    { day: "Day 18", email: 98, wa: 70, emailCount: "9,800", waCount: "7,000" },
    { day: "Day 22", email: 70, wa: 35, emailCount: "7,000", waCount: "3,500" },
    { day: "Day 26", email: 85, wa: 55, emailCount: "8,500", waCount: "5,500" },
    { day: "Today", email: 92, wa: 68, emailCount: "9,200", waCount: "6,800" },
  ];

  const recentCampaigns = [
    {
      id: "c-1",
      name: "Spring Flash Sale 2026",
      channel: "email",
      status: "completed",
      sent: "25,000",
      deliveredRate: "98.2%",
      openReadRate: "44.5%",
      clickRate: "9.2%",
      date: "Today, 10:30 AM",
    },
    {
      id: "c-2",
      name: "VIP Early Bird Order Notification",
      channel: "whatsapp",
      status: "completed",
      sent: "6,400",
      deliveredRate: "99.1%",
      openReadRate: "89.3%",
      clickRate: "18.4%",
      date: "Yesterday",
    },
    {
      id: "c-3",
      name: "Product Release Announcement (Cross-Channel)",
      channel: "unified",
      status: "sending",
      sent: "18,200",
      deliveredRate: "97.4%",
      openReadRate: "58.1%",
      clickRate: "12.0%",
      date: "In Progress",
    },
    {
      id: "c-4",
      name: "Abandoned Cart 24h Reminder",
      channel: "email",
      status: "completed",
      sent: "1,240",
      deliveredRate: "99.0%",
      openReadRate: "51.2%",
      clickRate: "14.8%",
      date: "Sep 02, 2026",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time delivery, engagement, and cross-channel performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center p-1 rounded-lg bg-card border border-border text-xs font-medium text-muted-foreground">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md transition-all ${
                  timeRange === r
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "hover:text-foreground"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <Link
            href="/email/campaigns/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* Google Maps Lead Extraction & WhatsApp Campaign Quick Launch */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Chrome Extension Ingestion
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Direct Google Maps to DB Sync
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Find Local Business Leads & Dispatch WhatsApp Campaigns
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Search Google Maps with the LeadMap Chrome Extension to collect phone numbers, ratings, and business categories. Scraped contacts are automatically normalized to WhatsApp E.164 (+880) and grouped into campaign-ready lists.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Auto-Normalize BD Mobile (+8801)
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Star Ratings & Place Links
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> 1-Click WhatsApp Blast
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch gap-2 shrink-0 w-full md:w-auto">
          <Link
            href="/contacts?openScraper=true"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/25 transition-all text-center"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Scrape Leads on Maps</span>
          </Link>
          <Link
            href="/whatsapp/campaigns/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition-all text-center"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span>New WhatsApp Blast</span>
          </Link>
        </div>
      </div>

      {/* KPI Section with Segmented Category Tabs (PRD Section 11 & Impeccable Chunking) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-secondary border border-border text-xs">
            <button
              type="button"
              onClick={() => setKpiCategory("deliverability")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                kpiCategory === "deliverability"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Deliverability & Rates</span>
              <span className="text-[10px] px-1.5 rounded-full bg-secondary text-muted-foreground">
                5
              </span>
            </button>
            <button
              type="button"
              onClick={() => setKpiCategory("audience")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                kpiCategory === "audience"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Audience & Volume</span>
              <span className="text-[10px] px-1.5 rounded-full bg-secondary text-muted-foreground">
                3
              </span>
            </button>
            <button
              type="button"
              onClick={() => setKpiCategory("all")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                kpiCategory === "all"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All Metrics</span>
            </button>
          </div>

          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Showing {filteredKpis.length} metrics for last {timeRange}
          </span>
        </div>

        {/* Dynamic Responsive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.title}
                className="glass-card-interactive p-4 rounded-xl relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {kpi.title}
                    </span>
                    <div
                      className={`p-2 rounded-lg bg-secondary border border-border ${kpi.iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground tracking-tight">
                      {kpi.value}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {kpi.change}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-muted-foreground/80 border-t border-border/50 pt-1.5">
                  {kpi.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Volume & Channel Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Deliverability Chart Overview */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Message Volume Trends
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Email vs WhatsApp outbound delivery across last {timeRange}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span>Email (72.5%)</span>
              </div>
              <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <span>WhatsApp (27.5%)</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart with Hover Tooltip (Impeccable Animate & Feedback) */}
          <div className="relative h-60 flex flex-col justify-end pt-4 pb-2 px-2">
            {hoveredBarIndex !== null && (
              <div className="absolute top-0 right-4 bg-popover text-popover-foreground border border-border px-3 py-2 rounded-lg shadow-lg text-xs space-y-1 z-10 animate-in fade-in duration-150">
                <div className="font-semibold text-foreground border-b border-border pb-1">
                  {chartData[hoveredBarIndex].day} Throughput
                </div>
                <div className="flex items-center justify-between gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Email
                  </span>
                  <span className="font-semibold text-foreground">
                    {chartData[hoveredBarIndex].emailCount} ({chartData[hoveredBarIndex].email}%)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    WhatsApp
                  </span>
                  <span className="font-semibold text-foreground">
                    {chartData[hoveredBarIndex].waCount} ({chartData[hoveredBarIndex].wa}%)
                  </span>
                </div>
              </div>
            )}

            <div className="h-44 flex items-end justify-between gap-2">
              {chartData.map((bar, i) => {
                const isHovered = hoveredBarIndex === i;
                return (
                  <div
                    key={bar.day}
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end cursor-pointer group"
                  >
                    <div
                      className={`w-full max-w-[32px] flex flex-col gap-1 items-center h-full justify-end transition-transform duration-150 ${
                        isHovered ? "scale-105" : ""
                      }`}
                    >
                      <div
                        style={{ height: `${bar.wa}%` }}
                        className="w-full bg-emerald-500/80 rounded-t-sm group-hover:bg-emerald-400 transition-colors shadow-xs"
                      />
                      <div
                        style={{ height: `${bar.email}%` }}
                        className="w-full bg-primary/80 rounded-t-sm group-hover:bg-primary transition-colors shadow-xs"
                      />
                    </div>
                    <span
                      className={`text-[10px] truncate mt-1 transition-colors ${
                        isHovered
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {bar.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Channel Health & Quota Summary */}
        <div className="glass-panel p-5 rounded-2xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Channel Dispatchers
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                100% Operational
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active outbound delivery channels status.
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/15 text-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">
                      Resend / SES Driver
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      mail.acmeglobal.com · DKIM/SPF ✓
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  Healthy
                </span>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-foreground">
                      WhatsApp Cloud API
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      +1 (555) 019-2830 · Tier 2 (10k/day)
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  Connected
                </span>
              </div>
            </div>
          </div>

          {/* Unified Blast Callout Card (Clean Token-Based Gradient for Light & Dark) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/25">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-foreground" />
              Unified Blast Engine
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Launch cross-channel campaigns where unread WhatsApp notifications
              automatically fall back to Email.
            </p>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground hover:text-primary dark:hover:text-primary-foreground underline-offset-4 hover:underline mt-2"
            >
              Explore Unified Blasts
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Campaign Performance (PRD Section 11) */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Recent Campaigns
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Delivery and engagement report across all active and finished blasts.
            </p>
          </div>
          <Link
            href="/email/campaigns"
            className="text-xs font-semibold text-foreground hover:text-primary dark:hover:text-primary-foreground flex items-center gap-1 underline-offset-4 hover:underline"
          >
            <span>View All Campaigns</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-medium">Campaign Name</th>
                <th className="pb-3 font-medium">Channel</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Sent</th>
                <th className="pb-3 font-medium">Delivered</th>
                <th className="pb-3 font-medium">Opened / Read</th>
                <th className="pb-3 font-medium">Clicked</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentCampaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="hover:bg-secondary/40 transition-colors"
                >
                  <td className="py-3.5 font-medium text-foreground max-w-[200px] truncate">
                    {camp.name}
                  </td>
                  <td className="py-3.5">
                    {camp.channel === "email" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-foreground border border-primary/30 text-[10px] font-medium">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    )}
                    {camp.channel === "whatsapp" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                        <MessageSquare className="h-3 w-3" /> WhatsApp
                      </span>
                    )}
                    {camp.channel === "unified" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-medium">
                        <SendHorizontal className="h-3 w-3" /> Unified Blast
                      </span>
                    )}
                  </td>
                  <td className="py-3.5">
                    {camp.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 animate-pulse font-medium">
                        <Clock className="h-3 w-3" /> Sending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-foreground/90">{camp.sent}</td>
                  <td className="py-3.5 text-foreground/90 font-medium">
                    {camp.deliveredRate}
                  </td>
                  <td className="py-3.5 text-foreground/90 font-medium">
                    {camp.openReadRate}
                  </td>
                  <td className="py-3.5 text-foreground/90 font-medium">
                    {camp.clickRate}
                  </td>
                  <td className="py-3.5 text-muted-foreground text-[11px]">
                    {camp.date}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/email/campaigns/${camp.id}`}
                      className="text-foreground/90 hover:text-foreground font-semibold underline-offset-2 hover:underline"
                    >
                      Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
