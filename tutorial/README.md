# Claude Code Tutorial for System Engineers

> A hands-on guide to mastering Claude Code — built for a system engineer
> working on RMF (Risk Management Framework) projects.

## Who Is This For?

You're a **system engineer** (possibly a fresh grad) working on federal/DoD
projects involving NIST SP 800-53, RMF, FedRAMP, STIGs, or similar compliance
frameworks. You want to use Claude Code to accelerate your work.

## What You'll Learn

Claude Code has six core features that turn it from a simple AI chatbot into a
configurable engineering tool. This tutorial teaches each one with practical
examples relevant to your work.

## The Six Core Features

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                          │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Rules    │  │ Commands │  │  Skills  │              │
│  │ (Memory)  │  │ (Actions)│  │(Workflows│              │
│  │          │  │          │  │          │              │
│  │ CLAUDE.md │  │ /command │  │ Auto-    │              │
│  │ tells     │  │ triggers │  │ detected │              │
│  │ Claude    │  │ specific │  │ reusable │              │
│  │ how to    │  │ tasks    │  │ playbooks│              │
│  │ behave    │  │          │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Hooks   │  │  Agents  │  │   MCPs   │              │
│  │(Guardrail│  │(Experts) │  │(External)│              │
│  │          │  │          │  │          │              │
│  │ Auto     │  │ Delegate │  │ Connect  │              │
│  │ actions  │  │ to       │  │ to       │              │
│  │ that     │  │ focused  │  │ GitHub,  │              │
│  │ ALWAYS   │  │ sub-AI   │  │ DBs,     │              │
│  │ run      │  │ assistants│ │ APIs     │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Quick Summary Table

| Feature | What It Is | Analogy | Example |
|---------|-----------|---------|---------|
| **Rules** | Memory files Claude reads every session | Briefing doc for a new team member | "Use PEP 8, run pytest" |
| **Commands** | Slash commands for specific tasks | Scripts on your tool belt | `/check-control AC-2` |
| **Skills** | Auto-detecting reusable workflows | Runbooks/playbooks | Auto-activates for security reviews |
| **Hooks** | Shell commands that always run | CI/CD pipeline checks | Auto-format code after every edit |
| **Agents** | Specialized sub-AI assistants | Expert team members | Security reviewer, compliance assessor |
| **MCPs** | Connectors to external services | Browser tabs to your tools | GitHub, databases, monitoring |

## Lesson Plan

### Recommended Order (Build on Previous Lessons)

| # | Lesson | Duration | What You'll Build |
|---|--------|----------|-------------------|
| 1 | [Rules (CLAUDE.md)](lesson-1-rules/) | Start here | Project memory and coding standards |
| 2 | [Commands](lesson-2-commands/) | After Lesson 1 | Custom slash commands for RMF tasks |
| 3 | [Skills](lesson-3-skills/) | After Lesson 2 | Auto-detecting compliance workflows |
| 4 | [Hooks](lesson-4-hooks/) | After Lesson 3 | Security guardrails and auto-checks |
| 5 | [Agents](lesson-5-agents/) | After Lesson 4 | Specialized reviewers and auditors |
| 6 | [MCPs](lesson-6-mcps/) | After Lesson 5 | External service connections |
| **Final** | [Mini Project](mini-project-rmf/) | After All | Complete RMF tracker using everything |

### What Each Lesson Contains

Every lesson includes:
- **Explanation**: What the feature is and why it matters
- **Real-world analogy**: Connected to system engineering concepts
- **Step-by-step guide**: How to set it up
- **Exercises**: Hands-on practice (3 per lesson)
- **RMF examples**: Directly relevant to your work

## Prerequisites

- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- An Anthropic API key configured
- Basic familiarity with the terminal
- A code editor (VS Code recommended)
- Python 3.11+ (for the mini project)

## How to Use This Tutorial

### Option A: Sequential (Recommended for Beginners)

Go through each lesson in order. Each builds on the previous one.

```
Lesson 1 → Lesson 2 → Lesson 3 → Lesson 4 → Lesson 5 → Lesson 6 → Mini Project
```

### Option B: Pick and Choose

If you already know some concepts, jump to what interests you:

- "I want Claude to remember my project context" → **Lesson 1 (Rules)**
- "I want shortcuts for common tasks" → **Lesson 2 (Commands)**
- "I want automated workflows" → **Lesson 3 (Skills)**
- "I want security guardrails" → **Lesson 4 (Hooks)**
- "I want specialized AI reviewers" → **Lesson 5 (Agents)**
- "I want Claude to access external tools" → **Lesson 6 (MCPs)**

### Option C: Jump to the Mini Project

If you learn best by doing, go straight to the [Mini Project](mini-project-rmf/).
It references back to specific lessons when needed.

## How These Features Work Together

Here's a real workflow showing all six features:

```
1. You start Claude Code in your project
   → SessionStart HOOK loads project context
   → RULES from CLAUDE.md tell Claude about your RMF project

2. You type: "Implement session timeout for AC-11 compliance"
   → Claude recognizes this relates to security
   → A SKILL auto-activates with compliance checklist

3. Claude writes code
   → PostToolUse HOOK auto-formats the code
   → PreToolUse HOOK blocks if trying to edit .env

4. Claude delegates security review
   → AGENT (security-reviewer) checks for vulnerabilities
   → Agent returns findings to main conversation

5. You type: /compliance-report
   → COMMAND triggers the compliance report workflow
   → Report pulls data from your JSON files

6. Claude checks GitHub for related PRs
   → MCP (GitHub) searches for related changes
   → Results inform the compliance report
```

## Tips for Success

1. **Start small**: Don't configure everything at once. Add features as you
   need them.
2. **Iterate**: Your first CLAUDE.md will be rough. Improve it over time.
3. **Experiment**: Try different configurations and see what works.
4. **Read the errors**: When hooks block something or agents fail, the error
   messages tell you what to fix.
5. **Check this repo**: The `everything-claude-code` repository has production
   examples of all these features that you can reference.

## Further Reading

- [The Shortform Guide](../the-shortform-guide.md) — Quick setup and philosophy
- [The Longform Guide](../the-longform-guide.md) — Advanced patterns and optimization
- [Main README](../README.md) — Full repository documentation
- [Existing Skills](../skills/) — 28 production-ready skill examples
- [Existing Agents](../agents/) — 13 specialized agent examples
- [Existing Rules](../rules/) — 8 modular rule examples
