---
name: test-gap-analysis
description: Run the Test Gap Analysis orchestrator to find untested code.
---

Run the Test Gap Analysis orchestrator.

## What this does

Finds test coverage gaps in **Shadow DCP's own test suite** by analyzing data flows from UTUI and DCPM.

1. **Run all Shadow DCP tests** — 5-layer Jest pipeline + Playwright E2E + DCPM integration
2. **Scan UTUI** (business logic owner) — map data flows, entity types, API calls to Shadow DCP
3. **Scan UTUI ecosystem** — tiq-utui-data-migrator (migration paths), tag-templates (connector mapping)
4. **Scan DCPM** — map API surface to find operations Shadow DCP calls but doesn't test
5. **Detect Shadow DCP gaps** — layer coverage, Playwright gaps, data flow gaps
6. **Build entity coverage matrix** — 14 entity types × 7 Shadow DCP test layers
7. **Create Jira tickets** for each Shadow DCP gap, assigned to you
8. **Loop** until no new gaps found or max iterations reached

All gaps and tickets are scoped to Shadow DCP. UTUI and DCPM are read-only context sources.

## Modes

- `$ARGUMENTS` — pass flags: `--dry-run`, `--playwright`, `--entity-matrix`, `--max-loops=N`

## Instructions

Execute the orchestrator by running the appropriate npm script from `agents/v4/`:

```bash
cd agents/v4 && npm run orchestrators:test-gap-analysis
```

### Flags

| Flag | Description |
|------|-------------|
| (none) | Full analysis with Jira ticket creation + loop |
| `--dry-run` | Full analysis, skip Jira ticket creation |
| `--playwright` | Playwright audit only — value assessment + missing specs |
| `--entity-matrix` | Build entity coverage matrix without full gap analysis |
| `--max-loops=N` | Limit gap analysis loop iterations (default: 5) |

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `JIRA_ASSIGNEE_ACCOUNT_ID` | Your Jira account ID |
| `JIRA_API_TOKEN` | Jira API token |
| `JIRA_EMAIL` | Your Jira email |
| `GITHUB_TOKEN` | GitHub token for repo scanning |

### Context Sources (read-only)

| Project | Repo | Why scanned |
|---------|------|-------------|
| **UTUI** | `Tealium/utui` | Business logic flows → which Shadow DCP tests are missing |
| **UTUI Data Migrator** | `Tealium/tiq-utui-data-migrator` | Migration paths → fields Shadow DCP must handle |
| **Tag Templates** | `Tealium/tag-templates` | Tag→connector map → connector CRUD coverage |
| **DCPM** | `Tealium/datacloud-profile-manager-service` | API surface → operations Shadow DCP calls but doesn't test |

### Shadow DCP Test Layers (gap target)

| Layer | Path | Focus |
|-------|------|-------|
| build-guards | `tests/01-build-guards/` | Unit tests, type safety |
| service-integration | `tests/02-service-integration/` | Jest integration + DCPM |
| round-trip-integrity | `tests/03-round-trip-integrity/` | Explode/implode correctness |
| contract-parity | `tests/04-contract-parity/` | UTUI ↔ Shadow DCP field alignment |
| environment-smoke | `tests/05-environment-smoke/` | Deployed environment checks |
| Playwright E2E | `tests/playwright/` | End-to-end UI flows |
| DCPM integration | `tests/02-service-integration/dcpm/` | DCPM operation coverage |

### Entity Types Tracked (14)

attributes, audiences, connectors, actions, enrichments, event-feeds, event-specs, functions, labels, rules, data-sources, file-definitions, file-sources, settings
