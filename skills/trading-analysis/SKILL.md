# Trading Analysis — KO-Product Skill

Domain knowledge and reference patterns for short-to-medium term KO-Zertifikate (Knock-Out certificates) and Optionsscheine validation for 5–14 day trades.

## When to Activate

- Validating a 5–14 day trade idea with KO products or Optionsscheine
- Calculating appropriate KO barrier level distance
- Assessing implied volatility (IV) environment for options timing
- Understanding gamma exposure and dealer positioning
- Interpreting multi-timeframe technical setups
- Deciding position sizing based on signal strength across all analysis categories

---

## Core Concepts

### KO-Zertifikate (Knock-Out Certificates)

KO products are leveraged instruments common in German/European retail markets (available via COMDIRECT, ING-DiBa, Flatex, Onvista, Lang & Schwarz). Key mechanics:

- Track an underlying asset with a **fixed leverage ratio**
- Have a **KNOCK-OUT BARRIER**: if the underlying hits this price, the product expires immediately — often worthless or with only minimal residual value
- Available for **Long (KO-Bull)** and **Short (KO-Bear)** directions
- **No time decay** in the traditional options sense — but subject to **financing costs** (daily funding spread charged/credited)
- Leverage = Underlying Price / (Underlying Price − KO Level) for Long products
- Risk: unlimited loss relative to the KO product value (product expires to ~0 if barrier is hit)

---

### KO Level Selection Framework

The KO barrier must be far enough from the current price to survive normal volatility during the 5–14 day trade window.

```
For LONG trades (KO-Bull):
  KO = Entry Price - (ATR14 × Multiplier)

For SHORT trades (KO-Bear):
  KO = Entry Price + (ATR14 × Multiplier)

Multiplier guidelines:
  2.0x ATR  — Aggressive (high leverage, low safety margin)
  2.5x ATR  — Standard   (balanced leverage and safety)
  3.0x ATR  — Conservative (lower leverage, higher safety)
  3.5x ATR  — Very conservative (use when VIX > 25 or high event risk)
```

**Additional KO placement rules:**
1. KO must be BELOW (Long) or ABOVE (Short) the nearest major support/resistance cluster
2. KO must NOT sit at a high-OI strike (gamma wall) — dealers hedge to that level and can push price there
3. Account for overnight gap risk: add 0.5× ATR buffer for equities held overnight
4. For high-volatility environments (VIX > 25): increase multiplier by 0.5x
5. Never place KO at a round number ($100, $500, $1000) — common intraday manipulation targets

---

### IV Environment and KO Timing

```
IV Rank Interpretation (0–100 scale vs. 52-week IV range):
  0–25:   Low IV  — KO premium is low → FAVORABLE time to buy KO/options
  25–50:  Moderate IV — acceptable conditions → NEUTRAL
  50–75:  Elevated IV — higher KO premiums → consider reducing leverage or waiting
  75–100: High IV — expensive premiums, vol crush risk after event → UNFAVORABLE

IV Trend:
  Expanding IV + LONG KO:   premium rises each day, adds urgency to be right quickly
  Contracting IV + LONG KO: premium stable, allows patience for setup to develop
  Expanding IV before event: wait for IV compression post-event before entering
```

---

### Gamma Exposure (GEX) Framework

GEX measures net dealer positioning across the options market. It predicts whether market makers will amplify or dampen price moves through their delta hedging.

```
NEGATIVE GEX (dealers are net SHORT gamma):
  → Dealers AMPLIFY moves to hedge (buy when market rises, sell when it falls)
  → Breakouts more likely to follow through and extend
  → Favorable for momentum KO trades
  → Common conditions: VIX spikes, post-earnings, surprise macro events

POSITIVE GEX (dealers are net LONG gamma):
  → Dealers DAMPEN moves (buy dips, sell rips to hedge)
  → Choppy, mean-reverting price action
  → Unfavorable for momentum KO trades
  → Common conditions: pre-earnings calm, range-bound markets, near max pain
```

**GEX Levels to monitor:**
- **Gamma Wall (Call Wall):** Large call OI cluster → acts as resistance ceiling
- **Put Wall:** Large put OI cluster → acts as support floor
- **Max Pain:** Price at which most options expire worthless → gravitational pull near expiry
- If your KO level sits at or near a gamma wall, it faces concentrated dealer hedging pressure

---

### Multi-Timeframe Alignment (MTF)

For a 5–14 day trade on a 4H entry pattern, use this alignment framework:

```
STRONG ALIGNMENT (all timeframes agree — highest conviction):
  Weekly:  Trending in trade direction (up for Long, down for Short)
  Daily:   Trending in trade direction
  4H:      Pattern forming or confirmed

MODERATE ALIGNMENT (acceptable):
  Weekly:  Neutral / sideways (no major opposing trend)
  Daily:   Trending in trade direction
  4H:      Pattern confirmed

WEAK / MIXED (caution — reduce size or wait):
  Weekly:  Opposing the trade direction  OR
  Daily:   Opposing the trade direction
  → Always note which timeframe is misaligned and why it may be acceptable
```

---

### Signal Strength → Position Sizing Matrix

| Categories Supporting | Confidence | Position Size |
|---|---|---|
| 4 / 4 categories | Very High | Full size (per risk rules) |
| 3 / 4 categories | High | Full size |
| 2 / 4 categories | Moderate | Half size |
| 1 / 4 categories | Low | Skip or paper trade only |
| 0 / 4 categories | None | Do not trade |
| Any BLOCK (HIGH confidence + binary event) | Veto | Do not trade |

---

### Probability Base Rate and Modifiers

```
Base rate for directional 5–14d short-term trades: 50%

Positive modifiers:
  +15%  Technical CONFIRMED + MTF STRONGLY ALIGNED
  +10%  Macro SUPPORTS
  +5%   Fundamentals SUPPORT (earnings beat, upgrades, insider buying)
  +5%   Volatility FAVORABLE (IV Rank < 25)
  +5%   R:R ratio ≥ 2.5:1
  +5%   Negative GEX (momentum amplifying)
  +5%   Chart image visually confirms pattern

Negative modifiers:
  -15%  Macro BLOCKS (Risk-off, major event imminent)
  -20%  Technical FAILED or UNCONFIRMED
  -10%  Earnings within trade window (binary event risk)
  -5%   Volatility UNFAVORABLE (IV Rank > 75)
  -5%   Chart image CONFLICTS with described pattern

Cap: minimum 25%, maximum 85% (never claim certainty in either direction)
```

---

## Data Sources — Tiered Reference

### Data Tier Priority

```
Tier 1: EODHD API     (set env var EODHD_API_KEY)    → most complete, structured JSON
Tier 2: Polygon.io    (set env var POLYGON_API_KEY)   → real-time, options data
Tier 3: Free web      (no keys needed)               → WebFetch + WebSearch fallback
```

### Setup (Optional but Recommended)

```bash
# Add to your shell profile for persistent configuration:
export EODHD_API_KEY="your_eodhd_key_here"    # Get at: https://eodhistoricaldata.com
export POLYGON_API_KEY="your_polygon_key_here"  # Get at: https://polygon.io

# Free tier limits:
# EODHD: 20 API calls/day on free plan
# Polygon: unlimited delayed data on free plan; real-time requires paid plan
```

### Data Source Table by Data Point

| Data Point | EODHD (Tier 1) | Polygon.io (Tier 2) | Free Fallback (Tier 3) |
|---|---|---|---|
| Current price | `/api/real-time/{SYM}.US` | `/v2/snapshot/locale/us/markets/stocks/tickers/{SYM}` | Yahoo Finance |
| OHLCV bars (ATR) | `/api/eod/{SYM}.US` | `/v2/aggs/ticker/{SYM}/range/1/day/{from}/{to}` | Finviz quote |
| EMA200, SMA50 | `/api/technicals/{SYM}.US?function=ema&period=200` | `/v1/indicators/ema/{SYM}?window=200` | Finviz quote |
| RSI(14) | `/api/technicals/{SYM}.US?function=rsi&period=14` | `/v1/indicators/rsi/{SYM}?window=14` | Finviz quote |
| MACD | `/api/technicals/{SYM}.US?function=macd` | `/v1/indicators/macd/{SYM}` | Finviz quote |
| IV Rank / Skew | `/api/options/{SYM}.US` (compute from chain) | `/v3/snapshot/options/{SYM}` | Barchart volatility-analysis |
| Options OI / GEX | `/api/options/{SYM}.US` | `/v3/snapshot/options/{SYM}` | Unusual Whales (WebSearch) |
| Earnings / EPS | `/api/fundamentals/{SYM}.US?filter=Highlights` | N/A | Yahoo Finance financials |
| Analyst ratings | `/api/fundamentals/{SYM}.US?filter=AnalystRatings` | N/A | Finviz quote |
| Insider transactions | `/api/fundamentals/{SYM}.US?filter=InsiderTransactions` | N/A | OpenInsider.com |
| Short interest | `/api/fundamentals/{SYM}.US?filter=SharesStats` | N/A | Finviz quote |
| Economic calendar | `/api/economic-events?country=US` | N/A | Investing.com |
| News | `/api/news?s={SYM}&limit=10` | `/v2/reference/news?ticker={SYM}` | WebSearch |
| VIX | `/api/real-time/%5EVIX.INDX` | `/v2/snapshot/locale/us/markets/stocks/tickers/VXX` | Yahoo Finance `%5EVIX` |

### Free Site URLs

| Site | URL Pattern | Data Available |
|---|---|---|
| Yahoo Finance | `finance.yahoo.com/quote/{SYMBOL}/` | Price, volume, basic fundamentals |
| Yahoo Finance Financials | `finance.yahoo.com/quote/{SYMBOL}/financials/` | Income statement, EPS history |
| Finviz | `finviz.com/quote.ashx?t={SYMBOL}` | EMA200, SMA50, RSI, MACD, volume, short interest |
| Barchart Volatility | `barchart.com/stocks/quotes/{SYMBOL}/volatility-analysis` | IV Rank, IV Percentile, IV history |
| Barchart Options | `barchart.com/stocks/quotes/{SYMBOL}/put-call-ratios` | Put/Call ratio, skew |
| OpenInsider | `openinsider.com/search?q={SYMBOL}` | Insider buy/sell transactions |
| Investing.com Calendar | `investing.com/economic-calendar/` | High-impact event schedule |
| Unusual Whales | `unusualwhales.com/symbol/{SYMBOL}` | GEX, dark pool flows (partial free access) |

---

## Common Chart Patterns — Validity Reference

| Pattern | Volume Confirmation Required | Fakeout Risk | Min Trade Horizon |
|---|---|---|---|
| Bull Flag | Drop on flag, surge on breakout | Medium | 5–10 days |
| Bear Flag | Drop on flag, surge on breakdown | Medium | 5–10 days |
| Cup & Handle | Light volume on handle, heavy on break | Low | 7–14 days |
| Head & Shoulders | Left shoulder > Head volume ideally | Medium | 7–14 days |
| Double Top / Bottom | Second touch on lower volume | High | 5–10 days |
| Ascending / Descending Triangle | Contraction then expansion at apex | High | 5–10 days |
| Wedge Breakout | Volume contraction into apex | High | 5–7 days |
| Orderblock Retest | Volume on first impulse, light on retest | Low–Medium | 5–7 days |

---

## Chart Screenshot Analysis — Usage Guide

Claude Code can read chart images directly (PNG, JPG formats). The technical-analyst agent uses this for independent visual pattern confirmation.

**How to provide a chart:**

```bash
# Option A: Path as 5th argument to /trade-validate
/trade-validate NVDA Long "Bull flag on 4H" 2.5 /Users/me/charts/nvda_4h.png

# Option B: Attach image in Claude Code before typing /trade-validate
# (drag-and-drop or paste into Claude Code input)

# Option C: No chart — all data from APIs and web sources only
```

**What visual analysis covers:**
1. Pattern identification (does chart match described pattern?)
2. Price levels visible on chart (support, resistance, trend lines)
3. Timeframe verification (does chart match stated timeframe?)
4. Volume bars (volume behavior at key levels)
5. Visible indicator values (RSI, MACD, Bollinger Bands if shown)
6. Candlestick context (last 2–3 candles for rejection/continuation signal)
7. Pattern quality assessment from visual (clean vs. irregular)

**Important:** Visual analysis supplements — it does not replace — data-driven analysis. The pattern description text is the primary input; the chart is the confirmation layer.

---

## Risk Rules — Non-Negotiable

1. **R:R minimum 1.5:1** — never recommend a trade with R:R below 1.5
2. **Stop at minimum 1× ATR from entry** — tighter stops get hit by noise
3. **Earnings in trade window** → mandatory 50% position size reduction minimum
4. **VIX > 25** → increase KO multiplier by 0.5x (more volatile market, wider barriers needed)
5. **IV Rank > 75** → delay KO entry until IV compresses below 60 (avoid vol crush)
6. **KO at round numbers** → forbidden (manipulation target)
7. **KO at gamma wall** → flag as HIGH RISK and recommend verifying with broker tools
8. **Maximum hold time** → 14 days for any 5–14 day trade regardless of P&L
9. **Position sizing** → never risk more than 2–3% of total portfolio on any single KO trade
10. **Always set a stop alert** at the invalidation level — KO products can expire overnight
