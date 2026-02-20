# Migrating from Claude Code to Cursor

This guide maps Claude Code concepts to their Cursor equivalents.

## Concept Mapping

| Claude Code | Cursor | Notes |
|-------------|--------|-------|
| `~/.claude/rules/` | `.cursor/rules/` | Project-scoped; YAML frontmatter with `description`, `globs`, `alwaysApply` |
| `~/.claude/agents/` | `.cursor/agents/` | `model: opus` → `model: anthropic/claude-opus-4-5`; `tools` → `readonly` |
| `~/.claude/skills/` | `.cursor/skills/` | Identical Agent Skills standard (SKILL.md) |
| `~/.claude/commands/` | `.cursor/commands/` | Compatible markdown format |
| `~/.claude.json` mcpServers | `.cursor/mcp.json` | Uses `${env:VAR_NAME}` interpolation syntax |
| Hooks (PreToolUse/PostToolUse/Stop) | No equivalent | Use linters, formatters, pre-commit hooks, CI/CD |
| Contexts | Rules with `alwaysApply: false` | Manually activated via @ mentions |
| `model: opus` | `model: anthropic/claude-opus-4-5` | Full model ID required |
| `model: sonnet` | `model: anthropic/claude-sonnet-4-5` | Full model ID required |
| `tools: ["Read", "Grep"]` | `readonly: true` | Read-only tools mapped to readonly flag |
| `tools: ["Read", "Write", "Bash"]` | `readonly: false` | Write tools mapped to full access |

## Feature Parity Matrix

| Feature | Claude Code | Cursor | Status |
|---------|-------------|--------|--------|
| Rules | Global + Project | Project only | Available |
| Agents | Full tool control | readonly flag | Available |
| Skills | Agent Skills standard | Agent Skills standard | Identical |
| Commands | Slash commands | Slash commands | Available |
| MCP Servers | Native support | Native support | Available |
| Hooks | PreToolUse/PostToolUse/Stop | Not available | Use alternatives |
| Contexts | Context files | Rules (alwaysApply: false) | Partial |
| Multi-model orchestration | codeagent-wrapper | Not available | Not available |
| Global config | ~/.claude/ | Project .cursor/ only | Different scope |

## Key Differences

### Rules
- **Claude Code**: Rules stored globally in `~/.claude/rules/` with subdirectories
- **Cursor**: Rules stored in project `.cursor/rules/` with YAML frontmatter for metadata
- **Translation**: Subdirectory paths flattened with hyphens (e.g., `common/security.md` → `common-security.md`)

### Agents
- **Claude Code**: Specify individual tools via `tools: [...]` array
- **Cursor**: Binary `readonly: true/false` flag
- **Translation**: Read-only tools (Read, Grep, Glob) → `readonly: true`; any write tool → `readonly: false`

### Model IDs
- **Claude Code**: Short names (`opus`, `sonnet`, `haiku`)
- **Cursor**: Full Anthropic model IDs (`anthropic/claude-opus-4-5`, `anthropic/claude-sonnet-4-5`)

### Hooks → Alternatives
Claude Code hooks have no direct equivalent in Cursor. Alternatives:
- **Formatting on save**: Configure Cursor's format-on-save with Prettier, Black, gofmt
- **Linting**: Use Cursor's built-in linter integration (ESLint, Ruff, golangci-lint)
- **Pre-commit**: Use `husky` or `pre-commit` for git hooks
- **CI/CD**: Move stop-hook checks to GitHub Actions or similar

### MCP Configuration
- **Claude Code**: Environment values use placeholder strings (e.g., `"YOUR_GITHUB_PAT_HERE"`)
- **Cursor**: Environment values use interpolation syntax (e.g., `"${env:GITHUB_PERSONAL_ACCESS_TOKEN}"`)

## Tips for Migrating

1. **Start with rules**: Install common + your language-specific rules first
2. **Add agents gradually**: Start with planner and code-reviewer, add others as needed
3. **Skills are plug-and-play**: The skills/ directory works identically in both tools
4. **Set up MCP**: Copy mcp.json and configure your environment variables
5. **Replace hooks with CI**: Set up pre-commit hooks and CI checks for what you lose from Claude Code hooks
