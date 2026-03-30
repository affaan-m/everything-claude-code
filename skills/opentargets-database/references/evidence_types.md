# Evidence Types and Data Sources

## Overview

Evidence represents any event or set of events that identifies a target as a potential causal gene or protein for a disease. Evidence is standardized and mapped to:
- **Ensembl gene IDs** for targets
- **EFO (Experimental Factor Ontology)** for diseases/phenotypes

Evidence is organized into **data types** (broader categories) and **data sources** (specific databases/studies).

## Evidence Data Types

### 1. Genetic Association

Evidence from human genetics linking genetic variants to disease phenotypes.

#### Data Sources:

**GWAS (Genome-Wide Association Studies)**
- Population-level common variant associations
- Filtered with Locus-to-Gene (L2G) scores >0.05
- Includes fine-mapping and colocalization data
- Sources: GWAS Catalog, FinnGen, UK Biobank, EBI GWAS

**Gene Burden Tests**
- Rare variant association analyses
- Aggregate effects of multiple rare variants in a gene
- Particularly relevant for Mendelian and rare diseases

**ClinVar Germline**
- Clinical variant interpretations
- Classifications: pathogenic, likely pathogenic, VUS, benign
- Expert-reviewed variant-disease associations

**Genomics England PanelApp**
- Expert gene-disease ratings
- Green (confirmed), amber (probable), red (no evidence)
- Focus on rare diseases and cancer

**Gene2Phenotype**
- Curated gene-disease relationships
- Allelic requirements and inheritance patterns
- Clinical validity assessments

**UniProt Literature & Variants**
- Literature-based gene-disease associations
- Expert-curated from scientific publications

**Orphanet**
- Rare disease gene associations
- Expert-reviewed and maintained

**ClinGen**
- Clinical genome resource classifications
- Gene-disease validity assertions

### 2. Somatic Mutations

Evidence from cancer genomics identifying driver genes and therapeutic targets.

#### Data Sources:

**Cancer Gene Census**
- Expert-curated cancer genes
- Tier classifications (1 = strong evidence, 2 = emerging)
- Mutation types and cancer types

**IntOGen**
- Computational driver gene predictions
- Aggregated from large cohort studies
- Statistical significance of mutations

**ClinVar Somatic**
- Somatic clinical variant interpretations
- Oncogenic/likely oncogenic classifications

**Cancer Biomarkers**
- FDA/EMA approved biomarkers
- Clinical trial biomarkers
- Prognostic and predictive markers

### 3. Known Drugs

Evidence from clinical precedence showing drugs targeting genes for disease indications.

#### Data Source:

**ChEMBL**
- Approved drugs (Phase 4)
- Clinical candidates (Phase 1-3)
- Withdrawn drugs
- Drug-target-indication triplets with mechanism of action

**Clinical Trial Information:**
- `phase`: Maximum clinical trial phase (1, 2, 3, 4)
- `status`: Active, terminated, completed, withdrawn
- `mechanismOfAction`: How drug affects target

### 4. Affected Pathways

Evidence linking genes to disease through pathway perturbations and functional screens.

#### Data Sources:

**CRISPR Screens**
- Genome-scale knockout screens
- Cancer dependency and essentiality data

**Project Score (Cancer Dependency Map)**
- CRISPR-Cas9 fitness screens across cancer cell lines
- Gene essentiality profiles

**SLAPenrich**
- Pathway enrichment analysis
- Somatic mutation pathway impacts

**PROGENy**
- Pathway activity inference
- Signaling pathway perturbations

**Reactome**
- Expert-curated pathway annotations
- Biological pathway representations

**Gene Signatures**
- Expression-based signatures
- Pathway activity patterns

### 5. RNA Expression

Evidence from differential gene expression in disease vs. control tissues.

#### Data Source:

**Expression Atlas**
- Differential expression data
- Baseline expression across tissues/conditions
- RNA-Seq and microarray studies
- Log2 fold-change and p-values

### 6. Animal Models

Evidence from in vivo studies showing phenotypes associated with gene perturbations.

#### Data Source:

**IMPC (International Mouse Phenotyping Consortium)**
- Systematic mouse knockout phenotypes
- Phenotype-disease mappings via ontologies
- Standardized phenotyping procedures

### 7. Literature

Evidence from text-mining of biomedical literature.

#### Data Source:

**Europe PMC**
- Co-occurrence of genes and diseases in abstracts
- Normalized citation counts
- Weighted by publication type and recency

## Evidence Scoring

Each evidence source has its own scoring methodology:

### Score Ranges
- Most scores normalized to 0-1 range
- Higher scores indicate stronger evidence
- Scores are NOT confidence levels but relative strength indicators

### Common Scoring Approaches:

**Binary Classifications:**
- ClinVar: Pathogenic (1.0), Likely pathogenic (0.99), etc.
- Gene2Phenotype: Confirmed/probable ratings
- PanelApp: Green/amber/red classifications

**Statistical Measures:**
- GWAS: L2G scores incorporating multiple lines of evidence
- Gene Burden: Statistical significance of variant aggregation
- Expression: Adjusted p-values and fold-changes

**Clinical Precedence:**
- Known Drugs: Phase weights (Phase 4 = 1.0, Phase 3 = 0.8, etc.)
- Clinical status modifiers

**Computational Predictions:**
- IntOGen: Q-values from driver mutation analysis
- PROGENy/SLAPenrich: Pathway activity/enrichment scores

## Evidence Interpretation Guidelines

### Strengths by Data Type

**Genetic Association** - Strongest human genetic evidence
- Direct link between genetic variation and disease
- Mendelian diseases: high confidence
- GWAS: requires L2G to identify causal gene
- Consider ancestry and population-specific effects

**Somatic Mutations** - Direct evidence in cancer
- Strong for oncology indications
- Driver mutations indicate therapeutic potential
- Consider cancer type specificity

**Known Drugs** - Clinical validation
- Highest confidence: approved drugs (Phase 4)
- Consider mechanism relevance to new indication
- Phase 1-2: early evidence, higher risk

**Affected Pathways** - Mechanistic insights
- Supports biological plausibility
- May not predict clinical success
- Useful for hypothesis generation

**RNA Expression** - Observational evidence
- Correlation, not causation
- May reflect disease consequence vs. cause
- Useful for biomarker identification

**Animal Models** - Translational evidence
- Strong for understanding biology
- Variable translation to human disease
- Most useful when phenotype matches human disease

**Literature** - Exploratory signal
- Text-mining captures research focus
- May reflect publication bias
- Requires manual literature review for validation

### Important Considerations

1. **Multiple evidence types strengthen confidence** - Convergent evidence from different data types provides stronger support

2. **Under-studied diseases score lower** - Novel or rare diseases may have strong evidence but lower aggregate scores due to limited research

3. **Association scores are not probabilities** - Scores rank relative evidence strength, not success probability

4. **Context matters** - Evidence strength depends on:
   - Disease mechanism understanding
   - Target biology and druggability
   - Clinical precedence in related indications
   - Safety considerations

5. **Data source reliability varies** - Weight expert-curated sources (ClinGen, Gene2Phenotype) higher than computational predictions

## Using Evidence in Queries

### Filtering by Data Type

```python
query = """
  query evidenceByType($ensemblId: String!, $efoId: String!, $dataTypes: [String!]) {
    disease(efoId: $efoId) {
      evidences(ensemblIds: [$ensemblId], datatypes: $dataTypes) {
        rows {
          datasourceId
          score
        }
      }
    }
  }
"""
variables = {
    "ensemblId": "ENSG00000157764",
    "efoId": "EFO_0000249",
    "dataTypes": ["genetic_association", "somatic_mutation"]
}
```

### Accessing Data Type Scores

Data type scores aggregate all source scores within that type:

```python
query = """
  query associationScores($ensemblId: String!, $efoId: String!) {
    target(ensemblId: $ensemblId) {
      associatedDiseases(efoIds: [$efoId]) {
        rows {
          disease {
            name
          }
          score
          datatypeScores {
            componentId
            score
          }
        }
      }
    }
  }
"""
```

## Evidence Quality Assessment

When evaluating evidence:

1. **Check multiple sources** - Single source may be unreliable
2. **Prioritize human genetic evidence** - Strongest disease relevance
3. **Consider clinical precedence** - Known drugs indicate druggability
4. **Assess mechanistic support** - Pathway evidence supports biology
5. **Review literature manually** - For critical decisions, read primary publications
6. **Validate in primary databases** - Cross-reference with ClinVar, ClinGen, etc.
