---
name: frontend-performance
description: Frontend performance optimization patterns for React/Next.js including rendering, bundling, lazy loading, Core Web Vitals, and image optimization.
origin: ECC
---

# Frontend Performance Optimization

Comprehensive guide to optimizing frontend performance in React and Next.js applications. Covers rendering optimization, bundle size reduction, Core Web Vitals, image handling, virtualization, server-side rendering, font loading, caching, and performance measurement.

---

## When to Use

Use this skill when:

- **Optimizing React rendering**: Components re-render unnecessarily, UI feels sluggish, interactions are delayed
- **Reducing bundle size**: Initial load is slow, JavaScript payload exceeds 200KB compressed, Lighthouse performance score is below 90
- **Improving Core Web Vitals**: LCP > 2.5s, INP > 200ms, CLS > 0.1
- **Implementing lazy loading**: Pages load resources that are not immediately visible or needed
- **Migrating to SSR/SSG**: SEO requirements demand server-rendered content, TTFB is high
- **Handling large datasets**: Lists or tables with 1000+ rows cause scroll jank
- **Optimizing images**: Images account for a large portion of page weight, layout shifts occur during image load

---

## How It Works

Reduce bundle size with code splitting and tree shaking, optimize rendering with React.memo and useMemo, improve Core Web Vitals (LCP, INP, CLS) through image optimization and font loading strategies, and use virtualization for large lists. Measure with Lighthouse and web-vitals library.

## Examples

## Core Web Vitals

### Largest Contentful Paint (LCP)

LCP measures the render time of the largest visible content element. Target: under 2.5 seconds.

**Common causes of poor LCP:**
- Slow server response (high TTFB)
- Render-blocking CSS and JavaScript
- Slow resource load times
- Client-side rendering delays

```typescript
// Preload critical resources in Next.js layout
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  other: {
    'link': [
      { rel: 'preload', href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://cdn.example.com' },
    ],
  },
}

// Prioritize above-the-fold images
import Image from 'next/image'

export function HeroBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={600}
      priority          // Disables lazy loading, adds preload hint
      sizes="100vw"
      quality={85}
    />
  )
}
```

```typescript
// Inline critical CSS for above-the-fold content
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,  // Enables critters for critical CSS inlining
  },
}

export default nextConfig
```

### Interaction to Next Paint (INP)

INP measures responsiveness to user interactions. Target: under 200ms.

```typescript
// Break up long tasks with scheduling
function processLargeDataset(items: readonly DataItem[]): void {
  const CHUNK_SIZE = 50

  function processChunk(startIndex: number): void {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, items.length)

    for (let i = startIndex; i < endIndex; i++) {
      processItem(items[i])
    }

    if (endIndex < items.length) {
      // Yield to the main thread between chunks
      requestIdleCallback(() => processChunk(endIndex))
    }
  }

  processChunk(0)
}

// Use useTransition for non-urgent state updates
import { useState, useTransition } from 'react'

export function SearchableList({ items }: { items: readonly ListItem[] }) {
  const [query, setQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState(items)
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string): void {
    setQuery(value)  // Urgent: update input immediately

    startTransition(() => {
      // Non-urgent: filter can be deferred
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredItems(filtered)
    })
  }

  return (
    <div>
      <input
        value={query}
        onChange={e => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      {isPending && <span className="text-muted">Filtering...</span>}
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Cumulative Layout Shift (CLS)

CLS measures visual stability. Target: under 0.1.

```typescript
// Always specify dimensions for media elements
export function VideoEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        allowFullScreen
      />
    </div>
  )
}

// Reserve space for dynamic content
export function AdSlot({ width, height }: { width: number; height: number }) {
  return (
    <div
      className="bg-gray-100"
      style={{ minHeight: height, minWidth: width }}
      aria-label="Advertisement"
    >
      {/* Ad content loads here without causing layout shift */}
    </div>
  )
}

// Use CSS containment for isolated layout regions
// styles/layout.css
// .card-grid {
//   contain: layout style;
// }
// .card-grid .card {
//   contain: content;
// }
```

---

## React Rendering Optimization

### Preventing Unnecessary Re-renders

```typescript
import { memo, useMemo, useCallback, useState } from 'react'

interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly category: string
}

interface ProductCardProps {
  readonly product: Product
  readonly onAddToCart: (productId: string) => void
}

// Memoize components that receive stable props
const ProductCard = memo(function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="p-4 border rounded">
      <h3>{product.name}</h3>
      <p>${product.price.toFixed(2)}</p>
      <button onClick={() => onAddToCart(product.id)}>Add to Cart</button>
    </div>
  )
})

interface ProductListProps {
  readonly products: readonly Product[]
  readonly selectedCategory: string
}

export function ProductList({ products, selectedCategory }: ProductListProps) {
  const [cart, setCart] = useState<readonly string[]>([])

  // Memoize expensive filtering
  const filteredProducts = useMemo(
    () => products.filter(p => p.category === selectedCategory),
    [products, selectedCategory]
  )

  // Stabilize callback reference
  const handleAddToCart = useCallback((productId: string) => {
    setCart(prevCart => [...prevCart, productId])
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4">
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  )
}
```

### State Colocation

```typescript
// WRONG: Lifting state too high causes unnecessary re-renders in siblings
function ParentBad() {
  const [inputValue, setInputValue] = useState('')  // Every keystroke re-renders ExpensiveList
  return (
    <div>
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <ExpensiveList />
    </div>
  )
}

// CORRECT: Colocate state with the component that uses it
function SearchInput() {
  const [inputValue, setInputValue] = useState('')
  return <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
}

function ParentGood() {
  return (
    <div>
      <SearchInput />
      <ExpensiveList />  {/* No longer re-renders on input change */}
    </div>
  )
}
```

### Context Optimization

```typescript
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

// Split context by update frequency
interface ThemeContextValue {
  readonly theme: 'light' | 'dark'
}

interface ThemeActionsContextValue {
  readonly toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light' })
const ThemeActionsContext = createContext<ThemeActionsContextValue>({
  toggleTheme: () => undefined,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Memoize to prevent unnecessary re-renders of consumers
  const themeValue = useMemo<ThemeContextValue>(
    () => ({ theme }),
    [theme]
  )

  const actionsValue = useMemo<ThemeActionsContextValue>(
    () => ({
      toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
    }),
    []
  )

  return (
    <ThemeContext.Provider value={themeValue}>
      <ThemeActionsContext.Provider value={actionsValue}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeContext.Provider>
  )
}

// Components that only need to toggle don't re-render when theme changes
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

export function useThemeActions(): ThemeActionsContextValue {
  return useContext(ThemeActionsContext)
}
```

---

## Bundle Optimization

### Code Splitting with Dynamic Imports

```typescript
import { lazy, Suspense } from 'react'

// Route-level code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const Analytics = lazy(() =>
  import('./pages/Analytics').then(module => ({
    default: module.AnalyticsPage,  // Named export
  }))
)

function LoadingFallback() {
  return <div className="animate-pulse h-screen bg-gray-100" />
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  )
}

// Component-level code splitting for heavy libraries
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'))
const ChartWidget = lazy(() => import('./components/ChartWidget'))

export function PostEditor({ showPreview }: { showPreview: boolean }) {
  return (
    <div>
      <Suspense fallback={<div>Loading editor...</div>}>
        <MarkdownEditor />
      </Suspense>
      {showPreview && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <ChartWidget />
        </Suspense>
      )}
    </div>
  )
}
```

### Next.js Dynamic Imports

```typescript
import dynamic from 'next/dynamic'

// Disable SSR for browser-only components
const MapComponent = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse" />,
})

// Load heavy components on interaction
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  loading: () => <textarea placeholder="Loading editor..." className="w-full h-40" />,
})
```

### Analyzing Bundle Size

```typescript
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer'

const config = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})({
  // ...other config
})

export default config

// Run: ANALYZE=true npm run build
```

### Tree Shaking Best Practices

```typescript
// WRONG: Imports entire library
import _ from 'lodash'
const sorted = _.sortBy(items, 'name')

// CORRECT: Import only what you need
import sortBy from 'lodash/sortBy'
const sorted = sortBy(items, 'name')

// BEST: Use native alternatives when possible
const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))

// Ensure package.json has sideEffects field for proper tree shaking
// {
//   "sideEffects": false
// }
// or specify files with side effects:
// {
//   "sideEffects": ["*.css", "./src/polyfills.ts"]
// }
```

---

## Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image'

// Responsive hero image with blur placeholder
export function HeroSection() {
  return (
    <section className="relative h-[60vh]">
      <Image
        src="/images/hero.jpg"
        alt="Hero banner showing product showcase"
        fill
        priority
        sizes="100vw"
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        className="object-cover"
      />
    </section>
  )
}

// Product image grid with responsive sizes
export function ProductGrid({ products }: { products: readonly Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <div key={product.id} className="relative aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover rounded-lg"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
```

### Generating Blur Placeholders

```typescript
// lib/image-utils.ts
import { getPlaiceholder } from 'plaiceholder'

interface BlurPlaceholder {
  readonly base64: string
  readonly img: {
    readonly src: string
    readonly width: number
    readonly height: number
  }
}

export async function getBlurPlaceholder(imagePath: string): Promise<BlurPlaceholder> {
  try {
    const buffer = await fetch(imagePath).then(res => res.arrayBuffer())
    const { base64, img } = await getPlaiceholder(Buffer.from(buffer), { size: 10 })
    return { base64, img }
  } catch (error) {
    console.error('Failed to generate blur placeholder:', error)
    throw new Error(`Blur placeholder generation failed for ${imagePath}`)
  }
}
```

### Modern Formats with Fallback

```html
<picture>
  <source srcset="/images/hero.avif" type="image/avif" />
  <source srcset="/images/hero.webp" type="image/webp" />
  <img
    src="/images/hero.jpg"
    alt="Hero image"
    width="1200"
    height="600"
    loading="lazy"
    decoding="async"
  />
</picture>
```

---

## Virtualization

### Virtualizing Long Lists with TanStack Virtual

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

interface VirtualListProps {
  readonly items: readonly ListItem[]
  readonly estimateSize?: number
}

export function VirtualList({ items, estimateSize = 50 }: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,  // Render 5 extra items above and below viewport
  })

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ListRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Virtualized Data Table

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef, useMemo } from 'react'

interface Column<T> {
  readonly key: keyof T
  readonly header: string
  readonly width: number
  readonly render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface VirtualTableProps<T> {
  readonly data: readonly T[]
  readonly columns: readonly Column<T>[]
  readonly rowHeight?: number
}

export function VirtualTable<T extends { id: string }>({
  data,
  columns,
  rowHeight = 48,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  const totalWidth = useMemo(
    () => columns.reduce((sum, col) => sum + col.width, 0),
    [columns]
  )

  return (
    <div ref={parentRef} className="h-[500px] overflow-auto border rounded">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b flex" style={{ minWidth: totalWidth }}>
        {columns.map(col => (
          <div
            key={String(col.key)}
            className="px-4 py-2 font-semibold text-sm"
            style={{ width: col.width }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Virtualized body */}
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', minWidth: totalWidth }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const row = data[virtualRow.index]
          return (
            <div
              key={row.id}
              className="flex border-b hover:bg-gray-50"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {columns.map(col => (
                <div
                  key={String(col.key)}
                  className="px-4 py-2 text-sm truncate"
                  style={{ width: col.width }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key])}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## SSR / SSG Patterns

### When to Use Each Strategy

| Strategy | Use When | Example |
|----------|----------|---------|
| **SSG** (Static Site Generation) | Content rarely changes, same for all users | Marketing pages, blog posts, docs |
| **ISR** (Incremental Static Regeneration) | Content changes periodically, can tolerate staleness | Product pages, listings |
| **SSR** (Server-Side Rendering) | Content changes per request or per user | Dashboards, search results |
| **CSR** (Client-Side Rendering) | Highly interactive, no SEO requirements | Admin panels, internal tools |

### Next.js App Router Patterns

```typescript
// Static generation (default in App Router)
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug)
  return <article dangerouslySetInnerHTML={{ __html: post.html }} />
}

// ISR with revalidation
// app/products/[id]/page.tsx
export const revalidate = 3600  // Revalidate every hour

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id)
  return <ProductDisplay product={product} />
}

// Dynamic SSR (opt out of caching)
// app/dashboard/page.tsx
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await fetchDashboardData()
  return <Dashboard data={data} />
}
```

### Streaming SSR with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Shell renders immediately */}
      <h1>Dashboard</h1>

      {/* Each section streams in as its data resolves */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsPanel />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

// Each component fetches its own data
async function MetricsPanel() {
  const metrics = await fetchMetrics()  // Fetches on server
  return (
    <div className="grid grid-cols-4 gap-4">
      {metrics.map(metric => (
        <div key={metric.label} className="p-4 border rounded">
          <p className="text-sm text-gray-600">{metric.label}</p>
          <p className="text-2xl font-bold">{metric.value}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## Font Loading

### Optimal Font Loading with Next.js

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',       // Prevents FOIT (Flash of Invisible Text)
  variable: '--font-inter',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,         // Don't preload secondary fonts
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Self-Hosted Font Optimization

```typescript
// app/layout.tsx
import localFont from 'next/font/local'

const customFont = localFont({
  src: [
    { path: '../public/fonts/custom-regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/custom-medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/custom-bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-custom',
  fallback: ['system-ui', 'Arial', 'sans-serif'],  // Reduces CLS
  adjustFontFallback: 'Arial',  // Adjusts fallback metrics to match custom font
})
```

---

## Caching Strategies

### SWR (Stale-While-Revalidate)

```typescript
import useSWR from 'swr'

interface FetcherOptions {
  readonly url: string
  readonly headers?: Record<string, string>
}

async function fetcher<T>({ url, headers }: FetcherOptions): Promise<T> {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<T>
}

export function useProducts(category: string) {
  const { data, error, isLoading, mutate } = useSWR<readonly Product[]>(
    { url: `/api/products?category=${encodeURIComponent(category)}` },
    fetcher,
    {
      revalidateOnFocus: false,        // Don't refetch on window focus
      revalidateOnReconnect: true,     // Refetch when back online
      dedupingInterval: 5000,          // Deduplicate requests within 5s
      refreshInterval: 30000,          // Poll every 30 seconds
      errorRetryCount: 3,
      keepPreviousData: true,          // Keep stale data during revalidation
    }
  )

  return {
    products: data ?? [],
    isLoading,
    isError: error !== undefined,
    refresh: mutate,
  } as const
}
```

### Service Worker Caching

```typescript
// service-worker.ts
const CACHE_NAME = 'app-cache-v1'
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/styles/critical.css',
]

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event

  // Cache-first for static assets
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cached =>
        cached ?? fetch(request).then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return response
        })
      )
    )
    return
  }

  // Network-first for API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request).then(cached => cached ?? new Response('Offline', { status: 503 })))
    )
    return
  }
})
```

### HTTP Cache Headers in Next.js API Routes

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const products = await fetchProducts()

  return NextResponse.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, max-age=300',
      'Vary': 'Accept-Encoding',
    },
  })
}
```

---

## Measuring Performance

### Web Vitals Reporting

```typescript
// app/components/WebVitals.tsx
'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals'

function sendToAnalytics(metric: Metric): void {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,       // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  }

  // Use sendBeacon for reliability during page unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(body))
  } else {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // Silently fail - analytics should not block the user
    })
  }
}

export function WebVitals() {
  useEffect(() => {
    onCLS(sendToAnalytics)
    onINP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onFCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
  }, [])

  return null
}
```

### Performance Marks and Measures

```typescript
// lib/performance.ts
export function markStart(label: string): void {
  if (typeof performance !== 'undefined') {
    performance.mark(`${label}-start`)
  }
}

export function markEnd(label: string): PerformanceMeasure | undefined {
  if (typeof performance !== 'undefined') {
    performance.mark(`${label}-end`)
    try {
      return performance.measure(label, `${label}-start`, `${label}-end`)
    } catch {
      return undefined
    }
  }
  return undefined
}

// Usage in a component
export function DataGrid({ fetchData }: { fetchData: () => Promise<readonly Row[]> }) {
  useEffect(() => {
    markStart('data-grid-load')

    fetchData().then(data => {
      const measure = markEnd('data-grid-load')
      if (measure && measure.duration > 1000) {
        // Log slow loads for investigation
        reportSlowLoad('data-grid', measure.duration)
      }
    }).catch(error => {
      console.error('DataGrid load failed:', error)
    })
  }, [fetchData])

  // ...render
}
```

### Lighthouse CI Configuration

```typescript
// lighthouserc.ts
export default {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/products',
        'http://localhost:3000/checkout',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

---

## Quick Reference Checklist

Before shipping, verify:

- [ ] LCP under 2.5s on mobile
- [ ] INP under 200ms
- [ ] CLS under 0.1
- [ ] JavaScript bundle under 200KB compressed
- [ ] Images use modern formats (WebP/AVIF) with fallbacks
- [ ] Above-the-fold images have `priority` attribute
- [ ] Below-the-fold content is lazy loaded
- [ ] Fonts use `display: swap` and are preloaded
- [ ] No layout shifts from dynamic content
- [ ] Long lists are virtualized (1000+ items)
- [ ] Heavy components use code splitting
- [ ] React.memo applied to expensive pure components
- [ ] useCallback/useMemo used for stable references
- [ ] Context is split by update frequency
- [ ] Cache headers set on API responses
- [ ] Lighthouse CI runs in pipeline with score thresholds
