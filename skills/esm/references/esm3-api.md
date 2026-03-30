# ESM3 API Reference

## Overview

ESM3 is a frontier multimodal generative language model that reasons over the sequence, structure, and function of proteins. It uses iterative masked language modeling to simultaneously generate across these three modalities.

## Model Architecture

**ESM3 Family Models:**

| Model ID | Parameters | Availability | Best For |
|----------|-----------|--------------|----------|
| `esm3-sm-open-v1` | 1.4B | Open weights (local) | Development, testing, learning |
| `esm3-medium-2024-08` | 7B | Forge API only | Production, balanced quality/speed |
| `esm3-large-2024-03` | 98B | Forge API only | Maximum quality, research |
| `esm3-medium-multimer-2024-09` | 7B | Forge API only | Protein complexes (experimental) |

**Key Features:**
- Simultaneous reasoning across sequence, structure, and function
- Iterative generation with controllable number of steps
- Support for partial prompting across modalities
- Chain-of-thought generation for complex designs
- Temperature control for generation diversity

## Core API Components

### ESMProtein Class

The central data structure representing a protein with optional sequence, structure, and function information.

**Constructor:**

```python
from esm.sdk.api import ESMProtein

protein = ESMProtein(
    sequence="MPRTKEINDAGLIVHSP",           # Amino acid sequence (optional)
    coordinates=coordinates_array,          # 3D structure (optional)
    function_annotations=[...],             # Function labels (optional)
    secondary_structure="HHHEEEECCC",       # SS annotations (optional)
    sasa=sasa_array                        # Solvent accessibility (optional)
)
```

**Key Methods:**

```python
# Load from PDB file
protein = ESMProtein.from_pdb("protein.pdb")

# Export to PDB format
pdb_string = protein.to_pdb()

# Save to file
with open("output.pdb", "w") as f:
    f.write(protein.to_pdb())
```

**Masking Conventions:**

Use `_` (underscore) to represent masked positions for generation:

```python
# Mask positions 5-10 for generation
protein = ESMProtein(sequence="MPRT______AGLIVHSP")

# Fully masked sequence (generate from scratch)
protein = ESMProtein(sequence="_" * 200)

# Partial structure (some coordinates None)
protein = ESMProtein(
    sequence="MPRTKEIND",
    coordinates=partial_coords  # Some positions can be None
)
```

### GenerationConfig Class

Controls generation behavior and parameters.

**Basic Configuration:**

```python
from esm.sdk.api import GenerationConfig

config = GenerationConfig(
    track="sequence",              # Track to generate: "sequence", "structure", or "function"
    num_steps=8,                  # Number of demasking steps
    temperature=0.7,              # Sampling temperature (0.0-1.0)
    top_p=None,                   # Nucleus sampling threshold
    condition_on_coordinates_only=False  # For structure conditioning
)
```

**Parameter Details:**

- **track**: Which modality to generate
  - `"sequence"`: Generate amino acid sequence
  - `"structure"`: Generate 3D coordinates
  - `"function"`: Generate function annotations

- **num_steps**: Number of iterative demasking steps
  - Higher = slower but potentially better quality
  - Typical range: 8-100 depending on sequence length
  - For full sequence generation: approximately sequence_length / 2

- **temperature**: Controls randomness
  - 0.0: Fully deterministic (greedy decoding)
  - 0.5-0.7: Balanced exploration
  - 1.0: Maximum diversity
  - Higher values increase novelty but may reduce quality

- **top_p**: Nucleus sampling parameter
  - Limits sampling to top probability mass
  - Values: 0.0-1.0 (e.g., 0.9 = sample from top 90% probability mass)
  - Use for controlled diversity without extreme sampling

- **condition_on_coordinates_only**: Structure conditioning mode
  - `True`: Condition only on backbone coordinates (ignore sequence)
  - Useful for inverse folding tasks

### ESM3InferenceClient Interface

The unified interface for both local and remote inference.

**Local Model Loading:**

```python
from esm.models.esm3 import ESM3

# Load with automatic device placement
model = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda")

# Or explicitly specify device
model = ESM3.from_pretrained("esm3-sm-open-v1").to("cpu")
```

**Generation Method:**

```python
# Basic generation
protein_output = model.generate(protein_input, config)

# With explicit track specification
protein_output = model.generate(
    protein_input,
    GenerationConfig(track="sequence", num_steps=16, temperature=0.6)
)
```

**Forward Pass (Advanced):**

```python
# Get raw model logits for custom sampling
protein_tensor = model.encode(protein)
output = model.forward(protein_tensor)
logits = model.decode(output)
```

## Common Usage Patterns

### 1. Sequence Completion

Fill in masked regions of a protein sequence:

```python
# Define partial sequence
protein = ESMProtein(sequence="MPRTK____LIVHSP____END")

# Generate missing positions
config = GenerationConfig(track="sequence", num_steps=12, temperature=0.5)
completed = model.generate(protein, config)

print(f"Original:  {protein.sequence}")
print(f"Completed: {completed.sequence}")
```

### 2. Structure Prediction

Predict 3D structure from sequence:

```python
# Input: sequence only
protein = ESMProtein(sequence="MPRTKEINDAGLIVHSPQWFYK")

# Generate structure
config = GenerationConfig(track="structure", num_steps=len(protein.sequence))
protein_with_structure = model.generate(protein, config)

# Save as PDB
with open("predicted_structure.pdb", "w") as f:
    f.write(protein_with_structure.to_pdb())
```

### 3. Inverse Folding

Design sequence for a target structure:

```python
# Load target structure
target = ESMProtein.from_pdb("target.pdb")

# Remove sequence, keep structure
target.sequence = None

# Generate sequence that folds to this structure
config = GenerationConfig(
    track="sequence",
    num_steps=50,
    temperature=0.7,
    condition_on_coordinates_only=True
)
designed = model.generate(target, config)

print(f"Designed sequence: {designed.sequence}")
```

### 4. Function-Conditioned Generation

Generate protein with specific function:

```python
from esm.sdk.api import FunctionAnnotation

# Specify desired function
protein = ESMProtein(
    sequence="_" * 150,
    function_annotations=[
        FunctionAnnotation(
            label="enzymatic_activity",
            start=30,
            end=90
        )
    ]
)

# Generate sequence with this function
config = GenerationConfig(track="sequence", num_steps=75, temperature=0.6)
functional_protein = model.generate(protein, config)
```

### 5. Multi-Track Generation (Chain-of-Thought)

Iteratively generate across multiple tracks:

```python
# Start with partial sequence
protein = ESMProtein(sequence="MPRT" + "_" * 100)

# Step 1: Complete sequence
protein = model.generate(
    protein,
    GenerationConfig(track="sequence", num_steps=50, temperature=0.6)
)

# Step 2: Predict structure for completed sequence
protein = model.generate(
    protein,
    GenerationConfig(track="structure", num_steps=50)
)

# Step 3: Predict function
protein = model.generate(
    protein,
    GenerationConfig(track="function", num_steps=20)
)

print(f"Final sequence: {protein.sequence}")
print(f"Functions: {protein.function_annotations}")
```

### 6. Variant Generation

Generate multiple variants of a protein:

```python
import numpy as np

base_sequence = "MPRTKEINDAGLIVHSPQWFYK"
variants = []

for i in range(10):
    # Mask random positions
    seq_list = list(base_sequence)
    mask_indices = np.random.choice(len(seq_list), size=5, replace=False)
    for idx in mask_indices:
        seq_list[idx] = '_'

    protein = ESMProtein(sequence=''.join(seq_list))

    # Generate variant
    variant = model.generate(
        protein,
        GenerationConfig(track="sequence", num_steps=8, temperature=0.8)
    )
    variants.append(variant.sequence)

print(f"Generated {len(variants)} variants")
```

## Advanced Topics

### Temperature Scheduling

Vary temperature during generation for better control:

```python
def generate_with_temperature_schedule(model, protein, temperatures):
    """Generate with decreasing temperature for annealing."""
    current = protein
    steps_per_temp = 10

    for temp in temperatures:
        config = GenerationConfig(
            track="sequence",
            num_steps=steps_per_temp,
            temperature=temp
        )
        current = model.generate(current, config)

    return current

# Example: Start diverse, end deterministic
result = generate_with_temperature_schedule(
    model,
    protein,
    temperatures=[1.0, 0.8, 0.6, 0.4, 0.2]
)
```

### Constrained Generation

Preserve specific regions during generation:

```python
# Keep active site residues fixed
def mask_except_active_site(sequence, active_site_positions):
    """Mask everything except specified positions."""
    seq_list = ['_'] * len(sequence)
    for pos in active_site_positions:
        seq_list[pos] = sequence[pos]
    return ''.join(seq_list)

# Define active site
active_site = [23, 24, 25, 45, 46, 89]
constrained_seq = mask_except_active_site(original_sequence, active_site)

protein = ESMProtein(sequence=constrained_seq)
result = model.generate(protein, GenerationConfig(track="sequence", num_steps=50))
```

### Secondary Structure Conditioning

Use secondary structure information in generation:

```python
# Define secondary structure (H=helix, E=sheet, C=coil)
protein = ESMProtein(
    sequence="_" * 80,
    secondary_structure="CCHHHHHHHEEEEECCCHHHHHHCC" + "C" * 55
)

# Generate sequence with this structure
result = model.generate(
    protein,
    GenerationConfig(track="sequence", num_steps=40, temperature=0.6)
)
```

## Performance Optimization

### Memory Management

For large proteins or batch processing:

```python
import torch

# Clear CUDA cache between generations
torch.cuda.empty_cache()

# Use half precision for memory efficiency
model = ESM3.from_pretrained("esm3-sm-open-v1").to("cuda").half()

# Process in chunks for very long sequences
def chunk_generate(model, long_sequence, chunk_size=500):
    chunks = [long_sequence[i:i+chunk_size]
              for i in range(0, len(long_sequence), chunk_size)]
    results = []

    for chunk in chunks:
        protein = ESMProtein(sequence=chunk)
        result = model.generate(protein, GenerationConfig(track="sequence"))
        results.append(result.sequence)

    return ''.join(results)
```

### Batch Processing Tips

When processing multiple proteins:

1. Sort by sequence length for efficient batching
2. Use padding for similar-length sequences
3. Process on GPU when available
4. Implement checkpointing for long-running jobs
5. Use Forge API for large-scale processing (see `forge-api.md`)

## Error Handling

```python
try:
    protein = model.generate(protein_input, config)
except ValueError as e:
    print(f"Invalid input: {e}")
    # Handle invalid sequence or structure
except RuntimeError as e:
    print(f"Generation failed: {e}")
    # Handle model errors
except torch.cuda.OutOfMemoryError:
    print("GPU out of memory - try smaller model or CPU")
    # Fallback to CPU or smaller model
```

## Model-Specific Considerations

**esm3-sm-open-v1:**
- Suitable for development and testing
- Lower quality than larger models
- Fast inference on consumer GPUs
- Open weights allow fine-tuning

**esm3-medium-2024-08:**
- Production quality
- Good balance of speed and accuracy
- Requires Forge API access
- Recommended for most applications

**esm3-large-2024-03:**
- State-of-the-art quality
- Slowest inference
- Use for critical applications
- Best for novel protein design

## Citation

If using ESM3 in research, cite:

```
Hayes, T. et al. (2025). Simulating 500 million years of evolution with a language model.
Science. DOI: 10.1126/science.ads0018
```
