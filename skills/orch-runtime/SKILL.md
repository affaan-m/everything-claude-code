---
name: orch-runtime
description: Dispatch tasks to a persistent ORCH agent team from Claude Code. Use when you need long-running or multi-session AI workflows that survive beyond a single Claude context window.
origin: community
---

# ORCH Runtime Integration

Use this skill when you need to hand off work to a **persistent, stateful AI agent team** managed by ORCH — the TypeScript CLI runtime for coordinating Claude Code, OpenCode, Codex, and Cursor agents.

Unlike ECC's in-process subagents (ephemeral, single-session), ORCH agents are:
- **persistent** — survive process restarts and session ends
- **stateful** — tasks flow through a formal state machine (`todo → in_progress → review → done`)
- **resilient** — auto-retry on failure, with configurable retry budgets
- **communicating** — agents send direct messages and broadcast to the team

## When to Use

- The task spans multiple Claude sessions (>1 context window)
- You need a background agent to run while you work on something else
- You want human review gates before a task is marked done
- You have a team of specialized agents (Backend, QA, Reviewer) that should coordinate
- You need an audit trail of task state transitions

## Prerequisites

```bash
npm install -g @oxgeneral/orch
```

Verify installation:
```bash
orch --version
orch agent list
```

## Core Concepts

### State Machine
Every task in ORCH follows a managed lifecycle:
```
todo → in_progress → review → done
              ↓
           retrying (on failure, up to N attempts)
              ↓
           failed
```

No task jumps directly to `done` — the `review` gate ensures accountability.

### Agent Registry
Agents are persisted in `.orchestry/agents/`. Each agent has:
- `adapter`: `claude` | `opencode` | `codex` | `cursor` | `shell`
- `model`: the AI model to invoke
- `role`: the system prompt
- `approval_policy`: `auto` | `suggest` | `manual`

### Shared Context
Use `orch context set/get` as a key-value store that all agents can read. This is the shared memory layer between ORCH and ECC sessions.

## Dispatching Tasks from Claude Code

### 1. Add a task and assign to an agent

```bash
# Find available agents
orch agent list

# Create task with description and priority
orch task add "Implement OAuth2 middleware" \
  -d "Add OAuth2 bearer token validation to Express. Files: src/middleware/auth.ts" \
  -p 2 \
  --assignee <agent-id>
```

### 2. Pass context from current Claude session

```bash
# Share findings from your ECC session with ORCH agents
orch context set security-findings "XSS vulnerability in src/views/profile.tsx:42 — unsanitized user input passed to innerHTML"

# Share a file reference
orch context set current-pr "https://github.com/org/repo/pull/123"

# Share structured analysis
orch context set arch-decision "Use JWT with RS256, not HS256. See: docs/adr/0012-auth.md"
```

### 3. Monitor task progress

```bash
# List active tasks
orch task list --status in_progress

# Watch the live dashboard
orch tui

# Stream logs from a specific run
orch logs --tail 50
```

### 4. Collect results

```bash
# Read context set by the ORCH agent after completion
orch context get implementation-result
orch context get test-coverage-report

# Show full task details
orch task show <task-id>
```

## Integration with /orchestrate

Combine ECC's in-process orchestration with ORCH for long-horizon tasks:

```markdown
## Hybrid Workflow Example

### Phase 1: In-process planning (ECC)
/orchestrate feature "Add OAuth2 middleware"
→ planner generates implementation plan
→ architect reviews design
→ Output: HANDOFF document in context

### Phase 2: Persistent execution (ORCH)
orch context set ecc-handoff "<paste HANDOFF document>"
orch task add "Implement OAuth2 per handoff" \
  -d "$(orch context get ecc-handoff)" \
  -p 1 --assignee <backend-agent-id>

### Phase 3: Async review gate
# ORCH enforces review state before marking done
# Agent transitions: in_progress → review → done
orch task list --status review  # see tasks awaiting review
```

## Agent Communication

```bash
# Send a message to a specific agent mid-task
orch msg send <agent-id> "Prioritize security hardening over performance" \
  -s "Updated requirements"

# Broadcast to entire team
orch msg broadcast "New requirement: FIPS compliance required" \
  -s "Compliance update"

# Check team inbox
orch msg inbox <agent-id>
```

## Goal-Driven Workflows

For multi-task projects, set a goal to link related tasks:

```bash
# Create a goal
orch goal add "Implement full authentication system" \
  -d "OAuth2 + session management + 2FA. Target: Sprint 24."

# Add tasks under the goal
orch task add "OAuth2 middleware" -p 1 --goal <goal-id>
orch task add "Session store (Redis)" -p 2 --goal <goal-id> --depends-on <oauth-task-id>
orch task add "2FA via TOTP" -p 2 --goal <goal-id> --depends-on <session-task-id>

# Monitor goal progress
orch goal show <goal-id>
```

## Resilience Patterns

### Auto-retry configuration

Configure retry budgets per agent in `.orchestry/agents/<id>.yaml`:
```yaml
max_retries: 3
retry_delay_ms: 5000
```

When a task fails, ORCH automatically transitions it to `retrying` and re-dispatches after the delay.

### Stall detection

ORCH's orchestrator tick loop detects zombie processes and stalled tasks. If an agent exceeds `stall_timeout_ms`, the task is retried or failed automatically.

## Context Store Patterns

Use the ORCH context store as a blackboard between ECC sessions and ORCH agents:

```bash
# ECC session writes analysis
orch context set code-analysis-result "Found 3 N+1 queries in UserService"

# ORCH Backend agent reads and acts
# (agent's role prompt: "read context key 'code-analysis-result' and fix the issues")
orch task add "Fix N+1 queries per analysis" \
  -d "Read: orch context get code-analysis-result" -p 1 --assignee <backend-id>

# QA agent writes test results back
orch context set qa-result "PASS: all 47 tests green, coverage 94%"

# Back in ECC session, collect
orch context get qa-result
```

## Programmatic API

ORCH exports a full engine API for embedding in Node.js apps:

```typescript
import { TaskService, AgentService, OrchestratorService } from '@oxgeneral/orch';

// Use ORCH engine programmatically from your Claude skill
const tasks = await TaskService.list({ status: 'review' });
const pending = tasks.filter(t => t.priority === 1);
```

## Best Practices

1. **One task = one atomic unit of work** — avoid mega-tasks; decompose with `--depends-on`
2. **Pass rich context** — agents perform better with file paths, constraints, and examples in `-d`
3. **Use review gate** — don't skip `review → done`; it catches agent mistakes
4. **Check logs before escalating** — `orch logs --tail 100` before creating a new task
5. **Context keys are namespaced** — use prefixes like `qa-`, `arch-`, `security-` to avoid collisions
6. **Teams for parallel work** — `orch team list` to see groups; assign tasks to team members for parallelism

## References

- GitHub: [oxgeneral/ORCH](https://github.com/oxgeneral/ORCH)
- npm: `@oxgeneral/orch`
- License: MIT
