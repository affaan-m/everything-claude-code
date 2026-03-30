# Common PubMed Query Patterns

This reference provides practical examples of common PubMed search patterns for various research scenarios.

## General Research Queries

### Finding Recent Research on a Topic
```
breast cancer[tiab] AND 2023:2024[dp]
```

### Systematic Reviews on a Topic
```
(diabetes[tiab] OR diabetes mellitus[mh]) AND systematic review[pt]
```

### Meta-Analyses
```
hypertension[tiab] AND meta-analysis[pt] AND 2020:2024[dp]
```

### Clinical Trials
```
alzheimer disease[mh] AND randomized controlled trial[pt]
```

### Finding Guidelines
```
asthma[tiab] AND (guideline[pt] OR practice guideline[pt])
```

## Disease-Specific Queries

### Cancer Research
```
# General cancer screening
cancer screening[tiab] AND systematic review[pt] AND 2020:2024[dp]

# Specific cancer type with treatment
lung cancer[tiab] AND immunotherapy[tiab] AND clinical trial[pt]

# Cancer genetics
breast neoplasms[mh] AND BRCA1[tiab] AND genetic testing[tiab]
```

### Cardiovascular Disease
```
# Heart disease prevention
(heart disease[tiab] OR cardiovascular disease[mh]) AND prevention[tiab] AND 2022:2024[dp]

# Stroke treatment
stroke[mh] AND (thrombectomy[tiab] OR thrombolysis[tiab]) AND randomized controlled trial[pt]

# Hypertension management
hypertension[mh]/drug therapy AND comparative effectiveness[tiab]
```

### Infectious Diseases
```
# COVID-19 research
COVID-19[tiab] AND (vaccine[tiab] OR vaccination[tiab]) AND 2023:2024[dp]

# Antibiotic resistance
(antibiotic resistance[tiab] OR drug resistance, bacterial[mh]) AND systematic review[pt]

# Tuberculosis treatment
tuberculosis[mh]/drug therapy AND (multidrug-resistant[tiab] OR MDR-TB[tiab])
```

### Neurological Disorders
```
# Alzheimer's disease
alzheimer disease[mh] AND (diagnosis[sh] OR biomarkers[tiab]) AND 2020:2024[dp]

# Parkinson's disease treatment
parkinson disease[mh] AND treatment[tiab] AND clinical trial[pt]

# Multiple sclerosis
multiple sclerosis[mh] AND disease modifying[tiab] AND review[pt]
```

### Diabetes
```
# Type 2 diabetes management
diabetes mellitus, type 2[mh] AND (lifestyle[tiab] OR diet[tiab]) AND randomized controlled trial[pt]

# Diabetes complications
diabetes mellitus[mh] AND (complications[sh] OR diabetic neuropathy[mh])

# New diabetes drugs
diabetes mellitus, type 2[mh] AND (GLP-1[tiab] OR SGLT2[tiab]) AND 2022:2024[dp]
```

## Drug and Treatment Research

### Drug Efficacy Studies
```
# Compare two drugs
(drug A[nm] OR drug B[nm]) AND condition[mh] AND comparative effectiveness[tiab]

# Drug side effects
medication name[nm] AND (adverse effects[sh] OR side effects[tiab])

# Drug combination therapy
(aspirin[nm] AND clopidogrel[nm]) AND acute coronary syndrome[mh]
```

### Treatment Comparisons
```
# Surgery vs medication
condition[mh] AND (surgery[tiab] OR surgical[tiab]) AND (medication[tiab] OR drug therapy[sh]) AND comparative study[pt]

# Different surgical approaches
procedure[tiab] AND (laparoscopic[tiab] OR open surgery[tiab]) AND outcomes[tiab]
```

### Alternative Medicine
```
# Herbal supplements
(herbal medicine[mh] OR phytotherapy[mh]) AND condition[tiab] AND clinical trial[pt]

# Acupuncture
acupuncture[mh] AND pain[tiab] AND randomized controlled trial[pt]
```

## Diagnostic Research

### Diagnostic Tests
```
# Sensitivity and specificity
test name[tiab] AND condition[tiab] AND (sensitivity[tiab] AND specificity[tiab])

# Diagnostic imaging
(MRI[tiab] OR magnetic resonance imaging[tiab]) AND brain tumor[tiab] AND diagnosis[sh]

# Lab test evaluation
biomarker name[tiab] AND disease[tiab] AND (diagnostic[tiab] OR screening[tiab])
```

### Screening Programs
```
# Cancer screening
cancer type[tiab] AND screening[tiab] AND (cost effectiveness[tiab] OR benefit[tiab])

# Population screening
condition[tiab] AND mass screening[mh] AND public health[tiab]
```

## Population-Specific Queries

### Pediatric Research
```
# Children with specific condition
condition[tiab] AND (child[mh] OR pediatric[tiab]) AND treatment[tiab]

# Age-specific
disease[tiab] AND (infant[mh] OR child, preschool[mh])

# Pediatric dosing
drug name[nm] AND pediatric[tiab] AND (dosing[tiab] OR dose[tiab])
```

### Geriatric Research
```
# Elderly population
condition[tiab] AND (aged[mh] OR elderly[tiab] OR geriatric[tiab])

# Aging and disease
aging[mh] AND disease[tiab] AND mechanism[tiab]

# Polypharmacy
polypharmacy[tiab] AND elderly[tiab] AND adverse effects[tiab]
```

### Pregnant Women
```
# Pregnancy and medications
drug name[nm] AND (pregnancy[mh] OR pregnant women[tiab]) AND safety[tiab]

# Pregnancy complications
pregnancy complication[tiab] AND management[tiab]
```

### Sex-Specific Research
```
# Female-specific
condition[tiab] AND female[mh] AND hormones[tiab]

# Male-specific
disease[tiab] AND male[mh] AND risk factors[tiab]

# Sex differences
condition[tiab] AND (sex factors[mh] OR gender differences[tiab])
```

## Epidemiology and Public Health

### Prevalence Studies
```
disease[tiab] AND (prevalence[tiab] OR epidemiology[sh]) AND country/region[tiab]
```

### Incidence Studies
```
condition[tiab] AND incidence[tiab] AND population[tiab] AND 2020:2024[dp]
```

### Risk Factors
```
disease[mh] AND (risk factors[mh] OR etiology[sh]) AND cohort study[tiab]
```

### Global Health
```
disease[tiab] AND (developing countries[mh] OR low income[tiab]) AND burden[tiab]
```

### Health Disparities
```
condition[tiab] AND (health disparities[tiab] OR health equity[tiab]) AND minority groups[tiab]
```

## Methodology-Specific Queries

### Research Methodology

#### Cohort Studies
```
condition[tiab] AND cohort study[tiab] AND prospective[tiab]
```

#### Case-Control Studies
```
disease[tiab] AND case-control studies[mh] AND risk factors[tiab]
```

#### Cross-Sectional Studies
```
condition[tiab] AND cross-sectional studies[mh] AND prevalence[tiab]
```

### Statistical Methods
```
# Machine learning in medicine
(machine learning[tiab] OR artificial intelligence[tiab]) AND diagnosis[tiab] AND validation[tiab]

# Bayesian analysis
condition[tiab] AND bayes theorem[mh] AND clinical decision[tiab]
```

### Genetic and Molecular Research
```
# GWAS studies
disease[tiab] AND (genome-wide association study[tiab] OR GWAS[tiab])

# Gene expression
gene name[tiab] AND (gene expression[mh] OR mRNA[tiab]) AND disease[tiab]

# Proteomics
condition[tiab] AND proteomics[mh] AND biomarkers[tiab]

# CRISPR research
CRISPR[tiab] AND (gene editing[tiab] OR genome editing[tiab]) AND 2020:2024[dp]
```

## Author and Institution Queries

### Finding Work by Specific Author
```
# Single author
smith ja[au] AND cancer[tiab] AND 2023:2024[dp]

# First author only
jones m[1au] AND cardiology[tiab]

# Multiple authors from same group
(smith ja[au] OR jones m[au] OR wilson k[au]) AND research topic[tiab]
```

### Institution-Specific Research
```
# University affiliation
harvard[affil] AND cancer research[tiab] AND 2023:2024[dp]

# Hospital research
"mayo clinic"[affil] AND clinical trial[pt]

# Country-specific
japan[affil] AND robotics[tiab] AND surgery[tiab]
```

## Journal-Specific Queries

### High-Impact Journals
```
# Specific journal
nature[ta] AND genetics[tiab] AND 2024[dp]

# Multiple journals
(nature[ta] OR science[ta] OR cell[ta]) AND immunology[tiab]

# Journal with ISSN
0028-4793[issn] AND clinical trial[pt]
```

## Citation and Reference Queries

### Finding Specific Articles
```
# By PMID
12345678[pmid]

# By DOI
10.1056/NEJMoa123456[doi]

# By first author and year
smith ja[1au] AND 2023[dp] AND cancer[tiab]
```

### Finding Cited Work
```
# Related articles
Similar Articles feature from any PubMed result

# By keyword in references
Use "Cited by" links when available
```

## Advanced Combination Queries

### Comprehensive Literature Review
```
(disease name[tiab] OR disease name[mh]) AND
((treatment[tiab] OR therapy[tiab] OR management[tiab]) OR
(diagnosis[tiab] OR screening[tiab]) OR
(epidemiology[tiab] OR prevalence[tiab])) AND
(systematic review[pt] OR meta-analysis[pt] OR review[pt]) AND
2019:2024[dp] AND english[la]
```

### Precision Medicine Query
```
(precision medicine[tiab] OR personalized medicine[tiab] OR pharmacogenomics[mh]) AND
cancer[tiab] AND
(biomarkers[tiab] OR genetic testing[tiab]) AND
clinical application[tiab] AND
2020:2024[dp]
```

### Translational Research
```
(basic science[tiab] OR bench to bedside[tiab] OR translational medical research[mh]) AND
disease[tiab] AND
(clinical trial[pt] OR clinical application[tiab]) AND
2020:2024[dp]
```

## Quality Filters

### High-Quality Evidence
```
condition[tiab] AND
(randomized controlled trial[pt] OR systematic review[pt] OR meta-analysis[pt]) AND
humans[mh] AND
english[la] AND
2020:2024[dp]
```

### Free Full Text Articles
```
topic[tiab] AND free full text[sb] AND 2023:2024[dp]
```

### Articles with Abstracts
```
condition[tiab] AND hasabstract[text] AND review[pt]
```

## Staying Current

### Latest Publications
```
topic[tiab] AND 2024[dp] AND english[la]
```

### Preprints and Early Access
```
topic[tiab] AND (epub ahead of print[tiab] OR publisher[sb])
```

### Setting Up Alerts
```
# Create search and save to My NCBI
# Enable email alerts for new matching articles
topic[tiab] AND (randomized controlled trial[pt] OR systematic review[pt])
```

## COVID-19 Specific Queries

### Vaccine Research
```
(COVID-19[tiab] OR SARS-CoV-2[tiab]) AND
(vaccine[tiab] OR vaccination[tiab]) AND
(efficacy[tiab] OR effectiveness[tiab]) AND
2023:2024[dp]
```

### Long COVID
```
(long covid[tiab] OR post-acute covid[tiab] OR PASC[tiab]) AND
(symptoms[tiab] OR treatment[tiab])
```

### COVID Treatment
```
COVID-19[tiab] AND
(antiviral[tiab] OR monoclonal antibody[tiab] OR treatment[tiab]) AND
randomized controlled trial[pt]
```

## Tips for Constructing Queries

### 1. PICO Framework
Use PICO (Population, Intervention, Comparison, Outcome) to structure clinical queries:

```
P: diabetes mellitus, type 2[mh]
I: metformin[nm]
C: lifestyle modification[tiab]
O: glycemic control[tiab]

Query: diabetes mellitus, type 2[mh] AND (metformin[nm] OR lifestyle modification[tiab]) AND glycemic control[tiab]
```

### 2. Iterative Refinement
Start broad, review results, refine:
```
1. diabetes → too broad
2. diabetes mellitus type 2 → better
3. diabetes mellitus, type 2[mh] AND metformin[nm] → more specific
4. diabetes mellitus, type 2[mh] AND metformin[nm] AND randomized controlled trial[pt] → focused
```

### 3. Use Search History
Combine previous searches in Advanced Search:
```
#1: diabetes mellitus, type 2[mh]
#2: cardiovascular disease[mh]
#3: #1 AND #2 AND risk factors[tiab]
```

### 4. Save Effective Searches
Create My NCBI account to save successful queries for future use and set up automatic alerts.
