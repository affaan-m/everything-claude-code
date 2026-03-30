# Alpha Intelligence™ APIs

## NEWS_SENTIMENT — Market News & Sentiment

Returns live/historical news articles with sentiment scores for tickers, sectors, and topics.

**Optional:**
- `tickers` — comma-separated ticker symbols (e.g., `IBM,AAPL`)
- `topics` — comma-separated topics: `blockchain`, `earnings`, `ipo`, `mergers_and_acquisitions`, `financial_markets`, `economy_fiscal`, `economy_monetary`, `economy_macro`, `energy_transportation`, `finance`, `life_sciences`, `manufacturing`, `real_estate`, `retail_wholesale`, `technology`
- `time_from` / `time_to` — format `YYYYMMDDTHHMM`
- `sort` — `LATEST`, `EARLIEST`, or `RELEVANCE`
- `limit` — max articles returned (default 50, max 1000)

```python
# Get news for specific ticker
data = av_get("NEWS_SENTIMENT", tickers="AAPL", sort="LATEST", limit=10)
articles = data["feed"]

for a in articles[:3]:
    print(a["title"])
    print(a["url"])
    print(a["time_published"])
    print(a["overall_sentiment_label"])   # "Bullish", "Bearish", "Neutral", etc.
    print(a["overall_sentiment_score"])   # -1.0 to 1.0
    for ts in a["ticker_sentiment"]:
        if ts["ticker"] == "AAPL":
            print(f"  AAPL sentiment: {ts['ticker_sentiment_label']} ({ts['ticker_sentiment_score']})")
            print(f"  Relevance: {ts['relevance_score']}")

# Article fields: "title", "url", "time_published", "authors", "summary",
#                 "source", "source_domain", "topics", "overall_sentiment_score",
#                 "overall_sentiment_label", "ticker_sentiment"
# Sentiment labels: "Bearish", "Somewhat-Bearish", "Neutral", "Somewhat-Bullish", "Bullish"

# Get news by topic
data = av_get("NEWS_SENTIMENT", topics="earnings,technology", time_from="20240101T0000", limit=50)
```

## EARNINGS_CALL_TRANSCRIPT — Earnings Call Transcript

Returns full earnings call transcripts (requires premium).

**Required:** `symbol`, `quarter` (format `YYYYQN`, e.g., `2023Q4`)

```python
data = av_get("EARNINGS_CALL_TRANSCRIPT", symbol="AAPL", quarter="2023Q4")
transcript = data["transcript"]

for segment in transcript[:5]:
    print(f"[{segment['speaker']}]: {segment['content'][:200]}")
# Fields: "symbol", "quarter", "transcript" (list of {speaker, title, content})
```

## TOP_GAINERS_LOSERS — Top Market Movers

Returns top 20 gainers, losers, and most actively traded US stocks for the current/most recent trading day.

```python
data = av_get("TOP_GAINERS_LOSERS")

for g in data["top_gainers"][:5]:
    print(g["ticker"], g["price"], g["change_amount"], g["change_percentage"], g["volume"])

for l in data["top_losers"][:5]:
    print(l["ticker"], l["price"], l["change_amount"], l["change_percentage"])

# Fields: "ticker", "price", "change_amount", "change_percentage", "volume"
# Also: data["most_actively_traded"]
```

## INSIDER_TRANSACTIONS — Insider Trading Data

Returns insider transactions (Form 4) for a given company (requires premium).

**Required:** `symbol`

```python
data = av_get("INSIDER_TRANSACTIONS", symbol="AAPL")
transactions = data["data"]

for t in transactions[:5]:
    print(
        t["transaction_date"],
        t["executive"],         # insider name
        t["executive_title"],   # e.g., "CEO"
        t["action"],            # "Buy" or "Sell"
        t["shares"],
        t["share_price"],
        t["total_value"]
    )
```

## ANALYTICS_FIXED_WINDOW — Portfolio Analytics (Fixed Window)

Returns mean return, variance, covariance, correlation, and alpha/beta for a set of tickers over a fixed historical window.

**Required:**
- `SYMBOLS` — comma-separated tickers (e.g., `AAPL,MSFT,IBM`)
- `RANGE` — date range format: `2year`, `6month`, `30day`, or `YYYY-MM-DD&YYYY-MM-DD`
- `INTERVAL` — `DAILY`, `WEEKLY`, or `MONTHLY`
- `OHLC` — `close`, `open`, `high`, or `low`
- `CALCULATIONS` — comma-separated: `MEAN`, `STDDEV`, `MAX_DRAWDOWN`, `CORRELATION`, `COVARIANCE`, `VARIANCE`, `CUMULATIVE_RETURN`, `MIN`, `MAX`, `MEDIAN`, `HISTOGRAM`

```python
data = av_get(
    "ANALYTICS_FIXED_WINDOW",
    SYMBOLS="AAPL,MSFT,IBM",
    RANGE="1year",
    INTERVAL="DAILY",
    OHLC="close",
    CALCULATIONS="MEAN,STDDEV,CORRELATION,MAX_DRAWDOWN"
)
payload = data["payload"]
print(payload["MEAN"])        # {"AAPL": 0.0012, "MSFT": 0.0009, ...}
print(payload["STDDEV"])
print(payload["CORRELATION"])  # correlation matrix
print(payload["MAX_DRAWDOWN"])
```

## ANALYTICS_SLIDING_WINDOW — Portfolio Analytics (Sliding Window)

Same as fixed window but with rolling calculations over time.

**Required:** Same as fixed window, plus:
- `WINDOW_SIZE` — number of periods (e.g., `20` for 20-day rolling window)

```python
data = av_get(
    "ANALYTICS_SLIDING_WINDOW",
    SYMBOLS="AAPL,MSFT",
    RANGE="1year",
    INTERVAL="DAILY",
    OHLC="close",
    CALCULATIONS="MEAN,STDDEV",
    WINDOW_SIZE=20
)
# Returns time series of rolling calculations
```
