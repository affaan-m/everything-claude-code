---
description: Analyze context window usage across agents, skills, MCP servers, and rules to find optimization opportunities. Helps reduce token overhead and avoid performance warnings.
---

# Context Budget Optimizer

Analyze your Claude Code setup's context window consumption and produce actionable recommendations to reduce token overhead.

## Usage

```
/context-budget [--verbose]
```

- Default: summary with top recommendations
- `--verbose`: full breakdown per component

$ARGUMENTS

## Why This Matters

Claude Code's effective context window shrinks with every component loaded at session start. Agent descriptions, skill definitions, MCP tool schemas, and rules all consume tokens before you type a single prompt. A setup with 20+ agents and 30 MCP tools can burn 40-60% of your context on overhead alone — leading to performance warnings, degraded output quality, and higher costs.

## Audit Workflow

### Step 1: Measure Component Token Overhead

Scan each component type and estimate token consumption:

**Agents** (`agents/*.md`)
```
For each agent file:
  - Read the file
  - Count approximate tokens (words × 1.3)
  - Flag agents over 200 lines as "heavy"
  - Sum total agent token overhead
```

**Skills** (`skills/*/SKILL.md` and `.agents/skills/*/SKILL.md`)
```
For each skill:
  - Read SKILL.md
  - Count approximate tokens
  - Flag skills over 400 lines
  - Note if skill has multiple harness versions (double-counted?)
```

**Rules** (`rules/**/*.md`)
```
For each rule file:
  - Count tokens
  - Flag rule files over 100 lines
  - Identify overlapping rules across language modules
```

**MCP Servers** (`.mcp.json` or MCP config)
```
If MCP config exists:
  - Count number of configured servers
  - Estimate tool schema overhead (~500 tokens per tool)
  - Flag servers with >20 tools
  - Identify servers that could be replaced with direct CLI calls
```

**CLAUDE.md** (project + user-level)
```
  - Read all CLAUDE.md files in the chain
  - Count tokens for each
  - Flag if combined CLAUDE.md exceeds 300 lines
```

### Step 2: Classify Components

Sort every component into one of three buckets:

| Bucket | Criteria | Action |
|--------|----------|--------|
| **Always needed** | Used in >80% of sessions, core to workflow | Keep as-is |
| **Sometimes needed** | Domain-specific, used occasionally | Consider lazy loading or conditional activation |
| **Rarely needed** | Niche, overlapping, or outdated | Candidate for removal or on-demand loading |

### Step 3: Detect Issues

Check for these common problems:

**Bloated agent descriptions**
- Agent descriptions should be 1-3 lines for the Task tool
- Detailed instructions belong in the agent body, not the description
- Warning at >30 words in the `description` frontmatter; fail at >50 words

**Redundant components**
- Skills that overlap with agent capabilities
- Rules that duplicate CLAUDE.md instructions
- Multiple agents covering the same domain

**MCP over-subscription**
- More than 10 MCP servers enabled simultaneously
- MCP tools that wrap simple CLI commands (gh, git, npm)
- Servers with large tool counts inflating schema overhead

**CLAUDE.md bloat**
- Instructions that could be rules instead
- Outdated sections referencing removed features
- Verbose explanations where a one-liner suffices

### Step 4: Generate Report

Using the data collected in Steps 1-3:
- Format token counts per component into the ASCII table shown below
- List detected issues in descending order of token savings
- Compute and display the "Top 3 Optimizations" with estimated savings
- Show potential total savings as a percentage of current overhead

#### Output Format

```
Context Budget Report
═══════════════════════════════════════

Total estimated overhead: ~45,100 tokens
Context model: Claude Sonnet (200K window)
Effective available context: ~154,900 tokens (77.5%)

Component Breakdown:
┌─────────────────┬────────┬───────────┐
│ Component       │ Count  │ Tokens    │
├─────────────────┼────────┼───────────┤
│ Agents          │ 16     │ ~12,400   │
│ Skills          │ 28     │ ~6,200    │
│ Rules           │ 12     │ ~2,800    │
│ MCP tools       │ 45     │ ~22,500   │
│ CLAUDE.md       │ 2      │ ~1,200    │
└─────────────────┴────────┴───────────┘

⚠ Issues Found (3):

1. HEAVY AGENTS — 3 agents exceed 200 lines
   → planner.md (213 lines, ~1,840 tokens)
   → architect.md (208 lines, ~1,780 tokens)
   → security-reviewer.md (205 lines, ~1,760 tokens)
   Action: Shorten description frontmatter; move details to agent body

2. MCP OVER-SUBSCRIPTION — 14 servers, 87 tools
   → github, supabase, vercel (replaceable with CLI: gh, supabase, vercel)
   Action: Replace 3 MCP servers with direct CLI calls, save ~1,500 tokens

3. REDUNDANT RULES — typescript.md overlaps with coding-standards.md
   → 23 lines duplicated across both files
   Action: Deduplicate into coding-standards.md, reference from typescript.md

Top 3 Optimizations:
1. Compress agent descriptions → save ~3,200 tokens
2. Remove 3 CLI-replaceable MCP servers → save ~1,500 tokens
3. Deduplicate rules → save ~400 tokens

Potential savings: ~5,100 tokens (20.6% of current overhead)
```

## Verbose Mode

With `--verbose`, additionally output:

- Per-file token counts for every component
- Line-by-line breakdown of the heaviest files
- Specific redundant lines between overlapping components
- MCP tool list with per-tool schema size estimates

## Tips for Staying Under Budget

1. **Agent descriptions are expensive** — the `description` field in frontmatter is loaded into the Task tool for every session. Keep it under 30 words. Put detailed instructions in the agent body.
2. **Prefer CLI over MCP** — `gh pr create` costs zero context tokens. An MCP GitHub server with 30 tools costs ~15,000 tokens just for schemas.
3. **Use conditional rules** — language-specific rules should only load for projects using that language, not globally.
4. **Split CLAUDE.md** — use `~/.claude/CLAUDE.md` for universal preferences and per-project CLAUDE.md for project-specific instructions.
5. **Audit regularly** — as you add skills and agents, overhead creeps up. Run `/context-budget` monthly to catch bloat early.
