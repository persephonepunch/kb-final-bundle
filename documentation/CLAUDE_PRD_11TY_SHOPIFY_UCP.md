# Product Requirements Document (PRD)
## 11ty + Shopify UCP Catalog + Google AI Integration

**Version:** 1.0  
**Date:** January 14, 2026  
**Author:** Manus AI  
**Target Audience:** Claude AI, Development Teams

---

## Executive Summary

This PRD defines the requirements for building a complete e-commerce knowledge base and product catalog system using Eleventy (11ty) as the static site generator, Shopify's Universal Commerce Protocol (UCP) Catalog as the product data source, and Google AI for real-time analytics and personalization. The system integrates with Webflow for front-end presentation and uses Xano/n8n for middleware orchestration.

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
│                     BUILD TIME (11ty)                           │
│                                                                 │
│  ┌──────────────┐      GraphQL      ┌──────────────────────┐  │
│  │   11ty       │ ─────────────────> │  Shopify UCP         │  │
│  │   Build      │ <───────────────── │  Catalog API         │  │
│  │   Process    │      Products      │  (GraphQL)           │  │
│  └──────────────┘                    └──────────────────────┘  │
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

### 3.4 Webflow Integration Requirements

#### FR-13: CSS Integration
**Priority:** P0 (Critical)

**Description:** Integrate BEM CSS into Webflow custom code.

**Acceptance Criteria:**
- [ ] CSS copied to Webflow Project Settings → Custom Code → Head
- [ ] Wrapped in `<style>` tags
- [ ] Google Fonts link included
- [ ] CSS variables preserved
- [ ] No conflicts with Webflow's default styles

#### FR-14: JavaScript Integration
**Priority:** P0 (Critical)

**Description:** Integrate vanilla JavaScript into Webflow custom code.

**Acceptance Criteria:**
- [ ] JavaScript copied to Webflow Project Settings → Custom Code → Footer
- [ ] Wrapped in `<script>` tags
- [ ] All functionality works (mobile menu, tabs, copy buttons)
- [ ] No conflicts with Webflow's scripts

#### FR-15: Component Mapping
**Priority:** P1 (High)

**Description:** Map HTML structure to Webflow components.

**Acceptance Criteria:**
- [ ] Create Webflow symbols for reusable components (header, footer, card)
- [ ] Apply correct class names from BEM CSS
- [ ] Test all interactive elements
- [ ] Document component usage in Webflow

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

### Phase 1: Foundation (Week 1)
- [ ] Set up 11ty project structure
- [ ] Create GraphQL client module
- [ ] Implement product data fetching
- [ ] Create base templates (layout, header, footer)
- [ ] Implement BEM CSS

### Phase 2: Page Generation (Week 2)
- [ ] Implement pagination for product pages
- [ ] Add SEO metadata
- [ ] Add structured data (JSON-LD)
- [ ] Optimize images
- [ ] Test build performance

### Phase 3: Client-Side Functionality (Week 3)
- [ ] Implement UCP Session Manager
- [ ] Create consent management UI
- [ ] Implement event tracking
- [ ] Add WebSocket client
- [ ] Test in multiple browsers

### Phase 4: Middleware Integration (Week 4)
- [ ] Set up Xano/n8n webhook endpoint
- [ ] Implement data transformation
- [ ] Add idempotency checks
- [ ] Integrate with Shopify Metaobjects
- [ ] Integrate with Google AI

### Phase 5: Webflow Integration (Week 5)
- [ ] Copy CSS to Webflow custom code
- [ ] Copy JavaScript to Webflow custom code
- [ ] Create Webflow components
- [ ] Test all functionality in Webflow
- [ ] Document integration process

### Phase 6: Testing & Launch (Week 6)
- [ ] Performance testing (Lighthouse, WebPageTest)
- [ ] Security testing (OWASP Top 10)
- [ ] User acceptance testing
- [ ] Fix bugs and optimize
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

---

## 12. Claude Implementation Prompt

**Use this prompt with Claude to implement the system:**

```
I need you to build a complete e-commerce knowledge base system with the following components:

1. **11ty Static Site Generator:**
   - Fetch product data from Shopify UCP Catalog via GraphQL
   - Generate static HTML pages for each product using pagination
   - Use BEM CSS methodology (no Tailwind)
   - Include vanilla JavaScript (no frameworks)
   - IBM Plex fonts for typography

2. **Client-Side UCP Session Manager:**
   - Track user sessions in sessionStorage
   - Capture user events (page views, clicks)
   - Manage consent preferences
   - Send webhooks to middleware

3. **Middleware (Xano/n8n):**
   - Webhook endpoint to receive client events
   - Transform data for Shopify and Google AI
   - Implement idempotency checks
   - Sync to Shopify Metaobjects
   - Stream to Google AI Data Stream

4. **Webflow Integration:**
   - CSS and JS that can be copied into Webflow custom code
   - HTML structure that maps to Webflow components
   - Full integration guide

Please follow the PRD specifications exactly, including:
- All functional requirements (FR-1 through FR-15)
- Non-functional requirements (performance, security, scalability)
- Data models and API specifications
- BEM CSS naming conventions
- Vanilla JavaScript (no jQuery or other libraries)

Deliverables:
1. Complete 11ty project with source code
2. Built static site ready for deployment
3. Integration guide for Webflow and Shopify
4. README with setup instructions
5. All code should be production-ready with error handling

Start by setting up the 11ty project structure, then implement each component following the implementation phases outlined in the PRD.
```

---

**END OF PRD**
