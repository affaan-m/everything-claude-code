---
name: web-performance-patterns
description: Core Web Vitals optimization, bundle analysis, image/font strategies, rendering performance, and caching patterns.
---

# Web Performance Patterns

## When to Activate
- Optimizing page load speed or Core Web Vitals scores
- Analyzing and reducing bundle size
- Implementing image, font, or caching strategies
- Debugging rendering performance issues

## Core Principles
- **Measure first**: Profile before optimizing — use Lighthouse, Web Vitals library
- **Critical path**: Minimize resources blocking first paint
- **Progressive**: Load essential content first, defer the rest
- **Budget**: Set and enforce performance budgets in CI

---

## 1. Core Web Vitals

### LCP (Largest Contentful Paint) — target < 2.5s

Common causes of poor LCP:
- Render-blocking CSS/JS
- Slow server response (TTFB)
- Unoptimized hero images

```html
<!-- Preload hero image -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />

<!-- Inline critical CSS -->
<style>/* above-the-fold styles */</style>
<link rel="stylesheet" href="/main.css" media="print" onload="this.media='all'" />
```

### INP (Interaction to Next Paint) — target < 200ms

```typescript
// Break up long tasks
function processItems(items: Item[]) {
  const chunk = 50;
  let i = 0;
  function next() {
    const end = Math.min(i + chunk, items.length);
    for (; i < end; i++) processItem(items[i]);
    if (i < items.length) requestIdleCallback(next);
  }
  next();
}
```

### CLS (Cumulative Layout Shift) — target < 0.1

```css
/* Always set dimensions on media */
img, video { width: 100%; height: auto; aspect-ratio: 16/9; }

/* Reserve space for dynamic content */
.ad-slot { min-height: 250px; }
```

---

## 2. Bundle Optimization

### Code Splitting

```typescript
// Route-based splitting (React)
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Feature-based splitting
const Chart = lazy(() => import("./components/Chart"));
```

### Tree Shaking

```typescript
// Good — named imports allow tree shaking
import { debounce } from "lodash-es";

// Bad — imports entire library
import _ from "lodash";
```

### Chunk Strategy (Vite/webpack)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-popover"],
        },
      },
    },
  },
});
```

### Analysis

```bash
# Vite
npx vite-bundle-visualizer

# webpack
npx webpack-bundle-analyzer stats.json
```

---

## 3. Image Optimization

### Next.js Image

```tsx
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority        // above the fold
  placeholder="blur"
  blurDataURL={shimmer}
/>
```

### Responsive Images

```html
<picture>
  <source srcset="/img.avif" type="image/avif" />
  <source srcset="/img.webp" type="image/webp" />
  <img src="/img.jpg" alt="Fallback" loading="lazy" decoding="async" />
</picture>
```

### Format Priority

1. **AVIF** — best compression, growing support
2. **WebP** — good compression, wide support
3. **JPEG/PNG** — universal fallback

---

## 4. Font Strategy

```css
/* Preload critical font */
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-var.woff2") format("woff2");
  font-display: swap;          /* swap for body text */
  unicode-range: U+0000-00FF;  /* latin subset */
}
```

```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
```

**font-display values:**
| Value | Use Case |
|-------|----------|
| `swap` | Body text — show fallback immediately |
| `optional` | Non-critical — skip if not cached |
| `fallback` | Balance — short block period |

**Tips:**
- Use variable fonts to reduce file count
- Subset fonts to needed character ranges
- Self-host instead of Google Fonts for fewer requests

---

## 5. Rendering Optimization

### Virtualization

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ overflow: "auto", height: 400 }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((vItem) => (
          <div key={vItem.key} style={{
            position: "absolute",
            top: vItem.start,
            height: vItem.size,
          }}>
            {items[vItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Memoization Guidelines

```tsx
// Memo when: expensive computation, frequent parent re-renders
const sorted = useMemo(() =>
  items.toSorted((a, b) => a.score - b.score),
  [items]
);

// Do NOT memo: simple values, infrequent renders, primitives
```

### CSS Containment

```css
.card {
  contain: layout style paint;  /* isolate reflow/repaint */
  content-visibility: auto;      /* skip off-screen rendering */
  contain-intrinsic-size: 0 200px;
}
```

---

## 6. Caching Strategy

### HTTP Cache Headers

```
# Immutable assets (hashed filenames)
Cache-Control: public, max-age=31536000, immutable

# HTML pages
Cache-Control: no-cache
# (browser revalidates every time, but can use 304)

# API responses
Cache-Control: private, max-age=0, must-revalidate
```

### Stale-While-Revalidate

```
Cache-Control: public, max-age=60, stale-while-revalidate=3600
```

Serves stale content while fetching fresh version in background.

### Service Worker (Workbox)

```typescript
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new StaleWhileRevalidate({ cacheName: "api-cache" })
);
```

---

## 7. Critical Rendering Path

### Resource Hints

```html
<!-- DNS prefetch for third-party -->
<link rel="dns-prefetch" href="https://cdn.example.com" />

<!-- Preconnect for critical third-party -->
<link rel="preconnect" href="https://api.example.com" crossorigin />

<!-- Prefetch for likely next navigation -->
<link rel="prefetch" href="/dashboard" />

<!-- Preload critical resources -->
<link rel="preload" href="/critical.css" as="style" />
```

### Script Loading

```html
<!-- Critical: inline or no attribute -->
<script src="/critical.js"></script>

<!-- Non-critical: defer (runs after parse, in order) -->
<script src="/analytics.js" defer></script>

<!-- Independent: async (runs ASAP, no order guarantee) -->
<script src="/widget.js" async></script>
```

---

## 8. Performance Testing

### Lighthouse CI

```yaml
# lighthouserc.yaml
ci:
  collect:
    url:
      - http://localhost:3000/
      - http://localhost:3000/dashboard
  assert:
    assertions:
      categories:performance:
        - error
        - minScore: 0.9
      largest-contentful-paint:
        - warn
        - maxNumericValue: 2500
```

```bash
npx @lhci/cli autorun
```

### Web Vitals Library

```typescript
import { onLCP, onINP, onCLS } from "web-vitals";

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

---

## Checklist

- [ ] Core Web Vitals pass thresholds (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Hero image preloaded with `fetchpriority="high"`
- [ ] Bundle size analyzed and code-split by route
- [ ] Images served as AVIF/WebP with fallback
- [ ] Fonts preloaded, subsetted, and using `font-display: swap`
- [ ] Long lists use virtualization
- [ ] Cache headers set: immutable for hashed assets, no-cache for HTML
- [ ] Lighthouse CI gate configured in CI pipeline
