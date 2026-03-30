# ML Conference Writing Style Guide

Comprehensive writing guide for NeurIPS, ICML, ICLR, CVPR, ECCV, ICCV, and other major machine learning and computer vision conferences.

**Last Updated**: 2024

---

## Overview

ML conferences prioritize **novelty**, **rigorous empirical evaluation**, and **reproducibility**. Papers are evaluated on clear contribution, strong baselines, comprehensive ablations, and honest discussion of limitations.

### Key Philosophy

> "Show don't tell—your experiments should demonstrate your claims, not just your prose."

**Primary Goal**: Advance the state of the art with novel methods validated through rigorous experimentation.

---

## Audience and Tone

### Target Reader

- ML researchers and practitioners
- Experts in the specific subfield
- Familiar with recent literature
- Expect technical depth and precision

### Tone Characteristics

| Characteristic | Description |
|---------------|-------------|
| **Technical** | Dense with methodology details |
| **Precise** | Exact terminology, no ambiguity |
| **Empirical** | Claims backed by experiments |
| **Direct** | State contributions clearly |
| **Honest** | Acknowledge limitations |

### Voice

- **First person plural ("we")**: "We propose..." "Our method..."
- **Active voice**: "We introduce a novel architecture..."
- **Confident but measured**: Strong claims require strong evidence

---

## Abstract

### Style Requirements

- **Dense and numbers-focused**
- **150-250 words** (varies by venue)
- **Key results upfront**: Include specific metrics
- **Flowing paragraph** (not structured)

### Abstract Structure

1. **Problem** (1 sentence): What problem are you solving?
2. **Limitation of existing work** (1 sentence): Why current methods fall short
3. **Your approach** (1-2 sentences): What's your method?
4. **Key results** (2-3 sentences): Specific numbers on benchmarks
5. **Significance** (optional, 1 sentence): Why this matters

### Example Abstract (NeurIPS Style)

```
Transformers have achieved remarkable success in sequence modeling but 
suffer from quadratic computational complexity, limiting their application 
to long sequences. We introduce FlashAttention-2, an IO-aware exact 
attention algorithm that achieves 2x speedup over FlashAttention and up 
to 9x speedup over standard attention on sequences up to 16K tokens. Our 
key insight is to reduce memory reads/writes by tiling and recomputation, 
achieving optimal IO complexity. On the Long Range Arena benchmark, 
FlashAttention-2 enables training with 8x longer sequences while matching 
standard attention accuracy. Combined with sequence parallelism, we train 
GPT-style models on sequences of 64K tokens at near-linear cost. We 
release optimized CUDA kernels achieving 80% of theoretical peak FLOPS 
on A100 GPUs. Code is available at [anonymous URL].
```

### Abstract Don'ts

❌ "We propose a novel method for X" (vague, no results)
❌ "Our method outperforms baselines" (no specific numbers)
❌ "This is an important problem" (self-evident claims)

✅ Include specific metrics: "achieves 94.5% accuracy, 3.2% improvement"
✅ Include scale: "on 1M samples" or "16K token sequences"
✅ Include comparison: "2x faster than previous SOTA"

---

## Introduction

### Structure (2-3 pages)

ML introductions have a distinctive structure with **numbered contributions**.

### Paragraph-by-Paragraph Guide

**Paragraph 1: Problem Motivation**
- Why is this problem important?
- What are the applications?
- Set up the technical challenge

```
"Large language models have demonstrated remarkable capabilities in 
natural language understanding and generation. However, their quadratic 
attention complexity presents a fundamental bottleneck for processing 
long documents, multi-turn conversations, and reasoning over extended 
contexts. As models scale to billions of parameters and context lengths 
extend to tens of thousands of tokens, efficient attention mechanisms 
become critical for practical deployment."
```

**Paragraph 2: Limitations of Existing Approaches**
- What methods exist?
- Why are they insufficient?
- Technical analysis of limitations

```
"Prior work has addressed this through sparse attention patterns, 
linear attention approximations, and low-rank factorizations. While 
these methods reduce theoretical complexity, they often sacrifice 
accuracy, require specialized hardware, or introduce approximation 
errors that compound in deep networks. Exact attention remains 
preferable when computational resources permit."
```

**Paragraph 3: Your Approach (High-Level)**
- What's your key insight?
- How does your method work conceptually?
- Why should it succeed?

```
"We observe that the primary bottleneck in attention is not computation 
but rather memory bandwidth—reading and writing the large N×N attention 
matrix dominates runtime on modern GPUs. We propose FlashAttention-2, 
which eliminates this bottleneck through a novel tiling strategy that 
computes attention block-by-block without materializing the full matrix."
```

**Paragraph 4: Contribution List (CRITICAL)**

This is **mandatory and distinctive** for ML conferences:

```
Our contributions are as follows:

• We propose FlashAttention-2, an IO-aware exact attention algorithm 
  that achieves optimal memory complexity O(N²d/M) where M is GPU 
  SRAM size.

• We provide theoretical analysis showing that our algorithm achieves 
  2-4x fewer HBM accesses than FlashAttention on typical GPU 
  configurations.

• We demonstrate 2x speedup over FlashAttention and up to 9x over 
  standard PyTorch attention across sequence lengths from 256 to 64K 
  tokens.

• We show that FlashAttention-2 enables training with 8x longer 
  contexts on the same hardware, unlocking new capabilities for 
  long-range modeling.

• We release optimized CUDA kernels and PyTorch bindings at 
  [anonymous URL].
```

### Contribution Bullet Guidelines

| Good Contribution Bullets | Bad Contribution Bullets |
|--------------------------|-------------------------|
| Specific, quantifiable | Vague claims |
| Self-contained | Requires reading paper to understand |
| Distinct from each other | Overlapping bullets |
| Emphasize novelty | State obvious facts |

### Related Work Placement

- **In introduction**: Brief positioning (1-2 paragraphs)
- **Separate section**: Detailed comparison (at end or before conclusion)
- **Appendix**: Extended discussion if space-limited

---

## Method

### Structure (2-3 pages)

```
METHOD
├── Problem Formulation
├── Method Overview / Architecture
├── Key Technical Components
│   ├── Component 1 (with equations)
│   ├── Component 2 (with equations)
│   └── Component 3 (with equations)
├── Theoretical Analysis (if applicable)
└── Implementation Details
```

### Mathematical Notation

- **Define all notation**: "Let X ∈ ℝ^{N×d} denote the input sequence..."
- **Consistent symbols**: Same symbol means same thing throughout
- **Number important equations**: Reference by number later

### Algorithm Pseudocode

Include clear pseudocode for reproducibility:

```
Algorithm 1: FlashAttention-2 Forward Pass
─────────────────────────────────────────
Input: Q, K, V ∈ ℝ^{N×d}, block size B_r, B_c
Output: O ∈ ℝ^{N×d}

1:  Divide Q into T_r = ⌈N/B_r⌉ blocks
2:  Divide K, V into T_c = ⌈N/B_c⌉ blocks
3:  Initialize O = 0, ℓ = 0, m = -∞
4:  for i = 1 to T_r do
5:    Load Q_i from HBM to SRAM
6:    for j = 1 to T_c do
7:      Load K_j, V_j from HBM to SRAM
8:      Compute S_ij = Q_i K_j^T
9:      Update running max and sum
10:     Update O_i incrementally
11:   end for
12:   Write O_i to HBM
13: end for
14: return O
```

### Architecture Diagrams

- **Clear, publication-quality figures**
- **Label all components**
- **Show data flow with arrows**
- **Use consistent visual language**

---

## Experiments

### Structure (2-3 pages)

```
EXPERIMENTS
├── Experimental Setup
│   ├── Datasets and Benchmarks
│   ├── Baselines
│   ├── Implementation Details
│   └── Evaluation Metrics
├── Main Results
│   └── Table/Figure with primary comparisons
├── Ablation Studies
│   └── Component-wise analysis
├── Analysis
│   ├── Scaling behavior
│   ├── Qualitative examples
│   └── Error analysis
└── Computational Efficiency
```

### Datasets and Benchmarks

- **Use standard benchmarks**: Establish comparability
- **Report dataset statistics**: Size, splits, preprocessing
- **Justify non-standard choices**: If using custom data, explain why

### Baselines

**Critical for acceptance.** Include:
- **Recent SOTA**: Not just old methods
- **Fair comparisons**: Same compute budget, hyperparameter tuning
- **Ablated versions**: Your method without key components
- **Strong baselines**: Don't cherry-pick weak competitors

### Main Results Table

Clear, comprehensive formatting:

```
Table 1: Results on Long Range Arena Benchmark (accuracy %)
──────────────────────────────────────────────────────────
Method          | ListOps | Text  | Retrieval | Image | Path  | Avg
──────────────────────────────────────────────────────────
Transformer     |  36.4   | 64.3  |   57.5    | 42.4  | 71.4  | 54.4
Performer       |  18.0   | 65.4  |   53.8    | 42.8  | 77.1  | 51.4
Linear Attn     |  16.1   | 65.9  |   53.1    | 42.3  | 75.3  | 50.5
FlashAttention  |  37.1   | 64.5  |   57.8    | 42.7  | 71.2  | 54.7
FlashAttn-2     |  37.4   | 64.7  |   58.2    | 42.9  | 71.8  | 55.0
──────────────────────────────────────────────────────────
```

### Ablation Studies (MANDATORY)

Show what matters in your method:

```
Table 2: Ablation Study on FlashAttention-2 Components
──────────────────────────────────────────────────────
Variant                              | Speedup | Memory
──────────────────────────────────────────────────────
Full FlashAttention-2                |   2.0x  |  1.0x
  - without sequence parallelism     |   1.7x  |  1.0x
  - without recomputation            |   1.3x  |  2.4x
  - without block tiling             |   1.0x  |  4.0x
FlashAttention-1 (baseline)          |   1.0x  |  1.0x
──────────────────────────────────────────────────────
```

### What Ablations Should Show

- **Each component matters**: Removing it hurts performance
- **Design choices justified**: Why this architecture/hyperparameter?
- **Failure modes**: When does method not work?
- **Sensitivity analysis**: Robustness to hyperparameters

---

## Related Work

### Placement Options

1. **After Introduction**: Common in CV papers
2. **Before Conclusion**: Common in NeurIPS/ICML
3. **Appendix**: When space is tight

### Writing Style

- **Organized by theme**: Not chronological
- **Position your work**: How you differ from each line of work
- **Fair characterization**: Don't misrepresent prior work
- **Recent citations**: Include 2023-2024 papers

### Example Structure

```
**Efficient Attention Mechanisms.** Prior work on efficient attention 
falls into three categories: sparse patterns (Beltagy et al., 2020; 
Zaheer et al., 2020), linear approximations (Katharopoulos et al., 2020; 
Choromanski et al., 2021), and low-rank factorizations (Wang et al., 
2020). Our work differs in that we focus on IO-efficient exact 
attention rather than approximations.

**Memory-Efficient Training.** Gradient checkpointing (Chen et al., 2016) 
and activation recomputation (Korthikanti et al., 2022) reduce memory 
by trading compute. We adopt similar ideas but apply them within the 
attention operator itself.
```

---

## Limitations Section

### Why It Matters

**Increasingly required** at NeurIPS, ICML, ICLR. Honest limitations:
- Show scientific maturity
- Guide future work
- Prevent overselling

### What to Include

1. **Method limitations**: When does it fail?
2. **Experimental limitations**: What wasn't tested?
3. **Scope limitations**: What's out of scope?
4. **Computational limitations**: Resource requirements

### Example Limitations Section

```
**Limitations.** While FlashAttention-2 provides substantial speedups, 
several limitations remain. First, our implementation is optimized for 
NVIDIA GPUs and does not support AMD or other hardware. Second, the 
speedup is most pronounced for medium to long sequences; for very short 
sequences (<256 tokens), the overhead of our kernel launch dominates. 
Third, we focus on dense attention; extending our approach to sparse 
attention patterns remains future work. Finally, our theoretical 
analysis assumes specific GPU memory hierarchy parameters that may not 
hold for future hardware generations.
```

---

## Reproducibility

### Reproducibility Checklist (NeurIPS/ICML)

Most ML conferences require a reproducibility checklist covering:

- [ ] Code availability
- [ ] Dataset availability
- [ ] Hyperparameters specified
- [ ] Random seeds reported
- [ ] Compute requirements stated
- [ ] Number of runs and variance reported
- [ ] Statistical significance tests

### What to Report

**Hyperparameters**:
```
"We train with Adam (β₁=0.9, β₂=0.999, ε=1e-8) and learning rate 3e-4 
with linear warmup over 1000 steps and cosine decay. Batch size is 256 
across 8 A100 GPUs. We train for 100K steps (approximately 24 hours)."
```

**Random Seeds**:
```
"All experiments are averaged over 3 random seeds (0, 1, 2) with 
standard deviation reported in parentheses."
```

**Compute**:
```
"Experiments were conducted on 8 NVIDIA A100-80GB GPUs. Total training 
time was approximately 500 GPU-hours."
```

---

## Figures

### Figure Quality

- **Vector graphics preferred**: PDF, SVG
- **High resolution for rasters**: 300+ dpi
- **Readable at publication size**: Test at actual column width
- **Colorblind-accessible**: Use patterns in addition to color

### Common Figure Types

1. **Architecture diagram**: Show your method visually
2. **Performance plots**: Learning curves, scaling behavior
3. **Comparison tables**: Main results
4. **Ablation figures**: Component contributions
5. **Qualitative examples**: Input/output samples

### Figure Captions

Self-contained captions that explain:
- What is shown
- How to read the figure
- Key takeaway

---

## References

### Citation Style

- **Numbered [1]** or **author-year (Smith et al., 2023)**
- Check venue-specific requirements
- Be consistent throughout

### Reference Guidelines

- **Cite recent work**: 2022-2024 papers expected
- **Don't over-cite yourself**: Raises bias concerns
- **Cite arxiv appropriately**: Use published version when available
- **Include all relevant prior work**: Missing citations hurt review

---

## Venue-Specific Notes

### NeurIPS

- **8 pages** main + unlimited appendix/references
- **Broader Impact** section sometimes required
- **Reproducibility checklist** mandatory
- OpenReview submission, public reviews

### ICML

- **8 pages** main + unlimited appendix/references
- Strong emphasis on **theory + experiments**
- Reproducibility statement encouraged

### ICLR

- **8 pages** main (camera-ready can exceed)
- OpenReview with **public reviews and discussion**
- Author response period is interactive
- Strong emphasis on **novelty and insight**

### CVPR/ICCV/ECCV

- **8 pages** main including references
- **Supplementary video** encouraged
- Heavy emphasis on **visual results**
- Benchmark performance critical

---

## Common Mistakes

1. **Weak baselines**: Not comparing to recent SOTA
2. **Missing ablations**: Not showing component contributions
3. **Overclaiming**: "We solve X" when you partially address X
4. **Vague contributions**: "We propose a novel method"
5. **Poor reproducibility**: Missing hyperparameters, seeds
6. **Wrong template**: Using last year's style file
7. **Anonymous violations**: Revealing identity in blind review
8. **Missing limitations**: Not acknowledging failure modes

---

## Rebuttal Tips

ML conferences have author response periods. Tips:
- **Address key concerns first**: Prioritize critical issues
- **Run requested experiments**: When feasible in time
- **Be concise**: Reviewers read many rebuttals
- **Stay professional**: Even with unfair reviews
- **Reference specific lines**: "As stated in L127..."

---

## Pre-Submission Checklist

### Content
- [ ] Clear problem motivation
- [ ] Explicit contribution list
- [ ] Complete method description
- [ ] Comprehensive experiments
- [ ] Strong baselines included
- [ ] Ablation studies present
- [ ] Limitations acknowledged

### Technical
- [ ] Correct venue style file (current year)
- [ ] Anonymized (no author names, no identifiable URLs)
- [ ] Page limit respected
- [ ] References complete
- [ ] Supplementary organized

### Reproducibility
- [ ] Hyperparameters listed
- [ ] Random seeds specified
- [ ] Compute requirements stated
- [ ] Code/data availability noted
- [ ] Reproducibility checklist completed

---

## See Also

- `venue_writing_styles.md` - Master style overview
- `conferences_formatting.md` - Technical formatting requirements
- `reviewer_expectations.md` - What ML reviewers seek

