---
name: cbioportal-database
description: Query cBioPortal for cancer genomics data including somatic mutations, copy number alterations, gene expression, and survival data across hundreds of cancer studies. Essential for cancer target validation, oncogene/tumor suppressor analysis, and patient-level genomic profiling.
license: LGPL-3.0
metadata:
    skill-author: Kuan-lin Huang
---

# cBioPortal Database

## Overview

cBioPortal for Cancer Genomics (https://www.cbioportal.org/) is an open-access resource for exploring, visualizing, and analyzing multidimensional cancer genomics data. It hosts data from The Cancer Genome Atlas (TCGA), AACR Project GENIE, MSK-IMPACT, and hundreds of other cancer studies — covering mutations, copy number alterations (CNA), structural variants, mRNA/protein expression, methylation, and clinical data for thousands of cancer samples.

**Key resources:**
- cBioPortal website: https://www.cbioportal.org/
- REST API: https://www.cbioportal.org/api/
- API docs (Swagger): https://www.cbioportal.org/api/swagger-ui/index.html
- Python client: `bravado` or `requests`
- GitHub: https://github.com/cBioPortal/cbioportal

## When to Use This Skill

Use cBioPortal when:

- **Mutation landscape**: What fraction of a cancer type has mutations in a specific gene?
- **Oncogene/TSG validation**: Is a gene frequently mutated, amplified, or deleted in cancer?
- **Co-mutation patterns**: Are mutations in gene A and gene B mutually exclusive or co-occurring?
- **Survival analysis**: Do mutations in a gene associate with better or worse patient outcomes?
- **Alteration profiles**: What types of alterations (missense, truncating, amplification, deletion) affect a gene?
- **Pan-cancer analysis**: Compare alteration frequencies across cancer types
- **Clinical associations**: Link genomic alterations to clinical variables (stage, grade, treatment response)
- **TCGA/GENIE exploration**: Systematic access to TCGA and clinical sequencing datasets

## Core Capabilities

### 1. cBioPortal REST API

Base URL: `https://www.cbioportal.org/api`

The API is RESTful, returns JSON, and requires no API key for public data.

```python
import requests

BASE_URL = "https://www.cbioportal.org/api"
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}

def cbioportal_get(endpoint, params=None):
    url = f"{BASE_URL}/{endpoint}"
    response = requests.get(url, params=params, headers=HEADERS)
    response.raise_for_status()
    return response.json()

def cbioportal_post(endpoint, body):
    url = f"{BASE_URL}/{endpoint}"
    response = requests.post(url, json=body, headers=HEADERS)
    response.raise_for_status()
    return response.json()
```

### 2. Browse Studies

```python
def get_all_studies():
    """List all available cancer studies."""
    return cbioportal_get("studies", {"pageSize": 500})

# Each study has:
# studyId: unique identifier (e.g., "brca_tcga")
# name: human-readable name
# description: dataset description
# cancerTypeId: cancer type abbreviation
# referenceGenome: GRCh37 or GRCh38
# pmid: associated publication

studies = get_all_studies()
print(f"Total studies: {len(studies)}")

# Common TCGA study IDs:
# brca_tcga, luad_tcga, coadread_tcga, gbm_tcga, prad_tcga,
# skcm_tcga, blca_tcga, hnsc_tcga, lihc_tcga, stad_tcga

# Filter for TCGA studies
tcga_studies = [s for s in studies if "tcga" in s["studyId"]]
print([s["studyId"] for s in tcga_studies[:10]])
```

### 3. Molecular Profiles

Each study has multiple molecular profiles (mutation, CNA, expression, etc.):

```python
def get_molecular_profiles(study_id):
    """Get all molecular profiles for a study."""
    return cbioportal_get(f"studies/{study_id}/molecular-profiles")

profiles = get_molecular_profiles("brca_tcga")
for p in profiles:
    print(f"  {p['molecularProfileId']}: {p['name']} ({p['molecularAlterationType']})")

# Alteration types:
# MUTATION_EXTENDED — somatic mutations
# COPY_NUMBER_ALTERATION — CNA (GISTIC)
# MRNA_EXPRESSION — mRNA expression
# PROTEIN_LEVEL — RPPA protein expression
# STRUCTURAL_VARIANT — fusions/rearrangements
```

### 4. Mutation Data

```python
def get_mutations(molecular_profile_id, entrez_gene_ids, sample_list_id=None):
    """Get mutations for specified genes in a molecular profile."""
    body = {
        "entrezGeneIds": entrez_gene_ids,
        "sampleListId": sample_list_id or molecular_profile_id.replace("_mutations", "_all")
    }
    return cbioportal_post(
        f"molecular-profiles/{molecular_profile_id}/mutations/fetch",
        body
    )

# BRCA1 Entrez ID is 672, TP53 is 7157, PTEN is 5728
mutations = get_mutations("brca_tcga_mutations", entrez_gene_ids=[7157])  # TP53

# Each mutation record contains:
# patientId, sampleId, entrezGeneId, gene.hugoGeneSymbol
# mutationType (Missense_Mutation, Nonsense_Mutation, Frame_Shift_Del, etc.)
# proteinChange (e.g., "R175H")
# variantClassification, variantType
# ncbiBuild, chr, startPosition, endPosition, referenceAllele, variantAllele
# mutationStatus (Somatic/Germline)
# alleleFreqT (tumor VAF)

import pandas as pd
df = pd.DataFrame(mutations)
print(df[["patientId", "mutationType", "proteinChange", "alleleFreqT"]].head())
print(f"\nMutation types:\n{df['mutationType'].value_counts()}")
```

### 5. Copy Number Alteration Data

```python
def get_cna(molecular_profile_id, entrez_gene_ids):
    """Get discrete CNA data (GISTIC: -2, -1, 0, 1, 2)."""
    body = {
        "entrezGeneIds": entrez_gene_ids,
        "sampleListId": molecular_profile_id.replace("_gistic", "_all").replace("_cna", "_all")
    }
    return cbioportal_post(
        f"molecular-profiles/{molecular_profile_id}/discrete-copy-number/fetch",
        body
    )

# GISTIC values:
# -2 = Deep deletion (homozygous loss)
# -1 = Shallow deletion (heterozygous loss)
#  0 = Diploid (neutral)
#  1 = Low-level gain
#  2 = High-level amplification

cna_data = get_cna("brca_tcga_gistic", entrez_gene_ids=[1956])  # EGFR
df_cna = pd.DataFrame(cna_data)
print(df_cna["value"].value_counts())
```

### 6. Alteration Frequency (OncoPrint-style)

```python
def get_alteration_frequency(study_id, gene_symbols, alteration_types=None):
    """Compute alteration frequencies for genes across a cancer study."""
    import requests, pandas as pd

    # Get sample list
    samples = requests.get(
        f"{BASE_URL}/studies/{study_id}/sample-lists",
        headers=HEADERS
    ).json()
    all_samples_id = next(
        (s["sampleListId"] for s in samples if s["category"] == "all_cases_in_study"), None
    )
    total_samples = len(requests.get(
        f"{BASE_URL}/sample-lists/{all_samples_id}/sample-ids",
        headers=HEADERS
    ).json())

    # Get gene Entrez IDs
    gene_data = requests.post(
        f"{BASE_URL}/genes/fetch",
        json=[{"hugoGeneSymbol": g} for g in gene_symbols],
        headers=HEADERS
    ).json()
    entrez_ids = [g["entrezGeneId"] for g in gene_data]

    # Get mutations
    mutation_profile = f"{study_id}_mutations"
    mutations = get_mutations(mutation_profile, entrez_ids, all_samples_id)

    freq = {}
    for g_symbol, e_id in zip(gene_symbols, entrez_ids):
        mutated = len(set(m["patientId"] for m in mutations if m["entrezGeneId"] == e_id))
        freq[g_symbol] = mutated / total_samples * 100

    return freq

# Example
freq = get_alteration_frequency("brca_tcga", ["TP53", "PIK3CA", "BRCA1", "BRCA2"])
for gene, pct in sorted(freq.items(), key=lambda x: -x[1]):
    print(f"  {gene}: {pct:.1f}%")
```

### 7. Clinical Data

```python
def get_clinical_data(study_id, attribute_ids=None):
    """Get patient-level clinical data."""
    params = {"studyId": study_id}
    all_clinical = cbioportal_get(
        "clinical-data/fetch",
        params
    )
    # Returns list of {patientId, studyId, clinicalAttributeId, value}

# Clinical attributes include:
# OS_STATUS, OS_MONTHS, DFS_STATUS, DFS_MONTHS (survival)
# TUMOR_STAGE, GRADE, AGE, SEX, RACE
# Study-specific attributes vary

def get_clinical_attributes(study_id):
    """List all available clinical attributes for a study."""
    return cbioportal_get(f"studies/{study_id}/clinical-attributes")
```

## Query Workflows

### Workflow 1: Gene Alteration Profile in a Cancer Type

```python
import requests, pandas as pd

def alteration_profile(study_id, gene_symbol):
    """Full alteration profile for a gene in a cancer study."""

    # 1. Get gene Entrez ID
    gene_info = requests.post(
        f"{BASE_URL}/genes/fetch",
        json=[{"hugoGeneSymbol": gene_symbol}],
        headers=HEADERS
    ).json()[0]
    entrez_id = gene_info["entrezGeneId"]

    # 2. Get mutations
    mutations = get_mutations(f"{study_id}_mutations", [entrez_id])
    mut_df = pd.DataFrame(mutations) if mutations else pd.DataFrame()

    # 3. Get CNAs
    cna = get_cna(f"{study_id}_gistic", [entrez_id])
    cna_df = pd.DataFrame(cna) if cna else pd.DataFrame()

    # 4. Summary
    n_mut = len(set(mut_df["patientId"])) if not mut_df.empty else 0
    n_amp = len(cna_df[cna_df["value"] == 2]) if not cna_df.empty else 0
    n_del = len(cna_df[cna_df["value"] == -2]) if not cna_df.empty else 0

    return {"mutations": n_mut, "amplifications": n_amp, "deep_deletions": n_del}

result = alteration_profile("brca_tcga", "PIK3CA")
print(result)
```

### Workflow 2: Pan-Cancer Gene Mutation Frequency

```python
import requests, pandas as pd

def pan_cancer_mutation_freq(gene_symbol, cancer_study_ids=None):
    """Mutation frequency of a gene across multiple cancer types."""
    studies = get_all_studies()
    if cancer_study_ids:
        studies = [s for s in studies if s["studyId"] in cancer_study_ids]

    results = []
    for study in studies[:20]:  # Limit for demo
        try:
            freq = get_alteration_frequency(study["studyId"], [gene_symbol])
            results.append({
                "study": study["studyId"],
                "cancer": study.get("cancerTypeId", ""),
                "mutation_pct": freq.get(gene_symbol, 0)
            })
        except Exception:
            pass

    df = pd.DataFrame(results).sort_values("mutation_pct", ascending=False)
    return df
```

### Workflow 3: Survival Analysis by Mutation Status

```python
import requests, pandas as pd

def survival_by_mutation(study_id, gene_symbol):
    """Get survival data split by mutation status."""
    # This workflow fetches clinical and mutation data for downstream analysis

    gene_info = requests.post(
        f"{BASE_URL}/genes/fetch",
        json=[{"hugoGeneSymbol": gene_symbol}],
        headers=HEADERS
    ).json()[0]
    entrez_id = gene_info["entrezGeneId"]

    mutations = get_mutations(f"{study_id}_mutations", [entrez_id])
    mutated_patients = set(m["patientId"] for m in mutations)

    clinical = cbioportal_get("clinical-data/fetch", {"studyId": study_id})
    clinical_df = pd.DataFrame(clinical)

    os_data = clinical_df[clinical_df["clinicalAttributeId"].isin(["OS_MONTHS", "OS_STATUS"])]
    os_wide = os_data.pivot(index="patientId", columns="clinicalAttributeId", values="value")
    os_wide["mutated"] = os_wide.index.isin(mutated_patients)

    return os_wide
```

## Key API Endpoints Summary

| Endpoint | Description |
|----------|-------------|
| `GET /studies` | List all studies |
| `GET /studies/{studyId}/molecular-profiles` | Molecular profiles for a study |
| `POST /molecular-profiles/{profileId}/mutations/fetch` | Get mutation data |
| `POST /molecular-profiles/{profileId}/discrete-copy-number/fetch` | Get CNA data |
| `POST /molecular-profiles/{profileId}/molecular-data/fetch` | Get expression data |
| `GET /studies/{studyId}/clinical-attributes` | Available clinical variables |
| `GET /clinical-data/fetch` | Clinical data |
| `POST /genes/fetch` | Gene metadata by symbol or Entrez ID |
| `GET /studies/{studyId}/sample-lists` | Sample lists |

## Best Practices

- **Know your study IDs**: Use the Swagger UI or `GET /studies` to find the correct study ID
- **Use sample lists**: Each study has an `all` sample list and subsets; always specify the appropriate one
- **TCGA vs. GENIE**: TCGA data is comprehensive but older; GENIE has more recent clinical sequencing data
- **Entrez gene IDs**: The API uses Entrez IDs — use `/genes/fetch` to convert from symbols
- **Handle 404s**: Some molecular profiles may not exist for all studies
- **Rate limiting**: Add delays for bulk queries; consider downloading data files for large-scale analyses

## Data Downloads

For large-scale analyses, download study data directly:
```bash
# Download TCGA BRCA data
wget https://cbioportal-datahub.s3.amazonaws.com/brca_tcga.tar.gz
```

## Additional Resources

- **cBioPortal website**: https://www.cbioportal.org/
- **API Swagger UI**: https://www.cbioportal.org/api/swagger-ui/index.html
- **Documentation**: https://docs.cbioportal.org/
- **GitHub**: https://github.com/cBioPortal/cbioportal
- **Data hub**: https://datahub.cbioportal.org/
- **Citation**: Cerami E et al. (2012) Cancer Discovery. PMID: 22588877
- **API clients**: https://docs.cbioportal.org/web-api-and-clients/
