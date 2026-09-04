"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Search,
} from "lucide-react";
import { mockWhatsAppCampaigns, getWhatsAppCampaigns } from "@/lib/whatsapp/service";
import { Campaign } from "@/types/database";

export default function WhatsAppCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockWhatsAppCampaigns);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getWhatsAppCampaigns();
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
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            WhatsApp Campaigns
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Dispatch official Meta WhatsApp Business Cloud API broadcasts with delivery, read receipts, and inbound replies.
          </p>
        </div>

        <Link
          href="/whatsapp/campaigns/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold shadow-md shadow-emerald-600/25"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New WhatsApp Campaign</span>
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
              placeholder="Search WhatsApp campaigns..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-secondary/40">
              <th className="py-3 px-4 font-medium">Campaign Name</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Sent</th>
              <th className="py-3 px-4 font-medium">Delivered</th>
              <th className="py-3 px-4 font-medium">Read Rate</th>
              <th className="py-3 px-4 font-medium">Replies</th>
              <th className="py-3 px-4 font-medium">Created Date</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((camp) => (
              <tr key={camp.id} className="hover:bg-secondary/30">
                <td className="py-3.5 px-4 font-medium text-foreground">
                  <div>{camp.name}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">
                    Template: {camp.whatsapp_config?.template_id}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                </td>

                <td className="py-3.5 px-4 text-foreground/90">
                  {camp.stats.sent.toLocaleString()}
                </td>

                <td className="py-3.5 px-4 text-foreground/90 font-medium">
                  {((camp.stats.delivered / camp.stats.sent) * 100).toFixed(1)}%
                </td>

                <td className="py-3.5 px-4 text-emerald-400 font-bold">
                  {((camp.stats.read / camp.stats.delivered) * 100).toFixed(1)}%
                </td>

                <td className="py-3.5 px-4 text-foreground/90">
                  {camp.stats.replied?.toLocaleString() || 0}
                </td>

                <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                  {camp.created_at}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <span className="text-emerald-400 font-medium">Delivered</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
