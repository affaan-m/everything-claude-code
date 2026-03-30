---
name: gene-database
description: Query NCBI Gene via E-utilities/Datasets API. Search by symbol/ID, retrieve gene info (RefSeqs, GO, locations, phenotypes), batch lookups, for gene annotation and functional analysis.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# Gene Database

## Overview

NCBI Gene is a comprehensive database integrating gene information from diverse species. It provides nomenclature, reference sequences (RefSeqs), chromosomal maps, biological pathways, genetic variations, phenotypes, and cross-references to global genomic resources.

## When to Use This Skill

This skill should be used when working with gene data including searching by gene symbol or ID, retrieving gene sequences and metadata, analyzing gene functions and pathways, or performing batch gene lookups.

## Quick Start

NCBI provides two main APIs for gene data access:

1. **E-utilities** (Traditional): Full-featured API for all Entrez databases with flexible querying
2. **NCBI Datasets API** (Newer): Optimized for gene data retrieval with simplified workflows

Choose E-utilities for complex queries and cross-database searches. Choose Datasets API for straightforward gene data retrieval with metadata and sequences in a single request.

## Common Workflows

### Search Genes by Symbol or Name

To search for genes by symbol or name across organisms:

1. Use the `scripts/query_gene.py` script with E-utilities ESearch
2. Specify the gene symbol and organism (e.g., "BRCA1 in human")
3. The script returns matching Gene IDs

Example query patterns:
- Gene symbol: `insulin[gene name] AND human[organism]`
- Gene with disease: `dystrophin[gene name] AND muscular dystrophy[disease]`
- Chromosome location: `human[organism] AND 17q21[chromosome]`

### Retrieve Gene Information by ID

To fetch detailed information for known Gene IDs:

1. Use `scripts/fetch_gene_data.py` with the Datasets API for comprehensive data
2. Alternatively, use `scripts/query_gene.py` with E-utilities EFetch for specific formats
3. Specify desired output format (JSON, XML, or text)

The Datasets API returns:
- Gene nomenclature and aliases
- Reference sequences (RefSeqs) for transcripts and proteins
- Chromosomal location and mapping
- Gene Ontology (GO) annotations
- Associated publications

### Batch Gene Lookups

For multiple genes simultaneously:

1. Use `scripts/batch_gene_lookup.py` for efficient batch processing
2. Provide a list of gene symbols or IDs
3. Specify the organism for symbol-based queries
4. The script handles rate limiting automatically (10 requests/second with API key)

This workflow is useful for:
- Validating gene lists
- Retrieving metadata for gene panels
- Cross-referencing gene identifiers
- Building gene annotation tables

### Search by Biological Context

To find genes associated with specific biological functions or phenotypes:

1. Use E-utilities with Gene Ontology (GO) terms or phenotype keywords
2. Query by pathway names or disease associations
3. Filter by organism, chromosome, or other attributes

Example searches:
- By GO term: `GO:0006915[biological process]` (apoptosis)
- By phenotype: `diabetes[phenotype] AND mouse[organism]`
- By pathway: `insulin signaling pathway[pathway]`

### API Access Patterns

**Rate Limits:**
- Without API key: 3 requests/second for E-utilities, 5 requests/second for Datasets API
- With API key: 10 requests/second for both APIs

**Authentication:**
Register for a free NCBI API key at https://www.ncbi.nlm.nih.gov/account/ to increase rate limits.

**Error Handling:**
Both APIs return standard HTTP status codes. Common errors include:
- 400: Malformed query or invalid parameters
- 429: Rate limit exceeded
- 404: Gene ID not found

Retry failed requests with exponential backoff.

## Script Usage

### query_gene.py

Query NCBI Gene using E-utilities (ESearch, ESummary, EFetch).

```bash
python scripts/query_gene.py --search "BRCA1" --organism "human"
python scripts/query_gene.py --id 672 --format json
python scripts/query_gene.py --search "insulin[gene] AND diabetes[disease]"
```

### fetch_gene_data.py

Fetch comprehensive gene data using NCBI Datasets API.

```bash
python scripts/fetch_gene_data.py --gene-id 672
python scripts/fetch_gene_data.py --symbol BRCA1 --taxon human
python scripts/fetch_gene_data.py --symbol TP53 --taxon "Homo sapiens" --output json
```

### batch_gene_lookup.py

Process multiple gene queries efficiently.

```bash
python scripts/batch_gene_lookup.py --file gene_list.txt --organism human
python scripts/batch_gene_lookup.py --ids 672,7157,5594 --output results.json
```

## API References

For detailed API documentation including endpoints, parameters, response formats, and examples, refer to:

- `references/api_reference.md` - Comprehensive API documentation for E-utilities and Datasets API
- `references/common_workflows.md` - Additional examples and use case patterns

Search these references when needing specific API endpoint details, parameter options, or response structure information.

## Data Formats

NCBI Gene data can be retrieved in multiple formats:

- **JSON**: Structured data ideal for programmatic processing
- **XML**: Detailed hierarchical format with full metadata
- **GenBank**: Sequence data with annotations
- **FASTA**: Sequence data only
- **Text**: Human-readable summaries

Choose JSON for modern applications, XML for legacy systems requiring detailed metadata, and FASTA for sequence analysis workflows.

## Best Practices

1. **Always specify organism** when searching by gene symbol to avoid ambiguity
2. **Use Gene IDs** for precise lookups when available
3. **Batch requests** when working with multiple genes to minimize API calls
4. **Cache results** locally to reduce redundant queries
5. **Include API key** in scripts for higher rate limits
6. **Handle errors gracefully** with retry logic for transient failures
7. **Validate gene symbols** before batch processing to catch typos

## Resources

This skill includes:

### scripts/
- `query_gene.py` - Query genes using E-utilities (ESearch, ESummary, EFetch)
- `fetch_gene_data.py` - Fetch gene data using NCBI Datasets API
- `batch_gene_lookup.py` - Handle multiple gene queries efficiently

### references/
- `api_reference.md` - Detailed API documentation for both E-utilities and Datasets API
- `common_workflows.md` - Examples of common gene queries and use cases

