# Response Format — U.S. Treasury Fiscal Data API

## Response Structure (JSON)

```json
{
  "data": [
    {
      "record_date": "2024-03-31",
      "tot_pub_debt_out_amt": "34589629941.12"
    }
  ],
  "meta": {
    "count": 100,
    "labels": {
      "record_date": "Record Date",
      "tot_pub_debt_out_amt": "Total Public Debt Outstanding"
    },
    "dataTypes": {
      "record_date": "DATE",
      "tot_pub_debt_out_amt": "CURRENCY"
    },
    "dataFormats": {
      "record_date": "YYYY-MM-DD",
      "tot_pub_debt_out_amt": "10.2"
    },
    "total-count": 3790,
    "total-pages": 38
  },
  "links": {
    "self": "&page%5Bnumber%5D=1&page%5Bsize%5D=100",
    "first": "&page%5Bnumber%5D=1&page%5Bsize%5D=100",
    "prev": null,
    "next": "&page%5Bnumber%5D=2&page%5Bsize%5D=100",
    "last": "&page%5Bnumber%5D=38&page%5Bsize%5D=100"
  }
}
```

## `meta` Object

| Field | Description |
|-------|-------------|
| `count` | Number of records in this response page |
| `total-count` | Total records matching the query (all pages) |
| `total-pages` | Total pages available at current page size |
| `labels` | Human-readable column labels |
| `dataTypes` | Logical data type: `STRING`, `NUMBER`, `DATE`, `CURRENCY`, `INTEGER`, `PERCENTAGE` |
| `dataFormats` | Format hints: `YYYY-MM-DD`, `10.2` (10 digits, 2 decimal), `String` |

## `links` Object

Use the `links` object to navigate pagination programmatically:

| Field | Value |
|-------|-------|
| `self` | Current page query params |
| `first` | First page |
| `prev` | Previous page (null if on first page) |
| `next` | Next page (null if on last page) |
| `last` | Last page |

## `data` Object

Array of row objects. All values are **strings**, regardless of logical type.

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK — successful GET |
| 304 | Not Modified — cached response |
| 400 | Bad Request — malformed URL or invalid parameter |
| 403 | Forbidden — invalid API key (N/A; no key required) |
| 404 | Not Found — endpoint does not exist |
| 405 | Method Not Allowed — non-GET request |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error |

## Error Object

When an error occurs, the response contains an error object instead of `data`:

```json
{
  "error": "Invalid Query Param",
  "message": "Invalid query parameter 'sorts' with value '[-record_date]'. For more information please see the documentation."
}
```

```python
resp = requests.get(url, params=params)
result = resp.json()

if "error" in result:
    print(f"API Error: {result['error']}")
    print(f"Message: {result['message']}")
elif resp.status_code != 200:
    print(f"HTTP {resp.status_code}: {resp.text}")
else:
    data = result["data"]
```

## Common Error Causes

- Invalid field name in `fields=` parameter
- Invalid filter operator (use `eq`, `gte`, `lte`, `gt`, `lt`, `in`)
- Wrong date format (must be `YYYY-MM-DD`)
- Accessing a v2 endpoint with `/v1/` in the URL
- `sort` field not available in the endpoint

## Parsing Responses

```python
import requests
import pandas as pd

def api_to_dataframe(endpoint, params=None):
    """Fetch API data and return a typed DataFrame."""
    base = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
    resp = requests.get(f"{base}{endpoint}", params=params)
    resp.raise_for_status()
    result = resp.json()
    
    df = pd.DataFrame(result["data"])
    meta = result["meta"]
    
    # Apply type conversions using metadata
    for col, dtype in meta["dataTypes"].items():
        if col not in df.columns:
            continue
        if dtype in ("NUMBER", "CURRENCY", "PERCENTAGE"):
            df[col] = pd.to_numeric(df[col].replace("null", None), errors="coerce")
        elif dtype == "DATE":
            df[col] = pd.to_datetime(df[col].replace("null", None), errors="coerce")
        elif dtype == "INTEGER":
            df[col] = pd.to_numeric(df[col].replace("null", None), errors="coerce").astype("Int64")
    
    return df, meta

# Usage
df, meta = api_to_dataframe(
    "/v2/accounting/od/debt_to_penny",
    params={"sort": "-record_date", "page[size]": 30}
)
print(f"Total records available: {meta['total-count']}")
print(df[["record_date", "tot_pub_debt_out_amt"]].head())
```

## CSV Format Response

When `format=csv` is specified, the response body is plain CSV text (not JSON):

```python
import io

resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
    params={"format": "csv", "sort": "-record_date", "page[size]": 100}
)
df = pd.read_csv(io.StringIO(resp.text))
```

## XML Format Response

When `format=xml` is specified, the response body is XML:

```python
import xml.etree.ElementTree as ET

resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
    params={"format": "xml", "page[size]": 10}
)
root = ET.fromstring(resp.text)
```
