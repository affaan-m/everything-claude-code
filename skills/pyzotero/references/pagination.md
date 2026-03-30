# Pagination: follow(), everything(), Generators

Pyzotero returns 100 items by default. Use these methods to retrieve more.

## everything() — Retrieve All Results

The simplest way to get all items:

```python
# All items in the library
all_items = zot.everything(zot.items())

# All top-level items
all_top = zot.everything(zot.top())

# All items in a collection
all_col = zot.everything(zot.collection_items('COLKEY'))

# All items matching a search
all_results = zot.everything(zot.items(q='machine learning', itemType='journalArticle'))
```

`everything()` works with all Read API calls that can return multiple items.

## follow() — Sequential Pagination

```python
# Retrieve items in batches, manually advancing the page
first_batch = zot.top(limit=25)
second_batch = zot.follow()   # next 25 items
third_batch = zot.follow()    # next 25 items
```

**Warning**: `follow()` raises `StopIteration` when no more items are available. Not valid after single-item calls like `zot.item()`.

## iterfollow() — Generator

```python
# Create a generator over follow()
first = zot.top(limit=10)
lazy = zot.iterfollow()

# Retrieve subsequent pages
second = next(lazy)
third = next(lazy)
```

## makeiter() — Generator over Any Method

```python
# Create a generator directly from a method call
gen = zot.makeiter(zot.top(limit=25))

page1 = next(gen)  # first 25 items
page2 = next(gen)  # next 25 items
# Raises StopIteration when exhausted
```

## Manual start/limit Pagination

```python
page_size = 50
offset = 0

while True:
    batch = zot.items(limit=page_size, start=offset)
    if not batch:
        break
    # process batch
    for item in batch:
        process(item)
    offset += page_size
```

## Performance Notes

- `everything()` makes multiple API calls sequentially; large libraries may take time.
- For libraries with thousands of items, use `since=version` to retrieve only changed items (useful for sync workflows).
- All of `follow()`, `everything()`, and `makeiter()` are only valid for methods that return multiple items.
