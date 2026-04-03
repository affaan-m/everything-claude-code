---
name: add-ecc-bundle-component
description: Workflow command scaffold for add-ecc-bundle-component in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-ecc-bundle-component

Use this workflow when working on **add-ecc-bundle-component** in `everything-claude-code`.

## Goal

Adds a new component (such as a skill, agent, or configuration) to the everything-claude-code ECC bundle by creating or updating a file in a specific subdirectory.

## Common Files

- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.codex/agents/explorer.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/docs-researcher.toml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a file in a relevant ECC-related directory (e.g., .claude/skills/everything-claude-code/, .agents/skills/everything-claude-code/, .codex/agents/)
- Commit the new or updated file with a message referencing the ECC bundle

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.