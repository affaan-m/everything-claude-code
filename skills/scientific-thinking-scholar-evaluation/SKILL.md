---
name: scholar-evaluation
description: Systematic framework for evaluating scholarly and research work based on the ScholarEval methodology. This skill should be used when assessing research papers, evaluating literature reviews, scoring research methodologies, analyzing scientific writing quality, or applying structured evaluation criteria to academic work. Provides comprehensive assessment across multiple dimensions including problem formulation, literature review, methodology, data collection, analysis, results interpretation, and scholarly writing quality.
---

# Scholar Evaluation

## Overview

Apply the ScholarEval framework to systematically evaluate scholarly and research work. This skill provides structured evaluation methodology based on peer-reviewed research assessment criteria, enabling comprehensive analysis of academic papers, research proposals, literature reviews, and scholarly writing across multiple quality dimensions.

## When to Use This Skill

Use this skill when:
- Evaluating research papers for quality and rigor
- Assessing literature review comprehensiveness and quality
- Reviewing research methodology design
- Scoring data analysis approaches
- Evaluating scholarly writing and presentation
- Providing structured feedback on academic work
- Benchmarking research quality against established criteria

## Evaluation Workflow

### Step 1: Initial Assessment and Scope Definition

Begin by identifying the type of scholarly work being evaluated and the evaluation scope:

**Work Types:**
- Full research paper (empirical, theoretical, or review)
- Research proposal or protocol
- Literature review (systematic, narrative, or scoping)
- Thesis or dissertation chapter
- Conference abstract or short paper

**Evaluation Scope:**
- Comprehensive (all dimensions)
- Targeted (specific aspects like methodology or writing)
- Comparative (benchmarking against other work)

Ask the user to clarify if the scope is ambiguous.

### Step 2: Dimension-Based Evaluation

Systematically evaluate the work across the ScholarEval dimensions. For each applicable dimension, assess quality, identify strengths and weaknesses, and provide scores where appropriate.

Refer to `references/evaluation_framework.md` for detailed criteria and rubrics for each dimension.

**Core Evaluation Dimensions:**

1. **Problem Formulation & Research Questions**
   - Clarity and specificity of research questions
   - Theoretical or practical significance
   - Feasibility and scope appropriateness
   - Novelty and contribution potential

2. **Literature Review**
   - Comprehensiveness of coverage
   - Critical synthesis vs. mere summarization
   - Identification of research gaps
   - Currency and relevance of sources
   - Proper contextualization

3. **Methodology & Research Design**
   - Appropriateness for research questions
   - Rigor and validity
   - Reproducibility and transparency
   - Ethical considerations
   - Limitations acknowledgment

4. **Data Collection & Sources**
   - Quality and appropriateness of data
   - Sample size and representativeness
   - Data collection procedures
   - Source credibility and reliability

5. **Analysis & Interpretation**
   - Appropriateness of analytical methods
   - Rigor of analysis
   - Logical coherence
   - Alternative explanations considered
   - Results-claims alignment

6. **Results & Findings**
   - Clarity of presentation
   - Statistical or qualitative rigor
   - Visualization quality
   - Interpretation accuracy
   - Implications discussion

7. **Scholarly Writing & Presentation**
   - Clarity and organization
   - Academic tone and style
   - Grammar and mechanics
   - Logical flow
   - Accessibility to target audience

8. **Citations & References**
   - Citation completeness
   - Source quality and appropriateness
   - Citation accuracy
   - Balance of perspectives
   - Adherence to citation standards

### Step 3: Scoring and Rating

For each evaluated dimension, provide:

**Qualitative Assessment:**
- Key strengths (2-3 specific points)
- Areas for improvement (2-3 specific points)
- Critical issues (if any)

**Quantitative Scoring (Optional):**
Use a 5-point scale where applicable:
- 5: Excellent - Exemplary quality, publishable in top venues
- 4: Good - Strong quality with minor improvements needed
- 3: Adequate - Acceptable quality with notable areas for improvement
- 2: Needs Improvement - Significant revisions required
- 1: Poor - Fundamental issues requiring major revision

To calculate aggregate scores programmatically, use `scripts/calculate_scores.py`.

### Step 4: Synthesize Overall Assessment

Provide an integrated evaluation summary:

1. **Overall Quality Assessment** - Holistic judgment of the work's scholarly merit
2. **Major Strengths** - 3-5 key strengths across dimensions
3. **Critical Weaknesses** - 3-5 primary areas requiring attention
4. **Priority Recommendations** - Ranked list of improvements by impact
5. **Publication Readiness** (if applicable) - Assessment of suitability for target venues

### Step 5: Provide Actionable Feedback

Transform evaluation findings into constructive, actionable feedback:

**Feedback Structure:**
- **Specific** - Reference exact sections, paragraphs, or page numbers
- **Actionable** - Provide concrete suggestions for improvement
- **Prioritized** - Rank recommendations by importance and feasibility
- **Balanced** - Acknowledge strengths while addressing weaknesses
- **Evidence-based** - Ground feedback in evaluation criteria

**Feedback Format Options:**
- Structured report with dimension-by-dimension analysis
- Annotated comments mapped to specific document sections
- Executive summary with key findings and recommendations
- Comparative analysis against benchmark standards

### Step 6: Contextual Considerations

Adjust evaluation approach based on:

**Stage of Development:**
- Early draft: Focus on conceptual and structural issues
- Advanced draft: Focus on refinement and polish
- Final submission: Comprehensive quality check

**Purpose and Venue:**
- Journal article: High standards for rigor and contribution
- Conference paper: Balance novelty with presentation clarity
- Student work: Educational feedback with developmental focus
- Grant proposal: Emphasis on feasibility and impact

**Discipline-Specific Norms:**
- STEM fields: Emphasis on reproducibility and statistical rigor
- Social sciences: Balance quantitative and qualitative standards
- Humanities: Focus on argumentation and scholarly interpretation

## Resources

### references/evaluation_framework.md

Detailed evaluation criteria, rubrics, and quality indicators for each ScholarEval dimension. Load this reference when conducting evaluations to access specific assessment guidelines and scoring rubrics.

Search patterns for quick access:
- "Problem Formulation criteria"
- "Literature Review rubric"
- "Methodology assessment"
- "Data quality indicators"
- "Analysis rigor standards"
- "Writing quality checklist"

### scripts/calculate_scores.py

Python script for calculating aggregate evaluation scores from dimension-level ratings. Supports weighted averaging, threshold analysis, and score visualization.

Usage:
```python
python scripts/calculate_scores.py --scores <dimension_scores.json> --output <report.txt>
```

## Best Practices

1. **Maintain Objectivity** - Base evaluations on established criteria, not personal preferences
2. **Be Comprehensive** - Evaluate all applicable dimensions systematically
3. **Provide Evidence** - Support assessments with specific examples from the work
4. **Stay Constructive** - Frame weaknesses as opportunities for improvement
5. **Consider Context** - Adjust expectations based on work stage and purpose
6. **Document Rationale** - Explain the reasoning behind assessments and scores
7. **Encourage Strengths** - Explicitly acknowledge what the work does well
8. **Prioritize Feedback** - Focus on high-impact improvements first

## Example Evaluation Workflow

**User Request:** "Evaluate this research paper on machine learning for drug discovery"

**Response Process:**
1. Identify work type (empirical research paper) and scope (comprehensive evaluation)
2. Load `references/evaluation_framework.md` for detailed criteria
3. Systematically assess each dimension:
   - Problem formulation: Clear research question about ML model performance
   - Literature review: Comprehensive coverage of recent ML and drug discovery work
   - Methodology: Appropriate deep learning architecture with validation procedures
   - [Continue through all dimensions...]
4. Calculate dimension scores and overall assessment
5. Synthesize findings into structured report highlighting:
   - Strong methodology and reproducible code
   - Needs more diverse dataset evaluation
   - Writing could improve clarity in results section
6. Provide prioritized recommendations with specific suggestions

## Notes

- Evaluation rigor should match the work's purpose and stage
- Some dimensions may not apply to all work types (e.g., data collection for purely theoretical papers)
- Cultural and disciplinary differences in scholarly norms should be considered
- This framework complements, not replaces, domain-specific expertise

## Citation

This skill is based on the ScholarEval framework introduced in:

**Moussa, H. N., Da Silva, P. Q., Adu-Ampratwum, D., East, A., Lu, Z., Puccetti, N., Xue, M., Sun, H., Majumder, B. P., & Kumar, S. (2025).** _ScholarEval: Research Idea Evaluation Grounded in Literature_. arXiv preprint arXiv:2510.16234. [https://arxiv.org/abs/2510.16234](https://arxiv.org/abs/2510.16234)

**Abstract:** ScholarEval is a retrieval augmented evaluation framework that assesses research ideas based on two fundamental criteria: soundness (the empirical validity of proposed methods based on existing literature) and contribution (the degree of advancement made by the idea across different dimensions relative to prior research). The framework achieves significantly higher coverage of expert-annotated evaluation points and is consistently preferred over baseline systems in terms of evaluation actionability, depth, and evidence support.
