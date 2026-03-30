---
name: consciousness-council
description: Run a multi-perspective Mind Council deliberation on any question, decision, or creative challenge. Use this skill whenever the user wants diverse viewpoints, needs help making a tough decision, asks for a council/panel/board discussion, wants to explore a problem from multiple angles, requests devil's advocate analysis, or says things like "what would different experts think about this", "help me think through this from all sides", "council mode", "mind council", or "deliberate on this". Also trigger when the user faces a dilemma, trade-off, or complex choice with no obvious answer.
allowed-tools: Read Write
license: MIT license
metadata:
  skill-author: AHK Strategies (ashrafkahoush-ux)
---

# Consciousness Council

A structured multi-perspective deliberation system that generates genuine cognitive diversity on any question. Instead of one voice giving one answer, the Council summons distinct thinking archetypes — each with its own reasoning style, blind spots, and priorities — then synthesizes their perspectives into actionable insight.

## Why This Exists

Single-perspective thinking has a ceiling. When you ask one mind for an answer, you get one frame. The Consciousness Council breaks this ceiling by simulating the cognitive equivalent of a boardroom, a philosophy seminar, and a war room — simultaneously. It's not roleplay. It's structured epistemic diversity.

The Council is inspired by research in collective intelligence, wisdom-of-crowds phenomena, and the observation that the best decisions emerge when genuinely different reasoning styles collide.

## How It Works

The Council has three phases:

### Phase 1 — Summon the Council

Based on the user's question, select 4-6 Council Members from the archetypes below. Choose members whose perspectives will genuinely CLASH — agreement is cheap, productive tension is valuable.

**The 12 Archetypes:**

| #   | Archetype          | Thinking Style                         | Asks                                         | Blind Spot                                |
| --- | ------------------ | -------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| 1   | **The Architect**  | Systems thinking, structure-first      | "What's the underlying structure?"           | Can over-engineer simple problems         |
| 2   | **The Contrarian** | Inversion, devil's advocate            | "What if the opposite is true?"              | Can be contrarian for its own sake        |
| 3   | **The Empiricist** | Data-driven, evidence-first            | "What does the evidence actually show?"      | Can miss what can't be measured           |
| 4   | **The Ethicist**   | Values-driven, consequence-aware       | "Who benefits and who is harmed?"            | Can paralyze action with moral complexity |
| 5   | **The Futurist**   | Long-term, second-order effects        | "What does this look like in 10 years?"      | Can discount present realities            |
| 6   | **The Pragmatist** | Action-oriented, resource-aware        | "What can we actually do by Friday?"         | Can sacrifice long-term for short-term    |
| 7   | **The Historian**  | Pattern recognition, precedent         | "When has this been tried before?"           | Can fight the last war                    |
| 8   | **The Empath**     | Human-centered, emotional intelligence | "How will people actually feel about this?"  | Can prioritize comfort over progress      |
| 9   | **The Outsider**   | Cross-domain, naive questions          | "Why does everyone assume that?"             | Can lack domain depth                     |
| 10  | **The Strategist** | Game theory, competitive dynamics      | "What are the second and third-order moves?" | Can overthink simple situations           |
| 11  | **The Minimalist** | Simplification, constraint-seeking     | "What can we remove?"                        | Can oversimplify complex problems         |
| 12  | **The Creator**    | Divergent thinking, novel synthesis    | "What hasn't been tried yet?"                | Can chase novelty over reliability        |

**Selection heuristic:** Match the question type to the most productive tension:

- **Business decisions** → Strategist + Pragmatist + Ethicist + Futurist + Contrarian
- **Technical architecture** → Architect + Minimalist + Empiricist + Outsider
- **Personal dilemmas** → Empath + Contrarian + Futurist + Pragmatist
- **Creative challenges** → Creator + Outsider + Historian + Minimalist
- **Ethical questions** → Ethicist + Contrarian + Empiricist + Empath + Historian
- **Strategy/competition** → Strategist + Historian + Futurist + Contrarian + Pragmatist

These are starting points — adapt based on the specific question. The goal is productive disagreement, not consensus.

### Phase 2 — Deliberation

Each Council Member delivers their perspective in this format:

```
🎭 [ARCHETYPE NAME]

Position: [One-sentence stance]

Reasoning: [2-4 sentences explaining their logic from their specific lens]

Key Risk They See: [The danger others might miss]

Surprising Insight: [Something non-obvious that emerges from their frame]
```

**Critical rules for deliberation:**

- Each member MUST disagree with at least one other member on something substantive. If everyone agrees, the Council has failed — go back and sharpen the tensions.
- Perspectives should be genuinely different, not just "agree but with different words."
- The Contrarian should challenge the most popular position, not just be generically skeptical.
- Keep each member's contribution focused and sharp. Depth over breadth.

### Phase 3 — Synthesis

After all members speak, deliver:

```
⚖️ COUNCIL SYNTHESIS

Points of Convergence: [Where 3+ members agreed — these are high-confidence signals]

Core Tension: [The central disagreement that won't resolve easily — this IS the insight]

The Blind Spot: [What NO member addressed — the question behind the question]

Recommended Path: [Actionable recommendation that respects the tension rather than ignoring it]

Confidence Level: [High / Medium / Low — based on how much convergence vs. divergence emerged]

One Question to Sit With: [The question the user should keep thinking about after this session]
```

## Council Configurations

The user can customize the Council:

- **"Quick council"** or **"fast deliberation"** → Use 3 members, shorter responses
- **"Deep council"** or **"full deliberation"** → Use 6 members, extended reasoning
- **"Add [archetype]"** → Include a specific archetype
- **"Without [archetype]"** → Exclude a specific archetype
- **"Custom council: [list]"** → User picks exact members
- **"Anonymous council"** → Don't reveal which archetype is speaking until synthesis (reduces anchoring bias)
- **"Devil's advocate mode"** → Every member must argue AGAINST whatever seems most intuitive
- **"Rounds mode"** → After initial positions, members respond to each other for a second round

## What Makes a Good Council Question

The Council works best on questions where:

- There's genuine uncertainty or trade-offs
- Multiple valid perspectives exist
- The user is stuck or going in circles
- The stakes are high enough to warrant multi-angle thinking
- The user's own bias might be limiting their view

The Council adds less value on:

- Pure factual questions with clear answers
- Questions where the user has already decided and just wants validation
- Trivial choices with low stakes

If the question seems too simple for a full Council, say so — and offer a quick 2-perspective contrast instead.

## Tone and Quality

- Write each archetype's voice with enough distinctiveness that the user could identify them without labels.
- The Synthesis should feel like genuine integration, not just a list of what each member said.
- "Core Tension" is the most important part of the synthesis — it should name the real trade-off the user faces.
- "One Question to Sit With" should be genuinely thought-provoking, not generic.
- Never let the Council devolve into everyone agreeing politely. Productive friction is the point.

## Example

**User:** "Should I quit my stable corporate job to start a company?"

**Council Selection:** Pragmatist, Futurist, Empath, Contrarian, Strategist (5 members — high-stakes life decision with financial, emotional, and strategic dimensions)

Then run the full 3-phase deliberation.

## Attribution

Created by AHK Strategies — consciousness infrastructure for the age of AI.
Learn more: https://ahkstrategies.net
Powered by the Mind Council architecture from TheMindBook: https://themindbook.app
