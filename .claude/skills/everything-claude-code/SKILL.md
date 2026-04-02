```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The project is JavaScript-based, with a modular, skill-oriented structure, and emphasizes clear documentation, conventional commits, and maintainable code. This guide will help contributors add, update, and maintain skills, hooks, CI workflows, and documentation consistently across the codebase.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `mySkill.js`, `agentManager.js`

**Import Style**
- Use relative imports for modules within the project.
  - Example:
    ```js
    import { doSomething } from './utils/doSomething.js';
    ```

**Export Style**
- Mixed usage: both named and default exports are present.
  - Named export:
    ```js
    export function myFunction() { ... }
    ```
  - Default export:
    ```js
    export default myFunction;
    ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes like `fix`, `feat`, and `docs`.
  - Example: `feat: add support for new agent skill`

**Documentation**
- Each skill resides in its own directory under `skills/<skill-name>/` with a `SKILL.md` file describing its purpose and usage.

## Workflows

### Add New Skill
**Trigger:** When someone wants to introduce a new skill (feature, domain, or agent capability).
**Command:** `/add-skill`

1. Create a new `SKILL.md` in `skills/<skill-name>/`.
2. Optionally add implementation files (e.g., scripts, commands) in the skill directory.
3. Update `AGENTS.md` and/or `README.md` to reference the new skill.
4. Update `manifests/install-modules.json` if the skill is installable.
5. Add or update relevant test files.

**Example:**
```bash
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Add implementation: skills/myNewSkill/myNewSkill.js
# Update docs and manifests as needed
```

---

### Harden or Update Skill
**Trigger:** When someone wants to fix, clarify, or improve an existing skill.
**Command:** `/harden-skill`

1. Edit `SKILL.md` in `skills/<skill-name>/`.
2. Optionally update implementation files in the skill directory.
3. Update `AGENTS.md` and/or `README.md` if needed.
4. Update `manifests/install-modules.json` if installability changes.
5. Update or add relevant tests.

---

### Add or Harden Hook
**Trigger:** When someone wants to introduce or improve a git/project hook (pre-commit, pre-push, etc).
**Command:** `/add-hook`

1. Add or edit hook implementation in `scripts/hooks/`.
2. Update `hooks/hooks.json` to register or document the hook.
3. Update `hooks/README.md` if needed.
4. Add or update corresponding test in `tests/hooks/`.
5. Update `skills/git-workflow/SKILL.md` if workflow changes.

---

### Merge or Consolidate Skills
**Trigger:** When someone wants to reduce duplication by merging two or more skills.
**Command:** `/merge-skills`

1. Remove or archive old skill directories/files.
2. Update or create consolidated `SKILL.md` and implementation files.
3. Update all references to old skills in docs, manifests, translations, and platform mirrors.
4. Update `AGENTS.md`, `README.md`, and `manifests/install-modules.json`.
5. Update or add relevant tests.

---

### Add or Update MCP Server
**Trigger:** When someone wants to register a new MCP server or update its configuration.
**Command:** `/add-mcp-server`

1. Edit or add entry in `mcp-configs/mcp-servers.json`.
2. Optionally update `README.md` or `AGENTS.md` if user-facing.
3. Optionally update or add tests.

---

### Add or Harden CI Workflow
**Trigger:** When someone wants to add, update, or secure CI/CD pipelines.
**Command:** `/update-ci`

1. Edit or add `.github/workflows/*.yml` files.
2. Optionally update `CLAUDE.md`, `README.md`, or `CONTRIBUTING.md`.
3. Update or add relevant test scripts.

---

### Add or Update Command Documentation
**Trigger:** When someone wants to document or update documentation for a CLI/project command.
**Command:** `/update-command-doc`

1. Edit or add `commands/*.md`.
2. Edit or add `docs/<lang>/commands/*.md`.
3. Optionally update `README.md` or `AGENTS.md`.

---

## Testing Patterns

- Test files use the pattern `*.test.js`.
- The testing framework is not specified; check existing test files for conventions.
- Place tests alongside or within a `tests/` directory corresponding to the feature or hook.
- Example test file: `tests/mySkill/mySkill.test.js`

**Example:**
```js
// tests/mySkill/mySkill.test.js
import { myFunction } from '../../skills/mySkill/mySkill.js';

test('myFunction returns expected result', () => {
  expect(myFunction(2)).toBe(4);
});
```

## Commands

| Command              | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| /add-skill           | Add a new skill, including docs and registration               |
| /harden-skill        | Improve, clarify, or fix an existing skill                     |
| /add-hook            | Add or improve a git/project hook                              |
| /merge-skills        | Merge/consolidate overlapping skills                           |
| /add-mcp-server      | Add or update MCP server configuration                         |
| /update-ci           | Add or harden CI/CD workflow                                  |
| /update-command-doc  | Add or update documentation for project commands               |
```
