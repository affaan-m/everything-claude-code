---
name: data-engineering-patterns
description: Data engineering patterns for Python data pipelines, ETL/ELT workflows, data validation, and processing with pandas, polars, dbt, and Apache tools.
origin: ECC
---

# Data Engineering Patterns

Patterns for building reliable, scalable data pipelines.

## When to Activate

- Building ETL/ELT data pipelines
- Working with pandas, polars, or PySpark
- Implementing data validation and quality checks
- Designing data warehouse models with dbt
- Processing batch or streaming data

## Core Principles

- **Idempotency**: Running a pipeline twice produces the same result
- **Schema validation**: Validate data at boundaries
- **Data contracts**: Explicit agreements between producers and consumers
- **Incremental processing**: Process only what changed

## Pipeline Patterns

### ELT Architecture

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class PipelineConfig:
    source: str
    destination: str
    batch_size: int = 10_000

async def extract(config: PipelineConfig, since: datetime) -> list[dict]:
    """Extract records modified since last run."""
    async with create_client(config.source) as client:
        return await client.fetch(modified_after=since, limit=config.batch_size)

def load(records: list[dict], config: PipelineConfig) -> int:
    """Load raw records into staging table."""
    with get_connection(config.destination) as conn:
        return conn.copy_records_to_table('staging_events', records=records)

def transform(conn, batch_date: str) -> None:
    """Transform staging data into analytics tables."""
    conn.execute("""
        INSERT INTO analytics.daily_events
        SELECT date_trunc('day', event_time) as event_date,
               event_type,
               count(*) as event_count
        FROM staging_events
        WHERE batch_date = %(batch_date)s
        GROUP BY 1, 2
        ON CONFLICT (event_date, event_type)
        DO UPDATE SET event_count = EXCLUDED.event_count
    """, {'batch_date': batch_date})
```

### Incremental Processing with Watermarks

```python
@dataclass(frozen=True)
class Watermark:
    table: str
    column: str
    value: datetime

def get_watermark(conn, table: str) -> Watermark:
    result = conn.execute(
        "SELECT max(updated_at) FROM %s" % table
    ).fetchone()
    return Watermark(table=table, column='updated_at', value=result[0])

def incremental_sync(source_conn, dest_conn, table: str) -> int:
    watermark = get_watermark(dest_conn, table)
    new_records = source_conn.execute(
        f"SELECT * FROM {table} WHERE {watermark.column} > %s",
        (watermark.value,)
    ).fetchall()
    return load_records(dest_conn, table, new_records)
```

## Data Validation

### Pandera Schema Validation

```python
import pandera as pa
from pandera.typing import Series, DataFrame

class OrderSchema(pa.DataFrameModel):
    order_id: Series[str] = pa.Field(unique=True, nullable=False)
    customer_id: Series[str] = pa.Field(nullable=False)
    amount: Series[float] = pa.Field(ge=0, le=1_000_000)
    status: Series[str] = pa.Field(isin=['pending', 'confirmed', 'shipped', 'delivered'])
    created_at: Series[pa.DateTime] = pa.Field(nullable=False)

    @pa.check("amount")
    def amount_not_zero_for_confirmed(cls, series: Series[float]) -> Series[bool]:
        return series > 0

@pa.check_types
def process_orders(df: DataFrame[OrderSchema]) -> DataFrame[OrderSchema]:
    return df.assign(amount=df['amount'].round(2))
```

### Pydantic for Record Validation

```python
from pydantic import BaseModel, field_validator
from datetime import datetime

class EventRecord(BaseModel):
    event_id: str
    user_id: str
    event_type: str
    timestamp: datetime
    properties: dict

    @field_validator('event_type')
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        allowed = {'page_view', 'click', 'purchase', 'signup'}
        if v not in allowed:
            raise ValueError(f'Invalid event type: {v}')
        return v

def validate_batch(records: list[dict]) -> tuple[list[EventRecord], list[dict]]:
    valid, invalid = [], []
    for record in records:
        try:
            valid.append(EventRecord.model_validate(record))
        except Exception as e:
            invalid.append({**record, '_error': str(e)})
    return valid, invalid
```

## pandas Best Practices

### Vectorized Operations

```python
import pandas as pd
import numpy as np

# Good: Vectorized
df['revenue'] = df['quantity'] * df['price']
df['category'] = np.where(df['revenue'] > 1000, 'high', 'low')

# Bad: iterrows (100x slower)
# for idx, row in df.iterrows():
#     df.at[idx, 'revenue'] = row['quantity'] * row['price']
```

### Method Chaining

```python
result = (
    df
    .query('status == "active"')
    .assign(
        revenue=lambda x: x['quantity'] * x['price'],
        month=lambda x: x['date'].dt.to_period('M'),
    )
    .groupby('month')
    .agg(
        total_revenue=('revenue', 'sum'),
        order_count=('order_id', 'nunique'),
    )
    .sort_index()
)
```

### Memory Optimization

```python
def optimize_dtypes(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include=['int64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='integer')
    for col in df.select_dtypes(include=['float64']).columns:
        df[col] = pd.to_numeric(df[col], downcast='float')
    for col in df.select_dtypes(include=['object']).columns:
        if df[col].nunique() / len(df) < 0.5:
            df[col] = df[col].astype('category')
    return df
```

## Polars Patterns

### Lazy Evaluation

```python
import polars as pl

result = (
    pl.scan_parquet('data/events/*.parquet')
    .filter(pl.col('event_date') >= '2024-01-01')
    .group_by('user_id')
    .agg(
        pl.col('event_type').count().alias('total_events'),
        pl.col('revenue').sum().alias('total_revenue'),
        pl.col('event_date').max().alias('last_active'),
    )
    .filter(pl.col('total_events') > 10)
    .sort('total_revenue', descending=True)
    .collect()
)
```

## dbt Patterns

### Incremental Model

```sql
-- models/marts/fct_daily_orders.sql
{{ config(
    materialized='incremental',
    unique_key='order_date || order_status',
    incremental_strategy='merge'
) }}

SELECT
    date_trunc('day', created_at) AS order_date,
    status AS order_status,
    count(*) AS order_count,
    sum(total_amount) AS total_revenue
FROM {{ ref('stg_orders') }}

{% if is_incremental() %}
WHERE created_at > (SELECT max(order_date) FROM {{ this }})
{% endif %}

GROUP BY 1, 2
```

### Custom Test

```sql
-- tests/assert_no_orphan_orders.sql
SELECT order_id
FROM {{ ref('fct_orders') }} o
LEFT JOIN {{ ref('dim_customers') }} c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL
```

## Data Quality

### Deduplication

```python
def deduplicate(df: pd.DataFrame, key: str, sort_by: str) -> pd.DataFrame:
    return (
        df
        .sort_values(sort_by, ascending=False)
        .drop_duplicates(subset=[key], keep='first')
    )
```

### Schema Evolution

```python
def reconcile_schema(
    existing: pd.DataFrame,
    incoming: pd.DataFrame,
) -> pd.DataFrame:
    missing_cols = set(existing.columns) - set(incoming.columns)
    for col in missing_cols:
        incoming[col] = None
    return incoming[existing.columns]
```

## Testing Data Pipelines

```python
import pytest
import pandas as pd

@pytest.fixture
def sample_orders():
    return pd.DataFrame({
        'order_id': ['o1', 'o2', 'o3'],
        'amount': [100.0, 250.0, 50.0],
        'status': ['confirmed', 'shipped', 'pending'],
    })

def test_revenue_calculation(sample_orders):
    result = calculate_revenue(sample_orders)
    assert result['total_revenue'].sum() == 400.0

def test_no_duplicate_keys(sample_orders):
    result = process_orders(sample_orders)
    assert result['order_id'].is_unique

def test_no_null_required_fields(sample_orders):
    result = process_orders(sample_orders)
    assert result['order_id'].notna().all()
    assert result['amount'].notna().all()
```

**Remember**: Data pipelines fail silently. Validate at every boundary, test with realistic data, and monitor data quality metrics continuously.
