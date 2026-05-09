---

name: motion-ui
description: "Production-ready UI motion system for React/Next.js. Use when implementing animations, transitions, or motion patterns."
--------------------------------------------------------------------------------------------------------------------------------------

# Motion System v4.1

Production-ready UI motion system for React / Next.js.

Focused on **performance, accessibility, and usability** — not decoration.

---

## When to Use

Use this motion system when motion:

* Guides attention (e.g., onboarding, key actions)
* Communicates state (loading, success, error, transitions)
* Preserves spatial continuity (layout changes, navigation)

### Appropriate Scenarios

* Interactive components (buttons, modals, menus)
* State transitions (loading → loaded, open → closed)
* Navigation and layout continuity (shared elements, crossfade)

### Considerations

* **Accessibility**: Always support reduced motion
* **Device adaptation**: Adjust for low-end devices
* **Performance trade-offs**: Prefer responsiveness over visual smoothness

### Avoid Using Motion When

* It is purely decorative
* It reduces usability or clarity
* It impacts performance negatively

---

## How It Works

### Core Principle

Motion must:

* Guide attention
* Communicate state
* Preserve spatial continuity

If it does none → remove it.

---

### Installation

```bash
npm install motion
```

---

### Version

* `motion/react` → default
* `framer-motion` → legacy

Do not mix.

---

### Motion Tokens

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

### Performance Rules

**Safe**

* transform
* opacity

**Avoid**

* width / height
* top / left

Rule: responsiveness > smoothness

---

### Device Adaptation

```ts
const isLowEnd =
  typeof navigator !== "undefined" &&
  navigator.hardwareConcurrency <= 4

const duration = isLowEnd ? 0.2 : 0.4
```

---

### Accessibility

#### JS (useReducedMotion)

```tsx
import { motion, useReducedMotion } from "motion/react"

const reduce = useReducedMotion()

<motion.div
  initial={{ opacity: 0, y: reduce ? 0 : 24 }}
  animate={{ opacity: 1, y: 0 }}
/>
```

#### CSS

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

#### Tailwind

```html
<div class="motion-safe:animate-fade motion-reduce:opacity-100"></div>
```

---

### Architecture & Patterns

#### Core Patterns

* Hover → `whileHover`
* Tap → `whileTap`
* In view → `whileInView`
* Scroll linked → `useScroll`
* Conditional → `AnimatePresence`
* Layout small → `layout`
* Layout large → avoid
* Complex → `useAnimate`

#### Layout & Transitions

* Shared transitions → `layoutId`
* Presence transitions → `AnimatePresence`

---

### Advanced Patterns (Concepts)

* Parallax (scroll-linked transforms)
* Scroll storytelling (sticky sections)
* 3D tilt (pointer-based transforms)
* Crossfade (shared layoutId)
* Progressive reveal (clip-path)
* Skeleton loading (looped opacity)
* Micro-interactions (hover/tap feedback)
* Spring system (physics-based motion)

---

### Modal Essentials

* Focus trap
* Escape close
* Scroll lock
* ARIA roles

#### Minimal Example

```tsx
import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

// Placeholder hooks (implement or replace with libraries)
function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus()
      }
    }

    el.addEventListener("keydown", handleKey)
    first?.focus()
    return () => el.removeEventListener("keydown", handleKey)
  }, [active, ref])
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [active])
}

export function Modal({ open, closeModal }: { open: boolean; closeModal: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useFocusTrap(ref, open)
  useScrollLock(open)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeModal])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
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
            <button onClick={closeModal}>Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Usage
export function Example() {
  const [open, setOpen] = React.useState(false)
  const openModal = () => setOpen(true)
  const closeModal = () => setOpen(false)

  return (
    <>
      <button onClick={openModal}>Open</button>
      <Modal open={open} closeModal={closeModal} />
    </>
  )
}
```

---

### SSR Safety

* Match initial states
* Avoid implicit animation origins

---

### Debugging

Check:

* Wrong import
* Missing `"use client"`
* Missing `key`
* Hydration mismatch
* Layout misuse
* State-driven animation

---

### QA

* No CLS
* Keyboard works
* Focus trapped
* ARIA correct
* Reduced motion works
* No hydration warnings
* Animations stop on unmount

---

### Anti-Patterns

* Animating layout properties
* Infinite animations without purpose
* Over-staggering lists
* Ignoring reduced motion
* Using motion for decoration

---

### Philosophy

Motion is interaction design.

---

### Final Rule

> If motion does not improve UX → remove it.

---

## Examples

### Button Interaction

```tsx
import { motion } from "motion/react"

export function Button() {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      Click me
    </motion.button>
  )
}
```

---

### Reduced Motion Example

```tsx
import { motion, useReducedMotion } from "motion/react"

export function FadeIn() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
    />
  )
}
```

---

### Stagger List

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
      {[1,2,3].map(i => (
        <motion.li key={i} variants={item}>Item {i}</motion.li>
      ))}
    </motion.ul>
  )
}
```

---

### Modal with AnimatePresence

```tsx
import { motion, AnimatePresence } from "motion/react"

export function Modal({ open }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        />
      )}
    </AnimatePresence>
  )
}
```

---

### Scroll Parallax

```tsx
import { useScroll, useTransform, motion } from "motion/react"

export function Parallax() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])

  return <motion.div style={{ y }} />
}
```

---

### Skeleton Loading

```tsx
import { motion } from "motion/react"

export function Skeleton() {
  return (
    <motion.div
      className="bg-gray-200 h-6 w-full"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity }}
    />
  )
}
```

---

### Shared Layout (Crossfade)

```tsx
import { motion } from "motion/react"

export function Shared() {
  return <motion.div layoutId="shared" />
}
```

