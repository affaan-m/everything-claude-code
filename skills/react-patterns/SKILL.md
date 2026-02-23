---
name: react-patterns
description: Production-grade React 18/19 patterns -- hooks, concurrent rendering, Server Components, Zustand, React Query v5, TypeScript components, performance, and testing. Framework-agnostic (no Next.js).
---

# React Patterns (18/19)

Deep React patterns for production apps. Focuses on React itself -- hooks, concurrency, RSC, state, performance, and testing. For Next.js, see `nextjs-patterns`.

## When to Activate

- Designing custom hooks or fixing referential stability bugs
- Using concurrent features (useTransition, Suspense, streaming)
- Deciding between Server and Client Components
- Setting up Zustand stores or React Query v5
- Building reusable generic TypeScript components
- Optimizing render performance or virtualizing large lists
- Writing component tests with React Testing Library

## Core Principles

1. **Colocation** -- state lives close to where it is read.
2. **Derive, don't sync** -- compute from state; never sync with useEffect.
3. **Composition over configuration** -- small composed components beat prop-heavy monoliths.
4. **Type safety end-to-end** -- generics flow through hooks, components, and stores.
5. **Server-first data** -- fetch on server; client only for interactivity.

---

## 1. Hook Patterns

### Referential Stability (useCallback / useMemo)

```tsx
function SearchPage({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const handleSelect = useCallback((id: string) => onNavigate(id), [onNavigate])
  const filtered = useMemo(() => allItems.filter((i) => i.name.includes(query)), [query])
  return <ResultList items={filtered} onSelect={handleSelect} />
}
```

### useReducer State Machine

```tsx
type State =
  | { status: 'idle' } | { status: 'loading' }
  | { status: 'success'; data: User[] } | { status: 'error'; error: string }
type Action =
  | { type: 'FETCH' } | { type: 'SUCCESS'; data: User[] } | { type: 'ERROR'; error: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH': return { status: 'loading' }
    case 'SUCCESS': return { status: 'success', data: action.data }
    case 'ERROR': return { status: 'error', error: action.error }
  }
}

function UserList() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' })
  useEffect(() => {
    dispatch({ type: 'FETCH' })
    fetchUsers()
      .then((data) => dispatch({ type: 'SUCCESS', data }))
      .catch((e) => dispatch({ type: 'ERROR', error: e instanceof Error ? e.message : String(e) }))
  }, [])
  if (state.status === 'loading') return <Spinner />
  if (state.status === 'error') return <Alert message={state.error} />
  if (state.status === 'success') return <List users={state.data} />
  return null
}
```

### Custom Hooks: useAsync and useDebounce

```tsx
// useAsync: wraps a promise with loading/error/success state (simplified — production should use a generic reducer)
function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' } as State)
  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'FETCH' })
    fn().then(
      (data) => { if (!cancelled) dispatch({ type: 'SUCCESS', data }) },
      (err) => { if (!cancelled) dispatch({ type: 'ERROR', error: err instanceof Error ? err.message : String(err) }) }
    )
    return () => { cancelled = true }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return state
}

// useDebounce: delays value propagation
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
```

### useId for Accessible Labels

```tsx
function FormField({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (<div><label htmlFor={id}>{label}</label>{children(id)}</div>)
}
```

---

## 2. Concurrent React

### useTransition / useDeferredValue

```tsx
// useTransition: mark a state update as non-urgent
function FilterableList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(items)
  const [isPending, startTransition] = useTransition()
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value) // urgent
    startTransition(() => setFiltered(items.filter((i) => i.name.includes(e.target.value))))
  }
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner size="sm" />}
      <ItemList items={filtered} />
    </>
  )
}

// useDeferredValue: defer re-render of expensive child
function SearchResults({ query }: { query: string }) {
  const deferred = useDeferredValue(query)
  const results = useMemo(() => heavyFilter(deferred), [deferred])
  return <div style={{ opacity: query !== deferred ? 0.6 : 1 }}>
    {results.map((r) => <ResultCard key={r.id} result={r} />)}
  </div>
}
```

### useOptimistic (React 19)

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  const [optimistic, addOptimistic] = useOptimistic(
    todos, (cur: Todo[], t: Todo) => [...cur, t]
  )
  async function handleAdd(formData: FormData) {
    const text = formData.get('text') as string
    addOptimistic({ id: crypto.randomUUID(), text, pending: true })
    await createTodoOnServer(text) // React 19 auto-reverts optimistic state on throw
  }
  return (
    <form action={handleAdd}>
      <input name="text" /><button type="submit">Add</button>
      <ul>{optimistic.map((t) => (
        <li key={t.id} style={{ opacity: t.pending ? 0.5 : 1 }}>{t.text}</li>
      ))}</ul>
    </form>
  )
}
```

### Suspense + ErrorBoundary

```tsx
import { ErrorBoundary } from 'react-error-boundary'
// Wrap Suspense in ErrorBoundary; nest for progressive streaming
function App() {
  return (
    <ErrorBoundary fallback={<FullPageError />}>
      <Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>
    </ErrorBoundary>
  )
}
function Dashboard() {
  return (<div className="grid">
    <Suspense fallback={<CardSkeleton />}><RevenueChart /></Suspense>
    <Suspense fallback={<CardSkeleton />}><RecentOrders /></Suspense>
  </div>)
}
```

---
## 3. Server Components (RSC)
### Server vs Client Decision

| Server Component                 | Client Component (`'use client'`)  |
|----------------------------------|------------------------------------|
| Fetch data (DB, API, fs)         | useState, useEffect, useReducer    |
| Access backend resources/secrets | Browser APIs (localStorage, etc.)  |
| Reduce client bundle             | Event handlers (onClick, onChange)  |

```tsx
// Server component (default in RSC-enabled frameworks)
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } })
  return (<section><h1>{user.name}</h1><FollowButton userId={userId} /></section>)
}
```

### Streaming + use() (React 19)

```tsx
import { use } from 'react'

// Parent passes a promise without awaiting; child unwraps with use()
function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = use(promise) // suspends until resolved
  return <ul>{comments.map((c) => <li key={c.id}>{c.body}</li>)}</ul>
}

async function Post({ postId }: { postId: string }) {
  const commentsPromise = fetchComments(postId) // do NOT await
  return (
    <article>
      <PostBody id={postId} />
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments promise={commentsPromise} />
      </Suspense>
    </article>
  )
}
```

---

## 4. State Management

### Zustand: Slices + Devtools

```tsx
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AuthSlice { user: User | null; login: (u: User) => void; logout: () => void }
interface UISlice { sidebarOpen: boolean; toggleSidebar: () => void }

export const useAppStore = create<AuthSlice & UISlice>()(
  devtools((set) => ({
    user: null,
    login: (user) => set({ user }, false, 'auth/login'),
    logout: () => set({ user: null }, false, 'auth/logout'),
    sidebarOpen: true,
    toggleSidebar: () =>
      set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'ui/toggle'),
  }))
)
// Granular selector: const open = useAppStore((s) => s.sidebarOpen)
```

### React Query v5: Queries + Optimistic Mutations

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const r = await fetch('/api/todos')
      if (!r.ok) throw new Error(`Failed to fetch todos: ${r.status}`)
      return r.json() as Promise<Todo[]>
    },
    staleTime: 5 * 60_000,
  })
}

function useAddTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (text: string) => {
      const r = await fetch('/api/todos', { method: 'POST', body: JSON.stringify({ text }) })
      if (!r.ok) throw new Error(`Failed to add todo: ${r.status}`)
      return r.json() as Promise<Todo>
    },
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: ['todos'] })
      const prev = qc.getQueryData<Todo[]>(['todos'])
      qc.setQueryData<Todo[]>(['todos'], (old = []) => [
        ...old, { id: crypto.randomUUID(), text, done: false },
      ])
      return { prev }
    },
    onError: (_e, _t, ctx) => qc.setQueryData(['todos'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })
}
```

### Context for Low-Frequency Globals

```tsx
// Context for theme, locale, feature flags -- values that rarely change.
// Wrap value in useMemo to prevent re-renders of all consumers.
const ThemeCtx = createContext<{ theme: 'light' | 'dark'; toggle: () => void } | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const value = useMemo(
    () => ({ theme, toggle: () => setTheme((t) => t === 'light' ? 'dark' : 'light') }), [theme]
  )
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}
export function useTheme() {
  const c = useContext(ThemeCtx)
  if (!c) throw new Error('Missing ThemeProvider')
  return c
}
```

---

## 5. Component Patterns

### Compound Components

```tsx
const SelectCtx = createContext<{ value: string; onChange: (v: string) => void } | null>(null)

function Select({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: ReactNode
}) {
  return <SelectCtx.Provider value={{ value, onChange }}><div role="listbox">{children}</div></SelectCtx.Provider>
}
function Option({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(SelectCtx)
  if (!ctx) throw new Error('Option must be inside Select')
  return <div role="option" aria-selected={ctx.value === value} onClick={() => ctx.onChange(value)}>{children}</div>
}
Select.Option = Option
```

### Generic Components with TypeScript

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T) => string
  emptyState?: ReactNode
}
function List<T>({ items, renderItem, keyExtractor, emptyState }: ListProps<T>) {
  if (items.length === 0) return <>{emptyState ?? <p>No items</p>}</>
  return <ul>{items.map((item, i) => (
    <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
  ))}</ul>
}
```

### forwardRef + useImperativeHandle

```tsx
// React 19: ref is a regular prop; forwardRef no longer required
const FancyInput = forwardRef<InputHandle, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => { if (inputRef.current) inputRef.current.value = '' },
    }))
    return <input ref={inputRef} {...props} />
  }
)
```

---

## 6. Performance

### React.memo with Comparator

```tsx
interface RowProps { row: { id: string; values: number[] }; onSelect: (id: string) => void }
const DataRow = React.memo<RowProps>(
  ({ row, onSelect }) => (
    <tr onClick={() => onSelect(row.id)}>
      {row.values.map((v, i) => <td key={i}>{v}</td>)}
    </tr>
  ),
  (prev, next) =>
    prev.row.id === next.row.id &&
    prev.row.values.every((v, i) => v === next.row.values[i])
)
```

### Virtualization (@tanstack/react-virtual)

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virt = useVirtualizer({
    count: items.length, getScrollElement: () => parentRef.current,
    estimateSize: () => 48, overscan: 10,
  })
  return (
    <div ref={parentRef} style={{ height: 500, overflow: 'auto' }}>
      <div style={{ height: virt.getTotalSize(), position: 'relative' }}>
        {virt.getVirtualItems().map((row) => (
          <div key={row.key} style={{ position: 'absolute', top: 0, width: '100%',
            height: row.size, transform: `translateY(${row.start}px)` }}>
            <ItemRow item={items[row.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Dynamic Imports

```tsx
const Chart = lazy(() => import('./Chart'))
// {showChart && <Suspense fallback={<ChartSkeleton />}><Chart /></Suspense>}
```

---

## 7. Testing

### RTL: Accessibility-First Queries

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('submits form with valid data', async () => {
  const onSubmit = vi.fn()
  render(<ContactForm onSubmit={onSubmit} />)
  await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.com')
  await userEvent.type(screen.getByRole('textbox', { name: /message/i }), 'Hello')
  await userEvent.click(screen.getByRole('button', { name: /send/i }))
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', message: 'Hello' })
  )
})

test('shows validation error', async () => {
  render(<ContactForm onSubmit={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: /send/i }))
  expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i)
})
```

### Testing Hooks

```tsx
import { renderHook, act } from '@testing-library/react'

test('useDebounce delays value update', () => {
  vi.useFakeTimers()
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } }
  )
  expect(result.current).toBe('a')
  rerender({ value: 'ab' })
  expect(result.current).toBe('a')
  act(() => vi.advanceTimersByTime(300))
  expect(result.current).toBe('ab')
  vi.useRealTimers()
})
```

### Mock RSC

```tsx
vi.mock('@/lib/db', () => ({ getUser: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }) }))
test('UserProfile renders user name', async () => {
  const jsx = await UserProfile({ userId: '1' })
  expect(render(jsx).getByText('Alice')).toBeInTheDocument()
})
```

---

## 8. Checklist

- [ ] **Hooks** -- no hooks in conditions/loops; deps arrays correct
- [ ] **Memoization** -- useCallback/useMemo only where profiling shows benefit
- [ ] **State** -- colocated; no unnecessary lifting or globals
- [ ] **Derived state** -- computed in render/useMemo, never synced via useEffect
- [ ] **Error boundaries** -- every Suspense is wrapped by an ErrorBoundary
- [ ] **Loading** -- Suspense fallbacks provide meaningful skeletons
- [ ] **A11y** -- semantic HTML; useId for label-input links
- [ ] **TypeScript** -- no `any`; generics propagate through components/hooks
- [ ] **Bundle** -- heavy deps dynamically imported
- [ ] **Lists** -- 100+ items use virtualization
- [ ] **Tests** -- getByRole/getByLabelText preferred; no getByTestId unless necessary
- [ ] **RSC** -- data-fetching = Server Component; `'use client'` only for interactivity
