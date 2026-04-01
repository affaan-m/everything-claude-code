```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and contribution workflows used in the `everything-claude-code` repository. The codebase is JavaScript-based, with no specific framework, and is organized around modular skills, agents, commands, and integrations. This guide will help you contribute effectively, maintain consistency, and understand the automation and documentation standards of the project.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for file and directory names.
  - Example: `installTarget.js`, `addNewSkill.js`

**Import Style**
- Use relative imports for modules.
  - Example:
    ```js
    const utils = require('./utils');
    ```

**Export Style**
- Mixed: both CommonJS (`module.exports`) and ES6 (`export`) styles may be present.
  - Example (CommonJS):
    ```js
    module.exports = function doSomething() { ... };
    ```
  - Example (ES6):
    ```js
    export function doSomethingElse() { ... }
    ```

**Commits**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes: `fix`, `feat`, `docs`, `chore`.
  - Example:
    ```
    feat: add support for new install target
    fix: correct agent registration logic
    ```

---

## Workflows

### Add New Skill
**Trigger:** When introducing a new skill (capability, workflow, or integration)  
**Command:** `/add-skill`

1. Create a new `SKILL.md` under `skills/<skill-name>/SKILL.md`.
2. Optionally add supporting files (e.g., `rules/`, `agents/`) in the skill directory.
3. Update `manifests/install-modules.json` to register the new skill.
4. Update `AGENTS.md` and `README.md` to reflect the new skill.
5. Update `WORKING-CONTEXT.md` or other docs if needed.

---

### Add New Agent
**Trigger:** When introducing a new agent persona or automation  
**Command:** `/add-agent`

1. Create a new agent definition file under `agents/<agent-name>.md` or `.opencode/prompts/agents/<agent>.txt`.
2. Update `AGENTS.md` to include the new agent.
3. Update `.opencode/opencode.json` or other config files if needed.

---

### Add or Update Command Workflow
**Trigger:** When adding or updating a workflow command or CLI feature  
**Command:** `/add-command`

1. Create or update a command markdown file under `commands/<command>.md`.
2. Ensure the file contains YAML frontmatter, Purpose, Usage, and Output sections.
3. Update `AGENTS.md` or `README.md` if documentation is affected.

---

### Add Install Target or Adapter
**Trigger:** When supporting a new external tool, IDE, or integration  
**Command:** `/add-install-target`

1. Create a new directory for the install target (e.g., `.codebuddy/`, `.gemini/`).
2. Add a `README.md` and install/uninstall scripts.
3. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
4. Add or update integration logic in `scripts/lib/install-targets/<target>.js`.
5. Update or add tests in `tests/lib/install-targets.test.js`.

---

### Refactor or Promote Command to Skill
**Trigger:** When modernizing or consolidating command logic into the skills system  
**Command:** `/promote-command-to-skill`

1. Move or rewrite command markdown files from `commands/` into `skills/<skill>/SKILL.md`.
2. Update `AGENTS.md`, `README.md`, and `WORKING-CONTEXT.md`.
3. Remove or collapse legacy command files as needed.
4. Update `manifests/install-modules.json` if skill registration changes.

---

### Add or Update Hook or Script
**Trigger:** When automating, hardening, or extending hooks and scripts  
**Command:** `/add-hook`

1. Edit or add hook configuration in `hooks/hooks.json`.
2. Create or update supporting scripts in `scripts/hooks/` or `scripts/lib/`.
3. Update or add tests in `tests/hooks/` or `tests/scripts/`.
4. Update `WORKING-CONTEXT.md` if documentation is needed.

---

### Add or Update CI Workflow or GitHub Action
**Trigger:** When improving or updating CI/CD pipelines or dependencies  
**Command:** `/update-ci`

1. Edit or add workflow YAML files under `.github/workflows/`.
2. Update `package.json`, `yarn.lock`, or `package-lock.json` for dependency changes.
3. Update `.github/dependabot.yml` for automated updates.
4. Update documentation if workflow changes are user-facing.

---

### Add or Update Documentation or Guidance
**Trigger:** When clarifying, updating, or adding documentation  
**Command:** `/update-docs`

1. Edit or add markdown files in the root, `docs/`, or `skills/` directories.
2. Update `WORKING-CONTEXT.md` for context or process changes.
3. Update `AGENTS.md`, `README.md`, or `the-shortform-guide.md` as needed.

---

## Testing Patterns

- Test files use the pattern `*.test.js`.
- The testing framework is not explicitly defined; check test files for context.
- Place tests alongside the code they validate, e.g., `tests/lib/install-targets.test.js`.
- Example test file:
  ```js
  // install-targets.test.js
  const installTarget = require('../../scripts/lib/install-targets/codebuddy');

  test('should install codebuddy target', () => {
    expect(installTarget()).toBe(true);
  });
  ```

---

## Commands

| Command                  | Purpose                                                      |
|--------------------------|--------------------------------------------------------------|
| /add-skill               | Add a new skill, including documentation and registration    |
| /add-agent               | Add a new agent definition                                   |
| /add-command             | Add or update a workflow command or CLI feature              |
| /add-install-target      | Add support for a new install target or integration          |
| /promote-command-to-skill| Refactor or promote a command into a skill-based workflow    |
| /add-hook                | Add or update hooks, scripts, or automation                  |
| /update-ci               | Add or update CI/CD workflows and dependencies               |
| /update-docs             | Add or update documentation or usage guidance                |
```
