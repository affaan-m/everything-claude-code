---
description: Analyze test coverage and generate missing tests for files below 80% threshold.
---

Analyze test coverage and generate missing tests.

Steps:
1. Run tests with coverage: `npm test --coverage`
2. Analyze coverage report (coverage/coverage-summary.json)
3. Identify files below 80% coverage threshold
4. For each under-covered file:
   - Analyze untested code paths
   - Generate unit tests for functions
   - Generate integration tests for APIs
   - Generate E2E tests for critical flows
5. Verify new tests pass
6. Show before/after coverage metrics
7. Ensure project reaches 80%+ overall coverage

Focus on: happy path, error handling, edge cases (null, undefined, empty), boundary conditions.
