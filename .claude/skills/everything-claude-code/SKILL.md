```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `everything-claude-code` TypeScript repository. It covers file naming, import/export styles, commit message standards, and testing patterns. Use this guide to ensure consistency and best practices when contributing to the codebase.

## Coding Conventions

### File Naming
- **Pattern:** PascalCase for all files.
- **Example:**  
  ```
  MyComponent.ts
  UserService.ts
  ```

### Import Style
- **Pattern:** Always use relative imports.
- **Example:**
  ```typescript
  import { UserService } from './UserService';
  import { calculateTotal } from '../utils/CalculateTotal';
  ```

### Export Style
- **Pattern:** Use named exports.
- **Example:**
  ```typescript
  // In UserService.ts
  export function getUser(id: string) { ... }
  export const USER_ROLE = 'admin';
  ```

### Commit Messages
- **Pattern:** Conventional commits with prefixes `fix` and `feat`.
- **Format:**  
  ```
  <type>(<scope>): <short description>
  ```
- **Example:**  
  ```
  feat(auth): add OAuth2 login support
  fix(user): correct user role assignment bug
  ```

## Workflows

### Feature Development
**Trigger:** When adding a new feature  
**Command:** `/feature`

1. Create a new branch: `git checkout -b feat/<feature-name>`
2. Implement your feature using PascalCase files and named exports.
3. Use relative imports for all dependencies.
4. Write or update tests in `*.test.*` files.
5. Commit changes with a `feat` prefix:
   ```
   feat(<scope>): <description>
   ```
6. Open a pull request for review.

### Bug Fixing
**Trigger:** When fixing a bug  
**Command:** `/fix`

1. Create a new branch: `git checkout -b fix/<bug-description>`
2. Fix the bug, maintaining code style conventions.
3. Update or add relevant tests in `*.test.*` files.
4. Commit changes with a `fix` prefix:
   ```
   fix(<scope>): <description>
   ```
5. Open a pull request for review.

## Testing Patterns

- **File Pattern:** Test files are named with `*.test.*` (e.g., `UserService.test.ts`)
- **Framework:** Not explicitly detected; follow standard TypeScript testing practices.
- **Example:**
  ```typescript
  // UserService.test.ts
  import { getUser } from './UserService';

  describe('getUser', () => {
    it('returns user by id', () => {
      expect(getUser('123')).toEqual({ id: '123', name: 'Alice' });
    });
  });
  ```

## Commands
| Command   | Purpose                                 |
|-----------|-----------------------------------------|
| /feature  | Start a new feature development workflow|
| /fix      | Start a bug fixing workflow             |
```
