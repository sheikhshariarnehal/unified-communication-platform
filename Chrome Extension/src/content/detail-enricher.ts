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
 * Extracts comprehensive details from the open Place Detail Pane in Google Maps.
 */
export function extractLeadFromDetailPane(
  collectionId: string,
  searchQuery?: string
): Partial<Lead> | null {
  try {
    const mainPane = document.querySelector('div[role="main"]') || document.body;

    // 1. Business Name
    const nameHeading = mainPane.querySelector('h1.DUwDvf, h1.fontHeadlineLarge, div[role="main"] h1');
    if (!nameHeading || !nameHeading.textContent) {
      return null;
    }
    const businessName = cleanText(nameHeading.textContent);
    if (!businessName || businessName.toLowerCase().includes('google maps')) {
      return null;
    }

    // 2. Rating & Reviews
    let rating: number | undefined;
    let reviewCount: number | undefined;
    const ratingEl = mainPane.querySelector('div.F7nice span[aria-hidden="true"], span.ceNzKf');
    if (ratingEl && ratingEl.textContent) {
      rating = parseRating(ratingEl.textContent);
    }
    const reviewEl = mainPane.querySelector('div.F7nice span[aria-label*="reviews"], div.F7nice span[aria-label*="review"]');
    if (reviewEl) {
      reviewCount = parseReviewCount(reviewEl.getAttribute('aria-label') || reviewEl.textContent);
    }

    // 3. Category
    let category: string | undefined;
    const categoryBtn = mainPane.querySelector('button.DkEaL, button[jsaction*="category"]');
    if (categoryBtn && categoryBtn.textContent) {
      category = cleanText(categoryBtn.textContent);
    }

    // 4. Address
    let address: string | undefined;
    const addressBtn = mainPane.querySelector('button[data-item-id="address"], [aria-label*="Address:"]');
    if (addressBtn) {
      const aria = addressBtn.getAttribute('aria-label');
      address = aria ? cleanText(aria.replace(/^Address:\s*/i, '')) : cleanText(addressBtn.textContent);
    }

    // 5. Phone
    let rawPhone: string | undefined;
    const phoneBtn = mainPane.querySelector('button[data-item-id*="phone"], [aria-label*="Phone:"]');
    if (phoneBtn) {
      const aria = phoneBtn.getAttribute('aria-label');
      rawPhone = aria ? aria.replace(/^Phone:\s*/i, '') : phoneBtn.textContent || undefined;
    }
    const { raw: phone, normalized: normalizedPhone } = normalizePhone(rawPhone);

    // 6. Website
    let website: string | undefined;
    const websiteAnchor = mainPane.querySelector<HTMLAnchorElement>('a[data-item-id="authority"], [aria-label*="Website:"]');
    if (websiteAnchor && websiteAnchor.href && !websiteAnchor.href.includes('google.com/maps')) {
      website = websiteAnchor.href;
    }

    // 7. Opening Hours
    const openingHours: string[] = [];
    const hoursTable = mainPane.querySelectorAll('table.eKjhWe tr, div[aria-label*="Hours"] tr');
    if (hoursTable.length > 0) {
      hoursTable.forEach(row => {
        const text = cleanText(row.textContent);
        if (text) openingHours.push(text);
      });
    }

    // 8. Business Status
    let businessStatus: string | undefined;
    const statusEl = mainPane.querySelector('span.ZDu9vd, span[style*="color: rgb(217, 48, 37)"], span[style*="color: rgb(24, 128, 56)"]');
    if (statusEl && statusEl.textContent) {
      const text = cleanText(statusEl.textContent);
      if (text.includes('Closed')) businessStatus = 'Closed';
      else if (text.includes('Open')) businessStatus = 'Open';
    }

    // 9. URL & Coordinates
    const currentUrl = window.location.href;
    const mapsUrl = cleanMapsUrl(currentUrl);
    const coords = extractCoordinates(currentUrl);

    const enriched: Partial<Lead> = {
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
      openingHours: openingHours.length > 0 ? openingHours : undefined,
      latitude: coords.lat,
      longitude: coords.lng,
      searchQuery: searchQuery || undefined,
      collectionId,
      updatedAt: new Date().toISOString()
    };

    enriched.confidenceScore = calculateConfidenceScore(enriched);

    return enriched;
  } catch (err) {
    console.warn('[LeadMap] Error extracting from detail pane:', err);
    return null;
  }
}
