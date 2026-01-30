---
name: code-review
description: Review code for quality, security, and best practices. Use after writing significant code or before merging.
---

# Code Review Checklist

Review the current changes or specified files for the following criteria:

## Code Quality

- [ ] Clear, readable code with meaningful names
- [ ] Proper error handling
- [ ] No code duplication (DRY principle)
- [ ] Functions are small and focused
- [ ] No commented-out code

## Security

- [ ] No hardcoded secrets or API keys
- [ ] Input validation on user data
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper escaping)
- [ ] Secure authentication/authorization

## Performance

- [ ] No obvious performance bottlenecks
- [ ] Proper memoization where needed
- [ ] Efficient data structures and algorithms
- [ ] No unnecessary re-renders (React)

## Testing

- [ ] Test coverage for new functionality
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Mocks used appropriately

## TypeScript

- [ ] No `any` types
- [ ] Proper type definitions
- [ ] Interfaces for complex objects

## Output Format

Provide specific, actionable feedback with:
- File path and line number references (e.g., `src/utils.ts:42`)
- Severity level: Critical / Warning / Suggestion
- Clear explanation of the issue
- Suggested fix when applicable
