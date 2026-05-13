# ECC v2.0.0-rc.1 Publication Readiness

This checklist is the release gate for public publication surfaces. Do not use
it as evidence by itself. Fill the evidence fields with fresh command output or
URLs from the exact commit being released.

For the current rc.1 naming decision and package/plugin publication path, see
[`naming-and-publication-matrix.md`](naming-and-publication-matrix.md).
For the May 12 dry-run evidence pass, see
[`publication-evidence-2026-05-12.md`](publication-evidence-2026-05-12.md).
For the May 13 release-readiness evidence refresh, see
[`publication-evidence-2026-05-13.md`](publication-evidence-2026-05-13.md).

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
| OpenCode package | `ecc-universal` plugin module | `.opencode/package.json`, `.opencode/index.ts` | `npm run build:opencode` | `publication-evidence-2026-05-12.md` | Package owner | Evidence recorded |
| Agent metadata | `2.0.0-rc.1` | `agent.yaml`, `.agents/plugins/marketplace.json` | `node tests/scripts/catalog.test.js` | `publication-evidence-2026-05-12.md` | Release owner | Evidence recorded |
| Migration copy | rc.1 upgrade path, not GA claim | `release-notes.md`, `quickstart.md`, `HERMES-SETUP.md` | `npx markdownlint-cli '**/*.md' --ignore node_modules` | `publication-evidence-2026-05-13.md` | Docs owner | Evidence recorded |

## Publication Gates

| Gate | Required evidence | Fresh check | Blocker field | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| GitHub release | Tag exists, release notes use final URLs, assets attached if needed | `gh release view v2.0.0-rc.1 --json tagName,url,isPrerelease` | `Blocker: release not found on 2026-05-12` | Release owner | Pending approval |
| npm package | `npm pack --dry-run` has expected files, version matches, rc goes to `next` | `npm pack --dry-run` and `npm publish --tag next --dry-run` where supported | `Blocker: actual publish requires approval; dry run passed with next tag` | Package owner | Dry-run passed |
| Claude plugin | Manifest validates, marketplace JSON points to public repo, install docs match slug | `claude plugin validate .claude-plugin/plugin.json`; `claude plugin tag .claude-plugin --dry-run`; isolated temp-home install smoke | `Blocker: real tag creation/push requires approval` | Plugin owner | Clean-checkout dry-run and install smoke recorded |
| Codex plugin | Manifest version matches package and docs, hook limitations are explicit | `node tests/docs/ecc2-release-surface.test.js` | `Blocker: marketplace submission path still manual/owner-gated` | Plugin owner | Evidence recorded |
| OpenCode package | Build output is regenerated from source and package metadata is current | `npm run build:opencode` | `Blocker: none for local build; public distribution still follows npm/plugin release` | Package owner | Evidence recorded |
| ECC Tools billing reference | Any billing claim links to verified Marketplace/App state | `gh api repos/ECC-Tools/ECC-Tools` plus app/marketplace URL check | `Blocker:` | ECC Tools owner | Pending |
| Announcement copy | X, LinkedIn, GitHub release, and longform copy point to live URLs | `rg -n "TODO" docs/releases/2.0.0-rc.1` and repeat for `TBD` | `Blocker:` | Release owner | Pending |

## Required Command Evidence

Record the exact commit SHA and command output before any publication action:

| Evidence | Command | Required result | Recorded output |
| --- | --- | --- | --- |
| Clean release branch | `git status --short --branch` | On intended release commit; no unrelated files | Pending final clean-checkout release pass; May 13 evidence branch still had unrelated untracked `docs/drafts/` |
| Harness audit | `npm run harness:audit -- --format json` | 70/70 passing | `publication-evidence-2026-05-13.md`: 70/70 |
| Adapter scorecard | `npm run harness:adapters -- --check` | PASS | `publication-evidence-2026-05-13.md`: PASS, 11 adapters |
| Observability readiness | `npm run observability:ready` | 16/16 passing | `publication-evidence-2026-05-13.md`: 16/16, ready true |
| Root suite | `node tests/run-all.js` | 0 failures | `publication-evidence-2026-05-13.md`: 2376 passed, 0 failed |
| Markdown lint | `npx markdownlint-cli '**/*.md' --ignore node_modules` | 0 failures | `publication-evidence-2026-05-13.md`: passed after zh-CN CLAUDE list-marker normalization |
| Package surface | `node tests/scripts/npm-publish-surface.test.js` | 0 failures; no Python bytecode in npm tarball | `2/2` passed in May 12 evidence pass |
| Release surface | `node tests/docs/ecc2-release-surface.test.js` | 0 failures | `publication-evidence-2026-05-13.md`: 18/18 passed |
| Optional Rust surface | `cd ecc2 && cargo test` | 0 failures or explicit deferral | `publication-evidence-2026-05-13.md`: 462/462 passed, warnings only |

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
