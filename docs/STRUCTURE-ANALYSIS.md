# Structure Analysis - everything-claude-code

## Overview

**everything-claude-code** is a Claude Code plugin — a comprehensive collection of production-ready agents, skills, hooks, commands, rules, and MCP configurations for software development workflows.

## Directory Structure

```
everything-claude-code/
├── agents/          (25 files)   Specialized subagents for delegation
├── skills/          (108 dirs)   Workflow definitions & domain knowledge
├── commands/        (60 files)   Slash commands invoked by users
├── hooks/           (2 files)    Trigger-based automations
├── rules/           (9 dirs)     Always-follow guidelines by language
├── scripts/         (20+ files)  Cross-platform Node.js utilities
├── tests/           (5 dirs)     Test suite (ci, hooks, integration, lib, scripts)
├── mcp-configs/     (1 file)     MCP server configurations
├── schemas/         (9 files)    JSON schemas for validation
├── manifests/       (3 files)    Install components, modules, profiles
├── contexts/        (3 files)    Context modes (dev, research, review)
├── examples/        (8 files)    Example CLAUDE.md files
├── docs/            (15+ files)  Architecture docs, release notes, i18n
├── plugins/         (1 file)     Plugin system (in development)
└── assets/                       Static assets
```

## Core Components

### Agents (25)

Specialized subagents organized by function:

| Category | Agents |
|----------|--------|
| **Code Review** | code-reviewer, cpp-reviewer, go-reviewer, java-reviewer, kotlin-reviewer, python-reviewer, rust-reviewer, database-reviewer, security-reviewer |
| **Build Resolution** | build-error-resolver, cpp-build-resolver, go-build-resolver, java-build-resolver, kotlin-build-resolver, rust-build-resolver |
| **Planning & Architecture** | architect, planner, chief-of-staff |
| **Workflow & Ops** | tdd-guide, e2e-runner, loop-operator, refactor-cleaner, doc-updater, docs-lookup, harness-optimizer |

Format: Markdown with YAML frontmatter (name, description, tools, model).

### Skills (108)

The largest component. Organized by domain:

| Domain | Skills |
|--------|--------|
| **Languages/Frameworks** | python-patterns, rust-patterns, kotlin-patterns, golang-patterns, swift-*, cpp-*, perl-*, django-*, laravel-*, springboot-*, compose-multiplatform-patterns |
| **Testing** | tdd-workflow, e2e-testing, ai-regression-testing, python-testing, rust-testing, kotlin-testing, cpp-testing, perl-testing, golang-testing |
| **Security** | security-scan, security-review, django-security, laravel-security, springboot-security, perl-security |
| **DevOps** | docker-patterns, deployment-patterns, autonomous-loops, continuous-agent-loop, dmux-workflows |
| **AI/LLM** | claude-api, cost-aware-llm-pipeline, foundation-models-on-device, prompt-optimizer, eval-harness |
| **Database** | postgres-patterns, database-migrations, jpa-patterns, clickhouse-io |
| **Frontend** | frontend-patterns, frontend-slides, liquid-glass-design, nextjs-turbopack, swiftui-patterns |
| **Business/Domain** | logistics-exception-management, customs-trade-compliance, energy-procurement, investor-materials, market-research, production-scheduling, quality-nonconformance, returns-reverse-logistics, carrier-relationship-management, inventory-demand-planning |
| **Content** | article-writing, content-engine, crosspost, video-editing, videodb, visa-doc-translate |
| **Meta/Tooling** | skill-stocktake, configure-ecc, strategic-compact, search-first, blueprint, team-builder |

Format: Markdown with clear sections (When to Use, How It Works, Examples).

### Commands (60)

Slash commands grouped by function:

| Category | Commands |
|----------|----------|
| **Development** | /tdd, /plan, /code-review, /build-fix, /e2e, /verify |
| **Language-specific** | /cpp-build, /cpp-review, /cpp-test, /go-*, /kotlin-*, /rust-*, /python-review |
| **Session Management** | /save-session, /resume-session, /sessions, /checkpoint |
| **Multi-agent** | /multi-plan, /multi-execute, /multi-frontend, /multi-backend, /multi-workflow, /orchestrate |
| **Learning** | /learn, /learn-eval, /evolve, /instinct-* |
| **Quality** | /quality-gate, /test-coverage, /skill-health, /harness-audit |
| **Utilities** | /aside, /claw, /devfleet, /docs, /projects, /pm2, /setup-pm, /model-route, /prompt-optimize, /loop-start, /loop-status, /promote, /update-codemaps, /update-docs, /skill-create |

Format: Markdown with description frontmatter.

### Rules (9 language categories)

```
rules/
├── common/       Cross-language guidelines
├── typescript/   TypeScript-specific rules
├── python/       Python-specific rules
├── golang/       Go-specific rules
├── kotlin/       Kotlin-specific rules
├── cpp/          C++-specific rules
├── perl/         Perl-specific rules
├── php/          PHP-specific rules
└── swift/        Swift-specific rules
```

### Schemas (9)

JSON Schema definitions for validation:
- `hooks.schema.json` - Hook configuration format
- `plugin.schema.json` - Plugin manifest format
- `package-manager.schema.json` - Package manager detection
- `ecc-install-config.schema.json` - ECC install config
- `install-components.schema.json` - Component definitions
- `install-modules.schema.json` - Module definitions
- `install-profiles.schema.json` - Installation profiles
- `install-state.schema.json` - Install state tracking
- `state-store.schema.json` - State storage format

### Scripts

Key utilities:
- `ecc.js` - Main CLI entry point
- `claw.js` - Claw command implementation
- `orchestrate-worktrees.js` - Multi-agent git worktree orchestration
- `hooks/` - Hook execution scripts
- `codemaps/` - Code map generation
- `ci/` - CI/CD utilities
- `lib/` - Shared utilities (package manager detection, etc.)

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js project config & dependencies |
| `eslint.config.js` | Linting rules |
| `commitlint.config.js` | Commit message format |
| `.prettierrc` | Code formatting |
| `install.sh` / `install.ps1` | Cross-platform installers |
| `VERSION` | Version tracking |
| `.env.example` | Environment variable template |

### Documentation

- `README.md` / `README.zh-CN.md` - Main documentation (EN/CN)
- `CONTRIBUTING.md` - Contribution guidelines
- `TROUBLESHOOTING.md` - Common issues & fixes
- `the-longform-guide.md` - Comprehensive usage guide
- `the-shortform-guide.md` - Quick reference guide
- `the-openclaw-guide.md` - OpenClaw guide
- `the-security-guide.md` - Security best practices
- `docs/` - Architecture docs with i18n (ja-JP, ko-KR, zh-CN, zh-TW)

## Key Observations

1. **Scale**: 108 skills + 25 agents + 60 commands = rich, mature ecosystem
2. **Multi-language**: Full support for Python, Rust, Go, Kotlin, Swift, C++, Perl, PHP, TypeScript, Java
3. **Modular design**: Each component is a standalone Markdown file, easy to add/remove
4. **Selective install**: Schemas + manifests + profiles support customized installations
5. **Multi-agent orchestration**: Commands like /multi-plan, /orchestrate, worktree-based parallel execution
6. **I18n**: Documentation in English, Chinese (simplified + traditional), Japanese, Korean
7. **Cross-platform**: Node.js scripts for Windows, macOS, Linux compatibility
8. **Business domains**: Extends beyond pure development into logistics, finance, compliance, content
