# Learn From Run Workflow

Use this workflow when a previous execution already exists and you want Codex or Claude to update memory without rerunning the full task.

## Inputs

- Episode selector, or `latest`
- Whether to force re-learning from an existing reflection

## Orchestration

1. Inspect `agent_memory/episodic/` and choose the target episode.
2. Run:
   - `npm run agent:learn -- --episode <selector>`
3. Review the updated semantic memory and generated procedural skill.
4. Tighten the extracted skill if the steps are too generic or the failure modes are incomplete.

## Expected Deliverables

- Reflection summary
- Semantic insights
- Procedural skill file in `agent_skills/`
- Notes on whether the skill is ready for future retrieval
