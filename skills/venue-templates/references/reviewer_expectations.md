# Reviewer Expectations by Venue

Understanding what reviewers look for at different venues is essential for crafting successful submissions. This guide covers evaluation criteria, common rejection reasons, and how to address reviewer concerns.

**Last Updated**: 2024

---

## Overview

Reviewers at different venues prioritize different aspects. Understanding these priorities helps you:
1. Frame your contribution appropriately
2. Anticipate likely criticisms
3. Prepare effective rebuttals
4. Decide where to submit

---

## High-Impact Journals (Nature, Science, Cell)

### What Reviewers Look For

| Priority | Weight | Description |
|----------|--------|-------------|
| **Broad significance** | Critical | Impact beyond the specific subfield |
| **Novelty** | Critical | First to show this or major advance |
| **Technical rigor** | High | Sound methodology, appropriate controls |
| **Clarity** | High | Accessible to non-specialists |
| **Completeness** | Moderate | Thorough but not exhaustive |

### Review Process

1. **Editorial triage**: Most papers rejected without review (Nature: ~92%)
2. **Expert review**: 2-4 reviewers if sent out
3. **Cross-discipline reviewer**: Often includes non-specialist
4. **Quick turnaround**: First decision typically 2-4 weeks

### What Gets a Paper Rejected

**At Editorial Stage**:
- Findings not significant enough for broad audience
- Incremental advance over prior work
- Too specialized for the journal
- Topic doesn't fit current editorial interests

**At Review Stage**:
- Claims not supported by data
- Missing critical controls
- Alternative interpretations not addressed
- Statistical concerns
- Prior work not adequately acknowledged
- Writing inaccessible to non-specialists

### How to Address Nature/Science Reviewers

**In the paper**:
- Lead with significance in the first paragraph
- Explain why findings matter broadly
- Include controls for all major claims
- Use clear, accessible language
- Include conceptual figures

**In rebuttal**:
- Address every point (even minor ones)
- Provide new data when requested
- Acknowledge valid criticisms gracefully
- Explain significance if questioned

### Sample Reviewer Concerns and Responses

**Reviewer**: "The significance of this work is unclear to a general audience."

**Response**: "We have revised the introduction to clarify the broader significance. As now stated in paragraph 1, our findings have implications for [X] because [Y]. We have also added a discussion of how these results inform understanding of [Z] (p. 8, lines 15-28)."

---

## Medical Journals (NEJM, Lancet, JAMA)

### What Reviewers Look For

| Priority | Weight | Description |
|----------|--------|-------------|
| **Clinical relevance** | Critical | Will this change practice? |
| **Methodological rigor** | Critical | CONSORT/STROBE compliance |
| **Patient outcomes** | Critical | Focus on what matters to patients |
| **Statistical validity** | High | Appropriate analysis, power |
| **Generalizability** | High | Applicability to broader populations |

### Review Process

1. **Statistical review**: Dedicated statistical reviewer common
2. **Clinical expertise**: Subspecialty experts
3. **Methodological review**: Focus on study design
4. **Multiple rounds**: Revisions often requested

### What Gets a Paper Rejected

**Major Issues**:
- Underpowered study
- Inappropriate control/comparator
- Confounding not addressed
- Selective outcome reporting
- Missing safety data
- Claims exceed evidence

**Moderate Issues**:
- Unclear generalizability
- Missing subgroup analyses
- Incomplete CONSORT/STROBE reporting
- Statistical methods not described adequately

### Sample Reviewer Concerns and Responses

**Reviewer**: "The study appears underpowered for the primary outcome. With 200 participants and an event rate of 5%, there is insufficient power to detect a clinically meaningful difference."

**Response**: "We appreciate this concern. Our power calculation (Methods, p. 5) was based on a 5% event rate in the control arm and a 50% relative reduction (to 2.5%). While the observed event rate (4.8%) was close to projected, we acknowledge the confidence interval is wide (HR 0.65, 95% CI 0.38-1.12). We have added this as a limitation (Discussion, p. 12). Importantly, the direction and magnitude of effect are consistent with the larger XYZ trial (n=5000), suggesting our findings merit confirmation in a larger study."

---

## Cell Press Journals

### What Reviewers Look For

| Priority | Weight | Description |
|----------|--------|-------------|
| **Mechanistic insight** | Critical | How does this work? |
| **Depth of investigation** | Critical | Multiple approaches, comprehensive |
| **Biological significance** | High | Importance for the field |
| **Technical rigor** | High | Quantification, statistics, replication |
| **Novelty** | Moderate-High | New findings, not just confirmation |

### Review Process

1. **Extended review**: 3+ reviewers typical
2. **Revision cycles**: Multiple rounds common
3. **Comprehensive revision**: Major new experiments often requested
4. **Detailed assessment**: Figure-by-figure evaluation

### What Reviewers Expect

- **Multiple complementary approaches**: Same finding shown different ways
- **In vivo validation**: For cell biology claims
- **Rescue experiments**: For knockdown/knockout studies
- **Quantification**: Not just representative images
- **Complete figure panels**: All conditions, all controls

### Sample Reviewer Concerns and Responses

**Reviewer**: "The authors show that protein X is required for process Y using siRNA knockdown. However, a single RNAi reagent is used, and off-target effects cannot be excluded. Additional evidence is needed."

**Response**: "We agree that additional validation is important. In the revised manuscript, we now show: (1) two independent siRNAs against protein X produce identical phenotypes (new Fig. S3A-B); (2) CRISPR-Cas9 knockout cells recapitulate the phenotype (new Fig. 2D-E); and (3) expression of siRNA-resistant protein X rescues the phenotype (new Fig. 2F-G). These complementary approaches strongly support the conclusion that protein X is required for process Y."

---

## ML Conferences (NeurIPS, ICML, ICLR)

### What Reviewers Look For

| Priority | Weight | Description |
|----------|--------|-------------|
| **Novelty** | Critical | New method, insight, or perspective |
| **Technical soundness** | Critical | Correct implementation, fair comparisons |
| **Significance** | High | Advances the field |
| **Experimental rigor** | High | Strong baselines, proper ablations |
| **Reproducibility** | Moderate-High | Can others replicate? |
| **Clarity** | Moderate | Well-written and organized |

### Review Process

1. **Area Chair assignment**: Grouped by topic
2. **3-4 reviewers**: With expertise in the area
3. **Author rebuttal**: Opportunity to respond
4. **Reviewer discussion**: After rebuttal
5. **AC recommendation**: Meta-review

### Scoring Dimensions

Typical NeurIPS/ICML scoring:

| Dimension | Score Range | What's Evaluated |
|-----------|-------------|------------------|
| **Soundness** | 1-4 | Technical correctness |
| **Contribution** | 1-4 | Significance of results |
| **Presentation** | 1-4 | Clarity and organization |
| **Overall** | 1-10 | Holistic assessment |
| **Confidence** | 1-5 | Reviewer expertise |

### What Gets a Paper Rejected

**Critical Issues**:
- Weak baselines or unfair comparisons
- Missing ablation studies
- Results not significantly better than SOTA
- Technical errors in method or analysis
- Overclaiming without evidence

**Moderate Issues**:
- Limited novelty over prior work
- Narrow evaluation (few datasets/tasks)
- Missing reproducibility details
- Poor presentation
- Limited analysis or insights

### Red Flags for ML Reviewers

❌ "We compare against methods from 2018" (outdated baselines)
❌ "Our method achieves 0.5% improvement" (marginal gain)
❌ "We evaluate on one dataset" (limited generalization)
❌ "Implementation details are in the supplementary" (core info missing)
❌ "We leave ablations for future work" (incomplete evaluation)

### Sample Reviewer Concerns and Responses

**Reviewer**: "The proposed method is only compared against Transformer and Performer. Recent works like FlashAttention and Longformer should be included."

**Response**: "Thank you for this suggestion. We have added comparisons to FlashAttention (Dao et al., 2022), Longformer (Beltagy et al., 2020), and BigBird (Zaheer et al., 2020). As shown in new Table 2, our method outperforms all baselines: FlashAttention (3.2% worse), Longformer (5.1% worse), and BigBird (4.8% worse). We also include a new analysis (Section 4.3) explaining why our approach is particularly effective for sequences > 16K tokens."

---

## HCI Conferences (CHI, CSCW)

### What Reviewers Look For

| Priority | Weight | Description |
|----------|--------|-------------|
| **Contribution to HCI** | Critical | New design, insight, or method |
| **User-centered approach** | High | Focus on human needs |
| **Appropriate evaluation** | High | Matches claims and contribution |
| **Design rationale** | Moderate-High | Justified design decisions |
| **Implications** | Moderate | Guidance for future work |

### Contribution Types

CHI explicitly categorizes contributions:

| Type | What Reviewers Expect |
|------|----------------------|
| **Empirical** | Rigorous user study, clear findings |
| **Artifact** | Novel system/tool, evaluation of use |
| **Methodological** | New research method, validation |
| **Theoretical** | Conceptual framework, intellectual contribution |
| **Survey** | Comprehensive, well-organized coverage |

### What Gets a Paper Rejected

**Critical Issues**:
- Mismatch between claims and evaluation
- Insufficient participants for conclusions
- Missing ethical considerations (no IRB)
- Technology-focused without user insight
- Limited contribution to HCI community

**Moderate Issues**:
- Weak design rationale
- Limited generalizability
- Missing related work in HCI
- Unclear implications for practitioners

### Sample Reviewer Concerns and Responses

**Reviewer**: "The evaluation consists of a short-term lab study with 12 participants. It's unclear how this system would perform in real-world use over time."

**Response**: "We acknowledge this limitation, which we now discuss explicitly (Section 7.2). We have added a 2-week deployment study with 8 participants from our original cohort (new Section 6.3). This longitudinal data shows sustained engagement (mean usage: 4.2 times/day) and reveals additional insights about how use patterns evolve over time. However, we agree that larger and longer deployments would strengthen ecological validity."

---

## NLP Conferences (ACL, EMNLP)

### What Reviewers Look For

| Priority | Weight | Description |
|----------|--------|-------------|
| **Task performance** | High | SOTA or competitive results |
| **Analysis quality** | High | Error analysis, insights |
| **Methodology** | High | Sound approach, fair comparisons |
| **Reproducibility** | High | Full details provided |
| **Novelty** | Moderate-High | New approach or insight |

### ACL Rolling Review (ARR)

Since 2022, ACL venues use a shared review system:
- Reviews transfer between venues
- Action editors manage papers
- Commitment to specific venue after review

### Responsible NLP Checklist

Reviewers check for:
- Limitations section (required)
- Risks and ethical considerations
- Compute/carbon footprint
- Bias analysis (when applicable)
- Data documentation

### Sample Reviewer Concerns and Responses

**Reviewer**: "The paper lacks analysis of failure cases. When and why does the proposed method fail?"

**Response**: "We have added Section 5.4 on error analysis. We manually examined 100 errors and categorized them into three types: (1) complex coreference chains (42%), (2) implicit references (31%), and (3) domain-specific knowledge requirements (27%). Figure 4 shows representative examples of each. This analysis reveals that our method particularly struggles with implicit references, which we discuss as a direction for future work."

---

## Data Mining (KDD, WWW)

### What Reviewers Look For

| Priority | Weight | Description |
|----------|--------|-------------|
| **Scalability** | High | Handles large datasets |
| **Practical impact** | High | Real-world applicability |
| **Experimental rigor** | High | Comprehensive evaluation |
| **Technical novelty** | Moderate-High | New method or application |
| **Reproducibility** | Moderate | Code/data availability |

### What Impresses KDD Reviewers

- Large-scale experiments (millions of samples)
- Industry deployment or A/B tests
- Efficiency comparisons (runtime, memory)
- Real datasets alongside benchmarks
- Complexity analysis (time and space)

### Sample Reviewer Concerns and Responses

**Reviewer**: "The experiments are limited to small datasets (< 100K samples). How does the method scale to industry-scale data?"

**Response**: "We have added experiments on two large-scale datasets: (1) ogbn-papers100M (111M nodes, 1.6B edges) and (2) a proprietary e-commerce graph (500M nodes, 4B edges) provided by [company]. Table 4 (new) shows our method scales near-linearly with data size, completing in 42 minutes on ogbn-papers where baselines run out of memory. Section 5.5 (new) provides detailed scalability analysis."

---

## General Rebuttal Strategies

### Do's

✅ **Address every point**: Even minor issues
✅ **Provide evidence**: New experiments, data, or citations
✅ **Be specific**: Reference exact sections, lines, figures
✅ **Acknowledge valid criticisms**: Show you understand the concern
✅ **Be concise**: Reviewers read many rebuttals
✅ **Stay professional**: Even for unfair reviews
✅ **Prioritize critical issues**: Address major concerns first

### Don'ts

❌ **Be defensive**: Accept valid criticisms
❌ **Argue without evidence**: Back up claims
❌ **Ignore points**: Even ones you disagree with
❌ **Be vague**: Be specific about changes
❌ **Attack reviewers**: Maintain professionalism
❌ **Promise future work**: Do the work now if possible

### Rebuttal Template

```
We thank the reviewers for their constructive feedback. We address 
the main concerns below:

**R1/R2 Concern: [Shared concern from multiple reviewers]**

[Your response with specific actions taken and references to where 
changes are made in the revised manuscript]

**R1-1: [Specific point]**

[Response with evidence]

**R2-3: [Specific point]**

[Response with evidence]

We have also made the following additional improvements:
• [Improvement 1]
• [Improvement 2]
```

---

## Pre-Submission Self-Review

Before submitting, review your paper as a reviewer would:

### All Venues
- [ ] Are claims supported by evidence?
- [ ] Are baselines appropriate and recent?
- [ ] Is the contribution clearly stated?
- [ ] Are limitations acknowledged?
- [ ] Is reproducibility information complete?

### High-Impact Journals
- [ ] Is significance clear to a non-specialist?
- [ ] Are figures accessible and clear?
- [ ] Are controls adequate for claims?

### Medical Journals
- [ ] Is CONSORT/STROBE compliance complete?
- [ ] Are absolute numbers reported?
- [ ] Is clinical relevance clear?

### ML Conferences
- [ ] Are ablations comprehensive?
- [ ] Are comparisons fair?
- [ ] Is reproducibility information complete?

### HCI Conferences
- [ ] Is the user-centered perspective clear?
- [ ] Is the evaluation appropriate for claims?
- [ ] Are design implications actionable?

---

## See Also

- `venue_writing_styles.md` - Writing style by venue
- `nature_science_style.md` - Nature/Science detailed guide
- `ml_conference_style.md` - ML conference detailed guide
- `medical_journal_styles.md` - Medical journal detailed guide

