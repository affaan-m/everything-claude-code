```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the development conventions and workflows used in the `everything-claude-code` TypeScript repository. It covers file organization, code style, commit patterns, and the process for adding new ECC (everything-claude-code-conventions) bundle components. By following these guidelines, contributors can maintain consistency and streamline collaboration.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

### Import Style
- Use **relative imports** for referencing modules.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

### Export Style
- Use **named exports** instead of default exports.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }
    ```

    ```typescript
    // usage
    import { myFunction } from './utils';
    ```

### Commit Patterns
- Follow **conventional commits** with the `feat` prefix for new features.
  - Example:
    ```
    feat: add ECC bundle component for agent identity management
    ```
- Average commit message length: ~94 characters.

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to add a new ECC bundle component (tool, skill, agent, identity, or command) to the repository.  
**Command:** `/add-ecc-bundle-component`

1. **Create or update** a file in the relevant subdirectory:
    - For tools: `.claude/ecc-tools.json`
    - For skills: `.claude/skills/everything-claude-code/SKILL.md` or `.agents/skills/everything-claude-code/SKILL.md`
    - For identity: `.claude/identity.json`
    - For commands: `.claude/commands/feature-development.md`, `.claude/commands/add-ecc-bundle-component.md`
2. **Commit** the file with a message referencing the ECC bundle.
    - Example:
      ```
      feat: add new agent skill to ECC bundle
      ```
3. **Repeat** for each new component type as needed.

#### Example: Adding a New Skill
```bash
# Create the SKILL.md file for the new skill
touch .claude/skills/everything-claude-code/SKILL.md

# Edit the file with the skill documentation

# Commit your changes
git add .claude/skills/everything-claude-code/SKILL.md
git commit -m "feat: add new skill documentation to ECC bundle"
git push
```

## Testing Patterns

- **Test files** follow the `*.test.*` pattern (e.g., `userProfile.test.ts`).
- **Testing framework** is not explicitly specified.
- Place test files alongside the modules they test or in a dedicated test directory.

#### Example Test File
```typescript
// userProfile.test.ts
import { getUserProfile } from './userProfile';

describe('getUserProfile', () => {
  it('should return user data for valid ID', () => {
    // test implementation
  });
});
```

## Commands

| Command                    | Purpose                                               |
|----------------------------|-------------------------------------------------------|
| /add-ecc-bundle-component  | Add a new ECC bundle component (tool, skill, etc.)    |
```
