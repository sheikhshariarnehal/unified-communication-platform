import { MapsStatus } from '../types/messages';
import { cleanText } from './normalizer';

/**
 * Checks if current webpage is Google Maps.
 */
export function isGoogleMapsPage(): boolean {
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  return (host.includes('google.') && path.includes('/maps')) || host.startsWith('maps.google.');
}

/**
 * Extracts current search query from input box or URL.
 */
export function getSearchQuery(): string {
  // Strategy 1: Check Searchbox input value
  const searchInput = document.querySelector<HTMLInputElement>('input#searchboxinput, input[aria-label*="Search"], input[name="q"]');
  if (searchInput && searchInput.value) {
    const val = cleanText(searchInput.value);
    if (val) return val;
  }

  // Strategy 2: URL /maps/search/<query>/
  const path = window.location.pathname;
  const searchMatch = path.match(/\/maps\/search\/([^/@]+)/);
  if (searchMatch) {
    try {
      const decoded = decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
      return cleanText(decoded);
    } catch {
      return cleanText(searchMatch[1]);
    }
  }

  // Strategy 3: Query parameter ?q=
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q');
  if (q) {
    return cleanText(q);
  }

  // Strategy 4: Document Title (often: "query - Google Maps")
  const title = document.title;
  if (title && title.includes('- Google Maps')) {
    const fromTitle = title.split('- Google Maps')[0];
    if (fromTitle && !fromTitle.toLowerCase().includes('google maps')) {
      return cleanText(fromTitle);
    }
  }

  return '';
}

/**
 * Checks if the user is currently viewing an individual place detail pane.
 */
export function isPlaceDetailPage(): boolean {
  if (window.location.pathname.includes('/maps/place/')) {
    // If there's no feed or results list, it's a detail view
    const feed = document.querySelector('div[role="feed"]');
    return !feed;
  }
  return false;
}

/**
 * Counts currently rendered listing items in the search results feed.
 */
export function countRenderedListings(): number {
  return document.querySelectorAll('div[role="feed"] > div > div[jsaction], div[role="feed"] a[href*="/maps/place/"]').length;
}

/**
 * Returns overall Maps status report.
 */
export function getMapsStatus(): MapsStatus {
  const isConnected = isGoogleMapsPage();
  const searchQuery = isConnected ? getSearchQuery() : '';
  const isDetailPage = isConnected ? isPlaceDetailPage() : false;
  const activeListingCount = isConnected ? countRenderedListings() : 0;

  return {
    isConnected,
    searchQuery,
    isDetailPage,
    activeListingCount
  };
}
