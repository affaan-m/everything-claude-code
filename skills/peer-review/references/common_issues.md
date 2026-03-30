# Common Methodological and Statistical Issues in Scientific Manuscripts

This document catalogs frequent issues encountered during peer review, organized by category. Use this as a reference to identify potential problems and provide constructive feedback.

## Statistical Issues

### 1. P-Value Misuse and Misinterpretation

**Common Problems:**
- P-hacking (selective reporting of significant results)
- Multiple testing without correction (familywise error rate inflation)
- Interpreting non-significance as proof of no effect
- Focusing exclusively on p-values without effect sizes
- Dichotomizing continuous p-values at arbitrary thresholds (p=0.049 vs p=0.051)
- Confusing statistical significance with biological/clinical significance

**How to Identify:**
- Suspiciously high proportion of p-values just below 0.05
- Many tests performed but no correction mentioned
- Statements like "no difference was found" from non-significant results
- No effect sizes or confidence intervals reported
- Language suggesting p-values indicate strength of effect

**What to Recommend:**
- Report effect sizes with confidence intervals
- Apply appropriate multiple testing corrections (Bonferroni, FDR, Holm-Bonferroni)
- Interpret non-significance cautiously (lack of evidence ≠ evidence of lack)
- Pre-register analyses to avoid p-hacking
- Consider equivalence testing for "no difference" claims

### 2. Inappropriate Statistical Tests

**Common Problems:**
- Using parametric tests when assumptions are violated (non-normal data, unequal variances)
- Analyzing paired data with unpaired tests
- Using t-tests for multiple groups instead of ANOVA with post-hoc tests
- Treating ordinal data as continuous
- Ignoring repeated measures structure
- Using correlation when regression is more appropriate

**How to Identify:**
- No mention of assumption checking
- Small sample sizes with parametric tests
- Multiple pairwise t-tests instead of ANOVA
- Likert scales analyzed with t-tests
- Time-series data analyzed without accounting for repeated measures

**What to Recommend:**
- Check assumptions explicitly (normality tests, Q-Q plots)
- Use non-parametric alternatives when appropriate
- Apply proper corrections for multiple comparisons after ANOVA
- Use mixed-effects models for repeated measures
- Consider ordinal regression for ordinal outcomes

### 3. Sample Size and Power Issues

**Common Problems:**
- No sample size justification or power calculation
- Underpowered studies claiming "no effect"
- Post-hoc power calculations (which are uninformative)
- Stopping rules not pre-specified
- Unequal group sizes without justification

**How to Identify:**
- Small sample sizes (n<30 per group for typical designs)
- No mention of power analysis in methods
- Statements about post-hoc power
- Wide confidence intervals suggesting imprecision
- Claims of "no effect" with large p-values and small n

**What to Recommend:**
- Conduct a priori power analysis based on expected effect size
- Report achieved power or precision (confidence interval width)
- Acknowledge when studies are underpowered
- Consider effect sizes and confidence intervals for interpretation
- Pre-register sample size and stopping rules

### 4. Missing Data Problems

**Common Problems:**
- Complete case analysis without justification (listwise deletion)
- Not reporting extent or pattern of missingness
- Assuming data are missing completely at random (MCAR) without testing
- Inappropriate imputation methods
- Not performing sensitivity analyses

**How to Identify:**
- Different n values across analyses without explanation
- No discussion of missing data
- Participants "excluded from analysis"
- Simple mean imputation used
- No sensitivity analyses comparing complete vs. imputed data

**What to Recommend:**
- Report extent and patterns of missingness
- Test MCAR assumption (Little's test)
- Use appropriate methods (multiple imputation, maximum likelihood)
- Perform sensitivity analyses
- Consider intention-to-treat analysis for trials

### 5. Circular Analysis and Double-Dipping

**Common Problems:**
- Using the same data for selection and inference
- Defining ROIs based on contrast then testing that contrast in same ROI
- Selecting outliers then testing for differences
- Post-hoc subgroup analyses presented as planned
- HARKing (Hypothesizing After Results are Known)

**How to Identify:**
- ROIs or features selected based on results
- Unexpected subgroup analyses
- Post-hoc analyses not clearly labeled as exploratory
- No data-independent validation
- Introduction that perfectly predicts findings

**What to Recommend:**
- Use independent datasets for selection and testing
- Pre-register analyses and hypotheses
- Clearly distinguish confirmatory vs. exploratory analyses
- Use cross-validation or hold-out datasets
- Correct for selection bias

### 6. Pseudoreplication

**Common Problems:**
- Technical replicates treated as biological replicates
- Multiple measurements from same subject treated as independent
- Clustered data analyzed without accounting for clustering
- Non-independence in spatial or temporal data

**How to Identify:**
- n defined as number of measurements rather than biological units
- Multiple cells from same animal counted as independent
- Repeated measures not acknowledged
- No mention of random effects or clustering

**What to Recommend:**
- Define n as biological replicates (animals, patients, independent samples)
- Use mixed-effects models for nested or clustered data
- Account for repeated measures explicitly
- Average technical replicates before analysis
- Report both technical and biological replication

## Experimental Design Issues

### 7. Lack of Appropriate Controls

**Common Problems:**
- Missing negative controls
- Missing positive controls for validation
- No vehicle controls for drug studies
- No time-matched controls for longitudinal studies
- No batch controls

**How to Identify:**
- Methods section lists only experimental groups
- No mention of controls in figures
- Unclear baseline or reference condition
- Cross-batch comparisons without controls

**What to Recommend:**
- Include negative controls to assess specificity
- Include positive controls to validate methods
- Use vehicle controls matched to experimental treatment
- Include sham surgery controls for surgical interventions
- Include batch controls for cross-batch comparisons

### 8. Confounding Variables

**Common Problems:**
- Systematic differences between groups besides intervention
- Batch effects not controlled or corrected
- Order effects in sequential experiments
- Time-of-day effects not controlled
- Experimenter effects not blinded

**How to Identify:**
- Groups differ in multiple characteristics
- Samples processed in different batches by group
- No randomization of sample order
- No mention of blinding
- Baseline characteristics differ between groups

**What to Recommend:**
- Randomize experimental units to conditions
- Block on known confounders
- Randomize sample processing order
- Use blinding to minimize bias
- Perform batch correction if needed
- Report and adjust for baseline differences

### 9. Insufficient Replication

**Common Problems:**
- Single experiment without replication
- Technical replicates mistaken for biological replication
- Small n justified by "typical for the field"
- No independent validation of key findings
- Cherry-picking representative examples

**How to Identify:**
- Methods state "experiment performed once"
- n=3 with no justification
- "Representative image shown"
- Key claims based on single experiment
- No validation in independent dataset

**What to Recommend:**
- Perform independent biological replicates (typically ≥3)
- Validate key findings in independent cohorts
- Report all replicates, not just representative examples
- Conduct power analysis to justify sample size
- Show individual data points, not just summary statistics

## Reproducibility Issues

### 10. Insufficient Methodological Detail

**Common Problems:**
- Methods not described in sufficient detail for replication
- Key reagents not specified (vendor, catalog number)
- Software versions and parameters not reported
- Antibodies not validated
- Cell line authentication not verified

**How to Identify:**
- Vague descriptions ("standard protocols were used")
- No information on reagent sources
- Generic software mentioned without versions
- No antibody validation information
- Cell lines not authenticated

**What to Recommend:**
- Provide detailed protocols or cite specific protocols
- Include reagent vendors, catalog numbers, lot numbers
- Report software versions and all parameters
- Include antibody validation (Western blot, specificity tests)
- Report cell line authentication method (STR profiling)
- Make protocols available (protocols.io, supplementary materials)

### 11. Data and Code Availability

**Common Problems:**
- No data availability statement
- "Data available upon request" (often unfulfilled)
- No code provided for computational analyses
- Custom software not made available
- No clear documentation

**How to Identify:**
- Missing data availability statement
- No repository accession numbers
- Computational methods with no code
- Custom pipelines without access
- No README or documentation

**What to Recommend:**
- Deposit raw data in appropriate repositories (GEO, SRA, Dryad, Zenodo)
- Share analysis code on GitHub or similar
- Provide clear documentation and README files
- Include requirements.txt or environment files
- Make custom software available with installation instructions
- Use DOIs for permanent data citation

### 12. Lack of Method Validation

**Common Problems:**
- New methods not compared to gold standard
- Assays not validated for specificity, sensitivity, linearity
- No spike-in controls
- Cross-reactivity not tested
- Detection limits not established

**How to Identify:**
- Novel assays presented without validation
- No comparison to existing methods
- No positive/negative controls shown
- Claims of specificity without evidence
- No standard curves or controls

**What to Recommend:**
- Validate new methods against established approaches
- Show specificity (knockdown/knockout controls)
- Demonstrate linearity and dynamic range
- Include positive and negative controls
- Report limits of detection and quantification
- Show reproducibility across replicates and operators

## Interpretation Issues

### 13. Overstatement of Results

**Common Problems:**
- Causal language for correlational data
- Mechanistic claims without mechanistic evidence
- Extrapolating beyond data (species, conditions, populations)
- Claiming "first to show" without thorough literature review
- Overgeneralizing from limited samples

**How to Identify:**
- "X causes Y" from observational data
- Mechanism proposed without direct testing
- Mouse data presented as relevant to humans without caveats
- Claims of novelty with missing citations
- Broad claims from narrow samples

**What to Recommend:**
- Use appropriate language ("associated with" vs. "caused by")
- Distinguish correlation from causation
- Acknowledge limitations of model systems
- Provide thorough literature context
- Be specific about generalizability
- Propose mechanisms as hypotheses, not conclusions

### 14. Cherry-Picking and Selective Reporting

**Common Problems:**
- Reporting only significant results
- Showing "representative" images that may not be typical
- Excluding outliers without justification
- Not reporting negative or contradictory findings
- Switching between different statistical approaches

**How to Identify:**
- All reported results are significant
- "Representative of 3 experiments" with no quantification
- Data exclusions mentioned in results but not methods
- Supplementary data contradicts main findings
- Multiple analysis approaches with only one reported

**What to Recommend:**
- Report all planned analyses regardless of outcome
- Quantify and show variability across replicates
- Pre-specify outlier exclusion criteria
- Include negative results
- Pre-register analysis plan
- Report effect sizes and confidence intervals for all comparisons

### 15. Ignoring Alternative Explanations

**Common Problems:**
- Preferred explanation presented without considering alternatives
- Contradictory evidence dismissed without discussion
- Off-target effects not considered
- Confounding variables not acknowledged
- Limitations section minimal or absent

**How to Identify:**
- Single interpretation presented as fact
- Prior contradictory findings not cited or discussed
- No consideration of alternative mechanisms
- No discussion of limitations
- Specificity assumed without controls

**What to Recommend:**
- Discuss alternative explanations
- Address contradictory findings from literature
- Include appropriate specificity controls
- Acknowledge and discuss limitations thoroughly
- Consider and test alternative hypotheses

## Figure and Data Presentation Issues

### 16. Inappropriate Data Visualization

**Common Problems:**
- Bar graphs for continuous data (hiding distributions)
- No error bars or error bars not defined
- Truncated y-axes exaggerating differences
- Dual y-axes creating misleading comparisons
- Too many significant figures
- Colors not colorblind-friendly

**How to Identify:**
- Bar graphs with few data points
- Unclear what error bars represent (SD, SEM, CI?)
- Y-axis doesn't start at zero for ratio/percentage data
- Left and right y-axes with different scales
- Values reported to excessive precision (p=0.04562)
- Red-green color schemes

**What to Recommend:**
- Show individual data points with scatter/box/violin plots
- Always define error bars (SD, SEM, 95% CI)
- Start y-axis at zero or indicate breaks clearly
- Avoid dual y-axes; use separate panels instead
- Report appropriate significant figures
- Use colorblind-friendly palettes (viridis, colorbrewer)
- Include sample sizes in figure legends

### 17. Image Manipulation Concerns

**Common Problems:**
- Excessive contrast/brightness adjustment
- Spliced gels or images without indication
- Duplicated images or panels
- Uneven background in Western blots
- Selective cropping
- Over-processed microscopy images

**How to Identify:**
- Suspicious patterns or discontinuities
- Very high contrast with no background
- Similar features in different panels
- Straight lines suggesting splicing
- Inconsistent backgrounds
- Loss of detail suggesting over-processing

**What to Recommend:**
- Apply adjustments uniformly across images
- Indicate spliced gels with dividing lines
- Show full, uncropped images in supplementary materials
- Provide original images if requested
- Follow journal image integrity policies
- Use appropriate image analysis tools

## Study Design Issues

### 18. Poorly Defined Hypotheses and Outcomes

**Common Problems:**
- No clear hypothesis stated
- Primary outcome not specified
- Multiple outcomes without correction
- Outcomes changed after data collection
- Fishing expeditions presented as hypothesis-driven

**How to Identify:**
- Introduction doesn't state clear testable hypothesis
- Multiple outcomes with unclear hierarchy
- Outcomes in results don't match those in methods
- Exploratory study presented as confirmatory
- Many tests with no multiple testing correction

**What to Recommend:**
- State clear, testable hypotheses
- Designate primary and secondary outcomes a priori
- Pre-register studies when possible
- Apply appropriate corrections for multiple outcomes
- Clearly distinguish exploratory from confirmatory analyses
- Report all pre-specified outcomes

### 19. Baseline Imbalance and Selection Bias

**Common Problems:**
- Groups differ at baseline
- Selection criteria applied differentially
- Healthy volunteer bias
- Survivorship bias
- Indication bias in observational studies

**How to Identify:**
- Table 1 shows significant baseline differences
- Inclusion criteria different between groups
- Response rate <50% with no analysis
- Analysis only includes completers
- Groups self-selected rather than randomized

**What to Recommend:**
- Report baseline characteristics in Table 1
- Use randomization to ensure balance
- Adjust for baseline differences in analysis
- Report response rates and compare responders vs. non-responders
- Consider propensity score matching for observational data
- Use intention-to-treat analysis

### 20. Temporal and Batch Effects

**Common Problems:**
- Samples processed in batches by condition
- Temporal trends not accounted for
- Instrument drift over time
- Different operators for different groups
- Reagent lot changes between groups

**How to Identify:**
- All treatment samples processed on same day
- Controls from different time period
- No mention of batch or time effects
- Different technicians for groups
- Long study duration with no temporal analysis

**What to Recommend:**
- Randomize samples across batches/time
- Include batch as covariate in analysis
- Perform batch correction (ComBat, limma)
- Include quality control samples across batches
- Report and test for temporal trends
- Balance operators across conditions

## Reporting Issues

### 21. Incomplete Statistical Reporting

**Common Problems:**
- Test statistics not reported
- Degrees of freedom missing
- Exact p-values replaced with inequalities (p<0.05)
- No confidence intervals
- No effect sizes
- Sample sizes not reported per group

**How to Identify:**
- Only p-values given with no test statistics
- p-values reported as p<0.05 rather than exact values
- No measures of uncertainty
- Effect magnitude unclear
- n reported for total but not per group

**What to Recommend:**
- Report complete test statistics (t, F, χ², etc. with df)
- Report exact p-values (except p<0.001)
- Include 95% confidence intervals
- Report effect sizes (Cohen's d, odds ratios, correlation coefficients)
- Report n for each group in every analysis
- Consider CONSORT-style flow diagram

### 22. Methods-Results Mismatch

**Common Problems:**
- Methods describe analyses not performed
- Results include analyses not described in methods
- Different sample sizes in methods vs. results
- Methods mention controls not shown
- Statistical methods don't match what was done

**How to Identify:**
- Analyses in results without methodological description
- Methods describe experiments not in results
- Numbers don't match between sections
- Controls mentioned but not shown
- Different software mentioned than used

**What to Recommend:**
- Ensure complete concordance between methods and results
- Describe all analyses performed in methods
- Remove methodological descriptions of experiments not performed
- Verify all numbers are consistent
- Update methods to match actual analyses conducted

## How to Use This Reference

When reviewing manuscripts:
1. Read through methods and results systematically
2. Check for common issues in each category
3. Note specific problems with evidence
4. Provide constructive suggestions for improvement
5. Distinguish major issues (affect validity) from minor issues (affect clarity)
6. Prioritize reproducibility and transparency

This is not an exhaustive list but covers the most frequently encountered issues. Always consider the specific context and discipline when evaluating potential problems.
