---
name: what-if-oracle
description: Run structured What-If scenario analysis with multi-branch possibility exploration. Use this skill when the user asks speculative questions like "what if...", "what would happen if...", "what are the possibilities", "explore scenarios", "scenario analysis", "possibility space", "what could go wrong", "best case / worst case", "risk analysis", "contingency planning", "strategic options", or any question about uncertain futures. Also trigger when the user faces a fork-in-the-road decision, wants to stress-test an idea, or needs to think through consequences before committing.
allowed-tools: Read Write
license: MIT license
metadata:
  skill-author: AHK Strategies (ashrafkahoush-ux)
---

# What-If Oracle — Possibility Space Explorer

A structured system for exploring uncertain futures through rigorous multi-branch scenario analysis. Instead of one prediction, the Oracle maps the full **possibility space** — branching timelines where each path has its own logic, probability, and consequences.

Based on the What-If Statement paradigm: the idea that speculative questions ("What if X?") are not idle daydreaming but a **fundamental computing operation** — the mind's way of simulating futures before committing resources to one.

Published research: [The What-If Statement (DOI: 10.5281/zenodo.18736841)](https://doi.org/10.5281/zenodo.18736841) | [IDNA Consolidation v2 (DOI: 10.5281/zenodo.18807387)](https://doi.org/10.5281/zenodo.18807387)

## Core Principle: 0·IF·1

Every scenario analysis has three elements:

- **0** — The unexpressed state (what hasn't happened yet, the potential)
- **1** — The expressed state (what IS, the current reality)
- **IF** — The conditional bond (the decision, event, or change that transforms 0 into 1)

The quality of the analysis depends on the precision of the IF. A vague "what if things go wrong?" produces vague results. A precise "what if our primary supplier raises prices 30% in Q3?" produces actionable intelligence.

## How to Run the Oracle

### Phase 1 — Frame the Question

Take the user's What-If question and sharpen it:

**Decompose into components:**

- **The Variable:** What specific thing changes? (one variable per analysis)
- **The Magnitude:** By how much? (quantify if possible)
- **The Timeframe:** Over what period?
- **The Context:** What's the current state before the change?

**If the question is vague, sharpen it:**

- "What if AI takes over?" → "What if 40% of current knowledge-work tasks are automated by AI within 3 years in [specific industry]?"
- "What if we fail?" → "What if monthly revenue stays below $5K for 6 consecutive months starting now?"

Present the sharpened question to the user for confirmation before proceeding.

### Phase 2 — Map the Possibility Space

Generate **4-6 scenario branches** using this framework:

| Branch             | Definition                                                                   | Purpose                                            |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| **Ω Best Case**    | Everything goes right. Key assumptions all validate. Lucky breaks occur.     | Define the ceiling — what's the maximum upside?    |
| **α Likely Case**  | Most probable path given current evidence. No major surprises.               | Anchor expectations in reality                     |
| **Δ Worst Case**   | Key assumptions fail. Two things go wrong simultaneously.                    | Define the floor — what's the maximum downside?    |
| **Ψ Wild Card**    | An unexpected variable enters that nobody is tracking. Black swan territory. | Stress-test for the unimaginable                   |
| **Φ Contrarian**   | The opposite of the consensus view turns out to be true.                     | Challenge groupthink and reveal hidden assumptions |
| **∞ Second Order** | The first-order effects trigger cascading consequences nobody predicted.     | Map the ripple effects                             |

### Phase 3 — Analyze Each Branch

For each scenario branch, provide:

```
╔══════════════════════════════════════════════╗
║  BRANCH: [Ω/α/Δ/Ψ/Φ/∞] — [Branch Name]    ║
╠══════════════════════════════════════════════╣
║  Probability: [X%]                           ║
║  Timeframe: [When this could materialize]    ║
║  Confidence: [HIGH/MEDIUM/LOW]               ║
╠══════════════════════════════════════════════╣
║  NARRATIVE:                                  ║
║  [2-3 sentences describing how this          ║
║   scenario unfolds step by step]             ║
║                                              ║
║  KEY ASSUMPTIONS:                            ║
║  • [What must be true for this to happen]    ║
║  • [And this]                                ║
║                                              ║
║  TRIGGER CONDITIONS:                         ║
║  • [Early signal that this branch is         ║
║    becoming reality]                         ║
║  • [Second signal]                           ║
║                                              ║
║  CONSEQUENCES:                               ║
║  → Immediate: [What happens first]           ║
║  → 30 days: [What follows]                   ║
║  → 6 months: [Where it leads]               ║
║                                              ║
║  REQUIRED RESPONSE:                          ║
║  [What action to take if this branch         ║
║   activates — specific, actionable]          ║
║                                              ║
║  WHAT MOST PEOPLE MISS:                      ║
║  [The non-obvious insight about this         ║
║   scenario that conventional analysis        ║
║   would overlook]                            ║
╚══════════════════════════════════════════════╝
```

### Phase 4 — Synthesis

After analyzing all branches, provide:

**Probability Distribution:**

```
Ω Best Case ····· [██████░░░░] 15%
α Likely Case ··· [████████░░] 45%
Δ Worst Case ···· [██████░░░░] 20%
Ψ Wild Card ····· [███░░░░░░░]  8%
Φ Contrarian ···· [████░░░░░░]  7%
∞ Second Order ·· [███░░░░░░░]  5%
```

**Robust Actions:** What actions are beneficial across MULTIPLE branches? These are the no-regret moves — do them regardless of which future materializes.

**Hedge Actions:** What preparations protect against the worst branches without sacrificing upside?

**Decision Triggers:** What specific, observable signals should cause you to update which branch is most likely? Define the tripwires.

**The 1% Insight:** What is the one thing about this situation that almost everyone analyzing it would miss? The non-obvious pattern, the hidden assumption, the overlooked variable.

## Golden Ratio Weighting

When evidence exists, weight primary scenarios using the golden ratio:

- **Primary future (most likely):** 61.8% of attention/resources
- **Alternative future:** 38.2% of attention/resources

This prevents both overcommitment to a single path and dilution across too many contingencies. Nature uses this ratio for branching (trees, rivers, blood vessels). Strategic planning can too.

## Modes

### Quick Oracle (2-3 minutes)

3 branches only: Best, Likely, Worst. Short narratives. For fast decisions.

### Deep Oracle (5-10 minutes)

All 6 branches. Full analysis with consequences, triggers, and synthesis. For high-stakes decisions.

### Scenario Chain

Take the output of one Oracle analysis and feed it into another. "If Branch Δ happens, what are the possibilities WITHIN that branch?" Recursive depth for complex strategic planning.

### Reverse Oracle

Start from a desired outcome and work backward: "What conditions must be true for X to happen? What's the most likely path TO that outcome?" Useful for goal-setting and strategy design.

### Competitive Oracle

Analyze the same What-If from multiple stakeholder perspectives: "If we launch this product, what does the possibility space look like from OUR perspective vs. THEIR perspective vs. THE MARKET's perspective?"

## What This Is NOT

- Not a prediction — it's a possibility map. The Oracle doesn't claim to know the future; it helps you prepare for multiple futures.
- Not a crystal ball — probabilities are estimates based on available evidence, not certainties.
- Not a substitute for action — the best scenario analysis in the world is worthless without subsequent decision and execution.

## Built By

[AHK Strategies](https://ahkstrategies.net) — AI Horizon Knowledge
Full platform: [themindbook.app](https://themindbook.app)
Research: [The What-If Statement (DOI: 10.5281/zenodo.18736841)](https://doi.org/10.5281/zenodo.18736841)

_"The future is not empty. It contains completed states that exert pull on the present."_
