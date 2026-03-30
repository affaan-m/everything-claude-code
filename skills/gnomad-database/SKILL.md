---
name: gnomad-database
description: Query gnomAD (Genome Aggregation Database) for population allele frequencies, variant constraint scores (pLI, LOEUF), and loss-of-function intolerance. Essential for variant pathogenicity interpretation, rare disease genetics, and identifying loss-of-function intolerant genes.
license: CC0-1.0
metadata:
    skill-author: Kuan-lin Huang
---

# gnomAD Database

## Overview

The Genome Aggregation Database (gnomAD) is the largest publicly available collection of human genetic variation, aggregated from large-scale sequencing projects. gnomAD v4 contains exome sequences from 730,947 individuals and genome sequences from 76,215 individuals across diverse ancestries. It provides population allele frequencies, variant consequence annotations, and gene-level constraint metrics that are essential for interpreting the clinical significance of genetic variants.

**Key resources:**
- gnomAD browser: https://gnomad.broadinstitute.org/
- GraphQL API: https://gnomad.broadinstitute.org/api
- Data downloads: https://gnomad.broadinstitute.org/downloads
- Documentation: https://gnomad.broadinstitute.org/help

## When to Use This Skill

Use gnomAD when:

- **Variant frequency lookup**: Checking if a variant is rare, common, or absent in the general population
- **Pathogenicity assessment**: Rare variants (MAF < 1%) are candidates for disease causation; gnomAD helps filter benign common variants
- **Loss-of-function intolerance**: Using pLI and LOEUF scores to assess whether a gene tolerates protein-truncating variants
- **Population-stratified frequencies**: Comparing allele frequencies across ancestries (African/African American, Admixed American, Ashkenazi Jewish, East Asian, Finnish, Middle Eastern, Non-Finnish European, South Asian)
- **ClinVar/ACMG variant classification**: gnomAD frequency data feeds into BA1/BS1 evidence codes for variant classification
- **Constraint analysis**: Identifying genes depleted of missense or loss-of-function variation (z-scores, pLI, LOEUF)

## Core Capabilities

### 1. gnomAD GraphQL API

gnomAD uses a GraphQL API accessible at `https://gnomad.broadinstitute.org/api`. Most queries fetch variants by gene or specific genomic position.

**Datasets available:**
- `gnomad_r4` — gnomAD v4 exomes (recommended default, GRCh38)
- `gnomad_r4_genomes` — gnomAD v4 genomes (GRCh38)
- `gnomad_r3` — gnomAD v3 genomes (GRCh38)
- `gnomad_r2_1` — gnomAD v2 exomes (GRCh37)

**Reference genomes:**
- `GRCh38` — default for v3/v4
- `GRCh37` — for v2

### 2. Querying Variants by Gene

```python
import requests

def query_gnomad_gene(gene_symbol, dataset="gnomad_r4", reference_genome="GRCh38"):
    """Fetch variants in a gene from gnomAD."""
    url = "https://gnomad.broadinstitute.org/api"

    query = """
    query GeneVariants($gene_symbol: String!, $dataset: DatasetId!, $reference_genome: ReferenceGenomeId!) {
      gene(gene_symbol: $gene_symbol, reference_genome: $reference_genome) {
        gene_id
        gene_symbol
        variants(dataset: $dataset) {
          variant_id
          pos
          ref
          alt
          consequence
          genome {
            af
            ac
            an
            ac_hom
            populations {
              id
              ac
              an
              af
            }
          }
          exome {
            af
            ac
            an
            ac_hom
          }
          lof
          lof_flags
          lof_filter
        }
      }
    }
    """

    variables = {
        "gene_symbol": gene_symbol,
        "dataset": dataset,
        "reference_genome": reference_genome
    }

    response = requests.post(url, json={"query": query, "variables": variables})
    return response.json()

# Example
result = query_gnomad_gene("BRCA1")
gene_data = result["data"]["gene"]
variants = gene_data["variants"]

# Filter to rare PTVs
rare_ptvs = [
    v for v in variants
    if v.get("lof") == "LC" or v.get("consequence") in ["stop_gained", "frameshift_variant"]
    and v.get("genome", {}).get("af", 1) < 0.001
]
print(f"Found {len(rare_ptvs)} rare PTVs in {gene_data['gene_symbol']}")
```

### 3. Querying a Specific Variant

```python
import requests

def query_gnomad_variant(variant_id, dataset="gnomad_r4"):
    """Fetch details for a specific variant (e.g., '1-55516888-G-GA')."""
    url = "https://gnomad.broadinstitute.org/api"

    query = """
    query VariantDetails($variantId: String!, $dataset: DatasetId!) {
      variant(variantId: $variantId, dataset: $dataset) {
        variant_id
        chrom
        pos
        ref
        alt
        genome {
          af
          ac
          an
          ac_hom
          populations {
            id
            ac
            an
            af
          }
        }
        exome {
          af
          ac
          an
          ac_hom
          populations {
            id
            ac
            an
            af
          }
        }
        consequence
        lof
        rsids
        in_silico_predictors {
          id
          value
          flags
        }
        clinvar_variation_id
      }
    }
    """

    response = requests.post(
        url,
        json={"query": query, "variables": {"variantId": variant_id, "dataset": dataset}}
    )
    return response.json()

# Example: query a specific variant
result = query_gnomad_variant("17-43094692-G-A")  # BRCA1 missense
variant = result["data"]["variant"]

if variant:
    genome_af = variant.get("genome", {}).get("af", "N/A")
    exome_af = variant.get("exome", {}).get("af", "N/A")
    print(f"Variant: {variant['variant_id']}")
    print(f"  Consequence: {variant['consequence']}")
    print(f"  Genome AF: {genome_af}")
    print(f"  Exome AF: {exome_af}")
    print(f"  LoF: {variant.get('lof')}")
```

### 4. Gene Constraint Scores

gnomAD constraint scores assess how tolerant a gene is to variation relative to expectation:

```python
import requests

def query_gnomad_constraint(gene_symbol, reference_genome="GRCh38"):
    """Fetch constraint scores for a gene."""
    url = "https://gnomad.broadinstitute.org/api"

    query = """
    query GeneConstraint($gene_symbol: String!, $reference_genome: ReferenceGenomeId!) {
      gene(gene_symbol: $gene_symbol, reference_genome: $reference_genome) {
        gene_id
        gene_symbol
        gnomad_constraint {
          exp_lof
          exp_mis
          exp_syn
          obs_lof
          obs_mis
          obs_syn
          oe_lof
          oe_mis
          oe_syn
          oe_lof_lower
          oe_lof_upper
          lof_z
          mis_z
          syn_z
          pLI
        }
      }
    }
    """

    response = requests.post(
        url,
        json={"query": query, "variables": {"gene_symbol": gene_symbol, "reference_genome": reference_genome}}
    )
    return response.json()

# Example
result = query_gnomad_constraint("KCNQ2")
gene = result["data"]["gene"]
constraint = gene["gnomad_constraint"]

print(f"Gene: {gene['gene_symbol']}")
print(f"  pLI:   {constraint['pLI']:.3f}  (>0.9 = LoF intolerant)")
print(f"  LOEUF: {constraint['oe_lof_upper']:.3f}  (<0.35 = highly constrained)")
print(f"  Obs/Exp LoF: {constraint['oe_lof']:.3f}")
print(f"  Missense Z:  {constraint['mis_z']:.3f}")
```

**Constraint score interpretation:**
| Score | Range | Meaning |
|-------|-------|---------|
| `pLI` | 0–1 | Probability of LoF intolerance; >0.9 = highly intolerant |
| `LOEUF` | 0–∞ | LoF observed/expected upper bound; <0.35 = constrained |
| `oe_lof` | 0–∞ | Observed/expected ratio for LoF variants |
| `mis_z` | −∞ to ∞ | Missense constraint z-score; >3.09 = constrained |
| `syn_z` | −∞ to ∞ | Synonymous z-score (control; should be near 0) |

### 5. Population Frequency Analysis

```python
import requests
import pandas as pd

def get_population_frequencies(variant_id, dataset="gnomad_r4"):
    """Extract per-population allele frequencies for a variant."""
    url = "https://gnomad.broadinstitute.org/api"

    query = """
    query PopFreqs($variantId: String!, $dataset: DatasetId!) {
      variant(variantId: $variantId, dataset: $dataset) {
        variant_id
        genome {
          populations {
            id
            ac
            an
            af
            ac_hom
          }
        }
      }
    }
    """

    response = requests.post(
        url,
        json={"query": query, "variables": {"variantId": variant_id, "dataset": dataset}}
    )
    data = response.json()
    populations = data["data"]["variant"]["genome"]["populations"]

    df = pd.DataFrame(populations)
    df = df[df["an"] > 0].copy()
    df["af"] = df["ac"] / df["an"]
    df = df.sort_values("af", ascending=False)
    return df

# Population IDs in gnomAD v4:
# afr = African/African American
# ami = Amish
# amr = Admixed American
# asj = Ashkenazi Jewish
# eas = East Asian
# fin = Finnish
# mid = Middle Eastern
# nfe = Non-Finnish European
# sas = South Asian
# remaining = Other
```

### 6. Structural Variants (gnomAD-SV)

gnomAD also contains a structural variant dataset:

```python
import requests

def query_gnomad_sv(gene_symbol):
    """Query structural variants overlapping a gene."""
    url = "https://gnomad.broadinstitute.org/api"

    query = """
    query SVsByGene($gene_symbol: String!) {
      gene(gene_symbol: $gene_symbol, reference_genome: GRCh38) {
        structural_variants {
          variant_id
          type
          chrom
          pos
          end
          af
          ac
          an
        }
      }
    }
    """

    response = requests.post(url, json={"query": query, "variables": {"gene_symbol": gene_symbol}})
    return response.json()
```

## Query Workflows

### Workflow 1: Variant Pathogenicity Assessment

1. **Check population frequency** — Is the variant rare enough to be pathogenic?
   - Use gnomAD AF < 1% for recessive, < 0.1% for dominant conditions
   - Check ancestry-specific frequencies (a variant rare overall may be common in one population)

2. **Assess functional impact** — LoF variants have highest prior probability
   - Check `lof` field: `HC` = high-confidence LoF, `LC` = low-confidence
   - Check `lof_flags` for issues like "NAGNAG_SITE", "PHYLOCSF_WEAK"

3. **Apply ACMG criteria:**
   - BA1: AF > 5% → Benign Stand-Alone
   - BS1: AF > disease prevalence threshold → Benign Supporting
   - PM2: Absent or very rare in gnomAD → Pathogenic Moderate

### Workflow 2: Gene Prioritization in Rare Disease

1. Query constraint scores for candidate genes
2. Filter for pLI > 0.9 (haploinsufficient) or LOEUF < 0.35
3. Cross-reference with observed LoF variants in the gene
4. Integrate with ClinVar and disease databases

### Workflow 3: Population Genetics Research

1. Identify variant of interest from GWAS or clinical data
2. Query per-population frequencies
3. Compare frequency differences across ancestries
4. Test for enrichment in specific founder populations

## Best Practices

- **Use gnomAD v4 (gnomad_r4)** for the most current data; use v2 (gnomad_r2_1) only for GRCh37 compatibility
- **Handle null responses**: Variants not observed in gnomAD are not necessarily pathogenic — absence is informative
- **Distinguish exome vs. genome data**: Genome data has more uniform coverage; exome data is larger but may have coverage gaps
- **Rate limit GraphQL queries**: Add delays between requests; batch queries when possible
- **Homozygous counts** (`ac_hom`) are relevant for recessive disease analysis
- **LOEUF is preferred over pLI** for gene constraint (less sensitive to sample size)

## Data Access

- **Browser**: https://gnomad.broadinstitute.org/ — interactive variant and gene browsing
- **GraphQL API**: https://gnomad.broadinstitute.org/api — programmatic access
- **Downloads**: https://gnomad.broadinstitute.org/downloads — VCF, Hail tables, constraint tables
- **Google Cloud**: gs://gcp-public-data--gnomad/

## Additional Resources

- **gnomAD website**: https://gnomad.broadinstitute.org/
- **gnomAD blog**: https://gnomad.broadinstitute.org/news
- **Downloads**: https://gnomad.broadinstitute.org/downloads
- **API explorer**: https://gnomad.broadinstitute.org/api (interactive GraphiQL)
- **Constraint documentation**: https://gnomad.broadinstitute.org/help/constraint
- **Citation**: Karczewski KJ et al. (2020) Nature. PMID: 32461654; Chen S et al. (2024) Nature. PMID: 38conservation
- **GitHub**: https://github.com/broadinstitute/gnomad-browser
