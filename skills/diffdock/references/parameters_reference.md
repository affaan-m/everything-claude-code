# DiffDock Configuration Parameters Reference

This document provides comprehensive details on all DiffDock configuration parameters and command-line options.

## Model & Checkpoint Settings

### Model Paths
- **`--model_dir`**: Directory containing the score model checkpoint
  - Default: `./workdir/v1.1/score_model`
  - DiffDock-L model (current default)

- **`--confidence_model_dir`**: Directory containing the confidence model checkpoint
  - Default: `./workdir/v1.1/confidence_model`

- **`--ckpt`**: Name of the score model checkpoint file
  - Default: `best_ema_inference_epoch_model.pt`

- **`--confidence_ckpt`**: Name of the confidence model checkpoint file
  - Default: `best_model_epoch75.pt`

### Model Version Flags
- **`--old_score_model`**: Use original DiffDock model instead of DiffDock-L
  - Default: `false` (uses DiffDock-L)

- **`--old_filtering_model`**: Use legacy confidence filtering approach
  - Default: `true`

## Input/Output Options

### Input Specification
- **`--protein_path`**: Path to protein PDB file
  - Example: `--protein_path protein.pdb`
  - Alternative to `--protein_sequence`

- **`--protein_sequence`**: Amino acid sequence for ESMFold folding
  - Automatically generates protein structure from sequence
  - Alternative to `--protein_path`

- **`--ligand`**: Ligand specification (SMILES string or file path)
  - SMILES string: `--ligand "COc(cc1)ccc1C#N"`
  - File path: `--ligand ligand.sdf` or `.mol2`

- **`--protein_ligand_csv`**: CSV file for batch processing
  - Required columns: `complex_name`, `protein_path`, `ligand_description`, `protein_sequence`
  - Example: `--protein_ligand_csv data/protein_ligand_example.csv`

### Output Control
- **`--out_dir`**: Output directory for predictions
  - Example: `--out_dir results/user_predictions/`

- **`--save_visualisation`**: Export predicted molecules as SDF files
  - Enables visualization of results

## Inference Parameters

### Diffusion Steps
- **`--inference_steps`**: Number of planned inference iterations
  - Default: `20`
  - Higher values may improve accuracy but increase runtime

- **`--actual_steps`**: Actual diffusion steps executed
  - Default: `19`

- **`--no_final_step_noise`**: Omit noise at the final diffusion step
  - Default: `true`

### Sampling Settings
- **`--samples_per_complex`**: Number of samples to generate per complex
  - Default: `10`
  - More samples provide better coverage but increase computation

- **`--sigma_schedule`**: Noise schedule type
  - Default: `expbeta` (exponential-beta)

- **`--initial_noise_std_proportion`**: Initial noise standard deviation scaling
  - Default: `1.46`

### Temperature Parameters

#### Sampling Temperatures (Controls diversity of predictions)
- **`--temp_sampling_tr`**: Translation sampling temperature
  - Default: `1.17`

- **`--temp_sampling_rot`**: Rotation sampling temperature
  - Default: `2.06`

- **`--temp_sampling_tor`**: Torsion sampling temperature
  - Default: `7.04`

#### Psi Angle Temperatures
- **`--temp_psi_tr`**: Translation psi temperature
  - Default: `0.73`

- **`--temp_psi_rot`**: Rotation psi temperature
  - Default: `0.90`

- **`--temp_psi_tor`**: Torsion psi temperature
  - Default: `0.59`

#### Sigma Data Temperatures
- **`--temp_sigma_data_tr`**: Translation data distribution scaling
  - Default: `0.93`

- **`--temp_sigma_data_rot`**: Rotation data distribution scaling
  - Default: `0.75`

- **`--temp_sigma_data_tor`**: Torsion data distribution scaling
  - Default: `0.69`

## Processing Options

### Performance
- **`--batch_size`**: Processing batch size
  - Default: `10`
  - Larger values increase throughput but require more memory

- **`--tqdm`**: Enable progress bar visualization
  - Useful for monitoring long-running jobs

### Protein Structure
- **`--chain_cutoff`**: Maximum number of protein chains to process
  - Example: `--chain_cutoff 10`
  - Useful for large multi-chain complexes

- **`--esm_embeddings_path`**: Path to pre-computed ESM2 protein embeddings
  - Speeds up inference by reusing embeddings
  - Optional optimization

### Dataset Options
- **`--split`**: Dataset split to use (train/test/val)
  - Used for evaluation on standard benchmarks

## Advanced Flags

### Debugging & Testing
- **`--no_model`**: Disable model inference (debugging)
  - Default: `false`

- **`--no_random`**: Disable randomization
  - Default: `false`
  - Useful for reproducibility testing

### Alternative Sampling
- **`--ode`**: Use ODE solver instead of SDE
  - Default: `false`
  - Alternative sampling approach

- **`--different_schedules`**: Use different noise schedules per component
  - Default: `false`

### Error Handling
- **`--limit_failures`**: Maximum allowed failures before stopping
  - Default: `5`

## Configuration File

All parameters can be specified in a YAML configuration file (typically `default_inference_args.yaml`) or overridden via command line:

```bash
python -m inference --config default_inference_args.yaml --samples_per_complex 20
```

Command-line arguments take precedence over configuration file values.
