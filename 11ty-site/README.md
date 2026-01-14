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

## License

ISC

## Support

For questions or issues, please refer to the documentation pages in the built site.
