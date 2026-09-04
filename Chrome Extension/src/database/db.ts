export const DB_NAME = 'LeadMapDB';
export const DB_VERSION = 1;

export const STORES = {
  LEADS: 'leads',
  COLLECTIONS: 'collections',
  HISTORY: 'history'
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // 1. Leads Store
      if (!db.objectStoreNames.contains(STORES.LEADS)) {
        const leadStore = db.createObjectStore(STORES.LEADS, { keyPath: 'id' });
        leadStore.createIndex('collectionId', 'collectionId', { unique: false });
        leadStore.createIndex('collectedAt', 'collectedAt', { unique: false });
        leadStore.createIndex('category', 'category', { unique: false });
        leadStore.createIndex('rating', 'rating', { unique: false });
        leadStore.createIndex('mapsUrl', 'mapsUrl', { unique: false });
        leadStore.createIndex('businessName', 'businessName', { unique: false });
        leadStore.createIndex('normalizedPhone', 'normalizedPhone', { unique: false });
      }

      // 2. Collections Store
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        const collectionStore = db.createObjectStore(STORES.COLLECTIONS, { keyPath: 'id' });
        collectionStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 3. Collection History Store
      if (!db.objectStoreNames.contains(STORES.HISTORY)) {
        const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
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
