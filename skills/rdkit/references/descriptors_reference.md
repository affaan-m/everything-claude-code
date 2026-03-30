# RDKit Molecular Descriptors Reference

Complete reference for molecular descriptors available in RDKit's `Descriptors` module.

## Usage

```python
from rdkit import Chem
from rdkit.Chem import Descriptors

mol = Chem.MolFromSmiles('CCO')

# Calculate individual descriptor
mw = Descriptors.MolWt(mol)

# Calculate all descriptors at once
all_desc = Descriptors.CalcMolDescriptors(mol)
```

## Molecular Weight and Mass

### MolWt
Average molecular weight of the molecule.
```python
Descriptors.MolWt(mol)
```

### ExactMolWt
Exact molecular weight using isotopic composition.
```python
Descriptors.ExactMolWt(mol)
```

### HeavyAtomMolWt
Average molecular weight ignoring hydrogens.
```python
Descriptors.HeavyAtomMolWt(mol)
```

## Lipophilicity

### MolLogP
Wildman-Crippen LogP (octanol-water partition coefficient).
```python
Descriptors.MolLogP(mol)
```

### MolMR
Wildman-Crippen molar refractivity.
```python
Descriptors.MolMR(mol)
```

## Polar Surface Area

### TPSA
Topological polar surface area (TPSA) based on fragment contributions.
```python
Descriptors.TPSA(mol)
```

### LabuteASA
Labute's Approximate Surface Area (ASA).
```python
Descriptors.LabuteASA(mol)
```

## Hydrogen Bonding

### NumHDonors
Number of hydrogen bond donors (N-H and O-H).
```python
Descriptors.NumHDonors(mol)
```

### NumHAcceptors
Number of hydrogen bond acceptors (N and O).
```python
Descriptors.NumHAcceptors(mol)
```

### NOCount
Number of N and O atoms.
```python
Descriptors.NOCount(mol)
```

### NHOHCount
Number of N-H and O-H bonds.
```python
Descriptors.NHOHCount(mol)
```

## Atom Counts

### HeavyAtomCount
Number of heavy atoms (non-hydrogen).
```python
Descriptors.HeavyAtomCount(mol)
```

### NumHeteroatoms
Number of heteroatoms (non-C and non-H).
```python
Descriptors.NumHeteroatoms(mol)
```

### NumValenceElectrons
Total number of valence electrons.
```python
Descriptors.NumValenceElectrons(mol)
```

### NumRadicalElectrons
Number of radical electrons.
```python
Descriptors.NumRadicalElectrons(mol)
```

## Ring Descriptors

### RingCount
Number of rings.
```python
Descriptors.RingCount(mol)
```

### NumAromaticRings
Number of aromatic rings.
```python
Descriptors.NumAromaticRings(mol)
```

### NumSaturatedRings
Number of saturated rings.
```python
Descriptors.NumSaturatedRings(mol)
```

### NumAliphaticRings
Number of aliphatic (non-aromatic) rings.
```python
Descriptors.NumAliphaticRings(mol)
```

### NumAromaticCarbocycles
Number of aromatic carbocycles (rings with only carbons).
```python
Descriptors.NumAromaticCarbocycles(mol)
```

### NumAromaticHeterocycles
Number of aromatic heterocycles (rings with heteroatoms).
```python
Descriptors.NumAromaticHeterocycles(mol)
```

### NumSaturatedCarbocycles
Number of saturated carbocycles.
```python
Descriptors.NumSaturatedCarbocycles(mol)
```

### NumSaturatedHeterocycles
Number of saturated heterocycles.
```python
Descriptors.NumSaturatedHeterocycles(mol)
```

### NumAliphaticCarbocycles
Number of aliphatic carbocycles.
```python
Descriptors.NumAliphaticCarbocycles(mol)
```

### NumAliphaticHeterocycles
Number of aliphatic heterocycles.
```python
Descriptors.NumAliphaticHeterocycles(mol)
```

## Rotatable Bonds

### NumRotatableBonds
Number of rotatable bonds (flexibility).
```python
Descriptors.NumRotatableBonds(mol)
```

## Aromatic Atoms

### NumAromaticAtoms
Number of aromatic atoms.
```python
Descriptors.NumAromaticAtoms(mol)
```

## Fraction Descriptors

### FractionCsp3
Fraction of carbons that are sp3 hybridized.
```python
Descriptors.FractionCsp3(mol)
```

## Complexity Descriptors

### BertzCT
Bertz complexity index.
```python
Descriptors.BertzCT(mol)
```

### Ipc
Information content (complexity measure).
```python
Descriptors.Ipc(mol)
```

## Kappa Shape Indices

Molecular shape descriptors based on graph invariants.

### Kappa1
First kappa shape index.
```python
Descriptors.Kappa1(mol)
```

### Kappa2
Second kappa shape index.
```python
Descriptors.Kappa2(mol)
```

### Kappa3
Third kappa shape index.
```python
Descriptors.Kappa3(mol)
```

## Chi Connectivity Indices

Molecular connectivity indices.

### Chi0, Chi1, Chi2, Chi3, Chi4
Simple chi connectivity indices.
```python
Descriptors.Chi0(mol)
Descriptors.Chi1(mol)
Descriptors.Chi2(mol)
Descriptors.Chi3(mol)
Descriptors.Chi4(mol)
```

### Chi0n, Chi1n, Chi2n, Chi3n, Chi4n
Valence-modified chi connectivity indices.
```python
Descriptors.Chi0n(mol)
Descriptors.Chi1n(mol)
Descriptors.Chi2n(mol)
Descriptors.Chi3n(mol)
Descriptors.Chi4n(mol)
```

### Chi0v, Chi1v, Chi2v, Chi3v, Chi4v
Valence chi connectivity indices.
```python
Descriptors.Chi0v(mol)
Descriptors.Chi1v(mol)
Descriptors.Chi2v(mol)
Descriptors.Chi3v(mol)
Descriptors.Chi4v(mol)
```

## Hall-Kier Alpha

### HallKierAlpha
Hall-Kier alpha value (molecular flexibility).
```python
Descriptors.HallKierAlpha(mol)
```

## Balaban's J Index

### BalabanJ
Balaban's J index (branching descriptor).
```python
Descriptors.BalabanJ(mol)
```

## EState Indices

Electrotopological state indices.

### MaxEStateIndex
Maximum E-state value.
```python
Descriptors.MaxEStateIndex(mol)
```

### MinEStateIndex
Minimum E-state value.
```python
Descriptors.MinEStateIndex(mol)
```

### MaxAbsEStateIndex
Maximum absolute E-state value.
```python
Descriptors.MaxAbsEStateIndex(mol)
```

### MinAbsEStateIndex
Minimum absolute E-state value.
```python
Descriptors.MinAbsEStateIndex(mol)
```

## Partial Charges

### MaxPartialCharge
Maximum partial charge.
```python
Descriptors.MaxPartialCharge(mol)
```

### MinPartialCharge
Minimum partial charge.
```python
Descriptors.MinPartialCharge(mol)
```

### MaxAbsPartialCharge
Maximum absolute partial charge.
```python
Descriptors.MaxAbsPartialCharge(mol)
```

### MinAbsPartialCharge
Minimum absolute partial charge.
```python
Descriptors.MinAbsPartialCharge(mol)
```

## Fingerprint Density

Measures the density of molecular fingerprints.

### FpDensityMorgan1
Morgan fingerprint density at radius 1.
```python
Descriptors.FpDensityMorgan1(mol)
```

### FpDensityMorgan2
Morgan fingerprint density at radius 2.
```python
Descriptors.FpDensityMorgan2(mol)
```

### FpDensityMorgan3
Morgan fingerprint density at radius 3.
```python
Descriptors.FpDensityMorgan3(mol)
```

## PEOE VSA Descriptors

Partial Equalization of Orbital Electronegativities (PEOE) VSA descriptors.

### PEOE_VSA1 through PEOE_VSA14
MOE-type descriptors using partial charges and surface area contributions.
```python
Descriptors.PEOE_VSA1(mol)
# ... through PEOE_VSA14
```

## SMR VSA Descriptors

Molecular refractivity VSA descriptors.

### SMR_VSA1 through SMR_VSA10
MOE-type descriptors using MR contributions and surface area.
```python
Descriptors.SMR_VSA1(mol)
# ... through SMR_VSA10
```

## SLogP VSA Descriptors

LogP VSA descriptors.

### SLogP_VSA1 through SLogP_VSA12
MOE-type descriptors using LogP contributions and surface area.
```python
Descriptors.SLogP_VSA1(mol)
# ... through SLogP_VSA12
```

## EState VSA Descriptors

### EState_VSA1 through EState_VSA11
MOE-type descriptors using E-state indices and surface area.
```python
Descriptors.EState_VSA1(mol)
# ... through EState_VSA11
```

## VSA Descriptors

van der Waals surface area descriptors.

### VSA_EState1 through VSA_EState10
EState VSA descriptors.
```python
Descriptors.VSA_EState1(mol)
# ... through VSA_EState10
```

## BCUT Descriptors

Burden-CAS-University of Texas eigenvalue descriptors.

### BCUT2D_MWHI
Highest eigenvalue of Burden matrix weighted by molecular weight.
```python
Descriptors.BCUT2D_MWHI(mol)
```

### BCUT2D_MWLOW
Lowest eigenvalue of Burden matrix weighted by molecular weight.
```python
Descriptors.BCUT2D_MWLOW(mol)
```

### BCUT2D_CHGHI
Highest eigenvalue weighted by partial charges.
```python
Descriptors.BCUT2D_CHGHI(mol)
```

### BCUT2D_CHGLO
Lowest eigenvalue weighted by partial charges.
```python
Descriptors.BCUT2D_CHGLO(mol)
```

### BCUT2D_LOGPHI
Highest eigenvalue weighted by LogP.
```python
Descriptors.BCUT2D_LOGPHI(mol)
```

### BCUT2D_LOGPLOW
Lowest eigenvalue weighted by LogP.
```python
Descriptors.BCUT2D_LOGPLOW(mol)
```

### BCUT2D_MRHI
Highest eigenvalue weighted by molar refractivity.
```python
Descriptors.BCUT2D_MRHI(mol)
```

### BCUT2D_MRLOW
Lowest eigenvalue weighted by molar refractivity.
```python
Descriptors.BCUT2D_MRLOW(mol)
```

## Autocorrelation Descriptors

### AUTOCORR2D
2D autocorrelation descriptors (if enabled).
Various autocorrelation indices measuring spatial distribution of properties.

## MQN Descriptors

Molecular Quantum Numbers - 42 simple descriptors.

### mqn1 through mqn42
Integer descriptors counting various molecular features.
```python
# Access via CalcMolDescriptors
desc = Descriptors.CalcMolDescriptors(mol)
mqns = {k: v for k, v in desc.items() if k.startswith('mqn')}
```

## QED

### qed
Quantitative Estimate of Drug-likeness.
```python
Descriptors.qed(mol)
```

## Lipinski's Rule of Five

Check drug-likeness using Lipinski's criteria:

```python
def lipinski_rule_of_five(mol):
    mw = Descriptors.MolWt(mol) <= 500
    logp = Descriptors.MolLogP(mol) <= 5
    hbd = Descriptors.NumHDonors(mol) <= 5
    hba = Descriptors.NumHAcceptors(mol) <= 10
    return mw and logp and hbd and hba
```

## Batch Descriptor Calculation

Calculate all descriptors at once:

```python
from rdkit import Chem
from rdkit.Chem import Descriptors

mol = Chem.MolFromSmiles('CCO')

# Get all descriptors as dictionary
all_descriptors = Descriptors.CalcMolDescriptors(mol)

# Access specific descriptor
mw = all_descriptors['MolWt']
logp = all_descriptors['MolLogP']

# Get list of available descriptor names
from rdkit.Chem import Descriptors
descriptor_names = [desc[0] for desc in Descriptors._descList]
```

## Descriptor Categories Summary

1. **Physicochemical**: MolWt, MolLogP, MolMR, TPSA
2. **Topological**: BertzCT, BalabanJ, Kappa indices
3. **Electronic**: Partial charges, E-state indices
4. **Shape**: Kappa indices, BCUT descriptors
5. **Connectivity**: Chi indices
6. **2D Fingerprints**: FpDensity descriptors
7. **Atom counts**: Heavy atoms, heteroatoms, rings
8. **Drug-likeness**: QED, Lipinski parameters
9. **Flexibility**: NumRotatableBonds, HallKierAlpha
10. **Surface area**: VSA-based descriptors

## Common Use Cases

### Drug-likeness Screening

```python
def screen_druglikeness(mol):
    return {
        'MW': Descriptors.MolWt(mol),
        'LogP': Descriptors.MolLogP(mol),
        'HBD': Descriptors.NumHDonors(mol),
        'HBA': Descriptors.NumHAcceptors(mol),
        'TPSA': Descriptors.TPSA(mol),
        'RotBonds': Descriptors.NumRotatableBonds(mol),
        'AromaticRings': Descriptors.NumAromaticRings(mol),
        'QED': Descriptors.qed(mol)
    }
```

### Lead-like Filtering

```python
def is_leadlike(mol):
    mw = 250 <= Descriptors.MolWt(mol) <= 350
    logp = Descriptors.MolLogP(mol) <= 3.5
    rot_bonds = Descriptors.NumRotatableBonds(mol) <= 7
    return mw and logp and rot_bonds
```

### Diversity Analysis

```python
def molecular_complexity(mol):
    return {
        'BertzCT': Descriptors.BertzCT(mol),
        'NumRings': Descriptors.RingCount(mol),
        'NumRotBonds': Descriptors.NumRotatableBonds(mol),
        'FractionCsp3': Descriptors.FractionCsp3(mol),
        'NumAromaticRings': Descriptors.NumAromaticRings(mol)
    }
```

## Tips

1. **Use batch calculation** for multiple descriptors to avoid redundant computations
2. **Check for None** - some descriptors may return None for invalid molecules
3. **Normalize descriptors** for machine learning applications
4. **Select relevant descriptors** - not all 200+ descriptors are useful for every task
5. **Consider 3D descriptors** separately (require 3D coordinates)
6. **Validate ranges** - check if descriptor values are in expected ranges
