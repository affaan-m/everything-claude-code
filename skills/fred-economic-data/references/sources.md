# FRED Sources Endpoints

Sources endpoints provide access to information about the data sources used in FRED.

## Table of Contents

1. [fred/sources](#fredsources) - Get all sources
2. [fred/source](#fredsource) - Get a specific source
3. [fred/source/releases](#fredsourcereleases) - Get releases for a source

## About Sources

Sources in FRED represent the organizations that produce economic data. Examples include:
- Bureau of Labor Statistics (BLS)
- Bureau of Economic Analysis (BEA)
- Federal Reserve Board
- U.S. Census Bureau
- International Monetary Fund (IMF)
- World Bank

---

## fred/sources

Get all sources of economic data.

**URL:** `https://api.stlouisfed.org/fred/sources`

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
| `order_by` | string | source_id | source_id, name, realtime_start, realtime_end |
| `sort_order` | string | asc | asc or desc |

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/sources",
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
  "count": 100,
  "offset": 0,
  "limit": 1000,
  "sources": [
    {
      "id": 1,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "Board of Governors of the Federal Reserve System (US)",
      "link": "http://www.federalreserve.gov/"
    },
    {
      "id": 3,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "Federal Reserve Bank of Philadelphia",
      "link": "http://www.philadelphiafed.org/"
    },
    {
      "id": 18,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "U.S. Department of Commerce: Bureau of Economic Analysis",
      "link": "http://www.bea.gov/"
    },
    {
      "id": 22,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "U.S. Bureau of Labor Statistics",
      "link": "http://www.bls.gov/"
    }
  ]
}
```

---

## fred/source

Get a specific source of economic data.

**URL:** `https://api.stlouisfed.org/fred/source`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `source_id` | integer | Source identifier |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |

### Example

```python
# Get Federal Reserve Board info
response = requests.get(
    "https://api.stlouisfed.org/fred/source",
    params={
        "api_key": API_KEY,
        "source_id": 1,
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
      "id": 1,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "Board of Governors of the Federal Reserve System (US)",
      "link": "http://www.federalreserve.gov/"
    }
  ]
}
```

---

## fred/source/releases

Get the releases for a source.

**URL:** `https://api.stlouisfed.org/fred/source/releases`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `source_id` | integer | Source identifier |

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
# Get releases from the Federal Reserve Board
response = requests.get(
    "https://api.stlouisfed.org/fred/source/releases",
    params={
        "api_key": API_KEY,
        "source_id": 1,
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
  "count": 26,
  "offset": 0,
  "limit": 1000,
  "releases": [
    {
      "id": 13,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "G.17 Industrial Production and Capacity Utilization",
      "press_release": true,
      "link": "http://www.federalreserve.gov/releases/g17/"
    },
    {
      "id": 14,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "G.19 Consumer Credit",
      "press_release": true,
      "link": "http://www.federalreserve.gov/releases/g19/"
    },
    {
      "id": 18,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "H.3 Aggregate Reserves of Depository Institutions",
      "press_release": true,
      "link": "http://www.federalreserve.gov/releases/h3/"
    },
    {
      "id": 21,
      "realtime_start": "2023-08-14",
      "realtime_end": "2023-08-14",
      "name": "H.6 Money Stock Measures",
      "press_release": true,
      "link": "http://www.federalreserve.gov/releases/h6/"
    }
  ]
}
```

---

## Common Source IDs

| ID | Name | Description |
|----|------|-------------|
| 1 | Board of Governors of the Federal Reserve System | Interest rates, money supply, banking data |
| 3 | Federal Reserve Bank of Philadelphia | Regional surveys, coincident indexes |
| 4 | Federal Reserve Bank of St. Louis | FRED-specific compilations |
| 6 | Federal Reserve Bank of Dallas | Regional economic data |
| 11 | Federal Reserve Bank of Kansas City | Labor market data |
| 18 | Bureau of Economic Analysis (BEA) | GDP, personal income, trade |
| 19 | U.S. Census Bureau | Population, housing, retail sales |
| 22 | Bureau of Labor Statistics (BLS) | Employment, CPI, PPI |
| 31 | National Bureau of Economic Research | Business cycle dates |
| 40 | International Monetary Fund | International financial data |
| 41 | World Bank | Global development indicators |
| 47 | Organisation for Economic Co-operation and Development (OECD) | International economic data |
| 57 | S&P Dow Jones Indices | Stock market indexes |

---

## Use Cases

### Find All Data from a Specific Agency

```python
def get_agency_data(api_key, source_id):
    """Get all releases and their series from a source."""

    # Get source info
    source_info = requests.get(
        "https://api.stlouisfed.org/fred/source",
        params={
            "api_key": api_key,
            "source_id": source_id,
            "file_type": "json"
        }
    ).json()

    # Get all releases from this source
    releases = requests.get(
        "https://api.stlouisfed.org/fred/source/releases",
        params={
            "api_key": api_key,
            "source_id": source_id,
            "file_type": "json"
        }
    ).json()

    return {
        "source": source_info.get("sources", [{}])[0],
        "releases": releases.get("releases", [])
    }

# Get all BLS data
bls_data = get_agency_data(API_KEY, source_id=22)
```

### Compare Data Availability Across Sources

```python
def compare_sources(api_key, source_ids):
    """Compare release counts across sources."""
    comparison = {}

    for sid in source_ids:
        response = requests.get(
            "https://api.stlouisfed.org/fred/source/releases",
            params={
                "api_key": api_key,
                "source_id": sid,
                "file_type": "json"
            }
        )
        data = response.json()

        # Get source name
        source_resp = requests.get(
            "https://api.stlouisfed.org/fred/source",
            params={
                "api_key": api_key,
                "source_id": sid,
                "file_type": "json"
            }
        )
        source_name = source_resp.json().get("sources", [{}])[0].get("name", "Unknown")

        comparison[source_name] = {
            "source_id": sid,
            "release_count": data.get("count", 0),
            "releases": [r["name"] for r in data.get("releases", [])[:5]]
        }

    return comparison

# Compare Federal Reserve and BLS
comparison = compare_sources(API_KEY, [1, 22])
```

### Build a Source Directory

```python
def build_source_directory(api_key):
    """Build a directory of all FRED sources."""

    response = requests.get(
        "https://api.stlouisfed.org/fred/sources",
        params={
            "api_key": api_key,
            "file_type": "json",
            "order_by": "name"
        }
    )
    sources = response.json().get("sources", [])

    directory = []
    for source in sources:
        # Get releases for each source
        releases_resp = requests.get(
            "https://api.stlouisfed.org/fred/source/releases",
            params={
                "api_key": api_key,
                "source_id": source["id"],
                "file_type": "json"
            }
        )
        release_count = releases_resp.json().get("count", 0)

        directory.append({
            "id": source["id"],
            "name": source["name"],
            "link": source.get("link", ""),
            "release_count": release_count
        })

    return directory
```

---

## Source Categories

### U.S. Government Agencies

| ID | Name |
|----|------|
| 18 | Bureau of Economic Analysis |
| 19 | U.S. Census Bureau |
| 22 | Bureau of Labor Statistics |
| 60 | Congressional Budget Office |
| 61 | Office of Management and Budget |

### Federal Reserve System

| ID | Name |
|----|------|
| 1 | Board of Governors |
| 3 | Philadelphia Fed |
| 4 | St. Louis Fed |
| 6 | Dallas Fed |
| 11 | Kansas City Fed |

### International Organizations

| ID | Name |
|----|------|
| 40 | International Monetary Fund |
| 41 | World Bank |
| 47 | OECD |
| 69 | Bank for International Settlements |

### Private Sector

| ID | Name |
|----|------|
| 31 | NBER |
| 57 | S&P Dow Jones Indices |
| 44 | University of Michigan |
