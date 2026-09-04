"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  SendHorizontal,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Search,
} from "lucide-react";
import { mockEmailCampaigns, getEmailCampaigns } from "@/lib/email/service";
import { Campaign } from "@/types/database";

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockEmailCampaigns);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getEmailCampaigns();
      if (data && data.length > 0) setCampaigns(data);
    }
    load();
  }, []);


  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Mail className="h-6 w-6 text-primary" />
            Email Campaigns
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Dispatch high-volume broadcast emails with deliverability tracking, open/click heatmaps, and spam protection.
          </p>
        </div>

        <Link
          href="/email/campaigns/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Email Campaign</span>
        </Link>
      </div>

      {/* Campaigns Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email campaigns..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-secondary/40">
              <th className="py-3 px-4 font-medium">Campaign Name</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Recipients</th>
              <th className="py-3 px-4 font-medium">Delivered</th>
              <th className="py-3 px-4 font-medium">Open Rate</th>
              <th className="py-3 px-4 font-medium">Click Rate</th>
              <th className="py-3 px-4 font-medium">Created Date</th>
              <th className="py-3 px-4 font-medium text-right">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((camp) => (
              <tr key={camp.id} className="hover:bg-secondary/30">
                <td className="py-3.5 px-4 font-medium text-foreground">
                  <div>{camp.name}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">
                    {camp.email_config?.subject}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  {camp.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Draft
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-foreground/90">
                  {camp.stats.sent > 0 ? camp.stats.sent.toLocaleString() : "0"}
                </td>

                <td className="py-3.5 px-4 text-foreground/90 font-medium">
                  {camp.stats.sent > 0
                    ? `${((camp.stats.delivered / camp.stats.sent) * 100).toFixed(1)}%`
                    : "—"}
                </td>

                <td className="py-3.5 px-4 text-foreground/90 font-medium">
                  {camp.stats.delivered > 0
                    ? `${((camp.stats.opened / camp.stats.delivered) * 100).toFixed(1)}%`
                    : "—"}
                </td>

                <td className="py-3.5 px-4 text-foreground/90 font-medium">
                  {camp.stats.opened > 0
                    ? `${((camp.stats.clicked / camp.stats.opened) * 100).toFixed(1)}%`
                    : "—"}
                </td>

                <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                  {camp.created_at}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/email/campaigns/${camp.id}`}
                    className="text-primary hover:text-primary font-medium flex items-center justify-end gap-1"
                  >
                    <span>Analytics</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
