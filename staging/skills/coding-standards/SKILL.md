---
name: Coding Standards
description: TypeScript and async patterns for writing high-quality code. Use when writing TypeScript, reviewing TypeScript code, fixing async bugs, or refactoring functions. Covers error handling, null safety, type patterns, function design, and async/await best practices.
use-when: Writing code, reviewing code, fixing bugs, refactoring
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Coding Standards

Concrete patterns and anti-patterns. For principles, see CLAUDE.md.

---

## Error Handling Patterns

### Good: Explicit with typed returns
```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

async function fetchData(): Promise<Result<Data>> {
  try {
    const response = await api.get('/data');
    return { success: true, data: response.data };
  } catch (error) {
    // Use your project's logger — avoid console.error in production code
    logger.error('Fetch failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### Bad: Silent failures
```typescript
// DON'T: Swallowing errors
const result = await fetchData().catch(() => null);

// DON'T: Empty catch blocks
try { await riskyOp(); } catch {}

// DON'T: Rethrowing without context
catch (e) { throw e; }
```

---

## Null Handling Patterns

### Good: Explicit checks
```typescript
// Option 1: Early return
if (!user) {
  return { error: 'User not found' };
}
// user is now narrowed to non-null

// Option 2: Nullish coalescing with sensible default
const name = user?.name ?? 'Anonymous';

// Option 3: Assertion with explanation
// We know user exists because we just fetched it in the line above
const userId = user!.id; // Safe: checked on line 42
```

### Bad: Silent assumptions
```typescript
// DON'T: Unexplained assertions
const name = user!.name;

// DON'T: Type casting to avoid null checks
const user = data as User;

// DON'T: Optional chaining that hides bugs
const result = obj?.deeply?.nested?.value; // What if middle values shouldn't be null?
```

---

## Type Patterns

### Good: Precise types
```typescript
// Discriminated unions for state
type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };

// Const assertions for literals
const STATUSES = ['pending', 'active', 'done'] as const;
type Status = typeof STATUSES[number];

// Branded types for IDs
type UserId = string & { readonly brand: unique symbol };
```

### Bad: Type escape hatches
```typescript
// DON'T: any
const data: any = fetchData();

// DON'T: Type assertions without justification
const user = response as User;

// DON'T: Non-null assertions without comment
const id = user!.id;
```

---

## Function Patterns

### Good: Single responsibility, early returns
```typescript
function processOrder(order: Order): Result<Invoice> {
  // Validate early
  if (!order.items.length) {
    return { success: false, error: 'Empty order' };
  }

  if (!order.customer.verified) {
    return { success: false, error: 'Customer not verified' };
  }

  // Happy path at the end
  const invoice = createInvoice(order);
  return { success: true, data: invoice };
}
```

### Bad: Deep nesting, god functions
```typescript
// DON'T: Arrow hell
function process(order: Order) {
  if (order.items.length) {
    if (order.customer.verified) {
      if (order.payment.valid) {
        // ... deeply nested logic
      }
    }
  }
}

// DON'T: Functions doing multiple unrelated things
function processOrderAndSendEmailAndUpdateInventory() { ... }
```

---

## Async/Await Patterns

### Good: Sequential when dependent, parallel when independent
```typescript
// Sequential: each step depends on previous
async function processOrder(orderId: string): Promise<Result<Invoice>> {
  const order = await getOrder(orderId);
  if (!order) return { success: false, error: 'Order not found' };

  const inventory = await checkInventory(order.items);
  if (!inventory.available) return { success: false, error: 'Out of stock' };

  const invoice = await createInvoice(order);
  return { success: true, data: invoice };
}

// Parallel: independent operations
async function getDashboardData(userId: string) {
  const [profile, orders, notifications] = await Promise.all([
    getProfile(userId),
    getOrders(userId),
    getNotifications(userId),
  ]);
  return { profile, orders, notifications };
}
```

### Good: Proper error handling in async code
```typescript
// Option 1: try/catch with specific handling
async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.users.findUnique({ where: { id } });
    if (!user) return { success: false, error: 'User not found' };
    return { success: true, data: user };
  } catch (error) {
    // Use your project's logger — avoid console.error in production code
    logger.error('Database error:', error);
    return { success: false, error: 'Database unavailable' };
  }
}

// Option 2: Wrapper for cleaner code
async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### Bad: Common async mistakes
```typescript
// DON'T: Unhandled promise rejection
async function risky() {
  await mightFail(); // If this throws, it's unhandled
}

// DON'T: Sequential when parallel is possible
const user = await getUser(id);
const posts = await getPosts(id); // Could run parallel!

// DON'T: Mixing .then() and async/await
async function confused() {
  const result = await fetch(url).then(r => r.json()); // Pick one style
}

// DON'T: forEach with async (doesn't await)
items.forEach(async (item) => {
  await process(item); // These run in parallel, not sequential!
});

// DO: Use for...of for sequential
for (const item of items) {
  await process(item);
}

// DO: Use Promise.all for parallel
await Promise.all(items.map(item => process(item)));
```

### Good: Timeout and cancellation
```typescript
// Timeout wrapper
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

// Usage
const result = await withTimeout(fetchData(), 5000);
```

---

## Anti-Patterns Quick Reference

| Bad | Good | Why |
|-----|------|-----|
| "any" type | Proper type | Type safety |
| Non-null assertion (!) without comment | Null check or explained assertion | Documents assumptions |
| "// TODO" | Fix now or don't commit | No broken windows |
| Magic strings | Named constants | Single source of truth |
| Deep nesting | Early returns | Readability |
| Copy-paste | Extract function | DRY |
| `.catch(() => null)` | Explicit error handling | Errors shouldn't be silent |
| `as Type` without reason | Type guard or validation | Proves correctness |
| Sequential awaits | `Promise.all` for independent ops | Performance |
| `forEach` with async | `for...of` or `Promise.all` | Correct behavior |
| Unhandled rejections | try/catch or Result type | Reliability |

