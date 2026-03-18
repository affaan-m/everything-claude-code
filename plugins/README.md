# Plugins and Marketplaces

Plugins extend Claude Code with new tools and capabilities. This guide covers installation only - see the [full article](https://x.com/affaanmustafa/status/2012378465664745795) for when and why to use them.

---

## Marketplaces

Marketplaces are repositories of installable plugins.

### Adding a Marketplace

```bash
# Add official Anthropic marketplace
claude plugin marketplace add https://github.com/anthropics/claude-plugins-official

# Add community marketplaces (mgrep by @mixedbread-ai)
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep
```

### Recommended Marketplaces

| Marketplace | Source |
|-------------|--------|
| claude-plugins-official | `anthropics/claude-plugins-official` |
| claude-code-plugins | `anthropics/claude-code` |
| Mixedbread-Grep (@mixedbread-ai) | `mixedbread-ai/mgrep` |
| AutoCode (@ilang-ai) | `ilang-ai/autocode` |

---

## Installing Plugins

```bash
# Open plugins browser
/plugins

# Or install directly
claude plugin install typescript-lsp@claude-plugins-official
```

### Recommended Plugins

**Development:**
- `typescript-lsp` - TypeScript intelligence
- `pyright-lsp` - Python type checking
- `hookify` - Create hooks conversationally
- `code-simplifier` - Refactor code

**Code Quality:**
- `code-review` - Code review
- `pr-review-toolkit` - PR automation
- `security-guidance` - Security checks

**Search:**
- `mgrep` - Enhanced search (better than ripgrep)
- `context7` - Live documentation lookup

**Workflow:**
- `commit-commands` - Git workflow
- `frontend-design` - UI patterns
- `feature-dev` - Feature development

**Non-Programmer / Auto-Coding:**
- `autocode` - Auto-activated skills for non-programmers with persistent memory and I-Lang compression. `ilang-ai/autocode`


---

## Quick Setup

```bash
# Add marketplaces
claude plugin marketplace add https://github.com/anthropics/claude-plugins-official
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# Open /plugins and install what you need
```

---

## Plugin Files Location

```
~/.claude/plugins/
|-- cache/                    # Downloaded plugins
|-- installed_plugins.json    # Installed list
|-- known_marketplaces.json   # Added marketplaces
|-- marketplaces/             # Marketplace data
```

