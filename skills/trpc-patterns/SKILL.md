---
name: trpc-patterns
description: tRPC patterns for end-to-end typesafe APIs — router setup, procedures with Zod validation, context and middleware, Next.js App Router integration, React Query hooks, subscriptions, error handling, and testing. Code-first, no schema files, no codegen.
---

# tRPC Development Patterns

End-to-end typesafe APIs without schema files or code generation. tRPC infers types directly from your TypeScript code — the server IS the schema.

**Not GraphQL** (schema-first, SDL, resolvers, DataLoader). **Not REST** (HTTP methods, status codes, URL design). tRPC is code-first with automatic type inference from server to client through a single TypeScript codebase.

## When to Activate

- Building typesafe APIs in a TypeScript monorepo (server + client share types)
- Setting up tRPC routers, procedures, and input validation
- Creating middleware for auth, logging, or rate limiting
- Integrating tRPC with Next.js App Router (RSC, server caller, client hooks)
- Using React Query patterns through tRPC (queries, mutations, optimistic updates)
- Implementing real-time features with tRPC subscriptions
- Writing tests for tRPC procedures

## Core Principles

1. **Code-first types** — no SDL, no `.proto`, no OpenAPI spec; your TypeScript code IS the contract
2. **Infer, never duplicate** — use `RouterOutput`/`RouterInput` type helpers instead of manual interfaces
3. **Zod at the boundary** — validate all inputs with Zod schemas; tRPC infers types from them
4. **Thin procedures** — procedures call services, they don't contain business logic
5. **Middleware for cross-cutting** — auth, logging, rate limiting belong in middleware, not procedures

## Router Setup

```typescript
// server/trpc.ts — initialization with context type and superjson
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;

// server/routers/user.ts — sub-router with query, mutation, cursor pagination
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { protectedProcedure } from "../middleware/auth";

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.id } });
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return user;
    }),
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20), cursor: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const items = await ctx.db.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
      });
      let nextCursor: string | undefined;
      if (items.length > input.limit) nextCursor = items.pop()!.id;
      return { items, nextCursor };
    }),
  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.user.update({ where: { id: ctx.session.userId }, data: input });
    }),
});

// server/routers/_app.ts — compose sub-routers into appRouter
import { router } from "../trpc";
import { userRouter } from "./user";
import { postRouter } from "./post";

export const appRouter = router({ user: userRouter, post: postRouter });
export type AppRouter = typeof appRouter;
```

## Procedures

```typescript
// Query with Zod input — types inferred automatically from schema
export const search = publicProcedure
  .input(z.object({
    query: z.string().min(1).max(200),
    category: z.enum(["all", "users", "posts"]).default("all"),
    page: z.number().int().positive().default(1),
  }))
  .query(async ({ input, ctx }) => {
    return ctx.searchService.search(input.query, input.category, input.page);
  });

// Mutation with explicit return shape
export const createPost = protectedProcedure
  .input(z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    tags: z.array(z.string()).max(10).default([]),
  }))
  .mutation(async ({ input, ctx }) => {
    const post = await ctx.db.post.create({ data: { ...input, authorId: ctx.session.userId } });
    return { id: post.id, createdAt: post.createdAt };
  });

// Protected procedure — requireAuth middleware narrows context type
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.session?.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { session: ctx.session } }); // session is now non-nullable
});
export const protectedProcedure = publicProcedure.use(isAuthed);

// Role-based procedure
const hasRole = (...roles: string[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.session?.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    if (!roles.includes(ctx.session.role)) throw new TRPCError({ code: "FORBIDDEN" });
    return next({ ctx: { session: ctx.session } });
  });
export const adminProcedure = publicProcedure.use(hasRole("admin"));
```

## Context and Middleware

```typescript
// server/context.ts — auth session + db in context
import { type inferAsyncReturnType } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getServerSession } from "./auth";
import { db } from "./db";

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await getServerSession(opts.req);
  return { db, session, req: opts.req };
}
export type Context = inferAsyncReturnType<typeof createTRPCContext>;

// Logging middleware
const logger = middleware(async ({ path, type, next }) => {
  const start = performance.now();
  const result = await next();
  const ms = Math.round(performance.now() - start);
  console.log(`[tRPC] ${type} ${path} - ${result.ok ? "OK" : "ERROR"} (${ms}ms)`);
  return result;
});

// Rate limiting middleware (Upstash example)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "60 s"),
});
const rateLimiter = middleware(async ({ ctx, next }) => {
  const id = ctx.session?.userId ?? ctx.req.headers.get("x-forwarded-for") ?? "anon";
  const { success } = await ratelimit.limit(id);
  if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" });
  return next();
});

// Middleware chain: log -> rate limit -> auth
export const protectedApiProcedure = publicProcedure
  .use(logger)
  .use(rateLimiter)
  .use(isAuthed);
```

## Next.js App Router Integration

```typescript
// server/trpc-context.ts — RSC context (React.cache deduplicates per request)
import { cache } from "react";
import { headers } from "next/headers";
import { createTRPCContext } from "./context";

export const createContext = cache(async () => {
  const heads = new Headers(await headers());
  return createTRPCContext({ req: { headers: heads } as Request, resHeaders: new Headers() });
});

// server/api.ts — server-side caller for RSC (no HTTP round-trip)
import { createCallerFactory } from "./trpc";
import { appRouter } from "./routers/_app";
import { createContext } from "./trpc-context";
const createCaller = createCallerFactory(appRouter);
export const api = async () => createCaller(await createContext());

// app/users/[id]/page.tsx — usage in Server Component
import { api } from "@/server/api";
export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await api();
  const user = await caller.user.getById({ id });
  return <div><h1>{user.name}</h1></div>;
}

// lib/trpc.ts — client-side hooks
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";
export const trpc = createTRPCReact<AppRouter>();

// providers/trpc-provider.tsx
"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// app/api/trpc/[trpc]/route.ts — API route handler
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({ endpoint: "/api/trpc", req, router: appRouter, createContext: createTRPCContext });
export { handler as GET, handler as POST };
```

### HydrateClient Prefetch Pattern

```typescript
// server/api.ts — prefetch on server, hydrate on client
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { makeQueryClient } from "@/lib/query-client";
import { appRouter, type AppRouter } from "./routers/_app";
import { createCallerFactory } from "./trpc";
import { createContext } from "./trpc-context";

const createCaller = createCallerFactory(appRouter);
export const { trpc: serverTrpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  async () => createCaller(await createContext()),
  makeQueryClient,
);

// app/users/page.tsx — Server Component prefetches, Client Component reads cache
import { HydrateClient, serverTrpc } from "@/server/api";
import { UserList } from "./user-list";

export default async function UsersPage() {
  void serverTrpc.user.list.prefetch({ limit: 20 });
  return <HydrateClient><UserList /></HydrateClient>;
}
```

## React Query Integration

```typescript
// useQuery with enabled flag
"use client";
import { trpc } from "@/lib/trpc";

function UserProfile({ userId }: { userId: string | null }) {
  const { data, isLoading, error } = trpc.user.getById.useQuery(
    { id: userId! },
    { enabled: !!userId, staleTime: 60_000, retry: 2 },
  );
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} />;
  return <div>{data.name}</div>;
}

// useMutation with optimistic updates (onMutate/onError/onSettled)
function CreatePostForm() {
  const utils = trpc.useUtils();
  const createPost = trpc.post.create.useMutation({
    onMutate: async (newPost) => {
      await utils.post.list.cancel();
      const previous = utils.post.list.getData();
      utils.post.list.setData(undefined, (old) => {
        if (!old) return old;
        return { ...old, items: [{ id: "temp", ...newPost, createdAt: new Date() }, ...old.items] };
      });
      return { previous };
    },
    onError: (_err, _newPost, context) => {
      if (context?.previous) utils.post.list.setData(undefined, context.previous);
    },
    onSettled: () => { utils.post.list.invalidate(); },
  });
  return (
    <form onSubmit={/* ... */}>
      <button disabled={createPost.isPending}>{createPost.isPending ? "Creating..." : "Create"}</button>
    </form>
  );
}

// useInfiniteQuery for cursor-based pagination
function PostFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.post.list.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );
  const allPosts = data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <div>
      {allPosts.map((post) => <PostCard key={post.id} post={post} />)}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>Load More</button>
      )}
    </div>
  );
}

// Invalidation patterns
const utils = trpc.useUtils();
utils.post.getById.invalidate({ id: "123" });  // single query
utils.post.invalidate();                         // all under router
utils.post.list.refetch();                       // immediate refetch
utils.user.getById.setData({ id: "123" }, (old) => old ? { ...old, name: "Updated" } : old);
```

## Subscriptions

```typescript
// WebSocket subscription procedure
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { ee } from "../event-emitter";

export const notificationRouter = router({
  onNew: protectedProcedure
    .input(z.object({ channel: z.string() }))
    .subscription(({ input }) => {
      return observable<{ id: string; message: string }>((emit) => {
        const handler = (data: { id: string; message: string }) => emit.next(data);
        ee.on(`notification:${input.channel}`, handler);
        return () => ee.off(`notification:${input.channel}`, handler);
      });
    }),
});

// splitLink: subscriptions -> WS, queries/mutations -> HTTP
import { createWSClient, wsLink, httpBatchLink, splitLink } from "@trpc/client";

const wsClient = createWSClient({
  url: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001",
  retryDelayMs: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
});
export const trpcClient = trpc.createClient({
  links: [splitLink({
    condition: (op) => op.type === "subscription",
    true: wsLink<AppRouter>({ client: wsClient, transformer: superjson }),
    false: httpBatchLink({ url: "/api/trpc", transformer: superjson }),
  })],
});
```

## Error Handling

```typescript
import { TRPCError } from "@trpc/server";

// Standard error codes — NOT_FOUND, UNAUTHORIZED, FORBIDDEN, BAD_REQUEST, CONFLICT, TOO_MANY_REQUESTS
throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required" });
throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete own account" });
throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });

// Production error formatter (extend the initTRPC errorFormatter from Router Setup)
// Add to shape.data: stack: process.env.NODE_ENV === "production" ? undefined : shape.data.stack
// Override message for INTERNAL_SERVER_ERROR in production: "An unexpected error occurred"

// Client-side error discrimination
import { TRPCClientError } from "@trpc/client";
function handleError(error: unknown): string {
  if (!(error instanceof TRPCClientError)) return "An unexpected error occurred";
  switch (error.data?.code) {
    case "UNAUTHORIZED": redirect("/login"); return "";
    case "NOT_FOUND": return "Resource not found";
    case "FORBIDDEN": return "Permission denied";
    case "TOO_MANY_REQUESTS": return "Too many requests. Try again later.";
    case "BAD_REQUEST":
      return error.data.zodError ? formatZodErrors(error.data.zodError) : error.message;
    default: return error.message;
  }
}
```

## Testing

```typescript
// Unit tests with createCallerFactory
import { describe, it, expect, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { appRouter } from "../routers/_app";
import { createTestContext } from "./helpers";

const createCaller = createCallerFactory(appRouter);

describe("user router", () => {
  let caller: ReturnType<typeof createCaller>;
  beforeEach(async () => {
    caller = createCaller(await createTestContext({ userId: "user-1", role: "user" }));
  });

  it("returns user by id", async () => {
    const user = await caller.user.getById({ id: "user-1" });
    expect(user).toMatchObject({ id: "user-1", name: expect.any(String) });
  });

  it("throws NOT_FOUND for missing user", async () => {
    await expect(caller.user.getById({ id: "nonexistent" })).rejects.toThrow("NOT_FOUND");
  });

  it("requires auth for update", async () => {
    const anonCaller = createCaller(await createTestContext({ userId: null }));
    await expect(anonCaller.user.update({ name: "Hacker" })).rejects.toThrow("UNAUTHORIZED");
  });

  it("paginates user list", async () => {
    const page1 = await caller.user.list({ limit: 2 });
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBeDefined();
    const page2 = await caller.user.list({ limit: 2, cursor: page1.nextCursor });
    expect(page2.items[0].id).not.toBe(page1.items[0].id);
  });
});

// Integration tests with createTRPCProxyClient + httpBatchLink
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

describe("tRPC API integration", () => {
  let client: ReturnType<typeof createTRPCProxyClient<AppRouter>>;
  let cleanup: () => Promise<void>;
  beforeAll(async () => {
    const { url, close } = await startTestServer();
    cleanup = close;
    client = createTRPCProxyClient<AppRouter>({
      links: [httpBatchLink({ url: `${url}/api/trpc`, transformer: superjson })],
    });
  });
  afterAll(() => cleanup());

  it("queries and mutates through HTTP", async () => {
    const user = await client.user.getById.query({ id: "user-1" });
    expect(user.id).toBe("user-1");
    const post = await client.post.create.mutate({ title: "Test", content: "Body" });
    expect(post.id).toBeDefined();
  });

  it("returns Zod validation errors", async () => {
    await expect(client.user.getById.query({ id: "" }))
      .rejects.toMatchObject({ data: { zodError: expect.any(Object) } });
  });
});
```

## tRPC Checklist

- [ ] `AppRouter` type exported and shared with client (never import server code on client)
- [ ] All inputs validated with Zod schemas (no `z.any()` or untyped inputs)
- [ ] `createCallerFactory` used for server-side calls (not direct router invocation)
- [ ] Auth middleware throws `UNAUTHORIZED` / `FORBIDDEN` with clear messages
- [ ] Protected procedures use `protectedProcedure`, not inline auth checks
- [ ] Error formatter strips stack traces and internal details in production
- [ ] `superjson` transformer configured for Date, Map, Set serialization
- [ ] React Query `staleTime` and `retry` configured (not relying on defaults)
- [ ] Optimistic updates implemented for user-facing mutations
- [ ] Cursor-based pagination returns `nextCursor` for infinite queries
- [ ] Subscriptions use `splitLink` to route WS separately from HTTP
- [ ] Unit tests use `createCallerFactory` with test context
- [ ] No business logic in procedures (delegate to service layer)
