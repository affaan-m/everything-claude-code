---
name: add-new-agent-definitions
description: Workflow command scaffold for add-new-agent-definitions in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent-definitions

Use this workflow when working on **add-new-agent-definitions** in `everything-claude-code`.

## Goal

Adds one or more new agent definitions, typically for specialized workflows or pipelines, by creating new agent markdown files with frontmatter and routing/model/tool configuration.

## Common Files

- `agents/*.md`
- `skills/*/SKILL.md`
- `agents/dispatch.md`
- `.opencode/opencode.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create one or more new markdown files in agents/ (e.g., agents/agent-name.md) with frontmatter specifying tools, model, and behavior.
- Optionally update agent catalogs or routing files (e.g., dispatch.md, opencode.json) to register the new agents.
- Document escalation paths, tool restrictions, and output protocols in the agent files.
- If part of a pipeline, add orchestrator skill or workflow documentation.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.