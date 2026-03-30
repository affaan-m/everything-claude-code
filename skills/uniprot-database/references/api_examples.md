# UniProt API Examples

Practical code examples for interacting with the UniProt REST API in multiple languages.

## Python Examples

### Example 1: Basic Search
```python
import requests

# Search for human insulin proteins
url = "https://rest.uniprot.org/uniprotkb/search"
params = {
    "query": "insulin AND organism_id:9606 AND reviewed:true",
    "format": "json",
    "size": 10
}

response = requests.get(url, params=params)
data = response.json()

for result in data['results']:
    print(f"{result['primaryAccession']}: {result['proteinDescription']['recommendedName']['fullName']['value']}")
```

### Example 2: Retrieve Protein Sequence
```python
import requests

# Get human insulin sequence in FASTA format
accession = "P01308"
url = f"https://rest.uniprot.org/uniprotkb/{accession}.fasta"

response = requests.get(url)
print(response.text)
```

### Example 3: Custom Fields
```python
import requests

# Get specific fields only
url = "https://rest.uniprot.org/uniprotkb/search"
params = {
    "query": "gene:BRCA1 AND reviewed:true",
    "format": "tsv",
    "fields": "accession,gene_names,organism_name,length,cc_function"
}

response = requests.get(url, params=params)
print(response.text)
```

### Example 4: ID Mapping
```python
import requests
import time

def map_uniprot_ids(ids, from_db, to_db):
    # Submit job
    submit_url = "https://rest.uniprot.org/idmapping/run"
    data = {
        "from": from_db,
        "to": to_db,
        "ids": ",".join(ids)
    }

    response = requests.post(submit_url, data=data)
    job_id = response.json()["jobId"]

    # Poll for completion
    status_url = f"https://rest.uniprot.org/idmapping/status/{job_id}"
    while True:
        response = requests.get(status_url)
        status = response.json()
        if "results" in status or "failedIds" in status:
            break
        time.sleep(3)

    # Get results
    results_url = f"https://rest.uniprot.org/idmapping/results/{job_id}"
    response = requests.get(results_url)
    return response.json()

# Map UniProt IDs to PDB
ids = ["P01308", "P04637"]
mapping = map_uniprot_ids(ids, "UniProtKB_AC-ID", "PDB")
print(mapping)
```

### Example 5: Stream Large Results
```python
import requests

# Stream all reviewed human proteins
url = "https://rest.uniprot.org/uniprotkb/stream"
params = {
    "query": "organism_id:9606 AND reviewed:true",
    "format": "fasta"
}

response = requests.get(url, params=params, stream=True)

# Process in chunks
with open("human_proteins.fasta", "w") as f:
    for chunk in response.iter_content(chunk_size=8192, decode_unicode=True):
        if chunk:
            f.write(chunk)
```

### Example 6: Pagination
```python
import requests

def get_all_results(query, fields=None):
    """Get all results with pagination"""
    url = "https://rest.uniprot.org/uniprotkb/search"
    all_results = []

    params = {
        "query": query,
        "format": "json",
        "size": 500  # Max size per page
    }

    if fields:
        params["fields"] = ",".join(fields)

    while True:
        response = requests.get(url, params=params)
        data = response.json()
        all_results.extend(data['results'])

        # Check for next page
        if 'next' in data:
            url = data['next']
        else:
            break

    return all_results

# Get all human kinases
results = get_all_results(
    "protein_name:kinase AND organism_id:9606 AND reviewed:true",
    fields=["accession", "gene_names", "protein_name"]
)
print(f"Found {len(results)} proteins")
```

## cURL Examples

### Example 1: Simple Search
```bash
# Search for insulin proteins
curl "https://rest.uniprot.org/uniprotkb/search?query=insulin&format=json&size=5"
```

### Example 2: Get Protein Entry
```bash
# Get human insulin in FASTA format
curl "https://rest.uniprot.org/uniprotkb/P01308.fasta"
```

### Example 3: Custom Fields
```bash
# Get specific fields in TSV format
curl "https://rest.uniprot.org/uniprotkb/search?query=gene:BRCA1&format=tsv&fields=accession,gene_names,length"
```

### Example 4: ID Mapping - Submit Job
```bash
# Submit mapping job
curl -X POST "https://rest.uniprot.org/idmapping/run" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "from=UniProtKB_AC-ID&to=PDB&ids=P01308,P04637"
```

### Example 5: ID Mapping - Get Results
```bash
# Get mapping results (replace JOB_ID)
curl "https://rest.uniprot.org/idmapping/results/JOB_ID"
```

### Example 6: Download All Results
```bash
# Download all human reviewed proteins
curl "https://rest.uniprot.org/uniprotkb/stream?query=organism_id:9606+AND+reviewed:true&format=fasta" \
  -o human_proteins.fasta
```

## R Examples

### Example 1: Basic Search
```r
library(httr)
library(jsonlite)

# Search for insulin proteins
url <- "https://rest.uniprot.org/uniprotkb/search"
query_params <- list(
  query = "insulin AND organism_id:9606",
  format = "json",
  size = 10
)

response <- GET(url, query = query_params)
data <- fromJSON(content(response, "text"))

# Extract accessions and names
proteins <- data$results[, c("primaryAccession", "proteinDescription")]
print(proteins)
```

### Example 2: Get Sequences
```r
library(httr)

# Get protein sequence
accession <- "P01308"
url <- paste0("https://rest.uniprot.org/uniprotkb/", accession, ".fasta")

response <- GET(url)
sequence <- content(response, "text")
cat(sequence)
```

### Example 3: Download to Data Frame
```r
library(httr)
library(readr)

# Get data as TSV
url <- "https://rest.uniprot.org/uniprotkb/search"
query_params <- list(
  query = "gene:BRCA1 AND reviewed:true",
  format = "tsv",
  fields = "accession,gene_names,organism_name,length"
)

response <- GET(url, query = query_params)
data <- read_tsv(content(response, "text"))
print(data)
```

## JavaScript Examples

### Example 1: Fetch API
```javascript
// Search for proteins
async function searchUniProt(query) {
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=10`;

  const response = await fetch(url);
  const data = await response.json();

  return data.results;
}

// Usage
searchUniProt("insulin AND organism_id:9606")
  .then(results => console.log(results));
```

### Example 2: Get Protein Entry
```javascript
async function getProtein(accession, format = "json") {
  const url = `https://rest.uniprot.org/uniprotkb/${accession}.${format}`;

  const response = await fetch(url);

  if (format === "json") {
    return await response.json();
  } else {
    return await response.text();
  }
}

// Usage
getProtein("P01308", "fasta")
  .then(sequence => console.log(sequence));
```

### Example 3: ID Mapping
```javascript
async function mapIds(ids, fromDb, toDb) {
  // Submit job
  const submitUrl = "https://rest.uniprot.org/idmapping/run";
  const formData = new URLSearchParams({
    from: fromDb,
    to: toDb,
    ids: ids.join(",")
  });

  const submitResponse = await fetch(submitUrl, {
    method: "POST",
    body: formData
  });
  const { jobId } = await submitResponse.json();

  // Poll for completion
  const statusUrl = `https://rest.uniprot.org/idmapping/status/${jobId}`;
  while (true) {
    const statusResponse = await fetch(statusUrl);
    const status = await statusResponse.json();

    if ("results" in status || "failedIds" in status) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Get results
  const resultsUrl = `https://rest.uniprot.org/idmapping/results/${jobId}`;
  const resultsResponse = await fetch(resultsUrl);
  return await resultsResponse.json();
}

// Usage
mapIds(["P01308", "P04637"], "UniProtKB_AC-ID", "PDB")
  .then(mapping => console.log(mapping));
```

## Advanced Examples

### Example: Batch Processing with Rate Limiting
```python
import requests
import time
from typing import List, Dict

class UniProtClient:
    def __init__(self, rate_limit=1.0):
        self.base_url = "https://rest.uniprot.org"
        self.rate_limit = rate_limit
        self.last_request = 0

    def _rate_limit(self):
        """Enforce rate limiting"""
        elapsed = time.time() - self.last_request
        if elapsed < self.rate_limit:
            time.sleep(self.rate_limit - elapsed)
        self.last_request = time.time()

    def batch_get_proteins(self, accessions: List[str],
                          batch_size: int = 100) -> List[Dict]:
        """Get proteins in batches"""
        results = []

        for i in range(0, len(accessions), batch_size):
            batch = accessions[i:i + batch_size]
            query = " OR ".join([f"accession:{acc}" for acc in batch])

            self._rate_limit()

            response = requests.get(
                f"{self.base_url}/uniprotkb/search",
                params={
                    "query": query,
                    "format": "json",
                    "size": batch_size
                }
            )

            if response.ok:
                data = response.json()
                results.extend(data.get('results', []))
            else:
                print(f"Error in batch {i//batch_size}: {response.status_code}")

        return results

# Usage
client = UniProtClient(rate_limit=0.5)
accessions = ["P01308", "P04637", "P12345", "Q9Y6K9"]
proteins = client.batch_get_proteins(accessions)
```

### Example: Download with Progress Bar
```python
import requests
from tqdm import tqdm

def download_with_progress(query, output_file, format="fasta"):
    """Download results with progress bar"""
    url = "https://rest.uniprot.org/uniprotkb/stream"
    params = {
        "query": query,
        "format": format
    }

    response = requests.get(url, params=params, stream=True)
    total_size = int(response.headers.get('content-length', 0))

    with open(output_file, 'wb') as f, \
         tqdm(total=total_size, unit='B', unit_scale=True) as pbar:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            pbar.update(len(chunk))

# Usage
download_with_progress(
    "organism_id:9606 AND reviewed:true",
    "human_proteome.fasta"
)
```

## Resources

- API Documentation: https://www.uniprot.org/help/api
- Interactive API Explorer: https://www.uniprot.org/api-documentation
- Python client (Unipressed): https://github.com/multimeric/Unipressed
- Bioservices package: https://bioservices.readthedocs.io/
