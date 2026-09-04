"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Code2,
} from "lucide-react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([
    {
      id: "key-1",
      name: "Production Backend Service",
      prefix: "pk_live_9a8b...",
      created: "2026-08-15",
      lastUsed: "2 minutes ago",
      scopes: ["contacts:read", "contacts:write", "campaigns:send", "messages:dispatch"],
    },
    {
      id: "key-2",
      name: "Staging Testing Key",
      prefix: "pk_test_3f4c...",
      created: "2026-09-01",
      lastUsed: "Yesterday",
      scopes: ["*"],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    const secret = `pk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    setNewlyCreatedKey(secret);

    const created = {
      id: `key-${Date.now()}`,
      name: keyName,
      prefix: `${secret.substring(0, 12)}...`,
      created: "Just now",
      lastUsed: "Never",
      scopes: ["*"],
    };

    setKeys([created, ...keys]);
    setKeyName("");
  };

  const handleCopy = () => {
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Key className="h-6 w-6 text-primary" />
            Developer API Keys
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Authenticate programmatic REST API calls to dispatch messages, manage contacts, and sync audience lists.
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setNewlyCreatedKey(null);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Keys Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground bg-secondary/40">
              <th className="py-3 px-4 font-medium">Key Name</th>
              <th className="py-3 px-4 font-medium">Token Prefix</th>
              <th className="py-3 px-4 font-medium">Permissions</th>
              <th className="py-3 px-4 font-medium">Created</th>
              <th className="py-3 px-4 font-medium">Last Used</th>
              <th className="py-3 px-4 font-medium text-right">Revoke</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-secondary/30">
                <td className="py-3.5 px-4 font-medium text-foreground">{k.name}</td>
                <td className="py-3.5 px-4 font-mono text-primary">{k.prefix}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-secondary text-foreground/90 text-[10px] font-mono">
                    {k.scopes.join(", ")}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-muted-foreground">{k.created}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{k.lastUsed}</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setKeys(keys.filter((item) => item.id !== k.id))}
                    className="text-muted-foreground hover:text-rose-400 p-1"
                    title="Revoke Key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick API Snippet */}
      <div className="p-4 rounded-xl bg-background border border-border space-y-2 text-xs">
        <div className="flex items-center gap-2 text-foreground/90 font-semibold">
          <Code2 className="h-4 w-4 text-primary" />
          <span>cURL Example: Dispatch Single WhatsApp / Email Message</span>
        </div>
        <pre className="p-3 rounded-lg bg-card font-mono text-[11px] text-foreground/90 overflow-x-auto">
{`curl -X POST https://platform.unified.com/api/v1/messages \\
  -H "Authorization: Bearer pk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "whatsapp",
    "recipient": "+15550192830",
    "template_id": "order_shipping_update_v2",
    "variables": ["Sarah", "#ORD-8921", "https://track.acme.com/8921"]
  }'`}
        </pre>
      </div>

      {/* New Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-sm font-semibold text-foreground">
              Create New API Key
            </h2>

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Copy this key now. For security reasons, it will never be displayed again.</span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border font-mono text-xs text-foreground">
                  <span className="flex-1 truncate">{newlyCreatedKey}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded bg-secondary hover:bg-secondary/80 text-foreground/90"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Key Description / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. Production Backend Worker"
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
                    Create Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
