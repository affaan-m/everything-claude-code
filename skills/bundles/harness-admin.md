---
description: Harness administration bundle — config management, skill auditing, and utilities.
---

# Harness Administration Bundle

Meta-tools for managing the Claude Code harness itself, auditing skills, and general utilities.

## Skills — Configuration & Setup
1. **configure-ecc** — Interactive ECC installer for skills and rules
2. **update-config** — Configure harness via settings.json, set up hooks and automated behaviors
3. **harness-audit** — Audit agent harness configuration
4. **security-scan** — Scan .claude/ directory for vulnerabilities and misconfigurations

## Skills — Skill Management
5. **skill-stocktake** — Audit skills and commands for quality (Quick Scan or Full Stocktake)
6. **skill-health** — Portfolio health dashboard with charts and analytics
7. **skill-create** — Extract coding patterns from git history into SKILL.md files
8. **rules-distill** — Scan skills to extract cross-cutting principles into rules

## Skills — Utilities
9. **aside** — Answer side question without losing current task context
10. **visa-doc-translate** — Translate visa documents to English with bilingual PDF output
11. **eval-harness** / **eval** — Formal evaluation framework for Claude Code sessions
12. **iterative-retrieval** — Progressive context retrieval refinement for subagent problem
13. **prompt-optimize** — Analyze and optimize prompts (advisory only)
14. **nanoclaw-repl** / **claw** — NanoClaw persistent REPL with model routing and skill hot-load
15. **pm2** — PM2 process manager initialization
16. **gradle-build** — Fix Gradle build errors for Android/KMP projects
17. **project-guidelines-example** — Example project-specific skill template
18. **agent-eval** — Head-to-head agent comparison (Claude Code, Aider, Codex, etc.)

## Agents
- **harness-optimizer** (sonnet) — Agent config optimization

## Task
$ARGUMENTS
