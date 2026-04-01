---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-04-01

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
- `docs`
- `chore`

### Message Guidelines

- Average message length: ~57 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-or-update-skill.md)
```

*Commit message example*

```text
refactor: collapse legacy command bodies into skills
```

*Commit message example*

```text
fix: dedupe managed hooks by semantic identity
```

*Commit message example*

```text
docs: close bundle drift and sync plugin guidance
```

*Commit message example*

```text
chore: ignore local orchestration artifacts
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/refactoring.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/feature-development.md)
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

### Feature Development

Standard feature implementation workflow

**Frequency**: ~19 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `.opencode/*`
- `.opencode/plugins/*`
- `.opencode/plugins/lib/*`
- `**/*.test.*`

**Example commit sequence**:
```
feat: install claude-hud plugin (jarrodwatts/claude-hud) (#1041)
feat: add GAN-style generator-evaluator harness (#1029)
feat(agents,skills): add opensource-pipeline — 3-agent workflow for safe public releases (#1036)
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~2 times per month

**Steps**:
1. Ensure tests pass before refactor
2. Refactor code structure
3. Verify tests still pass

**Files typically involved**:
- `src/**/*`

**Example commit sequence**:
```
refactor: collapse legacy command bodies into skills
feat: add connected operator workflow skills
feat: add everything-claude-code ECC bundle (.claude/skills/everything-claude-code/SKILL.md)
```

### Add New Skill

Adds a new skill to the codebase, typically for agent workflows or capabilities.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
2. Optionally add supporting documentation or configuration in related directories

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create or update a SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
Optionally add supporting documentation or configuration in related directories
```

### Add Or Update Command

Adds or updates a command file, often for new CLI workflows, automation, or agentic tasks.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a command markdown file under commands/ or .claude/commands/
2. Optionally update references or documentation

**Files typically involved**:
- `commands/*.md`
- `.claude/commands/*.md`

**Example commit sequence**:
```
Create or update a command markdown file under commands/ or .claude/commands/
Optionally update references or documentation
```

### Add New Agent

Adds a new agent definition and registers it for orchestration or workflow use.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new agent definition file (e.g., agents/*.md or .opencode/prompts/agents/*.txt)
2. Update agent registry/configuration (e.g., .opencode/opencode.json, AGENTS.md)

**Files typically involved**:
- `agents/*.md`
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`
- `AGENTS.md`

**Example commit sequence**:
```
Create a new agent definition file (e.g., agents/*.md or .opencode/prompts/agents/*.txt)
Update agent registry/configuration (e.g., .opencode/opencode.json, AGENTS.md)
```

### Feature Bundle Or Ecc Bundle Addition

Adds a cohesive set of files for a new feature, workflow, or ECC bundle (often touching multiple .claude, .codex, or manifest files).

**Frequency**: ~2 times per month

**Steps**:
1. Add or update multiple files in .claude/, .codex/, .agents/, or manifests/
2. Update configuration files (e.g., team config, research playbook, rules, identity, ecc-tools.json)
3. Optionally add documentation or supporting files

**Files typically involved**:
- `.claude/commands/*.md`
- `.claude/team/*.json`
- `.claude/research/*.md`
- `.claude/rules/*.md`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.codex/agents/*.toml`
- `.agents/skills/*/SKILL.md`
- `manifests/*.json`

**Example commit sequence**:
```
Add or update multiple files in .claude/, .codex/, .agents/, or manifests/
Update configuration files (e.g., team config, research playbook, rules, identity, ecc-tools.json)
Optionally add documentation or supporting files
```

### Refactor Or Collapse Legacy Workflows

Refactors legacy commands or workflows, often collapsing them into skills or updating documentation and manifests.

**Frequency**: ~2 times per month

**Steps**:
1. Update or remove legacy command files (commands/*.md)
2. Update or create corresponding SKILL.md files
3. Update documentation (README.md, AGENTS.md, etc.)
4. Update manifests/install-modules.json as needed

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Update or remove legacy command files (commands/*.md)
Update or create corresponding SKILL.md files
Update documentation (README.md, AGENTS.md, etc.)
Update manifests/install-modules.json as needed
```

### Ci Or Github Actions Dependency Bump

Updates GitHub Actions workflow files to bump action versions or dependencies.

**Frequency**: ~2 times per month

**Steps**:
1. Update one or more .github/workflows/*.yml files to new action versions
2. Optionally update lockfiles or related config

**Files typically involved**:
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Update one or more .github/workflows/*.yml files to new action versions
Optionally update lockfiles or related config
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
