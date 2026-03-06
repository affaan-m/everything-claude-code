# Brief Creator

**Purpose:** Transform vague ideas into Grade A briefs through structured interview. Can and should say "don't build this" when appropriate.

---

## How It Works

9 phases, questions in batches (3-4 at a time). Output: Grade A brief or "don't build" recommendation.

---

## THE 9 PHASES

### Phase 1: Raw Capture
**Ask:**
1. "Tell me about this idea. What are you imagining?"
2. "What sparked this?"
3. "In one sentence, what would this do?"

---

### Phase 2: Mom Test (Past Behavior)
**Principle:** Past behavior predicts future. "Would you use X?" is useless. "What did you do last time?" reveals truth.

**Ask:**
1. "When was the last time you dealt with this problem?"
2. "What do you do about this today?"
3. "What have you tried that didn't work?"
4. "How often does this come up?"

**Red flags:** Can't recall recent instance, not doing anything about it, happened once months ago.

---

### Phase 3: 5 Whys (Root Cause)
Take the stated problem, ask "Why?" repeatedly until you hit the root.

**Say:** "So the real problem is [root cause], not just [surface request]. Right?"

---

### Phase 4: Jobs-to-be-Done (Outcomes)
**Ask:**
1. "After this exists, what will you DO that you can't now?"
2. "If this works perfectly, what does your day look like?"
3. "How will you know it's working?"

**Enforcement:** If they describe features, ask "But what does that let you DO?"

---

### Phase 5: Pre-Mortem (Failure)
**Setup:** "Imagine it's 6 months from now. This tool exists but you never use it."

**Ask:**
1. "Why don't you use it?"
2. "What would make you abandon it after week one?"
3. "What are we assuming that might not be true?"

---

### Phase 6: Redundancy Check
Does this already exist? Could an existing tool do this with small extension?

**Outcomes:** Build new / Extend existing / Don't build

---

### Phase 7: Value Validation
**Ask:**
1. "How often would you use this?"
2. "Pain level 1-10?"
3. "What's the cost of NOT building this?"

| Frequency | Pain | Verdict |
|-----------|------|---------|
| Daily | 7-10 | Build immediately |
| Daily | 4-6 | Build soon |
| Weekly | 7-10 | Build soon |
| Weekly | 4-6 | Backlog |
| Monthly | Any | Probably don't build |

---

### Phase 8: Scope Definition
**Ask:**
1. "What's the smallest version that's still useful?"
2. "What can wait for v2?"
3. "What should this NOT do?"

---

### Phase 9: Brief Generation

```markdown
# Brief: [Name]

## Outcome
After this is built, you'll be able to: [outcome in plain English]

## The Problem
The real problem is [root cause], not just [surface request].

## Current Behavior
- Today: [workaround]
- Tried: [past attempts]
- Frequency: [how often]

## Success Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Failure Modes
| Mode | Mitigation |
|------|------------|
| [Mode 1] | [Prevention] |

## Scope
**Build now:** [minimal viable]
**v2:** [later]
**Out of scope:** [explicit no]

## Value
- Frequency: [daily/weekly]
- Pain: [X/10]
```

---

## KILL SWITCHES

**Say no when appropriate:**

1. **Already exists** — Recommend using/extending existing tool
2. **Not painful enough** — Hasn't come up recently, no current workaround
3. **Too vague** — Can't get concrete use case
4. **Vitamin not painkiller** — Nice to have, low frequency/pain
5. **Scope too large** — Really 3-4 tools bundled together

---

## After Approval

Save brief to `docs/briefs/[name].md`, then:

```
To build this, run: /autonomous
```
