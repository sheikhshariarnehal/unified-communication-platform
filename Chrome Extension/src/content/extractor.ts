import { Lead } from '../types/lead';
import {
  cleanText,
  parseRating,
  parseReviewCount,
  normalizePhone,
  cleanMapsUrl,
  extractCoordinates,
  calculateConfidenceScore
} from './normalizer';

/**
 * Extracts lead information from a single listing element in the Google Maps search results feed.
 */
export function extractLeadFromListingElement(
  element: Element,
  collectionId: string,
  searchQuery: string
): Lead | null {
  try {
    // 1. Locate primary place anchor
    let placeAnchor = element.querySelector<HTMLAnchorElement>('a[href*="/maps/place/"]');
    if (!placeAnchor && element.tagName.toLowerCase() === 'a' && (element as HTMLAnchorElement).href.includes('/maps/place/')) {
      placeAnchor = element as HTMLAnchorElement;
    }

    // Business Name Extraction (Multi-Signal)
    let businessName = '';
    
    // Strategy A: aria-label on place anchor (most stable across UI updates)
    if (placeAnchor && placeAnchor.getAttribute('aria-label')) {
      businessName = cleanText(placeAnchor.getAttribute('aria-label'));
    }

    // Strategy B: Heading elements (.qBF1Pd or div[role="heading"])
    if (!businessName) {
      const heading = element.querySelector('.qBF1Pd, div[role="heading"], h3, .fontHeadlineSmall');
      if (heading && heading.textContent) {
        businessName = cleanText(heading.textContent);
      }
    }

    // Strategy C: First bold or large text line
    if (!businessName) {
      const titleEl = element.querySelector('span.fontHeadlineSmall, span.OSrXXb');
      if (titleEl && titleEl.textContent) {
        businessName = cleanText(titleEl.textContent);
      }
    }

    // If still no business name or if it looks like an ad container / system label, discard
    if (!businessName || businessName.length < 2 || businessName.toLowerCase() === 'results') {
      return null;
    }

    // 2. Maps URL & Coordinates
    let rawMapsUrl = placeAnchor ? placeAnchor.href : '';
    const mapsUrl = cleanMapsUrl(rawMapsUrl);
    const coords = extractCoordinates(rawMapsUrl);

    // 3. Rating & Review Count (Multi-Signal)
    let rating: number | undefined;
    let reviewCount: number | undefined;

    // Strategy A: Accessible star rating label (e.g. "4.6 stars 263 Reviews")
    const ratingImg = element.querySelector('[aria-label*="star"], [aria-label*="Star"], span.MW4etd');
    if (ratingImg) {
      const aria = ratingImg.getAttribute('aria-label') || '';
      rating = parseRating(aria) || parseRating(ratingImg.textContent);
      reviewCount = parseReviewCount(aria);
    }

    // Strategy B: Visible rating span & review span
    if (!rating) {
      const ratingSpan = element.querySelector('span.MW4etd, span.fontBodyMedium > span:first-child');
      if (ratingSpan && ratingSpan.textContent) {
        rating = parseRating(ratingSpan.textContent);
      }
    }

    if (!reviewCount) {
      const reviewSpan = element.querySelector('span.UY7F9, span[aria-label*="review"], span[aria-label*="Review"]');
      if (reviewSpan) {
        const text = reviewSpan.getAttribute('aria-label') || reviewSpan.textContent;
        reviewCount = parseReviewCount(text);
      }
    }

    // 4. Category & Address & Status
    let category: string | undefined;
    let address: string | undefined;
    let businessStatus: string | undefined;

    // Text rows inside listing card (typically .W4Efsd classes)
    const textRows = Array.from(element.querySelectorAll('.W4Efsd, .fontBodyMedium'));
    for (const row of textRows) {
      const text = cleanText(row.textContent);
      if (!text) continue;

      // Detect Status
      if (text.includes('Closed') || text.includes('Open')) {
        if (text.toLowerCase().includes('permanently closed')) {
          businessStatus = 'Permanently Closed';
        } else if (text.toLowerCase().includes('temporarily closed')) {
          businessStatus = 'Temporarily Closed';
        } else if (text.toLowerCase().includes('open 24 hours')) {
          businessStatus = 'Open 24 Hours';
        } else if (text.includes('Open')) {
          businessStatus = 'Open';
        } else if (text.includes('Closed')) {
          businessStatus = 'Closed';
        }
      }

      // Check for category / address dividers (e.g. "Category · Address" or "Category · Location")
      if (text.includes('·')) {
        const parts = text.split('·').map(p => cleanText(p)).filter(Boolean);
        for (const part of parts) {
          // If part has numbers, likely address or phone
          if (/\d/.test(part)) {
            if (!address && part.length > 5) {
              address = part;
            }
          } else if (!category && part.length > 2 && !part.includes('Open') && !part.includes('Closed')) {
            // Likely category
            category = part;
          }
        }
      }
    }

    // Fallback category detection: first non-numeric span next to rating
    if (!category) {
      const catCandidate = element.querySelector('.W4Efsd button, span.W4Efsd > span');
      if (catCandidate && catCandidate.textContent) {
        const txt = cleanText(catCandidate.textContent);
        if (txt && !/\d/.test(txt) && txt.length < 40) {
          category = txt;
        }
      }
    }

    // 5. Phone Number
    let rawPhone: string | undefined;
    
    // Strategy A: Dedicated phone action button/link
    const phoneEl = element.querySelector('[data-item-id*="phone"], [data-tooltip*="phone"], a[href^="tel:"]');
    if (phoneEl) {
      if (phoneEl.tagName.toLowerCase() === 'a') {
        rawPhone = (phoneEl as HTMLAnchorElement).href.replace('tel:', '');
      } else {
        rawPhone = phoneEl.getAttribute('aria-label') || phoneEl.textContent || undefined;
      }
    }

    // Strategy B: Regex search within card text
    if (!rawPhone) {
      const fullCardText = element.textContent || '';
      // Look for phone patterns e.g. +880 1342-716821, 01342 716821, (555) 123-4567
      const phoneMatch = fullCardText.match(/(?:\+?\d{1,4}[ -]?)?(?:\(?\d{2,4}\)?[ -]?)?\d{3,4}[ -]?\d{3,4}/);
      if (phoneMatch && phoneMatch[0].length >= 8 && !phoneMatch[0].includes('202') && !phoneMatch[0].includes('199')) {
        rawPhone = phoneMatch[0];
      }
    }

    const { raw: phone, normalized: normalizedPhone } = normalizePhone(rawPhone);

    // 6. Website
    let website: string | undefined;
    const websiteEl = element.querySelector<HTMLAnchorElement>(
      'a[data-value="Website"], a[aria-label*="Website"], a[aria-label*="website"], a[data-item-id="authority"]'
    );
    if (websiteEl && websiteEl.href && !websiteEl.href.includes('google.com/maps')) {
      website = websiteEl.href;
    }

    // 7. Stable ID generation
    // Prefer maps URL if present, or combine businessName + (address or phone or query)
    const idSource = mapsUrl || `${businessName.toLowerCase()}_${address || phone || searchQuery}`;
    const id = generateStableId(idSource);

    const now = new Date().toISOString();

    const lead: Lead = {
      id,
      businessName,
      category,
      rating,
      reviewCount,
      phone,
      normalizedPhone,
      website,
      address,
      mapsUrl,
      businessStatus,
      latitude: coords.lat,
      longitude: coords.lng,
      searchQuery: searchQuery || undefined,
      collectionId,
      source: 'google_maps',
      collectedAt: now,
      updatedAt: now
    };

    lead.confidenceScore = calculateConfidenceScore(lead);

    return lead;
  } catch (err) {
    console.warn('[LeadMap] Extraction error on element:', err);
    return null;
  }
}

/**
 * Fast stable hash string from string source (FNV-1a like).
 */
function generateStableId(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 'lead_' + (hash >>> 0).toString(36) + '_' + Math.abs(str.length).toString(36);
}
