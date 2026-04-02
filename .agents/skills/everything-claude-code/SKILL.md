```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and common workflows used in the `everything-claude-code` repository. The repository is primarily JavaScript-based, with no specific framework, and focuses on modular skills, agentic workflows, command extensions, integration targets, and robust documentation practices. This guide will help you contribute effectively by following established conventions and workflows.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `installManifests.js`, `addSkillCommand.js`

**Import Style**
- Use relative imports for internal modules.
  ```js
  // Good
  const utils = require('../lib/utils');
  ```

**Export Style**
- Mixed: both CommonJS (`module.exports`) and ES module (`export`) styles may be present.
  ```js
  // CommonJS
  module.exports = function doSomething() { ... };

  // ES Module
  export function doSomething() { ... }
  ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/).
- Prefixes: `fix`, `feat`, `docs`, `chore`
- Example: `feat: add agent registration for new workflow`

**Documentation**
- Each skill or agent should have a `SKILL.md` in its directory.
- Update `README.md`, `AGENTS.md`, and localized docs as needed.

## Workflows

### Add New Skill or Agentic Workflow
**Trigger:** When introducing a new skill, agent, or multi-agent workflow.  
**Command:** `/add-skill`

1. Create a new `SKILL.md` in `skills/<skill-name>/` or `.agents/skills/<skill-name>/`.
2. Add or update agent definitions in `agents/<agent-name>.md` if agents are involved.
3. Register the new skill/agent in `manifests/install-modules.json`.
4. Update `AGENTS.md` and/or `README.md` to reference the new addition.
5. Add or update supporting scripts or commands if needed.
6. Add or update tests if your workflow includes code.

**Example:**
```bash
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Edit manifests/install-modules.json to add "myNewSkill"
```

---

### Add or Update Command Workflow
**Trigger:** When adding or updating a command for a workflow.  
**Command:** `/add-command`

1. Create or update `commands/<command-name>.md`.
2. If new, update `AGENTS.md` or `README.md` to reference the command.
3. Iterate on the command file to address review feedback.
4. Add or update related scripts or tests as needed.

---

### Add or Adapt Install Target Workflow
**Trigger:** When supporting a new install target (platform, plugin, or integration).  
**Command:** `/add-install-target`

1. Create a new directory and `README` for the install target (e.g., `.codebuddy/`, `.gemini/`).
2. Add install/uninstall scripts (`install.sh`, `install.js`, etc.).
3. Update `manifests/install-modules.json` to include the new target.
4. Update schemas (e.g., `ecc-install-config.schema.json`).
5. Update scripts in `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/<target>.js`.
6. Add or update related tests.

---

### Rules or Guidance Documentation Workflow
**Trigger:** When documenting standards, rules, or best practices for a domain.  
**Command:** `/add-rule-docs`

1. Create or update `rules/<domain>/*.md` (e.g., `rules/web/*.md`).
2. Update or add summary documentation (`SKILL.md`, `patterns.md`).
3. Update related guidance files (`WORKING-CONTEXT.md`, `README.md`).
4. Iterate on documentation based on review feedback.

---

### CI/CD GitHub Actions Dependency Bump Workflow
**Trigger:** When updating GitHub Actions dependencies or CI workflow files.  
**Command:** `/bump-ci-deps`

1. Update `.github/workflows/*.yml` to bump action versions.
2. Update `package.json` and/or `yarn.lock` if npm dependencies are involved.
3. Commit with `chore(deps)` or `fix: harden CI`, etc.

---

### Hooks or Integration Script Refactor Workflow
**Trigger:** When fixing, refactoring, or extending integration hooks or scripts.  
**Command:** `/update-hook`

1. Update `hooks/hooks.json` to change hook configuration or commands.
2. Update or create scripts in `scripts/hooks/*.js` or `*.sh` for hook logic.
3. Add or update tests for hooks (`tests/hooks/*.test.js`).
4. Iterate to address review feedback or edge cases.

---

### Multi-file Catalog Sync and Doc Update Workflow
**Trigger:** When ensuring all catalog, manifest, and documentation files are in sync.  
**Command:** `/sync-catalog`

1. Update `manifests/install-modules.json`, `package.json`, and related manifest files.
2. Update `AGENTS.md`, `README.md`, and/or `WORKING-CONTEXT.md`.
3. Update `docs/zh-CN/*` equivalents for multilingual support.
4. Update or add related test files to validate catalog integrity.

---

## Testing Patterns

- Test files follow the pattern `*.test.js`.
- Testing framework is not explicitly specified; use standard Node.js testing approaches.
- Place tests in relevant directories, e.g., `tests/commands/`, `tests/hooks/`, `tests/lib/`.

**Example:**
```js
// tests/commands/myCommand.test.js
const myCommand = require('../../commands/myCommand');

test('should execute command correctly', () => {
  expect(myCommand()).toBe(true);
});
```

## Commands

| Command         | Purpose                                                        |
|-----------------|----------------------------------------------------------------|
| /add-skill      | Add a new skill or agentic workflow                           |
| /add-command    | Add or update a command file                                   |
| /add-install-target | Add support for a new install target (platform/integration)|
| /add-rule-docs  | Add or update rules/guidance documentation                    |
| /bump-ci-deps   | Update CI/CD GitHub Actions dependencies                      |
| /update-hook    | Refactor or fix hook-related scripts/configuration             |
| /sync-catalog   | Synchronize catalog/manifest files and documentation           |
```