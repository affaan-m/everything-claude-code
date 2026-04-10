# Mega Plan Repo Prompt List — March 12, 2026

## Purpose

Use these prompts to split the remaining March 11 mega-plan work by repo.
They are written for parallel agents and assume the March 12 orchestration and
Windows CI lane is already merged via `#417`.

## Current Snapshot

- `everything-claude-code` has finished the orchestration, Codex baseline, and
  Windows CI recovery lane.
- The next open ECC Phase 1 items are:
  - review `#399`
  - convert recurring discussion pressure into tracked issues
  - define selective-install architecture
  - write the ECC 2.0 discovery doc
- `agentshield`, `ECC-website`, and `skill-creator-app` all have dirty
  `main` worktrees and should not be edited directly on `main`.
- `applications/` is not a standalone git repo. It lives inside the parent
  workspace repo at `<ECC_ROOT>`.

## Repo: `everything-claude-code`

### Prompt A — PR `#399` Review and Merge Readiness

```text
Work in: <ECC_ROOT>/everything-claude-code

Goal:
Review PR #399 ("fix(observe): 5-layer automated session guard to prevent
self-loop observations") against the actual loop problem described in issue
#398 and the March 11 mega plan. Do not assume the old failing CI on the PR is
still meaningful, because the Windows baseline was repaired later in #417.

Tasks:
1. Read issue #398 and PR #399 in full.
2. Inspect the observe hook implementation and tests locally.
3. Determine whether the PR really prevents observer self-observation,
   automated-session observation, and runaway recursive loops.
4. Identify any missing env-based bypass, idle gating, or session exclusion
   behavior.
5. Produce a merge recommendation with findings ordered by severity.

Constraints:
- Do not merge automatically.
- Do not rewrite unrelated hook behavior.
- If you make code changes, keep them tightly scoped to observe behavior and
  tests.

Deliverables:
- review summary
- exact findings with file references
- recommended merge / rework decision
- test commands run
```

### Prompt B — Roadmap Issues Extraction

```text
Work in: <ECC_ROOT>/everything-claude-code

Goal:
Convert recurring discussion pressure from the mega plan into concrete GitHub
issues. Focus on high-signal roadmap items that unblock ECC 1.x and ECC 2.0.

Create issue drafts or a ready-to-post issue bundle for:
1. selective install profiles
2. uninstall / doctor / repair lifecycle
3. generated skill placement and provenance policy
4. governance past the tool call
5. ECC 2.0 discovery doc / adapter contracts

Tasks:
1. Read the March 11 mega plan and March 12 handoff.
2. Deduplicate against already-open issues.
3. Draft issue titles, problem statements, scope, non-goals, acceptance
   criteria, and file/system areas affected.

Constraints:
- Do not create filler issues.
- Prefer 4-6 high-value issues over a large backlog dump.
- Keep each issue scoped so it could plausibly land in one focused PR series.

Deliverables:
- issue shortlist
- ready-to-post issue bodies
- duplication notes against existing issues
```

### Prompt C — ECC 2.0 Discovery and Adapter Spec

```text
Work in: <ECC_ROOT>/everything-claude-code

Goal:
Turn the existing ECC 2.0 vision into a first concrete discovery doc focused on
adapter contracts, session/task state, token accounting, and security/policy
events.

Tasks:
1. Use the current orchestration/session snapshot code as the baseline.
2. Define a normalized adapter contract for Claude Code, Codex, OpenCode, and
   later Cursor / GitHub App integration.
3. Define the initial SQLite-backed data model for sessions, tasks, worktrees,
   events, findings, and approvals.
4. Define what stays in ECC 1.x versus what belongs in ECC 2.0.
5. Call out unresolved product decisions separately from implementation
   requirements.

Constraints:
- Treat the current tmux/worktree/session snapshot substrate as the starting
  point, not a blank slate.
- Keep the doc implementation-oriented.

Deliverables:
- discovery doc
- adapter contract sketch
- event model sketch
- unresolved questions list
```

## Repo: `agentshield`

### Prompt — False Positive Audit and Regression Plan

```text
Work in: <ECC_ROOT>/agentshield

Goal:
Advance the AgentShield Phase 2 workstream from the mega plan: reduce false
positives, especially where declarative deny rules, block hooks, docs examples,
or config snippets are misclassified as executable risk.

Important repo state:
- branch is currently main
- dirty files exist in CLAUDE.md and README.md
- classify or park existing edits before broader changes

Tasks:
1. Inspect the current false-positive behavior around:
   - .claude hook configs
   - AGENTS.md / CLAUDE.md
   - .cursor rules
   - .opencode plugin configs
   - sample deny-list patterns
2. Separate parser behavior for declarative patterns vs executable commands.
3. Propose regression coverage additions and the exact fixture set needed.
4. If safe after branch setup, implement the first pass of the classifier fix.

Constraints:
- do not work directly on dirty main
- keep fixes parser/classifier-scoped
- document any remaining ambiguity explicitly

Deliverables:
- branch recommendation
- false-positive taxonomy
- proposed or landed regression tests
- remaining edge cases
```

## Repo: `ECC-website`

### Prompt — Landing Rewrite and Product Framing

```text
Work in: <ECC_ROOT>/ECC-website

Goal:
Execute the website lane from the mega plan by rewriting the landing/product
framing away from "config repo" and toward "open agent harness system" plus
future control-plane direction.

Important repo state:
- branch is currently main
- dirty files exist in favicon assets and multiple page/component files
- branch before meaningful work and preserve existing edits unless explicitly
  classified as stale

Tasks:
1. Classify the dirty main worktree state.
2. Rewrite the landing page narrative around:
   - open agent harness system
   - runtime guardrails
   - cross-harness parity
   - operator visibility and security
3. Define or update the next key pages:
   - /skills
   - /security
   - /platforms
   - /system or /dashboard
4. Keep the page visually intentional and product-forward, not generic SaaS.

Constraints:
- do not silently overwrite existing dirty work
- preserve existing design system where it is coherent
- distinguish ECC 1.x toolkit from ECC 2.0 control plane clearly

Deliverables:
- branch recommendation
- landing-page rewrite diff or content spec
- follow-up page map
- deployment readiness notes
```

## Repo: `skill-creator-app`

### Prompt — Skill Import Pipeline and Product Fit

```text
Work in: <ECC_ROOT>/skill-creator-app

Goal:
Align skill-creator-app with the mega-plan external skill sourcing and audited
import pipeline workstream.

Important repo state:
- branch is currently main
- dirty files exist in README.md and src/lib/github.ts
- classify or park existing changes before broader work

Tasks:
1. Assess whether the app should support:
   - inventorying external skills
   - provenance tagging
   - dependency/risk audit fields
   - ECC convention adaptation workflows
2. Review the existing GitHub integration surface in src/lib/github.ts.
3. Produce a concrete product/technical scope for an audited import pipeline.
4. If safe after branching, land the smallest enabling changes for metadata
   capture or GitHub ingestion.

Constraints:
- do not turn this into a generic prompt-builder
- keep the focus on audited skill ingestion and ECC-compatible output

Deliverables:
- product-fit summary
- recommended scope for v1
- data fields / workflow steps for the import pipeline
- code changes if they are small and clearly justified
```

## Repo: `ECC` Workspace (`applications/`, `knowledge/`, `tasks/`)

### Prompt — Example Apps and Workflow Reliability Proofs

```text
Work in: <ECC_ROOT>

Goal:
Use the parent ECC workspace to support the mega-plan hosted/workflow lanes.
This is not a standalone applications repo; it is the umbrella workspace that
contains applications/, knowledge/, tasks/, and related planning assets.

Tasks:
1. Inventory what in applications/ is real product code vs placeholder.
2. Identify where example repos or demo apps should live for:
   - GitHub App workflow proofs
   - ECC 2.0 prototype spikes
   - example install / setup reliability checks
3. Propose a clean workspace structure so product code, research, and planning
   stop bleeding into each other.
4. Recommend which proof-of-concept should be built first.

Constraints:
- do not move large directories blindly
- distinguish repo structure recommendations from immediate code changes
- keep recommendations compatible with the current multi-repo ECC setup

Deliverables:
- workspace inventory
- proposed structure
- first demo/app recommendation
- follow-up branch/worktree plan
```

## Local Continuation

The current worktree should stay on ECC-native Phase 1 work that does not touch
the existing dirty skill-file changes here. The best next local tasks are:

1. selective-install architecture
2. ECC 2.0 discovery doc
3. PR `#399` review
