# X Thread Draft - ECC v2.0.0-rc.1

1/ ECC v2.0.0-rc.1 is the first release-candidate pass at the 2.0 direction.

The repo is moving from a Claude Code config pack into a cross-harness operating system for agentic work.

2/ The important split:

ECC is the reusable substrate.
Hermes is the operator shell that can run on top.

Skills, hooks, MCP configs, rules, and workflow packs live in ECC.

3/ Claude Code is still a core target.

Codex, OpenCode, Cursor, Gemini, and other harnesses are part of the same story now.

The goal is fewer one-off harness tricks and more reusable workflow surface.

4/ The rc.1 surface ships the public pieces:

- Hermes setup guide
- release notes
- launch checklist
- X and LinkedIn drafts
- cross-harness architecture doc
- Hermes import guidance

5/ It does not ship private workspace state.

No secrets.
No OAuth tokens.
No raw local exports.
No personal datasets.

The point is to publish the reusable system shape.

6/ Why Hermes matters:

Most agent systems fail in the daily operating loop.

They can code, but they do not keep research, content, handoffs, reminders, and execution in one measurable surface.

7/ ECC gives the reusable layer.

Hermes gives the operator shell.

Together they make the work feel less like scattered chat windows and more like a system you can run.

8/ This is still a release candidate.

The public docs and reusable surfaces are ready for review.

The deeper local integrations stay local until they are sanitized.

9/ Start here:

Repo:
<https://github.com/affaan-m/everything-claude-code>

Hermes x ECC setup:
<https://github.com/affaan-m/everything-claude-code/blob/main/docs/HERMES-SETUP.md>

Release notes:
<https://github.com/affaan-m/everything-claude-code/blob/main/docs/releases/2.0.0-rc.1/release-notes.md>
