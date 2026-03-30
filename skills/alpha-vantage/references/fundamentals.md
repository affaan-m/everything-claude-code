# Fundamental Data APIs

## OVERVIEW — Company Overview

Returns key company information, valuation metrics, and financial ratios.

**Required:** `symbol`

```python
data = av_get("OVERVIEW", symbol="AAPL")

# Key fields returned:
# "Symbol", "AssetType", "Name", "Description", "Exchange", "Currency"
# "Country", "Sector", "Industry", "Address"
# "MarketCapitalization", "EBITDA", "PERatio", "PEGRatio"
# "BookValue", "DividendPerShare", "DividendYield", "EPS"
# "RevenuePerShareTTM", "ProfitMargin", "OperatingMarginTTM"
# "ReturnOnAssetsTTM", "ReturnOnEquityTTM"
# "RevenueTTM", "GrossProfitTTM", "DilutedEPSTTM"
# "QuarterlyEarningsGrowthYOY", "QuarterlyRevenueGrowthYOY"
# "AnalystTargetPrice", "AnalystRatingStrongBuy", "AnalystRatingBuy",
# "AnalystRatingHold", "AnalystRatingSell", "AnalystRatingStrongSell"
# "TrailingPE", "ForwardPE", "PriceToSalesRatioTTM"
# "PriceToBookRatio", "EVToRevenue", "EVToEBITDA"
# "Beta", "52WeekHigh", "52WeekLow", "50DayMovingAverage", "200DayMovingAverage"
# "SharesOutstanding", "DividendDate", "ExDividendDate", "FiscalYearEnd"

print(data["MarketCapitalization"])  # "2850000000000"
print(data["PERatio"])               # "29.50"
print(data["Sector"])                # "TECHNOLOGY"
```

## ETF_PROFILE — ETF Profile & Holdings

**Required:** `symbol`

```python
data = av_get("ETF_PROFILE", symbol="QQQ")
# Fields: "net_assets", "nav", "inception_date", "description",
#         "asset_allocation" (stocks/bonds/cash/etc.)
#         "sectors" (list of sector weights)
#         "holdings" (top holdings list)
for h in data["holdings"][:5]:
    print(h["symbol"], h["description"], h["weight"])
```

## DIVIDENDS — Corporate Dividend History

**Required:** `symbol`

```python
data = av_get("DIVIDENDS", symbol="IBM")
divs = data["data"]
for d in divs:
    print(d["ex_dividend_date"], d["amount"])
# Fields per record: "ex_dividend_date", "declaration_date",
#                    "record_date", "payment_date", "amount"
```

## SPLITS — Stock Split History

**Required:** `symbol`

```python
data = av_get("SPLITS", symbol="AAPL")
splits = data["data"]
for s in splits:
    print(s["effective_date"], s["split_factor"])
# Fields: "effective_date", "split_factor" (e.g., "4/1" for 4-for-1 split)
```

## INCOME_STATEMENT — Income Statement

Returns annual and quarterly income statements.

**Required:** `symbol`

```python
data = av_get("INCOME_STATEMENT", symbol="IBM")
annual = data["annualReports"]    # list, most recent first
quarterly = data["quarterlyReports"]  # list, most recent first

yr = annual[0]  # Most recent fiscal year
print(yr["fiscalDateEnding"])       # "2023-12-31"
print(yr["totalRevenue"])           # "61860000000"
print(yr["grossProfit"])            # "32688000000"
print(yr["operatingIncome"])        # "..."
print(yr["netIncome"])              # "..."
print(yr["ebitda"])                 # "..."
# Other keys: "reportedCurrency", "costOfRevenue", "costofGoodsAndServicesSold",
#   "sellingGeneralAndAdministrative", "researchAndDevelopment",
#   "operatingExpenses", "investmentIncomeNet", "netInterestIncome",
#   "interestIncome", "interestExpense", "nonInterestIncome",
#   "otherNonOperatingIncome", "depreciation",
#   "depreciationAndAmortization", "incomeBeforeTax",
#   "incomeTaxExpense", "interestAndDebtExpense",
#   "netIncomeFromContinuingOperations", "comprehensiveIncomeNetOfTax",
#   "ebit", "dilutedEPS", "basicEPS"
```

## BALANCE_SHEET — Balance Sheet

**Required:** `symbol`

```python
data = av_get("BALANCE_SHEET", symbol="IBM")
annual = data["annualReports"]

yr = annual[0]
print(yr["totalAssets"])           # "..."
print(yr["totalLiabilities"])      # "..."
print(yr["totalShareholderEquity"]) # "..."
# Other keys: "reportedCurrency", "fiscalDateEnding",
#   "cashAndCashEquivalentsAtCarryingValue", "cashAndShortTermInvestments",
#   "inventory", "currentNetReceivables", "totalCurrentAssets",
#   "propertyPlantEquipmentNet", "intangibleAssets",
#   "intangibleAssetsExcludingGoodwill", "goodwill", "investments",
#   "longTermInvestments", "shortTermInvestments", "otherCurrentAssets",
#   "otherNonCurrrentAssets", "currentAccountsPayable", "deferredRevenue",
#   "currentDebt", "shortTermDebt", "totalCurrentLiabilities",
#   "capitalLeaseObligations", "longTermDebt", "currentLongTermDebt",
#   "longTermDebtNoncurrent", "shortLongTermDebtTotal",
#   "otherCurrentLiabilities", "otherNonCurrentLiabilities",
#   "totalNonCurrentLiabilities", "retainedEarnings",
#   "additionalPaidInCapital", "commonStockSharesOutstanding"
```

## CASH_FLOW — Cash Flow Statement

**Required:** `symbol`

```python
data = av_get("CASH_FLOW", symbol="IBM")
annual = data["annualReports"]

yr = annual[0]
print(yr["operatingCashflow"])              # "..."
print(yr["capitalExpenditures"])            # "..."
print(yr["cashflowFromInvestment"])         # "..."
print(yr["cashflowFromFinancing"])          # "..."
# Other keys: "reportedCurrency", "fiscalDateEnding",
#   "paymentsForRepurchaseOfCommonStock", "dividendPayout",
#   "dividendPayoutCommonStock", "dividendPayoutPreferredStock",
#   "proceedsFromIssuanceOfCommonStock", "changeInOperatingLiabilities",
#   "changeInOperatingAssets", "depreciationDepletionAndAmortization",
#   "capitalExpenditures", "changeInReceivables", "changeInInventory",
#   "profitLoss", "netIncomeFromContinuingOperations"
```

## SHARES_OUTSTANDING — Shares Outstanding History

**Required:** `symbol`

```python
data = av_get("SHARES_OUTSTANDING", symbol="AAPL")
shares = data["data"]
for s in shares[:5]:
    print(s["date"], s["reportedShares"])
```

## EARNINGS — Earnings History (EPS)

Returns annual and quarterly EPS + surprise data.

**Required:** `symbol`

```python
data = av_get("EARNINGS", symbol="IBM")
annual = data["annualEarnings"]
quarterly = data["quarterlyEarnings"]

# Annual: "fiscalDateEnding", "reportedEPS"
# Quarterly: "fiscalDateEnding", "reportedDate", "reportedEPS",
#            "estimatedEPS", "surprise", "surprisePercentage"
q = quarterly[0]
print(q["reportedEPS"], q["estimatedEPS"], q["surprisePercentage"])
```

## EARNINGS_CALENDAR — Upcoming Earnings Dates

Returns earnings release schedule for the next 3-12 months.

**Optional:** `symbol` (if omitted, returns all companies), `horizon` (`3month`, `6month`, `12month`)

```python
# Returns CSV format - use requests directly
import requests, csv, io, os
resp = requests.get(
    "https://www.alphavantage.co/query",
    params={"function": "EARNINGS_CALENDAR", "symbol": "IBM", "apikey": os.environ["ALPHAVANTAGE_API_KEY"]}
)
reader = csv.DictReader(io.StringIO(resp.text))
for row in reader:
    print(row["symbol"], row["name"], row["reportDate"], row["estimate"])
```

## LISTING_STATUS — Listed/Delisted Tickers

**Optional:** `date` (format `YYYY-MM-DD`), `state` (`active` or `delisted`)

```python
# Returns CSV
resp = requests.get(
    "https://www.alphavantage.co/query",
    params={"function": "LISTING_STATUS", "state": "active", "apikey": API_KEY}
)
reader = csv.DictReader(io.StringIO(resp.text))
# Fields: "symbol", "name", "exchange", "assetType", "ipoDate",
#         "delistingDate", "status"
```

## IPO_CALENDAR — Upcoming IPOs

```python
# Returns CSV
resp = requests.get(
    "https://www.alphavantage.co/query",
    params={"function": "IPO_CALENDAR", "apikey": API_KEY}
)
reader = csv.DictReader(io.StringIO(resp.text))
for row in reader:
    print(row["symbol"], row["name"], row["ipoDate"], row["priceRangeLow"], row["priceRangeHigh"])
```
