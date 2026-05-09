# Motion System v4.1

Production-ready UI motion system for React / Next.js.

Focused on **performance, accessibility, and usability** — not decoration.

---

## Core Principle

Motion must:

- Guide attention  
- Communicate state  
- Preserve spatial continuity  

If it does none → remove it.

---

## Install

```bash
npm install motion
```

---

## Version

- `motion/react` → default  
- `framer-motion` → legacy  

Do not mix.

---

## Motion Tokens

```ts
export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.35,
    slow: 0.6
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1],
    sharp: [0.4, 0, 0.2, 1]
  },
  distance: {
    sm: 8,
    md: 16,
    lg: 24
  }
}
```

---

## Performance

**Safe**
- transform
- opacity

**Avoid**
- width / height
- top / left

Rule: responsiveness > smoothness

---

## Device Adaptation

```ts
const isLowEnd =
  typeof navigator !== "undefined" &&
  navigator.hardwareConcurrency <= 4

const duration = isLowEnd ? 0.2 : 0.4
```

---

## Accessibility

### JS

```tsx
import { motion, useReducedMotion } from "motion/react"

const reduce = useReducedMotion()

<motion.div
  initial={{ opacity: 0, y: reduce ? 0 : 24 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

### CSS

```css
@media (prefers-reduced-motion: reduce) {
  .motion-safe-transition {
    transition: opacity 0.2s;
  }

  .motion-reduce-transform {
    transform: none !important;
  }
}
```

### Tailwind

```html
<div class="motion-safe:animate-fade motion-reduce:opacity-100"></div>
```

---

## Core Patterns

### Button

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
/>
```

---

### Stagger

```ts
const container = {
  visible: { transition: { staggerChildren: 0.08 } }
}
```

---

### Modal Essentials

- Focus trap  
- Escape close  
- Scroll lock  
- ARIA roles  

---

## Advanced Patterns

### Parallax

```tsx
const y = useTransform(scrollYProgress, [0, 1], [0, -80])
```

---

### Scroll Story

```tsx
<div className="sticky top-0 h-screen" />
```

---

### 3D Tilt

```tsx
<motion.div style={{ rotateX, rotateY }} />
```

---

### Crossfade

```tsx
<motion.div layoutId="shared" />
```

---

### Progressive Reveal

```tsx
clipPath: "inset(0 0 100% 0)"
```

---

### Skeleton Loading

```tsx
<motion.div
  className="bg-gray-200"
  animate={{ opacity: [0.6, 1, 0.6] }}
  transition={{ repeat: Infinity }}
/>
```

---

### Micro Interactions

```tsx
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.96 }}
```

---

### Spring System

```ts
const spring = {
  type: "spring",
  stiffness: 120,
  damping: 14
}
```

---

## Decision Tree

- Hover → `whileHover`
- Tap → `whileTap`
- In view → `whileInView`
- Scroll linked → `useScroll`
- Conditional → `AnimatePresence`
- Layout small → `layout`
- Layout large → avoid
- Complex → `useAnimate`

---

## SSR Safety

- Match initial states
- Avoid implicit animation origins

---

## Debugging

Check:

- Wrong import
- Missing `"use client"`
- Missing `key`
- Hydration mismatch
- Layout misuse
- State-driven animation

---

## QA

- No CLS
- Keyboard works
- Focus trapped
- ARIA correct
- Reduced motion works
- No hydration warnings
- Animations stop on unmount

---

## Anti-Patterns

- Animating layout properties  
- Infinite animations without purpose  
- Over-staggering lists  
- Ignoring reduced motion  
- Using motion for decoration  

---

## Philosophy

Motion is interaction design.

---

## Final Rule

> If motion does not improve UX → remove it.
