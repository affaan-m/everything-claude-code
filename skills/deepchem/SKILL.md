---
name: deepchem
description: Molecular ML with diverse featurizers and pre-built datasets. Use for property prediction (ADMET, toxicity) with traditional ML or GNNs when you want extensive featurization options and MoleculeNet benchmarks. Best for quick experiments with pre-trained models, diverse molecular representations. For graph-first PyTorch workflows use torchdrug; for benchmark datasets use pytdc.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# DeepChem

## Overview

DeepChem is a comprehensive Python library for applying machine learning to chemistry, materials science, and biology. Enable molecular property prediction, drug discovery, materials design, and biomolecule analysis through specialized neural networks, molecular featurization methods, and pretrained models.

## When to Use This Skill

This skill should be used when:
- Loading and processing molecular data (SMILES strings, SDF files, protein sequences)
- Predicting molecular properties (solubility, toxicity, binding affinity, ADMET properties)
- Training models on chemical/biological datasets
- Using MoleculeNet benchmark datasets (Tox21, BBBP, Delaney, etc.)
- Converting molecules to ML-ready features (fingerprints, graph representations, descriptors)
- Implementing graph neural networks for molecules (GCN, GAT, MPNN, AttentiveFP)
- Applying transfer learning with pretrained models (ChemBERTa, GROVER, MolFormer)
- Predicting crystal/materials properties (bandgap, formation energy)
- Analyzing protein or DNA sequences

## Core Capabilities

### 1. Molecular Data Loading and Processing

DeepChem provides specialized loaders for various chemical data formats:

```python
import deepchem as dc

# Load CSV with SMILES
featurizer = dc.feat.CircularFingerprint(radius=2, size=2048)
loader = dc.data.CSVLoader(
    tasks=['solubility', 'toxicity'],
    feature_field='smiles',
    featurizer=featurizer
)
dataset = loader.create_dataset('molecules.csv')

# Load SDF files
loader = dc.data.SDFLoader(tasks=['activity'], featurizer=featurizer)
dataset = loader.create_dataset('compounds.sdf')

# Load protein sequences
loader = dc.data.FASTALoader()
dataset = loader.create_dataset('proteins.fasta')
```

**Key Loaders**:
- `CSVLoader`: Tabular data with molecular identifiers
- `SDFLoader`: Molecular structure files
- `FASTALoader`: Protein/DNA sequences
- `ImageLoader`: Molecular images
- `JsonLoader`: JSON-formatted datasets

### 2. Molecular Featurization

Convert molecules into numerical representations for ML models.

#### Decision Tree for Featurizer Selection

```
Is the model a graph neural network?
├─ YES → Use graph featurizers
│   ├─ Standard GNN → MolGraphConvFeaturizer
│   ├─ Message passing → DMPNNFeaturizer
│   └─ Pretrained → GroverFeaturizer
│
└─ NO → What type of model?
    ├─ Traditional ML (RF, XGBoost, SVM)
    │   ├─ Fast baseline → CircularFingerprint (ECFP)
    │   ├─ Interpretable → RDKitDescriptors
    │   └─ Maximum coverage → MordredDescriptors
    │
    ├─ Deep learning (non-graph)
    │   ├─ Dense networks → CircularFingerprint
    │   └─ CNN → SmilesToImage
    │
    ├─ Sequence models (LSTM, Transformer)
    │   └─ SmilesToSeq
    │
    └─ 3D structure analysis
        └─ CoulombMatrix
```

#### Example Featurization

```python
# Fingerprints (for traditional ML)
fp = dc.feat.CircularFingerprint(radius=2, size=2048)

# Descriptors (for interpretable models)
desc = dc.feat.RDKitDescriptors()

# Graph features (for GNNs)
graph_feat = dc.feat.MolGraphConvFeaturizer()

# Apply featurization
features = fp.featurize(['CCO', 'c1ccccc1'])
```

**Selection Guide**:
- **Small datasets (<1K)**: CircularFingerprint or RDKitDescriptors
- **Medium datasets (1K-100K)**: CircularFingerprint or graph featurizers
- **Large datasets (>100K)**: Graph featurizers (MolGraphConvFeaturizer, DMPNNFeaturizer)
- **Transfer learning**: Pretrained model featurizers (GroverFeaturizer)

See `references/api_reference.md` for complete featurizer documentation.

### 3. Data Splitting

**Critical**: For drug discovery tasks, use `ScaffoldSplitter` to prevent data leakage from similar molecular structures appearing in both training and test sets.

```python
# Scaffold splitting (recommended for molecules)
splitter = dc.splits.ScaffoldSplitter()
train, valid, test = splitter.train_valid_test_split(
    dataset,
    frac_train=0.8,
    frac_valid=0.1,
    frac_test=0.1
)

# Random splitting (for non-molecular data)
splitter = dc.splits.RandomSplitter()
train, test = splitter.train_test_split(dataset)

# Stratified splitting (for imbalanced classification)
splitter = dc.splits.RandomStratifiedSplitter()
train, test = splitter.train_test_split(dataset)
```

**Available Splitters**:
- `ScaffoldSplitter`: Split by molecular scaffolds (prevents leakage)
- `ButinaSplitter`: Clustering-based molecular splitting
- `MaxMinSplitter`: Maximize diversity between sets
- `RandomSplitter`: Random splitting
- `RandomStratifiedSplitter`: Preserves class distributions

### 4. Model Selection and Training

#### Quick Model Selection Guide

| Dataset Size | Task | Recommended Model | Featurizer |
|-------------|------|-------------------|------------|
| < 1K samples | Any | SklearnModel (RandomForest) | CircularFingerprint |
| 1K-100K | Classification/Regression | GBDTModel or MultitaskRegressor | CircularFingerprint |
| > 100K | Molecular properties | GCNModel, AttentiveFPModel, DMPNNModel | MolGraphConvFeaturizer |
| Any (small preferred) | Transfer learning | ChemBERTa, GROVER, MolFormer | Model-specific |
| Crystal structures | Materials properties | CGCNNModel, MEGNetModel | Structure-based |
| Protein sequences | Protein properties | ProtBERT | Sequence-based |

#### Example: Traditional ML
```python
from sklearn.ensemble import RandomForestRegressor

# Wrap scikit-learn model
sklearn_model = RandomForestRegressor(n_estimators=100)
model = dc.models.SklearnModel(model=sklearn_model)
model.fit(train)
```

#### Example: Deep Learning
```python
# Multitask regressor (for fingerprints)
model = dc.models.MultitaskRegressor(
    n_tasks=2,
    n_features=2048,
    layer_sizes=[1000, 500],
    dropouts=0.25,
    learning_rate=0.001
)
model.fit(train, nb_epoch=50)
```

#### Example: Graph Neural Networks
```python
# Graph Convolutional Network
model = dc.models.GCNModel(
    n_tasks=1,
    mode='regression',
    batch_size=128,
    learning_rate=0.001
)
model.fit(train, nb_epoch=50)

# Graph Attention Network
model = dc.models.GATModel(n_tasks=1, mode='classification')
model.fit(train, nb_epoch=50)

# Attentive Fingerprint
model = dc.models.AttentiveFPModel(n_tasks=1, mode='regression')
model.fit(train, nb_epoch=50)
```

### 5. MoleculeNet Benchmarks

Quick access to 30+ curated benchmark datasets with standardized train/valid/test splits:

```python
# Load benchmark dataset
tasks, datasets, transformers = dc.molnet.load_tox21(
    featurizer='GraphConv',  # or 'ECFP', 'Weave', 'Raw'
    splitter='scaffold',     # or 'random', 'stratified'
    reload=False
)
train, valid, test = datasets

# Train and evaluate
model = dc.models.GCNModel(n_tasks=len(tasks), mode='classification')
model.fit(train, nb_epoch=50)

metric = dc.metrics.Metric(dc.metrics.roc_auc_score)
test_score = model.evaluate(test, [metric])
```

**Common Datasets**:
- **Classification**: `load_tox21()`, `load_bbbp()`, `load_hiv()`, `load_clintox()`
- **Regression**: `load_delaney()`, `load_freesolv()`, `load_lipo()`
- **Quantum properties**: `load_qm7()`, `load_qm8()`, `load_qm9()`
- **Materials**: `load_perovskite()`, `load_bandgap()`, `load_mp_formation_energy()`

See `references/api_reference.md` for complete dataset list.

### 6. Transfer Learning

Leverage pretrained models for improved performance, especially on small datasets:

```python
# ChemBERTa (BERT pretrained on 77M molecules)
model = dc.models.HuggingFaceModel(
    model='seyonec/ChemBERTa-zinc-base-v1',
    task='classification',
    n_tasks=1,
    learning_rate=2e-5  # Lower LR for fine-tuning
)
model.fit(train, nb_epoch=10)

# GROVER (graph transformer pretrained on 10M molecules)
model = dc.models.GroverModel(
    task='regression',
    n_tasks=1
)
model.fit(train, nb_epoch=20)
```

**When to use transfer learning**:
- Small datasets (< 1000 samples)
- Novel molecular scaffolds
- Limited computational resources
- Need for rapid prototyping

Use the `scripts/transfer_learning.py` script for guided transfer learning workflows.

### 7. Model Evaluation

```python
# Define metrics
classification_metrics = [
    dc.metrics.Metric(dc.metrics.roc_auc_score, name='ROC-AUC'),
    dc.metrics.Metric(dc.metrics.accuracy_score, name='Accuracy'),
    dc.metrics.Metric(dc.metrics.f1_score, name='F1')
]

regression_metrics = [
    dc.metrics.Metric(dc.metrics.r2_score, name='R²'),
    dc.metrics.Metric(dc.metrics.mean_absolute_error, name='MAE'),
    dc.metrics.Metric(dc.metrics.root_mean_squared_error, name='RMSE')
]

# Evaluate
train_scores = model.evaluate(train, classification_metrics)
test_scores = model.evaluate(test, classification_metrics)
```

### 8. Making Predictions

```python
# Predict on test set
predictions = model.predict(test)

# Predict on new molecules
new_smiles = ['CCO', 'c1ccccc1', 'CC(C)O']
new_features = featurizer.featurize(new_smiles)
new_dataset = dc.data.NumpyDataset(X=new_features)

# Apply same transformations as training
for transformer in transformers:
    new_dataset = transformer.transform(new_dataset)

predictions = model.predict(new_dataset)
```

## Typical Workflows

### Workflow A: Quick Benchmark Evaluation

For evaluating a model on standard benchmarks:

```python
import deepchem as dc

# 1. Load benchmark
tasks, datasets, _ = dc.molnet.load_bbbp(
    featurizer='GraphConv',
    splitter='scaffold'
)
train, valid, test = datasets

# 2. Train model
model = dc.models.GCNModel(n_tasks=len(tasks), mode='classification')
model.fit(train, nb_epoch=50)

# 3. Evaluate
metric = dc.metrics.Metric(dc.metrics.roc_auc_score)
test_score = model.evaluate(test, [metric])
print(f"Test ROC-AUC: {test_score}")
```

### Workflow B: Custom Data Prediction

For training on custom molecular datasets:

```python
import deepchem as dc

# 1. Load and featurize data
featurizer = dc.feat.CircularFingerprint(radius=2, size=2048)
loader = dc.data.CSVLoader(
    tasks=['activity'],
    feature_field='smiles',
    featurizer=featurizer
)
dataset = loader.create_dataset('my_molecules.csv')

# 2. Split data (use ScaffoldSplitter for molecules!)
splitter = dc.splits.ScaffoldSplitter()
train, valid, test = splitter.train_valid_test_split(dataset)

# 3. Normalize (optional but recommended)
transformers = [dc.trans.NormalizationTransformer(
    transform_y=True, dataset=train
)]
for transformer in transformers:
    train = transformer.transform(train)
    valid = transformer.transform(valid)
    test = transformer.transform(test)

# 4. Train model
model = dc.models.MultitaskRegressor(
    n_tasks=1,
    n_features=2048,
    layer_sizes=[1000, 500],
    dropouts=0.25
)
model.fit(train, nb_epoch=50)

# 5. Evaluate
metric = dc.metrics.Metric(dc.metrics.r2_score)
test_score = model.evaluate(test, [metric])
```

### Workflow C: Transfer Learning on Small Dataset

For leveraging pretrained models:

```python
import deepchem as dc

# 1. Load data (pretrained models often need raw SMILES)
loader = dc.data.CSVLoader(
    tasks=['activity'],
    feature_field='smiles',
    featurizer=dc.feat.DummyFeaturizer()  # Model handles featurization
)
dataset = loader.create_dataset('small_dataset.csv')

# 2. Split data
splitter = dc.splits.ScaffoldSplitter()
train, test = splitter.train_test_split(dataset)

# 3. Load pretrained model
model = dc.models.HuggingFaceModel(
    model='seyonec/ChemBERTa-zinc-base-v1',
    task='classification',
    n_tasks=1,
    learning_rate=2e-5
)

# 4. Fine-tune
model.fit(train, nb_epoch=10)

# 5. Evaluate
predictions = model.predict(test)
```

See `references/workflows.md` for 8 detailed workflow examples covering molecular generation, materials science, protein analysis, and more.

## Example Scripts

This skill includes three production-ready scripts in the `scripts/` directory:

### 1. `predict_solubility.py`
Train and evaluate solubility prediction models. Works with Delaney benchmark or custom CSV data.

```bash
# Use Delaney benchmark
python scripts/predict_solubility.py

# Use custom data
python scripts/predict_solubility.py \
    --data my_data.csv \
    --smiles-col smiles \
    --target-col solubility \
    --predict "CCO" "c1ccccc1"
```

### 2. `graph_neural_network.py`
Train various graph neural network architectures on molecular data.

```bash
# Train GCN on Tox21
python scripts/graph_neural_network.py --model gcn --dataset tox21

# Train AttentiveFP on custom data
python scripts/graph_neural_network.py \
    --model attentivefp \
    --data molecules.csv \
    --task-type regression \
    --targets activity \
    --epochs 100
```

### 3. `transfer_learning.py`
Fine-tune pretrained models (ChemBERTa, GROVER) on molecular property prediction tasks.

```bash
# Fine-tune ChemBERTa on BBBP
python scripts/transfer_learning.py --model chemberta --dataset bbbp

# Fine-tune GROVER on custom data
python scripts/transfer_learning.py \
    --model grover \
    --data small_dataset.csv \
    --target activity \
    --task-type classification \
    --epochs 20
```

## Common Patterns and Best Practices

### Pattern 1: Always Use Scaffold Splitting for Molecules
```python
# GOOD: Prevents data leakage
splitter = dc.splits.ScaffoldSplitter()
train, test = splitter.train_test_split(dataset)

# BAD: Similar molecules in train and test
splitter = dc.splits.RandomSplitter()
train, test = splitter.train_test_split(dataset)
```

### Pattern 2: Normalize Features and Targets
```python
transformers = [
    dc.trans.NormalizationTransformer(
        transform_y=True,  # Also normalize target values
        dataset=train
    )
]
for transformer in transformers:
    train = transformer.transform(train)
    test = transformer.transform(test)
```

### Pattern 3: Start Simple, Then Scale
1. Start with Random Forest + CircularFingerprint (fast baseline)
2. Try XGBoost/LightGBM if RF works well
3. Move to deep learning (MultitaskRegressor) if you have >5K samples
4. Try GNNs if you have >10K samples
5. Use transfer learning for small datasets or novel scaffolds

### Pattern 4: Handle Imbalanced Data
```python
# Option 1: Balancing transformer
transformer = dc.trans.BalancingTransformer(dataset=train)
train = transformer.transform(train)

# Option 2: Use balanced metrics
metric = dc.metrics.Metric(dc.metrics.balanced_accuracy_score)
```

### Pattern 5: Avoid Memory Issues
```python
# Use DiskDataset for large datasets
dataset = dc.data.DiskDataset.from_numpy(X, y, w, ids)

# Use smaller batch sizes
model = dc.models.GCNModel(batch_size=32)  # Instead of 128
```

## Common Pitfalls

### Issue 1: Data Leakage in Drug Discovery
**Problem**: Using random splitting allows similar molecules in train/test sets.
**Solution**: Always use `ScaffoldSplitter` for molecular datasets.

### Issue 2: GNN Underperforming vs Fingerprints
**Problem**: Graph neural networks perform worse than simple fingerprints.
**Solutions**:
- Ensure dataset is large enough (>10K samples typically)
- Increase training epochs (50-100)
- Try different architectures (AttentiveFP, DMPNN instead of GCN)
- Use pretrained models (GROVER)

### Issue 3: Overfitting on Small Datasets
**Problem**: Model memorizes training data.
**Solutions**:
- Use stronger regularization (increase dropout to 0.5)
- Use simpler models (Random Forest instead of deep learning)
- Apply transfer learning (ChemBERTa, GROVER)
- Collect more data

### Issue 4: Import Errors
**Problem**: Module not found errors.
**Solution**: Ensure DeepChem is installed with required dependencies:
```bash
uv pip install deepchem
# For PyTorch models
uv pip install deepchem[torch]
# For all features
uv pip install deepchem[all]
```

## Reference Documentation

This skill includes comprehensive reference documentation:

### `references/api_reference.md`
Complete API documentation including:
- All data loaders and their use cases
- Dataset classes and when to use each
- Complete featurizer catalog with selection guide
- Model catalog organized by category (50+ models)
- MoleculeNet dataset descriptions
- Metrics and evaluation functions
- Common code patterns

**When to reference**: Search this file when you need specific API details, parameter names, or want to explore available options.

### `references/workflows.md`
Eight detailed end-to-end workflows:
1. Molecular property prediction from SMILES
2. Using MoleculeNet benchmarks
3. Hyperparameter optimization
4. Transfer learning with pretrained models
5. Molecular generation with GANs
6. Materials property prediction
7. Protein sequence analysis
8. Custom model integration

**When to reference**: Use these workflows as templates for implementing complete solutions.

## Installation Notes

Basic installation:
```bash
uv pip install deepchem
```

For PyTorch models (GCN, GAT, etc.):
```bash
uv pip install deepchem[torch]
```

For all features:
```bash
uv pip install deepchem[all]
```

If import errors occur, the user may need specific dependencies. Check the DeepChem documentation for detailed installation instructions.

## Additional Resources

- Official documentation: https://deepchem.readthedocs.io/
- GitHub repository: https://github.com/deepchem/deepchem
- Tutorials: https://deepchem.readthedocs.io/en/latest/get_started/tutorials.html
- Paper: "MoleculeNet: A Benchmark for Molecular Machine Learning"

