export type CollectionState = 
  | 'IDLE' 
  | 'STARTING' 
  | 'COLLECTING' 
  | 'PAUSED' 
  | 'STOPPING' 
  | 'ERROR';

export type CollectionMode = 'search_results' | 'business_details' | 'smart_mode';

export interface Lead {
  id: string;
  businessName: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  normalizedPhone?: string;
  website?: string;
  address?: string;
  mapsUrl?: string;
  businessStatus?: string; // 'Open', 'Closed', etc.
  openingHours?: string[];
  latitude?: number;
  longitude?: number;
  searchQuery?: string;
  location?: string;
  collectionId: string;
  source: 'google_maps';
  collectedAt: string;
  updatedAt: string;
  confidenceScore?: number; // 0 - 100
}

export interface Collection {
  id: string;
  name: string;
  searchQuery?: string;
  location?: string;
  leadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionHistory {
  id: string;
  collectionId: string;
  collectionName: string;
  query: string;
  timestamp: string;
  leadsAdded: number;
  status: 'COMPLETED' | 'STOPPED' | 'ERROR';
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  minRating: number; // 0, 3, 4, 4.5
  phoneStatus: 'all' | 'has_phone' | 'no_phone';
  websiteStatus: 'all' | 'has_website' | 'no_website';
  collectionId?: string;
}

export type SortField = 'name' | 'rating' | 'reviews' | 'collectedAt';
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  order: SortOrder;
}

export interface AppSettings {
  collectionMode: CollectionMode;
  globalDeduplication: boolean;
  autoScrollAssist: boolean;
  autoScrollSpeed: number; // ms per scroll step, e.g. 1500
  platformSyncEnabled?: boolean;
  platformUrl?: string;
  platformApiKey?: string;
  autoSyncOnStop?: boolean;
}
