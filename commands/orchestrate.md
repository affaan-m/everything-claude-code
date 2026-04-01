---
description: Legacy slash-entry shim for dmux-workflows and autonomous-agent-harness. Prefer the skills directly.
---

# Orchestrate Command (Legacy Shim)

Use this only if you still invoke `/orchestrate`. The maintained orchestration guidance lives in `skills/dmux-workflows/SKILL.md` and `skills/autonomous-agent-harness/SKILL.md`.

## Canonical Surface

- Prefer `dmux-workflows` for parallel panes, worktrees, and multi-agent splits.
- Prefer `autonomous-agent-harness` for longer-running loops, governance, scheduling, and control-plane style execution.
- Keep this file only as a compatibility entry point.

## Arguments

`$ARGUMENTS`

## Delegation

Apply the orchestration skills instead of maintaining a second workflow spec here.
- Start with `dmux-workflows` for split/parallel execution.
- Pull in `autonomous-agent-harness` when the user is really asking for persistent loops, governance, or operator-layer behavior.
- Keep handoffs structured, but let the skills define the maintained sequencing rules.
Security Reviewer: [summary]

FILES CHANGED
-------------
[List all files modified]

TEST RESULTS
------------
[Test pass/fail summary]

SECURITY STATUS
---------------
[Security findings]

RECOMMENDATION
--------------
[SHIP / NEEDS WORK / BLOCKED]
```

## Parallel Execution

For independent checks, run agents in parallel:

```markdown
### Parallel Phase
Run simultaneously:
- code-reviewer (quality)
- security-reviewer (security)
- architect (design)

### Merge Results
Combine outputs into single report
```

For external tmux-pane workers with separate git worktrees, use `node scripts/orchestrate-worktrees.js plan.json --execute`. The built-in orchestration pattern stays in-process; the helper is for long-running or cross-harness sessions.

When workers need to see dirty or untracked local files from the main checkout, add `seedPaths` to the plan file. ECC overlays only those selected paths into each worker worktree after `git worktree add`, which keeps the branch isolated while still exposing in-flight local scripts, plans, or docs.

```json
{
  "sessionName": "workflow-e2e",
  "seedPaths": [
    "scripts/orchestrate-worktrees.js",
    "scripts/lib/tmux-worktree-orchestrator.js",
    ".claude/plan/workflow-e2e-test.json"
  ],
  "workers": [
    { "name": "docs", "task": "Update orchestration docs." }
  ]
}
```

To export a control-plane snapshot for a live tmux/worktree session, run:

```bash
node scripts/orchestration-status.js .claude/plan/workflow-visual-proof.json
```

The snapshot includes session activity, tmux pane metadata, worker states, objectives, seeded overlays, and recent handoff summaries in JSON form.

## Operator Command-Center Handoff

When the workflow spans multiple sessions, worktrees, or tmux panes, append a control-plane block to the final handoff:

```markdown
CONTROL PLANE
-------------
Sessions:
- active session ID or alias
- branch + worktree path for each active worker
- tmux pane or detached session name when applicable

Diffs:
- git status summary
- git diff --stat for touched files
- merge/conflict risk notes

Approvals:
- pending user approvals
- blocked steps awaiting confirmation

Telemetry:
- last activity timestamp or idle signal
- estimated token or cost drift
- policy events raised by hooks or reviewers
```

This keeps planner, implementer, reviewer, and loop workers legible from the operator surface.

## Arguments

$ARGUMENTS:
- `feature <description>` - Full feature workflow
- `bugfix <description>` - Bug fix workflow
- `refactor <description>` - Refactoring workflow
- `security <description>` - Security review workflow
- `custom <agents> <description>` - Custom agent sequence

## Custom Workflow Example

```
/orchestrate custom "architect,tdd-guide,code-reviewer" "Redesign caching layer"
```

## Tips

1. **Start with planner** for complex features
2. **Always include code-reviewer** before merge
3. **Use security-reviewer** for auth/payment/PII
4. **Keep handoffs concise** - focus on what next agent needs
5. **Run verification** between agents if needed
