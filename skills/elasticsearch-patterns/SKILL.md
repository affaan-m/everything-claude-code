---
name: elasticsearch-patterns
description: Elasticsearch patterns for index design, query DSL, aggregations, bulk indexing, index lifecycle management, and integration with TypeScript and Python.
---

# Elasticsearch Patterns

Production-grade Elasticsearch patterns for search, analytics, and document indexing.

## When to Activate

- Designing Elasticsearch index mappings and analyzers
- Writing search queries (bool, multi_match, nested, function_score)
- Building aggregations (terms, date histogram, pipeline)
- Implementing bulk indexing and zero-downtime reindexing
- Configuring Index Lifecycle Management (ILM) for time-series data
- Integrating Elasticsearch with TypeScript or Python applications
- Monitoring cluster health and diagnosing slow queries

## Core Principles

1. **Explicit mappings** — always define mappings; never rely on dynamic mapping in production
2. **Denormalize for search** — Elasticsearch is not a relational database; flatten data
3. **Index per use case** — separate indexes for search, analytics, and logging
4. **Bulk operations** — always use the bulk API for indexing; never single-document in loops
5. **Aliases for zero downtime** — never point applications directly at index names

## Index Design

### Explicit Mapping

```json
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "product_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "product_synonyms"]
        }
      },
      "filter": {
        "product_synonyms": {
          "type": "synonym",
          "synonyms": ["laptop,notebook", "phone,mobile,smartphone"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name":        { "type": "text", "analyzer": "product_analyzer", "fields": { "keyword": { "type": "keyword" } } },
      "description": { "type": "text", "analyzer": "product_analyzer" },
      "category":    { "type": "keyword" },
      "price":       { "type": "float" },
      "in_stock":    { "type": "boolean" },
      "tags":        { "type": "keyword" },
      "created_at":  { "type": "date" },
      "attributes":  { "type": "flattened" },
      "reviews": {
        "type": "nested",
        "properties": {
          "user":   { "type": "keyword" },
          "rating": { "type": "integer" },
          "text":   { "type": "text" }
        }
      }
    }
  }
}
```

### Nested vs Flattened

```
Use nested when:                    Use flattened when:
─────────────────────               ────────────────────
✓ Need to query field pairs         ✓ Just filtering by key existence
  (rating > 4 AND user = "alice")   ✓ Don't need cross-field queries
✓ Aggregations on sub-documents     ✓ Schema is unpredictable
✗ Slower indexing and querying       ✓ Performance is priority
```

## Query DSL

### Bool Query with Boosting

```json
POST /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "multi_match": {
            "query": "wireless headphones",
            "fields": ["name^3", "description", "tags^2"],
            "type": "best_fields",
            "fuzziness": "AUTO"
        }}
      ],
      "filter": [
        { "term": { "in_stock": true } },
        { "range": { "price": { "gte": 20, "lte": 200 } } }
      ],
      "should": [
        { "term": { "category": { "value": "electronics", "boost": 1.5 } } }
      ]
    }
  },
  "highlight": {
    "fields": { "name": {}, "description": {} },
    "pre_tags": ["<mark>"],
    "post_tags": ["</mark>"]
  },
  "from": 0, "size": 20
}
```

### Nested Query

```json
POST /products/_search
{
  "query": {
    "nested": {
      "path": "reviews",
      "query": {
        "bool": {
          "must": [
            { "range": { "reviews.rating": { "gte": 4 } } },
            { "match": { "reviews.text": "excellent quality" } }
          ]
        }
      },
      "inner_hits": { "size": 3 }
    }
  }
}
```

### Function Score (Relevance Tuning)

```json
POST /products/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "name": "headphones" } },
      "functions": [
        { "filter": { "term": { "category": "electronics" } }, "weight": 2 },
        { "field_value_factor": { "field": "sales_count", "modifier": "log1p", "factor": 0.1 } },
        { "gauss": { "created_at": { "origin": "now", "scale": "30d", "decay": 0.5 } } }
      ],
      "score_mode": "sum",
      "boost_mode": "multiply"
    }
  }
}
```

### Completion Suggester (Autocomplete)

```json
PUT /products
{
  "mappings": {
    "properties": {
      "suggest": {
        "type": "completion",
        "analyzer": "simple",
        "contexts": [{ "name": "category", "type": "category" }]
      }
    }
  }
}

POST /products/_search
{
  "suggest": {
    "product-suggest": {
      "prefix": "wire",
      "completion": {
        "field": "suggest",
        "size": 5,
        "fuzzy": { "fuzziness": 1 },
        "contexts": { "category": ["electronics"] }
      }
    }
  }
}
```

## Aggregations

### Terms + Date Histogram

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "monthly_sales": {
      "date_histogram": { "field": "created_at", "calendar_interval": "month" },
      "aggs": {
        "revenue": { "sum": { "field": "total" } },
        "avg_order": { "avg": { "field": "total" } },
        "top_categories": {
          "terms": { "field": "category", "size": 5 },
          "aggs": {
            "category_revenue": { "sum": { "field": "total" } }
          }
        }
      }
    },
    "revenue_percentiles": {
      "percentiles": { "field": "total", "percents": [50, 90, 95, 99] }
    }
  }
}
```

### Pipeline Aggregation

```json
POST /orders/_search
{
  "size": 0,
  "aggs": {
    "monthly": {
      "date_histogram": { "field": "created_at", "calendar_interval": "month" },
      "aggs": {
        "revenue": { "sum": { "field": "total" } }
      }
    },
    "max_monthly_revenue": {
      "max_bucket": { "buckets_path": "monthly>revenue" }
    },
    "avg_monthly_revenue": {
      "avg_bucket": { "buckets_path": "monthly>revenue" }
    }
  }
}
```

## Indexing Patterns

### TypeScript Bulk Indexing

```typescript
import { Client } from "@elastic/elasticsearch";

const client = new Client({ node: process.env.ELASTICSEARCH_URL });

async function bulkIndex(products: Product[]) {
  const body = products.flatMap(product => [
    { index: { _index: "products", _id: product.id } },
    {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      in_stock: product.inStock,
      tags: product.tags,
      created_at: product.createdAt,
      suggest: {
        input: [product.name, ...product.tags],
        contexts: { category: [product.category] },
      },
    },
  ]);

  const result = await client.bulk({ refresh: true, body });

  if (result.errors) {
    const errors = result.items.filter((item: any) => item.index?.error);
    console.error(`Bulk indexing errors: ${errors.length}/${products.length}`);
  }
}
```

### Python Bulk Indexing

```python
from elasticsearch import Elasticsearch, helpers

es = Elasticsearch(os.environ["ELASTICSEARCH_URL"])

def bulk_index_products(products: list[dict]) -> tuple[int, list]:
    actions = [
        {
            "_index": "products",
            "_id": p["id"],
            "_source": {
                "name": p["name"],
                "description": p["description"],
                "category": p["category"],
                "price": p["price"],
                "in_stock": p["in_stock"],
                "tags": p["tags"],
                "created_at": p["created_at"],
            },
        }
        for p in products
    ]
    success, errors = helpers.bulk(es, actions, raise_on_error=False)
    return success, errors
```

### Zero-Downtime Reindex

```
Step 1: Create new index with updated mapping
PUT /products_v2  { ...new mapping... }

Step 2: Reindex from old to new
POST /_reindex
{ "source": { "index": "products_v1" }, "dest": { "index": "products_v2" } }

Step 3: Swap alias atomically
POST /_aliases
{ "actions": [
    { "remove": { "index": "products_v1", "alias": "products" } },
    { "add":    { "index": "products_v2", "alias": "products" } }
]}

Step 4: Delete old index when ready
DELETE /products_v1
```

## Index Lifecycle Management (ILM)

### Hot-Warm-Cold Policy

```json
PUT /_ilm/policy/logs_policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": { "max_primary_shard_size": "50gb", "max_age": "1d" },
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "shrink": { "number_of_shards": 1 },
          "forcemerge": { "max_num_segments": 1 },
          "set_priority": { "priority": 50 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "set_priority": { "priority": 0 },
          "readonly": {}
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": { "delete": {} }
      }
    }
  }
}
```

## Integration

### TypeScript Search Service

```typescript
import { Client } from "@elastic/elasticsearch";

interface SearchParams {
  query: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  size?: number;
}

interface SearchResult<T> {
  hits: T[];
  total: number;
  took: number;
}

class ProductSearchService {
  constructor(private client: Client) {}

  async search(params: SearchParams): Promise<SearchResult<Product>> {
    const { query, category, priceMin, priceMax, page = 1, size = 20 } = params;

    const must: any[] = [];
    const filter: any[] = [];

    if (query) {
      must.push({
        multi_match: { query, fields: ["name^3", "description", "tags^2"], fuzziness: "AUTO" },
      });
    }

    if (category) filter.push({ term: { category } });
    if (priceMin !== undefined || priceMax !== undefined) {
      filter.push({ range: { price: { ...(priceMin !== undefined && { gte: priceMin }), ...(priceMax !== undefined && { lte: priceMax }) } } });
    }

    const result = await this.client.search({
      index: "products",
      body: {
        query: { bool: { must: must.length ? must : [{ match_all: {} }], filter } },
        from: (page - 1) * size,
        size,
        highlight: { fields: { name: {}, description: {} } },
      },
    });

    return {
      hits: result.hits.hits.map((h: any) => ({ ...h._source, _score: h._score, _highlight: h.highlight })),
      total: typeof result.hits.total === "number" ? result.hits.total : result.hits.total.value,
      took: result.took,
    };
  }
}
```

## Monitoring

### Cluster Health

```bash
# Quick health check
GET /_cluster/health

# Shard allocation issues
GET /_cluster/allocation/explain

# Index stats
GET /products/_stats

# Node resource usage
GET /_nodes/stats/jvm,os,process
```

### Slow Log

```json
PUT /products/_settings
{
  "index.search.slowlog.threshold.query.warn": "2s",
  "index.search.slowlog.threshold.query.info": "500ms",
  "index.indexing.slowlog.threshold.index.warn": "5s",
  "index.indexing.slowlog.threshold.index.info": "1s"
}
```

## Checklist

```
Before deploying Elasticsearch changes:
- [ ] Index mappings are explicit (no dynamic mapping in production)
- [ ] Text fields have appropriate analyzers configured
- [ ] Nested type used only when cross-field queries are needed
- [ ] Aliases used for all application-facing index access
- [ ] Bulk API used for all indexing operations
- [ ] Reindexing tested with alias swap for zero downtime
- [ ] ILM policy configured for time-series / log data
- [ ] Search queries use filter context for non-scoring clauses
- [ ] Aggregations avoid high-cardinality terms without size limit
- [ ] Slow log thresholds configured for query and indexing
- [ ] Cluster health monitored (green status, no unassigned shards)
```
