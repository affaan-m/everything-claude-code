# edgartools — Financial Data Reference

## Table of Contents
- [Quick Start](#quick-start)
- [Available Statements](#available-statements)
- [Convenience Methods](#convenience-methods)
- [Detail Levels (Views)](#detail-levels-views)
- [DataFrame Export](#dataframe-export)
- [Quarterly vs Annual](#quarterly-vs-annual)
- [Multi-Period Analysis](#multi-period-analysis)
- [Raw XBRL Facts Query](#raw-xbrl-facts-query)
- [API Quick Reference](#api-quick-reference)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```python
from edgar import Company

company = Company("AAPL")

# Annual (from latest 10-K)
financials = company.get_financials()
income = financials.income_statement()

# Quarterly (from latest 10-Q)
quarterly = company.get_quarterly_financials()
income = quarterly.income_statement()
```

---

## Available Statements

```python
financials = company.get_financials()

income     = financials.income_statement()
balance    = financials.balance_sheet()
cashflow   = financials.cashflow_statement()   # note: no underscore
equity     = financials.statement_of_equity()
comprehensive = financials.comprehensive_income()
```

| Method | Description |
|--------|-------------|
| `income_statement()` | Revenue, COGS, operating income, net income |
| `balance_sheet()` | Assets, liabilities, equity |
| `cashflow_statement()` | Operating, investing, financing cash flows |
| `statement_of_equity()` | Changes in stockholders' equity |
| `comprehensive_income()` | Net income + other comprehensive income |

---

## Convenience Methods

Get single values directly:

```python
financials = company.get_financials()

revenue     = financials.get_revenue()
net_income  = financials.get_net_income()
total_assets = financials.get_total_assets()
total_liabs  = financials.get_total_liabilities()
equity       = financials.get_stockholders_equity()
op_cash_flow = financials.get_operating_cash_flow()
free_cash_flow = financials.get_free_cash_flow()
capex        = financials.get_capital_expenditures()
current_assets = financials.get_current_assets()
current_liabs  = financials.get_current_liabilities()

# All key metrics at once
metrics = financials.get_financial_metrics()  # dict

# Prior period: period_offset=1 (previous), 0=current
prev_revenue = financials.get_revenue(period_offset=1)
```

---

## Detail Levels (Views)

Control the level of detail in financial statements:

```python
income = financials.income_statement()

# Summary: ~15-20 rows, matches SEC Viewer
df_summary = income.to_dataframe(view="summary")

# Standard (default): ~25-35 rows, matches filing document
df_standard = income.to_dataframe(view="standard")

# Detailed: ~50+ rows, all dimensional breakdowns
df_detailed = income.to_dataframe(view="detailed")
```

| View | Use Case |
|------|----------|
| `"summary"` | Quick overview, validating against SEC Viewer |
| `"standard"` | Display, full context (default) |
| `"detailed"` | Data extraction, segment analysis |

**Example — Apple Revenue breakdown:**
- Summary: `Revenue  $391,035M`
- Standard: `Products $298,085M`, `Services $92,950M`
- Detailed: iPhone, Mac, iPad, Wearables separately

---

## DataFrame Export

```python
income = financials.income_statement()

# Convert to DataFrame
df = income.to_dataframe()
df = income.to_dataframe(view="detailed")

# Export
df.to_csv("apple_income.csv")
df.to_excel("apple_income.xlsx")
```

---

## Quarterly vs Annual

| Need | Method |
|------|--------|
| Annual (10-K) | `company.get_financials()` |
| Quarterly (10-Q) | `company.get_quarterly_financials()` |

```python
quarterly = company.get_quarterly_financials()
q_income = quarterly.income_statement()
```

---

## Multi-Period Analysis

Use `XBRLS` to analyze trends across multiple filings:

```python
from edgar.xbrl import XBRLS

# Get last 3 annual filings (use amendments=False)
filings = company.get_filings(form="10-K", amendments=False).head(3)

# Stitch together
xbrls = XBRLS.from_filings(filings)

# Get aligned multi-period statements
income = xbrls.statements.income_statement()
income_detailed = xbrls.statements.income_statement(view="detailed")

balance = xbrls.statements.balance_sheet()
cashflow = xbrls.statements.cashflow_statement()

# Convert to DataFrame (periods as columns)
df = income.to_dataframe()
print(df)
```

**Why `amendments=False`?** Amended filings (10-K/A) sometimes contain only corrected sections, not complete financial statements, which breaks multi-period stitching.

---

## Raw XBRL Facts Query

For research or custom calculations:

```python
xbrl = filing.xbrl()

# Find revenue facts
revenue_facts = xbrl.facts.query()\
    .by_concept("Revenue")\
    .to_dataframe()

# Search by label
rd_facts = xbrl.facts.query()\
    .by_label("Research", exact=False)\
    .to_dataframe()

# Filter by value range
large_items = xbrl.facts.query()\
    .by_value(min_value=1_000_000_000)\
    .to_dataframe()
```

---

## API Quick Reference

### Company-Level
| Method | Description |
|--------|-------------|
| `company.get_financials()` | Latest annual (10-K) |
| `company.get_quarterly_financials()` | Latest quarterly (10-Q) |

### Financials Object
| Method | Description |
|--------|-------------|
| `financials.income_statement()` | Income statement |
| `financials.balance_sheet()` | Balance sheet |
| `financials.cashflow_statement()` | Cash flow |
| `financials.get_revenue()` | Revenue scalar |
| `financials.get_net_income()` | Net income scalar |
| `financials.get_total_assets()` | Total assets scalar |
| `financials.get_financial_metrics()` | Dict of all key metrics |

### Statement Object
| Method | Description |
|--------|-------------|
| `statement.to_dataframe()` | Convert to DataFrame |
| `statement.to_dataframe(view="summary")` | SEC Viewer format |
| `statement.to_dataframe(view="standard")` | Filing document format |
| `statement.to_dataframe(view="detailed")` | All dimensional breakdowns |

### Filing-Level (More Control)
| Method | Description |
|--------|-------------|
| `filing.xbrl()` | Parse XBRL from filing |
| `xbrl.statements.income_statement()` | Income statement |
| `xbrl.facts.query()` | Query individual facts |

### Multi-Period
| Method | Description |
|--------|-------------|
| `XBRLS.from_filings(filings)` | Stitch multiple filings |
| `xbrls.statements.income_statement()` | Aligned multi-period |

---

## Troubleshooting

### "No financial data found"
```python
filing = company.get_filings(form="10-K").latest()
if filing.xbrl():
    print("XBRL available")
else:
    # Older/smaller companies may not have XBRL
    text = filing.text()  # fallback to raw text
```

### "Statement is empty"
Try the detailed view:
```python
df = income.to_dataframe(view="detailed")
```

### "Numbers don't match SEC website"
Check the reporting periods:
```python
xbrl = filing.xbrl()
print(xbrl.reporting_periods)
```

### Accessing financials from a 10-K filing
```python
# WRONG: filing.financials does not exist
filing.financials  # AttributeError!

# CORRECT:
tenk = filing.obj()
if tenk and tenk.financials:
    income = tenk.financials.income_statement
```
