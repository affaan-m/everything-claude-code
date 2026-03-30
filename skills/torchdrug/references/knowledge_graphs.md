# Knowledge Graph Reasoning

## Overview

Knowledge graphs represent structured information as entities and relations in a graph format. TorchDrug provides comprehensive support for knowledge graph completion (link prediction) using embedding-based models and neural reasoning approaches.

## Available Datasets

### General Knowledge Graphs

**FB15k (Freebase subset):**
- 14,951 entities
- 1,345 relation types
- 592,213 triples
- General world knowledge from Freebase

**FB15k-237:**
- 14,541 entities
- 237 relation types
- 310,116 triples
- Filtered version removing inverse relations
- More challenging benchmark

**WN18 (WordNet):**
- 40,943 entities (word senses)
- 18 relation types (lexical relations)
- 151,442 triples
- Linguistic knowledge graph

**WN18RR:**
- 40,943 entities
- 11 relation types
- 93,003 triples
- Filtered WordNet removing easy inverse patterns

### Biomedical Knowledge Graphs

**Hetionet:**
- 45,158 entities (genes, compounds, diseases, pathways, etc.)
- 24 relation types (treats, causes, binds, etc.)
- 2,250,197 edges
- Integrates 29 public biomedical databases
- Designed for drug repurposing and disease understanding

## Task: KnowledgeGraphCompletion

The primary task for knowledge graphs is link prediction - given a head entity and relation, predict the tail entity (or vice versa).

### Task Modes

**Head Prediction:**
- Given (?, relation, tail), predict head entity
- "What can cause Disease X?"

**Tail Prediction:**
- Given (head, relation, ?), predict tail entity
- "What diseases does Gene X cause?"

**Both:**
- Predict both head and tail
- Standard evaluation protocol

### Evaluation Metrics

**Ranking Metrics:**
- **Mean Rank (MR)**: Average rank of correct entity
- **Mean Reciprocal Rank (MRR)**: Average of 1/rank
- **Hits@K**: Percentage of correct entities in top K predictions
  - Typically reported for K=1, 3, 10

**Filtered vs Raw:**
- **Filtered**: Remove other known true triples from ranking
- **Raw**: Rank among all possible entities
- Filtered is standard for evaluation

## Embedding Models

### Translational Models

**TransE (Translation Embedding):**
- Represents relations as translations in embedding space
- h + r ≈ t (head + relation ≈ tail)
- Simple and effective baseline
- Works well for 1-to-1 relations
- Struggles with N-to-N relations

**RotatE (Rotation Embedding):**
- Relations as rotations in complex space
- Better handles symmetric and inverse relations
- State-of-the-art on many benchmarks
- Can model composition patterns

### Semantic Matching Models

**DistMult:**
- Bilinear scoring function
- Handles symmetric relations naturally
- Cannot model asymmetric relations
- Fast and memory efficient

**ComplEx:**
- Complex-valued embeddings
- Models asymmetric and inverse relations
- Better than DistMult for most graphs
- Balances expressiveness and efficiency

**SimplE:**
- Extends DistMult with inverse relations
- Fully expressive (can represent any relation pattern)
- Two embeddings per entity (canonical and inverse)

### Neural Logic Models

**NeuralLP (Neural Logic Programming):**
- Learns logical rules through differentiable operations
- Interprets predictions via learned rules
- Good for sparse knowledge graphs
- Computationally more expensive

**KBGAT (Knowledge Base Graph Attention):**
- Graph attention networks for KG completion
- Learns entity representations from neighborhood
- Handles unseen entities through inductive learning
- Better for incomplete graphs

## Training Workflow

### Basic Pipeline

```python
from torchdrug import datasets, models, tasks, core

# Load dataset
dataset = datasets.FB15k237("~/kg-datasets/")

# Define model
model = models.RotatE(
    num_entity=dataset.num_entity,
    num_relation=dataset.num_relation,
    embedding_dim=2000,
    max_score=9
)

# Define task
task = tasks.KnowledgeGraphCompletion(
    model,
    num_negative=128,
    adversarial_temperature=2,
    criterion="bce"
)

# Train with PyTorch Lightning or custom loop
```

### Negative Sampling

**Strategies:**
- **Uniform**: Sample entities uniformly at random
- **Self-Adversarial**: Weight samples by current model's scores
- **Type-Constrained**: Sample only valid entity types for relation

**Parameters:**
- `num_negative`: Number of negative samples per positive triple
- `adversarial_temperature`: Temperature for self-adversarial weighting
- Higher temperature = more focus on hard negatives

### Loss Functions

**Binary Cross-Entropy (BCE):**
- Treats each triple independently
- Balanced classification between positive and negative

**Margin Loss:**
- Ensures positive scores higher than negative by margin
- `max(0, margin + score_neg - score_pos)`

**Logistic Loss:**
- Smooth version of margin loss
- Better gradient properties

## Model Selection Guide

### By Relation Patterns

**1-to-1 Relations:**
- TransE works well
- Any model will likely succeed

**1-to-N Relations:**
- DistMult, ComplEx, SimplE
- Avoid TransE

**N-to-1 Relations:**
- DistMult, ComplEx, SimplE
- Avoid TransE

**N-to-N Relations:**
- ComplEx, SimplE, RotatE
- Most challenging pattern

**Symmetric Relations:**
- DistMult, ComplEx
- RotatE with proper initialization

**Antisymmetric Relations:**
- ComplEx, SimplE, RotatE
- Avoid DistMult

**Inverse Relations:**
- ComplEx, SimplE, RotatE
- Important for bidirectional reasoning

**Composition:**
- RotatE (best)
- TransE (reasonable)
- Captures multi-hop paths

### By Dataset Characteristics

**Small Graphs (< 50k entities):**
- ComplEx or SimplE
- Lower embedding dimensions (200-500)

**Large Graphs (> 100k entities):**
- DistMult for efficiency
- RotatE for accuracy
- Higher dimensions (500-2000)

**Sparse Graphs:**
- NeuralLP (learns rules from limited data)
- Pre-train embeddings on larger graphs

**Dense, Complete Graphs:**
- Any embedding model works well
- Choose based on relation patterns

**Biomedical/Domain Graphs:**
- Consider type constraints in sampling
- Use domain-specific negative sampling
- Hetionet benefits from relation-specific models

## Advanced Techniques

### Multi-Hop Reasoning

Chain multiple relations to answer complex queries:
- "What drugs treat diseases caused by gene X?"
- Requires path-based or rule-based reasoning
- NeuralLP naturally supports this

### Temporal Knowledge Graphs

Extend to time-varying facts:
- Add temporal information to triples
- Predict future facts
- Requires temporal encoding in models

### Few-Shot Learning

Handle relations with few examples:
- Meta-learning approaches
- Transfer from related relations
- Important for emerging knowledge

### Inductive Learning

Generalize to unseen entities:
- KBGAT and other GNN-based methods
- Use entity features/descriptions
- Critical for evolving knowledge graphs

## Biomedical Applications

### Drug Repurposing

Predict "drug treats disease" links in Hetionet:
1. Train on known drug-disease associations
2. Predict new treatment candidates
3. Filter by mechanism (gene, pathway involvement)
4. Validate predictions experimentally

### Disease Gene Discovery

Identify genes associated with diseases:
1. Model gene-disease-pathway networks
2. Predict missing gene-disease links
3. Incorporate protein interactions, expression data
4. Prioritize candidates for validation

### Protein Function Prediction

Link proteins to biological processes:
1. Integrate protein interactions, GO terms
2. Predict missing GO annotations
3. Transfer function from similar proteins

## Common Issues and Solutions

**Issue: Poor performance on specific relation types**
- Solution: Analyze relation patterns, choose appropriate model, or use relation-specific models

**Issue: Overfitting on small graphs**
- Solution: Reduce embedding dimension, increase regularization, or use simpler models

**Issue: Slow training on large graphs**
- Solution: Reduce negative samples, use DistMult for efficiency, or implement mini-batch training

**Issue: Cannot handle new entities**
- Solution: Use inductive models (KBGAT), incorporate entity features, or pre-compute embeddings for new entities based on their neighbors

## Best Practices

1. Start with ComplEx or RotatE for most tasks
2. Use self-adversarial negative sampling
3. Tune embedding dimension (typically 500-2000)
4. Apply regularization to prevent overfitting
5. Use filtered evaluation metrics
6. Analyze performance per relation type
7. Consider relation-specific models for heterogeneous graphs
8. Validate predictions with domain experts
