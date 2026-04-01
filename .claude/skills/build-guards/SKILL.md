---
name: build-guards
description: Run the Build Guards orchestrator (Layer 1 - Fast PR Gates).
---

Run the Build Guards orchestrator (Layer 1 - Fast PR Gates).

Location: `agents/v4/orchestrators/build-guards/`
Script: `cd agents/v4 && npm run orchestrators:build-guards`

Workflows:
- `build.pr-gate` — Full PR validation (analyze changes, lint, unit test, contracts, OpenAPI, coverage)
- `build.quick-check` — Minimal checks (lint + unit test, no coverage)
- `build.full-gate` — Full merge gate (lint, unit test, contracts, OpenAPI, coverage >= 80%)

Tasks: build.lint.check, build.unit.test, build.contract.validate, build.openapi.validate, build.changed.analyze, build.coverage.check

Environment variables:
- `BASE_BRANCH` — base branch for diff analysis (default: main)
- `API_VERSION` — API version for contract validation (default: v2026-01)

Run the build guards orchestrator now. If the user provided arguments, use them to select a specific workflow or task: $ARGUMENTS
