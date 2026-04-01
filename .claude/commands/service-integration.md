---
name: service-integration
description: Run the Service Integration orchestrator (Layer 2 - Business Logic).
---

Run the Service Integration orchestrator (Layer 2 - Business Logic).

Location: `agents/v4/orchestrators/service-integration/`
Script: `cd agents/v4 && npm run orchestrators:service-integration`

Workflows:
- `service.draft-lifecycle` — Complete draft, commit, publish flow
- `service.publish-with-sync` — Publish with DCPM sync validation
- `service.conflict-handling` — Optimistic concurrency testing
- `service.sync-failure-recovery` — DCPM sync failure scenarios

Agents: service-coordinator, revision-service-tester, entity-service-tester, diff-service-tester, validation-service-tester, sync-service-tester, conflict-resolver-tester

Run the service integration orchestrator now. If the user provided arguments, use them to select a specific workflow: $ARGUMENTS
