---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. TypeScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-04-04

## Overview

This skill teaches Claude the development patterns and conventions used in everything-claude-code.

## Tech Stack

- **Primary Language**: TypeScript
- **Architecture**: hybrid module organization
- **Test Location**: separate

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 10 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`

### Message Guidelines

- Average message length: ~82 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/ecc-tools.json)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/skills/everything-claude-code/SKILL.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.agents/skills/everything-claude-code/SKILL.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/identity.json)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.codex/agents/explorer.toml)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.codex/agents/reviewer.toml)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.codex/agents/docs-researcher.toml)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/feature-development.md)
```

## Architecture

### Project Structure: Single Package

This project uses **hybrid** module organization.

### Guidelines

- This project uses a hybrid organization
- Follow existing patterns when adding new code

## Code Style

### Language: TypeScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Relative Imports

### Export Style: Named Exports


*Preferred import style*

```typescript
// Use relative imports
import { Button } from '../components/Button'
import { useAuth } from './hooks/useAuth'
```

*Preferred export style*

```typescript
// Use named exports
export function calculateTotal() { ... }
export const TAX_RATE = 0.1
export interface Order { ... }
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

**Files typically involved**:
- `.claude/commands/*`

**Example commit sequence**:
```
feat: add everything-claude-code ECC bundle (.claude/ecc-tools.json)
feat: add everything-claude-code ECC bundle (.claude/skills/everything-claude-code/SKILL.md)
feat: add everything-claude-code ECC bundle (.agents/skills/everything-claude-code/SKILL.md)
```

### Add Ecc Bundle Component

Adds a new component to the everything-claude-code ECC bundle, such as a skill, agent, identity, or command.

**Frequency**: ~8 times per month

**Steps**:
1. Create or update a file under a specific ECC-related directory (e.g., .claude/skills/, .agents/skills/, .claude/commands/, .claude/identity.json, .claude/ecc-tools.json, .codex/agents/)
2. Commit the new or updated file with a message referencing the ECC bundle

**Files typically involved**:
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`
- `.codex/agents/explorer.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/docs-researcher.toml`

**Example commit sequence**:
```
Create or update a file under a specific ECC-related directory (e.g., .claude/skills/, .agents/skills/, .claude/commands/, .claude/identity.json, .claude/ecc-tools.json, .codex/agents/)
Commit the new or updated file with a message referencing the ECC bundle
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Use camelCase for file names
- Prefer named exports

### Don't

- Don't write vague commit messages
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
