---
name: orchestration
description: Operate the v4 orchestration system — 5-layer test strategy.
---

You are operating the Shadow DCP v4 Orchestration system.

The orchestration system is located at `agents/v4/orchestrators/` and implements a 5-layer test strategy.

## Available orchestrators (15 total)

### 5-Layer Strategy
| Layer | Orchestrator | NPM Script | Purpose |
|-------|-------------|------------|---------|
| 1 | build-guards | `orchestrators:build-guards` | Fast PR gates |
| 2 | service-integration | `orchestrators:service-integration` | Business logic |
| 3 | round-trip-integrity | `orchestrators:integrity` | Data corruption prevention |
| 4 | contract-parity | `orchestrators:contract-parity` | UTUI alignment |
| 5 | environment-smoke | `orchestrators:environment-smoke` | Deployment validation |

### Additional
| Orchestrator | NPM Script | Purpose |
|-------------|------------|---------|
| playwright-ui | `orchestrators:playwright-ui` | UI validation |
| unit-test | `orchestrators:unit-test-swarm` | Unit test generation |
| dcpm-integration | `orchestrators:dcpm-integration` | DCPM integration |
| jira-ticket-workflow | `orchestrators:jira-ticket-workflow` | Jira ticket automation |
| pr-critique | `orchestrators:pr-critique` | PR review automation |
| regression-test | - | Regression testing |
| integration-test | - | Integration testing |
| api-test | - | REST/GraphQL API testing |
| performance-test | - | Load/stress testing |
| security-test | - | Security scanning |

## Each orchestrator has two YAML files
- `swarm-config.yaml` - Agent topology, routing, performance targets
- `tasks.yaml` - Task definitions, workflows, inputs/outputs

## Key source files
- `agents/v4/orchestrators/index.ts` - All orchestrator loaders
- `agents/v4/orchestrators/helpers.ts` - setupOrchestrator, runWorkflow, runTask
- `agents/v4/orchestrators/run-*.ts` - Individual runner scripts

## What you can do
1. **Run an orchestrator**: `cd agents/v4 && npm run orchestrators:<name>`
2. **Read/edit orchestrator configs** - modify tasks, workflows, agents
3. **Create new orchestrators** - follow the pattern: directory + swarm-config.yaml + tasks.yaml + run script
4. **View task definitions** - inspect what each orchestrator tests
5. **Implement execution** - wire stubbed methods to real test runners (Jest, Vitest, Playwright, ESLint)
6. **Validate configs**: `cd agents/v4 && npm run orchestrators:test-config`

## User request
The user wants to work with orchestrations. If they provided arguments: $ARGUMENTS

If no arguments were provided, show a brief menu of available orchestrators and ask what they'd like to do.
