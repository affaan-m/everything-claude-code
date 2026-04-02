---
name: argus-review
description: >
  Multi-model code review with silent auto-continue loop and 6-agent deep PR review.
  Use before git commits and PR creation. Combines external CLI review pass with
  SAST scanning, smart cross-file context, docs consistency checking, and a
  6-voice parallel agent review for PRs. Part of the Argus multi-model review system.
origin: "Chris Yau (@chris-yyau)"
---

# Argus Review

Multi-model code review system. Combines an external AI review pass (via argus-dispatch) with SAST scanning, smart cross-file context, and a 6-agent deep review for PRs.

The core insight: LLM-only review catches semantic issues but misses deterministic bugs. SAST-only catches patterns but misses logic. Smart context catches cross-file breaks that both miss alone. Argus Review layers all three.

## When to Use

- Before `git commit` — review staged changes
- Before `gh pr create` — deep multi-voice review of full branch diff
- After writing or modifying code — catch issues early
- Before deployment — final quality gate

## Architecture

```
Staged changes (git diff --cached)
    │
    ├─→ SAST scan (Semgrep, ShellCheck, TruffleHog)     ← deterministic
    ├─→ Smart context (callers, importers of changed code) ← cross-file
    ├─→ Docs context (READMEs referencing changed code)   ← consistency
    │
    ▼
External model review (via argus-dispatch)               ← semantic
    │
    ├─ PASS → commit
    ├─ FAIL → silent fix → re-review (up to 10 iterations)
    └─ TOO LARGE → auto-split into logical commits
```

For PRs, add a second layer:

```
Full branch diff (base..HEAD)
    │
    ▼
6-agent parallel deep review                             ← multi-voice
    │
    ├─ All clear → create PR
    ├─ CRITICAL/HIGH → fix → re-review agents only
    └─ MEDIUM/LOW → advisory (show, don't block)
```

## Commit Review (Fast)

### Step 1: Run SAST + External Review

Stage your changes, then run the review. The review loop automatically:

1. Runs available SAST tools on staged files
2. Collects smart context (changed functions, their callers, importers)
3. Finds docs that reference changed code
4. Sends everything to the external model via argus-dispatch
5. Merges SAST + LLM findings, deduplicates

### Step 2: Auto-Continue Loop (Silent)

The review loop iterates silently:

- **PASS** → proceed to commit
- **FAIL** → fix all issues, re-stage, re-run (silently, no user interaction)
- **TOO LARGE** → auto-split into smaller logical commits
- **Max iterations (10)** → stop, show summary, ask user
- **Only talk to user on:** PASS, max iterations, or error

**Convergence mechanisms:**
- Iteration history injected into next pass (prevents re-reporting fixed issues)
- Max 3 new issues per iteration (ensures convergence)
- Staged-only scope (reviews exactly what will be committed)

### Auto-Split on Large Diffs

When the diff is too large for a single review (>800 weighted lines or >8 files):

1. Read suggested file groupings from the review output
2. `git reset HEAD` — unstage all
3. Group files by module/feature
4. For each group: stage → review → fix until PASS → commit
5. Result: multiple small, logical commits with meaningful messages

**Thresholds:** Weighted lines = additions × 1.0 + deletions × 0.25 (deleted code needs minimal review). Triggers: >800 weighted OR >2000 raw lines OR >8 files. Single-file gets 2000 weighted line threshold.

## PR Review (Deep — Multi-Voice)

For PRs, add a 6-agent deep review after the fast pass. This catches cross-commit issues that per-commit review misses.

### Step 1: Fast Pass

Run the same commit review against the full `base..HEAD` diff:

```bash
# Compute the merge base
PR_BASE=${PR_BASE:-main}
MERGE_BASE=$(git merge-base "origin/${PR_BASE}" HEAD)
git diff "${MERGE_BASE}..HEAD"
```

### Step 1.5: Scope Drift Detection (Advisory)

Before the expensive multi-agent review, check branch alignment with intent:

1. **Find the plan** — search for plan/spec/design docs matching this branch
2. **Compare** — diff changed files against plan's file references
3. **Flag** two categories:
   - **Scope creep** — files changed but not in plan ("explain or trim")
   - **Missing requirements** — plan items with no corresponding changes ("deferred or forgotten?")

This is advisory only — legitimate opportunistic fixes are fine. The value is surfacing gaps for conscious decision-making.

### Step 2: 6-Agent Deep Review

Dispatch **6 parallel agents** using the Agent tool. Each reviews the full `base..HEAD` diff from a different lens. Launch all 6 in a **single message** for concurrency.

| Agent | Lens | Focus |
|-------|------|-------|
| 1 | **Guidelines** | Project conventions, naming consistency, CLAUDE.md compliance |
| 2 | **Bugs** | Logic errors, off-by-one, null/undefined, race conditions (changes only) |
| 3 | **History** | `git log` + `git blame` on changed files. Reverted changes, contradictory commits, partial refactors |
| 4 | **Cross-commit** | Inconsistent naming across commits, partial migrations, orphaned imports, incomplete renames |
| 5 | **Security** | Hardcoded secrets, injection, auth bypass, error messages leaking internals |
| 6 | **Docs-consistency** | README, docs/ accuracy vs changed code. Stale examples, wrong signatures, missing docs |

**Agent prompt template** (adapt per lens):
```
Review this PR diff for [LENS]. The diff is from base..HEAD.

## Diff
[git diff base..HEAD output]

## Project Guidelines
[relevant CLAUDE.md sections if they exist]

For each issue found, output JSON:
{"file": "path", "line": N, "severity": "CRITICAL|HIGH|MEDIUM|LOW",
 "confidence": 0-100, "description": "...", "suggestion": "..."}

Rules:
- Only report issues in CHANGED code, not pre-existing
- Confidence 0-100: 0=guess, 50=plausible, 80=likely real, 100=certain
- Do NOT report linter/type-checker issues (formatting, unused imports)
- Maximum 5 issues per agent
```

**Wait for ALL 6 agents before proceeding.** If an agent times out after 10 minutes, mark as timed-out. Never proceed while agents are still running.

### Step 3: Score and Filter

1. **Collect** all findings into one list
2. **Deduplicate** — same file + line + similar description → keep highest confidence
3. **Filter** — only surface findings with confidence >= 80
4. **Classify:**
   - CRITICAL/HIGH at 80+ confidence → **blocking** (must fix)
   - MEDIUM/LOW at 80+ confidence → **advisory** (show, don't block)
   - Below 80 confidence → **suppress**

### Step 4: Gate Decision

| Result | Action |
|--------|--------|
| Fast pass + no blocking findings | PR ready |
| Fast pass + blocking findings | Fix, re-run Step 2 only |
| Fast pass failed | Fix, re-run from Step 1 |

### Degraded States

| Failure | Handling |
|---------|----------|
| Agent times out (>10 min) | Mark timed-out. Proceed after ALL agents resolve |
| >= 4 agents returned | **4-of-6 quorum** — valid review |
| < 4 agents returned | Inconclusive — fail-closed |
| External CLI unavailable | Use Agent tool as fallback (loses model diversity) |

## SAST Integration (Deterministic)

The review automatically runs available static analysis tools before the LLM review:

| Tool | What it catches | Install |
|------|----------------|---------|
| **Semgrep** | Security vulnerabilities, code patterns | `pip install semgrep` |
| **ShellCheck** | Shell script bugs, quoting issues | `brew install shellcheck` |
| **TruffleHog** | Leaked secrets and credentials | `brew install trufflehog` |

SAST findings are deterministic (not LLM-generated) and merge with LLM findings. Missing tools are skipped gracefully — install what you can, the system adapts.

## Smart Context (Cross-File)

The review automatically collects cross-file context:
- Extracts function names from changed diff hunks
- Finds callers of changed functions across the repo
- Traces importers of changed files
- Injects this context into the review prompt

This enables the reviewer to catch broken contracts, renamed parameters, and cross-file bugs that single-file review misses.

## Docs Consistency

The review checks for doc/code mismatches:
- Finds README/docs files that reference changed code
- Injects relevant doc snippets into the review prompt
- Flags stale docs, wrong examples, missing documentation
- PR deep review includes a dedicated docs-consistency agent (Agent 6)

## Convergence System

Three mechanisms ensure the review loop converges:

1. **Scope control** — prompt includes staged diff explicitly (reviews exactly what will be committed)
2. **Iteration history** — after each FAIL, issues are saved. Next iteration's prompt includes history so the LLM won't re-report fixed issues
3. **Convergence rules** — max 3 new issues per iteration. If all previous issues fixed and no new issues found, PASS

## Review Output

JSON format:
```json
{
  "status": "PASS" | "FAIL",
  "issues": [
    {
      "file": "path",
      "line": 42,
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "security|bug|performance|style",
      "description": "What's wrong",
      "suggestion": "How to fix"
    }
  ]
}
```

## Shell-Aware Review

The review prompt includes targeted checklists for:
- **Shell scripts** — portability (shasum vs sha256sum), CWD safety, cleanup ordering, timeout fail-open, boolean normalization
- **CI/CD workflows** — GitHub Actions expression injection, supply chain risks, action pin verification
- **Documentation** — factual claims cross-referenced against code

These checklists were developed from empirical coverage audits comparing LLM-only review against paid SAST tools.

## Fallback Behavior

When no external CLI is available (argus-dispatch finds nothing):
- Fall back to the `code-reviewer` Agent (built-in Claude)
- The agent receives the same prompt (SAST findings + smart context + diff)
- Context isolation is preserved but model diversity is lost
- Log the degradation so users know true independence was not achieved

For full Argus effectiveness, install at least one external CLI.

## Integration with Argus System

| Argus Skill | Relationship |
|-------------|-------------|
| argus-dispatch | Sends review to external model for model diversity |
| argus-council | Council for architecture decisions, review for code quality |
| santa-method / santa-loop | Santa for high-stakes verification, review for per-commit quality |
| argus-design-review | Design review for plan/spec docs, argus-review for implementation code |
| verification-loop | Verification for deterministic checks (build, lint, test). Argus for semantic review. Run verification-loop first, argus-review second |

## Key Principles

1. **Review before commit** — catch issues before they enter git history
2. **Silent auto-continue** — fix and re-review without interrupting the user
3. **Layer deterministic + semantic** — SAST catches patterns, LLM catches logic
4. **Cross-file awareness** — smart context traces the blast radius of changes
5. **Split large commits** — smaller diffs = better reviews = better git history
6. **Staged-only scope** — review exactly what will be committed, nothing more
7. **Convergence guaranteed** — iteration history + max issues per round + max iterations
