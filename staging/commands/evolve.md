# Evolve Command

**Purpose:** Analyze external AI/Claude resources with rigorous skepticism and decide whether to adopt, test, or ignore.

---

## Usage

```
/evolve [URL or pasted text]
```

---

## Analysis Process

### Step 1: Fetch and Parse

Retrieve content from URL or parse pasted text.

### Step 2: Summary of the Claim

2-5 bullets:
- The promised technique or method
- The problem it claims to solve
- The stated or implied outcome

### Step 3: Technical Reality Check

Classify as:

| Type | Description |
|------|-------------|
| Prompting pattern | System prompts, few-shot, chain-of-thought |
| Memory architecture | Context persistence, RAG, embeddings |
| Multi-agent workflow | Coordination, parallel work, handoffs |
| Orchestration tool | Loops, state machines, workflow engines |
| MCP/Tool pattern | Tool design, MCP servers, integrations |
| Evaluation method | Quality checks, benchmarks, verification |
| UX pattern | Interface, interaction design |
| Infrastructure | Scaling, caching, optimization |
| Misrepresentation | "Just ChatGPT with extra steps" |

### Step 4: Hype Check

| Check | Question |
|-------|----------|
| Evidence | Repo? Demo? Benchmarks? Architecture diagrams? |
| Specificity | Measurable outcomes or vibes? |
| Terminology | Correct use or buzzword salad? |
| Cherry-picking | Suspicious numbers? Best-case only? |
| Engineering detail | Could you build this from what's shown? |
| Simplicity test | Is this "just X with extra steps"? |

**Call out red flags directly. No diplomacy.**

### Step 5: Fit Mapping

Map to our Claude Code setup:

| Category | What It Covers |
|----------|----------------|
| Context/Memory | Session persistence, compaction survival |
| Workflow/Modes | /autonomous, /careful, /spike |
| Quality/Oversight | /review, /ship, /audit, /verify |
| Efficiency | Token usage, speed, parallelism |
| Skills/Prompting | How Claude approaches problems |
| Tools/MCP | External integrations |

Score fit 1-5 for each relevant category.

### Step 6: What This Replaces

State explicitly what existing workflow, file, or pattern this displaces.

**If nothing is meaningfully replaced, that's a red flag.**

### Step 7: Scores

| Metric | Rating (1-5) |
|--------|--------------|
| Usefulness | Does it solve a real problem we have? |
| Effort | How hard to implement? |
| Time to Signal | How fast can we know if it works? |
| Bullshit Risk | Likelihood this is overhyped garbage |
| Fit | Alignment with our setup and goals |

### Step 8: Recommendation

| Verdict | Meaning |
|---------|---------|
| **IGNORE** | Not worth attention |
| **PARK** | Save reference, revisit later |
| **MICRO-TEST** | 2 hours or less to validate core idea |
| **ADOPT** | Worth building into our setup |

For MICRO-TEST or ADOPT, provide:
- Goal, files to modify, steps, effort estimate, success signal

### Step 9: Caveats

Call out missing details, assumptions, and implementation risks.

---

## Output Format

```
## Evolve Analysis: [Source/Title]

### Claim Summary
- [bullets]

### Technical Reality
**Type:** [category] | **What they're actually doing:** [plain description]

### Hype Check
**Evidence:** [Strong/Medium/Weak] | **Red Flags:** [list or "None"]

### Fit Mapping
| Category | Fit (1-5) | Notes |
|----------|-----------|-------|

### What It Replaces
[Current thing] -> [Proposed thing] -- or "Nothing meaningful -- red flag"

### Scores
| Metric | Score | Rationale |
|--------|-------|-----------|

### Recommendation: [VERDICT]
- [Reason 1]
- [Reason 2]

### Implementation (if applicable)
[Plan]

### Caveats
- [list]

---
Options: 1. Implement now  2. Park it  3. Skip  4. Discuss further
```

---

## Principles

1. **Never be impressed** -- filter signal from noise
2. **No enthusiasm markers** -- direct, structured, skeptical
3. **Red flags called out directly** -- no diplomacy
4. **Everything maps to our setup** -- or it's not relevant
5. **Concrete next actions** -- or it's just noise
