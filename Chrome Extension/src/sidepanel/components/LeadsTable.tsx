import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Trash2, Download, ExternalLink,
  Phone, Globe, Star, CheckSquare, Square, Eye, RotateCcw, MapPin, MessageSquare
} from 'lucide-react';
import { Lead, FilterOptions, SortOption, Collection } from '../../types/lead';
import { filterAndSortLeads } from '../../database/leads';
import { getDisplayAddress, isWhatsAppEligible, getWhatsAppDirectUrl } from '../utils/formatters';

interface LeadsTableProps {
  leads: Lead[];
  collections: Collection[];
  selectedCollectionId?: string;
  onSelectCollection: (id: string) => void;
  onDeleteLeads: (ids: string[]) => void;
  onOpenExport: (selectedOnly: boolean) => void;
  onViewLead: (lead: Lead) => void;
  onSelectLeadsChange?: (selectedIds: string[]) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  collections,
  selectedCollectionId = 'all',
  onSelectCollection,
  onDeleteLeads,
  onOpenExport,
  onViewLead,
  onSelectLeadsChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [phoneStatus, setPhoneStatus] = useState<'all' | 'has_phone' | 'no_phone'>('all');
  const [websiteStatus, setWebsiteStatus] = useState<'all' | 'has_website' | 'no_website'>('all');

  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'collectedAt',
    order: 'desc'
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Extract distinct categories from current leads
  const categories = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    const filters: FilterOptions = {
      searchQuery,
      category: categoryFilter,
      minRating,
      phoneStatus,
      websiteStatus,
      collectionId: selectedCollectionId
    };
    return filterAndSortLeads(leads, filters, sortOption);
  }, [leads, searchQuery, categoryFilter, minRating, phoneStatus, websiteStatus, selectedCollectionId, sortOption]);

  const allSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedIds.includes(l.id));

  const updateSelected = (newIds: string[]) => {
    setSelectedIds(newIds);
    if (onSelectLeadsChange) onSelectLeadsChange(newIds);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      updateSelected([]);
    } else {
      updateSelected(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      updateSelected(selectedIds.filter(i => i !== id));
    } else {
      updateSelected([...selectedIds, id]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setMinRating(0);
    setPhoneStatus('all');
    setWebsiteStatus('all');
    onSelectCollection('all');
  };

  const hasActiveFilters =
    searchQuery ||
    categoryFilter !== 'all' ||
    minRating > 0 ||
    phoneStatus !== 'all' ||
    websiteStatus !== 'all' ||
    selectedCollectionId !== 'all';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Search & Filter Bar */}
      <div className="p-3 bg-card border-b border-border space-y-2.5 shrink-0 shadow-2xs">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, phone, address..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-medium text-foreground transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-primary/20 border-primary/40 text-foreground shadow-xs font-bold'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground"></span>
            )}
          </button>

          <button
            onClick={() => onOpenExport(selectedIds.length > 0)}
            className="p-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Export Leads"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Filter Drawer */}
        {showFilters && (
          <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2.5 text-xs animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {/* Collection Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Collection
                </label>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => onSelectCollection(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg font-medium text-foreground"
                >
                  <option value="all">All Collections ({leads.length})</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.leadCount})</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg font-medium text-foreground truncate"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg font-medium text-foreground"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3.0+ Stars</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Phone Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Phone Status
                </label>
                <select
                  value={phoneStatus}
                  onChange={(e) => setPhoneStatus(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg font-medium text-foreground"
                >
                  <option value="all">All</option>
                  <option value="has_phone">Has Phone</option>
                  <option value="no_phone">No Phone</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-destructive hover:underline flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lead Count & Selection Header */}
        <div className="flex items-center justify-between text-xs pt-1 px-0.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSelectAll}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
              title={allSelected ? 'Deselect All' : 'Select All'}
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              )}
            </button>
            <span className="font-bold text-foreground text-xs">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'Lead' : 'Leads'}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-1.5 animate-fade-in">
              <span className="text-[10px] font-bold text-foreground bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full">
                {selectedIds.length} Selected
              </span>
              <button
                onClick={() => onOpenExport(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Export Selected"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} selected leads?`)) {
                    onDeleteLeads(selectedIds);
                    updateSelected([]);
                  }
                }}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete Selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {filteredLeads.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground mb-3 shadow-2xs">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-foreground">No leads found</h4>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
              {hasActiveFilters
                ? 'No leads match your active filters. Try clearing or adjusting search terms.'
                : 'Start scraping from the Collector tab while browsing Google Maps.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs font-semibold text-primary-foreground underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isSelected = selectedIds.includes(lead.id);
            const displayAddress = getDisplayAddress(lead);
            const isWA = isWhatsAppEligible(lead.phone);
            const waLink = getWhatsAppDirectUrl(lead.phone);

            return (
              <div
                key={lead.id}
                onClick={() => onViewLead(lead)}
                className={`p-3 cursor-pointer transition-all flex items-start space-x-2.5 group ${
                  isSelected
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : 'bg-card hover:bg-muted/40'
                }`}
              >
                {/* Select Checkbox */}
                <button
                  type="button"
                  onClick={(e) => toggleSelectOne(lead.id, e)}
                  className="mt-0.5 p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>

                {/* Lead Summary Info */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Title + Rating */}
                  <div className="flex items-start justify-between gap-1.5">
                    <h4 className="text-xs font-bold text-foreground group-hover:text-accent-foreground transition-colors truncate">
                      {lead.businessName}
                    </h4>

                    {lead.rating ? (
                      <span className="shrink-0 text-[10px] font-bold text-accent-foreground bg-accent/30 border border-accent/40 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current text-accent-foreground" />
                        <span>{lead.rating.toFixed(1)}</span>
                        {lead.reviewCount ? (
                          <span className="text-[9px] text-muted-foreground font-normal">
                            ({lead.reviewCount})
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>

                  {/* Subtitle Row: Category & Status */}
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {lead.category && (
                      <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">
                        {lead.category}
                      </span>
                    )}

                    {lead.businessStatus && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1 ${
                          lead.businessStatus.toLowerCase().includes('open')
                            ? 'bg-whatsapp/10 text-whatsapp border border-whatsapp/25'
                            : 'bg-destructive/10 text-destructive border border-destructive/25'
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            lead.businessStatus.toLowerCase().includes('open')
                              ? 'bg-whatsapp'
                              : 'bg-destructive'
                          }`}
                        />
                        {lead.businessStatus}
                      </span>
                    )}
                  </div>

                  {/* Address Snippet (Cleansed) */}
                  {displayAddress && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{displayAddress}</span>
                    </div>
                  )}

                  {/* Badges / Interactive Links Row */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {lead.phone ? (
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground bg-secondary hover:bg-muted px-2 py-0.5 rounded-md border border-border transition-colors"
                        >
                          <Phone className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="truncate max-w-[110px]">{lead.phone}</span>
                        </a>

                        {isWA && waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-0.5 text-[9px] font-bold text-whatsapp bg-whatsapp/10 hover:bg-whatsapp/20 border border-whatsapp/25 px-1.5 py-0.5 rounded-md transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-2.5 h-2.5 text-whatsapp" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    ) : null}

                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground bg-secondary hover:bg-muted px-2 py-0.5 rounded-md border border-border transition-colors"
                        title={lead.website}
                      >
                        <Globe className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="truncate max-w-[100px]">
                          {lead.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Inspect Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewLead(lead);
                  }}
                  className="mt-1 p-1.5 text-muted-foreground group-hover:text-foreground rounded-lg hover:bg-muted transition-colors shrink-0"
                  title="View Lead Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
