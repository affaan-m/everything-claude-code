# Getting Started with Data Commons

## Quick Start Guide

This guide provides end-to-end examples for common Data Commons workflows.

## Installation and Setup

```bash
# Install with Pandas support
pip install "datacommons-client[Pandas]"

# Set up API key for datacommons.org
export DC_API_KEY="your_api_key_here"
```

Request an API key at: https://apikeys.datacommons.org/

## Example 1: Basic Population Query

Query current population for specific places:

```python
from datacommons_client import DataCommonsClient

# Initialize client
client = DataCommonsClient()

# Step 1: Resolve place names to DCIDs
places = ["California", "Texas", "New York"]
resolve_response = client.resolve.fetch_dcids_by_name(
    names=places,
    entity_type="State"
)

# Extract DCIDs
dcids = []
for name, result in resolve_response.to_dict().items():
    if result["candidates"]:
        dcids.append(result["candidates"][0]["dcid"])
        print(f"{name}: {result['candidates'][0]['dcid']}")

# Step 2: Query population data
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=dcids,
    date="latest"
)

# Step 3: Display results
data = response.to_dict()
for variable, entities in data.items():
    for entity, observations in entities.items():
        for obs in observations:
            print(f"{entity}: {obs['value']:,} people ({obs['date']})")
```

## Example 2: Time Series Analysis

Retrieve and plot historical unemployment rates:

```python
import pandas as pd
import matplotlib.pyplot as plt

client = DataCommonsClient()

# Query unemployment rate over time
response = client.observation.fetch(
    variable_dcids=["UnemploymentRate_Person"],
    entity_dcids=["country/USA"],
    date="all"  # Get all historical data
)

# Convert to DataFrame
df = response.to_observations_as_records()

# Plot
df = df.sort_values('date')
plt.figure(figsize=(12, 6))
plt.plot(df['date'], df['value'])
plt.title('US Unemployment Rate Over Time')
plt.xlabel('Year')
plt.ylabel('Unemployment Rate (%)')
plt.grid(True)
plt.show()
```

## Example 3: Geographic Hierarchy Query

Get data for all counties within a state:

```python
client = DataCommonsClient()

# Query median income for all California counties
response = client.observation.fetch(
    variable_dcids=["Median_Income_Household"],
    entity_expression="geoId/06<-containedInPlace+{typeOf:County}",
    date="2020"
)

# Convert to DataFrame and sort
df = response.to_observations_as_records()

# Get county names
county_dcids = df['entity'].unique().tolist()
names = client.node.fetch_entity_names(node_dcids=county_dcids)

# Add names to dataframe
df['name'] = df['entity'].map(names)

# Display top 10 by income
top_counties = df.nlargest(10, 'value')[['name', 'value']]
print("\nTop 10 California Counties by Median Household Income:")
for idx, row in top_counties.iterrows():
    print(f"{row['name']}: ${row['value']:,.0f}")
```

## Example 4: Multi-Variable Comparison

Compare multiple statistics across entities:

```python
import pandas as pd

client = DataCommonsClient()

# Define places
places = ["California", "Texas", "Florida", "New York"]
resolve_response = client.resolve.fetch_dcids_by_name(names=places)

dcids = []
name_map = {}
for name, result in resolve_response.to_dict().items():
    if result["candidates"]:
        dcid = result["candidates"][0]["dcid"]
        dcids.append(dcid)
        name_map[dcid] = name

# Query multiple variables
variables = [
    "Count_Person",
    "Median_Income_Household",
    "UnemploymentRate_Person",
    "Median_Age_Person"
]

response = client.observation.fetch(
    variable_dcids=variables,
    entity_dcids=dcids,
    date="latest"
)

# Convert to DataFrame
df = response.to_observations_as_records()

# Add readable names
df['state'] = df['entity'].map(name_map)

# Pivot for comparison
pivot = df.pivot_table(
    values='value',
    index='state',
    columns='variable'
)

print("\nState Comparison:")
print(pivot.to_string())
```

## Example 5: Coordinate-Based Query

Find and query data for a location by coordinates:

```python
client = DataCommonsClient()

# User provides coordinates (e.g., from GPS)
latitude, longitude = 37.7749, -122.4194  # San Francisco

# Step 1: Resolve coordinates to place
dcid = client.resolve.fetch_dcid_by_coordinates(
    latitude=latitude,
    longitude=longitude
)

# Step 2: Get place name
name = client.node.fetch_entity_names(node_dcids=[dcid])
print(f"Location: {name[dcid]}")

# Step 3: Check available variables
available_vars = client.observation.fetch_available_statistical_variables(
    entity_dcids=[dcid]
)

print(f"\nAvailable variables: {len(available_vars[dcid])} found")
print("First 10:", list(available_vars[dcid])[:10])

# Step 4: Query specific variables
response = client.observation.fetch(
    variable_dcids=["Count_Person", "Median_Income_Household"],
    entity_dcids=[dcid],
    date="latest"
)

# Display results
df = response.to_observations_as_records()
print("\nStatistics:")
for _, row in df.iterrows():
    print(f"{row['variable']}: {row['value']}")
```

## Example 6: Data Source Filtering

Query data from specific sources for consistency:

```python
client = DataCommonsClient()

# Query with facet filtering
response = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=["country/USA"],
    date="all",
    filter_facet_domains=["census.gov"]  # Only US Census data
)

df = response.to_observations_as_records()
print(f"Found {len(df)} observations from census.gov")

# Compare with all sources
response_all = client.observation.fetch(
    variable_dcids=["Count_Person"],
    entity_dcids=["country/USA"],
    date="all"
)

df_all = response_all.to_observations_as_records()
print(f"Found {len(df_all)} observations from all sources")
```

## Example 7: Exploring the Knowledge Graph

Discover entity properties and relationships:

```python
client = DataCommonsClient()

# Step 1: Explore what properties exist
entity = "geoId/06"  # California

# Get outgoing properties
out_props = client.node.fetch_property_labels(
    node_dcids=[entity],
    out=True
)

print(f"Outgoing properties for California:")
print(out_props[entity])

# Get incoming properties
in_props = client.node.fetch_property_labels(
    node_dcids=[entity],
    out=False
)

print(f"\nIncoming properties for California:")
print(in_props[entity])

# Step 2: Get specific property values
name_response = client.node.fetch_property_values(
    node_dcids=[entity],
    property="name",
    out=True
)

print(f"\nName property value:")
print(name_response.to_dict())

# Step 3: Explore hierarchy
children = client.node.fetch_place_children(node_dcids=[entity])
print(f"\nNumber of child places: {len(children[entity])}")

# Get names for first 5 children
if children[entity]:
    child_sample = children[entity][:5]
    child_names = client.node.fetch_entity_names(node_dcids=child_sample)
    print("\nSample child places:")
    for dcid, name in child_names.items():
        print(f"  {name}")
```

## Example 8: Batch Processing Multiple Queries

Efficiently query data for many entities:

```python
import pandas as pd

client = DataCommonsClient()

# List of cities to analyze
cities = [
    "San Francisco, CA",
    "Los Angeles, CA",
    "San Diego, CA",
    "Sacramento, CA",
    "San Jose, CA"
]

# Resolve all cities
resolve_response = client.resolve.fetch_dcids_by_name(
    names=cities,
    entity_type="City"
)

# Build mapping
city_dcids = []
dcid_to_name = {}
for name, result in resolve_response.to_dict().items():
    if result["candidates"]:
        dcid = result["candidates"][0]["dcid"]
        city_dcids.append(dcid)
        dcid_to_name[dcid] = name

# Query multiple variables at once
variables = [
    "Count_Person",
    "Median_Income_Household",
    "UnemploymentRate_Person"
]

response = client.observation.fetch(
    variable_dcids=variables,
    entity_dcids=city_dcids,
    date="latest"
)

# Process into a comparison table
df = response.to_observations_as_records()
df['city'] = df['entity'].map(dcid_to_name)

# Create comparison table
comparison = df.pivot_table(
    values='value',
    index='city',
    columns='variable',
    aggfunc='first'
)

print("\nCalifornia Cities Comparison:")
print(comparison.to_string())

# Export to CSV
comparison.to_csv('ca_cities_comparison.csv')
print("\nData exported to ca_cities_comparison.csv")
```

## Common Patterns Summary

### Pattern 1: Name → DCID → Data
```python
names = ["California"]
dcids = resolve_names(names)
data = query_observations(dcids, variables)
```

### Pattern 2: Coordinates → DCID → Data
```python
dcid = resolve_coordinates(lat, lon)
data = query_observations([dcid], variables)
```

### Pattern 3: Parent → Children → Data
```python
children = get_place_children(parent_dcid)
data = query_observations(children, variables)
```

### Pattern 4: Explore → Select → Query
```python
available_vars = check_available_variables(dcids)
selected_vars = filter_relevant(available_vars)
data = query_observations(dcids, selected_vars)
```

## Error Handling Best Practices

```python
client = DataCommonsClient()

# Always check for candidates
resolve_response = client.resolve.fetch_dcids_by_name(names=["Unknown Place"])
result = resolve_response.to_dict()["Unknown Place"]

if not result["candidates"]:
    print("No matches found - try a more specific name")
    # Handle error appropriately
else:
    dcid = result["candidates"][0]["dcid"]
    # Proceed with query

# Check for multiple candidates (ambiguity)
if len(result["candidates"]) > 1:
    print(f"Multiple matches found: {len(result['candidates'])}")
    for candidate in result["candidates"]:
        print(f"  {candidate['dcid']} ({candidate.get('dominantType', 'N/A')})")
    # Let user select or use additional filtering
```

## Next Steps

1. Explore available statistical variables: https://datacommons.org/tools/statvar
2. Browse the knowledge graph: https://datacommons.org/browser/
3. Read detailed endpoint documentation in `references/` directory
4. Check official documentation: https://docs.datacommons.org/api/python/v2/
