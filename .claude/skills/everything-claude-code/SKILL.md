```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript repository. The project is modular, skill-oriented, and emphasizes clear documentation, conventional commits, and extensibility via skills, agents, commands, and install targets. This guide will help you contribute effectively by following established patterns and using the right commands for common tasks.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `mySkill.js`, `installTarget.js`

**Import Style**
- Use relative imports.
  - Example:
    ```js
    const helper = require('./helper');
    import { doSomething } from '../utils/doSomething';
    ```

**Export Style**
- Mixed: both CommonJS (`module.exports`) and ES6 (`export`) exports are used.
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
  - Example: `feat: add new agent pipeline for document processing`

## Workflows

### Add New Skill
**Trigger:** When introducing a new skill (capability/module) to the platform  
**Command:** `/add-skill`

1. Create a new `SKILL.md` under `skills/<skill-name>/` or `.agents/skills/<skill-name>/`.
2. Optionally add related assets or references in the skill directory.
3. Update documentation:
    - `AGENTS.md`
    - `README.md`
    - `README.zh-CN.md`
    - `docs/zh-CN/AGENTS.md`
4. If the skill is installable, update:
    - `manifests/install-components.json` or
    - `manifests/install-modules.json`
5. Optionally update `WORKING-CONTEXT.md`.

**Example directory structure:**
```
skills/
  myNewSkill/
    SKILL.md
    index.js
    assets/
```

---

### Add New Agent or Pipeline
**Trigger:** When introducing a new agent or orchestrated workflow (pipeline)  
**Command:** `/add-agent-pipeline`

1. Create agent definition files under `agents/`.
2. Create or update a `SKILL.md` for the orchestrator under `skills/<pipeline-name>/`.
3. Update `AGENTS.md` and `README.md` to document the new agent(s)/pipeline.
4. Optionally add supporting commands, scripts, or documentation.

---

### Add or Extend Command
**Trigger:** When adding or enhancing CLI commands  
**Command:** `/add-command`

1. Create or update command markdown files under `commands/`.
2. Incorporate review feedback and fixes as needed.
3. Document new commands in `AGENTS.md` or other relevant docs.

---

### Add Install Target or Adapter
**Trigger:** When supporting a new install target (plugin, IDE, platform)  
**Command:** `/add-install-target`

1. Create a new directory for the install target (e.g., `.codebuddy/`, `.gemini/`).
2. Add install/uninstall scripts and documentation in the new directory.
3. Update `manifests/install-modules.json` and relevant schemas.
4. Update or add scripts in `scripts/lib/install-targets/<target>.js`.
5. Update or add tests for the new install target.

**Example:**
```
.codebuddy/
  install.sh
  uninstall.sh
  README.md
scripts/lib/install-targets/codebuddy.js
tests/lib/install-targets.test.js
```

---

### Update or Harden Hooks
**Trigger:** When improving, refactoring, or fixing hooks (e.g., CI, formatting, session management)  
**Command:** `/update-hook`

1. Update `hooks/hooks.json` to change hook configuration.
2. Update or add scripts in `scripts/hooks/*.js` or `scripts/hooks/*.sh`.
3. Update or add tests for the affected hooks.
4. Optionally update related documentation.

---

### Documentation Sync and Guidance Update
**Trigger:** When updating documentation to reflect new features, skills, or workflows  
**Command:** `/sync-docs`

1. Update `README.md`, `README.zh-CN.md`, and/or `AGENTS.md`.
2. Update `docs/zh-CN/AGENTS.md` and `docs/zh-CN/README.md`.
3. Update or add `WORKING-CONTEXT.md`.
4. Optionally update `the-shortform-guide.md` or other guidance files.

---

### Dependency Bump via Dependabot
**Trigger:** When a dependency update is triggered by Dependabot or similar automation  
**Command:** `/bump-dependency`

1. Update `package.json` and/or `yarn.lock` for npm dependencies.
2. Update `.github/workflows/*.yml` for GitHub Actions dependencies.
3. Commit with a standardized message and co-author.

---

## Testing Patterns

- Test files use the pattern `*.test.js`.
- Testing framework is not explicitly specified; check test files for usage.
- Place tests alongside or within a `tests/` directory, matching the structure of the code under test.
- Example test file:
  ```
  tests/lib/install-targets.test.js
  ```

## Commands

| Command            | Purpose                                                          |
|--------------------|------------------------------------------------------------------|
| /add-skill         | Add a new skill, including docs and registration                 |
| /add-agent-pipeline| Add a new agent or orchestrated pipeline                         |
| /add-command       | Add or extend a CLI command                                      |
| /add-install-target| Add support for a new install target or adapter                  |
| /update-hook       | Refactor or fix hooks and related scripts                        |
| /sync-docs         | Synchronize and update documentation across contexts/languages    |
| /bump-dependency   | Automated dependency update via Dependabot or similar automation  |
```
