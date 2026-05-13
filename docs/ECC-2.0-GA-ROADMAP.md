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

As of 2026-05-13:

- Public GitHub queues are clean across `affaan-m/everything-claude-code`,
  `affaan-m/agentshield`, `affaan-m/JARVIS`, `ECC-Tools/ECC-Tools`, and
  `ECC-Tools/ECC-website`.
- Public GitHub discussions are also clean across those tracked repos:
  the latest GraphQL sweep found only closed discussions on the trunk
  discussion surface, and satellite discussion surfaces are disabled or empty.
- The final open public GitHub issue, #1314, was closed as a non-actionable
  external badge/listing notification with a courtesy comment.
- Linear issue creation for this project was re-tested after GitHub cleanup and
  is still blocked by the workspace free issue limit. Seven roadmap-lane issue
  creation attempts all returned the same limit error, so this repo mirror and
  Linear project status updates remain the active tracking surfaces until the
  workspace is upgraded or issue capacity is freed.
- `npm run harness:audit -- --format json` reports 70/70 on current `main`.
- `npm run observability:ready` reports 18/18 readiness on current `main`,
  including the GitHub/Linear/handoff/roadmap progress-sync contract.
- PR #1846 merged as `797f283036904128bb1b348ae62019eb9f08cf39` and made
  npm registry signature verification a durable workflow-security gate:
  workflows that run `npm audit` now need `npm audit signatures`.
- PR #1848 merged as `cbecf5689d8d1bd5915e7031697a1d56aac538f2` and added
  `docs/security/supply-chain-incident-response.md`, plus a workflow-security
  validator rule blocking `pull_request_target` workflows from restoring or
  saving shared dependency caches.
- PR #1850 merged as `248673271455e9dc85b8add2a6ab76107b718639` and removed
  shell access from read-only analyzer agents and zh-CN copies, reducing
  AgentShield high findings on that surface without changing operator agents.
- PR #1851 merged as `209abd403b7eaa968c6d4fa67be82e04b55706d6` and made
  `persist-credentials: false` mandatory for `actions/checkout` in workflows
  with write permissions.
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
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-13.md` records the
  release-readiness evidence refresh: 70/70 harness audit, adapter compliance
  PASS, 16/16 observability readiness, 2376/2376 root Node tests, markdownlint,
  release-surface and npm publish-surface tests, and 462/462 `ecc2` Rust tests.
- `docs/releases/2.0.0-rc.1/publication-evidence-2026-05-13-post-hardening.md`
  records the post-hardening release-readiness refresh after PR #1850 and
  PR #1851: 70/70 harness audit, adapter compliance PASS, 18/18 observability
  readiness, 2380/2380 root Node tests, markdownlint, release-surface and
  npm publish-surface tests, 462/462 `ecc2` Rust tests, npm audit/signature
  checks, Rust advisory audit, and TanStack/Mini Shai-Hulud IOC checks.
- A detached clean worktree at
  `bfacf37715b39655cbc2c48f12f2a35c67cb0253` verified Claude plugin tag
  dry-run without `--force`, local marketplace discovery, temp-home local
  install, enabled plugin listing, and clean uninstall for `ecc@ecc`
  `2.0.0-rc.1`.
- `docs/architecture/evaluator-rag-prototype.md` and
  `examples/evaluator-rag-prototype/` define the first read-only
  self-improving harness prototype: scenario specs, traces, reports,
  candidate playbooks, verifier results, accepted maintainer-salvage,
  billing-readiness, CI-failure-diagnosis, and harness-config-quality
  candidates, plus the AgentShield policy-exception scenario and rejected
  unsafe candidates.
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
- AgentShield PR #63 exposed baseline drift in the GitHub Action with
  `baseline` / `save-baseline` inputs, baseline drift outputs, job-summary
  evidence, regression annotations, README/API docs, rebuilt action bundles,
  and green remote action/self-scan/Node verification.
- AgentShield PR #64 added the first-class `agentshield baseline write`
  CLI command with severity filtering, JSON metadata output, README/API docs,
  rebuilt CLI bundle, local TDD coverage, and green remote action/self-scan/Node
  verification.
- AgentShield PR #65 pinned workflow actions for release/security CI hardening.
- AgentShield PR #66 disabled cache use in the release publish job so release
  publication does not depend on mutable restored build state.
- AgentShield PR #67 added the first portable enterprise evidence-pack bundle:
  `agentshield scan --evidence-pack <dir>` writes deterministic manifest,
  README, JSON, HTML, SARIF, policy-evaluation, baseline-comparison, and
  supply-chain artifacts with default redaction and `not-run` markers for
  optional policy/baseline evidence.
- AgentShield PDF-export decision: defer a native PDF writer for now. The
  self-contained HTML executive report remains the exportable buyer artifact
  and can be printed to PDF when needed; native PDF generation should wait for
  explicit enterprise/compliance demand or a print-fidelity gap in the HTML
  report.
- `docs/architecture/agentshield-enterprise-research-roadmap.md` identifies
  the next AgentShield enterprise signal: move from scanner/report/policy gate
  to a team control plane with baseline drift, evidence packs, multi-harness
  adapters, corpus accuracy gates, remediation routing, threat intelligence,
  and ECC-Tools/GitHub App integration.
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
- ECC-Tools PR #40 added a checked-in evaluator/RAG corpus contract covering
  stale-PR salvage, billing readiness, CI failure diagnosis, harness config
  quality, AgentShield policy exceptions, skill-quality evidence,
  deep-analyzer evidence, and RAG/evaluator comparison evidence, with each
  scenario exercising missing-evidence and evidence-backed diffs.
- ECC-Tools PR #41 hardened supply-chain dependencies.
- ECC-Tools PR #42 added AgentShield evidence-pack gap prediction and routed
  missing policy/baseline/allowlist/suppression/supply-chain evidence into the
  PR-risk taxonomy, follow-up drafts, and Linear-ready backlog table.
- ECC-Tools PR #43 recognized the concrete AgentShield #67 evidence-pack
  artifact contract so canonical bundle files now satisfy the taxonomy and
  generated follow-up PRs point maintainers at
  `agentshield scan --evidence-pack <dir>`.
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
| Keep public PRs below 20 | Repo-family PR recheck | 0 open PRs across the tracked public repos on 2026-05-13 after merging #1851 | Complete for this checkpoint |
| Keep public issues below 20 | Repo-family issue recheck | 0 open issues across the tracked public repos on 2026-05-13 | Complete for this checkpoint |
| Manage repository discussions | Repo-family discussion recheck | Latest trunk discussion GraphQL sweep returned closed discussions only; satellite repos remain disabled or empty | Complete for this checkpoint |
| Manage PR discussions | PR review/comment closure plus merge/close state | #1851 merged after current-head CI; no open PRs remain | Complete for this checkpoint |
| Salvage useful stale work | `docs/stale-pr-salvage-ledger.md` | Ledger records salvaged, superseded, skipped, and manual-review tails; #1815-#1818 added cost tracking, skill scout, frontend design guidance, code-reviewer false-positive guardrails, and the May 12 gap pass | Complete except translation/manual review tail |
| ECC 2.0 preview pack ready | Release docs, quickstart, publication readiness, release notes | `docs/releases/2.0.0-rc.1/` and readiness docs are in-tree; May 13 evidence refresh records harness, adapter, observability, Node, lint, release-surface, npm publish-surface, and Rust checks | Needs final clean-checkout release approval |
| Hermes specialized skills included safely | Hermes setup/import docs and sanitized skill surface | Hermes setup and import playbook are public; secrets stay local | Needs final release review |
| Naming and rename readiness | Naming matrix across package/plugin/docs/social surfaces | `docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md` records current package, repo, Claude plugin, Codex plugin, OpenCode, and npm availability evidence | Complete for rc.1; post-rc rename remains future work |
| Claude and Codex plugin publication | Contact/submission path with required artifacts and status | Publication readiness, naming matrix, and May 12 dry-run evidence document plugin validation, clean-checkout Claude tag/install smoke, and Codex marketplace CLI shape | Needs explicit approval for real tag/push and marketplace submission |
| Articles, tweets, and announcements | X thread, LinkedIn copy, GitHub release copy, push checklist | Draft launch collateral exists under rc.1 release docs | Needs URL-backed refresh |
| AgentShield enterprise iteration | Policy gates, SARIF, packs, provenance, corpus, HTML reports, exception lifecycle audit, baseline drift Action/CLI surfaces, enterprise research roadmap | PRs #53, #55-#64 and #67 landed with test evidence; native PDF export deferred in favor of self-contained HTML plus print-to-PDF until explicit enterprise demand appears; `docs/architecture/agentshield-enterprise-research-roadmap.md` now has baseline drift and evidence-pack bundle slices landed | Evidence-pack bundle and ECC-Tools routing landed; next adapter/corpus/remediation slice |
| ECC Tools next-level app | Billing audit, PR checks, deep analyzer, sync backlog, evaluator/RAG corpus | PRs #26-#43 landed with test evidence, including AgentShield evidence-pack gap routing and canonical bundle recognition | Needs capacity-backed Linear rollout |
| GitGuardian/Dependabot/CodeRabbit-style checks | Non-blocking taxonomy, deterministic follow-up checks, and local supply-chain gates | ECC-Tools risk taxonomy check plus follow-up signals landed, including Skill Quality, Deep Analyzer Evidence, Analyzer Corpus Evidence, RAG/Evaluator Evidence, PR Review/Salvage Evidence, and AgentShield evidence-pack evidence; #1846 added npm registry signature gates; #1848 added the supply-chain incident-response playbook and `pull_request_target` cache-poisoning validator guard; #1851 added the privileged checkout credential-persistence guard | Partially complete |
| Harness-agnostic learning system | Audit, adapter matrix, observability, traces, promotion loop | Audit/adapters/observability gates plus `docs/architecture/evaluator-rag-prototype.md`, `examples/evaluator-rag-prototype/`, and ECC-Tools PR #40 define read-only stale-salvage, billing-readiness, CI-failure-diagnosis, harness-config-quality, AgentShield policy-exception, skill-quality evidence, deep-analyzer evidence, and RAG/evaluator comparison scenarios with trace, report, playbook, verifier, and predictive-check artifacts | Local corpus complete; hosted integration remains future |
| Linear roadmap is detailed | Linear project status plus repo mirror | Repo mirror exists; issue creation was retried on 2026-05-12 and remains blocked by the workspace free issue limit | Needs recurring status updates after each merge batch |
| Flow separation and progress tracking | Flow lanes with owner artifacts and update cadence | This roadmap defines lanes below and `docs/architecture/progress-sync-contract.md` makes GitHub/Linear/handoff/roadmap sync part of the readiness gate | Active |
| Realtime Linear sync | Project updates while issue limit is blocked; issues later | ECC-Tools #39 implements opt-in Linear API sync for deferred follow-up backlog items; `docs/architecture/progress-sync-contract.md` defines the local file-backed realtime boundary while issue capacity is blocked | Needs workspace capacity/config rollout |
| Observability for self-use | Local readiness gate, traces, status snapshots, HUD/status contract, risk ledger, progress-sync contract | `npm run observability:ready` reports 18/18 | Complete for local gate |
| Proper release and notifications | Release tag, npm publish state, plugin state, social posts | Publication readiness gate exists with May 12 dry-run and May 13 readiness evidence | Not complete; approval/live URLs required |

## Execution Lanes And Tracking Contract

Until Linear issue capacity is cleared, this document is the durable execution
ledger and Linear receives project status updates only. The sync contract lives
at `docs/architecture/progress-sync-contract.md`. When capacity is available,
each lane below should become a small set of Linear issues linked back to the
repo evidence and merge commits.

| Lane | Source of truth | Next tracked artifact | Update cadence |
| --- | --- | --- | --- |
| Queue hygiene and salvage | GitHub PR/issue state, salvage ledger | Append ledger entries for any future stale closures | Every cleanup batch |
| Release and publication | rc.1 release docs, publication readiness doc | Naming matrix and plugin submission/contact checklist | Before any tag |
| Harness OS core | Audit, adapter matrix, observability docs, `ecc2/` | HUD/session-control acceptance spec | Weekly until GA |
| Evaluation and RAG | Reference-set validation, harness audit, traces, ECC-Tools corpus | Read-only evaluator/RAG prototype plus stale-salvage, billing-readiness, CI-failure-diagnosis, harness-config-quality, AgentShield policy-exception, skill-quality evidence, deep-analyzer evidence, and RAG/evaluator comparison fixtures | Hosted retrieval/check-run automation plan |
| AgentShield enterprise | AgentShield PR evidence and roadmap notes | Adapter registry or corpus accuracy gate follow-up | Next implementation batch |
| ECC Tools app | ECC-Tools PR evidence, billing audit, risk taxonomy, evaluator/RAG corpus | Capacity-backed Linear rollout plus hosted/deeper analysis follow-up | Next implementation batch |
| Linear progress | Linear project status updates, `docs/architecture/progress-sync-contract.md`, and this mirror | Status update with queue/evidence/missing gates | Every significant merge batch |

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
- Native PDF export is not a GA blocker unless an enterprise/compliance
  workflow requires a generated PDF file instead of the self-contained HTML
  report and browser print-to-PDF path.

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
- Evaluator/RAG billing readiness fixture
  `examples/evaluator-rag-prototype/billing-marketplace-readiness/` records the
  read-only claim-verification path for Marketplace, App, subscription, seat,
  entitlement, and plan language before launch copy can treat those claims as
  live.
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
- Evaluator/RAG corpus contract mirrors the local prototype scenarios into
  ECC-Tools fixtures and tests for stale-PR salvage, billing readiness,
  CI failure diagnosis, harness config quality, AgentShield policy exceptions,
  skill-quality evidence, deep-analyzer evidence, and RAG/evaluator comparison.
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

1. Continue the AgentShield enterprise control-plane sequence from
   `docs/architecture/agentshield-enterprise-research-roadmap.md`: PR #63
   shipped GitHub Action baseline outputs and job-summary evidence; PR #64
   shipped first-class baseline snapshot creation through
   `agentshield baseline write`; PR #67 shipped the evidence-pack bundle; and
   ECC-Tools PRs #42/#43 now route and recognize that bundle. The next slice is
   either the multi-harness adapter registry, corpus accuracy gate, or
   remediation/fingerprint workflow.
2. Enable/configure the merged Linear backlog sync path after workspace issue
   capacity clears or the Linear workspace is upgraded.
3. Use the ECC-Tools evaluator/RAG corpus as the promotion gate before adding
   hosted retrieval, vector storage, model-backed judging, or automated
   check-run promotion.
