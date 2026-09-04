import { AppSettings, CollectionState } from '../types/lead';

export const DEFAULT_SETTINGS: AppSettings = {
  collectionMode: 'search_results',
  globalDeduplication: true,
  autoScrollAssist: true,
  autoScrollSpeed: 1200
};

export interface LocalSessionState {
  state: CollectionState;
  activeCollectionId: string | null;
  activeCollectionName: string | null;
  searchQuery: string;
  leadsCollectedCount: number;
  duplicatesSkippedCount: number;
  autoScrollActive: boolean;
}

const DEFAULT_SESSION: LocalSessionState = {
  state: 'IDLE',
  activeCollectionId: null,
  activeCollectionName: null,
  searchQuery: '',
  leadsCollectedCount: 0,
  duplicatesSkippedCount: 0,
  autoScrollActive: false
};

/**
 * Saves user settings.
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const merged = { ...current, ...settings };
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ leadmap_settings: merged });
  } else {
    localStorage.setItem('leadmap_settings', JSON.stringify(merged));
  }
  return merged;
}

/**
 * Retrieves user settings.
 */
export async function getSettings(): Promise<AppSettings> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const res = await chrome.storage.local.get('leadmap_settings');
    return { ...DEFAULT_SETTINGS, ...(res.leadmap_settings || {}) };
  } else {
    try {
      const stored = localStorage.getItem('leadmap_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
}

/**
 * Saves current collection session state.
 */
export async function saveSessionState(state: Partial<LocalSessionState>): Promise<LocalSessionState> {
  const current = await getSessionState();
  const merged = { ...current, ...state };
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ leadmap_session: merged });
  } else {
    localStorage.setItem('leadmap_session', JSON.stringify(merged));
  }
  return merged;
}

/**
 * Retrieves current collection session state.
 */
export async function getSessionState(): Promise<LocalSessionState> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const res = await chrome.storage.local.get('leadmap_session');
    return { ...DEFAULT_SESSION, ...(res.leadmap_session || {}) };
  } else {
    try {
      const stored = localStorage.getItem('leadmap_session');
      return stored ? { ...DEFAULT_SESSION, ...JSON.parse(stored) } : DEFAULT_SESSION;
    } catch {
      return DEFAULT_SESSION;
    }
  }
}
