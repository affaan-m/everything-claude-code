# DiffDock Confidence Scores and Limitations

This document provides detailed guidance on interpreting DiffDock confidence scores and understanding the tool's limitations.

## Confidence Score Interpretation

DiffDock generates a confidence score for each predicted binding pose. This score indicates the model's certainty about the prediction.

### Score Ranges

| Score Range | Confidence Level | Interpretation |
|------------|------------------|----------------|
| **> 0** | High confidence | Strong prediction, likely accurate binding pose |
| **-1.5 to 0** | Moderate confidence | Reasonable prediction, may need validation |
| **< -1.5** | Low confidence | Uncertain prediction, requires careful validation |

### Important Notes on Confidence Scores

1. **Not Binding Affinity**: Confidence scores reflect prediction certainty, NOT binding affinity strength
   - High confidence = model is confident about the structure
   - Does NOT indicate strong/weak binding affinity

2. **Context-Dependent**: Confidence scores should be adjusted based on system complexity:
   - **Lower expectations** for:
     - Large ligands (>500 Da)
     - Protein complexes with many chains
     - Unbound protein conformations (may require conformational changes)
     - Novel protein families not well-represented in training data

   - **Higher expectations** for:
     - Drug-like small molecules (150-500 Da)
     - Single-chain proteins or well-defined binding sites
     - Proteins similar to those in training data (PDBBind, BindingMOAD)

3. **Multiple Predictions**: DiffDock generates multiple samples per complex (default: 10)
   - Review top-ranked predictions (by confidence)
   - Consider clustering similar poses
   - High-confidence consensus across multiple samples strengthens prediction

## What DiffDock Predicts

### ✅ DiffDock DOES Predict
- **Binding poses**: 3D spatial orientation of ligand in protein binding site
- **Confidence scores**: Model's certainty about predictions
- **Multiple conformations**: Various possible binding modes

### ❌ DiffDock DOES NOT Predict
- **Binding affinity**: Strength of protein-ligand interaction (ΔG, Kd, Ki)
- **Binding kinetics**: On/off rates, residence time
- **ADMET properties**: Absorption, distribution, metabolism, excretion, toxicity
- **Selectivity**: Relative binding to different targets

## Scope and Limitations

### Designed For
- **Small molecule docking**: Organic compounds typically 100-1000 Da
- **Protein targets**: Single or multi-chain proteins
- **Small peptides**: Short peptide ligands (< ~20 residues)
- **Small nucleic acids**: Short oligonucleotides

### NOT Designed For
- **Large biomolecules**: Full protein-protein interactions
  - Use DiffDock-PP, AlphaFold-Multimer, or RoseTTAFold2NA instead
- **Large peptides/proteins**: >20 residues as ligands
- **Covalent docking**: Irreversible covalent bond formation
- **Metalloprotein specifics**: May not accurately handle metal coordination
- **Membrane proteins**: Not specifically trained on membrane-embedded proteins

### Training Data Considerations

DiffDock was trained on:
- **PDBBind**: Diverse protein-ligand complexes
- **BindingMOAD**: Multi-domain protein structures

**Implications**:
- Best performance on proteins/ligands similar to training data
- May underperform on:
  - Novel protein families
  - Unusual ligand chemotypes
  - Allosteric sites not well-represented in training data

## Validation and Complementary Tools

### Recommended Workflow

1. **Generate poses with DiffDock**
   - Use confidence scores for initial ranking
   - Consider multiple high-confidence predictions

2. **Visual Inspection**
   - Examine protein-ligand interactions in molecular viewer
   - Check for reasonable:
     - Hydrogen bonds
     - Hydrophobic interactions
     - Steric complementarity
     - Electrostatic interactions

3. **Scoring and Refinement** (choose one or more):
   - **GNINA**: Deep learning-based scoring function
   - **Molecular mechanics**: Energy minimization and refinement
   - **MM/GBSA or MM/PBSA**: Binding free energy estimation
   - **Free energy calculations**: FEP or TI for accurate affinity prediction

4. **Experimental Validation**
   - Biochemical assays (IC50, Kd measurements)
   - Structural validation (X-ray crystallography, cryo-EM)

### Tools for Binding Affinity Assessment

DiffDock should be combined with these tools for affinity prediction:

- **GNINA**: Fast, accurate scoring function
  - Github: github.com/gnina/gnina

- **AutoDock Vina**: Classical docking and scoring
  - Website: vina.scripps.edu

- **Free Energy Calculations**:
  - OpenMM + OpenFE
  - GROMACS + ABFE/RBFE protocols

- **MM/GBSA Tools**:
  - MMPBSA.py (AmberTools)
  - gmx_MMPBSA

## Performance Optimization

### For Best Results

1. **Protein Preparation**:
   - Remove water molecules far from binding site
   - Resolve missing residues if possible
   - Consider protonation states at physiological pH

2. **Ligand Input**:
   - Provide reasonable 3D conformers when using structure files
   - Use canonical SMILES for consistent results
   - Pre-process with RDKit if needed

3. **Computational Resources**:
   - GPU strongly recommended (10-100x speedup)
   - First run pre-computes lookup tables (takes a few minutes)
   - Batch processing more efficient than single predictions

4. **Parameter Tuning**:
   - Increase `samples_per_complex` for difficult cases (20-40)
   - Adjust temperature parameters for diversity/accuracy trade-off
   - Use pre-computed ESM embeddings for repeated predictions

## Common Issues and Troubleshooting

### Low Confidence Scores
- **Large/flexible ligands**: Consider splitting into fragments or use alternative methods
- **Multiple binding sites**: May predict multiple locations with distributed confidence
- **Protein flexibility**: Consider using ensemble of protein conformations

### Unrealistic Predictions
- **Clashes**: May indicate need for protein preparation or refinement
- **Surface binding**: Check if true binding site is blocked or unclear
- **Unusual poses**: Consider increasing samples to explore more conformations

### Slow Performance
- **Use GPU**: Essential for reasonable runtime
- **Pre-compute embeddings**: Reuse ESM embeddings for same protein
- **Batch processing**: More efficient than sequential individual predictions
- **Reduce samples**: Lower `samples_per_complex` for quick screening

## Citation and Further Reading

For methodology details and benchmarking results, see:

1. **Original DiffDock Paper** (ICLR 2023):
   - "DiffDock: Diffusion Steps, Twists, and Turns for Molecular Docking"
   - Corso et al., arXiv:2210.01776

2. **DiffDock-L Paper** (2024):
   - Enhanced model with improved generalization
   - Stärk et al., arXiv:2402.18396

3. **PoseBusters Benchmark**:
   - Rigorous docking evaluation framework
   - Used for DiffDock validation
