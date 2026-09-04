"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SendHorizontal,
  Mail,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
} from "lucide-react";

export default function UnifiedCampaignsPage() {
  const unifiedCampaigns = [
    {
      id: "uni-1",
      name: "Black Friday Super Blast",
      audience: "5,000 customers",
      status: "completed",
      emailSent: "5,000",
      emailDelivered: "4,850",
      emailOpened: "2,300",
      emailClicked: "650",
      emailFailed: "150",
      waSent: "5,000",
      waDelivered: "4,920",
      waRead: "4,100",
      waClicked: "900",
      waFailed: "80",
    },
    {
      id: "uni-2",
      name: "Product Release 2.0 (Dual Channel)",
      audience: "12,450 customers",
      status: "completed",
      emailSent: "12,450",
      emailDelivered: "12,180",
      emailOpened: "5,840",
      emailClicked: "1,420",
      emailFailed: "270",
      waSent: "8,200",
      waDelivered: "8,110",
      waRead: "6,950",
      waClicked: "1,880",
      waFailed: "90",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <SendHorizontal className="h-6 w-6 text-cyan-400" />
            Unified Multi-Channel Campaigns
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Orchestrate simultaneous Email and WhatsApp communications with unified reporting and cross-channel fallbacks.
          </p>
        </div>

        <button
          onClick={() => alert("Creating unified blast wizard...")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Unified Blast</span>
        </button>
      </div>

      {/* Feature Explainer Banner (PRD Section 40) */}
      <div className="p-4 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              One Audience · Two Synchronized Channels
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Maximize open rates by broadcasting across both Email and WhatsApp, or automatically sending an Email only if the WhatsApp message is unread after 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Unified Campaigns Performance Cards (PRD Section 40) */}
      <div className="space-y-6">
        {unifiedCampaigns.map((camp) => (
          <div key={camp.id} className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{camp.name}</h3>
                <span className="text-xs text-muted-foreground">Audience: {camp.audience}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium self-start sm:self-auto">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            </div>

            {/* Side-by-Side Channel Comparison (PRD Section 40) */}
            <div className="overflow-x-auto rounded-xl border border-border bg-background/50">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2.5 px-4 font-medium">Metric</th>
                    <th className="py-2.5 px-4 font-semibold text-primary flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email Channel
                    </th>
                    <th className="py-2.5 px-4 font-semibold text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Channel
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 text-muted-foreground font-sans">Sent</td>
                    <td className="py-2.5 px-4 text-foreground">{camp.emailSent}</td>
                    <td className="py-2.5 px-4 text-foreground">{camp.waSent}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-muted-foreground font-sans">Delivered</td>
                    <td className="py-2.5 px-4 text-foreground">{camp.emailDelivered}</td>
                    <td className="py-2.5 px-4 text-foreground">{camp.waDelivered}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-muted-foreground font-sans">Opened / Read</td>
                    <td className="py-2.5 px-4 text-primary font-bold">{camp.emailOpened}</td>
                    <td className="py-2.5 px-4 text-emerald-400 font-bold">{camp.waRead}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-muted-foreground font-sans">Clicked</td>
                    <td className="py-2.5 px-4 text-amber-400">{camp.emailClicked}</td>
                    <td className="py-2.5 px-4 text-amber-400">{camp.waClicked}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-muted-foreground font-sans">Failed</td>
                    <td className="py-2.5 px-4 text-rose-400">{camp.emailFailed}</td>
                    <td className="py-2.5 px-4 text-rose-400">{camp.waFailed}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
