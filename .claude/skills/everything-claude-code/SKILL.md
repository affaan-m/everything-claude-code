```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns and workflows used in the `everything-claude-code` repository. The codebase is written in TypeScript and follows consistent conventions for file organization, code style, and collaborative workflows. While no specific framework is detected, the repository emphasizes clarity, maintainability, and standardized contributions—especially around adding new "skills" via markdown documentation.

## Coding Conventions

### File Naming

- **PascalCase** is used for file names.
  - Example: `MyComponent.ts`, `UserProfile.test.ts`

### Import Style

- **Relative imports** are preferred.
  - Example:
    ```typescript
    import { MyFunction } from './MyFunction';
    ```

### Export Style

- **Named exports** are used instead of default exports.
  - Example:
    ```typescript
    // MyFunction.ts
    export function MyFunction() { /* ... */ }
    ```

    ```typescript
    import { MyFunction } from './MyFunction';
    ```

### Commit Messages

- **Conventional commit** style is enforced.
  - Prefixes: `feat`, `fix`
  - Example:
    ```
    feat: add user authentication to login flow
    fix: correct typo in UserProfile component
    ```

## Workflows

### Add and Review New Skill

**Trigger:** When someone wants to contribute a new skill to the repository.  
**Command:** `/new-skill`

1. **Create a new subdirectory** under `skills/` with a descriptive name for your skill.
   - Example: `skills/TypeScriptBestPractices/`
2. **Add a `SKILL.md` file** in your new subdirectory. This file should detail the new skill, following the established format.
3. **Submit the new skill for review** via a pull request or the repository's contribution process.
4. **Address review feedback**:
   - Update section names for clarity and consistency.
   - Fix any technical inaccuracies.
   - Clarify examples as needed.
   - Ensure formatting matches repository standards.

**Files involved:**  
- `skills/*/SKILL.md`

**Frequency:**  
- ~2 times per month

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `UserProfile.test.ts`).
- **Testing framework** is not explicitly detected; follow the existing test file patterns.
- Example test file:
  ```typescript
  // UserProfile.test.ts
  import { UserProfile } from './UserProfile';

  describe('UserProfile', () => {
    it('should render correctly', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command     | Purpose                                               |
|-------------|-------------------------------------------------------|
| /new-skill  | Start the process to add and review a new skill bundle |

```