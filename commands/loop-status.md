---
description: Inspect active loop state, progress, failure signals, and recommended intervention.
---

# Loop Status Command

Inspect active loop state, progress, and failure signals.

This slash command can only run after the current session dequeues it. If you
need to inspect a wedged or sibling session, run the packaged CLI from another
terminal:

```bash
npx --package ecc-universal ecc loop-status --json
```

The CLI scans local Claude transcript JSONL files under
`~/.claude/projects/**` and reports stale `ScheduleWakeup` calls or `Bash`
tool calls that have no matching `tool_result`.

## Usage

`/loop-status [--watch]`

## What to Report

- active loop pattern
- current phase and last successful checkpoint
- failing checks (if any)
- estimated time/cost drift
- recommended intervention (continue/pause/stop)

## Cross-Session CLI

- `ecc loop-status --json` emits machine-readable status for recent local
  Claude transcripts.
- `ecc loop-status --home <dir>` scans a different home directory when
  inspecting another local profile or mounted workspace.
- `ecc loop-status --transcript <session.jsonl>` inspects one transcript
  directly.
- `ecc loop-status --bash-timeout-seconds 1800` adjusts the stale Bash
  threshold.
- `ecc loop-status --watch` refreshes status until interrupted.
- `ecc loop-status --watch --watch-count 3` emits a bounded watch stream for
  scripts and handoffs.

## Watch Mode

When `--watch` is present, refresh status periodically. With `--json`, each
refresh is emitted as one JSON object per line so another terminal or script can
consume the stream.

## Arguments

$ARGUMENTS:
- `--watch` optional
