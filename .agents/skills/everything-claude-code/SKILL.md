---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-04-02

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
refactor: extract social graph ranking core
```

*Commit message example*

```text
fix: port safe ci cleanup from backlog
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
- `**/api/**`

**Example commit sequence**:
```
feat(install): add CodeBuddy(Tencent) adaptation with installation scripts (#1038)
chore(deps-dev): bump c8 from 10.1.3 to 11.0.0 (#1065)
chore(deps): bump actions/checkout from 4.3.1 to 6.0.2 (#1060)
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~4 times per month

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
feat: expand lead intelligence outreach channels
```

### Add Or Update Skill

Adds a new skill or updates an existing skill, including documentation and registration in manifests.

**Frequency**: ~3 times per month

**Steps**:
1. Create or modify SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
2. Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
3. Update AGENTS.md, README.md, and docs/zh-CN/AGENTS.md for documentation and agent tables
4. Optionally add or update reference files or assets under the skill directory

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`
- `AGENTS.md`
- `README.md`
- `docs/zh-CN/AGENTS.md`

**Example commit sequence**:
```
Create or modify SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
Update AGENTS.md, README.md, and docs/zh-CN/AGENTS.md for documentation and agent tables
Optionally add or update reference files or assets under the skill directory
```

### Add Or Update Command

Adds or updates a workflow command for the Claude agentic system.

**Frequency**: ~2 times per month

**Steps**:
1. Create or modify a markdown file in commands/ or .claude/commands/
2. Document the workflow, arguments, and usage
3. Optionally update related documentation (README.md, AGENTS.md, etc.)

**Files typically involved**:
- `commands/*.md`
- `.claude/commands/*.md`

**Example commit sequence**:
```
Create or modify a markdown file in commands/ or .claude/commands/
Document the workflow, arguments, and usage
Optionally update related documentation (README.md, AGENTS.md, etc.)
```

### Refactor Skill Or Agent Logic

Refactors core logic or merges/splits skills, updating documentation and manifests accordingly.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or move SKILL.md files in skills/ or .agents/skills/
2. Update manifests/install-modules.json and/or manifests/install-components.json
3. Update documentation files (AGENTS.md, README.md, docs/zh-CN/AGENTS.md, etc.)

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`
- `AGENTS.md`
- `README.md`
- `docs/zh-CN/AGENTS.md`

**Example commit sequence**:
```
Edit or move SKILL.md files in skills/ or .agents/skills/
Update manifests/install-modules.json and/or manifests/install-components.json
Update documentation files (AGENTS.md, README.md, docs/zh-CN/AGENTS.md, etc.)
```

### Add Or Update Install Target

Adds or updates an install target (e.g., Gemini, CodeBuddy) including scripts, schemas, and registration.

**Frequency**: ~2 times per month

**Steps**:
1. Add new directory and scripts under .<target>/ (e.g., .gemini/, .codebuddy/)
2. Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
3. Add or update scripts/lib/install-targets/<target>-project.js and registry.js
4. Update or add tests for install targets

**Files typically involved**:
- `.<target>/*`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/<target>-project.js`
- `scripts/lib/install-targets/registry.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add new directory and scripts under .<target>/ (e.g., .gemini/, .codebuddy/)
Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
Add or update scripts/lib/install-targets/<target>-project.js and registry.js
Update or add tests for install targets
```

### Documentation Sync And Update

Synchronizes and updates documentation across multiple files and languages.

**Frequency**: ~3 times per month

**Steps**:
1. Edit AGENTS.md, README.md, README.zh-CN.md, WORKING-CONTEXT.md
2. Edit docs/zh-CN/AGENTS.md, docs/zh-CN/README.md
3. Optionally update .agents/skills/*/SKILL.md and related documentation

**Files typically involved**:
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `WORKING-CONTEXT.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`

**Example commit sequence**:
```
Edit AGENTS.md, README.md, README.zh-CN.md, WORKING-CONTEXT.md
Edit docs/zh-CN/AGENTS.md, docs/zh-CN/README.md
Optionally update .agents/skills/*/SKILL.md and related documentation
```

### Update Or Add Hooks And Ci

Updates or adds new hooks, CI scripts, and related tests for code quality and automation.

**Frequency**: ~2 times per month

**Steps**:
1. Edit hooks/hooks.json and/or scripts/hooks/*.js
2. Update or add tests in tests/hooks/*.test.js or tests/scripts/*.test.js
3. Update CI workflow files in .github/workflows/

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `tests/scripts/*.test.js`
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Edit hooks/hooks.json and/or scripts/hooks/*.js
Update or add tests in tests/hooks/*.test.js or tests/scripts/*.test.js
Update CI workflow files in .github/workflows/
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
