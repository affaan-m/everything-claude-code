# Taiwan NSTC (National Science and Technology Council) Proposal Guidelines

> ⚠️ **IMPORTANT DISCLAIMER**: This guide is based on publicly available information and general academic writing principles. **Always consult the official NSTC website and your specific program's solicitation for the most accurate and up-to-date requirements.** Requirements may vary by field, program type, and year.

## Overview

**Official Name**: 國家科學及技術委員會 (National Science and Technology Council, NSTC)  
**Former Name**: 科技部 (Ministry of Science and Technology, MOST)  
**Official Website**: https://www.nstc.gov.tw/

**Mission**: Advance Taiwan's scientific and technological development through research funding, with emphasis on scientific breakthrough, industrial application, and societal impact.

---

## CM03: Research Proposal Content (研究計畫內容)

CM03 is the core technical document of your NSTC proposal. It is officially titled "Contents of Grant Proposal" (計畫書本文).

### Official Format Requirements

Based on official NSTC documentation:

**Paper Size**: A4 (29.7 cm × 21 cm)

**Font**:
- Chinese: PMingLiU (新細明體) or BiauKai (標楷體)
- English: Times New Roman or Arial
- Size: 12-point minimum

**Spacing**: Single space for English; no extra spacing between lines for Chinese

**Page Limits** (varies by field and program type):
- **Humanities**: Individual 1-year: 30 pages; Multi-year: 45 pages
- **Engineering**: Individual 1-year: 20 pages; Multi-year: 25 pages
- **Natural Sciences**: Individual: 30 pages; Integrated: 45 pages
- **Life Sciences**: Individual: 25 pages
- **⚠️ CRITICAL**: Page limits include references and figures. Exceeding limits may result in automatic rejection.

**File Format**: PDF recommended for submission

---

## Required Content Sections

Based on official CM03 templates, the proposal must include:

### 1. Abstract (摘要)

**Requirements**:
- **Chinese abstract**: Maximum 500 characters
- **English abstract**: Maximum 500 words
- **Keywords**: 3-5 keywords in both languages

**Content**:
- Research background and problem statement
- Research objectives
- Key methods and approaches
- Expected outcomes and impact

### 2. Research Background and Objectives (研究計畫之背景及目的)

**Required Elements**:
- Problem statement and significance
- Research originality and innovation
- Expected impact
- Review of domestic and international related research
- Important references with critical evaluation
- **For continuing projects**: Progress from previous year

### 3. Research Methods, Steps, and Timeline (研究方法、進行步驟及執行進度)

**Required Elements**:
- Research principles and methodology
- Justification for chosen methods
- Innovative aspects of the approach
- Anticipated problems and solutions
- Equipment and instrumentation needs
- **For international travel**: Justification and expected benefits
- **Timeline**: Year-by-year breakdown of activities

### 4. Expected Outcomes (預期完成之工作項目及成果)

**Required Elements**:
- Expected research tasks (by year)
- Personnel training plans
- Expected outputs:
  - Journal articles (specify target journals)
  - Conference papers
  - Patents
  - Technology transfer
  - Other deliverables

---

## 114年度 (2025) Application Requirements

Based on official announcements:

**Application Method**: Fully online through NSTC Academic Research Service Network (學術研發服務網)

**Project Start Date**: Most projects begin August 1, 2025 (114年8月1日)

**Academic Ethics Requirement**:
- First-time applicants and first-time participants must complete **at least 6 hours** of academic ethics training within 3 years before submission
- Must provide certification

**Thesis Disclosure**:
- If proposal content involves student theses supervised by the PI, it must be clearly disclosed or cited
- Already published work (including student theses) should not be hidden as new research content

---

## Budget Categories (經費編列)

Based on official guidelines:

**Personnel (人事費)**:
- Postdoctoral researchers
- Research assistants
- Part-time staff
- **Note**: PI salary typically not allowed

**Equipment (設備費)**:
- Items exceeding NT$10,000 with service life > 2 years
- Items exceeding NT$200,000 may require price appraisal

**Consumables (耗材費)**:
- Lab supplies, reagents, software licenses

**Travel (差旅費)**:
- Domestic and international conferences
- Research collaborations

**Other (其他費用)**:
- Publication fees, data collection, outsourcing

---

## Review Criteria

**Note**: Specific scoring weights are not publicly disclosed by NSTC. The following are general evaluation dimensions based on academic practice:

1. **Innovation (創新性)**: Novelty of concept and approach
2. **Feasibility (可行性)**: Methodology soundness and preliminary data
3. **PI Capability (主持人研究能力)**: Track record and expertise
4. **Value (價值)**: Academic contribution and societal/industrial impact

---

## Official Resources

**NSTC Website**: https://www.nstc.gov.tw/

**Application System**: Access through "學術研發服務網" (Academic Research Service Network)

**Help Desk**:
- Computer/System Issues: 0800-212-058 or (02)2737-7592
- Regulation Questions: (02)2737-7440, 7568, 7847, 7980, 8010

**Important**: Always download the latest application forms and guidelines from the official NSTC website under "專題研究計畫專區" (Research Project Area).

### LaTeX Templates

For those who prefer LaTeX for proposal writing, there are excellent community-contributed templates available:

#### Official CTAN Package (Recommended)

**nstc-proposal** - Professional LaTeX classes for NSTC proposals:
- **GitHub**: https://github.com/L-TChen/nstc-proposal
- **CTAN**: Available via `tlmgr install nstc-proposal`
- **Supports**: Both CM03 and CM302 (bibliography format)
- **Features**:
  - Compatible with pdfLaTeX and XeTeX
  - Bilingual support (Chinese/English)
  - Pre-defined section commands (`\ProposalBackground`, `\ProposalMethod`, `\ProposalPlan`, `\ProposalIntegration`)
  - Multiple font options (standard, Libertine, KaiTi)
  - Proper formatting for NSTC requirements

**Installation**:
```bash
# Via TeX package manager (easiest)
tlmgr install nstc-proposal

# Or manual installation from GitHub
git clone https://github.com/L-TChen/nstc-proposal.git
cd nstc-proposal
latex nstc-proposal.ins
```

**Basic Usage Example**:
```latex
\documentclass{nstc-cm03}
\usepackage{microtype}

\begin{document}
\ProposalBackground
% Your content here

\ProposalMethod
% Your content here

\ProposalPlan
% Your content here

\nocite{*}
\bibliographystyle{plain}
\bibliography{references}
\end{document}
```

#### Alternative Templates

**Engineering Division Template**:
- GitHub: https://github.com/mcps5601/NSTC-proposal-LaTeX
- Provides CM03 format specifically for Engineering Division (工程司)
- **Note**: Format requirements may differ by division

**Overleaf Templates**:

1. **audachang's CM03 Template** (Recommended for Overleaf users):
   - GitHub: https://github.com/audachang/taiwan-nstc-cm03-template
   - Overleaf: Direct import from GitHub
   - **Features**:
     - Includes official CM03.doc file for reference
     - Uses XeCJK with BiauKai (標楷體) font for Traditional Chinese
     - Organized structure with separate section files (`background.tex`, `methods.tex`, `expected_outcomes.tex`)
     - **Important**: Must use XeLaTeX or LuaLaTeX compiler
   - Based on Chen Wen-sheng's template

2. **Other Overleaf Templates**:
   - Search for "國科會研究計畫內容: CM03" on Overleaf
   - Various community-contributed templates available

> ⚠️ **Important**: These are community-contributed templates. Always verify that the format complies with the latest official NSTC requirements for your specific field and program type. The `nstc-proposal` CTAN package is regularly maintained and is the most reliable option.

---

## Practical Insights from Reviewers

> 📚 **Source**: This section is based on "國科會計畫撰寫經驗分享" by Prof. Huang You-Ping (黃有評), President of National Penghu University of Science and Technology. These insights reflect the **reviewer's perspective** and are particularly relevant for Engineering Division proposals.

> ⚠️ **Important**: Scoring thresholds and specific criteria may vary by division (Humanities, Engineering, Natural Sciences, Life Sciences, etc.). Always check with your specific field's requirements.

### Understanding the Scoring System

Based on Engineering Division (工程司) - Automation/Control field experience:

**Scoring Thresholds**:
- **92+ points (Top 5%)**: Outstanding research level - eligible for Distinguished Research Award (傑出研究獎)
- **88+ points (Top 15%)**: Required threshold if applying for a second concurrent project
- **81+ points (Top 54-55%)**: **Passing threshold** - proposals scoring 81 or above are recommended for approval
- **80 points or below**: Not recommended for approval

**Key Insight**: The difference between "passing" (81) and "excellent" (88+) often lies in the strength of preliminary data, clarity of innovation, and demonstrated feasibility.

---

### Section-by-Section Writing Strategies

#### Abstract (摘要)

**Reviewer Expectations**:
- Must demonstrate **innovation** and **problem-solving strategy** immediately
- Should capture attention in the first reading
- Clearly state what makes this proposal different from existing work

**Critical Question**: Does the abstract make the reviewer want to read more?

#### Research Background and Motivation (研究背景及目的)

**What Reviewers Look For**:
- **Clear problem definition**: Is the core problem well-defined?
- **Reasonable design and objectives**: Are the goals achievable and well-justified?
- **Logical flow**: Does the background naturally lead to your research objectives?

**Common Weakness**: Vague problem statements that don't clearly identify what gap you're filling.

#### Literature Review (文獻探討)

**Quality Over Quantity**:
- Select **highly relevant** literature, not just many papers
- **Critical synthesis**: Don't just list papers - analyze strengths, weaknesses, and gaps
- **Recency matters**: Include publications from the **last 2-3 years** to show awareness of current state-of-the-art
- **Strategic positioning**: Use literature review to guide readers toward your research objectives

**Reviewer's Perspective**: A well-curated 20-paper review with critical analysis is far superior to a 50-paper list without synthesis.

#### Research Methods and Implementation (研究方法、進行步驟及執行進度)

**Feasibility is Critical**:
- **Avoid over-idealization**: Proposals that are too ambitious without clear mitigation strategies often fail
- **Logical progression**: Each step should follow naturally from the previous one
- **Comparison with existing methods**: Clearly show how your approach differs and why it's better
- **Contingency planning**: Address potential problems and provide alternative approaches

**Red Flags for Reviewers**:
- Methods that are too difficult without demonstrated capability
- Lack of logical connection between steps
- No discussion of potential challenges
- Missing preliminary data for novel approaches

#### Expected Outcomes (預期完成之工作項目及成果)

**Be Specific and Quantifiable**:
- ✅ **Good**: "Improve system efficiency by 15% compared to baseline method X"
- ❌ **Weak**: "Improve system efficiency"

**Include Multiple Dimensions**:
- **Academic value**: Target journals and expected number of publications
- **Economic benefits**: Potential industrial applications
- **Talent cultivation**: Number and level of students to be trained

---

### Budget Preparation Tips

**Alignment with Research Plan**:
- Every budget item should directly support a specific research activity
- Personnel costs should reflect actual time commitment
- Equipment justification should explain why existing facilities are insufficient

**International Conference Travel**:
- Typical budget: NT$70,000 - 100,000
- **Must justify**: Explain your track record of international conference participation and contributions
- Show how conference attendance benefits the research

**Reviewer's Check**: Does the budget match the proposed activities? Are there unexplained large expenses?

---

### Strategic Career Advice

**For New Faculty**:
1. **Always apply**: New investigators have certain advantages - don't miss the opportunity
2. **Build foundation**: Use undergraduate research projects (大專學生研究計畫) to develop preliminary data
3. **Self-assessment**: Use the review criteria checklist to evaluate your proposal before submission

**Building Academic Visibility**:
- Join professional societies (e.g., IEEE, CAA)
- Serve as reviewer for journals and conferences
- Take on roles as Associate Editor (AE) or board member
- **Why it matters**: Reviewers are more likely to recognize and trust researchers who are active in the community

---

### Preparation and Mindset

**Timeline**:
- **Start early**: Successful proposals require multiple revisions
- **Iterate**: Don't wait until the deadline to start writing
- **Seek feedback**: Have colleagues review your draft

**Handling Rejection**:
- **Learn from feedback**: Carefully review all reviewer comments
- **Revise and resubmit**: Address criticisms in next submission
- **Consider alternatives**: If fundamental issues exist, consider different program types or focus areas

**Professional Presentation**:
- **Figures and tables**: Must be clear, numbered, and properly labeled
- **Formatting**: Professional layout demonstrates attention to detail
- **Proofreading**: Typos and formatting errors suggest carelessness

---

### Self-Assessment Checklist

Before submitting, ask yourself:

**Innovation**:
- [ ] Is my approach genuinely novel or just incremental?
- [ ] Have I clearly explained what's new compared to existing work?
- [ ] Do I have evidence (preliminary data) that my innovation is feasible?

**Feasibility**:
- [ ] Are my methods well-described and logical?
- [ ] Do I have the necessary expertise and resources?
- [ ] Have I addressed potential problems?
- [ ] Is my timeline realistic?

**Impact**:
- [ ] Are my expected outcomes specific and measurable?
- [ ] Have I explained both academic and practical value?
- [ ] Does my proposal align with national priorities or industrial needs?

**Presentation**:
- [ ] Are all figures clear and properly labeled?
- [ ] Is the writing clear and free of errors?
- [ ] Does the budget align with proposed activities?
- [ ] Have I included all required sections?

---

## Advanced Writing Strategies from Government Reviewers

> 📚 **Sources**: This section integrates insights from two comprehensive guides:
> 1. "如何提升政府科技發展計畫書撰寫品質" by **Prof. Guo Yao-Huang (郭耀煌教授)**
> 2. "如何提升政府科技發展計畫書撰寫品質" by **President Wei Yao-Hui (魏耀揮校長)**, Mackay Medical College
>
> These guides are based on extensive experience reviewing government science and technology proposals (including NSTC and other ministry programs).

### The Closed-Loop Logic Framework

**Core Principle**: A high-quality proposal must demonstrate complete logical coherence from problem to performance.

**The Loop**:
```
Problem Discovery → Goal Definition → Strategy Formulation → 
Concrete Measures → Execution Plan → Performance Indicators (KPI)
```

**Critical Requirement**: Every element must connect logically. 

**Example of Broken Logic**:
- ❌ **Goal**: Improve industrial technology
- ❌ **Strategy**: Provide student scholarships
- **Problem**: The strategy doesn't directly support the goal

**Example of Closed Logic**:
- ✅ **Goal**: Improve industrial technology
- ✅ **Strategy**: Develop advanced manufacturing process
- ✅ **Measures**: Establish testing facility, train engineers
- ✅ **KPI**: Achieve 15% efficiency improvement, train 20 engineers

---

### SMART Principle for Proposal Planning

Before writing, ensure your proposal meets **SMART** criteria:

| Criterion | Meaning | Application |
|-----------|---------|-------------|
| **S**pecific | Concrete goals | Define exact technical metrics (e.g., "improve accuracy to 95%") |
| **M**easurable | Quantifiable KPIs | Use numbers, percentages, counts |
| **A**chievable | Realistic scope | Match available resources, personnel, equipment, budget |
| **R**ealistic | Scientific basis | Grounded in data and logical reasoning |
| **T**imely | Clear timeline | Specific milestones with dates |

---

### Four Dimensions of Review Criteria

Reviewers evaluate proposals across four key dimensions:

#### 1. **Necessity (需求性)**
- Does it align with national science and technology policies?
- Is there urgent need for this research?
- Why must this problem be solved **now**?
- Why is **your institution** the right one to do this?

**Weak Proposal**: Generic problem statement without urgency  
**Strong Proposal**: Cites specific policy documents, demonstrates time-sensitive need

#### 2. **Feasibility (可行性)**
- Are the goals achievable within the proposed timeline?
- Is the team qualified (track record, expertise)?
- Are the methods sound and well-justified?
- Is the management plan realistic?

**Red Flag**: Overly ambitious goals without preliminary data or risk mitigation

#### 3. **Appropriateness (適當性)**
- Does the budget match the work scope?
- Are personnel allocations reasonable?
- Is existing equipment utilized effectively?
- Are expensive items properly justified?

**Reviewer's Question**: Why do you need this expensive equipment when similar facilities exist?

#### 4. **Impact and Benefits (效益與影響)**
- Beyond academic output, what are the societal effects?
- Economic benefits or industrial applications?
- Environmental, health, or national security impacts?
- Long-term sustainability?

**Key Insight**: Reviewers increasingly value **societal impact** over pure academic metrics.

---

### Performance Indicators (KPI): The Three Levels

Understanding the difference between input, output, and outcome is critical:

| Level | Type | Examples | Reviewer Value |
|-------|------|----------|----------------|
| **Input** | Resources invested | Personnel, budget, equipment | Basic requirement |
| **Output** | Direct products | Papers, patents, conferences | Minimum expectation |
| **Outcome** | Real-world impact | Industry adoption, health improvement, policy influence | **High value** |

**Example Comparison**:
- ❌ **Weak KPI**: "Publish 3 papers" (output only)
- ✅ **Strong KPI**: "Publish 3 papers in Q1 journals AND transfer technology to 2 companies, generating NT$5M in licensing revenue" (output + outcome)

**KPI Best Practices**:
- **Relevance**: Directly tied to project goals
- **Ease**: Simple to measure and verify
- **Credibility**: Based on realistic projections
- **Cost-efficiency**: Achievable within budget

**Progressive Targets**: Show year-by-year progress, not just final goals
- Year 1: 30% completion
- Year 2: 70% completion  
- Year 3: 100% completion + sustainability plan

---

### Practical Analysis Tools

#### SWOT Analysis

Use SWOT to position your proposal strategically:

| Strengths | Weaknesses |
|-----------|------------|
| Your unique expertise | Resource limitations |
| Existing facilities | Lack of certain skills |
| Strong track record | Time constraints |

| Opportunities | Threats |
|---------------|---------|
| Policy alignment | Competing teams |
| Industry partnerships | Technology changes |
| Emerging trends | Funding cuts |

**Critical**: Don't just list SWOT - **provide response strategies** for Weaknesses and Threats.

**Example**:
- **Weakness**: Lack of high-performance computing cluster
- **Response**: Partner with National Center for High-performance Computing (國網中心)

#### Fishbone Diagram (魚骨圖)

Use fishbone diagrams to demonstrate deep problem understanding:

```
                    Main Problem
                         ↑
        ┌───────┬────────┼────────┬───────┐
    Factor 1  Factor 2  Factor 3  Factor 4
        │         │         │         │
    Sub-causes Sub-causes Sub-causes Sub-causes
```

**Purpose**: Show reviewers you've thoroughly analyzed root causes, not just symptoms.

#### Gantt Chart

For complex multi-year projects, include Gantt charts to show:
- Task dependencies
- Resource allocation over time
- Milestones and deliverables
- Risk management checkpoints

**Professional Presentation**: Use visual tools to demonstrate project management capability.

---

### Budget Preparation: Critical Details

#### Necessity and Reasonableness

**The Two Questions Every Budget Item Must Answer**:
1. **Why is this necessary?** (Link to specific research activity)
2. **How was this calculated?** (Show detailed breakdown)

**Example - Equipment Justification**:
- ❌ **Weak**: "High-performance workstation: NT$150,000"
- ✅ **Strong**: "High-performance workstation (Intel Xeon 32-core, 128GB RAM, RTX 4090 GPU) for deep learning model training: NT$150,000. Current lab computers (8GB RAM) cannot handle the 50GB dataset required for Aim 2. Estimated training time reduction from 2 weeks to 2 days."

#### Budget Category Separation

**Critical Rule**: Strictly separate "recurrent" (經常門) and "capital" (資本門) expenses.

**Recurrent (經常門)**:
- Personnel salaries
- Travel expenses
- Consumables
- Publication fees

**Capital (資本門)**:
- Equipment ≥ NT$10,000 with lifespan ≥ 2 years
- Items ≥ NT$200,000 may require price comparison

**Forbidden**: Using science and technology funds for general administrative work

#### Outsourcing (委辦費用)

If including outsourcing costs:
- Specify exact scope of work
- Explain why in-house execution is not feasible
- Describe selection and oversight procedures
- Provide cost breakdown

#### International Conference Travel

**Typical Range**: NT$70,000 - 100,000

**Required Justification**:
- Your track record of international presentations
- Specific conference name and dates (if known)
- How attendance benefits the research (networking, collaboration, dissemination)
- Why this conference is important for your field

---

### Common Review Comments to Avoid

Based on actual reviewer feedback from government proposals:

#### 1. **Vague Objectives**
- ❌ "Promote development of..."
- ❌ "Research on..."
- ✅ "Develop algorithm achieving 95% accuracy on benchmark X"

#### 2. **Redundancy and Overlap**
- **Problem**: Multiple agencies funding similar work
- **Solution**: Clearly differentiate from existing programs; coordinate with other ministries before submission

#### 3. **Lack of Continuity Explanation**
- **For continuing projects**: Must explain relationship between previous results and new proposal
- Show how you're building on (not repeating) past work

#### 4. **Technology Push Without Market Pull**
- **Problem**: Developing technology without considering industry needs or market readiness
- **Solution**: Include industry partner letters, market analysis, or user needs assessment

#### 5. **Ignoring Negative Impacts**
- **Common oversight**: Privacy concerns, environmental impact, ethical issues
- **Solution**: Include risk assessment and mitigation strategies

#### 6. **Excessive Administrative Overhead**
- **Problem**: Too many project management offices (PMO) or coordinators
- **Solution**: Justify administrative structure based on project complexity

#### 7. **Missing Customer Definition**
- **Question**: Who will use your research results?
- **Answer**: Clearly define your target users/beneficiaries

---

### Writing for the Reviewer

**Remember**: You're writing for busy reviewers, not for yourself.

**Best Practices**:
1. **Use visual aids**: Replace dense text with figures, tables, flowcharts
2. **Data-driven**: Support claims with specific numbers and citations
3. **Objective correctness**: Verify all data and calculations
4. **Logical flow**: Each section should naturally lead to the next
5. **Professional polish**: Clean formatting, no typos, consistent terminology

**Critical Question**: After reading your abstract, does the reviewer **want** to read more?

---

### Policy Alignment

**Essential**: Connect your research to national priorities.

**How to Demonstrate Alignment**:
- Cite specific government policy documents (e.g., "六大核心戰略產業")
- Reference national development plans
- Show how your research addresses societal needs
- Link to ministry-specific priorities

**Example**:
"This research directly supports Taiwan's '5+2 Innovative Industries' initiative, specifically the biomedical sector, by developing..."

---

### Exit Strategy (For Multi-Year Projects)

**Requirement**: Long-term projects must include sustainability plans.

**Key Questions**:
- What happens when funding ends?
- How will results be maintained or transferred?
- What are the success/failure criteria for early termination?

**Components**:
- Technology transfer plan
- Industry partnership agreements
- Follow-on funding strategy
- Publication and dissemination plan

---

### Evaluation Mechanisms

**For public service projects**: Include feedback and assessment systems.

**Components**:
- User satisfaction surveys
- Performance metrics tracking
- Regular review milestones
- Adjustment mechanisms based on feedback

---

## Common Mistakes to Avoid

1. **Exceeding page limits** → Automatic rejection
2. **Missing required sections** → Incomplete application
3. **Incorrect font or formatting** → Non-compliance
4. **Lack of preliminary data** (for applicable programs) → Reduced competitiveness
5. **Vague methodology** → Feasibility concerns
6. **No connection to Taiwan context** → Lower impact score

---

## Final Checklist

Before submission:

- [ ] Check specific program solicitation for field-specific requirements
- [ ] Verify page limit for your field and program type
- [ ] Complete academic ethics training (if required)
- [ ] Prepare both Chinese and English abstracts
- [ ] Include all required forms (CM01, CM02, CM03, etc.)
- [ ] Verify all formatting requirements
- [ ] Proofread for errors
- [ ] Submit through official online system before deadline

---

## Disclaimer

**This guide is for reference only.** Official requirements may change annually and vary by program. **Always consult**:
1. The latest official NSTC announcements (徵求公告)
2. Your specific program's application guidelines
3. Your institution's research office
4. Senior colleagues in your field

For the most authoritative information, visit: **https://www.nstc.gov.tw/**
