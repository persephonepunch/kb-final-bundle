# ASCII Flow Charts
## 11ty + Shopify UCP + Google AI Integration

**Version:** 1.0  
**Date:** January 14, 2026

---

## Table of Contents

1. [Complete System Flow](#1-complete-system-flow)
2. [Build-Time Flow](#2-build-time-flow)
3. [Runtime Data Flow](#3-runtime-data-flow)
4. [UCP Session Flow](#4-ucp-session-flow)
5. [Consent Management Flow](#5-consent-management-flow)
6. [Middleware Processing Flow](#6-middleware-processing-flow)
7. [Shopify Integration Flow](#7-shopify-integration-flow)
8. [Google AI Integration Flow](#8-google-ai-integration-flow)
9. [WebSocket Real-Time Flow](#9-websocket-real-time-flow)
10. [Webflow Integration Flow](#10-webflow-integration-flow)

---

## 1. Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          COMPLETE SYSTEM ARCHITECTURE                        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         BUILD TIME (11ty)                              │ │
│  │                                                                        │ │
│  │   ┌──────────────┐                                                    │ │
│  │   │   Developer  │                                                    │ │
│  │   │   Triggers   │                                                    │ │
│  │   │   Build      │                                                    │ │
│  │   └──────┬───────┘                                                    │ │
│  │          │                                                            │ │
│  │          │ npm run build                                              │ │
│  │          ▼                                                            │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  11ty Build Process                                          │   │ │
│  │   │  ┌────────────────────────────────────────────────────────┐ │   │ │
│  │   │  │  1. Read .eleventy.js config                           │ │   │ │
│  │   │  │  2. Execute data files in src/_data/                   │ │   │ │
│  │   │  │  3. Fetch from Shopify UCP Catalog (GraphQL)           │ │   │ │
│  │   │  │  4. Process Nunjucks templates                         │ │   │ │
│  │   │  │  5. Apply BEM CSS                                      │ │   │ │
│  │   │  │  6. Copy static assets (CSS, JS, images)               │ │   │ │
│  │   │  │  7. Generate HTML files                                │ │   │ │
│  │   │  └────────────────────────────────────────────────────────┘ │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  │                              │                                        │ │
│  │                              │                                        │ │
│  │                              ▼                                        │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  Shopify UCP Catalog API                                     │   │ │
│  │   │  ┌────────────────────────────────────────────────────────┐ │   │ │
│  │   │  │  GraphQL Query:                                        │ │   │ │
│  │   │  │  query GetProducts($first: Int!) {                     │ │   │ │
│  │   │  │    products(first: $first) {                           │ │   │ │
│  │   │  │      edges {                                           │ │   │ │
│  │   │  │        node {                                          │ │   │ │
│  │   │  │          id, title, handle, description               │ │   │ │
│  │   │  │          priceRange { minVariantPrice }               │ │   │ │
│  │   │  │          images { url, altText }                      │ │   │ │
│  │   │  │        }                                              │ │   │ │
│  │   │  │      }                                                │ │   │ │
│  │   │  │    }                                                  │ │   │ │
│  │   │  │  }                                                    │ │   │ │
│  │   │  └────────────────────────────────────────────────────────┘ │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  │                              │                                        │ │
│  │                              │ Return Product Data                    │ │
│  │                              ▼                                        │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  Generated Static Site (_site/)                              │   │ │
│  │   │  ├── index.html                                              │   │ │
│  │   │  ├── architecture/index.html                                 │   │ │
│  │   │  ├── implementation/index.html                               │   │ │
│  │   │  ├── eleventy-graphql/index.html                             │   │ │
│  │   │  ├── products/                                               │   │ │
│  │   │  │   ├── product-1/index.html                                │   │ │
│  │   │  │   ├── product-2/index.html                                │   │ │
│  │   │  │   └── ...                                                 │   │ │
│  │   │  ├── css/main.css                                            │   │ │
│  │   │  └── js/main.js                                              │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                         │
│                                   │ Deploy to CDN                           │
│                                   ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         RUNTIME (Client-Side)                          │ │
│  │                                                                        │ │
│  │   ┌──────────────┐                                                    │ │
│  │   │   User       │                                                    │ │
│  │   │   Browser    │                                                    │ │
│  │   └──────┬───────┘                                                    │ │
│  │          │                                                            │ │
│  │          │ Request Page                                               │ │
│  │          ▼                                                            │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  CDN / Static Host                                           │   │ │
│  │   │  - Serve HTML, CSS, JS                                       │   │ │
│  │   │  - Cache-Control headers                                     │   │ │
│  │   │  - Gzip compression                                          │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  │                              │                                        │ │
│  │                              │ Return Static Files                    │ │
│  │                              ▼                                        │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  Browser Renders Page                                        │   │ │
│  │   │  ┌────────────────────────────────────────────────────────┐ │   │ │
│  │   │  │  1. Parse HTML                                         │ │   │ │
│  │   │  │  2. Load CSS (BEM styles)                              │ │   │ │
│  │   │  │  3. Execute JavaScript:                                │ │   │ │
│  │   │  │     - Initialize UCP Session Manager                   │ │   │ │
│  │   │  │     - Load consent preferences                         │ │   │ │
│  │   │  │     - Attach event listeners                           │ │   │ │
│  │   │  │     - Connect WebSocket                                │ │   │ │
│  │   │  └────────────────────────────────────────────────────────┘ │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  │                              │                                        │ │
│  │                              │ User Interaction                       │ │
│  │                              ▼                                        │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  UCP Session Manager (Client-Side JS)                        │   │ │
│  │   │  ┌────────────────────────────────────────────────────────┐ │   │ │
│  │   │  │  - Track page views                                    │ │   │ │
│  │   │  │  - Track button clicks                                 │ │   │ │
│  │   │  │  - Track form submissions                              │ │   │ │
│  │   │  │  - Store in sessionStorage                             │ │   │ │
│  │   │  │  - Send webhook to middleware                          │ │   │ │
│  │   │  └────────────────────────────────────────────────────────┘ │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                         │
│                                   │ POST /api/webhook                       │
│                                   ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         MIDDLEWARE (Xano/n8n)                          │ │
│  │                                                                        │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  Webhook Endpoint                                            │   │ │
│  │   │  ┌────────────────────────────────────────────────────────┐ │   │ │
│  │   │  │  1. Validate HMAC signature                            │ │   │ │
│  │   │  │  2. Parse JSON payload                                 │ │   │ │
│  │   │  │  3. Check idempotency key                              │ │   │ │
│  │   │  │  4. Transform data                                     │ │   │ │
│  │   │  │  5. Route to backends                                  │ │   │ │
│  │   │  └────────────────────────────────────────────────────────┘ │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  │                    │                              │                    │ │
│  │                    │                              │                    │ │
│  │         ┌──────────┘                              └──────────┐         │ │
│  │         │                                                    │         │ │
│  │         ▼                                                    ▼         │ │
│  │   ┌─────────────────────┐                    ┌──────────────────────┐ │ │
│  │   │  Shopify Admin API  │                    │  Google AI           │ │ │
│  │   │  ┌───────────────┐  │                    │  Data Stream         │ │ │
│  │   │  │ GraphQL       │  │                    │  ┌────────────────┐  │ │ │
│  │   │  │ Mutations:    │  │                    │  │ POST /write    │  │ │ │
│  │   │  │ - Create      │  │                    │  │ {              │  │ │ │
│  │   │  │   Customer    │  │                    │  │   events: [    │  │ │ │
│  │   │  │ - Update      │  │                    │  │     {          │  │ │ │
│  │   │  │   Metaobject  │  │                    │  │       user_id  │  │ │ │
│  │   │  └───────────────┘  │                    │  │       event    │  │ │ │
│  │   └─────────────────────┘                    │  │     }          │  │ │ │
│  │                                               │  │   ]            │  │ │ │
│  │                                               │  │ }              │  │ │ │
│  │                                               │  └────────────────┘  │ │ │
│  │                                               └──────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                         │
│                                   │ WebSocket Push                          │
│                                   ▼                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         REAL-TIME UPDATES                              │ │
│  │                                                                        │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  WebSocket Server                                            │   │ │
│  │   │  - Emit personalization events                               │   │ │
│  │   │  - Emit consent confirmations                                │   │ │
│  │   │  - Emit analytics updates                                    │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  │                              │                                        │ │
│  │                              │ WebSocket Message                      │ │
│  │                              ▼                                        │ │
│  │   ┌──────────────────────────────────────────────────────────────┐   │ │
│  │   │  Browser WebSocket Client                                    │   │ │
│  │   │  - Update UI with recommendations                            │   │ │
│  │   │  - Show consent confirmation                                 │   │ │
│  │   │  - Display analytics                                         │   │ │
│  │   └──────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Build-Time Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    11ty BUILD PROCESS                           │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Developer   │
    │  Runs Build  │
    └──────┬───────┘
           │
           │ npm run build
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  11ty Initialization                                     │
    │  - Read .eleventy.js                                     │
    │  - Set input/output directories                          │
    │  - Configure passthrough copy                            │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Execute Data Files (src/_data/)                         │
    │                                                          │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  graphqlClient.js                                  │ │
    │  │  - Create GraphQL client instance                  │ │
    │  │  - Configure endpoint & headers                    │ │
    │  └────────────────────────────────────────────────────┘ │
    │                      │                                   │
    │                      ▼                                   │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  products.js                                       │ │
    │  │  - Export async function                           │ │
    │  │  - Call GraphQL query                              │ │
    │  └────────────────────────────────────────────────────┘ │
    │                      │                                   │
    │                      ▼                                   │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  collections.js                                    │ │
    │  │  - Export async function                           │ │
    │  │  - Call GraphQL query                              │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Fetch Data
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Shopify UCP Catalog API                                 │
    │                                                          │
    │  POST https://{shop}.myshopify.com/api/graphql.json     │
    │  Headers:                                                │
    │    X-Shopify-Storefront-Access-Token: {token}           │
    │                                                          │
    │  Query:                                                  │
    │    query GetProducts($first: Int!, $after: String) {    │
    │      products(first: $first, after: $after) {           │
    │        pageInfo { hasNextPage endCursor }               │
    │        edges {                                           │
    │          node {                                          │
    │            id, title, handle, description               │
    │            priceRange { minVariantPrice }               │
    │            images { url altText }                       │
    │          }                                               │
    │        }                                                 │
    │      }                                                   │
    │    }                                                     │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Return JSON
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Data Available to Templates                             │
    │  - products: Array[Product]                              │
    │  - collections: Array[Collection]                        │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Process Templates                                       │
    │                                                          │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  src/index.njk                                     │ │
    │  │  → _site/index.html                                │ │
    │  └────────────────────────────────────────────────────┘ │
    │                      │                                   │
    │                      ▼                                   │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  src/architecture.njk                              │ │
    │  │  → _site/architecture/index.html                   │ │
    │  └────────────────────────────────────────────────────┘ │
    │                      │                                   │
    │                      ▼                                   │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  Pagination: src/products.njk                      │ │
    │  │  For each product in products:                     │ │
    │  │    → _site/products/{handle}/index.html            │ │
    │  │                                                    │ │
    │  │  Example:                                          │ │
    │  │    products[0].handle = "widget"                   │ │
    │  │    → _site/products/widget/index.html              │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Copy Static Assets                                      │
    │  - src/css/main.css → _site/css/main.css                │
    │  - src/js/main.js → _site/js/main.js                    │
    │  - src/images/* → _site/images/*                        │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Build Complete                                          │
    │  ✓ 4 HTML files generated                                │
    │  ✓ 1000 product pages generated                          │
    │  ✓ Static assets copied                                  │
    │  ✓ Build time: 4m 32s                                    │
    └──────────────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Deploy to CDN                                           │
    │  - Netlify / Vercel / Cloudflare Pages                   │
    │  - AWS S3 + CloudFront                                   │
    │  - Any static hosting                                    │
    └──────────────────────────────────────────────────────────┘
```

---

## 3. Runtime Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME DATA FLOW                            │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │     User     │
    │   Visits     │
    │   Website    │
    └──────┬───────┘
           │
           │ GET /products/widget/
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  CDN / Static Host                                       │
    │  - Serve _site/products/widget/index.html                │
    │  - Serve _site/css/main.css                              │
    │  - Serve _site/js/main.js                                │
    │  - Cache-Control: max-age=3600                           │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ 200 OK + HTML/CSS/JS
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Browser                                                 │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Parse HTML                                     │ │
    │  │  2. Apply CSS (BEM styles)                         │ │
    │  │  3. Execute main.js:                               │ │
    │  │     - initMobileMenu()                             │ │
    │  │     - initSearch()                                 │ │
    │  │     - initTabs()                                   │ │
    │  │     - initCopyButtons()                            │ │
    │  │     - initUCPSession() ← NEW                       │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Initialize
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  UCP Session Manager                                     │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  constructor() {                                   │ │
    │  │    this.sessionId = getOrCreateSessionId();        │ │
    │  │    this.sessionData = loadSession();               │ │
    │  │    this.webhookUrl = 'https://xano.io/webhook';    │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Check sessionStorage
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  sessionStorage                                          │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  ucp_session_id: "session_123456"                  │ │
    │  │  ucp_session_data: {                               │ │
    │  │    sessionId: "session_123456",                    │ │
    │  │    consentStatus: {},                              │ │
    │  │    userHistory: []                                 │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ User Interacts
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Event Listeners                                         │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  Page View:                                        │ │
    │  │    trackEvent('page_view', { page: '/products' })  │ │
    │  │                                                    │ │
    │  │  Button Click:                                     │ │
    │  │    trackEvent('click', { button: 'add-to-cart' })  │ │
    │  │                                                    │ │
    │  │  Form Submit:                                      │ │
    │  │    trackEvent('form_submit', { form: 'contact' })  │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ trackEvent()
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  UCP Session Manager                                     │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  trackEvent(eventType, eventData) {                │ │
    │  │    const event = {                                 │ │
    │  │      timestamp: new Date().toISOString(),          │ │
    │  │      type: eventType,                              │ │
    │  │      data: eventData,                              │ │
    │  │      page: window.location.pathname                │ │
    │  │    };                                              │ │
    │  │    this.sessionData.userHistory.push(event);       │ │
    │  │    this.saveSession();                             │ │
    │  │    this.sendWebhook('event_tracked', event);       │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ sendWebhook()
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  HTTP POST Request                                       │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  POST https://your-xano.xano.io/api/webhook       │ │
    │  │  Headers:                                          │ │
    │  │    Content-Type: application/json                  │ │
    │  │    X-Webhook-Signature: {hmac}                     │ │
    │  │  Body:                                             │ │
    │  │  {                                                 │ │
    │  │    "eventType": "event_tracked",                   │ │
    │  │    "session": {                                    │ │
    │  │      "sessionId": "session_123456",                │ │
    │  │      "email": "user@example.com",                  │ │
    │  │      "consentStatus": {...},                       │ │
    │  │      "userHistory": [...]                          │ │
    │  │    }                                               │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Async (non-blocking)
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Middleware (Xano/n8n)                                   │
    │  [See Middleware Processing Flow for details]            │
    └──────────────────────────────────────────────────────────┘
```

---

## 4. UCP Session Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    UCP SESSION LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  First Visit │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Check sessionStorage                                    │
    │  sessionStorage.getItem('ucp_session_id')                │
    └──────┬───────────────────────────────────────────────────┘
           │
           ├─── Session Exists? ───┐
           │                        │
          NO                       YES
           │                        │
           ▼                        ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  Create New      │    │  Load Existing   │
    │  Session         │    │  Session         │
    │                  │    │                  │
    │  sessionId =     │    │  sessionId =     │
    │  "session_" +    │    │  (from storage)  │
    │  Date.now() +    │    │                  │
    │  random()        │    │  sessionData =   │
    │                  │    │  JSON.parse(     │
    │  sessionData = { │    │    storage)      │
    │    sessionId,    │    └──────────────────┘
    │    consentStatus │             │
    │    userHistory   │             │
    │  }               │             │
    └──────┬───────────┘             │
           │                         │
           └─────────┬───────────────┘
                     │
                     ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Session Active                                          │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  Properties:                                       │ │
    │  │  - sessionId: string                               │ │
    │  │  - userId?: string                                 │ │
    │  │  - email?: string                                  │ │
    │  │  - consentStatus: {                                │ │
    │  │      analytics: { granted, timestamp },            │ │
    │  │      marketing: { granted, timestamp }             │ │
    │  │    }                                               │ │
    │  │  - userHistory: [                                  │ │
    │  │      { timestamp, type, page, data }               │ │
    │  │    ]                                               │ │
    │  │  - createdAt: ISO 8601                             │ │
    │  │  - lastActive: ISO 8601                            │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ User Actions
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Event Tracking                                          │
    │                                                          │
    │  ┌────────────────┐  ┌────────────────┐  ┌───────────┐ │
    │  │  Page View     │  │  Button Click  │  │  Form     │ │
    │  │  ────────────  │  │  ────────────  │  │  Submit   │ │
    │  │  trackEvent(   │  │  trackEvent(   │  │  ───────  │ │
    │  │   'page_view', │  │   'click',     │  │  track... │ │
    │  │   {page}       │  │   {button}     │  │           │ │
    │  │  )             │  │  )             │  │           │ │
    │  └────────┬───────┘  └────────┬───────┘  └─────┬─────┘ │
    │           │                   │                 │       │
    │           └───────────────────┼─────────────────┘       │
    │                               │                         │
    └───────────────────────────────┼─────────────────────────┘
                                    │
                                    ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Update Session Data                                     │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Create event object:                           │ │
    │  │     {                                              │ │
    │  │       timestamp: "2026-01-14T12:00:00Z",           │ │
    │  │       type: "page_view",                           │ │
    │  │       page: "/products/widget",                    │ │
    │  │       data: {}                                     │ │
    │  │     }                                              │ │
    │  │                                                    │ │
    │  │  2. Push to userHistory array                      │ │
    │  │                                                    │ │
    │  │  3. Update lastActive timestamp                    │ │
    │  │                                                    │ │
    │  │  4. Save to sessionStorage:                        │ │
    │  │     sessionStorage.setItem(                        │ │
    │  │       'ucp_session_data',                          │ │
    │  │       JSON.stringify(sessionData)                  │ │
    │  │     )                                              │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ If significant event
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Send Webhook to Middleware                              │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  fetch(webhookUrl, {                               │ │
    │  │    method: 'POST',                                 │ │
    │  │    headers: {                                      │ │
    │  │      'Content-Type': 'application/json',           │ │
    │  │      'X-Webhook-Signature': generateHMAC()         │ │
    │  │    },                                              │ │
    │  │    body: JSON.stringify({                          │ │
    │  │      eventType: 'event_tracked',                   │ │
    │  │      session: sessionData                          │ │
    │  │    })                                              │ │
    │  │  })                                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Continue browsing...
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Session Ends                                            │
    │  - User closes browser tab                               │
    │  - sessionStorage cleared                                │
    │  - Session data persisted in Shopify Metaobjects         │
    └──────────────────────────────────────────────────────────┘
```

---

## 5. Consent Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONSENT MANAGEMENT FLOW                      │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Page Load   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Check Consent Status                                    │
    │  sessionData.consentStatus                               │
    └──────┬───────────────────────────────────────────────────┘
           │
           ├─── Consent Given? ───┐
           │                       │
          NO                      YES
           │                       │
           ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  Show Consent    │    │  Hide Banner     │
    │  Banner          │    │  Enable Tracking │
    │                  │    └──────────────────┘
    │  ┌────────────┐  │
    │  │ Cookie &   │  │
    │  │ Data       │  │
    │  │ Consent    │  │
    │  │            │  │
    │  │ ☐ Analytics│  │
    │  │ ☐ Marketing│  │
    │  │            │  │
    │  │ [Save]     │  │
    │  └────────────┘  │
    └──────┬───────────┘
           │
           │ User clicks Save
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Capture Consent Preferences                             │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  const analytics =                                 │ │
    │  │    document.getElementById('analyticsConsent')     │ │
    │  │      .checked;  // true or false                   │ │
    │  │                                                    │ │
    │  │  const marketing =                                 │ │
    │  │    document.getElementById('marketingConsent')     │ │
    │  │      .checked;  // true or false                   │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Update Session Data                                     │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  ucpSession.updateConsent('analytics', analytics); │ │
    │  │  ucpSession.updateConsent('marketing', marketing); │ │
    │  │                                                    │ │
    │  │  // Inside updateConsent():                        │ │
    │  │  sessionData.consentStatus[purpose] = {            │ │
    │  │    granted: granted,                               │ │
    │  │    timestamp: new Date().toISOString()             │ │
    │  │  };                                                │ │
    │  │                                                    │ │
    │  │  saveSession(); // → sessionStorage                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Send Webhook                                            │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  POST /api/webhook                                 │ │
    │  │  {                                                 │ │
    │  │    "eventType": "consent_updated",                 │ │
    │  │    "session": {                                    │ │
    │  │      "sessionId": "session_123456",                │ │
    │  │      "consentStatus": {                            │ │
    │  │        "analytics": {                              │ │
    │  │          "granted": true,                          │ │
    │  │          "timestamp": "2026-01-14T12:00:00Z"       │ │
    │  │        },                                          │ │
    │  │        "marketing": {                              │ │
    │  │          "granted": false,                         │ │
    │  │          "timestamp": "2026-01-14T12:00:00Z"       │ │
    │  │        }                                           │ │
    │  │      }                                             │ │
    │  │    }                                               │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Middleware Processing                                   │
    │  - Validate consent data                                 │
    │  - Sync to Shopify Metaobjects                           │
    │  - Update Google AI consent signals                      │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Hide Consent Banner                                     │
    │  document.getElementById('consentBanner')                │
    │    .style.display = 'none';                              │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Enable/Disable Tracking                                 │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  if (consentStatus.analytics.granted) {            │ │
    │  │    // Enable analytics tracking                    │ │
    │  │    trackEvent('page_view', {...});                 │ │
    │  │  } else {                                          │ │
    │  │    // Disable analytics tracking                   │ │
    │  │    // Do not send events                           │ │
    │  │  }                                                 │ │
    │  │                                                    │ │
    │  │  if (consentStatus.marketing.granted) {            │ │
    │  │    // Enable marketing pixels                      │ │
    │  │    loadMarketingScripts();                         │ │
    │  │  } else {                                          │ │
    │  │    // Disable marketing pixels                     │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
```

---

## 6. Middleware Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE PROCESSING                        │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Webhook     │
    │  Received    │
    └──────┬───────┘
           │
           │ POST /api/webhook
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Validate Request                                        │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Check X-Webhook-Signature header               │ │
    │  │     const signature = req.headers['x-webhook...']  │ │
    │  │                                                    │ │
    │  │  2. Generate expected signature:                   │ │
    │  │     const expected = crypto                        │ │
    │  │       .createHmac('sha256', SECRET)                │ │
    │  │       .update(JSON.stringify(req.body))            │ │
    │  │       .digest('hex');                              │ │
    │  │                                                    │ │
    │  │  3. Compare signatures:                            │ │
    │  │     if (signature !== expected) {                  │ │
    │  │       return 401 Unauthorized                      │ │
    │  │     }                                              │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Valid ✓
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Parse Payload                                           │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  const { eventType, session } = req.body;          │ │
    │  │                                                    │ │
    │  │  if (!session.sessionId || !eventType) {           │ │
    │  │    return 400 Bad Request                          │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Check Idempotency                                       │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  const idempotencyKey =                            │ │
    │  │    `${session.sessionId}_${eventType}_${Date.now}`;│ │
    │  │                                                    │ │
    │  │  const existing = await db.query(                  │ │
    │  │    'idempotency_log',                              │ │
    │  │    { key: idempotencyKey }                         │ │
    │  │  );                                                │ │
    │  │                                                    │ │
    │  │  if (existing) {                                   │ │
    │  │    return existing.result; // Cached result        │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ New Event
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Transform Data                                          │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  // For Shopify                                    │ │
    │  │  const shopifyData = {                             │ │
    │  │    email: session.email,                           │ │
    │  │    tags: ['ucp-user', `session-${sessionId}`],     │ │
    │  │    metafields: [                                   │ │
    │  │      {                                             │ │
    │  │        namespace: 'ucp',                           │ │
    │  │        key: 'consent_status',                      │ │
    │  │        value: JSON.stringify(consentStatus),       │ │
    │  │        type: 'json'                                │ │
    │  │      }                                             │ │
    │  │    ]                                               │ │
    │  │  };                                                │ │
    │  │                                                    │ │
    │  │  // For Google AI                                  │ │
    │  │  const googleAIData = {                            │ │
    │  │    user_id: session.userId,                        │ │
    │  │    session_id: session.sessionId,                  │ │
    │  │    event_type: eventType,                          │ │
    │  │    event_timestamp: new Date().toISOString()       │ │
    │  │  };                                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ├──────────────────┬────────────────────┐
           │                  │                    │
           ▼                  ▼                    ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │  Shopify     │   │  Google AI   │   │  WebSocket   │
    │  Sync        │   │  Stream      │   │  Emit        │
    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
           │                  │                    │
           │                  │                    │
           └──────────────────┼────────────────────┘
                              │
                              ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Log Idempotency                                         │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  await db.insert('idempotency_log', {              │ │
    │  │    idempotency_key: idempotencyKey,                │ │
    │  │    result: { success: true, customerId },          │ │
    │  │    created_at: new Date()                          │ │
    │  │  });                                               │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Return Response                                         │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  return {                                          │ │
    │  │    success: true,                                  │ │
    │  │    customerId: "gid://shopify/Customer/123456"     │ │
    │  │  };                                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
```

---

## 7. Shopify Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHOPIFY INTEGRATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Middleware  │
    │  Receives    │
    │  Session Data│
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Find or Create Customer                                 │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  GraphQL Query:                                    │ │
    │  │                                                    │ │
    │  │  query findCustomer($email: String!) {             │ │
    │  │    customers(first: 1, query: $email) {            │ │
    │  │      edges {                                       │ │
    │  │        node {                                      │ │
    │  │          id                                        │ │
    │  │          email                                     │ │
    │  │        }                                           │ │
    │  │      }                                             │ │
    │  │    }                                               │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ├─── Customer Exists? ───┐
           │                         │
          NO                        YES
           │                         │
           ▼                         ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  Create Customer │    │  Use Existing    │
    │                  │    │  Customer        │
    │  mutation {      │    │                  │
    │    customerCreate│    │  customerId =    │
    │    (input: {     │    │  result.id       │
    │      email,      │    └──────────────────┘
    │      tags        │             │
    │    }) {          │             │
    │      customer {  │             │
    │        id        │             │
    │      }           │             │
    │    }             │             │
    │  }               │             │
    └──────┬───────────┘             │
           │                         │
           └─────────┬───────────────┘
                     │
                     ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Create/Update Metaobject                                │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  mutation updateMetaobject(                        │ │
    │  │    $id: ID!,                                       │ │
    │  │    $metaobject: MetaobjectUpdateInput!             │ │
    │  │  ) {                                               │ │
    │  │    metaobjectUpdate(                               │ │
    │  │      id: $id,                                      │ │
    │  │      metaobject: $metaobject                       │ │
    │  │    ) {                                             │ │
    │  │      metaobject {                                  │ │
    │  │        id                                          │ │
    │  │        fields {                                    │ │
    │  │          key                                       │ │
    │  │          value                                     │ │
    │  │        }                                           │ │
    │  │      }                                             │ │
    │  │    }                                               │ │
    │  │  }                                                 │ │
    │  │                                                    │ │
    │  │  Variables:                                        │ │
    │  │  {                                                 │ │
    │  │    "id": "gid://shopify/Metaobject/789",          │ │
    │  │    "metaobject": {                                 │ │
    │  │      "fields": [                                   │ │
    │  │        {                                           │ │
    │  │          "key": "consent_status",                  │ │
    │  │          "value": "{\"analytics\":true}"           │ │
    │  │        },                                          │ │
    │  │        {                                           │ │
    │  │          "key": "user_history",                    │ │
    │  │          "value": "[{...}]"                        │ │
    │  │        },                                          │ │
    │  │        {                                           │ │
    │  │          "key": "last_seen",                       │ │
    │  │          "value": "2026-01-14T12:00:00Z"           │ │
    │  │        }                                           │ │
    │  │      ]                                             │ │
    │  │    }                                               │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Shopify Stores Data                                     │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  Customer Record:                                  │ │
    │  │  - id: gid://shopify/Customer/123456               │ │
    │  │  - email: user@example.com                         │ │
    │  │  - tags: ["ucp-user", "session-123456"]            │ │
    │  │                                                    │ │
    │  │  Metaobject (UCP User Profile):                    │ │
    │  │  - id: gid://shopify/Metaobject/789               │ │
    │  │  - owner_id: gid://shopify/Customer/123456        │ │
    │  │  - fields:                                         │ │
    │  │    * consent_status: {"analytics": true, ...}      │ │
    │  │    * user_history: [{...}, {...}]                  │ │
    │  │    * last_seen: "2026-01-14T12:00:00Z"             │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
```

---

## 8. Google AI Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE AI INTEGRATION FLOW                   │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Middleware  │
    │  Receives    │
    │  Event Data  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Transform to Google AI Format                           │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  const googleAIEvent = {                           │ │
    │  │    user_id: session.userId || session.sessionId,   │ │
    │  │    session_id: session.sessionId,                  │ │
    │  │    event_type: eventType,                          │ │
    │  │    event_timestamp: new Date().toISOString(),      │ │
    │  │    event_data: {                                   │ │
    │  │      page: event.page,                             │ │
    │  │      referrer: document.referrer,                  │ │
    │  │      device_type: getDeviceType(),                 │ │
    │  │      consent_status: session.consentStatus         │ │
    │  │    }                                               │ │
    │  │  };                                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Batch Events                                            │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  // Collect events in memory                       │ │
    │  │  eventBatch.push(googleAIEvent);                   │ │
    │  │                                                    │ │
    │  │  // Send when:                                     │ │
    │  │  // - Batch size reaches 10 events                 │ │
    │  │  // - 30 seconds have passed                       │ │
    │  │  // - Critical event (e.g., purchase)              │ │
    │  │                                                    │ │
    │  │  if (eventBatch.length >= 10 ||                    │ │
    │  │      timeSinceLastSend > 30000 ||                  │ │
    │  │      event.critical) {                             │ │
    │  │    sendBatchToGoogleAI(eventBatch);                │ │
    │  │    eventBatch = [];                                │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Send Batch
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Google AI Data Stream API                               │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  POST https://datastream.googleapis.com/v1/        │ │
    │  │       projects/{project}/streams/{stream}:write    │ │
    │  │                                                    │ │
    │  │  Headers:                                          │ │
    │  │    Authorization: Bearer {oauth_token}             │ │
    │  │    Content-Type: application/json                  │ │
    │  │                                                    │ │
    │  │  Body:                                             │ │
    │  │  {                                                 │ │
    │  │    "events": [                                     │ │
    │  │      {                                             │ │
    │  │        "user_id": "user_789",                      │ │
    │  │        "session_id": "session_123456",             │ │
    │  │        "event_type": "page_view",                  │ │
    │  │        "event_timestamp": "2026-01-14T12:00:00Z",  │ │
    │  │        "event_data": {                             │ │
    │  │          "page": "/products/widget",               │ │
    │  │          "device_type": "mobile"                   │ │
    │  │        }                                           │ │
    │  │      },                                            │ │
    │  │      ...                                           │ │
    │  │    ]                                               │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ 200 OK
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Google AI Processing                                    │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Ingest events into BigQuery                    │ │
    │  │  2. Run ML models for:                             │ │
    │  │     - User segmentation                            │ │
    │  │     - Product recommendations                      │ │
    │  │     - Churn prediction                             │ │
    │  │     - Lifetime value estimation                    │ │
    │  │  3. Generate insights                              │ │
    │  │  4. Trigger real-time actions                      │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Predictions & Insights
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Personalization Engine                                  │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  - Recommended products                            │ │
    │  │  - Personalized content                            │ │
    │  │  - Dynamic pricing                                 │ │
    │  │  - Next best action                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Send to Middleware
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  WebSocket Emit                                          │
    │  - Push recommendations to client                        │
    │  - Update UI in real-time                                │
    └──────────────────────────────────────────────────────────┘
```

---

## 9. WebSocket Real-Time Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSOCKET REAL-TIME FLOW                     │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Page Load   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Initialize WebSocket Client                             │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  const ws = new WebSocket(                         │ │
    │  │    'wss://your-middleware.com/ws'                  │ │
    │  │  );                                                │ │
    │  │                                                    │ │
    │  │  ws.onopen = () => {                               │ │
    │  │    // Authenticate with session ID                 │ │
    │  │    ws.send(JSON.stringify({                        │ │
    │  │      type: 'authenticate',                         │ │
    │  │      sessionId: ucpSession.sessionId               │ │
    │  │    }));                                            │ │
    │  │  };                                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ WebSocket Handshake
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  WebSocket Server (Middleware)                           │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Accept connection                              │ │
    │  │  2. Wait for authentication message                │ │
    │  │  3. Validate session ID                            │ │
    │  │  4. Store connection:                              │ │
    │  │     connections[sessionId] = ws                    │ │
    │  │  5. Send confirmation                              │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           │ Connection Established
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Client Listening for Messages                           │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  ws.onmessage = (event) => {                       │ │
    │  │    const message = JSON.parse(event.data);         │ │
    │  │                                                    │ │
    │  │    switch (message.type) {                         │ │
    │  │      case 'personalization':                       │ │
    │  │        updateRecommendations(message.data);        │ │
    │  │        break;                                      │ │
    │  │      case 'consent_confirmed':                     │ │
    │  │        showConsentConfirmation();                  │ │
    │  │        break;                                      │ │
    │  │      case 'analytics_update':                      │ │
    │  │        updateAnalyticsDashboard(message.data);     │ │
    │  │        break;                                      │ │
    │  │    }                                               │ │
    │  │  };                                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
           ▲
           │
           │ Server Sends Message
           │
    ┌──────┴───────────────────────────────────────────────────┐
    │  Middleware Emits Event                                  │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  // After processing webhook                       │ │
    │  │  const ws = connections[sessionId];                │ │
    │  │                                                    │ │
    │  │  if (ws && ws.readyState === WebSocket.OPEN) {     │ │
    │  │    ws.send(JSON.stringify({                        │ │
    │  │      type: 'personalization',                      │ │
    │  │      data: {                                       │ │
    │  │        recommendations: [                          │ │
    │  │          { id: 1, title: 'Product A' },            │ │
    │  │          { id: 2, title: 'Product B' }             │ │
    │  │        ]                                           │ │
    │  │      }                                             │ │
    │  │    }));                                            │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
           │
           │ Message Received
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Client Updates UI                                       │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  function updateRecommendations(data) {            │ │
    │  │    const container =                               │ │
    │  │      document.getElementById('recommendations');   │ │
    │  │                                                    │ │
    │  │    container.innerHTML = '';                       │ │
    │  │                                                    │ │
    │  │    data.recommendations.forEach(product => {       │ │
    │  │      const card = createProductCard(product);      │ │
    │  │      container.appendChild(card);                  │ │
    │  │    });                                             │ │
    │  │  }                                                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
           │
           │ Connection Lost?
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Reconnection Logic                                      │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  ws.onclose = () => {                              │ │
    │  │    console.log('WebSocket closed, reconnecting...'); │ │
    │  │                                                    │ │
    │  │    setTimeout(() => {                              │ │
    │  │      initializeWebSocket(); // Retry connection    │ │
    │  │    }, 5000); // Wait 5 seconds                     │ │
    │  │  };                                                │ │
    │  │                                                    │ │
    │  │  ws.onerror = (error) => {                         │ │
    │  │    console.error('WebSocket error:', error);       │ │
    │  │    // Fallback to polling if WebSocket fails       │ │
    │  │    startPolling();                                 │ │
    │  │  };                                                │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────────────────────────────────────────────────────────┘
```

---

## 10. Webflow Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBFLOW INTEGRATION FLOW                     │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Build 11ty  │
    │  Site        │
    └──────┬───────┘
           │
           │ npm run build
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Generated Files                                         │
    │  - _site/css/main.css                                    │
    │  - _site/js/main.js                                      │
    │  - _site/*.html                                          │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Copy CSS to Webflow                                     │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Open _site/css/main.css                        │ │
    │  │  2. Copy entire contents                           │ │
    │  │  3. In Webflow:                                    │ │
    │  │     Project Settings → Custom Code → Head Code     │ │
    │  │  4. Paste:                                         │ │
    │  │     <style>                                        │ │
    │  │       /* Paste CSS here */                         │ │
    │  │     </style>                                       │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Copy JavaScript to Webflow                              │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Open _site/js/main.js                          │ │
    │  │  2. Copy entire contents                           │ │
    │  │  3. In Webflow:                                    │ │
    │  │     Project Settings → Custom Code → Footer Code   │ │
    │  │  4. Paste:                                         │ │
    │  │     <script>                                       │ │
    │  │       // Paste JavaScript here                     │ │
    │  │     </script>                                      │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Add Google Fonts                                        │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  Project Settings → Custom Code → Head Code        │ │
    │  │                                                    │ │
    │  │  <link rel="preconnect"                            │ │
    │  │    href="https://fonts.googleapis.com">            │ │
    │  │  <link rel="preconnect"                            │ │
    │  │    href="https://fonts.gstatic.com" crossorigin>   │ │
    │  │  <link href="https://fonts.googleapis.com/css2?    │ │
    │  │    family=IBM+Plex+Sans:wght@400;500;600;700&      │ │
    │  │    family=IBM+Plex+Mono:wght@400;500;600&          │ │
    │  │    display=swap" rel="stylesheet">                 │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Build Pages in Webflow                                  │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  Reference: _site/index.html                       │ │
    │  │                                                    │ │
    │  │  HTML Structure:                                   │ │
    │  │  <div class="card card-hover">                     │ │
    │  │    <div class="card-icon">🏗️</div>                 │ │
    │  │    <h3 class="card-title">Title</h3>               │ │
    │  │    <p class="card-description">Description</p>     │ │
    │  │  </div>                                            │ │
    │  │                                                    │ │
    │  │  Webflow:                                          │ │
    │  │  1. Add Div Block → class: "card card-hover"       │ │
    │  │  2. Add Div Block → class: "card-icon"             │ │
    │  │  3. Add Heading (H3) → class: "card-title"         │ │
    │  │  4. Add Paragraph → class: "card-description"      │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Create Webflow Symbols                                  │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  Reusable Components:                              │ │
    │  │  - Header (with navigation)                        │ │
    │  │  - Footer                                          │ │
    │  │  - Card                                            │ │
    │  │  - Button                                          │ │
    │  │  - Code Block                                      │ │
    │  │                                                    │ │
    │  │  Apply BEM class names to each symbol              │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Test Functionality                                      │
    │  ┌────────────────────────────────────────────────────┐ │
    │  │  1. Publish Webflow site                           │ │
    │  │  2. Test in browser:                               │ │
    │  │     - Mobile menu toggle                           │ │
    │  │     - Tab switching                                │ │
    │  │     - Copy to clipboard buttons                    │ │
    │  │     - UCP session tracking                         │ │
    │  │     - Consent management                           │ │
    │  │  3. Check browser console for errors               │ │
    │  │  4. Verify webhooks are sent to middleware         │ │
    │  └────────────────────────────────────────────────────┘ │
    └──────┬───────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────────┐
    │  Webflow Site Live                                       │
    │  - Static HTML/CSS/JS served by Webflow CDN              │
    │  - UCP session tracking active                           │
    │  - Webhooks sent to middleware                           │
    │  - Data synced to Shopify & Google AI                    │
    └──────────────────────────────────────────────────────────┘
```

---

**END OF ASCII FLOW CHARTS**
