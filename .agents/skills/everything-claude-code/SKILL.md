```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the core development patterns, coding conventions, and workflows used in the `everything-claude-code` TypeScript repository. It provides guidance for contributing new components, maintaining code style consistency, and understanding the repository's structure and automation.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

### Imports
- Use **relative import paths** for modules within the repository.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

### Exports
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }
    ```

### Commit Messages
- Follow **conventional commit** style.
- Use the `feat` prefix for new features.
  - Example:
    ```
    feat: add user authentication module with JWT support
    ```

## Workflows

### add-ecc-bundle-component
**Trigger:** When you want to extend the ECC bundle with a new standardized component (e.g., tools, skills, agent skills, identity, or commands).  
**Command:** `/add-ecc-bundle-component`

1. **Create or update** a file in the relevant ECC bundle directory:
    - `.claude/ecc-tools.json`
    - `.claude/skills/everything-claude-code/SKILL.md`
    - `.agents/skills/everything-claude-code/SKILL.md`
    - `.claude/identity.json`
    - `.claude/commands/feature-development.md`
    - `.claude/commands/add-ecc-bundle-component.md`
2. **Commit** the new or updated file with a message referencing the ECC bundle addition.
    - Example commit message:
      ```
      feat: add new agent skill to ECC bundle
      ```
3. **(Optional)** Use the `/add-ecc-bundle-component` command to standardize or automate the process.

#### Example: Adding a New Skill
1. Create a new skill markdown file:
    - `.claude/skills/everything-claude-code/SKILL.md`
2. Document the skill according to the conventions in this file.
3. Commit your changes:
    ```
    feat: add SKILL.md for new agent skill
    ```

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `userProfile.test.ts`).
- **Testing framework** is not explicitly specified; follow repository conventions or clarify with maintainers.
- Place tests alongside the modules they test or in a dedicated `__tests__` directory if present.

#### Example Test File
```typescript
// userProfile.test.ts
import { getUserProfile } from './userProfile';

describe('getUserProfile', () => {
  it('should return user data for a valid ID', () => {
    // test implementation
  });
});
```

## Commands

| Command                    | Purpose                                                      |
|----------------------------|--------------------------------------------------------------|
| /add-ecc-bundle-component  | Add a new component to the ECC bundle (tools, skills, etc.)  |

```