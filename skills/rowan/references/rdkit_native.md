# Rowan RDKit-Native API Reference

## Overview

The RDKit-native API provides a simplified interface for users working with RDKit molecules. Functions automatically handle:

1. Converting RDKit molecules to Rowan's internal format
2. Allocating cloud compute resources
3. Executing multi-step workflows
4. Monitoring job completion
5. Returning RDKit-compatible results

## Table of Contents

1. [pKa Functions](#pka-functions)
2. [Tautomer Functions](#tautomer-functions)
3. [Conformer Functions](#conformer-functions)
4. [Energy Functions](#energy-functions)
5. [Optimization Functions](#optimization-functions)
6. [Batch Processing Patterns](#batch-processing-patterns)

---

## pKa Functions

### `run_pka`

Calculate pKa for a single molecule.

```python
import rowan
from rdkit import Chem

mol = Chem.MolFromSmiles("c1ccccc1O")  # Phenol
result = rowan.run_pka(mol)

print(f"Strongest acid pKa: {result.strongest_acid}")
print(f"Strongest base pKa: {result.strongest_base}")
print(f"Microscopic pKas: {result.microscopic_pkas}")
```

**Parameters:**
- `mol` (rdkit.Chem.Mol): RDKit molecule object

**Returns:** `PKAResult` object with attributes:
- `strongest_acid`: float - pKa of most acidic proton
- `strongest_base`: float - pKa of most basic site
- `microscopic_pkas`: list - Site-specific pKa values
- `tautomer_populations`: dict - Populations at pH 7

---

### `batch_pka`

Calculate pKa for multiple molecules in parallel.

```python
import rowan
from rdkit import Chem

smiles_list = ["CCO", "CC(=O)O", "c1ccccc1O", "c1ccccc1N"]
mols = [Chem.MolFromSmiles(smi) for smi in smiles_list]

results = rowan.batch_pka(mols)

for smi, result in zip(smiles_list, results):
    if result is not None:
        print(f"{smi}: pKa = {result.strongest_acid:.2f}")
    else:
        print(f"{smi}: Failed")
```

**Parameters:**
- `mols` (list[rdkit.Chem.Mol]): List of RDKit molecules

**Returns:** `list[PKAResult | None]` - Results for each molecule (None if failed)

---

## Tautomer Functions

### `run_tautomers`

Enumerate and rank tautomers.

```python
import rowan
from rdkit import Chem

mol = Chem.MolFromSmiles("Oc1ncnc2[nH]cnc12")  # Hypoxanthine
result = rowan.run_tautomers(mol)

print(f"Number of tautomers: {len(result.tautomers)}")
for i, (taut, pop) in enumerate(zip(result.tautomers, result.populations)):
    print(f"Tautomer {i}: {Chem.MolToSmiles(taut)}, Population: {pop:.1%}")
```

**Parameters:**
- `mol` (rdkit.Chem.Mol): RDKit molecule object

**Returns:** `TautomerResult` object with attributes:
- `tautomers`: list[rdkit.Chem.Mol] - Tautomer structures
- `energies`: list[float] - Relative energies (kcal/mol)
- `populations`: list[float] - Boltzmann populations at 298 K

---

### `batch_tautomers`

Enumerate tautomers for multiple molecules.

```python
import rowan
from rdkit import Chem

mols = [Chem.MolFromSmiles(smi) for smi in smiles_list]
results = rowan.batch_tautomers(mols)

for smi, result in zip(smiles_list, results):
    if result:
        print(f"{smi}: {len(result.tautomers)} tautomers")
```

**Parameters:**
- `mols` (list[rdkit.Chem.Mol]): List of RDKit molecules

**Returns:** `list[TautomerResult | None]`

---

## Conformer Functions

### `run_conformers`

Generate and optimize conformer ensemble.

```python
import rowan
from rdkit import Chem

mol = Chem.MolFromSmiles("CCCC")  # Butane
result = rowan.run_conformers(mol)

print(f"Number of conformers: {len(result.conformers)}")
print(f"Energy range: {result.energy_range:.2f} kcal/mol")

# Get lowest energy conformer
best_conformer = result.lowest_energy_conformer
print(f"Lowest energy: {result.energies[0]:.4f} Hartree")
```

**Parameters:**
- `mol` (rdkit.Chem.Mol): RDKit molecule object

**Returns:** `ConformerResult` object with attributes:
- `conformers`: list[rdkit.Chem.Mol] - Conformer structures (with 3D coordinates)
- `energies`: list[float] - Energies in Hartree
- `lowest_energy_conformer`: rdkit.Chem.Mol - Global minimum
- `energy_range`: float - Energy span in kcal/mol
- `boltzmann_weights`: list[float] - Population weights

---

### `batch_conformers`

Generate conformers for multiple molecules.

```python
import rowan
from rdkit import Chem

mols = [Chem.MolFromSmiles(smi) for smi in smiles_list]
results = rowan.batch_conformers(mols)

for smi, result in zip(smiles_list, results):
    if result:
        print(f"{smi}: {len(result.conformers)} conformers, range = {result.energy_range:.2f} kcal/mol")
```

**Parameters:**
- `mols` (list[rdkit.Chem.Mol]): List of RDKit molecules

**Returns:** `list[ConformerResult | None]`

---

## Energy Functions

### `run_energy`

Calculate single-point energy.

```python
import rowan
from rdkit import Chem
from rdkit.Chem import AllChem

# Create molecule with 3D coordinates
mol = Chem.MolFromSmiles("CCO")
mol = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol)
AllChem.MMFFOptimizeMolecule(mol)

result = rowan.run_energy(mol)

print(f"Energy: {result.energy:.6f} Hartree")
print(f"Dipole moment: {result.dipole_magnitude:.2f} Debye")
```

**Parameters:**
- `mol` (rdkit.Chem.Mol): RDKit molecule with 3D coordinates

**Returns:** `EnergyResult` object with attributes:
- `energy`: float - Total energy (Hartree)
- `dipole`: tuple[float, float, float] - Dipole vector
- `dipole_magnitude`: float - Dipole magnitude (Debye)
- `mulliken_charges`: list[float] - Atomic charges

---

### `batch_energy`

Calculate energies for multiple molecules.

```python
import rowan
from rdkit import Chem

# Molecules must have 3D coordinates
results = rowan.batch_energy(mols_3d)

for mol, result in zip(mols_3d, results):
    if result:
        print(f"{Chem.MolToSmiles(mol)}: E = {result.energy:.6f} Ha")
```

**Parameters:**
- `mols` (list[rdkit.Chem.Mol]): List of molecules with 3D coordinates

**Returns:** `list[EnergyResult | None]`

---

## Optimization Functions

### `run_optimization`

Optimize molecular geometry.

```python
import rowan
from rdkit import Chem
from rdkit.Chem import AllChem

# Start from initial guess
mol = Chem.MolFromSmiles("CC(=O)O")
mol = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol)

result = rowan.run_optimization(mol)

print(f"Final energy: {result.energy:.6f} Hartree")
print(f"Converged: {result.converged}")

# Get optimized structure
optimized_mol = result.molecule
```

**Parameters:**
- `mol` (rdkit.Chem.Mol): RDKit molecule (3D coordinates optional)

**Returns:** `OptimizationResult` object with attributes:
- `molecule`: rdkit.Chem.Mol - Optimized structure
- `energy`: float - Final energy (Hartree)
- `converged`: bool - Optimization convergence
- `n_steps`: int - Number of optimization steps

---

### `batch_optimization`

Optimize multiple molecules.

```python
import rowan
from rdkit import Chem

results = rowan.batch_optimization(mols)

for mol, result in zip(mols, results):
    if result and result.converged:
        print(f"{Chem.MolToSmiles(mol)}: E = {result.energy:.6f} Ha")
```

**Parameters:**
- `mols` (list[rdkit.Chem.Mol]): List of RDKit molecules

**Returns:** `list[OptimizationResult | None]`

---

## Batch Processing Patterns

### Parallel Processing with Progress

```python
import rowan
from rdkit import Chem
from tqdm import tqdm

smiles_list = ["CCO", "CC(=O)O", "c1ccccc1O", "c1ccc(O)c(O)c1"]
mols = [Chem.MolFromSmiles(smi) for smi in smiles_list]

# Batch functions automatically distribute across multiple workers
print("Submitting batch pKa calculations...")
results = rowan.batch_pka(mols)

# Process results
for smi, result in zip(smiles_list, results):
    if result:
        print(f"{smi}: pKa = {result.strongest_acid:.2f}")
    else:
        print(f"{smi}: calculation failed")
```

### Error Handling

```python
import rowan
from rdkit import Chem

def safe_pka(smiles):
    """Safely calculate pKa with error handling."""
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None, "Invalid SMILES"

        result = rowan.run_pka(mol)
        return result, None

    except rowan.RowanAPIError as e:
        return None, f"API error: {e}"
    except Exception as e:
        return None, f"Error: {e}"

# Usage
result, error = safe_pka("c1ccccc1O")
if error:
    print(f"Failed: {error}")
else:
    print(f"pKa: {result.strongest_acid}")
```

### Combining with RDKit Workflows

```python
import rowan
from rdkit import Chem
from rdkit.Chem import Descriptors, AllChem

# Load molecules
mols = [Chem.MolFromSmiles(smi) for smi in smiles_list]

# Filter by RDKit descriptors first
filtered_mols = [
    mol for mol in mols
    if mol and Descriptors.MolWt(mol) < 500
]

# Calculate pKa only for filtered set
pka_results = rowan.batch_pka(filtered_mols)

# Combine results
for mol, pka in zip(filtered_mols, pka_results):
    if pka:
        mw = Descriptors.MolWt(mol)
        print(f"{Chem.MolToSmiles(mol)}: MW={mw:.1f}, pKa={pka.strongest_acid:.2f}")
```

### Virtual Screening Pipeline

```python
import rowan
from rdkit import Chem
from rdkit.Chem import Descriptors
import pandas as pd

def screen_compounds(smiles_list):
    """Screen compounds for drug-likeness and calculate pKa."""
    results = []

    mols = [Chem.MolFromSmiles(smi) for smi in smiles_list]
    valid_mols = [(smi, mol) for smi, mol in zip(smiles_list, mols) if mol]

    # Batch pKa calculation
    pka_results = rowan.batch_pka([mol for _, mol in valid_mols])

    for (smi, mol), pka in zip(valid_mols, pka_results):
        result = {
            'smiles': smi,
            'mw': Descriptors.MolWt(mol),
            'logp': Descriptors.MolLogP(mol),
            'hbd': Descriptors.NumHDonors(mol),
            'hba': Descriptors.NumHAcceptors(mol),
            'pka': pka.strongest_acid if pka else None
        }
        results.append(result)

    return pd.DataFrame(results)

# Usage
df = screen_compounds(compound_library)
print(df[df['pka'].notna()].sort_values('pka'))
```

---

## Performance Considerations

1. **Batch functions are more efficient** - Submit multiple molecules at once rather than one by one
2. **Fractional credits** - Low-cost calculations may use < 1 credit (e.g., 0.17 credits for fast pKa)
3. **Automatic parallelization** - Batch functions distribute work across Rowan's compute cluster
4. **Results caching** - Previously calculated molecules may return faster

---

## Comparison with Full API

| Feature | RDKit-Native | Full API |
|---------|--------------|----------|
| Input format | RDKit Mol | stjames.Molecule |
| Output format | RDKit Mol + results | Workflow object |
| Workflow control | Automatic | Manual wait/fetch |
| Folder organization | No | Yes |
| Advanced parameters | Default only | Full control |

Use RDKit-native API for quick calculations; use full API for complex workflows or when you need fine-grained control.
