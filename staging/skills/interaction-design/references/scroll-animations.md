# Scroll Animations Reference

## Intersection Observer Hook

```tsx
import { useEffect, useRef, useState, type RefObject } from "react";

interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

function useInView<T extends HTMLElement>({
  threshold = 0,
  rootMargin = "0px",
  triggerOnce = false,
}: UseInViewOptions = {}): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        if (inView && triggerOnce) {
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isInView];
}

// Usage
function FadeInSection({ children }) {
  const [ref, isInView] = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}
```

## Scroll Progress Indicator

```tsx
import { motion, useScroll, useSpring } from "framer-motion";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
      style={{ scaleX }}
    />
  );
}
```

## Parallax Scrolling

### Simple CSS Parallax

```css
.parallax-container {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  perspective: 10px;
}

.parallax-layer-back {
  transform: translateZ(-10px) scale(2);
}

.parallax-layer-base {
  transform: translateZ(0);
}
```

### Framer Motion Parallax

```tsx
import { motion, useScroll, useTransform } from "framer-motion";

function ParallaxHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      {/* Background image with parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
      </motion.div>

      {/* Content fades out on scroll */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex items-center justify-center h-full"
      >
        <h1 className="text-6xl font-bold text-white">Welcome</h1>
      </motion.div>
    </section>
  );
}
```

## Scroll-Linked Animations

### Progress-Based Animation

```tsx
function ScrollAnimation() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Different transformations based on scroll progress
  const x = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#3b82f6", "#8b5cf6", "#ec4899"],
  );

  return (
    <div ref={containerRef} className="h-[200vh] py-20">
      <div className="sticky top-1/2 -translate-y-1/2 flex justify-center">
        <motion.div
          style={{ x, rotate, backgroundColor }}
          className="w-32 h-32 rounded-2xl"
        />
      </div>
    </div>
  );
}
```

### Horizontal Scroll Section

```tsx
function HorizontalScroll({ items }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(items.length - 1) * 100}%`],
  );

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-screen h-full flex items-center justify-center"
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

## Reveal Animations

### Staggered List Reveal

```tsx
function StaggeredList({ items }) {
  const [ref, isInView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <ul ref={ref} className="space-y-4">
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="p-4 bg-white rounded-lg shadow"
        >
          {item.content}
        </motion.li>
      ))}
    </ul>
  );
}
```

### Text Reveal

```tsx
function TextReveal({ text }) {
  const [ref, isInView] = useInView({ threshold: 0.5, triggerOnce: true });
  const words = text.split(" ");

  return (
    <p ref={ref} className="text-4xl font-bold">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
```

### Clip Path Reveal

```tsx
function ClipReveal({ children }) {
  const [ref, isInView] = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

## Sticky Scroll Sections

```tsx
function StickySection({ title, content, image }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.8]);

  return (
    <section ref={ref} className="relative h-[200vh]">
      <motion.div
        style={{ opacity, scale }}
        className="sticky top-0 h-screen flex items-center"
      >
        <div className="grid grid-cols-2 gap-16 container mx-auto">
          <div>
            <h2 className="text-4xl font-bold">{title}</h2>
            <p className="mt-4 text-lg text-gray-600">{content}</p>
          </div>
          <div>
            <img src={image} alt="" className="rounded-2xl shadow-xl" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
```

## Smooth Scroll

```tsx
// Using CSS
html {
  scroll-behavior: smooth;
}

// Using Lenis for butter-smooth scrolling
import Lenis from '@studio-freight/lenis';

function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return children;
}
```

## Scroll Snap

```css
/* Scroll snap container */
.snap-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}

.snap-section {
  scroll-snap-align: start;
  height: 100vh;
}

/* Smooth scrolling with snap */
@supports (scroll-snap-type: y mandatory) {
  .snap-container {
    scroll-behavior: smooth;
  }
}
```

```tsx
function FullPageScroll({ sections }) {
  return (
    <div className="snap-container">
      {sections.map((section, i) => (
        <section
          key={i}
          className="snap-section flex items-center justify-center"
        >
          {section}
        </section>
      ))}
    </div>
  );
}
```

## Performance Optimization

```tsx
// Use will-change sparingly
const AnimatedElement = styled(motion.div)`
  will-change: transform;
`;

// Debounce scroll handlers
function useThrottledScroll(callback, delay = 16) {
  const lastRun = useRef(0);

  useEffect(() => {
    const handler = () => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback();
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [callback, delay]);
}

// Use transform instead of top/left
// Good
const goodAnimation = { transform: "translateY(100px)" };
// Bad (causes reflow)
const badAnimation = { top: "100px" };
```
