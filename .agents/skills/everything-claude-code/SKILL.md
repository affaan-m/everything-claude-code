```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript codebase. It covers how to add new skills, commands, install targets, agents, and documentation, as well as how to refactor and maintain the project according to established conventions. This guide is designed to help contributors quickly understand and participate in the development process.

## Coding Conventions

- **Language:** JavaScript (no framework detected)
- **File Naming:** Use `camelCase` for JavaScript files and folders.
  - Example: `myUtility.js`, `skillHandler.js`
- **Import Style:** Use relative imports.
  - Example:
    ```js
    const helper = require('./utils/helper');
    ```
- **Export Style:** Mixed (both CommonJS and ES module patterns may be present).
  - CommonJS Example:
    ```js
    module.exports = function doSomething() { ... };
    ```
  - ES Module Example:
    ```js
    export function doSomething() { ... }
    ```
- **Commit Messages:** Use [Conventional Commits](https://www.conventionalcommits.org/).
  - Prefixes: `fix:`, `feat:`, `docs:`, `chore:`
  - Example: `feat: add Gemini install target support`

## Workflows

### Add New Skill
**Trigger:** When you want to add a new skill (capability or workflow) to the system.  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in one of:
    - `skills/<skill-name>/`
    - `.agents/skills/<skill-name>/`
    - `.claude/skills/<skill-name>/`
2. Optionally update `manifests/install-modules.json` or related manifest files.
3. Optionally update `AGENTS.md`, `README.md`, or `WORKING-CONTEXT.md` to document the new skill.

**Example:**
```bash
mkdir -p skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Edit SKILL.md to describe the new skill
```

---

### Add or Update Command
**Trigger:** When you want to introduce or modify a command-driven workflow (e.g., PRP, GAN, refactoring).  
**Command:** `/add-command`

1. Create or update markdown files in `commands/` (e.g., `prp-*.md`, `gan-*.md`, `refactoring.md`).
2. Optionally update related documentation or manifest files.
3. Address review feedback and iterate as needed.

**Example:**
```bash
touch commands/prp-new-feature.md
# Document the new command workflow
```

---

### Add Install Target or Adapter
**Trigger:** When you want to support a new platform, tool, or environment for installation.  
**Command:** `/add-install-target`

1. Create or update install scripts and documentation in a dot-directory (e.g., `.gemini/`, `.codebuddy/`).
2. Update `manifests/install-modules.json` and relevant schemas.
3. Implement or update scripts in `scripts/lib/install-targets/<target>.js`.
4. Update or add tests for the new install target.

**Example:**
```bash
mkdir .gemini
touch .gemini/install.sh
# Write install logic for Gemini platform
```

---

### Refactor or Collapse Commands into Skills
**Trigger:** When you want to modernize or streamline command/skill structure.  
**Command:** `/refactor-commands-to-skills`

1. Move or merge command markdown files into `skills/<skill-name>/SKILL.md`.
2. Update `AGENTS.md`, `README.md`, `WORKING-CONTEXT.md`, and related docs.
3. Update `manifests/install-modules.json` as needed.

---

### Update or Add Agent Definitions
**Trigger:** When you want to introduce or modify an agent's behavior or capabilities.  
**Command:** `/add-agent`

1. Create or update agent prompt/config files (e.g., `.opencode/prompts/agents/*.txt`, `.codex/agents/*.toml`, `agents/*.md`).
2. Update agent registry files (e.g., `.opencode/opencode.json`, `AGENTS.md`).
3. Optionally update or add related documentation.

---

### Docs and Guidance Update
**Trigger:** When you want to document new features, workflows, or update best practices.  
**Command:** `/update-docs`

1. Update or add markdown files in `docs/`, `.claude/`, or the root (e.g., `README.md`, `WORKING-CONTEXT.md`, `TROUBLESHOOTING.md`).
2. Optionally update related files in `.claude-plugin/`, `.codex-plugin/`, or `the-shortform-guide.md`.

---

### CI/CD Workflow Update
**Trigger:** When you want to update GitHub Actions workflows or related automation.  
**Command:** `/update-ci`

1. Update `.github/workflows/*.yml` files.
2. Optionally update related lockfiles or scripts.

---

## Testing Patterns

- **Test Files:** Use the pattern `*.test.js` for test files.
- **Testing Framework:** Not explicitly detected; use standard Node.js testing libraries (e.g., Jest, Mocha).
- **Example Test File:**
  ```js
  // utils.test.js
  const { myFunction } = require('./utils');

  test('myFunction returns true', () => {
    expect(myFunction()).toBe(true);
  });
  ```

## Commands

| Command                    | Purpose                                                        |
|----------------------------|----------------------------------------------------------------|
| /add-skill                 | Add a new skill to the codebase                                |
| /add-command               | Add or update a workflow command                               |
| /add-install-target        | Add support for a new install target or environment            |
| /refactor-commands-to-skills | Refactor legacy commands into skills                          |
| /add-agent                 | Add or update agent definitions                                |
| /update-docs               | Update documentation and guidance files                        |
| /update-ci                 | Update CI/CD workflow files                                    |
```
