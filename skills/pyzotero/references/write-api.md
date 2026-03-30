# Write API Methods

## Creating Items

Always use `item_template()` to get a valid template before creating items.

```python
# Get a template for a specific item type
template = zot.item_template('journalArticle')

# Fill in fields
template['title'] = 'Deep Learning for Genomics'
template['date'] = '2024'
template['publicationTitle'] = 'Nature Methods'
template['volume'] = '21'
template['DOI'] = '10.1038/s41592-024-02233-6'
template['creators'] = [
    {'creatorType': 'author', 'firstName': 'Jane', 'lastName': 'Doe'},
    {'creatorType': 'author', 'firstName': 'John', 'lastName': 'Smith'},
]

# Validate fields before creating (raises InvalidItemFields if invalid)
zot.check_items([template])

# Create the item
resp = zot.create_items([template])
# resp: {'success': {'0': 'NEWITEMKEY'}, 'failed': {}, 'unchanged': {}}
new_key = resp['success']['0']
```

### Create Multiple Items at Once

```python
templates = []
for data in paper_data_list:
    t = zot.item_template('journalArticle')
    t['title'] = data['title']
    t['DOI'] = data['doi']
    templates.append(t)

resp = zot.create_items(templates)
```

### Create Child Items

```python
# Create a note as a child of an existing item
note_template = zot.item_template('note')
note_template['note'] = '<p>My annotation here</p>'
zot.create_items([note_template], parentid='PARENTKEY')
```

## Updating Items

```python
# Retrieve, modify, update
item = zot.item('ITEMKEY')
item['data']['title'] = 'Updated Title'
item['data']['abstractNote'] = 'New abstract text.'
success = zot.update_item(item)  # returns True or raises error

# Update many items at once (auto-chunked at 50)
items = zot.items(limit=10)
for item in items:
    item['data']['extra'] += '\nProcessed'
zot.update_items(items)
```

## Deleting Items

```python
# Must retrieve item first (version field is required)
item = zot.item('ITEMKEY')
zot.delete_item([item])

# Delete multiple items
items = zot.items(tag='to-delete')
zot.delete_item(items)
```

## Item Types and Fields

```python
# All available item types
item_types = zot.item_types()
# [{'itemType': 'artwork', 'localized': 'Artwork'}, ...]

# All available fields
fields = zot.item_fields()

# Valid fields for a specific item type
journal_fields = zot.item_type_fields('journalArticle')

# Valid creator types for an item type
creator_types = zot.item_creator_types('journalArticle')
# [{'creatorType': 'author', 'localized': 'Author'}, ...]

# All localised creator field names
creator_fields = zot.creator_fields()

# Attachment link modes (needed for attachment templates)
link_modes = zot.item_attachment_link_modes()

# Template for an attachment
attach_template = zot.item_template('attachment', linkmode='imported_file')
```

## Optimistic Locking

Use `last_modified` to prevent overwriting concurrent changes:

```python
# Only update if library version matches
zot.update_item(item, last_modified=4025)
# Raises an error if the server version differs
```

## Notes

- `create_items()` accepts up to 50 items per call; batch if needed.
- `update_items()` auto-chunks at 50 items.
- If a dict passed to `create_items()` contains a `key` matching an existing item, it will be updated rather than created.
- Always call `check_items()` before `create_items()` to catch field errors early.
