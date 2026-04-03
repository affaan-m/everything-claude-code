```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
The `everything-claude-code` repository is a TypeScript codebase focused on modular, convention-driven development without reliance on a specific framework. It emphasizes clear, maintainable code and structured workflows for extending the ECC (everything-claude-code-conventions) bundle with new tools, skills, identity definitions, and commands.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

### Import Style
- Use **relative imports** for internal modules.
  ```typescript
  import { myFunction } from './utils';
  ```

### Export Style
- Use **named exports** for all modules.
  ```typescript
  // Good
  export function doSomething() { ... }

  // Avoid default exports
  // export default function() { ... }
  ```

### Commit Messages
- Follow **conventional commit** style.
- Use the `feat` prefix for new features.
  - Example: `feat: add user authentication module`

## Workflows

### Add ECC Bundle Component
**Trigger:** When someone wants to extend the ECC bundle with a new convention, tool, skill, or command.  
**Command:** `/add-ecc-bundle-component`

1. **Identify** the type of component to add (tool, skill, identity, command).
2. **Create or update** the relevant file in the appropriate directory:
    - Tools: `.claude/ecc-tools.json`
    - Skills: `.claude/skills/everything-claude-code/SKILL.md` or `.agents/skills/everything-claude-code/SKILL.md`
    - Identity: `.claude/identity.json`
    - Commands: `.claude/commands/*.md`
3. **Commit** the changes with a message indicating the addition to the ECC bundle.
    - Example: `feat: add new skill to ECC bundle`
4. **Push** your changes and open a pull request if required.

**Files Involved:**
- `.claude/ecc-tools.json`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/identity.json`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`

#### Example: Adding a New Skill

1. Create a new skill file: `.claude/skills/everything-claude-code/myNewSkill.md`
2. Add documentation and usage details.
3. Commit:
   ```
   feat: add myNewSkill to ECC bundle
   ```
4. Push and submit for review.

## Testing Patterns

- **Test files** use the pattern: `*.test.*`
  - Example: `userProfile.test.ts`
- **Testing framework** is not explicitly defined; follow the existing test file structure.
- Place tests alongside the modules they test or in a dedicated `tests/` directory if present.

```typescript
// Example test file: userProfile.test.ts
import { getUserProfile } from './userProfile';

describe('getUserProfile', () => {
  it('returns correct profile data', () => {
    // test implementation
  });
});
```

## Commands

| Command                    | Purpose                                                         |
|----------------------------|-----------------------------------------------------------------|
| /add-ecc-bundle-component  | Add a new tool, skill, identity, or command to the ECC bundle   |

```