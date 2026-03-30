---
name: research-grants
description: Write competitive research proposals for NSF, NIH, DOE, DARPA, and Taiwan NSTC. Agency-specific formatting, review criteria, budget preparation, broader impacts, significance statements, innovation narratives, and compliance with submission requirements.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Research Grant Writing

## Overview

Research grant writing is the process of developing competitive funding proposals for federal agencies and foundations. Master agency-specific requirements, review criteria, narrative structure, budget preparation, and compliance for NSF (National Science Foundation), NIH (National Institutes of Health), DOE (Department of Energy), DARPA (Defense Advanced Research Projects Agency), and Taiwan's NSTC (National Science and Technology Council) submissions.

**Critical Principle: Grants are persuasive documents that must simultaneously demonstrate scientific rigor, innovation, feasibility, and broader impact.** Each agency has distinct priorities, review criteria, formatting requirements, and strategic goals that must be addressed.

## When to Use This Skill

This skill should be used when:
- Writing research proposals for NSF, NIH, DOE, DARPA, or NSTC programs
- Preparing project descriptions, specific aims, or technical narratives
- Developing broader impacts or significance statements
- Creating research timelines and milestone plans
- Preparing budget justifications and personnel allocation plans
- Responding to program solicitations or funding announcements
- Addressing reviewer comments in resubmissions
- Planning multi-institutional collaborative proposals
- Writing preliminary data or feasibility sections
- Preparing biosketches, CVs, or facilities descriptions

## Visual Enhancement with Scientific Schematics

**⚠️ MANDATORY: Every research grant proposal MUST include at least 1-2 AI-generated figures using the scientific-schematics skill.**

This is not optional. Grant proposals without visual elements are incomplete and less competitive. Before finalizing any document:
1. Generate at minimum ONE schematic or diagram (e.g., project timeline, methodology flowchart, or conceptual framework)
2. Prefer 2-3 figures for comprehensive proposals (research workflow, Gantt chart, preliminary data visualization)

**How to generate figures:**
- Use the **scientific-schematics** skill to generate AI-powered publication-quality diagrams
- Simply describe your desired diagram in natural language
- Nano Banana Pro will automatically generate, review, and refine the schematic

**How to generate schematics:**
```bash
python scripts/generate_schematic.py "your diagram description" -o figures/output.png
```

The AI will automatically:
- Create publication-quality images with proper formatting
- Review and refine through multiple iterations
- Ensure accessibility (colorblind-friendly, high contrast)
- Save outputs in the figures/ directory

**When to add schematics:**
- Research methodology and workflow diagrams
- Project timeline Gantt charts
- Conceptual framework illustrations
- System architecture diagrams (for technical proposals)
- Experimental design flowcharts
- Broader impacts activity diagrams
- Collaboration network diagrams
- Any complex concept that benefits from visualization

For detailed guidance on creating schematics, refer to the scientific-schematics skill documentation.

---

## Agency-Specific Overview

### NSF (National Science Foundation)
**Mission**: Promote the progress of science and advance national health, prosperity, and welfare

**Key Features**:
- Intellectual Merit + Broader Impacts (equally weighted)
- 15-page project description limit (most programs)
- Emphasis on education, diversity, and societal benefit
- Collaborative research encouraged
- Open data and open science emphasis
- Merit review process with panel + ad hoc reviewers

### NIH (National Institutes of Health)
**Mission**: Enhance health, lengthen life, and reduce illness and disability

**Key Features**:
- Specific Aims (1 page) + Research Strategy (12 pages for R01)
- Significance, Innovation, Approach as core review criteria
- Preliminary data typically required for R01s
- Emphasis on rigor, reproducibility, and clinical relevance
- Modular budgets ($250K increments) for most R01s
- Multiple resubmission opportunities

### DOE (Department of Energy)
**Mission**: Ensure America's security and prosperity through energy, environmental, and nuclear challenges

**Key Features**:
- Focus on energy, climate, computational science, basic energy sciences
- Often requires cost sharing or industry partnerships
- Emphasis on national laboratory collaboration
- Strong computational and experimental integration
- Energy innovation and commercialization pathways
- Varies by office (ARPA-E, Office of Science, EERE, etc.)

### DARPA (Defense Advanced Research Projects Agency)
**Mission**: Make pivotal investments in breakthrough technologies for national security

**Key Features**:
- High-risk, high-reward transformative research
- Focus on "DARPA-hard" problems (what if true, who cares)
- Emphasis on prototypes, demonstrations, and transition paths
- Often requires multiple phases (feasibility, development, demonstration)
- Strong project management and milestone tracking
- Teaming and collaboration often required
- Varies dramatically by program manager and BAA (Broad Agency Announcement)

### NSTC (National Science and Technology Council - Taiwan)
**Mission**: Advance scientific breakthrough, industrial application, and societal impact in Taiwan.

**Key Features**:
- **CM03 Form**: The core technical proposal format.
- **Bilingual**: Abstract required in both Chinese and English.
- **Innovation & Feasibility**: Primary review focus.
- **Preliminary Data**: Highly critical for credibility.
- **Research Architecture Diagram**: A mandatory visual element for clarity.

## Core Components of Research Proposals

### 1. Executive Summary / Project Summary / Abstract

Every proposal needs a concise overview that communicates the essential elements of the research to both technical reviewers and program officers.

**Purpose**: Provide a standalone summary that captures the research vision, significance, and approach

**Length**: 
- NSF: 1 page (Project Summary with separate Overview, Intellectual Merit, Broader Impacts)
- NIH: 30 lines (Project Summary/Abstract)
- DOE: Varies (typically 1 page)
- DARPA: Varies (often 1-2 pages)

**Essential Elements**:
- Clear statement of the problem or research question
- Why this problem matters (significance, urgency, impact)
- Novel approach or innovation
- Expected outcomes and deliverables
- Qualifications of the team
- Broader impacts or translational pathway

**Writing Strategy**:
- Open with a compelling hook that establishes importance
- Use accessible language (avoid jargon in opening sentences)
- State specific, measurable objectives
- Convey enthusiasm and confidence
- Ensure every sentence adds value (no filler)
- End with transformative vision or impact statement

**Common Mistakes to Avoid**:
- Being too technical or detailed (save for project description)
- Failing to articulate "why now" or "why this team"
- Vague objectives or outcomes
- Neglecting broader impacts or significance
- Generic statements that could apply to any proposal

### 2. Project Description / Research Strategy

The core technical narrative that presents the research plan in detail.

**Structure Varies by Agency:**

**NSF Project Description** (typically 15 pages):
- Introduction and background
- Research objectives and questions
- Preliminary results (if applicable)
- Research plan and methodology
- Timeline and milestones
- Broader impacts (integrated throughout or separate section)
- Prior NSF support (if applicable)

**NIH Research Strategy** (12 pages for R01):
- Significance (why the problem matters)
- Innovation (what's novel and transformative)
- Approach (detailed research plan)
  - Preliminary data
  - Research design and methods
  - Expected outcomes
  - Potential problems and alternative approaches

**DOE Project Narrative** (varies):
- Background and significance
- Technical approach and innovation
- Qualifications and experience
- Facilities and resources
- Project management and timeline

**DARPA Technical Volume** (varies):
- Technical challenge and innovation
- Approach and methodology
- Schedule and milestones
- Deliverables and metrics
- Team qualifications
- Risk assessment and mitigation

For detailed agency-specific guidance, refer to:
- `references/nsf_guidelines.md`
- `references/nih_guidelines.md`
- `references/doe_guidelines.md`
- `references/darpa_guidelines.md`
- `references/nstc_guidelines.md`

### 3. Specific Aims (NIH) or Objectives (NSF/DOE/DARPA)

Clear, testable goals that structure the research plan.

**NIH Specific Aims Page** (1 page):
- Opening paragraph: Gap in knowledge and significance
- Long-term goal and immediate objectives
- Central hypothesis or research question
- 2-4 specific aims with sub-aims
- Expected outcomes and impact
- Payoff paragraph: Why this matters

**Structure for Each Aim:**
- Aim statement (1-2 sentences, starts with action verb)
- Rationale (why this aim, preliminary data support)
- Working hypothesis (testable prediction)
- Approach summary (brief methods overview)
- Expected outcomes and interpretation

**Writing Strategy**:
- Make aims independent but complementary
- Ensure each aim is achievable within timeline and budget
- Provide enough detail to judge feasibility
- Include contingency plans or alternative approaches
- Use parallel structure across aims
- Clearly state what will be learned from each aim

For detailed guidance, refer to `references/specific_aims_guide.md`.

### 4. Broader Impacts (NSF) / Significance (NIH)

Articulate the societal, educational, or translational value of the research.

**NSF Broader Impacts** (critical component, equal weight with Intellectual Merit):

NSF explicitly evaluates broader impacts. Address at least one of these areas:
1. **Advancing discovery and understanding while promoting teaching, training, and learning**
   - Integration of research and education
   - Training of students and postdocs
   - Curriculum development
   - Educational materials and resources

2. **Broadening participation of underrepresented groups**
   - Recruitment and retention strategies
   - Partnerships with minority-serving institutions
   - Outreach to underrepresented communities
   - Mentoring programs

3. **Enhancing infrastructure for research and education**
   - Shared facilities or instrumentation
   - Cyberinfrastructure and data resources
   - Community-wide tools or databases
   - Open-source software or methods

4. **Broad dissemination to enhance scientific and technological understanding**
   - Public outreach and science communication
   - K-12 educational programs
   - Museum exhibits or media engagement
   - Policy briefs or stakeholder engagement

5. **Benefits to society**
   - Economic impact or commercialization
   - Health, environment, or national security benefits
   - Informed decision-making
   - Workforce development

**Writing Strategy for NSF Broader Impacts**:
- Be specific with concrete activities, not vague statements
- Provide timeline and milestones for broader impacts activities
- Explain how impacts will be measured and assessed
- Connect to institutional resources and existing programs
- Show commitment through preliminary efforts or partnerships
- Integrate with research plan (not tacked on)

**NIH Significance**:
- Addresses important problem or critical barrier to progress
- Improves scientific knowledge, technical capability, or clinical practice
- Potential to lead to better outcomes, interventions, or understanding
- Rigor of prior research in the field
- Alignment with NIH mission and institute priorities

For detailed guidance, refer to `references/broader_impacts.md`.

### 5. Innovation and Transformative Potential

Articulate what is novel, creative, and paradigm-shifting about the research.

**Innovation Elements to Highlight**:
- **Conceptual Innovation**: New frameworks, models, or theories
- **Methodological Innovation**: Novel techniques, approaches, or technologies
- **Integrative Innovation**: Combining disciplines or approaches in new ways
- **Translational Innovation**: New pathways from discovery to application
- **Scale Innovation**: Unprecedented scope or resolution

**Writing Strategy**:
- Clearly state what is innovative (don't assume it's obvious)
- Explain why current approaches are insufficient
- Describe how your innovation overcomes limitations
- Provide evidence that innovation is feasible (preliminary data, proof-of-concept)
- Distinguish incremental from transformative advances
- Balance innovation with feasibility (not too risky)

**Common Mistakes**:
- Claiming novelty without demonstrating knowledge of prior work
- Confusing "new to me" with "new to the field"
- Over-promising without supporting evidence
- Being too incremental (minor variation on existing work)
- Being too speculative (no path to success)

### 6. Research Approach and Methods

Detailed description of how the research will be conducted.

**Essential Components**:
- Overall research design and framework
- Detailed methods for each aim/objective
- Sample sizes, statistical power, and analysis plans
- Timeline and sequence of activities
- Data collection, management, and analysis
- Quality control and validation approaches
- Potential problems and alternative strategies
- Rigor and reproducibility measures

**Writing Strategy**:
- Provide enough detail for reproducibility and feasibility assessment
- Use subheadings and figures to improve organization
- Justify choice of methods and approaches
- Address potential limitations proactively
- Include preliminary data demonstrating feasibility
- Show that you've thought through the research process
- Balance detail with readability (use supplementary materials for extensive details)

**For Experimental Research**:
- Describe experimental design (controls, replicates, blinding)
- Specify materials, reagents, and equipment
- Detail data collection protocols
- Explain statistical analysis plans
- Address rigor and reproducibility

**For Computational Research**:
- Describe algorithms, models, and software
- Specify datasets and validation approaches
- Explain computational resources required
- Address code availability and documentation
- Describe benchmarking and performance metrics

**For Clinical or Translational Research**:
- Describe study population and recruitment
- Detail intervention or treatment protocols
- Explain outcome measures and assessments
- Address regulatory approvals (IRB, IND, IDE)
- Describe clinical trial design and monitoring

For detailed methodology guidance by discipline, refer to `references/research_methods.md`.

### 7. Preliminary Data and Feasibility

Demonstrate that the research is achievable and the team is capable.

**Purpose**:
- Prove that the proposed approach can work
- Show that the team has necessary expertise
- Demonstrate access to required resources
- Reduce perceived risk for reviewers
- Provide foundation for proposed work

**What to Include**:
- Pilot studies or proof-of-concept results
- Method development or optimization
- Access to unique resources (samples, data, collaborators)
- Relevant publications from your team
- Preliminary models or simulations
- Feasibility assessments or power calculations

**NIH Requirements**:
- R01 applications typically require substantial preliminary data
- R21 applications may have less stringent requirements
- New investigators may have less preliminary data
- Preliminary data should directly support proposed aims

**NSF Approach**:
- Preliminary data less commonly required than NIH
- May be important for high-risk or novel approaches
- Can strengthen proposal for competitive programs

**Writing Strategy**:
- Present most compelling data that supports your approach
- Clearly connect preliminary data to proposed aims
- Acknowledge limitations and how proposed work will address them
- Use figures and data visualizations effectively
- Avoid over-interpreting or overstating preliminary findings
- Show trajectory of your research program

### 8. Timeline, Milestones, and Management Plan

Demonstrate that the project is well-planned and achievable within the proposed timeframe.

**Essential Elements**:
- Phased timeline with clear milestones
- Logical sequence and dependencies
- Realistic timeframes for each activity
- Decision points and go/no-go criteria
- Risk mitigation strategies
- Resource allocation across time
- Coordination plan for multi-institutional teams

**Presentation Formats**:
- Gantt charts showing overlapping activities
- Year-by-year breakdown of activities
- Quarterly milestones and deliverables
- Table of aims/tasks with timeline and personnel

**Writing Strategy**:
- Be realistic about what can be accomplished
- Build in time for unexpected delays or setbacks
- Show that timeline aligns with budget and personnel
- Demonstrate understanding of regulatory timelines (IRB, IACUC)
- Include time for dissemination and broader impacts
- Address how progress will be monitored and assessed

**DARPA Emphasis**:
- Particularly important for DARPA proposals
- Clear technical milestones with measurable metrics
- Quarterly deliverables and reporting
- Phase-based structure with exit criteria
- Demonstration and transition planning

For detailed guidance, refer to `references/timeline_planning.md`.

### 9. Team Qualifications and Collaboration

Demonstrate that the team has the expertise, experience, and resources to succeed.

**Essential Elements**:
- PI qualifications and relevant expertise
- Co-I and collaborator roles and contributions
- Track record in the research area
- Complementary expertise across team
- Institutional support and resources
- Prior collaboration history (if applicable)
- Mentoring and training plan (for students/postdocs)

**Writing Strategy**:
- Highlight most relevant publications and accomplishments
- Clearly define roles and responsibilities
- Show that team composition is necessary (not just convenient)
- Demonstrate successful prior collaborations
- Address how team will be managed and coordinated
- Explain institutional commitment and support

**Biosketches / CVs**:
- Follow agency-specific formats (NSF, NIH, DOE, DARPA differ)
- Highlight most relevant publications and accomplishments
- Include synergistic activities and collaborations
- Show trajectory and productivity
- Address any career gaps or interruptions

**Letters of Collaboration**:
- Specific commitments and contributions
- Demonstrates genuine partnership
- Includes resource sharing or access agreements
- Signed and on letterhead

For detailed guidance, refer to `references/team_building.md`.

### 10. Budget and Budget Justification

Develop realistic budgets that align with the proposed work and agency guidelines.

**Budget Categories** (typical):
- **Personnel**: Salary and fringe for PI, co-Is, postdocs, students, staff
- **Equipment**: Items >$5,000 (varies by agency)
- **Travel**: Conferences, collaborations, fieldwork
- **Materials and Supplies**: Consumables, reagents, software
- **Other Direct Costs**: Publication costs, participant incentives, consulting
- **Indirect Costs (F&A)**: Institutional overhead (rates vary)
- **Subawards**: Costs for collaborating institutions

**Agency-Specific Considerations**:

**NSF**:
- Full budget justification required
- Cost sharing generally not required (but may strengthen proposal)
- Up to 2 months summer salary for faculty
- Graduate student support encouraged

**NIH**:
- Modular budgets for ≤$250K direct costs per year (R01)
- Detailed budgets for >$250K or complex awards
- Salary cap applies (~$221,900 for 2024)
- Limited to 1 month (8.33% FTE) for most PIs

**DOE**:
- Often requires cost sharing (especially ARPA-E)
- Detailed budget with quarterly breakdown
- Requires institutional commitment letters
- National laboratory collaboration budgets separate

**DARPA**:
- Detailed budgets by phase and task
- Requires supporting cost data for large procurements
- Often requires cost-plus or firm-fixed-price structures
- Travel budget for program meetings

**Budget Justification Writing**:
- Justify each line item in terms of the research plan
- Explain effort percentages for personnel
- Describe specific equipment and why necessary
- Justify travel (conferences, collaborations)
- Explain consultant roles and rates
- Show how budget aligns with timeline

For detailed budget guidance, refer to `references/budget_preparation.md`.

## Review Criteria by Agency

Understanding how proposals are evaluated is critical for writing competitive applications.

### NSF Review Criteria

**Intellectual Merit** (primary):
- What is the potential for the proposed activity to advance knowledge?
- How well-conceived and organized is the proposed activity?
- Is there sufficient access to resources?
- How well-qualified is the individual, team, or institution to conduct proposed activities?

**Broader Impacts** (equally important):
- What is the potential for the proposed activity to benefit society?
- To what extent does the proposal address broader impacts in meaningful ways?

**Additional Considerations**:
- Integration of research and education
- Diversity and inclusion
- Results from prior NSF support (if applicable)

### NIH Review Criteria

**Scored Criteria** (1-9 scale, 1 = exceptional, 9 = poor):

1. **Significance**
   - Addresses important problem or critical barrier
   - Improves scientific knowledge, technical capability, or clinical practice
   - Aligns with NIH mission

2. **Investigator(s)**
   - Well-suited to the project
   - Track record of accomplishments
   - Adequate training and expertise

3. **Innovation**
   - Novel concepts, approaches, methodologies, or interventions
   - Challenges existing paradigms
   - Addresses important problem in creative ways

4. **Approach**
   - Well-reasoned and appropriate
   - Rigorous and reproducible
   - Adequately accounts for potential problems
   - Feasible within timeline

5. **Environment**
   - Institutional support and resources
   - Scientific environment contributes to probability of success

**Additional Review Considerations** (not scored but discussed):
- Protections for human subjects
- Inclusion of women, minorities, and children
- Vertebrate animal welfare
- Biohazards
- Resubmission response (if applicable)
- Budget and timeline appropriateness

### DOE Review Criteria

Varies by program office, but generally includes:
- Scientific and/or technical merit
- Appropriateness of proposed method or approach
- Competency of personnel and adequacy of facilities
- Reasonableness and appropriateness of budget
- Relevance to DOE mission and program goals

### DARPA Review Criteria

**DARPA-specific considerations**:
- Overall scientific and technical merit
- Potential contribution to DARPA mission
- Realism of proposed costs and availability of funds

### NSTC Review Criteria

**Core Evaluation Dimensions**:
1. **Innovation (創新性)**: Novelty of concept and approach.
2. **Feasibility (可行性)**: Methodology rigor and preliminary data.
3. **PI Capability (主持人能力)**: Track record and expertise.
4. **Value (價值)**: Academic contribution and societal/industrial impact.

For detailed review criteria by agency, refer to `references/review_criteria.md` and `references/nstc_guidelines.md`.
- **What if you succeed?** (Impact if the research works)
- **What if you're right?** (Implications of your hypothesis)
- **Who cares?** (Why it matters for national security)

For detailed review criteria by agency, refer to `references/review_criteria.md`.

## Writing Principles for Competitive Proposals

### Clarity and Accessibility

**Write for Multiple Audiences**:
- Technical reviewers in your field (will scrutinize methods)
- Reviewers in related but not identical fields (need context)
- Program officers (look for alignment with agency goals)
- Panel members reading 15+ proposals (need clear organization)

**Strategies**:
- Use clear section headings and subheadings
- Start sections with overview paragraphs
- Define technical terms and abbreviations
- Use figures, diagrams, and tables to clarify complex ideas
- Avoid jargon when possible; explain when necessary
- Use topic sentences to guide readers

### Persuasive Argumentation

**Build a Compelling Narrative**:
- Establish the problem and its importance
- Show gaps in current knowledge or approaches
- Present your solution as innovative and feasible
- Demonstrate that you're the right team
- Show that success will have significant impact

**Structure of Persuasion**:
1. **Hook**: Capture attention with significance
2. **Problem**: Establish what's not known or not working
3. **Solution**: Present your innovative approach
4. **Evidence**: Support with preliminary data
5. **Impact**: Show transformative potential
6. **Team**: Demonstrate capability to deliver

**Language Choices**:
- Use active voice for clarity and confidence
- Choose strong verbs (investigate, elucidate, discover vs. look at, study)
- Be confident but not arrogant (avoid "obviously," "clearly")
- Acknowledge uncertainty appropriately
- Use precise language (avoid vague terms like "several," "various")

### Visual Communication

**Effective Use of Figures**:
- Conceptual diagrams showing research framework
- Preliminary data demonstrating feasibility
- Timelines and Gantt charts
- Workflow diagrams showing methodology
- Expected results or predictions

**Design Principles**:
- Make figures self-explanatory with complete captions
- Use consistent color schemes and fonts
- Ensure readability (large enough fonts, clear labels)
- Integrate figures with text (refer to specific figures)
- Follow agency-specific formatting requirements

### Addressing Risk and Feasibility

**Balance Innovation and Risk**:
- Acknowledge potential challenges
- Provide alternative approaches
- Show preliminary data reducing risk
- Demonstrate expertise to handle challenges
- Include contingency plans

**Common Concerns**:
- Too ambitious for timeline/budget
- Technically infeasible
- Team lacks necessary expertise
- Preliminary data insufficient
- Methods not adequately described
- Lack of innovation or significance

### Integration and Coherence

**Ensure All Parts Align**:
- Budget supports activities in project description
- Timeline matches aims and milestones
- Team composition matches required expertise
- Broader impacts connect to research plan
- Letters of support confirm stated collaborations

**Avoid Contradictions**:
- Preliminary data vs. stated gaps
- Claimed expertise vs. publication record
- Stated aims vs. actual methods
- Budget vs. stated activities

## Common Proposal Types

### NSF Proposal Types

- **Standard Research Proposals**: Most common, up to $500K and 5 years
- **CAREER Awards**: Early career faculty, integrated research/education, $400-500K over 5 years
- **Collaborative Research**: Multiple institutions, separately submitted, shared research plan
- **RAPID**: Urgent research opportunities, up to $200K, no preliminary data required
- **EAGER**: High-risk, high-reward exploratory research, up to $300K
- **EArly-concept Grants for Exploratory Research (EAGER)**: Early-stage exploratory work

### NIH Award Mechanisms

- **R01**: Research Project Grant, $250K+ per year, 3-5 years, most common
- **R21**: Exploratory/Developmental Research, up to $275K over 2 years, no preliminary data
- **R03**: Small Grant Program, up to $100K over 2 years
- **R15**: Academic Research Enhancement Awards (AREA), for primarily undergraduate institutions
- **R35**: MIRA (Maximizing Investigators' Research Award), program-specific
- **P01**: Program Project Grant, multi-project integrated research
- **U01**: Research Project Cooperative Agreement, NIH involvement in conduct

**Fellowship Mechanisms**:
- **F30**: Predoctoral MD/PhD Fellowship
- **F31**: Predoctoral Fellowship
- **F32**: Postdoctoral Fellowship
- **K99/R00**: Pathway to Independence Award
- **K08**: Mentored Clinical Scientist Research Career Development Award

### DOE Programs

- **Office of Science**: Basic research in physical sciences, biological sciences, computing
- **ARPA-E**: Transformative energy technologies, requires cost sharing
- **EERE**: Applied research in renewable energy and energy efficiency
- **National Laboratories**: Collaborative research with DOE labs

### DARPA Programs

- **Varies by Office**: BTO, DSO, I2O, MTO, STO, TTO
- **Program-Specific BAAs**: Broad Agency Announcements for specific thrusts
- **Young Faculty Award (YFA)**: Early career researchers, up to $500K
- **Director's Fellowship**: High-risk, paradigm-shifting research

For detailed program guidance, refer to `references/funding_mechanisms.md`.

## Resubmission Strategies

### NIH Resubmission (A1)

**Introduction to Resubmission** (1 page):
- Summarize major criticisms from previous review
- Describe specific changes made in response
- Use bullet points for clarity
- Be respectful of reviewers' comments
- Highlight substantial improvements

**Strategies**:
- Address every major criticism
- Make changes visible (but don't use track changes in final)
- Strengthen weak areas (preliminary data, methods, significance)
- Consider changing aims if fundamentally flawed
- Get external feedback before resubmitting
- Use full 37-month window if needed for new data

**When Not to Resubmit**:
- Fundamental conceptual flaws
- Lack of innovation or significance
- Missing key expertise or resources
- Extensive revisions needed (consider new submission)

### NSF Resubmission

**NSF allows resubmission after revision**:
- Address reviewer concerns in revised proposal
- No formal "introduction to resubmission" section
- May be reviewed by same or different panel
- Consider program officer feedback
- May need to wait for next submission cycle

For detailed resubmission guidance, refer to `references/resubmission_strategies.md`.

## Common Mistakes to Avoid

### Conceptual Mistakes

1. **Failing to Address Review Criteria**: Not explicitly discussing significance, innovation, approach, etc.
2. **Mismatch with Agency Mission**: Proposing research that doesn't align with agency goals
3. **Unclear Significance**: Failing to articulate why the research matters
4. **Insufficient Innovation**: Incremental work presented as transformative
5. **Vague Objectives**: Goals that are not specific or measurable

### Writing Mistakes

1. **Poor Organization**: Lack of clear structure and flow
2. **Excessive Jargon**: Inaccessible to broader review panel
3. **Verbosity**: Unnecessarily complex or wordy writing
4. **Missing Context**: Assuming reviewers know your field deeply
5. **Inconsistent Terminology**: Using different terms for same concept

### Technical Mistakes

1. **Inadequate Methods**: Insufficient detail to judge feasibility
2. **Overly Ambitious**: Too much proposed for timeline/budget
3. **No Preliminary Data**: For mechanisms requiring demonstrated feasibility
4. **Poor Timeline**: Unrealistic or poorly justified schedule
5. **Misaligned Budget**: Budget doesn't support proposed activities

### Formatting Mistakes

1. **Exceeding Page Limits**: Automatic rejection
2. **Wrong Font or Margins**: Non-compliant formatting
3. **Missing Required Sections**: Incomplete application
4. **Poor Figure Quality**: Illegible or unprofessional figures
5. **Inconsistent Citations**: Formatting errors in references

### Strategic Mistakes

1. **Wrong Program or Mechanism**: Proposing to inappropriate opportunity
2. **Weak Team**: Insufficient expertise or missing key collaborators
3. **No Broader Impacts**: For NSF, failing to adequately address
4. **Ignoring Program Priorities**: Not aligning with current emphasis areas
5. **Late Submission**: Technical issues or rushed preparation

## Workflow for Grant Development

### Phase 1: Planning and Preparation (2-6 months before deadline)

**Activities**:
- Identify appropriate funding opportunities
- Review program announcements and requirements
- Consult with program officers (if appropriate)
- Assemble team and confirm collaborations
- Develop preliminary data (if needed)
- Outline research plan and specific aims
- Review successful proposals (if available)

**Outputs**:
- Selected funding opportunity
- Assembled team with defined roles
- Preliminary outline of specific aims
- Gap analysis of needed preliminary data

### Phase 2: Drafting (2-3 months before deadline)

**Activities**:
- Write specific aims or objectives (start here!)
- Develop project description/research strategy
- Create figures and data visualizations
- Draft timeline and milestones
- Prepare preliminary budget
- Write broader impacts or significance sections
- Request letters of support/collaboration

**Outputs**:
- Complete first draft of narrative sections
- Preliminary budget with justification
- Timeline and management plan
- Requested letters from collaborators

### Phase 3: Internal Review (1-2 months before deadline)

**Activities**:
- Circulate draft to co-investigators
- Seek feedback from colleagues and mentors
- Request institutional review (if required)
- Mock review session (if possible)
- Revise based on feedback
- Refine budget and budget justification

**Outputs**:
- Revised draft incorporating feedback
- Refined budget aligned with revised plan
- Identified weaknesses and mitigation strategies

### Phase 4: Finalization (2-4 weeks before deadline)

**Activities**:
- Final revisions to narrative
- Prepare all required forms and documents
- Finalize budget and budget justification
- Compile biosketches, CVs, and current & pending
- Collect letters of support
- Prepare data management plan (if required)
- Write project summary/abstract
- Proofread all materials

**Outputs**:
- Complete, polished proposal
- All required supplementary documents
- Formatted according to agency requirements

### Phase 5: Submission (1 week before deadline)

**Activities**:
- Institutional review and approval
- Upload to submission portal
- Verify all documents and formatting
- Submit 24-48 hours before deadline
- Confirm successful submission
- Receive confirmation and proposal number

**Outputs**:
- Submitted proposal
- Submission confirmation
- Archived copy of all materials

**Critical Tip**: Never wait until the deadline. Portals crash, files corrupt, and emergencies happen. Aim for 48 hours early.

## Integration with Other Skills

This skill works effectively with:
- **Scientific Writing**: For clear, compelling prose
- **Literature Review**: For comprehensive background sections
- **Peer Review**: For self-assessment before submission
- **Research Lookup**: For finding relevant citations and prior work
- **Data Visualization**: For creating effective figures

## Resources

This skill includes comprehensive reference files covering specific aspects of grant writing:

- `references/nsf_guidelines.md`: NSF-specific requirements, formatting, and strategies
- `references/nih_guidelines.md`: NIH mechanisms, review criteria, and submission requirements
- `references/doe_guidelines.md`: DOE programs, emphasis areas, and application procedures
- `references/darpa_guidelines.md`: DARPA BAAs, program offices, and proposal strategies
- `references/broader_impacts.md`: Strategies for compelling broader impacts statements
- `references/specific_aims_guide.md`: Writing effective specific aims pages
- `references/budget_preparation.md`: Budget development and justification
- `references/review_criteria.md`: Detailed review criteria by agency
- `references/timeline_planning.md`: Creating realistic timelines and milestones
- `references/team_building.md`: Assembling and presenting effective teams
- `references/resubmission_strategies.md`: Responding to reviews and revising proposals

Load these references as needed when working on specific aspects of grant writing.

## Templates and Assets

- `assets/nsf_project_summary_template.md`: NSF project summary structure
- `assets/nih_specific_aims_template.md`: NIH specific aims page template
- `assets/timeline_gantt_template.md`: Timeline and Gantt chart examples
- `assets/budget_justification_template.md`: Budget justification structure
- `assets/biosketch_templates/`: Agency-specific biosketch formats

## Scripts and Tools

- `scripts/compliance_checker.py`: Verify formatting requirements
- `scripts/budget_calculator.py`: Calculate budgets with inflation and fringe
- `scripts/deadline_tracker.py`: Track submission deadlines and milestones

---

**Final Note**: Grant writing is both an art and a science. Success requires not only excellent research ideas but also clear communication, strategic positioning, and meticulous attention to detail. Start early, seek feedback, and remember that even the best researchers face rejection—persistence and revision are key to funding success.


