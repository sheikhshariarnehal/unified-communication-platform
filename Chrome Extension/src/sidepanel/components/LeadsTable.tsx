import React, { useState, useMemo } from 'react';
import {
  Search, Filter, ArrowUpDown, Trash2, Download, ExternalLink,
  Phone, Globe, Star, CheckSquare, Square, Eye, RotateCcw
} from 'lucide-react';
import { Lead, FilterOptions, SortOption, Collection } from '../../types/lead';
import { filterAndSortLeads } from '../../database/leads';

interface LeadsTableProps {
  leads: Lead[];
  collections: Collection[];
  selectedCollectionId?: string;
  onSelectCollection: (id: string) => void;
  onDeleteLeads: (ids: string[]) => void;
  onOpenExport: (selectedOnly: boolean) => void;
  onViewLead: (lead: Lead) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  collections,
  selectedCollectionId = 'all',
  onSelectCollection,
  onDeleteLeads,
  onOpenExport,
  onViewLead
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

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
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

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || minRating > 0 || phoneStatus !== 'all' || websiteStatus !== 'all' || selectedCollectionId !== 'all';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Controls & Search Bar */}
      <div className="p-3 bg-white border-b border-slate-200 space-y-2.5">
        {/* Search & Filter Row */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, phone, address..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => onOpenExport(selectedIds.length > 0)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
            title="Export Leads"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 text-xs animate-fade-in">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Collection Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Collection
                </label>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => onSelectCollection(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="all">All Collections ({leads.length})</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.leadCount})</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-medium truncate"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3.0+ Stars</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Phone Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Phone
                </label>
                <select
                  value={phoneStatus}
                  onChange={(e) => setPhoneStatus(e.target.value as any)}
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="all">All</option>
                  <option value="has_phone">Has Phone</option>
                  <option value="no_phone">No Phone</option>
                </select>
              </div>

              {/* Website Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Website
                </label>
                <select
                  value={websiteStatus}
                  onChange={(e) => setWebsiteStatus(e.target.value as any)}
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="all">All</option>
                  <option value="has_website">Has Website</option>
                  <option value="no_website">No Website</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Sort By
                </label>
                <select
                  value={`${sortOption.field}-${sortOption.order}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-') as [any, any];
                    setSortOption({ field, order });
                  }}
                  className="w-full text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                >
                  <option value="collectedAt-desc">Newest First</option>
                  <option value="collectedAt-asc">Oldest First</option>
                  <option value="name-asc">Name A → Z</option>
                  <option value="name-desc">Name Z → A</option>
                  <option value="rating-desc">Rating High → Low</option>
                  <option value="reviews-desc">Reviews High → Low</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lead Count & Bulk Actions Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSelectAll}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title={allSelected ? "Deselect All" : "Select All"}
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-300" />
              )}
            </button>
            <span className="font-semibold text-slate-700">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'Lead' : 'Leads'}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-1.5 animate-fade-in">
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {selectedIds.length} Selected
              </span>
              <button
                onClick={() => onOpenExport(true)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Export Selected"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} selected leads?`)) {
                    onDeleteLeads(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredLeads.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No leads found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'Start a collection from the Collector tab while browsing Google Maps.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isSelected = selectedIds.includes(lead.id);

            return (
              <div
                key={lead.id}
                onClick={() => onViewLead(lead)}
                className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                  isSelected ? 'bg-blue-50/40' : 'bg-white'
                }`}
              >
                {/* Select Checkbox */}
                <button
                  type="button"
                  onClick={(e) => toggleSelectOne(lead.id, e)}
                  className="mt-0.5 p-0.5 text-slate-300 hover:text-slate-500 rounded"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300" />
                  )}
                </button>

                {/* Lead Summary Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {lead.businessName}
                    </h4>
                    {lead.rating ? (
                      <span className="shrink-0 text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {lead.rating.toFixed(1)}
                        {lead.reviewCount ? (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({lead.reviewCount})
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>

                  {lead.category && (
                    <span className="text-[10px] text-slate-500 font-medium block truncate mt-0.5">
                      {lead.category}
                    </span>
                  )}

                  {lead.address && (
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      {lead.address}
                    </p>
                  )}

                  {/* Badges / Links Row */}
                  <div className="flex items-center gap-2 mt-2">
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                      >
                        <Phone className="w-2.5 h-2.5 text-blue-600" />
                        <span className="truncate max-w-[110px]">{lead.phone}</span>
                      </a>
                    ) : null}

                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                        title={lead.website}
                      >
                        <Globe className="w-2.5 h-2.5 text-blue-600" />
                        <span>Website</span>
                      </a>
                    ) : null}

                    {lead.businessStatus && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                        lead.businessStatus.toLowerCase().includes('open')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {lead.businessStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inspect Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewLead(lead);
                  }}
                  className="mt-1 p-1 text-slate-300 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                  title="View Full Details"
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
