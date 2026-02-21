---
description: Audit all skills with quality scoring (6 dimensions) + usage stats + consolidation decisions. Combines evaluation and stocktaking in one pass.
---

# /skill-stocktake - Skill Audit with Quality Evaluation

Audit all installed skills by quality scoring while taking inventory. Uses scores as evidence for consolidate, retire, or improve decisions.

## Scope

- `~/.claude/skills/` — Global skills (SKILL.md + learned/)
- `{current_project}/.claude/skills/` — Project-level skills (if present)

## Phase 1: Inventory & Usage Stats

1. Read all skill files under `~/.claude/skills/` using the `**/*.md` glob pattern. If `{current_project}/.claude/skills/` exists, include those files as well.
2. Extract `name`, `origin`, and `description` from each file's frontmatter
3. **Optional:** If using Claude Code observability tools (e.g., `~/.claude/homunculus/observations.jsonl`), extract usage counts per skill by filtering entries where `tool == "Read"` and the input path contains the skill path. Count references over the last 7 and 30 days. Otherwise, skip and proceed to quality evaluation.
4. Output an inventory table:

| Skill | Origin | 7d | 30d | Description |
|-------|--------|----|-----|-------------|

## Phase 2: Quality Evaluation (6 Dimensions)

Score each skill using the rubric below. Apply full scoring to `learned/` skills and to top-level skills with `origin: original` or `origin: skill-create`. For ECC-sourced skills (`origin: ECC`), check Freshness only. Skills with an absent or unrecognized `origin` value receive full scoring (treat as `origin: original`).

### Rubric

**Specificity**

| Score | Criteria |
|-------|----------|
| 1 | Abstract principles only — no code examples, commands, or config samples |
| 2 | Conceptual explanation present but code examples sparse; implementation unclear |
| 3 | Representative code example present; lacks comprehensive coverage |
| 4 | Multiple concrete code examples and commands; immediately referenceable |
| 5 | Rich examples covering virtually all usage patterns |

**Actionability**

| Score | Criteria |
|-------|----------|
| 1 | Unclear what to do after reading |
| 2 | Direction present but steps are fragmented |
| 3 | Main steps are understandable; some gaps require inference |
| 4 | Ready to act immediately after reading |
| 5 | Immediately actionable; edge cases and pitfalls covered |

**Scope Fit**

| Score | Criteria |
|-------|----------|
| 1 | Too broad (no focus) or too narrow (rarely triggered) |
| 2 | Scope is off but core content is useful |
| 3 | Mostly appropriate; some boundary ambiguity |
| 4 | Clear scope, focused on the target task |
| 5 | Scope perfectly defined; name, trigger, and content fully aligned |

**Non-redundancy**

| Score | Criteria |
|-------|----------|
| 1 | Nearly identical to another skill — no reason to exist separately |
| 2 | Heavy overlap; unique value is limited |
| 3 | Some overlap but a unique perspective exists |
| 4 | Clearly differentiated from other skills |
| 5 | Completely unique value |

**Coverage**

| Score | Criteria |
|-------|----------|
| 1 | Covers only a small fraction of the target task |
| 2 | Basic cases present; commonly encountered variants missing |
| 3 | Main cases covered; edge cases insufficient |
| 4 | Main cases fully covered; some edge cases included |
| 5 | Main cases, edge cases, and pitfalls all covered |

**Freshness** — verify with WebSearch

| Score | Criteria |
|-------|----------|
| 1 | Most referenced tools/APIs are deprecated or removed |
| 2 | Multiple elements are deprecated or significantly changed |
| 3 | Core content is valid; some updates needed |
| 4 | Almost entirely valid; minor tweaks only |
| 5 | All technical elements are current |
| N/A | No technical elements (communication patterns, etc.) |

Check Freshness via WebSearch only for skills that reference tools, CLI flags, libraries, or APIs.

## Phase 3: Score Summary and Decisions

Output the scores table:

| Skill | Spec | Act | Scope | NonRed | Cov | Fresh | Total | Used 7d | Decision |
|-------|------|-----|-------|--------|-----|-------|-------|---------|----------|

**Decision criteria** (apply the first matching row):

| Condition | Recommended Action |
|-----------|-------------------|
| origin: `ECC` | **Keep** if Freshness ≥ 3 or N/A; **Update** if Freshness ≤ 2 — do not modify other content |
| origin: `auto-extracted` AND duplicates content in MEMORY.md | **Delete** — remove immediately |
| Total ≥ 20 AND Freshness ≥ 3 AND usage present | **Keep** — maintain as-is |
| Total ≥ 20 AND Freshness ≥ 3 AND zero usage | **Watch** — monitor until next audit |
| Freshness ≤ 2 | **Update** — refresh outdated content (takes priority over Improve/Retire) |
| Total 15–19 | **Improve** — address lowest-scoring dimensions |
| Total < 15 OR Non-redundancy ≤ 2 | **Retire/Merge** — delete or merge into existing skill |

> **Freshness = N/A handling:** When a skill has no technical elements (Freshness = N/A), display `N/A` in the Fresh column and calculate Total from the remaining 5 dimensions only (max 25). Skip the Freshness ≤ 2 and Freshness ≥ 3 conditions. Use adjusted thresholds: Keep ≥ 17 (with usage) / Watch ≥ 17 (zero usage), Improve 13–16, Retire/Merge < 13.

## Phase 4: Consolidation

1. **Confirm with the user** before executing any Retire/Merge action, then archive or merge flagged skills
2. For Improve candidates: propose specific improvements and ask user to confirm before editing
3. For Update candidates: present updated content for review
4. Check line count of MEMORY.md; if over 100 lines, suggest compaction

## Notes

- ECC-sourced skills (`origin: ECC`) — check Freshness only; do not modify content
- Skills from external repositories (`origin: {org/repo}`) receive full scoring like `origin: original`
- Always confirm with the user before deleting or merging any skill
- Keep total skill count in mind: beyond ~60 skills, descriptions may be truncated in Claude's context window
