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

- Average message length: ~56 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat(skills): add argus-design-review — three-tier design doc review
```

*Commit message example*

```text
fix(tests): add USERPROFILE to repair.test.js for Windows
```

*Commit message example*

```text
refactor: collapse legacy command bodies into skills
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
fix(lint): add missing trailing newlines to remotion rules
```

*Commit message example*

```text
fix(tests): normalize path separators in CLAUDE_PLUGIN_ROOT test
```

*Commit message example*

```text
fix(ci): resolve markdownlint errors and Windows install-apply test
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

**Frequency**: ~16 times per month

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
feat(team-builder): use `claude agents` command for agent discovery (#1021)
fix: extract inline SessionStart bootstrap to separate file (#1035)
feat: add hexagonal architecture SKILL. (#1034)
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
feat: expand lead intelligence outreach channels
```

### Add New Skill

Adds a new skill to the system, including documentation and registration in summary/index files.

**Frequency**: ~6 times per month

**Steps**:
1. Create a new SKILL.md file under skills/{skill-name}/
2. Optionally add reference files or assets under skills/{skill-name}/references/ or assets/
3. Update AGENTS.md and README.md to document the new skill
4. Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for Chinese documentation
5. Optionally update manifests/install-components.json or install-modules.json if the skill is installable

**Files typically involved**:
- `skills/*/SKILL.md`
- `skills/*/references/*.md`
- `skills/*/assets/*`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`
- `manifests/install-components.json`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Create a new SKILL.md file under skills/{skill-name}/
Optionally add reference files or assets under skills/{skill-name}/references/ or assets/
Update AGENTS.md and README.md to document the new skill
Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for Chinese documentation
Optionally update manifests/install-components.json or install-modules.json if the skill is installable
```

### Add Or Update Command Workflow

Adds or updates a command file describing a workflow, often for agent orchestration or developer automation.

**Frequency**: ~3 times per month

**Steps**:
1. Create or modify a Markdown file under commands/ (e.g., commands/prp-*.md, commands/gan-*.md, commands/santa-loop.md)
2. Document the workflow with YAML frontmatter, usage, and output sections
3. Optionally update AGENTS.md, README.md, or other summary files if the command is significant
4. Address review feedback and iterate on the command file

**Files typically involved**:
- `commands/*.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or modify a Markdown file under commands/ (e.g., commands/prp-*.md, commands/gan-*.md, commands/santa-loop.md)
Document the workflow with YAML frontmatter, usage, and output sections
Optionally update AGENTS.md, README.md, or other summary files if the command is significant
Address review feedback and iterate on the command file
```

### Add Or Update Agent Definition

Adds or updates agent definition files to introduce or modify agent behaviors or roles.

**Frequency**: ~2 times per month

**Steps**:
1. Create or modify agent definition Markdown files under agents/
2. Optionally update AGENTS.md to reflect new or changed agents
3. Update skills or commands that reference the agent if necessary

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create or modify agent definition Markdown files under agents/
Optionally update AGENTS.md to reflect new or changed agents
Update skills or commands that reference the agent if necessary
```

### Add Install Target Or Adapter

Adds a new install target (integration with external tools/platforms) including schema, scripts, and tests.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new directory under .{target}/ with README and install/uninstall scripts
2. Add or update scripts/lib/install-targets/{target}-project.js
3. Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
4. Update registry.js and install-manifests.js as needed
5. Add or update tests for the new install target

**Files typically involved**:
- `.*/README.md`
- `.*/install.*`
- `.*/uninstall.*`
- `scripts/lib/install-targets/*.js`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/registry.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Create a new directory under .{target}/ with README and install/uninstall scripts
Add or update scripts/lib/install-targets/{target}-project.js
Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
Update registry.js and install-manifests.js as needed
Add or update tests for the new install target
```

### Test Fix Or Portability Fix

Fixes or improves test scripts, especially for cross-platform (Windows/Linux) compatibility.

**Frequency**: ~3 times per month

**Steps**:
1. Edit test files under tests/scripts/ or tests/lib/
2. Normalize environment variables or path separators for Windows compatibility
3. Update related implementation files if needed (e.g., scripts/lib/install/apply.js)
4. Commit with a fix(tests): or fix(ci): message

**Files typically involved**:
- `tests/scripts/*.test.js`
- `tests/lib/*.test.js`
- `scripts/lib/install/*.js`
- `scripts/lib/install-manifests.js`

**Example commit sequence**:
```
Edit test files under tests/scripts/ or tests/lib/
Normalize environment variables or path separators for Windows compatibility
Update related implementation files if needed (e.g., scripts/lib/install/apply.js)
Commit with a fix(tests): or fix(ci): message
```

### Update Repo Documentation And Guidance

Updates documentation files to reflect new workflows, skills, or repo guidance.

**Frequency**: ~4 times per month

**Steps**:
1. Edit README.md, README.zh-CN.md, WORKING-CONTEXT.md, AGENTS.md, or the-shortform-guide.md
2. Edit docs/zh-CN/* as needed for Chinese documentation
3. Optionally update .claude-plugin/README.md, .codex-plugin/README.md, or related plugin docs

**Files typically involved**:
- `README.md`
- `README.zh-CN.md`
- `WORKING-CONTEXT.md`
- `AGENTS.md`
- `the-shortform-guide.md`
- `docs/zh-CN/*.md`
- `.claude-plugin/README.md`
- `.codex-plugin/README.md`

**Example commit sequence**:
```
Edit README.md, README.zh-CN.md, WORKING-CONTEXT.md, AGENTS.md, or the-shortform-guide.md
Edit docs/zh-CN/* as needed for Chinese documentation
Optionally update .claude-plugin/README.md, .codex-plugin/README.md, or related plugin docs
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
