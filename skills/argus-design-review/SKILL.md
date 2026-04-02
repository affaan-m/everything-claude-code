---
name: argus-design-review
description: >
  Three-tier design document review with Claude as arbiter. Two external models
  review in parallel, Claude validates their findings against the codebase.
  Use after writing implementation plans, architecture documents, or design specs,
  before implementation begins. Part of the Argus multi-model review system.
origin: "Chris Yau (@chris-yyau)"
---

# Argus Design Review

Three-tier design document review: two external models review in parallel, Claude validates their findings against the codebase and renders the verdict.

The core insight: mechanical consensus (keyword matching across reviews) doesn't work — reviewers use different terminology for the same issues. Claude, with codebase context, is the only entity that can validate whether a reviewer's claim is real. Claude IS the consensus mechanism.

## When to Use

**Use for:**
- Implementation plans (PLAN.md, roadmaps, feature specs)
- Architecture documents (system designs, API specs, data models)
- Major refactoring plans or structural decisions

**Don't use for:**
- Code review (use argus-review instead)
- Documentation review (not technical decisions)
- Already-implemented features (too late for design review)

## Architecture

```
Design document (PLAN.md, DESIGN.md, etc.)
    │
    ├─→ Reviewer 1 (via argus-dispatch) ─┐
    │                                      ├─→ Claude Arbiter
    └─→ Reviewer 2 (via argus-dispatch) ─┘    (codebase context)
                                                    │
                                              ┌─────┴─────┐
                                           no HIGH/MEDIUM?
                                              │           │
                                            PASS       Fix issues
                                              │        → iterate
                                         Implement      │
                                                    (max 5 rounds)
```

**Three tiers:**
1. **External Reviewers 1 + 2**: Run in parallel as independent comprehensive reviewers (via argus-dispatch)
2. **Claude Arbiter**: Validates their findings against the codebase
3. **Claude's verdict**: The sole convergence signal — no mechanical consensus

## Process

### Step 1: Initialize Review

Create a review state for the design file:
- State file tracks: iteration number, reviewer statuses, progress (severity counts)
- Stale review detection: reviews older than 2 hours can be cleaned up

### Step 2: Run External Reviewers (Parallel)

Dispatch two reviewers via argus-dispatch in parallel. If no external CLIs are available, fall back to two Claude Agent instances (context isolation preserved, model diversity lost).

Both reviewers receive:
- The full design document
- A comprehensive review prompt covering: strategic, technical, integration, and maintainability aspects
- Confidence scoring guidelines (0.0-1.0)
- Strict JSON output format requirement

**Reviewer JSON output:**
```json
{
  "status": "PASS" | "FAIL",
  "reviewer_id": "reviewer-1 | reviewer-2",
  "issues": [
    {
      "section": "Section name or line reference",
      "severity": "high|medium|low",
      "confidence": 0.0-1.0,
      "category": "clarity|completeness|architecture|feasibility|consistency",
      "description": "Clear, specific description",
      "suggestion": "Actionable fix"
    }
  ],
  "metadata": {
    "run_id": "a1b2c3d4",
    "iteration": 1,
    "spec_hash": "sha256-of-design-file"
  }
}
```

### Step 3: Claude Validation (Arbiter)

Claude validates the external reviewers' findings against the codebase:

1. **Read** both reviewer outputs
2. **Validate** each claim using Read, Grep, Glob tools to examine actual code
3. **Classify** each finding with a validation type:
   - `confirms_reviewer_1` / `confirms_reviewer_2` — agrees with finding
   - `new_finding` — found issue they both missed
   - `contradicts_reviewer_1` / `contradicts_reviewer_2` — disagrees, explains why
4. **Score** confidence based on codebase evidence (not reviewer confidence)

**Claude's verdict** becomes the convergence signal. External reviewers provide perspectives; Claude determines truth.

### Step 4: Progress Analysis

Replaces binary FAIL/PASS with explicit severity breakdown:

| Status | Meaning | Action |
|--------|---------|--------|
| `blocked_by_high_issues` | HIGH severity issues remain | Must fix |
| `medium_issues_remaining` | MEDIUM severity remain | Should fix |
| `low_issues_only` | Only LOW severity | PASS — proceed |
| `passed` | No issues | PASS — proceed |

Progress is visible across iterations: "iteration 1: 6 high → iteration 2: 2 high → iteration 3: 0 high"

**Completion criteria:** Claude's verdict has no HIGH or MEDIUM issues with confidence >= 0.5

### Step 5: Fix and Iterate (if needed)

If issues remain:
1. Update the design document to address findings
2. Re-run reviewers with fresh agents (no memory of previous round)
3. Claude re-validates

**Max 5 iterations** to prevent infinite loops.

## Freshness Contract

Every reviewer output includes provenance metadata:

```json
{
  "metadata": {
    "run_id": "a1b2c3d4",
    "iteration": 2,
    "spec_hash": "sha256-of-design-file",
    "review_duration_ms": 120000
  }
}
```

- All outputs must share the same `run_id` — stale outputs are rejected
- `spec_hash` ensures the reviewed version matches the current file
- Stale artifacts from previous iterations are cleaned before each round

## Confidence Scoring

| Range | Meaning | Criteria |
|-------|---------|----------|
| 0.9-1.0 | Certain | Clear violation with cited evidence |
| 0.7-0.9 | Very likely | Strong evidence but some ambiguity |
| 0.5-0.7 | Probable | Moderate evidence, could be design choice |
| 0.3-0.5 | Uncertain | Weak evidence, needs clarification |
| 0.0-0.3 | Speculative | No strong evidence, just a concern |

### Display Rules

| Confidence | Display |
|------------|---------|
| >= 0.7 | Show in main report |
| 0.5 to < 0.7 | Show with caveat: "Medium confidence — verify" |
| 0.3 to < 0.5 | Suppress from main report, show in appendix |
| < 0.3 | Suppress entirely unless severity is HIGH |

Low-confidence findings remain in JSON artifacts for auditability — never deleted from stored outputs.

### Calibration-to-Instinct Bridge

When the user confirms a low-confidence finding (0.3-0.5) was real, log the corrected pattern:

```markdown
**Pattern:** {what the finding was about}
**Original confidence:** {0.X} | **Correct confidence:** {0.X+0.2}
**Why underconfident:** {why stronger evidence wasn't seen}
**How to apply:** Start at corrected confidence for similar patterns
```

End each report's appendix with: "**Calibration check:** Were any appendix findings actually real? If so, I'll log corrected confidence for future reviews."

This compounds review quality over time.

## Error Handling

| Situation | Treatment |
|-----------|-----------|
| Reviewer JSON has `"error"` key | Treat as `"status": "FAIL"` |
| Reviewer JSON fails to parse | Treat as `"status": "FAIL"` |
| Reviewer file missing after timeout | Treat as `"status": "FAIL"` — never skip |
| `run_id` doesn't match current run | Reject as stale (fail-closed) |
| Both reviewers resolve to same CLI | Single-reviewer mode (one execution, logged as degradation) |
| No external CLIs available | Two Claude Agent instances (context isolation only) |

**Never** treat malformed or error JSON as implicit PASS — that's a critical bypass.

## Version History

**v3 (current):** Claude-as-arbiter model. Parallel external reviewers via argus-dispatch. Run-scoped isolation. Freshness contracts. Atomic writes. Explicit progress model.

**v2:** Three-tier with Jaccard consensus. Achieved 0% consensus match rate — reviewers use different terminology. Claude's manual cross-referencing was doing all real work. Led to the arbiter model.

**v1:** Strategic + Technical reviewer with manual triage.

## Integration with Argus System

| Argus Skill | Relationship |
|-------------|-------------|
| argus-dispatch | Sends design doc to external models for review |
| argus-review | argus-review for code, argus-design-review for plans/specs |
| argus-council | Council for "should we?" decisions, design-review for "is the plan sound?" |
| verification-loop | Run verification-loop for deterministic checks after implementation |
