---
description: Enforce TDD workflow - write tests FIRST, then implement. Ensure 80%+ coverage.
---

Implement using TDD workflow: $ARGUMENTS

TDD Cycle: RED → GREEN → REFACTOR → REPEAT

Steps:
1. Define interfaces for inputs/outputs
2. Write tests that FAIL (code doesn't exist yet)
3. Verify tests fail for the right reason
4. Write minimal implementation to pass
5. Refactor while keeping tests green
6. Run `npm run test:coverage` and verify 80%+ coverage

Coverage requirements:
- 80% minimum for all code
- 100% for financial, auth, security-critical code
