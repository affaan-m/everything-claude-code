# IQ-TREE 2 Phylogenetic Inference Reference

## Basic Command Syntax

```bash
iqtree2 -s alignment.fasta --prefix output -m TEST -B 1000 -T AUTO --redo
```

## Key Parameters

| Flag | Description | Default |
|------|-------------|---------|
| `-s` | Input alignment file | Required |
| `--prefix` | Output file prefix | alignment name |
| `-m` | Substitution model (or TEST) | GTR+G |
| `-B` | Ultrafast bootstrap replicates | Off |
| `-b` | Standard bootstrap replicates (slow) | Off |
| `-T` | Number of threads (or AUTO) | 1 |
| `-o` | Outgroup taxa name(s) | None (unrooted) |
| `--redo` | Overwrite existing results | Off |
| `-alrt` | SH-aLRT test replicates | Off |

## Model Selection

```bash
# Full model testing (automatically selects best model)
iqtree2 -s alignment.fasta -m TEST --prefix test_run -B 1000 -T 4

# Specify model explicitly
iqtree2 -s alignment.fasta -m GTR+G4 --prefix gtr_run -B 1000

# Protein sequences
iqtree2 -s protein.fasta -m TEST --prefix prot_tree -B 1000

# Codon-based analysis
iqtree2 -s codon.fasta -m GY --prefix codon_tree -B 1000
```

## Bootstrapping Methods

### Ultrafast Bootstrap (UFBoot, recommended)
```bash
iqtree2 -s alignment.fasta -B 1000  # 1000 replicates
# Values ≥95 are reliable
# ~10× faster than standard bootstrap
```

### Standard Bootstrap
```bash
iqtree2 -s alignment.fasta -b 100  # 100 replicates (very slow)
```

### SH-aLRT Test (fast alternative)
```bash
iqtree2 -s alignment.fasta -alrt 1000 -B 1000  # Both SH-aLRT and UFBoot
# SH-aLRT ≥80 AND UFBoot ≥95 = well-supported branch
```

## Branch Support Interpretation

| Bootstrap Value | Interpretation |
|----------------|----------------|
| ≥ 95 | Well-supported (strongly supported) |
| 70–94 | Moderately supported |
| 50–69 | Weakly supported |
| < 50 | Unreliable (not supported) |

## Output Files

| File | Description |
|------|-------------|
| `{prefix}.treefile` | Best ML tree in Newick format |
| `{prefix}.iqtree` | Full analysis report |
| `{prefix}.log` | Computation log |
| `{prefix}.contree` | Consensus tree from bootstrap |
| `{prefix}.splits.nex` | Network splits |
| `{prefix}.bionj` | BioNJ starting tree |
| `{prefix}.model.gz` | Saved model parameters |

## Advanced Analyses

### Molecular Clock (Dating)

```bash
# Temporal analysis with sampling dates
iqtree2 -s alignment.fasta -m GTR+G \
        --date dates.tsv \           # Tab-separated: taxon_name  YYYY-MM-DD
        --clock-test \               # Test for clock-like evolution
        --date-CI 95 \              # 95% CI for node dates
        --prefix dated_tree
```

### Concordance Factors

```bash
# Gene concordance factor (gCF) - requires multiple gene alignments
iqtree2 --gcf gene_trees.nwk \
        --tree main_tree.treefile \
        --cf-verbose \
        --prefix cf_analysis
```

### Ancestral Sequence Reconstruction

```bash
iqtree2 -s alignment.fasta -m LG+G4 \
        -asr \                      # Marginal ancestral state reconstruction
        --prefix anc_tree
# Output: {prefix}.state (ancestral sequences per node)
```

### Partition Model (Multi-Gene)

```bash
# Create partition file (partitions.txt):
# DNA, gene1 = 1-500
# DNA, gene2 = 501-1000

iqtree2 -s concat_alignment.fasta \
        -p partitions.txt \
        -m TEST \
        -B 1000 \
        --prefix partition_tree
```

## IQ-TREE Log Parsing

```python
def parse_iqtree_log(log_file: str) -> dict:
    """Extract key results from IQ-TREE log file."""
    results = {}
    with open(log_file) as f:
        for line in f:
            if "Best-fit model" in line:
                results["best_model"] = line.split(":")[1].strip()
            elif "Log-likelihood of the tree:" in line:
                results["log_likelihood"] = float(line.split(":")[1].strip())
            elif "Number of free parameters" in line:
                results["free_params"] = int(line.split(":")[1].strip())
            elif "Akaike information criterion" in line:
                results["AIC"] = float(line.split(":")[1].strip())
            elif "Bayesian information criterion" in line:
                results["BIC"] = float(line.split(":")[1].strip())
            elif "Total CPU time used" in line:
                results["cpu_time"] = line.split(":")[1].strip()
    return results

# Example:
# results = parse_iqtree_log("output.log")
# print(f"Best model: {results['best_model']}")
# print(f"Log-likelihood: {results['log_likelihood']:.2f}")
```

## Common Issues and Solutions

| Issue | Likely Cause | Solution |
|-------|-------------|---------|
| All bootstrap values = 0 | Too few taxa | Need ≥4 taxa for bootstrap |
| Very long branches | Alignment artifacts | Re-trim alignment; check for outliers |
| Memory error | Too many sequences | Use FastTree; or reduce `-T` to 1 |
| Poor model fit | Wrong alphabet | Check nucleotide vs. protein specification |
| Identical sequences | Duplicate sequences | Remove duplicates before alignment |

## MAFFT Alignment Guide

```bash
# Accurate (< 200 sequences)
mafft --localpair --maxiterate 1000 input.fasta > aligned.fasta

# Medium (200-1000 sequences)
mafft --auto input.fasta > aligned.fasta

# Fast (> 1000 sequences)
mafft --fftns input.fasta > aligned.fasta

# Very large (> 10000 sequences)
mafft --retree 1 input.fasta > aligned.fasta

# Using multiple threads
mafft --thread 8 --auto input.fasta > aligned.fasta
```
