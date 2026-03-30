# Nature and Science Writing Style Guide

Comprehensive writing guide for Nature, Science, and related high-impact multidisciplinary journals (Nature Communications, Science Advances, PNAS).

**Last Updated**: 2024

---

## Overview

Nature and Science are the world's premier multidisciplinary scientific journals. Papers published here must appeal to scientists across all disciplines, not just specialists. This fundamentally shapes the writing style.

### Key Philosophy

> "If a structural biologist can't understand why your particle physics paper matters, it won't be published in Nature."

**Primary Goal**: Communicate groundbreaking science to an educated but non-specialist audience.

---

## Audience and Tone

### Target Reader

- PhD-level scientist in **any** field
- Familiar with scientific methodology
- **Not** an expert in your specific subfield
- Reading broadly to stay current across science

### Tone Characteristics

| Characteristic | Description |
|---------------|-------------|
| **Accessible** | Avoid jargon; explain technical concepts |
| **Engaging** | Hook the reader; tell a story |
| **Significant** | Emphasize why this matters broadly |
| **Confident** | State findings clearly (with appropriate hedging) |
| **Active** | Use active voice; first person acceptable |

### Voice

- **First person plural ("we") is encouraged**: "We discovered that..." not "It was discovered that..."
- **Active voice preferred**: "We measured..." not "Measurements were taken..."
- **Direct statements**: "Protein X controls Y" not "Protein X appears to potentially control Y"

---

## Abstract

### Style Requirements

- **Flowing paragraphs** (NOT structured with labeled sections)
- **150-200 words** for Nature; up to 250 for Nature Communications
- **No citations** in abstract
- **No abbreviations** (or define at first use if essential)
- **Self-contained**: Understandable without reading the paper

### Abstract Structure (Implicit)

Write as flowing prose covering:

1. **Context** (1-2 sentences): Why this area matters
2. **Gap/Problem** (1 sentence): What was unknown or problematic
3. **Approach** (1 sentence): What you did (briefly)
4. **Key findings** (2-3 sentences): Main results with key numbers
5. **Significance** (1-2 sentences): Why this matters, implications

### Example Abstract (Nature Style)

```
The origins of multicellular life remain one of biology's greatest mysteries. 
How individual cells first cooperated to form complex organisms has been 
difficult to study because the transition occurred over 600 million years ago. 
Here we show that the unicellular alga Chlamydomonas reinhardtii can evolve 
simple multicellular structures within 750 generations when exposed to 
predation pressure. Using experimental evolution with the predator Paramecium, 
we observed the emergence of stable multicellular clusters in 5 of 10 
replicate populations. Genomic analysis revealed that mutations in just two 
genes—encoding cell adhesion proteins—were sufficient to trigger this 
transition. These results demonstrate that the evolution of multicellularity 
may require fewer genetic changes than previously thought, providing insight 
into one of life's major transitions.
```

### What NOT to Write

❌ **Too technical**:
> "Using CRISPR-Cas9-mediated knockout of the CAD1 gene (encoding cadherin-1) in C. reinhardtii strain CC-125, we demonstrated that loss of CAD1 function combined with overexpression of FLA10 under control of the HSP70A/RBCS2 tandem promoter..."

❌ **Too vague**:
> "We studied how cells can form groups. Our results are interesting and may have implications for understanding evolution."

---

## Introduction

### Length and Structure

- **3-5 paragraphs** (roughly 500-800 words)
- **Funnel structure**: Broad → Specific → Your contribution

### Paragraph-by-Paragraph Guide

**Paragraph 1: The Big Picture**
- Open with a broad, engaging statement about the field
- Establish why this area matters to science/society
- Accessible to any scientist

```
Example:
"The ability to predict protein structure from sequence alone has been a grand 
challenge of biology for over 50 years. Accurate predictions would transform 
drug discovery, enable understanding of disease mechanisms, and illuminate the 
fundamental rules governing molecular self-assembly."
```

**Paragraph 2-3: What We Know**
- Review key prior work (selectively, not exhaustively)
- Build toward the gap you'll address
- Keep citations focused on essential papers

```
Example:
"Significant progress has been made through template-based methods that 
leverage known structures of homologous proteins. However, for the estimated 
30% of proteins without detectable homologs, prediction accuracy has remained 
limited. Deep learning approaches have shown promise, achieving improved 
accuracy on benchmark datasets, yet still fall short of experimental accuracy 
for many protein families."
```

**Paragraph 4: The Gap**
- Clearly state what remains unknown or unresolved
- Frame this as an important problem

```
Example:
"Despite these advances, the fundamental question remains: can we predict 
protein structure with experimental-level accuracy for proteins across all 
of sequence space? This capability would democratize structural biology and 
enable rapid characterization of newly discovered proteins."
```

**Final Paragraph: This Paper**
- State what you did and preview key findings
- Signal the significance of your contribution

```
Example:
"Here we present AlphaFold2, a neural network architecture that predicts 
protein structure with atomic-level accuracy. In the CASP14 blind assessment, 
AlphaFold2 achieved a median GDT score of 92.4, matching experimental 
accuracy for most targets. We show that this system can be applied to predict 
structures across entire proteomes, opening new avenues for understanding 
protein function at scale."
```

### Introduction Don'ts

- ❌ Don't start with "Since ancient times..." or overly grandiose claims
- ❌ Don't provide an exhaustive literature review (save for specialist journals)
- ❌ Don't include methods or results in the introduction
- ❌ Don't use unexplained acronyms or jargon

---

## Results

### Organizational Philosophy

**Story-driven, not experiment-driven**

Organize by **finding**, not by the chronological order of experiments:

❌ **Experiment-driven** (avoid):
> "We first performed experiment A. Next, we did experiment B. Then we conducted experiment C."

✅ **Finding-driven** (preferred):
> "We discovered that X. To understand the mechanism, we found that Y. This led us to test whether Z, confirming our hypothesis."

### Results Writing Style

- **Past tense** for describing what was done/found
- **Present tense** for referring to figures ("Figure 2 shows...")
- **Objective but interpretive**: State findings with minimal interpretation, but provide enough context for non-specialists
- **Quantitative**: Include key numbers, statistics, effect sizes

### Example Results Paragraph

```
To test whether protein X is required for cell division, we generated 
knockout cell lines using CRISPR-Cas9 (Fig. 1a). Cells lacking protein X 
showed a 73% reduction in division rate compared to controls (P < 0.001, 
n = 6 biological replicates; Fig. 1b). Live-cell imaging revealed that 
knockout cells arrested in metaphase, with 84% showing abnormal spindle 
morphology (Fig. 1c,d). These results demonstrate that protein X is 
essential for proper spindle assembly and cell division.
```

### Subheadings

Use descriptive subheadings that convey findings:

❌ **Vague**: "Protein expression analysis"
✅ **Informative**: "Protein X is upregulated in response to stress"

---

## Discussion

### Structure (4-6 paragraphs)

**Paragraph 1: Summary of Key Findings**
- Restate main findings (don't repeat Results verbatim)
- State whether hypotheses were supported

**Paragraphs 2-3: Interpretation and Context**
- What do the findings mean?
- How do they relate to prior work?
- What mechanisms might explain the results?

**Paragraph 4: Broader Implications**
- Why does this matter beyond your specific system?
- Connections to other fields
- Potential applications

**Paragraph 5: Limitations**
- Acknowledge limitations honestly
- Be specific, not generic

**Final Paragraph: Conclusions and Future**
- Big-picture take-home message
- Brief mention of future directions

### Discussion Writing Tips

- **Lead with implications**, not caveats
- **Compare to literature constructively**: "Our findings extend the work of Smith et al. by demonstrating..."
- **Acknowledge alternative interpretations**: "An alternative explanation is that..."
- **Be honest about limitations**: Specific > generic

### Example Limitation Statement

❌ **Generic**: "Our study has limitations that should be addressed in future work."

✅ **Specific**: "Our analysis was limited to cultured cells, which may not fully recapitulate the tissue microenvironment. Additionally, the 48-hour observation window may miss slower-developing phenotypes."

---

## Methods

### Nature Methods Placement

- **Brief Methods** in main text (often at the end)
- **Extended Methods** in Supplementary Information
- Must be detailed enough for reproduction

### Writing Style

- **Past tense, passive voice acceptable**: "Cells were cultured..." or "We cultured cells..."
- **Precise and reproducible**: Include concentrations, times, temperatures
- **Reference established protocols**: "Following the method of Smith et al.³..."

---

## Figures

### Figure Philosophy

Nature values **conceptual figures** alongside data:

1. **Figure 1**: Often a schematic/model showing the concept
2. **Data figures**: Clear, not cluttered
3. **Final figure**: Often a summary model

### Figure Design Principles

- **Single-column (89 mm) or double-column (183 mm)** width
- **High resolution**: 300+ dpi for photos, 1000+ dpi for line art
- **Colorblind-accessible**: Avoid red-green distinctions alone
- **Minimal chartjunk**: No 3D effects, unnecessary gridlines
- **Complete legends**: Self-explanatory without reading text

### Figure Legend Format

```
Figure 1 | Protein X controls cell division through spindle assembly.
a, Schematic of the experimental approach. b, Quantification of cell 
division rate in control (grey) and knockout (blue) cells. Data are 
mean ± s.e.m., n = 6 biological replicates. ***P < 0.001, two-tailed 
t-test. c,d, Representative images of spindle morphology in control (c) 
and knockout (d) cells. Scale bars, 10 μm.
```

---

## References

### Citation Style

- **Numbered superscripts**: ¹, ², ¹⁻³, ¹'⁵'⁷
- **Nature format** for bibliography

### Reference Format

```
1. Watson, J. D. & Crick, F. H. C. Molecular structure of nucleic acids. 
   Nature 171, 737–738 (1953).

2. Smith, A. B., Jones, C. D. & Williams, E. F. Discovery of protein X. 
   Science 380, 123–130 (2023).
```

### Citation Best Practices

- **Recent literature**: Include papers from last 2-3 years
- **Seminal papers**: Cite foundational work
- **Diverse sources**: Don't over-cite your own work
- **Primary sources**: Cite original discoveries, not reviews (when possible)

---

## Language and Style Tips

### Word Choice

| Avoid | Prefer |
|-------|--------|
| utilize | use |
| methodology | method |
| in order to | to |
| a large number of | many |
| at this point in time | now |
| has the ability to | can |
| it is interesting to note that | [delete entirely] |

### Sentence Structure

- **Vary sentence length**: Mix short and longer sentences
- **Lead with importance**: Put key information at the start
- **One idea per sentence**: Complex ideas need multiple sentences

### Paragraph Structure

- **Topic sentence first**: State the main point
- **Supporting evidence**: Data and citations
- **Transition**: Connect to next paragraph

---

## Comparison: Nature vs. Science

| Feature | Nature | Science |
|---------|--------|---------|
| Abstract length | 150-200 words | ≤125 words |
| Citation style | Numbered superscript | Numbered parentheses (1, 2) |
| Article titles in refs | Yes | No (in main refs) |
| Methods placement | End of paper or supplement | Supplement |
| Significance statement | No | No |
| Open access option | Yes | Yes |

---

## Common Rejection Reasons

1. **Not of sufficient broad interest**: Too specialized for Nature/Science
2. **Incremental advance**: Not transformative enough
3. **Overselling**: Claims not supported by data
4. **Poor accessibility**: Too technical for general audience
5. **Weak significance statement**: "So what?" unclear
6. **Insufficient novelty**: Similar findings published elsewhere
7. **Methodological concerns**: Results not convincing

---

## Pre-Submission Checklist

### Content
- [ ] Significance to broad audience clear in first paragraph
- [ ] Non-specialist can understand the abstract
- [ ] Story-driven results (not experiment-by-experiment)
- [ ] Implications emphasized in discussion
- [ ] Limitations acknowledged specifically

### Style
- [ ] Active voice predominates
- [ ] Jargon minimized or explained
- [ ] Sentences vary in length
- [ ] Paragraphs have clear topic sentences

### Technical
- [ ] Figures are high resolution
- [ ] Citations in correct format
- [ ] Word count within limits
- [ ] Line numbers included
- [ ] Double-spaced

---

## See Also

- `venue_writing_styles.md` - Master style overview
- `journals_formatting.md` - Technical formatting requirements
- `reviewer_expectations.md` - What Nature/Science reviewers seek

