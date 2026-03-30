# Target Annotations and Features

## Overview

Open Targets defines a target as "any naturally-occurring molecule that can be targeted by a medicinal product." Targets are primarily protein-coding genes identified by Ensembl gene IDs, but also include RNAs and pseudogenes from canonical chromosomes.

## Core Target Annotations

### 1. Tractability Assessment

Tractability evaluates the druggability potential of a target across different modalities.

#### Modalities Assessed:

**Small Molecule**
- Prediction of small molecule druggability
- Based on structural features, chemical precedence
- Buckets: Clinical precedence, Discovery precedence, Predicted tractable

**Antibody**
- Likelihood of antibody-based therapeutic success
- Cell surface/secreted protein location
- Precedence categories similar to small molecules

**PROTAC (Protein Degradation)**
- Assessment for targeted protein degradation
- E3 ligase compatibility
- Emerging modality category

**Other Modalities**
- Gene therapy, RNA-based therapeutics
- Oligonucleotide approaches

#### Tractability Levels:

1. **Clinical Precedence** - Target of approved/clinical drug with similar mechanism
2. **Discovery Precedence** - Target of tool compounds or compounds in preclinical development
3. **Predicted Tractable** - Computational predictions suggest druggability
4. **Unknown** - Insufficient data to assess

### 2. Safety Liabilities

Safety information aggregated from multiple sources to identify potential toxicity concerns.

#### Data Sources:

**ToxCast**
- High-throughput toxicology screening data
- In vitro assay results
- Toxicity pathway activation

**AOPWiki (Adverse Outcome Pathways)**
- Mechanistic pathways from molecular initiating event to adverse outcome
- Systems toxicology frameworks

**PharmGKB**
- Pharmacogenomic relationships
- Genetic variants affecting drug response and toxicity

**Published Literature**
- Expert-curated safety concerns from publications
- Clinical trial adverse events

#### Safety Flags:

- **Organ toxicity** - Liver, kidney, cardiac effects
- **Target safety liability** - Known on-target toxic effects
- **Off-target effects** - Unintended activity concerns
- **Clinical observations** - Adverse events from drugs targeting gene

### 3. Baseline Expression

Gene/protein expression across tissues and cell types from multiple sources.

#### Data Sources:

**Expression Atlas**
- RNA-Seq expression across tissues/conditions
- Normalized expression levels (TPM, FPKM)
- Differential expression studies

**GTEx (Genotype-Tissue Expression)**
- Comprehensive tissue expression from healthy donors
- Median TPM across 53 tissues
- Expression variation analysis

**Human Protein Atlas**
- Protein expression via immunohistochemistry
- Subcellular localization
- Tissue specificity classifications

#### Expression Metrics:

- **TPM (Transcripts Per Million)** - Normalized RNA abundance
- **Tissue specificity** - Enrichment in specific tissues
- **Protein level** - Correlation with RNA expression
- **Subcellular location** - Where protein is found in cell

### 4. Molecular Interactions

Protein-protein interactions, complex memberships, and molecular partnerships.

#### Interaction Types:

**Physical Interactions**
- Direct protein-protein binding
- Complex components
- Sources: IntAct, BioGRID, STRING

**Pathway Membership**
- Biological pathways from Reactome
- Functional relationships
- Upstream/downstream regulators

**Target Interactors**
- Direct interactors relevant to disease associations
- Context-specific interactions

### 5. Gene Essentiality

Dependency data indicating if gene is essential for cell survival.

#### Data Sources:

**Project Score**
- CRISPR-Cas9 fitness screens
- 300+ cancer cell lines
- Scaled essentiality scores (0-1)

**DepMap Portal**
- Large-scale cancer dependency data
- Genetic and pharmacological perturbations
- Common essential genes identification

#### Essentiality Metrics:

- **Score range**: 0 (non-essential) to 1 (essential)
- **Context**: Cell line specific vs. pan-essential
- **Therapeutic window**: Selectivity between disease and normal cells

### 6. Chemical Probes and Tool Compounds

High-quality small molecules for target validation.

#### Sources:

**Probes & Drugs Portal**
- Chemical probes with characterized selectivity
- Quality ratings and annotations
- Target engagement data

**Structural Genomics Consortium (SGC)**
- Target Enabling Packages (TEPs)
- Comprehensive target reagents
- Freely available to academia

**Probe Criteria:**
- Potency (typically IC50 < 100 nM)
- Selectivity (>30-fold vs. off-targets)
- Cell activity demonstrated
- Negative control available

### 7. Pharmacogenetics

Genetic variants affecting drug response for drugs targeting the gene.

#### Data Source: ClinPGx

**Information Included:**
- Variant-drug pairs
- Clinical annotations (dosing, efficacy, toxicity)
- Evidence level and sources
- PharmGKB cross-references

**Clinical Utility:**
- Dosing adjustments based on genotype
- Contraindications for specific variants
- Efficacy predictors

### 8. Genetic Constraint

Measures of negative selection against variants in the gene.

#### Data Source: gnomAD

**Metrics:**

**pLI (probability of Loss-of-function Intolerance)**
- Range: 0-1
- pLI > 0.9 indicates intolerant to LoF variants
- High pLI suggests essentiality

**LOEUF (Loss-of-function Observed/Expected Upper bound Fraction)**
- Lower values indicate greater constraint
- More interpretable than pLI across range

**Missense Constraint**
- Z-scores for missense depletion
- O/E ratios for missense variants

**Interpretation:**
- High constraint suggests important biological function
- May indicate safety concerns if inhibited
- Essential genes often show high constraint

### 9. Comparative Genomics

Cross-species gene conservation and ortholog information.

#### Data Source: Ensembl Compara

**Ortholog Data:**
- Mouse, rat, zebrafish, other model organisms
- Orthology confidence (1:1, 1:many, many:many)
- Percent identity and similarity

**Utility:**
- Model organism studies transferability
- Functional conservation assessment
- Evolution and selective pressure

### 10. Cancer Annotations

Cancer-specific target features for oncology indications.

#### Data Sources:

**Cancer Gene Census**
- Role in cancer (oncogene, TSG, fusion)
- Tier classification (1 = established, 2 = emerging)
- Tumor types and mutation types

**Cancer Hallmarks**
- Functional roles in cancer biology
- Hallmarks: proliferation, apoptosis evasion, metastasis, etc.
- Links to specific cancer processes

**Oncology Clinical Trials**
- Drugs in development targeting gene for cancer
- Trial phases and indications

### 11. Mouse Phenotypes

Phenotypes from mouse knockout/mutation studies.

#### Data Source: MGI (Mouse Genome Informatics)

**Phenotype Data:**
- Knockout phenotypes
- Disease model associations
- Mammalian Phenotype Ontology (MP) terms

**Utility:**
- Predict on-target effects
- Safety liability identification
- Mechanism of action insights

### 12. Pathways

Biological pathway annotations placing target in functional context.

#### Data Source: Reactome

**Pathway Information:**
- Curated biological pathways
- Hierarchical organization
- Pathway diagrams with target position

**Applications:**
- Mechanism hypothesis generation
- Related target identification
- Systems biology analysis

## Using Target Annotations in Queries

### Query Template: Comprehensive Target Profile

```python
query = """
  query targetProfile($ensemblId: String!) {
    target(ensemblId: $ensemblId) {
      id
      approvedSymbol
      approvedName
      biotype

      # Tractability
      tractability {
        label
        modality
        value
      }

      # Safety
      safetyLiabilities {
        event
        effects {
          dosing
          organsAffected
        }
      }

      # Expression
      expressions {
        tissue {
          label
        }
        rna {
          value
          level
        }
        protein {
          level
        }
      }

      # Chemical probes
      chemicalProbes {
        id
        probeminer
        origin
      }

      # Known drugs
      knownDrugs {
        uniqueDrugs
        rows {
          drug {
            name
            maximumClinicalTrialPhase
          }
          phase
          status
        }
      }

      # Genetic constraint
      geneticConstraint {
        constraintType
        score
        exp
        obs
      }

      # Pathways
      pathways {
        pathway
        pathwayId
      }
    }
  }
"""

variables = {"ensemblId": "ENSG00000157764"}
```

## Annotation Interpretation Guidelines

### For Target Prioritization:

1. **Druggability (Tractability):**
   - Clinical precedence >> Discovery precedence > Predicted
   - Consider modality relevant to therapeutic approach
   - Check for existing tool compounds

2. **Safety Assessment:**
   - Review organ toxicity signals
   - Check expression in critical tissues
   - Assess genetic constraint (high = safety concern if inhibited)
   - Evaluate clinical adverse events from drugs

3. **Disease Relevance:**
   - Combine with association scores
   - Check expression in disease-relevant tissues
   - Review pathway context

4. **Validation Readiness:**
   - Chemical probes available?
   - Model organism data supportive?
   - Known drugs provide mechanism insight?

5. **Clinical Path Considerations:**
   - Pharmacogenetic factors
   - Expression pattern (tissue-specific is better for selectivity)
   - Essentiality (non-essential better for safety)

### Red Flags:

- **High essentiality + ubiquitous expression** - Poor therapeutic window
- **Multiple safety liabilities** - Toxicity concerns
- **High genetic constraint (pLI > 0.9)** - Critical gene, inhibition may be harmful
- **No tractability precedence** - Higher risk, longer development
- **Conflicting evidence** - Requires deeper investigation

### Green Flags:

- **Clinical precedence + related indication** - De-risked mechanism
- **Tissue-specific expression** - Better selectivity
- **Chemical probes available** - Faster validation
- **Low essentiality + disease relevance** - Good therapeutic window
- **Multiple evidence types converge** - Higher confidence
