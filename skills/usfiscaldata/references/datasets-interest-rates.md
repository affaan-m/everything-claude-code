# Interest Rates & Exchange Rate Datasets — U.S. Treasury Fiscal Data

## Average Interest Rates on U.S. Treasury Securities

**Endpoint:** `/v2/accounting/od/avg_interest_rates`  
**Frequency:** Monthly  
**Date Range:** January 2001 to present

Average interest rates for marketable and non-marketable Treasury securities, broken down by security type.

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Month end date |
| `security_desc` | STRING | Security description (e.g., "Treasury Bills") |
| `security_type_desc` | STRING | "Marketable" or "Non-marketable" |
| `avg_interest_rate_amt` | PERCENTAGE | Average interest rate (%) |

```python
# Get average rates for all marketable securities, most recent month
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates",
    params={
        "filter": "security_type_desc:eq:Marketable",
        "sort": "-record_date",
        "page[size]": 50
    }
)
df = pd.DataFrame(resp.json()["data"])
latest = df[df["record_date"] == df["record_date"].max()]
print(latest[["security_desc", "avg_interest_rate_amt"]])

# Historical rate for a specific security type
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates",
    params={
        "fields": "record_date,avg_interest_rate_amt",
        "filter": "security_desc:eq:Treasury Notes,record_date:gte:2010-01-01",
        "sort": "-record_date"
    }
)
```

**Common security descriptions:**
- `Treasury Bills`
- `Treasury Notes`
- `Treasury Bonds`
- `Treasury Inflation-Protected Securities (TIPS)`
- `Treasury Floating Rate Notes (FRN)`
- `Federal Financing Bank`
- `United States Savings Securities`
- `Government Account Series`
- `Total Marketable`
- `Total Non-marketable`
- `Total Interest-bearing Debt`

---

## Treasury Reporting Rates of Exchange

**Endpoint:** `/v1/accounting/od/rates_of_exchange`  
**Frequency:** Quarterly  
**Date Range:** March 2001 to present

Official Treasury exchange rates for foreign currencies used by federal agencies for reporting purposes. Updated quarterly (March 31, June 30, September 30, December 31).

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Quarter end date |
| `country` | STRING | Country name |
| `currency` | STRING | Currency name |
| `country_currency_desc` | STRING | Combined "Country-Currency" (e.g., "Canada-Dollar") |
| `exchange_rate` | NUMBER | Units of foreign currency per 1 USD |
| `effective_date` | DATE | Date rate became effective |

```python
# Get all current exchange rates (latest quarter)
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange",
    params={"sort": "-record_date", "page[size]": 200}
)
df = pd.DataFrame(resp.json()["data"])
latest_date = df["record_date"].max()
current_rates = df[df["record_date"] == latest_date].copy()
current_rates["exchange_rate"] = current_rates["exchange_rate"].astype(float)
print(current_rates[["country_currency_desc", "exchange_rate"]].to_string())

# Euro rate history
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange",
    params={
        "fields": "record_date,exchange_rate",
        "filter": "country_currency_desc:eq:Euro Zone-Euro",
        "sort": "-record_date",
        "page[size]": 100
    }
)
euro_df = pd.DataFrame(resp.json()["data"])
euro_df["exchange_rate"] = euro_df["exchange_rate"].astype(float)
euro_df["record_date"] = pd.to_datetime(euro_df["record_date"])
```

---

## TIPS and CPI Data

**Endpoint:** `/v1/accounting/od/tips_cpi_data`  
**Frequency:** Monthly  
**Date Range:** April 1998 to present (2 data tables)

Treasury Inflation-Protected Securities (TIPS) reference CPI data and index ratios used to calculate TIPS values.

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Date of record |
| `index_ratio` | NUMBER | Index ratio for TIPS adjustment |
| `ref_cpi` | NUMBER | Reference CPI value |

---

## FRN Daily Indexes

**Endpoint:** `/v1/accounting/od/frn_daily_indexes`  
**Frequency:** Daily  
**Date Range:** April 2024 to present

Daily index values for Treasury Floating Rate Notes (FRNs). The rate is based on the 13-week Treasury bill auction rate.

---

## Treasury Certified Interest Rates

Four certification periods, each with their own endpoint set:

### Annual Certification
**Frequency:** Annual  
**Date Range:** October 2006 to present (9 data tables)

### Monthly Certification  
**Frequency:** Monthly  
**Date Range:** October 2006 to present (6 data tables)

### Quarterly Certification
**Frequency:** Quarterly  
**Date Range:** October 2006 to present (4 data tables)

### Semi-Annual Certification
**Frequency:** Semi-Annual  
**Date Range:** January 2008 to present (1 data table)

These certified interest rates are used for federal loans, financing programs, and other purposes requiring official Treasury-certified rates.

---

## Federal Credit Similar Maturity Rates

**Endpoint:** `/v1/accounting/od/fed_credit_similar_maturity_rates`  
**Frequency:** Annual  
**Date Range:** September 1992 to present

Interest rates used for valuing federal credit programs (loans and loan guarantees) under the Federal Credit Reform Act.

---

## Historical Qualified Tax Credit Bond Interest Rates

**Frequency:** Daily (Discontinued)  
**Date Range:** March 2009 – January 2018

Historical interest rates for Qualified Tax Credit Bonds (QTCB). No longer updated.

---

## State and Local Government Series (SLGS) Daily Rate Table

**Endpoint:** `/v1/accounting/od/slgs_savings_bonds` (2 tables)  
**Frequency:** Daily  
**Date Range:** June 1992 to present

Daily interest rates for State and Local Government Series securities, used by state and local issuers to comply with federal tax law arbitrage restrictions.
