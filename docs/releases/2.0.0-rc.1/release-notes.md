# ECC v2.0.0-rc.1 Release Notes

## Positioning

ECC v2.0.0-rc.1 is the first release-candidate surface for ECC as a cross-harness operating system for agentic work.

Claude Code remains a core target. Codex, OpenCode, Cursor, Gemini, and other harnesses are treated as execution surfaces that can share the same skills, rules, MCP conventions, and operator workflows. ECC is the reusable substrate; Hermes is documented as the operator shell that can sit on top of that layer.

## What Changed

- Added the sanitized Hermes setup guide to the public release story.
- Added launch collateral in-repo so the release can ship from one reviewed surface.
- Clarified the split between ECC as the reusable substrate and Hermes as the operator shell.
- Documented the cross-harness portability model for skills, hooks, MCPs, rules, and instructions.
- Added a Hermes import playbook for turning local operator patterns into publishable ECC skills.
- Added a local [observability readiness gate](../../architecture/observability-readiness.md) for loop status, session traces, harness audit, and ECC2 tool-risk logs.

## Why This Matters

ECC is no longer only a Claude Code plugin or config bundle.

The system now has a clearer shape:

- reusable skills instead of one-off prompts
- hooks and tests for workflow discipline
- MCP-backed access to docs, code, browser automation, and research
- cross-harness install surfaces for Claude Code, Codex, OpenCode, Cursor, and related tools
- Hermes as an optional operator shell for chat, cron, handoffs, and daily work routing

## Release Candidate Boundaries

This is a release candidate, not the final GA claim.

What ships in this surface:

- public Hermes setup documentation
- release notes and launch collateral
- cross-harness architecture documentation
- Hermes import guidance for sanitized operator workflows

What stays local:

- secrets, OAuth tokens, and API keys
- private workspace exports
- personal datasets
- operator-specific automations that have not been sanitized
- deeper CRM, finance, and Google Workspace playbooks

## Upgrade Motion

1. Follow the [rc.1 quickstart](quickstart.md).
2. Read the [Hermes setup guide](../../HERMES-SETUP.md).
3. Review the [cross-harness architecture](../../architecture/cross-harness.md).
4. Run the [observability readiness gate](../../architecture/observability-readiness.md).
5. Start with one workflow lane: engineering, research, content, or outreach.
6. Import only sanitized operator patterns into ECC skills.
7. Treat `ecc2/` as an alpha control plane until release packaging and installer behavior are finalized.
