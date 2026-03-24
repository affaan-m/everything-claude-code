---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the system, including its documentation and, if needed, cross-harness copies for Codex/Cursor/Antigravity compatibility.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new SKILL.md file under skills/<skill-name>/SKILL.md with full documentation.
- Optionally, add a condensed or harness-specific copy under .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md.
- If the skill requires agent harness support, add openai.yaml or similar config under .agents/skills/<skill-name>/agents/openai.yaml.
- Address PR review feedback by updating SKILL.md and harness copies as needed.
- Remove .agents/ duplicate and keep canonical in skills/ if required by repo convention.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.