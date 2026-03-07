# Review

**Purpose:** Parallel code review using "best of N" pattern. 3 independent review agents, deduplicated findings, confidence scoring.

**Why parallel?** Single-pass reviews miss ~20% of issues (per Anthropic's internal data). Running 3 agents with fresh, uncorrelated context windows catches more bugs and reduces false positives through consensus.

---

## Step 1: Detect Scope

Determine what to review without asking:

```bash
git diff --cached --stat          # Staged changes
git diff --stat                   # Unstaged changes
git log --oneline main..HEAD      # Branch diff
git show --stat HEAD              # Last commit
```

Pick the first non-empty result. Tell the user what scope you detected.

## Step 2: Prepare Review Context

```bash
BASE_SHA=$(git merge-base HEAD origin/main 2>/dev/null || echo "HEAD~1")
git diff --stat $BASE_SHA..HEAD       # File summary for user
```

## Step 3: Dispatch 3 Parallel Review Agents

Spawn **3 independent code-reviewer agents** using the Agent tool. All 3 run in parallel. Each gets the same diff but a different review lens to encourage diverse findings.

**Agent 1 — Security & Correctness:**
> Review code changes between $BASE_SHA and HEAD. Primary focus: security vulnerabilities, correctness issues, edge cases, and error handling. Secondary: code quality and architecture. Read full files, not just diffs. Report findings as: [SEVERITY] Title | File: path:line | Issue: description | Fix: recommendation.

**Agent 2 — Architecture & Quality:**
> Review code changes between $BASE_SHA and HEAD. Primary focus: architectural issues, code quality, maintainability, and patterns. Secondary: security and performance. Read full files, not just diffs. Report findings as: [SEVERITY] Title | File: path:line | Issue: description | Fix: recommendation.

**Agent 3 — Testing & Edge Cases:**
> Review code changes between $BASE_SHA and HEAD. Primary focus: missing tests, unhandled edge cases, failure modes, and error paths. Secondary: security and code quality. Read full files, not just diffs. Report findings as: [SEVERITY] Title | File: path:line | Issue: description | Fix: recommendation.

Use `subagent_type` referencing the code-reviewer agent for all 3.

## Step 4: Deduplicate and Score

After all 3 agents complete, merge their findings:

### Confidence Scoring

| Agents Found | Confidence | Meaning |
|-------------|------------|---------|
| 3/3 | HIGH | All 3 agents flagged independently — almost certainly real |
| 2/3 | MEDIUM | Majority consensus — likely real |
| 1/3 | LOW | Single agent only — verify before acting |

### Deduplication Rules

1. **Same file:line, same issue** — Merge. Confidence = number of agents that found it.
2. **Same file:line, different issues** — Keep as separate findings.
3. **Same issue, different locations** — Keep separate, cross-reference.
4. **Conflicting severity** — Use the higher severity.
5. **Conflicting recommendations** — Include both.

### Noise Filtering

- 1/3 confidence + LOW severity → **drop** (likely noise)
- 1/3 confidence + MEDIUM+ severity → **keep**, mark as "verify"
- 2/3+ confidence → **keep** regardless of severity

## Step 5: Report

```markdown
## Parallel Review: [scope description]

**Method**: 3 independent agents, deduplicated
**Files Reviewed**: [count]
**Unique Findings**: [count] (from [raw count] raw findings)

### Critical

- **[CR-001]** `file:line` — [description]
  Confidence: HIGH (3/3) | Fix: [recommendation]

### High

- **[HI-001]** `file:line` — [description]
  Confidence: MEDIUM (2/3) | Fix: [recommendation]

### Medium

- **[ME-001]** `file:line` — [description]
  Confidence: LOW (1/3, verify) | Fix: [recommendation]

### Summary

| Severity | HIGH (3/3) | MEDIUM (2/3) | LOW (1/3) | Total |
|----------|-----------|-------------|----------|-------|
| Critical | 0         | 0           | 0        | 0     |
| High     | 0         | 0           | 0        | 0     |
| Medium   | 0         | 0           | 0        | 0     |

Verdict: [APPROVE / WARNING / BLOCK]
```

## Step 6: After Review

If issues found: "Should I fix these now?" — fix starting with highest severity + confidence.
If zero findings across all 3 agents: strong clean signal. State what was verified.

---

## Approval Criteria

| Verdict | Condition |
|---------|-----------|
| **APPROVE** | No CRITICAL or HIGH at MEDIUM+ confidence |
| **WARNING** | HIGH findings only — merge with caution |
| **BLOCK** | Any CRITICAL finding at any confidence |

## Related Commands

- `/ship` — Formal quality gate before merging (includes review)
- `/audit` — Deep forensic codebase sweep (broader scope)
