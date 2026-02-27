# Animation Libraries Reference

## Framer Motion

The most popular React animation library with declarative API.

### Basic Animations

```tsx
import { motion, AnimatePresence } from "framer-motion";

// Simple animation
function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Gesture animations
function InteractiveCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="p-6 bg-white rounded-lg shadow"
    >
      Hover or tap me
    </motion.div>
  );
}

// Keyframes animation
function PulseButton() {
  return (
    <motion.button
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0 0 rgba(59, 130, 246, 0.5)",
          "0 0 0 10px rgba(59, 130, 246, 0)",
          "0 0 0 0 rgba(59, 130, 246, 0)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Click me
    </motion.button>
  );
}
```

### Layout Animations

```tsx
import { motion, LayoutGroup } from "framer-motion";

// Shared layout animation
function TabIndicator({ activeTab, tabs }) {
  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="relative px-4 py-2"
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// Auto-layout reordering
function ReorderableList({ items, setItems }) {
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems}>
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          className="bg-white p-4 rounded-lg shadow mb-2 cursor-grab active:cursor-grabbing"
        >
          {item.title}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

### Orchestration

```tsx
// Staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

function StaggeredList({ items }) {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Page Transitions

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

function PageTransition({ children }) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

## GSAP (GreenSock)

Industry-standard animation library for complex, performant animations.

### Basic Timeline

```tsx
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
      })
        .from(
          subtitleRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4", // Start 0.4s before previous ends
        )
        .from(".cta-button", {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
        });
    }, containerRef);

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <div ref={containerRef}>
      <h1 ref={titleRef}>Welcome</h1>
      <p ref={subtitleRef}>Discover amazing things</p>
      <button className="cta-button">Get Started</button>
    </div>
  );
}
```

### ScrollTrigger

```tsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ParallaxSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax image
      gsap.to(imageRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      // Fade in content
      gsap.from(".content-block", {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <img ref={imageRef} src="/hero.jpg" alt="" className="absolute inset-0" />
      <div className="relative z-10">
        <div className="content-block">Block 1</div>
        <div className="content-block">Block 2</div>
      </div>
    </section>
  );
}
```

### Text Animation

```tsx
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

function AnimatedHeadline({ text }) {
  const textRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const split = new SplitText(textRef.current, {
      type: "chars,words",
      charsClass: "char",
    });

    gsap.from(split.chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      stagger: 0.02,
      duration: 0.8,
      ease: "back.out(1.7)",
    });

    return () => split.revert();
  }, [text]);

  return <h1 ref={textRef}>{text}</h1>;
}
```

## CSS Spring Physics

```tsx
// spring.ts - Custom spring physics
interface SpringConfig {
  stiffness: number; // Higher = snappier
  damping: number; // Higher = less bouncy
  mass: number;
}

const presets: Record<string, SpringConfig> = {
  default: { stiffness: 170, damping: 26, mass: 1 },
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  stiff: { stiffness: 210, damping: 20, mass: 1 },
  slow: { stiffness: 280, damping: 60, mass: 1 },
  molasses: { stiffness: 280, damping: 120, mass: 1 },
};

function springToCss(config: SpringConfig): string {
  // Convert spring parameters to CSS timing function approximation
  const { stiffness, damping } = config;
  const duration = Math.sqrt(stiffness) / damping;
  const bounce = 1 - damping / (2 * Math.sqrt(stiffness));

  // Map to cubic-bezier (approximation)
  if (bounce <= 0) {
    return `cubic-bezier(0.25, 0.1, 0.25, 1)`;
  }
  return `cubic-bezier(0.34, 1.56, 0.64, 1)`;
}
```

## Web Animations API

Native browser animation API for simple animations.

```tsx
function useWebAnimation(
  ref: RefObject<HTMLElement>,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  useEffect(() => {
    if (!ref.current) return;

    const animation = ref.current.animate(keyframes, options);

    return () => animation.cancel();
  }, [ref, keyframes, options]);
}

// Usage
function SlideIn({ children }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useWebAnimation(
    elementRef,
    [
      { transform: "translateX(-100%)", opacity: 0 },
      { transform: "translateX(0)", opacity: 1 },
    ],
    {
      duration: 300,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "forwards",
    },
  );

  return <div ref={elementRef}>{children}</div>;
}
```

## View Transitions API

Native browser API for page transitions.

```tsx
// Check support
const supportsViewTransitions = "startViewTransition" in document;

// Simple page transition
async function navigateTo(url: string) {
  if (!document.startViewTransition) {
    window.location.href = url;
    return;
  }

  document.startViewTransition(async () => {
    await fetch(url);
    // Update DOM
  });
}

// Named elements for morphing
function ProductCard({ product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <img
        src={product.image}
        style={{ viewTransitionName: `product-${product.id}` }}
      />
    </Link>
  );
}

// CSS for view transitions
/*
::view-transition-old(root) {
  animation: fade-out 0.25s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.25s ease-in;
}

::view-transition-group(product-*) {
  animation-duration: 0.3s;
}
*/
```

## Performance Tips

### GPU Acceleration

```css
/* Properties that trigger GPU acceleration */
.animated-element {
  transform: translateZ(0); /* Force GPU layer */
  will-change: transform, opacity; /* Hint to browser */
}

/* Only animate transform and opacity for 60fps */
.smooth {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

/* Avoid animating these (cause reflow) */
.avoid {
  /* Don't animate: width, height, top, left, margin, padding */
}
```

### Reduced Motion

```tsx
function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

// Usage
function AnimatedComponent() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  );
}
```
