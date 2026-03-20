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

- `feat`
- `fix`
- `test`
- `docs`

### Message Guidelines

- Average message length: ~66 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-skill-documentation.md)
```

*Commit message example*

```text
chore: prepare v1.9.0 release
```

*Commit message example*

```text
fix(clv2): use -e instead of -d for .git check in detect-project.sh
```

*Commit message example*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

*Commit message example*

```text
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-command-documentation.md)
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

### Import Style: Mixed Style

### Export Style: Mixed Style


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

**Frequency**: ~30 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Example commit sequence**:
```
feat: add everything-claude-code ECC bundle (.claude/team/everything-claude-code-team-config.json)
feat: add everything-claude-code ECC bundle (.claude/enterprise/controls.md)
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-agent.md)
```

### Add New Skill

Adds a new skill to the everything-claude-code project, including documentation and configuration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/commands/add-new-skill.md' with instructions or documentation for the new skill.
2. Create or update '.agents/skills/everything-claude-code/SKILL.md' to document the skill's details.
3. Create or update '.claude/skills/everything-claude-code/SKILL.md' for additional documentation or configuration.

**Files typically involved**:
- `.claude/commands/add-new-skill.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`

**Example commit sequence**:
```
Create or update '.claude/commands/add-new-skill.md' with instructions or documentation for the new skill.
Create or update '.agents/skills/everything-claude-code/SKILL.md' to document the skill's details.
Create or update '.claude/skills/everything-claude-code/SKILL.md' for additional documentation or configuration.
```

### Add New Agent

Adds a new agent to the everything-claude-code project, including documentation and configuration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/commands/add-new-agent.md' with instructions or documentation for the new agent.
2. Create or update '.agents/skills/everything-claude-code/agents/openai.yaml' for agent configuration.

**Files typically involved**:
- `.claude/commands/add-new-agent.md`
- `.agents/skills/everything-claude-code/agents/openai.yaml`

**Example commit sequence**:
```
Create or update '.claude/commands/add-new-agent.md' with instructions or documentation for the new agent.
Create or update '.agents/skills/everything-claude-code/agents/openai.yaml' for agent configuration.
```

### Add Command Documentation

Documents a new or existing command in the system.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update '.claude/commands/add-command-documentation.md' with relevant command documentation.

**Files typically involved**:
- `.claude/commands/add-command-documentation.md`

**Example commit sequence**:
```
Create or update '.claude/commands/add-command-documentation.md' with relevant command documentation.
```

### Feature Development Documentation

Documents the process or steps for feature development in the project.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/commands/feature-development.md' with feature development process documentation.

**Files typically involved**:
- `.claude/commands/feature-development.md`

**Example commit sequence**:
```
Create or update '.claude/commands/feature-development.md' with feature development process documentation.
```

### Update Team Config

Updates the team configuration for the everything-claude-code project.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/team/everything-claude-code-team-config.json' with new team configuration.

**Files typically involved**:
- `.claude/team/everything-claude-code-team-config.json`

**Example commit sequence**:
```
Create or update '.claude/team/everything-claude-code-team-config.json' with new team configuration.
```

### Update Enterprise Controls

Updates enterprise controls and policies for the project.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/enterprise/controls.md' with new or updated controls.

**Files typically involved**:
- `.claude/enterprise/controls.md`

**Example commit sequence**:
```
Create or update '.claude/enterprise/controls.md' with new or updated controls.
```

### Update Research Playbook

Updates the research playbook documentation.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/research/everything-claude-code-research-playbook.md' with new research procedures.

**Files typically involved**:
- `.claude/research/everything-claude-code-research-playbook.md`

**Example commit sequence**:
```
Create or update '.claude/research/everything-claude-code-research-playbook.md' with new research procedures.
```

### Update Guardrails

Updates the project guardrails and rules.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/rules/everything-claude-code-guardrails.md' with new or updated rules.

**Files typically involved**:
- `.claude/rules/everything-claude-code-guardrails.md`

**Example commit sequence**:
```
Create or update '.claude/rules/everything-claude-code-guardrails.md' with new or updated rules.
```

### Update Ecc Tools

Updates the ECC tools configuration file.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/ecc-tools.json' with new or updated tool definitions.

**Files typically involved**:
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Create or update '.claude/ecc-tools.json' with new or updated tool definitions.
```

### Update Identity

Updates the project identity configuration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/identity.json' with new identity information.

**Files typically involved**:
- `.claude/identity.json`

**Example commit sequence**:
```
Create or update '.claude/identity.json' with new identity information.
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
