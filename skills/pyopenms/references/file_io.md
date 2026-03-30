# File I/O and Data Formats

## Overview

PyOpenMS supports multiple mass spectrometry file formats for reading and writing. This guide covers file handling strategies and format-specific operations.

## Supported Formats

### Spectrum Data Formats

- **mzML**: Standard XML-based format for mass spectrometry data
- **mzXML**: Earlier XML-based format
- **mzData**: XML format (deprecated but supported)

### Identification Formats

- **idXML**: OpenMS native identification format
- **mzIdentML**: Standard XML format for identification data
- **pepXML**: X! Tandem format
- **protXML**: Protein identification format

### Feature and Quantitation Formats

- **featureXML**: OpenMS format for detected features
- **consensusXML**: Format for consensus features across samples
- **mzTab**: Tab-delimited format for reporting

### Sequence and Library Formats

- **FASTA**: Protein/peptide sequences
- **TraML**: Transition lists for targeted experiments

## Reading mzML Files

### In-Memory Loading

Load entire file into memory (suitable for smaller files):

```python
import pyopenms as ms

# Create experiment container
exp = ms.MSExperiment()

# Load file
ms.MzMLFile().load("sample.mzML", exp)

# Access data
print(f"Spectra: {exp.getNrSpectra()}")
print(f"Chromatograms: {exp.getNrChromatograms()}")
```

### Indexed Access

Efficient random access for large files:

```python
# Create indexed access
indexed_mzml = ms.IndexedMzMLFileLoader()
indexed_mzml.load("large_file.mzML")

# Get specific spectrum by index
spec = indexed_mzml.getSpectrumById(100)

# Access by native ID
spec = indexed_mzml.getSpectrumByNativeId("scan=5000")
```

### Streaming Access

Memory-efficient processing for very large files:

```python
# Define consumer function
class SpectrumProcessor(ms.MSExperimentConsumer):
    def __init__(self):
        super().__init__()
        self.count = 0

    def consumeSpectrum(self, spec):
        # Process spectrum
        if spec.getMSLevel() == 2:
            self.count += 1

# Stream file
consumer = SpectrumProcessor()
ms.MzMLFile().transform("large.mzML", consumer)
print(f"Processed {consumer.count} MS2 spectra")
```

### Cached Access

Balance between memory usage and speed:

```python
# Use on-disk caching
options = ms.CachedmzML()
options.setMetaDataOnly(False)

exp = ms.MSExperiment()
ms.CachedmzMLHandler().load("sample.mzML", exp, options)
```

## Writing mzML Files

### Basic Writing

```python
# Create or modify experiment
exp = ms.MSExperiment()
# ... add spectra ...

# Write to file
ms.MzMLFile().store("output.mzML", exp)
```

### Compression Options

```python
# Configure compression
file_handler = ms.MzMLFile()

options = ms.PeakFileOptions()
options.setCompression(True)  # Enable compression
file_handler.setOptions(options)

file_handler.store("compressed.mzML", exp)
```

## Reading Identification Data

### idXML Format

```python
# Load identification results
protein_ids = []
peptide_ids = []

ms.IdXMLFile().load("identifications.idXML", protein_ids, peptide_ids)

# Access peptide identifications
for peptide_id in peptide_ids:
    print(f"RT: {peptide_id.getRT()}")
    print(f"MZ: {peptide_id.getMZ()}")

    # Get peptide hits
    for hit in peptide_id.getHits():
        print(f"  Sequence: {hit.getSequence().toString()}")
        print(f"  Score: {hit.getScore()}")
        print(f"  Charge: {hit.getCharge()}")
```

### mzIdentML Format

```python
# Read mzIdentML
protein_ids = []
peptide_ids = []

ms.MzIdentMLFile().load("results.mzid", protein_ids, peptide_ids)
```

### pepXML Format

```python
# Load pepXML
protein_ids = []
peptide_ids = []

ms.PepXMLFile().load("results.pep.xml", protein_ids, peptide_ids)
```

## Reading Feature Data

### featureXML

```python
# Load features
feature_map = ms.FeatureMap()
ms.FeatureXMLFile().load("features.featureXML", feature_map)

# Access features
for feature in feature_map:
    print(f"RT: {feature.getRT()}")
    print(f"MZ: {feature.getMZ()}")
    print(f"Intensity: {feature.getIntensity()}")
    print(f"Quality: {feature.getOverallQuality()}")
```

### consensusXML

```python
# Load consensus features
consensus_map = ms.ConsensusMap()
ms.ConsensusXMLFile().load("consensus.consensusXML", consensus_map)

# Access consensus features
for consensus_feature in consensus_map:
    print(f"RT: {consensus_feature.getRT()}")
    print(f"MZ: {consensus_feature.getMZ()}")

    # Get feature handles (sub-features from different maps)
    for handle in consensus_feature.getFeatureList():
        map_index = handle.getMapIndex()
        intensity = handle.getIntensity()
        print(f"  Map {map_index}: {intensity}")
```

## Reading FASTA Files

```python
# Load protein sequences
fasta_entries = []
ms.FASTAFile().load("database.fasta", fasta_entries)

for entry in fasta_entries:
    print(f"Identifier: {entry.identifier}")
    print(f"Description: {entry.description}")
    print(f"Sequence: {entry.sequence}")
```

## Reading TraML Files

```python
# Load transition lists for targeted experiments
targeted_exp = ms.TargetedExperiment()
ms.TraMLFile().load("transitions.TraML", targeted_exp)

# Access transitions
for transition in targeted_exp.getTransitions():
    print(f"Precursor MZ: {transition.getPrecursorMZ()}")
    print(f"Product MZ: {transition.getProductMZ()}")
```

## Writing mzTab Files

```python
# Create mzTab for reporting
mztab = ms.MzTab()

# Add metadata
metadata = mztab.getMetaData()
metadata.mz_tab_version.set("1.0.0")
metadata.title.set("Proteomics Analysis Results")

# Add protein data
protein_section = mztab.getProteinSectionRows()
# ... populate protein data ...

# Write to file
ms.MzTabFile().store("report.mzTab", mztab)
```

## Format Conversion

### mzXML to mzML

```python
# Read mzXML
exp = ms.MSExperiment()
ms.MzXMLFile().load("data.mzXML", exp)

# Write as mzML
ms.MzMLFile().store("data.mzML", exp)
```

### Extract Chromatograms from mzML

```python
# Load experiment
exp = ms.MSExperiment()
ms.MzMLFile().load("data.mzML", exp)

# Extract specific chromatogram
for chrom in exp.getChromatograms():
    if chrom.getNativeID() == "TIC":
        rt, intensity = chrom.get_peaks()
        print(f"TIC has {len(rt)} data points")
```

## File Metadata

### Access mzML Metadata

```python
# Load file
exp = ms.MSExperiment()
ms.MzMLFile().load("sample.mzML", exp)

# Get experimental settings
exp_settings = exp.getExperimentalSettings()

# Instrument info
instrument = exp_settings.getInstrument()
print(f"Instrument: {instrument.getName()}")
print(f"Model: {instrument.getModel()}")

# Sample info
sample = exp_settings.getSample()
print(f"Sample name: {sample.getName()}")

# Source files
for source_file in exp_settings.getSourceFiles():
    print(f"Source: {source_file.getNameOfFile()}")
```

## Best Practices

### Memory Management

For large files:
1. Use indexed or streaming access instead of full in-memory loading
2. Process data in chunks
3. Clear data structures when no longer needed

```python
# Good for large files
indexed_mzml = ms.IndexedMzMLFileLoader()
indexed_mzml.load("huge_file.mzML")

# Process spectra one at a time
for i in range(indexed_mzml.getNrSpectra()):
    spec = indexed_mzml.getSpectrumById(i)
    # Process spectrum
    # Spectrum automatically cleaned up after processing
```

### Error Handling

```python
try:
    exp = ms.MSExperiment()
    ms.MzMLFile().load("data.mzML", exp)
except Exception as e:
    print(f"Failed to load file: {e}")
```

### File Validation

```python
# Check if file exists and is readable
import os

if os.path.exists("data.mzML") and os.path.isfile("data.mzML"):
    exp = ms.MSExperiment()
    ms.MzMLFile().load("data.mzML", exp)
else:
    print("File not found")
```
