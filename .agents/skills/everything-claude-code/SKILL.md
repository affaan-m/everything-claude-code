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
- `test`
- `feat`
- `docs`

### Message Guidelines

- Average message length: ~66 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill-or-agent.md)
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

**Frequency**: ~25 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: record canonical session snapshots via adapters (#511)
fix: resolve all CI test failures (19 fixes across 6 files) (#519)
feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

### Add New Skill

Adds a new skill to the repository, including documentation and agent configuration.

**Frequency**: ~5 times per month

**Steps**:
1. Create or update SKILL.md in skills/<skill-name>/SKILL.md
2. Optionally add or update .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md for cross-harness support
3. Optionally add .agents/skills/<skill-name>/agents/openai.yaml for agent configuration
4. Update install manifests if the skill should be included in install profiles

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `manifests/install-*.json`

**Example commit sequence**:
```
Create or update SKILL.md in skills/<skill-name>/SKILL.md
Optionally add or update .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md for cross-harness support
Optionally add .agents/skills/<skill-name>/agents/openai.yaml for agent configuration
Update install manifests if the skill should be included in install profiles
```

### Add New Agent

Adds a new agent to the repository, including documentation and registration.

**Frequency**: ~3 times per month

**Steps**:
1. Create agent documentation in agents/<agent-name>.md
2. Register the agent in AGENTS.md
3. Optionally add .codex/agents/<agent-name>.toml for Codex harness
4. Optionally add .agents/skills/<skill-name>/agents/openai.yaml if agent is tied to a skill

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `.codex/agents/*.toml`
- `.agents/skills/*/agents/openai.yaml`

**Example commit sequence**:
```
Create agent documentation in agents/<agent-name>.md
Register the agent in AGENTS.md
Optionally add .codex/agents/<agent-name>.toml for Codex harness
Optionally add .agents/skills/<skill-name>/agents/openai.yaml if agent is tied to a skill
```

### Add New Command

Adds a new slash command or workflow command to the system.

**Frequency**: ~2 times per month

**Steps**:
1. Create command documentation in commands/<command-name>.md
2. Optionally add OpenCode mirrors in .opencode/commands/
3. Update documentation or registry if needed

**Files typically involved**:
- `commands/*.md`
- `.opencode/commands/*.md`

**Example commit sequence**:
```
Create command documentation in commands/<command-name>.md
Optionally add OpenCode mirrors in .opencode/commands/
Update documentation or registry if needed
```

### Add Language Support

Adds support for a new programming language, including agents, skills, commands, and rules.

**Frequency**: ~2 times per month

**Steps**:
1. Add agents for the language (agents/<language>-reviewer.md, agents/<language>-build-resolver.md)
2. Add skills for patterns and testing (skills/<language>-patterns/SKILL.md, skills/<language>-testing/SKILL.md)
3. Add slash commands (commands/<language>-build.md, commands/<language>-review.md, commands/<language>-test.md)
4. Add rules for the language (rules/<language>/*.md)
5. Register agents in AGENTS.md
6. Optionally add OpenCode mirrors and prompts

**Files typically involved**:
- `agents/*-reviewer.md`
- `agents/*-build-resolver.md`
- `skills/*-patterns/SKILL.md`
- `skills/*-testing/SKILL.md`
- `commands/*-build.md`
- `commands/*-review.md`
- `commands/*-test.md`
- `rules/*/*.md`
- `AGENTS.md`
- `.opencode/commands/*.md`
- `.opencode/prompts/agents/*.txt`

**Example commit sequence**:
```
Add agents for the language (agents/<language>-reviewer.md, agents/<language>-build-resolver.md)
Add skills for patterns and testing (skills/<language>-patterns/SKILL.md, skills/<language>-testing/SKILL.md)
Add slash commands (commands/<language>-build.md, commands/<language>-review.md, commands/<language>-test.md)
Add rules for the language (rules/<language>/*.md)
Register agents in AGENTS.md
Optionally add OpenCode mirrors and prompts
```

### Update Install Manifests

Synchronizes install manifests to include new or updated skills and modules.

**Frequency**: ~2 times per month

**Steps**:
1. Update manifests/install-components.json with new skills
2. Update manifests/install-modules.json with new or extended modules
3. Update manifests/install-profiles.json to reference updated modules

**Files typically involved**:
- `manifests/install-components.json`
- `manifests/install-modules.json`
- `manifests/install-profiles.json`

**Example commit sequence**:
```
Update manifests/install-components.json with new skills
Update manifests/install-modules.json with new or extended modules
Update manifests/install-profiles.json to reference updated modules
```

### Address Pr Review Feedback

Applies fixes and improvements based on code review or PR feedback.

**Frequency**: ~4 times per month

**Steps**:
1. Edit relevant files to address review findings (e.g., documentation, code, config)
2. Clarify or expand examples, fix typos, improve consistency
3. Push follow-up commits referencing the PR or review round

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `agents/*.md`
- `rules/*/*.md`
- `commands/*.md`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Edit relevant files to address review findings (e.g., documentation, code, config)
Clarify or expand examples, fix typos, improve consistency
Push follow-up commits referencing the PR or review round
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
