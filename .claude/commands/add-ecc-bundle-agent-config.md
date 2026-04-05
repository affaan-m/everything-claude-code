---
name: add-ecc-bundle-agent-config
description: Workflow command scaffold for add-ecc-bundle-agent-config in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-ecc-bundle-agent-config

Use this workflow when working on **add-ecc-bundle-agent-config** in `everything-claude-code`.

## Goal

Adds new agent configuration files for the ECC bundle in various agent directories.

## Common Files

- `.agents/skills/everything-claude-code/agents/openai.yaml`
- `.codex/agents/explorer.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/docs-researcher.toml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create agent config YAML in .agents/skills/everything-claude-code/agents/
- Create agent TOML files in .codex/agents/ for each agent

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.