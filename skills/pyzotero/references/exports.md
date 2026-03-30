# Export Formats

## BibTeX

```python
zot.add_parameters(format='bibtex')
bibtex_db = zot.top(limit=50)
# Returns a bibtexparser BibDatabase object

# Access entries as list of dicts
entries = bibtex_db.entries
for entry in entries:
    print(entry.get('title'), entry.get('author'))

# Write to .bib file
import bibtexparser
with open('library.bib', 'w') as f:
    bibtexparser.dump(bibtex_db, f)
```

## CSL-JSON

```python
zot.add_parameters(content='csljson', limit=50)
csl_items = zot.items()
# Returns a list of dicts in CSL-JSON format
```

## Bibliography HTML (formatted citations)

```python
# APA style bibliography
zot.add_parameters(content='bib', style='apa')
bib_entries = zot.items(limit=50)
# Returns list of HTML <div> strings

for entry in bib_entries:
    print(entry)  # e.g. '<div>Smith, J. (2024). Title. <i>Journal</i>...</div>'
```

**Note**: `format='bib'` removes the `limit` parameter. The API enforces a max of 150 items.

### Available Citation Styles

Pass any valid CSL style name from the [Zotero style repository](https://www.zotero.org/styles):
- `'apa'`
- `'chicago-author-date'`
- `'chicago-note-bibliography'`
- `'mla'`
- `'vancouver'`
- `'ieee'`
- `'harvard-cite-them-right'`
- `'nature'`

## In-Text Citations

```python
zot.add_parameters(content='citation', style='apa')
citations = zot.items(limit=50)
# Returns list of HTML <span> elements: ['<span>(Smith, 2024)</span>', ...]
```

## Other Formats

Set `content` to any Zotero export format:

| Format | `content` value | Returns |
|--------|----------------|---------|
| BibTeX | `'bibtex'` | via `format='bibtex'` |
| CSL-JSON | `'csljson'` | list of dicts |
| RIS | `'ris'` | list of unicode strings |
| RDF (Dublin Core) | `'rdf_dc'` | list of unicode strings |
| Zotero RDF | `'rdf_zotero'` | list of unicode strings |
| BibLaTeX | `'biblatex'` | list of unicode strings |
| Wikipedia Citation Templates | `'wikipedia'` | list of unicode strings |

**Note**: When using an export format as `content`, you must provide a `limit` parameter. Multiple simultaneous format retrieval is not supported.

```python
# Export as RIS
zot.add_parameters(content='ris', limit=50)
ris_data = zot.items()
with open('library.ris', 'w', encoding='utf-8') as f:
    f.write('\n'.join(ris_data))
```

## Keys Only

```python
# Get item keys as a newline-delimited string
zot.add_parameters(format='keys')
keys_str = zot.items()
keys = keys_str.strip().split('\n')
```

## Version Information (for syncing)

```python
# Dict of {key: version} for all items
zot.add_parameters(format='versions')
versions = zot.items()
```
