---
name: council
description: >
  Multi-perspective AI deliberation for ambiguous decisions. Spawns 3 independent
  voices (Advocate, Skeptic, Pragmatist) with anti-anchoring protocol and bias
  guardrails. Use when choosing between viable options, evaluating tradeoffs,
  or making decisions that benefit from structured disagreement.
  NOT for verifying correctness (use santa-method) or dispatching domain specialists
  (use team-builder). Triggers: "council", "perspectives", "what would others think",
  "weigh options", "tradeoffs", "should we", "pros and cons", "devil's advocate".
origin: ECC
---

# Council — Multi-Perspective Deliberation

Convene three independent voices — Advocate, Skeptic, Pragmatist — for structured
disagreement on ambiguous decisions. Each gives an independent perspective, then
synthesize into a verdict with a dissent record.

The core insight: a single AI reasoning about a problem shares its own biases and
blind spots. Three voices with different cognitive roles, different model configurations,
and different context levels break this failure mode. The council adds genuinely
different *perspectives*, not just more of the same.

## When to Activate

- **Architecture decisions** — "should we use a queue or polling?"
- **Technology choices** — "PostgreSQL vs MongoDB for this use case"
- **Design tradeoffs** — "monorepo vs polyrepo", "REST vs GraphQL"
- **Process decisions** — "should we split this PR or keep it bundled?"
- **Strategy questions** — "build vs buy", "now vs later"
- **Ambiguous requirements** — "the user asked for X but Y might be better"
- User says "council", "perspectives", "weigh options", "what would others think"

## When NOT to Use

| Instead of council... | Use... | Because... |
|---|---|---|
| Verifying correctness of output | santa-method | Santa is convergent (verify); council is divergent (explore) |
| Reviewing code quality | code-reviewer agent | Domain specialist, not cognitive role |
| Planning implementation | planner agent | Task executor with specific workflow |
| Dispatching domain specialists | team-builder skill | Domain diversity, not perspective diversity |
| Simple questions with clear answers | Just answer directly | Council is for decisions, not facts |
| Tasks that need execution | The relevant agent | Council deliberates, it doesn't execute |

## Architecture

```
Phase 1: FRAME                    Phase 2: DELIBERATE              Phase 3: SYNTHESIZE
┌──────────────────┐              ┌─────────────────────┐          ┌──────────────────┐
│ Main Claude:     │              │ 3 parallel agents:  │          │ Main Claude:     │
│                  │              │                     │          │                  │
│ 1. Structure the │──────────────│ Advocate (sonnet)   │─────────▶│ 1. Read all 3    │
│    decision brief│              │ Skeptic  (opus)     │          │ 2. Apply bias    │
│ 2. Form own      │              │ Pragmatist (haiku)  │          │    guardrails    │
│    preliminary   │              │                     │          │ 3. Compare vs    │
│    position      │              │ None sees the       │          │    preliminary   │
│    FIRST         │              │ preliminary position│          │ 4. Produce       │
│                  │              │                     │          │    verdict       │
└──────────────────┘              └─────────────────────┘          └──────────────────┘
```

## Voices

| Voice | Model | Context | Cognitive Role |
|-------|-------|---------|----------------|
| **Advocate** | sonnet | Receives decision brief | Build the strongest case FOR the most promising option. Steelman it. Provide evidence, precedents, concrete specifics. |
| **Skeptic** | opus | ZERO conversation history — receives ONLY the brief | Challenge premises, not conclusions. Ask: is the question itself correct? Are the constraints real? Is the framing hiding a better option? |
| **Pragmatist** | haiku | Receives decision brief | Implementation cost, timeline, reversibility. What would a team with half the resources do? Flag the simplest viable path. |

**Why these model assignments:**

- **Sonnet for Advocate**: Best coding model, excels at practical reasoning, fast enough to form position quickly.
- **Opus for Skeptic**: Deepest reasoning for premise-level challenges. Fresh context means no anchoring to prior framing.
- **Haiku for Pragmatist**: Different tradeoff surface — naturally gravitates toward simpler, more direct answers. This "weakness" IS the pragmatist's strength.

## Process

### Phase 1: Frame the Decision

**Step 1: Structure the brief.**

Extract the question from skill args or infer from conversation. If vague, ask ONE
clarifying question before proceeding.

Construct a decision brief:

```markdown
## Decision Brief

**Question:** [one clear sentence]
**Context:** [why this decision matters now]
**Options identified:** [list known options, including "do nothing"]
**Constraints:** [timeline, budget, technical, team]
**Success criteria:** [what "good" looks like]
```

**Step 2: If the question is codebase-specific**, gather relevant snippets (max ~2000 tokens)
and include under a `## Codebase Context` section in the brief.

**Step 3: Form preliminary position.**

Think through your own position BEFORE launching agents. Write down:
- **Position**: 1-2 sentence stance
- **Key reasoning**: top 3 points
- **Biggest risk**: with your approach

Hold this. Do not share it with the agents. You will compare against it in Phase 3.

### Phase 2: Deliberate (3 Parallel Agents)

Launch all 3 voices in a **single message with 3 Agent tool calls** for concurrency.

**Advocate prompt:**

```
You are the Advocate voice in a council deliberation. Your job is to build
the STRONGEST POSSIBLE case for what seems like the best path forward.

## Decision Brief
{brief}

## Instructions
- Steelman the most promising option
- Provide concrete evidence and precedents
- Address likely objections preemptively
- Be specific: name files, patterns, costs, timelines

## Response Format (under 300 words)
**Position**: [one-sentence thesis]
**Case**: [3-5 key arguments with evidence]
**Risks acknowledged**: [what could go wrong with your recommendation]
**Confidence**: [low/medium/high] and why
```

Agent config: `model: "sonnet"`, description: "Council Advocate"

**Skeptic prompt:**

```
You are the Skeptic voice in a council deliberation. You have NO prior
context about this project beyond what is in this brief.

Your job is to challenge PREMISES, not just conclusions.

## Decision Brief
{brief}

## Instructions
- Challenge assumptions in the brief itself
- Identify hidden constraints that might not be real
- Propose reframings of the problem
- Name specific risks everyone might be ignoring
- If the brief is well-framed, say so and focus on edge cases

## Response Format (under 300 words)
**Premise check**: [are the assumptions sound? which are questionable?]
**Reframing**: [is there a better way to state this problem?]
**Strongest objection**: [the single most important concern]
**Blind spots**: [what is the brief not considering?]
**Confidence in the brief's framing**: [low/medium/high]
```

Agent config: `model: "opus"`, description: "Council Skeptic"

**Pragmatist prompt:**

```
You are the Pragmatist voice in a council deliberation. Your job is to
evaluate options through the lens of IMPLEMENTATION REALITY.

## Decision Brief
{brief}

## Instructions
- Estimate implementation effort for each option (hours/days, not weeks)
- Identify reversibility: which options are easy to undo?
- Consider second-order effects: what does each option make harder later?
- Flag the simplest viable path
- Consider: what would a team with half the resources do?

## Response Format (under 300 words)
**Simplest viable path**: [the minimum-effort option that still works]
**Cost matrix**: [option -> effort -> reversibility (easy/medium/hard)]
**Second-order effects**: [what each option makes easier/harder downstream]
**Recommendation**: [what to do and when to revisit]
**Confidence**: [low/medium/high]
```

Agent config: `model: "haiku"`, description: "Council Pragmatist"

### Phase 3: Synthesize the Verdict

Read all 3 voice responses, then apply the bias guardrails below.

<CRITICAL>
SYNTHESIZER BIAS GUARDRAILS

You are both a council member AND the synthesizer. This is a conflict of interest. Rules:

1. NEVER dismiss a voice without stating why — every position acknowledged in verdict
2. **2-of-3 rule**: If 2+ voices agree against your preliminary position, you MUST explicitly
   reconsider. You can still disagree, but must articulate what the 2 voices are missing.
3. **Skeptic premium**: Address the Skeptic's premise challenges FIRST before evaluating
   other responses. If the Skeptic argues the question is wrong, resolve that before
   weighing Advocate vs Pragmatist.
4. **Delta detection**: If your final recommendation differs from your preliminary position,
   you MUST record what changed your mind.
5. All voice positions appear ABOVE the synthesis — the user can always check your work.
</CRITICAL>

### Verdict Format

```markdown
## Council Verdict: [short question]

**Preliminary position**: [what you thought BEFORE hearing voices]

### Voices

**Advocate (sonnet):** [position in 1-2 sentences]
[1-line key reasoning]

**Skeptic (opus):** [position in 1-2 sentences]
[1-line key reasoning]

**Pragmatist (haiku):** [position in 1-2 sentences]
[1-line key reasoning]

### Analysis
- **Consensus:** [where 2+ voices agree]
- **Strongest dissent:** [the most important disagreement — who and why]
- **Premise check:** [Skeptic's findings — is the question well-framed?]

### Recommendation
[synthesized best path forward with reasoning]

### Delta Record
[what changed from preliminary position and why — or "no change" with justification]
```

**Self-contained rule:** When the question involves numbered items, ALL references must
restate each item inline, not just by number. The user should never need to scroll up.

## Multi-Round Protocol

Default: **one round**. The council convenes, delivers the verdict, and dissolves.

If the user asks for another round ("ask them again", "follow up", "another round"):

1. **Advocate + Pragmatist**: receive the full verdict from the previous round as context
2. **Skeptic**: receives ONLY the Recommendation section — NOT the full deliberation.
   The Skeptic's value comes from clean context. Including prior positions destroys independence.
3. Each voice answers: "Given this recommendation, what is the strongest remaining concern?"
4. Synthesize again with the same guardrails

**Max 3 rounds.** After 3 rounds, commit to a recommendation or present the unresolvable
tensions to the user.

## Recommendation Delta Storage

After every council session, evaluate whether the verdict produced a **recommendation delta**
— a case where the voices changed the final recommendation from the preliminary position.

**Auto-save when ANY of:**
- 2+ voices agreed against preliminary position AND changed the recommendation
- Skeptic's premise challenge was valid and reframed the question
- A risk identified by a voice was not in the preliminary position

**Save to** the project's auto-memory system:

```markdown
**Decision:** {what was being decided}
**Preliminary position:** {what you would have done alone}
**What changed:** {the insight that shifted the recommendation}
**Who changed it:** {Advocate/Skeptic/Pragmatist/multiple}
**Final recommendation:** {what we actually decided}
**Why:** {why the voice's perspective was better}
```

For architecturally significant decisions, suggest creating an ADR via the
architecture-decision-records skill (do not auto-create — just suggest).

## Anti-Patterns

| Trap | Fix |
|------|-----|
| Rubber-stamping preliminary position | The bias guardrails are structural safeguards. The delta record makes this visible. |
| Convening council for factual questions | Just answer directly. Council is for decisions with viable alternatives. |
| Running multiple rounds when all voices agree | Strong agreement in Round 1 is a signal, not a problem. Stop. |
| Giving Skeptic prior round positions | Destroys independence. Skeptic gets ONLY the recommendation. |
| Using council voices as domain specialists | Use team-builder or specific reviewer agents for that. |
| Dismissing haiku Pragmatist as "too simple" | Simplicity-bias IS the value. If haiku says "just use X," that deserves weight. |

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| santa-method | Complementary. Council explores options BEFORE implementation; Santa verifies AFTER. |
| architecture-decision-records | Council suggests ADR creation for significant decisions. |
| verification-loop | Deterministic checks. Council is for semantic/strategic decisions. |
| deep-review | Council for "should we?" decisions; deep-review for code quality. |
| design-review | Council for early-stage "which approach?"; design-review for "is this plan sound?" |
| planner | Planner creates implementation plans; council helps decide WHAT to plan. |
| continuous-learning-v2 | Recurring decision patterns from council deltas can evolve into instincts. |
