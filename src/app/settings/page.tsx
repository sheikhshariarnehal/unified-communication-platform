'use client';

import React from 'react';
import { Settings, Users, Key, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage workspace members, roles, security settings, and notifications.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Workspace Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Workspace Name</label>
            <input
              type="text"
              defaultValue="Acme Global Inc"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Workspace Slug</label>
            <input
              type="text"
              defaultValue="acme-global"
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-400 bg-slate-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
