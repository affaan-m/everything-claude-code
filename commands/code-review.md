---
description: Code review — local uncommitted changes or GitHub PR (pass PR number/URL for PR mode)
argument-hint: [pr-number | pr-url | blank for local review]
---

# Code Review

> PR review mode adapted from [PRPs-agentic-eng](https://github.com/Wirasm/PRPs-agentic-eng) by Wirasm. Part of the PRP workflow series.

**Input**: $ARGUMENTS

---

## Mode Selection

If `$ARGUMENTS` contains a PR number, PR URL, or `--pr`:
→ Jump to **PR Review Mode** below.

Otherwise:
→ Use **Local Review Mode**.

---

## Local Review Mode

Comprehensive security and quality review of uncommitted changes.

### Phase 1 — GATHER

```bash
git diff --name-only HEAD
```

If no changed files, stop: "Nothing to review."

### Phase 2 — REVIEW

Read each changed file in full. Check for:

**Security Issues (CRITICAL):**
- Hardcoded credentials, API keys, tokens
- SQL injection vulnerabilities
- XSS vulnerabilities
- Missing input validation
- Insecure dependencies
- Path traversal risks

**Code Quality (HIGH):**
- Functions > 50 lines
- Files > 800 lines
- Nesting depth > 4 levels
- Missing error handling
- console.log statements
- TODO/FIXME comments
- Missing JSDoc for public APIs

**Best Practices (MEDIUM):**
- Mutation patterns (use immutable instead)
- Emoji usage in code/comments
- Missing tests for new code
- Accessibility issues (a11y)

### Phase 3 — REPORT

Generate report with:
- Severity: CRITICAL, HIGH, MEDIUM, LOW
- File location and line numbers
- Issue description
- Suggested fix

Block commit if CRITICAL or HIGH issues found.
Never approve code with security vulnerabilities.

---

## PR Review Mode

Comprehensive GitHub PR review — fetches diff, reads full files, runs validation, posts review.

### Phase 1 — FETCH

Parse input to determine PR:

| Input | Action |
|---|---|
| Number (e.g. `42`) | Use as PR number |
| URL (`github.com/.../pull/42`) | Extract PR number |
| Branch name | Find PR via `gh pr list --head <branch>` |

```bash
gh pr view <NUMBER> --json number,title,body,author,baseRefName,headRefName,changedFiles,additions,deletions
gh pr diff <NUMBER>
```

If PR not found, stop with error. Store PR metadata for later phases.

### Phase 2 — CONTEXT

Build review context:

1. **Project rules** — Read `CLAUDE.md`, `.claude/docs/`, and any contributing guidelines
2. **PRP artifacts** — Check `.claude/PRPs/reports/` and `.claude/PRPs/plans/` for implementation context related to this PR
3. **PR intent** — Parse PR description for goals, linked issues, test plans
4. **Changed files** — List all modified files and categorize by type (source, test, config, docs)

### Phase 3 — REVIEW

Read each changed file **in full** (not just the diff hunks — you need surrounding context).

Apply the review checklist across 7 categories:

| Category | What to Check |
|---|---|
| **Correctness** | Logic errors, off-by-ones, null handling, edge cases, race conditions |
| **Type Safety** | Type mismatches, unsafe casts, `any` usage, missing generics |
| **Pattern Compliance** | Matches project conventions (naming, file structure, error handling, imports) |
| **Security** | Injection, auth gaps, secret exposure, SSRF, path traversal, XSS |
| **Performance** | N+1 queries, missing indexes, unbounded loops, memory leaks, large payloads |
| **Completeness** | Missing tests, missing error handling, incomplete migrations, missing docs |
| **Maintainability** | Dead code, magic numbers, deep nesting, unclear naming, missing types |

Assign severity to each finding:

| Severity | Meaning | Action |
|---|---|---|
| **CRITICAL** | Security vulnerability or data loss risk | Must fix before merge |
| **HIGH** | Bug or logic error likely to cause issues | Should fix before merge |
| **MEDIUM** | Code quality issue or missing best practice | Fix recommended |
| **LOW** | Style nit or minor suggestion | Optional |

### Phase 4 — VALIDATE

Run available validation commands:

```bash
# Type checking (if applicable)
npm run typecheck || npx tsc --noEmit || bunx tsc --noEmit

# Linting
npm run lint || npx eslint . || cargo clippy || go vet ./...

# Tests
npm test || cargo test || go test ./... || pytest

# Build
npm run build || cargo build || go build ./...
```

Run whichever commands exist in the project. Record pass/fail for each.

### Phase 5 — DECIDE

Form recommendation based on findings:

| Condition | Decision |
|---|---|
| Zero CRITICAL/HIGH issues, validation passes | **APPROVE** |
| Only MEDIUM/LOW issues, validation passes | **APPROVE** with comments |
| Any HIGH issues or validation failures | **REQUEST CHANGES** |
| Any CRITICAL issues | **BLOCK** — must fix before merge |

Special cases:
- Draft PR → Always use **COMMENT** (not approve/block)
- Only docs/config changes → Lighter review, focus on correctness
- Explicit `--approve` or `--request-changes` flag → Override decision (but still report all findings)

### Phase 6 — REPORT

Create review artifact at `.claude/PRPs/reviews/pr-<NUMBER>-review.md`:

```markdown
# PR Review: #<NUMBER> — <TITLE>

**Reviewed**: <date>
**Author**: <author>
**Branch**: <head> → <base>
**Decision**: APPROVE | REQUEST CHANGES | BLOCK

## Summary
<1-2 sentence overall assessment>

## Findings

### CRITICAL
<findings or "None">

### HIGH
<findings or "None">

### MEDIUM
<findings or "None">

### LOW
<findings or "None">

## Validation Results

| Check | Result |
|---|---|
| Type check | ✅ Pass / ❌ Fail / ⏭️ Skipped |
| Lint | ✅ / ❌ / ⏭️ |
| Tests | ✅ / ❌ / ⏭️ |
| Build | ✅ / ❌ / ⏭️ |

## Files Reviewed
<list of files with change type: Added/Modified/Deleted>
```

### Phase 7 — PUBLISH

Post the review to GitHub:

```bash
# If APPROVE
gh pr review <NUMBER> --approve --body "<summary of review>"

# If REQUEST CHANGES
gh pr review <NUMBER> --request-changes --body "<summary with required fixes>"

# If COMMENT only (draft PR or informational)
gh pr review <NUMBER> --comment --body "<summary>"
```

For individual file-level comments on specific findings, use:
```bash
gh pr comment <NUMBER> --body "<detailed comment with file references>"
```

### Phase 8 — OUTPUT

Report to user:

```
PR #<NUMBER>: <TITLE>
Decision: <APPROVE|REQUEST_CHANGES|BLOCK>

Issues: <critical_count> critical, <high_count> high, <medium_count> medium, <low_count> low
Validation: <pass_count>/<total_count> checks passed

Artifacts:
  Review: .claude/PRPs/reviews/pr-<NUMBER>-review.md
  GitHub: <PR URL>

Next steps:
  - <contextual suggestions based on decision>
```

---

## Edge Cases

- **No `gh` CLI**: Fall back to local-only review (read the diff, skip GitHub publish). Warn user.
- **Diverged branches**: Suggest `git fetch origin && git rebase origin/<base>` before review.
- **Large PRs (>50 files)**: Warn about review scope. Focus on source changes first, then tests, then config/docs.
