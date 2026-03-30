# Datasets Reference

## Overview

TorchDrug provides 40+ curated datasets across multiple domains: molecular property prediction, protein modeling, knowledge graph reasoning, and retrosynthesis. All datasets support lazy loading, automatic downloading, and customizable feature extraction.

## Molecular Property Prediction Datasets

### Drug Discovery Classification

| Dataset | Size | Task | Classes | Description |
|---------|------|------|---------|-------------|
| **BACE** | 1,513 | Binary | 2 | β-secretase inhibition for Alzheimer's |
| **BBBP** | 2,039 | Binary | 2 | Blood-brain barrier penetration |
| **HIV** | 41,127 | Binary | 2 | Inhibition of HIV replication |
| **ClinTox** | 1,478 | Multi-label | 2 | Clinical trial toxicity |
| **SIDER** | 1,427 | Multi-label | 27 | Side effects by system organ class |
| **Tox21** | 7,831 | Multi-label | 12 | Toxicity across 12 targets |
| **ToxCast** | 8,576 | Multi-label | 617 | High-throughput toxicology |
| **MUV** | 93,087 | Multi-label | 17 | Unbiased validation for screening |

**Key Features:**
- All use scaffold splits for realistic evaluation
- Binary classification metrics: AUROC, AUPRC
- Multi-label handles missing values

**Use Cases:**
- Drug safety prediction
- Virtual screening
- ADMET property prediction

### Drug Discovery Regression

| Dataset | Size | Property | Units | Description |
|---------|------|----------|-------|-------------|
| **ESOL** | 1,128 | Solubility | log(mol/L) | Water solubility |
| **FreeSolv** | 642 | Hydration | kcal/mol | Hydration free energy |
| **Lipophilicity** | 4,200 | LogD | - | Octanol/water distribution |
| **SAMPL** | 643 | Solvation | kcal/mol | Solvation free energies |

**Metrics:** MAE, RMSE, R²
**Use Cases:** ADME optimization, lead optimization

### Quantum Chemistry

| Dataset | Size | Properties | Description |
|---------|------|------------|-------------|
| **QM7** | 7,165 | 1 | Atomization energy |
| **QM8** | 21,786 | 12 | Electronic spectra, excited states |
| **QM9** | 133,885 | 12 | Geometric, energetic, electronic, thermodynamic |
| **PCQM4M** | 3.8M | 1 | Large-scale HOMO-LUMO gap |

**Properties (QM9):**
- Dipole moment
- Isotropic polarizability
- HOMO/LUMO energies
- Internal energy, enthalpy, free energy
- Heat capacity
- Electronic spatial extent

**Use Cases:**
- Quantum property prediction
- Method development benchmarking
- Pre-training molecular models

### Large Molecule Databases

| Dataset | Size | Description | Use Case |
|---------|------|-------------|----------|
| **ZINC250k** | 250,000 | Drug-like molecules | Generative model training |
| **ZINC2M** | 2,000,000 | Drug-like molecules | Large-scale pre-training |
| **ChEMBL** | Millions | Bioactive molecules | Property prediction, generation |

## Protein Datasets

### Function Prediction

| Dataset | Size | Task | Classes | Description |
|---------|------|------|---------|-------------|
| **EnzymeCommission** | 17,562 | Multi-class | 7 levels | EC number classification |
| **GeneOntology** | 46,796 | Multi-label | 489 | GO term prediction (BP/MF/CC) |
| **BetaLactamase** | 5,864 | Regression | - | Enzyme activity levels |
| **Fluorescence** | 54,025 | Regression | - | GFP fluorescence intensity |
| **Stability** | 53,614 | Regression | - | Thermostability (ΔΔG) |

**Features:**
- Sequence and/or structure input
- Evolutionary information available
- Multiple train/test splits

**Use Cases:**
- Protein engineering
- Function annotation
- Enzyme design

### Localization and Solubility

| Dataset | Size | Task | Classes | Description |
|---------|------|------|---------|-------------|
| **Solubility** | 62,478 | Binary | 2 | Protein solubility |
| **BinaryLocalization** | 22,168 | Binary | 2 | Membrane vs soluble |
| **SubcellularLocalization** | 8,943 | Multi-class | 10 | Subcellular compartment |

**Use Cases:**
- Protein expression optimization
- Target identification
- Cell biology

### Structure Prediction

| Dataset | Size | Task | Description |
|---------|------|------|-------------|
| **Fold** | 16,712 | Multi-class (1,195) | Structural fold recognition |
| **SecondaryStructure** | 8,678 | Sequence labeling | 3-state or 8-state prediction |
| **ProteinNet** | Varied | Contact prediction | Residue-residue contacts |

**Use Cases:**
- Structure prediction pipelines
- Fold recognition
- Contact map generation

### Protein Interactions

| Dataset | Size | Positives | Negatives | Description |
|---------|------|-----------|-----------|-------------|
| **HumanPPI** | 1,412 proteins | 6,584 | - | Human protein interactions |
| **YeastPPI** | 2,018 proteins | 6,451 | - | Yeast protein interactions |
| **PPIAffinity** | 2,156 pairs | - | - | Binding affinity values |

**Use Cases:**
- PPI prediction
- Network biology
- Drug target identification

### Protein-Ligand Binding

| Dataset | Size | Type | Description |
|---------|------|------|-------------|
| **BindingDB** | ~1.5M | Affinity | Comprehensive binding data |
| **PDBBind** | 20,000+ | 3D complexes | Structure-based binding |
| - Refined Set | 5,316 | High quality | Curated crystal structures |
| - Core Set | 285 | Benchmark | Diverse test set |

**Use Cases:**
- Binding affinity prediction
- Structure-based drug design
- Scoring function development

### Large Protein Databases

| Dataset | Size | Description |
|---------|------|-------------|
| **AlphaFoldDB** | 200M+ | Predicted structures for most known proteins |
| **UniProt** | Integration | Sequence and annotation data |

## Knowledge Graph Datasets

### General Knowledge

| Dataset | Entities | Relations | Triples | Domain |
|---------|----------|-----------|---------|--------|
| **FB15k** | 14,951 | 1,345 | 592,213 | Freebase (general knowledge) |
| **FB15k-237** | 14,541 | 237 | 310,116 | Filtered Freebase |
| **WN18** | 40,943 | 18 | 151,442 | WordNet (lexical) |
| **WN18RR** | 40,943 | 11 | 93,003 | Filtered WordNet |

**Relation Types (FB15k-237):**
- `/people/person/nationality`
- `/film/film/genre`
- `/location/location/contains`
- `/business/company/founders`
- Many more...

**Use Cases:**
- Link prediction
- Relation extraction
- Knowledge base completion

### Biomedical Knowledge

| Dataset | Entities | Relations | Triples | Description |
|---------|----------|-----------|---------|-------------|
| **Hetionet** | 45,158 | 24 | 2,250,197 | Integrates 29 biomedical databases |

**Entity Types in Hetionet:**
- Genes (20,945)
- Compounds (1,552)
- Diseases (137)
- Anatomy (400)
- Pathways (1,822)
- Pharmacologic classes
- Side effects
- Symptoms
- Molecular functions
- Biological processes
- Cellular components

**Relation Types:**
- Compound-binds-Gene
- Gene-associates-Disease
- Disease-presents-Symptom
- Compound-treats-Disease
- Compound-causes-Side effect
- Gene-participates-Pathway
- And 18 more...

**Use Cases:**
- Drug repurposing
- Disease mechanism discovery
- Target identification
- Multi-hop reasoning in biomedicine

## Citation Network Datasets

| Dataset | Nodes | Edges | Classes | Description |
|---------|-------|-------|---------|-------------|
| **Cora** | 2,708 | 5,429 | 7 | Machine learning papers |
| **CiteSeer** | 3,327 | 4,732 | 6 | Computer science papers |
| **PubMed** | 19,717 | 44,338 | 3 | Biomedical papers |

**Use Cases:**
- Node classification
- GNN baseline comparisons
- Method development

## Retrosynthesis Datasets

| Dataset | Size | Description |
|---------|------|-------------|
| **USPTO-50k** | 50,017 | Curated patent reactions, single-step |

**Features:**
- Product → Reactants mapping
- Atom mapping for reaction centers
- Canonicalized SMILES
- Balanced across reaction types

**Splits:**
- Train: ~40,000
- Validation: ~5,000
- Test: ~5,000

**Use Cases:**
- Retrosynthesis prediction
- Reaction type classification
- Synthetic route planning

## Dataset Usage Patterns

### Loading Datasets

```python
from torchdrug import datasets

# Basic loading
dataset = datasets.BBBP("~/molecule-datasets/")

# With transforms
from torchdrug import transforms
transform = transforms.VirtualNode()
dataset = datasets.BBBP("~/molecule-datasets/", transform=transform)

# Protein dataset
dataset = datasets.EnzymeCommission("~/protein-datasets/")

# Knowledge graph
dataset = datasets.FB15k237("~/kg-datasets/")
```

### Data Splitting

```python
# Random split
train, valid, test = dataset.split([0.8, 0.1, 0.1])

# Scaffold split (for molecules)
from torchdrug import utils
train, valid, test = dataset.split(
    utils.scaffold_split(dataset, [0.8, 0.1, 0.1])
)

# Predefined splits (some datasets)
train, valid, test = dataset.split()
```

### Feature Extraction

**Node Features (Molecules):**
- Atom type (one-hot or embedding)
- Formal charge
- Hybridization
- Aromaticity
- Number of hydrogens
- Chirality

**Edge Features (Molecules):**
- Bond type (single, double, triple, aromatic)
- Stereochemistry
- Conjugation
- Ring membership

**Node Features (Proteins):**
- Amino acid type (one-hot)
- Physicochemical properties
- Position in sequence
- Secondary structure
- Solvent accessibility

**Edge Features (Proteins):**
- Edge type (sequential, spatial, contact)
- Distance
- Angles and dihedrals

## Choosing Datasets

### By Task

**Molecular Property Prediction:**
- Start with BBBP or HIV (medium size, clear task)
- Use QM9 for quantum properties
- ESOL/FreeSolv for regression

**Protein Function:**
- EnzymeCommission (well-defined classes)
- GeneOntology (comprehensive annotations)

**Drug Safety:**
- Tox21 (standard benchmark)
- ClinTox (clinical relevance)

**Structure-Based:**
- PDBBind (protein-ligand)
- ProteinNet (structure prediction)

**Knowledge Graph:**
- FB15k-237 (standard benchmark)
- Hetionet (biomedical applications)

**Generation:**
- ZINC250k (training)
- QM9 (with properties)

**Retrosynthesis:**
- USPTO-50k (only choice)

### By Size and Resources

**Small (<5k, for testing):**
- BACE, FreeSolv, ClinTox
- Core set of PDBBind

**Medium (5k-100k):**
- BBBP, HIV, ESOL, Tox21
- EnzymeCommission, Fold
- FB15k-237, WN18RR

**Large (>100k):**
- QM9, MUV, PCQM4M
- GeneOntology, AlphaFoldDB
- ZINC2M, BindingDB

### By Domain

**Drug Discovery:** BBBP, HIV, Tox21, ESOL, ZINC
**Quantum Chemistry:** QM7, QM8, QM9, PCQM4M
**Protein Engineering:** Fluorescence, Stability, Solubility
**Structural Biology:** Fold, PDBBind, ProteinNet, AlphaFoldDB
**Biomedical:** Hetionet, GeneOntology, EnzymeCommission
**Retrosynthesis:** USPTO-50k

## Best Practices

1. **Start Small**: Test on small datasets before scaling
2. **Scaffold Split**: Use for realistic drug discovery evaluation
3. **Balanced Metrics**: Use AUROC + AUPRC for imbalanced data
4. **Multiple Runs**: Report mean ± std over multiple random seeds
5. **Data Leakage**: Be careful with pre-trained models
6. **Domain Knowledge**: Understand what you're predicting
7. **Validation**: Always use held-out test set
8. **Preprocessing**: Standardize features, handle missing values
