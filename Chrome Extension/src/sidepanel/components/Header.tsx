import React from 'react';
import { MapPin, Database, FolderGit2, Settings, Compass } from 'lucide-react';
import { MapsStatus } from '../../types/messages';

export type ActiveTab = 'collector' | 'leads' | 'collections' | 'settings';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mapsStatus: MapsStatus;
  totalLeadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  mapsStatus,
  totalLeadsCount
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      {/* Top Brand & Connection Status Row */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
              LeadMap
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Google Maps Collector</p>
          </div>
        </div>

        {/* Maps Connection Status Pill */}
        <div className="flex items-center">
          {mapsStatus.isConnected ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Maps Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>No Maps Tab</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <nav className="flex px-2 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => onSelectTab('collector')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'collector'
              ? 'border-blue-600 text-blue-600 bg-white shadow-xs rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Collector</span>
        </button>

        <button
          onClick={() => onSelectTab('leads')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'leads'
              ? 'border-blue-600 text-blue-600 bg-white shadow-xs rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Leads</span>
          {totalLeadsCount > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {totalLeadsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('collections')}
          className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === 'collections'
              ? 'border-blue-600 text-blue-600 bg-white shadow-xs rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Collections</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`px-3 py-2.5 text-xs font-medium flex items-center justify-center border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600 bg-white shadow-xs rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
          }`}
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </nav>
    </header>
  );
};
