"use client";

import { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Users,
  Send,
  Eye,
  RotateCcw,
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RecipientRow {
  id: string;
  phone: string;
  contact_id?: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  whatsapp_message_id?: string;
  contact?: {
    first_name?: string;
    last_name?: string;
    company?: string;
  };
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;
  const router = useRouter();

  const [campaign, setCampaign] = useState<any>(null);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // 1. Fetch from broadcasts or campaigns
      const { data: bData } = await supabase
        .from("broadcasts")
        .select("*")
        .eq("id", campaignId)
        .maybeSingle();

      let campObj: any = bData;

      if (!campObj) {
        const { data: cData } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", campaignId)
          .maybeSingle();
        campObj = cData;
      }

      setCampaign(campObj);

      // 2. Fetch recipients
      const { data: recips } = await supabase
        .from("broadcast_recipients")
        .select(`
          id,
          phone,
          status,
          sent_at,
          delivered_at,
          read_at,
          error_message,
          whatsapp_message_id,
          contact:contacts(first_name, last_name, company)
        `)
        .eq("broadcast_id", campaignId)
        .order("created_at", { ascending: true });

      if (recips && recips.length > 0) {
        setRecipients(recips as any);
      } else {
        // Fallback to campaign_recipients
        const { data: campRecips } = await supabase
          .from("campaign_recipients")
          .select(`
            id,
            status,
            sent_at,
            delivered_at,
            read_at,
            error_message,
            provider_message_id,
            contact:contacts(first_name, last_name, company, phone)
          `)
          .eq("campaign_id", campaignId);

        if (campRecips) {
          setRecipients(
            campRecips.map((cr: any) => ({
              id: cr.id,
              phone: cr.contact?.phone || "N/A",
              status: cr.status,
              sent_at: cr.sent_at,
              delivered_at: cr.delivered_at,
              read_at: cr.read_at,
              error_message: cr.error_message,
              whatsapp_message_id: cr.provider_message_id,
              contact: cr.contact,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error loading campaign details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  // Derived stats
  const total = recipients.length || campaign?.total_recipients || 0;
  const sentCount = recipients.filter((r) => r.status !== "failed" && r.status !== "pending").length || campaign?.sent_count || 0;
  const deliveredCount = recipients.filter((r) => r.status === "delivered" || r.status === "read").length || campaign?.delivered_count || 0;
  const readCount = recipients.filter((r) => r.status === "read").length || campaign?.read_count || 0;
  const failedCount = recipients.filter((r) => r.status === "failed").length || campaign?.failed_count || 0;

  const deliveredPct = total > 0 ? Math.round((deliveredCount / total) * 100) : 0;
  const readPct = total > 0 ? Math.round((readCount / total) * 100) : 0;
  const failedPct = total > 0 ? Math.round((failedCount / total) * 100) : 0;

  const filteredRecipients = useMemo(() => {
    if (filterStatus === "all") return recipients;
    return recipients.filter((r) => r.status === filterStatus);
  }, [recipients, filterStatus]);

  // Retry failed recipients via Meta API
  const handleRetryFailed = async () => {
    const failedOnes = recipients.filter((r) => r.status === "failed");
    if (failedOnes.length === 0) {
      alert("No failed recipients to retry.");
      return;
    }

    setIsRetrying(true);
    try {
      const res = await fetch("/api/whatsapp/campaigns/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: `${campaign?.name || "Campaign"} (Retry)`,
          dispatchMode: "meta_api",
          templateName: campaign?.template_name || "hello_world",
          templateLanguage: campaign?.template_language || "en_US",
          contactIds: failedOnes.map((f) => f.contact_id).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Retry dispatched: ${data.summary?.sent} sent successfully!`);
        loadData();
      } else {
        alert(data.error || "Retry failed");
      }
    } catch (err: any) {
      alert(`Retry error: ${err.message}`);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/whatsapp/campaigns"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {campaign?.name || "WhatsApp Campaign"}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  campaign?.status === "completed" || campaign?.status === "sent"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : campaign?.status === "failed"
                    ? "bg-red-500/15 text-red-400 border border-red-500/30"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse"
                }`}
              >
                {campaign?.status || "Processing"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Template: <code className="font-mono text-emerald-400">{campaign?.template_name || "hello_world"}</code> • Created {new Date(campaign?.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {failedCount > 0 && (
            <button
              onClick={handleRetryFailed}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              Retry Failed ({failedCount})
            </button>
          )}

          <Link
            href="/whatsapp/campaigns/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium shadow-sm transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            New Broadcast
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Total Targeted</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2 tabular-nums">
            {total.toLocaleString()}
          </p>
          <div className="mt-2 text-[11px] text-muted-foreground">100% audience mapped</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Delivered</span>
            <CheckCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2 tabular-nums">
            {deliveredCount.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${deliveredPct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">
              {deliveredPct}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Read / Opened</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2 tabular-nums">
            {readCount.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${readPct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-cyan-400 tabular-nums">
              {readPct}%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Failed</span>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2 tabular-nums">
            {failedCount.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-destructive rounded-full transition-all"
                style={{ width: `${failedPct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-destructive tabular-nums">
              {failedPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Recipient Activity Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Delivery Logs & Status</h3>
            <p className="text-xs text-muted-foreground">
              Individual recipient delivery timestamps and Meta message IDs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="all">All Statuses ({recipients.length})</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Sent Time</th>
                <th className="py-3 px-4">Delivered Time</th>
                <th className="py-3 px-4">Meta WAMID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No recipient records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((r) => {
                  const contactName =
                    `${r.contact?.first_name || ""} ${r.contact?.last_name || ""}`.trim() ||
                    "Contact";

                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{contactName}</div>
                        {r.contact?.company && (
                          <div className="text-[10px] text-muted-foreground">
                            {r.contact.company}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{r.phone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            r.status === "read"
                              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                              : r.status === "delivered"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : r.status === "sent"
                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              : "bg-destructive/15 text-destructive border border-destructive/30"
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.error_message && (
                          <div className="text-[10px] text-destructive mt-0.5 max-w-xs truncate" title={r.error_message}>
                            {r.error_message}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground tabular-nums">
                        {r.sent_at ? new Date(r.sent_at).toLocaleTimeString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground tabular-nums">
                        {r.delivered_at ? new Date(r.delivered_at).toLocaleTimeString() : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-muted-foreground truncate max-w-[140px]" title={r.whatsapp_message_id}>
                        {r.whatsapp_message_id || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
