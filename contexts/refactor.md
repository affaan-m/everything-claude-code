# Refactor Context

Mode: Code improvement without behavior change
Focus: Structure, readability, maintainability

## Behavior

- **Context window awareness**: Large-scale refactoring can consume significant context. Break work into focused sessions — one module or file at a time. Commit between sessions so progress is not lost if context runs low.
- Ensure tests exist and pass before touching any code
- Make small, incremental changes — one refactoring at a time
- Verify tests pass after each change — never batch multiple refactorings
- Never refactor and add features simultaneously — separate concerns
- Commit after each completed refactoring step
- If tests do not exist for the code being refactored, write them first
- Preserve all existing behavior — the public API must not change unless intentional

## Refactoring Process

### 1. Identify the Smell

Recognize what needs improvement. Common code smells:

| Smell | Signal | Typical Fix |
|-------|--------|-------------|
| Long function | >50 lines, multiple responsibilities | Extract function |
| Large file | >400 lines, low cohesion | Extract module/class |
| Deep nesting | >4 levels of indentation | Early return, extract function |
| Duplicated code | Same logic in 2+ places | Extract shared function |
| Long parameter list | >4 parameters | Introduce parameter object |
| Feature envy | Method uses another class more than its own | Move method |
| Primitive obsession | Raw strings/numbers instead of domain types | Introduce value object |
| Shotgun surgery | One change requires editing many files | Consolidate related code |
| God class | One class that does everything | Split by responsibility |
| Dead code | Unused functions, unreachable branches | Remove it |

### 2. Ensure Test Coverage

Before refactoring, verify that tests cover the code being changed:

```bash
# Check coverage for the specific file or module
npm test -- --coverage --collectCoverageFrom='src/services/payment.ts'
# or
pytest --cov=apps.orders.services --cov-report=term-missing
# or
go test ./internal/service/ -coverprofile=coverage.out && go tool cover -func=coverage.out
```

If coverage is below 80%, write tests first:

- Test the current behavior, not what you think it should do
- Cover happy paths, error paths, and edge cases
- Use the tests as a safety net for the refactoring

### 3. Apply the Refactoring

Execute one refactoring operation at a time:

```
Extract Function    -> Pull out a block of code into a named function
Inline Function     -> Replace a trivial function call with its body
Rename              -> Give a variable, function, or class a better name
Move                -> Relocate code to where it belongs
Extract Class       -> Split a class that has multiple responsibilities
Extract Module      -> Split a file that has grown too large
Replace Temp        -> Replace a temporary variable with a query/function
Introduce Parameter -> Replace a hardcoded value with a parameter
Decompose Conditional -> Extract complex if/else into named functions
```

### 4. Verify Tests Pass

After each refactoring step, run the full test suite:

```bash
# Run affected tests first (fast feedback)
npm test -- --findRelatedTests src/services/payment.ts
# or
pytest apps/orders/tests/ -v

# Then run full suite (ensure no regressions)
npm test
# or
pytest
# or
go test ./...
```

### 5. Commit the Step

Each refactoring step gets its own commit:

```bash
git add src/services/payment.ts src/services/payment-validator.ts
git commit -m "refactor: extract payment validation into dedicated module"
```

## Safety Rules

- **Never refactor and add features simultaneously** — mixing them makes it
  impossible to tell if a test failure is from the refactoring or the new code
- **Commit after each refactoring step** — if something goes wrong you can
  revert a single step without losing other improvements
- **Run tests after every change** — if tests fail, revert immediately and
  try a smaller step
- **Do not change the public API** unless the refactoring explicitly requires
  it (and all callers are updated in the same commit)
- **Do not optimize prematurely** — refactoring is about clarity, not speed;
  optimize only when profiling shows a bottleneck
- **Preserve git blame utility** — avoid mass-reformatting changes that obscure
  the history of meaningful code changes

## Common Refactorings

### Extract Function

Before:

```typescript
function processOrder(order: Order): Result {
  // Validate inventory (15 lines of validation logic)
  const product = inventory.get(order.productId)
  if (!product) {
    return { success: false, error: 'Product not found' }
  }
  if (product.stock < order.quantity) {
    return { success: false, error: 'Insufficient stock' }
  }
  if (product.status !== 'active') {
    return { success: false, error: 'Product not available' }
  }

  // Calculate pricing (10 lines of pricing logic)
  const subtotal = product.price * order.quantity
  const discount = calculateDiscount(order.customerId, subtotal)
  const tax = calculateTax(subtotal - discount, order.shippingAddress)
  const total = subtotal - discount + tax

  // Create the order record
  return createOrderRecord(order, product, total)
}
```

After:

```typescript
function processOrder(order: Order): Result {
  const validationResult = validateInventory(order)
  if (!validationResult.success) {
    return validationResult
  }

  const total = calculateOrderTotal(order)
  return createOrderRecord(order, validationResult.product, total)
}

function validateInventory(order: Order): ValidationResult {
  const product = inventory.get(order.productId)
  if (!product) {
    return { success: false, error: 'Product not found' }
  }
  if (product.stock < order.quantity) {
    return { success: false, error: 'Insufficient stock' }
  }
  if (product.status !== 'active') {
    return { success: false, error: 'Product not available' }
  }
  return { success: true, product }
}

function calculateOrderTotal(order: Order): number {
  const product = inventory.get(order.productId)
  const subtotal = product.price * order.quantity
  const discount = calculateDiscount(order.customerId, subtotal)
  const tax = calculateTax(subtotal - discount, order.shippingAddress)
  return subtotal - discount + tax
}
```

### Replace Conditional with Polymorphism

Before:

```typescript
function calculateShipping(order: Order): number {
  switch (order.shippingMethod) {
    case 'standard':
      return order.weight * 0.5 + 4.99
    case 'express':
      return order.weight * 1.2 + 9.99
    case 'overnight':
      return order.weight * 2.0 + 19.99
    default:
      throw new Error(`Unknown shipping method: ${order.shippingMethod}`)
  }
}
```

After:

```typescript
interface ShippingCalculator {
  calculate(weight: number): number
}

const shippingCalculators: Record<string, ShippingCalculator> = {
  standard: { calculate: (weight) => weight * 0.5 + 4.99 },
  express: { calculate: (weight) => weight * 1.2 + 9.99 },
  overnight: { calculate: (weight) => weight * 2.0 + 19.99 },
}

function calculateShipping(order: Order): number {
  const calculator = shippingCalculators[order.shippingMethod]
  if (!calculator) {
    throw new Error(`Unknown shipping method: ${order.shippingMethod}`)
  }
  return calculator.calculate(order.weight)
}
```

### Decompose Large File

When a file exceeds 400 lines, split by responsibility:

```
# Before: src/services/order-service.ts (600 lines)

# After:
src/services/order-service.ts           # Orchestration (150 lines)
src/services/order-validator.ts         # Validation logic (120 lines)
src/services/order-pricing.ts           # Pricing calculations (100 lines)
src/services/order-notifications.ts     # Email/notification logic (80 lines)
src/services/order-types.ts             # Shared types (50 lines)
```

## Tools to Favor

- **Grep** — find all usages of a function/class before renaming or moving
- **Read** — understand the full context of code before refactoring
- **Glob** — locate test files, find related modules, discover callers
- **Edit** — make precise, targeted changes to existing files
- **Bash** — run tests after each step, check coverage, verify builds

## Refactoring Workflow Summary

```
1. Pick one smell
2. Check tests exist (write if not)
3. Run tests (must pass)
4. Apply one refactoring
5. Run tests (must still pass)
6. Commit
7. Repeat from step 1
```
