---
description: Autonomous Night Shift mode - Executes tasks from tasks.md in strict order with GitHub Issue linking
---

# 🌙 Night Shift Command

Autonomous task execution mode that works through `tasks.md` in order, linking to GitHub Issues and following TDD practices.

## Usage

`/night-shift [options]`

## Overview

Night Shift mode operates **completely unsupervised and autonomously**, automatically:
- Reading tasks from `tasks.md` in order
- Matching tasks to GitHub Issues
- Implementing with TDD cycle
- Committing and pushing changes
- Creating PR when complete

**CRITICAL AUTONOMOUS EXECUTION RULES:**

1. **NEVER STOP BETWEEN TASKS** - After completing a task, IMMEDIATELY proceed to the next unchecked task
2. **NEVER ASK FOR CONFIRMATION** - Do not wait for user approval, acknowledgment, or any input
3. **NEVER ANNOUNCE AND WAIT** - If you say "proceeding to next task", you MUST immediately execute it in the same response
4. **CONTINUOUS LOOP** - Repeat: Complete task → Update tasks.md → Git commit → IMMEDIATELY start next task
5. **ALWAYS USE AGENTS** - Unless `--no-agents` is explicitly specified:
   - **MANDATORY**: Use `tdd-guide` agent for ALL implementations (DO NOT implement manually)
   - **MANDATORY**: Use `code-reviewer` agent BEFORE every commit (DO NOT skip review)
   - **RECOMMENDED**: Use `planner` agent for complex tasks (>3 steps or architectural changes)
   - **RECOMMENDED**: Use `security-reviewer` agent for auth/API/payment/data handling tasks
   - **Manual implementation is PROHIBITED** - Always delegate to agents
6. **ONLY STOP WHEN**:
   - All tasks in tasks.md are checked `[x]`
   - Max-tasks limit reached (if specified)
   - Unrecoverable error occurs

**THIS IS NIGHT SHIFT MODE - FULL AUTONOMOUS EXECUTION WITHOUT ANY PAUSES**
**THIS IS AGENT-DRIVEN MODE - FULL DELEGATION TO SPECIALIZED AGENTS**

## Prerequisites

1. **tasks.md** exists with ordered task list
   - Supports kiro structure: `.kiro/specs/[project]/tasks.md`
   - Falls back to: `.kiro/tasks.md` or `tasks.md` (root)
2. **spec/** folder contains specification documents
   - Supports kiro structure: `.kiro/specs/[project]/`
   - Falls back to: `spec/` (root)
3. GitHub CLI (`gh`) is authenticated
4. Currently on a feature branch (not main)

## Execution Loop

The command executes this loop until all tasks are complete:

### 1. IDENTIFY NEXT TASK
- Read `tasks.md`
- Find first unchecked item: `- [ ] Task Name`
- If no unchecked items remain, proceed to FINISH
- Extract task name and description

### 2. FIND MATCHING ISSUE
```bash
gh issue list --state open --limit 50 --json number,title,body
```
- Compare task name with open issues
- Select best matching issue number
- If no match found, proceed without issue link

### 3. GATHER CONTEXT
- Create `CURRENT_TASK.md` with:
  - Task description
  - Linked GitHub Issue body (if found)
  - Relevant files from `spec/` directory
  - Mini implementation plan

### 4. PLAN (MANDATORY for complex tasks)
**CRITICAL: For tasks with >3 steps or architectural changes, MUST use planner agent**

If task is complex (detected by: multi-step, new architecture, refactoring):
```
→ MUST delegate to planner agent
→ Agent creates detailed step-by-step plan
→ Save plan to CURRENT_TASK.md
→ Follow plan during implementation
```

**DO NOT skip planning for complex tasks**

### 5. EXECUTE (MANDATORY: Use tdd-guide agent)
**CRITICAL: DO NOT implement manually. ALWAYS delegate to tdd-guide agent.**

**MANDATORY Agent-Driven Implementation:**
```
→ Delegate ENTIRE TDD cycle to tdd-guide agent
→ Agent writes tests first (RED phase)
→ Agent implements code (GREEN phase)
→ Agent refactors (REFACTOR phase)
→ Agent ensures 80%+ test coverage
→ Agent returns when all tests pass
```

**Error Handling:**
- If tdd-guide agent fails → Use `build-error-resolver` agent to fix errors
- Max 3 retry attempts per task
- If FAILED after retries:
  - Revert code changes
  - Add comment to `tasks.md`: `<!-- FAILED: [reason] -->`
  - Skip to next task and continue

**PROHIBITED ACTIONS:**
- ❌ DO NOT implement code manually
- ❌ DO NOT write tests manually
- ❌ DO NOT skip tdd-guide agent
- ✅ ALWAYS delegate to tdd-guide agent

### 6. REVIEW (MANDATORY before every commit)
**CRITICAL: DO NOT commit without review. ALWAYS use review agents.**

**1. Code Review (MANDATORY for ALL commits):**
```
→ MUST delegate to code-reviewer agent
→ Agent checks code quality, patterns, edge cases
→ Agent provides feedback
→ Fix ALL issues found
→ Re-review if significant changes made
```

**2. Security Review (MANDATORY for auth/API/payment/data tasks):**
```
→ MUST delegate to security-reviewer agent
→ Agent checks for vulnerabilities (SQL injection, XSS, CSRF, etc.)
→ Agent validates authentication, authorization, input validation
→ Fix ALL security issues before commit
```

**PROHIBITED ACTIONS:**
- ❌ DO NOT skip code review
- ❌ DO NOT commit without code-reviewer agent approval
- ❌ DO NOT skip security review for sensitive tasks
- ✅ ALWAYS use code-reviewer agent before commit
- ✅ ALWAYS use security-reviewer agent for auth/API/payment tasks

### 7. COMPLETE & UPDATE
If tests pass:

1. **Delete** `CURRENT_TASK.md`

2. **Update tasks.md**
   ```diff
   - - [ ] Task Name
   + - [x] Task Name
   ```

3. **Git Commit**
   ```bash
   git add .
   git commit -m "feat(auto): <Task Name> (Fixes #<ISSUE_NUM>)"
   git push origin HEAD
   ```

4. **Compact** (if context is growing)
   ```
   /compact
   ```

5. **IMMEDIATELY AND AUTOMATICALLY** execute step 1 again (in the SAME response)
   - **DO NOT** announce "proceeding to next task" and then stop
   - **DO NOT** ask "should I continue?"
   - **DO NOT** wait for any acknowledgment
   - **IMMEDIATELY** read tasks.md again and start the next unchecked task
   - This is a CONTINUOUS LOOP - keep executing until stopping condition met

   **EXECUTION PATTERN:**
   ```
   Complete Task 1 → Commit → Read tasks.md → Start Task 2 (NO PAUSE)
   Complete Task 2 → Commit → Read tasks.md → Start Task 3 (NO PAUSE)
   Complete Task 3 → Commit → Read tasks.md → Start Task 4 (NO PAUSE)
   ... continue until all done
   ```

### 8. FINISH & PR
When all tasks are checked:

```bash
gh pr create \
  --repo hy-sksem/everything-claude-code \
  --base main \
  --head <current-branch> \
  --title "Night Shift Report: $(date +%Y-%m-%d)" \
  --body "Automated implementation following tasks.md order.

## Tasks Completed
[List of completed tasks]

## Tests Status
All tests passing ✓

## Review Notes
[Any important notes or warnings]
"
```

## Safety Guards

1. **Branch Check**
   - Must NOT be on `main` branch
   - Auto-create `night-shift-YYYY-MM-DD` branch if needed

2. **Test Validation**
   - All tests must pass before committing
   - No commits with failing tests

3. **Retry Limit**
   - Max 3 attempts per task
   - Auto-skip on persistent failures

4. **Context Management**
   - Run `/compact` every 5 tasks
   - Keep context under control

## File Structure

### Kiro Structure (Recommended)
```
project/
├── .kiro/
│   └── specs/
│       └── [project-name]/
│           ├── tasks.md          # Task checklist (AUTHORITY)
│           ├── database.md       # DB specifications
│           ├── api.md            # API specifications
│           └── frontend.md       # UI specifications
├── CURRENT_TASK.md               # Temporary task context (auto-deleted)
└── commands/
    └── night-shift.md            # This command
```

### Standard Structure (Fallback)
```
project/
├── tasks.md              # Task checklist (AUTHORITY)
├── spec/                 # Specification documents (KNOWLEDGE BASE)
├── CURRENT_TASK.md       # Temporary task context (auto-deleted)
└── commands/
    └── night-shift.md    # This command
```

**Auto-detection priority:**
1. `.kiro/specs/[project]/tasks.md` (kiro structure)
2. `.kiro/tasks.md`
3. `tasks.md` (root)

## tasks.md Format

```markdown
# Project Tasks

## Phase 1: Setup
- [ ] Setup Database Schema
- [ ] Configure Authentication
- [x] Initialize Project Structure

## Phase 2: Features
- [ ] Implement User Registration
- [ ] Add Login Flow
<!-- FAILED: Auth service not responding -->
- [ ] Create Dashboard

## Phase 3: Testing
- [ ] Write Integration Tests
- [ ] Add E2E Tests
```

## GitHub Issue Matching

The command uses fuzzy matching to link tasks to issues:

**Task**: `- [ ] Setup Database Schema`
**Issue**: `#15 - Database Schema Setup`
→ **Match**: Score based on word overlap

**Commit**: `feat(auto): Setup Database Schema (Fixes #15)`

## Context Gathering

For each task, the command reads:

1. **GitHub Issue Body** (if matched)
   - Requirements
   - Acceptance criteria
   - Technical notes

2. **Relevant spec/ files**
   - Database specs for DB tasks
   - API specs for endpoint tasks
   - UI specs for frontend tasks

3. **Related Code**
   - Existing implementations
   - Test files
   - Configuration files

## TDD Pattern Example

```javascript
// 1. Write Test (CURRENT_TASK.md shows this plan)
describe('UserAuth', () => {
  it('should validate user credentials', () => {
    // Test implementation
  });
});

// 2. Write Code (minimum to pass)
class UserAuth {
  validate(credentials) {
    // Implementation
  }
}

// 3. Refactor (improve while keeping tests green)
class UserAuth {
  validate(credentials) {
    // Improved implementation
    // Tests still pass ✓
  }
}
```

## Error Recovery

### Failed Test
```
Attempt 1: FAILED - TypeError in validation
→ Analyze error, fix code, retry

Attempt 2: FAILED - Missing dependency
→ Install dependency, retry

Attempt 3: FAILED - Logic error persists
→ SKIP TASK, add comment to tasks.md, move to next
```

### Lost Context
```
Context > 180K tokens
→ Run /compact
→ Resume from current task
```

## Autonomous Execution

**DEFAULT BEHAVIOR: Fully autonomous, no user intervention**

Night Shift runs continuously without stopping or asking for confirmation:
- Processes all unchecked tasks in sequence
- Automatically proceeds to next task after each completion
- Only stops when: all tasks done, max-tasks reached, or unrecoverable error
- Never prompts user between tasks

## Default Agent Usage

**CRITICAL: Unless `--no-agents` is explicitly specified, Night Shift operates in AGENT-DRIVEN MODE**

### Standard Quality Mode (Default)

Every task follows this MANDATORY agent workflow:

1. **For Complex Tasks** (auto-detected: >3 steps, architectural changes):
   - MUST use `planner` agent
   - Creates detailed implementation plan
   - Plan saved to CURRENT_TASK.md

2. **For ALL Implementation Tasks** (MANDATORY):
   - MUST use `tdd-guide` agent
   - Agent handles complete TDD cycle
   - Ensures 80%+ test coverage
   - Manual implementation is PROHIBITED

3. **Before EVERY Commit** (MANDATORY):
   - MUST use `code-reviewer` agent
   - Reviews all changes
   - Ensures code quality and best practices

4. **For Sensitive Tasks** (auto-detected: auth, API, payment, data handling):
   - MUST use `security-reviewer` agent
   - Checks for security vulnerabilities
   - Validates secure coding practices

**This is NOT optional. This is the DEFAULT and MANDATORY behavior.**

**To disable agents**: Use `--no-agents` flag (NOT RECOMMENDED for production)
**To change quality level**: Use `--quality-mode` flag

## Arguments

$ARGUMENTS:
- `--dry-run` - Show what would be executed without making changes
- `--max-tasks N` - Stop after N tasks (default: all, runs until complete)
- `--skip-pr` - Don't create PR at the end
- `--branch NAME` - Use specific branch name
- `--use-agents` - Use specialized agents (planner, tdd-guide, reviewers) (default: true)
- `--no-agents` - Disable agent usage, manual implementation only
- `--skip-review` - Skip code-reviewer and security-reviewer agents
- `--quality-mode [fast|standard|thorough]` - Quality assurance level
  - `fast`: tdd-guide only
  - `standard`: tdd-guide + code-reviewer (default)
  - `thorough`: planner + tdd-guide + code-reviewer + security-reviewer
- `--interactive` - Enable confirmation prompts between tasks (NOT RECOMMENDED for night shift)

## Examples

### Standard Night Shift
```bash
/night-shift
```

### Dry Run (Preview)
```bash
/night-shift --dry-run
```

### Limited Tasks
```bash
/night-shift --max-tasks 5
```

### Custom Branch
```bash
/night-shift --branch feature/auto-implementation
```

### With Agents (Recommended)
```bash
# Use all agents for highest quality
/night-shift --quality-mode thorough

# Fast mode - TDD only
/night-shift --quality-mode fast

# Standard mode - TDD + Code Review
/night-shift --quality-mode standard
```

### Without Agents
```bash
# Manual implementation without agents
/night-shift --no-agents
```

## Best Practices

1. **Before Running**
   - Review and order `tasks.md`
   - Ensure specs are up-to-date
   - Create GitHub Issues for tasks
   - Commit any pending work

2. **During Execution**
   - Monitor progress periodically
   - Check test results
   - Review commits

3. **After Completion**
   - Review the PR
   - Check all tests pass
   - Verify implementation quality

## Integration with Agents

**CRITICAL: Night Shift MUST delegate to specialized agents (not optional)**

Night Shift operates in AGENT-DRIVEN MODE by default:

### Planning Agents (RECOMMENDED for complex tasks)
- **planner** - Create detailed implementation plans
  - **Usage Level**: MANDATORY for tasks with >3 steps or architectural changes
  - Use for: New features, architectural changes, complex refactoring
  - Auto-detect: Multi-step tasks, new components, system design changes
  - Output: Step-by-step implementation plan
  - **DO NOT skip** for complex tasks

### Implementation Agents (MANDATORY for all tasks)
- **tdd-guide** - Test-Driven Development specialist
  - **Usage Level**: MANDATORY for ALL implementation tasks
  - Use for: Every single task that requires code changes
  - Ensures: 80%+ test coverage, Red-Green-Refactor cycle
  - Output: Tests + Implementation + Passing tests
  - **Manual implementation is PROHIBITED**

### Quality Assurance Agents (MANDATORY)
- **code-reviewer** - Code quality and best practices
  - **Usage Level**: MANDATORY before EVERY commit
  - Use for: All tasks before commit (no exceptions)
  - Checks: Patterns, edge cases, maintainability, performance
  - Output: Review feedback + fixes
  - **DO NOT commit without code-reviewer approval**

- **security-reviewer** - Security vulnerability detection
  - **Usage Level**: MANDATORY for auth/API/payment/data tasks
  - Use for: Authentication, API endpoints, payments, data handling
  - Auto-detect: Files with auth, API routes, sensitive data
  - Checks: SQL injection, XSS, CSRF, authentication issues
  - Output: Security report + fixes
  - **DO NOT skip** for sensitive tasks

### Support Agents
- **build-error-resolver** - Fix build and test failures
  - Use for: When tests fail or build breaks
  - Fixes: Compilation errors, test failures, dependencies
  - Output: Fixed code

- **doc-updater** - Update documentation
  - Use for: After implementation
  - Updates: README, API docs, inline comments
  - Output: Updated documentation

## Agent Workflow Example

```
Task: "Add user authentication"

1. PLAN (MANDATORY - complex task detected)
   ✓ MUST delegate to planner agent
   → Agent analyzes task complexity
   → Agent creates detailed implementation plan
   → Plan saved to CURRENT_TASK.md
   ❌ DO NOT skip - task is complex

2. IMPLEMENT (MANDATORY - ALL tasks)
   ✓ MUST delegate to tdd-guide agent
   → Agent writes tests first (RED)
   → Agent implements features (GREEN)
   → Agent refactors code (REFACTOR)
   → All tests pass ✓ (80%+ coverage)
   ❌ DO NOT implement manually

3. CODE REVIEW (MANDATORY - before commit)
   ✓ MUST delegate to code-reviewer agent
   → Agent reviews all changes
   → Agent suggests improvements
   → Fixes applied
   → Re-review if needed
   ❌ DO NOT skip review

4. SECURITY REVIEW (MANDATORY - auth task detected)
   ✓ MUST delegate to security-reviewer agent
   → Agent detects authentication code
   → Agent validates password hashing, session management
   → Agent checks for auth vulnerabilities
   → Security ✓
   ❌ DO NOT skip - this is auth code

5. COMMIT
   → All MANDATORY checks passed ✓
   → All agents approved ✓
   → Commit with "feat(auto): Add user authentication (Fixes #42)"
   → Push to remote
```

**Summary of Agent Usage:**
- ✓ planner: Used (complex task)
- ✓ tdd-guide: Used (MANDATORY)
- ✓ code-reviewer: Used (MANDATORY)
- ✓ security-reviewer: Used (auth task detected)
- ✅ Result: High-quality, tested, reviewed, secure implementation

## Integration with Other Commands

Night Shift can use other commands during execution:

- `/tdd` - For manual TDD cycle (if not using tdd-guide agent)
- `/compact` - For context management
- `/verify` - For validation
- `/checkpoint` - For saving state

## Monitoring

Track progress by:

1. **Git History**
   ```bash
   git log --oneline --grep="feat(auto)"
   ```

2. **tasks.md Changes**
   ```bash
   git diff HEAD~10 tasks.md
   ```

3. **Test Results**
   ```bash
   npm test
   ```

## Recovery from Interruption

If Night Shift is interrupted:

1. Check `CURRENT_TASK.md` - last task being worked on
2. Review `tasks.md` - see what's checked
3. Review git log - see last commit
4. Resume with `/night-shift` - automatically picks up next unchecked task

## Tips

1. **Keep tasks atomic** - One clear objective per task
2. **Write good specs** - Night Shift relies on spec/ folder
3. **Link to issues** - Better context = better implementation
4. **Review PRs promptly** - Avoid conflicts with upstream
5. **Run during low-activity hours** - Avoid merge conflicts
