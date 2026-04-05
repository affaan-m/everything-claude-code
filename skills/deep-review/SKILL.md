---
name: deep-review
description: >
  Layered code review combining SAST scanning, smart cross-file context, and
  multi-agent LLM review. Use before git commits for per-change quality and
  before PR creation for 6-agent deep review with quorum voting.
  Orchestrates existing code-reviewer and security-reviewer agents with
  deterministic analysis tools. Triggers: "deep review", "thorough review",
  "review before commit", "PR review", "layered review", or when wanting
  higher assurance than a single code-reviewer pass.
origin: ECC
---

# Deep Review — Layered Code Review

Multi-layer code review that combines deterministic SAST scanning, smart cross-file
context gathering, and multi-agent LLM review. Two modes: fast commit review with
silent auto-continue loop, and deep PR review with 6-agent quorum.

The core insight: LLM-only review catches semantic issues but misses deterministic bugs.
SAST-only catches patterns but misses logic. Smart context catches cross-file breaks
that both miss alone. Deep Review layers all three.

## When to Activate

- **Before `git commit`** — review staged changes with SAST + LLM
- **Before `gh pr create`** — deep 6-agent review of full branch diff
- **After writing significant code** — catch issues early
- **When higher assurance is needed** — beyond a single code-reviewer pass
- User says "deep review", "thorough review", "review everything"

## When NOT to Use

| Instead of deep-review... | Use... | Because... |
|---|---|---|
| Quick code quality check | code-reviewer agent | Faster, single-pass, sufficient for small changes |
| Deterministic checks only (build, lint, test) | verification-loop skill | Deep-review is for semantic review, not build verification |
| High-stakes adversarial verification | santa-method / santa-loop | Santa is dual-model adversarial; deep-review is multi-lens analytical |
| Security-specific audit | security-reviewer agent | Dedicated security specialist with OWASP checklist |
| Architecture decisions | council skill | Council deliberates; deep-review reviews code |

## Relationship to Existing Infrastructure

This skill **orchestrates** existing agents and tools — it does not replace them:

| Existing | Role in Deep Review |
|----------|-------------------|
| code-reviewer agent | Primary review agent in commit mode |
| security-reviewer agent | Agent #5 (Security lens) in PR mode |
| verification-loop | Run FIRST for deterministic checks; deep-review runs SECOND for semantic review |
| santa-method | Adversarial verification for high-stakes output; deep-review is per-commit quality |

**Recommended pipeline:**
```
verification-loop → deep-review → [optional: santa-loop for high-stakes]
```

## Architecture

### Commit Mode (Fast)

```
Staged changes (git diff --cached)
    │
    ├─→ SAST scan (deterministic)
    ├─→ Smart context (cross-file)
    ├─→ Docs context (consistency)
    │
    ▼
Agent review (code-reviewer, opus)
    │  receives: diff + SAST findings + smart context + docs refs
    │
    ├─ PASS → ready to commit
    ├─ FAIL → silent fix → re-review (max 10 iterations)
    └─ TOO LARGE → auto-split into logical commits
```

### PR Mode (Deep)

```
Full branch diff (base..HEAD)
    │
    ├─→ Fast pass (same as commit mode on full diff)
    │
    ▼
6-agent parallel deep review
    │  each reviews from a different analytical lens
    │
    ├─ All clear (4-of-6 quorum) → ready for PR
    ├─ CRITICAL/HIGH blocking → fix → re-run agents
    └─ MEDIUM/LOW advisory → show, don't block
```

---

## Commit Review Process

### Step 1: Gather SAST Findings

Run available static analysis tools on staged files. Skip gracefully if not installed.

```bash
# Check which tools are available
command -v semgrep >/dev/null 2>&1 && HAVE_SEMGREP=true
command -v shellcheck >/dev/null 2>&1 && HAVE_SHELLCHECK=true
command -v trufflehog >/dev/null 2>&1 && HAVE_TRUFFLEHOG=true

# Run available tools on staged files
STAGED=$(git diff --cached --name-only)
```

| Tool | What it catches | Run on |
|------|----------------|--------|
| Semgrep | Security vulnerabilities, code patterns | `.js`, `.ts`, `.py`, `.go`, `.java`, etc. |
| ShellCheck | Shell script bugs, quoting issues | `.sh`, `.bash` |
| TruffleHog | Leaked secrets and credentials | All staged files |

Collect all SAST findings into a structured list:
```
SAST Finding: [tool] [severity] [file:line] [description]
```

If no SAST tools are installed, note this and proceed with LLM-only review.

### Step 2: Gather Smart Context

Extract cross-file context that helps the reviewer understand the blast radius:

1. **Changed functions**: Parse the diff hunks to extract function/method names that were modified
2. **Callers**: Use Grep to find call sites of changed functions across the repo
3. **Importers**: Use Grep to find files that import changed modules
4. **Docs references**: Use Grep to find README/docs files that reference changed code

Combine into a context block (max ~3000 tokens to stay within agent prompt limits):

```markdown
## Cross-File Context

### Changed Functions
- `validateInput()` in src/parser.js (modified)

### Callers of Changed Functions
- src/api/handler.js:42 — calls validateInput()
- src/cli/main.js:18 — calls validateInput()

### Docs Referencing Changed Code
- README.md:85 — documents validateInput() behavior
```

### Step 3: Agent Review

Launch a single review agent with all gathered context:

```
Agent(
  subagent_type: "code-reviewer",
  model: "opus",
  prompt: """
  Review this staged diff for code quality issues.

  ## Staged Diff
  {git diff --cached output}

  ## SAST Findings (Deterministic)
  {SAST findings from Step 1, or "No SAST tools available"}

  ## Cross-File Context
  {smart context from Step 2}

  ## Docs References
  {docs referencing changed code}

  For each issue found, output:
  - file, line, severity (CRITICAL/HIGH/MEDIUM/LOW)
  - confidence (0-100)
  - description and suggested fix

  Rules:
  - Only report issues in CHANGED code, not pre-existing
  - Confidence 0-100: 80+ = report, below 80 = suppress
  - Merge with SAST findings — don't duplicate what SAST already caught
  - Maximum 10 issues
  """
)
```

### Step 4: Silent Auto-Continue Loop

If the review returns issues:

1. **Fix all reported issues** — apply fixes to the staged files
2. **Re-stage** — `git add` the fixed files
3. **Re-review** — run Step 3 again with updated diff

**Loop silently** — do not interrupt the user between iterations. Only communicate on:
- **PASS** — all clear, ready to commit
- **Max iterations reached** — show remaining issues, ask user
- **Error** — tool failure, explain and ask user

**Convergence mechanisms:**

| Mechanism | Purpose |
|-----------|---------|
| Iteration history | Inject previous issues into next review prompt ("these were fixed: [list]") to prevent re-reporting |
| Max 3 new issues per iteration | Prevents scope creep where each fix triggers new findings |
| Max 10 iterations | Hard stop to prevent runaway loops |
| Staged-only scope | Reviews exactly what will be committed, nothing more |

### Step 5: Auto-Split Large Diffs

When the staged diff exceeds size thresholds, split into multiple commits:

**Thresholds** (any triggers split):
- \> 800 weighted lines (additions x 1.0 + deletions x 0.25)
- \> 2000 raw lines
- \> 8 files

**Split process:**
1. Read the diff to identify logical groupings (by module, feature, or dependency order)
2. `git reset HEAD` — unstage all
3. For each group: `git add [files]` → review → fix until PASS → commit with descriptive message
4. Result: multiple small, logical commits with clean review history

**Single-file exception:** If a single file exceeds 2000 weighted lines, review it
as-is (splitting a single file into multiple commits rarely makes sense).

---

## PR Review Process (Deep)

For PRs, add a 6-agent deep review after the fast pass. This catches cross-commit
issues that per-commit review misses.

### Step 1: Fast Pass

Run the commit review process (Steps 1-4 above) against the full branch diff:

```bash
PR_BASE=${PR_BASE:-main}
MERGE_BASE=$(git merge-base "origin/${PR_BASE}" HEAD)
git diff "${MERGE_BASE}..HEAD"
```

### Step 2: Scope Drift Detection (Advisory)

Before the expensive multi-agent review, check branch alignment with intent:

1. **Find the plan** — search for plan/spec/design docs matching this branch name
2. **Compare** — diff changed files against the plan's file references
3. **Flag** two categories:
   - **Scope creep** — files changed but not in plan ("explain or trim")
   - **Missing requirements** — plan items with no corresponding changes ("deferred or forgotten?")

This is **advisory only** — legitimate opportunistic fixes are fine. The value is
surfacing gaps for conscious decision-making.

### Step 3: 6-Agent Deep Review

Dispatch 6 parallel agents using the Agent tool. Each reviews the full branch diff
from a different analytical lens. Launch all 6 in a **single message** for concurrency.

| # | Lens | Agent Config | Focus |
|---|------|-------------|-------|
| 1 | **Guidelines** | `general-purpose` | Project conventions, naming consistency, CLAUDE.md compliance |
| 2 | **Bugs** | `general-purpose` | Logic errors, off-by-one, null/undefined, race conditions |
| 3 | **History** | `general-purpose` | `git log` + `git blame` on changed files. Reverted changes, contradictory commits, partial refactors |
| 4 | **Cross-commit** | `general-purpose` | Inconsistent naming across commits, partial migrations, orphaned imports, incomplete renames |
| 5 | **Security** | `subagent_type: "security-reviewer"` | Hardcoded secrets, injection, auth bypass, error messages leaking internals |
| 6 | **Docs-consistency** | `general-purpose` | README/docs accuracy vs changed code. Stale examples, wrong signatures, missing docs |

**Agent prompt template** (adapt per lens):

```
Review this PR diff for [{LENS}]. The diff covers all changes from base to HEAD.

## Diff
{git diff base..HEAD output}

## Project Guidelines
{relevant CLAUDE.md sections, if they exist}

For each issue found, output JSON:
{"file": "path", "line": N, "severity": "CRITICAL|HIGH|MEDIUM|LOW",
 "confidence": 0-100, "description": "...", "suggestion": "..."}

Rules:
- Only report issues in CHANGED code, not pre-existing
- Confidence 0-100: below 80 = suppress
- Do NOT report formatting or linter issues
- Maximum 5 issues per agent
```

**Wait for ALL 6 agents.** If an agent times out (>10 min), mark as timed-out but
do not cancel others.

### Step 4: Score and Filter

1. **Collect** all findings into one list
2. **Deduplicate** — same file + line + similar description → keep highest confidence
3. **Filter** — only surface findings with confidence >= 80
4. **Classify:**

| Confidence | Severity | Action |
|------------|----------|--------|
| >= 80 | CRITICAL/HIGH | **Blocking** — must fix before PR |
| >= 80 | MEDIUM/LOW | **Advisory** — show, don't block |
| < 80 | Any | **Suppress** — not shown |

### Step 5: Gate Decision

| Result | Action |
|--------|--------|
| Fast pass clean + no blocking findings | **PR ready** |
| Blocking findings from deep review | Fix → re-run Step 3 only (not full fast pass) |
| Fast pass failed | Fix → re-run from Step 1 |

### Quorum Rules

| Agents Returned | Verdict |
|----------------|---------|
| 6 of 6 | Full review — highest confidence |
| 4-5 of 6 | **Valid review** — quorum met |
| < 4 of 6 | **Inconclusive** — fail-closed, investigate timeouts |

---

## Shell-Aware Review Checklists

The review prompt includes targeted checklists based on file types in the diff:

**Shell scripts (.sh, .bash):**
- Portability: `shasum` vs `sha256sum`, `timeout` vs `gtimeout`
- CWD safety: does script `cd` without restoring?
- Cleanup ordering: are temp files cleaned on all exit paths?
- Boolean normalization: `[[ "$VAR" == "true" ]]` vs `[[ -n "$VAR" ]]`

**CI/CD workflows (.yml in .github/):**
- GitHub Actions expression injection (`${{ }}` in run blocks)
- Action version pinning (SHA vs tag)
- Secret exposure in logs

**Markdown (.md):**
- Factual claims cross-referenced against code
- Code examples that reference real functions/files

---

## Review Output Format

Both commit and PR modes produce findings in this format:

```json
{
  "status": "PASS | FAIL",
  "mode": "commit | pr",
  "iteration": 1,
  "issues": [
    {
      "file": "path/to/file.js",
      "line": 42,
      "severity": "CRITICAL | HIGH | MEDIUM | LOW",
      "confidence": 85,
      "source": "sast-semgrep | sast-shellcheck | sast-trufflehog | llm-review | agent-N",
      "category": "security | bug | performance | style | docs",
      "description": "What is wrong",
      "suggestion": "How to fix"
    }
  ]
}
```

---

## Anti-Patterns

| Trap | Fix |
|------|-----|
| Running deep-review on trivial 2-line changes | Use code-reviewer agent directly. Deep-review overhead is not justified. |
| Skipping verification-loop and going straight to deep-review | Deterministic checks first. Don't waste LLM tokens on build errors. |
| Treating advisory findings as blocking | MEDIUM/LOW are advisory. Only CRITICAL/HIGH at 80+ confidence block. |
| Re-running all 6 agents when only one finding needs fixing | After fixing blocking findings, re-run Step 3 only, not the full pipeline. |
| Ignoring SAST findings because LLM "also covers security" | SAST is deterministic — zero false negatives for its patterns. LLMs hallucinate. |

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| verification-loop | Run verification-loop FIRST (build, lint, test, type-check). Deep-review runs SECOND (semantic review). |
| santa-method | Deep-review is per-commit quality; Santa is adversarial dual-model verification for high-stakes output. |
| code-reviewer agent | Deep-review uses code-reviewer as its primary review agent in commit mode. |
| security-reviewer agent | Deep-review uses security-reviewer as Agent #5 in PR mode. |
| council | Council for "should we?" decisions; deep-review for "is this code right?" |
| design-review | Design-review for plan/spec docs; deep-review for implementation code. |
| continuous-learning-v2 | Recurring review findings can evolve into instincts. |
