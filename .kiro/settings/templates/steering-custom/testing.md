# Testing Standards

[Purpose: guide what to test, where tests live, and how to structure them]

## Philosophy
- Test behavior, not implementation
- Prefer fast, reliable tests; minimize brittle mocks
- Cover critical paths deeply; breadth over 100% pursuit

## Organization
Options:
- Co-located: `component.tsx` + `component.test.tsx`
- Separate: `/src/...` and `/tests/...`
Pick one as default; allow exceptions with rationale.

Naming:
- Files: `*.test.*` or `*.spec.*`
- Suites: what is under test; Cases: expected behavior

## Test Types
- Unit: single unit, mocked dependencies, very fast
- Integration: multiple units together, mock externals only
- E2E: full flows, minimal mocks, only for critical journeys

## Structure (AAA)
```typescript
it('does X when Y', () => {
  // Arrange
  const input = setup();
  // Act
  const result = act(input);
  // Assert
  expect(result).toEqual(expected);
});
```

## Mocking & Data
- Mock externals (API/DB); never mock the system under test
- Use factories/fixtures; reset state between tests
- Keep test data minimal and intention-revealing

## Coverage
- Target: [% overall]; higher for critical domains
- Enforce thresholds in CI; exceptions require review rationale

---
_Focus on patterns and decisions. Tool-specific config lives elsewhere._
