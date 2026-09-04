import { Lead } from '../types/lead';
import { cleanText, calculateConfidenceScore } from '../content/normalizer';

export interface DeduplicationResult {
  isDuplicate: boolean;
  enriched: boolean;
  lead: Lead;
}

/**
 * Checks if incoming lead matches any existing lead according to PRD hierarchy:
 * 1. Stable Maps listing URL
 * 2. Normalized business name + address
 * 3. Business name + normalized phone
 */
export function matchDuplicate(incoming: Lead, existingLeads: Lead[]): Lead | null {
  const normIncomingName = cleanText(incoming.businessName).toLowerCase();
  const normIncomingAddr = cleanText(incoming.address).toLowerCase();
  const normIncomingPhone = incoming.normalizedPhone;
  const incomingUrl = incoming.mapsUrl;

  for (const existing of existingLeads) {
    // 1. URL match
    if (incomingUrl && existing.mapsUrl && incomingUrl === existing.mapsUrl) {
      return existing;
    }

    const normExistingName = cleanText(existing.businessName).toLowerCase();

    // Must have matching or very close business name for heuristics 2 & 3
    if (normIncomingName === normExistingName) {
      // 2. Name + Address match
      if (normIncomingAddr && existing.address) {
        const normExistingAddr = cleanText(existing.address).toLowerCase();
        if (normIncomingAddr === normExistingAddr || 
            normIncomingAddr.includes(normExistingAddr) || 
            normExistingAddr.includes(normIncomingAddr)) {
          return existing;
        }
      }

      // 3. Name + Phone match
      if (normIncomingPhone && existing.normalizedPhone && normIncomingPhone === existing.normalizedPhone) {
        return existing;
      }
    }
  }

  return null;
}

/**
 * Enriches existing lead with incoming fields without overwriting high-value data.
 */
export function enrichLead(existing: Lead, incoming: Lead | Partial<Lead>): { enriched: boolean; lead: Lead } {
  let enriched = false;
  const merged: Lead = { ...existing };

  // Helper to fill missing or improve fields
  const fillIfBetter = <K extends keyof Lead>(key: K, newVal?: Lead[K]) => {
    if (newVal !== undefined && newVal !== null && newVal !== '') {
      if (!merged[key]) {
        merged[key] = newVal;
        enriched = true;
      }
    }
  };

  fillIfBetter('phone', incoming.phone);
  fillIfBetter('normalizedPhone', incoming.normalizedPhone);
  fillIfBetter('website', incoming.website);
  fillIfBetter('address', incoming.address);
  fillIfBetter('category', incoming.category);
  fillIfBetter('businessStatus', incoming.businessStatus);
  fillIfBetter('latitude', incoming.latitude);
  fillIfBetter('longitude', incoming.longitude);

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
    merged.updatedAt = new Date().toISOString();
    merged.confidenceScore = calculateConfidenceScore(merged);
  }

  return { enriched, lead: merged };
}
