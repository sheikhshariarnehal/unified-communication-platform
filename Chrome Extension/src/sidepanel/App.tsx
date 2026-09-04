import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { LiveCollector } from './components/LiveCollector';
import { LeadsTable } from './components/LeadsTable';
import { CollectionsManager } from './components/CollectionsManager';
import { SettingsView } from './components/SettingsView';
import { LeadDetailModal } from './components/LeadDetailModal';
import { ExportModal } from './components/ExportModal';
import { ExtensionStatus, RuntimeMessage } from '../types/messages';
import { Lead, Collection, CollectionHistory, AppSettings } from '../types/lead';
import { getAllLeads, deleteLeads, deleteLead } from '../database/leads';
import { getCollections, getCollectionHistory, deleteCollection, getOrCreateCollection } from '../database/collections';
import { getSettings, saveSettings } from '../database/storage';
import { exportToJson } from '../export/json';
import { AVAILABLE_FIELDS } from '../export/csv';

const INITIAL_STATUS: ExtensionStatus = {
  state: 'IDLE',
  activeCollectionId: null,
  activeCollectionName: null,
  searchQuery: '',
  leadsCollectedThisSession: 0,
  duplicatesSkippedThisSession: 0,
  mapsStatus: {
    isConnected: false,
    searchQuery: '',
    isDetailPage: false,
    activeListingCount: 0
  },
  autoScrollActive: false
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('collector');
  const [status, setStatus] = useState<ExtensionStatus>(INITIAL_STATUS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<CollectionHistory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    collectionMode: 'search_results',
    globalDeduplication: true,
    autoScrollAssist: true,
    autoScrollSpeed: 1200
  });

  // Modals & Selections
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSelectedOnly, setExportSelectedOnly] = useState(false);
  const [filterCollectionId, setFilterCollectionId] = useState('all');

  // Load database content
  const refreshDatabase = useCallback(async () => {
    try {
      const [allLeads, allCols, allHist, currentSettings] = await Promise.all([
        getAllLeads(),
        getCollections(),
        getCollectionHistory(),
        getSettings()
      ]);
      setLeads(allLeads);
      setCollections(allCols);
      setHistory(allHist);
      setSettings(currentSettings);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  // Poll background service worker for status updates
  const pollStatus = useCallback(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' } as RuntimeMessage, (res: ExtensionStatus) => {
        if (chrome.runtime.lastError) return;
        if (res) {
          setStatus(prev => {
            // If lead count changed, trigger DB reload
            if (res.leadsCollectedThisSession !== prev.leadsCollectedThisSession) {
              refreshDatabase();
            }
            return res;
          });
        }
      });
    }
  }, [refreshDatabase]);

  useEffect(() => {
    refreshDatabase();
    pollStatus();
    const interval = setInterval(pollStatus, 1000);
    return () => clearInterval(interval);
  }, [refreshDatabase, pollStatus]);

  // Actions
  const handleStart = (collectionName: string) => {
    chrome.runtime.sendMessage({
      type: 'START_COLLECTION',
      payload: { name: collectionName }
    } as RuntimeMessage, () => {
      pollStatus();
      refreshDatabase();
    });
  };

  const handlePause = () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_COLLECTION' } as RuntimeMessage, () => {
      pollStatus();
    });
  };

  const handleResume = () => {
    chrome.runtime.sendMessage({ type: 'RESUME_COLLECTION' } as RuntimeMessage, () => {
      pollStatus();
    });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: 'STOP_COLLECTION' } as RuntimeMessage, () => {
      pollStatus();
      refreshDatabase();
    });
  };

  const handleToggleAutoScroll = (enabled: boolean) => {
    chrome.runtime.sendMessage({
      type: 'TOGGLE_AUTO_SCROLL',
      payload: { enabled }
    } as RuntimeMessage, () => {
      setStatus(prev => ({ ...prev, autoScrollActive: enabled }));
    });
  };

  const handleDeleteLeads = async (ids: string[]) => {
    await deleteLeads(ids);
    await refreshDatabase();
  };

  const handleDeleteSingleLead = async (id: string) => {
    await deleteLead(id);
    await refreshDatabase();
  };

  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
    await refreshDatabase();
  };

  const handleCreateCollection = async (name: string) => {
    await getOrCreateCollection(name);
    await refreshDatabase();
  };

  const handleUpdateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await saveSettings(newSettings);
    setSettings(updated);
  };

  const handleClearAllData = async () => {
    await deleteLeads(leads.map(l => l.id));
    for (const c of collections) {
      await deleteCollection(c.id);
    }
    await refreshDatabase();
  };

  const handleExportFullBackup = () => {
    exportToJson(leads, AVAILABLE_FIELDS.map(f => f.key), `leadmap-full-backup-${Date.now()}`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 antialiased select-none">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mapsStatus={status.mapsStatus}
        totalLeadsCount={leads.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'collector' && (
          <LiveCollector
            status={status}
            recentLeads={leads.slice(-15).reverse()}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onToggleAutoScroll={handleToggleAutoScroll}
            onViewLeads={() => setActiveTab('leads')}
            onOpenExport={() => {
              setExportSelectedOnly(false);
              setIsExportOpen(true);
            }}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsTable
            leads={leads}
            collections={collections}
            selectedCollectionId={filterCollectionId}
            onSelectCollection={setFilterCollectionId}
            onDeleteLeads={handleDeleteLeads}
            onOpenExport={(selectedOnly) => {
              setExportSelectedOnly(selectedOnly);
              setIsExportOpen(true);
            }}
            onViewLead={setSelectedLead}
          />
        )}

        {activeTab === 'collections' && (
          <CollectionsManager
            collections={collections}
            history={history}
            onSelectCollection={(id) => {
              setFilterCollectionId(id);
              setActiveTab('leads');
            }}
            onDeleteCollection={handleDeleteCollection}
            onCreateCollection={handleCreateCollection}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            totalLeadsCount={leads.length}
            totalCollectionsCount={collections.length}
            onUpdateSettings={handleUpdateSettings}
            onClearAllData={handleClearAllData}
            onExportBackup={handleExportFullBackup}
          />
        )}
      </main>

      {/* Detail Slide-over Modal */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDelete={handleDeleteSingleLead}
      />

      {/* Export Dialog Modal */}
      <ExportModal
        leads={leads}
        selectedLeadIds={exportSelectedOnly ? [] : []}
        collectionName={collections.find(c => c.id === filterCollectionId)?.name}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
