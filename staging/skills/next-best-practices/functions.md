# Functions

Next.js function APIs.

Reference: https://nextjs.org/docs/app/api-reference/functions

## Navigation Hooks (Client)

| Hook | Purpose | Reference |
|------|---------|-----------|
| `useRouter` | Programmatic navigation (`push`, `replace`, `back`, `refresh`) | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-router) |
| `usePathname` | Get current pathname | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-pathname) |
| `useSearchParams` | Read URL search parameters | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-search-params) |
| `useParams` | Access dynamic route parameters | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-params) |
| `useSelectedLayoutSegment` | Active child segment (one level) | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segment) |
| `useSelectedLayoutSegments` | All active segments below layout | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-selected-layout-segments) |
| `useLinkStatus` | Check link prefetch status | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-link-status) |
| `useReportWebVitals` | Report Core Web Vitals metrics | [Docs](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals) |

## Server Functions

| Function | Purpose | Reference |
|----------|---------|-----------|
| `cookies` | Read/write cookies | [Docs](https://nextjs.org/docs/app/api-reference/functions/cookies) |
| `headers` | Read request headers | [Docs](https://nextjs.org/docs/app/api-reference/functions/headers) |
| `draftMode` | Enable preview of unpublished CMS content | [Docs](https://nextjs.org/docs/app/api-reference/functions/draft-mode) |
| `after` | Run code after response finishes streaming | [Docs](https://nextjs.org/docs/app/api-reference/functions/after) |
| `connection` | Wait for connection before dynamic rendering | [Docs](https://nextjs.org/docs/app/api-reference/functions/connection) |
| `userAgent` | Parse User-Agent header | [Docs](https://nextjs.org/docs/app/api-reference/functions/userAgent) |

## Generate Functions

| Function | Purpose | Reference |
|----------|---------|-----------|
| `generateStaticParams` | Pre-render dynamic routes at build time | [Docs](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) |
| `generateMetadata` | Dynamic metadata | [Docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) |
| `generateViewport` | Dynamic viewport config | [Docs](https://nextjs.org/docs/app/api-reference/functions/generate-viewport) |
| `generateSitemaps` | Multiple sitemaps for large sites | [Docs](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps) |
| `generateImageMetadata` | Multiple OG images per route | [Docs](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata) |

## Request/Response

| Function | Purpose | Reference |
|----------|---------|-----------|
| `NextRequest` | Extended Request with helpers | [Docs](https://nextjs.org/docs/app/api-reference/functions/next-request) |
| `NextResponse` | Extended Response with helpers | [Docs](https://nextjs.org/docs/app/api-reference/functions/next-response) |
| `ImageResponse` | Generate OG images | [Docs](https://nextjs.org/docs/app/api-reference/functions/image-response) |

## Common Examples

### Navigation

Use `next/link` for internal navigation instead of `<a>` tags.

```tsx
// Bad: Plain anchor tag
<a href="/about">About</a>

// Good: Next.js Link
import Link from 'next/link'

<Link href="/about">About</Link>
```

Active link styling:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLink({ href, children }) {
  const pathname = usePathname()

  return (
    <Link href={href} className={pathname === href ? 'active' : ''}>
      {children}
    </Link>
  )
}
```

### Static Generation

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}
```

### After Response

```tsx
import { after } from 'next/server'

export async function POST(request: Request) {
  const data = await processRequest(request)

  after(async () => {
    await logAnalytics(data)
  })

  return Response.json({ success: true })
}
```
