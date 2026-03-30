# Rowan Results Interpretation Reference

## Table of Contents

1. [Accessing Workflow Results](#accessing-workflow-results)
2. [Property Prediction Results](#property-prediction-results)
3. [Molecular Modeling Results](#molecular-modeling-results)
4. [Docking Results](#docking-results)
5. [Cofolding Results](#cofolding-results)
6. [Validation and Quality Assessment](#validation-and-quality-assessment)

---

## Accessing Workflow Results

### Basic Pattern

```python
import rowan

workflow = rowan.submit_pka_workflow(mol, name="test")

# Wait for completion
workflow.wait_for_result()

# Fetch results (not loaded by default)
workflow.fetch_latest(in_place=True)

# Check status before accessing data
if workflow.status == "completed":
    print(workflow.data)
elif workflow.status == "failed":
    print(f"Failed: {workflow.error_message}")
```

### Workflow Status Values

| Status | Description |
|--------|-------------|
| `pending` | Queued, waiting for resources |
| `running` | Currently executing |
| `completed` | Successfully finished |
| `failed` | Execution failed |
| `stopped` | Manually stopped |

### Credits Charged

```python
# After completion
print(f"Credits used: {workflow.credits_charged}")
```

---

## Property Prediction Results

### pKa Results

```python
workflow = rowan.submit_pka_workflow(mol, name="pKa")
workflow.wait_for_result()
workflow.fetch_latest(in_place=True)

data = workflow.data

# Macroscopic pKa
strongest_acid = data['strongest_acid']  # Most acidic pKa
strongest_base = data['strongest_base']  # Most basic pKa (if applicable)

# Microscopic pKa (site-specific)
micro_pkas = data['microscopic_pkas']
for site in micro_pkas:
    print(f"Site {site['atom_index']}: pKa = {site['pka']:.2f}")

# Tautomer analysis
tautomers = data.get('tautomer_populations', {})
for smiles, pop in tautomers.items():
    print(f"{smiles}: {pop:.1%}")
```

**Interpretation:**
- pKa < 0: Strong acid
- pKa 0-7: Acidic
- pKa 7-14: Basic
- pKa > 14: Very weak acid

---

### Redox Potential Results

```python
data = workflow.data

oxidation_potential = data['oxidation_potential']  # V vs SHE
reduction_potential = data['reduction_potential']  # V vs SHE

print(f"Oxidation: {oxidation_potential:.2f} V vs SHE")
print(f"Reduction: {reduction_potential:.2f} V vs SHE")
```

**Interpretation:**
- Higher oxidation potential = harder to oxidize
- Lower reduction potential = harder to reduce
- Compare to reference compounds for context

---

### Solubility Results

```python
data = workflow.data

log_s = data['aqueous_solubility']  # Log10(mol/L)
classification = data['solubility_class']

print(f"Log S: {log_s:.2f}")
print(f"Classification: {classification}")  # "High", "Medium", "Low"
```

**Interpretation:**
- Log S > -1: High solubility (>0.1 M)
- Log S -1 to -3: Medium solubility
- Log S < -3: Low solubility (<0.001 M)

---

### Fukui Index Results

```python
data = workflow.data

# Per-atom reactivity indices
fukui_plus = data['fukui_plus']   # Nucleophilic attack sites
fukui_minus = data['fukui_minus']  # Electrophilic attack sites
fukui_dual = data['fukui_dual']    # Dual descriptor

# Find most reactive sites
for i, (fp, fm, fd) in enumerate(zip(fukui_plus, fukui_minus, fukui_dual)):
    print(f"Atom {i}: f+ = {fp:.3f}, f- = {fm:.3f}, dual = {fd:.3f}")
```

**Interpretation:**
- High f+ = susceptible to nucleophilic attack
- High f- = susceptible to electrophilic attack
- Dual > 0 = electrophilic character, Dual < 0 = nucleophilic character

---

## Molecular Modeling Results

### Geometry Optimization Results

```python
data = workflow.data

final_mol = data['final_molecule']  # stjames.Molecule
final_energy = data['energy']  # Hartree
converged = data['convergence']

print(f"Final energy: {final_energy:.6f} Hartree")
print(f"Converged: {converged}")
```

---

### Conformer Search Results

```python
data = workflow.data

conformers = data['conformers']
lowest_energy = data['lowest_energy_conformer']

# Analyze conformer distribution
for i, conf in enumerate(conformers):
    rel_energy = (conf['energy'] - conformers[0]['energy']) * 627.509  # kcal/mol
    print(f"Conformer {i}: ΔE = {rel_energy:.2f} kcal/mol")

# Boltzmann weights
weights = data.get('boltzmann_weights', [])
for i, w in enumerate(weights):
    print(f"Conformer {i}: population = {w:.1%}")
```

**Interpretation:**
- Conformers within 3 kcal/mol are typically accessible at room temperature
- Lowest energy conformer may not be most populated in solution
- Consider ensemble averaging for properties

---

### Frequency Calculation Results

```python
data = workflow.data

frequencies = data['frequencies']  # cm⁻¹
ir_intensities = data['ir_intensities']  # km/mol
zpe = data['zpe']  # Hartree
gibbs = data['gibbs_free_energy']  # Hartree

# Check for imaginary frequencies
imaginary = [f for f in frequencies if f < 0]
if imaginary:
    print(f"Warning: {len(imaginary)} imaginary frequencies")
    print("Structure may be a transition state or saddle point")
else:
    print("Structure is a true minimum")

# Thermochemistry at 298 K
print(f"ZPE: {zpe * 627.509:.2f} kcal/mol")
print(f"Gibbs free energy: {gibbs:.6f} Hartree")
```

**Interpretation:**
- 0 imaginary frequencies = minimum
- 1 imaginary frequency = transition state
- >1 imaginary frequencies = higher-order saddle point

---

### Dihedral Scan Results

```python
data = workflow.data

angles = data['angles']  # degrees
energies = data['energies']  # Hartree

# Find barrier
min_e = min(energies)
max_e = max(energies)
barrier = (max_e - min_e) * 627.509  # kcal/mol

print(f"Rotation barrier: {barrier:.2f} kcal/mol")

# Find minima
import numpy as np
rel_energies = [(e - min_e) * 627.509 for e in energies]
for angle, e in zip(angles, rel_energies):
    if e < 0.5:  # Near minimum
        print(f"Minimum at {angle}°")
```

---

## Docking Results

### Single Docking Results

```python
data = workflow.data

# Docking score (more negative = better)
score = data['docking_score']  # kcal/mol
print(f"Docking score: {score:.2f} kcal/mol")

# All poses
poses = data['poses']
for i, pose in enumerate(poses):
    print(f"Pose {i}: score = {pose['score']:.2f} kcal/mol")

# Ligand strain
strain = data.get('ligand_strain', 0)
print(f"Ligand strain: {strain:.2f} kcal/mol")

# Download poses
workflow.download_sdf_file("docked_poses.sdf")
```

**Interpretation:**
- Vina scores typically -12 to -6 kcal/mol for drug-like molecules
- More negative = stronger predicted binding
- Ligand strain > 3 kcal/mol suggests unlikely binding mode

---

### Batch Docking Results

```python
data = workflow.data

results = data['results']
for r in results:
    smiles = r['smiles']
    score = r['best_score']
    strain = r.get('ligand_strain', 0)
    print(f"{smiles[:30]}: score = {score:.2f}, strain = {strain:.2f}")

# Sort by score
sorted_results = sorted(results, key=lambda x: x['best_score'])
print("\nTop 10 hits:")
for r in sorted_results[:10]:
    print(f"{r['smiles']}: {r['best_score']:.2f}")
```

**Scoring Function Differences:**
- **Vina**: Original scoring function
- **Vinardo**: Updated parameters, often more accurate

---

## Cofolding Results

### Protein-Ligand Complex Prediction

```python
data = workflow.data

# Confidence scores
ptm = data['ptm_score']  # Predicted TM score (0-1)
interface_ptm = data['interface_ptm']  # Interface confidence
aggregate = data['aggregate_score']  # Combined score

print(f"Predicted TM score: {ptm:.3f}")
print(f"Interface pTM: {interface_ptm:.3f}")
print(f"Aggregate score: {aggregate:.3f}")

# Download structure
pdb_content = data['structure_pdb']
with open("complex.pdb", "w") as f:
    f.write(pdb_content)
```

**Confidence Score Interpretation:**

| Score Range | Confidence | Recommendation |
|-------------|------------|----------------|
| > 0.8 | High | Likely accurate |
| 0.5 - 0.8 | Moderate | Use with caution |
| < 0.5 | Low | Validate experimentally |

---

### Interpreting Low Confidence

Low confidence may indicate:
- Novel protein fold not well-represented in training data
- Flexible or disordered regions
- Unusual ligand (large, charged, or complex)
- Multiple possible binding modes

**Recommendations for low confidence:**
1. Try multiple models (Chai-1, Boltz-1, Boltz-2)
2. Compare predictions across models
3. Use docking for binding pose refinement
4. Validate with experimental data if available

---

## Validation and Quality Assessment

### Cross-Validation with Multiple Methods

```python
import rowan
import stjames

mol = stjames.Molecule.from_smiles("c1ccccc1O")

# Run with different methods
results = {}

for method in ['gfn2_xtb', 'aimnet2']:
    wf = rowan.submit_basic_calculation_workflow(
        initial_molecule=mol,
        workflow_type="optimization",
        workflow_data={"method": method},
        name=f"opt_{method}"
    )
    wf.wait_for_result()
    wf.fetch_latest(in_place=True)
    results[method] = wf.data['energy']

# Compare energies
for method, energy in results.items():
    print(f"{method}: {energy:.6f} Hartree")
```

### Consistency Checks

```python
# For pKa
def validate_pka(data):
    pka = data['strongest_acid']

    # Check reasonable range
    if pka < -5 or pka > 20:
        print("Warning: pKa outside typical range")

    # Compare with known references
    # (implementation depends on reference data)

# For docking
def validate_docking(data):
    score = data['docking_score']
    strain = data.get('ligand_strain', 0)

    if score > 0:
        print("Warning: Positive docking score suggests poor binding")

    if strain > 5:
        print("Warning: High ligand strain - binding mode may be unrealistic")
```

### Experimental Validation Guidelines

| Property | Validation Method |
|----------|-------------------|
| pKa | Potentiometric titration, UV spectroscopy |
| Solubility | Shake-flask, nephelometry |
| Docking pose | X-ray crystallography, cryo-EM |
| Binding affinity | SPR, ITC, fluorescence polarization |
| Cofolding | X-ray, NMR, HDX-MS |

---

## Common Issues and Solutions

### Issue: Workflow Failed

```python
if workflow.status == "failed":
    print(f"Error: {workflow.error_message}")

    # Common causes:
    # - Invalid SMILES
    # - Molecule too large
    # - Convergence failure
    # - Credit limit exceeded
```

### Issue: Unexpected Results

1. **pKa off by >2 units**: Check tautomers, ensure correct protonation state
2. **Docking gives positive scores**: Ligand may not fit binding site
3. **Optimization not converged**: Try different starting geometry
4. **High strain energy**: Conformer may be wrong

### Issue: Missing Data Fields

```python
# Use .get() with defaults
energy = data.get('energy', None)
if energy is None:
    print("Energy not available")
```

---

## Data Export Patterns

### Export to CSV

```python
import pandas as pd

# Collect results from multiple workflows
results = []
for wf in workflows:
    wf.fetch_latest(in_place=True)
    if wf.status == "completed":
        results.append({
            'name': wf.name,
            'pka': wf.data.get('strongest_acid'),
            'credits': wf.credits_charged
        })

df = pd.DataFrame(results)
df.to_csv("results.csv", index=False)
```

### Export Structures

```python
# Download SDF with all poses
workflow.download_sdf_file("poses.sdf")

# Download trajectory (for MD)
workflow.download_dcd_files(output_dir="trajectories/")
```
