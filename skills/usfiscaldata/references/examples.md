# Code Examples — U.S. Treasury Fiscal Data

## Python Examples

### Setup

```python
import requests
import pandas as pd

BASE_URL = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"

def fetch(endpoint, **params):
    resp = requests.get(f"{BASE_URL}{endpoint}", params=params)
    resp.raise_for_status()
    return resp.json()
```

### National Debt Tracker

```python
# Current total public debt
result = fetch("/v2/accounting/od/debt_to_penny", 
               sort="-record_date", **{"page[size]": 1})
d = result["data"][0]
debt = float(d["tot_pub_debt_out_amt"])
print(f"National debt as of {d['record_date']}: ${debt/1e12:.2f} trillion")

# Debt trend over last 5 years
result = fetch("/v2/accounting/od/debt_to_penny",
               fields="record_date,tot_pub_debt_out_amt",
               filter="record_date:gte:2020-01-01",
               sort="-record_date", **{"page[size]": 10000})
df = pd.DataFrame(result["data"])
df["date"] = pd.to_datetime(df["record_date"])
df["debt_trillion"] = df["tot_pub_debt_out_amt"].astype(float) / 1e12
df = df.sort_values("date")
print(df[["date", "debt_trillion"]].tail(10))
```

### Federal Exchange Rates

```python
# All current Treasury exchange rates
result = fetch("/v1/accounting/od/rates_of_exchange",
               sort="-record_date", **{"page[size]": 300})
df = pd.DataFrame(result["data"])
latest = df[df["record_date"] == df["record_date"].max()]
latest = latest.copy()
latest["exchange_rate"] = latest["exchange_rate"].astype(float)
latest = latest.sort_values("country_currency_desc")
print(latest[["country_currency_desc", "exchange_rate", "record_date"]].to_string(index=False))

# Convert USD amount to foreign currencies
def convert_usd(usd_amount, rates_df):
    rates_df = rates_df.copy()
    rates_df["value_in_foreign"] = usd_amount * rates_df["exchange_rate"].astype(float)
    return rates_df[["country_currency_desc", "value_in_foreign"]]

conversions = convert_usd(1000, latest)
print(conversions.head(10))
```

### Treasury Securities Auction Analysis

```python
# Recent 10-year note auctions
result = fetch("/v1/accounting/od/auctions_query",
               filter="security_type:eq:Note,security_term:eq:10-Year",
               sort="-record_date", **{"page[size]": 20})
df = pd.DataFrame(result["data"])
numeric_cols = ["accepted_comp_bid_rate_amt", "bid_to_cover_ratio", 
                "total_accepted_amt", "indirect_bid_pct_accepted"]
for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")
print(df[["record_date", "security_term", "accepted_comp_bid_rate_amt", 
         "bid_to_cover_ratio"]].head(10))

# Auction yield trend: 2-year vs 10-year
def get_auction_yields(term, n=24):
    result = fetch("/v1/accounting/od/auctions_query",
                   fields="record_date,security_term,accepted_comp_bid_rate_amt",
                   filter=f"security_type:eq:Note,security_term:eq:{term}",
                   sort="-record_date", **{"page[size]": n})
    df = pd.DataFrame(result["data"])
    df["yield"] = df["accepted_comp_bid_rate_amt"].astype(float)
    df["date"] = pd.to_datetime(df["record_date"])
    return df[["date", "yield", "security_term"]].sort_values("date")

t2 = get_auction_yields("2-Year")
t10 = get_auction_yields("10-Year")
yield_curve = t2.merge(t10, on="date", suffixes=("_2y", "_10y"), how="inner")
yield_curve["spread"] = yield_curve["yield_10y"] - yield_curve["yield_2y"]
print("Yield curve spread (10y - 2y):")
print(yield_curve[["date", "yield_2y", "yield_10y", "spread"]].tail(10))
```

### Daily Treasury Statement Analysis

```python
# Recent Treasury General Account (TGA) balance
result = fetch("/v1/accounting/dts/operating_cash_balance",
               sort="-record_date", **{"page[size]": 10})
df = pd.DataFrame(result["data"])
print("Treasury General Account Balances (most recent):")
for _, row in df.head(5).iterrows():
    bal = float(row["close_today_bal"])
    print(f"  {row['record_date']}: ${bal:,.0f} million")

# Monthly total receipts and withdrawals
result = fetch("/v1/accounting/dts/deposits_withdrawals_operating_cash",
               fields="record_date,transaction_type,transaction_today_amt",
               filter="record_date:gte:2024-01-01",
               sort="-record_date", **{"page[size]": 10000})
df = pd.DataFrame(result["data"])
df["amount"] = df["transaction_today_amt"].astype(float)
summary = df.groupby(["record_date", "transaction_type"])["amount"].sum().unstack()
print(summary.tail(10))
```

### Monthly Treasury Statement (Budget)

```python
# Federal budget receipts and outlays (MTS Table 1)
result = fetch("/v1/accounting/mts/mts_table_1",
               filter="record_fiscal_year:eq:2024",
               sort="record_date", **{"page[size]": 1000})
df = pd.DataFrame(result["data"])

# Get total receipts line (line code varies; filter by description)
receipts = df[df["classification_desc"].str.contains("Total Receipts", na=False, case=False)]
outlays = df[df["classification_desc"].str.contains("Total Outlays", na=False, case=False)]
print("FY2024 Monthly Summary:")
print(receipts[["record_date", "current_month_gross_rcpt_amt"]].head(12))
```

### Interest Rate Analysis

```python
# Average interest rates on all marketable Treasury securities
result = fetch("/v2/accounting/od/avg_interest_rates",
               filter="security_type_desc:eq:Marketable,record_date:gte:2015-01-01",
               sort="-record_date", **{"page[size]": 10000})
df = pd.DataFrame(result["data"])
df["date"] = pd.to_datetime(df["record_date"])
df["rate"] = df["avg_interest_rate_amt"].astype(float)

# Pivot to compare rates across security types
pivot = df.pivot_table(index="date", columns="security_desc", values="rate")
print(pivot.tail(5))

# I Bond rates history
result = fetch("/v2/accounting/od/i_bond_interest_rates",
               sort="-effective_date", **{"page[size]": 20})
df = pd.DataFrame(result["data"])
df["total_rate"] = df["earnings_rate_i_bonds"].astype(float)
df["fixed_rate"] = df["fixed_rate"].astype(float)
print("I Bond rate history:")
print(df[["effective_date", "fixed_rate", "total_rate"]].head(10))
```

### Fiscal Year Summary

```python
def get_fiscal_year_summary(fy: int):
    """Get key fiscal metrics for a given fiscal year."""
    
    # Total debt at end of FY
    fy_end = f"{fy}-09-30"
    result = fetch("/v2/accounting/od/debt_to_penny",
                   filter=f"record_date:lte:{fy_end}",
                   sort="-record_date", **{"page[size]": 1})
    debt = float(result["data"][0]["tot_pub_debt_out_amt"]) / 1e12

    # Interest expense for FY
    result = fetch("/v2/accounting/od/interest_expense",
                   fields="record_date,expense_net_amt",
                   filter=f"record_fiscal_year:eq:{fy}",
                   **{"page[size]": 10000})
    interest_df = pd.DataFrame(result["data"])
    if not interest_df.empty:
        total_interest = interest_df["expense_net_amt"].astype(float).sum() / 1e9
    else:
        total_interest = None
    
    return {
        "fiscal_year": fy,
        "total_debt_trillion": round(debt, 2),
        "interest_expense_billion": round(total_interest, 1) if total_interest else None
    }

for fy in [2021, 2022, 2023, 2024]:
    summary = get_fiscal_year_summary(fy)
    print(f"FY{fy}: Debt=${summary['total_debt_trillion']}T, "
          f"Interest=${summary['interest_expense_billion']}B")
```

---

## R Examples

```r
library(httr)
library(jsonlite)

BASE_URL <- "https://api.fiscaldata.treasury.gov/services/api/fiscal_service"

# National debt
response <- GET(paste0(BASE_URL, "/v2/accounting/od/debt_to_penny"),
                query = list(sort = "-record_date", `page[size]` = 1))
data <- fromJSON(rawToChar(response$content))$data
cat(sprintf("Total debt: $%.2f trillion\n", 
            as.numeric(data$tot_pub_debt_out_amt) / 1e12))

# Exchange rates
response <- GET(paste0(BASE_URL, "/v1/accounting/od/rates_of_exchange"),
                query = list(
                    fields = "country_currency_desc,exchange_rate,record_date",
                    filter = "record_date:gte:2024-01-01",
                    sort = "-record_date",
                    `page[size]` = 200
                ))
rates <- fromJSON(rawToChar(response$content))$data
rates$exchange_rate <- as.numeric(rates$exchange_rate)
head(rates)

# MTS Table 9: latest total receipts
response <- GET(paste0(BASE_URL, "/v1/accounting/mts/mts_table_9"),
                query = list(
                    filter = "line_code_nbr:eq:120",
                    sort = "-record_date",
                    `page[size]` = 1
                ))
mts_data <- fromJSON(rawToChar(response$content))$data
cat("Latest total receipts line:", mts_data$current_month_gross_rcpt_amt, "\n")
```

---

## Discovering Available Fields

To find available fields for any endpoint, request a small sample and inspect the `meta.labels` and `meta.dataTypes`:

```python
result = fetch("/v2/accounting/od/debt_to_penny", **{"page[size]": 1})
meta = result["meta"]
for field, label in meta["labels"].items():
    dtype = meta["dataTypes"].get(field, "?")
    fmt = meta["dataFormats"].get(field, "?")
    print(f"{field:40s} | {dtype:12s} | {label}")
```

## Finding Datasets

Browse the full list of 54 datasets and 182 endpoints at:
- `https://fiscaldata.treasury.gov/datasets/` — searchable dataset catalog
- `https://fiscaldata.treasury.gov/api-documentation/#list-of-endpoints-table` — full endpoint table
