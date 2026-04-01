---
name: jira-workflow
description: Run the Jira Ticket Workflow orchestrator.
---

Run the Jira Ticket Workflow orchestrator.

Location: `agents/v4/orchestrators/jira-ticket-workflow/`
Script: `cd agents/v4 && npm run orchestrators:jira-ticket-workflow`

Fetches all Jira tickets assigned to the current user, routes each to either development or code-review pipeline:

Development pipeline: implement -> branch -> push -> draft PR -> validate PR body -> update AI survey comment -> promote to open -> assign reviewer

Code Review pipeline: AI-assisted review -> post feedback -> Slack notification

Required environment variables:
- `JIRA_PROJECT_KEY` — Jira project key (e.g. AIDT, ETA)
- `JIRA_CURRENT_USER` — Jira username / account ID
- `GITHUB_REPO` — GitHub repo in "owner/repo" format
- `TEAM_PREFIX` — Branch team prefix (e.g. cdh, ss, aiml)

Optional:
- `SLACK_CHANNEL` — Slack channel for notifications (default: #dev-tools)

Run the Jira ticket workflow now. If the user provided arguments: $ARGUMENTS
