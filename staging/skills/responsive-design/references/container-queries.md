# Container Queries Deep Dive

## Overview

Container queries enable component-based responsive design by allowing elements to respond to their container's size rather than the viewport. This paradigm shift makes truly reusable components possible.

## Browser Support

Container queries have excellent modern browser support (Chrome 105+, Firefox 110+, Safari 16+). For older browsers, provide graceful fallbacks.

## Containment Basics

### Container Types

```css
/* Size containment - queries based on inline and block size */
.container {
  container-type: size;
}

/* Inline-size containment - queries based on inline (width) size only */
/* Most common and recommended */
.container {
  container-type: inline-size;
}

/* Normal - style queries only, no size queries */
.container {
  container-type: normal;
}
```

### Named Containers

```css
/* Named container for targeted queries */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Shorthand */
.card-wrapper {
  container: card / inline-size;
}

/* Query specific container */
@container card (min-width: 400px) {
  .card-content {
    display: flex;
  }
}
```

## Container Query Syntax

### Width-Based Queries

```css
.container {
  container-type: inline-size;
}

/* Minimum width */
@container (min-width: 300px) {
  .element {
    /* styles */
  }
}

/* Maximum width */
@container (max-width: 500px) {
  .element {
    /* styles */
  }
}

/* Range syntax */
@container (300px <= width <= 600px) {
  .element {
    /* styles */
  }
}

/* Exact width */
@container (width: 400px) {
  .element {
    /* styles */
  }
}
```

### Combining Conditions

```css
/* AND condition */
@container (min-width: 400px) and (max-width: 800px) {
  .element {
    /* styles */
  }
}

/* OR condition */
@container (max-width: 300px) or (min-width: 800px) {
  .element {
    /* styles */
  }
}

/* NOT condition */
@container not (min-width: 400px) {
  .element {
    /* styles */
  }
}
```

### Named Container Queries

```css
/* Multiple named containers */
.page-wrapper {
  container: page / inline-size;
}

.sidebar-wrapper {
  container: sidebar / inline-size;
}

/* Target specific containers */
@container page (min-width: 1024px) {
  .main-content {
    max-width: 800px;
  }
}

@container sidebar (min-width: 300px) {
  .sidebar-widget {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

## Container Query Units

```css
/* Container query length units */
.element {
  /* Container query width - 1cqw = 1% of container width */
  width: 50cqw;

  /* Container query height - 1cqh = 1% of container height */
  height: 50cqh;

  /* Container query inline - 1cqi = 1% of container inline size */
  padding-inline: 5cqi;

  /* Container query block - 1cqb = 1% of container block size */
  padding-block: 3cqb;

  /* Container query min - smaller of cqi and cqb */
  font-size: 5cqmin;

  /* Container query max - larger of cqi and cqb */
  margin: 2cqmax;
}

/* Practical example: fluid typography based on container */
.card-title {
  font-size: clamp(1rem, 4cqi, 2rem);
}

.card-body {
  padding: clamp(0.75rem, 4cqi, 1.5rem);
}
```

## Style Queries

Style queries allow querying CSS custom property values. Currently limited support.

```css
/* Define a custom property */
.card {
  --layout: stack;
}

/* Query the property value */
@container style(--layout: stack) {
  .card-content {
    display: flex;
    flex-direction: column;
  }
}

@container style(--layout: inline) {
  .card-content {
    display: flex;
    flex-direction: row;
  }
}

/* Toggle layout via custom property */
.card.horizontal {
  --layout: inline;
}
```

## Practical Patterns

### Responsive Card Component

```css
.card-container {
  container: card / inline-size;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: clamp(1rem, 4cqi, 2rem);
}

.card-image {
  aspect-ratio: 16/9;
  width: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
}

.card-title {
  font-size: clamp(1rem, 4cqi, 1.5rem);
  font-weight: 600;
}

/* Medium container: side-by-side layout */
@container card (min-width: 400px) {
  .card {
    flex-direction: row;
    align-items: flex-start;
  }

  .card-image {
    width: 40%;
    aspect-ratio: 1;
  }

  .card-content {
    flex: 1;
  }
}

/* Large container: enhanced layout */
@container card (min-width: 600px) {
  .card-image {
    width: 250px;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
  }
}
```

### Responsive Grid Items

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.grid-item {
  container-type: inline-size;
}

.item-content {
  padding: 1rem;
}

/* Item adapts to its own size, not the viewport */
@container (min-width: 350px) {
  .item-content {
    padding: 1.5rem;
  }

  .item-title {
    font-size: 1.25rem;
  }
}

@container (min-width: 500px) {
  .item-content {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }
}
```

### Dashboard Widget

```css
.widget-container {
  container: widget / inline-size;
}

.widget {
  --chart-height: 150px;
  padding: 1rem;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.widget-chart {
  height: var(--chart-height);
}

.widget-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

@container widget (min-width: 300px) {
  .widget {
    --chart-height: 200px;
  }

  .widget-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container widget (min-width: 500px) {
  .widget {
    --chart-height: 250px;
    padding: 1.5rem;
  }

  .widget-stats {
    grid-template-columns: repeat(4, 1fr);
  }

  .widget-actions {
    display: flex;
    gap: 0.5rem;
  }
}
```

### Navigation Component

```css
.nav-container {
  container: nav / inline-size;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.nav-link-text {
  display: none;
}

.nav-link-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* Show text when container is wide enough */
@container nav (min-width: 200px) {
  .nav-link-text {
    display: block;
  }
}

/* Horizontal layout for wider containers */
@container nav (min-width: 600px) {
  .nav {
    flex-direction: row;
  }

  .nav-link {
    padding: 0.5rem 1rem;
  }
}
```

## Tailwind CSS Integration

```tsx
// Tailwind v3.2+ supports container queries
// tailwind.config.js
module.exports = {
  plugins: [require("@tailwindcss/container-queries")],
};

// Component usage
function Card({ title, image, description }) {
  return (
    // @container creates containment context
    <div className="@container">
      <article className="flex flex-col @md:flex-row @md:gap-4">
        <img
          src={image}
          alt=""
          className="w-full @md:w-48 @lg:w-64 aspect-video @md:aspect-square object-cover rounded-lg"
        />
        <div className="p-4 @md:p-0">
          <h2 className="text-lg @md:text-xl @lg:text-2xl font-semibold">
            {title}
          </h2>
          <p className="mt-2 text-muted-foreground @lg:text-lg">
            {description}
          </p>
        </div>
      </article>
    </div>
  );
}

// Named containers
function Dashboard() {
  return (
    <div className="@container/main">
      <aside className="@container/sidebar">
        <nav className="flex flex-col @lg/sidebar:flex-row">{/* ... */}</nav>
      </aside>
      <main className="@lg/main:grid @lg/main:grid-cols-2">{/* ... */}</main>
    </div>
  );
}
```

## Fallback Strategies

```css
/* Provide fallbacks for browsers without support */
.card {
  /* Default (fallback) styles */
  display: flex;
  flex-direction: column;
}

/* Feature query for container support */
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

/* Alternative: media query fallback */
.card {
  display: flex;
  flex-direction: column;
}

/* Viewport-based fallback */
@media (min-width: 768px) {
  .card {
    flex-direction: row;
  }
}

/* Enhanced with container queries when supported */
@supports (container-type: inline-size) {
  @media (min-width: 768px) {
    .card {
      flex-direction: column; /* Reset */
    }
  }

  @container (min-width: 400px) {
    .card {
      flex-direction: row;
    }
  }
}
```

## Performance Considerations

```css
/* Avoid over-nesting containers */
/* Bad: Too many nested containers */
.level-1 {
  container-type: inline-size;
}
.level-2 {
  container-type: inline-size;
}
.level-3 {
  container-type: inline-size;
}
.level-4 {
  container-type: inline-size;
}

/* Good: Strategic container placement */
.component-wrapper {
  container-type: inline-size;
}

/* Use inline-size instead of size when possible */
/* size containment is more expensive */
.container {
  container-type: inline-size; /* Preferred */
  /* container-type: size; */ /* Only when needed */
}
```

## Testing Container Queries

```javascript
// Test container query support
const supportsContainerQueries = CSS.supports("container-type", "inline-size");

// Resize observer for testing
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log("Container width:", entry.contentRect.width);
  }
});

observer.observe(document.querySelector(".container"));
```

## Resources

- [MDN Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries)
- [CSS Container Queries Spec](https://www.w3.org/TR/css-contain-3/)
- [Una Kravets: Container Queries](https://web.dev/cq-stable/)
- [Ahmad Shadeed: Container Queries Guide](https://ishadeed.com/article/container-queries-are-finally-here/)
