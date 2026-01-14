# Implementation Examples: Webflow to Shopify & Google AI Integration

**Document Version:** 1.0  
**Date:** January 14, 2026  
**Author:** Manus AI

This document provides practical code examples and implementation patterns for integrating Webflow with Shopify and Google AI through Xano/n8n middleware.

---

## 1. Client-Side Implementation (Webflow)

### 1.1. UCP Session Manager

This JavaScript module manages the UCP session on the client-side, including session creation, data storage, and retrieval.

```javascript
/**
 * UCP Session Manager
 * Manages user session data, history, and consent in Webflow
 */
class UCPSessionManager {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionData = this.loadSession();
    this.webhookUrl = 'https://your-xano-instance.xano.io/api:xxx/webhook/ucp-session';
  }

  /**
   * Generate or retrieve session ID
   */
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('ucp_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ucp_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Load session from localStorage
   */
  loadSession() {
    const stored = localStorage.getItem('ucp_session');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse session data:', e);
      }
    }
    
    return {
      sessionId: this.sessionId,
      userId: null,
      email: null,
      consentStatus: {},
      userHistory: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Save session to localStorage
   */
  saveSession() {
    this.sessionData.lastUpdated = new Date().toISOString();
    localStorage.setItem('ucp_session', JSON.stringify(this.sessionData));
  }

  /**
   * Track user event
   */
  trackEvent(eventType, eventData = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      data: eventData,
      page: window.location.pathname,
      referrer: document.referrer
    };

    this.sessionData.userHistory.push(event);
    
    // Keep only last 100 events
    if (this.sessionData.userHistory.length > 100) {
      this.sessionData.userHistory.shift();
    }

    this.saveSession();
    this.sendWebhook('event_tracked', event);
  }

  /**
   * Update consent status
   */
  updateConsent(purpose, granted) {
    this.sessionData.consentStatus[purpose] = {
      granted: granted,
      timestamp: new Date().toISOString()
    };

    this.saveSession();
    this.sendWebhook('consent_updated', {
      purpose: purpose,
      granted: granted
    });
  }

  /**
   * Set user identity
   */
  setUserIdentity(userId, email) {
    this.sessionData.userId = userId;
    this.sessionData.email = email;
    this.saveSession();
    this.sendWebhook('user_identified', { userId, email });
  }

  /**
   * Send webhook to Xano/n8n
   */
  async sendWebhook(eventType, eventData) {
    try {
      const payload = {
        eventType: eventType,
        eventData: eventData,
        session: this.sessionData,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Webhook failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  /**
   * Get session data
   */
  getSession() {
    return this.sessionData;
  }
}

// Initialize session manager
const ucpSession = new UCPSessionManager();

// Track page view
ucpSession.trackEvent('page_view', {
  title: document.title,
  url: window.location.href
});

// Export for use in other scripts
window.ucpSession = ucpSession;
```

### 1.2. Consent Management UI

This example shows how to build a consent management interface in Webflow using Alpine.js.

```html
<!-- Consent Banner -->
<div x-data="consentManager()" x-show="!hasConsent" class="consent-banner">
  <div class="consent-content">
    <h3>Cookie & Data Consent</h3>
    <p>We use cookies and collect data to improve your experience. Please choose your preferences:</p>
    
    <div class="consent-options">
      <label>
        <input type="checkbox" x-model="preferences.analytics" />
        Analytics & Performance
      </label>
      <label>
        <input type="checkbox" x-model="preferences.marketing" />
        Marketing & Personalization
      </label>
      <label>
        <input type="checkbox" x-model="preferences.functional" checked disabled />
        Essential (Required)
      </label>
    </div>
    
    <div class="consent-actions">
      <button @click="acceptAll()">Accept All</button>
      <button @click="savePreferences()">Save Preferences</button>
      <button @click="rejectAll()">Reject All</button>
    </div>
  </div>
</div>

<script>
function consentManager() {
  return {
    hasConsent: localStorage.getItem('ucp_consent_set') === 'true',
    preferences: {
      analytics: false,
      marketing: false,
      functional: true
    },
    
    acceptAll() {
      this.preferences.analytics = true;
      this.preferences.marketing = true;
      this.savePreferences();
    },
    
    rejectAll() {
      this.preferences.analytics = false;
      this.preferences.marketing = false;
      this.savePreferences();
    },
    
    savePreferences() {
      // Update UCP session
      window.ucpSession.updateConsent('analytics', this.preferences.analytics);
      window.ucpSession.updateConsent('marketing', this.preferences.marketing);
      window.ucpSession.updateConsent('functional', this.preferences.functional);
      
      // Mark consent as set
      localStorage.setItem('ucp_consent_set', 'true');
      this.hasConsent = true;
    }
  };
}
</script>

<style>
.consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000;
  color: #fff;
  padding: 2rem;
  z-index: 10000;
}

.consent-content {
  max-width: 1200px;
  margin: 0 auto;
}

.consent-options {
  margin: 1.5rem 0;
}

.consent-options label {
  display: block;
  margin: 0.5rem 0;
  cursor: pointer;
}

.consent-actions {
  display: flex;
  gap: 1rem;
}

.consent-actions button {
  padding: 0.75rem 1.5rem;
  background: #fff;
  color: #000;
  border: none;
  cursor: pointer;
}

.consent-actions button:hover {
  background: #ccc;
}
</style>
```

### 1.3. WebSocket Client for Real-time Updates

This example shows how to implement a WebSocket client to receive real-time updates from the middleware.

```javascript
/**
 * WebSocket Client for Real-time Updates
 */
class UCPWebSocketClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = {};
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Send authentication
      this.send('authenticate', {
        sessionId: window.ucpSession.sessionId,
        userId: window.ucpSession.getSession().userId
      });
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  /**
   * Handle incoming message
   */
  handleMessage(message) {
    const { type, data } = message;
    
    // Trigger registered listeners
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(data));
    }
  }

  /**
   * Register event listener
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  /**
   * Send message to server
   */
  send(type, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  /**
   * Disconnect
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

// Initialize WebSocket client
const wsClient = new UCPWebSocketClient('wss://your-xano-instance.xano.io/ws');
wsClient.connect();

// Listen for consent confirmation
wsClient.on('consent_confirmed', (data) => {
  console.log('Consent confirmed:', data);
  // Update UI to show confirmation
});

// Listen for personalization updates
wsClient.on('personalization_update', (data) => {
  console.log('Personalization update:', data);
  // Apply personalization to the page
});

// Export for use in other scripts
window.wsClient = wsClient;
```

---

## 2. Middleware Implementation (Xano)

### 2.1. Xano Webhook Endpoint

This example shows how to set up a webhook endpoint in Xano to receive data from Webflow.

**Xano Function Stack:**

1.  **Input:** Parse incoming JSON payload
2.  **Validate:** Check for required fields
3.  **Transform:** Extract and structure data
4.  **Shopify Sync:** Update customer record and metaobjects
5.  **Google AI Stream:** Send data to Google AI
6.  **WebSocket Emit:** Send real-time update to client
7.  **Response:** Return success status

**Xano Code Example (Pseudo-code):**

```javascript
// 1. Parse Input
const payload = $input.body;
const eventType = payload.eventType;
const eventData = payload.eventData;
const session = payload.session;

// 2. Validate
if (!session.sessionId || !eventType) {
  return { success: false, error: 'Missing required fields' };
}

// 3. Transform Data
const customerData = {
  email: session.email,
  first_name: session.firstName,
  last_name: session.lastName,
  tags: ['ucp-user', `session-${session.sessionId}`]
};

const metaobjectData = {
  consent_status: JSON.stringify(session.consentStatus),
  user_history: JSON.stringify(session.userHistory),
  last_seen: new Date().toISOString()
};

// 4. Shopify Sync
const shopifyCustomer = await shopify_find_or_create_customer(customerData);
await shopify_update_metaobject(shopifyCustomer.id, 'ucp_user_profile', metaobjectData);

// 5. Google AI Stream
await google_ai_stream_event({
  user_id: shopifyCustomer.id,
  session_id: session.sessionId,
  event_type: eventType,
  event_data: eventData,
  timestamp: new Date().toISOString()
});

// 6. WebSocket Emit
await websocket_emit(session.sessionId, {
  type: `${eventType}_confirmed`,
  data: {
    success: true,
    timestamp: new Date().toISOString()
  }
});

// 7. Response
return {
  success: true,
  customerId: shopifyCustomer.id,
  timestamp: new Date().toISOString()
};
```

### 2.2. Shopify Integration with Idempotency

This example shows how to implement idempotency checks when syncing data to Shopify.

```javascript
/**
 * Shopify Sync with Idempotency
 */
async function syncToShopify(session, eventType, eventData) {
  // Generate idempotency key
  const idempotencyKey = `${session.sessionId}_${eventType}_${Date.now()}`;
  
  // Check if operation was already processed
  const existingOperation = await xano.query('idempotency_log')
    .where('idempotency_key', idempotencyKey)
    .first();
  
  if (existingOperation) {
    console.log('Duplicate operation detected, skipping');
    return existingOperation.result;
  }
  
  try {
    // Find or create customer
    const customer = await shopify.findCustomerByEmail(session.email);
    let customerId;
    
    if (!customer) {
      const newCustomer = await shopify.createCustomer({
        email: session.email,
        first_name: session.firstName,
        last_name: session.lastName,
        tags: ['ucp-user']
      });
      customerId = newCustomer.id;
    } else {
      customerId = customer.id;
    }
    
    // Update metaobject
    await shopify.updateMetaobject({
      ownerId: customerId,
      namespace: 'ucp',
      key: 'user_profile',
      value: JSON.stringify({
        consent_status: session.consentStatus,
        user_history: session.userHistory,
        last_seen: new Date().toISOString()
      })
    });
    
    // Log operation for idempotency
    const result = { success: true, customerId };
    await xano.insert('idempotency_log', {
      idempotency_key: idempotencyKey,
      result: result,
      created_at: new Date().toISOString()
    });
    
    return result;
  } catch (error) {
    console.error('Shopify sync error:', error);
    throw error;
  }
}
```

---

## 3. n8n Workflow Example

### 3.1. Complete n8n Workflow

This example shows a complete n8n workflow for processing UCP session data.

**Workflow Nodes:**

1.  **Webhook Trigger:** Receives POST request from Webflow
2.  **Function Node:** Parse and validate data
3.  **Shopify Node:** Find or create customer
4.  **HTTP Request Node:** Update Shopify metaobject
5.  **HTTP Request Node:** Stream to Google AI
6.  **WebSocket Node:** Emit real-time update
7.  **Respond to Webhook:** Return success response

**n8n Function Node Example:**

```javascript
// Parse incoming webhook data
const payload = $input.item.json;
const eventType = payload.eventType;
const session = payload.session;

// Validate required fields
if (!session.email || !session.sessionId) {
  throw new Error('Missing required fields');
}

// Transform data for Shopify
const shopifyData = {
  email: session.email,
  firstName: session.firstName || '',
  lastName: session.lastName || '',
  tags: ['ucp-user', `session-${session.sessionId}`],
  metafields: [
    {
      namespace: 'ucp',
      key: 'consent_status',
      value: JSON.stringify(session.consentStatus),
      type: 'json'
    },
    {
      namespace: 'ucp',
      key: 'user_history',
      value: JSON.stringify(session.userHistory),
      type: 'json'
    }
  ]
};

// Transform data for Google AI
const googleAIData = {
  user_id: session.userId,
  session_id: session.sessionId,
  event_type: eventType,
  event_data: payload.eventData,
  consent_status: session.consentStatus,
  timestamp: new Date().toISOString()
};

// Return transformed data
return [
  {
    json: {
      shopifyData,
      googleAIData,
      session
    }
  }
];
```

---

## 4. Shopify GraphQL Examples

### 4.1. Create Customer with Metaobject

```graphql
mutation createCustomerWithMetaobject($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
      metafields(first: 10) {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables:**

```json
{
  "input": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tags": ["ucp-user"],
    "metafields": [
      {
        "namespace": "ucp",
        "key": "consent_status",
        "value": "{\"analytics\":true,\"marketing\":false}",
        "type": "json"
      }
    ]
  }
}
```

### 4.2. Update Customer Metaobject

```graphql
mutation updateCustomerMetaobject($metaobjectId: ID!, $metaobject: MetaobjectUpdateInput!) {
  metaobjectUpdate(id: $metaobjectId, metaobject: $metaobject) {
    metaobject {
      id
      fields {
        key
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables:**

```json
{
  "metaobjectId": "gid://shopify/Metaobject/123456",
  "metaobject": {
    "fields": [
      {
        "key": "consent_status",
        "value": "{\"analytics\":true,\"marketing\":true}"
      },
      {
        "key": "last_seen",
        "value": "2026-01-14T12:00:00Z"
      }
    ]
  }
}
```

---

## 5. Security Implementation

### 5.1. JWT Token Generation (Xano)

```javascript
/**
 * Generate JWT token for secure communication
 */
function generateJWT(userId, sessionId) {
  const payload = {
    userId: userId,
    sessionId: sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  
  const secret = env.JWT_SECRET;
  return jwt.sign(payload, secret);
}
```

### 5.2. Webhook Signature Verification

```javascript
/**
 * Verify webhook signature
 */
function verifyWebhookSignature(payload, signature, secret) {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 6. Testing & Debugging

### 6.1. Test Webhook Locally

```bash
# Use curl to test webhook endpoint
curl -X POST https://your-xano-instance.xano.io/api:xxx/webhook/ucp-session \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "consent_updated",
    "eventData": {
      "purpose": "analytics",
      "granted": true
    },
    "session": {
      "sessionId": "session_123",
      "email": "test@example.com",
      "consentStatus": {
        "analytics": true
      },
      "userHistory": []
    }
  }'
```

### 6.2. Debug WebSocket Connection

```javascript
// Test WebSocket connection
const ws = new WebSocket('wss://your-xano-instance.xano.io/ws');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'authenticate',
    data: { sessionId: 'test_session' }
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

ws.onerror = (error) => {
  console.error('Error:', error);
};
```

---

This implementation guide provides all the necessary code examples and patterns to build a complete integration between Webflow, Xano/n8n, Shopify, and Google AI Platform.
