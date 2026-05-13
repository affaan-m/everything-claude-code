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

- GitHub queues are clean across `affaan-m/everything-claude-code`,
  `affaan-m/agentshield`, `affaan-m/JARVIS`, `ECC-Tools/ECC-Tools`, and
  `ECC-Tools/ECC-website`: the latest sweep found 0 open PRs and 0 open
  issues across all five repos.
- GitHub discussions are also clean across those tracked repos:
  the latest GraphQL sweep found 52 total trunk discussions with 0 open,
  and 0 total/open discussions on AgentShield, JARVIS, ECC-Tools, and the
  ECC-Tools website.
- The final open public GitHub issue, #1314, was closed as a non-actionable
  external badge/listing notification with a courtesy comment.
- Linear issue creation for this project was re-tested after GitHub cleanup and
  is still blocked by the workspace free issue limit. Seven roadmap-lane issue
  creation attempts all returned the same limit error, so this repo mirror and
  Linear project status updates remain the active tracking surfaces until the
  workspace is upgraded or issue capacity is freed.
- `npm run harness:audit -- --format json` reports 70/70 on current `main`.
- `npm run observability:ready` reports 21/21 readiness on current `main`,
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
- PR #1860 merged as `c2762dd5691a33aaa7f84a0a4901a5bab7980fc8` and closed
  #1859 by adding the Ruby/Rails language pack surface, install aliases,
  selective-install components, and focused install-manifest executor tests.
- AgentShield PR #78 merged as `1b19a985d6ae1346244089a78806a7d5eaaf270e`
  and hardened the release workflow with `persist-credentials: false` plus
  `npm ci --ignore-scripts` in the write/id-token release path.
- AgentShield PR #79 merged as `86a823c5f2c35ee97e6ecf6f99e9ac301d54119a`
  and moved baseline/watch/remediation fingerprints to a shared hashed
  evidence fingerprint helper. New baselines omit raw finding evidence while
  older raw-evidence baselines remain comparable.
- AgentShield PR #80 merged as `8ed379d1de067b25640ac6273aa4d9f8e6735d43`
  and added prioritized corpus accuracy recommendations to failed corpus gates,
  mapping misses by category, missing rule, and config ID so enterprise
  scanner-regression work has an actionable improvement plan.
- AgentShield PR #81 merged as `6583884e74ba2e896942113e1ce3146230e6fb76`
  and added ordered remediation workflow phases to remediation plans, routing
  safe auto-fixes, manual review, and verification through stable finding
  fingerprints without copying raw evidence.
- AgentShield PR #82 merged as `51336ba074ad5e9fed2c0aa3237422be22147e76`
  and expanded the built-in attack corpus with an env proxy hijack scenario
  covering proxy/runtime mutation, env-token exfiltration, DNS exfiltration,
  credential-store access, and clipboard access.
- JARVIS PR #13 merged as `127efabbfb5033ae53d7a53e1546aa3c33d6f962`
  and hardened CI/deploy workflows with npm registry signature verification,
  disabled persisted checkout credentials in write-permission jobs, and pinned
  the Vercel CLI install instead of using `latest`.
- ECC-Tools PR #53 merged as `99018e943d03f024de8c9d278c91f66393d4f1ee`
  and added npm registry signature verification before the existing production
  dependency audit in CI.
- ECC-Tools PR #54 merged as `05df89721f49c1e19d8502c545e26f5694806998`
  and made `/ecc-tools followups sync-linear` track copy-ready PR drafts in
  the Linear/project backlog when `open-pr-drafts` is not used, preserving
  useful stale-PR salvage work without opening extra PR shells.
- ECC-Tools PR #55 merged as `5d8c112cce4794cfa089d5b0ea661ba87a178be1`
  and added analysis-depth readiness to `/ecc-tools analyze` comments,
  separating commit-history-only repos from evidence-backed and deep-ready repos
  using CI/CD, security, harness, reference/eval, AI routing/cost-control, and
  team handoff evidence.
- ECC-Tools PR #56 merged as `5b729c88641eafe80f65364bab3fc74d0270f57b`
  and added the authenticated `/api/analysis/depth-plan` contract that maps
  analysis-depth readiness into concrete hosted jobs for CI diagnostics,
  security evidence review, harness compatibility, reference-set evaluation,
  AI routing/cost review, and team backlog routing.
- ECC-Tools PR #57 merged as `4cc61112a4cc9feec7b07af09321f360e34af6a4`
  and added the first executable hosted analysis job:
  `/api/analysis/jobs/ci-diagnostics` now gates on CI/CD readiness, inspects
  workflow/test-runner/failure-evidence artifacts, returns CI hardening
  findings and next actions, and charges usage only after successful execution.
- ECC-Tools PR #58 merged as `ce09dd8d9b46f65c6b88dc4f48cfb6b6227ae0bf`
  and added the second executable hosted analysis job:
  `/api/analysis/jobs/security-evidence-review` now gates on security-evidence
  readiness, inspects capped AgentShield evidence-pack, policy, baseline,
  SBOM, SARIF, and security-scan artifacts, returns supply-chain evidence
  findings and next actions, and charges usage only after successful execution.
- ECC-Tools PR #59 merged as `505b372dbd8f75f996d9e2ed079effd30cec5ba5`
  and added the third executable hosted analysis job:
  `/api/analysis/jobs/harness-compatibility-audit` now gates on harness-config
  readiness, inspects capped Claude, Codex, OpenCode, MCP, plugin, and
  cross-harness documentation artifacts, excludes local secret-bearing config
  paths from fetches, returns portability findings and next actions, and
  charges usage only after successful execution.
- ECC-Tools PR #60 merged as `b75e0a49ba5672b1ec9a2a4880ddcfa2d07dc557`
  and added the fourth executable hosted analysis job:
  `/api/analysis/jobs/reference-set-evaluation` now gates on reference-evidence
  readiness, evaluates analyzer corpus, RAG/evaluator, PR salvage/review,
  harness, security, and CI failure-mode evidence, excludes obvious
  secret-bearing fixture paths from fetches, returns reference coverage
  findings and next actions, and charges usage only after successful execution.
- ECC-Tools PR #61 merged as `7b01b67cae0b80774b311cb515b7eca0aa038c65`
  and added the fifth executable hosted analysis job:
  `/api/analysis/jobs/ai-routing-cost-review` now gates on AI routing/cost
  readiness, evaluates model routing, token budget, usage-limit, rate-limit,
  billing/entitlement, cost-regression, and cost-policy evidence, excludes
  obvious secret-bearing paths from fetches, returns cost-control findings and
  next actions, and charges usage only after successful execution.
- ECC-Tools PR #62 merged as `781d6733e56f7556edb43fb96bdfb00b1f0a3aa6`
  and added the sixth executable hosted analysis job:
  `/api/analysis/jobs/team-backlog-routing` now gates on team handoff/project
  tracking readiness, evaluates roadmap, runbook, handoff, release-plan,
  issue-template, ownership, project-tracker, backlog, and follow-up evidence,
  excludes obvious secret-bearing paths from fetches, returns team-routing
  findings and next actions, and charges usage only after successful execution.
- Handoff `ecc-supply-chain-audit-20260513-0645.md` under
  `~/.cluster-swarm/handoffs/`
  records the May 13 supply-chain sweep: no active lockfile/manifest hit for
  TanStack/Mini Shai-Hulud indicators; npm audit/signature checks clean across
  active npm lockfiles; `cargo audit` clean for `ecc2`; trunk `pip-audit`
  clean; JARVIS backend pinned-graph Python audit clean under the supported
  Python 3.12 target.
- PR #1861 validation refreshed `node scripts/harness-audit.js --format json`
  at 70/70 and `npm run observability:ready` at 21/21.
- PR #1862 updated this roadmap after the JARVIS backend Python audit was
  re-run against the supported Python 3.12 pinned graph.
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
- AgentShield PR #68 hardened evidence-pack redaction for enterprise credential
  families including GitHub fine-grained PATs, GitLab PATs, npm tokens, Linear
  API keys, Stripe keys, Google API keys, Hugging Face tokens, Vercel tokens,
  AWS access key IDs, and JWT-shaped credentials.
- AgentShield PR #69 added the deterministic harness adapter registry. Scan
  reports now surface local marker evidence for Claude Code, OpenCode, Codex,
  Gemini, dmux, generic terminal agents, and project-local templates in JSON,
  markdown, terminal, and HTML outputs.
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
- ECC-Tools PR #55 added the first hosted/deeper-analysis readiness signal:
  analysis comments now classify a repo as commit-history-only,
  evidence-backed, or deep-ready before routing work into CI, AgentShield,
  harness, reference-set, RAG/evaluator, AI-routing, cost-control, and
  Linear/project-tracking lanes.
- ECC-Tools PR #56 turned that signal into a hosted execution-plan contract:
  `/api/analysis/depth-plan` returns ready/blocked jobs and next action text
  without charging analysis usage or creating bundle PRs.
- ECC-Tools PR #57 implemented the first job-specific hosted executor:
  `/api/analysis/jobs/ci-diagnostics` reuses the depth-readiness gate, internal
  API auth, installation ownership, repo-access billing checks, capped workflow
  file reads, and usage accounting to return concrete CI hardening findings.
- ECC-Tools PR #58 implemented the second job-specific hosted executor:
  `/api/analysis/jobs/security-evidence-review` applies the same hosted gates
  to AgentShield evidence-pack, policy, baseline, SBOM, SARIF, and security
  scanner artifacts.
- ECC-Tools PR #59 implemented the third job-specific hosted executor:
  `/api/analysis/jobs/harness-compatibility-audit` applies the same hosted
  gates to Claude, Codex, OpenCode, MCP, plugin, and cross-harness evidence
  while avoiding local secret-bearing harness config fetches.
- ECC-Tools PR #60 implemented the fourth job-specific hosted executor:
  `/api/analysis/jobs/reference-set-evaluation` applies the same hosted gates
  to analyzer corpus, RAG/evaluator, PR salvage, harness, security, and CI
  failure-mode reference evidence while avoiding obvious secret-bearing fixture
  fetches.
- ECC-Tools PR #61 implemented the fifth job-specific hosted executor:
  `/api/analysis/jobs/ai-routing-cost-review` applies the same hosted gates to
  model-routing, token-budget, usage-limit, rate-limit, billing/entitlement,
  cost-regression, and cost-policy evidence while avoiding obvious
  secret-bearing path fetches.
- ECC-Tools PR #62 implemented the sixth job-specific hosted executor:
  `/api/analysis/jobs/team-backlog-routing` applies the same hosted gates to
  roadmap, runbook, handoff, release-plan, issue-template, ownership,
  project-tracker, backlog, and follow-up evidence while avoiding obvious
  secret-bearing path fetches.
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
- Maintain 70/70 harness audit and 21/21 observability readiness after every
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
| Keep public PRs below 20 | Repo-family PR recheck | 0 open PRs across `everything-claude-code`, AgentShield, JARVIS, `ECC-Tools/ECC-Tools`, and `ECC-Tools/ECC-website` on 2026-05-13 after merging ECC #1860, AgentShield #78, JARVIS #13, and ECC-Tools #53 | Complete |
| Keep public issues below 20 | Repo-family issue recheck | 0 open issues across `everything-claude-code`, AgentShield, JARVIS, `ECC-Tools/ECC-Tools`, and `ECC-Tools/ECC-website` on 2026-05-13 | Complete |
| Manage repository discussions | Repo-family discussion recheck | GraphQL sweep returned 52 total trunk discussions with 0 open; AgentShield, JARVIS, ECC-Tools, and ECC-Tools website returned 0 total/open discussions | Complete |
| Manage PR discussions | PR review/comment closure plus merge/close state | ECC #1860, AgentShield #78, JARVIS #13, and ECC-Tools #53/#54 merged after current-head CI/builds; no open tracked PRs remain | Complete |
| Salvage useful stale work | `docs/stale-pr-salvage-ledger.md` | Ledger records salvaged, superseded, skipped, and manual-review tails; #1815-#1818 added cost tracking, skill scout, frontend design guidance, code-reviewer false-positive guardrails, and the May 12 gap pass | Complete except translation/manual review tail |
| ECC 2.0 preview pack ready | Release docs, quickstart, publication readiness, release notes | `docs/releases/2.0.0-rc.1/` and readiness docs are in-tree; May 13 evidence refresh records harness, adapter, observability, Node, lint, release-surface, npm publish-surface, and Rust checks | Needs final clean-checkout release approval |
| Hermes specialized skills included safely | Hermes setup/import docs and sanitized skill surface | Hermes setup and import playbook are public; secrets stay local | Needs final release review |
| Naming and rename readiness | Naming matrix across package/plugin/docs/social surfaces | `docs/releases/2.0.0-rc.1/naming-and-publication-matrix.md` records current package, repo, Claude plugin, Codex plugin, OpenCode, and npm availability evidence | Complete for rc.1; post-rc rename remains future work |
| Claude and Codex plugin publication | Contact/submission path with required artifacts and status | Publication readiness, naming matrix, and May 12 dry-run evidence document plugin validation, clean-checkout Claude tag/install smoke, and Codex marketplace CLI shape | Needs explicit approval for real tag/push and marketplace submission |
| Articles, tweets, and announcements | X thread, LinkedIn copy, GitHub release copy, push checklist | Draft launch collateral exists under rc.1 release docs | Needs URL-backed refresh |
| AgentShield enterprise iteration | Policy gates, SARIF, packs, provenance, corpus, HTML reports, exception lifecycle audit, baseline drift Action/CLI surfaces, evidence-pack redaction, harness adapter registry, enterprise research roadmap, supply-chain hardened release path, CI-safe baseline fingerprints, corpus accuracy recommendations, remediation workflow phases, env proxy hijack corpus coverage | PRs #53, #55-#64, #67-#69, and #78-#82 landed with test evidence; native PDF export deferred in favor of self-contained HTML plus print-to-PDF until explicit enterprise demand appears; `docs/architecture/agentshield-enterprise-research-roadmap.md` now has baseline drift, evidence-pack bundle, redaction, adapter-registry, supply-chain hardening, hashed baseline fingerprints, corpus accuracy recommendation, remediation workflow, and env proxy hijack corpus slices landed | Next hosted evidence-pack workflow depth |
| ECC Tools next-level app | Billing audit, PR checks, deep analyzer, sync backlog, evaluator/RAG corpus, analysis-depth readiness, hosted execution planning, hosted CI diagnostics, hosted security evidence review, hosted harness compatibility audit, hosted reference-set evaluation, hosted AI routing/cost review, hosted team backlog routing | PRs #26-#43 plus #53-#62 landed with test evidence, including AgentShield evidence-pack gap routing, canonical bundle recognition, supply-chain signature gates, PR draft follow-up Linear tracking, evidence-backed/deep-ready repository classification, the `/api/analysis/depth-plan` hosted job plan, `/api/analysis/jobs/ci-diagnostics`, `/api/analysis/jobs/security-evidence-review`, `/api/analysis/jobs/harness-compatibility-audit`, `/api/analysis/jobs/reference-set-evaluation`, `/api/analysis/jobs/ai-routing-cost-review`, and `/api/analysis/jobs/team-backlog-routing` | Hosted executor set complete; next work is scheduler/check-run dispatch integration |
| GitGuardian/Dependabot/CodeRabbit-style checks | Non-blocking taxonomy, deterministic follow-up checks, and local supply-chain gates | ECC-Tools risk taxonomy check plus follow-up signals landed, including Skill Quality, Deep Analyzer Evidence, Analyzer Corpus Evidence, RAG/Evaluator Evidence, PR Review/Salvage Evidence, and AgentShield evidence-pack evidence; #1846 added npm registry signature gates; #1848 added the supply-chain incident-response playbook and `pull_request_target` cache-poisoning validator guard; #1851 added the privileged checkout credential-persistence guard; AgentShield #78, JARVIS #13, and ECC-Tools #53 applied the same hardening outside trunk | Current supply-chain gate complete; deeper hosted review features remain future |
| Harness-agnostic learning system | Audit, adapter matrix, observability, traces, promotion loop | Audit/adapters/observability gates plus `docs/architecture/evaluator-rag-prototype.md`, `examples/evaluator-rag-prototype/`, and ECC-Tools PR #40 define read-only stale-salvage, billing-readiness, CI-failure-diagnosis, harness-config-quality, AgentShield policy-exception, skill-quality evidence, deep-analyzer evidence, and RAG/evaluator comparison scenarios with trace, report, playbook, verifier, and predictive-check artifacts | Local corpus complete; hosted integration remains future |
| Linear roadmap is detailed | Linear project status plus repo mirror | Repo mirror exists; issue creation was retried on 2026-05-12 and remains blocked by the workspace free issue limit; this May 13 sync adds ECC #1860, AgentShield #78-#82, JARVIS #13, ECC-Tools #53-#62, resolved queue/discussion counts, and Linear project status updates through ECC-Tools #62 | Needs recurring status updates after each merge batch |
| Flow separation and progress tracking | Flow lanes with owner artifacts and update cadence | This roadmap defines lanes below and `docs/architecture/progress-sync-contract.md` makes GitHub/Linear/handoff/roadmap sync part of the readiness gate | Active |
| Realtime Linear sync | Project updates while issue limit is blocked; issues later | ECC-Tools #39 implements opt-in Linear API sync for deferred follow-up backlog items, and ECC-Tools #54 adds copy-ready PR drafts to that backlog when draft PR shells are not opened; `docs/architecture/progress-sync-contract.md` defines the local file-backed realtime boundary while issue capacity is blocked | Needs workspace capacity/config rollout |
| Observability for self-use | Local readiness gate, traces, status snapshots, HUD/status contract, risk ledger, progress-sync contract | `npm run observability:ready` reports 21/21 | Complete for local gate |
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
| AgentShield enterprise | AgentShield PR evidence and roadmap notes | Remediation workflow depth or corpus expansion follow-up | Next implementation batch |
| ECC Tools app | ECC-Tools PR evidence, billing audit, risk taxonomy, evaluator/RAG corpus | ECC-Tools #53 published the supply-chain workflow hardening branch, #54 tracks copy-ready PR drafts in the Linear/project backlog, #55 classifies analysis-depth readiness, #56 exposes the hosted execution plan, #57 executes the first hosted CI diagnostics job, #58 executes the hosted security evidence review job, #59 executes the hosted harness compatibility audit, #60 executes the hosted reference-set evaluation, #61 executes the hosted AI routing/cost review, and #62 executes hosted team backlog routing; next work is scheduler/check-run dispatch integration | Next implementation batch |
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

- Observability readiness remains 21/21 and is backed by JSONL traces, status
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
- Linear/project backlog sync includes copy-ready PR drafts when
  `/ecc-tools followups sync-linear` is used without `open-pr-drafts`, so
  stale-PR salvage work remains tracked without opening extra PR shells.
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
   `agentshield baseline write`; PR #67 shipped the evidence-pack bundle; PR
   #68 hardened evidence-pack redaction; PR #69 shipped the multi-harness
   adapter registry; PR #78 hardened the release workflow for the current
   supply-chain incident class; PR #79 moved baseline/watch/remediation
   fingerprints to hashed evidence and stopped writing raw evidence into new
   baselines; PR #80 added prioritized corpus accuracy recommendations for
   failed regression gates; PR #81 added ordered remediation workflow phases;
   PR #82 expanded corpus coverage for env proxy hijacks and out-of-band
   exfiltration; and ECC-Tools PRs #42/#43 now route and recognize evidence
   packs. The next slice is hosted evidence-pack workflow depth.
2. Wire the completed ECC-Tools hosted execution lane (#57 CI diagnostics,
   #58 security evidence review, #59 harness compatibility audit, #60
   reference-set evaluation, #61 AI routing/cost review, and #62 team backlog
   routing) into scheduler/check-run dispatch so the endpoints become an
   operator-visible hosted workflow rather than only direct internal jobs.
3. Enable/configure the merged Linear backlog sync path after workspace issue
   capacity clears or the Linear workspace is upgraded, then verify PR-draft
   salvage items land in the expected project.
4. Use the ECC-Tools evaluator/RAG corpus as the promotion gate before adding
   hosted retrieval, vector storage, model-backed judging, or automated
   check-run promotion.
