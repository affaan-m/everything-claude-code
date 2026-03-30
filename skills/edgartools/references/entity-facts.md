# edgartools — EntityFacts Reference

Structured access to SEC company financial facts with AI-ready features, querying, and professional formatting.

## Table of Contents
- [EntityFacts Class](#entityfacts-class)
- [FactQuery — Fluent Query Builder](#factquery--fluent-query-builder)
- [FinancialStatement Class](#financialstatement-class)
- [FinancialFact Class](#financialfact-class)
- [Common Patterns](#common-patterns)

---

## EntityFacts Class

### Getting EntityFacts

```python
from edgar import Company

company = Company("AAPL")
facts = company.get_facts()  # Returns EntityFacts object
```

### Core Properties

```python
facts.cik              # 320193
facts.name             # "Apple Inc."
len(facts)             # total number of facts

# DEI properties (from SEC filings)
facts.shares_outstanding       # float or None
facts.public_float             # float or None
facts.shares_outstanding_fact  # FinancialFact with full metadata
facts.public_float_fact        # FinancialFact with full metadata
```

### Financial Statement Methods

```python
# Income statement
stmt = facts.income_statement()                  # FinancialStatement (4 annual periods)
stmt = facts.income_statement(periods=8)         # 8 periods
stmt = facts.income_statement(annual=False)      # quarterly
df   = facts.income_statement(as_dataframe=True) # return DataFrame directly

# Balance sheet
stmt = facts.balance_sheet()
stmt = facts.balance_sheet(periods=4)
stmt = facts.balance_sheet(as_of=date(2024, 12, 31))  # point-in-time

# Cash flow
stmt = facts.cash_flow()
stmt = facts.cashflow_statement(periods=5, annual=True)

# Parameters:
# periods (int): number of periods (default: 4)
# annual (bool): True=annual, False=quarterly (default: True)
# period_length (int): months — 3=quarterly, 12=annual
# as_dataframe (bool): return DataFrame instead of FinancialStatement
# as_of (date): balance sheet only — point-in-time snapshot
```

### Query Interface

```python
query = facts.query()
# Returns FactQuery builder — see FactQuery section
```

### Get Single Fact

```python
revenue_fact = facts.get_fact('Revenue')
q1_revenue   = facts.get_fact('Revenue', '2024-Q1')
# Returns FinancialFact or None
```

### Time Series

```python
revenue_ts = facts.time_series('Revenue', periods=8)  # DataFrame
```

### DEI / Entity Info

```python
# DEI facts DataFrame
dei_df = facts.dei_facts()
dei_df = facts.dei_facts(as_of=date(2024, 12, 31))

# Entity info dict
info = facts.entity_info()
print(info['entity_name'])
print(info['shares_outstanding'])
```

### AI / LLM Methods

```python
# Comprehensive LLM context
context = facts.to_llm_context(
    focus_areas=['profitability', 'growth'],  # or 'liquidity'
    time_period='5Y'    # 'recent', '5Y', '10Y', 'all'
)

# MCP-compatible tool definitions
tools = facts.to_agent_tools()
```

### Iteration

```python
for fact in facts:
    print(f"{fact.concept}: {fact.numeric_value}")
```

---

## FactQuery — Fluent Query Builder

Create via `facts.query()`. All filter methods return `self` for chaining.

### Concept Filtering

```python
query = facts.query()

# Fuzzy matching (default)
q = query.by_concept('Revenue')

# Exact matching
q = query.by_concept('us-gaap:Revenue', exact=True)

# By human-readable label
q = query.by_label('Total Revenue', fuzzy=True)
q = query.by_label('Revenue', fuzzy=False)
```

### Time-Based Filtering

```python
# Fiscal year
q = query.by_fiscal_year(2024)

# Fiscal period
q = query.by_fiscal_period('FY')   # 'FY', 'Q1', 'Q2', 'Q3', 'Q4'
q = query.by_fiscal_period('Q1')

# Period length in months
q = query.by_period_length(3)    # quarterly
q = query.by_period_length(12)   # annual

# Date range
q = query.date_range(start=date(2023, 1, 1), end=date(2024, 12, 31))

# Point-in-time
q = query.as_of(date(2024, 6, 30))

# Latest n periods
q = query.latest_periods(4, annual=True)
q = query.latest_instant()   # most recent balance sheet items
```

### Statement / Form Filtering

```python
q = query.by_statement_type('IncomeStatement')
q = query.by_statement_type('BalanceSheet')
q = query.by_statement_type('CashFlow')

q = query.by_form_type('10-K')
q = query.by_form_type(['10-K', '10-Q'])
```

### Quality Filtering

```python
q = query.high_quality_only()       # audited facts only
q = query.min_confidence(0.9)       # confidence score 0.0-1.0
```

### Sorting

```python
q = query.sort_by('filing_date', ascending=False)
q = query.sort_by('fiscal_year')
```

### Execution

```python
# Execute and return facts
facts_list = query.execute()   # List[FinancialFact]
count = query.count()          # int (no fetch)
latest_n = query.latest(5)     # List[FinancialFact] (most recent)

# Convert to DataFrame
df = query.to_dataframe()
df = query.to_dataframe('label', 'numeric_value', 'fiscal_period')

# Pivot by period
stmt = query.pivot_by_period()                        # FinancialStatement
df   = query.pivot_by_period(return_statement=False)  # DataFrame

# LLM context
llm_data = query.to_llm_context()
```

### Full Chaining Example

```python
results = facts.query()\
    .by_concept('Revenue')\
    .by_fiscal_year(2024)\
    .by_form_type('10-K')\
    .sort_by('filing_date')\
    .execute()
```

---

## FinancialStatement Class

Wrapper around DataFrame with intelligent formatting and display.

### Properties

```python
stmt = company.income_statement()

stmt.shape    # (10, 4) — rows x periods
stmt.columns  # period labels: ['FY 2024', 'FY 2023', ...]
stmt.index    # concept names: ['Revenue', 'Cost of Revenue', ...]
stmt.empty    # bool
```

### Methods

```python
# Get numeric DataFrame for calculations
numeric_df = stmt.to_numeric()
growth_rates = numeric_df.pct_change(axis=1)

# Get specific concept across periods
revenue_series = stmt.get_concept('Revenue')  # pd.Series or None

# Calculate period-over-period growth
growth = stmt.calculate_growth('Revenue', periods=1)  # pd.Series

# Format a value
formatted = stmt.format_value(1234567, 'Revenue')  # "$1,234,567"

# LLM context
context = stmt.to_llm_context()
```

### Display

- Jupyter: automatic HTML rendering with professional styling
- Console: formatted text with proper alignment
- Compatible with Rich library

---

## FinancialFact Class

Individual fact with full metadata.

### Core Attributes

```python
fact = facts.get_fact('Revenue')

fact.concept        # "us-gaap:Revenue"
fact.taxonomy       # "us-gaap"
fact.label          # "Revenue"
fact.value          # raw value
fact.numeric_value  # float for calculations
fact.unit           # "USD", "shares", etc.
fact.scale          # 1000, 1000000, etc.
```

### Temporal Attributes

```python
fact.period_start    # date (for duration facts)
fact.period_end      # date
fact.period_type     # "instant" or "duration"
fact.fiscal_year     # int
fact.fiscal_period   # "FY", "Q1", "Q2", "Q3", "Q4"
```

### Filing Context

```python
fact.filing_date   # date filed
fact.form_type     # "10-K", "10-Q", etc.
fact.accession     # SEC accession number
```

### Quality

```python
fact.data_quality      # DataQuality.HIGH / MEDIUM / LOW
fact.is_audited        # bool
fact.confidence_score  # float 0.0-1.0
```

### AI Attributes

```python
fact.semantic_tags     # List[str]
fact.business_context  # str description
```

### Methods

```python
context = fact.to_llm_context()      # dict for LLM
formatted = fact.get_formatted_value() # "365,817,000,000"
period_key = fact.get_display_period_key()  # "Q1 2024", "FY 2023"
```

---

## Common Patterns

### Multi-Period Income Analysis

```python
from edgar import Company

company = Company("AAPL")
facts = company.get_facts()

# 4 annual periods
stmt = facts.income_statement(periods=4, annual=True)
print(stmt)

# Convert to numeric for calculations
numeric = stmt.to_numeric()
revenue_growth = numeric.loc['Revenue'].pct_change()
print(revenue_growth)
```

### Query Latest Revenue Facts

```python
latest_revenue = facts.query()\
    .by_concept('Revenue')\
    .latest_periods(4, annual=True)\
    .to_dataframe()
```

### Error Handling

```python
from edgar.entity.core import NoCompanyFactsFound

try:
    facts = company.get_facts()
except NoCompanyFactsFound:
    print("No facts available")

# Methods return None gracefully
stmt = facts.income_statement()  # None if no data
if stmt and not stmt.empty:
    # process
    pass
```
