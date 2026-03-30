---
name: pytdc
description: Therapeutics Data Commons. AI-ready drug discovery datasets (ADME, toxicity, DTI), benchmarks, scaffold splits, molecular oracles, for therapeutic ML and pharmacological prediction.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# PyTDC (Therapeutics Data Commons)

## Overview

PyTDC is an open-science platform providing AI-ready datasets and benchmarks for drug discovery and development. Access curated datasets spanning the entire therapeutics pipeline with standardized evaluation metrics and meaningful data splits, organized into three categories: single-instance prediction (molecular/protein properties), multi-instance prediction (drug-target interactions, DDI), and generation (molecule generation, retrosynthesis).

## When to Use This Skill

This skill should be used when:
- Working with drug discovery or therapeutic ML datasets
- Benchmarking machine learning models on standardized pharmaceutical tasks
- Predicting molecular properties (ADME, toxicity, bioactivity)
- Predicting drug-target or drug-drug interactions
- Generating novel molecules with desired properties
- Accessing curated datasets with proper train/test splits (scaffold, cold-split)
- Using molecular oracles for property optimization

## Installation & Setup

Install PyTDC using pip:

```bash
uv pip install PyTDC
```

To upgrade to the latest version:

```bash
uv pip install PyTDC --upgrade
```

Core dependencies (automatically installed):
- numpy, pandas, tqdm, seaborn, scikit_learn, fuzzywuzzy

Additional packages are installed automatically as needed for specific features.

## Quick Start

The basic pattern for accessing any TDC dataset follows this structure:

```python
from tdc.<problem> import <Task>
data = <Task>(name='<Dataset>')
split = data.get_split(method='scaffold', seed=1, frac=[0.7, 0.1, 0.2])
df = data.get_data(format='df')
```

Where:
- `<problem>`: One of `single_pred`, `multi_pred`, or `generation`
- `<Task>`: Specific task category (e.g., ADME, DTI, MolGen)
- `<Dataset>`: Dataset name within that task

**Example - Loading ADME data:**

```python
from tdc.single_pred import ADME
data = ADME(name='Caco2_Wang')
split = data.get_split(method='scaffold')
# Returns dict with 'train', 'valid', 'test' DataFrames
```

## Single-Instance Prediction Tasks

Single-instance prediction involves forecasting properties of individual biomedical entities (molecules, proteins, etc.).

### Available Task Categories

#### 1. ADME (Absorption, Distribution, Metabolism, Excretion)

Predict pharmacokinetic properties of drug molecules.

```python
from tdc.single_pred import ADME
data = ADME(name='Caco2_Wang')  # Intestinal permeability
# Other datasets: HIA_Hou, Bioavailability_Ma, Lipophilicity_AstraZeneca, etc.
```

**Common ADME datasets:**
- Caco2 - Intestinal permeability
- HIA - Human intestinal absorption
- Bioavailability - Oral bioavailability
- Lipophilicity - Octanol-water partition coefficient
- Solubility - Aqueous solubility
- BBB - Blood-brain barrier penetration
- CYP - Cytochrome P450 metabolism

#### 2. Toxicity (Tox)

Predict toxicity and adverse effects of compounds.

```python
from tdc.single_pred import Tox
data = Tox(name='hERG')  # Cardiotoxicity
# Other datasets: AMES, DILI, Carcinogens_Lagunin, etc.
```

**Common toxicity datasets:**
- hERG - Cardiac toxicity
- AMES - Mutagenicity
- DILI - Drug-induced liver injury
- Carcinogens - Carcinogenicity
- ClinTox - Clinical trial toxicity

#### 3. HTS (High-Throughput Screening)

Bioactivity predictions from screening data.

```python
from tdc.single_pred import HTS
data = HTS(name='SARSCoV2_Vitro_Touret')
```

#### 4. QM (Quantum Mechanics)

Quantum mechanical properties of molecules.

```python
from tdc.single_pred import QM
data = QM(name='QM7')
```

#### 5. Other Single Prediction Tasks

- **Yields**: Chemical reaction yield prediction
- **Epitope**: Epitope prediction for biologics
- **Develop**: Development-stage predictions
- **CRISPROutcome**: Gene editing outcome prediction

### Data Format

Single prediction datasets typically return DataFrames with columns:
- `Drug_ID` or `Compound_ID`: Unique identifier
- `Drug` or `X`: SMILES string or molecular representation
- `Y`: Target label (continuous or binary)

## Multi-Instance Prediction Tasks

Multi-instance prediction involves forecasting properties of interactions between multiple biomedical entities.

### Available Task Categories

#### 1. DTI (Drug-Target Interaction)

Predict binding affinity between drugs and protein targets.

```python
from tdc.multi_pred import DTI
data = DTI(name='BindingDB_Kd')
split = data.get_split()
```

**Available datasets:**
- BindingDB_Kd - Dissociation constant (52,284 pairs)
- BindingDB_IC50 - Half-maximal inhibitory concentration (991,486 pairs)
- BindingDB_Ki - Inhibition constant (375,032 pairs)
- DAVIS, KIBA - Kinase binding datasets

**Data format:** Drug_ID, Target_ID, Drug (SMILES), Target (sequence), Y (binding affinity)

#### 2. DDI (Drug-Drug Interaction)

Predict interactions between drug pairs.

```python
from tdc.multi_pred import DDI
data = DDI(name='DrugBank')
split = data.get_split()
```

Multi-class classification task predicting interaction types. Dataset contains 191,808 DDI pairs with 1,706 drugs.

#### 3. PPI (Protein-Protein Interaction)

Predict protein-protein interactions.

```python
from tdc.multi_pred import PPI
data = PPI(name='HuRI')
```

#### 4. Other Multi-Prediction Tasks

- **GDA**: Gene-disease associations
- **DrugRes**: Drug resistance prediction
- **DrugSyn**: Drug synergy prediction
- **PeptideMHC**: Peptide-MHC binding
- **AntibodyAff**: Antibody affinity prediction
- **MTI**: miRNA-target interactions
- **Catalyst**: Catalyst prediction
- **TrialOutcome**: Clinical trial outcome prediction

## Generation Tasks

Generation tasks involve creating novel biomedical entities with desired properties.

### 1. Molecular Generation (MolGen)

Generate diverse, novel molecules with desirable chemical properties.

```python
from tdc.generation import MolGen
data = MolGen(name='ChEMBL_V29')
split = data.get_split()
```

Use with oracles to optimize for specific properties:

```python
from tdc import Oracle
oracle = Oracle(name='GSK3B')
score = oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O')  # Evaluate SMILES
```

See `references/oracles.md` for all available oracle functions.

### 2. Retrosynthesis (RetroSyn)

Predict reactants needed to synthesize a target molecule.

```python
from tdc.generation import RetroSyn
data = RetroSyn(name='USPTO')
split = data.get_split()
```

Dataset contains 1,939,253 reactions from USPTO database.

### 3. Paired Molecule Generation

Generate molecule pairs (e.g., prodrug-drug pairs).

```python
from tdc.generation import PairMolGen
data = PairMolGen(name='Prodrug')
```

For detailed oracle documentation and molecular generation workflows, refer to `references/oracles.md` and `scripts/molecular_generation.py`.

## Benchmark Groups

Benchmark groups provide curated collections of related datasets for systematic model evaluation.

### ADMET Benchmark Group

```python
from tdc.benchmark_group import admet_group
group = admet_group(path='data/')

# Get benchmark datasets
benchmark = group.get('Caco2_Wang')
predictions = {}

for seed in [1, 2, 3, 4, 5]:
    train, valid = benchmark['train'], benchmark['valid']
    # Train model here
    predictions[seed] = model.predict(benchmark['test'])

# Evaluate with required 5 seeds
results = group.evaluate(predictions)
```

**ADMET Group includes 22 datasets** covering absorption, distribution, metabolism, excretion, and toxicity.

### Other Benchmark Groups

Available benchmark groups include collections for:
- ADMET properties
- Drug-target interactions
- Drug combination prediction
- And more specialized therapeutic tasks

For benchmark evaluation workflows, see `scripts/benchmark_evaluation.py`.

## Data Functions

TDC provides comprehensive data processing utilities organized into four categories.

### 1. Dataset Splits

Retrieve train/validation/test partitions with various strategies:

```python
# Scaffold split (default for most tasks)
split = data.get_split(method='scaffold', seed=1, frac=[0.7, 0.1, 0.2])

# Random split
split = data.get_split(method='random', seed=42, frac=[0.8, 0.1, 0.1])

# Cold split (for DTI/DDI tasks)
split = data.get_split(method='cold_drug', seed=1)  # Unseen drugs in test
split = data.get_split(method='cold_target', seed=1)  # Unseen targets in test
```

**Available split strategies:**
- `random`: Random shuffling
- `scaffold`: Scaffold-based (for chemical diversity)
- `cold_drug`, `cold_target`, `cold_drug_target`: For DTI tasks
- `temporal`: Time-based splits for temporal datasets

### 2. Model Evaluation

Use standardized metrics for evaluation:

```python
from tdc import Evaluator

# For binary classification
evaluator = Evaluator(name='ROC-AUC')
score = evaluator(y_true, y_pred)

# For regression
evaluator = Evaluator(name='RMSE')
score = evaluator(y_true, y_pred)
```

**Available metrics:** ROC-AUC, PR-AUC, F1, Accuracy, RMSE, MAE, R2, Spearman, Pearson, and more.

### 3. Data Processing

TDC provides 11 key processing utilities:

```python
from tdc.chem_utils import MolConvert

# Molecule format conversion
converter = MolConvert(src='SMILES', dst='PyG')
pyg_graph = converter('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
```

**Processing utilities include:**
- Molecule format conversion (SMILES, SELFIES, PyG, DGL, ECFP, etc.)
- Molecule filters (PAINS, drug-likeness)
- Label binarization and unit conversion
- Data balancing (over/under-sampling)
- Negative sampling for pair data
- Graph transformation
- Entity retrieval (CID to SMILES, UniProt to sequence)

For comprehensive utilities documentation, see `references/utilities.md`.

### 4. Molecule Generation Oracles

TDC provides 17+ oracle functions for molecular optimization:

```python
from tdc import Oracle

# Single oracle
oracle = Oracle(name='DRD2')
score = oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O')

# Multiple oracles
oracle = Oracle(name='JNK3')
scores = oracle(['SMILES1', 'SMILES2', 'SMILES3'])
```

For complete oracle documentation, see `references/oracles.md`.

## Advanced Features

### Retrieve Available Datasets

```python
from tdc.utils import retrieve_dataset_names

# Get all ADME datasets
adme_datasets = retrieve_dataset_names('ADME')

# Get all DTI datasets
dti_datasets = retrieve_dataset_names('DTI')
```

### Label Transformations

```python
# Get label mapping
label_map = data.get_label_map(name='DrugBank')

# Convert labels
from tdc.chem_utils import label_transform
transformed = label_transform(y, from_unit='nM', to_unit='p')
```

### Database Queries

```python
from tdc.utils import cid2smiles, uniprot2seq

# Convert PubChem CID to SMILES
smiles = cid2smiles(2244)

# Convert UniProt ID to amino acid sequence
sequence = uniprot2seq('P12345')
```

## Common Workflows

### Workflow 1: Train a Single Prediction Model

See `scripts/load_and_split_data.py` for a complete example:

```python
from tdc.single_pred import ADME
from tdc import Evaluator

# Load data
data = ADME(name='Caco2_Wang')
split = data.get_split(method='scaffold', seed=42)

train, valid, test = split['train'], split['valid'], split['test']

# Train model (user implements)
# model.fit(train['Drug'], train['Y'])

# Evaluate
evaluator = Evaluator(name='MAE')
# score = evaluator(test['Y'], predictions)
```

### Workflow 2: Benchmark Evaluation

See `scripts/benchmark_evaluation.py` for a complete example with multiple seeds and proper evaluation protocol.

### Workflow 3: Molecular Generation with Oracles

See `scripts/molecular_generation.py` for an example of goal-directed generation using oracle functions.

## Resources

This skill includes bundled resources for common TDC workflows:

### scripts/

- `load_and_split_data.py`: Template for loading and splitting TDC datasets with various strategies
- `benchmark_evaluation.py`: Template for running benchmark group evaluations with proper 5-seed protocol
- `molecular_generation.py`: Template for molecular generation using oracle functions

### references/

- `datasets.md`: Comprehensive catalog of all available datasets organized by task type
- `oracles.md`: Complete documentation of all 17+ molecule generation oracles
- `utilities.md`: Detailed guide to data processing, splitting, and evaluation utilities

## Additional Resources

- **Official Website**: https://tdcommons.ai
- **Documentation**: https://tdc.readthedocs.io
- **GitHub**: https://github.com/mims-harvard/TDC
- **Paper**: NeurIPS 2021 - "Therapeutics Data Commons: Machine Learning Datasets and Tasks for Drug Discovery and Development"

