---
name: agents
description: Work with v4 agent definitions and configuration.
---

Work with the Shadow DCP v4 Agent definitions.

Agent configuration files in `agents/v4/agents/config/`:
- `agent-team.yaml` — 23 agent definitions with Bedrock model assignments
- `agent-capabilities.yaml` — 53 capability definitions and agent types
- `swarm-topology.yaml` — 15 agent pools, routing, load balancing
- `task-definitions.yaml` — 40+ task types and 15+ workflows

Agent categories:
- **Leadership (5):** Dr. Sarah Chen (architect), Marcus Rodriguez (security), Dr. Aisha Okonkwo (GraphQL), Dr. Fatima Al-Rashid (concurrency), Dr. Amara Okafor (event sourcing)
- **Senior (11):** Alex Kumar (backend), Emily Zhang (frontend), Jordan Lee (SDET), Sophia Martinez (reviewer), Thomas Bergstrom (gateway), Kenji Yamamoto (observability), Isabella Rossi (migrations), Raj Malhotra (chaos), Henrik Nielsen (versioning), Sofia Andersson (multi-tenancy), Miguel Santos (error handling)
- **Mid-Level (8):** Priya Patel (data), Chris Thompson (DevOps), Yuki Tanaka (integration), Maria Garcia (QA), David Kim (contracts), Rachel Cohen (data integrity), Liam O'Brien (performance), Oliver Wright (docs)
- **Automation (1):** ESLint Bot

Core modules:
- `agents/v4/agents/orchestration/task-orchestrator.ts` — TaskOrchestrator
- `agents/v4/agents/orchestration/swarm-coordinator.ts` — SwarmCoordinator
- `agents/v4/agents/orchestration/capability-matcher.ts` — CapabilityMatcher
- `agents/v4/agents/tasks/task-registry.ts` — TaskRegistry
- `agents/v4/agents/tasks/task-queue.ts` — TaskQueue
- `agents/v4/agents/tasks/task-executor.ts` — TaskExecutor

MCP Tools:
- `agents/v4/agents/tools/task-tools.ts` — tasks/create, tasks/list, tasks/status, tasks/cancel
- `agents/v4/agents/tools/swarm-tools.ts` — swarm/init, swarm/status, swarm/scale, swarm/spawn-agent

The user wants to work with agent definitions. If they provided arguments: $ARGUMENTS

If no arguments, show available agents and ask what they'd like to inspect or modify.
