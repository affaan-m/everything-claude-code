# Metadata

Add SEO metadata to Next.js pages using the Metadata API.

## Important: Server Components Only

The `metadata` object and `generateMetadata` function are **only supported in Server Components**. They cannot be used in Client Components.

If the target page has `'use client'`:
1. Remove `'use client'` if possible, move client logic to child components
2. Or extract metadata to a parent Server Component layout
3. Or split the file: Server Component with metadata imports Client Components

## Static Metadata

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description for search engines',
}
```

## Dynamic Metadata

```tsx
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return { title: post.title, description: post.description }
}
```

## Avoid Duplicate Fetches

Use React `cache()` when the same data is needed for both metadata and page:

```tsx
import { cache } from 'react'

export const getPost = cache(async (slug: string) => {
  return await db.posts.findFirst({ where: { slug } })
})
```

## Viewport

Separate from metadata for streaming support:

```tsx
import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

// Or dynamic
export function generateViewport({ params }): Viewport {
  return { themeColor: getThemeColor(params) }
}
```

## Title Templates

In root layout for consistent naming:

```tsx
export const metadata: Metadata = {
  title: { default: 'Site Name', template: '%s | Site Name' },
}
```

## Metadata File Conventions

Reference: https://nextjs.org/docs/app/getting-started/project-structure#metadata-file-conventions

Place these files in `app/` directory (or route segments):

| File | Purpose |
|------|---------|
| `favicon.ico` | Favicon |
| `icon.png` / `icon.svg` | App icon |
| `apple-icon.png` | Apple app icon |
| `opengraph-image.png` | OG image |
| `twitter-image.png` | Twitter card image |
| `sitemap.ts` / `sitemap.xml` | Sitemap (use `generateSitemaps` for multiple) |
| `robots.ts` / `robots.txt` | Robots directives |
| `manifest.ts` / `manifest.json` | Web app manifest |

## SEO Best Practice: Static Files Are Often Enough

For most sites, **static metadata files provide excellent SEO coverage**:

```
app/
├── favicon.ico
├── opengraph-image.png     # Works for both OG and Twitter
├── sitemap.ts
├── robots.ts
└── layout.tsx              # With title/description metadata
```

**Tips:**
- A single `opengraph-image.png` covers both Open Graph and Twitter (Twitter falls back to OG)
- Static `title` and `description` in layout metadata is sufficient for most pages
- Only use dynamic `generateMetadata` when content varies per page

---

# OG Image Generation

Generate dynamic Open Graph images using `next/og`.

## Important Rules

1. **Use `next/og`** - not `@vercel/og` (it's built into Next.js)
2. **No searchParams** - OG images can't access search params, use route params instead
3. **Avoid Edge runtime** - Use default Node.js runtime

```tsx
// Good
import { ImageResponse } from 'next/og'

// Bad
// import { ImageResponse } from '@vercel/og'
// export const runtime = 'edge'
```

## Basic OG Image

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const alt = 'Site Name'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Hello World
      </div>
    ),
    { ...size }
  )
}
```

## Dynamic OG Image

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const alt = 'Blog Post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Props = { params: Promise<{ slug: string }> }

export default async function Image({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(to bottom, #1a1a1a, #333)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold' }}>{post.title}</div>
        <div style={{ marginTop: 24, opacity: 0.8 }}>{post.description}</div>
      </div>
    ),
    { ...size }
  )
}
```

## Custom Fonts

```tsx
import { ImageResponse } from 'next/og'
import { join } from 'path'
import { readFile } from 'fs/promises'

export default async function Image() {
  const fontPath = join(process.cwd(), 'assets/fonts/Inter-Bold.ttf')
  const fontData = await readFile(fontPath)

  return new ImageResponse(
    (
      <div style={{ fontFamily: 'Inter', fontSize: 64 }}>
        Custom Font Text
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Inter', data: fontData, style: 'normal' }],
    }
  )
}
```

## File Naming

- `opengraph-image.tsx` - Open Graph (Facebook, LinkedIn)
- `twitter-image.tsx` - Twitter/X cards (optional, falls back to OG)

## Styling Notes

ImageResponse uses Flexbox layout:
- Use `display: 'flex'`
- No CSS Grid support
- Styles must be inline objects

## Multiple OG Images

Use `generateImageMetadata` for multiple images per route:

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export async function generateImageMetadata({ params }) {
  const images = await getPostImages(params.slug)
  return images.map((img, idx) => ({
    id: idx,
    alt: img.alt,
    size: { width: 1200, height: 630 },
    contentType: 'image/png',
  }))
}

export default async function Image({ params, id }) {
  const images = await getPostImages(params.slug)
  const image = images[id]
  return new ImageResponse(/* ... */)
}
```

## Multiple Sitemaps

Use `generateSitemaps` for large sites:

```tsx
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export async function generateSitemaps() {
  // Return array of sitemap IDs
  return [{ id: 0 }, { id: 1 }, { id: 2 }]
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  const start = id * 50000
  const end = start + 50000
  const products = await getProducts(start, end)

  return products.map((product) => ({
    url: `https://example.com/product/${product.id}`,
    lastModified: product.updatedAt,
  }))
}
```

Generates `/sitemap/0.xml`, `/sitemap/1.xml`, etc.
