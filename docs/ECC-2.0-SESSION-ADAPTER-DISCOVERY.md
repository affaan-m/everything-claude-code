# ECC 2.0 Session Adapter Discovery

## Purpose

This document turns the March 11 ECC 2.0 control-plane direction into a
concrete adapter and snapshot design grounded in the orchestration code that
already exists in this repo.

## Current Implemented Substrate

The repo already has a real first-pass orchestration substrate:

- `scripts/lib/tmux-worktree-orchestrator.js`
  provisions tmux panes plus isolated git worktrees
- `scripts/orchestrate-worktrees.js`
  is the current session launcher
- `scripts/lib/orchestration-session.js`
  collects machine-readable session snapshots
- `scripts/orchestration-status.js`
  exports those snapshots from a session name or plan file
- `commands/sessions.md`
  already exposes adjacent session-history concepts from Claude's local store
- `scripts/lib/session-adapters/canonical-session.js`
  defines the canonical `ecc.session.v1` normalization layer
- `scripts/lib/session-adapters/dmux-tmux.js`
  wraps the current orchestration snapshot collector as adapter `dmux-tmux`
- `scripts/lib/session-adapters/claude-history.js`
  normalizes Claude local session history as a second adapter
- `scripts/lib/session-adapters/registry.js`
  selects adapters from explicit targets and target types
- `scripts/session-inspect.js`
  emits canonical read-only session snapshots through the adapter registry

In practice, ECC can already answer:

- what workers exist in a tmux-orchestrated session
- what pane each worker is attached to
- what task, status, and handoff files exist for each worker
- whether the session is active and how many panes/workers exist
- what the most recent Claude local session looked like in the same canonical
  snapshot shape as orchestration sessions

That is enough to prove the substrate. It is not yet enough to qualify as a
general ECC 2.0 control plane.

## What The Current Snapshot Actually Models

The current snapshot model coming out of `scripts/lib/orchestration-session.js`
has these effective fields:

```json
{
  "sessionName": "workflow-visual-proof",
  "coordinationDir": ".../.claude/orchestration/workflow-visual-proof",
  "repoRoot": "...",
  "targetType": "plan",
  "sessionActive": true,
  "paneCount": 2,
  "workerCount": 2,
  "workerStates": {
    "running": 1,
    "completed": 1
  },
  "panes": [
    {
      "paneId": "%95",
      "windowIndex": 1,
      "paneIndex": 0,
      "title": "seed-check",
      "currentCommand": "codex",
      "currentPath": "/tmp/worktree",
      "active": false,
      "dead": false,
      "pid": 1234
    }
  ],
  "workers": [
    {
      "workerSlug": "seed-check",
      "workerDir": ".../seed-check",
      "status": {
        "state": "running",
        "updated": "...",
        "branch": "...",
        "worktree": "...",
        "taskFile": "...",
        "handoffFile": "..."
      },
      "task": {
        "objective": "...",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "handoff": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "files": {
        "status": ".../status.md",
        "task": ".../task.md",
        "handoff": ".../handoff.md"
      },
      "pane": {
        "paneId": "%95",
        "title": "seed-check"
      }
    }
  ]
}
```

This is already a useful operator payload. The main limitation is that it is
implicitly tied to one execution style:

- tmux pane identity
- worker slug equals pane title
- markdown coordination files
- plan-file or session-name lookup rules

## Gap Between ECC 1.x And ECC 2.0

ECC 1.x currently has two different "session" surfaces:

1. Claude local session history
2. Orchestration runtime/session snapshots

Those surfaces are adjacent but not unified.

The missing ECC 2.0 layer is a harness-neutral session adapter boundary that
can normalize:

- tmux-orchestrated workers
- plain Claude sessions
- Codex worktree sessions
- OpenCode sessions
- future GitHub/App or remote-control sessions

Without that adapter layer, any future operator UI would be forced to read
tmux-specific details and coordination markdown directly.

## Adapter Boundary

ECC 2.0 should introduce a canonical session adapter contract.

Suggested minimal interface:

```ts
type SessionAdapter = {
  id: string;
  canOpen(target: SessionTarget): boolean;
  open(target: SessionTarget): Promise<AdapterHandle>;
};

type AdapterHandle = {
  getSnapshot(): Promise<CanonicalSessionSnapshot>;
  streamEvents?(onEvent: (event: SessionEvent) => void): Promise<() => void>;
  runAction?(action: SessionAction): Promise<ActionResult>;
};
```

### Canonical Snapshot Shape

Suggested first-pass canonical payload:

```json
{
  "schemaVersion": "ecc.session.v1",
  "adapterId": "dmux-tmux",
  "session": {
    "id": "workflow-visual-proof",
    "kind": "orchestrated",
    "state": "active",
    "repoRoot": "...",
    "sourceTarget": {
      "type": "plan",
      "value": ".claude/plan/workflow-visual-proof.json"
    }
  },
  "workers": [
    {
      "id": "seed-check",
      "label": "seed-check",
      "state": "running",
      "branch": "...",
      "worktree": "...",
      "runtime": {
        "kind": "tmux-pane",
        "command": "codex",
        "pid": 1234,
        "active": false,
        "dead": false
      },
      "intent": {
        "objective": "...",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "outputs": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "artifacts": {
        "statusFile": "...",
        "taskFile": "...",
        "handoffFile": "..."
      }
    }
  ],
  "aggregates": {
    "workerCount": 2,
    "states": {
      "running": 1,
      "completed": 1
    }
  }
}
```

This preserves the useful signal already present while removing tmux-specific
details from the control-plane contract.

## First Adapters To Support

### 1. `dmux-tmux`

Wrap the logic already living in
`scripts/lib/orchestration-session.js`.

This is the easiest first adapter because the substrate is already real.

### 2. `claude-history`

Normalize the data that
`commands/sessions.md`
and the existing session-manager utilities already expose:

- session id / alias
- branch
- worktree
- project path
- recency / file size / item counts

This provides a non-orchestrated baseline for ECC 2.0.

### 3. `codex-worktree`

Use the same canonical shape, but back it with Codex-native execution metadata
instead of tmux assumptions where available.

### 4. `opencode`

Use the same adapter boundary once OpenCode session metadata is stable enough to
normalize.

## What Should Stay Out Of The Adapter Layer

The adapter layer should not own:

- business logic for merge sequencing
- operator UI layout
- pricing or monetization decisions
- install profile selection
- tmux lifecycle orchestration itself

Its job is narrower:

- detect session targets
- load normalized snapshots
- optionally stream runtime events
- optionally expose safe actions

## Current File Layout

The adapter layer now lives in:

```text
scripts/lib/session-adapters/
  canonical-session.js
  dmux-tmux.js
  claude-history.js
  registry.js
scripts/session-inspect.js
tests/lib/session-adapters.test.js
tests/scripts/session-inspect.test.js
```

The current orchestration snapshot parser is now being consumed as an adapter
implementation rather than remaining the only product contract.

## Immediate Next Steps

1. Add a third adapter, likely `codex-worktree`, so the abstraction moves
   beyond tmux plus Claude-history.
2. Decide whether canonical snapshots need separate `state` and `health`
   fields before UI work starts.
3. Decide whether event streaming belongs in v1 or stays out until after the
   snapshot layer proves itself.
4. Build operator-facing panels only on top of the adapter registry, not by
   reading orchestration internals directly.

## Open Questions

1. Should worker identity be keyed by worker slug, branch, or stable UUID?
2. Do we need separate `state` and `health` fields at the canonical layer?
3. Should event streaming be part of v1, or should ECC 2.0 ship snapshot-only
   first?
4. How much path information should be redacted before snapshots leave the local
   machine?
5. Should the adapter registry live inside this repo long-term, or move into the
   eventual ECC 2.0 control-plane app once the interface stabilizes?

## Recommendation

Treat the current tmux/worktree implementation as adapter `0`, not as the final
product surface.

The shortest path to ECC 2.0 is:

1. preserve the current orchestration substrate
2. wrap it in a canonical session adapter contract
3. add one non-tmux adapter
4. only then start building operator panels on top
