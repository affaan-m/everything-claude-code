# Research Poster Content Guide

## Overview

Content is king in research posters. This guide covers writing strategies, section-specific guidance, visual-text balance, and best practices for communicating research effectively in poster format.

## Core Content Principles

### 1. The 3-5 Minute Rule

**Reality**: Most viewers spend 3-5 minutes at your poster
- **1 minute**: Scanning from distance (title, figures)
- **2-4 minutes**: Reading key points up close
- **5+ minutes**: Engaged conversation (if interested)

**Design Implication**: Poster must work at three levels:
1. **Distance view** (6-10 feet): Title and main figure visible
2. **Browse view** (3-6 feet): Section headers and key results readable
3. **Detail view** (1-3 feet): Full content accessible

### 2. Tell a Story, Not a Paper

**Poster ≠ Condensed Paper**

**Paper approach** (❌):
- Comprehensive literature review
- Detailed methodology
- All results presented
- Lengthy discussion
- 50+ references

**Poster approach** (✅):
- One sentence background
- Visual methods diagram
- 3-5 key results
- 3-4 bullet point conclusions
- 5-10 key references

**Story Arc for Posters**:
```
Hook (Problem) → Approach → Discovery → Impact
```

**Example**:
- **Hook**: "Antibiotic resistance threatens millions of lives annually"
- **Approach**: "We developed an AI system to predict resistance patterns"
- **Discovery**: "Our model achieves 87% accuracy, 20% better than existing methods"
- **Impact**: "Could reduce treatment failures by identifying resistance earlier"

### 3. The 800-Word Maximum

**Word Count Guidelines**:
- **Ideal**: 300-500 words
- **Maximum**: 800 words
- **Hard limit**: 1000 words (beyond this, poster is unreadable)

**Word Budget by Section**:
| Section | Word Count | % of Total |
|---------|-----------|------------|
| Introduction/Background | 50-100 | 15% |
| Methods | 100-150 | 25% |
| Results (text) | 100-200 | 25% |
| Discussion/Conclusions | 100-150 | 25% |
| References/Acknowledgments | 50-100 | 10% |

**Counting Tool**:
```latex
% Add word count to poster (remove for final)
\usepackage{texcount}
% Compile with: texcount -inc poster.tex
```

### 4. Visual-to-Text Ratio

**Optimal Balance**: 40-50% visual content, 50-60% text+white space

**Visual Content Includes**:
- Figures and graphs
- Photos and images
- Diagrams and flowcharts
- Icons and symbols
- Color blocks and design elements

**Too Text-Heavy** (❌):
- Wall of text
- Small figures
- Intimidating to viewers
- Low engagement

**Well-Balanced** (✅):
- Clear figures dominate
- Text supports visuals
- Easy to scan
- Inviting appearance

## Section-Specific Content Guidance

### Title

**Purpose**: Capture attention, convey topic, establish credibility

**Characteristics of Effective Titles**:
- **Concise**: 10-15 words maximum
- **Descriptive**: Clearly states research topic
- **Active**: Uses strong verbs when possible
- **Specific**: Avoids vague terms
- **Jargon-aware**: Balances field-specific terms with accessibility

**Title Formulas**:

**1. Descriptive**:
```
[Method/Approach] for [Problem/Application]

Example: "Deep Learning for Early Detection of Alzheimer's Disease"
```

**2. Question**:
```
[Research Question]?

Example: "Can Microbiome Diversity Predict Treatment Response?"
```

**3. Assertion**:
```
[Finding] in [Context]

Example: "Novel Mechanism Identified in Drug Resistance Pathways"
```

**4. Colon Format**:
```
[Topic]: [Specific Approach/Finding]

Example: "Urban Heat Islands: A Machine Learning Framework for Mitigation"
```

**Avoid**:
- ❌ Generic titles: "A Study of X"
- ❌ Overly cute or clever wordplay (confuses message)
- ❌ Excessive jargon: "Utilization of CRISPR-Cas9..."
- ❌ Unnecessarily long: "Investigation of the potential role of..."

**LaTeX Title Formatting**:
```latex
% Emphasize key words with bold
\title{Deep Learning for \textbf{Early Detection} of Alzheimer's Disease}

% Two-line titles for long names
\title{Machine Learning Framework for\\Urban Heat Island Mitigation}

% Avoid ALL CAPS (harder to read)
```

### Authors and Affiliations

**Best Practices**:
- **Presenting author**: Bold, underline, or asterisk
- **Corresponding author**: Include email
- **Affiliations**: Superscript numbers or symbols
- **Institutional logos**: 2-4 maximum

**Format Examples**:
```latex
% Simple format
\author{\textbf{Jane Smith}\textsuperscript{1}, John Doe\textsuperscript{2}}
\institute{
  \textsuperscript{1}University of Example, 
  \textsuperscript{2}Research Institute
}

% With contact
\author{Jane Smith\textsuperscript{1,*}}
\institute{
  \textsuperscript{1}Department, University\\
  \textsuperscript{*}jane.smith@university.edu
}
```

### Introduction/Background

**Purpose**: Establish context, motivate research, state objective

**Structure** (50-100 words):
1. **Problem statement** (1-2 sentences): What's the issue?
2. **Knowledge gap** (1-2 sentences): What's unknown/unsolved?
3. **Research objective** (1 sentence): What did you do?

**Example** (95 words):
```
Antibiotic resistance causes 700,000 deaths annually, projected to reach 
10 million by 2050. Current diagnostic methods require 48-72 hours, 
delaying appropriate treatment. Machine learning offers potential for 
rapid resistance prediction, but existing models lack generalizability 
across bacterial species. 

We developed a transformer-based deep learning model to predict antibiotic 
resistance from genomic sequences across multiple pathogen species. Our 
approach integrates evolutionary information and protein structure to 
improve cross-species accuracy.
```

**Visual Support**:
- Conceptual diagram showing problem
- Infographic with statistics
- Image of application context

**Common Mistakes**:
- ❌ Extensive literature review
- ❌ Too much background detail
- ❌ Undefined acronyms at first use
- ❌ Missing clear objective statement

### Methods

**Purpose**: Describe approach sufficiently for understanding (not replication)

**Key Question**: "How did you do it?" not "How could someone else replicate it?"

**Content Strategy**:
- **Prioritize**: Visual methods diagram > text description
- **Include**: Study design, key procedures, analysis approach
- **Omit**: Detailed protocols, routine procedures, specific reagent details

**Visual Methods (Highly Recommended)**:
```latex
% Flowchart of study design
\begin{tikzpicture}[node distance=2cm]
  \node (start) [box] {Data Collection\\n=1,000 samples};
  \node (process) [box, below of=start] {Preprocessing\\Quality Control};
  \node (analysis) [box, below of=process] {Statistical Analysis\\Mixed Models};
  \node (end) [box, below of=analysis] {Validation\\Independent Cohort};
  
  \draw [arrow] (start) -- (process);
  \draw [arrow] (process) -- (analysis);
  \draw [arrow] (analysis) -- (end);
\end{tikzpicture}
```

**Text Methods** (50-150 words):

**For Experimental Studies**:
```
Methods
• Study design: Randomized controlled trial (n=200)
• Participants: Adults aged 18-65 with Type 2 diabetes
• Intervention: 12-week exercise program vs. standard care
• Outcomes: HbA1c (primary), insulin sensitivity (secondary)
• Analysis: Linear mixed models, intention-to-treat
```

**For Computational Studies**:
```
Methods
• Dataset: 10,000 labeled images from ImageNet
• Architecture: ResNet-50 with custom attention mechanism
• Training: 100 epochs, Adam optimizer, learning rate 0.001
• Validation: 5-fold cross-validation
• Comparison: Baseline CNN, VGG-16, Inception-v3
```

**Format Options**:
- **Bullet points**: Quick scanning (recommended)
- **Numbered list**: Sequential procedures
- **Diagram + brief text**: Ideal combination
- **Table**: Multiple conditions or parameters

### Results

**Purpose**: Present key findings visually and clearly

**Golden Rule**: Show, don't tell

**Content Allocation**:
- **Figures**: 70-80% of Results section
- **Text**: 20-30% (brief descriptions, statistics)

**How Many Results**:
- **Ideal**: 3-5 main findings
- **Maximum**: 6-7 distinct results
- **Focus**: Primary outcomes, most impactful findings

**Figure Selection Criteria**:
1. Does it support the main message?
2. Is it self-explanatory with caption?
3. Can it be understood in 10 seconds?
4. Does it add information beyond text?

**Figure Captions**:
- **Descriptive**: Explain what is shown
- **Standalone**: Understandable without reading full poster
- **Statistical**: Include significance indicators, sample sizes
- **Concise**: 1-3 sentences

**Example Caption**:
```latex
\caption{Treatment significantly improved outcomes. 
Mean±SD shown for control (blue, n=45) and treatment (orange, n=47) groups. 
**p<0.01, ***p<0.001 (two-tailed t-test).}
```

**Text Support for Results** (100-200 words):
- State main finding per figure
- Include key statistics
- Note trends or patterns
- Avoid detailed interpretation (save for Discussion)

**Example Results Text**:
```
Key Findings
• Model achieved 87% accuracy on test set (vs. 73% baseline)
• Performance consistent across 5 bacterial species (p<0.001)
• Prediction speed: <30 seconds per isolate
• Feature importance: protein structure (42%), sequence (35%), 
  evolutionary conservation (23%)
```

**Data Presentation Formats**:

**1. Bar Charts**: Comparing categories
```latex
\begin{tikzpicture}
  \begin{axis}[
    ybar,
    ylabel=Accuracy (\%),
    symbolic x coords={Baseline, Model A, Our Method},
    xtick=data,
    nodes near coords
  ]
  \addplot coordinates {(Baseline,73) (Model A,81) (Our Method,87)};
  \end{axis}
\end{tikzpicture}
```

**2. Line Graphs**: Trends over time
**3. Scatter Plots**: Correlations
**4. Heatmaps**: Matrix data, clustering
**5. Box Plots**: Distributions, comparisons
**6. ROC Curves**: Classification performance

### Discussion/Conclusions

**Purpose**: Interpret findings, state implications, acknowledge limitations

**Structure** (100-150 words):

**1. Main Conclusions** (50-75 words):
- 3-5 bullet points
- Clear, specific takeaways
- Linked to research objectives

**Example**:
```
Conclusions
• First cross-species model for antibiotic resistance prediction 
  achieving >85% accuracy
• Protein structure integration critical for generalizability 
  (improved accuracy by 14%)
• Prediction speed enables clinical decision support within 
  consultation timeframe
• Potential to reduce inappropriate antibiotic use by 20-30%
```

**2. Limitations** (25-50 words, optional but recommended):
- Acknowledge key constraints
- Brief, honest
- Shows scientific rigor

**Example**:
```
Limitations
• Training data limited to 5 bacterial species
• Requires genomic sequencing (not widely available)
• Validation needed in prospective clinical trials
```

**3. Future Directions** (25-50 words, optional):
- Next steps
- Broader implications
- Call to action

**Example**:
```
Next Steps
• Expand to 20+ additional species
• Develop point-of-care sequencing integration
• Launch multi-center clinical validation study (2025)
```

**Avoid**:
- ❌ Overstating findings: "This revolutionary breakthrough..."
- ❌ Extensive comparison to other work
- ❌ New results in Discussion
- ❌ Vague conclusions: "Further research is needed"

### References

**How Many**: 5-10 key citations

**Selection Criteria**:
- Include seminal work in the field
- Recent relevant studies (last 5 years)
- Methods cited in your poster
- Controversial claims that need support

**Format**: Abbreviated, consistent style

**Examples**:

**Numbered (Vancouver)**:
```
References
1. Smith et al. (2023). Nature. 615:234-240.
2. Jones & Lee (2024). Science. 383:112-118.
3. Chen et al. (2022). Cell. 185:456-470.
```

**Author-Year (APA)**:
```
References
Smith, J. et al. (2023). Title. Nature, 615, 234-240.
Jones, A., & Lee, B. (2024). Title. Science, 383, 112-118.
```

**Minimal (For Space Constraints)**:
```
Key References: Smith (Nature 2023), Jones (Science 2024), 
Chen (Cell 2022). Full bibliography: [QR Code]
```

**Alternative**: QR code linking to full reference list

### Acknowledgments

**Include**:
- Funding sources (with grant numbers)
- Major collaborators
- Core facilities used
- Dataset sources

**Format** (25-50 words):
```
Acknowledgments
Funded by NIH Grant R01-123456 and NSF Award 7890123. 
We thank Dr. X for data access, the Y Core Facility for 
sequencing, and Z for helpful discussions.
```

### Contact Information

**Essential Elements**:
- Name of presenting/corresponding author
- Email address
- Optional: Lab website, Twitter/X, LinkedIn, ORCID

**Format**:
```
Contact: Jane Smith, jane.smith@university.edu
Lab: smithlab.university.edu | Twitter: @smithlab
```

**QR Code Alternative**:
- Link to personal/lab website
- Link to paper preprint/publication
- Link to code repository (GitHub)
- Link to supplementary materials

## Writing Style for Posters

### Active vs. Passive Voice

**Prefer Active Voice** (more engaging, clearer):
- ✅ "We developed a model..."
- ✅ "The treatment reduced symptoms..."

**Passive Voice** (when appropriate):
- ✅ "Samples were collected from..."
- ✅ "Data were analyzed using..."

### Sentence Length

**Keep Sentences Short**:
- **Ideal**: 10-15 words per sentence
- **Maximum**: 20-25 words
- **Avoid**: >30 words (hard to follow)

**Example Revision**:
- ❌ Long: "We performed a comprehensive analysis of gene expression data from 500 patients with colorectal cancer using RNA sequencing and identified 47 differentially expressed genes associated with treatment response." (31 words)
- ✅ Short: "We analyzed RNA sequencing data from 500 colorectal cancer patients. We identified 47 genes associated with treatment response." (19 words total, two sentences)

### Bullet Points vs. Paragraphs

**Use Bullet Points For**:
- ✅ Lists of items or findings
- ✅ Key conclusions
- ✅ Methods steps
- ✅ Study characteristics

**Use Short Paragraphs For**:
- ✅ Narrative flow (Introduction)
- ✅ Complex explanations
- ✅ Connected ideas

**Bullet Point Best Practices**:
- Start with action verbs or nouns
- Parallel structure throughout list
- 3-7 bullets per list (not too many)
- Brief (1-2 lines each)

**Example**:
```
Methods
• Participants: 200 adults (18-65 years)
• Design: Double-blind RCT (12 weeks)
• Intervention: Daily 30-min exercise
• Control: Standard care
• Analysis: Mixed models (SPSS v.28)
```

### Acronyms and Jargon

**First Use Rule**: Define at first appearance
```
We used machine learning (ML) to analyze... Later, ML predicted...
```

**Common Acronyms**: May not need definition if universal to field
- DNA, RNA, MRI, CT, PCR (in biomedical context)
- AI, ML, CNN (in computer science context)

**Avoid Excessive Jargon**:
- ❌ "Utilized" → ✅ "Used"
- ❌ "Implement utilization of" → ✅ "Use"
- ❌ "A majority of" → ✅ "Most"

### Numbers and Statistics

**Present Statistics Clearly**:
- Always include measure of variability (SD, SE, CI)
- Report sample sizes: n=50
- Indicate significance: p<0.05, p<0.01, p<0.001
- Use symbols consistently: * for p<0.05, ** for p<0.01

**Format Numbers**:
- Round appropriately (avoid false precision)
- Use consistent decimal places
- Include units: 25 mg/dL, 37°C
- Large numbers: 1,000 or 1000 (be consistent)

**Example**:
```
Treatment increased response by 23.5% (95% CI: 18.2-28.8%, p<0.001, n=150)
```

## Visual-Text Integration

### Figure-Text Relationship

**Figure First, Text Second**:
1. Design poster around key figures
2. Add text to support and explain visuals
3. Ensure figures can stand alone

**Text Placement Relative to Figures**:
- **Above**: Context, "What you're about to see"
- **Below**: Explanation, statistics, caption
- **Beside**: Comparison, interpretation

### Callouts and Annotations

**On-Figure Annotations**:
```latex
\begin{tikzpicture}
  \node[inner sep=0] (img) {\includegraphics[width=10cm]{figure.pdf}};
  \draw[->, thick, red] (8,5) -- (6,3) node[left] {Key region};
  \draw[red, thick] (3,2) circle (1cm) node[above=1.2cm] {Anomaly};
\end{tikzpicture}
```

**Callout Boxes**:
```latex
\begin{tcolorbox}[colback=yellow!10, colframe=orange!80, 
                  title=Key Finding]
Our method reduces errors by 34\% compared to state-of-the-art.
\end{tcolorbox}
```

### Icons for Section Headers

**Visual Section Markers**:
```latex
\usepackage{fontawesome5}

\block{\faFlask~Introduction}{...}
\block{\faCog~Methods}{...}
\block{\faChartBar~Results}{...}
\block{\faLightbulb~Conclusions}{...}
```

## Content Adaptation Strategies

### From Paper to Poster

**Condensation Process**:

**1. Identify Core Message** (The Elevator Pitch):
- What's the one thing you want people to remember?
- If you had 30 seconds, what would you say?

**2. Select Key Results**:
- Choose 3-5 most impactful findings
- Omit supporting/secondary results
- Focus on figures with strong visual impact

**3. Simplify Methods**:
- Visual flowchart > text description
- Omit routine procedures
- Include only essential parameters

**4. Trim Literature Review**:
- One sentence background
- One sentence gap/motivation
- One sentence your contribution

**5. Condense Discussion**:
- Main conclusions only
- Brief limitations
- One sentence future direction

### For Different Audiences

**Specialist Audience** (Same Field):
- Can use field-specific jargon
- Less background needed
- Focus on novel methodology
- Emphasize nuanced findings

**General Scientific Audience**:
- Define key terms
- More context/background
- Broader implications
- Visual metaphors helpful

**Public/Lay Audience**:
- Minimal jargon, all defined
- Extensive context
- Real-world applications
- Analogies and simple language

**Example Adaptation**:

**Specialist**: "CRISPR-Cas9 knockout of BRCA1 induced synthetic lethality with PARP inhibitors"

**General**: "We used gene editing to make cancer cells vulnerable to existing drugs"

**Public**: "We found a way to make cancer treatments work better by targeting specific genetic weaknesses"

## Quality Control Checklist

### Content Review

**Clarity**:
- [ ] Main message immediately clear
- [ ] All acronyms defined
- [ ] Sentences short and direct
- [ ] No unnecessary jargon

**Completeness**:
- [ ] Research question/objective stated
- [ ] Methods sufficiently described
- [ ] Key results presented
- [ ] Conclusions drawn
- [ ] Limitations acknowledged

**Accuracy**:
- [ ] All statistics correct
- [ ] Figure captions accurate
- [ ] References properly cited
- [ ] No overstated claims

**Engagement**:
- [ ] Compelling title
- [ ] Visual interest
- [ ] Clear take-home message
- [ ] Conversation starters

### Readability Testing

**Distance Test**:
- Print at 25% scale
- View from 2-3 feet (simulates 8-12 feet for full poster)
- Can you read: Title? Section headers? Body text?

**Scan Test**:
- Give poster to colleague for 30 seconds
- Ask: "What is this poster about?"
- They should identify: Topic, approach, main finding

**Detail Test**:
- Ask colleague to read poster thoroughly (5 min)
- Ask: "What are the key conclusions?"
- Verify understanding matches your intent

## Common Content Mistakes

**1. Too Much Text**
- ❌ >1000 words
- ❌ Long paragraphs
- ❌ Full paper condensed
- ✅ 300-800 words, bullet points, key findings only

**2. Unclear Message**
- ❌ Multiple unrelated findings
- ❌ No clear conclusion
- ❌ Vague implications
- ✅ 1-3 main points, explicit conclusions

**3. Methods Overkill**
- ❌ Detailed protocols
- ❌ All parameters listed
- ❌ Routine procedures described
- ✅ Visual flowchart, key details only

**4. Poor Figure Integration**
- ❌ Figures without context
- ❌ Unclear captions
- ❌ Text doesn't reference figures
- ✅ Figures central, well-captioned, text integrated

**5. Missing Context**
- ❌ No background
- ❌ Undefined acronyms
- ❌ Assumes expert knowledge
- ✅ Brief context, definitions, accessible to broader audience

## Conclusion

Effective poster content:
- **Concise**: 300-800 words maximum
- **Visual**: 40-50% figures and graphics
- **Clear**: One main message, 3-5 key findings
- **Engaging**: Compelling story, not just facts
- **Accessible**: Appropriate for target audience
- **Actionable**: Clear implications and next steps

Remember: Your poster is a conversation starter, not a comprehensive treatise. Design content to intrigue, engage, and invite discussion.

