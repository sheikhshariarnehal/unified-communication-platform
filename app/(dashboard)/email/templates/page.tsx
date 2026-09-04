"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Smartphone,
  Tablet,
  Monitor,
  Code2,
  Sparkles,
} from "lucide-react";
import { mockEmailTemplates, getEmailTemplates } from "@/lib/email/service";
import { EmailTemplate } from "@/types/database";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    async function load() {
      const data = await getEmailTemplates();
      if (data && data.length > 0) setTemplates(data);
    }
    load();
  }, []);


  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Mail className="h-6 w-6 text-primary" />
            Email Templates Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Build, edit, and preview responsive email templates with dynamic variable personalization.
          </p>
        </div>

        <button
          onClick={() => {
            const created: EmailTemplate = {
              id: `tpl-${Date.now()}`,
              workspace_id: "ws-1",
              name: "New Custom Template",
              subject: "Special Announcement",
              html_content: "<h1>Hello {{first_name}}</h1><p>Your message here.</p>",
              thumbnail_url: null,
              created_at: new Date().toISOString().split("T")[0],
              updated_at: new Date().toISOString().split("T")[0],
            };
            setTemplates([created, ...templates]);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="glass-card-interactive rounded-2xl overflow-hidden flex flex-col justify-between border border-border"
          >
            {/* Template Miniature Preview Frame */}
            <div className="h-44 bg-background p-4 border-b border-border relative overflow-hidden group">
              <div className="w-full h-full bg-card rounded-lg p-3 text-[10px] text-muted-foreground select-none overflow-hidden font-mono border border-border">
                <div className="text-xs font-semibold text-primary font-sans truncate mb-1">
                  {tpl.subject}
                </div>
                <div className="opacity-70 line-clamp-4">
                  {tpl.html_content?.replace(/<[^>]*>?/gm, "")}
                </div>
              </div>

              <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setPreviewTemplate(tpl)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1 shadow-lg"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>
            </div>

            {/* Template Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {tpl.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Updated {tpl.updated_at}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setTemplates(templates.filter((t) => t.id !== tpl.id))
                  }
                  className="text-muted-foreground hover:text-rose-400 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Link
                  href="/email/campaigns/new"
                  className="text-xs font-semibold text-primary hover:text-primary flex items-center gap-1"
                >
                  <span>Use in Campaign</span>
                </Link>

                <button
                  onClick={() => setPreviewTemplate(tpl)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" /> View HTML
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Device Preview Modal (PRD Section 27) */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-background/60">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {previewTemplate.name}
                </h2>
                <span className="text-xs text-muted-foreground">
                  Subject: {previewTemplate.subject}
                </span>
              </div>

              {/* Viewport Toggles (Desktop, Tablet, Mobile) */}
              <div className="flex items-center p-1 rounded-lg bg-card border border-border">
                <button
                  onClick={() => setDeviceView("desktop")}
                  className={`p-1.5 rounded-md ${
                    deviceView === "desktop"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeviceView("tablet")}
                  className={`p-1.5 rounded-md ${
                    deviceView === "tablet"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeviceView("mobile")}
                  className={`p-1.5 rounded-md ${
                    deviceView === "mobile"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-muted-foreground hover:text-foreground text-xs px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body: Rendered HTML viewport */}
            <div className="flex-1 bg-background/80 p-6 flex items-center justify-center overflow-auto">
              <div
                className={`transition-all duration-200 bg-white rounded-xl shadow-2xl overflow-hidden h-full flex flex-col ${
                  deviceView === "desktop"
                    ? "w-full max-w-2xl"
                    : deviceView === "tablet"
                    ? "w-[480px]"
                    : "w-[340px]"
                }`}
              >
                <iframe
                  title="Email Preview"
                  srcDoc={previewTemplate.html_content || ""}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
