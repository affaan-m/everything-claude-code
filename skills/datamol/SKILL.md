---
name: datamol
description: Pythonic wrapper around RDKit with simplified interface and sensible defaults. Preferred for standard drug discovery including SMILES parsing, standardization, descriptors, fingerprints, clustering, 3D conformers, parallel processing. Returns native rdkit.Chem.Mol objects. For advanced control or custom parameters, use rdkit directly.
license: Apache-2.0 license
metadata:
    skill-author: K-Dense Inc.
---

# Datamol Cheminformatics Skill

## Overview

Datamol is a Python library that provides a lightweight, Pythonic abstraction layer over RDKit for molecular cheminformatics. Simplify complex molecular operations with sensible defaults, efficient parallelization, and modern I/O capabilities. All molecular objects are native `rdkit.Chem.Mol` instances, ensuring full compatibility with the RDKit ecosystem.

**Key capabilities**:
- Molecular format conversion (SMILES, SELFIES, InChI)
- Structure standardization and sanitization
- Molecular descriptors and fingerprints
- 3D conformer generation and analysis
- Clustering and diversity selection
- Scaffold and fragment analysis
- Chemical reaction application
- Visualization and alignment
- Batch processing with parallelization
- Cloud storage support via fsspec

## Installation and Setup

Guide users to install datamol:

```bash
uv pip install datamol
```

**Import convention**:
```python
import datamol as dm
```

## Core Workflows

### 1. Basic Molecule Handling

**Creating molecules from SMILES**:
```python
import datamol as dm

# Single molecule
mol = dm.to_mol("CCO")  # Ethanol

# From list of SMILES
smiles_list = ["CCO", "c1ccccc1", "CC(=O)O"]
mols = [dm.to_mol(smi) for smi in smiles_list]

# Error handling
mol = dm.to_mol("invalid_smiles")  # Returns None
if mol is None:
    print("Failed to parse SMILES")
```

**Converting molecules to SMILES**:
```python
# Canonical SMILES
smiles = dm.to_smiles(mol)

# Isomeric SMILES (includes stereochemistry)
smiles = dm.to_smiles(mol, isomeric=True)

# Other formats
inchi = dm.to_inchi(mol)
inchikey = dm.to_inchikey(mol)
selfies = dm.to_selfies(mol)
```

**Standardization and sanitization** (always recommend for user-provided molecules):
```python
# Sanitize molecule
mol = dm.sanitize_mol(mol)

# Full standardization (recommended for datasets)
mol = dm.standardize_mol(
    mol,
    disconnect_metals=True,
    normalize=True,
    reionize=True
)

# For SMILES strings directly
clean_smiles = dm.standardize_smiles(smiles)
```

### 2. Reading and Writing Molecular Files

Refer to `references/io_module.md` for comprehensive I/O documentation.

**Reading files**:
```python
# SDF files (most common in chemistry)
df = dm.read_sdf("compounds.sdf", mol_column='mol')

# SMILES files
df = dm.read_smi("molecules.smi", smiles_column='smiles', mol_column='mol')

# CSV with SMILES column
df = dm.read_csv("data.csv", smiles_column="SMILES", mol_column="mol")

# Excel files
df = dm.read_excel("compounds.xlsx", sheet_name=0, mol_column="mol")

# Universal reader (auto-detects format)
df = dm.open_df("file.sdf")  # Works with .sdf, .csv, .xlsx, .parquet, .json
```

**Writing files**:
```python
# Save as SDF
dm.to_sdf(mols, "output.sdf")
# Or from DataFrame
dm.to_sdf(df, "output.sdf", mol_column="mol")

# Save as SMILES file
dm.to_smi(mols, "output.smi")

# Excel with rendered molecule images
dm.to_xlsx(df, "output.xlsx", mol_columns=["mol"])
```

**Remote file support** (S3, GCS, HTTP):
```python
# Read from cloud storage
df = dm.read_sdf("s3://bucket/compounds.sdf")
df = dm.read_csv("https://example.com/data.csv")

# Write to cloud storage
dm.to_sdf(mols, "s3://bucket/output.sdf")
```

### 3. Molecular Descriptors and Properties

Refer to `references/descriptors_viz.md` for detailed descriptor documentation.

**Computing descriptors for a single molecule**:
```python
# Get standard descriptor set
descriptors = dm.descriptors.compute_many_descriptors(mol)
# Returns: {'mw': 46.07, 'logp': -0.03, 'hbd': 1, 'hba': 1,
#           'tpsa': 20.23, 'n_aromatic_atoms': 0, ...}
```

**Batch descriptor computation** (recommended for datasets):
```python
# Compute for all molecules in parallel
desc_df = dm.descriptors.batch_compute_many_descriptors(
    mols,
    n_jobs=-1,      # Use all CPU cores
    progress=True   # Show progress bar
)
```

**Specific descriptors**:
```python
# Aromaticity
n_aromatic = dm.descriptors.n_aromatic_atoms(mol)
aromatic_ratio = dm.descriptors.n_aromatic_atoms_proportion(mol)

# Stereochemistry
n_stereo = dm.descriptors.n_stereo_centers(mol)
n_unspec = dm.descriptors.n_stereo_centers_unspecified(mol)

# Flexibility
n_rigid = dm.descriptors.n_rigid_bonds(mol)
```

**Drug-likeness filtering (Lipinski's Rule of Five)**:
```python
# Filter compounds
def is_druglike(mol):
    desc = dm.descriptors.compute_many_descriptors(mol)
    return (
        desc['mw'] <= 500 and
        desc['logp'] <= 5 and
        desc['hbd'] <= 5 and
        desc['hba'] <= 10
    )

druglike_mols = [mol for mol in mols if is_druglike(mol)]
```

### 4. Molecular Fingerprints and Similarity

**Generating fingerprints**:
```python
# ECFP (Extended Connectivity Fingerprint, default)
fp = dm.to_fp(mol, fp_type='ecfp', radius=2, n_bits=2048)

# Other fingerprint types
fp_maccs = dm.to_fp(mol, fp_type='maccs')
fp_topological = dm.to_fp(mol, fp_type='topological')
fp_atompair = dm.to_fp(mol, fp_type='atompair')
```

**Similarity calculations**:
```python
# Pairwise distances within a set
distance_matrix = dm.pdist(mols, n_jobs=-1)

# Distances between two sets
distances = dm.cdist(query_mols, library_mols, n_jobs=-1)

# Find most similar molecules
from scipy.spatial.distance import squareform
dist_matrix = squareform(dm.pdist(mols))
# Lower distance = higher similarity (Tanimoto distance = 1 - Tanimoto similarity)
```

### 5. Clustering and Diversity Selection

Refer to `references/core_api.md` for clustering details.

**Butina clustering**:
```python
# Cluster molecules by structural similarity
clusters = dm.cluster_mols(
    mols,
    cutoff=0.2,    # Tanimoto distance threshold (0=identical, 1=completely different)
    n_jobs=-1      # Parallel processing
)

# Each cluster is a list of molecule indices
for i, cluster in enumerate(clusters):
    print(f"Cluster {i}: {len(cluster)} molecules")
    cluster_mols = [mols[idx] for idx in cluster]
```

**Important**: Butina clustering builds a full distance matrix - suitable for ~1000 molecules, not for 10,000+.

**Diversity selection**:
```python
# Pick diverse subset
diverse_mols = dm.pick_diverse(
    mols,
    npick=100  # Select 100 diverse molecules
)

# Pick cluster centroids
centroids = dm.pick_centroids(
    mols,
    npick=50   # Select 50 representative molecules
)
```

### 6. Scaffold Analysis

Refer to `references/fragments_scaffolds.md` for complete scaffold documentation.

**Extracting Murcko scaffolds**:
```python
# Get Bemis-Murcko scaffold (core structure)
scaffold = dm.to_scaffold_murcko(mol)
scaffold_smiles = dm.to_smiles(scaffold)
```

**Scaffold-based analysis**:
```python
# Group compounds by scaffold
from collections import Counter

scaffolds = [dm.to_scaffold_murcko(mol) for mol in mols]
scaffold_smiles = [dm.to_smiles(s) for s in scaffolds]

# Count scaffold frequency
scaffold_counts = Counter(scaffold_smiles)
most_common = scaffold_counts.most_common(10)

# Create scaffold-to-molecules mapping
scaffold_groups = {}
for mol, scaf_smi in zip(mols, scaffold_smiles):
    if scaf_smi not in scaffold_groups:
        scaffold_groups[scaf_smi] = []
    scaffold_groups[scaf_smi].append(mol)
```

**Scaffold-based train/test splitting** (for ML):
```python
# Ensure train and test sets have different scaffolds
scaffold_to_mols = {}
for mol, scaf in zip(mols, scaffold_smiles):
    if scaf not in scaffold_to_mols:
        scaffold_to_mols[scaf] = []
    scaffold_to_mols[scaf].append(mol)

# Split scaffolds into train/test
import random
scaffolds = list(scaffold_to_mols.keys())
random.shuffle(scaffolds)
split_idx = int(0.8 * len(scaffolds))
train_scaffolds = scaffolds[:split_idx]
test_scaffolds = scaffolds[split_idx:]

# Get molecules for each split
train_mols = [mol for scaf in train_scaffolds for mol in scaffold_to_mols[scaf]]
test_mols = [mol for scaf in test_scaffolds for mol in scaffold_to_mols[scaf]]
```

### 7. Molecular Fragmentation

Refer to `references/fragments_scaffolds.md` for fragmentation details.

**BRICS fragmentation** (16 bond types):
```python
# Fragment molecule
fragments = dm.fragment.brics(mol)
# Returns: set of fragment SMILES with attachment points like '[1*]CCN'
```

**RECAP fragmentation** (11 bond types):
```python
fragments = dm.fragment.recap(mol)
```

**Fragment analysis**:
```python
# Find common fragments across compound library
from collections import Counter

all_fragments = []
for mol in mols:
    frags = dm.fragment.brics(mol)
    all_fragments.extend(frags)

fragment_counts = Counter(all_fragments)
common_frags = fragment_counts.most_common(20)

# Fragment-based scoring
def fragment_score(mol, reference_fragments):
    mol_frags = dm.fragment.brics(mol)
    overlap = mol_frags.intersection(reference_fragments)
    return len(overlap) / len(mol_frags) if mol_frags else 0
```

### 8. 3D Conformer Generation

Refer to `references/conformers_module.md` for detailed conformer documentation.

**Generating conformers**:
```python
# Generate 3D conformers
mol_3d = dm.conformers.generate(
    mol,
    n_confs=50,           # Number to generate (auto if None)
    rms_cutoff=0.5,       # Filter similar conformers (Ångströms)
    minimize_energy=True,  # Minimize with UFF force field
    method='ETKDGv3'      # Embedding method (recommended)
)

# Access conformers
n_conformers = mol_3d.GetNumConformers()
conf = mol_3d.GetConformer(0)  # Get first conformer
positions = conf.GetPositions()  # Nx3 array of atom coordinates
```

**Conformer clustering**:
```python
# Cluster conformers by RMSD
clusters = dm.conformers.cluster(
    mol_3d,
    rms_cutoff=1.0,
    centroids=False
)

# Get representative conformers
centroids = dm.conformers.return_centroids(mol_3d, clusters)
```

**SASA calculation**:
```python
# Calculate solvent accessible surface area
sasa_values = dm.conformers.sasa(mol_3d, n_jobs=-1)

# Access SASA from conformer properties
conf = mol_3d.GetConformer(0)
sasa = conf.GetDoubleProp('rdkit_free_sasa')
```

### 9. Visualization

Refer to `references/descriptors_viz.md` for visualization documentation.

**Basic molecule grid**:
```python
# Visualize molecules
dm.viz.to_image(
    mols[:20],
    legends=[dm.to_smiles(m) for m in mols[:20]],
    n_cols=5,
    mol_size=(300, 300)
)

# Save to file
dm.viz.to_image(mols, outfile="molecules.png")

# SVG for publications
dm.viz.to_image(mols, outfile="molecules.svg", use_svg=True)
```

**Aligned visualization** (for SAR analysis):
```python
# Align molecules by common substructure
dm.viz.to_image(
    similar_mols,
    align=True,  # Enable MCS alignment
    legends=activity_labels,
    n_cols=4
)
```

**Highlighting substructures**:
```python
# Highlight specific atoms and bonds
dm.viz.to_image(
    mol,
    highlight_atom=[0, 1, 2, 3],  # Atom indices
    highlight_bond=[0, 1, 2]      # Bond indices
)
```

**Conformer visualization**:
```python
# Display multiple conformers
dm.viz.conformers(
    mol_3d,
    n_confs=10,
    align_conf=True,
    n_cols=3
)
```

### 10. Chemical Reactions

Refer to `references/reactions_data.md` for reactions documentation.

**Applying reactions**:
```python
from rdkit.Chem import rdChemReactions

# Define reaction from SMARTS
rxn_smarts = '[C:1](=[O:2])[OH:3]>>[C:1](=[O:2])[Cl:3]'
rxn = rdChemReactions.ReactionFromSmarts(rxn_smarts)

# Apply to molecule
reactant = dm.to_mol("CC(=O)O")  # Acetic acid
product = dm.reactions.apply_reaction(
    rxn,
    (reactant,),
    sanitize=True
)

# Convert to SMILES
product_smiles = dm.to_smiles(product)
```

**Batch reaction application**:
```python
# Apply reaction to library
products = []
for mol in reactant_mols:
    try:
        prod = dm.reactions.apply_reaction(rxn, (mol,))
        if prod is not None:
            products.append(prod)
    except Exception as e:
        print(f"Reaction failed: {e}")
```

## Parallelization

Datamol includes built-in parallelization for many operations. Use `n_jobs` parameter:
- `n_jobs=1`: Sequential (no parallelization)
- `n_jobs=-1`: Use all available CPU cores
- `n_jobs=4`: Use 4 cores

**Functions supporting parallelization**:
- `dm.read_sdf(..., n_jobs=-1)`
- `dm.descriptors.batch_compute_many_descriptors(..., n_jobs=-1)`
- `dm.cluster_mols(..., n_jobs=-1)`
- `dm.pdist(..., n_jobs=-1)`
- `dm.conformers.sasa(..., n_jobs=-1)`

**Progress bars**: Many batch operations support `progress=True` parameter.

## Common Workflows and Patterns

### Complete Pipeline: Data Loading → Filtering → Analysis

```python
import datamol as dm
import pandas as pd

# 1. Load molecules
df = dm.read_sdf("compounds.sdf")

# 2. Standardize
df['mol'] = df['mol'].apply(lambda m: dm.standardize_mol(m) if m else None)
df = df[df['mol'].notna()]  # Remove failed molecules

# 3. Compute descriptors
desc_df = dm.descriptors.batch_compute_many_descriptors(
    df['mol'].tolist(),
    n_jobs=-1,
    progress=True
)

# 4. Filter by drug-likeness
druglike = (
    (desc_df['mw'] <= 500) &
    (desc_df['logp'] <= 5) &
    (desc_df['hbd'] <= 5) &
    (desc_df['hba'] <= 10)
)
filtered_df = df[druglike]

# 5. Cluster and select diverse subset
diverse_mols = dm.pick_diverse(
    filtered_df['mol'].tolist(),
    npick=100
)

# 6. Visualize results
dm.viz.to_image(
    diverse_mols,
    legends=[dm.to_smiles(m) for m in diverse_mols],
    outfile="diverse_compounds.png",
    n_cols=10
)
```

### Structure-Activity Relationship (SAR) Analysis

```python
# Group by scaffold
scaffolds = [dm.to_scaffold_murcko(mol) for mol in mols]
scaffold_smiles = [dm.to_smiles(s) for s in scaffolds]

# Create DataFrame with activities
sar_df = pd.DataFrame({
    'mol': mols,
    'scaffold': scaffold_smiles,
    'activity': activities  # User-provided activity data
})

# Analyze each scaffold series
for scaffold, group in sar_df.groupby('scaffold'):
    if len(group) >= 3:  # Need multiple examples
        print(f"\nScaffold: {scaffold}")
        print(f"Count: {len(group)}")
        print(f"Activity range: {group['activity'].min():.2f} - {group['activity'].max():.2f}")

        # Visualize with activities as legends
        dm.viz.to_image(
            group['mol'].tolist(),
            legends=[f"Activity: {act:.2f}" for act in group['activity']],
            align=True  # Align by common substructure
        )
```

### Virtual Screening Pipeline

```python
# 1. Generate fingerprints for query and library
query_fps = [dm.to_fp(mol) for mol in query_actives]
library_fps = [dm.to_fp(mol) for mol in library_mols]

# 2. Calculate similarities
from scipy.spatial.distance import cdist
import numpy as np

distances = dm.cdist(query_actives, library_mols, n_jobs=-1)

# 3. Find closest matches (min distance to any query)
min_distances = distances.min(axis=0)
similarities = 1 - min_distances  # Convert distance to similarity

# 4. Rank and select top hits
top_indices = np.argsort(similarities)[::-1][:100]  # Top 100
top_hits = [library_mols[i] for i in top_indices]
top_scores = [similarities[i] for i in top_indices]

# 5. Visualize hits
dm.viz.to_image(
    top_hits[:20],
    legends=[f"Sim: {score:.3f}" for score in top_scores[:20]],
    outfile="screening_hits.png"
)
```

## Reference Documentation

For detailed API documentation, consult these reference files:

- **`references/core_api.md`**: Core namespace functions (conversions, standardization, fingerprints, clustering)
- **`references/io_module.md`**: File I/O operations (read/write SDF, CSV, Excel, remote files)
- **`references/conformers_module.md`**: 3D conformer generation, clustering, SASA calculations
- **`references/descriptors_viz.md`**: Molecular descriptors and visualization functions
- **`references/fragments_scaffolds.md`**: Scaffold extraction, BRICS/RECAP fragmentation
- **`references/reactions_data.md`**: Chemical reactions and toy datasets

## Best Practices

1. **Always standardize molecules** from external sources:
   ```python
   mol = dm.standardize_mol(mol, disconnect_metals=True, normalize=True, reionize=True)
   ```

2. **Check for None values** after molecule parsing:
   ```python
   mol = dm.to_mol(smiles)
   if mol is None:
       # Handle invalid SMILES
   ```

3. **Use parallel processing** for large datasets:
   ```python
   result = dm.operation(..., n_jobs=-1, progress=True)
   ```

4. **Leverage fsspec** for cloud storage:
   ```python
   df = dm.read_sdf("s3://bucket/compounds.sdf")
   ```

5. **Use appropriate fingerprints** for similarity:
   - ECFP (Morgan): General purpose, structural similarity
   - MACCS: Fast, smaller feature space
   - Atom pairs: Considers atom pairs and distances

6. **Consider scale limitations**:
   - Butina clustering: ~1,000 molecules (full distance matrix)
   - For larger datasets: Use diversity selection or hierarchical methods

7. **Scaffold splitting for ML**: Ensure proper train/test separation by scaffold

8. **Align molecules** when visualizing SAR series

## Error Handling

```python
# Safe molecule creation
def safe_to_mol(smiles):
    try:
        mol = dm.to_mol(smiles)
        if mol is not None:
            mol = dm.standardize_mol(mol)
        return mol
    except Exception as e:
        print(f"Failed to process {smiles}: {e}")
        return None

# Safe batch processing
valid_mols = []
for smiles in smiles_list:
    mol = safe_to_mol(smiles)
    if mol is not None:
        valid_mols.append(mol)
```

## Integration with Machine Learning

```python
# Feature generation
X = np.array([dm.to_fp(mol) for mol in mols])

# Or descriptors
desc_df = dm.descriptors.batch_compute_many_descriptors(mols, n_jobs=-1)
X = desc_df.values

# Train model
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor()
model.fit(X, y_target)

# Predict
predictions = model.predict(X_test)
```

## Troubleshooting

**Issue**: Molecule parsing fails
- **Solution**: Use `dm.standardize_smiles()` first or try `dm.fix_mol()`

**Issue**: Memory errors with clustering
- **Solution**: Use `dm.pick_diverse()` instead of full clustering for large sets

**Issue**: Slow conformer generation
- **Solution**: Reduce `n_confs` or increase `rms_cutoff` to generate fewer conformers

**Issue**: Remote file access fails
- **Solution**: Ensure fsspec and appropriate cloud provider libraries are installed (s3fs, gcsfs, etc.)

## Additional Resources

- **Datamol Documentation**: https://docs.datamol.io/
- **RDKit Documentation**: https://www.rdkit.org/docs/
- **GitHub Repository**: https://github.com/datamol-io/datamol

