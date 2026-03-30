# Common OpenAlex Query Examples

This document provides practical examples for common research queries using OpenAlex.

## Finding Papers by Author

**User query**: "Find papers by Albert Einstein"

**Approach**: Two-step pattern
1. Search for author to get ID
2. Filter works by author ID

**Python example**:
```python
from scripts.openalex_client import OpenAlexClient
from scripts.query_helpers import find_author_works

client = OpenAlexClient(email="your-email@example.edu")
works = find_author_works("Albert Einstein", client, limit=100)

for work in works:
    print(f"{work['title']} ({work['publication_year']})")
```

## Finding Papers from an Institution

**User query**: "What papers has MIT published in the last year?"

**Approach**: Two-step pattern with date filter
1. Search for institution to get ID
2. Filter works by institution ID and year

**Python example**:
```python
from scripts.query_helpers import find_institution_works

works = find_institution_works("MIT", client, limit=200)

# Filter for recent papers
import datetime
current_year = datetime.datetime.now().year
recent_works = [w for w in works if w['publication_year'] == current_year]
```

## Highly Cited Papers on a Topic

**User query**: "Find the most cited papers on CRISPR from the last 5 years"

**Approach**: Search + filter + sort

**Python example**:
```python
works = client.search_works(
    search="CRISPR",
    filter_params={
        "publication_year": ">2019"
    },
    sort="cited_by_count:desc",
    per_page=100
)

for work in works['results']:
    title = work['title']
    citations = work['cited_by_count']
    year = work['publication_year']
    print(f"{title} ({year}): {citations} citations")
```

## Open Access Papers on a Topic

**User query**: "Find open access papers about climate change"

**Approach**: Search + OA filter

**Python example**:
```python
from scripts.query_helpers import get_open_access_papers

papers = get_open_access_papers(
    search_term="climate change",
    client=client,
    oa_status="any",  # or "gold", "green", "hybrid", "bronze"
    limit=200
)

for paper in papers:
    print(f"{paper['title']}")
    print(f"  OA Status: {paper['open_access']['oa_status']}")
    print(f"  URL: {paper['open_access']['oa_url']}")
```

## Publication Trends Analysis

**User query**: "Show me publication trends for machine learning over the years"

**Approach**: Use group_by to aggregate by year

**Python example**:
```python
from scripts.query_helpers import get_publication_trends

trends = get_publication_trends(
    search_term="machine learning",
    client=client
)

# Sort by year
trends_sorted = sorted(trends, key=lambda x: x['key'])

for trend in trends_sorted[-10:]:  # Last 10 years
    year = trend['key']
    count = trend['count']
    print(f"{year}: {count} publications")
```

## Analyzing Research Output

**User query**: "Analyze the research output of Stanford University from 2020-2024"

**Approach**: Multiple aggregations for comprehensive analysis

**Python example**:
```python
from scripts.query_helpers import analyze_research_output

analysis = analyze_research_output(
    entity_type='institution',
    entity_name='Stanford University',
    client=client,
    years='2020-2024'
)

print(f"Institution: {analysis['entity_name']}")
print(f"Total works: {analysis['total_works']}")
print(f"Open access: {analysis['open_access_percentage']}%")
print("\nTop topics:")
for topic in analysis['top_topics'][:5]:
    print(f"  - {topic['key_display_name']}: {topic['count']} works")
```

## Finding Papers by DOI (Batch)

**User query**: "Get information for these 10 DOIs: ..."

**Approach**: Batch lookup with pipe separator

**Python example**:
```python
dois = [
    "https://doi.org/10.1371/journal.pone.0266781",
    "https://doi.org/10.1371/journal.pone.0267149",
    "https://doi.org/10.1038/s41586-021-03819-2",
    # ... up to 50 DOIs
]

works = client.batch_lookup(
    entity_type='works',
    ids=dois,
    id_field='doi'
)

for work in works:
    print(f"{work['title']} - {work['publication_year']}")
```

## Random Sample of Papers

**User query**: "Give me 50 random papers from 2023"

**Approach**: Use sample parameter with seed for reproducibility

**Python example**:
```python
works = client.sample_works(
    sample_size=50,
    seed=42,  # For reproducibility
    filter_params={
        "publication_year": "2023",
        "is_oa": "true"
    }
)

print(f"Got {len(works)} random papers from 2023")
```

## Papers from Multiple Institutions

**User query**: "Find papers with authors from both MIT and Stanford"

**Approach**: Use + operator for AND within same attribute

**Python example**:
```python
# First, get institution IDs
mit_response = client._make_request(
    '/institutions',
    params={'search': 'MIT', 'per-page': 1}
)
mit_id = mit_response['results'][0]['id'].split('/')[-1]

stanford_response = client._make_request(
    '/institutions',
    params={'search': 'Stanford', 'per-page': 1}
)
stanford_id = stanford_response['results'][0]['id'].split('/')[-1]

# Find works with authors from both institutions
works = client.search_works(
    filter_params={
        "authorships.institutions.id": f"{mit_id}+{stanford_id}"
    },
    per_page=100
)

print(f"Found {works['meta']['count']} collaborative papers")
```

## Papers in a Specific Journal

**User query**: "Get all papers from Nature published in 2023"

**Approach**: Two-step - find journal ID, then filter works

**Python example**:
```python
# Step 1: Find journal source ID
source_response = client._make_request(
    '/sources',
    params={'search': 'Nature', 'per-page': 1}
)
source = source_response['results'][0]
source_id = source['id'].split('/')[-1]

print(f"Found journal: {source['display_name']} (ID: {source_id})")

# Step 2: Get works from that source
works = client.search_works(
    filter_params={
        "primary_location.source.id": source_id,
        "publication_year": "2023"
    },
    per_page=200
)

print(f"Found {works['meta']['count']} papers from Nature in 2023")
```

## Topic Analysis by Institution

**User query**: "What topics does MIT research most?"

**Approach**: Filter by institution, group by topics

**Python example**:
```python
# Get MIT ID
inst_response = client._make_request(
    '/institutions',
    params={'search': 'MIT', 'per-page': 1}
)
mit_id = inst_response['results'][0]['id'].split('/')[-1]

# Group by topics
topics = client.group_by(
    entity_type='works',
    group_field='topics.id',
    filter_params={
        "authorships.institutions.id": mit_id,
        "publication_year": ">2020"
    }
)

print("Top research topics at MIT (2020+):")
for i, topic in enumerate(topics[:10], 1):
    print(f"{i}. {topic['key_display_name']}: {topic['count']} works")
```

## Citation Analysis

**User query**: "Find papers that cite this specific DOI"

**Approach**: Get work by DOI, then use cited_by_api_url

**Python example**:
```python
# Get the work
doi = "https://doi.org/10.1038/s41586-021-03819-2"
work = client.get_entity('works', doi)

# Get papers that cite it
cited_by_url = work['cited_by_api_url']

# Extract just the query part and use it
import requests
response = requests.get(cited_by_url, params={'mailto': client.email})
citing_works = response.json()

print(f"{work['title']}")
print(f"Total citations: {work['cited_by_count']}")
print(f"\nRecent citing papers:")
for citing_work in citing_works['results'][:5]:
    print(f"  - {citing_work['title']} ({citing_work['publication_year']})")
```

## Large-Scale Data Extraction

**User query**: "Get all papers on quantum computing from the last 3 years"

**Approach**: Paginate through all results

**Python example**:
```python
all_papers = client.paginate_all(
    endpoint='/works',
    params={
        'search': 'quantum computing',
        'filter': 'publication_year:2022-2024'
    },
    max_results=10000  # Limit to prevent excessive API calls
)

print(f"Retrieved {len(all_papers)} papers")

# Save to CSV
import csv
with open('quantum_papers.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Title', 'Year', 'Citations', 'DOI', 'OA Status'])

    for paper in all_papers:
        writer.writerow([
            paper['title'],
            paper['publication_year'],
            paper['cited_by_count'],
            paper.get('doi', 'N/A'),
            paper['open_access']['oa_status']
        ])
```

## Complex Multi-Filter Query

**User query**: "Find recent, highly-cited, open access papers on AI from top institutions"

**Approach**: Combine multiple filters

**Python example**:
```python
# Get IDs for top institutions
top_institutions = ['MIT', 'Stanford', 'Oxford']
inst_ids = []

for inst_name in top_institutions:
    response = client._make_request(
        '/institutions',
        params={'search': inst_name, 'per-page': 1}
    )
    if response['results']:
        inst_id = response['results'][0]['id'].split('/')[-1]
        inst_ids.append(inst_id)

# Combine with pipe for OR
inst_filter = '|'.join(inst_ids)

# Complex query
works = client.search_works(
    search="artificial intelligence",
    filter_params={
        "publication_year": ">2022",
        "cited_by_count": ">50",
        "is_oa": "true",
        "authorships.institutions.id": inst_filter
    },
    sort="cited_by_count:desc",
    per_page=200
)

print(f"Found {works['meta']['count']} papers matching criteria")
for work in works['results'][:10]:
    print(f"{work['title']}")
    print(f"  Citations: {work['cited_by_count']}, Year: {work['publication_year']}")
```
