# TDC Molecule Generation Oracles

Oracles are functions that evaluate the quality of generated molecules across specific dimensions. TDC provides 17+ oracle functions for molecular optimization tasks in de novo drug design.

## Overview

Oracles measure molecular properties and serve two main purposes:

1. **Goal-Directed Generation**: Optimize molecules to maximize/minimize specific properties
2. **Distribution Learning**: Evaluate whether generated molecules match desired property distributions

## Using Oracles

### Basic Usage

```python
from tdc import Oracle

# Initialize oracle
oracle = Oracle(name='GSK3B')

# Evaluate single molecule (SMILES string)
score = oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O')

# Evaluate multiple molecules
scores = oracle(['SMILES1', 'SMILES2', 'SMILES3'])
```

### Oracle Categories

TDC oracles are organized into several categories based on the molecular property being evaluated.

## Biochemical Oracles

Predict binding affinity or activity against biological targets.

### Target-Specific Oracles

**DRD2 - Dopamine Receptor D2**
```python
oracle = Oracle(name='DRD2')
score = oracle(smiles)
```
- Measures binding affinity to DRD2 receptor
- Important for neurological and psychiatric drug development
- Higher scores indicate stronger binding

**GSK3B - Glycogen Synthase Kinase-3 Beta**
```python
oracle = Oracle(name='GSK3B')
score = oracle(smiles)
```
- Predicts GSK3β inhibition
- Relevant for Alzheimer's, diabetes, and cancer research
- Higher scores indicate better inhibition

**JNK3 - c-Jun N-terminal Kinase 3**
```python
oracle = Oracle(name='JNK3')
score = oracle(smiles)
```
- Measures JNK3 kinase inhibition
- Target for neurodegenerative diseases
- Higher scores indicate stronger inhibition

**5HT2A - Serotonin 2A Receptor**
```python
oracle = Oracle(name='5HT2A')
score = oracle(smiles)
```
- Predicts serotonin receptor binding
- Important for psychiatric medications
- Higher scores indicate stronger binding

**ACE - Angiotensin-Converting Enzyme**
```python
oracle = Oracle(name='ACE')
score = oracle(smiles)
```
- Measures ACE inhibition
- Target for hypertension treatment
- Higher scores indicate better inhibition

**MAPK - Mitogen-Activated Protein Kinase**
```python
oracle = Oracle(name='MAPK')
score = oracle(smiles)
```
- Predicts MAPK inhibition
- Target for cancer and inflammatory diseases

**CDK - Cyclin-Dependent Kinase**
```python
oracle = Oracle(name='CDK')
score = oracle(smiles)
```
- Measures CDK inhibition
- Important for cancer drug development

**P38 - p38 MAP Kinase**
```python
oracle = Oracle(name='P38')
score = oracle(smiles)
```
- Predicts p38 MAPK inhibition
- Target for inflammatory diseases

**PARP1 - Poly (ADP-ribose) Polymerase 1**
```python
oracle = Oracle(name='PARP1')
score = oracle(smiles)
```
- Measures PARP1 inhibition
- Target for cancer treatment (DNA repair mechanism)

**PIK3CA - Phosphatidylinositol-4,5-Bisphosphate 3-Kinase**
```python
oracle = Oracle(name='PIK3CA')
score = oracle(smiles)
```
- Predicts PIK3CA inhibition
- Important target in oncology

## Physicochemical Oracles

Evaluate drug-like properties and ADME characteristics.

### Drug-Likeness Oracles

**QED - Quantitative Estimate of Drug-likeness**
```python
oracle = Oracle(name='QED')
score = oracle(smiles)
```
- Combines multiple physicochemical properties
- Score ranges from 0 (non-drug-like) to 1 (drug-like)
- Based on Bickerton et al. criteria

**Lipinski - Rule of Five**
```python
oracle = Oracle(name='Lipinski')
score = oracle(smiles)
```
- Number of Lipinski rule violations
- Rules: MW ≤ 500, logP ≤ 5, HBD ≤ 5, HBA ≤ 10
- Score of 0 means fully compliant

### Molecular Properties

**SA - Synthetic Accessibility**
```python
oracle = Oracle(name='SA')
score = oracle(smiles)
```
- Estimates ease of synthesis
- Score ranges from 1 (easy) to 10 (difficult)
- Lower scores indicate easier synthesis

**LogP - Octanol-Water Partition Coefficient**
```python
oracle = Oracle(name='LogP')
score = oracle(smiles)
```
- Measures lipophilicity
- Important for membrane permeability
- Typical drug-like range: 0-5

**MW - Molecular Weight**
```python
oracle = Oracle(name='MW')
score = oracle(smiles)
```
- Returns molecular weight in Daltons
- Drug-like range typically 150-500 Da

## Composite Oracles

Combine multiple properties for multi-objective optimization.

**Isomer Meta**
```python
oracle = Oracle(name='Isomer_Meta')
score = oracle(smiles)
```
- Evaluates specific isomeric properties
- Used for stereochemistry optimization

**Median Molecules**
```python
oracle = Oracle(name='Median1', 'Median2')
score = oracle(smiles)
```
- Tests ability to generate molecules with median properties
- Useful for distribution learning benchmarks

**Rediscovery**
```python
oracle = Oracle(name='Rediscovery')
score = oracle(smiles)
```
- Measures similarity to known reference molecules
- Tests ability to regenerate existing drugs

**Similarity**
```python
oracle = Oracle(name='Similarity')
score = oracle(smiles)
```
- Computes structural similarity to target molecules
- Based on molecular fingerprints (typically Tanimoto similarity)

**Uniqueness**
```python
oracle = Oracle(name='Uniqueness')
scores = oracle(smiles_list)
```
- Measures diversity in generated molecule set
- Returns fraction of unique molecules

**Novelty**
```python
oracle = Oracle(name='Novelty')
scores = oracle(smiles_list, training_set)
```
- Measures how different generated molecules are from training set
- Higher scores indicate more novel structures

## Specialized Oracles

**ASKCOS - Retrosynthesis Scoring**
```python
oracle = Oracle(name='ASKCOS')
score = oracle(smiles)
```
- Evaluates synthetic feasibility using retrosynthesis
- Requires ASKCOS backend (IBM RXN)
- Scores based on retrosynthetic route availability

**Docking Score**
```python
oracle = Oracle(name='Docking')
score = oracle(smiles)
```
- Molecular docking score against target protein
- Requires protein structure and docking software
- Lower scores typically indicate better binding

**Vina - AutoDock Vina Score**
```python
oracle = Oracle(name='Vina')
score = oracle(smiles)
```
- Uses AutoDock Vina for protein-ligand docking
- Predicts binding affinity in kcal/mol
- More negative scores indicate stronger binding

## Multi-Objective Optimization

Combine multiple oracles for multi-property optimization:

```python
from tdc import Oracle

# Initialize multiple oracles
qed_oracle = Oracle(name='QED')
sa_oracle = Oracle(name='SA')
drd2_oracle = Oracle(name='DRD2')

# Define custom scoring function
def multi_objective_score(smiles):
    qed = qed_oracle(smiles)
    sa = 1 / (1 + sa_oracle(smiles))  # Invert SA (lower is better)
    drd2 = drd2_oracle(smiles)

    # Weighted combination
    return 0.3 * qed + 0.3 * sa + 0.4 * drd2

# Evaluate molecule
score = multi_objective_score('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
```

## Oracle Performance Considerations

### Speed
- **Fast**: QED, SA, LogP, MW, Lipinski (rule-based calculations)
- **Medium**: Target-specific ML models (DRD2, GSK3B, etc.)
- **Slow**: Docking-based oracles (Vina, ASKCOS)

### Reliability
- Oracles are ML models trained on specific datasets
- May not generalize to all chemical spaces
- Use multiple oracles to validate results

### Batch Processing
```python
# Efficient batch evaluation
oracle = Oracle(name='GSK3B')
smiles_list = ['SMILES1', 'SMILES2', ..., 'SMILES1000']
scores = oracle(smiles_list)  # Faster than individual calls
```

## Common Workflows

### Goal-Directed Generation
```python
from tdc import Oracle
from tdc.generation import MolGen

# Load training data
data = MolGen(name='ChEMBL_V29')
train_smiles = data.get_data()['Drug'].tolist()

# Initialize oracle
oracle = Oracle(name='GSK3B')

# Generate molecules (user implements generative model)
# generated_smiles = generator.generate(n=1000)

# Evaluate generated molecules
scores = oracle(generated_smiles)
best_molecules = [(s, score) for s, score in zip(generated_smiles, scores)]
best_molecules.sort(key=lambda x: x[1], reverse=True)

print(f"Top 10 molecules:")
for smiles, score in best_molecules[:10]:
    print(f"{smiles}: {score:.3f}")
```

### Distribution Learning
```python
from tdc import Oracle
import numpy as np

# Initialize oracle
oracle = Oracle(name='QED')

# Evaluate training set
train_scores = oracle(train_smiles)
train_mean = np.mean(train_scores)
train_std = np.std(train_scores)

# Evaluate generated set
gen_scores = oracle(generated_smiles)
gen_mean = np.mean(gen_scores)
gen_std = np.std(gen_scores)

# Compare distributions
print(f"Training: μ={train_mean:.3f}, σ={train_std:.3f}")
print(f"Generated: μ={gen_mean:.3f}, σ={gen_std:.3f}")
```

## Integration with TDC Benchmarks

```python
from tdc.generation import MolGen

# Use with GuacaMol benchmark
data = MolGen(name='GuacaMol')

# Oracles are automatically integrated
# Each GuacaMol task has associated oracle
benchmark_results = data.evaluate_guacamol(
    generated_molecules=your_molecules,
    oracle_name='GSK3B'
)
```

## Notes

- Oracle scores are predictions, not experimental measurements
- Always validate top candidates experimentally
- Different oracles may have different score ranges and interpretations
- Some oracles require additional dependencies or API access
- Check oracle documentation for specific details: https://tdcommons.ai/functions/oracles/

## Adding Custom Oracles

To create custom oracle functions:

```python
class CustomOracle:
    def __init__(self):
        # Initialize your model/method
        pass

    def __call__(self, smiles):
        # Implement your scoring logic
        # Return score or list of scores
        pass

# Use like built-in oracles
custom_oracle = CustomOracle()
score = custom_oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
```

## References

- TDC Oracles Documentation: https://tdcommons.ai/functions/oracles/
- GuacaMol Paper: "GuacaMol: Benchmarking Models for de Novo Molecular Design"
- MOSES Paper: "Molecular Sets (MOSES): A Benchmarking Platform for Molecular Generation Models"
