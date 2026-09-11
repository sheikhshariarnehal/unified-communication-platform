import React from 'react';
import {
  X, Phone, Globe, MapPin, Star, Clock, ExternalLink, Trash2,
  Calendar, Shield, MessageSquare, Compass
} from 'lucide-react';
import { Lead } from '../../types/lead';
import { getDisplayAddress, isWhatsAppEligible, getWhatsAppDirectUrl } from '../utils/formatters';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onDelete,
}) => {
  if (!lead) return null;

  const confidence = lead.confidenceScore || 50;
  const displayAddress = getDisplayAddress(lead);
  const isWA = isWhatsAppEligible(lead.phone);
  const waLink = getWhatsAppDirectUrl(lead.phone, `Hello ${lead.businessName}, `);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-card text-foreground h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left border-l border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-start justify-between bg-muted/40 shrink-0">
          <div className="pr-3">
            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-foreground bg-primary/20 border border-primary/30 uppercase tracking-wider mb-1">
              {lead.category || 'Business Listing'}
            </span>
            <h2 className="text-sm font-bold text-foreground leading-snug">
              {lead.businessName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Rating & Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border shadow-2xs">
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-accent-foreground fill-current" />
              <span className="font-bold text-foreground text-sm">
                {lead.rating ? lead.rating.toFixed(1) : 'No rating'}
              </span>
              {lead.reviewCount !== undefined && (
                <span className="text-muted-foreground font-medium">
                  ({lead.reviewCount.toLocaleString()} reviews)
                </span>
              )}
            </div>

            {lead.businessStatus && (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                  lead.businessStatus.toLowerCase().includes('open')
                    ? 'bg-whatsapp/15 text-whatsapp border border-whatsapp/25'
                    : 'bg-destructive/15 text-destructive border border-destructive/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    lead.businessStatus.toLowerCase().includes('open')
                      ? 'bg-whatsapp'
                      : 'bg-destructive'
                  }`}
                />
                {lead.businessStatus}
              </span>
            )}
          </div>

          {/* Quality Score Meter with Champagne Gold Bar */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium text-foreground">
              <span className="flex items-center gap-1.5 font-bold">
                <Shield className="w-3.5 h-3.5 text-accent-foreground" />
                Data Completeness
              </span>
              <span className="font-bold text-accent-foreground">{confidence}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full rounded-full transition-all duration-500 bg-primary"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          {/* Contact & Direct Actions */}
          <div className="space-y-2">
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] px-0.5">
              Contact & Direct Actions
            </h3>

            {/* Telephone & WhatsApp */}
            <div className="p-3 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Telephone</span>
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="font-bold text-foreground hover:underline text-xs transition-colors"
                      >
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">Not listed</span>
                    )}
                  </div>
                </div>

                {/* Quick actions for phone */}
                {lead.phone && (
                  <div className="flex items-center gap-1">
                    {isWA && waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-whatsapp/15 hover:bg-whatsapp/25 text-whatsapp border border-whatsapp/30 rounded-lg flex items-center gap-1 font-bold text-[10px] transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <a
                      href={`tel:${lead.phone}`}
                      className="p-1.5 bg-secondary hover:bg-muted text-foreground border border-border rounded-lg text-[10px] font-semibold transition-colors"
                      title="Call Number"
                    >
                      Call
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Website */}
            <div className="p-3 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-muted-foreground block font-medium">Website</span>
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-foreground hover:underline text-xs truncate flex items-center gap-1"
                      >
                        <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">Not listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Address */}
            <div className="p-3 rounded-xl border border-border bg-card space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 rounded-lg bg-muted text-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground block font-medium">Physical Address</span>
                  {displayAddress ? (
                    <p className="font-medium text-foreground leading-relaxed text-xs mt-0.5">
                      {displayAddress}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Verified Google Maps Place Marker
                    </p>
                  )}

                  {lead.mapsUrl && (
                    <a
                      href={lead.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground hover:underline mt-2"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Open on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          {lead.openingHours && lead.openingHours.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1 px-0.5">
                <Clock className="w-3.5 h-3.5" />
                Opening Hours
              </h3>
              <div className="bg-muted/30 p-2.5 rounded-xl border border-border text-[11px] text-foreground space-y-1">
                {lead.openingHours.map((line, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 border-t border-border text-[10px] text-muted-foreground space-y-1 px-0.5">
            <p className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Collected: {new Date(lead.collectedAt).toLocaleDateString()} at{' '}
              {new Date(lead.collectedAt).toLocaleTimeString()}
            </p>
            {lead.searchQuery && (
              <p>
                Search Query:{' '}
                <span className="text-foreground font-semibold">{lead.searchQuery}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Bottom Drawer Footer */}
        <div className="p-3 border-t border-border bg-muted/40 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (confirm('Delete this lead from local database?')) {
                onDelete(lead.id);
                onClose();
              }
            }}
            className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Lead</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-bold transition-all shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
