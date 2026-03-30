# Chemistry and Molecular File Formats Reference

This reference covers file formats commonly used in computational chemistry, cheminformatics, molecular modeling, and related fields.

## Structure File Formats

### .pdb - Protein Data Bank
**Description:** Standard format for 3D structures of biological macromolecules
**Typical Data:** Atomic coordinates, residue information, secondary structure, crystal structure data
**Use Cases:** Protein structure analysis, molecular visualization, docking studies
**Python Libraries:**
- `Biopython`: `Bio.PDB`
- `MDAnalysis`: `MDAnalysis.Universe('file.pdb')`
- `PyMOL`: `pymol.cmd.load('file.pdb')`
- `ProDy`: `prody.parsePDB('file.pdb')`
**EDA Approach:**
- Structure validation (bond lengths, angles, clashes)
- Secondary structure analysis
- B-factor distribution
- Missing residues/atoms detection
- Ramachandran plots for validation
- Surface area and volume calculations

### .cif - Crystallographic Information File
**Description:** Structured data format for crystallographic information
**Typical Data:** Unit cell parameters, atomic coordinates, symmetry operations, experimental data
**Use Cases:** Crystal structure determination, structural biology, materials science
**Python Libraries:**
- `gemmi`: `gemmi.cif.read_file('file.cif')`
- `PyCifRW`: `CifFile.ReadCif('file.cif')`
- `Biopython`: `Bio.PDB.MMCIFParser()`
**EDA Approach:**
- Data completeness check
- Resolution and quality metrics
- Unit cell parameter analysis
- Symmetry group validation
- Atomic displacement parameters
- R-factors and validation metrics

### .mol - MDL Molfile
**Description:** Chemical structure file format by MDL/Accelrys
**Typical Data:** 2D/3D coordinates, atom types, bond orders, charges
**Use Cases:** Chemical database storage, cheminformatics, drug design
**Python Libraries:**
- `RDKit`: `Chem.MolFromMolFile('file.mol')`
- `Open Babel`: `pybel.readfile('mol', 'file.mol')`
- `ChemoPy`: For descriptor calculation
**EDA Approach:**
- Molecular property calculation (MW, logP, TPSA)
- Functional group analysis
- Ring system detection
- Stereochemistry validation
- 2D/3D coordinate consistency
- Valence and charge validation

### .mol2 - Tripos Mol2
**Description:** Complete 3D molecular structure format with atom typing
**Typical Data:** Coordinates, SYBYL atom types, bond types, charges, substructures
**Use Cases:** Molecular docking, QSAR studies, drug discovery
**Python Libraries:**
- `RDKit`: `Chem.MolFromMol2File('file.mol2')`
- `Open Babel`: `pybel.readfile('mol2', 'file.mol2')`
- `MDAnalysis`: Can parse mol2 topology
**EDA Approach:**
- Atom type distribution
- Partial charge analysis
- Bond type statistics
- Substructure identification
- Conformational analysis
- Energy minimization status check

### .sdf - Structure Data File
**Description:** Multi-structure file format with associated data
**Typical Data:** Multiple molecular structures with properties/annotations
**Use Cases:** Chemical databases, virtual screening, compound libraries
**Python Libraries:**
- `RDKit`: `Chem.SDMolSupplier('file.sdf')`
- `Open Babel`: `pybel.readfile('sdf', 'file.sdf')`
- `PandasTools` (RDKit): For DataFrame integration
**EDA Approach:**
- Dataset size and diversity metrics
- Property distribution analysis (MW, logP, etc.)
- Structural diversity (Tanimoto similarity)
- Missing data assessment
- Outlier detection in properties
- Scaffold analysis

### .xyz - XYZ Coordinates
**Description:** Simple Cartesian coordinate format
**Typical Data:** Atom types and 3D coordinates
**Use Cases:** Quantum chemistry, geometry optimization, molecular dynamics
**Python Libraries:**
- `ASE`: `ase.io.read('file.xyz')`
- `Open Babel`: `pybel.readfile('xyz', 'file.xyz')`
- `cclib`: For parsing QM outputs with xyz
**EDA Approach:**
- Geometry analysis (bond lengths, angles, dihedrals)
- Center of mass calculation
- Moment of inertia
- Molecular size metrics
- Coordinate validation
- Symmetry detection

### .smi / .smiles - SMILES String
**Description:** Line notation for chemical structures
**Typical Data:** Text representation of molecular structure
**Use Cases:** Chemical databases, literature mining, data exchange
**Python Libraries:**
- `RDKit`: `Chem.MolFromSmiles(smiles)`
- `Open Babel`: Can parse SMILES
- `DeepChem`: For ML on SMILES
**EDA Approach:**
- SMILES syntax validation
- Descriptor calculation from SMILES
- Fingerprint generation
- Substructure searching
- Tautomer enumeration
- Stereoisomer handling

### .pdbqt - AutoDock PDBQT
**Description:** Modified PDB format for AutoDock docking
**Typical Data:** Coordinates, partial charges, atom types for docking
**Use Cases:** Molecular docking, virtual screening
**Python Libraries:**
- `Meeko`: For PDBQT preparation
- `Open Babel`: Can read PDBQT
- `ProDy`: Limited PDBQT support
**EDA Approach:**
- Charge distribution analysis
- Rotatable bond identification
- Atom type validation
- Coordinate quality check
- Hydrogen placement validation
- Torsion definition analysis

### .mae - Maestro Format
**Description:** Schrödinger's proprietary molecular structure format
**Typical Data:** Structures, properties, annotations from Schrödinger suite
**Use Cases:** Drug discovery, molecular modeling with Schrödinger tools
**Python Libraries:**
- `schrodinger.structure`: Requires Schrödinger installation
- Custom parsers for basic reading
**EDA Approach:**
- Property extraction and analysis
- Structure quality metrics
- Conformer analysis
- Docking score distributions
- Ligand efficiency metrics

### .gro - GROMACS Coordinate File
**Description:** Molecular structure file for GROMACS MD simulations
**Typical Data:** Atom positions, velocities, box vectors
**Use Cases:** Molecular dynamics simulations, GROMACS workflows
**Python Libraries:**
- `MDAnalysis`: `Universe('file.gro')`
- `MDTraj`: `mdtraj.load_gro('file.gro')`
- `GromacsWrapper`: For GROMACS integration
**EDA Approach:**
- System composition analysis
- Box dimension validation
- Atom position distribution
- Velocity distribution (if present)
- Density calculation
- Solvation analysis

## Computational Chemistry Output Formats

### .log - Gaussian Log File
**Description:** Output from Gaussian quantum chemistry calculations
**Typical Data:** Energies, geometries, frequencies, orbitals, populations
**Use Cases:** QM calculations, geometry optimization, frequency analysis
**Python Libraries:**
- `cclib`: `cclib.io.ccread('file.log')`
- `GaussianRunPack`: For Gaussian workflows
- Custom parsers with regex
**EDA Approach:**
- Convergence analysis
- Energy profile extraction
- Vibrational frequency analysis
- Orbital energy levels
- Population analysis (Mulliken, NBO)
- Thermochemistry data extraction

### .out - Quantum Chemistry Output
**Description:** Generic output file from various QM packages
**Typical Data:** Calculation results, energies, properties
**Use Cases:** QM calculations across different software
**Python Libraries:**
- `cclib`: Universal parser for QM outputs
- `ASE`: Can read some output formats
**EDA Approach:**
- Software-specific parsing
- Convergence criteria check
- Energy and gradient trends
- Basis set and method validation
- Computational cost analysis

### .wfn / .wfx - Wavefunction Files
**Description:** Wavefunction data for quantum chemical analysis
**Typical Data:** Molecular orbitals, basis sets, density matrices
**Use Cases:** Electron density analysis, QTAIM analysis
**Python Libraries:**
- `Multiwfn`: Interface via Python
- `Horton`: For wavefunction analysis
- Custom parsers for specific formats
**EDA Approach:**
- Orbital population analysis
- Electron density distribution
- Critical point analysis (QTAIM)
- Molecular orbital visualization
- Bonding analysis

### .fchk - Gaussian Formatted Checkpoint
**Description:** Formatted checkpoint file from Gaussian
**Typical Data:** Complete wavefunction data, results, geometry
**Use Cases:** Post-processing Gaussian calculations
**Python Libraries:**
- `cclib`: Can parse fchk files
- `GaussView` Python API (if available)
- Custom parsers
**EDA Approach:**
- Wavefunction quality assessment
- Property extraction
- Basis set information
- Gradient and Hessian analysis
- Natural orbital analysis

### .cube - Gaussian Cube File
**Description:** Volumetric data on a 3D grid
**Typical Data:** Electron density, molecular orbitals, ESP on grid
**Use Cases:** Visualization of volumetric properties
**Python Libraries:**
- `cclib`: `cclib.io.ccread('file.cube')`
- `ase.io`: `ase.io.read('file.cube')`
- `pyquante`: For cube file manipulation
**EDA Approach:**
- Grid dimension and spacing analysis
- Value distribution statistics
- Isosurface value determination
- Integration over volume
- Comparison between different cubes

## Molecular Dynamics Formats

### .dcd - Binary Trajectory
**Description:** Binary trajectory format (CHARMM, NAMD)
**Typical Data:** Time series of atomic coordinates
**Use Cases:** MD trajectory analysis
**Python Libraries:**
- `MDAnalysis`: `Universe(topology, 'traj.dcd')`
- `MDTraj`: `mdtraj.load_dcd('traj.dcd', top='topology.pdb')`
- `PyTraj` (Amber): Limited support
**EDA Approach:**
- RMSD/RMSF analysis
- Trajectory length and frame count
- Coordinate range and drift
- Periodic boundary handling
- File integrity check
- Time step validation

### .xtc - Compressed Trajectory
**Description:** GROMACS compressed trajectory format
**Typical Data:** Compressed coordinates from MD simulations
**Use Cases:** Space-efficient MD trajectory storage
**Python Libraries:**
- `MDAnalysis`: `Universe(topology, 'traj.xtc')`
- `MDTraj`: `mdtraj.load_xtc('traj.xtc', top='topology.pdb')`
**EDA Approach:**
- Compression ratio assessment
- Precision loss evaluation
- RMSD over time
- Structural stability metrics
- Sampling frequency analysis

### .trr - GROMACS Trajectory
**Description:** Full precision GROMACS trajectory
**Typical Data:** Coordinates, velocities, forces from MD
**Use Cases:** High-precision MD analysis
**Python Libraries:**
- `MDAnalysis`: Full support
- `MDTraj`: Can read trr files
- `GromacsWrapper`
**EDA Approach:**
- Full system dynamics analysis
- Energy conservation check (with velocities)
- Force analysis
- Temperature and pressure validation
- System equilibration assessment

### .nc / .netcdf - Amber NetCDF Trajectory
**Description:** Network Common Data Form trajectory
**Typical Data:** MD coordinates, velocities, forces
**Use Cases:** Amber MD simulations, large trajectory storage
**Python Libraries:**
- `MDAnalysis`: NetCDF support
- `PyTraj`: Native Amber analysis
- `netCDF4`: Low-level access
**EDA Approach:**
- Metadata extraction
- Trajectory statistics
- Time series analysis
- Replica exchange analysis
- Multi-dimensional data extraction

### .top - GROMACS Topology
**Description:** Molecular topology for GROMACS
**Typical Data:** Atom types, bonds, angles, force field parameters
**Use Cases:** MD simulation setup and analysis
**Python Libraries:**
- `ParmEd`: `parmed.load_file('system.top')`
- `MDAnalysis`: Can parse topology
- Custom parsers for specific fields
**EDA Approach:**
- Force field parameter validation
- System composition
- Bond/angle/dihedral distribution
- Charge neutrality check
- Molecule type enumeration

### .psf - Protein Structure File (CHARMM)
**Description:** Topology file for CHARMM/NAMD
**Typical Data:** Atom connectivity, types, charges
**Use Cases:** CHARMM/NAMD MD simulations
**Python Libraries:**
- `MDAnalysis`: Native PSF support
- `ParmEd`: Can read PSF files
**EDA Approach:**
- Topology validation
- Connectivity analysis
- Charge distribution
- Atom type statistics
- Segment analysis

### .prmtop - Amber Parameter/Topology
**Description:** Amber topology and parameter file
**Typical Data:** System topology, force field parameters
**Use Cases:** Amber MD simulations
**Python Libraries:**
- `ParmEd`: `parmed.load_file('system.prmtop')`
- `PyTraj`: Native Amber support
**EDA Approach:**
- Force field completeness
- Parameter validation
- System size and composition
- Periodic box information
- Atom mask creation for analysis

### .inpcrd / .rst7 - Amber Coordinates
**Description:** Amber coordinate/restart file
**Typical Data:** Atomic coordinates, velocities, box info
**Use Cases:** Starting coordinates for Amber MD
**Python Libraries:**
- `ParmEd`: Works with prmtop
- `PyTraj`: Amber coordinate reading
**EDA Approach:**
- Coordinate validity
- System initialization check
- Box vector validation
- Velocity distribution (if restart)
- Energy minimization status

## Spectroscopy and Analytical Data

### .jcamp / .jdx - JCAMP-DX
**Description:** Joint Committee on Atomic and Molecular Physical Data eXchange
**Typical Data:** Spectroscopic data (IR, NMR, MS, UV-Vis)
**Use Cases:** Spectroscopy data exchange and archiving
**Python Libraries:**
- `jcamp`: `jcamp.jcamp_reader('file.jdx')`
- `nmrglue`: For NMR JCAMP files
- Custom parsers for specific subtypes
**EDA Approach:**
- Peak detection and analysis
- Baseline correction assessment
- Signal-to-noise calculation
- Spectral range validation
- Integration analysis
- Comparison with reference spectra

### .mzML - Mass Spectrometry Markup Language
**Description:** Standard XML format for mass spectrometry data
**Typical Data:** MS/MS spectra, chromatograms, metadata
**Use Cases:** Proteomics, metabolomics, mass spectrometry workflows
**Python Libraries:**
- `pymzml`: `pymzml.run.Reader('file.mzML')`
- `pyteomics`: `pyteomics.mzml.read('file.mzML')`
- `MSFileReader` wrappers
**EDA Approach:**
- Scan count and types
- MS level distribution
- Retention time range
- m/z range and resolution
- Peak intensity distribution
- Data completeness
- Quality control metrics

### .mzXML - Mass Spectrometry XML
**Description:** Open XML format for MS data
**Typical Data:** Mass spectra, retention times, peak lists
**Use Cases:** Legacy MS data, metabolomics
**Python Libraries:**
- `pymzml`: Can read mzXML
- `pyteomics.mzxml`
- `lxml` for direct XML parsing
**EDA Approach:**
- Similar to mzML
- Version compatibility check
- Conversion quality assessment
- Peak picking validation

### .raw - Vendor Raw Data
**Description:** Proprietary instrument data files (Thermo, Bruker, etc.)
**Typical Data:** Raw instrument signals, unprocessed data
**Use Cases:** Direct instrument data access
**Python Libraries:**
- `pymsfilereader`: For Thermo RAW files
- `ThermoRawFileParser`: CLI wrapper
- Vendor-specific APIs (Thermo, Bruker Compass)
**EDA Approach:**
- Instrument method extraction
- Raw signal quality
- Calibration status
- Scan function analysis
- Chromatographic quality metrics

### .d - Agilent Data Directory
**Description:** Agilent's data folder structure
**Typical Data:** LC-MS, GC-MS data and metadata
**Use Cases:** Agilent instrument data processing
**Python Libraries:**
- `agilent-reader`: Community tools
- `Chemstation` Python integration
- Custom directory parsing
**EDA Approach:**
- Directory structure validation
- Method parameter extraction
- Signal file integrity
- Calibration curve analysis
- Sequence information extraction

### .fid - NMR Free Induction Decay
**Description:** Raw NMR time-domain data
**Typical Data:** Time-domain NMR signal
**Use Cases:** NMR processing and analysis
**Python Libraries:**
- `nmrglue`: `nmrglue.bruker.read_fid('fid')`
- `nmrstarlib`: For NMR-STAR files
**EDA Approach:**
- Signal decay analysis
- Noise level assessment
- Acquisition parameter validation
- Apodization function selection
- Zero-filling optimization
- Phasing parameter estimation

### .ft - NMR Frequency-Domain Data
**Description:** Processed NMR spectrum
**Typical Data:** Frequency-domain NMR data
**Use Cases:** NMR analysis and interpretation
**Python Libraries:**
- `nmrglue`: Comprehensive NMR support
- `pyNMR`: For processing
**EDA Approach:**
- Peak picking and integration
- Chemical shift calibration
- Multiplicity analysis
- Coupling constant extraction
- Spectral quality metrics
- Reference compound identification

### .spc - Spectroscopy File
**Description:** Thermo Galactic spectroscopy format
**Typical Data:** IR, Raman, UV-Vis spectra
**Use Cases:** Spectroscopic data from various instruments
**Python Libraries:**
- `spc`: `spc.File('file.spc')`
- Custom parsers for binary format
**EDA Approach:**
- Spectral resolution
- Wavelength/wavenumber range
- Baseline characterization
- Peak identification
- Derivative spectra calculation

## Chemical Database Formats

### .inchi - International Chemical Identifier
**Description:** Text identifier for chemical substances
**Typical Data:** Layered chemical structure representation
**Use Cases:** Chemical database keys, structure searching
**Python Libraries:**
- `RDKit`: `Chem.MolFromInchi(inchi)`
- `Open Babel`: InChI conversion
**EDA Approach:**
- InChI validation
- Layer analysis
- Stereochemistry verification
- InChI key generation
- Structure round-trip validation

### .cdx / .cdxml - ChemDraw Exchange
**Description:** ChemDraw drawing file format
**Typical Data:** 2D chemical structures with annotations
**Use Cases:** Chemical drawing, publication figures
**Python Libraries:**
- `RDKit`: Can import some CDXML
- `Open Babel`: Limited support
- `ChemDraw` Python API (commercial)
**EDA Approach:**
- Structure extraction
- Annotation preservation
- Style consistency
- 2D coordinate validation

### .cml - Chemical Markup Language
**Description:** XML-based chemical structure format
**Typical Data:** Chemical structures, reactions, properties
**Use Cases:** Semantic chemical data representation
**Python Libraries:**
- `RDKit`: CML support
- `Open Babel`: Good CML support
- `lxml`: For XML parsing
**EDA Approach:**
- XML schema validation
- Namespace handling
- Property extraction
- Reaction scheme analysis
- Metadata completeness

### .rxn - MDL Reaction File
**Description:** Chemical reaction structure file
**Typical Data:** Reactants, products, reaction arrows
**Use Cases:** Reaction databases, synthesis planning
**Python Libraries:**
- `RDKit`: `Chem.ReactionFromRxnFile('file.rxn')`
- `Open Babel`: Reaction support
**EDA Approach:**
- Reaction balancing validation
- Atom mapping analysis
- Reagent identification
- Stereochemistry changes
- Reaction classification

### .rdf - Reaction Data File
**Description:** Multi-reaction file format
**Typical Data:** Multiple reactions with data
**Use Cases:** Reaction databases
**Python Libraries:**
- `RDKit`: RDF reading capabilities
- Custom parsers
**EDA Approach:**
- Reaction yield statistics
- Condition analysis
- Success rate patterns
- Reagent frequency analysis

## Computational Output and Data

### .hdf5 / .h5 - Hierarchical Data Format
**Description:** Container for scientific data arrays
**Typical Data:** Large arrays, metadata, hierarchical organization
**Use Cases:** Large dataset storage, computational results
**Python Libraries:**
- `h5py`: `h5py.File('file.h5', 'r')`
- `pytables`: Advanced HDF5 interface
- `pandas`: Can read HDF5
**EDA Approach:**
- Dataset structure exploration
- Array shape and dtype analysis
- Metadata extraction
- Memory-efficient data sampling
- Chunk optimization analysis
- Compression ratio assessment

### .pkl / .pickle - Python Pickle
**Description:** Serialized Python objects
**Typical Data:** Any Python object (molecules, dataframes, models)
**Use Cases:** Intermediate data storage, model persistence
**Python Libraries:**
- `pickle`: Built-in serialization
- `joblib`: Enhanced pickling for large arrays
- `dill`: Extended pickle support
**EDA Approach:**
- Object type inspection
- Size and complexity analysis
- Version compatibility check
- Security validation (trusted source)
- Deserialization testing

### .npy / .npz - NumPy Arrays
**Description:** NumPy array binary format
**Typical Data:** Numerical arrays (coordinates, features, matrices)
**Use Cases:** Fast numerical data I/O
**Python Libraries:**
- `numpy`: `np.load('file.npy')`
- Direct memory mapping for large files
**EDA Approach:**
- Array shape and dimensions
- Data type and precision
- Statistical summary (mean, std, range)
- Missing value detection
- Outlier identification
- Memory footprint analysis

### .mat - MATLAB Data File
**Description:** MATLAB workspace data
**Typical Data:** Arrays, structures from MATLAB
**Use Cases:** MATLAB-Python data exchange
**Python Libraries:**
- `scipy.io`: `scipy.io.loadmat('file.mat')`
- `h5py`: For v7.3 MAT files
**EDA Approach:**
- Variable extraction and types
- Array dimension analysis
- Structure field exploration
- MATLAB version compatibility
- Data type conversion validation

### .csv - Comma-Separated Values
**Description:** Tabular data in text format
**Typical Data:** Chemical properties, experimental data, descriptors
**Use Cases:** Data exchange, analysis, machine learning
**Python Libraries:**
- `pandas`: `pd.read_csv('file.csv')`
- `csv`: Built-in module
- `polars`: Fast CSV reading
**EDA Approach:**
- Data types inference
- Missing value patterns
- Statistical summaries
- Correlation analysis
- Distribution visualization
- Outlier detection

### .json - JavaScript Object Notation
**Description:** Structured text data format
**Typical Data:** Chemical properties, metadata, API responses
**Use Cases:** Data interchange, configuration, web APIs
**Python Libraries:**
- `json`: Built-in JSON support
- `pandas`: `pd.read_json()`
- `ujson`: Faster JSON parsing
**EDA Approach:**
- Schema validation
- Nesting depth analysis
- Key-value distribution
- Data type consistency
- Array length statistics

### .parquet - Apache Parquet
**Description:** Columnar storage format
**Typical Data:** Large tabular datasets efficiently
**Use Cases:** Big data, efficient columnar analytics
**Python Libraries:**
- `pandas`: `pd.read_parquet('file.parquet')`
- `pyarrow`: Direct parquet access
- `fastparquet`: Alternative implementation
**EDA Approach:**
- Column statistics from metadata
- Partition analysis
- Compression efficiency
- Row group structure
- Fast sampling for large files
- Schema evolution tracking
