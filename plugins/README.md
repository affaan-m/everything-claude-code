# Plugins and Marketplaces

This repo is a Claude Code plugin marketplace. Each plugin bundles language-specific agents and skills together — install only what you need.

---

## This Repo as a Marketplace

Add this repo as a marketplace, then install individual language plugins:

```bash
# Add this repo as a marketplace
/plugin marketplace add YOUR_GITHUB/my-everything-claude-code

# Install only what you need
/plugin install java-dev@everything-claude-code
/plugin install python-dev@everything-claude-code
/plugin install go-dev@everything-claude-code
```

---

## Available Plugins

| Plugin | Agents | Skills |
|--------|--------|--------|
| `java-dev` | java-reviewer, java-build-resolver, kotlin-reviewer, kotlin-build-resolver | java-coding-standards, springboot-*, jpa-patterns, kotlin-*, android, compose |
| `python-dev` | python-reviewer | python-patterns, python-testing, django-* |
| `go-dev` | go-reviewer, go-build-resolver | golang-patterns, golang-testing |
| `rust-dev` | rust-reviewer, rust-build-resolver | rust-patterns, rust-testing |
| `cpp-dev` | cpp-reviewer, cpp-build-resolver | cpp-coding-standards, cpp-testing |
| `swift-dev` | — | swift-*, swiftui-patterns |
| `web-dev` | — | frontend-patterns, nextjs-turbopack, backend-patterns |
| `laravel-dev` | — | laravel-*, perl-* |

Each plugin's agents have their domain skills **pre-wired** — no manual configuration needed.

---

## Plugin Structure

```
plugins/
├── java-dev/
│   ├── .claude-plugin/plugin.json
│   ├── agents/          ← java-reviewer, build-resolver, kotlin-*
│   └── skills/          ← java-coding-standards, springboot-*, jpa-*, kotlin-*
├── python-dev/
│   ├── .claude-plugin/plugin.json
│   ├── agents/          ← python-reviewer
│   └── skills/          ← python-patterns, python-testing, django-*
└── ...
```

Skills inside plugins have `user-invocable: false` and `disable-model-invocation: true` — they are reference material for agents only, not slash commands.

---

## Third-Party Marketplaces

| Marketplace | Install |
|-------------|---------|
| Official Anthropic | `/plugin marketplace add anthropics/claude-plugins-official` |
| Community (mgrep) | `/plugin marketplace add mixedbread-ai/mgrep` |

---

## Plugin Files Location

```
~/.claude/plugins/
├── cache/                    # Downloaded plugins
├── known_marketplaces.json   # Added marketplaces
└── marketplaces/             # Marketplace data
```
