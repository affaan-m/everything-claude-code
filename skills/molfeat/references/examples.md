# Molfeat Usage Examples

This document provides practical examples for common molfeat use cases.

## Installation

```bash
# Recommended: Using conda/mamba
mamba install -c conda-forge molfeat

# Alternative: Using pip
pip install molfeat

# With all optional dependencies
pip install "molfeat[all]"

# With specific dependencies
pip install "molfeat[dgl]"          # For GNN models
pip install "molfeat[graphormer]"   # For Graphormer
pip install "molfeat[transformer]"  # For ChemBERTa, ChemGPT
```

---

## Quick Start

### Basic Featurization Workflow

```python
import datamol as dm
from molfeat.calc import FPCalculator
from molfeat.trans import MoleculeTransformer

# Load sample data
data = dm.data.freesolv().sample(100).smiles.values

# Single molecule featurization
calc = FPCalculator("ecfp")
features_single = calc(data[0])
print(f"Single molecule features shape: {features_single.shape}")
# Output: (2048,)

# Batch featurization with parallelization
transformer = MoleculeTransformer(calc, n_jobs=-1)
features_batch = transformer(data)
print(f"Batch features shape: {features_batch.shape}")
# Output: (100, 2048)
```

---

## Calculator Examples

### Fingerprint Calculators

```python
from molfeat.calc import FPCalculator

# ECFP (Extended-Connectivity Fingerprints)
ecfp = FPCalculator("ecfp", radius=3, fpSize=2048)
fp = ecfp("CCO")  # Ethanol
print(f"ECFP shape: {fp.shape}")  # (2048,)

# MACCS keys
maccs = FPCalculator("maccs")
fp = maccs("c1ccccc1")  # Benzene
print(f"MACCS shape: {fp.shape}")  # (167,)

# Count-based fingerprints
ecfp_count = FPCalculator("ecfp-count", radius=3)
fp_count = ecfp_count("CC(C)CC(C)C")  # Non-binary counts

# MAP4 fingerprints
map4 = FPCalculator("map4")
fp = map4("CC(=O)Oc1ccccc1C(=O)O")  # Aspirin
```

### Descriptor Calculators

```python
from molfeat.calc import RDKitDescriptors2D, MordredDescriptors

# RDKit 2D descriptors (200+ properties)
desc2d = RDKitDescriptors2D()
descriptors = desc2d("CCO")
print(f"Number of 2D descriptors: {len(descriptors)}")

# Get descriptor names
names = desc2d.columns
print(f"First 5 descriptors: {names[:5]}")

# Mordred descriptors (1800+ properties)
mordred = MordredDescriptors()
descriptors = mordred("c1ccccc1O")  # Phenol
print(f"Mordred descriptors: {len(descriptors)}")
```

### Pharmacophore Calculators

```python
from molfeat.calc import CATSCalculator

# 2D CATS descriptors
cats = CATSCalculator(mode="2D", scale="raw")
descriptors = cats("CC(C)Cc1ccc(C)cc1C")  # Cymene
print(f"CATS descriptors: {descriptors.shape}")  # (21,)

# 3D CATS descriptors (requires conformer)
cats3d = CATSCalculator(mode="3D", scale="num")
```

---

## Transformer Examples

### Basic Transformer Usage

```python
from molfeat.trans import MoleculeTransformer
from molfeat.calc import FPCalculator
import datamol as dm

# Prepare data
smiles_list = [
    "CCO",
    "CC(=O)O",
    "c1ccccc1",
    "CC(C)O",
    "CCCC"
]

# Create transformer
calc = FPCalculator("ecfp")
transformer = MoleculeTransformer(calc, n_jobs=-1)

# Transform molecules
features = transformer(smiles_list)
print(f"Features shape: {features.shape}")  # (5, 2048)
```

### Error Handling

```python
# Handle invalid SMILES gracefully
smiles_with_errors = [
    "CCO",           # Valid
    "invalid",       # Invalid
    "CC(=O)O",       # Valid
    "xyz123",        # Invalid
]

transformer = MoleculeTransformer(
    FPCalculator("ecfp"),
    n_jobs=-1,
    verbose=True,           # Log errors
    ignore_errors=True      # Continue on failure
)

features = transformer(smiles_with_errors)
# Returns: array with None for failed molecules
print(features)  # [array(...), None, array(...), None]
```

### Concatenating Multiple Featurizers

```python
from molfeat.trans import FeatConcat, MoleculeTransformer
from molfeat.calc import FPCalculator

# Combine MACCS (167) + ECFP (2048) = 2215 dimensions
concat_calc = FeatConcat([
    FPCalculator("maccs"),
    FPCalculator("ecfp", radius=3, fpSize=2048)
])

transformer = MoleculeTransformer(concat_calc, n_jobs=-1)
features = transformer(smiles_list)
print(f"Combined features shape: {features.shape}")  # (n, 2215)

# Triple combination
triple_concat = FeatConcat([
    FPCalculator("maccs"),
    FPCalculator("ecfp"),
    FPCalculator("rdkit")
])
```

### Saving and Loading Configurations

```python
from molfeat.trans import MoleculeTransformer
from molfeat.calc import FPCalculator

# Create and save transformer
transformer = MoleculeTransformer(
    FPCalculator("ecfp", radius=3, fpSize=2048),
    n_jobs=-1
)

# Save to YAML
transformer.to_state_yaml_file("my_featurizer.yml")

# Save to JSON
transformer.to_state_json_file("my_featurizer.json")

# Load from saved state
loaded_transformer = MoleculeTransformer.from_state_yaml_file("my_featurizer.yml")

# Use loaded transformer
features = loaded_transformer(smiles_list)
```

---

## Pretrained Model Examples

### Using the ModelStore

```python
from molfeat.store.modelstore import ModelStore

# Initialize model store
store = ModelStore()

# List all available models
print(f"Total available models: {len(store.available_models)}")

# Search for specific models
chemberta_models = store.search(name="ChemBERTa")
for model in chemberta_models:
    print(f"- {model.name}: {model.description}")

# Get model information
model_card = store.search(name="ChemBERTa-77M-MLM")[0]
print(f"Model: {model_card.name}")
print(f"Version: {model_card.version}")
print(f"Authors: {model_card.authors}")

# View usage instructions
model_card.usage()

# Load model directly
transformer = store.load("ChemBERTa-77M-MLM")
```

### ChemBERTa Embeddings

```python
from molfeat.trans.pretrained import PretrainedMolTransformer

# Load ChemBERTa model
chemberta = PretrainedMolTransformer("ChemBERTa-77M-MLM", n_jobs=-1)

# Generate embeddings
smiles = ["CCO", "CC(=O)O", "c1ccccc1"]
embeddings = chemberta(smiles)
print(f"ChemBERTa embeddings shape: {embeddings.shape}")
# Output: (3, 768) - 768-dimensional embeddings

# Use in ML pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    embeddings, labels, test_size=0.2
)

clf = RandomForestClassifier()
clf.fit(X_train, y_train)
predictions = clf.predict(X_test)
```

### ChemGPT Models

```python
# Small model (4.7M parameters)
chemgpt_small = PretrainedMolTransformer("ChemGPT-4.7M", n_jobs=-1)

# Medium model (19M parameters)
chemgpt_medium = PretrainedMolTransformer("ChemGPT-19M", n_jobs=-1)

# Large model (1.2B parameters)
chemgpt_large = PretrainedMolTransformer("ChemGPT-1.2B", n_jobs=-1)

# Generate embeddings
embeddings = chemgpt_small(smiles)
```

### Graph Neural Network Models

```python
# GIN models with different pre-training objectives
gin_masking = PretrainedMolTransformer("gin-supervised-masking", n_jobs=-1)
gin_infomax = PretrainedMolTransformer("gin-supervised-infomax", n_jobs=-1)
gin_edgepred = PretrainedMolTransformer("gin-supervised-edgepred", n_jobs=-1)

# Generate graph embeddings
embeddings = gin_masking(smiles)
print(f"GIN embeddings shape: {embeddings.shape}")

# Graphormer (for quantum chemistry)
graphormer = PretrainedMolTransformer("Graphormer-pcqm4mv2", n_jobs=-1)
embeddings = graphormer(smiles)
```

---

## Machine Learning Integration

### Scikit-learn Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from molfeat.trans import MoleculeTransformer
from molfeat.calc import FPCalculator

# Create ML pipeline
pipeline = Pipeline([
    ('featurizer', MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1)),
    ('classifier', RandomForestClassifier(n_estimators=100))
])

# Train and evaluate
pipeline.fit(smiles_train, y_train)
predictions = pipeline.predict(smiles_test)

# Cross-validation
scores = cross_val_score(pipeline, smiles_all, y_all, cv=5)
print(f"CV scores: {scores.mean():.3f} (+/- {scores.std():.3f})")
```

### Grid Search for Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC

# Define pipeline
pipeline = Pipeline([
    ('featurizer', MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1)),
    ('classifier', SVC())
])

# Define parameter grid
param_grid = {
    'classifier__C': [0.1, 1, 10],
    'classifier__kernel': ['rbf', 'linear'],
    'classifier__gamma': ['scale', 'auto']
}

# Grid search
grid_search = GridSearchCV(pipeline, param_grid, cv=5, n_jobs=-1)
grid_search.fit(smiles_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best score: {grid_search.best_score_:.3f}")
```

### Multiple Featurizer Comparison

```python
from sklearn.metrics import roc_auc_score

# Test different featurizers
featurizers = {
    'ECFP': FPCalculator("ecfp"),
    'MACCS': FPCalculator("maccs"),
    'RDKit': FPCalculator("rdkit"),
    'Descriptors': RDKitDescriptors2D(),
    'Combined': FeatConcat([
        FPCalculator("maccs"),
        FPCalculator("ecfp")
    ])
}

results = {}
for name, calc in featurizers.items():
    transformer = MoleculeTransformer(calc, n_jobs=-1)
    X_train = transformer(smiles_train)
    X_test = transformer(smiles_test)

    clf = RandomForestClassifier(n_estimators=100)
    clf.fit(X_train, y_train)

    y_pred = clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_pred)
    results[name] = auc

    print(f"{name}: AUC = {auc:.3f}")
```

### PyTorch Deep Learning

```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from molfeat.trans import MoleculeTransformer
from molfeat.calc import FPCalculator

# Custom dataset
class MoleculeDataset(Dataset):
    def __init__(self, smiles, labels, transformer):
        self.features = transformer(smiles)
        self.labels = torch.tensor(labels, dtype=torch.float32)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return (
            torch.tensor(self.features[idx], dtype=torch.float32),
            self.labels[idx]
        )

# Prepare data
transformer = MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1)
train_dataset = MoleculeDataset(smiles_train, y_train, transformer)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

# Simple neural network
class MoleculeClassifier(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.network(x)

# Train model
model = MoleculeClassifier(input_dim=2048)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.BCELoss()

for epoch in range(10):
    for batch_features, batch_labels in train_loader:
        optimizer.zero_grad()
        outputs = model(batch_features).squeeze()
        loss = criterion(outputs, batch_labels)
        loss.backward()
        optimizer.step()
```

---

## Advanced Usage Patterns

### Custom Preprocessing

```python
from molfeat.trans import MoleculeTransformer
import datamol as dm

class CustomTransformer(MoleculeTransformer):
    def preprocess(self, mol):
        """Custom preprocessing: standardize molecule"""
        if isinstance(mol, str):
            mol = dm.to_mol(mol)

        # Standardize
        mol = dm.standardize_mol(mol)

        # Remove salts
        mol = dm.remove_salts(mol)

        return mol

# Use custom transformer
transformer = CustomTransformer(FPCalculator("ecfp"), n_jobs=-1)
features = transformer(smiles_list)
```

### Featurization with Conformers

```python
import datamol as dm
from molfeat.calc import RDKitDescriptors3D

# Generate conformers
def prepare_3d_mol(smiles):
    mol = dm.to_mol(smiles)
    mol = dm.add_hs(mol)
    mol = dm.conform.generate_conformers(mol, n_confs=1)
    return mol

# 3D descriptors
calc_3d = RDKitDescriptors3D()

smiles = "CC(C)Cc1ccc(C)cc1C"
mol_3d = prepare_3d_mol(smiles)
descriptors_3d = calc_3d(mol_3d)
```

### Parallel Batch Processing

```python
from molfeat.trans import MoleculeTransformer
from molfeat.calc import FPCalculator
import time

# Large dataset
smiles_large = load_large_dataset()  # e.g., 100,000 molecules

# Test different parallelization levels
for n_jobs in [1, 2, 4, -1]:
    transformer = MoleculeTransformer(
        FPCalculator("ecfp"),
        n_jobs=n_jobs
    )

    start = time.time()
    features = transformer(smiles_large)
    elapsed = time.time() - start

    print(f"n_jobs={n_jobs}: {elapsed:.2f}s")
```

### Caching for Expensive Operations

```python
from molfeat.trans.pretrained import PretrainedMolTransformer
import pickle

# Load expensive pretrained model
transformer = PretrainedMolTransformer("ChemBERTa-77M-MLM", n_jobs=-1)

# Cache embeddings for reuse
cache_file = "embeddings_cache.pkl"

try:
    # Try loading cached embeddings
    with open(cache_file, "rb") as f:
        embeddings = pickle.load(f)
    print("Loaded cached embeddings")
except FileNotFoundError:
    # Compute and cache
    embeddings = transformer(smiles_list)
    with open(cache_file, "wb") as f:
        pickle.dump(embeddings, f)
    print("Computed and cached embeddings")
```

---

## Common Workflows

### Virtual Screening Workflow

```python
from molfeat.calc import FPCalculator
from sklearn.ensemble import RandomForestClassifier
import datamol as dm

# 1. Prepare training data (known actives/inactives)
train_smiles = load_training_data()
train_labels = load_training_labels()  # 1=active, 0=inactive

# 2. Featurize training set
transformer = MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1)
X_train = transformer(train_smiles)

# 3. Train classifier
clf = RandomForestClassifier(n_estimators=500, n_jobs=-1)
clf.fit(X_train, train_labels)

# 4. Featurize screening library
screening_smiles = load_screening_library()  # e.g., 1M compounds
X_screen = transformer(screening_smiles)

# 5. Predict and rank
predictions = clf.predict_proba(X_screen)[:, 1]
ranked_indices = predictions.argsort()[::-1]

# 6. Get top hits
top_n = 1000
top_hits = [screening_smiles[i] for i in ranked_indices[:top_n]]
```

### QSAR Model Building

```python
from molfeat.calc import RDKitDescriptors2D
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
import numpy as np

# Load QSAR dataset
smiles = load_molecules()
y = load_activity_values()  # e.g., IC50, logP

# Featurize with interpretable descriptors
transformer = MoleculeTransformer(RDKitDescriptors2D(), n_jobs=-1)
X = transformer(smiles)

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Build linear model
model = Ridge(alpha=1.0)
scores = cross_val_score(model, X_scaled, y, cv=5, scoring='r2')
print(f"R² = {scores.mean():.3f} (+/- {scores.std():.3f})")

# Fit final model
model.fit(X_scaled, y)

# Interpret feature importance
feature_names = transformer.featurizer.columns
importance = np.abs(model.coef_)
top_features_idx = importance.argsort()[-10:][::-1]

print("Top 10 important features:")
for idx in top_features_idx:
    print(f"  {feature_names[idx]}: {model.coef_[idx]:.3f}")
```

### Similarity Search

```python
from molfeat.calc import FPCalculator
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Query molecule
query_smiles = "CC(=O)Oc1ccccc1C(=O)O"  # Aspirin

# Database of molecules
database_smiles = load_molecule_database()  # Large collection

# Compute fingerprints
calc = FPCalculator("ecfp")
query_fp = calc(query_smiles).reshape(1, -1)

transformer = MoleculeTransformer(calc, n_jobs=-1)
database_fps = transformer(database_smiles)

# Compute similarity
similarities = cosine_similarity(query_fp, database_fps)[0]

# Find most similar
top_k = 10
top_indices = similarities.argsort()[-top_k:][::-1]

print(f"Top {top_k} similar molecules:")
for i, idx in enumerate(top_indices, 1):
    print(f"{i}. {database_smiles[idx]} (similarity: {similarities[idx]:.3f})")
```

---

## Troubleshooting

### Handling Invalid Molecules

```python
# Use ignore_errors to skip invalid molecules
transformer = MoleculeTransformer(
    FPCalculator("ecfp"),
    ignore_errors=True,
    verbose=True
)

# Filter out None values after transformation
features = transformer(smiles_list)
valid_mask = [f is not None for f in features]
valid_features = [f for f in features if f is not None]
valid_smiles = [s for s, m in zip(smiles_list, valid_mask) if m]
```

### Memory Management for Large Datasets

```python
# Process in chunks for very large datasets
def featurize_in_chunks(smiles_list, transformer, chunk_size=10000):
    all_features = []

    for i in range(0, len(smiles_list), chunk_size):
        chunk = smiles_list[i:i+chunk_size]
        features = transformer(chunk)
        all_features.append(features)
        print(f"Processed {i+len(chunk)}/{len(smiles_list)}")

    return np.vstack(all_features)

# Use with large dataset
features = featurize_in_chunks(large_smiles_list, transformer)
```

### Reproducibility

```python
import random
import numpy as np
import torch

# Set all random seeds
def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

set_seed(42)

# Save exact configuration
transformer.to_state_yaml_file("config.yml")

# Document version
import molfeat
print(f"molfeat version: {molfeat.__version__}")
```
