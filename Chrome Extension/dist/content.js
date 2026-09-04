"use strict";
(() => {
  // src/content/normalizer.ts
  function cleanText(input) {
    if (!input) return "";
    return input.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
  }
  function parseRating(input) {
    if (!input) return void 0;
    const match = input.replace(",", ".").match(/(\d+\.\d+|\d+)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val >= 0 && val <= 5) {
        return Math.round(val * 10) / 10;
      }
    }
    return void 0;
  }
  function parseReviewCount(input) {
    if (!input) return void 0;
    const cleaned = input.toLowerCase().replace(/,/g, "");
    const kMatch = cleaned.match(/([\d.]+)\s*k/);
    if (kMatch) {
      return Math.round(parseFloat(kMatch[1]) * 1e3);
    }
    const mMatch = cleaned.match(/([\d.]+)\s*m/);
    if (mMatch) {
      return Math.round(parseFloat(mMatch[1]) * 1e6);
    }
    const match = cleaned.match(/\(?(\d+)\)?/);
    if (match) {
      const val = parseInt(match[1], 10);
      return isNaN(val) ? void 0 : val;
    }
    return void 0;
  }
  function normalizePhone(rawPhone) {
    if (!rawPhone) return {};
    const trimmed = cleanText(rawPhone);
    if (!trimmed) return {};
    let cleaned = trimmed.replace(/[^\d+]/g, "");
    let normalized = cleaned;
    if (cleaned.startsWith("00")) {
      normalized = "+" + cleaned.substring(2);
    } else if (!cleaned.startsWith("+") && cleaned.length >= 10) {
      normalized = cleaned;
    }
    return {
      raw: trimmed,
      normalized: normalized || trimmed
    };
  }
  function cleanMapsUrl(rawUrl) {
    if (!rawUrl) return void 0;
    try {
      const url = new URL(rawUrl, "https://www.google.com");
      const trackingParams = ["ved", "authuser", "entry", "g_ep", "ei", "oq", "gs_lcp", "sclient"];
      trackingParams.forEach((p) => url.searchParams.delete(p));
      return url.origin + url.pathname + (url.search ? url.search : "");
    } catch {
      return rawUrl.split("?")[0];
    }
  }
  function extractCoordinates(url) {
    if (!url) return {};
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      };
    }
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

  // src/content/extractor.ts
  function extractLeadFromListingElement(element, collectionId, searchQuery) {
    try {
      let placeAnchor = element.querySelector('a[href*="/maps/place/"]');
      if (!placeAnchor && element.tagName.toLowerCase() === "a" && element.href.includes("/maps/place/")) {
        placeAnchor = element;
      }
      let businessName = "";
      if (placeAnchor && placeAnchor.getAttribute("aria-label")) {
        businessName = cleanText(placeAnchor.getAttribute("aria-label"));
      }
      if (!businessName) {
        const heading = element.querySelector('.qBF1Pd, div[role="heading"], h3, .fontHeadlineSmall');
        if (heading && heading.textContent) {
          businessName = cleanText(heading.textContent);
        }
      }
      if (!businessName) {
        const titleEl = element.querySelector("span.fontHeadlineSmall, span.OSrXXb");
        if (titleEl && titleEl.textContent) {
          businessName = cleanText(titleEl.textContent);
        }
      }
      if (!businessName || businessName.length < 2 || businessName.toLowerCase() === "results") {
        return null;
      }
      let rawMapsUrl = placeAnchor ? placeAnchor.href : "";
      const mapsUrl = cleanMapsUrl(rawMapsUrl);
      const coords = extractCoordinates(rawMapsUrl);
      let rating;
      let reviewCount;
      const ratingImg = element.querySelector('[aria-label*="star"], [aria-label*="Star"], span.MW4etd');
      if (ratingImg) {
        const aria = ratingImg.getAttribute("aria-label") || "";
        rating = parseRating(aria) || parseRating(ratingImg.textContent);
        reviewCount = parseReviewCount(aria);
      }
      if (!rating) {
        const ratingSpan = element.querySelector("span.MW4etd, span.fontBodyMedium > span:first-child");
        if (ratingSpan && ratingSpan.textContent) {
          rating = parseRating(ratingSpan.textContent);
        }
      }
      if (!reviewCount) {
        const reviewSpan = element.querySelector('span.UY7F9, span[aria-label*="review"], span[aria-label*="Review"]');
        if (reviewSpan) {
          const text = reviewSpan.getAttribute("aria-label") || reviewSpan.textContent;
          reviewCount = parseReviewCount(text);
        }
      }
      let category;
      let address;
      let businessStatus;
      const textRows = Array.from(element.querySelectorAll(".W4Efsd, .fontBodyMedium"));
      for (const row of textRows) {
        const text = cleanText(row.textContent);
        if (!text) continue;
        if (text.includes("Closed") || text.includes("Open")) {
          if (text.toLowerCase().includes("permanently closed")) {
            businessStatus = "Permanently Closed";
          } else if (text.toLowerCase().includes("temporarily closed")) {
            businessStatus = "Temporarily Closed";
          } else if (text.toLowerCase().includes("open 24 hours")) {
            businessStatus = "Open 24 Hours";
          } else if (text.includes("Open")) {
            businessStatus = "Open";
          } else if (text.includes("Closed")) {
            businessStatus = "Closed";
          }
        }
        if (text.includes("\xB7")) {
          const parts = text.split("\xB7").map((p) => cleanText(p)).filter(Boolean);
          for (const part of parts) {
            if (/\d/.test(part)) {
              if (!address && part.length > 5) {
                address = part;
              }
            } else if (!category && part.length > 2 && !part.includes("Open") && !part.includes("Closed")) {
              category = part;
            }
          }
        }
      }
      if (!category) {
        const catCandidate = element.querySelector(".W4Efsd button, span.W4Efsd > span");
        if (catCandidate && catCandidate.textContent) {
          const txt = cleanText(catCandidate.textContent);
          if (txt && !/\d/.test(txt) && txt.length < 40) {
            category = txt;
          }
        }
      }
      let rawPhone;
      const phoneEl = element.querySelector('[data-item-id*="phone"], [data-tooltip*="phone"], a[href^="tel:"]');
      if (phoneEl) {
        if (phoneEl.tagName.toLowerCase() === "a") {
          rawPhone = phoneEl.href.replace("tel:", "");
        } else {
          rawPhone = phoneEl.getAttribute("aria-label") || phoneEl.textContent || void 0;
        }
      }
      if (!rawPhone) {
        const fullCardText = element.textContent || "";
        const phoneMatch = fullCardText.match(/(?:\+?\d{1,4}[ -]?)?(?:\(?\d{2,4}\)?[ -]?)?\d{3,4}[ -]?\d{3,4}/);
        if (phoneMatch && phoneMatch[0].length >= 8 && !phoneMatch[0].includes("202") && !phoneMatch[0].includes("199")) {
          rawPhone = phoneMatch[0];
        }
      }
      const { raw: phone, normalized: normalizedPhone } = normalizePhone(rawPhone);
      let website;
      const websiteEl = element.querySelector(
        'a[data-value="Website"], a[aria-label*="Website"], a[aria-label*="website"], a[data-item-id="authority"]'
      );
      if (websiteEl && websiteEl.href && !websiteEl.href.includes("google.com/maps")) {
        website = websiteEl.href;
      }
      const idSource = mapsUrl || `${businessName.toLowerCase()}_${address || phone || searchQuery}`;
      const id = generateStableId(idSource);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const lead = {
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
        searchQuery: searchQuery || void 0,
        collectionId,
        source: "google_maps",
        collectedAt: now,
        updatedAt: now
      };
      lead.confidenceScore = calculateConfidenceScore(lead);
      return lead;
    } catch (err) {
      console.warn("[LeadMap] Extraction error on element:", err);
      return null;
    }
  }
  function generateStableId(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return "lead_" + (hash >>> 0).toString(36) + "_" + Math.abs(str.length).toString(36);
  }

  // src/content/maps-detector.ts
  function isGoogleMapsPage() {
    const host = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return host.includes("google.") && path.includes("/maps") || host.startsWith("maps.google.");
  }
  function getSearchQuery() {
    const searchInput = document.querySelector('input#searchboxinput, input[aria-label*="Search"], input[name="q"]');
    if (searchInput && searchInput.value) {
      const val = cleanText(searchInput.value);
      if (val) return val;
    }
    const path = window.location.pathname;
    const searchMatch = path.match(/\/maps\/search\/([^/@]+)/);
    if (searchMatch) {
      try {
        const decoded = decodeURIComponent(searchMatch[1].replace(/\+/g, " "));
        return cleanText(decoded);
      } catch {
        return cleanText(searchMatch[1]);
      }
    }
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q");
    if (q) {
      return cleanText(q);
    }
    const title = document.title;
    if (title && title.includes("- Google Maps")) {
      const fromTitle = title.split("- Google Maps")[0];
      if (fromTitle && !fromTitle.toLowerCase().includes("google maps")) {
        return cleanText(fromTitle);
      }
    }
    return "";
  }
  function isPlaceDetailPage() {
    if (window.location.pathname.includes("/maps/place/")) {
      const feed = document.querySelector('div[role="feed"]');
      return !feed;
    }
    return false;
  }
  function countRenderedListings() {
    return document.querySelectorAll('div[role="feed"] > div > div[jsaction], div[role="feed"] a[href*="/maps/place/"]').length;
  }
  function getMapsStatus() {
    const isConnected = isGoogleMapsPage();
    const searchQuery = isConnected ? getSearchQuery() : "";
    const isDetailPage = isConnected ? isPlaceDetailPage() : false;
    const activeListingCount = isConnected ? countRenderedListings() : 0;
    return {
      isConnected,
      searchQuery,
      isDetailPage,
      activeListingCount
    };
  }

  // src/content/observer.ts
  function findScrollableFeedContainer() {
    const feed = document.querySelector('div[role="feed"]');
    if (feed) {
      if (isScrollable(feed)) return feed;
      let parent = feed.parentElement;
      let depth = 0;
      while (parent && parent !== document.body && depth < 6) {
        if (isScrollable(parent)) return parent;
        parent = parent.parentElement;
        depth++;
      }
    }
    const listingCard = document.querySelector("div.Nv2PK");
    if (listingCard) {
      let parent = listingCard.parentElement;
      let depth = 0;
      while (parent && parent !== document.body && depth < 8) {
        if (isScrollable(parent)) return parent;
        parent = parent.parentElement;
        depth++;
      }
    }
    const commonSelectors = [
      "div.m6QErb.DxyBCb",
      'div.m6QErb[aria-label*="Results"]',
      'div[aria-label*="Results for"]',
      "div.m6QErb",
      'div[role="main"]'
    ];
    for (const sel of commonSelectors) {
      const el = document.querySelector(sel);
      if (el && isScrollable(el)) return el;
    }
    return feed || document.querySelector('div[role="feed"]') || null;
  }
  function isScrollable(el) {
    if (el.scrollHeight <= el.clientHeight) return false;
    const style = window.getComputedStyle(el);
    return style.overflowY === "auto" || style.overflowY === "scroll" || style.overflow === "auto" || style.overflow === "scroll";
  }
  var MapsFeedObserver = class {
    observer = null;
    debounceTimer = null;
    isCollecting = false;
    processedElements = /* @__PURE__ */ new WeakSet();
    processedIds = /* @__PURE__ */ new Set();
    collectionId = "";
    onLeadsDetected;
    autoScrollInterval = null;
    constructor(onLeadsDetected) {
      this.onLeadsDetected = onLeadsDetected;
    }
    start(collectionId) {
      this.collectionId = collectionId;
      this.isCollecting = true;
      this.setupObserver();
      this.scanFeed();
    }
    pause() {
      this.isCollecting = false;
      this.stopAutoScroll();
    }
    resume() {
      this.isCollecting = true;
      this.scanFeed();
    }
    stop() {
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
    setupObserver() {
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
    scanFeed() {
      const feed = document.querySelector('div[role="feed"]') || document.querySelector('div[aria-label*="Results for"]');
      const container = feed || document.body;
      const searchQuery = getSearchQuery();
      const candidates = container.querySelectorAll(
        'div[role="feed"] > div, div.Nv2PK, div[jsaction*="mouseover:pane"], a[href*="/maps/place/"]'
      );
      const newLeads = [];
      candidates.forEach((el) => {
        const card = el.closest("div.Nv2PK") || (el.querySelector('a[href*="/maps/place/"]') ? el : null);
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
    startAutoScroll(stepPx = 400, intervalMs = 1e3) {
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
      }
      let consecutiveNoMovement = 0;
      let lastScrollTop = -1;
      console.log("[LeadMap] Auto-Scroll Helper running");
      this.autoScrollInterval = window.setInterval(() => {
        const scrollContainer = findScrollableFeedContainer();
        if (scrollContainer) {
          const currentTop = scrollContainer.scrollTop;
          scrollContainer.scrollBy({ top: stepPx, behavior: "smooth" });
          setTimeout(() => {
            if (scrollContainer.scrollTop === currentTop) {
              scrollContainer.scrollTop += stepPx;
            }
            scrollContainer.dispatchEvent(new Event("scroll", { bubbles: true }));
          }, 120);
          if (Math.abs(scrollContainer.scrollTop - lastScrollTop) < 2) {
            consecutiveNoMovement++;
          } else {
            consecutiveNoMovement = 0;
            lastScrollTop = scrollContainer.scrollTop;
          }
          const endIndicator = document.querySelector("span.HlvSq, div.fontTitleSmall:has(+ div.m6QErb)");
          const endText = endIndicator?.textContent || "";
          const reachedEnd = endText.includes("You've reached the end") || endText.includes("No more results");
          if (reachedEnd || consecutiveNoMovement >= 8) {
            console.log("[LeadMap] Auto-scroll reached end of results feed");
            this.stopAutoScroll();
          }
        } else {
          window.scrollBy({ top: stepPx, behavior: "smooth" });
        }
        if (this.isCollecting) {
          setTimeout(() => {
            this.scanFeed();
          }, 300);
        }
      }, intervalMs);
    }
    stopAutoScroll() {
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval);
        this.autoScrollInterval = null;
        console.log("[LeadMap] Auto-Scroll Helper stopped");
      }
    }
  };

  // src/content/detail-enricher.ts
  function extractLeadFromDetailPane(collectionId, searchQuery) {
    try {
      const mainPane = document.querySelector('div[role="main"]') || document.body;
      const nameHeading = mainPane.querySelector('h1.DUwDvf, h1.fontHeadlineLarge, div[role="main"] h1');
      if (!nameHeading || !nameHeading.textContent) {
        return null;
      }
      const businessName = cleanText(nameHeading.textContent);
      if (!businessName || businessName.toLowerCase().includes("google maps")) {
        return null;
      }
      let rating;
      let reviewCount;
      const ratingEl = mainPane.querySelector('div.F7nice span[aria-hidden="true"], span.ceNzKf');
      if (ratingEl && ratingEl.textContent) {
        rating = parseRating(ratingEl.textContent);
      }
      const reviewEl = mainPane.querySelector('div.F7nice span[aria-label*="reviews"], div.F7nice span[aria-label*="review"]');
      if (reviewEl) {
        reviewCount = parseReviewCount(reviewEl.getAttribute("aria-label") || reviewEl.textContent);
      }
      let category;
      const categoryBtn = mainPane.querySelector('button.DkEaL, button[jsaction*="category"]');
      if (categoryBtn && categoryBtn.textContent) {
        category = cleanText(categoryBtn.textContent);
      }
      let address;
      const addressBtn = mainPane.querySelector('button[data-item-id="address"], [aria-label*="Address:"]');
      if (addressBtn) {
        const aria = addressBtn.getAttribute("aria-label");
        address = aria ? cleanText(aria.replace(/^Address:\s*/i, "")) : cleanText(addressBtn.textContent);
      }
      let rawPhone;
      const phoneBtn = mainPane.querySelector('button[data-item-id*="phone"], [aria-label*="Phone:"]');
      if (phoneBtn) {
        const aria = phoneBtn.getAttribute("aria-label");
        rawPhone = aria ? aria.replace(/^Phone:\s*/i, "") : phoneBtn.textContent || void 0;
      }
      const { raw: phone, normalized: normalizedPhone } = normalizePhone(rawPhone);
      let website;
      const websiteAnchor = mainPane.querySelector('a[data-item-id="authority"], [aria-label*="Website:"]');
      if (websiteAnchor && websiteAnchor.href && !websiteAnchor.href.includes("google.com/maps")) {
        website = websiteAnchor.href;
      }
      const openingHours = [];
      const hoursTable = mainPane.querySelectorAll('table.eKjhWe tr, div[aria-label*="Hours"] tr');
      if (hoursTable.length > 0) {
        hoursTable.forEach((row) => {
          const text = cleanText(row.textContent);
          if (text) openingHours.push(text);
        });
      }
      let businessStatus;
      const statusEl = mainPane.querySelector('span.ZDu9vd, span[style*="color: rgb(217, 48, 37)"], span[style*="color: rgb(24, 128, 56)"]');
      if (statusEl && statusEl.textContent) {
        const text = cleanText(statusEl.textContent);
        if (text.includes("Closed")) businessStatus = "Closed";
        else if (text.includes("Open")) businessStatus = "Open";
      }
      const currentUrl = window.location.href;
      const mapsUrl = cleanMapsUrl(currentUrl);
      const coords = extractCoordinates(currentUrl);
      const enriched = {
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
        openingHours: openingHours.length > 0 ? openingHours : void 0,
        latitude: coords.lat,
        longitude: coords.lng,
        searchQuery: searchQuery || void 0,
        collectionId,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      enriched.confidenceScore = calculateConfidenceScore(enriched);
      return enriched;
    } catch (err) {
      console.warn("[LeadMap] Error extracting from detail pane:", err);
      return null;
    }
  }

  // src/content/index.ts
  console.log("[LeadMap] Content script initialized on Google Maps");
  var activeCollectionId = "default_collection";
  var autoScrollEnabled = false;
  var feedObserver = new MapsFeedObserver((newLeads) => {
    if (newLeads.length > 0) {
      chrome.runtime.sendMessage({
        type: "LEADS_EXTRACTED",
        payload: {
          leads: newLeads,
          collectionId: activeCollectionId
        }
      });
    }
  });
  function reportStatus() {
    const status = getMapsStatus();
    chrome.runtime.sendMessage({
      type: "MAPS_STATUS_REPORT",
      payload: status
    });
  }
  function checkDetailPane() {
    if (isPlaceDetailPage() && activeCollectionId) {
      const enriched = extractLeadFromDetailPane(activeCollectionId);
      if (enriched) {
        chrome.runtime.sendMessage({
          type: "DETAIL_ENRICHMENT",
          payload: enriched
        });
      }
    }
  }
  reportStatus();
  var lastUrl = window.location.href;
  var urlWatcher = setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      reportStatus();
      checkDetailPane();
    }
  }, 1e3);
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
      case "GET_STATUS": {
        sendResponse(getMapsStatus());
        break;
      }
      case "START_COLLECTION": {
        activeCollectionId = message.payload?.collectionId || "default_collection";
        feedObserver.start(activeCollectionId);
        if (message.payload?.autoScroll) {
          autoScrollEnabled = true;
          feedObserver.startAutoScroll();
        }
        sendResponse({ success: true, status: getMapsStatus() });
        break;
      }
      case "PAUSE_COLLECTION": {
        feedObserver.pause();
        sendResponse({ success: true });
        break;
      }
      case "RESUME_COLLECTION": {
        feedObserver.resume();
        if (autoScrollEnabled) {
          feedObserver.startAutoScroll();
        }
        sendResponse({ success: true });
        break;
      }
      case "STOP_COLLECTION": {
        feedObserver.stop();
        autoScrollEnabled = false;
        sendResponse({ success: true });
        break;
      }
      case "TOGGLE_AUTO_SCROLL": {
        autoScrollEnabled = !!message.payload?.enabled;
        if (autoScrollEnabled) {
          feedObserver.startAutoScroll();
        } else {
          feedObserver.stopAutoScroll();
        }
        sendResponse({ success: true, autoScroll: autoScrollEnabled });
        break;
      }
      default:
        break;
    }
    return true;
  });
  document.addEventListener("click", () => {
    setTimeout(() => {
      checkDetailPane();
    }, 600);
  }, { passive: true });
})();
