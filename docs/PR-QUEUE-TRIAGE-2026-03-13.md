# PR Review And Queue Triage — March 13, 2026

## Snapshot

This document records a live GitHub triage snapshot for the
`everything-claude-code` pull-request queue as of `2026-03-13T08:33:31Z`.

Sources used:

- `gh pr view`
- `gh pr checks`
- `gh pr diff --name-only`
- targeted local verification against the merged `#399` head

Stale threshold used for this pass:

- `last updated before 2026-02-11` (`>30` days before March 13, 2026)

## PR `#399` Retrospective Review

PR:

- `#399` — `fix(observe): 5-layer automated session guard to prevent self-loop observations`
- state: `MERGED`
- merged at: `2026-03-13T06:40:03Z`
- merge commit: `c52a28ace9e7e84c00309fc7b629955dfc46ecf9`

Files changed:

- `skills/continuous-learning-v2/hooks/observe.sh`
- `skills/continuous-learning-v2/agents/observer-loop.sh`

Validation performed against merged head `546628182200c16cc222b97673ddd79e942eacce`:

- `bash -n` on both changed shell scripts
- `node tests/hooks/hooks.test.js` (`204` passed, `0` failed)
- targeted hook invocations for:
  - interactive CLI session
  - `CLAUDE_CODE_ENTRYPOINT=mcp`
  - `ECC_HOOK_PROFILE=minimal`
  - `ECC_SKIP_OBSERVE=1`
  - `agent_id` payload
  - trimmed `ECC_OBSERVE_SKIP_PATHS`

Behavioral result:

- the core self-loop fix works
- automated-session guard branches suppress observation writes as intended
- the final `non-cli => exit` entrypoint logic is the correct fail-closed shape

Remaining findings:

1. Medium: skipped automated sessions still create homunculus project state
   before the new guards exit.
   `observe.sh` resolves `cwd` and sources project detection before reaching the
   automated-session guard block, so `detect-project.sh` still creates
   `projects/<id>/...` directories and updates `projects.json` for sessions that
   later exit early.
2. Low: the new guard matrix shipped without direct regression coverage.
   The hook test suite still validates adjacent behavior, but it does not
   directly assert the new `CLAUDE_CODE_ENTRYPOINT`, `ECC_HOOK_PROFILE`,
   `ECC_SKIP_OBSERVE`, `agent_id`, or trimmed skip-path branches.

Verdict:

- `#399` is technically correct for its primary goal and was safe to merge as
  the urgent loop-stop fix.
- It still warrants a follow-up issue or patch to move automated-session guards
  ahead of project-registration side effects and to add explicit guard-path
  tests.

## Open PR Inventory

There are currently `4` open PRs.

### Queue Table

| PR | Title | Draft | Mergeable | Merge State | Updated | Stale | Current Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `#292` | `chore(config): governance and config foundation (PR #272 split 1/6)` | `false` | `MERGEABLE` | `UNSTABLE` | `2026-03-13T07:26:55Z` | `No` | `Best current merge candidate` |
| `#298` | `feat(agents,skills,rules): add Rust, Java, mobile, DevOps, and performance content` | `false` | `CONFLICTING` | `DIRTY` | `2026-03-11T04:29:07Z` | `No` | `Needs changes before review can finish` |
| `#336` | `Customisation for Codex CLI - Features from Claude Code and OpenCode` | `true` | `MERGEABLE` | `UNSTABLE` | `2026-03-13T07:26:12Z` | `No` | `Needs manual review and draft exit` |
| `#420` | `feat: add laravel skills` | `true` | `MERGEABLE` | `UNSTABLE` | `2026-03-12T22:57:36Z` | `No` | `Low-risk draft, review after draft exit` |

No currently open PR is stale by the `>30 days since last update` rule.

## Per-PR Assessment

### `#292` — Governance / Config Foundation

Live state:

- open
- non-draft
- `MERGEABLE`
- merge state `UNSTABLE`
- visible checks:
  - `CodeRabbit` passed
  - `GitGuardian Security Checks` passed

Scope:

- `.env.example`
- `.github/ISSUE_TEMPLATE/copilot-task.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.gitignore`
- `.markdownlint.json`
- `.tool-versions`
- `VERSION`

Assessment:

- This is the cleanest merge candidate in the current queue.
- The branch was already refreshed onto current `main`.
- The currently visible bot feedback is minor/nit-level rather than obviously
  merge-blocking.
- The main caution is that only external bot checks are visible right now; no
  GitHub Actions matrix run appears in the current PR checks output.

Current recommendation:

- `Mergeable after one final owner pass.`
- If you want a conservative path, do one quick human review of the remaining
  `.env.example`, PR-template, and `.tool-versions` nitpicks before merge.

### `#298` — Large Multi-Domain Content Expansion

Live state:

- open
- non-draft
- `CONFLICTING`
- merge state `DIRTY`
- visible checks:
  - `CodeRabbit` passed
  - `GitGuardian Security Checks` passed
  - `cubic · AI code reviewer` passed

Scope:

- `35` files
- large documentation and skill/rule expansion across Java, Rust, mobile,
  DevOps, performance, data, and MLOps

Assessment:

- This PR is not ready for merge.
- It conflicts with current `main`, so it is not even mergeable at the branch
  level yet.
- cubic identified `34` issues across `35` files in the current review.
  Those findings are substantive and technical, not just style cleanup, and
  they cover broken or misleading examples across several new skills.
- Even without the conflict, the scope is large enough that it needs a deliberate
  content-fix pass rather than a quick merge decision.

Current recommendation:

- `Needs changes.`
- Rebase or restack first, then resolve the substantive example-quality issues.
- If momentum matters, split by domain rather than carrying one very large PR.

### `#336` — Codex CLI Customization

Live state:

- open
- draft
- `MERGEABLE`
- merge state `UNSTABLE`
- visible checks:
  - `CodeRabbit` passed
  - `GitGuardian Security Checks` passed

Scope:

- `scripts/codex-git-hooks/pre-commit`
- `scripts/codex-git-hooks/pre-push`
- `scripts/codex/check-codex-global-state.sh`
- `scripts/codex/install-global-git-hooks.sh`
- `scripts/sync-ecc-to-codex.sh`

Assessment:

- This PR is no longer conflicting, but it is still draft-only and has not had
  a meaningful first-party review pass.
- It modifies user-global Codex setup behavior and git-hook installation, so the
  operational blast radius is higher than a docs-only PR.
- The visible checks are only external bots; there is no full GitHub Actions run
  shown in the current check set.
- Because the branch comes from a contributor fork `main`, it also deserves an
  extra sanity pass on what exactly is being proposed before changing status.

Current recommendation:

- `Needs changes before merge readiness`, where the required changes are process
  and review oriented rather than an already-proven code defect:
  - finish manual review
  - run or confirm validation on the global-state scripts
  - take it out of draft only after that review is complete

### `#420` — Laravel Skills

Live state:

- open
- draft
- `MERGEABLE`
- merge state `UNSTABLE`
- visible checks:
  - `CodeRabbit` passed
  - `GitGuardian Security Checks` passed

Scope:

- `README.md`
- `examples/laravel-api-CLAUDE.md`
- `rules/php/patterns.md`
- `rules/php/security.md`
- `rules/php/testing.md`
- `skills/configure-ecc/SKILL.md`
- `skills/laravel-patterns/SKILL.md`
- `skills/laravel-security/SKILL.md`
- `skills/laravel-tdd/SKILL.md`
- `skills/laravel-verification/SKILL.md`

Assessment:

- This is content-heavy and operationally lower risk than `#336`.
- It is still draft and has not had a substantive human review pass yet.
- The visible checks are external bots only.
- Nothing in the live PR state suggests a merge blocker yet, but it is not ready
  to be merged simply because it is still draft and under-reviewed.

Current recommendation:

- `Review next after the highest-priority non-draft work.`
- Likely a good review candidate once the author is ready to exit draft.

## Mergeability Buckets

### Mergeable Now Or After A Final Owner Pass

- `#292`

### Needs Changes Before Merge

- `#298`
- `#336`

### Draft / Needs Review Before Any Merge Decision

- `#420`

### Stale `>30 Days`

- none

## Recommended Order

1. `#292`
   This is the cleanest live merge candidate.
2. `#420`
   Low runtime risk, but wait for draft exit and a real review pass.
3. `#336`
   Review carefully because it changes global Codex sync and hook behavior.
4. `#298`
   Rebase and fix the substantive content issues before spending more review time
   on it.

## Bottom Line

- `#399`: safe bugfix merge with one follow-up cleanup still warranted
- `#292`: highest-priority merge candidate in the current open queue
- `#298`: not mergeable; conflicts plus substantive content defects
- `#336`: no longer conflicting, but not ready while still draft and lightly
  validated
- `#420`: draft, low-risk content lane, review after the non-draft queue

## Live Refresh

Refreshed at `2026-03-13T22:11:40Z`.

### Main Branch

- `origin/main` is green right now, including the Windows test matrix.
- Mainline CI repair is not the current bottleneck.

### Updated Queue Read

#### `#292` — Governance / Config Foundation

- open
- non-draft
- `MERGEABLE`
- visible checks:
  - `CodeRabbit` passed
  - `GitGuardian Security Checks` passed
- highest-signal remaining work is not CI repair; it is the small correctness
  pass on `.env.example` and PR-template alignment before merge

Current recommendation:

- `Next actionable PR.`
- Either patch the remaining doc/config correctness issues, or do one final
  owner pass and merge if you accept the current tradeoffs.

#### `#420` — Laravel Skills

- open
- draft
- `MERGEABLE`
- visible checks:
  - `CodeRabbit` skipped because the PR is draft
  - `GitGuardian Security Checks` passed
- no substantive human review is visible yet

Current recommendation:

- `Review after the non-draft queue.`
- Low implementation risk, but not merge-ready while still draft and
  under-reviewed.

#### `#336` — Codex CLI Customization

- open
- draft
- `MERGEABLE`
- visible checks:
  - `CodeRabbit` passed
  - `GitGuardian Security Checks` passed
- still needs a deliberate manual review because it touches global Codex sync
  and git-hook installation behavior

Current recommendation:

- `Manual-review lane, not immediate merge lane.`

#### `#298` — Large Content Expansion

- open
- non-draft
- `CONFLICTING`
- still the hardest remaining PR in the queue

Current recommendation:

- `Last priority among current open PRs.`
- Rebase first, then handle the substantive content/example corrections.

### Current Order

1. `#292`
2. `#420`
3. `#336`
4. `#298`
