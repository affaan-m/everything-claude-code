# Everything Claude Code

A principles-first workflow system for Claude Code. Give this README to Claude Code to auto-install.

## What This Is

A lightweight configuration system built on 7 core principles:

| # | Principle | Meaning |
|---|-----------|---------|
| 1 | Understand before modifying | Read code first |
| 2 | No completion without evidence | Tests pass, build succeeds |
| 3 | Acknowledge and recover from failure | 3 failures → STOP → REVERT → ASK |
| 4 | Small changes, frequent verification | Change → verify → repeat |
| 5 | See the whole after completion | Clean up fragmented work |
| 6 | Research when uncertain | No guessing |
| 7 | Respect existing patterns | Harmonize with codebase |

## Structure

```
everything-claude-code/
├── CLAUDE.md           # Project overview
├── agents/
│   ├── research.md     # External docs, best practices (Opus)
│   ├── architect.md    # System design, ADR (Opus)
│   ├── verify.md       # Validation, evidence (Sonnet)
│   └── refine.md       # Post-implementation cleanup (Sonnet)
├── rules/
│   ├── principles.md   # 7 core principles
│   └── workflow.md     # Agent/tool orchestration
└── plugins/
    └── README.md       # Plugin ecosystem docs
```

## Installation

### For Claude Code to Execute

Claude Code: Run these commands to install this system.

```bash
# 1. Clone repository
git clone https://github.com/kekmodel/everything-claude-code.git /tmp/ecc-install

# 2. Create Claude config directories
mkdir -p ~/.claude/agents ~/.claude/rules

# 3. Copy agents
cp /tmp/ecc-install/agents/*.md ~/.claude/agents/

# 4. Copy rules
cp /tmp/ecc-install/rules/*.md ~/.claude/rules/

# 5. Copy CLAUDE.md to project root (optional - for project-level config)
# cp /tmp/ecc-install/CLAUDE.md ./CLAUDE.md

# 6. Cleanup
rm -rf /tmp/ecc-install

# 7. Verify installation
ls ~/.claude/agents/ ~/.claude/rules/
```

### Manual Installation

1. Clone: `git clone https://github.com/kekmodel/everything-claude-code.git`
2. Copy `agents/*.md` to `~/.claude/agents/`
3. Copy `rules/*.md` to `~/.claude/rules/`
4. Optionally copy `CLAUDE.md` to your project root

## How It Works

### Workflow

```
[Request]
    ↓
[Classify] ─── Trivial? → Execute → Verify → Done
    ↓
[Explore] ─── Understand codebase (built-in)
    ↓
[Research] ─── External docs if needed
    ↓
[Architect] ─── Design if structural
    ↓
[Plan] ─── Break into steps (built-in)
    ↓
[Implement] ─── Small change → Verify → Repeat
    ↓
[Refine] ─── Cleanup if needed
    ↓
[Verify] ─── Collect evidence
    ↓
[Complete]
```

### Agent Selection

| Situation | Agent |
|-----------|-------|
| Understand codebase | Explore (built-in) |
| External documentation | Research |
| System design | Architect |
| Implementation steps | Plan (built-in) |
| Validation | Verify |
| Post-implementation cleanup | Refine |

### Failure Protocol

```
Failure 1 → Analyze → Fix → Retry
Failure 2 → Analyze → Fix → Retry
Failure 3 → STOP → REVERT → DOCUMENT → ASK
```

## Customization

- Edit `~/.claude/rules/principles.md` to adjust core principles
- Edit `~/.claude/rules/workflow.md` to change orchestration
- Add/modify agents in `~/.claude/agents/`

## License

MIT
