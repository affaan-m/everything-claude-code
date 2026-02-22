---
description: Validate a 5-14 day KO-product (Knock-Out Zertifikat / Optionsschein) trade idea across 6 categories — macro, fundamentals, options/volatility, and technical pattern — using a parallel agent team. Outputs entry zone, stop, KO level, TP targets, probability estimate, and final go/no-go verdict.
---

# /trade-validate — Trading Idea Validation

Runs a full 6-category trade validation using a team of 4 specialist agents working in parallel, consolidated by a synthesizer agent into one structured report.

## Usage

```
/trade-validate <SYMBOL> <Long|Short> "<PATTERN_DESCRIPTION>" [KO_ATR_MULTIPLIER] [CHART_IMAGE_PATH]
```

### Arguments

| Argument | Required | Default | Description |
|---|---|---|---|
| `SYMBOL` | Yes | — | Ticker symbol (NVDA, SPY, EUR/USD, BTC, BMW.XETRA) |
| `Long\|Short` | Yes | — | Trade direction |
| `"PATTERN_DESCRIPTION"` | Yes | — | Chart pattern in quotes |
| `KO_ATR_MULTIPLIER` | No | 2.5 | ATR multiplier for KO barrier distance (2.0=aggressive, 2.5=standard, 3.0=conservative) |
| `CHART_IMAGE_PATH` | No | — | Full path to a chart screenshot (PNG/JPG) for visual analysis |

## Examples

```bash
# Basic — no API keys, no chart image (free web data)
/trade-validate NVDA Long "Bull flag on 4H above $950 resistance"

# With KO multiplier
/trade-validate SPY Short "H&S neckline break on daily, target $500" 3.0

# With chart screenshot for visual pattern confirmation
/trade-validate AAPL Long "Cup and handle on daily, handle at $210" 2.5 /Users/me/charts/aapl_daily.png

# German stock (European market)
/trade-validate BMW.XETRA Long "Breakout from ascending triangle on 4H" 2.5

# Index ETF Short
/trade-validate QQQ Short "Bearish engulfing on daily at EMA200 resistance" 3.0
```

## What Happens

1. **Orchestrator** parses your input, checks for API keys, fetches current price
2. **4 agents run in parallel** (simultaneously, not sequentially):
   - `macro-analyst` — VIX, DXY, US 10Y yield, economic calendar, risk regime
   - `fundamental-analyst` — earnings, guidance, analyst ratings, insider activity, short interest
   - `options-analyst` — IV rank, put/call skew, GEX, dealer positioning, KO barrier calculation
   - `technical-analyst` — pattern validation, volume, MTF alignment, RSI/MACD, entry parameters, optional chart visual
3. **Trade synthesizer** combines all 4 reports → conflict resolution → probability estimate → final verdict

**Total time: approximately 2–3 minutes**

## Output Format

```
╔══════════════════════════════════════════════════════════╗
║  TRADE VALIDATION REPORT                                  ║
║  Symbol: NVDA  Direction: LONG   Date: 2026-02-22         ║
╚══════════════════════════════════════════════════════════╝

[1] MACRO ENVIRONMENT          SUPPORTS ✓ / NEUTRAL ~ / BLOCKS ✗
[2] ASSET FUNDAMENTALS         SUPPORTS ✓ / NEUTRAL ~ / BLOCKS ✗
[3] OPTIONS & VOLATILITY       FAVORABLE ✓ / NEUTRAL ~ / UNFAVORABLE ✗
[4] TECHNICAL PATTERN          CONFIRMED ✓ / PARTIAL ~ / FAILED ✗
[5] ENTRY PARAMETERS           Entry / Stop / KO Level / TP1 / TP2 / R:R
[6] FINAL VERDICT              TAKE TRADE / WAIT / DO NOT TRADE + probability %
    SCORECARD                  4-row verdict summary
    EXECUTION CHECKLIST        Step-by-step pre-trade checklist
```

## Optional API Setup (Recommended)

Without API keys the system uses free public web data (Yahoo Finance, Finviz, Barchart). Adding API keys significantly improves data quality — especially for options chains, technical indicators, and historical OHLCV for ATR calculation.

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, or ~/.bash_profile):
export EODHD_API_KEY="your_key_here"     # https://eodhistoricaldata.com (free tier: 20 calls/day)
export POLYGON_API_KEY="your_key_here"   # https://polygon.io (free tier: delayed data)
```

Data tier priority: EODHD → Polygon.io → Free web (Yahoo Finance, Finviz, Barchart)

## Chart Screenshot (Optional)

Providing a TradingView chart screenshot enables the `technical-analyst` agent to visually confirm your pattern:

- Reads the chart image directly (PNG, JPG supported)
- Checks if the visible chart matches your described pattern
- Extracts visible support/resistance levels, indicator values, volume behavior
- Adds a `[CHART VISUAL ANALYSIS]` section to the technical report
- Pattern visual confirmation adds +5% to probability estimate; conflict deducts -5%

```bash
# Export chart from TradingView (right-click → Save image as...)
/trade-validate NVDA Long "Bull flag on 4H" 2.5 /path/to/exported_chart.png
```

## KO Multiplier Guide

| Multiplier | Leverage | Safety Margin | Use When |
|---|---|---|---|
| 2.0x | High | Tight | Very high conviction, low volatility (VIX < 15) |
| 2.5x | Standard | Balanced | Default for most setups |
| 3.0x | Lower | Wide | Elevated volatility (VIX 20–25) or moderate conviction |
| 3.5x | Low | Very wide | High volatility (VIX > 25) or earnings within window |

## Important Disclaimers

- **Not financial advice** — this is analytical assistance to support your own decision-making
- **Always verify KO levels** with your broker's product screener before placing orders (broker: COMDIRECT, Flatex, ING-DiBa, Onvista, etc.)
- **KO products can expire worthless** if the barrier is touched — apply strict position sizing (max 2–3% portfolio risk per trade)
- **Real-time data quality** depends on API keys configured — free tier data may be delayed or incomplete
- **5–14 day horizon** — this system is optimized for short-term momentum trades, not long-term investments

## Related Agents

This command invokes `trading-orchestrator`, which coordinates:
- `macro-analyst` (haiku)
- `fundamental-analyst` (sonnet)
- `options-analyst` (sonnet)
- `technical-analyst` (sonnet)
- `trade-synthesizer` (opus)

Domain knowledge: `skills/trading-analysis/SKILL.md`
