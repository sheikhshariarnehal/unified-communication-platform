import { getDB, STORES } from './db';
import { Collection, CollectionHistory } from '../types/lead';
import { getLeadsByCollection, deleteLeads } from './leads';

/**
 * Retrieves all collections sorted by creation date descending.
 */
export async function getCollections(): Promise<Collection[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTIONS, 'readonly');
    const store = tx.objectStore(STORES.COLLECTIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      const list = (request.result || []) as Collection[];
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(list);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Creates or retrieves an existing collection for a given search query or name.
 */
export async function getOrCreateCollection(name: string, searchQuery?: string): Promise<Collection> {
  const collections = await getCollections();
  const existing = collections.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;

  const db = await getDB();
  const now = new Date().toISOString();
  const newCol: Collection = {
    id: 'col_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    name: name.trim() || 'General Research',
    searchQuery,
    leadCount: 0,
    createdAt: now,
    updatedAt: now
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTIONS, 'readwrite');
    const store = tx.objectStore(STORES.COLLECTIONS);
    const request = store.put(newCol);

    request.onsuccess = () => resolve(newCol);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Recalculates and updates the total lead count for a collection.
 */
export async function refreshCollectionCount(collectionId: string): Promise<number> {
  const leads = await getLeadsByCollection(collectionId);
  const count = leads.length;

  const db = await getDB();
  const tx = db.transaction(STORES.COLLECTIONS, 'readwrite');
  const store = tx.objectStore(STORES.COLLECTIONS);

  const getReq = store.get(collectionId);
  getReq.onsuccess = () => {
    const col = getReq.result as Collection | undefined;
    if (col) {
      col.leadCount = count;
      col.updatedAt = new Date().toISOString();
      store.put(col);
    }
  };

  return count;
}

/**
 * Deletes a collection and all associated leads.
 */
export async function deleteCollection(collectionId: string): Promise<void> {
  const leads = await getLeadsByCollection(collectionId);
  await deleteLeads(leads.map(l => l.id));

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.COLLECTIONS, 'readwrite');
    const store = tx.objectStore(STORES.COLLECTIONS);
    const request = store.delete(collectionId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Logs a collection run to history.
 */
export async function logCollectionHistory(entry: Omit<CollectionHistory, 'id'>): Promise<void> {
  const db = await getDB();
  const historyItem: CollectionHistory = {
    ...entry,
    id: 'hist_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HISTORY, 'readwrite');
    const store = tx.objectStore(STORES.HISTORY);
    const request = store.put(historyItem);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all collection history entries.
 */
export async function getCollectionHistory(): Promise<CollectionHistory[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HISTORY, 'readonly');
    const store = tx.objectStore(STORES.HISTORY);
    const request = store.getAll();

    request.onsuccess = () => {
      const list = (request.result || []) as CollectionHistory[];
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(list);
    };
    request.onerror = () => reject(request.error);
  });
}
