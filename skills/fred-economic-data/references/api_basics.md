# FRED API Basics

## Base URL

```
https://api.stlouisfed.org/fred/
```

For GeoFRED endpoints:
```
https://api.stlouisfed.org/geofred/
```

## Authentication

All requests require an API key passed as a query parameter:

```
api_key=YOUR_32_CHARACTER_KEY
```

### Obtaining an API Key

1. Create account at https://fredaccount.stlouisfed.org
2. Log in and request an API key
3. Key is a 32-character lowercase alphanumeric string

### Rate Limits

- API implements rate limiting
- HTTP 429 (Too Many Requests) when exceeded
- Contact FRED team for higher limits if needed

## Response Formats

All endpoints support multiple formats via `file_type` parameter:

| Format | Content-Type |
|--------|--------------|
| `xml` | text/xml (default) |
| `json` | application/json |

Some observation endpoints also support:
- `csv` - Comma-separated values
- `xlsx` - Excel format

## Common Parameters

These parameters are available on most endpoints:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `api_key` | string | required | 32-character API key |
| `file_type` | string | xml | Response format: xml, json |
| `realtime_start` | date | today | Start of real-time period (YYYY-MM-DD) |
| `realtime_end` | date | today | End of real-time period (YYYY-MM-DD) |

## Real-Time Periods (ALFRED)

FRED supports historical (vintage) data access through real-time parameters:

- `realtime_start`: Beginning of the real-time period
- `realtime_end`: End of the real-time period
- Format: YYYY-MM-DD

This allows you to see data as it appeared at specific points in time:

```python
# Get GDP as it was reported on Jan 1, 2020
params = {
    "series_id": "GDP",
    "realtime_start": "2020-01-01",
    "realtime_end": "2020-01-01"
}
```

### FRED vs ALFRED

- **FRED**: Shows current/most recent data values
- **ALFRED**: Shows historical vintages and revisions of data

Use real-time parameters to access ALFRED data through the same API endpoints.

## Pagination

Many endpoints support pagination:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | varies | Maximum results (typically 1000) |
| `offset` | integer | 0 | Number of results to skip |

Example:
```python
# First page
params = {"limit": 100, "offset": 0}

# Second page
params = {"limit": 100, "offset": 100}
```

## Sorting

Many endpoints support sorting:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `order_by` | string | varies | Field to sort by |
| `sort_order` | string | asc | Sort direction: asc, desc |

## Error Responses

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing API key |
| 404 | Not Found - Invalid endpoint or resource |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

**XML:**
```xml
<error code="400" message="Bad Request. Variable api_key has not been set."/>
```

**JSON:**
```json
{
    "error_code": 400,
    "error_message": "Bad Request. The value for variable api_key is not registered..."
}
```

## Data Types

### Date Format

All dates use YYYY-MM-DD format:
- Valid: `2023-01-15`
- Invalid: `01/15/2023`, `Jan 15, 2023`

### Missing Values

In observation data, missing values are represented as a period:
```json
{"date": "2020-01-01", "value": "."}
```

Always check for this when parsing values:
```python
value = obs["value"]
if value != ".":
    numeric_value = float(value)
```

## Tag Groups

Tags are organized into groups:

| Group ID | Description |
|----------|-------------|
| freq | Frequency (monthly, quarterly, etc.) |
| gen | General/topic tags |
| geo | Geography (usa, california, etc.) |
| geot | Geography type (nation, state, etc.) |
| rls | Release |
| seas | Seasonal adjustment |
| src | Source |
| cc | Citation/Copyright |

## Example API Call

```python
import requests

response = requests.get(
    "https://api.stlouisfed.org/fred/series/observations",
    params={
        "api_key": "YOUR_KEY",
        "series_id": "GDP",
        "file_type": "json",
        "observation_start": "2020-01-01",
        "units": "pch"
    }
)

data = response.json()
print(data)
```

## Python Setup

Install required packages:

```bash
uv pip install requests pandas
```

Environment variable setup:
```bash
export FRED_API_KEY="your_32_character_key"
```

```python
import os
api_key = os.environ.get("FRED_API_KEY")
```
