---
name: test-pipeline
description: Run the complete 5-layer test pipeline end-to-end.
---

Run the complete 5-layer test pipeline.

Script: `cd agents/v4 && npm run orchestrators:all`

Executes all 5 layers in sequence:
1. **Build Guards** — Fast PR gates (lint, unit, contracts, OpenAPI)
2. **Service Integration** — Business logic (RevisionService, EntityService, DiffService)
3. **Round-Trip Integrity** — Data corruption prevention (14 entity types)
4. **Contract Parity** — UTUI alignment (ETA-183, field aliasing, null semantics)
5. **Environment Smoke** — Deployment validation (Docker, preprod, Gravitee, security)

Each layer runs independently. If a layer fails, subsequent layers still execute. Final summary shows pass/fail for all layers.

Run the complete test pipeline now. If the user provided arguments: $ARGUMENTS
