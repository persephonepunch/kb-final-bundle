# Product Requirements Document (PRD)
## 11ty + Shopify UCP Catalog + Google AI Integration

**Version:** 1.1
**Date:** January 14, 2026
**Author:** Manus AI
**Target Audience:** Claude AI, Development Teams
**Includes:** API Endpoint Schema Maps for Users, Products, UCP, Idempotency, Webhooks

---

## Executive Summary

This PRD defines the requirements for building a complete e-commerce knowledge base and product catalog system using Eleventy (11ty) as the static site generator, Shopify's Universal Commerce Protocol (UCP) Catalog as the product data source, and Google AI for real-time analytics and personalization.

**Architecture Overview:**
- **Webflow** serves as a **Design Module only** - a visual design tool for creating component layouts
- **CI/CD Pipeline** publishes Webflow design components to both **11ty templates** and **Shopify Native** (mirrored front end)
- **Xano/n8n** provides middleware orchestration for runtime data flows

---

## 1. Product Vision

### 1.1 Problem Statement

Modern e-commerce requires:
- **Fast, SEO-optimized product pages** that can be generated at scale
- **Real-time product data** from centralized commerce platforms
- **AI-powered personalization** based on user behavior
- **Flexible front-end** that can be managed by non-technical teams
- **Consent-aware data tracking** that respects user privacy

### 1.2 Solution Overview

Build a static site generator pipeline that:
1. Fetches product data from Shopify UCP Catalog via GraphQL at build time
2. Generates optimized HTML pages for each product using 11ty
3. Tracks user sessions and consent on the client-side
4. Streams interaction data to Google AI via middleware
5. Enables real-time personalization and analytics

### 1.3 Success Criteria

- **Build Performance:** Generate 1000+ product pages in under 5 minutes
- **Page Load Speed:** First Contentful Paint < 1.5s
- **SEO Score:** Lighthouse SEO score > 95
- **Data Accuracy:** 100% sync between Shopify and generated pages
- **Consent Compliance:** GDPR/CCPA compliant consent management

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   DESIGN TIME (Webflow Design Module)           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Webflow Design Module                                   │ │
│  │  - Visual component design (layouts, typography)         │ │
│  │  - No runtime logic - design assets only                 │ │
│  │  - Exportable design tokens and structure                │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ CI/CD Design Component Publish
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUILD TIME (Dual Target)                    │
│                                                                 │
│  ┌────────────────────────┐      ┌────────────────────────┐   │
│  │   11ty Templates       │      │   Shopify Native       │   │
│  │   + GraphQL Mapping    │      │   (Mirror Front End)   │   │
│  └────────────────────────┘      └────────────────────────┘   │
│            │                               │                    │
│            │                               │                    │
│            ▼                               ▼                    │
│  ┌──────────────┐  GraphQL   ┌──────────────────────┐         │
│  │   11ty       │ ─────────> │  Shopify UCP         │         │
│  │   Build      │ <───────── │  Catalog API         │         │
│  │   Process    │  Products  │  (GraphQL)           │         │
│  └──────────────┘            └──────────────────────┘         │
│         │                                                       │
│         │ Generate Static HTML                                 │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Static Site (_site/)                                    │ │
│  │  - index.html                                            │ │
│  │  - products/product-1/index.html                         │ │
│  │  - products/product-2/index.html                         │ │
│  │  - css/main.css                                          │ │
│  │  - js/main.js (UCP Session Manager)                     │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Deploy
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RUNTIME (Client-Side)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  User Browser                                            │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Static HTML + CSS + JS                            │ │ │
│  │  │  - UCP Session Manager                             │ │ │
│  │  │  - Consent Management UI                           │ │ │
│  │  │  - Event Tracking                                  │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ Webhook (POST)                   │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Middleware (Xano/n8n)                                   │ │
│  │  - Receive webhook                                       │ │
│  │  - Validate & transform data                            │ │
│  │  - Idempotency checks                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                    │                    │                       │
│                    │                    │                       │
│         ┌──────────┘                    └──────────┐           │
│         ▼                                          ▼           │
│  ┌─────────────────┐                    ┌──────────────────┐  │
│  │  Shopify        │                    │  Google AI       │  │
│  │  Metaobjects    │                    │  Data Stream     │  │
│  │  - Customer     │                    │  - Analytics     │  │
│  │  - Consent      │                    │  - ML Models     │  │
│  │  - History      │                    │  - Predictions   │  │
│  └─────────────────┘                    └──────────────────┘  │
│         │                                          │           │
│         └──────────────────┬───────────────────────┘           │
│                            │                                   │
│                            ▼                                   │
│                  ┌──────────────────┐                          │
│                  │  WebSocket       │                          │
│                  │  Real-time       │                          │
│                  │  Updates         │                          │
│                  └──────────────────┘                          │
│                            │                                   │
│                            │ Push Updates                      │
│                            ▼                                   │
│                  ┌──────────────────┐                          │
│                  │  Client Browser  │                          │
│                  │  (Personalized   │                          │
│                  │   Content)       │                          │
│                  └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibilities

#### 2.2.0 Webflow Design Module
- **Purpose:** Visual design tool for creating component layouts (Design Time only)
- **Responsibilities:**
  - Create visual component designs (layouts, typography, spacing, colors)
  - Define design tokens (CSS variables, spacing units)
  - Export design structure for CI/CD pipeline
- **NOT responsible for:** Runtime logic, data fetching, user interactions
- **Output:** Design components exported via CI/CD to 11ty and Shopify Native

#### 2.2.1 11ty Build Process
- **Input:** Shopify UCP Catalog GraphQL API
- **Process:** 
  - Fetch all products via GraphQL queries
  - Generate static HTML pages using Nunjucks templates
  - Apply BEM CSS for styling
  - Include vanilla JavaScript for client-side functionality
- **Output:** Static site in `_site/` directory
- **Trigger:** Manual build, webhook from Shopify, scheduled builds

#### 2.2.2 Shopify UCP Catalog
- **Purpose:** Centralized product data source
- **API:** GraphQL Storefront API
- **Data Structure:**
  ```graphql
  {
    products {
      id
      title
      handle
      description
      priceRange { minVariantPrice { amount currencyCode } }
      images { url altText }
      variants { id title priceV2 availableForSale }
    }
  }
  ```

#### 2.2.3 Client-Side (Browser)
- **UCP Session Manager:** JavaScript module for session tracking
- **Consent Management:** UI for user consent preferences
- **Event Tracking:** Capture page views, clicks, form submissions
- **WebSocket Client:** Receive real-time updates from middleware

#### 2.2.4 Middleware (Xano/n8n)
- **Webhook Endpoint:** Receive POST requests from client
- **Data Transformation:** Convert client data to Shopify/Google AI formats
- **Idempotency:** Prevent duplicate processing
- **Orchestration:** Route data to appropriate backend services

#### 2.2.5 Shopify Metaobjects
- **Purpose:** Store custom user data
- **Schema:**
  - `consent_status: JSON`
  - `user_history: JSON`
  - `last_seen: DateTime`
- **Association:** Linked to customer records

#### 2.2.6 Google AI Data Stream
- **Purpose:** Real-time analytics and ML model training
- **Input:** User interaction events
- **Output:** Personalization recommendations, analytics dashboards

---

## 3. Functional Requirements

### 3.1 Build-Time Requirements

#### FR-1: GraphQL Data Fetching
**Priority:** P0 (Critical)

**Description:** The 11ty build process MUST fetch product data from Shopify UCP Catalog via GraphQL.

**Acceptance Criteria:**
- [ ] GraphQL client module created in `src/_data/graphqlClient.js`
- [ ] Products data file created in `src/_data/products.js`
- [ ] Collections data file created in `src/_data/collections.js`
- [ ] Error handling for API failures (return empty array, log error)
- [ ] Environment variables for API credentials (`.env` file)
- [ ] Support for pagination (fetch all products, not just first 100)

**Implementation Details:**
```javascript
// src/_data/graphqlClient.js
const fetch = require('node-fetch');
require('dotenv').config();

class GraphQLClient {
  constructor(endpoint, headers = {}) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    });
    
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data;
  }
}

module.exports = GraphQLClient;
```

#### FR-2: Parallel Page Generation
**Priority:** P0 (Critical)

**Description:** Generate individual product pages in parallel using 11ty pagination.

**Acceptance Criteria:**
- [ ] Pagination configured in product template frontmatter
- [ ] Each product generates to `/products/{handle}/index.html`
- [ ] SEO metadata included (title, description, Open Graph tags)
- [ ] Structured data (JSON-LD) for product schema
- [ ] Images optimized and lazy-loaded

**Implementation Details:**
```nunjucks
---
pagination:
  data: products
  size: 1
  alias: product
permalink: "/products/{{ product.handle }}/"
---
```

#### FR-3: Incremental Builds
**Priority:** P1 (High)

**Description:** Support incremental builds that only regenerate changed products.

**Acceptance Criteria:**
- [ ] Cache product data between builds
- [ ] Compare product `updatedAt` timestamps
- [ ] Only regenerate pages for updated products
- [ ] Build time < 30 seconds for incremental builds

### 3.2 Runtime Requirements

#### FR-4: UCP Session Management
**Priority:** P0 (Critical)

**Description:** Client-side JavaScript module to manage user sessions.

**Acceptance Criteria:**
- [ ] Generate unique session ID on first visit
- [ ] Store session data in `sessionStorage` or `localStorage`
- [ ] Track user events (page views, clicks, form submissions)
- [ ] Send webhooks to middleware on significant events
- [ ] Session data structure:
  ```javascript
  {
    sessionId: "session_123456",
    userId: "user_789",
    email: "user@example.com",
    consentStatus: {
      analytics: { granted: true, timestamp: "2026-01-14T12:00:00Z" },
      marketing: { granted: false, timestamp: "2026-01-14T12:00:00Z" }
    },
    userHistory: [
      { timestamp: "2026-01-14T12:01:00Z", type: "page_view", page: "/products/widget" }
    ]
  }
  ```

#### FR-5: Consent Management UI
**Priority:** P0 (Critical)

**Description:** User interface for managing consent preferences.

**Acceptance Criteria:**
- [ ] Consent banner displayed on first visit
- [ ] Checkboxes for different consent purposes (analytics, marketing)
- [ ] Save button to persist preferences
- [ ] Consent stored in session and sent to middleware
- [ ] GDPR/CCPA compliant (explicit opt-in, easy to revoke)

#### FR-6: Event Tracking
**Priority:** P1 (High)

**Description:** Track user interactions and send to middleware.

**Acceptance Criteria:**
- [ ] Track page views automatically
- [ ] Track button clicks (data-track attribute)
- [ ] Track form submissions
- [ ] Track add-to-cart events
- [ ] Debounce events to prevent spam
- [ ] Respect consent preferences (only track if consent granted)

#### FR-7: WebSocket Real-Time Updates
**Priority:** P2 (Medium)

**Description:** Receive real-time updates from middleware via WebSocket.

**Acceptance Criteria:**
- [ ] WebSocket client connects to middleware
- [ ] Authenticate with session ID
- [ ] Listen for personalization events
- [ ] Update UI dynamically (e.g., show recommended products)
- [ ] Reconnect on connection loss

### 3.3 Middleware Requirements

#### FR-8: Webhook Endpoint
**Priority:** P0 (Critical)

**Description:** Xano/n8n webhook endpoint to receive client events.

**Acceptance Criteria:**
- [ ] POST endpoint at `/api/webhook`
- [ ] Validate request signature (HMAC)
- [ ] Parse JSON payload
- [ ] Return 200 OK immediately (async processing)
- [ ] Rate limiting (max 100 requests/minute per session)

#### FR-9: Data Transformation
**Priority:** P0 (Critical)

**Description:** Transform client data to Shopify and Google AI formats.

**Acceptance Criteria:**
- [ ] Map client session data to Shopify customer fields
- [ ] Map events to Google AI event schema
- [ ] Enrich data with IP geolocation
- [ ] Add timestamps in ISO 8601 format
- [ ] Handle missing fields gracefully

#### FR-10: Idempotency
**Priority:** P0 (Critical)

**Description:** Prevent duplicate processing of events.

**Acceptance Criteria:**
- [ ] Generate idempotency key: `{sessionId}_{eventType}_{timestamp}`
- [ ] Check database for existing key before processing
- [ ] Return cached result if key exists
- [ ] Store idempotency key and result in database
- [ ] Clean up old keys (> 24 hours)

#### FR-11: Shopify Integration
**Priority:** P0 (Critical)

**Description:** Sync user data to Shopify Metaobjects.

**Acceptance Criteria:**
- [ ] Find or create customer by email
- [ ] Create/update Metaobject for user profile
- [ ] Store consent status as JSON
- [ ] Store user history as JSON
- [ ] Update `last_seen` timestamp
- [ ] Handle Shopify API errors (retry with exponential backoff)

#### FR-12: Google AI Integration
**Priority:** P1 (High)

**Description:** Stream events to Google AI Data Stream.

**Acceptance Criteria:**
- [ ] Send events to Google AI API
- [ ] Include user ID, session ID, event type, timestamp
- [ ] Batch events (send every 10 events or 30 seconds)
- [ ] Handle API errors (queue for retry)

### 3.4 CI/CD Design Publish Pipeline Requirements

#### FR-13: Webflow Design Module Export
**Priority:** P0 (Critical)

**Description:** Export Webflow design components for CI/CD pipeline processing.

**Acceptance Criteria:**
- [ ] Webflow project configured for design export (Dev Link or API)
- [ ] Design tokens extracted (CSS variables, spacing, colors)
- [ ] Component structure exported as HTML/CSS templates
- [ ] No runtime logic included in exports
- [ ] Version control integration for design changes

#### FR-14: CI/CD Dual-Target Publish
**Priority:** P0 (Critical)

**Description:** CI/CD pipeline publishes Webflow designs to both 11ty and Shopify Native.

**Acceptance Criteria:**
- [ ] GitHub Actions workflow for design publish pipeline
- [ ] Transform Webflow exports to 11ty Nunjucks templates
- [ ] Transform Webflow exports to Shopify Liquid templates
- [ ] Sync CSS/design tokens to both targets
- [ ] Automated build trigger on design changes
- [ ] Rollback capability for failed deployments

**Implementation Details:**
```yaml
# .github/workflows/design-publish.yml
name: Design Component Publish

on:
  repository_dispatch:
    types: [webflow-design-update]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Export Webflow Design
        # Extract design components from Webflow

      - name: Transform to 11ty Templates
        # Convert to Nunjucks templates

      - name: Transform to Shopify Native
        # Convert to Liquid templates for Shopify theme

      - name: Deploy 11ty Site
        # Build and deploy static site

      - name: Sync Shopify Theme
        # Push templates to Shopify Native
```

#### FR-15: Shopify Native Mirror Sync
**Priority:** P0 (Critical)

**Description:** Maintain Shopify Native as a mirror of the synced front end.

**Acceptance Criteria:**
- [ ] Shopify theme templates match 11ty output structure
- [ ] Product pages render identically on both platforms
- [ ] Shared CSS/design tokens between 11ty and Shopify
- [ ] GraphQL data mapping consistent across both targets
- [ ] Fallback to Shopify Native if 11ty site unavailable

---

## 4. Non-Functional Requirements

### 4.1 Performance

#### NFR-1: Build Performance
- Build time for 1000 products: < 5 minutes
- Build time for 10,000 products: < 30 minutes
- Incremental build time: < 30 seconds

#### NFR-2: Page Load Performance
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Total page size: < 500KB (including images)

#### NFR-3: API Performance
- GraphQL query response time: < 2s
- Webhook processing time: < 500ms
- WebSocket message latency: < 100ms

### 4.2 Scalability

#### NFR-4: Product Catalog Scale
- Support up to 100,000 products
- Support up to 10,000 collections
- Support up to 100 product variants per product

#### NFR-5: User Traffic Scale
- Support 10,000 concurrent users
- Support 1,000,000 page views per day
- Support 100,000 webhook events per hour

### 4.3 Security

#### NFR-6: Data Encryption
- All data in transit MUST use TLS 1.3
- Sensitive data at rest MUST be encrypted (AES-256)
- API keys MUST be stored in environment variables

#### NFR-7: Authentication
- Shopify API: Use Storefront Access Token
- Middleware webhooks: Use HMAC signature verification
- Google AI API: Use OAuth 2.0 with service account

#### NFR-8: Consent Management
- GDPR compliant: Explicit opt-in required
- CCPA compliant: Easy opt-out mechanism
- Consent stored with timestamp and IP address
- Data processing stops immediately on consent revocation

### 4.4 Reliability

#### NFR-9: Availability
- Static site: 99.99% uptime (CDN)
- Middleware: 99.9% uptime
- Graceful degradation if middleware is down

#### NFR-10: Error Handling
- All API calls MUST have error handling
- Failed builds MUST not deploy broken sites
- Failed webhooks MUST be queued for retry (max 3 attempts)

### 4.5 Maintainability

#### NFR-11: Code Quality
- CSS: BEM methodology, max 10,000 lines
- JavaScript: ESLint compliant, max 5,000 lines
- Templates: DRY principle, max 500 lines per file

#### NFR-12: Documentation
- README with setup instructions
- Integration guide for Webflow and Shopify
- API documentation for middleware endpoints
- Code comments for complex logic

---

## 5. Data Models

### 5.1 Product Data Model (Shopify UCP)

```graphql
type Product {
  id: ID!
  title: String!
  handle: String!
  description: String
  descriptionHtml: String
  priceRange: ProductPriceRange!
  images(first: Int): ImageConnection!
  variants(first: Int): ProductVariantConnection!
  collections(first: Int): CollectionConnection!
  tags: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ProductPriceRange {
  minVariantPrice: MoneyV2!
  maxVariantPrice: MoneyV2!
}

type MoneyV2 {
  amount: Decimal!
  currencyCode: CurrencyCode!
}
```

### 5.2 Session Data Model (Client-Side)

```typescript
interface UCPSession {
  sessionId: string;
  userId?: string;
  email?: string;
  consentStatus: {
    [purpose: string]: {
      granted: boolean;
      timestamp: string; // ISO 8601
    };
  };
  userHistory: UCPEvent[];
  createdAt: string; // ISO 8601
  lastActive: string; // ISO 8601
}

interface UCPEvent {
  timestamp: string; // ISO 8601
  type: 'page_view' | 'click' | 'form_submit' | 'add_to_cart';
  page: string;
  data?: Record<string, any>;
}
```

### 5.3 Metaobject Schema (Shopify)

```json
{
  "name": "UCP User Profile",
  "type": "ucp_user_profile",
  "fields": [
    {
      "key": "consent_status",
      "type": "json",
      "description": "User consent preferences"
    },
    {
      "key": "user_history",
      "type": "json",
      "description": "User interaction history"
    },
    {
      "key": "last_seen",
      "type": "date_time",
      "description": "Last active timestamp"
    }
  ]
}
```

### 5.4 Google AI Event Schema

```json
{
  "user_id": "user_789",
  "session_id": "session_123456",
  "event_type": "page_view",
  "event_timestamp": "2026-01-14T12:00:00Z",
  "event_data": {
    "page": "/products/widget",
    "referrer": "https://google.com",
    "device_type": "mobile"
  }
}
```

---

## 6. API Specifications

### 6.1 Shopify GraphQL API

**Endpoint:** `https://{shop}.myshopify.com/api/2024-01/graphql.json`

**Authentication:** `X-Shopify-Storefront-Access-Token: {token}`

**Query: Fetch Products**
```graphql
query GetProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  }
}
```

### 6.2 Middleware Webhook API

**Endpoint:** `POST https://your-xano.xano.io/api/webhook`

**Authentication:** `X-Webhook-Signature: {hmac_signature}`

**Request Body:**
```json
{
  "eventType": "consent_updated",
  "session": {
    "sessionId": "session_123456",
    "email": "user@example.com",
    "consentStatus": {
      "analytics": { "granted": true, "timestamp": "2026-01-14T12:00:00Z" }
    },
    "userHistory": []
  }
}
```

**Response:**
```json
{
  "success": true,
  "customerId": "gid://shopify/Customer/123456"
}
```

### 6.3 Google AI Data Stream API

**Endpoint:** `POST https://datastream.googleapis.com/v1/projects/{project}/streams/{stream}:write`

**Authentication:** `Authorization: Bearer {oauth_token}`

**Request Body:**
```json
{
  "events": [
    {
      "user_id": "user_789",
      "session_id": "session_123456",
      "event_type": "page_view",
      "event_timestamp": "2026-01-14T12:00:00Z",
      "event_data": {
        "page": "/products/widget"
      }
    }
  ]
}
```

### 6.4 Users API Endpoints

**Base URL:** `https://your-middleware.xano.io/api/v1/users`

#### 6.4.1 Create User
```
POST /users
```

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "consent_analytics": true,
  "consent_marketing": false,
  "ucp_session_id": "session_123456"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123def456",
    "email": "user@example.com",
    "name": "John Doe",
    "shopify_customer_id": "gid://shopify/Customer/789",
    "consent_status": {
      "analytics": { "granted": true, "timestamp": "2026-01-14T12:00:00Z" },
      "marketing": { "granted": false, "timestamp": "2026-01-14T12:00:00Z" }
    },
    "created_at": "2026-01-14T12:00:00Z"
  },
  "idempotency_key": "usr_abc123def456_create_1705233600000"
}
```

#### 6.4.2 Get User
```
GET /users/{user_id}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123def456",
    "email": "user@example.com",
    "name": "John Doe",
    "shopify_customer_id": "gid://shopify/Customer/789",
    "consent_status": {
      "analytics": { "granted": true, "timestamp": "2026-01-14T12:00:00Z" },
      "marketing": { "granted": false, "timestamp": "2026-01-14T12:00:00Z" }
    },
    "ucp_tags": ["returning-customer", "newsletter-subscriber"],
    "last_event_type": "page_view",
    "last_event_timestamp": "2026-01-14T14:30:00Z",
    "sync_status": {
      "shopify_synced": true,
      "google_ai_synced": true,
      "last_synced": "2026-01-14T14:30:00Z"
    },
    "created_at": "2026-01-14T12:00:00Z",
    "updated_at": "2026-01-14T14:30:00Z"
  }
}
```

#### 6.4.3 Update User Consent
```
PATCH /users/{user_id}/consent
```

**Request:**
```json
{
  "consent_analytics": true,
  "consent_marketing": true,
  "consent_version": "v2.1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_abc123def456",
    "consent_status": {
      "analytics": { "granted": true, "timestamp": "2026-01-14T15:00:00Z", "version": "v2.1" },
      "marketing": { "granted": true, "timestamp": "2026-01-14T15:00:00Z", "version": "v2.1" }
    },
    "webhook_triggered": true
  },
  "idempotency_key": "usr_abc123def456_consent_1705237200000"
}
```

#### 6.4.4 List Users (Admin)
```
GET /users?page=1&limit=50&filter[consent_marketing]=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "user_id": "usr_abc123", "email": "user1@example.com", "name": "John Doe" },
    { "user_id": "usr_def456", "email": "user2@example.com", "name": "Jane Smith" }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "total_pages": 25
  }
}
```

### 6.5 Products API Endpoints

**Base URL:** `https://your-middleware.xano.io/api/v1/products`

#### 6.5.1 List Products
```
GET /products?page=1&limit=20&collection={collection_handle}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "product_id": "prod_abc123",
      "shopify_id": "gid://shopify/Product/12345",
      "title": "Premium Widget",
      "handle": "premium-widget",
      "description": "A high-quality widget for all your needs",
      "price": {
        "amount": "99.99",
        "currency_code": "USD"
      },
      "compare_at_price": {
        "amount": "129.99",
        "currency_code": "USD"
      },
      "images": [
        { "url": "https://cdn.shopify.com/...", "alt_text": "Premium Widget" }
      ],
      "available": true,
      "inventory_quantity": 150,
      "variants_count": 3,
      "tags": ["featured", "best-seller"],
      "last_synced": "2026-01-14T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "total_pages": 25,
    "has_next_page": true,
    "cursor": "eyJsYXN0X2lkIjogMTIzNDV9"
  }
}
```

#### 6.5.2 Get Product Detail
```
GET /products/{product_handle}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "product_id": "prod_abc123",
    "shopify_id": "gid://shopify/Product/12345",
    "title": "Premium Widget",
    "handle": "premium-widget",
    "description": "A high-quality widget for all your needs",
    "description_html": "<p>A high-quality widget...</p>",
    "price_range": {
      "min": { "amount": "89.99", "currency_code": "USD" },
      "max": { "amount": "119.99", "currency_code": "USD" }
    },
    "images": [
      { "id": "img_1", "url": "https://cdn.shopify.com/...", "alt_text": "Front view", "position": 1 },
      { "id": "img_2", "url": "https://cdn.shopify.com/...", "alt_text": "Side view", "position": 2 }
    ],
    "variants": [
      {
        "variant_id": "var_001",
        "shopify_id": "gid://shopify/ProductVariant/111",
        "title": "Small / Blue",
        "sku": "WIDGET-SM-BLU",
        "price": { "amount": "89.99", "currency_code": "USD" },
        "available": true,
        "inventory_quantity": 50,
        "options": { "size": "Small", "color": "Blue" }
      },
      {
        "variant_id": "var_002",
        "shopify_id": "gid://shopify/ProductVariant/222",
        "title": "Large / Red",
        "sku": "WIDGET-LG-RED",
        "price": { "amount": "119.99", "currency_code": "USD" },
        "available": true,
        "inventory_quantity": 30,
        "options": { "size": "Large", "color": "Red" }
      }
    ],
    "collections": ["widgets", "featured"],
    "tags": ["featured", "best-seller", "new-arrival"],
    "seo": {
      "title": "Premium Widget - Best Quality",
      "description": "Shop our premium widget..."
    },
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2026-01-14T10:00:00Z",
    "last_synced": "2026-01-14T10:00:00Z"
  }
}
```

#### 6.5.3 Sync Products (Webhook Trigger)
```
POST /products/sync
```

**Request:**
```json
{
  "sync_type": "full",
  "collection_handles": ["all"],
  "force_refresh": false
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "message": "Product sync initiated",
  "job_id": "sync_job_123456",
  "estimated_products": 500,
  "webhook_url": "https://your-middleware.xano.io/api/v1/products/sync/status/sync_job_123456"
}
```

### 6.6 UCP Session API Endpoints

**Base URL:** `https://your-middleware.xano.io/api/v1/ucp`

#### 6.6.1 Create/Update Session
```
POST /ucp/session
```

**Request:**
```json
{
  "session_id": "session_123456789",
  "user_id": "usr_abc123def456",
  "device_info": {
    "type": "mobile",
    "browser": "Chrome",
    "os": "iOS 17"
  },
  "referrer": "https://google.com",
  "landing_page": "/products/premium-widget"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "session_123456789",
    "user_id": "usr_abc123def456",
    "is_new_session": true,
    "consent_required": true,
    "ucp_tags": ["mobile-user", "organic-traffic"],
    "created_at": "2026-01-14T12:00:00Z"
  }
}
```

#### 6.6.2 Track Event
```
POST /ucp/event
```

**Request:**
```json
{
  "session_id": "session_123456789",
  "event_type": "add_to_cart",
  "event_data": {
    "product_id": "prod_abc123",
    "variant_id": "var_001",
    "quantity": 1,
    "price": 89.99
  },
  "page": "/products/premium-widget",
  "timestamp": "2026-01-14T12:05:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "event_id": "evt_xyz789",
    "session_id": "session_123456789",
    "event_type": "add_to_cart",
    "processed": true,
    "synced_to": {
      "shopify": true,
      "google_ai": true
    },
    "ucp_tags_updated": ["cart-active", "high-intent"]
  },
  "idempotency_key": "session_123456789_add_to_cart_1705234500000"
}
```

#### 6.6.3 Update UCP Tags
```
PATCH /ucp/session/{session_id}/tags
```

**Request:**
```json
{
  "add_tags": ["vip-customer", "loyalty-member"],
  "remove_tags": ["first-time-visitor"],
  "trigger_webhook": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "session_123456789",
    "ucp_tags": ["mobile-user", "organic-traffic", "vip-customer", "loyalty-member", "cart-active"],
    "tags_added": ["vip-customer", "loyalty-member"],
    "tags_removed": ["first-time-visitor"],
    "webhook_triggered": true,
    "webhook_status": "delivered"
  }
}
```

#### 6.6.4 Get Session History
```
GET /ucp/session/{session_id}/history?limit=50
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session_id": "session_123456789",
    "user_id": "usr_abc123def456",
    "events": [
      {
        "event_id": "evt_001",
        "event_type": "page_view",
        "page": "/",
        "timestamp": "2026-01-14T12:00:00Z"
      },
      {
        "event_id": "evt_002",
        "event_type": "page_view",
        "page": "/products/premium-widget",
        "timestamp": "2026-01-14T12:02:00Z"
      },
      {
        "event_id": "evt_003",
        "event_type": "add_to_cart",
        "data": { "product_id": "prod_abc123", "quantity": 1 },
        "timestamp": "2026-01-14T12:05:00Z"
      }
    ],
    "total_events": 3,
    "session_duration_seconds": 300,
    "pages_viewed": 2
  }
}
```

### 6.7 Idempotency API Endpoints

**Base URL:** `https://your-middleware.xano.io/api/v1/idempotency`

#### 6.7.1 Check Idempotency Key
```
GET /idempotency/{idempotency_key}
```

**Response (200 OK - Key Exists):**
```json
{
  "exists": true,
  "data": {
    "idempotency_key": "usr_abc123_consent_1705237200000",
    "operation": "consent_update",
    "status": "completed",
    "result": {
      "success": true,
      "user_id": "usr_abc123def456",
      "consent_updated": true
    },
    "created_at": "2026-01-14T15:00:00Z",
    "expires_at": "2026-01-15T15:00:00Z"
  }
}
```

**Response (404 Not Found - Key Does Not Exist):**
```json
{
  "exists": false,
  "message": "Idempotency key not found - safe to process"
}
```

#### 6.7.2 Create Idempotency Record
```
POST /idempotency
```

**Request:**
```json
{
  "idempotency_key": "usr_abc123_consent_1705237200000",
  "operation": "consent_update",
  "entity_type": "user",
  "entity_id": "usr_abc123def456",
  "request_hash": "sha256_of_request_body",
  "ttl_hours": 24
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "idempotency_key": "usr_abc123_consent_1705237200000",
    "status": "processing",
    "lock_acquired": true,
    "created_at": "2026-01-14T15:00:00Z",
    "expires_at": "2026-01-15T15:00:00Z"
  }
}
```

#### 6.7.3 Update Idempotency Status
```
PATCH /idempotency/{idempotency_key}
```

**Request:**
```json
{
  "status": "completed",
  "result": {
    "success": true,
    "user_id": "usr_abc123def456",
    "consent_updated": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "idempotency_key": "usr_abc123_consent_1705237200000",
    "status": "completed",
    "updated_at": "2026-01-14T15:00:01Z"
  }
}
```

#### 6.7.4 List Idempotency Records (Admin)
```
GET /idempotency?status=failed&entity_type=user&limit=100
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "idempotency_key": "usr_def456_consent_1705230000000",
      "operation": "consent_update",
      "entity_type": "user",
      "entity_id": "usr_def456",
      "status": "failed",
      "error_message": "Shopify API timeout",
      "retry_count": 3,
      "created_at": "2026-01-14T13:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5
  }
}
```

#### 6.7.5 Retry Failed Operations
```
POST /idempotency/{idempotency_key}/retry
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "idempotency_key": "usr_def456_consent_1705230000000",
    "status": "processing",
    "retry_count": 4,
    "message": "Retry initiated"
  }
}
```

### 6.8 Webhook Management API

**Base URL:** `https://your-middleware.xano.io/api/v1/webhooks`

### 6.9 Environment Variables (.env) Reference

```bash
# =============================================================================
# ENVIRONMENT CONFIGURATION - .env.example
# =============================================================================
# Copy this file to .env and fill in your actual values
# NEVER commit .env to version control
# =============================================================================

# -----------------------------------------------------------------------------
# SHOPIFY STOREFRONT API (Public - for 11ty build)
# -----------------------------------------------------------------------------
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_STOREFRONT_API_VERSION=2024-01

# -----------------------------------------------------------------------------
# SHOPIFY ADMIN API (Private - for middleware/backend only)
# -----------------------------------------------------------------------------
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_THEME_ID=123456789012

# -----------------------------------------------------------------------------
# WEBFLOW API (Design Module Export)
# -----------------------------------------------------------------------------
WEBFLOW_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WEBFLOW_SITE_ID=xxxxxxxxxxxxxxxxxxxxxxxx
WEBFLOW_COLLECTION_ID=xxxxxxxxxxxxxxxxxxxxxxxx

# -----------------------------------------------------------------------------
# XANO MIDDLEWARE
# -----------------------------------------------------------------------------
XANO_API_BASE_URL=https://your-instance.xano.io/api
XANO_API_KEY=xano_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
XANO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# -----------------------------------------------------------------------------
# AUTHENTICATION (OAuth 2.0)
# -----------------------------------------------------------------------------
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_AUTHORIZE_URL=https://identity-provider.example.com/authorize
OAUTH_TOKEN_URL=https://identity-provider.example.com/token
OAUTH_REDIRECT_URI=https://your-site.com/callback

# -----------------------------------------------------------------------------
# JWT CONFIGURATION
# -----------------------------------------------------------------------------
JWT_SECRET=your-256-bit-secret-key-here-minimum-32-chars
JWT_ISSUER=your-app-name
JWT_AUDIENCE=your-api-audience
JWT_EXPIRY_HOURS=24

# -----------------------------------------------------------------------------
# GOOGLE AI / ANALYTICS
# -----------------------------------------------------------------------------
GOOGLE_AI_PROJECT_ID=your-gcp-project-id
GOOGLE_AI_STREAM_ID=your-datastream-id
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_AI_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# -----------------------------------------------------------------------------
# WEBSOCKET / REAL-TIME
# -----------------------------------------------------------------------------
WEBSOCKET_SERVER_URL=wss://your-websocket-server.com
WEBSOCKET_API_KEY=ws_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# -----------------------------------------------------------------------------
# PAYMENT GATEWAY (A2P)
# -----------------------------------------------------------------------------
PAYMENT_GATEWAY_URL=https://payment-gateway.example.com
PAYMENT_MERCHANT_ID=merch_xxxxxxxxxxxxx
PAYMENT_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYMENT_SECRET_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# -----------------------------------------------------------------------------
# DEPLOYMENT / CI-CD
# -----------------------------------------------------------------------------
NETLIFY_AUTH_TOKEN=nfp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NETLIFY_SITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# -----------------------------------------------------------------------------
# IDEMPOTENCY / CACHING
# -----------------------------------------------------------------------------
REDIS_URL=redis://username:password@host:6379
IDEMPOTENCY_TTL_HOURS=24
CACHE_TTL_SECONDS=3600

# -----------------------------------------------------------------------------
# SECURITY
# -----------------------------------------------------------------------------
WEBHOOK_SIGNING_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENCRYPTION_KEY=32-character-encryption-key-here
HMAC_SECRET=your-hmac-signing-secret

# -----------------------------------------------------------------------------
# FEATURE FLAGS
# -----------------------------------------------------------------------------
ENABLE_GOOGLE_AI_STREAMING=true
ENABLE_SHOPIFY_SYNC=true
ENABLE_WEBHOOK_RETRY=true
DEBUG_MODE=false

# -----------------------------------------------------------------------------
# RATE LIMITING
# -----------------------------------------------------------------------------
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST=20
```

#### 6.8.1 Register Webhook
```
POST /webhooks
```

**Request:**
```json
{
  "url": "https://your-endpoint.com/webhook",
  "events": ["user.consent_updated", "user.tags_changed", "session.created"],
  "secret": "your_webhook_secret",
  "active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "webhook_id": "wh_abc123",
    "url": "https://your-endpoint.com/webhook",
    "events": ["user.consent_updated", "user.tags_changed", "session.created"],
    "status": "active",
    "created_at": "2026-01-14T12:00:00Z"
  }
}
```

#### 6.8.2 Webhook Delivery Log
```
GET /webhooks/{webhook_id}/deliveries?limit=50
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "delivery_id": "del_xyz789",
      "webhook_id": "wh_abc123",
      "event": "user.consent_updated",
      "payload": { "user_id": "usr_abc123", "consent_marketing": true },
      "status": "delivered",
      "response_code": 200,
      "response_time_ms": 145,
      "delivered_at": "2026-01-14T15:00:01Z"
    },
    {
      "delivery_id": "del_xyz790",
      "webhook_id": "wh_abc123",
      "event": "session.created",
      "payload": { "session_id": "session_123456789" },
      "status": "failed",
      "response_code": 500,
      "error_message": "Internal server error",
      "retry_count": 2,
      "next_retry_at": "2026-01-14T15:10:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250
  }
}
```

### 6.10 User Session State Management

#### 6.10.1 User GraphQL Query (Shopify Admin API)

```graphql
query GetCustomer($id: ID!) {
  customer(id: $id) {
    id
    email
    firstName
    lastName
    displayName
    phone
    createdAt
    updatedAt
    state
    tags
    verifiedEmail

    # Consent Status
    emailMarketingConsent {
      marketingState
      marketingOptInLevel
      consentUpdatedAt
    }
    smsMarketingConsent {
      marketingState
      marketingOptInLevel
      consentUpdatedAt
    }

    # Order History
    orders(first: 10, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          totalPriceSet { shopMoney { amount, currencyCode } }
          fulfillmentStatus
          financialStatus
        }
      }
    }

    # UCP Metafields
    metafields(first: 20, namespace: "ucp") {
      edges {
        node { id, namespace, key, value, type }
      }
    }
  }
}
```

#### 6.10.2 Update Customer with UCP Data (Mutation)

```graphql
mutation UpdateCustomerWithUCP($input: CustomerInput!) {
  customerUpdate(input: $input) {
    customer {
      id
      email
      tags
      metafields(first: 20, namespace: "ucp") {
        edges { node { key, value } }
      }
    }
    userErrors { field, message }
  }
}

# Variables:
# {
#   "input": {
#     "id": "gid://shopify/Customer/123456789",
#     "tags": ["ucp-user", "analytics-consent", "marketing-consent"],
#     "metafields": [
#       { "namespace": "ucp", "key": "consent_status", "value": "{\"analytics\":true,\"marketing\":true}", "type": "json" },
#       { "namespace": "ucp", "key": "session_id", "value": "session_123456789", "type": "single_line_text_field" },
#       { "namespace": "ucp", "key": "last_event", "value": "{\"type\":\"page_view\",\"timestamp\":\"2026-01-14T12:00:00Z\"}", "type": "json" },
#       { "namespace": "ucp", "key": "user_tags", "value": "[\"returning-customer\",\"high-engagement\"]", "type": "json" }
#     ]
#   }
# }
```

#### 6.10.3 User Schema Mapper

```javascript
/**
 * User Schema Mapper - Maps user data with Google Session and Consent State
 */

function generateIdempotencyKey(userId, eventType) {
  return `${userId}_${eventType}_${Date.now()}`;
}

function mapUserToWebflow(userData, sessionData, consentData) {
  const { userId, email, name, shopifyCustomerId } = userData;
  const { sessionId, deviceInfo, events = [] } = sessionData || {};
  const { analytics = false, marketing = false, version = 'v1.0', timestamp } = consentData || {};

  return {
    // Required Webflow fields
    name: name || email?.split('@')[0] || 'Anonymous',
    slug: userId,

    // User Identification
    'user-id': userId,
    'email': email || '',
    'shopify-customer-id': shopifyCustomerId || '',

    // Consent Status
    'consent-status': JSON.stringify({
      analytics: { granted: analytics, timestamp: timestamp || new Date().toISOString() },
      marketing: { granted: marketing, timestamp: timestamp || new Date().toISOString() }
    }),
    'consent-analytics': analytics,
    'consent-marketing': marketing,
    'consent-timestamp': timestamp || new Date().toISOString(),
    'consent-version': version,

    // UCP Session / Google Session
    'ucp-session-id': sessionId || '',
    'ucp-tags': JSON.stringify(generateUserTags(userData, sessionData, consentData)),
    'last-event-type': events[events.length - 1]?.type || 'session_start',
    'last-event-timestamp': events[events.length - 1]?.timestamp || new Date().toISOString(),
    'event-history': JSON.stringify(events.slice(-50)),

    // Idempotency Logic
    'idempotency-key': generateIdempotencyKey(userId, 'user_sync'),
    'last-processed-at': new Date().toISOString(),
    'processing-status': 'completed',
    'retry-count': 0,

    // Sync Status
    'shopify-synced': !!shopifyCustomerId,
    'google-ai-synced': true,
    'last-synced': new Date().toISOString(),
  };
}

function generateUserTags(userData, sessionData, consentData) {
  const tags = [];
  if (sessionData?.deviceInfo?.type === 'mobile') tags.push('mobile-user');
  if (sessionData?.deviceInfo?.type === 'desktop') tags.push('desktop-user');
  if (consentData?.analytics) tags.push('analytics-consent');
  if (consentData?.marketing) tags.push('marketing-consent');
  const eventCount = sessionData?.events?.length || 0;
  if (eventCount > 10) tags.push('high-engagement');
  if (sessionData?.events?.some(e => e.type === 'add_to_cart')) tags.push('cart-active');
  return tags;
}

function mapConsentUpdate(userId, consentData) {
  return {
    'consent-analytics': consentData.analytics,
    'consent-marketing': consentData.marketing,
    'consent-timestamp': new Date().toISOString(),
    'consent-version': consentData.version || 'v1.0',
    'idempotency-key': generateIdempotencyKey(userId, 'consent_update'),
    'last-processed-at': new Date().toISOString(),
  };
}

module.exports = { mapUserToWebflow, mapConsentUpdate, generateIdempotencyKey, generateUserTags };
```

#### 6.10.4 User Data Fetcher

```javascript
const fetch = require('node-fetch');
require('dotenv').config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01';
const ADMIN_ENDPOINT = `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

async function adminQuery(query, variables = {}) {
  const response = await fetch(ADMIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function fetchCustomerWithUCP(customerId) {
  const query = `
    query GetCustomerUCP($id: ID!) {
      customer(id: $id) {
        id, email, firstName, lastName, tags
        emailMarketingConsent { marketingState, consentUpdatedAt }
        metafields(first: 20, namespace: "ucp") {
          edges { node { key, value, type } }
        }
      }
    }
  `;
  const data = await adminQuery(query, { id: customerId });
  return parseCustomerData(data.customer);
}

function parseCustomerData(customer) {
  const metafields = {};
  customer.metafields?.edges?.forEach(({ node }) => {
    metafields[node.key] = node.type === 'json' ? JSON.parse(node.value) : node.value;
  });

  return {
    userId: customer.id,
    email: customer.email,
    name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    tags: customer.tags || [],
    consent: {
      marketing: customer.emailMarketingConsent?.marketingState === 'SUBSCRIBED',
      timestamp: customer.emailMarketingConsent?.consentUpdatedAt,
    },
    ucp: {
      sessionId: metafields.session_id || null,
      consentStatus: metafields.consent_status || {},
      lastEvent: metafields.last_event || null,
      userTags: metafields.user_tags || [],
    },
  };
}

async function updateCustomerUCP(customerId, ucpData) {
  const mutation = `
    mutation UpdateCustomerUCP($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer { id, tags }
        userErrors { field, message }
      }
    }
  `;
  const input = {
    id: customerId,
    tags: ucpData.tags || [],
    metafields: [
      { namespace: 'ucp', key: 'consent_status', value: JSON.stringify(ucpData.consent || {}), type: 'json' },
      { namespace: 'ucp', key: 'session_id', value: ucpData.sessionId || '', type: 'single_line_text_field' },
      { namespace: 'ucp', key: 'last_event', value: JSON.stringify(ucpData.lastEvent || {}), type: 'json' },
      { namespace: 'ucp', key: 'user_tags', value: JSON.stringify(ucpData.userTags || []), type: 'json' },
      { namespace: 'ucp', key: 'idempotency_key', value: `${customerId}_${Date.now()}`, type: 'single_line_text_field' },
    ],
  };
  const data = await adminQuery(mutation, { input });
  if (data.customerUpdate.userErrors?.length > 0) {
    throw new Error(JSON.stringify(data.customerUpdate.userErrors));
  }
  return data.customerUpdate.customer;
}

module.exports = { fetchCustomerWithUCP, updateCustomerUCP, parseCustomerData, adminQuery };
```

---

## 7. User Stories

### 7.1 Developer User Stories

**US-1:** As a developer, I want to fetch product data from Shopify UCP Catalog so that I can generate static product pages.

**US-2:** As a developer, I want to use 11ty pagination so that I can generate individual pages for each product in parallel.

**US-3:** As a developer, I want to integrate the static site into Webflow so that non-technical users can manage the front-end.

### 7.2 End User Stories

**US-4:** As a shopper, I want to browse products on a fast-loading website so that I can find what I need quickly.

**US-5:** As a shopper, I want to control my data consent preferences so that I feel in control of my privacy.

**US-6:** As a shopper, I want to receive personalized product recommendations so that I discover relevant items.

### 7.3 Merchant User Stories

**US-7:** As a merchant, I want product data to sync automatically from Shopify so that my website is always up-to-date.

**US-8:** As a merchant, I want to track user behavior so that I can optimize my marketing campaigns.

**US-9:** As a merchant, I want to comply with GDPR/CCPA so that I avoid legal issues.

---

## 8. Implementation Phases

### Phase 1: Webflow Design Module Setup
- [ ] Configure Webflow project for design exports
- [ ] Create component library (header, footer, cards, layouts)
- [ ] Define design tokens (CSS variables, typography, spacing)
- [ ] Set up Webflow Dev Link or API access
- [ ] Document design system conventions

### Phase 2: CI/CD Pipeline Foundation
- [ ] Set up GitHub repository structure
- [ ] Create design export scripts
- [ ] Build template transformation layer (Webflow → 11ty/Shopify)
- [ ] Configure GitHub Actions workflow
- [ ] Test automated design publish

### Phase 3: 11ty Build System
- [ ] Set up 11ty project structure
- [ ] Create GraphQL client module
- [ ] Implement product data fetching with pagination
- [ ] Integrate transformed Webflow templates
- [ ] Implement BEM CSS from design tokens

### Phase 4: Shopify Native Mirror
- [ ] Set up Shopify theme structure
- [ ] Transform Webflow exports to Liquid templates
- [ ] Sync CSS/design tokens to Shopify theme
- [ ] Configure GraphQL data mapping
- [ ] Test product page parity with 11ty

### Phase 5: Client-Side Functionality
- [ ] Implement UCP Session Manager
- [ ] Create consent management UI
- [ ] Implement event tracking
- [ ] Add WebSocket client
- [ ] Test across both 11ty and Shopify Native

### Phase 6: Middleware Integration
- [ ] Set up Xano/n8n webhook endpoint
- [ ] Implement data transformation
- [ ] Add idempotency checks
- [ ] Integrate with Shopify Metaobjects
- [ ] Integrate with Google AI

### Phase 7: Testing & Launch
- [ ] Performance testing (Lighthouse, WebPageTest)
- [ ] Security testing (OWASP Top 10)
- [ ] Parity testing (11ty vs Shopify Native)
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 9. Success Metrics

### 9.1 Technical Metrics
- **Build Time:** < 5 minutes for 1000 products
- **Page Load Speed:** FCP < 1.5s, LCP < 2.5s
- **SEO Score:** Lighthouse SEO > 95
- **Error Rate:** < 0.1% for API calls
- **Uptime:** > 99.9% for static site

### 9.2 Business Metrics
- **Conversion Rate:** +15% increase
- **Bounce Rate:** -20% decrease
- **Average Session Duration:** +30% increase
- **Pages Per Session:** +25% increase
- **Consent Opt-In Rate:** > 60%

### 9.3 User Experience Metrics
- **Time to First Byte (TTFB):** < 200ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms
- **Mobile Usability Score:** > 95

---

## 10. Risks & Mitigations

### Risk 1: Shopify API Rate Limits
**Impact:** High  
**Probability:** Medium  
**Mitigation:** Implement request batching, caching, and exponential backoff

### Risk 2: Build Time Exceeds Limits
**Impact:** High  
**Probability:** Medium  
**Mitigation:** Implement incremental builds, optimize GraphQL queries

### Risk 3: Consent Compliance Issues
**Impact:** Critical  
**Probability:** Low  
**Mitigation:** Legal review, use proven consent management libraries

### Risk 4: WebSocket Connection Failures
**Impact:** Medium  
**Probability:** Medium  
**Mitigation:** Implement reconnection logic, fallback to polling

### Risk 5: Data Sync Delays
**Impact:** Medium  
**Probability:** High  
**Mitigation:** Set expectations for eventual consistency, show last updated timestamp

---

## 11. Appendix

### 11.1 Glossary

- **11ty (Eleventy):** Static site generator written in JavaScript
- **UCP:** Universal Commerce Protocol
- **BEM:** Block Element Modifier (CSS methodology)
- **GraphQL:** Query language for APIs
- **Metaobject:** Custom data structure in Shopify
- **Idempotency:** Property ensuring operations can be repeated safely

### 11.2 References

- [Shopify Storefront API Documentation](https://shopify.dev/docs/api/storefront)
- [Eleventy Documentation](https://www.11ty.dev/docs/)
- [Google AI Data Stream API](https://cloud.google.com/datastream/docs)
- [BEM Methodology](https://getbem.com/)
- [GDPR Compliance Guide](https://gdpr.eu/)

### 11.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-14 | Manus AI | Initial PRD creation |
| 1.1 | 2026-01-14 | Manus AI | Added API Endpoint Schema Maps (Users, Products, UCP, Idempotency, Webhooks) |

---

## 12. Claude Implementation Prompt

**Use this prompt with Claude to implement the system:**

```
I need you to build a complete e-commerce knowledge base system with the following architecture:

## ARCHITECTURE OVERVIEW
- **Webflow** = Design Module only (visual design tool, no runtime)
- **CI/CD Pipeline** = Publishes Webflow designs to dual targets
- **11ty** = Static site with GraphQL data mapping from Shopify
- **Shopify Native** = Mirror of synced front end

## COMPONENTS TO BUILD

1. **Webflow Design Module Export:**
   - Design tokens extraction (CSS variables, typography, spacing)
   - Component structure export
   - No runtime logic - design assets only

2. **CI/CD Design Publish Pipeline:**
   - GitHub Actions workflow for automated publish
   - Transform Webflow exports to 11ty Nunjucks templates
   - Transform Webflow exports to Shopify Liquid templates
   - Sync CSS/design tokens to both targets

3. **11ty Static Site Generator:**
   - Fetch product data from Shopify UCP Catalog via GraphQL
   - Generate static HTML pages using transformed Webflow templates
   - Use BEM CSS from design tokens
   - Include vanilla JavaScript (no frameworks)

4. **Shopify Native Mirror:**
   - Liquid templates matching 11ty output structure
   - Shared CSS/design tokens
   - Product page parity with 11ty
   - Fallback capability

5. **Client-Side UCP Session Manager:**
   - Track user sessions in sessionStorage
   - Capture user events (page views, clicks)
   - Manage consent preferences
   - Works on both 11ty and Shopify Native

6. **Middleware (Xano/n8n):**
   - Webhook endpoint to receive client events
   - Transform data for Shopify and Google AI
   - Implement idempotency checks
   - Sync to Shopify Metaobjects
   - Stream to Google AI Data Stream

## DATA FLOW

```
Webflow Design Module (Design Time)
         │
         │ CI/CD Design Component Publish
         ▼
┌────────────────────┬────────────────────┐
│  11ty Templates    │  Shopify Native    │
│  + GraphQL Mapping │  (Mirror)          │
└────────────────────┴────────────────────┘
         │                    │
         └────────┬───────────┘
                  │
         Shopify GraphQL API
                  │
                  ▼
         Runtime (Xano/n8n → Google AI)
```

## DELIVERABLES

1. CI/CD pipeline configuration (GitHub Actions)
2. Webflow export transformation scripts
3. Complete 11ty project with source code
4. Shopify theme templates (Liquid)
5. Built static site ready for deployment
6. README with setup instructions
7. All code should be production-ready with error handling

Follow the implementation phases:
1. Webflow Design Module Setup
2. CI/CD Pipeline Foundation
3. 11ty Build System
4. Shopify Native Mirror
5. Client-Side Functionality
6. Middleware Integration
7. Testing & Launch
```

---

**END OF PRD**
