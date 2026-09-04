"use client";

import { useState, useEffect } from "react";
import {
  Globe2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { mockSendingDomains, getSendingDomains } from "@/lib/email/service";
import { SendingDomain } from "@/types/database";

export default function SendingDomainsPage() {
  const [domains, setDomains] = useState<SendingDomain[]>(mockSendingDomains);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSendingDomains();
      if (data && data.length > 0) setDomains(data);
    }
    load();
  }, []);


  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const domainName = newDomain.trim().toLowerCase();
    const created: SendingDomain = {
      id: `dom-${Date.now()}`,
      workspace_id: "ws-1",
      domain: domainName,
      spf_verified: false,
      dkim_verified: false,
      dmarc_verified: false,
      status: "pending",
      dns_records: [
        { type: "TXT", name: domainName, value: "v=spf1 include:spf.unifiedplatform.io ~all", status: "pending" },
        { type: "CNAME", name: `up1._domainkey.${domainName}`, value: "dkim.unifiedplatform.io", status: "pending" },
        { type: "TXT", name: `_dmarc.${domainName}`, value: "v=DMARC1; p=none;", status: "pending" },
      ],
      created_at: new Date().toISOString().split("T")[0],
    };

    setDomains([...domains, created]);
    setNewDomain("");
    setIsAddingDomain(false);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setDomains(
        domains.map((d) => ({
          ...d,
          spf_verified: true,
          dkim_verified: true,
          dmarc_verified: true,
          status: "verified",
          dns_records: d.dns_records.map((r) => ({ ...r, status: "verified" })),
        }))
      );
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Globe2 className="h-6 w-6 text-primary" />
            Email Sending Domains
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure custom sending domains with DKIM, SPF, and DMARC authentication to ensure 99%+ primary inbox deliverability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? "animate-spin text-primary" : ""}`} />
            <span>{isVerifying ? "Checking DNS..." : "Verify Records"}</span>
          </button>

          <button
            onClick={() => setIsAddingDomain(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Connect Domain</span>
          </button>
        </div>
      </div>

      {isAddingDomain && (
        <form
          onSubmit={handleAddDomain}
          className="glass-panel p-5 rounded-xl space-y-3 animate-in fade-in"
        >
          <h2 className="text-sm font-semibold text-foreground">Add Custom Domain</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              required
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. mail.yourcompany.com"
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
            >
              Add Domain
            </button>
            <button
              type="button"
              onClick={() => setIsAddingDomain(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Domain Cards */}
      <div className="space-y-6">
        {domains.map((dom) => (
          <div key={dom.id} className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground font-mono">
                      {dom.domain}
                    </span>
                    {dom.status === "verified" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Verified & Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-medium animate-pulse">
                        <Clock className="h-3 w-3" /> Pending DNS Propagation
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className={dom.spf_verified ? "text-emerald-400" : "text-muted-foreground"}>
                      SPF: {dom.spf_verified ? "✓ Verified" : "Pending"}
                    </span>
                    <span className={dom.dkim_verified ? "text-emerald-400" : "text-muted-foreground"}>
                      DKIM: {dom.dkim_verified ? "✓ Verified" : "Pending"}
                    </span>
                    <span className={dom.dmarc_verified ? "text-emerald-400" : "text-muted-foreground"}>
                      DMARC: {dom.dmarc_verified ? "✓ Verified" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                Added {dom.created_at}
              </div>
            </div>

            {/* DNS Records Table (PRD Section 33) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-foreground/90">
                Required DNS Records (Add to your DNS provider such as Cloudflare, Route53, or GoDaddy)
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/60 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3.5 font-medium">Type</th>
                      <th className="py-2.5 px-3.5 font-medium">Host / Name</th>
                      <th className="py-2.5 px-3.5 font-medium">Target Value</th>
                      <th className="py-2.5 px-3.5 font-medium">Status</th>
                      <th className="py-2.5 px-3.5 font-medium text-right">Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-background/40">
                    {dom.dns_records.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-secondary/20">
                        <td className="py-2.5 px-3.5 font-mono text-primary font-semibold">
                          {rec.type}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-foreground">
                          {rec.name}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-muted-foreground max-w-xs truncate">
                          {rec.value}
                        </td>
                        <td className="py-2.5 px-3.5">
                          {rec.status === "verified" ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            onClick={() => handleCopy(rec.value, `${dom.id}-${idx}`)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                            title="Copy Value"
                          >
                            {copiedKey === `${dom.id}-${idx}` ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
