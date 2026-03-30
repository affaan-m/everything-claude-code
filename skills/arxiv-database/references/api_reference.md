# arXiv API Reference

## Overview

The arXiv API provides programmatic access to preprint metadata via an Atom XML feed. It supports search queries with field-specific operators, boolean logic, ID-based retrieval, sorting, and pagination. No authentication required.

## Base URL

```
http://export.arxiv.org/api/query
```

## Rate Limiting

- Recommended: **1 request per 3 seconds**
- Aggressive crawling will result in temporary IP bans
- Use `time.sleep(3)` between requests
- Include a descriptive `User-Agent` header

## Query Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `search_query` | Query string with field prefixes and boolean operators | (none) |
| `id_list` | Comma-separated arXiv IDs | (none) |
| `start` | Starting index for pagination (0-based) | `0` |
| `max_results` | Number of results to return (max 300) | `10` |
| `sortBy` | Sort field: `relevance`, `lastUpdatedDate`, `submittedDate` | `relevance` |
| `sortOrder` | Sort direction: `ascending`, `descending` | `descending` |

**Note**: `search_query` and `id_list` can be used together (results are ANDed) or separately.

## Search Query Syntax

### Field Prefixes

| Prefix | Field | Example |
|--------|-------|---------|
| `ti:` | Title | `ti:transformer` |
| `au:` | Author | `au:bengio` |
| `abs:` | Abstract | `abs:attention mechanism` |
| `co:` | Comment | `co:accepted at NeurIPS` |
| `jr:` | Journal Reference | `jr:Nature` |
| `cat:` | Category | `cat:cs.LG` |
| `all:` | All fields | `all:deep learning` |
| `id:` | arXiv ID | `id:2309.10668` |

### Boolean Operators

Operators **must** be uppercase:

```
ti:transformer AND abs:attention           # Both conditions
au:bengio OR au:lecun                      # Either condition
cat:cs.LG ANDNOT cat:cs.CV                # Exclude category
```

### Grouping

Use parentheses for complex queries:

```
(ti:sparse AND ti:autoencoder) AND cat:cs.LG
au:anthropic AND (abs:interpretability OR abs:alignment)
(cat:cs.LG OR cat:cs.CL) AND ti:reinforcement learning
```

### Phrase Search

Quotes for exact phrases:

```
ti:"sparse autoencoder"
au:"Yoshua Bengio"
abs:"reinforcement learning from human feedback"
```

### Wildcards

Not supported by the arXiv API. Use broader terms and filter client-side.

## Example Requests

### Basic keyword search
```
GET http://export.arxiv.org/api/query?search_query=all:sparse+autoencoder&max_results=10
```

### Author + category
```
GET http://export.arxiv.org/api/query?search_query=au:anthropic+AND+cat:cs.LG&max_results=50&sortBy=submittedDate
```

### ID lookup
```
GET http://export.arxiv.org/api/query?id_list=2309.10668,2406.04093
```

### Combined search + ID
```
GET http://export.arxiv.org/api/query?search_query=cat:cs.LG&id_list=2309.10668
```

### Paginated results
```
# Page 1 (results 0-99)
GET ...?search_query=cat:cs.LG&start=0&max_results=100&sortBy=submittedDate

# Page 2 (results 100-199)
GET ...?search_query=cat:cs.LG&start=100&max_results=100&sortBy=submittedDate
```

## Response Format (Atom XML)

The API returns an Atom 1.0 XML feed.

### Feed-level elements

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:arxiv="http://arxiv.org/schemas/atom">

  <title>ArXiv Query: ...</title>
  <id>http://arxiv.org/api/...</id>
  <updated>2024-01-15T00:00:00-05:00</updated>

  <!-- Total results available (not just returned) -->
  <opensearch:totalResults>1500</opensearch:totalResults>
  <opensearch:startIndex>0</opensearch:startIndex>
  <opensearch:itemsPerPage>50</opensearch:itemsPerPage>

  <entry>...</entry>
  <entry>...</entry>
</feed>
```

### Entry elements

```xml
<entry>
  <!-- Unique identifier (includes version) -->
  <id>http://arxiv.org/abs/2309.10668v2</id>

  <!-- Dates -->
  <published>2023-09-19T17:58:00Z</published>
  <updated>2023-10-04T14:22:00Z</updated>

  <!-- Metadata -->
  <title>Towards Monosemanticity: Decomposing Language Models...</title>
  <summary>We attempt to reverse-engineer a trained neural network...</summary>

  <!-- Authors -->
  <author>
    <name>Trenton Bricken</name>
  </author>
  <author>
    <name>Adly Templeton</name>
  </author>

  <!-- Categories -->
  <arxiv:primary_category term="cs.LG" scheme="http://arxiv.org/schemas/atom"/>
  <category term="cs.LG" scheme="http://arxiv.org/schemas/atom"/>
  <category term="cs.AI" scheme="http://arxiv.org/schemas/atom"/>

  <!-- Links -->
  <link href="http://arxiv.org/abs/2309.10668v2" rel="alternate" type="text/html"/>
  <link href="http://arxiv.org/pdf/2309.10668v2" rel="related" type="application/pdf" title="pdf"/>

  <!-- Optional -->
  <arxiv:comment>42 pages, 30 figures</arxiv:comment>
  <arxiv:doi>10.48550/arXiv.2309.10668</arxiv:doi>
  <arxiv:journal_ref>...</arxiv:journal_ref>
</entry>
```

### Entry field descriptions

| Field | Description |
|-------|-------------|
| `id` | Canonical arXiv URL with version (e.g., `http://arxiv.org/abs/2309.10668v2`) |
| `published` | First submission date (ISO 8601) |
| `updated` | Last update date (ISO 8601) |
| `title` | Paper title (may contain line breaks in XML) |
| `summary` | Full abstract text |
| `author/name` | Author full name (one per `<author>` element) |
| `arxiv:primary_category` | Primary arXiv category |
| `category` | All categories (multiple elements) |
| `link[@type='text/html']` | Abstract page URL |
| `link[@title='pdf']` | PDF download URL |
| `arxiv:comment` | Author comment (page count, conference, etc.) |
| `arxiv:doi` | Associated DOI (if exists) |
| `arxiv:journal_ref` | Journal publication reference (if published) |

## Complete Category List

### Computer Science (cs.*)

| Category | Name |
|----------|------|
| `cs.AI` | Artificial Intelligence |
| `cs.AR` | Hardware Architecture |
| `cs.CC` | Computational Complexity |
| `cs.CE` | Computational Engineering, Finance, and Science |
| `cs.CG` | Computational Geometry |
| `cs.CL` | Computation and Language |
| `cs.CR` | Cryptography and Security |
| `cs.CV` | Computer Vision and Pattern Recognition |
| `cs.CY` | Computers and Society |
| `cs.DB` | Databases |
| `cs.DC` | Distributed, Parallel, and Cluster Computing |
| `cs.DL` | Digital Libraries |
| `cs.DM` | Discrete Mathematics |
| `cs.DS` | Data Structures and Algorithms |
| `cs.ET` | Emerging Technologies |
| `cs.FL` | Formal Languages and Automata Theory |
| `cs.GL` | General Literature |
| `cs.GR` | Graphics |
| `cs.GT` | Computer Science and Game Theory |
| `cs.HC` | Human-Computer Interaction |
| `cs.IR` | Information Retrieval |
| `cs.IT` | Information Theory |
| `cs.LG` | Machine Learning |
| `cs.LO` | Logic in Computer Science |
| `cs.MA` | Multiagent Systems |
| `cs.MM` | Multimedia |
| `cs.MS` | Mathematical Software |
| `cs.NA` | Numerical Analysis |
| `cs.NE` | Neural and Evolutionary Computing |
| `cs.NI` | Networking and Internet Architecture |
| `cs.OH` | Other Computer Science |
| `cs.OS` | Operating Systems |
| `cs.PF` | Performance |
| `cs.PL` | Programming Languages |
| `cs.RO` | Robotics |
| `cs.SC` | Symbolic Computation |
| `cs.SD` | Sound |
| `cs.SE` | Software Engineering |
| `cs.SI` | Social and Information Networks |
| `cs.SY` | Systems and Control |

### Statistics (stat.*)

| Category | Name |
|----------|------|
| `stat.AP` | Applications |
| `stat.CO` | Computation |
| `stat.ME` | Methodology |
| `stat.ML` | Machine Learning |
| `stat.OT` | Other Statistics |
| `stat.TH` | Statistics Theory |

### Mathematics (math.*)

| Category | Name |
|----------|------|
| `math.AC` | Commutative Algebra |
| `math.AG` | Algebraic Geometry |
| `math.AP` | Analysis of PDEs |
| `math.AT` | Algebraic Topology |
| `math.CA` | Classical Analysis and ODEs |
| `math.CO` | Combinatorics |
| `math.CT` | Category Theory |
| `math.CV` | Complex Variables |
| `math.DG` | Differential Geometry |
| `math.DS` | Dynamical Systems |
| `math.FA` | Functional Analysis |
| `math.GM` | General Mathematics |
| `math.GN` | General Topology |
| `math.GR` | Group Theory |
| `math.GT` | Geometric Topology |
| `math.HO` | History and Overview |
| `math.IT` | Information Theory |
| `math.KT` | K-Theory and Homology |
| `math.LO` | Logic |
| `math.MG` | Metric Geometry |
| `math.MP` | Mathematical Physics |
| `math.NA` | Numerical Analysis |
| `math.NT` | Number Theory |
| `math.OA` | Operator Algebras |
| `math.OC` | Optimization and Control |
| `math.PR` | Probability |
| `math.QA` | Quantum Algebra |
| `math.RA` | Rings and Algebras |
| `math.RT` | Representation Theory |
| `math.SG` | Symplectic Geometry |
| `math.SP` | Spectral Theory |
| `math.ST` | Statistics Theory |

### Physics

| Category | Name |
|----------|------|
| `astro-ph` | Astrophysics (+ subcategories: .CO, .EP, .GA, .HE, .IM, .SR) |
| `cond-mat` | Condensed Matter (+ subcategories) |
| `gr-qc` | General Relativity and Quantum Cosmology |
| `hep-ex` | High Energy Physics - Experiment |
| `hep-lat` | High Energy Physics - Lattice |
| `hep-ph` | High Energy Physics - Phenomenology |
| `hep-th` | High Energy Physics - Theory |
| `math-ph` | Mathematical Physics |
| `nlin` | Nonlinear Sciences (+ subcategories) |
| `nucl-ex` | Nuclear Experiment |
| `nucl-th` | Nuclear Theory |
| `physics` | Physics (+ subcategories: .comp-ph, .data-an, .bio-ph, etc.) |
| `quant-ph` | Quantum Physics |

### Quantitative Biology (q-bio.*)

| Category | Name |
|----------|------|
| `q-bio.BM` | Biomolecules |
| `q-bio.CB` | Cell Behavior |
| `q-bio.GN` | Genomics |
| `q-bio.MN` | Molecular Networks |
| `q-bio.NC` | Neurons and Cognition |
| `q-bio.OT` | Other Quantitative Biology |
| `q-bio.PE` | Populations and Evolution |
| `q-bio.QM` | Quantitative Methods |
| `q-bio.SC` | Subcellular Processes |
| `q-bio.TO` | Tissues and Organs |

### Quantitative Finance (q-fin.*)

| Category | Name |
|----------|------|
| `q-fin.CP` | Computational Finance |
| `q-fin.EC` | Economics |
| `q-fin.GN` | General Finance |
| `q-fin.MF` | Mathematical Finance |
| `q-fin.PM` | Portfolio Management |
| `q-fin.PR` | Pricing of Securities |
| `q-fin.RM` | Risk Management |
| `q-fin.ST` | Statistical Finance |
| `q-fin.TR` | Trading and Market Microstructure |

### Electrical Engineering and Systems Science (eess.*)

| Category | Name |
|----------|------|
| `eess.AS` | Audio and Speech Processing |
| `eess.IV` | Image and Video Processing |
| `eess.SP` | Signal Processing |
| `eess.SY` | Systems and Control |

### Economics (econ.*)

| Category | Name |
|----------|------|
| `econ.EM` | Econometrics |
| `econ.GN` | General Economics |
| `econ.TH` | Theoretical Economics |

## Pagination

The API returns at most 300 results per request. For larger result sets, paginate:

```python
all_results = []
start = 0
batch_size = 100

while True:
    params = {
        "search_query": "cat:cs.LG",
        "start": start,
        "max_results": batch_size,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }
    results = fetch(params)  # your fetch function
    if not results:
        break
    all_results.extend(results)
    start += batch_size
    time.sleep(3)  # respect rate limit
```

The total number of results available is in the `opensearch:totalResults` element of the feed.

## Downloading Papers

### PDF
```
http://arxiv.org/pdf/{arxiv_id}
http://arxiv.org/pdf/{arxiv_id}v{version}
```

### Abstract page
```
http://arxiv.org/abs/{arxiv_id}
```

### Source (LaTeX)
```
http://arxiv.org/e-print/{arxiv_id}
```

### HTML (experimental)
```
http://arxiv.org/html/{arxiv_id}
```

## arXiv ID Formats

| Format | Era | Example |
|--------|-----|---------|
| `YYMM.NNNNN` | 2015+ | `2309.10668` |
| `YYMM.NNNN` | 2007-2014 | `0706.0001` |
| `archive/YYMMNNN` | Pre-2007 | `hep-th/9901001` |

All formats are accepted by the API.

## Common Pitfalls

1. **Boolean operators must be UPPERCASE**: `AND`, `OR`, `ANDNOT` (lowercase is treated as search terms)
2. **URL encoding**: Spaces in queries must be encoded as `+` or `%20`
3. **No full-text search**: The API only searches metadata (title, abstract, authors, etc.)
4. **Empty result placeholder**: When no results are found, arXiv may return a single entry with an empty title and the id `http://arxiv.org/api/errors` - filter this out
5. **Version numbering**: `published` date is v1 submission; `updated` is latest version date
6. **Rate limiting**: Exceeding limits can result in 403 errors or temporary bans
7. **Max 300 per request**: Even if `max_results` is set higher, only 300 are returned

## External Resources

- arXiv API documentation: https://info.arxiv.org/help/api/index.html
- arXiv API user manual: https://info.arxiv.org/help/api/user-manual.html
- arXiv bulk data access: https://info.arxiv.org/help/bulk_data.html
- arXiv category taxonomy: https://arxiv.org/category_taxonomy
- OAI-PMH interface (for bulk metadata): http://export.arxiv.org/oai2
