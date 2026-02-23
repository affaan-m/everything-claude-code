---
name: data-pipeline-patterns
description: Data pipeline and data engineering patterns — ELT architecture, dbt models, Airflow DAGs, data quality validation, incremental processing, idempotent pipelines, and testing strategies with SQL, Python, and YAML examples.
---

# Data Pipeline Patterns

Build reliable, testable, and maintainable data pipelines for analytics and data warehousing.

## When to Activate

- Designing ELT/ETL data architectures
- Building dbt models (staging, intermediate, marts)
- Writing Airflow DAGs with proper error handling
- Implementing data quality checks and validation
- Designing incremental/CDC processing pipelines
- Ensuring pipeline idempotency
- Testing data transformations

## Core Principles

1. **ELT over ETL** — load raw data first, transform in the warehouse
2. **Idempotent pipelines** — re-running produces the same result
3. **Data quality as code** — tests and assertions alongside transformations
4. **Incremental by default** — process only new/changed data
5. **Lineage and observability** — track data flow from source to consumption
6. **Modularity** — small, testable, reusable transformations

---

## 1. ELT Architecture

```
Sources          Extract & Load         Transform              Serve
┌──────┐        ┌──────────────┐      ┌──────────────┐      ┌──────────┐
│ APIs  │──┐    │  Fivetran /   │      │  dbt models   │      │ Dashboard│
│ DBs   │──┼───►│  Airbyte /    │─────►│  staging →    │─────►│ ML       │
│ Files │──┘    │  Custom       │      │  intermediate │      │ Reverse  │
└──────┘        └──────────────┘      │  → marts      │      │  ETL     │
                                      └──────────────┘      └──────────┘
```

### Layer Responsibilities

| Layer | Purpose | Example |
|-------|---------|---------|
| **Staging** | 1:1 source mirror, renamed/typed | `stg_stripe__payments` |
| **Intermediate** | Business logic joins, filters | `int_orders__with_payments` |
| **Marts** | Business-ready aggregations | `fct_daily_revenue`, `dim_customers` |

---

## 2. dbt Patterns

### Staging Model

```sql
-- models/staging/stripe/stg_stripe__payments.sql
with source as (
    select * from {{ source('stripe', 'payments') }}
),
renamed as (
    select
        id as payment_id,
        amount::decimal(10,2) / 100 as amount_dollars,
        currency,
        status,
        customer_id,
        created::timestamp as created_at
    from source
    where _fivetran_deleted = false
)
select * from renamed
```

### Incremental Model

```sql
-- models/intermediate/int_orders__enriched.sql
{{
    config(
        materialized='incremental',
        unique_key='order_id',
        incremental_strategy='merge',
        on_schema_change='sync_all_columns'
    )
}}

with orders as (
    select * from {{ ref('stg_app__orders') }}
    {% if is_incremental() %}
    where updated_at > (select max(updated_at) from {{ this }})
    {% endif %}
),
payments as (
    select * from {{ ref('stg_stripe__payments') }}
)
select
    o.order_id,
    o.customer_id,
    o.status,
    o.updated_at,
    sum(p.amount_dollars) as total_paid
from orders o
left join payments p on o.order_id = p.order_id
group by 1, 2, 3, 4
```

### dbt Tests

```yaml
# models/staging/stripe/_stripe__models.yml
models:
  - name: stg_stripe__payments
    columns:
      - name: payment_id
        tests:
          - unique
          - not_null
      - name: amount_dollars
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              max_value: 100000
      - name: status
        tests:
          - accepted_values:
              values: ['succeeded', 'pending', 'failed', 'refunded']
```

### dbt Macros

```sql
-- macros/cents_to_dollars.sql
{% macro cents_to_dollars(column_name) %}
    ({{ column_name }}::decimal(10,2) / 100)
{% endmacro %}
```

---

## 3. Airflow DAG Patterns

### TaskFlow API

```python
from airflow.decorators import dag, task
from datetime import datetime, timedelta

@dag(
    schedule="@daily",
    start_date=datetime(2024, 1, 1),
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=5)},
    tags=["data-pipeline"],
)
def daily_revenue_pipeline():
    @task()
    def extract_orders(ds=None):
        return db.query("SELECT * FROM orders WHERE date = %s", [ds])

    @task()
    def transform_revenue(orders):
        df = pd.DataFrame(orders)
        return df.groupby("product_id")["amount"].sum().to_dict()

    @task()
    def load_to_warehouse(revenue, ds=None):
        warehouse.execute("DELETE FROM daily_revenue WHERE date = %(ds)s", {"ds": ds})
        for product_id, amount in revenue.items():
            warehouse.execute(
                "INSERT INTO daily_revenue VALUES (%(ds)s, %(pid)s, %(amt)s)",
                {"ds": ds, "pid": product_id, "amt": amount},
            )

    orders = extract_orders()
    revenue = transform_revenue(orders)
    load_to_warehouse(revenue)

daily_revenue_pipeline()
```

### Sensor + Trigger

```python
from airflow.sensors.sql import SqlSensor

wait_for_data = SqlSensor(
    task_id="wait_for_source_data",
    conn_id="source_db",
    sql="SELECT COUNT(*) FROM orders WHERE date = '{{ ds }}'",
    mode="reschedule",
    poke_interval=300,
    timeout=3600,
)
```

---

## 4. Data Quality & Validation

### Great Expectations

```python
import great_expectations as gx

context = gx.get_context()
validator = context.sources.pandas_default.read_csv("./data/orders.csv")

validator.expect_column_values_to_not_be_null("order_id")
validator.expect_column_values_to_be_between("amount", min_value=0, max_value=100000)
validator.expect_column_values_to_be_in_set(
    "status", ["placed", "shipped", "delivered", "cancelled"]
)
results = validator.validate()
```

### dbt Freshness SLA

```yaml
# models/staging/_sources.yml
sources:
  - name: stripe
    freshness:
      warn_after: { count: 12, period: hour }
      error_after: { count: 24, period: hour }
    loaded_at_field: _fivetran_synced
    tables:
      - name: payments
      - name: customers
```

---

## 5. Incremental Processing

### Change Data Capture (CDC)

```sql
-- High-water mark pattern
{% if is_incremental() %}
  where _cdc_updated_at > (select coalesce(max(_cdc_updated_at), '1970-01-01') from {{ this }})
{% endif %}
```

### Deduplication

```sql
with ranked as (
    select *,
        row_number() over (partition by record_id order by _cdc_updated_at desc) as rn
    from {{ ref('stg_cdc__customers') }}
)
select * from ranked where rn = 1
```

---

## 6. Idempotent Pipeline Design

| Strategy | How | Best For |
|----------|-----|----------|
| **DELETE + INSERT** | Delete target partition, then insert | Daily full-refresh partitions |
| **MERGE / UPSERT** | Insert or update by key | Incremental with updates |
| **Partition overwrite** | Overwrite entire partition | Large daily loads |
| **Tombstone** | Soft-delete with `_deleted_at` | Audit-required data |

```sql
-- Idempotent daily load with DELETE + INSERT
DELETE FROM analytics.daily_revenue WHERE date = '{{ var("execution_date") }}';
INSERT INTO analytics.daily_revenue
SELECT '{{ var("execution_date") }}' as date, product_id, sum(amount)
FROM staging.orders WHERE date = '{{ var("execution_date") }}'
GROUP BY product_id;
```

---

## 7. Testing Data Pipelines

### dbt Unit Tests (v1.8+)

```yaml
unit_tests:
  - name: test_cents_to_dollars
    model: stg_stripe__payments
    given:
      - input: source('stripe', 'payments')
        rows:
          - { id: 1, amount: 1050, currency: "usd", status: "succeeded" }
    expect:
      rows:
        - { payment_id: 1, amount_dollars: 10.50, status: "succeeded" }
```

### Airflow DAG Test

```python
import pytest
from airflow.models import DagBag

def test_dag_loads():
    bag = DagBag(include_examples=False)
    assert "daily_revenue_pipeline" in bag.dags
    assert len(bag.import_errors) == 0

def test_dag_has_no_cycles():
    bag = DagBag(include_examples=False)
    dag = bag.get_dag("daily_revenue_pipeline")
    assert not dag.test_cycle()
```

---

## 8. Monitoring & Observability

| Metric | Alert Threshold | Tool |
|--------|----------------|------|
| **Freshness** | >SLA hours since last update | dbt source freshness |
| **Row count** | >50% deviation from expected | dbt test + Great Expectations |
| **Schema drift** | New/removed columns | dbt `on_schema_change` |
| **Pipeline duration** | >2x historical average | Airflow SLA |
| **Data quality score** | <95% pass rate | Great Expectations |

---

## 9. Checklist

- [ ] Staging models mirror source 1:1 with consistent naming
- [ ] Incremental models have `unique_key` and handle late-arriving data
- [ ] dbt tests on primary keys (unique, not_null) and business rules
- [ ] Source freshness SLAs configured and monitored
- [ ] Airflow DAGs are idempotent (safe to re-run)
- [ ] Retry configuration on all Airflow tasks
- [ ] Data quality checks run before downstream consumption
- [ ] Pipeline lineage documented (source → staging → marts)
- [ ] Deduplication strategy defined for CDC sources
- [ ] Monitoring alerts for freshness, row count anomalies, and failures
