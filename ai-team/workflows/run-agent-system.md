# Run Agent System Workflow

Use this workflow when you want Codex to operate the self-evolving agent runtime instead of manually role-playing each stage.

## Inputs

- Goal
- Whether the run should stay in `dry_run` mode
- Preferred model provider: `mock`, `claude`, `openai`, or `local`

## Orchestration

1. Read `config/agent_config.json`.
2. Inspect `agent_skills/` for relevant procedural memory.
3. If the task is exploratory or risky, start with:
   - `npm run agent:plan -- "<goal>"`
4. If execution is approved, run:
   - `npm run agent -- "<goal>"`
5. Inspect:
   - `agent_memory/episodic/`
   - `agent_memory/semantic/semantic_memory.json`
   - `agent_skills/`
6. If the extracted skill is low quality, edit the skill file and rerun learning if needed.

## Deliverables

- Run summary
- Evaluation result
- Extracted or updated skill
- Remaining risks before enabling live execution
