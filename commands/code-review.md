---
description: Comprehensive security and quality review of uncommitted changes.
---

Review uncommitted changes for security and quality issues.

Steps:
1. Get changed files: `git diff --name-only HEAD`
2. For each file, check for issues by severity:

**CRITICAL (block commit):**
- Hardcoded credentials, API keys, tokens
- SQL injection, XSS vulnerabilities
- Missing input validation
- Path traversal risks

**HIGH (should fix):**
- Functions > 50 lines, files > 800 lines
- Nesting depth > 4 levels
- Missing error handling
- console.log statements

**MEDIUM (consider):**
- Mutation patterns (use immutable)
- Missing tests for new code
- Accessibility issues

3. Generate report: severity, file:line, issue, suggested fix
4. Block commit if CRITICAL or HIGH issues found

NEVER approve code with security vulnerabilities.
