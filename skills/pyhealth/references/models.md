# PyHealth Models

## Overview

PyHealth provides 33+ models for healthcare prediction tasks, ranging from simple baselines to state-of-the-art deep learning architectures. Models are organized into general-purpose architectures and healthcare-specific models.

## Model Base Class

All models inherit from `BaseModel` with standard PyTorch functionality:

**Key Attributes:**
- `dataset`: Associated SampleDataset
- `feature_keys`: Input features to use (e.g., ["diagnoses", "medications"])
- `mode`: Task type ("binary", "multiclass", "multilabel", "regression")
- `embedding_dim`: Feature embedding dimension
- `device`: Computation device (CPU/GPU)

**Key Methods:**
- `forward()`: Model forward pass
- `train_step()`: Single training iteration
- `eval_step()`: Single evaluation iteration
- `save()`: Save model checkpoint
- `load()`: Load model checkpoint

## General-Purpose Models

### Baseline Models

**Logistic Regression** (`LogisticRegression`)
- Linear classifier with mean pooling
- Simple baseline for comparison
- Fast training and inference
- Good for interpretability

**Usage:**
```python
from pyhealth.models import LogisticRegression

model = LogisticRegression(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary"
)
```

**Multi-Layer Perceptron** (`MLP`)
- Feedforward neural network
- Configurable hidden layers
- Supports mean/sum/max pooling
- Good baseline for structured data

**Parameters:**
- `hidden_dim`: Hidden layer size
- `num_layers`: Number of hidden layers
- `dropout`: Dropout rate
- `pooling`: Aggregation method ("mean", "sum", "max")

**Usage:**
```python
from pyhealth.models import MLP

model = MLP(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",
    hidden_dim=128,
    num_layers=3,
    dropout=0.5
)
```

### Convolutional Neural Networks

**CNN** (`CNN`)
- Convolutional layers for pattern detection
- Effective for sequential and spatial data
- Captures local temporal patterns
- Parameter efficient

**Architecture:**
- Multiple 1D convolutional layers
- Max pooling for dimension reduction
- Fully connected output layers

**Parameters:**
- `num_filters`: Number of convolutional filters
- `kernel_size`: Convolution kernel size
- `num_layers`: Number of conv layers
- `dropout`: Dropout rate

**Usage:**
```python
from pyhealth.models import CNN

model = CNN(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",
    num_filters=64,
    kernel_size=3,
    num_layers=3
)
```

**Temporal Convolutional Networks** (`TCN`)
- Dilated convolutions for long-range dependencies
- Causal convolutions (no future information leakage)
- Efficient for long sequences
- Good for time-series prediction

**Advantages:**
- Captures long-term dependencies
- Parallelizable (faster than RNNs)
- Stable gradients

### Recurrent Neural Networks

**RNN** (`RNN`)
- Basic recurrent architecture
- Supports LSTM, GRU, RNN variants
- Sequential processing
- Captures temporal dependencies

**Parameters:**
- `rnn_type`: "LSTM", "GRU", or "RNN"
- `hidden_dim`: Hidden state dimension
- `num_layers`: Number of recurrent layers
- `dropout`: Dropout rate
- `bidirectional`: Use bidirectional RNN

**Usage:**
```python
from pyhealth.models import RNN

model = RNN(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",
    rnn_type="LSTM",
    hidden_dim=128,
    num_layers=2,
    bidirectional=True
)
```

**Best for:**
- Sequential clinical events
- Temporal pattern learning
- Variable-length sequences

### Transformer Models

**Transformer** (`Transformer`)
- Self-attention mechanism
- Parallel processing of sequences
- State-of-the-art performance
- Effective for long-range dependencies

**Architecture:**
- Multi-head self-attention
- Position embeddings
- Feed-forward networks
- Layer normalization

**Parameters:**
- `num_heads`: Number of attention heads
- `num_layers`: Number of transformer layers
- `hidden_dim`: Hidden dimension
- `dropout`: Dropout rate
- `max_seq_length`: Maximum sequence length

**Usage:**
```python
from pyhealth.models import Transformer

model = Transformer(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",
    num_heads=8,
    num_layers=6,
    hidden_dim=256,
    dropout=0.1
)
```

**TransformersModel** (`TransformersModel`)
- Integration with HuggingFace transformers
- Pre-trained language models for clinical text
- Fine-tuning for healthcare tasks
- Examples: BERT, RoBERTa, BioClinicalBERT

**Usage:**
```python
from pyhealth.models import TransformersModel

model = TransformersModel(
    dataset=sample_dataset,
    feature_keys=["text"],
    mode="multiclass",
    pretrained_model="emilyalsentzer/Bio_ClinicalBERT"
)
```

### Graph Neural Networks

**GNN** (`GNN`)
- Graph-based learning
- Models relationships between entities
- Supports GAT (Graph Attention) and GCN (Graph Convolutional)

**Use Cases:**
- Drug-drug interactions
- Patient similarity networks
- Knowledge graph integration
- Comorbidity relationships

**Parameters:**
- `gnn_type`: "GAT" or "GCN"
- `hidden_dim`: Hidden dimension
- `num_layers`: Number of GNN layers
- `dropout`: Dropout rate
- `num_heads`: Attention heads (for GAT)

**Usage:**
```python
from pyhealth.models import GNN

model = GNN(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="multilabel",
    gnn_type="GAT",
    hidden_dim=128,
    num_layers=3,
    num_heads=4
)
```

## Healthcare-Specific Models

### Interpretable Clinical Models

**RETAIN** (`RETAIN`)
- Reverse time attention mechanism
- Highly interpretable predictions
- Visit-level and event-level attention
- Identifies influential clinical events

**Key Features:**
- Two-level attention (visits and features)
- Temporal decay modeling
- Clinically meaningful explanations
- Published in NeurIPS 2016

**Usage:**
```python
from pyhealth.models import RETAIN

model = RETAIN(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",
    hidden_dim=128
)

# Get attention weights for interpretation
outputs = model(batch)
visit_attention = outputs["visit_attention"]
feature_attention = outputs["feature_attention"]
```

**Best for:**
- Mortality prediction
- Readmission prediction
- Clinical risk scoring
- Interpretable predictions

**AdaCare** (`AdaCare`)
- Adaptive care model with feature calibration
- Disease-specific attention
- Handles irregular time intervals
- Interpretable feature importance

**ConCare** (`ConCare`)
- Cross-visit convolutional attention
- Temporal convolutional feature extraction
- Multi-level attention mechanism
- Good for longitudinal EHR modeling

### Medication Recommendation Models

**GAMENet** (`GAMENet`)
- Graph-based medication recommendation
- Drug-drug interaction modeling
- Memory network for patient history
- Multi-hop reasoning

**Architecture:**
- Drug knowledge graph
- Memory-augmented neural network
- DDI-aware prediction

**Usage:**
```python
from pyhealth.models import GAMENet

model = GAMENet(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="multilabel",
    embedding_dim=128,
    ddi_adj_path="/path/to/ddi_adjacency_matrix.pkl"
)
```

**MICRON** (`MICRON`)
- Medication recommendation with DDI constraints
- Interaction-aware predictions
- Safety-focused drug selection

**SafeDrug** (`SafeDrug`)
- Safety-aware drug recommendation
- Molecular structure integration
- DDI constraint optimization
- Balances efficacy and safety

**Key Features:**
- Molecular graph encoding
- DDI graph neural network
- Reinforcement learning for safety
- Published in KDD 2021

**Usage:**
```python
from pyhealth.models import SafeDrug

model = SafeDrug(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="multilabel",
    ddi_adj_path="/path/to/ddi_matrix.pkl",
    molecule_path="/path/to/molecule_graphs.pkl"
)
```

**MoleRec** (`MoleRec`)
- Molecular-level drug recommendations
- Sub-structure reasoning
- Fine-grained medication selection

### Disease Progression Models

**StageNet** (`StageNet`)
- Disease stage-aware prediction
- Learns clinical stages automatically
- Stage-adaptive feature extraction
- Effective for chronic disease monitoring

**Architecture:**
- Stage-aware LSTM
- Dynamic stage transitions
- Time-decay mechanism

**Usage:**
```python
from pyhealth.models import StageNet

model = StageNet(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications"],
    mode="binary",
    hidden_dim=128,
    num_stages=3,
    chunk_size=128
)
```

**Best for:**
- ICU mortality prediction
- Chronic disease progression
- Time-varying risk assessment

**Deepr** (`Deepr`)
- Deep recurrent architecture
- Medical concept embeddings
- Temporal pattern learning
- Published in JAMIA

### Advanced Sequential Models

**Agent** (`Agent`)
- Reinforcement learning-based
- Treatment recommendation
- Action-value optimization
- Policy learning for sequential decisions

**GRASP** (`GRASP`)
- Graph-based sequence patterns
- Structural event relationships
- Hierarchical representation learning

**SparcNet** (`SparcNet`)
- Sparse clinical networks
- Efficient feature selection
- Reduced computational cost
- Interpretable predictions

**ContraWR** (`ContraWR`)
- Contrastive learning approach
- Self-supervised pre-training
- Robust representations
- Limited labeled data scenarios

### Medical Entity Linking

**MedLink** (`MedLink`)
- Medical entity linking to knowledge bases
- Clinical concept normalization
- UMLS integration
- Entity disambiguation

### Generative Models

**GAN** (`GAN`)
- Generative Adversarial Networks
- Synthetic EHR data generation
- Privacy-preserving data sharing
- Augmentation for rare conditions

**VAE** (`VAE`)
- Variational Autoencoder
- Patient representation learning
- Anomaly detection
- Latent space exploration

### Social Determinants of Health

**SDOH** (`SDOH`)
- Social determinants integration
- Multi-modal prediction
- Addresses health disparities
- Combines clinical and social data

## Model Selection Guidelines

### By Task Type

**Binary Classification** (Mortality, Readmission)
- Start with: Logistic Regression (baseline)
- Standard: RNN, Transformer
- Interpretable: RETAIN, AdaCare
- Advanced: StageNet

**Multi-Label Classification** (Drug Recommendation)
- Standard: CNN, RNN
- Healthcare-specific: GAMENet, SafeDrug, MICRON, MoleRec
- Graph-based: GNN

**Regression** (Length of Stay)
- Start with: MLP (baseline)
- Sequential: RNN, TCN
- Advanced: Transformer

**Multi-Class Classification** (Medical Coding, Specialty)
- Standard: CNN, RNN, Transformer
- Text-based: TransformersModel (BERT variants)

### By Data Type

**Sequential Events** (Diagnoses, Medications, Procedures)
- RNN, LSTM, GRU
- Transformer
- RETAIN, AdaCare, ConCare

**Time-Series Signals** (EEG, ECG)
- CNN, TCN
- RNN
- Transformer

**Text** (Clinical Notes)
- TransformersModel (ClinicalBERT, BioBERT)
- CNN for shorter text
- RNN for sequential text

**Graphs** (Drug Interactions, Patient Networks)
- GNN (GAT, GCN)
- GAMENet, SafeDrug

**Images** (X-rays, CT scans)
- CNN (ResNet, DenseNet via TransformersModel)
- Vision Transformers

### By Interpretability Needs

**High Interpretability Required:**
- Logistic Regression
- RETAIN
- AdaCare
- SparcNet

**Moderate Interpretability:**
- CNN (filter visualization)
- Transformer (attention visualization)
- GNN (graph attention)

**Black-Box Acceptable:**
- Deep RNN models
- Complex ensembles

## Training Considerations

### Hyperparameter Tuning

**Embedding Dimension:**
- Small datasets: 64-128
- Large datasets: 128-256
- Complex tasks: 256-512

**Hidden Dimension:**
- Proportional to embedding_dim
- Typically 1-2x embedding_dim

**Number of Layers:**
- Start with 2-3 layers
- Deeper for complex patterns
- Watch for overfitting

**Dropout:**
- Start with 0.5
- Reduce if underfitting (0.1-0.3)
- Increase if overfitting (0.5-0.7)

### Computational Requirements

**Memory (GPU):**
- CNN: Low to moderate
- RNN: Moderate (sequence length dependent)
- Transformer: High (quadratic in sequence length)
- GNN: Moderate to high (graph size dependent)

**Training Speed:**
- Fastest: Logistic Regression, MLP, CNN
- Moderate: RNN, GNN
- Slower: Transformer (but parallelizable)

### Best Practices

1. **Start with simple baselines** (Logistic Regression, MLP)
2. **Use appropriate feature keys** based on data availability
3. **Match mode to task output** (binary, multiclass, multilabel, regression)
4. **Consider interpretability requirements** for clinical deployment
5. **Validate on held-out test set** for realistic performance
6. **Monitor for overfitting** especially with complex models
7. **Use pretrained models** when possible (TransformersModel)
8. **Consider computational constraints** for deployment

## Example Workflow

```python
from pyhealth.datasets import MIMIC4Dataset
from pyhealth.tasks import mortality_prediction_mimic4_fn
from pyhealth.models import Transformer
from pyhealth.trainer import Trainer

# 1. Prepare data
dataset = MIMIC4Dataset(root="/path/to/data")
sample_dataset = dataset.set_task(mortality_prediction_mimic4_fn)

# 2. Initialize model
model = Transformer(
    dataset=sample_dataset,
    feature_keys=["diagnoses", "medications", "procedures"],
    mode="binary",
    embedding_dim=128,
    num_heads=8,
    num_layers=3,
    dropout=0.3
)

# 3. Train model
trainer = Trainer(model=model)
trainer.train(
    train_dataloader=train_loader,
    val_dataloader=val_loader,
    epochs=50,
    monitor="pr_auc_score",
    monitor_criterion="max"
)

# 4. Evaluate
results = trainer.evaluate(test_loader)
print(results)
```
