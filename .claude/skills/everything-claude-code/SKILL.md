```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the core development patterns and conventions used in the `everything-claude-code` TypeScript repository. It covers file naming, import/export styles, commit conventions, and the primary workflow for extending the ECC bundle with new skills, identities, or commands. Use this guide to ensure consistency and best practices when contributing to the codebase.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

### Import Style
- Use **relative imports** for referencing modules within the repository.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }
    ```

### Commit Messages
- Follow the **Conventional Commits** standard.
- Use the `feat` prefix for new features.
  - Example:  
    ```
    feat: add user authentication to api layer
    ```

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to add a new skill, identity, or command to the ECC bundle.  
**Command:** `/add-ecc-bundle-component`

1. **Create or update** a file in one of the following directories:
    - `.claude/skills/everything-claude-code/`
    - `.agents/skills/everything-claude-code/`
    - `.claude/commands/`
    - `.claude/identity.json`
2. **Write or update** the content for your new skill, identity, or command.
3. **Commit** your changes with a message referencing the ECC bundle, following the conventional commit pattern.
    - Example:
      ```
      feat: add SKILL.md for everything-claude-code ECC bundle
      ```
4. **Push** your changes and open a pull request if required.

#### Example: Adding a New Skill
```bash
# Create a new skill file
touch .claude/skills/everything-claude-code/newSkill.md

# Edit the file with your skill documentation

# Commit your changes
git add .claude/skills/everything-claude-code/newSkill.md
git commit -m "feat: add newSkill to ECC bundle"
git push
```

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `userProfile.test.ts`).
- **Testing framework** is not explicitly specified; follow standard TypeScript testing practices.
- Place test files alongside the modules they test or in a dedicated test directory.

#### Example Test File
```typescript
// userProfile.test.ts
import { getUserProfile } from './userProfile';

describe('getUserProfile', () => {
  it('returns user data for valid ID', () => {
    // test implementation
  });
});
```

## Commands

| Command                   | Purpose                                                        |
|---------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-component | Add a new skill, identity, or command to the ECC bundle        |
```
