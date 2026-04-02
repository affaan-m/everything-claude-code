> This file extends [common/patterns.md](../common/patterns.md) with web-specific patterns.

# Web Patterns

## Component Composition

### Compound Components

Group related UI elements under a shared parent that manages state internally:

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```

- Parent owns state; children consume via context
- Keeps the public API declarative
- Preferred over prop-drilling for complex UI widgets

### Render Props / Slots

Expose rendering control to the consumer when visual output varies but behavior is shared:

- Use render props or slot patterns for headless components
- Keep logic (keyboard handling, ARIA, focus management) in the headless layer
- Let consumers provide their own markup and styling

### Container / Presentational Split

- **Container** components handle data fetching, state, side effects
- **Presentational** components receive props and render UI
- Presentational components should be pure — same props yield same output

## State Management Patterns

### Server State vs Client State

Treat them as separate concerns:

| Concern | Tool | Examples |
|---------|------|----------|
| Server state | TanStack Query, SWR, tRPC | API data, user profiles, lists |
| Client state | Zustand, Jotai, signals | UI toggles, form drafts, theme |
| URL state | Search params, route segments | Filters, pagination, tabs |
| Form state | React Hook Form, Formik | Validation, dirty tracking |

- Never duplicate server state into a client store — use the cache from your data-fetching library
- Derive values instead of storing computed state

### URL as State

Persist user-facing state in the URL so it survives refresh and is shareable:

- Filters, sort order, pagination, active tab, search query
- Use `URLSearchParams` or framework-level route params
- Sync URL state to the UI on mount (SSR-safe)

## Data Fetching Patterns

### Stale-While-Revalidate

Return cached data immediately, revalidate in the background:

- Set a `staleTime` for how long data is considered fresh
- Show cached content instantly, update when fresh data arrives
- Use TanStack Query or SWR — do not hand-roll this pattern

### Optimistic Updates

Update the UI before the server confirms, then reconcile:

- Snapshot current state before mutation
- Apply the optimistic change to the cache
- Roll back to the snapshot if the mutation fails
- Provide clear error feedback on rollback

### Parallel Data Loading

Fetch independent data in parallel, not sequentially:

- Use `Promise.all` or framework-level parallel loaders (Next.js parallel routes, Remix loaders)
- Avoid request waterfalls where child components fetch only after parents render
- Prefetch data for likely next navigations (hover intent, viewport proximity)
