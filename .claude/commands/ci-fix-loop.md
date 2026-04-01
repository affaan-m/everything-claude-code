---
name: ci-fix-loop
description: Run the CI Fix Loop orchestrator to diagnose and fix failing CI.
---

Run the CI Fix Loop orchestrator.

Location: `agents/v4/orchestrators/ci-fix-loop/`
Script: `cd agents/v4 && npm run orchestrators:ci-fix-loop -- --pr <PR_NUMBER>`

Automated CI remediation loop — inspects GitHub CI failures, documents errors,
diagnoses root causes, applies fixes, pushes, and loops until green:

## Phases
1. **CI Inspection** — Fetch PR info, query Checks API, download failure logs
2. **Error Documentation** — Create/append structured error report in docs/CI/errors/
3. **Diagnosis** — Classify errors (lint, type, test, build, config), identify root causes, produce fix plan
4. **Fix Application** — Apply fixes, run local validation, update error report
5. **Push & Poll** — Commit fixes, push to branch, poll CI until checks complete
6. **Loop Decision** — If green: stop. If max iterations or regressions: stop. Otherwise: loop back to Phase 1.

## Modes
- Full fix loop: `run-ci-fix-loop.ts --pr 255`
- From branch: `run-ci-fix-loop.ts --branch cdh-ewelsh_ETA-377`
- Inspect only: `run-ci-fix-loop.ts --pr 255 --inspect-only`
- Custom iterations: `run-ci-fix-loop.ts --pr 255 --max-iterations 3`

## Swarm Agents (5)
ci-loop-coordinator, ci-inspector-agent, error-documenter-agent, diagnostician-agent, fix-agent, github-agent

## Error Report Format
Each iteration appends to `docs/CI/errors/{TICKET}-{timestamp}.md`:
- Per-check failure sections with raw error excerpts
- Parsed errors table (file, line, category, message)
- Fix actions taken and local validation results
- Loop decision rationale

## Stop Conditions
- All CI checks green
- Max iterations reached (default: 10)
- Regressions outnumber new fixes (fixes are making things worse)

## Required Environment
- `GITHUB_REPO` — GitHub repo (owner/repo)

## Optional Environment
- `TICKET_ID` — Jira ticket ID (auto-derived from branch name)
- `MAX_CI_FIX_ITERATIONS` — Max loop iterations (default: 10)
- `CI_POLL_INTERVAL_MS` — CI polling interval in ms (default: 30000)

$ARGUMENTS
