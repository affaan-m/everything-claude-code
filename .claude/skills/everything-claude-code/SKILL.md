```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. It covers how to contribute new skills, commands, agents, and documentation, as well as how to maintain code quality and integrate with external platforms. This guide is essential for anyone looking to contribute effectively and consistently to the project.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and folders.
  - Example: `mySkill.js`, `agentManager.js`

**Import Style**
- Use relative imports for modules within the project.
  - Example:
    ```js
    import myUtil from './utils/myUtil.js';
    ```

**Export Style**
- Mixed: Both default and named exports are used.
  - Example:
    ```js
    // Named export
    export function doSomething() { ... }

    // Default export
    export default function main() { ... }
    ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes: `fix`, `feat`, `docs`, `chore`.
- Keep commit messages concise (average ~57 characters).
  - Example: `feat: add support for new install target`

## Workflows

### Add or Update Skill
**Trigger:** When introducing a new capability (skill) or updating an existing one.  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/`, `.agents/skills/`, or `.claude/skills/`.
2. Optionally update `AGENTS.md`, `README.md`, `WORKING-CONTEXT.md`, or `manifests/install-modules.json` to reference the new skill.
3. Optionally add or update related agent definitions or documentation.

**Example:**
```bash
# Add a new skill
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
```

---

### Add or Update Command
**Trigger:** When introducing a new workflow command or improving an existing one.  
**Command:** `/add-command`

1. Create or update a markdown file in `commands/`.
2. Optionally update related documentation or scripts.
3. Optionally update manifests or reference files.

**Example:**
```bash
touch commands/myNewCommand.md
```

---

### Agent or Pipeline Integration
**Trigger:** When introducing a new agent or multi-agent workflow.  
**Command:** `/add-agent-pipeline`

1. Create or update agent markdown files in `agents/`.
2. Create or update orchestrator skill in `skills/`.
3. Optionally add supporting commands, scripts, or documentation.

**Example:**
```bash
touch agents/myAgent.md
touch skills/orchestrator/SKILL.md
```

---

### Update Install Target or Adapter
**Trigger:** When supporting a new platform or fixing integration scripts.  
**Command:** `/add-install-target`

1. Create or update install scripts and README in a `.platform/` directory.
2. Update `manifests/install-modules.json` and schemas as needed.
3. Update or add supporting scripts in `scripts/lib/install-targets/`.
4. Add or update tests for install targets.

**Example:**
```bash
touch .platform/README.md
touch scripts/lib/install-targets/myPlatform.js
```

---

### Documentation and Guidance Update
**Trigger:** When clarifying, expanding, or synchronizing documentation or best practices.  
**Command:** `/update-docs`

1. Update or add markdown files in `docs/`, `.claude/`, or root.
2. Synchronize changes across localized docs (e.g., `docs/zh-CN/`).
3. Update `WORKING-CONTEXT.md` and related guidance files.

**Example:**
```bash
touch docs/newGuide.md
```

---

### CI/CD and Hook Update
**Trigger:** When improving or fixing automation for code quality, release, or install processes.  
**Command:** `/update-ci`

1. Update `.github/workflows/*.yml` for CI/CD.
2. Update `hooks/hooks.json` and related scripts in `scripts/hooks/`.
3. Update or add tests for hooks and scripts.

**Example:**
```bash
touch .github/workflows/ci.yml
touch scripts/hooks/validate.js
```

## Testing Patterns

- Test files use the `*.test.js` naming pattern.
- The testing framework is not explicitly specified; check individual test files for details.
- Place tests alongside the code they cover or in a `tests/` directory.
- Example test file: `tests/lib/install-targets.test.js`

**Example:**
```js
// tests/mySkill.test.js
import { doSomething } from '../skills/mySkill.js';

test('doSomething returns expected value', () => {
  expect(doSomething()).toBe('expected');
});
```

## Commands

| Command              | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| /add-skill           | Add or update a skill with documentation and references        |
| /add-command         | Add or update a workflow command                               |
| /add-agent-pipeline  | Add or update agent definitions and orchestrate workflows      |
| /add-install-target  | Add or update install targets/adapters for external platforms  |
| /update-docs         | Update or synchronize documentation and guidance               |
| /update-ci           | Update CI/CD workflows or hooks                               |
```