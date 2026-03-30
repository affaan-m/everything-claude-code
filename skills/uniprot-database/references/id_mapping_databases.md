# UniProt ID Mapping Databases

Complete list of databases supported by the UniProt ID Mapping service. Use these database names when calling the ID mapping API.

## Retrieving Database List Programmatically

```python
import requests
response = requests.get("https://rest.uniprot.org/configure/idmapping/fields")
databases = response.json()
```

## UniProt Databases

### UniProtKB
- `UniProtKB_AC-ID` - UniProt accession and ID
- `UniProtKB` - UniProt Knowledgebase
- `UniProtKB-Swiss-Prot` - Reviewed (Swiss-Prot)
- `UniProtKB-TrEMBL` - Unreviewed (TrEMBL)
- `UniParc` - UniProt Archive
- `UniRef50` - UniRef 50% identity clusters
- `UniRef90` - UniRef 90% identity clusters
- `UniRef100` - UniRef 100% identity clusters

## Sequence Databases

### Nucleotide Sequence
- `EMBL` - EMBL/GenBank/DDBJ
- `EMBL-CDS` - EMBL coding sequences
- `RefSeq_Nucleotide` - RefSeq nucleotide sequences
- `CCDS` - Consensus CDS

### Protein Sequence
- `RefSeq_Protein` - RefSeq protein sequences
- `PIR` - Protein Information Resource

## Gene Databases

- `GeneID` - Entrez Gene
- `Gene_Name` - Gene name
- `Gene_Synonym` - Gene synonym
- `Gene_OrderedLocusName` - Ordered locus name
- `Gene_ORFName` - ORF name

## Genome Databases

### General
- `Ensembl` - Ensembl
- `EnsemblGenomes` - Ensembl Genomes
- `EnsemblGenomes_PRO` - Ensembl Genomes protein
- `EnsemblGenomes_TRS` - Ensembl Genomes transcript
- `Ensembl_PRO` - Ensembl protein
- `Ensembl_TRS` - Ensembl transcript

### Organism-Specific
- `KEGG` - KEGG Genes
- `PATRIC` - PATRIC
- `UCSC` - UCSC Genome Browser
- `VectorBase` - VectorBase
- `WBParaSite` - WormBase ParaSite

## Structure Databases

- `PDB` - Protein Data Bank
- `AlphaFoldDB` - AlphaFold Database
- `BMRB` - Biological Magnetic Resonance Data Bank
- `PDBsum` - PDB summary
- `SASBDB` - Small Angle Scattering Biological Data Bank
- `SMR` - SWISS-MODEL Repository

## Protein Family and Domain Databases

- `InterPro` - InterPro
- `Pfam` - Pfam protein families
- `PROSITE` - PROSITE
- `SMART` - SMART domains
- `CDD` - Conserved Domain Database
- `HAMAP` - HAMAP
- `PANTHER` - PANTHER
- `PRINTS` - PRINTS
- `ProDom` - ProDom
- `SFLD` - Structure-Function Linkage Database
- `SUPFAM` - SUPERFAMILY
- `TIGRFAMs` - TIGRFAMs

## Organism-Specific Databases

### Model Organisms
- `MGI` - Mouse Genome Informatics
- `RGD` - Rat Genome Database
- `FlyBase` - FlyBase (Drosophila)
- `WormBase` - WormBase (C. elegans)
- `Xenbase` - Xenbase (Xenopus)
- `ZFIN` - Zebrafish Information Network
- `dictyBase` - dictyBase (Dictyostelium)
- `EcoGene` - EcoGene (E. coli)
- `SGD` - Saccharomyces Genome Database (yeast)
- `PomBase` - PomBase (S. pombe)
- `TAIR` - The Arabidopsis Information Resource

### Human-Specific
- `HGNC` - HUGO Gene Nomenclature Committee
- `CCDS` - Consensus Coding Sequence Database

## Pathway Databases

- `Reactome` - Reactome
- `BioCyc` - BioCyc
- `PlantReactome` - Plant Reactome
- `SIGNOR` - SIGNOR
- `SignaLink` - SignaLink

## Enzyme and Metabolism

- `EC` - Enzyme Commission number
- `BRENDA` - BRENDA enzyme database
- `SABIO-RK` - SABIO-RK (biochemical reactions)
- `MetaCyc` - MetaCyc

## Disease and Phenotype Databases

- `OMIM` - Online Mendelian Inheritance in Man
- `MIM` - MIM (same as OMIM)
- `OrphaNet` - Orphanet (rare diseases)
- `DisGeNET` - DisGeNET
- `MalaCards` - MalaCards
- `CTD` - Comparative Toxicogenomics Database
- `OpenTargets` - Open Targets

## Drug and Chemical Databases

- `ChEMBL` - ChEMBL
- `DrugBank` - DrugBank
- `DrugCentral` - DrugCentral
- `GuidetoPHARMACOLOGY` - Guide to Pharmacology
- `SwissLipids` - SwissLipids

## Gene Expression Databases

- `Bgee` - Bgee gene expression
- `ExpressionAtlas` - Expression Atlas
- `Genevisible` - Genevisible
- `CleanEx` - CleanEx

## Proteomics Databases

- `PRIDE` - PRIDE proteomics
- `PeptideAtlas` - PeptideAtlas
- `ProteomicsDB` - ProteomicsDB
- `CPTAC` - CPTAC
- `jPOST` - jPOST
- `MassIVE` - MassIVE
- `MaxQB` - MaxQB
- `PaxDb` - PaxDb
- `TopDownProteomics` - Top Down Proteomics

## Protein-Protein Interaction

- `STRING` - STRING
- `BioGRID` - BioGRID
- `IntAct` - IntAct
- `MINT` - MINT
- `DIP` - Database of Interacting Proteins
- `ComplexPortal` - Complex Portal

## Ontologies

- `GO` - Gene Ontology
- `GeneTree` - Ensembl GeneTree
- `HOGENOM` - HOGENOM
- `HOVERGEN` - HOVERGEN
- `KO` - KEGG Orthology
- `OMA` - OMA orthology
- `OrthoDB` - OrthoDB
- `TreeFam` - TreeFam

## Other Specialized Databases

### Glycosylation
- `GlyConnect` - GlyConnect
- `GlyGen` - GlyGen

### Protein Modifications
- `PhosphoSitePlus` - PhosphoSitePlus
- `iPTMnet` - iPTMnet

### Antibodies
- `Antibodypedia` - Antibodypedia
- `DNASU` - DNASU

### Protein Localization
- `COMPARTMENTS` - COMPARTMENTS
- `NeXtProt` - NeXtProt (human proteins)

### Evolution and Phylogeny
- `eggNOG` - eggNOG
- `GeneTree` - Ensembl GeneTree
- `InParanoid` - InParanoid

### Technical Resources
- `PRO` - Protein Ontology
- `GenomeRNAi` - GenomeRNAi
- `PubMed` - PubMed literature references

## Common Mapping Scenarios

### Example 1: UniProt to PDB
```python
from_db = "UniProtKB_AC-ID"
to_db = "PDB"
ids = ["P01308", "P04637"]
```

### Example 2: Gene Name to UniProt
```python
from_db = "Gene_Name"
to_db = "UniProtKB"
ids = ["BRCA1", "TP53", "INSR"]
```

### Example 3: UniProt to Ensembl
```python
from_db = "UniProtKB_AC-ID"
to_db = "Ensembl"
ids = ["P12345"]
```

### Example 4: RefSeq to UniProt
```python
from_db = "RefSeq_Protein"
to_db = "UniProtKB"
ids = ["NP_000207.1"]
```

### Example 5: UniProt to GO Terms
```python
from_db = "UniProtKB_AC-ID"
to_db = "GO"
ids = ["P01308"]
```

## Usage Notes

1. **Database names are case-sensitive**: Use exact names as listed

2. **Many-to-many mappings**: One ID may map to multiple target IDs

3. **Failed mappings**: Some IDs may not have mappings; check the `failedIds` field in results

4. **Batch size limit**: Maximum 100,000 IDs per job

5. **Result expiration**: Results are stored for 7 days

6. **Bidirectional mapping**: Most databases support mapping in both directions

## API Endpoints

### Get available databases
```
GET https://rest.uniprot.org/configure/idmapping/fields
```

### Submit mapping job
```
POST https://rest.uniprot.org/idmapping/run
Content-Type: application/x-www-form-urlencoded

from={from_db}&to={to_db}&ids={comma_separated_ids}
```

### Check job status
```
GET https://rest.uniprot.org/idmapping/status/{jobId}
```

### Get results
```
GET https://rest.uniprot.org/idmapping/results/{jobId}
```

## Resources

- ID Mapping tool: https://www.uniprot.org/id-mapping
- API documentation: https://www.uniprot.org/help/id_mapping
- Programmatic access: https://www.uniprot.org/help/api_idmapping
