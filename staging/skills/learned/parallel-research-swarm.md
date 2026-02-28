---
name: parallel-research-swarm
description: "Launch N parallel research agents with orthogonal missions to comprehensively explore a complex topic"
user-invocable: false
origin: auto-extracted
---

# Parallel Research Swarm

**Extracted:** 2026-02-27
**Context:** When you need comprehensive, high-confidence research on a complex topic that spans multiple domains or perspectives

## Problem
Single research queries or sequential exploration miss important angles. You need coverage across multiple domains, and you need confidence that findings are robust (not artifacts of a single search path).

## Solution

Launch 10-15 parallel `general-purpose` agents, each with a specific, non-overlapping research mission. Design missions to cover orthogonal dimensions of the problem space.

### Design Principles

1. **Orthogonal missions**: Each agent explores a genuinely different angle. Not "agent 1: pros, agent 2: cons" but "agent 1: academic ML research, agent 2: intelligence tradecraft, agent 3: organizational psychology"

2. **Specific search instructions**: Give each agent 3-5 specific things to look for, named papers/techniques to investigate, and explicit instructions to find empirical evidence (not just opinions)

3. **Cross-domain validation**: Design some missions to explore the same thesis from different fields. When independent domains converge on the same conclusion, confidence is high.

4. **Optimal count**: 10-12 agents covers most problem spaces well. Beyond 15, diminishing returns are severe (last agents add depth, not direction). Below 8, you risk missing important angles.

### Example Mission Design (for "how to improve multi-LLM systems")

```
Agent 1:  Academic ML — multi-agent debate papers, DMAD, MoA
Agent 2:  Role design — persona vs analytical role assignment
Agent 3:  Analytical frameworks — SWOT, ACH, Porter's with LLMs
Agent 4:  Adversarial — devil's advocate, red teaming
Agent 5:  Social science — Delphi method, expert elicitation
Agent 6:  Psychology — cognitive bias, debiasing techniques
Agent 7:  Reasoning — CoT, ToT, Self-Consistency comparison
Agent 8:  Cross-domain — mental models, latticework thinking
Agent 9:  Intelligence — CIA tradecraft, ACH, structured analysis
Agent 10: Philosophy — dialectics, Socratic method, epistemology
Agent 11: Production — real deployed systems, AutoGen, LangGraph
Agent 12: ML theory — ensemble methods, diversity-accuracy tradeoff
```

### Synthesis Pattern

After all agents complete, look for:
- **Convergent findings** (3+ agents independently conclude same thing) = high confidence
- **Unique findings** (only 1 agent found it) = validate before trusting
- **Contradictions** (agents disagree) = most interesting, investigate deeper

### Code Pattern

```
# Launch all agents in a SINGLE message with multiple Task tool calls
# Use model="sonnet" to manage cost (haiku is too shallow for research)
# Each agent prompt should include:
# 1. Specific research angle
# 2. Named papers/techniques to investigate
# 3. "Search the web for..." instructions
# 4. "Find empirical evidence, not opinions"
# 5. "Report specific numbers, percentages, paper citations"
```

## When to Use

- Complex topic spanning multiple domains
- Need high-confidence conclusions (not single-source bias)
- Time budget allows parallel execution (~5-8 min for all agents)
- Cost budget allows 10-15 Sonnet calls ($0.50-1.50 total)

## When NOT to Use

- Simple factual questions (just use WebSearch)
- Topic is narrow enough for 1-2 searches
- You need results in <1 minute
