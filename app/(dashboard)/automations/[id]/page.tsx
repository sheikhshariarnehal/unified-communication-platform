"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Save,
  Plus,
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Sparkles,
  CheckCircle2,
  Trash2,
  Settings2,
} from "lucide-react";

export default function AutomationCanvasBuilderPage() {
  const [workflowName, setWorkflowName] = useState(
    "New Customer Multi-Channel Onboarding"
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationComplete(true);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Canvas Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/automations"
            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-bold text-foreground bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-ring rounded px-1.5 py-0.5"
            />
            <div className="text-[11px] text-muted-foreground">
              Visual Workflow Node Graph · Auto-saved
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium"
          >
            <Play className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin text-primary" : ""}`} />
            <span>{isSimulating ? "Simulating Run..." : "Test Run Simulation"}</span>
          </button>

          <button
            onClick={() => alert("Workflow published and active!")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Publish Workflow</span>
          </button>
        </div>
      </div>

      {simulationComplete && (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Simulation passed: Contact registered → Welcome Email Sent → 2d Delay → Condition evaluated → WhatsApp Dispatched!</span>
          </div>
          <button
            onClick={() => setSimulationComplete(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Visual Canvas Area (PRD Section 45) */}
      <div className="relative w-full min-h-[640px] bg-background/90 rounded-3xl border border-border p-8 overflow-x-auto flex flex-col items-center">
        {/* Subtle dot-grid canvas background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Node 1: Trigger Node */}
        <div className="relative z-10 w-72 glass-panel p-4 rounded-2xl border-primary/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              Trigger
            </span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm font-bold text-foreground">Contact Subscribed</div>
          <p className="text-[11px] text-muted-foreground">
            Fires when a new contact is added via API, CSV, or Web form.
          </p>
        </div>

        {/* Connecting Line */}
        <div className="w-0.5 h-10 bg-indigo-500/40 my-1" />

        {/* Node 2: Action Node (Send Email) */}
        <div className="relative z-10 w-72 glass-panel p-4 rounded-2xl border-primary/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
              Action
            </span>
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm font-bold text-foreground">Send Email: Welcome Blast</div>
          <p className="text-[11px] text-muted-foreground">
            Template: &quot;SaaS Product Announcement&quot;
          </p>
        </div>

        {/* Connecting Line */}
        <div className="w-0.5 h-10 bg-indigo-500/40 my-1" />

        {/* Node 3: Delay Node */}
        <div className="relative z-10 w-72 glass-panel p-3.5 rounded-2xl border-amber-500/30 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">Delay: Wait 2 Days</div>
              <div className="text-[10px] text-muted-foreground">Pause workflow execution</div>
            </div>
          </div>
        </div>

        {/* Connecting Line */}
        <div className="w-0.5 h-10 bg-indigo-500/40 my-1" />

        {/* Node 4: Condition Branch Node (PRD Section 44) */}
        <div className="relative z-10 w-80 glass-panel p-4 rounded-2xl border-purple-500/40 shadow-xl space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold text-purple-400">
            <GitBranch className="h-3.5 w-3.5" /> Condition
          </div>
          <div className="text-xs font-bold text-foreground">Did recipient open the email?</div>
        </div>

        {/* Branching Lines & Fork (PRD Section 44) */}
        <div className="w-full max-w-lg flex items-start justify-between mt-2 px-12">
          {/* YES Branch */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-2">
              YES (Opened)
            </span>
            <div className="w-0.5 h-8 bg-emerald-500/40" />

            <div className="w-64 glass-panel p-4 rounded-2xl border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">
                  Action
                </span>
                <MessageSquare className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-foreground">
                Send WhatsApp: VIP Deal
              </div>
              <p className="text-[10px] text-muted-foreground">
                Template: flash_sale_vip_exclusive
              </p>
            </div>
          </div>

          {/* NO Branch */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mb-2">
              NO (Unopened)
            </span>
            <div className="w-0.5 h-8 bg-amber-500/40" />

            <div className="w-64 glass-panel p-4 rounded-2xl border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Action
                </span>
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xs font-bold text-foreground">
                Resend Email with New Subject
              </div>
              <p className="text-[10px] text-muted-foreground">
                Alternative subject line follow-up
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
