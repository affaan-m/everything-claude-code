---
name: council
description: "Convene a 4-voice AI council for diverse perspectives on ambiguous decisions, tradeoffs, and go/no-go calls. NOT for code review, implementation planning, or system design."
origin: community
---

# Council

Convene four advisors — the in-context Claude plus three fresh Agent subagents — for diverse perspectives on ambiguous decisions. Each gives an independent take, then synthesize into a compressed verdict.

## When to Use

Invoke council when:
- A decision has multiple valid paths and no clear winner
- Tradeoffs need explicit surfacing (speed vs. quality, scope vs. risk)
- The user asks for "perspectives", "opinions", "what would others think"
- Architecture or strategy choices benefit from adversarial challenge
- Go/no-go decisions where bias from conversational anchoring is a risk

## When NOT to Use

| Instead of Council | Use |
|---|---|
| Verifying output quality (pass/fail) | **santa-method** — dual independent review with convergence loop |
| Breaking a feature into implementation steps | **planner** — step-by-step implementation plan |
| Designing system architecture | **architect** — component design, data flow, scalability |
| Reviewing code for bugs/security | **code-reviewer** (quality review) or **santa-method** (adversarial pass/fail verification) |
| Simple factual questions | Just answer directly |
| Clear tasks with obvious solutions | Just do the task |

Council is for **decisions under ambiguity**, not for tasks with deterministic answers.

## Roles

| Voice | Method | Lens |
|---|---|---|
| Architect (you) | In-context | Correctness, maintainability, long-term implications |
| Skeptic | Agent subagent (zero context) | Challenge assumptions, question premises, propose simplest alternative |
| Pragmatist | Agent subagent (zero context) | Shipping speed, simplicity, user impact, practical tradeoffs |
| Critic | Agent subagent (zero context) | Edge cases, risks, failure modes, what could go wrong |

All three external voices are fresh Agent subagents with **zero conversation context**. They receive only the question and optional code/context snippets. This is the core anti-anchoring mechanism: they see what the in-context Architect has stopped noticing due to conversational drift.

## How It Works

### Step 1: Extract the Question

Get the question from skill args or infer from conversation context. If vague, ask ONE clarifying question before proceeding.

### Step 2: Context Check

If the question is **codebase-specific** (references files, architecture, specific code):
- Gather relevant file snippets (max ~2000 tokens total)
- Include them in agent prompts under a `## Context` section

If it's a **general** strategy question, skip this — just send the question.

### Step 3: Form Your Perspective FIRST

Think through your Architect position **before** seeing agent responses. This prevents anchoring on their answers.

Write down:
- **Position**: 1-2 sentence clear stance
- **Reasoning**: 3 key points
- **Risk**: The biggest risk with your approach

Hold this internally. Include it in the report after agents complete.

### Step 4: Dispatch Three Agents in Parallel

Launch all three Agent subagents in a **single message with multiple tool calls** to maximize concurrency.

**Skeptic:**

```
Agent(
  description="Council Skeptic",
  prompt="You are the Skeptic on a council of four AI advisors.

[QUESTION + CONTEXT]

Your role: challenge assumptions, question whether the problem is framed correctly, propose the simplest possible alternative. If the question itself is wrong or the answer is simpler than expected, say so. You have NO prior context about this conversation.

Give your perspective as:
1. Position (1-2 sentences)
2. Reasoning (3 points)
3. Risk (biggest risk with your position)
4. Surprise (one thing the other advisors probably missed)

Under 300 words. Be opinionated, no hedging.",
  model="sonnet"
)
```

**Pragmatist:**

```
Agent(
  description="Council Pragmatist",
  prompt="You are the Pragmatist on a council of four AI advisors.

[QUESTION + CONTEXT]

Your role: focus on shipping speed, simplicity, user impact, and practical tradeoffs. Optimize for what works in practice, not what looks elegant in theory. You have NO prior context about this conversation.

Give your perspective as:
1. Position (1-2 sentences)
2. Reasoning (3 points)
3. Risk (biggest risk with your position)
4. Surprise (one thing the other advisors probably missed)

Under 300 words. Be opinionated, no hedging.",
  model="sonnet"
)
```

**Critic:**

```
Agent(
  description="Council Critic",
  prompt="You are the Critic on a council of four AI advisors.

[QUESTION + CONTEXT]

Your role: focus on edge cases, risks, failure modes, and what could go wrong. Find the weaknesses that optimists overlook. You have NO prior context about this conversation.

Give your perspective as:
1. Position (1-2 sentences)
2. Reasoning (3 points)
3. Risk (biggest risk with your position)
4. Surprise (one thing the other advisors probably missed)

Under 300 words. Be opinionated, no hedging.",
  model="haiku"
)
```

**Model selection rationale:** Using different model tiers provides internal diversity. The Skeptic on `sonnet` balances depth with speed. The Pragmatist on `sonnet` provides practical grounding. The Critic on `haiku` delivers fast, focused contrarian analysis. Adjust models based on decision stakes — use `opus` for the Skeptic on high-stakes architectural decisions.

### Step 5: Synthesize

Read all three agent responses and present alongside your Architect position.

**Synthesizer bias guardrails** (you are both participant AND synthesizer — this is a conflict of interest):

1. NEVER dismiss an external perspective without stating why
2. If any voice raised a point you didn't consider, EXPLICITLY credit it
3. The "Strongest dissent" section is MANDATORY — even if you disagree
4. If two or more voices agree against you, seriously consider you might be wrong
5. Raw positions appear ABOVE the synthesis — the user can always check your work
6. The Skeptic's premise challenges deserve special weight — they see what you can't

### Step 6: Present the Report

```
## Council: [short question]

**Claude (Architect):** [position in 1-2 sentences]
[1-line key reasoning]

**Skeptic:** [position in 1-2 sentences]
[1-line key reasoning]

**Pragmatist:** [position in 1-2 sentences]
[1-line key reasoning]

**Critic:** [position in 1-2 sentences]
[1-line key reasoning]

### Verdict
- **Consensus:** [where they agree]
- **Strongest dissent:** [most important disagreement — who and why]
- **Premise check:** [did the Skeptic challenge the question itself?]
- **Recommendation:** [synthesized best path forward]
```

**Self-contained rule:** When the question involves numbered items, ALL references in voice positions AND verdict MUST restate each item inline, not just by number. The user should never need to scroll up.

If an agent failed or timed out, note it inline: `**Skeptic:** (unavailable — timed out)`

Keep the report **scannable on a phone screen**. No ceremony.

## Multi-Round

Default: **one round**. The council convenes, delivers the verdict, and dissolves.

If the user asks for another round:

1. For Pragmatist + Critic: include prior council positions as context
2. **For Skeptic: include ONLY the new follow-up + original question — NO prior positions.** The Skeptic's value comes from clean memory. Anchoring them on prior positions turns them into a confirming voice.
3. Synthesize again with the same guardrails

## Auto-Save Lesson

After presenting the verdict, evaluate whether the council produced a **recommendation delta** — where external input changed the final recommendation from what you (Architect) would have done alone.

**Save when ANY of these are true:**
- The strongest dissent changed the final recommendation
- Two or more voices agreed against the Architect's position
- An external voice raised a risk the Architect didn't consider
- The Skeptic challenged the premise and the challenge was valid
- A severity re-rating occurred

**Do NOT save when:**
- All four agreed with the Architect (no delta)
- Dissent was noted but didn't change the recommendation
- The council was informational only (no decision at stake)

**When the filter triggers**, write a lesson to `~/.claude/notes/lesson-council-{YYYY-MM-DD}-{slug}.md` where `{slug}` is derived from the first 3-5 words of the decision question, lowercased and hyphenated (e.g., "Should we use Redis?" becomes `should-we-use-redis`). If the filename already exists, append `-2`, `-3`, etc.:

```markdown
---
name: council-lesson-{slug}
description: {one-line: what changed and why}
type: feedback
last_validated: "{YYYY-MM-DD}"
---

**Decision:** {what was being decided}
**Initial position:** {what Architect would have done alone}
**What changed:** {the insight that shifted the recommendation}
**Who changed it:** {Skeptic/Pragmatist/Critic/multiple}
**Final recommendation:** {what was actually decided}

**Why:** {why the external perspective was better}
**How to apply:** {when this lesson should inform future decisions}
```

Add a one-line pointer to `~/.claude/notes/NOTES.md`. Keep the lesson under 150 words.

## Examples

**Good council questions:**
- "Should we use a monorepo or polyrepo for this project?"
- "Is it worth migrating from REST to GraphQL given our team size?"
- "Should we ship this feature behind a flag or wait for full implementation?"
- "Redis vs PostgreSQL for our caching layer — what are the tradeoffs?"

**Bad council questions (use other tools instead):**
- "Review this PR for bugs" → use **code-reviewer**
- "Break this feature into implementation steps" → use **planner**
- "Design the database schema" → use **architect**
- "Is this code correct?" → use **santa-method**

## Integration

| Skill | Relationship |
|---|---|
| **santa-method** | Santa verifies output quality. Council deliberates decisions. Use council to decide *what* to build, santa to verify *what was* built. |
| **planner** | Council can inform planning decisions. Use council first for "should we do X or Y?", then planner for "how do we implement X?" |
| **architect** | Architect agent designs systems. Council deliberates when the architect faces genuinely ambiguous tradeoffs with no clear winner. |
| **continuous-learning-v2** | Council lessons saved to `~/.claude/notes/` feed the learning lifecycle. |
