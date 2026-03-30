# OpenFDA API Basics

This reference provides comprehensive information about using the openFDA API, including authentication, rate limits, query syntax, and best practices.

## Getting Started

### Base URL

All openFDA API endpoints follow this structure:
```
https://api.fda.gov/{category}/{endpoint}.json
```

Examples:
- `https://api.fda.gov/drug/event.json`
- `https://api.fda.gov/device/510k.json`
- `https://api.fda.gov/food/enforcement.json`

### HTTPS Required

**All requests must use HTTPS**. HTTP requests are not accepted and will fail.

## Authentication

### API Key Registration

While openFDA can be used without an API key, registering for a free API key is strongly recommended for higher rate limits.

**Registration**: Visit https://open.fda.gov/apis/authentication/ to sign up

**Benefits of API Key**:
- Higher rate limits (240 req/min, 120,000 req/day)
- Better for production applications
- No additional cost

### Using Your API Key

Include your API key in requests using one of two methods:

**Method 1: Query Parameter (Recommended)**
```python
import requests

api_key = "YOUR_API_KEY_HERE"
url = "https://api.fda.gov/drug/event.json"

params = {
    "api_key": api_key,
    "search": "patient.drug.medicinalproduct:aspirin",
    "limit": 10
}

response = requests.get(url, params=params)
```

**Method 2: Basic Authentication**
```python
import requests

api_key = "YOUR_API_KEY_HERE"
url = "https://api.fda.gov/drug/event.json"

params = {
    "search": "patient.drug.medicinalproduct:aspirin",
    "limit": 10
}

response = requests.get(url, params=params, auth=(api_key, ''))
```

## Rate Limits

### Current Limits

| Status | Requests per Minute | Requests per Day |
|--------|-------------------|------------------|
| **Without API Key** | 240 per IP address | 1,000 per IP address |
| **With API Key** | 240 per key | 120,000 per key |

### Rate Limit Headers

The API returns rate limit information in response headers:
```python
response = requests.get(url, params=params)

print(f"Rate limit: {response.headers.get('X-RateLimit-Limit')}")
print(f"Remaining: {response.headers.get('X-RateLimit-Remaining')}")
print(f"Reset time: {response.headers.get('X-RateLimit-Reset')}")
```

### Handling Rate Limits

When you exceed rate limits, the API returns:
- **Status Code**: `429 Too Many Requests`
- **Error Message**: Indicates rate limit exceeded

**Best Practice**: Implement exponential backoff:
```python
import requests
import time

def query_with_rate_limit_handling(url, params, max_retries=3):
    """Query API with automatic rate limit handling."""
    for attempt in range(max_retries):
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                # Rate limit exceeded
                wait_time = (2 ** attempt) * 60  # Exponential backoff
                print(f"Rate limit hit. Waiting {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")
```

### Increasing Limits

For applications requiring higher limits, contact the openFDA team through their website with details about your use case.

## Query Syntax

### Basic Structure

Queries use this format:
```
?api_key=YOUR_KEY&parameter=value&parameter2=value2
```

Parameters are separated by ampersands (`&`).

### Search Parameter

The `search` parameter is the primary way to filter results.

**Basic Format**:
```
search=field:value
```

**Example**:
```python
params = {
    "api_key": api_key,
    "search": "patient.drug.medicinalproduct:aspirin"
}
```

### Search Operators

#### AND Operator
Combines multiple conditions (both must be true):
```python
# Find aspirin adverse events in Canada
params = {
    "search": "patient.drug.medicinalproduct:aspirin+AND+occurcountry:ca"
}
```

#### OR Operator
Either condition can be true (OR is implicit with space):
```python
# Find aspirin OR ibuprofen
params = {
    "search": "patient.drug.medicinalproduct:(aspirin ibuprofen)"
}
```

Or explicitly:
```python
params = {
    "search": "patient.drug.medicinalproduct:aspirin+OR+patient.drug.medicinalproduct:ibuprofen"
}
```

#### NOT Operator
Exclude results:
```python
# Events NOT in the United States
params = {
    "search": "_exists_:occurcountry+AND+NOT+occurcountry:us"
}
```

#### Wildcards
Use asterisk (`*`) for partial matching:
```python
# Any drug starting with "met"
params = {
    "search": "patient.drug.medicinalproduct:met*"
}

# Any drug containing "cillin"
params = {
    "search": "patient.drug.medicinalproduct:*cillin*"
}
```

#### Exact Phrase Matching
Use quotes for exact phrases:
```python
params = {
    "search": 'patient.reaction.reactionmeddrapt:"heart attack"'
}
```

#### Range Queries
Search within ranges:
```python
# Date range (YYYYMMDD format)
params = {
    "search": "receivedate:[20200101+TO+20201231]"
}

# Numeric range
params = {
    "search": "patient.patientonsetage:[18+TO+65]"
}

# Open-ended ranges
params = {
    "search": "patient.patientonsetage:[65+TO+*]"  # 65 and older
}
```

#### Field Existence
Check if a field exists:
```python
# Records that have a patient age
params = {
    "search": "_exists_:patient.patientonsetage"
}

# Records missing patient age
params = {
    "search": "_missing_:patient.patientonsetage"
}
```

### Limit Parameter

Controls how many results to return (1-1000, default 1):
```python
params = {
    "search": "...",
    "limit": 100
}
```

**Maximum**: 1000 results per request

### Skip Parameter

For pagination, skip the first N results:
```python
# Get results 101-200
params = {
    "search": "...",
    "limit": 100,
    "skip": 100
}
```

**Pagination Example**:
```python
def get_all_results(url, search_query, api_key, max_results=5000):
    """Retrieve results with pagination."""
    all_results = []
    skip = 0
    limit = 100

    while len(all_results) < max_results:
        params = {
            "api_key": api_key,
            "search": search_query,
            "limit": limit,
            "skip": skip
        }

        response = requests.get(url, params=params)
        data = response.json()

        if "results" not in data or len(data["results"]) == 0:
            break

        all_results.extend(data["results"])

        if len(data["results"]) < limit:
            break  # No more results

        skip += limit
        time.sleep(0.25)  # Rate limiting courtesy

    return all_results[:max_results]
```

### Count Parameter

Aggregate and count results by a field (instead of returning individual records):
```python
# Count events by country
params = {
    "search": "patient.drug.medicinalproduct:aspirin",
    "count": "occurcountry"
}
```

**Response Format**:
```json
{
  "results": [
    {"term": "us", "count": 12543},
    {"term": "ca", "count": 3421},
    {"term": "gb", "count": 2156}
  ]
}
```

#### Exact Counting

Add `.exact` suffix for exact phrase counting (especially important for multi-word fields):
```python
# Count exact reaction terms (not individual words)
params = {
    "search": "patient.drug.medicinalproduct:aspirin",
    "count": "patient.reaction.reactionmeddrapt.exact"
}
```

**Without `.exact`**: Counts individual words
**With `.exact`**: Counts complete phrases

### Sort Parameter

Sort results by field:
```python
# Sort by date, newest first
params = {
    "search": "...",
    "sort": "receivedate:desc"
}

# Sort by date, oldest first
params = {
    "search": "...",
    "sort": "receivedate:asc"
}
```

## Response Format

### Standard Response Structure

```json
{
  "meta": {
    "disclaimer": "...",
    "terms": "...",
    "license": "...",
    "last_updated": "2024-01-15",
    "results": {
      "skip": 0,
      "limit": 10,
      "total": 15234
    }
  },
  "results": [
    {
      // Individual result record
    },
    {
      // Another result record
    }
  ]
}
```

### Response Fields

- **meta**: Metadata about the query and results
  - `disclaimer`: Important legal disclaimer
  - `terms`: Terms of use URL
  - `license`: Data license information
  - `last_updated`: When data was last updated
  - `results.skip`: Number of skipped results
  - `results.limit`: Maximum results per page
  - `results.total`: Total matching results (may be approximate for large result sets)

- **results**: Array of matching records

### Empty Results

When no results match:
```json
{
  "meta": {...},
  "results": []
}
```

### Error Response

When an error occurs:
```json
{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Detailed error message"
  }
}
```

**Common Error Codes**:
- `NOT_FOUND`: No results found (404)
- `INVALID_QUERY`: Malformed search query (400)
- `RATE_LIMIT_EXCEEDED`: Too many requests (429)
- `UNAUTHORIZED`: Invalid API key (401)
- `SERVER_ERROR`: Internal server error (500)

## Advanced Techniques

### Nested Field Queries

Query nested objects:
```python
# Drug adverse events where serious outcome is death
params = {
    "search": "serious:1+AND+seriousnessdeath:1"
}
```

### Multiple Field Search

Search across multiple fields:
```python
# Search drug name in multiple fields
params = {
    "search": "(patient.drug.medicinalproduct:aspirin+OR+patient.drug.openfda.brand_name:aspirin)"
}
```

### Complex Boolean Logic

Combine multiple operators:
```python
# (Aspirin OR Ibuprofen) AND (Heart Attack) AND NOT (US)
params = {
    "search": "(patient.drug.medicinalproduct:aspirin+OR+patient.drug.medicinalproduct:ibuprofen)+AND+patient.reaction.reactionmeddrapt:*heart*attack*+AND+NOT+occurcountry:us"
}
```

### Counting with Filters

Count within a specific subset:
```python
# Count reactions for serious events only
params = {
    "search": "serious:1",
    "count": "patient.reaction.reactionmeddrapt.exact"
}
```

## Best Practices

### 1. Query Efficiency

**DO**:
- Use specific field searches
- Filter before counting
- Use exact match when possible
- Implement pagination for large datasets

**DON'T**:
- Use overly broad wildcards (e.g., `search=*`)
- Request more data than needed
- Skip error handling
- Ignore rate limits

### 2. Error Handling

Always handle common errors:
```python
def safe_api_call(url, params):
    """Safely call FDA API with comprehensive error handling."""
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            return {"error": "No results found"}
        elif response.status_code == 429:
            return {"error": "Rate limit exceeded"}
        elif response.status_code == 400:
            return {"error": "Invalid query"}
        else:
            return {"error": f"HTTP error: {e}"}
    except requests.exceptions.ConnectionError:
        return {"error": "Connection failed"}
    except requests.exceptions.Timeout:
        return {"error": "Request timeout"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Request error: {e}"}
```

### 3. Data Validation

Validate and clean data:
```python
def clean_search_term(term):
    """Clean and prepare search term."""
    # Remove special characters that break queries
    term = term.replace('"', '\\"')  # Escape quotes
    term = term.strip()
    return term

def validate_date(date_str):
    """Validate date format (YYYYMMDD)."""
    import re
    if not re.match(r'^\d{8}$', date_str):
        raise ValueError("Date must be in YYYYMMDD format")
    return date_str
```

### 4. Caching

Implement caching for frequently accessed data:
```python
import json
from pathlib import Path
import hashlib
import time

class FDACache:
    """Simple file-based cache for FDA API responses."""

    def __init__(self, cache_dir="fda_cache", ttl=3600):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.ttl = ttl  # Time to live in seconds

    def _get_cache_key(self, url, params):
        """Generate cache key from URL and params."""
        cache_string = f"{url}_{json.dumps(params, sort_keys=True)}"
        return hashlib.md5(cache_string.encode()).hexdigest()

    def get(self, url, params):
        """Get cached response if available and not expired."""
        key = self._get_cache_key(url, params)
        cache_file = self.cache_dir / f"{key}.json"

        if cache_file.exists():
            # Check if expired
            age = time.time() - cache_file.stat().st_mtime
            if age < self.ttl:
                with open(cache_file, 'r') as f:
                    return json.load(f)

        return None

    def set(self, url, params, data):
        """Cache response data."""
        key = self._get_cache_key(url, params)
        cache_file = self.cache_dir / f"{key}.json"

        with open(cache_file, 'w') as f:
            json.dump(data, f)

# Usage
cache = FDACache(ttl=3600)  # 1 hour cache

def cached_api_call(url, params):
    """API call with caching."""
    # Check cache
    cached = cache.get(url, params)
    if cached:
        return cached

    # Make request
    response = requests.get(url, params=params)
    data = response.json()

    # Cache result
    cache.set(url, params, data)

    return data
```

### 5. Rate Limit Management

Track and respect rate limits:
```python
import time
from collections import deque

class RateLimiter:
    """Track and enforce rate limits."""

    def __init__(self, max_per_minute=240):
        self.max_per_minute = max_per_minute
        self.requests = deque()

    def wait_if_needed(self):
        """Wait if necessary to stay under rate limit."""
        now = time.time()

        # Remove requests older than 1 minute
        while self.requests and now - self.requests[0] > 60:
            self.requests.popleft()

        # Check if at limit
        if len(self.requests) >= self.max_per_minute:
            sleep_time = 60 - (now - self.requests[0])
            if sleep_time > 0:
                time.sleep(sleep_time)
            self.requests.popleft()

        self.requests.append(time.time())

# Usage
rate_limiter = RateLimiter(max_per_minute=240)

def rate_limited_request(url, params):
    """Make request with rate limiting."""
    rate_limiter.wait_if_needed()
    return requests.get(url, params=params)
```

## Common Query Patterns

### Pattern 1: Time-based Analysis
```python
# Get events from last 30 days
from datetime import datetime, timedelta

end_date = datetime.now()
start_date = end_date - timedelta(days=30)

params = {
    "search": f"receivedate:[{start_date.strftime('%Y%m%d')}+TO+{end_date.strftime('%Y%m%d')}]",
    "limit": 1000
}
```

### Pattern 2: Top N Analysis
```python
# Get top 10 most common reactions for a drug
params = {
    "search": "patient.drug.medicinalproduct:aspirin",
    "count": "patient.reaction.reactionmeddrapt.exact",
    "limit": 10
}
```

### Pattern 3: Comparative Analysis
```python
# Compare two drugs
drugs = ["aspirin", "ibuprofen"]
results = {}

for drug in drugs:
    params = {
        "search": f"patient.drug.medicinalproduct:{drug}",
        "count": "patient.reaction.reactionmeddrapt.exact",
        "limit": 10
    }
    results[drug] = requests.get(url, params=params).json()
```

## Additional Resources

- **openFDA Homepage**: https://open.fda.gov/
- **API Documentation**: https://open.fda.gov/apis/
- **Interactive API Explorer**: https://open.fda.gov/apis/try-the-api/
- **Terms of Service**: https://open.fda.gov/terms/
- **GitHub**: https://github.com/FDA/openfda
- **Status Page**: Check for API outages and maintenance

## Support

For questions or issues:
- **GitHub Issues**: https://github.com/FDA/openfda/issues
- **Email**: open-fda@fda.hhs.gov
- **Discussion Forum**: Check GitHub discussions
