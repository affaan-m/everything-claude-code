---
name: add-ecc-bundle-component
description: Workflow command scaffold for add-ecc-bundle-component in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-ecc-bundle-component

Use this workflow when working on **add-ecc-bundle-component** in `everything-claude-code`.

## Goal

Adds a new component to the everything-claude-code-conventions ECC bundle, such as tools, skills, identity, or commands.

## Common Files

- `.claude/ecc-tools.json`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/identity.json`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a file under a relevant ECC directory (e.g., .claude/ecc-tools.json, .claude/skills/everything-claude-code/SKILL.md, .agents/skills/everything-claude-code/SKILL.md, .claude/identity.json, .claude/commands/*.md)
- Commit the new or updated file with a message referencing the ECC bundle

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.