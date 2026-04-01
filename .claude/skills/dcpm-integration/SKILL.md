---
name: dcpm-integration
description: Run the DCPM Integration orchestrator.
---

Run the DCPM Integration orchestrator.

Location: `agents/v4/orchestrators/dcpm-integration/`
Script: `cd agents/v4 && npm run orchestrators:dcpm-integration`

Tests Shadow DCP to DCPM integration in priority order:

P0 (Critical):
- `dcpm.p0-publish-path` — Versioning / publish path (spine of integration)
- `dcpm.p0-entity-domains` — Attributes, audiences, connectors
- `dcpm.p0-auth-jwt` — Auth / JWT / permission mapping
- `dcpm.p0-validation-gates` — Validation, sanitizer, sync-status gates

P1 (High):
- `dcpm.p1-sanitizer-regression` — Shadow fields, data ingestion entities
- `dcpm.p1-functions-settings` — Functions + settings/consent
- `dcpm.p1-gateway-smoke` — Gravitee gateway smoke (SS + preprod)

Environment variables:
- `DCPM_TEST_ACCOUNT` — Tealium account (default: testaccount)
- `DCPM_TEST_PROFILE` — Tealium profile (default: main)
- `SS_GATEWAY_URL` — Gravitee SS gateway URL
- `PREPROD_GATEWAY_URL` — Gravitee preprod gateway URL
- `DCPM_TEST_AUTH_TOKEN` — Bearer token for gateway smoke (required for P1 gateway tests)

Run the DCPM integration orchestrator now. If the user provided arguments: $ARGUMENTS
