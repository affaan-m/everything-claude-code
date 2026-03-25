---
name: bioinformatics
description: Bioinformatics guidelines for variant analysis, pathogenicity scoring, genomic standards, and pipeline tools. Focused on reliable sources for clinical and research bioinformatics workflows.
origin: ECC
---

# Bioinformatics Guidelines

> Skill for bioinformaticians covering variant scoring, genomic standards, annotation tools, and pipeline best practices.
> Invoke with `/bioinformatics` when working on genomic analysis, variant interpretation, or pipeline design.

---

## Section 1: Variant Pathogenicity Scoring

Scoring variant pathogenicity requires combining multiple in-silico predictors. No single tool is definitive — use ensemble approaches and always cross-reference with clinical databases.

### Core Scoring Tools

| Tool | Purpose | Source |
|------|---------|--------|
| SIFT | Predicts whether amino acid substitution affects protein function (score 0–1; <0.05 = damaging) | https://sift.bii.a-star.edu.sg/sift4g/ |
| REVEL | Ensemble score for missense variant pathogenicity (0–1; >0.5 = likely pathogenic) | https://sites.google.com/site/revelgenomics/ |
| MutationTaster | Predicts disease-causing potential of sequence alterations | https://www.mutationtaster.org/ |
| ANNOVAR | Functional annotation of genetic variants from sequencing data | https://annovar.openbioinformatics.org/en/latest/ |
| GATK Phred Scores | Quality scoring for variant calling confidence (Q30 = 99.9% accuracy) | https://gatk.broadinstitute.org/hc/en-us/articles/360035531872-Phred-scaled-quality-scores |

### Scoring Interpretation Guidelines

**SIFT**
- Score < 0.05 → **Damaging** (affects protein function)
- Score ≥ 0.05 → **Tolerated**
- Always check the median sequence conservation score alongside SIFT score

**REVEL**
- Score > 0.75 → Strong evidence of pathogenicity
- Score 0.5–0.75 → Moderate evidence
- Score < 0.15 → Likely benign
- Recommended threshold for clinical use: **> 0.5** (adjustable per study design)

**GATK Phred Quality Scores**
- GQ (Genotype Quality) ≥ 20 → Acceptable
- GQ ≥ 30 → High confidence
- DP (Depth) ≥ 10× → Minimum; ≥ 30× preferred for clinical
- Filter: `PASS` in FILTER column is mandatory before scoring

**AlphaMissense**
- Score > 0.564 → Likely pathogenic
- Score < 0.34 → Likely benign
- Deep learning model trained on protein structure and evolutionary data; covers all possible human missense variants in GRCh38

**CADD**
- C-score ≥ 20 → Top 1% most deleterious variants in the human genome
- C-score ≥ 30 → Top 0.1%; considered highly deleterious
- Integrates >60 functional annotations; applies to both coding and non-coding variants

### Ensemble Scoring Workflow

```
1. Run GATK variant calling → apply VQSR or hard filters
2. Annotate with ANNOVAR (refGene, gnomAD, ClinVar, dbSNP)
3. Apply in-silico predictors: SIFT, REVEL, MutationTaster, CADD
4. Cross-reference with DECIPHER and ClinVar
5. Apply ACMG/AMP classification criteria (PS, PM, PP, BA, BS, BP categories)
6. Final classification: Pathogenic / Likely Pathogenic / VUS / Likely Benign / Benign
```

### ACMG/AMP Classification (Quick Reference)

Follow ACMG/AMP 2015 standards (Richards et al., *Genetics in Medicine* 2015) for variant classification:

**Pathogenic evidence:**
- **PVS1** = Very strong — null variant (nonsense, frameshift, canonical ±1/2 splice site) in gene where LOF is known disease mechanism
- **PS1–PS4** = Strong — same amino acid change as known pathogenic, de novo confirmed, established functional studies, variant prevalence
- **PM1–PM6** = Moderate — mutational hotspot, absent from controls, in trans with pathogenic variant, etc.
- **PP1–PP5** = Supporting — cosegregation, missense in low-benign-rate gene, multiple computational tools (PP3), phenotype match

**Benign evidence:**
- **BA1** = Stand-alone — allele frequency >5% in population databases
- **BS1–BS4** = Strong — allele frequency above expected, well-established functional studies show no effect, lack of segregation
- **BP1–BP7** = Supporting — missense where truncating variants are known cause, computational evidence suggests benign (BP4), synonymous variants with no splice impact

**Combining criteria (ACMG Table 5):**
- Pathogenic: ≥1 PVS1 + (≥1 PS OR ≥2 PM OR 1 PM + 1 PP OR ≥2 PP); OR ≥2 PS; etc.
- Benign: 1 BA1; OR ≥2 strong (BS)

Full standards: https://www.acmg.net/ACMG/Medical-Genetics-Practice-Resources/Genetics_Lab_Standards/

> **Important:** PP3 (multiple computational tools support deleterious) is **supporting** in-silico evidence. SpliceAI and other computational splice predictors contribute PP3 evidence — they do NOT qualify as PS3 (which requires well-established in vitro or in vivo functional studies). All in-silico tools combined count as a single PP3 criterion.

### ACMG/ClinGen CNV Classification

For constitutional copy-number variants (CNVs), use the ACMG/ClinGen semiquantitative scoring framework (Riggs et al., *Genetics in Medicine* 2020). Evidence categories include:
- Genomic content (haploinsufficiency, triplosensitivity)
- Overlap with established benign/pathogenic regions
- Case-control data and inheritance patterns

**Classification thresholds (total score):**
- ≥ 0.99 = Pathogenic
- 0.90–0.98 = Likely Pathogenic
- −0.89 to +0.89 = Uncertain Significance (VUS)
- −0.90 to −0.98 = Likely Benign
- ≤ −0.99 = Benign

Online calculator: https://cnvcalc.clinicalgenome.org/cnvcalc/

### Key Databases for Cross-Referencing

- **ClinVar** — Clinical significance of variants: https://www.ncbi.nlm.nih.gov/clinvar/
- **ClinGen** — Clinical Genome Resource for gene-disease validity and dosage sensitivity: https://clinicalgenome.org/
- **DECIPHER** — Genomic variants in rare disease: https://www.deciphergenomics.org/
- **gnomAD** — Population allele frequencies (essential for filtering common variants): https://gnomad.broadinstitute.org/
- **NCBI GEO** — Gene expression datasets for functional context: https://www.ncbi.nlm.nih.gov/geo/

### Common Pitfalls

- Do NOT rely on a single predictor — SIFT and PolyPhen-2 agree only ~70% of the time
- Always filter by population frequency (gnomAD MAF < 0.01 for rare disease)
- VUS (Variant of Uncertain Significance) should NOT be reported as pathogenic without additional evidence
- Check strand orientation when interpreting ANNOVAR output for indels
- In-silico tools together count as **one** supporting criterion (PP3/BP4) — they do not add independently

---

## Section 2: Pipeline Standards & Workflow Management

Reproducible, portable pipelines are the backbone of reliable bioinformatics. Follow community standards to ensure your workflows are shareable, scalable, and audit-ready.

### Core Frameworks & Standards Bodies

| Resource | Purpose | Source |
|----------|---------|--------|
| nf-core | Community-curated Nextflow pipelines for bioinformatics | https://nf-co.re/ |
| GA4GH | Global standards for genomic data sharing and interoperability | https://www.ga4gh.org/ |
| GATK Best Practices | Variant discovery pipeline guidelines from Broad Institute | https://gatk.broadinstitute.org/hc/en-us/categories/360002369672 |
| Seqera Containers | Reproducible, versioned containers for bioinformatics tools | https://seqera.io/containers/ |

### Core NGS Pipeline Tools

Essential command-line tools for NGS data processing:

| Tool | Purpose | Source |
|------|---------|--------|
| **FastQC** | Quality control for raw sequencing reads — reports per-base quality, GC content, adapter contamination, and duplicate rates | https://www.bioinformatics.babraham.ac.uk/projects/fastqc/ |
| **MultiQC** | Aggregates FastQC and other tool reports across multiple samples into a single HTML summary | https://multiqc.info/ |
| **BWA / BWA-MEM2** | Burrows-Wheeler Aligner — aligns short and long reads to reference genome (BWA-MEM for reads >70 bp; BWA-MEM2 for faster performance) | https://bio-bwa.sourceforge.net/ |
| **SAMtools** | Manipulates SAM/BAM/CRAM alignment files — sorting, indexing, flagstat, view, and depth commands | https://www.htslib.org/ |
| **BCFtools** | Processes VCF/BCF variant call files — mpileup variant calling, filtering, annotation, and stats | https://samtools.github.io/bcftools/ |
| **Picard** | Comprehensive toolkit for SAM/BAM manipulation — MarkDuplicates, CollectAlignmentSummaryMetrics, BuildBamIndex | https://broadinstitute.github.io/picard/ |
| **SnpEff / SnpSift** | Variant annotation and functional effect prediction; SnpSift filters and manipulates annotated VCF files | https://pcingola.github.io/SnpEff/ |
| **VEP (Ensembl Variant Effect Predictor)** | Annotates variants with gene consequence, regulatory impact, and external database cross-references | https://www.ensembl.org/vep |
| **VCFtools** | Filters and analyses VCF files — allele frequency, linkage disequilibrium, and population statistics | https://vcftools.github.io/ |
| **Trimmomatic / fastp** | Adapter trimming and quality filtering of raw FASTQ reads before alignment | https://github.com/usadellab/Trimmomatic |
| **IGSR (International Genome Sample Resource)** | Repository of publicly available human genome sequencing data including 1000 Genomes samples | https://www.internationalgenome.org/data-portal/sample |

**Standard WES/WGS pipeline order:**
```
FastQC → Trimming (optional) → BWA-MEM → SAMtools sort → Picard MarkDuplicates
→ (GATK BQSR) → BCFtools/GATK HaplotypeCaller → SnpEff/VEP annotation
→ BCFtools/population frequency filtering → ClinVar/CADD/REVEL scoring
```

### nf-core Pipeline Standards

**Before writing a pipeline, check nf-core first** — there may already be a maintained pipeline for your use case.

Key nf-core pipelines:
- `nf-core/sarek` — Germline/somatic variant calling (WGS/WES)
- `nf-core/rnaseq` — RNA-seq quantification and QC
- `nf-core/methylseq` — Bisulfite sequencing analysis
- `nf-core/chipseq` — ChIP-seq peak calling
- `nf-core/ampliseq` — 16S/ITS amplicon sequencing

**nf-core compliance checklist:**
- [ ] Use `nf-core/tools` to scaffold new pipelines (`nf-core create`)
- [ ] Pin all tool versions (no `latest` tags in production)
- [ ] Use `nf-core/configs` for institutional HPC profiles
- [ ] Include `--outdir`, `--input`, and `--genome` as standard params
- [ ] Pass `nf-core lint` before sharing

### GA4GH Standards for Data Interoperability

Apply GA4GH standards when sharing or receiving genomic data across institutions:

- **htslib/VCF spec** — Standard variant format; always validate with `bcftools stats`
- **SAM/BAM/CRAM** — Alignment formats; prefer CRAM for storage efficiency
- **GA4GH Passports** — Identity/access tokens for federated data access
- **DRS (Data Repository Service)** — Standard API for accessing genomic files across clouds
- **WES (Workflow Execution Service)** — Submit and monitor workflow runs via standard API

### GATK Best Practices Workflow

```
Germline Short Variant Discovery (WGS/WES):
1. FastQC / MultiQC → assess raw read quality
2. BWA-MEM2 → align to reference genome (GRCh38 preferred)
3. GATK MarkDuplicates → remove PCR duplicates
4. GATK BaseQualityScoreRecalibration (BQSR) → recalibrate base scores
5. GATK HaplotypeCaller → call variants per-sample (gVCF mode)
6. GATK GenomicsDBImport + GenotypeGVCFs → joint genotyping
7. VQSR (≥30 samples) or Hard Filters (<30 samples) → filter variants
8. Annotate → ANNOVAR / VEP / SnpEff
```

### Container & Reproducibility Standards

**Use Seqera Containers for tool versioning:**
- Every pipeline tool should have a pinned container image
- Prefer `docker://` or `singularity://` URIs in Nextflow configs
- Use `seqera.io/containers` to find pre-built, tested images

**Nextflow config best practices:**
```groovy
// Always pin process containers
process {
    withName: 'GATK_HAPLOTYPECALLER' {
        container = 'community.wave.seqera.io/library/gatk4:4.5.0.0'
    }
}

// Use profiles for portability
profiles {
    docker { docker.enabled = true }
    singularity { singularity.enabled = true }
    slurm { process.executor = 'slurm' }
}
```

### Common Pitfalls

- Never use `GRCh37` for new projects — use `GRCh38` (hg38) as the default reference
- Always run `FastQC` before AND after trimming — trimming can introduce bias
- Do not mix samples from different sequencing runs without batch correction
- VQSR requires ≥30 samples for reliable tranche calibration; use hard filters below that
- CRAM files require the reference genome for decoding — always store the reference alongside

### Quality Control Metrics (Minimum Thresholds)

| Metric | Minimum | Preferred |
|--------|---------|-----------|
| Mean coverage (WGS) | 30× | 50× |
| Mean coverage (WES) | 100× | 200× |
| % bases ≥ Q30 | 75% | 85% |
| Duplication rate | < 20% | < 10% |
| % on-target reads (WES) | > 70% | > 85% |
| Ti/Tv ratio (WGS) | 2.0–2.1 | 2.0–2.1 |
| Ti/Tv ratio (WES) | 2.6–3.5 | 2.8–3.3 |

---

## Section 3: Genomic Database Reference

A curated reference of essential databases for variant interpretation, population genetics, disease association, and functional genomics.

---

### Population Frequency Databases

Use population databases to filter common variants and assess allele frequencies in diverse cohorts. Variants with MAF > 1% in population databases are generally not considered causative for rare Mendelian disease.

| Database | Description | URL |
|----------|-------------|-----|
| **gnomAD** | Genome Aggregation Database — allele frequencies across >140,000 exomes and >60,000 genomes from diverse populations. Primary reference for population filtering. | https://gnomad.broadinstitute.org/ |
| **ExAC** | Exome Aggregation Consortium — predecessor to gnomAD; ~60,000 exomes. Use gnomAD v3+ for new analyses, ExAC for legacy compatibility. | https://exac.broadinstitute.org/ |
| **1000 Genomes Project** | Whole-genome sequencing of >2,500 individuals across 26 populations. Foundational reference for population structure and common variant cataloguing. | https://www.internationalgenome.org/data |
| **dbSNP** | NCBI's database of short genetic variants (SNPs and indels). Primary registry for variant identifiers (rs numbers). | https://www.ncbi.nlm.nih.gov/snp |
| **NHLBI-ESP (Exome Variant Server)** | NHLBI Exome Sequencing Project — allele frequencies from ~6,500 exomes of European and African American ancestry; focused on heart, lung, and blood disease populations. | https://evs.gs.washington.edu/EVS/ |
| **UK10K** | Whole-genome and whole-exome sequencing of 10,000 UK individuals, including rare disease and obesity cohorts. Particularly valuable for low-frequency variants in European populations. | https://www.uk10k.org/ |
| **dbVar** | NCBI database of structural variation (typically >50 bp) — large insertions, deletions, inversions, and CNVs submitted from many sources. Use for SV frequency assessment. | https://www.ncbi.nlm.nih.gov/dbvar/ |

**Filtering recommendation:** Apply gnomAD MAF < 0.01 (rare disease) or < 0.001 (ultra-rare / de novo) as the primary frequency filter before in-silico scoring.

---

### Disease & Clinical Variant Databases

| Database | Description | URL |
|----------|-------------|-----|
| **ClinVar** | NCBI's archive of human variants with clinical significance interpretations (Pathogenic, Likely Pathogenic, VUS, Benign). Always check submission review status. | https://www.ncbi.nlm.nih.gov/clinvar |
| **ClinGen** | NIH-funded Clinical Genome Resource — authoritative curations of gene–disease validity, dosage sensitivity (haploinsufficiency/triplosensitivity), and variant pathogenicity. Essential for CNV interpretation. | https://clinicalgenome.org/ |
| **OMIM** | Online Mendelian Inheritance in Man — authoritative catalogue of genes and genetic phenotypes. Essential for gene–disease association lookup. | https://www.omim.org |
| **HPO** | Human Phenotype Ontology — standardized vocabulary for human disease phenotypes. Use for phenotype-driven variant filtering and patient matching. | https://hpo.jax.org/ |
| **HGMD** | Human Gene Mutation Database — comprehensive collection of published germline mutations in human disease genes. Requires license for full access. | https://www.hgmd.cf.ac.uk/ |
| **LOVD** | Leiden Open Variation Database — open-source, freely accessible gene-centered collection of variants. Large percentage of databases built on LOVD system; check for locus-specific databases. | https://www.lovd.nl/ |
| **Orphanet** | Rare disease encyclopedia with gene–disease associations, prevalence data, and clinical summaries. Valuable for ultra-rare disease context. | https://www.orpha.net/ |
| **HGVS** | Human Genome Variation Society — curators of variant nomenclature standards and links to thousands of locus-specific databases. | https://hgvs-nomenclature.org/ |
| **COSMIC** | Catalogue of Somatic Mutations in Cancer — the world's largest expert-curated database of somatic mutations in human cancer. Essential for oncology variant interpretation. | https://cancer.sanger.ac.uk/cosmic |
| **GWAS Catalog** | EMBL-EBI and NHGRI curated catalogue of published genome-wide association studies. Provides SNP-trait associations with effect sizes and p-values for complex disease genetics. | https://www.ebi.ac.uk/gwas/ |
| **GRASP2** | Genome-Wide Repository of Associations between SNPs and Phenotypes — NHLBI catalog of GWAS results including sub-genome-wide-significant associations not captured elsewhere. | https://grasp.nhlbi.nih.gov/ |
| **Gene4Denovo** | Database of de novo mutations associated with developmental disorders; useful for trio-based WES/WGS analysis. | https://genemed.tech/gene4denovo/home |
| **DECIPHER** | Molecular cytogenetic database linking genomic microarray data with phenotype using the Ensembl genome browser. Covers CNVs and sequence variants in rare disease. | https://www.deciphergenomics.org/ |

**Usage note:** Cross-reference ClinVar and HGMD for any variant classified as VUS before reporting. Conflicting interpretations between submitters require manual review.

---

### Sequence & Reference Genome Databases

| Database | Description | URL |
|----------|-------------|-----|
| **NCBI Genome** | Central repository for reference genome sequences, assemblies, and annotations across all organisms. | https://www.ncbi.nlm.nih.gov/genome |
| **RefSeqGene** | NCBI curated reference sequences for human gene regions — the standard for variant coordinates in clinical reporting. Always use RefSeq transcript IDs (NM_/NR_) in reports. | https://www.ncbi.nlm.nih.gov/refseq/rsg |
| **Ensembl** | Genome browser and annotation database for vertebrates and other eukaryotes. Provides GENCODE transcripts, regulatory features, and cross-species comparisons. | https://www.ensembl.org/index.html |
| **LRG (Locus Reference Genomic)** | Fixed, stable reference sequences for clinically relevant genes. LRG IDs (e.g., LRG_1) provide a permanent coordinate system independent of genome build updates — preferred in clinical reports alongside RefSeq. | https://www.lrg-sequence.org/ |
| **MitoMap** | Comprehensive database of human mitochondrial DNA variation, including the revised Cambridge Reference Sequence (rCRS). Use for mitochondrial variant interpretation. | https://www.mitomap.org/MITOMAP/HumanMitoSeq |

---

### Protein Sequence & Function Databases

| Database | Description | URL |
|----------|-------------|-----|
| **UniProt** | Comprehensive resource for protein sequence and functional annotation. Use to assess domain impact of missense variants and review protein-level evidence for pathogenicity. | https://www.uniprot.org/ |

---

### Missense Variant Effect Predictors

No single predictor is sufficient. Use multiple tools and look for concordance. Conflicting predictions should increase caution about classification. All computational predictions combined contribute **one** PP3 (pathogenic supporting) or BP4 (benign supporting) criterion per ACMG guidelines.

| Tool | Description | URL |
|------|-------------|-----|
| **PolyPhen-2** | Predicts damaging effects of amino acid substitutions using sequence and structural features (score 0–1; >0.85 = probably damaging). | https://genetics.bwh.harvard.edu/pph2/ |
| **SIFT** | Sequence-based prediction of amino acid substitution tolerance (score <0.05 = damaging). Based on evolutionary conservation. | https://sift.bii.a-star.edu.sg/sift4g/ |
| **MutationTaster** | Predicts disease-causing potential using evolutionary conservation, splice-site changes, and protein features. | https://www.mutationtaster.org/ |
| **MutationAssessor** | Assesses functional impact of missense variants based on evolutionary conservation in protein families. | https://mutationassessor.org/ |
| **PROVEAN** | Predicts whether an amino acid substitution or indel affects protein function using sequence alignment scoring. | https://provean.jcvi.org/index.php |
| **InterVar** | Automated ACMG/AMP 2015 variant classification using multiple evidence sources. Outputs evidence codes (PS, PM, PP, BA, BS, BP) directly. | https://wintervar.wglab.org/ |
| **FATHMM** | Predicts functional consequences of missense variants using hidden Markov models; includes cancer-specific predictions. | https://fathmm.biocompute.org.uk/ |
| **CADD** | Combined Annotation Dependent Depletion — integrates >60 annotations into a single Phred-scaled score (C-score). CADD ≥ 20 = top 1% most deleterious variants. | https://cadd.gs.washington.edu/ |
| **AlphaMissense** | Google DeepMind deep learning model that predicts pathogenicity for all possible human missense variants using protein structure and evolutionary context. Score > 0.564 = likely pathogenic. | https://github.com/google-deepmind/alphamissense |
| **LRT (Likelihood Ratio Test)** | Identifies deleterious codons using a likelihood ratio test comparing neutral and selection models across vertebrate alignments. Included in dbNSFP. Score near 0 = deleterious. | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2752549/ |
| **MetaSVM / MetaLR** | Ensemble classifiers combining multiple missense predictors using SVM or logistic regression. Score > 0 (MetaSVM) or > 0.5 (MetaLR) = deleterious. Both available via dbNSFP. | https://sites.google.com/site/jpopgen/dbNSFP |
| **VEST4** | Variant Effect Scoring Tool — trained on disease missense mutations from ClinVar and benign variants from ESP; produces probability that variant is pathogenic (0–1). | https://karchinlab.org/apps/appVest.html |
| **GenoCanyon** | Predicts functional potential of genomic positions using unsupervised statistical learning on conservation and biochemical annotation. Applies to both coding and non-coding variants. | https://genocanyon.med.yale.edu/ |
| **Eigen / Eigen-PC** | Spectral approach combining functional annotations to score variant deleteriousness without relying on disease labels. Eigen-PC uses principal components for improved performance. | https://www.columbia.edu/~ii2135/eigen.html |
| **M-CAP** | Mendelian Clinically Applicable Pathogenicity score — optimized to minimize false positives at a clinically actionable sensitivity. Score ≥ 0.025 = pathogenic at 95% sensitivity. | https://bejerano.stanford.edu/mcap/ |
| **MutPred** | Predicts the molecular mechanism of pathogenicity for amino acid substitutions; outputs an overall pathogenicity score plus mechanistic hypotheses (e.g., loss of phosphorylation). | https://mutpred.mutdb.org/ |
| **MVP** | Missense Variant Pathogenicity score — trained on ClinVar variants with a deep residual network; optimized for clinical variant classification. | https://github.com/ShenLab/missense |
| **BayesDel** | Deleteriousness score for coding and non-coding variants using a Bayesian framework combining allele frequency, conservation, splicing, and other features. BayesDel_addAF includes allele frequency; BayesDel_noAF does not (preferred when frequency is unknown). | https://sites.google.com/site/jpopgen/dbNSFP |
| **ClinPred** | Machine learning classifier trained specifically to identify disease-relevant amino acid changes; outputs a pathogenicity probability (0–1). | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6339682/ |
| **ConSurf** | Estimates evolutionary conservation of amino acid positions based on multiple sequence alignments. High conservation score = evolutionary pressure to maintain function. | https://consurf.tau.ac.il/ |
| **PANTHER** | Predicts the likelihood of a particular nonsynonymous (amino acid) substitution to affect protein function using subPSEC scores derived from phylogenetic analysis. | https://www.pantherdb.org/tools/csnpScoreForm.jsp |
| **PhD-SNP** | Predicts the disease/neutral status of human single point mutations in proteins using support vector machines trained on structural and evolutionary features. | https://snps.biofold.org/phd-snp/phd-snp.html |
| **SNPs&GO** | Predicts single point mutations in proteins that cause disease, integrating protein sequence, functional annotation (Gene Ontology), and structural data. | https://snps-and-go.biocomp.unibo.it/snps-and-go/ |
| **Align GVGD** | Combines evolutionary conservation with biochemical variation of amino acids using Grantham variation and deviation; developed for BRCA1/BRCA2 variant classification. | https://agvgd.hci.utah.edu/ |
| **Condel** | Consensus deleteriousness score — combines FATHMM, MutationAssessor, SIFT, and PolyPhen-2 predictions into a single weighted score to reduce classifier disagreement. | https://bg.upf.edu/fannsdb/ |
| **dbNSFP** | Pre-computed functional predictions for all possible human nonsynonymous SNVs across >30 tools. Use for batch annotation rather than individual queries. | https://sites.google.com/site/jpopgen/dbNSFP |

**Recommended ensemble approach:** Require ≥3 concordant damaging predictions before treating a missense variant as likely pathogenic. Per ACMG guidelines, all in-silico predictions combined count as a single PP3 criterion.

---

### Splice Site Effect Predictors

Splice-disrupting variants are frequently pathogenic but often missed by standard missense tools. Always evaluate canonical splice sites (±1/2 bp) and cryptic splice sites.

| Tool | Description | URL |
|------|-------------|-----|
| **SpliceAI** | Deep learning tool for predicting splicing effects of variants up to 50 bp from splice junctions. Score ≥ 0.2 = likely splice-altering; ≥ 0.5 = high confidence. | https://spliceailookup.broadinstitute.org/ |
| **Human Splicing Finder (HSF)** | Comprehensive system predicting the effect of mutations on splicing signals using position-dependent logic; identifies ESEs, ESSs, branch points, and splice sites. | https://www.umd.be/HSF3/ |
| **MaxEntScan** | Scores 5' and 3' splice site sequences using maximum entropy models; widely used to assess the impact of variants on canonical splice site strength. | https://genes.mit.edu/burgelab/maxent/Xmaxentscan_scoreseq.html |
| **GeneSplicer** | Predicts splice sites using a combination of Markov models and information content; detects both donor and acceptor sites. | https://www.cbcb.umd.edu/software/GeneSplicer/ |
| **NetGene2** | Neural network-based splice site prediction for human, Arabidopsis, and C. elegans. | https://services.healthtech.dtu.dk/services/NetGene2-2.42/ |
| **NNSplice** | Neural network tool for predicting splice sites based on sequence context; covers both donor and acceptor sites in human, Drosophila, C. elegans, and Arabidopsis. | https://www.fruitfly.org/seq_tools/splice.html |
| **FSPLICE** | Species-specific splice site predictor using weight matrix models; available as part of the Softberry genomics toolkit. | https://www.softberry.com/berry.phtml?topic=fsplice&group=programs&subgroup=gfind |
| **dbscSNV** | Database of splicing consensus SNVs with pre-computed scores for all SNVs within splicing consensus regions (±2 bp). | https://www.liulab.science/dbscsnv.html |
| **SpliceRegion** | VEP plugin that annotates variants in the broader splice region (±3–8 bp from exon boundary) beyond canonical ±1/2 positions. | Available as Ensembl VEP plugin |

**Clinical practice:** For variants within 10 bp of a splice site, always run SpliceAI and at least one additional predictor. A SpliceAI score ≥ 0.5 is considered strong computational (PP3 level) evidence that a variant disrupts splicing. Confirmation with RNA-level functional studies is required to upgrade evidence to PS3 (strong functional).

---

### Evolutionary Conservation Scores

Conservation scores reflect selective pressure — highly conserved positions tolerate fewer mutations. Use as supporting evidence, not standalone proof of pathogenicity.

| Tool | Description | URL |
|------|-------------|-----|
| **GERP++** | Genomic Evolutionary Rate Profiling — estimates conservation and identifies constrained elements based on maximum likelihood evolutionary rates across vertebrate genomes. GERP RS > 2 indicates constrained positions. | https://mendel.stanford.edu/sidowlab/downloads/gerp/ |
| **PhyloP** | Measures conservation or acceleration at individual nucleotide positions using phylogenetic models. Positive scores = conserved; negative = accelerated evolution. Pre-computed scores from UCSC Genome Browser. | https://compgen.cshl.edu/phast/ |
| **PhastCons** | Estimates the probability that each nucleotide is part of a conserved element, using a phylogenetic hidden Markov model. Outputs element-level conservation (0–1), complementary to position-level PhyloP. | https://compgen.cshl.edu/phast/ |
| **SiPhy** | Identifies nucleotide positions that have undergone accelerated evolution or strong conservation across 29 mammalian genomes using a Bayesian approach; captures both rate and pattern of substitution. | https://www.broadinstitute.org/scientific-community/science/programs/genome-biology/siphy/siphy |
| **bStatistic** | Background selection statistic measuring the effect of linked negative selection; available as a per-base score in dbNSFP. Lower values indicate regions under stronger purifying selection. | https://sites.google.com/site/jpopgen/dbNSFP |

---

### Repeat & Structural Variant Databases

| Tool | Description | URL |
|------|-------------|-----|
| **RepeatMasker** | Screens DNA sequences for interspersed repeats and low-complexity regions using Repbase repeat libraries. Essential for masking repetitive regions before alignment and annotation. | https://www.repeatmasker.org/ |

---

### Gene Expression & Interaction Databases

| Database | Description | URL |
|----------|-------------|-----|
| **GTEx (Genotype-Tissue Expression)** | Portal for tissue-specific gene expression and eQTL (expression quantitative trait loci) data across 54 human tissue types. Use to assess whether a variant affects gene expression in relevant tissues. | https://gtexportal.org/ |
| **STRING** | Database and web resource of known and predicted protein–protein interaction networks. Integrates experimental data, co-expression, and text mining across >5,000 organisms. | https://string-db.org/ |
| **BioGRID** | Biological General Repository for Interaction Datasets — curated database of genetic and protein interactions from model organisms and humans; includes physical and genetic interactions. | https://thebiogrid.org/ |
| **Reactome** | Open-source, expert-curated pathway database for human biological reactions and processes. Use to contextualize variants within biological pathways and identify functional consequences. | https://reactome.org/ |
| **NCBI GEO** | Gene Expression Omnibus — public repository for microarray and sequencing-based gene expression data. Useful for identifying expression patterns of candidate genes across conditions. | https://www.ncbi.nlm.nih.gov/geo/ |

---

### Database Selection Guide

| Analysis Type | Primary Databases |
|--------------|-------------------|
| Rare disease variant filtering | gnomAD, ClinVar, OMIM, HPO |
| Missense pathogenicity | CADD, REVEL, AlphaMissense, SIFT, PolyPhen-2, InterVar |
| Splice variant assessment | SpliceAI, MaxEntScan, HSF, dbscSNV |
| CNV classification | ClinGen, DECIPHER, gnomAD SV, dbVar |
| De novo variant analysis | gnomAD, Gene4Denovo, DECIPHER |
| Population genetics | gnomAD, 1000 Genomes, ExAC, UK10K |
| Protein function | UniProt, MutationAssessor, MutPred, ConSurf |
| Somatic / oncology variants | COSMIC, ClinVar, gnomAD |
| GWAS / complex disease | GWAS Catalog, GRASP2, GTEx |
| Pathway / network analysis | Reactome, STRING, BioGRID |
| Reference coordinates | RefSeqGene, LRG, Ensembl, NCBI Genome |
| Mitochondrial variants | MitoMap, ClinVar, gnomAD |
