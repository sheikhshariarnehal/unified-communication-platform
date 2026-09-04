import React from 'react';
import { Settings, Shield, Sliders, Database, Trash2, Download, CheckCircle2 } from 'lucide-react';
import { AppSettings, CollectionMode } from '../../types/lead';

interface SettingsViewProps {
  settings: AppSettings;
  totalLeadsCount: number;
  totalCollectionsCount: number;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearAllData: () => void;
  onExportBackup: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  totalLeadsCount,
  totalCollectionsCount,
  onUpdateSettings,
  onClearAllData,
  onExportBackup
}) => {
  return (
    <div className="p-4 space-y-4 max-w-full text-xs">
      {/* Collection Mode */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          Collection Mode
        </h3>

        <div className="space-y-2">
          {[
            {
              id: 'search_results' as CollectionMode,
              title: 'Search Results Mode (Fast)',
              desc: 'Collects leads visible in the Google Maps search results list as you browse or scroll.'
            },
            {
              id: 'smart_mode' as CollectionMode,
              title: 'Smart Mode (Recommended)',
              desc: 'Collects search results and automatically enriches missing details whenever you open a business card.'
            },
            {
              id: 'business_details' as CollectionMode,
              title: 'Business Details Only',
              desc: 'Enriches and saves high-precision data only when viewing individual place detail pages.'
            }
          ].map((mode) => (
            <label
              key={mode.id}
              className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                settings.collectionMode === mode.id
                  ? 'border-blue-500 bg-blue-50/40 text-slate-800 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
              }`}
            >
              <input
                type="radio"
                name="collectionMode"
                value={mode.id}
                checked={settings.collectionMode === mode.id}
                onChange={() => onUpdateSettings({ collectionMode: mode.id })}
                className="mt-0.5 text-blue-600"
              />
              <div className="flex-1">
                <span className="font-bold text-xs block text-slate-900">{mode.title}</span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Deduplication Strategy */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          Deduplication Scope
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-700">Global Deduplication</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Prevent saving the same business across multiple collections.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.globalDeduplication}
              onChange={(e) => onUpdateSettings({ globalDeduplication: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Unified Email & WhatsApp Platform Integration */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-3">
        <h3 className="font-bold text-emerald-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          Unified Platform Live Sync
        </h3>

        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
              Platform Ingestion URL
            </label>
            <input
              type="text"
              value={settings.platformUrl || 'http://localhost:3000/api/v1/leads/ingest'}
              onChange={(e) => onUpdateSettings({ platformUrl: e.target.value })}
              placeholder="http://localhost:3000/api/v1/leads/ingest"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
              Extension API Key
            </label>
            <input
              type="text"
              value={settings.platformApiKey || 'ewc_live_9a7fe91bc2d8'}
              onChange={(e) => onUpdateSettings({ platformApiKey: e.target.value })}
              placeholder="ewc_live_9a7fe91bc2d8"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <h4 className="font-semibold text-slate-700">Auto-Sync on Stop</h4>
              <p className="text-[10px] text-slate-400">
                Push newly collected leads to CRM automatically when scraping stops.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSyncOnStop ?? true}
                onChange={(e) => onUpdateSettings({ autoSyncOnStop: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Database & Storage */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          Local Database (IndexedDB)
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Stored Leads</span>
            <span className="text-base font-bold text-slate-800">{totalLeadsCount}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Collections</span>
            <span className="text-base font-bold text-slate-800">{totalCollectionsCount}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            onClick={onExportBackup}
            className="w-full py-2 px-3 border border-slate-200 hover:border-slate-300 rounded-lg font-semibold text-slate-700 flex items-center justify-center space-x-1.5 transition-colors bg-slate-50 hover:bg-white"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Complete Database Backup (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete ALL leads and collections? This cannot be undone.')) {
                onClearAllData();
              }
            }}
            className="w-full py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Local Database</span>
          </button>
        </div>
      </div>

      {/* Privacy & Compliance Notice */}
      <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-slate-600 space-y-1">
        <span className="font-bold text-blue-900 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          Local-First & Responsible Use
        </span>
        <p className="leading-relaxed">
          All collected leads are stored strictly on your local device in Chrome IndexedDB. No scraping proxies, CAPTCHA bypasses, or external servers are utilized.
        </p>
      </div>
    </div>
  );
};
