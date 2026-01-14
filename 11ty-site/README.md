# Webflow Integration Knowledge Base - 11ty Static Site

A pure 11ty static site with vanilla CSS and JavaScript, designed for easy integration into Webflow and Shopify.

## Features

- **Pure Static HTML/CSS/JS**: No frameworks, no build dependencies in production
- **BEM CSS Methodology**: Clean, maintainable CSS with semantic class names
- **Vanilla JavaScript**: No jQuery or other libraries required
- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop
- **IBM Plex Typography**: Professional monospace and sans-serif font pairing
- **Copy-to-Clipboard**: Code examples with one-click copying
- **Tab Navigation**: Interactive tabs for organizing code examples
- **Mobile Menu**: Hamburger menu for mobile navigation
- **Search Ready**: Search input prepared for integration with search libraries

## Project Structure

```
kb-11ty/
├── src/
│   ├── _includes/
│   │   ├── layouts/
│   │   │   └── base.njk           # Base HTML layout
│   │   └── components/
│   │       ├── header.njk         # Site header with navigation
│   │       └── footer.njk         # Site footer
│   ├── css/
│   │   └── main.css               # All styles (BEM methodology)
│   ├── js/
│   │   └── main.js                # All JavaScript functionality
│   ├── index.njk                  # Homepage
│   ├── architecture.njk           # Architecture documentation
│   ├── implementation.njk         # Implementation examples
│   └── eleventy-graphql.njk       # 11ty GraphQL guide
├── _site/                         # Generated static site (output)
├── .eleventy.js                   # 11ty configuration
└── package.json                   # Project dependencies
```

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server with live reload:

```bash
npm start
```

The site will be available at `http://localhost:8080`

### Build

Generate the static site:

```bash
npm run build
```

The built site will be in the `_site` directory.

### Clean

Remove the generated site:

```bash
npm run clean
```

## Integration with Webflow

The generated static site can be integrated into Webflow in several ways:

### Option 1: Copy HTML/CSS/JS

1. Build the site: `npm run build`
2. Copy the contents of `_site/css/main.css` into Webflow's Custom Code (Site Settings → Custom Code → Head Code wrapped in `<style>` tags)
3. Copy the contents of `_site/js/main.js` into Webflow's Custom Code (Site Settings → Custom Code → Footer Code wrapped in `<script>` tags)
4. Use the HTML from `_site/*.html` files as reference for building Webflow components

### Option 2: Host Static Assets

1. Build the site: `npm run build`
2. Upload `_site/css/main.css` and `_site/js/main.js` to a CDN or static hosting
3. Link to these files in Webflow's Custom Code:
   ```html
   <link rel="stylesheet" href="https://your-cdn.com/main.css">
   <script src="https://your-cdn.com/main.js"></script>
   ```

### Option 3: Embed Pages

1. Build the site: `npm run build`
2. Host the entire `_site` directory on a static hosting service
3. Use Webflow's Embed element to iframe specific pages

## Integration with Shopify

The static site can be integrated into Shopify themes:

### Option 1: Theme Assets

1. Build the site: `npm run build`
2. Copy `_site/css/main.css` to `assets/kb-main.css` in your Shopify theme
3. Copy `_site/js/main.js` to `assets/kb-main.js` in your Shopify theme
4. Include in your theme layout:
   ```liquid
   {{ 'kb-main.css' | asset_url | stylesheet_tag }}
   {{ 'kb-main.js' | asset_url | script_tag }}
   ```

### Option 2: Shopify Pages

1. Build the site: `npm run build`
2. Create new pages in Shopify admin
3. Copy the HTML content from `_site/*.html` files into Shopify pages
4. Adjust Liquid template tags as needed

### Option 3: Custom Sections

1. Build the site: `npm run build`
2. Create custom Shopify sections based on the HTML structure
3. Include the CSS and JS as theme assets

## CSS Architecture

The CSS follows BEM (Block Element Modifier) methodology:

- **Blocks**: Independent components (e.g., `.header`, `.card`, `.btn`)
- **Elements**: Parts of blocks (e.g., `.header-inner`, `.card-title`)
- **Modifiers**: Variations (e.g., `.btn-primary`, `.card-hover`)

### CSS Variables

All design tokens are defined as CSS variables in `:root`:

- Colors: `--color-black`, `--color-grey-*`, `--color-red`
- Typography: `--font-sans`, `--font-mono`
- Spacing: `--space-xs` through `--space-3xl`
- Transitions: `--transition-fast`, `--transition-base`, `--transition-slow`

## JavaScript Features

All JavaScript is vanilla (no dependencies):

- **Mobile Menu**: Toggle navigation on mobile devices
- **Tabs**: Switch between code example categories
- **Copy to Clipboard**: Copy code examples with one click
- **Smooth Scroll**: Smooth scrolling for anchor links
- **Search**: Client-side search functionality (basic implementation)

## Customization

### Colors

Edit CSS variables in `src/css/main.css`:

```css
:root {
  --color-black: #000000;
  --color-red: #cc0000;
  /* ... */
}
```

### Typography

Change font families in `src/_includes/layouts/base.njk`:

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

Then update CSS variables:

```css
:root {
  --font-sans: 'Your Font', sans-serif;
}
```

### Content

Edit the Nunjucks templates in `src/`:

- `index.njk` - Homepage
- `architecture.njk` - Architecture page
- `implementation.njk` - Implementation page
- `eleventy-graphql.njk` - 11ty GraphQL page

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

The generated site is optimized for performance:

- **No external dependencies**: All CSS and JS are self-contained
- **Minimal file sizes**: CSS ~20KB, JS ~5KB (uncompressed)
- **Static HTML**: Pre-rendered pages for instant loading
- **No runtime frameworks**: Pure HTML/CSS/JS for maximum speed

## Environment Variables

Create a `.env` file in your project root. Copy from `.env.example`:

```bash
# =============================================================================
# ENVIRONMENT CONFIGURATION
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
# SHOPIFY UCP CATALOG API
# -----------------------------------------------------------------------------
UCP_CATALOG_API_URL=https://catalog.shopify.com/api/v1
UCP_CLIENT_ID=your-ucp-client-id
UCP_CLIENT_SECRET=your-ucp-client-secret

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
GOOGLE_AI_STREAM_URL=wss://stream.google.com/data
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

### Getting API Keys

| Service | Where to Get |
|---------|--------------|
| **Shopify Storefront** | Shopify Admin → Settings → Apps → Develop apps → Create app → Storefront API |
| **Shopify Admin** | Shopify Admin → Settings → Apps → Develop apps → Create app → Admin API |
| **Webflow** | Webflow Dashboard → Site Settings → Integrations → API Token |
| **Xano** | Xano Dashboard → Settings → API Keys |
| **Google AI** | Google Cloud Console → APIs & Services → Credentials |
| **Netlify** | Netlify Dashboard → User Settings → Applications → Personal access tokens |
| **GitHub** | GitHub → Settings → Developer settings → Personal access tokens |

## API Documentation

Full API endpoint schemas are available in the deployed documentation:

- **PRD with API Schemas**: [/CLAUDE_PRD_11TY_SHOPIFY_UCP/](https://kb-webflow-docs.netlify.app/CLAUDE_PRD_11TY_SHOPIFY_UCP/)
- **LLM Implementation Prompt**: [/LLM_IMPLEMENTATION_PROMPT/](https://kb-webflow-docs.netlify.app/LLM_IMPLEMENTATION_PROMPT/)

### Available API Endpoints

| API | Endpoints |
|-----|-----------|
| **Users** | `POST /users`, `GET /users/{id}`, `PATCH /users/{id}/consent`, `GET /users` |
| **Products** | `GET /products`, `GET /products/{handle}`, `POST /products/sync` |
| **UCP Session** | `POST /ucp/session`, `POST /ucp/event`, `PATCH /ucp/session/{id}/tags` |
| **Idempotency** | `GET /idempotency/{key}`, `POST /idempotency`, `PATCH /idempotency/{key}` |
| **Webhooks** | `POST /webhooks`, `GET /webhooks/{id}/deliveries` |

## License

ISC

## Support

For questions or issues, please refer to the documentation pages in the built site.
