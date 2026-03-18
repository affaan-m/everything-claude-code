---
name: add-team-or-identity-or-research-config
description: Workflow command scaffold for add-team-or-identity-or-research-config in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-team-or-identity-or-research-config

Use this workflow when working on **add-team-or-identity-or-research-config** in `everything-claude-code`.

## Goal

Adds a new team, identity, or research configuration to the system.

## Common Files

- `.claude/team/everything-claude-code-team-config.json`
- `.claude/identity.json`
- `.claude/research/everything-claude-code-research-playbook.md`
- `.claude/commands/add-team-or-identity-or-research-config.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .claude/team/everything-claude-code-team-config.json for teams
- Create or update .claude/identity.json for identities
- Create or update .claude/research/everything-claude-code-research-playbook.md for research configs

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.