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

Adds a new skill to the repository, typically as a modular agent capability or workflow.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new SKILL.md file in skills/ or .agents/skills/ or .claude/skills/
2. Document the skill's purpose, usage, and configuration
3. Optionally, add supporting files (rules, scripts, etc.) in the skill's directory

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new SKILL.md file in skills/ or .agents/skills/ or .claude/skills/
Document the skill's purpose, usage, and configuration
Optionally, add supporting files (rules, scripts, etc.) in the skill's directory
```

### Add Or Update Command

Adds or updates a command file that defines a workflow, automation, or agent instruction.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a .md file in commands/ or .claude/commands/
2. Document the command's phases, arguments, and outputs
3. Optionally, update related documentation or index files

**Files typically involved**:
- `commands/*.md`
- `.claude/commands/*.md`

**Example commit sequence**:
```
Create or update a .md file in commands/ or .claude/commands/
Document the command's phases, arguments, and outputs
Optionally, update related documentation or index files
```

### Add New Agent

Adds a new agent definition or prompt for OpenCode, Claude, or other agentic systems.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new agent definition file (e.g., .md or .toml) in agents/ or .codex/agents/ or .opencode/prompts/agents/
2. Register the agent in the appropriate index/config file (e.g., opencode.json)
3. Optionally, update AGENTS.md or related documentation

**Files typically involved**:
- `agents/*.md`
- `.codex/agents/*.toml`
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`
- `AGENTS.md`

**Example commit sequence**:
```
Create a new agent definition file (e.g., .md or .toml) in agents/ or .codex/agents/ or .opencode/prompts/agents/
Register the agent in the appropriate index/config file (e.g., opencode.json)
Optionally, update AGENTS.md or related documentation
```

### Feature Bundle Or Ecc Bundle Drop

Drops a bundle of related configuration, skill, agent, or command files as a feature or ECC bundle.

**Frequency**: ~2 times per month

**Steps**:
1. Add multiple files in .claude/, .codex/, .agents/, .claude/skills/, .claude/commands/, etc.
2. Ensure files are grouped by function (commands, skills, team config, research playbook, guardrails, etc.)
3. Commit with a message referencing 'ECC bundle' or similar

**Files typically involved**:
- `.claude/commands/*.md`
- `.claude/skills/*/SKILL.md`
- `.claude/team/*.json`
- `.claude/research/*.md`
- `.claude/rules/*.md`
- `.codex/agents/*.toml`
- `.agents/skills/*/SKILL.md`
- `.claude/identity.json`
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Add multiple files in .claude/, .codex/, .agents/, .claude/skills/, .claude/commands/, etc.
Ensure files are grouped by function (commands, skills, team config, research playbook, guardrails, etc.)
Commit with a message referencing 'ECC bundle' or similar
```

### Add Or Update Install Target

Adds or updates an install target (integration with external tool or platform) including scripts and schema updates.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update install scripts (e.g., install.sh, install.js, uninstall.sh, uninstall.js) in a dedicated directory
2. Update manifests/install-modules.json and related schemas
3. Update scripts/lib/install-manifests.js and/or scripts/lib/install-targets/*.js
4. Add or update tests for install targets

**Files typically involved**:
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`
- `.*/install.sh`
- `.*/install.js`
- `.*/uninstall.sh`
- `.*/uninstall.js`

**Example commit sequence**:
```
Add or update install scripts (e.g., install.sh, install.js, uninstall.sh, uninstall.js) in a dedicated directory
Update manifests/install-modules.json and related schemas
Update scripts/lib/install-manifests.js and/or scripts/lib/install-targets/*.js
Add or update tests for install targets
```

### Documentation Update Or Sync

Updates or synchronizes documentation files, often across multiple languages or contexts.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add markdown files in docs/, README.md, AGENTS.md, WORKING-CONTEXT.md, etc.
2. Optionally, update localized docs (docs/zh-CN/...)
3. Update package.json or scripts if documentation impacts tooling

**Files typically involved**:
- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/**/*.md`
- `package.json`

**Example commit sequence**:
```
Edit or add markdown files in docs/, README.md, AGENTS.md, WORKING-CONTEXT.md, etc.
Optionally, update localized docs (docs/zh-CN/...)
Update package.json or scripts if documentation impacts tooling
```

### Refactor Or Collapse Legacy Commands

Refactors legacy command files into new skill-based structures or collapses redundant files.

**Frequency**: ~2 times per month

**Steps**:
1. Edit multiple command .md files and related documentation
2. Update or create new SKILL.md files in skills/
3. Update manifests or scripts as needed

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Edit multiple command .md files and related documentation
Update or create new SKILL.md files in skills/
Update manifests or scripts as needed
```

### Dependency Or Ci Update

Updates dependencies or CI/CD workflow files, often via automated bots.

**Frequency**: ~2 times per month

**Steps**:
1. Edit package.json, yarn.lock, or other lockfiles
2. Update .github/workflows/*.yml files
3. Commit with a message referencing dependency or workflow update

**Files typically involved**:
- `package.json`
- `yarn.lock`
- `package-lock.json`
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Edit package.json, yarn.lock, or other lockfiles
Update .github/workflows/*.yml files
Commit with a message referencing dependency or workflow update
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
