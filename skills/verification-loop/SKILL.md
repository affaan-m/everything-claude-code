---
name: verification-loop
description: "Pre-PR verification orchestrator. Honors the project's declared verification entrypoint (make verify, npm run verify, justfile) when present; falls back to stack-detected commands. Defers secret scanning to /security-review and debug-statement detection to lint/hooks rather than duplicating shell pipelines inline."
origin: ECC
---

# Verification Loop

Walk a declarative checklist; run the project's existing verification
tooling; report PASS / FAIL / SKIP per gate. Built around two ideas:

1. **Honor the project's own verification command** when it has one.
   `make verify` / `npm run verify` / `just verify` are authoritative —
   don't second-guess them with a generic stack table.
2. **Defer specialized concerns to specialized skills.** Secrets →
   `/security-review`. Debug statements → lint config or PostToolUse
   hook. This skill is the orchestrator, not the encyclopedia.

## When to Use

- After completing a feature or significant code change
- Before creating a PR
- After refactoring
- When the user asks for a quality gate

## Step 1 — Use the project's verification entrypoint (preferred)

Look for a declared entrypoint, in this order:

| Source | Look for |
|--------|----------|
| `Makefile` | targets `verify`, `ci`, `check`, `test-all` |
| `package.json` (`scripts`) | `verify`, `ci`, `check`, `precommit` |
| `justfile` / `Justfile` | recipes `verify` / `ci` |
| `pyproject.toml` (`[tool.poe.tasks]` / `[tool.taskipy.tasks]`) | task `verify` / `ci` |
| `README.md` / `CONTRIBUTING.md` | a "How to test" / "Local CI" section |

If found, **run it and trust its exit code**. The project author wrote
that command on purpose; running a different command from the table
below contradicts their CI. Skip directly to Step 3 (the checklist) to
review what the entrypoint actually covered and what it left for you.

## Step 2 — Stack-detected fallback (only if Step 1 finds nothing)

| File present | Stack | Build | Types | Lint | Test (with coverage) |
|--------------|-------|-------|-------|------|----------------------|
| `package.json` | Node / TS | `<pm> run build` | `npx tsc --noEmit` | `<pm> run lint` | `<pm> test -- --coverage` |
| `pyproject.toml` / `requirements.txt` | Python | (no build) | `pyright .` or `mypy .` | `ruff check .` | `pytest --cov` |
| `go.mod` | Go | `go build ./...` | `go vet ./...` | `golangci-lint run` | `go test -cover ./...` |
| `Cargo.toml` | Rust | `cargo build` | `cargo check` | `cargo clippy --all-targets` | `cargo test` |
| `pom.xml` | Java/Maven | `mvn compile` | (build covers) | `mvn checkstyle:check` | `mvn test` |
| `build.gradle*` | Java/Kotlin/Gradle | `gradle build` | (build covers) | `gradle check` | `gradle test` |
| `Gemfile` | Ruby | (no build) | (n/a) | `rubocop` | `bundle exec rspec` |

`<pm>` = the package manager matching the lockfile (`npm` / `pnpm` /
`yarn` / `bun`). Don't run `npm` if the project commits a `pnpm-lock.yaml`.

### Skip-not-Fail rule

If a phase's tool isn't configured (no `lint` script, no `pyright`
config, no `golangci-lint.yml`), report `skipped: no <phase> tooling`
and continue. Build and Test are exceptions — if neither is configured
that's a real gap, not a skip.

### Multi-stack repos

If multiple stack files match (monorepo / polyglot), either run
verification per surface or ask the user which surface to verify.
Don't run all stacks blindly — slow and noisy.

## Step 3 — Pre-PR checklist (declarative)

Independent of which path Step 1/2 took, walk this checklist before
flagging "ready":

- [ ] **Build green** — exit 0 from build command
- [ ] **Types clean** — 0 errors (or no type system → SKIP)
- [ ] **Tests pass** — exit 0 from test runner
- [ ] **Coverage meets project threshold** — read from project config
      (`coverageThreshold` in Jest, `[tool.coverage]` in pyproject,
      `--cov-fail-under` in pytest config). If undeclared, use the
      team default (`~/.claude/rules/testing.md` — typically 80%).
- [ ] **Lint clean** — 0 errors (warnings ≠ failures unless CI treats
      them as such)
- [ ] **Diff vs base sanity-checked** — see below
- [ ] **No new secrets** → DEFER to `/security-review` (don't grep here)
- [ ] **No leftover debug statements** → DEFER to lint config or
      PostToolUse hook (don't grep here)

### Diff sanity check

```bash
BASE="$(git merge-base HEAD origin/main 2>/dev/null \
       || git merge-base HEAD origin/master 2>/dev/null \
       || echo HEAD~1)"
git diff --stat "$BASE"..HEAD
git diff --name-only "$BASE"..HEAD
```

`HEAD~1` is wrong for multi-commit branches; always merge-base against
the default branch. Flag for each changed file:

- Unintended changes (formatting drift, lockfile churn, accidental reverts)
- Missing error handling at new system boundaries
- TODOs / FIXMEs added without a follow-up issue

## Output format

```
VERIFICATION REPORT
==================
Entrypoint: <make verify | npm run ci | stack-fallback>
Stack:      <detected stack>
Base:       <merge-base SHA>

Build:      [PASS/FAIL]
Types:      [PASS/FAIL/SKIP] (X errors)
Tests:      [PASS/FAIL] (X/Y passed, Z% coverage, threshold T%)
Lint:       [PASS/FAIL/SKIP] (X warnings)
Diff:       X files changed, Y additions, Z deletions

Deferred:
- Secrets: run /security-review
- Debug statements: ensure lint config / hook covers your stack

Overall:    [READY/NOT READY] for PR

Skipped phases:
- <phase>: <reason>

Issues to fix:
1. ...
```

## Continuous mode (lightweight)

For long sessions, between major changes run only the cheap gates —
**Build + Types + Tests** — and save the full checklist (lint, diff
review, security-review handoff) for pre-PR.

## Integration with hooks

PostToolUse hooks (formatter, linter on save) catch issues per-edit;
this skill provides the pre-PR sweep. They're complementary — if your
`Edit` hook already runs `ruff` on save, Step 3's lint gate will
likely show 0 issues, which is fine.
