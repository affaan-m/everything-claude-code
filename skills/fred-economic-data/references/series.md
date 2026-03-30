# FRED Series Endpoints

Series endpoints provide access to economic data series metadata and observations.

## Table of Contents

1. [fred/series](#fredseries) - Get series metadata
2. [fred/series/observations](#fredseriesobservations) - Get data values
3. [fred/series/categories](#fredseriescategories) - Get series categories
4. [fred/series/release](#fredseriesrelease) - Get series release
5. [fred/series/search](#fredseriessearch) - Search for series
6. [fred/series/tags](#fredseriestags) - Get series tags
7. [fred/series/updates](#fredseriesupdates) - Get recently updated series
8. [fred/series/vintagedates](#fredseriesvintagedates) - Get vintage dates
9. [fred/series/search/tags](#fredseriessearchtags) - Get tags for search
10. [fred/series/search/related_tags](#fredseriessearchrelated_tags) - Get related tags for search

---

## fred/series

Get metadata for an economic data series.

**URL:** `https://api.stlouisfed.org/fred/series`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | Series identifier (e.g., "GDP", "UNRATE") |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |

### Response Fields

| Field | Description |
|-------|-------------|
| `id` | Series identifier |
| `title` | Series title |
| `observation_start` | First observation date |
| `observation_end` | Last observation date |
| `frequency` | Data frequency |
| `units` | Units of measurement |
| `seasonal_adjustment` | Seasonal adjustment status |
| `last_updated` | Last update timestamp |
| `popularity` | Popularity ranking (0-100) |
| `notes` | Series description/notes |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/series",
    params={
        "api_key": API_KEY,
        "series_id": "GNPCA",
        "file_type": "json"
    }
)
```

### Response

```json
{
  "seriess": [
    {
      "id": "GNPCA",
      "title": "Real Gross National Product",
      "observation_start": "1929-01-01",
      "observation_end": "2022-01-01",
      "frequency": "Annual",
      "units": "Billions of Chained 2017 Dollars",
      "seasonal_adjustment": "Not Seasonally Adjusted",
      "last_updated": "2023-03-30 07:52:02-05",
      "popularity": 39,
      "notes": "BEA Account Code: A001RX..."
    }
  ]
}
```

---

## fred/series/observations

Get observations (data values) for an economic data series. **Most commonly used endpoint.**

**URL:** `https://api.stlouisfed.org/fred/series/observations`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | Series identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml, json, xlsx, csv |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `limit` | integer | 100000 | 1-100000 |
| `offset` | integer | 0 | Pagination offset |
| `sort_order` | string | asc | asc, desc |
| `observation_start` | date | 1776-07-04 | Filter start date |
| `observation_end` | date | 9999-12-31 | Filter end date |
| `units` | string | lin | Data transformation |
| `frequency` | string | none | Frequency aggregation |
| `aggregation_method` | string | avg | avg, sum, eop |
| `output_type` | integer | 1 | Output format type |
| `vintage_dates` | string | none | Comma-separated dates |

### Units Transformation Options

| Value | Description |
|-------|-------------|
| `lin` | Levels (no transformation) |
| `chg` | Change from previous period |
| `ch1` | Change from year ago |
| `pch` | Percent change from previous period |
| `pc1` | Percent change from year ago |
| `pca` | Compounded annual rate of change |
| `cch` | Continuously compounded rate of change |
| `cca` | Continuously compounded annual rate of change |
| `log` | Natural log |

### Frequency Codes

| Code | Frequency |
|------|-----------|
| `d` | Daily |
| `w` | Weekly |
| `bw` | Biweekly |
| `m` | Monthly |
| `q` | Quarterly |
| `sa` | Semiannual |
| `a` | Annual |
| `wef` | Weekly, Ending Friday |
| `weth` | Weekly, Ending Thursday |
| `wew` | Weekly, Ending Wednesday |
| `wetu` | Weekly, Ending Tuesday |
| `wem` | Weekly, Ending Monday |
| `wesu` | Weekly, Ending Sunday |
| `wesa` | Weekly, Ending Saturday |
| `bwew` | Biweekly, Ending Wednesday |
| `bwem` | Biweekly, Ending Monday |

### Example

```python
# Get quarterly GDP with percent change transformation
response = requests.get(
    "https://api.stlouisfed.org/fred/series/observations",
    params={
        "api_key": API_KEY,
        "series_id": "GDP",
        "file_type": "json",
        "observation_start": "2020-01-01",
        "units": "pch"
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-14",
  "observation_start": "2020-01-01",
  "observation_end": "9999-12-31",
  "units": "Percent Change",
  "output_type": 1,
  "file_type": "json",
  "order_by": "observation_date",
  "sort_order": "asc",
  "count": 14,
  "offset": 0,
  "limit": 100000,
  "observations": [
    {
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "date": "2020-01-01",
      "value": "1.1"
    },
    {
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "date": "2020-04-01",
      "value": "-8.3"
    }
  ]
}
```

---

## fred/series/categories

Get the categories for an economic data series.

**URL:** `https://api.stlouisfed.org/fred/series/categories`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | Series identifier |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/series/categories",
    params={
        "api_key": API_KEY,
        "series_id": "EXJPUS",
        "file_type": "json"
    }
)
```

### Response

```json
{
  "categories": [
    {"id": 95, "name": "Monthly Rates", "parent_id": 15},
    {"id": 275, "name": "Japan", "parent_id": 158}
  ]
}
```

---

## fred/series/release

Get the release for an economic data series.

**URL:** `https://api.stlouisfed.org/fred/series/release`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | Series identifier |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/series/release",
    params={
        "api_key": API_KEY,
        "series_id": "GDP",
        "file_type": "json"
    }
)
```

### Response

```json
{
  "releases": [
    {
      "id": 53,
      "name": "Gross Domestic Product",
      "press_release": true,
      "link": "http://www.bea.gov/national/index.htm"
    }
  ]
}
```

---

## fred/series/search

Search for economic data series by keywords.

**URL:** `https://api.stlouisfed.org/fred/series/search`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search_text` | string | - | Keywords to search |
| `file_type` | string | xml | xml or json |
| `search_type` | string | full_text | full_text or series_id |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | varies | Ordering field |
| `sort_order` | string | varies | asc or desc |
| `filter_variable` | string | - | frequency, units, seasonal_adjustment |
| `filter_value` | string | - | Value for filter |
| `tag_names` | string | - | Semicolon-delimited tags |
| `exclude_tag_names` | string | - | Tags to exclude |

### Order By Options

- `search_rank` (default for full_text)
- `series_id` (default for series_id)
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

### Example

```python
# Search for inflation-related series
response = requests.get(
    "https://api.stlouisfed.org/fred/series/search",
    params={
        "api_key": API_KEY,
        "search_text": "consumer price index",
        "file_type": "json",
        "limit": 10,
        "filter_variable": "frequency",
        "filter_value": "Monthly"
    }
)
```

### Response

```json
{
  "count": 1234,
  "offset": 0,
  "limit": 10,
  "seriess": [
    {
      "id": "CPIAUCSL",
      "title": "Consumer Price Index for All Urban Consumers: All Items in U.S. City Average",
      "observation_start": "1947-01-01",
      "observation_end": "2023-07-01",
      "frequency": "Monthly",
      "units": "Index 1982-1984=100",
      "seasonal_adjustment": "Seasonally Adjusted",
      "popularity": 95
    }
  ]
}
```

---

## fred/series/tags

Get the FRED tags for a series.

**URL:** `https://api.stlouisfed.org/fred/series/tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | Series identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `order_by` | string | series_count | series_count, popularity, created, name, group_id |
| `sort_order` | string | asc | asc or desc |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/series/tags",
    params={
        "api_key": API_KEY,
        "series_id": "GDP",
        "file_type": "json"
    }
)
```

### Response

```json
{
  "tags": [
    {"name": "gdp", "group_id": "gen", "series_count": 21862},
    {"name": "quarterly", "group_id": "freq", "series_count": 180000},
    {"name": "usa", "group_id": "geo", "series_count": 400000}
  ]
}
```

---

## fred/series/updates

Get economic data series sorted by when observations were updated.

**URL:** `https://api.stlouisfed.org/fred/series/updates`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `filter_value` | string | all | macro, regional, or all |
| `start_time` | string | - | YYYYMMDDHhmm format |
| `end_time` | string | - | YYYYMMDDHhmm format |

**Note:** Results are restricted to series updated within the last two weeks.

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/series/updates",
    params={
        "api_key": API_KEY,
        "file_type": "json",
        "filter_value": "macro",
        "limit": 10
    }
)
```

---

## fred/series/vintagedates

Get the vintage dates for a series (dates when data was revised).

**URL:** `https://api.stlouisfed.org/fred/series/vintagedates`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | Series identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | 1776-07-04 | YYYY-MM-DD |
| `realtime_end` | date | 9999-12-31 | YYYY-MM-DD |
| `limit` | integer | 10000 | 1-10000 |
| `offset` | integer | 0 | Pagination offset |
| `sort_order` | string | asc | asc or desc |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/series/vintagedates",
    params={
        "api_key": API_KEY,
        "series_id": "GDP",
        "file_type": "json"
    }
)
```

### Response

```json
{
  "count": 250,
  "vintage_dates": [
    "1991-12-04",
    "1992-01-29",
    "1992-02-28"
  ]
}
```

---

## fred/series/search/tags

Get the tags for a series search.

**URL:** `https://api.stlouisfed.org/fred/series/search/tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_search_text` | string | Search text |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `tag_names` | string | - | Semicolon-delimited tags |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src |
| `tag_search_text` | string | - | Filter tags by text |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | series_count, popularity, created, name, group_id |
| `sort_order` | string | asc | asc or desc |

---

## fred/series/search/related_tags

Get related tags for a series search.

**URL:** `https://api.stlouisfed.org/fred/series/search/related_tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_search_text` | string | Search text |
| `tag_names` | string | Semicolon-delimited tags |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `exclude_tag_names` | string | - | Tags to exclude |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src |
| `tag_search_text` | string | - | Filter tags |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | Ordering field |
| `sort_order` | string | asc | asc or desc |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/series/search/related_tags",
    params={
        "api_key": API_KEY,
        "series_search_text": "mortgage rate",
        "tag_names": "30-year;frb",
        "file_type": "json"
    }
)
```
