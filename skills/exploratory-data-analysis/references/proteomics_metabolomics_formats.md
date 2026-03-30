# Proteomics and Metabolomics File Formats Reference

This reference covers file formats specific to proteomics, metabolomics, lipidomics, and related omics workflows.

## Mass Spectrometry-Based Proteomics

### .mzML - Mass Spectrometry Markup Language
**Description:** Standard XML format for MS data
**Typical Data:** MS1 and MS2 spectra, retention times, intensities
**Use Cases:** Proteomics, metabolomics pipelines
**Python Libraries:**
- `pymzml`: `pymzml.run.Reader('file.mzML')`
- `pyteomics.mzml`: `pyteomics.mzml.read('file.mzML')`
- `pyopenms`: OpenMS Python bindings
**EDA Approach:**
- Scan count and MS level distribution
- Total ion chromatogram (TIC) analysis
- Base peak chromatogram (BPC)
- m/z coverage and resolution
- Retention time range
- Precursor selection patterns
- Data completeness
- Quality control metrics (lock mass, standards)

### .mzXML - Legacy MS XML Format
**Description:** Older XML-based MS format
**Typical Data:** Mass spectra with metadata
**Use Cases:** Legacy proteomics data
**Python Libraries:**
- `pyteomics.mzxml`
- `pymzml`: Can read mzXML
**EDA Approach:**
- Similar to mzML
- Format version compatibility
- Conversion quality validation
- Metadata preservation check

### .mzIdentML - Peptide Identification Format
**Description:** PSI standard for peptide identifications
**Typical Data:** Peptide-spectrum matches, proteins, scores
**Use Cases:** Search engine results, proteomics workflows
**Python Libraries:**
- `pyteomics.mzid`
- `pyopenms`: MzIdentML support
**EDA Approach:**
- PSM count and score distribution
- FDR calculation and filtering
- Modification analysis
- Missed cleavage statistics
- Protein inference results
- Search parameters validation
- Decoy hit analysis
- Rank-1 vs lower ranks

### .pepXML - Trans-Proteomic Pipeline Peptide XML
**Description:** TPP format for peptide identifications
**Typical Data:** Search results with statistical validation
**Use Cases:** Proteomics database search output
**Python Libraries:**
- `pyteomics.pepxml`
**EDA Approach:**
- Search engine comparison
- Score distributions (XCorr, expect value, etc.)
- Charge state analysis
- Modification frequencies
- PeptideProphet probabilities
- Protein coverage
- Spectral counting

### .protXML - Protein Inference Results
**Description:** TPP protein-level identifications
**Typical Data:** Protein groups, probabilities, peptides
**Use Cases:** Protein-level analysis
**Python Libraries:**
- `pyteomics.protxml`
**EDA Approach:**
- Protein group statistics
- Parsimonious protein sets
- ProteinProphet probabilities
- Coverage and peptide count per protein
- Unique vs shared peptides
- Protein molecular weight distribution
- GO term enrichment preparation

### .pride.xml - PRIDE XML Format
**Description:** Proteomics Identifications Database format
**Typical Data:** Complete proteomics experiment data
**Use Cases:** Public data deposition (legacy)
**Python Libraries:**
- `pyteomics.pride`
- Custom XML parsers
**EDA Approach:**
- Experiment metadata extraction
- Identification completeness
- Cross-linking to spectra
- Protocol information
- Instrument details

### .tsv / .csv (Proteomics)
**Description:** Tab or comma-separated proteomics results
**Typical Data:** Peptide or protein quantification tables
**Use Cases:** MaxQuant, Proteome Discoverer, Skyline output
**Python Libraries:**
- `pandas`: `pd.read_csv()` or `pd.read_table()`
**EDA Approach:**
- Identification counts
- Quantitative value distributions
- Missing value patterns
- Intensity-based analysis
- Label-free quantification assessment
- Isobaric tag ratio analysis
- Coefficient of variation
- Batch effects

### .msf - Thermo MSF Database
**Description:** Proteome Discoverer results database
**Typical Data:** SQLite database with search results
**Use Cases:** Thermo Proteome Discoverer workflows
**Python Libraries:**
- `sqlite3`: Database access
- Custom MSF parsers
**EDA Approach:**
- Database schema exploration
- Peptide and protein tables
- Score thresholds
- Quantification data
- Processing node information
- Confidence levels

### .pdResult - Proteome Discoverer Result
**Description:** Proteome Discoverer study results
**Typical Data:** Comprehensive search and quantification
**Use Cases:** PD study exports
**Python Libraries:**
- Vendor tools for conversion
- Export to TSV for Python analysis
**EDA Approach:**
- Study design validation
- Result filtering criteria
- Quantitative comparison groups
- Imputation strategies

### .pep.xml - Peptide Summary
**Description:** Compact peptide identification format
**Typical Data:** Peptide sequences, modifications, scores
**Use Cases:** Downstream analysis input
**Python Libraries:**
- `pyteomics`: XML parsing
**EDA Approach:**
- Unique peptide counting
- PTM site localization
- Retention time predictability
- Charge state preferences

## Quantitative Proteomics

### .sky - Skyline Document
**Description:** Skyline targeted proteomics document
**Typical Data:** Transition lists, chromatograms, results
**Use Cases:** Targeted proteomics (SRM/MRM/PRM)
**Python Libraries:**
- `skyline`: Python API (limited)
- Export to CSV for analysis
**EDA Approach:**
- Transition selection validation
- Chromatographic peak quality
- Interference detection
- Retention time consistency
- Calibration curve assessment
- Replicate correlation
- LOD/LOQ determination

### .sky.zip - Zipped Skyline Document
**Description:** Skyline document with external files
**Typical Data:** Complete Skyline analysis
**Use Cases:** Sharing Skyline projects
**Python Libraries:**
- `zipfile`: Extract for processing
**EDA Approach:**
- Document structure
- External file references
- Result export and analysis

### .wiff - SCIEX WIFF Format
**Description:** SCIEX instrument data with quantitation
**Typical Data:** LC-MS/MS with MRM transitions
**Use Cases:** SCIEX QTRAP, TripleTOF data
**Python Libraries:**
- Vendor tools (limited Python access)
- Conversion to mzML
**EDA Approach:**
- MRM transition performance
- Dwell time optimization
- Cycle time analysis
- Peak integration quality

### .raw (Thermo)
**Description:** Thermo raw instrument file
**Typical Data:** Full MS data from Orbitrap, Q Exactive
**Use Cases:** Label-free and TMT quantification
**Python Libraries:**
- `pymsfilereader`: Thermo RawFileReader
- `ThermoRawFileParser`: Cross-platform CLI
**EDA Approach:**
- MS1 and MS2 acquisition rates
- AGC target and fill times
- Resolution settings
- Isolation window validation
- SPS ion selection (TMT)
- Contamination assessment

### .d (Agilent)
**Description:** Agilent data directory
**Typical Data:** LC-MS and GC-MS data
**Use Cases:** Agilent instrument workflows
**Python Libraries:**
- Community parsers
- Export to mzML
**EDA Approach:**
- Method consistency
- Calibration status
- Sequence run information
- Retention time stability

## Metabolomics and Lipidomics

### .mzML (Metabolomics)
**Description:** Standard MS format for metabolomics
**Typical Data:** Full scan MS, targeted MS/MS
**Use Cases:** Untargeted and targeted metabolomics
**Python Libraries:**
- Same as proteomics mzML tools
**EDA Approach:**
- Feature detection quality
- Mass accuracy assessment
- Retention time alignment
- Blank subtraction
- QC sample consistency
- Isotope pattern validation
- Adduct formation analysis
- In-source fragmentation check

### .cdf / .netCDF - ANDI-MS
**Description:** Analytical Data Interchange for MS
**Typical Data:** GC-MS, LC-MS chromatography data
**Use Cases:** Metabolomics, GC-MS workflows
**Python Libraries:**
- `netCDF4`: Low-level access
- `pyopenms`: CDF support
- `xcms` via R integration
**EDA Approach:**
- TIC and extracted ion chromatograms
- Peak detection across samples
- Retention index calculation
- Mass spectral matching
- Library search preparation

### .msp - Mass Spectral Format (NIST)
**Description:** NIST spectral library format
**Typical Data:** Reference mass spectra
**Use Cases:** Metabolite identification, library matching
**Python Libraries:**
- `matchms`: Spectral matching
- Custom MSP parsers
**EDA Approach:**
- Library coverage
- Metadata completeness (InChI, SMILES)
- Spectral quality metrics
- Collision energy standardization
- Precursor type annotation

### .mgf (Metabolomics)
**Description:** Mascot Generic Format for MS/MS
**Typical Data:** MS/MS spectra for metabolite ID
**Use Cases:** Spectral library searching
**Python Libraries:**
- `matchms`: Metabolomics spectral analysis
- `pyteomics.mgf`
**EDA Approach:**
- Spectrum quality filtering
- Precursor isolation purity
- Fragment m/z accuracy
- Neutral loss patterns
- MS/MS completeness

### .nmrML - NMR Markup Language
**Description:** Standard XML format for NMR metabolomics
**Typical Data:** 1D/2D NMR spectra with metadata
**Use Cases:** NMR-based metabolomics
**Python Libraries:**
- `nmrml2isa`: Format conversion
- Custom XML parsers
**EDA Approach:**
- Spectral quality metrics
- Binning consistency
- Reference compound validation
- pH and temperature effects
- Metabolite identification confidence

### .json (Metabolomics)
**Description:** JSON format for metabolomics results
**Typical Data:** Feature tables, annotations, metadata
**Use Cases:** GNPS, MetaboAnalyst, web tools
**Python Libraries:**
- `json`: Standard library
- `pandas`: JSON normalization
**EDA Approach:**
- Feature annotation coverage
- GNPS clustering results
- Molecular networking statistics
- Adduct and in-source fragment linkage
- Putative identification confidence

### .txt (Metabolomics Tables)
**Description:** Tab-delimited feature tables
**Typical Data:** m/z, RT, intensities across samples
**Use Cases:** MZmine, XCMS, MS-DIAL output
**Python Libraries:**
- `pandas`: Text file reading
**EDA Approach:**
- Feature count and quality
- Missing value imputation
- Data normalization assessment
- Batch correction validation
- PCA and clustering for QC
- Fold change calculations
- Statistical test preparation

### .featureXML - OpenMS Feature Format
**Description:** OpenMS detected features
**Typical Data:** LC-MS features with quality scores
**Use Cases:** OpenMS workflows
**Python Libraries:**
- `pyopenms`: FeatureXML support
**EDA Approach:**
- Feature detection parameters
- Quality metrics per feature
- Isotope pattern fitting
- Charge state assignment
- FWHM and asymmetry

### .consensusXML - OpenMS Consensus Features
**Description:** Linked features across samples
**Typical Data:** Aligned features with group info
**Use Cases:** Multi-sample LC-MS analysis
**Python Libraries:**
- `pyopenms`: ConsensusXML reading
**EDA Approach:**
- Feature correspondence quality
- Retention time alignment
- Missing value patterns
- Intensity normalization needs
- Batch-wise feature agreement

### .idXML - OpenMS Identification Format
**Description:** Peptide/metabolite identifications
**Typical Data:** MS/MS identifications with scores
**Use Cases:** OpenMS ID workflows
**Python Libraries:**
- `pyopenms`: IdXML support
**EDA Approach:**
- Identification rate
- Score distribution
- Spectral match quality
- False discovery assessment
- Annotation transfer validation

## Lipidomics-Specific Formats

### .lcb - LipidCreator Batch
**Description:** LipidCreator transition list
**Typical Data:** Lipid transitions for targeted MS
**Use Cases:** Targeted lipidomics
**Python Libraries:**
- Export to CSV for processing
**EDA Approach:**
- Transition coverage per lipid class
- Retention time prediction
- Collision energy optimization
- Class-specific fragmentation patterns

### .mzTab - Proteomics/Metabolomics Tabular Format
**Description:** PSI tabular summary format
**Typical Data:** Protein/peptide/metabolite quantification
**Use Cases:** Publication and data sharing
**Python Libraries:**
- `pyteomics.mztab`
- `pandas` for TSV-like structure
**EDA Approach:**
- Data completeness
- Metadata section validation
- Quantification method
- Identification confidence
- Software and parameters
- Quality metrics summary

### .csv (LipidSearch, LipidMatch)
**Description:** Lipid identification results
**Typical Data:** Lipid annotations, grades, intensities
**Use Cases:** Lipidomics software output
**Python Libraries:**
- `pandas`: CSV reading
**EDA Approach:**
- Lipid class distribution
- Identification grade/confidence
- Fatty acid composition analysis
- Double bond and chain length patterns
- Intensity correlations
- Normalization to internal standards

### .sdf (Metabolomics)
**Description:** Structure data file for metabolites
**Typical Data:** Chemical structures with properties
**Use Cases:** Metabolite database creation
**Python Libraries:**
- `RDKit`: `Chem.SDMolSupplier('file.sdf')`
**EDA Approach:**
- Structure validation
- Property calculation (logP, MW, TPSA)
- Molecular formula consistency
- Tautomer enumeration
- Retention time prediction features

### .mol (Metabolomics)
**Description:** Single molecule structure files
**Typical Data:** Metabolite chemical structure
**Use Cases:** Structure-based searches
**Python Libraries:**
- `RDKit`: `Chem.MolFromMolFile('file.mol')`
**EDA Approach:**
- Structure correctness
- Stereochemistry validation
- Charge state
- Implicit hydrogen handling

## Data Processing and Analysis

### .h5 / .hdf5 (Omics)
**Description:** HDF5 for large omics datasets
**Typical Data:** Feature matrices, spectra, metadata
**Use Cases:** Large-scale studies, cloud computing
**Python Libraries:**
- `h5py`: HDF5 access
- `anndata`: For single-cell proteomics
**EDA Approach:**
- Dataset organization
- Chunking and compression
- Metadata structure
- Efficient data access patterns
- Sample and feature annotations

### .Rdata / .rds - R Objects
**Description:** Serialized R analysis objects
**Typical Data:** Processed omics results from R packages
**Use Cases:** xcms, CAMERA, MSnbase workflows
**Python Libraries:**
- `pyreadr`: `pyreadr.read_r('file.Rdata')`
- `rpy2`: R-Python integration
**EDA Approach:**
- Object structure exploration
- Data extraction
- Method parameter review
- Conversion to Python-native formats

### .mzTab-M - Metabolomics mzTab
**Description:** mzTab specific to metabolomics
**Typical Data:** Small molecule quantification
**Use Cases:** Metabolomics data sharing
**Python Libraries:**
- `pyteomics.mztab`: Can parse mzTab-M
**EDA Approach:**
- Small molecule evidence
- Feature quantification
- Database references (HMDB, KEGG, etc.)
- Adduct and charge annotation
- MS level information

### .parquet (Omics)
**Description:** Columnar storage for large tables
**Typical Data:** Feature matrices, metadata
**Use Cases:** Efficient big data omics
**Python Libraries:**
- `pandas`: `pd.read_parquet()`
- `pyarrow`: Direct parquet access
**EDA Approach:**
- Compression efficiency
- Column-wise statistics
- Partition structure
- Schema validation
- Fast filtering and aggregation

### .pkl (Omics Models)
**Description:** Pickled Python objects
**Typical Data:** ML models, processed data
**Use Cases:** Workflow intermediate storage
**Python Libraries:**
- `pickle`: Standard serialization
- `joblib`: Enhanced pickling
**EDA Approach:**
- Object type and structure
- Model parameters
- Feature importance (if ML model)
- Data shapes and types
- Deserialization validation

### .zarr (Omics)
**Description:** Chunked, compressed array storage
**Typical Data:** Multi-dimensional omics data
**Use Cases:** Cloud-optimized analysis
**Python Libraries:**
- `zarr`: Array storage
**EDA Approach:**
- Chunk optimization
- Compression codecs
- Multi-scale data
- Parallel access patterns
- Metadata annotations
