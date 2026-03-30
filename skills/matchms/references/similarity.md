# Matchms Similarity Functions Reference

This document provides detailed information about all similarity scoring methods available in matchms.

## Overview

Matchms provides multiple similarity functions for comparing mass spectra. Use `calculate_scores()` to compute pairwise similarities between reference and query spectra collections.

```python
from matchms import calculate_scores
from matchms.similarity import CosineGreedy

scores = calculate_scores(references=library_spectra,
                         queries=query_spectra,
                         similarity_function=CosineGreedy())
```

## Peak-Based Similarity Functions

These functions compare mass spectra based on their peak patterns (m/z and intensity values).

### CosineGreedy

**Description**: Calculates cosine similarity between two spectra using a fast greedy matching algorithm. Peaks are matched within a specified tolerance, and similarity is computed based on matched peak intensities.

**When to use**:
- Fast similarity calculations for large datasets
- General-purpose spectral matching
- When speed is prioritized over mathematically optimal matching

**Parameters**:
- `tolerance` (float, default=0.1): Maximum m/z difference for peak matching (Daltons)
- `mz_power` (float, default=0.0): Exponent for m/z weighting (0 = no weighting)
- `intensity_power` (float, default=1.0): Exponent for intensity weighting

**Example**:
```python
from matchms.similarity import CosineGreedy

similarity_func = CosineGreedy(tolerance=0.1, mz_power=0.0, intensity_power=1.0)
scores = calculate_scores(references, queries, similarity_func)
```

**Output**: Similarity score between 0.0 and 1.0, plus number of matched peaks.

---

### CosineHungarian

**Description**: Calculates cosine similarity using the Hungarian algorithm for optimal peak matching. Provides mathematically optimal peak assignments but is slower than CosineGreedy.

**When to use**:
- When optimal peak matching is required
- High-quality reference library comparisons
- Research requiring reproducible, mathematically rigorous results

**Parameters**:
- `tolerance` (float, default=0.1): Maximum m/z difference for peak matching
- `mz_power` (float, default=0.0): Exponent for m/z weighting
- `intensity_power` (float, default=1.0): Exponent for intensity weighting

**Example**:
```python
from matchms.similarity import CosineHungarian

similarity_func = CosineHungarian(tolerance=0.1)
scores = calculate_scores(references, queries, similarity_func)
```

**Output**: Optimal similarity score between 0.0 and 1.0, plus matched peaks.

**Note**: Slower than CosineGreedy; use for smaller datasets or when accuracy is critical.

---

### ModifiedCosine

**Description**: Extends cosine similarity by accounting for precursor m/z differences. Allows peaks to match after applying a mass shift based on the difference between precursor masses. Useful for comparing spectra of related compounds (isotopes, adducts, analogs).

**When to use**:
- Comparing spectra from different precursor masses
- Identifying structural analogs or derivatives
- Cross-ionization mode comparisons
- When precursor mass differences are meaningful

**Parameters**:
- `tolerance` (float, default=0.1): Maximum m/z difference for peak matching after shift
- `mz_power` (float, default=0.0): Exponent for m/z weighting
- `intensity_power` (float, default=1.0): Exponent for intensity weighting

**Example**:
```python
from matchms.similarity import ModifiedCosine

similarity_func = ModifiedCosine(tolerance=0.1)
scores = calculate_scores(references, queries, similarity_func)
```

**Requirements**: Both spectra must have valid precursor_mz metadata.

---

### NeutralLossesCosine

**Description**: Calculates similarity based on neutral loss patterns rather than fragment m/z values. Neutral losses are derived by subtracting fragment m/z from precursor m/z. Particularly useful for identifying compounds with similar fragmentation patterns.

**When to use**:
- Comparing fragmentation patterns across different precursor masses
- Identifying compounds with similar neutral loss profiles
- Complementary to regular cosine scoring
- Metabolite identification and classification

**Parameters**:
- `tolerance` (float, default=0.1): Maximum neutral loss difference for matching
- `mz_power` (float, default=0.0): Exponent for loss value weighting
- `intensity_power` (float, default=1.0): Exponent for intensity weighting

**Example**:
```python
from matchms.similarity import NeutralLossesCosine
from matchms.filtering import add_losses

# First add losses to spectra
spectra_with_losses = [add_losses(s) for s in spectra]

similarity_func = NeutralLossesCosine(tolerance=0.1)
scores = calculate_scores(references_with_losses, queries_with_losses, similarity_func)
```

**Requirements**:
- Both spectra must have valid precursor_mz metadata
- Use `add_losses()` filter to compute neutral losses before scoring

---

## Structural Similarity Functions

These functions compare molecular structures rather than spectral peaks.

### FingerprintSimilarity

**Description**: Calculates similarity between molecular fingerprints derived from chemical structures (SMILES or InChI). Supports multiple fingerprint types and similarity metrics.

**When to use**:
- Structural similarity without spectral data
- Combining structural and spectral similarity
- Pre-filtering candidates before spectral matching
- Structure-activity relationship studies

**Parameters**:
- `fingerprint_type` (str, default="daylight"): Type of fingerprint
  - `"daylight"`: Daylight fingerprint
  - `"morgan1"`, `"morgan2"`, `"morgan3"`: Morgan fingerprints with radius 1, 2, or 3
- `similarity_measure` (str, default="jaccard"): Similarity metric
  - `"jaccard"`: Jaccard index (intersection / union)
  - `"dice"`: Dice coefficient (2 * intersection / (size1 + size2))
  - `"cosine"`: Cosine similarity

**Example**:
```python
from matchms.similarity import FingerprintSimilarity
from matchms.filtering import add_fingerprint

# Add fingerprints to spectra
spectra_with_fps = [add_fingerprint(s, fingerprint_type="morgan2", nbits=2048)
                    for s in spectra]

similarity_func = FingerprintSimilarity(similarity_measure="jaccard")
scores = calculate_scores(references_with_fps, queries_with_fps, similarity_func)
```

**Requirements**:
- Spectra must have valid SMILES or InChI metadata
- Use `add_fingerprint()` filter to compute fingerprints
- Requires rdkit library

---

## Metadata-Based Similarity Functions

These functions compare metadata fields rather than spectral or structural data.

### MetadataMatch

**Description**: Compares user-defined metadata fields between spectra. Supports exact matching for categorical data and tolerance-based matching for numerical data.

**When to use**:
- Filtering by experimental conditions (collision energy, retention time)
- Instrument-specific matching
- Combining metadata constraints with spectral similarity
- Custom metadata-based filtering

**Parameters**:
- `field` (str): Metadata field name to compare
- `matching_type` (str, default="exact"): Matching method
  - `"exact"`: Exact string/value match
  - `"difference"`: Absolute difference for numerical values
  - `"relative_difference"`: Relative difference for numerical values
- `tolerance` (float, optional): Maximum difference for numerical matching

**Example (Exact matching)**:
```python
from matchms.similarity import MetadataMatch

# Match by instrument type
similarity_func = MetadataMatch(field="instrument_type", matching_type="exact")
scores = calculate_scores(references, queries, similarity_func)
```

**Example (Numerical matching)**:
```python
# Match retention time within 0.5 minutes
similarity_func = MetadataMatch(field="retention_time",
                                matching_type="difference",
                                tolerance=0.5)
scores = calculate_scores(references, queries, similarity_func)
```

**Output**: Returns 1.0 (match) or 0.0 (no match) for exact matching. For numerical matching, returns similarity score based on difference.

---

### PrecursorMzMatch

**Description**: Binary matching based on precursor m/z values. Returns True/False based on whether precursor masses match within specified tolerance.

**When to use**:
- Pre-filtering spectral libraries by precursor mass
- Fast mass-based candidate selection
- Combining with other similarity metrics
- Isobaric compound identification

**Parameters**:
- `tolerance` (float, default=0.1): Maximum m/z difference for matching
- `tolerance_type` (str, default="Dalton"): Tolerance unit
  - `"Dalton"`: Absolute mass difference
  - `"ppm"`: Parts per million (relative)

**Example**:
```python
from matchms.similarity import PrecursorMzMatch

# Match precursor within 0.1 Da
similarity_func = PrecursorMzMatch(tolerance=0.1, tolerance_type="Dalton")
scores = calculate_scores(references, queries, similarity_func)

# Match precursor within 10 ppm
similarity_func = PrecursorMzMatch(tolerance=10, tolerance_type="ppm")
scores = calculate_scores(references, queries, similarity_func)
```

**Output**: 1.0 (match) or 0.0 (no match)

**Requirements**: Both spectra must have valid precursor_mz metadata.

---

### ParentMassMatch

**Description**: Binary matching based on parent mass (neutral mass) values. Similar to PrecursorMzMatch but uses calculated parent mass instead of precursor m/z.

**When to use**:
- Comparing spectra from different ionization modes
- Adduct-independent matching
- Neutral mass-based library searches

**Parameters**:
- `tolerance` (float, default=0.1): Maximum mass difference for matching
- `tolerance_type` (str, default="Dalton"): Tolerance unit ("Dalton" or "ppm")

**Example**:
```python
from matchms.similarity import ParentMassMatch

similarity_func = ParentMassMatch(tolerance=0.1, tolerance_type="Dalton")
scores = calculate_scores(references, queries, similarity_func)
```

**Output**: 1.0 (match) or 0.0 (no match)

**Requirements**: Both spectra must have valid parent_mass metadata.

---

## Combining Multiple Similarity Functions

Combine multiple similarity metrics for robust compound identification:

```python
from matchms import calculate_scores
from matchms.similarity import CosineGreedy, ModifiedCosine, FingerprintSimilarity

# Calculate multiple similarity scores
cosine_scores = calculate_scores(refs, queries, CosineGreedy())
modified_cosine_scores = calculate_scores(refs, queries, ModifiedCosine())
fingerprint_scores = calculate_scores(refs, queries, FingerprintSimilarity())

# Combine scores with weights
for i, query in enumerate(queries):
    for j, ref in enumerate(refs):
        combined_score = (0.5 * cosine_scores.scores[j, i] +
                         0.3 * modified_cosine_scores.scores[j, i] +
                         0.2 * fingerprint_scores.scores[j, i])
```

## Accessing Scores Results

The `Scores` object provides multiple methods to access results:

```python
# Get best matches for a query
best_matches = scores.scores_by_query(query_spectrum, sort=True)[:10]

# Get scores as numpy array
score_array = scores.scores

# Get scores as pandas DataFrame
import pandas as pd
df = scores.to_dataframe()

# Filter by threshold
high_scores = [(i, j, score) for i, j, score in scores.to_list() if score > 0.7]

# Save scores
scores.to_json("scores.json")
scores.to_pickle("scores.pkl")
```

## Performance Considerations

**Fast methods** (large datasets):
- CosineGreedy
- PrecursorMzMatch
- ParentMassMatch

**Slow methods** (smaller datasets or high accuracy):
- CosineHungarian
- ModifiedCosine (slower than CosineGreedy)
- NeutralLossesCosine
- FingerprintSimilarity (requires fingerprint computation)

**Recommendation**: For large-scale library searches, use PrecursorMzMatch to pre-filter candidates, then apply CosineGreedy or ModifiedCosine to filtered results.

## Common Similarity Workflows

### Standard Library Matching
```python
from matchms.similarity import CosineGreedy

scores = calculate_scores(library_spectra, query_spectra,
                         CosineGreedy(tolerance=0.1))
```

### Multi-Metric Matching
```python
from matchms.similarity import CosineGreedy, ModifiedCosine, FingerprintSimilarity

# Spectral similarity
cosine = calculate_scores(refs, queries, CosineGreedy())
modified = calculate_scores(refs, queries, ModifiedCosine())

# Structural similarity
fingerprint = calculate_scores(refs, queries, FingerprintSimilarity())
```

### Precursor-Filtered Matching
```python
from matchms.similarity import PrecursorMzMatch, CosineGreedy

# First filter by precursor mass
mass_filter = calculate_scores(refs, queries, PrecursorMzMatch(tolerance=0.1))

# Then calculate cosine only for matching precursors
cosine_scores = calculate_scores(refs, queries, CosineGreedy())
```

## Further Reading

For detailed API documentation, parameter descriptions, and mathematical formulations, see:
https://matchms.readthedocs.io/en/latest/api/matchms.similarity.html
