# Datamol Conformers Module Reference

The `datamol.conformers` module provides tools for generating and analyzing 3D molecular conformations.

## Conformer Generation

### `dm.conformers.generate(mol, n_confs=None, rms_cutoff=None, minimize_energy=True, method='ETKDGv3', add_hs=True, ...)`
Generate 3D molecular conformers.
- **Parameters**:
  - `mol`: Input molecule
  - `n_confs`: Number of conformers to generate (auto-determined based on rotatable bonds if None)
  - `rms_cutoff`: RMS threshold in Ångströms for filtering similar conformers (removes duplicates)
  - `minimize_energy`: Apply UFF energy minimization (default: True)
  - `method`: Embedding method - options:
    - `'ETDG'` - Experimental Torsion Distance Geometry
    - `'ETKDG'` - ETDG with additional basic knowledge
    - `'ETKDGv2'` - Enhanced version 2
    - `'ETKDGv3'` - Enhanced version 3 (default, recommended)
  - `add_hs`: Add hydrogens before embedding (default: True, critical for quality)
  - `random_seed`: Set for reproducibility
- **Returns**: Molecule with embedded conformers
- **Example**:
  ```python
  mol = dm.to_mol("CCO")
  mol_3d = dm.conformers.generate(mol, n_confs=10, rms_cutoff=0.5)
  conformers = mol_3d.GetConformers()  # Access all conformers
  ```

## Conformer Clustering

### `dm.conformers.cluster(mol, rms_cutoff=1.0, already_aligned=False, centroids=False)`
Group conformers by RMS distance.
- **Parameters**:
  - `rms_cutoff`: Clustering threshold in Ångströms (default: 1.0)
  - `already_aligned`: Whether conformers are pre-aligned
  - `centroids`: Return centroid conformers (True) or cluster groups (False)
- **Returns**: Cluster information or centroid conformers
- **Use case**: Identify distinct conformational families

### `dm.conformers.return_centroids(mol, conf_clusters, centroids=True)`
Extract representative conformers from clusters.
- **Parameters**:
  - `conf_clusters`: Sequence of cluster indices from `cluster()`
  - `centroids`: Return single molecule (True) or list of molecules (False)
- **Returns**: Centroid conformer(s)

## Conformer Analysis

### `dm.conformers.rmsd(mol)`
Calculate pairwise RMSD matrix across all conformers.
- **Requirements**: Minimum 2 conformers
- **Returns**: NxN matrix of RMSD values
- **Use case**: Quantify conformer diversity

### `dm.conformers.sasa(mol, n_jobs=1, ...)`
Calculate Solvent Accessible Surface Area (SASA) using FreeSASA.
- **Parameters**:
  - `n_jobs`: Parallelization for multiple conformers
- **Returns**: Array of SASA values (one per conformer)
- **Storage**: Values stored in each conformer as property `'rdkit_free_sasa'`
- **Example**:
  ```python
  sasa_values = dm.conformers.sasa(mol_3d)
  # Or access from conformer properties
  conf = mol_3d.GetConformer(0)
  sasa = conf.GetDoubleProp('rdkit_free_sasa')
  ```

## Low-Level Conformer Manipulation

### `dm.conformers.center_of_mass(mol, conf_id=-1, use_atoms=True, round_coord=None)`
Calculate molecular center.
- **Parameters**:
  - `conf_id`: Conformer index (-1 for first conformer)
  - `use_atoms`: Use atomic masses (True) or geometric center (False)
  - `round_coord`: Decimal precision for rounding
- **Returns**: 3D coordinates of center
- **Use case**: Centering molecules for visualization or alignment

### `dm.conformers.get_coords(mol, conf_id=-1)`
Retrieve atomic coordinates from a conformer.
- **Returns**: Nx3 numpy array of atomic positions
- **Example**:
  ```python
  positions = dm.conformers.get_coords(mol_3d, conf_id=0)
  # positions.shape: (num_atoms, 3)
  ```

### `dm.conformers.translate(mol, conf_id=-1, transform_matrix=None)`
Reposition conformer using transformation matrix.
- **Modification**: Operates in-place
- **Use case**: Aligning or repositioning molecules

## Workflow Example

```python
import datamol as dm

# 1. Create molecule and generate conformers
mol = dm.to_mol("CC(C)CCO")  # Isopentanol
mol_3d = dm.conformers.generate(
    mol,
    n_confs=50,           # Generate 50 initial conformers
    rms_cutoff=0.5,       # Filter similar conformers
    minimize_energy=True   # Minimize energy
)

# 2. Analyze conformers
n_conformers = mol_3d.GetNumConformers()
print(f"Generated {n_conformers} unique conformers")

# 3. Calculate SASA
sasa_values = dm.conformers.sasa(mol_3d)

# 4. Cluster conformers
clusters = dm.conformers.cluster(mol_3d, rms_cutoff=1.0, centroids=False)

# 5. Get representative conformers
centroids = dm.conformers.return_centroids(mol_3d, clusters)

# 6. Access 3D coordinates
coords = dm.conformers.get_coords(mol_3d, conf_id=0)
```

## Key Concepts

- **Distance Geometry**: Method for generating 3D structures from connectivity information
- **ETKDG**: Uses experimental torsion angle preferences and additional chemical knowledge
- **RMS Cutoff**: Lower values = more unique conformers; higher values = fewer, more distinct conformers
- **Energy Minimization**: Relaxes structures to nearest local energy minimum
- **Hydrogens**: Critical for accurate 3D geometry - always include during embedding
