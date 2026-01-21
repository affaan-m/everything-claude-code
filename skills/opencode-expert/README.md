# OpenCode Expert Suite

Master skill and command set for OpenCode platform expertise. Enables agents to create, configure, and deploy OpenCode extensions with complete confidence.

## What's Included

### 📚 Core Skill: `opencode-expert`

**File**: `SKILL.md` (~3500 words)

Comprehensive knowledge base covering:
- OpenCode architecture and philosophy
- Configuration system (global vs project)
- Plugin architecture and lifecycle
- Hook system with execution timeline
- Skill creation and deployment
- MCP server integration
- Security best practices
- Common failure recovery

**Use When**:
- Creating new plugins, hooks, or skills
- Debugging OpenCode configuration
- Understanding component interaction
- Recovering from failures
- Implementing MCP servers

### 🤖 Specialist Agent: `opencode-specialist`

**File**: `~/.config/opencode/agent/opencode-specialist.md`

Dedicated agent for OpenCode platform work with expertise in:
- Plugin development
- Hook implementation
- Skill creation
- Configuration management
- Component testing and deployment

**Activate When**:
- You need to create a plugin
- Implementing hooks
- Debugging OpenCode
- Need help with component structure

### 🛠️ Command Suite (6 Commands)

All commands discoverable via `opencode --help` and named `opencode-*`:

#### 1. **opencode-config** - Configuration Inspector
- Show/validate config files
- Display config precedence
- List all loaded components
- Check for common issues

**Use For**:
- Understanding active configuration
- Validating config syntax before deploying
- Comparing local vs global config

#### 2. **opencode-hooks** - Hook Debugger
- List registered hooks
- Test hook execution
- Enable hook tracing
- View hook execution timeline

**Use For**:
- Debugging why hooks don't fire
- Understanding hook execution order
- Testing custom hooks
- Finding performance bottlenecks

#### 3. **opencode-plugins** - Plugin Manager
- List/validate/test plugins
- Enable/disable plugins
- Install new plugins
- Diagnose plugin issues

**Use For**:
- Managing installed plugins
- Testing plugins before deployment
- Troubleshooting plugin loading issues

#### 4. **opencode-doctor** - Health Checker
- Comprehensive system diagnostics
- Configuration validation
- Component structure checks
- Path portability verification
- MCP server health

**Use For**:
- Finding configuration errors
- Diagnosing mysterious behavior
- Before deploying to production
- Recovering from broken setup

#### 5. **opencode-mcp** - MCP Server Manager
- Add/test/configure MCP servers
- Health monitoring
- Tool listing and testing
- Performance analysis

**Use For**:
- Setting up MCP servers
- Testing MCP connectivity
- Debugging tool integration
- Performance troubleshooting

#### 6. **opencode-deploy** - Deployment Tool
- Deploy skills/plugins to global config
- Validate deployment
- Create backups
- Handle rollbacks

**Use For**:
- Moving local components to global
- Safe deployment with validation
- Creating deployment backups

## Directory Structure

```
~/.config/opencode/
├── skill/
│   └── opencode-expert/
│       ├── SKILL.md              # Main skill (3500 words)
│       ├── README.md             # This file
│       └── references/           # Detailed reference docs (if needed)
│           ├── config-reference.md
│           ├── hook-lifecycle.md
│           └── ...
│
├── agent/
│   └── opencode-specialist.md    # Specialist agent
│
└── command/
    ├── opencode-config.md        # Config inspector
    ├── opencode-hooks.md         # Hook debugger
    ├── opencode-plugins.md       # Plugin manager
    ├── opencode-doctor.md        # Health checker
    ├── opencode-mcp.md          # MCP manager
    └── opencode-deploy.md       # Deployment tool
```

## Quick Start

### 1. Verify Installation

```bash
# Check skill loads
opencode --skill-search opencode-expert

# Check agent exists
opencode --list-agents | grep opencode-specialist

# Check commands available
opencode --help | grep opencode-
```

### 2. Use the Skill

Ask any agent about OpenCode:

```
"How do I create an OpenCode plugin?"
"Help me add a PreToolUse hook"
"Debug why my skill isn't appearing"
"What's the correct path for MCP servers?"
```

The `opencode-expert` skill will automatically activate.

### 3. Use the Specialist Agent

For complex OpenCode work:

```
"I need to create a complete plugin with hooks and commands"
"Debug why my OpenCode setup is broken"
"Help me set up an MCP server correctly"
```

### 4. Use the Commands

```bash
# Check your configuration
opencode --opencode-config show

# Diagnose issues
opencode --opencode-doctor

# Manage plugins
opencode --opencode-plugins list

# Test hooks
opencode --opencode-hooks trace

# Set up MCP
opencode --opencode-mcp list
opencode --opencode-mcp test web-search

# Deploy globally
opencode --opencode-deploy skill /path/to/skill
```

## Common Workflows

### Workflow: Create a New Plugin

```bash
# 1. Create local plugin structure
mkdir -p .opencode/plugin/my-plugin/{commands,hooks/scripts}

# 2. Create plugin manifest
cat > .opencode/plugin/my-plugin/.claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin"
}
EOF

# 3. Add components (commands, hooks, agents, etc)
# ... create files ...

# 4. Validate before deployment
opencode --opencode-doctor

# 5. Deploy to global config
opencode --opencode-deploy plugin .opencode/plugin/my-plugin

# 6. Verify
opencode --opencode-plugins list
```

### Workflow: Add a Hook

```bash
# 1. Ask the specialist agent
"Add a PreToolUse hook to validate API keys"

# 2. Specialist creates hooks/hooks.json and scripts

# 3. Validate
opencode --opencode-hooks validate

# 4. Test with tracing
opencode --opencode-hooks trace
# ... run a command ...
opencode --opencode-hooks timeline

# 5. Deploy globally
opencode --opencode-deploy plugin .opencode/plugin/api-validator
```

### Workflow: Diagnose Issues

```bash
# 1. Run doctor
opencode --opencode-doctor --verbose

# 2. Read detailed findings

# 3. Apply suggested fixes

# 4. Run doctor again to verify
opencode --opencode-doctor
```

### Workflow: Set Up MCP Server

```bash
# 1. Add server
opencode --opencode-mcp add web-search \
  --type=local \
  --command="npx -y @modelcontextprotocol/server-exa"

# 2. Test connectivity
opencode --opencode-mcp test web-search

# 3. List available tools
opencode --opencode-mcp info web-search

# 4. Make test call
opencode --opencode-mcp call web-search search "test"

# 5. Check health
opencode --opencode-mcp health
```

## Key Concepts

### Configuration Hierarchy

1. **Project** (highest priority): `.opencode/opencode.json`
2. **Global** (medium priority): `~/.config/opencode/opencode.json`
3. **Defaults** (lowest): Built-in OpenCode defaults

Project config overrides global config.

### Component Discovery

Components are auto-discovered from these locations:

| Component | Global | Project |
|-----------|--------|---------|
| Skills | `~/.config/opencode/skill/*/` | `.opencode/skill/*/` |
| Commands | `~/.config/opencode/command/` | `.opencode/command/` |
| Plugins | `~/.config/opencode/plugin/` | `.opencode/plugin/` |
| Agents | `~/.config/opencode/agent/` | `.opencode/agent/` |
| Hooks | `~/.config/opencode/hook/` | `.opencode/hook/` |

### Path Portability

**Always use environment variables, never hardcoded paths**:
- `${OPENCODE_PLUGIN_ROOT}` - Project `.opencode/` directory
- `${CLAUDE_PLUGIN_ROOT}` - Global `~/.config/opencode/` directory
- `${HOME}` - User home directory

### Hook Lifecycle

```
User invokes command
  ↓
startup → beforeCommand → [COMMAND] → afterCommand
             ↓ Can block       ↓ Info only
  ↓
beforeAgent → [AGENT] → afterAgent
    ↓ Can block    ↓ Info only
  ↓
beforeWrite → [FILE WRITES] → afterWrite
    ↓ Can block          ↓ Info only
  ↓
shutdown → User sees result
```

## Best Practices

### ✅ DO

- Validate JSON/YAML before deploying
- Test components locally first (`.opencode/`)
- Use environment variables for secrets
- Backup before making changes
- Document your extensions
- Use portable paths with `${...}` variables
- Keep plugins focused and single-purpose
- Enable only servers you actively use

### ❌ DON'T

- Hardcode absolute paths
- Deploy untested components
- Store credentials in config files
- Ignore doctor warnings
- Create duplicate component names
- Run too many MCP servers simultaneously
- Modify `.opencode/parts/` (core system)
- Suppress errors in hooks

## Verification Checklist

Before declaring an OpenCode extension complete:

- [ ] Syntax validated (JSON/YAML)
- [ ] Component discoverable in correct location
- [ ] Functionality tested locally
- [ ] Doctor reports no critical issues
- [ ] Paths use portable variables
- [ ] Security concerns addressed
- [ ] Documentation clear
- [ ] Rollback plan documented

## Troubleshooting

### Command not appearing in help
1. Check location: `.opencode/command/<name>.md` or `~/.config/opencode/command/<name>.md`
2. Check extension: Must be `.md`
3. Validate frontmatter: YAML between `---` markers
4. Check command name: Filename (without .md) becomes command name

### Hook not firing
1. Check hook event name matches: `PreToolUse`, `PostToolUse`, `Stop`, etc.
2. Validate hook JSON syntax: `python -m json.tool hooks.json`
3. Check script is executable: `chmod +x script.sh`
4. Enable tracing: `opencode --opencode-hooks trace`

### Plugin won't load
1. Check plugin location: `.opencode/plugin/` or `~/.config/opencode/plugin/`
2. Check manifest: `.claude-plugin/plugin.json` with required fields
3. Validate JSON: `python -m json.tool plugin.json`
4. Check permissions: Can OpenCode read all files?

### Component not discoverable
1. Check file location matches discovery rules (see table above)
2. Check file extension (`.md` for skills/commands, `.json` for configs)
3. Check file naming matches component naming rules
4. Run doctor: `opencode --opencode-doctor`

## When to Use Each Command

| Situation | Command |
|-----------|---------|
| "What config is active?" | `opencode-config` |
| "Why isn't my command appearing?" | `opencode-doctor` |
| "Hook isn't firing" | `opencode-hooks` |
| "Plugin won't load" | `opencode-plugins` |
| "Full system health check" | `opencode-doctor --verbose` |
| "Set up new tool provider" | `opencode-mcp` |
| "Move local plugin globally" | `opencode-deploy` |

## Integration with Other Skills

This skill suite works alongside other OpenCode skills:

- **Use with any technical skill** when OpenCode modifications are needed
- **Use with planning agents** to architect OpenCode extensions
- **Use with debugging agents** when components misbehave
- **Use with code-reviewer** to validate component quality

The `opencode-specialist` agent automatically loads the `opencode-expert` skill for all OpenCode work.

## Examples

### Example: Minimal Plugin
```
Structure:
  .opencode/plugin/hello/
  ├── .claude-plugin/plugin.json
  └── commands/hello.md

Result: Plugin with one command
```

### Example: Complete Plugin
```
Structure:
  .opencode/plugin/api-tools/
  ├── .claude-plugin/plugin.json
  ├── commands/
  │   └── fetch-api.md
  ├── agents/
  │   └── api-analyzer.md
  ├── hooks/
  │   ├── hooks.json
  │   └── scripts/validate-key.sh
  └── skill/
      └── api-integration/SKILL.md

Result: Plugin with commands, hooks, agents, and skill
```

### Example: Testing Workflow
```bash
# Create in project
.opencode/plugin/my-plugin/

# Validate
opencode --opencode-doctor

# Trace execution
opencode --opencode-hooks trace

# Deploy globally
opencode --opencode-deploy plugin .opencode/plugin/my-plugin

# Verify
opencode --opencode-plugins list
opencode --opencode-plugins info my-plugin
```

## Support & Resources

### In-Skill Documentation
The `SKILL.md` file contains comprehensive documentation including:
- Quick reference matrices
- Lifecycle diagrams
- Code examples
- Troubleshooting guide
- Security checklist

### Commands with Built-In Help
Each command has detailed help:
```bash
opencode --opencode-config help
opencode --opencode-doctor help
opencode --opencode-mcp help
```

### Specialist Agent
Ask the specialist agent for help:
```
"Help me debug why my plugin isn't loading"
"Create a new MCP server integration"
"What's the best practice for this hook?"
```

## Version

- **Skill**: opencode-expert v1.0.0
- **Suite**: 6 commands + 1 agent
- **Compatibility**: OpenCode 1.0+
- **Last Updated**: 2026-01-21

## License

MIT - Use freely, modify as needed, contribute improvements back!

---

## Next Steps

1. **Verify installation**: Run the Quick Start checks
2. **Read SKILL.md**: Understand OpenCode architecture
3. **Try the commands**: Experiment with `opencode-config` and `opencode-doctor`
4. **Use the specialist agent**: Ask it to create a test component
5. **Deploy to production**: Once comfortable, deploy real extensions

**You're now equipped to modify and extend OpenCode with confidence!** 🚀
