```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, workflows, and coding conventions used in the `everything-claude-code` repository. It covers how to add or update skills, commands, install targets, hooks, and documentation, as well as the repository's JavaScript coding style and testing patterns. This guide is intended for contributors looking to maintain consistency and efficiency when working within this codebase.

## Coding Conventions

- **Language:** JavaScript (no framework detected)
- **File Naming:** Use `camelCase` for JavaScript files and folders.
  - Example: `mySkill.js`, `installTarget.js`
- **Import Style:** Use relative imports.
  - Example:
    ```js
    import myUtil from './utils/myUtil.js';
    ```
- **Export Style:** Mixed (both default and named exports are used).
  - Example:
    ```js
    // Named export
    export function doSomething() { ... }

    // Default export
    export default MyComponent;
    ```
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes like `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add support for new install target`
- **Documentation:** Each skill or command should have a `SKILL.md` or markdown documentation file in its directory.

## Workflows

### Add or Update a Skill
**Trigger:** When adding or updating a skill for agents or workflows  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/[skill-name]/` or `.agents/skills/[skill-name]/`.
2. Optionally add or update related reference files (e.g., `references/*.md`, `assets/*.py`).
3. Register the skill in `manifests/install-modules.json` and/or `manifests/install-components.json`.
4. Update `AGENTS.md`, `README.md`, and `docs/zh-CN/AGENTS.md` as needed.
5. If the skill is agent-facing, update `.agents/skills/[skill-name]/SKILL.md`.

**Example:**
```json
// manifests/install-modules.json
{
  "skills": [
    "myNewSkill"
  ]
}
```

---

### Add or Update a Command Workflow
**Trigger:** When introducing or refining a workflow command  
**Command:** `/add-command`

1. Create or update a command markdown file in `commands/` or `.claude/commands/`.
2. Iterate based on review feedback (fixes, improvements, removal of external links, etc.).
3. Update related documentation or references if needed.

**Example:**
```markdown
// commands/myCommand.md
# My Command
Description and usage...
```

---

### Refactor Skill or Agent Structure
**Trigger:** When reorganizing skills, merging/splitting logic, or extracting shared code  
**Command:** `/refactor-skill`

1. Edit multiple `SKILL.md` files in `skills/` and/or `.agents/skills/`.
2. Update `AGENTS.md`, `README.md`, `README.zh-CN.md`, and `docs/zh-CN/*` as needed.
3. Update `manifests/install-modules.json` or related manifests.
4. Remove or merge obsolete command files.

---

### Add or Update Install Target
**Trigger:** When supporting a new platform or updating install logic  
**Command:** `/add-install-target`

1. Add or update install scripts and documentation under a dot-directory (e.g., `.codebuddy/`, `.gemini/`).
2. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
3. Update or create scripts in `scripts/lib/install-targets/[target].js`.
4. Update `registry.js` and `install-manifests.js` as needed.
5. Add or update tests in `tests/lib/install-targets.test.js`.

**Example:**
```js
// scripts/lib/install-targets/codeBuddy.js
export function installCodeBuddy() { ... }
```

---

### Update Hooks and Automation
**Trigger:** When improving or fixing hooks, audit logs, or CI/CD automation  
**Command:** `/update-hook`

1. Edit `hooks/hooks.json` and/or add/update `scripts/hooks/*.js`.
2. Update or add related test files in `tests/hooks/` or `tests/scripts/`.
3. Edit `.github/workflows/*.yml` for CI/CD changes.
4. Update `package.json` or related config if needed.

---

### Documentation Sync and Guidance Update
**Trigger:** When updating repo guidance, syncing documentation, or clarifying workflows  
**Command:** `/update-docs`

1. Edit one or more of `AGENTS.md`, `README.md`, `README.zh-CN.md`, `WORKING-CONTEXT.md`, and `docs/zh-CN/*`.
2. Update or add `.claude-plugin/README.md`, `.codex-plugin/README.md`, or `the-shortform-guide.md` as needed.
3. Optionally update `package.json` or `scripts/ci/catalog.js` if documentation affects tooling.

---

## Testing Patterns

- **Test Files:** Use the `*.test.js` naming convention.
  - Example: `mySkill.test.js`
- **Framework:** Not explicitly detected; follow standard JavaScript testing practices.
- **Location:** Tests are typically located in `tests/` directories, mirroring the structure of the code they test.
- **Example:**
  ```js
  // tests/mySkill.test.js
  import { mySkill } from '../skills/mySkill.js';

  test('mySkill does something', () => {
    expect(mySkill()).toBe(true);
  });
  ```

## Commands

| Command            | Purpose                                                |
|--------------------|--------------------------------------------------------|
| /add-skill         | Add or update a skill and register it in manifests     |
| /add-command       | Add or update a command workflow                       |
| /refactor-skill    | Refactor skill or agent structure                      |
| /add-install-target| Add or update an install target integration            |
| /update-hook       | Update hooks, automation, or CI/CD workflows           |
| /update-docs       | Sync or update documentation and repo guidance         |
```
