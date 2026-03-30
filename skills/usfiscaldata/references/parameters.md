# Query Parameters — U.S. Treasury Fiscal Data API

All parameters are optional. Combine them with `&` in the URL query string.

## `fields=` — Select Columns

Returns only the specified fields. Accepts a comma-separated list of field names.

```
?fields=record_date,tot_pub_debt_out_amt
?fields=country_currency_desc,exchange_rate,record_date
```

- If omitted, all fields are returned
- Invalid field names cause an error
- Omitting some fields can trigger **automatic aggregation** (see below)

### Aggregation / Auto-Sum

When the `fields=` parameter excludes some non-numeric fields, the API automatically groups by the remaining fields and sums numeric values.

```python
# Returns sum of transaction amounts grouped by record_date and transaction_type
params = {
    "fields": "record_date,transaction_type,transaction_today_amt"
}
```

## `filter=` — Filter Records

Narrow results by field values. Multiple field filters are **comma-separated in a single `filter=` parameter**.

### Filter Syntax

```
filter=<field>:<operator>:<value>
filter=<field>:<operator>:<value>,<field>:<operator>:<value>
```

### Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `eq` | Equal to | `filter=record_date:eq:2024-03-31` |
| `lt` | Less than | `filter=exchange_rate:lt:1.5` |
| `lte` | Less than or equal | `filter=record_date:lte:2024-12-31` |
| `gt` | Greater than | `filter=record_fiscal_year:gt:2010` |
| `gte` | Greater than or equal | `filter=record_date:gte:2024-01-01` |
| `in` | Contained in set | `filter=country_currency_desc:in:(Canada-Dollar,Mexico-Peso)` |

### Date Filters

Use `YYYY-MM-DD` format for dates:

```
filter=record_date:gte:2024-01-01
filter=record_date:gte:2023-01-01,record_date:lte:2023-12-31
```

### Multi-Field Filters

```
filter=country_currency_desc:in:(Canada-Dollar,Mexico-Peso),record_date:gte:2024-01-01
```

### Common Filter Fields

Most endpoints have these standard date fields:
- `record_date` — The date of the record (YYYY-MM-DD)
- `record_fiscal_year` — Fiscal year (e.g., `2024`)
- `record_fiscal_quarter` — Fiscal quarter (1-4)
- `record_calendar_year` — Calendar year
- `record_calendar_month` — Calendar month (01-12)

## `sort=` — Sort Results

Sort by one or more fields. Prefix `-` for descending order.

```
?sort=-record_date           # Most recent first
?sort=record_date            # Oldest first
?sort=-record_fiscal_year,-record_fiscal_quarter  # Nested sort
```

**Default:** Sorted by the first column (usually `record_date` ascending).

## `format=` — Output Format

```
?format=json    # Default
?format=csv     # Comma-separated values
?format=xml     # XML
```

When using CSV or XML format, the response is the raw file content rather than JSON.

## `page[size]=` and `page[number]=` — Pagination

Controls how many records per page and which page to return.

```
?page[size]=100&page[number]=1    # Default (100 records, page 1)
?page[size]=10000                  # Large page to reduce requests
?page[number]=5&page[size]=50     # 50 records starting at page 5
```

- Default page size: **100**
- Default page number: **1**
- Use `meta.total-pages` in the response to know how many pages exist
- Use `meta.total-count` for total record count

### Fetch All Records

```python
import requests
import pandas as pd

def fetch_all(endpoint, params=None):
    """Fetch all pages and return as DataFrame."""
    params = dict(params or {})
    params["page[size]"] = 10000
    params["page[number]"] = 1
    
    base = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"
    all_data = []
    
    while True:
        resp = requests.get(f"{base}{endpoint}", params=params)
        result = resp.json()
        all_data.extend(result["data"])
        
        meta = result["meta"]
        if params["page[number]"] >= meta["total-pages"]:
            break
        params["page[number]"] += 1
    
    return pd.DataFrame(all_data)
```

## Combining Parameters

```python
params = {
    "fields": "country_currency_desc,exchange_rate,record_date",
    "filter": "country_currency_desc:in:(Canada-Dollar,Euro),record_date:gte:2020-01-01",
    "sort": "-record_date",
    "format": "json",
    "page[size]": 100,
    "page[number]": 1
}
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange",
    params=params
)
```
