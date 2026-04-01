---
name: pr-critique
description: Run the PR Critique orchestrator to review a PR against standards.
---

Run the PR Critique orchestrator.

Location: `agents/v4/orchestrators/pr-critique/`
Script: `cd agents/v4 && npm run orchestrators:pr-critique -- <TICKET-ID>`

Discovers all PRs linked to a Jira ticket, reviews each using the review pipeline, aggregates results into a severity-ranked summary, and optionally posts to Jira.

Usage:
- `run-pr-critique.ts ETA-355` — Review open PRs for ticket
- `run-pr-critique.ts ETA-355 --post-to-jira` — Review and post summary to Jira
- `run-pr-critique.ts ETA-355 --all` — Include closed/merged PRs
- `run-pr-critique.ts ETA-355 --owner Tealium` — Specify GitHub org

Steps:
1. Discover linked PRs via `gh search prs`
2. Review each PR (parallel, max 5 concurrent)
3. Aggregate results by severity (critical/high/medium/low)
4. Optionally post summary to Jira

Run the PR critique now. The user must provide a ticket ID: $ARGUMENTS
