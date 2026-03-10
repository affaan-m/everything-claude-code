# Agent System Example Runs

## Example 1: Planning a SaaS analytics dashboard

```bash
npm run agent:plan -- "Build a SaaS analytics dashboard"
```

Expected outcome:

- Planner creates ordered tasks and a task graph.
- Architect produces an execution strategy and verification commands.
- No files are written when using the planning command.

## Example 2: Executing a debug task

```bash
npm run agent:execute -- "Debug a Python dependency error" -- --live
```

Expected outcome:

- Builder runs a ReAct loop and writes an execution artifact.
- Evaluator records pass or fail status.
- An episodic memory entry is created in `agent_memory/episodic/`.

## Example 3: Learning from the latest run

```bash
npm run agent:learn -- --episode latest
```

Expected outcome:

- Reflection summarizes lessons and failure modes.
- Semantic memory is appended.
- A procedural skill file is created or updated in `agent_skills/`.

## Example 4: Full loop in one command

```bash
npm run agent -- "Build a SaaS analytics dashboard"
```

Expected outcome:

- Planner → Architect → Builder → Evaluator → Reflection runs end to end.
- The run produces an artifact in `agent-output/`.
- A skill is extracted automatically for future retrieval.
