# Core Data Structures

## Overview

PyOpenMS uses C++ objects with Python bindings. Understanding these core data structures is essential for effective data manipulation.

## Spectrum and Experiment Objects

### MSExperiment

Container for complete LC-MS experiment data (spectra and chromatograms).

```python
import pyopenms as ms

# Create experiment
exp = ms.MSExperiment()

# Load from file
ms.MzMLFile().load("data.mzML", exp)

# Access properties
print(f"Number of spectra: {exp.getNrSpectra()}")
print(f"Number of chromatograms: {exp.getNrChromatograms()}")

# Get RT range
rts = [spec.getRT() for spec in exp]
print(f"RT range: {min(rts):.1f} - {max(rts):.1f} seconds")

# Access individual spectrum
spec = exp.getSpectrum(0)

# Iterate through spectra
for spec in exp:
    if spec.getMSLevel() == 2:
        print(f"MS2 spectrum at RT {spec.getRT():.2f}")

# Get metadata
exp_settings = exp.getExperimentalSettings()
instrument = exp_settings.getInstrument()
print(f"Instrument: {instrument.getName()}")
```

### MSSpectrum

Individual mass spectrum with m/z and intensity arrays.

```python
# Create empty spectrum
spec = ms.MSSpectrum()

# Get from experiment
exp = ms.MSExperiment()
ms.MzMLFile().load("data.mzML", exp)
spec = exp.getSpectrum(0)

# Basic properties
print(f"MS level: {spec.getMSLevel()}")
print(f"Retention time: {spec.getRT():.2f} seconds")
print(f"Number of peaks: {spec.size()}")

# Get peak data as numpy arrays
mz, intensity = spec.get_peaks()
print(f"m/z range: {mz.min():.2f} - {mz.max():.2f}")
print(f"Max intensity: {intensity.max():.0f}")

# Access individual peaks
for i in range(min(5, spec.size())):  # First 5 peaks
    print(f"Peak {i}: m/z={mz[i]:.4f}, intensity={intensity[i]:.0f}")

# Precursor information (for MS2)
if spec.getMSLevel() == 2:
    precursors = spec.getPrecursors()
    if precursors:
        precursor = precursors[0]
        print(f"Precursor m/z: {precursor.getMZ():.4f}")
        print(f"Precursor charge: {precursor.getCharge()}")
        print(f"Precursor intensity: {precursor.getIntensity():.0f}")

# Set peak data
new_mz = [100.0, 200.0, 300.0]
new_intensity = [1000.0, 2000.0, 1500.0]
spec.set_peaks((new_mz, new_intensity))
```

### MSChromatogram

Chromatographic trace (TIC, XIC, or SRM transition).

```python
# Access chromatogram from experiment
for chrom in exp.getChromatograms():
    print(f"Chromatogram ID: {chrom.getNativeID()}")

    # Get data
    rt, intensity = chrom.get_peaks()

    print(f"  RT points: {len(rt)}")
    print(f"  Max intensity: {intensity.max():.0f}")

    # Precursor info (for XIC)
    precursor = chrom.getPrecursor()
    print(f"  Precursor m/z: {precursor.getMZ():.4f}")
```

## Feature Objects

### Feature

Detected chromatographic peak with 2D spatial extent (RT-m/z).

```python
# Load features
feature_map = ms.FeatureMap()
ms.FeatureXMLFile().load("features.featureXML", feature_map)

# Access individual feature
feature = feature_map[0]

# Core properties
print(f"m/z: {feature.getMZ():.4f}")
print(f"RT: {feature.getRT():.2f} seconds")
print(f"Intensity: {feature.getIntensity():.0f}")
print(f"Charge: {feature.getCharge()}")

# Quality metrics
print(f"Overall quality: {feature.getOverallQuality():.3f}")
print(f"Width (RT): {feature.getWidth():.2f}")

# Convex hull (spatial extent)
hull = feature.getConvexHull()
print(f"Hull points: {hull.getHullPoints().size()}")

# Bounding box
bbox = hull.getBoundingBox()
print(f"RT range: {bbox.minPosition()[0]:.2f} - {bbox.maxPosition()[0]:.2f}")
print(f"m/z range: {bbox.minPosition()[1]:.4f} - {bbox.maxPosition()[1]:.4f}")

# Subordinate features (isotopes)
subordinates = feature.getSubordinates()
if subordinates:
    print(f"Isotopic features: {len(subordinates)}")
    for sub in subordinates:
        print(f"  m/z: {sub.getMZ():.4f}, intensity: {sub.getIntensity():.0f}")

# Metadata values
if feature.metaValueExists("label"):
    label = feature.getMetaValue("label")
    print(f"Label: {label}")
```

### FeatureMap

Collection of features from a single LC-MS run.

```python
# Create feature map
feature_map = ms.FeatureMap()

# Load from file
ms.FeatureXMLFile().load("features.featureXML", feature_map)

# Access properties
print(f"Number of features: {feature_map.size()}")

# Get unique features
print(f"Unique features: {feature_map.getUniqueId()}")

# Metadata
primary_path = feature_map.getPrimaryMSRunPath()
if primary_path:
    print(f"Source file: {primary_path[0].decode()}")

# Iterate through features
for feature in feature_map:
    print(f"Feature: m/z={feature.getMZ():.4f}, RT={feature.getRT():.2f}")

# Add new feature
new_feature = ms.Feature()
new_feature.setMZ(500.0)
new_feature.setRT(300.0)
new_feature.setIntensity(10000.0)
feature_map.push_back(new_feature)

# Sort features
feature_map.sortByRT()  # or sortByMZ(), sortByIntensity()

# Export to pandas
df = feature_map.get_df()
print(df.head())
```

### ConsensusFeature

Feature linked across multiple samples.

```python
# Load consensus map
consensus_map = ms.ConsensusMap()
ms.ConsensusXMLFile().load("consensus.consensusXML", consensus_map)

# Access consensus feature
cons_feature = consensus_map[0]

# Consensus properties
print(f"Consensus m/z: {cons_feature.getMZ():.4f}")
print(f"Consensus RT: {cons_feature.getRT():.2f}")
print(f"Consensus intensity: {cons_feature.getIntensity():.0f}")

# Get feature handles (individual map features)
feature_list = cons_feature.getFeatureList()
print(f"Present in {len(feature_list)} maps")

for handle in feature_list:
    map_idx = handle.getMapIndex()
    intensity = handle.getIntensity()
    mz = handle.getMZ()
    rt = handle.getRT()

    print(f"  Map {map_idx}: m/z={mz:.4f}, RT={rt:.2f}, intensity={intensity:.0f}")

# Get unique ID in originating map
for handle in feature_list:
    unique_id = handle.getUniqueId()
    print(f"Unique ID: {unique_id}")
```

### ConsensusMap

Collection of consensus features across samples.

```python
# Create consensus map
consensus_map = ms.ConsensusMap()

# Load from file
ms.ConsensusXMLFile().load("consensus.consensusXML", consensus_map)

# Access properties
print(f"Consensus features: {consensus_map.size()}")

# Column headers (file descriptions)
headers = consensus_map.getColumnHeaders()
print(f"Number of files: {len(headers)}")

for map_idx, description in headers.items():
    print(f"Map {map_idx}:")
    print(f"  Filename: {description.filename}")
    print(f"  Label: {description.label}")
    print(f"  Size: {description.size}")

# Iterate through consensus features
for cons_feature in consensus_map:
    print(f"Consensus feature: m/z={cons_feature.getMZ():.4f}")

# Export to DataFrame
df = consensus_map.get_df()
```

## Identification Objects

### PeptideIdentification

Identification results for a single spectrum.

```python
# Load identifications
protein_ids = []
peptide_ids = []
ms.IdXMLFile().load("identifications.idXML", protein_ids, peptide_ids)

# Access peptide identification
peptide_id = peptide_ids[0]

# Spectrum metadata
print(f"RT: {peptide_id.getRT():.2f}")
print(f"m/z: {peptide_id.getMZ():.4f}")

# Identification metadata
print(f"Identifier: {peptide_id.getIdentifier()}")
print(f"Score type: {peptide_id.getScoreType()}")
print(f"Higher score better: {peptide_id.isHigherScoreBetter()}")

# Get peptide hits
hits = peptide_id.getHits()
print(f"Number of hits: {len(hits)}")

for hit in hits:
    print(f"  Sequence: {hit.getSequence().toString()}")
    print(f"  Score: {hit.getScore()}")
    print(f"  Charge: {hit.getCharge()}")
```

### PeptideHit

Individual peptide match to a spectrum.

```python
# Access hit
hit = peptide_id.getHits()[0]

# Sequence information
sequence = hit.getSequence()
print(f"Sequence: {sequence.toString()}")
print(f"Mass: {sequence.getMonoWeight():.4f}")

# Score and rank
print(f"Score: {hit.getScore()}")
print(f"Rank: {hit.getRank()}")

# Charge state
print(f"Charge: {hit.getCharge()}")

# Protein accessions
accessions = hit.extractProteinAccessionsSet()
for acc in accessions:
    print(f"Protein: {acc.decode()}")

# Meta values (additional scores, errors)
if hit.metaValueExists("MS:1002252"):  # mass error
    mass_error = hit.getMetaValue("MS:1002252")
    print(f"Mass error: {mass_error:.4f} ppm")
```

### ProteinIdentification

Protein-level identification information.

```python
# Access protein identification
protein_id = protein_ids[0]

# Search engine info
print(f"Search engine: {protein_id.getSearchEngine()}")
print(f"Search engine version: {protein_id.getSearchEngineVersion()}")

# Search parameters
search_params = protein_id.getSearchParameters()
print(f"Database: {search_params.db}")
print(f"Enzyme: {search_params.digestion_enzyme.getName()}")
print(f"Missed cleavages: {search_params.missed_cleavages}")
print(f"Precursor tolerance: {search_params.precursor_mass_tolerance}")

# Protein hits
hits = protein_id.getHits()
for hit in hits:
    print(f"Accession: {hit.getAccession()}")
    print(f"Score: {hit.getScore()}")
    print(f"Coverage: {hit.getCoverage():.1f}%")
```

### ProteinHit

Individual protein identification.

```python
# Access protein hit
protein_hit = protein_id.getHits()[0]

# Protein information
print(f"Accession: {protein_hit.getAccession()}")
print(f"Description: {protein_hit.getDescription()}")
print(f"Sequence: {protein_hit.getSequence()}")

# Scoring
print(f"Score: {protein_hit.getScore()}")
print(f"Coverage: {protein_hit.getCoverage():.1f}%")

# Rank
print(f"Rank: {protein_hit.getRank()}")
```

## Sequence Objects

### AASequence

Amino acid sequence with modifications.

```python
# Create sequence from string
seq = ms.AASequence.fromString("PEPTIDE")

# Basic properties
print(f"Sequence: {seq.toString()}")
print(f"Length: {seq.size()}")
print(f"Monoisotopic mass: {seq.getMonoWeight():.4f}")
print(f"Average mass: {seq.getAverageWeight():.4f}")

# Individual residues
for i in range(seq.size()):
    residue = seq.getResidue(i)
    print(f"Position {i}: {residue.getOneLetterCode()}")
    print(f"  Mass: {residue.getMonoWeight():.4f}")
    print(f"  Formula: {residue.getFormula().toString()}")

# Modified sequence
mod_seq = ms.AASequence.fromString("PEPTIDEM(Oxidation)K")
print(f"Modified: {mod_seq.isModified()}")

# Check modifications
for i in range(mod_seq.size()):
    residue = mod_seq.getResidue(i)
    if residue.isModified():
        print(f"Modification at {i}: {residue.getModificationName()}")

# N-terminal and C-terminal modifications
term_mod_seq = ms.AASequence.fromString("(Acetyl)PEPTIDE(Amidated)")
```

### EmpiricalFormula

Molecular formula representation.

```python
# Create formula
formula = ms.EmpiricalFormula("C6H12O6")  # Glucose

# Properties
print(f"Formula: {formula.toString()}")
print(f"Monoisotopic mass: {formula.getMonoWeight():.4f}")
print(f"Average mass: {formula.getAverageWeight():.4f}")

# Element composition
print(f"Carbon atoms: {formula.getNumberOf(b'C')}")
print(f"Hydrogen atoms: {formula.getNumberOf(b'H')}")
print(f"Oxygen atoms: {formula.getNumberOf(b'O')}")

# Arithmetic operations
formula2 = ms.EmpiricalFormula("H2O")
combined = formula + formula2  # Add water
print(f"Combined: {combined.toString()}")
```

## Parameter Objects

### Param

Generic parameter container used by algorithms.

```python
# Get algorithm parameters
algo = ms.GaussFilter()
params = algo.getParameters()

# List all parameters
for key in params.keys():
    value = params.getValue(key)
    print(f"{key}: {value}")

# Get specific parameter
gaussian_width = params.getValue("gaussian_width")
print(f"Gaussian width: {gaussian_width}")

# Set parameter
params.setValue("gaussian_width", 0.2)

# Apply modified parameters
algo.setParameters(params)

# Copy parameters
params_copy = ms.Param(params)
```

## Best Practices

### Memory Management

```python
# For large files, use indexed access instead of full loading
indexed_mzml = ms.IndexedMzMLFileLoader()
indexed_mzml.load("large_file.mzML")

# Access specific spectrum without loading entire file
spec = indexed_mzml.getSpectrumById(100)
```

### Type Conversion

```python
# Convert peak arrays to numpy
import numpy as np

mz, intensity = spec.get_peaks()
# These are already numpy arrays

# Can perform numpy operations
filtered_mz = mz[intensity > 1000]
```

### Object Copying

```python
# Create deep copy
exp_copy = ms.MSExperiment(exp)

# Modifications to copy don't affect original
```
