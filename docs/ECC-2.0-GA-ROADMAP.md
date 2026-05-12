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

- Public GitHub queues are clean across `affaan-m/everything-claude-code`,
  `affaan-m/agentshield`, `affaan-m/JARVIS`, `ECC-Tools/ECC-Tools`, and
  `ECC-Tools/ECC-website`.
- Public GitHub discussions are also clean across those tracked repos:
  `states: OPEN` returned zero discussions for every accessible discussion
  surface on 2026-05-12.
- The final open public GitHub issue, #1314, was closed as a non-actionable
  external badge/listing notification with a courtesy comment.
- Linear issue creation for this project was re-tested after GitHub cleanup and
  is still blocked by the workspace free issue limit. Seven roadmap-lane issue
  creation attempts all returned the same limit error, so this repo mirror and
  Linear project status updates remain the active tracking surfaces until the
  workspace is upgraded or issue capacity is freed.
- `npm run harness:audit -- --format json` reports 70/70 on current `main`.
- `npm run observability:ready` reports 16/16 readiness on current `main`.
- `docs/architecture/harness-adapter-compliance.md` maps Claude Code, Codex,
  OpenCode, Cursor, Gemini, Zed-adjacent, dmux, Orca, Superset, Ghast, and
  terminal-only support to install paths, verification commands, and risk
  notes.
- `npm run harness:adapters -- --check` validates that the public adapter
  matrix still matches the source data in
  `scripts/lib/harness-adapter-compliance.js`.
- `docs/releases/2.0.0-rc.1/publication-readiness.md` gates GitHub release,
  npm dist-tag, Claude plugin, Codex plugin, OpenCode package, billing, and
  announcement publication on fresh evidence fields.
- `docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md` records the
  rc.1 naming decision: ship as Everything Claude Code (ECC), keep
  `ecc-universal` for npm, keep `ecc` for Claude/Codex plugin slugs, and defer
  any broader repo/package rename until after the release pipeline is proven.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-12.md` records the
  dry-run publication evidence pass: npm pack/publish dry-runs, temp install
  smoke, Claude plugin validation/tag preflight, Codex marketplace CLI shape,
  OpenCode build, and the remaining approval-gated release blockers.
- A detached clean worktree at
  `bfacf37715b39655cbc2c48f12f2a35c67cb0253` verified Claude plugin tag
  dry-run without `--force`, local marketplace discovery, temp-home local
  install, enabled plugin listing, and clean uninstall for `ecc@ecc`
  `2.0.0-rc.1`.
- The npm package surface now excludes Python bytecode/cache artifacts through
  package `files` negation rules and a publish-surface regression test.
- `docs/legacy-artifact-inventory.md` records that no `_legacy-documents-*`
  directories exist in the current checkout, inventories the two sibling
  workspace-level `_legacy-documents-*` repos as sanitized extraction sources,
  and classifies `legacy-command-shims/` as an opt-in archive/no-action
  surface.
- `docs/stale-pr-salvage-ledger.md` records stale PR salvage outcomes,
  skipped PRs, superseded work, and the remaining #1687 translator/manual
  review tail.
- AgentShield PR #53 reduced two context-rule false positives and closed the
  remaining AgentShield issues.
- AgentShield PR #55 added GitHub Action organization-policy enforcement with
  `policy` / `fail-on-policy` inputs, `policy-status` /
  `policy-violations` outputs, job-summary evidence, and policy violation
  annotations.
- AgentShield PR #56 added SARIF/code-scanning output for organization-policy
  violations as `agentshield-policy/*` results.
- AgentShield PR #57 added OSS, team, enterprise, regulated,
  high-risk-hooks/MCP, and CI-enforcement policy-pack presets plus
  `agentshield policy init --pack`.
- AgentShield PR #58 added MCP package provenance fields and report-level
  counts for npm vs git, pinned vs unpinned, known-good, and registry-backed
  supply-chain evidence.
- AgentShield PR #59 added self-contained HTML executive summaries with risk
  posture, critical/high priority findings, category exposure, README/API
  docs, built-CLI smoke validation, and 1,704-test coverage.
- AgentShield PR #60 added category-level built-in corpus benchmark output,
  a `readyForRegressionGate` signal, terminal `--corpus` category coverage,
  README/API docs, built-CLI smoke validation, and 1,705-test coverage.
- AgentShield PR #61 cleared the remaining Dependabot security/bugfix PR with
  a lockfile-only `postcss` 8.5.6 -> 8.5.14 bump after local typecheck, full
  tests, lint, build, and remote self-scan/action verification.
- AgentShield PR #62 added organization-policy exception lifecycle audit
  evidence: active, expiring-soon, and expired exception counts; owner, ticket,
  scope, expiry, and days-until-expiry reporting; terminal output and GitHub
  Action job-summary evidence; README docs; rebuilt action bundles; and
  1,708-test validation.
- ECC PR #1778 recovered the useful stale #1413 network/homelab architect-agent
  concepts.
- ECC-Tools PR #26 added cost/token-risk predictive follow-ups for AI routing,
  Claude/model calls, usage limits, quota, and analysis-budget changes that lack
  budget, quota, rate-limit, or cost validation evidence.
- ECC-Tools PR #27 added the non-blocking `ECC Tools / PR Risk Taxonomy`
  check-run for Security Evidence, Harness Drift, Install Manifest Integrity,
  CI/CD Recommendation, Cost/Token Risk, and Agent Config Review buckets.
- ECC-Tools PR #28 added billing readiness audit checks for plan limits,
  entitlements, Marketplace plan shape, subscription source, seats, and
  overage metering.
- ECC-Tools PR #29 added deterministic Reference Set Validation signals for
  analyzer, skill, agent, command, and harness-guidance changes that lack eval,
  golden trace, benchmark, or reference-set evidence.
- ECC-Tools PR #30 capped follow-up generation to three new GitHub issues and
  one draft PR per run, then emits the remaining deterministic findings as a
  project sync backlog for Linear/status tracking without flooding trackers.
- ECC-Tools PR #31 added review follow-up signals to analysis completion
  comments for outstanding change requests, unresolved or outdated review
  threads, and review activity without an explicit approval.
- ECC-Tools PR #32 added CI failure-mode predictive follow-ups for workflow
  and test-runner changes that lack failure fixtures, captured logs,
  troubleshooting notes, dry-run evidence, or regression coverage.
- ECC-Tools PR #33 added harness-config quality predictive follow-ups for MCP,
  plugin, agent, hook, command, and harness config changes that lack harness
  audit, adapter matrix, cross-harness docs, or compatibility regression
  evidence.
- ECC-Tools PR #34 added skill-quality predictive follow-ups and a Skill
  Quality PR-risk bucket for skill, agent, command, and rule guidance changes
  that lack examples, validation, eval, or reference evidence.
- ECC-Tools PR #35 added RAG/evaluator predictive follow-ups and a
  RAG/Evaluator Evidence PR-risk bucket for retrieval, embedding, ranking, and
  evaluator changes that lack reference-set comparison, golden trace,
  benchmark, fixture, or eval-run evidence.
- ECC-Tools PR #36 added deep-analyzer predictive follow-ups, a Deep Analyzer
  Evidence PR-risk bucket, and a Linear-ready project sync backlog table for
  deferred follow-up work.
- ECC-Tools PR #37 added a maintained analyzer corpus fixture, corpus validation
  tests, and co-located analyzer reference-set evidence recognition for future
  predictive follow-ups and PR-risk taxonomy checks.
- ECC-Tools PR #38 added PR review/stale-salvage predictive follow-ups, a
  PR Review/Salvage Evidence taxonomy bucket, and maintained corpus fixtures
  for stale-closure salvage, reviewer-thread, and reopen-flow evidence.
- ECC-Tools PR #39 added opt-in native Linear GraphQL sync for deferred
  follow-up backlog items, preserving GitHub object caps while creating or
  reusing Linear issues when `LINEAR_API_KEY` and `LINEAR_TEAM_ID` are
  configured.
- ECC PR #1803 landed the contributor Quarkus handling branch after maintainer
  cleanup, current-`main` alignment, full local validation, and preservation of
  the author's removal of incomplete ja-JP and zh-CN Quarkus translations.
- ECC PR #1812 salvaged useful Django reviewer, Django build resolver, and
  Django Celery guidance from stale PR #1310 through a maintainer-owned branch
  with source credit, catalog sync, and full local/remote validation.
- ECC PR #1813 expanded the stale PR salvage ledger with source-to-salvage
  mappings for #1325, #1414, #1478, #1504, and #1603, confirming those useful
  stale contributions were already preserved through later maintainer PRs.
- ECC PR #1815 salvaged the useful stale #1304 cost-tracking and #1232
  skill-scout work into current command/skill conventions with current catalog
  sync and full local/remote validation.
- ECC PR #1816 salvaged the useful stale #1659 frontend design guidance into
  canonical ECC skill layout while preserving the guardrail that the official
  Anthropic `frontend-design` skill remains externally sourced.
- ECC PR #1817 salvaged the useful stale #1658 code-reviewer false-positive
  guardrails, adding proof gates for HIGH/CRITICAL findings, common
  false-positive exclusions, and a regression test.
- ECC PR #1818 recorded the May 12 stale-salvage gap pass, classifying already
  present work, skipped work, and translator/manual-review leftovers.

## Operating Rules

- Keep public PRs and issues below 20, with zero as the preferred release-lane
  target.
- Maintain 70/70 harness audit and 16/16 observability readiness after every
  GA-readiness batch.
- Do not publish release or social announcements until the GitHub release,
  npm/package state, billing state, and plugin submission surfaces are verified
  with fresh evidence.
- Do not treat closed stale PRs as discarded. Pair each cleanup batch with a
  salvage pass: inspect the closed diffs, port useful compatible work on
  maintainer-owned branches, and credit the source PR.
- Do not create new Linear issues until the active issue limit is cleared.

## Prompt-To-Artifact Execution Checklist

This table keeps the long operator prompt tied to concrete artifacts. A status
is not complete unless the evidence column exists and has been freshly verified.

| Prompt requirement | Required artifact or gate | Current evidence | Status |
| --- | --- | --- | --- |
| Keep public PRs below 20 | Repo-family PR recheck | 0 open PRs across the tracked public repos on 2026-05-12 | Complete for this checkpoint |
| Keep public issues below 20 | Repo-family issue recheck | 0 open issues across the tracked public repos on 2026-05-12 after closing #1314 as non-actionable badge/listing noise | Complete for this checkpoint |
| Manage repository discussions | Repo-family discussion recheck | 0 open discussions across the tracked public repos on 2026-05-12 via GraphQL `states: OPEN` checks | Complete for this checkpoint |
| Manage PR discussions | PR review/comment closure plus merge/close state | #1803 was maintainer-edited and merged; no open PRs remain | Complete for this checkpoint |
| Salvage useful stale work | `docs/stale-pr-salvage-ledger.md` | Ledger records salvaged, superseded, skipped, and manual-review tails; #1815-#1818 added cost tracking, skill scout, frontend design guidance, code-reviewer false-positive guardrails, and the May 12 gap pass | Complete except translation/manual review tail |
| ECC 2.0 preview pack ready | Release docs, quickstart, publication readiness, release notes | `docs/releases/2.0.0-rc.1/` and readiness docs are in-tree | Needs final release evidence |
| Hermes specialized skills included safely | Hermes setup/import docs and sanitized skill surface | Hermes setup and import playbook are public; secrets stay local | Needs final release review |
| Naming and rename readiness | Naming matrix across package/plugin/docs/social surfaces | `docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md` records current package, repo, Claude plugin, Codex plugin, OpenCode, and npm availability evidence | Complete for rc.1; post-rc rename remains future work |
| Claude and Codex plugin publication | Contact/submission path with required artifacts and status | Publication readiness, naming matrix, and May 12 dry-run evidence document plugin validation, clean-checkout Claude tag/install smoke, and Codex marketplace CLI shape | Needs explicit approval for real tag/push and marketplace submission |
| Articles, tweets, and announcements | X thread, LinkedIn copy, GitHub release copy, push checklist | Draft launch collateral exists under rc.1 release docs | Needs URL-backed refresh |
| AgentShield enterprise iteration | Policy gates, SARIF, packs, provenance, corpus, HTML reports, exception lifecycle audit | PRs #53, #55-#62 landed with test evidence | Needs PDF/export decision or next enterprise signal |
| ECC Tools next-level app | Billing audit, PR checks, deep analyzer, sync backlog | PRs #26-#39 landed with test evidence | Needs capacity-backed Linear rollout / broader evaluator corpus |
| GitGuardian/Dependabot/CodeRabbit-style checks | Non-blocking taxonomy and deterministic follow-up checks | ECC-Tools risk taxonomy check plus follow-up signals landed, including Skill Quality, Deep Analyzer Evidence, Analyzer Corpus Evidence, RAG/Evaluator Evidence, and PR Review/Salvage Evidence | Partially complete |
| Harness-agnostic learning system | Audit, adapter matrix, observability, traces, promotion loop | Audit/adapters/observability gates exist | Needs evaluation/RAG prototype |
| Linear roadmap is detailed | Linear project status plus repo mirror | Repo mirror exists; issue creation was retried on 2026-05-12 and remains blocked by the workspace free issue limit | Needs recurring status updates after each merge batch |
| Flow separation and progress tracking | Flow lanes with owner artifacts and update cadence | This roadmap defines lanes below | Active |
| Realtime Linear sync | Project updates while issue limit is blocked; issues later | ECC-Tools #39 implements opt-in Linear API sync for deferred follow-up backlog items | Needs workspace capacity/config rollout |
| Observability for self-use | Local readiness gate, traces, status snapshots, HUD/status contract, risk ledger | `npm run observability:ready` reports 16/16 | Complete for local gate |
| Proper release and notifications | Release tag, npm publish state, plugin state, social posts | Publication readiness gate exists | Not complete |

## Execution Lanes And Tracking Contract

Until Linear issue capacity is cleared, this document is the durable execution
ledger and Linear receives project status updates only. When capacity is
available, each lane below should become a small set of Linear issues linked
back to the repo evidence and merge commits.

| Lane | Source of truth | Next tracked artifact | Update cadence |
| --- | --- | --- | --- |
| Queue hygiene and salvage | GitHub PR/issue state, salvage ledger | Append ledger entries for any future stale closures | Every cleanup batch |
| Release and publication | rc.1 release docs, publication readiness doc | Naming matrix and plugin submission/contact checklist | Before any tag |
| Harness OS core | Audit, adapter matrix, observability docs, `ecc2/` | HUD/session-control acceptance spec | Weekly until GA |
| Evaluation and RAG | Reference-set validation, harness audit, traces | Read-only evaluator/RAG prototype design | Before deep analyzer expansion |
| AgentShield enterprise | AgentShield PR evidence and roadmap notes | PDF-export decision or next enterprise signal | After value decision |
| ECC Tools app | ECC-Tools PR evidence, billing audit, risk taxonomy | Capacity-backed Linear rollout or broader evaluator/RAG corpus slice | Next implementation batch |
| Linear progress | Linear project status updates and this mirror | Status update with queue/evidence/missing gates | Every significant merge batch |

The project status update should always include:

1. Current public PR and issue counts.
2. Merged evidence since the previous update.
3. Deferred or blocked items with the reason.
4. The next one or two implementation slices.
5. Any release or publication gate that is still not evidence-backed.

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

- Observability readiness remains 16/16 and is backed by JSONL traces, status
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

- Formal policy schema and evaluation output exist for org baselines,
  exceptions, owners, expiration, severity, audit trails, expiring-soon
  visibility, and expired-exception enforcement.
- SARIF/code-scanning output is implemented and tested.
- GitHub Action policy gates expose organization policy status and violation
  counts for branch-protection and CI evidence.
- Policy packs are defined for OSS, team, enterprise, regulated, high-risk
  hooks/MCP, and CI enforcement.
- Supply-chain intelligence covers MCP package provenance and has an extension
  path for npm/pip reputation, CVEs, typosquats, and dependency risk.
- Prompt-injection corpus and regression benchmark are ready for continuous
  rule hardening with category-level coverage and regression-gate output.
- Enterprise reports include JSON plus self-contained HTML executive output
  with risk posture, priority findings, category exposure, and policy-exception
  lifecycle evidence in terminal/CI summaries.

### 6. ECC Tools Billing, Deep Analysis, PR Checks, And Linear Sync

Target: 2026-06-21

Acceptance:

- Native GitHub Marketplace billing announcement is backed by verified
  implementation and docs.
- Internal billing readiness audit covers plan limits, seats, entitlement
  mapping, Marketplace plan shape, subscription state, overage hooks, and
  failure modes.
- Deep analyzer covers diff patterns, CI/CD workflows, dependency/security
  surface, PR review behavior, failure history, harness config, skill quality,
  dedicated analyzer corpus evidence, co-located analyzer reference sets,
  PR review/stale-salvage evidence, RAG/evaluator comparison, and reference-set
  validation.
- PR check suite taxonomy includes Security Evidence, Harness Drift, Install
  Manifest Integrity, CI/CD Recommendation, Cost/Token Risk, Reference Set
  Validation, Deep Analyzer Evidence, RAG/Evaluator Evidence,
  PR Review/Salvage Evidence, Skill Quality, and Agent Config Review.
- Cost/token-risk predictive follow-ups flag AI routing, model-call, usage,
  quota, and budget changes when budget evidence is missing.
- Reference-set validation follow-ups flag analyzer, skill, agent, command, and
  harness-guidance changes that lack eval, golden trace, benchmark, or
  maintained reference-set evidence.
- Deep-analyzer follow-ups flag repository, commit, architecture, pattern, and
  analysis-pipeline changes that lack analyzer corpus, snapshot, fixture, or
  benchmark evidence.
- Analyzer corpus evidence includes maintained fixtures and tests for current
  architecture and commit analyzer outputs, plus co-located
  `src/analyzers/{fixtures,goldens,reference-sets,benchmarks,evals}/` evidence
  paths.
- RAG/evaluator follow-ups flag retrieval, embedding, ranking, and evaluator
  changes that lack reference-set comparison, golden trace, benchmark, fixture,
  or eval-run evidence.
- PR review/stale-salvage follow-ups flag review, triage, stale-closure, and
  pull-request automation changes that lack stale-salvage fixtures,
  reviewer-thread cases, or reopen-flow reference evidence.
- PR analysis comments summarize review follow-up signals for requested
  changes, unresolved or outdated review threads, and missing approvals.
- CI failure-mode predictive follow-ups flag workflow and test-runner changes
  that lack failure fixtures, captured logs, troubleshooting notes, dry-run
  evidence, or regression coverage.
- Harness-config quality predictive follow-ups flag MCP, plugin, agent, hook,
  command, and harness config changes that lack audit, adapter matrix,
  cross-harness doc, or compatibility regression evidence.
- Linear sync maps deferred backlog findings to Linear issues without flooding
  GitHub, creates or reuses exact-title Linear issues when configured, and
  reports skipped sync when credentials or team configuration are absent.
- Follow-up generation caps automatic GitHub object creation and keeps overflow
  findings in a copy-ready project sync backlog.

### 7. Legacy Audit And Stale-Work Salvage Closure

Target: 2026-06-15

Acceptance:

- Legacy directories and orphaned handoffs are inventoried.
- Each useful artifact is marked landed, Linear/project-tracked, salvage
  branch, or archive/no-action.
- Workspace-level legacy repos are mined only through sanitized maintainer
  branches; raw context, secrets, personal paths, local settings, and private
  drafts are never imported wholesale.
- Stale PR salvage policy stays in force: close stale/conflicted PRs first,
  record a salvage ledger item, then port useful compatible content on
  maintainer branches with attribution.
- #1687 localization leftovers are handled only by translator/manual review,
  not blind cherry-pick.

## Next Engineering Slices

1. Decide whether AgentShield PDF export adds value beyond the merged HTML
   executive report, corpus benchmark output, and exception lifecycle audit.
2. Enable/configure the merged Linear backlog sync path after workspace issue
   capacity clears or the Linear workspace is upgraded.
3. Expand the evaluator/RAG corpus with real cleanup-batch cases as future
   maintainer-owned examples land.
