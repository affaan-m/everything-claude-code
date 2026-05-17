# ECC v2.0.0-rc.1 Publication Evidence - 2026-05-17

This is release-readiness evidence only. It does not create a GitHub release,
npm publication, plugin tag, marketplace submission, or announcement post.

## Source Commit

| Field | Evidence |
| --- | --- |
| Upstream main | `afe0ae8d725f7773147dc4aa7943a45846853a0d` |
| Git remote | `https://github.com/affaan-m/everything-claude-code.git` |
| Evidence scope | Current `main` after Japanese localization merge, Dependabot TypeScript and Node type merges, maintainer docs-link fixes, and the post-merge ja-JP markdown anchor repair |
| Local status caveat | `git status --short --branch` showed `## main...origin/main` plus unrelated untracked `docs/drafts/` |

The actual release operator should repeat all publish-facing checks from the
final release commit with a strictly clean checkout before publishing.

## Queue And Discussion State

| Surface | Command | Result |
| --- | --- | --- |
| Trunk PRs | `gh pr list --state open --limit 50 --json number,title` | 0 open PRs |
| Trunk issues | `gh issue list --state open --limit 50 --json number,title` | 0 open issues |
| Platform audit | `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | Ready; tracked repos report 0 open PRs, 0 open issues, 0 discussion maintainer-touch gaps, 0 answerable Q&A missing accepted answers, and 0 blocking dirty files |
| Operator dashboard | `npm run operator:dashboard -- --allow-untracked docs/drafts/ --write docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-17.md` | Generated current dashboard for `afe0ae8d725f7773147dc4aa7943a45846853a0d`; status remains `work remaining` because release, npm, plugin, billing, and announcement gates are approval-gated |

Tracked repositories in the platform audit were:

- `affaan-m/everything-claude-code`
- `affaan-m/agentshield`
- `affaan-m/JARVIS`
- `ECC-Tools/ECC-Tools`
- `ECC-Tools/ECC-website`

## Merge And Triage Batch

| Item | Result |
| --- | --- |
| Issue #1957 | Closed with maintainer guidance after confirming README and hooks docs already document supported manual hook installation |
| Issue #1958 | Closed in the earlier queue batch after the supply-chain IOC scan and protection pass |
| PR #1962 | Closed instead of merged because ESLint 10 requires a newer Node engine range than the current Node 18 support contract |
| PR #1961 | Merged TypeScript 6.0.3 as `344a9bdf9c45c7589dedd3c66a8a2ebf2cbf2e5b`; maintainer patch added Node types to `.opencode/tsconfig.json`; full GitHub Actions matrix passed |
| PR #1963 | Merged `@types/node` 25.8.0 as `b66ae3fbe070ef1fd2b610b4011f1345b4d75875`; maintainer patch synced the npm lockfile; full GitHub Actions matrix passed |
| PR #1953 | Merged Japanese localization as `9495b109e2c5fc5b1044ddfa1e2179f9d4aa86be`; maintainer patches fixed localized security/sponsorship links, translated the stale cubic-reported frontmatter items, confirmed `docs/zh-CN` to `docs/ja-JP` parity has 0 missing files, and approved after CodeRabbit, GitGuardian, and cubic passed |
| Post-merge trunk fix | Pushed `afe0ae8d725f7773147dc4aa7943a45846853a0d` to remove broken intra-file anchors from `docs/ja-JP/skills/autonomous-loops/SKILL.md`; this restored root lint on `main` after PR #1953 |
| Issue #1951 | Closed automatically as completed when PR #1953 merged |

## Release Gate Commands

| Gate | Command | Result |
| --- | --- | --- |
| Root lint | `npm run lint` | Passed after the ja-JP autonomous-loop anchor repair |
| Root suite | `npm test` | 2473 passed, 0 failed |
| Harness audit | `node scripts/harness-audit.js --format json` | 70/70, no top actions |
| Observability readiness | `npm run observability:ready -- --format json` | 21/21, ready yes |
| Workflow security | `node scripts/ci/validate-workflow-security.js` | Validated 8 workflow files |
| Supply-chain IOC scan | `node scripts/ci/scan-supply-chain-iocs.js --home` | Passed; 200 files inspected, including user-level persistence targets |
| npm audit | `npm audit --audit-level=high` | 0 vulnerabilities |
| npm signatures | `npm audit signatures` | 213 verified registry signatures; 17 verified attestations |
| GitHub queues | `gh pr list`; `gh issue list`; `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | 0 open PRs, 0 open issues, and platform audit ready across the tracked repo set |
| Operator dashboard | `npm run operator:dashboard -- --allow-untracked docs/drafts/ --write docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-17.md` | Dashboard generated for the current commit; macro publication gates still incomplete |

## Current Publication Blockers

- GitHub prerelease `v2.0.0-rc.1` is still not created in this pass.
- npm `ecc-universal@2.0.0-rc.1` is still not published to the `next`
  dist-tag.
- Claude plugin tag and marketplace propagation remain approval-gated.
- Codex repo-marketplace distribution is verified for rc.1, but official
  Plugin Directory publishing remains blocked on OpenAI's self-serve publishing
  surface.
- ECC Tools billing/native-payments copy remains blocked until live
  Marketplace-managed test-account readback returns an announcement-ready gate.
- Release notes, X, LinkedIn, GitHub release, and longform copy still need final
  live URLs after release/package/plugin URLs exist.
- The local checkout still has unrelated untracked `docs/drafts/`, so a strict
  clean-checkout release pass remains required before real publication.

## Result

The tracked public PR queue, issue queue, and discussion queue are clean on
May 17, 2026, and current `main` passed the Node, harness, observability,
workflow-security, npm audit/signature, and supply-chain IOC gates listed above.
This improves publication readiness but does not replace the approval-gated
release, package, plugin, billing, and announcement steps in
`publication-readiness.md`.
