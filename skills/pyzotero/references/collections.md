# Collection Management

## Reading Collections

```python
# All collections (flat list including nested)
all_cols = zot.collections()

# Only top-level collections
top_cols = zot.collections_top()

# Specific collection
col = zot.collection('COLKEY')

# Sub-collections of a collection
sub_cols = zot.collections_sub('COLKEY')

# All collections under a given collection (recursive)
tree = zot.all_collections('COLKEY')
# Or all collections in the library:
tree = zot.all_collections()
```

## Collection Data Structure

```python
col = zot.collection('5TSDXJG6')
name = col['data']['name']
key = col['data']['key']
parent = col['data']['parentCollection']  # False if top-level, else parent key
version = col['data']['version']
n_items = col['meta']['numItems']
n_sub_collections = col['meta']['numCollections']
```

## Creating Collections

```python
# Create a top-level collection
zot.create_collections([{'name': 'My New Collection'}])

# Create a nested collection
zot.create_collections([{
    'name': 'Sub-Collection',
    'parentCollection': 'PARENTCOLKEY'
}])

# Create multiple at once
zot.create_collections([
    {'name': 'Collection A'},
    {'name': 'Collection B'},
    {'name': 'Sub-B', 'parentCollection': 'BKEY'},
])
```

## Updating Collections

```python
cols = zot.collections()
# Rename the first collection
cols[0]['data']['name'] = 'Renamed Collection'
zot.update_collection(cols[0])

# Update multiple collections (auto-chunked at 50)
zot.update_collections(cols)
```

## Deleting Collections

```python
# Delete a single collection
col = zot.collection('COLKEY')
zot.delete_collection(col)

# Delete multiple collections
cols = zot.collections()
zot.delete_collection(cols)  # pass a list of dicts
```

## Managing Items in Collections

```python
# Add an item to a collection
item = zot.item('ITEMKEY')
zot.addto_collection('COLKEY', item)

# Remove an item from a collection
zot.deletefrom_collection('COLKEY', item)

# Get all items in a collection
items = zot.collection_items('COLKEY')

# Get only top-level items in a collection
top_items = zot.collection_items_top('COLKEY')

# Count items in a collection
n = zot.num_collectionitems('COLKEY')

# Get tags in a collection
tags = zot.collection_tags('COLKEY')
```

## Find Collection Key by Name

```python
def find_collection(zot, name):
    for col in zot.everything(zot.collections()):
        if col['data']['name'] == name:
            return col['data']['key']
    return None

key = find_collection(zot, 'Machine Learning Papers')
```
