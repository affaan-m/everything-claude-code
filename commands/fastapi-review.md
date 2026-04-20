---
description: Review FastAPI code for best practices, security, and performance
---

# FastAPI Review

## Purpose

Invokes the `fastapi-reviewer` agent to review FastAPI applications for architecture, security, performance, and code quality.

## Usage

```
/fastapi-review [file or directory path]
```

## Workflow

1. **Context Gathering**
   - Read the specified files or explore the directory structure
   - Identify main application file, routers, schemas, models, and dependencies

2. **Architecture Review**
   - Check for application factory pattern
   - Verify separation of concerns (routers, schemas, models, CRUD)
   - Validate dependency injection usage

3. **Code Quality Review**
   - Pydantic schema design (request/response separation)
   - Async patterns and database operations
   - Error handling consistency

4. **Security Review**
   - Authentication and authorization
   - Password hashing and JWT handling
   - CORS and rate limiting configuration

5. **Performance Review**
   - Database connection pooling
   - N+1 query detection
   - Caching and compression strategies

6. **Output**
   - Structured review report with PASS/FAIL/WARN for each category
   - Priority fixes list
   - Improvement suggestions

## Output Format

```markdown
## FastAPI Review Summary

### Architecture
[Findings]

### Pydantic Schemas
[Findings]

### Dependency Injection
[Findings]

### Async Patterns
[Findings]

### Security
[Findings]

### Performance
[Findings]

### Documentation
[Findings]

## Priority Fixes
1. [Critical issues first]

## Suggestions
[Nice-to-have improvements]
```

## Related Commands

- `/code-review` - General code review
- `/python-review` - Python-specific review
- `/security-scan` - Security vulnerability scanning
