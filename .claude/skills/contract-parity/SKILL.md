---
name: contract-parity
description: Run the Contract Parity orchestrator (Layer 4 - UTUI Alignment).
---

Run the Contract Parity orchestrator (Layer 4 - UTUI Alignment).

Location: `agents/v4/orchestrators/contract-parity/`
Script: `cd agents/v4 && npm run orchestrators:contract-parity`

Validates alignment between UTUI and Shadow DCP APIs.

Workflows:
- `contract.entity-full-suite` — Complete entity contract validation (ETA-183 pattern)
- `contract.version-parity` — API version behavior validation
- `contract.all-entities` — All entity types
- `contract.error-handling` — Error format validation

Tests: entity contracts, field aliasing (name <-> title), null semantics, API version behavior, public vs internal format

Agents: contract-coordinator, entity-contract-tester, field-aliasing-tester, null-semantics-tester, version-parity-tester, format-validator

Run the contract parity orchestrator now. If the user provided arguments: $ARGUMENTS
