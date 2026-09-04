import { Lead } from '../types/lead';
import { extractLeadFromListingElement } from './extractor';
import { getSearchQuery } from './maps-detector';

export type LeadBatchCallback = (leads: Lead[]) => void;

/**
 * Finds the scrollable element containing Google Maps search results.
 * Tests feed, its parents, and candidate containers by checking scrollHeight > clientHeight
 * and computed overflowY styling.
 */
export function findScrollableFeedContainer(): Element | null {
  // Candidate 1: div[role="feed"]
  const feed = document.querySelector('div[role="feed"]');
  if (feed) {
    if (isScrollable(feed)) return feed;

    // Check ancestors up to 6 levels
    let parent = feed.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 6) {
      if (isScrollable(parent)) return parent;
      parent = parent.parentElement;
      depth++;
    }
  }

  // Candidate 2: Listing item parent (find any .Nv2PK and inspect its scrollable ancestor)
  const listingCard = document.querySelector('div.Nv2PK');
  if (listingCard) {
    let parent = listingCard.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 8) {
      if (isScrollable(parent)) return parent;
      parent = parent.parentElement;
      depth++;
    }
  }

  // Candidate 3: Common Google Maps search containers
  const commonSelectors = [
    'div.m6QErb.DxyBCb',
    'div.m6QErb[aria-label*="Results"]',
    'div[aria-label*="Results for"]',
    'div.m6QErb',
    'div[role="main"]'
  ];
  for (const sel of commonSelectors) {
    const el = document.querySelector(sel);
    if (el && isScrollable(el)) return el;
  }

  return feed || document.querySelector('div[role="feed"]') || null;
}

function isScrollable(el: Element): boolean {
  if (el.scrollHeight <= el.clientHeight) return false;
  const style = window.getComputedStyle(el);
  return (
    style.overflowY === 'auto' ||
    style.overflowY === 'scroll' ||
    style.overflow === 'auto' ||
    style.overflow === 'scroll'
  );
}

export class MapsFeedObserver {
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private isCollecting: boolean = false;
  private processedElements = new WeakSet<Element>();
  private processedIds = new Set<string>();
  private collectionId: string = '';
  private onLeadsDetected: LeadBatchCallback;
  private autoScrollInterval: number | null = null;

  constructor(onLeadsDetected: LeadBatchCallback) {
    this.onLeadsDetected = onLeadsDetected;
  }

  public start(collectionId: string) {
    this.collectionId = collectionId;
    this.isCollecting = true;
    this.setupObserver();
    // Immediate initial scan
    this.scanFeed();
  }

  public pause() {
    this.isCollecting = false;
    this.stopAutoScroll();
  }

  public resume() {
    this.isCollecting = true;
    this.scanFeed();
  }

  public stop() {
    this.isCollecting = false;
    this.stopAutoScroll();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.processedIds.clear();
  }

  private setupObserver() {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      if (!this.isCollecting) return;

      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        this.scanFeed();
      }, 300);
    });

    const targetNode = document.querySelector('div[role="feed"]') || document.querySelector('div[role="main"]') || document.body;
    this.observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }

  public scanFeed() {
    const feed = document.querySelector('div[role="feed"]') || document.querySelector('div[aria-label*="Results for"]');
    const container = feed || document.body;
    const searchQuery = getSearchQuery();

    // Look for listing cards
    const candidates = container.querySelectorAll(
      'div[role="feed"] > div, div.Nv2PK, div[jsaction*="mouseover:pane"], a[href*="/maps/place/"]'
    );

    const newLeads: Lead[] = [];

    candidates.forEach(el => {
      // Find the card container
      const card = el.closest('div.Nv2PK') || (el.querySelector('a[href*="/maps/place/"]') ? el : null);
      if (!card || this.processedElements.has(card)) return;

      this.processedElements.add(card);

      const lead = extractLeadFromListingElement(card, this.collectionId, searchQuery);
      if (lead && !this.processedIds.has(lead.id)) {
        this.processedIds.add(lead.id);
        newLeads.push(lead);
      }
    });

    if (newLeads.length > 0 && this.isCollecting) {
      this.onLeadsDetected(newLeads);
    }
  }

  public startAutoScroll(stepPx: number = 400, intervalMs: number = 1000) {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }

    let consecutiveNoMovement = 0;
    let lastScrollTop = -1;

    console.log('[LeadMap] Auto-Scroll Helper running');

    this.autoScrollInterval = window.setInterval(() => {
      const scrollContainer = findScrollableFeedContainer();

      if (scrollContainer) {
        const currentTop = scrollContainer.scrollTop;

        // Smooth scroll step
        scrollContainer.scrollBy({ top: stepPx, behavior: 'smooth' });

        // Fallback: direct scrollTop jump if smooth scroll is ignored
        setTimeout(() => {
          if (scrollContainer.scrollTop === currentTop) {
            scrollContainer.scrollTop += stepPx;
          }
          // Dispatch scroll event for Google Maps dynamic content loader
          scrollContainer.dispatchEvent(new Event('scroll', { bubbles: true }));
        }, 120);

        // Movement check
        if (Math.abs(scrollContainer.scrollTop - lastScrollTop) < 2) {
          consecutiveNoMovement++;
        } else {
          consecutiveNoMovement = 0;
          lastScrollTop = scrollContainer.scrollTop;
        }

        // Check for end of list
        const endIndicator = document.querySelector('span.HlvSq, div.fontTitleSmall:has(+ div.m6QErb)');
        const endText = endIndicator?.textContent || '';
        const reachedEnd = endText.includes("You've reached the end") || 
                           endText.includes("No more results");

        if (reachedEnd || consecutiveNoMovement >= 8) {
          console.log('[LeadMap] Auto-scroll reached end of results feed');
          this.stopAutoScroll();
        }
      } else {
        // Fallback window scroll
        window.scrollBy({ top: stepPx, behavior: 'smooth' });
      }

      // Scan feed for new leads after scrolling
      if (this.isCollecting) {
        setTimeout(() => {
          this.scanFeed();
        }, 300);
      }
    }, intervalMs);
  }

  public stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
      console.log('[LeadMap] Auto-Scroll Helper stopped');
    }
  }
}
