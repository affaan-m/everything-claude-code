# Breakpoint Strategies

## Overview

Effective breakpoint strategies focus on content needs rather than device sizes. Modern responsive design uses fewer, content-driven breakpoints combined with fluid techniques.

## Mobile-First Approach

### Core Philosophy

Start with the smallest screen, then progressively enhance for larger screens.

```css
/* Base styles (mobile first) */
.component {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* Enhance for larger screens */
@media (min-width: 640px) {
  .component {
    flex-direction: row;
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .component {
    padding: 2rem;
  }
}
```

### Benefits

1. **Performance**: Mobile devices load only necessary CSS
2. **Progressive Enhancement**: Features add rather than subtract
3. **Content Priority**: Forces focus on essential content first
4. **Simplicity**: Easier to reason about cascading styles

## Common Breakpoint Scales

### Tailwind CSS Default

```css
/* Tailwind breakpoints */
/* sm: 640px  - Landscape phones */
/* md: 768px  - Tablets */
/* lg: 1024px - Laptops */
/* xl: 1280px - Desktops */
/* 2xl: 1536px - Large desktops */

@media (min-width: 640px) {
  /* sm */
}
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 1024px) {
  /* lg */
}
@media (min-width: 1280px) {
  /* xl */
}
@media (min-width: 1536px) {
  /* 2xl */
}
```

### Bootstrap 5

```css
/* Bootstrap breakpoints */
/* sm: 576px */
/* md: 768px */
/* lg: 992px */
/* xl: 1200px */
/* xxl: 1400px */

@media (min-width: 576px) {
  /* sm */
}
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 992px) {
  /* lg */
}
@media (min-width: 1200px) {
  /* xl */
}
@media (min-width: 1400px) {
  /* xxl */
}
```

### Minimalist Scale

```css
/* Simplified 3-breakpoint system */
/* Base: Mobile (< 600px) */
/* Medium: Tablets and small laptops (600px - 1024px) */
/* Large: Desktops (> 1024px) */

:root {
  --bp-md: 600px;
  --bp-lg: 1024px;
}

@media (min-width: 600px) {
  /* Medium */
}
@media (min-width: 1024px) {
  /* Large */
}
```

## Content-Based Breakpoints

### Finding Natural Breakpoints

Instead of using device-based breakpoints, identify where your content naturally needs to change.

```css
/* Bad: Device-based thinking */
@media (min-width: 768px) {
  /* iPad breakpoint */
}

/* Good: Content-based thinking */
/* Breakpoint where sidebar fits comfortably next to content */
@media (min-width: 50rem) {
  .layout {
    display: grid;
    grid-template-columns: 1fr 300px;
  }
}

/* Breakpoint where cards can show 3 across without crowding */
@media (min-width: 65rem) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Testing Content Breakpoints

```javascript
// Find where content breaks
function findBreakpoints(selector) {
  const element = document.querySelector(selector);
  const breakpoints = [];

  for (let width = 320; width <= 1920; width += 10) {
    element.style.width = `${width}px`;

    // Check for overflow, wrapping, or layout issues
    if (element.scrollWidth > element.clientWidth) {
      breakpoints.push({ width, issue: "overflow" });
    }
  }

  return breakpoints;
}
```

## Design Token Integration

### Breakpoint Tokens

```css
:root {
  /* Breakpoint values */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Container widths for each breakpoint */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}

.container {
  width: 100%;
  max-width: var(--container-lg);
  margin-inline: auto;
  padding-inline: var(--space-4);
}
```

### JavaScript Integration

```typescript
// Breakpoint constants
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Media query hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Breakpoint hook
function useBreakpoint() {
  const isSmall = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
  const isMedium = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const isLarge = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  const isXLarge = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);

  return {
    isMobile: !isSmall,
    isTablet: isSmall && !isLarge,
    isDesktop: isLarge,
    current: isXLarge
      ? "xl"
      : isLarge
        ? "lg"
        : isMedium
          ? "md"
          : isSmall
            ? "sm"
            : "base",
  };
}
```

## Feature Queries

### @supports for Progressive Enhancement

```css
/* Feature detection instead of browser detection */
@supports (display: grid) {
  .layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }

  @container (min-width: 400px) {
    .card {
      flex-direction: row;
    }
  }
}

@supports (aspect-ratio: 16/9) {
  .video-container {
    aspect-ratio: 16/9;
  }
}

/* Fallback for older browsers */
@supports not (gap: 1rem) {
  .flex-container > * + * {
    margin-left: 1rem;
  }
}
```

### Combining Feature and Size Queries

```css
/* Only apply grid layout if supported and screen is large enough */
@supports (display: grid) {
  @media (min-width: 768px) {
    .layout {
      display: grid;
      grid-template-columns: 250px 1fr;
    }
  }
}
```

## Responsive Patterns by Component

### Navigation

```css
.nav {
  /* Mobile: vertical stack */
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .nav {
    /* Tablet+: horizontal */
    flex-direction: row;
    align-items: center;
  }
}

/* Or with container queries */
.nav-container {
  container-type: inline-size;
}

@container (min-width: 600px) {
  .nav {
    flex-direction: row;
  }
}
```

### Cards Grid

```css
.cards {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .cards {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Better: auto-fit with minimum size */
.cards-auto {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}
```

### Hero Section

```css
.hero {
  min-height: 50vh;
  padding: var(--space-lg) var(--space-md);
  text-align: center;
}

.hero-title {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem);
}

@media (min-width: 768px) {
  .hero {
    min-height: 70vh;
    display: flex;
    align-items: center;
    text-align: left;
  }

  .hero-content {
    max-width: 60%;
  }
}

@media (min-width: 1024px) {
  .hero {
    min-height: 80vh;
  }

  .hero-content {
    max-width: 50%;
  }
}
```

### Tables

```css
/* Mobile: cards or horizontal scroll */
.table-container {
  overflow-x: auto;
}

.responsive-table {
  min-width: 600px;
}

/* Alternative: transform to cards on mobile */
@media (max-width: 639px) {
  .responsive-table {
    min-width: 0;
  }

  .responsive-table thead {
    display: none;
  }

  .responsive-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .responsive-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border: none;
  }

  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 600;
  }
}
```

## Print Styles

```css
@media print {
  /* Remove non-essential elements */
  .nav,
  .sidebar,
  .footer,
  .ads {
    display: none;
  }

  /* Reset colors and backgrounds */
  * {
    background: white !important;
    color: black !important;
    box-shadow: none !important;
  }

  /* Ensure content fits on page */
  .container {
    max-width: 100%;
    padding: 0;
  }

  /* Handle page breaks */
  h1,
  h2,
  h3 {
    page-break-after: avoid;
  }

  img,
  table {
    page-break-inside: avoid;
  }

  /* Show URLs for links */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
  }
}
```

## Preference Queries

```css
/* Dark mode preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a1a;
    --text: #f0f0f0;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast preference */
@media (prefers-contrast: high) {
  :root {
    --text: #000;
    --bg: #fff;
    --border: #000;
  }

  .button {
    border: 2px solid currentColor;
  }
}

/* Reduced data preference */
@media (prefers-reduced-data: reduce) {
  .hero-video {
    display: none;
  }

  .hero-image {
    display: block;
  }
}
```

## Testing Breakpoints

```javascript
// Automated breakpoint testing
async function testBreakpoints(page, breakpoints) {
  const results = [];

  for (const [name, width] of Object.entries(breakpoints)) {
    await page.setViewportSize({ width, height: 800 });

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    // Check for elements going off-screen
    const offscreenElements = await page.evaluate(() => {
      const elements = document.querySelectorAll("*");
      return Array.from(elements).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.right > window.innerWidth || rect.left < 0;
      }).length;
    });

    results.push({
      breakpoint: name,
      width,
      hasOverflow,
      offscreenElements,
    });
  }

  return results;
}
```

## Resources

- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)
- [The 100% Correct Way to Do CSS Breakpoints](https://www.freecodecamp.org/news/the-100-correct-way-to-do-css-breakpoints-88d6a5ba1862/)
- [Modern CSS Solutions](https://moderncss.dev/)
- [Defensive CSS](https://defensivecss.dev/)
