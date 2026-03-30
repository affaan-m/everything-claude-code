# Advanced Council Configurations

Reference guide for specialized Council configurations beyond the defaults.

## Domain-Specific Councils

### Startup Decisions
**Members:** Strategist, Pragmatist, Contrarian, Futurist, Empiricist
**Why this mix:** Startups need vision (Futurist) grounded in reality (Pragmatist), challenged by skepticism (Contrarian), backed by data (Empiricist), with competitive awareness (Strategist).
**Key tension to watch:** Futurist vs. Pragmatist — ambition vs. execution capacity.

### Technical Architecture
**Members:** Architect, Minimalist, Empiricist, Outsider, Pragmatist
**Why this mix:** Architecture needs structure (Architect) that's not over-engineered (Minimalist), validated by evidence (Empiricist), challenged by fresh eyes (Outsider), and actually buildable (Pragmatist).
**Key tension to watch:** Architect vs. Minimalist — elegance vs. simplicity.

### Hiring / People Decisions
**Members:** Empath, Strategist, Pragmatist, Ethicist, Historian
**Why this mix:** People decisions need emotional intelligence (Empath), strategic fit (Strategist), practical constraints (Pragmatist), fairness (Ethicist), and pattern recognition (Historian).
**Key tension to watch:** Empath vs. Strategist — caring for the person vs. optimizing for the team.

### Creative Direction
**Members:** Creator, Outsider, Historian, Empiricist, Minimalist
**Why this mix:** Creativity needs divergent thinking (Creator), fresh perspective (Outsider), awareness of what's been done (Historian), audience validation (Empiricist), and restraint (Minimalist).
**Key tension to watch:** Creator vs. Historian — novelty vs. proven patterns.

### Crisis Management
**Members:** Pragmatist, Strategist, Empath, Contrarian, Architect
**Why this mix:** Crisis needs immediate action (Pragmatist), long-term thinking (Strategist), human awareness (Empath), challenge to groupthink (Contrarian), and systemic fix (Architect).
**Key tension to watch:** Pragmatist vs. Architect — quick fix vs. root cause.

### Ethical Dilemmas
**Members:** Ethicist, Contrarian, Empath, Historian, Futurist, Empiricist
**Why this mix (6 members):** Ethical questions deserve more voices. Values framework (Ethicist), challenge to moral certainty (Contrarian), human impact (Empath), precedent (Historian), long-term consequences (Futurist), and evidence (Empiricist).
**Key tension to watch:** Ethicist vs. Pragmatist (if added) — doing right vs. doing what's possible.

### Investment / Financial Decisions
**Members:** Empiricist, Strategist, Contrarian, Futurist, Pragmatist
**Why this mix:** Money decisions need data (Empiricist), game theory (Strategist), skepticism of hype (Contrarian), trend awareness (Futurist), and execution reality (Pragmatist).
**Key tension to watch:** Futurist vs. Empiricist — future potential vs. present evidence.

## Custom Archetype Creation

Users can define custom archetypes for domain-specific councils. When a user defines a custom member, capture:

1. **Name:** What this archetype is called
2. **Lens:** The primary frame through which they see everything
3. **Signature question:** The one question they always ask
4. **Blind spot:** What they consistently miss
5. **Disagrees with:** Which other archetype they most often clash with

**Example custom archetype:**
```
Name: The Regulator
Lens: Compliance and risk management
Signature question: "What could go wrong legally?"
Blind spot: Can kill innovation with caution
Disagrees with: Creator, Futurist
```

## Scoring the Deliberation

After synthesis, the Council can optionally score the deliberation quality:

| Metric | Scale | What It Measures |
|--------|-------|-----------------|
| Diversity Score | 1-5 | How different were the perspectives? (1 = everyone agreed, 5 = genuine disagreement) |
| Tension Quality | 1-5 | How productive was the central disagreement? (1 = trivial, 5 = illuminating) |
| Blind Spot Discovery | 1-5 | Did the synthesis reveal something no individual member saw? |
| Actionability | 1-5 | How concrete and useful is the recommended path? |
| Overall CQS | 1-5 | Council Quality Score — weighted average |

**CQS Formula:** (Diversity × 0.25) + (Tension × 0.30) + (Blind Spot × 0.25) + (Actionability × 0.20)

A good deliberation scores 3.5+ overall. Below 3.0, consider re-running with different members or a reframed question.

## Multi-Round Deliberation

For complex questions, enable "Rounds Mode":

**Round 1:** Initial positions (standard deliberation)
**Round 2:** Each member responds to the member they most disagree with
**Round 3:** Revised positions after hearing counterarguments
**Final Synthesis:** Incorporates all rounds

Multi-round deliberation produces deeper insight but takes longer. Use for high-stakes decisions where the extra depth is worth it.

## Silent Council Mode

Sometimes the user doesn't need the full deliberation output — they just need the synthesis. In "Silent Council" mode:

1. Run the full deliberation internally
2. Only output the Synthesis section
3. Offer to "show the full deliberation" if the user wants the reasoning

This is faster and less overwhelming for quick decisions.
