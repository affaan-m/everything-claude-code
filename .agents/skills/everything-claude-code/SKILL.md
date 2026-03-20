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
fix(tests): fix ESLint unused-var and Windows cost-tracker HOME issue
```

*Commit message example*

```text
feat(rules): add Rust testing and security rules
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
fix: update catalog counts in README.md and AGENTS.md
```

*Commit message example*

```text
fix(rules): address review feedback on Rust rules
```

*Commit message example*

```text
feat(rules): add Rust coding style, hooks, and patterns rules
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

Adds a new skill to the repository, following the SKILL.md template and optionally cross-harness copies.

**Frequency**: ~6 times per month

**Steps**:
1. Create a new directory under skills/ (e.g., skills/skill-name/)
2. Add SKILL.md with required sections (When to Use, How It Works, Examples, etc.)
3. Optionally add .agents/skills/skill-name/SKILL.md and/or .cursor/skills/skill-name/SKILL.md for harness-specific copies
4. Address PR review feedback (section renames, example markers, etc.)
5. Sync or remove duplicate harness copies as needed

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new directory under skills/ (e.g., skills/skill-name/)
Add SKILL.md with required sections (When to Use, How It Works, Examples, etc.)
Optionally add .agents/skills/skill-name/SKILL.md and/or .cursor/skills/skill-name/SKILL.md for harness-specific copies
Address PR review feedback (section renames, example markers, etc.)
Sync or remove duplicate harness copies as needed
```

### Add New Agent

Adds a new agent to the repository, registers it in documentation and mapping files.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new agent markdown file under agents/ (e.g., agents/agent-name.md)
2. Register the agent in AGENTS.md and README.md (agent tables, counts)
3. Optionally update docs/COMMAND-AGENT-MAP.md if relevant
4. Address PR review feedback (tools format, references, etc.)

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`

**Example commit sequence**:
```
Create a new agent markdown file under agents/ (e.g., agents/agent-name.md)
Register the agent in AGENTS.md and README.md (agent tables, counts)
Optionally update docs/COMMAND-AGENT-MAP.md if relevant
Address PR review feedback (tools format, references, etc.)
```

### Add Language Ruleset

Adds a new language ruleset (coding style, hooks, patterns, security, testing) following established conventions.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new directory under rules/ (e.g., rules/lang/)
2. Add coding-style.md, hooks.md, patterns.md, security.md, testing.md under the new directory
3. Register language in rules/common/agents.md if needed
4. Address PR review feedback for consistency

**Files typically involved**:
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Create a new directory under rules/ (e.g., rules/lang/)
Add coding-style.md, hooks.md, patterns.md, security.md, testing.md under the new directory
Register language in rules/common/agents.md if needed
Address PR review feedback for consistency
```

### Add New Command

Adds a new command to the system, often with a backing skill and documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new markdown file under commands/ (e.g., commands/command-name.md)
2. If needed, add a backing skill under skills/command-name/SKILL.md
3. Update documentation or mapping files if relevant
4. Address PR review feedback (argument handling, output format, etc.)

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new markdown file under commands/ (e.g., commands/command-name.md)
If needed, add a backing skill under skills/command-name/SKILL.md
Update documentation or mapping files if relevant
Address PR review feedback (argument handling, output format, etc.)
```

### Update Catalog Counts In Documentation

Synchronizes agent, skill, and command counts in documentation files to reflect the actual repository state.

**Frequency**: ~4 times per month

**Steps**:
1. Update agent and skill counts in README.md (quick-start, comparison table, etc.)
2. Update counts in AGENTS.md (summary, project structure)
3. Update command counts if relevant
4. Commit with a message referencing catalog or documentation count sync

**Files typically involved**:
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Update agent and skill counts in README.md (quick-start, comparison table, etc.)
Update counts in AGENTS.md (summary, project structure)
Update command counts if relevant
Commit with a message referencing catalog or documentation count sync
```

### Add Skill With Antigravity Support

Adds a new skill with Antigravity harness support, including .agents/skills/ and openai.yaml copies, and updates contributor workflow documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Create skills/skill-name/SKILL.md (canonical version)
2. Add .agents/skills/skill-name/SKILL.md (condensed or harness-specific copy)
3. Add .agents/skills/skill-name/agents/openai.yaml with harness config
4. Update docs/ANTIGRAVITY-GUIDE.md and/or README.md with workflow or references
5. Sync or clarify .agents/ vs .agent/ directory usage in documentation

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `docs/ANTIGRAVITY-GUIDE.md`
- `README.md`

**Example commit sequence**:
```
Create skills/skill-name/SKILL.md (canonical version)
Add .agents/skills/skill-name/SKILL.md (condensed or harness-specific copy)
Add .agents/skills/skill-name/agents/openai.yaml with harness config
Update docs/ANTIGRAVITY-GUIDE.md and/or README.md with workflow or references
Sync or clarify .agents/ vs .agent/ directory usage in documentation
```

### Add Or Update Install Catalog

Adds or updates install component/module/profile manifests and schemas to support new skills, agents, or install flags.

**Frequency**: ~2 times per month

**Steps**:
1. Edit manifests/install-components.json to add or update components (skills, agents, etc.)
2. Edit manifests/install-modules.json and/or install-profiles.json to group or profile installs
3. Update schemas/install-components.schema.json if new family prefixes or schema changes are needed
4. Update scripts/lib/install-manifests.js to register new prefixes or logic
5. Add or update tests in tests/lib/selective-install.test.js or similar
6. Validate and commit changes

**Files typically involved**:
- `manifests/install-components.json`
- `manifests/install-modules.json`
- `manifests/install-profiles.json`
- `schemas/install-components.schema.json`
- `scripts/lib/install-manifests.js`
- `tests/lib/selective-install.test.js`

**Example commit sequence**:
```
Edit manifests/install-components.json to add or update components (skills, agents, etc.)
Edit manifests/install-modules.json and/or install-profiles.json to group or profile installs
Update schemas/install-components.schema.json if new family prefixes or schema changes are needed
Update scripts/lib/install-manifests.js to register new prefixes or logic
Add or update tests in tests/lib/selective-install.test.js or similar
Validate and commit changes
```

### Fix Or Enhance Tests And Cross Platform Support

Fixes or enhances test files, especially for cross-platform (Windows/Unix) compatibility, linting, and reliability.

**Frequency**: ~4 times per month

**Steps**:
1. Edit test files (e.g., tests/hooks/*.test.js, tests/lib/*.test.js, tests/scripts/*.test.js) to fix issues or add coverage
2. Update environment variable handling for Windows (HOME/USERPROFILE) or path normalization
3. Suppress or fix ESLint errors (e.g., unused variables)
4. Add or update helper functions for test stability
5. Commit with a message referencing test fixes or platform support

**Files typically involved**:
- `tests/**/*.test.js`

**Example commit sequence**:
```
Edit test files (e.g., tests/hooks/*.test.js, tests/lib/*.test.js, tests/scripts/*.test.js) to fix issues or add coverage
Update environment variable handling for Windows (HOME/USERPROFILE) or path normalization
Suppress or fix ESLint errors (e.g., unused variables)
Add or update helper functions for test stability
Commit with a message referencing test fixes or platform support
```

### Address Pr Review Feedback

Iteratively addresses PR review feedback by updating files, clarifying documentation, fixing naming, and refining examples.

**Frequency**: ~10 times per month

**Steps**:
1. Edit the relevant files to address reviewer comments (section renames, example clarifications, bug fixes, etc.)
2. Sync or remove duplicate files as needed
3. Clarify documentation or contributor workflow if necessary
4. Commit with a message referencing review feedback or PR number

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`
- `rules/**/*.md`
- `commands/*.md`
- `tests/**/*.test.js`

**Example commit sequence**:
```
Edit the relevant files to address reviewer comments (section renames, example clarifications, bug fixes, etc.)
Sync or remove duplicate files as needed
Clarify documentation or contributor workflow if necessary
Commit with a message referencing review feedback or PR number
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
