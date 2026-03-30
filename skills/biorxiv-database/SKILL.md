---
name: biorxiv-database
description: Efficient database search tool for bioRxiv preprint server. Use this skill when searching for life sciences preprints by keywords, authors, date ranges, or categories, retrieving paper metadata, downloading PDFs, or conducting literature reviews.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# bioRxiv Database

## Overview

This skill provides efficient Python-based tools for searching and retrieving preprints from the bioRxiv database. It enables comprehensive searches by keywords, authors, date ranges, and categories, returning structured JSON metadata that includes titles, abstracts, DOIs, and citation information. The skill also supports PDF downloads for full-text analysis.

## When to Use This Skill

Use this skill when:
- Searching for recent preprints in specific research areas
- Tracking publications by particular authors
- Conducting systematic literature reviews
- Analyzing research trends over time periods
- Retrieving metadata for citation management
- Downloading preprint PDFs for analysis
- Filtering papers by bioRxiv subject categories

## Core Search Capabilities

### 1. Keyword Search

Search for preprints containing specific keywords in titles, abstracts, or author lists.

**Basic Usage:**
```python
python scripts/biorxiv_search.py \
  --keywords "CRISPR" "gene editing" \
  --start-date 2024-01-01 \
  --end-date 2024-12-31 \
  --output results.json
```

**With Category Filter:**
```python
python scripts/biorxiv_search.py \
  --keywords "neural networks" "deep learning" \
  --days-back 180 \
  --category neuroscience \
  --output recent_neuroscience.json
```

**Search Fields:**
By default, keywords are searched in both title and abstract. Customize with `--search-fields`:
```python
python scripts/biorxiv_search.py \
  --keywords "AlphaFold" \
  --search-fields title \
  --days-back 365
```

### 2. Author Search

Find all papers by a specific author within a date range.

**Basic Usage:**
```python
python scripts/biorxiv_search.py \
  --author "Smith" \
  --start-date 2023-01-01 \
  --end-date 2024-12-31 \
  --output smith_papers.json
```

**Recent Publications:**
```python
# Last year by default if no dates specified
python scripts/biorxiv_search.py \
  --author "Johnson" \
  --output johnson_recent.json
```

### 3. Date Range Search

Retrieve all preprints posted within a specific date range.

**Basic Usage:**
```python
python scripts/biorxiv_search.py \
  --start-date 2024-01-01 \
  --end-date 2024-01-31 \
  --output january_2024.json
```

**With Category Filter:**
```python
python scripts/biorxiv_search.py \
  --start-date 2024-06-01 \
  --end-date 2024-06-30 \
  --category genomics \
  --output genomics_june.json
```

**Days Back Shortcut:**
```python
# Last 30 days
python scripts/biorxiv_search.py \
  --days-back 30 \
  --output last_month.json
```

### 4. Paper Details by DOI

Retrieve detailed metadata for a specific preprint.

**Basic Usage:**
```python
python scripts/biorxiv_search.py \
  --doi "10.1101/2024.01.15.123456" \
  --output paper_details.json
```

**Full DOI URLs Accepted:**
```python
python scripts/biorxiv_search.py \
  --doi "https://doi.org/10.1101/2024.01.15.123456"
```

### 5. PDF Downloads

Download the full-text PDF of any preprint.

**Basic Usage:**
```python
python scripts/biorxiv_search.py \
  --doi "10.1101/2024.01.15.123456" \
  --download-pdf paper.pdf
```

**Batch Processing:**
For multiple PDFs, extract DOIs from a search result JSON and download each paper:
```python
import json
from biorxiv_search import BioRxivSearcher

# Load search results
with open('results.json') as f:
    data = json.load(f)

searcher = BioRxivSearcher(verbose=True)

# Download each paper
for i, paper in enumerate(data['results'][:10]):  # First 10 papers
    doi = paper['doi']
    searcher.download_pdf(doi, f"papers/paper_{i+1}.pdf")
```

## Valid Categories

Filter searches by bioRxiv subject categories:

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

## Output Format

All searches return structured JSON with the following format:

```json
{
  "query": {
    "keywords": ["CRISPR"],
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "category": "genomics"
  },
  "result_count": 42,
  "results": [
    {
      "doi": "10.1101/2024.01.15.123456",
      "title": "Paper Title Here",
      "authors": "Smith J, Doe J, Johnson A",
      "author_corresponding": "Smith J",
      "author_corresponding_institution": "University Example",
      "date": "2024-01-15",
      "version": "1",
      "type": "new results",
      "license": "cc_by",
      "category": "genomics",
      "abstract": "Full abstract text...",
      "pdf_url": "https://www.biorxiv.org/content/10.1101/2024.01.15.123456v1.full.pdf",
      "html_url": "https://www.biorxiv.org/content/10.1101/2024.01.15.123456v1",
      "jatsxml": "https://www.biorxiv.org/content/...",
      "published": ""
    }
  ]
}
```

## Common Usage Patterns

### Literature Review Workflow

1. **Broad keyword search:**
```python
python scripts/biorxiv_search.py \
  --keywords "organoids" "tissue engineering" \
  --start-date 2023-01-01 \
  --end-date 2024-12-31 \
  --category bioengineering \
  --output organoid_papers.json
```

2. **Extract and review results:**
```python
import json

with open('organoid_papers.json') as f:
    data = json.load(f)

print(f"Found {data['result_count']} papers")

for paper in data['results'][:5]:
    print(f"\nTitle: {paper['title']}")
    print(f"Authors: {paper['authors']}")
    print(f"Date: {paper['date']}")
    print(f"DOI: {paper['doi']}")
```

3. **Download selected papers:**
```python
from biorxiv_search import BioRxivSearcher

searcher = BioRxivSearcher()
selected_dois = ["10.1101/2024.01.15.123456", "10.1101/2024.02.20.789012"]

for doi in selected_dois:
    filename = doi.replace("/", "_").replace(".", "_") + ".pdf"
    searcher.download_pdf(doi, f"papers/{filename}")
```

### Trend Analysis

Track research trends by analyzing publication frequencies over time:

```python
python scripts/biorxiv_search.py \
  --keywords "machine learning" \
  --start-date 2020-01-01 \
  --end-date 2024-12-31 \
  --category bioinformatics \
  --output ml_trends.json
```

Then analyze the temporal distribution in the results.

### Author Tracking

Monitor specific researchers' preprints:

```python
# Track multiple authors
authors = ["Smith", "Johnson", "Williams"]

for author in authors:
    python scripts/biorxiv_search.py \
      --author "{author}" \
      --days-back 365 \
      --output "{author}_papers.json"
```

## Python API Usage

For more complex workflows, import and use the `BioRxivSearcher` class directly:

```python
from scripts.biorxiv_search import BioRxivSearcher

# Initialize
searcher = BioRxivSearcher(verbose=True)

# Multiple search operations
keywords_papers = searcher.search_by_keywords(
    keywords=["CRISPR", "gene editing"],
    start_date="2024-01-01",
    end_date="2024-12-31",
    category="genomics"
)

author_papers = searcher.search_by_author(
    author_name="Smith",
    start_date="2023-01-01",
    end_date="2024-12-31"
)

# Get specific paper details
paper = searcher.get_paper_details("10.1101/2024.01.15.123456")

# Download PDF
success = searcher.download_pdf(
    doi="10.1101/2024.01.15.123456",
    output_path="paper.pdf"
)

# Format results consistently
formatted = searcher.format_result(paper, include_abstract=True)
```

## Best Practices

1. **Use appropriate date ranges**: Smaller date ranges return faster. For keyword searches over long periods, consider splitting into multiple queries.

2. **Filter by category**: When possible, use `--category` to reduce data transfer and improve search precision.

3. **Respect rate limits**: The script includes automatic delays (0.5s between requests). For large-scale data collection, add additional delays.

4. **Cache results**: Save search results to JSON files to avoid repeated API calls.

5. **Version tracking**: Preprints can have multiple versions. The `version` field indicates which version is returned. PDF URLs include the version number.

6. **Handle errors gracefully**: Check the `result_count` in output JSON. Empty results may indicate date range issues or API connectivity problems.

7. **Verbose mode for debugging**: Use `--verbose` flag to see detailed logging of API requests and responses.

## Advanced Features

### Custom Date Range Logic

```python
from datetime import datetime, timedelta

# Last quarter
end_date = datetime.now()
start_date = end_date - timedelta(days=90)

python scripts/biorxiv_search.py \
  --start-date {start_date.strftime('%Y-%m-%d')} \
  --end-date {end_date.strftime('%Y-%m-%d')}
```

### Result Limiting

Limit the number of results returned:

```python
python scripts/biorxiv_search.py \
  --keywords "COVID-19" \
  --days-back 30 \
  --limit 50 \
  --output covid_top50.json
```

### Exclude Abstracts for Speed

When only metadata is needed:

```python
# Note: Abstract inclusion is controlled in Python API
from scripts.biorxiv_search import BioRxivSearcher

searcher = BioRxivSearcher()
papers = searcher.search_by_keywords(keywords=["AI"], days_back=30)
formatted = [searcher.format_result(p, include_abstract=False) for p in papers]
```

## Programmatic Integration

Integrate search results into downstream analysis pipelines:

```python
import json
import pandas as pd

# Load results
with open('results.json') as f:
    data = json.load(f)

# Convert to DataFrame for analysis
df = pd.DataFrame(data['results'])

# Analyze
print(f"Total papers: {len(df)}")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")
print(f"\nTop authors by paper count:")
print(df['authors'].str.split(',').explode().str.strip().value_counts().head(10))

# Filter and export
recent = df[df['date'] >= '2024-06-01']
recent.to_csv('recent_papers.csv', index=False)
```

## Testing the Skill

To verify that the bioRxiv database skill is working correctly, run the comprehensive test suite.

**Prerequisites:**
```bash
uv pip install requests
```

**Run tests:**
```bash
python tests/test_biorxiv_search.py
```

The test suite validates:
- **Initialization**: BioRxivSearcher class instantiation
- **Date Range Search**: Retrieving papers within specific date ranges
- **Category Filtering**: Filtering papers by bioRxiv categories
- **Keyword Search**: Finding papers containing specific keywords
- **DOI Lookup**: Retrieving specific papers by DOI
- **Result Formatting**: Proper formatting of paper metadata
- **Interval Search**: Fetching recent papers by time intervals

**Expected Output:**
```
🧬 bioRxiv Database Search Skill Test Suite
======================================================================

🧪 Test 1: Initialization
✅ BioRxivSearcher initialized successfully

🧪 Test 2: Date Range Search
✅ Found 150 papers between 2024-01-01 and 2024-01-07
   First paper: Novel CRISPR-based approach for genome editing...

[... additional tests ...]

======================================================================
📊 Test Summary
======================================================================
✅ PASS: Initialization
✅ PASS: Date Range Search
✅ PASS: Category Filtering
✅ PASS: Keyword Search
✅ PASS: DOI Lookup
✅ PASS: Result Formatting
✅ PASS: Interval Search
======================================================================
Results: 7/7 tests passed (100%)
======================================================================

🎉 All tests passed! The bioRxiv database skill is working correctly.
```

**Note:** Some tests may show warnings if no papers are found in specific date ranges or categories. This is normal and does not indicate a failure.

## Reference Documentation

For detailed API specifications, endpoint documentation, and response schemas, refer to:
- `references/api_reference.md` - Complete bioRxiv API documentation

The reference file includes:
- Full API endpoint specifications
- Response format details
- Error handling patterns
- Rate limiting guidelines
- Advanced search patterns

