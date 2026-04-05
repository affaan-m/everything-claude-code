```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the development patterns and conventions used in the `everything-claude-code` JavaScript repository. It covers file organization, code style, commit practices, and testing approaches. By following these guidelines, contributors can maintain consistency and quality across the codebase.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example:  
    ```
    user-profile.js
    data-fetcher.test.js
    ```

### Imports
- Use **relative imports** for all modules.
  - Example:
    ```javascript
    import { fetchData } from './data-fetcher.js';
    ```

### Exports
- Use **named exports** instead of default exports.
  - Example:
    ```javascript
    // In user-profile.js
    export function getUserProfile(id) { ... }

    // In another file
    import { getUserProfile } from './user-profile.js';
    ```

### Commit Messages
- Follow **conventional commit** format.
  - Prefixes: `fix`, `refactor`
  - Example:
    ```
    fix: correct typo in user-profile function
    refactor: extract data-fetcher utility
    ```
- Keep commit messages concise (average ~63 characters).

## Workflows

### Code Fixing
**Trigger:** When correcting bugs or unintended behavior  
**Command:** `/fix`

1. Identify the bug or issue in the code.
2. Make the necessary code changes.
3. Write or update tests to cover the fix.
4. Commit with a message starting with `fix:`.
5. Push your changes and open a pull request.

### Refactoring
**Trigger:** When improving code structure without changing behavior  
**Command:** `/refactor`

1. Identify code that can be improved (e.g., simplify logic, extract utilities).
2. Refactor the code while ensuring existing functionality is preserved.
3. Update or add tests if needed.
4. Commit with a message starting with `refactor:`.
5. Push your changes and open a pull request.

## Testing Patterns

- Test files use the `*.test.*` naming pattern.
  - Example:  
    ```
    data-fetcher.test.js
    ```
- The testing framework is not specified; ensure tests are colocated with the code they validate.
- Write tests for all new features and bug fixes.

  ```javascript
  // Example: data-fetcher.test.js
  import { fetchData } from './data-fetcher.js';

  test('fetchData returns expected result', () => {
    const result = fetchData('input');
    expect(result).toBe('expected output');
  });
  ```

## Commands
| Command   | Purpose                                 |
|-----------|-----------------------------------------|
| /fix      | Start a bug fix workflow                |
| /refactor | Start a code refactoring workflow       |
```
