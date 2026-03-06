# Autonomous Mode

**Purpose:** Work autonomously with minimal interruption. Phased execution with auto-audit and checkpoints.

**Prime Directive:** Maximum useful work, minimal human interruption. Make smart decisions about what to decide vs. ask.

---

## Phase Structure

Work in logical phases. Standard structure (adjust based on task):

| Phase | Type | Deliverable |
|-------|------|-------------|
| 1 | Discovery | Requirements clarified, unknowns identified |
| 2 | Foundation | Core structure/scaffolding in place |
| 3 | Data Model | Types and schemas defined |
| 4 | Storage/Backend | Persistence layer implemented |
| 5 | API/Interface | Endpoints or interfaces working |
| 6 | Core Logic | Main functionality implemented |
| 7 | Integration | Everything wired together |
| 8 | Edge Cases | Error states, loading states handled |
| 9 | Polish | Cleanup, optimization |
| 10 | Verification | All checks pass, ready for review |

**Simpler tasks:** Combine phases. State which and why.

---

## Parallel Execution

Use **worktrees** for parallel agent work involving file edits. Spawn agents via Task tool with `isolation: "worktree"` for write-heavy work. Read-only agents (research, review) don't need isolation.

- Aim for 3-10 parallel agents when work allows
- Only go sequential when there are true data dependencies (output of A required as input to B)
- One agent per file/component/endpoint/test suite

---

## Auto-Audit (After Every Phase)

Run `/verify quick` after each phase. Fix failures immediately before proceeding.

Additionally check:
- Unused imports?
- Hardcoded values that should be constants?
- Signature changes without caller updates?

---

## Checkpoint (Every 2 Phases)

```
## Checkpoint: Phases [X] and [Y] Complete

### What I Built
[2-3 sentences -- what you can DO with it, not implementation details]

### Decisions I Made (and Why)
- [Decision]: [One-sentence reason]

### Auto-Audit Results
- Lint: PASS/FIXED | TypeScript: PASS/FIXED | Tests: PASS/FIXED

### Questions for You
[Batched questions about direction/outcomes, NOT implementation.
If none: "None -- ready to continue."]

### Next Up
[What phases X+1 and X+2 will build]

Reply "go" to continue, or provide guidance.
```

Do NOT checkpoint more frequently than every 2 phases.

---

## Decision Escalation

### DECIDE AUTONOMOUSLY
- File structure and naming (follow existing patterns)
- Which existing utilities/helpers to use
- Implementation approach matching existing code
- Error handling patterns, UI component choices
- Minor edge cases with obvious solutions

### BATCH AND ASK AT CHECKPOINT
- Clarifications about desired outcomes
- Multiple valid approaches with meaningful tradeoffs
- Anything that changes user-facing behavior significantly

### STOP AND ASK IMMEDIATELY
- New dependencies not already approved
- Features not in the original brief (scope creep)
- Changes affecting other parts of the system
- Significant architecture decisions
- Genuine uncertainty that could waste significant time

---

## Overseer Self-Check (Before Each Checkpoint)

1. Did I take the easy path or the right path?
2. Am I assuming happy path only?
3. Did I add anything not requested?
4. Did I actually verify, or just assume it works?
5. If I changed a signature, did I grep and update all callers?

---

## Completion Report

```
## Task Complete: [Name]

### What Was Built
[3-4 sentences -- what exists now and how to use it]

### How to Use It
1. [Step 1]
2. [Step 2]

### Key Decisions Made
- [Decision]: [Why]

### Files Created/Modified
- [path] -- [what it does]

### All Checks Passed (run /verify full)

### Ready to Use
[How to access/test it]
```

---

## When Things Go Wrong

- **Mistakes:** Fix immediately, note briefly in next checkpoint
- **Stuck:** Try 5-10 minutes, check similar code, then ask at checkpoint
- **Off track:** STOP. State what happened and propose correction.

---

## Exit

Use `/careful` for step-by-step approval, or `/spike` for rapid validation.
