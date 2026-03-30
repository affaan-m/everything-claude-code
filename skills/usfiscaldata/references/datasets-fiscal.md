# Fiscal Statement Datasets — U.S. Treasury Fiscal Data

## Daily Treasury Statement (DTS)

The DTS dataset has **9 data tables**, all under `/v1/accounting/dts/`. Updated daily (business days).

**Date Range:** October 2005 to present

### DTS Tables

| Table | Endpoint | Description |
|-------|----------|-------------|
| Operating Cash Balance | `/v1/accounting/dts/operating_cash_balance` | Treasury General Account balance |
| Deposits & Withdrawals | `/v1/accounting/dts/deposits_withdrawals_operating_cash` | Changes to TGA |
| Public Debt Transactions | `/v1/accounting/dts/public_debt_transactions` | Issues and redemptions of securities |
| Adjustment of Public Debt | `/v1/accounting/dts/adjustment_public_debt_transactions_cash_basis` | Cash basis adjustments |
| Debt Subject to Limit | `/v1/accounting/dts/debt_subject_to_limit` | Debt vs. statutory limit |
| Inter-Agency Tax Transfers | `/v1/accounting/dts/inter_agency_tax_transfers` | Intra-government tax transfers |
| Federal Tax Deposits | `/v1/accounting/dts/federal_tax_deposits` | Tax deposit activity |
| Short-Term Cash Investments | `/v1/accounting/dts/short_term_cash_investments` | Cash investment activity |
| Income Tax Refunds Issued | `/v1/accounting/dts/income_tax_refunds_issued` | Tax refund issuances |

### Common DTS Fields

| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Business date |
| `account_type` | STRING | Account/balance type |
| `open_today_bal` | CURRENCY | Opening balance |
| `open_month_bal` | CURRENCY | Opening month balance |
| `open_fiscal_year_bal` | CURRENCY | Opening fiscal year balance |
| `close_today_bal` | CURRENCY | Closing balance |
| `transaction_today_amt` | CURRENCY | Today's transaction amount |
| `transaction_mtd_amt` | CURRENCY | Month-to-date amount |
| `transaction_fytd_amt` | CURRENCY | Fiscal year-to-date amount |

```python
# Get current Treasury General Account (TGA) balance
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance",
    params={"sort": "-record_date", "page[size]": 5}
)
for row in resp.json()["data"]:
    print(f"{row['record_date']}: ${float(row['close_today_bal']):,.0f}M (closing balance)")

# Get deposits and withdrawals for a specific period
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/deposits_withdrawals_operating_cash",
    params={
        "filter": "record_date:gte:2024-01-01,record_date:lte:2024-01-31",
        "sort": "record_date",
        "page[size]": 1000
    }
)
```

### Aggregation Example (DTS)

```python
# Get sum of today's transaction amounts by transaction type
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/deposits_withdrawals_operating_cash",
    params={
        "fields": "record_date,transaction_type,transaction_today_amt",
        "filter": "record_date:eq:2024-01-15"
    }
)
```

---

## Monthly Treasury Statement (MTS)

The MTS dataset has **16 data tables**, all under `/v1/accounting/mts/`. Updated monthly.

**Date Range:** October 1980 to present

### MTS Tables

| Table | Endpoint | Description |
|-------|----------|-------------|
| MTS Table 1 | `/v1/accounting/mts/mts_table_1` | Summary of Receipts and Outlays |
| MTS Table 2 | `/v1/accounting/mts/mts_table_2` | Receipts by Source |
| MTS Table 3 | `/v1/accounting/mts/mts_table_3` | Outlays by Function |
| MTS Table 4 | `/v1/accounting/mts/mts_table_4` | Outlays by Agency |
| MTS Table 5 | `/v1/accounting/mts/mts_table_5` | Outlays by Category |
| MTS Table 6 | `/v1/accounting/mts/mts_table_6` | Means of Financing |
| MTS Table 7 | `/v1/accounting/mts/mts_table_7` | Receipts by Source (Quarterly) |
| MTS Table 8 | `/v1/accounting/mts/mts_table_8` | Outlays by Function (Quarterly) |
| MTS Table 9 | `/v1/accounting/mts/mts_table_9` | Receipts: Comparative Summary |
| MTS Table 10 | `/v1/accounting/mts/mts_table_10` | Outlays: Comparative Summary |
| MTS Table 11 | `/v1/accounting/mts/mts_table_11` | Supplemental Detail on Receipts |
| MTS Table 12 | `/v1/accounting/mts/mts_table_12` | Supplemental Detail on Outlays |
| MTS Table 13 | `/v1/accounting/mts/mts_table_13` | Federal Borrowing and Debt |
| MTS Table 14 | `/v1/accounting/mts/mts_table_14` | Means of Financing: Federal |
| MTS Table 15 | `/v1/accounting/mts/mts_table_15` | Federal Trust Fund Summary |
| MTS Table 16 | `/v1/accounting/mts/mts_table_16` | Means of Financing: Off-Budget |

### Common MTS Fields

| Field | Type | Description |
|-------|------|-------------|
| `record_date` | DATE | Month end date |
| `record_fiscal_year` | STRING | Fiscal year (Oct–Sep) |
| `record_fiscal_quarter` | STRING | Fiscal quarter (1–4) |
| `classification_desc` | STRING | Line item description |
| `classification_id` | STRING | Line item code |
| `parent_id` | STRING | Parent classification ID |
| `current_month_gross_rcpt_amt` | CURRENCY | Current month gross receipts |
| `current_fytd_gross_rcpt_amt` | CURRENCY | Fiscal year-to-date gross receipts |
| `prior_fytd_gross_rcpt_amt` | CURRENCY | Prior year fiscal-year-to-date |

```python
# MTS Table 1: Summary of receipts and outlays
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_1",
    params={
        "filter": "record_fiscal_year:eq:2024",
        "sort": "record_date"
    }
)
df = pd.DataFrame(resp.json()["data"])

# MTS Table 9: Get line 120 (Total Receipts) for most recent period
resp = requests.get(
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_9",
    params={
        "filter": "line_code_nbr:eq:120",
        "sort": "-record_date",
        "page[size]": 1
    }
)
```

---

## U.S. Government Revenue Collections

**Endpoint:** `/v1/accounting/od/rev_collections`  
**Frequency:** Daily  
**Date Range:** October 2004 to present

Daily tax and non-tax revenue collections.

---

## Financial Report of the U.S. Government

**Endpoint:** (8 tables)  
**Frequency:** Annual  
**Date Range:** September 1995 to present (FY2024 latest)

Annual audited financial statements. Includes:
- Balance sheets
- Statement of net cost
- Statement of operations
- Statement of changes in net position

---

## Monthly Treasury Disbursements

**Frequency:** Monthly  
**Date Range:** October 2013 to present

Monthly federal disbursements data.

---

## Receipts by Department

**Endpoint:** `/v2/accounting/od/receipts_by_dept`  
**Frequency:** Annual  
**Date Range:** September 2015 to present

Annual breakdown of federal receipts by department.

---

## Treasury Managed Accounts

**Frequency:** Quarterly  
**Date Range:** December 2022 to present (3 data tables)

Treasury-managed trust and special funds account data.

---

## Treasury Bulletin

**Frequency:** Quarterly  
**Date Range:** March 2021 to present (13 tables)

Quarterly financial report covering government finances, public debt, savings bonds, and more.

**Endpoint prefix:** `/v1/accounting/od/treasury_bulletin_`
