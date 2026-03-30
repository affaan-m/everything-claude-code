# TDC Utilities and Data Functions

This document provides comprehensive documentation for TDC's data processing, evaluation, and utility functions.

## Overview

TDC provides utilities organized into four main categories:
1. **Dataset Splits** - Train/validation/test partitioning strategies
2. **Model Evaluation** - Standardized performance metrics
3. **Data Processing** - Molecule conversion, filtering, and transformation
4. **Entity Retrieval** - Database queries and conversions

## 1. Dataset Splits

Dataset splitting is crucial for evaluating model generalization. TDC provides multiple splitting strategies designed for therapeutic ML.

### Basic Split Usage

```python
from tdc.single_pred import ADME

data = ADME(name='Caco2_Wang')

# Get split with default parameters
split = data.get_split()
# Returns: {'train': DataFrame, 'valid': DataFrame, 'test': DataFrame}

# Customize split parameters
split = data.get_split(
    method='scaffold',
    seed=42,
    frac=[0.7, 0.1, 0.2]
)
```

### Split Methods

#### Random Split
Random shuffling of data - suitable for general ML tasks.

```python
split = data.get_split(method='random', seed=1)
```

**When to use:**
- Baseline model evaluation
- When chemical/temporal structure is not important
- Quick prototyping

**Not recommended for:**
- Realistic drug discovery scenarios
- Evaluating generalization to new chemical matter

#### Scaffold Split
Splits based on molecular scaffolds (Bemis-Murcko scaffolds) - ensures test molecules are structurally distinct from training.

```python
split = data.get_split(method='scaffold', seed=1)
```

**When to use:**
- Default for most single prediction tasks
- Evaluating generalization to new chemical series
- Realistic drug discovery scenarios

**How it works:**
1. Extract Bemis-Murcko scaffold from each molecule
2. Group molecules by scaffold
3. Assign scaffolds to train/valid/test sets
4. Ensures test molecules have unseen scaffolds

#### Cold Splits (DTI/DDI Tasks)
For multi-instance prediction, cold splits ensure test set contains unseen drugs, targets, or both.

**Cold Drug Split:**
```python
from tdc.multi_pred import DTI
data = DTI(name='BindingDB_Kd')
split = data.get_split(method='cold_drug', seed=1)
```
- Test set contains drugs not seen during training
- Evaluates generalization to new compounds

**Cold Target Split:**
```python
split = data.get_split(method='cold_target', seed=1)
```
- Test set contains targets not seen during training
- Evaluates generalization to new proteins

**Cold Drug-Target Split:**
```python
split = data.get_split(method='cold_drug_target', seed=1)
```
- Test set contains novel drug-target pairs
- Most challenging evaluation scenario

#### Temporal Split
For datasets with temporal information - ensures test data is from later time points.

```python
split = data.get_split(method='temporal', seed=1)
```

**When to use:**
- Datasets with time stamps
- Simulating prospective prediction
- Clinical trial outcome prediction

### Custom Split Fractions

```python
# 80% train, 10% valid, 10% test
split = data.get_split(method='scaffold', frac=[0.8, 0.1, 0.1])

# 70% train, 15% valid, 15% test
split = data.get_split(method='scaffold', frac=[0.7, 0.15, 0.15])
```

### Stratified Splits

For classification tasks with imbalanced labels:

```python
split = data.get_split(method='scaffold', stratified=True)
```

Maintains label distribution across train/valid/test sets.

## 2. Model Evaluation

TDC provides standardized evaluation metrics for different task types.

### Basic Evaluator Usage

```python
from tdc import Evaluator

# Initialize evaluator
evaluator = Evaluator(name='ROC-AUC')

# Evaluate predictions
score = evaluator(y_true, y_pred)
```

### Classification Metrics

#### ROC-AUC
Receiver Operating Characteristic - Area Under Curve

```python
evaluator = Evaluator(name='ROC-AUC')
score = evaluator(y_true, y_pred_proba)
```

**Best for:**
- Binary classification
- Imbalanced datasets
- Overall discriminative ability

**Range:** 0-1 (higher is better, 0.5 is random)

#### PR-AUC
Precision-Recall Area Under Curve

```python
evaluator = Evaluator(name='PR-AUC')
score = evaluator(y_true, y_pred_proba)
```

**Best for:**
- Highly imbalanced datasets
- When positive class is rare
- Complements ROC-AUC

**Range:** 0-1 (higher is better)

#### F1 Score
Harmonic mean of precision and recall

```python
evaluator = Evaluator(name='F1')
score = evaluator(y_true, y_pred_binary)
```

**Best for:**
- Balance between precision and recall
- Multi-class classification

**Range:** 0-1 (higher is better)

#### Accuracy
Fraction of correct predictions

```python
evaluator = Evaluator(name='Accuracy')
score = evaluator(y_true, y_pred_binary)
```

**Best for:**
- Balanced datasets
- Simple baseline metric

**Not recommended for:** Imbalanced datasets

#### Cohen's Kappa
Agreement between predictions and ground truth, accounting for chance

```python
evaluator = Evaluator(name='Kappa')
score = evaluator(y_true, y_pred_binary)
```

**Range:** -1 to 1 (higher is better, 0 is random)

### Regression Metrics

#### RMSE - Root Mean Squared Error
```python
evaluator = Evaluator(name='RMSE')
score = evaluator(y_true, y_pred)
```

**Best for:**
- Continuous predictions
- Penalizes large errors heavily

**Range:** 0-∞ (lower is better)

#### MAE - Mean Absolute Error
```python
evaluator = Evaluator(name='MAE')
score = evaluator(y_true, y_pred)
```

**Best for:**
- Continuous predictions
- More robust to outliers than RMSE

**Range:** 0-∞ (lower is better)

#### R² - Coefficient of Determination
```python
evaluator = Evaluator(name='R2')
score = evaluator(y_true, y_pred)
```

**Best for:**
- Variance explained by model
- Comparing different models

**Range:** -∞ to 1 (higher is better, 1 is perfect)

#### MSE - Mean Squared Error
```python
evaluator = Evaluator(name='MSE')
score = evaluator(y_true, y_pred)
```

**Range:** 0-∞ (lower is better)

### Ranking Metrics

#### Spearman Correlation
Rank correlation coefficient

```python
evaluator = Evaluator(name='Spearman')
score = evaluator(y_true, y_pred)
```

**Best for:**
- Ranking tasks
- Non-linear relationships
- Ordinal data

**Range:** -1 to 1 (higher is better)

#### Pearson Correlation
Linear correlation coefficient

```python
evaluator = Evaluator(name='Pearson')
score = evaluator(y_true, y_pred)
```

**Best for:**
- Linear relationships
- Continuous data

**Range:** -1 to 1 (higher is better)

### Multi-Label Classification

```python
evaluator = Evaluator(name='Micro-F1')
score = evaluator(y_true_multilabel, y_pred_multilabel)
```

Available: `Micro-F1`, `Macro-F1`, `Micro-AUPR`, `Macro-AUPR`

### Benchmark Group Evaluation

For benchmark groups, evaluation requires multiple seeds:

```python
from tdc.benchmark_group import admet_group

group = admet_group(path='data/')
benchmark = group.get('Caco2_Wang')

# Predictions must be dict with seeds as keys
predictions = {}
for seed in [1, 2, 3, 4, 5]:
    # Train model and predict
    predictions[seed] = model_predictions

# Evaluate with mean and std across seeds
results = group.evaluate(predictions)
print(results)  # {'Caco2_Wang': [mean_score, std_score]}
```

## 3. Data Processing

TDC provides 11 comprehensive data processing utilities.

### Molecule Format Conversion

Convert between ~15 molecular representations.

```python
from tdc.chem_utils import MolConvert

# SMILES to PyTorch Geometric
converter = MolConvert(src='SMILES', dst='PyG')
pyg_graph = converter('CC(C)Cc1ccc(cc1)C(C)C(O)=O')

# SMILES to DGL
converter = MolConvert(src='SMILES', dst='DGL')
dgl_graph = converter('CC(C)Cc1ccc(cc1)C(C)C(O)=O')

# SMILES to Morgan Fingerprint (ECFP)
converter = MolConvert(src='SMILES', dst='ECFP')
fingerprint = converter('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
```

**Available formats:**
- **Text**: SMILES, SELFIES, InChI
- **Fingerprints**: ECFP (Morgan), MACCS, RDKit, AtomPair, TopologicalTorsion
- **Graphs**: PyG (PyTorch Geometric), DGL (Deep Graph Library)
- **3D**: Graph3D, Coulomb Matrix, Distance Matrix

**Batch conversion:**
```python
converter = MolConvert(src='SMILES', dst='PyG')
graphs = converter(['SMILES1', 'SMILES2', 'SMILES3'])
```

### Molecule Filters

Remove non-drug-like molecules using curated chemical rules.

```python
from tdc.chem_utils import MolFilter

# Initialize filter with rules
mol_filter = MolFilter(
    rules=['PAINS', 'BMS'],  # Chemical filter rules
    property_filters_dict={
        'MW': (150, 500),      # Molecular weight range
        'LogP': (-0.4, 5.6),   # Lipophilicity range
        'HBD': (0, 5),         # H-bond donors
        'HBA': (0, 10)         # H-bond acceptors
    }
)

# Filter molecules
filtered_smiles = mol_filter(smiles_list)
```

**Available filter rules:**
- `PAINS` - Pan-Assay Interference Compounds
- `BMS` - Bristol-Myers Squibb HTS deck filters
- `Glaxo` - GlaxoSmithKline filters
- `Dundee` - University of Dundee filters
- `Inpharmatica` - Inpharmatica filters
- `LINT` - Pfizer LINT filters

### Label Distribution Visualization

```python
# Visualize label distribution
data.label_distribution()

# Print statistics
data.print_stats()
```

Displays histogram and computes mean, median, std for continuous labels.

### Label Binarization

Convert continuous labels to binary using threshold.

```python
from tdc.utils import binarize

# Binarize with threshold
binary_labels = binarize(y_continuous, threshold=5.0, order='ascending')
# order='ascending': values >= threshold become 1
# order='descending': values <= threshold become 1
```

### Label Units Conversion

Transform between measurement units.

```python
from tdc.chem_utils import label_transform

# Convert nM to pKd
y_pkd = label_transform(y_nM, from_unit='nM', to_unit='p')

# Convert μM to nM
y_nM = label_transform(y_uM, from_unit='uM', to_unit='nM')
```

**Available conversions:**
- Binding affinity: nM, μM, pKd, pKi, pIC50
- Log transformations
- Natural log conversions

### Label Meaning

Get interpretable descriptions for labels.

```python
# Get label mapping
label_map = data.get_label_map(name='DrugBank')
print(label_map)
# {0: 'No interaction', 1: 'Increased effect', 2: 'Decreased effect', ...}
```

### Data Balancing

Handle class imbalance via over/under-sampling.

```python
from tdc.utils import balance

# Oversample minority class
X_balanced, y_balanced = balance(X, y, method='oversample')

# Undersample majority class
X_balanced, y_balanced = balance(X, y, method='undersample')
```

### Graph Transformation for Pair Data

Convert paired data to graph representations.

```python
from tdc.utils import create_graph_from_pairs

# Create graph from drug-drug pairs
graph = create_graph_from_pairs(
    pairs=ddi_pairs,  # [(drug1, drug2, label), ...]
    format='edge_list'  # or 'PyG', 'DGL'
)
```

### Negative Sampling

Generate negative samples for binary tasks.

```python
from tdc.utils import negative_sample

# Generate negative samples for DTI
negative_pairs = negative_sample(
    positive_pairs=known_interactions,
    all_drugs=drug_list,
    all_targets=target_list,
    ratio=1.0  # Negative:positive ratio
)
```

**Use cases:**
- Drug-target interaction prediction
- Drug-drug interaction tasks
- Creating balanced datasets

### Entity Retrieval

Convert between database identifiers.

#### PubChem CID to SMILES
```python
from tdc.utils import cid2smiles

smiles = cid2smiles(2244)  # Aspirin
# Returns: 'CC(=O)Oc1ccccc1C(=O)O'
```

#### UniProt ID to Amino Acid Sequence
```python
from tdc.utils import uniprot2seq

sequence = uniprot2seq('P12345')
# Returns: 'MVKVYAPASS...'
```

#### Batch Retrieval
```python
# Multiple CIDs
smiles_list = [cid2smiles(cid) for cid in [2244, 5090, 6323]]

# Multiple UniProt IDs
sequences = [uniprot2seq(uid) for uid in ['P12345', 'Q9Y5S9']]
```

## 4. Advanced Utilities

### Retrieve Dataset Names

```python
from tdc.utils import retrieve_dataset_names

# Get all datasets for a task
adme_datasets = retrieve_dataset_names('ADME')
dti_datasets = retrieve_dataset_names('DTI')
tox_datasets = retrieve_dataset_names('Tox')

print(f"ADME datasets: {adme_datasets}")
```

### Fuzzy Search

TDC supports fuzzy matching for dataset names:

```python
from tdc.single_pred import ADME

# These all work (typo-tolerant)
data = ADME(name='Caco2_Wang')
data = ADME(name='caco2_wang')
data = ADME(name='Caco2')  # Partial match
```

### Data Format Options

```python
# Pandas DataFrame (default)
df = data.get_data(format='df')

# Dictionary
data_dict = data.get_data(format='dict')

# DeepPurpose format (for DeepPurpose library)
dp_format = data.get_data(format='DeepPurpose')

# PyG/DGL graphs (if applicable)
graphs = data.get_data(format='PyG')
```

### Data Loader Utilities

```python
from tdc.utils import create_fold

# Create cross-validation folds
folds = create_fold(data, fold=5, seed=42)
# Returns list of (train_idx, test_idx) tuples

# Iterate through folds
for i, (train_idx, test_idx) in enumerate(folds):
    train_data = data.iloc[train_idx]
    test_data = data.iloc[test_idx]
    # Train and evaluate
```

## Common Workflows

### Workflow 1: Complete Data Pipeline

```python
from tdc.single_pred import ADME
from tdc import Evaluator
from tdc.chem_utils import MolConvert, MolFilter

# 1. Load data
data = ADME(name='Caco2_Wang')

# 2. Filter molecules
mol_filter = MolFilter(rules=['PAINS'])
filtered_data = data.get_data()
filtered_data = filtered_data[
    filtered_data['Drug'].apply(lambda x: mol_filter([x]))
]

# 3. Split data
split = data.get_split(method='scaffold', seed=42)
train, valid, test = split['train'], split['valid'], split['test']

# 4. Convert to graph representations
converter = MolConvert(src='SMILES', dst='PyG')
train_graphs = converter(train['Drug'].tolist())

# 5. Train model (user implements)
# model.fit(train_graphs, train['Y'])

# 6. Evaluate
evaluator = Evaluator(name='MAE')
# score = evaluator(test['Y'], predictions)
```

### Workflow 2: Multi-Task Learning Preparation

```python
from tdc.benchmark_group import admet_group
from tdc.chem_utils import MolConvert

# Load benchmark group
group = admet_group(path='data/')

# Get multiple datasets
datasets = ['Caco2_Wang', 'HIA_Hou', 'Bioavailability_Ma']
all_data = {}

for dataset_name in datasets:
    benchmark = group.get(dataset_name)
    all_data[dataset_name] = benchmark

# Prepare for multi-task learning
converter = MolConvert(src='SMILES', dst='ECFP')
# Process each dataset...
```

### Workflow 3: DTI Cold Split Evaluation

```python
from tdc.multi_pred import DTI
from tdc import Evaluator

# Load DTI data
data = DTI(name='BindingDB_Kd')

# Cold drug split
split = data.get_split(method='cold_drug', seed=42)
train, test = split['train'], split['test']

# Verify no drug overlap
train_drugs = set(train['Drug_ID'])
test_drugs = set(test['Drug_ID'])
assert len(train_drugs & test_drugs) == 0, "Drug leakage detected!"

# Train and evaluate
# model.fit(train)
evaluator = Evaluator(name='RMSE')
# score = evaluator(test['Y'], predictions)
```

## Best Practices

1. **Always use meaningful splits** - Use scaffold or cold splits for realistic evaluation
2. **Multiple seeds** - Run experiments with multiple seeds for robust results
3. **Appropriate metrics** - Choose metrics that match your task and dataset characteristics
4. **Data filtering** - Remove PAINS and non-drug-like molecules before training
5. **Format conversion** - Convert molecules to appropriate format for your model
6. **Batch processing** - Use batch operations for efficiency with large datasets

## Performance Tips

- Convert molecules in batch mode for faster processing
- Cache converted representations to avoid recomputation
- Use appropriate data formats for your framework (PyG, DGL, etc.)
- Filter data early in the pipeline to reduce computation

## References

- TDC Documentation: https://tdc.readthedocs.io
- Data Functions: https://tdcommons.ai/fct_overview/
- Evaluation Metrics: https://tdcommons.ai/functions/model_eval/
- Data Splits: https://tdcommons.ai/functions/data_split/
