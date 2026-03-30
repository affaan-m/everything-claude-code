# Ensembl REST API Endpoints Reference

Comprehensive documentation of all 17 API endpoint categories available in the Ensembl REST API (Release 115, September 2025).

**Base URLs:**
- Current assemblies: `https://rest.ensembl.org`
- GRCh37/hg19 (human): `https://grch37.rest.ensembl.org`

**Rate Limits:**
- Anonymous: 15 requests/second
- Registered: 55,000 requests/hour

## 1. Archive

Retrieve historical information about retired Ensembl identifiers.

**GET /archive/id/:id**
- Retrieve archived entries for a retired identifier
- Example: `/archive/id/ENSG00000157764` (retired gene ID)

## 2. Comparative Genomics

Access gene trees, genomic alignments, and homology data across species.

**GET /alignment/region/:species/:region**
- Get genomic alignments for a region
- Example: `/alignment/region/human/2:106040000-106040050:1?species_set_group=mammals`

**GET /genetree/id/:id**
- Retrieve gene tree for a gene family
- Example: `/genetree/id/ENSGT00390000003602`

**GET /genetree/member/id/:id**
- Get gene tree by member gene ID
- Example: `/genetree/member/id/ENSG00000139618`

**GET /homology/id/:id**
- Find orthologs and paralogs for a gene
- Parameters: `target_species`, `type` (orthologues, paralogues, all)
- Example: `/homology/id/ENSG00000139618?target_species=mouse`

**GET /homology/symbol/:species/:symbol**
- Find homologs by gene symbol
- Example: `/homology/symbol/human/BRCA2?target_species=mouse`

## 3. Cross References

Link external database identifiers to Ensembl objects.

**GET /xrefs/id/:id**
- Get external references for Ensembl ID
- Example: `/xrefs/id/ENSG00000139618`

**GET /xrefs/symbol/:species/:symbol**
- Get cross-references by gene symbol
- Example: `/xrefs/symbol/human/BRCA2`

**GET /xrefs/name/:species/:name**
- Search for objects by external name
- Example: `/xrefs/name/human/NP_000050`

## 4. Information

Query metadata about species, assemblies, biotypes, and database versions.

**GET /info/species**
- List all available species
- Returns species names, assemblies, taxonomy IDs

**GET /info/assembly/:species**
- Get assembly information for a species
- Example: `/info/assembly/human` (returns GRCh38.p14)

**GET /info/assembly/:species/:region**
- Get detailed information about a chromosomal region
- Example: `/info/assembly/human/X`

**GET /info/biotypes/:species**
- List all available biotypes (gene types)
- Example: `/info/biotypes/human`

**GET /info/analysis/:species**
- List available analysis types
- Example: `/info/analysis/human`

**GET /info/data**
- Get general information about the current Ensembl release

## 5. Linkage Disequilibrium (LD)

Calculate linkage disequilibrium between variants.

**GET /ld/:species/:id/:population_name**
- Calculate LD for a variant
- Example: `/ld/human/rs1042522/1000GENOMES:phase_3:KHV`

**GET /ld/pairwise/:species/:id1/:id2**
- Calculate LD between two variants
- Example: `/ld/pairwise/human/rs1042522/rs11540652`

## 6. Lookup

Identify species and database information for identifiers.

**GET /lookup/id/:id**
- Look up object by Ensembl ID
- Parameter: `expand` (include child objects)
- Example: `/lookup/id/ENSG00000139618?expand=1`

**POST /lookup/id**
- Batch lookup multiple IDs
- Submit JSON array of IDs
- Example: `{"ids": ["ENSG00000139618", "ENSG00000157764"]}`

**GET /lookup/symbol/:species/:symbol**
- Look up gene by symbol
- Parameter: `expand` (include transcripts)
- Example: `/lookup/symbol/human/BRCA2?expand=1`

## 7. Mapping

Convert coordinates between assemblies, cDNA, CDS, and protein positions.

**GET /map/cdna/:id/:region**
- Map cDNA coordinates to genomic
- Example: `/map/cdna/ENST00000288602/100..300`

**GET /map/cds/:id/:region**
- Map CDS coordinates to genomic
- Example: `/map/cds/ENST00000288602/1..300`

**GET /map/translation/:id/:region**
- Map protein coordinates to genomic
- Example: `/map/translation/ENSP00000288602/1..100`

**GET /map/:species/:asm_one/:region/:asm_two**
- Map coordinates between assemblies
- Example: `/map/human/GRCh37/7:140453136..140453136/GRCh38`

**POST /map/:species/:asm_one/:asm_two**
- Batch assembly mapping
- Submit JSON array of regions

## 8. Ontologies and Taxonomy

Search biological ontologies and taxonomic classifications.

**GET /ontology/id/:id**
- Get ontology term information
- Example: `/ontology/id/GO:0005515`

**GET /ontology/name/:name**
- Search ontology by term name
- Example: `/ontology/name/protein%20binding`

**GET /taxonomy/classification/:id**
- Get taxonomic classification
- Example: `/taxonomy/classification/9606` (human)

**GET /taxonomy/id/:id**
- Get taxonomy information by ID
- Example: `/taxonomy/id/9606`

## 9. Overlap

Find genomic features overlapping a region.

**GET /overlap/id/:id**
- Get features overlapping a gene/transcript
- Parameters: `feature` (gene, transcript, cds, exon, repeat, etc.)
- Example: `/overlap/id/ENSG00000139618?feature=transcript`

**GET /overlap/region/:species/:region**
- Get all features in a genomic region
- Parameters: `feature` (gene, transcript, variation, regulatory, etc.)
- Example: `/overlap/region/human/7:140424943..140624564?feature=gene`

**GET /overlap/translation/:id**
- Get protein features
- Example: `/overlap/translation/ENSP00000288602`

## 10. Phenotype Annotations

Retrieve disease and trait associations.

**GET /phenotype/accession/:species/:accession**
- Get phenotypes by ontology accession
- Example: `/phenotype/accession/human/EFO:0003767`

**GET /phenotype/gene/:species/:gene**
- Get phenotype associations for a gene
- Example: `/phenotype/gene/human/ENSG00000139618`

**GET /phenotype/region/:species/:region**
- Get phenotypes in genomic region
- Example: `/phenotype/region/human/7:140424943-140624564`

**GET /phenotype/term/:species/:term**
- Search phenotypes by term
- Example: `/phenotype/term/human/cancer`

## 11. Regulation

Access regulatory feature and binding motif data.

**GET /regulatory/species/:species/microarray/:microarray/:probe**
- Get microarray probe information
- Example: `/regulatory/species/human/microarray/HumanWG_6_V2/ILMN_1773626`

**GET /species/:species/binding_matrix/:binding_matrix_id**
- Get transcription factor binding matrix
- Example: `/species/human/binding_matrix/ENSPFM0001`

## 12. Sequence

Retrieve genomic, transcript, and protein sequences.

**GET /sequence/id/:id**
- Get sequence by ID
- Parameters: `type` (genomic, cds, cdna, protein), `format` (json, fasta, text)
- Example: `/sequence/id/ENSG00000139618?type=genomic`

**POST /sequence/id**
- Batch sequence retrieval
- Example: `{"ids": ["ENSG00000139618", "ENSG00000157764"]}`

**GET /sequence/region/:species/:region**
- Get genomic sequence for region
- Parameters: `coord_system`, `format`
- Example: `/sequence/region/human/7:140424943..140624564?format=fasta`

**POST /sequence/region/:species**
- Batch region sequence retrieval

## 13. Transcript Haplotypes

Compute transcript haplotypes from phased genotypes.

**GET /transcript_haplotypes/:species/:id**
- Get transcript haplotypes
- Example: `/transcript_haplotypes/human/ENST00000288602`

## 14. Variant Effect Predictor (VEP)

Predict functional consequences of variants.

**GET /vep/:species/hgvs/:hgvs_notation**
- Predict variant effects using HGVS notation
- Parameters: numerous VEP options
- Example: `/vep/human/hgvs/ENST00000288602:c.803C>T`

**POST /vep/:species/hgvs**
- Batch VEP analysis with HGVS
- Example: `{"hgvs_notations": ["ENST00000288602:c.803C>T"]}`

**GET /vep/:species/id/:id**
- Predict effects for variant ID
- Example: `/vep/human/id/rs699`

**POST /vep/:species/id**
- Batch VEP by variant IDs

**GET /vep/:species/region/:region/:allele**
- Predict effects for region and allele
- Example: `/vep/human/region/7:140453136:C/T`

**POST /vep/:species/region**
- Batch VEP by regions

## 15. Variation

Query genetic variation data and associated publications.

**GET /variation/:species/:id**
- Get variant information by ID
- Parameters: `pops` (include population frequencies), `genotypes`
- Example: `/variation/human/rs699?pops=1`

**POST /variation/:species**
- Batch variant queries
- Example: `{"ids": ["rs699", "rs6025"]}`

**GET /variation/:species/pmcid/:pmcid**
- Get variants from PubMed Central article
- Example: `/variation/human/pmcid/PMC5002951`

**GET /variation/:species/pmid/:pmid**
- Get variants from PubMed article
- Example: `/variation/human/pmid/26318936`

## 16. Variation GA4GH

Access genomic variation data using GA4GH standards.

**POST /ga4gh/beacon**
- Query beacon for variant presence

**GET /ga4gh/features/:id**
- Get feature by ID in GA4GH format

**POST /ga4gh/features/search**
- Search features using GA4GH protocol

**POST /ga4gh/variants/search**
- Search variants using GA4GH protocol

## Response Formats

Most endpoints support multiple response formats:
- **JSON** (default): `Content-Type: application/json`
- **FASTA**: For sequence data
- **XML**: Some endpoints support XML
- **Text**: Plain text output

Specify format using:
1. `Content-Type` header
2. URL parameter: `content-type=text/x-fasta`
3. File extension: `/sequence/id/ENSG00000139618.fasta`

## Common Parameters

Many endpoints share these parameters:

- **expand**: Include child objects (transcripts, proteins)
- **format**: Output format (json, xml, fasta)
- **db_type**: Database type (core, otherfeatures, variation)
- **object_type**: Type of object to return
- **species**: Species name (can be common or scientific)

## Error Codes

- **200**: Success
- **400**: Bad request (invalid parameters)
- **404**: Not found (ID doesn't exist)
- **429**: Rate limit exceeded
- **500**: Internal server error

## Best Practices

1. **Use batch endpoints** for multiple queries (more efficient)
2. **Cache responses** to minimize API calls
3. **Check rate limit headers** in responses
4. **Handle 429 errors** by respecting `Retry-After` header
5. **Use appropriate content types** for sequence data
6. **Specify assembly** when querying older genome versions
7. **Enable expand parameter** when you need full object details
