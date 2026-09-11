import React, { useState, useEffect, useCallback } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, ExternalLink, Settings, MessageSquare, RotateCcw } from 'lucide-react';
import { Lead } from '../../types/lead';
import { pushLeadsToPlatform, getPlatformSettings } from '../../platform/sync';

interface PlatformSyncDockProps {
  leads: Lead[];
  selectedCount?: number;
  collectionName?: string;
  onOpenSettings: () => void;
}

interface WorkspaceInfo {
  id?: string;
  name: string;
  url: string;
  apiKey?: string;
}

export const PlatformSyncDock: React.FC<PlatformSyncDockProps> = ({
  leads,
  selectedCount = 0,
  collectionName,
  onOpenSettings,
}) => {
  const [workspace, setWorkspace] = useState<WorkspaceInfo>({
    name: 'Unified Platform',
    url: 'http://localhost:3000',
  });
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncResult, setSyncResult] = useState<{
    count?: number;
    whatsappEligible?: number;
    listName?: string;
    whatsappUrl?: string;
    emailUrl?: string;
    error?: string;
  } | null>(null);

  // Auto-discover workspace connection
  const checkWorkspaceConnection = useCallback(async () => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return;

    chrome.storage.local.get(
      ['platformUrl', 'platformApiKey', 'platformWorkspaceId', 'platformWorkspaceName'],
      async (stored) => {
        const baseUrl = (stored.platformUrl || 'http://localhost:3000').replace(/\/+$/, '');

        // 1. Check open browser tabs for active workspace
        if (chrome.tabs?.query) {
          try {
            const tabs = await chrome.tabs.query({
              url: [`${baseUrl}/*`, 'http://localhost:3000/*', 'https://*.vercel.app/*'],
            });
            if (tabs && tabs.length > 0 && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_ACTIVE_TAB_WORKSPACE' }, (resp) => {
                if (resp && resp.success && resp.workspace) {
                  const ws = resp.workspace;
                  chrome.storage.local.set({
                    platformWorkspaceId: ws.workspaceId,
                    platformWorkspaceName: ws.workspaceName,
                    platformApiKey: ws.apiKey,
                    platformUrl: ws.platformUrl || baseUrl,
                  });
                  setWorkspace({
                    id: ws.workspaceId,
                    name: ws.workspaceName,
                    url: ws.platformUrl || baseUrl,
                    apiKey: ws.apiKey,
                  });
                  return;
                }
              });
            }
          } catch {
            // tab query fallback
          }
        }

        // 2. Fetch authenticated workspace info from API
        try {
          const settings = await getPlatformSettings();
          const headers: Record<string, string> = {};
          if (settings.apiKey && !settings.apiKey.startsWith('ewc_live_9a7f')) {
            headers['Authorization'] = `Bearer ${settings.apiKey}`;
          }

          const res = await fetch(`${baseUrl}/api/v1/leads/ingest`, {
            credentials: 'include',
            headers,
          });
          const data = await res.json();
          if (data && data.success && data.workspace) {
            const wsName = data.workspace.name || 'My Workspace';
            setWorkspace({
              id: data.workspace.id,
              name: wsName,
              url: baseUrl,
              apiKey: data.workspace.apiKey,
            });
            chrome.storage.local.set({
              platformWorkspaceId: data.workspace.id,
              platformWorkspaceName: wsName,
              platformApiKey: data.workspace.apiKey || settings.apiKey,
            });
            return;
          }
        } catch {
          // fallback
        }

        if (stored.platformWorkspaceName) {
          setWorkspace({
            id: stored.platformWorkspaceId,
            name: stored.platformWorkspaceName,
            url: baseUrl,
            apiKey: stored.platformApiKey,
          });
        }
      }
    );
  }, []);

  useEffect(() => {
    checkWorkspaceConnection();
    const interval = setInterval(checkWorkspaceConnection, 10000);
    return () => clearInterval(interval);
  }, [checkWorkspaceConnection]);

  const countToPush = selectedCount > 0 ? selectedCount : leads.length;

  const handlePush = async () => {
    if (leads.length === 0 || syncState === 'syncing') return;
    setSyncState('syncing');
    setSyncResult(null);

    const leadsToSend = selectedCount > 0 ? leads.slice(0, selectedCount) : leads;
    const listName = collectionName || 'Google Maps Leads';

    const res = await pushLeadsToPlatform(leadsToSend, listName);

    if (res.success) {
      setSyncState('success');
      const waCount = res.stats?.whatsappEligible ?? 0;
      const totalCount = res.stats?.uniqueProcessed ?? leadsToSend.length;
      const listId = res.list?.id;
      const baseUrl = workspace.url.replace(/\/+$/, '');

      setSyncResult({
        count: totalCount,
        whatsappEligible: waCount,
        listName: res.list?.name || listName,
        whatsappUrl: listId
          ? `${baseUrl}/whatsapp/campaigns/new?listId=${listId}&name=${encodeURIComponent('WhatsApp Blast - ' + (res.list?.name || listName))}`
          : `${baseUrl}/whatsapp/campaigns/new`,
        emailUrl: `${baseUrl}/contacts`,
      });
    } else {
      setSyncState('error');
      setSyncResult({
        error: res.error || 'Failed to sync with Unified Platform',
      });
    }
  };

  const openUrl = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="shrink-0 p-3 bg-card/95 backdrop-blur-md border-t border-border shadow-lg transition-all">
      {/* Workspace Status Bar */}
      <div className="flex items-center justify-between text-[11px] mb-2 px-0.5">
        <div className="flex items-center gap-1.5 font-medium text-muted-foreground truncate">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whatsapp opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-whatsapp"></span>
          </span>
          <span className="truncate max-w-[180px] font-bold text-foreground">
            {workspace.name}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ({workspace.url.replace(/^https?:\/\//, '')})
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[10px] font-semibold transition-colors"
          title="Configure API & Target URL"
        >
          <Settings className="w-3 h-3" />
          <span>Settings</span>
        </button>
      </div>

      {/* STATE 1: Success State (Distilled into a single focused campaign launch card, replacing the redundant push button!) */}
      {syncState === 'success' && syncResult ? (
        <div className="p-2.5 bg-whatsapp/10 border border-whatsapp/25 rounded-xl space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-foreground font-bold truncate pr-2">
              <CheckCircle2 className="w-4 h-4 text-whatsapp shrink-0" />
              <span className="truncate">
                Synced {syncResult.count} leads ({syncResult.whatsappEligible} WhatsApp)
              </span>
            </div>
            <button
              onClick={() => setSyncState('idle')}
              className="text-[10px] text-muted-foreground hover:text-foreground font-bold shrink-0 underline"
            >
              Done
            </button>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {syncResult.whatsappUrl ? (
              <button
                onClick={() => openUrl(syncResult.whatsappUrl!)}
                className="flex-1 py-2 px-3 bg-whatsapp hover:bg-whatsapp/90 active:scale-[0.98] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-whatsapp/25 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Launch WhatsApp Blast</span>
              </button>
            ) : null}

            {syncResult.emailUrl && (
              <button
                onClick={() => openUrl(syncResult.emailUrl!)}
                className="py-2 px-3 bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                title="View in Contacts Table"
              >
                <span>Contacts</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ) : syncState === 'error' && syncResult ? (
        /* STATE 2: Error State */
        <div className="p-2.5 bg-destructive/10 border border-destructive/25 rounded-xl flex items-center justify-between text-xs text-destructive animate-fade-in">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{syncResult.error}</span>
          </div>
          <button
            onClick={() => setSyncState('idle')}
            className="text-[11px] font-bold underline shrink-0 ml-2"
          >
            Retry
          </button>
        </div>
      ) : (
        /* STATE 3: Idle / Syncing State */
        <button
          onClick={handlePush}
          disabled={countToPush === 0 || syncState === 'syncing'}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
            countToPush === 0
              ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-75'
              : syncState === 'syncing'
              ? 'bg-primary/80 text-primary-foreground cursor-wait'
              : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 cursor-pointer'
          }`}
        >
          {syncState === 'syncing' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
              <span>Pushing {countToPush} Leads to Workspace...</span>
            </>
          ) : countToPush === 0 ? (
            <>
              <Send className="w-4 h-4 opacity-50" />
              <span>Push Leads to Unified Platform</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {selectedCount > 0
                  ? `Push ${selectedCount} Selected Leads to Platform`
                  : `Push ${countToPush} Leads to ${workspace.name}`}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
