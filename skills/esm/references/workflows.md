# ESM Workflows and Examples

## Overview

This document provides complete, end-to-end examples of common workflows using ESM3 and ESM C. Each workflow includes setup, execution, and analysis code.

## Workflow 1: Novel GFP Design with Chain-of-Thought

Design a novel fluorescent protein using ESM3's multimodal generation capabilities.

### Objective

Generate a green fluorescent protein (GFP) with specific properties using chain-of-thought reasoning across sequence, structure, and function.

### Complete Implementation

```python
from esm.models.esm3 import ESM3
from esm.sdk.api import ESMProtein, GenerationConfig, FunctionAnnotation
import matplotlib.pyplot as plt

# Setup
model = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda")

# Step 1: Define target properties
print("Step 1: Defining target GFP properties...")

# Create protein with desired function
target_length = 238  # Typical GFP length
protein = ESMProtein(
    sequence="_" * target_length,
    function_annotations=[
        FunctionAnnotation(
            label="green_fluorescent_protein",
            start=65,
            end=75  # Chromophore region
        )
    ]
)

# Step 2: Generate initial sequence with function conditioning
print("Step 2: Generating initial sequence...")

config = GenerationConfig(
    track="sequence",
    num_steps=target_length // 3,  # Gradual generation
    temperature=0.7  # Moderate diversity
)
protein = model.generate(protein, config)
print(f"Generated sequence: {protein.sequence[:50]}...")

# Step 3: Predict structure
print("Step 3: Predicting structure...")

config = GenerationConfig(
    track="structure",
    num_steps=target_length // 2
)
protein = model.generate(protein, config)
print(f"Structure predicted, coordinates shape: {protein.coordinates.shape}")

# Step 4: Refine sequence based on structure
print("Step 4: Refining sequence based on structure...")

# Mask regions for refinement (e.g., surface residues)
sequence_list = list(protein.sequence)
# Keep chromophore region, refine others
for i in range(0, 65):
    if i % 3 == 0:  # Refine every third position
        sequence_list[i] = '_'
for i in range(75, target_length):
    if i % 3 == 0:
        sequence_list[i] = '_'

protein.sequence = ''.join(sequence_list)

config = GenerationConfig(
    track="sequence",
    num_steps=50,
    temperature=0.5  # Lower temperature for refinement
)
protein = model.generate(protein, config)

# Step 5: Final validation
print("Step 5: Final validation...")

# Predict final structure
config = GenerationConfig(track="structure", num_steps=30)
protein = model.generate(protein, config)

# Save results
with open("novel_gfp.pdb", "w") as f:
    f.write(protein.to_pdb())

with open("novel_gfp_sequence.txt", "w") as f:
    f.write(f">Novel_GFP\n{protein.sequence}\n")

print(f"\nFinal GFP sequence:\n{protein.sequence}")
print(f"\nFunction annotations: {protein.function_annotations}")
print(f"Structure saved to: novel_gfp.pdb")
```

### Validation Steps

```python
# Analyze designed GFP
def analyze_gfp(protein):
    """Analyze generated GFP properties."""

    # Check chromophore region (should be around Ser65-Tyr66-Gly67)
    chromophore_region = protein.sequence[64:68]
    print(f"Chromophore region: {chromophore_region}")

    # Check barrel structure (GFPs have beta-barrel)
    # Analyze secondary structure if available
    if protein.secondary_structure:
        beta_content = protein.secondary_structure.count('E') / len(protein.sequence)
        print(f"Beta sheet content: {beta_content:.2%}")

    # Check sequence similarity to known GFPs
    # (Would require BLAST or alignment tool in practice)

    return {
        'length': len(protein.sequence),
        'chromophore': chromophore_region,
        'coordinates_available': protein.coordinates is not None
    }

analysis = analyze_gfp(protein)
print(f"\nAnalysis results: {analysis}")
```

## Workflow 2: Protein Variant Library Generation

Generate and analyze a library of protein variants for directed evolution.

### Objective

Create variants of a parent protein by targeted mutagenesis while maintaining structural integrity.

### Complete Implementation

```python
from esm.models.esm3 import ESM3
from esm.sdk.api import ESMProtein, GenerationConfig
import numpy as np
from sklearn.cluster import KMeans

# Setup
model = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda")

# Parent protein
parent_sequence = "MPRTKEINDAGLIVHSPQWFYKARNDTESLGKIVHEFPM"
parent_protein = ESMProtein(sequence=parent_sequence)

# Define mutation parameters
num_variants = 50
positions_to_mutate = 5  # Number of positions per variant

# Step 1: Generate variant library
print("Generating variant library...")

variants = []
for i in range(num_variants):
    # Create masked sequence with random positions
    seq_list = list(parent_sequence)

    # Select random positions to mutate
    mutation_positions = np.random.choice(
        len(seq_list),
        size=positions_to_mutate,
        replace=False
    )

    for pos in mutation_positions:
        seq_list[pos] = '_'

    # Generate variant
    variant_protein = ESMProtein(sequence=''.join(seq_list))

    config = GenerationConfig(
        track="sequence",
        num_steps=positions_to_mutate * 2,
        temperature=0.8  # Higher diversity
    )

    variant = model.generate(variant_protein, config)
    variants.append(variant.sequence)

    if (i + 1) % 10 == 0:
        print(f"Generated {i + 1}/{num_variants} variants")

print(f"\nGenerated {len(variants)} variants")

# Step 2: Predict structures for variants
print("\nPredicting structures...")

variant_proteins_with_structure = []
for i, seq in enumerate(variants):
    protein = ESMProtein(sequence=seq)

    config = GenerationConfig(
        track="structure",
        num_steps=len(seq) // 2
    )

    protein_with_structure = model.generate(protein, config)
    variant_proteins_with_structure.append(protein_with_structure)

    if (i + 1) % 10 == 0:
        print(f"Predicted structures for {i + 1}/{len(variants)} variants")

# Step 3: Analyze variant diversity
print("\nAnalyzing variant diversity...")

# Calculate Hamming distances from parent
def hamming_distance(seq1, seq2):
    """Calculate Hamming distance between sequences."""
    return sum(c1 != c2 for c1, c2 in zip(seq1, seq2))

distances = [hamming_distance(parent_sequence, var) for var in variants]
print(f"Average mutations per variant: {np.mean(distances):.1f}")
print(f"Mutation range: {min(distances)}-{max(distances)}")

# Step 4: Get embeddings for clustering
print("\nGenerating embeddings for clustering...")

from esm.models.esmc import ESMC

embedding_model = ESMC.from_pretrained("esmc-300m").to("cuda")

def get_embedding(sequence):
    """Get mean-pooled embedding for sequence."""
    protein = ESMProtein(sequence=sequence)
    tensor = embedding_model.encode(protein)
    emb = embedding_model.forward(tensor)
    return emb.mean(dim=1).cpu().detach().numpy().flatten()

variant_embeddings = np.array([get_embedding(seq) for seq in variants])

# Step 5: Cluster variants
print("Clustering variants...")

n_clusters = 5
kmeans = KMeans(n_clusters=n_clusters, random_state=42)
cluster_labels = kmeans.fit_predict(variant_embeddings)

# Analyze clusters
print("\nCluster analysis:")
for i in range(n_clusters):
    cluster_variants = [var for var, label in zip(variants, cluster_labels) if label == i]
    cluster_distances = [hamming_distance(parent_sequence, var) for var in cluster_variants]

    print(f"\nCluster {i}:")
    print(f"  Size: {len(cluster_variants)}")
    print(f"  Avg distance from parent: {np.mean(cluster_distances):.1f}")
    print(f"  Representative: {cluster_variants[0][:40]}...")

# Step 6: Select diverse representatives
print("\nSelecting diverse representatives...")

representatives = []
for i in range(n_clusters):
    # Get centroid
    cluster_indices = np.where(cluster_labels == i)[0]
    cluster_embs = variant_embeddings[cluster_indices]

    # Find closest to centroid
    centroid = cluster_embs.mean(axis=0)
    distances_to_centroid = np.linalg.norm(cluster_embs - centroid, axis=1)
    rep_idx = cluster_indices[np.argmin(distances_to_centroid)]

    representatives.append(variants[rep_idx])

# Save results
print("\nSaving results...")

with open("variant_library.fasta", "w") as f:
    f.write(f">Parent\n{parent_sequence}\n\n")
    for i, var in enumerate(variants):
        f.write(f">Variant_{i+1}_Cluster_{cluster_labels[i]}\n{var}\n")

with open("representative_variants.fasta", "w") as f:
    for i, rep in enumerate(representatives):
        f.write(f">Representative_Cluster_{i}\n{rep}\n")

print("Variant library saved to: variant_library.fasta")
print("Representatives saved to: representative_variants.fasta")
```

## Workflow 3: Structure-Based Sequence Optimization

Optimize a protein sequence to improve stability while maintaining function.

### Objective

Given a protein structure, design sequences that maintain the fold but have improved properties.

### Complete Implementation

```python
from esm.models.esm3 import ESM3
from esm.sdk.api import ESMProtein, GenerationConfig
import numpy as np

# Setup
model = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda")

# Load target structure (e.g., from PDB)
target_protein = ESMProtein.from_pdb("target_structure.pdb")
original_sequence = target_protein.sequence

print(f"Original sequence: {original_sequence}")
print(f"Structure loaded: {target_protein.coordinates.shape}")

# Step 1: Generate multiple sequence designs
print("\nGenerating optimized sequences...")

num_designs = 20
optimized_sequences = []

for i in range(num_designs):
    # Start with structure, remove sequence
    design_protein = ESMProtein(
        coordinates=target_protein.coordinates.copy(),
        secondary_structure=target_protein.secondary_structure
    )

    # Generate sequence for this structure
    config = GenerationConfig(
        track="sequence",
        num_steps=len(original_sequence),
        temperature=0.7,
        condition_on_coordinates_only=True
    )

    designed = model.generate(design_protein, config)
    optimized_sequences.append(designed.sequence)

    if (i + 1) % 5 == 0:
        print(f"Generated {i + 1}/{num_designs} designs")

# Step 2: Validate structural compatibility
print("\nValidating structural compatibility...")

validated_designs = []

for seq in optimized_sequences:
    # Predict structure for designed sequence
    test_protein = ESMProtein(sequence=seq)

    config = GenerationConfig(
        track="structure",
        num_steps=len(seq) // 2
    )

    predicted = model.generate(test_protein, config)

    # Calculate RMSD (simplified - in practice use proper alignment)
    # Here we just check if structure prediction succeeds
    if predicted.coordinates is not None:
        validated_designs.append(seq)

print(f"Validated {len(validated_designs)}/{num_designs} designs")

# Step 3: Analyze sequence properties
print("\nAnalyzing sequence properties...")

def calculate_properties(sequence):
    """Calculate basic sequence properties."""
    # Hydrophobicity (simplified)
    hydrophobic = "AILMFWYV"
    hydrophobic_fraction = sum(1 for aa in sequence if aa in hydrophobic) / len(sequence)

    # Charge
    positive = "KR"
    negative = "DE"
    net_charge = sum(1 for aa in sequence if aa in positive) - sum(1 for aa in sequence if aa in negative)

    # Aromatic content
    aromatic = "FWY"
    aromatic_fraction = sum(1 for aa in sequence if aa in aromatic) / len(sequence)

    return {
        'hydrophobic_fraction': hydrophobic_fraction,
        'net_charge': net_charge,
        'aromatic_fraction': aromatic_fraction
    }

# Compare to original
original_props = calculate_properties(original_sequence)
print(f"\nOriginal properties:")
print(f"  Hydrophobic: {original_props['hydrophobic_fraction']:.2%}")
print(f"  Net charge: {original_props['net_charge']:+d}")
print(f"  Aromatic: {original_props['aromatic_fraction']:.2%}")

# Analyze designs
design_properties = [calculate_properties(seq) for seq in validated_designs]

avg_hydrophobic = np.mean([p['hydrophobic_fraction'] for p in design_properties])
avg_charge = np.mean([p['net_charge'] for p in design_properties])
avg_aromatic = np.mean([p['aromatic_fraction'] for p in design_properties])

print(f"\nDesigned sequences (average):")
print(f"  Hydrophobic: {avg_hydrophobic:.2%}")
print(f"  Net charge: {avg_charge:+.1f}")
print(f"  Aromatic: {avg_aromatic:.2%}")

# Step 4: Rank designs
print("\nRanking designs...")

def score_design(sequence, original_props):
    """Score design based on desired properties."""
    props = calculate_properties(sequence)

    # Prefer higher hydrophobic content (for stability)
    hydrophobic_score = props['hydrophobic_fraction']

    # Prefer similar charge to original
    charge_score = 1.0 / (1.0 + abs(props['net_charge'] - original_props['net_charge']))

    # Combined score
    return hydrophobic_score * 0.6 + charge_score * 0.4

scores = [(seq, score_design(seq, original_props)) for seq in validated_designs]
scores.sort(key=lambda x: x[1], reverse=True)

print("\nTop 5 designs:")
for i, (seq, score) in enumerate(scores[:5]):
    print(f"\n{i+1}. Score: {score:.3f}")
    print(f"   Sequence: {seq[:40]}...")

# Step 5: Save results
print("\nSaving results...")

with open("optimized_sequences.fasta", "w") as f:
    f.write(f">Original\n{original_sequence}\n\n")

    for i, (seq, score) in enumerate(scores):
        props = calculate_properties(seq)
        f.write(f">Design_{i+1}_Score_{score:.3f}\n")
        f.write(f"# Hydrophobic: {props['hydrophobic_fraction']:.2%}, ")
        f.write(f"Charge: {props['net_charge']:+d}, ")
        f.write(f"Aromatic: {props['aromatic_fraction']:.2%}\n")
        f.write(f"{seq}\n\n")

print("Results saved to: optimized_sequences.fasta")
```

## Workflow 4: Function Prediction Pipeline

Predict protein function from sequence using ESM3 and ESM C.

### Objective

Build a pipeline that predicts protein function using both generative (ESM3) and embedding (ESM C) approaches.

### Complete Implementation

```python
from esm.models.esm3 import ESM3
from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein, GenerationConfig
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

# Setup models
esm3_model = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda")
esmc_model = ESMC.from_pretrained("esmc-600m").to("cuda")

# Example: Predict if protein is an enzyme
# (In practice, you'd have a labeled training set)

def predict_function_generative(sequence):
    """Predict function using ESM3 generative approach."""

    protein = ESMProtein(sequence=sequence)

    # Generate function annotations
    config = GenerationConfig(
        track="function",
        num_steps=20,
        temperature=0.3  # Low temperature for confident predictions
    )

    protein_with_function = esm3_model.generate(protein, config)

    return protein_with_function.function_annotations

def predict_function_embedding(sequence, function_classifier):
    """Predict function using ESM C embeddings + classifier."""

    # Get embedding
    protein = ESMProtein(sequence=sequence)
    tensor = esmc_model.encode(protein)
    embedding = esmc_model.forward(tensor)

    # Mean pool
    embedding_pooled = embedding.mean(dim=1).cpu().detach().numpy()

    # Predict with classifier
    prediction = function_classifier.predict(embedding_pooled)
    probability = function_classifier.predict_proba(embedding_pooled)

    return prediction[0], probability[0]

# Example workflow with test sequences
test_sequences = {
    "kinase": "MPRTKEINDAGLIVHSPQWFYKARNDTESLGKIVHEF",
    "protease": "AGLIVHSPQWFYKARNDTESLGKIVHEFPMCDEGH",
    "transporter": "KTEFLNDGRPMLIVHSPQWFYKARNDTESLGKIVH"
}

print("Predicting functions...\n")

for name, sequence in test_sequences.items():
    print(f"{name.upper()}:")
    print(f"Sequence: {sequence[:30]}...")

    # Method 1: Generative
    functions = predict_function_generative(sequence)
    print(f"  Generative predictions: {functions}")

    # Method 2: Embedding-based would require trained classifier
    # (Skipped in this example as it needs training data)

    print()
```

## Workflow 5: Embedding-Based Clustering and Analysis

Cluster and analyze a large protein dataset using ESM C embeddings.

### Complete Implementation

```python
from esm.models.esmc import ESMC
from esm.sdk.api import ESMProtein
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Setup
model = ESMC.from_pretrained("esmc-600m").to("cuda")

# Load protein dataset (example)
sequences = [
    # In practice, load from FASTA or database
    "MPRTKEINDAGLIVHSPQWFYK",
    "AGLIVHSPQWFYKARNDTESL",
    # ... more sequences
]

print(f"Loaded {len(sequences)} sequences")

# Step 1: Generate embeddings
print("Generating embeddings...")

embeddings = []
for i, seq in enumerate(sequences):
    protein = ESMProtein(sequence=seq)
    tensor = model.encode(protein)
    emb = model.forward(tensor)

    # Mean pooling
    emb_pooled = emb.mean(dim=1).cpu().detach().numpy().flatten()
    embeddings.append(emb_pooled)

    if (i + 1) % 100 == 0:
        print(f"Processed {i + 1}/{len(sequences)}")

embeddings = np.array(embeddings)
print(f"Embeddings shape: {embeddings.shape}")

# Step 2: Dimensionality reduction for visualization
print("\nReducing dimensionality...")

# PCA for initial reduction
pca = PCA(n_components=50)
embeddings_pca = pca.fit_transform(embeddings)
print(f"PCA explained variance: {pca.explained_variance_ratio_[:10].sum():.2%}")

# t-SNE for visualization
tsne = TSNE(n_components=2, random_state=42)
embeddings_2d = tsne.fit_transform(embeddings_pca)

# Step 3: Clustering
print("\nClustering...")

# DBSCAN for density-based clustering
clustering = DBSCAN(eps=0.5, min_samples=5)
cluster_labels = clustering.fit_predict(embeddings)

n_clusters = len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)
n_noise = list(cluster_labels).count(-1)

print(f"Number of clusters: {n_clusters}")
print(f"Number of noise points: {n_noise}")

# Step 4: Visualize
print("\nGenerating visualization...")

plt.figure(figsize=(12, 8))
scatter = plt.scatter(
    embeddings_2d[:, 0],
    embeddings_2d[:, 1],
    c=cluster_labels,
    cmap='viridis',
    alpha=0.6
)
plt.colorbar(scatter)
plt.title("Protein Sequence Clustering (ESM C Embeddings)")
plt.xlabel("t-SNE 1")
plt.ylabel("t-SNE 2")
plt.savefig("protein_clusters.png", dpi=300, bbox_inches='tight')
print("Visualization saved to: protein_clusters.png")

# Step 5: Analyze clusters
print("\nCluster analysis:")

for cluster_id in range(n_clusters):
    cluster_indices = np.where(cluster_labels == cluster_id)[0]
    cluster_seqs = [sequences[i] for i in cluster_indices]

    print(f"\nCluster {cluster_id}:")
    print(f"  Size: {len(cluster_seqs)}")
    print(f"  Avg length: {np.mean([len(s) for s in cluster_seqs]):.1f}")
    print(f"  Example: {cluster_seqs[0][:40]}...")

# Save cluster assignments
with open("cluster_assignments.txt", "w") as f:
    for i, (seq, label) in enumerate(zip(sequences, cluster_labels)):
        f.write(f"Sequence_{i}\tCluster_{label}\t{seq}\n")

print("\nCluster assignments saved to: cluster_assignments.txt")
```

## Additional Workflow Tips

### Memory Management for Large Datasets

```python
def process_large_dataset(sequences, batch_size=32):
    """Process large dataset with memory management."""
    import gc
    import torch

    results = []

    for i in range(0, len(sequences), batch_size):
        batch = sequences[i:i + batch_size]

        # Process batch
        batch_results = [process_sequence(seq) for seq in batch]
        results.extend(batch_results)

        # Clear memory
        torch.cuda.empty_cache()
        gc.collect()

        if (i + batch_size) % 100 == 0:
            print(f"Processed {min(i + batch_size, len(sequences))}/{len(sequences)}")

    return results
```

### Parallel Processing

```python
from concurrent.futures import ThreadPoolExecutor
import asyncio

def parallel_workflow(sequences, n_workers=4):
    """Process sequences in parallel."""

    with ThreadPoolExecutor(max_workers=n_workers) as executor:
        results = list(executor.map(process_sequence, sequences))

    return results
```

These workflows provide comprehensive examples for common ESM use cases. Adapt them to your specific needs and always validate results with appropriate biological experiments.
