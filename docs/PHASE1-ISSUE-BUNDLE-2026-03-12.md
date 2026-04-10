# Phase 1 Issue Bundle — March 12, 2026

## Status

These issue drafts were prepared from the March 11 mega plan plus the March 12
handoff. I attempted to open them directly in GitHub, but issue creation was
blocked by missing GitHub authentication in the MCP session.

## GitHub Status

These drafts were later posted via `gh`:

- `#423` Implement manifest-driven selective install profiles for ECC
- `#421` Add ECC install-state plus uninstall / doctor / repair lifecycle
- `#424` Define canonical session adapter contract for ECC 2.0 control plane
- `#422` Define generated skill placement and provenance policy
- `#425` Define governance and visibility past the tool call

The bodies below are preserved as the local source bundle used to create the
issues.

## Issue 1

### Title

Implement manifest-driven selective install profiles for ECC

### Labels

- `enhancement`

### Body

```md
## Problem

ECC still installs primarily by target and language. The repo now has first-pass
selective-install manifests and a non-mutating plan resolver, but the installer
itself does not yet consume those profiles.

Current groundwork already landed in-repo:

- `manifests/install-modules.json`
- `manifests/install-profiles.json`
- `scripts/ci/validate-install-manifests.js`
- `scripts/lib/install-manifests.js`
- `scripts/install-plan.js`

That means the missing step is no longer design discovery. The missing step is
execution: wire profile/module resolution into the actual install flow while
preserving backward compatibility.

## Scope

Implement manifest-driven install execution for current ECC targets:

- `claude`
- `cursor`
- `antigravity`

Add first-pass support for:

- `ecc-install --profile <name>`
- `ecc-install --modules <id,id,...>`
- target-aware filtering based on module target support
- backward-compatible legacy language installs during rollout

## Non-Goals

- Full uninstall/doctor/repair lifecycle in the same issue
- Codex/OpenCode install targets in the first pass if that blocks rollout
- Reorganizing the repository into separate published packages

## Acceptance Criteria

- `install.sh` can resolve and install a named profile
- `install.sh` can resolve explicit module IDs
- Unsupported modules for a target are skipped or rejected deterministically
- Legacy language-based install mode still works
- Tests cover profile resolution and installer behavior
- Docs explain the new preferred profile/module install path
```

## Issue 2

### Title

Add ECC install-state plus uninstall / doctor / repair lifecycle

### Labels

- `enhancement`

### Body

```md
## Problem

ECC has no canonical installed-state record. That makes uninstall, repair, and
post-install inspection nondeterministic.

Today the repo can classify installable content, but it still cannot reliably
answer:

- what profile/modules were installed
- what target they were installed into
- what paths ECC owns
- how to remove or repair only ECC-managed files

Without install-state, lifecycle commands are guesswork.

## Scope

Introduce a durable install-state contract and the first lifecycle commands:

- `ecc list-installed`
- `ecc uninstall`
- `ecc doctor`
- `ecc repair`

Suggested state locations:

- Claude: `~/.claude/ecc/install-state.json`
- Cursor: `./.cursor/ecc-install-state.json`
- Antigravity: `./.agent/ecc-install-state.json`

The state file should capture at minimum:

- installed version
- timestamp
- target
- profile
- resolved modules
- copied/managed paths
- source repo version or package version

## Non-Goals

- Rebuilding the installer architecture from scratch
- Full remote/cloud control-plane functionality
- Target support expansion beyond the current local installers unless it falls
  out naturally

## Acceptance Criteria

- Successful installs write install-state deterministically
- `list-installed` reports target/profile/modules/version cleanly
- `doctor` reports missing or drifted managed paths
- `repair` restores missing managed files from recorded install-state
- `uninstall` removes only ECC-managed files and leaves unrelated local files
  alone
- Tests cover install-state creation and lifecycle behavior
```

## Issue 3

### Title

Define canonical session adapter contract for ECC 2.0 control plane

### Labels

- `enhancement`

### Body

```md
## Problem

ECC now has real orchestration/session substrate, but it is still
implementation-specific.

Current state:

- tmux/worktree orchestration exists
- machine-readable session snapshots exist
- Claude local session-history commands exist

What does not exist yet is a harness-neutral adapter boundary that can normalize
session/task state across:

- tmux-orchestrated workers
- plain Claude sessions
- Codex worktrees
- OpenCode sessions
- later remote or GitHub-integrated operator surfaces

Without that adapter contract, any future ECC 2.0 operator shell will be forced
to read tmux-specific and markdown-coordination details directly.

## Scope

Define and implement the first-pass canonical session adapter layer.

Suggested deliverables:

- adapter registry
- canonical session snapshot schema
- `dmux-tmux` adapter backed by current orchestration code
- `claude-history` adapter backed by current session history utilities
- read-only inspection CLI for canonical session snapshots

## Non-Goals

- Full ECC 2.0 UI in the same issue
- Monetization/GitHub App implementation
- Remote multi-user control plane

## Acceptance Criteria

- There is a documented canonical snapshot contract
- Current tmux orchestration snapshot code is wrapped as an adapter rather than
  the top-level product contract
- A second non-tmux adapter exists to prove the abstraction is real
- Tests cover adapter selection and normalized snapshot output
- The design clearly separates adapter concerns from orchestration and UI
  concerns
```

## Issue 4

### Title

Define generated skill placement and provenance policy

### Labels

- `enhancement`

### Body

```md
## Problem

ECC now has a large and growing skill surface, but generated/imported/learned
skills do not yet have a clear long-term placement and provenance policy.

This creates several problems:

- unclear separation between curated skills and generated/learned skills
- validator noise around directories that may or may not exist locally
- weak provenance for imported or machine-generated skill content
- uncertainty about where future automated learning outputs should live

As ECC grows, the repo needs explicit rules for where generated skill artifacts
belong and how they are identified.

## Scope

Define a repo-wide policy for:

- curated vs generated vs imported skill placement
- provenance metadata requirements
- validator behavior for optional/generated skill directories
- whether generated skills are shipped, ignored, or materialized during
  install/build steps

## Non-Goals

- Building a full external skill marketplace
- Rewriting all existing skill content in one pass
- Solving every content-quality issue in the same issue

## Acceptance Criteria

- A documented placement policy exists for generated/imported skills
- Provenance requirements are explicit
- Validators no longer produce ambiguous behavior around optional/generated
  skill locations
- The policy clearly states what is publishable vs local-only
- Follow-on implementation work is split into concrete, bounded PR-sized steps
```
