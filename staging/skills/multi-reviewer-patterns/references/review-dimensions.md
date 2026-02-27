# Review Dimension Checklists

Detailed checklists for each review dimension that reviewers follow during parallel code review.

## Security Review Checklist

### Input Handling

- [ ] All user inputs are validated and sanitized
- [ ] SQL queries use parameterized statements (no string concatenation)
- [ ] HTML output is properly escaped to prevent XSS
- [ ] File paths are validated to prevent path traversal
- [ ] Request size limits are enforced

### Authentication & Authorization

- [ ] Authentication is required for all protected endpoints
- [ ] Authorization checks verify user has permission for the action
- [ ] JWT tokens are validated (signature, expiry, issuer)
- [ ] Password hashing uses bcrypt/argon2 (not MD5/SHA)
- [ ] Session management follows best practices

### Secrets & Configuration

- [ ] No hardcoded secrets, API keys, or passwords
- [ ] Secrets are loaded from environment variables or secret manager
- [ ] .gitignore includes sensitive file patterns
- [ ] Debug/development endpoints are disabled in production

### Dependencies

- [ ] No known CVEs in direct dependencies
- [ ] Dependencies are pinned to specific versions
- [ ] No unnecessary dependencies that increase attack surface

## Performance Review Checklist

### Database

- [ ] No N+1 query patterns
- [ ] Queries use appropriate indexes
- [ ] No SELECT \* on large tables
- [ ] Pagination is implemented for list endpoints
- [ ] Connection pooling is configured

### Memory & Resources

- [ ] No memory leaks (event listeners cleaned up, streams closed)
- [ ] Large data sets are streamed, not loaded entirely into memory
- [ ] File handles and connections are properly closed
- [ ] Caching is used for expensive operations

### Computation

- [ ] No unnecessary re-computation or redundant operations
- [ ] Appropriate algorithm complexity for the data size
- [ ] Async operations used where I/O bound
- [ ] No blocking operations on the main thread

## Architecture Review Checklist

### Design Principles

- [ ] Single Responsibility: each module/class has one reason to change
- [ ] Open/Closed: extensible without modification
- [ ] Dependency Inversion: depends on abstractions, not concretions
- [ ] No circular dependencies between modules

### Structure

- [ ] Clear separation of concerns (UI, business logic, data)
- [ ] Consistent error handling strategy across the codebase
- [ ] Configuration is externalized, not hardcoded
- [ ] API contracts are well-defined and versioned

### Patterns

- [ ] Consistent patterns used throughout (no pattern mixing)
- [ ] Abstractions are at the right level (not over/under-engineered)
- [ ] Module boundaries align with domain boundaries
- [ ] Shared utilities are actually shared (no duplication)

## Testing Review Checklist

### Coverage

- [ ] Critical paths have test coverage
- [ ] Edge cases are tested (empty input, null, boundary values)
- [ ] Error paths are tested (what happens when things fail)
- [ ] Integration points have integration tests

### Quality

- [ ] Tests are deterministic (no flaky tests)
- [ ] Tests are isolated (no shared state between tests)
- [ ] Assertions are specific (not just "no error thrown")
- [ ] Test names clearly describe what is being tested

### Maintainability

- [ ] Tests don't duplicate implementation logic
- [ ] Mocks/stubs are minimal and accurate
- [ ] Test data is clear and relevant
- [ ] Tests are easy to understand without reading the implementation

## Accessibility Review Checklist

### Structure

- [ ] Semantic HTML elements used (nav, main, article, button)
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] ARIA roles and properties used correctly
- [ ] Landmarks identify page regions

### Interaction

- [ ] All functionality accessible via keyboard
- [ ] Focus order is logical and visible
- [ ] No keyboard traps
- [ ] Touch targets are at least 44x44px

### Content

- [ ] Images have meaningful alt text
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast ratio (4.5:1 for normal, 3:1 for large)
- [ ] Content is readable at 200% zoom
