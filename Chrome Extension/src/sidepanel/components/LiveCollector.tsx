import React, { useState } from 'react';
import { Play, Pause, Square, Search, Sparkles, AlertCircle, ArrowRight, MousePointer, ShieldCheck, Download, Database } from 'lucide-react';
import { ExtensionStatus } from '../../types/messages';
import { Lead } from '../../types/lead';
import { getAllLeads } from '../../database/leads';
import { pushLeadsToPlatform } from '../../platform/sync';

interface LiveCollectorProps {
  status: ExtensionStatus;
  recentLeads: Lead[];
  onStart: (collectionName: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleAutoScroll: (enabled: boolean) => void;
  onViewLeads: () => void;
  onOpenExport: () => void;
}

export const LiveCollector: React.FC<LiveCollectorProps> = ({
  status,
  recentLeads,
  onStart,
  onPause,
  onResume,
  onStop,
  onToggleAutoScroll,
  onViewLeads,
  onOpenExport
}) => {
  const [collectionName, setCollectionName] = useState(
    status.mapsStatus.searchQuery || 'New Collection'
  );
  const [isSyncingPlatform, setIsSyncingPlatform] = useState(false);
  const [platformSyncStatus, setPlatformSyncStatus] = useState<string | null>(null);

  const isCollecting = status.state === 'COLLECTING';
  const isPaused = status.state === 'PAUSED';
  const isIdle = status.state === 'IDLE';

  return (
    <div className="p-4 space-y-4 max-w-full">
      {/* Current Search Query Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            Detected Search
          </span>
          {status.mapsStatus.isConnected && status.mapsStatus.searchQuery && (
            <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Live Query
            </span>
          )}
        </div>

        {isIdle ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Collection / Project Name:
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g. Mobile Shops in Dhaka"
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
            />
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
              {status.activeCollectionName || status.searchQuery || 'Google Maps Collection'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Query: {status.searchQuery || status.mapsStatus.searchQuery || 'All results'}
            </p>
          </div>
        )}

        {/* Collection Controls */}
        <div className="pt-1">
          {isIdle && (
            <button
              onClick={() => onStart(collectionName || status.mapsStatus.searchQuery || 'Google Maps Leads')}
              disabled={!status.mapsStatus.isConnected}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
                status.mapsStatus.isConnected
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-[0.99]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Collection</span>
            </button>
          )}

          {isCollecting && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onPause}
                className="py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm shadow-amber-500/20 active:scale-[0.99]"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
              <button
                onClick={onStop}
                className="py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm shadow-rose-600/20 active:scale-[0.99]"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {isPaused && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onResume}
                className="py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
              <button
                onClick={onStop}
                className="py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-800 text-white transition-all active:scale-[0.99]"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          )}
        </div>

        {/* Warning if not on Google Maps */}
        {!status.mapsStatus.isConnected && (
          <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Google Maps Not Open</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Open <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="underline font-bold">google.com/maps</a> in this tab and search for businesses to start collecting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Collected Leads
          </span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-800">
              {status.leadsCollectedThisSession}
            </span>
            {isCollecting && (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center animate-pulse">
                ● Live
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Duplicates Filtered
          </span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-600">
              {status.duplicatesSkippedThisSession}
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Auto-Scroll Helper Toggle */}
      <div className={`px-3.5 py-3 rounded-xl border shadow-xs flex items-center justify-between transition-colors ${
        status.autoScrollActive
          ? 'bg-blue-50/50 border-blue-200'
          : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg ${status.autoScrollActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
            <MousePointer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-800">Auto-Scroll Helper</h4>
              {status.autoScrollActive && isCollecting && (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full uppercase flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-600 animate-ping"></span>
                  Scrolling
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {status.autoScrollActive
                ? (isCollecting ? 'Smoothly scrolling & detecting Google Maps results...' : 'Enabled (Will auto-scroll when collection starts)')
                : 'Automatically scrolls Google Maps results feed'}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
          <input
            type="checkbox"
            checked={!!status.autoScrollActive}
            onChange={(e) => onToggleAutoScroll(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Live Stream of Collected Leads */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Real-Time Stream
          </h4>
          <span className="text-[10px] font-semibold text-slate-400">
            {recentLeads.length} recent
          </span>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-2">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No leads captured in this session yet</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Click Start Collection and browse or scroll results on Google Maps to collect leads automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {recentLeads.slice(0, 15).map((lead) => (
              <div key={lead.id} className="p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-800 truncate">
                      {lead.businessName}
                    </h5>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400">
                      {lead.category && <span className="truncate">{lead.category}</span>}
                      {lead.rating && (
                        <span className="text-amber-600 font-semibold">
                          ★ {lead.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 flex items-center space-x-1">
                    {lead.phone && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                        Phone
                      </span>
                    )}
                    {lead.website && (
                      <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                        Web
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Action Footer */}
        {recentLeads.length > 0 && (
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                onClick={onViewLeads}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                <span>View All Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={async () => {
                    if (isSyncingPlatform) return;
                    setIsSyncingPlatform(true);
                    setPlatformSyncStatus('Syncing...');
                    try {
                      const allLeads = await getAllLeads();
                      const res = await pushLeadsToPlatform(allLeads, collectionName);
                      if (res.success && res.stats) {
                        setPlatformSyncStatus(`✓ Synced ${res.stats.uniqueProcessed} leads (${res.stats.whatsappEligible} WA)!`);
                      } else {
                        setPlatformSyncStatus(`✕ ${res.error || 'Failed'}`);
                      }
                    } catch (err: any) {
                      setPlatformSyncStatus('✕ Error: ' + err.message);
                    } finally {
                      setIsSyncingPlatform(false);
                    }
                  }}
                  disabled={isSyncingPlatform}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  title="Stream directly into Unified Email & WhatsApp CRM"
                >
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>{isSyncingPlatform ? 'Pushing...' : 'Push to Platform'}</span>
                </button>
                <button
                  onClick={onOpenExport}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-200/60"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {platformSyncStatus && (
              <div className="text-[10px] p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-medium">
                {platformSyncStatus}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
