# 🗺️ LeadMap — Google Maps Lead Collector (Chrome Extension)

LeadMap is a local-first, production-grade Chrome Extension (Manifest V3) built with **TypeScript**, **React 18**, **Tailwind CSS**, and **IndexedDB**. It empowers sales teams, marketers, and researchers to collect publicly displayed business listings from Google Maps into a structured, deduplicated lead database and export them to CSV, Excel (XLSX), or JSON.

---

## 🚀 Quick Start (Installation)

### 1. Build the Extension
Ensure dependencies are installed and run the build script:
```bash
npm install
npm run build
```
This outputs the complete, bundled Chrome Extension to the `dist/` folder.

### 2. Load into Google Chrome / Chromium
1. Open Google Chrome (or Edge / Brave).
2. Navigate to `chrome://extensions/` in the address bar.
3. Toggle on **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left corner.
5. Select the `dist` folder inside this project directory (`d:\Poject\Lead Scrabing Extanction\dist`).
6. Pin **LeadMap** to your Chrome toolbar.

---

## 🎯 How to Use

1. **Open Google Maps**: Navigate to [google.com/maps](https://www.google.com/maps).
2. **Search for Businesses**: Enter your search query (e.g. `mobile shop in Dhaka`, `restaurants in New York`, `dentists in Miami`).
3. **Open LeadMap**: Click the extension icon in the toolbar. It will automatically open the docked **LeadMap Side Panel** alongside your Google Maps tab.
4. **Start Collection**:
   - The extension will automatically detect your active search query.
   - Click **Start Collection**.
   - Browse or scroll through the search results.
   - Watch leads stream in with business name, category, rating, phone, address, and website!
   - An optional **Auto-Scroll Helper** can be toggled on to gently scroll through the feed automatically.
5. **Enrich Leads (Smart Mode)**:
   - Click any place card in Google Maps to open its detail pane.
   - LeadMap will instantly enrich the lead record with verified opening hours, coordinates, full address, and website.
6. **Stop & Review**:
   - Click **Stop** when done.
   - Switch to the **Leads** tab to search, filter (by category, rating, phone availability, website availability), and sort.
   - Click any lead to inspect details in the slide-over modal.
7. **Export**:
   - Click **Export** to download your leads as:
     - **CSV** (RFC-4180 compliant with UTF-8 BOM for Microsoft Excel unicode compatibility)
     - **Excel Workbook (.xlsx)** (Formatted columns with proper cell types)
     - **JSON** (Structured dataset for APIs and CRM imports)

---

## 🏗️ Architecture & Features

| Layer | Technology | Details |
| --- | --- | --- |
| **Manifest** | Manifest V3 | Uses `sidePanel`, `storage`, `tabs`, `activeTab` with minimal permissions. |
| **Frontend UI** | React 18 + Tailwind CSS + Lucide Icons | Responsive Side Panel UI (min 320px) + Action Popup launcher. |
| **Extraction Engine** | Multi-Signal DOM Extractor | Resilient fallback selectors using ARIA labels, semantic roles, headings, and regex patterns. |
| **Feed Observer** | MutationObserver + Debouncing | High-performance dynamic feed observation with duplicate element skipping. |
| **Database** | IndexedDB (`LeadMapDB`) | Client-side persistent storage for thousands of leads, projects, and collection run histories. |
| **Deduplication** | Multi-Tier Hierarchy | Matches by Canonical URL → Place ID → Name + Address → Name + Phone. Enriches existing records without duplicates. |
| **Export Engine** | Client-Side CSV / XLSX / JSON | Custom field selection, Excel Unicode BOM support, and native `.xlsx` workbook generation. |

---

## 🧪 Available Scripts

- `npm run build`: Compiles TypeScript, bundles React UI with Vite, and builds standalone IIFE content script and ESM service worker into `dist/`.
- `npm run dev`: Starts Vite in watch mode.
- `npm test`: Runs automated unit tests for data normalization, coordinate extraction, phone parsing, and CSV escaping.
- `npm run icons`: Regenerates extension PNG icons in `public/icons/`.

---

## 🔒 Privacy & Compliance

LeadMap is built with a **local-first** philosophy:
- Lead data is stored exclusively on your device within your browser's IndexedDB.
- No lead data is transmitted to external servers or third-party cloud services.
- The extension extracts only visibly displayed public information from your active search interface without bypassing CAPTCHAs, rate limits, or access controls.
