```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript repository. You'll learn how to structure code, document skills and agents, contribute new features, update documentation, and maintain CI/CD processes using clear, repeatable steps and standardized commands.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files:  
  Example: `mySkill.js`, `agentManager.js`

**Import Style**
- Use relative imports for modules within the project:
  ```js
  // Importing a utility from the same directory
  import { doSomething } from './utils.js';
  ```

**Export Style**
- Mixed usage of named and default exports:
  ```js
  // Named export
  export function processAgent() { ... }

  // Default export
  export default function main() { ... }
  ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - Prefixes: `fix:`, `feat:`, `docs:`, `chore:`
  - Example:  
    ```
    feat: add support for dynamic agent loading
    ```

---

## Workflows

### Add New Skill or Agent
**Trigger:** When introducing a new skill or agent to the project  
**Command:** `/add-skill`

1. Create or update a `SKILL.md` file in one of:
    - `skills/`
    - `.agents/skills/`
    - `.claude/skills/`
2. Add or update agent definition in `agents/` or `.agents/agents/`.
3. If the new skill/agent requires additional modules, update `manifests/install-modules.json`.
4. Update `AGENTS.md` and/or `README.md` to document the new addition.
5. Add or update related documentation in `docs/` or `examples/`.

**Example:**
```markdown
# skills/myNewSkill/SKILL.md

## Description
Describes what this skill does...

## Usage
...
```

---

### Add or Update Command Workflow
**Trigger:** When adding a new workflow or command for agents, PRP, or orchestration  
**Command:** `/add-command`

1. Create or update command markdown files in `commands/`.
2. Update or create related documentation in `.claude/commands/`.
3. Update or create related artifacts in `.claude/PRPs/` or other workflow directories.
4. Address review feedback and iterate on command scripts.

**Example:**
```markdown
# commands/autoAssign.md

## Command: autoAssign
...
```

---

### Multi-file Feature or Refactor
**Trigger:** When developing a new feature or performing a major refactor  
**Command:** `/feature`

1. Edit or create multiple `SKILL.md` and agent files as needed.
2. Update `manifests/install-modules.json` and any related schemas.
3. Update documentation: `README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, and `docs/`.
4. Update or add scripts for orchestration or installation in `scripts/`.
5. Update or add tests for new or changed logic.

---

### Documentation Update
**Trigger:** When clarifying, syncing, or expanding documentation  
**Command:** `/docs`

1. Edit or create markdown files in `docs/`, `README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`.
2. Update or add `.claude/commands/*.md` or `.claude/skills/*/SKILL.md` for conventions.
3. Sync guidance across languages (e.g., `README.zh-CN.md`, `docs/zh-CN/`).

---

### CI/CD or Hook Update
**Trigger:** When improving or fixing CI, release, or hook automation  
**Command:** `/ci-update`

1. Edit or create `.github/workflows/*.yml` files for CI/CD.
2. Edit `hooks/hooks.json` and related hook scripts in `scripts/hooks/`.
3. Update or add tests for hook/CI logic in `tests/hooks/`.
4. Update lockfiles (`package-lock.json`, `yarn.lock`) or schemas if needed.

---

## Testing Patterns

- Test files use the pattern: `*.test.js`
- Testing framework is not specified; check for test runner in project scripts.
- Place tests in `tests/` or alongside source files.
- Example test file:
  ```js
  // tests/mySkill.test.js
  import { mySkill } from '../skills/mySkill.js';

  test('mySkill returns expected output', () => {
    expect(mySkill('input')).toBe('expected output');
  });
  ```

---

## Commands

| Command      | Purpose                                                        |
|--------------|----------------------------------------------------------------|
| /add-skill   | Add a new skill or agent, including documentation and config   |
| /add-command | Add or update a command workflow or orchestration script       |
| /feature     | Implement or refactor a multi-file feature                     |
| /docs        | Update or expand documentation                                 |
| /ci-update   | Update CI/CD workflows or managed hooks                        |
```
