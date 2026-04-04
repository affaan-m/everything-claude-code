```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions for the `everything-claude-code` TypeScript repository. It covers file naming, import/export styles, commit conventions, testing patterns, and the main workflow for extending the ECC (everything-claude-code-conventions) bundle with new components like skills, agent skills, identities, or commands.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

### Import Style
- Use **relative imports** for referencing other files or modules.
  ```typescript
  import { myFunction } from './utils';
  ```

### Export Style
- Use **named exports** for all exported functions, types, or constants.
  ```typescript
  // utils.ts
  export function myFunction() { ... }
  export const MY_CONST = 42;
  ```

### Commit Messages
- Follow **conventional commit** format.
- Use the `feat` prefix for new features or components.
  - Example: `feat: add user authentication module`
- Average commit message length is around 94 characters.

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to extend the ECC bundle with a new skill, agent skill, identity, or command.  
**Command:** `/add-ecc-bundle-component`

1. Decide what you want to add: a skill, agent skill, identity, or command.
2. Create or update the relevant file in one of these directories:
    - `.claude/skills/everything-claude-code/`
    - `.agents/skills/everything-claude-code/`
    - `.claude/commands/`
    - `.claude/identity.json`
    - `.claude/ecc-tools.json`
3. If adding a skill or agent skill, create or update a `SKILL.md` in the appropriate directory.
4. Commit your changes using a conventional commit message referencing the ECC bundle.
    - Example: `feat: add new agent skill to ECC bundle`
5. (Optional) Use the `/add-ecc-bundle-component` command to document or automate the addition.

**Files Involved:**
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`

#### Example: Adding a New Skill

```bash
# Create the skill file
touch .claude/skills/everything-claude-code/myNewSkill.ts

# Document the skill
touch .claude/skills/everything-claude-code/SKILL.md

# Commit your changes
git add .claude/skills/everything-claude-code/*
git commit -m "feat: add myNewSkill to ECC bundle"
```

## Testing Patterns

- Test files use the pattern: `*.test.*`
  - Example: `userProfile.test.ts`
- Testing framework is **unknown** (not detected in this analysis).
- Place test files alongside the modules they test or in a dedicated test directory.

## Commands

| Command                     | Purpose                                                                 |
|-----------------------------|-------------------------------------------------------------------------|
| /add-ecc-bundle-component   | Add a new skill, agent skill, identity, or command to the ECC bundle    |

```