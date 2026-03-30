# Observation Endpoint - Statistical Data Queries

## Purpose

The Observation API retrieves statistical observations—data points linking entities, variables, and specific dates. Examples include:
- "USA population in 2020"
- "California GDP over time"
- "Unemployment rate for all counties in a state"

## Core Methods

### 1. fetch()

Primary method for retrieving observations with flexible entity specification.

**Key Parameters:**
- `variable_dcids` (required): List of statistical variable identifiers
- `entity_dcids` or `entity_expression` (required): Specify entities by ID or relation expression
- `date` (optional): Defaults to "latest". Accepts:
  - ISO-8601 format (e.g., "2020", "2020-01", "2020-01-15")
  - "all" for complete time series
  - "latest" for most recent data
- `select` (optional): Controls returned fields
  - Default: `["date", "entity", "variable", "value"]`
  - Alternative: `["entity", "variable", "facet"]` to check availability without data
- `filter_facet_domains`: Filter by data source domain
- `filter_facet_ids`: Filter by specific facet IDs

**Response Structure:**
Data organized hierarchically by variable → entity, with metadata about "facets" (data sources) including:
- Provenance URLs
- Measurement methods
- Observation periods
- Import names

**Example Usage:**
```python
from datacommons_client import DataCommonsClient

client = DataCommonsClient()

# Get latest population for multiple entities
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=["geoId/06", "geoId/48"],  # California and Texas
    date="latest"
)

# Get complete time series
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=["country/USA"],
    date="all"
)

# Use relation expressions to query hierarchies
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_expression="geoId/06<-containedInPlace+{typeOf:County}",
    date="2020"
)
```

### 2. fetch_available_statistical_variables()

Discovers which statistical variables contain data for given entities.

**Input:** Entity DCIDs only
**Output:** Dictionary of available variables organized by entity

**Example Usage:**
```python
# Check what variables are available for California
available = client.observation.fetch_available_statistical_variables(
    entity_dcids=["geoId/06"]
)
```

### 3. fetch_observations_by_entity_dcid()

Explicit method targeting specific entities by DCID (functionally equivalent to `fetch()` with entity_dcids).

### 4. fetch_observations_by_entity_type()

Retrieves observations for multiple entities grouped by parent and type—useful for querying all countries in a region or all counties within a state.

**Parameters:**
- `parent_entity`: Parent entity DCID
- `entity_type`: Type of child entities
- `variable_dcids`: Statistical variables to query
- `date`: Time specification
- `select` and filter options

**Example Usage:**
```python
# Get population for all counties in California
response = client.observation.fetch_observations_by_entity_type(
    parent_entity="geoId/06",
    entity_type="County",
    variable_dcids=["Count_Person"],
    date="2020"
)
```

## Response Object Methods

All response objects support:
- `to_json()`: Format as JSON string
- `to_dict()`: Return as dictionary
- `get_data_by_entity()`: Reorganize by entity instead of variable
- `to_observations_as_records()`: Flatten into individual records

## Common Use Cases

### Use Case 1: Check Data Availability Before Querying

Use `select=["entity", "variable"]` to confirm entities have observations without retrieving actual data:
```python
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=["geoId/06"],
    select=["entity", "variable"]
)
```

### Use Case 2: Access Complete Time Series

Request `date="all"` to obtain complete historical observations for trend analysis:
```python
response = client.observation.fetch(
    variable_dcids=["Count_Person", "UnemploymentRate_Person"],
    entity_dcids=["country/USA"],
    date="all"
)
```

### Use Case 3: Filter by Data Source

Specify `filter_facet_domains` to retrieve data from specific sources for consistency:
```python
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=["country/USA"],
    filter_facet_domains=["census.gov"]
)
```

### Use Case 4: Query Hierarchical Relationships

Use relation expressions to fetch observations for related entities:
```python
# Get data for all counties within California
response = client.observation.fetch(
    variable_dcids=["MedianIncome_Household"],
    entity_expression="geoId/06<-containedInPlace+{typeOf:County}",
    date="2020"
)
```

## Working with Pandas

The API integrates seamlessly with Pandas. Install with Pandas support:
```bash
pip install "datacommons-client[Pandas]"
```

Response objects can be converted to DataFrames for analysis:
```python
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=["geoId/06", "geoId/48"],
    date="all"
)

# Convert to DataFrame
df = response.to_observations_as_records()
# Returns DataFrame with columns: date, entity, variable, value
```

## Important Notes

- **facets** represent data sources and include provenance metadata
- **orderedFacets** are sorted by reliability/recency
- Use relation expressions for complex graph queries
- The `fetch()` method is the most flexible—use it for most queries
