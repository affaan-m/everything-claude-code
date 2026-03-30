# Experimental Design Patterns

## Common Approaches to Testing Scientific Hypotheses

This reference provides patterns and frameworks for designing experiments across scientific domains. Use these patterns to develop rigorous tests for generated hypotheses.

**Note on Report Structure:** When generating hypothesis reports, mention only the key experimental approach (e.g., "in vivo knockout study" or "prospective cohort design") in the main text hypothesis boxes. Include comprehensive experimental protocols with full methods, controls, sample sizes, statistical approaches, feasibility assessments, and resource requirements in **Appendix B: Detailed Experimental Designs**.

## Design Selection Framework

Choose experimental approaches based on:
- **Nature of hypothesis:** Mechanistic, causal, correlational, descriptive
- **System studied:** In vitro, in vivo, computational, observational
- **Feasibility:** Time, cost, ethics, technical capabilities
- **Evidence needed:** Proof-of-concept, causal demonstration, quantitative relationship

## Laboratory Experimental Designs

### In Vitro Experiments

**When to use:** Testing molecular, cellular, or biochemical mechanisms in controlled systems.

**Common patterns:**

#### 1. Dose-Response Studies
- **Purpose:** Establish quantitative relationship between input and effect
- **Design:** Test multiple concentrations/doses of intervention
- **Key elements:**
  - Negative control (no treatment)
  - Positive control (known effective treatment)
  - Multiple dose levels (typically 5-8 points)
  - Technical replicates (≥3 per condition)
  - Appropriate statistical analysis (curve fitting, IC50/EC50 determination)

**Example application:**
"To test if compound X inhibits enzyme Y, measure enzyme activity at 0, 1, 10, 100, 1000 nM compound X concentrations with n=3 replicates per dose."

#### 2. Gain/Loss of Function Studies
- **Purpose:** Establish causal role of specific component
- **Design:** Add (overexpression) or remove (knockout/knockdown) component
- **Key elements:**
  - Wild-type control
  - Gain-of-function condition (overexpression, constitutive activation)
  - Loss-of-function condition (knockout, knockdown, inhibition)
  - Rescue experiment (restore function to loss-of-function)
  - Measure downstream effects

**Example application:**
"Test if protein X causes phenotype Y by: (1) knocking out X and observing phenotype loss, (2) overexpressing X and observing phenotype enhancement, (3) rescuing knockout with X re-expression."

#### 3. Time-Course Studies
- **Purpose:** Understand temporal dynamics and sequence of events
- **Design:** Measure outcomes at multiple time points
- **Key elements:**
  - Time 0 baseline
  - Early time points (capture rapid changes)
  - Intermediate time points
  - Late time points (steady state)
  - Sufficient replication at each time point

**Example application:**
"Measure protein phosphorylation at 0, 5, 15, 30, 60, 120 minutes after stimulus to determine peak activation timing."

### In Vivo Experiments

**When to use:** Testing hypotheses in whole organisms to assess systemic, physiological, or behavioral effects.

**Common patterns:**

#### 4. Between-Subjects Designs
- **Purpose:** Compare different groups receiving different treatments
- **Design:** Randomly assign subjects to treatment groups
- **Key elements:**
  - Random assignment to groups
  - Appropriate sample size (power analysis)
  - Control group (vehicle, sham, or standard treatment)
  - Blinding (single or double-blind)
  - Standardized conditions across groups

**Example application:**
"Randomly assign 20 mice each to vehicle control or drug treatment groups, measure tumor size weekly for 8 weeks, with experimenters blinded to group assignment."

#### 5. Within-Subjects (Repeated Measures) Designs
- **Purpose:** Each subject serves as own control, reducing inter-subject variability
- **Design:** Same subjects measured across multiple conditions/time points
- **Key elements:**
  - Baseline measurements
  - Counterbalancing (if order effects possible)
  - Washout periods (for sequential treatments)
  - Appropriate repeated-measures statistics

**Example application:**
"Measure cognitive performance in same participants at baseline, after training intervention, and at 3-month follow-up."

#### 6. Factorial Designs
- **Purpose:** Test multiple factors and their interactions simultaneously
- **Design:** Cross all levels of multiple independent variables
- **Key elements:**
  - Clear main effects and interactions
  - Sufficient power for interaction tests
  - Full factorial or fractional factorial as appropriate

**Example application:**
"2×2 design crossing genotype (WT vs. mutant) × treatment (vehicle vs. drug) to test whether drug effect depends on genotype."

### Computational/Modeling Experiments

**When to use:** Testing hypotheses about complex systems, making predictions, or when physical experiments are infeasible.

#### 7. In Silico Simulations
- **Purpose:** Model complex systems, test theoretical predictions
- **Design:** Implement computational model and vary parameters
- **Key elements:**
  - Well-defined model with explicit assumptions
  - Parameter sensitivity analysis
  - Validation against known data
  - Prediction generation for experimental testing

**Example application:**
"Build agent-based model of disease spread, vary transmission rate and intervention timing, compare predictions to empirical epidemic data."

#### 8. Bioinformatics/Meta-Analysis
- **Purpose:** Test hypotheses using existing datasets
- **Design:** Analyze large-scale data or aggregate multiple studies
- **Key elements:**
  - Appropriate statistical corrections (multiple testing)
  - Validation in independent datasets
  - Control for confounds and batch effects
  - Clear inclusion/exclusion criteria

**Example application:**
"Test if gene X expression correlates with survival across 15 cancer datasets (n>5000 patients total), using Cox regression with clinical covariates."

## Observational Study Designs

### When Physical Manipulation is Impossible or Unethical

#### 9. Cross-Sectional Studies
- **Purpose:** Examine associations at a single time point
- **Design:** Measure variables of interest in population at one time
- **Strengths:** Fast, inexpensive, can establish prevalence
- **Limitations:** Cannot establish temporality or causation
- **Key elements:**
  - Representative sampling
  - Standardized measurements
  - Control for confounding variables
  - Appropriate statistical analysis

**Example application:**
"Survey 1000 adults to test association between diet pattern and biomarker X, controlling for age, sex, BMI, and physical activity."

#### 10. Cohort Studies (Prospective/Longitudinal)
- **Purpose:** Establish temporal relationships and potentially causal associations
- **Design:** Follow group over time, measuring exposures and outcomes
- **Strengths:** Can establish temporality, calculate incidence
- **Limitations:** Time-consuming, expensive, subject attrition
- **Key elements:**
  - Baseline exposure assessment
  - Follow-up at defined intervals
  - Minimize loss to follow-up
  - Account for time-varying confounders

**Example application:**
"Follow 5000 initially healthy individuals for 10 years, testing if baseline vitamin D levels predict cardiovascular disease incidence."

#### 11. Case-Control Studies
- **Purpose:** Efficiently study rare outcomes by comparing cases to controls
- **Design:** Identify cases with outcome, select matched controls, compare exposures
- **Strengths:** Efficient for rare diseases, relatively quick
- **Limitations:** Recall bias, selection bias, cannot calculate incidence
- **Key elements:**
  - Clear case definition
  - Appropriate control selection (matching or statistical adjustment)
  - Retrospective exposure assessment
  - Control for confounding

**Example application:**
"Compare 200 patients with rare disease X to 400 matched controls without X, testing if early-life exposure Y differs between groups."

## Clinical Trial Designs

#### 12. Randomized Controlled Trials (RCTs)
- **Purpose:** Gold standard for testing interventions in humans
- **Design:** Randomly assign participants to treatment or control
- **Key elements:**
  - Randomization (simple, block, or stratified)
  - Concealment of allocation
  - Blinding (participants, providers, assessors)
  - Intention-to-treat analysis
  - Pre-registered protocol and analysis plan

**Example application:**
"Double-blind RCT: randomly assign 300 patients to receive drug X or placebo for 12 weeks, measure primary outcome of symptom improvement."

#### 13. Crossover Trials
- **Purpose:** Each participant receives all treatments in sequence
- **Design:** Participants crossed over between treatments with washout
- **Strengths:** Reduces inter-subject variability, requires fewer participants
- **Limitations:** Order effects, requires reversible conditions, longer duration
- **Key elements:**
  - Adequate washout period
  - Randomized treatment order
  - Carryover effect assessment

**Example application:**
"Crossover trial: participants receive treatment A for 4 weeks, 2-week washout, then treatment B for 4 weeks (randomized order)."

## Advanced Design Considerations

### Sample Size and Statistical Power

**Key questions:**
- What effect size is meaningful to detect?
- What statistical test will be used?
- What alpha (significance level) and beta (power) are appropriate?
- What is expected variability in the measurement?

**General guidelines:**
- Conduct formal power analysis before experiment
- For pilot studies, n≥10 per group minimum
- For definitive studies, aim for ≥80% power
- Account for potential attrition in longitudinal studies

### Controls

**Types of controls:**
- **Negative control:** No intervention (baseline)
- **Positive control:** Known effective intervention (validates system)
- **Vehicle control:** Delivery method without active ingredient
- **Sham control:** Mimics intervention without active component (surgery, etc.)
- **Historical control:** Prior data (weakest, avoid if possible)

### Blinding

**Levels:**
- **Open-label:** No blinding (acceptable for objective measures)
- **Single-blind:** Participants blinded (reduces placebo effects)
- **Double-blind:** Participants and experimenters blinded (reduces bias in assessment)
- **Triple-blind:** Participants, experimenters, and analysts blinded (strongest)

### Replication

**Technical replicates:** Repeated measurements on same sample
- Reduce measurement error
- Typically 2-3 replicates sufficient

**Biological replicates:** Independent samples/subjects
- Address biological variability
- Critical for generalization
- Minimum: n≥3, preferably n≥5-10 per group

**Experimental replicates:** Repeat entire experiment
- Validate findings across time, equipment, operators
- Gold standard for confirming results

### Confound Control

**Strategies:**
- **Randomization:** Distribute confounds evenly across groups
- **Matching:** Pair similar subjects across conditions
- **Blocking:** Group by confound, then randomize within blocks
- **Statistical adjustment:** Measure confounds and adjust in analysis
- **Standardization:** Keep conditions constant across groups

## Selecting Appropriate Design

**Decision tree:**

1. **Can variables be manipulated?**
   - Yes → Experimental design (RCT, lab experiment)
   - No → Observational design (cohort, case-control, cross-sectional)

2. **What is the system?**
   - Cells/molecules → In vitro experiments
   - Whole organisms → In vivo experiments
   - Humans → Clinical trials or observational studies
   - Complex systems → Computational modeling

3. **What is the primary goal?**
   - Mechanism → Gain/loss of function, dose-response
   - Causation → RCT, cohort study with good controls
   - Association → Cross-sectional, case-control
   - Prediction → Modeling, machine learning
   - Temporal dynamics → Time-course, longitudinal

4. **What are the constraints?**
   - Time limited → Cross-sectional, in vitro
   - Budget limited → Computational, observational
   - Ethical concerns → Observational, in vitro
   - Rare outcome → Case-control, meta-analysis

## Integrating Multiple Approaches

Strong hypothesis testing often combines multiple designs:

**Example: Testing if microbiome affects cognitive function**
1. **Observational:** Cohort study showing association between microbiome composition and cognition
2. **Animal model:** Germ-free mice receiving microbiome transplants show cognitive changes
3. **Mechanism:** In vitro studies showing microbial metabolites affect neuronal function
4. **Clinical trial:** RCT of probiotic intervention improving cognitive scores
5. **Computational:** Model predicting which microbiome profiles should affect cognition

**Triangulation approach:**
- Each design addresses different aspects/limitations
- Convergent evidence from multiple approaches strengthens causal claims
- Start with observational/in vitro, then move to definitive causal tests

## Common Pitfalls

- Insufficient sample size (underpowered)
- Lack of appropriate controls
- Confounding variables not accounted for
- Inappropriate statistical tests
- P-hacking or multiple testing without correction
- Lack of blinding when subjective assessments involved
- Failure to replicate findings
- Not pre-registering analysis plans (clinical trials)

## Practical Application for Hypothesis Testing

When designing experiments to test hypotheses:

1. **Match design to hypothesis specifics:** Causal claims require experimental manipulation; associations can use observational designs
2. **Start simple, then elaborate:** Pilot with simple design, then add complexity
3. **Plan controls carefully:** Controls validate the system and isolate the specific effect
4. **Consider feasibility:** Balance ideal design with practical constraints
5. **Plan for multiple experiments:** Rarely does one experiment definitively test a hypothesis
6. **Pre-specify analysis:** Decide statistical tests before data collection
7. **Build in validation:** Independent replication, orthogonal methods, convergent evidence
