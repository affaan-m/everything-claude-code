---
name: swarm
description: Operate the v4 Agent Swarm system with 23 specialized agents.
---

You are operating the Shadow DCP v4 Agent Swarm system.

The swarm system is located at `agents/v4/` and consists of:
- **23 specialized AI agents** defined in `agents/v4/agents/config/agent-team.yaml`
- **15 agent pools** defined in `agents/v4/agents/config/swarm-topology.yaml`
- **40+ task types** defined in `agents/v4/agents/config/task-definitions.yaml`
- **Agent capabilities** defined in `agents/v4/agents/config/agent-capabilities.yaml`

## Core modules
- `agents/v4/agents/orchestration/task-orchestrator.ts` - TaskOrchestrator
- `agents/v4/agents/orchestration/swarm-coordinator.ts` - SwarmCoordinator
- `agents/v4/agents/orchestration/capability-matcher.ts` - CapabilityMatcher
- `agents/v4/agents/tasks/task-registry.ts` - TaskRegistry
- `agents/v4/agents/tasks/task-queue.ts` - TaskQueue
- `agents/v4/agents/tasks/task-executor.ts` - TaskExecutor
- `agents/v4/agents/tools/task-tools.ts` - MCP task tools
- `agents/v4/agents/tools/swarm-tools.ts` - MCP swarm tools

## What you can do
1. **Read and explain** any swarm config, agent definition, or task definition
2. **Modify swarm topology** - add/remove agents, change pools, adjust routing
3. **Create new task types** - define tasks with capabilities, priorities, timeouts
4. **Edit agent capabilities** - adjust what agents can do and their specializations
5. **Run swarm commands** via `cd agents/v4 && npm run <script>`
6. **Implement execution layer** - wire up stubbed TaskOrchestrator methods to real runners

## User request
The user wants to work with the swarm system. If they provided arguments: $ARGUMENTS

If no arguments were provided, show a brief menu of what's available and ask what they'd like to do.
