---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-24

## Overview

This skill teaches Claude the development patterns and conventions used in everything-claude-code.

## Tech Stack

- **Primary Language**: JavaScript
- **Architecture**: hybrid module organization
- **Test Location**: separate

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 500 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `fix`
- `docs`
- `test`

### Message Guidelines

- Average message length: ~62 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-or-update-skill.md)
```

*Commit message example*

```text
perf(hooks): move post-edit-format and post-edit-typecheck to strict-only (#757)
```

*Commit message example*

```text
fix: safe Codex config sync — merge AGENTS.md + add-only MCP servers (#723)
```

*Commit message example*

```text
docs(zh-CN): translate code block(plain text) (#753)
```

*Commit message example*

```text
security: remove supply chain risks, external promotions, and unauthorized credits
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/database-migration.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/enterprise/controls.md)
```

## Architecture

### Project Structure: Single Package

This project uses **hybrid** module organization.

### Configuration Files

- `.github/workflows/ci.yml`
- `.github/workflows/maintenance.yml`
- `.github/workflows/monthly-metrics.yml`
- `.github/workflows/release.yml`
- `.github/workflows/reusable-release.yml`
- `.github/workflows/reusable-test.yml`
- `.github/workflows/reusable-validate.yml`
- `.opencode/package.json`
- `.opencode/tsconfig.json`
- `.prettierrc`
- `eslint.config.js`
- `package.json`

### Guidelines

- This project uses a hybrid organization
- Follow existing patterns when adding new code

## Code Style

### Language: JavaScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Relative Imports

### Export Style: Mixed Style


*Preferred import style*

```typescript
// Use relative imports
import { Button } from '../components/Button'
import { useAuth } from './hooks/useAuth'
```

## Testing

### Test Framework

No specific test framework detected — use the repository's existing test patterns.

### File Pattern: `*.test.js`

### Test Types

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between multiple components/services

### Coverage

This project has coverage reporting configured. Aim for 80%+ coverage.


## Error Handling

### Error Handling Style: Try-Catch Blocks


*Standard error handling pattern*

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('User-friendly message')
}
```

## Common Workflows

These workflows were detected from analyzing commit patterns.

### Database Migration

Database schema changes with migration files

**Frequency**: ~2 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `migrations/*`

**Example commit sequence**:
```
Add Turkish (tr) docs and update README (#744)
docs(zh-CN): translate code block(plain text) (#753)
fix(install): add rust, cpp, csharp to legacy language alias map (#747)
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~26 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
Merge pull request #736 from pvgomes/docs/add-brazilian-portuguese-translation
fix: bump plugin.json and marketplace.json to v1.9.0
Add Turkish (tr) docs and update README (#744)
```

### Add Or Update Skill

Adds or updates a skill in the ECC system, including documentation and provenance.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update SKILL.md in the appropriate skills directory (e.g., skills/{skill-name}/SKILL.md or .claude/skills/{skill-name}/SKILL.md)
2. Optionally add or update agent YAML files (e.g., .agents/skills/{skill-name}/agents/*.yaml)
3. Optionally update provenance or placement policy files (e.g., schemas/provenance.schema.json, docs/SKILL-PLACEMENT-POLICY.md)

**Files typically involved**:
- `skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/*.yaml`
- `schemas/provenance.schema.json`
- `docs/SKILL-PLACEMENT-POLICY.md`

**Example commit sequence**:
```
Create or update SKILL.md in the appropriate skills directory (e.g., skills/{skill-name}/SKILL.md or .claude/skills/{skill-name}/SKILL.md)
Optionally add or update agent YAML files (e.g., .agents/skills/{skill-name}/agents/*.yaml)
Optionally update provenance or placement policy files (e.g., schemas/provenance.schema.json, docs/SKILL-PLACEMENT-POLICY.md)
```

### Add Or Update Command Documentation

Adds or updates documentation for a command, often as part of a new feature or workflow.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .claude/commands/{command-name}.md
2. Optionally update localized docs (e.g., docs/zh-CN/commands/{command-name}.md, docs/tr/commands/{command-name}.md, docs/pt-BR/commands/{command-name}.md)

**Files typically involved**:
- `.claude/commands/*.md`
- `docs/zh-CN/commands/*.md`
- `docs/tr/commands/*.md`
- `docs/pt-BR/commands/*.md`

**Example commit sequence**:
```
Create or update .claude/commands/{command-name}.md
Optionally update localized docs (e.g., docs/zh-CN/commands/{command-name}.md, docs/tr/commands/{command-name}.md, docs/pt-BR/commands/{command-name}.md)
```

### Add Or Update Localized Documentation

Adds or updates documentation in a new or existing language (localization).

**Frequency**: ~2 times per month

**Steps**:
1. Add or update files in docs/{locale}/ (where locale is zh-CN, tr, pt-BR, etc.)
2. Update README.md to reflect new language support

**Files typically involved**:
- `docs/zh-CN/**/*`
- `docs/tr/**/*`
- `docs/pt-BR/**/*`
- `README.md`

**Example commit sequence**:
```
Add or update files in docs/{locale}/ (where locale is zh-CN, tr, pt-BR, etc.)
Update README.md to reflect new language support
```

### Update Or Add Hooks

Adds or updates hooks for validation, config protection, or workflow automation.

**Frequency**: ~2 times per month

**Steps**:
1. Edit hooks/hooks.json to add or update hook definitions
2. Create or update scripts/hooks/*.js or .ts for hook logic
3. Optionally update plugin files (e.g., .opencode/plugins/ecc-hooks.ts)

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `.opencode/plugins/*.ts`

**Example commit sequence**:
```
Edit hooks/hooks.json to add or update hook definitions
Create or update scripts/hooks/*.js or .ts for hook logic
Optionally update plugin files (e.g., .opencode/plugins/ecc-hooks.ts)
```

### Add Or Update Ecc Bundle

Adds or updates a set of ECC configuration, command, or skill files as a bundle.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update files in .claude/ (commands, skills, rules, team, identity, etc.)
2. Optionally update .codex/agents/*.toml and .agents/skills/*
3. Repeat for each bundle component as needed

**Files typically involved**:
- `.claude/commands/*.md`
- `.claude/skills/*/SKILL.md`
- `.claude/rules/*.md`
- `.claude/team/*.json`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.codex/agents/*.toml`
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/*.yaml`

**Example commit sequence**:
```
Create or update files in .claude/ (commands, skills, rules, team, identity, etc.)
Optionally update .codex/agents/*.toml and .agents/skills/*
Repeat for each bundle component as needed
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Follow *.test.js naming pattern
- Use camelCase for file names
- Prefer mixed exports

### Don't

- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
