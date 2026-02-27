---
name: vercel-react-patterns
description: >
  React performance and composition patterns from Vercel Engineering. Use when
  optimizing component re-renders, eliminating boolean prop proliferation,
  parallelizing server-side data fetching, or reducing bundle size.
---

# Vercel React Patterns

Distilled from Vercel's react-best-practices (57 rules) and composition-patterns
(8 rules). Only CRITICAL and HIGH impact rules with inline code.

## When to Apply

- Parallelizing data fetching (client or server)
- Optimizing bundle size or eliminating waterfalls
- Refactoring components with boolean prop proliferation
- Building compound components or flexible component APIs

---

## Critical Rules

### 1. Promise.all() for Independent Operations (2-10x faster)

```typescript
// BAD                                    // GOOD
const user = await fetchUser()            const [user, posts, comments] =
const posts = await fetchPosts()            await Promise.all([
const comments = await fetchComments()        fetchUser(), fetchPosts(), fetchComments(),
                                            ])
```

For partial dependencies, start promises early and await late:

```typescript
const sessionPromise = auth()         // starts immediately
const configPromise = fetchConfig()   // starts immediately
const session = await sessionPromise  // now we need the value
const [config, data] = await Promise.all([
  configPromise,
  fetchData(session.user.id),         // depends on session
])
```

### 2. RSC Parallel Composition

Server Components execute sequentially within a tree. Move fetches into sibling
components so they run in parallel.

```tsx
// BAD: Sidebar blocked until fetchHeader resolves
export default async function Page() {
  const header = await fetchHeader()
  return <div><div>{header}</div><Sidebar /></div>
}

// GOOD: Header and Sidebar fetch simultaneously
async function Header() { const d = await fetchHeader(); return <div>{d}</div> }
async function Sidebar() { const items = await fetchSidebarItems(); return <nav>...</nav> }
export default function Page() {
  return <div><Header /><Sidebar /></div>
}
```

### 3. Avoid Barrel File Imports (200-800ms cold start cost)

```tsx
// BAD: loads 1,583 modules           // GOOD: loads 3 modules
import { Check, X } from 'lucide-react' import Check from 'lucide-react/dist/esm/icons/check'
                                        import X from 'lucide-react/dist/esm/icons/x'
```

Or use Next.js 13.5+ `optimizePackageImports` in next.config.js:
```js
experimental: { optimizePackageImports: ['lucide-react', '@mui/material'] }
```

Affected libs: `lucide-react`, `@mui/material`, `@tabler/icons-react`, `react-icons`,
`@radix-ui/react-*`, `lodash`, `date-fns`.

### 4. Dynamic Imports for Heavy/Non-Critical Components

```tsx
import dynamic from 'next/dynamic'
const MonacoEditor = dynamic(() => import('./monaco-editor').then(m => m.MonacoEditor), { ssr: false })
const Analytics = dynamic(() => import('@vercel/analytics/react').then(m => m.Analytics), { ssr: false })
```

### 5. No Boolean Prop Proliferation

Each boolean doubles possible states. Create explicit variant components instead.

```tsx
// BAD
<Composer isThread isDMThread={false} isEditing isForwarding={false} />

// GOOD: explicit variants composing shared parts
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <Composer.Frame>
      <Composer.Input />
      <AlsoSendToChannelField id={channelId} />
      <Composer.Footer><Composer.Formatting /><Composer.Submit /></Composer.Footer>
    </Composer.Frame>
  )
}

function EditComposer() {
  return (
    <Composer.Frame>
      <Composer.Input />
      <Composer.Footer><Composer.CancelEdit /><Composer.SaveEdit /></Composer.Footer>
    </Composer.Frame>
  )
}
```

---

## High Priority Rules

### 6. Compound Components with Shared Context

Structure complex UIs as compound components. Subcomponents access shared state
via context. Consumers compose only what they need.

```tsx
const ComposerContext = createContext<ComposerContextValue | null>(null)

function ComposerInput() {
  const { state, actions: { update }, meta } = use(ComposerContext)
  return <TextInput ref={meta.inputRef} value={state.input}
    onChangeText={(text) => update(s => ({ ...s, input: text }))} />
}

const Composer = { Frame: ComposerFrame, Input: ComposerInput, Submit: ComposerSubmit }
```

### 7. Generic Context Interface (`{ state, actions, meta }`)

Define a generic interface so multiple providers implement the same contract.
Same UI works with all providers -- swap the provider, keep the UI.

```tsx
interface ComposerContextValue {
  state: { input: string; attachments: Attachment[]; isSubmitting: boolean }
  actions: { update: (fn: (s: State) => State) => void; submit: () => void }
  meta: { inputRef: React.RefObject<TextInput> }
}

// Provider A: local state          // Provider B: global synced state
function ForwardMsgProvider(p) {    function ChannelProvider({ channelId, ...p }) {
  const [state, set] = useState()     const { state, update, submit } = useGlobalChannel(channelId)
  return <ComposerContext value={{     return <ComposerContext value={{
    state, actions: { update: set,       state, actions: { update, submit },
    submit }, meta }}>{p.children}        meta }}>{p.children}
  </ComposerContext>                   </ComposerContext>
}                                    }
```

### 8. Suspense Boundaries for Streaming

Wrap async components in Suspense so the page shell renders immediately.

```tsx
function Page() {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay /> {/* async component -- only this waits for data */}
      </Suspense>
      <Footer />
    </div>
  )
}
```

### 9. Defer Await Until Needed

Move `await` into the branch where the value is actually used.

```typescript
// BAD: always fetches even when skipping   // GOOD: only fetches when needed
async function handle(id: string, skip) {   async function handle(id: string, skip) {
  const data = await fetchUser(id)            if (skip) return { skipped: true }
  if (skip) return { skipped: true }          const data = await fetchUser(id)
  return process(data)                        return process(data)
}                                           }
```

### 10. Minimize RSC Serialization

Only pass fields the client component uses. All props are serialized into HTML.

```tsx
// BAD: serializes 50 fields             // GOOD: serializes 1 field
<Profile user={user} />                   <Profile name={user.name} />
```

### 11. React.cache() for Per-Request Dedup

Wraps server-side non-fetch async work (DB queries, auth checks). Use primitive
args -- inline objects always miss (shallow equality via `Object.is`).

```typescript
import { cache } from 'react'
export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
})

// BAD: cache(async (p: {uid: number}) => ...) -- object = miss
// GOOD: cache(async (uid: number) => ...)     -- primitive = hit
```

### 12. Children Over Render Props

Use `children` for static composition. Render props only when parent passes data.

```tsx
// BAD                                    // GOOD
<Composer                                 <Composer.Frame>
  renderHeader={() => <Header />}           <Header />
  renderFooter={() => <Footer />}           <Composer.Input />
/>                                          <Composer.Footer>...</Composer.Footer>
                                          </Composer.Frame>
```

---

## Quick Reference

| Rule | Impact | Pattern |
|------|--------|---------|
| `Promise.all()` independent ops | CRITICAL | Parallel fetch, not sequential await |
| RSC parallel composition | CRITICAL | Sibling async components, not nested awaits |
| Start promises early | CRITICAL | Create promise immediately, await late |
| Avoid barrel imports | CRITICAL | Direct imports or `optimizePackageImports` |
| Dynamic imports | CRITICAL | `next/dynamic` for heavy/non-critical components |
| No boolean props | CRITICAL | Explicit variant components via composition |
| Compound components | HIGH | Shared context, composable subcomponents |
| Context DI interface | HIGH | `{ state, actions, meta }` contract |
| Suspense boundaries | HIGH | Stream data, render shell immediately |
| Defer await | HIGH | Move await into branch where value is used |
| Minimize RSC serialization | HIGH | Pass only used fields across boundary |
| `React.cache()` dedup | HIGH | Primitive args, wraps non-fetch async |
| Children over render props | MEDIUM | `children` for structure, render props for data |
