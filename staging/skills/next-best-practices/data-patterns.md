# Data Patterns

Choose the right data fetching pattern for each use case.

## Decision Tree

```
Need to fetch data?
├── From a Server Component?
│   └── Use: Fetch directly (no API needed)
│
├── From a Client Component?
│   ├── Is it a mutation (POST/PUT/DELETE)?
│   │   └── Use: Server Action
│   └── Is it a read (GET)?
│       └── Use: Route Handler OR pass from Server Component
│
├── Need external API access (webhooks, third parties)?
│   └── Use: Route Handler
│
└── Need REST API for mobile app / external clients?
    └── Use: Route Handler
```

## Pattern 1: Server Components (Preferred for Reads)

Fetch data directly in Server Components - no API layer needed.

```tsx
// app/users/page.tsx
async function UsersPage() {
  // Direct database access - no API round-trip
  const users = await db.user.findMany();

  // Or fetch from external API
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

**Benefits**:
- No API to maintain
- No client-server waterfall
- Secrets stay on server
- Direct database access

## Pattern 2: Server Actions (Preferred for Mutations)

Server Actions are the recommended way to handle mutations.

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;

  await db.post.create({ data: { title } });

  revalidatePath('/posts');
}

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });

  revalidateTag('posts');
}
```

```tsx
// app/posts/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

**Benefits**:
- End-to-end type safety
- Progressive enhancement (works without JS)
- Automatic request handling
- Integrated with React transitions

**Constraints**:
- POST only (no GET caching semantics)
- Internal use only (no external access)
- Cannot return non-serializable data

## Pattern 3: Route Handlers (APIs)

Use Route Handlers when you need a REST API.

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET is cacheable
export async function GET(request: NextRequest) {
  const posts = await db.post.findMany();
  return NextResponse.json(posts);
}

// POST for mutations
export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await db.post.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
```

**When to use**:
- External API access (mobile apps, third parties)
- Webhooks from external services
- GET endpoints that need HTTP caching
- OpenAPI/Swagger documentation needed

**When NOT to use**:
- Internal data fetching (use Server Components)
- Mutations from your UI (use Server Actions)

## Avoiding Data Waterfalls

### Problem: Sequential Fetches

```tsx
// Bad: Sequential waterfalls
async function Dashboard() {
  const user = await getUser();        // Wait...
  const posts = await getPosts();      // Then wait...
  const comments = await getComments(); // Then wait...

  return <div>...</div>;
}
```

### Solution 1: Parallel Fetching with Promise.all

```tsx
// Good: Parallel fetching
async function Dashboard() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);

  return <div>...</div>;
}
```

### Solution 2: Streaming with Suspense

```tsx
// Good: Show content progressively
import { Suspense } from 'react';

async function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsSection />
      </Suspense>
    </div>
  );
}

async function UserSection() {
  const user = await getUser(); // Fetches independently
  return <div>{user.name}</div>;
}

async function PostsSection() {
  const posts = await getPosts(); // Fetches independently
  return <PostList posts={posts} />;
}
```

### Solution 3: Preload Pattern

```tsx
// lib/data.ts
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});

export const preloadUser = (id: string) => {
  void getUser(id); // Fire and forget
};
```

```tsx
// app/user/[id]/page.tsx
import { getUser, preloadUser } from '@/lib/data';

export default async function UserPage({ params }) {
  const { id } = await params;

  // Start fetching early
  preloadUser(id);

  // Do other work...

  // Data likely ready by now
  const user = await getUser(id);
  return <div>{user.name}</div>;
}
```

## Client Component Data Fetching

When Client Components need data:

### Option 1: Pass from Server Component (Preferred)

```tsx
// Server Component
async function Page() {
  const data = await fetchData();
  return <ClientComponent initialData={data} />;
}

// Client Component
'use client';
function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  // ...
}
```

### Option 2: Fetch on Mount (When Necessary)

```tsx
'use client';
import { useEffect, useState } from 'react';

function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <Loading />;
  return <div>{data.value}</div>;
}
```

### Option 3: Server Action for Reads (Works But Not Ideal)

Server Actions can be called from Client Components for reads, but this is not their intended purpose:

```tsx
'use client';
import { getData } from './actions';
import { useEffect, useState } from 'react';

function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getData().then(setData);
  }, []);

  return <div>{data?.value}</div>;
}
```

**Note**: Server Actions always use POST, so no HTTP caching. Prefer Route Handlers for cacheable reads.

## Quick Reference

| Pattern | Use Case | HTTP Method | Caching |
|---------|----------|-------------|---------|
| Server Component fetch | Internal reads | Any | Full Next.js caching |
| Server Action | Mutations, form submissions | POST only | No |
| Route Handler | External APIs, webhooks | Any | GET can be cached |
| Client fetch to API | Client-side reads | Any | HTTP cache headers |
