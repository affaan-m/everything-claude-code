```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns used in the `everything-claude-code` TypeScript repository. It covers file naming conventions, import/export styles, commit message patterns, and common workflows for maintaining skill documentation and agent configuration. This guide is essential for contributors aiming for consistency and clarity in code and documentation.

## Coding Conventions

### File Naming

- **PascalCase** is used for file names.
  - Example: `MyComponent.ts`, `UserService.ts`

### Imports

- **Relative imports** are preferred.
  - Example:
    ```typescript
    import { UserService } from './UserService';
    ```

### Exports

- **Named exports** are used throughout the codebase.
  - Example:
    ```typescript
    export function fetchData() { /* ... */ }
    export const API_URL = 'https://api.example.com';
    ```

### Commit Messages

- Follows **conventional commit** patterns.
- Uses the `feat` prefix for new features.
- Example:
  ```
  feat: add user authentication to login flow
  ```

## Workflows

### add-ecc-bundle-skill-documentation
**Trigger:** When someone wants to document a new ECC skill for both Claude and agent environments.  
**Command:** `/add-skill-docs`

1. Create or update `.claude/skills/everything-claude-code/SKILL.md` with the latest documentation.
2. Create or update `.agents/skills/everything-claude-code/SKILL.md` to mirror the documentation for agent environments.

**Example:**
```bash
/add-skill-docs
# This will prompt you to update both SKILL.md files as described above.
```

### add-ecc-bundle-agent-config
**Trigger:** When someone wants to register or update agent configurations for ECC tools.  
**Command:** `/add-agent-config`

1. Create or update `.codex/agents/explorer.toml` with the required configuration.
2. Create or update `.codex/agents/reviewer.toml` as needed.
3. Create or update `.codex/agents/docs-researcher.toml` to ensure all agent roles are configured.

**Example:**
```bash
/add-agent-config
# This will prompt you to update the relevant .toml files in .codex/agents/
```

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
  - Example: `UserService.test.ts`
- The testing framework is **unknown**, but tests are colocated with source files or in dedicated test directories.
- Example test file:
  ```typescript
  // UserService.test.ts
  import { fetchData } from './UserService';

  test('fetchData returns expected result', () => {
    expect(fetchData()).toBeDefined();
  });
  ```

## Commands

| Command             | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| /add-skill-docs     | Add or update ECC skill documentation in both Claude and agent environments. |
| /add-agent-config   | Add or update agent configuration files for ECC tools.          |
```
