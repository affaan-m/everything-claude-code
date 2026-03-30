# edgartools — Filings Reference

## Table of Contents
- [Getting a Filing](#getting-a-filing)
- [Filing Properties](#filing-properties)
- [Accessing Content](#accessing-content)
- [Structured Data](#structured-data)
- [Attachments & Exhibits](#attachments--exhibits)
- [Search Within a Filing](#search-within-a-filing)
- [Viewing & Display](#viewing--display)
- [Save, Load & Export](#save-load--export)
- [Filings Collection API](#filings-collection-api)
- [Filtering & Navigation](#filtering--navigation)

---

## Getting a Filing

```python
from edgar import Company, get_filings, get_by_accession_number, Filing

# From a company
company = Company("AAPL")
filing = company.get_filings(form="10-K").latest()

# Global search
filings = get_filings(2024, 1, form="10-K")
filing = filings[0]
filing = filings.latest()

# By accession number
filing = get_by_accession_number("0000320193-23-000106")

# Direct construction (rarely needed)
filing = Filing(
    form='10-Q',
    filing_date='2024-06-30',
    company='Tesla Inc.',
    cik=1318605,
    accession_no='0001628280-24-028839'
)
```

---

## Filing Properties

### Basic Properties
```python
filing.cik              # 320193
filing.company          # "Apple Inc."
filing.form             # "10-K"
filing.filing_date      # "2023-11-03"
filing.period_of_report # "2023-09-30"
filing.accession_no     # "0000320193-23-000106"
filing.accession_number # alias for accession_no
```

### EntityFiling Extra Properties (from company.get_filings())
```python
filing.acceptance_datetime  # datetime
filing.file_number          # "001-36743"
filing.size                 # bytes
filing.primary_document     # filename
filing.is_xbrl              # bool
filing.is_inline_xbrl       # bool
```

### URL Properties
```python
filing.homepage_url   # SEC index page URL
filing.filing_url     # primary document URL
filing.text_url       # text version URL
filing.base_dir       # base directory for all files
```

---

## Accessing Content

```python
html = filing.html()         # HTML string or None
text = filing.text()         # plain text (clean)
md = filing.markdown()       # markdown string
xml = filing.xml()           # XML string or None (ownership forms)
full = filing.full_text_submission()  # complete SGML submission

# Markdown with page breaks (good for LLM processing)
md = filing.markdown(include_page_breaks=True, start_page_number=1)
```

---

## Structured Data

### Get Form-Specific Object (Primary Method)
```python
obj = filing.obj()        # or filing.data_object()
# Returns: TenK, TenQ, EightK, Form4, ThirteenF, ProxyStatement, etc.
```

**IMPORTANT:** The base `Filing` class has NO `financials` property.

```python
# WRONG:
filing.financials  # AttributeError!

# CORRECT:
tenk = filing.obj()
if tenk and tenk.financials:
    income = tenk.financials.income_statement
```

### Form → Class Mapping
| Form | Class | Module |
|------|-------|--------|
| 10-K | TenK | edgar.company_reports |
| 10-Q | TenQ | edgar.company_reports |
| 8-K | EightK | edgar.company_reports |
| 20-F | TwentyF | edgar.company_reports |
| 4 | Form4 | edgar.ownership |
| 3 | Form3 | edgar.ownership |
| 5 | Form5 | edgar.ownership |
| DEF 14A | ProxyStatement | edgar.proxy |
| 13F-HR | ThirteenF | edgar.holdings |
| SC 13D/G | Schedule13 | edgar.ownership |
| NPORT-P | NportFiling | edgar.nport |
| 144 | Form144 | edgar.ownership |

### Get XBRL Data
```python
xbrl = filing.xbrl()     # Returns XBRL object or None
if xbrl:
    income = xbrl.statements.income_statement()
    balance = xbrl.statements.balance_sheet()
    cashflow = xbrl.statements.cash_flow_statement()
```

---

## Attachments & Exhibits

### List Attachments
```python
attachments = filing.attachments
print(f"Total: {len(attachments)}")

for att in attachments:
    print(f"{att.sequence}: {att.description}")
    print(f"  Type: {att.document_type}")
    print(f"  File: {att.document}")
```

### Primary Document
```python
primary = filing.document
```

### Access by Index or Name
```python
first = filing.attachments[0]
specific = filing.attachments["ex-10_1.htm"]
```

### Download Attachments
```python
filing.attachments[0].download("./downloads/")
filing.attachments.download("./downloads/")  # all
```

### Work with Exhibits
```python
exhibits = filing.exhibits

for exhibit in exhibits:
    print(f"Exhibit {exhibit.exhibit_number}: {exhibit.description}")
    if exhibit.exhibit_number == "10.1":
        exhibit.download("./exhibits/")
```

---

## Search Within a Filing

```python
# Simple text search
results = filing.search("artificial intelligence")
print(f"Found {len(results)} mentions")

# Regex search
emails = filing.search(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    regex=True
)

# Financial terms
revenue_mentions = filing.search("revenue")
risk_factors = filing.search("risk factor")
critical = filing.search(r'\b(material weakness|restatement)\b', regex=True)
```

### Document Sections
```python
sections = filing.sections()  # list of section names
doc = filing.parse()          # parse to Document for advanced ops
```

---

## Viewing & Display

```python
filing.view()                # display in console/Jupyter with Rich
filing.open()                # open primary doc in browser
filing.open_homepage()       # open SEC index page
filing.serve(port=8080)      # serve locally at http://localhost:8080
```

---

## Save, Load & Export

```python
# Save
filing.save("./data/filings/")         # auto-generates filename
filing.save("./data/apple_10k.pkl")    # specific file

# Load
filing = Filing.load("./data/apple_10k.pkl")

# Export
data = filing.to_dict()
summary_df = filing.summary()

# Download raw
filing.download(data_directory="./raw_filings/", compress=False)
```

---

## Filings Collection API

### get_filings() — Global Search
```python
from edgar import get_filings

filings = get_filings(2024, 1, form="10-K")   # Q1 2024 10-Ks
filings = get_filings(2023, form="10-K")       # all 2023 10-Ks
filings = get_filings([2022, 2023, 2024])      # multiple years
filings = get_filings(2024, [1, 2], form="10-Q")
filings = get_filings(2024, 1, amendments=False)
```

**Note:** `get_filings()` has NO `limit` parameter. Use `.head(n)` after.

### Collection Properties
```python
len(filings)         # count
filings.empty        # bool
filings.date_range   # (start_date, end_date)
filings.start_date   # earliest
filings.end_date     # latest
```

### Access & Iteration
```python
first = filings[0]
last = filings[-1]

for filing in filings:
    print(f"{filing.form}: {filing.company}")

# By accession number
filing = filings.get("0001234567-24-000001")
```

### Subset Operations
```python
filings.latest()     # most recent (single Filing)
filings.latest(10)   # 10 most recent (Filings)
filings.head(20)     # first 20
filings.tail(20)     # last 20
filings.sample(10)   # random 10
```

---

## Filtering & Navigation

### filter()
```python
# Form type
annual = filings.filter(form="10-K")
multi = filings.filter(form=["10-K", "10-Q"])
original = filings.filter(form="10-K", amendments=False)

# Date
jan = filings.filter(date="2024-01-01")
q1 = filings.filter(date="2024-01-01:2024-03-31")
recent = filings.filter(date="2024-01-01:")

# Company
apple = filings.filter(ticker="AAPL")
apple = filings.filter(cik=320193)
faang = filings.filter(ticker=["AAPL", "MSFT", "GOOGL"])

# Exchange
nasdaq = filings.filter(exchange="NASDAQ")
major = filings.filter(exchange=["NASDAQ", "NYSE"])
```

### Chain Filters
```python
result = (filings
    .filter(form="10-K")
    .filter(exchange="NASDAQ")
    .filter(date="2024-01-01:")
    .latest(50))
```

### Find by Company Name
```python
tech = filings.find("Technology")
apple = filings.find("Apple")
```

### Pagination
```python
next_page = filings.next()
prev_page = filings.previous()
current = filings.current()
```

---

## Export & Persistence

```python
df = filings.to_pandas()
df = filings.to_pandas('form', 'company', 'filing_date', 'cik')

filings.save_parquet("filings.parquet")  # or .save()
filings.download(data_directory="./raw_data/", compress=True)
```

---

## Common Recipes

### Extract Revenue from Latest 10-K
```python
company = Company("MSFT")
filing = company.get_filings(form="10-K").latest()
tenk = filing.obj()
if tenk.financials:
    income = tenk.financials.income_statement
    print(income)
```

### Convert to Markdown for LLM Analysis
```python
company = Company("NVDA")
filing = company.get_filings(form="10-K").latest()
md = filing.markdown(include_page_breaks=True)
with open("nvidia_10k.md", "w") as f:
    f.write(md)
```

### Search Across Recent 8-K Filings
```python
filings = get_filings(2024, 1, form="8-K").head(50)
for filing in filings:
    if filing.search("earnings"):
        print(f"{filing.company} ({filing.filing_date})")
```

### Batch Process with Pagination
```python
def process_all(filings):
    current = filings
    results = []
    while current and not current.empty:
        for filing in current:
            results.append(filing.to_dict())
        current = current.next()
    return results
```
