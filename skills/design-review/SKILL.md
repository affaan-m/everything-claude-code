---
name: design-review
description: >
  Multi-perspective design document review with Claude as arbiter. Two independent
  reviewer agents examine plans/specs in parallel, then Claude validates their findings
  against the actual codebase. Use after writing implementation plans, architecture docs,
  or design specs — before implementation begins. Complements planner/architect agents
  (they create designs, this validates them). Triggers: "review this design", "review
  this plan", "is this spec sound?", "design review", "spec review", after planner
  produces a plan.
origin: ECC
---

# Design Review — Multi-Perspective Design Validation

Two independent reviewer agents examine a design document in parallel, then Claude
validates their findings against the actual codebase and renders the verdict. Claude
is the arbiter — not a mechanical consensus algorithm.

The core insight: mechanical consensus (keyword matching across reviews) does not work.
Reviewers use different terminology for the same issues — Jaccard matching achieves ~0%
match rate in practice. Claude, with access to both reviews AND the codebase, is the
only entity that can validate whether a reviewer's claim is real. Claude IS the consensus
mechanism.

## When to Activate

- **After planner creates an implementation plan** — validate before coding
- **After writing architecture documents** — check for gaps and contradictions
- **After producing design specs** — verify feasibility against codebase
- **Before major refactoring** — validate the refactoring plan
- User says "review this design", "review this plan", "is this spec sound?"

## When NOT to Use

| Instead of design-review... | Use... | Because... |
|---|---|---|
| Reviewing code (not plans) | deep-review | Design-review is for documents, not implementations |
| Making the design decision | council skill | Council explores options; design-review validates the chosen option |
| Creating the plan | planner agent | Planner creates; design-review validates |
| Verifying build/lint/test | verification-loop | Deterministic checks, not semantic review |

## Workflow Integration

```
council → decide approach → planner → create plan → design-review → validate plan → implement → deep-review → commit
```

Design-review sits between planning and implementation. It catches issues in the plan
BEFORE engineering effort is spent building the wrong thing.

## Architecture

```
Design document (PLAN.md, DESIGN.md, spec)
    │
    ├─→ Reviewer 1: Agent(model: "sonnet", fresh context)  ─┐
    │                                                         ├─→ Claude Arbiter
    └─→ Reviewer 2: Agent(model: "haiku", fresh context)   ─┘    (in-context)
                                                                       │
                                                                 validates against
                                                                    codebase
                                                                       │
                                                              ┌────────┴────────┐
                                                           no HIGH/MED       issues remain
                                                           (conf >= 0.5)         │
                                                              │              fix → iterate
                                                            PASS             (max 5 rounds)
                                                              │
                                                          implement
```

## Process

### Step 1: Initialize Review

Identify the design document to review:
- From skill args (file path or inline spec)
- Or infer from conversation context (most recent plan/design doc)

Read the full document. Compute a content hash for freshness tracking:

```bash
# Compute spec hash for freshness contract
SPEC_HASH=$(shasum -a 256 "$DESIGN_FILE" | cut -d' ' -f1 | head -c 16)
RUN_ID=$(date +%s)-$$
```

### Step 2: Run Two Independent Reviewers (Parallel)

Launch both reviewers in a **single message with 2 Agent tool calls**.

**Reviewer 1** — Sonnet (broader analytical reasoning):

```
Agent(
  model: "sonnet",
  description: "Design Review — Reviewer 1",
  prompt: """
  You are an independent reviewer of a design document. You have NO prior
  context about this project. Review the document below for issues across
  these dimensions:

  1. **Clarity** — Are requirements unambiguous? Could two engineers interpret
     them differently?
  2. **Completeness** — Are there missing steps, undefined behaviors, or
     unhandled edge cases?
  3. **Architecture** — Are the proposed patterns appropriate? Any structural
     concerns?
  4. **Feasibility** — Can this realistically be built as described? Any
     hidden complexity?
  5. **Consistency** — Do all sections agree? Any contradictions?

  ## Design Document
  {full document content}

  ## Output Format (STRICT — return valid JSON)
  {
    "status": "PASS" | "FAIL",
    "reviewer_id": "reviewer-1",
    "issues": [
      {
        "section": "Section name or line reference",
        "severity": "high" | "medium" | "low",
        "confidence": 0.0-1.0,
        "category": "clarity | completeness | architecture | feasibility | consistency",
        "description": "Clear, specific description of the issue",
        "suggestion": "Actionable fix"
      }
    ],
    "metadata": {
      "run_id": "{RUN_ID}",
      "iteration": {N},
      "spec_hash": "{SPEC_HASH}"
    }
  }

  Rules:
  - Be specific: cite sections, quote problematic text
  - Confidence 0.0-1.0: 0.9+ = certain, 0.5-0.7 = probable, <0.3 = speculative
  - Maximum 8 issues
  - If the document is well-designed, return status: "PASS" with empty issues array
  """
)
```

**Reviewer 2** — Haiku (faster, more direct, different tradeoff surface):

Same prompt structure as Reviewer 1 but with `model: "haiku"` and
`"reviewer_id": "reviewer-2"`. Haiku's directness often catches practical
feasibility issues that deeper reasoning overlooks.

### Step 3: Claude Arbiter (Validate Against Codebase)

After both reviewers return, Claude validates their findings:

1. **Read** both reviewer outputs
2. **For each finding**, validate the claim using Read, Grep, Glob tools:
   - Does the referenced section actually say what the reviewer claims?
   - Does the codebase support or contradict the reviewer's concern?
   - Is the suggested fix feasible given the existing architecture?
3. **Classify** each finding:

| Classification | Meaning |
|---|---|
| `confirmed` | Codebase evidence supports the finding |
| `new_finding` | Arbiter found an issue both reviewers missed |
| `rejected` | Codebase evidence contradicts the finding — explain why |
| `needs_clarification` | Cannot determine without more context |

4. **Score** confidence based on codebase evidence (override reviewer confidence if warranted)

### Step 4: Progress Analysis

Replace binary PASS/FAIL with explicit severity breakdown:

| Status | Meaning | Action |
|--------|---------|--------|
| `blocked_by_high` | HIGH severity confirmed issues remain | Must fix before implementing |
| `medium_remaining` | MEDIUM severity confirmed issues remain | Should fix |
| `low_only` | Only LOW severity | PASS — proceed to implementation |
| `passed` | No confirmed issues | PASS — proceed |

**Completion criteria:** Arbiter's verdict has no HIGH or MEDIUM issues with
confidence >= 0.5 remaining.

Track progress across iterations: "iteration 1: 3 high, 2 medium → iteration 2: 0 high, 1 medium → iteration 3: passed"

### Step 5: Fix and Iterate (if needed)

If confirmed issues remain:

1. Update the design document to address findings
2. Re-run Step 2 with **fresh reviewer agents** (no memory of previous round)
3. Arbiter re-validates

**Max 5 iterations** to prevent infinite loops. If still blocked after 5, present
remaining issues and ask the user to decide.

## Confidence Scoring

| Range | Meaning | Criteria |
|-------|---------|----------|
| 0.9-1.0 | Certain | Clear violation with cited evidence from codebase |
| 0.7-0.9 | Very likely | Strong evidence but some ambiguity |
| 0.5-0.7 | Probable | Moderate evidence, could be a deliberate design choice |
| 0.3-0.5 | Uncertain | Weak evidence, needs clarification |
| 0.0-0.3 | Speculative | No strong evidence, just a concern |

### Display Rules

| Confidence | Display |
|------------|---------|
| >= 0.7 | Show in main report |
| 0.5 to < 0.7 | Show with caveat: "Medium confidence — verify with author" |
| 0.3 to < 0.5 | Suppress from main report, include in appendix |
| < 0.3 | Suppress entirely unless severity is HIGH |

Low-confidence findings remain in the iteration record for auditability — never deleted.

### Calibration-to-Instinct Bridge

When the user confirms a low-confidence finding (0.3-0.5) was actually real, save a
calibration record to the project's auto-memory:

```markdown
**Pattern:** {what the finding was about}
**Original confidence:** {0.X} | **Correct confidence:** {0.X + 0.2}
**Why underconfident:** {why stronger evidence wasn't available}
**How to apply:** Start at corrected confidence for similar patterns in future reviews
```

End each report's appendix with: "**Calibration check:** Were any appendix findings
actually real? If so, I'll log corrected confidence for future reviews."

This compounds review quality over time — each correction makes future reviews more
accurately calibrated.

## Freshness Contracts

Every reviewer output includes provenance metadata:

```json
{
  "metadata": {
    "run_id": "1712345678-42",
    "iteration": 2,
    "spec_hash": "a1b2c3d4e5f61234"
  }
}
```

**Validation rules:**
- All outputs in the same iteration must share the same `run_id` — reject stale outputs
- `spec_hash` must match the current document — reject reviews of outdated versions
- If validation fails, re-run the reviewers rather than using stale data

## Verdict Format

```markdown
## Design Review: [document name]

**Status:** [blocked_by_high | medium_remaining | low_only | passed]
**Iteration:** [N] of 5
**Spec hash:** [first 8 chars]

### Confirmed Findings

| # | Severity | Confidence | Section | Description | Source |
|---|----------|------------|---------|-------------|--------|
| 1 | HIGH | 0.85 | "Data Model" | Missing foreign key constraint | Reviewer 1 (confirmed) |
| 2 | MEDIUM | 0.72 | "API Design" | No pagination for list endpoint | Arbiter (new finding) |

### Rejected Findings

| # | Reviewer | Section | Why Rejected |
|---|----------|---------|-------------|
| 1 | Reviewer 2 | "Auth Flow" | Codebase already uses JWT middleware — concern invalid |

### Appendix (Low-Confidence)
[findings with confidence 0.3-0.5, shown for transparency]

**Calibration check:** Were any appendix findings actually real? If so, I'll log
corrected confidence for future reviews.

### Progress
iteration 1: 3 high, 2 medium → iteration 2: ...
```

## Error Handling

| Situation | Treatment |
|-----------|-----------|
| Reviewer returns malformed JSON | Treat as FAIL — never as implicit PASS |
| Reviewer returns `"error"` key | Treat as FAIL, log error, re-run if retries remain |
| Reviewer file missing after timeout | Treat as FAIL — never skip a reviewer |
| `run_id` mismatch | Reject as stale — fail-closed |
| Both reviewers are same model (only one model available) | Proceed but log: "single-model mode — perspective diversity reduced" |
| Document is too short for meaningful review (<50 words) | Skip review, note: "document too brief for multi-perspective review" |

## Anti-Patterns

| Trap | Fix |
|------|-----|
| Running design-review on already-implemented features | Too late for design review. Use deep-review on the code instead. |
| Using design-review as a substitute for testing | Design-review validates plans, not implementations. |
| Ignoring the calibration-to-instinct bridge | Each "actually real" confirmation makes future reviews better. |
| Treating all reviewer findings as ground truth | Reviewers speculate. The arbiter validates against code. Trust the arbiter. |
| Skipping the arbiter and just merging reviewer outputs | Without codebase validation, ~40% of findings are false positives. |

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| planner | Planner creates plans. Design-review validates them. Run design-review AFTER planner. |
| architect | Architect designs systems. Design-review validates the design doc. |
| council | Council decides WHICH approach. Design-review validates HOW the chosen approach is specified. |
| deep-review | Design-review for plan/spec docs. Deep-review for implementation code. |
| verification-loop | Deterministic checks on code. Design-review is semantic review on plans. |
| santa-method | Santa verifies output correctness. Design-review verifies plan quality. |
| architecture-decision-records | Design-review findings can inform ADR updates. |
| continuous-learning-v2 | Calibration corrections compound into instincts for better future reviews. |
