---
name: nextjs-patterns
description: Next.js App Router patterns — Server/Client Components, data fetching, Server Actions, caching, middleware, metadata, performance, and testing.
---

# Next.js App Router Patterns

Production-grade Next.js 15+ patterns with App Router, Server Components, and Server Actions.

## When to Activate

- Building Next.js 15+ apps with App Router (not Pages Router)
- Deciding between Server and Client Components
- Fetching data with `fetch`, Suspense, and streaming
- Implementing Server Actions with form handling
- Configuring caching (Request Memoization, Data Cache, Full Route Cache)
- Writing middleware for auth, i18n, or rate limiting
- Optimizing metadata, images, fonts, and bundle size
- Testing Server Components, Server Actions, and E2E flows

## Core Principles

1. **Server by default** — components are Server Components unless you add `"use client"`
2. **Push client boundary down** — keep `"use client"` as close to leaves as possible
3. **Fetch in Server Components** — no `useEffect` for data; fetch at the component level
4. **Server Actions for mutations** — use `"use server"` functions instead of API routes for forms
5. **Cache deliberately** — understand the three caching layers and opt out explicitly when needed

## Project Structure (App Router)

```
app/
├── layout.tsx              # Root layout (html, body, providers)
├── page.tsx                # Home page (/)
├── loading.tsx             # Root loading UI
├── error.tsx               # Root error boundary
├── not-found.tsx           # 404 page
├── (marketing)/            # Route group (no URL segment)
│   ├── about/page.tsx
│   └── pricing/page.tsx
├── (app)/                  # Authenticated route group
│   ├── layout.tsx          # App shell with sidebar
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
├── api/
│   └── webhook/route.ts    # Route Handler (API endpoint)
└── [...slug]/page.tsx      # Catch-all route
lib/
├── actions/                # Server Actions
├── db/                     # Database queries
└── utils/                  # Shared utilities
```

## Server vs Client Components

### Decision Matrix

```
Use Server Component when:          Use Client Component when:
─────────────────────────────       ──────────────────────────────
✓ Fetching data                     ✓ useState, useReducer
✓ Accessing backend resources       ✓ useEffect, lifecycle hooks
✓ Keeping secrets on server         ✓ Browser APIs (localStorage, etc.)
✓ Large dependencies                ✓ Event listeners (onClick, onChange)
✓ No interactivity needed           ✓ Custom hooks with state
```

### Composition Pattern

```tsx
// app/dashboard/page.tsx — Server Component (default)
import { getUserStats } from "@/lib/db/users";
import { StatsChart } from "./stats-chart"; // Client Component

export default async function DashboardPage() {
  const stats = await getUserStats(); // Runs on server

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Pass server data to client component as props */}
      <StatsChart data={stats} />
    </div>
  );
}
```

```tsx
// app/dashboard/stats-chart.tsx — Client Component
"use client";

import { useState } from "react";
import { BarChart } from "recharts";

export function StatsChart({ data }: { data: Stat[] }) {
  const [range, setRange] = useState<"week" | "month">("week");
  const filtered = data.filter(d => d.range === range);

  return (
    <div>
      <select value={range} onChange={e => setRange(e.target.value as "week" | "month")}>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
      <BarChart data={filtered} width={600} height={300}>
        {/* chart config */}
      </BarChart>
    </div>
  );
}
```

## Data Fetching

### Parallel Fetching with Suspense

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Suspense fallback={<CardSkeleton />}>
        <RevenueCard />
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <UsersCard />
      </Suspense>
    </div>
  );
}

// Each component fetches independently — parallel, not waterfall
async function RevenueCard() {
  const revenue = await getRevenue(); // fetches in parallel with UsersCard
  return <Card title="Revenue" value={`$${revenue.total}`} />;
}

async function UsersCard() {
  const users = await getUserCount();
  return <Card title="Users" value={users.toLocaleString()} />;
}
```

### Fetch with Cache Control

```typescript
// lib/db/products.ts

// Cached indefinitely (default) — static data
export async function getCategories() {
  const res = await fetch("https://api.example.com/categories", {
    next: { tags: ["categories"] },
  });
  return res.json();
}

// Revalidate every 60 seconds — semi-static data
export async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 60 },
  });
  return res.json();
}

// No cache — dynamic data
export async function getCartItems(userId: string) {
  const res = await fetch(`https://api.example.com/cart/${userId}`, {
    cache: "no-store",
  });
  return res.json();
}
```

## Server Actions

### Form with useActionState

```tsx
// lib/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "Invalid credentials" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}
```

```tsx
// app/login/page.tsx
"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <form action={action}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {state?.error && <p className="text-red-500">{state.error}</p>}
      <button disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}
```

### Optimistic Updates

```tsx
"use client";

import { useOptimistic } from "react";
import { toggleTodoAction } from "@/lib/actions/todos";

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, setOptimistic] = useOptimistic(
    todos,
    (state, toggledId: string) =>
      state.map(t => (t.id === toggledId ? { ...t, done: !t.done } : t)),
  );

  async function handleToggle(id: string) {
    setOptimistic(id);
    await toggleTodoAction(id);
  }

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id}>
          <button onClick={() => handleToggle(todo.id)}>
            {todo.done ? "✓" : "○"} {todo.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### Revalidation

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function createProduct(formData: FormData) {
  await db.products.create({ data: Object.fromEntries(formData) });

  revalidateTag("products"); // Invalidate all fetches tagged "products"
  revalidatePath("/products"); // Revalidate the products page
}
```

## Caching Layers

```
Request Memoization → Data Cache → Full Route Cache

1. Request Memoization (per-request, server only)
   - Same fetch() URL+options in one render → deduplicated
   - Automatic, no config needed

2. Data Cache (persistent, cross-request)
   - fetch() results cached on server
   - Opt out: cache: "no-store" or revalidate: 0
   - Invalidate: revalidateTag() or revalidatePath()

3. Full Route Cache (persistent, CDN)
   - Static routes rendered at build time
   - Opt out: dynamic functions (cookies, headers, searchParams)
   - Force dynamic: export const dynamic = "force-dynamic"
```

## Middleware

### Auth + i18n Middleware

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "./lib/auth";

const protectedPaths = ["/dashboard", "/settings", "/admin"];
const supportedLocales = ["en", "ja", "es"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // i18n: redirect to preferred locale
  if (pathname === "/") {
    const locale = request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] ?? "en";
    if (supportedLocales.includes(locale) && locale !== "en") {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  // Auth: protect routes
  if (protectedPaths.some(p => pathname.startsWith(p))) {
    const session = await getSession(request);
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Metadata & SEO

### Dynamic Metadata

```typescript
// app/products/[slug]/page.tsx
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return <ProductDetail product={product} />;
}
```

### Sitemap & Robots

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();
  return [
    { url: "https://example.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...products.map(p => ({
      url: `https://example.com/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
```

## Performance

### Image + Font Optimization

```tsx
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}

// Optimized image with automatic sizing
function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero banner"
      width={1200}
      height={600}
      priority // Preload above-the-fold image
      sizes="(max-width: 768px) 100vw, 1200px"
    />
  );
}
```

### Dynamic Import

```tsx
import dynamic from "next/dynamic";

const HeavyEditor = dynamic(() => import("@/components/editor"), {
  loading: () => <EditorSkeleton />,
  ssr: false, // Skip SSR for browser-only component
});
```

## Testing

### Server Component Test

```typescript
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

// Mock the data-fetching functions
jest.mock("@/lib/db/users", () => ({
  getUserStats: jest.fn().mockResolvedValue([
    { label: "Revenue", value: 50000 },
    { label: "Users", value: 1200 },
  ]),
}));

it("renders dashboard with stats", async () => {
  const page = await DashboardPage();
  render(page);
  expect(screen.getByText("Dashboard")).toBeInTheDocument();
});
```

### Server Action Test

```typescript
import { loginAction } from "@/lib/actions/auth";

it("returns error for invalid email", async () => {
  const formData = new FormData();
  formData.set("email", "not-an-email");
  formData.set("password", "password123");

  const result = await loginAction(undefined, formData);
  expect(result?.error).toMatch(/email/i);
});
```

## Checklist

```
Before deploying a Next.js App Router application:
- [ ] Server Components used by default (no unnecessary "use client")
- [ ] "use client" boundary pushed to leaf components
- [ ] Data fetched in Server Components, not useEffect
- [ ] Parallel fetching with Suspense boundaries (no waterfalls)
- [ ] Server Actions validate input with zod
- [ ] Caching strategy documented (which fetches are cached, tagged)
- [ ] revalidateTag/revalidatePath used after mutations
- [ ] Middleware handles auth redirects for protected routes
- [ ] Metadata exported for all public pages
- [ ] Images use next/image with width, height, sizes
- [ ] Fonts use next/font (no external stylesheet requests)
- [ ] Dynamic imports for heavy client-only components
- [ ] Tests cover Server Components and Server Actions
```
