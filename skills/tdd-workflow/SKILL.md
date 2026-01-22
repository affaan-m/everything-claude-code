---
name: tdd-workflow
description: TDD workflow with 80%+ coverage. Use when writing features, fixing bugs, or refactoring.
---

# TDD Workflow

## When to Use
Use for: new features, bug fixes, refactoring, new API endpoints/components.

## Requirements

- **80% minimum coverage** (unit + integration + E2E)
- All edge cases and error scenarios tested
- ALWAYS write tests first

## TDD Steps

1. **Write User Journey**: `As a [role], I want to [action], so that [benefit]`
2. **Generate Test Cases**: Cover happy path, edge cases, error scenarios
3. **Run Tests**: They should FAIL (not implemented yet)
4. **Implement Code**: Minimal code to make tests pass
5. **Run Tests**: They should PASS
6. **Refactor**: Keep tests green
7. **Verify Coverage**: `npm run test:coverage` (must be 80%+)

## Test File Organization

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx       # Unit tests
├── app/api/markets/
│   ├── route.ts
│   └── route.test.ts             # Integration tests
└── e2e/
    ├── markets.spec.ts           # E2E tests (Playwright)
    └── auth.spec.ts
```

## Mock Examples

### Database Client
```typescript
jest.mock('@/lib/database', () => ({
  db: {
    query: jest.fn(() => Promise.resolve({
      rows: [{ id: 1, name: 'Test Item' }],
      error: null
    }))
  }
}))
```

### Cache Client
```typescript
jest.mock('@/lib/cache', () => ({
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve()),
  checkHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

### External API
```typescript
jest.mock('@/lib/api', () => ({
  fetch: jest.fn(() => Promise.resolve({ data: [] }))
}))
```

## Coverage Thresholds

```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Best Practices

- Test user-visible behavior, NOT implementation details
- Use semantic selectors: `button:has-text("Submit")`, `[data-testid="x"]`
- Each test must be independent (own setup/teardown)
- Unit tests < 50ms each
- Mock external dependencies

---

**Tests are not optional.** They enable confident refactoring and production reliability.
