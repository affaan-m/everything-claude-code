---
name: dhdna-profiler
description: Extract cognitive patterns and thinking fingerprints from any text. Use this skill when the user wants to analyze how someone thinks, understand cognitive style, profile writing or speech patterns, compare thinking styles between people, asks "what's my thinking style", "analyze how this person reasons", "cognitive profile", "thinking pattern", "DHDNA", "digital DNA", or wants to understand the mind behind any text. Also trigger when the user provides text and wants deeper insight into the author's reasoning patterns, decision-making style, or cognitive signature.
allowed-tools: Read Write
license: MIT license
metadata:
  skill-author: AHK Strategies (ashrafkahoush-ux)
---

# DHDNA Profiler — Cognitive Pattern Extraction

A structured system for extracting the cognitive fingerprint of any text's author. Based on the Digital Human DNA (DHDNA) framework — the theory that every mind has a unique signature pattern expressed through how it reasons, decides, values, and communicates.

Published research: [DHDNA Pre-print (DOI: 10.5281/zenodo.18736629)](https://doi.org/10.5281/zenodo.18736629) | [IDNA Consolidation v2 (DOI: 10.5281/zenodo.18807387)](https://doi.org/10.5281/zenodo.18807387)

## Core Concept

Just as biological DNA encodes physical identity through base pairs, Digital Human DNA encodes cognitive identity through thinking patterns. Every person's combination of analytical depth, creative range, emotional processing, strategic thinking, and ethical reasoning creates a **unique cognitive signature** — as distinctive as a fingerprint.

The profiler doesn't judge thinking as "good" or "bad." It maps the topology of how a mind works.

## The 12 Cognitive Dimensions

When profiling text, score each dimension on a 1–10 scale based on evidence in the text:

| #   | Dimension                | What It Measures                                                 | Low Score (1-3)                    | High Score (8-10)                           |
| --- | ------------------------ | ---------------------------------------------------------------- | ---------------------------------- | ------------------------------------------- |
| 1   | **Analytical Depth**     | Logical rigor, structured reasoning, causal chains               | Intuitive, holistic, pattern-based | Systematic, proof-oriented, precise         |
| 2   | **Creative Range**       | Novelty of connections, metaphor use, lateral thinking           | Conventional, incremental          | Paradigm-breaking, cross-domain synthesis   |
| 3   | **Emotional Processing** | Emotional vocabulary, empathy signals, affect integration        | Detached, clinical                 | Emotionally rich, feeling-integrated        |
| 4   | **Linguistic Precision** | Vocabulary sophistication, sentence architecture, rhetoric       | Simple, direct                     | Architecturally complex, nuanced            |
| 5   | **Ethical Reasoning**    | Values signals, fairness concern, consequence awareness          | Pragmatic, outcome-focused         | Principle-driven, justice-oriented          |
| 6   | **Strategic Thinking**   | Long-term planning, competitive awareness, resource optimization | Tactical, reactive                 | Multi-move, game-theoretic                  |
| 7   | **Memory Integration**   | Reference to past experience, historical patterns, continuity    | Present-focused                    | Deep historical awareness, precedent-driven |
| 8   | **Social Intelligence**  | Audience awareness, perspective-taking, relational framing       | Self-referential                   | Deeply other-aware, coalition-building      |
| 9   | **Domain Expertise**     | Technical depth, specialized knowledge, jargon confidence        | Generalist                         | Deep specialist                             |
| 10  | **Intuitive Reasoning**  | Gut-feel signals, heuristic shortcuts, pattern leaps             | Methodical, step-by-step           | Leap-of-faith, insight-driven               |
| 11  | **Temporal Orientation** | Time-horizon of thinking — past, present, or future focus        | Present-anchored                   | Time-spanning, historical-to-futurist       |
| 12  | **Metacognition**        | Self-awareness of own thinking, uncertainty acknowledgment       | Unreflective                       | Deeply self-aware, thinks about thinking    |

### The 6 Tension Pairs

Dimensions exist in tension — high scores on one often correlate with lower scores on its pair. These tensions ARE the cognitive signature:

| Pair           | Tension                    | What It Reveals                                                        |
| -------------- | -------------------------- | ---------------------------------------------------------------------- |
| DIM 1 ↔ DIM 10 | Analytical ↔ Intuitive     | Logic vs. Gut — how the mind reaches conclusions                       |
| DIM 3 ↔ DIM 6  | Emotional ↔ Strategic      | Heart vs. Head — what drives decisions                                 |
| DIM 2 ↔ DIM 5  | Creative ↔ Ethical         | Freedom vs. Framework — innovation within or beyond rules              |
| DIM 4 ↔ DIM 12 | Linguistic ↔ Metacognitive | Expression vs. Self-Awareness — external craft vs. internal reflection |
| DIM 7 ↔ DIM 11 | Memory ↔ Temporal          | Past vs. Time Itself — experience vs. time-horizon                     |
| DIM 8 ↔ DIM 9  | Social ↔ Domain            | Breadth vs. Depth — people skills vs. technical mastery                |

## How to Profile

### Phase 1 — Evidence Collection

Read the text carefully. For each dimension, identify **specific textual evidence**:

- Direct quotes that demonstrate the dimension
- Structural patterns (how arguments are built)
- What's present AND what's absent (gaps reveal as much as content)
- Recurring patterns across multiple passages

### Phase 2 — Scoring

For each of the 12 dimensions:

1. Score 1-10 based on evidence
2. Cite the strongest textual evidence for that score
3. Flag confidence level: HIGH (multiple clear signals), MEDIUM (some signals), LOW (inferred)

### Phase 3 — Pattern Synthesis

After scoring, identify:

**Dominant Pattern:** The 2-3 highest-scoring dimensions — this is the mind's "home base"

**Shadow Pattern:** The 2-3 lowest-scoring dimensions — this is where the mind doesn't naturally go

**Signature Tensions:** Which tension pairs show the widest gap? These define the cognitive style more than any individual score.

**Reasoning Topology:** How does the mind move through ideas?

- Linear (A → B → C → conclusion)
- Spiral (approaches the same idea from multiple angles, each time deeper)
- Web (connects disparate domains into synthesis)
- Dialectic (thesis → antithesis → synthesis)
- Fractal (same pattern at micro and macro levels)

**Decision Fingerprint:** When facing choices, does this mind:

- Analyze first, then decide? (Analytical-dominant)
- Feel first, then rationalize? (Emotional-dominant)
- Envision the outcome first, then work backward? (Strategic-dominant)
- Question the question itself? (Metacognitive-dominant)

### Phase 4 — Profile Output

Present the profile as:

```
═══════════════════════════════════════════
  DHDNA COGNITIVE PROFILE
  Subject: [Name or "Anonymous"]
  Text analyzed: [N words / N paragraphs]
  Confidence: [HIGH / MEDIUM / LOW]
═══════════════════════════════════════════

DIMENSION SCORES:
  1. Analytical Depth ···· [█████████·] 9/10
  2. Creative Range ······ [███████···] 7/10
  ... (all 12)

TENSION MAP:
  Analytical ████████░░ ↔ ░░████████ Intuitive
  Emotional  ███░░░░░░░ ↔ ░░░░░░████ Strategic
  ... (all 6 pairs)

DOMINANT PATTERN: [Top 2-3 dimensions]
SHADOW PATTERN: [Bottom 2-3 dimensions]
REASONING TOPOLOGY: [Linear / Spiral / Web / Dialectic / Fractal]
DECISION FINGERPRINT: [Analyze-first / Feel-first / Envision-first / Question-first]

NARRATIVE SYNTHESIS:
[2-3 paragraph natural language description of how this mind works,
what makes it distinctive, and what it might miss]

KEY QUOTES:
[3-5 most revealing quotes with dimension attribution]
═══════════════════════════════════════════
```

## Comparison Mode

When the user provides two or more texts from different authors, produce individual profiles and then a **comparison synthesis**:

- Where do the minds converge? (shared high dimensions)
- Where do they diverge? (opposing scores on the same dimension)
- Which tension pairs would create productive disagreement?
- If these minds were in a room together, what would the conversation look like?

## Self-Profile Mode

If the user asks to profile their own thinking (using the conversation history as text), be transparent:

- Score based on the conversation so far
- Acknowledge that conversational text may not represent the full range
- Note that people often think differently when writing for an AI vs. writing for humans
- Offer to re-profile if the user provides other writing samples

## What This Is NOT

- Not a personality test (MBTI, Big Five, etc.) — those measure behavioral tendencies, DHDNA measures cognitive architecture
- Not a judgment of intelligence — a chess grandmaster and a poet may score very differently but both demonstrate profound cognitive capability
- Not static — a person's DHDNA evolves as they learn, experience, and grow. A profile is a snapshot, not a destiny.

## Built By

[AHK Strategies](https://ahkstrategies.net) — AI Horizon Knowledge
Full platform: [themindbook.app](https://themindbook.app)
Research: [DHDNA Paper (DOI: 10.5281/zenodo.18736629)](https://doi.org/10.5281/zenodo.18736629)
