---
name: planning-with-files
description: Manus-style persistent markdown planning pattern - the workflow behind the $2B acquisition. Use filesystem as memory for complex, multi-step tasks.
metadata: {"clawdbot":{"emoji":"📋","os":["darwin","linux","win32"]}}
---

# Planning with Files

Work like Manus — the AI agent company Meta acquired for $2 billion.

## The Problem

AI agents suffer from:
- **Volatile memory** — Context disappears on reset
- **Goal drift** — After 50+ tool calls, original goals get forgotten
- **Hidden errors** — Failures aren't tracked, so mistakes repeat
- **Context stuffing** — Everything crammed into context instead of stored

## The Solution: 3-File Pattern

For every complex task, create THREE files:

```
task_plan.md    → Track phases and progress
findings.md     → Store research and findings  
progress.md     → Session log and test results
```

### The Core Principle

```
Context Window = RAM (volatile, limited)
Filesystem     = Disk (persistent, unlimited)

→ Anything important gets written to disk.
```

## When to Use

**Use this pattern for:**
- Multi-step tasks (3+ steps)
- Research tasks
- Building/creating projects
- Tasks spanning many tool calls

**Skip for:**
- Simple questions
- Single-file edits
- Quick lookups

## File Templates

### task_plan.md

```markdown
# Task: [Brief Description]

## Objective
[Clear statement of what we're building/doing]

## Phases

### Phase 1: [Name]
- [ ] Step 1.1: Description
- [ ] Step 1.2: Description
- [ ] Step 1.3: Description

### Phase 2: [Name]
- [ ] Step 2.1: Description
- [ ] Step 2.2: Description

### Phase 3: [Name]
- [ ] Step 3.1: Description

## Current Status
Phase: 1
Step: 1.1
Blockers: None

## Error Log
| Time | Error | Resolution |
|------|-------|------------|
| - | - | - |
```

### findings.md

```markdown
# Research Findings

## Key Discoveries

### [Topic 1]
- Finding A
- Finding B
- Source: [URL or reference]

### [Topic 2]
- Finding C
- Finding D

## Code Snippets

### [Pattern Name]
\`\`\`language
// Code here
\`\`\`

## Decisions Made
| Decision | Rationale | Date |
|----------|-----------|------|
| Use X over Y | Better performance | YYYY-MM-DD |
```

### progress.md

```markdown
# Progress Log

## Session: YYYY-MM-DD HH:MM

### Completed
- [x] Task 1
- [x] Task 2

### Test Results
- Unit tests: ✅ Passing
- Integration: ⚠️ 2 failures
- E2E: ❌ Not run

### Errors Encountered
1. **Error**: Description
   **Fix**: How it was resolved

### Next Steps
1. Continue with Phase 2
2. Fix integration test failures
```

## Key Rules

### 1. Create Plan First
NEVER start without `task_plan.md`. This is non-negotiable.

### 2. The 2-Action Rule
Save findings after every 2 view/browser operations:
- Read file → Read file → **Save to findings.md**
- Browse page → Browse page → **Save to findings.md**

### 3. Log ALL Errors
Every error goes in the error log. They help avoid repetition.

### 4. Never Repeat Failures
Track attempts, mutate approach. If something failed once, try different.

### 5. Re-read Before Major Decisions
Before any major code change or decision, re-read `task_plan.md` to stay aligned.

### 6. Update Status After Completing Steps
After completing each step:
1. Check off the item
2. Update "Current Status" section
3. Log any errors or findings

## Workflow Example

```bash
# 1. Start any complex task
/planning-with-files

# 2. Claude creates the 3 files
# task_plan.md, findings.md, progress.md

# 3. Work proceeds with persistent context
# - Plan is read before decisions
# - Findings are saved regularly
# - Progress is logged

# 4. Context fills up? Run /clear then /planning-with-files
# Claude recovers from the files automatically
```

## The Manus Principles

| Principle | Implementation |
|-----------|----------------|
| Filesystem as memory | Store in files, not context |
| Attention manipulation | Re-read plan before decisions |
| Error persistence | Log failures in plan file |
| Goal tracking | Checkboxes show progress |
| Completion verification | Check all phases before stopping |

## Integration with Other Skills

- **TDD Workflow**: Log test results in `progress.md`
- **Verification Loop**: Use plan phases as checkpoints
- **Deep Research**: Store findings in `findings.md`

## Benefits

1. **No lost context** — Work survives session resets
2. **Clear progress** — Visual checkboxes show completion
3. **Error tracking** — Same mistake never happens twice
4. **Goal alignment** — Always know what you're doing
5. **Audit trail** — Full history of decisions and work

---

**Remember**: The filesystem is your extended memory. Use it.

Inspired by [Manus AI Context Engineering](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
