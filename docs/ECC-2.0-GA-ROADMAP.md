# ECC 2.0 GA Roadmap

This roadmap is the durable repo mirror for the Linear project:

<https://linear.app/ecctools/project/ecc-20-ga-harness-os-security-platform-de2a0ecace6f>

Linear issue creation is currently blocked by the workspace active issue limit,
so the live execution truth is split across:

- the Linear project description, status updates, and milestones;
- this repo document;
- merged PR evidence;
- handoffs under `~/.cluster-swarm/handoffs/`.

## Current Evidence

As of 2026-05-12:

- Public GitHub queues are clean across `everything-claude-code`,
  `agentshield`, `JARVIS`, `ECC-Tools`, and `ECC-website`.
- `npm run harness:audit -- --format json` reports 70/70 on current `main`.
- `npm run observability:ready` reports 14/14 readiness on current `main`.
- AgentShield PR #53 reduced two context-rule false positives and closed the
  remaining AgentShield issues.
- ECC PR #1778 recovered the useful stale #1413 network/homelab architect-agent
  concepts.

## Operating Rules

- Keep public PRs and issues below 20, with zero as the preferred release-lane
  target.
- Maintain 70/70 harness audit and 14/14 observability readiness after every
  GA-readiness batch.
- Do not publish release or social announcements until the GitHub release,
  npm/package state, billing state, and plugin submission surfaces are verified
  with fresh evidence.
- Do not treat closed stale PRs as discarded. Inspect them, port useful current
  compatible work on maintainer-owned branches, and credit the source PR.
- Do not create new Linear issues until the active issue limit is cleared.

## Reference Pressure

The GA roadmap is informed by these reference surfaces:

- `stablyai/orca` and `superset-sh/superset` for worktree-native parallel agent
  UX, review loops, and workspace presets.
- `standardagents/dmux` and `aidenybai/ghast` for terminal/worktree
  multiplexing, session grouping, and lifecycle hooks.
- `jarrodwatts/claude-hud` for always-visible status, tool, agent, todo, and
  context telemetry.
- `stanford-iris-lab/meta-harness` and `greyhaven-ai/autocontext` for
  evaluation-driven harness improvement, traces, playbooks, and promotion
  loops.
- `NousResearch/hermes-agent` for operator shell, gateway, memory, skills, and
  multi-platform command patterns.
- `anthropics/claude-code`, active `sst/opencode` / `anomalyco/opencode`, Zed,
  Codex, Cursor, Gemini, and terminal-only workflows for adapter expectations.

The output of this reference work should be concrete ECC deltas, not a second
strategy memo.

## Milestones

### 1. GA Release, Naming, And Plugin Publication Readiness

Target: 2026-05-24

Acceptance:

- Naming matrix covers product name, npm package, Claude plugin, Codex plugin,
  OpenCode package, marketplace metadata, docs, and migration copy.
- GitHub release, npm dist-tag, plugin publication, and announcement gates are
  mapped to fresh command evidence.
- Release notes, migration guide, known issues, quickstart, X thread, LinkedIn
  post, and GitHub release copy are ready but not posted before release URLs
  exist.
- Plugin publication/contact paths for Claude and Codex are documented with
  owner, required artifacts, and submission status.

### 2. Harness Adapter Compliance Matrix And Scorecard Onramp

Target: 2026-05-31

Acceptance:

- Adapter matrix covers Claude Code, Codex, OpenCode, Cursor, Gemini,
  Zed-adjacent surfaces, dmux, Orca, Superset, Ghast, and terminal-only use.
- Each adapter has supported assets, unsupported surfaces, install path,
  verification command, and risk notes.
- Harness audit remains 70/70 and gains a public onramp that explains how teams
  use the scorecard.
- Reference findings are converted into concrete adapter, observability, or
  operator-surface deltas.

### 3. Local Observability, HUD/Status, And Session Control Plane

Target: 2026-06-07

Acceptance:

- Observability readiness remains 14/14 and is backed by JSONL traces, status
  snapshots, risk ledger, and exportable handoff contracts.
- HUD/status model covers context, tool calls, active agents, todos, checks,
  cost, risk, and queue state.
- Worktree/session controls cover create, resume, status, stop, diff, PR,
  merge queue, and conflict queue.
- Linear/GitHub/handoff sync model is explicit enough for real-time progress
  tracking.

### 4. Self-Improving Harness Evaluation Loop

Target: 2026-06-10

Acceptance:

- Scenario specs, verifier contracts, traces, playbooks, and regression gates
  are documented and at least one read-only prototype exists.
- The loop separates observation, proposal, verification, and promotion.
- Team and individual setups can be scored and improved without blindly
  mutating configs.
- RAG/reference-set design covers vetted ECC patterns, team history, CI
  failures, diffs, review outcomes, and harness config quality.

### 5. AgentShield Enterprise Security Platform

Target: 2026-06-14

Acceptance:

- Formal policy schema exists for org baselines, exceptions, owners,
  expiration, severity, and audit trails.
- SARIF/code-scanning output is implemented and tested.
- Policy packs are defined for OSS, team, enterprise, regulated, high-risk
  hooks/MCP, and CI enforcement.
- Supply-chain intelligence plan covers MCP package provenance, npm/pip
  reputation, CVEs, typosquats, and dependency risk.
- Prompt-injection corpus and regression benchmark are ready for continuous
  rule hardening.
- Enterprise reports include JSON plus HTML/PDF or equivalent executive output.

### 6. ECC Tools Billing, Deep Analysis, PR Checks, And Linear Sync

Target: 2026-06-21

Acceptance:

- Native GitHub Marketplace billing announcement is backed by verified
  implementation and docs.
- Billing audit covers plan limits, seats, org/account mapping, subscription
  state, overage hooks, and failure modes.
- Deep analyzer covers diff patterns, CI/CD workflows, dependency/security
  surface, PR review behavior, failure history, harness config, skill quality,
  and reference-set/RAG comparison.
- PR check suite taxonomy includes Security Evidence, Harness Drift, Install
  Manifest Integrity, CI/CD Recommendation, Cost/Token Risk, and Agent Config
  Review.
- Linear sync design maps findings to issues/status without flooding the
  workspace.

### 7. Legacy Audit And Stale-Work Salvage Closure

Target: 2026-06-15

Acceptance:

- Legacy directories and orphaned handoffs are inventoried.
- Each useful artifact is marked landed, Linear/project-tracked, salvage
  branch, or archive/no-action.
- Stale PR salvage policy stays in force: close stale/conflicted PRs first,
  then port useful compatible content on maintainer branches with attribution.
- #1687 localization leftovers are handled only by translator/manual review,
  not blind cherry-pick.

## Next Engineering Slices

1. Add the harness adapter compliance matrix and public scorecard onramp.
2. Add the release/name/plugin publication checklist with evidence fields.
3. Start AgentShield enterprise policy schema and SARIF implementation in the
   AgentShield repo.
4. Audit ECC Tools billing and check-run surfaces before any native GitHub
   payments announcement.
5. Inventory `_legacy-documents-*` and map useful artifacts to landed,
   milestone-tracked, salvage, or archive states.
