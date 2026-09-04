import { MapsFeedObserver } from './observer';
import { getMapsStatus, isPlaceDetailPage } from './maps-detector';
import { extractLeadFromDetailPane } from './detail-enricher';
import { Lead } from '../types/lead';
import { RuntimeMessage } from '../types/messages';

console.log('[LeadMap] Content script initialized on Google Maps');

let activeCollectionId = 'default_collection';
let autoScrollEnabled = false;

// Initialize observer
const feedObserver = new MapsFeedObserver((newLeads: Lead[]) => {
  if (newLeads.length > 0) {
    chrome.runtime.sendMessage({
      type: 'LEADS_EXTRACTED',
      payload: {
        leads: newLeads,
        collectionId: activeCollectionId
      }
    } as RuntimeMessage);
  }
});

// Broadcast status to background
function reportStatus() {
  const status = getMapsStatus();
  chrome.runtime.sendMessage({
    type: 'MAPS_STATUS_REPORT',
    payload: status
  } as RuntimeMessage);
}

// Check detail pane on navigation or click
function checkDetailPane() {
  if (isPlaceDetailPage() && activeCollectionId) {
    const enriched = extractLeadFromDetailPane(activeCollectionId);
    if (enriched) {
      chrome.runtime.sendMessage({
        type: 'DETAIL_ENRICHMENT',
        payload: enriched
      } as RuntimeMessage);
    }
  }
}

// Initial report
reportStatus();

// Observe URL changes (Google Maps is an SPA using history pushState)
let lastUrl = window.location.href;
const urlWatcher = setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    reportStatus();
    checkDetailPane();
  }
}, 1000);

// Listen for messages from background service worker
chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  switch (message.type) {
    case 'GET_STATUS': {
      sendResponse(getMapsStatus());
      break;
    }

    case 'START_COLLECTION': {
      activeCollectionId = message.payload?.collectionId || 'default_collection';
      feedObserver.start(activeCollectionId);
      if (message.payload?.autoScroll) {
        autoScrollEnabled = true;
        feedObserver.startAutoScroll();
      }
      sendResponse({ success: true, status: getMapsStatus() });
      break;
    }

    case 'PAUSE_COLLECTION': {
      feedObserver.pause();
      sendResponse({ success: true });
      break;
    }

    case 'RESUME_COLLECTION': {
      feedObserver.resume();
      if (autoScrollEnabled) {
        feedObserver.startAutoScroll();
      }
      sendResponse({ success: true });
      break;
    }

    case 'STOP_COLLECTION': {
      feedObserver.stop();
      autoScrollEnabled = false;
      sendResponse({ success: true });
      break;
    }

    case 'TOGGLE_AUTO_SCROLL': {
      autoScrollEnabled = !!message.payload?.enabled;
      if (autoScrollEnabled) {
        feedObserver.startAutoScroll();
      } else {
        feedObserver.stopAutoScroll();
      }
      sendResponse({ success: true, autoScroll: autoScrollEnabled });
      break;
    }

    default:
      break;
  }
  return true;
});

// Also observe click events to detect place opening
document.addEventListener('click', () => {
  setTimeout(() => {
    checkDetailPane();
  }, 600);
}, { passive: true });
