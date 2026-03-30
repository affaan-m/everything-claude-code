# FRED Releases Endpoints

Releases endpoints provide access to economic data releases and their publication schedules.

## Table of Contents

1. [fred/releases](#fredreleases) - Get all releases
2. [fred/releases/dates](#fredreleasesdates) - Get release dates for all releases
3. [fred/release](#fredrelease) - Get a specific release
4. [fred/release/dates](#fredreleasedates) - Get dates for a release
5. [fred/release/series](#fredreleaseseries) - Get series in a release
6. [fred/release/sources](#fredreleasesources) - Get sources for a release
7. [fred/release/tags](#fredreleasetags) - Get tags for a release
8. [fred/release/related_tags](#fredreleaserelated_tags) - Get related tags
9. [fred/release/tables](#fredreleasetables) - Get release table structure

## About Releases

A "release" in FRED represents a publication of economic data, such as:
- Gross Domestic Product (release_id=53)
- Employment Situation (release_id=50)
- Consumer Price Index (release_id=10)
- Industrial Production and Capacity Utilization (release_id=13)

Releases have scheduled publication dates and may contain multiple related series.

---

## fred/releases

Get all releases of economic data.

**URL:** `https://api.stlouisfed.org/fred/releases`

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
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | release_id | release_id, name, press_release, realtime_start, realtime_end |
| `sort_order` | string | asc | asc or desc |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/releases",
    params={
        "api_key": API_KEY,
        "file_type": "json",
        "order_by": "name"
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-14",
  "count": 300,
  "offset": 0,
  "limit": 1000,
  "releases": [
    {
      "id": 9,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "Advance Monthly Sales for Retail and Food Services",
      "press_release": true,
      "link": "http://www.census.gov/retail/"
    },
    {
      "id": 53,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "Gross Domestic Product",
      "press_release": true,
      "link": "http://www.bea.gov/national/index.htm"
    }
  ]
}
```

---

## fred/releases/dates

Get release dates for all releases of economic data.

**URL:** `https://api.stlouisfed.org/fred/releases/dates`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | current year start | YYYY-MM-DD |
| `realtime_end` | date | 9999-12-31 | YYYY-MM-DD |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | release_date | release_date, release_id, release_name |
| `sort_order` | string | desc | asc or desc |
| `include_release_dates_with_no_data` | string | false | true or false |

**Note:** These dates reflect when data sources publish information, not necessarily when data becomes available on FRED.

### Example

```python
from datetime import datetime, timedelta

# Get releases in next 7 days
today = datetime.now().strftime("%Y-%m-%d")
next_week = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

response = requests.get(
    "https://api.stlouisfed.org/fred/releases/dates",
    params={
        "api_key": API_KEY,
        "file_type": "json",
        "realtime_start": today,
        "realtime_end": next_week,
        "order_by": "release_date",
        "sort_order": "asc",
        "include_release_dates_with_no_data": "true"
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-21",
  "count": 50,
  "release_dates": [
    {
      "release_id": 21,
      "release_name": "H.6 Money Stock Measures",
      "date": "2023-08-15"
    },
    {
      "release_id": 10,
      "release_name": "Consumer Price Index",
      "date": "2023-08-16"
    }
  ]
}
```

---

## fred/release

Get a specific release of economic data.

**URL:** `https://api.stlouisfed.org/fred/release`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `release_id` | integer | Release identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |

### Example

```python
# Get GDP release info
response = requests.get(
    "https://api.stlouisfed.org/fred/release",
    params={
        "api_key": API_KEY,
        "release_id": 53,
        "file_type": "json"
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-14",
  "releases": [
    {
      "id": 53,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "Gross Domestic Product",
      "press_release": true,
      "link": "http://www.bea.gov/national/index.htm"
    }
  ]
}
```

---

## fred/release/dates

Get release dates for a specific release.

**URL:** `https://api.stlouisfed.org/fred/release/dates`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `release_id` | integer | Release identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | 1776-07-04 | YYYY-MM-DD |
| `realtime_end` | date | 9999-12-31 | YYYY-MM-DD |
| `limit` | integer | 10000 | 1-10000 |
| `offset` | integer | 0 | Pagination offset |
| `sort_order` | string | asc | asc or desc |
| `include_release_dates_with_no_data` | string | false | true or false |

### Example

```python
# Get historical GDP release dates
response = requests.get(
    "https://api.stlouisfed.org/fred/release/dates",
    params={
        "api_key": API_KEY,
        "release_id": 53,
        "file_type": "json",
        "sort_order": "desc",
        "limit": 20
    }
)
```

### Response

```json
{
  "realtime_start": "1776-07-04",
  "realtime_end": "9999-12-31",
  "count": 250,
  "offset": 0,
  "limit": 20,
  "release_dates": [
    {"release_id": 53, "date": "2023-07-27"},
    {"release_id": 53, "date": "2023-06-29"},
    {"release_id": 53, "date": "2023-05-25"}
  ]
}
```

---

## fred/release/series

Get the series on a release.

**URL:** `https://api.stlouisfed.org/fred/release/series`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `release_id` | integer | Release identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_id | Sort field |
| `sort_order` | string | asc | asc or desc |
| `filter_variable` | string | - | frequency, units, seasonal_adjustment |
| `filter_value` | string | - | Filter value |
| `tag_names` | string | - | Semicolon-delimited tags |
| `exclude_tag_names` | string | - | Tags to exclude |

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

### Example

```python
# Get quarterly series from GDP release
response = requests.get(
    "https://api.stlouisfed.org/fred/release/series",
    params={
        "api_key": API_KEY,
        "release_id": 53,
        "file_type": "json",
        "filter_variable": "frequency",
        "filter_value": "Quarterly",
        "order_by": "popularity",
        "sort_order": "desc",
        "limit": 10
    }
)
```

### Response

```json
{
  "count": 500,
  "offset": 0,
  "limit": 10,
  "seriess": [
    {
      "id": "GDP",
      "title": "Gross Domestic Product",
      "observation_start": "1947-01-01",
      "observation_end": "2023-04-01",
      "frequency": "Quarterly",
      "units": "Billions of Dollars",
      "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
      "popularity": 95
    },
    {
      "id": "GDPC1",
      "title": "Real Gross Domestic Product",
      "observation_start": "1947-01-01",
      "observation_end": "2023-04-01",
      "frequency": "Quarterly",
      "units": "Billions of Chained 2017 Dollars",
      "seasonal_adjustment": "Seasonally Adjusted Annual Rate",
      "popularity": 90
    }
  ]
}
```

---

## fred/release/sources

Get the sources for a release.

**URL:** `https://api.stlouisfed.org/fred/release/sources`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `release_id` | integer | Release identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/release/sources",
    params={
        "api_key": API_KEY,
        "release_id": 51,
        "file_type": "json"
    }
)
```

### Response

```json
{
  "realtime_start": "2023-08-14",
  "realtime_end": "2023-08-14",
  "sources": [
    {
      "id": 18,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "U.S. Department of Commerce: Bureau of Economic Analysis",
      "link": "http://www.bea.gov/"
    },
    {
      "id": 19,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "U.S. Department of Commerce: Census Bureau",
      "link": "http://www.census.gov/"
    }
  ]
}
```

---

## fred/release/tags

Get the tags for a release.

**URL:** `https://api.stlouisfed.org/fred/release/tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `release_id` | integer | Release identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `tag_names` | string | - | Semicolon-delimited tags |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src |
| `search_text` | string | - | Search tag names |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | series_count, popularity, created, name, group_id |
| `sort_order` | string | asc | asc or desc |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/release/tags",
    params={
        "api_key": API_KEY,
        "release_id": 53,
        "file_type": "json",
        "tag_group_id": "gen"
    }
)
```

---

## fred/release/related_tags

Get related tags for a release.

**URL:** `https://api.stlouisfed.org/fred/release/related_tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `release_id` | integer | Release identifier |
| `tag_names` | string | Semicolon-delimited tags |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `exclude_tag_names` | string | - | Tags to exclude |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src |
| `search_text` | string | - | Search tag names |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | Ordering field |
| `sort_order` | string | asc | asc or desc |

---

## fred/release/tables

Get release table trees for a release.

**URL:** `https://api.stlouisfed.org/fred/release/tables`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `release_id` | integer | Release identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `element_id` | integer | root | Specific table element |
| `include_observation_values` | string | false | true or false |
| `observation_date` | string | 9999-12-31 | YYYY-MM-DD |

### Response Fields

| Field | Description |
|-------|-------------|
| `element_id` | Unique identifier for table element |
| `release_id` | Associated release |
| `series_id` | Economic data series reference |
| `name` | Element description |
| `level` | Hierarchical depth |
| `children` | Nested sub-elements |

### Example

```python
# Get GDP release table structure
response = requests.get(
    "https://api.stlouisfed.org/fred/release/tables",
    params={
        "api_key": API_KEY,
        "release_id": 53,
        "file_type": "json"
    }
)
```

### Response

```json
{
  "name": "Gross Domestic Product",
  "element_id": 12886,
  "release_id": "53",
  "elements": {
    "12886": {
      "element_id": 12886,
      "release_id": 53,
      "series_id": "GDP",
      "parent_id": null,
      "line": "1",
      "type": "series",
      "name": "Gross domestic product",
      "level": "0",
      "children": [12887, 12888]
    }
  }
}
```

---

## Common Release IDs

| ID | Name |
|----|------|
| 53 | Gross Domestic Product |
| 50 | Employment Situation |
| 10 | Consumer Price Index |
| 13 | G.17 Industrial Production and Capacity Utilization |
| 21 | H.6 Money Stock Measures |
| 18 | H.3 Aggregate Reserves of Depository Institutions |
| 19 | H.4.1 Factors Affecting Reserve Balances |
| 51 | International Transactions |
| 9 | Advance Monthly Sales for Retail and Food Services |
| 86 | Commercial Paper |

## Building a Release Calendar

```python
from datetime import datetime, timedelta

def get_release_calendar(api_key, days_ahead=14):
    """Get upcoming data releases."""
    today = datetime.now()
    end_date = today + timedelta(days=days_ahead)

    response = requests.get(
        "https://api.stlouisfed.org/fred/releases/dates",
        params={
            "api_key": api_key,
            "file_type": "json",
            "realtime_start": today.strftime("%Y-%m-%d"),
            "realtime_end": end_date.strftime("%Y-%m-%d"),
            "order_by": "release_date",
            "sort_order": "asc",
            "include_release_dates_with_no_data": "true"
        }
    )

    data = response.json()
    calendar = {}

    for item in data.get("release_dates", []):
        date = item["date"]
        if date not in calendar:
            calendar[date] = []
        calendar[date].append({
            "release_id": item["release_id"],
            "name": item["release_name"]
        })

    return calendar
```
