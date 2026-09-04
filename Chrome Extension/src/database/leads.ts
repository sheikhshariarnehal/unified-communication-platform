import { getDB, STORES } from './db';
import { Lead, FilterOptions, SortOption } from '../types/lead';
import { matchDuplicate, enrichLead } from './deduplicator';

/**
 * Retrieves all leads from IndexedDB.
 */
export async function getAllLeads(): Promise<Lead[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LEADS, 'readonly');
    const store = tx.objectStore(STORES.LEADS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves leads belonging to a specific collection.
 */
export async function getLeadsByCollection(collectionId: string): Promise<Lead[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LEADS, 'readonly');
    const store = tx.objectStore(STORES.LEADS);
    const index = store.index('collectionId');
    const request = index.getAll(IDBKeyRange.only(collectionId));

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a single lead.
 */
export async function putLead(lead: Lead): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LEADS, 'readwrite');
    const store = tx.objectStore(STORES.LEADS);
    const request = store.put(lead);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a batch of extracted leads with deduplication and enrichment.
 */
export async function saveLeadsBatch(
  incomingLeads: Lead[],
  collectionId: string,
  globalDeduplication: boolean = true
): Promise<{ addedCount: number; enrichedCount: number; duplicateCount: number; addedLeads: Lead[] }> {
  const db = await getDB();
  
  // Fetch candidate existing leads to deduplicate against
  const candidatePool = globalDeduplication 
    ? await getAllLeads() 
    : await getLeadsByCollection(collectionId);

  let addedCount = 0;
  let enrichedCount = 0;
  let duplicateCount = 0;
  const addedLeads: Lead[] = [];

  const tx = db.transaction(STORES.LEADS, 'readwrite');
  const store = tx.objectStore(STORES.LEADS);

  for (const incoming of incomingLeads) {
    const existing = matchDuplicate(incoming, candidatePool);

    if (existing) {
      const { enriched, lead: updated } = enrichLead(existing, incoming);
      if (enriched) {
        store.put(updated);
        enrichedCount++;
        // Update candidate pool record
        const idx = candidatePool.findIndex(l => l.id === existing.id);
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

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return { addedCount, enrichedCount, duplicateCount, addedLeads };
}

/**
 * Deletes a single lead by ID.
 */
export async function deleteLead(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LEADS, 'readwrite');
    const store = tx.objectStore(STORES.LEADS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes multiple leads by their IDs.
 */
export async function deleteLeads(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDB();
  const tx = db.transaction(STORES.LEADS, 'readwrite');
  const store = tx.objectStore(STORES.LEADS);

  for (const id of ids) {
    store.delete(id);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Filters and sorts a lead collection in-memory.
 */
export function filterAndSortLeads(
  leads: Lead[],
  filters: FilterOptions,
  sort: SortOption
): Lead[] {
  let result = leads;

  // 1. Collection filter
  if (filters.collectionId && filters.collectionId !== 'all') {
    result = result.filter(l => l.collectionId === filters.collectionId);
  }

  // 2. Search query (fuzzy search across name, category, phone, address, website)
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(l =>
      l.businessName.toLowerCase().includes(q) ||
      (l.category && l.category.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.address && l.address.toLowerCase().includes(q)) ||
      (l.website && l.website.toLowerCase().includes(q))
    );
  }

  // 3. Category filter
  if (filters.category && filters.category !== 'all') {
    result = result.filter(l => l.category && l.category.toLowerCase() === filters.category.toLowerCase());
  }

  // 4. Rating filter
  if (filters.minRating > 0) {
    result = result.filter(l => (l.rating || 0) >= filters.minRating);
  }

  // 5. Phone filter
  if (filters.phoneStatus === 'has_phone') {
    result = result.filter(l => !!l.phone);
  } else if (filters.phoneStatus === 'no_phone') {
    result = result.filter(l => !l.phone);
  }

  // 6. Website filter
  if (filters.websiteStatus === 'has_website') {
    result = result.filter(l => !!l.website);
  } else if (filters.websiteStatus === 'no_website') {
    result = result.filter(l => !l.website);
  }

  // 7. Sort
  result.sort((a, b) => {
    let diff = 0;
    switch (sort.field) {
      case 'name':
        diff = a.businessName.localeCompare(b.businessName);
        break;
      case 'rating':
        diff = (a.rating || 0) - (b.rating || 0);
        break;
      case 'reviews':
        diff = (a.reviewCount || 0) - (b.reviewCount || 0);
        break;
      case 'collectedAt':
        diff = new Date(a.collectedAt).getTime() - new Date(b.collectedAt).getTime();
        break;
    }
    return sort.order === 'asc' ? diff : -diff;
  });

  return result;
}
