# Everything Claude Code — Cursor IDE Support

Pre-translated configurations for [Cursor IDE](https://cursor.com), part of the [ecc-universal](https://www.npmjs.com/package/ecc-universal) package.

## What's Included

| Category | Count | Description |
|----------|-------|-------------|
| Rules | 27 | Coding standards, security, testing, patterns (common + TypeScript/Python/Go) |
| Agents | 13 | Specialized AI agents (planner, architect, code-reviewer, tdd-guide, etc.) |
| Skills | 43 | Agent skills for backend, frontend, security, TDD, and more |
| Commands | 31 | Slash commands for planning, reviewing, testing, and deployment |
| MCP Config | 1 | Pre-configured MCP servers (GitHub, Supabase, Vercel, Railway, etc.) |

## Agents

| Agent | Description | Mode |
|-------|-------------|------|
| planner | Expert planning specialist for complex features and refactoring | Read-only |
| architect | Software architecture specialist for system design and scalability | Read-only |
| code-reviewer | Code review for quality, security, and maintainability | Full access |
| tdd-guide | Test-driven development with 80%+ coverage enforcement | Full access |
| security-reviewer | Security vulnerability detection (OWASP Top 10) | Full access |
| build-error-resolver | Build and TypeScript error resolution | Full access |
| e2e-runner | End-to-end testing with Playwright | Full access |
| doc-updater | Documentation and codemap updates | Full access |
| refactor-cleaner | Dead code cleanup and consolidation | Full access |
| database-reviewer | PostgreSQL/Supabase database specialist | Full access |
| go-build-resolver | Go build error resolution | Full access |
| go-reviewer | Go code review specialist | Full access |
| python-reviewer | Python code review specialist | Full access |

## Installation

```bash
# Install the package
npm install ecc-universal

# Install Cursor configs for TypeScript projects
./install.sh --target cursor typescript

# Install for multiple languages
./install.sh --target cursor typescript python golang
```

## Rules Structure

- **Common rules** (always active): coding-style, security, testing, git-workflow, hooks, patterns, performance, agents
- **Language-specific rules** (activated by file type): TypeScript, Python, Go
- **Context rules** (manually activated): dev, research, review modes

## MCP Servers

The included `mcp.json` provides pre-configured MCP servers. Copy to your project's `.cursor/mcp.json` and set environment variables:

- `GITHUB_PERSONAL_ACCESS_TOKEN` — GitHub operations
- `FIRECRAWL_API_KEY` — Web scraping

## Further Reading

- [Migration Guide](MIGRATION.md) — Concept mapping from Claude Code to Cursor
- [Main README](../README.md) — Full documentation and guides
