---
name: add-ecc-bundle-config-or-policy
description: Workflow command scaffold for add-ecc-bundle-config-or-policy in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-ecc-bundle-config-or-policy

Use this workflow when working on **add-ecc-bundle-config-or-policy** in `everything-claude-code`.

## Goal

Adds or updates configuration, policy, or rules files for the ECC bundle.

## Common Files

- `.claude/team/everything-claude-code-team-config.json`
- `.claude/research/everything-claude-code-research-playbook.md`
- `.claude/rules/everything-claude-code-guardrails.md`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.claude/enterprise/controls.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a JSON, YAML, or MD file in .claude/ or .codex/ or .agents/ directories.
- Commit the new or updated configuration or policy file.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.