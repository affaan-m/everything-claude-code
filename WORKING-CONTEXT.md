# Working Context

Last updated: 2026-04-01

## Purpose

Public ECC plugin repo for agents, skills, commands, hooks, rules, install surfaces, and ECC 2.0 platform buildout.

## Current Truth

- Default branch: `main`
- Immediate blocker addressed: CI lockfile drift and hook validation breakage fixed in `a273c62`
- Local full suite status after fix: `1723/1723` passing
- Main active operational work:
  - keep default branch green
  - audit and classify remaining open PR backlog by full diff
  - continue ECC 2.0 control-plane and operator-surface buildout

## Current Constraints

- No merge by title or commit summary alone.
- No arbitrary external runtime installs in shipped ECC surfaces.
- Overlapping skills, hooks, or agents should be consolidated when overlap is material and runtime separation is not required.

## Active Queues

- PR backlog: audit and classify remaining open PRs into merge, port/rebuild, close, or park
- Product:
  - selective install cleanup
  - control plane primitives
  - operator surface
  - self-improving skills
- Skill quality:
  - rewrite content-facing skills to use source-backed voice modeling
  - remove generic LLM rhetoric, canned CTA patterns, and forced platform stereotypes
  - continue one-by-one audit of overlapping or low-signal skill content
  - move repo guidance and contribution flow to skills-first, leaving commands only as explicit compatibility shims
  - add operator skills that wrap connected surfaces instead of exposing only raw APIs or disconnected primitives
  - land the canonical voice system, network-optimization lane, and reusable Manim explainer lane
- Security:
  - keep dependency posture clean
  - preserve self-contained hook and MCP behavior

## Open PR Classification

- Closed on 2026-04-01 under backlog hygiene / merge policy:
  - `#1069` `feat: add everything-claude-code ECC bundle`
  - `#1068` `feat: add everything-claude-code-conventions ECC bundle`
  - `#1080` `feat: add everything-claude-code ECC bundle`
  - `#1079` `feat: add everything-claude-code-conventions ECC bundle`
  - `#1064` `chore(deps-dev): bump @eslint/js from 9.39.2 to 10.0.1`
  - `#1063` `chore(deps-dev): bump eslint from 9.39.2 to 10.1.0`
- Closed on 2026-04-01 because the content is sourced from external ecosystems and should only land via manual ECC-native re-port:
  - `#852` openclaw-user-profiler
  - `#851` openclaw-soul-forge
  - `#640` harper skills
- Native-support candidates to fully diff-audit next:
  - `#1055` Dart / Flutter support
  - `#1043` C# reviewer and .NET skills
- Direct-port candidates landed after audit:
  - `#1078` hook-id dedupe for managed Claude hook reinstalls
  - `#844` ui-demo skill
  - `#1110` install-time Claude hook root resolution
  - `#1106` portable Codex Context7 key extraction
  - `#1107` Codex baseline merge and sample agent-role sync
  - `#1119` stale CI/lint cleanup that still contained safe low-risk fixes
- Port or rebuild inside ECC after full audit:
  - `#894` Jira integration
  - `#814` + `#808` rebuild as a single consolidated notifications lane for Opencode and cross-harness surfaces

## Interfaces

- Public truth: GitHub issues and PRs
- Internal execution truth: linked Linear work items under the ECC program
- Current linked Linear items:
  - `ECC-206` ecosystem CI baseline
  - `ECC-207` PR backlog audit and merge-policy enforcement
  - `ECC-208` context hygiene
  - `ECC-210` skills-first workflow migration and command compatibility retirement

## Update Rule

Keep this file detailed for only the current sprint, blockers, and next actions. Summarize completed work into archive or repo docs once it is no longer actively shaping execution.

## Latest Execution Notes

- 2026-04-01: `main` CI was restored locally with `1723/1723` tests passing after lockfile and hook validation fixes.
- 2026-04-01: Auto-generated ECC bundle PRs `#1068` and `#1069` were closed instead of merged; useful ideas must be ported manually after explicit diff audit.
- 2026-04-01: Major-version ESLint bump PRs `#1063` and `#1064` were closed; revisit only inside a planned ESLint 10 migration lane.
- 2026-04-01: Notification PRs `#808` and `#814` were identified as overlapping and should be rebuilt as one unified feature instead of landing as parallel branches.
- 2026-04-01: External-source skill PRs `#640`, `#851`, and `#852` were closed under the new ingestion policy; copy ideas from audited source later rather than merging branded/source-import PRs directly.
- 2026-04-01: The remaining low GitHub advisory on `ecc2/Cargo.lock` was addressed by moving `ratatui` to `0.30` with `crossterm_0_28`, which updated transitive `lru` from `0.12.5` to `0.16.3`. `cargo build --manifest-path ecc2/Cargo.toml` still passes.
- 2026-04-01: Safe core of `#834` was ported directly into `main` instead of merging the PR wholesale. This included stricter install-plan validation, antigravity target filtering that skips unsupported module trees, tracked catalog sync for English plus zh-CN docs, and a dedicated `catalog:sync` write mode.
- 2026-04-01: Repo catalog truth is now synced at `36` agents, `68` commands, and `142` skills across the tracked English and zh-CN docs.
- 2026-04-01: Legacy emoji and non-essential symbol usage in docs, scripts, and tests was normalized to keep the unicode-safety lane green without weakening the check itself.
- 2026-04-01: The remaining self-contained piece of `#834`, `docs/zh-CN/skills/browser-qa/SKILL.md`, was ported directly into the repo. After commit, `#834` should be closed as superseded-by-direct-port.
- 2026-04-01: Content skill cleanup started with `content-engine`, `crosspost`, `article-writing`, and `investor-outreach`. The new direction is source-first voice capture, explicit anti-trope bans, and no forced platform persona shifts.
- 2026-04-01: `node scripts/ci/check-unicode-safety.js --write` sanitized the remaining emoji-bearing Markdown files, including several `remotion-video-creation` rule docs and an old local plan note.
- 2026-04-01: Core English repo surfaces were shifted to a skills-first posture. README, AGENTS, plugin metadata, and contributor instructions now treat `skills/` as canonical and `commands/` as legacy slash-entry compatibility during migration.
- 2026-04-01: Follow-up bundle cleanup closed `#1080` and `#1079`, which were generated `.claude/` bundle PRs duplicating command-first scaffolding instead of shipping canonical ECC source changes.
- 2026-04-01: Ported the useful core of `#1078` directly into `main`, but tightened the implementation so legacy no-id hook installs deduplicate cleanly on the first reinstall instead of the second. Added stable hook ids to `hooks/hooks.json`, semantic fallback aliases in `mergeHookEntries()`, and a regression test covering upgrade from pre-id settings.
- 2026-04-01: Collapsed the obvious command/skill duplicates into thin legacy shims so `skills/` now hold the maintained bodies for NanoClaw, context-budget, DevFleet, docs lookup, E2E, evals, orchestration, prompt optimization, rules distillation, TDD, and verification.
- 2026-04-01: Ported the self-contained core of `#844` directly into `main` as `skills/ui-demo/SKILL.md` and registered it under the `media-generation` install module instead of merging the PR wholesale.
- 2026-04-01: Added the first connected-workflow operator lane as ECC-native skills instead of leaving the surface as raw plugins or APIs: `workspace-surface-audit`, `customer-billing-ops`, `project-flow-ops`, and `google-workspace-ops`. These are tracked under the new `operator-workflows` install module.
- 2026-04-01: Direct-ported the real fix from the unresolved hook-path PR lane into the active installer. Claude installs now replace `${CLAUDE_PLUGIN_ROOT}` with the concrete install root in both `settings.json` and the copied `hooks/hooks.json`, which keeps PreToolUse/PostToolUse hooks working outside plugin-managed env injection.
- 2026-04-01: Replaced the GNU-only `grep -P` parser in `scripts/sync-ecc-to-codex.sh` with a portable Node parser for Context7 key extraction. Added source-level regression coverage so BSD/macOS syncs do not drift back to non-portable parsing.
- 2026-04-01: Targeted regression suite after the direct ports is green: `tests/scripts/install-apply.test.js`, `tests/scripts/sync-ecc-to-codex.test.js`, and `tests/scripts/codex-hooks.test.js`.
- 2026-04-01: Ported the useful core of `#1107` directly into `main` as an add-only Codex baseline merge. `scripts/sync-ecc-to-codex.sh` now fills missing non-MCP defaults from `.codex/config.toml`, syncs sample agent role files into `~/.codex/agents`, and preserves user config instead of replacing it. Added regression coverage for sparse configs and implicit parent tables.
- 2026-04-01: Ported the safe low-risk cleanup from `#1119` directly into `main` instead of keeping an obsolete CI PR open. This included `.mjs` eslint handling, stricter null checks, Windows home-dir coverage in bash-log tests, and longer Trae shell-test timeouts.
- 2026-04-01: Added `brand-voice` as the canonical source-derived writing-style system and wired the content lane to treat it as the shared voice source of truth instead of duplicating partial style heuristics across skills.
- 2026-04-01: Added `connections-optimizer` as the review-first social-graph reorganization workflow for X and LinkedIn, with explicit pruning modes, browser fallback expectations, and Apple Mail drafting guidance.
- 2026-04-01: Added `manim-video` as the reusable technical explainer lane and seeded it with a starter network-graph scene so launch and systems animations do not depend on one-off scratch scripts.
- 2026-04-02: Re-extracted `social-graph-ranker` as a standalone primitive because the weighted bridge-decay model is reusable outside the full lead workflow. `lead-intelligence` now points to it for canonical graph ranking instead of carrying the full algorithm explanation inline, while `connections-optimizer` stays the broader operator layer for pruning, adds, and outbound review packs.
