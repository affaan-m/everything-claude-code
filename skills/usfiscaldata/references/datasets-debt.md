# Debt Datasets — U.S. Treasury Fiscal Data

## Debt to the Penny

**Endpoint:** `/v2/accounting/od/debt_to_penny`  
**Frequency:** Daily  
**Date Range:** 1993-04-01 to present

Tracks the exact total public debt outstanding each business day.

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Date of record |
| `debt_held_public_amt` | CURRENCY | Debt held by the public |
| `intragov_hold_amt` | CURRENCY | Intragovernmental holdings |
| `tot_pub_debt_out_amt` | CURRENCY | **Total public debt outstanding** |

```python
# Current national debt
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
    params={"sort": "-record_date", "page[size]": 1}
)
latest = resp.json()["data"][0]
print(f"As of {latest['record_date']}: ${float(latest['tot_pub_debt_out_amt']):,.2f}")

# Debt over the last year
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
    params={
        "fields": "record_date,tot_pub_debt_out_amt",
        "filter": "record_date:gte:2024-01-01",
        "sort": "-record_date"
    }
)
df = pd.DataFrame(resp.json()["data"])
df["tot_pub_debt_out_amt"] = df["tot_pub_debt_out_amt"].astype(float)
```

## Historical Debt Outstanding

**Endpoint:** `/v2/accounting/od/historical_debt_outstanding`  
**Frequency:** Annual  
**Date Range:** 1790 to present

Annual record of U.S. national debt going back to the founding of the republic.

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Year-end date |
| `debt_outstanding_amt` | CURRENCY | Total debt outstanding |

```python
# Full historical debt series
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/historical_debt_outstanding",
    params={"sort": "-record_date", "page[size]": 10000}
)
df = pd.DataFrame(resp.json()["data"])
```

## Schedules of Federal Debt

**Endpoint:** `/v1/accounting/od/schedules_fed_debt`  
**Frequency:** Monthly  
**Date Range:** October 2005 to present

Monthly breakdown of federal debt by security type and component.

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | End of month date |
| `security_type_desc` | STRING | Type of security |
| `security_class_desc` | STRING | Security class |
| `debt_outstanding_amt` | CURRENCY | Outstanding debt |

## Schedules of Federal Debt by Day

**Endpoint:** `/v1/accounting/od/schedules_fed_debt_daily`  
**Frequency:** Daily  
**Date Range:** September 2006 to present

Daily version of federal debt schedules with two data tables.

## Treasury Report on Receivables (TROR)

**Endpoint:** `/v2/debt/tror`  
**Frequency:** Quarterly  
**Date Range:** December 2016 to present

Federal agency compliance and receivables data. Also includes:
- `/v2/debt/tror/data_act_compliance` — 120 Day Delinquent Debt Referral Compliance Report

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Quarter end date |
| `funding_type_desc` | STRING | Type of funding |
| `total_receivables_delinquent_amt` | CURRENCY | Delinquent amount |

```python
# TROR data, sorted by funding type
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/debt/tror",
    params={"sort": "funding_type_id"}
)
```

## Gift Contributions to Reduce the Public Debt

**Endpoint:** `/v2/accounting/od/gift_contributions`  
**Frequency:** Monthly  
**Date Range:** September 1996 to present

Records voluntary contributions from the public to reduce the national debt.

## Interest Expense on the Public Debt Outstanding

**Endpoint:** `/v2/accounting/od/interest_expense`  
**Frequency:** Monthly  
**Date Range:** May 2010 to present

Monthly interest expense broken down by security type.

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Month end date |
| `security_type_desc` | STRING | Security type |
| `expense_net_amt` | CURRENCY | Net interest expense |
| `expense_gross_amt` | CURRENCY | Gross interest expense |

```python
# Get total interest expense by month
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/interest_expense",
    params={
        "fields": "record_date,expense_net_amt",
        "filter": "record_date:gte:2020-01-01",
        "sort": "-record_date"
    }
)
df = pd.DataFrame(resp.json()["data"])
df["expense_net_amt"] = df["expense_net_amt"].astype(float)
```

## Advances to State Unemployment Funds (Title XII)

**Endpoint:** `/v2/accounting/od/title_xii`  
**Frequency:** Daily  
**Date Range:** October 2016 to present

States and territories borrowing from the federal Unemployment Trust Fund.

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Date of record |
| `state_nm` | STRING | State name |
| `debt_outstanding_amt` | CURRENCY | Outstanding advance amount |
