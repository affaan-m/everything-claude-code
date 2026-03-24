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

### Feature Development

Standard feature implementation workflow

**Frequency**: ~30 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Example commit sequence**:
```
feat: add click-path-audit skill — finds state interaction bugs (#729)
feat: pending instinct TTL pruning and /prune command (#725)
feat(skills): add santa-method - multi-agent adversarial verification (#760)
```

### Add Or Update Skill

Adds or updates a skill in the everything-claude-code system, including documentation and configuration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update .claude/commands/add-or-update-skill.md
2. Create or update .agents/skills/everything-claude-code/SKILL.md and/or .claude/skills/everything-claude-code/SKILL.md
3. Optionally update .agents/skills/everything-claude-code/agents/openai.yaml

**Files typically involved**:
- `.claude/commands/add-or-update-skill.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/agents/openai.yaml`

**Example commit sequence**:
```
Create or update .claude/commands/add-or-update-skill.md
Create or update .agents/skills/everything-claude-code/SKILL.md and/or .claude/skills/everything-claude-code/SKILL.md
Optionally update .agents/skills/everything-claude-code/agents/openai.yaml
```

### Add Or Update Command Doc

Adds or updates a command documentation file in the ECC bundle.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .claude/commands/{command-name}.md

**Files typically involved**:
- `.claude/commands/add-or-update-skill.md`
- `.claude/commands/feature-development.md`
- `.claude/commands/database-migration.md`
- `.claude/commands/add-or-update-skill-documentation.md`

**Example commit sequence**:
```
Create or update .claude/commands/{command-name}.md
```

### Update Team Or Identity Config

Updates team configuration or identity files for ECC.

**Frequency**: ~3 times per month

**Steps**:
1. Edit .claude/team/everything-claude-code-team-config.json and/or .claude/identity.json

**Files typically involved**:
- `.claude/team/everything-claude-code-team-config.json`
- `.claude/identity.json`

**Example commit sequence**:
```
Edit .claude/team/everything-claude-code-team-config.json and/or .claude/identity.json
```

### Add Or Update Research Or Rules Doc

Adds or updates research playbooks or rules/guardrails documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update .claude/research/everything-claude-code-research-playbook.md and/or .claude/rules/everything-claude-code-guardrails.md

**Files typically involved**:
- `.claude/research/everything-claude-code-research-playbook.md`
- `.claude/rules/everything-claude-code-guardrails.md`

**Example commit sequence**:
```
Create or update .claude/research/everything-claude-code-research-playbook.md and/or .claude/rules/everything-claude-code-guardrails.md
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
