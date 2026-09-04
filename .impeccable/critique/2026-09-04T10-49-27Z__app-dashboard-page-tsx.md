---
target: app/(dashboard)/page.tsx
total_score: 31
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-04T10-49-27Z
slug: app-dashboard-page-tsx
---
# Critique: Dashboard Overview (`app/(dashboard)/page.tsx`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Real-time delivery badges and operational channel drivers are clear; however, the message volume bar chart lacks interactive hover tooltips displaying precise counts. |
| 2 | Match System / Real World | 4 | Standard industry metrics (Delivery Rate, Open Rate, Read Rate, DKIM/SPF, WABA Tier 2) follow domain conventions fluently. |
| 3 | User Control and Freedom | 3 | Time-range selector (`7D`, `30D`, `90D`) and header action menu work well; the campaigns table lacks inline search, channel filtering, and pagination. |
| 4 | Consistency and Standards | 3 | Cohesive token-driven layout and typography; minor residual dark gradient utility in the blast card (`from-indigo-950/40`) breaks light-mode purity. |
| 5 | Error Prevention | 3 | Channel dispatcher health states prevent sending on inactive gateways; no proactive warning threshold when delivery drops below 95%. |
| 6 | Recognition Rather Than Recall | 3 | Visual channel icons (`Mail`, `MessageSquare`, `SendHorizontal`) accompany badges; table report links do not distinguish between email vs WhatsApp report formats. |
| 7 | Flexibility and Efficiency | 3 | Global create menu and primary CTA accelerate campaign launch; lacks keyboard shortcuts (`c` for new campaign, `/` for search) and table quick actions. |
| 8 | Aesthetic and Minimalist Design | 3 | Warm champagne `#fee6be` primary CTA buttons with crisp black text provide AAA contrast; 8 KPI cards presented simultaneously in a 4-column row push cognitive chunking limits. |
| 9 | Error Recovery | 3 | Dispatcher connection issues provide direct links to settings; campaign failures in table show status cleanly. |
| 10 | Help and Documentation | 3 | Contextual subheadings explain sections; lacks inline glossary/tooltips explaining technical terms like "DKIM/SPF" or "Tier 2" to non-technical users. |
| **Total** | | **31/40** | **Good (Address weak areas, solid foundation)** |

---

## Design Specificity Verdict

- **LLM Assessment**: The dashboard is tailored specifically to a dual-channel Email & WhatsApp SaaS platform rather than a generic analytics template. The side-by-side dispatcher status cards (Resend/SES Driver and WhatsApp Cloud API with WABA ID), stacked volume comparison bars, and unified blast callout reinforce the product's unique value proposition ("One audience. Two channels. One dashboard."). The primary area for refinement is reducing extraneous visual density from 8 simultaneous KPI cards and optimizing text link contrast in light mode.
- **Deterministic Scan**: Ran `detect.mjs` on `app/(dashboard)/page.tsx` and layout components. The scan returned `[]` (0 mechanical anti-patterns, 0 contrast bugs, 0 layout anomalies).
- **Browser Evidence**: Browser subagent inspected `http://localhost:3000` in both Dark Mode (`#09090b` canvas with elevated cards) and Light Mode (`#ffffff`/`#f8f9fa` canvas). Primary buttons (`+ Create`, `+ New Campaign`, active `30D`) with solid `#fee6be` fill and pure black text achieve WCAG AAA contrast in both modes. Inline text-only links using `--primary` directly on white background in light mode appear in pale champagne and should be deepened for text contrast.

---

## Overall Impression

A polished, high-velocity B2B communication dashboard with cohesive typography (`Inter`), structured card surfaces, and clear channel differentiation. Solid buttons and badges look state-of-the-art; the main opportunities are grouping the 8 KPI metrics by channel to lower cognitive load, adding interactive chart tooltips, and tuning light-mode text link contrast.

---

## What's Working

1. **Dual-Channel Clarity**: Visual separation of Email (warm champagne accent) and WhatsApp (emerald green) across badges, stacked volume bars, and dispatcher cards immediately reinforces channel duality without confusing the user.
2. **Accessible Solid CTAs**: Using `#fee6be` as a solid button fill paired with `text-primary-foreground: oklch(0 0 0)` delivers high visual prominence and WCAG AAA legibility in both dark and light modes.
3. **Channel Dispatcher Transparency**: Real-time status cards showing DKIM/SPF verification and Meta Cloud API tier limits give marketing teams immediate confidence before broadcasting.

---

## Priority Issues

- **[P1] Light-Mode Text Link Contrast**:
  - *Why it matters*: While `#fee6be` has AAA contrast with black text when used as a button background, using `text-primary` directly for small text links (*"Explore Unified Blasts"*, *"View All Campaigns"*, *"Report"*) against a white background in light mode produces a pale champagne tint with low contrast ratio (< 2:1).
  - *Fix*: Keep `#fee6be` for solid button backgrounds, badges, and dark-mode accents; for light-mode text links, use a darker amber/ochre token or `text-foreground font-semibold hover:underline`.
  - *Suggested command*: `/impeccable colorize` or `/impeccable polish`

- **[P2] KPI Metric Overload (Cognitive Chunking Violation)**:
  - *Why it matters*: 8 KPI cards displayed in an unsegmented 4x2 grid violate Cowan's working memory rule (≤4 items per group). Users must scan across both channels simultaneously to find what they need.
  - *Fix*: Group KPIs into two clear tabs or sub-sections: **Channel Deliverability** (Email Delivery, Open Rate, Click Rate vs WhatsApp Delivery, Read Rate) and **Growth & Volume** (Total Contacts, Emails Sent, WhatsApp Sent).
  - *Suggested command*: `/impeccable layout`

- **[P3] Static Bar Chart Interactivity**:
  - *Why it matters*: The message volume bar chart shows proportional heights but lacks exact numerical tooltips on hover or scrub, forcing users to guess daily message volumes.
  - *Fix*: Add hover tooltips displaying date, email count, and WhatsApp count for each day bar.
  - *Suggested command*: `/impeccable animate` or `/impeccable polish`

- **[P3] Residual Hardcoded Dark Utility in Unified Blast Card**:
  - *Why it matters*: The blast callout card contains `from-indigo-950/40 via-slate-900/80 to-slate-900`, which renders as an artificial dark patch when the user toggles to Light Mode.
  - *Fix*: Replace with `bg-gradient-to-br from-primary/10 via-card to-secondary border border-primary/20`.
  - *Suggested command*: `/impeccable polish`

---

## Persona Red Flags

- **Alex (Impatient Power User)**:
  - *Red Flag*: No keyboard shortcuts on the overview page. Alex expects to press `C` to launch a new campaign, `/` to focus search, or `E` to view email campaigns.
  - *Red Flag*: Recent Campaigns table lacks quick inline actions (e.g. duplicate campaign, pause sending, or resend failed recipients).
- **Jordan (Confused First-Timer)**:
  - *Red Flag*: In the channel dispatchers card, terms like "DKIM/SPF ✓" and "Tier 2 (10k/day)" are displayed without explanatory tooltips or help links. Jordan does not know if Tier 2 is sufficient for their list size.
  - *Red Flag*: The difference between "Email Delivery Rate" and "WhatsApp Read Rate" has no helper definition explaining that WhatsApp tracks read receipts whereas email tracks open pixels.

---

## Minor Observations

- The table row border uses `divide-slate-800/60`; switching to `divide-border` ensures unified theme adaptability.
- Time range switcher (`7D`, `30D`, `90D`) updates state cleanly, but hook integration with actual historical query parameters will complete the experience.
- The Quota Meter in the sidebar footer (`84,250 / 100,000 sent`) provides great reassurance before triggering campaigns.

---

## Questions to Consider

- What if the Message Volume Trends chart allowed toggling between total volume and percentage delivery rate?
- Could the 8 KPI cards collapse into two summary cards with expandable channel drill-downs?
- Should the "New Campaign" button default to a quick modal allowing immediate choice between Email, WhatsApp, or Unified Blast?
