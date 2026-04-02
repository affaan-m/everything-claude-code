```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and key workflows used in the `everything-claude-code` repository. The project is written in JavaScript (no framework detected) and focuses on modular skill development, extensible command workflows, and robust automation for agents and integrations. This guide will help contributors maintain consistency and efficiency across code, documentation, and automation.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `installTargets.js`, `mySkillHandler.js`

**Import Style**
- Use relative imports for modules within the repository.
  - Example:
    ```js
    import myUtil from '../utils/myUtil.js';
    ```

**Export Style**
- Mixed: Both default and named exports are used.
  - Example (default export):
    ```js
    export default function installTarget() { ... }
    ```
  - Example (named export):
    ```js
    export function registerSkill() { ... }
    ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes: `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add support for new install target (CodeBuddy)`

## Workflows

### Add or Update a Skill
**Trigger:** When introducing a new skill or updating an existing skill's capabilities or documentation  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/<skill-name>/` or `.agents/skills/<skill-name>/`.
2. Optionally add or update related reference files (e.g., assets, rules, schemas) in the skill directory.
3. Update `manifests/install-modules.json` and/or `manifests/install-components.json` to register the new skill.
4. Update documentation files: `AGENTS.md`, `README.md`, `README.zh-CN.md`, `docs/zh-CN/AGENTS.md`, and `docs/zh-CN/README.md`.
5. Optionally add or update tests for the skill.

**Example:**
```bash
# Add a new skill
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Update manifests
vim manifests/install-modules.json
# Document the skill
vim README.md AGENTS.md
```

---

### Add or Update a Command Workflow
**Trigger:** When introducing or improving a command-driven workflow (e.g., PRP, code review, refactoring)  
**Command:** `/add-command`

1. Create or update a markdown file in `commands/` (e.g., `commands/prp-*.md`).
2. If relevant, update or add supporting files in `.claude/commands/`.
3. Optionally update documentation or references to the command in `README.md` or `AGENTS.md`.

**Example:**
```bash
# Add a new PRP command workflow
touch commands/prp-enhanced.md
# Optionally update supporting files
vim .claude/commands/prp-enhanced.md
```

---

### Refactor Skill or Core Logic
**Trigger:** When improving, reorganizing, or merging existing skill or core logic for maintainability or performance  
**Command:** `/refactor-skill`

1. Edit multiple `SKILL.md` files in `skills/` or `.agents/skills/`.
2. Update documentation: `AGENTS.md`, `README.md`, `README.zh-CN.md`, `docs/zh-CN/AGENTS.md`, `docs/zh-CN/README.md`.
3. Update `manifests/install-modules.json` or related manifests as needed.
4. Remove, merge, or rename legacy command or skill files.
5. Optionally update or add tests for the refactored logic.

**Example:**
```bash
# Refactor multiple skills
vim skills/skillA/SKILL.md skills/skillB/SKILL.md
# Update manifests and docs
vim manifests/install-modules.json README.md
```

---

### Add or Update Install Target
**Trigger:** When supporting a new external tool or environment as an install target  
**Command:** `/add-install-target`

1. Create or update install scripts in a dedicated directory (e.g., `.codebuddy/`, `.gemini/`).
2. Add or update install target logic in `scripts/lib/install-targets/`.
3. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
4. Update or add tests for the new install target in `tests/lib/install-targets.test.js`.
5. Update registry logic if necessary.

**Example:**
```bash
# Add a Gemini install target
mkdir .gemini
touch .gemini/install.sh
vim scripts/lib/install-targets/gemini.js
# Update schemas and manifests
vim schemas/ecc-install-config.schema.json manifests/install-modules.json
```

---

### Update or Add CI/CD Workflow
**Trigger:** When improving, fixing, or adding CI/CD automation (e.g., dependency updates, release validation)  
**Command:** `/update-ci`

1. Edit or add YAML files in `.github/workflows/`.
2. Optionally update related scripts or lockfiles (`yarn.lock`, `package-lock.json`).
3. Optionally update hooks or validation scripts.

**Example:**
```bash
# Add a new CI workflow
touch .github/workflows/dependency-check.yml
# Update lockfiles if needed
yarn install
```

## Testing Patterns

- **Test Files:** Use the `*.test.js` naming pattern.
  - Example: `installTargets.test.js`
- **Framework:** Not explicitly specified; use standard Node.js or your preferred JS testing framework.
- **Placement:** Tests are typically placed alongside implementation or in a `tests/` directory.

**Example Test File:**
```js
// tests/lib/install-targets.test.js
import { installTarget } from '../../scripts/lib/install-targets/gemini.js';

test('should install Gemini target', () => {
  expect(installTarget()).toBe(true);
});
```

## Commands

| Command             | Purpose                                                      |
|---------------------|--------------------------------------------------------------|
| /add-skill          | Add or update a skill, including documentation and manifests |
| /add-command        | Add or update a command workflow                             |
| /refactor-skill     | Refactor skill or core logic and update documentation        |
| /add-install-target | Add or update an install target integration                  |
| /update-ci          | Add or update CI/CD workflow files                           |
```
