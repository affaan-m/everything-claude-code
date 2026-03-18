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

- `feat`
- `fix`
- `docs`

### Message Guidelines

- Average message length: ~79 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-team-or-identity-or-research-config.md)
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
feat: add everything-claude-code ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/enterprise/controls.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/team/everything-claude-code-team-config.json)
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

**Frequency**: ~30 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Example commit sequence**:
```
feat: add everything-claude-code ECC bundle (.claude/identity.json)
feat: add everything-claude-code ECC bundle (.codex/config.toml)
feat: add everything-claude-code ECC bundle (.codex/AGENTS.md)
```

### Add Command Or Skill Or Agent Or Workflow

Adds a new command, skill, agent, or workflow to the ECC system.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/commands/add-command-or-skill-or-agent-or-workflow.md' to document the addition.
2. Optionally, add related SKILL.md or agent YAML files under '.agents/skills/' or '.claude/skills/'.

**Files typically involved**:
- `.claude/commands/add-command-or-skill-or-agent-or-workflow.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`

**Example commit sequence**:
```
Create or update '.claude/commands/add-command-or-skill-or-agent-or-workflow.md' to document the addition.
Optionally, add related SKILL.md or agent YAML files under '.agents/skills/' or '.claude/skills/'.
```

### Add Team Or Identity Or Research Config

Adds or updates team, identity, or research configuration files.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/team/everything-claude-code-team-config.json' for team config.
2. Create or update '.claude/identity.json' for identity config.
3. Create or update '.claude/research/everything-claude-code-research-playbook.md' for research playbook.
4. Document the addition in '.claude/commands/add-team-or-identity-or-research-config.md'.

**Files typically involved**:
- `.claude/team/everything-claude-code-team-config.json`
- `.claude/identity.json`
- `.claude/research/everything-claude-code-research-playbook.md`
- `.claude/commands/add-team-or-identity-or-research-config.md`

**Example commit sequence**:
```
Create or update '.claude/team/everything-claude-code-team-config.json' for team config.
Create or update '.claude/identity.json' for identity config.
Create or update '.claude/research/everything-claude-code-research-playbook.md' for research playbook.
Document the addition in '.claude/commands/add-team-or-identity-or-research-config.md'.
```

### Add Or Update Guardrails And Controls

Adds or updates project guardrails and enterprise controls documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update '.claude/rules/everything-claude-code-guardrails.md' for guardrails.
2. Create or update '.claude/enterprise/controls.md' for enterprise controls.

**Files typically involved**:
- `.claude/rules/everything-claude-code-guardrails.md`
- `.claude/enterprise/controls.md`

**Example commit sequence**:
```
Create or update '.claude/rules/everything-claude-code-guardrails.md' for guardrails.
Create or update '.claude/enterprise/controls.md' for enterprise controls.
```

### Add Or Update Codex Agents

Adds or updates agent configuration files in the .codex directory.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update '.codex/agents/docs-researcher.toml', '.codex/agents/reviewer.toml', or '.codex/agents/explorer.toml'.
2. Optionally, update '.codex/AGENTS.md' to document the agents.
3. Optionally, update '.codex/config.toml' for configuration.

**Files typically involved**:
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`
- `.codex/AGENTS.md`
- `.codex/config.toml`

**Example commit sequence**:
```
Create or update '.codex/agents/docs-researcher.toml', '.codex/agents/reviewer.toml', or '.codex/agents/explorer.toml'.
Optionally, update '.codex/AGENTS.md' to document the agents.
Optionally, update '.codex/config.toml' for configuration.
```

### Add Or Update Instincts

Adds or updates inherited instincts for the homunculus agent.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update '.claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml'.

**Files typically involved**:
- `.claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml`

**Example commit sequence**:
```
Create or update '.claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml'.
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
