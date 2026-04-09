---
description: Interactive guide to learn and navigate the everything-claude-code project
---

# /ecc-guide - Everything Claude Code Project Guide

> **Note**: This command is a shim for the `ecc-guide` skill. For full documentation, see `skills/ecc-guide/SKILL.md`.

## Usage

```
/ecc-guide [$ARGUMENTS]
```

**Arguments:**
- `setup` - Installation and configuration guide
- `skills` - Browse and understand available skills
- `commands` - Learn about available commands
- `rules` - Understand coding rules and hooks
- `workflows` - Discover recommended development workflows
- `examples` - See real-world usage examples
- `<feature-name>` - Direct lookup for specific skill/command (e.g., `tdd-workflow`)
- `find: "<query>"` - Search across all skills and commands
- (no argument) - Start interactive conversation

## Purpose

Interactive assistant to help users learn and navigate the everything-claude-code project. Acts as a conversational documentation layer that helps users discover features, understand workflows, and find the right tools for their tasks.

**Problem It Solves:**
- High learning curve for new users (80+ skills and commands)
- Poor feature discoverability
- Static documentation gap (README comprehensive but not conversational)
- Context switching (users leave IDE to read docs)

**Value Proposition:**
- Lower barrier to entry without reading all documentation
- Feature discovery through natural language
- Conversational learning experience
- Faster onboarding through doing

## Quick Examples

### Initial Onboarding
```
/ecc-guide

-> Welcome message with quick-start options
```

### Skill Discovery
```
/ecc-guide skills

-> Categorized list of available skills
```

### Direct Feature Lookup
```
/ecc-guide tdd-workflow

-> Detailed explanation of the TDD workflow skill
```

### Search Mode
```
/ecc-guide find: "code review"

-> Search results across skills and commands
```

## Command Behavior

- **No arguments**: Interactive conversation mode
- **Topic keyword**: Direct access to that topic (setup/skills/commands/etc.)
- **Feature name**: Lookup specific skill or command
- **`find:` prefix**: Search mode

## Related

- `/learn` - Learn from past coding sessions
- `/docs` - Access project documentation
- `/skill-create` - Create new skills
- `skills/ecc-guide/SKILL.md` - Full skill documentation

## Implementation

This command activates the `ecc-guide` skill, which:
1. Parses user intent (onboarding/discovery/usage/support)
2. Dynamically loads relevant project files
3. Uses progressive disclosure (high-level first, drill down on request)
4. Provides context-aware responses

For technical details, maintenance notes, and contributor guidelines, see `skills/ecc-guide/SKILL.md`.
