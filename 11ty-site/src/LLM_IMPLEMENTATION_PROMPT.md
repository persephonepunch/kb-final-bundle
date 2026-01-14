# LLM Implementation Prompt: 11ty + Shopify UCP + Google AI Integration

## Overview

This document provides a complete, step-by-step implementation prompt for Large Language Models (Claude, GPT-4, etc.) to build an Eleventy (11ty) static site with Shopify Universal Commerce Protocol (UCP) integration, OAuth 2.0 authentication, A2P payment processing, and Google AI data streaming.

---

## Prompt for LLM

```
You are tasked with building a complete e-commerce static site using Eleventy (11ty) that integrates with modern commerce protocols and AI services. Follow these instructions carefully to implement each component.

## PROJECT REQUIREMENTS

Build a static e-commerce site with the following features:

1. **Static Site Generation**: Use Eleventy (11ty) v3.x with Nunjucks templates
2. **Product Catalog**: Fetch products from Shopify's Universal Commerce Protocol (UCP) Catalog API
3. **User Authentication**: Implement OAuth 2.0 with PKCE for secure login
4. **Payment Processing**: Use Agent Payments Protocol (A2P) for cryptographic payment mandates
5. **Real-time Data**: Stream user behavior to Google AI via WebSocket
6. **Consent Management**: GDPR-compliant user consent tracking
7. **Responsive Design**: Mobile-first CSS with BEM methodology

## TECHNICAL STACK

- **Frontend**: Eleventy 11ty, Nunjucks, Vanilla JavaScript (ES6+), CSS3
- **APIs**: Shopify UCP Catalog REST API, OAuth 2.0, A2P Payment Gateway, Google AI Data Stream
- **Data Flow**: REST APIs, WebSocket, Server-Sent Events
- **Security**: JWT tokens, TLS 1.3, PKCE, PCI DSS compliance

## IMPLEMENTATION STEPS

### STEP 1: Initialize 11ty Project

Create a new 11ty project with the following structure:

```
project-root/
├── .eleventy.js           # 11ty configuration
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── src/
│   ├── _data/             # Data files for build-time fetching
│   │   ├── ucpClient.js   # UCP API client
│   │   └── products.js    # Product data fetcher
│   ├── _includes/
│   │   ├── layouts/
│   │   │   └── base.njk   # Base layout template
│   │   └── components/
│   │       ├── header.njk
│   │       ├── footer.njk
│   │       └── product-card.njk
│   ├── css/
│   │   └── main.css       # Vanilla CSS with BEM
│   ├── js/
│   │   ├── auth.js        # OAuth 2.0 client
│   │   ├── payment.js     # A2P payment handler
│   │   ├── websocket.js   # WebSocket client
│   │   └── main.js        # Main application logic
│   ├── index.njk          # Homepage
│   ├── products.njk       # Product listing page
│   └── checkout.njk       # Checkout page
└── _site/                 # Generated static site (output)
```

**package.json dependencies:**
```json
{
  "name": "11ty-ucp-integration",
  "version": "1.0.0",
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy"
  },
  "dependencies": {
    "@11ty/eleventy": "^3.0.0",
    "node-fetch": "^3.3.0",
    "dotenv": "^16.0.0"
  }
}
```

**.eleventy.js configuration:**
```javascript
module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  
  // Set directories
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
```

### STEP 2: Implement UCP Catalog Integration

Create a client to fetch products from Shopify's UCP Catalog API at build time.

**src/_data/ucpClient.js:**
```javascript
import fetch from 'node-fetch';

class UCPClient {
  constructor() {
    this.baseURL = process.env.UCP_CATALOG_API_URL;
    this.clientId = process.env.UCP_CLIENT_ID;
    this.clientSecret = process.env.UCP_CLIENT_SECRET;
    this.token = null;
  }

  async authenticate() {
    // Generate JWT token for API authentication
    const response = await fetch(`${this.baseURL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      })
    });
    
    const data = await response.json();
    this.token = data.access_token;
  }

  async fetchProducts() {
    if (!this.token) await this.authenticate();
    
    const response = await fetch(`${this.baseURL}/catalog/products`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  }
}

module.exports = new UCPClient();
```

**src/_data/products.js:**
```javascript
const ucpClient = require('./ucpClient');

module.exports = async function() {
  try {
    const data = await ucpClient.fetchProducts();
    return data.products || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return []; // Return empty array as fallback
  }
};
```

### STEP 3: Create Templates

**src/_includes/layouts/base.njk:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title | default("E-Commerce Store") }}</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  {% include "components/header.njk" %}
  
  <main>
    {{ content | safe }}
  </main>
  
  {% include "components/footer.njk" %}
  
  <script src="/js/auth.js"></script>
  <script src="/js/payment.js"></script>
  <script src="/js/websocket.js"></script>
  <script src="/js/main.js"></script>
</body>
</html>
```

**src/index.njk:**
```html
---
layout: layouts/base.njk
title: "Home - E-Commerce Store"
---

<section class="hero">
  <div class="container">
    <h1>Welcome to Our Store</h1>
    <p>Discover amazing products powered by Universal Commerce Protocol</p>
  </div>
</section>

<section class="products">
  <div class="container">
    <h2>Featured Products</h2>
    <div class="product-grid">
      {% for product in products %}
        {% include "components/product-card.njk" %}
      {% endfor %}
    </div>
  </div>
</section>
```

**src/_includes/components/product-card.njk:**
```html
<article class="product-card">
  <img src="{{ product.image }}" alt="{{ product.name }}" class="product-card__image">
  <div class="product-card__content">
    <h3 class="product-card__title">{{ product.name }}</h3>
    <p class="product-card__description">{{ product.description }}</p>
    <div class="product-card__footer">
      <span class="product-card__price">${{ product.price }}</span>
      <button class="btn btn--primary" data-product-id="{{ product.id }}">
        Add to Cart
      </button>
    </div>
  </div>
</article>
```

### STEP 4: Implement OAuth 2.0 Authentication

**src/js/auth.js:**
```javascript
class AuthManager {
  constructor() {
    this.authEndpoint = 'https://identity-provider.example.com/authorize';
    this.tokenEndpoint = 'https://identity-provider.example.com/token';
    this.clientId = 'your-client-id';
    this.redirectUri = window.location.origin + '/callback';
  }

  // Generate PKCE code verifier and challenge
  async generatePKCE() {
    const verifier = this.generateRandomString(128);
    const challenge = await this.sha256(verifier);
    return { verifier, challenge };
  }

  generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Initiate OAuth 2.0 login flow
  async login() {
    const { verifier, challenge } = await this.generatePKCE();
    
    // Store verifier for later use
    sessionStorage.setItem('pkce_verifier', verifier);
    
    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'openid profile email',
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });
    
    // Redirect to authorization endpoint
    window.location.href = `${this.authEndpoint}?${params.toString()}`;
  }

  // Handle OAuth callback
  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      console.error('No authorization code received');
      return;
    }
    
    const verifier = sessionStorage.getItem('pkce_verifier');
    
    // Exchange code for tokens
    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: verifier
      })
    });
    
    const tokens = await response.json();
    
    // Store tokens securely
    this.storeTokens(tokens);
    
    // Clean up
    sessionStorage.removeItem('pkce_verifier');
    
    // Redirect to home
    window.location.href = '/';
  }

  storeTokens(tokens) {
    // In production, use httpOnly cookies via backend
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('id_token', tokens.id_token);
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  }
}

// Initialize auth manager
window.authManager = new AuthManager();

// Handle callback if on callback page
if (window.location.pathname === '/callback') {
  window.authManager.handleCallback();
}
```

### STEP 5: Implement A2P Payment Processing

**src/js/payment.js:**
```javascript
class PaymentManager {
  constructor() {
    this.paymentEndpoint = 'https://payment-gateway.example.com/mandate';
  }

  // Generate payment mandate
  async createMandate(orderData) {
    const mandate = {
      mandate_id: this.generateUUID(),
      amount: orderData.total,
      currency: 'USD',
      merchant_id: 'your-merchant-id',
      timestamp: new Date().toISOString(),
      nonce: this.generateRandomString(32),
      items: orderData.items
    };
    
    return mandate;
  }

  // Sign mandate with cryptographic signature
  async signMandate(mandate) {
    // In production, use Web Crypto API or backend signing
    const mandateString = JSON.stringify(mandate);
    const encoder = new TextEncoder();
    const data = encoder.encode(mandateString);
    
    // Generate signature (simplified - use proper crypto in production)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const signature = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    
    return signature;
  }

  // Submit payment mandate
  async processPayment(orderData) {
    const mandate = await this.createMandate(orderData);
    const signature = await this.signMandate(mandate);
    
    const response = await fetch(this.paymentEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.authManager.getAccessToken()}`
      },
      body: JSON.stringify({
        mandate: mandate,
        signature: signature,
        public_key: 'your-public-key'
      })
    });
    
    if (!response.ok) {
      throw new Error('Payment processing failed');
    }
    
    return await response.json();
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

window.paymentManager = new PaymentManager();
```

### STEP 6: Implement WebSocket Data Streaming

**src/js/websocket.js:**
```javascript
class DataStreamManager {
  constructor() {
    this.wsEndpoint = 'wss://stream.example.com/data';
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connect to WebSocket server
  connect() {
    if (!this.hasUserConsent()) {
      console.log('User has not consented to data streaming');
      return;
    }
    
    const token = window.authManager.getAccessToken();
    this.ws = new WebSocket(`${this.wsEndpoint}?token=${token}`);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnect();
    };
  }

  // Send event to Google AI
  sendEvent(eventType, eventData) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    
    const event = {
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      user_id: this.getUserId()
    };
    
    this.ws.send(JSON.stringify(event));
  }

  // Handle incoming messages (AI recommendations)
  handleMessage(data) {
    if (data.type === 'recommendation') {
      this.displayRecommendations(data.products);
    } else if (data.type === 'personalization') {
      this.applyPersonalization(data.settings);
    }
  }

  // Reconnect logic
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  hasUserConsent() {
    return localStorage.getItem('data_streaming_consent') === 'true';
  }

  getUserId() {
    // Extract from ID token or session
    return 'user-id-placeholder';
  }

  displayRecommendations(products) {
    // Update UI with recommended products
    console.log('Received recommendations:', products);
  }

  applyPersonalization(settings) {
    // Apply personalization settings to UI
    console.log('Applying personalization:', settings);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

window.dataStreamManager = new DataStreamManager();
```

### STEP 7: Implement Main Application Logic

**src/js/main.js:**
```javascript
// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initializeAuth();
  initializeCart();
  initializeDataStreaming();
  attachEventListeners();
});

function initializeAuth() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (window.authManager.isAuthenticated()) {
    loginBtn?.classList.add('hidden');
    logoutBtn?.classList.remove('hidden');
  } else {
    loginBtn?.classList.remove('hidden');
    logoutBtn?.classList.add('hidden');
  }
  
  loginBtn?.addEventListener('click', () => {
    window.authManager.login();
  });
  
  logoutBtn?.addEventListener('click', () => {
    window.authManager.logout();
  });
}

function initializeCart() {
  // Load cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  updateCartUI(cart);
}

function initializeDataStreaming() {
  if (window.authManager.isAuthenticated()) {
    window.dataStreamManager.connect();
    
    // Track page view
    window.dataStreamManager.sendEvent('pageview', {
      page: window.location.pathname,
      title: document.title
    });
  }
}

function attachEventListeners() {
  // Add to cart buttons
  document.querySelectorAll('[data-product-id]').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      addToCart(productId);
      
      // Track event
      window.dataStreamManager.sendEvent('add_to_cart', {
        product_id: productId
      });
    });
  });
  
  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn?.addEventListener('click', handleCheckout);
  
  // Consent toggle
  const consentToggle = document.getElementById('consentToggle');
  consentToggle?.addEventListener('change', (e) => {
    const consent = e.target.checked;
    localStorage.setItem('data_streaming_consent', consent);
    
    if (consent) {
      window.dataStreamManager.connect();
    } else {
      window.dataStreamManager.disconnect();
    }
  });
}

function addToCart(productId) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push(productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI(cart);
}

function updateCartUI(cart) {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

async function handleCheckout() {
  if (!window.authManager.isAuthenticated()) {
    alert('Please log in to checkout');
    window.authManager.login();
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  
  try {
    // Calculate total and prepare order data
    const orderData = {
      items: cart,
      total: calculateTotal(cart)
    };
    
    // Process payment
    const result = await window.paymentManager.processPayment(orderData);
    
    if (result.status === 'success') {
      // Track purchase
      window.dataStreamManager.sendEvent('purchase', {
        transaction_id: result.transaction_id,
        total: orderData.total,
        items: cart
      });
      
      // Clear cart
      localStorage.setItem('cart', '[]');
      updateCartUI([]);
      
      // Show confirmation
      window.location.href = '/confirmation?id=' + result.transaction_id;
    }
  } catch (error) {
    console.error('Checkout failed:', error);
    alert('Payment processing failed. Please try again.');
  }
}

function calculateTotal(cart) {
  // Calculate total from cart items
  // In production, fetch current prices from API
  return cart.length * 99.99; // Placeholder
}
```

### STEP 8: Create CSS Styles

**src/css/main.css:**
```css
/* CSS Variables */
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-text: #1e293b;
  --color-bg: #ffffff;
  --color-border: #e2e8f0;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --spacing-unit: 8px;
}

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 calc(var(--spacing-unit) * 2);
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: calc(var(--spacing-unit) * 10) 0;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: calc(var(--spacing-unit) * 2);
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: calc(var(--spacing-unit) * 3);
  margin-top: calc(var(--spacing-unit) * 4);
}

/* Product Card (BEM) */
.product-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.product-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-card__content {
  padding: calc(var(--spacing-unit) * 2);
}

.product-card__title {
  font-size: 1.25rem;
  margin-bottom: calc(var(--spacing-unit));
}

.product-card__description {
  color: var(--color-secondary);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card__price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

/* Button */
.btn {
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: #1d4ed8;
}

/* Utility */
.hidden {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}
```

### STEP 9: Environment Configuration

Create **.env.example:**
```
# Shopify UCP Catalog API
UCP_CATALOG_API_URL=https://catalog.shopify.com/api/v1
UCP_CLIENT_ID=your-client-id
UCP_CLIENT_SECRET=your-client-secret

# OAuth 2.0
OAUTH_AUTHORIZE_URL=https://identity-provider.example.com/authorize
OAUTH_TOKEN_URL=https://identity-provider.example.com/token
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_REDIRECT_URI=http://localhost:8080/callback

# A2P Payment Gateway
PAYMENT_GATEWAY_URL=https://payment-gateway.example.com
PAYMENT_MERCHANT_ID=your-merchant-id

# Google AI Data Stream
GOOGLE_AI_STREAM_URL=wss://stream.google.com/data
GOOGLE_AI_API_KEY=your-api-key

# WebSocket Server
WEBSOCKET_SERVER_URL=wss://your-websocket-server.com
```

### STEP 10: Testing and Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Run development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy to CDN:**
   - Upload `_site/` directory to your CDN or static hosting provider
   - Configure custom domain and SSL certificate
   - Set up environment variables in hosting platform

## SECURITY CHECKLIST

- [ ] Use HTTPS/TLS 1.3 for all connections
- [ ] Implement PKCE for OAuth 2.0
- [ ] Store tokens in httpOnly cookies (not localStorage in production)
- [ ] Validate all user inputs
- [ ] Implement CSRF protection
- [ ] Use Content Security Policy (CSP) headers
- [ ] Implement rate limiting on API endpoints
- [ ] Encrypt sensitive data at rest
- [ ] Regular security audits and dependency updates
- [ ] GDPR compliance for user data
- [ ] PCI DSS compliance for payment processing

## SUCCESS CRITERIA

- [ ] Build completes in < 30 seconds
- [ ] Page load time < 2 seconds (Lighthouse score > 90)
- [ ] All products display correctly from UCP API
- [ ] OAuth 2.0 login flow works end-to-end
- [ ] Payment processing succeeds with valid test cards
- [ ] WebSocket connection remains stable
- [ ] User consent properly tracked and respected
- [ ] Mobile responsive design works on all devices
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility score > 90 (WCAG 2.1 AA compliant)

## TROUBLESHOOTING

**Build fails:**
- Check Node.js version (v18+ required)
- Verify all dependencies installed
- Check environment variables are set

**Products not loading:**
- Verify UCP API credentials
- Check API endpoint URL
- Inspect network requests in browser DevTools

**OAuth login fails:**
- Verify redirect URI matches configuration
- Check PKCE implementation
- Inspect authorization endpoint response

**Payment processing fails:**
- Verify payment gateway credentials
- Check mandate signature generation
- Inspect payment endpoint response

**WebSocket disconnects:**
- Check WebSocket server URL
- Verify authentication token
- Implement reconnection logic

## NEXT STEPS

After completing the basic implementation:

1. **Add product search and filtering**
2. **Implement order history page**
3. **Add email notifications**
4. **Integrate analytics dashboard**
5. **Implement A/B testing**
6. **Add multi-language support**
7. **Optimize images and assets**
8. **Implement progressive web app (PWA) features**
9. **Add automated testing (unit, integration, e2e)**
10. **Set up CI/CD pipeline**

## RESOURCES

- [Eleventy Documentation](https://www.11ty.dev/docs/)
- [Shopify UCP Specification](https://ucp.dev/)
- [OAuth 2.0 RFC](https://oauth.net/2/)
- [A2P Protocol Specification](https://ap2-protocol.org/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**END OF IMPLEMENTATION PROMPT**
```

---

## How to Use This Prompt

1. **Copy the entire prompt** (everything between the triple backticks in the "Prompt for LLM" section)
2. **Paste into your LLM** (Claude, GPT-4, etc.)
3. **The LLM will follow the step-by-step instructions** to build the complete system
4. **Review and customize** the generated code for your specific needs
5. **Test thoroughly** before deploying to production

## Notes for LLMs

- Follow the steps sequentially
- Create all files as specified
- Use the exact directory structure provided
- Implement error handling and validation
- Add comments to explain complex logic
- Follow security best practices
- Test each component before moving to the next step

## Customization

You can customize this prompt by:

- Changing the CSS framework (add Tailwind, Bootstrap, etc.)
- Using different template engines (Liquid, Handlebars, etc.)
- Adding additional features (search, reviews, wishlists, etc.)
- Integrating different payment providers
- Using alternative authentication methods
- Connecting to different AI services

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-14  
**Compatibility:** Eleventy 3.x, Node.js 18+
