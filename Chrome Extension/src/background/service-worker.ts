import { saveLeadsBatch, putLead, getAllLeads } from '../database/leads';
import { getOrCreateCollection, refreshCollectionCount, logCollectionHistory } from '../database/collections';
import { getSettings, saveSettings, getSessionState, saveSessionState } from '../database/storage';
import { RuntimeMessage, MapsStatus, ExtensionStatus } from '../types/messages';
import { CollectionState, Lead } from '../types/lead';
import { matchDuplicate, enrichLead } from '../database/deduplicator';
import { pushLeadsToPlatform } from '../platform/sync';

console.log('[LeadMap] Service Worker initialized');

let currentMapsStatus: MapsStatus = {
  isConnected: false,
  searchQuery: '',
  isDetailPage: false,
  activeListingCount: 0
};

// Enable Side Panel to open on action click
if (typeof chrome !== 'undefined' && chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
    console.warn('[LeadMap] Side panel behavior setup:', err);
  });
}

// Update Extension Icon Badge
function updateBadge(count: number, state: CollectionState) {
  if (typeof chrome === 'undefined' || !chrome.action) return;

  if (state === 'COLLECTING') {
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '●' });
    chrome.action.setBadgeBackgroundColor({ color: '#2f7dfc' });
  } else if (state === 'PAUSED') {
    chrome.action.setBadgeText({ text: '⏸' });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Send message to active Google Maps tab
async function sendToMapsTab(message: RuntimeMessage): Promise<any> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0 && tabs[0].id) {
    try {
      return await chrome.tabs.sendMessage(tabs[0].id, message);
    } catch {
      // Content script may not be loaded on this tab yet
      return null;
    }
  }
  return null;
}

// Message Router
chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case 'GET_STATUS': {
          const session = await getSessionState();
          const settings = await getSettings();
          const isAutoScroll = typeof session.autoScrollActive === 'boolean' 
            ? session.autoScrollActive 
            : (settings.autoScrollAssist ?? false);

          const response: ExtensionStatus = {
            state: session.state,
            activeCollectionId: session.activeCollectionId,
            activeCollectionName: session.activeCollectionName,
            searchQuery: session.searchQuery || currentMapsStatus.searchQuery,
            leadsCollectedThisSession: session.leadsCollectedCount,
            duplicatesSkippedThisSession: session.duplicatesSkippedCount,
            mapsStatus: currentMapsStatus,
            autoScrollActive: isAutoScroll
          };
          sendResponse(response);
          break;
        }

        case 'MAPS_STATUS_REPORT': {
          if (message.payload) {
            currentMapsStatus = message.payload as MapsStatus;
          }
          sendResponse({ received: true });
          break;
        }

        case 'START_COLLECTION': {
          const session = await getSessionState();
          const settings = await getSettings();
          const query = message.payload?.searchQuery || currentMapsStatus.searchQuery || 'General Research';
          const collectionName = message.payload?.name || query;
          const collection = await getOrCreateCollection(collectionName, query);
          const shouldAutoScroll = typeof session.autoScrollActive === 'boolean'
            ? session.autoScrollActive
            : (settings.autoScrollAssist ?? true);

          await saveSessionState({
            state: 'COLLECTING',
            activeCollectionId: collection.id,
            activeCollectionName: collection.name,
            searchQuery: query,
            leadsCollectedCount: 0,
            duplicatesSkippedCount: 0,
            autoScrollActive: shouldAutoScroll
          });

          updateBadge(0, 'COLLECTING');

          // Notify content script
          await sendToMapsTab({
            type: 'START_COLLECTION',
            payload: {
              collectionId: collection.id,
              autoScroll: shouldAutoScroll
            }
          });

          sendResponse({ success: true, collection });
          break;
        }

        case 'PAUSE_COLLECTION': {
          await saveSessionState({ state: 'PAUSED' });
          const session = await getSessionState();
          updateBadge(session.leadsCollectedCount, 'PAUSED');
          await sendToMapsTab({ type: 'PAUSE_COLLECTION' });
          sendResponse({ success: true });
          break;
        }

        case 'RESUME_COLLECTION': {
          await saveSessionState({ state: 'COLLECTING' });
          const session = await getSessionState();
          updateBadge(session.leadsCollectedCount, 'COLLECTING');
          await sendToMapsTab({ type: 'RESUME_COLLECTION' });
          sendResponse({ success: true });
          break;
        }

        case 'STOP_COLLECTION': {
          const session = await getSessionState();
          if (session.activeCollectionId) {
            await refreshCollectionCount(session.activeCollectionId);
            await logCollectionHistory({
              collectionId: session.activeCollectionId,
              collectionName: session.activeCollectionName || 'Research',
              query: session.searchQuery,
              timestamp: new Date().toISOString(),
              leadsAdded: session.leadsCollectedCount,
              status: 'COMPLETED'
            });
          }

          await saveSessionState({
            state: 'IDLE',
            activeCollectionId: null,
            activeCollectionName: null
          });

          updateBadge(0, 'IDLE');
          await sendToMapsTab({ type: 'STOP_COLLECTION' });
          sendResponse({ success: true });
          break;
        }

        case 'LEADS_EXTRACTED': {
          const { leads, collectionId } = message.payload as { leads: Lead[]; collectionId: string };
          const session = await getSessionState();
          const settings = await getSettings();

          if (session.state === 'COLLECTING' && leads && leads.length > 0) {
            const targetCollectionId = collectionId || session.activeCollectionId || 'default';
            const { addedCount, duplicateCount } = await saveLeadsBatch(
              leads,
              targetCollectionId,
              settings.globalDeduplication
            );

            const newTotal = session.leadsCollectedCount + addedCount;
            const newDupes = session.duplicatesSkippedCount + duplicateCount;

            await saveSessionState({
              leadsCollectedCount: newTotal,
              duplicatesSkippedCount: newDupes
            });

            updateBadge(newTotal, 'COLLECTING');
            if (session.activeCollectionId) {
              await refreshCollectionCount(session.activeCollectionId);
            }

            // Real-time automatic live stream to Unified Platform database
            if (addedCount > 0) {
              pushLeadsToPlatform(leads, session.activeCollectionName || undefined).catch(err => {
                console.warn('[LeadMap] Live stream sync notice:', err);
              });
            }
          }
          sendResponse({ success: true });
          break;
        }

        case 'DETAIL_ENRICHMENT': {
          const enrichedData = message.payload as Partial<Lead>;
          if (enrichedData.businessName) {
            const allLeads = await getAllLeads();
            const existing = matchDuplicate(enrichedData as Lead, allLeads);
            if (existing) {
              const { enriched, lead } = enrichLead(existing, enrichedData);
              if (enriched) {
                await putLead(lead);
                // Also live stream enriched phone/details to platform
                pushLeadsToPlatform([lead]).catch(() => {});
              }
            }
          }
          sendResponse({ success: true });
          break;
        }

        case 'TOGGLE_AUTO_SCROLL': {
          const enabled = !!message.payload?.enabled;
          await saveSessionState({ autoScrollActive: enabled });
          await saveSettings({ autoScrollAssist: enabled });
          await sendToMapsTab({
            type: 'TOGGLE_AUTO_SCROLL',
            payload: { enabled }
          });
          sendResponse({ success: true, autoScrollActive: enabled });
          break;
        }

        default:
          sendResponse({ error: 'Unknown message type' });
          break;
      }
    } catch (err: any) {
      console.error('[LeadMap] Error processing message:', err);
      sendResponse({ error: err.message || 'Error processing request' });
    }
  })();

  return true; // Keep message channel open for async response
});
