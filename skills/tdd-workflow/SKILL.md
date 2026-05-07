---
name: tdd-workflow
description: "Stack-agnostic TDD spine — RED / GREEN / REFACTOR discipline, git checkpoint commits, and 80%+ coverage gate. Stack-specific test syntax, mocking, fixtures, and runner commands live in dedicated per-language testing skills (python-testing, golang-testing, kotlin-testing, rust-testing, cpp-testing, perl-testing, springboot-tdd, django-tdd, laravel-tdd, e2e-testing). Use when writing new features, fixing bugs, or refactoring."
origin: ECC
---

# Test-Driven Development Workflow

The methodology spine. Per-language patterns (Jest, pytest, JUnit,
GoogleTest, Pest, Playwright, etc.) live in dedicated testing skills —
this skill defers to them for any stack-specific concern.

## When to Activate

- Writing new features
- Fixing bugs (write a reproducer first)
- Refactoring (tests as the safety net)
- Adding API endpoints or new components

## The Discipline

```
Write a test that fails for the right reason   → RED
   ↓
Write the smallest code that makes it pass     → GREEN
   ↓
Improve the code while keeping tests green     → REFACTOR
```

Three non-negotiable rules:

1. **Test BEFORE code.** A test written *after* the fix is regression
   coverage, not TDD — you lose the RED signal.
2. **RED is a gate, not a formality.** A test that compiles but was
   never executed does not count. Confirm the test fails for the
   *intended* reason before writing any implementation.
3. **GREEN means the new test passes AND no other test regressed.**
   If unrelated tests went red, fix that before refactoring.

## The Cycle

### Step 1 — Frame the user-visible behavior

```
As a [role], I want to [action], so that [benefit].
```

TDD the user-visible contract; let private helpers emerge. Don't TDD
a private function directly.

### Step 2 — Write the failing test

Use the matching per-language testing skill for syntax / fixtures /
mocking (table below). The test must exercise the production code
path you're about to add or change, and have a descriptive name
(`returns_404_when_user_missing` beats `test_get_user_2`).

### Step 3 — Confirm RED (mandatory gate)

Two valid RED states:

- **Runtime RED**: test runs and fails on the assertion the missing
  implementation produces.
- **Compile-time RED**: the test references a function/method that
  doesn't exist yet, and the compile error clearly points at the new
  production code path.

If under git, commit:
`test: add reproducer for <bug/feature>`

### Step 4 — Minimal implementation

Smallest code that could make the test pass. Don't pre-implement
features the current test doesn't cover — that's untested code with
extra steps.

### Step 5 — Confirm GREEN

Rerun the same test target. Failing test now passes; no other test
regressed. Commit:
`fix: <bug>` or `feat: <feature>`.

### Step 6 — Refactor

Improve names, remove duplication, extract helpers — tests stay green
throughout. If a refactor breaks a test, the test was probably coupled
to implementation (see anti-patterns) or the refactor changed
behavior.

Optional commit: `refactor: clean up after <feature>`.

### Step 7 — Coverage gate

Defer command discovery to `verification-loop` (project entrypoint
first) or the per-language testing skill. Threshold:

- Project's own threshold if declared (`coverageThreshold` in Jest,
  `[tool.coverage]` in pyproject, `--cov-fail-under` in pytest config).
- Otherwise the team default of **80%** (matches `~/.claude/rules/testing.md`).

If under threshold:

- Add tests for uncovered branches, OR
- Justify and exclude untestable defensive branches with the
  language's pragma (`# pragma: no cover`, `/* istanbul ignore */`,
  etc.).

Don't silently leave the gap.

## Git Checkpoint Rules

The RED → GREEN → (Refactor) commit sequence is the audit trail of
this skill. To keep it honest:

- Count only commits **on the current active branch** for this task —
  don't claim a checkpoint exists from another branch.
- Verify each checkpoint is reachable from `HEAD`:
  `git merge-base --is-ancestor <commit> HEAD`
- Don't squash or rewrite checkpoint commits until the workflow
  completes. The audit trail is the point.

## Per-Language Testing Skills

| Language / Framework | Skill |
|---|---|
| Python (pytest) | `python-testing` |
| Go (table-driven, fuzzing) | `golang-testing` |
| Rust (built-in, proptest) | `rust-testing` |
| Kotlin (Kotest, MockK) | `kotlin-testing` |
| C++ (GoogleTest, CTest) | `cpp-testing` |
| Perl (Test2::V0) | `perl-testing` |
| Spring Boot (JUnit 5, Mockito, Testcontainers) | `springboot-tdd` |
| Django (pytest-django, factory_boy) | `django-tdd` |
| Laravel (Pest, PHPUnit) | `laravel-tdd` |
| E2E (Playwright) | `e2e-testing` |
| TS / JS (Jest, Vitest, RTL) | per project — see `coding-standards` |

These cover test syntax, fixtures, mocking, runner setup, and
framework-specific anti-patterns. **Don't reinvent here — read there.**

## Anti-Patterns

### Testing implementation details

```js
// ❌ couples to internal state — breaks on refactor
expect(component.state.count).toBe(5)
// ✅ test the user-visible result — survives refactor
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### Test-after-fix

Writing the test only after the bug is fixed — RED was never observed,
so the test no longer proves the fix works (it might pass with the
bug still present).

### Tests that depend on each other

Each test sets up its own data. Shared mutable state turns one failure
into many cascading failures and makes order-dependence a debugging
nightmare.

### Skipped tests left on the default branch

`test.skip(...)`, `@pytest.mark.skip`, `t.Skip()` — fix it or delete it.
CI doesn't check what doesn't run.

## Success Metrics

- ≥ 80% coverage (lines + branches), or the project's own threshold.
- RED → GREEN → (optional) Refactor commits visible in git history.
- No skipped tests on the default branch.
- Unit suite < 30 s total; individual unit tests < 50 ms.
