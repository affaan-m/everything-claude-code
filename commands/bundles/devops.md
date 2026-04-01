---
description: DevOps & Deployment bundle — Docker, CI/CD, testing, and production readiness.
---

# DevOps & Deployment Bundle

## Skills
1. **deployment-patterns** — CI/CD pipelines, Docker, health checks, rollbacks
2. **docker-patterns** — Container security, networking, volumes, multi-service
3. **e2e-testing** — Playwright E2E patterns, CI integration
4. **database-migrations** — Schema changes, rollbacks, zero-downtime
5. **security-review** — Pre-deployment security checklist
6. **verification-loop** — Comprehensive verification
7. **canary-watch** — Monitor deployed URLs for regressions after deploys or dependency upgrades
8. **git-workflow** — Branching strategies, commit conventions, merge vs rebase, conflict resolution
9. **opensource-pipeline** — Fork, sanitize, and package private projects for safe public release
10. **project-flow-ops** — Triage issues/PRs across GitHub and Linear, link active work
11. **google-workspace-ops** — Operate across Drive, Docs, Sheets, Slides as one workflow surface

## Agents
- **e2e-runner** (sonnet) — Playwright E2E tests
- **security-reviewer** (sonnet) — Security audit
- **build-error-resolver** (sonnet) — Fix build issues

## MCP servers
- **playwright** — Browser automation for E2E
- **github** — PR checks, CI status

## Deployment checklist
- [ ] All tests pass (unit + integration + E2E)
- [ ] Security scan clean
- [ ] Database migrations tested with rollback
- [ ] Docker builds successfully
- [ ] Health check endpoint responds
- [ ] Environment variables documented
- [ ] No secrets in code

## Task
$ARGUMENTS
