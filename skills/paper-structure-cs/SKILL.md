---
name: paper-structure-cs
description: Validate paper structure against academic standards: required sections present, correct ordering, proper heading hierarchy, bibliography completeness, and section consistency. Use this skill when checking if a paper follows standard academic structure (Abstract, Intro, Methods, Results, Discussion, Conclusion, Bibliography), when reviewing a table of contents against actual sections, or when verifying section flow and heading levels. Trigger on "paper structure", "section order", "heading hierarchy", "missing sections", "check structure", "outline review", "paper organization", "section flow", or similar.
origin: ECC
---

# Paper Structure Validator (JSONL with optional dependencies)

You validate the structural organization of CS research papers. Output JSONL format—one issue per line. Some issues may have optional `depends_on` markers to indicate lightweight sequencing.

## When to Activate

Activate this skill when:
- A paper (outline, draft, or submission) needs structural validation before review
- You're unsure if a paper follows standard academic conventions
- A paper has been reorganized and sections need re-verification
- Checking if a paper fits a specific venue's structural requirements (ACM, IEEE, NeurIPS, etc.)
- Reviewing section coherence, transitions, and logical flow
- Validating heading hierarchy and consistency across a document
- Comparing a Table of Contents against actual paper sections
- Identifying structural gaps or orphaned sections that don't fit the flow

## Your Task

When given a paper outline, table of contents, or full paper, verify:
- All required sections present (Abstract, Intro, Methods, Results, Discussion, Conclusion)
- Sections in correct order and logical flow
- Heading levels follow proper hierarchy (no # → ### skips)
- Bibliography present and complete
- Table of Contents (if present) matches actual sections
- Section transitions and flow are logical
- Heading naming conventions are consistent
- Section balance and proportionality (no single 20-page Methods section, etc.)

## Output Format (JSONL)

Output exactly one JSON object per line. Use optional `depends_on` to mark lightweight dependencies (not complex relationships like tesis-validator).

```jsonl
{"id": "struct_001", "type": "missing_section", "section": "Methods", "severity": "critical", "issue": "Methods section not found", "suggested_fix": "Add Methods section after Literature Review and before Results", "depends_on": null}
{"id": "struct_002", "type": "heading_skip", "location": "Line 45", "current_heading": "# Introduction", "next_heading": "### Related Work", "severity": "important", "issue": "Heading hierarchy skips level (# to ###)", "suggested_fix": "Insert ## heading between # and ###", "depends_on": null}
{"id": "struct_003", "type": "section_order", "current_position": 6, "section": "Bibliography", "expected_position": "Last", "severity": "important", "issue": "Bibliography appears before Conclusion", "suggested_fix": "Move Bibliography to end of paper", "depends_on": null}
{"id": "struct_004", "type": "toc_mismatch", "issue": "TOC lists 'Experimental Setup' but paper has 'Methodology'", "severity": "minor", "suggested_fix": "Update TOC to match actual section title, or rename section for consistency", "depends_on": "struct_001"}
```

## Issue Categories

- `missing_section` - Required section (Abstract, Methods, Results, Discussion, Conclusion) not found
- `section_order` - Sections in wrong sequence (e.g., Results before Methods)
- `heading_skip` - Heading hierarchy violates standard (# → ## → ###, no skips to ###)
- `heading_level_inconsistent` - Similar-importance sections use different heading levels
- `toc_mismatch` - Table of Contents doesn't match actual sections
- `missing_bibliography` - Paper has no bibliography or references section
- `citation_incomplete` - References cited in text not in bibliography (or vice versa)
- `orphaned_section` - Section present but not mentioned in TOC

## How to Evaluate

1. **Required sections**: Check for Abstract, Introduction, Methods, Results, Discussion, Conclusion
2. **Order**: Verify logical flow (Abstract → Intro → Methods → Results → Discussion → Conclusion → Bibliography)
3. **Headings**: Ensure proper nesting (no jumps; consistent levels for parallel sections)
4. **Bibliography**: Verify completeness and match against in-text citations
5. **TOC consistency**: If TOC present, all sections must match

## Output Requirements

- One issue per line (JSONL format)
- Assign unique `id` for reference (e.g., "struct_001", "struct_002")
- `severity`: `critical` (structure broken), `important` (confusing/non-standard), or `minor` (cosmetic)
- Use optional `depends_on: "struct_ID"` only if an issue logically depends on another being fixed first (rare)
- Keep `issue` and `suggested_fix` concise
- Include `location` if referencing a specific line or heading
- Do NOT create complex dependency chains—only flag true prerequisites

## Example Review

Given a paper outline:

```
1. Abstract
2. Related Work
3. Methods
4. Results
5. Conclusion
6. Bibliography
```

Output:

```jsonl
{"id": "struct_001", "type": "missing_section", "section": "Introduction", "severity": "critical", "issue": "Introduction section missing between Abstract and Related Work", "suggested_fix": "Add Introduction section after Abstract to provide problem context and motivation", "depends_on": null}
{"id": "struct_002", "type": "missing_section", "section": "Discussion", "severity": "important", "issue": "Discussion section missing before Conclusion", "suggested_fix": "Add Discussion section between Results and Conclusion to interpret findings", "depends_on": "struct_001"}
{"id": "struct_003", "type": "section_order", "current_position": 2, "section": "Related Work", "expected_position": "After Introduction", "severity": "important", "issue": "Related Work appears before Introduction (should establish context first)", "suggested_fix": "Reorder: Abstract → Introduction → Related Work → Methods → Results → Discussion → Conclusion", "depends_on": "struct_001"}
```

---

## Standard CS Paper Structures

### Conference Papers (4–6 pages, short format)

Typical structure for short conference submissions (e.g., ACM CHI Extended Abstracts, IEEE workshops):

| Section | Required | Notes |
|---------|----------|-------|
| Abstract | Yes | 100–150 words; problem, approach, results |
| Introduction | Yes | Motivate the problem; state contributions clearly |
| Related Work | Yes | Brief (0.5–1 page); cite key prior work |
| Methods / Approach | Yes | How you solved the problem (concise) |
| Results / Evaluation | Yes | Key findings; minimal detail |
| Discussion | No | Optional if space-constrained; can merge with Results |
| Conclusion | Yes | Summary; future work; 2–3 sentences |
| Bibliography | Yes | All citations complete |

**Heading Levels**: # (main sections), ## (subsections only if needed)

### Conference Papers (8–12 pages, long format)

Typical structure for main conference track submissions (e.g., SIGCHI, SIGMOD, NeurIPS):

| Section | Required | Notes |
|---------|----------|-------|
| Abstract | Yes | 150–250 words; context, contribution, impact |
| Introduction | Yes | 1–2 pages; problem statement, motivation, contributions (often bulleted) |
| Related Work | Yes | 1–1.5 pages; related systems, baselines, positioning |
| Methods / Approach / System Design | Yes | 2–3 pages; detailed enough to reproduce |
| Evaluation / Results | Yes | 2–3 pages; metrics, analysis, comparison to baselines |
| Discussion | Yes | 0.5–1 page; limitations, implications, lessons learned |
| Conclusion | Yes | 0.25–0.5 page; summary, future work |
| Bibliography | Yes | 40–80 citations typical |

**Heading Levels**: # (main sections), ## (subsections), ### (only if many subsections)

### Journal Articles (12+ pages)

Typical structure for extended journal publications (e.g., ACM Transactions, IEEE TSE):

| Section | Required | Notes |
|---------|----------|-------|
| Abstract | Yes | 200–300 words; complete problem and solution overview |
| Introduction | Yes | 2–3 pages; extensive motivation, contributions, roadmap |
| Related Work | Yes | 2–3 pages; thorough coverage of prior work |
| Methods / Methodology / System Design | Yes | 3–5 pages; sufficient detail for full reproduction |
| Evaluation / Results | Yes | 3–5 pages; multiple experiments, ablations, detailed analysis |
| Discussion | Yes | 1–2 pages; interpretation, limitations, broader impacts |
| Conclusion | Yes | 0.5–1 page; summary, future directions, open questions |
| Acknowledgments | Optional | If applicable (funding, contributors) |
| Bibliography | Yes | 100+ citations typical |

**Heading Levels**: # (main), ## (subsections), ### (sub-subsections if deep nesting)

### Workshop Papers (4–6 pages)

Typical structure for workshop submissions (narrow scope, preliminary work):

| Section | Required | Notes |
|---------|----------|-------|
| Abstract | Yes | 75–125 words; concise problem and status |
| Introduction | Yes | Brief (0.5 page); quick context |
| Related Work | Optional | 0.25–0.5 page; can integrate into intro |
| Approach / Methodology | Yes | 1–1.5 pages; focused description |
| Preliminary Results / Status | Yes | 1–1.5 pages; initial findings or progress update |
| Discussion / Future Work | Yes | 0.5 page; next steps |
| Bibliography | Yes | 15–30 citations |

**Heading Levels**: # (main sections), ## (subsections only if necessary)

## Venue-Specific Structure Requirements

### ACM Format (SIGCHI, SIGMOD, SIGKDD, etc.)

**Typical expectations:**
- Abstract before Introduction (separate page if > 6 pages)
- Introduction → Related Work → Approach → Evaluation → Discussion → Conclusion
- Related Work often after Introduction (context first, then novelty)
- Subsections within Methods (e.g., "Data Collection", "Analysis Procedure")
- "Limitations" often as subsection of Discussion or standalone
- Acknowledgments section common (funding, participants)

**Heading conventions:**
- Use ## for main subsections within sections
- Avoid deep nesting (### rare)
- Descriptive names: "Study Design" rather than "Methodology"

**Bibliography style:** Typically numerical [1], [2], etc., or author-year (Chicago notes-bibliography)

### IEEE Format (TSE, TKDE, Access, etc.)

**Typical expectations:**
- Abstract, Introduction, Related Work in tight sequence
- "System Design" or "Technical Approach" as primary section
- Results/Evaluation as separate main section
- Conclusion brief (0.5 page)
- References (not Bibliography)

**Heading conventions:**
- Section numbers: I. Introduction, II. Related Work, III. System Design, IV. Evaluation, V. Conclusion
- Subsections numbered (A, B, C under each section)
- No deep nesting beyond two levels

**Bibliography style:** IEEE numbered citations [1], [2], etc.

### Springer LNCS Format (ECML, ICCV, CAV, etc.)

**Typical expectations:**
- Abstract, Introduction, Related Work
- Methods / Approach
- Experiments / Results
- Discussion (optional; can merge with results)
- Conclusion
- Appendices (if needed)

**Heading conventions:**
- Subsections allowed but keep shallow (no ### → #### chains)
- Descriptive section names: "Experimental Setup", "Results and Analysis"
- Capitalize main sections; sentence case for subsections

**Bibliography style:** Numbered references [1], [2], etc.

### NeurIPS / ICML Style (ML conferences)

**Typical expectations:**
- Abstract, Introduction
- Related Work often after Introduction (or integrated)
- Method / Methodology
- Experiments
- Results (detailed analysis, ablation studies)
- Discussion (brief; often merged with results)
- Conclusion + Future Work
- References

**Special features:**
- "Preliminaries" section common (notation, background)
- Ablation studies as subsection of Results
- Hyperparameter details in Appendix
- Results organized by baselines / datasets

**Heading conventions:**
- Simple, flat structure: main sections only
- Subsections as ## if needed (e.g., "3.1 Baseline Comparisons")
- No excessive nesting

## Heading Hierarchy Best Practices

### Proper Nesting Rules

```
# Main Section Title (only ONE per paper structure level)
  ## Subsection (primary subdivision)
    ### Sub-subsection (tertiary; use sparingly)
      #### Sub-sub-subsection (AVOID in academic papers)
```

**DO:** 
- Use one # per main section
- Use ## for the first level of subdivision within a section
- Use ### only when you have 3+ subsections under a ##
- Keep maximum depth at 3 levels (# → ## → ###)

**DON'T:**
- Skip levels (# → ### is wrong; insert ## in between)
- Use # for subsections
- Nest more than 3 levels deep
- Use #### or deeper in academic papers

### Heading Naming Conventions

**DO:**
- Use descriptive, specific titles: "Machine Learning Pipeline Design", not "Technical Approach"
- Use parallel structure across parallel sections: "Experiment 1", "Experiment 2", "Experiment 3"
- Use sentence case for most headings in LNCS/IEEE; title case for ACM
- Include units if relevant: "Results on MNIST Dataset" instead of just "Results"

**DON'T:**
- Use vague titles: "Methods", "System", "Implementation" (be specific)
- Mix naming styles: don't have both "3.1. Data Processing" and "3.2 algorithm details"
- Use overly long headings (>10 words)
- Use special characters or math symbols in headings (hard to parse)

### Example: Proper Heading Hierarchy

Bad:
```
# Introduction
## Background
### Motivation
#### Problem Statement
## Related Work
# Methods
### Algorithm Design
## Results
```

Good:
```
# Introduction
## Motivation
## Problem Statement
## Contributions

# Related Work
## Systems Approaches
## Machine Learning Baselines

# Methods
## Data Collection
## Feature Engineering
## Algorithm Design

# Evaluation
## Experimental Setup
## Results
## Ablation Studies

# Discussion

# Conclusion
```

## Section Flow and Transitions

### Establishing Logical Connections

**Within-section flow:**
- Start with clearest, most concrete concept
- Build toward complexity or abstraction
- Use transitional phrases: "Building on this foundation...", "As a result...", "To address this..."
- End with a forward-looking statement that bridges to next section

**Between-section transitions:**
- **Intro → Related Work:** "Prior work has explored [X], but left open [Y]. We address [Y] by..."
- **Related Work → Methods:** "Unlike prior approaches, we propose..."
- **Methods → Evaluation:** "To validate these ideas, we conducted [type of evaluation]..."
- **Evaluation → Discussion:** "These results suggest that...", "Our findings align with [prior work] because..."
- **Discussion → Conclusion:** "In summary, we have shown that..."

**Example transition sequence (full paper):**

Abstract: "We propose a novel algorithm for [problem]. Evaluation shows X% improvement."

Intro: "The core challenge is [problem]. This matters because [impact]. Prior work has done [what], but missed [gap]. We introduce [contribution]."

Related Work: "Systems like [A] and [B] address related problems. However, they assume [assumption], which limits [outcome]. Our approach differs by [key distinction]."

Methods: "To overcome these limitations, we designed [system]. The key insight is [insight]. Our pipeline has three stages: [Stage 1], [Stage 2], [Stage 3]."

Results: "We evaluated [system] on [benchmark]. Results show [finding 1], [finding 2], and [finding 3]. Compared to baselines, we achieve [comparison]."

Discussion: "These results validate our hypothesis because [reasoning]. The X% improvement over [baseline] suggests that [interpretation]. Interestingly, [observation about unexpected result]. However, [limitation]. This work contributes to the broader field by [impact]."

Conclusion: "We presented [contribution]. Our evaluation demonstrates [key finding]. Future work includes [direction 1] and [direction 2]."

## DO/DON'T Patterns for Structure

### DO

- **DO place Related Work after Introduction.** Readers need context before understanding novelty.
- **DO use subsections for long methods.** Break 5+ page Methods into "Data", "Algorithm", "Implementation" subsections.
- **DO end each section with a forward-looking or concluding statement.** Don't let sections end abruptly.
- **DO group Results by experiment type or dataset** if you have multiple experiments. Use subsections.
- **DO include a Limitations subsection in Discussion.** Transparency builds credibility.
- **DO use consistent heading capitalization throughout.** Pick Title Case or sentence case and stick to it.
- **DO cite Related Work within Introduction** to ground the problem; use Related Work section for deeper survey.
- **DO use tables/figures to break up dense Methods sections.** A table of hyperparameters is faster than prose.

### DON'T

- **DON'T put all Related Work into the Introduction.** Related Work deserves its own section.
- **DON'T bury the main contribution.** State it explicitly in Intro (often as bullet list).
- **DON'T use cryptic abbreviations in headings.** "RNN-GRU Tuning Strategies" is worse than "Hyperparameter Selection for Recurrent Networks".
- **DON'T mix narrative and results in Methods.** Methods describes what you did; Results describe what happened.
- **DON'T skip heading levels.** (# → ### violates document structure; insert ## between.)
- **DON'T use inconsistent section naming.** "Experimental Evaluation" vs. "Evaluation Setup" in the same paper is jarring.
- **DON'T add orphaned subsections.** Every ## should have at least 2–3 subsections, or merge into parent.
- **DON'T leave sections with no internal structure when they exceed 1.5 pages.** Add ## subsections for readability.

## Common Structural Anti-Patterns

### Wall of Text Methods

**Problem:** A 4-page Methods section with no subsections, no figures, no structure.

**Symptom:** Readers cannot skim or locate key details. Methods becomes a narrative slog.

**Fix:**
```
## Methods
### Data Collection
  [1 paragraph: source, size, format]
### Preprocessing
  [1 paragraph: normalization, filtering]
  [Figure 1: Pipeline diagram]
### Algorithm Design
  [Explain core insight]
  [Pseudocode or equation block]
### Implementation Details
  [Libraries, hyperparameters, reproducibility info]
```

### Results Dumping

**Problem:** The Results section lists 47 tables without interpretation or narrative thread.

**Symptom:** Readers don't know which results matter or why they're presented in this order.

**Fix:**
```
## Evaluation
### Baseline Comparison
  [1–2 sentences explaining why these baselines matter]
  [Table 1: Baseline comparison]
  [1 paragraph: Key takeaway from Table 1]

### Ablation Study
  [1 sentence: Which component are we removing?]
  [Table 2: Ablation results]
  [1 paragraph: What does this tell us?]

### Sensitivity Analysis
  [1 sentence: What parameter are we varying?]
  [Figure 2: Sensitivity plots]
  [1 paragraph: Implications]
```

### Conclusion that Repeats Abstract

**Problem:** Conclusion is a word-for-word restatement of the Abstract.

**Symptom:** Readers have learned nothing new by the end.

**Fix:**
```
## Conclusion

In this work, we proposed [contribution].
Our evaluation on [benchmarks] demonstrated [result].
This validates [hypothesis] because [reasoning].

Beyond this specific problem, our approach opens avenues for [broader implication].
Future work should explore [direction 1] and [direction 2] to address [gap].
```

### Related Work as Literature Dump

**Problem:** A wall of citations with no structure. "Smith et al. [1] studied X. Jones et al. [2] studied Y. Brown et al. [3] studied Z."

**Symptom:** Readers cannot identify the intellectual landscape or how your work positions relative to it.

**Fix:**
```
## Related Work
### Early Approaches: Static Analysis
  [2–3 sentences synthesizing early work]
  [Citations: A, B, C]

### Recent Advances: Learned Representations
  [2–3 sentences on modern approaches]
  [Citations: D, E, F]

### Open Challenges
  [1 paragraph: What gaps remain?]
  [Citations: relevant work on these gaps]

Our contribution differs from this body of work by [key distinction].
We address the limitation of [limitation] through [method].
```

## LaTeX Structure Tips

### Section and Subsection Conventions

```latex
\section{Introduction}
\label{sec:intro}
  % Avoid \subsection for short sections
  % Use only if >1.5 pages

\section{Related Work}
\label{sec:related}
  % Use \subsection to organize by topic
  \subsection{Systems Approaches}
  \label{sec:related:systems}
    % Content here
  \subsection{Learning-Based Methods}
  \label{sec:related:learning}
    % Content here

\section{Methods}
\label{sec:methods}
  \subsection{Problem Formulation}
  \label{sec:methods:formulation}
  \subsection{Algorithm Design}
  \label{sec:methods:algo}
  \subsection{Implementation}
  \label{sec:methods:impl}

\section{Evaluation}
\label{sec:eval}
  \subsection{Experimental Setup}
  \label{sec:eval:setup}
  \subsection{Main Results}
  \label{sec:eval:main}
  \subsection{Ablation Studies}
  \label{sec:eval:ablation}

\section{Discussion}
\label{sec:discussion}
  % Usually no subsections; 1 section is enough

\section{Conclusion}
\label{sec:conclusion}
  % No subsections; too short
```

### Label Naming Convention

Use hierarchical label names to make cross-references clear:

```latex
\label{sec:methods:algo}      % sec:SECTION:SUBSECTION
\label{fig:pipeline}           % fig:DESCRIPTIVE_NAME
\label{tbl:results}            % tbl:DESCRIPTIVE_NAME
\label{eq:loss_function}       % eq:DESCRIPTIVE_NAME
```

**Reference them explicitly:**
```latex
As shown in Figure~\ref{fig:pipeline} and Table~\ref{tbl:results},
the algorithm (Eq.~\ref{eq:loss_function}) outperforms baselines
as detailed in Section~\ref{sec:eval:main}.
```

### Enforcing Consistency

Use a preamble macro to standardize heading usage:

```latex
\newcommand{\sechead}[1]{\section{#1}}
\newcommand{\subsechead}[1]{\subsection{#1}}
```

And enforce: "Never use \subsubsection; use \subsection for all subdivisions."

## Quick Reference: Paper Structure Template

### 8–12 Page Conference Paper Template

```
Abstract (150–250 words)

1. Introduction (1–2 pages)
   1.1 Motivation
   1.2 Problem Statement
   1.3 Contributions (bulleted)

2. Related Work (1–1.5 pages)
   2.1 [Topic 1: e.g., Systems Approaches]
   2.2 [Topic 2: e.g., Learning Methods]

3. Methods (2–3 pages)
   3.1 Problem Formulation
   3.2 Proposed Approach
   3.3 Implementation Details

4. Evaluation (2–3 pages)
   4.1 Experimental Setup
   4.2 Baseline Comparisons
   4.3 Ablation Studies

5. Discussion (0.5–1 page)
   5.1 Key Findings
   5.2 Limitations

6. Conclusion (0.25–0.5 page)

References
```

### Journal Paper Template (12+ pages)

```
Abstract (200–300 words)

1. Introduction (2–3 pages)
   1.1 Motivation and Context
   1.2 Problem Statement
   1.3 Key Contributions
   1.4 Organization of Paper

2. Related Work (2–3 pages)
   2.1 [Subtopic 1]
   2.2 [Subtopic 2]
   2.3 [Subtopic 3]
   Positioning relative to prior work

3. Methods (3–5 pages)
   3.1 Preliminaries / Notation
   3.2 Problem Formulation
   3.3 Proposed Method
   3.4 Theoretical Analysis (if applicable)
   3.5 Implementation and Reproducibility

4. Evaluation (3–5 pages)
   4.1 Experimental Setup
   4.2 Baseline Systems
   4.3 Quantitative Results
   4.4 Qualitative Analysis
   4.5 Ablation and Sensitivity Studies

5. Discussion (1–2 pages)
   5.1 Interpretation of Results
   5.2 Broader Impact and Implications
   5.3 Limitations and Threats to Validity

6. Conclusion (0.5–1 page)
   6.1 Summary of Contributions
   6.2 Future Directions
   6.3 Open Questions

Acknowledgments (if applicable)
References
Appendices (if needed)
```

## Guidelines

- **Structural rigor**: Academic papers follow a standard format; deviations should be flagged
- **Light dependencies**: Only use `depends_on` for true sequential dependencies (e.g., can't check "TOC matches sections" if sections aren't defined yet)
- **Completeness**: Every standard section must be present; missing = critical
- **Hierarchy**: Heading levels matter for readability and document generation; enforce consistency
- **Venue awareness**: Different venues (ACM, IEEE, NeurIPS) have slightly different expectations; note deviations
- **Section balance**: Long, dense sections (>3 pages) should be subdivided; short sections (<0.5 page) may be too thin
- **Flow and transitions**: Sections should connect logically with explicit transitions, not jump abruptly
