# DeepChem Workflows

This document provides detailed workflows for common DeepChem use cases.

## Workflow 1: Molecular Property Prediction from SMILES

**Goal**: Predict molecular properties (e.g., solubility, toxicity, activity) from SMILES strings.

### Step-by-Step Process

#### 1. Prepare Your Data
Data should be in CSV format with at minimum:
- A column with SMILES strings
- One or more columns with property values (targets)

Example CSV structure:
```csv
smiles,solubility,toxicity
CCO,-0.77,0
CC(=O)OC1=CC=CC=C1C(=O)O,-1.19,1
```

#### 2. Choose Featurizer
Decision tree:
- **Small dataset (<1K)**: Use `CircularFingerprint` or `RDKitDescriptors`
- **Medium dataset (1K-100K)**: Use `CircularFingerprint` or `MolGraphConvFeaturizer`
- **Large dataset (>100K)**: Use graph-based featurizers (`MolGraphConvFeaturizer`, `DMPNNFeaturizer`)
- **Transfer learning**: Use pretrained model featurizers (`GroverFeaturizer`)

#### 3. Load and Featurize Data
```python
import deepchem as dc

# For fingerprint-based
featurizer = dc.feat.CircularFingerprint(radius=2, size=2048)
# OR for graph-based
featurizer = dc.feat.MolGraphConvFeaturizer()

loader = dc.data.CSVLoader(
    tasks=['solubility', 'toxicity'],  # column names to predict
    feature_field='smiles',             # column with SMILES
    featurizer=featurizer
)
dataset = loader.create_dataset('data.csv')
```

#### 4. Split Data
**Critical**: Use `ScaffoldSplitter` for drug discovery to prevent data leakage.

```python
splitter = dc.splits.ScaffoldSplitter()
train, valid, test = splitter.train_valid_test_split(
    dataset,
    frac_train=0.8,
    frac_valid=0.1,
    frac_test=0.1
)
```

#### 5. Transform Data (Optional but Recommended)
```python
transformers = [
    dc.trans.NormalizationTransformer(
        transform_y=True,
        dataset=train
    )
]

for transformer in transformers:
    train = transformer.transform(train)
    valid = transformer.transform(valid)
    test = transformer.transform(test)
```

#### 6. Select and Train Model
```python
# For fingerprints
model = dc.models.MultitaskRegressor(
    n_tasks=2,                    # number of properties to predict
    n_features=2048,              # fingerprint size
    layer_sizes=[1000, 500],      # hidden layer sizes
    dropouts=0.25,
    learning_rate=0.001
)

# OR for graphs
model = dc.models.GCNModel(
    n_tasks=2,
    mode='regression',
    batch_size=128,
    learning_rate=0.001
)

# Train
model.fit(train, nb_epoch=50)
```

#### 7. Evaluate
```python
metric = dc.metrics.Metric(dc.metrics.r2_score)
train_score = model.evaluate(train, [metric])
valid_score = model.evaluate(valid, [metric])
test_score = model.evaluate(test, [metric])

print(f"Train R²: {train_score}")
print(f"Valid R²: {valid_score}")
print(f"Test R²: {test_score}")
```

#### 8. Make Predictions
```python
# Predict on new molecules
new_smiles = ['CCO', 'CC(C)O', 'c1ccccc1']
new_featurizer = dc.feat.CircularFingerprint(radius=2, size=2048)
new_features = new_featurizer.featurize(new_smiles)
new_dataset = dc.data.NumpyDataset(X=new_features)

# Apply same transformations
for transformer in transformers:
    new_dataset = transformer.transform(new_dataset)

predictions = model.predict(new_dataset)
```

---

## Workflow 2: Using MoleculeNet Benchmark Datasets

**Goal**: Quickly train and evaluate models on standard benchmarks.

### Quick Start
```python
import deepchem as dc

# Load benchmark dataset
tasks, datasets, transformers = dc.molnet.load_tox21(
    featurizer='GraphConv',
    splitter='scaffold'
)
train, valid, test = datasets

# Train model
model = dc.models.GCNModel(
    n_tasks=len(tasks),
    mode='classification'
)
model.fit(train, nb_epoch=50)

# Evaluate
metric = dc.metrics.Metric(dc.metrics.roc_auc_score)
test_score = model.evaluate(test, [metric])
print(f"Test ROC-AUC: {test_score}")
```

### Available Featurizer Options
When calling `load_*()` functions:
- `'ECFP'`: Extended-connectivity fingerprints (circular fingerprints)
- `'GraphConv'`: Graph convolution features
- `'Weave'`: Weave features
- `'Raw'`: Raw SMILES strings
- `'smiles2img'`: 2D molecular images

### Available Splitter Options
- `'scaffold'`: Scaffold-based splitting (recommended for drug discovery)
- `'random'`: Random splitting
- `'stratified'`: Stratified splitting (preserves class distributions)
- `'butina'`: Butina clustering-based splitting

---

## Workflow 3: Hyperparameter Optimization

**Goal**: Find optimal model hyperparameters systematically.

### Using GridHyperparamOpt
```python
import deepchem as dc
import numpy as np

# Load data
tasks, datasets, transformers = dc.molnet.load_bbbp(
    featurizer='ECFP',
    splitter='scaffold'
)
train, valid, test = datasets

# Define parameter grid
params_dict = {
    'layer_sizes': [[1000], [1000, 500], [1000, 1000]],
    'dropouts': [0.0, 0.25, 0.5],
    'learning_rate': [0.001, 0.0001]
}

# Define model builder function
def model_builder(model_params, model_dir):
    return dc.models.MultitaskClassifier(
        n_tasks=len(tasks),
        n_features=1024,
        **model_params
    )

# Setup optimizer
metric = dc.metrics.Metric(dc.metrics.roc_auc_score)
optimizer = dc.hyper.GridHyperparamOpt(model_builder)

# Run optimization
best_model, best_params, all_results = optimizer.hyperparam_search(
    params_dict,
    train,
    valid,
    metric,
    transformers=transformers
)

print(f"Best parameters: {best_params}")
print(f"Best validation score: {all_results['best_validation_score']}")
```

---

## Workflow 4: Transfer Learning with Pretrained Models

**Goal**: Leverage pretrained models for improved performance on small datasets.

### Using ChemBERTa
```python
import deepchem as dc
from transformers import AutoTokenizer

# Load your data
loader = dc.data.CSVLoader(
    tasks=['activity'],
    feature_field='smiles',
    featurizer=dc.feat.DummyFeaturizer()  # ChemBERTa handles featurization
)
dataset = loader.create_dataset('data.csv')

# Split data
splitter = dc.splits.ScaffoldSplitter()
train, test = splitter.train_test_split(dataset)

# Load pretrained ChemBERTa
model = dc.models.HuggingFaceModel(
    model='seyonec/ChemBERTa-zinc-base-v1',
    task='regression',
    n_tasks=1
)

# Fine-tune
model.fit(train, nb_epoch=10)

# Evaluate
predictions = model.predict(test)
```

### Using GROVER
```python
# GROVER: pre-trained on molecular graphs
model = dc.models.GroverModel(
    task='classification',
    n_tasks=1,
    model_dir='./grover_model'
)

# Fine-tune on your data
model.fit(train_dataset, nb_epoch=20)
```

---

## Workflow 5: Molecular Generation with GANs

**Goal**: Generate novel molecules with desired properties.

### Basic MolGAN
```python
import deepchem as dc

# Load training data (molecules for the generator to learn from)
tasks, datasets, _ = dc.molnet.load_qm9(
    featurizer='GraphConv',
    splitter='random'
)
train, _, _ = datasets

# Create and train MolGAN
gan = dc.models.BasicMolGANModel(
    learning_rate=0.001,
    vertices=9,  # max atoms in molecule
    edges=5,     # max bonds
    nodes=[128, 256, 512]
)

# Train
gan.fit_gan(
    train,
    nb_epoch=100,
    generator_steps=0.2,
    checkpoint_interval=10
)

# Generate new molecules
generated_molecules = gan.predict_gan_generator(1000)
```

### Conditional Generation
```python
# For property-targeted generation
from deepchem.models.optimizers import ExponentialDecay

gan = dc.models.BasicMolGANModel(
    learning_rate=ExponentialDecay(0.001, 0.9, 1000),
    conditional=True  # enable conditional generation
)

# Train with properties
gan.fit_gan(train, nb_epoch=100)

# Generate molecules with target properties
target_properties = np.array([[5.0, 300.0]])  # e.g., [logP, MW]
molecules = gan.predict_gan_generator(
    1000,
    conditional_inputs=target_properties
)
```

---

## Workflow 6: Materials Property Prediction

**Goal**: Predict properties of crystalline materials.

### Using Crystal Graph Convolutional Networks
```python
import deepchem as dc

# Load materials data (structure files in CIF format)
loader = dc.data.CIFLoader()
dataset = loader.create_dataset('materials.csv')

# Split data
splitter = dc.splits.RandomSplitter()
train, test = splitter.train_test_split(dataset)

# Create CGCNN model
model = dc.models.CGCNNModel(
    n_tasks=1,
    mode='regression',
    batch_size=32,
    learning_rate=0.001
)

# Train
model.fit(train, nb_epoch=100)

# Evaluate
metric = dc.metrics.Metric(dc.metrics.mae_score)
test_score = model.evaluate(test, [metric])
```

---

## Workflow 7: Protein Sequence Analysis

**Goal**: Predict protein properties from sequences.

### Using ProtBERT
```python
import deepchem as dc

# Load protein sequence data
loader = dc.data.FASTALoader()
dataset = loader.create_dataset('proteins.fasta')

# Use ProtBERT
model = dc.models.HuggingFaceModel(
    model='Rostlab/prot_bert',
    task='classification',
    n_tasks=1
)

# Split and train
splitter = dc.splits.RandomSplitter()
train, test = splitter.train_test_split(dataset)
model.fit(train, nb_epoch=5)

# Predict
predictions = model.predict(test)
```

---

## Workflow 8: Custom Model Integration

**Goal**: Use your own PyTorch/scikit-learn models with DeepChem.

### Wrapping Scikit-Learn Models
```python
from sklearn.ensemble import RandomForestRegressor
import deepchem as dc

# Create scikit-learn model
sklearn_model = RandomForestRegressor(
    n_estimators=100,
    max_depth=10,
    random_state=42
)

# Wrap in DeepChem
model = dc.models.SklearnModel(model=sklearn_model)

# Use with DeepChem datasets
model.fit(train)
predictions = model.predict(test)

# Evaluate
metric = dc.metrics.Metric(dc.metrics.r2_score)
score = model.evaluate(test, [metric])
```

### Creating Custom PyTorch Models
```python
import torch
import torch.nn as nn
import deepchem as dc

class CustomNetwork(nn.Module):
    def __init__(self, n_features, n_tasks):
        super().__init__()
        self.fc1 = nn.Linear(n_features, 512)
        self.fc2 = nn.Linear(512, 256)
        self.fc3 = nn.Linear(256, n_tasks)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        return self.fc3(x)

# Wrap in DeepChem TorchModel
model = dc.models.TorchModel(
    model=CustomNetwork(n_features=2048, n_tasks=1),
    loss=nn.MSELoss(),
    output_types=['prediction']
)

# Train
model.fit(train, nb_epoch=50)
```

---

## Common Pitfalls and Solutions

### Issue 1: Data Leakage in Drug Discovery
**Problem**: Using random splitting allows similar molecules in train and test sets.
**Solution**: Always use `ScaffoldSplitter` for molecular datasets.

### Issue 2: Imbalanced Classification
**Problem**: Poor performance on minority class.
**Solution**: Use `BalancingTransformer` or weighted metrics.
```python
transformer = dc.trans.BalancingTransformer(dataset=train)
train = transformer.transform(train)
```

### Issue 3: Memory Issues with Large Datasets
**Problem**: Dataset doesn't fit in memory.
**Solution**: Use `DiskDataset` instead of `NumpyDataset`.
```python
dataset = dc.data.DiskDataset.from_numpy(X, y, w, ids)
```

### Issue 4: Overfitting on Small Datasets
**Problem**: Model memorizes training data.
**Solutions**:
1. Use stronger regularization (increase dropout)
2. Use simpler models (Random Forest, Ridge)
3. Apply transfer learning (pretrained models)
4. Collect more data

### Issue 5: Poor Graph Neural Network Performance
**Problem**: GNN performs worse than fingerprints.
**Solutions**:
1. Check if dataset is large enough (GNNs need >10K samples typically)
2. Increase training epochs
3. Try different GNN architectures (AttentiveFP, DMPNN)
4. Use pretrained models (GROVER)
