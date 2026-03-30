# ESM C API Reference

## Overview

ESM C (Cambrian) is a family of protein language models optimized for representation learning and efficient embedding generation. Designed as a drop-in replacement for ESM2, ESM C provides significant improvements in speed and quality across all model sizes.

## Model Architecture

**ESM C Family Models:**

| Model ID | Parameters | Layers | Best For |
|----------|-----------|--------|----------|
| `esmc-300m` | 300M | 30 | Fast inference, lightweight applications |
| `esmc-600m` | 600M | 36 | Balanced performance and quality |
| `esmc-6b` | 6B | 80 | Maximum representation quality |

**Key Features:**
- 3x faster inference than ESM2
- Improved perplexity and embedding quality
- Efficient architecture for production deployment
- Compatible with ESM2 workflows (drop-in replacement)
- Support for long sequences (up to 1024 residues efficiently)

**Architecture Improvements over ESM2:**
- Optimized attention mechanisms
- Better token representation
- Enhanced training procedures
- Reduced memory footprint

## Core API Components

### ESMC Class

Main interface for ESM C models.

**Model Loading:**

```python
from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein

# Load model with automatic device placement
model = ESMC.from_pretrained("esmc-300m").to("cuda")

# Or specify device explicitly
model = ESMC.from_pretrained("esmc-600m").to("cpu")

# For maximum quality
model = ESMC.from_pretrained("esmc-6b").to("cuda")
```

**Model Selection Criteria:**

- **esmc-300m**: Development, real-time applications, batch processing of many sequences
- **esmc-600m**: Production deployments, good quality/speed balance
- **esmc-6b**: Research, maximum accuracy for downstream tasks

### Basic Embedding Generation

**Single Sequence:**

```python
from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein

# Load model
model = ESMC.from_pretrained("esmc-600m").to("cuda")

# Create protein
protein = ESMProtein(sequence="MPRTKEINDAGLIVHSPQWFYK")

# Encode to tensor
protein_tensor = model.encode(protein)

# Generate embeddings
embeddings = model.forward(protein_tensor)

# Get logits (per-position predictions)
logits = model.logits(embeddings)

print(f"Embedding shape: {embeddings.shape}")
print(f"Logits shape: {logits.shape}")
```

**Output Shapes:**

For a sequence of length L:
- `embeddings.shape`: `(1, L, hidden_dim)` where hidden_dim depends on model
  - esmc-300m: hidden_dim = 960
  - esmc-600m: hidden_dim = 1152
  - esmc-6b: hidden_dim = 2560
- `logits.shape`: `(1, L, 64)` - per-position amino acid predictions

### Batch Processing

Process multiple sequences efficiently:

```python
import torch

# Multiple proteins
sequences = [
    "MPRTKEINDAGLIVHSP",
    "AGKWFYLTQSNHERVPM",
    "DEIFKRNAVWGSLTPQY"
]

proteins = [ESMProtein(sequence=seq) for seq in sequences]

# Encode all
protein_tensors = [model.encode(p) for p in proteins]

# Process batch (if same length)
# For variable lengths, process individually or pad
embeddings_list = []
for tensor in protein_tensors:
    embedding = model.forward(tensor)
    embeddings_list.append(embedding)

print(f"Processed {len(embeddings_list)} proteins")
```

**Efficient Batching for Variable Lengths:**

```python
def batch_encode_variable_length(model, sequences, max_batch_size=32):
    """
    Efficiently batch encode sequences of variable length.
    Groups by similar length for efficiency.
    """
    # Sort by length
    sorted_seqs = sorted(enumerate(sequences), key=lambda x: len(x[1]))

    results = [None] * len(sequences)
    batch = []
    batch_indices = []

    for idx, seq in sorted_seqs:
        batch.append(seq)
        batch_indices.append(idx)

        # Process batch when full or length changes significantly
        if (len(batch) >= max_batch_size or
            (len(batch) > 0 and abs(len(seq) - len(batch[0])) > 10)):

            # Process current batch
            proteins = [ESMProtein(sequence=s) for s in batch]
            embeddings = [model.forward(model.encode(p)) for p in proteins]

            # Store results
            for i, emb in zip(batch_indices, embeddings):
                results[i] = emb

            batch = []
            batch_indices = []

    # Process remaining
    if batch:
        proteins = [ESMProtein(sequence=s) for s in batch]
        embeddings = [model.forward(model.encode(p)) for p in proteins]
        for i, emb in zip(batch_indices, embeddings):
            results[i] = emb

    return results
```

## Common Use Cases

### 1. Sequence Similarity Analysis

Compute similarity between proteins using embeddings:

```python
import torch
import torch.nn.functional as F

def get_sequence_embedding(model, sequence):
    """Get mean-pooled sequence embedding."""
    protein = ESMProtein(sequence=sequence)
    tensor = model.encode(protein)
    embedding = model.forward(tensor)

    # Mean pooling over sequence length
    return embedding.mean(dim=1)

# Get embeddings
seq1_emb = get_sequence_embedding(model, "MPRTKEINDAGLIVHSP")
seq2_emb = get_sequence_embedding(model, "MPRTKEINDAGLIVHSQ")  # Similar
seq3_emb = get_sequence_embedding(model, "WWWWWWWWWWWWWWWWW")  # Different

# Compute cosine similarity
sim_1_2 = F.cosine_similarity(seq1_emb, seq2_emb)
sim_1_3 = F.cosine_similarity(seq1_emb, seq3_emb)

print(f"Similarity (1,2): {sim_1_2.item():.4f}")
print(f"Similarity (1,3): {sim_1_3.item():.4f}")
```

### 2. Protein Classification

Use embeddings as features for classification:

```python
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Generate embeddings for training set
def embed_dataset(model, sequences):
    embeddings = []
    for seq in sequences:
        protein = ESMProtein(sequence=seq)
        tensor = model.encode(protein)
        emb = model.forward(tensor).mean(dim=1)  # Mean pooling
        embeddings.append(emb.cpu().detach().numpy().flatten())
    return np.array(embeddings)

# Example: Classify proteins by function
train_sequences = [...]  # Your sequences
train_labels = [...]      # Your labels

embeddings = embed_dataset(model, train_sequences)

# Train classifier
X_train, X_test, y_train, y_test = train_test_split(
    embeddings, train_labels, test_size=0.2
)

classifier = LogisticRegression(max_iter=1000)
classifier.fit(X_train, y_train)

# Evaluate
accuracy = classifier.score(X_test, y_test)
print(f"Classification accuracy: {accuracy:.4f}")
```

### 3. Protein Clustering

Cluster proteins based on sequence similarity:

```python
from sklearn.cluster import KMeans
import numpy as np

# Generate embeddings
sequences = [...]  # Your protein sequences
embeddings = embed_dataset(model, sequences)

# Cluster
n_clusters = 5
kmeans = KMeans(n_clusters=n_clusters, random_state=42)
cluster_labels = kmeans.fit_predict(embeddings)

# Analyze clusters
for i in range(n_clusters):
    cluster_seqs = [seq for seq, label in zip(sequences, cluster_labels) if label == i]
    print(f"Cluster {i}: {len(cluster_seqs)} sequences")
```

### 4. Sequence Search and Retrieval

Find similar sequences in a database:

```python
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def build_sequence_index(model, database_sequences):
    """Build searchable index of sequence embeddings."""
    embeddings = []
    for seq in database_sequences:
        emb = get_sequence_embedding(model, seq)
        embeddings.append(emb.cpu().detach().numpy().flatten())
    return np.array(embeddings)

def search_similar_sequences(model, query_seq, database_embeddings,
                            database_sequences, top_k=10):
    """Find top-k most similar sequences."""
    query_emb = get_sequence_embedding(model, query_seq)
    query_emb_np = query_emb.cpu().detach().numpy().flatten().reshape(1, -1)

    # Compute similarities
    similarities = cosine_similarity(query_emb_np, database_embeddings)[0]

    # Get top-k
    top_indices = np.argsort(similarities)[-top_k:][::-1]

    results = [
        (database_sequences[idx], similarities[idx])
        for idx in top_indices
    ]
    return results

# Example usage
database_seqs = [...]  # Large sequence database
index = build_sequence_index(model, database_seqs)

query = "MPRTKEINDAGLIVHSP"
similar = search_similar_sequences(model, query, index, database_seqs, top_k=5)

for seq, score in similar:
    print(f"Score: {score:.4f} - {seq[:30]}...")
```

### 5. Feature Extraction for Downstream Models

Use ESM C embeddings as input to custom neural networks:

```python
import torch.nn as nn

class ProteinPropertyPredictor(nn.Module):
    """Example: Predict protein properties from ESM C embeddings."""

    def __init__(self, embedding_dim, hidden_dim, output_dim):
        super().__init__()
        self.fc1 = nn.Linear(embedding_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, output_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.3)

    def forward(self, embeddings):
        # embeddings: (batch, seq_len, embedding_dim)
        # Mean pool over sequence
        x = embeddings.mean(dim=1)

        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x

# Use ESM C as frozen feature extractor
esm_model = ESMC.from_pretrained("esmc-600m").to("cuda")
esm_model.eval()  # Freeze

# Create task-specific model
predictor = ProteinPropertyPredictor(
    embedding_dim=1152,  # esmc-600m dimension
    hidden_dim=512,
    output_dim=1  # e.g., stability score
).to("cuda")

# Training loop
for sequence, target in dataloader:
    protein = ESMProtein(sequence=sequence)
    with torch.no_grad():
        embeddings = esm_model.forward(esm_model.encode(protein))

    prediction = predictor(embeddings)
    loss = criterion(prediction, target)
    # ... backprop through predictor only
```

### 6. Per-Residue Analysis

Extract per-residue representations for detailed analysis:

```python
def get_per_residue_embeddings(model, sequence):
    """Get embedding for each residue."""
    protein = ESMProtein(sequence=sequence)
    tensor = model.encode(protein)
    embeddings = model.forward(tensor)

    # embeddings shape: (1, seq_len, hidden_dim)
    return embeddings.squeeze(0)  # (seq_len, hidden_dim)

# Analyze specific positions
sequence = "MPRTKEINDAGLIVHSPQWFYK"
residue_embeddings = get_per_residue_embeddings(model, sequence)

# Extract features for position 10
position_10_features = residue_embeddings[10]
print(f"Features for residue {sequence[10]} at position 10:")
print(f"Shape: {position_10_features.shape}")

# Compare residue representations
pos_5 = residue_embeddings[5]
pos_15 = residue_embeddings[15]
similarity = F.cosine_similarity(pos_5, pos_15, dim=0)
print(f"Residue similarity: {similarity.item():.4f}")
```

## Performance Optimization

### Memory Management

```python
import torch

# Use half precision for memory efficiency
model = ESMC.from_pretrained("esmc-600m").to("cuda").half()

# Process with mixed precision
with torch.cuda.amp.autocast():
    embeddings = model.forward(model.encode(protein))

# Clear cache between batches
torch.cuda.empty_cache()
```

### Batch Processing Best Practices

```python
def efficient_batch_processing(model, sequences, batch_size=32):
    """Process sequences in optimized batches."""
    results = []

    for i in range(0, len(sequences), batch_size):
        batch = sequences[i:i + batch_size]

        # Process batch
        batch_embeddings = []
        for seq in batch:
            protein = ESMProtein(sequence=seq)
            emb = model.forward(model.encode(protein))
            batch_embeddings.append(emb)

        results.extend(batch_embeddings)

        # Periodically clear cache
        if i % (batch_size * 10) == 0:
            torch.cuda.empty_cache()

    return results
```

### Caching Embeddings

```python
import pickle
import hashlib

def get_cache_key(sequence):
    """Generate cache key for sequence."""
    return hashlib.md5(sequence.encode()).hexdigest()

class EmbeddingCache:
    """Cache for protein embeddings."""

    def __init__(self, cache_file="embeddings_cache.pkl"):
        self.cache_file = cache_file
        try:
            with open(cache_file, 'rb') as f:
                self.cache = pickle.load(f)
        except FileNotFoundError:
            self.cache = {}

    def get(self, sequence):
        key = get_cache_key(sequence)
        return self.cache.get(key)

    def set(self, sequence, embedding):
        key = get_cache_key(sequence)
        self.cache[key] = embedding

    def save(self):
        with open(self.cache_file, 'wb') as f:
            pickle.dump(self.cache, f)

# Usage
cache = EmbeddingCache()

def get_embedding_cached(model, sequence):
    cached = cache.get(sequence)
    if cached is not None:
        return cached

    # Compute
    protein = ESMProtein(sequence=sequence)
    embedding = model.forward(model.encode(protein))
    cache.set(sequence, embedding)

    return embedding

# Don't forget to save cache
cache.save()
```

## Comparison with ESM2

**Performance Improvements:**

| Metric | ESM2-650M | ESM C-600M | Improvement |
|--------|-----------|------------|-------------|
| Inference Speed | 1.0x | 3.0x | 3x faster |
| Perplexity | Higher | Lower | Better |
| Memory Usage | 1.0x | 0.8x | 20% less |
| Embedding Quality | Baseline | Improved | +5-10% |

**Migration from ESM2:**

ESM C is designed as a drop-in replacement:

```python
# Old ESM2 code
from esm import pretrained
model, alphabet = pretrained.esm2_t33_650M_UR50D()

# New ESM C code (similar API)
from esm.models.esmc import ESMC
model = ESMC.from_pretrained("esmc-600m")
```

Key differences:
- Faster inference with same or better quality
- Simplified API through ESMProtein
- Better support for long sequences
- More efficient memory usage

## Advanced Topics

### Fine-tuning ESM C

ESM C can be fine-tuned for specific tasks:

```python
import torch.optim as optim

# Load model
model = ESMC.from_pretrained("esmc-300m").to("cuda")

# Unfreeze for fine-tuning
for param in model.parameters():
    param.requires_grad = True

# Define optimizer
optimizer = optim.Adam(model.parameters(), lr=1e-5)

# Training loop
for epoch in range(num_epochs):
    for sequences, labels in dataloader:
        optimizer.zero_grad()

        # Forward pass
        proteins = [ESMProtein(sequence=seq) for seq in sequences]
        embeddings = [model.forward(model.encode(p)) for p in proteins]

        # Your task-specific loss
        loss = compute_loss(embeddings, labels)

        loss.backward()
        optimizer.step()
```

### Attention Visualization

Extract attention weights for interpretability:

```python
def get_attention_weights(model, sequence):
    """Extract attention weights from model."""
    protein = ESMProtein(sequence=sequence)
    tensor = model.encode(protein)

    # Forward with attention output
    output = model.forward(tensor, output_attentions=True)

    return output.attentions  # List of attention tensors per layer

# Visualize attention
attentions = get_attention_weights(model, "MPRTKEINDAGLIVHSP")
# Process and visualize attention patterns
```

## Citation

If using ESM C in research, cite:

```
ESM Cambrian: https://www.evolutionaryscale.ai/blog/esm-cambrian
EvolutionaryScale (2024)
```

## Additional Resources

- ESM C blog post: https://www.evolutionaryscale.ai/blog/esm-cambrian
- Model weights: HuggingFace EvolutionaryScale organization
- Comparison benchmarks: See blog post for detailed performance comparisons
