---
description: Analyze a draft prompt and output an optimized, ECC-enriched version ready to paste and run. Does NOT execute the task — outputs advisory analysis only.
---

# /prompt-optimize

Analyze and optimize the following prompt for maximum ECC leverage.

## Your Task

Apply the **prompt-optimizer** skill to the user's input below. Follow the 6-phase analysis pipeline:

0. **Project Detection** — Read CLAUDE.md, detect tech stack from project files (package.json, go.mod, pyproject.toml, etc.)
1. **Intent Detection** — Classify the task type (new feature, bug fix, refactor, research, testing, review, documentation, infrastructure, design)
2. **Scope Assessment** — Evaluate complexity (TRIVIAL / LOW / MEDIUM / HIGH / EPIC), using codebase size as signal if detected
3. **ECC Component Matching** — Map to specific skills, commands, agents, and model tier
4. **Missing Context Detection** — Identify gaps. If 3+ critical items missing, ask the user to clarify before generating
5. **Workflow & Model** — Determine lifecycle position, recommend model tier, and split into multiple prompts if HIGH/EPIC

## Output Requirements

- Present diagnosis, recommended ECC components, and an optimized prompt using the Output Format from the prompt-optimizer skill
- Provide both **Full Version** (detailed) and **Quick Version** (compact, varied by intent type)
- Respond in the same language as the user's input
- The optimized prompt must be complete and ready to copy-paste into a new session
- End with footer offering adjustment or a follow-up path if the user wants execution in a separate request

## CRITICAL

Do NOT execute the user's task. Output ONLY the analysis and optimized prompt.
If the user asks for direct execution instead, explain that `/prompt-optimize`
is advisory-only and tell them to make a normal task request outside this
command.

Note: `blueprint` is a **skill**, not a slash command. Write "Use the blueprint
skill" instead of presenting it as a slash command.

## User Input

$ARGUMENTS
