# LinkedIn Draft - ECC v2.0.0-rc.1

ECC v2.0.0-rc.1 is ready for final release review as the first release-candidate pass at the 2.0 direction.

The practical shift is simple: ECC is no longer framed as only a Claude Code plugin or config bundle.

It is becoming a cross-harness operating system for agentic work:

- reusable skills instead of one-off prompts
- hooks and tests instead of manual discipline
- MCP-backed access to docs, code, browser automation, and research
- Codex, OpenCode, Cursor, Gemini, and Claude Code surfaces that share the same core workflow layer
- Hermes as the operator shell for chat, cron, handoffs, and daily work routing

For this release-candidate surface, I kept the repo honest.

I did not publish private workspace state. I shipped the reusable layer:

- sanitized Hermes setup documentation
- release notes and launch collateral
- cross-harness architecture notes
- Hermes import guidance for turning local operator patterns into public ECC skills

The leverage is not just better prompting.

It is reducing the number of isolated surfaces, turning repeated workflows into reusable skills, and making the operating system around the agent measurable.

There is still more to harden before GA, especially around packaging, installers, and the `ecc2/` control plane. But rc.1 is enough to show the shape clearly.
