# Datamol Descriptors and Visualization Reference

## Descriptors Module (`datamol.descriptors`)

The descriptors module provides tools for computing molecular properties and descriptors.

### Specialized Descriptor Functions

#### `dm.descriptors.n_aromatic_atoms(mol)`
Calculate the number of aromatic atoms.
- **Returns**: Integer count
- **Use case**: Aromaticity analysis

#### `dm.descriptors.n_aromatic_atoms_proportion(mol)`
Calculate ratio of aromatic atoms to total heavy atoms.
- **Returns**: Float between 0 and 1
- **Use case**: Quantifying aromatic character

#### `dm.descriptors.n_charged_atoms(mol)`
Count atoms with nonzero formal charge.
- **Returns**: Integer count
- **Use case**: Charge distribution analysis

#### `dm.descriptors.n_rigid_bonds(mol)`
Count non-rotatable bonds (neither single bonds nor ring bonds).
- **Returns**: Integer count
- **Use case**: Molecular flexibility assessment

#### `dm.descriptors.n_stereo_centers(mol)`
Count stereogenic centers (chiral centers).
- **Returns**: Integer count
- **Use case**: Stereochemistry analysis

#### `dm.descriptors.n_stereo_centers_unspecified(mol)`
Count stereocenters lacking stereochemical specification.
- **Returns**: Integer count
- **Use case**: Identifying incomplete stereochemistry

### Batch Descriptor Computation

#### `dm.descriptors.compute_many_descriptors(mol, properties_fn=None, add_properties=True)`
Compute multiple molecular properties for a single molecule.
- **Parameters**:
  - `properties_fn`: Custom list of descriptor functions
  - `add_properties`: Include additional computed properties
- **Returns**: Dictionary of descriptor name → value pairs
- **Default descriptors include**:
  - Molecular weight, LogP, number of H-bond donors/acceptors
  - Aromatic atoms, stereocenters, rotatable bonds
  - TPSA (Topological Polar Surface Area)
  - Ring count, heteroatom count
- **Example**:
  ```python
  mol = dm.to_mol("CCO")
  descriptors = dm.descriptors.compute_many_descriptors(mol)
  # Returns: {'mw': 46.07, 'logp': -0.03, 'hbd': 1, 'hba': 1, ...}
  ```

#### `dm.descriptors.batch_compute_many_descriptors(mols, properties_fn=None, add_properties=True, n_jobs=1, batch_size=None, progress=False)`
Compute descriptors for multiple molecules in parallel.
- **Parameters**:
  - `mols`: List of molecules
  - `n_jobs`: Number of parallel jobs (-1 for all cores)
  - `batch_size`: Chunk size for parallel processing
  - `progress`: Show progress bar
- **Returns**: Pandas DataFrame with one row per molecule
- **Example**:
  ```python
  mols = [dm.to_mol(smi) for smi in smiles_list]
  df = dm.descriptors.batch_compute_many_descriptors(
      mols,
      n_jobs=-1,
      progress=True
  )
  ```

### RDKit Descriptor Access

#### `dm.descriptors.any_rdkit_descriptor(name)`
Retrieve any descriptor function from RDKit by name.
- **Parameters**: `name` - Descriptor function name (e.g., 'MolWt', 'TPSA')
- **Returns**: RDKit descriptor function
- **Available descriptors**: From `rdkit.Chem.Descriptors` and `rdkit.Chem.rdMolDescriptors`
- **Example**:
  ```python
  tpsa_fn = dm.descriptors.any_rdkit_descriptor('TPSA')
  tpsa_value = tpsa_fn(mol)
  ```

### Common Use Cases

**Drug-likeness Filtering (Lipinski's Rule of Five)**:
```python
descriptors = dm.descriptors.compute_many_descriptors(mol)
is_druglike = (
    descriptors['mw'] <= 500 and
    descriptors['logp'] <= 5 and
    descriptors['hbd'] <= 5 and
    descriptors['hba'] <= 10
)
```

**ADME Property Analysis**:
```python
df = dm.descriptors.batch_compute_many_descriptors(compound_library)
# Filter by TPSA for blood-brain barrier penetration
bbb_candidates = df[df['tpsa'] < 90]
```

---

## Visualization Module (`datamol.viz`)

The viz module provides tools for rendering molecules and conformers as images.

### Main Visualization Function

#### `dm.viz.to_image(mols, legends=None, n_cols=4, use_svg=False, mol_size=(200, 200), highlight_atom=None, highlight_bond=None, outfile=None, max_mols=None, copy=True, indices=False, ...)`
Generate image grid from molecules.
- **Parameters**:
  - `mols`: Single molecule or list of molecules
  - `legends`: String or list of strings as labels (one per molecule)
  - `n_cols`: Number of molecules per row (default: 4)
  - `use_svg`: Output SVG format (True) or PNG (False, default)
  - `mol_size`: Tuple (width, height) or single int for square images
  - `highlight_atom`: Atom indices to highlight (list or dict)
  - `highlight_bond`: Bond indices to highlight (list or dict)
  - `outfile`: Save path (local or remote, supports fsspec)
  - `max_mols`: Maximum number of molecules to display
  - `indices`: Draw atom indices on structures (default: False)
  - `align`: Align molecules using MCS (Maximum Common Substructure)
- **Returns**: Image object (can be displayed in Jupyter) or saves to file
- **Example**:
  ```python
  # Basic grid
  dm.viz.to_image(mols[:10], legends=[dm.to_smiles(m) for m in mols[:10]])

  # Save to file
  dm.viz.to_image(mols, outfile="molecules.png", n_cols=5)

  # Highlight substructure
  dm.viz.to_image(mol, highlight_atom=[0, 1, 2], highlight_bond=[0, 1])

  # Aligned visualization
  dm.viz.to_image(mols, align=True, legends=activity_labels)
  ```

### Conformer Visualization

#### `dm.viz.conformers(mol, n_confs=None, align_conf=True, n_cols=3, sync_views=True, remove_hs=True, ...)`
Display multiple conformers in grid layout.
- **Parameters**:
  - `mol`: Molecule with embedded conformers
  - `n_confs`: Number or list of conformer indices to display (None = all)
  - `align_conf`: Align conformers for comparison (default: True)
  - `n_cols`: Grid columns (default: 3)
  - `sync_views`: Synchronize 3D views when interactive (default: True)
  - `remove_hs`: Remove hydrogens for clarity (default: True)
- **Returns**: Grid of conformer visualizations
- **Use case**: Comparing conformational diversity
- **Example**:
  ```python
  mol_3d = dm.conformers.generate(mol, n_confs=20)
  dm.viz.conformers(mol_3d, n_confs=10, align_conf=True)
  ```

### Circle Grid Visualization

#### `dm.viz.circle_grid(center_mol, circle_mols, mol_size=200, circle_margin=50, act_mapper=None, ...)`
Create concentric ring visualization with central molecule.
- **Parameters**:
  - `center_mol`: Molecule at center
  - `circle_mols`: List of molecule lists (one list per ring)
  - `mol_size`: Image size per molecule
  - `circle_margin`: Spacing between rings (default: 50)
  - `act_mapper`: Activity mapping dictionary for color-coding
- **Returns**: Circular grid image
- **Use case**: Visualizing molecular neighborhoods, SAR analysis, similarity networks
- **Example**:
  ```python
  # Show a reference molecule surrounded by similar compounds
  dm.viz.circle_grid(
      center_mol=reference,
      circle_mols=[nearest_neighbors, second_tier]
  )
  ```

### Visualization Best Practices

1. **Use legends for clarity**: Always label molecules with SMILES, IDs, or activity values
2. **Align related molecules**: Use `align=True` in `to_image()` for SAR analysis
3. **Adjust grid size**: Set `n_cols` based on molecule count and display width
4. **Use SVG for publications**: Set `use_svg=True` for scalable vector graphics
5. **Highlight substructures**: Use `highlight_atom` and `highlight_bond` to emphasize features
6. **Save large grids**: Use `outfile` parameter to save rather than display in memory
