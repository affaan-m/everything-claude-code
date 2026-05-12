# ECC v2.0.0-rc.1 Naming And Publication Matrix

Snapshot date: 2026-05-12.

This matrix answers the release question "ship as Everything Claude Code, ECC,
or a renamed surface?" for the rc.1 lane. It is evidence for planning, not a
publication action.

## Decision

For `v2.0.0-rc.1`, keep the public identity as **Everything Claude Code (ECC)**.
Use **ECC** as the short product name in copy, plugin slugs, status surfaces,
and diagrams, but do not rename the GitHub repo, npm package, or package entry
points before the rc.1 release.

Reason:

- the current install surface already works as `ecc-universal` plus the `ecc`
  plugin slug;
- the exact npm package name `ecc` is already occupied by an unrelated elliptic
  curve cryptography package;
- the repo name `affaan-m/ecc` is not present, but renaming
  `affaan-m/everything-claude-code` before rc.1 would create avoidable URL,
  package, docs, and marketplace churn;
- Claude and Codex plugin surfaces are already short enough as `ecc`;
- rc.1 should prove the release, plugin, and publication pipeline before any
  broader brand migration.

## Current Values

| Surface | Current value | Evidence command | 2026-05-12 result | Release decision |
| --- | --- | --- | --- | --- |
| Product display name | `Everything Claude Code` | `rg -n "Everything Claude Code" README.md CHANGELOG.md docs/releases/2.0.0-rc.1` | Present across README, release notes, launch copy, and plugin manifests | Keep for rc.1 |
| Short name | `ECC` | README/release docs | Used as the short cross-harness brand | Keep and prefer in tight copy |
| GitHub repo | `affaan-m/everything-claude-code` | `git remote get-url origin` | `https://github.com/affaan-m/everything-claude-code.git` | Keep for rc.1 |
| Possible short repo | `affaan-m/ecc` | `gh repo view affaan-m/ecc` | Not found with current auth | Candidate after rc.1 only |
| npm package | `ecc-universal` | `node -p "require('./package.json').name"` | `ecc-universal` | Keep for rc.1 |
| npm package version | `2.0.0-rc.1` local, `1.10.0` registry latest | `node -p "require('./package.json').version"` and `npm view ecc-universal name version dist-tags --json` | Local rc.1 is ready; registry latest remains `1.10.0` | Publish rc as `next`, not `latest` |
| Exact npm short name | `ecc` | `npm view ecc name version description repository.url --json` | Occupied by `ecc@0.0.2`, "Elliptic curve cryptography functions." | Do not use |
| Scoped npm short name | `@affaan-m/ecc` | `npm view @affaan-m/ecc name version --json` | Registry 404 | Possible future scoped package if npm scope policy permits |
| Former package name | `everything-claude-code` | `npm view everything-claude-code name version dist-tags --json` | Registry reports unpublished on 2026-02-07 | Do not revive for rc.1 |
| Claude plugin slug | `ecc` | `node -p "require('./.claude-plugin/plugin.json').name"` | `ecc` | Keep |
| Claude plugin version | `2.0.0-rc.1` | `claude plugin validate .claude-plugin/plugin.json` | Validation passed on Claude Code `2.1.121` | Ready for release-tag gate |
| Claude marketplace entry | `ecc` | `.claude-plugin/marketplace.json` | Version and repo point at current rc.1 surface | Keep |
| Codex plugin slug | `ecc` | `node -p "require('./.codex-plugin/plugin.json').name"` | `ecc` | Keep |
| Codex plugin version | `2.0.0-rc.1` | `node tests/docs/ecc2-release-surface.test.js` | Release surface test passed | Ready for Codex marketplace/manual marketplace gate |
| OpenCode package | `ecc-universal` | `node -p "require('./.opencode/package.json').name"` | `ecc-universal` | Keep |
| OpenCode build | Generated package output | `npm run build:opencode` | Passed | Ready for package dry-run gate |
| npm pack surface | Reduced runtime package | `npm pack --dry-run --json` | Produced `ecc-universal-2.0.0-rc.1.tgz`, 969 entries, about 5.0 MB unpacked | Needs final release-commit rerun |

## Publication Paths

| Path | Current evidence | Required next action | Blocker |
| --- | --- | --- | --- |
| GitHub release | `docs/releases/2.0.0-rc.1/` and release notes are in-tree | Re-run required command evidence from the final release commit, then create/verify `v2.0.0-rc.1` prerelease | No tag/release yet |
| npm | `ecc-universal` local package version is `2.0.0-rc.1`; registry latest is `1.10.0` | Publish rc with `npm publish --tag next` after final `npm pack --dry-run` and release tests | Do not publish before final release commit |
| Claude plugin | `claude plugin validate .claude-plugin/plugin.json` passed; `claude plugin tag --help` confirms the release tag flow creates `{name}--v{version}` tags and can push them | Run `claude plugin tag .claude-plugin --dry-run` from the clean release commit, then tag/push only after release approval | No plugin release tag created in this pass |
| Claude marketplace | `.claude-plugin/marketplace.json` points at `ecc` and the public repo | Verify marketplace update/install path after tag exists | External marketplace propagation not verified |
| Codex plugin | `codex plugin marketplace` supports add/upgrade/remove; `.codex-plugin/plugin.json` is present and release-surface tests pass | Confirm marketplace source format, then test add/upgrade from the public repo or marketplace source | No public Codex marketplace submission path verified in this pass |
| OpenCode package | `.opencode/package.json` builds from source and ships inside npm package | Re-run `npm run build:opencode` and package dry-run from release commit | OpenCode CLI 1.2.21 does not expose a separate plugin publication command in this pass |
| ECC Tools billing claim | README and launch copy mention ECC Tools / marketplace context | Verify live GitHub App billing and plan state before any payment announcement | Billing dashboard/API evidence not recorded in this pass |
| Social and longform copy | X thread, LinkedIn copy, article outline, GitHub release copy exist | Replace any stale URLs, then publish only after release/npm/plugin URLs work | Public URLs not final until release actions complete |

## Rename After rc.1

If the project moves from "Everything Claude Code" toward "ECC" after rc.1,
do it as a staged migration:

1. Keep `ecc-universal` as the npm package until a replacement package has a
   verified owner, deprecation plan, and install migration.
2. Keep `affaan-m/everything-claude-code` as the canonical repo until release
   notes, docs, plugin marketplace entries, npm metadata, and external links
   are prepared for redirects.
3. Use `ECC` as the product name in new diagrams, status payloads, and
   cross-harness docs immediately.
4. Reserve or create any new GitHub/npm/package surfaces before announcing the
   rename.
5. Ship a compatibility guide that maps old commands, package names, plugin
   slugs, and docs URLs to the new names.

## Evidence Captured In This Pass

```text
git rev-parse HEAD
7109ee08db7209c5d14809efcf832043020dfc57

node -p "require('./package.json').name + '@' + require('./package.json').version"
ecc-universal@2.0.0-rc.1

node -p "require('./.claude-plugin/plugin.json').name + '@' + require('./.claude-plugin/plugin.json').version"
ecc@2.0.0-rc.1

node -p "require('./.codex-plugin/plugin.json').name + '@' + require('./.codex-plugin/plugin.json').version"
ecc@2.0.0-rc.1

node -p "require('./.opencode/package.json').name + '@' + require('./.opencode/package.json').version"
ecc-universal@2.0.0-rc.1

npm view ecc name version description repository.url --json
ecc@0.0.2 is occupied by an unrelated elliptic curve cryptography package.

npm view ecc-universal name version dist-tags --json
registry latest is 1.10.0; no rc dist-tag exists yet.

claude plugin validate .claude-plugin/plugin.json
Validation passed on Claude Code 2.1.121.

node tests/docs/ecc2-release-surface.test.js
18 release-surface checks passed.

node tests/scripts/npm-publish-surface.test.js
2 npm publish-surface checks passed.

npm run build:opencode
Passed.

npm pack --dry-run --json
Produced ecc-universal-2.0.0-rc.1.tgz, 969 entries, about 5.0 MB unpacked.
```
