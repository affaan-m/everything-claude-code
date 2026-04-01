---
name: ticket-to-pr
description: Run the Ticket-to-PR full lifecycle — from Jira ticket to merged PR.
---

Run the Ticket-to-PR full lifecycle swarm orchestrator.

Location: `agents/v4/orchestrators/ticket-to-pr/`
Script: `cd agents/v4 && npm run orchestrators:ticket-to-pr -- <TICKET-ID>`

Complete development lifecycle from Jira ticket to production-ready PR:

## Phases
1. **Jira Intake** — Fetch ticket, read acceptance criteria, transition to In Progress
2. **Best Practices** — Read internal standards from Tealium/ai-dev-tools repo (branch naming, PR format, commit messages, micro-PR sizing, AI survey)
3. **ADR** — Create Architecture Decision Record in docs/ADRs/ (Context, Decision, Consequences, AC mapping)
4. **TDD Red** — Write tests first based on ADR and acceptance criteria (tests expected to fail)
5. **TDD Green** — Implement solution to make tests pass (SOLID, YAGNI, KISS, DRY)
6. **Refactor Loop** — Evaluate quality gates, fix issues, repeat until all pass (max 5 iterations):
   - 100% tests passing
   - Lint clean, type-check clean
   - ADR decision faithfully implemented
   - Every acceptance criteria covered by passing test
7. **Branch** — Create feature branch: {team}-{username}_{JIRA-ID}
8. **PR** — Push, create draft PR with required sections (Why, What, How to Test, AI Usage)
9. **AI Survey** — Update AI survey comment (model, contribution %, satisfaction score)
10. **CI Green** — Wait for all CI checks to pass, remediate failures if needed
11. **Jira to Review** — Promote PR to open, transition Jira to Ready for Code Review

## Modes
- Full lifecycle: `run-ticket-to-pr.ts ETA-377`
- ADR only: `run-ticket-to-pr.ts ETA-377 --adr-only`
- TDD cycle only: `run-ticket-to-pr.ts ETA-377 --tdd-cycle --adr-path docs/ADRs/ADR-0042.md`

## Swarm Agents (10)
lifecycle-coordinator, jira-agent, best-practices-agent, adr-agent, test-author-agent, implementation-agent, refactor-agent, github-agent, pr-standards-agent, ci-monitor-agent

## Required Environment
- `GITHUB_REPO` — GitHub repo (owner/repo)
- `TEAM_PREFIX` — Branch prefix (cdh, ss, aiml)
- `USERNAME` — Git username
- `JIRA_PROJECT_KEY` — Jira project (auto-derived from ticket ID)

## Optional Environment
- `AI_DEV_TOOLS_REPO` — Best practices repo (default: Tealium/ai-dev-tools)
- `MAX_REFACTOR_LOOPS` — Max refactor iterations (default: 5)

The user wants to run the ticket-to-pr lifecycle. If they provided arguments: $ARGUMENTS

If no arguments, ask for the Jira ticket ID.
