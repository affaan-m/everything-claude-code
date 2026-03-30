# Datasets Reference

## Overview

The HFM API provides data from four source datasets. Each dataset has a short key used in API calls.

| Key | Full Name | Source | Update Frequency |
|-----|-----------|--------|-----------------|
| `fpf` | SEC Form PF | U.S. Securities and Exchange Commission | Quarterly |
| `tff` | CFTC Traders in Financial Futures | Commodity Futures Trading Commission | Monthly |
| `scoos` | Senior Credit Officer Opinion Survey on Dealer Financing Terms | Federal Reserve Board | Quarterly |
| `ficc` | FICC Sponsored Repo Service Volumes | DTCC Fixed Income Clearing Corp | Monthly |

---

## SEC Form PF (`fpf`)

The largest and most comprehensive dataset in the HFM. Covers aggregated statistics from Qualifying Hedge Fund filings.

**Who files:** SEC-registered investment advisers with ≥$150M in private fund AUM. Large Hedge Fund Advisers (≥$1.5B in hedge fund AUM) file quarterly; others file annually.

**What is a Qualifying Hedge Fund:** Any hedge fund with net assets ≥$500M advised by a Large Hedge Fund Adviser.

**Data aggregation:** OFR aggregates, rounds, and masks data to avoid disclosure of individual filer information. Winsorization is applied to remove extreme outliers.

**Strategies tracked:**
- All Qualifying Hedge Funds (`ALLQHF`)
- Equity (`STRATEGY_EQUITY`)
- Credit (`STRATEGY_CREDIT`)
- Macro (`STRATEGY_MACRO`)
- Relative value (`STRATEGY_RELVALUE`)
- Multi-strategy (`STRATEGY_MULTI`)
- Event-driven (`STRATEGY_EVENT`)
- Fund of funds (`STRATEGY_FOF`)
- Other (`STRATEGY_OTHER`)
- Managed futures/CTA (`STRATEGY_MFCTA`)

**Mnemonic naming convention:**
```
FPF-{SCOPE}_{METRIC}_{AGGREGATION_TYPE}
```

| Scope | Meaning |
|-------|---------|
| `ALLQHF` | All Qualifying Hedge Funds |
| `STRATEGY_EQUITY` | Equity strategy funds |
| `STRATEGY_CREDIT` | Credit strategy funds |
| `STRATEGY_MACRO` | Macro strategy funds |
| etc. | |

| Metric | Meaning |
|--------|---------|
| `NAV` | Net assets value |
| `GAV` | Gross assets value |
| `GNE` | Gross notional exposure |
| `BORROWING` | Total borrowing |
| `LEVERAGERATIO` | Leverage ratio |
| `CASHRATIO` | Unencumbered cash ratio |
| `GROSSRETURN` | Quarterly gross returns |
| `NETRETURN` | Quarterly net returns |
| `COUNT` | Number of qualifying funds |
| `OPENPOSITIONS` | Open positions count |
| `CDSDOWN250BPS` | Stress test: CDS -250 bps |
| `CDSUP250BPS` | Stress test: CDS +250 bps |
| `EQUITYDOWN15PCT` | Stress test: equity -15% |
| etc. | |

| Aggregation type | Meaning |
|-----------------|---------|
| `SUM` | Sum (total dollar value) |
| `GAVWMEAN` | Gross asset-weighted average |
| `NAVWMEAN` | Net asset-weighted average |
| `P5` | 5th percentile fund |
| `P50` | Median fund |
| `P95` | 95th percentile fund |
| `PCTCHANGE` | Percent change year-over-year |
| `CHANGE` | Cumulative one-year change |
| `COUNT` | Count |

**Key series examples:**

```
FPF-ALLQHF_NAV_SUM                          All funds: total net assets
FPF-ALLQHF_GAV_SUM                          All funds: total gross assets
FPF-ALLQHF_GNE_SUM                          All funds: gross notional exposure
FPF-ALLQHF_LEVERAGERATIO_GAVWMEAN           All funds: leverage (GAV-weighted)
FPF-ALLQHF_LEVERAGERATIO_NAVWMEAN           All funds: leverage (NAV-weighted)
FPF-ALLQHF_BORROWING_SUM                    All funds: total borrowing
FPF-ALLQHF_CDSUP250BPS_P5                   Stress test: CDS +250bps (5th pct)
FPF-ALLQHF_CDSUP250BPS_P50                  Stress test: CDS +250bps (median)
FPF-ALLQHF_PARTY1_SUM                       Largest counterparty: total lending
FPF-STRATEGY_CREDIT_NAV_SUM                 Credit funds: total net assets
FPF-STRATEGY_EQUITY_LEVERAGERATIO_GAVWMEAN  Equity funds: leverage
```

**Data note:** Historical data starts Q1 2013 (2013-03-31). Masked values appear as `null`.

---

## CFTC Traders in Financial Futures (`tff`)

Select statistics from the CFTC Commitments of Traders (COT) report covering financial futures.

**What is tracked:** Net positioning of leveraged funds (hedge funds and commodity trading advisors) in financial futures markets, including equity index futures, interest rate futures, currency futures, and other financial instruments.

**Update frequency:** Monthly (derived from weekly CFTC COT releases)

**Key use cases:**
- Monitoring hedge fund positioning in futures markets
- Analyzing speculative vs. commercial positioning
- Tracking changes in financial futures open interest

---

## FRB SCOOS (`scoos`)

Senior Credit Officer Opinion Survey on Dealer Financing Terms conducted by the Federal Reserve Board.

**What it measures:** Survey responses from senior credit officers at major U.S. banks on terms and conditions of their securities financing and over-the-counter derivatives transactions. Covers topics including:
- Availability and terms of credit
- Collateral requirements and haircuts
- Maximum maturity of repos
- Changes in financing terms for hedge funds

**Update frequency:** Quarterly

**Key use cases:**
- Monitoring credit tightening/easing for hedge funds
- Tracking changes in dealer financing conditions
- Understanding repo market conditions from the dealer perspective

---

## FICC Sponsored Repo (`ficc`)

Statistics from the DTCC Fixed Income Clearing Corporation (FICC) Sponsored Repo Service public data.

**What it measures:** Volumes of sponsored repo and reverse repo transactions cleared through FICC's sponsored member program.

| Mnemonic | Description |
|----------|-------------|
| `FICC-SPONSORED_REPO_VOL` | Sponsored repo: repo volume |
| `FICC-SPONSORED_REVREPO_VOL` | Sponsored repo: reverse repo volume |

**Update frequency:** Monthly

**Key use cases:**
- Monitoring growth of the sponsored repo market
- Tracking volumes of centrally cleared repo activity
- Analyzing changes in repo market structure
