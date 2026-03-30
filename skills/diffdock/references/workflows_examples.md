# DiffDock Workflows and Examples

This document provides practical workflows and usage examples for common DiffDock tasks.

## Installation and Setup

### Conda Installation (Recommended)

```bash
# Clone repository
git clone https://github.com/gcorso/DiffDock.git
cd DiffDock

# Create conda environment
conda env create --file environment.yml
conda activate diffdock
```

### Docker Installation

```bash
# Pull Docker image
docker pull rbgcsail/diffdock

# Run container with GPU support
docker run -it --gpus all --entrypoint /bin/bash rbgcsail/diffdock

# Inside container, activate environment
micromamba activate diffdock
```

### First Run
The first execution pre-computes SO(2) and SO(3) lookup tables, taking a few minutes. Subsequent runs start immediately.

## Workflow 1: Single Protein-Ligand Docking

### Using PDB File and SMILES String

```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_path examples/protein.pdb \
  --ligand "COc1ccc(C(=O)Nc2ccccc2)cc1" \
  --out_dir results/single_docking/
```

**Output Structure**:
```
results/single_docking/
├── index_0_rank_1.sdf       # Top-ranked prediction
├── index_0_rank_2.sdf       # Second-ranked prediction
├── ...
├── index_0_rank_10.sdf      # 10th prediction (if samples_per_complex=10)
└── confidence_scores.txt    # Scores for all predictions
```

### Using Ligand Structure File

```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_path protein.pdb \
  --ligand ligand.sdf \
  --out_dir results/ligand_file/
```

**Supported ligand formats**: SDF, MOL2, or any format readable by RDKit

## Workflow 2: Protein Sequence to Structure Docking

### Using ESMFold for Protein Folding

```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_sequence "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTFSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK" \
  --ligand "CC(C)Cc1ccc(cc1)C(C)C(=O)O" \
  --out_dir results/sequence_docking/
```

**Use Cases**:
- Protein structure not available in PDB
- Modeling mutations or variants
- De novo protein design validation

**Note**: ESMFold folding adds computation time (30s-5min depending on sequence length)

## Workflow 3: Batch Processing Multiple Complexes

### Prepare CSV File

Create `complexes.csv` with required columns:

```csv
complex_name,protein_path,ligand_description,protein_sequence
complex1,proteins/protein1.pdb,CC(=O)Oc1ccccc1C(=O)O,
complex2,,COc1ccc(C#N)cc1,MSKGEELFTGVVPILVELDGDVNGHKF...
complex3,proteins/protein3.pdb,ligands/ligand3.sdf,
```

**Column Descriptions**:
- `complex_name`: Unique identifier for the complex
- `protein_path`: Path to PDB file (leave empty if using sequence)
- `ligand_description`: SMILES string or path to ligand file
- `protein_sequence`: Amino acid sequence (leave empty if using PDB)

### Run Batch Docking

```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv complexes.csv \
  --out_dir results/batch_predictions/ \
  --batch_size 10
```

**Output Structure**:
```
results/batch_predictions/
├── complex1/
│   ├── rank_1.sdf
│   ├── rank_2.sdf
│   └── ...
├── complex2/
│   ├── rank_1.sdf
│   └── ...
└── complex3/
    └── ...
```

## Workflow 4: High-Throughput Virtual Screening

### Setup for Screening Large Ligand Libraries

```python
# generate_screening_csv.py
import pandas as pd

# Load ligand library
ligands = pd.read_csv("ligand_library.csv")  # Contains SMILES

# Create DiffDock input
screening_data = {
    "complex_name": [f"screen_{i}" for i in range(len(ligands))],
    "protein_path": ["target_protein.pdb"] * len(ligands),
    "ligand_description": ligands["smiles"].tolist(),
    "protein_sequence": [""] * len(ligands)
}

df = pd.DataFrame(screening_data)
df.to_csv("screening_input.csv", index=False)
```

### Run Screening

```bash
# Pre-compute ESM embeddings for faster screening
python datasets/esm_embedding_preparation.py \
  --protein_ligand_csv screening_input.csv \
  --out_file protein_embeddings.pt

# Run docking with pre-computed embeddings
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv screening_input.csv \
  --esm_embeddings_path protein_embeddings.pt \
  --out_dir results/virtual_screening/ \
  --batch_size 32
```

### Post-Processing: Extract Top Hits

```python
# analyze_screening_results.py
import os
import pandas as pd

results = []
results_dir = "results/virtual_screening/"

for complex_dir in os.listdir(results_dir):
    confidence_file = os.path.join(results_dir, complex_dir, "confidence_scores.txt")
    if os.path.exists(confidence_file):
        with open(confidence_file) as f:
            scores = [float(line.strip()) for line in f]
            top_score = max(scores)
            results.append({"complex": complex_dir, "top_confidence": top_score})

# Sort by confidence
df = pd.DataFrame(results)
df_sorted = df.sort_values("top_confidence", ascending=False)

# Get top 100 hits
top_hits = df_sorted.head(100)
top_hits.to_csv("top_hits.csv", index=False)
```

## Workflow 5: Ensemble Docking with Protein Flexibility

### Prepare Protein Ensemble

```python
# For proteins with known flexibility, use multiple conformations
# Example: Using MD snapshots or crystal structures

# create_ensemble_csv.py
import pandas as pd

conformations = [
    "protein_conf1.pdb",
    "protein_conf2.pdb",
    "protein_conf3.pdb",
    "protein_conf4.pdb"
]

ligand = "CC(C)Cc1ccc(cc1)C(C)C(=O)O"

data = {
    "complex_name": [f"ensemble_{i}" for i in range(len(conformations))],
    "protein_path": conformations,
    "ligand_description": [ligand] * len(conformations),
    "protein_sequence": [""] * len(conformations)
}

pd.DataFrame(data).to_csv("ensemble_input.csv", index=False)
```

### Run Ensemble Docking

```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv ensemble_input.csv \
  --out_dir results/ensemble_docking/ \
  --samples_per_complex 20  # More samples per conformation
```

## Workflow 6: Integration with Downstream Analysis

### Example: DiffDock + GNINA Rescoring

```bash
# 1. Run DiffDock
python -m inference \
  --config default_inference_args.yaml \
  --protein_path protein.pdb \
  --ligand "CC(=O)OC1=CC=CC=C1C(=O)O" \
  --out_dir results/diffdock_poses/ \
  --save_visualisation

# 2. Rescore with GNINA
for pose in results/diffdock_poses/*.sdf; do
    gnina -r protein.pdb -l "$pose" --score_only -o "${pose%.sdf}_gnina.sdf"
done
```

### Example: DiffDock + OpenMM Energy Minimization

```python
# minimize_poses.py
from openmm import app, LangevinIntegrator, Platform
from openmm.app import ForceField, Modeller, PDBFile
from rdkit import Chem
import os

# Load protein
protein = PDBFile('protein.pdb')
forcefield = ForceField('amber14-all.xml', 'amber14/tip3pfb.xml')

# Process each DiffDock pose
pose_dir = 'results/diffdock_poses/'
for pose_file in os.listdir(pose_dir):
    if pose_file.endswith('.sdf'):
        # Load ligand
        mol = Chem.SDMolSupplier(os.path.join(pose_dir, pose_file))[0]

        # Combine protein + ligand
        modeller = Modeller(protein.topology, protein.positions)
        # ... add ligand to modeller ...

        # Create system and minimize
        system = forcefield.createSystem(modeller.topology)
        integrator = LangevinIntegrator(300, 1.0, 0.002)
        simulation = app.Simulation(modeller.topology, system, integrator)
        simulation.minimizeEnergy(maxIterations=1000)

        # Save minimized structure
        positions = simulation.context.getState(getPositions=True).getPositions()
        PDBFile.writeFile(simulation.topology, positions,
                         open(f"minimized_{pose_file}.pdb", 'w'))
```

## Workflow 7: Using the Graphical Interface

### Launch Web Interface

```bash
python app/main.py
```

### Access Interface
Navigate to `http://localhost:7860` in web browser

### Features
- Upload protein PDB or enter sequence
- Input ligand SMILES or upload structure
- Adjust inference parameters via GUI
- Visualize results interactively
- Download predictions directly

### Online Alternative
Use the Hugging Face Spaces demo without local installation:
- URL: https://huggingface.co/spaces/reginabarzilaygroup/DiffDock-Web

## Advanced Configuration

### Custom Inference Settings

Create custom YAML configuration:

```yaml
# custom_inference.yaml
# Model settings
model_dir: ./workdir/v1.1/score_model
confidence_model_dir: ./workdir/v1.1/confidence_model

# Sampling parameters
samples_per_complex: 20  # More samples for better coverage
inference_steps: 25      # More steps for accuracy

# Temperature adjustments (increase for more diversity)
temp_sampling_tr: 1.3
temp_sampling_rot: 2.2
temp_sampling_tor: 7.5

# Output
save_visualisation: true
```

Use custom configuration:

```bash
python -m inference \
  --config custom_inference.yaml \
  --protein_path protein.pdb \
  --ligand "CC(=O)OC1=CC=CC=C1C(=O)O" \
  --out_dir results/custom_config/
```

## Troubleshooting Common Issues

### Issue: Out of Memory Errors

**Solution**: Reduce batch size
```bash
python -m inference ... --batch_size 2
```

### Issue: Slow Performance

**Solution**: Ensure GPU usage
```python
import torch
print(torch.cuda.is_available())  # Should return True
```

### Issue: Poor Predictions for Large Ligands

**Solution**: Increase sampling diversity
```bash
python -m inference ... --samples_per_complex 40 --temp_sampling_tor 9.0
```

### Issue: Protein with Many Chains

**Solution**: Limit chains or isolate binding site
```bash
python -m inference ... --chain_cutoff 4
```

Or pre-process PDB to include only relevant chains.

## Best Practices Summary

1. **Start Simple**: Test with single complex before batch processing
2. **GPU Essential**: Use GPU for reasonable performance
3. **Multiple Samples**: Generate 10-40 samples for robust predictions
4. **Validate Results**: Use molecular visualization and complementary scoring
5. **Consider Confidence**: Use confidence scores for initial ranking, not final decisions
6. **Iterate Parameters**: Adjust temperature/steps for specific systems
7. **Pre-compute Embeddings**: For repeated use of same protein
8. **Combine Tools**: Integrate with scoring functions and energy minimization
