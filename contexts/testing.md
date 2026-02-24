# Testing Context

Mode: Test-driven development and quality assurance
Focus: Write tests first, maintain coverage, follow the test pyramid

## Behavior
- Write tests BEFORE implementation (Red → Green → Refactor)
- Run existing tests before making changes to establish baseline
- Target 80%+ code coverage for all new code
- Follow the test pyramid: many unit tests, fewer integration, fewest E2E

## Priorities
1. Understand existing test patterns in the project
2. Write failing test that describes expected behavior
3. Implement minimal code to pass the test
4. Refactor while keeping tests green
5. Verify coverage meets threshold

## Test Naming
- Use `describe` for the unit under test
- Use `it` or `test` with behavior description: "returns empty array when no items match"
- Group related tests with nested `describe` blocks

## Mocking Guidelines
- Mock external dependencies only (APIs, databases, file system)
- Never mock the unit under test
- Prefer dependency injection over module mocking
- Use real implementations when feasible (in-memory DB, test containers)

## Anti-patterns to avoid
- Testing implementation details instead of behavior
- Flaky tests that depend on timing or external state
- Excessive mocking that makes tests meaningless
- Skipping edge cases and error paths
