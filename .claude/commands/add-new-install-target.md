---
name: add-new-install-target
description: Workflow command scaffold for add-new-install-target in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-install-target

Use this workflow when working on **add-new-install-target** in `everything-claude-code`.

## Goal

Adds support for a new install target (e.g., CodeBuddy, Gemini) to the system, including scripts, schemas, manifests, and tests.

## Common Files

- `scripts/lib/install-targets/*.js`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/registry.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Add or update install target script in scripts/lib/install-targets/
- Add or update manifest entry in manifests/install-modules.json
- Update or add schema in schemas/ecc-install-config.schema.json and/or schemas/install-modules.schema.json
- Update scripts/lib/install-manifests.js and scripts/lib/install-targets/registry.js as needed
- Add or update documentation in README.md and/or .<target>/README.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.