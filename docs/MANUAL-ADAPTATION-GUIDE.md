# Manual Adaptation Guide for Non-Native Harnesses

This guide documents how to adapt **everything-claude-code (ECC)** to AI harnesses that don't support the native ECC folder layouts (like Grok, Claude Desktop, etc.).

## Table of Contents

- [When to Use This Guide](#when-to-use-this-guide)
- [Quick Start](#quick-start)
- [Minimal Skill Selection](#minimal-skill-selection)
- [Context Compression](#context-compression)
- [Command/Hook Reproduction](#commandhook-reproduction)
- [Harness Comparison](#harness-comparison)
- [Limitations](#limitations)

---

## When to Use This Guide

Use this guide if your target harness:

- ❌ Doesn't support `.claude/` or `.cursorrules` auto-loading
- ❌ Doesn't support custom commands (`/command`)
- ❌ Doesn't support hooks (prePrompt, onDiskWrite, etc.)
- ❌ Has limited or no filesystem access

**First-class targets** (native support): Claude Code, Cursor, Codex, Opencode, CodeBuddy

**Second-class targets** (this guide): Grok, Claude Desktop, other LLM interfaces

---

## Quick Start

```bash
# 1. Install repomix for context packing
npm install -g repomix

# 2. Pack only the skills you need
repomix --include "skills/python-patterns,skills/tdd-workflow" --output packed.md

# 3. Feed packed.md at session start
# Your AI harness will now have the skill context loaded
```

---

## Minimal Skill Selection

### By Task Type

| Task Type | Minimal Skills |
|----------|----------------|
| General coding | `python-patterns` or `javascript-patterns` |
| Debugging | `debugging`, `error-analysis` |
| API work | `api-design`, `rest-api-patterns` |
| Testing | `tdd-workflow`, `testing` |
| Security | `security-review` |

### Priority Order

1. **Language patterns** - Your primary language idiom
2. **Framework patterns** - Your specific framework
3. **Workflow skill** - TDD, refactoring, etc.
4. **Domain knowledge** - Security, API design, etc.

---

## Context Compression

### Using Repomix

```bash
# Pack specific skills
repomix --include "skills/tdd-workflow,skills/python-patterns" --output tdd-context.md

# Pack only agents
repomix --include "agents/planner,agents/reviewer" --output agents.md

# Pack rules
repomix --include "rules/global.md" --output rules.md
```

### Manual Compression Tips

1. **Keep skill headers** - The activation triggers (`## When to Activate`) are critical
2. **Extract code examples** - Copy actual code blocks, skip verbose explanations
3. **Use XML tags** - Some harnesses respond better to:
   ```xml
   <skill name="tdd-workflow">
   <trigger>When test-driven development is needed</trigger>
   <steps>
   1. Write failing test
   2. Make pass
   3. Refactor
   </steps>
   </skill>
   ```

---

## Command/Hook Reproduction

### Commands

Define a **Command Registry** in your system instructions:

```
# Command Registry
- /plan: Execute [planner] agent logic
- /tdd: Apply the [tdd-workflow] skill
- /review: Run [code-reviewer] agent
- /test: Run test suite with coverage
```

### Hooks (Reproduced via System Prompt)

**onDiskWrite hook:**
```
# onDiskWrite Hook
Before writing to disk, run these checks:
1. Validate syntax (language-appropriate linter)
2. Check for secrets/keys in the content
3. Ensure proper file permissions (644 for code, 600 for secrets)
```

**prePrompt hook:**
```
# prePrompt Hook
Before responding, verify:
1. Did you answer the user's actual question?
2. Are there any security concerns with the code?
3. Should any hooks have triggered?
```

---

## Harness Comparison

| Feature | Claude Code | Grok | Claude Desktop |
|---------|-------------|------|----------------|
| Native ECC | ✅ | ❌ | ❌ |
| Custom Commands | ✅ | ❌ | Limited |
| Hooks | ✅ | ❌ | Limited |
| Context Packing | ✅ | ✅ (manual) | ✅ (manual) |
| Agent Files | ✅ | ❌ (manual) | ❌ |
| Auto-activation | ✅ | ❌ | ❌ |

---

## Limitations

When using manual adaptation, you lose:

1. **Auto-activation** - Skills won't auto-load based on context
2. **Native commands** - Must define command registry manually
3. **Hook automation** - Must manually add hook logic to prompts
4. **Agent orchestration** - Must manually invoke agents

### Mitigation Strategies

| Lost Feature | Workaround |
|--------------|------------|
| Auto-activation | Include `<skill name="...">` triggers in every prompt |
| Commands | Define Command Registry in system instructions |
| Hooks | Add hook logic to your base prompt |
| Agents | Copy agent logic directly into prompts |

---

## Example: Grok Setup

1. **Pack your context:**
   ```bash
   repomix --include "skills/tdd-workflow,skills/python-patterns,rules/" --output grok-context.md
   ```

2. **Add to Custom Instructions:**
   ```
   # ECC Context (load at session start)
   [ paste grok-context.md here ]
   
   # Command Registry
   - /plan: Use planner agent logic from context
   - /tdd: Use tdd-workflow skill
   - /review: Use code-reviewer agent
   
   # Hooks
   - onDiskWrite: Run lint check and secret scan before writing
   ```

3. **Test:**
   ```bash
   /tdd
   # Should trigger TDD workflow from your packed context
   ```

---

## Related Issues

- [#1077](https://github.com/affaan-m/everything-claude-code/discussions/1077) - Grok discussion
- [#1070](https://github.com/affaan-m/everything-claude-code/issues/1070) - Non-harness compatibility