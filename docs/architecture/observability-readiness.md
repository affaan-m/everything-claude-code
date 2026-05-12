# ECC 2.0 Observability Readiness

ECC 2.0 should be observable before it becomes more autonomous. The local
default is an opt-in, repo-owned readiness gate that checks whether the core
signals are present without sending telemetry anywhere.

Run:

```bash
npm run observability:ready
node scripts/observability-readiness.js --format json
```

The gate is deterministic and safe to run in CI. It only checks repository
files and reports whether the release surface can expose the signals an
operator needs.

## Signal Model

- Live status: `scripts/loop-status.js` can emit JSON, watch active loops, and
  write snapshots for dashboards or handoffs.
- Session traces: `scripts/session-inspect.js` can inspect Claude, dmux, and
  adapter-backed sessions, then write canonical snapshots.
- Harness baseline: `scripts/harness-audit.js` provides a repeatable scorecard
  for tool coverage, context efficiency, quality gates, memory persistence,
  eval coverage, security guardrails, and cost efficiency.
- Tool activity: `scripts/hooks/session-activity-tracker.js` records local
  `tool-usage.jsonl` events that ECC2 can sync.
- Risk ledger: `ecc2/src/observability/mod.rs` scores tool calls and stores a
  paginated ledger for review.

## Reference Pressure

The current agent-tooling ecosystem is converging on the same operating needs:

- dmux, Orca, and Superset emphasize isolated worktrees plus one place to see
  agent state and merge/review work.
- Claude HUD makes context, tool activity, agent activity, and todo progress
  visible inside the coding loop.
- Autocontext records every run as durable traces, reports, artifacts, and
  reusable improvements.
- Meta-Harness treats the harness itself as something to evaluate and improve,
  which requires clean logs of proposer behavior and outcomes.
- Zed and OpenCode emphasize agent control surfaces, reviewable changes, and
  harness-specific configuration that should still preserve portable project
  knowledge.

ECC's answer is not a hosted analytics dependency by default. The first
release-candidate gate is local and file-backed. Hosted telemetry can come
later, but only after the local event model is useful enough to trust.

## Operator Workflow

1. Run `npm run observability:ready`.
2. Run `npm run harness:audit -- --format json` for the broader harness
   scorecard.
3. Run `node scripts/loop-status.js --json --write-dir .ecc/loop-status`
   during longer autonomous batches.
4. Run `node scripts/session-inspect.js --list-adapters` to confirm which
   session surfaces are available.
5. Use ECC2 tool logs for risky operations, conflict analysis, and handoff
   review before increasing autonomy.

The end-state is practical: before asking ECC to run larger multi-agent loops,
the operator can prove the system has live status, durable session traces,
baseline scorecards, and a local risk ledger.
