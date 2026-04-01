```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and workflows used in the `everything-claude-code` JavaScript repository. It is designed to help contributors understand how to structure code, write tests, follow commit conventions, and participate in common workflows such as adding skills, commands, agents, and installation targets. The repository emphasizes modularity, documentation, and maintainability, with a focus on skills-based architecture.

## Coding Conventions

- **Language:** JavaScript (no framework detected)
- **File Naming:** Use `camelCase` for filenames.
  - Example: `mySkill.js`, `installTarget.js`
- **Import Style:** Use relative imports.
  - Example:
    ```js
    const helper = require('./utils/helper');
    ```
- **Export Style:** Mixed (both CommonJS and ES module patterns may be present).
  - Example (CommonJS):
    ```js
    module.exports = myFunction;
    ```
  - Example (ES Module):
    ```js
    export default myFunction;
    ```
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes such as `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add new install target for Gemini`
- **Documentation:** Each skill, agent, or command should have a corresponding `.md` file documenting its purpose and usage.

## Workflows

### Add or Update Skill
**Trigger:** When adding a new skill or updating an existing skill's documentation or logic  
**Command:** `/add-skill`

1. Create or update a `SKILL.md` file in the appropriate `skills/` or `.agents/skills/` subdirectory.
2. Optionally update related documentation files (`AGENTS.md`, `README.md`, `WORKING-CONTEXT.md`).
3. If the skill needs to be registered, update `manifests/install-modules.json`.

**Example:**
```bash
/add-skill
```
```markdown
# My New Skill

Description of what this skill does...
```

---

### Add or Update Command
**Trigger:** When introducing a new workflow command or improving an existing one  
**Command:** `/add-command`

1. Create or update a `.md` file in the `commands/` directory.
2. Optionally update related documentation or index files.
3. Optionally update hooks or scripts if command behavior changes.

**Example:**
```bash
/add-command
```
```markdown
# myCommand

Description and usage...
```

---

### Add or Update Agent
**Trigger:** When introducing a new agent or refining an existing agent's prompt/logic  
**Command:** `/add-agent`

1. Create or update agent definition `.md` or `.txt` file in `agents/` or `.opencode/prompts/agents/`.
2. Update registration/configuration files (e.g., `.opencode/opencode.json`, `AGENTS.md`).
3. Optionally update related skills or documentation.

---

### Add or Update Install Target
**Trigger:** When supporting a new installation target (e.g., CodeBuddy, Gemini)  
**Command:** `/add-install-target`

1. Create install/uninstall scripts and documentation under a new dot-directory (e.g., `.codebuddy/`, `.gemini/`).
2. Update `manifests/install-modules.json` to register the new target.
3. Update schemas (`ecc-install-config.schema.json`, `install-modules.schema.json`) for validation.
4. Update scripts in `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/`.
5. Update or add tests for the new target.

---

### Update CI/CD Workflows
**Trigger:** When updating CI/CD pipelines or dependencies in workflows  
**Command:** `/update-ci`

1. Edit one or more files in `.github/workflows/`.
2. Optionally update related scripts or lockfiles.
3. Commit with a `chore(deps)` or `fix:` message.

---

### Documentation Sync or Expansion
**Trigger:** When updating documentation to reflect new features, workflows, or conventions  
**Command:** `/sync-docs`

1. Edit `README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, and/or `docs/zh-CN/*`.
2. Optionally update `package.json`, scripts, or test files to match doc changes.
3. Commit with a `docs:` or `feat: add ... documentation` message.

---

### Refactor or Collapse Legacy to Skills
**Trigger:** When modernizing or consolidating workflows by moving logic from `commands/` to `skills/`  
**Command:** `/refactor-to-skill`

1. Edit or remove files in `commands/`.
2. Create or update `SKILL.md` in `skills/`.
3. Update documentation (`README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, `docs/zh-CN/*`).
4. Update `manifests/install-modules.json` if needed.

---

## Testing Patterns

- **Test Files:** Use the `*.test.js` pattern for test files.
  - Example: `installTarget.test.js`
- **Testing Framework:** Not explicitly detected; use standard Node.js testing libraries (e.g., Jest, Mocha) as appropriate.
- **Test Location:** Place test files alongside the code or in a `tests/` directory.
- **Example Test:**
  ```js
  // installTarget.test.js
  const installTarget = require('../scripts/lib/install-targets/installTarget');

  test('should install target correctly', () => {
    expect(installTarget('Gemini')).toBe(true);
  });
  ```

## Commands

| Command             | Purpose                                                         |
|---------------------|-----------------------------------------------------------------|
| /add-skill          | Add or update a skill and its documentation                     |
| /add-command        | Add or update a workflow command                                |
| /add-agent          | Add or update an agent definition                               |
| /add-install-target | Add support for a new installation target                       |
| /update-ci          | Update CI/CD workflow files                                     |
| /sync-docs          | Synchronize or expand documentation across the codebase         |
| /refactor-to-skill  | Refactor legacy command logic into skills                       |
```
