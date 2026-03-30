# gget Database Information

Overview of databases queried by gget modules, including update frequencies and important considerations.

## Important Note

The databases queried by gget are continuously being updated, which sometimes changes their structure. gget modules are tested automatically on a biweekly basis and updated to match new database structures when necessary. Always keep gget updated:

```bash
pip install --upgrade gget
```

## Database Directory

### Genomic Reference Databases

#### Ensembl
- **Used by:** gget ref, gget search, gget info, gget seq
- **Description:** Comprehensive genome database with annotations for vertebrate and invertebrate species
- **Update frequency:** Regular releases (numbered); new releases approximately every 3 months
- **Access:** FTP downloads, REST API
- **Website:** https://www.ensembl.org/
- **Notes:**
  - Supports both vertebrate and invertebrate genomes
  - Can specify release number for reproducibility
  - Shortcuts available for common species ('human', 'mouse')

#### UCSC Genome Browser
- **Used by:** gget blat
- **Description:** Genome browser database with BLAT alignment tool
- **Update frequency:** Regular updates with new assemblies
- **Access:** Web service API
- **Website:** https://genome.ucsc.edu/
- **Notes:**
  - Multiple genome assemblies available (hg38, mm39, etc.)
  - BLAT optimized for vertebrate genomes

### Protein & Structure Databases

#### UniProt
- **Used by:** gget info, gget seq (amino acid sequences), gget elm
- **Description:** Universal Protein Resource, comprehensive protein sequence and functional information
- **Update frequency:** Regular releases (weekly for Swiss-Prot, monthly for TrEMBL)
- **Access:** REST API
- **Website:** https://www.uniprot.org/
- **Notes:**
  - Swiss-Prot: manually annotated and reviewed
  - TrEMBL: automatically annotated

#### NCBI (National Center for Biotechnology Information)
- **Used by:** gget info, gget bgee (for non-Ensembl species)
- **Description:** Gene and protein databases with extensive cross-references
- **Update frequency:** Continuous updates
- **Access:** E-utilities API
- **Website:** https://www.ncbi.nlm.nih.gov/
- **Databases:** Gene, Protein, RefSeq

#### RCSB PDB (Protein Data Bank)
- **Used by:** gget pdb
- **Description:** Repository of 3D structural data for proteins and nucleic acids
- **Update frequency:** Weekly updates
- **Access:** REST API
- **Website:** https://www.rcsb.org/
- **Notes:**
  - Experimentally determined structures (X-ray, NMR, cryo-EM)
  - Includes metadata about experiments and publications

#### ELM (Eukaryotic Linear Motif)
- **Used by:** gget elm
- **Description:** Database of functional sites in eukaryotic proteins
- **Update frequency:** Periodic updates
- **Access:** Downloaded database (via gget setup elm)
- **Website:** http://elm.eu.org/
- **Notes:**
  - Requires local download before first use
  - Contains validated motifs and patterns

### Sequence Similarity Databases

#### BLAST Databases (NCBI)
- **Used by:** gget blast
- **Description:** Pre-formatted databases for BLAST searches
- **Update frequency:** Regular updates
- **Access:** NCBI BLAST API
- **Databases:**
  - **Nucleotide:** nt (all GenBank), refseq_rna, pdbnt
  - **Protein:** nr (non-redundant), swissprot, pdbaa, refseq_protein
- **Notes:**
  - nt and nr are very large databases
  - Consider specialized databases for faster, more focused searches

### Expression & Correlation Databases

#### ARCHS4
- **Used by:** gget archs4
- **Description:** Massive mining of publicly available RNA-seq data
- **Update frequency:** Periodic updates with new samples
- **Access:** HTTP API
- **Website:** https://maayanlab.cloud/archs4/
- **Data:**
  - Human and mouse RNA-seq data
  - Correlation matrices
  - Tissue expression atlases
- **Citation:** Lachmann et al., Nature Communications, 2018

#### CZ CELLxGENE Discover
- **Used by:** gget cellxgene
- **Description:** Single-cell RNA-seq data from multiple studies
- **Update frequency:** Continuous additions of new datasets
- **Access:** Census API (via cellxgene-census package)
- **Website:** https://cellxgene.cziscience.com/
- **Data:**
  - Single-cell RNA-seq count matrices
  - Cell type annotations
  - Tissue and disease metadata
- **Notes:**
  - Requires gget setup cellxgene
  - Gene symbols are case-sensitive
  - May not support latest Python versions

#### Bgee
- **Used by:** gget bgee
- **Description:** Gene expression and orthology database
- **Update frequency:** Regular releases
- **Access:** REST API
- **Website:** https://www.bgee.org/
- **Data:**
  - Gene expression across tissues and developmental stages
  - Orthology relationships across species
- **Citation:** Bastian et al., 2021

### Functional & Pathway Databases

#### Enrichr / modEnrichr
- **Used by:** gget enrichr
- **Description:** Gene set enrichment analysis web service
- **Update frequency:** Regular updates to underlying databases
- **Access:** REST API
- **Website:** https://maayanlab.cloud/Enrichr/
- **Databases included:**
  - KEGG pathways
  - Gene Ontology (GO)
  - Transcription factor targets (ChEA)
  - Disease associations (GWAS Catalog)
  - Cell type markers (PanglaoDB)
- **Notes:**
  - Supports multiple model organisms
  - Background gene lists can be provided for custom enrichment

### Disease & Drug Databases

#### Open Targets
- **Used by:** gget opentargets
- **Description:** Integrative platform for disease-target associations
- **Update frequency:** Regular releases (quarterly)
- **Access:** GraphQL API
- **Website:** https://www.opentargets.org/
- **Data:**
  - Disease associations
  - Drug information and clinical trials
  - Target tractability
  - Pharmacogenetics
  - Gene expression
  - DepMap gene-disease effects
  - Protein-protein interactions

#### cBioPortal
- **Used by:** gget cbio
- **Description:** Cancer genomics data portal
- **Update frequency:** Continuous addition of new studies
- **Access:** Web API, downloadable datasets
- **Website:** https://www.cbioportal.org/
- **Data:**
  - Mutations, copy number alterations, structural variants
  - Gene expression
  - Clinical data
- **Notes:**
  - Large datasets; caching recommended
  - Multiple cancer types and studies available

#### COSMIC (Catalogue Of Somatic Mutations In Cancer)
- **Used by:** gget cosmic
- **Description:** Comprehensive cancer mutation database
- **Update frequency:** Regular releases
- **Access:** Download (requires account and license for commercial use)
- **Website:** https://cancer.sanger.ac.uk/cosmic
- **Data:**
  - Somatic mutations in cancer
  - Gene census
  - Cell line data
  - Drug resistance mutations
- **Important:**
  - Free for academic use
  - License fees apply for commercial use
  - Requires COSMIC account credentials
  - Must download database before querying

### AI & Prediction Services

#### AlphaFold2 (DeepMind)
- **Used by:** gget alphafold
- **Description:** Deep learning model for protein structure prediction
- **Model version:** Simplified version for local execution
- **Access:** Local computation (requires model download via gget setup)
- **Website:** https://alphafold.ebi.ac.uk/
- **Notes:**
  - Requires ~4GB model parameters download
  - Requires OpenMM installation
  - Computationally intensive
  - Python version-specific requirements

#### OpenAI API
- **Used by:** gget gpt
- **Description:** Large language model API
- **Update frequency:** New models released periodically
- **Access:** REST API (requires API key)
- **Website:** https://openai.com/
- **Notes:**
  - Default model: gpt-3.5-turbo
  - Free tier limited to 3 months after account creation
  - Set billing limits to control costs

## Data Consistency & Reproducibility

### Version Control
To ensure reproducibility in analyses:

1. **Specify database versions/releases:**
   ```python
   # Use specific Ensembl release
   gget.ref("homo_sapiens", release=110)

   # Use specific Census version
   gget.cellxgene(gene=["PAX7"], census_version="2023-07-25")
   ```

2. **Document gget version:**
   ```python
   import gget
   print(gget.__version__)
   ```

3. **Save raw data:**
   ```python
   # Always save results for reproducibility
   results = gget.search(["ACE2"], species="homo_sapiens")
   results.to_csv("search_results_2025-01-15.csv", index=False)
   ```

### Handling Database Updates

1. **Regular gget updates:**
   - Update gget biweekly to match database structure changes
   - Check release notes for breaking changes

2. **Error handling:**
   - Database structure changes may cause temporary failures
   - Check GitHub issues: https://github.com/pachterlab/gget/issues
   - Update gget if errors occur

3. **API rate limiting:**
   - Implement delays for large-scale queries
   - Use local databases (DIAMOND, COSMIC) when possible
   - Cache results to avoid repeated queries

## Database-Specific Best Practices

### Ensembl
- Use species shortcuts ('human', 'mouse') for convenience
- Specify release numbers for reproducibility
- Check available species with `gget ref --list_species`

### UniProt
- UniProt IDs are more stable than gene names
- Swiss-Prot annotations are manually curated and more reliable
- Use PDB flag in gget info only when needed (increases runtime)

### BLAST/BLAT
- Start with default parameters, then optimize
- Use specialized databases (swissprot, refseq_protein) for focused searches
- Consider E-value cutoffs based on query length

### Expression Databases
- Gene symbols are case-sensitive in CELLxGENE
- ARCHS4 correlation data is based on co-expression patterns
- Consider tissue-specificity when interpreting results

### Cancer Databases
- cBioPortal: cache data locally for repeated analyses
- COSMIC: download appropriate database subset for your needs
- Respect license agreements for commercial use

## Citations

When using gget, cite both the gget publication and the underlying databases:

**gget:**
Luebbert, L. & Pachter, L. (2023). Efficient querying of genomic reference databases with gget. Bioinformatics. https://doi.org/10.1093/bioinformatics/btac836

**Database-specific citations:** Check references/ directory or database websites for appropriate citations.
