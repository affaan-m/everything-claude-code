# Spectroscopy and Analytical Chemistry File Formats Reference

This reference covers file formats used in various spectroscopic techniques and analytical chemistry instrumentation.

## NMR Spectroscopy

### .fid - NMR Free Induction Decay
**Description:** Raw time-domain NMR data from Bruker, Agilent, JEOL
**Typical Data:** Complex time-domain signal
**Use Cases:** NMR spectroscopy, structure elucidation
**Python Libraries:**
- `nmrglue`: `nmrglue.bruker.read_fid('fid')` or `nmrglue.varian.read_fid('fid')`
- `nmrstarlib`: NMR data handling
**EDA Approach:**
- Time-domain signal decay
- Sampling rate and acquisition time
- Number of data points
- Signal-to-noise ratio estimation
- Baseline drift assessment
- Digital filter effects
- Acquisition parameter validation
- Apodization function selection

### .ft / .ft1 / .ft2 - NMR Frequency Domain
**Description:** Fourier-transformed NMR spectrum
**Typical Data:** Processed frequency-domain data
**Use Cases:** NMR analysis, peak integration
**Python Libraries:**
- `nmrglue`: Frequency domain reading
- Custom processing pipelines
**EDA Approach:**
- Peak picking and integration
- Chemical shift range
- Baseline correction quality
- Phase correction assessment
- Reference peak identification
- Spectral resolution
- Artifacts detection
- Multiplicity analysis

### .1r / .2rr - Bruker NMR Processed Data
**Description:** Bruker processed spectrum (real part)
**Typical Data:** 1D or 2D processed NMR spectra
**Use Cases:** NMR data analysis with Bruker software
**Python Libraries:**
- `nmrglue`: Bruker format support
**EDA Approach:**
- Processing parameters review
- Window function effects
- Zero-filling assessment
- Linear prediction validation
- Spectral artifacts

### .dx - NMR JCAMP-DX
**Description:** JCAMP-DX format for NMR
**Typical Data:** Standardized NMR spectrum
**Use Cases:** Data exchange between software
**Python Libraries:**
- `jcamp`: JCAMP reader
- `nmrglue`: Can import JCAMP
**EDA Approach:**
- Format compliance
- Metadata completeness
- Peak table validation
- Integration values
- Compound identification info

### .mnova - Mnova Format
**Description:** Mestrelab Research Mnova format
**Typical Data:** NMR data with processing info
**Use Cases:** Mnova software workflows
**Python Libraries:**
- `nmrglue`: Limited Mnova support
- Conversion tools to standard formats
**EDA Approach:**
- Multi-spectrum handling
- Processing pipeline review
- Quantification data
- Structure assignment

## Mass Spectrometry

### .mzML - Mass Spectrometry Markup Language
**Description:** Standard XML-based MS format
**Typical Data:** MS spectra, chromatograms, metadata
**Use Cases:** Proteomics, metabolomics, lipidomics
**Python Libraries:**
- `pymzml`: `pymzml.run.Reader('file.mzML')`
- `pyteomics.mzml`: `pyteomics.mzml.read('file.mzML')`
- `MSFileReader`: Various wrappers
**EDA Approach:**
- Scan count and MS level distribution
- Retention time range and TIC
- m/z range and resolution
- Precursor ion selection
- Fragmentation patterns
- Instrument configuration
- Quality control metrics
- Data completeness

### .mzXML - Mass Spectrometry XML
**Description:** Legacy XML MS format
**Typical Data:** Mass spectra and chromatograms
**Use Cases:** Proteomics workflows (older)
**Python Libraries:**
- `pyteomics.mzxml`
- `pymzml`: Can read mzXML
**EDA Approach:**
- Similar to mzML
- Version compatibility
- Conversion quality assessment

### .mzData - mzData Format
**Description:** Legacy PSI MS format
**Typical Data:** Mass spectrometry data
**Use Cases:** Legacy data archives
**Python Libraries:**
- `pyteomics`: Limited support
- Conversion to mzML recommended
**EDA Approach:**
- Format conversion validation
- Data completeness
- Metadata extraction

### .raw - Vendor Raw Files (Thermo, Agilent, Bruker)
**Description:** Proprietary instrument data
**Typical Data:** Raw mass spectra and metadata
**Use Cases:** Direct instrument output
**Python Libraries:**
- `pymsfilereader`: Thermo RAW files
- `ThermoRawFileParser`: CLI wrapper
- Vendor-specific APIs
**EDA Approach:**
- Method parameter extraction
- Instrument performance metrics
- Calibration status
- Scan function analysis
- MS/MS quality metrics
- Dynamic exclusion evaluation

### .d - Agilent Data Directory
**Description:** Agilent MS data folder
**Typical Data:** LC-MS, GC-MS with methods
**Use Cases:** Agilent MassHunter workflows
**Python Libraries:**
- Community parsers
- Chemstation integration
**EDA Approach:**
- Directory structure validation
- Method parameters
- Calibration curves
- Sequence metadata
- Signal quality metrics

### .wiff - AB SCIEX Data
**Description:** AB SCIEX/SCIEX instrument format
**Typical Data:** Mass spectrometry data
**Use Cases:** SCIEX instrument workflows
**Python Libraries:**
- Vendor SDKs (limited Python support)
- Conversion tools
**EDA Approach:**
- Experiment type identification
- Scan properties
- Quantitation data
- Multi-experiment structure

### .mgf - Mascot Generic Format
**Description:** Peak list format for MS/MS
**Typical Data:** Precursor and fragment masses
**Use Cases:** Peptide identification, database searches
**Python Libraries:**
- `pyteomics.mgf`: `pyteomics.mgf.read('file.mgf')`
- `pyopenms`: MGF support
**EDA Approach:**
- Spectrum count
- Charge state distribution
- Precursor m/z and intensity
- Fragment peak count
- Mass accuracy
- Title and metadata parsing

### .pkl - Peak List (Binary)
**Description:** Binary peak list format
**Typical Data:** Serialized MS/MS spectra
**Use Cases:** Software-specific storage
**Python Libraries:**
- `pickle`: Standard deserialization
- `pyteomics`: PKL support
**EDA Approach:**
- Data structure inspection
- Conversion to standard formats
- Metadata preservation

### .ms1 / .ms2 - MS1/MS2 Formats
**Description:** Simple text format for MS data
**Typical Data:** MS1 and MS2 scans
**Use Cases:** Database searching, proteomics
**Python Libraries:**
- `pyteomics.ms1` and `ms2`
- Simple text parsing
**EDA Approach:**
- Scan count by level
- Retention time series
- Charge state analysis
- m/z range coverage

### .pepXML - Peptide XML
**Description:** TPP peptide identification format
**Typical Data:** Peptide-spectrum matches
**Use Cases:** Proteomics search results
**Python Libraries:**
- `pyteomics.pepxml`
**EDA Approach:**
- Search result statistics
- Score distribution
- Modification analysis
- FDR assessment
- Enzyme specificity

### .protXML - Protein XML
**Description:** TPP protein inference format
**Typical Data:** Protein identifications
**Use Cases:** Proteomics protein-level results
**Python Libraries:**
- `pyteomics.protxml`
**EDA Approach:**
- Protein group analysis
- Coverage statistics
- Confidence scoring
- Parsimony analysis

### .msp - NIST MS Search Format
**Description:** NIST spectral library format
**Typical Data:** Reference mass spectra
**Use Cases:** Spectral library searching
**Python Libraries:**
- `matchms`: Spectral library handling
- Custom parsers
**EDA Approach:**
- Library size and coverage
- Metadata completeness
- Peak count statistics
- Compound annotation quality

## Infrared and Raman Spectroscopy

### .spc - Galactic SPC
**Description:** Thermo Galactic spectroscopy format
**Typical Data:** IR, Raman, UV-Vis spectra
**Use Cases:** Various spectroscopy instruments
**Python Libraries:**
- `spc`: `spc.File('file.spc')`
- `specio`: Multi-format reader
**EDA Approach:**
- Wavenumber/wavelength range
- Data point density
- Multi-spectrum handling
- Baseline characteristics
- Peak identification
- Absorbance/transmittance mode
- Instrument information

### .spa - Thermo Nicolet
**Description:** Thermo Fisher FTIR format
**Typical Data:** FTIR spectra
**Use Cases:** OMNIC software data
**Python Libraries:**
- Custom binary parsers
- Conversion to JCAMP or SPC
**EDA Approach:**
- Interferogram vs spectrum
- Background spectrum validation
- Atmospheric compensation
- Resolution and scan number
- Sample information

### .0 - Bruker OPUS
**Description:** Bruker OPUS FTIR format (numbered files)
**Typical Data:** FTIR spectra and metadata
**Use Cases:** Bruker FTIR instruments
**Python Libraries:**
- `brukeropusreader`: OPUS format parser
- `specio`: OPUS support
**EDA Approach:**
- Multiple block types (AB, ScSm, etc.)
- Sample and reference spectra
- Instrument parameters
- Optical path configuration
- Beam splitter and detector info

### .dpt - Data Point Table
**Description:** Simple XY data format
**Typical Data:** Generic spectroscopic data
**Use Cases:** Renishaw Raman, generic exports
**Python Libraries:**
- `pandas`: CSV-like reading
- Text parsing
**EDA Approach:**
- X-axis type (wavelength, wavenumber, Raman shift)
- Y-axis units (intensity, absorbance, etc.)
- Data point spacing
- Header information
- Multi-column data handling

### .wdf - Renishaw Raman
**Description:** Renishaw WiRE data format
**Typical Data:** Raman spectra and maps
**Use Cases:** Renishaw Raman microscopy
**Python Libraries:**
- `renishawWiRE`: WDF reader
- Custom parsers for WDF format
**EDA Approach:**
- Spectral vs mapping data
- Laser wavelength
- Accumulation and exposure time
- Spatial coordinates (mapping)
- Z-scan data
- Baseline and cosmic ray correction

### .txt (Spectroscopy)
**Description:** Generic text export from instruments
**Typical Data:** Wavelength/wavenumber and intensity
**Use Cases:** Universal data exchange
**Python Libraries:**
- `pandas`: Text file reading
- `numpy`: Simple array loading
**EDA Approach:**
- Delimiter and format detection
- Header parsing
- Units identification
- Multiple spectrum handling
- Metadata extraction from comments

## UV-Visible Spectroscopy

### .asd / .asc - ASD Binary/ASCII
**Description:** ASD FieldSpec spectroradiometer
**Typical Data:** Hyperspectral UV-Vis-NIR data
**Use Cases:** Remote sensing, reflectance spectroscopy
**Python Libraries:**
- `spectral.io.asd`: ASD format support
- Custom parsers
**EDA Approach:**
- Wavelength range (UV to NIR)
- Reference spectrum validation
- Dark current correction
- Integration time
- GPS metadata (if present)
- Reflectance vs radiance

### .sp - Perkin Elmer
**Description:** Perkin Elmer UV/Vis format
**Typical Data:** UV-Vis spectrophotometer data
**Use Cases:** PE Lambda instruments
**Python Libraries:**
- Custom parsers
- Conversion to standard formats
**EDA Approach:**
- Scan parameters
- Baseline correction
- Multi-wavelength scans
- Time-based measurements
- Sample/reference handling

### .csv (Spectroscopy)
**Description:** CSV export from UV-Vis instruments
**Typical Data:** Wavelength and absorbance/transmittance
**Use Cases:** Universal format for UV-Vis data
**Python Libraries:**
- `pandas`: Native CSV support
**EDA Approach:**
- Lambda max identification
- Beer's law compliance
- Baseline offset
- Path length correction
- Concentration calculations

## X-ray and Diffraction

### .cif - Crystallographic Information File
**Description:** Crystal structure and diffraction data
**Typical Data:** Unit cell, atomic positions, structure factors
**Use Cases:** Crystallography, materials science
**Python Libraries:**
- `gemmi`: `gemmi.cif.read_file('file.cif')`
- `PyCifRW`: CIF reading/writing
- `pymatgen`: Materials structure analysis
**EDA Approach:**
- Crystal system and space group
- Unit cell parameters
- Atomic positions and occupancy
- Thermal parameters
- R-factors and refinement quality
- Completeness and redundancy
- Structure validation

### .hkl - Reflection Data
**Description:** Miller indices and intensities
**Typical Data:** Integrated diffraction intensities
**Use Cases:** Crystallographic refinement
**Python Libraries:**
- Custom parsers (format dependent)
- Crystallography packages (CCP4, etc.)
**EDA Approach:**
- Resolution range
- Completeness by shell
- I/sigma distribution
- Systematic absences
- Twinning detection
- Wilson plot

### .mtz - MTZ Format (CCP4)
**Description:** Binary crystallographic data
**Typical Data:** Reflections, phases, structure factors
**Use Cases:** Macromolecular crystallography
**Python Libraries:**
- `gemmi`: MTZ support
- `cctbx`: Comprehensive crystallography
**EDA Approach:**
- Column types and data
- Resolution limits
- R-factors (Rwork, Rfree)
- Phase probability distribution
- Map coefficients
- Batch information

### .xy / .xye - Powder Diffraction
**Description:** 2-theta vs intensity data
**Typical Data:** Powder X-ray diffraction patterns
**Use Cases:** Phase identification, Rietveld refinement
**Python Libraries:**
- `pandas`: Simple XY reading
- `pymatgen`: XRD pattern analysis
**EDA Approach:**
- 2-theta range
- Peak positions and intensities
- Background modeling
- Peak width analysis (strain/size)
- Phase identification via matching
- Preferred orientation effects

### .raw (XRD)
**Description:** Vendor-specific XRD raw data
**Typical Data:** XRD patterns with metadata
**Use Cases:** Bruker, PANalytical, Rigaku instruments
**Python Libraries:**
- Vendor-specific parsers
- Conversion tools
**EDA Approach:**
- Scan parameters (step size, time)
- Sample alignment
- Incident beam setup
- Detector configuration
- Background scan validation

### .gsa / .gsas - GSAS Format
**Description:** General Structure Analysis System
**Typical Data:** Powder diffraction for Rietveld
**Use Cases:** Rietveld refinement
**Python Libraries:**
- GSAS-II Python interface
- Custom parsers
**EDA Approach:**
- Histogram data
- Instrument parameters
- Phase information
- Refinement constraints
- Profile function parameters

## Electron Spectroscopy

### .vms - VG Scienta
**Description:** VG Scienta spectrometer format
**Typical Data:** XPS, UPS, ARPES spectra
**Use Cases:** Photoelectron spectroscopy
**Python Libraries:**
- Custom parsers for VMS
- `specio`: Multi-format support
**EDA Approach:**
- Binding energy calibration
- Pass energy and resolution
- Photoelectron line identification
- Satellite peak analysis
- Background subtraction quality
- Fermi edge position

### .spe - WinSpec/SPE Format
**Description:** Princeton Instruments/Roper Scientific
**Typical Data:** CCD spectra, Raman, PL
**Use Cases:** Spectroscopy with CCD detectors
**Python Libraries:**
- `spe2py`: SPE file reader
- `spe_loader`: Alternative parser
**EDA Approach:**
- CCD frame analysis
- Wavelength calibration
- Dark frame subtraction
- Cosmic ray identification
- Readout noise
- Accumulation statistics

### .pxt - Princeton PTI
**Description:** Photon Technology International
**Typical Data:** Fluorescence, phosphorescence spectra
**Use Cases:** Fluorescence spectroscopy
**Python Libraries:**
- Custom parsers
- Text-based format variants
**EDA Approach:**
- Excitation and emission spectra
- Quantum yield calculations
- Time-resolved measurements
- Temperature-dependent data
- Correction factors applied

### .dat (Spectroscopy Generic)
**Description:** Generic binary or text spectroscopy data
**Typical Data:** Various spectroscopic measurements
**Use Cases:** Many instruments use .dat extension
**Python Libraries:**
- Format-specific identification needed
- `numpy`, `pandas` for known formats
**EDA Approach:**
- Format detection (binary vs text)
- Header identification
- Data structure inference
- Units and axis labels
- Instrument signature detection

## Chromatography

### .chrom - Chromatogram Data
**Description:** Generic chromatography format
**Typical Data:** Retention time vs signal
**Use Cases:** HPLC, GC, LC-MS
**Python Libraries:**
- Vendor-specific parsers
- `pandas` for text exports
**EDA Approach:**
- Retention time range
- Peak detection and integration
- Baseline drift
- Resolution between peaks
- Signal-to-noise ratio
- Tailing factor

### .ch - ChemStation
**Description:** Agilent ChemStation format
**Typical Data:** Chromatograms and method parameters
**Use Cases:** Agilent HPLC and GC systems
**Python Libraries:**
- `agilent-chemstation`: Community tools
- Binary format parsers
**EDA Approach:**
- Method validation
- Integration parameters
- Calibration curve
- Sample sequence information
- Instrument status

### .arw - Empower (Waters)
**Description:** Waters Empower format
**Typical Data:** UPLC/HPLC chromatograms
**Use Cases:** Waters instrument data
**Python Libraries:**
- Vendor tools (limited Python access)
- Database extraction tools
**EDA Approach:**
- Audit trail information
- Processing methods
- Compound identification
- Quantitation results
- System suitability tests

### .lcd - Shimadzu LabSolutions
**Description:** Shimadzu chromatography format
**Typical Data:** GC/HPLC data
**Use Cases:** Shimadzu instruments
**Python Libraries:**
- Vendor-specific parsers
**EDA Approach:**
- Method parameters
- Peak purity analysis
- Spectral data (if PDA)
- Quantitative results

## Other Analytical Techniques

### .dta - DSC/TGA Data
**Description:** Thermal analysis data (TA Instruments)
**Typical Data:** Temperature vs heat flow or mass
**Use Cases:** Differential scanning calorimetry, thermogravimetry
**Python Libraries:**
- Custom parsers for TA formats
- `pandas` for exported data
**EDA Approach:**
- Transition temperature identification
- Enthalpy calculations
- Mass loss steps
- Heating rate effects
- Baseline determination
- Purity assessment

### .run - ICP-MS/ICP-OES
**Description:** Elemental analysis data
**Typical Data:** Element concentrations or counts
**Use Cases:** Inductively coupled plasma MS/OES
**Python Libraries:**
- Vendor-specific tools
- Custom parsers
**EDA Approach:**
- Element detection and quantitation
- Internal standard performance
- Spike recovery
- Dilution factor corrections
- Isotope ratios
- LOD/LOQ calculations

### .exp - Electrochemistry Data
**Description:** Electrochemical experiment data
**Typical Data:** Potential vs current or charge
**Use Cases:** Cyclic voltammetry, chronoamperometry
**Python Libraries:**
- Custom parsers per instrument (CHI, Gamry, etc.)
- `galvani`: Biologic EC-Lab files
**EDA Approach:**
- Redox peak identification
- Peak potential and current
- Scan rate effects
- Electron transfer kinetics
- Background subtraction
- Capacitance calculations
