---
description: Enforce TDD workflow - write tests FIRST, then implement. Ensure 80%+ coverage.
---

# /tdd

Invokes the **tdd-guide** agent.

## When to Use

- Implementing new features
- Fixing bugs (write test that reproduces bug first)
- Refactoring existing code
- Building critical business logic

## TDD Cycle

```
RED → GREEN → REFACTOR → REPEAT

RED:      Write failing test
GREEN:    Write minimal code to pass
REFACTOR: Improve code, keep tests passing
```

## What It Does

1. Define interfaces for inputs/outputs
2. Write tests that FAIL (code doesn't exist yet)
3. Verify tests fail for the right reason
4. Write minimal implementation to pass
5. Refactor while keeping tests green
6. Verify 80%+ coverage

## Example

```
/tdd I need a function to calculate market liquidity score
```

## Coverage Requirements

- 80% minimum for all code
- 100% for financial, auth, security-critical code

See `agents/tdd-guide.md` and `skills/tdd-workflow/` for details.
