# Bundling

Fix common bundling issues with third-party packages.

## Server-Incompatible Packages

Some packages use browser APIs (`window`, `document`, `localStorage`) and fail in Server Components.

### Error Signs

```
ReferenceError: window is not defined
ReferenceError: document is not defined
ReferenceError: localStorage is not defined
Module not found: Can't resolve 'fs'
```

### Solution 1: Mark as Client-Only

If the package is only needed on client:

```tsx
// Bad: Fails - package uses window
import SomeChart from 'some-chart-library'

export default function Page() {
  return <SomeChart />
}

// Good: Use dynamic import with ssr: false
import dynamic from 'next/dynamic'

const SomeChart = dynamic(() => import('some-chart-library'), {
  ssr: false,
})

export default function Page() {
  return <SomeChart />
}
```

### Solution 2: Externalize from Server Bundle

For packages that should run on server but have bundling issues:

```js
// next.config.js
module.exports = {
  serverExternalPackages: ['problematic-package'],
}
```

Use this for:
- Packages with native bindings (sharp, bcrypt)
- Packages that don't bundle well (some ORMs)
- Packages with circular dependencies

### Solution 3: Client Component Wrapper

Wrap the entire usage in a client component:

```tsx
// components/ChartWrapper.tsx
'use client'

import { Chart } from 'chart-library'

export function ChartWrapper(props) {
  return <Chart {...props} />
}

// app/page.tsx (server component)
import { ChartWrapper } from '@/components/ChartWrapper'

export default function Page() {
  return <ChartWrapper data={data} />
}
```

## CSS Imports

Import CSS files instead of using `<link>` tags. Next.js handles bundling and optimization.

```tsx
// Bad: Manual link tag
<link rel="stylesheet" href="/styles.css" />

// Good: Import CSS
import './styles.css'

// Good: CSS Modules
import styles from './Button.module.css'
```

## Polyfills

Next.js includes common polyfills automatically. Don't load redundant ones from polyfill.io or similar CDNs.

Already included: `Array.from`, `Object.assign`, `Promise`, `fetch`, `Map`, `Set`, `Symbol`, `URLSearchParams`, and 50+ others.

```tsx
// Bad: Redundant polyfills
<script src="https://polyfill.io/v3/polyfill.min.js?features=fetch,Promise,Array.from" />

// Good: Next.js includes these automatically
```

## ESM/CommonJS Issues

### Error Signs

```
SyntaxError: Cannot use import statement outside a module
Error: require() of ES Module
Module not found: ESM packages need to be imported
```

### Solution: Transpile Package

```js
// next.config.js
module.exports = {
  transpilePackages: ['some-esm-package', 'another-package'],
}
```

## Common Problematic Packages

| Package | Issue | Solution |
|---------|-------|----------|
| `sharp` | Native bindings | `serverExternalPackages: ['sharp']` |
| `bcrypt` | Native bindings | `serverExternalPackages: ['bcrypt']` or use `bcryptjs` |
| `canvas` | Native bindings | `serverExternalPackages: ['canvas']` |
| `recharts` | Uses window | `dynamic(() => import('recharts'), { ssr: false })` |
| `react-quill` | Uses document | `dynamic(() => import('react-quill'), { ssr: false })` |
| `mapbox-gl` | Uses window | `dynamic(() => import('mapbox-gl'), { ssr: false })` |
| `monaco-editor` | Uses window | `dynamic(() => import('@monaco-editor/react'), { ssr: false })` |
| `lottie-web` | Uses document | `dynamic(() => import('lottie-react'), { ssr: false })` |

## Bundle Analysis

Analyze bundle size with the built-in analyzer (Next.js 16.1+):

```bash
next experimental-analyze
```

This opens an interactive UI to:
- Filter by route, environment (client/server), and type
- Inspect module sizes and import chains
- View treemap visualization

Save output for comparison:

```bash
next experimental-analyze --output
# Output saved to .next/diagnostics/analyze
```

Reference: https://nextjs.org/docs/app/guides/package-bundling

## Migrating from Webpack to Turbopack

Turbopack is the default bundler in Next.js 15+. If you have custom webpack config, migrate to Turbopack-compatible alternatives:

```js
// next.config.js
module.exports = {
  // Good: Works with Turbopack
  serverExternalPackages: ['package'],
  transpilePackages: ['package'],

  // Bad: Webpack-only - migrate away from this
  webpack: (config) => {
    // custom webpack config
  },
}
```

Reference: https://nextjs.org/docs/app/building-your-application/upgrading/from-webpack-to-turbopack
