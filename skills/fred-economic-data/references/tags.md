# FRED Tags Endpoints

Tags endpoints provide access to FRED tags, which are attributes assigned to series for organization and discovery.

## Table of Contents

1. [fred/tags](#fredtags) - Get all FRED tags
2. [fred/related_tags](#fredrelated_tags) - Get related tags
3. [fred/tags/series](#fredtagsseries) - Get series matching tags

## About Tags

Tags are attributes assigned to series that help categorize and discover data. Tags are organized into groups:

| Group ID | Description | Examples |
|----------|-------------|----------|
| freq | Frequency | monthly, quarterly, annual |
| gen | General/Topic | gdp, inflation, employment |
| geo | Geography | usa, california, japan |
| geot | Geography Type | nation, state, county, msa |
| rls | Release | employment situation, gdp |
| seas | Seasonal Adjustment | sa, nsa |
| src | Source | bls, bea, census |
| cc | Citation/Copyright | public domain, copyrighted |

---

## fred/tags

Get FRED tags with optional filtering.

**URL:** `https://api.stlouisfed.org/fred/tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `tag_names` | string | - | Semicolon-delimited tags |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src, cc |
| `search_text` | string | - | Search tag names |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | series_count, popularity, created, name, group_id |
| `sort_order` | string | asc | asc or desc |

### Example: Get All Tags

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/tags",
    params={
        "api_key": API_KEY,
        "file_type": "json",
        "order_by": "popularity",
        "sort_order": "desc",
        "limit": 20
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-14",
  "count": 5000,
  "offset": 0,
  "limit": 20,
  "tags": [
    {
      "name": "nation",
      "group_id": "geot",
      "notes": "",
      "created": "2012-02-27 10:18:19-06",
      "popularity": 100,
      "series_count": 150000
    },
    {
      "name": "usa",
      "group_id": "geo",
      "notes": "United States of America",
      "created": "2012-02-27 10:18:19-06",
      "popularity": 100,
      "series_count": 450000
    },
    {
      "name": "gdp",
      "group_id": "gen",
      "notes": "Gross Domestic Product",
      "created": "2012-02-27 10:18:19-06",
      "popularity": 85,
      "series_count": 22000
    }
  ]
}
```

### Example: Get Geography Tags Only

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/tags",
    params={
        "api_key": API_KEY,
        "file_type": "json",
        "tag_group_id": "geo",
        "order_by": "series_count",
        "sort_order": "desc"
    }
)
```

### Example: Search for Tags

```python
# Find tags related to inflation
response = requests.get(
    "https://api.stlouisfed.org/fred/tags",
    params={
        "api_key": API_KEY,
        "file_type": "json",
        "search_text": "inflation",
        "order_by": "series_count",
        "sort_order": "desc"
    }
)
```

---

## fred/related_tags

Get related FRED tags for one or more specified tags.

**URL:** `https://api.stlouisfed.org/fred/related_tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `tag_names` | string | Semicolon-delimited tags |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `exclude_tag_names` | string | - | Tags to exclude |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src |
| `search_text` | string | - | Filter by text |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | series_count, popularity, created, name, group_id |
| `sort_order` | string | asc | asc or desc |

### Example: Find Tags Related to GDP

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/related_tags",
    params={
        "api_key": API_KEY,
        "tag_names": "gdp",
        "file_type": "json",
        "order_by": "series_count",
        "sort_order": "desc",
        "limit": 20
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-14",
  "count": 500,
  "offset": 0,
  "limit": 20,
  "tags": [
    {
      "name": "quarterly",
      "group_id": "freq",
      "notes": "",
      "created": "2012-02-27 10:18:19-06",
      "popularity": 95,
      "series_count": 18000
    },
    {
      "name": "annual",
      "group_id": "freq",
      "series_count": 15000
    },
    {
      "name": "real",
      "group_id": "gen",
      "series_count": 12000
    }
  ]
}
```

### Example: Find Geographic Tags Related to Unemployment

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/related_tags",
    params={
        "api_key": API_KEY,
        "tag_names": "unemployment rate",
        "file_type": "json",
        "tag_group_id": "geo",
        "order_by": "series_count",
        "sort_order": "desc"
    }
)
```

---

## fred/tags/series

Get the series matching all specified tags.

**URL:** `https://api.stlouisfed.org/fred/tags/series`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `tag_names` | string | Semicolon-delimited tags (series must match ALL) |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `exclude_tag_names` | string | - | Tags to exclude |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_id | Sort field |
| `sort_order` | string | asc | asc or desc |

### Order By Options

- `series_id`
- `title`
- `units`
- `frequency`
- `seasonal_adjustment`
- `realtime_start`
- `realtime_end`
- `last_updated`
- `observation_start`
- `observation_end`
- `popularity`
- `group_popularity`

### Example: Find Quarterly GDP Series for USA

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/tags/series",
    params={
        "api_key": API_KEY,
        "tag_names": "gdp;quarterly;usa",
        "file_type": "json",
        "order_by": "popularity",
        "sort_order": "desc"
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-14",
  "count": 150,
  "offset": 0,
  "limit": 1000,
  "seriess": [
    {
      "id": "GDP",
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "title": "Gross Domestic Product",
      "observation_start": "1947-01-01",
      "observation_end": "2023-04-01",
      "frequency": "Quarterly",
      "units": "Billions of Dollars",
      "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
      "last_updated": "2023-06-29 07:44:02-05",
      "popularity": 95
    },
    {
      "id": "GDPC1",
      "title": "Real Gross Domestic Product",
      "frequency": "Quarterly",
      "units": "Billions of Chained 2017 Dollars",
      "popularity": 90
    }
  ]
}
```

### Example: Find Monthly Unemployment Rates by State

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/tags/series",
    params={
        "api_key": API_KEY,
        "tag_names": "unemployment rate;monthly;state",
        "file_type": "json",
        "exclude_tag_names": "discontinued",
        "order_by": "title",
        "limit": 100
    }
)
```

### Example: Find Inflation-Related Series Excluding NSA

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/tags/series",
    params={
        "api_key": API_KEY,
        "tag_names": "inflation;monthly;usa",
        "file_type": "json",
        "exclude_tag_names": "nsa",  # Exclude not seasonally adjusted
        "order_by": "popularity",
        "sort_order": "desc"
    }
)
```

---

## Common Tag Combinations

### Macroeconomic Indicators

```python
# GDP
tags = "gdp;quarterly;usa"

# Unemployment
tags = "unemployment rate;monthly;nation"

# Inflation (CPI)
tags = "cpi;monthly;usa;sa"

# Interest Rates
tags = "interest rate;daily;treasury"
```

### Regional Data

```python
# State unemployment
tags = "unemployment rate;state;monthly"

# County population
tags = "population;county;annual"

# MSA employment
tags = "employment;msa;monthly"
```

### International

```python
# OECD countries GDP
tags = "gdp;oecd;annual"

# Exchange rates
tags = "exchange rate;daily;nation"

# International trade
tags = "trade;monthly;usa"
```

---

## Tag Discovery Pattern

```python
def discover_tags_for_topic(api_key, topic):
    """Find relevant tags for a research topic."""

    # Step 1: Find tags matching the topic
    response = requests.get(
        "https://api.stlouisfed.org/fred/tags",
        params={
            "api_key": api_key,
            "file_type": "json",
            "search_text": topic,
            "order_by": "popularity",
            "sort_order": "desc",
            "limit": 10
        }
    )
    initial_tags = response.json().get("tags", [])

    if not initial_tags:
        return []

    # Step 2: Find related tags
    top_tag = initial_tags[0]["name"]
    response = requests.get(
        "https://api.stlouisfed.org/fred/related_tags",
        params={
            "api_key": api_key,
            "tag_names": top_tag,
            "file_type": "json",
            "order_by": "series_count",
            "sort_order": "desc",
            "limit": 20
        }
    )
    related = response.json().get("tags", [])

    return {
        "primary_tags": initial_tags,
        "related_tags": related
    }

# Example: Discover inflation-related tags
tags = discover_tags_for_topic(API_KEY, "inflation")
```

## Building Filtered Series Lists

```python
def get_filtered_series(api_key, topic_tags, geo_tags=None, freq_tag=None):
    """Get series matching topic with optional filters."""

    all_tags = topic_tags.copy()
    if geo_tags:
        all_tags.extend(geo_tags)
    if freq_tag:
        all_tags.append(freq_tag)

    response = requests.get(
        "https://api.stlouisfed.org/fred/tags/series",
        params={
            "api_key": api_key,
            "tag_names": ";".join(all_tags),
            "file_type": "json",
            "order_by": "popularity",
            "sort_order": "desc",
            "limit": 50
        }
    )

    return response.json().get("seriess", [])

# Example: Monthly US inflation series
series = get_filtered_series(
    API_KEY,
    topic_tags=["inflation", "cpi"],
    geo_tags=["usa"],
    freq_tag="monthly"
)
```
