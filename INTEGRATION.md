# OpenCode Expert Suite Integration Guide

## Overview

The **OpenCode Expert Suite** is a comprehensive platform toolkit that enables Claude Code agents to confidently create, modify, and debug OpenCode components. This integration adds:

- **1 Master Skill** (`opencode-expert`): 1,000+ lines of platform architecture knowledge
- **1 Specialist Agent** (`opencode-specialist`): Orchestrates OpenCode modifications with confidence
- **6 Diagnostic Commands**: Configuration, hooks, plugins, MCP servers, deployment, and health checks

**Total Size**: 8 files, ~2,500 lines of platform expertise

---

## Quick Start

### 1. Install Globally

```bash
# From the repository root
cd everything-claude-code

# Symlink to global OpenCode config (macOS/Linux)
ln -s "$(pwd)/skills/opencode-expert" ~/.config/opencode/skill/opencode-expert
ln -s "$(pwd)/agents/opencode-specialist.md" ~/.config/opencode/agent/opencode-specialist.md

# Copy commands
cp commands/opencode-*.md ~/.config/opencode/command/
```

**Windows Users**: Use `mklink /d` for directory symlinks, or copy files directly.

### 2. Verify Installation

```bash
# Check skill loads
opencode --skill-search opencode-expert

# Check specialist agent is discoverable
opencode --list-agents | grep opencode-specialist

# List available commands
opencode --help | grep opencode-
```

**Expected Output**:
```
✓ opencode-expert: Master skill for OpenCode platform expertise
✓ opencode-specialist: OpenCode platform specialist for creating...
✓ opencode-config, opencode-deploy, opencode-doctor, opencode-hooks, opencode-mcp, opencode-plugins
```

### 3. Use the Suite

Ask any Claude Code agent to use the specialist:

```
"Create a minimal OpenCode plugin using the opencode-specialist agent.
It should add a new tool that searches the web."
```

Or use specific commands:

```
"Run opencode-doctor to check my OpenCode setup"
"Deploy my local hooks to the global config using opencode-deploy"
"List all MCP servers with opencode-mcp list"
```

---

## Component Details

### Skill: `opencode-expert`

**Location**: `skills/opencode-expert/SKILL.md`

**What It Does**:
- Provides comprehensive knowledge of OpenCode platform internals
- Covers configuration system, plugins, hooks, agents, skills, commands
- Explains MCP integration patterns
- Guides security best practices for platform modifications
- Includes recovery procedures for failed deployments

**Auto-Loading**:
When an agent needs to work on OpenCode internals, the skill loads automatically via:
```
User: "Create an OpenCode plugin"
→ Agent recognizes request scope
→ Automatically loads opencode-expert skill
→ Follows guidance from skill to implement safely
```

**Size**: 1,040 lines, covers:
- OpenCode directory structure and configuration
- Plugin architecture and lifecycle
- Hook system and triggering
- Agent creation and tool binding
- MCP server integration
- Security and validation
- Deployment and rollback procedures

### Agent: `opencode-specialist`

**Location**: `agents/opencode-specialist.md`

**What It Does**:
- Orchestrates complex OpenCode modifications
- Knows portable paths and cross-platform compatibility
- Auto-loads the `opencode-expert` skill
- Has write, edit, and bash capabilities for implementation
- Validates changes before deployment

**Execution Profile**:
```yaml
model: anthropic/claude-sonnet-4-5
temperature: 0.3  # Precise, deterministic responses
maxSteps: 50       # Sufficient for complex tasks
tools: [write, edit, bash]
```

**Use Cases**:
- Creating new plugins with proper structure
- Adding hooks to the lifecycle
- Implementing custom agents
- Debugging OpenCode configuration issues

### Commands

Each command provides targeted functionality:

| Command | Purpose | Example |
|---------|---------|---------|
| `opencode-config` | Display and validate configuration | `opencode --opencode-config show` |
| `opencode-doctor` | Diagnose and fix OpenCode issues | `opencode --opencode-doctor --verbose` |
| `opencode-plugins` | Manage installed plugins | `opencode --opencode-plugins list` |
| `opencode-hooks` | Debug hooks and lifecycle | `opencode --opencode-hooks list` |
| `opencode-mcp` | Configure MCP servers | `opencode --opencode-mcp list` |
| `opencode-deploy` | Deploy components globally | `opencode --opencode-deploy skill my-skill` |

---

## Integration Architecture

### Discovery Mechanism

The OpenCode platform auto-discovers components using directory scanning:

```
~/.config/opencode/
├── skill/
│   └── opencode-expert/
│       ├── SKILL.md          ← Loaded as skill
│       └── README.md
├── agent/
│   └── opencode-specialist.md  ← Registered as agent
├── command/
│   ├── opencode-config.md      ← Available as command
│   ├── opencode-doctor.md
│   └── ...
└── config.json
```

**Auto-Discovery Rules**:
1. Skills: Directories in `skill/` containing `SKILL.md` file
2. Agents: Files in `agent/` with `.md` extension + YAML frontmatter
3. Commands: Files in `command/` with `.md` extension + YAML frontmatter

### Deployment Patterns

#### Pattern 1: Symlink (Development)

```bash
# Link repository to global config (changes auto-reflected)
ln -s /path/to/everything-claude-code/skills/opencode-expert ~/.config/opencode/skill/opencode-expert
```

**Benefit**: Changes to skill in repo immediately available without reinstall.

#### Pattern 2: Copy (Stable Release)

```bash
# Copy skill to global config (isolated from repo changes)
cp -r skills/opencode-expert ~/.config/opencode/skill/
```

**Benefit**: Skill version is locked; won't break if repo is updated.

#### Pattern 3: Project-Local (Isolated)

```bash
# Use within a specific project only
mkdir -p .opencode/skill
cp -r skills/opencode-expert .opencode/skill/
```

**Benefit**: Project-specific version doesn't affect other projects.

### Multi-Agent Coordination

The specialist agent works with other agents using the **Haiku-Worker Pattern**:

```
┌─────────────────────────────┐
│  User Request               │
│  "Create an OpenCode plugin"│
└────────────┬────────────────┘
             │
             ▼
    ┌──────────────────┐
    │ Orchestrator     │
    │ (Sonnet 4.5)     │◄── Loads opencode-expert skill
    │ Specialist Agent │
    └────────┬─────────┘
             │
     ┌───────┴───────┐
     │ Breaks into    │
     │ 3+ tasks       │
     └───┬───┬───────┘
         │   │
         ▼   ▼
      ┌─────────┐
      │ Workers │ (Parallel)
      │ Haiku   │
      └─────────┘
         │   │
         └───┴──► Results merged
                  ↓
              Final component
              (plugin, hook, etc.)
```

---

## Usage Examples

### Example 1: Create a Plugin

```
User: "I need to create an OpenCode plugin that adds a 'summarize' command.
      Use the opencode-specialist agent to create it properly."

Result:
→ Specialist loads opencode-expert skill
→ Verifies plugin structure requirements
→ Creates plugin directory with proper layout
→ Implements the command handler
→ Validates against OpenCode schema
→ Returns ready-to-use plugin
```

### Example 2: Debug Configuration

```
User: "Something's wrong with my OpenCode setup. Run opencode-doctor to find the issue."

Result:
→ Command runs comprehensive health check
→ Checks configuration validity
→ Verifies all hooks are registered
→ Tests plugin loading
→ Reports issues with remediation steps
```

### Example 3: Deploy Components

```
User: "Deploy my custom hooks from ./.opencode/ to the global config."

Result:
→ opencode-deploy command validates hooks
→ Creates backup of existing hooks
→ Copies hooks to ~/.config/opencode/hook/
→ Verifies deployment successful
→ Reports what was deployed
```

---

## Verification Checklist

After installation, verify everything works:

- [ ] Skill appears in `opencode --skill-search opencode-expert`
- [ ] Agent appears in `opencode --list-agents`
- [ ] All 6 commands appear in `opencode --help`
- [ ] `opencode --opencode-doctor` runs without errors
- [ ] `opencode --opencode-config show` displays configuration
- [ ] Specialist agent can be invoked for a sample task
- [ ] Skill knowledge is accessible to agents

**Troubleshooting**:

| Issue | Solution |
|-------|----------|
| Skill not found | Verify `~/.config/opencode/skill/opencode-expert/SKILL.md` exists |
| Agent not listed | Check `~/.config/opencode/agent/opencode-specialist.md` has valid YAML frontmatter |
| Command not available | Ensure `~/.config/opencode/command/opencode-*.md` files are readable |
| Doctor fails | Run with `--verbose` flag for detailed diagnostics |

---

## File Structure

```
everything-claude-code/
├── skills/
│   └── opencode-expert/
│       ├── SKILL.md           (Platform expertise)
│       └── README.md          (User documentation)
├── agents/
│   └── opencode-specialist.md (Orchestration agent)
├── commands/
│   ├── opencode-config.md     (Configuration diagnostics)
│   ├── opencode-doctor.md     (Health checks)
│   ├── opencode-deploy.md     (Safe deployment)
│   ├── opencode-hooks.md      (Hook management)
│   ├── opencode-mcp.md        (MCP configuration)
│   └── opencode-plugins.md    (Plugin management)
└── INTEGRATION.md             (This file)
```

---

## Advanced: Custom Deployment

### Per-Project Installation

```bash
# Create project-local OpenCode config
mkdir -p my-project/.opencode/skill
mkdir -p my-project/.opencode/agent
mkdir -p my-project/.opencode/command

# Copy components
cp -r everything-claude-code/skills/opencode-expert my-project/.opencode/skill/
cp everything-claude-code/agents/opencode-specialist.md my-project/.opencode/agent/
cp everything-claude-code/commands/opencode-*.md my-project/.opencode/command/

# Now when working in my-project, these components override global versions
```

### Updating the Suite

When the `everything-claude-code` repository is updated:

```bash
# If using symlinks (development)
# No action needed - changes auto-reflected

# If using copies (stable)
# Re-run copy commands to update
cp -r everything-claude-code/skills/opencode-expert ~/.config/opencode/skill/
cp everything-claude-code/agents/opencode-specialist.md ~/.config/opencode/agent/
cp everything-claude-code/commands/opencode-*.md ~/.config/opencode/command/
```

---

## References

- **OpenCode Documentation**: https://opencode.docs/
- **Skill API**: https://opencode.docs/skills/
- **Agent API**: https://opencode.docs/agents/
- **Command API**: https://opencode.docs/commands/
- **Plugin Development**: https://opencode.docs/plugins/
- **MCP Integration**: https://opencode.docs/mcp/

---

## Support

For issues or questions about the OpenCode Expert Suite:

1. Run `opencode --opencode-doctor --verbose` for diagnostics
2. Check skill knowledge: Ask agent "How do I debug OpenCode?"
3. Review command documentation: `opencode --opencode-config show --help`
4. Consult `SKILL.md` directly for platform internals

---

**Last Updated**: January 21, 2026
**Suite Version**: 1.0.0
**Compatibility**: OpenCode 2026.01+, Claude Code with background_task support
