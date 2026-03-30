# What-If Oracle — Scenario Templates

Reference guide for domain-specific scenario analysis configurations.

## Startup / Business Decision

**Variables to test:**

- Market entry timing
- Pricing strategy
- Partnership terms
- Hiring decisions
- Funding rounds

**Branch emphasis:** Likely Case + Contrarian + Second Order
**Key tension:** Speed vs. thoroughness — startups can't afford to analyze forever

**Template prompt:**

> "What if we [specific action] in [timeframe]? Our current state: [revenue, team size, runway]. Key constraint: [the limiting factor]."

## Technology Architecture

**Variables to test:**

- Tech stack choice
- Build vs. buy
- Scaling approach
- Security model
- Migration path

**Branch emphasis:** Worst Case + Wild Card + Second Order
**Key tension:** Engineering elegance vs. shipping speed

**Template prompt:**

> "What if we choose [technology/approach] for [system]? Current architecture: [brief description]. Team capability: [relevant skills]. Timeline: [deadline]."

## Investment / Financial

**Variables to test:**

- Market conditions
- Valuation scenarios
- Exit timing
- Capital allocation
- Revenue model changes

**Branch emphasis:** All 6 branches — money decisions deserve full analysis
**Key tension:** Risk tolerance vs. opportunity cost

**Template prompt:**

> "What if [market condition / financial event] happens? Our exposure: [amount/percentage]. Current position: [financial state]. Time horizon: [investment period]."

## Career / Personal

**Variables to test:**

- Job change
- Skill development path
- Relocation
- Relationship decisions
- Health changes

**Branch emphasis:** Likely Case + Best Case + Contrarian
**Key tension:** Security vs. growth — comfort zone vs. expansion

**Template prompt:**

> "What if I [personal decision]? My current situation: [brief]. What I value most: [1-3 values]. What I'm afraid of: [honest answer]."

## Geopolitical / Macro

**Variables to test:**

- Policy changes
- Regulatory shifts
- Market disruptions
- Technology breakthroughs
- Social movements

**Branch emphasis:** Wild Card + Second Order + Contrarian
**Key tension:** Local impact vs. systemic effects

**Template prompt:**

> "What if [geopolitical event] happens? My exposure: [how it affects me/my organization]. Time horizon: [relevant period]."

## Crisis Response

**Variables to test:**

- Severity escalation
- Communication strategy
- Resource allocation
- Recovery timeline
- Reputation impact

**Branch emphasis:** Worst Case (detailed) + Likely Case + Second Order
**Key tension:** Immediate triage vs. root cause resolution

**Template prompt:**

> "We're facing [crisis/incident]. Current impact: [what's broken]. Stakeholders affected: [who]. Resources available: [what we can deploy]. What if [specific escalation scenario]?"

## The Recursive Template

For complex, multi-layered analysis:

```
ROUND 1: "What if X?"
  → Identify the most likely branch (α)

ROUND 2: "Given α is happening, what if Y?"
  → Identify the most likely sub-branch

ROUND 3: "Given α+Y, what if Z?"
  → Map the deepest consequences

Each round narrows the possibility space while deepening understanding.
Maximum recommended depth: 3 rounds.
```

## Probability Calibration Guide

When assigning probabilities to branches:

| Confidence Level | Probability Range | Evidence Required                                          |
| ---------------- | ----------------- | ---------------------------------------------------------- |
| **Very High**    | >80%              | Strong historical precedent + current data alignment       |
| **High**         | 60-80%            | Multiple converging signals, some historical support       |
| **Medium**       | 30-60%            | Mixed signals, could go either way                         |
| **Low**          | 10-30%            | Plausible but requires several things to go a specific way |
| **Very Low**     | <10%              | Black swan territory — possible but unlikely               |

**Rule:** All branch probabilities in a single analysis should sum to approximately 100%. If they don't, there's a missing branch.
