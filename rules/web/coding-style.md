> This file extends [common/coding-style.md](../common/coding-style.md) with web-specific frontend content.

# Web Coding Style

## File Organization

Organize by feature/section, not by type:

```
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroAnimation.tsx
│   │   └── hero.css
│   ├── scrolly-section/
│   │   ├── ScrollySection.tsx
│   │   ├── StickyVisual.tsx
│   │   ├── TextStep.tsx
│   │   └── scrolly.css
│   └── ui/
│       ├── Button.tsx
│       ├── GlassCard.tsx
│       └── AnimatedText.tsx
├── hooks/
│   ├── useScrollProgress.ts
│   ├── useLenis.ts
│   └── useReducedMotion.ts
├── lib/
│   ├── animations.ts
│   └── gsap-config.ts
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```

## CSS Custom Properties (Mandatory)

All design tokens as CSS variables — never hardcode colors, sizes, or spacing:

```css
:root {
  /* Colors — oklch for perceptual uniformity */
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(15% 0 0);
  --color-accent: oklch(65% 0.25 270);

  /* Typography — fluid with clamp */
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);

  /* Spacing */
  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  /* Animation */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 600ms;
}
```

## Animation-Only Properties

CRITICAL: Only animate these CSS properties for 60fps:
- `transform` (translate, scale, rotate, skew)
- `opacity`
- `clip-path`
- `filter` (use sparingly)

NEVER animate: `width`, `height`, `top`, `left`, `right`, `bottom`, `margin`, `padding`, `border`, `font-size`.

## Semantic HTML First

```html
<!-- CORRECT -->
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>

<!-- WRONG -->
<div class="header">
  <div class="nav">...</div>
</div>
```

## Component Naming

- Components: PascalCase (`ScrollySection`, `GlassCard`)
- CSS classes: kebab-case or Tailwind utilities
- Animation timelines: camelCase with descriptive suffix (`heroEntranceTl`, `featureRevealTl`)
- Custom hooks: `use` prefix (`useScrollProgress`, `useReducedMotion`)
