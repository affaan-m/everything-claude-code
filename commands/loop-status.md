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
- `ecc loop-status --transcript <session.jsonl>` inspects one transcript
  directly.
- `ecc loop-status --bash-timeout-seconds 1800` adjusts the stale Bash
  threshold.

## Watch Mode

When `--watch` is present, refresh status periodically and surface state changes.

## Arguments

$ARGUMENTS:
- `--watch` optional
