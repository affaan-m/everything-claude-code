# Mobile Accessibility (Web)

## Overview

Mobile web accessibility ensures responsive websites work for users with disabilities across all devices. This includes support for screen readers (VoiceOver on iOS Safari, TalkBack on Android Chrome), motor impairments, touch interactions, and various visual disabilities.

## Touch Target Sizing

### Minimum Sizes

```css
/* WCAG 2.2 Level AA: 24x24px minimum */
.interactive-element {
  min-width: 24px;
  min-height: 24px;
}

/* WCAG 2.2 Level AAA: 44x44px recommended */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

### Touch Target Spacing

```tsx
// Ensure adequate spacing between touch targets
function ButtonGroup({ buttons }) {
  return (
    <div className="flex gap-3">
      {" "}
      {/* 12px minimum gap */}
      {buttons.map((btn) => (
        <button key={btn.id} className="min-w-[44px] min-h-[44px] px-4 py-2">
          {btn.label}
        </button>
      ))}
    </div>
  );
}

// Expanding hit area without changing visual size
function IconButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative p-3" // Creates 44x44 touch area
    >
      <span className="block w-5 h-5">{icon}</span>
    </button>
  );
}
```

## Responsive Accessibility Patterns

### Viewport and Zoom

```html
<!-- Allow user zooming — never disable it -->
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- BAD: Do not use these — they block pinch-to-zoom -->
<!-- <meta name="viewport" content="maximum-scale=1, user-scalable=no" /> -->
```

```css
/* Use relative units for text scaling */
html {
  font-size: 100%; /* Respects user's browser font size setting */
}

body {
  font-size: 1rem;
  line-height: 1.5;
}

/* Ensure content reflows at 400% zoom (WCAG 1.4.10) */
.container {
  max-width: 100%;
  overflow-wrap: break-word;
}

/* Responsive touch targets: larger on touch devices */
@media (pointer: coarse) {
  .interactive-element {
    min-width: 44px;
    min-height: 44px;
    padding: 12px;
  }
}

@media (pointer: fine) {
  .interactive-element {
    min-width: 24px;
    min-height: 24px;
  }
}
```

### Gesture Alternatives for Web

```tsx
// Provide alternatives to swipe/drag gestures
function SwipeableCard({ item, onDelete }) {
  return (
    <div className="group relative">
      <div className="flex items-center justify-between p-4">
        <span>{item.title}</span>
        {/* Visible button alternative to swipe-to-delete */}
        <button
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.title}`}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <TrashIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
```

### Motion and Animation

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
// React hook for reduced motion
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}
```

## Text Scaling on the Web

```css
/* Use rem/em for font sizes — scales with user preferences */
h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
body { font-size: 1rem; }

/* Ensure text containers expand with scaled text */
.text-container {
  min-height: auto;
  overflow: visible;
}

/* Clamp for controlled scaling */
.responsive-text {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
}
```

## Testing Checklist

```markdown
## Mobile Web Screen Reader Testing

- [ ] All interactive elements have labels
- [ ] Tab/swipe navigation covers all content in logical order
- [ ] Announcements made for dynamic content (aria-live)
- [ ] Headings navigable via rotor/heading navigation
- [ ] Images have appropriate alt text or are aria-hidden

## Touch & Motor Accessibility

- [ ] Touch targets at least 44x44px on touch devices
- [ ] Adequate spacing between targets (8px minimum)
- [ ] Button alternatives for swipe/drag gestures
- [ ] No time-limited interactions
- [ ] No hover-only interactions (all hover content also accessible via focus/click)

## Visual Accessibility

- [ ] Text scales to 200% without loss of content
- [ ] Content reflows at 400% zoom (no horizontal scrolling)
- [ ] Viewport meta tag does not disable pinch-to-zoom
- [ ] Content visible in high contrast mode
- [ ] Color not sole indicator of meaning
- [ ] Animations respect prefers-reduced-motion
```

## Resources

- [Mobile Accessibility WCAG](https://www.w3.org/TR/mobile-accessibility-mapping/)
- [WCAG 2.2 Reflow Criterion](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
