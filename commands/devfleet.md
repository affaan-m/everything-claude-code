---
description: Orchestrate parallel Claude Code agents via Claude DevFleet — plan projects from natural language, dispatch agents in isolated worktrees, monitor progress, and read structured reports.
---

# DevFleet — Multi-Agent Orchestration

Orchestrate parallel Claude Code agents via Claude DevFleet. Each agent runs in an isolated git worktree with full tooling.

Requires the DevFleet MCP server: `claude mcp add devfleet --transport http http://localhost:18801/mcp`

## Flow

```
User describes project
  → plan_project(prompt) → mission DAG with dependencies
  → Show plan, get approval
  → dispatch_mission(M1) → Agent spawns in worktree
  → M1 completes → auto-merge → M2 auto-dispatches (depends_on M1)
  → M2 completes → auto-merge
  → get_report(M2) → files_changed, what_done, errors, next_steps
  → Report summary to user
```

## Workflow

1. **Plan the project** from the user's description:

```
mcp__devfleet__plan_project(prompt="<user's description>")
```

This returns a project with chained missions. Show the user:
- Project name and ID
- Each mission: title, type, dependencies
- The dependency DAG (which missions block which)

2. **Wait for user approval** before dispatching. Show the plan clearly.

3. **Dispatch the first mission** (the one with empty `depends_on`):

```
mcp__devfleet__dispatch_mission(mission_id="<first_mission_id>")
```

The remaining missions auto-dispatch as their dependencies complete (because `plan_project` creates them with `auto_dispatch=true`). When manually creating missions with `create_mission`, you must explicitly set `auto_dispatch=true` for this behavior.

4. **Monitor progress** — check what's running:

```
mcp__devfleet__get_dashboard()
```

Or check a specific mission:

```
mcp__devfleet__get_mission_status(mission_id="<id>")
```

Prefer polling with `get_mission_status` over `wait_for_mission` for long-running missions, so the user sees progress updates.

5. **Read the report** for each completed mission:

```
mcp__devfleet__get_report(mission_id="<mission_id>")
```

Call this for every mission that reached a terminal state. Reports contain: files_changed, what_done, what_open, what_tested, what_untested, next_steps, errors_encountered.

## All Available Tools

| Tool | Purpose |
|------|---------|
| `plan_project(prompt)` | AI breaks description into chained missions with `auto_dispatch=true` |
| `create_project(name, path?, description?)` | Create a project manually, returns `project_id` |
| `create_mission(project_id, title, prompt, depends_on?, auto_dispatch?)` | Add a mission. `depends_on` is a list of mission ID strings. |
| `dispatch_mission(mission_id, model?, max_turns?)` | Start an agent |
| `cancel_mission(mission_id)` | Stop a running agent |
| `wait_for_mission(mission_id, timeout_seconds?)` | Block until done (prefer polling for long tasks) |
| `get_mission_status(mission_id)` | Check progress without blocking |
| `get_report(mission_id)` | Read structured report |
| `get_dashboard()` | System overview |
| `list_projects()` | Browse projects |
| `list_missions(project_id, status?)` | List missions |

## Guidelines

- Always confirm the plan before dispatching unless the user said "go ahead"
- Include mission titles and IDs when reporting status
- If a mission fails, read its report to understand errors before retrying
- Agent concurrency is configurable (default: 3). Excess missions queue and auto-dispatch as slots free up. Check `get_dashboard()` for slot availability.
- Dependencies form a DAG — never create circular dependencies
- Each agent auto-merges its worktree on completion. If a merge conflict occurs, the changes remain on the worktree branch for manual resolution.
