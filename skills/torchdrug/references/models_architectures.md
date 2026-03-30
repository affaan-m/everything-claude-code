# Models and Architectures

## Overview

TorchDrug provides a comprehensive collection of pre-built model architectures for various graph-based learning tasks. This reference catalogs all available models with their characteristics, use cases, and implementation details.

## Graph Neural Networks

### GCN (Graph Convolutional Network)

**Type:** Spatial message passing
**Paper:** Semi-Supervised Classification with Graph Convolutional Networks (Kipf & Welling, 2017)

**Characteristics:**
- Simple and efficient aggregation
- Normalized adjacency matrix convolution
- Works well for homophilic graphs
- Good baseline for many tasks

**Best For:**
- Initial experiments and baselines
- When computational efficiency is important
- Graphs with clear local structure

**Parameters:**
- `input_dim`: Node feature dimension
- `hidden_dims`: List of hidden layer dimensions
- `edge_input_dim`: Edge feature dimension (optional)
- `batch_norm`: Apply batch normalization
- `activation`: Activation function (relu, elu, etc.)
- `dropout`: Dropout rate

**Use Cases:**
- Molecular property prediction
- Citation network classification
- Social network analysis

### GAT (Graph Attention Network)

**Type:** Attention-based message passing
**Paper:** Graph Attention Networks (Veličković et al., 2018)

**Characteristics:**
- Learns attention weights for neighbors
- Different importance for different neighbors
- Multi-head attention for robustness
- Handles varying node degrees naturally

**Best For:**
- When neighbor importance varies
- Heterogeneous graphs
- Interpretable predictions

**Parameters:**
- `input_dim`, `hidden_dims`: Standard dimensions
- `num_heads`: Number of attention heads
- `negative_slope`: LeakyReLU slope
- `concat`: Concatenate or average multi-head outputs

**Use Cases:**
- Protein-protein interaction prediction
- Molecule generation with attention to reactive sites
- Knowledge graph reasoning with relation importance

### GIN (Graph Isomorphism Network)

**Type:** Maximally powerful message passing
**Paper:** How Powerful are Graph Neural Networks? (Xu et al., 2019)

**Characteristics:**
- Theoretically most expressive GNN architecture
- Injective aggregation function
- Can distinguish graph structures GCN cannot
- Often best performance on molecular tasks

**Best For:**
- Molecular property prediction (state-of-the-art)
- Tasks requiring structural discrimination
- Graph classification

**Parameters:**
- `input_dim`, `hidden_dims`: Standard dimensions
- `edge_input_dim`: Include edge features
- `batch_norm`: Typically use true
- `readout`: Graph pooling ("sum", "mean", "max")
- `eps`: Learnable or fixed epsilon

**Use Cases:**
- Drug property prediction (BBBP, HIV, etc.)
- Molecular generation
- Reaction prediction

### RGCN (Relational Graph Convolutional Network)

**Type:** Multi-relational message passing
**Paper:** Modeling Relational Data with Graph Convolutional Networks (Schlichtkrull et al., 2018)

**Characteristics:**
- Handles multiple edge/relation types
- Relation-specific weight matrices
- Basis decomposition for parameter efficiency
- Essential for knowledge graphs

**Best For:**
- Knowledge graph reasoning
- Heterogeneous molecular graphs
- Multi-relational data

**Parameters:**
- `num_relation`: Number of relation types
- `hidden_dims`: Layer dimensions
- `num_bases`: Basis decomposition (reduce parameters)

**Use Cases:**
- Knowledge graph completion
- Retrosynthesis (different bond types)
- Protein interaction networks

### MPNN (Message Passing Neural Network)

**Type:** General message passing framework
**Paper:** Neural Message Passing for Quantum Chemistry (Gilmer et al., 2017)

**Characteristics:**
- Flexible message and update functions
- Edge features in message computation
- GRU updates for node hidden states
- Set2Set readout for graph representation

**Best For:**
- Quantum chemistry predictions
- Tasks with important edge information
- When node states evolve over multiple iterations

**Parameters:**
- `input_dim`, `hidden_dim`: Feature dimensions
- `edge_input_dim`: Edge feature dimension
- `num_layer`: Message passing iterations
- `num_mlp_layer`: MLP layers in message function

**Use Cases:**
- QM9 quantum property prediction
- Molecular dynamics
- 3D conformation-aware tasks

### SchNet (Continuous-Filter Convolutional Network)

**Type:** 3D geometry-aware convolution
**Paper:** SchNet: A continuous-filter convolutional neural network (Schütt et al., 2017)

**Characteristics:**
- Operates on 3D atomic coordinates
- Continuous filter convolutions
- Rotation and translation invariant
- Excellent for quantum chemistry

**Best For:**
- 3D molecular structure tasks
- Quantum property prediction
- Protein structure analysis
- Energy and force prediction

**Parameters:**
- `input_dim`: Atom features
- `hidden_dims`: Layer dimensions
- `num_gaussian`: RBF basis functions for distances
- `cutoff`: Interaction cutoff distance

**Use Cases:**
- QM9 property prediction
- Molecular dynamics simulations
- Protein-ligand binding with structures
- Crystal property prediction

### ChebNet (Chebyshev Spectral CNN)

**Type:** Spectral convolution
**Paper:** Convolutional Neural Networks on Graphs (Defferrard et al., 2016)

**Characteristics:**
- Spectral graph convolution
- Chebyshev polynomial approximation
- Captures global graph structure
- Computationally efficient

**Best For:**
- Tasks requiring global information
- When graph Laplacian is informative
- Theoretical analysis

**Parameters:**
- `input_dim`, `hidden_dims`: Dimensions
- `num_cheb`: Order of Chebyshev polynomial

**Use Cases:**
- Citation network classification
- Brain network analysis
- Signal processing on graphs

### NFP (Neural Fingerprint)

**Type:** Molecular fingerprint learning
**Paper:** Convolutional Networks on Graphs for Learning Molecular Fingerprints (Duvenaud et al., 2015)

**Characteristics:**
- Learns differentiable molecular fingerprints
- Alternative to hand-crafted fingerprints (ECFP)
- Circular convolutions like ECFP
- Interpretable learned features

**Best For:**
- Molecular similarity learning
- Property prediction with limited data
- When interpretability is important

**Parameters:**
- `input_dim`, `output_dim`: Feature dimensions
- `hidden_dims`: Layer dimensions
- `num_layer`: Circular convolution depth

**Use Cases:**
- Virtual screening
- Molecular similarity search
- QSAR modeling

## Protein-Specific Models

### GearNet (Geometry-Aware Relational Graph Network)

**Type:** Protein structure encoder
**Paper:** Protein Representation Learning by Geometric Structure Pretraining (Zhang et al., 2023)

**Characteristics:**
- Incorporates 3D geometric information
- Multiple edge types (sequential, spatial, KNN)
- Designed specifically for proteins
- State-of-the-art on protein tasks

**Best For:**
- Protein structure prediction
- Protein function prediction
- Protein-protein interaction
- Any task with protein 3D structures

**Parameters:**
- `input_dim`: Residue features
- `hidden_dims`: Layer dimensions
- `num_relation`: Edge types (sequence, radius, KNN)
- `edge_input_dim`: Geometric features (distances, angles)
- `batch_norm`: Typically true

**Use Cases:**
- Enzyme function prediction (EnzymeCommission)
- Protein fold recognition
- Contact prediction
- Binding site identification

### ESM (Evolutionary Scale Modeling)

**Type:** Protein language model (transformer)
**Paper:** Biological structure and function emerge from scaling unsupervised learning (Rives et al., 2021)

**Characteristics:**
- Pre-trained on 250M+ protein sequences
- Captures evolutionary and structural information
- Transformer architecture
- Transfer learning for downstream tasks

**Best For:**
- Any sequence-based protein task
- When no structure available
- Transfer learning with limited data

**Variants:**
- ESM-1b: 650M parameters
- ESM-2: Multiple sizes (8M to 15B parameters)

**Use Cases:**
- Protein function prediction
- Variant effect prediction
- Protein design
- Structure prediction (ESMFold)

### ProteinBERT

**Type:** Masked language model for proteins

**Characteristics:**
- BERT-style pre-training
- Masked amino acid prediction
- Bidirectional context
- Good for sequence-based tasks

**Use Cases:**
- Function annotation
- Subcellular localization
- Stability prediction

### ProteinCNN / ProteinResNet

**Type:** Convolutional networks for sequences

**Characteristics:**
- 1D convolutions on sequences
- Local pattern recognition
- Faster than transformers
- Good for motif detection

**Use Cases:**
- Binding site prediction
- Secondary structure prediction
- Domain identification

### ProteinLSTM

**Type:** Recurrent network for sequences

**Characteristics:**
- Bidirectional LSTM
- Captures long-range dependencies
- Sequential processing
- Good baseline for sequence tasks

**Use Cases:**
- Order prediction
- Sequential annotation
- Time-series protein data

## Knowledge Graph Models

### TransE (Translation Embedding)

**Type:** Translation-based embedding
**Paper:** Translating Embeddings for Modeling Multi-relational Data (Bordes et al., 2013)

**Characteristics:**
- h + r ≈ t (head + relation ≈ tail)
- Simple and interpretable
- Works well for 1-to-1 relations
- Memory efficient

**Best For:**
- Large knowledge graphs
- Initial experiments
- Interpretable embeddings

**Parameters:**
- `num_entity`, `num_relation`: Graph size
- `embedding_dim`: Embedding dimensions (typically 50-500)

### RotatE (Rotation Embedding)

**Type:** Rotation in complex space
**Paper:** RotatE: Knowledge Graph Embedding by Relational Rotation in Complex Space (Sun et al., 2019)

**Characteristics:**
- Relations as rotations in complex space
- Handles symmetric, antisymmetric, inverse, composition
- State-of-the-art on many benchmarks

**Best For:**
- Most knowledge graph tasks
- Complex relation patterns
- When accuracy is critical

**Parameters:**
- `num_entity`, `num_relation`: Graph size
- `embedding_dim`: Must be even (complex embeddings)
- `max_score`: Score clipping value

### DistMult

**Type:** Bilinear model

**Characteristics:**
- Symmetric relation modeling
- Fast and efficient
- Cannot model antisymmetric relations

**Best For:**
- Symmetric relations (e.g., "similar to")
- When speed is critical
- Large-scale graphs

### ComplEx

**Type:** Complex-valued embeddings

**Characteristics:**
- Handles asymmetric and symmetric relations
- Better than DistMult for most graphs
- Good balance of expressiveness and efficiency

**Best For:**
- General knowledge graph completion
- Mixed relation types
- When RotatE is too complex

### SimplE

**Type:** Enhanced embedding model

**Characteristics:**
- Two embeddings per entity (canonical + inverse)
- Fully expressive
- Slightly more parameters than ComplEx

**Best For:**
- When full expressiveness needed
- Inverse relations are important

## Generative Models

### GraphAutoregressiveFlow

**Type:** Normalizing flow for molecules

**Characteristics:**
- Exact likelihood computation
- Invertible transformations
- Stable training (no adversarial)
- Conditional generation support

**Best For:**
- Molecular generation
- Density estimation
- Interpolation between molecules

**Parameters:**
- `input_dim`: Atom features
- `hidden_dims`: Coupling layers
- `num_flow`: Number of flow transformations

**Use Cases:**
- De novo drug design
- Chemical space exploration
- Property-targeted generation

## Pre-training Models

### InfoGraph

**Type:** Contrastive learning

**Characteristics:**
- Maximizes mutual information
- Graph-level and node-level contrast
- Unsupervised pre-training
- Good for small datasets

**Use Cases:**
- Pre-train molecular encoders
- Few-shot learning
- Transfer learning

### MultiviewContrast

**Type:** Multi-view contrastive learning for proteins

**Characteristics:**
- Contrasts different views of proteins
- Geometric pre-training
- Uses 3D structure information
- Excellent for protein models

**Use Cases:**
- Pre-train GearNet on protein structures
- Transfer to property prediction
- Limited labeled data scenarios

## Model Selection Guide

### By Task Type

**Molecular Property Prediction:**
1. GIN (first choice)
2. GAT (interpretability)
3. SchNet (3D available)

**Protein Tasks:**
1. ESM (sequence only)
2. GearNet (structure available)
3. ProteinBERT (sequence, lighter than ESM)

**Knowledge Graphs:**
1. RotatE (best performance)
2. ComplEx (good balance)
3. TransE (large graphs, efficiency)

**Molecular Generation:**
1. GraphAutoregressiveFlow (exact likelihood)
2. GCPN with GIN backbone (property optimization)

**Retrosynthesis:**
1. GIN (synthon completion)
2. RGCN (center identification with bond types)

### By Dataset Size

**Small (< 1k):**
- Use pre-trained models (ESM for proteins)
- Simpler architectures (GCN, ProteinCNN)
- Heavy regularization

**Medium (1k-100k):**
- GIN for molecules
- GAT for interpretability
- Standard training

**Large (> 100k):**
- Any model works
- Deeper architectures
- Can train from scratch

### By Computational Budget

**Low:**
- GCN (simplest)
- DistMult (KG)
- ProteinLSTM

**Medium:**
- GIN
- GAT
- ComplEx

**High:**
- ESM (large)
- SchNet (3D)
- RotatE with high dim

## Implementation Tips

1. **Start Simple**: Begin with GCN or GIN baseline
2. **Use Pre-trained**: ESM for proteins, InfoGraph for molecules
3. **Tune Depth**: 3-5 layers typically sufficient
4. **Batch Normalization**: Usually helps (except KG embeddings)
5. **Residual Connections**: Important for deep networks
6. **Readout Function**: "mean" usually works well
7. **Edge Features**: Include when available (bonds, distances)
8. **Regularization**: Dropout, weight decay, early stopping
