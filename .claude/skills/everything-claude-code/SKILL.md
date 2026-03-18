---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-18

## Overview

This skill teaches Claude the development patterns and conventions used in everything-claude-code.

## Tech Stack

- **Primary Language**: JavaScript
- **Architecture**: hybrid module organization
- **Test Location**: separate
- **Test Framework**: unknown

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 8 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `fix`
- `feat`
- `test`
- `docs`

### Message Guidelines

- Average message length: ~67 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-agent.md)
```

*Commit message example*

```text
fix: resolve 8 test failures on main (install pipeline, orchestrator, repair) (#564)
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
chore(config): governance and config foundation (#292)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill.md)
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

### Export Style: Named Exports


*Preferred export style*

```typescript
// Use named exports
export function calculateTotal() { ... }
export const TAX_RATE = 0.1
export interface Order { ... }
```

## Testing

### Test Framework: unknown

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

**Frequency**: ~28 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `**/*.test.*`

**Example commit sequence**:
```
feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
fix: address PR review — skill template (When to use, How it works, Examples), bun.lock, next build note, rust-reviewer CI note, doc-lookup privacy/uncertainty
```

### Add New Skill Or Agent

Adds a new skill or agent to the system, including documentation and configuration.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update SKILL.md in .agents/skills/{skill-name}/
2. Add or update agents/openai.yaml in .agents/skills/{skill-name}/agents/
3. Optionally, add SKILL.md in skills/{skill-name}/ and/or .cursor/skills/{skill-name}/
4. Register agent in AGENTS.md if applicable
5. Update rules/common/agents.md if applicable

**Files typically involved**:
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `AGENTS.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Create or update SKILL.md in .agents/skills/{skill-name}/
Add or update agents/openai.yaml in .agents/skills/{skill-name}/agents/
Optionally, add SKILL.md in skills/{skill-name}/ and/or .cursor/skills/{skill-name}/
Register agent in AGENTS.md if applicable
Update rules/common/agents.md if applicable
```

### Add Command Or Workflow Doc

Adds or updates documentation for commands or workflows, including feature development, database migration, and agent/skill addition.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update .claude/commands/{command-name}.md
2. Optionally, update related configuration or reference files

**Files typically involved**:
- `.claude/commands/*.md`

**Example commit sequence**:
```
Create or update .claude/commands/{command-name}.md
Optionally, update related configuration or reference files
```

### Register Agent In Catalog

Registers a new agent in the main catalog and documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update agent documentation file in agents/{agent-name}.md
2. Add agent entry to AGENTS.md
3. Update rules/common/agents.md if necessary

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Add or update agent documentation file in agents/{agent-name}.md
Add agent entry to AGENTS.md
Update rules/common/agents.md if necessary
```

### Sync Skill Or Agent Docs Across Harnesses

Ensures skill or agent documentation is consistent across .agents, .cursor, and main skills directories.

**Frequency**: ~2 times per month

**Steps**:
1. Update SKILL.md in .agents/skills/{skill-name}/
2. Update SKILL.md in .cursor/skills/{skill-name}/
3. Update SKILL.md in skills/{skill-name}/

**Files typically involved**:
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Update SKILL.md in .agents/skills/{skill-name}/
Update SKILL.md in .cursor/skills/{skill-name}/
Update SKILL.md in skills/{skill-name}/
```

### Update Team Or Identity Config

Updates core configuration files for team or identity settings.

**Frequency**: ~2 times per month

**Steps**:
1. Edit .claude/team/everything-claude-code-team-config.json
2. Edit .claude/identity.json

**Files typically involved**:
- `.claude/team/everything-claude-code-team-config.json`
- `.claude/identity.json`

**Example commit sequence**:
```
Edit .claude/team/everything-claude-code-team-config.json
Edit .claude/identity.json
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Write tests using unknown
- Follow *.test.js naming pattern
- Use camelCase for file names
- Prefer named exports

### Don't

- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
