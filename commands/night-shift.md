---
description: Autonomous Night Shift mode - Executes tasks from tasks.md in strict order with GitHub Issue linking
---

# 🌙 Night Shift Command

Autonomous task execution mode that works through `tasks.md` in order, linking to GitHub Issues and following TDD practices.

## Usage

`/night-shift [options]`

## Overview

Night Shift mode operates unsupervised, automatically:
- Reading tasks from `tasks.md` in order
- Matching tasks to GitHub Issues
- Implementing with TDD cycle
- Committing and pushing changes
- Creating PR when complete

## Prerequisites

1. **tasks.md** exists with ordered task list
2. **spec/** folder contains specification documents
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

### 4. PLAN (Optional - for complex tasks)
**Use planner agent for complex tasks:**
```
Task: "Implement user authentication"
→ Delegate to planner agent
→ Receive detailed implementation plan
→ Update CURRENT_TASK.md with plan
```

### 5. EXECUTE (TDD Cycle with Agents)
**Agent-assisted Test-Driven Development:**

**Option A: Use tdd-guide agent (Recommended)**
```
→ Delegate entire TDD cycle to tdd-guide agent
→ Agent writes tests, implements code, refactors
→ Ensures 80%+ test coverage
→ Returns when all tests pass
```

**Option B: Manual TDD (fallback)**

1. **Write Tests**
   - Create test file if needed
   - Write failing tests for the feature
   - Run tests to confirm they fail

2. **Write Code**
   - Implement minimum code to pass tests
   - Follow project coding standards
   - Keep changes focused on current task

3. **Refactor**
   - Clean up implementation
   - Ensure tests still pass
   - Update documentation if needed

**Error Handling:**
- Max 3 retry attempts per task
- If tests fail, use build-error-resolver agent
- If FAILED after retries:
  - Revert code changes
  - Add comment to `tasks.md`: `<!-- FAILED: [reason] -->`
  - Skip to next task

### 6. REVIEW (Optional - for quality assurance)
**Use review agents before commit:**

**Code Review:**
```
→ Delegate to code-reviewer agent
→ Check code quality, patterns, edge cases
→ Fix issues if any found
```

**Security Review (for sensitive tasks):**
```
→ Delegate to security-reviewer agent
→ Check for vulnerabilities, SQL injection, XSS, etc.
→ Fix security issues before commit
```

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

5. **Loop back** to step 1

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

```
project/
├── tasks.md              # Task checklist (AUTHORITY)
├── spec/                 # Specification documents (KNOWLEDGE BASE)
├── CURRENT_TASK.md       # Temporary task context (auto-deleted)
└── commands/
    └── night-shift.md    # This command
```

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

## Arguments

$ARGUMENTS:
- `--dry-run` - Show what would be executed without making changes
- `--max-tasks N` - Stop after N tasks (default: all)
- `--skip-pr` - Don't create PR at the end
- `--branch NAME` - Use specific branch name
- `--use-agents` - Use specialized agents (planner, tdd-guide, reviewers) (default: true)
- `--no-agents` - Disable agent usage, manual implementation only
- `--skip-review` - Skip code-reviewer and security-reviewer agents
- `--quality-mode [fast|standard|thorough]` - Quality assurance level
  - `fast`: tdd-guide only
  - `standard`: tdd-guide + code-reviewer (default)
  - `thorough`: planner + tdd-guide + code-reviewer + security-reviewer

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

Night Shift can delegate to specialized agents for higher quality:

### Planning Agents
- **planner** - Create detailed implementation plans for complex tasks
  - Use for: New features, architectural changes, complex refactoring
  - Output: Step-by-step implementation plan

### Implementation Agents
- **tdd-guide** - Test-Driven Development specialist (RECOMMENDED)
  - Use for: All implementation tasks
  - Ensures: 80%+ test coverage, Red-Green-Refactor cycle
  - Output: Tests + Implementation + Passing tests

### Quality Assurance Agents
- **code-reviewer** - Code quality and best practices
  - Use for: All tasks before commit
  - Checks: Patterns, edge cases, maintainability
  - Output: Review feedback + fixes

- **security-reviewer** - Security vulnerability detection
  - Use for: Auth, payments, data handling, API endpoints
  - Checks: SQL injection, XSS, CSRF, authentication issues
  - Output: Security report + fixes

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

1. PLAN
   → planner agent creates implementation plan
   → Plan saved to CURRENT_TASK.md

2. IMPLEMENT
   → tdd-guide agent follows plan
   → Writes tests first
   → Implements features
   → All tests pass ✓

3. REVIEW
   → code-reviewer agent checks quality
   → Suggests improvements
   → Fixes applied

4. SECURITY
   → security-reviewer agent checks auth implementation
   → Validates password hashing, session management
   → Security ✓

5. COMMIT
   → All checks passed
   → Commit with "feat(auto): Add user authentication (Fixes #42)"
```

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
