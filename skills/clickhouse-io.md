---
name: clickhouse-io
description: ClickHouse-specific patterns for analytics workloads.
---

# ClickHouse Patterns

## Table Engines

### MergeTree (default)
```sql
CREATE TABLE markets_analytics (
    date Date,
    market_id String,
    volume UInt64,
    trades UInt32
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, market_id);
```

### AggregatingMergeTree (pre-aggregation)
```sql
CREATE TABLE market_stats_hourly (
    hour DateTime,
    market_id String,
    total_volume AggregateFunction(sum, UInt64),
    unique_users AggregateFunction(uniq, String)
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (hour, market_id);

-- Insert with State functions
INSERT INTO market_stats_hourly
SELECT toStartOfHour(timestamp), market_id,
       sumState(amount), uniqState(user_id)
FROM trades GROUP BY 1, 2;

-- Query with Merge functions
SELECT hour, sumMerge(total_volume), uniqMerge(unique_users)
FROM market_stats_hourly GROUP BY hour;
```

### ReplacingMergeTree (deduplication)
```sql
ENGINE = ReplacingMergeTree()
ORDER BY (user_id, event_id)
```

## Query Rules

- ALWAYS filter on ORDER BY columns first (they're indexed)
- Use ClickHouse functions: `toStartOfDay()`, `quantile()`, `uniq()`
- Use `LowCardinality(String)` for repeated strings

## Insert Rules

- NEVER insert rows one by one - ALWAYS batch insert
- Use bulk VALUES or streaming for large datasets

## Materialized Views
```sql
CREATE MATERIALIZED VIEW stats_mv TO market_stats_hourly AS
SELECT toStartOfHour(timestamp) AS hour, market_id,
       sumState(amount) AS total_volume
FROM trades GROUP BY hour, market_id;
```

## Monitoring
```sql
-- Slow queries
SELECT query, query_duration_ms FROM system.query_log
WHERE query_duration_ms > 1000 ORDER BY query_duration_ms DESC;

-- Table sizes
SELECT table, formatReadableSize(sum(bytes)) AS size
FROM system.parts WHERE active GROUP BY table;
```

## Best Practices

- Partition by time (month or day)
- ORDER BY: most filtered columns first, high cardinality first
- AVOID: `SELECT *`, `FINAL`, too many JOINs, small frequent inserts
