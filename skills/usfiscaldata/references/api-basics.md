# API Basics — U.S. Treasury Fiscal Data

## Overview

- RESTful API — accepts HTTP GET requests only
- Returns JSON by default (also CSV, XML)
- No API key, no authentication, no registration required
- Open data, free for commercial and non-commercial use
- Current versions: v1 and v2 (check each dataset's page for which version applies)

## URL Structure

```
BASE URL + ENDPOINT + PARAMETERS

Base URL:  https://api.fiscaldata.treasury.gov/services/api/fiscal_service
Endpoint:  /v2/accounting/od/debt_to_penny
Params:    ?fields=record_date,tot_pub_debt_out_amt&sort=-record_date&page[size]=5

Full URL:
https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?fields=record_date,tot_pub_debt_out_amt&sort=-record_date&page[size]=5
```

- Endpoint components use lowercase + underscores
- Endpoint names are singular

## API Versioning

- **v1**: Earlier datasets (DTS, MTS, some debt tables)
- **v2**: Newer or updated datasets (Debt to Penny, TROR, avg interest rates)
- Check the specific dataset page at `fiscaldata.treasury.gov/datasets/` to confirm the version

## Data Types

All field values in responses are **strings** (quoted), regardless of their logical type.

| Logical Type | dataTypes value | Example value | How to convert |
|---|---|---|---|
| String | `STRING` | `"Canada-Dollar"` | No conversion needed |
| Number | `NUMBER` | `"36123456789012.34"` | `float(value)` |
| Date | `DATE` | `"2024-03-31"` | `pd.to_datetime(value)` |
| Currency | `CURRENCY` | `"1234567.89"` | `float(value)` |
| Integer | `INTEGER` | `"42"` | `int(value)` |
| Percentage | `PERCENTAGE` | `"4.25"` | `float(value)` |

**Null values** appear as the string `"null"` (not Python `None` or JSON `null`).

```python
# Safe numeric conversion handling nulls
def safe_float(val):
    return float(val) if val and val != "null" else None
```

## HTTP Methods

- **Only GET is supported**
- POST, PUT, DELETE return HTTP 405

## Rate Limiting

- HTTP 429 is returned when rate limited
- No documented fixed rate limit; implement retry with backoff for bulk requests

```python
import time
import requests

def get_with_retry(url, params, retries=3):
    for attempt in range(retries):
        resp = requests.get(url, params=params)
        if resp.status_code == 429:
            time.sleep(2 ** attempt)
            continue
        resp.raise_for_status()
        return resp.json()
    raise Exception("Rate limited after retries")
```

## Caching

- HTTP 304 (Not Modified) can be returned for cached responses
- Safe to cache responses; most datasets update daily, monthly, or quarterly

## Data Registry

The [Fiscal Service Data Registry](https://fiscal.treasury.gov/data-registry/index.html) contains field definitions, authoritative sources, data types, and formats across federal government data.
