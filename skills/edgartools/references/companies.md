# edgartools — Companies Reference

## Table of Contents
- [Finding Companies](#finding-companies)
- [Company Properties](#company-properties)
- [Filing Access](#filing-access)
- [Financial Data Methods](#financial-data-methods)
- [Company Screening](#company-screening)
- [Advanced Search](#advanced-search)
- [Company API Reference](#company-api-reference)
- [Error Handling](#error-handling)

---

## Finding Companies

### By Ticker (case-insensitive)
```python
from edgar import Company
company = Company("AAPL")
company = Company("aapl")  # same result
```

### By CIK (fastest, most reliable)
```python
company = Company(320193)
company = Company("320193")
company = Company("0000320193")  # zero-padded
```

### By Name Search
```python
from edgar import find
results = find("Apple")
# Returns list: use results[0] or iterate
for c in results:
    print(f"{c.ticker}: {c.name}")
apple = results[0]
```

### Multiple Share Classes
```python
brk_a = Company("BRK-A")  # Class A
brk_b = Company("BRK-B")  # Class B
# Both share the same CIK
```

---

## Company Properties

```python
company = Company("MSFT")
company.name             # "Microsoft Corporation"
company.cik              # 789019
company.display_name     # "MSFT - Microsoft Corporation"
company.ticker           # "MSFT"
company.tickers          # ["MSFT"] (list of all tickers)
company.industry         # "SERVICES-PREPACKAGED SOFTWARE"
company.sic              # "7372"
company.fiscal_year_end  # "0630" (June 30)
company.exchange         # "Nasdaq"
company.website          # "https://www.microsoft.com"
company.city             # "Redmond"
company.state            # "WA"
company.shares_outstanding  # float (from SEC company facts)
company.public_float        # float in dollars
company.is_company          # True
company.not_found           # False if found
```

---

## Filing Access

### get_filings()
```python
# All filings
filings = company.get_filings()

# Filter by form type
annual = company.get_filings(form="10-K")
multi = company.get_filings(form=["10-K", "10-Q"])

# Filter by date
recent = company.get_filings(filing_date="2023-01-01:")
range_ = company.get_filings(filing_date="2023-01-01:2023-12-31")

# Filter by year/quarter
q4 = company.get_filings(year=2023, quarter=4)
multi_year = company.get_filings(year=[2022, 2023])

# Other filters
xbrl_only = company.get_filings(is_xbrl=True)
original = company.get_filings(amendments=False)
```

**Parameters:**
- `form` — str or list of str
- `year` — int, list, or range
- `quarter` — 1, 2, 3, or 4
- `filing_date` / `date` — "YYYY-MM-DD" or "YYYY-MM-DD:YYYY-MM-DD"
- `amendments` — bool (default True)
- `is_xbrl` — bool
- `is_inline_xbrl` — bool
- `sort_by` — field name (default "filing_date")

**Returns:** `EntityFilings` collection

### latest()
```python
latest_10k = company.latest("10-K")          # single Filing
latest_3 = company.latest("10-Q", 3)         # list of Filings
```

### Convenience Properties
```python
tenk = company.latest_tenk   # TenK object or None
tenq = company.latest_tenq   # TenQ object or None
```

---

## Financial Data Methods

```python
# Annual (from latest 10-K)
financials = company.get_financials()

# Quarterly (from latest 10-Q)
quarterly = company.get_quarterly_financials()

# XBRL facts
facts = company.get_facts()  # Returns EntityFacts
```

---

## Company Screening

```python
import pandas as pd
from edgar import Company

tickers = ["AAPL", "MSFT", "NVDA", "AMZN", "META"]
rows = []
for ticker in tickers:
    company = Company(ticker)
    rows.append({
        'ticker': ticker,
        'name': company.name,
        'industry': company.industry,
        'shares_outstanding': company.shares_outstanding,
        'public_float': company.public_float,
    })

df = pd.DataFrame(rows)
df = df.sort_values('public_float', ascending=False)

# Filter mega-caps (float > $1T)
mega_caps = df[df['public_float'] > 1e12]
```

---

## Advanced Search

### By Industry (SIC code)
```python
from edgar.reference import get_companies_by_industry
software = get_companies_by_industry(sic=7372)
```

### By Exchange
```python
from edgar.reference import get_companies_by_exchanges
nyse = get_companies_by_exchanges("NYSE")
nasdaq = get_companies_by_exchanges("Nasdaq")
```

### By State
```python
from edgar.reference import get_companies_by_state
delaware = get_companies_by_state("DE")
```

---

## Company API Reference

### Constructor
```python
Company(cik_or_ticker: Union[str, int])
```
Raises `CompanyNotFoundError` if not found.

### Address Methods
```python
addr = company.business_address()
# addr.street1, addr.city, addr.state_or_country, addr.zipcode

addr = company.mailing_address()
```

### Utility Methods
```python
ticker = company.get_ticker()       # primary ticker
exchanges = company.get_exchanges() # list of exchange names
company_data = company.data         # EntityData with former_names, entity_type, flags
```

### Factory Functions
```python
from edgar import get_company, get_entity
company = get_company("AAPL")   # same as Company("AAPL")
entity = get_entity("AAPL")
```

---

## Error Handling

```python
from edgar import Company

try:
    company = Company("INVALID")
except Exception as e:
    # fallback to search
    results = find("Invalid Corp")
    if results:
        company = results[0]

# Check if found
company = Company("MAYBE_INVALID")
if company.not_found:
    print("Not available")
else:
    filings = company.get_filings()
```

---

## Batch Processing

```python
tickers = ["AAPL", "MSFT", "GOOGL"]
companies = []

for ticker in tickers:
    try:
        company = Company(ticker)
        companies.append({
            'ticker': ticker,
            'name': company.name,
            'cik': company.cik,
            'industry': company.industry,
        })
    except Exception as e:
        print(f"Error with {ticker}: {e}")
```

## Performance Tips

1. Use CIK when possible — faster than ticker lookup
2. Cache Company objects; avoid repeated API calls
3. Filter filings with specific parameters in `get_filings()`
4. Use reasonable date ranges to limit result sets
