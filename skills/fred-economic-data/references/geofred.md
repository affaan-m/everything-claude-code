# FRED GeoFRED Endpoints

GeoFRED endpoints provide access to geographic/regional economic data and shape files for mapping.

## Table of Contents

1. [geofred/shapes/file](#geofredshapesfile) - Get geographic shape files
2. [geofred/series/group](#geofredseriesgroup) - Get series group metadata
3. [geofred/series/data](#geofredseriesdata) - Get regional series data
4. [geofred/regional/data](#geofredregionaldata) - Get regional data by group

## Base URL

```
https://api.stlouisfed.org/geofred/
```

## About GeoFRED

GeoFRED provides regional economic data for mapping and geographic analysis:
- State-level data (unemployment, income, GDP)
- County-level data
- Metropolitan Statistical Area (MSA) data
- Federal Reserve district data
- International country data

---

## geofred/shapes/file

Get geographic shape files in GeoJSON format for mapping.

**URL:** `https://api.stlouisfed.org/geofred/shapes/file`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |

### Optional Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `shape` | string | Geographic shape type |

### Shape Types

| Value | Description |
|-------|-------------|
| `bea` | Bureau of Economic Analysis regions |
| `msa` | Metropolitan Statistical Areas |
| `frb` | Federal Reserve Bank districts |
| `necta` | New England City and Town Areas |
| `state` | US states |
| `country` | Countries |
| `county` | US counties |
| `censusregion` | Census regions |
| `censusdivision` | Census divisions |

### Example

```python
# Get US state boundaries
response = requests.get(
    "https://api.stlouisfed.org/geofred/shapes/file",
    params={
        "api_key": API_KEY,
        "shape": "state"
    }
)
geojson = response.json()
```

### Response (GeoJSON FeatureCollection)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "California",
        "fips": "06"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[...]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Texas",
        "fips": "48"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[...]]]
      }
    }
  ]
}
```

### Mapping Example with Plotly

```python
import plotly.express as px

# Get shapes
shapes = requests.get(
    "https://api.stlouisfed.org/geofred/shapes/file",
    params={"api_key": API_KEY, "shape": "state"}
).json()

# Get unemployment data
data = requests.get(
    "https://api.stlouisfed.org/geofred/regional/data",
    params={
        "api_key": API_KEY,
        "series_group": "1220",
        "region_type": "state",
        "date": "2023-01-01",
        "units": "Percent",
        "frequency": "a",
        "season": "NSA",
        "file_type": "json"
    }
).json()

# Create choropleth
fig = px.choropleth(
    data["data"]["2023-01-01"],
    geojson=shapes,
    locations="code",
    featureidkey="properties.fips",
    color="value",
    scope="usa",
    title="Unemployment Rate by State"
)
fig.show()
```

---

## geofred/series/group

Get meta information for a regional data series.

**URL:** `https://api.stlouisfed.org/geofred/series/group`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | FRED series ID with geographic data |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |

### Example

```python
# Get info about Texas employment series
response = requests.get(
    "https://api.stlouisfed.org/geofred/series/group",
    params={
        "api_key": API_KEY,
        "series_id": "TXNA",
        "file_type": "json"
    }
)
```

### Response

```json
{
  "series_group": {
    "title": "All Employees: Total Nonfarm",
    "region_type": "state",
    "series_group": "1223",
    "season": "NSA",
    "units": "Thousands of Persons",
    "frequency": "Annual",
    "min_date": "1990-01-01",
    "max_date": "2023-01-01"
  }
}
```

### Response Fields

| Field | Description |
|-------|-------------|
| `title` | Series title |
| `region_type` | Geographic region type |
| `series_group` | Group identifier for related series |
| `season` | Seasonality (NSA, SA, etc.) |
| `units` | Units of measurement |
| `frequency` | Data frequency |
| `min_date` | Earliest available date |
| `max_date` | Latest available date |

**Note:** This endpoint only works with FRED series that have associated geographic data.

---

## geofred/series/data

Get regional data for a specific series.

**URL:** `https://api.stlouisfed.org/geofred/series/data`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_id` | string | FRED series ID with geographic data |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `date` | string | most recent | YYYY-MM-DD |
| `start_date` | string | - | YYYY-MM-DD |

**Note:** XML format is unavailable for county-level data.

### Example

```python
# Get Wisconsin per capita income data
response = requests.get(
    "https://api.stlouisfed.org/geofred/series/data",
    params={
        "api_key": API_KEY,
        "series_id": "WIPCPI",
        "file_type": "json",
        "date": "2022-01-01"
    }
)
```

### Response

```json
{
  "meta": {
    "title": "Per Capita Personal Income",
    "region": "state",
    "seasonality": "Not Seasonally Adjusted",
    "units": "Dollars",
    "frequency": "Annual",
    "date": "2022-01-01"
  },
  "data": {
    "2022-01-01": [
      {
        "region": "Alabama",
        "code": "01",
        "value": "48000",
        "series_id": "ALPCPI"
      },
      {
        "region": "Alaska",
        "code": "02",
        "value": "62000",
        "series_id": "AKPCPI"
      }
    ]
  }
}
```

---

## geofred/regional/data

Get regional data using a series group ID. This is the most flexible endpoint for regional data.

**URL:** `https://api.stlouisfed.org/geofred/regional/data`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `series_group` | string | Series group ID |
| `region_type` | string | Geographic region type |
| `date` | string | Target date (YYYY-MM-DD) |
| `season` | string | Seasonality code |
| `units` | string | Units of measurement |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `start_date` | string | - | YYYY-MM-DD |
| `frequency` | string | - | Data frequency |
| `transformation` | string | lin | Data transformation |
| `aggregation_method` | string | avg | avg, sum, eop |

### Region Types

| Value | Description |
|-------|-------------|
| `bea` | Bureau of Economic Analysis regions |
| `msa` | Metropolitan Statistical Areas |
| `frb` | Federal Reserve Bank districts |
| `necta` | New England City and Town Areas |
| `state` | US states |
| `country` | Countries |
| `county` | US counties |
| `censusregion` | Census regions |

### Seasonality Codes

| Code | Description |
|------|-------------|
| SA | Seasonally Adjusted |
| NSA | Not Seasonally Adjusted |
| SSA | Smoothed Seasonally Adjusted |
| SAAR | Seasonally Adjusted Annual Rate |
| NSAAR | Not Seasonally Adjusted Annual Rate |

### Example: State Unemployment Rates

```python
response = requests.get(
    "https://api.stlouisfed.org/geofred/regional/data",
    params={
        "api_key": API_KEY,
        "series_group": "1220",  # Unemployment rate
        "region_type": "state",
        "date": "2023-01-01",
        "units": "Percent",
        "frequency": "a",
        "season": "NSA",
        "file_type": "json"
    }
)
```

### Response

```json
{
  "meta": {
    "title": "Unemployment Rate",
    "region": "state",
    "seasonality": "Not Seasonally Adjusted",
    "units": "Percent",
    "frequency": "Annual"
  },
  "data": {
    "2023-01-01": [
      {
        "region": "Alabama",
        "code": "01",
        "value": "2.8",
        "series_id": "ALUR"
      },
      {
        "region": "California",
        "code": "06",
        "value": "4.3",
        "series_id": "CAUR"
      }
    ]
  }
}
```

### Example: Per Capita Income by County

```python
response = requests.get(
    "https://api.stlouisfed.org/geofred/regional/data",
    params={
        "api_key": API_KEY,
        "series_group": "882",  # Per capita income
        "region_type": "county",
        "date": "2021-01-01",
        "units": "Dollars",
        "frequency": "a",
        "season": "NSA",
        "file_type": "json"
    }
)
```

### Example: GDP by Metro Area

```python
response = requests.get(
    "https://api.stlouisfed.org/geofred/regional/data",
    params={
        "api_key": API_KEY,
        "series_group": "1282",  # Real GDP
        "region_type": "msa",
        "date": "2022-01-01",
        "units": "Millions of Chained 2017 Dollars",
        "frequency": "a",
        "season": "NSA",
        "file_type": "json"
    }
)
```

---

## Common Series Groups

| Group ID | Description | Region Types |
|----------|-------------|--------------|
| 882 | Per Capita Personal Income | state, county, msa |
| 1220 | Unemployment Rate | state, county, msa |
| 1223 | Total Nonfarm Employment | state, msa |
| 1282 | Real GDP | state, msa |
| 1253 | House Price Index | state, msa |
| 1005 | Population | state, county |

---

## Building a Regional Dashboard

```python
def get_state_dashboard(api_key, state_code, date):
    """Get key economic indicators for a state."""

    indicators = {
        "unemployment": {"group": "1220", "units": "Percent"},
        "income": {"group": "882", "units": "Dollars"},
        "employment": {"group": "1223", "units": "Thousands of Persons"}
    }

    dashboard = {}

    for name, params in indicators.items():
        response = requests.get(
            "https://api.stlouisfed.org/geofred/regional/data",
            params={
                "api_key": api_key,
                "series_group": params["group"],
                "region_type": "state",
                "date": date,
                "units": params["units"],
                "frequency": "a",
                "season": "NSA",
                "file_type": "json"
            }
        )
        data = response.json()

        # Find state data
        for region in data.get("data", {}).get(date, []):
            if region["code"] == state_code:
                dashboard[name] = {
                    "value": region["value"],
                    "units": params["units"],
                    "series_id": region["series_id"]
                }
                break

    return dashboard

# Get California dashboard
ca_data = get_state_dashboard(API_KEY, "06", "2023-01-01")
```

## Creating Choropleth Maps

```python
import pandas as pd
import plotly.express as px

def create_state_map(api_key, series_group, date, title):
    """Create a choropleth map of state-level data."""

    # Get shapes
    shapes = requests.get(
        f"https://api.stlouisfed.org/geofred/shapes/file",
        params={"api_key": api_key, "shape": "state"}
    ).json()

    # Get data
    response = requests.get(
        "https://api.stlouisfed.org/geofred/regional/data",
        params={
            "api_key": api_key,
            "series_group": series_group,
            "region_type": "state",
            "date": date,
            "units": "Percent",
            "frequency": "a",
            "season": "NSA",
            "file_type": "json"
        }
    )
    data = response.json()

    # Convert to DataFrame
    df = pd.DataFrame(data["data"][date])
    df["value"] = pd.to_numeric(df["value"], errors="coerce")

    # Create map
    fig = px.choropleth(
        df,
        geojson=shapes,
        locations="code",
        featureidkey="properties.fips",
        color="value",
        hover_name="region",
        scope="usa",
        title=title,
        color_continuous_scale="RdYlGn_r"
    )

    return fig

# Create unemployment map
map_fig = create_state_map(
    API_KEY,
    series_group="1220",
    date="2023-01-01",
    title="Unemployment Rate by State (2023)"
)
map_fig.show()
```

## Time Series by Region

```python
def get_regional_time_series(api_key, series_group, region_type, start_date, end_date):
    """Get time series data for all regions."""
    from datetime import datetime

    # Generate dates (annual)
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    all_data = {}

    for year in range(start.year, end.year + 1):
        date = f"{year}-01-01"

        response = requests.get(
            "https://api.stlouisfed.org/geofred/regional/data",
            params={
                "api_key": api_key,
                "series_group": series_group,
                "region_type": region_type,
                "date": date,
                "units": "Percent",
                "frequency": "a",
                "season": "NSA",
                "file_type": "json"
            }
        )
        data = response.json()

        for region in data.get("data", {}).get(date, []):
            region_name = region["region"]
            if region_name not in all_data:
                all_data[region_name] = {}
            all_data[region_name][date] = region["value"]

    return all_data

# Get 5-year unemployment trends by state
trends = get_regional_time_series(
    API_KEY,
    series_group="1220",
    region_type="state",
    start_date="2019-01-01",
    end_date="2023-01-01"
)
```
