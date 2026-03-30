# Common SMARTS Patterns for RDKit

This document provides a collection of commonly used SMARTS patterns for substructure searching in RDKit.

## Functional Groups

### Alcohols

```python
# Primary alcohol
'[CH2][OH1]'

# Secondary alcohol
'[CH1]([OH1])[CH3,CH2]'

# Tertiary alcohol
'[C]([OH1])([C])([C])[C]'

# Any alcohol
'[OH1][C]'

# Phenol
'c[OH1]'
```

### Aldehydes and Ketones

```python
# Aldehyde
'[CH1](=O)'

# Ketone
'[C](=O)[C]'

# Any carbonyl
'[C](=O)'
```

### Carboxylic Acids and Derivatives

```python
# Carboxylic acid
'C(=O)[OH1]'
'[CX3](=O)[OX2H1]'  # More specific

# Ester
'C(=O)O[C]'
'[CX3](=O)[OX2][C]'  # More specific

# Amide
'C(=O)N'
'[CX3](=O)[NX3]'  # More specific

# Acyl chloride
'C(=O)Cl'

# Anhydride
'C(=O)OC(=O)'
```

### Amines

```python
# Primary amine
'[NH2][C]'

# Secondary amine
'[NH1]([C])[C]'

# Tertiary amine
'[N]([C])([C])[C]'

# Aromatic amine (aniline)
'c[NH2]'

# Any amine
'[NX3]'
```

### Ethers

```python
# Aliphatic ether
'[C][O][C]'

# Aromatic ether
'c[O][C,c]'
```

### Halides

```python
# Alkyl halide
'[C][F,Cl,Br,I]'

# Aryl halide
'c[F,Cl,Br,I]'

# Specific halides
'[C]F'  # Fluoride
'[C]Cl'  # Chloride
'[C]Br'  # Bromide
'[C]I'  # Iodide
```

### Nitriles and Nitro Groups

```python
# Nitrile
'C#N'

# Nitro group
'[N+](=O)[O-]'

# Nitro on aromatic
'c[N+](=O)[O-]'
```

### Thiols and Sulfides

```python
# Thiol
'[C][SH1]'

# Sulfide
'[C][S][C]'

# Disulfide
'[C][S][S][C]'

# Sulfoxide
'[C][S](=O)[C]'

# Sulfone
'[C][S](=O)(=O)[C]'
```

## Ring Systems

### Simple Rings

```python
# Benzene ring
'c1ccccc1'
'[#6]1:[#6]:[#6]:[#6]:[#6]:[#6]:1'  # Explicit atoms

# Cyclohexane
'C1CCCCC1'

# Cyclopentane
'C1CCCC1'

# Any 3-membered ring
'[r3]'

# Any 4-membered ring
'[r4]'

# Any 5-membered ring
'[r5]'

# Any 6-membered ring
'[r6]'

# Any 7-membered ring
'[r7]'
```

### Aromatic Rings

```python
# Aromatic carbon in ring
'[cR]'

# Aromatic nitrogen in ring (pyridine, etc.)
'[nR]'

# Aromatic oxygen in ring (furan, etc.)
'[oR]'

# Aromatic sulfur in ring (thiophene, etc.)
'[sR]'

# Any aromatic ring
'a1aaaaa1'
```

### Heterocycles

```python
# Pyridine
'n1ccccc1'

# Pyrrole
'n1cccc1'

# Furan
'o1cccc1'

# Thiophene
's1cccc1'

# Imidazole
'n1cncc1'

# Pyrimidine
'n1cnccc1'

# Thiazole
'n1ccsc1'

# Oxazole
'n1ccoc1'
```

### Fused Rings

```python
# Naphthalene
'c1ccc2ccccc2c1'

# Indole
'c1ccc2[nH]ccc2c1'

# Quinoline
'n1cccc2ccccc12'

# Benzimidazole
'c1ccc2[nH]cnc2c1'

# Purine
'n1cnc2ncnc2c1'
```

### Macrocycles

```python
# Rings with 8 or more atoms
'[r{8-}]'

# Rings with 9-15 atoms
'[r{9-15}]'

# Rings with more than 12 atoms (macrocycles)
'[r{12-}]'
```

## Specific Structural Features

### Aliphatic vs Aromatic

```python
# Aliphatic carbon
'[C]'

# Aromatic carbon
'[c]'

# Aliphatic carbon in ring
'[CR]'

# Aromatic carbon (alternative)
'[cR]'
```

### Stereochemistry

```python
# Tetrahedral center with clockwise chirality
'[C@]'

# Tetrahedral center with counterclockwise chirality
'[C@@]'

# Any chiral center
'[C@,C@@]'

# E double bond
'C/C=C/C'

# Z double bond
'C/C=C\\C'
```

### Hybridization

```python
# SP hybridization (triple bond)
'[CX2]'

# SP2 hybridization (double bond or aromatic)
'[CX3]'

# SP3 hybridization (single bonds)
'[CX4]'
```

### Charge

```python
# Positive charge
'[+]'

# Negative charge
'[-]'

# Specific charge
'[+1]'
'[-1]'
'[+2]'

# Positively charged nitrogen
'[N+]'

# Negatively charged oxygen
'[O-]'

# Carboxylate anion
'C(=O)[O-]'

# Ammonium cation
'[N+]([C])([C])([C])[C]'
```

## Pharmacophore Features

### Hydrogen Bond Donors

```python
# Hydroxyl
'[OH]'

# Amine
'[NH,NH2]'

# Amide NH
'[N][C](=O)'

# Any H-bond donor
'[OH,NH,NH2,NH3+]'
```

### Hydrogen Bond Acceptors

```python
# Carbonyl oxygen
'[O]=[C,S,P]'

# Ether oxygen
'[OX2]'

# Ester oxygen
'C(=O)[O]'

# Nitrogen acceptor
'[N;!H0]'

# Any H-bond acceptor
'[O,N]'
```

### Hydrophobic Groups

```python
# Alkyl chain (4+ carbons)
'CCCC'

# Branched alkyl
'C(C)(C)C'

# Aromatic rings (hydrophobic)
'c1ccccc1'
```

### Aromatic Interactions

```python
# Benzene for pi-pi stacking
'c1ccccc1'

# Heterocycle for pi-pi
'[a]1[a][a][a][a][a]1'

# Any aromatic ring
'[aR]'
```

## Drug-like Fragments

### Lipinski Fragments

```python
# Aromatic ring with substituents
'c1cc(*)ccc1'

# Aliphatic chain
'CCCC'

# Ether linkage
'[C][O][C]'

# Amine (basic center)
'[N]([C])([C])'
```

### Common Scaffolds

```python
# Benzamide
'c1ccccc1C(=O)N'

# Sulfonamide
'S(=O)(=O)N'

# Urea
'[N][C](=O)[N]'

# Guanidine
'[N]C(=[N])[N]'

# Phosphate
'P(=O)([O-])([O-])[O-]'
```

### Privileged Structures

```python
# Biphenyl
'c1ccccc1-c2ccccc2'

# Benzopyran
'c1ccc2OCCCc2c1'

# Piperazine
'N1CCNCC1'

# Piperidine
'N1CCCCC1'

# Morpholine
'N1CCOCC1'
```

## Reactive Groups

### Electrophiles

```python
# Acyl chloride
'C(=O)Cl'

# Alkyl halide
'[C][Cl,Br,I]'

# Epoxide
'C1OC1'

# Michael acceptor
'C=C[C](=O)'
```

### Nucleophiles

```python
# Primary amine
'[NH2][C]'

# Thiol
'[SH][C]'

# Alcohol
'[OH][C]'
```

## Toxicity Alerts (PAINS)

```python
# Rhodanine
'S1C(=O)NC(=S)C1'

# Catechol
'c1ccc(O)c(O)c1'

# Quinone
'O=C1C=CC(=O)C=C1'

# Hydroquinone
'OC1=CC=C(O)C=C1'

# Alkyl halide (reactive)
'[C][I,Br]'

# Michael acceptor (reactive)
'C=CC(=O)[C,N]'
```

## Metal Binding

```python
# Carboxylate (metal chelator)
'C(=O)[O-]'

# Hydroxamic acid
'C(=O)N[OH]'

# Catechol (iron chelator)
'c1c(O)c(O)ccc1'

# Thiol (metal binding)
'[SH]'

# Histidine-like (metal binding)
'c1ncnc1'
```

## Size and Complexity Filters

```python
# Long aliphatic chains (>6 carbons)
'CCCCCCC'

# Highly branched (quaternary carbon)
'C(C)(C)(C)C'

# Multiple rings
'[R]~[R]'  # Two rings connected

# Spiro center
'[C]12[C][C][C]1[C][C]2'
```

## Special Patterns

### Atom Counts

```python
# Any atom
'[*]'

# Heavy atom (not H)
'[!H]'

# Carbon
'[C,c]'

# Heteroatom
'[!C;!H]'

# Halogen
'[F,Cl,Br,I]'
```

### Bond Types

```python
# Single bond
'C-C'

# Double bond
'C=C'

# Triple bond
'C#C'

# Aromatic bond
'c:c'

# Any bond
'C~C'
```

### Ring Membership

```python
# In any ring
'[R]'

# Not in ring
'[!R]'

# In exactly one ring
'[R1]'

# In exactly two rings
'[R2]'

# Ring bond
'[R]~[R]'
```

### Degree and Connectivity

```python
# Total degree 1 (terminal atom)
'[D1]'

# Total degree 2 (chain)
'[D2]'

# Total degree 3 (branch point)
'[D3]'

# Total degree 4 (highly branched)
'[D4]'

# Connected to exactly 2 carbons
'[C]([C])[C]'
```

## Usage Examples

```python
from rdkit import Chem

# Create SMARTS query
pattern = Chem.MolFromSmarts('[CH2][OH1]')  # Primary alcohol

# Search molecule
mol = Chem.MolFromSmiles('CCO')
matches = mol.GetSubstructMatches(pattern)

# Multiple patterns
patterns = {
    'alcohol': '[OH1][C]',
    'amine': '[NH2,NH1][C]',
    'carboxylic_acid': 'C(=O)[OH1]'
}

# Check for functional groups
for name, smarts in patterns.items():
    query = Chem.MolFromSmarts(smarts)
    if mol.HasSubstructMatch(query):
        print(f"Found {name}")
```

## Tips for Writing SMARTS

1. **Be specific when needed:** Use atom properties [CX3] instead of just [C]
2. **Use brackets for clarity:** [C] is different from C (aromatic)
3. **Consider aromaticity:** lowercase letters (c, n, o) are aromatic
4. **Check ring membership:** [R] for in-ring, [!R] for not in-ring
5. **Use recursive SMARTS:** $(...) for complex patterns
6. **Test patterns:** Always validate SMARTS on known molecules
7. **Start simple:** Build complex patterns incrementally

## Common SMARTS Syntax

- `[C]` - Aliphatic carbon
- `[c]` - Aromatic carbon
- `[CX4]` - Carbon with 4 connections (sp3)
- `[CX3]` - Carbon with 3 connections (sp2)
- `[CX2]` - Carbon with 2 connections (sp)
- `[CH3]` - Methyl group
- `[R]` - In ring
- `[r6]` - In 6-membered ring
- `[r{5-7}]` - In 5, 6, or 7-membered ring
- `[D2]` - Degree 2 (2 neighbors)
- `[+]` - Positive charge
- `[-]` - Negative charge
- `[!C]` - Not carbon
- `[#6]` - Element with atomic number 6 (carbon)
- `~` - Any bond type
- `-` - Single bond
- `=` - Double bond
- `#` - Triple bond
- `:` - Aromatic bond
- `@` - Clockwise chirality
- `@@` - Counter-clockwise chirality
