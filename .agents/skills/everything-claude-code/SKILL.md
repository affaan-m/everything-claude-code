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

- `fix`
- `test`
- `feat`
- `docs`

### Message Guidelines

- Average message length: ~65 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add governance event capture hook (#482)
```

*Commit message example*

```text
fix: sync catalog counts with filesystem (27 agents, 113 skills, 58 commands) (#693)
```

*Commit message example*

```text
chore: prepare v1.9.0 release (#666)
```

*Commit message example*

```text
docs: add Antigravity setup and usage guide (#552)
```

*Commit message example*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

*Commit message example*

```text
feat(rules): add Rust language rules (rebased #660) (#686)
```

*Commit message example*

```text
feat: implement --with/--without selective install flags (#679)
```

*Commit message example*

```text
fix: resolve Windows CI failures and markdown lint (#667)
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

**Frequency**: ~22 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `schemas/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
fix: address PR review — skill template (When to use, How it works, Examples), bun.lock, next build note, rust-reviewer CI note, doc-lookup privacy/uncertainty
```

### Add New Skill

Adds a new skill to the repository, including documentation, review cycles, and often cross-harness copies.

**Frequency**: ~6 times per month

**Steps**:
1. Create skills/<skill-name>/SKILL.md with full documentation and workflow.
2. Optionally add cross-harness copies to .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md.
3. Add openai.yaml or agent config if Antigravity/Codex support is needed.
4. Address PR review feedback, updating SKILL.md and related files as needed.
5. Remove .agents/ duplicate if canonical version is in skills/.
6. Sync or update install manifests if the skill is installable.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `skills/*/agents/openai.yaml`

**Example commit sequence**:
```
Create skills/<skill-name>/SKILL.md with full documentation and workflow.
Optionally add cross-harness copies to .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md.
Add openai.yaml or agent config if Antigravity/Codex support is needed.
Address PR review feedback, updating SKILL.md and related files as needed.
Remove .agents/ duplicate if canonical version is in skills/.
Sync or update install manifests if the skill is installable.
```

### Add New Agent

Adds a new agent to the repository, registers it in documentation and agent catalogs.

**Frequency**: ~3 times per month

**Steps**:
1. Create agents/<agent-name>.md with agent details.
2. Add agent entry to AGENTS.md (summary table and/or project structure).
3. Update README.md with agent count and agent tree if needed.
4. If applicable, update docs/COMMAND-AGENT-MAP.md.
5. Address PR review feedback, updating agent file and documentation as needed.

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`

**Example commit sequence**:
```
Create agents/<agent-name>.md with agent details.
Add agent entry to AGENTS.md (summary table and/or project structure).
Update README.md with agent count and agent tree if needed.
If applicable, update docs/COMMAND-AGENT-MAP.md.
Address PR review feedback, updating agent file and documentation as needed.
```

### Add Language Rules

Adds a new set of language-specific rules (coding style, hooks, patterns, security, testing) for a programming language.

**Frequency**: ~2 times per month

**Steps**:
1. Create rules/<language>/{coding-style.md, hooks.md, patterns.md, security.md, testing.md}.
2. Reference or link to related skills if appropriate.
3. Address PR review feedback, updating rules files as needed.
4. If needed, update catalog/documentation counts in README.md and AGENTS.md.

**Files typically involved**:
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create rules/<language>/{coding-style.md, hooks.md, patterns.md, security.md, testing.md}.
Reference or link to related skills if appropriate.
Address PR review feedback, updating rules files as needed.
If needed, update catalog/documentation counts in README.md and AGENTS.md.
```

### Sync Catalog Counts

Ensures that agent, skill, and command counts in documentation match the actual repository state.

**Frequency**: ~4 times per month

**Steps**:
1. Update agent and skill counts in AGENTS.md (summary and project structure).
2. Update agent, skill, and command counts in README.md (quick-start, comparison table, etc.).
3. Update version references or other catalog metadata if needed.
4. Optionally update package.json or CHANGELOG.md if part of a release.

**Files typically involved**:
- `AGENTS.md`
- `README.md`
- `CHANGELOG.md`
- `package.json`

**Example commit sequence**:
```
Update agent and skill counts in AGENTS.md (summary and project structure).
Update agent, skill, and command counts in README.md (quick-start, comparison table, etc.).
Update version references or other catalog metadata if needed.
Optionally update package.json or CHANGELOG.md if part of a release.
```

### Add New Command And Backing Skill

Adds a new CLI command and its corresponding skill, including documentation and review fixes.

**Frequency**: ~2 times per month

**Steps**:
1. Create commands/<command-name>.md with usage, workflow, and examples.
2. Create skills/<skill-name>/SKILL.md if the command has a skill implementation.
3. Update or create any necessary agent or config files if the command is agent-backed.
4. Address PR review feedback, updating command and skill files as needed.

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Create commands/<command-name>.md with usage, workflow, and examples.
Create skills/<skill-name>/SKILL.md if the command has a skill implementation.
Update or create any necessary agent or config files if the command is agent-backed.
Address PR review feedback, updating command and skill files as needed.
```

### Update Install Manifests

Updates install manifests to add new skills, agents, or modules to installation profiles.

**Frequency**: ~2 times per month

**Steps**:
1. Edit manifests/install-components.json to add new components.
2. Edit manifests/install-modules.json and/or manifests/install-profiles.json to include new modules or update profiles.
3. Edit schemas/install-components.schema.json if schema changes are needed.
4. Update scripts/lib/install-manifests.js if logic changes are required.
5. Add or update tests for install logic.
6. Validate manifests and run tests.

**Files typically involved**:
- `manifests/install-components.json`
- `manifests/install-modules.json`
- `manifests/install-profiles.json`
- `schemas/install-components.schema.json`
- `scripts/lib/install-manifests.js`
- `tests/lib/selective-install.test.js`

**Example commit sequence**:
```
Edit manifests/install-components.json to add new components.
Edit manifests/install-modules.json and/or manifests/install-profiles.json to include new modules or update profiles.
Edit schemas/install-components.schema.json if schema changes are needed.
Update scripts/lib/install-manifests.js if logic changes are required.
Add or update tests for install logic.
Validate manifests and run tests.
```

### Add Or Update Hook With Tests

Adds or updates a hook script and its corresponding tests (often for governance, observer, or project detection logic).

**Frequency**: ~2 times per month

**Steps**:
1. Create or update scripts/hooks/<hook-name>.js or skills/continuous-learning-v2/hooks/<hook>.sh.
2. Wire the hook into hooks.json if needed.
3. Add or update tests in tests/hooks/<hook-name>.test.js.
4. Address PR review feedback, updating hook and test files as needed.

**Files typically involved**:
- `scripts/hooks/*.js`
- `skills/continuous-learning-v2/hooks/*.sh`
- `skills/continuous-learning-v2/agents/*.sh`
- `hooks/hooks.json`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Create or update scripts/hooks/<hook-name>.js or skills/continuous-learning-v2/hooks/<hook>.sh.
Wire the hook into hooks.json if needed.
Add or update tests in tests/hooks/<hook-name>.test.js.
Address PR review feedback, updating hook and test files as needed.
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
