# Saved Searches

## Retrieving Saved Searches

```python
# Get all saved search metadata (not results)
searches = zot.searches()
# Returns list of dicts with name, key, conditions, version

for search in searches:
    print(search['data']['name'], search['data']['key'])
```

**Note**: Saved search *results* cannot be retrieved via the API (as of 2025). Only metadata is returned.

## Creating Saved Searches

Each condition dict must have `condition`, `operator`, and `value`:

```python
conditions = [
    {
        'condition': 'title',
        'operator': 'contains',
        'value': 'machine learning'
    }
]
zot.saved_search('ML Papers', conditions)
```

### Multiple Conditions (AND logic)

```python
conditions = [
    {'condition': 'itemType', 'operator': 'is', 'value': 'journalArticle'},
    {'condition': 'tag', 'operator': 'is', 'value': 'unread'},
    {'condition': 'date', 'operator': 'isAfter', 'value': '2023-01-01'},
]
zot.saved_search('Recent Unread Articles', conditions)
```

## Deleting Saved Searches

```python
# Get search keys first
searches = zot.searches()
keys = [s['data']['key'] for s in searches if s['data']['name'] == 'Old Search']
zot.delete_saved_search(keys)
```

## Discovering Valid Operators and Conditions

```python
# All available operators
operators = zot.show_operators()

# All available conditions
conditions = zot.show_conditions()

# Operators valid for a specific condition
title_operators = zot.show_condition_operators('title')
# e.g. ['is', 'isNot', 'contains', 'doesNotContain', 'beginsWith']
```

## Common Condition/Operator Combinations

| Condition | Common Operators |
|-----------|-----------------|
| `title` | `contains`, `doesNotContain`, `is`, `beginsWith` |
| `tag` | `is`, `isNot` |
| `itemType` | `is`, `isNot` |
| `date` | `isBefore`, `isAfter`, `is` |
| `creator` | `contains`, `is` |
| `publicationTitle` | `contains`, `is` |
| `year` | `is`, `isBefore`, `isAfter` |
| `collection` | `is`, `isNot` |
| `fulltextContent` | `contains` |
