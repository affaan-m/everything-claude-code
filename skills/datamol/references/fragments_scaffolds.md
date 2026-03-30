# Datamol Fragments and Scaffolds Reference

## Scaffolds Module (`datamol.scaffold`)

Scaffolds represent the core structure of molecules, useful for identifying structural families and analyzing structure-activity relationships (SAR).

### Murcko Scaffolds

#### `dm.to_scaffold_murcko(mol)`
Extract Bemis-Murcko scaffold (molecular framework).
- **Method**: Removes side chains, retaining ring systems and linkers
- **Returns**: Molecule object representing the scaffold
- **Use case**: Identify core structures across compound series
- **Example**:
  ```python
  mol = dm.to_mol("c1ccc(cc1)CCN")  # Phenethylamine
  scaffold = dm.to_scaffold_murcko(mol)
  scaffold_smiles = dm.to_smiles(scaffold)
  # Returns: 'c1ccccc1CC' (benzene ring + ethyl linker)
  ```

**Workflow for scaffold analysis**:
```python
# Extract scaffolds from compound library
scaffolds = [dm.to_scaffold_murcko(mol) for mol in mols]
scaffold_smiles = [dm.to_smiles(s) for s in scaffolds]

# Count scaffold frequency
from collections import Counter
scaffold_counts = Counter(scaffold_smiles)
most_common = scaffold_counts.most_common(10)
```

### Fuzzy Scaffolds

#### `dm.scaffold.fuzzy_scaffolding(mol, ...)`
Generate fuzzy scaffolds with enforceable groups that must appear in the core.
- **Purpose**: More flexible scaffold definition allowing specified functional groups
- **Use case**: Custom scaffold definitions beyond Murcko rules

### Applications

**Scaffold-based splitting** (for ML model validation):
```python
# Group compounds by scaffold
scaffold_to_mols = {}
for mol, scaffold in zip(mols, scaffolds):
    smi = dm.to_smiles(scaffold)
    if smi not in scaffold_to_mols:
        scaffold_to_mols[smi] = []
    scaffold_to_mols[smi].append(mol)

# Ensure train/test sets have different scaffolds
```

**SAR analysis**:
```python
# Group by scaffold and analyze activity
for scaffold_smi, molecules in scaffold_to_mols.items():
    activities = [get_activity(mol) for mol in molecules]
    print(f"Scaffold: {scaffold_smi}, Mean activity: {np.mean(activities)}")
```

---

## Fragments Module (`datamol.fragment`)

Molecular fragmentation breaks molecules into smaller pieces based on chemical rules, useful for fragment-based drug design and substructure analysis.

### BRICS Fragmentation

#### `dm.fragment.brics(mol, ...)`
Fragment molecule using BRICS (Breaking Retrosynthetically Interesting Chemical Substructures).
- **Method**: Dissects based on 16 chemically meaningful bond types
- **Consideration**: Considers chemical environment and surrounding substructures
- **Returns**: Set of fragment SMILES strings
- **Use case**: Retrosynthetic analysis, fragment-based design
- **Example**:
  ```python
  mol = dm.to_mol("c1ccccc1CCN")
  fragments = dm.fragment.brics(mol)
  # Returns fragments like: '[1*]CCN', '[1*]c1ccccc1', etc.
  # [1*] represents attachment points
  ```

### RECAP Fragmentation

#### `dm.fragment.recap(mol, ...)`
Fragment molecule using RECAP (Retrosynthetic Combinatorial Analysis Procedure).
- **Method**: Dissects based on 11 predefined bond types
- **Rules**:
  - Leaves alkyl groups smaller than 5 carbons intact
  - Preserves cyclic bonds
- **Returns**: Set of fragment SMILES strings
- **Use case**: Combinatorial library design
- **Example**:
  ```python
  mol = dm.to_mol("CCCCCc1ccccc1")
  fragments = dm.fragment.recap(mol)
  ```

### MMPA Fragmentation

#### `dm.fragment.mmpa_frag(mol, ...)`
Fragment for Matched Molecular Pair Analysis.
- **Purpose**: Generate fragments suitable for identifying molecular pairs
- **Use case**: Analyzing how small structural changes affect properties
- **Example**:
  ```python
  fragments = dm.fragment.mmpa_frag(mol)
  # Used to find pairs of molecules differing by single transformation
  ```

### Comparison of Methods

| Method | Bond Types | Preserves Cycles | Best For |
|--------|-----------|------------------|----------|
| BRICS  | 16        | Yes              | Retrosynthetic analysis, fragment recombination |
| RECAP  | 11        | Yes              | Combinatorial library design |
| MMPA   | Variable  | Depends          | Structure-activity relationship analysis |

### Fragmentation Workflow

```python
import datamol as dm

# 1. Fragment a molecule
mol = dm.to_mol("CC(=O)Oc1ccccc1C(=O)O")  # Aspirin
brics_frags = dm.fragment.brics(mol)
recap_frags = dm.fragment.recap(mol)

# 2. Analyze fragment frequency across library
all_fragments = []
for mol in molecule_library:
    frags = dm.fragment.brics(mol)
    all_fragments.extend(frags)

# 3. Identify common fragments
from collections import Counter
fragment_counts = Counter(all_fragments)
common_fragments = fragment_counts.most_common(20)

# 4. Convert fragments back to molecules (remove attachment points)
def clean_fragment(frag_smiles):
    # Remove [1*], [2*], etc. attachment point markers
    clean = frag_smiles.replace('[1*]', '[H]')
    return dm.to_mol(clean)
```

### Advanced: Fragment-Based Virtual Screening

```python
# Build fragment library from known actives
active_fragments = set()
for active_mol in active_compounds:
    frags = dm.fragment.brics(active_mol)
    active_fragments.update(frags)

# Screen compounds for presence of active fragments
def score_by_fragments(mol, fragment_set):
    mol_frags = dm.fragment.brics(mol)
    overlap = mol_frags.intersection(fragment_set)
    return len(overlap) / len(mol_frags)

# Score screening library
scores = [score_by_fragments(mol, active_fragments) for mol in screening_lib]
```

### Key Concepts

- **Attachment Points**: Marked with [1*], [2*], etc. in fragment SMILES
- **Retrosynthetic**: Fragmentation mimics synthetic disconnections
- **Chemically Meaningful**: Breaks occur at typical synthetic bonds
- **Recombination**: Fragments can theoretically be recombined into valid molecules
