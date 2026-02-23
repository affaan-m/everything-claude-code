---
name: jest-vitest-testing
description: Jest and Vitest framework-specific patterns: configuration, typed mocks, module mocking, snapshot testing, parameterized tests, async testing, React component testing, custom matchers, and coverage setup. Use when configuring test infrastructure or applying framework APIs.
---

# Jest / Vitest Framework Patterns

Framework-specific patterns for Jest and Vitest. Focuses on configuration, mocking APIs, snapshots, parameterized tests, async utilities, and React component testing. For TDD workflow (Red-Green-Refactor), see `tdd-workflow`. For Playwright E2E, see `e2e-testing`.

## When to Activate

- Setting up or tuning Jest/Vitest configuration
- Writing typed mocks, spies, or module stubs
- Applying snapshot or parameterized tests
- Testing async code, timers, or React components
- Migrating a project from Jest to Vitest

## Core Principles

1. **Isolation** - Every test runs with a clean state; no shared mutable singletons.
2. **Type safety** - Typed mocks catch API drift at compile time.
3. **Speed** - Prefer Vitest for new projects; it runs natively in Vite's module graph.
4. **Coverage gates** - Enforce thresholds in config, not as afterthoughts.

---

## Configuration

### Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,              // describe/it/expect without imports
    environment: 'jsdom',       // browser-like DOM for component tests
    setupFiles: './tests/setup.ts',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',           // faster than istanbul; built into Node
      reporter: ['text', 'html', 'lcov'],
      thresholds: { branches: 80, functions: 80, lines: 80, statements: 80 },
      exclude: ['tests/**', '**/*.d.ts', '**/generated/**', 'vitest.config.ts'],
    },
  },
});
```

### Jest (`jest.config.ts`)

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  testMatch: ['**/*.{test,spec}.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80 },
    './src/auth/': { branches: 90, lines: 90 },  // per-directory override
  },
};

export default config;
```

### `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();   // unmount React trees; prevents inter-test leaks
});
```

---

## Mocking Patterns

### Typed function mocks

```typescript
// Vitest
import { vi } from 'vitest';
const fetchUser = vi.fn<(id: string) => Promise<User>>();
fetchUser.mockResolvedValue({ id: '1', name: 'Alice' });

// Jest equivalent
const fetchUser = jest.fn<Promise<User>, [id: string]>();
fetchUser.mockResolvedValue({ id: '1', name: 'Alice' });
```

### Module mocking

```typescript
// Vitest — hoisted automatically
vi.mock('@/lib/api', () => ({
  getUser: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
  createUser: vi.fn().mockResolvedValue({ id: '2', name: 'Bob' }),
}));

// Partial mock: keep real implementation for some exports
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>();
  return { ...actual, formatDate: vi.fn().mockReturnValue('2024-01-01') };
});
```

### Timer mocking

```typescript
describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('delays callback execution', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);
    debounced();
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('works with async timers', async () => {
    const callback = vi.fn();
    setTimeout(callback, 1000);
    await vi.runAllTimersAsync();
    expect(callback).toHaveBeenCalled();
  });
});
```

### Spying on methods

```typescript
import { vi, afterEach } from 'vitest';
import * as analytics from '@/lib/analytics';

afterEach(() => vi.restoreAllMocks());

it('tracks page view on mount', () => {
  const spy = vi.spyOn(analytics, 'trackEvent');
  renderHomePage();
  expect(spy).toHaveBeenCalledWith('page_view', { path: '/' });
});
```

### Auto-clearing mocks

```typescript
// In vitest.config.ts: test.clearMocks: true  (recommended global setting)
// Or manually:
afterEach(() => {
  vi.clearAllMocks();    // reset call history, keep implementation
  // vi.resetAllMocks(); // also resets implementations
  // vi.restoreAllMocks(); // also restores spied originals
});
```

---

## Snapshot Testing

Use snapshots for **stable, complex output**. Avoid for frequently changing UI.

**Use for:** serialized API shapes, compiled template output, error message formatting.
**Do not use for:** rapidly iterating UI, anything with dynamic values (dates, UUIDs).

### Inline snapshots (preferred)

```typescript
it('formats user display name', () => {
  expect(formatUser({ first: 'Jane', last: 'Doe', role: 'admin' }))
    .toMatchInlineSnapshot(`"Jane Doe (admin)"`);
});
```

### Custom serializer

```typescript
import { expect } from 'vitest';

expect.addSnapshotSerializer({
  test: (val) => val instanceof Date,
  print: (val) => `Date<${(val as Date).toISOString().slice(0, 10)}>`,
});

it('serializes date fields', () => {
  expect({ createdAt: new Date('2024-06-01') }).toMatchSnapshot();
  // Snapshot: { "createdAt": Date<2024-06-01> }
});
```

---

## Parameterized Tests

### Array form

```typescript
it.each([
  [2, 3, 5],
  [0, 0, 0],
  [-1, 1, 0],
])('add(%i, %i) === %i', (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});
```

### Template literal table (readable for many fields)

```typescript
it.each`
  input              | valid    | reason
  ${'user@a.com'}   | ${true}  | ${'standard email'}
  ${'invalid'}      | ${false} | ${'missing @'}
  ${'@no-local'}    | ${false} | ${'missing local part'}
`('validates "$input" as $valid ($reason)', ({ input, valid }) => {
  expect(isValidEmail(input)).toBe(valid);
});
```

### describe.each for shared context

```typescript
describe.each([
  { role: 'admin', canDelete: true },
  { role: 'editor', canDelete: false },
  { role: 'viewer', canDelete: false },
])('$role permissions', ({ role, canDelete }) => {
  it(`${canDelete ? 'can' : 'cannot'} delete posts`, () => {
    expect(canDeletePost(createUser({ role }))).toBe(canDelete);
  });

  it('can always read posts', () => {
    expect(canReadPost(createUser({ role }))).toBe(true);
  });
});
```

---

## Async Testing

```typescript
// resolves / rejects matchers
it('fetches user successfully', async () => {
  await expect(fetchUser('1')).resolves.toEqual({ id: '1', name: 'Alice' });
});

it('rejects with NotFoundError', async () => {
  await expect(fetchUser('unknown')).rejects.toThrow('NotFoundError');
});

// waitFor — retries assertion until passes or times out
import { waitFor } from '@testing-library/react';

it('shows success toast after save', async () => {
  saveProfile();
  await waitFor(() => {
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  }, { timeout: 2000 });
});

// Microtask flushing
it('processes queued microtasks', async () => {
  computeAsync();
  await Promise.resolve();   // flush one microtask tick
  expect(getState()).toBe('done');
});

// Fake timers combined with async
it('retries after delay', async () => {
  vi.useFakeTimers();
  const spy = vi.fn()
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValue('ok');

  const promise = retryWithDelay(spy, 500);
  await vi.runAllTimersAsync();
  await expect(promise).resolves.toBe('ok');
  vi.useRealTimers();
});
```

---

## React Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';

// Query priority: getByRole > getByLabelText > getByText > getByTestId
it('submits form with valid data', async () => {
  const user = userEvent.setup();   // use setup() not legacy fireEvent
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText('Email'), 'alice@example.com');
  await user.type(screen.getByLabelText('Password'), 'secret');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'alice@example.com',
    password: 'secret',
  });
});

// findBy* for async appearance; queryBy* for asserting absence
it('loads list then hides spinner', async () => {
  render(<UserList />);
  const items = await screen.findAllByRole('listitem');  // waits for data
  expect(items).toHaveLength(3);
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

// renderHook for custom hooks
it('useCounter increments value', () => {
  const { result } = renderHook(() => useCounter(0));
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

// Context / Provider wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme="dark">
    <AuthProvider user={mockUser}>{children}</AuthProvider>
  </ThemeProvider>
);

it('reads theme from context', () => {
  render(<ThemedButton />, { wrapper });
  expect(screen.getByRole('button')).toHaveClass('dark-btn');
});
```

---

## Test Utilities

### Custom matchers

```typescript
// tests/matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () =>
        `expected ${received} to${pass ? ' not' : ''} be within [${min}, ${max}]`,
    };
  },
});

// Usage
expect(score).toBeWithinRange(0, 100);
```

### Test data factories

```typescript
// tests/factories.ts
export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: crypto.randomUUID(),
    name: 'Test User',
    email: 'test@example.com',
    role: 'viewer',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
```

### Setup / teardown isolation

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepo: ReturnType<typeof createMockRepo>;

  beforeEach(() => {
    mockRepo = createMockRepo();      // fresh instance; no shared state
    service = new UserService(mockRepo);
  });

  afterEach(() => vi.clearAllMocks());

  afterAll(async () => {
    await globalTestDb.close();       // expensive teardown runs once
  });
});
```

---

## Coverage Configuration

### v8 vs istanbul

| Feature | v8 | istanbul |
|---|---|---|
| Speed | Faster (native V8) | Slower (instrumentation) |
| Accuracy | Source-map dependent | AST-based, more accurate |
| Setup | Built into Node | Requires `@vitest/coverage-istanbul` |

### Per-directory thresholds and exclusions

```typescript
// Jest: coverageThreshold
coverageThreshold: {
  global: { branches: 80, lines: 80 },
  './src/payments/': { branches: 95, lines: 95 },  // critical path
},

// Vitest: coverage.exclude
coverage: {
  exclude: ['**/generated/**', '**/*.config.{ts,js}', '**/index.ts', 'src/types/**'],
},
```

---

## Migration: Jest to Vitest

| Concern | Jest | Vitest |
|---|---|---|
| Config file | `jest.config.ts` | `vitest.config.ts` |
| Mock util | `jest` global | `import { vi } from 'vitest'` |
| Fake timers | `jest.useFakeTimers()` | `vi.useFakeTimers()` |
| Module mock | `jest.mock(...)` | `vi.mock(...)` |
| Spy | `jest.spyOn(...)` | `vi.spyOn(...)` |
| Async timers | `jest.runAllTimers()` | `vi.runAllTimersAsync()` |
| Run coverage | `jest --coverage` | `vitest run --coverage` |
| Globals opt-in | `globals: true` (Jest config) | `test.globals: true` (Vitest config) |

```bash
# Install
npm install -D vitest @vitest/coverage-v8

# Remove Jest
npm remove jest ts-jest babel-jest @types/jest jest-environment-jsdom

# Community codemod handles most patterns automatically
npx jest-to-vitest
```

---

## Checklist

Before committing test code, verify:

- [ ] Config enforces coverage thresholds (branches, functions, lines >= 80%)
- [ ] Generated/dist directories excluded from coverage
- [ ] All mocks are typed (no `any` in mock return values)
- [ ] `afterEach` clears or restores all mocks and fake timers
- [ ] `vi.mock` / `jest.mock` calls are top-level, not inside `it` blocks
- [ ] Async tests `await` assertions; no floating promises
- [ ] React tests use `userEvent.setup()`, not legacy `fireEvent`
- [ ] `findBy*` for async DOM assertions; `queryBy*` for absence checks
- [ ] Inline snapshots preferred; no stale snapshot files committed
- [ ] Parameterized tests cover edge cases (zero, negative, boundary values)
- [ ] Test data factories used instead of duplicated inline objects
- [ ] No shared mutable state between tests (fresh instances in `beforeEach`)
- [ ] Timer tests restore real timers in cleanup (`vi.useRealTimers()`)
- [ ] Custom matchers declared in `setup.ts` and typed via `interface Matchers`
