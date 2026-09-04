"use client";

import { useState } from "react";
import { Settings, Save, ShieldCheck, Building, Globe } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState("Acme Global Corp");
  const [slug, setSlug] = useState("acme-global");
  const [timezone, setTimezone] = useState("America/New_York");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-primary" />
          Workspace General Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure tenant details, organization timezone, and automated compliance thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl space-y-5">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-3">
          Organization Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground/90 mb-1">
              Workspace Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/90 mb-1">
              Workspace URL Slug
            </label>
            <div className="flex items-center">
              <span className="bg-card border border-r-0 border-border px-3 py-2 text-xs text-muted-foreground rounded-l-lg">
                app.unifiedplatform.com/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-background border border-border rounded-r-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/90 mb-1">
              Default Scheduling Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="America/New_York">Eastern Time (US & Canada) (UTC-05:00)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada) (UTC-08:00)</option>
              <option value="Europe/London">London (UTC+00:00)</option>
              <option value="Asia/Dhaka">Dhaka (UTC+06:00)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+09:00)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-emerald-400">
            {saved ? "Settings saved successfully! ✓" : ""}
          </span>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
