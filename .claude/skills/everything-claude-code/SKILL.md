```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The codebase is primarily JavaScript (no framework), with a modular architecture supporting skills, agents, commands, and automation for AI-driven workflows. This guide will help contributors maintain consistency and efficiency when adding features, updating documentation, or refactoring code.

## Coding Conventions

**File Naming**
- Use `camelCase` for file names.
  - Example: `mySkill.js`, `agentDefinition.md`

**Import Style**
- Use relative imports for modules.
  - Example:
    ```js
    import helper from './utils/helper.js';
    ```

**Export Style**
- Mixed: both default and named exports are used.
  - Example:
    ```js
    // Named export
    export function processData(data) { ... }

    // Default export
    export default function main() { ... }
    ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes: `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add support for new agent registration`

## Workflows

### Add New Skill
**Trigger:** When introducing a new skill or workflow capability  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/`, `.agents/skills/`, or `.claude/skills/`.
2. Optionally update manifests or configuration files to register the skill.
3. Update documentation files (e.g., `AGENTS.md`, `README.md`) if the skill is user-facing.

**Example:**
```markdown
# My New Skill

## Description
Briefly describe what this skill does.

## Usage
Instructions or code snippets for using the skill.
```

---

### Add or Update Agent
**Trigger:** When adding or updating an agent definition  
**Command:** `/add-agent`

1. Create or update agent definition in `agents/` or `.opencode/prompts/agents/`.
2. Update agent registry/configuration files (e.g., `.opencode/opencode.json`).
3. Update `AGENTS.md` or related docs to reflect the new/updated agent.

---

### Add or Update Command
**Trigger:** When introducing or updating a workflow command  
**Command:** `/add-command`

1. Create or update command markdown file in `commands/` or `.claude/commands/`.
2. If part of a workflow, update related documentation or manifest files.
3. Address review feedback and iterate as needed.

---

### Feature Bundle or Workflow Release
**Trigger:** When releasing a new workflow, pipeline, or major feature set  
**Command:** `/release-workflow`

1. Add or update multiple `SKILL.md` files in `skills/` or `.agents/skills/`.
2. Add or update agent definitions in `agents/`.
3. Add or update commands in `commands/`.
4. Update documentation (`README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, etc.).
5. Update manifests (e.g., `manifests/install-modules.json`) and test files if needed.

---

### Refactor or Collapse Commands to Skills
**Trigger:** When modernizing or unifying command/skill architecture  
**Command:** `/refactor-to-skill`

1. Move logic from `commands/` to `skills/` as `SKILL.md`.
2. Update or remove legacy command files.
3. Update documentation and manifests to reference the new skill.
4. Update test files if necessary.

---

### Update Hooks or Automation Scripts
**Trigger:** When changing hook or automation script behavior  
**Command:** `/update-hook`

1. Edit `hooks/hooks.json` to update hook logic or add new hooks.
2. Update or add supporting scripts in `scripts/hooks/`.
3. Update or add test files in `tests/hooks/` or `tests/scripts/`.
4. Update documentation if the hook behavior is user-facing.

---

### Add or Update Install Target
**Trigger:** When supporting a new installation environment or updating install logic  
**Command:** `/add-install-target`

1. Add or update install scripts in a dedicated directory (e.g., `.codebuddy/`, `.gemini/`).
2. Update `manifests/install-modules.json` and relevant schema files.
3. Update `scripts/lib/install-manifests.js` and `install-targets/` as needed.
4. Add or update tests for the new install target.

---

### Documentation Update or Sync
**Trigger:** When updating guidance, troubleshooting, or syncing docs with new features  
**Command:** `/update-docs`

1. Edit or add documentation files (`README.md`, `WORKING-CONTEXT.md`, `docs/zh-CN/*.md`, etc.).
2. Update or add troubleshooting and guidance files.
3. Sync documentation across language variants if present.

---

## Testing Patterns

- Test files follow the pattern: `*.test.js`
- Testing framework is not explicitly specified; use standard Node.js testing or your preferred framework.
- Place tests in relevant directories (e.g., `tests/hooks/`, `tests/scripts/`).
- Example test file:
  ```js
  // utils.test.js
  import { processData } from './utils.js';

  test('processData returns expected output', () => {
    expect(processData([1, 2, 3])).toEqual([2, 3, 4]);
  });
  ```

## Commands

| Command              | Purpose                                                         |
|----------------------|-----------------------------------------------------------------|
| /add-skill           | Add a new skill, including documentation and registration       |
| /add-agent           | Add or update an agent definition and register it               |
| /add-command         | Add or update a workflow/automation command                     |
| /release-workflow    | Release a new workflow or feature bundle                        |
| /refactor-to-skill   | Refactor legacy commands into skills                            |
| /update-hook         | Update hook configuration and automation scripts                |
| /add-install-target  | Add or update an install target for new platforms/environments  |
| /update-docs         | Update or synchronize documentation files                       |
```
