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
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-agent-or-skill.md)
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

Adds a new skill or updates an existing skill in the agents or skills directory, including documentation and registration in manifests.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
2. Optionally add or update reference files (e.g., schemas, assets) in the skill directory
3. Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
4. Update AGENTS.md, README.md, and docs/zh-CN/AGENTS.md for documentation
5. If relevant, update WORKING-CONTEXT.md

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`
- `AGENTS.md`
- `README.md`
- `docs/zh-CN/AGENTS.md`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
Optionally add or update reference files (e.g., schemas, assets) in the skill directory
Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
Update AGENTS.md, README.md, and docs/zh-CN/AGENTS.md for documentation
If relevant, update WORKING-CONTEXT.md
```

### Add Or Update Command Workflow

Adds or updates a command workflow for agentic or PRP flows, including command markdown files and related documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update command markdown file in commands/ (e.g., prp-*.md, code-review.md, plan.md)
2. If new, ensure YAML frontmatter and phase/table structure
3. Update documentation as needed (README.md, AGENTS.md, etc.)
4. Address review feedback for command correctness and integration

**Files typically involved**:
- `commands/*.md`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create or update command markdown file in commands/ (e.g., prp-*.md, code-review.md, plan.md)
If new, ensure YAML frontmatter and phase/table structure
Update documentation as needed (README.md, AGENTS.md, etc.)
Address review feedback for command correctness and integration
```

### Refactor Or Extract Skill Logic

Refactors existing code to extract or merge skill logic, update documentation, and synchronize manifests.

**Frequency**: ~2 times per month

**Steps**:
1. Modify multiple SKILL.md files in skills/ to move or merge logic
2. Update manifests/install-modules.json to reflect changes
3. Update AGENTS.md, README.md, and docs/zh-CN/AGENTS.md for documentation
4. Update WORKING-CONTEXT.md if context or process changes

**Files typically involved**:
- `skills/*/SKILL.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`
- `docs/zh-CN/AGENTS.md`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Modify multiple SKILL.md files in skills/ to move or merge logic
Update manifests/install-modules.json to reflect changes
Update AGENTS.md, README.md, and docs/zh-CN/AGENTS.md for documentation
Update WORKING-CONTEXT.md if context or process changes
```

### Add Install Target Or Adapter

Adds a new install target (integration with external tool/platform) with scripts, schema updates, and manifest registration.

**Frequency**: ~2 times per month

**Steps**:
1. Create new directory for the install target (e.g., .codebuddy/, .gemini/)
2. Add README(s), install/uninstall scripts
3. Update schemas/ecc-install-config.schema.json and/or schemas/install-modules.schema.json
4. Update manifests/install-modules.json
5. Add or update scripts/lib/install-targets/<target>.js
6. Update tests/lib/install-targets.test.js

**Files typically involved**:
- `.<target>/*`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `manifests/install-modules.json`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Create new directory for the install target (e.g., .codebuddy/, .gemini/)
Add README(s), install/uninstall scripts
Update schemas/ecc-install-config.schema.json and/or schemas/install-modules.schema.json
Update manifests/install-modules.json
Add or update scripts/lib/install-targets/<target>.js
Update tests/lib/install-targets.test.js
```

### Sync Or Harden Installation And Codex

Synchronizes or hardens installation scripts, codex configs, and related test coverage.

**Frequency**: ~2 times per month

**Steps**:
1. Update scripts/lib/install/*.js and/or scripts/sync-ecc-to-codex.sh
2. Update WORKING-CONTEXT.md and package.json as needed
3. Update or add tests for install/apply and sync scripts
4. Update manifests/install-modules.json if install targets are affected

**Files typically involved**:
- `scripts/lib/install/*.js`
- `scripts/sync-ecc-to-codex.sh`
- `WORKING-CONTEXT.md`
- `package.json`
- `tests/scripts/*.test.js`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Update scripts/lib/install/*.js and/or scripts/sync-ecc-to-codex.sh
Update WORKING-CONTEXT.md and package.json as needed
Update or add tests for install/apply and sync scripts
Update manifests/install-modules.json if install targets are affected
```

### Update Or Add Hooks And Hook Tests

Adds or updates hooks (automation scripts), their configuration, and related tests for CI or agent workflows.

**Frequency**: ~2 times per month

**Steps**:
1. Update hooks/hooks.json to configure new or changed hooks
2. Add or update scripts/hooks/*.js for hook logic
3. Update or add tests in tests/hooks/*.test.js
4. If relevant, update .cursor/hooks/ for editor integration

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `.cursor/hooks/*.js`

**Example commit sequence**:
```
Update hooks/hooks.json to configure new or changed hooks
Add or update scripts/hooks/*.js for hook logic
Update or add tests in tests/hooks/*.test.js
If relevant, update .cursor/hooks/ for editor integration
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
