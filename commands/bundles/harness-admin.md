---
description: Harness administration bundle — config management, skill auditing, code quality hooks, refactoring, documentation updates.
---

# Harness Administration Bundle

Meta-tools for managing the Claude Code harness itself, auditing skills, and maintaining code quality infrastructure.

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

## Skills — Code Quality & Refactoring
9. **plankton-code-quality** — Write-time code quality enforcement via hooks (auto-format, lint, fix)
10. **refactor-clean** — Dead code cleanup, unused imports, consolidation
11. **simplify** — Review changed code for reuse, quality, efficiency
12. **build-fix** — Fix build/type errors with minimal diffs
13. **content-hash-cache-pattern** — SHA-256 content hash caching for expensive file processing
14. **regex-vs-llm-structured-text** — Decision framework: regex vs LLM for parsing structured text

## Skills — Documentation
15. **update-codemaps** — Refresh code maps for project navigation
16. **update-docs** — Update project documentation
17. **docs** — Look up current library/API documentation via Context7

## Skills — Utilities
18. **aside** — Answer side question without losing current task context
19. **visa-doc-translate** — Translate visa documents to English with bilingual PDF output
20. **eval-harness** / **eval** — Formal evaluation framework for Claude Code sessions
21. **iterative-retrieval** — Progressive context retrieval refinement for subagent problem
22. **prompt-optimize** — Analyze and optimize prompts (advisory only)
23. **nanoclaw-repl** / **claw** — NanoClaw persistent REPL with model routing and skill hot-load
24. **pm2** — PM2 process manager initialization
25. **gradle-build** — Fix Gradle build errors for Android/KMP projects
26. **project-guidelines-example** — Example project-specific skill template
27. **repo-scan** — Cross-stack source code audit: classify files, detect embedded libs
28. **workspace-surface-audit** — Audit repo, MCPs, plugins, env surfaces, recommend improvements
29. **codebase-onboarding** — Generate structured onboarding guide with architecture map
30. **context-budget** — Audit context window consumption, find bloat and redundancy
31. **token-budget-advisor** — Informed depth choice before answering large questions
32. **agent-eval** — Head-to-head agent comparison (Claude Code, Aider, Codex, etc.)

## Agents
- **harness-optimizer** (sonnet) — Agent config optimization
- **refactor-cleaner** (sonnet) — Dead code removal
- **doc-updater** (haiku) — Documentation and codemaps

## Task
$ARGUMENTS
