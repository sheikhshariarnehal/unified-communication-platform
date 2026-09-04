# Product Requirements Document

# Unified Email & WhatsApp Communication Platform

**Document Version:** 1.0
**Status:** Final
**Product Type:** Multi-tenant SaaS
**Primary Channels:** Email + WhatsApp
**Target Users:** Businesses, agencies, marketers, e-commerce stores, startups, organizations
**Primary Goal:** Provide one centralized platform for managing contacts, creating campaigns, sending bulk communications, automating messaging, and analyzing results.

---

# 1. Executive Summary

The platform is a cloud-based communication and marketing SaaS that allows businesses to manage and communicate with their customers through **email and WhatsApp from one centralized dashboard**.

Users can:

* Import and manage contacts
* Create audience segments
* Connect email sending domains
* Connect WhatsApp Business accounts
* Create email campaigns
* Create WhatsApp campaigns
* Use reusable templates
* Personalize messages
* Schedule campaigns
* Monitor delivery
* Track opens, clicks, reads, replies and failures
* Build automated workflows
* Manage teams
* Manage API integrations
* Monitor usage and billing
* View detailed analytics

The platform should be designed as a **multi-tenant system**, meaning every business/workspace has isolated data, users, campaigns, contacts, credentials and billing information.

---

# 2. Product Vision

## Vision

Become a unified communication platform where businesses can manage their customer messaging across email and WhatsApp without needing multiple disconnected systems.

## Core Value Proposition

> **One audience. Two channels. One dashboard.**

Instead of requiring businesses to use separate tools for email marketing, WhatsApp messaging, contact management and analytics, the platform combines them into one system.

---

# 3. Product Goals

## Primary Goals

1. Provide an easy-to-use communication dashboard.
2. Allow businesses to safely manage large contact lists.
3. Support high-volume email campaigns.
4. Support WhatsApp Business messaging through approved/official integrations.
5. Provide powerful campaign analytics.
6. Provide personalization using contact data.
7. Provide campaign scheduling.
8. Provide audience segmentation.
9. Provide automation workflows.
10. Provide team/workspace management.
11. Provide API and webhook capabilities.
12. Provide subscription and usage-based billing.
13. Build strong abuse-prevention and compliance mechanisms.
14. Make the system scalable to millions of contacts and messages.

---

# 4. Non-Goals

The initial product will NOT attempt to:

* Replace full enterprise CRMs.
* Provide unofficial WhatsApp automation.
* Automate personal WhatsApp accounts.
* Provide spam/bulk messaging to users without appropriate permission.
* Scrape WhatsApp users.
* Circumvent WhatsApp messaging restrictions.
* Provide a complete customer-support ticketing system in V1.
* Build a full e-commerce platform.

---

# 5. Target Users

## 5.1 Small Businesses

Examples:

* Restaurants
* Online stores
* Local businesses
* Service providers
* Educational businesses
* Agencies

Needs:

* Simple campaigns
* Contact management
* Promotions
* Notifications
* Basic analytics

---

## 5.2 Marketing Teams

Needs:

* Segmentation
* Automation
* A/B testing
* Detailed analytics
* Team collaboration
* Multiple campaigns

---

## 5.3 Agencies

Agencies may manage multiple client businesses.

Needs:

* Multiple workspaces
* Client accounts
* Team permissions
* Usage tracking
* White-label capabilities in future

---

## 5.4 Developers

Needs:

* REST API
* Webhooks
* API keys
* Programmatic messaging
* Delivery events
* Integration with websites/apps

---

# 6. Product Structure

The platform consists of the following major modules:

```text
Platform
│
├── Authentication
├── Workspace
├── Dashboard
│
├── Contacts
│   ├── All Contacts
│   ├── Lists
│   ├── Segments
│   ├── Tags
│   ├── Import
│   └── Suppression
│
├── Email
│   ├── Campaigns
│   ├── Templates
│   ├── Sending Domains
│   └── Analytics
│
├── WhatsApp
│   ├── Accounts
│   ├── Templates
│   ├── Campaigns
│   └── Analytics
│
├── Campaigns
│
├── Automations
│
├── Analytics
│
├── Integrations
│
├── API
│
├── Team
│
├── Billing
│
└── Settings
```

---

# 7. User Roles

## Workspace Owner

Full access.

Permissions:

* Manage workspace
* Manage billing
* Manage users
* Manage integrations
* Manage campaigns
* Manage contacts
* Manage API keys
* Delete workspace

---

## Administrator

Almost full access.

Can:

* Manage campaigns
* Manage contacts
* Manage integrations
* Manage templates
* Manage team

Cannot:

* Delete workspace
* Transfer ownership
* Change critical billing ownership settings

---

## Marketing Manager

Can:

* Create campaigns
* Manage contacts
* Create templates
* View analytics
* Create automations

Cannot:

* Manage billing
* Delete workspace
* Manage API credentials

---

## Staff

Can:

* View contacts
* Create drafts
* View campaigns

Permissions should be configurable by workspace administrators.

---

# 8. Authentication

## Supported Methods

### Email/password

Fields:

* Name
* Email
* Password

Requirements:

* Email verification
* Strong password validation
* Password reset
* Session management

---

## Social Login

Future:

* Google
* Microsoft

---

## Two-Factor Authentication

Recommended for:

* Workspace owners
* Administrators

Methods may include:

* Authenticator app
* Email verification
* Security keys in future

---

# 9. Onboarding

After registration:

```text
Create Account
      ↓
Create Workspace
      ↓
Choose Business Type
      ↓
Import Contacts
      ↓
Connect Email
      ↓
Connect WhatsApp
      ↓
Create First Campaign
```

Onboarding should be skippable.

---

# 10. Workspace

Every business operates inside a workspace.

Workspace contains:

```text
Workspace
│
├── Users
├── Contacts
├── Campaigns
├── Templates
├── Automations
├── Integrations
├── Analytics
├── API Keys
├── Billing
└── Settings
```

All database records must be associated with a workspace ID.

---

# 11. Dashboard

The dashboard is the primary landing page.

## KPI Cards

Display:

* Total Contacts
* Emails Sent
* WhatsApp Messages Sent
* Email Delivery Rate
* Email Open Rate
* Email Click Rate
* WhatsApp Delivery Rate
* WhatsApp Read Rate

Example:

```text
Contacts       Emails Sent       WhatsApp Sent
12,450         84,250            31,820

Delivery       Open Rate         Click Rate
97.8%          42.3%             8.7%
```

---

## Dashboard Charts

### Message Volume

Filter:

* Today
* 7 days
* 30 days
* 90 days
* Custom

Display:

* Emails
* WhatsApp
* Total

---

## Campaign Performance

Show:

* Campaign name
* Channel
* Sent
* Delivered
* Opened/read
* Clicked
* Failed
* Date
* Status

---

## Recent Activity

Examples:

```text
Campaign "Summer Sale" completed.

2,340 emails delivered.

WhatsApp campaign started.

250 new contacts imported.

Domain verification completed.
```

---

# 12. Contacts Module

Contacts are a core part of the platform.

## Contact List

Columns:

* Checkbox
* Name
* Email
* Phone
* Status
* Tags
* Source
* Created date
* Last activity

Actions:

* Search
* Filter
* Sort
* Export
* Delete
* Add tag
* Add to segment
* Remove from segment

---

# 13. Contact Profile

Each contact should have a detailed profile.

```text
John Smith

Email:
john@example.com

Phone:
+880XXXXXXXXXX

Status:
Subscribed

Tags:
Customer
VIP

Created:
01 September 2026
```

---

## Activity Timeline

Show:

```text
Email sent
Email delivered
Email opened
Link clicked
WhatsApp delivered
WhatsApp read
Campaign replied
Tag added
```

---

# 14. Custom Contact Fields

Users can create custom fields.

Examples:

```text
First Name
Last Name
Email
Phone
Company
Country
City
Order ID
Customer Type
Membership
```

Custom fields support:

* Text
* Number
* Date
* Boolean
* Dropdown

---

# 15. Personalization

Messages should support variables.

Example:

```text
Hello {{first_name}},
```

Available variables:

```text
{{first_name}}
{{last_name}}
{{email}}
{{phone}}
{{company}}
{{country}}
{{custom_field}}
```

If data is missing, fallback values can be configured.

Example:

```text
Hello {{first_name | default:"Customer"}}
```

---

# 16. Contact Import

Supported:

* CSV
* XLSX
* Manual entry
* Copy/paste
* API

CSV mapping:

```text
CSV Column      Platform Field

First Name   →  first_name
Email        →  email
Phone        →  phone
Company      →  company
```

---

# 17. Import Validation

Before importing:

* Detect duplicate emails
* Detect duplicate phone numbers
* Validate email format
* Validate phone format
* Detect missing required fields
* Detect invalid rows

Show:

```text
Total rows:       10,000
Valid:             9,620
Duplicates:          280
Invalid:             100
```

User can download the error report.

---

# 18. Lists

Users can create static lists.

Example:

```text
Customers
Leads
Newsletter
VIP Customers
Students
```

A contact can belong to multiple lists.

---

# 19. Tags

Tags are flexible labels.

Examples:

```text
VIP
Customer
Lead
Trial
High Value
Bangladesh
Dhaka
```

Users can bulk apply/remove tags.

---

# 20. Segments

Segments are dynamic audiences based on rules.

Example:

```text
Segment:
VIP Customers

Rules:

Tag = Customer
AND
Total Orders > 5
```

Another:

```text
Email subscribed = true
AND
Country = Bangladesh
AND
Last Activity < 30 days
```

Segments should update automatically when contact data changes.

---

# 21. Suppression Lists

The platform must maintain suppression lists.

Types:

* Unsubscribed
* Email bounced
* Spam complaint
* WhatsApp opt-out
* Blocked contact
* Admin suppression

Suppressed contacts must automatically be excluded from applicable campaigns.

---

# 22. Email Module

The email module allows users to create and send campaigns.

Main pages:

```text
Email
│
├── Campaigns
├── Templates
├── Sending Domains
├── Suppression
└── Analytics
```

---

# 23. Email Campaign Creation

Campaign flow:

```text
Campaign Name
      ↓
Audience
      ↓
Sender
      ↓
Email Content
      ↓
Review
      ↓
Send/Schedule
```

---

# 24. Email Campaign Fields

Required:

* Campaign name
* Sender
* Sender email
* Subject
* Audience
* Content

Optional:

* Preview text
* Reply-to
* Tracking settings
* Schedule

---

# 25. Email Editor

The platform should support:

### Block Editor

Components:

* Text
* Heading
* Image
* Button
* Divider
* Spacer
* Social links
* Columns
* HTML
* Footer

Drag-and-drop functionality is preferred.

---

# 26. HTML Editor

Advanced users can edit raw HTML.

Requirements:

* HTML validation
* Preview
* Mobile preview
* Desktop preview

---

# 27. Email Preview

Provide:

```text
Desktop
Tablet
Mobile
```

Also provide:

* Send test email
* Preview personalization
* Spam-risk warnings where appropriate

---

# 28. Email Subject Personalization

Example:

```text
{{first_name}}, your special offer is waiting
```

---

# 29. Email Scheduling

Options:

* Send now
* Schedule date/time
* Schedule according to workspace timezone

Future:

* Recipient local time
* Send-time optimization

---

# 30. Email Campaign States

```text
Draft
Scheduled
Queued
Sending
Completed
Paused
Cancelled
Failed
```

---

# 31. Email Delivery Tracking

Track:

* Sent
* Delivered
* Bounced
* Failed
* Opened
* Clicked
* Unsubscribed
* Spam complaint

---

# 32. Email Analytics

Campaign report:

```text
Sent              25,000
Delivered         24,400
Bounced              600
Opened             10,500
Clicked             2,100
Unsubscribed           85
```

Metrics:

```text
Delivery Rate
Bounce Rate
Open Rate
Click Rate
Click-to-Open Rate
Unsubscribe Rate
Complaint Rate
```

---

# 33. Email Sending Domains

Users should be able to connect their own domain.

Example:

```text
example.com
```

DNS verification should support required email-authentication records such as:

* SPF
* DKIM
* DMARC

UI:

```text
Domain: example.com

SPF       ✓ Verified
DKIM      ✓ Verified
DMARC     ⚠ Recommended
```

---

# 34. WhatsApp Module

WhatsApp messaging must use an **official WhatsApp Business/Cloud API or authorized provider integration**.

The system must not depend on automating personal WhatsApp accounts.

Pages:

```text
WhatsApp
│
├── Accounts
├── Templates
├── Campaigns
├── Contacts
└── Analytics
```

---

# 35. WhatsApp Account Connection

Users should be able to connect their business messaging account.

Store:

* Business account identifier
* Phone number identifier
* Display name
* Connection status
* Provider metadata

Sensitive credentials/tokens must be encrypted.

---

# 36. WhatsApp Templates

Users can create/manage approved message templates according to WhatsApp's applicable business messaging requirements.

Template fields:

```text
Name
Category
Language
Header
Body
Footer
Buttons
Variables
```

Example:

```text
Hello {{1}},

Your order {{2}} has been shipped.

Track your order:
{{3}}
```

---

# 37. WhatsApp Campaign Creation

Flow:

```text
Campaign Name
      ↓
Audience
      ↓
WhatsApp Account
      ↓
Template
      ↓
Variable Mapping
      ↓
Preview
      ↓
Review
      ↓
Send/Schedule
```

---

# 38. WhatsApp Variable Mapping

Example:

```text
{{1}} → First Name
{{2}} → Order ID
{{3}} → Tracking URL
```

Before sending, the system should validate that required variables exist.

---

# 39. WhatsApp Campaign Analytics

Track:

* Queued
* Sent
* Delivered
* Read
* Failed
* Replied

Example:

```text
Sent:          10,000
Delivered:      9,720
Read:           8,900
Failed:           280
Replies:        1,100
```

---

# 40. Unified Campaign System

The platform should eventually allow one campaign to use multiple channels.

Example:

```text
Campaign:
Black Friday Sale

Audience:
5,000 customers

Channels:

✓ Email
✓ WhatsApp
```

Campaign analytics:

```text
                 Email      WhatsApp

Sent             5,000       5,000
Delivered        4,850       4,920
Opened/Read      2,300       4,100
Clicked          650          900
Failed           150           80
```

---

# 41. Templates

Central template management.

Categories:

```text
Email Templates
WhatsApp Templates
```

Template actions:

* Create
* Edit
* Duplicate
* Preview
* Archive
* Delete

---

# 42. Automations

Automation is a major future differentiator.

Users create workflows based on triggers.

## Triggers

Examples:

```text
Contact added
Contact subscribed
Tag added
Form submitted
Purchase event received
API event received
Campaign completed
```

---

# 43. Automation Actions

Actions:

```text
Send Email
Send WhatsApp
Wait
Add Tag
Remove Tag
Move to List
Webhook
Condition
```

---

# 44. Automation Conditions

Example:

```text
Contact added
      ↓
Send Welcome Email
      ↓
Wait 2 days
      ↓
Email opened?
    /     \
  YES      NO
   ↓        ↓
WhatsApp   Email
```

---

# 45. Automation Builder

Visual node-based editor.

Components:

```text
Trigger
Action
Delay
Condition
Branch
End
```

Users should be able to drag nodes and connect them visually.

---

# 46. Analytics

Analytics should have both workspace-level and campaign-level reporting.

## Workspace Analytics

Metrics:

* Messages sent
* Delivery rate
* Open rate
* Click rate
* Read rate
* Reply rate
* Bounce rate
* Unsubscribe rate

---

# 47. Analytics Filters

Filters:

* Date range
* Channel
* Campaign
* Audience
* Tag
* Country
* Device
* Sender

---

# 48. Campaign Comparison

Users should be able to compare campaigns.

Example:

```text
Campaign A
Open Rate: 42%

Campaign B
Open Rate: 51%

Campaign C
Open Rate: 38%
```

---

# 49. A/B Testing

Future feature.

Test:

* Subject
* Email content
* CTA
* Send time

Example:

```text
Variant A → 50%
Variant B → 50%

Winner:
Variant B
```

---

# 50. Integrations

Integration system should support:

### Initial

* REST API
* Webhooks

### Future

* Shopify
* WooCommerce
* WordPress
* Zapier
* Make
* Google Sheets
* CRM systems

---

# 51. API

Provide versioned REST API.

Base:

```text
/api/v1/
```

Resources:

```text
/contacts
/lists
/segments
/campaigns
/messages
/templates
/automations
/webhooks
/usage
```

---

# 52. API Authentication

Use API keys.

Example:

```text
pk_live_xxxxxxxxx
```

Secrets must only be displayed once where appropriate.

Users should be able to:

* Create key
* Revoke key
* Rotate key
* Assign permissions

---

# 53. Webhooks

Webhook events:

```text
contact.created
contact.updated

email.sent
email.delivered
email.bounced
email.opened
email.clicked

whatsapp.sent
whatsapp.delivered
whatsapp.read
whatsapp.failed
whatsapp.replied

campaign.started
campaign.completed
```

Webhook configuration:

```text
URL
Events
Secret
Status
```

---

# 54. Team Management

Workspace owners can invite users.

Invitation:

```text
Email
Role
Permissions
```

User states:

```text
Invited
Active
Suspended
Removed
```

---

# 55. Audit Logs

Every important action should be recorded.

Examples:

```text
User created campaign
User deleted contact
Admin changed billing plan
API key created
WhatsApp account connected
Campaign scheduled
Campaign cancelled
```

Fields:

```text
User
Action
Resource
Timestamp
IP/device metadata where appropriate
```

---

# 56. Billing

The billing system should support subscription plans and usage limits.

Example plans:

## Free

```text
1,000 contacts
1,000 email messages/month
Basic analytics
1 workspace user
```

## Starter

```text
10,000 contacts
25,000 email messages
WhatsApp support
5 team members
Automation
```

## Business

```text
50,000 contacts
100,000 email messages
WhatsApp
Unlimited campaigns
Advanced analytics
10 team members
API
```

## Enterprise

Custom:

* Contact limits
* Message volume
* Team size
* Dedicated support
* Custom agreements

Actual pricing should be configured separately from this PRD.

---

# 57. Usage Metering

Track usage in real time.

Metrics:

```text
Contacts
Emails
WhatsApp messages
API requests
Storage
Team members
```

Dashboard:

```text
Email Usage

84,250 / 100,000
84.25%
```

---

# 58. Usage Alerts

Notify users when usage reaches:

```text
70%
80%
90%
100%
```

Users can configure notifications.

---

# 59. Billing Page

Show:

```text
Current Plan
Usage
Billing Cycle
Payment Method
Invoices
Plan Upgrade
Plan Downgrade
Cancellation
```

---

# 60. Notifications

Notification center should show:

```text
Campaign completed
Campaign failed
Domain verified
WhatsApp account connected
Usage limit reached
Payment failed
Automation error
```

---

# 61. Email Compliance

The platform should include mechanisms for permission-based email marketing.

Requirements include:

* Unsubscribe mechanism
* Suppression management
* Bounce handling
* Complaint handling
* Sender identification
* Audit records
* Consent/source tracking where applicable

The platform should not intentionally facilitate spam.

---

# 62. WhatsApp Compliance

WhatsApp messaging must follow applicable Meta/WhatsApp Business requirements.

The platform should enforce appropriate controls around:

* Business account connection
* Approved templates where required
* Opt-out handling
* Messaging permissions
* Rate/quality restrictions
* Account status
* Abuse prevention

---

# 63. Abuse Prevention

This is a critical system.

The platform should detect suspicious behavior such as:

* Extremely rapid campaign creation
* Large imported lists with poor quality
* High bounce rates
* High complaint rates
* Repeated failed messaging
* Suspicious account creation patterns
* Repeated opt-out attempts
* API abuse

Possible actions:

```text
Warning
↓
Rate Limit
↓
Campaign Review
↓
Temporary Restriction
↓
Account Suspension
```

---

# 64. Sending Architecture

The platform should not send thousands of messages directly from the web request.

Use asynchronous queues.

```text
User
 ↓
API
 ↓
Campaign
 ↓
Message Queue
 ↓
Workers
 ↓
Email / WhatsApp Provider
 ↓
Provider Webhook
 ↓
Event Processor
 ↓
Analytics
```

---

# 65. Queue System

Recommended:

```text
Redis
+
BullMQ
```

Queues:

```text
email-send
whatsapp-send
webhook-processing
analytics
automation
imports
exports
notifications
```

---

# 66. Retry System

Temporary failures should be retried.

Example:

```text
Attempt 1
   ↓
Failed
   ↓
Wait
   ↓
Attempt 2
   ↓
Failed
   ↓
Attempt 3
   ↓
Permanent Failure
```

Use exponential backoff.

Permanent errors should not be endlessly retried.

---

# 67. Idempotency

Every message should have a unique identifier.

Example:

```text
message_id
campaign_id
contact_id
provider_message_id
```

The system must prevent accidental duplicate sending during retries.

---

# 68. Database Architecture

Recommended:

**PostgreSQL**

Core tables:

```text
users
workspaces
workspace_members
contacts
contact_custom_fields
contact_tags
tags
lists
list_members
segments
campaigns
campaign_recipients
messages
email_messages
whatsapp_messages
email_templates
whatsapp_templates
sending_domains
whatsapp_accounts
automations
automation_nodes
automation_runs
api_keys
webhooks
webhook_deliveries
subscriptions
usage_records
invoices
audit_logs
notifications
suppression_entries
```

---

# 69. Multi-Tenant Data Isolation

Every tenant-owned table should contain:

```text
workspace_id
```

Application-level authorization must ensure users can only access records belonging to their workspace.

Never rely solely on frontend restrictions.

---

# 70. Security

Requirements:

* HTTPS everywhere
* Encrypted credentials
* Password hashing
* Secure session management
* CSRF protection where applicable
* Rate limiting
* Input validation
* SQL injection protection
* XSS protection
* Authorization checks
* Secret rotation
* Audit logging

---

# 71. Sensitive Data

Sensitive credentials such as:

* API keys
* WhatsApp tokens
* Provider credentials

must be encrypted at rest.

Application logs must never expose secrets.

---

# 72. Backup

Database:

* Automated backups
* Point-in-time recovery where supported
* Backup monitoring

Critical configuration should have redundancy.

---

# 73. Performance Requirements

Dashboard:

**Target:** under 2 seconds for normal cached requests.

Contact search:

**Target:** under 500 ms for common queries.

Campaign creation:

Should return immediately after queueing.

Large operations must be asynchronous.

Example:

```text
Import 1,000,000 contacts

UI:
"Import started"

Background:
Processing...

Completed:
982,430 imported
17,570 rejected
```

---

# 74. Scalability

The architecture should support horizontal scaling.

```text
              Load Balancer
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
      API 1      API 2      API 3
        │          │          │
        └──────────┼──────────┘
                   ▼
                Queue
             ┌─────┴─────┐
             ▼           ▼
          Worker 1     Worker 2
```

---

# 75. Frontend Technology

Recommended:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
React Query/TanStack Query
```

Dashboard should be responsive.

Supported:

* Desktop
* Tablet
* Mobile

The primary campaign-building experience can be desktop-first.

---

# 76. Backend Technology

Recommended:

```text
Node.js
TypeScript
NestJS
PostgreSQL
Redis
BullMQ
```

Alternative backend stacks are acceptable if architecture requirements are maintained.

---

# 77. Infrastructure

Suggested:

```text
Frontend
    ↓
CDN
    ↓
API
    ↓
PostgreSQL
Redis
Object Storage
Queue Workers
Email Provider
WhatsApp Provider
```

Object storage is used for:

* Images
* Attachments
* Import files
* Export files
* Template assets

---

# 78. Search

For the initial version, PostgreSQL search may be sufficient.

Future:

```text
OpenSearch / Elasticsearch
```

for very large datasets.

---

# 79. File Import/Export

Exports should be generated asynchronously.

Example:

```text
Export requested
       ↓
Background worker
       ↓
Generate CSV
       ↓
Upload to storage
       ↓
Notify user
```

Files should have expiration times.

---

# 80. Admin Panel

The platform owner needs a separate administration dashboard.

## Admin Dashboard

Metrics:

```text
Total Users
Active Workspaces
Messages Today
Email Volume
WhatsApp Volume
Revenue
Failed Campaigns
Abuse Alerts
```

---

# 81. Admin User Management

Admin can:

* Search users
* View account status
* Suspend account
* Restore account
* View workspace
* View usage
* View billing status

Admin should not casually expose message content unless required for legitimate operational/support purposes and governed by privacy controls.

---

# 82. Admin Workspace Management

Admin can view:

```text
Workspace
Owner
Plan
Contacts
Messages
Usage
Status
Created Date
```

Actions:

* Suspend
* Restrict
* Restore
* Change limits
* Add internal notes

---

# 83. Admin Abuse Center

Display:

```text
Risk Level
Account
Reason
Bounce Rate
Complaint Rate
Message Volume
Recent Activity
```

Possible statuses:

```text
Normal
Review
Restricted
Suspended
```

---

# 84. Campaign Review System

For risky accounts/campaigns, administrators can place campaigns into review.

```text
Draft
 ↓
Risk Check
 ↓
Approved → Queue
 ↓
Review → Manual Decision
```

---

# 85. UX Principles

The product should feel:

* Professional
* Fast
* Clean
* Modern
* Reliable
* Simple for beginners
* Powerful for advanced users

Avoid overwhelming users with technical settings during initial onboarding.

---

# 86. Main Navigation

Recommended sidebar:

```text
┌─────────────────────────┐
│ Logo                    │
│                         │
│ Dashboard               │
│                         │
│ Contacts                │
│                         │
│ Email                   │
│   Campaigns             │
│   Templates             │
│   Domains               │
│                         │
│ WhatsApp                │
│   Campaigns             │
│   Templates             │
│   Accounts              │
│                         │
│ Automations             │
│                         │
│ Analytics               │
│                         │
│ Integrations            │
│                         │
│ API                     │
│                         │
│ Team                    │
│ Billing                 │
│ Settings                │
└─────────────────────────┘
```

---

# 87. Global Search

Search across:

* Contacts
* Campaigns
* Templates
* Automations

Example:

```text
Search "John"

Contacts
Campaigns
Activity
```

---

# 88. Global Create Button

Top-level button:

```text
+ Create
```

Options:

```text
Email Campaign
WhatsApp Campaign
Automation
Contact
Template
Segment
```

---

# 89. Campaign UX

Campaign cards should show:

```text
Summer Sale

Email

Completed

25,000 sent
97.8% delivered

[View Report]
```

---

# 90. Empty States

Every major page should have a useful empty state.

Example:

```text
No campaigns yet.

Create your first campaign and start
communicating with your audience.

[Create Campaign]
```

---

# 91. Error Handling

Errors must be human-readable.

Bad:

```text
ERR_503_PROVIDER
```

Better:

```text
We couldn't connect to your email provider.
Please try again or reconnect your account.
```

---

# 92. Success Notifications

Examples:

```text
Campaign scheduled successfully.

2,450 contacts imported.

Email domain verified.

WhatsApp account connected.
```

---

# 93. MVP Scope

The first production MVP should include:

### Authentication

* Registration
* Login
* Password reset
* Email verification

### Workspace

* Create workspace
* Workspace settings
* Team members

### Contacts

* Contact CRUD
* CSV import
* Lists
* Tags
* Search
* Segments
* Suppression

### Email

* Sending integration
* Domain configuration
* Campaign creation
* Templates
* Personalization
* Scheduling
* Delivery tracking
* Analytics

### WhatsApp

* Official business account connection
* Template management
* Campaign creation
* Variable mapping
* Scheduling where supported
* Delivery/read tracking

### Dashboard

* KPIs
* Campaign overview
* Usage

### Billing

* Plans
* Usage limits
* Subscription status

### Security

* Authorization
* Rate limits
* Audit logs
* Abuse prevention

---

# 94. Phase 2

Add:

* Automation builder
* Advanced analytics
* API
* Webhooks
* A/B testing
* Better segmentation
* More integrations
* Advanced team permissions

---

# 95. Phase 3

Add:

* AI campaign assistant
* AI subject generation
* AI message generation
* Send-time optimization
* Advanced customer journeys
* CRM features
* Agency management
* White-label platform
* Mobile application

---

# 96. AI Features

Future AI assistant could allow:

> "Create a promotional campaign for customers who purchased in the last 30 days."

The AI could:

1. Identify appropriate segment.
2. Draft email.
3. Draft WhatsApp content.
4. Recommend template.
5. Suggest subject.
6. Generate campaign.
7. Ask user to review.
8. Schedule only after explicit confirmation.

AI should never independently send large campaigns without user confirmation and applicable safety/compliance checks.

---

# 97. Core User Journey

Example:

```text
User registers
      ↓
Creates workspace
      ↓
Imports 10,000 contacts
      ↓
Connects sending domain
      ↓
Connects WhatsApp Business
      ↓
Creates segment:
"Customers"
      ↓
Creates campaign
      ↓
Selects Email + WhatsApp
      ↓
Chooses audience
      ↓
Creates content
      ↓
Reviews campaign
      ↓
Schedules campaign
      ↓
Queue processes messages
      ↓
Providers send messages
      ↓
Webhooks report results
      ↓
Dashboard updates analytics
```

---

# 98. Critical System Events

The event architecture should support:

```text
contact.created
contact.updated
contact.deleted

campaign.created
campaign.scheduled
campaign.started
campaign.paused
campaign.completed
campaign.failed

message.queued
message.sent
message.delivered
message.failed

email.opened
email.clicked
email.unsubscribed

whatsapp.read
whatsapp.replied

automation.started
automation.completed
automation.failed
```

---

# 99. Acceptance Criteria

## Contacts

A user can:

* Import contacts
* Search contacts
* Filter contacts
* Create tags
* Create lists
* Create segments
* Export contacts
* Suppress contacts

---

## Email

A user can:

* Connect sending configuration
* Create email
* Select audience
* Personalize content
* Preview email
* Send test
* Schedule campaign
* View results

---

## WhatsApp

A user can:

* Connect an official business account
* View approved templates
* Map variables
* Select contacts
* Schedule/send supported campaigns
* View delivery/read results

---

## Analytics

A user can:

* View campaign statistics
* Filter by date
* Compare campaigns
* View delivery metrics
* View engagement metrics

---

# 100. Important Reliability Requirements

The platform must prevent:

* Duplicate campaign sends
* Duplicate message sends
* Cross-workspace data leakage
* Unauthorized campaign sending
* Accidental deletion without confirmation
* Infinite retry loops
* Queue deadlocks
* Lost webhook events

Critical operations should be idempotent.

---

# 101. Observability

The backend should include:

### Logs

* API logs
* Worker logs
* Provider errors
* Authentication events
* Billing events

### Metrics

* Queue depth
* Messages/second
* Error rate
* API latency
* Database latency
* Worker health

### Alerts

Alert engineering when:

* Queue backlog becomes abnormal
* Provider failure rate spikes
* Database errors increase
* API latency increases
* Workers stop processing
* Webhooks fail repeatedly

---

# 102. Disaster Recovery

Requirements:

* Automated database backup
* Recovery testing
* Redundant workers
* Provider failure handling
* Queue persistence
* Infrastructure monitoring

---

# 103. Data Retention

The system should define configurable retention policies for:

* Campaign events
* Webhook events
* Logs
* Deleted contacts
* Export files

Retention should balance analytics needs, privacy requirements and storage costs.

---

# 104. Privacy

The platform should provide:

* Privacy policy
* Data export mechanisms
* Contact deletion
* Workspace deletion
* Access controls
* Data retention controls
* Appropriate consent/source tracking

Where applicable, the implementation should be designed to support privacy obligations such as data-access and deletion requests.

---

# 105. Success Metrics

## Product Metrics

### Activation

Percentage of new users who:

1. Create workspace
2. Import contacts
3. Connect sending channel
4. Create first campaign

---

## Engagement

Track:

* Campaigns per workspace
* Messages sent
* Contacts managed
* Automations created
* Weekly active workspaces

---

## Business Metrics

Track:

* Monthly recurring revenue
* Average revenue per workspace
* Paid conversion rate
* Churn
* Customer lifetime value

---

## Messaging Quality

Track:

* Email bounce rate
* Email complaint rate
* Email delivery rate
* WhatsApp delivery rate
* WhatsApp read rate
* Opt-out rate

---

# 106. Definition of Done

A feature is considered complete when:

* Frontend implemented
* Backend implemented
* Database migrations completed
* Authorization implemented
* Validation implemented
* Error handling implemented
* Loading states implemented
* Empty states implemented
* Audit events added where required
* Tests completed
* Security reviewed
* Analytics events implemented
* Documentation completed

---

# 107. Recommended Development Order

## Sprint 1 — Foundation

```text
Project setup
Authentication
Database
Workspace
User roles
UI system
```

## Sprint 2 — Contacts

```text
Contacts
CSV import
Tags
Lists
Search
Segments
Suppression
```

## Sprint 3 — Email

```text
Email integration
Domain setup
Campaign builder
Templates
Personalization
Scheduling
```

## Sprint 4 — Email Analytics

```text
Queue
Workers
Webhooks
Delivery events
Analytics
```

## Sprint 5 — WhatsApp

```text
Business account connection
Templates
Campaign builder
Variable mapping
Messaging
Webhooks
Analytics
```

## Sprint 6 — SaaS

```text
Billing
Usage
Plans
Team management
Audit logs
Admin panel
```

## Sprint 7 — Automation

```text
Automation engine
Visual builder
Triggers
Conditions
Actions
```

## Sprint 8 — API & Scale

```text
REST API
API keys
Webhooks
Rate limiting
Scaling
Monitoring
```

---

# 108. Final MVP Architecture

```text
                         USERS
                           │
                           ▼
                    ┌─────────────┐
                    │  Next.js UI │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ API / Auth  │
                    └──────┬──────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        Contacts       Campaigns       Billing
             │             │
             │             ▼
             │        Message Queue
             │             │
             │       ┌─────┴─────┐
             │       ▼           ▼
             │   Email Worker  WhatsApp Worker
             │       │           │
             │       ▼           ▼
             │   Email API    WhatsApp API
             │       │           │
             │       └─────┬─────┘
             │             │
             │        Webhooks
             │             │
             └─────────────┤
                           ▼
                     Event Processor
                           │
                           ▼
                      PostgreSQL
                           │
                           ▼
                       Analytics
```

---

# 109. Final Product Positioning

The product should not be positioned merely as a:

> "Bulk email sender."

Instead:

> **A unified customer communication platform for email and WhatsApp.**

The long-term product hierarchy should be:

```text
CONTACTS
    ↓
AUDIENCE
    ↓
CAMPAIGNS
    ↓
MESSAGING
    ↓
AUTOMATION
    ↓
ANALYTICS
    ↓
CUSTOMER COMMUNICATION PLATFORM
```

The most important strategic decision is to build the **contact + campaign + event architecture correctly from day one**. Email and WhatsApp are channels sitting on top of that core system. This makes it much easier to add SMS, push notifications, voice or other channels later without rebuilding the entire platform.

# 110. Final Feature Map

```text
                    ┌───────────────────────────┐
                    │       PLATFORM            │
                    └─────────────┬─────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
      CONTACTS                 CAMPAIGNS              CHANNELS
          │                       │                       │
     ┌────┼────┐             ┌────┼────┐            ┌────┴────┐
     ▼    ▼    ▼             ▼    ▼    ▼            ▼         ▼
   Lists Tags Segments     Email WhatsApp Auto     Email    WhatsApp
                                      │
                                      ▼
                                 AUTOMATIONS
                                      │
                                      ▼
                                  ANALYTICS
                                      │
                 ┌────────────────────┼──────────────────┐
                 ▼                    ▼                  ▼
                API               WEBHOOKS            BILLING
                 │                    │                  │
                 └────────────────────┼──────────────────┘
                                      ▼
                              ADMIN / SECURITY
```

## Product Success Definition

The platform succeeds when a business can go from:

**"I have 10,000 customers"**

to:

**"I can organize them, segment them, create a personalized email + WhatsApp campaign, schedule it, send it reliably, track every result, and automate future communication—all without leaving this dashboard."**

That is the core product.
