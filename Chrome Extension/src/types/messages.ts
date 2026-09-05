import { CollectionState, Lead } from './lead';

export type MessageType =
  | 'GET_STATUS'
  | 'STATUS_RESPONSE'
  | 'START_COLLECTION'
  | 'PAUSE_COLLECTION'
  | 'RESUME_COLLECTION'
  | 'STOP_COLLECTION'
  | 'MAPS_STATUS_REPORT'
  | 'LEADS_EXTRACTED'
  | 'DETAIL_ENRICHMENT'
  | 'TOGGLE_AUTO_SCROLL'
  | 'SYNC_TO_PLATFORM'
  | 'UPDATE_PLATFORM_AUTH';

export interface MapsStatus {
  isConnected: boolean;
  searchQuery: string;
  isDetailPage: boolean;
  activeListingCount: number;
}

export interface ExtensionStatus {
  state: CollectionState;
  activeCollectionId: string | null;
  activeCollectionName: string | null;
  searchQuery: string;
  leadsCollectedThisSession: number;
  duplicatesSkippedThisSession: number;
  mapsStatus: MapsStatus;
  autoScrollActive: boolean;
}

export interface RuntimeMessage {
  type: MessageType;
  payload?: any;
}
