---
description: "Restate requirements, ground in the codebase, and produce a step-by-step implementation plan. WAIT for CONFIRM before touching code."
argument-hint: "[feature description | path/to/*.prd.md]"
---

# Plan Command

Invokes the **planner** agent to produce a confirmed implementation plan before any code is written.

Single responsibility: turn a requirement (free-form or PRD) into an actionable plan grounded in the actual codebase, then stop at a confirmation gate.

## Input Detection

Parse `$ARGUMENTS`:

| Input | Mode | Behavior |
|---|---|---|
| Path ending in `.prd.md` | **Artifact mode** | Parse PRD, pick next pending phase, write `.claude/plans/{name}.plan.md` |
| Path to any other `.md` file | **Reference mode** | Read file as context, plan conversationally |
| Free-form text | **Conversational mode** | Plan in-chat, no artifact |
| Empty | Ask user what to plan | — |

In **Artifact mode**, also update the PRD: flip the selected phase from `pending` → `in-progress` and record the plan path.

## Workflow

1. **Restate** — One-paragraph restatement of the requirement. If the restatement exposes ambiguity, stop and ask before proceeding.
2. **Ground** — Search the codebase for existing patterns the new code must mirror (see Pattern Grounding below).
3. **Plan** — Break into phases with dependencies, risks, and complexity estimate.
4. **Confirm** — Present the plan. Do NOT write code until the user replies `yes`, `proceed`, or an equivalent affirmative.

## Pattern Grounding

Before writing the plan, search the codebase for conventions the new code must follow. Capture the top example for each category with a `file:lines` reference:

| Category | What to capture |
|---|---|
| Naming | File, function, and type naming conventions in the affected area |
| Error handling | How errors are raised, propagated, and surfaced to users |
| Logging | Levels, format, and what gets logged |
| Data access | Repository / service / query patterns |
| Tests | Test file location, framework, assertion style |

If no similar code exists, state this explicitly — do not invent a pattern.

## Plan Output

### Conversational mode

Present the plan inline in this format:

```
# Implementation Plan: {feature}

## Requirements Restatement
{one paragraph}

## Phases
### Phase 1: {name}
- Goal, files affected, success signal

### Phase 2: {name}
- ...

## Patterns to Mirror
- {category}: `file:lines` — {short description}

## Dependencies
- {external lib, service, or in-repo module}

## Risks
- {H/M/L}: {risk and mitigation}

## Complexity: {High | Medium | Low}

**WAITING FOR CONFIRMATION**: Proceed? (yes / no / modify)
```

### Artifact mode (PRD input)

Write the same plan to `.claude/plans/{kebab-case-feature-name}.plan.md` using the template below, then present a summary inline and await confirmation.

```markdown
# Plan: {Feature Name}

**Source PRD**: {path}
**PRD Phase**: {phase name}
**Complexity**: {Small | Medium | Large}

## Summary
{2–3 sentences}

## Patterns to Mirror
| Category | Source | Snippet |
|---|---|---|
| Naming | `path:lines` | `example` |
| Errors | `path:lines` | `example` |
| Logging | `path:lines` | `example` |
| Data access | `path:lines` | `example` |
| Tests | `path:lines` | `example` |

## Mandatory Reading
| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `path` | `1-50` | Core pattern |

## Files to Change
| File | Action | Justification |
|---|---|---|
| `path` | CREATE / UPDATE / DELETE | {why} |

## Out of Scope
- {explicit non-goal}

## Tasks
### Task 1: {name}
- **Action**: what to do
- **Mirror**: pattern to follow (ref above)
- **Validate**: command that proves correctness

## Validation
```bash
# type-check, lint, test, build — project-specific commands
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|

## Acceptance
- [ ] All tasks complete
- [ ] All validation commands pass
- [ ] Patterns mirrored, not reinvented
```

After writing the artifact, report the path and wait for user confirmation before any code is written.

## Confirmation Gate

The planner will **NOT** write code until the user confirms with `yes`, `proceed`, or similar. To revise, reply with:
- `modify: {changes}`
- `different approach: {alternative}`
- `skip phase N and do phase M first`

## Integration

- Create a PRD first with `/plan-prd` when scope is unclear
- Implement the plan with `/tdd`
- Fix build errors with `/build-fix`
- Review changes with `/code-review`
- Open a PR with `/pr`

## Related Agents

Invokes the `planner` agent. Source: `agents/planner.md`.
