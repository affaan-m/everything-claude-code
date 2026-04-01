```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. It is designed to help contributors understand how to add new skills, agents, commands, install targets, and documentation, as well as how to maintain code quality and consistency across the codebase. The repository is JavaScript-based, with no framework detected, and emphasizes modularity, agentic capabilities, and automation workflows.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `myUtility.js`, `installTargetAdapter.js`

**Import Style**
- Use relative imports.
  - Example:
    ```js
    const utils = require('./utils');
    import { doSomething } from '../lib/doSomething';
    ```

**Export Style**
- Mixed: both CommonJS (`module.exports`) and ES6 (`export`) styles may be present.
  - Example (CommonJS):
    ```js
    module.exports = function myFunction() { ... };
    ```
  - Example (ES6):
    ```js
    export function myFunction() { ... }
    ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - Prefixes: `fix`, `feat`, `docs`, `chore`
  - Example: `feat: add new agent workflow for PRP`

---

## Workflows

### Add New Skill
**Trigger:** When introducing a new skill (workflow, agent, or capability)  
**Command:** `/add-skill`

1. Create a new `SKILL.md` file under `skills/<skill-name>/`.
2. Document the skill's purpose, usage, and integration points.
3. Optionally update `manifests/install-modules.json` or `AGENTS.md` if the skill is part of a module or agent set.
4. Commit the new skill file(s).

**Example:**
```bash
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Edit SKILL.md with purpose and usage
git add skills/myNewSkill/SKILL.md
git commit -m "feat: add myNewSkill agentic capability"
```

---

### Add or Update Agent
**Trigger:** When adding a new agent persona or updating agent configuration  
**Command:** `/add-agent`

1. Create or update agent definition markdown file under `agents/`.
2. Optionally update `AGENTS.md` to reflect the new agent.
3. If OpenCode agent, add prompt file under `.opencode/prompts/agents/` and update `.opencode/opencode.json`.

**Example:**
```bash
touch agents/myAgent.md
# Edit agent definition and configuration
git add agents/myAgent.md
git commit -m "feat: add myAgent persona"
```

---

### Add or Update Command Workflow
**Trigger:** When introducing or updating a command-driven workflow (e.g., PRP, GAN, review loop)  
**Command:** `/add-command`

1. Create or update command markdown files under `commands/`.
2. Document phases, usage, and templates in the command file.
3. Optionally update `README.md` or `AGENTS.md` to reference the new command.

---

### Add Install Target or Adapter
**Trigger:** When supporting a new IDE, platform, or tool as an installable target  
**Command:** `/add-install-target`

1. Create install scripts and documentation under a new dot-directory (e.g., `.codebuddy/` or `.gemini/`).
2. Update `manifests/install-modules.json` and relevant schema files.
3. Add or update scripts in `scripts/lib/install-targets/<target>.js`.
4. Update tests for install targets.

---

### Refactor or Promote Command to Skill
**Trigger:** When migrating command-based workflows to the skills system  
**Command:** `/promote-command-to-skill`

1. Identify legacy commands under `commands/`.
2. Move or rewrite their logic/documentation into `skills/<skill>/SKILL.md`.
3. Update `AGENTS.md`, `README.md`, and `manifests/install-modules.json` as needed.
4. Remove or deprecate the old command files.

---

### Update Hooks or Hook Logic
**Trigger:** When improving or fixing hooks for automation, CI, or developer experience  
**Command:** `/update-hook`

1. Edit `hooks/hooks.json` to update hook configuration.
2. Edit or add scripts in `scripts/hooks/*.js` or `*.sh` for hook implementation.
3. Update or add tests under `tests/hooks/`.
4. Optionally update related documentation.

---

### Dependency or CI Update
**Trigger:** When bumping dependencies, updating GitHub Actions, or addressing security advisories  
**Command:** `/update-deps`

1. Update `package.json`, `yarn.lock`, and/or `package-lock.json`.
2. Update `.github/workflows/*.yml` files.
3. Optionally update `.github/dependabot.yml`.
4. Commit with a clear dependency or CI update message.

---

### Add or Update Documentation
**Trigger:** When improving documentation, adding new guides, or updating skill docs  
**Command:** `/update-docs`

1. Edit or create markdown files under `docs/`, `skills/*/`, or root-level `*.md` files.
2. Update `WORKING-CONTEXT.md`, `README.md`, or `AGENTS.md` as needed.
3. Optionally update localized docs under `docs/zh-CN/`.

---

## Testing Patterns

- Test files use the pattern `*.test.js`.
- The testing framework is not explicitly specified; check test files for framework usage.
- Place tests in the same directory as the code or under a `tests/` directory.
- Example test file: `tests/lib/install-targets.test.js`

**Example:**
```js
// tests/myFunction.test.js
const myFunction = require('../lib/myFunction');

test('should return expected result', () => {
  expect(myFunction(2, 3)).toBe(5);
});
```

---

## Commands

| Command                     | Purpose                                                        |
|-----------------------------|----------------------------------------------------------------|
| /add-skill                  | Add a new skill (agentic capability or workflow)               |
| /add-agent                  | Add or update an agent definition or configuration             |
| /add-command                | Add or update a command-driven workflow                        |
| /add-install-target         | Add support for a new install target or adapter                |
| /promote-command-to-skill   | Migrate a command workflow to the skills system                |
| /update-hook                | Update or improve hook logic for automation or CI              |
| /update-deps                | Update dependencies or CI workflow files                       |
| /update-docs                | Add or update documentation and guides                         |
```
