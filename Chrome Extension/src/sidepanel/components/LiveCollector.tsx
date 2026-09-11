import React, { useState, useEffect } from 'react';
import {
  Play, Pause, Square, Search, Sparkles, ArrowRight,
  MousePointer, ShieldCheck, Download, Compass, ExternalLink,
  MessageSquare, Phone, Globe, ChevronRight
} from 'lucide-react';
import { ExtensionStatus } from '../../types/messages';
import { Lead } from '../../types/lead';
import { isWhatsAppEligible } from '../utils/formatters';

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
  onViewLead?: (lead: Lead) => void;
  totalStoredLeads?: number;
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
  onOpenExport,
  onViewLead,
  totalStoredLeads = 0
}) => {
  const [collectionName, setCollectionName] = useState(
    status.mapsStatus.searchQuery || 'New Collection'
  );

  useEffect(() => {
    if (status.mapsStatus.searchQuery) {
      setCollectionName(status.mapsStatus.searchQuery);
    }
  }, [status.mapsStatus.searchQuery]);

  const isCollecting = status.state === 'COLLECTING';
  const isPaused = status.state === 'PAUSED';
  const isIdle = status.state === 'IDLE';
  const isConnected = status.mapsStatus.isConnected;

  const handleOpenGoogleMaps = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      try {
        const tabs = await chrome.tabs.query({ url: '*://*.google.com/maps*' });
        if (tabs.length > 0 && tabs[0].id) {
          chrome.tabs.update(tabs[0].id, { active: true });
          return;
        }
      } catch {
        // fallback
      }
    }

    const mapsUrl = 'https://www.google.com/maps';
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: mapsUrl });
    } else {
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="p-3.5 space-y-3 max-w-full animate-fade-in bg-background">
      {/* State-Driven Control Card */}
      {!isConnected ? (
        /* Disconnected State: Focused, Distilled Hero Action */
        <div className="bg-card rounded-2xl p-4 border border-border shadow-2xs space-y-3 text-center">
          <div className="w-10 h-10 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center text-foreground border border-border shadow-2xs">
            <Compass className="w-5 h-5 text-accent-foreground animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-xs text-foreground">
              Google Maps Not Detected
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Open Google Maps in this tab and search for businesses to activate automated lead extraction.
            </p>
          </div>

          <button
            onClick={handleOpenGoogleMaps}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 active:scale-[0.99] text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-primary/25 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Open Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </button>
        </div>
      ) : (
        /* Connected State: Clean Extraction Console */
        <div className="bg-card rounded-2xl p-3.5 border border-border shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-foreground" />
              Detected Query
            </span>

            <span className="text-[10px] font-bold text-whatsapp bg-whatsapp/10 border border-whatsapp/25 px-2 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-whatsapp animate-pulse"></span>
              <span>{status.mapsStatus.searchQuery ? status.mapsStatus.searchQuery : 'Maps Ready'}</span>
            </span>
          </div>

          {isIdle ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Collection name (e.g. Mobile shop Dhaka)"
                className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-semibold text-foreground transition-all placeholder:text-muted-foreground placeholder:font-normal"
              />
            </div>
          ) : (
            <div className="bg-muted/40 p-2.5 rounded-xl border border-border">
              <h3 className="text-xs font-bold text-foreground truncate">
                {status.activeCollectionName || status.searchQuery || 'Google Maps Collection'}
              </h3>
            </div>
          )}

          {/* Action Buttons */}
          <div>
            {isIdle && (
              <button
                onClick={() => onStart(collectionName || status.mapsStatus.searchQuery || 'Google Maps Leads')}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Collection</span>
              </button>
            )}

            {isCollecting && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onPause}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs shadow-amber-500/20 active:scale-[0.99] cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={onStop}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            )}

            {isPaused && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onResume}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-whatsapp hover:bg-whatsapp/90 text-white transition-all shadow-xs shadow-whatsapp/20 active:scale-[0.99] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
                <button
                  onClick={onStop}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-foreground hover:bg-foreground/90 text-primary transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>

          {/* Integrated Inline Auto-Scroll Toggle */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <MousePointer className="w-3 h-3 text-accent-foreground" />
              <span>Auto-Scroll Feed</span>
              {status.autoScrollActive && isCollecting && (
                <span className="text-[9px] font-bold text-whatsapp bg-whatsapp/15 px-1.5 py-0.2 rounded-full uppercase">
                  Scrolling
                </span>
              )}
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={!!status.autoScrollActive}
                onChange={(e) => onToggleAutoScroll(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-border after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      )}

      {/* Modern KPI Metrics Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card p-3 rounded-2xl border border-border shadow-2xs space-y-0.5 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Captured
            </span>
            {isCollecting && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whatsapp opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-whatsapp"></span>
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {status.leadsCollectedThisSession}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {totalStoredLeads > 0 ? `${totalStoredLeads} total stored` : 'Session capture'}
          </p>
        </div>

        <div className="bg-card p-3 rounded-2xl border border-border shadow-2xs space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Duplicates Filtered
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-accent-foreground" />
          </div>
          <div className="text-2xl font-black text-foreground tracking-tight">
            {status.duplicatesSkippedThisSession}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Deduplicated vs DB
          </p>
        </div>
      </div>

      {/* Real-Time Stream Card */}
      <div className="bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-border flex items-center justify-between bg-muted/30">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
            Real-Time Stream
          </h4>
          <span className="text-[10px] font-bold text-foreground bg-card px-2 py-0.5 rounded-full border border-border">
            {recentLeads.length} recent
          </span>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-muted/70 mx-auto flex items-center justify-center text-muted-foreground mb-1.5">
              <Search className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-bold text-foreground">No leads captured in this session</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 max-w-xs mx-auto">
              Start collection on Google Maps to stream extracted leads live.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border max-h-56 overflow-y-auto">
            {recentLeads.slice(0, 15).map((lead) => {
              const isWA = isWhatsAppEligible(lead.phone);
              return (
                <div
                  key={lead.id}
                  onClick={() => onViewLead && onViewLead(lead)}
                  className={`p-2.5 transition-colors flex items-center justify-between gap-2 ${
                    onViewLead
                      ? 'cursor-pointer hover:bg-muted/50 group'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-foreground group-hover:text-accent-foreground transition-colors truncate">
                      {lead.businessName}
                    </h5>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-muted-foreground">
                      {lead.category && (
                        <span className="truncate max-w-[130px]">
                          {lead.category}
                        </span>
                      )}
                      {lead.rating ? (
                        <span className="text-accent-foreground font-bold shrink-0 flex items-center gap-0.5">
                          ★ {lead.rating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Channel Badges */}
                  <div className="shrink-0 flex items-center space-x-1">
                    {lead.phone ? (
                      isWA ? (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-whatsapp/10 text-whatsapp border border-whatsapp/25 px-1.5 py-0.5 rounded-md font-bold">
                          <MessageSquare className="w-2.5 h-2.5 text-whatsapp" />
                          <span>WhatsApp</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-secondary text-secondary-foreground border border-border px-1.5 py-0.5 rounded-md font-semibold">
                          <Phone className="w-2.5 h-2.5 text-muted-foreground" />
                          <span>Phone</span>
                        </span>
                      )
                    ) : null}

                    {lead.website ? (
                      <span className="inline-flex items-center gap-1 text-[9px] bg-primary/15 text-foreground border border-primary/30 px-1.5 py-0.5 rounded-md font-bold">
                        <Globe className="w-2.5 h-2.5 text-foreground" />
                        <span>Web</span>
                      </span>
                    ) : null}

                    {onViewLead && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Leads Link */}
        {recentLeads.length > 0 && (
          <div className="p-2.5 bg-muted/30 border-t border-border flex items-center justify-between">
            <button
              onClick={onViewLeads}
              className="text-xs font-bold text-foreground hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Collected Leads</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onOpenExport}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-muted cursor-pointer"
            >
              <Download className="w-3 h-3 text-muted-foreground" />
              <span>Export</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
