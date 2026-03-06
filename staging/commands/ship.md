# Ship -- Formal Quality Gate

**Purpose:** Pass/fail gate before merging or deploying. Evidence-based. No unverified claims.

---

## Step 1: Gather Full Diff

```bash
git diff main...HEAD
git log --oneline main..HEAD
```

## Step 2: Dispatch Agents

Spawn two parallel agents via Task tool:

1. **code-reviewer** -- Quality, patterns, correctness
2. **security-reviewer** -- Vulnerabilities, secrets, auth issues

Wait for both to complete.

## Step 3: Apply Three Filters

### FILTER 1: Deep Thought
- **Logic:** Is this the BEST solution or just the first that worked?
- **Assumptions:** Simulate worst case -- null inputs, network failures, malformed data, race conditions, malicious input.
- **Quality Score:** Rate 1-10. Demand 8+.

### FILTER 2: Minimalist
- **Code Volume:** Minimum code needed? Could it be simpler?
- **Scope Discipline:** Anything built that wasn't requested?
- **Dependency Diet:** Dependencies added that could be replaced with native code?

### FILTER 3: Production Reality
- **Hygiene:** No TODOs, no placeholders, no dead code, no console.log, secrets via env vars only.
- **Stability:** Run `/verify full` -- don't assume, prove it.
- **Completeness:** All callers updated if signatures changed. All references removed if files deleted.

## Step 4: Demand Evidence

| Claim | Required Evidence |
|-------|-------------------|
| "It works" | Show it working or test output |
| "Tests pass" | Show `npm test` output |
| "Lint clean" | Show `npm run lint` output |
| "It compiles" | Show `npx tsc --noEmit` output |

No evidence = **UNVERIFIED**. Unverified claims fail the gate.

## Step 5: Verdict

```markdown
## Ship Review: [branch/feature name]

### Files Audited
- file -- [what changed]

### Agent Reports
- code-reviewer: [summary]
- security-reviewer: [summary]

### Filters
| Filter | Status | Notes |
|--------|--------|-------|
| Deep Thought | Pass/Fail | Quality: X/10 |
| Minimalist | Pass/Fail | [notes] |
| Production | Pass/Fail | [evidence] |

### Evidence Log
- [x] Compiles -- `npx tsc --noEmit` exit 0
- [x] Lints -- `npm run lint` exit 0
- [ ] Tests -- UNVERIFIED

### Issues Found
1. [CRITICAL] file:line -- description
2. [HIGH] file:line -- description

### Verdict: [PASS | PASS WITH WARNINGS | FAIL]

### Required Actions Before Merge
1. [action] -- or "Clean. Ready to ship."
```

**PASS**: No CRITICAL/HIGH issues, all filters pass, evidence verified
**PASS WITH WARNINGS**: HIGH issues acknowledged, all CRITICAL resolved
**FAIL**: Any CRITICAL issue, or multiple unverified claims
