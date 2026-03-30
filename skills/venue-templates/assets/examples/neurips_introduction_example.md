# NeurIPS/ICML Introduction Example

This example demonstrates the distinctive ML conference introduction structure with numbered contributions and technical precision.

---

## Full Introduction Example

**Paper Topic**: Efficient Long-Context Transformers

---

### Paragraph 1: Problem Motivation

```
Large language models (LLMs) have demonstrated remarkable capabilities in 
natural language understanding, code generation, and reasoning tasks [1, 2, 3]. 
These capabilities scale with both model size and context length—longer 
contexts enable processing of entire documents, multi-turn conversations, 
and complex reasoning chains that span many steps [4, 5]. However, the 
standard Transformer attention mechanism [6] has O(N²) time and memory 
complexity with respect to sequence length N, creating a fundamental 
bottleneck for processing long sequences. For a context window of 100K 
tokens, computing full attention requires 10 billion scalar operations 
and 40 GB of memory for the attention matrix alone, making training and 
inference prohibitively expensive on current hardware.
```

**Key features**:
- States why this matters (LLM capabilities)
- Connects to scaling (longer contexts = better performance)
- Specific numbers (O(N²), 100K tokens, 10 billion ops, 40 GB)
- Citations to establish credibility

---

### Paragraph 2: Limitations of Existing Approaches

```
Prior work has addressed attention efficiency through three main approaches. 
Sparse attention patterns [7, 8, 9] reduce complexity to O(N√N) or O(N log N) 
by restricting attention to local windows, fixed stride patterns, or learned 
sparse masks. Linear attention approximations [10, 11, 12] reformulate 
attention using kernel feature maps that enable O(N) computation, but 
sacrifice the ability to model arbitrary pairwise interactions. Low-rank 
factorizations [13, 14] approximate the attention matrix as a product of 
smaller matrices, achieving efficiency at the cost of expressivity. While 
these methods reduce theoretical complexity, they introduce approximation 
errors that compound in deep networks, often resulting in 2-5% accuracy 
degradation on long-range modeling benchmarks [15]. Perhaps more importantly, 
they fundamentally change the attention mechanism, making it difficult to 
apply advances in standard attention (e.g., rotary positional embeddings, 
grouped-query attention) to efficient variants.
```

**Key features**:
- Organized categorization of prior work
- Complexity stated for each approach
- Limitations clearly identified
- Quantified shortcomings (2-5% degradation)
- Deeper issue identified (incompatibility with advances)

---

### Paragraph 3: Your Approach (High-Level)

```
We take a different approach: rather than approximating attention, we 
accelerate exact attention by optimizing memory access patterns. Our key 
observation is that on modern GPUs, attention is bottlenecked by memory 
bandwidth, not compute. Reading and writing the N × N attention matrix to 
and from GPU high-bandwidth memory (HBM) dominates runtime, while the GPU's 
tensor cores remain underutilized. We propose LongFlash, an IO-aware exact 
attention algorithm that computes attention block-by-block in fast on-chip 
SRAM, never materializing the full attention matrix in HBM. By carefully 
orchestrating the tiling pattern and fusing the softmax computation with 
matrix multiplications, LongFlash reduces HBM accesses from O(N²) to 
O(N²d/M) where d is the head dimension and M is the SRAM size, achieving 
asymptotically optimal IO complexity.
```

**Key features**:
- Clear differentiation from prior work ("different approach")
- Key insight stated explicitly
- Technical mechanism explained
- Complexity improvement quantified
- Method name introduced

---

### Paragraph 4: Contributions (CRITICAL)

```
Our contributions are as follows:

• We propose LongFlash, an IO-aware exact attention algorithm that achieves 
  2-4× speedup over FlashAttention [16] and up to 9× over standard PyTorch 
  attention on sequences from 1K to 128K tokens (Section 3).

• We provide theoretical analysis proving that LongFlash achieves optimal 
  IO complexity of O(N²d/M) among all algorithms that compute exact 
  attention, and analyze the regime where our algorithm provides maximum 
  benefit (Section 3.3).

• We introduce sequence parallelism techniques that enable LongFlash to 
  scale to sequences of 1M+ tokens across multiple GPUs with near-linear 
  weak scaling efficiency (Section 4).

• We demonstrate that LongFlash enables training with 8× longer contexts 
  on the same hardware: we train a 7B parameter model on 128K token 
  contexts using the same memory that previously limited us to 16K tokens 
  (Section 5).

• We release optimized CUDA kernels achieving 80% of theoretical peak 
  FLOPS on A100 and H100 GPUs, along with PyTorch and JAX bindings, at 
  [anonymous URL] (Section 6).
```

**Key features**:
- Numbered/bulleted format
- Each contribution is specific and quantified
- Section references for each claim
- Both methodological and empirical contributions
- Code release mentioned
- Self-contained bullets (each makes sense alone)

---

## Alternative Opening Paragraphs

### For a Methods Paper

```
Scalable optimization algorithms are fundamental to modern machine learning. 
Stochastic gradient descent (SGD) and its variants [1, 2, 3] have enabled 
training of models with billions of parameters on massive datasets. However, 
these first-order methods exhibit slow convergence on ill-conditioned 
problems, often requiring thousands of iterations to converge on tasks 
where second-order methods would converge in tens of iterations [4, 5].
```

### For an Applications Paper

```
Drug discovery is a costly and time-consuming process, with the average new 
drug requiring 10-15 years and $2.6 billion to develop [1]. Machine learning 
offers the potential to accelerate this process by predicting molecular 
properties, identifying promising candidates, and optimizing lead compounds 
computationally [2, 3]. Recent successes in protein structure prediction [4] 
and molecular generation [5] have demonstrated that deep learning can 
capture complex chemical patterns, raising hopes for ML-driven drug discovery.
```

### For a Theory Paper

```
Understanding why deep neural networks generalize well despite having more 
parameters than training examples remains one of the central puzzles of 
modern machine learning [1, 2]. Classical statistical learning theory 
predicts that such overparameterized models should overfit dramatically, 
yet in practice, large networks trained with SGD achieve excellent test 
accuracy [3]. This gap between theory and practice has motivated a rich 
literature on implicit regularization [4], neural tangent kernels [5], 
and feature learning [6], but a complete theoretical picture remains elusive.
```

---

## Contribution Bullet Templates

### For a New Method

```
• We propose [Method Name], a novel [type of method] that [key innovation] 
  achieving [performance improvement] over [baseline] on [benchmark].
```

### For Theoretical Analysis

```
• We prove that [statement], providing the first [type of result] for 
  [problem setting]. This resolves an open question from [prior work].
```

### For Empirical Study

```
• We conduct a comprehensive evaluation of [N] methods across [M] datasets, 
  revealing that [key finding] and identifying [failure mode/best practice].
```

### For Code/Data Release

```
• We release [resource name], a [description] containing [scale/scope], 
  available at [URL]. This enables [future work/reproducibility].
```

---

## Common Mistakes to Avoid

### Vague Contributions

❌ **Bad**:
```
• We propose a novel method for attention
• We show our method is better than baselines
• We provide theoretical analysis
```

✅ **Good**:
```
• We propose LongFlash, achieving 2-4× speedup over FlashAttention
• We prove LongFlash achieves optimal O(N²d/M) IO complexity
• We enable 8× longer context training on fixed hardware budget
```

### Missing Quantification

❌ **Bad**: "Our method significantly outperforms prior work"
✅ **Good**: "Our method improves accuracy by 3.2% on GLUE and 4.1% on SuperGLUE"

### Overlapping Bullets

❌ **Bad**: 
```
• We propose a new attention mechanism
• We introduce LongFlash attention
• Our novel attention approach...
```
(These say the same thing three times)

### Buried Contributions

❌ **Bad**: Contribution bullets at the end of page 2
✅ **Good**: Contribution bullets clearly visible by end of page 1

---

## See Also

- `ml_conference_style.md` - Comprehensive ML conference guide
- `venue_writing_styles.md` - Style comparison across venues

