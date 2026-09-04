import React from 'react';
import { X, Phone, Globe, MapPin, Star, Clock, ExternalLink, Trash2, Calendar, Shield } from 'lucide-react';
import { Lead } from '../../types/lead';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onDelete
}) => {
  if (!lead) return null;

  const confidence = lead.confidenceScore || 50;
  const confidenceColor =
    confidence >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    confidence >= 50 ? 'text-blue-600 bg-blue-50 border-blue-200' :
    'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {lead.category || 'Business Listing'}
              </span>
              <h2 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                {lead.businessName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-xs">
            {/* Rating & Status Bar */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-800 text-sm">
                  {lead.rating ? lead.rating.toFixed(1) : 'No rating'}
                </span>
                {lead.reviewCount !== undefined && (
                  <span className="text-slate-400">({lead.reviewCount.toLocaleString()} reviews)</span>
                )}
              </div>

              {lead.businessStatus && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  lead.businessStatus.toLowerCase().includes('open')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {lead.businessStatus}
                </span>
              )}
            </div>

            {/* Quality Score */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Data Completeness
                </span>
                <span className="font-bold text-slate-700">{confidence}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    confidence >= 80 ? 'bg-emerald-500' : confidence >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5 pt-1">
              <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Contact & Location
              </h3>

              {/* Phone */}
              <div className="flex items-start space-x-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Telephone</span>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="font-semibold text-blue-600 hover:underline text-xs"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not available</span>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start space-x-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Website</span>
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-600 hover:underline text-xs truncate flex items-center gap-1"
                    >
                      <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not available</span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Physical Address</span>
                  {lead.address ? (
                    <p className="font-medium text-slate-700 leading-relaxed text-xs">
                      {lead.address}
                    </p>
                  ) : (
                    <span className="text-slate-400 italic">Not available</span>
                  )}
                  {lead.mapsUrl && (
                    <a
                      href={lead.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline mt-1"
                    >
                      <span>Open on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            {lead.openingHours && lead.openingHours.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Opening Hours
                </h3>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  {lead.openingHours.map((line, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Collected: {new Date(lead.collectedAt).toLocaleDateString()} at {new Date(lead.collectedAt).toLocaleTimeString()}
              </p>
              {lead.searchQuery && (
                <p>Search Query: <span className="text-slate-600 font-medium">{lead.searchQuery}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(lead.id);
              onClose();
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Lead</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
