# gget Workflow Examples

Extended workflow examples demonstrating how to combine multiple gget modules for common bioinformatics tasks.

## Table of Contents
1. [Complete Gene Analysis Pipeline](#complete-gene-analysis-pipeline)
2. [Comparative Structural Biology](#comparative-structural-biology)
3. [Cancer Genomics Analysis](#cancer-genomics-analysis)
4. [Single-Cell Expression Analysis](#single-cell-expression-analysis)
5. [Building Reference Transcriptomes](#building-reference-transcriptomes)
6. [Mutation Impact Assessment](#mutation-impact-assessment)
7. [Drug Target Discovery](#drug-target-discovery)

---

## Complete Gene Analysis Pipeline

Comprehensive analysis of a gene from discovery to functional annotation.

```python
import gget
import pandas as pd

# Step 1: Search for genes of interest
print("Step 1: Searching for GABA receptor genes...")
search_results = gget.search(["GABA", "receptor", "alpha"],
                             species="homo_sapiens",
                             andor="and")
print(f"Found {len(search_results)} genes")

# Step 2: Get detailed information
print("\nStep 2: Getting detailed information...")
gene_ids = search_results["ensembl_id"].tolist()[:5]  # Top 5 genes
gene_info = gget.info(gene_ids, pdb=True)
print(gene_info[["ensembl_id", "gene_name", "uniprot_id", "description"]])

# Step 3: Retrieve sequences
print("\nStep 3: Retrieving sequences...")
nucleotide_seqs = gget.seq(gene_ids)
protein_seqs = gget.seq(gene_ids, translate=True)

# Save sequences
with open("gaba_receptors_nt.fasta", "w") as f:
    f.write(nucleotide_seqs)
with open("gaba_receptors_aa.fasta", "w") as f:
    f.write(protein_seqs)

# Step 4: Get expression data
print("\nStep 4: Getting tissue expression...")
for gene_id, gene_name in zip(gene_ids, gene_info["gene_name"]):
    expr_data = gget.archs4(gene_name, which="tissue")
    print(f"\n{gene_name} expression:")
    print(expr_data.head())

# Step 5: Find correlated genes
print("\nStep 5: Finding correlated genes...")
correlated = gget.archs4(gene_info["gene_name"].iloc[0], which="correlation")
correlated_top = correlated.head(20)
print(correlated_top)

# Step 6: Enrichment analysis on correlated genes
print("\nStep 6: Performing enrichment analysis...")
gene_list = correlated_top["gene_symbol"].tolist()
enrichment = gget.enrichr(gene_list, database="ontology", plot=True)
print(enrichment.head(10))

# Step 7: Get disease associations
print("\nStep 7: Getting disease associations...")
for gene_id, gene_name in zip(gene_ids[:3], gene_info["gene_name"][:3]):
    diseases = gget.opentargets(gene_id, resource="diseases", limit=5)
    print(f"\n{gene_name} disease associations:")
    print(diseases)

# Step 8: Check for orthologs
print("\nStep 8: Finding orthologs...")
orthologs = gget.bgee(gene_ids[0], type="orthologs")
print(orthologs)

print("\nComplete gene analysis pipeline finished!")
```

---

## Comparative Structural Biology

Compare protein structures across species and analyze functional motifs.

```python
import gget

# Define genes for comparison
human_gene = "ENSG00000169174"  # PCSK9
mouse_gene = "ENSMUSG00000044254"  # Pcsk9

print("Comparative Structural Biology Workflow")
print("=" * 50)

# Step 1: Get gene information
print("\n1. Getting gene information...")
human_info = gget.info([human_gene])
mouse_info = gget.info([mouse_gene])

print(f"Human: {human_info['gene_name'].iloc[0]}")
print(f"Mouse: {mouse_info['gene_name'].iloc[0]}")

# Step 2: Retrieve protein sequences
print("\n2. Retrieving protein sequences...")
human_seq = gget.seq(human_gene, translate=True)
mouse_seq = gget.seq(mouse_gene, translate=True)

# Save to file for alignment
with open("pcsk9_sequences.fasta", "w") as f:
    f.write(human_seq)
    f.write("\n")
    f.write(mouse_seq)

# Step 3: Align sequences
print("\n3. Aligning sequences...")
alignment = gget.muscle("pcsk9_sequences.fasta")
print("Alignment completed. Visualizing in ClustalW format:")
print(alignment)

# Step 4: Get existing structures from PDB
print("\n4. Searching PDB for existing structures...")
# Search by sequence using BLAST
pdb_results = gget.blast(human_seq, database="pdbaa", limit=5)
print("Top PDB matches:")
print(pdb_results[["Description", "Max Score", "Query Coverage"]])

# Download top structure
if len(pdb_results) > 0:
    # Extract PDB ID from description (usually format: "PDB|XXXX|...")
    pdb_id = pdb_results.iloc[0]["Description"].split("|")[1]
    print(f"\nDownloading PDB structure: {pdb_id}")
    gget.pdb(pdb_id, save=True)

# Step 5: Predict AlphaFold structures
print("\n5. Predicting structures with AlphaFold...")
# Note: This requires gget setup alphafold and is computationally intensive
# Uncomment to run:
# human_structure = gget.alphafold(human_seq, plot=True)
# mouse_structure = gget.alphafold(mouse_seq, plot=True)
print("(AlphaFold prediction skipped - uncomment to run)")

# Step 6: Identify functional motifs
print("\n6. Identifying functional motifs with ELM...")
# Note: Requires gget setup elm
# Uncomment to run:
# human_ortholog_df, human_regex_df = gget.elm(human_seq)
# print("Human PCSK9 functional motifs:")
# print(human_regex_df)
print("(ELM analysis skipped - uncomment to run)")

# Step 7: Get orthology information
print("\n7. Getting orthology information from Bgee...")
orthologs = gget.bgee(human_gene, type="orthologs")
print("PCSK9 orthologs:")
print(orthologs)

print("\nComparative structural biology workflow completed!")
```

---

## Cancer Genomics Analysis

Analyze cancer-associated genes and their mutations.

```python
import gget
import matplotlib.pyplot as plt

print("Cancer Genomics Analysis Workflow")
print("=" * 50)

# Step 1: Search for cancer-related genes
print("\n1. Searching for breast cancer genes...")
genes = gget.search(["breast", "cancer", "BRCA"],
                    species="homo_sapiens",
                    andor="or",
                    limit=20)
print(f"Found {len(genes)} genes")

# Focus on specific genes
target_genes = ["BRCA1", "BRCA2", "TP53", "PIK3CA", "ESR1"]
print(f"\nAnalyzing: {', '.join(target_genes)}")

# Step 2: Get gene information
print("\n2. Getting gene information...")
gene_search = []
for gene in target_genes:
    result = gget.search([gene], species="homo_sapiens", limit=1)
    if len(result) > 0:
        gene_search.append(result.iloc[0])

gene_df = pd.DataFrame(gene_search)
gene_ids = gene_df["ensembl_id"].tolist()

# Step 3: Get disease associations
print("\n3. Getting disease associations from OpenTargets...")
for gene_id, gene_name in zip(gene_ids, target_genes):
    print(f"\n{gene_name} disease associations:")
    diseases = gget.opentargets(gene_id, resource="diseases", limit=3)
    print(diseases[["disease_name", "overall_score"]])

# Step 4: Get drug associations
print("\n4. Getting drug associations...")
for gene_id, gene_name in zip(gene_ids[:3], target_genes[:3]):
    print(f"\n{gene_name} drug associations:")
    drugs = gget.opentargets(gene_id, resource="drugs", limit=3)
    if len(drugs) > 0:
        print(drugs[["drug_name", "drug_type", "max_phase_for_all_diseases"]])

# Step 5: Search cBioPortal for studies
print("\n5. Searching cBioPortal for breast cancer studies...")
studies = gget.cbio_search(["breast", "cancer"])
print(f"Found {len(studies)} studies")
print(studies[:5])

# Step 6: Create cancer genomics heatmap
print("\n6. Creating cancer genomics heatmap...")
if len(studies) > 0:
    # Select relevant studies
    selected_studies = studies[:2]  # Top 2 studies

    gget.cbio_plot(
        selected_studies,
        target_genes,
        stratification="cancer_type",
        variation_type="mutation_occurrences",
        show=False
    )
    print("Heatmap saved to ./gget_cbio_figures/")

# Step 7: Query COSMIC database (requires setup)
print("\n7. Querying COSMIC database...")
# Note: Requires COSMIC account and database download
# Uncomment to run:
# for gene in target_genes[:2]:
#     cosmic_results = gget.cosmic(
#         gene,
#         cosmic_tsv_path="cosmic_cancer.tsv",
#         limit=10
#     )
#     print(f"\n{gene} mutations in COSMIC:")
#     print(cosmic_results)
print("(COSMIC query skipped - requires database download)")

# Step 8: Enrichment analysis
print("\n8. Performing pathway enrichment...")
enrichment = gget.enrichr(target_genes, database="pathway", plot=True)
print("\nTop enriched pathways:")
print(enrichment.head(10))

print("\nCancer genomics analysis completed!")
```

---

## Single-Cell Expression Analysis

Analyze single-cell RNA-seq data for specific cell types and tissues.

```python
import gget
import scanpy as sc

print("Single-Cell Expression Analysis Workflow")
print("=" * 50)

# Note: Requires gget setup cellxgene

# Step 1: Define genes and cell types of interest
genes_of_interest = ["ACE2", "TMPRSS2", "CD4", "CD8A"]
tissue = "lung"
cell_types = ["type ii pneumocyte", "macrophage", "t cell"]

print(f"\nAnalyzing genes: {', '.join(genes_of_interest)}")
print(f"Tissue: {tissue}")
print(f"Cell types: {', '.join(cell_types)}")

# Step 2: Get metadata first
print("\n1. Retrieving metadata...")
metadata = gget.cellxgene(
    gene=genes_of_interest,
    tissue=tissue,
    species="homo_sapiens",
    meta_only=True
)
print(f"Found {len(metadata)} datasets")
print(metadata.head())

# Step 3: Download count matrices
print("\n2. Downloading single-cell data...")
# Note: This can be a large download
adata = gget.cellxgene(
    gene=genes_of_interest,
    tissue=tissue,
    species="homo_sapiens",
    census_version="stable"
)
print(f"AnnData shape: {adata.shape}")
print(f"Genes: {adata.n_vars}")
print(f"Cells: {adata.n_obs}")

# Step 4: Basic QC and filtering with scanpy
print("\n3. Performing quality control...")
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
print(f"After QC - Cells: {adata.n_obs}, Genes: {adata.n_vars}")

# Step 5: Normalize and log-transform
print("\n4. Normalizing data...")
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# Step 6: Calculate gene expression statistics
print("\n5. Calculating expression statistics...")
for gene in genes_of_interest:
    if gene in adata.var_names:
        expr = adata[:, gene].X.toarray().flatten()
        print(f"\n{gene} expression:")
        print(f"  Mean: {expr.mean():.3f}")
        print(f"  Median: {np.median(expr):.3f}")
        print(f"  % expressing: {(expr > 0).sum() / len(expr) * 100:.1f}%")

# Step 7: Get tissue expression from ARCHS4 for comparison
print("\n6. Getting bulk tissue expression from ARCHS4...")
for gene in genes_of_interest:
    tissue_expr = gget.archs4(gene, which="tissue")
    lung_expr = tissue_expr[tissue_expr["tissue"] == "lung"]
    if len(lung_expr) > 0:
        print(f"\n{gene} in lung (ARCHS4):")
        print(f"  Median: {lung_expr['median'].iloc[0]:.3f}")

# Step 8: Enrichment analysis
print("\n7. Performing enrichment analysis...")
enrichment = gget.enrichr(genes_of_interest, database="celltypes", plot=True)
print("\nTop cell type associations:")
print(enrichment.head(10))

# Step 9: Get disease associations
print("\n8. Getting disease associations...")
for gene in genes_of_interest:
    gene_search = gget.search([gene], species="homo_sapiens", limit=1)
    if len(gene_search) > 0:
        gene_id = gene_search["ensembl_id"].iloc[0]
        diseases = gget.opentargets(gene_id, resource="diseases", limit=3)
        print(f"\n{gene} disease associations:")
        print(diseases[["disease_name", "overall_score"]])

print("\nSingle-cell expression analysis completed!")
```

---

## Building Reference Transcriptomes

Prepare reference data for RNA-seq analysis pipelines.

```bash
#!/bin/bash
# Reference transcriptome building workflow

echo "Reference Transcriptome Building Workflow"
echo "=========================================="

# Step 1: List available species
echo -e "\n1. Listing available species..."
gget ref --list_species > available_species.txt
echo "Available species saved to available_species.txt"

# Step 2: Download reference files for human
echo -e "\n2. Downloading human reference files..."
SPECIES="homo_sapiens"
RELEASE=110  # Specify release for reproducibility

# Download GTF annotation
echo "Downloading GTF annotation..."
gget ref -w gtf -r $RELEASE -d $SPECIES -o human_ref_gtf.json

# Download cDNA sequences
echo "Downloading cDNA sequences..."
gget ref -w cdna -r $RELEASE -d $SPECIES -o human_ref_cdna.json

# Download protein sequences
echo "Downloading protein sequences..."
gget ref -w pep -r $RELEASE -d $SPECIES -o human_ref_pep.json

# Step 3: Build kallisto index (if kallisto is installed)
echo -e "\n3. Building kallisto index..."
if command -v kallisto &> /dev/null; then
    # Get cDNA FASTA file from download
    CDNA_FILE=$(ls *.cdna.all.fa.gz)
    if [ -f "$CDNA_FILE" ]; then
        kallisto index -i transcriptome.idx $CDNA_FILE
        echo "Kallisto index created: transcriptome.idx"
    else
        echo "cDNA FASTA file not found"
    fi
else
    echo "kallisto not installed, skipping index building"
fi

# Step 4: Download genome for alignment-based methods
echo -e "\n4. Downloading genome sequence..."
gget ref -w dna -r $RELEASE -d $SPECIES -o human_ref_dna.json

# Step 5: Get gene information for genes of interest
echo -e "\n5. Getting information for specific genes..."
gget search -s $SPECIES "TP53 BRCA1 BRCA2" -o key_genes.csv

echo -e "\nReference transcriptome building completed!"
```

```python
# Python version
import gget
import json

print("Reference Transcriptome Building Workflow")
print("=" * 50)

# Configuration
species = "homo_sapiens"
release = 110
genes_of_interest = ["TP53", "BRCA1", "BRCA2", "MYC", "EGFR"]

# Step 1: Get reference information
print("\n1. Getting reference information...")
ref_info = gget.ref(species, release=release)

# Save reference information
with open("reference_info.json", "w") as f:
    json.dump(ref_info, f, indent=2)
print("Reference information saved to reference_info.json")

# Step 2: Download specific files
print("\n2. Downloading reference files...")
# GTF annotation
gget.ref(species, which="gtf", release=release, download=True)
# cDNA sequences
gget.ref(species, which="cdna", release=release, download=True)

# Step 3: Get information for genes of interest
print(f"\n3. Getting information for {len(genes_of_interest)} genes...")
gene_data = []
for gene in genes_of_interest:
    result = gget.search([gene], species=species, limit=1)
    if len(result) > 0:
        gene_data.append(result.iloc[0])

# Get detailed info
if gene_data:
    gene_ids = [g["ensembl_id"] for g in gene_data]
    detailed_info = gget.info(gene_ids)
    detailed_info.to_csv("genes_of_interest_info.csv", index=False)
    print("Gene information saved to genes_of_interest_info.csv")

# Step 4: Get sequences
print("\n4. Retrieving sequences...")
sequences_nt = gget.seq(gene_ids)
sequences_aa = gget.seq(gene_ids, translate=True)

with open("key_genes_nucleotide.fasta", "w") as f:
    f.write(sequences_nt)
with open("key_genes_protein.fasta", "w") as f:
    f.write(sequences_aa)

print("\nReference transcriptome building completed!")
print(f"Files created:")
print("  - reference_info.json")
print("  - genes_of_interest_info.csv")
print("  - key_genes_nucleotide.fasta")
print("  - key_genes_protein.fasta")
```

---

## Mutation Impact Assessment

Analyze the impact of genetic mutations on protein structure and function.

```python
import gget
import pandas as pd

print("Mutation Impact Assessment Workflow")
print("=" * 50)

# Define mutations to analyze
mutations = [
    {"gene": "TP53", "mutation": "c.818G>A", "description": "R273H hotspot"},
    {"gene": "EGFR", "mutation": "c.2573T>G", "description": "L858R activating"},
]

# Step 1: Get gene information
print("\n1. Getting gene information...")
for mut in mutations:
    results = gget.search([mut["gene"]], species="homo_sapiens", limit=1)
    if len(results) > 0:
        mut["ensembl_id"] = results["ensembl_id"].iloc[0]
        print(f"{mut['gene']}: {mut['ensembl_id']}")

# Step 2: Get sequences
print("\n2. Retrieving wild-type sequences...")
for mut in mutations:
    # Get nucleotide sequence
    nt_seq = gget.seq(mut["ensembl_id"])
    mut["wt_sequence"] = nt_seq

    # Get protein sequence
    aa_seq = gget.seq(mut["ensembl_id"], translate=True)
    mut["wt_protein"] = aa_seq

# Step 3: Generate mutated sequences
print("\n3. Generating mutated sequences...")
# Create mutation dataframe for gget mutate
mut_df = pd.DataFrame({
    "seq_ID": [m["gene"] for m in mutations],
    "mutation": [m["mutation"] for m in mutations]
})

# For each mutation
for mut in mutations:
    # Extract sequence from FASTA
    lines = mut["wt_sequence"].split("\n")
    seq = "".join(lines[1:])

    # Create single mutation df
    single_mut = pd.DataFrame({
        "seq_ID": [mut["gene"]],
        "mutation": [mut["mutation"]]
    })

    # Generate mutated sequence
    mutated = gget.mutate([seq], mutations=single_mut)
    mut["mutated_sequence"] = mutated

print("Mutated sequences generated")

# Step 4: Get existing structure information
print("\n4. Getting structure information...")
for mut in mutations:
    # Get info with PDB IDs
    info = gget.info([mut["ensembl_id"]], pdb=True)

    if "pdb_id" in info.columns and pd.notna(info["pdb_id"].iloc[0]):
        pdb_ids = info["pdb_id"].iloc[0].split(";")
        print(f"\n{mut['gene']} PDB structures: {', '.join(pdb_ids[:3])}")

        # Download first structure
        if len(pdb_ids) > 0:
            pdb_id = pdb_ids[0].strip()
            mut["pdb_id"] = pdb_id
            gget.pdb(pdb_id, save=True)
    else:
        print(f"\n{mut['gene']}: No PDB structure available")
        mut["pdb_id"] = None

# Step 5: Predict structures with AlphaFold (optional)
print("\n5. Predicting structures with AlphaFold...")
# Note: Requires gget setup alphafold and is computationally intensive
# Uncomment to run:
# for mut in mutations:
#     print(f"Predicting {mut['gene']} wild-type structure...")
#     wt_structure = gget.alphafold(mut["wt_protein"])
#
#     print(f"Predicting {mut['gene']} mutant structure...")
#     # Would need to translate mutated sequence first
#     # mutant_structure = gget.alphafold(mutated_protein)
print("(AlphaFold prediction skipped - uncomment to run)")

# Step 6: Find functional motifs
print("\n6. Identifying functional motifs...")
# Note: Requires gget setup elm
# Uncomment to run:
# for mut in mutations:
#     ortholog_df, regex_df = gget.elm(mut["wt_protein"])
#     print(f"\n{mut['gene']} functional motifs:")
#     print(regex_df)
print("(ELM analysis skipped - uncomment to run)")

# Step 7: Get disease associations
print("\n7. Getting disease associations...")
for mut in mutations:
    diseases = gget.opentargets(
        mut["ensembl_id"],
        resource="diseases",
        limit=5
    )
    print(f"\n{mut['gene']} ({mut['description']}) disease associations:")
    print(diseases[["disease_name", "overall_score"]])

# Step 8: Query COSMIC for mutation frequency
print("\n8. Querying COSMIC database...")
# Note: Requires COSMIC database download
# Uncomment to run:
# for mut in mutations:
#     cosmic_results = gget.cosmic(
#         mut["mutation"],
#         cosmic_tsv_path="cosmic_cancer.tsv",
#         limit=10
#     )
#     print(f"\n{mut['gene']} {mut['mutation']} in COSMIC:")
#     print(cosmic_results)
print("(COSMIC query skipped - requires database download)")

print("\nMutation impact assessment completed!")
```

---

## Drug Target Discovery

Identify and validate potential drug targets for specific diseases.

```python
import gget
import pandas as pd

print("Drug Target Discovery Workflow")
print("=" * 50)

# Step 1: Search for disease-related genes
disease = "alzheimer"
print(f"\n1. Searching for {disease} disease genes...")
genes = gget.search([disease], species="homo_sapiens", limit=50)
print(f"Found {len(genes)} potential genes")

# Step 2: Get detailed information
print("\n2. Getting detailed gene information...")
gene_ids = genes["ensembl_id"].tolist()[:20]  # Top 20
gene_info = gget.info(gene_ids[:10])  # Limit to avoid timeout

# Step 3: Get disease associations from OpenTargets
print("\n3. Getting disease associations...")
disease_scores = []
for gene_id, gene_name in zip(gene_info["ensembl_id"], gene_info["gene_name"]):
    diseases = gget.opentargets(gene_id, resource="diseases", limit=10)

    # Filter for Alzheimer's disease
    alzheimer = diseases[diseases["disease_name"].str.contains("Alzheimer", case=False, na=False)]

    if len(alzheimer) > 0:
        disease_scores.append({
            "ensembl_id": gene_id,
            "gene_name": gene_name,
            "disease_score": alzheimer["overall_score"].max()
        })

disease_df = pd.DataFrame(disease_scores).sort_values("disease_score", ascending=False)
print("\nTop disease-associated genes:")
print(disease_df.head(10))

# Step 4: Get tractability information
print("\n4. Assessing target tractability...")
top_targets = disease_df.head(5)
for _, row in top_targets.iterrows():
    tractability = gget.opentargets(
        row["ensembl_id"],
        resource="tractability"
    )
    print(f"\n{row['gene_name']} tractability:")
    print(tractability)

# Step 5: Get expression data
print("\n5. Getting tissue expression data...")
for _, row in top_targets.iterrows():
    # Brain expression from OpenTargets
    expression = gget.opentargets(
        row["ensembl_id"],
        resource="expression",
        filter_tissue="brain"
    )
    print(f"\n{row['gene_name']} brain expression:")
    print(expression)

    # Tissue expression from ARCHS4
    tissue_expr = gget.archs4(row["gene_name"], which="tissue")
    brain_expr = tissue_expr[tissue_expr["tissue"].str.contains("brain", case=False, na=False)]
    print(f"ARCHS4 brain expression:")
    print(brain_expr)

# Step 6: Check for existing drugs
print("\n6. Checking for existing drugs...")
for _, row in top_targets.iterrows():
    drugs = gget.opentargets(row["ensembl_id"], resource="drugs", limit=5)
    print(f"\n{row['gene_name']} drug associations:")
    if len(drugs) > 0:
        print(drugs[["drug_name", "drug_type", "max_phase_for_all_diseases"]])
    else:
        print("No drugs found")

# Step 7: Get protein-protein interactions
print("\n7. Getting protein-protein interactions...")
for _, row in top_targets.iterrows():
    interactions = gget.opentargets(
        row["ensembl_id"],
        resource="interactions",
        limit=10
    )
    print(f"\n{row['gene_name']} interacts with:")
    if len(interactions) > 0:
        print(interactions[["gene_b_symbol", "interaction_score"]])

# Step 8: Enrichment analysis
print("\n8. Performing pathway enrichment...")
gene_list = top_targets["gene_name"].tolist()
enrichment = gget.enrichr(gene_list, database="pathway", plot=True)
print("\nTop enriched pathways:")
print(enrichment.head(10))

# Step 9: Get structure information
print("\n9. Getting structure information...")
for _, row in top_targets.iterrows():
    info = gget.info([row["ensembl_id"]], pdb=True)

    if "pdb_id" in info.columns and pd.notna(info["pdb_id"].iloc[0]):
        pdb_ids = info["pdb_id"].iloc[0].split(";")
        print(f"\n{row['gene_name']} PDB structures: {', '.join(pdb_ids[:3])}")
    else:
        print(f"\n{row['gene_name']}: No PDB structure available")
        # Could predict with AlphaFold
        print(f"  Consider AlphaFold prediction")

# Step 10: Generate target summary report
print("\n10. Generating target summary report...")
report = []
for _, row in top_targets.iterrows():
    report.append({
        "Gene": row["gene_name"],
        "Ensembl ID": row["ensembl_id"],
        "Disease Score": row["disease_score"],
        "Target Status": "High Priority"
    })

report_df = pd.DataFrame(report)
report_df.to_csv("drug_targets_report.csv", index=False)
print("\nTarget report saved to drug_targets_report.csv")

print("\nDrug target discovery workflow completed!")
```

---

## Tips for Workflow Development

### Error Handling
```python
import gget

def safe_gget_call(func, *args, **kwargs):
    """Wrapper for gget calls with error handling"""
    try:
        result = func(*args, **kwargs)
        return result
    except Exception as e:
        print(f"Error in {func.__name__}: {str(e)}")
        return None

# Usage
result = safe_gget_call(gget.search, ["ACE2"], species="homo_sapiens")
if result is not None:
    print(result)
```

### Rate Limiting
```python
import time
import gget

def rate_limited_queries(gene_ids, delay=1):
    """Query multiple genes with rate limiting"""
    results = []
    for i, gene_id in enumerate(gene_ids):
        print(f"Querying {i+1}/{len(gene_ids)}: {gene_id}")
        result = gget.info([gene_id])
        results.append(result)

        if i < len(gene_ids) - 1:  # Don't sleep after last query
            time.sleep(delay)

    return pd.concat(results, ignore_index=True)
```

### Caching Results
```python
import os
import pickle
import gget

def cached_gget(cache_file, func, *args, **kwargs):
    """Cache gget results to avoid repeated queries"""
    if os.path.exists(cache_file):
        print(f"Loading from cache: {cache_file}")
        with open(cache_file, "rb") as f:
            return pickle.load(f)

    result = func(*args, **kwargs)

    with open(cache_file, "wb") as f:
        pickle.dump(result, f)
    print(f"Saved to cache: {cache_file}")

    return result

# Usage
result = cached_gget("ace2_info.pkl", gget.info, ["ENSG00000130234"])
```

---

These workflows demonstrate how to combine multiple gget modules for comprehensive bioinformatics analyses. Adapt them to your specific research questions and data types.
