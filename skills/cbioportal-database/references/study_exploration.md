# cBioPortal Study Exploration Reference

## Major Study Collections

### TCGA (The Cancer Genome Atlas)

| Study ID | Cancer Type | Samples |
|----------|-------------|---------|
| `brca_tcga` | Breast Cancer | ~1,000 |
| `luad_tcga` | Lung Adenocarcinoma | ~500 |
| `lusc_tcga` | Lung Squamous Cell Carcinoma | ~500 |
| `coadread_tcga` | Colorectal Cancer | ~600 |
| `gbm_tcga` | Glioblastoma | ~600 |
| `prad_tcga` | Prostate Cancer | ~500 |
| `skcm_tcga` | Skin Cutaneous Melanoma | ~450 |
| `blca_tcga` | Bladder Urothelial Carcinoma | ~400 |
| `hnsc_tcga` | Head and Neck Squamous | ~500 |
| `lihc_tcga` | Liver Hepatocellular Carcinoma | ~370 |
| `stad_tcga` | Stomach Adenocarcinoma | ~440 |
| `ucec_tcga` | Uterine Endometrial Carcinoma | ~550 |
| `ov_tcga` | Ovarian Serous Carcinoma | ~580 |
| `kirc_tcga` | Kidney Renal Clear Cell Carcinoma | ~530 |
| `thca_tcga` | Thyroid Cancer | ~500 |
| `paad_tcga` | Pancreatic Adenocarcinoma | ~180 |
| `laml_tcga` | Acute Myeloid Leukemia | ~200 |
| `acc_tcga` | Adrenocortical Carcinoma | ~90 |

### TCGA Pan-Cancer

| Study ID | Description |
|----------|-------------|
| `tcga_pan_can_atlas_2018` | TCGA Pan-Cancer Atlas (32 cancer types, ~10K samples) |

### MSK-IMPACT (Memorial Sloan Kettering)

| Study ID | Description |
|----------|-------------|
| `msk_impact_2017` | MSK-IMPACT clinical sequencing |
| `mskcc_pd` | MSK pediatric solid tumors |

### AACR Project GENIE

| Study ID | Description |
|----------|-------------|
| `genie_14_1_public` | GENIE v14.1 (multi-center clinical sequencing) |

## Molecular Profile ID Naming Conventions

Molecular profile IDs are structured as `{studyId}_{type}`:

| Type Suffix | Alteration Type |
|-------------|----------------|
| `_mutations` | Somatic mutations (MAF) |
| `_gistic` | Copy number (GISTIC discrete: -2, -1, 0, 1, 2) |
| `_cna` | Copy number (continuous log2 ratio) |
| `_mrna` | mRNA expression (z-scores or log2) |
| `_rna_seq_v2_mrna` | RNA-seq (RSEM) |
| `_rna_seq_v2_mrna_median_Zscores` | RNA-seq z-scores relative to normals |
| `_rppa` | RPPA protein expression |
| `_rppa_Zscores` | RPPA z-scores |
| `_sv` | Structural variants/fusions |
| `_methylation_hm450` | DNA methylation (450K array) |

**Example:** For `brca_tcga`:
- `brca_tcga_mutations` — mutation data
- `brca_tcga_gistic` — CNA data
- `brca_tcga_rna_seq_v2_mrna` — RNA-seq expression

## Sample List Categories

Each study has sample lists of different subsets:

| Category | sampleListId Pattern | Contents |
|----------|---------------------|----------|
| `all_cases_in_study` | `{studyId}_all` | All samples |
| `all_cases_with_mutation_data` | `{studyId}_sequenced` | Sequenced samples only |
| `all_cases_with_cna_data` | `{studyId}_cna` | Samples with CNA data |
| `all_cases_with_mrna_data` | `{studyId}_mrna` | Samples with expression |
| `all_cases_with_rppa_data` | `{studyId}_rppa` | Samples with RPPA |
| `all_complete_cases` | `{studyId}_complete` | Complete multiplatform data |

## Common Gene Entrez IDs

| Gene | Entrez ID | Role |
|------|-----------|------|
| TP53 | 7157 | Tumor suppressor |
| PIK3CA | 5290 | Oncogene |
| KRAS | 3845 | Oncogene |
| BRCA1 | 672 | Tumor suppressor |
| BRCA2 | 675 | Tumor suppressor |
| PTEN | 5728 | Tumor suppressor |
| EGFR | 1956 | Oncogene |
| MYC | 4609 | Oncogene |
| RB1 | 5925 | Tumor suppressor |
| APC | 324 | Tumor suppressor |
| CDKN2A | 1029 | Tumor suppressor |
| IDH1 | 3417 | Oncogene (mutant) |
| BRAF | 673 | Oncogene |
| CDH1 | 999 | Tumor suppressor |
| VHL | 7428 | Tumor suppressor |

## Mutation Type Classifications

| mutationType | Description |
|-------------|-------------|
| `Missense_Mutation` | Amino acid change |
| `Nonsense_Mutation` | Premature stop codon |
| `Frame_Shift_Del` | Frameshift deletion |
| `Frame_Shift_Ins` | Frameshift insertion |
| `Splice_Site` | Splice site mutation |
| `In_Frame_Del` | In-frame deletion |
| `In_Frame_Ins` | In-frame insertion |
| `Translation_Start_Site` | Start codon mutation |
| `Nonstop_Mutation` | Stop codon mutation |
| `Silent` | Synonymous |
| `5'Flank` | 5' flanking |
| `3'UTR` | 3' UTR |

## OncoPrint Color Legend

cBioPortal uses consistent colors in OncoPrint:
- **Red**: Amplification
- **Blue (dark)**: Deep deletion
- **Green**: Missense mutation
- **Black**: Truncating mutation
- **Purple**: Fusion
- **Orange**: mRNA upregulation
- **Teal**: mRNA downregulation
