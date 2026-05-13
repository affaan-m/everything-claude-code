# Supply-Chain Incident Response

This playbook is the ECC operator runbook for npm, GitHub Actions, and
cross-ecosystem package-registry incidents. It is intentionally conservative:
registry signatures, provenance, and trusted publishing are useful signals, but
they do not prove that the workflow executed the intended code path.

## Current External Trigger

As of 2026-05-13, the active incident class is the May 2026 TanStack npm
supply-chain compromise:

- TanStack reported 84 malicious versions across 42 `@tanstack/*` packages,
  published on 2026-05-11 between 19:20 and 19:26 UTC.
- GitHub advisory `GHSA-g7cv-rxg3-hmpx` / `CVE-2026-45321` describes
  install-time malware that harvests cloud credentials, GitHub tokens, npm
  credentials, Vault tokens, Kubernetes tokens, and SSH private keys.
- The attack chain combined `pull_request_target`, GitHub Actions cache
  poisoning across a fork/base trust boundary, and OIDC token extraction from a
  GitHub Actions runner.
- npm trusted publishing/provenance can confirm a package came from a bound CI
  identity. It cannot by itself prove that the CI cache, lifecycle scripts, or
  publish path were safe.

Primary references:

- <https://tanstack.com/blog/npm-supply-chain-compromise-postmortem>
- <https://github.com/advisories/GHSA-g7cv-rxg3-hmpx>
- <https://tanstack.com/blog/incident-followup>
- <https://docs.npmjs.com/trusted-publishers/>
- <https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem>

## ECC Exposure Check

Run this before a release candidate, after a broad dependency bump, and after
any package-registry incident.

```bash
rg -n '(@tanstack|mistralai|uipath|opensearch|guardrails|axios)' \
  package.json package-lock.json .opencode/package.json .opencode/package-lock.json
npm ci --ignore-scripts
npm audit signatures
npm audit --audit-level=high
node scripts/ci/validate-workflow-security.js
node tests/scripts/npm-publish-surface.test.js
node tests/run-all.js
```

If a search hit appears only in documentation examples, note it in the release
evidence but do not rotate credentials for a docs-only reference.

## Immediate Response

If ECC or a maintainer machine installed a known-bad package version:

1. Stop the host from publishing or deploying.
2. Preserve evidence before cleanup:
   - package manager command history;
   - `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`;
   - CI run URLs and runner logs;
   - npm package versions and tarball integrity hashes;
   - outbound network logs where available.
3. Treat the install host as compromised if lifecycle scripts may have run.
4. Rotate every credential reachable by the process:
   - npm automation tokens and maintainer tokens;
   - GitHub PATs, fine-grained tokens, deploy keys, and Actions secrets;
   - cloud credentials, Vault tokens, Kubernetes service-account tokens, SSH
     keys, and local `.npmrc` tokens;
   - any MCP, plugin, or harness credentials available in environment variables
     or user-scope config.
5. Purge GitHub Actions caches for affected repositories.
6. Reinstall from a clean environment with `npm ci --ignore-scripts` first.
7. Re-enable lifecycle scripts only after the dependency tree and package
   versions are pinned to known-clean releases.

## GitHub Actions Rules

ECC enforces these rules through `scripts/ci/validate-workflow-security.js`:

- privileged workflows must not checkout untrusted PR refs;
- workflows with write permissions must use `npm ci --ignore-scripts`;
- workflows with `id-token: write` must not restore or save shared dependency
  caches;
- workflows that run `npm audit` must also run `npm audit signatures`;
- `pull_request_target` workflows must not restore or save shared dependency
  caches.

Treat any violation as a release blocker.

## Publication Rules

Before tagging or publishing ECC:

1. Verify there is no unexpected dependency on packages in the active advisory.
2. Use a clean checkout or throwaway worktree for release commands.
3. Do not mix PR/test caches with publish jobs.
4. Keep `id-token: write` limited to release workflows that do not use shared
   dependency caches.
5. Prefer trusted publishing/provenance where supported, while still requiring
   local package-surface tests and registry-signature verification.
6. Confirm npm dist-tag, GitHub release, Claude plugin, Codex plugin, and
   OpenCode package state in the publication-readiness evidence document.

## When To Escalate

Escalate to a maintainer security review before any release or merge if:

- a dependency lockfile references a package named in an active advisory;
- a workflow combines `pull_request_target` with dependency installation,
  cache restore/save, PR-head checkout, or write permissions;
- a release workflow combines `id-token: write` with shared cache usage;
- a publish workflow uses a long-lived npm token without a documented reason;
- AgentShield, GitGuardian, Dependabot, npm audit, or registry-signature checks
  disagree.
