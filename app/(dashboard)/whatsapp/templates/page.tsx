"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Eye,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Check,
} from "lucide-react";
import { mockWhatsAppTemplates, getWhatsAppTemplates } from "@/lib/whatsapp/service";
import { WhatsAppTemplate } from "@/types/database";

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(mockWhatsAppTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(templates[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getWhatsAppTemplates();
      if (data && data.length > 0) {
        setTemplates(data);
        setSelectedTemplate(data[0]);
      }
    }
    load();
  }, []);


  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-emerald-400" />
            WhatsApp Message Templates
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage Meta-approved HSM message templates required for outbound WhatsApp business messaging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isSyncing ? "Syncing Meta..." : "Sync Templates"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Template List on Left, WhatsApp Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              className={`glass-panel p-5 rounded-2xl cursor-pointer border transition-all ${
                selectedTemplate.id === tpl.id
                  ? "border-emerald-500/50 bg-emerald-950/10 shadow-lg shadow-emerald-500/10"
                  : "hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground font-mono">
                      {tpl.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      {tpl.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px]">
                      {tpl.category}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Language: {tpl.language} · {tpl.variables.length} Dynamic Variables
                  </div>
                </div>

                <div className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-background/70 border border-border text-xs text-foreground/90 font-sans whitespace-pre-line line-clamp-3">
                {tpl.body_text}
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Mobile Mockup Preview (PRD Section 36) */}
        <div className="glass-panel p-5 rounded-3xl sticky top-20 flex flex-col items-center">
          <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-emerald-400" />
            <span>Mobile Device Simulation</span>
          </div>

          {/* Device Shell */}
          <div className="w-[300px] rounded-[36px] bg-background border-[6px] border-border p-3 shadow-2xl overflow-hidden">
            {/* WhatsApp Header */}
            <div className="bg-[#075e54] text-foreground p-2.5 rounded-t-2xl flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-emerald-400/20 flex items-center justify-center text-[10px] font-bold">
                AG
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">Acme Global</div>
                <div className="text-[9px] text-emerald-200">Official Business</div>
              </div>
            </div>

            {/* WhatsApp Chat Canvas */}
            <div className="bg-[#0b141a] p-3 min-h-[360px] flex flex-col justify-end space-y-2 text-[11px] rounded-b-2xl">
              {/* WhatsApp Message Bubble */}
              <div className="bg-[#005c4b] text-foreground p-3 rounded-2xl rounded-tr-none shadow space-y-1.5 max-w-[90%] self-end">
                {selectedTemplate.header_content && (
                  <div className="font-bold text-xs text-emerald-200 border-b border-white/10 pb-1">
                    {selectedTemplate.header_content}
                  </div>
                )}
                <div className="whitespace-pre-line leading-relaxed text-[11.5px]">
                  {selectedTemplate.body_text
                    .replace("{{1}}", "Sarah")
                    .replace("{{2}}", "#ORD-8921")
                    .replace("{{3}}", "https://track.acme.com/8921")}
                </div>
                {selectedTemplate.footer_text && (
                  <div className="text-[9px] text-foreground/90 pt-1">
                    {selectedTemplate.footer_text}
                  </div>
                )}
                <div className="text-[9px] text-foreground/90 text-right flex items-center justify-end gap-1">
                  <span>10:42 AM</span>
                  <span className="text-cyan-300 font-bold">✓✓</span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedTemplate.buttons?.map((btn, i) => (
                <div
                  key={i}
                  className="bg-[#202c33] text-cyan-400 p-2 rounded-xl text-center font-medium shadow text-[11px]"
                >
                  {btn.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
