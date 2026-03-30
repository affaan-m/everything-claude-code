# CS Conference Writing Style Guide

Comprehensive writing guide for ACL, EMNLP, NAACL (NLP), CHI, CSCW (HCI), SIGKDD, WWW, SIGIR (data mining/IR), and other major CS conferences.

**Last Updated**: 2024

---

## Overview

CS conferences span diverse subfields with distinct writing cultures. This guide covers NLP, HCI, and data mining/IR venues, each with unique expectations and evaluation criteria.

---

# Part 1: NLP Conferences (ACL, EMNLP, NAACL)

## NLP Writing Philosophy

> "Strong empirical results on standard benchmarks with insightful analysis."

NLP papers balance empirical rigor with linguistic insight. Human evaluation is increasingly important alongside automatic metrics.

## Audience and Tone

### Target Reader
- NLP researchers and computational linguists
- Familiar with transformer architectures, standard benchmarks
- Expect reproducible results and error analysis

### Tone Characteristics
| Characteristic | Description |
|---------------|-------------|
| **Task-focused** | Clear problem definition |
| **Benchmark-oriented** | Standard datasets emphasized |
| **Analysis-rich** | Error analysis, qualitative examples |
| **Reproducible** | Full implementation details |

## Abstract (NLP Style)

### Structure
- **Task/problem** (1 sentence)
- **Limitation of prior work** (1 sentence)
- **Your approach** (1-2 sentences)
- **Results on benchmarks** (2 sentences)
- **Analysis finding** (optional, 1 sentence)

### Example Abstract

```
Coreference resolution remains challenging for pronouns with distant or 
ambiguous antecedents. Prior neural approaches struggle with these 
difficult cases due to limited context modeling. We introduce 
LongContext-Coref, a retrieval-augmented coreference model that 
dynamically retrieves relevant context from document history. On the 
OntoNotes 5.0 benchmark, LongContext-Coref achieves 83.4 F1, improving 
over the previous state-of-the-art by 1.2 points. On the challenging 
WinoBias dataset, we reduce gender bias by 34% while maintaining 
accuracy. Qualitative analysis reveals that our model successfully 
resolves pronouns requiring world knowledge, a known weakness of 
prior approaches.
```

## NLP Paper Structure

```
├── Introduction
│   ├── Task motivation
│   ├── Prior work limitations
│   ├── Your contribution
│   └── Contribution bullets
├── Related Work
├── Method
│   ├── Problem formulation
│   ├── Model architecture
│   └── Training procedure
├── Experiments
│   ├── Datasets (with statistics)
│   ├── Baselines
│   ├── Main results
│   ├── Analysis
│   │   ├── Error analysis
│   │   ├── Ablation study
│   │   └── Qualitative examples
│   └── Human evaluation (if applicable)
├── Discussion / Limitations
└── Conclusion
```

## NLP-Specific Requirements

### Datasets
- Use **standard benchmarks**: GLUE, SQuAD, CoNLL, OntoNotes
- Report **dataset statistics**: train/dev/test sizes
- **Data preprocessing**: Document all steps

### Evaluation Metrics
- **Task-appropriate metrics**: F1, BLEU, ROUGE, accuracy
- **Statistical significance**: Paired bootstrap, p-values
- **Multiple runs**: Report mean ± std across seeds

### Human Evaluation
Increasingly expected for generation tasks:
- **Annotator details**: Number, qualifications, agreement
- **Evaluation protocol**: Guidelines, interface, payment
- **Inter-annotator agreement**: Cohen's κ or Krippendorff's α

### Example Human Evaluation Table

```
Table 3: Human Evaluation Results (100 samples, 3 annotators)
─────────────────────────────────────────────────────────────
Method        | Fluency | Coherence | Factuality | Overall
─────────────────────────────────────────────────────────────
Baseline      |   3.8   |    3.2    |    3.5     |   3.5
GPT-3.5       |   4.2   |    4.0    |    3.7     |   4.0
Our Method    |   4.4   |    4.3    |    4.1     |   4.3
─────────────────────────────────────────────────────────────
Inter-annotator κ = 0.72. Scale: 1-5 (higher is better).
```

## ACL-Specific Notes

- **ARR (ACL Rolling Review)**: Shared review system across ACL venues
- **Responsible NLP checklist**: Ethics, limitations, risks
- **Long (8 pages) vs. Short (4 pages)**: Different expectations
- **Findings papers**: Lower-tier acceptance track

---

# Part 2: HCI Conferences (CHI, CSCW, UIST)

## HCI Writing Philosophy

> "Technology in service of humans—understand users first, then design and evaluate."

HCI papers are fundamentally **user-centered**. Technology novelty alone is insufficient; understanding human needs and demonstrating user benefit is essential.

## Audience and Tone

### Target Reader
- HCI researchers and practitioners
- UX designers and product developers
- Interdisciplinary (CS, psychology, design, social science)

### Tone Characteristics
| Characteristic | Description |
|---------------|-------------|
| **User-centered** | Focus on people, not technology |
| **Design-informed** | Grounded in design thinking |
| **Empirical** | User studies provide evidence |
| **Reflective** | Consider broader implications |

## HCI Abstract

### Focus on Users and Impact

```
Video calling has become essential for remote collaboration, yet 
current interfaces poorly support the peripheral awareness that makes 
in-person work effective. Through formative interviews with 24 remote 
workers, we identified three key challenges: difficulty gauging 
colleague availability, lack of ambient presence cues, and interruption 
anxiety. We designed AmbientOffice, a peripheral display system that 
conveys teammate presence through subtle ambient visualizations. In a 
two-week deployment study with 18 participants across three distributed 
teams, AmbientOffice increased spontaneous collaboration by 40% and 
reduced perceived isolation (p<0.01). Participants valued the system's 
non-intrusive nature and reported feeling more connected to remote 
colleagues. We discuss implications for designing ambient awareness 
systems and the tension between visibility and privacy in remote work.
```

## HCI Paper Structure

### Research Through Design / Systems Papers

```
├── Introduction
│   ├── Problem in human terms
│   ├── Why technology can help
│   └── Contribution summary
├── Related Work
│   ├── Domain background
│   ├── Prior systems
│   └── Theoretical frameworks
├── Formative Work (often)
│   ├── Interviews / observations
│   └── Design requirements
├── System Design
│   ├── Design rationale
│   ├── Implementation
│   └── Interface walkthrough
├── Evaluation
│   ├── Study design
│   ├── Participants
│   ├── Procedure
│   ├── Findings (quant + qual)
│   └── Limitations
├── Discussion
│   ├── Design implications
│   ├── Generalizability
│   └── Future work
└── Conclusion
```

### Qualitative / Interview Studies

```
├── Introduction
├── Related Work
├── Methods
│   ├── Participants
│   ├── Procedure
│   ├── Data collection
│   └── Analysis method (thematic, grounded theory, etc.)
├── Findings
│   ├── Theme 1 (with quotes)
│   ├── Theme 2 (with quotes)
│   └── Theme 3 (with quotes)
├── Discussion
│   ├── Implications for design
│   ├── Implications for research
│   └── Limitations
└── Conclusion
```

## HCI-Specific Requirements

### Participant Reporting
- **Demographics**: Age, gender, relevant experience
- **Recruitment**: How and where recruited
- **Compensation**: Payment amount and type
- **IRB approval**: Ethics board statement

### Quotes in Findings
Use direct quotes to ground findings:
```
Participants valued the ambient nature of the display. As P7 described: 
"It's like having a window to my teammate's office. I don't need to 
actively check it, but I know they're there." This passive awareness 
reduced the barrier to initiating contact.
```

### Design Implications Section
Translate findings into actionable guidance:
```
**Implication 1: Support peripheral awareness without demanding attention.**
Ambient displays should be visible in peripheral vision but not require 
active monitoring. Designers should consider calm technology principles.

**Implication 2: Balance visibility with privacy.**
Users want to share presence but fear surveillance. Systems should 
provide granular controls and make visibility mutual.
```

## CHI-Specific Notes

- **Contribution types**: Empirical, artifact, methodological, theoretical
- **ACM format**: `acmart` document class with `sigchi` option
- **Accessibility**: Alt text, inclusive language expected
- **Contribution statement**: Required per-author contributions

---

# Part 3: Data Mining & IR (SIGKDD, WWW, SIGIR)

## Data Mining Writing Philosophy

> "Scalable methods for real-world data with demonstrated practical impact."

Data mining papers emphasize **scalability**, **real-world applicability**, and **solid experimental methodology**.

## Audience and Tone

### Target Reader
- Data scientists and ML engineers
- Industry researchers
- Applied ML practitioners

### Tone Characteristics
| Characteristic | Description |
|---------------|-------------|
| **Scalable** | Handle large datasets |
| **Practical** | Real-world applications |
| **Reproducible** | Datasets and code shared |
| **Industrial** | Industry datasets valued |

## KDD Abstract

### Emphasize Scale and Application

```
Fraud detection in e-commerce requires processing millions of 
transactions in real-time while adapting to evolving attack patterns. 
We present FraudShield, a graph neural network framework for real-time 
fraud detection that scales to billion-edge transaction graphs. Unlike 
prior methods that require full graph access, FraudShield uses 
incremental updates with O(1) inference cost per transaction. On a 
proprietary dataset of 2.3 billion transactions from a major e-commerce 
platform, FraudShield achieves 94.2% precision at 80% recall, 
outperforming production baselines by 12%. The system has been deployed 
at [Company], processing 50K transactions per second and preventing 
an estimated $400M in annual fraud losses. We release an anonymized 
benchmark dataset and code.
```

## KDD Paper Structure

```
├── Introduction
│   ├── Problem and impact
│   ├── Technical challenges
│   ├── Your approach
│   └── Contributions
├── Related Work
├── Preliminaries
│   ├── Problem definition
│   └── Notation
├── Method
│   ├── Overview
│   ├── Technical components
│   └── Complexity analysis
├── Experiments
│   ├── Datasets (with scale statistics)
│   ├── Baselines
│   ├── Main results
│   ├── Scalability experiments
│   ├── Ablation study
│   └── Case study / deployment
└── Conclusion
```

## KDD-Specific Requirements

### Scalability
- **Dataset sizes**: Report number of nodes, edges, samples
- **Runtime analysis**: Wall-clock time comparisons
- **Complexity**: Time and space complexity stated
- **Scaling experiments**: Show performance vs. data size

### Industrial Deployment
- **Case studies**: Real-world deployment stories
- **A/B tests**: Online evaluation results (if applicable)
- **Production metrics**: Business impact (if shareable)

### Example Scalability Table

```
Table 4: Scalability Comparison (runtime in seconds)
──────────────────────────────────────────────────────
Dataset     | Nodes  | Edges  | GCN   | GraphSAGE | Ours
──────────────────────────────────────────────────────
Cora        |  2.7K  |  5.4K  |  0.3  |    0.2    |  0.1
Citeseer    |  3.3K  |  4.7K  |  0.4  |    0.3    |  0.1
PubMed      | 19.7K  | 44.3K  |  1.2  |    0.8    |  0.3
ogbn-arxiv  | 169K   | 1.17M  |  8.4  |    4.2    |  1.6
ogbn-papers | 111M   | 1.6B   |  OOM  |   OOM     | 42.3
──────────────────────────────────────────────────────
```

---

# Part 4: Common Elements Across CS Venues

## Writing Quality

### Clarity
- **One idea per sentence**
- **Define terms before use**
- **Use consistent notation**

### Precision
- **Exact numbers**: "23.4%" not "about 20%"
- **Clear claims**: Avoid hedging unless necessary
- **Specific comparisons**: Name the baseline

## Contribution Bullets

Used across all CS venues:
```
Our contributions are:
• We identify [problem/insight]
• We propose [method name] that [key innovation]
• We demonstrate [results] on [benchmarks]
• We release [code/data] at [URL]
```

## Reproducibility Standards

All CS venues increasingly expect:
- **Code availability**: GitHub link (anonymous for review)
- **Data availability**: Public datasets or release plans
- **Full hyperparameters**: Training details complete
- **Random seeds**: Exact values for reproduction

## Ethics and Broader Impact

### NLP (ACL/EMNLP)
- **Limitations section**: Required
- **Responsible NLP checklist**: Ethical considerations
- **Bias analysis**: For models affecting people

### HCI (CHI)
- **IRB/Ethics approval**: Required for human subjects
- **Informed consent**: Procedure described
- **Privacy considerations**: Data handling

### KDD/WWW
- **Societal impact**: Consider misuse potential
- **Privacy preservation**: For sensitive data
- **Fairness analysis**: When applicable

---

## Venue Comparison Table

| Aspect | ACL/EMNLP | CHI | KDD/WWW | SIGIR |
|--------|-----------|-----|---------|-------|
| **Focus** | NLP tasks | User studies | Scalable ML | IR/search |
| **Evaluation** | Benchmarks + human | User studies | Large-scale exp | Datasets |
| **Theory weight** | Moderate | Low | Moderate | Moderate |
| **Industry value** | High | Medium | Very high | High |
| **Page limit** | 8 long / 4 short | 10 + refs | 9 + refs | 10 + refs |
| **Review style** | ARR | Direct | Direct | Direct |

---

## Pre-Submission Checklist

### All CS Venues
- [ ] Clear contribution statement
- [ ] Strong baselines
- [ ] Reproducibility information complete
- [ ] Correct venue template
- [ ] Anonymized (if double-blind)

### NLP-Specific
- [ ] Standard benchmark results
- [ ] Error analysis included
- [ ] Human evaluation (for generation)
- [ ] Responsible NLP checklist

### HCI-Specific
- [ ] IRB approval stated
- [ ] Participant demographics
- [ ] Direct quotes in findings
- [ ] Design implications

### Data Mining-Specific
- [ ] Scalability experiments
- [ ] Dataset size statistics
- [ ] Runtime comparisons
- [ ] Complexity analysis

---

## See Also

- `venue_writing_styles.md` - Master style overview
- `ml_conference_style.md` - NeurIPS/ICML style guide
- `conferences_formatting.md` - Technical formatting requirements
- `reviewer_expectations.md` - What CS reviewers seek

