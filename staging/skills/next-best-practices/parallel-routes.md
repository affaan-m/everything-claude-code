# Parallel & Intercepting Routes

Parallel routes render multiple pages in the same layout. Intercepting routes show a different UI when navigating from within your app vs direct URL access. Together they enable modal patterns.

## File Structure

```
app/
├── @modal/                    # Parallel route slot
│   ├── default.tsx            # Required! Returns null
│   ├── (.)photos/             # Intercepts /photos/*
│   │   └── [id]/
│   │       └── page.tsx       # Modal content
│   └── [...]catchall/         # Optional: catch unmatched
│       └── page.tsx
├── photos/
│   └── [id]/
│       └── page.tsx           # Full page (direct access)
├── layout.tsx                 # Renders both children and @modal
└── page.tsx
```

## Step 1: Root Layout with Slot

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}
```

## Step 2: Default File (Critical!)

**Every parallel route slot MUST have a `default.tsx`** to prevent 404s on hard navigation.

```tsx
// app/@modal/default.tsx
export default function Default() {
  return null;
}
```

Without this file, refreshing any page will 404 because Next.js can't determine what to render in the `@modal` slot.

## Step 3: Intercepting Route (Modal)

The `(.)` prefix intercepts routes at the same level.

```tsx
// app/@modal/(.)photos/[id]/page.tsx
import { Modal } from '@/components/modal';

export default async function PhotoModal({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
    </Modal>
  );
}
```

## Step 4: Full Page (Direct Access)

```tsx
// app/photos/[id]/page.tsx
export default async function PhotoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const photo = await getPhoto(id);

  return (
    <div className="full-page">
      <img src={photo.url} alt={photo.title} />
      <h1>{photo.title}</h1>
    </div>
  );
}
```

## Step 5: Modal Component with Correct Closing

**Critical: Use `router.back()` to close modals, NOT `router.push()` or `<Link>`.**

```tsx
// components/modal.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        router.back(); // Correct
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router]);

  // Close on overlay click
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      router.back(); // Correct
    }
  }, [router]);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <button
          onClick={() => router.back()} // Correct!
          className="absolute top-4 right-4"
        >
          Close
        </button>
        {children}
      </div>
    </div>
  );
}
```

### Why NOT `router.push('/')` or `<Link href="/">`?

Using `push` or `Link` to "close" a modal:
1. Adds a new history entry (back button shows modal again)
2. Doesn't properly clear the intercepted route
3. Can cause the modal to flash or persist unexpectedly

`router.back()` correctly:
1. Removes the intercepted route from history
2. Returns to the previous page
3. Properly unmounts the modal

## Route Matcher Reference

Matchers match **route segments**, not filesystem paths:

| Matcher | Matches | Example |
|---------|---------|---------|
| `(.)` | Same level | `@modal/(.)photos` intercepts `/photos` |
| `(..)` | One level up | `@modal/(..)settings` from `/dashboard/@modal` intercepts `/settings` |
| `(..)(..)` | Two levels up | Rarely used |
| `(...)` | From root | `@modal/(...)photos` intercepts `/photos` from anywhere |

**Common mistake**: Thinking `(..)` means "parent folder" - it means "parent route segment".

## Handling Hard Navigation

When users directly visit `/photos/123` (bookmark, refresh, shared link):
- The intercepting route is bypassed
- The full `photos/[id]/page.tsx` renders
- Modal doesn't appear (expected behavior)

If you want the modal to appear on direct access too, you need additional logic:

```tsx
// app/photos/[id]/page.tsx
import { Modal } from '@/components/modal';

export default async function PhotoPage({ params }) {
  const { id } = await params;
  const photo = await getPhoto(id);

  // Option: Render as modal on direct access too
  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
    </Modal>
  );
}
```

## Common Gotchas

### 1. Missing `default.tsx` → 404 on Refresh

Every `@slot` folder needs a `default.tsx` that returns `null` (or appropriate content).

### 2. Modal Persists After Navigation

You're using `router.push()` instead of `router.back()`.

### 3. Nested Parallel Routes Need Defaults Too

If you have `@modal` inside a route group, each level needs its own `default.tsx`:

```
app/
├── (marketing)/
│   ├── @modal/
│   │   └── default.tsx     # Needed!
│   └── layout.tsx
└── layout.tsx
```

### 4. Intercepted Route Shows Wrong Content

Check your matcher:
- `(.)photos` intercepts `/photos` from the same route level
- If your `@modal` is in `app/dashboard/@modal`, use `(.)photos` to intercept `/dashboard/photos`, not `/photos`

### 5. TypeScript Errors with `params`

In Next.js 15+, `params` is a Promise:

```tsx
// Correct
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

## Complete Example: Photo Gallery Modal

```
app/
├── @modal/
│   ├── default.tsx
│   └── (.)photos/
│       └── [id]/
│           └── page.tsx
├── photos/
│   ├── page.tsx           # Gallery grid
│   └── [id]/
│       └── page.tsx       # Full photo page
├── layout.tsx
└── page.tsx
```

Links in the gallery:

```tsx
// app/photos/page.tsx
import Link from 'next/link';

export default async function Gallery() {
  const photos = await getPhotos();

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(photo => (
        <Link key={photo.id} href={`/photos/${photo.id}`}>
          <img src={photo.thumbnail} alt={photo.title} />
        </Link>
      ))}
    </div>
  );
}
```

Clicking a photo → Modal opens (intercepted)
Direct URL → Full page renders
Refresh while modal open → Full page renders
