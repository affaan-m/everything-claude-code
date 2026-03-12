# Self-Evolving Agent System

This repository now includes a runnable agent operating system under `agent_system/` designed for Claude Code and OpenAI Codex, with `mock` and `local` adapters for safer testing and extension.

## What It Does

- Runs a Planner → Architect → Builder → Evaluator → Reflection pipeline.
- Uses a ReAct execution loop in the builder: Reason → Act → Observe.
- Persists task history in episodic memory.
- Persists reusable facts in semantic memory.
- Persists reusable procedures in the procedural skill library at `agent_skills/`.
- Supports multiple model providers through a shared adapter layer.

## Runtime Layout

```text
agent_system/
  planner/
  architect/
  builder/
  evaluator/
  reflection/
  memory/
  environment/
  orchestrator/
  prompts/
model_providers/
  claude_provider.ts
  openai_provider.ts
  local_provider.ts
  mock_provider.ts
```

## Commands

```bash
npm run agent -- "Build a SaaS analytics dashboard"
npm run agent:plan -- "Build a SaaS analytics dashboard"
npm run agent:execute -- "Debug a Python dependency error"
npm run agent:learn -- --episode latest
```

If the package is installed as a CLI, the same flows work as:

```bash
agent run "Build a SaaS analytics dashboard"
agent plan "Design a billing subsystem"
agent execute "Debug a failing integration test"
agent learn --episode latest
```

## Configuration

Default configuration lives in [config/agent_config.json](../config/agent_config.json).

Key settings:

- `model.provider`: `mock`, `claude`, `openai`, or `local`
- `memory_paths`: file-backed working, episodic, and semantic memory locations
- `skill_library_path`: where extracted procedural skills are stored
- `tool_permissions`: terminal, filesystem, and API tool controls
- `execution_sandbox`: sandbox mode, dry-run mode, and ReAct step limit

The checked-in default uses `mock` mode with `dry_run: true` so the system is safe to inspect before enabling live execution.

## Memory Model

Short-term memory:
Conversation context is passed in-memory to the planner and stored with each episode.

Episodic memory:
Each execution is saved as a JSON episode in `agent_memory/episodic/`.

Semantic memory:
Reflections append reusable facts to `agent_memory/semantic/semantic_memory.json`.

Procedural memory:
Reflection extracts reusable procedures into Markdown skill files in `agent_skills/`.

## Claude Code Usage

Claude Code can drive the runtime in two ways:

1. Use the CLI directly:

```bash
npm run agent:plan -- "Refactor the auth subsystem"
```

2. Use the agent runtime as part of a Claude workflow:

- Ask Claude to inspect `agent_memory/episodic/` for similar runs.
- Ask Claude to edit or curate files in `agent_skills/`.
- Ask Claude to trigger `npm run agent` for a new goal, then review the resulting episode and extracted skill.

The `claude_provider.ts` adapter shells out to `claude -p`, so live Claude-driven execution can be enabled by switching `model.provider` to `claude`.

## OpenAI Codex Usage

Codex can use the same runtime from the terminal or from the `ai-team/` prompts.

- Terminal path: run the `agent` CLI commands directly.
- Prompt path: use the workflows in `ai-team/workflows/` to plan or review the same system.
- Model path: switch `model.provider` to `openai` to use OpenAI Responses API models, or keep `mock` for safe offline orchestration.

## Self-Improvement Loop

After a successful run:

1. Evaluator records the verification result.
2. Reflection summarizes lessons and failure modes.
3. Skill extractor converts the reusable procedure into Markdown.
4. Semantic memory stores durable facts.
5. Future plans retrieve matching skills before creating a new task graph.

## Notes

- The CLI entrypoint is zero-dependency and executes `.ts` modules through the Node loader shim in `scripts/agent-cli.js`.
- Safety comes from the checked-in `mock` provider, `dry_run` mode, and the blocked-command policy. In mock mode the system writes artifacts into `agent-output/` instead of changing production code.
- Real code-changing behavior should be paired with `claude`, `openai`, or `local` providers only after reviewing the sandbox and blocked-command settings.
