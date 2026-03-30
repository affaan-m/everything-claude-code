# gnomAD GraphQL Query Reference

## API Endpoint

```
POST https://gnomad.broadinstitute.org/api
Content-Type: application/json

Body: { "query": "<graphql_query>", "variables": { ... } }
```

## Dataset Identifiers

| ID | Description | Reference Genome |
|----|-------------|-----------------|
| `gnomad_r4` | gnomAD v4 exomes (730K individuals) | GRCh38 |
| `gnomad_r4_genomes` | gnomAD v4 genomes (76K individuals) | GRCh38 |
| `gnomad_r3` | gnomAD v3 genomes (76K individuals) | GRCh38 |
| `gnomad_r2_1` | gnomAD v2 exomes (125K individuals) | GRCh37 |
| `gnomad_r2_1_non_cancer` | v2 non-cancer subset | GRCh37 |
| `gnomad_cnv_r4` | Copy number variants | GRCh38 |

## Core Query Templates

### 1. Variants in a Gene

```graphql
query GeneVariants($gene_symbol: String!, $dataset: DatasetId!, $reference_genome: ReferenceGenomeId!) {
  gene(gene_symbol: $gene_symbol, reference_genome: $reference_genome) {
    gene_id
    gene_symbol
    chrom
    start
    stop
    variants(dataset: $dataset) {
      variant_id
      pos
      ref
      alt
      consequence
      lof
      lof_flags
      lof_filter
      genome {
        af
        ac
        an
        ac_hom
        populations { id ac an af ac_hom }
      }
      exome {
        af
        ac
        an
        ac_hom
        populations { id ac an af ac_hom }
      }
      rsids
      clinvar_variation_id
      in_silico_predictors { id value flags }
    }
  }
}
```

### 2. Single Variant Lookup

```graphql
query VariantDetails($variantId: String!, $dataset: DatasetId!) {
  variant(variantId: $variantId, dataset: $dataset) {
    variant_id
    chrom
    pos
    ref
    alt
    consequence
    lof
    lof_flags
    rsids
    genome { af ac an ac_hom populations { id ac an af } }
    exome { af ac an ac_hom populations { id ac an af } }
    in_silico_predictors { id value flags }
    clinvar_variation_id
  }
}
```

**Variant ID format:** `{chrom}-{pos}-{ref}-{alt}` (e.g., `17-43094692-G-A`)

### 3. Gene Constraint

```graphql
query GeneConstraint($gene_symbol: String!, $reference_genome: ReferenceGenomeId!) {
  gene(gene_symbol: $gene_symbol, reference_genome: $reference_genome) {
    gene_id
    gene_symbol
    gnomad_constraint {
      exp_lof exp_mis exp_syn
      obs_lof obs_mis obs_syn
      oe_lof oe_mis oe_syn
      oe_lof_lower oe_lof_upper
      oe_mis_lower oe_mis_upper
      lof_z mis_z syn_z
      pLI
      flags
    }
  }
}
```

### 4. Region Query (by genomic position)

```graphql
query RegionVariants($chrom: String!, $start: Int!, $stop: Int!, $dataset: DatasetId!, $reference_genome: ReferenceGenomeId!) {
  region(chrom: $chrom, start: $start, stop: $stop, reference_genome: $reference_genome) {
    variants(dataset: $dataset) {
      variant_id
      pos
      ref
      alt
      consequence
      genome { af ac an }
      exome { af ac an }
    }
  }
}
```

### 5. ClinVar Variants in Gene

```graphql
query ClinVarVariants($gene_symbol: String!, $reference_genome: ReferenceGenomeId!) {
  gene(gene_symbol: $gene_symbol, reference_genome: $reference_genome) {
    clinvar_variants {
      variant_id
      pos
      ref
      alt
      clinical_significance
      clinvar_variation_id
      gold_stars
      major_consequence
      in_gnomad
      gnomad_exomes { ac an af }
    }
  }
}
```

## Population IDs

| ID | Population |
|----|-----------|
| `afr` | African/African American |
| `ami` | Amish |
| `amr` | Admixed American |
| `asj` | Ashkenazi Jewish |
| `eas` | East Asian |
| `fin` | Finnish |
| `mid` | Middle Eastern |
| `nfe` | Non-Finnish European |
| `sas` | South Asian |
| `remaining` | Other/Unassigned |
| `XX` | Female (appended to above, e.g., `afr_XX`) |
| `XY` | Male |

## LoF Annotation Fields

| Field | Values | Meaning |
|-------|--------|---------|
| `lof` | `HC`, `LC`, `null` | High/low-confidence LoF, or not annotated as LoF |
| `lof_flags` | comma-separated strings | Quality flags (e.g., `NAGNAG_SITE`, `NON_CANONICAL_SPLICE_SITE`) |
| `lof_filter` | string or null | Reason for LC classification |

## In Silico Predictor IDs

Common values for `in_silico_predictors[].id`:
- `cadd` — CADD PHRED score
- `revel` — REVEL score
- `spliceai_ds_max` — SpliceAI max delta score
- `pangolin_largest_ds` — Pangolin splicing score
- `polyphen` — PolyPhen-2 prediction
- `sift` — SIFT prediction

## Python Helper

```python
import requests
import time

def gnomad_query(query: str, variables: dict, retries: int = 3) -> dict:
    """Execute a gnomAD GraphQL query with retry logic."""
    url = "https://gnomad.broadinstitute.org/api"
    headers = {"Content-Type": "application/json"}

    for attempt in range(retries):
        try:
            response = requests.post(
                url,
                json={"query": query, "variables": variables},
                headers=headers,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()

            if "errors" in result:
                print(f"GraphQL errors: {result['errors']}")
                return result

            return result
        except requests.exceptions.RequestException as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # exponential backoff
            else:
                raise

    return {}
```
