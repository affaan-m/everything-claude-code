# Rowan Workflow Types Reference

## Table of Contents

1. [Property Prediction Workflows](#property-prediction-workflows)
2. [Molecular Modeling Workflows](#molecular-modeling-workflows)
3. [Protein-Ligand Workflows](#protein-ligand-workflows)
4. [Spectroscopy Workflows](#spectroscopy-workflows)
5. [Advanced Workflows](#advanced-workflows)

---

## Property Prediction Workflows

### pKa Calculation

Predict acid dissociation constants.

```python
workflow = rowan.submit_pka_workflow(
    initial_molecule=mol,
    name="pKa calculation"
)
```

**Output:**
- `strongest_acid`: pKa of most acidic proton
- `strongest_base`: pKa of most basic site
- `microscopic_pkas`: List of site-specific pKa values
- `tautomer_populations`: Relative populations at pH 7

---

### Redox Potential

Calculate oxidation/reduction potentials.

```python
workflow = rowan.submit_redox_potential_workflow(
    initial_molecule=mol,
    name="redox potential"
)
```

**Output:**
- `oxidation_potential`: E° for oxidation (V vs SHE)
- `reduction_potential`: E° for reduction (V vs SHE)

---

### Solubility Prediction

Predict aqueous and nonaqueous solubility.

```python
workflow = rowan.submit_solubility_workflow(
    initial_molecule=mol,
    name="solubility"
)
```

**Output:**
- `aqueous_solubility`: Log S in water
- `solubility_class`: "High", "Medium", or "Low"

---

### Hydrogen-Bond Basicity

Calculate H-bond acceptor strength.

```python
workflow = rowan.submit_workflow(
    initial_molecule=mol,
    workflow_type="hydrogen_bond_basicity",
    workflow_data={},
    name="H-bond basicity"
)
```

**Output:**
- `hb_basicity`: pKBHX value

---

### Bond Dissociation Energy (BDE)

Calculate homolytic bond dissociation energies.

```python
workflow = rowan.submit_bde_workflow(
    initial_molecule=mol,
    bond_indices=(0, 1),  # Atom indices of bond
    name="BDE calculation"
)
```

**Output:**
- `bde`: Bond dissociation energy (kcal/mol)
- `radical_stability`: Stability of resulting radicals

---

### Fukui Indices

Calculate reactivity indices for nucleophilic/electrophilic attack.

```python
workflow = rowan.submit_fukui_workflow(
    initial_molecule=mol,
    name="Fukui indices"
)
```

**Output:**
- `fukui_plus`: Electrophilic attack susceptibility per atom
- `fukui_minus`: Nucleophilic attack susceptibility per atom
- `fukui_dual`: Dual descriptor per atom

---

### Spin States

Calculate relative energies of different spin multiplicities.

```python
workflow = rowan.submit_workflow(
    initial_molecule=mol,
    workflow_type="spin_states",
    workflow_data={},
    name="spin states"
)
```

**Output:**
- `spin_state_energies`: Energy of each multiplicity
- `ground_state`: Lowest energy multiplicity

---

### ADME-Tox Predictions

Predict absorption, distribution, metabolism, excretion, and toxicity.

```python
workflow = rowan.submit_workflow(
    initial_molecule=mol,
    workflow_type="admet",
    workflow_data={},
    name="ADMET"
)
```

**Output:**
- Various ADMET descriptors including:
  - `logP`, `logD`
  - `herg_inhibition`
  - `cyp_inhibition`
  - `bioavailability`
  - `bbb_permeability`

---

## Molecular Modeling Workflows

### Single-Point Energy

Calculate energy at fixed geometry.

```python
workflow = rowan.submit_basic_calculation_workflow(
    initial_molecule=mol,
    workflow_type="single_point",
    name="single point"
)
```

**Output:**
- `energy`: Total energy (Hartree)
- `dipole`: Dipole moment vector
- `mulliken_charges`: Atomic partial charges

---

### Geometry Optimization

Optimize molecular geometry to minimum energy.

```python
workflow = rowan.submit_basic_calculation_workflow(
    initial_molecule=mol,
    workflow_type="optimization",
    name="optimization"
)
```

**Output:**
- `final_molecule`: Optimized structure
- `energy`: Final energy (Hartree)
- `convergence`: Optimization details

---

### Vibrational Frequencies

Calculate IR/Raman frequencies and thermochemistry.

```python
workflow = rowan.submit_basic_calculation_workflow(
    initial_molecule=mol,
    workflow_type="frequency",
    name="frequency"
)
```

**Output:**
- `frequencies`: Vibrational frequencies (cm⁻¹)
- `ir_intensities`: IR intensities
- `zpe`: Zero-point energy
- `thermal_corrections`: Enthalpy, entropy, Gibbs free energy
- `imaginary_frequencies`: Count of negative frequencies

---

### Conformer Search

Generate and optimize conformer ensemble.

```python
workflow = rowan.submit_conformer_search_workflow(
    initial_molecule=mol,
    name="conformer search"
)
```

**Output:**
- `conformers`: List of conformer structures with energies
- `lowest_energy_conformer`: Global minimum structure
- `boltzmann_weights`: Population weights at 298 K

---

### Tautomer Search

Enumerate and rank tautomers.

```python
workflow = rowan.submit_tautomer_search_workflow(
    initial_molecule=mol,
    name="tautomer search"
)
```

**Output:**
- `tautomers`: List of tautomer structures
- `energies`: Relative energies
- `populations`: Boltzmann populations

---

### Dihedral Scan

Scan torsion angle energy surface.

```python
workflow = rowan.submit_dihedral_scan_workflow(
    initial_molecule=mol,
    dihedral_indices=(0, 1, 2, 3),  # Atom indices
    name="dihedral scan"
)
```

**Output:**
- `angles`: Dihedral angles scanned (degrees)
- `energies`: Energy at each angle
- `barrier_height`: Rotation barrier (kcal/mol)

---

### Multistage Optimization

Progressive refinement with multiple methods.

```python
workflow = rowan.submit_workflow(
    initial_molecule=mol,
    workflow_type="multistage_optimization",
    workflow_data={
        "stages": ["gfn2_xtb", "aimnet2", "dft"]
    },
    name="multistage opt"
)
```

**Output:**
- `final_molecule`: Optimized structure
- `stage_energies`: Energy after each stage

---

### Transition State Search

Find transition state geometry.

```python
workflow = rowan.submit_ts_search_workflow(
    initial_molecule=mol,  # Starting guess near TS
    name="TS search"
)
```

**Output:**
- `ts_structure`: Transition state geometry
- `imaginary_frequency`: Single imaginary frequency
- `barrier_height`: Activation energy

---

### Strain Calculation

Calculate ligand strain energy.

```python
workflow = rowan.submit_workflow(
    initial_molecule=mol,
    workflow_type="strain",
    workflow_data={},
    name="strain"
)
```

**Output:**
- `strain_energy`: Conformational strain (kcal/mol)
- `reference_energy`: Lowest energy conformer energy

---

### Orbital Calculation

Calculate molecular orbitals.

```python
workflow = rowan.submit_workflow(
    initial_molecule=mol,
    workflow_type="orbitals",
    workflow_data={},
    name="orbitals"
)
```

**Output:**
- `homo_energy`: HOMO energy (eV)
- `lumo_energy`: LUMO energy (eV)
- `homo_lumo_gap`: Band gap (eV)
- `orbital_coefficients`: MO coefficients

---

## Protein-Ligand Workflows

### Docking

Dock ligand to protein binding site.

```python
workflow = rowan.submit_docking_workflow(
    protein=protein_uuid,
    pocket={
        "center": [10.0, 20.0, 30.0],
        "size": [20.0, 20.0, 20.0]
    },
    initial_molecule=mol,
    executable="vina",           # "vina" or "qvina2"
    scoring_function="vinardo",  # "vina" or "vinardo"
    exhaustiveness=8,
    do_csearch=True,             # Conformer search before docking
    do_optimization=True,        # Optimize conformers
    do_pose_refinement=True,     # Refine poses with QM
    name="docking"
)
```

**Output:**
- `docking_score`: Best Vina score (kcal/mol)
- `poses`: List of docked poses with scores
- `ligand_strain`: Strain energy of bound conformer
- `pose_sdf`: SDF file of poses

---

### Batch Docking

Screen multiple ligands against one target.

```python
workflow = rowan.submit_batch_docking_workflow(
    protein=protein_uuid,
    pocket=pocket_dict,
    smiles_list=["CCO", "c1ccccc1", "CC(=O)O"],
    executable="qvina2",
    scoring_function="vina",
    name="batch docking"
)
```

**Output:**
- `results`: List of docking results per ligand
- `rankings`: Sorted by score

---

### Protein Cofolding

Predict protein-ligand complex structure using AI.

```python
workflow = rowan.submit_protein_cofolding_workflow(
    initial_protein_sequences=["MSKGEELFT..."],
    initial_smiles_list=["CCO"],
    model="boltz_2",       # "boltz_1x", "boltz_2", "chai_1r"
    use_msa_server=False,  # Use MSA for better accuracy
    use_potentials=True,   # Apply physical constraints
    compute_strain=False,  # Calculate ligand strain
    do_pose_refinement=False,
    name="cofolding"
)
```

**Models:**
- `chai_1r`: Chai-1 model (~2 min)
- `boltz_1x`: Boltz-1 model (~2 min)
- `boltz_2`: Boltz-2 model (latest, recommended)

**Output:**
- `structure_pdb`: Predicted complex structure
- `ptm_score`: Predicted TM score (0-1, higher = more confident)
- `interface_ptm`: Interface prediction confidence
- `aggregate_score`: Combined confidence metric
- `ligand_rmsd`: If reference available

---

### Pose-Analysis MD

Molecular dynamics simulation of docked pose.

```python
workflow = rowan.submit_workflow(
    initial_molecule=mol,
    workflow_type="pose_analysis_md",
    workflow_data={
        "protein_uuid": protein_uuid,
        "pose_sdf": pose_sdf_content
    },
    name="pose MD"
)
```

**Output:**
- `trajectory`: MD trajectory file
- `rmsd_over_time`: Ligand RMSD
- `interactions`: Protein-ligand interactions

---

## Spectroscopy Workflows

### NMR Prediction

Predict NMR chemical shifts.

```python
workflow = rowan.submit_nmr_workflow(
    initial_molecule=mol,
    name="NMR"
)
```

**Output:**
- `h_shifts`: ¹H chemical shifts (ppm)
- `c_shifts`: ¹³C chemical shifts (ppm)
- `coupling_constants`: J-coupling values

---

### Ion Mobility

Predict collision cross-section for mass spectrometry.

```python
workflow = rowan.submit_ion_mobility_workflow(
    initial_molecule=mol,
    name="ion mobility"
)
```

**Output:**
- `ccs`: Collision cross-section (Å²)
- `conformer_ccs`: CCS per conformer

---

## Advanced Workflows

### Molecular Descriptors

Calculate comprehensive descriptor set.

```python
workflow = rowan.submit_descriptors_workflow(
    initial_molecule=mol,
    name="descriptors"
)
```

**Output:**
- 2D descriptors (RDKit-based)
- 3D descriptors (xTB-based)
- Electronic descriptors

---

### MSA (Multiple Sequence Alignment)

Generate MSA for protein sequences.

```python
workflow = rowan.submit_msa_workflow(
    sequences=["MSKGEELFT..."],
    name="MSA"
)
```

**Output:**
- `msa`: Multiple sequence alignment
- `coverage`: Sequence coverage

---

### Protein Binder Design (BoltzGen)

Design protein binders.

```python
workflow = rowan.submit_workflow(
    workflow_type="protein_binder_design",
    workflow_data={
        "target_sequence": "MSKGEELFT...",
        "target_hotspots": [10, 15, 20]
    },
    name="binder design"
)
```

**Output:**
- `designed_sequences`: Binder sequences
- `confidence_scores`: Per-design confidence

---

## Workflow Parameters Reference

### Common Parameters

All workflow submission functions accept:

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | str | Workflow name (optional) |
| `folder_uuid` | str | Organize in folder |
| `max_credits` | float | Credit limit |

### Method Selection

For basic calculations, specify method:

```python
workflow = rowan.submit_basic_calculation_workflow(
    initial_molecule=mol,
    workflow_type="optimization",
    workflow_data={
        "method": "gfn2_xtb",  # or "aimnet2", "dft"
        "basis_set": "def2-SVP"  # for DFT
    }
)
```

**Available Methods:**
- Neural network: `aimnet2`, `egret`
- Semiempirical: `gfn1_xtb`, `gfn2_xtb`
- DFT: `b3lyp`, `pbe`, `wb97x`
