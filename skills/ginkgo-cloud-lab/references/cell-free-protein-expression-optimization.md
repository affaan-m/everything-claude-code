# Cell Free Protein Expression Optimization

**URL:** https://cloud.ginkgo.bio/protocols/cell-free-protein-expression-optimization
**Status:** Ginkgo Certified
**Price:** $199/sample (default: $597 for 1 protein x 3 replicates = 3 samples)
**Turnaround:** 6-11 days

## Overview

Design of Experiment (DoE) approach to expressing protein targets in a proprietary reconstituted E. coli transcription-translation system. Each construct is evaluated in up to 24 reaction conditions per protein, including target-specific additives such as chaperones, disulfide-bond enhancers, and cofactors. Designed for difficult-to-express proteins including membrane proteins and targets with disulfide or cofactor requirements.

## Input

- **DNA sequence** in `.fasta` format

## Output

- **Comparative Yield:** Titer data mapped across all tested variables (lysates, temps, additives)
- **Purity Profiling:** Target protein vs. background impurities to find highest quality yield
- **Optimal Conditions:** Overlaid electropherograms pinpointing the exact formulation for a given sequence

## Automated Workflow

### Phase 1 - Reagent Prep

1. Retrieve plates from 4 deg C
2. Thaw at room temperature
3. PBS backfill

### Phase 2 - CFPS Reaction Setup & Incubation

1. Retrieve plates from 4 deg C
2. Dispense lysate
3. QC plate read
4. Incubate (shaking or static, condition-dependent)

### Phase 3 - Quantification Prep & Read

1. Dispense PBS
2. Unseal plate
3. LabChip quantification
4. Seal plate
5. Store at 4 deg C

## Protocol Parameters

- Payloads & Reagents
- Bravo Stamp
- HiG Centrifuge
- Incubation & Storage

## Optimization Variables

The DoE matrix can span up to 24 conditions per protein, varying:

- **Lysate composition** (different E. coli extract formulations)
- **Temperature** (incubation temperature profiles)
- **Additives:**
  - Chaperones (for folding-challenged targets)
  - Disulfide-bond enhancers (for targets requiring disulfide bridges)
  - Cofactors (metal ions, coenzymes, prosthetic groups)
  - Other target-specific supplements

## Ordering

- **Number of Proteins:** configurable
- **Number of Replicates:** configurable
- **File Upload:** CSV, Excel, FASTA, TXT, PDF, ZIP
- **Additional Details:** free-text field for special requirements

## Certification Milestones

- Dry Run Complete
- Wet Run Complete
- Biovalidation Complete
- App Note Complete

## Use Cases

- Optimizing expression of difficult-to-express proteins
- Membrane protein expression screening
- Identifying optimal conditions for disulfide-bonded proteins
- Cofactor-dependent protein expression
- Systematic exploration of expression parameter space
- Finding the best formulation before scaling up production
