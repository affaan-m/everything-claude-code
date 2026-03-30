# Rowan Molecule Handling Reference

## Overview

Rowan uses the `stjames` library for molecular representations. The `stjames.Molecule` class provides a unified interface for creating molecules from various sources and accessing molecular properties.

## Table of Contents

1. [Creating Molecules](#creating-molecules)
2. [Molecule Attributes](#molecule-attributes)
3. [Geometry Methods](#geometry-methods)
4. [File I/O](#file-io)
5. [Conversion Functions](#conversion-functions)
6. [Working with Atoms](#working-with-atoms)

---

## Creating Molecules

### From SMILES

```python
import stjames

# Simple SMILES
mol = stjames.Molecule.from_smiles("CCO")  # Ethanol
mol = stjames.Molecule.from_smiles("c1ccccc1")  # Benzene

# With stereochemistry
mol = stjames.Molecule.from_smiles("C[C@H](O)[C@@H](O)C")  # meso-2,3-butanediol

# Charged molecules
mol = stjames.Molecule.from_smiles("[NH4+]")  # Ammonium
mol = stjames.Molecule.from_smiles("CC(=O)[O-]")  # Acetate

# Complex drug-like molecules
mol = stjames.Molecule.from_smiles("CC(=O)Oc1ccccc1C(=O)O")  # Aspirin
```

**Note:** `from_smiles()` automatically generates 3D coordinates.

---

### From XYZ String

```python
import stjames

xyz_string = """3
Water molecule
O  0.000  0.000  0.117
H  0.000  0.757 -0.469
H  0.000 -0.757 -0.469"""

mol = stjames.Molecule.from_xyz(xyz_string)
```

**XYZ format with optional metadata in comment line:**
```
N_atoms
charge=0 multiplicity=1 energy=-76.4 comment
Element X Y Z
...
```

---

### From XYZ File

```python
import stjames

mol = stjames.Molecule.from_file("structure.xyz")
```

---

### From Extended XYZ (EXTXYZ)

Extended XYZ supports additional properties like forces and cell parameters.

```python
import stjames

extxyz_string = """3
Lattice="10.0 0.0 0.0 0.0 10.0 0.0 0.0 0.0 10.0" Properties=species:S:1:pos:R:3:forces:R:3 energy=-76.4
O  0.000  0.000  0.117  0.01 0.02 0.03
H  0.000  0.757 -0.469  0.00 0.00 0.00
H  0.000 -0.757 -0.469  0.00 0.00 0.00"""

mol = stjames.Molecule.from_extxyz(extxyz_string)

# Access cell information
if mol.cell:
    print(f"Cell: {mol.cell.lattice_vectors}")
```

---

### From RDKit Molecule

```python
import stjames
from rdkit import Chem
from rdkit.Chem import AllChem

# Create RDKit molecule with 3D coordinates
rdkit_mol = Chem.MolFromSmiles("CCO")
rdkit_mol = Chem.AddHs(rdkit_mol)
AllChem.EmbedMolecule(rdkit_mol)
AllChem.MMFFOptimizeMolecule(rdkit_mol)

# Convert to stjames
mol = stjames.Molecule.from_rdkit(rdkit_mol)
```

---

### Specifying Charge and Multiplicity

```python
import stjames

# Neutral singlet (default)
mol = stjames.Molecule.from_smiles("CCO")

# Cation doublet
mol = stjames.Molecule.from_smiles("CCO", charge=1, multiplicity=2)

# Anion singlet
mol = stjames.Molecule.from_smiles("CC(=O)[O-]", charge=-1, multiplicity=1)

# Triplet oxygen
mol = stjames.Molecule.from_smiles("[O][O]", charge=0, multiplicity=3)
```

---

## Molecule Attributes

### Basic Properties

```python
import stjames

mol = stjames.Molecule.from_smiles("CCO")

# Charge and spin
print(f"Charge: {mol.charge}")  # 0
print(f"Multiplicity: {mol.multiplicity}")  # 1

# Number of atoms
print(f"Number of atoms: {len(mol.atoms)}")
```

### Computed Properties (after calculation)

```python
# After running a calculation
print(f"Energy: {mol.energy} Hartree")
print(f"Dipole: {mol.dipole}")  # (x, y, z) in Debye

# Atomic properties
print(f"Mulliken charges: {mol.mulliken_charges}")
print(f"Mulliken spin densities: {mol.mulliken_spin_densities}")
```

### Thermochemistry (after frequency calculation)

```python
# After frequency calculation
print(f"ZPE: {mol.zero_point_energy} Hartree")
print(f"Thermal correction to enthalpy: {mol.thermal_correction_enthalpy}")
print(f"Thermal correction to Gibbs: {mol.thermal_correction_gibbs}")
print(f"Gibbs free energy: {mol.gibbs_free_energy} Hartree")
```

### Vibrational Modes (after frequency calculation)

```python
for mode in mol.vibrational_modes:
    print(f"Frequency: {mode.frequency} cm⁻¹")
    print(f"Reduced mass: {mode.reduced_mass} amu")
    print(f"IR intensity: {mode.ir_intensity} km/mol")
    print(f"Displacements: {mode.displacements}")
```

### Periodic Cell

```python
if mol.cell:
    print(f"Lattice vectors: {mol.cell.lattice_vectors}")
    print(f"Is periodic: True")
```

---

## Geometry Methods

### Distance Between Atoms

```python
import stjames

mol = stjames.Molecule.from_smiles("CCO")

# Distance between atoms 0 and 1 (in Angstroms)
d = mol.distance(0, 1)
print(f"C-C bond length: {d:.3f} Å")
```

### Angle Between Three Atoms

```python
import stjames

mol = stjames.Molecule.from_smiles("CCO")

# Angle formed by atoms 0-1-2 (C-C-O)
angle = mol.angle(0, 1, 2, degrees=True)
print(f"C-C-O angle: {angle:.1f}°")

# In radians
angle_rad = mol.angle(0, 1, 2, degrees=False)
```

### Dihedral Angle

```python
import stjames

mol = stjames.Molecule.from_smiles("CCCC")

# Dihedral angle for atoms 0-1-2-3
dihedral = mol.dihedral(0, 1, 2, 3, degrees=True)
print(f"Dihedral: {dihedral:.1f}°")

# Use positive domain (0 to 360)
dihedral_pos = mol.dihedral(0, 1, 2, 3, degrees=True, positive_domain=True)
```

### Translation

```python
import stjames

mol = stjames.Molecule.from_smiles("CCO")

# Translate by vector
translated = mol.translated([1.0, 0.0, 0.0])  # Move 1 Å in x direction
```

---

## File I/O

### Export to XYZ

```python
import stjames

mol = stjames.Molecule.from_smiles("CCO")

# Get XYZ string
xyz_str = mol.to_xyz(comment="Ethanol optimized structure")
print(xyz_str)

# Write to file
mol.to_xyz(comment="Ethanol", out_file="ethanol.xyz")
```

### Export to Extended XYZ

```python
import stjames

mol = stjames.Molecule.from_smiles("CCO")

# Include energy in comment
xyz_str = mol.to_xyz(comment=f"energy={mol.energy}")
```

---

## Conversion Functions

### SMILES to Molecule (Rowan Utility)

```python
import rowan

# Quick conversion using Rowan's utility
mol = rowan.smiles_to_stjames("CCO")
```

### Molecule Lookup by Name

```python
import rowan

# Convert common names to SMILES
smiles = rowan.molecule_lookup("aspirin")
print(smiles)  # "CC(=O)Oc1ccccc1C(=O)O"

smiles = rowan.molecule_lookup("caffeine")
print(smiles)  # "Cn1cnc2c1c(=O)n(c(=O)n2C)C"

# Use with workflow submission
mol = stjames.Molecule.from_smiles(rowan.molecule_lookup("ibuprofen"))
workflow = rowan.submit_pka_workflow(mol, name="Ibuprofen pKa")
```

---

## Working with Atoms

### Atom Class

Each atom in `mol.atoms` is an `Atom` object.

```python
import stjames

mol = stjames.Molecule.from_smiles("CCO")

for i, atom in enumerate(mol.atoms):
    print(f"Atom {i}: {atom.element}")
    print(f"  Position: ({atom.x:.3f}, {atom.y:.3f}, {atom.z:.3f})")
```

### Atom Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `element` | str | Element symbol (e.g., "C", "O", "H") |
| `x` | float | X coordinate (Å) |
| `y` | float | Y coordinate (Å) |
| `z` | float | Z coordinate (Å) |
| `atomic_number` | int | Atomic number |

### Getting Coordinates as Array

```python
import stjames
import numpy as np

mol = stjames.Molecule.from_smiles("CCO")

# Extract positions as numpy array
positions = np.array([[atom.x, atom.y, atom.z] for atom in mol.atoms])
print(f"Positions shape: {positions.shape}")  # (N_atoms, 3)
```

---

## Common Patterns

### Batch Molecule Creation

```python
import stjames

smiles_list = ["CCO", "CC(=O)O", "c1ccccc1", "c1ccccc1O"]

molecules = []
for smi in smiles_list:
    try:
        mol = stjames.Molecule.from_smiles(smi)
        molecules.append(mol)
    except Exception as e:
        print(f"Failed to create molecule from {smi}: {e}")

print(f"Created {len(molecules)} molecules")
```

### Modifying Charge/Multiplicity

```python
import stjames

# Create neutral molecule
mol = stjames.Molecule.from_smiles("c1ccccc1")

# Create cation version
mol_cation = stjames.Molecule.from_smiles("c1ccccc1", charge=1, multiplicity=2)

# Or modify existing (if supported)
# Note: May need to recreate from coordinates
```

### Combining Geometry Analysis

```python
import stjames

mol = stjames.Molecule.from_smiles("CCCC")

# Analyze butane conformer
print("Butane geometry analysis:")
print(f"  C1-C2 bond: {mol.distance(0, 1):.3f} Å")
print(f"  C2-C3 bond: {mol.distance(1, 2):.3f} Å")
print(f"  C3-C4 bond: {mol.distance(2, 3):.3f} Å")
print(f"  C-C-C angle: {mol.angle(0, 1, 2, degrees=True):.1f}°")
print(f"  C-C-C-C dihedral: {mol.dihedral(0, 1, 2, 3, degrees=True):.1f}°")
```

---

## Electron Sanity Check

The `stjames.Molecule` class validates that charge and multiplicity are consistent with the number of electrons:

```python
import stjames

# This will fail validation
try:
    # Oxygen with wrong multiplicity
    mol = stjames.Molecule.from_smiles("[O][O]", charge=0, multiplicity=1)
except ValueError as e:
    print(f"Validation error: {e}")

# Correct: triplet oxygen
mol = stjames.Molecule.from_smiles("[O][O]", charge=0, multiplicity=3)
```

The validation ensures:
- Number of electrons = sum(atomic_numbers) - charge
- Multiplicity is compatible with electron count (odd/even)
