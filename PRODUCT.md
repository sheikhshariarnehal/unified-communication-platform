# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16.3.4 (App Router, Server Actions, Route Handlers), Supabase (Postgres, Auth, Storage, Realtime), Tailwind CSS v4, TypeScript.

## Users

Businesses, agencies, marketing teams, e-commerce stores, and startups communicating with their customer base through Email and WhatsApp.
- **Small Businesses**: (restaurants, local stores, service providers) needing fast campaign creation, customer notifications, and contact management.
- **Marketing Teams**: needing advanced audience segmentation, A/B testing, visual automations, and detailed deliverability/conversion analytics.
- **Agencies**: managing multiple isolated client workspaces under unified credentials.
- **Developers**: needing REST API v1 and webhook integration for transactional messages.

## Product Purpose

A centralized multi-tenant customer communication platform allowing businesses to manage contacts, create audience segments, design templates, and send high-volume campaigns across Email and WhatsApp from one dashboard. It solves the friction of managing fragmented tools by combining audience management, cross-channel messaging, visual workflows, and delivery analytics into a single cohesive system.

## Positioning

"One audience. Two channels. One dashboard."
Unlike siloed email platforms (Mailchimp/Klaviyo) or separate WhatsApp bots, the platform treats Contacts and Audience Segments as the primary source of truth, routing messages through either Email (Resend/SES) or official WhatsApp Business Cloud API with shared analytics and cross-channel fallback logic.

## Operating Context

- Multi-tenant workspaces with complete data isolation (Row Level Security).
- High-volume asynchronous message dispatching via background queues.
- Webhook-driven event processing (delivered, opened, clicked, read, replied, bounced, complained).
- Visual template authoring (drag-and-drop block builder + raw HTML editor; WhatsApp approved message template editor).
- Real-time campaign tracking and analytics reporting.

## Capabilities and Constraints

- Next.js 16.3.4 (App Router, Server Actions, Route Handlers), Supabase (Postgres, Auth, Storage, Realtime), Tailwind CSS v4.
- Official WhatsApp Business Cloud API only (no unofficial automation or personal number scraping).
- Permission-based email marketing with strict compliance (SPF, DKIM, DMARC verification, automatic unsubscribe tokens, and suppression lists).
- AES-256 encrypted credential storage for provider API keys and WhatsApp tokens.
- Queue-backed dispatching (BullMQ/Redis) with exponential backoff and idempotency protection against duplicate sends.

## Brand Commitments

- Product Name: Unified Communication Platform
- Tone: Sleek, high-precision, professional, modern B2B SaaS.
- Aesthetic baseline: Curated dark mode, glassmorphic cards, crisp typography, clean micro-interactions, responsive desktop-first campaign builder.

## Evidence on Hand

- Complete 2,882-line Product Requirements Document at `PRD.md`.
- Architectural design blueprint and phased roadmap at `implementation_plan.md`.

## Product Principles

1. **Audience-Centric Simplicity**: Contacts, tags, lists, and segments are universal across all messaging channels.
2. **Channel Parity with Official Compliance**: Full support for both Email and WhatsApp via verified, official APIs without spam tolerance.
3. **Idempotency and Zero Duplicate Sends**: Never double-send messages during retries, network blips, or bulk queue processing.
4. **Instant Actionable Observability**: Every sent message provides clear delivery and engagement funnel metrics.
5. **Rock-Solid Multi-Tenancy**: Zero cross-workspace data leakage enforced at the database layer.

## Accessibility & Inclusion

- WCAG AA compliant contrast ratios across light and dark themes.
- Accessible form controls with keyboard navigation, aria labels, and screen-reader status updates.
