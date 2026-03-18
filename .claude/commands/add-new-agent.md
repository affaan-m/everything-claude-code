---
name: add-new-agent
description: Workflow command scaffold for add-new-agent in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent

Use this workflow when working on **add-new-agent** in `everything-claude-code`.

## Goal

Adds a new agent to the repository, including documentation and registration.

## Common Files

- `agents/*.md`
- `AGENTS.md`
- `.codex/agents/*.toml`
- `.agents/skills/*/agents/openai.yaml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create agent documentation in agents/<agent-name>.md
- Register the agent in AGENTS.md
- Optionally add .codex/agents/<agent-name>.toml for Codex harness
- Optionally add .agents/skills/<skill-name>/agents/openai.yaml if agent is tied to a skill

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.