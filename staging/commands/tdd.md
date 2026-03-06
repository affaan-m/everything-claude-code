---
description: Enforce test-driven development workflow. Write tests FIRST, then implement minimal code to pass.
---

# TDD Command

Invokes the **tdd-guide** agent to enforce RED -> GREEN -> REFACTOR.

---

## The Cycle

```
RED:      Write a failing test (verify it fails for the RIGHT reason)
GREEN:    Write MINIMAL code to make it pass
REFACTOR: Improve code while keeping tests green
REPEAT:   Next scenario
```

## Steps

1. **Define interfaces** for inputs/outputs
2. **Write tests that FAIL** (code doesn't exist yet)
3. **Run tests** -- verify they fail for the right reason, not import errors
4. **Write minimal implementation** to pass
5. **Run tests** -- verify they pass
6. **Refactor** while keeping tests green
7. **Check coverage** -- add more tests if below 80%

## Coverage Requirements

- **80% minimum** for all code
- **100% required** for: financial calculations, auth logic, security-critical code, core business logic

## Test Quality

- Test behavior, not implementation
- One assertion per test when practical
- Descriptive names: `'should reject empty input'`, `'retries failed operations 3 times'`
- No console.log in tests

## Test Types

| Type | Scope | Examples |
|------|-------|---------|
| Unit | Function-level | Happy path, edge cases, error conditions, boundary values |
| Integration | Component-level | API endpoints, DB operations, components with hooks |
| E2E | Full stack | Critical user flows, multi-step processes |

## Rules

- **Tests FIRST** -- never write implementation before tests
- **Run after every change** -- don't batch
- **Minimal code** -- just enough to pass, no more
- **Bug fixes** -- write test that reproduces the bug FIRST
- Use **Vitest**, not bun:test or Jest

## Integration

- Use `/plan` first to understand what to build
- Use `/verify` to check overall health after implementation
- Use `/review` to review the completed work
