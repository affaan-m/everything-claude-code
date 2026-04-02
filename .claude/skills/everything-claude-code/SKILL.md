```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development conventions, workflows, and best practices for contributing to the `everything-claude-code` repository. The project is written in JavaScript (no framework detected) and is structured to support modular skills, agent configurations, install targets, and extensible command-driven workflows. It emphasizes clarity, maintainability, and documentation-driven development, with a focus on agentic and skill-based architectures.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `mySkill.js`, `installTarget.js`
- Markdown documentation for skills: `SKILL.md` inside each skill directory.

**Import Style**
- Use relative imports for modules.
  ```js
  // Example
  import myUtil from './utils/myUtil.js';
  ```

**Export Style**
- Mixed: both named and default exports are used.
  ```js
  // Named export
  export function doSomething() { ... }

  // Default export
  export default function main() { ... }
  ```

**Commits**
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - Prefixes: `fix:`, `feat:`, `docs:`, `chore:`
  - Example: `feat: add Gemini install target support`

---

## Workflows

### Add or Update Skill
**Trigger:** When you want to add a new skill or update an existing skill's capabilities.  
**Command:** `/add-skill`

1. Create or update `skills/<skill-name>/SKILL.md` (or `.agents/skills/<skill-name>/SKILL.md`).
2. Update `AGENTS.md` and/or `README.md` to document the new or updated skill.
3. Register the skill in `manifests/install-modules.json` and/or `manifests/install-components.json`.
4. Optionally, add or update related files such as references, assets, or language-specific documentation.

**Example:**
```bash
# Add a new skill
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Edit AGENTS.md and manifests/install-modules.json accordingly
```

---

### Add or Update Command
**Trigger:** When introducing or modifying a command-driven workflow (e.g., PRP, code review, planning).  
**Command:** `/add-command`

1. Create or update `commands/<command-name>.md`.
2. If related, update documentation or cross-reference in other command files.
3. Optionally, update scripts or tests if command logic is involved.

**Example:**
```bash
touch commands/review-pr.md
# Document the new command in commands/review-pr.md
```

---

### Update or Add Agent Configuration
**Trigger:** When adding a new agent or updating agent prompts/configuration.  
**Command:** `/add-agent`

1. Create or update `.opencode/opencode.json` or similar agent registry.
2. Add or update `.opencode/prompts/agents/<agent>.txt` or `.codex/agents/<agent>.toml`.
3. Update `AGENTS.md` to reflect new or changed agents.

**Example:**
```bash
# Add a new agent prompt
touch .opencode/prompts/agents/claude.txt
# Register the agent in .opencode/opencode.json
```

---

### Refactor or Restructure Skills and Commands
**Trigger:** When refactoring, merging, or reorganizing skills or commands for maintainability.  
**Command:** `/refactor-skills`

1. Edit or move `skills/*/SKILL.md` and/or `commands/*.md`.
2. Update `AGENTS.md`, `README.md`, and/or `docs/zh-CN/*`.
3. Update `manifests/install-modules.json` or related manifests.

**Example:**
```bash
mv skills/oldSkill skills/newSkill
# Update all references in manifests and documentation
```

---

### Add or Update Install Target
**Trigger:** When supporting a new platform or environment for installation (e.g., Gemini, CodeBuddy).  
**Command:** `/add-install-target`

1. Create or update `.<target>/README.md` and related docs.
2. Add or update install scripts (`install.js/sh`, `uninstall.js/sh`).
3. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
4. Update `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/<target>-project.js`.
5. Add or update tests for install targets.

**Example:**
```bash
mkdir .gemini
touch .gemini/README.md .gemini/install.js .gemini/uninstall.js
# Update manifests and schemas accordingly
```

---

### Documentation Update or Sync
**Trigger:** When updating, adding, or synchronizing documentation for users or contributors.  
**Command:** `/update-docs`

1. Edit or add documentation files (`README.md`, `WORKING-CONTEXT.md`, `docs/*`, `the-shortform-guide.md`, etc.).
2. Update related skill or agent documentation if needed.

**Example:**
```bash
nano README.md
# Make your documentation changes and commit
```

---

### CI or Hook Configuration Update
**Trigger:** When updating CI pipelines or post-edit hooks for formatting, typechecking, or audit logging.  
**Command:** `/update-ci`

1. Edit `.github/workflows/*.yml` or `hooks/hooks.json`.
2. Update or add `scripts/hooks/*.js`.
3. Update or add related tests.

**Example:**
```bash
nano .github/workflows/ci.yml
# Adjust workflow steps as needed
```

---

## Testing Patterns

- Test files use the pattern `*.test.js`.
- The testing framework is not explicitly specified; use standard Node.js testing tools (e.g., Jest, Mocha) as appropriate.
- Place tests alongside the code or in a dedicated `tests/` directory.

**Example:**
```js
// tests/mySkill.test.js
import mySkill from '../skills/mySkill.js';

test('mySkill does something', () => {
  expect(mySkill()).toBe(true);
});
```

---

## Commands

| Command             | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| /add-skill          | Add or update a skill, including docs and manifest registration|
| /add-command        | Add or update a command-driven workflow                        |
| /add-agent          | Add or update agent configuration and prompts                  |
| /refactor-skills    | Refactor, merge, or restructure skills/commands                |
| /add-install-target | Add or update an install target and related scripts            |
| /update-docs        | Update or synchronize documentation                            |
| /update-ci          | Update CI workflows or hook configurations                     |
```
