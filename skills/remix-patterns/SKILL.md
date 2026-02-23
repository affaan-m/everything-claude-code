---
name: remix-patterns
description: Remix development patterns — loaders, actions, nested routing, progressive enhancement, error boundaries, form handling, data revalidation, and deployment strategies.
---

# Remix Development Patterns

Production-grade Remix patterns for full-stack web applications with progressive enhancement.

## When to Activate

- Building Remix routes with loaders and actions
- Designing nested routing layouts
- Implementing progressive enhancement forms
- Handling errors with route-level error boundaries
- Optimizing data loading with defer and streaming
- Deploying Remix to various platforms

## Core Principles

1. **Web standards first** — use native `Request`, `Response`, `FormData`
2. **Progressive enhancement** — forms work without JavaScript
3. **Nested routing** — colocate data loading with UI segments
4. **Server/client model** — loaders for reads, actions for writes
5. **URL as state** — use search params over client state

## Route Configuration

### File-Based Routing

```
app/routes/
├── _index.tsx              # /
├── about.tsx               # /about
├── dashboard.tsx           # /dashboard (layout)
├── dashboard._index.tsx    # /dashboard/
├── dashboard.settings.tsx  # /dashboard/settings
├── users.$userId.tsx       # /users/:userId
├── $.tsx                   # Catch-all (404)
└── _auth.tsx               # Pathless layout (auth wrapper)
```

### Route Module

```tsx
import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.title ?? "My App" },
    { name: "description", content: data?.description },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const project = await db.project.findUnique({
    where: { id: params.projectId, userId: user.id },
  });
  if (!project) throw new Response("Not Found", { status: 404 });
  return json({ project });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return json({ error: "Title is required" }, { status: 400 });
  }

  await db.project.update({
    where: { id: params.projectId, userId: user.id },
    data: { title },
  });

  return json({ success: true });
}

export default function ProjectRoute() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1>{project.title}</h1>
      <Form method="post">
        <input name="title" defaultValue={project.title} />
        {actionData?.error && <p className="error">{actionData.error}</p>}
        <button type="submit">Update</button>
      </Form>
    </div>
  );
}
```

## Loaders

### Deferred Data

```tsx
import { defer } from "@remix-run/node";
import { useLoaderData, Await } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: params.projectId },
  });

  // Defer slow queries — stream to client
  const analyticsPromise = getAnalytics(params.projectId);
  const commentsPromise = getComments(params.projectId);

  return defer({
    project,
    analytics: analyticsPromise,
    comments: commentsPromise,
  });
}

export default function ProjectRoute() {
  const { project, analytics, comments } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{project.title}</h1>
      <Suspense fallback={<p>Loading analytics...</p>}>
        <Await resolve={analytics} errorElement={<p>Error loading analytics</p>}>
          {(data) => <AnalyticsChart data={data} />}
        </Await>
      </Suspense>
      <Suspense fallback={<p>Loading comments...</p>}>
        <Await resolve={comments}>
          {(data) => <CommentList comments={data} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

## Actions and Forms

### Intent-Based Actions

```tsx
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update":
      return updateProject(params.projectId!, formData);
    case "delete":
      await db.project.delete({ where: { id: params.projectId } });
      return redirect("/dashboard");
    case "archive":
      await db.project.update({
        where: { id: params.projectId },
        data: { archived: true },
      });
      return json({ success: true });
    default:
      throw new Response(`Invalid intent: ${intent}`, { status: 400 });
  }
}

export default function ProjectRoute() {
  return (
    <div>
      <Form method="post">
        <input name="title" />
        <button name="intent" value="update">Save</button>
        <button name="intent" value="archive">Archive</button>
        <button name="intent" value="delete">Delete</button>
      </Form>
    </div>
  );
}
```

### Optimistic UI with useFetcher

```tsx
import { useFetcher } from "@remix-run/react";

function TaskItem({ task }: { task: Task }) {
  const fetcher = useFetcher();
  const isToggling = fetcher.state !== "idle";

  // Optimistic value
  const completed = isToggling
    ? fetcher.formData?.get("completed") === "true"
    : task.completed;

  return (
    <fetcher.Form method="post" action={`/tasks/${task.id}`}>
      <input type="hidden" name="completed" value={String(!completed)} />
      <button type="submit" disabled={isToggling}>
        {completed ? "✓" : "○"} {task.title}
      </button>
    </fetcher.Form>
  );
}
```

## Error Handling

### Route Error Boundary

```tsx
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-page">
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  const message = error instanceof Error ? error.message : "Unknown error";

  return (
    <div className="error-page">
      <h1>Oops!</h1>
      <p>{message}</p>
    </div>
  );
}
```

## Authentication

### Session-Based Auth

```tsx
// app/services/session.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function requireUser(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId) throw redirect("/login");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw redirect("/login");
  return user;
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}
```

### Login Action

```tsx
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  const user = await verifyLogin(email, password);
  if (!user) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  return createUserSession(user.id, "/dashboard");
}
```

## Data Revalidation

### Custom Revalidation

```tsx
import type { ShouldRevalidateFunction } from "@remix-run/react";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  // Skip revalidation if action failed
  if (actionResult && "error" in actionResult) return false;

  // Always revalidate on search param changes
  if (currentUrl.searchParams.toString() !== nextUrl.searchParams.toString()) {
    return true;
  }

  return defaultShouldRevalidate;
};
```

### Resource Routes

```tsx
// app/routes/api.search.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";

  const results = await db.product.findMany({
    where: { title: { contains: query, mode: "insensitive" } },
    take: 10,
  });

  return json(results);
}
```

## Deployment

### Express Adapter

```typescript
// server.ts
import { createRequestHandler } from "@remix-run/express";
import express from "express";

const app = express();

app.use(express.static("public", { maxAge: "1h" }));
app.use(express.static("public/build", { maxAge: "1y", immutable: true }));

app.all("*", createRequestHandler({
  build: await import("./build/server/index.js"),
  mode: process.env.NODE_ENV,
}));

app.listen(3000, () => console.log("Server running on port 3000"));
```

## Checklist

- [ ] Loaders handle authorization and 404 responses
- [ ] Actions validate all form data server-side
- [ ] Error boundaries defined at critical route segments
- [ ] Forms work without JavaScript (progressive enhancement)
- [ ] Defer used for slow, non-critical data
- [ ] Session cookies are httpOnly, secure, sameSite
- [ ] Resource routes used for API-like endpoints
- [ ] URL search params used over client state where possible
