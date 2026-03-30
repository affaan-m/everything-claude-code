---
name: everything-claude-code-patterns
description: Coding patterns extracted from everything-claude-code repository
version: 1.0.0
source: local-git-analysis
analyzed_commits: 200
total_commits: 1001
---

# Everything Claude Code Patterns

## Commit Conventions

This project uses **conventional commits** with scoped prefixes:

| Prefix | Usage | Frequency |
|--------|-------|-----------|
| `fix` | Bug fixes, hardening | 39.5% |
| `feat` | New features, skills, agents | 12% |
| `docs` | Documentation updates | 6% |
| `test` | Test additions/fixes | 2% |
| `chore` | Maintenance, deps | 2% |
| `Merge` | PR merges (auto) | 37% |

Common scopes: `skills`, `hooks`, `clv2`, `codex`, `rules`, `docs`, `readme`

```text
feat(skills): add documentation-lookup skill
fix(hooks): make pre-commit quality checks enforce staged state
test: isolate codex hook sync env (#1023)
docs(readme): fix agent count in repo tree
chore: pin actions to commit SHAs
```

## Code Architecture

```
everything-claude-code/
├── agents/          # 30 specialized subagents (.md with YAML frontmatter)
├── skills/          # 136 workflow skills (each has SKILL.md)
├── commands/        # 60 slash commands (.md with description frontmatter)
├── rules/           # Always-follow guidelines (common/ + per-language/)
├── hooks/           # Trigger-based automations (hooks.json)
├── scripts/         # Cross-platform Node.js utilities (CommonJS)
│   ├── lib/         # Shared helpers (utils.js, package-manager.js)
│   ├── hooks/       # Hook implementations
│   └── ci/          # CI validators
├── tests/           # 70 test files mirroring scripts/ structure
├── manifests/       # Install module definitions
├── mcp-configs/     # MCP server configurations
├── contexts/        # Dynamic system prompt contexts (dev, review, research)
├── examples/        # Example CLAUDE.md configs for real-world stacks
├── ecc2/            # ECC 2.0 research/prototyping
└── research/        # Architecture analysis documents
```

## Most Changed Files

| File | Changes (last 200 commits) |
|------|---------------------------|
| `README.md` | 12 |
| `skills/token-budget-advisor/SKILL.md` | 11 |
| `scripts/install-apply.js` | 7 |
| `mcp-configs/mcp-servers.json` | 6 |
| `hooks/hooks.json` | 6 |
| `tests/hooks/hooks.test.js` | 5 |
| `manifests/install-modules.json` | 5 |

## Workflows

### Adding a New Skill
1. Create `skills/{skill-name}/SKILL.md`
2. Follow template: When to Use, How It Works, Examples sections
3. Optionally add scripts under `skills/{skill-name}/scripts/`
4. Update catalog counts in `README.md` and `AGENTS.md`

### Adding a New Agent
1. Create `agents/{agent-name}.md` with YAML frontmatter (`name`, `description`, `tools`, `model`)
2. Register in `AGENTS.md`
3. Update `README.md` counts

### Adding a New Command
1. Create `commands/{command-name}.md` with `description:` frontmatter
2. Optionally pair with a backing skill

### Adding Language Rules
1. Create `rules/{language}/` directory
2. Add: `coding-style.md`, `hooks.md`, `patterns.md`, `security.md`, `testing.md`

### Hook Development
1. Add/update hook scripts in `scripts/hooks/`
2. Register in `hooks/hooks.json`
3. Add integration test in `tests/hooks/`
4. Keep blocking hooks under 200ms

## Testing Patterns

- **Runner**: `node tests/run-all.js`
- **File pattern**: `*.test.js`
- **Location**: `tests/` mirroring `scripts/` structure
- **Framework**: Custom (assert-based, no external test framework)
- **Coverage target**: 80%+
- **CI validators**: `scripts/ci/` (validate agents, skills, commands, hooks, rules, catalog counts)

## Code Style

- **Language**: JavaScript (CommonJS, no TypeScript, no ESM)
- **File naming**: lowercase with hyphens (`session-start.js`)
- **Prefer**: `const` over `let`, never `var`
- **Hook scripts**: under 200 lines, extract helpers to `scripts/lib/`
- **Exit codes**: hooks must `exit 0` on non-critical errors

## Co-Change Patterns

Files that frequently change together:
- `hooks/hooks.json` + `tests/hooks/hooks.test.js`
- `README.md` + `AGENTS.md` (catalog counts)
- `scripts/install-apply.js` + `tests/scripts/install-apply.test.js` + `manifests/install-modules.json`
- `mcp-configs/mcp-servers.json` (standalone additions)

## Cross-Platform

- Windows, macOS, Linux support via Node.js scripts
- `cygpath` handling for MSYS2/Git Bash path conversion
- Shell scripts include MINGW64 compatibility guards
