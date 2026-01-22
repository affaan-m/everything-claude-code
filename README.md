# Everything Claude Code

Principles-first workflow system for Claude Code.

## Install

```bash
git clone https://github.com/kekmodel/everything-claude-code.git /tmp/ecc
mkdir -p ~/.claude/agents ~/.claude/rules
cp /tmp/ecc/agents/*.md ~/.claude/agents/
cp /tmp/ecc/rules/*.md ~/.claude/rules/
rm -rf /tmp/ecc
```

## What's Included

**Rules** - Always-follow guidelines
- `principles.md` - 7 core principles
- `workflow.md` - Agent/tool orchestration

**Agents** - Specialized subagents
- `research.md` - External docs lookup
- `architect.md` - System design
- `verify.md` - Validation
- `refine.md` - Cleanup

## License

MIT
