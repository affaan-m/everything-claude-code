```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The codebase is written in JavaScript (no framework), with a focus on modular skills, agentic commands, and extensible hooks. Contributions follow conventional commit messages, maintain a consistent code style, and leverage automated testing with Vitest.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and scripts.
  - Example: `mySkill.js`, `doSomethingUseful.js`

**Import Style**
- Use relative imports for modules.
  ```js
  // Example
  import helper from './helper.js';
  ```

**Export Style**
- Mixed: both default and named exports are used.
  ```js
  // Default export
  export default function myFunction() { ... }

  // Named export
  export function helper() { ... }
  ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - Prefixes: `fix:`, `feat:`, `docs:`
  - Example: `feat: add gacha skill with probability config`

**Directory Structure**
- Skills: `skills/<skill-name>/`
- Commands: `commands/`, `.opencode/commands/`, `.claude/commands/`
- Agents: `agents/`, `agents/v4/agents/`
- Hooks: `scripts/hooks/`, `hooks/`
- Tests: `tests/scripts/`, `tests/hooks/`

## Workflows

### Add or Update Skill
**Trigger:** When adding or updating a skill for Claude Code  
**Command:** `/add-skill`

1. Create or modify `skills/<skill-name>/SKILL.md`
2. Optionally add/update scripts, references, or README under `skills/<skill-name>/`
3. Optionally add/update tests in `tests/scripts/<skill-name>-*.test.js`
4. Update `AGENTS.md` and/or `README.md` if the skill is noteworthy

**Example:**
```bash
# Add a new skill
mkdir skills/gacha
touch skills/gacha/SKILL.md
echo "// implementation" > skills/gacha/gacha.js
echo "// test" > tests/scripts/gacha-gacha.test.js
```

---

### Add or Update Command
**Trigger:** When introducing or updating a system command  
**Command:** `/add-command`

1. Create or modify `commands/<command-name>.md`
2. Optionally update `.opencode/commands/` or `.claude/commands/` for internal/agentic commands
3. Optionally add/update implementation in `scripts/<command-name>.js`
4. Optionally add/update tests in `tests/scripts/<command-name>.test.js`

**Example:**
```bash
touch commands/retry.md
echo "// implementation" > scripts/retry.js
echo "// test" > tests/scripts/retry.test.js
```

---

### Add or Update Hook
**Trigger:** When adding or updating a git/system hook  
**Command:** `/add-hook`

1. Create or modify `scripts/hooks/<hook-name>.js`
2. Update `hooks/hooks.json` to register/document the hook
3. Optionally update `hooks/README.md`
4. Add/update tests in `tests/hooks/<hook-name>.test.js`

**Example:**
```bash
touch scripts/hooks/precommit.js
vim hooks/hooks.json
echo "// test" > tests/hooks/precommit.test.js
```

---

### Add or Update Agent
**Trigger:** When adding or updating an agent  
**Command:** `/add-agent`

1. Create or modify `agents/<agent-name>.md` or `agents/v4/agents/<agent-name>.ts`
2. Optionally update orchestrators/config under `agents/v4/orchestrators/`
3. Update `AGENTS.md` and/or `README.md`

---

### Add or Update MCP Server Config
**Trigger:** When registering/updating an MCP server configuration  
**Command:** `/add-mcp-server`

1. Edit `mcp-configs/mcp-servers.json` to add/update server entries
2. Optionally update documentation or related files

---

### Add or Update CI Workflow
**Trigger:** When changing CI/CD behavior or security  
**Command:** `/update-ci`

1. Edit `.github/workflows/*.yml`
2. Optionally update `CLAUDE.md` or related documentation

---

## Testing Patterns

- **Framework:** [Vitest](https://vitest.dev/)
- **File Pattern:** `*.test.js` (e.g., `gacha-gacha.test.js`)
- **Location:** `tests/scripts/` for skills/commands, `tests/hooks/` for hooks

**Example Test:**
```js
import { describe, it, expect } from 'vitest';
import gacha from '../../skills/gacha/gacha.js';

describe('gacha skill', () => {
  it('returns a valid result', () => {
    expect(gacha()).toBeDefined();
  });
});
```

## Commands

| Command         | Purpose                                                 |
|-----------------|---------------------------------------------------------|
| /add-skill      | Add or update a skill, including docs and tests         |
| /add-command    | Add or update a system/agentic command                  |
| /add-hook       | Add or update a git or system hook                      |
| /add-agent      | Add or update an agent and related documentation        |
| /add-mcp-server | Add or update MCP server configuration                  |
| /update-ci      | Add or update CI/CD workflow files                      |
```
