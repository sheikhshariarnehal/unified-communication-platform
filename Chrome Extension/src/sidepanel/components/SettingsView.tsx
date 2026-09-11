import React, { useState, useEffect } from 'react';
import {
  Shield, Sliders, Database, Trash2, Download,
  CheckCircle2, RefreshCw, Key, Globe, Cloud
} from 'lucide-react';
import { AppSettings, CollectionMode } from '../../types/lead';
import { getPlatformSettings, savePlatformSettings } from '../../platform/sync';

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
  onExportBackup,
}) => {
  const [platformUrl, setPlatformUrl] = useState(settings.platformUrl || 'http://localhost:3000/api/v1/leads/ingest');
  const [platformApiKey, setPlatformApiKey] = useState(settings.platformApiKey || 'ewc_live_9a7fe91bc2d8');
  const [autoSyncOnStop, setAutoSyncOnStop] = useState(settings.autoSyncOnStop ?? true);
  const [connectedWorkspace, setConnectedWorkspace] = useState<string>('Acme Global Corp');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);

  // Sync initial platform settings from storage
  useEffect(() => {
    getPlatformSettings().then((p) => {
      if (p.apiUrl) setPlatformUrl(p.apiUrl);
      if (p.apiKey) setPlatformApiKey(p.apiKey);
      if (p.autoSyncOnStop !== undefined) setAutoSyncOnStop(p.autoSyncOnStop);
    });

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['platformWorkspaceName'], (res) => {
        if (res?.platformWorkspaceName) {
          setConnectedWorkspace(res.platformWorkspaceName);
        }
      });
    }
  }, []);

  const handleSavePlatform = (newUrl?: string, newKey?: string, newAutoSync?: boolean) => {
    const url = newUrl ?? platformUrl;
    const key = newKey ?? platformApiKey;
    const auto = newAutoSync ?? autoSyncOnStop;

    savePlatformSettings({
      apiUrl: url,
      apiKey: key,
      autoSyncOnStop: auto,
    });

    onUpdateSettings({
      platformUrl: url,
      platformApiKey: key,
      autoSyncOnStop: auto,
    });
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setDetectStatus('Scanning browser sessions...');

    if (typeof chrome === 'undefined' || !chrome.tabs?.query) {
      setIsDetecting(false);
      setDetectStatus('Browser extension context required.');
      return;
    }

    try {
      const baseUrl = platformUrl.replace(/\/api\/v1\/.*$/, '');
      const tabs = await chrome.tabs.query({
        url: [`${baseUrl}/*`, 'http://localhost:3000/*', 'https://*.vercel.app/*'],
      });

      if (tabs && tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_ACTIVE_TAB_WORKSPACE' }, (resp) => {
          setIsDetecting(false);
          if (resp && resp.success && resp.workspace) {
            const ws = resp.workspace;
            setConnectedWorkspace(ws.workspaceName);
            if (ws.apiKey) {
              setPlatformApiKey(ws.apiKey);
              handleSavePlatform(undefined, ws.apiKey);
            }
            setDetectStatus(`Connected: ${ws.workspaceName}`);
          } else {
            setDetectStatus('No active platform session found in open tabs.');
          }
        });
      } else {
        const res = await fetch(`${baseUrl}/api/v1/leads/ingest`, {
          credentials: 'include',
        });
        const data = await res.json();
        setIsDetecting(false);
        if (data && data.workspace) {
          setConnectedWorkspace(data.workspace.name);
          setDetectStatus(`Detected: ${data.workspace.name}`);
        } else {
          setDetectStatus('Platform responded but user session not detected.');
        }
      }
    } catch (e: any) {
      setIsDetecting(false);
      setDetectStatus(e.message || 'Detection failed.');
    }
  };

  const collectionModes: {
    id: CollectionMode;
    title: string;
    badge?: string;
    desc: string;
  }[] = [
    {
      id: 'search_results',
      title: 'Search Results Mode',
      badge: 'Fast',
      desc: 'Streams and extracts leads visible directly in Google Maps search list cards as you scroll.',
    },
    {
      id: 'smart_mode',
      title: 'Smart Mode',
      badge: 'Recommended',
      desc: 'Captures search listings and automatically fetches complete business details when opening place cards.',
    },
    {
      id: 'business_details',
      title: 'Business Details Only',
      badge: 'High Precision',
      desc: 'Only extracts high-precision contact info when viewing dedicated place detail views.',
    },
  ];

  return (
    <div className="p-4 space-y-4 max-w-full text-xs animate-fade-in bg-background">
      {/* Collection Mode */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Sliders className="w-3.5 h-3.5 text-accent-foreground" />
            Collection Mode
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium">Scraping Engine</span>
        </div>

        <div className="space-y-2">
          {collectionModes.map((mode) => {
            const isSelected = settings.collectionMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => onUpdateSettings({ collectionMode: mode.id })}
                className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary/60 bg-primary/10 shadow-xs'
                    : 'border-border hover:border-border/80 bg-card hover:bg-muted/40'
                }`}
              >
                {/* Custom Styled Radio Indicator */}
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border bg-card'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-xs ${
                        isSelected ? 'text-foreground font-black' : 'text-foreground'
                      }`}
                    >
                      {mode.title}
                    </span>
                    {mode.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          mode.id === 'smart_mode'
                            ? 'bg-primary/20 text-foreground border border-primary/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        {mode.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deduplication Strategy */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Shield className="w-3.5 h-3.5 text-accent-foreground" />
          Deduplication Scope
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
          <div className="pr-4">
            <h4 className="font-bold text-foreground text-xs">Global Deduplication</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              Prevents storing the same business multiple times across separate collections.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.globalDeduplication}
              onChange={(e) => onUpdateSettings({ globalDeduplication: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Unified Platform Connection & Multi-Tenant Sync */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Cloud className="w-3.5 h-3.5 text-whatsapp" />
            Unified Platform Live Sync
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-whatsapp bg-whatsapp/10 px-2 py-0.5 rounded-full border border-whatsapp/25">
            <span className="w-1.5 h-1.5 rounded-full bg-whatsapp animate-pulse" />
            {connectedWorkspace}
          </span>
        </div>

        <div className="space-y-2.5">
          {/* API URL */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Platform Ingestion URL
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={platformUrl}
                onChange={(e) => {
                  setPlatformUrl(e.target.value);
                  handleSavePlatform(e.target.value);
                }}
                placeholder="http://localhost:3000/api/v1/leads/ingest"
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-muted/40 border border-border rounded-lg font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Workspace API Key
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={platformApiKey}
                onChange={(e) => {
                  setPlatformApiKey(e.target.value);
                  handleSavePlatform(undefined, e.target.value);
                }}
                placeholder="ewc_live_9a7fe91bc2d8"
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-muted/40 border border-border rounded-lg font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Auto-detect button */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleAutoDetect}
              disabled={isDetecting}
              className="py-1.5 px-3 bg-foreground hover:bg-foreground/90 text-primary rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              <RefreshCw className={`w-3 h-3 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>Auto-Detect from Active Browser Session</span>
            </button>

            {detectStatus && (
              <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">
                {detectStatus}
              </span>
            )}
          </div>

          {/* Auto sync on stop toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <h4 className="font-bold text-foreground text-xs">Auto-Sync on Stop</h4>
              <p className="text-[10px] text-muted-foreground">
                Pushes leads to CRM automatically whenever collection finishes.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSyncOnStop}
                onChange={(e) => {
                  setAutoSyncOnStop(e.target.checked);
                  handleSavePlatform(undefined, undefined, e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Database & Storage */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-3">
        <h3 className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Database className="w-3.5 h-3.5 text-accent-foreground" />
          Local Database (IndexedDB)
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 bg-muted/40 rounded-xl border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Stored Leads
            </span>
            <span className="text-lg font-black text-foreground mt-0.5 block">
              {totalLeadsCount}
            </span>
          </div>
          <div className="p-3 bg-muted/40 rounded-xl border border-border">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Collections
            </span>
            <span className="text-lg font-black text-foreground mt-0.5 block">
              {totalCollectionsCount}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <button
            onClick={onExportBackup}
            className="w-full py-2.5 px-3 border border-border hover:border-border/80 rounded-xl font-bold text-foreground flex items-center justify-center space-x-1.5 transition-all bg-card hover:bg-muted/40 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Download Complete Database Backup (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to delete ALL leads and collections? This cannot be undone.'
                )
              ) {
                onClearAllData();
              }
            }}
            className="w-full py-2 px-3 text-destructive hover:underline rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Local Database</span>
          </button>
        </div>
      </div>

      {/* Privacy & Compliance Notice */}
      <div className="p-3 bg-accent/25 border border-accent/40 rounded-2xl text-[11px] text-foreground space-y-1">
        <span className="font-bold text-foreground flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-whatsapp" />
          Local-First & Responsible Use
        </span>
        <p className="leading-relaxed text-muted-foreground">
          All collected leads are stored securely on your local device in Chrome IndexedDB. Data is only pushed to your Unified Platform workspace when you authorize it.
        </p>
      </div>
    </div>
  );
};
