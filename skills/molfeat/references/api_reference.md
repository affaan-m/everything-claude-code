# Molfeat API Reference

## Core Modules

Molfeat is organized into several key modules that provide different aspects of molecular featurization:

- **`molfeat.store`** - Manages model loading, listing, and registration
- **`molfeat.calc`** - Provides calculators for single-molecule featurization
- **`molfeat.trans`** - Offers scikit-learn compatible transformers for batch processing
- **`molfeat.utils`** - Utility functions for data handling
- **`molfeat.viz`** - Visualization tools for molecular features

---

## molfeat.calc - Calculators

Calculators are callable objects that convert individual molecules into feature vectors. They accept either RDKit `Chem.Mol` objects or SMILES strings as input.

### SerializableCalculator (Base Class)

Base abstract class for all calculators. When subclassing, must implement:
- `__call__()` - Required method for featurization
- `__len__()` - Optional, returns output length
- `columns` - Optional property, returns feature names
- `batch_compute()` - Optional, for efficient batch processing

**State Management Methods:**
- `to_state_json()` - Save calculator state as JSON
- `to_state_yaml()` - Save calculator state as YAML
- `from_state_dict()` - Load calculator from state dictionary
- `to_state_dict()` - Export calculator state as dictionary

### FPCalculator

Computes molecular fingerprints. Supports 15+ fingerprint methods.

**Supported Fingerprint Types:**

**Structural Fingerprints:**
- `ecfp` - Extended-connectivity fingerprints (circular)
- `fcfp` - Functional-class fingerprints
- `rdkit` - RDKit topological fingerprints
- `maccs` - MACCS keys (166-bit structural keys)
- `avalon` - Avalon fingerprints
- `pattern` - Pattern fingerprints
- `layered` - Layered fingerprints

**Atom-based Fingerprints:**
- `atompair` - Atom pair fingerprints
- `atompair-count` - Counted atom pairs
- `topological` - Topological torsion fingerprints
- `topological-count` - Counted topological torsions

**Specialized Fingerprints:**
- `map4` - MinHashed atom-pair fingerprint up to 4 bonds
- `secfp` - SMILES extended connectivity fingerprint
- `erg` - Extended reduced graphs
- `estate` - Electrotopological state indices

**Parameters:**
- `method` (str) - Fingerprint type name
- `radius` (int) - Radius for circular fingerprints (default: 3)
- `fpSize` (int) - Fingerprint size (default: 2048)
- `includeChirality` (bool) - Include chirality information
- `counting` (bool) - Use count vectors instead of binary

**Usage:**
```python
from molfeat.calc import FPCalculator

# Create fingerprint calculator
calc = FPCalculator("ecfp", radius=3, fpSize=2048)

# Compute fingerprint for single molecule
fp = calc("CCO")  # Returns numpy array

# Get fingerprint length
length = len(calc)  # 2048

# Get feature names
names = calc.columns
```

**Common Fingerprint Dimensions:**
- MACCS: 167 dimensions
- ECFP (default): 2048 dimensions
- MAP4 (default): 1024 dimensions

### Descriptor Calculators

**RDKitDescriptors2D**
Computes 2D molecular descriptors using RDKit.

```python
from molfeat.calc import RDKitDescriptors2D

calc = RDKitDescriptors2D()
descriptors = calc("CCO")  # Returns 200+ descriptors
```

**RDKitDescriptors3D**
Computes 3D molecular descriptors (requires conformer generation).

**MordredDescriptors**
Calculates over 1800 molecular descriptors using Mordred.

```python
from molfeat.calc import MordredDescriptors

calc = MordredDescriptors()
descriptors = calc("CCO")
```

### Pharmacophore Calculators

**Pharmacophore2D**
RDKit's 2D pharmacophore fingerprint generation.

**Pharmacophore3D**
Consensus pharmacophore fingerprints from multiple conformers.

**CATSCalculator**
Computes Chemically Advanced Template Search (CATS) descriptors - pharmacophore point pair distributions.

**Parameters:**
- `mode` - "2D" or "3D" distance calculations
- `dist_bins` - Distance bins for pair distributions
- `scale` - Scaling mode: "raw", "num", or "count"

```python
from molfeat.calc import CATSCalculator

calc = CATSCalculator(mode="2D", scale="raw")
cats = calc("CCO")  # Returns 21 descriptors by default
```

### Shape Descriptors

**USRDescriptors**
Ultrafast shape recognition descriptors (multiple variants).

**ElectroShapeDescriptors**
Electrostatic shape descriptors combining shape, chirality, and electrostatics.

### Graph-Based Calculators

**ScaffoldKeyCalculator**
Computes 40+ scaffold-based molecular properties.

**AtomCalculator**
Atom-level featurization for graph neural networks.

**BondCalculator**
Bond-level featurization for graph neural networks.

### Utility Function

**get_calculator()**
Factory function to instantiate calculators by name.

```python
from molfeat.calc import get_calculator

# Instantiate any calculator by name
calc = get_calculator("ecfp", radius=3)
calc = get_calculator("maccs")
calc = get_calculator("desc2D")
```

Raises `ValueError` for unsupported featurizers.

---

## molfeat.trans - Transformers

Transformers wrap calculators into complete featurization pipelines for batch processing.

### MoleculeTransformer

Scikit-learn compatible transformer for batch molecular featurization.

**Key Parameters:**
- `featurizer` - Calculator or featurizer to use
- `n_jobs` (int) - Number of parallel jobs (-1 for all cores)
- `dtype` - Output data type (numpy float32/64, torch tensors)
- `verbose` (bool) - Enable verbose logging
- `ignore_errors` (bool) - Continue on failures (returns None for failed molecules)

**Essential Methods:**
- `transform(mols)` - Processes batches and returns representations
- `_transform(mol)` - Handles individual molecule featurization
- `__call__(mols)` - Convenience wrapper around transform()
- `preprocess(mol)` - Prepares input molecules (not automatically applied)
- `to_state_yaml_file(path)` - Save transformer configuration
- `from_state_yaml_file(path)` - Load transformer configuration

**Usage:**
```python
from molfeat.calc import FPCalculator
from molfeat.trans import MoleculeTransformer
import datamol as dm

# Load molecules
smiles = dm.data.freesolv().sample(100).smiles.values

# Create transformer
calc = FPCalculator("ecfp")
transformer = MoleculeTransformer(calc, n_jobs=-1)

# Featurize batch
features = transformer(smiles)  # Returns numpy array (100, 2048)

# Save configuration
transformer.to_state_yaml_file("ecfp_config.yml")

# Reload
transformer = MoleculeTransformer.from_state_yaml_file("ecfp_config.yml")
```

**Performance:** Testing on 642 molecules showed 3.4x speedup using 4 parallel jobs versus single-threaded processing.

### FeatConcat

Concatenates multiple featurizers into unified representations.

```python
from molfeat.trans import FeatConcat
from molfeat.calc import FPCalculator

# Combine multiple fingerprints
concat = FeatConcat([
    FPCalculator("maccs"),      # 167 dimensions
    FPCalculator("ecfp")         # 2048 dimensions
])

# Result: 2167-dimensional features
transformer = MoleculeTransformer(concat, n_jobs=-1)
features = transformer(smiles)
```

### PretrainedMolTransformer

Subclass of `MoleculeTransformer` for pre-trained deep learning models.

**Unique Features:**
- `_embed()` - Batched inference for neural networks
- `_convert()` - Transforms SMILES/molecules into model-compatible formats
  - SELFIES strings for language models
  - DGL graphs for graph neural networks
- Integrated caching system for efficient storage

**Usage:**
```python
from molfeat.trans.pretrained import PretrainedMolTransformer

# Load pretrained model
transformer = PretrainedMolTransformer("ChemBERTa-77M-MLM", n_jobs=-1)

# Generate embeddings
embeddings = transformer(smiles)
```

### PrecomputedMolTransformer

Transformer for cached/precomputed features.

---

## molfeat.store - Model Store

Manages featurizer discovery, loading, and registration.

### ModelStore

Central hub for accessing available featurizers.

**Key Methods:**
- `available_models` - Property listing all available featurizers
- `search(name=None, **kwargs)` - Search for specific featurizers
- `load(name, **kwargs)` - Load a featurizer by name
- `register(name, card)` - Register custom featurizer

**Usage:**
```python
from molfeat.store.modelstore import ModelStore

# Initialize store
store = ModelStore()

# List all available models
all_models = store.available_models
print(f"Found {len(all_models)} featurizers")

# Search for specific model
results = store.search(name="ChemBERTa-77M-MLM")
if results:
    model_card = results[0]

    # View usage information
    model_card.usage()

    # Load the model
    transformer = model_card.load()

# Direct loading
transformer = store.load("ChemBERTa-77M-MLM")
```

**ModelCard Attributes:**
- `name` - Model identifier
- `description` - Model description
- `version` - Model version
- `authors` - Model authors
- `tags` - Categorization tags
- `usage()` - Display usage examples
- `load(**kwargs)` - Load the model

---

## Common Patterns

### Error Handling

```python
# Enable error tolerance
featurizer = MoleculeTransformer(
    calc,
    n_jobs=-1,
    verbose=True,
    ignore_errors=True
)

# Failed molecules return None
features = featurizer(smiles_with_errors)
```

### Data Type Control

```python
# NumPy float32 (default)
features = transformer(smiles, enforce_dtype=True)

# PyTorch tensors
import torch
transformer = MoleculeTransformer(calc, dtype=torch.float32)
features = transformer(smiles)
```

### Persistence and Reproducibility

```python
# Save transformer state
transformer.to_state_yaml_file("config.yml")
transformer.to_state_json_file("config.json")

# Load from saved state
transformer = MoleculeTransformer.from_state_yaml_file("config.yml")
transformer = MoleculeTransformer.from_state_json_file("config.json")
```

### Preprocessing

```python
# Manual preprocessing
mol = transformer.preprocess("CCO")

# Transform with preprocessing
features = transformer.transform(smiles_list)
```

---

## Integration Examples

### Scikit-learn Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from molfeat.trans import MoleculeTransformer
from molfeat.calc import FPCalculator

# Create pipeline
pipeline = Pipeline([
    ('featurizer', MoleculeTransformer(FPCalculator("ecfp"))),
    ('classifier', RandomForestClassifier())
])

# Fit and predict
pipeline.fit(smiles_train, y_train)
predictions = pipeline.predict(smiles_test)
```

### PyTorch Integration

```python
import torch
from torch.utils.data import Dataset, DataLoader
from molfeat.trans import MoleculeTransformer

class MoleculeDataset(Dataset):
    def __init__(self, smiles, labels, transformer):
        self.smiles = smiles
        self.labels = labels
        self.transformer = transformer

    def __len__(self):
        return len(self.smiles)

    def __getitem__(self, idx):
        features = self.transformer(self.smiles[idx])
        return torch.tensor(features), torch.tensor(self.labels[idx])

# Create dataset and dataloader
transformer = MoleculeTransformer(FPCalculator("ecfp"))
dataset = MoleculeDataset(smiles, labels, transformer)
loader = DataLoader(dataset, batch_size=32)
```

---

## Performance Tips

1. **Parallelization**: Use `n_jobs=-1` to utilize all CPU cores
2. **Batch Processing**: Process multiple molecules at once instead of loops
3. **Caching**: Leverage built-in caching for pretrained models
4. **Data Types**: Use float32 instead of float64 when precision allows
5. **Error Handling**: Set `ignore_errors=True` for large datasets with potential invalid molecules
