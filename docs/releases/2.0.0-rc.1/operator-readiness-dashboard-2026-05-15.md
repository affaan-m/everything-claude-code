# ECC Operator Readiness Dashboard - 2026-05-15

This dashboard is an operator snapshot, not a release approval. Use it to decide
the next ECC 2.0 work batch and to keep Linear, GitHub, and repo evidence in
sync. Before publishing, repeat the checks from the final release commit in a
clean checkout.

## Current Status

| Area | Status | Evidence |
| --- | --- | --- |
| PR queue | Current | 0 open PRs across checked repos |
| Issue queue | Current | 0 open issues across checked repos |
| Discussions | Current | 58 main-repo discussions; 0 need maintainer touch; 0 answerable discussions missing accepted answers |
| Local worktree | Current with caveat | `main...origin/main`; unrelated `?? docs/drafts/` ignored |
| Security sweep | Current with follow-up | IOC scan, audits, package-manager hardening, and scheduled watch workflow completed |
| Linear roadmap | Current with follow-up | `ECC Platform Roadmap`, ITO-44 through ITO-59 |
| ECC 2.0 publication | Not complete | Release, npm, plugin, and announcement gates pending |
| AgentShield enterprise depth | In progress | AgentShield #86 merged; live IOC loop still pending |
| ECC Tools next-level app | In progress | Billing announcement gate merged; live readback pending |
| Legacy audit and salvage | Not complete | ITO-55 remains open |

## Live Command Evidence

Run these from `everything-claude-code` unless a row says otherwise.

| Evidence | Command | 2026-05-15 result |
| --- | --- | --- |
| Platform audit | `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | `ready: true`; open PRs 0/20; open issues 0/20; discussions needing maintainer touch 0; answerable discussions missing accepted answers 0; blocking dirty files 0 |
| Discussion audit | `node scripts/discussion-audit.js --json --repo affaan-m/everything-claude-code` | `ready: true`; 58 discussions sampled; 0 need maintainer touch; 0 answerable discussions missing accepted answers |
| Main repo status | `git status --short --branch` | `## main...origin/main`; `?? docs/drafts/` remains unrelated |
| Main commit | `git rev-parse HEAD` | `6887f2952d193cff10b3eb79af7765555d8ca9f5` |
| Main repo PRs/issues | GitHub connector and `gh` readback | 0 open PRs; 0 open issues |
| AgentShield PRs/issues | GitHub connector and `gh` readback | 0 open PRs; 0 open issues |
| ECC Tools PRs/issues | Local `gh pr list` and `gh issue list` | 0 open PRs; 0 open issues |
| Discussion baseline | GraphQL discussion sweep | Main repo #1923 marked answered; no answerable Q&A missing an answer |
| Supply-chain IOC scan | `node scripts/ci/scan-supply-chain-iocs.js --root <ECC-workspace> --home` | Passed; repo/home targeted scan inspected 200 files after clean no-script reinstall |
| IOC unit tests | `node tests/ci/scan-supply-chain-iocs.test.js` | 15/15 passed |
| Dead-man switch persistence sweep | Process, LaunchAgent, and known payload filename sweep for Mini Shai-Hulud markers | No matches |
| Workflow security gate | `node scripts/ci/validate-workflow-security.js` | Passed; 8 workflow files inspected; package-manager test installs disable lifecycle scripts and no Actions cache use remains |
| Supply-chain watch workflow | `.github/workflows/supply-chain-watch.yml` | Scheduled every 6 hours; emits `supply-chain-ioc-report.json` |
| npm signatures and audit | `npm audit signatures && npm audit --audit-level=high` in main | 213 verified signatures, 17 verified attestations, 0 high vulnerabilities |

## Prompt-To-Artifact Checklist

| Objective requirement | Artifact or evidence | Status | Gap |
| --- | --- | --- | --- |
| Keep PRs under 20 | `scripts/platform-audit.js`; live GitHub readback | Current | Repeat before release |
| Keep issues under 20 | `scripts/platform-audit.js`; live GitHub readback | Current | Repeat before release |
| Respond and manage discussions | `scripts/discussion-audit.js`; #1923 answer marked | Current | Repeat before release |
| ECC 2.0 preview pack ready | `preview-pack-manifest.md`; `publication-readiness.md` | In progress | Final publish evidence still pending |
| Include Hermes specialized skills | `docs/HERMES-SETUP.md`; `skills/hermes-imports/SKILL.md` | In progress | Final preview-pack smoke still pending |
| Name-change and availability path | `naming-and-publication-matrix.md`; ITO-46 | In progress | Final name/package/channel choice not approved |
| Claude plugin publication path | `.claude-plugin/`; `publication-readiness.md`; ITO-46 | In progress | Actual publication still pending |
| Codex plugin publication path | `.codex-plugin/`; repo marketplace evidence; ITO-46 | In progress | Official directory path still pending |
| Release notes and push notifications | `release-notes.md`; `x-thread.md`; `linkedin-post.md`; ITO-47/56 | In progress | Live URLs and publish approval missing |
| AgentShield enterprise iteration | AgentShield PRs #83-#86; ITO-48/49 | In progress | Live IOC update loop and cross-harness depth pending |
| ECC Tools native payments announcement | ECC-Tools #75; ITO-50 | In progress | Live Marketplace test-account readback pending |
| ECC Tools AI-native harness-agnostic roadmap | ITO-51/52/53/54 | In progress | Implementation and hosted deep-analysis proof pending |
| Linear roadmap extremely detailed | Linear `ECC Platform Roadmap`; ITO-44 through ITO-59 | Current | Keep status comments synchronized |
| Legacy work audited, pruned, or attached | `docs/legacy-artifact-inventory.md`; ITO-55 | In progress | Final salvage/prune pass pending |
| Realtime progress tracking with Linear | ITO-54; Linear progress comments | In progress | Productized sync/observability plane pending |
| ECC 2.0 observability | `docs/architecture/observability-readiness.md`; ITO-54 | In progress | Runtime/dashboard implementation pending |

## Linear Operating State

Project:
<https://linear.app/itomarkets/project/ecc-platform-roadmap-52b328ee03e1>

Active issue state after this pass:

| Issue | Lane | State |
| --- | --- | --- |
| ITO-44 | Completion audit and readiness dashboard | In Progress |
| ITO-57 | Supply-chain intelligence and local protection loop | In Progress |
| ITO-59 | Discussions and public response queue | Current; Linear status sync pending |

Still-open lanes:

- ITO-45: ECC 2.0 preview pack, Hermes skills, packaging, and cross-harness
  readiness.
- ITO-46: name availability, Claude plugin, Codex plugin, and package channels.
- ITO-47: release notes, articles, and social copy since last release.
- ITO-48 and ITO-49: AgentShield enterprise iteration and live supply-chain
  intelligence.
- ITO-50 through ITO-54: ECC Tools payments, deep analysis, setup
  recommendations, queue automation, Linear sync, and observability.
- ITO-55: legacy audit, prune, attach, or salvage.
- ITO-56: final publication gate, release notes, and push notifications.
- ITO-58: ECC Tools GitHub access blocker.

## Decisions From This Pass

- The checked GitHub queues are below the explicit target, so the next work
  should not spend more time closing nonexistent PRs/issues.
- The discussion queue is current and repeatable through `discussion:audit`.
  ITO-59 remains open only for recurring Linear/status synchronization.
- The Mini Shai-Hulud/TanStack protection pass now has a durable scheduled
  watch workflow. ITO-57 remains open for advisory-source refresh automation
  and Linear status synchronization.
- The release is still blocked by publication, package, plugin, billing, and
  announcement gates. Passing `platform:audit` alone is not proof that ECC 2.0
  is publishable.

## Next Work Order

1. Build the ITO-44 completion dashboard into a repeatable command or generated
   markdown artifact.
2. Run `platform:audit` and `discussion:audit` from the final release commit
   before recording publication evidence.
3. Continue ITO-57 by adding advisory-source refresh automation and Linear
   status synchronization for the scheduled supply-chain watch.
4. Resume release/publication lanes ITO-45, ITO-46, and ITO-56 only after the
   readiness dashboard can be refreshed from commands.
