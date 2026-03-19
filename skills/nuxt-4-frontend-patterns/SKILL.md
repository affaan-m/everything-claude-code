---
name: nuxt-4-frontend-patterns
description: Nuxt 4 frontend patterns — hydration safety, performance optimization, route rules, lazy loading, plugin best practices, data fetching, and VueUse integration for production Vue 3/Nuxt apps.
origin: ECC
---

# Nuxt 4 Frontend Patterns

Production-grade patterns for building performant, SSR-safe Nuxt 4 applications with VueUse integration.

## When to Activate

- Building Nuxt 4 / Vue 3 applications
- Fixing hydration mismatch warnings
- Optimizing Core Web Vitals (LCP, CLS, INP)
- Configuring hybrid rendering or route rules
- Working with `useFetch`, `useAsyncData`, or `useState`
- Integrating VueUse composables in an SSR context
- Managing third-party scripts or plugins

## Project Structure

```
app/
├── assets/              # Static assets (CSS, images)
├── components/          # Auto-imported Vue components
│   ├── ui/              # Reusable UI primitives
│   └── feature/         # Feature-specific components
├── composables/         # Auto-imported composables
├── layouts/             # Layout components
├── middleware/          # Route middleware
├── pages/               # File-based routing
├── plugins/             # Keep minimal — prefer composables
└── utils/               # Auto-imported utility functions
server/
├── api/                 # Server API routes
├── middleware/          # Server middleware
└── utils/               # Server utilities
nuxt.config.ts           # Nuxt configuration + route rules
```

## Hydration Safety

Hydration mismatches are not just warnings — they break interactivity, cause layout shifts, and degrade SEO.

### Use SSR-Safe State

```typescript
// Not good: localStorage doesn't exist on server
const theme = localStorage.getItem('theme') || 'light'

// Good: useCookie works on both server and client
const theme = useCookie('theme', { default: () => 'light' })

// Good: useState shares state across SSR and client
const count = useState('count', () => 0)
```

### Avoid Non-Deterministic Rendering

```typescript
// Not good: different value on server vs client
const id = Math.random().toString(36)

// Good: useState ensures same value on both sides
const id = useState('id', () => Math.random().toString(36))
```

### Handle Browser-Only APIs

```vue
<script setup lang="ts">
// Not good: window doesn't exist on server
const width = window.innerWidth

// Good: defer to onMounted
const width = ref(0)
onMounted(() => {
  width.value = window.innerWidth
})
</script>
```

### Use CSS for Responsive Layouts (Not JS)

```vue
<template>
  <!-- Not good: causes hydration mismatch -->
  <div v-if="window?.innerWidth > 768">Desktop</div>

  <!-- Good: CSS handles responsiveness without mismatch -->
  <div class="hidden md:block">Desktop content</div>
  <div class="md:hidden">Mobile content</div>
</template>
```

### ClientOnly for Time-Dependent Content

```vue
<template>
  <ClientOnly>
    {{ greeting }}
    <template #fallback>Hello!</template>
  </ClientOnly>
</template>

<script setup lang="ts">
const greeting = ref('Hello!')
onMounted(() => {
  const hour = new Date().getHours()
  greeting.value = hour < 12 ? 'Good morning' : 'Good afternoon'
})
</script>
```

### Third-Party Libraries with DOM Side Effects

```typescript
// Good: dynamic import after mount
onMounted(async () => {
  const { default: SomeBrowserLib } = await import('browser-only-lib')
  SomeBrowserLib.init()
})

// Good: guard with import.meta.client
if (import.meta.client) {
  const { default: SomeBrowserLib } = await import('browser-only-lib')
  SomeBrowserLib.init()
}
```

### SSR-Safe Composables Reference


| Composable          | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `useState`          | Shared state across SSR and client                |
| `useCookie`         | Cookie access on both environments                |
| `useFetch`          | Server-side data fetching with payload forwarding |
| `useAsyncData`      | Async operations with SSR support                 |
| `useRequestHeaders` | Access request headers during SSR                 |


## Performance Patterns

### Hybrid Rendering with Route Rules

Control rendering strategy per route — prerender static pages, cache dynamic ones, SPA for admin.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },
    '/blog/**': { isr: 3600 },
    '/admin/**': { ssr: false },
  },
})
```


| Strategy          | Use Case                                         |
| ----------------- | ------------------------------------------------ |
| `prerender: true` | Static content — homepage, about, docs           |
| `swr: seconds`    | Stale-while-revalidate — product listings, feeds |
| `isr: seconds`    | Incremental static regeneration — blog posts     |
| `ssr: false`      | Client-only — admin dashboards, auth-gated pages |


### NuxtLink Prefetching

```vue
<template>
  <!-- Prefetches JS automatically when link enters viewport -->
  <NuxtLink to="/about">About</NuxtLink>
</template>
```

```typescript
// nuxt.config.ts — prefetch on interaction instead of viewport
export default defineNuxtConfig({
  experimental: {
    defaults: {
      nuxtLink: {
        prefetchOn: 'interaction',
      },
    },
  },
})
```

### Lazy Loading Components

Add the `Lazy` prefix to defer component loading until needed.

```vue
<script setup lang="ts">
const showComments = ref(false)
</script>

<template>
  <article>
    <h1>Post Title</h1>
    <p>Content...</p>
    <button @click="showComments = true">Show Comments</button>
    <!-- JS for this component loads only when rendered -->
    <LazyCommentsList v-if="showComments" />
  </article>
</template>
```

### Lazy Hydration

Control when components become interactive — reduces JavaScript work on initial load.

```vue
<template>
  <!-- Hydrate when scrolled into view -->
  <LazyHeavyChart hydrate-on-visible />

  <!-- Hydrate when browser is idle -->
  <LazyFooter hydrate-on-idle />

  <!-- Hydrate on user interaction -->
  <LazySidebar hydrate-on-interaction />
</template>
```

### Image Optimization with NuxtImg

```vue
<template>
  <!-- High priority: hero/LCP image -->
  <NuxtImg
    src="/hero.jpg"
    format="webp"
    :preload="{ fetchPriority: 'high' }"
    loading="eager"
    width="1200"
    height="600"
  />

  <!-- Low priority: below the fold -->
  <NuxtImg
    src="/thumbnail.jpg"
    format="webp"
    loading="lazy"
    fetchpriority="low"
    width="300"
    height="200"
  />
</template>
```

### Third-Party Script Management

```typescript
// Good: controlled loading with useScript
const { load, proxy } = useScriptGoogleAnalytics({
  id: 'G-XXXXXXX',
  scriptOptions: { trigger: 'manual' },
})

// Must explicitly load when using manual trigger
await load()
proxy.gtag('config', 'G-XXXXXXX')
```

### Vue Performance Primitives

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'

const appTitle = 'My App'

// Use shallowRef for large objects that don't need deep reactivity
const largeList = shallowRef<Item[]>([])
const items = largeList
</script>

<template>
  <!-- v-once: render static content once, skip future updates -->
  <header v-once>
    <h1>{{ appTitle }}</h1>
  </header>

  <!-- v-memo: skip re-render unless dependencies change -->
  <div v-for="item in items" :key="item.id" v-memo="[item.selected]">
    <p>{{ item.name }}</p>
  </div>
</template>
```

## Data Fetching

### useFetch — Primary Data Fetching

```vue
<script setup lang="ts">
// Fetches on server, forwards payload to client (no double fetch)
const { data: posts, status, error } = await useFetch('/api/posts', {
  query: { page: 1 },
})
</script>

<template>
  <div v-if="status === 'pending'">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>
```

### useAsyncData — Custom Async Logic

```vue
<script setup lang="ts">
const { data: user } = await useAsyncData('user', () => {
  return $fetch('/api/user', {
    headers: useRequestHeaders(['cookie']),
  })
})
</script>
```

## Plugin Best Practices

### Prefer Composables Over Plugins

```typescript
// Not good: plugin for simple utility
// plugins/format-date.ts
export default defineNuxtPlugin(() => {
  return {
    provide: { formatDate: (d: Date) => d.toLocaleDateString() },
  }
})

// Good: composable — auto-imported, tree-shakeable, no init cost
// composables/useFormatDate.ts
export function useFormatDate() {
  const format = (d: Date) => d.toLocaleDateString()
  return { format }
}
```

### Enable Parallel Plugin Loading

```typescript
// plugins/analytics.ts
export default defineNuxtPlugin({
  name: 'analytics',
  parallel: true, // Don't block other plugins
  async setup(nuxtApp) {
    // async init that won't block rendering
  },
})
```

### When Plugins ARE Appropriate

Use plugins only when you need to:

- Register a global Vue directive
- Inject a singleton service (`provide`/`inject` pattern)
- Run one-time setup that must happen before app render
- Integrate a Vue plugin (`nuxtApp.vueApp.use(...)`)

## VueUse Integration

### Setup

```bash
npx nuxt@latest module add vueuse
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vueuse/nuxt'],
})
```

All VueUse composables are auto-imported — no manual imports needed.

### SSR-Safe Storage

```vue
<script setup lang="ts">
// Not good: raw localStorage causes hydration mismatch
const theme = ref(localStorage.getItem('theme') || 'light')

// Good: useLocalStorage is SSR-safe via @vueuse/nuxt
const theme = useLocalStorage('theme', 'light')
const session = useSessionStorage('session-data', { loggedIn: false })
</script>
```

### Dark Mode

```vue
<script setup lang="ts">
const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <button @click="toggleDark()">
    {{ isDark ? 'Light Mode' : 'Dark Mode' }}
  </button>
</template>
```

### Intersection Observer (Lazy Loading / Analytics)

```vue
<script setup lang="ts">
const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(target, ([entry]) => {
  isVisible.value = entry.isIntersecting
}, { threshold: 0.5 })
</script>

<template>
  <div ref="target">
    <LazyHeavyComponent v-if="isVisible" />
  </div>
</template>
```

### Debounced Search

```vue
<script setup lang="ts">
const query = ref('')
const results = ref<Array<{ id: string; title: string }>>([])

const debouncedSearch = useDebounceFn(async (term: string) => {
  if (!term) { results.value = []; return }
  results.value = await $fetch(`/api/search?q=${encodeURIComponent(term)}`) ?? []
}, 300)

watch(query, (term) => debouncedSearch(term))
</script>
```

### Responsive Breakpoints

**CSS-first (preferred for layout switching):**

```vue
<template>
  <!-- Good: CSS handles layout — no hydration mismatch -->
  <MobileNav class="md:hidden" />
  <DesktopNav class="hidden md:block" />
</template>
```

**`useBreakpoints` with `ssrWidth` (when JS logic is truly needed):**

```vue
<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

// ssrWidth ensures server and client agree on initial render
const breakpoints = useBreakpoints(breakpointsTailwind, { ssrWidth: 1024 })
const isMobile = breakpoints.smaller('md')

// Legitimate JS use case: adjust non-layout behavior by breakpoint
const scrollOffset = computed(() => isMobile.value ? 56 : 96)
</script>
```

> **Warning:** `useMediaQuery` is a no-op on server (always returns `false`).
> Using it with `v-if` to toggle components causes hydration mismatch.
> Use CSS breakpoint classes for layout switching instead.

### Keyboard Shortcuts

```vue
<script setup lang="ts">
const { ctrl_k } = useMagicKeys()

whenever(ctrl_k, () => {
  openCommandPalette()
})
</script>
```

### Common VueUse Composables for Nuxt


| Composable                        | Purpose                   | SSR-Safe               |
| --------------------------------- | ------------------------- | ---------------------- |
| `useLocalStorage`                 | Persistent reactive state | Yes (via @vueuse/nuxt) |
| `useDark` / `usePreferredDark`    | Dark mode detection       | Yes                    |
| `useIntersectionObserver`         | Viewport visibility       | Yes (no-op on server)  |
| `useDebounceFn` / `useThrottleFn` | Rate-limit function calls | Yes                    |
| `useMediaQuery`                   | Responsive breakpoints    | No-op on server — **do not use with `v-if` for layout** (causes hydration mismatch). Use CSS breakpoints or `useBreakpoints` with `ssrWidth` instead |
| `useBreakpoints`                  | JS breakpoint logic       | Yes (with `ssrWidth` option for SSR-safe initial value) |
| `useMagicKeys`                    | Keyboard shortcuts        | Yes (no-op on server)  |
| `useElementBounding`              | Element position/size     | Yes (no-op on server)  |
| `useWindowSize`                   | Window dimensions         | Yes (no-op on server)  |
| `onClickOutside`                  | Detect outside clicks     | Yes (no-op on server)  |
| `useRefHistory`                   | Undo/redo for refs        | Yes                    |


## Common Pitfalls


| Pitfall                                     | Fix                                                           |
| ------------------------------------------- | ------------------------------------------------------------- |
| Using `localStorage` directly in setup      | Use `useCookie` or `useLocalStorage` from VueUse              |
| `v-if` based on `window` / `document`       | Use CSS media queries for layout; `useBreakpoints` with `ssrWidth` for JS logic. **Avoid `useMediaQuery` with `v-if`** — it causes hydration mismatch |
| `Math.random()` / `Date.now()` in templates | Wrap in `useState` to sync SSR/client                         |
| Too many plugins with expensive init        | Convert to composables; set `parallel: true` on async plugins |
| All components loaded eagerly               | Add `Lazy` prefix for below-the-fold components               |
| No route rules configured                   | Use `prerender`, `swr`, `isr` per route                       |
| Unoptimized images                          | Use `<NuxtImg>` with `format="webp"` and priority hints       |
| Third-party scripts blocking render         | Use `useScript` with manual trigger                           |
| Deep reactivity on large objects            | Use `shallowRef` for collections not needing deep tracking    |
| Ignoring hydration warnings in console      | Every warning is a bug — fix immediately                      |


