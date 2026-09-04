# Product Requirements Document (PRD)

# Google Maps Lead Collector — Chrome Extension

**Product Name:** LeadMap
**Product Type:** Chrome Extension + Optional Cloud Dashboard
**Version:** 1.0
**Document Status:** Product Specification
**Primary Platform:** Google Chrome / Chromium-based browsers
**Target Users:** Sales teams, agencies, marketers, freelancers, local-business researchers, lead-generation teams
**Primary Goal:** Allow users to collect publicly displayed business information from Google Maps search results into a structured, deduplicated lead database and export it for legitimate business-development workflows.

---

# 1. Executive Summary

LeadMap is a Chrome extension that helps users collect business leads from the Google Maps interface.

A user performs a normal Google Maps search such as:

> `mobile shop in Dhaka`

or:

> `restaurants in Chittagong`

The extension detects business listings displayed in the Maps interface and collects available publicly displayed information such as:

* Business name
* Category
* Rating
* Review count
* Address
* Phone number, when displayed
* Website, when displayed
* Google Maps listing URL
* Business status
* Opening hours, when displayed
* Search keyword
* Collection date/time

The extension then presents the collected leads in a clean dashboard where users can:

* Search
* Filter
* Sort
* Deduplicate
* Select leads
* Delete leads
* Export CSV
* Export XLSX
* Export JSON
* Create collections/projects
* Review collection history

The product should be designed around **user-initiated collection of information visibly available in the Google Maps interface**. It must not attempt to bypass CAPTCHAs, authentication barriers, access controls, rate limits, or other technical restrictions.

---

# 2. Product Vision

### Vision

> **Turn Google Maps business research into an organized lead database in a few clicks.**

Instead of manually opening hundreds of Google Maps listings and copying information into spreadsheets, LeadMap provides a structured workflow:

```text
Google Maps Search
        ↓
Start Collection
        ↓
Detect Listings
        ↓
Extract Visible Information
        ↓
Normalize Data
        ↓
Deduplicate
        ↓
Lead Database
        ↓
Filter / Review
        ↓
Export
```

---

# 3. Problem Statement

Users doing local-business research currently have to:

1. Search Google Maps.
2. Open individual businesses.
3. Copy business information.
4. Paste information into Excel/Google Sheets.
5. Repeat the process.
6. Manually remove duplicates.
7. Clean phone numbers and addresses.
8. Organize leads into separate lists.

For hundreds of businesses this becomes extremely time-consuming.

### Current workflow

```text
Google Maps
     ↓
Find business
     ↓
Open listing
     ↓
Copy name
     ↓
Copy phone
     ↓
Copy address
     ↓
Open spreadsheet
     ↓
Paste
     ↓
Repeat 100+ times
```

### Proposed workflow

```text
Google Maps
     ↓
Search
     ↓
Start LeadMap
     ↓
Collect
     ↓
Review
     ↓
Export
```

---

# 4. Goals

## 4.1 Primary Goals

### G1 — Business lead collection

Allow users to collect business information from Google Maps search/listing interfaces.

### G2 — Reduce manual work

Reduce the time required to create a structured local-business list.

### G3 — High-quality data

Normalize collected information into consistent fields.

### G4 — Deduplication

Prevent the same business from appearing multiple times within a collection.

### G5 — Easy export

Allow users to export collected leads in common formats.

### G6 — Simple UX

A non-technical user should be able to install the extension and start collecting within seconds.

### G7 — Scalable architecture

Architecture should allow a future cloud dashboard and integration with the user's broader outreach platform.

---

# 5. Non-Goals

The initial product will **not**:

* Bypass CAPTCHA.
* Bypass authentication.
* Circumvent access restrictions.
* Circumvent technical rate limits.
* Collect private information.
* Access private Google accounts.
* Automatically send messages to businesses.
* Automatically send WhatsApp messages.
* Automatically send email.
* Pretend to be a human user.
* Purchase advertisements.
* Modify Google Maps data.
* Automatically create fake reviews.
* Manipulate ratings/reviews.
* Collect information that is not exposed through the normal interface.

The product is a **lead collection and organization tool**, not an automated outreach system.

---

# 6. Target Users

## Persona 1 — Freelancer

Example:

> A freelancer wants to find 200 restaurants in Dhaka to build a prospect list.

Needs:

* Simple collection
* CSV export
* Phone numbers
* Website
* Address

---

## Persona 2 — Digital Marketing Agency

Example:

> An agency wants to research local businesses that could need websites or advertising.

Needs:

* Large collections
* Projects
* Filtering
* Export
* Collection history

---

## Persona 3 — Sales Team

Needs:

* Structured lead database
* Search
* Filtering
* Tags
* Notes
* Assignment
* CRM integration

---

## Persona 4 — Researcher

Needs:

* Search-based collection
* Location information
* Business categories
* Ratings
* Exportable datasets

---

# 7. Core User Journey

## Journey A — First-time user

```text
Install Extension
      ↓
Open Google Maps
      ↓
Search for businesses
      ↓
Open LeadMap
      ↓
Click "Start Collection"
      ↓
Extension detects results
      ↓
Leads appear
      ↓
User stops collection
      ↓
User reviews leads
      ↓
Export CSV
```

---

# 8. Product Architecture

## 8.1 High-Level Architecture

```text
┌───────────────────────────────┐
│       Google Maps             │
│                               │
│ Search Results / Details      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      LeadMap Content Script    │
│                               │
│ DOM observation               │
│ Listing detection             │
│ Data extraction               │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      Extraction Engine         │
│                               │
│ Normalization                 │
│ Validation                    │
│ Deduplication                 │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      Extension Service Worker  │
│                               │
│ State management              │
│ Storage                       │
│ Export processing             │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       Local Lead Database      │
│                               │
│ chrome.storage / IndexedDB    │
└───────────────────────────────┘
```

---

# 9. Technology Stack

## Chrome Extension

Recommended:

* TypeScript
* React
* Vite
* Manifest V3
* Chrome Side Panel API
* Chrome Storage API
* IndexedDB
* MutationObserver

## UI

Recommended:

* React
* Tailwind CSS
* shadcn/ui
* Lucide Icons

## Export

* CSV generator
* XLSX library
* JSON serializer

## Optional backend

Future version:

```text
Frontend
   ↓
Next.js
   ↓
API
   ↓
PostgreSQL
   ↓
Redis / Queue
```

---

# 10. Chrome Extension Structure

Recommended project structure:

```text
leadmap/
│
├── src/
│   │
│   ├── background/
│   │   └── service-worker.ts
│   │
│   ├── content/
│   │   ├── maps-detector.ts
│   │   ├── listing-detector.ts
│   │   ├── extractor.ts
│   │   ├── normalizer.ts
│   │   └── observer.ts
│   │
│   ├── popup/
│   │   ├── App.tsx
│   │   └── popup.html
│   │
│   ├── sidepanel/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── pages/
│   │
│   ├── dashboard/
│   │   ├── Leads.tsx
│   │   ├── Collections.tsx
│   │   └── Settings.tsx
│   │
│   ├── database/
│   │   ├── leads.ts
│   │   ├── collections.ts
│   │   └── storage.ts
│   │
│   ├── export/
│   │   ├── csv.ts
│   │   ├── xlsx.ts
│   │   └── json.ts
│   │
│   ├── types/
│   │   ├── lead.ts
│   │   └── collection.ts
│   │
│   └── utils/
│
├── public/
│   └── icons/
│
├── manifest.json
├── package.json
└── README.md
```

---

# 11. Manifest V3

The extension should use Manifest V3.

Conceptually:

```text
manifest_version: 3

permissions:
- storage
- sidePanel

host_permissions:
- Google Maps domains required for the supported Maps experience

content_scripts:
- Google Maps pages

background:
- service worker

side_panel:
- LeadMap dashboard
```

The final permission set should follow the **minimum necessary permissions principle**.

---

# 12. Main Features

# Feature 1 — Google Maps Detection

The extension detects when the user is on a supported Google Maps page.

### States

```text
Google Maps detected
        ↓
Ready
```

or:

```text
Unsupported page
        ↓
"Open Google Maps to start collecting"
```

### UI

```text
Google Maps
● Connected
```

---

# Feature 2 — Search Detection

The extension should identify the current search context where reasonably available.

Example:

```text
Search:
mobile shop in bangladesh
```

Store:

```json
{
  "query": "mobile shop in bangladesh"
}
```

This becomes part of collection metadata.

---

# Feature 3 — Collection Control

Main controls:

```text
┌──────────────────────────────┐
│ Collection                   │
│                              │
│ ● Ready                      │
│                              │
│ [ Start Collection ]         │
└──────────────────────────────┘
```

After starting:

```text
┌──────────────────────────────┐
│ Collection                   │
│                              │
│ ● Collecting                 │
│                              │
│ Leads: 127                   │
│                              │
│ [ Pause ]   [ Stop ]         │
└──────────────────────────────┘
```

---

# Feature 4 — Business Listing Detection

The content script monitors the Maps interface for business listing elements.

Because Maps is a dynamic application, the system should not assume that the entire page is available when the extension starts.

Use:

```text
MutationObserver
```

to detect newly rendered content.

Example:

```text
Initial results
       ↓
Collect
       ↓
User scrolls
       ↓
New results rendered
       ↓
Observer detects them
       ↓
Extract
```

---

# Feature 5 — Lead Extraction

Each detected listing should be converted into a normalized lead.

### Minimum fields

```text
Business Name
Category
Rating
Review Count
Address
Phone
Website
Maps URL
```

### Extended fields

```text
Business Status
Opening Hours
Latitude
Longitude
Search Query
Location
Collection ID
Collected At
```

---

# 13. Lead Data Model

Recommended schema:

```typescript
interface Lead {
  id: string;

  businessName: string;

  category?: string;

  rating?: number;

  reviewCount?: number;

  phone?: string;

  website?: string;

  address?: string;

  mapsUrl?: string;

  businessStatus?: string;

  openingHours?: string[];

  latitude?: number;

  longitude?: number;

  searchQuery?: string;

  location?: string;

  collectionId: string;

  source: "google_maps";

  collectedAt: string;

  updatedAt: string;
}
```

---

# 14. Lead ID / Deduplication

Deduplication is critical.

Preferred matching hierarchy:

```text
1. Stable Maps listing URL
        ↓
2. Place identifier if legitimately exposed
        ↓
3. Normalized business name + address
        ↓
4. Business name + phone
```

Example:

```text
"Mobile Bangladesh"
"Mobile Bangladesh"
```

with the same listing URL:

```text
Duplicate → Ignore
```

---

# 15. Data Normalization

Raw data may look inconsistent.

Example:

```text
+880 1342-716821
01342 716821
01342-716821
```

The system should preserve the original value while optionally creating a normalized representation.

### Example

```json
{
  "phone": "01342-716821",
  "normalizedPhone": "+8801342716821"
}
```

Important:

**Never silently alter the original data.**

---

# 16. Data Quality Indicators

Every lead can have a quality indicator.

Example:

```text
██████████ 100%
```

or:

```text
High
Medium
Low
```

### Example calculation

```text
Business name       ✓
Category             ✓
Phone                ✓
Address              ✓
Website              ✓
Rating               ✓

Quality: High
```

---

# 17. Missing Data

Do not insert fake values.

Bad:

```text
Phone: N/A
Website: Unknown
```

Better internally:

```json
{
  "phone": null,
  "website": null
}
```

UI can display:

```text
Phone —
Website —
```

---

# 18. Search Results Collector

The first major collection mode.

### Workflow

```text
User searches Maps
       ↓
LeadMap detects results
       ↓
User clicks Start
       ↓
Visible listings extracted
       ↓
User scrolls
       ↓
Additional listings detected
       ↓
Deduplication
       ↓
Lead count increases
```

---

# 19. Detail Collector

Optional second mode.

User opens:

```text
Mobile Bangladesh
```

The extension reads information visibly available in the listing detail interface.

### Detail information

```text
Business Name
Category
Rating
Reviews
Address
Phone
Website
Hours
Status
Maps URL
```

This mode should only process information exposed by the normal interface.

---

# 20. Collection Modes

Settings:

```text
Collection Mode

○ Search Results
○ Business Details
○ Smart Mode
```

### Smart Mode

```text
Search results
     ↓
Collect available listing data
     ↓
If user opens detail page
     ↓
Enrich existing lead
```

---

# 21. Side Panel

The Chrome Side Panel should be the primary interaction interface.

## Header

```text
┌──────────────────────────────┐
│ 🗺 LeadMap             ⚙     │
└──────────────────────────────┘
```

## Status

```text
Google Maps
● Connected
```

## Collection

```text
Collection

Mobile shops — Dhaka

127 Leads

████████░░

[ Pause ] [ Stop ]
```

---

# 22. Live Collection Screen

```text
┌────────────────────────────────┐
│ Collecting                     │
│                                │
│ 127 leads                      │
│                                │
│ New leads                      │
│                                │
│ ✓ Mobile Bangladesh            │
│ ✓ Rio International            │
│ ✓ Take & Talk BD               │
│ ✓ Gadget & Gear                │
│                                │
│ [ View Leads ]                 │
└────────────────────────────────┘
```

---

# 23. Lead Dashboard

Main dashboard:

```text
┌─────────────────────────────────────────┐
│ Leads                                   │
├─────────────────────────────────────────┤
│ 1,247 Leads                             │
│                                         │
│ Search leads...                         │
│                                         │
│ Category ▾ Rating ▾ Phone ▾ Website ▾   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ □ Business   Phone     Rating       │ │
│ │ □ Mobile BD  01342...  4.6          │ │
│ │ □ Rio Intl   01840...  4.1          │ │
│ │ □ TakeTalk   01842...  4.9          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Export] [Delete]                       │
└─────────────────────────────────────────┘
```

---

# 24. Lead Table Columns

Default:

| Column    | Description       |
| --------- | ----------------- |
| Checkbox  | Select lead       |
| Business  | Business name     |
| Category  | Business category |
| Phone     | Phone             |
| Rating    | Google rating     |
| Reviews   | Review count      |
| Address   | Business address  |
| Website   | Website           |
| Status    | Open/closed       |
| Collected | Collection date   |

Users can customize visible columns.

---

# 25. Lead Detail View

Clicking a lead opens:

```text
┌─────────────────────────────────┐
│ Mobile Bangladesh               │
│ Cell phone store                │
│                                 │
│ ⭐ 4.6     263 reviews          │
│                                 │
│ 📍 Road No. 17, Dhaka 1213     │
│                                 │
│ ☎ 01342-716821                  │
│                                 │
│ 🌐 Website                      │
│                                 │
│ 🗺 Open in Google Maps          │
│                                 │
│ Collection                      │
│ Mobile Shops — Dhaka            │
│                                 │
│ Collected                       │
│ Sep 4, 2026                     │
└─────────────────────────────────┘
```

---

# 26. Search

Search should work across:

* Business name
* Category
* Phone
* Address
* Website
* Search query

Example:

```text
Search: restaurant

Results:
23 leads
```

---

# 27. Filters

Filters:

### Category

```text
All
Restaurant
Cell phone store
Hotel
Dentist
Gym
...
```

### Rating

```text
Any
3+
4+
4.5+
```

### Phone

```text
All
Has phone
No phone
```

### Website

```text
All
Has website
No website
```

### Collection

```text
All collections
Mobile Shops
Restaurants
Dentists
```

---

# 28. Sorting

Supported sorting:

```text
Name A → Z
Name Z → A
Rating high → low
Rating low → high
Reviews high → low
Reviews low → high
Newest collected
Oldest collected
```

---

# 29. Bulk Actions

Users can select multiple leads.

```text
☑ 20 selected

[ Export ]
[ Add Tag ]
[ Move to Collection ]
[ Delete ]
```

---

# 30. Collections / Projects

A collection groups leads from one research task.

Example:

```text
Collections

📁 Mobile Shops — Dhaka
127 leads

📁 Restaurants — Dhaka
384 leads

📁 Dentists — Chittagong
92 leads
```

---

# 31. Collection Metadata

Each collection should contain:

```typescript
interface Collection {
  id: string;

  name: string;

  searchQuery?: string;

  location?: string;

  leadCount: number;

  createdAt: string;

  updatedAt: string;
}
```

Example:

```json
{
  "name": "Mobile Shops — Dhaka",
  "searchQuery": "mobile shop in dhaka",
  "leadCount": 127
}
```

---

# 32. Collection History

Users should be able to see previous collection jobs.

```text
Collection History

Today

Mobile shops in Dhaka
127 leads
Completed

Restaurants in Dhaka
384 leads
Completed

Yesterday

Dentists in Chittagong
92 leads
Completed
```

---

# 33. Export System

## CSV

Primary export format.

Example:

```csv
Business Name,Category,Phone,Rating,Reviews,Address,Website,Maps URL
Mobile Bangladesh,Cell phone store,01342-716821,4.6,263,...
```

---

## XLSX

Spreadsheet-ready export.

Useful for:

* Excel
* Google Sheets
* CRM imports

---

## JSON

For developers and integrations.

```json
[
  {
    "businessName": "Mobile Bangladesh",
    "category": "Cell phone store",
    "phone": "01342-716821"
  }
]
```

---

# 34. Export Dialog

```text
Export Leads

Selected:
127 leads

Format

○ CSV
○ Excel
○ JSON

Fields

☑ Business name
☑ Category
☑ Phone
☑ Rating
☑ Reviews
☑ Address
☑ Website
☑ Maps URL

[ Export ]
```

---

# 35. Tags

Optional Phase 2 feature.

Example:

```text
Tags

Potential Client
Website Needed
High Rating
Has Phone
Follow Up
```

A lead can have multiple tags.

---

# 36. Notes

Optional Phase 2.

Example:

```text
Notes

"Potential web design client.
Contact next week."
```

Notes are user-generated and stored locally/cloud-side.

---

# 37. Lead Status

Optional Phase 2:

```text
New
Contacted
Interested
Not Interested
Converted
Archived
```

This transforms LeadMap from a scraper into a lightweight lead-management tool.

---

# 38. Import

Phase 2/3 feature.

Allow:

```text
Import CSV
Import XLSX
Import JSON
```

This allows users to combine external lead sources.

---

# 39. Cloud Sync

Future SaaS functionality.

```text
Chrome Extension
       ↓
User Account
       ↓
Cloud API
       ↓
PostgreSQL
       ↓
Web Dashboard
```

Users can then access leads from multiple computers.

---

# 40. Authentication

Future cloud version:

```text
Sign in

Continue with Google
Email + Password
```

Optional:

```text
Magic Link
```

---

# 41. Web Dashboard

Future product architecture:

```text
LeadMap
│
├── Chrome Extension
│
└── Web Dashboard
    │
    ├── Overview
    ├── Leads
    ├── Collections
    ├── Tags
    ├── Exports
    ├── Integrations
    ├── Usage
    └── Settings
```

---

# 42. Dashboard Overview

Example:

```text
Dashboard

Total Leads
1,284

Collections
12

This Week
+384

Phone Available
76%

Website Available
61%

────────────────────────────

Recent Collections

Mobile Shops — Dhaka     127
Restaurants — Dhaka      384
Dentists — Chittagong     92
```

---

# 43. Usage Tracking

For future paid plans:

```text
Usage

Leads collected
1,284 / 5,000

Collections
12 / 50

Exports
18 / 100
```

---

# 44. Pricing Architecture

Possible future plans:

### Free

```text
1,000 leads/month
Basic export
Local storage
```

### Pro

```text
10,000 leads/month
Cloud sync
Advanced filters
Collections
XLSX export
```

### Business

```text
50,000+ leads
Team members
API
Advanced integrations
```

Exact pricing should be determined after validating demand.

---

# 45. Error Handling

The extension must clearly explain errors.

## Google Maps not detected

```text
Google Maps isn't detected.

Open Google Maps and try again.
```

## No listings detected

```text
No business listings detected yet.

Try performing a Google Maps search first.
```

## Collection paused

```text
Collection paused.

Scroll or continue browsing Maps,
then resume collection.
```

## Extraction failure

```text
Some business information could not be read.

The listing may not expose that information
in the current interface.
```

---

# 46. Permission Error

If the extension doesn't have the necessary permission:

```text
Google Maps access isn't enabled.

Open Extension Settings to enable access.
```

The extension should request only permissions genuinely needed.

---

# 47. Dynamic Page Handling

This is one of the most important engineering requirements.

Google Maps dynamically changes its DOM.

Therefore:

**Do not rely on one static page load.**

Use:

```text
MutationObserver
       +
DOM scanning
       +
Debouncing
       +
Duplicate detection
```

Example:

```text
DOM mutation
      ↓
Wait 200–500ms
      ↓
Find candidate listings
      ↓
Check previously processed elements
      ↓
Extract
```

---

# 48. Extraction Engine

Recommended internal architecture:

```text
Extractor
│
├── SearchResultExtractor
│
├── DetailExtractor
│
├── AddressExtractor
│
├── PhoneExtractor
│
├── WebsiteExtractor
│
├── RatingExtractor
│
└── HoursExtractor
```

This modular approach makes maintenance easier.

---

# 49. Selector Strategy

Do not depend exclusively on brittle CSS selectors.

Prefer multiple signals:

```text
ARIA labels
Semantic attributes
Accessible names
Stable URL patterns
DOM relationships
Text patterns
Known interface structures
```

Use a fallback system:

```text
Strategy A
   ↓ fail
Strategy B
   ↓ fail
Strategy C
   ↓
Field unavailable
```

---

# 50. Extraction Confidence

Each field can optionally have a confidence score.

Example:

```json
{
  "phone": {
    "value": "+8801342716821",
    "confidence": 0.98
  }
}
```

This is useful for debugging and future improvements.

---

# 51. Performance Requirements

The extension should not noticeably slow Google Maps.

### Requirements

* Avoid continuous expensive DOM scans.
* Debounce mutation events.
* Process only new candidate elements.
* Avoid unnecessary network requests.
* Keep memory usage reasonable.
* Use IndexedDB for larger local datasets.

---

# 52. Local Storage Strategy

For MVP:

```text
Small settings
    ↓
chrome.storage.local
```

For large lead datasets:

```text
Lead records
    ↓
IndexedDB
```

Recommended:

```text
chrome.storage
→ settings
→ preferences
→ current state

IndexedDB
→ leads
→ collections
→ history
```

---

# 53. Security Requirements

The extension must:

* Avoid storing passwords.
* Avoid collecting private account information.
* Sanitize user-generated fields.
* Validate imported files.
* Avoid executing arbitrary page content as code.
* Protect cloud API tokens.
* Use HTTPS for cloud communication.
* Keep extension permissions minimal.

---

# 54. Privacy

MVP should ideally be **local-first**.

Meaning:

```text
Google Maps
    ↓
Extension
    ↓
User's browser
    ↓
Local database
```

No lead data needs to leave the device.

For cloud version, clearly communicate:

* What data is uploaded.
* Why it is uploaded.
* How long it is retained.
* How users can delete it.

---

# 55. Compliance / Responsible Use

The product should be explicitly designed for responsible collection.

The extension should:

* Collect only information visibly presented through the supported Maps interface.
* Require the user to initiate collection.
* Respect applicable Google terms and policies.
* Avoid bypassing technical restrictions.
* Avoid CAPTCHA circumvention.
* Avoid authentication bypass.
* Avoid hidden/private data collection.
* Avoid collecting sensitive personal information unnecessarily.

A compliance review should be performed before publishing the extension commercially.

---

# 56. Anti-Abuse Controls

If the cloud version is introduced, implement:

```text
Account limits
Usage limits
Rate controls
Abuse detection
API authentication
Audit logs
```

The system should not encourage users to circumvent platform restrictions.

---

# 57. Browser Compatibility

Primary:

```text
Google Chrome
```

Potential future support:

```text
Microsoft Edge
Brave
Other Chromium browsers
```

Firefox can be considered separately because extension APIs and implementation details differ.

---

# 58. Responsive UI

The side panel should support:

```text
320px+
```

Minimum usable layout:

```text
320 × 500
```

Desktop dashboard:

```text
1024px+
```

---

# 59. Design System

Visual direction:

### Style

* Clean
* Modern
* SaaS
* Minimal
* Professional
* Data-focused

### Colors

Use a neutral interface with one primary brand color.

### Components

```text
Button
Input
Select
Badge
Table
Card
Modal
Dropdown
Tooltip
Toast
Tabs
Pagination
Empty State
Loading State
```

---

# 60. Empty States

## No leads

```text
No leads yet

Search for businesses on Google Maps
and start a collection.

[ Open Google Maps ]
```

## No collections

```text
No collections yet.

Your completed collection jobs
will appear here.
```

---

# 61. Loading State

While collecting:

```text
Collecting businesses...

████████████░░░░

127 leads found
```

If exact progress cannot be known, don't show a misleading percentage.

Use:

```text
127 leads collected
```

instead.

---

# 62. Notifications

Use lightweight toast notifications.

Example:

```text
✓ Lead collected
```

```text
✓ 25 leads exported
```

```text
✓ Collection saved
```

```text
⚠ Some fields could not be collected
```

---

# 63. Keyboard Shortcuts

Future feature:

```text
Alt + L
```

Open LeadMap.

Potential:

```text
Ctrl/Cmd + E
```

Export leads.

---

# 64. Internationalization

The extension should eventually support:

* English
* Bengali
* Hindi
* Arabic
* Spanish

However, MVP can launch in English.

The extraction system should not assume English-only business names or addresses.

---

# 65. Localization Requirements

Data may contain:

```text
English
বাংলা
العربية
中文
हिन्दी
```

The system must store Unicode correctly.

Example:

```text
ব্যবসা বাংলাদেশ
```

must remain intact during:

* Collection
* Storage
* Search
* CSV export
* XLSX export
* JSON export

---

# 66. Analytics

If analytics are introduced, collect only product-level telemetry necessary for improving the extension.

Possible metrics:

```text
Extension installed
Collection started
Collection completed
Leads collected
Export performed
Feature usage
Errors
```

Do not unnecessarily send business lead contents as analytics.

---

# 67. Product Metrics

## Primary KPI

### Leads successfully collected

```text
Total successfully stored leads
```

---

## Secondary KPIs

### Collection success rate

```text
Successful collections / started collections
```

### Export rate

```text
Collections exported / collections completed
```

### Active users

```text
DAU
WAU
MAU
```

### Retention

```text
Day 1
Day 7
Day 30
```

---

# 68. Data Quality Metrics

Track internally:

```text
% with phone
% with website
% with address
% with rating
% with category
% duplicate
```

Example:

```text
Phone coverage       78%
Website coverage     64%
Address coverage     99%
Rating coverage      97%
```

---

# 69. Acceptance Criteria — MVP

The MVP is complete when:

### Google Maps

* [ ] Extension detects supported Maps pages.
* [ ] Search results can be detected.
* [ ] Dynamic results can be detected.
* [ ] User can start collection.
* [ ] User can pause collection.
* [ ] User can resume collection.
* [ ] User can stop collection.

### Data

* [ ] Business name extracted.
* [ ] Category extracted when available.
* [ ] Rating extracted when available.
* [ ] Review count extracted when available.
* [ ] Address extracted when available.
* [ ] Phone extracted when displayed.
* [ ] Website extracted when displayed.
* [ ] Maps URL stored.

### Storage

* [ ] Leads persist after popup closes.
* [ ] Leads persist after browser restart.
* [ ] Duplicate leads are rejected.
* [ ] Collections are stored.

### Dashboard

* [ ] Lead table works.
* [ ] Search works.
* [ ] Filters work.
* [ ] Sorting works.
* [ ] Lead details work.
* [ ] Delete works.
* [ ] Bulk selection works.

### Export

* [ ] CSV export works.
* [ ] XLSX export works.
* [ ] JSON export works.

---

# 70. MVP Scope

The first release should remain focused.

## MVP

```text
Chrome Extension
        │
        ├── Google Maps detection
        ├── Search result collection
        ├── Detail enrichment
        ├── Lead database
        ├── Deduplication
        ├── Search
        ├── Filters
        ├── Collections
        ├── CSV
        ├── XLSX
        └── JSON
```

Do **not** initially build:

```text
CRM
Email marketing
WhatsApp automation
Team management
Billing
API
AI lead scoring
```

Those should come later.

---

# 71. Phase 2

```text
Tags
Notes
Lead status
Advanced filters
Import
Cloud backup
Account system
Web dashboard
```

---

# 72. Phase 3

```text
CRM
Team members
Lead assignment
Custom fields
API
Webhook
Integrations
Analytics
```

---

# 73. Phase 4 — Outreach Integration

This is where LeadMap can connect to the bulk messaging platform you were designing.

Architecture:

```text
                    LeadMap
                       │
                       ▼
                Lead Database
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
          Email              WhatsApp
             │                   │
             ▼                   ▼
       Bulk Email          WhatsApp API
```

A user could eventually do:

```text
Google Maps
     ↓
Collect 500 businesses
     ↓
Filter:
Has phone = Yes
Category = Restaurant
Rating > 4
     ↓
Select 150
     ↓
Send to Outreach Platform
```

But this should be a separate, properly authorized outreach workflow rather than making the Maps collector itself send messages.

---

# 74. Future AI Features

Potential future functionality:

### Lead classification

```text
Restaurant
Website quality:
Good / Average / Poor
```

### Lead scoring

```text
Score: 87/100
```

### Business opportunity detection

Example:

```text
No website
High rating
Phone available

Potential prospect
```

Any such scoring should be transparent and should not claim facts that were not actually observed.

---

# 75. Future CRM Integration

Potential integrations:

```text
Google Sheets
HubSpot
Salesforce
Zoho
Pipedrive
Notion
Zapier
Make
Custom Webhooks
```

Data flow:

```text
LeadMap
   ↓
Webhook/API
   ↓
CRM
```

---

# 76. API Architecture

Future API:

```text
POST /api/leads
GET  /api/leads
GET  /api/leads/:id
PUT  /api/leads/:id
DELETE /api/leads/:id

GET /api/collections
POST /api/collections

POST /api/exports
```

Authentication:

```text
Bearer Token
```

or OAuth-based authentication for integrations.

---

# 77. Database Schema — Future Cloud

### users

```text
id
email
name
created_at
updated_at
```

### collections

```text
id
user_id
name
search_query
location
created_at
updated_at
```

### leads

```text
id
collection_id
business_name
category
phone
normalized_phone
website
rating
review_count
address
maps_url
business_status
latitude
longitude
collected_at
created_at
updated_at
```

### tags

```text
id
user_id
name
```

### lead_tags

```text
lead_id
tag_id
```

---

# 78. API Security

Cloud version must implement:

```text
Authentication
Authorization
Input validation
Rate limiting
Request logging
Encryption in transit
Secure secrets
Database access controls
```

Users should only be able to access their own leads unless a team-sharing feature explicitly grants access.

---

# 79. Backup

Local MVP:

```text
Export = manual backup
```

Future cloud:

```text
Automatic backup
Version history
Restore deleted leads
```

---

# 80. Failure Recovery

If Chrome crashes during collection:

```text
Last saved lead
       ↓
Collection state restored
       ↓
User can resume
```

Do not rely entirely on in-memory state.

Persist batches periodically.

---

# 81. Collection State Machine

```text
IDLE
 │
 ▼
STARTING
 │
 ▼
COLLECTING
 │
 ├────► PAUSED
 │         │
 │         ▼
 │      COLLECTING
 │
 ▼
STOPPING
 │
 ▼
COMPLETED
```

Error:

```text
COLLECTING
     │
     ▼
   ERROR
     │
     ▼
 RECOVER / STOP
```

---

# 82. Duplicate Handling UX

If duplicate:

```text
Existing lead found

Mobile Bangladesh

Already collected in:
Mobile Shops — Dhaka

[ View Existing ]
```

Do not create another record.

---

# 83. Enrichment

If a lead already exists but a later collection discovers additional information:

```text
Existing lead
       +
New information
       ↓
Merge
```

Example:

First collection:

```text
Name
Address
Rating
```

Later detail view:

```text
Phone
Website
Hours
```

Result:

```text
One enriched lead
```

---

# 84. Export Safety

Before export:

```text
127 leads selected
```

Confirm:

```text
Export 127 leads as CSV?
```

For large datasets:

```text
Generating file...
```

Then:

```text
✓ Export complete
```

---

# 85. Testing Strategy

## Unit Tests

Test:

* Phone normalization
* Rating parsing
* Review parsing
* Address parsing
* Deduplication
* Data normalization
* Export formatting

---

## Integration Tests

Test:

```text
Google Maps page
      ↓
Content script
      ↓
Extractor
      ↓
Storage
      ↓
Dashboard
```

---

## UI Tests

Test:

* Start collection
* Pause
* Resume
* Stop
* Search
* Filter
* Sort
* Delete
* Export

---

# 86. Regression Testing

Because Google Maps UI can change, maintain a test suite covering several representative page states.

Example:

```text
Search results
Search results + scrolling
Business detail
Missing phone
Missing website
Closed business
International address
Non-English business name
```

---

# 87. Error Logging

Internal logs should capture:

```text
Extractor version
Page type
Failed field
Error type
Browser version
Extension version
```

Do not log complete lead datasets unnecessarily.

---

# 88. Extension Updates

Use semantic versioning:

```text
1.0.0
1.0.1
1.1.0
2.0.0
```

Example:

```text
1.0.0 → MVP
1.1.0 → Tags
1.2.0 → Cloud sync
2.0.0 → SaaS dashboard
```

---

# 89. Development Roadmap

## Sprint 1 — Foundation

```text
Day 1–2
Project setup
React
TypeScript
Vite
Manifest V3

Day 3
Side panel

Day 4
Chrome messaging

Day 5
Storage architecture
```

---

## Sprint 2 — Maps Detection

```text
Google Maps detection
Search detection
Listing detection
MutationObserver
Basic extraction
```

---

## Sprint 3 — Lead Engine

```text
Normalization
Deduplication
Storage
Collections
Enrichment
```

---

## Sprint 4 — Dashboard

```text
Lead table
Search
Filters
Sorting
Lead details
Bulk actions
```

---

## Sprint 5 — Export

```text
CSV
XLSX
JSON
Export dialog
Large dataset handling
```

---

## Sprint 6 — QA

```text
Edge cases
Performance
Google Maps UI variations
Browser testing
Security
Privacy
```

---

# 90. Definition of Done

A feature is considered complete only when:

```text
✓ Implemented
✓ Unit tested
✓ Integration tested
✓ UI tested
✓ Error state implemented
✓ Loading state implemented
✓ Empty state implemented
✓ Data persisted correctly
✓ No console-critical errors
✓ Performance reviewed
✓ Privacy reviewed
```

---

# 91. Final MVP User Experience

The ideal experience should be:

### Step 1

User opens Google Maps.

```text
Search:
mobile shop in Dhaka
```

### Step 2

User opens LeadMap.

```text
Google Maps
● Connected

[ Start Collection ]
```

### Step 3

User clicks Start.

```text
Collecting...

42 leads
```

### Step 4

User continues browsing/scrolling through results.

```text
42
↓
67
↓
91
↓
127
```

### Step 5

User clicks Stop.

```text
Collection completed

127 leads collected
3 duplicates skipped

[ View Leads ]
[ Export CSV ]
```

### Step 6

Lead dashboard:

```text
127 Leads

Business             Phone          Rating
────────────────────────────────────────────
Mobile Bangladesh    01342...       4.6
Rio International    01840...       4.1
Take & Talk BD       01842...       4.9
Gadget & Gear        01611...       4.4
```

### Step 7

User exports:

```text
Export
→ CSV
→ XLSX
→ JSON
```

---

# 92. Final Product Architecture

The long-term product should evolve into:

```text
                         ┌─────────────────────┐
                         │     Google Maps     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ LeadMap Extension   │
                         │                     │
                         │ Collection Engine   │
                         │ Extraction Engine   │
                         │ Deduplication       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Lead Database    │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
                Collections       Tags          Export
                     │              │              │
                     └──────────────┼──────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │   Cloud Dashboard   │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
             CRM/API            Bulk Email       Authorized
                                                   WhatsApp
```

---

# 93. Recommended MVP Priority

The development team should prioritize in exactly this order:

| Priority | Feature                       |
| -------- | ----------------------------- |
| P0       | Google Maps detection         |
| P0       | Search result detection       |
| P0       | Business extraction           |
| P0       | Lead storage                  |
| P0       | Deduplication                 |
| P0       | Start/Pause/Stop              |
| P0       | Side panel                    |
| P0       | Lead table                    |
| P0       | CSV export                    |
| P1       | Business detail enrichment    |
| P1       | XLSX export                   |
| P1       | JSON export                   |
| P1       | Collections                   |
| P1       | Search/filter/sort            |
| P1       | Collection history            |
| P2       | Tags                          |
| P2       | Notes                         |
| P2       | Lead status                   |
| P2       | Import                        |
| P2       | Cloud sync                    |
| P3       | Web dashboard                 |
| P3       | CRM integrations              |
| P3       | API                           |
| P3       | Team management               |
| P4       | AI lead scoring               |
| P4       | Outreach-platform integration |

---

# 94. Product Success Definition

LeadMap succeeds if a user can go from:

> **"I need a list of mobile shops in Dhaka."**

to:

> **"I have a clean, deduplicated spreadsheet containing the businesses I researched."**

with minimal manual copying.

The core product should therefore optimize for **three things above everything else:**

### 1. Reliable collection

```text
Google Maps → Leads
```

### 2. Clean data

```text
Raw listings → Structured + deduplicated leads
```

### 3. Fast workflow

```text
Search → Collect → Review → Export
```

That should be the **MVP**, before adding CRM, AI, cloud synchronization, email, WhatsApp, billing, or other complexity.
