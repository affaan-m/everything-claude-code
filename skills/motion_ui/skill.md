````md
---
name: motion-ui
description: "Production-ready UI motion system for React/Next.js. Use when implementing animations, transitions, or motion patterns."
---

# Motion System v4.1

Production-ready UI motion system for React / Next.js.

Focused on **performance, accessibility, and usability** — not decoration.

**by Jatan**

---

## When to Use

Use this motion system when motion:

- Guides attention (onboarding, primary actions)
- Communicates state (loading, success, error, transitions)
- Preserves spatial continuity (navigation, layout changes)

### Appropriate Scenarios

- Interactive UI (buttons, modals, menus)
- State transitions (open/close, loading states)
- Navigation transitions and shared elements

### Considerations

- Accessibility must be preserved (reduced motion support)
- Low-end device performance must be respected
- Prefer responsiveness over visual smoothness

### Avoid Motion When

- It is purely decorative
- It reduces clarity or usability
- It impacts performance

---

## Core Principle

Motion must:

- Guide attention
- Communicate state
- Preserve spatial continuity

If it does none → remove it.

---

## Installation

```bash
npm install motion
````

---

## Versions

* `motion/react` → default
* `framer-motion` → legacy (do not mix)

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

## Performance Rules

### Safe Properties

* transform
* opacity

### Avoid

* width
* height
* top
* left

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

### Reduced Motion (React)

```tsx
import { motion, useReducedMotion } from "motion/react"

const reduce = useReducedMotion()

export function Example() {
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
    />
  )
}
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

* hover → whileHover
* tap → whileTap
* in-view → whileInView
* scroll → useScroll
* conditional → AnimatePresence
* small layout → layout
* large layout → avoid
* complex → useAnimate

---

## Layout System

* layoutId → shared transitions
* AnimatePresence → mount/unmount transitions

---

## Advanced Patterns

* Parallax scrolling
* Scroll storytelling sections
* 3D pointer tilt
* Crossfade transitions
* Clip-path reveals
* Skeleton loading loops
* Micro-interactions
* Spring physics motion

---

## Modal System (Production Safe)

```tsx
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

type ModalProps = {
  open: boolean
  onClose: () => void
}

function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return

    const el = ref.current

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (first) first.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      if (!first || !last) return

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    el.addEventListener("keydown", handleKey)
    return () => el.removeEventListener("keydown", handleKey)
  }, [active, ref])
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

export function Modal({ open, onClose }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useFocusTrap(ref, open)
  useScrollLock(open)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (open) window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/40"
        >
          <motion.div
            ref={ref}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-6 rounded"
          >
            <button onClick={onClose}>Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Scroll Parallax

```tsx
import { useScroll, useTransform, motion } from "motion/react"

export function Parallax() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])

  return <motion.div style={{ y }} />
}
```

---

## Skeleton Loading

```tsx
import { motion } from "motion/react"

export function Skeleton() {
  return (
    <motion.div
      className="bg-gray-200 h-6 w-full"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.2 }}
    />
  )
}
```

---

## Shared Layout

```tsx
import { motion } from "motion/react"

export function Shared() {
  return <motion.div layoutId="shared" />
}
```

---

## Stagger List

```tsx
import { motion } from "motion/react"

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export function List() {
  return (
    <motion.ul variants={container} initial="hidden" animate="visible">
      {[1, 2, 3].map(i => (
        <motion.li key={i} variants={item}>
          Item {i}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

---

## Debug Checklist

* correct import (`motion/react`)
* `"use client"` in Next.js
* no missing keys
* no layout shift (CLS)
* no hydration mismatch
* reduced motion works
* keyboard navigation works

---

## Anti-Patterns

* animating layout (width/height)
* decorative motion
* infinite motion without purpose
* ignoring reduced motion
* over-staggering lists

---

## Philosophy

Motion is interaction design.

---

## Final Rule

> If motion does not improve UX → remove it.

```
```
