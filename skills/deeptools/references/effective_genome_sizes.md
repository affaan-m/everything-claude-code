# Effective Genome Sizes

## Definition

Effective genome size refers to the length of the "mappable" genome - regions that can be uniquely mapped by sequencing reads. This metric is crucial for proper normalization in many deepTools commands.

## Why It Matters

- Required for RPGC normalization (`--normalizeUsing RPGC`)
- Affects accuracy of coverage calculations
- Must match your data processing approach (filtered vs unfiltered reads)

## Calculation Methods

1. **Non-N bases**: Count of non-N nucleotides in genome sequence
2. **Unique mappability**: Regions of specific size that can be uniquely mapped (may consider edit distance)

## Common Organism Values

### Using Non-N Bases Method

| Organism | Assembly | Effective Size | Full Command |
|----------|----------|----------------|--------------|
| Human | GRCh38/hg38 | 2,913,022,398 | `--effectiveGenomeSize 2913022398` |
| Human | GRCh37/hg19 | 2,864,785,220 | `--effectiveGenomeSize 2864785220` |
| Mouse | GRCm39/mm39 | 2,654,621,837 | `--effectiveGenomeSize 2654621837` |
| Mouse | GRCm38/mm10 | 2,652,783,500 | `--effectiveGenomeSize 2652783500` |
| Zebrafish | GRCz11 | 1,368,780,147 | `--effectiveGenomeSize 1368780147` |
| *Drosophila* | dm6 | 142,573,017 | `--effectiveGenomeSize 142573017` |
| *C. elegans* | WBcel235/ce11 | 100,286,401 | `--effectiveGenomeSize 100286401` |
| *C. elegans* | ce10 | 100,258,171 | `--effectiveGenomeSize 100258171` |

### Human (GRCh38) by Read Length

For quality-filtered reads, values vary by read length:

| Read Length | Effective Size |
|-------------|----------------|
| 50bp | ~2.7 billion |
| 75bp | ~2.8 billion |
| 100bp | ~2.8 billion |
| 150bp | ~2.9 billion |
| 250bp | ~2.9 billion |

### Mouse (GRCm38) by Read Length

| Read Length | Effective Size |
|-------------|----------------|
| 50bp | ~2.3 billion |
| 75bp | ~2.5 billion |
| 100bp | ~2.6 billion |

## Usage in deepTools

The effective genome size is most commonly used with:

### bamCoverage with RPGC normalization
```bash
bamCoverage --bam input.bam --outFileName output.bw \
    --normalizeUsing RPGC \
    --effectiveGenomeSize 2913022398
```

### bamCompare with RPGC normalization
```bash
bamCompare -b1 treatment.bam -b2 control.bam \
    --outFileName comparison.bw \
    --scaleFactorsMethod RPGC \
    --effectiveGenomeSize 2913022398
```

### computeGCBias / correctGCBias
```bash
computeGCBias --bamfile input.bam \
    --effectiveGenomeSize 2913022398 \
    --genome genome.2bit \
    --fragmentLength 200 \
    --biasPlot bias.png
```

## Choosing the Right Value

**For most analyses:** Use the non-N bases method value for your reference genome

**For filtered data:** If you apply strict quality filters or remove multimapping reads, consider using the read-length-specific values

**When unsure:** Use the conservative non-N bases value - it's more widely applicable

## Common Shortcuts

deepTools also accepts these shorthand values in some contexts:

- `hs` or `GRCh38`: 2913022398
- `mm` or `GRCm38`: 2652783500
- `dm` or `dm6`: 142573017
- `ce` or `ce10`: 100286401

Check your specific deepTools version documentation for supported shortcuts.

## Calculating Custom Values

For custom genomes or assemblies, calculate the non-N bases count:

```bash
# Using faCount (UCSC tools)
faCount genome.fa | grep "total" | awk '{print $2-$7}'

# Using seqtk
seqtk comp genome.fa | awk '{x+=$2}END{print x}'
```

## References

For the most up-to-date effective genome sizes and detailed calculation methods, see:
- deepTools documentation: https://deeptools.readthedocs.io/en/latest/content/feature/effectiveGenomeSize.html
- ENCODE documentation for reference genome details
