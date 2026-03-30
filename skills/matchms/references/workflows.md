# Matchms Common Workflows

This document provides detailed examples of common mass spectrometry analysis workflows using matchms.

## Workflow 1: Basic Spectral Library Matching

Match unknown spectra against a reference library to identify compounds.

```python
from matchms.importing import load_from_mgf
from matchms.filtering import default_filters, normalize_intensities
from matchms.filtering import select_by_relative_intensity, require_minimum_number_of_peaks
from matchms import calculate_scores
from matchms.similarity import CosineGreedy

# Load reference library
print("Loading reference library...")
library = list(load_from_mgf("reference_library.mgf"))

# Load query spectra (unknowns)
print("Loading query spectra...")
queries = list(load_from_mgf("unknown_spectra.mgf"))

# Process library spectra
print("Processing library...")
processed_library = []
for spectrum in library:
    spectrum = default_filters(spectrum)
    spectrum = normalize_intensities(spectrum)
    spectrum = select_by_relative_intensity(spectrum, intensity_from=0.01)
    spectrum = require_minimum_number_of_peaks(spectrum, n_required=5)
    if spectrum is not None:
        processed_library.append(spectrum)

# Process query spectra
print("Processing queries...")
processed_queries = []
for spectrum in queries:
    spectrum = default_filters(spectrum)
    spectrum = normalize_intensities(spectrum)
    spectrum = select_by_relative_intensity(spectrum, intensity_from=0.01)
    spectrum = require_minimum_number_of_peaks(spectrum, n_required=5)
    if spectrum is not None:
        processed_queries.append(spectrum)

# Calculate similarities
print("Calculating similarities...")
scores = calculate_scores(references=processed_library,
                         queries=processed_queries,
                         similarity_function=CosineGreedy(tolerance=0.1))

# Get top matches for each query
print("\nTop matches:")
for i, query in enumerate(processed_queries):
    top_matches = scores.scores_by_query(query, sort=True)[:5]

    query_name = query.get("compound_name", f"Query {i}")
    print(f"\n{query_name}:")

    for ref_idx, score in top_matches:
        ref_spectrum = processed_library[ref_idx]
        ref_name = ref_spectrum.get("compound_name", f"Ref {ref_idx}")
        print(f"  {ref_name}: {score:.4f}")
```

---

## Workflow 2: Quality Control and Data Cleaning

Filter and clean spectral data before analysis.

```python
from matchms.importing import load_from_mgf
from matchms.exporting import save_as_mgf
from matchms.filtering import (default_filters, normalize_intensities,
                               require_precursor_mz, require_minimum_number_of_peaks,
                               require_minimum_number_of_high_peaks,
                               select_by_relative_intensity, remove_peaks_around_precursor_mz)

# Load spectra
spectra = list(load_from_mgf("raw_data.mgf"))
print(f"Loaded {len(spectra)} raw spectra")

# Apply quality filters
cleaned_spectra = []
for spectrum in spectra:
    # Harmonize metadata
    spectrum = default_filters(spectrum)

    # Quality requirements
    spectrum = require_precursor_mz(spectrum, minimum_accepted_mz=50.0)
    if spectrum is None:
        continue

    spectrum = require_minimum_number_of_peaks(spectrum, n_required=10)
    if spectrum is None:
        continue

    # Clean peaks
    spectrum = normalize_intensities(spectrum)
    spectrum = remove_peaks_around_precursor_mz(spectrum, mz_tolerance=17)
    spectrum = select_by_relative_intensity(spectrum, intensity_from=0.01)

    # Require high-quality peaks
    spectrum = require_minimum_number_of_high_peaks(spectrum,
                                                     n_required=5,
                                                     intensity_threshold=0.05)
    if spectrum is None:
        continue

    cleaned_spectra.append(spectrum)

print(f"Retained {len(cleaned_spectra)} high-quality spectra")
print(f"Removed {len(spectra) - len(cleaned_spectra)} low-quality spectra")

# Save cleaned data
save_as_mgf(cleaned_spectra, "cleaned_data.mgf")
```

---

## Workflow 3: Multi-Metric Similarity Scoring

Combine multiple similarity metrics for robust compound identification.

```python
from matchms.importing import load_from_mgf
from matchms.filtering import (default_filters, normalize_intensities,
                               derive_inchi_from_smiles, add_fingerprint, add_losses)
from matchms import calculate_scores
from matchms.similarity import (CosineGreedy, ModifiedCosine,
                                NeutralLossesCosine, FingerprintSimilarity)
import numpy as np

# Load spectra
library = list(load_from_mgf("library.mgf"))
queries = list(load_from_mgf("queries.mgf"))

# Process with multiple features
def process_for_multimetric(spectrum):
    spectrum = default_filters(spectrum)
    spectrum = normalize_intensities(spectrum)

    # Add chemical fingerprints
    spectrum = derive_inchi_from_smiles(spectrum)
    spectrum = add_fingerprint(spectrum, fingerprint_type="morgan2", nbits=2048)

    # Add neutral losses
    spectrum = add_losses(spectrum, loss_mz_from=5.0, loss_mz_to=200.0)

    return spectrum

processed_library = [process_for_multimetric(s) for s in library if s is not None]
processed_queries = [process_for_multimetric(s) for s in queries if s is not None]

# Calculate multiple similarity scores
print("Calculating Cosine similarity...")
cosine_scores = calculate_scores(processed_library, processed_queries,
                                 CosineGreedy(tolerance=0.1))

print("Calculating Modified Cosine similarity...")
modified_cosine_scores = calculate_scores(processed_library, processed_queries,
                                         ModifiedCosine(tolerance=0.1))

print("Calculating Neutral Losses similarity...")
neutral_losses_scores = calculate_scores(processed_library, processed_queries,
                                        NeutralLossesCosine(tolerance=0.1))

print("Calculating Fingerprint similarity...")
fingerprint_scores = calculate_scores(processed_library, processed_queries,
                                      FingerprintSimilarity(similarity_measure="jaccard"))

# Combine scores with weights
weights = {
    'cosine': 0.4,
    'modified_cosine': 0.3,
    'neutral_losses': 0.2,
    'fingerprint': 0.1
}

# Get combined scores for each query
for i, query in enumerate(processed_queries):
    query_name = query.get("compound_name", f"Query {i}")

    combined_scores = []
    for j, ref in enumerate(processed_library):
        combined = (weights['cosine'] * cosine_scores.scores[j, i] +
                   weights['modified_cosine'] * modified_cosine_scores.scores[j, i] +
                   weights['neutral_losses'] * neutral_losses_scores.scores[j, i] +
                   weights['fingerprint'] * fingerprint_scores.scores[j, i])
        combined_scores.append((j, combined))

    # Sort by combined score
    combined_scores.sort(key=lambda x: x[1], reverse=True)

    print(f"\n{query_name} - Top 3 matches:")
    for ref_idx, score in combined_scores[:3]:
        ref_name = processed_library[ref_idx].get("compound_name", f"Ref {ref_idx}")
        print(f"  {ref_name}: {score:.4f}")
```

---

## Workflow 4: Precursor-Filtered Library Search

Pre-filter by precursor mass before spectral matching for faster searches.

```python
from matchms.importing import load_from_mgf
from matchms.filtering import default_filters, normalize_intensities
from matchms import calculate_scores
from matchms.similarity import PrecursorMzMatch, CosineGreedy
import numpy as np

# Load data
library = list(load_from_mgf("large_library.mgf"))
queries = list(load_from_mgf("queries.mgf"))

# Process spectra
processed_library = [normalize_intensities(default_filters(s)) for s in library]
processed_queries = [normalize_intensities(default_filters(s)) for s in queries]

# Step 1: Fast precursor mass filtering
print("Filtering by precursor mass...")
mass_filter = calculate_scores(processed_library, processed_queries,
                               PrecursorMzMatch(tolerance=0.1, tolerance_type="Dalton"))

# Step 2: Calculate cosine only for matching precursors
print("Calculating cosine similarity for filtered candidates...")
cosine_scores = calculate_scores(processed_library, processed_queries,
                                CosineGreedy(tolerance=0.1))

# Step 3: Apply mass filter to cosine scores
for i, query in enumerate(processed_queries):
    candidates = []

    for j, ref in enumerate(processed_library):
        # Only consider if precursor matches
        if mass_filter.scores[j, i] > 0:
            cosine_score = cosine_scores.scores[j, i]
            candidates.append((j, cosine_score))

    # Sort by cosine score
    candidates.sort(key=lambda x: x[1], reverse=True)

    query_name = query.get("compound_name", f"Query {i}")
    print(f"\n{query_name} - Top 5 matches (from {len(candidates)} candidates):")

    for ref_idx, score in candidates[:5]:
        ref_name = processed_library[ref_idx].get("compound_name", f"Ref {ref_idx}")
        ref_mz = processed_library[ref_idx].get("precursor_mz", "N/A")
        print(f"  {ref_name} (m/z {ref_mz}): {score:.4f}")
```

---

## Workflow 5: Building a Reusable Processing Pipeline

Create a standardized pipeline for consistent processing.

```python
from matchms import SpectrumProcessor
from matchms.filtering import (default_filters, normalize_intensities,
                               select_by_relative_intensity,
                               remove_peaks_around_precursor_mz,
                               require_minimum_number_of_peaks,
                               derive_inchi_from_smiles, add_fingerprint)
from matchms.importing import load_from_mgf
from matchms.exporting import save_as_pickle

# Define custom processing pipeline
def create_standard_pipeline():
    """Create a reusable processing pipeline"""
    return SpectrumProcessor([
        default_filters,
        normalize_intensities,
        lambda s: remove_peaks_around_precursor_mz(s, mz_tolerance=17),
        lambda s: select_by_relative_intensity(s, intensity_from=0.01),
        lambda s: require_minimum_number_of_peaks(s, n_required=5),
        derive_inchi_from_smiles,
        lambda s: add_fingerprint(s, fingerprint_type="morgan2")
    ])

# Create pipeline instance
pipeline = create_standard_pipeline()

# Process multiple datasets with same pipeline
datasets = ["dataset1.mgf", "dataset2.mgf", "dataset3.mgf"]

for dataset_file in datasets:
    print(f"\nProcessing {dataset_file}...")

    # Load spectra
    spectra = list(load_from_mgf(dataset_file))

    # Apply pipeline
    processed = []
    for spectrum in spectra:
        result = pipeline(spectrum)
        if result is not None:
            processed.append(result)

    print(f"  Loaded: {len(spectra)}")
    print(f"  Processed: {len(processed)}")

    # Save processed data
    output_file = dataset_file.replace(".mgf", "_processed.pkl")
    save_as_pickle(processed, output_file)
    print(f"  Saved to: {output_file}")
```

---

## Workflow 6: Format Conversion and Standardization

Convert between different mass spectrometry file formats.

```python
from matchms.importing import load_from_mzml, load_from_mgf
from matchms.exporting import save_as_mgf, save_as_msp, save_as_json
from matchms.filtering import default_filters, normalize_intensities

def convert_and_standardize(input_file, output_format="mgf"):
    """
    Load, standardize, and convert mass spectrometry data

    Parameters:
    -----------
    input_file : str
        Input file path (supports .mzML, .mzXML, .mgf)
    output_format : str
        Output format ('mgf', 'msp', or 'json')
    """
    # Determine input format and load
    if input_file.endswith('.mzML') or input_file.endswith('.mzXML'):
        from matchms.importing import load_from_mzml
        spectra = list(load_from_mzml(input_file, ms_level=2))
    elif input_file.endswith('.mgf'):
        spectra = list(load_from_mgf(input_file))
    else:
        raise ValueError(f"Unsupported format: {input_file}")

    print(f"Loaded {len(spectra)} spectra from {input_file}")

    # Standardize
    processed = []
    for spectrum in spectra:
        spectrum = default_filters(spectrum)
        spectrum = normalize_intensities(spectrum)
        if spectrum is not None:
            processed.append(spectrum)

    print(f"Standardized {len(processed)} spectra")

    # Export
    output_file = input_file.rsplit('.', 1)[0] + f'_standardized.{output_format}'

    if output_format == 'mgf':
        save_as_mgf(processed, output_file)
    elif output_format == 'msp':
        save_as_msp(processed, output_file)
    elif output_format == 'json':
        save_as_json(processed, output_file)
    else:
        raise ValueError(f"Unsupported output format: {output_format}")

    print(f"Saved to {output_file}")
    return processed

# Convert mzML to MGF
convert_and_standardize("raw_data.mzML", output_format="mgf")

# Convert MGF to MSP library format
convert_and_standardize("library.mgf", output_format="msp")
```

---

## Workflow 7: Metadata Enrichment and Validation

Enrich spectra with chemical structure information and validate annotations.

```python
from matchms.importing import load_from_mgf
from matchms.exporting import save_as_mgf
from matchms.filtering import (default_filters, derive_inchi_from_smiles,
                               derive_inchikey_from_inchi, derive_smiles_from_inchi,
                               add_fingerprint, repair_not_matching_annotation,
                               require_valid_annotation)

# Load spectra
spectra = list(load_from_mgf("spectra.mgf"))

# Enrich and validate
enriched_spectra = []
validation_failures = []

for i, spectrum in enumerate(spectra):
    # Basic harmonization
    spectrum = default_filters(spectrum)

    # Derive chemical structures
    spectrum = derive_inchi_from_smiles(spectrum)
    spectrum = derive_inchikey_from_inchi(spectrum)
    spectrum = derive_smiles_from_inchi(spectrum)

    # Repair mismatches
    spectrum = repair_not_matching_annotation(spectrum)

    # Add molecular fingerprints
    spectrum = add_fingerprint(spectrum, fingerprint_type="morgan2", nbits=2048)

    # Validate
    validated = require_valid_annotation(spectrum)

    if validated is not None:
        enriched_spectra.append(validated)
    else:
        validation_failures.append(i)

print(f"Successfully enriched: {len(enriched_spectra)}")
print(f"Validation failures: {len(validation_failures)}")

# Save enriched data
save_as_mgf(enriched_spectra, "enriched_spectra.mgf")

# Report failures
if validation_failures:
    print("\nSpectra that failed validation:")
    for idx in validation_failures[:10]:  # Show first 10
        original = spectra[idx]
        name = original.get("compound_name", f"Spectrum {idx}")
        print(f"  - {name}")
```

---

## Workflow 8: Large-Scale Library Comparison

Compare two large spectral libraries efficiently.

```python
from matchms.importing import load_from_mgf
from matchms.filtering import default_filters, normalize_intensities
from matchms import calculate_scores
from matchms.similarity import CosineGreedy
import numpy as np

# Load two libraries
print("Loading libraries...")
library1 = list(load_from_mgf("library1.mgf"))
library2 = list(load_from_mgf("library2.mgf"))

# Process
processed_lib1 = [normalize_intensities(default_filters(s)) for s in library1]
processed_lib2 = [normalize_intensities(default_filters(s)) for s in library2]

# Calculate all-vs-all similarities
print("Calculating similarities...")
scores = calculate_scores(processed_lib1, processed_lib2,
                         CosineGreedy(tolerance=0.1))

# Find high-similarity pairs (potential duplicates or similar compounds)
threshold = 0.8
similar_pairs = []

for i, spec1 in enumerate(processed_lib1):
    for j, spec2 in enumerate(processed_lib2):
        score = scores.scores[i, j]
        if score >= threshold:
            similar_pairs.append({
                'lib1_idx': i,
                'lib2_idx': j,
                'lib1_name': spec1.get("compound_name", f"L1_{i}"),
                'lib2_name': spec2.get("compound_name", f"L2_{j}"),
                'similarity': score
            })

# Sort by similarity
similar_pairs.sort(key=lambda x: x['similarity'], reverse=True)

print(f"\nFound {len(similar_pairs)} pairs with similarity >= {threshold}")
print("\nTop 10 most similar pairs:")
for pair in similar_pairs[:10]:
    print(f"{pair['lib1_name']} <-> {pair['lib2_name']}: {pair['similarity']:.4f}")

# Export to CSV
import pandas as pd
df = pd.DataFrame(similar_pairs)
df.to_csv("library_comparison.csv", index=False)
print("\nFull results saved to library_comparison.csv")
```

---

## Workflow 9: Ion Mode Specific Processing

Process positive and negative mode spectra separately.

```python
from matchms.importing import load_from_mgf
from matchms.filtering import (default_filters, normalize_intensities,
                               require_correct_ionmode, derive_ionmode)
from matchms.exporting import save_as_mgf

# Load mixed mode spectra
spectra = list(load_from_mgf("mixed_modes.mgf"))

# Separate by ion mode
positive_spectra = []
negative_spectra = []
unknown_mode = []

for spectrum in spectra:
    # Harmonize and derive ion mode
    spectrum = default_filters(spectrum)
    spectrum = derive_ionmode(spectrum)

    # Separate by mode
    ionmode = spectrum.get("ionmode")

    if ionmode == "positive":
        spectrum = normalize_intensities(spectrum)
        positive_spectra.append(spectrum)
    elif ionmode == "negative":
        spectrum = normalize_intensities(spectrum)
        negative_spectra.append(spectrum)
    else:
        unknown_mode.append(spectrum)

print(f"Positive mode: {len(positive_spectra)}")
print(f"Negative mode: {len(negative_spectra)}")
print(f"Unknown mode: {len(unknown_mode)}")

# Save separated data
save_as_mgf(positive_spectra, "positive_mode.mgf")
save_as_mgf(negative_spectra, "negative_mode.mgf")

# Process mode-specific analyses
from matchms import calculate_scores
from matchms.similarity import CosineGreedy

if len(positive_spectra) > 1:
    print("\nCalculating positive mode similarities...")
    pos_scores = calculate_scores(positive_spectra, positive_spectra,
                                  CosineGreedy(tolerance=0.1))

if len(negative_spectra) > 1:
    print("Calculating negative mode similarities...")
    neg_scores = calculate_scores(negative_spectra, negative_spectra,
                                  CosineGreedy(tolerance=0.1))
```

---

## Workflow 10: Automated Compound Identification Report

Generate a detailed compound identification report.

```python
from matchms.importing import load_from_mgf
from matchms.filtering import default_filters, normalize_intensities
from matchms import calculate_scores
from matchms.similarity import CosineGreedy, ModifiedCosine
import pandas as pd

def identify_compounds(query_file, library_file, output_csv="identification_report.csv"):
    """
    Automated compound identification with detailed report
    """
    # Load data
    print("Loading data...")
    queries = list(load_from_mgf(query_file))
    library = list(load_from_mgf(library_file))

    # Process
    proc_queries = [normalize_intensities(default_filters(s)) for s in queries]
    proc_library = [normalize_intensities(default_filters(s)) for s in library]

    # Calculate similarities
    print("Calculating similarities...")
    cosine_scores = calculate_scores(proc_library, proc_queries, CosineGreedy())
    modified_scores = calculate_scores(proc_library, proc_queries, ModifiedCosine())

    # Generate report
    results = []
    for i, query in enumerate(proc_queries):
        query_name = query.get("compound_name", f"Unknown_{i}")
        query_mz = query.get("precursor_mz", "N/A")

        # Get top 5 matches
        cosine_matches = cosine_scores.scores_by_query(query, sort=True)[:5]

        for rank, (lib_idx, cos_score) in enumerate(cosine_matches, 1):
            ref = proc_library[lib_idx]
            mod_score = modified_scores.scores[lib_idx, i]

            results.append({
                'Query': query_name,
                'Query_mz': query_mz,
                'Rank': rank,
                'Match': ref.get("compound_name", f"Ref_{lib_idx}"),
                'Match_mz': ref.get("precursor_mz", "N/A"),
                'Cosine_Score': cos_score,
                'Modified_Cosine': mod_score,
                'InChIKey': ref.get("inchikey", "N/A")
            })

    # Create DataFrame and save
    df = pd.DataFrame(results)
    df.to_csv(output_csv, index=False)
    print(f"\nReport saved to {output_csv}")

    # Summary statistics
    print("\nSummary:")
    high_confidence = len(df[df['Cosine_Score'] >= 0.8])
    medium_confidence = len(df[(df['Cosine_Score'] >= 0.6) & (df['Cosine_Score'] < 0.8)])
    low_confidence = len(df[df['Cosine_Score'] < 0.6])

    print(f"  High confidence (≥0.8): {high_confidence}")
    print(f"  Medium confidence (0.6-0.8): {medium_confidence}")
    print(f"  Low confidence (<0.6): {low_confidence}")

    return df

# Run identification
report = identify_compounds("unknowns.mgf", "reference_library.mgf")
```

---

## Best Practices

1. **Always process both queries and references**: Apply the same filters to ensure consistent comparison
2. **Save intermediate results**: Use pickle format for fast reloading of processed spectra
3. **Monitor memory usage**: Use generators for large files instead of loading all at once
4. **Validate data quality**: Apply quality filters before similarity calculations
5. **Choose appropriate similarity metrics**: CosineGreedy for speed, ModifiedCosine for related compounds
6. **Combine multiple metrics**: Use multiple similarity scores for robust identification
7. **Filter by precursor mass first**: Dramatically speeds up large library searches
8. **Document your pipeline**: Save processing parameters for reproducibility

## Further Resources

- matchms documentation: https://matchms.readthedocs.io
- GNPS platform: https://gnps.ucsd.edu
- matchms GitHub: https://github.com/matchms/matchms
