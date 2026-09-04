# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage, Edge Functions), Redis / BullMQ for async delivery queues, Meta WhatsApp Cloud API (Graph API v21+), and Resend / Amazon SES for email sending.

## Users

- **Primary**: Growth marketers, e-commerce store operators, agencies, and small-to-medium businesses (SMBs) running high-volume customer communications.
- **Secondary**: Developers needing unified REST API & webhooks for programmatic transactional & promotional messaging.
- **Workspace Roles**: Workspace Owner, Administrator, Marketing Manager, Staff.

## Product Purpose

A unified multi-tenant customer communication and marketing SaaS combining bulk Email and official WhatsApp Business messaging under a single dashboard, contact audience, segmentation engine, and automation workflow. Success means a business can manage contacts, schedule campaigns across both channels, monitor deliverability & reputation, and automate engagement without juggling disconnected tools.

## Positioning

"One audience. Two channels. One dashboard." Unlike single-channel bulk emailers or siloed WhatsApp marketing tools, this platform synchronizes contacts, suppression lists, automation journeys, and real-time deliverability scores across both Email and WhatsApp in a unified multi-tenant environment.

## Operating Context

- High-volume campaign scheduling and tracking.
- Contact lifecycle management (CSV/XLSX streaming import, dynamic segment rule evaluation, tag-based grouping).
- Deliverability monitoring: SPF/DKIM/DMARC domain verification, WhatsApp phone number health & tier limits, spam/bounce rate reputation index.
- Async queue processing for high-throughput message dispatch (BullMQ/Redis), preventing UI latency and ensuring idempotent retries.

## Capabilities and Constraints

- **Confirmed Capabilities**:
  - Multi-tenant workspace data isolation (`workspace_id` scoping across all tables).
  - Contacts management with custom JSONB fields, static lists, tags, dynamic segments, and suppression tracking (bounces, unsubs, spam complaints, WhatsApp STOP).
  - Email campaign builder (drag-and-drop block editor + raw HTML editor), domain DNS verification, tracking pixel, link click redirect.
  - Official WhatsApp Business Cloud API integration (WABA, template approval sync, variable parameter mapping, delivery/read webhooks).
  - Async sending queues with rate limiting, exponential backoff, and idempotency protection against duplicate sends.
  - Visual automation journeys (triggers, delays, condition branches, multi-channel actions).
  - Deliverability and sender reputation scoring engine (85.2% Good! score tracking).
  - Multi-tier SaaS billing with usage metering (Contacts, Email volume, WhatsApp volume).
- **Technical Constraints**:
  - Official WhatsApp Business Cloud API only (no unofficial web scraping or personal account automation).
  - Permission-based messaging with mandatory opt-out & suppression enforcement.

## Brand Commitments

- **Visual Authority**: `ref ui.jpg` defines the design standard — airy, serene glassmorphism (`backdrop-blur-xl bg-white/80 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]`), rounded bento-grid cards, pastel accent badges, radial reputation speedometer, and horizontal time-ruler campaign scheduler.
- **Tone**: Professional, fast, clean, reliable, and premium.

## Evidence on Hand

- `Product Requirements Document.md`: 2,882-line exhaustive PRD defining functional specs, data models, queue architectures, sprint phases, and acceptance criteria.
- `ref ui.jpg`: Ground-truth high-fidelity visual layout demonstrating Bento-grid cards, Quick Actions, Active Automations, Reputation Score speedometer gauge, KPI sparklines & arc gauges, Campaign Performance spline area chart, Deliverability Score metrics, and Scheduled Campaign timeline ruler.

## Product Principles

1. **One Source of Audience Truth**: Contacts, custom fields, and suppression states are unified across all messaging channels.
2. **Zero-Loss Asynchronous Architecture**: All dispatches, webhook ingests, and large file imports execute through durable, idempotent background queues.
3. **Radical Deliverability Transparency**: Real-time visibility into domain health, bounce rates, spam metrics, and account reputation.
4. **Premium Tactile UX**: Fluid glassmorphic aesthetics, zero-slop layout rhythm, and responsive micro-interactions that elevate operational clarity.
