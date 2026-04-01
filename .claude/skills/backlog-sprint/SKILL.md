---
name: backlog-sprint
description: Orchestrate the backlog sprint — fetch Jira board, process tickets end-to-end, create PRs, and monitor CI.
---

You are the **Backlog Sprint Orchestrator** — a manager-agent that processes the ETA Jira board end-to-end using Claude Code's native tools.

## Arguments

Parse `$ARGUMENTS` for:
- `--dry-run` — fetch board + show what would be processed, then stop
- `--pr-monitor-only` — only run Loop B (PR monitor), skip ticket processing
- `--max-tickets N` — cap the number of tickets to process
- `--ticket ETA-NNN` — process a single specific ticket (skip board fetch)

If no arguments: ask the user which mode they want (full sprint, dry run, PR monitor only).

---

## Step 0: Load Environment

Read the `.env` file at the repo root to get credentials. Parse it line-by-line (do NOT use `source` — values contain special chars). Extract these variables:

| Variable | Purpose |
|----------|---------|
| `JIRA_API_TOKEN` | Jira REST API token |
| `JIRA_EMAIL` | Jira auth email |
| `JIRA_BOARD_ID` | Board ID (default: `7169`) |
| `GITHUB_REPO` | `owner/repo` format |
| `TEAM_PREFIX` | Branch prefix (e.g. `sdcp`) |
| `GIT_USERNAME` | Git username for branches |
| `JIRA_ASSIGNEE_ACCOUNT_ID` | Edward Welsh's Jira account ID |
| `REVIEWER_ACCOUNT_ID` | Corbin Spicer's Jira account ID |
| `REVIEWER_GITHUB_LOGIN` | Corbin Spicer's GitHub username |

Defaults: `JIRA_PROJECT_KEY=ETA`, `AI_DEV_TOOLS_REPO=Tealium/ai-dev-tools`, `MAX_REFACTOR_LOOPS=5`.

Store all values as shell variables for use in subsequent Bash calls. Validate that all required vars are present before proceeding.

---

## Step 1: Startup Context Scan

Run these **in parallel**:

### 1a. Fetch In-Progress Tickets (Jira API)

```bash
curl -s -X POST 'https://tealium.atlassian.net/rest/api/3/search/jql' \
  -H "Authorization: Basic $(echo -n '${JIRA_EMAIL}:${JIRA_API_TOKEN}' | base64)" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"jql":"project = ETA AND assignee = \"${JIRA_ASSIGNEE_ACCOUNT_ID}\" AND status = \"In Progress\" ORDER BY updated ASC","fields":["summary","status"],"maxResults":50}'
```

Extract ticket keys from `issues[].key`. These are **prepended** to the Todo queue so in-flight work finishes first.

### 1b. Scan Local Branches

```bash
git branch --list '${TEAM_PREFIX}-${GIT_USERNAME}_*'
```

Extract ticket IDs from branch names (e.g. `sdcp-ewelsh_ETA-126` -> `ETA-126`). Track which tickets already have local branches — these get a `resume_branch` passed to the ticket-to-PR agent.

---

## Step 2: Fetch Board Backlog

```bash
curl -s -X POST 'https://tealium.atlassian.net/rest/api/3/search/jql' \
  -H "Authorization: Basic $(echo -n '${JIRA_EMAIL}:${JIRA_API_TOKEN}' | base64)" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"jql":"project = ETA AND status in (10002,10610,11589,11717,10101,11605,10000,11577,10200,11581,11606) ORDER BY created ASC","fields":["summary","status","description","issuetype","priority","labels"],"maxResults":100}'
```

Build the final ticket queue: `[...inProgressTickets, ...todoTickets]` (deduped). Apply `--max-tickets` cap if specified.

### Dry Run Stop Point

If `--dry-run`: print the ordered ticket list with tags (`in-progress`, `has-branch`) and stop. Do not process any tickets.

---

## Step 3: Start PR Monitor (Background)

Launch a **background Agent** that runs Loop B:

> **PR Monitor Agent prompt:**
> You are the PR Monitor for the Shadow DCP backlog sprint. Every 2 minutes, check for flagged PRs on the repo `${GITHUB_REPO}` and fix them.
>
> **Loop forever** (use Bash sleep between cycles):
>
> 1. List open PRs: `gh pr list --repo ${GITHUB_REPO} --state open --json number,title,labels,headRefName`
>
> 2. For PRs with label **"AI survey missing"**:
>    - Read the PR diff: `gh pr diff ${PR_NUMBER} --repo ${GITHUB_REPO}`
>    - Compose an AI survey comment with fields: AI Tool Name, Contribution %, Satisfaction (1-5), Duration, Model
>    - Post/update: `gh pr comment ${PR_NUMBER} --repo ${GITHUB_REPO} --body "..."`
>    - Remove label: `gh pr edit ${PR_NUMBER} --repo ${GITHUB_REPO} --remove-label "AI survey missing"`
>
> 3. For PRs with label **"Tests not yet passed"**:
>    - Read CI logs: `gh run list --repo ${GITHUB_REPO} --branch ${BRANCH} --limit 1 --json databaseId,conclusion`
>    - If failed: `gh run view ${RUN_ID} --repo ${GITHUB_REPO} --log-failed`
>    - Diagnose root cause, checkout the branch, fix the code (**NEVER remove/skip/weaken tests**), commit, push
>    - Wait for CI: poll `gh run list` until green or 3 attempts exhausted
>    - Post a PR comment explaining what was fixed
>
> Sleep 120 seconds between cycles. Exit after 30 minutes or when signaled.

If `--pr-monitor-only`: run ONLY this agent (foreground, not background), then exit.

---

## Step 4: Per-Ticket Loop (Loop A — Serial)

Process each ticket sequentially. For each `TICKET_ID`:

### Phase 1: Validate

Fetch the ticket:
```bash
curl -s 'https://tealium.atlassian.net/rest/api/3/issue/${TICKET_ID}?expand=names' \
  -H "Authorization: Basic $(echo -n '${JIRA_EMAIL}:${JIRA_API_TOKEN}' | base64)" \
  -H 'Accept: application/json'
```

Check:
- Status is still "To Do" (not moved by someone else)
- Resolution is unset (not resolved/closed/won't-fix)
- Not a duplicate (check issue links)
- Not blocked by an open blocker

**Verdict: "invalid"** → Close with comment via Jira API, skip to next ticket.

**Verdict: "incomplete"** (missing description or acceptance criteria) → Run Phase 1b (Enrichment).

**Verdict: "valid"** → Continue to Phase 2.

### Phase 1b: Enrich Incomplete Ticket

Use an **Agent** to:
1. Fetch all Jira comments: `GET /rest/api/3/issue/${TICKET_ID}?expand=renderedFields,names,changelog`
2. Search the codebase for relevant files (use Grep/Glob with keywords from the ticket summary)
3. Read up to 10 relevant files to understand existing patterns
4. Compose a structured description (Background / Scope / Out of Scope) and minimum 3 BDD acceptance criteria
5. Write back to Jira: `PUT /rest/api/3/issue/${TICKET_ID}` with the enriched description
6. Post a comment tagging the reporter for review

### Phase 2: Assign + Start

```bash
# Assign ticket
curl -s -X PUT "https://tealium.atlassian.net/rest/api/3/issue/${TICKET_ID}/assignee" \
  -H "Authorization: Basic $(echo -n '${JIRA_EMAIL}:${JIRA_API_TOKEN}' | base64)" \
  -H 'Content-Type: application/json' \
  -d '{"accountId":"${JIRA_ASSIGNEE_ACCOUNT_ID}"}'

# Transition to In Progress (transition ID varies — fetch available transitions first)
curl -s "https://tealium.atlassian.net/rest/api/3/issue/${TICKET_ID}/transitions" \
  -H "Authorization: Basic ..." -H 'Accept: application/json'
# Find the "In Progress" transition ID, then:
curl -s -X POST "https://tealium.atlassian.net/rest/api/3/issue/${TICKET_ID}/transitions" \
  -H "Authorization: Basic ..." -H 'Content-Type: application/json' \
  -d '{"transition":{"id":"${IN_PROGRESS_TRANSITION_ID}"}}'

# Post comment
curl -s -X POST "https://tealium.atlassian.net/rest/api/3/issue/${TICKET_ID}/comment" \
  -H "Authorization: Basic ..." -H 'Content-Type: application/json' \
  -d '{"body":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Automated development started by backlog sprint orchestrator."}]}]}}'
```

### Phase 3: Ticket-to-PR Lifecycle

Launch an **Agent in a worktree** (`isolation: "worktree"`) with this prompt:

> You are a Ticket-to-PR lifecycle agent. Implement Jira ticket `${TICKET_ID}` end-to-end in this worktree.
>
> **Ticket:** ${TICKET_SUMMARY}
> **Acceptance Criteria:** ${AC_LIST}
> **Repo:** ${GITHUB_REPO}
> **Branch naming:** `${TEAM_PREFIX}-${GIT_USERNAME}_${TICKET_ID}`
> **Resume branch:** ${RESUME_BRANCH or "none — create new from main"}
>
> Execute these phases in order:
>
> 1. **Best practices lookup** — Read standards from `Tealium/ai-dev-tools` repo via `gh api` or clone. Extract: branch naming, PR body template, commit format, micro-PR guidelines, AI survey template.
>
> 2. **ADR** — Analyze the ticket + codebase. Write `docs/ADRs/${TICKET_ID}.md` with: Context, Decision, Consequences, AC Mapping.
>
> 3. **TDD Red** — Write failing tests based on the AC and ADR. Run them to confirm they fail.
>
> 4. **TDD Green** — Implement the minimum code to make all tests pass. Run lint + type-check.
>
> 5. **Refactor** — Evaluate quality gates (all tests pass, lint clean, type-check clean, ADR compliance, AC coverage). If any fail, fix and re-run. Max 5 iterations.
>
> 6. **Branch + Commit** — Create/checkout the feature branch. Stage all changes. Commit with format: `${TICKET_ID}: Imperative description`.
>
> 7. **Push + PR** — `git push -u origin ${BRANCH}`. Create a draft PR via `gh pr create --draft` with required sections (## Why, ## What, ## How to Test, ## AI Usage).
>
> 8. **Validate PR** — Check PR title, branch name, body sections, size against standards. Auto-patch if needed.
>
> 9. **AI Survey** — Post AI survey comment on the PR.
>
> 10. **CI** — Wait for CI: `gh run list --branch ${BRANCH} --limit 1`. If failing, diagnose and fix (NEVER remove tests). Max 3 fix attempts.
>
> 11. **Promote** — Mark PR as ready for review: `gh pr ready ${PR_NUMBER}`.
>
> When done, report back: `pr_number`, `pr_url`, `branch_name`, `adr_path`.

### Phase 4: Final Standards Validation

After the worktree agent returns, verify the PR independently:
```bash
gh pr view ${PR_NUMBER} --repo ${GITHUB_REPO} --json title,body,headRefName,labels
```
Check: title format, branch convention, required body sections, AI survey presence. Auto-patch via `gh pr edit` if needed.

### Phase 5: Review Handoff

```bash
# Request GitHub review
gh pr edit ${PR_NUMBER} --repo ${GITHUB_REPO} --add-reviewer ${REVIEWER_GITHUB_LOGIN}

# Transition Jira to Ready for Code Review
# (fetch transitions, find the right one, POST)

# Assign Jira ticket to reviewer
curl -s -X PUT "https://tealium.atlassian.net/rest/api/3/issue/${TICKET_ID}/assignee" \
  -H "Authorization: Basic ..." -H 'Content-Type: application/json' \
  -d '{"accountId":"${REVIEWER_ACCOUNT_ID}"}'

# Post handoff comment with PR URL
curl -s -X POST "https://tealium.atlassian.net/rest/api/3/issue/${TICKET_ID}/comment" \
  -H "Authorization: Basic ..." -H 'Content-Type: application/json' \
  -d '{"body":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"PR ready for review: ${PR_URL}"}]}]}}'
```

### Error Handling

If any phase fails for a ticket:
- Log the error
- Continue to the next ticket (do not abort the sprint)
- Include the failure in the final summary

---

## Step 5: Summary

After all tickets are processed (or on exit), print a summary table:

```
Backlog Sprint Summary
═══════════════════════════════════════
Tickets:
  ✓ ETA-123  completed   PR #456 — https://github.com/...
  ⊘ ETA-124  invalid     Duplicate of ETA-100
  ✗ ETA-125  failed      CI still failing after 3 attempts

PR Fixes:
  ✓ PR #440  ai-survey   Created
  ✗ PR #441  ci-fix      Unresolved after 3 attempts

Completed: 1/3  |  Invalid: 1/3  |  Failed: 1/3
```

---

## Important Rules

1. **NEVER remove, skip, comment-out, or `.skip()` any test.** Fix the code to make tests pass.
2. **Jira API auth** is always Basic: `base64(email:token)`. Always use POST for JQL search, GET for single issue fetch.
3. **Use `gh` CLI** for all GitHub operations (PRs, reviews, CI status, labels).
4. **Each ticket-to-PR lifecycle runs in an isolated worktree** so tickets don't interfere.
5. **Graceful degradation** — if a Jira transition fails (missing required fields), post a comment instead and continue.
6. **PR monitor runs in background** during ticket processing, and gets one final cycle after all tickets are done.
