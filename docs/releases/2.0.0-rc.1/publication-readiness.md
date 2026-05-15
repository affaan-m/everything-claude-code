# ECC v2.0.0-rc.1 Publication Readiness

This checklist is the release gate for public publication surfaces. Do not use
it as evidence by itself. Fill the evidence fields with fresh command output or
URLs from the exact commit being released.

For the current rc.1 naming decision and package/plugin publication path, see
[`naming-and-publication-matrix.md`](naming-and-publication-matrix.md).
For the assembled rc.1 preview pack boundary, see
[`preview-pack-manifest.md`](preview-pack-manifest.md).
For the May 12 dry-run evidence pass, see
[`publication-evidence-2026-05-12.md`](publication-evidence-2026-05-12.md).
For the May 13 release-readiness evidence refresh, see
[`publication-evidence-2026-05-13.md`](publication-evidence-2026-05-13.md).
For the May 13 post-hardening evidence refresh after PR #1850 and PR #1851, see
[`publication-evidence-2026-05-13-post-hardening.md`](publication-evidence-2026-05-13-post-hardening.md).
For the May 15 queue, discussion, Linear roadmap, Mini Shai-Hulud/TanStack
follow-up, restore-only cache, AgentShield release-verification, billing-gate,
AgentShield #86 evidence-pack provenance, and `ecc2` current-dir guard evidence
refresh through PR #1936, see
[`publication-evidence-2026-05-15.md`](publication-evidence-2026-05-15.md).

## Release Identity Matrix

| Surface | Expected value | Source of truth | Fresh check | Evidence artifact | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Product name | Everything Claude Code / ECC | `README.md`, `CHANGELOG.md`, release notes | `rg -n "Everything Claude Code" README.md CHANGELOG.md docs/releases/2.0.0-rc.1` | `publication-evidence-2026-05-12.md` | Release owner | Evidence recorded |
| GitHub repo | `affaan-m/everything-claude-code` | Git remote and release URLs | `git remote get-url origin` | `publication-evidence-2026-05-12.md` | Release owner | Evidence recorded |
| Git tag | `v2.0.0-rc.1` | GitHub releases | `gh release view v2.0.0-rc.1 --repo affaan-m/everything-claude-code` | `release not found` | Release owner | Blocked until release approval |
| npm package | `ecc-universal` | `package.json` | `node -p "require('./package.json').name"` | `publication-evidence-2026-05-12.md` | Package owner | Evidence recorded |
| npm version | `2.0.0-rc.1` | `VERSION`, `package.json`, lockfiles | `node -p "require('./package.json').version"` | `publication-evidence-2026-05-12.md` | Package owner | Evidence recorded |
| npm dist-tag | `next` for rc, `latest` only for GA | npm registry | `npm view ecc-universal dist-tags --json` | Current registry only has `latest: 1.10.0`; `next` is pending publish | Package owner | Blocked until publish approval |
| Claude plugin slug | `ecc` / `ecc@ecc` install path | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `node tests/hooks/hooks.test.js` | `publication-evidence-2026-05-12.md` | Plugin owner | Evidence recorded |
| Claude plugin manifest | `2.0.0-rc.1`, no unsupported `agents` or explicit `hooks` fields | `.claude-plugin/plugin.json`, `.claude-plugin/PLUGIN_SCHEMA_NOTES.md` | `claude plugin validate .claude-plugin/plugin.json` | `publication-evidence-2026-05-12.md` | Plugin owner | Evidence recorded |
| Codex plugin manifest | `2.0.0-rc.1` with shared skill source | `.codex-plugin/plugin.json` | `node tests/docs/ecc2-release-surface.test.js` | `publication-evidence-2026-05-12.md` | Plugin owner | Evidence recorded |
| Codex repo marketplace | `ecc@2.0.0-rc.1` exposed through `.agents/plugins/marketplace.json` | `.agents/plugins/marketplace.json`, `.codex-plugin/README.md` | `HOME="$(mktemp -d)" codex plugin marketplace add <local-checkout>` | `publication-evidence-2026-05-15.md` | Plugin owner | Repo-marketplace path verified; official Plugin Directory publishing coming soon |
| OpenCode package | `ecc-universal` plugin module | `.opencode/package.json`, `.opencode/index.ts` | `npm run build:opencode` | `publication-evidence-2026-05-12.md` | Package owner | Evidence recorded |
| Agent metadata | `2.0.0-rc.1` | `agent.yaml`, `.agents/plugins/marketplace.json` | `node tests/scripts/catalog.test.js` | `publication-evidence-2026-05-12.md` | Release owner | Evidence recorded |
| Migration copy | rc.1 upgrade path, not GA claim | `release-notes.md`, `quickstart.md`, `HERMES-SETUP.md` | `npx markdownlint-cli '**/*.md' --ignore node_modules` | `publication-evidence-2026-05-13.md` | Docs owner | Evidence recorded |

## Publication Gates

| Gate | Required evidence | Fresh check | Blocker field | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| GitHub release | Tag exists, release notes use final URLs, assets attached if needed | `gh release view v2.0.0-rc.1 --json tagName,url,isPrerelease` | `Blocker: release not found on 2026-05-12` | Release owner | Pending approval |
| npm package | `npm pack --dry-run` has expected files, version matches, rc goes to `next` | `npm pack --dry-run` and `npm publish --tag next --dry-run` where supported | `Blocker: actual publish requires approval; dry run passed with next tag` | Package owner | Dry-run passed |
| Claude plugin | Manifest validates, marketplace JSON points to public repo, install docs match slug | `claude plugin validate .claude-plugin/plugin.json`; `claude plugin tag .claude-plugin --dry-run`; isolated temp-home install smoke | `Blocker: real tag creation/push requires approval` | Plugin owner | Clean-checkout dry-run and install smoke recorded |
| Codex plugin | Manifest version matches package and docs, repo marketplace points at the plugin root, and OpenAI's current official Plugin Directory status is recorded | `node tests/docs/ecc2-release-surface.test.js`; `node tests/plugin-manifest.test.js`; `codex plugin marketplace add --help`; temp-home `codex plugin marketplace add <local-checkout>` | `Blocker: official Plugin Directory publishing and self-serve management are documented as coming soon` | Plugin owner | Repo-marketplace distribution verified; official directory pending |
| OpenCode package | Build output is regenerated from source and package metadata is current | `npm run build:opencode` | `Blocker: none for local build; public distribution still follows npm/plugin release` | Package owner | Evidence recorded |
| ECC Tools billing reference | Any billing claim links to verified Marketplace/App state | `env -u GITHUB_TOKEN gh repo view ECC-Tools/ECC-Tools --json nameWithOwner,isPrivate,viewerPermission` plus internal `/api/billing/readiness?accountLogin=<marketplace-test-account>` readback | `Blocker: ECC-Tools #73 added announcementGate; live Marketplace test-account readback must return announcementGate.ready === true before payment announcement` | ECC Tools owner | Code gate recorded; live billing readback pending |
| Announcement copy | X, LinkedIn, GitHub release, and longform copy point to live URLs | `rg -n "TODO" docs/releases/2.0.0-rc.1` and repeat for `TBD` | `Blocker: final live release/npm/plugin URLs do not exist yet` | Release owner | Pending |
| Privileged workflow hardening | Release and maintenance workflows avoid persisted checkout tokens | `node scripts/ci/validate-workflow-security.js` | `Blocker:` | Release owner | Evidence recorded in post-hardening refresh |

## Required Command Evidence

Record the exact commit SHA and command output before any publication action:

| Evidence | Command | Required result | Recorded output |
| --- | --- | --- | --- |
| Clean release branch | `git status --short --branch` | On intended release commit; no unrelated files | Pending final clean-checkout release pass; May 13 evidence branch still had unrelated untracked `docs/drafts/` |
| Harness audit | `npm run harness:audit -- --format json` | 70/70 passing | `publication-evidence-2026-05-13.md`: 70/70 |
| Adapter scorecard | `npm run harness:adapters -- --check` | PASS | `publication-evidence-2026-05-13.md`: PASS, 11 adapters |
| Observability readiness | `npm run observability:ready` | 21/21 passing | `publication-evidence-2026-05-13-post-hardening.md`: 21/21, ready true after release-safety gate refresh |
| Release safety gate | `npm run observability:ready -- --format json` | Release Safety category passing with publication readiness, supply-chain, workflow security, package surface, and release-surface evidence | `publication-evidence-2026-05-13-post-hardening.md`: Release Safety 3/3 |
| Supply-chain verification | `npm audit --json`; `npm audit signatures`; `cd ecc2 && cargo audit -q`; Dependabot alerts; GitGuardian Security Checks | 0 vulnerabilities/alerts, registry signatures verified, GitGuardian clean | `publication-evidence-2026-05-15.md`: npm registry signatures and attestations verified, 0 moderate-or-higher npm vulnerabilities, Mini Shai-Hulud/TanStack IOC scan clean |
| Root suite | `node tests/run-all.js` | 0 failures | `publication-evidence-2026-05-15.md`: 2442 passed, 0 failed |
| Markdown lint | `npx markdownlint-cli '**/*.md' --ignore node_modules` | 0 failures | `publication-evidence-2026-05-13.md`: passed after zh-CN CLAUDE list-marker normalization |
| Package surface | `node tests/scripts/npm-publish-surface.test.js` | 0 failures; no Python bytecode in npm tarball | `2/2` passed in May 12 evidence pass |
| Release surface | `node tests/docs/ecc2-release-surface.test.js` | 0 failures | `publication-evidence-2026-05-13.md`: 18/18 passed |
| Optional Rust surface | `cd ecc2 && cargo test` | 0 failures or explicit deferral | `publication-evidence-2026-05-15.md`: 462/462 passed, existing warnings only after PR #1935 current-dir guard |
| Queue baseline | `gh pr list` / `gh issue list` across trunk, AgentShield, JARVIS, ECC Tools, and ECC website | Under 20 open PRs and under 20 open issues | `publication-evidence-2026-05-15.md`: platform audit ready, 0 open PRs and 0 open issues across checked repos |
| Discussion baseline | GraphQL discussion count and maintainer-touch sweep | No unmanaged active discussion queue | `publication-evidence-2026-05-15.md`: 58 trunk discussions, 0 without maintainer touch; other tracked repos disabled or 0 |
| Linear roadmap | Linear project and issue readback | Detailed roadmap exists with release, security, AgentShield, ECC Tools, legacy, and observability lanes | `publication-evidence-2026-05-15.md`: project and 16 issue lanes recorded |

## Do Not Publish If

- `main` has unreviewed release-surface changes after the evidence was recorded.
- `npm view ecc-universal dist-tags --json` contradicts the intended rc/GA tag.
- Claude plugin validation is unavailable or no clean-checkout install smoke
  test is recorded for the intended release commit.
- Release notes or announcement drafts still contain placeholder URLs,
  `TODO`, `TBD`, private workspace paths, or personal operator references.
- Billing, Marketplace, or plugin-submission copy claims a live surface before
  the live URL exists.
- Stale PR salvage work is mid-flight on the same branch.

## Announcement Order

1. Merge the release-version PR.
2. Record the required command evidence from the release commit.
3. Create or verify the GitHub prerelease.
4. Publish npm with the rc dist-tag.
5. Submit or update plugin marketplace surfaces.
6. Update release notes with final live URLs.
7. Publish GitHub release copy.
8. Publish X, LinkedIn, and longform copy only after the public URLs work.
