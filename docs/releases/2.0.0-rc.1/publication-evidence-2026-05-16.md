# ECC v2.0.0-rc.1 Publication Evidence - 2026-05-16

This is release-readiness evidence only. It does not create a GitHub release,
npm publication, plugin tag, marketplace submission, or announcement post.

## Source Commit

| Field | Evidence |
| --- | --- |
| Upstream main | `cecab59747346ef3988305e5178b00652cb6d042` |
| Git remote | `https://github.com/affaan-m/everything-claude-code.git` |
| Evidence scope | Current `main` after PR #1944, PR #1945, issue #1946 triage, ITO-57 sync, and operator dashboard refresh |
| Local status caveat | `git status --short --branch` showed `## main...origin/main` plus unrelated untracked `docs/drafts/` |

The actual release operator should repeat all publish-facing checks from the
final release commit with a strictly clean checkout before publishing.

## Queue And Discussion State

| Surface | Command | Result |
| --- | --- | --- |
| Trunk PRs | `gh pr list --state open --json number,title,url --limit 20` | `[]` |
| Trunk issues | `gh issue list --state open --json number,title,url --limit 20` | `[]` |
| Platform audit | `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | Ready; open PRs 0, open issues 0, discussion maintainer-touch gaps 0, discussion missing-answer gaps 0, blocking dirty files 0 |
| Operator dashboard | `npm run operator:dashboard -- --json --allow-untracked docs/drafts/` | `dashboardReady: true`, `platformReady: true`, head `cecab59747346ef3988305e5178b00652cb6d042` |

## Merge And Triage Batch

| Item | Result |
| --- | --- |
| PR #1944 | Merged statusline ANSI palette update as `50ac061f9e72d7daa137f1bd08760cf74e9b577d`; targeted `node tests/hooks/ecc-statusline.test.js` and `node scripts/ci/validate-hooks.js` passed before merge |
| PR #1945 | Merged `recsys-pipeline-architect` community skill as `9e973b29fb1a2a0aeb9e6980017b67c3ddb05201`; maintainer patches synced catalog counts and removed emoji blocked by Unicode safety |
| Issue #1946 | Closed as triaged with a corrected maintainer comment; Linear `ITO-60` now tracks GateGuard proactive fact-forcing preflight UX |
| ITO-57 | Updated with PR #1947 advisory-source evidence, post-merge source refresh, IOC scan, npm audit/signature checks, and OpenAI app update caveat |
| ITO-44 | Updated with queue cleanup, dashboard refresh, and remaining macro gaps |

## Release Gate Commands

| Gate | Command | Result |
| --- | --- | --- |
| Root suite | `npm test` | 2469 passed, 0 failed |
| Rust `ecc2` suite | `cd ecc2 && cargo test` | 462 passed, 0 failed; existing dead-code/unused warnings only |
| Release surface | `node tests/docs/ecc2-release-surface.test.js` | 20 passed |
| Harness adapters | `npm run harness:adapters -- --check` | PASS; 11 adapters |
| Harness audit | `npm run harness:audit -- --format json` | 70/70, no top actions |
| Observability readiness | `npm run observability:ready` | 21/21, ready yes |
| Supply-chain IOC scan | `npm run security:ioc-scan` | Passed; 227 files inspected |
| npm audit | `npm audit --audit-level=moderate` | 0 vulnerabilities |
| npm signatures | `npm audit signatures` | 241 verified registry signatures; 30 verified attestations |
| Dashboard renderer | `node tests/scripts/operator-readiness-dashboard.test.js` | 7 passed, 0 failed |

## Current Publication Blockers

- GitHub prerelease `v2.0.0-rc.1` is still not created in this pass.
- npm `ecc-universal@2.0.0-rc.1` is still not published to the `next` dist-tag.
- Claude plugin tag and marketplace propagation remain approval-gated.
- Codex repo-marketplace distribution is verified for rc.1, but official
  Plugin Directory publishing remains blocked on OpenAI's coming-soon
  self-serve publishing surface.
- ECC Tools billing/native-payments copy remains blocked until live
  Marketplace-managed test-account readback returns an announcement-ready gate.
- Release notes, X, LinkedIn, GitHub release, and longform copy still need final
  live URLs after release/package/plugin URLs exist.
- The local checkout still has unrelated untracked `docs/drafts/`, so a strict
  clean-checkout release pass remains required before real publication.

## Result

The public PR queue, issue queue, and discussion queue are clear, and the rc.1
preview pack passed the main Node, Rust, release-surface, harness, observability,
and supply-chain gates on May 16, 2026. This improves publication readiness but
does not replace the approval-gated release, package, plugin, and announcement
steps in `publication-readiness.md`.
