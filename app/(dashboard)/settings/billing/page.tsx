"use client";

import { useState } from "react";
import {
  CreditCard,
  Check,
  Zap,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<"starter" | "business" | "enterprise">("business");

  const usageMeters = [
    { label: "Contacts Stored", used: 12450, total: 50000, pct: 24.9, unit: "contacts" },
    { label: "Emails Sent (Monthly)", used: 84250, total: 100000, pct: 84.25, unit: "emails" },
    { label: "WhatsApp Messages (Monthly)", used: 31820, total: 50000, pct: 63.6, unit: "messages" },
    { label: "Developer API Requests", used: 412900, total: 1000000, pct: 41.3, unit: "calls" },
  ];

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$49",
      period: "/month",
      desc: "For growing businesses starting with email and WhatsApp.",
      features: [
        "10,000 Contacts",
        "25,000 Monthly Emails",
        "Official WhatsApp Cloud API",
        "5 Team Members",
        "Basic Automations",
      ],
    },
    {
      id: "business",
      name: "Business (Active)",
      price: "$149",
      period: "/month",
      desc: "For high-volume marketing teams and scaling SaaS platforms.",
      isCurrent: true,
      features: [
        "50,000 Contacts",
        "100,000 Monthly Emails",
        "50,000 Monthly WhatsApp Messages",
        "Unlimited Multi-Channel Blasts",
        "Visual Automation Builder",
        "10 Team Members",
        "REST API & Webhooks",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "Dedicated IPs, custom SLAs, and high-throughput volume.",
      features: [
        "Unlimited Contacts",
        "1,000,000+ Emails",
        "Dedicated Meta WABA Phone Numbers",
        "Unlimited Team Seats",
        "Custom DMARC / Dedicated IPs",
        "24/7 Dedicated Slack SLA",
      ],
    },
  ];

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <CreditCard className="h-6 w-6 text-primary" />
          Subscription & Usage Metering
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor your real-time message consumption, active subscription tiers, and billing invoices.
        </p>
      </div>

      {/* Real-time Usage Metering Cards (PRD Section 57) */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Current Billing Cycle Usage (Sep 01 - Sep 30, 2026)
          </h2>
          <span className="text-[11px] text-muted-foreground">Renews in 26 days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {usageMeters.map((meter) => (
            <div key={meter.label} className="p-4 rounded-xl bg-card border border-border space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground/90">{meter.label}</span>
                <span className={`font-bold ${meter.pct > 80 ? "text-amber-400" : "text-foreground"}`}>
                  {meter.pct}%
                </span>
              </div>

              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    meter.pct > 80
                      ? "bg-gradient-to-r from-amber-500 to-rose-500"
                      : "bg-gradient-to-r from-indigo-500 to-emerald-400"
                  }`}
                  style={{ width: `${meter.pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>
                  {meter.used.toLocaleString()} / {meter.total.toLocaleString()} {meter.unit}
                </span>
                <span>
                  {(meter.total - meter.used).toLocaleString()} remaining
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Tiers (PRD Section 56) */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-4">
          Available Subscription Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-6 rounded-2xl flex flex-col justify-between space-y-6 transition-all ${
                p.isCurrent
                  ? "bg-gradient-to-b from-indigo-950/60 to-slate-900 border-2 border-primary/60 shadow-xl shadow-indigo-500/10"
                  : "glass-panel border-border"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                  {p.isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold border border-primary/30">
                      CURRENT PLAN
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">
                    {p.price}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.period}</span>
                </div>

                <p className="text-xs text-muted-foreground">{p.desc}</p>

                <div className="space-y-2 pt-2 border-t border-border">
                  {p.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 text-xs text-foreground/90"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={p.isCurrent}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                  p.isCurrent
                    ? "bg-secondary text-muted-foreground cursor-default"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                }`}
              >
                {p.isCurrent ? "Active Plan" : `Upgrade to ${p.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
