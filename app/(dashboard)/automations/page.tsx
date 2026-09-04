"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitFork,
  Plus,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function AutomationsListPage() {
  const [automations, setAutomations] = useState([
    {
      id: "auto-1",
      name: "New Customer Multi-Channel Onboarding",
      trigger: "Contact Subscribed",
      steps: 4,
      runs: 1420,
      active: true,
      channels: ["email", "whatsapp"],
      description: "Welcome email on signup → Wait 2 days → WhatsApp check-in if unread.",
    },
    {
      id: "auto-2",
      name: "VIP Early Access Flash Sale Nudge",
      trigger: "Tag Added: 'VIP'",
      steps: 3,
      runs: 850,
      active: true,
      channels: ["whatsapp"],
      description: "Send WhatsApp template message with dynamic discount code immediately.",
    },
    {
      id: "auto-3",
      name: "Abandoned Checkout Re-engagement",
      trigger: "API Event: 'cart.abandoned'",
      steps: 5,
      runs: 320,
      active: false,
      channels: ["email", "whatsapp"],
      description: "1-hour email reminder → 24-hour WhatsApp special 10% coupon.",
    },
  ]);

  const toggleActive = (id: string) => {
    setAutomations(
      automations.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <GitFork className="h-6 w-6 text-primary" />
            Automations & Customer Journeys
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Build event-driven communication flows across Email and WhatsApp with delays and conditional branching.
          </p>
        </div>

        <Link
          href="/automations/auto-1"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Workflow</span>
        </Link>
      </div>

      {/* Automations Cards */}
      <div className="space-y-4">
        {automations.map((workflow) => (
          <div
            key={workflow.id}
            className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border hover:border-border transition-colors"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <Link
                  href={`/automations/${workflow.id}`}
                  className="text-base font-bold text-foreground hover:text-primary transition-colors"
                >
                  {workflow.name}
                </Link>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    workflow.active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {workflow.active ? "Active" : "Paused"}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">{workflow.description}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Trigger: <strong className="text-foreground/90">{workflow.trigger}</strong>
                </span>
                <span>·</span>
                <span>{workflow.steps} workflow nodes</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">
                  {workflow.runs.toLocaleString()} runs executed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(workflow.id)}
                className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                  workflow.active
                    ? "bg-secondary text-foreground/90 border-border hover:bg-secondary/80"
                    : "bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30"
                }`}
                title={workflow.active ? "Pause Automation" : "Activate Automation"}
              >
                {workflow.active ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 text-emerald-400" />
                )}
              </button>

              <Link
                href={`/automations/${workflow.id}`}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium"
              >
                <span>Edit Canvas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
