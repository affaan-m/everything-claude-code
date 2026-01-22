# Oh My Claude Code

Principles-first workflow system for Claude Code.

## Installation

### For Humans

Copy and paste this to Claude Code:

```
Install oh-my-claude-code by following:
https://raw.githubusercontent.com/kekmodel/oh-my-claude-code/master/README.md
```

### For LLM Agents

```bash
git clone https://github.com/kekmodel/oh-my-claude-code.git /tmp/omcc
mkdir -p ~/.claude/agents ~/.claude/rules
cp /tmp/omcc/agents/*.md ~/.claude/agents/
cp /tmp/omcc/rules/*.md ~/.claude/rules/
rm -rf /tmp/omcc
```

## What's Included

**Rules**
- `principles.md` - 7 core principles
- `workflow.md` - Agent/tool orchestration

**Agents**
- `research.md` - External docs lookup
- `architect.md` - System design
- `verify.md` - Validation
- `refine.md` - Cleanup

## License

MIT
