```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The codebase is written in TypeScript and organizes technical skills as modular bundles, each with its own documentation. The repository emphasizes clear commit messages, structured skill documentation, and collaborative review processes.

## Coding Conventions

**File Naming**
- Use PascalCase for all file names.
  - Example: `SkillParser.ts`, `UserProfile.ts`

**Import Style**
- Use relative imports for modules within the repository.
  - Example:
    ```typescript
    import { SkillParser } from './SkillParser';
    ```

**Export Style**
- Use named exports for all modules.
  - Example:
    ```typescript
    export function parseSkill(data: string): Skill { ... }
    export const SKILL_VERSION = '1.0.0';
    ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes like `fix` and `feat`.
- Example:
  ```
  feat: add SkillParser for structured skill extraction
  fix: correct export style in UserProfile
  ```

## Workflows

### Add New Skill Bundle
**Trigger:** When introducing new technical skills or knowledge areas to the repository  
**Command:** `/new-skill-bundle`

1. Create a new directory under `skills/` for each new skill.
2. Add a `SKILL.md` file in each new skill directory with structured content describing the skill.
3. Commit all new `SKILL.md` files together as a bundle.
   - Example commit message:
     ```
     feat: add new skill bundles for TypeScript and Testing
     ```

### Batch Review Feedback Fixes
**Trigger:** When multiple skills receive review feedback that needs to be addressed together  
**Command:** `/batch-fix-review`

1. Collect all review feedback for each affected skill.
2. Edit each relevant `SKILL.md` file under `skills/*/` to address the feedback.
3. Commit all modified `SKILL.md` files together with a detailed message summarizing the changes.
   - Example commit message:
     ```
     fix: address review feedback for TypeScript and Testing skills
     ```

## Testing Patterns

- Test files use the pattern `*.test.*` (e.g., `SkillParser.test.ts`).
- The testing framework is currently unknown; check existing test files for conventions.
- Place test files alongside the modules they test or in a dedicated `__tests__` directory.

**Example Test File:**
```typescript
import { parseSkill } from './SkillParser';

describe('parseSkill', () => {
  it('should parse valid skill data', () => {
    const data = '...';
    const skill = parseSkill(data);
    expect(skill).toBeDefined();
  });
});
```

## Commands

| Command             | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| /new-skill-bundle   | Start the process to add a new set of skill bundles            |
| /batch-fix-review   | Apply review feedback across multiple SKILL.md files at once   |
```
