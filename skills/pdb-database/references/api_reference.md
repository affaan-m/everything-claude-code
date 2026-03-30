# RCSB PDB API Reference

This document provides detailed information about the RCSB Protein Data Bank APIs, including advanced usage patterns, data schemas, and best practices.

## API Overview

RCSB PDB provides multiple programmatic interfaces:

1. **Data API** - Retrieve PDB data when you have an identifier
2. **Search API** - Find identifiers matching specific search criteria
3. **ModelServer API** - Access macromolecular model subsets
4. **VolumeServer API** - Retrieve volumetric data subsets
5. **Sequence Coordinates API** - Obtain alignments between structural and sequence databases
6. **Alignment API** - Perform structure alignment computations

## Data API

### Core Data Objects

The Data API organizes information hierarchically:

- **core_entry**: PDB entries or Computed Structure Models (CSM IDs start with AF_ or MA_)
- **core_polymer_entity**: Protein, DNA, and RNA entities
- **core_nonpolymer_entity**: Ligands, cofactors, ions
- **core_branched_entity**: Oligosaccharides
- **core_assembly**: Biological assemblies
- **core_polymer_entity_instance**: Individual chains
- **core_chem_comp**: Chemical components

### REST API Endpoints

Base URL: `https://data.rcsb.org/rest/v1/`

**Entry Data:**
```
GET https://data.rcsb.org/rest/v1/core/entry/{entry_id}
```

**Polymer Entity:**
```
GET https://data.rcsb.org/rest/v1/core/polymer_entity/{entry_id}_{entity_id}
```

**Assembly:**
```
GET https://data.rcsb.org/rest/v1/core/assembly/{entry_id}/{assembly_id}
```

**Examples:**
```bash
# Get entry data for hemoglobin
curl https://data.rcsb.org/rest/v1/core/entry/4HHB

# Get first polymer entity
curl https://data.rcsb.org/rest/v1/core/polymer_entity/4HHB_1

# Get biological assembly 1
curl https://data.rcsb.org/rest/v1/core/assembly/4HHB/1
```

### GraphQL API

Endpoint: `https://data.rcsb.org/graphql`

The GraphQL API enables flexible data retrieval, allowing you to grab any piece of data from any level of the hierarchy in a single query.

**Example Query:**
```graphql
{
  entry(entry_id: "4HHB") {
    struct {
      title
    }
    exptl {
      method
    }
    rcsb_entry_info {
      resolution_combined
      deposited_atom_count
      polymer_entity_count
    }
    rcsb_accession_info {
      deposit_date
      initial_release_date
    }
  }
}
```

**Python Example:**
```python
import requests

query = """
{
  polymer_entity(entity_id: "4HHB_1") {
    rcsb_polymer_entity {
      pdbx_description
      formula_weight
    }
    entity_poly {
      pdbx_seq_one_letter_code
      pdbx_strand_id
    }
    rcsb_entity_source_organism {
      ncbi_taxonomy_id
      scientific_name
    }
  }
}
"""

response = requests.post(
    "https://data.rcsb.org/graphql",
    json={"query": query}
)
data = response.json()
```

### Common Data Fields

**Entry Level:**
- `struct.title` - Structure title/description
- `exptl[].method` - Experimental method (X-RAY DIFFRACTION, NMR, ELECTRON MICROSCOPY, etc.)
- `rcsb_entry_info.resolution_combined` - Resolution in Ångströms
- `rcsb_entry_info.deposited_atom_count` - Total number of atoms
- `rcsb_accession_info.deposit_date` - Deposition date
- `rcsb_accession_info.initial_release_date` - Release date

**Polymer Entity Level:**
- `entity_poly.pdbx_seq_one_letter_code` - Primary sequence
- `rcsb_polymer_entity.formula_weight` - Molecular weight
- `rcsb_entity_source_organism.scientific_name` - Source organism
- `rcsb_entity_source_organism.ncbi_taxonomy_id` - NCBI taxonomy ID

**Assembly Level:**
- `rcsb_assembly_info.polymer_entity_count` - Number of polymer entities
- `rcsb_assembly_info.assembly_id` - Assembly identifier

## Search API

### Query Types

The Search API supports seven primary query types:

1. **TextQuery** - Full-text search
2. **AttributeQuery** - Property-based search
3. **SequenceQuery** - Sequence similarity search
4. **SequenceMotifQuery** - Motif pattern search
5. **StructSimilarityQuery** - 3D structure similarity
6. **StructMotifQuery** - Structural motif search
7. **ChemSimilarityQuery** - Chemical similarity search

### AttributeQuery Operators

Available operators for AttributeQuery:

- `exact_match` - Exact string match
- `contains_words` - Contains all words
- `contains_phrase` - Contains exact phrase
- `equals` - Numerical equality
- `greater` - Greater than (numerical)
- `greater_or_equal` - Greater than or equal
- `less` - Less than (numerical)
- `less_or_equal` - Less than or equal
- `range` - Numerical range (closed interval)
- `exists` - Field has a value
- `in` - Value in list

### Common Searchable Attributes

**Resolution and Quality:**
```python
from rcsbapi.search import AttributeQuery
from rcsbapi.search.attrs import rcsb_entry_info

# High-resolution structures
query = AttributeQuery(
    attribute=rcsb_entry_info.resolution_combined,
    operator="less",
    value=2.0
)
```

**Experimental Method:**
```python
from rcsbapi.search.attrs import exptl

query = AttributeQuery(
    attribute=exptl.method,
    operator="exact_match",
    value="X-RAY DIFFRACTION"
)
```

**Organism:**
```python
from rcsbapi.search.attrs import rcsb_entity_source_organism

query = AttributeQuery(
    attribute=rcsb_entity_source_organism.scientific_name,
    operator="exact_match",
    value="Homo sapiens"
)
```

**Molecular Weight:**
```python
from rcsbapi.search.attrs import rcsb_polymer_entity

query = AttributeQuery(
    attribute=rcsb_polymer_entity.formula_weight,
    operator="range",
    value=(10000, 50000)  # 10-50 kDa
)
```

**Release Date:**
```python
from rcsbapi.search.attrs import rcsb_accession_info

# Structures released in 2024
query = AttributeQuery(
    attribute=rcsb_accession_info.initial_release_date,
    operator="range",
    value=("2024-01-01", "2024-12-31")
)
```

### Sequence Similarity Search

Search for structures with similar sequences using MMseqs2:

```python
from rcsbapi.search import SequenceQuery

# Basic sequence search
query = SequenceQuery(
    value="MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAGQEEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHHYREQIKRVKDSEDVPMVLVGNKCDLPSRTVDTKQAQDLARSYGIPFIETSAKTRQGVDDAFYTLVREIRKHKEKMSKDGKKKKKKSKTKCVIM",
    evalue_cutoff=0.1,
    identity_cutoff=0.9
)

# With sequence type specified
query = SequenceQuery(
    value="ACGTACGTACGT",
    evalue_cutoff=1e-5,
    identity_cutoff=0.8,
    sequence_type="dna"  # or "rna" or "protein"
)
```

### Structure Similarity Search

Find structures with similar 3D geometry using BioZernike:

```python
from rcsbapi.search import StructSimilarityQuery

# Search by entry
query = StructSimilarityQuery(
    structure_search_type="entry",
    entry_id="4HHB"
)

# Search by chain
query = StructSimilarityQuery(
    structure_search_type="chain",
    entry_id="4HHB",
    chain_id="A"
)

# Search by assembly
query = StructSimilarityQuery(
    structure_search_type="assembly",
    entry_id="4HHB",
    assembly_id="1"
)
```

### Combining Queries

Use Python bitwise operators to combine queries:

```python
from rcsbapi.search import TextQuery, AttributeQuery
from rcsbapi.search.attrs import rcsb_entry_info, rcsb_entity_source_organism

# AND operation (&)
query1 = TextQuery("kinase")
query2 = AttributeQuery(
    attribute=rcsb_entity_source_organism.scientific_name,
    operator="exact_match",
    value="Homo sapiens"
)
combined = query1 & query2

# OR operation (|)
organism1 = AttributeQuery(
    attribute=rcsb_entity_source_organism.scientific_name,
    operator="exact_match",
    value="Homo sapiens"
)
organism2 = AttributeQuery(
    attribute=rcsb_entity_source_organism.scientific_name,
    operator="exact_match",
    value="Mus musculus"
)
combined = organism1 | organism2

# NOT operation (~)
all_structures = TextQuery("protein")
low_res = AttributeQuery(
    attribute=rcsb_entry_info.resolution_combined,
    operator="greater",
    value=3.0
)
high_res_only = all_structures & (~low_res)

# Complex combinations
high_res_human_kinases = (
    TextQuery("kinase") &
    AttributeQuery(
        attribute=rcsb_entity_source_organism.scientific_name,
        operator="exact_match",
        value="Homo sapiens"
    ) &
    AttributeQuery(
        attribute=rcsb_entry_info.resolution_combined,
        operator="less",
        value=2.5
    )
)
```

### Return Types

Control what information is returned:

```python
from rcsbapi.search import TextQuery, ReturnType

query = TextQuery("hemoglobin")

# Return PDB IDs (default)
results = list(query())  # ['4HHB', '1A3N', ...]

# Return entry IDs with scores
results = list(query(return_type=ReturnType.ENTRY, return_scores=True))
# [{'identifier': '4HHB', 'score': 0.95}, ...]

# Return polymer entities
results = list(query(return_type=ReturnType.POLYMER_ENTITY))
# ['4HHB_1', '4HHB_2', ...]
```

## File Download URLs

### Structure Files

**PDB Format (legacy):**
```
https://files.rcsb.org/download/{PDB_ID}.pdb
```

**mmCIF Format (modern standard):**
```
https://files.rcsb.org/download/{PDB_ID}.cif
```

**Structure Factors:**
```
https://files.rcsb.org/download/{PDB_ID}-sf.cif
```

**Biological Assembly:**
```
https://files.rcsb.org/download/{PDB_ID}.pdb1  # Assembly 1
https://files.rcsb.org/download/{PDB_ID}.pdb2  # Assembly 2
```

**FASTA Sequence:**
```
https://www.rcsb.org/fasta/entry/{PDB_ID}
```

### Python Download Helper

```python
import requests

def download_pdb_file(pdb_id, format="pdb", output_dir="."):
    """
    Download PDB structure file.

    Args:
        pdb_id: 4-character PDB ID
        format: 'pdb' or 'cif'
        output_dir: Directory to save file
    """
    base_url = "https://files.rcsb.org/download"
    url = f"{base_url}/{pdb_id}.{format}"

    response = requests.get(url)
    if response.status_code == 200:
        output_path = f"{output_dir}/{pdb_id}.{format}"
        with open(output_path, "w") as f:
            f.write(response.text)
        print(f"Downloaded {pdb_id}.{format}")
        return output_path
    else:
        print(f"Error downloading {pdb_id}: {response.status_code}")
        return None

# Usage
download_pdb_file("4HHB", format="pdb")
download_pdb_file("4HHB", format="cif")
```

## Rate Limiting and Best Practices

### Rate Limits

- The API implements rate limiting to ensure fair usage
- If you exceed the limit, you'll receive a 429 HTTP error code
- Recommended starting point: a few requests per second
- Use exponential backoff to find acceptable request rates

### Exponential Backoff Implementation

```python
import time
import requests

def fetch_with_retry(url, max_retries=5, initial_delay=1):
    """
    Fetch URL with exponential backoff on rate limit errors.

    Args:
        url: URL to fetch
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay in seconds
    """
    delay = initial_delay

    for attempt in range(max_retries):
        response = requests.get(url)

        if response.status_code == 200:
            return response
        elif response.status_code == 429:
            print(f"Rate limited. Waiting {delay}s before retry...")
            time.sleep(delay)
            delay *= 2  # Exponential backoff
        else:
            response.raise_for_status()

    raise Exception(f"Failed after {max_retries} retries")
```

### Batch Processing Best Practices

1. **Use Search API first** to get list of IDs, then fetch data
2. **Cache results** to avoid redundant queries
3. **Process in chunks** rather than all at once
4. **Add delays** between requests to respect rate limits
5. **Use GraphQL** for complex queries to minimize requests

```python
import time
from rcsbapi.search import TextQuery
from rcsbapi.data import fetch, Schema

def batch_fetch_structures(query, delay=0.5):
    """
    Fetch structures matching a query with rate limiting.

    Args:
        query: Search query object
        delay: Delay between requests in seconds
    """
    # Get list of IDs
    pdb_ids = list(query())
    print(f"Found {len(pdb_ids)} structures")

    # Fetch data for each
    results = {}
    for i, pdb_id in enumerate(pdb_ids):
        try:
            data = fetch(pdb_id, schema=Schema.ENTRY)
            results[pdb_id] = data
            print(f"Fetched {i+1}/{len(pdb_ids)}: {pdb_id}")
            time.sleep(delay)  # Rate limiting
        except Exception as e:
            print(f"Error fetching {pdb_id}: {e}")

    return results
```

## Advanced Use Cases

### Finding Drug-Target Complexes

```python
from rcsbapi.search import AttributeQuery
from rcsbapi.search.attrs import rcsb_polymer_entity, rcsb_nonpolymer_entity_instance_container_identifiers

# Find structures with specific drug molecule
query = AttributeQuery(
    attribute=rcsb_nonpolymer_entity_instance_container_identifiers.comp_id,
    operator="exact_match",
    value="ATP"  # or other ligand code
)

results = list(query())
print(f"Found {len(results)} structures with ATP")
```

### Filtering by Resolution and R-factor

```python
from rcsbapi.search import AttributeQuery
from rcsbapi.search.attrs import rcsb_entry_info, refine

# High-quality X-ray structures
resolution_query = AttributeQuery(
    attribute=rcsb_entry_info.resolution_combined,
    operator="less",
    value=2.0
)

rfactor_query = AttributeQuery(
    attribute=refine.ls_R_factor_R_free,
    operator="less",
    value=0.25
)

high_quality = resolution_query & rfactor_query
results = list(high_quality())
```

### Finding Recent Structures

```python
from rcsbapi.search import AttributeQuery
from rcsbapi.search.attrs import rcsb_accession_info

# Structures released in last month
import datetime

one_month_ago = (datetime.date.today() - datetime.timedelta(days=30)).isoformat()
today = datetime.date.today().isoformat()

query = AttributeQuery(
    attribute=rcsb_accession_info.initial_release_date,
    operator="range",
    value=(one_month_ago, today)
)

recent_structures = list(query())
```

## Troubleshooting

### Common Errors

**404 Not Found:**
- PDB ID doesn't exist or is obsolete
- Check if ID is correct (case-sensitive)
- Verify entry hasn't been superseded

**429 Too Many Requests:**
- Rate limit exceeded
- Implement exponential backoff
- Reduce request frequency

**500 Internal Server Error:**
- Temporary server issue
- Retry after short delay
- Check RCSB PDB status page

**Empty Results:**
- Query too restrictive
- Check attribute names and operators
- Verify data exists for searched field

### Debugging Tips

```python
# Enable verbose output for searches
from rcsbapi.search import TextQuery

query = TextQuery("hemoglobin")
print(query.to_dict())  # See query structure

# Check query JSON
import json
print(json.dumps(query.to_dict(), indent=2))

# Test with curl
import subprocess
result = subprocess.run(
    ["curl", "https://data.rcsb.org/rest/v1/core/entry/4HHB"],
    capture_output=True,
    text=True
)
print(result.stdout)
```

## Additional Resources

- **API Documentation:** https://www.rcsb.org/docs/programmatic-access/web-apis-overview
- **Data API Redoc:** https://data.rcsb.org/redoc/index.html
- **GraphQL Schema:** https://data.rcsb.org/graphql
- **Python Package Docs:** https://rcsbapi.readthedocs.io/
- **GitHub Issues:** https://github.com/rcsb/py-rcsb-api/issues
- **Community Forum:** https://www.rcsb.org/help
