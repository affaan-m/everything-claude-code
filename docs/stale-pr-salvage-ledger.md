# Stale PR Salvage Ledger

This ledger records useful work recovered from stale, conflicted, or closed PRs.
The rule is simple: queue cleanup closes stale PRs, but it does not discard
useful work. Maintainers should inspect the closed diff, port compatible pieces
on fresh branches, and credit the source PR.

## Classification States

| State | Meaning |
| --- | --- |
| Salvaged | Useful work was ported to current `main` through a maintainer PR. |
| Already present | Current `main` already contained the useful work before salvage. |
| Superseded | Current `main` solved the same problem differently. |
| Skipped | The PR was accidental, too broad, unsafe, or too low-signal to port. |
| Translator/manual review | Content may be useful, but needs human language/domain review before import. |

## Salvaged Into Current Main

| Source PR | Original contribution | Salvage result |
| --- | --- | --- |
| #1232 | `skill-scout` search-before-creating workflow | Salvaged in the May 12 cost/skill-scout maintainer pass with current repo wording, external-source vetting, and no stale catalog-count edits. |
| #1304 | Cost tracking skill and `/cost-report` command | Salvaged in the May 12 cost/skill-scout maintainer pass with current command/skill conventions and without stale hard-coded model pricing. |
| #1309 | Trading/community project material | Salvaged in #1761 as a neutral community-project README listing. |
| #1310 | Django reviewer, build resolver, and Celery async task guidance | Salvaged in the May 12 Django/Celery maintainer pass with current catalog counts and minor example cleanup. |
| #1322 | Vietnamese README translation | Salvaged in #1764 as `docs/vi-VN/README.md` plus selector updates. |
| #1325 | Quarkus framework guidance, Java agents, and localization material | Salvaged across #1771 and #1803; stale broad docs/count edits were not copied. |
| #1326 | Angular developer skill and rules | Salvaged in #1763 with current skill, rules, install wiring, and catalog updates. |
| #1328 | Continuous-learning Windows UTF-8 stdout fix | Salvaged in #1761. |
| #1329 | Plugin install detection hardening | Salvaged in #1761 through current harness audit detection support. |
| #1334 | Windows desktop E2E skill | Salvaged in #1762 with install, package, and catalog wiring. |
| #1352 | Qwen install target | Salvaged in #1738 through the current Qwen install target. |
| #1413 | Network and homelab skills/agents | Salvaged through #1729, #1731, #1745, and #1778. |
| #1414 | F# rules, reviewer agent, and testing skill | Salvaged in #1770 with current install manifests, detection tests, and catalog wiring. |
| #1429 | JoyCode install target | Salvaged in #1737 through the current JoyCode install target. |
| #1467 | Scientific skills and OpenCode discovery work | Useful USPTO and gget pieces salvaged in #1740; stale generated claims were not copied. |
| #1478 | HarmonyOS/ArkTS rules, resolver agent, and CLAUDE example | Salvaged in #1769 with current install wiring; stale `ecc2` session/TUI edits were not carried. |
| #1493 | SessionStart context scoping | Salvaged in #1774 with current hook semantics and tests. |
| #1498 | PRD planning flow | Salvaged in #1777. |
| #1504 | Statusline/context monitor hooks | Salvaged in #1776 with current hook manifest structure and tests. |
| #1528/#1529/#1547 | Astraflow and UModelVerse provider support | Salvaged in #1775 with current provider wiring and defensive tool-call parsing. |
| #1558 | `agentic-os` skill | Salvaged in #1772. |
| #1559 | `error-handling` skill | Salvaged in #1772. |
| #1566 | Agent architecture audit skill | Salvaged in #1772. |
| #1578 | OpenCode file-probe hardening | Salvaged in #1773. |
| #1603 | `plan-orchestrate` skill | Salvaged in #1766 with current manifest/catalog wiring. |
| #1659 | Frontend design direction and interface-polish skills | Salvaged in the May 12 frontend-design maintainer pass with canonical `skills/` layout and current ECC frontend guidance, while preserving the repo guardrail that the official `frontend-design` skill should be installed from `anthropics/skills`. |
| #1674 | Production audit skill | Salvaged in #1732 after supply-chain/privacy review and rewrite. |
| #1687 | zh-CN localization sync | Large safe subsets salvaged in #1746-#1752; remaining pieces require translator/manual review. |
| #1694 | Portfolio curation | Useful focused curation updates salvaged in #1723 and #1724. |
| #1695 | Russian README translation | Ported in #1722. |
| #1697 | Saved LLM selector config | Salvaged as part of provider config/tool schema work in #1720. |
| #1699 | Windows post-edit-format path guard | Ported in #1719. |
| #1700 | Provider tool serialization | Ported in #1720. |
| #1705/#1780 | Production UI motion system | Salvaged in #1772, #1781, and #1782 with examples fixed before merge. |
| #1713 | Swift language support | Ported in #1721. |
| #1715 | CI personal-path validator hardening | Ported through CI validator hardening in #1717. |
| #1727 | MySQL patterns skill | Salvaged in #1733. |
| #1757 | Machine-learning engineering workflow | Salvaged in #1758 and tuned in #1759. |

## 2026-05-12 Gap Pass

The initial stale-closure ledger covered the P0 cleanup cohort and the biggest
salvage branches. A follow-up gap pass over PRs closed on 2026-05-11 found
additional useful items that were already present on `main` or still worth
porting.

| Source PR | Disposition |
| --- | --- |
| #1310 | Ported through the Django/Celery maintainer branch after confirming `agents/django-reviewer.md`, `agents/django-build-resolver.md`, and `skills/django-celery/SKILL.md` were still missing. |
| #1325 | Useful Quarkus framework material was already preserved across #1771 and #1803; current `main` contains the Quarkus rules/skills plus Java reviewer/build-resolver surfaces. |
| #1360 | Already present as `skills/security-bounty-hunter/`. |
| #1414 | Useful F# support was already preserved in #1770; current `main` contains the F# rules, reviewer agent, testing skill, install wiring, and detection tests. |
| #1415 | Already present as `skills/vite-patterns/`. |
| #1478 | Useful HarmonyOS/ArkTS support was already preserved in #1769; current `main` contains the ArkTS rules, resolver agent, CLAUDE example, and install wiring. |
| #1438 | Already present as `skills/ui-to-vue/`. |
| #1504 | Already mapped to #1776 in the durable salvage table. |
| #1508 | Already present as `skills/fastapi-patterns/` and `agents/fastapi-reviewer.md`. |
| #1603 | Useful `/plan-orchestrate` work was already preserved in #1766 with current package/catalog metadata. |
| #1693 | Already present as `skills/redis-patterns/`. |

## Already Present Or Superseded

| Source PR | Disposition |
| --- | --- |
| #1306 | Hook bug workarounds already exist on `main` as `docs/hook-bug-workarounds.md`. |
| #1318 | Gemini agent adaptation utility was already present on current `main`. |
| #1323 | Hook config update was already present on current `main`. |
| #1337 | Catalog count update was superseded by current catalog-count sync. |
| #1608 | Unsafe dashboard document/terminal open handling was already present on current `main` through safe runtime helpers and project-bound document opening. |
| #1678 | Windows MCP `.cmd`/`.bat` fallback behavior was already present on current `main` with current health-check tests. |
| #1682/#1701 | Strategic compact hook-path fixes were merged directly or superseded by current docs fixes. |
| JARVIS #4/#5/#6 | Stale failing dependency-only PRs; future dependency state should be regenerated by Dependabot. |

## Skipped

| Source PR | Reason |
| --- | --- |
| #1308 | Stale zh-CN sync would rewind or delete too much current tree state; concrete selector-link fix was already present. |
| #1320 | Package-manager removal conflicts with the current npm/pnpm/yarn/bun CI policy. |
| #1341 | Very large low-signal generated change with no safe focused salvage unit. |
| #1416/#1465 | Accidental fork-sync PRs with no focused contribution. |
| #1475 | One-line Gemini CLI bridge idea was too stale and underspecified to port safely. |

## Remaining Manual-Review Backlog

Only the #1687 localization tail remains plausibly useful but unsafe to
auto-port.

Handling rule:

1. Keep #1687 in translator/manual review.
2. Split any future work by surface: agents, commands, top-level docs, release
   and count surfaces, then skills.
3. Do not import stale top-level docs that carry old version or catalog-count
   facts.
4. Do not reopen old PRs unless the original author returns with a current
   rebase; maintainer-side salvage should happen on fresh branches with
   attribution.

## Future Cleanup Rule

For every stale/conflicted PR cleanup batch:

1. Close or comment on the PR based on the queue policy.
2. Add the source PR to this ledger or a dated successor ledger.
3. Classify it as salvaged, already present, superseded, skipped, or
   translator/manual review.
4. If useful, port a small compatible slice on a fresh maintainer branch.
5. Credit the source PR and author in the maintainer PR body.
