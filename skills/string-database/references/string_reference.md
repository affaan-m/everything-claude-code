# STRING Database API Reference

## Overview

STRING (Search Tool for the Retrieval of Interacting Genes/Proteins) is a comprehensive database of known and predicted protein-protein interactions integrating data from over 40 sources.

**Database Statistics (v12.0+):**
- Coverage: 5000+ genomes
- Proteins: ~59.3 million
- Interactions: 20+ billion
- Data types: Physical interactions, functional associations, co-expression, co-occurrence, text-mining, databases

**Core Data Resource:** Designated by Global Biodata Coalition and ELIXIR

## API Base URLs

- **Current version**: https://string-db.org/api
- **Version-specific**: https://version-12-0.string-db.org/api (for reproducibility)
- **API documentation**: https://string-db.org/help/api/

## Best Practices

1. **Identifier Mapping**: Always map identifiers first using `get_string_ids` for faster subsequent queries
2. **Use STRING IDs**: Prefer STRING identifiers (e.g., `9606.ENSP00000269305`) over gene names
3. **Specify Species**: For networks with >10 proteins, always specify species NCBI taxon ID
4. **Rate Limiting**: Wait 1 second between API calls to avoid server overload
5. **Versioned URLs**: Use version-specific URLs for reproducible research
6. **POST over GET**: Use POST requests for large protein lists
7. **Caller Identity**: Include `caller_identity` parameter for tracking (e.g., your application name)

## API Methods

### 1. Identifier Mapping (`get_string_ids`)

**Purpose**: Maps common protein names, gene symbols, UniProt IDs, and other identifiers to STRING identifiers.

**Endpoint**: `/api/tsv/get_string_ids`

**Parameters**:
- `identifiers` (required): Protein names/IDs separated by newlines (`%0d`)
- `species` (required): NCBI taxon ID
- `limit`: Number of matches per identifier (default: 1)
- `echo_query`: Include query term in output (1 or 0)
- `caller_identity`: Application identifier

**Output Format**: TSV with columns:
- `queryItem`: Original query
- `queryIndex`: Query position
- `stringId`: STRING identifier
- `ncbiTaxonId`: Species taxon ID
- `taxonName`: Species name
- `preferredName`: Preferred gene name
- `annotation`: Protein description

**Example**:
```
identifiers=TP53%0dBRCA1&species=9606&limit=1
```

**Use cases**:
- Converting gene symbols to STRING IDs
- Validating protein identifiers
- Finding canonical protein names

### 2. Network Data (`network`)

**Purpose**: Retrieves protein-protein interaction network data in tabular format.

**Endpoint**: `/api/tsv/network`

**Parameters**:
- `identifiers` (required): Protein IDs separated by `%0d`
- `species`: NCBI taxon ID
- `required_score`: Confidence threshold 0-1000 (default: 400)
  - 150: low confidence
  - 400: medium confidence
  - 700: high confidence
  - 900: highest confidence
- `network_type`: `functional` (default) or `physical`
- `add_nodes`: Add N interacting proteins (0-10)
- `caller_identity`: Application identifier

**Output Format**: TSV with columns:
- `stringId_A`, `stringId_B`: Interacting proteins
- `preferredName_A`, `preferredName_B`: Gene names
- `ncbiTaxonId`: Species
- `score`: Combined interaction score (0-1000)
- `nscore`: Neighborhood score
- `fscore`: Fusion score
- `pscore`: Phylogenetic profile score
- `ascore`: Coexpression score
- `escore`: Experimental score
- `dscore`: Database score
- `tscore`: Text-mining score

**Network Types**:
- **Functional**: All interaction evidence types (recommended for most analyses)
- **Physical**: Only direct physical binding evidence

**Example**:
```
identifiers=9606.ENSP00000269305%0d9606.ENSP00000275493&required_score=700
```

### 3. Network Image (`image/network`)

**Purpose**: Generates visual network representation as PNG image.

**Endpoint**: `/api/image/network`

**Parameters**:
- `identifiers` (required): Protein IDs separated by `%0d`
- `species`: NCBI taxon ID
- `required_score`: Confidence threshold 0-1000
- `network_flavor`: Visualization style
  - `evidence`: Show evidence types as colored lines
  - `confidence`: Show confidence as line thickness
  - `actions`: Show activating/inhibiting interactions
- `add_nodes`: Add N interacting proteins (0-10)
- `caller_identity`: Application identifier

**Output**: PNG image (binary data)

**Image Specifications**:
- Format: PNG
- Size: Automatically scaled based on network size
- High-resolution option available (add `?highres=1`)

**Example**:
```
identifiers=TP53%0dMDM2&species=9606&network_flavor=evidence
```

### 4. Interaction Partners (`interaction_partners`)

**Purpose**: Retrieves all STRING interaction partners for given protein(s).

**Endpoint**: `/api/tsv/interaction_partners`

**Parameters**:
- `identifiers` (required): Protein IDs
- `species`: NCBI taxon ID
- `required_score`: Confidence threshold 0-1000
- `limit`: Maximum number of partners (default: 10)
- `caller_identity`: Application identifier

**Output Format**: TSV with same columns as `network` method

**Use cases**:
- Finding hub proteins
- Expanding networks
- Discovery of novel interactions

**Example**:
```
identifiers=TP53&species=9606&limit=20&required_score=700
```

### 5. Functional Enrichment (`enrichment`)

**Purpose**: Performs functional enrichment analysis for a set of proteins across multiple annotation databases.

**Endpoint**: `/api/tsv/enrichment`

**Parameters**:
- `identifiers` (required): List of protein IDs
- `species` (required): NCBI taxon ID
- `caller_identity`: Application identifier

**Enrichment Categories**:
- **Gene Ontology**: Biological Process, Molecular Function, Cellular Component
- **KEGG Pathways**: Metabolic and signaling pathways
- **Pfam**: Protein domains
- **InterPro**: Protein families and domains
- **SMART**: Domain architecture
- **UniProt Keywords**: Curated functional keywords

**Output Format**: TSV with columns:
- `category`: Annotation category
- `term`: Term ID
- `description`: Term description
- `number_of_genes`: Genes in input with this term
- `number_of_genes_in_background`: Total genes with this term
- `ncbiTaxonId`: Species
- `inputGenes`: Comma-separated gene list
- `preferredNames`: Comma-separated gene names
- `p_value`: Enrichment p-value (uncorrected)
- `fdr`: False discovery rate (corrected p-value)

**Statistical Method**: Fisher's exact test with Benjamini-Hochberg FDR correction

**Example**:
```
identifiers=TP53%0dMDM2%0dATM%0dCHEK2&species=9606
```

### 6. PPI Enrichment (`ppi_enrichment`)

**Purpose**: Tests if a network has significantly more interactions than expected by chance.

**Endpoint**: `/api/json/ppi_enrichment`

**Parameters**:
- `identifiers` (required): List of protein IDs
- `species`: NCBI taxon ID
- `required_score`: Confidence threshold
- `caller_identity`: Application identifier

**Output Format**: JSON with fields:
- `number_of_nodes`: Proteins in network
- `number_of_edges`: Interactions observed
- `expected_number_of_edges`: Expected interactions (random)
- `p_value`: Statistical significance

**Interpretation**:
- p-value < 0.05: Network is significantly enriched
- Low p-value indicates proteins form functional module

**Example**:
```
identifiers=TP53%0dMDM2%0dATM%0dCHEK2&species=9606
```

### 7. Homology Scores (`homology`)

**Purpose**: Retrieves protein similarity/homology scores.

**Endpoint**: `/api/tsv/homology`

**Parameters**:
- `identifiers` (required): Protein IDs
- `species`: NCBI taxon ID
- `caller_identity`: Application identifier

**Output Format**: TSV with homology scores between proteins

**Use cases**:
- Identifying protein families
- Paralog analysis
- Cross-species comparisons

### 8. Version Information (`version`)

**Purpose**: Returns current STRING database version.

**Endpoint**: `/api/tsv/version`

**Output**: Version string (e.g., "12.0")

## Common Species NCBI Taxon IDs

| Organism | Common Name | Taxon ID |
|----------|-------------|----------|
| Homo sapiens | Human | 9606 |
| Mus musculus | Mouse | 10090 |
| Rattus norvegicus | Rat | 10116 |
| Drosophila melanogaster | Fruit fly | 7227 |
| Caenorhabditis elegans | C. elegans | 6239 |
| Saccharomyces cerevisiae | Yeast | 4932 |
| Arabidopsis thaliana | Thale cress | 3702 |
| Escherichia coli K-12 | E. coli | 511145 |
| Danio rerio | Zebrafish | 7955 |
| Gallus gallus | Chicken | 9031 |

Full list: https://string-db.org/cgi/input?input_page_active_form=organisms

## STRING Identifier Format

STRING uses Ensembl protein IDs with taxon prefix:
- Format: `{taxonId}.{ensemblProteinId}`
- Example: `9606.ENSP00000269305` (human TP53)

**ID Components**:
- **Taxon ID**: NCBI taxonomy identifier
- **Protein ID**: Usually Ensembl protein ID (ENSP...)

## Interaction Confidence Scores

STRING provides combined confidence scores (0-1000) based on multiple evidence channels:

### Evidence Channels

1. **Neighborhood (nscore)**: Gene fusion and conserved genomic neighborhood
2. **Fusion (fscore)**: Gene fusion events across species
3. **Phylogenetic Profile (pscore)**: Co-occurrence across species
4. **Coexpression (ascore)**: RNA expression correlation
5. **Experimental (escore)**: Biochemical/genetic experiments
6. **Database (dscore)**: Curated pathway/complex databases
7. **Text-mining (tscore)**: Literature co-occurrence

### Recommended Thresholds

- **150**: Low confidence (exploratory analysis)
- **400**: Medium confidence (standard analysis)
- **700**: High confidence (conservative analysis)
- **900**: Highest confidence (very stringent)

## Output Formats

### Available Formats

1. **TSV**: Tab-separated values (default, best for data processing)
2. **JSON**: JavaScript Object Notation (structured data)
3. **XML**: Extensible Markup Language
4. **PSI-MI**: Proteomics Standards Initiative format
5. **PSI-MITAB**: Tab-delimited PSI-MI format
6. **PNG**: Image format (for network visualizations)
7. **SVG**: Scalable vector graphics (for network visualizations)

### Format Selection

Replace `/tsv/` in URL with desired format:
- `/json/network` - JSON format
- `/xml/network` - XML format
- `/image/network` - PNG image

## Error Handling

### HTTP Status Codes

- **200 OK**: Successful request
- **400 Bad Request**: Invalid parameters or syntax
- **404 Not Found**: Protein/species not found
- **500 Internal Server Error**: Server error

### Common Errors

1. **"No proteins found"**: Invalid identifiers or species mismatch
2. **"Species required"**: Missing species parameter for large networks
3. **Empty results**: No interactions above score threshold
4. **Timeout**: Network too large, reduce protein count

## Advanced Features

### Bulk Network Upload

For complete proteome analysis:
1. Navigate to https://string-db.org/
2. Select "Upload proteome" option
3. Upload FASTA file
4. STRING generates complete interaction network and predicts functions

### Values/Ranks Enrichment API

For differential expression/proteomics data:

1. **Get API Key**:
```
/api/json/get_api_key
```

2. **Submit Data**: Tab-separated protein ID and value pairs

3. **Check Status**:
```
/api/json/valuesranks_enrichment_status?job_id={id}
```

4. **Retrieve Results**: Access enrichment tables and figures

**Requirements**:
- Complete protein set (no filtering)
- Numeric values for each protein
- Proper species identifier

### Network Customization

**Network Size Control**:
- `add_nodes=N`: Adds N most connected proteins
- `limit`: Controls partner retrieval

**Confidence Filtering**:
- Adjust `required_score` based on analysis goals
- Higher scores = fewer false positives, more false negatives

**Network Type Selection**:
- `functional`: All evidence (recommended for pathway analysis)
- `physical`: Direct binding only (recommended for structural studies)

## Integration with Other Tools

### Python Libraries

**requests** (recommended):
```python
import requests
url = "https://string-db.org/api/tsv/network"
params = {"identifiers": "TP53", "species": 9606}
response = requests.get(url, params=params)
```

**urllib** (standard library):
```python
import urllib.request
url = "https://string-db.org/api/tsv/network?identifiers=TP53&species=9606"
response = urllib.request.urlopen(url)
```

### R Integration

**STRINGdb Bioconductor package**:
```R
library(STRINGdb)
string_db <- STRINGdb$new(version="12", species=9606)
```

### Cytoscape

STRING networks can be imported into Cytoscape for visualization and analysis:
1. Use stringApp plugin
2. Import TSV network data
3. Apply layouts and styling

## Data License

STRING data is freely available under **Creative Commons BY 4.0** license:
- ✓ Free to use for academic and commercial purposes
- ✓ Attribution required
- ✓ Modifications allowed
- ✓ Redistribution allowed

**Citation**: Szklarczyk et al. (latest publication)

## Rate Limits and Usage

- **Rate limiting**: No strict limit, but avoid rapid-fire requests
- **Recommendation**: Wait 1 second between calls
- **Large datasets**: Use bulk download from https://string-db.org/cgi/download
- **Proteome-scale**: Use web upload feature instead of API

## Related Resources

- **STRING website**: https://string-db.org
- **Download page**: https://string-db.org/cgi/download
- **Help center**: https://string-db.org/help/
- **API documentation**: https://string-db.org/help/api/
- **Publications**: https://string-db.org/cgi/about

## Troubleshooting

**No results returned**:
- Verify species parameter matches identifiers
- Check identifier format
- Lower confidence threshold
- Use identifier mapping first

**Timeout errors**:
- Reduce number of input proteins
- Split large queries into batches
- Use bulk download for proteome-scale analyses

**Version inconsistencies**:
- Use version-specific URLs
- Check STRING version with `/version` endpoint
- Update identifiers if using old IDs
