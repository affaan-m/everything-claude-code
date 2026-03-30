# Experiment Types and Workflows

## Overview

Adaptyv provides multiple experimental assay types for comprehensive protein characterization. Each experiment type has specific applications, workflows, and data outputs.

## Binding Assays

### Description

Measure protein-target interactions using biolayer interferometry (BLI), a label-free technique that monitors biomolecular binding in real-time.

### Use Cases

- Antibody-antigen binding characterization
- Receptor-ligand interaction analysis
- Protein-protein interaction studies
- Affinity maturation screening
- Epitope binning experiments

### Technology: Biolayer Interferometry (BLI)

BLI measures the interference pattern of reflected light from two surfaces:
- **Reference layer** - Biosensor tip surface
- **Biological layer** - Accumulated bound molecules

As molecules bind, the optical thickness increases, causing a wavelength shift proportional to binding.

**Advantages:**
- Label-free detection
- Real-time kinetics
- High-throughput compatible
- Works in crude samples
- Minimal sample consumption

### Measured Parameters

**Kinetic constants:**
- **KD** - Equilibrium dissociation constant (binding affinity)
- **kon** - Association rate constant (binding speed)
- **koff** - Dissociation rate constant (unbinding speed)

**Typical ranges:**
- Strong binders: KD < 1 nM
- Moderate binders: KD = 1-100 nM
- Weak binders: KD > 100 nM

### Workflow

1. **Sequence submission** - Provide protein sequences in FASTA format
2. **Expression** - Proteins expressed in appropriate host system
3. **Purification** - Automated purification protocols
4. **BLI assay** - Real-time binding measurements against specified targets
5. **Analysis** - Kinetic curve fitting and quality assessment
6. **Results delivery** - Binding parameters with confidence metrics

### Sample Requirements

- Protein sequence (standard amino acid codes)
- Target specification (from catalog or custom request)
- Buffer conditions (standard or custom)
- Expected concentration range (optional, improves assay design)

### Results Format

```json
{
  "sequence_id": "antibody_variant_1",
  "target": "Human PD-L1",
  "measurements": {
    "kd": 2.5e-9,
    "kd_error": 0.3e-9,
    "kon": 1.8e5,
    "kon_error": 0.2e5,
    "koff": 4.5e-4,
    "koff_error": 0.5e-4
  },
  "quality_metrics": {
    "confidence": "high|medium|low",
    "r_squared": 0.97,
    "chi_squared": 0.02,
    "flags": []
  },
  "raw_data_url": "https://..."
}
```

## Expression Testing

### Description

Quantify protein expression levels in various host systems to assess producibility and optimize sequences for manufacturing.

### Use Cases

- Screening variants for high expression
- Optimizing codon usage
- Identifying expression bottlenecks
- Selecting candidates for scale-up
- Comparing expression systems

### Host Systems

Available expression platforms:
- **E. coli** - Rapid, cost-effective, prokaryotic system
- **Mammalian cells** - Native post-translational modifications
- **Yeast** - Eukaryotic system with simpler growth requirements
- **Insect cells** - Alternative eukaryotic platform

### Measured Parameters

- **Total protein yield** (mg/L culture)
- **Soluble fraction** (percentage)
- **Purity** (after initial purification)
- **Expression time course** (optional)

### Workflow

1. **Sequence submission** - Provide protein sequences
2. **Construct generation** - Cloning into expression vectors
3. **Expression** - Culture in specified host system
4. **Quantification** - Protein measurement via multiple methods
5. **Analysis** - Expression level comparison and ranking
6. **Results delivery** - Yield data and recommendations

### Results Format

```json
{
  "sequence_id": "variant_1",
  "host_system": "E. coli",
  "measurements": {
    "total_yield_mg_per_l": 25.5,
    "soluble_fraction_percent": 78,
    "purity_percent": 92
  },
  "ranking": {
    "percentile": 85,
    "notes": "High expression, good solubility"
  }
}
```

## Thermostability Testing

### Description

Measure protein thermal stability to assess structural integrity, predict shelf-life, and identify stabilizing mutations.

### Use Cases

- Selecting thermally stable variants
- Formulation development
- Shelf-life prediction
- Stability-driven protein engineering
- Quality control screening

### Measurement Techniques

**Differential Scanning Fluorimetry (DSF):**
- Monitors protein unfolding via fluorescent dye binding
- Determines melting temperature (Tm)
- High-throughput capable

**Circular Dichroism (CD):**
- Secondary structure analysis
- Thermal unfolding curves
- Reversibility assessment

### Measured Parameters

- **Tm** - Melting temperature (midpoint of unfolding)
- **ΔH** - Enthalpy of unfolding
- **Aggregation temperature** (Tagg)
- **Reversibility** - Refolding after heating

### Workflow

1. **Sequence submission** - Provide protein sequences
2. **Expression and purification** - Standard protocols
3. **Thermostability assay** - Temperature gradient analysis
4. **Data analysis** - Curve fitting and parameter extraction
5. **Results delivery** - Stability metrics with ranking

### Results Format

```json
{
  "sequence_id": "variant_1",
  "measurements": {
    "tm_celsius": 68.5,
    "tm_error": 0.5,
    "tagg_celsius": 72.0,
    "reversibility_percent": 85
  },
  "quality_metrics": {
    "curve_quality": "excellent",
    "cooperativity": "two-state"
  }
}
```

## Enzyme Activity Assays

### Description

Measure enzymatic function including substrate turnover, catalytic efficiency, and inhibitor sensitivity.

### Use Cases

- Screening enzyme variants for improved activity
- Substrate specificity profiling
- Inhibitor testing
- pH and temperature optimization
- Mechanistic studies

### Assay Types

**Continuous assays:**
- Chromogenic substrates
- Fluorogenic substrates
- Real-time monitoring

**Endpoint assays:**
- HPLC quantification
- Mass spectrometry
- Colorimetric detection

### Measured Parameters

**Kinetic parameters:**
- **kcat** - Turnover number (catalytic rate constant)
- **KM** - Michaelis constant (substrate affinity)
- **kcat/KM** - Catalytic efficiency
- **IC50** - Inhibitor concentration for 50% inhibition

**Activity metrics:**
- Specific activity (units/mg protein)
- Relative activity vs. reference
- Substrate specificity profile

### Workflow

1. **Sequence submission** - Provide enzyme sequences
2. **Expression and purification** - Optimized for activity retention
3. **Activity assay** - Substrate turnover measurements
4. **Kinetic analysis** - Michaelis-Menten fitting
5. **Results delivery** - Kinetic parameters and rankings

### Results Format

```json
{
  "sequence_id": "enzyme_variant_1",
  "substrate": "substrate_name",
  "measurements": {
    "kcat_per_second": 125,
    "km_micromolar": 45,
    "kcat_km": 2.8,
    "specific_activity": 180
  },
  "quality_metrics": {
    "confidence": "high",
    "r_squared": 0.99
  },
  "ranking": {
    "relative_activity": 1.8,
    "improvement_vs_wildtype": "80%"
  }
}
```

## Experiment Design Best Practices

### Sequence Submission

1. **Use clear identifiers** - Name sequences descriptively
2. **Include controls** - Submit wild-type or reference sequences
3. **Batch similar variants** - Group related sequences in single submission
4. **Validate sequences** - Check for errors before submission

### Sample Size

- **Pilot studies** - 5-10 sequences to test feasibility
- **Library screening** - 50-500 sequences for variant exploration
- **Focused optimization** - 10-50 sequences for fine-tuning
- **Large-scale campaigns** - 500+ sequences for ML-driven design

### Quality Control

Adaptyv includes automated QC steps:
- Expression verification before assay
- Replicate measurements for reliability
- Positive/negative controls in each batch
- Statistical validation of results

### Timeline Expectations

**Standard turnaround:** ~21 days from submission to results

**Timeline breakdown:**
- Construct generation: 3-5 days
- Expression: 5-7 days
- Purification: 2-3 days
- Assay execution: 3-5 days
- Analysis and QC: 2-3 days

**Factors affecting timeline:**
- Custom targets (add 1-2 weeks)
- Novel assay development (add 2-4 weeks)
- Large batch sizes (may add 1 week)

### Cost Optimization

1. **Batch submissions** - Lower per-sequence cost
2. **Standard targets** - Catalog antigens are faster/cheaper
3. **Standard conditions** - Custom buffers add cost
4. **Computational pre-filtering** - Submit only promising candidates

## Combining Experiment Types

For comprehensive protein characterization, combine multiple assays:

**Therapeutic antibody development:**
1. Binding assay → Identify high-affinity binders
2. Expression testing → Select manufacturable candidates
3. Thermostability → Ensure formulation stability

**Enzyme engineering:**
1. Activity assay → Screen for improved catalysis
2. Expression testing → Ensure producibility
3. Thermostability → Validate industrial robustness

**Sequential vs. Parallel:**
- **Sequential** - Use results from early assays to filter candidates
- **Parallel** - Run all assays simultaneously for faster results

## Data Integration

Results integrate with computational workflows:

1. **Download raw data** via API
2. **Parse results** into standardized format
3. **Feed into ML models** for next-round design
4. **Track experiments** with metadata tags
5. **Visualize trends** across design iterations

## Support and Troubleshooting

**Common issues:**
- Low expression → Consider sequence optimization (see protein_optimization.md)
- Poor binding → Verify target specification and expected range
- Variable results → Check sequence quality and controls
- Incomplete data → Contact support with experiment ID

**Getting help:**
- Email: support@adaptyvbio.com
- Include experiment ID and specific question
- Provide context (design goals, expected results)
- Response time: <24 hours for active experiments
