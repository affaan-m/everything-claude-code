---
agent: agent
description: Comprehensive code quality and security review of the selected code or recent changes
---

# Code Review

Review the selected code (or the current diff if nothing is selected) across four dimensions. Only report issues you are **confident about** — flag uncertainty explicitly rather than guessing.

## Dimensions

### 1. Security (CRITICAL — block ship if found)
- Hardcoded secrets, tokens, API keys, passwords
- Missing input validation or sanitization at system boundaries
- SQL/NoSQL injection risk (string interpolation in queries)
- XSS risk (unsanitized HTML output)
- Auth/authz checks missing or client-side only
- Sensitive data in logs or error messages exposed to clients
- Missing rate limiting on public endpoints

### 2. Code Quality (HIGH)
- Mutation of existing state instead of creating new objects
- Functions over 50 lines or files over 800 lines
- Nesting deeper than 4 levels
- Duplicated logic that should be extracted
- Misleading or non-descriptive names

### 3. Error Handling (HIGH)
- Silently swallowed errors (`catch {}`, empty catch blocks)
- Missing error handling at async boundaries
- Errors returned but not checked by callers
- User-facing error messages leaking internal details

### 4. Test Coverage (MEDIUM)
- Missing tests for new logic
- Tests that only test happy paths (missing error/edge cases)
- Assertions that always pass

## Output Format

For each issue found:

```
**[CRITICAL|HIGH|MEDIUM|LOW]** — [File:Line if known]
Issue: [What is wrong]
Fix: [Concrete suggestion]
```

End with a summary:
```
## Summary
- Critical: N
- High: N
- Medium: N
- Approved to ship: yes / no (fix CRITICAL and HIGH first)
```
