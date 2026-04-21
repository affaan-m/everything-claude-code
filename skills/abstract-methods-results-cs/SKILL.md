---
name: abstract-methods-results-cs
description: Review Abstract, Methods, and Results sections of CS research papers for scientific clarity, completeness, and rigor. Use this skill when you need to critique or improve these critical sections—check for clarity of objectives, method reproducibility, passive voice overuse, incomplete descriptions, unsupported claims, and missing context. Activate on any request involving "abstract", "methods", "results", "paper review", "scientific writing", or "CS research writing".
origin: ECC
---

# Abstract-Methods-Results Reviewer (JSONL Format)

You validate the Abstract, Methods, and Results sections of CS research papers. Output JSONL format—one issue per line, independent of other issues.

## When to Activate

Use this skill whenever you encounter requests to:
- Review or critique a paper's Abstract, Methods, or Results sections
- Improve clarity, rigor, or completeness in scientific writing
- Check for reproducibility issues in method descriptions
- Validate claims against reported data
- Strengthen paper structure before submission
- Assess passive voice overuse or vague writing
- Ensure baseline comparisons and statistical rigor in results

Keywords that trigger this skill: "abstract", "methods", "results", "paper review", "scientific writing", "CS research writing", "reproducibility", "methods section", "experimental design", "results reporting".

## Your Task

When given a paper or section to review, identify issues in Abstract, Methods, and Results. Each issue is reported separately with no dependencies on other issues.

## Output Format (JSONL)

Output exactly one JSON object per line. Each object represents one independent issue. Do NOT use array syntax—just newline-separated objects. The machine-readable schema lives at `schema/output.schema.json`.

Each object must have these fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `section` | string | yes | `"abstract"`, `"methods"`, or `"results"` |
| `line` | integer | yes | Approximate line number where the issue starts |
| `problem_type` | string | yes | One of the category keys below |
| `severity` | string | yes | `"critical"`, `"important"`, or `"minor"` |
| `issue` | string | yes | One-sentence description of what's wrong |
| `suggested_fix` | string | yes | Concrete rewrite or action — not "improve clarity" |

Example output:

```jsonl
{"section": "abstract", "line": 3, "problem_type": "vague_objective", "severity": "important", "issue": "Claims 'improve performance' without metric or baseline", "suggested_fix": "State the metric and the baseline: 'reduces decoding latency by 23% vs. greedy search on WMT-En-De'"}
{"section": "methods", "line": 47, "problem_type": "reproducibility_gap", "severity": "critical", "issue": "Random seed not reported; results cannot be replicated", "suggested_fix": "Add: 'All runs used seed 42 unless noted; we report mean over 5 seeds.'"}
{"section": "results", "line": 112, "problem_type": "incomplete_data", "severity": "important", "issue": "Table 1 reports accuracy without standard deviation", "suggested_fix": "Add ± std over ≥3 random seeds, or mark as 'single run' if compute-constrained"}
```

## Issue Categories

**Abstract issues:**
- `vague_objective` — Objectives lack specificity (no metrics, unclear scope)
- `missing_context` — No problem statement or motivation
- `unsupported_claim` — Conclusions without supporting data mentioned
- `passive_overuse` — More than 30% passive sentences

**Methods issues:**
- `incomplete_description` — Missing algorithm details, hyperparameters, or setup
- `reproducibility_gap` — Reader cannot reproduce the work
- `passive_overuse` — Methods written entirely in passive voice
- `missing_detail` — Ambiguous section (dataset size, training duration, hardware)
- `undefined_terms` — Jargon without definition in context

**Results issues:**
- `premature_conclusion` — Interprets results as conclusions (belongs in Discussion)
- `unsupported_claim` — Claims not backed by reported metrics
- `passive_overuse` — Results hidden in passive constructions (same category as above, different section)
- `missing_context` — Baseline/comparison method not stated
- `incomplete_data` — Should report std dev, confidence intervals, statistical tests

`passive_overuse` is the single passive-voice category; use `section` to distinguish where it applies.

## Output Requirements

- One issue per line (JSONL format).
- Every field in the table above is required on every object.
- Do NOT group or pattern-match issues — report each independently.
- Order issues by `line` number within each `section`, then in section order: abstract → methods → results.

---

## Deep Guidance: Writing Abstract, Methods, and Results

## Abstract Section

### What Makes a Strong Abstract?

A research abstract is a self-contained summary of your entire paper. Readers decide whether to read your full paper based on the abstract. It must balance completeness with brevity (typically 150-250 words depending on venue).

**Structure of an effective abstract:**
1. **Context (1-2 sentences)**: The broad problem domain or research area. Why does this problem matter?
2. **Problem Statement (2-3 sentences)**: The specific gap, limitation, or question your work addresses. What is known? What is missing?
3. **Approach (2-3 sentences)**: Your method, model, or solution at a high level. No deep technical details.
4. **Results (2-3 sentences)**: Quantitative outcomes, improvements over baselines, or key findings. Include metrics and numbers.
5. **Impact (1-2 sentences)**: Significance for the field, potential applications, or broader implications.

### Common Abstract Mistakes

- **Too vague**: "We propose a new approach to improve performance" — what approach? performance in what? compared to what?
- **Missing baselines**: "Our method achieves 95% accuracy" — 95% compared to what? Is that good?
- **No quantitative results**: Mentioning findings without numbers or percentages.
- **Confusing jargon**: Using field-specific terms without brief explanation (especially problematic if abstract goes to general audience).
- **Too long or too short**: Exceeding venue limits or omitting critical context.
- **Results as discussion**: Interpreting findings (belongs in Discussion section, not Abstract).
- **Promise vs. delivery**: Abstract claims benefits not supported by Results section.

### Before/After: Weak vs. Strong Abstract

**WEAK (vague, missing context and numbers):**

Recent advances in natural language processing have opened new possibilities for understanding text. This paper proposes a novel transformer-based model for improving semantic understanding. We apply our model to several downstream tasks and demonstrate its effectiveness. Our results show that the model performs well across different domains. The work has implications for future research in NLP and could be useful for practical applications. This represents a significant contribution to the field and outperforms previous approaches.

Problems: No specifics (which model? which tasks?), no numbers, vague claims ("performs well", "significant contribution"), no baseline comparison, reads like marketing copy.

**STRONG (specific, contextual, quantitative):**

Semantic understanding in NLP has improved dramatically with Transformer models, yet current architectures struggle with long-range dependencies in domain-specific text, particularly in biomedical and legal documents. We propose BiDomain-BERT, a dual-pathway Transformer that routes domain-specific tokens through specialized attention heads while maintaining shared semantic layers. We evaluate on five downstream tasks: MIMIC-III clinical notes (NER, relation extraction), SEC filings (entity linking, fact verification), and Wikipedia (coreference resolution). BiDomain-BERT achieves F1 improvements of 3.2-7.8 percentage points over BERT-base and comparable performance to domain-specific models (SciBERT, BioBERT) while using 18% fewer parameters. On the rare-token classification task, BiDomain-BERT outperforms specialized models by 5.4%, demonstrating that hybrid routing generalizes better than single-domain pretraining. These results suggest that parameter-efficient routing mechanisms are a viable path toward language models that excel across diverse specialized domains.

Strengths: Clear problem (long-range dependencies in domain-specific text), specific approach (dual-pathway routing), concrete baselines (BERT-base, SciBERT, BioBERT), quantitative results with error metrics (F1 scores, parameter count), significance clearly stated (outperforms both generic and specialized models, generalizes better).

### DO/DON'T: Abstract Patterns

**DO:**
- Start with domain context in 1-2 sentences (why readers should care)
- Name the specific problem and your contribution explicitly
- Include 3-5 quantitative results with comparison baselines
- Use active voice ("We propose..." not "A novel method is proposed...")
- Mention dataset names and domain (MIMIC-III, ImageNet, etc.)
- End with significance or implications for the field
- Write assuming readers know your field but not your specific paper

**DON'T:**
- Use vague intensifiers ("state-of-the-art", "novel", "powerful") without evidence
- Cite references in abstracts (venue-dependent, but generally avoid)
- Introduce new notation or abbreviations defined only in the paper
- Oversell: abstract must match paper content exactly
- Write in third person ("the authors propose") unless required by venue
- Leave out negative results or limitations (mention them briefly)
- Use percent improvements without absolute baselines ("+5% is not meaningful without context")

### Venue-Specific Tips

**ACM conferences** (SIGMOD, SIGPLAN, SIGIR, etc.):
- Abstract typically 150-200 words
- Often accepts structured abstracts (Problem | Approach | Results | Impact)
- Emphasis on systems contribution and practical impact
- Avoid too much math notation; use English for high-level ideas

**IEEE conferences** (ICCV, ICML, AAAI, etc.):
- Abstract typically 150-250 words
- Highly technical; can include formalism and equations
- Structured abstracts increasingly common: separate paragraphs for problem, contribution, method, results
- Baselines and numerical comparisons expected

**Journal submissions** (TOCS, TOPLAS, TIM, etc.):
- Often 100-150 words (stricter limits than conferences)
- More conservatively written; emphasis on rigor over novelty claims
- Statistical significance must be mentioned if any hypothesis testing
- Results section can reference supplemental materials

**Workshop abstracts**:
- Often 75-150 words (shorter)
- More narrative, less rigorous than main conference
- Position papers acceptable (future work, early-stage ideas)
- Can be less quantitative if the idea is novel

---

## Methods Section

### What Makes Methods Reproducible?

The Methods section is where you earn the reader's trust. A reader should be able to implement your approach from this section alone. If they cannot, your work is not reproducible—even if results are strong.

**Essential elements of reproducible methods:**

1. **Dataset Description**
   - Full name and source (with citation or URL)
   - Size: number of samples, dimensionality, splits (train/val/test percentages)
   - Preprocessing: how raw data was cleaned, normalized, augmented
   - Availability: public, proprietary, or request from authors
   - Class distribution or key statistics (especially for imbalanced data)

2. **Hardware and Software Environment**
   - CPU/GPU specifications (e.g., "single NVIDIA A100 40GB")
   - Software versions (PyTorch 2.0.1, TensorFlow 2.11, CUDA 11.8)
   - Memory/runtime constraints
   - Code availability (GitHub repo, supplemental materials, archived via Zenodo)

3. **Model Architecture**
   - Explicit description or pseudocode of your model
   - Diagram (Figure in appendix is acceptable)
   - Exact dimensions, layer counts, attention heads, activation functions
   - Skip connections, normalization choices, and initialization schemes
   - If building on prior work, state modifications explicitly ("We add a residual path to the existing BiLSTM from Smith et al. [X]...")

4. **Hyperparameters**
   - Learning rate, batch size, optimizer, momentum, weight decay
   - Initialization strategy (random seed, pretrained weights source)
   - Training schedule (epochs, early stopping criteria, learning rate decay)
   - Regularization techniques (dropout rates, L1/L2 penalties)
   - If hyperparameters were tuned: describe search strategy, validation metric, final selection

5. **Baselines and Comparison Methods**
   - All baseline models explicitly named and referenced
   - Baseline hyperparameters (or cite their papers for exact settings)
   - Whether you reimplemented baselines or used published code
   - Fair comparison: same train/test split, same preprocessing, same evaluation metrics

6. **Evaluation Metrics and Protocols**
   - Exact definition of each metric (precision, recall, F1, BLEU, ROUGE, etc.)
   - Statistical significance testing (if applicable): test used, p-value threshold, confidence intervals
   - Cross-validation strategy (k-fold, holdout, time-series split)
   - Multiple runs and reporting of mean/std or confidence intervals

### Common Methods Mistakes

- **Incomplete algorithm description**: Pseudocode or equations missing; readers cannot tell what you actually implemented
- **Vague hyperparameter selection**: "We use standard settings" or "We tuned the model" without specifics
- **Missing preprocessing details**: How were images resized? How were text tokens preprocessed?
- **Baseline reimplementation vs. published code**: You reimplemented a complex baseline incorrectly, and now baseline performance is artificially low
- **Unfair comparisons**: Different training data, different preprocessing, or different train/test splits for baselines vs. your method
- **No statistical rigor**: Single run with single seed; no confidence intervals or significance tests
- **Hidden complexity**: "We then apply standard NLP pipeline" hides critical details
- **Dependency on unavailable resources**: "We used internal company dataset (not available)" makes work non-reproducible

### Before/After: Incomplete vs. Complete Methods Paragraph

**INCOMPLETE (missing critical details):**

We implemented a transformer-based model for sentiment analysis. The model was trained on the Stanford Sentiment Treebank (SST) dataset. We used standard preprocessing and tokenization. The model includes multiple attention heads and fully connected layers. We trained the model using Adam optimizer with a learning rate of 0.001. We compared against BERT and GPT models. The model achieved good performance on the test set.

Problems: No architecture details (how many layers? how many heads?), no random seed, no dataset split information, "good performance" is meaningless, baselines are named but their hyperparameters and comparison method not specified, no statistical testing, preprocessing is "standard" (undefined).

**COMPLETE (reproducible):**

We implement a Transformer encoder with 6 layers, 12 attention heads, 768 hidden dimensions, and 3072 feedforward dimensions. We use sinusoidal positional encoding and apply layer normalization before each sublayer (pre-LN architecture). We initialized weights uniformly from [-0.1, 0.1] and used a fixed random seed (42) for all runs.

We train on the Stanford Sentiment Treebank (SST-2, Socher et al., 2013), which contains 67,349 sentences. We use the official train/val/test split (70%/15%/15% = 6,920 test samples). Preprocessing: tokenization via nltk.tokenize, lowercasing, and padding to length 128. Class distribution is 50.3% positive / 49.7% negative (balanced).

We use Adam optimizer (beta1=0.9, beta2=0.999, epsilon=1e-8) with learning rate 0.0001, batch size 32, and train for 15 epochs with early stopping (patience 3 on validation accuracy). We apply dropout at 0.1 before the output layer. Training on a single NVIDIA V100 GPU takes approximately 8 minutes per epoch.

We compare against two baselines: (1) BERT-base (Devlin et al., 2019) fine-tuned with learning rate 2e-5, batch size 32, 3 epochs, and (2) a CNN with 100 filters of window size 3/4/5 followed by max-pooling and 2 fully connected layers. All baselines use the same SST-2 split, preprocessing, and random seed.

We report accuracy, precision, recall, and F1 (macro) on the test set. We run each method 5 times with different random seeds and report mean and standard deviation. We perform significance testing using paired t-tests with alpha=0.05.

Strengths: Architecture fully specified (layers, heads, dimensions, initialization), dataset with split percentages and class distribution, preprocessing steps explicit, hardware and runtime documented, hyperparameters with optimizer settings, baselines with implementation details, metrics and statistical rigor (5 runs, mean/std, t-tests).

### DO/DON'T: Methods Patterns

**DO:**
- Use subsections (Dataset, Model Architecture, Training, Evaluation) for clarity
- Cite the papers where baselines come from or link to their code
- Describe the exact sequence of preprocessing steps (in order)
- Include random seed and explain reproducibility measures
- Specify hardware (GPU type, memory) and approximate runtime
- Use numbered lists or tables for hyperparameters (tables are easier to scan)
- Mention availability of code or supplemental materials
- For novel methods, provide pseudocode or equations (or reference appendix)

**DON'T:**
- Say "we use standard preprocessing" or "we use common baselines" without specifics
- Omit random seeds or initialization details
- Report single runs without error bars or confidence intervals
- Implement baselines from scratch without verifying against published results
- Mix different train/test splits or preprocessing for baselines vs. your method
- Use different evaluation metrics for baselines vs. your method
- Assume readers know your internal codebase details
- Defer critical architecture decisions to "we empirically determined" without explanation

### LaTeX Tips for Methods

**Hyperparameter tables** (cleaner than prose):

```latex
\begin{table}[h]
  \centering
  \begin{tabular}{lcc}
    \toprule
    \textbf{Parameter} & \textbf{Our Model} & \textbf{BERT-base} \\
    \midrule
    Layers & 6 & 12 \\
    Hidden dimension & 768 & 768 \\
    Attention heads & 12 & 12 \\
    Dropout & 0.1 & 0.1 \\
    Learning rate & 0.0001 & 0.00002 \\
    Batch size & 32 & 32 \\
    \bottomrule
  \end{tabular}
  \caption{Model and training hyperparameters.}
\end{table}
```

**Algorithm pseudocode** (for non-trivial approaches):

```latex
\begin{algorithm}
  \caption{Dual-Pathway Routing}
  \begin{algorithmic}
    \REQUIRE token sequence $x_1, \ldots, x_n$, routing weights $W_r$
    \FOR{each token $x_i$}
      \STATE compute routing score: $r_i = \text{softmax}(W_r x_i)$
      \STATE route to domain head: $h_i^{dom} = \text{Attn}^{dom}(x_i)$ with probability $r_i[0]$
      \STATE route to generic head: $h_i^{gen} = \text{Attn}^{gen}(x_i)$ with probability $r_i[1]$
      \STATE combine: $h_i = r_i[0] \cdot h_i^{dom} + r_i[1] \cdot h_i^{gen}$
    \ENDFOR
    \RETURN $h_1, \ldots, h_n$
  \end{algorithmic}
\end{algorithm}
```

---

## Results Section

### How to Present Results Clearly

The Results section reports what your experiments found. It is strictly factual—no interpretation, no claims about why results are good or bad (that belongs in Discussion). Results should be presented in an order that builds narrative: perhaps baseline comparisons first, then ablations, then error analysis.

**Key principles:**
1. **One figure or table per main claim**: Each figure/table should support exactly one key finding
2. **Legible fonts and labels**: Axis labels, legend, and caption must be readable without magnification
3. **Comparison to baselines first**: Report your method against established baselines before ablations
4. **Error bars or confidence intervals**: Always report variability (standard deviation, confidence intervals, or range from multiple runs)
5. **Statistical significance**: Report p-values, significance levels, or confidence intervals when making comparative claims
6. **Avoid cherry-picking**: Report all results, including negative findings or edge cases
7. **Consistent metrics**: Use the same evaluation metric for all conditions being compared

### Tables vs. Figures

**Use tables when:**
- Comparing many numeric values (3+ conditions, 3+ metrics)
- Exact numbers matter more than trends (e.g., reporting F1 scores to 2 decimal places)
- You have discrete categories (different models, different domains, different datasets)
- Space allows; tables are compact

**Use figures when:**
- You want to show a trend over a continuous variable (epochs, dataset size, hyperparameter values)
- The pattern or distribution matters more than exact values
- Comparing many items (e.g., 10+ methods on one metric); a bar chart is faster to parse than a table
- Showing qualitative patterns (learning curves, confusion matrices, t-SNE visualizations)
- You have limited space; figures can be wide and short

**Key rule**: Never duplicate information across tables and text. If you report a number in a table, mention it in prose only when highlighting significance; reference the table ("As shown in Table 1").

### Statistical Rigor in Results

**Report variability for every quantitative claim:**

Weak: "Our method achieves 92.3% accuracy."
Better: "Our method achieves 92.3 ± 1.2% accuracy (mean ± std, 5 random seeds)."

**State baseline selection and performance explicitly:**

Weak: "We outperform prior work."
Better: "On ImageNet, our method reaches 78.4% top-1 accuracy, compared to ResNet-50 (76.2%), EfficientNet-B4 (77.1%), and Vision Transformer (79.8%)."

**For small differences, report confidence intervals and significance:**

Weak: "Our method is 1% better."
Better: "Method A: 85.2% ± 0.8% (95% CI: 83.8–86.6%), Method B: 84.1% ± 0.9% (95% CI: 82.8–85.4%), paired t-test p=0.032."

**Explain why baselines may underperform:**

If baseline performance seems low, state it explicitly: "BERT-base achieves 71.2% on this task (vs. 81.4% on standard GLUE), likely due to the highly specialized domain vocabulary." This prevents readers from thinking your baselines are weak implementations.

### Before/After: Weak vs. Strong Results Reporting

**WEAK (unsupported claims, missing context, no error bars):**

Our model significantly outperforms existing approaches. We tested on ImageNet and achieved 78.5% top-1 accuracy. BERT baseline achieved 71% accuracy. Our method is clearly superior and shows state-of-the-art performance. The improvements are large and consistent across multiple runs. We also tested on CIFAR-10 and found similar patterns, with our method achieving 95.3% accuracy. The results demonstrate that our approach is robust and generalizes well.

Problems: No standard deviations or confidence intervals, "significantly" is not defined, baseline selection is not justified, "consistent across multiple runs" without proof, no statistical testing, "state-of-the-art" is a claim not backed by comprehensive benchmarking, "large and consistent" is subjective.

**STRONG (quantitative, rigorous, transparent):**

Table 1 reports accuracy on ImageNet validation set (50K images). Our method achieves 78.5 ± 0.3% top-1 accuracy (mean ± std, 5 random seeds). This represents a 1.2 percentage point improvement over Vision Transformer ViT-B (77.3 ± 0.4%) and 2.3 points over ResNet-50 (76.2 ± 0.2%). Paired t-tests confirm that improvements over both baselines are statistically significant (ViT vs. ours: t=2.84, p=0.034; ResNet vs. ours: t=4.12, p=0.008). Note that our method uses a pretrained ImageNet-21K initialization (as do current SOTA methods); this is why baseline comparisons exclude ImageNet-1K-only models. Figure 3 shows per-class accuracy, revealing that improvements are concentrated in fine-grained categories (dog breeds, bird species) where spatial structure matters most; performance on general object classes (car, person) is similar across methods.

We also evaluate on CIFAR-10 (test set, 10K images). Accuracy: 95.3 ± 0.2% (our method), 94.1 ± 0.3% (ResNet-18), 94.8 ± 0.2% (Vision Transformer). Statistical significance (paired t-test): p=0.041 vs. ResNet, p=0.072 vs. ViT (approaching significance, likely due to high baseline accuracy where improvements have less room to grow).

Strengths: All numbers include standard deviations and sample count (5 runs), statistical significance reported with test type and p-values, baselines chosen to be contemporary (not straw men), acknowledges initialization differences (key factor in ImageNet results), shows per-class breakdown to explain where improvements come from, reports results on second dataset with caveats about diminishing returns, avoids "state-of-the-art" claims without comprehensive benchmarking.

### Common Results Mistakes

- **Premature conclusions**: "Our method is superior because of X" belongs in Discussion, not Results
- **Missing baselines**: Reporting only your method without comparison (how do readers know it's good?)
- **Baseline underperformance**: Baselines seem weaker than published; readers suspect unfair comparison or poor implementation
- **No error bars**: Single runs with single seeds; readers cannot assess variability
- **Overloaded tables**: 10+ columns with different units and metrics; impossible to parse quickly
- **Inconsistent metrics**: Method A reported as accuracy, Method B as F1; results not directly comparable
- **Results in prose form only**: Important findings not in figures or tables; hard to extract and compare
- **Ignoring negative results**: Only reporting the successful experiment; hiding failed ablations or edge cases
- **Unexplained outliers**: Figure shows one condition much worse; no discussion of why

### DO/DON'T: Results Patterns

**DO:**
- Report all conditions and datasets, even if results are mixed
- Include error bars, standard deviations, or confidence intervals on every quantitative claim
- Use consistent evaluation metrics across all baselines and your method
- Order results by narrative (baselines first, then your method, then ablations)
- Caption figures and tables so they are understandable in isolation
- Explain outliers or unexpected results (e.g., "Method X fails on sparse graphs; we include results but note this limitation")
- Use statistical testing (t-tests, ANOVA) for small differences and larger claims
- Highlight key numbers in bold or use color, but sparingly and consistently

**DON'T:**
- Report results without multiple random seeds or runs
- Use different evaluation metrics for your method vs. baselines (e.g., macro F1 vs. micro)
- Cherry-pick results (report only the dataset where your method is best)
- Make interpretation claims ("our method is superior because...") in Results
- Use vague descriptors ("large improvement", "very good", "competitive") without numbers
- Forget to mention initialization, data splits, or preprocessing differences between your method and baselines
- Present figures at unreadable resolution or with tiny fonts
- Crowd too much into one table (split into multiple, use appendix if needed)

### LaTeX Tips for Results

**Tables with confidence intervals:**

```latex
\begin{table}[h]
  \centering
  \begin{tabular}{lrrrr}
    \toprule
    \textbf{Method} & \textbf{Accuracy} & \textbf{Precision} & \textbf{Recall} & \textbf{F1} \\
    \midrule
    ResNet-50 & 76.2 \scriptsize \pm 0.4 & 0.768 \pm 0.006 & 0.754 \pm 0.008 & 0.761 \pm 0.007 \\
    ViT-B & 77.3 \pm 0.3 & 0.781 \pm 0.005 & 0.769 \pm 0.006 & 0.775 \pm 0.005 \\
    \textbf{Ours} & \textbf{78.5} \pm \textbf{0.2} & \textbf{0.795} \pm \textbf{0.004} & \textbf{0.782} \pm \textbf{0.005} & \textbf{0.788} \pm \textbf{0.004} \\
    \bottomrule
  \end{tabular}
  \caption{Accuracy, precision, recall, and F1 on ImageNet validation. All results are mean \pm std over 5 random seeds.}
  \label{tab:imagenet}
\end{table}
```

**Figure with error bars:**

```latex
\begin{figure}[h]
  \centering
  \includegraphics[width=0.6\textwidth]{learning_curve.pdf}
  \caption{Validation accuracy over epochs. Curves show mean accuracy and shaded regions indicate \pm 1 std (5 random seeds). Our method (blue) converges faster and reaches higher accuracy than ResNet-50 (green) and ViT-B (orange).}
  \label{fig:learning}
\end{figure}
```

---

## Quick Reference Checklist

### Abstract Checklist

- [ ] Problem is specific and bounded (not "improving performance" but "reducing latency in transformer decoding by X%")
- [ ] Context/motivation in first 1-2 sentences (why this problem matters)
- [ ] Approach name and high-level idea (method without deep technical detail)
- [ ] 3-5 quantitative results with numbers and units (%F1, accuracy, speedup, etc.)
- [ ] Baselines or comparisons named and with numbers (not just "outperforms existing work")
- [ ] Significance or impact briefly stated (why results matter to the field)
- [ ] No citations (venue-dependent, but standard for most conferences)
- [ ] 150-250 words depending on venue
- [ ] Active voice preferred; no vague intensifiers ("novel", "powerful", "state-of-the-art" without evidence)
- [ ] No undefined jargon

### Methods Checklist

- [ ] Dataset: name, size, train/test split, source/availability
- [ ] Preprocessing: exact steps in order (lowercasing, tokenization, padding, augmentation, etc.)
- [ ] Model architecture: layers, dimensions, activation functions, initialization (text description or reference to figure)
- [ ] All hyperparameters: learning rate, batch size, optimizer, momentum, regularization
- [ ] Hardware and software: GPU type, memory, library versions (PyTorch/TensorFlow version), CUDA version
- [ ] Random seed fixed and reported
- [ ] Baselines: explicit names, citations, whether reimplemented or from published code
- [ ] If baselines reimplemented: verification that results match published (sanity check)
- [ ] Evaluation metrics: exact definitions and formulas if non-standard
- [ ] Statistical testing: cross-validation strategy, confidence intervals, significance tests
- [ ] Code availability mentioned (GitHub, Zenodo, supplemental materials)
- [ ] Fair comparison: same preprocessing, same data, same train/test split for all methods

### Results Checklist

- [ ] Baseline results reported first, clearly labeled
- [ ] Your method results vs. baselines with numbers and error bars
- [ ] All reported metrics include standard deviation or confidence interval (not single runs)
- [ ] Statistical significance reported if making comparative claims (p-values, t-tests)
- [ ] Figures/tables: one per main finding, legible fonts, clear labels and caption
- [ ] Ablation studies (if applicable) show contribution of each component
- [ ] Error analysis or per-category breakdown (where does method succeed/fail?)
- [ ] Edge cases or negative results reported (not cherry-picked)
- [ ] No interpretation claims ("our method is superior because..."; save for Discussion)
- [ ] Inconsistencies or unexpected results explained
- [ ] Results organized in narrative order (baselines → main results → ablations)
- [ ] No duplication: if result is in table, mention in prose only if highlighting significance

---

## Related Skills

This skill sits mid-pipeline for paper review. Use in this order:

1. `paper-structure-cs` — verify sections are present and correctly ordered first.
2. **`abstract-methods-results-cs` (this skill)** — review the content of the three most scrutinized sections.
3. `sentence-clarity-cs` — polish prose at the sentence level.
4. `academic-final-review-cs` — final pre-submission checklist.
