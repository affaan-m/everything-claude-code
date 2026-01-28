# Clawdbot Installation Guide

This repository is now compatible with [Clawdbot](https://clawdbot.com) as a plugin.

## Quick Install

```bash
# Install via Clawdbot CLI
clawdbot plugins install https://github.com/chunrui-qashier/everything-claude-code

# Or install from local clone
git clone https://github.com/chunrui-qashier/everything-claude-code.git
clawdbot plugins install ./everything-claude-code
```

## Manual Installation

If you prefer to install skills individually:

```bash
# Clone the repo
git clone https://github.com/chunrui-qashier/everything-claude-code.git

# Copy specific skills to Clawdbot skills directory
cp -r everything-claude-code/skills/tdd-workflow ~/.clawdbot/skills/
cp -r everything-claude-code/skills/planning-with-files ~/.clawdbot/skills/
cp -r everything-claude-code/skills/quant-research ~/.clawdbot/skills/
# ... or any other skills you want
```

## Included Skills

### 🆕 New Skills (Clawdbot Exclusive)

| Skill | Description |
|-------|-------------|
| 📋 **planning-with-files** | Manus-style persistent planning (the $2B workflow) |
| 📿 **beads-task-tracker** | Git-backed distributed task tracking |
| 🐝 **multi-agent-swarm** | Coordinate parallel AI agents |
| 📈 **quant-research** | Quantitative finance research tools |
| 🔬 **deep-research** | Autonomous multi-step research methodology |

### 📦 Existing Skills (Updated for Clawdbot)

| Skill | Description |
|-------|-------------|
| 🧪 **tdd-workflow** | Test-driven development with 80%+ coverage |
| 🧠 **continuous-learning-v2** | Instinct-based learning with confidence scoring |
| ✅ **verification-loop** | Pre-PR verification checks |
| 📏 **coding-standards** | Language best practices |
| 🔧 **backend-patterns** | API, database, caching patterns |
| 🎨 **frontend-patterns** | React, Next.js patterns |
| 🐹 **golang-patterns** | Go idioms and best practices |
| 🧪 **golang-testing** | Go testing patterns and TDD |
| 🐘 **postgres-patterns** | PostgreSQL patterns and optimization |
| 🔒 **security-review** | Security checklist and review |
| 📦 **strategic-compact** | Context compaction strategies |

## Configuration

After installation, configure in your Clawdbot config:

```json5
{
  plugins: {
    entries: {
      "everything-claude-code": {
        enabled: true,
        config: {
          enabledSkills: []  // Empty = all skills enabled
          // Or specify: ["tdd-workflow", "quant-research"]
        }
      }
    }
  }
}
```

## Usage

Skills are automatically available. Use them naturally in conversation:

```
"Use the TDD workflow to build a user authentication system"

"Apply the planning-with-files pattern for this complex task"

"Help me research algorithmic trading strategies"
```

## Compatibility

- **Clawdbot**: ✅ Full support (this file)
- **Claude Code**: ✅ Original plugin format still works
- **Linux/macOS/Windows**: ✅ All platforms supported

## Updating

```bash
# Update the plugin
clawdbot plugins update everything-claude-code

# Or manually pull updates
cd ~/.clawdbot/extensions/everything-claude-code
git pull
```

## Support

- [GitHub Issues](https://github.com/chunrui-qashier/everything-claude-code/issues)
- [Clawdbot Docs](https://docs.clawd.bot)
