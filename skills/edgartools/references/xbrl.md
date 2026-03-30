# edgartools — XBRL Reference

## Table of Contents
- [Core Classes](#core-classes)
- [XBRL Class](#xbrl-class)
- [Statements Access](#statements-access)
- [XBRLS — Multi-Period Analysis](#xbrls--multi-period-analysis)
- [Facts Querying](#facts-querying)
- [Statement to DataFrame](#statement-to-dataframe)
- [Value Transformations](#value-transformations)
- [Rendering](#rendering)
- [Error Handling](#error-handling)
- [Import Reference](#import-reference)

---

## Core Classes

| Class | Purpose |
|-------|---------|
| `XBRL` | Parse single filing's XBRL |
| `XBRLS` | Multi-period analysis across filings |
| `Statements` | Access financial statements from single XBRL |
| `Statement` | Individual statement object |
| `StitchedStatements` | Multi-period statements interface |
| `StitchedStatement` | Multi-period individual statement |
| `FactsView` | Query interface for all XBRL facts |
| `FactQuery` | Fluent fact query builder |

---

## XBRL Class

### Creating an XBRL Object

```python
from edgar.xbrl import XBRL

# From a Filing object (most common)
xbrl = XBRL.from_filing(filing)

# Via filing method
xbrl = filing.xbrl()   # returns None if no XBRL

# From directory
xbrl = XBRL.from_directory("/path/to/xbrl/files")

# From file list
xbrl = XBRL.from_files(["/path/instance.xml", "/path/taxonomy.xsd"])
```

### Core Properties

```python
xbrl.statements   # Statements object
xbrl.facts        # FactsView object

# Convert all facts to DataFrame
df = xbrl.to_pandas()
# Columns: concept, value, period, label, ...
```

### Statement Methods

```python
stmt = xbrl.get_statement("BalanceSheet")
stmt = xbrl.get_statement("IncomeStatement")
stmt = xbrl.get_statement("CashFlowStatement")
stmt = xbrl.get_statement("StatementOfEquity")

# Render with rich formatting
rendered = xbrl.render_statement("BalanceSheet")
rendered = xbrl.render_statement("IncomeStatement", show_percentages=True, max_rows=50)
print(rendered)
```

---

## Statements Access

```python
statements = xbrl.statements

balance_sheet = statements.balance_sheet()
income_stmt   = statements.income_statement()
cash_flow     = statements.cash_flow_statement()
equity        = statements.statement_of_equity()
comprehensive = statements.comprehensive_income()
```

All return `Statement` objects or `None` if not found.

---

## XBRLS — Multi-Period Analysis

```python
from edgar import Company
from edgar.xbrl import XBRLS

company = Company("AAPL")

# Get multiple filings (use amendments=False for clean stitching)
filings = company.get_filings(form="10-K", amendments=False).head(3)

# Stitch together
xbrls = XBRLS.from_filings(filings)

# Access stitched statements
stitched = xbrls.statements

income_stmt    = stitched.income_statement()
balance_sheet  = stitched.balance_sheet()
cashflow       = stitched.cashflow_statement()
equity_stmt    = stitched.statement_of_equity()
comprehensive  = stitched.comprehensive_income()
```

### StitchedStatements Parameters

All methods accept:
- `max_periods` (int) — max periods to include (default: 8)
- `standard` (bool) — use standardized concept labels (default: True)
- `use_optimal_periods` (bool) — use entity info for period selection (default: True)
- `show_date_range` (bool) — show full date ranges (default: False)
- `include_dimensions` (bool) — include segment data (default: False)
- `view` (str) — `"standard"`, `"detailed"`, or `"summary"` (overrides `include_dimensions`)

```python
# Standard view (default)
income = stitched.income_statement()

# Detailed view with dimensional breakdowns
income_detailed = stitched.income_statement(view="detailed")

# Convert to DataFrame (periods as columns)
df = income.to_dataframe()
```

---

## Facts Querying

### FactsView — Starting a Query

```python
facts = xbrl.facts

# Query by concept
revenue_q = facts.by_concept("Revenue")
revenue_q = facts.by_concept("us-gaap:Revenue", exact=True)

# Query by label
rd_q = facts.by_label("Research", exact=False)

# Query by value range
large_q = facts.by_value(min_value=1_000_000_000)
small_q = facts.by_value(max_value=100_000)
range_q = facts.by_value(min_value=100, max_value=1000)

# Query by period
period_q = facts.by_period(start_date="2023-01-01", end_date="2023-12-31")
```

### FactQuery — Fluent Chaining

```python
# Chain multiple filters
query = (xbrl.facts
         .by_concept("Revenue")
         .by_period(start_date="2023-01-01")
         .by_value(min_value=1_000_000))

# Execute
facts_list = query.execute()      # List[Dict]
facts_df   = query.to_dataframe() # DataFrame
first_fact = query.first()        # Dict or None
count      = query.count()        # int

# Filter by statement type
income_facts = xbrl.facts.by_statement("IncomeStatement")
```

### Analysis Methods on FactsView

```python
# Pivot: concepts as rows, periods as columns
pivot = facts.pivot_by_period(["Revenue", "NetIncomeLoss"])

# Time series for a concept
revenue_ts = facts.time_series("Revenue")  # pandas Series

# Convert all to DataFrame
all_df = facts.to_dataframe()
```

---

## Statement to DataFrame

### Statement.to_dataframe()

```python
statement = xbrl.statements.income_statement()

# Raw mode (default) — exact XML values
df_raw = statement.to_dataframe()

# Presentation mode — matches SEC HTML display
df_presentation = statement.to_dataframe(presentation=True)

# Additional options
df = statement.to_dataframe(
    include_dimensions=True,   # include segment breakdowns (default: True)
    include_unit=True,         # include unit column (USD, shares)
    include_point_in_time=True # include point-in-time column
)
```

### Columns in output
- Core: `concept`, `label`, period date columns
- Metadata (always): `balance`, `weight`, `preferred_sign`
- Optional: `dimension`, `unit`, `point_in_time`

### Get Concept Value
```python
revenue = statement.get_concept_value("Revenue")
net_income = statement.get_concept_value("NetIncomeLoss")
```

---

## Value Transformations

edgartools provides two layers of values:

**Raw Values (default):** Values exactly as in XML instance document. Consistent across companies, comparable to SEC CompanyFacts API.

**Presentation Values (`presentation=True`):** Transformed to match SEC HTML display. Cash flow outflows shown as negative. Good for investor-facing reports.

```python
statement = xbrl.statements.cash_flow_statement()

# Raw: dividends paid appears as positive
df_raw = statement.to_dataframe()

# Presentation: dividends paid appears as negative (matches HTML)
df_pres = statement.to_dataframe(presentation=True)
```

### Metadata columns explain semantics:
- `balance`: debit/credit from schema
- `weight`: calculation weight (+1.0 or -1.0)
- `preferred_sign`: presentation hint (+1 or -1)

### When to use each:
| Use Raw | Use Presentation |
|---------|-----------------|
| Cross-company analysis | Matching SEC HTML display |
| Data science / ML | Investor-facing reports |
| Comparison with CompanyFacts API | Traditional financial statement signs |

---

## Rendering

```python
# Render single statement
rendered = xbrl.render_statement("BalanceSheet")
print(rendered)  # Rich formatted output

# Render Statement object
stmt = xbrl.statements.income_statement()
rendered = stmt.render()
rendered = stmt.render(show_percentages=True, max_rows=50)
print(rendered)

# Multi-period render
stitched_stmt = xbrls.statements.income_statement()
rendered = stitched_stmt.render(show_date_range=True)
print(rendered)
```

---

## Advanced Examples

### Complex Fact Query
```python
from edgar import Company
from edgar.xbrl import XBRL

company = Company("MSFT")
filing = company.latest("10-K")
xbrl = XBRL.from_filing(filing)

# Query with multiple filters
results = (xbrl.facts
           .by_concept("Revenue")
           .by_value(min_value=50_000_000_000)
           .by_period(start_date="2023-01-01")
           .to_dataframe())

# Pivot analysis
pivot = xbrl.facts.pivot_by_period([
    "Revenue",
    "NetIncomeLoss",
    "OperatingIncomeLoss"
])
```

### Cross-Company Comparison
```python
from edgar import Company
from edgar.xbrl import XBRL

companies = ["AAPL", "MSFT", "GOOGL"]
for ticker in companies:
    company = Company(ticker)
    filing = company.latest("10-K")
    xbrl = XBRL.from_filing(filing)
    if xbrl and xbrl.statements.income_statement():
        stmt = xbrl.statements.income_statement()
        revenue = stmt.get_concept_value("Revenue")
        print(f"{ticker}: ${revenue/1e9:.1f}B")
```

---

## Error Handling

```python
from edgar.xbrl import XBRL, XBRLFilingWithNoXbrlData

try:
    xbrl = XBRL.from_filing(filing)
except XBRLFilingWithNoXbrlData:
    print("No XBRL data in this filing")

# Check availability
xbrl = filing.xbrl()
if xbrl is None:
    print("No XBRL available")
    text = filing.text()  # fallback

# Check statement availability
if xbrl and xbrl.statements.income_statement():
    income = xbrl.statements.income_statement()
    df = income.to_dataframe()
```

---

## Import Reference

```python
# Core
from edgar.xbrl import XBRL, XBRLS

# Statements
from edgar.xbrl import Statements, Statement
from edgar.xbrl import StitchedStatements, StitchedStatement

# Facts
from edgar.xbrl import FactsView, FactQuery
from edgar.xbrl import StitchedFactsView, StitchedFactQuery

# Rendering & standardization
from edgar.xbrl import StandardConcept, RenderedStatement

# Utilities
from edgar.xbrl import stitch_statements, render_stitched_statement, to_pandas
```
