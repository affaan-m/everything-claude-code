---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-20

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

- `fix`
- `feat`
- `test`
- `docs`

### Message Guidelines

- Average message length: ~65 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-language-rules.md)
```

*Commit message example*

```text
chore(deps-dev): bump flatted (#675)
```

*Commit message example*

```text
fix: auto-detect ECC root from plugin cache when CLAUDE_PLUGIN_ROOT is unset (#547) (#691)
```

*Commit message example*

```text
docs: add Antigravity setup and usage guide (#552)
```

*Commit message example*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
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
- `**/schema.*`
- `migrations/*`

**Example commit sequence**:
```
feat: implement --with/--without selective install flags (#679)
fix: sync catalog counts with filesystem (27 agents, 113 skills, 58 commands) (#693)
feat(rules): add Rust language rules (rebased #660) (#686)
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~25 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `schemas/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
fix: refresh orchestration follow-up after #414 (#430)
feat: add C++ language support and hook tests (#539)
```

### Add New Language Rules

Adds support for a new programming language by introducing language-specific rule files for coding style, hooks, patterns, security, and testing.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new directory under rules/<language>/
2. Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md files with language-specific content
3. Optionally update documentation or catalog counts if needed

**Files typically involved**:
- `rules/<language>/coding-style.md`
- `rules/<language>/hooks.md`
- `rules/<language>/patterns.md`
- `rules/<language>/security.md`
- `rules/<language>/testing.md`

**Example commit sequence**:
```
Create a new directory under rules/<language>/
Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md files with language-specific content
Optionally update documentation or catalog counts if needed
```

### Add New Skill

Adds a new skill module, typically as a SKILL.md file (sometimes with scripts or supporting files), to enhance agent capabilities.

**Frequency**: ~4 times per month

**Steps**:
1. Create a new directory under skills/<skill-name>/
2. Add SKILL.md describing the skill's behavior, triggers, and usage
3. Optionally add scripts or supporting files under the skill directory
4. If Antigravity or Codex support is needed, add .agents/skills/<skill-name>/SKILL.md or openai.yaml

**Files typically involved**:
- `skills/<skill-name>/SKILL.md`
- `skills/<skill-name>/scripts/*.sh`
- `.agents/skills/<skill-name>/SKILL.md`
- `.agents/skills/<skill-name>/agents/openai.yaml`

**Example commit sequence**:
```
Create a new directory under skills/<skill-name>/
Add SKILL.md describing the skill's behavior, triggers, and usage
Optionally add scripts or supporting files under the skill directory
If Antigravity or Codex support is needed, add .agents/skills/<skill-name>/SKILL.md or openai.yaml
```

### Add New Agent

Adds a new agent definition to the system, typically for reviewing, resolving, or automating tasks in a specific domain.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new agent markdown file under agents/<agent-name>.md
2. Optionally update AGENTS.md and README.md to include the new agent in tables and documentation
3. If needed, add agent configuration files (e.g., openai.yaml) under .agents/skills/<agent-name>/agents/

**Files typically involved**:
- `agents/<agent-name>.md`
- `AGENTS.md`
- `README.md`
- `.agents/skills/<agent-name>/agents/openai.yaml`

**Example commit sequence**:
```
Create a new agent markdown file under agents/<agent-name>.md
Optionally update AGENTS.md and README.md to include the new agent in tables and documentation
If needed, add agent configuration files (e.g., openai.yaml) under .agents/skills/<agent-name>/agents/
```

### Sync Catalog Counts

Synchronizes documentation and catalog files to accurately reflect the current number of agents, skills, and commands.

**Frequency**: ~2 times per month

**Steps**:
1. Update agent, skill, and command counts in README.md and AGENTS.md
2. Optionally update related documentation tables or project structure sections

**Files typically involved**:
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Update agent, skill, and command counts in README.md and AGENTS.md
Optionally update related documentation tables or project structure sections
```

### Add New Command And Backing Skill

Introduces a new command (user-facing entry point) and its corresponding backing skill for implementation.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new command markdown file under commands/<command-name>.md
2. Create a new skill under skills/<skill-name>/SKILL.md (often matching the command name)
3. Optionally update documentation or catalog counts

**Files typically involved**:
- `commands/<command-name>.md`
- `skills/<skill-name>/SKILL.md`

**Example commit sequence**:
```
Create a new command markdown file under commands/<command-name>.md
Create a new skill under skills/<skill-name>/SKILL.md (often matching the command name)
Optionally update documentation or catalog counts
```

### Add Or Update Hook And Tests

Adds or updates a git or shell hook and provides corresponding automated tests to ensure correct behavior.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create hook configuration files (e.g., hooks/hooks.json, .cursor/hooks.json)
2. Add or update hook implementation scripts under scripts/hooks/
3. Add or update test files under tests/hooks/ to cover new or changed hook logic

**Files typically involved**:
- `hooks/hooks.json`
- `.cursor/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Edit or create hook configuration files (e.g., hooks/hooks.json, .cursor/hooks.json)
Add or update hook implementation scripts under scripts/hooks/
Add or update test files under tests/hooks/ to cover new or changed hook logic
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
