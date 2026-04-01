```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and common workflows for contributing to the `everything-claude-code` repository. The project is written in JavaScript (no framework), and centers around modular agent skills, commands, and installable targets. It emphasizes clear documentation, conventional commits, and a modular, extensible structure for agentic workflows.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and modules.
  - Example: `agentManager.js`, `installTargetAdapter.js`

**Imports**
- Use relative imports for internal modules.
  - Example:
    ```js
    import { runAgent } from './agentRunner.js';
    ```

**Exports**
- Mixed export styles are used (both named and default).
  - Example:
    ```js
    // Named export
    export function runAgent() { ... }

    // Default export
    export default AgentManager;
    ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes:
  - `fix:`, `feat:`, `docs:`, `chore:`
  - Example: `feat: add support for new install target`

**Documentation**
- Skills and agents are documented in markdown files (e.g., `SKILL.md`, `AGENTS.md`).
- Multi-language docs supported (e.g., `README.zh-CN.md`).

## Workflows

### Add New Skill
**Trigger:** When introducing a new agent capability or workflow  
**Command:** `/add-skill`

1. Create a new `SKILL.md` file in one of:
    - `skills/<skill-name>/`
    - `.agents/skills/<skill-name>/`
    - `.claude/skills/<skill-name>/`
2. Optionally update documentation:
    - `AGENTS.md`, `README.md`, `WORKING-CONTEXT.md`
3. If the skill is installable, update `manifests/install-modules.json`.

**Example:**
```bash
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Edit SKILL.md with description and usage
```

---

### Add or Update Agent
**Trigger:** When adding a new agent or updating agent definitions  
**Command:** `/add-agent`

1. Add or update agent definition markdown in `agents/` (e.g., `agents/myAgent.md`).
2. Add or update agent prompt in `.opencode/prompts/agents/` (e.g., `.opencode/prompts/agents/myAgent.txt`).
3. Register the agent in `.opencode/opencode.json`.
4. Optionally update `AGENTS.md`.

**Example:**
```bash
touch agents/myAgent.md
echo "Agent prompt..." > .opencode/prompts/agents/myAgent.txt
# Edit .opencode/opencode.json to include "myAgent"
```

---

### Add New Command
**Trigger:** When introducing a new command or workflow step  
**Command:** `/add-command`

1. Create a new command markdown file in `commands/` (e.g., `commands/myCommand.md`).
2. Optionally update related documentation or index files.

**Example:**
```bash
touch commands/myCommand.md
# Document the command and its usage
```

---

### Add Install Target or Adapter
**Trigger:** When supporting a new integration or environment  
**Command:** `/add-install-target`

1. Add a new directory for the target (e.g., `.codebuddy/`, `.gemini/`).
2. Add install/uninstall scripts as needed.
3. Update `manifests/install-modules.json`.
4. Update schemas:
    - `schemas/ecc-install-config.schema.json`
    - `schemas/install-modules.schema.json`
5. Add or update scripts in `scripts/lib/install-targets/<target>.js`.
6. Add or update tests in `tests/lib/install-targets.test.js`.

**Example:**
```bash
mkdir .codebuddy
touch .codebuddy/install.sh .codebuddy/uninstall.sh
# Edit manifests/install-modules.json and schemas as needed
```

---

### Multi-File Docs Update
**Trigger:** When updating or synchronizing documentation  
**Command:** `/update-docs`

1. Edit documentation files:
    - `README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`
    - `docs/zh-CN/*.md`, `README.zh-CN.md`
2. Optionally update `package.json` or scripts for docs generation/validation.

**Example:**
```bash
vim README.md AGENTS.md
# Update docs/zh-CN/ as needed
```

---

### Refactor Command to Skill
**Trigger:** When migrating legacy commands into new skill definitions  
**Command:** `/refactor-command-to-skill`

1. Edit or remove `commands/*.md` as needed.
2. Add or update `skills/*/SKILL.md`.
3. Update documentation (`README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`).
4. Update `manifests/install-modules.json` if necessary.

**Example:**
```bash
mv commands/legacyCommand.md skills/legacySkill/SKILL.md
# Update docs and manifests accordingly
```

---

### CI/CD Workflow Update
**Trigger:** When updating CI/CD pipelines or dependencies  
**Command:** `/update-ci`

1. Edit `.github/workflows/*.yml`.
2. Optionally update lockfiles (`package-lock.json`, `yarn.lock`).
3. Optionally update test files or validation scripts.

**Example:**
```bash
vim .github/workflows/ci.yml
npm install
# Update tests as needed
```

---

## Testing Patterns

- Test files are named with the pattern `*.test.js`.
- The testing framework is not explicitly defined; check for custom or standard Node.js test runners.
- Place tests alongside or in a `tests/` directory.
- Example test file: `tests/agentManager.test.js`

**Example:**
```js
// tests/agentManager.test.js
import { runAgent } from '../agentManager.js';

test('runAgent returns expected result', () => {
  const result = runAgent('test');
  expect(result).toBe('expected');
});
```

## Commands

| Command                   | Purpose                                                         |
|---------------------------|-----------------------------------------------------------------|
| /add-skill                | Add a new skill to the codebase                                 |
| /add-agent                | Add or update an agent definition                               |
| /add-command              | Add a new command or workflow step                              |
| /add-install-target       | Add support for a new install target or adapter                 |
| /update-docs              | Update or synchronize documentation across multiple files        |
| /refactor-command-to-skill| Migrate legacy commands into new skill definitions              |
| /update-ci                | Update CI/CD workflow files and related dependencies            |
```
