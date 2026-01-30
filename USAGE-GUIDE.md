# Everything Claude Code - Efficient Usage Guide

> A practical guide to maximizing your Claude Code productivity while managing context efficiently.

---

## Table of Contents

1. [Context Window Management](#1-context-window-management)
2. [Model Selection Strategy](#2-model-selection-strategy)
3. [Agent Usage Patterns](#3-agent-usage-patterns)
4. [Slash Commands Quick Reference](#4-slash-commands-quick-reference)
5. [Workflow Patterns](#5-workflow-patterns)
6. [Tips & Techniques](#6-tips--techniques)
7. [Your Custom Configs](#7-your-custom-configs)

---

## 1. Context Window Management

### The Golden Rule

**Your 200k context window can shrink to 70k with too many tools enabled.**

### MCP Management

```
Rule of thumb:
- Have 20-30 MCPs configured total
- Keep under 10 MCPs enabled per project
- Under 80 tools active at any time
```

Use `disabledMcpServers` in your project's `.claude/settings.json`:

```json
{
  "disabledMcpServers": ["github", "supabase", "railway"]
}
```

### Context Zones

| Context Level | Safe Tasks |
|--------------|------------|
| **0-60%** (Fresh) | Large refactors, multi-file features, complex debugging |
| **60-80%** (Working) | Normal development, moderate features |
| **80-100%** (Danger Zone) | Single-file edits, simple fixes, docs only |

### When to Start Fresh

Start a new session when:
- Context is above 80%
- Claude starts forgetting earlier conversation parts
- You're switching to a completely different task
- Build errors keep recurring in a loop

### Context-Saving Techniques

1. **Be Specific**: "Fix the auth bug in `src/auth/login.ts:42`" vs "Fix the login bug"
2. **Use File Paths**: Always reference exact paths
3. **Avoid Re-reads**: Don't ask Claude to re-read files it just read
4. **Chunk Large Tasks**: Break into smaller sessions if needed

---

## 2. Model Selection Strategy

### When to Use Each Model

| Model | Best For | Cost |
|-------|----------|------|
| **Haiku** | Lightweight agents, frequent calls, simple tasks | $ |
| **Sonnet** | Main development work, orchestration, complex coding | $$ |
| **Opus** | Deep reasoning, architecture decisions, research | $$$ |

### Practical Guidelines

**Use Haiku for:**
- Worker agents in multi-agent workflows
- Repetitive code generation
- Simple refactors
- Documentation updates

**Use Sonnet (default) for:**
- Day-to-day development
- Feature implementation
- Bug fixing
- Code review orchestration

**Use Opus for:**
- Architectural decisions
- Complex problem analysis
- Planning major features
- Debugging tricky issues

### Setting Model Per Agent

Your agents have model hints in their config:

```markdown
---
name: planner
model: opus
---
```

---

## 3. Agent Usage Patterns

### Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `planner` | Implementation planning | Complex features, refactoring |
| `architect` | System design | Architectural decisions |
| `tdd-guide` | Test-driven development | New features, bug fixes |
| `code-reviewer` | Code review | After writing code |
| `security-reviewer` | Security analysis | Before commits |
| `build-error-resolver` | Fix build errors | When build fails |
| `e2e-runner` | E2E testing | Critical user flows |
| `refactor-cleaner` | Dead code cleanup | Code maintenance |
| `doc-updater` | Documentation | Updating docs |

### Automatic Agent Selection

Claude should automatically use these agents:

1. **Complex feature request** → `planner` agent first
2. **Code just written** → `code-reviewer` agent
3. **Bug fix or new feature** → `tdd-guide` agent
4. **Build failed** → `build-error-resolver` agent
5. **Architectural question** → `architect` agent

### Parallel Agent Execution

**This is the key to efficiency.** Run independent agents in parallel:

```
Good (Parallel):
"Run security review, code review, and type checking simultaneously"

Bad (Sequential):
"First review code, then check security, then check types"
```

### Multi-Perspective Analysis

For complex problems, request split-role analysis:

```
"Analyze this auth implementation from multiple perspectives:
- Security expert: vulnerabilities
- Performance engineer: bottlenecks
- Code reviewer: maintainability"
```

---

## 4. Slash Commands Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/tdd` | Test-driven development | Implementing new features |
| `/plan` | Implementation planning | Before complex features |
| `/code-review` | Quality review | After writing code |
| `/build-fix` | Fix build errors | When build fails |
| `/e2e` | E2E test generation | Critical user flows |
| `/refactor-clean` | Dead code cleanup | Code maintenance |
| `/test-coverage` | Coverage analysis | Before commits |
| `/update-docs` | Sync documentation | After major changes |
| `/update-codemaps` | Refresh code maps | After structural changes |
| `/learn` | Learn from patterns | After successful solutions |

### Command Chaining

Optimal workflow for new features:

```
1. /plan          → Create implementation plan
2. /tdd           → Implement with tests first
3. /build-fix     → Fix any build errors
4. /code-review   → Review quality
5. /test-coverage → Verify coverage
```

---

## 5. Workflow Patterns

### Feature Development Workflow

```
┌─────────────┐
│   /plan     │  ← Understand what to build
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   /tdd      │  ← Write tests first, then implement
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ /build-fix  │  ← Fix any build errors
└──────┬──────┘
       │
       ▼
┌─────────────┐
│/code-review │  ← Review quality
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Commit    │  ← Git commit
└─────────────┘
```

### Bug Fix Workflow

```
1. Reproduce bug → Write failing test
2. /tdd          → Fix with TDD approach
3. /build-fix    → Ensure build passes
4. Verify fix    → Run tests
5. Commit        → With test that proves fix
```

### Refactoring Workflow

```
1. /plan              → Plan the refactor
2. Write tests first  → Capture current behavior
3. Refactor           → Small incremental changes
4. /refactor-clean    → Remove dead code
5. /code-review       → Final quality check
```

### Plan Mode + Ultrathink

For complex tasks requiring deep reasoning:

```
1. Enable Plan Mode: "Let's plan this before implementing"
2. Request ultrathink: "Think deeply about the architecture"
3. Review plan before executing
4. Execute incrementally
```

---

## 6. Tips & Techniques

### Efficiency Tips

#### 1. Front-load Context

Give Claude all relevant info upfront:

```
Bad:  "Fix the login bug"
Good: "Fix the login bug in src/auth/login.ts:42 where
       the JWT token isn't being validated correctly.
       Error: 'token undefined'. Expected behavior:
       validate token from Authorization header."
```

#### 2. Use Exact File Paths

```
Bad:  "Update the user component"
Good: "Update src/components/User/UserProfile.tsx"
```

#### 3. Request Parallel Execution

```
"Run these three tasks in parallel:
1. Type check the auth module
2. Run tests for user service
3. Lint the API routes"
```

#### 4. Batch Related Changes

```
"Make these related changes together:
- Add email field to User interface
- Update UserForm component
- Add email validation"
```

#### 5. Use Checkpoints

For long tasks, create logical save points:

```
"Implement the user dashboard:
CHECKPOINT 1: Database schema
CHECKPOINT 2: API endpoints
CHECKPOINT 3: Frontend components
CHECKPOINT 4: Tests

Pause after each checkpoint for review."
```

### Context Preservation

#### Strategic Compaction

The hooks suggest compaction at logical intervals. Good times to compact:

- After completing a major feature
- Before switching focus areas
- When context is above 70%

#### Session Memory

The hooks save state before compaction and restore on session start. Your work context persists across sessions.

### Debugging Tips

#### Build Error Loop?

If Claude keeps trying the same fix:

1. Stop the loop
2. Say: "Let's step back. Show me all the build errors first without fixing."
3. Review errors yourself
4. Provide specific direction

#### Context Lost?

If Claude forgets earlier context:

1. Check context usage level
2. Summarize what was done so far
3. Provide key file paths again
4. Consider starting fresh session

### Performance Patterns

#### Skeleton Projects

When starting new features:

```
"Search for battle-tested examples of [feature type]:
1. Security assessment
2. Extensibility analysis
3. Relevance scoring
Pick the best match as foundation."
```

#### Incremental Implementation

Never try to implement everything at once:

```
Good: "Implement the user API endpoint first, then we'll add validation"
Bad:  "Implement the complete user management system"
```

---

## 7. Your Custom Configs

### Custom Rules (n8n & Mobile)

You have specialized rules for:

- **n8n-workflows.md**: n8n workflow building and validation
- **mobile-development.md**: React Native/Expo guidelines

These are automatically applied when working on those project types.

### Custom Skills

| Skill | Purpose | Invoke With |
|-------|---------|-------------|
| `/code-review` | Quality checklist | After writing code |
| `/deploy` | Deployment workflow | When deploying |
| `/n8n-build` | n8n workflow builder | Building n8n workflows |

### Your n8n MCP Tools

You have n8n MCP integration. Use these patterns:

```
"Search for an n8n node that handles webhooks"
"Validate this workflow configuration"
"Create a new workflow with webhook trigger"
```

---

## Quick Reference Card

### Daily Workflow

```
Morning Session:
1. Check what needs to be done
2. /plan for complex features
3. /tdd for implementation
4. /code-review before commits

Before Commit:
- /test-coverage (verify 80%+)
- /code-review (final check)
- No console.logs (hooks will warn)

Before Deploy:
- /deploy (pre-flight checks)
- Security checklist verified
```

### Context Checklist

```
□ Context below 80%?
□ Using exact file paths?
□ Requesting parallel execution when possible?
□ Breaking large tasks into chunks?
□ Using appropriate model for task?
```

### Emergency Commands

```
Build failing loop:    "Stop. List all errors without fixing."
Context too high:      "Summarize progress, start new session"
Lost context:          "Here's where we are: [summary]. Continue."
Wrong direction:       "Stop. Let's reconsider the approach."
```

---

## Syncing Updates

When the original repo has updates:

```bash
cd ~/.claude/everything-claude-code
git fetch upstream
git merge upstream/main
git push origin main
```

**Tip**: Watch the repo on GitHub to get notified of updates.

---

**Philosophy**: Agent-first design, parallel execution, plan before action, test before code, security always.
