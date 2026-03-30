# HPO and Disease Ontology Reference for Monarch

## Human Phenotype Ontology (HPO)

### HPO Structure

HPO is organized hierarchically:
- **Root**: HP:0000001 (All)
  - HP:0000118 (Phenotypic abnormality)
    - HP:0000478 (Abnormality of the eye)
    - HP:0000707 (Abnormality of the nervous system)
    - HP:0001507 (Growth abnormality)
    - HP:0001626 (Abnormality of the cardiovascular system)
    - etc.

### Top-Level HPO Categories

| HPO ID | Name |
|--------|------|
| HP:0000924 | Abnormality of the skeletal system |
| HP:0000707 | Abnormality of the nervous system |
| HP:0000478 | Abnormality of the eye |
| HP:0000598 | Abnormality of the ear |
| HP:0001507 | Growth abnormality |
| HP:0001626 | Abnormality of the cardiovascular system |
| HP:0002086 | Abnormality of the respiratory system |
| HP:0001939 | Abnormality of metabolism/homeostasis |
| HP:0002664 | Neoplasm |
| HP:0000818 | Abnormality of the endocrine system |
| HP:0000119 | Abnormality of the genitourinary system |
| HP:0001197 | Abnormality of prenatal development/birth |

### Common HPO Terms in Rare Disease Genetics

#### Neurological
| HPO ID | Term |
|--------|------|
| HP:0001250 | Seizures |
| HP:0001251 | Ataxia |
| HP:0001252 | Muscular hypotonia |
| HP:0001263 | Global developmental delay |
| HP:0001270 | Motor delay |
| HP:0002167 | Neurological speech impairment |
| HP:0000716 | Depressivity |
| HP:0000729 | Autistic behavior |
| HP:0001332 | Dystonia |
| HP:0002071 | Abnormality of extrapyramidal motor function |

#### Growth/Morphology
| HPO ID | Term |
|--------|------|
| HP:0004322 | Short stature |
| HP:0001508 | Failure to thrive |
| HP:0000252 | Microcephaly |
| HP:0000256 | Macrocephaly |
| HP:0001511 | Intrauterine growth retardation |

#### Facial Features
| HPO ID | Term |
|--------|------|
| HP:0000324 | Facial asymmetry |
| HP:0001249 | Intellectual disability |
| HP:0000219 | Thin upper lip vermilion |
| HP:0000303 | Mandibular prognathia |
| HP:0000463 | Anteverted nares |

#### Metabolic
| HPO ID | Term |
|--------|------|
| HP:0001943 | Hypoglycemia |
| HP:0001944 | Hyperglycemia (Diabetes mellitus) |
| HP:0000822 | Hypertension |
| HP:0001712 | Left ventricular hypertrophy |

## MONDO Disease Ontology

MONDO integrates disease classifications from multiple sources:
- OMIM (Mendelian diseases)
- ORPHANET (rare diseases)
- MeSH (medical subject headings)
- SNOMED CT
- DOID (Disease Ontology)
- EFO (Experimental Factor Ontology)

### Key MONDO IDs for Common Rare Diseases

| MONDO ID | Disease | OMIM |
|----------|---------|------|
| MONDO:0007739 | Huntington disease | OMIM:143100 |
| MONDO:0009061 | Cystic fibrosis | OMIM:219700 |
| MONDO:0008608 | Down syndrome | OMIM:190685 |
| MONDO:0019391 | Fragile X syndrome | OMIM:300624 |
| MONDO:0010726 | Rett syndrome | OMIM:312750 |
| MONDO:0014517 | Dravet syndrome | OMIM:607208 |
| MONDO:0024522 | SCN1A-related epilepsy | — |
| MONDO:0014817 | CHARGE syndrome | OMIM:214800 |
| MONDO:0009764 | Marfan syndrome | OMIM:154700 |
| MONDO:0013282 | Alpha-1-antitrypsin deficiency | OMIM:613490 |

### OMIM ID Patterns

- **Phenotype only**: OMIM number alone (e.g., OMIM:104300)
- **Gene and phenotype**: Same gene, multiple phenotype entries
- **Phenotype series**: Grouped phenotypes at a locus

```python
import requests

def omim_to_mondo(omim_id):
    """Convert OMIM ID to MONDO ID via Monarch API."""
    search_id = f"OMIM:{omim_id}" if not omim_id.startswith("OMIM:") else omim_id
    data = requests.get(
        f"https://api-v3.monarchinitiative.org/v3/entity/{search_id}"
    ).json()
    # Check for same_as/equivalent_id links to MONDO
    return data
```

## Association Evidence Codes

Monarch associations include evidence types:

| Code | Evidence Type |
|------|--------------|
| `IEA` | Inferred from electronic annotation |
| `TAS` | Traceable author statement |
| `IMP` | Inferred from mutant phenotype |
| `IGI` | Inferred from genetic interaction |
| `IDA` | Inferred from direct assay |
| `ISS` | Inferred from sequence or structural similarity |
| `IBA` | Inferred from biological aspect of ancestor |

Higher-quality evidence: IDA > TAS > IMP > IEA

## Semantic Similarity Metrics

Monarch supports multiple similarity metrics:

| Metric | Description | Use case |
|--------|-------------|---------|
| `ancestor_information_content` | IC of most informative common ancestor (MICA) | Disease similarity |
| `jaccard_similarity` | Overlap coefficient | Simple set comparison |
| `cosine` | Cosine similarity of IC vectors | Large-scale comparisons |
| `phenodigm` | Combined MICA + Jaccard | Model organism matching |

```python
import requests

def compute_disease_similarity(disease_ids_1, disease_ids_2, metric="ancestor_information_content"):
    """Compute semantic similarity between two sets of disease phenotypes."""
    # Get phenotype sets for each disease
    url = "https://api-v3.monarchinitiative.org/v3/semsim/compare"
    params = {
        "subjects": disease_ids_1,
        "objects": disease_ids_2,
        "metric": metric
    }
    response = requests.get(url, params=params)
    return response.json()
```
