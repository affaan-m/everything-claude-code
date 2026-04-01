---
name: playwright-ui
description: Run the Playwright UI orchestrator for browser-based testing.
---

Run the Playwright UI orchestrator.

Location: `agents/v4/orchestrators/playwright-ui/`
Script: `cd agents/v4 && npm run orchestrators:playwright-ui`

End-to-end UI validation using Playwright.

Workflows:
- `ui.smoke-suite` — Quick UI smoke test
- `ui.workflow-e2e` — Complete workflow validation
- `ui.parity-validation` — QA Matrix parity (P1 entities)
- `ui.draft-collaboration` — Multi-user draft testing
- `ui.pr-smoke` — Fast PR validation
- `ui.nightly-regression` — Comprehensive nightly tests

Agents: ui-coordinator, playwright-runner, utui-validator, dcpm-validator, qa-matrix-validator, draft-mode-tester, visual-regression-tester

Environment variables:
- `UTUI_URL` — UTUI base URL
- `SHADOW_DCP_URL` — Shadow DCP API URL
- `QA_ACCOUNT` — QA test account
- `QA_PROFILE` — QA test profile

Select a specific workflow with: `--workflow=ui.smoke-suite`

Run the Playwright UI orchestrator now. If the user provided arguments: $ARGUMENTS
