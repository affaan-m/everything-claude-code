---
name: executing-plans
description: Use when you have a written implementation plan to execute, either with human review checkpoints or automated subagent dispatch.
---

# Executing Plans

Load plan, review critically, execute tasks. Two modes available:

| Mode | Use When | Review Style |
|------|----------|-------------|
| **Manual** | Human wants to review between batches, tightly coupled tasks | Human-in-loop checkpoints |
| **Subagent** | Tasks are independent, staying in same session, want speed | Automated two-stage review per task |

**Announce at start:** "I'm using the executing-plans skill in [Manual/Subagent] mode."

---

## Mode Selection

1. Have an implementation plan? If no -> use writing-plans first
2. Tasks mostly independent? If yes -> Subagent mode. If no -> Manual mode.
3. Human wants to review between batches? If yes -> Manual mode.

---

## Manual Mode

**Core principle:** Batch execution with checkpoints for architect review.

### Process

1. **Load and Review Plan**
   - Read plan file, review critically, raise concerns before starting
   - Create task tracking with TaskCreate

2. **Execute Batch** (default: first 3 tasks)
   - Mark as in_progress, follow each step exactly, run verifications, mark completed

3. **Report and Wait**
   - Show what was implemented + verification output
   - Say: "Ready for feedback."

4. **Continue** — Apply feedback, execute next batch, repeat

5. **Complete** — Use finishing-a-development-branch

### When to Stop

- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps
- Verification fails repeatedly
- **Ask for clarification rather than guessing.**

---

## Subagent Mode

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration.

### Process

1. **Read plan once**, extract all tasks with full text, note context, create task tracking

2. **Per Task:**
   a. Dispatch implementer subagent (`./implementer-prompt.md`)
   b. If implementer asks questions -> answer, provide context, re-dispatch
   c. Implementer implements, tests, commits, self-reviews
   d. Dispatch spec reviewer (`./spec-reviewer-prompt.md`)
   e. If spec issues found -> implementer fixes -> re-review (loop until approved)
   f. Dispatch code quality reviewer (`./code-quality-reviewer-prompt.md`)
   g. If quality issues found -> implementer fixes -> re-review (loop until approved)
   h. Mark task complete

3. **After all tasks** -> dispatch final code reviewer for entire implementation

4. **Complete** -> Use finishing-a-development-branch

### Prompt Templates

- `./implementer-prompt.md` — Full task text + context, self-review before reporting
- `./spec-reviewer-prompt.md` — Verify implementation matches spec (nothing more, nothing less)
- `./code-quality-reviewer-prompt.md` — Verify clean, tested, maintainable code

### Example Flow

```
[Read plan, extract 5 tasks, create task tracking]

Task 1: Hook installation script
  [Dispatch implementer with full task text + context]
  Implementer asks: "User or system level?" -> Answer: "User level"
  Implementer: Implemented, 5/5 tests, committed
  [Spec reviewer] ✅ Spec compliant
  [Code quality reviewer] ✅ Approved

Task 2: Recovery modes
  [Dispatch implementer]
  Implementer: Added verify/repair modes, 8/8 tests, committed
  [Spec reviewer] ❌ Missing progress reporting, extra --json flag
  [Implementer fixes] -> [Spec reviewer] ✅
  [Code quality reviewer] ❌ Magic number -> [Fix] -> ✅

[All tasks done -> final code review -> finishing-a-development-branch]
```

---

## Red Flags (Both Modes)

**Never:**
- Start implementation on main/master without explicit user consent
- Skip verifications or reviews
- Proceed with unfixed issues
- Guess when blocked — ask for clarification

**Subagent mode specific:**
- Never dispatch parallel implementation subagents (conflicts)
- Never make subagent read plan file (provide full text instead)
- Never skip scene-setting context
- Always answer subagent questions before letting them proceed
- Always run spec compliance before code quality (order matters)
- Never move to next task while reviews have open issues
- If subagent fails -> dispatch fix subagent (don't fix manually, avoids context pollution)

---

## Shared Rules

- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to

---

## Integration

**Required workflow skills:**
- **using-git-worktrees** — REQUIRED: Set up isolated workspace before starting
- **writing-plans** — Creates the plan this skill executes
- **finishing-a-development-branch** — Complete development after all tasks

**Subagent mode also uses:**
- **requesting-code-review** — Code review template for reviewer subagents
