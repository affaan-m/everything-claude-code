---
name: claude-devfleet
description: Orchestrate multi-agent coding tasks via Claude DevFleet — plan projects, dispatch parallel agents in isolated worktrees, monitor progress, and read structured reports.
origin: community
---

# Claude DevFleet Multi-Agent Orchestration

Use this skill when you need to dispatch multiple Claude Code agents to work on coding tasks in parallel. Each agent runs in an isolated git worktree with full tooling.

Requires a running Claude DevFleet instance connected via MCP. Setup: `claude mcp add devfleet --transport sse http://localhost:18801/mcp/sse`

## Flow

```
User → "Build a REST API with auth and tests"
  ↓
plan_project(prompt) → project_id + mission DAG
  ↓
Show plan to user → get approval
  ↓
dispatch_mission(M1) → Agent 1 spawns in worktree
  ↓
M1 completes → auto-merge → auto-dispatch M2 (depends_on M1)
  ↓
M2 completes → auto-merge
  ↓
get_report(M2) → files_changed, what_done, errors, next_steps
  ↓
Report back to user
```

## Tools Available

| Tool | Purpose |
|------|---------|
| `plan_project` | AI breaks a description into a project with chained missions |
| `create_project` | Create a project manually |
| `create_mission` | Add a mission with dependencies and auto-dispatch |
| `dispatch_mission` | Send an agent to work on a mission |
| `cancel_mission` | Stop a running agent |
| `wait_for_mission` | Block until a mission completes |
| `get_mission_status` | Check mission progress |
| `get_report` | Read structured report (files changed, tested, errors, next steps) |
| `get_dashboard` | System overview: running agents, stats, recent activity |
| `list_projects` | Browse all projects |
| `list_missions` | List missions in a project |

## Core Workflow

### 1. Plan a project from natural language

When the user describes something to build, use `plan_project` to break it into missions with dependencies:

```
mcp__devfleet__plan_project(prompt="Build a REST API with auth, database, and tests")
```

Returns a project ID and a list of missions with dependency chains. The first mission has no dependencies; subsequent missions auto-dispatch as their dependencies complete.

### 2. Dispatch the first mission

```
mcp__devfleet__dispatch_mission(mission_id="<id>")
```

Optional overrides: `model` (e.g., "claude-sonnet-4-20250514"), `max_turns` (integer).

### 3. Monitor progress

Check a single mission:
```
mcp__devfleet__get_mission_status(mission_id="<id>")
```

Get a full overview:
```
mcp__devfleet__get_dashboard()
```

### 4. Wait for completion

Block until a mission finishes (useful for sequential workflows):
```
mcp__devfleet__wait_for_mission(mission_id="<id>", timeout_seconds=600)
```

### 5. Read reports

After completion, read the structured agent report:
```
mcp__devfleet__get_report(mission_id="<id>")
```

Reports contain: `files_changed`, `what_done`, `what_open`, `what_tested`, `what_untested`, `next_steps`, `errors_encountered`.

## Patterns

### Full auto: plan and launch

1. `plan_project` with the user's description.
2. Dispatch the first mission (the one with empty `depends_on`).
3. The rest auto-dispatch as dependencies resolve.
4. Report back with project ID and mission count.

### Manual: step-by-step control

1. `create_project(name="My Project")` → returns `project_id`.
2. `create_mission(project_id=project_id, title="...", prompt="...")` for each task, setting `depends_on` for ordering.
3. `dispatch_mission(mission_id=...)` to start work.
4. `get_report(mission_id=...)` when done.

### Sequential with review

1. `create_mission` for implementation.
2. `dispatch_mission` and `wait_for_mission`.
3. `get_report` to review results.
4. `create_mission` for review/test task with `depends_on` and `auto_dispatch=true`.

## Guidelines

- Always confirm the plan with the user before dispatching, unless they said to go ahead.
- Include mission titles and IDs when reporting status.
- If a mission fails, read its report before retrying.
- Max 3 concurrent agents by default. Check `get_dashboard` for slot availability.
- Mission dependencies form a DAG — do not create circular dependencies.
- Each agent runs in an isolated git worktree and auto-merges on completion.
