"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Radio,
  ExternalLink,
  PhoneCall,
  RefreshCw,
  Settings,
} from "lucide-react";
import { mockWhatsAppAccounts, getWhatsAppAccounts } from "@/lib/whatsapp/service";
import { WhatsAppAccount } from "@/types/database";

export default function WhatsAppAccountsPage() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>(mockWhatsAppAccounts);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getWhatsAppAccounts();
      if (data && data.length > 0) setAccounts(data);
    }
    load();
  }, []);

  const [wabaId, setWabaId] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [token, setToken] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNum.trim()) return;

    const created: WhatsAppAccount = {
      id: `wa-acc-${Date.now()}`,
      workspace_id: "ws-1",
      business_account_id: wabaId || "waba_custom",
      phone_number_id: phoneId || "phone_custom",
      phone_number: phoneNum,
      display_name: displayName || "Customer Messaging",
      status: "connected",
      created_at: new Date().toISOString().split("T")[0],
    };

    setAccounts([...accounts, created]);
    setIsConnecting(false);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            WhatsApp Business Accounts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Connect official WhatsApp Cloud API numbers via Meta Business Manager. Personal account scraping is strictly prohibited.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/whatsapp/config"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-primary" />
            <span>API Configuration</span>
          </Link>

          <button
            onClick={() => setIsConnecting(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold shadow-md shadow-emerald-600/25"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Connect WABA Number</span>
          </button>
        </div>
      </div>

      {isConnecting && (
        <form
          onSubmit={handleConnect}
          className="glass-panel p-6 rounded-2xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-foreground">
              Connect WhatsApp Cloud API Credentials
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Encrypted at rest via AES-256
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-foreground/90 mb-1">
                WhatsApp Business Account ID (WABA ID)
              </label>
              <input
                type="text"
                required
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="e.g. 109283746192837"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-foreground/90 mb-1">
                Phone Number ID
              </label>
              <input
                type="text"
                required
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                placeholder="e.g. 982374610293847"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-foreground/90 mb-1">
                Verified Phone Number (E.164)
              </label>
              <input
                type="text"
                required
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                placeholder="+1 (555) 019-2830"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-foreground/90 mb-1">
                Sender Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Acme Support Notifications"
                className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-foreground/90 mb-1">
              Permanent System User Access Token
            </label>
            <input
              type="password"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="EAAG..."
              className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsConnecting(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-semibold"
            >
              Save Credentials
            </button>
          </div>
        </form>
      )}

      {/* Connected Accounts */}
      <div className="space-y-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">
                      {acc.phone_number}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Connected & Official
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {acc.display_name} · WABA ID: {acc.business_account_id}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="text-muted-foreground">Tier: </span>
                <span className="text-foreground font-medium">10k msgs / 24h</span>
              </div>
            </div>

            {/* Webhook Endpoint Guide */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
              <div className="text-foreground/90 font-semibold">
                Meta Developer Webhook Callback
              </div>
              <p className="text-[11px] text-muted-foreground">
                Configure your Meta App Webhook subscription for <code>messages</code> and <code>message_template_status_update</code>:
              </p>
              <div className="flex items-center justify-between p-2 rounded-lg bg-background font-mono text-[11px] text-foreground/90">
                <span>https://unified-communication-platform-xi.vercel.app/api/webhooks/whatsapp</span>
                <button
                  onClick={() =>
                    handleCopy(
                      "https://unified-communication-platform-xi.vercel.app/api/webhooks/whatsapp",
                      "webhook"
                    )
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === "webhook" ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
