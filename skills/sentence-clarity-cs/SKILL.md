---
name: sentence-clarity-cs
description: Edit sentences in CS research papers for clarity, conciseness, and readability. Use this skill whenever you see unclear, overly long, or awkwardly structured sentences. Identifies sentence length issues (>25 words), ambiguous pronouns, weak verbs, passive voice, deeply nested clauses, and unclear referents. Trigger on "sentence clarity", "fix my sentences", "make this clearer", "awkward phrasing", "simplify this", or when noticing written prose in academic papers that could be tightened.
origin: ECC
---

# Sentence Clarity Editor for CS Papers

You review sentences in CS research papers and suggest improvements for clarity, conciseness, and readability. Output JSONL format—one sentence issue per line, independent of others. This skill targets the specific patterns that make academic CS writing dense, hard to parse, and less impactful than it should be.

## When to Activate

Use this skill when:
- Reviewing draft paper sections (Abstract, Introduction, Methods, Results, Discussion, Related Work)
- Author says "sentence clarity", "make this clearer", "fix my writing", "awkward phrasing", "simplify this"
- You notice written prose in academic CS papers that has any of these characteristics:
  - Sentences longer than 25 words
  - Heavy use of passive voice or weak linking verbs
  - Ambiguous pronouns (this, it, they, that) with unclear referents
  - Deeply nested clauses (3+ levels of nesting: main + relative clause + parenthetical, etc.)
  - Nominalization chains ("the implementation of the system enables the improvement of performance")
  - Hedging or filler phrases that weaken assertions
  - Dense jargon without context
- During pre-submission review to polish paper clarity before camera-ready

## Your Task

When given paper text, identify sentences that are unclear, too long, use weak verbs, employ excessive passive voice, or have ambiguous pronouns. Each sentence issue is independent; fixing one doesn't affect validation of others. Focus on sentences that, when tightened, will improve reader comprehension and paper impact.

## Output Format (JSONL)

Output exactly one JSON object per line. Each object is one sentence-level improvement opportunity. Keep each JSON object on a single line (no wrapping). The machine-readable schema lives at `schema/output.schema.json`.

Required fields:

| Field | Type | Notes |
|-------|------|-------|
| `line` | integer | Approximate line where the sentence starts |
| `problem_type` | string | One of the category keys below |
| `current` | string | The original sentence (may truncate with `…` if very long, keep enough to locate it) |
| `suggested` | string | The revised sentence |
| `reason` | string | One sentence: why the new form is clearer, shorter, stronger, or more direct |

Example output:

```jsonl
{"line": 42, "problem_type": "sentence_length", "current": "The performance of our system, which integrates multiple machine learning models with real-time data processing capabilities, is evaluated against several baseline systems on a diverse set of benchmarks that span different application domains.", "suggested": "We evaluate our system—which integrates multiple ML models with real-time data processing—against baselines across diverse benchmarks.", "reason": "Cuts 38→22 words; active voice surfaces agency; em-dash preserves the qualifier without nesting."}
{"line": 88, "problem_type": "ambiguous_pronoun", "current": "This improves scalability and reduces latency.", "suggested": "Hierarchical clustering improves scalability and reduces latency.", "reason": "Replaces 'This' with its concrete antecedent so the referent is unambiguous."}
{"line": 131, "problem_type": "hedge_language", "current": "It could be argued that the method is somewhat better than existing approaches.", "suggested": "Our method outperforms existing approaches by 14% F1 on CoNLL-2003.", "reason": "Removes five hedges; replaces vague claim with a specific quantitative result."}
```

## Issue Categories

- `sentence_length` - More than 25 words or excessively nested (hard to parse, breaks reader attention)
- `weak_verb` - Passive voice, "is/are" constructions, nominalizations ("make use of" → "use")
- `ambiguous_pronoun` - "this", "it", "they" without clear referent (reader must backtrack)
- `passive_voice` - Sentence uses passive when active is clearer or stronger
- `nested_clauses` - More than 2 levels of nesting (parenthetical inside relative clause inside main clause)
- `unclear_referent` - Demonstrative pronoun ("this", "that", "these") pointing to vague or distant antecedent
- `nominalization` - Overuse of noun forms from verbs ("the implementation" instead of "implementing"; "the consideration of" instead of "considering")
- `hedge_language` - Filler phrases that weaken assertions ("it should be noted that", "it is worth mentioning that", "somewhat", "arguably")

## Before/After Examples (Real CS Paper Prose)

These examples show actual patterns from CS research writing, with the problem identified and the fix applied.

### Example 1: Excessive Sentence Length + Multiple Weak Verbs

**Original (38 words):**
"The performance of our system, which integrates multiple machine learning models with real-time data processing capabilities, is evaluated against several baseline systems on a diverse set of benchmarks that span different application domains."

**Problem:** Sentence length, passive voice ("is evaluated"), unclear what "our system" does until the end.

**Improved (28 words):**
"We evaluate our system—which integrates multiple ML models with real-time data processing—against baseline systems across diverse benchmarks spanning different application domains."

**Why:** Active voice ("We evaluate") immediately clarifies agency. Reduced word count. Subordination using em-dash makes the relationship clearer. Abbreviation of "machine learning" to "ML" in academic context is acceptable.

---

### Example 2: Ambiguous Pronoun Reference

**Original:**
"The algorithm processes distributed data and applies hierarchical clustering, which improves scalability and reduces latency. This is a key advantage in production systems."

**Problem:** "This" is ambiguous—does it refer to the algorithm, clustering, improving scalability, reducing latency, or the combination?

**Improved:**
"The algorithm processes distributed data and applies hierarchical clustering, reducing latency and improving scalability—key advantages in production systems."

**Why:** Eliminates vague pronoun by directly connecting the benefit to the action. Shorter and more direct.

---

### Example 3: Nominalization Chain (Action Hidden Behind Nouns)

**Original:**
"The implementation of our framework enables the efficient processing of large-scale datasets, with the result being a significant reduction in query execution time."

**Problem:** Three nominalizations obscure the main actions. Passive construction ("with the result being") weakens the claim.

**Improved:**
"Our framework processes large-scale datasets efficiently and reduces query execution time significantly."

**Why:** Verbs (processes, reduces) replace nominalizations (implementation, processing, reduction). Stronger, more readable, 40% shorter.

---

### Example 4: Passive Voice + Unclear Agent

**Original:**
"It was observed that the proposed approach was more efficient than the baseline in 87% of test cases."

**Problem:** Passive voice hides who made the observation. "It was observed" is filler. Vague passive "was more efficient" without stating what makes it efficient.

**Improved:**
"Our approach outperformed the baseline in 87% of test cases."

**Why:** Active voice identifies the agent (implicitly, the paper/authors). Stronger verb "outperformed" replaces weak "was more efficient than". Direct and quantitative.

---

### Example 5: Deeply Nested Clauses

**Original:**
"The optimization strategy, which is based on a greedy heuristic that prioritizes nodes with the highest degree (a metric that measures local connectivity), proves effective for graphs with power-law degree distributions."

**Problem:** Three levels of nesting (main clause > relative clause > parenthetical). Reader must hold multiple contexts in mind.

**Improved:**
"The greedy optimization strategy prioritizes high-degree nodes (a measure of local connectivity) and proves effective for power-law graphs."

**Why:** Eliminated one level of nesting. Replaced passive "is based on" with active "prioritizes". Clearer progression of ideas.

---

### Example 6: Hedge Language + Weak Assertions

**Original:**
"It could be argued that the proposed method is somewhat better than existing approaches in certain scenarios, though this observation arguably warrants further investigation."

**Problem:** Five hedging phrases ("could be argued", "somewhat", "in certain scenarios", "arguably", "arguably warrants") undermine confidence. Passive construction.

**Improved:**
"Our method outperforms existing approaches in scenarios with sparse data; we analyze the conditions that enable this advantage in Section 5."

**Why:** Makes the claim concrete and specific rather than hedged. Promises investigation rather than timidly suggesting it. Positions future work as contribution, not apology.

---

## DO/DON'T Patterns for Clear CS Writing

### DO

- Use active voice: "We implement X" instead of "X is implemented"
- Use strong verbs: "optimizes", "reduces", "enables", "achieves" instead of "is" + adjective
- Keep sentences under 25 words; if longer, use em-dashes or semicolons to break internal clauses
- Clarify pronouns immediately: "We propose Algorithm Y, which reduces latency" (not "This reduces latency" later)
- Put the agent (subject) early in the sentence: "Algorithm X reduces..." not "The reduction enabled by Algorithm X is..."
- Use parallel structure: "Our method reduces latency, improves accuracy, and scales to 1M nodes" (not mixed passive/active)
- Define jargon on first use: "Our approach uses vector quantization (VQ), a compression technique..."
- Use specific numbers: "improves by 23%" instead of "significantly improves"

### DON'T

- Avoid noun chains: "machine learning model training dataset optimization approach" (use active clauses instead)
- Avoid "It is" constructions: "It is worth noting that..." or "It is shown that..." or "It should be noted that..."
- Avoid buried verbs: "The implementation of our method enables a 30% reduction in memory overhead" → "Our method reduces memory overhead by 30%"
- Avoid vague demonstratives without referents: Never use "This" or "That" at the start of a sentence unless the previous sentence contains a single clear noun it refers to
- Avoid excessive subordination: Don't nest more than 2 levels deep
- Avoid weak passives: "was found to be", "was observed to", "is considered to be" (just use the adjective)
- Avoid hedging when you have data: "appears to suggest" instead of "shows" when you have experimental evidence

---

## Common CS Writing Anti-Patterns

These phrases should trigger refactoring:

| Anti-Pattern | Better Alternative |
|--------------|-------------------|
| "It should be noted that..." | Delete. State the fact directly. |
| "In order to..." | Use "To" instead. ("To optimize X, we..." not "In order to optimize X, we...") |
| "The fact that..." | Remove "The fact that" and use the clause directly. ("Since Y is slow" not "The fact that Y is slow...") |
| "It is worth mentioning that..." | Delete and rewrite. ("Algorithm Y converges faster" not "It is worth mentioning that Algorithm Y converges faster") |
| "It can be seen that..." | State the observation directly. ("Our results show that..." not "It can be seen that...") |
| "It is known that..." | Replace with "Prior work shows that..." or "X shows that..." |
| "somewhat/relatively/fairly/quite" | Delete or replace with precise quantification. ("reduces latency by 15%" not "somewhat reduces latency") |
| "arguably/one could argue" | State the claim directly with evidence or hedging data. Delete if you have proof. |
| "the issue of X" / "the problem of X" | Replace with the root noun. ("memory overhead" not "the problem of memory overhead") |
| "due to the fact that" | Replace with "because" or "since". |
| "on the other hand" | Use "In contrast" or "However" with an agent doing something. |
| "a method/technique/approach is presented" | "We present a method..." (active agent). |
| "the implementation of the system" | Determine what the system actually does and use that verb. |

---

## Venue-Specific Tips

### ACM Conferences (SIGMOD, OSDI, PLDI, POPL, CCS, etc.)

- Prefer "we" over passive voice (ACM culture favors author agency)
- Use precise metrics and quantification (not "significantly" without numbers)
- Keep abstracts under 150 words, often under 100
- Use "paper" to refer to your work: "This paper presents..." or "In this paper, we..."
- Avoid "novel" unless truly unprecedented—show impact instead

### IEEE Transactions & Conferences

- More accepting of passive voice, but active is still preferred
- Require precise problem statements in Introduction
- Use section numbering and cross-references heavily
- Tables and figures should be self-contained (captions should summarize results, not just label)
- Acronyms must be defined on first use

### General Best Practices (Most Venues)

- Introduction: clarify problem, contribution, and why it matters (in that order)
- Related Work: position your contribution relative to prior art (don't just list papers)
- Methods: pseudocode or algorithms > prose descriptions when possible
- Results: lead with the key finding; don't make readers infer the main point
- Discussion: address limitations explicitly; don't hide weaknesses
- Use first person in Methods/Results (we performed, we observe); third person in Related Work if comparing

---

## LaTeX-Specific Clarity Considerations

When writing sentences destined for LaTeX:

- **Line breaks in LaTeX don't affect output formatting.** You can write long sentences freely, but readers see them as wrapped on screen. Still keep sentences under 25 words for comprehension (not just visual aesthetics).
- **Math mode breaks clarity.** Use \(x\) for inline math, not $x$, for screen readers and future accessibility. Introduce variables in prose first: "Let \(x\) denote..." (not just "Consider $x$...").
- **Avoid sentence fragments after math.** "We define $\mathcal{G} = (V, E)$" is better than "Define $\mathcal{G} = (V, E)$ where..." for clarity.
- **Use \cite{} close to the claim.** "Our method [4] is efficient" not "Our method is efficient. [4] proves this."
- **TikZ/PGF figure captions should not require the figure to be understood.** Write: "Algorithm 1: Cache-aware merging. We prioritize in-cache prefixes (blue) before accessing main memory (gray)." Not: "Figure 1."
- **Common LaTeX clarity issues:**
  - `\textit{something} is` → use `\textup` or roman for nouns, italics for emphasis only
  - Orphaned `$...$` expressions in prose → embed them in clauses: "reduce latency $\ell$ by" not "reduce latency. $\ell$..."
  - Overuse of `\emph{}` → reserve for single key words per paragraph
  - Undefined notation: always define symbols before use, even if standard in your subfield

---

## Quick Reference Checklist

When reviewing your own sentences, ask:

- [ ] **Is this sentence under 25 words?** If not, can I break it with an em-dash, semicolon, or period?
- [ ] **Who is the subject (agent)?** Is it clear in the first few words?
- [ ] **What verb appears in the main clause?** Is it strong or weak ("reduces" vs "is able to reduce")?
- [ ] **Do any pronouns appear (this, it, they, that)?** Do they have a single clear antecedent in the previous sentence?
- [ ] **How many levels of nesting?** If more than 2, rewrite using multiple sentences.
- [ ] **Are there nominalization chains?** ("implementation of...", "optimization of...") Can I use the root verb instead?
- [ ] **Is passive voice justified?** (E.g., "Errors were counted by hand" might be acceptable if the agent is irrelevant, but "Our approach was evaluated on benchmarks" should be active.)
- [ ] **Any hedge words?** ("somewhat", "arguably", "appears to") Can I replace them with data or delete them?

---

## Output Requirements

- One sentence per line (JSONL format); fields as documented in "Output Format (JSONL)" above.
- `problem_type` must be one of the categories listed (sentence_length, weak_verb, ambiguous_pronoun, passive_voice, nested_clauses, unclear_referent, nominalization, or hedge_language).
- `current` may be truncated with `…` when the sentence is unusually long; keep enough on either side to locate it in the source.
- `reason` explains the improvement in one sentence; focus on impact — clarity, brevity, strength, directness.
- Do not group related sentences — report each independently.
- Order suggestions by ascending `line` number.

---

## Related Skills

This skill handles sentence-level polish in the paper-review pipeline. Run the skills in order for the strongest coverage:

1. `paper-structure-cs` — verify sections are present and correctly ordered.
2. `abstract-methods-results-cs` — deep review of the three most-scrutinized sections.
3. **`sentence-clarity-cs` (this skill)** — polish prose at the sentence level.
4. `academic-final-review-cs` — final pre-submission checklist.
