import { Lead } from '../types/lead';

/**
 * Strips whitespace, control characters, and normalizes string.
 */
export function cleanText(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts a numeric rating (e.g. 4.6 from "4.6 stars" or "4,6")
 */
export function parseRating(input?: string | null): number | undefined {
  if (!input) return undefined;
  const match = input.replace(',', '.').match(/(\d+\.\d+|\d+)/);
  if (match) {
    const val = parseFloat(match[1]);
    if (!isNaN(val) && val >= 0 && val <= 5) {
      return Math.round(val * 10) / 10;
    }
  }
  return undefined;
}

/**
 * Extracts review count from strings like "(263)", "1,240 reviews", "3.2K reviews"
 */
export function parseReviewCount(input?: string | null): number | undefined {
  if (!input) return undefined;
  const cleaned = input.toLowerCase().replace(/,/g, '');
  
  // Look for K/M multipliers
  const kMatch = cleaned.match(/([\d.]+)\s*k/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }
  const mMatch = cleaned.match(/([\d.]+)\s*m/);
  if (mMatch) {
    return Math.round(parseFloat(mMatch[1]) * 1000000);
  }

  // Look for direct digits inside parenthesis or standalone
  const match = cleaned.match(/\(?(\d+)\)?/);
  if (match) {
    const val = parseInt(match[1], 10);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

/**
 * Normalizes phone numbers while strictly preserving the raw phone representation.
 * Cleans punctuation, handles country codes if identifiable.
 */
export function normalizePhone(rawPhone?: string | null): { raw?: string; normalized?: string } {
  if (!rawPhone) return {};
  const trimmed = cleanText(rawPhone);
  if (!trimmed) return {};

  // Extract digits and leading plus
  let cleaned = trimmed.replace(/[^\d+]/g, '');
  
  // Format international representation
  let normalized = cleaned;
  if (cleaned.startsWith('00')) {
    normalized = '+' + cleaned.substring(2);
  } else if (!cleaned.startsWith('+') && cleaned.length >= 10) {
    // If local number without plus, retain as digits
    normalized = cleaned;
  }

  return {
    raw: trimmed,
    normalized: normalized || trimmed
  };
}

/**
 * Removes tracking parameters (ved, authuser, entry, g_ep, etc.) from Maps URL.
 */
export function cleanMapsUrl(rawUrl?: string | null): string | undefined {
  if (!rawUrl) return undefined;
  try {
    const url = new URL(rawUrl, 'https://www.google.com');
    
    // Whitelist clean params if needed, or remove tracking
    const trackingParams = ['ved', 'authuser', 'entry', 'g_ep', 'ei', 'oq', 'gs_lcp', 'sclient'];
    trackingParams.forEach(p => url.searchParams.delete(p));
    
    return url.origin + url.pathname + (url.search ? url.search : '');
  } catch {
    return rawUrl.split('?')[0];
  }
}

/**
 * Extracts latitude and longitude from Google Maps URL:
 * Format example: .../@23.7937,90.4066,15z/... or ...!3d23.7937!4d90.4066
 */
export function extractCoordinates(url?: string | null): { lat?: number; lng?: number } {
  if (!url) return {};

  // Pattern 1: /@23.7937,90.4066,15z
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      lat: parseFloat(atMatch[1]),
      lng: parseFloat(atMatch[2])
    };
  }

  // Pattern 2: !3d23.7937!4d90.4066 (embedded in protobuf URL tokens)
  const protoLat = url.match(/!3d(-?\d+\.\d+)/);
  const protoLng = url.match(/!4d(-?\d+\.\d+)/);
  if (protoLat && protoLng) {
    return {
      lat: parseFloat(protoLat[1]),
      lng: parseFloat(protoLng[1])
    };
  }

  return {};
}

/**
 * Calculates a confidence/quality score (0 - 100%) based on completeness of fields.
 */
export function calculateConfidenceScore(lead: Partial<Lead>): number {
  let score = 0;
  if (lead.businessName) score += 25;
  if (lead.category) score += 15;
  if (lead.phone) score += 20;
  if (lead.address) score += 15;
  if (lead.website) score += 15;
  if (lead.rating) score += 10;
  return Math.min(100, score);
}
