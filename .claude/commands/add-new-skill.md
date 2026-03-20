---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the project, including documentation and agent harnesses.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `.cursor/skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create SKILL.md in skills/skill-name/
- Create SKILL.md in .agents/skills/skill-name/ and/or .cursor/skills/skill-name/ for cross-harness support
- Add agents/openai.yaml in .agents/skills/skill-name/ if applicable

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.