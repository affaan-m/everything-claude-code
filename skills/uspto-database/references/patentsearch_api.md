# PatentSearch API Reference

## Overview

The PatentSearch API is USPTO's modern ElasticSearch-based patent search system that replaced the legacy PatentsView API in May 2025. It provides access to patent data through June 30, 2025, with regular updates.

**Base URL:** `https://search.patentsview.org/api/v1/`

## Authentication

All API requests require authentication using an API key in the request header:

```
X-Api-Key: YOUR_API_KEY
```

Register for an API key at: https://account.uspto.gov/api-manager/

## Rate Limits

- **45 requests per minute** per API key
- Exceeding rate limits results in HTTP 429 errors

## Available Endpoints

### Core Patent & Publication Endpoints

- **`/patent`** - General patent data (granted patents)
- **`/publication`** - Pregrant publication data
- **`/publication/rel_app_text`** - Related application data for publications

### Entity Endpoints

- **`/inventor`** - Inventor information with location and gender code fields
- **`/assignee`** - Assignee details with location identifiers
- **`/location`** - Geographic data including latitude/longitude coordinates
- **`/attorney`** - Legal representative information

### Classification Endpoints

- **`/cpc_subclass`** - Cooperative Patent Classification at subclass level
- **`/cpc_at_issue`** - CPC classification as of patent issue date
- **`/uspc`** - US Patent Classification data
- **`/wipo`** - World Intellectual Property Organization classifications
- **`/ipc`** - International Patent Classification

### Text Data Endpoints (Beta)

- **`/brief_summary_text`** - Patent brief summaries (granted and pre-grant)
- **`/claims`** - Patent claims text
- **`/drawing_description_text`** - Drawing descriptions
- **`/detail_description_text`** - Detailed description text

*Note: Text endpoints are in beta with data primarily from 2023 onward. Historical backfilling is in progress.*

### Supporting Endpoints

- **`/other_reference`** - Patent reference materials
- **`/related_document`** - Cross-references between patents

## Query Parameters

All endpoints support four main parameters:

### 1. Query String (`q`)

Filters data using JSON query objects. **Required parameter.**

**Query Operators:**

- **Equality**: `{"field": "value"}` or `{"field": {"_eq": "value"}}`
- **Not equal**: `{"field": {"_neq": "value"}}`
- **Comparison**: `_gt`, `_gte`, `_lt`, `_lte`
- **String matching**:
  - `_begins` - starts with
  - `_contains` - substring match
- **Full-text search** (recommended for text fields):
  - `_text_all` - all terms must match
  - `_text_any` - any term matches
  - `_text_phrase` - exact phrase match
- **Logical operators**: `_and`, `_or`, `_not`
- **Array matching**: Use arrays for OR conditions

**Examples:**

```json
// Simple equality
{"patent_number": "11234567"}

// Date range
{"patent_date": {"_gte": "2020-01-01", "_lte": "2020-12-31"}}

// Text search (preferred for text fields)
{"patent_abstract": {"_text_all": ["machine", "learning"]}}

// Inventor name
{"inventor_name": {"_text_phrase": "John Smith"}}

// Complex query with logical operators
{
  "_and": [
    {"patent_date": {"_gte": "2020-01-01"}},
    {"assignee_organization": {"_text_any": ["Google", "Alphabet"]}}
  ]
}

// Array for OR conditions
{"cpc_subclass_id": ["H04N", "H04L"]}
```

### 2. Field List (`f`)

Specifies which fields to return in the response. Optional - each endpoint has default fields.

**Format:** JSON array of field names

```json
["patent_number", "patent_title", "patent_date", "inventor_name"]
```

### 3. Sorting (`s`)

Orders results by specified fields. Optional.

**Format:** JSON array with field name and direction

```json
[{"patent_date": "desc"}]
```

### 4. Options (`o`)

Controls pagination and additional settings. Optional.

**Available options:**

- `page` - Page number (default: 1)
- `per_page` - Records per page (default: 100, max: 1,000)
- `pad_patent_id` - Pad patent IDs with leading zeros (default: false)
- `exclude_withdrawn` - Exclude withdrawn patents (default: true)

**Format:** JSON object

```json
{
  "page": 1,
  "per_page": 500,
  "exclude_withdrawn": false
}
```

## Response Format

All responses follow this structure:

```json
{
  "error": false,
  "count": 100,
  "total_hits": 5432,
  "patents": [...],
  // or "inventors": [...], "assignees": [...], etc.
}
```

- `error` - Boolean indicating if an error occurred
- `count` - Number of records in current response
- `total_hits` - Total number of matching records
- Endpoint-specific data array (e.g., `patents`, `inventors`)

## Complete Request Example

### Using curl

```bash
curl -X POST "https://search.patentsview.org/api/v1/patent" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "q": {
      "_and": [
        {"patent_date": {"_gte": "2024-01-01"}},
        {"patent_abstract": {"_text_all": ["artificial", "intelligence"]}}
      ]
    },
    "f": ["patent_number", "patent_title", "patent_date", "assignee_organization"],
    "s": [{"patent_date": "desc"}],
    "o": {"per_page": 100}
  }'
```

### Using Python

```python
import requests

url = "https://search.patentsview.org/api/v1/patent"
headers = {
    "X-Api-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "q": {
        "_and": [
            {"patent_date": {"_gte": "2024-01-01"}},
            {"patent_abstract": {"_text_all": ["artificial", "intelligence"]}}
        ]
    },
    "f": ["patent_number", "patent_title", "patent_date", "assignee_organization"],
    "s": [{"patent_date": "desc"}],
    "o": {"per_page": 100}
}

response = requests.post(url, headers=headers, json=data)
results = response.json()
```

## Common Field Names

### Patent Endpoint Fields

- `patent_number` - Patent number
- `patent_title` - Title of the patent
- `patent_date` - Grant date
- `patent_abstract` - Abstract text
- `patent_type` - Type of patent
- `inventor_name` - Inventor names (array)
- `assignee_organization` - Assignee company names (array)
- `cpc_subclass_id` - CPC classification codes
- `uspc_class` - US classification codes
- `cited_patent_number` - Citations to other patents
- `citedby_patent_number` - Patents citing this patent

Refer to the full field dictionary at: https://search.patentsview.org/docs/

## Best Practices

1. **Use `_text*` operators for text fields** - More performant than `_contains` or `_begins`
2. **Request only needed fields** - Reduces response size and improves performance
3. **Implement pagination** - Handle large result sets efficiently
4. **Respect rate limits** - Implement backoff/retry logic for 429 errors
5. **Cache results** - Reduce redundant API calls
6. **Use date ranges** - Narrow searches to improve performance

## Error Handling

Common HTTP status codes:

- **200** - Success
- **400** - Bad request (invalid query syntax)
- **401** - Unauthorized (missing or invalid API key)
- **429** - Too many requests (rate limit exceeded)
- **500** - Server error

## Recent Updates (February 2025)

- Data updated through December 31, 2024
- New `pad_patent_id` option for formatting patent IDs
- New `exclude_withdrawn` option to show withdrawn patents
- Text endpoints continue beta backfilling

## Resources

- **Official Documentation**: https://search.patentsview.org/docs/
- **API Key Registration**: https://account.uspto.gov/api-manager/
- **Legacy API Notice**: The old PatentsView API was discontinued May 1, 2025
