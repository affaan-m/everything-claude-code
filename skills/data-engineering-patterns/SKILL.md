---
name: data-engineering-patterns
description: Data engineering patterns for Python data pipelines, ETL/ELT workflows, data validation, and processing with pandas, polars, dbt, and Apache tools.
origin: ECC
---

# Data Engineering Patterns

## When to Use

Use this skill when the user is:
- Building data pipelines (batch or streaming)
- Implementing ETL/ELT workflows
- Adding data validation or quality checks
- Working with pandas, polars, or PySpark DataFrames
- Designing dbt models or transformations
- Processing large datasets with memory constraints
- Implementing incremental data loading
- Creating data contracts between teams
- Setting up data warehousing or lakehouse patterns
- Performing data migrations or backfills

## How It Works

### Idempotency

Every pipeline run with the same input must produce the same output. Re-running a pipeline should never create duplicates or corrupt data.

```python
# WRONG: Appending without deduplication
def load_data(df: pd.DataFrame, table: str) -> None:
    df.to_sql(table, engine, if_exists="append")

# CORRECT: Idempotent upsert pattern
def load_data(df: pd.DataFrame, table: str, key_columns: list[str]) -> None:
    staging_table = f"{table}_staging"
    df.to_sql(staging_table, engine, if_exists="replace")

    merge_sql = f"""
    MERGE INTO {table} AS target
    USING {staging_table} AS source
    ON {' AND '.join(f'target.{col} = source.{col}' for col in key_columns)}
    WHEN MATCHED THEN UPDATE SET
        {', '.join(f'target.{col} = source.{col}' for col in df.columns if col not in key_columns)}
    WHEN NOT MATCHED THEN INSERT
        ({', '.join(df.columns)})
        VALUES ({', '.join(f'source.{col}' for col in df.columns)});
    """

    with engine.begin() as conn:
        conn.execute(text(merge_sql))
        conn.execute(text(f"DROP TABLE IF EXISTS {staging_table}"))
```

### Schema Validation

Validate data schemas at every pipeline boundary. Fail fast on schema violations.

```python
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class ColumnSpec:
    name: str
    dtype: str
    nullable: bool = False
    unique: bool = False

@dataclass(frozen=True)
class SchemaContract:
    columns: tuple[ColumnSpec, ...]
    version: str

    def validate(self, df: pd.DataFrame) -> list[str]:
        errors = []
        for col_spec in self.columns:
            if col_spec.name not in df.columns:
                errors.append(f"Missing column: {col_spec.name}")
                continue
            if not col_spec.nullable and df[col_spec.name].isnull().any():
                null_count = df[col_spec.name].isnull().sum()
                errors.append(f"Column {col_spec.name} has {null_count} null values")
            if col_spec.unique and df[col_spec.name].duplicated().any():
                dup_count = df[col_spec.name].duplicated().sum()
                errors.append(f"Column {col_spec.name} has {dup_count} duplicates")
        return errors
```

### Data Contracts

Define explicit contracts between data producers and consumers.

```python
# contracts/user_events.py
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    PAGE_VIEW = "page_view"
    CLICK = "click"
    PURCHASE = "purchase"
    SIGNUP = "signup"

class UserEvent(BaseModel):
    event_id: str = Field(..., min_length=1)
    user_id: str = Field(..., min_length=1)
    event_type: EventType
    timestamp: datetime
    properties: dict[str, str | int | float | bool] = Field(default_factory=dict)
    session_id: str | None = None

    class Config:
        frozen = True
```

## Examples

## Pipeline Patterns

### Extract-Load-Transform (ELT)

Modern ELT pattern: load raw data first, transform in the warehouse.

```python
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from typing import TypeVar, Generic
import logging

T = TypeVar("T")

logger = logging.getLogger(__name__)

@dataclass(frozen=True)
class ExtractResult:
    record_count: int
    source: str
    extract_timestamp: datetime

class Extractor(ABC):
    @abstractmethod
    def extract(self, since: datetime | None = None) -> tuple[pd.DataFrame, ExtractResult]:
        pass

class APIExtractor(Extractor):
    def __init__(self, base_url: str, auth_token: str, page_size: int = 1000) -> None:
        self._base_url = base_url
        self._auth_token = auth_token
        self._page_size = page_size

    def extract(self, since: datetime | None = None) -> tuple[pd.DataFrame, ExtractResult]:
        all_records: list[dict] = []
        page = 1
        has_more = True

        while has_more:
            try:
                response = self._fetch_page(page, since)
                records = response.get("data", [])
                all_records.extend(records)
                has_more = len(records) == self._page_size
                page += 1
            except Exception as error:
                logger.error("Extraction failed at page %d: %s", page, error)
                raise

        df = pd.DataFrame(all_records)
        metadata = ExtractResult(
            record_count=len(df),
            source=self._base_url,
            extract_timestamp=datetime.utcnow(),
        )
        return df, metadata

    def _fetch_page(self, page: int, since: datetime | None) -> dict:
        import requests
        params: dict = {"page": page, "page_size": self._page_size}
        if since is not None:
            params["since"] = since.isoformat()
        response = requests.get(
            f"{self._base_url}/data",
            headers={"Authorization": f"Bearer {self._auth_token}"},
            params=params,
            timeout=30,
        )
        response.raise_for_status()
        return response.json()
```

### Incremental Processing

Process only new or changed records to minimize compute and latency.

```python
from psycopg2 import sql

ALLOWED_TABLES = frozenset({"orders", "customers", "products"})

@dataclass(frozen=True)
class Watermark:
    table: str
    column: str
    value: Any
    updated_at: datetime

class IncrementalLoader:
    def __init__(self, engine, watermark_table: str = "_watermarks") -> None:
        self._engine = engine
        self._watermark_table = watermark_table

    def get_watermark(self, table: str) -> Watermark | None:
        if table not in ALLOWED_TABLES:
            raise ValueError(f"Table {table!r} is not in ALLOWED_TABLES")
        query = sql.SQL(
            "SELECT * FROM {} WHERE table_name = %s"
        ).format(sql.Identifier(self._watermark_table))
        with self._engine.connect() as conn:
            result = conn.execute(query, (table,)).fetchone()
        if result is None:
            return None
        return Watermark(
            table=result.table_name,
            column=result.watermark_column,
            value=result.watermark_value,
            updated_at=result.updated_at,
        )

    def extract_incremental(
        self, source_table: str, watermark_col: str
    ) -> pd.DataFrame:
        if source_table not in ALLOWED_TABLES:
            raise ValueError(f"Table {source_table!r} is not in ALLOWED_TABLES")
        watermark = self.get_watermark(source_table)
        if watermark is not None:
            query = sql.SQL(
                "SELECT * FROM {} WHERE {} > %s"
            ).format(
                sql.Identifier(source_table),
                sql.Identifier(watermark_col),
            )
            params = (watermark.value,)
        else:
            query = sql.SQL("SELECT * FROM {}").format(
                sql.Identifier(source_table)
            )
            params = ()

        with self._engine.connect() as conn:
            df = pd.read_sql(query, conn, params=params)

        return df

    def update_watermark(self, table: str, column: str, value: Any) -> None:
        if table not in ALLOWED_TABLES:
            raise ValueError(f"Table {table!r} is not in ALLOWED_TABLES")
        upsert_sql = sql.SQL("""
            INSERT INTO {} (table_name, watermark_column, watermark_value, updated_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (table_name) DO UPDATE SET
                watermark_value = EXCLUDED.watermark_value,
                updated_at = EXCLUDED.updated_at
        """).format(sql.Identifier(self._watermark_table))
        with self._engine.begin() as conn:
            conn.execute(upsert_sql, (
                table,
                column,
                value,
                datetime.utcnow(),
            ))
```

### Backfill Strategies

Partition backfills by date range to control resource usage and enable restartability.

```python
from datetime import date, timedelta

@dataclass(frozen=True)
class BackfillConfig:
    start_date: date
    end_date: date
    partition_size_days: int = 1
    max_retries: int = 3

def generate_partitions(config: BackfillConfig) -> list[tuple[date, date]]:
    partitions = []
    current = config.start_date
    while current < config.end_date:
        partition_end = min(
            current + timedelta(days=config.partition_size_days),
            config.end_date,
        )
        partitions.append((current, partition_end))
        current = partition_end
    return partitions

def run_backfill(
    config: BackfillConfig,
    process_fn,
    checkpoint_fn,
) -> dict[str, list[tuple[date, date]]]:
    partitions = generate_partitions(config)
    results: dict[str, list[tuple[date, date]]] = {
        "succeeded": [],
        "failed": [],
    }

    for start, end in partitions:
        if checkpoint_fn(start, end):
            logger.info("Partition %s to %s already processed, skipping", start, end)
            results["succeeded"].append((start, end))
            continue

        for attempt in range(1, config.max_retries + 1):
            try:
                process_fn(start, end)
                results["succeeded"].append((start, end))
                logger.info("Processed partition %s to %s", start, end)
                break
            except Exception as error:
                logger.warning(
                    "Attempt %d/%d failed for %s to %s: %s",
                    attempt, config.max_retries, start, end, error,
                )
                if attempt == config.max_retries:
                    results["failed"].append((start, end))

    return results
```

## Data Validation

### Great Expectations Integration

```python
import great_expectations as gx

def create_validation_suite(context: gx.DataContext, suite_name: str):
    suite = context.add_expectation_suite(expectation_suite_name=suite_name)

    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToNotBeNull(column="user_id")
    )
    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToBeUnique(column="event_id")
    )
    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToBeInSet(
            column="status",
            value_set=["active", "inactive", "pending"],
        )
    )
    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToBeBetween(
            column="amount",
            min_value=0,
            max_value=1_000_000,
        )
    )
    return suite

def validate_dataframe(
    context: gx.DataContext,
    df: pd.DataFrame,
    suite_name: str,
) -> dict:
    batch = context.get_batch(df)
    results = context.run_validation(batch, expectation_suite_name=suite_name)

    if not results.success:
        failed = [
            r.expectation_config.expectation_type
            for r in results.results
            if not r.success
        ]
        raise ValueError(f"Validation failed for expectations: {failed}")

    return {
        "success": results.success,
        "statistics": results.statistics,
    }
```

### Pandera Schema Validation

```python
import pandera as pa
from pandera.typing import DataFrame, Series

class OrderSchema(pa.DataFrameModel):
    order_id: Series[str] = pa.Field(nullable=False, unique=True)
    customer_id: Series[str] = pa.Field(nullable=False)
    amount: Series[float] = pa.Field(ge=0, le=1_000_000)
    currency: Series[str] = pa.Field(isin=["USD", "EUR", "GBP"])
    status: Series[str] = pa.Field(isin=["pending", "completed", "cancelled"])
    created_at: Series[pa.DateTime] = pa.Field(nullable=False)

    class Config:
        strict = True
        coerce = True

    @pa.check("amount")
    def amount_precision(cls, series: Series[float]) -> Series[bool]:
        return series.round(2) == series

@pa.check_types
def process_orders(orders: DataFrame[OrderSchema]) -> DataFrame[OrderSchema]:
    return orders.assign(
        amount=lambda df: df["amount"].round(2),
    )
```

### Pydantic for Data Models

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class SalesRecord(BaseModel):
    transaction_id: str = Field(..., min_length=1, max_length=64)
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    discount_pct: float = Field(default=0.0, ge=0.0, le=1.0)
    sale_date: datetime

    class Config:
        frozen = True

    @field_validator("transaction_id")
    @classmethod
    def validate_transaction_format(cls, v: str) -> str:
        if not v.startswith("TXN-"):
            raise ValueError("Transaction ID must start with TXN-")
        return v

    @property
    def total_amount(self) -> float:
        return round(self.quantity * self.unit_price * (1 - self.discount_pct), 2)

def validate_batch(records: list[dict]) -> tuple[list[SalesRecord], list[dict]]:
    valid_records: list[SalesRecord] = []
    invalid_records: list[dict] = []

    for record in records:
        try:
            valid_records.append(SalesRecord(**record))
        except Exception as error:
            invalid_records.append({**record, "_error": str(error)})

    return valid_records, invalid_records
```

## pandas Best Practices

### Vectorized Operations

Always prefer vectorized operations over loops. Never use `iterrows()`.

```python
# WRONG: Using iterrows (extremely slow)
def calculate_totals_slow(df: pd.DataFrame) -> pd.DataFrame:
    results = []
    for _, row in df.iterrows():
        total = row["quantity"] * row["price"] * (1 - row["discount"])
        results.append(total)
    return df.assign(total=results)

# CORRECT: Vectorized operations (100x+ faster)
def calculate_totals(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        total=lambda d: d["quantity"] * d["price"] * (1 - d["discount"])
    )

# WRONG: apply with a Python function (slow)
def categorize_slow(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        tier=df["revenue"].apply(
            lambda x: "high" if x > 10000 else "medium" if x > 1000 else "low"
        )
    )

# CORRECT: np.select for conditional logic (fast)
import numpy as np

def categorize(df: pd.DataFrame) -> pd.DataFrame:
    conditions = [
        df["revenue"] > 10_000,
        df["revenue"] > 1_000,
    ]
    choices = ["high", "medium"]
    return df.assign(tier=np.select(conditions, choices, default="low"))
```

### Method Chaining

Use method chaining for readable, functional-style transformations.

```python
def transform_sales_data(raw_df: pd.DataFrame) -> pd.DataFrame:
    return (
        raw_df
        .rename(columns=str.lower)
        .rename(columns=lambda c: c.replace(" ", "_"))
        .astype({"sale_date": "datetime64[ns]"})
        .assign(
            year=lambda df: df["sale_date"].dt.year,
            month=lambda df: df["sale_date"].dt.month,
            revenue=lambda df: df["quantity"] * df["unit_price"],
            is_high_value=lambda df: df["revenue"] > 1000,
        )
        .query("quantity > 0 and unit_price > 0")
        .drop_duplicates(subset=["transaction_id"])
        .sort_values("sale_date")
        .reset_index(drop=True)
    )
```

### Memory Optimization

Downcast types and use categorical columns to reduce memory usage.

```python
def optimize_dataframe_memory(df: pd.DataFrame) -> pd.DataFrame:
    optimized = df.copy()

    for col in optimized.select_dtypes(include=["int64"]).columns:
        col_min = optimized[col].min()
        col_max = optimized[col].max()
        if col_min >= np.iinfo(np.int8).min and col_max <= np.iinfo(np.int8).max:
            optimized[col] = optimized[col].astype(np.int8)
        elif col_min >= np.iinfo(np.int16).min and col_max <= np.iinfo(np.int16).max:
            optimized[col] = optimized[col].astype(np.int16)
        elif col_min >= np.iinfo(np.int32).min and col_max <= np.iinfo(np.int32).max:
            optimized[col] = optimized[col].astype(np.int32)

    for col in optimized.select_dtypes(include=["float64"]).columns:
        optimized[col] = pd.to_numeric(optimized[col], downcast="float")

    for col in optimized.select_dtypes(include=["object"]).columns:
        nunique_ratio = optimized[col].nunique() / len(optimized)
        if nunique_ratio < 0.5:
            optimized[col] = optimized[col].astype("category")

    return optimized

def read_large_csv_chunked(
    filepath: str,
    chunksize: int = 100_000,
    process_fn=None,
) -> pd.DataFrame:
    chunks = []
    for chunk in pd.read_csv(filepath, chunksize=chunksize):
        if process_fn is not None:
            chunk = process_fn(chunk)
        chunk = optimize_dataframe_memory(chunk)
        chunks.append(chunk)
    return pd.concat(chunks, ignore_index=True)
```

## Polars Patterns

### Lazy Evaluation

Use lazy frames to let the query optimizer plan execution.

```python
import polars as pl

def transform_with_polars(filepath: str) -> pl.DataFrame:
    return (
        pl.scan_parquet(filepath)
        .filter(pl.col("status") == "active")
        .with_columns(
            revenue=pl.col("quantity") * pl.col("unit_price"),
            year=pl.col("created_at").dt.year(),
            month=pl.col("created_at").dt.month(),
        )
        .group_by(["year", "month", "category"])
        .agg(
            total_revenue=pl.col("revenue").sum(),
            order_count=pl.col("order_id").n_unique(),
            avg_order_value=pl.col("revenue").mean(),
        )
        .sort(["year", "month", "total_revenue"], descending=[False, False, True])
        .collect()
    )
```

### Expression API

Polars expressions are composable and highly performant.

```python
def advanced_polars_transforms(df: pl.LazyFrame) -> pl.LazyFrame:
    return df.with_columns(
        # Window functions
        rolling_avg=pl.col("revenue")
            .rolling_mean(window_size=7)
            .over("product_id"),

        # Rank within groups
        revenue_rank=pl.col("revenue")
            .rank(descending=True)
            .over("category"),

        # Conditional expressions
        tier=pl.when(pl.col("revenue") > 10_000)
            .then(pl.lit("enterprise"))
            .when(pl.col("revenue") > 1_000)
            .then(pl.lit("business"))
            .otherwise(pl.lit("starter")),

        # String operations
        email_domain=pl.col("email").str.split("@").list.last(),

        # Date operations
        days_since_signup=(
            pl.col("last_active") - pl.col("signup_date")
        ).dt.total_days(),
    )
```

### Parallel Execution

Polars automatically parallelizes operations across CPU cores.

```python
def parallel_aggregation(data_dir: str) -> pl.DataFrame:
    return (
        pl.scan_parquet(f"{data_dir}/**/*.parquet")
        .filter(
            (pl.col("event_date") >= pl.lit("2025-01-01"))
            & (pl.col("event_type").is_in(["purchase", "refund"]))
        )
        .with_columns(
            net_amount=pl.when(pl.col("event_type") == "refund")
                .then(-pl.col("amount"))
                .otherwise(pl.col("amount")),
        )
        .group_by("customer_id")
        .agg(
            total_spend=pl.col("net_amount").sum(),
            transaction_count=pl.len(),
            first_purchase=pl.col("event_date").min(),
            last_purchase=pl.col("event_date").max(),
            avg_transaction=pl.col("net_amount").filter(
                pl.col("event_type") == "purchase"
            ).mean(),
        )
        .with_columns(
            lifetime_days=(
                pl.col("last_purchase") - pl.col("first_purchase")
            ).dt.total_days(),
        )
        .sort("total_spend", descending=True)
        .collect()
    )
```

## dbt Patterns

### Models

Organize dbt models into staging, intermediate, and marts layers.

```sql
-- models/staging/stg_orders.sql
{{ config(materialized='view') }}

with source as (
    select * from {{ source('raw', 'orders') }}
),

renamed as (
    select
        id as order_id,
        customer_id,
        cast(order_date as date) as order_date,
        cast(total_amount as decimal(12, 2)) as total_amount,
        lower(trim(status)) as status,
        cast(created_at as timestamp) as created_at,
        cast(updated_at as timestamp) as updated_at
    from source
    where id is not null
)

select * from renamed
```

```sql
-- models/marts/fct_daily_revenue.sql
{{ config(
    materialized='incremental',
    unique_key='revenue_date',
    on_schema_change='sync_all_columns'
) }}

with orders as (
    select * from {{ ref('stg_orders') }}
    where status = 'completed'
    {% if is_incremental() %}
    and order_date > (select max(revenue_date) from {{ this }})
    {% endif %}
),

daily_agg as (
    select
        order_date as revenue_date,
        count(distinct order_id) as order_count,
        count(distinct customer_id) as unique_customers,
        sum(total_amount) as total_revenue,
        avg(total_amount) as avg_order_value
    from orders
    group by order_date
)

select * from daily_agg
```

### dbt Tests and Macros

```sql
-- tests/assert_revenue_positive.sql
select
    revenue_date,
    total_revenue
from {{ ref('fct_daily_revenue') }}
where total_revenue < 0

-- macros/generate_surrogate_key.sql
{% macro generate_surrogate_key(fields) %}
    {{ dbt_utils.generate_surrogate_key(fields) }}
{% endmacro %}

-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name) %}
    cast({{ column_name }} as decimal(12, 2)) / 100.0
{% endmacro %}
```

## Apache Spark Patterns

### Partitioning

Choose partition columns that match common query predicates.

```python
from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import functions as F

def write_partitioned_data(
    df: DataFrame,
    output_path: str,
    partition_cols: list[str],
) -> None:
    (
        df
        .repartition(*[F.col(c) for c in partition_cols])
        .write
        .mode("overwrite")
        .partitionBy(*partition_cols)
        .parquet(output_path)
    )

def read_with_partition_pruning(
    spark: SparkSession,
    path: str,
    year: int,
    month: int,
) -> DataFrame:
    return (
        spark.read.parquet(path)
        .filter((F.col("year") == year) & (F.col("month") == month))
    )
```

### Broadcast Joins

Broadcast smaller tables to avoid expensive shuffle joins.

```python
from pyspark.sql.functions import broadcast

def enrich_events_with_dimensions(
    events_df: DataFrame,
    products_df: DataFrame,
    customers_df: DataFrame,
) -> DataFrame:
    return (
        events_df
        .join(
            broadcast(products_df),
            on="product_id",
            how="left",
        )
        .join(
            broadcast(customers_df.select("customer_id", "segment", "region")),
            on="customer_id",
            how="left",
        )
    )
```

### Caching and Checkpointing

```python
def multi_step_pipeline(spark: SparkSession, input_path: str) -> DataFrame:
    raw = spark.read.parquet(input_path)

    # Cache intermediate results used multiple times
    cleaned = (
        raw
        .filter(F.col("is_valid") == True)
        .dropDuplicates(["event_id"])
        .withColumn("processed_at", F.current_timestamp())
    )
    cleaned.cache()

    aggregated = (
        cleaned
        .groupBy("category")
        .agg(
            F.count("*").alias("event_count"),
            F.sum("amount").alias("total_amount"),
        )
    )

    enriched = cleaned.join(
        broadcast(aggregated),
        on="category",
        how="left",
    )

    # Unpersist when no longer needed
    cleaned.unpersist()

    return enriched
```

## Data Quality

### Null Handling Strategies

```python
@dataclass(frozen=True)
class NullStrategy:
    column: str
    strategy: str  # "drop", "fill_value", "fill_forward", "fill_mean", "flag"
    fill_value: Any = None

def apply_null_strategies(
    df: pd.DataFrame,
    strategies: list[NullStrategy],
) -> pd.DataFrame:
    result = df.copy()
    for strategy in strategies:
        col = strategy.column
        if strategy.strategy == "drop":
            result = result.dropna(subset=[col])
        elif strategy.strategy == "fill_value":
            result[col] = result[col].fillna(strategy.fill_value)
        elif strategy.strategy == "fill_forward":
            result[col] = result[col].ffill()
        elif strategy.strategy == "fill_mean":
            result[col] = result[col].fillna(result[col].mean())
        elif strategy.strategy == "flag":
            result = result.assign(**{f"{col}_is_null": result[col].isnull()})
    return result
```

### Deduplication

```python
def deduplicate_events(
    df: pd.DataFrame,
    key_columns: list[str],
    timestamp_col: str = "updated_at",
    strategy: str = "keep_latest",
) -> pd.DataFrame:
    if strategy == "keep_latest":
        return (
            df
            .sort_values(timestamp_col, ascending=False)
            .drop_duplicates(subset=key_columns, keep="first")
            .sort_values(timestamp_col)
            .reset_index(drop=True)
        )
    elif strategy == "keep_first":
        return (
            df
            .sort_values(timestamp_col, ascending=True)
            .drop_duplicates(subset=key_columns, keep="first")
            .reset_index(drop=True)
        )
    else:
        raise ValueError(f"Unknown deduplication strategy: {strategy}")
```

### Schema Evolution

Handle schema changes gracefully across pipeline versions.

```python
def reconcile_schemas(
    current_df: pd.DataFrame,
    expected_columns: dict[str, str],
) -> pd.DataFrame:
    result = current_df.copy()

    # Add missing columns with defaults
    for col, dtype in expected_columns.items():
        if col not in result.columns:
            if dtype.startswith("int"):
                result[col] = 0
            elif dtype.startswith("float"):
                result[col] = 0.0
            elif dtype == "str":
                result[col] = ""
            elif dtype == "bool":
                result[col] = False
            else:
                result[col] = None
            logger.info("Added missing column: %s with type %s", col, dtype)

    # Drop unexpected columns
    extra_cols = set(result.columns) - set(expected_columns.keys())
    if extra_cols:
        logger.warning("Dropping unexpected columns: %s", extra_cols)
        result = result.drop(columns=list(extra_cols))

    # Reorder to match expected schema
    return result[list(expected_columns.keys())]
```

## Testing Data Pipelines

### Fixture Data

```python
import pytest
import pandas as pd

@pytest.fixture
def sample_orders() -> pd.DataFrame:
    return pd.DataFrame({
        "order_id": ["ORD-001", "ORD-002", "ORD-003"],
        "customer_id": ["CUST-A", "CUST-B", "CUST-A"],
        "amount": [100.50, 250.00, 75.25],
        "status": ["completed", "pending", "completed"],
        "created_at": pd.to_datetime([
            "2025-01-01", "2025-01-02", "2025-01-03"
        ]),
    })

@pytest.fixture
def sample_orders_with_nulls(sample_orders: pd.DataFrame) -> pd.DataFrame:
    df = sample_orders.copy()
    df.loc[1, "amount"] = None
    df.loc[2, "customer_id"] = None
    return df
```

### Snapshot Testing

```python
def test_transformation_snapshot(sample_orders: pd.DataFrame, snapshot):
    result = transform_sales_data(sample_orders)
    assert result.to_dict(orient="records") == snapshot

def test_aggregation_output(sample_orders: pd.DataFrame):
    result = aggregate_by_customer(sample_orders)

    expected = pd.DataFrame({
        "customer_id": ["CUST-A", "CUST-B"],
        "total_amount": [175.75, 250.00],
        "order_count": [2, 1],
    })

    pd.testing.assert_frame_equal(
        result.reset_index(drop=True),
        expected.reset_index(drop=True),
        check_dtype=False,
    )
```

### Data Assertions

```python
def assert_no_duplicates(df: pd.DataFrame, key_columns: list[str]) -> None:
    duplicates = df[df.duplicated(subset=key_columns, keep=False)]
    if len(duplicates) > 0:
        raise AssertionError(
            f"Found {len(duplicates)} duplicate rows on columns {key_columns}. "
            f"Sample: {duplicates.head(5).to_dict(orient='records')}"
        )

def assert_referential_integrity(
    child_df: pd.DataFrame,
    child_col: str,
    parent_df: pd.DataFrame,
    parent_col: str,
) -> None:
    child_keys = set(child_df[child_col].dropna().unique())
    parent_keys = set(parent_df[parent_col].dropna().unique())
    orphaned = child_keys - parent_keys
    if orphaned:
        raise AssertionError(
            f"Found {len(orphaned)} orphaned keys in {child_col}. "
            f"Sample: {list(orphaned)[:10]}"
        )

def assert_column_values_in_range(
    df: pd.DataFrame,
    column: str,
    min_val: float,
    max_val: float,
) -> None:
    out_of_range = df[
        (df[column] < min_val) | (df[column] > max_val)
    ]
    if len(out_of_range) > 0:
        raise AssertionError(
            f"Column {column} has {len(out_of_range)} values outside "
            f"[{min_val}, {max_val}]. "
            f"Actual range: [{df[column].min()}, {df[column].max()}]"
        )

class TestOrdersPipeline:
    def test_no_duplicate_orders(self, sample_orders: pd.DataFrame):
        result = transform_sales_data(sample_orders)
        assert_no_duplicates(result, ["order_id"])

    def test_amounts_are_positive(self, sample_orders: pd.DataFrame):
        result = transform_sales_data(sample_orders)
        assert_column_values_in_range(result, "amount", 0, 1_000_000)

    def test_all_customers_exist(
        self, sample_orders: pd.DataFrame, sample_customers: pd.DataFrame
    ):
        result = transform_sales_data(sample_orders)
        assert_referential_integrity(
            result, "customer_id", sample_customers, "customer_id"
        )
```
