# DeepChem API Reference

This document provides a comprehensive reference for DeepChem's core APIs, organized by functionality.

## Data Handling

### Data Loaders

#### File Format Loaders
- **CSVLoader**: Load tabular data from CSV files with customizable feature handling
- **UserCSVLoader**: User-defined CSV loading with flexible column specifications
- **SDFLoader**: Process molecular structure files (SDF format)
- **JsonLoader**: Import JSON-structured datasets
- **ImageLoader**: Load image data for computer vision tasks

#### Biological Data Loaders
- **FASTALoader**: Handle protein/DNA sequences in FASTA format
- **FASTQLoader**: Process FASTQ sequencing data with quality scores
- **SAMLoader/BAMLoader/CRAMLoader**: Support sequence alignment formats

#### Specialized Loaders
- **DFTYamlLoader**: Process density functional theory computational data
- **InMemoryLoader**: Load data directly from Python objects

### Dataset Classes

- **NumpyDataset**: Wrap NumPy arrays for in-memory data manipulation
- **DiskDataset**: Manage larger datasets stored on disk, reducing memory overhead
- **ImageDataset**: Specialized container for image-based ML tasks

### Data Splitters

#### General Splitters
- **RandomSplitter**: Random dataset partitioning
- **IndexSplitter**: Split by specified indices
- **SpecifiedSplitter**: Use pre-defined splits
- **RandomStratifiedSplitter**: Stratified random splitting
- **SingletaskStratifiedSplitter**: Stratified splitting for single tasks
- **TaskSplitter**: Split for multitask scenarios

#### Molecule-Specific Splitters
- **ScaffoldSplitter**: Divide molecules by structural scaffolds (prevents data leakage)
- **ButinaSplitter**: Clustering-based molecular splitting
- **FingerprintSplitter**: Split based on molecular fingerprint similarity
- **MaxMinSplitter**: Maximize diversity between training/test sets
- **MolecularWeightSplitter**: Split by molecular weight properties

**Best Practice**: For drug discovery tasks, use ScaffoldSplitter to prevent overfitting on similar molecular structures.

### Transformers

#### Normalization
- **NormalizationTransformer**: Standard normalization (mean=0, std=1)
- **MinMaxTransformer**: Scale features to [0,1] range
- **LogTransformer**: Apply log transformation
- **PowerTransformer**: Box-Cox and Yeo-Johnson transformations
- **CDFTransformer**: Cumulative distribution function normalization

#### Task-Specific
- **BalancingTransformer**: Address class imbalance
- **FeaturizationTransformer**: Apply dynamic feature engineering
- **CoulombFitTransformer**: Quantum chemistry specific
- **DAGTransformer**: Directed acyclic graph transformations
- **RxnSplitTransformer**: Chemical reaction preprocessing

## Molecular Featurizers

### Graph-Based Featurizers
Use these with graph neural networks (GCNs, MPNNs, etc.):

- **ConvMolFeaturizer**: Graph representations for graph convolutional networks
- **WeaveFeaturizer**: "Weave" graph embeddings
- **MolGraphConvFeaturizer**: Graph convolution-ready representations
- **EquivariantGraphFeaturizer**: Maintains geometric invariance
- **DMPNNFeaturizer**: Directed message-passing neural network inputs
- **GroverFeaturizer**: Pre-trained molecular embeddings

### Fingerprint-Based Featurizers
Use these with traditional ML (Random Forest, SVM, XGBoost):

- **MACCSKeysFingerprint**: 167-bit structural keys
- **CircularFingerprint**: Extended connectivity fingerprints (Morgan fingerprints)
  - Parameters: `radius` (default 2), `size` (default 2048), `useChirality` (default False)
- **PubChemFingerprint**: 881-bit structural descriptors
- **Mol2VecFingerprint**: Learned molecular vector representations

### Descriptor Featurizers
Calculate molecular properties directly:

- **RDKitDescriptors**: ~200 molecular descriptors (MW, LogP, H-donors, H-acceptors, TPSA, etc.)
- **MordredDescriptors**: Comprehensive structural and physicochemical descriptors
- **CoulombMatrix**: Interatomic distance matrices for 3D structures

### Sequence-Based Featurizers
For recurrent networks and transformers:

- **SmilesToSeq**: Convert SMILES strings to sequences
- **SmilesToImage**: Generate 2D image representations from SMILES
- **RawFeaturizer**: Pass through raw molecular data unchanged

### Selection Guide

| Use Case | Recommended Featurizer | Model Type |
|----------|----------------------|------------|
| Graph neural networks | ConvMolFeaturizer, MolGraphConvFeaturizer | GCN, MPNN, GAT |
| Traditional ML | CircularFingerprint, RDKitDescriptors | Random Forest, XGBoost, SVM |
| Deep learning (non-graph) | CircularFingerprint, Mol2VecFingerprint | Dense networks, CNN |
| Sequence models | SmilesToSeq | LSTM, GRU, Transformer |
| 3D molecular structures | CoulombMatrix | Specialized 3D models |
| Quick baseline | RDKitDescriptors | Linear, Ridge, Lasso |

## Models

### Scikit-Learn Integration
- **SklearnModel**: Wrapper for any scikit-learn algorithm
  - Usage: `SklearnModel(model=RandomForestRegressor())`

### Gradient Boosting
- **GBDTModel**: Gradient boosting decision trees (XGBoost, LightGBM)

### PyTorch Models

#### Molecular Property Prediction
- **MultitaskRegressor**: Multi-task regression with shared representations
- **MultitaskClassifier**: Multi-task classification
- **MultitaskFitTransformRegressor**: Regression with learned transformations
- **GCNModel**: Graph convolutional networks
- **GATModel**: Graph attention networks
- **AttentiveFPModel**: Attentive fingerprint networks
- **DMPNNModel**: Directed message passing neural networks
- **GroverModel**: GROVER pre-trained transformer
- **MATModel**: Molecule attention transformer

#### Materials Science
- **CGCNNModel**: Crystal graph convolutional networks
- **MEGNetModel**: Materials graph networks
- **LCNNModel**: Lattice CNN for materials

#### Generative Models
- **GANModel**: Generative adversarial networks
- **WGANModel**: Wasserstein GAN
- **BasicMolGANModel**: Molecular GAN
- **LSTMGenerator**: LSTM-based molecule generation
- **SeqToSeqModel**: Sequence-to-sequence models

#### Physics-Informed Models
- **PINNModel**: Physics-informed neural networks
- **HNNModel**: Hamiltonian neural networks
- **LNN**: Lagrangian neural networks
- **FNOModel**: Fourier neural operators

#### Computer Vision
- **CNN**: Convolutional neural networks
- **UNetModel**: U-Net architecture for segmentation
- **InceptionV3Model**: Pre-trained Inception v3
- **MobileNetV2Model**: Lightweight mobile networks

### Hugging Face Models

- **HuggingFaceModel**: General wrapper for HF transformers
- **Chemberta**: Chemical BERT for molecular property prediction
- **MoLFormer**: Molecular transformer architecture
- **ProtBERT**: Protein sequence BERT
- **DeepAbLLM**: Antibody large language models

### Model Selection Guide

| Task | Recommended Model | Featurizer |
|------|------------------|------------|
| Small dataset (<1000 samples) | SklearnModel (Random Forest) | CircularFingerprint |
| Medium dataset (1K-100K) | GBDTModel or MultitaskRegressor | CircularFingerprint or ConvMolFeaturizer |
| Large dataset (>100K) | GCNModel, AttentiveFPModel, or DMPNN | MolGraphConvFeaturizer |
| Transfer learning | GroverModel, Chemberta, MoLFormer | Model-specific |
| Materials properties | CGCNNModel, MEGNetModel | Structure-based |
| Molecule generation | BasicMolGANModel, LSTMGenerator | SmilesToSeq |
| Protein sequences | ProtBERT | Sequence-based |

## MoleculeNet Datasets

Quick access to 30+ benchmark datasets via `dc.molnet.load_*()` functions.

### Classification Datasets
- **load_bace()**: BACE-1 inhibitors (binary classification)
- **load_bbbp()**: Blood-brain barrier penetration
- **load_clintox()**: Clinical toxicity
- **load_hiv()**: HIV inhibition activity
- **load_muv()**: PubChem BioAssay (challenging, sparse)
- **load_pcba()**: PubChem screening data
- **load_sider()**: Adverse drug reactions (multi-label)
- **load_tox21()**: 12 toxicity assays (multi-task)
- **load_toxcast()**: EPA ToxCast screening

### Regression Datasets
- **load_delaney()**: Aqueous solubility (ESOL)
- **load_freesolv()**: Solvation free energy
- **load_lipo()**: Lipophilicity (octanol-water partition)
- **load_qm7/qm8/qm9()**: Quantum mechanical properties
- **load_hopv()**: Organic photovoltaic properties

### Protein-Ligand Binding
- **load_pdbbind()**: Binding affinity data

### Materials Science
- **load_perovskite()**: Perovskite stability
- **load_mp_formation_energy()**: Materials Project formation energy
- **load_mp_metallicity()**: Metal vs. non-metal classification
- **load_bandgap()**: Electronic bandgap prediction

### Chemical Reactions
- **load_uspto()**: USPTO reaction dataset

### Usage Pattern
```python
tasks, datasets, transformers = dc.molnet.load_bbbp(
    featurizer='GraphConv',  # or 'ECFP', 'GraphConv', 'Weave', etc.
    splitter='scaffold',      # or 'random', 'stratified', etc.
    reload=False              # set True to skip caching
)
train, valid, test = datasets
```

## Metrics

Common evaluation metrics available in `dc.metrics`:

### Classification Metrics
- **roc_auc_score**: Area under ROC curve (binary/multi-class)
- **prc_auc_score**: Area under precision-recall curve
- **accuracy_score**: Classification accuracy
- **balanced_accuracy_score**: Balanced accuracy for imbalanced datasets
- **recall_score**: Sensitivity/recall
- **precision_score**: Precision
- **f1_score**: F1 score

### Regression Metrics
- **mean_absolute_error**: MAE
- **mean_squared_error**: MSE
- **root_mean_squared_error**: RMSE
- **r2_score**: R² coefficient of determination
- **pearson_r2_score**: Pearson correlation
- **spearman_correlation**: Spearman rank correlation

### Multi-Task Metrics
Most metrics support multi-task evaluation by averaging over tasks.

## Training Pattern

Standard DeepChem workflow:

```python
# 1. Load data
loader = dc.data.CSVLoader(tasks=['task1'], feature_field='smiles',
                           featurizer=dc.feat.CircularFingerprint())
dataset = loader.create_dataset('data.csv')

# 2. Split data
splitter = dc.splits.ScaffoldSplitter()
train, valid, test = splitter.train_valid_test_split(dataset)

# 3. Transform data (optional)
transformers = [dc.trans.NormalizationTransformer(dataset=train)]
for transformer in transformers:
    train = transformer.transform(train)
    valid = transformer.transform(valid)
    test = transformer.transform(test)

# 4. Create and train model
model = dc.models.MultitaskRegressor(n_tasks=1, n_features=2048, layer_sizes=[1000])
model.fit(train, nb_epoch=50)

# 5. Evaluate
metric = dc.metrics.Metric(dc.metrics.r2_score)
train_score = model.evaluate(train, [metric])
test_score = model.evaluate(test, [metric])
```

## Common Patterns

### Pattern 1: Quick Baseline with MoleculeNet
```python
tasks, datasets, transformers = dc.molnet.load_tox21(featurizer='ECFP')
train, valid, test = datasets
model = dc.models.MultitaskClassifier(n_tasks=len(tasks), n_features=1024)
model.fit(train)
```

### Pattern 2: Custom Data with Graph Networks
```python
featurizer = dc.feat.MolGraphConvFeaturizer()
loader = dc.data.CSVLoader(tasks=['activity'], feature_field='smiles',
                           featurizer=featurizer)
dataset = loader.create_dataset('my_data.csv')
train, test = dc.splits.RandomSplitter().train_test_split(dataset)
model = dc.models.GCNModel(mode='classification', n_tasks=1)
model.fit(train)
```

### Pattern 3: Transfer Learning with Pretrained Models
```python
model = dc.models.GroverModel(task='classification', n_tasks=1)
model.fit(train_dataset)
predictions = model.predict(test_dataset)
```
