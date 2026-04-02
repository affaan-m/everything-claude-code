---
name: argus-council
description: >
  Convene a 4-voice AI council (Claude Architect + Fresh Claude Skeptic + External Pragmatist + External Critic) for diverse perspectives.
  Use when the user asks "what would a good group of people think/design/do",
  wants multiple opinions, asks for "ideas", "thoughts", "suggestions", "advice",
  "input", "feedback", "recommendations", says "council", "perspectives",
  "what would others think", "group wisdom", "diverse viewpoints", "what do you all think",
  or needs group deliberation on decisions, tradeoffs, design choices, architecture,
  or strategy. NOT for simple tasks with clear answers — only for ambiguous problems
  that benefit from multiple lenses.
  Part of the Argus multi-model review system.
origin: "Chris Yau (@chris-yyau)"
---

# Argus Council

Convene four advisors — the in-context Claude plus three fresh agents — for diverse perspectives on ambiguous decisions. Each gives an independent perspective, then synthesize into a compressed verdict.

The core insight: a single AI reviewing a problem shares its own biases, knowledge gaps, and blind spots. Multiple independent models with different training data break this failure mode. The council doesn't just add voices — it adds *genuinely different perspectives*.

## Roles (Fixed)

| Voice | Method | Role | Lens |
|---|---|---|---|
| Claude (you) | In-context | Architect | Correctness, maintainability, long-term implications |
| Fresh Claude | Agent tool (clean memory) | Skeptic | Challenge assumptions, question premises, propose simplest alternative |
| External Model 1 | argus-dispatch | Pragmatist | Shipping speed, simplicity, user impact, practical tradeoffs |
| External Model 2 | argus-dispatch | Critic | Edge cases, risks, failure modes, what could go wrong |

**Model diversity**: The Pragmatist and Critic are dispatched to external CLIs (Codex, Gemini, etc.) via the `argus-dispatch` skill. This gives true model diversity — different training data, different biases, different blind spots. If no external CLIs are installed, fall back to additional Claude Agent instances (context isolation preserved, model diversity lost — log the degradation).

The Fresh Claude Skeptic has **zero conversation context** — it receives only the question and optional code snippets. Its unique value is immunity to conversational drift: it sees what the anchored council has stopped noticing. If the question itself is wrong or the answer is simpler than the council thinks, the Skeptic says so.

## Process

### Step 1: Extract the Question

Get the question from skill args or infer from conversation context. If vague, ask ONE clarifying question before proceeding.

### Step 2: Context Check

If the question is **codebase-specific** (references files, architecture, specific code):
- Gather relevant file snippets (max ~2000 tokens total)
- Include them in the dispatch prompt under a `## Context` section

If it's a **general** design/strategy question, skip this — just send the question.

### Step 3: Form Your Perspective FIRST

Think through your Architect position **before** seeing external responses. This prevents anchoring on their answers.

Write down:
- **Position**: 1-2 sentence clear stance
- **Reasoning**: 3 key points
- **Risk**: The biggest risk with your approach

Hold this. You'll include it in the report after dispatch completes.

### Step 4: Dispatch Fresh Claude + External Models

Launch all three agents in parallel. Use a **single message with multiple tool calls** to maximize concurrency.

**4a. Fresh Claude (Skeptic)** — via Agent tool (starts with clean memory):

```
Agent(
  description="Argus Council Skeptic",
  prompt="You are the Skeptic on a council of four AI advisors. [QUESTION + CONTEXT]. Your role is Skeptic — you have NO prior context about this conversation. Focus on: challenging assumptions, questioning whether the problem is framed correctly, and proposing the simplest possible alternative. If the question itself is wrong or the answer is simpler than expected, say so. Give your perspective as: 1. Position (1-2 sentences) 2. Reasoning (3 points) 3. Risk 4. Surprise. Under 300 words. Be opinionated, no hedging.",
  model="opus"
)
```

**4b. External Models (Pragmatist + Critic)** — via argus-dispatch:

First, check which external CLIs are available:

```bash
DISPATCH="$(dirname "$(find ~/.claude -name 'argus-dispatch.sh' -path '*/argus-dispatch/*' 2>/dev/null | head -1)" 2>/dev/null)/argus-dispatch.sh"

# If argus-dispatch not found, check plugin paths
if [[ ! -x "$DISPATCH" ]]; then
  for base in ~/.claude/plugins/*/skills/argus-dispatch/scripts ~/.claude/skills/argus-dispatch/scripts; do
    [[ -x "$base/argus-dispatch.sh" ]] && DISPATCH="$base/argus-dispatch.sh" && break
  done
fi

if [[ -x "$DISPATCH" ]]; then
  # Dispatch both voices as background processes in a single Bash call
  "$DISPATCH" --cli auto --timeout 300 --prompt "<Pragmatist prompt>" &
  "$DISPATCH" --cli auto --timeout 300 --prompt "<Critic prompt>" &
  wait
fi
```

If `argus-dispatch` is not available or no external CLIs are installed, fall back to two additional Agent tool calls (subagent_type: `general-purpose`). Log the degradation.

**IMPORTANT:** Launch the Agent tool call (Skeptic) AND the single Bash dispatch call (Pragmatist + Critic as background processes) in the **same message** so all three voices run concurrently. Do NOT use separate Bash tool calls — one failing will cancel the other.

**Prompt template** for external models (same structure as Skeptic but with their role/lens):

**For Pragmatist:** Role = "Pragmatist", Lens = "shipping speed, simplicity, user impact, practical tradeoffs"
**For Critic:** Role = "Critic", Lens = "edge cases, risks, failure modes, what could go wrong"

**Degradation:** If an agent call fails (rate limit, timeout), the council degrades to available voices and logs the degradation inline in the report. Minimum viable council is 1 voice (Architect alone). Note the composition in the report.

### Step 5: Read Output and Synthesize

Read the Fresh Claude output from the Agent tool result. Read external model output from the path printed by argus-dispatch.sh to stderr (typically `${TMPDIR:-/tmp}/argus-{cli}-*.txt`).

<CRITICAL>
SYNTHESIZER BIAS GUARDRAILS

You are both a council member AND the synthesizer. This is a conflict of interest. Rules:

1. NEVER dismiss an external perspective without stating why
2. If any voice raised a point you didn't consider, EXPLICITLY credit it
3. The "Strongest dissent" section is MANDATORY — even if you disagree with it
4. If two or more voices agree against you, seriously consider that you might be wrong
5. Raw positions appear ABOVE the synthesis — the user can always check your work
6. The Fresh Claude Skeptic's premise challenges deserve special weight — they see what you can't because of conversational anchoring
</CRITICAL>

### Step 6: Present the Report

**Compressed format (always use this):**

```
## Argus Council: [short question]

**Claude (Architect):** [position in 1-2 sentences]
[1-line key reasoning]

**Fresh Claude (Skeptic):** [position in 1-2 sentences]
[1-line key reasoning]

**[Model] (Pragmatist):** [position in 1-2 sentences]
[1-line key reasoning]

**[Model] (Critic):** [position in 1-2 sentences]
[1-line key reasoning]

### Verdict
- **Consensus:** [where they agree]
- **Strongest dissent:** [the most important disagreement — who said it and why]
- **Premise check:** [did the Skeptic challenge the question itself? If so, what was the challenge?]
- **Recommendation:** [synthesized best path forward]
```

**Self-contained rule:** When the question involves numbered items (e.g., "6 proposed fixes"), ALL references — in individual voice positions AND the verdict — MUST restate each item inline, not just by number. The user should never need to scroll up.

If an agent failed or timed out, note it inline: `**Gemini (Pragmatist):** (unavailable — rate limited)`

Keep the entire report **scannable on a phone screen**. No ceremony. No preamble.

## Multi-Round

Default: **one round**. The council convenes, delivers the verdict, and dissolves.

If the user asks for another round ("ask them again", "what would they say to that", "follow up with the council", "another round"):

1. For external models: include prior council positions in the dispatch prompt as context
2. **For Fresh Claude Skeptic: include ONLY the new follow-up question + original question — do NOT include prior council positions.** This is critical — the Skeptic's value comes from clean memory. If you anchor them on prior positions, they become a fifth confirming voice instead of an independent challenger.
3. Add the user's follow-up question
4. Frame for external models: "The council previously said [positions]. The user now asks: [follow-up]. Respond to the other advisors' positions AND the new question."
5. Frame for Skeptic: "[Original question]. Follow-up: [new question]." — NO prior positions, NO council output.
6. Synthesize again with the same guardrails

No file persistence needed — prior output is in the conversation context.

### Step 7: Auto-Save Lesson (Recommendation Delta Filter)

<CRITICAL>
This step is AUTOMATIC. Do NOT ask the user whether to save. Evaluate the criteria below immediately after presenting the verdict. If the filter triggers, save the lesson and tell the user you saved it. If it doesn't trigger, say nothing.
</CRITICAL>

After presenting the verdict, evaluate whether the council produced a **recommendation delta** — a case where external input changed the final recommendation from what you (Claude) would have done alone.

**Capture when ANY of these are true:**
- The strongest dissent changed the final recommendation (your initial position was overridden)
- Two or more external voices agreed against your position
- An external voice raised a risk/edge-case you explicitly did not consider in Step 3
- The Skeptic challenged the premise and the challenge was valid (question was reframed)
- A severity re-rating occurred (something you rated LOW was upgraded to HIGH, or vice versa)

**Do NOT capture when:**
- All four voices agreed with the Architect's initial position (no delta)
- Dissent was noted but the final recommendation matches the Architect's Step 3 position unchanged
- The council was informational only (no decision was at stake)

**When the filter triggers**, save a lesson to the project's notes system. Format:

```markdown
**Decision:** {what was being decided}
**Initial position:** {what Claude would have done alone}
**What changed:** {the dissent/insight that shifted the recommendation}
**Who changed it:** {Skeptic/Pragmatist/Critic/multiple}
**Final recommendation:** {what we actually decided}
**Why:** {why the external perspective was better}
**How to apply:** {when this lesson should inform future decisions}
```

## When NOT to Convene

Do NOT fire the council for:
- Simple factual questions
- Clear implementation tasks ("add a button", "fix this typo")
- Bug fixes with obvious causes
- Tasks that need execution, not deliberation

If the question doesn't benefit from multiple perspectives, say so and just answer directly. The council is for **decisions and tradeoffs**, not for tasks with clear right answers.

## Integration with Argus System

| Argus Skill | Relationship |
|-------------|-------------|
| argus-dispatch | Used to send prompts to external model CLIs |
| argus-loop | Council for pre-build decisions, loop for post-build verification |
| argus-review | Council for architecture, review for code quality |
| santa-method | Council is divergent (explore options), Santa is convergent (verify output) |
