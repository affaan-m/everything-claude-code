```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This repository, `everything-claude-code`, is a TypeScript codebase designed to be modular and extensible, with a focus on clear, maintainable patterns. It is not tied to any specific framework, and emphasizes conventional commits, consistent code style, and structured workflows for adding new capabilities to the ECC (everything-claude-code-conventions) bundle.

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for filenames.  
  _Example:_  
  ```
  myFeatureFile.ts
  anotherUtility.ts
  ```

- **Import Style:**  
  Use relative imports for modules within the repository.  
  _Example:_  
  ```typescript
  import { myFunction } from './utils/myFunction'
  ```

- **Export Style:**  
  Use named exports only.  
  _Example:_  
  ```typescript
  // utils/myFunction.ts
  export function myFunction() { ... }
  ```

- **Commit Messages:**  
  Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.  
  - Use the `feat` prefix for new features.  
  - Commit messages are descriptive, averaging around 94 characters.  
  _Example:_  
  ```
  feat: add user authentication to the login component
  ```

## Workflows

### add-ecc-bundle-component
**Trigger:** When you want to extend the ECC bundle with a new capability or configuration (e.g., tools, skills, identity, agents, or commands).  
**Command:** `/add-ecc-bundle-component`

**Step-by-step instructions:**

1. **Create or update a relevant file** in the ECC bundle directories.  
   - For tools: `.claude/ecc-tools.json`
   - For skills: `.claude/skills/everything-claude-code/SKILL.md` or `.agents/skills/everything-claude-code/SKILL.md`
   - For identity: `.claude/identity.json`
   - For commands: `.claude/commands/feature-development.md`, `.claude/commands/add-ecc-bundle-component.md`
2. **Edit the file** to add your new component, configuration, or documentation as needed.
3. **Commit your changes** with a message referencing the ECC bundle, following the conventional commit style.  
   _Example:_  
   ```
   feat: add new agent skill to ECC bundle
   ```
4. **Push your changes** and open a pull request if required by your workflow.

**Files involved:**
- `.claude/ecc-tools.json`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/identity.json`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`

## Testing Patterns

- **Test File Naming:**  
  Test files follow the `*.test.*` pattern.  
  _Example:_  
  ```
  utils.test.ts
  featureHandler.test.ts
  ```
- **Testing Framework:**  
  The specific testing framework is not detected, but standard TypeScript testing patterns apply.

- **Example Test File Structure:**  
  ```typescript
  // utils.test.ts
  import { myFunction } from './utils/myFunction'

  describe('myFunction', () => {
    it('should return expected result', () => {
      expect(myFunction()).toBe('expected')
    })
  })
  ```

## Commands

| Command                    | Purpose                                                                 |
|----------------------------|-------------------------------------------------------------------------|
| /add-ecc-bundle-component  | Add a new component or configuration to the ECC bundle (tools, skills, etc.) |
```
