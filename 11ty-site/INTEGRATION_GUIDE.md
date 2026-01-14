# Integration Guide: Webflow & Shopify

This guide provides step-by-step instructions for integrating the Knowledge Base static site into Webflow and Shopify.

## Table of Contents

1. [Webflow Integration](#webflow-integration)
2. [Shopify Integration](#shopify-integration)
3. [Advanced Customization](#advanced-customization)

---

## Webflow Integration

### Method 1: Direct HTML/CSS/JS Integration

This method copies the styles and scripts directly into Webflow's custom code sections.

#### Step 1: Build the Site

```bash
cd kb-11ty
npm run build
```

#### Step 2: Add CSS to Webflow

1. Open `_site/css/main.css`
2. Copy the entire contents
3. In Webflow, go to **Project Settings → Custom Code**
4. In the **Head Code** section, paste:

```html
<style>
  /* Paste the contents of main.css here */
</style>
```

#### Step 3: Add JavaScript to Webflow

1. Open `_site/js/main.js`
2. Copy the entire contents
3. In Webflow, go to **Project Settings → Custom Code**
4. In the **Footer Code** section, paste:

```html
<script>
  // Paste the contents of main.js here
</script>
```

#### Step 4: Add Google Fonts

In Webflow **Project Settings → Custom Code → Head Code**, add:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

#### Step 5: Build Pages in Webflow

Use the HTML structure from `_site/*.html` files as a reference:

1. Create a new page in Webflow
2. Add div blocks with the same class names (e.g., `header`, `container`, `card`)
3. The CSS you added will automatically style these elements

**Example: Creating a Card Component**

HTML structure from `_site/index.html`:
```html
<div class="card card-hover">
  <div class="card-icon">🏗️</div>
  <h3 class="card-title">Webflow Front-end</h3>
  <p class="card-description">Description text here</p>
</div>
```

In Webflow:
1. Add a Div Block, give it classes: `card` and `card-hover`
2. Inside, add another Div Block with class: `card-icon`, add text: 🏗️
3. Add a Heading (H3) with class: `card-title`
4. Add a Paragraph with class: `card-description`

### Method 2: Hosted Assets with CDN

This method hosts the CSS and JS files externally and links to them.

#### Step 1: Host the Assets

1. Build the site: `npm run build`
2. Upload `_site/css/main.css` and `_site/js/main.js` to:
   - Your own server
   - Cloudflare Pages
   - Netlify
   - AWS S3 + CloudFront
   - Any CDN service

#### Step 2: Link in Webflow

In Webflow **Project Settings → Custom Code → Head Code**:

```html
<link rel="stylesheet" href="https://your-cdn.com/css/main.css">
```

In **Footer Code**:

```html
<script src="https://your-cdn.com/js/main.js"></script>
```

### Method 3: Webflow Components Library

Create reusable components in Webflow based on the HTML structure.

#### Step 1: Create Symbol Components

1. Build common components as Webflow Symbols:
   - Header
   - Footer
   - Card
   - Button
   - Code Block

2. Apply the appropriate class names from the CSS

#### Step 2: Use Components Across Pages

1. Drag and drop symbols onto pages
2. Customize content within each instance
3. The shared CSS will maintain consistent styling

---

## Shopify Integration

### Method 1: Theme Assets Integration

This method adds the CSS and JS as theme assets.

#### Step 1: Access Your Theme Files

1. In Shopify Admin, go to **Online Store → Themes**
2. Click **Actions → Edit code** on your active theme

#### Step 2: Add CSS File

1. In the **Assets** folder, click **Add a new asset**
2. Create a new file named `kb-main.css`
3. Copy the contents of `_site/css/main.css` and paste it
4. Save the file

#### Step 3: Add JavaScript File

1. In the **Assets** folder, click **Add a new asset**
2. Create a new file named `kb-main.js`
3. Copy the contents of `_site/js/main.js` and paste it
4. Save the file

#### Step 4: Include in Theme Layout

1. Open `layout/theme.liquid`
2. In the `<head>` section, add:

```liquid
{{ 'kb-main.css' | asset_url | stylesheet_tag }}
```

3. Before the closing `</body>` tag, add:

```liquid
{{ 'kb-main.js' | asset_url | script_tag }}
```

4. Add Google Fonts in the `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

#### Step 5: Create Custom Pages

1. In Shopify Admin, go to **Online Store → Pages**
2. Click **Add page**
3. In the content editor, switch to HTML view (Show HTML)
4. Copy the HTML from `_site/*.html` files (the content inside `<main>`)
5. Paste and save

### Method 2: Custom Sections

Create custom Shopify sections for reusable components.

#### Step 1: Create a Section File

1. In **Sections** folder, click **Add a new section**
2. Name it `kb-card-grid.liquid`

#### Step 2: Add Section Code

```liquid
<div class="section">
  <h2 class="section-title">{{ section.settings.title }}</h2>
  <div class="card-grid">
    {% for block in section.blocks %}
      <div class="card card-hover">
        <div class="card-icon">{{ block.settings.icon }}</div>
        <h3 class="card-title">{{ block.settings.title }}</h3>
        <p class="card-description">{{ block.settings.description }}</p>
      </div>
    {% endfor %}
  </div>
</div>

{% schema %}
{
  "name": "KB Card Grid",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Section Title",
      "default": "Key Technologies"
    }
  ],
  "blocks": [
    {
      "type": "card",
      "name": "Card",
      "settings": [
        {
          "type": "text",
          "id": "icon",
          "label": "Icon",
          "default": "🏗️"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title"
        },
        {
          "type": "textarea",
          "id": "description",
          "label": "Description"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "KB Card Grid"
    }
  ]
}
{% endschema %}
```

#### Step 3: Use in Templates

1. Edit a page template (e.g., `templates/page.knowledge-base.liquid`)
2. Add:

```liquid
{% section 'kb-card-grid' %}
```

### Method 3: Shopify App Proxy

For dynamic content integration with the static site.

#### Step 1: Host the Static Site

1. Build the site: `npm run build`
2. Host the `_site` directory on a server (e.g., Vercel, Netlify)
3. Note the URL (e.g., `https://kb.example.com`)

#### Step 2: Create App Proxy

1. Create a Shopify app (or use an existing one)
2. Set up an app proxy:
   - Subpath prefix: `/apps`
   - Subpath: `/kb`
   - Proxy URL: `https://kb.example.com`

#### Step 3: Access via Shopify

The knowledge base will be accessible at:
```
https://your-store.myshopify.com/apps/kb
```

---

## Advanced Customization

### Customizing Colors

Edit the CSS variables in `src/css/main.css`:

```css
:root {
  --color-black: #000000;
  --color-red: #cc0000;
  --color-grey-900: #1a1a1a;
  /* ... update as needed */
}
```

Then rebuild: `npm run build`

### Adding Alpine.js for Dynamic Content

For AJAX-based deferred loading (recommended for Webflow):

#### Step 1: Add Alpine.js

In Webflow or Shopify custom code:

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

#### Step 2: Example: Dynamic Content Loading

```html
<div x-data="{ products: [] }" x-init="fetch('/api/products').then(r => r.json()).then(data => products = data)">
  <template x-for="product in products" :key="product.id">
    <div class="card">
      <h3 class="card-title" x-text="product.title"></h3>
      <p class="card-description" x-text="product.description"></p>
    </div>
  </template>
</div>
```

### Integrating with Xano

For webhook processing and data transformation:

#### Step 1: Create Xano Endpoint

1. In Xano, create a new API endpoint
2. Set up the data transformation logic

#### Step 2: Call from Client

Using Alpine.js:

```html
<div x-data="{ 
  submitData() {
    fetch('https://your-xano.xano.io/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ /* your data */ })
    })
  }
}">
  <button @click="submitData()" class="btn btn-primary">Submit</button>
</div>
```

### BEM Naming Convention

When creating new components, follow BEM:

```css
/* Block */
.component { }

/* Element */
.component__element { }

/* Modifier */
.component--modifier { }
.component__element--modifier { }
```

Example:
```html
<div class="card card--featured">
  <div class="card__header">
    <h3 class="card__title">Title</h3>
  </div>
  <div class="card__body">
    <p class="card__description">Description</p>
  </div>
</div>
```

---

## Troubleshooting

### Styles Not Applying in Webflow

1. Check that CSS is in the **Head Code** section
2. Ensure class names match exactly (case-sensitive)
3. Clear browser cache and Webflow cache
4. Check browser console for CSS errors

### JavaScript Not Working

1. Verify JS is in the **Footer Code** section
2. Check browser console for errors
3. Ensure element IDs match (e.g., `mobileMenuToggle`, `searchInput`)
4. Test in published site (not just Webflow Designer)

### Fonts Not Loading

1. Verify Google Fonts link is in the `<head>`
2. Check network tab for font loading errors
3. Ensure font family names match in CSS

### Mobile Menu Not Toggling

1. Check that `mobileMenuToggle` and `mobileNav` IDs exist
2. Verify JavaScript is loaded after HTML
3. Check for JavaScript errors in console

---

## Best Practices

1. **Version Control**: Keep the source files in Git
2. **Build Process**: Always rebuild after changes
3. **Testing**: Test on multiple devices and browsers
4. **Performance**: Minify CSS and JS for production
5. **Documentation**: Document any customizations

---

## Support

For additional help:
- Review the generated HTML in `_site/` for structure reference
- Check the CSS comments in `src/css/main.css`
- Refer to the main README.md for project overview
