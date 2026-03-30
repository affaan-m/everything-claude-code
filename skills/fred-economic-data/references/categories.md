# FRED Categories Endpoints

Categories endpoints provide access to the hierarchical organization of economic data series.

## Table of Contents

1. [fred/category](#fredcategory) - Get a category
2. [fred/category/children](#fredcategorychildren) - Get child categories
3. [fred/category/related](#fredcategoryrelated) - Get related categories
4. [fred/category/series](#fredcategoryseries) - Get series in category
5. [fred/category/tags](#fredcategorytags) - Get category tags
6. [fred/category/related_tags](#fredcategoryrelated_tags) - Get related tags

## Category Hierarchy

FRED organizes data in a hierarchical category structure. The root category has `category_id=0`.

**Top-level categories (children of root):**
- Money, Banking, & Finance (32991)
- Population, Employment, & Labor Markets (10)
- National Accounts (32992)
- Production & Business Activity (32455)
- Prices (32455)
- International Data (32263)
- U.S. Regional Data (3008)
- Academic Data (33060)

---

## fred/category

Get a category.

**URL:** `https://api.stlouisfed.org/fred/category`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category_id` | integer | 0 | Category ID; 0 = root |
| `file_type` | string | xml | xml or json |

### Example

```python
# Get root category
response = requests.get(
    "https://api.stlouisfed.org/fred/category",
    params={
        "api_key": API_KEY,
        "category_id": 0,
        "file_type": "json"
    }
)

# Get Trade Balance category
response = requests.get(
    "https://api.stlouisfed.org/fred/category",
    params={
        "api_key": API_KEY,
        "category_id": 125,
        "file_type": "json"
    }
)
```

### Response

```json
{
  "categories": [
    {
      "id": 125,
      "name": "Trade Balance",
      "parent_id": 13
    }
  ]
}
```

---

## fred/category/children

Get child categories for a category.

**URL:** `https://api.stlouisfed.org/fred/category/children`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category_id` | integer | 0 | Parent category ID |
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |

### Example

```python
# Get children of International Trade category (13)
response = requests.get(
    "https://api.stlouisfed.org/fred/category/children",
    params={
        "api_key": API_KEY,
        "category_id": 13,
        "file_type": "json"
    }
)
```

### Response

```json
{
  "categories": [
    {"id": 16, "name": "Exports", "parent_id": 13},
    {"id": 17, "name": "Imports", "parent_id": 13},
    {"id": 3000, "name": "Income Payments & Receipts", "parent_id": 13},
    {"id": 125, "name": "Trade Balance", "parent_id": 13},
    {"id": 127, "name": "U.S. International Finance", "parent_id": 13}
  ]
}
```

---

## fred/category/related

Get related categories for a category.

**URL:** `https://api.stlouisfed.org/fred/category/related`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `category_id` | integer | Category ID |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |

**Note:** Related categories represent one-way relationships that exist outside the standard parent-child hierarchy. Most categories do not have related categories.

### Example

```python
response = requests.get(
    "https://api.stlouisfed.org/fred/category/related",
    params={
        "api_key": API_KEY,
        "category_id": 32073,
        "file_type": "json"
    }
)
```

### Response

```json
{
  "categories": [
    {"id": 149, "name": "Arkansas", "parent_id": 27281},
    {"id": 150, "name": "Illinois", "parent_id": 27281}
  ]
}
```

---

## fred/category/series

Get the series in a category.

**URL:** `https://api.stlouisfed.org/fred/category/series`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `category_id` | integer | Category ID |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_id | Sort field |
| `sort_order` | string | asc | asc or desc |
| `filter_variable` | string | - | frequency, units, seasonal_adjustment |
| `filter_value` | string | - | Filter value |
| `tag_names` | string | - | Semicolon-delimited tags |
| `exclude_tag_names` | string | - | Tags to exclude |

### Order By Options

- `series_id`
- `title`
- `units`
- `frequency`
- `seasonal_adjustment`
- `realtime_start`
- `realtime_end`
- `last_updated`
- `observation_start`
- `observation_end`
- `popularity`
- `group_popularity`

### Example

```python
# Get series in Trade Balance category with monthly frequency
response = requests.get(
    "https://api.stlouisfed.org/fred/category/series",
    params={
        "api_key": API_KEY,
        "category_id": 125,
        "file_type": "json",
        "filter_variable": "frequency",
        "filter_value": "Monthly",
        "order_by": "popularity",
        "sort_order": "desc",
        "limit": 10
    }
)
```

### Response

```json
{
  "count": 156,
  "offset": 0,
  "limit": 10,
  "seriess": [
    {
      "id": "BOPGSTB",
      "title": "Trade Balance: Goods and Services, Balance of Payments Basis",
      "observation_start": "1992-01-01",
      "observation_end": "2023-06-01",
      "frequency": "Monthly",
      "units": "Millions of Dollars",
      "seasonal_adjustment": "Seasonally Adjusted",
      "popularity": 78
    }
  ]
}
```

---

## fred/category/tags

Get the tags for a category.

**URL:** `https://api.stlouisfed.org/fred/category/tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `category_id` | integer | Category ID |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `tag_names` | string | - | Semicolon-delimited tags |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src |
| `search_text` | string | - | Search tag names |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | series_count, popularity, created, name, group_id |
| `sort_order` | string | asc | asc or desc |

### Tag Group IDs

| ID | Description |
|----|-------------|
| freq | Frequency |
| gen | General |
| geo | Geography |
| geot | Geography Type |
| rls | Release |
| seas | Seasonal Adjustment |
| src | Source |

### Example

```python
# Get frequency tags for Trade Balance category
response = requests.get(
    "https://api.stlouisfed.org/fred/category/tags",
    params={
        "api_key": API_KEY,
        "category_id": 125,
        "file_type": "json",
        "tag_group_id": "freq"
    }
)
```

### Response

```json
{
  "tags": [
    {"name": "monthly", "group_id": "freq", "series_count": 100},
    {"name": "quarterly", "group_id": "freq", "series_count": 45},
    {"name": "annual", "group_id": "freq", "series_count": 30}
  ]
}
```

---

## fred/category/related_tags

Get related tags for a category.

**URL:** `https://api.stlouisfed.org/fred/category/related_tags`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | string | 32-character API key |
| `category_id` | integer | Category ID |
| `tag_names` | string | Semicolon-delimited tag names |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file_type` | string | xml | xml or json |
| `realtime_start` | date | today | YYYY-MM-DD |
| `realtime_end` | date | today | YYYY-MM-DD |
| `exclude_tag_names` | string | - | Tags to exclude |
| `tag_group_id` | string | - | freq, gen, geo, geot, rls, seas, src |
| `search_text` | string | - | Search tag names |
| `limit` | integer | 1000 | 1-1000 |
| `offset` | integer | 0 | Pagination offset |
| `order_by` | string | series_count | Ordering field |
| `sort_order` | string | asc | asc or desc |

### Example

```python
# Get tags related to 'services' and 'quarterly' in Trade Balance category
response = requests.get(
    "https://api.stlouisfed.org/fred/category/related_tags",
    params={
        "api_key": API_KEY,
        "category_id": 125,
        "tag_names": "services;quarterly",
        "file_type": "json"
    }
)
```

---

## Common Category IDs

| ID | Name |
|----|------|
| 0 | Root (all categories) |
| 32991 | Money, Banking, & Finance |
| 10 | Population, Employment, & Labor Markets |
| 32992 | National Accounts |
| 1 | Production & Business Activity |
| 32455 | Prices |
| 32263 | International Data |
| 3008 | U.S. Regional Data |
| 33060 | Academic Data |
| 53 | Gross Domestic Product |
| 33490 | Interest Rates |
| 32145 | Exchange Rates |
| 12 | Consumer Price Indexes (CPI) |
| 2 | Unemployment |

## Navigating Categories

```python
def get_category_tree(api_key, category_id=0, depth=0, max_depth=2):
    """Recursively get category tree."""
    if depth > max_depth:
        return None

    # Get children
    response = requests.get(
        "https://api.stlouisfed.org/fred/category/children",
        params={
            "api_key": api_key,
            "category_id": category_id,
            "file_type": "json"
        }
    )
    data = response.json()

    tree = []
    for cat in data.get("categories", []):
        node = {
            "id": cat["id"],
            "name": cat["name"],
            "children": get_category_tree(api_key, cat["id"], depth + 1, max_depth)
        }
        tree.append(node)

    return tree

# Get first 2 levels of category tree
tree = get_category_tree(API_KEY, depth=0, max_depth=1)
```
