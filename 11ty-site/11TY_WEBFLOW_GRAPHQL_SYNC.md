# 11ty → Webflow CMS Sync with GraphQL

**Document Version:** 1.0
**Date:** January 14, 2026
**Architecture:** Build-time GraphQL Data Pipeline

---

## 1. Architecture Overview

This document details how to use **Eleventy (11ty)** as a build-time GraphQL data orchestrator that syncs content to **Webflow CMS**, enabling a powerful hybrid architecture.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BUILD TIME                                  │
│                                                                         │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐ │
│   │   Shopify    │      │    11ty      │      │    Webflow CMS       │ │
│   │  GraphQL API │─────▶│  Data Layer  │─────▶│    (via REST API)    │ │
│   └──────────────┘      └──────────────┘      └──────────────────────┘ │
│          │                     │                        │               │
│          │              Transform &                     │               │
│          │              Map Schema                      │               │
│          ▼                     ▼                        ▼               │
│   Products, Collections    _data/*.js           CMS Collections        │
│   Customers, Content       templates            Published Site         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              RUNTIME                                     │
│                                                                         │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────────────┐ │
│   │   Webflow    │      │  Xano/n8n    │      │   Shopify Admin +    │ │
│   │   Client JS  │─────▶│  Middleware  │─────▶│   Google AI          │ │
│   └──────────────┘      └──────────────┘      └──────────────────────┘ │
│                                                                         │
│   User interactions, consent, real-time personalization                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
11ty-webflow-sync/
├── .eleventy.js              # Eleventy configuration
├── package.json              # Dependencies
├── .env                      # Environment variables (not committed)
├── .env.example              # Environment template
│
├── src/
│   ├── _data/                # Global data files
│   │   ├── shopify.js        # GraphQL fetcher for Shopify
│   │   ├── webflow.js        # Webflow CMS API client
│   │   └── sync.js           # Sync orchestration
│   │
│   ├── _includes/            # Templates (optional for preview)
│   └── index.njk             # Build status page
│
├── scripts/
│   ├── sync-to-webflow.js    # Main sync script
│   ├── schema-mapper.js      # Shopify → Webflow schema mapping
│   └── id-mapping.js         # ID relationship management
│
└── logs/
    └── sync-history.json     # Sync audit log
```

---

## 3. Environment Configuration

### 3.1. Environment Variables

```bash
# .env.example

# Shopify Storefront API (read-only, public data)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
SHOPIFY_API_VERSION=2024-01

# Shopify Admin API (for extended data access)
SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-token

# Webflow CMS API
WEBFLOW_API_TOKEN=your-webflow-token
WEBFLOW_SITE_ID=your-site-id
WEBFLOW_COLLECTION_PRODUCTS=collection-id-for-products
WEBFLOW_COLLECTION_CATEGORIES=collection-id-for-categories

# Sync Configuration
SYNC_BATCH_SIZE=100
SYNC_RATE_LIMIT_MS=350
```

### 3.2. Package Dependencies

```json
{
  "name": "11ty-webflow-sync",
  "version": "1.0.0",
  "scripts": {
    "build": "eleventy",
    "sync": "node scripts/sync-to-webflow.js",
    "sync:products": "node scripts/sync-to-webflow.js --collection=products",
    "sync:dry-run": "node scripts/sync-to-webflow.js --dry-run",
    "dev": "eleventy --serve"
  },
  "dependencies": {
    "@11ty/eleventy": "^3.0.0",
    "node-fetch": "^3.3.2",
    "dotenv": "^16.3.1",
    "p-limit": "^5.0.0",
    "p-retry": "^6.2.0"
  }
}
```

---

## 4. GraphQL Data Fetching (Shopify)

### 4.1. Shopify GraphQL Client

```javascript
// src/_data/shopify.js

const fetch = require('node-fetch');
require('dotenv').config();

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

const GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

/**
 * Execute GraphQL query against Shopify Storefront API
 */
async function shopifyQuery(query, variables = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    console.error('GraphQL Errors:', json.errors);
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

/**
 * Fetch all products with pagination
 */
async function fetchAllProducts() {
  const products = [];
  let hasNextPage = true;
  let cursor = null;

  const query = `
    query GetProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml
            productType
            vendor
            tags
            createdAt
            updatedAt
            publishedAt

            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }

            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }

            featuredImage {
              url
              altText
              width
              height
            }

            images(first: 10) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }

            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }

            collections(first: 10) {
              edges {
                node {
                  id
                  handle
                  title
                }
              }
            }

            seo {
              title
              description
            }
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await shopifyQuery(query, {
      first: 250,
      after: cursor,
    });

    const { edges, pageInfo } = data.products;

    products.push(...edges.map(edge => edge.node));

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;

    console.log(`Fetched ${products.length} products...`);
  }

  return products;
}

/**
 * Fetch all collections with pagination
 */
async function fetchAllCollections() {
  const collections = [];
  let hasNextPage = true;
  let cursor = null;

  const query = `
    query GetCollections($first: Int!, $after: String) {
      collections(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            handle
            title
            description
            descriptionHtml

            image {
              url
              altText
              width
              height
            }

            products(first: 250) {
              edges {
                node {
                  id
                  handle
                }
              }
            }

            seo {
              title
              description
            }
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    const data = await shopifyQuery(query, {
      first: 250,
      after: cursor,
    });

    const { edges, pageInfo } = data.collections;

    collections.push(...edges.map(edge => edge.node));

    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return collections;
}

/**
 * Fetch single product by handle
 */
async function fetchProductByHandle(handle) {
  const query = `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        handle
        title
        description
        descriptionHtml
        productType
        vendor
        tags

        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }

        featuredImage {
          url
          altText
        }

        variants(first: 100) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyQuery(query, { handle });
  return data.productByHandle;
}

module.exports = async function() {
  console.log('Fetching Shopify data via GraphQL...');

  const [products, collections] = await Promise.all([
    fetchAllProducts(),
    fetchAllCollections(),
  ]);

  console.log(`Fetched ${products.length} products, ${collections.length} collections`);

  return {
    products,
    collections,
    fetchedAt: new Date().toISOString(),
  };
};

// Export individual functions for direct use
module.exports.fetchAllProducts = fetchAllProducts;
module.exports.fetchAllCollections = fetchAllCollections;
module.exports.fetchProductByHandle = fetchProductByHandle;
module.exports.shopifyQuery = shopifyQuery;
```

---

## 5. Webflow CMS API Client

### 5.1. Webflow API Wrapper

```javascript
// src/_data/webflow.js

const fetch = require('node-fetch');
const pLimit = require('p-limit');
const pRetry = require('p-retry');
require('dotenv').config();

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const WEBFLOW_SITE_ID = process.env.WEBFLOW_SITE_ID;
const RATE_LIMIT_MS = parseInt(process.env.SYNC_RATE_LIMIT_MS) || 350;

const API_BASE = 'https://api.webflow.com/v2';

// Rate limiter: Webflow allows ~60 requests/minute
const limit = pLimit(1);
let lastRequestTime = 0;

/**
 * Rate-limited fetch wrapper
 */
async function webflowFetch(endpoint, options = {}) {
  return limit(async () => {
    // Ensure minimum delay between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_MS) {
      await new Promise(resolve =>
        setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest)
      );
    }
    lastRequestTime = Date.now();

    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
        'Content-Type': 'application/json',
        'accept-version': '2.0.0',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Webflow API error: ${response.status} - ${JSON.stringify(error)}`
      );
    }

    return response.json();
  });
}

/**
 * Retry wrapper for resilient API calls
 */
async function webflowFetchWithRetry(endpoint, options = {}) {
  return pRetry(
    () => webflowFetch(endpoint, options),
    {
      retries: 3,
      onFailedAttempt: error => {
        console.log(
          `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
        );
      },
    }
  );
}

/**
 * Get all collections for a site
 */
async function getCollections() {
  const data = await webflowFetchWithRetry(`/sites/${WEBFLOW_SITE_ID}/collections`);
  return data.collections || [];
}

/**
 * Get collection schema (fields)
 */
async function getCollectionSchema(collectionId) {
  return webflowFetchWithRetry(`/collections/${collectionId}`);
}

/**
 * Get all items in a collection (with pagination)
 */
async function getCollectionItems(collectionId) {
  const items = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const data = await webflowFetchWithRetry(
      `/collections/${collectionId}/items?offset=${offset}&limit=${limit}`
    );

    items.push(...(data.items || []));

    hasMore = data.items && data.items.length === limit;
    offset += limit;
  }

  return items;
}

/**
 * Create a new CMS item
 */
async function createItem(collectionId, fieldData, isDraft = false) {
  return webflowFetchWithRetry(`/collections/${collectionId}/items`, {
    method: 'POST',
    body: JSON.stringify({
      isArchived: false,
      isDraft: isDraft,
      fieldData: fieldData,
    }),
  });
}

/**
 * Update an existing CMS item
 */
async function updateItem(collectionId, itemId, fieldData, isDraft = false) {
  return webflowFetchWithRetry(`/collections/${collectionId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      isArchived: false,
      isDraft: isDraft,
      fieldData: fieldData,
    }),
  });
}

/**
 * Delete a CMS item
 */
async function deleteItem(collectionId, itemId) {
  return webflowFetchWithRetry(`/collections/${collectionId}/items/${itemId}`, {
    method: 'DELETE',
  });
}

/**
 * Publish items in a collection
 */
async function publishItems(collectionId, itemIds) {
  return webflowFetchWithRetry(`/collections/${collectionId}/items/publish`, {
    method: 'POST',
    body: JSON.stringify({
      itemIds: itemIds,
    }),
  });
}

/**
 * Publish entire site
 */
async function publishSite() {
  return webflowFetchWithRetry(`/sites/${WEBFLOW_SITE_ID}/publish`, {
    method: 'POST',
    body: JSON.stringify({
      publishToWebflowSubdomain: true,
      publishToCustomDomains: true,
    }),
  });
}

module.exports = {
  getCollections,
  getCollectionSchema,
  getCollectionItems,
  createItem,
  updateItem,
  deleteItem,
  publishItems,
  publishSite,
};
```

---

## 6. Schema Mapping (Shopify → Webflow)

### 6.1. Schema Mapper

```javascript
// scripts/schema-mapper.js

/**
 * Maps Shopify product data to Webflow CMS field structure
 *
 * IMPORTANT: Customize this mapping based on your Webflow collection schema
 */

/**
 * Extract numeric ID from Shopify GID
 * e.g., "gid://shopify/Product/123456" → "123456"
 */
function extractShopifyId(gid) {
  if (!gid) return null;
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}

/**
 * Map Shopify product to Webflow CMS fields
 */
function mapProductToWebflow(shopifyProduct) {
  const {
    id,
    handle,
    title,
    description,
    descriptionHtml,
    productType,
    vendor,
    tags,
    priceRange,
    compareAtPriceRange,
    featuredImage,
    images,
    variants,
    collections,
    seo,
    publishedAt,
    updatedAt,
  } = shopifyProduct;

  // Get first variant for default pricing
  const firstVariant = variants?.edges?.[0]?.node;

  // Get all image URLs
  const imageUrls = images?.edges?.map(edge => edge.node.url) || [];

  // Get collection handles
  const collectionHandles = collections?.edges?.map(
    edge => edge.node.handle
  ) || [];

  return {
    // Required Webflow fields
    name: title,
    slug: handle,

    // Custom fields (match your Webflow collection schema)
    'shopify-id': extractShopifyId(id),
    'product-handle': handle,
    'product-title': title,
    'description': description || '',
    'description-html': descriptionHtml || '',
    'product-type': productType || '',
    'vendor': vendor || '',
    'tags': tags?.join(', ') || '',

    // Pricing
    'price': parseFloat(priceRange?.minVariantPrice?.amount) || 0,
    'price-formatted': formatPrice(priceRange?.minVariantPrice),
    'compare-at-price': parseFloat(compareAtPriceRange?.minVariantPrice?.amount) || 0,
    'currency': priceRange?.minVariantPrice?.currencyCode || 'USD',

    // Images (Webflow image field expects URL)
    'featured-image': featuredImage?.url || '',
    'featured-image-alt': featuredImage?.altText || title,
    'gallery-images': imageUrls.slice(0, 10).join('\n'), // Multi-image as newline-separated

    // Variants (as JSON string for rich text or reference)
    'variants-json': JSON.stringify(
      variants?.edges?.map(edge => ({
        id: extractShopifyId(edge.node.id),
        title: edge.node.title,
        sku: edge.node.sku,
        price: edge.node.price?.amount,
        available: edge.node.availableForSale,
        options: edge.node.selectedOptions,
      })) || []
    ),
    'variant-count': variants?.edges?.length || 0,

    // Availability
    'available': firstVariant?.availableForSale ?? true,
    'sku': firstVariant?.sku || '',

    // Collections
    'collections': collectionHandles.join(', '),

    // SEO
    'seo-title': seo?.title || title,
    'seo-description': seo?.description || description?.slice(0, 160) || '',

    // Timestamps
    'published-at': publishedAt || new Date().toISOString(),
    'last-synced': new Date().toISOString(),

    // Sync metadata
    '_shopify-updated-at': updatedAt,
  };
}

/**
 * Map Shopify collection to Webflow CMS fields
 */
function mapCollectionToWebflow(shopifyCollection) {
  const {
    id,
    handle,
    title,
    description,
    descriptionHtml,
    image,
    products,
    seo,
  } = shopifyCollection;

  // Get product handles in this collection
  const productHandles = products?.edges?.map(
    edge => edge.node.handle
  ) || [];

  return {
    // Required Webflow fields
    name: title,
    slug: handle,

    // Custom fields
    'shopify-id': extractShopifyId(id),
    'collection-handle': handle,
    'collection-title': title,
    'description': description || '',
    'description-html': descriptionHtml || '',

    // Image
    'collection-image': image?.url || '',
    'collection-image-alt': image?.altText || title,

    // Product references
    'product-handles': productHandles.join(', '),
    'product-count': productHandles.length,

    // SEO
    'seo-title': seo?.title || title,
    'seo-description': seo?.description || description?.slice(0, 160) || '',

    // Sync metadata
    'last-synced': new Date().toISOString(),
  };
}

/**
 * Format price for display
 */
function formatPrice(priceObj) {
  if (!priceObj) return '';
  const { amount, currencyCode } = priceObj;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(parseFloat(amount));
}

/**
 * Validate mapped data against Webflow schema
 */
function validateMapping(mappedData, webflowSchema) {
  const errors = [];
  const requiredFields = webflowSchema.fields
    .filter(f => f.required)
    .map(f => f.slug);

  for (const field of requiredFields) {
    if (!mappedData[field] && mappedData[field] !== 0) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  mapProductToWebflow,
  mapCollectionToWebflow,
  extractShopifyId,
  formatPrice,
  validateMapping,
};
```

---

## 7. Sync Orchestration Script

### 7.1. Main Sync Script

```javascript
// scripts/sync-to-webflow.js

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const { fetchAllProducts, fetchAllCollections } = require('../src/_data/shopify');
const webflow = require('../src/_data/webflow');
const { mapProductToWebflow, mapCollectionToWebflow, extractShopifyId } = require('./schema-mapper');

// Configuration
const PRODUCTS_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_PRODUCTS;
const CATEGORIES_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_CATEGORIES;
const BATCH_SIZE = parseInt(process.env.SYNC_BATCH_SIZE) || 100;
const DRY_RUN = process.argv.includes('--dry-run');
const COLLECTION_FILTER = process.argv.find(arg => arg.startsWith('--collection='))?.split('=')[1];

// ID Mapping file path
const ID_MAPPING_PATH = path.join(__dirname, '../logs/id-mappings.json');
const SYNC_LOG_PATH = path.join(__dirname, '../logs/sync-history.json');

/**
 * Load existing ID mappings
 */
async function loadIdMappings() {
  try {
    const data = await fs.readFile(ID_MAPPING_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { products: {}, collections: {} };
  }
}

/**
 * Save ID mappings
 */
async function saveIdMappings(mappings) {
  await fs.mkdir(path.dirname(ID_MAPPING_PATH), { recursive: true });
  await fs.writeFile(ID_MAPPING_PATH, JSON.stringify(mappings, null, 2));
}

/**
 * Log sync operation
 */
async function logSyncOperation(operation) {
  let history = [];
  try {
    const data = await fs.readFile(SYNC_LOG_PATH, 'utf-8');
    history = JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet
  }

  history.unshift({
    ...operation,
    timestamp: new Date().toISOString(),
  });

  // Keep last 100 operations
  history = history.slice(0, 100);

  await fs.mkdir(path.dirname(SYNC_LOG_PATH), { recursive: true });
  await fs.writeFile(SYNC_LOG_PATH, JSON.stringify(history, null, 2));
}

/**
 * Sync products to Webflow
 */
async function syncProducts(products, idMappings) {
  console.log(`\nSyncing ${products.length} products to Webflow...`);

  const stats = { created: 0, updated: 0, skipped: 0, errors: 0 };
  const errors = [];

  // Get existing items from Webflow
  const existingItems = await webflow.getCollectionItems(PRODUCTS_COLLECTION_ID);
  const existingByShopifyId = {};

  for (const item of existingItems) {
    const shopifyId = item.fieldData['shopify-id'];
    if (shopifyId) {
      existingByShopifyId[shopifyId] = item;
    }
  }

  // Process products in batches
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}`);

    for (const product of batch) {
      try {
        const shopifyId = extractShopifyId(product.id);
        const mappedData = mapProductToWebflow(product);
        const existingItem = existingByShopifyId[shopifyId];

        if (DRY_RUN) {
          console.log(`[DRY RUN] Would ${existingItem ? 'update' : 'create'}: ${product.title}`);
          stats.skipped++;
          continue;
        }

        if (existingItem) {
          // Check if update is needed
          const lastSynced = existingItem.fieldData['_shopify-updated-at'];
          if (lastSynced === product.updatedAt) {
            console.log(`Skipping (unchanged): ${product.title}`);
            stats.skipped++;
            continue;
          }

          // Update existing item
          await webflow.updateItem(
            PRODUCTS_COLLECTION_ID,
            existingItem.id,
            mappedData,
            false
          );
          console.log(`Updated: ${product.title}`);
          stats.updated++;

          idMappings.products[shopifyId] = existingItem.id;
        } else {
          // Create new item
          const result = await webflow.createItem(
            PRODUCTS_COLLECTION_ID,
            mappedData,
            false
          );
          console.log(`Created: ${product.title}`);
          stats.created++;

          idMappings.products[shopifyId] = result.id;
        }
      } catch (error) {
        console.error(`Error syncing product ${product.title}:`, error.message);
        errors.push({ product: product.title, error: error.message });
        stats.errors++;
      }
    }
  }

  return { stats, errors };
}

/**
 * Sync collections to Webflow
 */
async function syncCollections(collections, idMappings) {
  console.log(`\nSyncing ${collections.length} collections to Webflow...`);

  const stats = { created: 0, updated: 0, skipped: 0, errors: 0 };
  const errors = [];

  // Get existing items from Webflow
  const existingItems = await webflow.getCollectionItems(CATEGORIES_COLLECTION_ID);
  const existingByShopifyId = {};

  for (const item of existingItems) {
    const shopifyId = item.fieldData['shopify-id'];
    if (shopifyId) {
      existingByShopifyId[shopifyId] = item;
    }
  }

  for (const collection of collections) {
    try {
      const shopifyId = extractShopifyId(collection.id);
      const mappedData = mapCollectionToWebflow(collection);
      const existingItem = existingByShopifyId[shopifyId];

      if (DRY_RUN) {
        console.log(`[DRY RUN] Would ${existingItem ? 'update' : 'create'}: ${collection.title}`);
        stats.skipped++;
        continue;
      }

      if (existingItem) {
        await webflow.updateItem(
          CATEGORIES_COLLECTION_ID,
          existingItem.id,
          mappedData,
          false
        );
        console.log(`Updated: ${collection.title}`);
        stats.updated++;

        idMappings.collections[shopifyId] = existingItem.id;
      } else {
        const result = await webflow.createItem(
          CATEGORIES_COLLECTION_ID,
          mappedData,
          false
        );
        console.log(`Created: ${collection.title}`);
        stats.created++;

        idMappings.collections[shopifyId] = result.id;
      }
    } catch (error) {
      console.error(`Error syncing collection ${collection.title}:`, error.message);
      errors.push({ collection: collection.title, error: error.message });
      stats.errors++;
    }
  }

  return { stats, errors };
}

/**
 * Main sync function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('11ty → Webflow CMS Sync');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Filter: ${COLLECTION_FILTER || 'all'}`);
  console.log('');

  const startTime = Date.now();
  const idMappings = await loadIdMappings();
  const results = { products: null, collections: null };

  try {
    // Fetch data from Shopify
    console.log('Fetching data from Shopify via GraphQL...');

    const [products, collections] = await Promise.all([
      (!COLLECTION_FILTER || COLLECTION_FILTER === 'products')
        ? fetchAllProducts()
        : Promise.resolve([]),
      (!COLLECTION_FILTER || COLLECTION_FILTER === 'collections')
        ? fetchAllCollections()
        : Promise.resolve([]),
    ]);

    console.log(`Fetched ${products.length} products, ${collections.length} collections`);

    // Sync to Webflow
    if (!COLLECTION_FILTER || COLLECTION_FILTER === 'products') {
      results.products = await syncProducts(products, idMappings);
    }

    if (!COLLECTION_FILTER || COLLECTION_FILTER === 'collections') {
      results.collections = await syncCollections(collections, idMappings);
    }

    // Save ID mappings
    if (!DRY_RUN) {
      await saveIdMappings(idMappings);
    }

    // Publish site (optional)
    if (!DRY_RUN && process.argv.includes('--publish')) {
      console.log('\nPublishing Webflow site...');
      await webflow.publishSite();
      console.log('Site published!');
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(60));
    console.log('SYNC COMPLETE');
    console.log('='.repeat(60));

    if (results.products) {
      console.log(`Products: ${results.products.stats.created} created, ${results.products.stats.updated} updated, ${results.products.stats.skipped} skipped, ${results.products.stats.errors} errors`);
    }
    if (results.collections) {
      console.log(`Collections: ${results.collections.stats.created} created, ${results.collections.stats.updated} updated, ${results.collections.stats.skipped} skipped, ${results.collections.stats.errors} errors`);
    }
    console.log(`Duration: ${duration}s`);

    // Log operation
    await logSyncOperation({
      mode: DRY_RUN ? 'dry-run' : 'live',
      filter: COLLECTION_FILTER || 'all',
      products: results.products?.stats,
      collections: results.collections?.stats,
      duration: parseFloat(duration),
      errors: [
        ...(results.products?.errors || []),
        ...(results.collections?.errors || []),
      ],
    });

  } catch (error) {
    console.error('\nSync failed:', error);
    process.exit(1);
  }
}

// Run
main();
```

---

## 8. CI/CD Integration (GitHub Actions)

### 8.1. Automated Sync Workflow

```yaml
# .github/workflows/sync-webflow.yml

name: Sync Shopify to Webflow

on:
  # Scheduled sync (every 6 hours)
  schedule:
    - cron: '0 */6 * * *'

  # Manual trigger
  workflow_dispatch:
    inputs:
      collection:
        description: 'Collection to sync (products, collections, or all)'
        required: false
        default: 'all'
      publish:
        description: 'Publish site after sync'
        required: false
        type: boolean
        default: true

  # Webhook trigger (from Shopify)
  repository_dispatch:
    types: [shopify-update]

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run sync
        env:
          SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
          SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${{ secrets.SHOPIFY_STOREFRONT_ACCESS_TOKEN }}
          WEBFLOW_API_TOKEN: ${{ secrets.WEBFLOW_API_TOKEN }}
          WEBFLOW_SITE_ID: ${{ secrets.WEBFLOW_SITE_ID }}
          WEBFLOW_COLLECTION_PRODUCTS: ${{ secrets.WEBFLOW_COLLECTION_PRODUCTS }}
          WEBFLOW_COLLECTION_CATEGORIES: ${{ secrets.WEBFLOW_COLLECTION_CATEGORIES }}
        run: |
          ARGS=""
          if [ "${{ github.event.inputs.collection }}" != "" ] && [ "${{ github.event.inputs.collection }}" != "all" ]; then
            ARGS="$ARGS --collection=${{ github.event.inputs.collection }}"
          fi
          if [ "${{ github.event.inputs.publish }}" == "true" ]; then
            ARGS="$ARGS --publish"
          fi
          npm run sync -- $ARGS

      - name: Upload sync logs
        uses: actions/upload-artifact@v4
        with:
          name: sync-logs
          path: logs/
          retention-days: 30
```

---

## 9. Webflow Collection Schema Reference

### 9.1. Products Collection Fields

| Field Name | Slug | Type | Required |
|------------|------|------|----------|
| Name | `name` | Plain Text | Yes |
| Slug | `slug` | Plain Text | Yes |
| Shopify ID | `shopify-id` | Plain Text | Yes |
| Product Title | `product-title` | Plain Text | No |
| Description | `description` | Plain Text | No |
| Description HTML | `description-html` | Rich Text | No |
| Product Type | `product-type` | Plain Text | No |
| Vendor | `vendor` | Plain Text | No |
| Tags | `tags` | Plain Text | No |
| Price | `price` | Number | No |
| Price Formatted | `price-formatted` | Plain Text | No |
| Compare At Price | `compare-at-price` | Number | No |
| Featured Image | `featured-image` | Image | No |
| Available | `available` | Switch | No |
| SKU | `sku` | Plain Text | No |
| Variants JSON | `variants-json` | Plain Text | No |
| SEO Title | `seo-title` | Plain Text | No |
| SEO Description | `seo-description` | Plain Text | No |
| Last Synced | `last-synced` | Date/Time | No |

### 9.2. Collections/Categories Fields

| Field Name | Slug | Type | Required |
|------------|------|------|----------|
| Name | `name` | Plain Text | Yes |
| Slug | `slug` | Plain Text | Yes |
| Shopify ID | `shopify-id` | Plain Text | Yes |
| Collection Title | `collection-title` | Plain Text | No |
| Description | `description` | Plain Text | No |
| Collection Image | `collection-image` | Image | No |
| Product Count | `product-count` | Number | No |
| SEO Title | `seo-title` | Plain Text | No |
| SEO Description | `seo-description` | Plain Text | No |
| Last Synced | `last-synced` | Date/Time | No |

---

## 10. Runtime Integration

### 10.1. Webflow Custom Code for Dynamic Features

```html
<!-- Add to Webflow Project Settings > Custom Code > Footer Code -->

<script>
/**
 * Runtime enhancements for Webflow + Shopify
 * Handles: Cart, real-time inventory, user sessions
 */
(function() {
  // Configuration
  const CONFIG = {
    xanoWebhook: 'https://your-xano.xano.io/api:xxx/webhook',
    shopifyDomain: 'your-store.myshopify.com',
    storefrontToken: 'your-public-storefront-token',
  };

  // Add to cart (uses Shopify Buy SDK or Storefront API)
  window.addToCart = async function(variantId, quantity = 1) {
    const checkoutId = localStorage.getItem('shopify_checkout_id');

    const mutation = `
      mutation addToCart($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
        checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
          checkout {
            id
            webUrl
            lineItems(first: 100) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
          checkoutUserErrors {
            message
          }
        }
      }
    `;

    // ... implement cart logic
  };

  // Check real-time inventory
  window.checkInventory = async function(productId) {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          variants(first: 100) {
            edges {
              node {
                id
                availableForSale
                quantityAvailable
              }
            }
          }
        }
      }
    `;

    // ... implement inventory check
  };

  // UCP Session integration (connects to middleware)
  window.UCPSession = {
    track: function(eventType, data) {
      fetch(CONFIG.xanoWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          eventData: data,
          sessionId: this.getSessionId(),
          timestamp: new Date().toISOString(),
        }),
      });
    },

    getSessionId: function() {
      let id = sessionStorage.getItem('ucp_session');
      if (!id) {
        id = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        sessionStorage.setItem('ucp_session', id);
      }
      return id;
    },
  };

  // Track page views
  UCPSession.track('page_view', {
    url: window.location.href,
    title: document.title,
  });
})();
</script>
```

---

## 11. Summary

### Architecture Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           BUILD TIME (Scheduled/Triggered)                  │
│                                                                            │
│  Shopify GraphQL ──▶ 11ty Fetch ──▶ Transform ──▶ Webflow CMS API         │
│  (Products, etc.)    (_data/*)      (schema-mapper)  (sync script)        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION (Webflow)                           │
│                                                                            │
│  Webflow Designer ──▶ CMS Collections ──▶ Published Static Site           │
│  (Visual design)      (populated by sync)  (CDN-served)                   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           RUNTIME (User Interactions)                      │
│                                                                            │
│  User ──▶ Webflow Site ──▶ Custom JS ──▶ Xano/n8n ──▶ Shopify/Google AI  │
│           (static content)  (dynamic)    (middleware)  (backend)          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Benefits

1. **GraphQL at build time** - Full query power without client exposure
2. **Webflow visual design** - Designer-friendly presentation layer
3. **SEO-optimized** - Static content in Webflow CMS
4. **Secure** - API tokens never reach the browser
5. **Scalable** - Sync runs on schedule, not per-request
6. **Flexible** - Runtime features via middleware layer
