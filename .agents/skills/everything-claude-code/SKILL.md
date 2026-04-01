```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript repository. It covers how to add new skills, commands, agents, install targets, and maintain documentation and dependencies. By following these patterns, contributors can ensure consistency, maintainability, and smooth collaboration across the codebase.

## Coding Conventions

- **Language:** JavaScript (no framework detected)
- **File Naming:** Use `camelCase` for filenames.
  - Example: `mySkill.js`, `installTarget.js`
- **Import Style:** Use relative imports.
  - Example:
    ```js
    import myUtil from './utils/myUtil.js';
    ```
- **Export Style:** Mixed (both default and named exports are used).
  - Example:
    ```js
    // Named export
    export function doSomething() { ... }

    // Default export
    export default function main() { ... }
    ```
- **Commit Messages:** Use [Conventional Commits](https://www.conventionalcommits.org/) with prefixes like `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add new agent orchestration workflow`

## Workflows

### Add New Skill
**Trigger:** When introducing a new skill (agent capability or workflow step).  
**Command:** `/add-skill`

1. Create a new `SKILL.md` file under one of:
    - `skills/<skill-name>/`
    - `.agents/skills/<skill-name>/`
    - `.claude/skills/<skill-name>/`
2. Optionally update:
    - `AGENTS.md`
    - `README.md`
    - `manifests/install-modules.json` (for registration)
3. Add or update related documentation files.

**Example:**
```bash
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Edit AGENTS.md and README.md if needed
```

---

### Add or Update Command
**Trigger:** When adding or updating a workflow command (e.g., for PRP, review, agent orchestration).  
**Command:** `/add-command`

1. Create or edit command markdown files in `commands/`.
2. Optionally update related documentation or test files.
3. Address review feedback and make iterative fixes.

**Example:**
```bash
touch commands/myCommand.md
# Edit and document the command
```

---

### Add Agent or Agent Prompt
**Trigger:** When introducing a new agent persona or tool.  
**Command:** `/add-agent`

1. Create a new agent definition markdown file in `agents/`.
2. Or add a new prompt file in `.opencode/prompts/agents/`.
3. Update registration/configuration files:
    - `.opencode/opencode.json`
    - `AGENTS.md`

**Example:**
```bash
touch agents/myAgent.md
touch .opencode/prompts/agents/myAgent.txt
# Update .opencode/opencode.json and AGENTS.md
```

---

### Add Install Target or Adapter
**Trigger:** When supporting a new IDE, platform, or tool for installation.  
**Command:** `/add-install-target`

1. Create a new directory for the target (e.g., `.codebuddy/`, `.gemini/`).
2. Add `README` and install/uninstall scripts.
3. Update:
    - `manifests/install-modules.json`
    - Relevant schema files (`schemas/*.json`)
4. Update or create `scripts/lib/install-targets/<target>.js`.
5. Add or update tests for the new install target.

**Example:**
```bash
mkdir .myIDE
touch .myIDE/README.md .myIDE/install.sh .myIDE/uninstall.sh
# Update manifests/install-modules.json and schemas/
```

---

### Refactor Commands into Skills
**Trigger:** When modernizing or consolidating workflows into the skills-first model.  
**Command:** `/refactor-commands-to-skills`

1. Move or merge command markdown files into `skills/<skill-name>/SKILL.md`.
2. Update `AGENTS.md`, `README.md`, and `manifests/install-modules.json` as needed.
3. Remove or archive old command files.

**Example:**
```bash
mv commands/oldCommand.md skills/newSkill/SKILL.md
# Update documentation and manifests
```

---

### Documentation Sync or Update
**Trigger:** When updating repo guidance, syncing docs, or clarifying workflows.  
**Command:** `/sync-docs`

1. Edit documentation files:
    - `README.md`
    - `README.zh-CN.md`
    - `AGENTS.md`
    - `WORKING-CONTEXT.md`
    - `docs/zh-CN/*`
2. Optionally update `package.json`, scripts, or test files if documentation affects usage.
3. Sync changes across language variants.

**Example:**
```bash
vim README.md
cp README.md README.zh-CN.md
# Edit as necessary
```

---

### Dependency or CI Update
**Trigger:** When bumping dependencies or updating CI/CD workflows.  
**Command:** `/update-deps`

1. Edit `package.json`, `yarn.lock`, or other lockfiles.
2. Edit `.github/workflows/*.yml` files.
3. Commit with a `chore(deps)` or similar message.

**Example:**
```bash
npm install some-package@latest
git add package.json yarn.lock
git commit -m "chore(deps): update some-package"
```

---

## Testing Patterns

- **Framework:** Unknown (not explicitly detected).
- **Test File Pattern:** Files named `*.test.js`.
- **Typical Structure:**
  - Place test files alongside or near the code they test.
  - Use descriptive test names and group related tests.

**Example:**
```js
// skills/mySkill/mySkill.test.js
import { mySkillFunction } from './mySkill.js';

test('should perform expected behavior', () => {
  expect(mySkillFunction()).toBe(true);
});
```

## Commands

| Command                   | Purpose                                                        |
|---------------------------|----------------------------------------------------------------|
| /add-skill                | Add a new skill to the codebase                                |
| /add-command              | Add or update a workflow command                               |
| /add-agent                | Add a new agent definition or prompt                           |
| /add-install-target       | Add a new install target or adapter                            |
| /refactor-commands-to-skills | Refactor legacy commands into skill definitions             |
| /sync-docs                | Sync or update documentation across languages and contexts      |
| /update-deps              | Update dependencies or CI workflow files                       |
```
