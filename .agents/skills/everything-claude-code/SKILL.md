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

- Average message length: ~71 characters
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

### Add Documentation Command Or Skill Or Agent Or Workflow

Adds new documentation for a command, skill, agent, or workflow to the ECC bundle.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new markdown file in .claude/commands/ with a descriptive name (e.g., add-documentation-command-or-skill.md, add-documentation-command-or-skill-or-agent-or-workflow.md, add-documentation-skill-or-agent.md, add-documentation-command-or-workflow.md).
2. Commit the new file with a message referencing the ECC bundle.

**Files typically involved**:
- `.claude/commands/add-documentation-command-or-skill.md`
- `.claude/commands/add-documentation-command-or-skill-or-agent-or-workflow.md`
- `.claude/commands/add-documentation-skill-or-agent.md`
- `.claude/commands/add-documentation-command-or-workflow.md`

**Example commit sequence**:
```
Create a new markdown file in .claude/commands/ with a descriptive name (e.g., add-documentation-command-or-skill.md, add-documentation-command-or-skill-or-agent-or-workflow.md, add-documentation-skill-or-agent.md, add-documentation-command-or-workflow.md).
Commit the new file with a message referencing the ECC bundle.
```

### Add Team Or Identity Or Research Config

Adds or updates team configuration, identity, or research playbook files for the ECC bundle.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update .claude/team/everything-claude-code-team-config.json for team configuration.
2. Create or update .claude/identity.json for identity information.
3. Create or update .claude/research/everything-claude-code-research-playbook.md for research playbooks.
4. Commit the changes with a message referencing the ECC bundle.

**Files typically involved**:
- `.claude/team/everything-claude-code-team-config.json`
- `.claude/identity.json`
- `.claude/research/everything-claude-code-research-playbook.md`

**Example commit sequence**:
```
Create or update .claude/team/everything-claude-code-team-config.json for team configuration.
Create or update .claude/identity.json for identity information.
Create or update .claude/research/everything-claude-code-research-playbook.md for research playbooks.
Commit the changes with a message referencing the ECC bundle.
```

### Add Guardrails Or Instincts Or Enterprise Controls

Adds or updates guardrails, instincts, or enterprise controls for the ECC bundle.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update .claude/rules/everything-claude-code-guardrails.md for guardrails.
2. Create or update .claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml for instincts.
3. Create or update .claude/enterprise/controls.md for enterprise controls.
4. Commit the changes with a message referencing the ECC bundle.

**Files typically involved**:
- `.claude/rules/everything-claude-code-guardrails.md`
- `.claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml`
- `.claude/enterprise/controls.md`

**Example commit sequence**:
```
Create or update .claude/rules/everything-claude-code-guardrails.md for guardrails.
Create or update .claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml for instincts.
Create or update .claude/enterprise/controls.md for enterprise controls.
Commit the changes with a message referencing the ECC bundle.
```

### Add Codex Agents Or Config

Adds or updates agent definitions and configuration in the .codex directory.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update .codex/agents/*.toml files for agent definitions (e.g., docs-researcher.toml, reviewer.toml, explorer.toml).
2. Create or update .codex/AGENTS.md for agent documentation.
3. Create or update .codex/config.toml for codex configuration.
4. Commit the changes with a message referencing the ECC bundle.

**Files typically involved**:
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`
- `.codex/AGENTS.md`
- `.codex/config.toml`

**Example commit sequence**:
```
Create or update .codex/agents/*.toml files for agent definitions (e.g., docs-researcher.toml, reviewer.toml, explorer.toml).
Create or update .codex/AGENTS.md for agent documentation.
Create or update .codex/config.toml for codex configuration.
Commit the changes with a message referencing the ECC bundle.
```

### Add Skill Documentation

Adds or updates SKILL.md documentation for a skill in both .agents and .claude directories.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update .agents/skills/everything-claude-code/SKILL.md for agent skill documentation.
2. Create or update .claude/skills/everything-claude-code/SKILL.md for Claude skill documentation.
3. Commit the changes with a message referencing the ECC bundle.

**Files typically involved**:
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`

**Example commit sequence**:
```
Create or update .agents/skills/everything-claude-code/SKILL.md for agent skill documentation.
Create or update .claude/skills/everything-claude-code/SKILL.md for Claude skill documentation.
Commit the changes with a message referencing the ECC bundle.
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
