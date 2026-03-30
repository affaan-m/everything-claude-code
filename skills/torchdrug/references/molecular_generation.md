# Molecular Generation

## Overview

Molecular generation involves creating novel molecular structures with desired properties. TorchDrug supports both unconditional generation (exploring chemical space) and conditional generation (optimizing for specific properties).

## Task Types

### AutoregressiveGeneration

Generates molecules step-by-step by sequentially adding atoms and bonds. This approach enables fine-grained control and property optimization during generation.

**Key Features:**
- Sequential atom-by-bond construction
- Supports property optimization during generation
- Can incorporate chemical validity constraints
- Enables multi-objective optimization

**Generation Strategies:**
1. **Beam Search**: Keep top-k candidates at each step
2. **Sampling**: Probabilistic selection for diversity
3. **Greedy**: Always select highest probability action

**Property Optimization:**
- Reward shaping based on desired properties
- Real-time constraint satisfaction
- Multi-objective balancing (e.g., potency + drug-likeness)

### GCPNGeneration (Graph Convolutional Policy Network)

Uses reinforcement learning to generate molecules optimized for specific properties.

**Components:**
1. **Policy Network**: Decides which action to take (add atom, add bond)
2. **Reward Function**: Evaluates generated molecule quality
3. **Training**: Reinforcement learning with policy gradient

**Advantages:**
- Direct optimization of non-differentiable objectives
- Can incorporate complex domain knowledge
- Balances exploration and exploitation

**Applications:**
- Drug design with specific targets
- Material discovery with property constraints
- Multi-objective molecular optimization

## Generative Models

### GraphAutoregressiveFlow

Normalizing flow model for molecular generation with exact likelihood computation.

**Architecture:**
- Coupling layers transform simple distribution to complex molecular distribution
- Invertible transformations enable density estimation
- Supports conditional generation

**Key Features:**
- Exact likelihood computation (vs. VAE's approximate likelihood)
- Stable training (vs. GAN's adversarial training)
- Efficient sampling through invertible transformations
- Can generate molecules with specified properties

**Training:**
- Maximum likelihood on molecule dataset
- Optional property prediction head for conditional generation
- Typically trained on ZINC or QM9

**Use Cases:**
- Generating diverse drug-like molecules
- Interpolation between known molecules
- Density estimation for molecular space

## Generation Workflows

### Unconditional Generation

Generate diverse molecules without specific property targets.

**Workflow:**
1. Train generative model on molecule dataset (e.g., ZINC250k)
2. Sample from learned distribution
3. Post-process for validity and uniqueness
4. Evaluate diversity metrics

**Evaluation Metrics:**
- **Validity**: Percentage of chemically valid molecules
- **Uniqueness**: Percentage of unique molecules among valid
- **Novelty**: Percentage not in training set
- **Diversity**: Internal diversity using fingerprint similarity

### Conditional Generation

Generate molecules optimized for specific properties.

**Property Targets:**
- **Drug-likeness**: LogP, QED, Lipinski's rule of five
- **Synthesizability**: SA score, retrosynthesis feasibility
- **Bioactivity**: Predicted IC50, binding affinity
- **ADMET**: Absorption, distribution, metabolism, excretion, toxicity
- **Multi-objective**: Balance multiple properties simultaneously

**Workflow:**
1. Define reward function combining property objectives
2. Train GCPN or condition flow model on properties
3. Generate molecules with desired property ranges
4. Validate generated molecules (in silico → wet lab)

### Scaffold-Based Generation

Generate molecules around a fixed scaffold or core structure.

**Applications:**
- Lead optimization keeping core pharmacophore
- R-group enumeration for SAR studies
- Fragment linking and growing

**Approaches:**
- Mask scaffold during training
- Condition generation on scaffold
- Post-generation grafting

### Fragment-Based Generation

Build molecules from validated fragments.

**Benefits:**
- Ensures drug-like substructures
- Reduces search space
- Incorporates medicinal chemistry knowledge

**Methods:**
- Fragment library as building blocks
- Vocabulary-based generation
- Fragment linking with learned linkers

## Property Optimization Strategies

### Single-Objective Optimization

Maximize or minimize a single property (e.g., binding affinity).

**Approach:**
- Define scalar reward function
- Use GCPN with RL training
- Generate and rank candidates

**Challenges:**
- May sacrifice other important properties
- Risk of adversarial examples (valid but non-drug-like)
- Need constraints on drug-likeness

### Multi-Objective Optimization

Balance multiple competing objectives (e.g., potency, selectivity, synthesizability).

**Weighting Approaches:**
- **Linear combination**: w1×prop1 + w2×prop2 + ...
- **Pareto optimization**: Find non-dominated solutions
- **Constraint satisfaction**: Threshold on secondary objectives

**Example Objectives:**
- High binding affinity (target)
- Low binding affinity (off-targets)
- High synthesizability (SA score)
- Drug-like properties (QED)
- Low molecular weight

**Workflow:**
```python
from torchdrug import tasks

# Define multi-objective reward
def reward_function(mol):
    affinity_score = predict_binding(mol)
    druglikeness = calculate_qed(mol)
    synthesizability = sa_score(mol)

    # Weighted combination
    reward = 0.5 * affinity_score + 0.3 * druglikeness + 0.2 * (1 - synthesizability)
    return reward

# GCPN task with custom reward
task = tasks.GCPNGeneration(
    model,
    reward_function=reward_function,
    criterion="ppo"  # Proximal policy optimization
)
```

### Constraint-Based Generation

Generate molecules satisfying hard constraints.

**Common Constraints:**
- Molecular weight range
- LogP range
- Number of rotatable bonds
- Ring count limits
- Substructure inclusion/exclusion
- Synthetic accessibility threshold

**Implementation:**
- Validity checking during generation
- Early stopping for invalid molecules
- Penalty terms in reward function

## Training Considerations

### Dataset Selection

**ZINC (Drug-like compounds):**
- ZINC250k: 250,000 compounds
- ZINC2M: 2 million compounds
- Pre-filtered for drug-likeness
- Good for drug discovery applications

**QM9 (Small organic molecules):**
- 133,885 molecules
- Includes quantum properties
- Good for property prediction models

**ChEMBL (Bioactive molecules):**
- Millions of bioactive compounds
- Activity data available
- Target-specific generation

**Custom Datasets:**
- Focus on specific chemical space
- Include expert knowledge
- Domain-specific constraints

### Data Augmentation

**SMILES Augmentation:**
- Generate multiple SMILES for same molecule
- Helps model learn canonical representations
- Improves robustness

**Graph Augmentation:**
- Random node/edge masking
- Subgraph sampling
- Motif substitution

### Model Architecture Choices

**For Small Molecules (<30 atoms):**
- Simpler architectures sufficient
- Faster training and generation
- GCN or GIN backbone

**For Drug-like Molecules:**
- Deeper architectures (4-6 layers)
- Attention mechanisms help
- Consider molecular fingerprints

**For Macrocycles/Polymers:**
- Handle larger graphs
- Ring closure mechanisms important
- Long-range dependencies

## Validation and Filtering

### In Silico Validation

**Chemical Validity:**
- Valence rules
- Aromaticity rules
- Charge neutrality
- Stable substructures

**Drug-likeness Filters:**
- Lipinski's rule of five
- Veber's rules
- PAINS filters (pan-assay interference compounds)
- BRENK filters (toxic/reactive substructures)

**Synthesizability:**
- SA score (synthetic accessibility)
- Retrosynthesis prediction
- Commercial availability of precursors

**Property Prediction:**
- ADMET properties
- Toxicity prediction
- Off-target binding
- Metabolic stability

### Ranking and Selection

**Criteria:**
1. Predicted target affinity
2. Drug-likeness score
3. Synthesizability
4. Novelty (dissimilarity to known actives)
5. Diversity (within generated set)
6. Predicted ADMET properties

**Selection Strategies:**
- Pareto frontier selection
- Weighted scoring
- Clustering and representative selection
- Active learning for wet lab validation

## Best Practices

1. **Start Simple**: Begin with unconditional generation, then add constraints
2. **Validate Chemistry**: Always check for valid molecules and drug-likeness
3. **Diverse Training Data**: Use large, diverse datasets for better generalization
4. **Multi-Objective**: Consider multiple properties from the start
5. **Iterative Refinement**: Generate → validate → retrain with feedback
6. **Domain Expert Review**: Consult medicinal chemists before synthesis
7. **Benchmark**: Compare against known actives and random samples
8. **Synthesizability**: Prioritize molecules that can actually be made
9. **Explainability**: Understand why model generates certain structures
10. **Wet Lab Validation**: Ultimately validate promising candidates experimentally

## Common Applications

### Drug Discovery
- Lead generation for novel targets
- Lead optimization around active scaffolds
- Bioisostere replacement
- Fragment elaboration

### Materials Science
- Polymer design with target properties
- Catalyst discovery
- Energy storage materials
- Photovoltaic materials

### Chemical Biology
- Probe molecule design
- Degrader (PROTAC) design
- Molecular glue discovery

## Integration with Other Tools

**Docking:**
- Generate molecules → Dock to target → Retrain with docking scores

**Retrosynthesis:**
- Filter generated molecules by synthetic accessibility
- Plan synthesis routes for top candidates

**Property Prediction:**
- Use trained property prediction models as reward functions
- Multi-task learning with generation and prediction

**Active Learning:**
- Generate candidates → Predict properties → Synthesize best → Retrain
