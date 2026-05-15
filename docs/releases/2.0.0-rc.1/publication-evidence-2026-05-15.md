# ECC v2.0.0-rc.1 Publication Evidence - 2026-05-15

This is release-readiness evidence only. It does not create a GitHub release,
npm publication, plugin tag, marketplace submission, or announcement post.

## Source Commit

| Field | Evidence |
| --- | --- |
| Upstream main base | `f04702bdac132662c8496e817bcd850c86e2b854` |
| Evidence branch | `docs/ecc2-rc1-may15-readiness` |
| Evidence scope | Current `main` after PR #1921 supply-chain IOC expansion |
| Git remote | `https://github.com/affaan-m/everything-claude-code.git` |
| Local status caveat | Working tree had the unrelated untracked `docs/drafts/` directory before this docs refresh |

The actual release operator should repeat all publish-facing checks from the
final release commit with a clean checkout before publishing.

## Queue And Discussion State

| Surface | Command | Result |
| --- | --- | --- |
| Trunk PRs/issues | `gh pr list` and `gh issue list` for `affaan-m/everything-claude-code` | 0 open PRs, 0 open issues |
| AgentShield PRs/issues | `gh pr list` and `gh issue list` for `affaan-m/agentshield` | 0 open PRs, 0 open issues |
| JARVIS PRs/issues | `gh pr list` and `gh issue list` for `affaan-m/JARVIS` | 0 open PRs, 0 open issues |
| ECC Tools PRs/issues | `env -u GITHUB_TOKEN gh pr list` and `env -u GITHUB_TOKEN gh issue list` for `ECC-Tools/ECC-Tools` | 0 open PRs, 0 open issues |
| ECC website PRs/issues | `env -u GITHUB_TOKEN gh pr list` and `env -u GITHUB_TOKEN gh issue list` for `ECC-Tools/ECC-website` | 0 open PRs, 0 open issues |
| Trunk discussions | GraphQL discussion count for `affaan-m/everything-claude-code` | 57 total discussions; 0 without maintainer touch after May 15 maintainer comments |
| Other repo discussions | GraphQL discussion count for AgentShield, JARVIS, ECC Tools, and ECC website | Discussions disabled or 0 total |

The ECC Tools organization is reachable with the configured GitHub host
credential. In this shell, the exported `GITHUB_TOKEN` overrides that credential
and causes false 404/403 failures for `ECC-Tools/*`. Use `env -u GITHUB_TOKEN`
for ECC Tools verification commands until that environment override is cleaned
up.

## Linear Roadmap State

The detailed execution roadmap now lives in Linear project:

<https://linear.app/itomarkets/project/ecc-platform-roadmap-52b328ee03e1>

The project contains 16 issue-level lanes and 5 milestones:

| Milestone | Issues |
| --- | --- |
| Security and Access Baseline | `ITO-44`, `ITO-57`, `ITO-58` |
| ECC 2.0 Preview and Publication | `ITO-45`, `ITO-46`, `ITO-47`, `ITO-56` |
| AgentShield Enterprise Iteration | `ITO-48`, `ITO-49` |
| ECC Tools Next-Level Platform | `ITO-50`, `ITO-51`, `ITO-52`, `ITO-53`, `ITO-54`, `ITO-59` |
| Legacy Audit and Salvage | `ITO-55` |

Project documents added in Linear:

- Roadmap Index and Current Execution Baseline
- Status Update 2026-05-15
- GitHub Queue Snapshot 2026-05-15
- Completion Audit Snapshot 2026-05-15
- Discussion Queue Evidence 2026-05-15
- ECC-Tools Access Evidence 2026-05-15

## Supply-Chain Evidence

| Surface | Evidence |
| --- | --- |
| PR #1921 | Merged supply-chain IOC expansion for Mini Shai-Hulud/TanStack follow-up |
| Node IPC follow-up | Added May 14 `node-ipc` malicious-version, hash, DNS, and runtime IOC coverage |
| Merge commit | `f04702bdac132662c8496e817bcd850c86e2b854` |
| Local IOC tests | `node tests/ci/scan-supply-chain-iocs.test.js` passed 12/12 |
| Unicode safety | `node scripts/ci/check-unicode-safety.js` passed |
| IOC scan | `npm run security:ioc-scan` passed |
| Root suite | `npm test` passed 2427/2427, 0 failed |
| Repo sweeps | IOC scanner sweep passed for trunk, AgentShield, ECC Tools, ECC website, JARVIS, and the ECC document mirror |

The May 15 IOC expansion added coverage for OpenSearch/Mistral/Guardrails/
UiPath/Squawk-style campaign variants, `opensearch_init.js`, `vite_setup.mjs`,
dead-drop/session protocol strings, and AI-tooling persistence surfaces without
committing full high-entropy indicators that trip secret scanners.
The May 15 node-ipc follow-up blocks `node-ipc@9.1.6`, `9.2.3`, `10.1.1`,
`10.1.2`, `11.0.0`, `11.1.0`, and `12.0.1`, plus the `node-ipc.cjs` payload
hash, malicious tarball hashes, DNS exfil domains, and runtime markers reported
by Socket.

## Current Publication Blockers

- GitHub prerelease `v2.0.0-rc.1` is still not created in this pass.
- npm `ecc-universal@2.0.0-rc.1` is still not published to the `next` dist-tag.
- Claude plugin tag and marketplace propagation remain approval-gated.
- Codex plugin public marketplace/manual submission path still needs final
  owner verification.
- ECC Tools billing claims are now GitHub-access-verifiable, but the billing
  product surface still needs a dedicated payment-readiness audit before any
  public payment announcement.
- Release notes, X, LinkedIn, and longform copy still need final live URLs after
  release/package/plugin URLs exist.

## Result

The queue, discussion, Linear roadmap, and supply-chain evidence are fresher
than the May 13 publication evidence. They improve readiness, but they do not
replace the final clean-checkout publish pass required by
`publication-readiness.md`.
