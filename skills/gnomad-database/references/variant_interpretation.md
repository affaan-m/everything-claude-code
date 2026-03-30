# gnomAD Variant Interpretation Guide

## Allele Frequency Thresholds for Disease Interpretation

### ACMG/AMP Criteria

| Criterion | AF threshold | Classification |
|-----------|-------------|----------------|
| BA1 | > 0.05 (5%) | Benign Stand-Alone |
| BS1 | > disease prevalence | Benign Supporting |
| PM2_Supporting | < 0.0001 (0.01%) for dominant; absent for recessive | Pathogenic Moderate → Supporting |

**Notes:**
- BA1 applies to most conditions; exceptions include autosomal dominant with high penetrance (e.g., LDLR for FH: BA1 threshold is ~0.1%)
- BS1 requires knowing disease prevalence; for rare diseases (1:10,000), BS1 if AF > 0.01%
- Homozygous counts (`ac_hom`) matter for recessive diseases

### Practical Thresholds

| Inheritance | Suggested max AF |
|-------------|-----------------|
| Autosomal Dominant (high penetrance) | < 0.001 (0.1%) |
| Autosomal Dominant (reduced penetrance) | < 0.01 (1%) |
| Autosomal Recessive | < 0.01 (1%) |
| X-linked recessive | < 0.001 in females |

## Absence in gnomAD

A variant **absent in gnomAD** (ac = 0) is evidence of rarity, but interpret carefully:
- gnomAD does not capture all rare variants (sequencing depth, coverage, calling thresholds)
- A variant absent in 730K exomes is very strong evidence of rarity for PM2
- Check coverage at the position: if < 10x, absence is less informative

## Loss-of-Function Variant Assessment

### LOFTEE Classification (lof field)

- **HC (High Confidence):** Predicted to truncate functional protein
  - Stop-gained, splice site (±1,2), frameshift variants
  - Passes all LOFTEE quality filters

- **LC (Low Confidence):** LoF annotation with quality concerns
  - Check `lof_flags` for specific reason
  - May still be pathogenic — requires manual review

### Common lof_flags

| Flag | Meaning |
|------|---------|
| `NAGNAG_SITE` | Splice site may be rescued by nearby alternative site |
| `NON_CANONICAL_SPLICE_SITE` | Not a canonical splice donor/acceptor |
| `PHYLOCSF_WEAK` | Weak phylogenetic conservation signal |
| `SMALL_INTRON` | Intron too small to affect splicing |
| `SINGLE_EXON` | Single-exon gene (no splicing) |
| `LAST_EXON` | In last exon (NMD may not apply) |

## Homozygous Observations

The `ac_hom` field counts homozygous (or hemizygous in males for chrX) observations.

**For recessive diseases:**
- If a variant is observed homozygous in healthy individuals in gnomAD, it is strong evidence against pathogenicity (BS2 criterion)
- Even a single homozygous observation can be informative

## Coverage at Position

Always check that gnomAD has adequate coverage at the variant position before concluding absence is meaningful. The gnomAD browser shows coverage tracks, and coverage data can be downloaded from:
- https://gnomad.broadinstitute.org/downloads#v4-coverage

## In Silico Predictor Scores

| Predictor | Score Range | Pathogenic Threshold |
|-----------|-------------|---------------------|
| CADD PHRED | 0–99 | > 20 deleterious; > 30 highly deleterious |
| REVEL | 0–1 | > 0.75 likely pathogenic (for missense) |
| SpliceAI max_ds | 0–1 | > 0.5 likely splice-altering |
| SIFT | 0–1 | < 0.05 deleterious |
| PolyPhen-2 | 0–1 | > 0.909 probably damaging |

## Ancestry-Specific Considerations

- A variant rare overall may be a common founder variant in a specific population
- Always check all ancestry-specific AFs, not just the total
- Finnish and Ashkenazi Jewish populations have high rates of founder variants
- Report ancestry-specific frequencies when relevant to patient ancestry
