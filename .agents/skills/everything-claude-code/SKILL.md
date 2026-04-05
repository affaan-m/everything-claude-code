```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the core development conventions and collaborative workflows for the `everything-claude-code` repository. The codebase is written in TypeScript and focuses on modular skill documentation, with each skill encapsulated in its own directory and described in a `SKILL.md` file. The repository emphasizes clear commit practices, consistent code style, and structured workflows for adding, updating, and fixing skills.

## Coding Conventions

- **Language:** TypeScript
- **Framework:** None detected
- **File Naming:** Use PascalCase for all file names.
  - Example: `MySkill.ts`, `SkillUtils.ts`
- **Import Style:** Always use relative imports.
  ```typescript
  import { SkillHelper } from './SkillHelper';
  ```
- **Export Style:** Use named exports (avoid default exports).
  ```typescript
  // Good
  export function doSomething() { ... }
  export const SKILL_NAME = 'ExampleSkill';

  // Avoid
  // export default function() { ... }
  ```
- **Commit Messages:** Follow conventional commit style.
  - Prefixes: `fix`, `feat`
  - Example: `fix: correct typo in SkillHelper`
  - Keep messages concise (~56 characters on average).

## Workflows

### Add New Skill Bundle
**Trigger:** When introducing new knowledge areas or best practices as skills.  
**Command:** `/add-skill-bundle`

1. Create new subdirectories under `skills/` for each new skill.
2. Add a `SKILL.md` file in each new subdirectory with content and examples.
3. Commit all new `SKILL.md` files together, grouped by theme or topic.

**Example:**
```
skills/
  TypeSafety/
    SKILL.md
  AsyncPatterns/
    SKILL.md
```
Commit message:
```
feat: add TypeSafety and AsyncPatterns skill bundle
```

---

### Batch Review Fixes Across Multiple Skills
**Trigger:** When applying review feedback or bugfixes to multiple skills at once.  
**Command:** `/batch-fix-skills`

1. Collect review feedback for multiple skills.
2. Edit each affected `SKILL.md` file to address the feedback.
3. Commit all modified `SKILL.md` files together, with a detailed message summarizing the changes.

**Example:**
```
skills/TypeSafety/SKILL.md
skills/AsyncPatterns/SKILL.md
```
Commit message:
```
fix: address review feedback in TypeSafety and AsyncPatterns
```

---

### Single Skill Targeted Fix
**Trigger:** When correcting or clarifying a single skill after review or bug report.  
**Command:** `/fix-skill`

1. Identify the specific issue in one `SKILL.md` file.
2. Edit the file to fix the problem.
3. Commit the change with a concise message referencing the skill and fix.

**Example:**
```
skills/AsyncPatterns/SKILL.md
```
Commit message:
```
fix: clarify async/await example in AsyncPatterns
```

## Testing Patterns

- **Test File Naming:** Test files follow the pattern `*.test.*`
  - Example: `SkillHelper.test.ts`
- **Testing Framework:** Not explicitly detected; follow standard TypeScript test practices.
- **Test Placement:** Place tests alongside or near the code they verify.

**Example:**
```typescript
// SkillHelper.test.ts
import { SkillHelper } from './SkillHelper';

describe('SkillHelper', () => {
  it('should return correct skill name', () => {
    expect(SkillHelper.getName()).toBe('ExampleSkill');
  });
});
```

## Commands

| Command            | Purpose                                                         |
|--------------------|-----------------------------------------------------------------|
| /add-skill-bundle  | Add one or more new skills as a themed bundle                   |
| /batch-fix-skills  | Apply review feedback or bugfixes to multiple skills at once    |
| /fix-skill         | Make a focused fix or clarification to a single skill           |
```
