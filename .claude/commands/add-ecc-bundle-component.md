---
name: add-ecc-bundle-component
description: Workflow command scaffold for add-ecc-bundle-component in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-ecc-bundle-component

Use this workflow when working on **add-ecc-bundle-component** in `everything-claude-code`.

## Goal

Adds a new component to the everything-claude-code ECC bundle, such as skills, identity, agent configs, or commands.

## Common Files

- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/commands/*.md`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.codex/agents/*.toml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a file under .claude/skills/everything-claude-code/ or .agents/skills/everything-claude-code/ or .claude/commands/ or .claude/identity.json or .claude/ecc-tools.json or .codex/agents/
- Commit the file with a message indicating addition to ECC bundle

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.