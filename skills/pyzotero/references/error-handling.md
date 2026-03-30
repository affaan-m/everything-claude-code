# Error Handling

## Exception Types

Pyzotero raises `ZoteroError` subclasses for API errors. Import from `pyzotero.zotero_errors`:

```python
from pyzotero import zotero_errors
```

Common exceptions:

| Exception | Cause |
|-----------|-------|
| `UserNotAuthorised` | Invalid or missing API key |
| `HTTPError` | Generic HTTP error |
| `ParamNotPassed` | Required parameter missing |
| `CallDoesNotExist` | Invalid API method for library type |
| `ResourceNotFound` | Item/collection key not found |
| `Conflict` | Version conflict (optimistic locking) |
| `PreConditionFailed` | `If-Unmodified-Since-Version` check failed |
| `TooManyItems` | Batch exceeds 50-item limit |
| `TooManyRequests` | API rate limit exceeded |
| `InvalidItemFields` | Item dict contains unknown fields |

## Basic Error Handling

```python
from pyzotero import Zotero
from pyzotero import zotero_errors

zot = Zotero('123456', 'user', 'APIKEY')

try:
    item = zot.item('BADKEY')
except zotero_errors.ResourceNotFound:
    print('Item not found')
except zotero_errors.UserNotAuthorised:
    print('Invalid API key')
except Exception as e:
    print(f'Unexpected error: {e}')
    if hasattr(e, '__cause__'):
        print(f'Caused by: {e.__cause__}')
```

## Version Conflict Handling

```python
try:
    zot.update_item(item)
except zotero_errors.PreConditionFailed:
    # Item was modified since you retrieved it — re-fetch and retry
    fresh_item = zot.item(item['data']['key'])
    fresh_item['data']['title'] = new_title
    zot.update_item(fresh_item)
```

## Checking for Invalid Fields

```python
from pyzotero import zotero_errors

template = zot.item_template('journalArticle')
template['badField'] = 'bad value'

try:
    zot.check_items([template])
except zotero_errors.InvalidItemFields as e:
    print(f'Invalid fields: {e}')
    # Fix fields before calling create_items
```

## Rate Limiting

The Zotero API rate-limits requests. If you receive `TooManyRequests`:

```python
import time
from pyzotero import zotero_errors

def safe_request(func, *args, **kwargs):
    retries = 3
    for attempt in range(retries):
        try:
            return func(*args, **kwargs)
        except zotero_errors.TooManyRequests:
            wait = 2 ** attempt
            print(f'Rate limited, waiting {wait}s...')
            time.sleep(wait)
    raise RuntimeError('Max retries exceeded')

items = safe_request(zot.items, limit=100)
```

## Accessing Underlying Error

```python
try:
    zot.item('BADKEY')
except Exception as e:
    print(e.__cause__)    # original HTTP error
    print(e.__context__)  # exception context
```
