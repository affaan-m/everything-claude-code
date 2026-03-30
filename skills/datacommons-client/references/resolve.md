# Resolve Endpoint - Entity Identification

## Purpose

The Resolve API identifies Data Commons IDs (DCIDs) for entities in the knowledge graph. DCIDs are required for most queries in the Data Commons API, so resolution is typically the first step in any workflow.

## Key Capabilities

The endpoint currently supports **place entities only** and allows resolution through multiple methods:
- **By name**: Search using descriptive terms like "San Francisco, CA"
- **By Wikidata ID**: Lookup using external identifiers (e.g., "Q30" for USA)
- **By coordinates**: Locate places via latitude/longitude
- **By relation expressions**: Advanced searches using synthetic attributes

## Available Methods

### 1. fetch()

General resolution using relation expressions—most flexible method.

**Parameters:**
- `nodes`: List of search terms or identifiers
- `property`: Property to search (e.g., "name", "wikidataId")

**Example Usage:**
```python
from datacommons_client import DataCommonsClient

client = DataCommonsClient()

# Resolve by name
response = client.resolve.fetch(
    nodes=["California", "Texas"],
    property="name"
)
```

### 2. fetch_dcids_by_name()

Name-based lookup with optional type filtering—most commonly used method.

**Parameters:**
- `names`: List of place names to resolve
- `entity_type`: Optional type filter (e.g., "City", "State", "County")

**Returns:** `ResolveResponse` object with candidates for each name

**Example Usage:**
```python
# Basic name resolution
response = client.resolve.fetch_dcids_by_name(
    names=["San Francisco, CA", "Los Angeles"]
)

# With type filtering
response = client.resolve.fetch_dcids_by_name(
    names=["San Francisco"],
    entity_type="City"
)

# Access results
for name, result in response.to_dict().items():
    print(f"{name}: {result['candidates']}")
```

### 3. fetch_dcids_by_wikidata_id()

Wikidata ID resolution for entities with known Wikidata identifiers.

**Parameters:**
- `wikidata_ids`: List of Wikidata IDs (e.g., "Q30", "Q99")

**Example Usage:**
```python
# Resolve Wikidata IDs
response = client.resolve.fetch_dcids_by_wikidata_id(
    wikidata_ids=["Q30", "Q99"]  # USA and California
)
```

### 4. fetch_dcid_by_coordinates()

Geographic coordinate lookup to find the place at specific lat/long coordinates.

**Parameters:**
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate

**Returns:** Single DCID string for the place at those coordinates

**Example Usage:**
```python
# Find place at coordinates
dcid = client.resolve.fetch_dcid_by_coordinates(
    latitude=37.7749,
    longitude=-122.4194
)
# Returns DCID for San Francisco
```

## Response Structure

All methods (except `fetch_dcid_by_coordinates`) return a `ResolveResponse` object containing:
- **node**: The search term provided
- **candidates**: List of matching DCIDs with optional metadata
  - Each candidate may include `dominantType` field for disambiguation
- **Helper methods**:
  - `to_dict()`: Full response as dictionary
  - `to_json()`: JSON string format
  - `to_flat_dict()`: Simplified format with just DCIDs

**Example Response:**
```python
response = client.resolve.fetch_dcids_by_name(names=["Springfield"])

# May return multiple candidates since many cities named Springfield exist
# {
#   "Springfield": {
#     "candidates": [
#       {"dcid": "geoId/1767000", "dominantType": "City"},  # Springfield, IL
#       {"dcid": "geoId/2567000", "dominantType": "City"},  # Springfield, MA
#       ...
#     ]
#   }
# }
```

## Common Use Cases

### Use Case 1: Resolve Place Names Before Querying

Most workflows start by resolving names to DCIDs:
```python
# Step 1: Resolve names
resolve_response = client.resolve.fetch_dcids_by_name(
    names=["California", "Texas"]
)

# Step 2: Extract DCIDs
dcids = []
for name, result in resolve_response.to_dict().items():
    if result["candidates"]:
        dcids.append(result["candidates"][0]["dcid"])

# Step 3: Query data using DCIDs
data_response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=dcids,
    date="latest"
)
```

### Use Case 2: Handle Ambiguous Names

When multiple candidates exist, use `dominantType` or be more specific:
```python
# Ambiguous name
response = client.resolve.fetch_dcids_by_name(names=["Springfield"])
candidates = response.to_dict()["Springfield"]["candidates"]

# Filter by type or choose based on context
city_candidates = [c for c in candidates if c.get("dominantType") == "City"]

# Or be more specific in the query
response = client.resolve.fetch_dcids_by_name(
    names=["Springfield, Illinois"],
    entity_type="City"
)
```

### Use Case 3: Batch Resolution

Resolve multiple entities efficiently:
```python
places = [
    "San Francisco, CA",
    "Los Angeles, CA",
    "San Diego, CA",
    "Sacramento, CA"
]

response = client.resolve.fetch_dcids_by_name(names=places)

# Build mapping of name to DCID
name_to_dcid = {}
for name, result in response.to_dict().items():
    if result["candidates"]:
        name_to_dcid[name] = result["candidates"][0]["dcid"]
```

### Use Case 4: Coordinate-Based Queries

Find the administrative place for a location:
```python
# User provides coordinates, find the place
latitude, longitude = 37.7749, -122.4194
dcid = client.resolve.fetch_dcid_by_coordinates(
    latitude=latitude,
    longitude=longitude
)

# Now query data for that place
response = client.observation.fetch(
    variable_dcids=["Count_Person", "MedianIncome_Household"],
    entity_dcids=[dcid],
    date="latest"
)
```

### Use Case 5: External ID Integration

When working with external datasets that use Wikidata IDs:
```python
# External dataset has Wikidata IDs
wikidata_ids = ["Q30", "Q99", "Q1384"]  # USA, California, New York

# Convert to Data Commons DCIDs
response = client.resolve.fetch_dcids_by_wikidata_id(
    wikidata_ids=wikidata_ids
)

# Extract DCIDs for further queries
dcids = []
for wid, result in response.to_dict().items():
    if result["candidates"]:
        dcids.append(result["candidates"][0]["dcid"])
```

## Important Limitations

1. **Place entities only**: The Resolve API currently supports only place entities (countries, states, cities, counties, etc.). For other entity types, DCIDs must be obtained through other means (e.g., Node API exploration).

2. **Cannot resolve linked entity properties**: For queries involving relationships like `containedInPlace`, use the Node API instead.

3. **Ambiguity handling**: When multiple candidates exist, the API returns all matches. The application must decide which is correct based on context or additional filtering.

## Best Practices

1. **Always resolve names first**: Never assume DCID format—always use the Resolve API
2. **Cache resolutions**: If querying the same places repeatedly, cache name→DCID mappings
3. **Handle ambiguity**: Check for multiple candidates and use `entity_type` filtering or more specific names
4. **Validate results**: Always check that `candidates` list is not empty before accessing DCIDs
5. **Use appropriate method**:
   - Names → `fetch_dcids_by_name()`
   - Coordinates → `fetch_dcid_by_coordinates()`
   - Wikidata IDs → `fetch_dcids_by_wikidata_id()`
