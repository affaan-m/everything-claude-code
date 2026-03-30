# Protein Modeling

## Overview

TorchDrug provides extensive support for protein-related tasks including sequence analysis, structure prediction, property prediction, and protein-protein interactions. Proteins are represented as graphs where nodes are amino acid residues and edges represent spatial or sequential relationships.

## Available Datasets

### Protein Function Prediction

**Enzyme Function:**
- **EnzymeCommission** (17,562 proteins): EC number classification (7 levels)
- **BetaLactamase** (5,864 sequences): Enzyme activity prediction

**Protein Characteristics:**
- **Fluorescence** (54,025 sequences): GFP fluorescence intensity
- **Stability** (53,614 sequences): Thermostability prediction
- **Solubility** (62,478 sequences): Protein solubility classification
- **BinaryLocalization** (22,168 proteins): Subcellular localization (membrane vs. soluble)
- **SubcellularLocalization** (8,943 proteins): 10-class localization prediction

**Gene Ontology:**
- **GeneOntology** (46,796 proteins): GO term prediction across biological process, molecular function, and cellular component

### Protein Structure Prediction

- **Fold** (16,712 proteins): Structural fold classification (1,195 classes)
- **SecondaryStructure** (8,678 proteins): 3-state or 8-state secondary structure prediction
- **ContactPrediction** via ProteinNet: Residue-residue contact maps

### Protein Interaction

**Protein-Protein Interactions:**
- **HumanPPI** (1,412 proteins, 6,584 interactions): Human protein interaction network
- **YeastPPI** (2,018 proteins, 6,451 interactions): Yeast protein interaction network
- **PPIAffinity** (2,156 protein pairs): Binding affinity measurements

**Protein-Ligand Binding:**
- **BindingDB** (~1.5M entries): Comprehensive binding affinity database
- **PDBBind** (20,000+ complexes): 3D structure-based binding data
  - Refined set: High-quality crystal structures
  - Core set: Diverse benchmark set

### Large-Scale Protein Databases

- **AlphaFoldDB**: Access to 200M+ predicted protein structures
- **ProteinNet**: Standardized dataset for structure prediction

## Task Types

### NodePropertyPrediction

Predict properties at the residue (node) level, such as secondary structure or contact maps.

**Use Cases:**
- Secondary structure prediction (helix, sheet, coil)
- Residue-level disorder prediction
- Post-translational modification sites
- Binding site prediction

### PropertyPrediction

Predict protein-level properties like function, stability, or localization.

**Use Cases:**
- Enzyme function classification
- Subcellular localization
- Protein stability prediction
- Gene ontology term prediction

### InteractionPrediction

Predict interactions between protein pairs or protein-ligand pairs.

**Key Features:**
- Handles both sequence and structure inputs
- Supports symmetric (PPI) and asymmetric (protein-ligand) interactions
- Multiple negative sampling strategies

### ContactPrediction

Specialized task for predicting spatial proximity between residues in folded structures.

**Applications:**
- Structure prediction from sequence
- Protein folding pathway analysis
- Validation of predicted structures

## Protein Representation Models

### Sequence-Based Models

**ESM (Evolutionary Scale Modeling):**
- Pre-trained transformer model on 250M sequences
- State-of-the-art for sequence-only tasks
- Available in multiple sizes (ESM-1b, ESM-2)
- Captures evolutionary and structural information

**ProteinBERT:**
- BERT-style masked language model
- Pre-trained on UniProt sequences
- Good for transfer learning

**ProteinLSTM:**
- Bidirectional LSTM for sequence encoding
- Lightweight and fast
- Good baseline for sequence tasks

**ProteinCNN / ProteinResNet:**
- Convolutional architectures
- Capture local sequence patterns
- Faster than transformer models

### Structure-Based Models

**GearNet (Geometry-Aware Relational Graph Network):**
- Incorporates 3D geometric information
- Edge types based on sequential, radius, and K-nearest neighbors
- State-of-the-art for structure-based tasks
- Supports both backbone and full-atom representations

**GCN/GAT/GIN on Protein Graphs:**
- Standard GNN architectures adapted for proteins
- Flexible edge definitions (sequence, spatial, contact)

**SchNet:**
- Continuous-filter convolutions
- Handles 3D coordinates directly
- Good for structure prediction and protein-ligand binding

### Feature-Based Models

**Statistic Features:**
- Amino acid composition
- Sequence length statistics
- Motif counts

**Physicochemical Features:**
- Hydrophobicity scales
- Charge properties
- Secondary structure propensity
- Molecular weight, pI

## Protein Graph Construction

### Edge Types

**Sequential Edges:**
- Connect adjacent residues in sequence
- Captures primary structure

**Spatial Edges:**
- K-nearest neighbors in 3D space
- Radius cutoff (e.g., Cα atoms within 10Å)
- Captures tertiary structure

**Contact Edges:**
- Based on heavy atom distances
- Typically < 8Å threshold

### Node Features

**Residue Identity:**
- One-hot encoding of 20 amino acids
- Learned embeddings

**Position Information:**
- 3D coordinates (Cα, N, C, O)
- Backbone angles (phi, psi, omega)
- Relative spatial position encodings

**Physicochemical Properties:**
- Hydrophobicity
- Charge
- Size
- Secondary structure

## Training Workflows

### Pre-training Strategies

**Self-Supervised Pre-training:**
- Masked residue prediction (like BERT)
- Distance prediction between residues
- Angle prediction (phi, psi, omega)
- Dihedral angle prediction
- Contact map prediction

**Pre-trained Model Usage:**
```python
from torchdrug import models

# Load pre-trained ESM
model = models.ESM(path="esm1b_t33_650M_UR50S.pt")

# Fine-tune on downstream task
task = tasks.PropertyPrediction(
    model, task=["stability"],
    criterion="mse", metric=["mae", "rmse"]
)
```

### Multi-Task Learning

Train on multiple related tasks simultaneously:
- Joint prediction of function, localization, and stability
- Improves generalization and data efficiency
- Shares representations across tasks

### Best Practices

**For Sequence-Only Tasks:**
1. Start with pre-trained ESM or ProteinBERT
2. Fine-tune with small learning rate (1e-5 to 1e-4)
3. Use frozen embeddings for small datasets
4. Apply dropout for regularization

**For Structure-Based Tasks:**
1. Use GearNet with multiple edge types
2. Include geometric features (angles, dihedrals)
3. Pre-train on large structure databases
4. Use data augmentation (rotations, crops)

**For Small Datasets:**
1. Transfer learning from pre-trained models
2. Multi-task learning with related tasks
3. Data augmentation (sequence mutations, structure perturbations)
4. Strong regularization (dropout, weight decay)

## Common Use Cases

### Enzyme Engineering
- Predict enzyme activity from sequence
- Design mutations to improve stability
- Screen for desired catalytic properties

### Antibody Design
- Predict binding affinity
- Optimize antibody sequences
- Predict immunogenicity

### Drug Target Identification
- Predict protein function
- Identify druggable sites
- Analyze protein-ligand interactions

### Protein Structure Prediction
- Predict secondary structure from sequence
- Generate contact maps for tertiary structure
- Refine AlphaFold predictions

## Integration with Other Tools

### AlphaFold Integration

Load AlphaFold-predicted structures:
```python
from torchdrug import data

# Load AlphaFold structure
protein = data.Protein.from_pdb("alphafold_structure.pdb")

# Use in TorchDrug workflows
```

### ESMFold Integration

Use ESMFold for structure prediction, then analyze with TorchDrug models.

### Rosetta/PyRosetta

Generate structures with Rosetta, import to TorchDrug for analysis.
