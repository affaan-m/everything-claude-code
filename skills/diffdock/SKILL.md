---
name: diffdock
description: Diffusion-based molecular docking. Predict protein-ligand binding poses from PDB/SMILES, confidence scores, virtual screening, for structure-based drug design. Not for affinity prediction.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# DiffDock: Molecular Docking with Diffusion Models

## Overview

DiffDock is a diffusion-based deep learning tool for molecular docking that predicts 3D binding poses of small molecule ligands to protein targets. It represents the state-of-the-art in computational docking, crucial for structure-based drug discovery and chemical biology.

**Core Capabilities:**
- Predict ligand binding poses with high accuracy using deep learning
- Support protein structures (PDB files) or sequences (via ESMFold)
- Process single complexes or batch virtual screening campaigns
- Generate confidence scores to assess prediction reliability
- Handle diverse ligand inputs (SMILES, SDF, MOL2)

**Key Distinction:** DiffDock predicts **binding poses** (3D structure) and **confidence** (prediction certainty), NOT binding affinity (ΔG, Kd). Always combine with scoring functions (GNINA, MM/GBSA) for affinity assessment.

## When to Use This Skill

This skill should be used when:

- "Dock this ligand to a protein" or "predict binding pose"
- "Run molecular docking" or "perform protein-ligand docking"
- "Virtual screening" or "screen compound library"
- "Where does this molecule bind?" or "predict binding site"
- Structure-based drug design or lead optimization tasks
- Tasks involving PDB files + SMILES strings or ligand structures
- Batch docking of multiple protein-ligand pairs

## Installation and Environment Setup

### Check Environment Status

Before proceeding with DiffDock tasks, verify the environment setup:

```bash
# Use the provided setup checker
python scripts/setup_check.py
```

This script validates Python version, PyTorch with CUDA, PyTorch Geometric, RDKit, ESM, and other dependencies.

### Installation Options

**Option 1: Conda (Recommended)**
```bash
git clone https://github.com/gcorso/DiffDock.git
cd DiffDock
conda env create --file environment.yml
conda activate diffdock
```

**Option 2: Docker**
```bash
docker pull rbgcsail/diffdock
docker run -it --gpus all --entrypoint /bin/bash rbgcsail/diffdock
micromamba activate diffdock
```

**Important Notes:**
- GPU strongly recommended (10-100x speedup vs CPU)
- First run pre-computes SO(2)/SO(3) lookup tables (~2-5 minutes)
- Model checkpoints (~500MB) download automatically if not present

## Core Workflows

### Workflow 1: Single Protein-Ligand Docking

**Use Case:** Dock one ligand to one protein target

**Input Requirements:**
- Protein: PDB file OR amino acid sequence
- Ligand: SMILES string OR structure file (SDF/MOL2)

**Command:**
```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_path protein.pdb \
  --ligand "CC(=O)Oc1ccccc1C(=O)O" \
  --out_dir results/single_docking/
```

**Alternative (protein sequence):**
```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_sequence "MSKGEELFTGVVPILVELDGDVNGHKF..." \
  --ligand ligand.sdf \
  --out_dir results/sequence_docking/
```

**Output Structure:**
```
results/single_docking/
├── rank_1.sdf          # Top-ranked pose
├── rank_2.sdf          # Second-ranked pose
├── ...
├── rank_10.sdf         # 10th pose (default: 10 samples)
└── confidence_scores.txt
```

### Workflow 2: Batch Processing Multiple Complexes

**Use Case:** Dock multiple ligands to proteins, virtual screening campaigns

**Step 1: Prepare Batch CSV**

Use the provided script to create or validate batch input:

```bash
# Create template
python scripts/prepare_batch_csv.py --create --output batch_input.csv

# Validate existing CSV
python scripts/prepare_batch_csv.py my_input.csv --validate
```

**CSV Format:**
```csv
complex_name,protein_path,ligand_description,protein_sequence
complex1,protein1.pdb,CC(=O)Oc1ccccc1C(=O)O,
complex2,,COc1ccc(C#N)cc1,MSKGEELFT...
complex3,protein3.pdb,ligand3.sdf,
```

**Required Columns:**
- `complex_name`: Unique identifier
- `protein_path`: PDB file path (leave empty if using sequence)
- `ligand_description`: SMILES string or ligand file path
- `protein_sequence`: Amino acid sequence (leave empty if using PDB)

**Step 2: Run Batch Docking**

```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv batch_input.csv \
  --out_dir results/batch/ \
  --batch_size 10
```

**For Large Virtual Screening (>100 compounds):**

Pre-compute protein embeddings for faster processing:
```bash
# Pre-compute embeddings
python datasets/esm_embedding_preparation.py \
  --protein_ligand_csv screening_input.csv \
  --out_file protein_embeddings.pt

# Run with pre-computed embeddings
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv screening_input.csv \
  --esm_embeddings_path protein_embeddings.pt \
  --out_dir results/screening/
```

### Workflow 3: Analyzing Results

After docking completes, analyze confidence scores and rank predictions:

```bash
# Analyze all results
python scripts/analyze_results.py results/batch/

# Show top 5 per complex
python scripts/analyze_results.py results/batch/ --top 5

# Filter by confidence threshold
python scripts/analyze_results.py results/batch/ --threshold 0.0

# Export to CSV
python scripts/analyze_results.py results/batch/ --export summary.csv

# Show top 20 predictions across all complexes
python scripts/analyze_results.py results/batch/ --best 20
```

The analysis script:
- Parses confidence scores from all predictions
- Classifies as High (>0), Moderate (-1.5 to 0), or Low (<-1.5)
- Ranks predictions within and across complexes
- Generates statistical summaries
- Exports results to CSV for downstream analysis

## Confidence Score Interpretation

**Understanding Scores:**

| Score Range | Confidence Level | Interpretation |
|------------|------------------|----------------|
| **> 0** | High | Strong prediction, likely accurate |
| **-1.5 to 0** | Moderate | Reasonable prediction, validate carefully |
| **< -1.5** | Low | Uncertain prediction, requires validation |

**Critical Notes:**
1. **Confidence ≠ Affinity**: High confidence means model certainty about structure, NOT strong binding
2. **Context Matters**: Adjust expectations for:
   - Large ligands (>500 Da): Lower confidence expected
   - Multiple protein chains: May decrease confidence
   - Novel protein families: May underperform
3. **Multiple Samples**: Review top 3-5 predictions, look for consensus

**For detailed guidance:** Read `references/confidence_and_limitations.md` using the Read tool

## Parameter Customization

### Using Custom Configuration

Create custom configuration for specific use cases:

```bash
# Copy template
cp assets/custom_inference_config.yaml my_config.yaml

# Edit parameters (see template for presets)
# Then run with custom config
python -m inference \
  --config my_config.yaml \
  --protein_ligand_csv input.csv \
  --out_dir results/
```

### Key Parameters to Adjust

**Sampling Density:**
- `samples_per_complex: 10` → Increase to 20-40 for difficult cases
- More samples = better coverage but longer runtime

**Inference Steps:**
- `inference_steps: 20` → Increase to 25-30 for higher accuracy
- More steps = potentially better quality but slower

**Temperature Parameters (control diversity):**
- `temp_sampling_tor: 7.04` → Increase for flexible ligands (8-10)
- `temp_sampling_tor: 7.04` → Decrease for rigid ligands (5-6)
- Higher temperature = more diverse poses

**Presets Available in Template:**
1. High Accuracy: More samples + steps, lower temperature
2. Fast Screening: Fewer samples, faster
3. Flexible Ligands: Increased torsion temperature
4. Rigid Ligands: Decreased torsion temperature

**For complete parameter reference:** Read `references/parameters_reference.md` using the Read tool

## Advanced Techniques

### Ensemble Docking (Protein Flexibility)

For proteins with known flexibility, dock to multiple conformations:

```python
# Create ensemble CSV
import pandas as pd

conformations = ["conf1.pdb", "conf2.pdb", "conf3.pdb"]
ligand = "CC(=O)Oc1ccccc1C(=O)O"

data = {
    "complex_name": [f"ensemble_{i}" for i in range(len(conformations))],
    "protein_path": conformations,
    "ligand_description": [ligand] * len(conformations),
    "protein_sequence": [""] * len(conformations)
}

pd.DataFrame(data).to_csv("ensemble_input.csv", index=False)
```

Run docking with increased sampling:
```bash
python -m inference \
  --config default_inference_args.yaml \
  --protein_ligand_csv ensemble_input.csv \
  --samples_per_complex 20 \
  --out_dir results/ensemble/
```

### Integration with Scoring Functions

DiffDock generates poses; combine with other tools for affinity:

**GNINA (Fast neural network scoring):**
```bash
for pose in results/*.sdf; do
    gnina -r protein.pdb -l "$pose" --score_only
done
```

**MM/GBSA (More accurate, slower):**
Use AmberTools MMPBSA.py or gmx_MMPBSA after energy minimization

**Free Energy Calculations (Most accurate):**
Use OpenMM + OpenFE or GROMACS for FEP/TI calculations

**Recommended Workflow:**
1. DiffDock → Generate poses with confidence scores
2. Visual inspection → Check structural plausibility
3. GNINA or MM/GBSA → Rescore and rank by affinity
4. Experimental validation → Biochemical assays

## Limitations and Scope

**DiffDock IS Designed For:**
- Small molecule ligands (typically 100-1000 Da)
- Drug-like organic compounds
- Small peptides (<20 residues)
- Single or multi-chain proteins

**DiffDock IS NOT Designed For:**
- Large biomolecules (protein-protein docking) → Use DiffDock-PP or AlphaFold-Multimer
- Large peptides (>20 residues) → Use alternative methods
- Covalent docking → Use specialized covalent docking tools
- Binding affinity prediction → Combine with scoring functions
- Membrane proteins → Not specifically trained, use with caution

**For complete limitations:** Read `references/confidence_and_limitations.md` using the Read tool

## Troubleshooting

### Common Issues

**Issue: Low confidence scores across all predictions**
- Cause: Large/unusual ligands, unclear binding site, protein flexibility
- Solution: Increase `samples_per_complex` (20-40), try ensemble docking, validate protein structure

**Issue: Out of memory errors**
- Cause: GPU memory insufficient for batch size
- Solution: Reduce `--batch_size 2` or process fewer complexes at once

**Issue: Slow performance**
- Cause: Running on CPU instead of GPU
- Solution: Verify CUDA with `python -c "import torch; print(torch.cuda.is_available())"`, use GPU

**Issue: Unrealistic binding poses**
- Cause: Poor protein preparation, ligand too large, wrong binding site
- Solution: Check protein for missing residues, remove far waters, consider specifying binding site

**Issue: "Module not found" errors**
- Cause: Missing dependencies or wrong environment
- Solution: Run `python scripts/setup_check.py` to diagnose

### Performance Optimization

**For Best Results:**
1. Use GPU (essential for practical use)
2. Pre-compute ESM embeddings for repeated protein use
3. Batch process multiple complexes together
4. Start with default parameters, then tune if needed
5. Validate protein structures (resolve missing residues)
6. Use canonical SMILES for ligands

## Graphical User Interface

For interactive use, launch the web interface:

```bash
python app/main.py
# Navigate to http://localhost:7860
```

Or use the online demo without installation:
- https://huggingface.co/spaces/reginabarzilaygroup/DiffDock-Web

## Resources

### Helper Scripts (`scripts/`)

**`prepare_batch_csv.py`**: Create and validate batch input CSV files
- Create templates with example entries
- Validate file paths and SMILES strings
- Check for required columns and format issues

**`analyze_results.py`**: Analyze confidence scores and rank predictions
- Parse results from single or batch runs
- Generate statistical summaries
- Export to CSV for downstream analysis
- Identify top predictions across complexes

**`setup_check.py`**: Verify DiffDock environment setup
- Check Python version and dependencies
- Verify PyTorch and CUDA availability
- Test RDKit and PyTorch Geometric installation
- Provide installation instructions if needed

### Reference Documentation (`references/`)

**`parameters_reference.md`**: Complete parameter documentation
- All command-line options and configuration parameters
- Default values and acceptable ranges
- Temperature parameters for controlling diversity
- Model checkpoint locations and version flags

Read this file when users need:
- Detailed parameter explanations
- Fine-tuning guidance for specific systems
- Alternative sampling strategies

**`confidence_and_limitations.md`**: Confidence score interpretation and tool limitations
- Detailed confidence score interpretation
- When to trust predictions
- Scope and limitations of DiffDock
- Integration with complementary tools
- Troubleshooting prediction quality

Read this file when users need:
- Help interpreting confidence scores
- Understanding when NOT to use DiffDock
- Guidance on combining with other tools
- Validation strategies

**`workflows_examples.md`**: Comprehensive workflow examples
- Detailed installation instructions
- Step-by-step examples for all workflows
- Advanced integration patterns
- Troubleshooting common issues
- Best practices and optimization tips

Read this file when users need:
- Complete workflow examples with code
- Integration with GNINA, OpenMM, or other tools
- Virtual screening workflows
- Ensemble docking procedures

### Assets (`assets/`)

**`batch_template.csv`**: Template for batch processing
- Pre-formatted CSV with required columns
- Example entries showing different input types
- Ready to customize with actual data

**`custom_inference_config.yaml`**: Configuration template
- Annotated YAML with all parameters
- Four preset configurations for common use cases
- Detailed comments explaining each parameter
- Ready to customize and use

## Best Practices

1. **Always verify environment** with `setup_check.py` before starting large jobs
2. **Validate batch CSVs** with `prepare_batch_csv.py` to catch errors early
3. **Start with defaults** then tune parameters based on system-specific needs
4. **Generate multiple samples** (10-40) for robust predictions
5. **Visual inspection** of top poses before downstream analysis
6. **Combine with scoring** functions for affinity assessment
7. **Use confidence scores** for initial ranking, not final decisions
8. **Pre-compute embeddings** for virtual screening campaigns
9. **Document parameters** used for reproducibility
10. **Validate results** experimentally when possible

## Citations

When using DiffDock, cite the appropriate papers:

**DiffDock-L (current default model):**
```
Stärk et al. (2024) "DiffDock-L: Improving Molecular Docking with Diffusion Models"
arXiv:2402.18396
```

**Original DiffDock:**
```
Corso et al. (2023) "DiffDock: Diffusion Steps, Twists, and Turns for Molecular Docking"
ICLR 2023, arXiv:2210.01776
```

## Additional Resources

- **GitHub Repository**: https://github.com/gcorso/DiffDock
- **Online Demo**: https://huggingface.co/spaces/reginabarzilaygroup/DiffDock-Web
- **DiffDock-L Paper**: https://arxiv.org/abs/2402.18396
- **Original Paper**: https://arxiv.org/abs/2210.01776

