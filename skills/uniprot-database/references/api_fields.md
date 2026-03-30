# UniProt API Fields Reference

Complete list of available fields for customizing UniProt API queries. Use these fields with the `fields` parameter to retrieve only the data you need.

## Usage

Add fields parameter to your query:
```
https://rest.uniprot.org/uniprotkb/search?query=insulin&fields=accession,gene_names,organism_name,length
```

Multiple fields are comma-separated. No spaces after commas.

## Core Fields

### Identification
- `accession` - Primary accession number (e.g., P12345)
- `id` - Entry name (e.g., INSR_HUMAN)
- `uniprotkb_id` - Same as id
- `entryType` - REVIEWED (Swiss-Prot) or UNREVIEWED (TrEMBL)

### Protein Names
- `protein_name` - Recommended and alternative protein names
- `gene_names` - Gene name(s)
- `gene_primary` - Primary gene name
- `gene_synonym` - Gene synonyms
- `gene_oln` - Ordered locus names
- `gene_orf` - ORF names

### Organism Information
- `organism_name` - Organism scientific name
- `organism_id` - NCBI taxonomy identifier
- `lineage` - Taxonomic lineage
- `virus_hosts` - Virus host organisms (for viral proteins)

### Sequence Information
- `sequence` - Amino acid sequence
- `length` - Sequence length
- `mass` - Molecular mass (Daltons)
- `fragment` - Whether entry is a fragment
- `checksum` - Sequence CRC64 checksum

## Annotation Fields

### Function and Biology
- `cc_function` - Function description
- `cc_catalytic_activity` - Catalytic activity
- `cc_activity_regulation` - Activity regulation
- `cc_pathway` - Metabolic pathway information
- `cc_cofactor` - Cofactor information

### Interaction and Localization
- `cc_interaction` - Protein-protein interactions
- `cc_subunit` - Subunit structure
- `cc_subcellular_location` - Subcellular location
- `cc_tissue_specificity` - Tissue specificity
- `cc_developmental_stage` - Developmental stage expression

### Disease and Phenotype
- `cc_disease` - Disease associations
- `cc_disruption_phenotype` - Disruption phenotype
- `cc_allergen` - Allergen information
- `cc_toxic_dose` - Toxic dose information

### Post-translational Modifications
- `cc_ptm` - Post-translational modifications
- `cc_mass_spectrometry` - Mass spectrometry data

### Other Comments
- `cc_alternative_products` - Alternative products (isoforms)
- `cc_polymorphism` - Polymorphism information
- `cc_rna_editing` - RNA editing
- `cc_caution` - Caution notes
- `cc_miscellaneous` - Miscellaneous information
- `cc_similarity` - Sequence similarities
- `cc_sequence_caution` - Sequence caution
- `cc_web_resource` - Web resources

## Feature Fields (ft_)

### Molecular Processing
- `ft_signal` - Signal peptide
- `ft_transit` - Transit peptide
- `ft_init_met` - Initiator methionine
- `ft_propep` - Propeptide
- `ft_chain` - Chain (mature protein)
- `ft_peptide` - Peptide

### Regions and Sites
- `ft_domain` - Domain
- `ft_repeat` - Repeat
- `ft_ca_bind` - Calcium binding
- `ft_zn_fing` - Zinc finger
- `ft_dna_bind` - DNA binding
- `ft_np_bind` - Nucleotide binding
- `ft_region` - Region of interest
- `ft_coiled` - Coiled coil
- `ft_motif` - Short sequence motif
- `ft_compbias` - Compositional bias

### Sites and Modifications
- `ft_act_site` - Active site
- `ft_metal` - Metal binding
- `ft_binding` - Binding site
- `ft_site` - Site
- `ft_mod_res` - Modified residue
- `ft_lipid` - Lipidation
- `ft_carbohyd` - Glycosylation
- `ft_disulfid` - Disulfide bond
- `ft_crosslnk` - Cross-link

### Structural Features
- `ft_helix` - Helix
- `ft_strand` - Beta strand
- `ft_turn` - Turn
- `ft_transmem` - Transmembrane region
- `ft_intramem` - Intramembrane region
- `ft_topo_dom` - Topological domain

### Variation and Conflict
- `ft_variant` - Natural variant
- `ft_var_seq` - Alternative sequence
- `ft_mutagen` - Mutagenesis
- `ft_unsure` - Unsure residue
- `ft_conflict` - Sequence conflict
- `ft_non_cons` - Non-consecutive residues
- `ft_non_ter` - Non-terminal residue
- `ft_non_std` - Non-standard residue

## Gene Ontology (GO)

- `go` - All GO terms
- `go_p` - Biological process
- `go_c` - Cellular component
- `go_f` - Molecular function
- `go_id` - GO term identifiers

## Cross-References (xref_)

### Sequence Databases
- `xref_embl` - EMBL/GenBank/DDBJ
- `xref_refseq` - RefSeq
- `xref_ccds` - CCDS
- `xref_pir` - PIR

### 3D Structure Databases
- `xref_pdb` - Protein Data Bank
- `xref_pcddb` - PCD database
- `xref_alphafolddb` - AlphaFold database
- `xref_smr` - SWISS-MODEL Repository

### Protein Family/Domain Databases
- `xref_interpro` - InterPro
- `xref_pfam` - Pfam
- `xref_prosite` - PROSITE
- `xref_smart` - SMART

### Genome Databases
- `xref_ensembl` - Ensembl
- `xref_ensemblgenomes` - Ensembl Genomes
- `xref_geneid` - Entrez Gene
- `xref_kegg` - KEGG

### Organism-Specific Databases
- `xref_mgi` - MGI (mouse)
- `xref_rgd` - RGD (rat)
- `xref_flybase` - FlyBase (fly)
- `xref_wormbase` - WormBase (worm)
- `xref_xenbase` - Xenbase (frog)
- `xref_zfin` - ZFIN (zebrafish)

### Pathway Databases
- `xref_reactome` - Reactome
- `xref_signor` - SIGNOR
- `xref_signalink` - SignaLink

### Disease Databases
- `xref_disgenet` - DisGeNET
- `xref_malacards` - MalaCards
- `xref_omim` - OMIM
- `xref_orphanet` - Orphanet

### Drug Databases
- `xref_chembl` - ChEMBL
- `xref_drugbank` - DrugBank
- `xref_guidetopharmacology` - Guide to Pharmacology

### Expression Databases
- `xref_bgee` - Bgee
- `xref_expressionetatlas` - Expression Atlas
- `xref_genevisible` - Genevisible

## Metadata Fields

### Dates
- `date_created` - Entry creation date
- `date_modified` - Last modification date
- `date_sequence_modified` - Last sequence modification date

### Evidence and Quality
- `annotation_score` - Annotation score (1-5)
- `protein_existence` - Protein existence level
- `reviewed` - Whether entry is reviewed (Swiss-Prot)

### Literature
- `lit_pubmed_id` - PubMed identifiers
- `lit_doi` - DOI identifiers

### Proteomics
- `proteome` - Proteome identifier
- `tools` - Tools used for annotation

## Retrieving Available Fields Programmatically

Use the configuration endpoint to get all available fields:
```bash
curl https://rest.uniprot.org/configure/uniprotkb/result-fields
```

Or in Python:
```python
import requests
response = requests.get("https://rest.uniprot.org/configure/uniprotkb/result-fields")
fields = response.json()
```

## Common Field Combinations

### Basic protein information
```
fields=accession,id,protein_name,gene_names,organism_name,length
```

### Sequence and structure
```
fields=accession,sequence,length,mass,xref_pdb,xref_alphafolddb
```

### Functional annotation
```
fields=accession,protein_name,cc_function,cc_catalytic_activity,cc_pathway,go
```

### Disease information
```
fields=accession,protein_name,gene_names,cc_disease,xref_omim,xref_malacards
```

### Expression patterns
```
fields=accession,gene_names,cc_tissue_specificity,cc_developmental_stage,xref_bgee
```

### Complete annotation
```
fields=accession,id,protein_name,gene_names,organism_name,sequence,length,cc_*,ft_*,go,xref_pdb
```

## Notes

1. **Wildcards**: Some fields support wildcards (e.g., `cc_*` for all comment fields, `ft_*` for all features)

2. **Performance**: Requesting fewer fields improves response time and reduces bandwidth

3. **Format dependency**: Some fields may be formatted differently depending on output format (JSON vs TSV)

4. **Null values**: Fields without data may be omitted from response (JSON) or empty (TSV)

5. **Arrays vs strings**: In JSON format, many fields return arrays of objects rather than simple strings

## Resources

- Interactive field explorer: https://www.uniprot.org/api-documentation
- API fields endpoint: https://rest.uniprot.org/configure/uniprotkb/result-fields
- Return fields documentation: https://www.uniprot.org/help/return_fields
