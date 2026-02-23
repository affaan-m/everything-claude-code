---
name: svelte-patterns
description: Svelte 5 and SvelteKit patterns — runes, component composition, routing, load functions, form actions, hooks, stores, performance, and testing.
---

# Svelte 5 & SvelteKit Patterns

Production-grade Svelte 5 patterns with runes, SvelteKit routing, and modern tooling.

## When to Activate

- Building Svelte 5 apps with runes ($state, $derived, $effect)
- Designing reusable components with $props and snippets
- Setting up SvelteKit routing (+page.svelte, +layout.svelte)
- Writing load functions for data fetching (+page.ts, +page.server.ts)
- Implementing form actions with progressive enhancement
- Configuring hooks for auth, error handling, or middleware
- Managing global state with stores
- Optimizing performance with preloading and streaming
- Writing tests with Vitest and @testing-library/svelte

## Core Principles

1. **Runes first** — use `$state`, `$derived`, `$effect` instead of legacy reactive declarations
2. **Progressive enhancement** — forms work without JavaScript via SvelteKit actions
3. **Server-first data** — load data in `+page.server.ts`, not in `onMount`
4. **Type safety** — use TypeScript with generated route types (`$types`)
5. **Minimal JS** — Svelte compiles away the framework; keep bundles small

## Component Patterns

### Basic Component with Runes

```svelte
<!-- UserCard.svelte -->
<script lang="ts">
  interface Props {
    name: string;
    email: string;
    role?: "admin" | "user";
    onSelect?: (email: string) => void;
  }

  let { name, email, role = "user", onSelect }: Props = $props();

  let isHovered = $state(false);
  let initials = $derived(name.split(" ").map(n => n[0]).join("").toUpperCase());
</script>

<div
  class="card"
  class:admin={role === "admin"}
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <div class="avatar">{initials}</div>
  <div>
    <h3>{name}</h3>
    <p>{email}</p>
  </div>
  {#if onSelect}
    <button onclick={() => onSelect(email)}>Select</button>
  {/if}
</div>
```

### Snippets (Replacing Slots)

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    header: Snippet;
    children: Snippet;
    footer?: Snippet;
  }

  let { header, children, footer }: Props = $props();
</script>

<div class="card">
  <header>{@render header()}</header>
  <div class="body">{@render children()}</div>
  {#if footer}
    <footer>{@render footer()}</footer>
  {/if}
</div>

<!-- Usage -->
<Card>
  {#snippet header()}<h2>Title</h2>{/snippet}
  <p>Body content goes here.</p>
  {#snippet footer()}<button>Save</button>{/snippet}
</Card>
```

### Bindable State

```svelte
<!-- SearchInput.svelte -->
<script lang="ts">
  let { value = $bindable(""), placeholder = "Search..." }: {
    value?: string;
    placeholder?: string;
  } = $props();
</script>

<input type="text" bind:value {placeholder} />

<!-- Parent -->
<script lang="ts">
  let query = $state("");
</script>
<SearchInput bind:value={query} />
<p>Searching for: {query}</p>
```

## SvelteKit Routing

### File-Based Routes

```
src/routes/
├── +layout.svelte          # Root layout (nav, footer)
├── +layout.server.ts       # Root layout data (session)
├── +page.svelte            # Home page (/)
├── +error.svelte           # Error boundary
├── about/+page.svelte      # /about
├── blog/
│   ├── +page.svelte        # /blog (list)
│   ├── +page.server.ts     # Load blog posts
│   └── [slug]/
│       ├── +page.svelte    # /blog/:slug
│       └── +page.server.ts # Load single post
├── (auth)/                 # Route group (no URL segment)
│   ├── +layout.svelte      # Auth layout
│   ├── login/+page.svelte
│   └── register/+page.svelte
└── api/
    └── health/+server.ts   # API endpoint: GET /api/health
```

### Layout with Navigation

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { page } from "$app/stores";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: any } = $props();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];
</script>

<nav>
  {#each navItems as item}
    <a href={item.href} class:active={$page.url.pathname === item.href}>
      {item.label}
    </a>
  {/each}
  {#if data.user}
    <span>Welcome, {data.user.name}</span>
  {:else}
    <a href="/login">Sign in</a>
  {/if}
</nav>

<main>{@render children()}</main>
```

## Load Functions

### Server-Side Data Loading

```typescript
// src/routes/blog/+page.server.ts
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url, locals }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const perPage = 10;

  const [posts, total] = await Promise.all([
    db.posts.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    db.posts.count(),
  ]);

  return { posts, total, page, perPage };
};
```

```typescript
// src/routes/blog/[slug]/+page.server.ts
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.posts.findUnique({ where: { slug: params.slug } });

  if (!post) {
    error(404, { message: "Post not found" });
  }

  return { post };
};
```

### Universal Load (Client + Server)

```typescript
// src/routes/search/+page.ts
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get("q") ?? "";
  if (!query) return { results: [], query };

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const results = await res.json();
  return { results, query };
};
```

## Form Actions

### Progressive Enhancement

```typescript
// src/routes/login/+page.server.ts
import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get("email")?.toString() ?? "";
    const password = data.get("password")?.toString() ?? "";

    if (!email || !password) {
      return fail(400, { email, error: "Email and password are required" });
    }

    const user = await authenticate(email, password);
    if (!user) {
      return fail(401, { email, error: "Invalid credentials" });
    }

    cookies.set("session", user.sessionId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    redirect(303, "/dashboard");
  },
};
```

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" value={form?.email ?? ""} required />
  <input name="password" type="password" required />
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <button>Sign in</button>
</form>
```

### Named Actions

```typescript
// +page.server.ts
export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get("title")?.toString();
    if (!title) return fail(400, { error: "Title required" });
    await db.todos.create({ data: { title } });
  },
  delete: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();
    if (!id) return fail(400, { error: "ID required" });
    await db.todos.delete({ where: { id } });
  },
};
```

```svelte
<!-- Use named actions with ?/ prefix -->
<form method="POST" action="?/create" use:enhance>
  <input name="title" required />
  <button>Add</button>
</form>

{#each data.todos as todo}
  <form method="POST" action="?/delete" use:enhance>
    <input type="hidden" name="id" value={todo.id} />
    <span>{todo.title}</span>
    <button>Delete</button>
  </form>
{/each}
```

## Hooks

### Server Hook (Auth Guard)

```typescript
// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const authHandle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get("session");
  event.locals.user = session ? await getUserFromSession(session) : null;
  return resolve(event);
};

const guardHandle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith("/dashboard") && !event.locals.user) {
    redirect(303, "/login");
  }
  return resolve(event);
};

const loggingHandle: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  const response = await resolve(event);
  const duration = Math.round(performance.now() - start);
  console.log(`${event.request.method} ${event.url.pathname} ${response.status} ${duration}ms`);
  return response;
};

export const handle = sequence(authHandle, guardHandle, loggingHandle);
```

### Error Hook

```typescript
// src/hooks.server.ts (add to file)
import type { HandleServerError } from "@sveltejs/kit";

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  const errorId = crypto.randomUUID();
  console.error(`[${errorId}] ${event.url.pathname}:`, error);

  return { message: "An unexpected error occurred", errorId };
};
```

## Stores (Global State)

```typescript
// src/lib/stores/theme.ts
import { writable, derived } from "svelte/store";
import { browser } from "$app/environment";

function createThemeStore() {
  const stored = browser ? localStorage.getItem("theme") : null;
  const { subscribe, set, update } = writable<"light" | "dark">(
    (stored as "light" | "dark") ?? "light"
  );

  return {
    subscribe,
    toggle: () =>
      update(current => {
        const next = current === "light" ? "dark" : "light";
        if (browser) localStorage.setItem("theme", next);
        return next;
      }),
    set: (value: "light" | "dark") => {
      if (browser) localStorage.setItem("theme", value);
      set(value);
    },
  };
}

export const theme = createThemeStore();
export const isDark = derived(theme, $theme => $theme === "dark");
```

## Performance

### Preloading

```svelte
<!-- Preload on hover (default) or eagerly -->
<a href="/blog/my-post" data-sveltekit-preload-data="hover">Read post</a>

<!-- Preload on viewport (for important links) -->
<a href="/dashboard" data-sveltekit-preload-data="tap">Dashboard</a>
```

### Streaming with Promises

```typescript
// +page.server.ts — stream slow data
export const load: PageServerLoad = async () => {
  return {
    fast: await db.getFastData(),       // Blocks initial render
    slow: db.getSlowData(),             // Streamed in when ready (no await)
  };
};
```

```svelte
<!-- +page.svelte -->
<h1>{data.fast.title}</h1>

{#await data.slow}
  <p>Loading analytics...</p>
{:then analytics}
  <AnalyticsChart {analytics} />
{:catch error}
  <p>Failed to load analytics.</p>
{/await}
```

## Testing

### Component Test with Vitest

```typescript
import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import UserCard from "./UserCard.svelte";

describe("UserCard", () => {
  it("renders user name and email", () => {
    render(UserCard, { props: { name: "Alice Smith", email: "alice@test.com" } });
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
  });

  it("calls onSelect when button clicked", async () => {
    const onSelect = vi.fn();
    render(UserCard, { props: { name: "Alice", email: "a@b.com", onSelect } });
    await fireEvent.click(screen.getByText("Select"));
    expect(onSelect).toHaveBeenCalledWith("a@b.com");
  });

  it("shows admin badge for admin role", () => {
    render(UserCard, { props: { name: "Admin", email: "admin@test.com", role: "admin" } });
    expect(screen.getByText("AS").closest(".card")).toHaveClass("admin");
  });
});
```

### E2E Test with Playwright

```typescript
import { test, expect } from "@playwright/test";

test("login flow", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button:text("Sign in")');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Welcome")).toBeVisible();
});

```

## Checklist

```
Before deploying a SvelteKit application:
- [ ] Using Svelte 5 runes ($state, $derived, $effect) not legacy reactivity
- [ ] Components use $props() with TypeScript interfaces
- [ ] Data loaded in +page.server.ts, not in onMount
- [ ] Forms use SvelteKit actions with progressive enhancement (use:enhance)
- [ ] Input validated on server side in actions (return fail() on error)
- [ ] Auth handled in hooks.server.ts with sequence()
- [ ] Error boundary (+error.svelte) at root and critical routes
- [ ] Slow data streamed with unawaited promises
- [ ] Links have appropriate preload strategy
- [ ] Adapter selected for deployment target (auto, node, static, vercel)
- [ ] Tests cover components, load functions, and critical user flows
```
