# ECC v2.0.0-rc.1 Publication Readiness

This checklist is the release gate for public publication surfaces. Do not use
it as evidence by itself. Fill the evidence fields with fresh command output or
URLs from the exact commit being released.

## Release Identity Matrix

| Surface | Expected value | Source of truth | Fresh check | Evidence artifact | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Product name | Everything Claude Code / ECC | `README.md`, `CHANGELOG.md`, release notes | `rg -n "Everything Claude Code" README.md CHANGELOG.md docs/releases/2.0.0-rc.1` | Pending | Release owner | Pending |
| GitHub repo | `affaan-m/everything-claude-code` | Git remote and release URLs | `git remote get-url origin` | Pending | Release owner | Pending |
| Git tag | `v2.0.0-rc.1` | GitHub releases | `gh release view v2.0.0-rc.1 --repo affaan-m/everything-claude-code` | Pending | Release owner | Pending |
| npm package | `ecc-universal` | `package.json` | `node -p "require('./package.json').name"` | Pending | Package owner | Pending |
| npm version | `2.0.0-rc.1` | `VERSION`, `package.json`, lockfiles | `node -p "require('./package.json').version"` | Pending | Package owner | Pending |
| npm dist-tag | `next` for rc, `latest` only for GA | npm registry | `npm view ecc-universal dist-tags --json` | Pending | Package owner | Pending |
| Claude plugin slug | `ecc` / `ecc@ecc` install path | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `node tests/hooks/hooks.test.js` | Pending | Plugin owner | Pending |
| Claude plugin manifest | `2.0.0-rc.1`, no unsupported `agents` or explicit `hooks` fields | `.claude-plugin/plugin.json`, `.claude-plugin/PLUGIN_SCHEMA_NOTES.md` | `claude plugin validate .claude-plugin/plugin.json` | Pending | Plugin owner | Pending |
| Codex plugin manifest | `2.0.0-rc.1` with shared skill source | `.codex-plugin/plugin.json` | `node tests/docs/ecc2-release-surface.test.js` | Pending | Plugin owner | Pending |
| OpenCode package | `ecc-universal` plugin module | `.opencode/package.json`, `.opencode/index.ts` | `npm run build:opencode` | Pending | Package owner | Pending |
| Agent metadata | `2.0.0-rc.1` | `agent.yaml`, `.agents/plugins/marketplace.json` | `node tests/scripts/catalog.test.js` | Pending | Release owner | Pending |
| Migration copy | rc.1 upgrade path, not GA claim | `release-notes.md`, `quickstart.md`, `HERMES-SETUP.md` | `npx markdownlint-cli docs/releases/2.0.0-rc.1/*.md` | Pending | Docs owner | Pending |

## Publication Gates

| Gate | Required evidence | Fresh check | Blocker field | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| GitHub release | Tag exists, release notes use final URLs, assets attached if needed | `gh release view v2.0.0-rc.1 --json tagName,url,isPrerelease` | `Blocker:` | Release owner | Pending |
| npm package | `npm pack --dry-run` has expected files, version matches, rc goes to `next` | `npm pack --dry-run` and `npm publish --tag next --dry-run` where supported | `Blocker:` | Package owner | Pending |
| Claude plugin | Manifest validates, marketplace JSON points to public repo, install docs match slug | `claude plugin validate .claude-plugin/plugin.json` | `Blocker:` | Plugin owner | Pending |
| Codex plugin | Manifest version matches package and docs, hook limitations are explicit | `node tests/docs/ecc2-release-surface.test.js` | `Blocker:` | Plugin owner | Pending |
| OpenCode package | Build output is regenerated from source and package metadata is current | `npm run build:opencode` | `Blocker:` | Package owner | Pending |
| ECC Tools billing reference | Any billing claim links to verified Marketplace/App state | `gh api repos/ECC-Tools/ECC-Tools` plus app/marketplace URL check | `Blocker:` | ECC Tools owner | Pending |
| Announcement copy | X, LinkedIn, GitHub release, and longform copy point to live URLs | `rg -n "TODO" docs/releases/2.0.0-rc.1` and repeat for `TBD` | `Blocker:` | Release owner | Pending |

## Required Command Evidence

Record the exact commit SHA and command output before any publication action:

| Evidence | Command | Required result | Recorded output |
| --- | --- | --- | --- |
| Clean release branch | `git status --short --branch` | On intended release commit; no unrelated files | Pending |
| Harness audit | `npm run harness:audit -- --format json` | 70/70 passing | Pending |
| Adapter scorecard | `npm run harness:adapters -- --check` | PASS | Pending |
| Observability readiness | `npm run observability:ready` | 14/14 passing | Pending |
| Root suite | `node tests/run-all.js` | 0 failures | Pending |
| Markdown lint | `npx markdownlint-cli '**/*.md' --ignore node_modules` | 0 failures | Pending |
| Package surface | `node tests/scripts/npm-publish-surface.test.js` | 0 failures | Pending |
| Release surface | `node tests/docs/ecc2-release-surface.test.js` | 0 failures | Pending |
| Optional Rust surface | `cd ecc2 && cargo test` | 0 failures or explicit deferral | Pending |

## Do Not Publish If

- `main` has unreviewed release-surface changes after the evidence was recorded.
- `npm view ecc-universal dist-tags --json` contradicts the intended rc/GA tag.
- Claude plugin validation is unavailable and no manual install smoke test is
  recorded.
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
