// src/database/db.ts
var DB_NAME = "LeadMapDB";
var DB_VERSION = 1;
var STORES = {
  LEADS: "leads",
  COLLECTIONS: "collections",
  HISTORY: "history"
};
var dbPromise = null;
function getDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.LEADS)) {
        const leadStore = db.createObjectStore(STORES.LEADS, { keyPath: "id" });
        leadStore.createIndex("collectionId", "collectionId", { unique: false });
        leadStore.createIndex("collectedAt", "collectedAt", { unique: false });
        leadStore.createIndex("category", "category", { unique: false });
        leadStore.createIndex("rating", "rating", { unique: false });
        leadStore.createIndex("mapsUrl", "mapsUrl", { unique: false });
        leadStore.createIndex("businessName", "businessName", { unique: false });
        leadStore.createIndex("normalizedPhone", "normalizedPhone", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        const collectionStore = db.createObjectStore(STORES.COLLECTIONS, { keyPath: "id" });
        collectionStore.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.HISTORY)) {
        const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: "id" });
        historyStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
  return dbPromise;
}

// src/content/normalizer.ts
function cleanText(input) {
  if (!input) return "";
  return input.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}
function calculateConfidenceScore(lead) {
  let score = 0;
  if (lead.businessName) score += 25;
  if (lead.category) score += 15;
  if (lead.phone) score += 20;
  if (lead.address) score += 15;
  if (lead.website) score += 15;
  if (lead.rating) score += 10;
  return Math.min(100, score);
}

// src/database/deduplicator.ts
function matchDuplicate(incoming, existingLeads) {
  const normIncomingName = cleanText(incoming.businessName).toLowerCase();
  const normIncomingAddr = cleanText(incoming.address).toLowerCase();
  const normIncomingPhone = incoming.normalizedPhone;
  const incomingUrl = incoming.mapsUrl;
  for (const existing of existingLeads) {
    if (incomingUrl && existing.mapsUrl && incomingUrl === existing.mapsUrl) {
      return existing;
    }
    const normExistingName = cleanText(existing.businessName).toLowerCase();
    if (normIncomingName === normExistingName) {
      if (normIncomingAddr && existing.address) {
        const normExistingAddr = cleanText(existing.address).toLowerCase();
        if (normIncomingAddr === normExistingAddr || normIncomingAddr.includes(normExistingAddr) || normExistingAddr.includes(normIncomingAddr)) {
          return existing;
        }
      }
      if (normIncomingPhone && existing.normalizedPhone && normIncomingPhone === existing.normalizedPhone) {
        return existing;
      }
    }
  }
  return null;
}
function enrichLead(existing, incoming) {
  let enriched = false;
  const merged = { ...existing };
  const fillIfBetter = (key, newVal) => {
    if (newVal !== void 0 && newVal !== null && newVal !== "") {
      if (!merged[key]) {
        merged[key] = newVal;
        enriched = true;
      }
    }
  };
  fillIfBetter("phone", incoming.phone);
  fillIfBetter("normalizedPhone", incoming.normalizedPhone);
  fillIfBetter("website", incoming.website);
  fillIfBetter("address", incoming.address);
  fillIfBetter("category", incoming.category);
  fillIfBetter("businessStatus", incoming.businessStatus);
  fillIfBetter("latitude", incoming.latitude);
  fillIfBetter("longitude", incoming.longitude);
  if (incoming.openingHours && incoming.openingHours.length > 0 && (!merged.openingHours || merged.openingHours.length === 0)) {
    merged.openingHours = incoming.openingHours;
    enriched = true;
  }
  if (incoming.rating && (!merged.rating || merged.rating === 0)) {
    merged.rating = incoming.rating;
    enriched = true;
  }
  if (incoming.reviewCount && (!merged.reviewCount || merged.reviewCount === 0)) {
    merged.reviewCount = incoming.reviewCount;
    enriched = true;
  }
  if (enriched) {
    merged.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    merged.confidenceScore = calculateConfidenceScore(merged);
  }
  return { enriched, lead: merged };
}

// src/database/leads.ts
async function getAllLeads() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LEADS, "readonly");
    const store = tx.objectStore(STORES.LEADS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
async function getLeadsByCollection(collectionId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LEADS, "readonly");
    const store = tx.objectStore(STORES.LEADS);
    const index = store.index("collectionId");
    const request = index.getAll(IDBKeyRange.only(collectionId));
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
async function putLead(lead) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LEADS, "readwrite");
    const store = tx.objectStore(STORES.LEADS);
    const request = store.put(lead);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
async function saveLeadsBatch(incomingLeads, collectionId, globalDeduplication = true) {
  const db = await getDB();
  const candidatePool = globalDeduplication ? await getAllLeads() : await getLeadsByCollection(collectionId);
  let addedCount = 0;
  let enrichedCount = 0;
  let duplicateCount = 0;
  const addedLeads = [];
  const tx = db.transaction(STORES.LEADS, "readwrite");
  const store = tx.objectStore(STORES.LEADS);
  for (const incoming of incomingLeads) {
    const existing = matchDuplicate(incoming, candidatePool);
    if (existing) {
      const { enriched, lead: updated } = enrichLead(existing, incoming);
      if (enriched) {
        store.put(updated);
        enrichedCount++;
        const idx = candidatePool.findIndex((l) => l.id === existing.id);
        if (idx !== -1) candidatePool[idx] = updated;
      } else {
        duplicateCount++;
      }
    } else {
      store.put(incoming);
      candidatePool.push(incoming);
      addedLeads.push(incoming);
      addedCount++;
    }
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return { addedCount, enrichedCount, duplicateCount, addedLeads };
}

// src/database/collections.ts
async function getCollections() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTIONS, "readonly");
    const store = tx.objectStore(STORES.COLLECTIONS);
    const request = store.getAll();
    request.onsuccess = () => {
      const list = request.result || [];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(list);
    };
    request.onerror = () => reject(request.error);
  });
}
async function getOrCreateCollection(name, searchQuery) {
  const collections = await getCollections();
  const existing = collections.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  const db = await getDB();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newCol = {
    id: "col_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
    name: name.trim() || "General Research",
    searchQuery,
    leadCount: 0,
    createdAt: now,
    updatedAt: now
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTIONS, "readwrite");
    const store = tx.objectStore(STORES.COLLECTIONS);
    const request = store.put(newCol);
    request.onsuccess = () => resolve(newCol);
    request.onerror = () => reject(request.error);
  });
}
async function refreshCollectionCount(collectionId) {
  const leads = await getLeadsByCollection(collectionId);
  const count = leads.length;
  const db = await getDB();
  const tx = db.transaction(STORES.COLLECTIONS, "readwrite");
  const store = tx.objectStore(STORES.COLLECTIONS);
  const getReq = store.get(collectionId);
  getReq.onsuccess = () => {
    const col = getReq.result;
    if (col) {
      col.leadCount = count;
      col.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      store.put(col);
    }
  };
  return count;
}
async function logCollectionHistory(entry) {
  const db = await getDB();
  const historyItem = {
    ...entry,
    id: "hist_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6)
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HISTORY, "readwrite");
    const store = tx.objectStore(STORES.HISTORY);
    const request = store.put(historyItem);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// src/database/storage.ts
var DEFAULT_SETTINGS = {
  collectionMode: "search_results",
  globalDeduplication: true,
  autoScrollAssist: true,
  autoScrollSpeed: 1200
};
var DEFAULT_SESSION = {
  state: "IDLE",
  activeCollectionId: null,
  activeCollectionName: null,
  searchQuery: "",
  leadsCollectedCount: 0,
  duplicatesSkippedCount: 0,
  autoScrollActive: false
};
async function saveSettings(settings) {
  const current = await getSettings();
  const merged = { ...current, ...settings };
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ leadmap_settings: merged });
  } else {
    localStorage.setItem("leadmap_settings", JSON.stringify(merged));
  }
  return merged;
}
async function getSettings() {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const res = await chrome.storage.local.get("leadmap_settings");
    return { ...DEFAULT_SETTINGS, ...res.leadmap_settings || {} };
  } else {
    try {
      const stored = localStorage.getItem("leadmap_settings");
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
}
async function saveSessionState(state) {
  const current = await getSessionState();
  const merged = { ...current, ...state };
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ leadmap_session: merged });
  } else {
    localStorage.setItem("leadmap_session", JSON.stringify(merged));
  }
  return merged;
}
async function getSessionState() {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    const res = await chrome.storage.local.get("leadmap_session");
    return { ...DEFAULT_SESSION, ...res.leadmap_session || {} };
  } else {
    try {
      const stored = localStorage.getItem("leadmap_session");
      return stored ? { ...DEFAULT_SESSION, ...JSON.parse(stored) } : DEFAULT_SESSION;
    } catch {
      return DEFAULT_SESSION;
    }
  }
}

// src/background/service-worker.ts
console.log("[LeadMap] Service Worker initialized");
var currentMapsStatus = {
  isConnected: false,
  searchQuery: "",
  isDetailPage: false,
  activeListingCount: 0
};
if (typeof chrome !== "undefined" && chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
    console.warn("[LeadMap] Side panel behavior setup:", err);
  });
}
function updateBadge(count, state) {
  if (typeof chrome === "undefined" || !chrome.action) return;
  if (state === "COLLECTING") {
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "\u25CF" });
    chrome.action.setBadgeBackgroundColor({ color: "#2f7dfc" });
  } else if (state === "PAUSED") {
    chrome.action.setBadgeText({ text: "\u23F8" });
    chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}
async function sendToMapsTab(message) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs.length > 0 && tabs[0].id) {
    try {
      return await chrome.tabs.sendMessage(tabs[0].id, message);
    } catch {
      return null;
    }
  }
  return null;
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case "GET_STATUS": {
          const session = await getSessionState();
          const settings = await getSettings();
          const isAutoScroll = typeof session.autoScrollActive === "boolean" ? session.autoScrollActive : settings.autoScrollAssist ?? false;
          const response = {
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
        case "MAPS_STATUS_REPORT": {
          if (message.payload) {
            currentMapsStatus = message.payload;
          }
          sendResponse({ received: true });
          break;
        }
        case "START_COLLECTION": {
          const session = await getSessionState();
          const settings = await getSettings();
          const query = message.payload?.searchQuery || currentMapsStatus.searchQuery || "General Research";
          const collectionName = message.payload?.name || query;
          const collection = await getOrCreateCollection(collectionName, query);
          const shouldAutoScroll = typeof session.autoScrollActive === "boolean" ? session.autoScrollActive : settings.autoScrollAssist ?? true;
          await saveSessionState({
            state: "COLLECTING",
            activeCollectionId: collection.id,
            activeCollectionName: collection.name,
            searchQuery: query,
            leadsCollectedCount: 0,
            duplicatesSkippedCount: 0,
            autoScrollActive: shouldAutoScroll
          });
          updateBadge(0, "COLLECTING");
          await sendToMapsTab({
            type: "START_COLLECTION",
            payload: {
              collectionId: collection.id,
              autoScroll: shouldAutoScroll
            }
          });
          sendResponse({ success: true, collection });
          break;
        }
        case "PAUSE_COLLECTION": {
          await saveSessionState({ state: "PAUSED" });
          const session = await getSessionState();
          updateBadge(session.leadsCollectedCount, "PAUSED");
          await sendToMapsTab({ type: "PAUSE_COLLECTION" });
          sendResponse({ success: true });
          break;
        }
        case "RESUME_COLLECTION": {
          await saveSessionState({ state: "COLLECTING" });
          const session = await getSessionState();
          updateBadge(session.leadsCollectedCount, "COLLECTING");
          await sendToMapsTab({ type: "RESUME_COLLECTION" });
          sendResponse({ success: true });
          break;
        }
        case "STOP_COLLECTION": {
          const session = await getSessionState();
          if (session.activeCollectionId) {
            await refreshCollectionCount(session.activeCollectionId);
            await logCollectionHistory({
              collectionId: session.activeCollectionId,
              collectionName: session.activeCollectionName || "Research",
              query: session.searchQuery,
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              leadsAdded: session.leadsCollectedCount,
              status: "COMPLETED"
            });

            // Auto-sync leads to Unified Platform API
            try {
              const leadsToSync = await getLeadsByCollection(session.activeCollectionId);
              if (leadsToSync && leadsToSync.length > 0) {
                const storedConfig = await chrome.storage.local.get(["platformUrl", "platformApiKey"]);
                const base = (storedConfig.platformUrl || "http://localhost:3000").replace(/\/+$/, "");
                const apiKey = storedConfig.platformApiKey || "ewc_live_9a7fe91bc2d8";
                console.log("[LeadMap] Auto-syncing", leadsToSync.length, "leads to", base);
                fetch(`${base}/api/v1/leads/ingest`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    leads: leadsToSync,
                    list_name: session.activeCollectionName || `Google Maps: ${session.searchQuery || 'Leads'}`
                  })
                }).then(r => r.json()).then(res => {
                  console.log("[LeadMap] Auto-Sync complete:", res);
                }).catch(e => console.warn("[LeadMap] Auto-sync notice:", e));
              }
            } catch (syncErr) {
              console.warn("[LeadMap] Auto-sync skipped:", syncErr);
            }
          }
          await saveSessionState({
            state: "IDLE",
            activeCollectionId: null,
            activeCollectionName: null
          });
          updateBadge(0, "IDLE");
          await sendToMapsTab({ type: "STOP_COLLECTION" });
          sendResponse({ success: true });
          break;
        }
        case "SYNC_TO_PLATFORM": {
          try {
            const allLeads = await getAllLeads();
            const storedConfig = await chrome.storage.local.get(["platformUrl", "platformApiKey"]);
            const base = (storedConfig.platformUrl || "http://localhost:3000").replace(/\/+$/, "");
            const apiKey = storedConfig.platformApiKey || "ewc_live_9a7fe91bc2d8";
            const res = await fetch(`${base}/api/v1/leads/ingest`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
              },
              body: JSON.stringify(allLeads)
            });
            const data = await res.json();
            sendResponse(data);
          } catch (err) {
            sendResponse({ success: false, error: err.message });
          }
          break;
        }
        case "LEADS_EXTRACTED": {
          const { leads, collectionId } = message.payload;
          const session = await getSessionState();
          const settings = await getSettings();
          if (session.state === "COLLECTING" && leads && leads.length > 0) {
            const targetCollectionId = collectionId || session.activeCollectionId || "default";
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
            updateBadge(newTotal, "COLLECTING");
            if (session.activeCollectionId) {
              await refreshCollectionCount(session.activeCollectionId);
            }

            // Real-time automatic live stream to Unified Platform database
            if (addedCount > 0) {
              try {
                const storedConfig = await chrome.storage.local.get(["platformUrl", "platformApiKey"]);
                const base = (storedConfig.platformUrl || "http://localhost:3000").replace(/\/+$/, "");
                const apiKey = storedConfig.platformApiKey || "ewc_live_9a7fe91bc2d8";
                fetch(`${base}/api/v1/leads/ingest`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    leads: leads,
                    list_name: session.activeCollectionName || `Google Maps: ${session.searchQuery || 'Leads'}`
                  })
                }).then(r => r.json()).then(res => {
                  console.log("[LeadMap] Live Auto-Streamed", leads.length, "leads to platform:", res);
                }).catch(e => console.warn("[LeadMap] Live stream notice:", e));
              } catch (streamErr) {
                console.warn("[LeadMap] Live stream skip:", streamErr);
              }
            }
          }
          sendResponse({ success: true });
          break;
        }
        case "DETAIL_ENRICHMENT": {
          const enrichedData = message.payload;
          if (enrichedData.businessName) {
            const allLeads = await getAllLeads();
            const existing = matchDuplicate(enrichedData, allLeads);
            if (existing) {
              const { enriched, lead } = enrichLead(existing, enrichedData);
              if (enriched) {
                await putLead(lead);
                // Also live stream enriched phone/details to platform
                try {
                  const storedConfig = await chrome.storage.local.get(["platformUrl", "platformApiKey"]);
                  const base = (storedConfig.platformUrl || "http://localhost:3000").replace(/\/+$/, "");
                  const apiKey = storedConfig.platformApiKey || "ewc_live_9a7fe91bc2d8";
                  fetch(`${base}/api/v1/leads/ingest`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify([lead])
                  }).catch(() => {});
                } catch (e) {}
              }
            }
          }
          sendResponse({ success: true });
          break;
        }
        case "TOGGLE_AUTO_SCROLL": {
          const enabled = !!message.payload?.enabled;
          await saveSessionState({ autoScrollActive: enabled });
          await saveSettings({ autoScrollAssist: enabled });
          await sendToMapsTab({
            type: "TOGGLE_AUTO_SCROLL",
            payload: { enabled }
          });
          sendResponse({ success: true, autoScrollActive: enabled });
          break;
        }
        default:
          sendResponse({ error: "Unknown message type" });
          break;
      }
    } catch (err) {
      console.error("[LeadMap] Error processing message:", err);
      sendResponse({ error: err.message || "Error processing request" });
    }
  })();
  return true;
});

// Listen for external messages from Unified Platform dashboard
if (typeof chrome !== "undefined" && chrome.runtime?.onMessageExternal) {
  chrome.runtime.onMessageExternal.addListener((request, _sender, sendResponse) => {
    if (request.type === "PING") {
      sendResponse({ installed: true, version: "1.0.0", name: "LeadMap" });
    } else if (request.type === "CONFIGURE_PLATFORM") {
      chrome.storage.local.set({
        platformUrl: request.platformUrl,
        platformApiKey: request.apiKey || "ewc_live_9a7fe91bc2d8"
      }, () => {
        sendResponse({ configured: true, platformUrl: request.platformUrl });
      });
      return true;
    } else if (request.type === "OPEN_MAPS") {
      const q = request.query ? encodeURIComponent(request.query) : "";
      const url = q ? `https://www.google.com/maps/search/${q}` : "https://www.google.com/maps";
      chrome.tabs.create({ url });
      sendResponse({ opened: true, url });
    }
  });
}

