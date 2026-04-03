```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the core development patterns, coding conventions, and collaborative workflows for the `everything-claude-code` TypeScript repository. It covers file organization, commit practices, import/export styles, and how to extend the repository with new ECC bundle components. Use this guide to ensure consistency and efficiency when contributing to the codebase.

## Coding Conventions

### File Naming

- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.test.ts`

### Import Style

- Use **relative imports** for referencing modules.
  - Example:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Export Style

- Prefer **named exports**.
  - Example:
    ```typescript
    // In dataFetcher.ts
    export function fetchData() { /* ... */ }
    ```

- Importing named exports:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Commit Messages

- Use **conventional commit** format.
- Prefix commit messages with `feat` for new features.
  - Example:
    ```
    feat: add user profile component with avatar support
    ```

## Workflows

### Add ECC Bundle Component

**Trigger:** When you want to extend the ECC bundle with a new configuration or documentation component (e.g., tools, skills, identity, or commands).

**Command:** `/add-ecc-bundle-component`

**Step-by-step Instructions:**

1. **Create or Update Files:**  
   Add or modify a file in the relevant ECC bundle directory. Common locations include:
   - `.claude/ecc-tools.json`
   - `.claude/skills/everything-claude-code/SKILL.md`
   - `.agents/skills/everything-claude-code/SKILL.md`
   - `.claude/identity.json`
   - `.claude/commands/feature-development.md`
   - `.claude/commands/add-ecc-bundle-component.md`

2. **Commit Changes:**  
   Use a conventional commit message referencing the ECC bundle.  
   Example:
   ```
   feat: add new skill documentation to ECC bundle
   ```

3. **(Optional) Use the Command:**  
   You can trigger this workflow using the `/add-ecc-bundle-component` command for automation or documentation purposes.

## Testing Patterns

- **Test File Pattern:**  
  Test files use the `*.test.*` naming convention.
  - Example: `dataFetcher.test.ts`

- **Testing Framework:**  
  The specific testing framework is not detected, but standard TypeScript testing practices apply.

- **Example Test File:**
    ```typescript
    // dataFetcher.test.ts
    import { fetchData } from './dataFetcher';

    test('fetchData returns expected data', () => {
      const result = fetchData();
      expect(result).toBeDefined();
    });
    ```

## Commands

| Command                     | Purpose                                                        |
|-----------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-component   | Add or update a component in the ECC bundle (tools, skills, etc.) |

```
