---
name: frontend-performance
description: Frontend performance optimization patterns for React/Next.js including rendering, bundling, lazy loading, Core Web Vitals, and image optimization.
origin: ECC
---

# Frontend Performance Patterns

Optimization strategies for fast, responsive web applications.

## When to Activate

- Optimizing React rendering performance
- Reducing JavaScript bundle size
- Improving Core Web Vitals scores
- Implementing image optimization
- Setting up performance monitoring

## Core Web Vitals

### LCP (Largest Contentful Paint)

```typescript
// Priority loading for hero images
import Image from 'next/image'

export function HeroSection() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority // Preload, no lazy loading
      sizes="100vw"
    />
  )
}

// Inline critical CSS
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
}
```

### INP (Interaction to Next Paint)

```typescript
import { useTransition } from 'react'

function SearchResults({ query }: { query: string }) {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<Item[]>([])

  function handleSearch(value: string) {
    // Urgent: update input immediately
    setQuery(value)

    // Non-urgent: defer expensive filtering
    startTransition(() => {
      const filtered = allItems.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase()),
      )
      setResults(filtered)
    })
  }

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ItemList items={results} />
    </div>
  )
}
```

### CLS (Cumulative Layout Shift)

```css
/* Reserve space for images */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Reserve space for dynamic content */
.ad-slot {
  min-height: 250px;
  contain: layout;
}

/* Prevent font swap shift */
@font-face {
  font-family: 'CustomFont';
  font-display: optional; /* No layout shift */
}
```

## React Rendering Optimization

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react'

// Memoize expensive component
const DataTable = memo(function DataTable({ rows, onSort }: DataTableProps) {
  return (
    <table>
      {rows.map((row) => (
        <tr key={row.id}>
          <td>{row.name}</td>
          <td>{row.value}</td>
        </tr>
      ))}
    </table>
  )
})

// Memoize expensive computation
function Dashboard({ transactions }: { transactions: Transaction[] }) {
  const summary = useMemo(
    () => calculateSummary(transactions),
    [transactions],
  )

  const handleExport = useCallback(() => {
    exportToCSV(transactions)
  }, [transactions])

  return <DataTable rows={summary.rows} onSort={handleExport} />
}
```

### State Colocation

```typescript
// Bad: State too high — everything re-renders
function App() {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <Layout>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <Sidebar />          {/* Re-renders on every keystroke */}
      <MainContent />      {/* Re-renders on every keystroke */}
    </Layout>
  )
}

// Good: State colocated with consumer
function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  return <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
}
```

## Bundle Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react'

// Route-level splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  )
}
```

### Next.js Dynamic Imports

```typescript
import dynamic from 'next/dynamic'

// Heavy charting library — only load when needed
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})
```

### Tree Shaking

```typescript
// Bad: Import entire library
import _ from 'lodash'
_.debounce(fn, 300)

// Good: Import specific function
import debounce from 'lodash/debounce'
debounce(fn, 300)

// Better: Use native
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
```

## Virtualization

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size,
              width: '100%',
            }}
          >
            <ItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Font Loading

```typescript
// app/layout.tsx (Next.js)
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

## Caching

### SWR Pattern

```typescript
import useSWR from 'swr'

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      staleTime: 5 * 60 * 1000,
    },
  )

  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  return <ProfileCard user={data} />
}
```

## Measuring Performance

```typescript
import { onLCP, onINP, onCLS } from 'web-vitals'

function sendMetric(metric: { name: string; value: number }) {
  navigator.sendBeacon('/analytics', JSON.stringify(metric))
}

onLCP(sendMetric)
onINP(sendMetric)
onCLS(sendMetric)
```

**Remember**: Measure before optimizing. Use Lighthouse, Chrome DevTools Performance tab, and real user metrics to identify actual bottlenecks before applying optimizations.
