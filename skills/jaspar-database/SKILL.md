---
name: jaspar-database
description: Query JASPAR for transcription factor binding site (TFBS) profiles (PWMs/PFMs). Search by TF name, species, or class; scan DNA sequences for TF binding sites; compare matrices; essential for regulatory genomics, motif analysis, and GWAS regulatory variant interpretation.
license: CC0-1.0
metadata:
    skill-author: Kuan-lin Huang
---

# JASPAR Database

## Overview

JASPAR (https://jaspar.elixir.no/) is the gold-standard open-access database of curated, non-redundant transcription factor (TF) binding profiles stored as position frequency matrices (PFMs). JASPAR 2024 contains 1,210 non-redundant TF binding profiles for 164 eukaryotic species. Each profile is experimentally derived (ChIP-seq, SELEX, HT-SELEX, protein binding microarray, etc.) and rigorously validated.

**Key resources:**
- JASPAR portal: https://jaspar.elixir.no/
- REST API: https://jaspar.elixir.no/api/v1/
- API docs: https://jaspar.elixir.no/api/v1/docs/
- Python package: `jaspar` (via Biopython) or direct API

## When to Use This Skill

Use JASPAR when:

- **TF binding site prediction**: Scan a DNA sequence for potential binding sites of a TF
- **Regulatory variant interpretation**: Does a GWAS/eQTL variant disrupt a TF binding motif?
- **Promoter/enhancer analysis**: What TFs are predicted to bind to a regulatory element?
- **Gene regulatory network construction**: Link TFs to their target genes via motif scanning
- **TF family analysis**: Compare binding profiles across a TF family (e.g., all homeobox factors)
- **ChIP-seq analysis**: Find known TF motifs enriched in ChIP-seq peaks
- **ENCODE/ATAC-seq interpretation**: Match open chromatin regions to TF binding profiles

## Core Capabilities

### 1. JASPAR REST API

Base URL: `https://jaspar.elixir.no/api/v1/`

```python
import requests

BASE_URL = "https://jaspar.elixir.no/api/v1"

def jaspar_get(endpoint, params=None):
    url = f"{BASE_URL}/{endpoint}"
    response = requests.get(url, params=params, headers={"Accept": "application/json"})
    response.raise_for_status()
    return response.json()
```

### 2. Search for TF Profiles

```python
def search_jaspar(
    tf_name=None,
    species=None,
    collection="CORE",
    tf_class=None,
    tf_family=None,
    page=1,
    page_size=25
):
    """Search JASPAR for TF binding profiles."""
    params = {
        "collection": collection,
        "page": page,
        "page_size": page_size,
        "format": "json"
    }
    if tf_name:
        params["name"] = tf_name
    if species:
        params["species"] = species  # Use taxonomy ID or name, e.g., "9606" for human
    if tf_class:
        params["tf_class"] = tf_class
    if tf_family:
        params["tf_family"] = tf_family

    return jaspar_get("matrix", params)

# Examples:
# Search for human CTCF profile
ctcf = search_jaspar("CTCF", species="9606")
print(f"Found {ctcf['count']} CTCF profiles")

# Search for all homeobox TFs in human
hox_tfs = search_jaspar(tf_class="Homeodomain", species="9606")

# Search for a TF family
nfkb = search_jaspar(tf_family="NF-kappaB")
```

### 3. Fetch a Specific Matrix (PFM/PWM)

```python
def get_matrix(matrix_id):
    """Fetch a specific JASPAR matrix by ID (e.g., 'MA0139.1' for CTCF)."""
    return jaspar_get(f"matrix/{matrix_id}/")

# Example: Get CTCF matrix
ctcf_matrix = get_matrix("MA0139.1")

# Matrix structure:
# {
#   "matrix_id": "MA0139.1",
#   "name": "CTCF",
#   "collection": "CORE",
#   "tax_group": "vertebrates",
#   "pfm": { "A": [...], "C": [...], "G": [...], "T": [...] },
#   "consensus": "CCGCGNGGNGGCAG",
#   "length": 19,
#   "species": [{"tax_id": 9606, "name": "Homo sapiens"}],
#   "class": ["C2H2 zinc finger factors"],
#   "family": ["BEN domain factors"],
#   "type": "ChIP-seq",
#   "uniprot_ids": ["P49711"]
# }
```

### 4. Download PFM/PWM as Matrix

```python
import numpy as np

def get_pwm(matrix_id, pseudocount=0.8):
    """
    Fetch a PFM from JASPAR and convert to PWM (log-odds).
    Returns numpy array of shape (4, L) in order A, C, G, T.
    """
    matrix = get_matrix(matrix_id)
    pfm = matrix["pfm"]

    # Convert PFM to numpy
    pfm_array = np.array([pfm["A"], pfm["C"], pfm["G"], pfm["T"]], dtype=float)

    # Add pseudocount
    pfm_array += pseudocount

    # Normalize to get PPM
    ppm = pfm_array / pfm_array.sum(axis=0, keepdims=True)

    # Convert to PWM (log-odds relative to background 0.25)
    background = 0.25
    pwm = np.log2(ppm / background)

    return pwm, matrix["name"]

# Example
pwm, name = get_pwm("MA0139.1")  # CTCF
print(f"PWM for {name}: shape {pwm.shape}")
max_score = pwm.max(axis=0).sum()
print(f"Maximum possible score: {max_score:.2f} bits")
```

### 5. Scan a DNA Sequence for TF Binding Sites

```python
import numpy as np
from typing import List, Tuple

NUCLEOTIDE_MAP = {'A': 0, 'C': 1, 'G': 2, 'T': 3,
                  'a': 0, 'c': 1, 'g': 2, 't': 3}

def scan_sequence(sequence: str, pwm: np.ndarray, threshold_pct: float = 0.8) -> List[dict]:
    """
    Scan a DNA sequence for TF binding sites using a PWM.

    Args:
        sequence: DNA sequence string
        pwm: PWM array (4 x L) in ACGT order
        threshold_pct: Fraction of max score to use as threshold (0-1)

    Returns:
        List of hits with position, score, and matched sequence
    """
    motif_len = pwm.shape[1]
    max_score = pwm.max(axis=0).sum()
    min_score = pwm.min(axis=0).sum()
    threshold = min_score + threshold_pct * (max_score - min_score)

    hits = []
    seq = sequence.upper()

    for i in range(len(seq) - motif_len + 1):
        subseq = seq[i:i + motif_len]
        # Skip if contains non-ACGT
        if any(c not in NUCLEOTIDE_MAP for c in subseq):
            continue

        score = sum(pwm[NUCLEOTIDE_MAP[c], j] for j, c in enumerate(subseq))

        if score >= threshold:
            relative_score = (score - min_score) / (max_score - min_score)
            hits.append({
                "position": i + 1,  # 1-based
                "score": score,
                "relative_score": relative_score,
                "sequence": subseq,
                "strand": "+"
            })

    return hits

# Example: Scan a promoter sequence for CTCF binding sites
promoter = "AGCCCGCGAGGNGGCAGTTGCCTGGAGCAGGATCAGCAGATC"
pwm, name = get_pwm("MA0139.1")
hits = scan_sequence(promoter, pwm, threshold_pct=0.75)
for hit in hits:
    print(f"  Position {hit['position']}: {hit['sequence']} (score: {hit['score']:.2f}, {hit['relative_score']:.0%})")
```

### 6. Scan Both Strands

```python
def reverse_complement(seq: str) -> str:
    complement = {'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C', 'N': 'N'}
    return ''.join(complement.get(b, 'N') for b in reversed(seq.upper()))

def scan_both_strands(sequence: str, pwm: np.ndarray, threshold_pct: float = 0.8):
    """Scan forward and reverse complement strands."""
    fwd_hits = scan_sequence(sequence, pwm, threshold_pct)
    for h in fwd_hits:
        h["strand"] = "+"

    rev_seq = reverse_complement(sequence)
    rev_hits = scan_sequence(rev_seq, pwm, threshold_pct)
    seq_len = len(sequence)
    for h in rev_hits:
        h["strand"] = "-"
        h["position"] = seq_len - h["position"] - len(h["sequence"]) + 2  # Convert to fwd coords

    all_hits = fwd_hits + rev_hits
    return sorted(all_hits, key=lambda x: x["position"])
```

### 7. Variant Impact on TF Binding

```python
def variant_tfbs_impact(ref_seq: str, alt_seq: str, pwm: np.ndarray,
                          tf_name: str, threshold_pct: float = 0.7):
    """
    Assess impact of a SNP on TF binding by comparing ref vs alt sequences.
    Both sequences should be centered on the variant with flanking context.
    """
    ref_hits = scan_both_strands(ref_seq, pwm, threshold_pct)
    alt_hits = scan_both_strands(alt_seq, pwm, threshold_pct)

    max_ref = max((h["score"] for h in ref_hits), default=None)
    max_alt = max((h["score"] for h in alt_hits), default=None)

    result = {
        "tf": tf_name,
        "ref_max_score": max_ref,
        "alt_max_score": max_alt,
        "ref_has_site": len(ref_hits) > 0,
        "alt_has_site": len(alt_hits) > 0,
    }
    if max_ref and max_alt:
        result["score_change"] = max_alt - max_ref
        result["effect"] = "gained" if max_alt > max_ref else "disrupted"
    elif max_ref and not max_alt:
        result["effect"] = "disrupted"
    elif not max_ref and max_alt:
        result["effect"] = "gained"
    else:
        result["effect"] = "no_site"

    return result
```

## Query Workflows

### Workflow 1: Find All TF Binding Sites in a Promoter

```python
import requests, numpy as np

# 1. Get relevant TF matrices (e.g., all human TFs in CORE collection)
response = requests.get(
    "https://jaspar.elixir.no/api/v1/matrix/",
    params={"species": "9606", "collection": "CORE", "page_size": 500, "page": 1}
)
matrices = response.json()["results"]

# 2. For each matrix, compute PWM and scan promoter
promoter = "CCCGCCCGCCCGCCGCCCGCAGTTAATGAGCCCAGCGTGCC"  # Example

all_hits = []
for m in matrices[:10]:  # Limit for demo
    pwm_data = requests.get(f"https://jaspar.elixir.no/api/v1/matrix/{m['matrix_id']}/").json()
    pfm = pfm_data["pfm"]
    pfm_arr = np.array([pfm["A"], pfm["C"], pfm["G"], pfm["T"]], dtype=float) + 0.8
    ppm = pfm_arr / pfm_arr.sum(axis=0)
    pwm = np.log2(ppm / 0.25)

    hits = scan_sequence(promoter, pwm, threshold_pct=0.8)
    for h in hits:
        h["tf_name"] = m["name"]
        h["matrix_id"] = m["matrix_id"]
    all_hits.extend(hits)

print(f"Found {len(all_hits)} TF binding sites")
for h in sorted(all_hits, key=lambda x: -x["score"])[:5]:
    print(f"  {h['tf_name']} ({h['matrix_id']}): pos {h['position']}, score {h['score']:.2f}")
```

### Workflow 2: SNP Impact on TF Binding (Regulatory Variant Analysis)

1. Retrieve the genomic sequence flanking the SNP (±20 bp each side)
2. Construct ref and alt sequences
3. Scan with all relevant TF PWMs
4. Report TFs whose binding is created or destroyed by the SNP

### Workflow 3: Motif Enrichment Analysis

1. Identify a set of peak sequences (e.g., from ChIP-seq or ATAC-seq)
2. Scan all peaks with JASPAR PWMs
3. Compare hit rates in peaks vs. background sequences
4. Report significantly enriched motifs (Fisher's exact test or FIMO-style scoring)

## Collections Available

| Collection | Description | Profiles |
|------------|-------------|----------|
| `CORE` | Non-redundant, high-quality profiles | ~1,210 |
| `UNVALIDATED` | Experimentally derived but not validated | ~500 |
| `PHYLOFACTS` | Phylogenetically conserved sites | ~50 |
| `CNE` | Conserved non-coding elements | ~30 |
| `POLII` | RNA Pol II binding profiles | ~20 |
| `FAM` | TF family representative profiles | ~170 |
| `SPLICE` | Splice factor profiles | ~20 |

## Best Practices

- **Use CORE collection** for most analyses — best validated and non-redundant
- **Threshold selection**: 80% of max score is common for de novo prediction; 90% for high-confidence
- **Always scan both strands** — TFs can bind in either orientation
- **Provide flanking context** for variant analysis: at least (motif_length - 1) bp on each side
- **Consider background**: PWM scores relative to uniform (0.25) background; adjust for actual GC content
- **Cross-validate with ChIP-seq data** when available — motif scanning has many false positives
- **Use Biopython's motifs module** for full-featured scanning: `from Bio import motifs`

## Additional Resources

- **JASPAR portal**: https://jaspar.elixir.no/
- **API documentation**: https://jaspar.elixir.no/api/v1/docs/
- **JASPAR 2024 paper**: Castro-Mondragon et al. (2022) Nucleic Acids Research. PMID: 34875674
- **Biopython motifs**: https://biopython.org/docs/latest/Tutorial/chapter_motifs.html
- **FIMO tool** (for large-scale scanning): https://meme-suite.org/meme/tools/fimo
- **HOMER** (motif enrichment): http://homer.ucsd.edu/homer/
- **GitHub**: https://github.com/wassermanlab/JASPAR-UCSC-tracks
