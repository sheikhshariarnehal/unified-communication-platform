import { Lead } from '../types/lead';

declare const chrome: any;

export interface PlatformSyncSettings {
  apiUrl: string;
  apiKey: string;
  autoSyncOnStop: boolean;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSyncSettings = {
  apiUrl: 'http://localhost:3000/api/v1/leads/ingest',
  apiKey: 'ewc_live_9a7fe91bc2d8',
  autoSyncOnStop: true,
};

export async function getPlatformSettings(): Promise<PlatformSyncSettings> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return DEFAULT_PLATFORM_SETTINGS;
  }

  const data = await chrome.storage.local.get(['platformSettings']);
  return {
    ...DEFAULT_PLATFORM_SETTINGS,
    ...(data.platformSettings || {}),
  };
}

export async function savePlatformSettings(
  settings: Partial<PlatformSyncSettings>
): Promise<PlatformSyncSettings> {
  const current = await getPlatformSettings();
  const updated = { ...current, ...settings };
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ platformSettings: updated });
  }
  return updated;
}

export async function pushLeadsToPlatform(
  leads: Lead[],
  customListName?: string
): Promise<{
  success: boolean;
  message?: string;
  stats?: {
    totalReceived: number;
    uniqueProcessed: number;
    inserted: number;
    updated: number;
    whatsappEligible: number;
    landlines: number;
    skippedNoPhone: number;
  };
  list?: {
    id: string;
    name: string;
  };
  error?: string;
}> {
  if (!leads || leads.length === 0) {
    return { success: false, error: 'No leads selected to sync.' };
  }

  const settings = await getPlatformSettings();

  try {
    const payload = {
      leads,
      list_name: customListName,
    };

    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errBody.error || `Server responded with ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      stats: data.stats,
      list: data.list,
    };
  } catch (err: any) {
    console.error('[LeadMap] Failed to push leads to Unified Platform:', err);
    return {
      success: false,
      error: err.message || 'Network error: could not connect to Unified Platform',
    };
  }
}
