import React, { useState, useEffect } from 'react';
import { Compass, ExternalLink, Database, Play, Square, MapPin } from 'lucide-react';
import { ExtensionStatus, RuntimeMessage } from '../types/messages';
import { getAllLeads } from '../database/leads';
import { pushLeadsToPlatform } from '../platform/sync';

declare const chrome: any;

export const Popup: React.FC = () => {
  const [status, setStatus] = useState<ExtensionStatus | null>(null);
  const [totalLeads, setTotalLeads] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get extension status
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' } as RuntimeMessage, (res: ExtensionStatus) => {
        if (!chrome.runtime.lastError && res) {
          setStatus(res);
        }
      });
    }

    getAllLeads().then(leads => setTotalLeads(leads.length)).catch(() => {});
  }, []);

  const openSidePanel = async () => {
    if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.windows) {
      const currentWindow = await chrome.windows.getCurrent();
      if (currentWindow.id) {
        await chrome.sidePanel.open({ windowId: currentWindow.id });
        window.close();
      }
    }
  };

  const openGoogleMaps = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'https://www.google.com/maps' });
      window.close();
    }
  };

  return (
    <div className="w-72 bg-white text-slate-800 p-4 space-y-3 font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-xs tracking-tight">LeadMap</h1>
            <p className="text-[10px] text-slate-400">Google Maps Collector</p>
          </div>
        </div>

        {status?.mapsStatus?.isConnected ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Not on Maps
          </span>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-400 block font-medium">Session</span>
          <span className="font-bold text-slate-800 text-sm">
            {status?.leadsCollectedThisSession || 0}
          </span>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-400 block font-medium">Total Saved</span>
          <span className="font-bold text-slate-800 text-sm">{totalLeads}</span>
        </div>
      </div>

      {/* Main Action: Open Side Panel */}
      <button
        onClick={openSidePanel}
        className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/25 transition-all active:scale-[0.98]"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>Open LeadMap Dashboard</span>
      </button>

      {/* Unified Platform Sync Button */}
      <button
        onClick={async () => {
          if (syncing) return;
          setSyncing(true);
          setSyncMessage('Syncing with platform...');
          try {
            const leads = await getAllLeads();
            if (leads.length === 0) {
              setSyncMessage('No leads collected yet.');
              return;
            }
            const res = await pushLeadsToPlatform(leads);
            if (res.success && res.stats) {
              setSyncMessage(`✅ Synced ${res.stats.uniqueProcessed} leads (${res.stats.whatsappEligible} WhatsApp)!`);
            } else {
              setSyncMessage(`❌ ${res.error || 'Failed to sync'}`);
            }
          } catch (e: any) {
            setSyncMessage('❌ Sync error: ' + e.message);
          } finally {
            setSyncing(false);
          }
        }}
        disabled={syncing}
        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-emerald-500/25 transition-all active:scale-[0.98]"
      >
        <Database className="w-3.5 h-3.5" />
        <span>{syncing ? 'Pushing Leads...' : 'Push to Unified Platform'}</span>
      </button>

      {syncMessage && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] text-emerald-800 font-medium text-center">
          {syncMessage}
        </div>
      )}

      {!status?.mapsStatus?.isConnected && (
        <button
          onClick={openGoogleMaps}
          className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
        >
          <MapPin className="w-3 h-3 text-blue-600" />
          <span>Go to Google Maps</span>
        </button>
      )}
    </div>
  );
};
