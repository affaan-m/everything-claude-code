---
name: matchms
description: Spectral similarity and compound identification for metabolomics. Use for comparing mass spectra, computing similarity scores (cosine, modified cosine), and identifying unknown compounds from spectral libraries. Best for metabolite identification, spectral matching, library searching. For full LC-MS/MS proteomics pipelines use pyopenms.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# Matchms

## Overview

Matchms is an open-source Python library for mass spectrometry data processing and analysis. Import spectra from various formats, standardize metadata, filter peaks, calculate spectral similarities, and build reproducible analytical workflows.

## Core Capabilities

### 1. Importing and Exporting Mass Spectrometry Data

Load spectra from multiple file formats and export processed data:

```python
from matchms.importing import load_from_mgf, load_from_mzml, load_from_msp, load_from_json
from matchms.exporting import save_as_mgf, save_as_msp, save_as_json

# Import spectra
spectra = list(load_from_mgf("spectra.mgf"))
spectra = list(load_from_mzml("data.mzML"))
spectra = list(load_from_msp("library.msp"))

# Export processed spectra
save_as_mgf(spectra, "output.mgf")
save_as_json(spectra, "output.json")
```

**Supported formats:**
- mzML and mzXML (raw mass spectrometry formats)
- MGF (Mascot Generic Format)
- MSP (spectral library format)
- JSON (GNPS-compatible)
- metabolomics-USI references
- Pickle (Python serialization)

For detailed importing/exporting documentation, consult `references/importing_exporting.md`.

### 2. Spectrum Filtering and Processing

Apply comprehensive filters to standardize metadata and refine peak data:

```python
from matchms.filtering import default_filters, normalize_intensities
from matchms.filtering import select_by_relative_intensity, require_minimum_number_of_peaks

# Apply default metadata harmonization filters
spectrum = default_filters(spectrum)

# Normalize peak intensities
spectrum = normalize_intensities(spectrum)

# Filter peaks by relative intensity
spectrum = select_by_relative_intensity(spectrum, intensity_from=0.01, intensity_to=1.0)

# Require minimum peaks
spectrum = require_minimum_number_of_peaks(spectrum, n_required=5)
```

**Filter categories:**
- **Metadata processing**: Harmonize compound names, derive chemical structures, standardize adducts, correct charges
- **Peak filtering**: Normalize intensities, select by m/z or intensity, remove precursor peaks
- **Quality control**: Require minimum peaks, validate precursor m/z, ensure metadata completeness
- **Chemical annotation**: Add fingerprints, derive InChI/SMILES, repair structural mismatches

Matchms provides 40+ filters. For the complete filter reference, consult `references/filtering.md`.

### 3. Calculating Spectral Similarities

Compare spectra using various similarity metrics:

```python
from matchms import calculate_scores
from matchms.similarity import CosineGreedy, ModifiedCosine, CosineHungarian

# Calculate cosine similarity (fast, greedy algorithm)
scores = calculate_scores(references=library_spectra,
                         queries=query_spectra,
                         similarity_function=CosineGreedy())

# Calculate modified cosine (accounts for precursor m/z differences)
scores = calculate_scores(references=library_spectra,
                         queries=query_spectra,
                         similarity_function=ModifiedCosine(tolerance=0.1))

# Get best matches
best_matches = scores.scores_by_query(query_spectra[0], sort=True)[:10]
```

**Available similarity functions:**
- **CosineGreedy/CosineHungarian**: Peak-based cosine similarity with different matching algorithms
- **ModifiedCosine**: Cosine similarity accounting for precursor mass differences
- **NeutralLossesCosine**: Similarity based on neutral loss patterns
- **FingerprintSimilarity**: Molecular structure similarity using fingerprints
- **MetadataMatch**: Compare user-defined metadata fields
- **PrecursorMzMatch/ParentMassMatch**: Simple mass-based filtering

For detailed similarity function documentation, consult `references/similarity.md`.

### 4. Building Processing Pipelines

Create reproducible, multi-step analysis workflows:

```python
from matchms import SpectrumProcessor
from matchms.filtering import default_filters, normalize_intensities
from matchms.filtering import select_by_relative_intensity, remove_peaks_around_precursor_mz

# Define a processing pipeline
processor = SpectrumProcessor([
    default_filters,
    normalize_intensities,
    lambda s: select_by_relative_intensity(s, intensity_from=0.01),
    lambda s: remove_peaks_around_precursor_mz(s, mz_tolerance=17)
])

# Apply to all spectra
processed_spectra = [processor(s) for s in spectra]
```

### 5. Working with Spectrum Objects

The core `Spectrum` class contains mass spectral data:

```python
from matchms import Spectrum
import numpy as np

# Create a spectrum
mz = np.array([100.0, 150.0, 200.0, 250.0])
intensities = np.array([0.1, 0.5, 0.9, 0.3])
metadata = {"precursor_mz": 250.5, "ionmode": "positive"}

spectrum = Spectrum(mz=mz, intensities=intensities, metadata=metadata)

# Access spectrum properties
print(spectrum.peaks.mz)           # m/z values
print(spectrum.peaks.intensities)  # Intensity values
print(spectrum.get("precursor_mz")) # Metadata field

# Visualize spectra
spectrum.plot()
spectrum.plot_against(reference_spectrum)
```

### 6. Metadata Management

Standardize and harmonize spectrum metadata:

```python
# Metadata is automatically harmonized
spectrum.set("Precursor_mz", 250.5)  # Gets harmonized to lowercase key
print(spectrum.get("precursor_mz"))   # Returns 250.5

# Derive chemical information
from matchms.filtering import derive_inchi_from_smiles, derive_inchikey_from_inchi
from matchms.filtering import add_fingerprint

spectrum = derive_inchi_from_smiles(spectrum)
spectrum = derive_inchikey_from_inchi(spectrum)
spectrum = add_fingerprint(spectrum, fingerprint_type="morgan", nbits=2048)
```

## Common Workflows

For typical mass spectrometry analysis workflows, including:
- Loading and preprocessing spectral libraries
- Matching unknown spectra against reference libraries
- Quality filtering and data cleaning
- Large-scale similarity comparisons
- Network-based spectral clustering

Consult `references/workflows.md` for detailed examples.

## Installation

```bash
uv pip install matchms
```

For molecular structure processing (SMILES, InChI):
```bash
uv pip install matchms[chemistry]
```

## Reference Documentation

Detailed reference documentation is available in the `references/` directory:
- `filtering.md` - Complete filter function reference with descriptions
- `similarity.md` - All similarity metrics and when to use them
- `importing_exporting.md` - File format details and I/O operations
- `workflows.md` - Common analysis patterns and examples

Load these references as needed for detailed information about specific matchms capabilities.

