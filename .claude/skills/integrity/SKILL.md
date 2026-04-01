---
name: integrity
description: Run the Round-Trip Integrity orchestrator (Layer 3 - HIGHEST ROI).
---

Run the Round-Trip Integrity orchestrator (Layer 3 - HIGHEST ROI).

Location: `agents/v4/orchestrators/round-trip-integrity/`
Script: `cd agents/v4 && npm run orchestrators:integrity`

This is the highest-priority test orchestrator. It prevents data corruption in the explode/implode transformation path across all 14 entity types.

Workflows:
- `integrity.full-sweep` — All 14 entity types
- `integrity.entity-specific` — Single entity type deep dive
- `integrity.corruption-prevention` — Field loss + shape drift detection
- `integrity.sanitizer-suite` — All sanitizers (ETA-223 pattern)

Entity types: attributes, audiences, connectors, actions, enrichments, event-feeds, event-specs, functions, labels, rules, data-sources, inbound-connectors, file-definitions, file-sources

Run the integrity orchestrator now. If the user provided arguments, use them to select a specific workflow or entity type: $ARGUMENTS
