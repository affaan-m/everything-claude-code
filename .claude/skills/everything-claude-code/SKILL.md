```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the core development patterns, coding conventions, and collaborative workflows for the `everything-claude-code` JavaScript repository. It is designed to help contributors understand how to add or update skills, commands, agents, install targets, and documentation, as well as follow the established code style and testing patterns.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for file names.
  - Example: `mySkill.js`, `installTargetProject.js`

**Imports**
- Use relative import paths.
  - Example:
    ```js
    const helper = require('./utils/helper');
    ```

**Exports**
- Mixed export styles are used (both CommonJS and ES module patterns may appear).
  - CommonJS example:
    ```js
    module.exports = myFunction;
    ```
  - ES Module example:
    ```js
    export default myFunction;
    ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes: `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add Gemini install target support`

---

## Workflows

### Add or Update Skill
**Trigger:** When introducing a new skill or updating an existing skill's capabilities  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/<skill-name>/` or `.agents/skills/<skill-name>/`.
2. Update `AGENTS.md` and/or `README.md` to document the new or changed skill.
3. Update `manifests/install-modules.json` (and sometimes `install-components.json` or `install-profiles.json`) to register the skill.
4. Add or update supporting files (e.g., assets, references, scripts) as needed.

---

### Add or Update Command Workflow
**Trigger:** When introducing a new workflow command or improving an existing one for automation or documentation  
**Command:** `/add-command`

1. Create or update a markdown command file in `commands/` or `.claude/commands/`.
2. Update references in documentation or index files if needed.
3. Address review feedback and iterate on command file content.

---

### Refactor Skill or Command
**Trigger:** When restructuring or improving the organization of skills or commands  
**Command:** `/refactor-skill`

1. Edit or reorganize `SKILL.md` files in `skills/*/`.
2. Edit or reorganize command markdown files in `commands/`.
3. Update `AGENTS.md`, `README.md`, and `manifests/install-modules.json` to reflect the changes.

---

### Add or Update Agent or Agent Prompt
**Trigger:** When introducing a new agent, updating agent prompts, or registering agents in orchestration configs  
**Command:** `/add-agent`

1. Create or update agent prompt files in `.opencode/prompts/agents/` or `.codex/agents/`.
2. Update agent registry/config files (e.g., `.opencode/opencode.json`, `.codex/agents/*.toml`).
3. Update `AGENTS.md` to document the new or updated agent.

---

### Update or Add Install Target
**Trigger:** When supporting a new IDE/platform or improving install/uninstall scripts  
**Command:** `/add-install-target`

1. Add or update install/uninstall scripts in a new or existing `.<target>/` directory.
2. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
3. Update scripts in `scripts/lib/install-targets/<target>-project.js` and `registry.js`.
4. Add or update tests for the new install target.

---

### Documentation Sync or Update
**Trigger:** When updating repo guidance, troubleshooting, or synchronizing documentation with code changes  
**Command:** `/sync-docs`

1. Edit or add markdown files in `docs/`, `README.md`, `WORKING-CONTEXT.md`, or `.claude-plugin/`.
2. Update or add supporting documentation in `skills/*/` or `.agents/skills/*/`.
3. Synchronize documentation between English and other language versions if applicable.

---

## Testing Patterns

- Test files use the pattern `*.test.js`.
- The testing framework is not explicitly specified; review existing test files for style.
- Example test file:
  ```
  tests/lib/install-targets.test.js
  ```

---

## Commands

| Command            | Purpose                                                           |
|--------------------|-------------------------------------------------------------------|
| /add-skill         | Add or update a skill, including documentation and registration   |
| /add-command       | Add or update a command workflow for automation or documentation  |
| /refactor-skill    | Refactor skills or commands for maintainability                   |
| /add-agent         | Add or update agent configurations or prompts                     |
| /add-install-target| Add or update installation targets and supporting scripts         |
| /sync-docs         | Synchronize or update documentation across the repository         |
```
