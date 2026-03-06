# Audit -- Forensic Deep Sweep

**Purpose:** Codebase health check. Assumes code is guilty until proven innocent.

Use for: periodic health checks, before major releases, after inheriting a codebase, or when something feels wrong.

---

## Step 1: Define Scope

If the user specifies files/modules, use those. Otherwise, find hot zones:

```bash
# Largest/most complex files
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20
# Most recent churn
git log --oneline --since="30 days ago" --name-only | grep -E "\.(ts|tsx)$" | sort | uniq -c | sort -rn | head -20
```

## Step 2: Dispatch Parallel Agents

Spawn 3-5 agents via Task tool with worktree isolation:

| Agent | Focus |
|-------|-------|
| Security Auditor (`security-reviewer`) | OWASP, business logic vulns, auth bypass |
| Code Quality (`code-reviewer`) | Dead code, complexity, patterns, consistency |
| Architecture (`architect`) | Dependency cycles, layering violations, coupling |
| Test Coverage (`code-reviewer`) | Coverage gaps, weak assertions, missing edge cases |
| Dependency Audit (general) | `npm audit`, outdated packages, license issues |

Each agent gets a specific slice or concern. They work in parallel.

## Step 3: Adversarial Mindset

For each module, demand answers to:

**Authorization:** Can user A access user B's data? Can deactivated users authenticate? Do endpoints accept `role` or `isAdmin` from the client? Do all state-changing operations verify ownership?

**Data Integrity:** Can amounts be negative or absurdly large? Are transactions atomic? What happens if step 3 of 5 fails? Race conditions in read-check-write?

**Information Leakage:** Do responses include password hashes or debug info? Do errors reveal stack traces or SQL? Any `SELECT *` returning more than needed?

**Input Boundaries:** 0-length input? 10MB input? Unicode? Null bytes? Unbounded pagination (page size 999999)?

## Step 4: Synthesize

```markdown
## Audit Report: [codebase/module]
**Date:** YYYY-MM-DD | **Scope:** [what was audited] | **Agents:** [count, focus areas]

### Executive Summary
- X critical, Y important, Z minor
- Overall health: [RED / YELLOW / GREEN]
- Top 3 risks: [one-line each]

### Critical Issues (Fix Immediately)
1. **file:line** -- [description]
   Impact: [what an attacker/bug could do]
   Evidence: [how confirmed]
   Fix: [concrete remediation]

### Important Issues (Fix This Sprint)
[same format]

### Minor Issues (Backlog)
[same format]

### Architecture Concerns
- [structural issues, coupling, layering violations]

### Dependency Health
- Vulnerable: [list] | Outdated: [count] | License issues: [list]

### What's Solid
- [verified correct -- give credit where due]

### Recommendations
1. [highest-priority]
2. [next]
3. [next]
```

## Step 5: Follow Up

1. "Want me to fix the critical issues now?"
2. Fix one by one, re-verify each
3. Offer tracking list for important/minor items
