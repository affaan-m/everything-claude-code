# Node Endpoint - Knowledge Graph Exploration

## Purpose

The Node endpoint retrieves property relationships and values from the Data Commons knowledge graph. It returns information about directed edges (properties) connecting nodes, enabling discovery of connections within the graph structure.

## Core Capabilities

The Node API performs three primary functions:
1. Retrieve property labels associated with nodes
2. Obtain values for specific properties across nodes
3. Discover all connected nodes linked through relationships

## Available Methods

### 1. fetch()

Retrieve properties using relation expressions with arrow notation.

**Key Parameters:**
- `node_dcids`: Target node identifier(s)
- `expression`: Relation syntax using arrows (`->`, `<-`, `<-*`)
- `all_pages`: Enable pagination (default: True)
- `next_token`: Continue paginated results

**Arrow Notation:**
- `->`: Outgoing property (from node to value)
- `<-`: Incoming property (from value to node)
- `<-*`: Multi-hop incoming traversal

**Example Usage:**
```python
from datacommons_client import DataCommonsClient

client = DataCommonsClient()

# Get outgoing properties from California
response = client.node.fetch(
    node_dcids=["geoId/06"],
    expression="->name"
)

# Get incoming properties (what points to this node)
response = client.node.fetch(
    node_dcids=["geoId/06"],
    expression="<-containedInPlace"
)
```

### 2. fetch_property_labels()

Get property labels without retrieving values—useful for discovering what properties exist.

**Parameters:**
- `node_dcids`: Node identifier(s)
- `out`: Boolean—True for outgoing properties, False for incoming

**Example Usage:**
```python
# Get all outgoing property labels for California
labels = client.node.fetch_property_labels(
    node_dcids=["geoId/06"],
    out=True
)

# Get all incoming property labels
labels = client.node.fetch_property_labels(
    node_dcids=["geoId/06"],
    out=False
)
```

### 3. fetch_property_values()

Obtain specific property values with optional filters.

**Parameters:**
- `node_dcids`: Node identifier(s)
- `property`: Property name to query
- `out`: Direction (True for outgoing, False for incoming)
- `limit`: Maximum number of values to return

**Example Usage:**
```python
# Get name property for California
values = client.node.fetch_property_values(
    node_dcids=["geoId/06"],
    property="name",
    out=True
)
```

### 4. fetch_all_classes()

List all entity types (Class nodes) in the Data Commons graph.

**Example Usage:**
```python
classes = client.node.fetch_all_classes()
```

### 5. fetch_entity_names()

Look up entity names by DCID in selected languages.

**Parameters:**
- `node_dcids`: Entity identifier(s)
- `language`: Language code (default: "en")

**Example Usage:**
```python
names = client.node.fetch_entity_names(
    node_dcids=["geoId/06", "country/USA"],
    language="en"
)
# Returns: {"geoId/06": "California", "country/USA": "United States"}
```

### 6. Place Hierarchy Methods

These methods navigate geographic relationships:

#### fetch_place_children()
Get direct child places.

**Example Usage:**
```python
# Get all states in USA
children = client.node.fetch_place_children(
    node_dcids=["country/USA"]
)
```

#### fetch_place_descendants()
Retrieve full child hierarchies (recursive).

**Example Usage:**
```python
# Get all descendants of California (counties, cities, etc.)
descendants = client.node.fetch_place_descendants(
    node_dcids=["geoId/06"]
)
```

#### fetch_place_parents()
Get direct parent places.

**Example Usage:**
```python
# Get parent of San Francisco
parents = client.node.fetch_place_parents(
    node_dcids=["geoId/0667000"]
)
```

#### fetch_place_ancestors()
Retrieve complete parent lineages.

**Example Usage:**
```python
# Get all ancestors of San Francisco (CA, USA, etc.)
ancestors = client.node.fetch_place_ancestors(
    node_dcids=["geoId/0667000"]
)
```

### 7. fetch_statvar_constraints()

Access constraint properties for statistical variables—useful for understanding variable definitions and constraints.

**Example Usage:**
```python
constraints = client.node.fetch_statvar_constraints(
    node_dcids=["Count_Person"]
)
```

## Response Format

Methods return either:
- **NodeResponse objects** with `.to_dict()`, `.to_json()`, and `.nextToken` properties
- **Dictionaries** for entity names and place hierarchy methods

## Pagination

For large responses:
1. Set `all_pages=False` to receive data in chunks
2. Response includes a `nextToken` value
3. Re-query using that token to fetch subsequent pages

**Example:**
```python
# First page
response = client.node.fetch(
    node_dcids=["country/USA"],
    expression="<-containedInPlace",
    all_pages=False
)

# Get next page if available
if response.nextToken:
    next_response = client.node.fetch(
        node_dcids=["country/USA"],
        expression="<-containedInPlace",
        next_token=response.nextToken
    )
```

## Common Use Cases

### Use Case 1: Explore Available Properties

```python
# Discover what properties an entity has
labels = client.node.fetch_property_labels(
    node_dcids=["geoId/06"],
    out=True
)
print(labels)  # Shows all outgoing properties like 'name', 'latitude', etc.
```

### Use Case 2: Navigate Geographic Hierarchies

```python
# Get all counties in California
counties = client.node.fetch_place_children(
    node_dcids=["geoId/06"]
)

# Filter for specific type if needed
county_dcids = [child for child in counties["geoId/06"]
                if "County" in child]
```

### Use Case 3: Build Entity Relationships

```python
# Find all entities that reference a specific node
references = client.node.fetch(
    node_dcids=["geoId/06"],
    expression="<-location"
)
```

## Important Notes

- Use `fetch_property_labels()` first to discover available properties
- The Node API cannot resolve complex relation expressions—use simpler expressions or break into multiple queries
- For linked entity properties with arc relationships, combine Node API queries with Observation API
- Place hierarchy methods return dictionaries, not NodeResponse objects
