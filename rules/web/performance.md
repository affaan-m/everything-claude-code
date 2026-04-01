> This file extends [common/performance.md](../common/performance.md) with web-specific performance content.

# Web Performance Rules

## Core Web Vitals Targets

| Metric | Target | What It Measures |
|--------|--------|-----------------|
| LCP | < 2.5s | Largest Contentful Paint — hero image/text render time |
| FID/INP | < 100ms | Interaction to Next Paint — responsiveness |
| CLS | < 0.1 | Cumulative Layout Shift — visual stability |
| FCP | < 1.5s | First Contentful Paint — time to first visible content |
| TBT | < 200ms | Total Blocking Time — main thread blocking |

## Bundle Budget

| Page Type | JS Budget (gzipped) | CSS Budget |
|-----------|---------------------|------------|
| Landing page | < 150kb | < 30kb |
| App page | < 300kb | < 50kb |
| Microsite | < 80kb | < 15kb |

## Loading Strategy

### Critical Path
1. Inline critical CSS in `<head>` (above-fold styles)
2. Preload hero image: `<link rel="preload" as="image" href="..." fetchpriority="high">`
3. Preload primary font: `<link rel="preload" as="font" type="font/woff2" href="..." crossorigin>`
4. Defer non-critical CSS: `<link rel="stylesheet" href="..." media="print" onload="this.media='all'">`

### Dynamic Imports (Mandatory for Heavy Libraries)
```javascript
// GSAP — load only when needed
const gsapModule = await import("gsap");
const { ScrollTrigger } = await import("gsap/ScrollTrigger");

// Three.js — load only for 3D sections
const Three = await import("three");

// Framer Motion — load per component
const { motion } = await import("framer-motion");
```

### Image Optimization
- Hero: `loading="eager"` + `fetchpriority="high"` + explicit `width`/`height`
- Below fold: `loading="lazy"` + `decoding="async"`
- Format: AVIF > WebP > JPEG (with `<picture>` fallback chain)
- Sizes: provide `srcset` with 640w, 1024w, 1440w, 1920w breakpoints
- Never serve images larger than 2x display size

### Font Loading
- Max 2 font families
- `font-display: swap` always
- Subset to used character ranges
- Preload the primary weight/style only

## Animation Performance

- Use `will-change: transform` only on elements about to animate
- Remove `will-change` after animation completes on long-lived elements
- Prefer CSS animations over JS for simple transitions
- Use `requestAnimationFrame` for frame-synced JS animations
- Debounce scroll event handlers or use IntersectionObserver
- GSAP ScrollTrigger handles debouncing internally — don't add extra

## Lighthouse 90+ Checklist

- [ ] All images have explicit dimensions
- [ ] No render-blocking resources
- [ ] Text visible during font load
- [ ] No layout shifts from dynamic content
- [ ] All animations on compositor-only properties
- [ ] Third-party scripts loaded async/defer
- [ ] Service worker for repeat visits (optional but recommended)
