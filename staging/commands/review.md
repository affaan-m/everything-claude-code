# Review

**Purpose:** Find what's wrong. Prove what's right. Trust nothing.

**Mindset:** Your confidence is not evidence. Compiling is not working. Tests passing is not correct. "Looks fine" is not verified. Assume the code is broken until you prove otherwise.

---

## Three Modes

| Mode | When | Scope | Agents |
|------|------|-------|--------|
| `/review` | After finishing work | Recent changes | You alone |
| `/review --ship` | Before merging/deploying | Full branch vs main | code-reviewer + security-reviewer |
| `/review --audit` | Periodic deep sweep | Entire codebase or module | 3-5 parallel agents, forensic intensity |

---

## `/review` — Targeted Review

### Step 1: Auto-Detect Scope

Determine what to review without asking:

```bash
# Check for staged changes first
git diff --cached --stat
# Then unstaged changes
git diff --stat
# If no local changes, check branch diff against main
git log --oneline main..HEAD
git diff main...HEAD --stat
# If nothing, check last commit
git show --stat HEAD
```

Pick the first non-empty result. Tell the user what scope you detected.

### Step 2: Read Every Changed File

Read the FULL file, not just the diff. Understand context. Check imports, callers, and call sites.

### Step 3: Hunt for Issues

For each changed function or block, challenge it:

- What happens if inputs are null, undefined, empty, negative, or absurdly large?
- What happens if this throws? Is the error caught? Does the caller handle it?
- What happens under concurrent access? Race conditions?
- What happens with malicious input? SQL injection, XSS, command injection?
- Does this match what the rest of the codebase does, or is it inconsistent?

### Step 4: Report

```markdown
## Review: [scope description]

### Critical (must fix)
- **file:line** — [description]
  Impact: [what breaks]
  Fix: [concrete fix]

### Important (should fix)
- **file:line** — [description]
  Fix: [concrete fix]

### Minor (nice to fix)
- **file:line** — [description]

### Verified Correct
- [What you checked and confirmed works, with evidence]

### Not Reviewed
- [What was out of scope]
```

---

## `/review --ship` — Formal Quality Gate

Use before merging a branch or deploying to production. This is a PASS/FAIL gate with evidence requirements.

### Step 1: Gather Full Diff

```bash
git diff main...HEAD
git log --oneline main..HEAD
```

### Step 2: Dispatch Agents

Spawn two parallel agents:

1. **code-reviewer agent** — Quality, patterns, correctness (use Task tool with `subagent_type: "code-reviewer"`)
2. **security-reviewer agent** — Vulnerabilities, secrets, auth issues (use Task tool with `subagent_type: "security-reviewer"`)

Wait for both to complete.

### Step 3: Apply the Three Filters

After agent reports return, synthesize through these filters:

#### FILTER 1: Deep Thought (Fight Laziness)

- **Logic:** Did we settle for the first solution that "worked," or is this the BEST solution?
- **Assumptions:** Are we assuming happy path only? Brutally simulate the worst case — null inputs, network failures, malformed data, race conditions, malicious input. Does the logic hold?
- **Quality Score:** Rate 1-10. A 6 is mediocre. An 8 is solid. Demand 8+.

#### FILTER 2: Minimalist (Fight Bloat)

- **Code Volume:** Is this the minimum code needed? Could it be simpler?
- **Scope Discipline:** Was anything built that wasn't requested? Any "helpful extras" that weren't approved?
- **Dependency Diet:** Were dependencies added? Could any be replaced with 10 lines of native code?

#### FILTER 3: Production Reality (Fight Fragility)

- **Hygiene:** No TODOs, no placeholders, no dead code, no commented-out code, no console.log, secrets via env vars only.
- **Stability:** Compiles clean (`npx tsc --noEmit`), lints clean (`npm run lint`), tests pass. Run these — don't assume.
- **Completeness:** All callers updated if signatures changed. All references removed if files deleted. Error handling in place.

### Step 4: Demand Evidence

| Claim | Required Evidence |
|-------|-------------------|
| "It works" | Show it working or test output |
| "Tests pass" | Show `npm test` output |
| "Lint is clean" | Show `npm run lint` output |
| "It compiles" | Show `npx tsc --noEmit` output |
| "I fixed X" | Show the before/after diff |

No evidence = **UNVERIFIED**. Unverified claims fail the gate.

### Step 5: Verdict

```markdown
## Ship Review: [branch/feature name]

### Files Audited
- file1 — [what changed]
- file2 — [what changed]

### Agent Reports
- code-reviewer: [summary of findings]
- security-reviewer: [summary of findings]

### Filter 1: Deep Thought
- Logic: [Pass/Fail] — [notes]
- Assumptions: [Pass/Fail] — [worst-case findings]
- Quality Score: [X/10]

### Filter 2: Minimalist
- Code Volume: [Pass/Fail]
- Scope: [Pass/Fail]
- Dependencies: [Pass/Fail]

### Filter 3: Production
- Hygiene: [Pass/Fail] — [evidence]
- Stability: [Pass/Fail] — [build/lint/test output]
- Completeness: [Pass/Fail]

### Evidence Log
- [x] Compiles — `npx tsc --noEmit` exit 0
- [x] Lints — `npm run lint` exit 0
- [ ] Tests — UNVERIFIED (no test runner configured)

### Issues Found
1. [CRITICAL] file:line — description
2. [HIGH] file:line — description

### Verdict: [PASS | PASS WITH WARNINGS | FAIL]

### Required Actions Before Merge
1. [action]

Or: "Clean. Ready to ship."
```

**Approval criteria:**
- **PASS**: No CRITICAL or HIGH issues, all filters pass, evidence verified
- **PASS WITH WARNINGS**: HIGH issues acknowledged, all CRITICAL resolved
- **FAIL**: Any CRITICAL issue, or multiple unverified claims

---

## `/review --audit` — Forensic Deep Sweep

The nuclear option. Use for periodic codebase health checks, before major releases, after inheriting a codebase, or when something feels wrong but you can't pinpoint it.

**This mode assumes the code is guilty until proven innocent.**

### Step 1: Define Scope

If the user specifies files/modules, use those. Otherwise, identify the hot zones:

```bash
# Find largest/most complex files
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
# Find files with most recent churn
git log --oneline --since="30 days ago" --name-only | grep -E "\.(ts|tsx)$" | sort | uniq -c | sort -rn | head -20
# Find files with most authors (complexity indicator)
git log --format="%an" -- src/ | sort -u | wc -l
```

### Step 2: Dispatch Parallel Agents

Spawn 3-5 specialized agents based on the codebase:

| Agent | Type | Focus |
|-------|------|-------|
| Security Auditor | `security-reviewer` | Full OWASP + AI-generated code business logic vulns |
| Code Quality | `code-reviewer` | Dead code, complexity, patterns, consistency |
| Architecture | `architect` | Dependency cycles, layering violations, coupling |
| Test Coverage | `code-reviewer` | Coverage gaps, weak assertions, missing edge cases |
| Dependency Audit | `general-purpose` | `npm audit`, outdated packages, license issues |

Each agent gets a specific slice of the codebase or a specific concern. They work in parallel.

### Step 3: The Adversarial Mindset

This is not a checkbox exercise. For each module under audit, demand answers to:

**Authorization & Access Control:**
- Can a regular user access admin endpoints?
- Can user A read/modify user B's data?
- Can deactivated/deleted users still authenticate?
- Are there endpoints that accept a `role` or `isAdmin` field from the client?
- Do all state-changing operations verify ownership?

**Data Integrity:**
- Can financial amounts be negative, zero, or absurdly large?
- Are transactions atomic? What happens if step 3 of 5 fails?
- Is there a path where data gets partially written?
- Are there race conditions in read-check-write sequences?

**Information Leakage:**
- Do API responses include password hashes, internal IDs, or debug info?
- Do error messages reveal stack traces, file paths, or SQL queries?
- Are there `SELECT *` queries returning more fields than the client needs?

**Input Boundaries:**
- What happens with 0-length input? 10MB input? Unicode? Null bytes?
- Are file uploads validated (type, size, content)?
- Are pagination parameters bounded (page size of 999999)?

### Step 4: Synthesize

After all agents report back, compile a unified audit:

```markdown
## Audit Report: [codebase/module name]
**Date:** YYYY-MM-DD
**Scope:** [what was audited]
**Agents:** [how many, what focus areas]

### Executive Summary
- X critical issues, Y important, Z minor
- Overall health: [RED / YELLOW / GREEN]
- Top 3 risks: [one-line each]

### Critical Issues (Fix Immediately)
1. **[file:line]** — [description]
   - Impact: [what an attacker/bug could do]
   - Evidence: [how we confirmed this]
   - Fix: [concrete remediation]

### Important Issues (Fix This Sprint)
[same format]

### Minor Issues (Track in Backlog)
[same format]

### Architecture Concerns
- [structural issues, coupling, layering violations]

### Dependency Health
- Vulnerable packages: [list]
- Outdated packages: [count]
- License issues: [list]

### What's Solid
- [things that were verified correct — give credit where due]

### Recommendations
1. [highest-priority action]
2. [next action]
3. [next action]
```

### Step 5: Follow Up

After presenting the audit:
1. Ask: "Want me to fix the critical issues now?"
2. If yes, fix them one by one, re-verifying each fix
3. Offer to create a tracking issue/TODO list for important and minor items

---

## Red Flags to Hunt (All Modes)

```typescript
// DANGEROUS: Type assertion hiding real issues
const data = response as UserData;

// DANGEROUS: Non-null assertion without justification
const user = getUser()!;

// DANGEROUS: Swallowing errors silently
try { riskyOp() } catch (e) { /* ignore */ }

// DANGEROUS: String interpolation in queries
query(`SELECT * FROM users WHERE id = ${userId}`);

// DANGEROUS: Untyped escape hatch
function process(data: any) { ... }

// DANGEROUS: Mass assignment from request body
await db.users.update(id, req.body);

// DANGEROUS: Missing ownership check
const item = await db.items.findById(req.params.id);
res.json(item); // Any user can read any item

// SUSPICIOUS: Magic numbers without explanation
if (retries > 3) { ... }

// SUSPICIOUS: setTimeout/setInterval without cleanup
setTimeout(() => refetch(), 5000);
```

---

## After Any Review

If issues found:
1. Ask: "Should I fix these now?"
2. Fix one by one, re-running the relevant check after each fix
3. Re-run review on the fixes to confirm they don't introduce new issues

If no issues found:
- State what was verified and how
- Acknowledge what wasn't checked
- Never claim "no issues" without evidence
