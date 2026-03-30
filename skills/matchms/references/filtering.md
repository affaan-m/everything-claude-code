# Matchms Filtering Functions Reference

This document provides a comprehensive reference of all filtering functions available in matchms for processing mass spectrometry data.

## Metadata Processing Filters

### Compound & Chemical Information

**add_compound_name(spectrum)**
- Adds compound name to the correct metadata field
- Standardizes compound name storage location

**clean_compound_name(spectrum)**
- Removes frequently seen unwanted additions from compound names
- Cleans up formatting inconsistencies

**derive_adduct_from_name(spectrum)**
- Extracts adduct information from compound names
- Moves adduct notation to proper metadata field

**derive_formula_from_name(spectrum)**
- Detects chemical formulas in compound names
- Relocates formulas to appropriate metadata field

**derive_annotation_from_compound_name(spectrum)**
- Retrieves SMILES/InChI from PubChem using compound name
- Automatically annotates chemical structures

### Chemical Structure Conversions

**derive_inchi_from_smiles(spectrum)**
- Generates InChI from SMILES strings
- Requires rdkit library

**derive_inchikey_from_inchi(spectrum)**
- Computes InChIKey from InChI
- 27-character hashed identifier

**derive_smiles_from_inchi(spectrum)**
- Creates SMILES from InChI representation
- Requires rdkit library

**repair_inchi_inchikey_smiles(spectrum)**
- Corrects misplaced chemical identifiers
- Fixes metadata field confusion

**repair_not_matching_annotation(spectrum)**
- Ensures consistency between SMILES, InChI, and InChIKey
- Validates chemical structure annotations match

**add_fingerprint(spectrum, fingerprint_type="daylight", nbits=2048, radius=2)**
- Generates molecular fingerprints for similarity calculations
- Fingerprint types: "daylight", "morgan1", "morgan2", "morgan3"
- Used with FingerprintSimilarity scoring

### Mass & Charge Information

**add_precursor_mz(spectrum)**
- Normalizes precursor m/z values
- Standardizes precursor mass metadata

**add_parent_mass(spectrum, estimate_from_adduct=True)**
- Calculates neutral parent mass from precursor m/z and adduct
- Can estimate from adduct if not directly available

**correct_charge(spectrum)**
- Aligns charge values with ionmode
- Ensures charge sign matches ionization mode

**make_charge_int(spectrum)**
- Converts charge to integer format
- Standardizes charge representation

**clean_adduct(spectrum)**
- Standardizes adduct notation
- Corrects common adduct formatting issues

**interpret_pepmass(spectrum)**
- Parses pepmass field into component values
- Extracts precursor m/z and intensity from combined field

### Ion Mode & Validation

**derive_ionmode(spectrum)**
- Determines ionmode from adduct information
- Infers positive/negative mode from adduct type

**require_correct_ionmode(spectrum, ion_mode)**
- Filters spectra by specified ionmode
- Returns None if ionmode doesn't match
- Use: `spectrum = require_correct_ionmode(spectrum, "positive")`

**require_precursor_mz(spectrum, minimum_accepted_mz=0.0)**
- Validates precursor m/z presence and value
- Returns None if missing or below threshold

**require_precursor_below_mz(spectrum, maximum_accepted_mz=1000.0)**
- Enforces maximum precursor m/z limit
- Returns None if precursor exceeds threshold

### Retention Information

**add_retention_time(spectrum)**
- Harmonizes retention time as float values
- Standardizes RT metadata field

**add_retention_index(spectrum)**
- Stores retention index in standardized field
- Normalizes RI metadata

### Data Harmonization

**harmonize_undefined_inchi(spectrum, undefined="", aliases=None)**
- Standardizes undefined/empty InChI entries
- Replaces various "unknown" representations with consistent value

**harmonize_undefined_inchikey(spectrum, undefined="", aliases=None)**
- Standardizes undefined/empty InChIKey entries
- Unifies missing data representation

**harmonize_undefined_smiles(spectrum, undefined="", aliases=None)**
- Standardizes undefined/empty SMILES entries
- Consistent handling of missing structural data

### Repair & Quality Functions

**repair_adduct_based_on_smiles(spectrum, mass_tolerance=0.1)**
- Corrects adduct using SMILES and mass matching
- Validates adduct matches calculated mass

**repair_parent_mass_is_mol_wt(spectrum, mass_tolerance=0.1)**
- Converts molecular weight to monoisotopic mass
- Fixes common metadata confusion

**repair_precursor_is_parent_mass(spectrum)**
- Fixes swapped precursor/parent mass values
- Corrects field misassignments

**repair_smiles_of_salts(spectrum, mass_tolerance=0.1)**
- Removes salt components to match parent mass
- Extracts relevant molecular fragment

**require_parent_mass_match_smiles(spectrum, mass_tolerance=0.1)**
- Validates parent mass against SMILES-calculated mass
- Returns None if masses don't match within tolerance

**require_valid_annotation(spectrum)**
- Ensures complete, consistent chemical annotations
- Validates SMILES, InChI, and InChIKey presence and consistency

## Peak Processing Filters

### Normalization & Selection

**normalize_intensities(spectrum)**
- Scales peak intensities to unit height (max = 1.0)
- Essential preprocessing step for similarity calculations

**select_by_intensity(spectrum, intensity_from=0.0, intensity_to=1.0)**
- Retains peaks within specified absolute intensity range
- Filters by raw intensity values

**select_by_relative_intensity(spectrum, intensity_from=0.0, intensity_to=1.0)**
- Keeps peaks within relative intensity bounds
- Filters as fraction of maximum intensity

**select_by_mz(spectrum, mz_from=0.0, mz_to=1000.0)**
- Filters peaks by m/z value range
- Removes peaks outside specified m/z window

### Peak Reduction & Filtering

**reduce_to_number_of_peaks(spectrum, n_max=None, ratio_desired=None)**
- Removes lowest-intensity peaks when exceeding maximum
- Can specify absolute number or ratio
- Use: `spectrum = reduce_to_number_of_peaks(spectrum, n_max=100)`

**remove_peaks_around_precursor_mz(spectrum, mz_tolerance=17)**
- Eliminates peaks within tolerance of precursor
- Removes precursor and isotope peaks
- Common preprocessing for fragment-based similarity

**remove_peaks_outside_top_k(spectrum, k=10, ratio_desired=None)**
- Retains only peaks near k highest-intensity peaks
- Focuses on most informative signals

**require_minimum_number_of_peaks(spectrum, n_required=10)**
- Discards spectra with insufficient peaks
- Quality control filter
- Returns None if peak count below threshold

**require_minimum_number_of_high_peaks(spectrum, n_required=5, intensity_threshold=0.05)**
- Removes spectra lacking high-intensity peaks
- Ensures data quality
- Returns None if insufficient peaks above threshold

### Loss Calculation

**add_losses(spectrum, loss_mz_from=5.0, loss_mz_to=200.0)**
- Derives neutral losses from precursor mass
- Calculates loss = precursor_mz - fragment_mz
- Adds losses to spectrum for NeutralLossesCosine scoring

## Pipeline Functions

**default_filters(spectrum)**
- Applies nine essential metadata filters sequentially:
  1. make_charge_int
  2. add_precursor_mz
  3. add_retention_time
  4. add_retention_index
  5. derive_adduct_from_name
  6. derive_formula_from_name
  7. clean_compound_name
  8. harmonize_undefined_smiles
  9. harmonize_undefined_inchi
- Recommended starting point for metadata harmonization

**SpectrumProcessor(filters)**
- Orchestrates multi-filter pipelines
- Accepts list of filter functions
- Example:
```python
from matchms import SpectrumProcessor
processor = SpectrumProcessor([
    default_filters,
    normalize_intensities,
    lambda s: select_by_relative_intensity(s, intensity_from=0.01)
])
processed = processor(spectrum)
```

## Common Filter Combinations

### Standard Preprocessing Pipeline
```python
from matchms.filtering import (default_filters, normalize_intensities,
                               select_by_relative_intensity,
                               require_minimum_number_of_peaks)

spectrum = default_filters(spectrum)
spectrum = normalize_intensities(spectrum)
spectrum = select_by_relative_intensity(spectrum, intensity_from=0.01)
spectrum = require_minimum_number_of_peaks(spectrum, n_required=5)
```

### Quality Control Pipeline
```python
from matchms.filtering import (require_precursor_mz, require_minimum_number_of_peaks,
                               require_minimum_number_of_high_peaks)

spectrum = require_precursor_mz(spectrum, minimum_accepted_mz=50.0)
if spectrum is None:
    # Spectrum failed quality control
    pass
spectrum = require_minimum_number_of_peaks(spectrum, n_required=10)
spectrum = require_minimum_number_of_high_peaks(spectrum, n_required=5)
```

### Chemical Annotation Pipeline
```python
from matchms.filtering import (derive_inchi_from_smiles, derive_inchikey_from_inchi,
                               add_fingerprint, require_valid_annotation)

spectrum = derive_inchi_from_smiles(spectrum)
spectrum = derive_inchikey_from_inchi(spectrum)
spectrum = add_fingerprint(spectrum, fingerprint_type="morgan2", nbits=2048)
spectrum = require_valid_annotation(spectrum)
```

### Peak Cleaning Pipeline
```python
from matchms.filtering import (normalize_intensities, remove_peaks_around_precursor_mz,
                               select_by_relative_intensity, reduce_to_number_of_peaks)

spectrum = normalize_intensities(spectrum)
spectrum = remove_peaks_around_precursor_mz(spectrum, mz_tolerance=17)
spectrum = select_by_relative_intensity(spectrum, intensity_from=0.01)
spectrum = reduce_to_number_of_peaks(spectrum, n_max=200)
```

## Notes on Filter Usage

1. **Order matters**: Apply filters in logical sequence (e.g., normalize before relative intensity selection)
2. **Filters return None**: Many filters return None for invalid spectra; check for None before proceeding
3. **Immutability**: Filters typically return modified copies; reassign results to variables
4. **Pipeline efficiency**: Use SpectrumProcessor for consistent multi-spectrum processing
5. **Documentation**: For detailed parameters, see matchms.readthedocs.io/en/latest/api/matchms.filtering.html
