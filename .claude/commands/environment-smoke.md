---
name: environment-smoke
description: Run the Environment Smoke orchestrator (Layer 5 - Deployment Validation).
---

Run the Environment Smoke orchestrator (Layer 5 - Deployment Validation).

Location: `agents/v4/orchestrators/environment-smoke/`
Script: `cd agents/v4 && npm run orchestrators:environment-smoke`

Post-deployment validation for all environments.

Workflows:
- `smoke.local-environment` — Docker-compose validation
- `smoke.preprod-full` — Complete preprod validation
- `smoke.gravitee-full` — Gravitee 9-domain routing
- `smoke.security-suite` — Security controls (auth, secrets)
- `smoke.migration-suite` — Database migrations

Agents: smoke-coordinator, docker-environment-tester, preprod-tester, gravitee-tester, security-tester, migration-tester, health-checker

Run the environment smoke orchestrator now. If the user provided arguments: $ARGUMENTS
