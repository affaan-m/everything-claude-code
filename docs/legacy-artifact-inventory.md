# Legacy Artifact Inventory

This inventory keeps legacy and stale-work cleanup from becoming implicit. Each
artifact should be classified as landed, milestone-tracked, salvage branch, or
archive/no-action before release work treats the queue as clean.

## Classification States

| State | Meaning |
| --- | --- |
| Landed | Useful work has already been ported to current `main` and verified. |
| Milestone-tracked | Useful work remains, but belongs to a named roadmap milestone. |
| Salvage branch | Useful work should be ported through a fresh maintainer branch with attribution. |
| Translator/manual review | Content may be useful, but cannot be safely imported automatically. |
| Archive/no-action | Artifact is intentionally retained or skipped; no active port is planned. |

## Current Repository Scan

As of 2026-05-12, the tracked repo has no `_legacy-documents-*` directories.

Fresh check:

```sh
find . -type d -name '_legacy-documents-*' -print
```

Expected result: no output.

The only tracked legacy directory currently found by filename scan is
`legacy-command-shims/`.

## Inventory

| Artifact | State | Evidence | Action |
| --- | --- | --- | --- |
| `_legacy-documents-*` directories | Archive/no-action | No matching directories exist in the tracked checkout as of 2026-05-12. | Re-run the scan before release. If any appear, add each directory to this table before publishing. |
| `legacy-command-shims/` | Archive/no-action | `legacy-command-shims/README.md` states these retired short-name shims are opt-in and no longer loaded by the default plugin command surface. | Keep as an explicit compatibility archive. Do not move these back into the default plugin surface without a migration decision. |
| Closed-stale PR salvage ledger | Landed | `~/.cluster-swarm/handoffs/ecc-stale-salvage-ledger-20260512-0210.md` records useful stale work recovered through maintainer PRs. | Continue using the ledger pattern for future stale closures. |
| #1687 zh-CN localization tail | Translator/manual review | Large safe subsets landed in #1746-#1752; remaining pieces require translator/manual review per salvage ledger. | Do not blindly cherry-pick. Split by docs, commands, agents, and skills if a translator review lane opens. |

## Legacy Command Shim Contents

The compatibility archive currently contains 12 retired command shims:

| Shim | Preferred current direction |
| --- | --- |
| `agent-sort.md` | Use maintained command or skill routing where available. |
| `claw.md` | Use maintained `scripts/claw.js` / `npm run claw` surfaces. |
| `context-budget.md` | Use maintained token/context budgeting skills. |
| `devfleet.md` | Use maintained agent/harness orchestration docs and skills. |
| `docs.md` | Use current documentation and release checklist workflows. |
| `e2e.md` | Use maintained E2E testing skills and test scripts. |
| `eval.md` | Use eval-harness and verification-loop skills. |
| `orchestrate.md` | Use maintained orchestration status and worktree scripts. |
| `prompt-optimize.md` | Use prompt-optimizer skill. |
| `rules-distill.md` | Use current rules and skill extraction workflows. |
| `tdd.md` | Use tdd-workflow and language-specific testing skills. |
| `verify.md` | Use verification-loop and package-specific verification skills. |

## Release Rule

Before any GA or rc publication pass:

1. Re-run the `_legacy-documents-*` scan.
2. Re-run the closed-stale salvage ledger check.
3. Confirm every newly discovered legacy artifact is represented in this file.
4. Port useful work through fresh maintainer PRs with source attribution.
5. Leave archive/no-action artifacts out of default install and plugin loading.
