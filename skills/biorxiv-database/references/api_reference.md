# bioRxiv API Reference

## Overview

The bioRxiv API provides programmatic access to preprint metadata from the bioRxiv server. The API returns JSON-formatted data with comprehensive metadata about life sciences preprints.

## Base URL

```
https://api.biorxiv.org
```

## Rate Limiting

Be respectful of the API:
- Add delays between requests (minimum 0.5 seconds recommended)
- Use appropriate User-Agent headers
- Cache results when possible

## API Endpoints

### 1. Details by Date Range

Retrieve preprints posted within a specific date range.

**Endpoint:**
```
GET /details/biorxiv/{start_date}/{end_date}
GET /details/biorxiv/{start_date}/{end_date}/{category}
```

**Parameters:**
- `start_date`: Start date in YYYY-MM-DD format
- `end_date`: End date in YYYY-MM-DD format
- `category` (optional): Filter by subject category

**Example:**
```
GET https://api.biorxiv.org/details/biorxiv/2024-01-01/2024-01-31
GET https://api.biorxiv.org/details/biorxiv/2024-01-01/2024-01-31/neuroscience
```

**Response:**
```json
{
  "messages": [
    {
      "status": "ok",
      "count": 150,
      "total": 150
    }
  ],
  "collection": [
    {
      "doi": "10.1101/2024.01.15.123456",
      "title": "Example Paper Title",
      "authors": "Smith J, Doe J, Johnson A",
      "author_corresponding": "Smith J",
      "author_corresponding_institution": "University Example",
      "date": "2024-01-15",
      "version": "1",
      "type": "new results",
      "license": "cc_by",
      "category": "neuroscience",
      "jatsxml": "https://www.biorxiv.org/content/...",
      "abstract": "This is the abstract...",
      "published": ""
    }
  ]
}
```

### 2. Details by DOI

Retrieve details for a specific preprint by DOI.

**Endpoint:**
```
GET /details/biorxiv/{doi}
```

**Parameters:**
- `doi`: The DOI of the preprint (e.g., `10.1101/2024.01.15.123456`)

**Example:**
```
GET https://api.biorxiv.org/details/biorxiv/10.1101/2024.01.15.123456
```

### 3. Publications by Interval

Retrieve recent publications from a time interval.

**Endpoint:**
```
GET /pubs/biorxiv/{interval}/{cursor}/{format}
```

**Parameters:**
- `interval`: Number of days back to search (e.g., `1` for last 24 hours)
- `cursor`: Pagination cursor (0 for first page, increment by 100 for subsequent pages)
- `format`: Response format (`json` or `xml`)

**Example:**
```
GET https://api.biorxiv.org/pubs/biorxiv/1/0/json
```

**Response includes pagination:**
```json
{
  "messages": [
    {
      "status": "ok",
      "count": 100,
      "total": 250,
      "cursor": 100
    }
  ],
  "collection": [...]
}
```

## Valid Categories

bioRxiv organizes preprints into the following categories:

- `animal-behavior-and-cognition`
- `biochemistry`
- `bioengineering`
- `bioinformatics`
- `biophysics`
- `cancer-biology`
- `cell-biology`
- `clinical-trials`
- `developmental-biology`
- `ecology`
- `epidemiology`
- `evolutionary-biology`
- `genetics`
- `genomics`
- `immunology`
- `microbiology`
- `molecular-biology`
- `neuroscience`
- `paleontology`
- `pathology`
- `pharmacology-and-toxicology`
- `physiology`
- `plant-biology`
- `scientific-communication-and-education`
- `synthetic-biology`
- `systems-biology`
- `zoology`

## Paper Metadata Fields

Each paper in the `collection` array contains:

| Field | Description | Type |
|-------|-------------|------|
| `doi` | Digital Object Identifier | string |
| `title` | Paper title | string |
| `authors` | Comma-separated author list | string |
| `author_corresponding` | Corresponding author name | string |
| `author_corresponding_institution` | Corresponding author's institution | string |
| `date` | Publication date (YYYY-MM-DD) | string |
| `version` | Version number | string |
| `type` | Type of submission (e.g., "new results") | string |
| `license` | License type (e.g., "cc_by") | string |
| `category` | Subject category | string |
| `jatsxml` | URL to JATS XML | string |
| `abstract` | Paper abstract | string |
| `published` | Journal publication info (if published) | string |

## Downloading Full Papers

### PDF Download

PDFs can be downloaded directly (not through API):

```
https://www.biorxiv.org/content/{doi}v{version}.full.pdf
```

Example:
```
https://www.biorxiv.org/content/10.1101/2024.01.15.123456v1.full.pdf
```

### HTML Version

```
https://www.biorxiv.org/content/{doi}v{version}
```

### JATS XML

Full structured XML is available via the `jatsxml` field in the API response.

## Common Search Patterns

### Author Search

1. Get papers from date range
2. Filter by author name (case-insensitive substring match in `authors` field)

### Keyword Search

1. Get papers from date range (optionally filtered by category)
2. Search in title, abstract, or both fields
3. Filter papers containing keywords (case-insensitive)

### Recent Papers by Category

1. Use `/pubs/biorxiv/{interval}/0/json` endpoint
2. Filter by category if needed

## Error Handling

Common HTTP status codes:
- `200`: Success
- `404`: Resource not found
- `500`: Server error

Always check the `messages` array in the response:
```json
{
  "messages": [
    {
      "status": "ok",
      "count": 100
    }
  ]
}
```

## Best Practices

1. **Cache results**: Store retrieved papers to avoid repeated API calls
2. **Use appropriate date ranges**: Smaller date ranges return faster
3. **Filter by category**: Reduces data transfer and processing time
4. **Batch processing**: When downloading multiple PDFs, add delays between requests
5. **Error handling**: Always check response status and handle errors gracefully
6. **Version tracking**: Note that papers can have multiple versions

## Python Usage Example

```python
from biorxiv_search import BioRxivSearcher

searcher = BioRxivSearcher(verbose=True)

# Search by keywords
papers = searcher.search_by_keywords(
    keywords=["CRISPR", "gene editing"],
    start_date="2024-01-01",
    end_date="2024-12-31",
    category="genomics"
)

# Search by author
papers = searcher.search_by_author(
    author_name="Smith",
    start_date="2023-01-01",
    end_date="2024-12-31"
)

# Get specific paper
paper = searcher.get_paper_details("10.1101/2024.01.15.123456")

# Download PDF
searcher.download_pdf("10.1101/2024.01.15.123456", "paper.pdf")
```

## External Resources

- bioRxiv homepage: https://www.biorxiv.org/
- API documentation: https://api.biorxiv.org/
- JATS XML specification: https://jats.nlm.nih.gov/
