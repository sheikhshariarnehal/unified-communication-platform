"use client";

import { useState } from "react";
import {
  Plug2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Activity,
} from "lucide-react";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([
    {
      id: "wh-1",
      url: "https://api.acmeglobal.com/webhooks/unified",
      events: ["email.delivered", "whatsapp.read", "campaign.completed"],
      status: "active",
      lastDelivery: "2 minutes ago · 200 OK (84ms)",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [testSent, setTestSent] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setWebhooks([
      ...webhooks,
      {
        id: `wh-${Date.now()}`,
        url: newUrl.trim(),
        events: ["email.delivered", "whatsapp.read"],
        status: "active",
        lastDelivery: "Never",
      },
    ]);
    setNewUrl("");
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Plug2 className="h-6 w-6 text-primary" />
            Developer Outgoing Webhooks
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Receive real-time event notifications for delivered emails, WhatsApp read receipts, link clicks, and campaign events.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Webhook Endpoint</span>
        </button>
      </div>

      {/* Webhooks list */}
      <div className="space-y-4">
        {webhooks.map((wh) => (
          <div key={wh.id} className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground font-mono">
                    {wh.url}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                    {wh.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Subscribed to: {wh.events.join(", ")}
                </div>
              </div>

              <button
                onClick={() => setWebhooks(webhooks.filter((w) => w.id !== wh.id))}
                className="text-muted-foreground hover:text-rose-400 p-1 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Last payload: {wh.lastDelivery}</span>
              </span>

              <button
                onClick={() => {
                  setTestSent(true);
                  setTimeout(() => setTestSent(false), 2000);
                }}
                className="text-primary hover:text-primary font-medium"
              >
                {testSent ? "Payload Sent! (200 OK)" : "Send Test Ping"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-foreground">
              Add Outgoing Webhook Endpoint
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  HTTPS Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhook"
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  Create Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
