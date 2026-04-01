---
name: unit-test-swarm
description: Run the Unit Test Swarm orchestrator for parallel test generation.
---

Run the Unit Test Swarm orchestrator.

Location: `agents/v4/orchestrators/unit-test/`
Runner: `agents/v4/orchestrators/run-unit-test-swarm.ts`
Script: `cd agents/v4 && npm run orchestrators:unit-test-swarm`
Dry run: `cd agents/v4 && npm run orchestrators:unit-test-swarm:dry-run`

This swarm auto-discovers service files in `src/services/` lacking test coverage, dispatches parallel agents to generate tests, runs them via Jest, fixes failures, and reports coverage delta.

Usage:
- No args: auto-discover all uncovered service files
- Specific file: `npx tsx orchestrators/run-unit-test-swarm.ts src/services/Foo.js`
- Dry run (analyze only): `--dry-run`

Environment:
- `MAX_PARALLEL=6` — Max concurrent agents (default: 6)
- `MAX_FIX_ATTEMPTS=2` — Debug/fix retry loops per file (default: 2)

Source modules:
- `unit-test/source-analyzer.ts` — AST analysis of service files
- `unit-test/test-generator.ts` — Test code generation
- `unit-test/handlers.ts` — Task execution handlers

Run the unit test swarm now. If the user provided arguments: $ARGUMENTS
