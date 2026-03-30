# Pymatgen I/O and File Format Reference

This reference documents pymatgen's extensive input/output capabilities for reading and writing structural and computational data across 100+ file formats.

## General I/O Philosophy

Pymatgen provides a unified interface for file operations through the `from_file()` and `to()` methods, with automatic format detection based on file extensions.

### Reading Files

```python
from pymatgen.core import Structure, Molecule

# Automatic format detection
struct = Structure.from_file("POSCAR")
struct = Structure.from_file("structure.cif")
mol = Molecule.from_file("molecule.xyz")

# Explicit format specification
struct = Structure.from_file("file.txt", fmt="cif")
```

### Writing Files

```python
# Write to file (format inferred from extension)
struct.to(filename="output.cif")
struct.to(filename="POSCAR")
struct.to(filename="structure.xyz")

# Get string representation without writing
cif_string = struct.to(fmt="cif")
poscar_string = struct.to(fmt="poscar")
```

## Structure File Formats

### CIF (Crystallographic Information File)
Standard format for crystallographic data.

```python
from pymatgen.io.cif import CifParser, CifWriter

# Reading
parser = CifParser("structure.cif")
structure = parser.get_structures()[0]  # Returns list of structures

# Writing
writer = CifWriter(struct)
writer.write_file("output.cif")

# Or using convenience methods
struct = Structure.from_file("structure.cif")
struct.to(filename="output.cif")
```

**Key features:**
- Supports symmetry information
- Can contain multiple structures
- Preserves space group and symmetry operations
- Handles partial occupancies

### POSCAR/CONTCAR (VASP)
VASP's structure format.

```python
from pymatgen.io.vasp import Poscar

# Reading
poscar = Poscar.from_file("POSCAR")
structure = poscar.structure

# Writing
poscar = Poscar(struct)
poscar.write_file("POSCAR")

# Or using convenience methods
struct = Structure.from_file("POSCAR")
struct.to(filename="POSCAR")
```

**Key features:**
- Supports selective dynamics
- Can include velocities (XDATCAR format)
- Preserves lattice and coordinate precision

### XYZ
Simple molecular coordinates format.

```python
# For molecules
mol = Molecule.from_file("molecule.xyz")
mol.to(filename="output.xyz")

# For structures (Cartesian coordinates)
struct.to(filename="structure.xyz")
```

### PDB (Protein Data Bank)
Common format for biomolecules.

```python
mol = Molecule.from_file("protein.pdb")
mol.to(filename="output.pdb")
```

### JSON/YAML
Serialization via dictionaries.

```python
import json
import yaml

# JSON
with open("structure.json", "w") as f:
    json.dump(struct.as_dict(), f)

with open("structure.json", "r") as f:
    struct = Structure.from_dict(json.load(f))

# YAML
with open("structure.yaml", "w") as f:
    yaml.dump(struct.as_dict(), f)

with open("structure.yaml", "r") as f:
    struct = Structure.from_dict(yaml.safe_load(f))
```

## Electronic Structure Code I/O

### VASP

The most comprehensive integration in pymatgen.

#### Input Files

```python
from pymatgen.io.vasp.inputs import Incar, Poscar, Potcar, Kpoints, VaspInput

# INCAR (calculation parameters)
incar = Incar.from_file("INCAR")
incar = Incar({"ENCUT": 520, "ISMEAR": 0, "SIGMA": 0.05})
incar.write_file("INCAR")

# KPOINTS (k-point mesh)
from pymatgen.io.vasp.inputs import Kpoints
kpoints = Kpoints.automatic(20)  # 20x20x20 Gamma-centered mesh
kpoints = Kpoints.automatic_density(struct, 1000)  # By density
kpoints.write_file("KPOINTS")

# POTCAR (pseudopotentials)
potcar = Potcar(["Fe_pv", "O"])  # Specify functional variants

# Complete input set
vasp_input = VaspInput(incar, kpoints, poscar, potcar)
vasp_input.write_input("./vasp_calc")
```

#### Output Files

```python
from pymatgen.io.vasp.outputs import Vasprun, Outcar, Oszicar, Eigenval

# vasprun.xml (comprehensive output)
vasprun = Vasprun("vasprun.xml")
final_structure = vasprun.final_structure
energy = vasprun.final_energy
band_structure = vasprun.get_band_structure()
dos = vasprun.complete_dos

# OUTCAR
outcar = Outcar("OUTCAR")
magnetization = outcar.total_mag
elastic_tensor = outcar.elastic_tensor

# OSZICAR (convergence information)
oszicar = Oszicar("OSZICAR")
```

#### Input Sets

Pymatgen provides pre-configured input sets for common calculations:

```python
from pymatgen.io.vasp.sets import (
    MPRelaxSet,      # Materials Project relaxation
    MPStaticSet,     # Static calculation
    MPNonSCFSet,     # Non-self-consistent (band structure)
    MPSOCSet,        # Spin-orbit coupling
    MPHSERelaxSet,   # HSE06 hybrid functional
)

# Create input set
relax = MPRelaxSet(struct)
relax.write_input("./relax_calc")

# Customize parameters
static = MPStaticSet(struct, user_incar_settings={"ENCUT": 600})
static.write_input("./static_calc")
```

### Gaussian

Quantum chemistry package integration.

```python
from pymatgen.io.gaussian import GaussianInput, GaussianOutput

# Input
gin = GaussianInput(
    mol,
    charge=0,
    spin_multiplicity=1,
    functional="B3LYP",
    basis_set="6-31G(d)",
    route_parameters={"Opt": None, "Freq": None}
)
gin.write_file("input.gjf")

# Output
gout = GaussianOutput("output.log")
final_mol = gout.final_structure
energy = gout.final_energy
frequencies = gout.frequencies
```

### LAMMPS

Classical molecular dynamics.

```python
from pymatgen.io.lammps.data import LammpsData
from pymatgen.io.lammps.inputs import LammpsInputFile

# Structure to LAMMPS data file
lammps_data = LammpsData.from_structure(struct)
lammps_data.write_file("data.lammps")

# LAMMPS input script
lammps_input = LammpsInputFile.from_file("in.lammps")
```

### Quantum ESPRESSO

```python
from pymatgen.io.pwscf import PWInput, PWOutput

# Input
pwin = PWInput(
    struct,
    control={"calculation": "scf"},
    system={"ecutwfc": 50, "ecutrho": 400},
    electrons={"conv_thr": 1e-8}
)
pwin.write_file("pw.in")

# Output
pwout = PWOutput("pw.out")
final_structure = pwout.final_structure
energy = pwout.final_energy
```

### ABINIT

```python
from pymatgen.io.abinit import AbinitInput

abin = AbinitInput(struct, pseudos)
abin.set_vars(ecut=10, nband=10)
abin.write("abinit.in")
```

### CP2K

```python
from pymatgen.io.cp2k.inputs import Cp2kInput
from pymatgen.io.cp2k.outputs import Cp2kOutput

# Input
cp2k_input = Cp2kInput.from_file("cp2k.inp")

# Output
cp2k_output = Cp2kOutput("cp2k.out")
```

### FEFF (XAS/XANES)

```python
from pymatgen.io.feff import FeffInput

feff_input = FeffInput(struct, absorbing_atom="Fe")
feff_input.write_file("feff.inp")
```

### LMTO (Stuttgart TB-LMTO-ASA)

```python
from pymatgen.io.lmto import LMTOCtrl

ctrl = LMTOCtrl.from_file("CTRL")
ctrl.structure
```

### Q-Chem

```python
from pymatgen.io.qchem.inputs import QCInput
from pymatgen.io.qchem.outputs import QCOutput

# Input
qc_input = QCInput(
    mol,
    rem={"method": "B3LYP", "basis": "6-31G*", "job_type": "opt"}
)
qc_input.write_file("mol.qin")

# Output
qc_output = QCOutput("mol.qout")
```

### Exciting

```python
from pymatgen.io.exciting import ExcitingInput

exc_input = ExcitingInput(struct)
exc_input.write_file("input.xml")
```

### ATAT (Alloy Theoretic Automated Toolkit)

```python
from pymatgen.io.atat import Mcsqs

mcsqs = Mcsqs(struct)
mcsqs.write_input(".")
```

## Special Purpose Formats

### Phonopy

```python
from pymatgen.io.phonopy import get_phonopy_structure, get_pmg_structure

# Convert to phonopy structure
phonopy_struct = get_phonopy_structure(struct)

# Convert from phonopy
struct = get_pmg_structure(phonopy_struct)
```

### ASE (Atomic Simulation Environment)

```python
from pymatgen.io.ase import AseAtomsAdaptor

adaptor = AseAtomsAdaptor()

# Pymatgen to ASE
atoms = adaptor.get_atoms(struct)

# ASE to Pymatgen
struct = adaptor.get_structure(atoms)
```

### Zeo++ (Porous Materials)

```python
from pymatgen.io.zeopp import get_voronoi_nodes, get_high_accuracy_voronoi_nodes

# Analyze pore structure
vor_nodes = get_voronoi_nodes(struct)
```

### BabelMolAdaptor (OpenBabel)

```python
from pymatgen.io.babel import BabelMolAdaptor

adaptor = BabelMolAdaptor(mol)

# Convert to different formats
pdb_str = adaptor.pdbstring
sdf_str = adaptor.write_file("mol.sdf", file_format="sdf")

# Generate 3D coordinates
adaptor.add_hydrogen()
adaptor.make3d()
```

## Alchemy and Transformation I/O

### TransformedStructure

Structures that track their transformation history.

```python
from pymatgen.alchemy.materials import TransformedStructure
from pymatgen.transformations.standard_transformations import (
    SupercellTransformation,
    SubstitutionTransformation
)

# Create transformed structure
ts = TransformedStructure(struct, [])
ts.append_transformation(SupercellTransformation([[2,0,0],[0,2,0],[0,0,2]]))
ts.append_transformation(SubstitutionTransformation({"Fe": "Mn"}))

# Write with history
ts.write_vasp_input("./calc_dir")

# Read from SNL (Structure Notebook Language)
ts = TransformedStructure.from_snl(snl)
```

## Batch Operations

### CifTransmuter

Process multiple CIF files.

```python
from pymatgen.alchemy.transmuters import CifTransmuter

transmuter = CifTransmuter.from_filenames(
    ["structure1.cif", "structure2.cif"],
    [SupercellTransformation([[2,0,0],[0,2,0],[0,0,2]])]
)

# Write all structures
transmuter.write_vasp_input("./batch_calc")
```

### PoscarTransmuter

Similar for POSCAR files.

```python
from pymatgen.alchemy.transmuters import PoscarTransmuter

transmuter = PoscarTransmuter.from_filenames(
    ["POSCAR1", "POSCAR2"],
    [transformation1, transformation2]
)
```

## Best Practices

1. **Automatic format detection**: Use `from_file()` and `to()` methods whenever possible
2. **Error handling**: Always wrap file I/O in try-except blocks
3. **Format-specific parsers**: Use specialized parsers (e.g., `Vasprun`) for detailed output analysis
4. **Input sets**: Prefer pre-configured input sets over manual parameter specification
5. **Serialization**: Use JSON/YAML for long-term storage and version control
6. **Batch processing**: Use transmuters for applying transformations to multiple structures

## Supported Format Summary

### Structure formats:
CIF, POSCAR/CONTCAR, XYZ, PDB, XSF, PWMAT, Res, CSSR, JSON, YAML

### Electronic structure codes:
VASP, Gaussian, LAMMPS, Quantum ESPRESSO, ABINIT, CP2K, FEFF, Q-Chem, LMTO, Exciting, NWChem, AIMS, Crystallographic data formats

### Molecular formats:
XYZ, PDB, MOL, SDF, PQR, via OpenBabel (many additional formats)

### Special purpose:
Phonopy, ASE, Zeo++, Lobster, BoltzTraP
