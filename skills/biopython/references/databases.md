# Database Access with Bio.Entrez

## Overview

Bio.Entrez provides programmatic access to NCBI's Entrez databases, including PubMed, GenBank, Gene, Protein, Nucleotide, and many others. It handles all the complexity of API calls, rate limiting, and data parsing.

## Setup and Configuration

### Email Address (Required)

NCBI requires an email address to track usage and contact users if issues arise:

```python
from Bio import Entrez

# Always set your email
Entrez.email = "your.email@example.com"
```

### API Key (Recommended)

Using an API key increases rate limits from 3 to 10 requests per second:

```python
# Get API key from: https://www.ncbi.nlm.nih.gov/account/settings/
Entrez.api_key = "your_api_key_here"
```

### Rate Limiting

Biopython automatically respects NCBI rate limits:
- **Without API key**: 3 requests per second
- **With API key**: 10 requests per second

The module handles this automatically, so you don't need to add delays between requests.

## Core Entrez Functions

### EInfo - Database Information

Get information about available databases and their statistics:

```python
# List all databases
handle = Entrez.einfo()
result = Entrez.read(handle)
print(result["DbList"])

# Get information about a specific database
handle = Entrez.einfo(db="pubmed")
result = Entrez.read(handle)
print(result["DbInfo"]["Description"])
print(result["DbInfo"]["Count"])  # Number of records
```

### ESearch - Search Databases

Search for records and retrieve their IDs:

```python
# Search PubMed
handle = Entrez.esearch(db="pubmed", term="biopython")
result = Entrez.read(handle)
handle.close()

id_list = result["IdList"]
count = result["Count"]
print(f"Found {count} results")
print(f"Retrieved IDs: {id_list}")
```

### Advanced ESearch Parameters

```python
# Search with additional parameters
handle = Entrez.esearch(
    db="pubmed",
    term="biopython[Title]",
    retmax=100,           # Return up to 100 IDs
    sort="relevance",     # Sort by relevance
    reldate=365,          # Only results from last year
    datetype="pdat"       # Use publication date
)
result = Entrez.read(handle)
handle.close()
```

### ESummary - Get Record Summaries

Retrieve summary information for a list of IDs:

```python
# Get summaries for multiple records
handle = Entrez.esummary(db="pubmed", id="19304878,18606172")
results = Entrez.read(handle)
handle.close()

for record in results:
    print(f"Title: {record['Title']}")
    print(f"Authors: {record['AuthorList']}")
    print(f"Journal: {record['Source']}")
    print()
```

### EFetch - Retrieve Full Records

Fetch complete records in various formats:

```python
# Fetch a GenBank record
handle = Entrez.efetch(db="nucleotide", id="EU490707", rettype="gb", retmode="text")
record_text = handle.read()
handle.close()

# Parse with SeqIO
from Bio import SeqIO
handle = Entrez.efetch(db="nucleotide", id="EU490707", rettype="gb", retmode="text")
record = SeqIO.read(handle, "genbank")
handle.close()
print(record.description)
```

### EFetch Return Types

Different databases support different return types:

**Nucleotide/Protein:**
- `rettype="fasta"` - FASTA format
- `rettype="gb"` or `"genbank"` - GenBank format
- `rettype="gp"` - GenPept format (proteins)

**PubMed:**
- `rettype="medline"` - MEDLINE format
- `rettype="abstract"` - Abstract text

**Common modes:**
- `retmode="text"` - Plain text
- `retmode="xml"` - XML format

### ELink - Find Related Records

Find links between records in different databases:

```python
# Find protein records linked to a nucleotide record
handle = Entrez.elink(dbfrom="nucleotide", db="protein", id="EU490707")
result = Entrez.read(handle)
handle.close()

# Extract linked IDs
for linkset in result[0]["LinkSetDb"]:
    if linkset["LinkName"] == "nucleotide_protein":
        protein_ids = [link["Id"] for link in linkset["Link"]]
        print(f"Linked protein IDs: {protein_ids}")
```

### EPost - Upload ID Lists

Upload large lists of IDs to the server for later use:

```python
# Post IDs to server
id_list = ["19304878", "18606172", "16403221"]
handle = Entrez.epost(db="pubmed", id=",".join(id_list))
result = Entrez.read(handle)
handle.close()

# Get query_key and WebEnv for later use
query_key = result["QueryKey"]
webenv = result["WebEnv"]

# Use in subsequent queries
handle = Entrez.efetch(
    db="pubmed",
    query_key=query_key,
    WebEnv=webenv,
    rettype="medline",
    retmode="text"
)
```

### EGQuery - Global Query

Search across all Entrez databases at once:

```python
handle = Entrez.egquery(term="biopython")
result = Entrez.read(handle)
handle.close()

for row in result["eGQueryResult"]:
    print(f"{row['DbName']}: {row['Count']} results")
```

### ESpell - Spelling Suggestions

Get spelling suggestions for search terms:

```python
handle = Entrez.espell(db="pubmed", term="biopythn")
result = Entrez.read(handle)
handle.close()

print(f"Original: {result['Query']}")
print(f"Suggestion: {result['CorrectedQuery']}")
```

## Working with Different Databases

### PubMed

```python
# Search for articles
handle = Entrez.esearch(db="pubmed", term="cancer genomics", retmax=10)
result = Entrez.read(handle)
handle.close()

# Fetch abstracts
handle = Entrez.efetch(
    db="pubmed",
    id=result["IdList"],
    rettype="medline",
    retmode="text"
)
records = handle.read()
handle.close()
print(records)
```

### GenBank / Nucleotide

```python
# Search for sequences
handle = Entrez.esearch(db="nucleotide", term="Cypripedioideae[Orgn] AND matK[Gene]")
result = Entrez.read(handle)
handle.close()

# Fetch sequences
if result["IdList"]:
    handle = Entrez.efetch(
        db="nucleotide",
        id=result["IdList"][:5],
        rettype="fasta",
        retmode="text"
    )
    sequences = handle.read()
    handle.close()
```

### Protein

```python
# Search for protein sequences
handle = Entrez.esearch(db="protein", term="human insulin")
result = Entrez.read(handle)
handle.close()

# Fetch protein records
from Bio import SeqIO
handle = Entrez.efetch(
    db="protein",
    id=result["IdList"][:5],
    rettype="gp",
    retmode="text"
)
records = SeqIO.parse(handle, "genbank")
for record in records:
    print(f"{record.id}: {record.description}")
handle.close()
```

### Gene

```python
# Search for gene records
handle = Entrez.esearch(db="gene", term="BRCA1[Gene] AND human[Organism]")
result = Entrez.read(handle)
handle.close()

# Get gene information
handle = Entrez.efetch(db="gene", id=result["IdList"][0], retmode="xml")
record = Entrez.read(handle)
handle.close()
```

### Taxonomy

```python
# Search for organism
handle = Entrez.esearch(db="taxonomy", term="Homo sapiens")
result = Entrez.read(handle)
handle.close()

# Fetch taxonomic information
handle = Entrez.efetch(db="taxonomy", id=result["IdList"][0], retmode="xml")
records = Entrez.read(handle)
handle.close()

for record in records:
    print(f"TaxID: {record['TaxId']}")
    print(f"Scientific Name: {record['ScientificName']}")
    print(f"Lineage: {record['Lineage']}")
```

## Parsing Entrez Results

### Reading XML Results

```python
# Most results can be parsed with Entrez.read()
handle = Entrez.efetch(db="pubmed", id="19304878", retmode="xml")
records = Entrez.read(handle)
handle.close()

# Access parsed data
article = records['PubmedArticle'][0]['MedlineCitation']['Article']
print(article['ArticleTitle'])
```

### Handling Large Result Sets

```python
# Batch processing for large searches
search_term = "cancer[Title]"
handle = Entrez.esearch(db="pubmed", term=search_term, retmax=0)
result = Entrez.read(handle)
handle.close()

total_count = int(result["Count"])
batch_size = 500

for start in range(0, total_count, batch_size):
    # Fetch batch
    handle = Entrez.esearch(
        db="pubmed",
        term=search_term,
        retstart=start,
        retmax=batch_size
    )
    result = Entrez.read(handle)
    handle.close()

    # Process IDs
    id_list = result["IdList"]
    print(f"Processing IDs {start} to {start + len(id_list)}")
```

## Advanced Patterns

### Search History with WebEnv

```python
# Perform search and store on server
handle = Entrez.esearch(
    db="pubmed",
    term="biopython",
    usehistory="y"
)
result = Entrez.read(handle)
handle.close()

webenv = result["WebEnv"]
query_key = result["QueryKey"]
count = int(result["Count"])

# Fetch results in batches using history
batch_size = 100
for start in range(0, count, batch_size):
    handle = Entrez.efetch(
        db="pubmed",
        retstart=start,
        retmax=batch_size,
        rettype="medline",
        retmode="text",
        webenv=webenv,
        query_key=query_key
    )
    data = handle.read()
    handle.close()
    # Process data
```

### Combining Searches

```python
# Use boolean operators
complex_search = "(cancer[Title]) AND (genomics[Title]) AND 2020:2025[PDAT]"
handle = Entrez.esearch(db="pubmed", term=complex_search, retmax=100)
result = Entrez.read(handle)
handle.close()
```

## Best Practices

1. **Always set Entrez.email** - Required by NCBI
2. **Use API key** for higher rate limits (10 req/s vs 3 req/s)
3. **Close handles** after reading to free resources
4. **Batch large requests** - Use retstart and retmax for pagination
5. **Use WebEnv for large downloads** - Store results on server
6. **Cache locally** - Download once and save to avoid repeated requests
7. **Handle errors gracefully** - Network issues and API limits can occur
8. **Respect NCBI guidelines** - Don't overwhelm the service
9. **Use appropriate rettype** - Choose format that matches your needs
10. **Parse XML carefully** - Structure varies by database and record type

## Error Handling

```python
from urllib.error import HTTPError
from Bio import Entrez

Entrez.email = "your.email@example.com"

try:
    handle = Entrez.efetch(db="nucleotide", id="invalid_id", rettype="gb")
    record = handle.read()
    handle.close()
except HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
except Exception as e:
    print(f"Error: {e}")
```

## Common Use Cases

### Download GenBank Records

```python
from Bio import Entrez, SeqIO

Entrez.email = "your.email@example.com"

# List of accession numbers
accessions = ["EU490707", "EU490708", "EU490709"]

for acc in accessions:
    handle = Entrez.efetch(db="nucleotide", id=acc, rettype="gb", retmode="text")
    record = SeqIO.read(handle, "genbank")
    handle.close()

    # Save to file
    SeqIO.write(record, f"{acc}.gb", "genbank")
```

### Search and Download Papers

```python
# Search PubMed
handle = Entrez.esearch(db="pubmed", term="machine learning bioinformatics", retmax=20)
result = Entrez.read(handle)
handle.close()

# Get details
handle = Entrez.efetch(db="pubmed", id=result["IdList"], retmode="xml")
papers = Entrez.read(handle)
handle.close()

# Extract information
for paper in papers['PubmedArticle']:
    article = paper['MedlineCitation']['Article']
    print(f"Title: {article['ArticleTitle']}")
    print(f"Journal: {article['Journal']['Title']}")
    print()
```

### Find Related Sequences

```python
# Start with one sequence
handle = Entrez.efetch(db="nucleotide", id="EU490707", rettype="gb", retmode="text")
record = SeqIO.read(handle, "genbank")
handle.close()

# Find similar sequences
handle = Entrez.elink(dbfrom="nucleotide", db="nucleotide", id="EU490707")
result = Entrez.read(handle)
handle.close()

# Get related IDs
related_ids = []
for linkset in result[0]["LinkSetDb"]:
    for link in linkset["Link"]:
        related_ids.append(link["Id"])
```
