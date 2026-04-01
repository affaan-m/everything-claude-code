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
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill.md)
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
feat: expand lead intelligence outreach channels
```

### Add New Skill

Adds a new skill to the project, typically as a modular capability for agents or workflows.

**Frequency**: ~4 times per month

**Steps**:
1. Create a new SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
2. Document the skill's purpose, usage, and configuration in SKILL.md
3. Optionally update documentation or manifests if the skill is part of a larger workflow

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
Document the skill's purpose, usage, and configuration in SKILL.md
Optionally update documentation or manifests if the skill is part of a larger workflow
```

### Add Or Update Command

Adds or updates a command file to define new CLI or agentic workflows.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update a markdown file in commands/ (e.g., prp-implement.md, code-review.md)
2. Document the command's phases, arguments, and usage
3. Optionally update related documentation or reference files

**Files typically involved**:
- `commands/*.md`

**Example commit sequence**:
```
Create or update a markdown file in commands/ (e.g., prp-implement.md, code-review.md)
Document the command's phases, arguments, and usage
Optionally update related documentation or reference files
```

### Add Or Update Agent

Adds or updates an agent definition, expanding the system's agentic capabilities.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update agent markdown files in agents/
2. Optionally update agent registration files (e.g., .opencode/opencode.json)
3. Document the agent's role and configuration

**Files typically involved**:
- `agents/*.md`
- `.opencode/opencode.json`

**Example commit sequence**:
```
Create or update agent markdown files in agents/
Optionally update agent registration files (e.g., .opencode/opencode.json)
Document the agent's role and configuration
```

### Add Install Target

Adds support for a new install target (e.g., new IDE or platform integration).

**Frequency**: ~2 times per month

**Steps**:
1. Create install scripts and documentation under a new dot-directory (e.g., .codebuddy/, .gemini/)
2. Add or update install target logic in scripts/lib/install-targets/
3. Update manifests/install-modules.json and relevant schemas
4. Add or update tests for the new install target

**Files typically involved**:
- `.*/install.*`
- `.*/README*`
- `scripts/lib/install-targets/*.js`
- `manifests/install-modules.json`
- `schemas/*.schema.json`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Create install scripts and documentation under a new dot-directory (e.g., .codebuddy/, .gemini/)
Add or update install target logic in scripts/lib/install-targets/
Update manifests/install-modules.json and relevant schemas
Add or update tests for the new install target
```

### Feature Bundle Or Ecc Bundle

Adds a cohesive set of files representing a new feature, workflow, or documentation bundle (often labeled ECC bundle).

**Frequency**: ~2 times per month

**Steps**:
1. Add multiple related files (commands, skills, agents, docs, configs) in a single commit
2. Organize files under relevant directories (e.g., .claude/commands/, .claude/skills/, .codex/agents/)
3. Optionally update manifests or team configs

**Files typically involved**:
- `.claude/commands/*.md`
- `.claude/skills/*.md`
- `.codex/agents/*.toml`
- `.claude/team/*.json`
- `.claude/rules/*.md`

**Example commit sequence**:
```
Add multiple related files (commands, skills, agents, docs, configs) in a single commit
Organize files under relevant directories (e.g., .claude/commands/, .claude/skills/, .codex/agents/)
Optionally update manifests or team configs
```

### Refactor Commands To Skills

Migrates or collapses legacy command files into new skill definitions, modernizing the workflow structure.

**Frequency**: ~2 times per month

**Steps**:
1. Remove or update legacy command files in commands/
2. Add or update corresponding SKILL.md files in skills/
3. Update documentation to reference new skills instead of commands
4. Update manifests if necessary

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Remove or update legacy command files in commands/
Add or update corresponding SKILL.md files in skills/
Update documentation to reference new skills instead of commands
Update manifests if necessary
```

### Update Or Add Ci Cd Workflow

Updates or adds CI/CD workflow files, often for validation, release, or automation.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or add files under .github/workflows/
2. Optionally update related scripts, lockfiles, or validation files
3. Commit with a message referencing CI, release, or validation

**Files typically involved**:
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Edit or add files under .github/workflows/
Optionally update related scripts, lockfiles, or validation files
Commit with a message referencing CI, release, or validation
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
