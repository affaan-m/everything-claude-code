# Orchestrator MVP

Deterministic Jira-driven agent orchestration for ECC. This MVP keeps the control plane small and explicit: Jira ticket input, typed state transitions, artifact-based handoffs, isolated git worktrees, and reproducible quality gates.

## Scope

- TypeScript CLI in `tools/orchestrator/`
- Typed workflow state machine without a long-running supervisor loop
- `sql.js`-backed run store with `runs`, `artifacts`, and `events`
- Jira adapter with environment-based live mode and safe mock fallback
- Git worktree creation per Jira ticket
- Context pack, plan, review, and verification artifacts under `.task/<jira-key>/`
- Configurable agent runner abstraction
- Deterministic quality gate execution and persisted reports

## Setup

ECC already installs the root dependencies needed by this MVP. The orchestrator package intentionally reuses the root `typescript` and `sql.js` installations to keep the first implementation small.

Recommended environment variables:

```bash
export JIRA_BASE_URL="https://your-org.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_API_TOKEN="atlassian-api-token"
export GITHUB_TOKEN="github-token"
export AGENT_RUNNER="mock"
export ORCHESTRATOR_ALLOW_HIGH_RISK="0"
export ORCHESTRATOR_DB_PATH="/absolute/path/to/runs.db"
```

If Jira credentials are not present, the CLI falls back to a deterministic mock issue payload so the local MVP workflow can still be demonstrated.

Runner modes:

- `AGENT_RUNNER=mock` keeps the MVP fully local and deterministic.
- `AGENT_RUNNER=codex` uses `scripts/orchestrate-codex-worker.sh` inside the ticket worktree and captures worker handoff/status artifacts.
- `ORCHESTRATOR_ALLOW_HIGH_RISK=1` is an explicit operator override for supervised execution of runs that would otherwise stop in `APPROVAL_REQUIRED`.
- `CODEX_DANGEROUS_BYPASS=1` can be set for externally sandboxed VPS environments where nested `codex exec` calls fail under bubblewrap.

The CLI auto-loads environment values from the first matching files it finds:

```text
$ORCHESTRATOR_ENV_FILE
/etc/orchestrator.env
~/.orchestrator.env
tools/orchestrator/.env.local
```

Supported Jira variable names:

```text
JIRA_BASE_URL or JIRA_URL
JIRA_EMAIL
JIRA_API_TOKEN
```

## Commands

Run from `tools/orchestrator/`:

```bash
npm run orchestrator -- plan KAN-259
npm run orchestrator -- run KAN-259
npm run orchestrator -- resume <run-id>
npm run orchestrator -- status <run-id>
```

From the repo root you can use:

```bash
npm run orchestrator:run -- KAN-259
npm run orchestrator:plan -- KAN-259
npm run orchestrator:status -- <run-id>
```

## Architecture

```text
Jira ticket
-> typed state machine
-> run + artifact store
-> context pack builder
-> spec plan agent runner
-> worktree isolation
-> quality gates
-> reviewer output
-> PR preparation metadata
```

Core modules:

- `src/machine.ts` — allowed state transitions and transition helper
- `src/state.ts` — persisted `runs`, `artifacts`, and `events`
- `src/jira.ts` — Jira adapter with live and mock modes
- `src/worktree.ts` — isolated branch/worktree creation
- `src/contextPack.ts` — compact execution context artifact
- `src/agents.ts` — mockable spec, builder, and reviewer runner
- `src/gates.ts` — deterministic gate execution and report generation
- `src/rules.ts` — risk classification and handoff rules
- `src/index.ts` — CLI entrypoint

## Artifacts

The orchestrator writes structured handoff artifacts to:

```text
.task/<jira-key>/
  context_pack.json
  plan.json
  relevant_files.json
  risk_assessment.md
  implementation_summary.md
  self_check.md
  test_report.md
  review_report.md
  metrics.json
```

## Limits

- The first MVP ships a typed state machine instead of XState to keep the package small and reviewable. The machine surface is isolated so XState can replace it later without reworking the CLI contract.
- The default agent runner is `mock`. `AGENT_RUNNER=codex` switches the builder step to a real Codex worker through the existing shell launcher.
- If `gh` is authenticated, the orchestrator now commits, pushes, and opens or reuses a draft PR for `PR_READY` runs. It also attempts to write the PR link back to Jira when live Jira credentials are available.
- If `gh` is not installed, the orchestrator falls back to `GITHUB_TOKEN` plus the GitHub REST API for PR lookup and draft PR creation.
- A self-hosted GitHub Actions entrypoint is provided in `.github/workflows/orchestrator-dispatch.yml` for the VPS-triggered path described in `KAN-259`.
- Quality gates skip unavailable root scripts rather than guessing replacements.
