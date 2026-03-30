# Venue Writing Styles: Master Guide

This guide provides an overview of how writing style varies across publication venues. Understanding these differences is essential for crafting papers that read like authentic publications at each venue.

**Last Updated**: 2024

---

## The Style Spectrum

Scientific writing style exists on a spectrum from **broadly accessible** to **deeply technical**:

```
Accessible ◄─────────────────────────────────────────────► Technical

Nature/Science    PNAS    Cell    IEEE Trans    NeurIPS    Specialized
   │                │       │         │            │         Journals
   │                │       │         │            │            │
   ▼                ▼       ▼         ▼            ▼            ▼
General           Mixed   Deep     Field      Dense ML      Expert
audience         depth  biology   experts    researchers    only
```

## Quick Style Reference

| Venue Type | Audience | Tone | Voice | Abstract Style |
|------------|----------|------|-------|----------------|
| **Nature/Science** | Educated non-specialists | Accessible, engaging | Active, first-person OK | Flowing paragraphs, no jargon |
| **Cell Press** | Biologists | Mechanistic, precise | Mixed | Summary + eTOC blurb + Highlights |
| **Medical (NEJM/Lancet)** | Clinicians | Evidence-focused | Formal | Structured (Background/Methods/Results/Conclusions) |
| **PLOS/BMC** | Researchers | Standard academic | Neutral | IMRaD structured or flowing |
| **IEEE/ACM** | Engineers/CS | Technical | Passive common | Concise, technical |
| **ML Conferences** | ML researchers | Dense technical | Mixed | Numbers upfront, key results |
| **NLP Conferences** | NLP researchers | Technical | Varied | Task-focused, benchmarks |

---

## High-Impact Journals (Nature, Science, Cell)

### Core Philosophy

High-impact multidisciplinary journals prioritize **broad significance** over technical depth. The question is not "Is this technically sound?" but "Why should a scientist outside this field care?"

### Key Writing Principles

1. **Start with the big picture**: Open with why this matters to science/society
2. **Minimize jargon**: Define specialized terms; prefer common words
3. **Tell a story**: Results should flow as a narrative, not a data dump
4. **Emphasize implications**: What does this change about our understanding?
5. **Accessible figures**: Schematics and models over raw data plots

### Structural Differences

**Nature/Science** vs. **Specialized Journals**:

| Element | Nature/Science | Specialized Journal |
|---------|---------------|---------------------|
| Introduction | 3-4 paragraphs, broad → specific | Extensive literature review |
| Methods | Often in supplement or brief | Full detail in main text |
| Results | Organized by finding/story | Organized by experiment |
| Discussion | Implications first, then caveats | Detailed comparison to literature |
| Figures | Conceptual schematics valued | Raw data emphasized |

### Example: Same Finding, Different Styles

**Nature style**:
> "We discovered that protein X acts as a molecular switch controlling cell fate decisions during development, resolving a longstanding question about how stem cells choose their destiny."

**Specialized journal style**:
> "Using CRISPR-Cas9 knockout in murine embryonic stem cells (mESCs), we demonstrate that protein X (encoded by gene ABC1) regulates the expression of pluripotency factors Oct4, Sox2, and Nanog through direct promoter binding, as confirmed by ChIP-seq analysis (n=3 biological replicates, FDR < 0.05)."

---

## Medical Journals (NEJM, Lancet, JAMA, BMJ)

### Core Philosophy

Medical journals prioritize **clinical relevance** and **patient outcomes**. Every finding must connect to practice.

### Key Writing Principles

1. **Patient-centered language**: "Patients receiving treatment X" not "Treatment X subjects"
2. **Evidence strength**: Careful hedging based on study design
3. **Clinical actionability**: "So what?" for practicing physicians
4. **Absolute numbers**: Report absolute risk reduction, not just relative
5. **Structured abstracts**: Required with labeled sections

### Structured Abstract Format (Medical)

```
Background: [1-2 sentences on problem and rationale]

Methods: [Study design, setting, participants, intervention, outcomes, analysis]

Results: [Primary outcome with confidence intervals, secondary outcomes, adverse events]

Conclusions: [Clinical implications, limitations acknowledged]
```

### Evidence Language Conventions

| Study Design | Appropriate Language |
|-------------|---------------------|
| RCT | "Treatment X reduced mortality by..." |
| Observational | "Treatment X was associated with reduced mortality..." |
| Case series | "These findings suggest that treatment X may..." |
| Case report | "This case illustrates that treatment X can..." |

---

## ML/AI Conferences (NeurIPS, ICML, ICLR, CVPR)

### Core Philosophy

ML conferences value **novelty**, **rigorous experiments**, and **reproducibility**. The focus is on advancing the state of the art with empirical evidence.

### Key Writing Principles

1. **Contribution bullets**: Numbered list in introduction stating exactly what's new
2. **Baselines are critical**: Compare against strong, recent baselines
3. **Ablations expected**: Show what parts of your method matter
4. **Reproducibility**: Seeds, hyperparameters, compute requirements
5. **Limitations section**: Honest acknowledgment (increasingly required)

### Introduction Structure (ML Conferences)

```
[Paragraph 1: Problem motivation - why this matters]

[Paragraph 2: Limitations of existing approaches]

[Paragraph 3: Our approach at high level]

Our contributions are as follows:
• We propose [method name], a novel approach to [problem] that [key innovation].
• We provide theoretical analysis showing [guarantees/properties].
• We demonstrate state-of-the-art results on [benchmarks], improving over [baseline] by [X%].
• We release code and models at [anonymous URL for review].
```

### Abstract Style (ML Conferences)

ML abstracts are **dense and numbers-focused**:

> "We present TransformerX, a novel architecture for long-range sequence modeling that achieves O(n log n) complexity while maintaining expressivity. On the Long Range Arena benchmark, TransformerX achieves 86.2% average accuracy, outperforming Transformer (65.4%) and Performer (78.1%). On language modeling, TransformerX matches GPT-2 perplexity (18.4) using 40% fewer parameters. We provide theoretical analysis showing TransformerX can approximate any continuous sequence-to-sequence function."

### Experiment Section Expectations

1. **Datasets**: Standard benchmarks, dataset statistics
2. **Baselines**: Recent strong methods, fair comparisons
3. **Main results table**: Clear, comprehensive
4. **Ablation studies**: Remove/modify components systematically
5. **Analysis**: Error analysis, qualitative examples, failure cases
6. **Computational cost**: Training time, inference speed, memory

---

## CS Conferences (ACL, EMNLP, CHI, SIGKDD)

### ACL/EMNLP (NLP)

- **Task-focused**: Clear problem definition
- **Benchmark-heavy**: Standard datasets (GLUE, SQuAD, etc.)
- **Error analysis valued**: Where does it fail?
- **Human evaluation**: Often expected alongside automatic metrics
- **Ethical considerations**: Bias, fairness, environmental cost

### CHI (Human-Computer Interaction)

- **User-centered**: Focus on humans, not just technology
- **Study design details**: Participant recruitment, IRB approval
- **Qualitative accepted**: Interview studies, ethnography valid
- **Design implications**: Concrete takeaways for practitioners
- **Accessibility**: Consider diverse user populations

### SIGKDD (Data Mining)

- **Scalability emphasis**: Handle large data
- **Real-world applications**: Industry datasets valued
- **Efficiency metrics**: Time and space complexity
- **Novelty in methods or applications**: Both paths valid

---

## Adapting Between Venue Types

### Journal → ML Conference

When converting a journal paper to conference format:

1. **Condense introduction**: Remove extensive background
2. **Add contribution list**: Explicitly enumerate contributions
3. **Restructure results**: Organize as experiments, add ablations
4. **Remove separate discussion**: Integrate interpretation briefly
5. **Add reproducibility section**: Seeds, hyperparameters, code

### ML Conference → Journal

When expanding a conference paper to journal:

1. **Expand related work**: Comprehensive literature review
2. **Detailed methods**: Full algorithmic description
3. **More experiments**: Additional datasets, analyses
4. **Extended discussion**: Implications, limitations, future work
5. **Appendix → main text**: Move important details up

### Specialized → High-Impact Journal

When targeting Nature/Science/Cell from a specialized venue:

1. **Lead with significance**: Why does this matter broadly?
2. **Reduce jargon by 80%**: Replace technical terms
3. **Add conceptual figures**: Schematics, models, not just data
4. **Story-driven results**: Narrative flow, not experiment-by-experiment
5. **Broaden discussion**: Implications beyond the subfield

---

## Voice and Tone Guidelines

### Active vs. Passive Voice

| Venue | Preference | Example |
|-------|-----------|---------|
| Nature/Science | Active encouraged | "We discovered that..." |
| Cell | Mixed | "Our results demonstrate..." |
| Medical | Passive common | "Patients were randomized to..." |
| IEEE | Passive traditional | "The algorithm was implemented..." |
| ML Conferences | Active preferred | "We propose a method that..." |

### First Person Usage

| Venue | First Person | Example |
|-------|-------------|---------|
| Nature/Science | Yes (we) | "We show that..." |
| Cell | Yes (we) | "We found that..." |
| Medical | Sometimes | "We conducted a trial..." |
| IEEE | Less common | Prefer "This paper presents..." |
| ML Conferences | Yes (we) | "We introduce..." |

### Hedging and Certainty

| Claim Strength | Language |
|---------------|----------|
| Strong | "X causes Y" (only with causal evidence) |
| Moderate | "X is associated with Y" / "X leads to Y" |
| Tentative | "X may contribute to Y" / "X suggests that..." |
| Speculative | "It is possible that X..." / "One interpretation is..." |

---

## Common Style Errors by Venue

### Nature/Science Submissions

❌ Too technical: "We used CRISPR-Cas9 with sgRNAs targeting exon 3..."
✅ Accessible: "Using gene-editing technology, we disabled the gene..."

❌ Dry opening: "Protein X is involved in cellular signaling..."
✅ Engaging opening: "How do cells decide their fate? We discovered that..."

### ML Conference Submissions

❌ Vague contributions: "We present a new method for X"
✅ Specific contributions: "We propose Method Y that achieves Z% improvement on benchmark W"

❌ Missing ablations: Only showing full method results
✅ Complete: Table showing contribution of each component

### Medical Journal Submissions

❌ Missing absolute numbers: "50% reduction in risk"
✅ Complete: "50% relative reduction (ARR 2.5%, NNT 40)"

❌ Causal language for observational data: "Treatment caused improvement"
✅ Appropriate: "Treatment was associated with improvement"

---

## Quick Checklist Before Submission

### All Venues
- [ ] Abstract matches venue style (flowing vs. structured)
- [ ] Voice/tone appropriate for audience
- [ ] Jargon level appropriate
- [ ] Figures match venue expectations
- [ ] Citation style correct

### High-Impact Journals (Nature/Science/Cell)
- [ ] Broad significance clear in first paragraph
- [ ] Non-specialist can understand abstract
- [ ] Story-driven results narrative
- [ ] Conceptual figures included
- [ ] Implications emphasized

### ML Conferences
- [ ] Contribution list in introduction
- [ ] Strong baselines included
- [ ] Ablation studies present
- [ ] Reproducibility information complete
- [ ] Limitations acknowledged

### Medical Journals
- [ ] Structured abstract (if required)
- [ ] Patient-centered language
- [ ] Evidence strength appropriate
- [ ] Absolute numbers reported
- [ ] CONSORT/STROBE compliance

---

## See Also

- `nature_science_style.md` - Detailed Nature/Science writing guide
- `cell_press_style.md` - Cell family journal conventions
- `medical_journal_styles.md` - NEJM, Lancet, JAMA, BMJ guide
- `ml_conference_style.md` - NeurIPS, ICML, ICLR, CVPR conventions
- `cs_conference_style.md` - ACL, CHI, SIGKDD guide
- `reviewer_expectations.md` - What reviewers look for by venue


