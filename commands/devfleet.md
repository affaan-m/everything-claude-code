# DevFleet — Multi-Agent Orchestration

Orchestrate parallel Claude Code agents via Claude DevFleet. Each agent runs in an isolated git worktree with full tooling.

Requires the DevFleet MCP server: `claude mcp add devfleet --transport sse http://localhost:18801/mcp/sse`

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

The remaining missions auto-dispatch as their dependencies complete.

4. **Monitor progress** — check what's running:

```
mcp__devfleet__get_dashboard()
```

Or check a specific mission:

```
mcp__devfleet__get_mission_status(mission_id="<id>")
```

5. **Read the report** when missions complete:

```
mcp__devfleet__get_report(mission_id="<id>")
```

Reports contain: files_changed, what_done, what_open, what_tested, what_untested, next_steps, errors_encountered.

## All Available Tools

| Tool | Purpose |
|------|---------|
| `plan_project(prompt)` | AI breaks description into chained missions |
| `create_project(name, path?, description?)` | Create a project manually |
| `create_mission(project_id, title, prompt, depends_on?, auto_dispatch?)` | Add a mission |
| `dispatch_mission(mission_id, model?, max_turns?)` | Start an agent |
| `cancel_mission(mission_id)` | Stop a running agent |
| `wait_for_mission(mission_id, timeout_seconds?)` | Block until done |
| `get_mission_status(mission_id)` | Check progress |
| `get_report(mission_id)` | Read structured report |
| `get_dashboard()` | System overview |
| `list_projects()` | Browse projects |
| `list_missions(project_id, status?)` | List missions |

## Guidelines

- Always confirm the plan before dispatching unless the user said "go ahead"
- Include mission titles and IDs when reporting status
- If a mission fails, read its report to understand errors before retrying
- Max 3 concurrent agents — check `get_dashboard()` for slot availability
- Dependencies form a DAG — never create circular dependencies
- Each agent auto-merges its worktree on completion
