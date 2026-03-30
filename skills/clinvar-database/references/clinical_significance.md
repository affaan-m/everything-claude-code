# ClinVar Clinical Significance Interpretation Guide

## Overview

ClinVar uses standardized terminology to describe the clinical significance of genetic variants. Understanding these classifications is critical for interpreting variant reports and making informed research or clinical decisions.

## Important Disclaimer

**ClinVar data is NOT intended for direct diagnostic use or medical decision-making without review by a genetics professional.** The interpretations in ClinVar represent submitted data from various sources and should be evaluated in the context of the specific patient and clinical scenario.

## Three Classification Categories

ClinVar represents three distinct types of variant classifications:

1. **Germline variants** - Inherited variants related to Mendelian diseases and drug responses
2. **Somatic variants (Clinical Impact)** - Acquired variants with therapeutic implications
3. **Somatic variants (Oncogenicity)** - Acquired variants related to cancer development

## Germline Variant Classifications

### Standard ACMG/AMP Terms

These are the five core terms recommended by the American College of Medical Genetics and Genomics (ACMG) and Association for Molecular Pathology (AMP):

| Term | Abbreviation | Meaning | Probability |
|------|--------------|---------|-------------|
| **Pathogenic** | P | Variant causes disease | ~99% |
| **Likely Pathogenic** | LP | Variant likely causes disease | ~90% |
| **Uncertain Significance** | VUS | Insufficient evidence to classify | N/A |
| **Likely Benign** | LB | Variant likely does not cause disease | ~90% non-pathogenic |
| **Benign** | B | Variant does not cause disease | ~99% non-pathogenic |

### Low-Penetrance and Risk Allele Terms

ClinGen recommends additional terms for variants with incomplete penetrance or risk associations:

- **Pathogenic, low penetrance** - Disease-causing but not all carriers develop disease
- **Likely pathogenic, low penetrance** - Probably disease-causing with incomplete penetrance
- **Established risk allele** - Confirmed association with increased disease risk
- **Likely risk allele** - Probable association with increased disease risk
- **Uncertain risk allele** - Unclear risk association

### Additional Classification Terms

- **Drug response** - Variants affecting medication efficacy or metabolism
- **Association** - Statistical association with trait/disease
- **Protective** - Variants that reduce disease risk
- **Affects** - Variants that affect a biological function
- **Other** - Classifications that don't fit standard categories
- **Not provided** - No classification submitted

### Special Considerations

**Recessive Disorders:**
A disease-causing variant for an autosomal recessive disorder should be classified as "Pathogenic," even though heterozygous carriers will not develop disease. The classification describes the variant's effect, not the carrier status.

**Compound Heterozygotes:**
Each variant is classified independently. Two "Likely Pathogenic" variants in trans can together cause recessive disease, but each maintains its individual classification.

## Somatic Variant Classifications

### Clinical Impact (AMP/ASCO/CAP Tiers)

Based on guidelines from the Association for Molecular Pathology (AMP), American Society of Clinical Oncology (ASCO), and College of American Pathologists (CAP):

| Tier | Meaning |
|------|---------|
| **Tier I - Strong** | Variants with strong clinical significance - FDA-approved therapies or professional guidelines |
| **Tier II - Potential** | Variants with potential clinical actionability - emerging evidence |
| **Tier III - Uncertain** | Variants of unknown clinical significance |
| **Tier IV - Benign/Likely Benign** | Variants with no therapeutic implications |

### Oncogenicity (ClinGen/CGC/VICC)

Based on standards from ClinGen, Cancer Genomics Consortium (CGC), and Variant Interpretation for Cancer Consortium (VICC):

| Term | Meaning |
|------|---------|
| **Oncogenic** | Variant drives cancer development |
| **Likely Oncogenic** | Variant probably drives cancer development |
| **Uncertain Significance** | Insufficient evidence for oncogenicity |
| **Likely Benign** | Variant probably does not drive cancer |
| **Benign** | Variant does not drive cancer |

## Review Status and Star Ratings

ClinVar assigns review status ratings to indicate the strength of evidence behind classifications:

| Stars | Review Status | Description | Weight |
|-------|---------------|-------------|--------|
| ★★★★ | **Practice Guideline** | Reviewed by expert panel with published guidelines | Highest |
| ★★★ | **Expert Panel Review** | Reviewed by expert panel (e.g., ClinGen) | High |
| ★★ | **Multiple Submitters, No Conflicts** | ≥2 submitters with same classification | Moderate |
| ★ | **Criteria Provided, Single Submitter** | One submitter with supporting evidence | Standard |
| ☆ | **No Assertion Criteria** | Classification without documented criteria | Lowest |
| ☆ | **No Assertion Provided** | No classification submitted | None |

### What the Stars Mean

- **4 stars**: Highest confidence - vetted by expert panels, used in clinical practice guidelines
- **3 stars**: High confidence - expert panel review (e.g., ClinGen Variant Curation Expert Panel)
- **2 stars**: Moderate confidence - consensus among multiple independent submitters
- **1 star**: Single submitter with evidence - quality depends on submitter expertise
- **0 stars**: Low confidence - insufficient evidence or no criteria provided

## Conflicting Interpretations

### What Constitutes a Conflict?

As of June 2022, conflicts are reported between:
- Pathogenic/likely pathogenic **vs.** Uncertain significance
- Pathogenic/likely pathogenic **vs.** Benign/likely benign
- Uncertain significance **vs.** Benign/likely benign

### Conflict Resolution

When conflicts exist, ClinVar reports:
- **"Conflicting interpretations of pathogenicity"** - Disagreement on clinical significance
- Individual submissions are displayed so users can evaluate evidence
- Higher review status (more stars) carries more weight
- More recent submissions may reflect updated evidence

### Handling Conflicts in Research

When encountering conflicts:
1. Check the review status (star rating) of each interpretation
2. Examine the evidence and criteria provided by each submitter
3. Consider the date of submission (more recent may reflect new data)
4. Review population frequency data and functional studies
5. Consult expert panel classifications when available

## Aggregate Classifications

ClinVar calculates an aggregate classification when multiple submitters provide interpretations:

### No Conflicts
When all submitters agree (within the same category):
- Display: Single classification term
- Confidence: Higher with more submitters

### With Conflicts
When submitters disagree:
- Display: "Conflicting interpretations of pathogenicity"
- Details: All individual submissions shown
- Resolution: Users must evaluate evidence themselves

## Interpretation Best Practices

### For Researchers

1. **Always check review status** - Prefer variants with ★★★ or ★★★★ ratings
2. **Review submission details** - Examine evidence supporting classification
3. **Consider publication date** - Newer classifications may incorporate recent data
4. **Check assertion criteria** - Variants with ACMG criteria are more reliable
5. **Verify in context** - Population, ethnicity, and phenotype matter
6. **Follow up on conflicts** - Investigate discrepancies before making conclusions

### For Variant Annotation Pipelines

1. Prioritize higher review status classifications
2. Flag conflicting interpretations for manual review
3. Track classification changes over time
4. Include population frequency data alongside ClinVar classifications
5. Document ClinVar version and access date

### Red Flags

Be cautious with variants that have:
- Zero or one star rating
- Conflicting interpretations without resolution
- Classification as VUS (uncertain significance)
- Very old submission dates without updates
- Classification based on in silico predictions alone

## Common Query Patterns

### Search for High-Confidence Pathogenic Variants

```
BRCA1[gene] AND pathogenic[CLNSIG] AND practice guideline[RVSTAT]
```

### Filter by Review Status

```
TP53[gene] AND (reviewed by expert panel[RVSTAT] OR practice guideline[RVSTAT])
```

### Exclude Conflicting Interpretations

```
CFTR[gene] AND pathogenic[CLNSIG] NOT conflicting[RVSTAT]
```

## Updates and Reclassifications

### Why Classifications Change

Variants may be reclassified due to:
- New functional studies
- Additional population data (e.g., gnomAD)
- Updated ACMG guidelines
- Clinical evidence from more patients
- Segregation data from families

### Tracking Changes

- ClinVar maintains submission history
- Version-controlled VCV/RCV accessions
- Monthly updates to classifications
- Reclassifications can go in either direction (upgrade or downgrade)

## Key Resources

- ACMG/AMP Variant Interpretation Guidelines: Richards et al., 2015
- ClinGen Sequence Variant Interpretation Working Group: https://clinicalgenome.org/
- ClinVar Clinical Significance Documentation: https://www.ncbi.nlm.nih.gov/clinvar/docs/clinsig/
- Review Status Documentation: https://www.ncbi.nlm.nih.gov/clinvar/docs/review_status/
