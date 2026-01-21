---
name: opencode-expert
description: Master skill for OpenCode platform expertise - complete guide to configuration, plugins, hooks, skills, and direct platform modifications
version: 1.0.0
compatibility: opencode
license: MIT
metadata:
  purpose: Enable agents to confidently modify OpenCode platform internals
  coverage: config, plugins, hooks, skills, commands, tools, MCP
  access: Low-level platform internals, direct file modification
  security: Requires careful validation of user inputs
---

# OpenCode Platform Expertise Skill

Master knowledge base for agents modifying OpenCode directly. Covers architecture, configuration, hooks, plugins, and extension mechanisms.

## Quick Reference Matrix

| Goal | File Location | Format | Reload Required |
|------|---------------|--------|-----------------|
| Add config field | `opencode.json` | JSON | Yes (reload CLI) |
| Register hook | Plugin code | JavaScript/TypeScript | Yes (CLI restart) |
| Create custom skill | `~/.config/opencode/skill/<name>/SKILL.md` | YAML + Markdown | No |
| Create custom agent | `~/.config/opencode/agent/<name>.md` | YAML + Markdown | No |
| Create custom command | `~/.config/opencode/command/<name>.md` | YAML + Markdown | No |
| Add MCP server | `opencode.json` (mcp section) | JSON | Yes (CLI restart) |
| Deploy plugin | `~/.config/opencode/plugin/` | JavaScript module | Yes (CLI restart) |
| Configure tool | Plugin or `opencode.json` | TypeScript + Zod | Yes (CLI restart) |

---

## Part 1: OpenCode Architecture

### File System Layout

```
~/.opencode/                           # OpenCode installation directory
  ├── bin/opencode                     # Main executable
  ├── parts/                           # 97+ internal components
  │   ├── core/                        # Core platform logic
  │   ├── agents/                      # Agent implementations
  │   ├── hooks/                       # Hook system
  │   ├── config/                      # Config loading/validation
  │   └── ...
  ├── package.json                     # Dependencies
  ├── memory.jsonl                     # Persistent memory log
  └── messages/                        # Message history

~/.config/opencode/                    # Configuration directory (MODIFIABLE)
  ├── opencode.json                    # Main config file
  ├── mcp.json                         # MCP server configs (legacy)
  ├── AGENTS.md                        # Agent directives (global)
  ├── agent/                           # Custom agent definitions
  │   ├── planner.md
  │   ├── code-reviewer.md
  │   └── <custom>.md
  ├── command/                         # Custom commands
  │   ├── plan.md
  │   ├── debug.md
  │   └── <custom>.md
  ├── skill/                           # Skill packages
  │   ├── opencode-expert/
  │   │   └── SKILL.md
  │   ├── goedels-poetry/
  │   │   └── SKILL.md
  │   └── <custom>/
  │       └── SKILL.md
  ├── plugin/                          # Custom plugins (JavaScript)
  │   └── agent-bus.js
  ├── node_modules/                    # Dependencies
  └── package.json

~/.config/opencode/agent-bus/          # Agent bus configuration
  └── config.json
```

### Startup Sequence

1. **Config Discovery** (`opencode.json`)
   - Project-level: `.opencode/opencode.json`
   - User-level: `~/.config/opencode/opencode.json`
   - Merge with environment variables
2. **Plugin Loading**
   - Parse `plugin` array in `opencode.json`
   - Load plugins from file:// or http:// URLs
   - Initialize plugins with hooks
3. **MCP Server Connection**
   - Start configured MCP servers (mcp section)
   - Register tools from MCPs
4. **Agent/Skill Loading**
   - Scan `~/.config/opencode/agent/` for custom agents
   - Scan `~/.config/opencode/skill/` for custom skills
5. **Command Registration**
   - Parse `~/.config/opencode/command/` files
   - Register as slash commands
6. **Hook Execution**
   - Fire `startup` hook

---

## Part 2: Configuration System

### opencode.json Schema (Complete)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  
  // MCP Servers Configuration
  "mcp": {
    "server-name": {
      "type": "local" | "remote",
      "command": ["npx", "-y", "package-name"],  // For local only
      "url": "https://mcp.example.com/mcp",      // For remote only
      "enabled": true | false,
      "oauth": {
        "clientId": "...",
        "clientSecret": "..."
      },
      "environment": {
        "KEY": "value"
      }
    }
  },
  
  // Plugins (JavaScript modules)
  "plugin": [
    "file:///home/user/.config/opencode/plugin/custom.js",
    "https://example.com/plugins/remote.js"
  ],
  
  // Custom Tool Definitions
  "tools": [
    {
      "name": "my-tool",
      "handler": "file:///path/to/tool.ts"
    }
  ],
  
  // Environment Variables
  "env": {
    "KEY": "value"
  },
  
  // Custom Instructions
  "instructions": "file:///path/to/AGENTS.md"
}
```

### Config Loading Precedence

**HIGHEST PRIORITY (overrides all):**
1. Environment variables (`OPENCODE_*`)
2. Command-line arguments

**MEDIUM PRIORITY:**
3. `.opencode/opencode.json` (project-level)

**LOWEST PRIORITY:**
4. `~/.config/opencode/opencode.json` (user-level)
5. Default values (built-in)

### Environment Variables

All keys in `opencode.json` can be overridden:

```bash
# Set MCP server URL
OPENCODE_MCP_<SERVER>_URL="https://..."

# Set plugin list
OPENCODE_PLUGIN_0="file://..."
OPENCODE_PLUGIN_1="file://..."

# Set custom instructions
OPENCODE_INSTRUCTIONS="file://..."

# Enable/disable specific MCP
OPENCODE_MCP_<SERVER>_ENABLED="true|false"
```

### Config Validation

**DO NOT** use JSON directly for complex configs. Always:
1. Parse with strict schema validation (Zod recommended)
2. Validate file paths exist before loading
3. Test config before deploying to production
4. Keep backups of working configs

**Validation Checklist:**
- [ ] All file paths exist and readable
- [ ] MCP servers are accessible (if remote)
- [ ] Plugins are valid JavaScript
- [ ] No circular dependencies
- [ ] No conflicting hook definitions

---

## Part 3: Hook System (THE CRITICAL PIECE)

### Hook Lifecycle & Execution Order

```
CLI Start
  ↓
startup                    # [SAFE] Init hooks, load plugins
  ↓
beforeCommand              # [BLOCKING] Can modify command
  ↓
[COMMAND EXECUTES]
  ↓
afterCommand               # [INFORMATION] Receives command result
  ↓
beforeAgent                # [BLOCKING] Can modify agent config
  ↓
[AGENT RUNS]
  ↓
afterAgent                 # [INFORMATION] Receives agent result
  ↓
beforeWrite                # [BLOCKING] Can modify file writes
  ↓
[FILES WRITTEN]
  ↓
afterWrite                 # [INFORMATION] Receives write result
  ↓
beforeMCP                  # [BLOCKING] Can modify MCP requests
  ↓
[MCP CALL MADE]
  ↓
afterMCP                   # [INFORMATION] Receives MCP response
  ↓
shutdown                   # [SAFE] Cleanup hooks
  ↓
CLI Exit
```

### Hook Signatures

```typescript
// BLOCKING hooks (can throw to prevent execution)
hook.before('command', async (payload: {
  name: string;
  args: Record<string, unknown>;
  config: OpenCodeConfig;
}) => {
  // Can modify payload.args or throw Error to cancel
  // Modifications applied before execution
  return payload;  // Required
});

hook.before('agent', async (payload: {
  agentId: string;
  config: AgentConfig;
  input: string;
}) => {
  // Can modify payload.config
  return payload;  // Required
});

hook.before('write', async (payload: {
  path: string;
  content: string;
  mode: 'create' | 'append' | 'overwrite';
}) => {
  // Can modify content or block by throwing
  return payload;  // Required
});

// INFORMATION hooks (receive-only, cannot modify)
hook.after('command', async (payload: {
  name: string;
  result: unknown;
  duration: number;  // milliseconds
  error?: Error;
}) => {
  // For logging, metrics, side effects
  // Cannot modify execution
  return;  // Optional
});

hook.after('agent', async (payload: {
  agentId: string;
  output: string;
  duration: number;
  error?: Error;
}) => {
  return;
});

hook.after('write', async (payload: {
  path: string;
  content: string;
  duration: number;
  error?: Error;
}) => {
  return;
});

hook.after('mcp', async (payload: {
  server: string;
  tool: string;
  input: unknown;
  output: unknown;
  duration: number;
  error?: Error;
}) => {
  return;
});

// Lifecycle hooks (safe)
hook.on('startup', async () => {
  // Initialize, setup connections
  // Errors here prevent CLI startup
});

hook.on('shutdown', async () => {
  // Cleanup, close connections
  // Errors here are logged but don't fail
});
```

### Hook Registration (In Plugin)

```typescript
// ~/.config/opencode/plugin/my-plugin.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  
  async init(hooks, config) {
    // Register hooks
    hooks.before('command', async (payload) => {
      console.log('Before:', payload.name);
      return payload;
    });
    
    hooks.after('write', async (payload) => {
      console.log('Wrote:', payload.path);
    });
    
    hooks.on('startup', async () => {
      console.log('Plugin started');
    });
  }
};
```

### Hook Best Practices

**DO:**
- Keep hooks fast (< 100ms)
- Return unmodified payload if not changing anything
- Log errors but don't crash in `after` hooks
- Use `startup` for initialization
- Use `shutdown` for cleanup

**DON'T:**
- Modify payloads you don't understand
- Make blocking network calls in hooks
- Create infinite loops between hooks
- Throw errors in `after` hooks (use logging instead)
- Access files that might be locked

**Common Hook Patterns:**

```typescript
// Audit logging
hooks.after('write', async (p) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] WRITE ${p.path}`);
});

// Validation
hooks.before('write', async (p) => {
  if (p.content.length > 1000000) {
    throw new Error('File too large');
  }
  return p;
});

// Transformation
hooks.before('command', async (p) => {
  if (p.name === 'debug') {
    p.args.verbose = true;  // Force verbose mode
  }
  return p;
});

// Conditional bypass
hooks.before('write', async (p) => {
  if (process.env.DRY_RUN === 'true') {
    throw new Error('DRY RUN: blocked write to ' + p.path);
  }
  return p;
});
```

---

## Part 4: Plugin System

### Plugin Loading Mechanics

**Plugins are loaded from `opencode.json` → `plugin` array:**

```json
{
  "plugin": [
    "file:///home/user/.config/opencode/plugin/agent-bus.js",
    "https://example.com/plugins/remote-plugin.js"
  ]
}
```

**Loading process:**
1. Fetch plugin (from file or HTTP)
2. Validate JavaScript syntax
3. Call `module.exports.init(hooks, config)`
4. Register hooks/tools
5. Store plugin state in memory

### Plugin API

```typescript
interface Plugin {
  // Required
  name: string;
  version: string;
  
  // Required: initialization function
  async init(hooks: HookRegistry, config: OpenCodeConfig): Promise<void>;
  
  // Optional
  tools?: Record<string, ToolDefinition>;
  commands?: Record<string, CommandDefinition>;
  agents?: Record<string, AgentDefinition>;
}

interface HookRegistry {
  before(event: string, handler: (payload: any) => Promise<any>): void;
  after(event: string, handler: (payload: any) => Promise<void>): void;
  on(event: string, handler: () => Promise<void>): void;
}
```

### Plugin Development Checklist

- [ ] Has `name` and `version` in exports
- [ ] Has `init` function accepting `(hooks, config)`
- [ ] Initializes within 1 second
- [ ] Handles errors gracefully
- [ ] Doesn't crash on missing dependencies
- [ ] Validated against `~/.opencode/node_modules/@opencode-ai/plugin` types
- [ ] No global state mutations
- [ ] Tested with `opencode --debug`

### Common Plugin Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Plugin won't load | Syntax error | Run `node -c plugin.js` to check |
| Hooks not firing | Not registered | Add console.log in `init` to debug |
| Config not available | Async timing | Store config in `init`, use in hooks |
| Memory leak | Holding references | Clear references in `shutdown` |
| Plugin conflicts | Two plugins modify same thing | Use hook precedence/ordering |

---

## Part 5: Skills System

### Skill Development

**Location:** `~/.config/opencode/skill/<name>/SKILL.md`

**Format:**
```yaml
---
name: skill-name
description: What this skill teaches
version: 1.0.0
compatibility: opencode
license: MIT
metadata:
  keywords: [tag1, tag2]
  author: Your Name
---

# Skill Title

Markdown content with sections, code blocks, examples.
Agents read this and apply the knowledge.
```

### Skill Best Practices

**DO:**
- Make skills focused on ONE topic
- Include practical examples with code
- Add a "quick reference" section at top
- Use tables for decision matrices
- Include anti-patterns and gotchas
- Version your skills

**DON'T:**
- Make skills longer than 2000 lines
- Use internal jargon without explanation
- Include deprecated information
- Forget to test examples in your skill

### Skill Lifecycle

1. **Discovery** - Agent searches `~/.config/opencode/skill/` for matching skill
2. **Loading** - Agent reads SKILL.md from start to end
3. **Application** - Agent applies knowledge while working
4. **Verification** - Agent checks work against skill guidance

### Skill Content Template

```markdown
---
name: <name>
description: <one-liner>
compatibility: opencode
---

# <Title>

## Quick Reference

[Table with key info]

## When to Use This Skill

[Triggers and scenarios]

## Core Concepts

[Definitions and principles]

## Step-by-Step Guide

[Practical workflow]

## Common Patterns

[Code examples]

## Anti-Patterns & Gotchas

[What NOT to do]

## Troubleshooting

[Common issues and fixes]

## References

[Links to official docs, repos, etc]
```

---

## Part 6: Agent System

### Agent Definition Format

**Location:** `~/.config/opencode/agent/<name>.md`

```yaml
---
description: What this agent does
mode: subagent | standalone
model: anthropic/claude-sonnet-4-5
temperature: 0.4
tools:
  write: false
  edit: false
  bash: false
maxSteps: 30
---

# Agent Name

## Role Description

What this agent specializes in.

## Behavioral Guidelines

How it should operate.

## Failure Recovery

What to do if things go wrong.
```

### Agent Best Practices

- Keep agents focused on ONE domain
- Document constraints (tools available, model, temperature)
- Provide clear recovery instructions
- Test with real tasks before deploying
- Version your agents

---

## Part 7: Command System

### Command Definition Format

**Location:** `~/.config/opencode/command/<name>.md`

```yaml
---
description: Brief description
---

What to do when this command is invoked.

Use placeholders like $ARG1, $ARG2 for arguments.
```

**Usage:**
```bash
opencode --<name> arg1 arg2
```

### Command Best Practices

- Keep descriptions under 100 characters
- Use descriptive names (kebab-case)
- Test with actual arguments
- Document in a README if complex

---

## Part 8: Tools & MCP Integration

### Custom Tool Format

Tools can be:
1. Defined in a plugin
2. Defined in `opencode.json` tools section
3. Provided by MCP servers

**In plugin:**
```typescript
module.exports = {
  tools: {
    'my-tool': {
      name: 'my-tool',
      description: 'What it does',
      handler: async (input) => {
        return result;
      }
    }
  }
};
```

**Validation:**
- Must have name, description, handler
- Handler must be async
- Input/output must be serializable

### MCP Server Configuration

```json
{
  "mcp": {
    "my-server": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-package"],
      "enabled": true
    }
  }
}
```

**Testing:**
```bash
opencode --mcp-test my-server
```

---

## Part 9: Platform Modification Workflows

### Workflow: Add a Custom Agent

1. Create `~/.config/opencode/agent/<name>.md`
2. Add YAML frontmatter with model, temperature, tools
3. Write detailed instructions
4. Test with: `opencode --<name>`
5. Verify it appears in agent list

**Verification:**
```bash
opencode --list-agents | grep <name>
```

### Workflow: Register a Custom Hook

1. Create plugin at `~/.config/opencode/plugin/<name>.js`
2. Implement `module.exports.init(hooks, config)`
3. Register hooks: `hooks.before('command', ...)`
4. Add to `opencode.json` → `plugin` array
5. Restart CLI
6. Verify with: `opencode --debug` (shows hook calls)

**Verification:**
```bash
opencode --debug <any-command>
# Watch output for hook execution
```

### Workflow: Deploy a Skill

1. Create `~/.config/opencode/skill/<name>/SKILL.md`
2. Write comprehensive YAML metadata
3. Document all sections
4. Test examples manually
5. Verify discovery: `opencode --skill-search <name>`

**Verification:**
- Agent can find and read skill
- All code examples work
- Cross-references accurate

### Workflow: Add MCP Server

1. Identify MCP package on npm
2. Add to `opencode.json` mcp section:
   ```json
   {
     "mcp": {
       "new-server": {
         "type": "local",
         "command": ["npx", "-y", "mcp-package"],
         "enabled": true
       }
     }
   }
   ```
3. Restart CLI
4. Test tools: `opencode --mcp-tools new-server`

**Verification:**
```bash
opencode --list-tools | grep new-server
```

---

## Part 10: Safety & Verification Checklist

### Before Modifying OpenCode Config

**MANDATORY CHECKS:**
- [ ] Have a backup of current `opencode.json`
- [ ] Validate JSON syntax: `python -m json.tool opencode.json > /dev/null`
- [ ] Test config doesn't break startup: `opencode --help`
- [ ] All file paths exist and readable
- [ ] All plugins have valid syntax: `node -c plugin.js`
- [ ] No conflicting hook registrations
- [ ] Environment variables don't interfere

### Before Deploying Plugin

**SECURITY CHECKLIST:**
- [ ] No arbitrary code execution
- [ ] No file system access outside allowed paths
- [ ] No hardcoded credentials
- [ ] No network calls to untrusted sources
- [ ] Error handling for all async operations
- [ ] Plugin doesn't access other plugins' state

### Before Publishing Skill

**QUALITY CHECKLIST:**
- [ ] All code examples tested
- [ ] Links are current and valid
- [ ] No outdated information
- [ ] Cross-references accurate
- [ ] Examples are production-ready
- [ ] Gotchas are clearly marked

### Rollback Procedures

**If config breaks:**
```bash
# Restore from backup
cp ~/.config/opencode/opencode.json.backup ~/.config/opencode/opencode.json

# Verify
opencode --help
```

**If plugin breaks:**
```bash
# Remove from opencode.json plugin array
# Or set enabled: false in mcp section
# Restart CLI
```

**If skill has wrong info:**
```bash
# Delete from ~/.config/opencode/skill/<name>/
# Recreate with correct content
```

---

## Part 11: Common Gotchas & Solutions

### Problem: "Hook not firing"
**Cause:** Not registered in `init` or plugin not loaded  
**Solution:** Add `console.log` in hook to verify. Check that plugin is in `opencode.json`.

### Problem: "Config changes don't apply"
**Cause:** CLI caches config in memory  
**Solution:** Restart OpenCode CLI. Environment variables override config files.

### Problem: "Plugin loads but tool missing"
**Cause:** Tool not exported in plugin  
**Solution:** Verify `module.exports.tools` has the tool. Check tool name matches exactly.

### Problem: "Skill not discoverable"
**Cause:** Wrong file location or missing name in YAML  
**Solution:** Verify at `~/.config/opencode/skill/<name>/SKILL.md`. Check `name:` field in YAML.

### Problem: "MCP server won't start"
**Cause:** Wrong command or missing dependencies  
**Solution:** Test command manually: `npx -y mcp-package`. Check npm package name.

### Problem: "Config merge unexpected"
**Cause:** Environment variables or project-level config overriding  
**Solution:** Check env with `printenv | grep OPENCODE`. Check `.opencode/opencode.json` exists.

---

## Part 12: Quick Debugging Guide

### Enable Debug Mode
```bash
opencode --debug <command>
```

Shows:
- Hook execution order
- Config loading
- Plugin initialization
- MCP server connections

### Validate Configuration
```bash
python -m json.tool ~/.config/opencode/opencode.json
```

### Check Loaded Plugins
```bash
opencode --debug help
# Look for "Plugin X loaded" messages
```

### Test MCP Server
```bash
opencode --mcp-test server-name
```

### Search Available Skills
```bash
ls -la ~/.config/opencode/skill/
```

### Watch Config Loading
```bash
OPENCODE_DEBUG=1 opencode --help
```

---

## Master Reference: Platform Modification Decision Tree

```
Do you want to...

├─ Modify WHEN commands run?
│  └─ Create a hook (in plugin)
│
├─ Modify HOW commands run?
│  └─ Create a hook + modify agent
│
├─ Add new command?
│  └─ Create ~/.config/opencode/command/<name>.md
│
├─ Add new agent?
│  └─ Create ~/.config/opencode/agent/<name>.md
│
├─ Add new tool?
│  ├─ Simple: Register MCP server in opencode.json
│  └─ Complex: Create plugin with tools
│
├─ Teach agents better?
│  └─ Create ~/.config/opencode/skill/<name>/SKILL.md
│
├─ Intercept file writes?
│  └─ Create beforeWrite/afterWrite hooks
│
├─ Integrate external service?
│  └─ Create MCP server or plugin with fetch calls
│
└─ Debug system behavior?
   └─ Run opencode --debug or OPENCODE_DEBUG=1
```

---

## Files to Know

| File | What | How to Modify |
|------|------|---------------|
| `~/.config/opencode/opencode.json` | Main config | Direct JSON edit (restart needed) |
| `~/.config/opencode/agent/*.md` | Agent defs | Create/edit files |
| `~/.config/opencode/command/*.md` | Commands | Create/edit files |
| `~/.config/opencode/skill/**/SKILL.md` | Skills | Create/edit files |
| `~/.config/opencode/plugin/*.js` | Plugins | Create/edit files (restart needed) |
| `~/.config/opencode/AGENTS.md` | Agent directives | Edit directly |
| `~/.opencode/parts/` | Core system | DON'T MODIFY |
| `~/.opencode/memory.jsonl` | Persistent memory | DON'T MODIFY |

---

## Success Criteria for OpenCode Modifications

✅ **Done correctly when:**
- Configuration validates: `python -m json.tool config.json`
- CLI starts without errors: `opencode --help`
- Features work as intended
- No side effects on other features
- Rollback possible (backup exists)
- Documented for future reference

❌ **Wrong when:**
- CLI won't start
- Cryptic error messages
- Features mysteriously broken
- Can't rollback changes
- Undocumented side effects
- Config contradicts agent directives

---

## Advanced Topics

### Custom Agent with Special Instructions

See `.claude/AGENTS.md` for comprehensive agent directives that apply to ALL agents. When creating custom agents, align with these principles:
- Hermeneutic circle methodology for understanding
- Parallel agent dispatch for complex tasks
- Ultrawork protocol for high performance
- Evidence-based verification

### Plugin-Agent Integration

**Pattern: Plugins enhance agents**

```javascript
// plugin.js
module.exports = {
  name: 'enhancement-plugin',
  async init(hooks, config) {
    // Listen to agent runs
    hooks.after('agent', async (p) => {
      console.log(`Agent ${p.agentId} completed in ${p.duration}ms`);
    });
    
    // Enhance agent config
    hooks.before('agent', async (p) => {
      if (p.agentId === 'research') {
        p.config.temperature = 0.8;  // More creative
      }
      return p;
    });
  }
};
```

### Multi-Phase Modifications

**Pattern: Break complex changes into phases**

1. Phase 1: Add config field without using it
2. Phase 2: Add plugin that reads the field
3. Phase 3: Add agent that leverages plugin
4. Phase 4: Add command that uses agent
5. Phase 5: Document in skill

This prevents breaking changes and enables rollback at each phase.

---

## When Things Break

1. **Check logs:** `opencode --debug`
2. **Validate config:** `python -m json.tool opencode.json`
3. **Test minimal config:** Start with `{"$schema": "..."}`
4. **Restart everything:** Kill CLI, restart
5. **Check environment:** `env | grep OPENCODE`
6. **Rollback to backup:** `cp opencode.json.backup opencode.json`
7. **Clear cache:** `rm -rf ~/.opencode/cache/` (if exists)

---

## Final Checklist Before Declaring "Done"

When modifying OpenCode, verify:

- [ ] Configuration is valid JSON
- [ ] CLI starts without errors
- [ ] All plugins load successfully
- [ ] Hooks fire in correct order
- [ ] Skills are discoverable
- [ ] Agents have correct model/temperature
- [ ] Commands work as expected
- [ ] Tools are registered
- [ ] MCP servers connect
- [ ] No conflicts with existing features
- [ ] Rollback procedure documented
- [ ] Changes logged or documented

**Only then** is the modification complete.

---

**Last Updated**: 2026-01-21  
**Compatibility**: OpenCode 1.0+  
**Author**: AI System - OpenCode Expert Skill
