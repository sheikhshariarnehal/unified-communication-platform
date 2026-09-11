import React from 'react';
import { MapPin, Database, FolderGit2, Settings, Compass } from 'lucide-react';
import { MapsStatus } from '../../types/messages';

export type ActiveTab = 'collector' | 'leads' | 'collections' | 'settings';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mapsStatus: MapsStatus;
  totalLeadsCount: number;
  platformWorkspaceName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  mapsStatus,
  totalLeadsCount,
  platformWorkspaceName,
}) => {
  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-30 shadow-2xs">
      {/* Top Brand & Connection Status Row */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-foreground text-primary flex items-center justify-center shadow-xs shadow-primary/20 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-foreground text-xs tracking-tight">
                LeadMap
              </h1>
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-primary/20 text-foreground border border-primary/30">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium truncate">
              {platformWorkspaceName ? `Synced: ${platformWorkspaceName}` : 'Unified Platform Lead Collector'}
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {mapsStatus.isConnected ? (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-whatsapp/10 border border-whatsapp/25 text-whatsapp text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-whatsapp animate-pulse"></span>
              <span>Maps Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
              <span>No Maps Tab</span>
            </div>
          )}
        </div>
      </div>

      {/* Distilled Segmented Navigation Tabs */}
      <nav className="flex items-center gap-1 p-1 border-t border-border bg-muted/40 select-none">
        <button
          onClick={() => onSelectTab('collector')}
          className={`flex-1 py-1.5 px-2 text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all outline-none ${
            activeTab === 'collector'
              ? 'bg-card text-foreground font-bold shadow-2xs border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Collector</span>
        </button>

        <button
          onClick={() => onSelectTab('leads')}
          className={`flex-1 py-1.5 px-2 text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all outline-none ${
            activeTab === 'leads'
              ? 'bg-card text-foreground font-bold shadow-2xs border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Leads</span>
          {totalLeadsCount > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-primary/25 text-foreground font-bold">
              {totalLeadsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('collections')}
          className={`flex-1 py-1.5 px-2 text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all outline-none ${
            activeTab === 'collections'
              ? 'bg-card text-foreground font-bold shadow-2xs border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Collections</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`p-1.5 rounded-lg text-xs flex items-center justify-center transition-all outline-none ${
            activeTab === 'settings'
              ? 'bg-card text-foreground shadow-2xs border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
          }`}
          title="Settings & Platform Config"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </nav>
    </header>
  );
};
