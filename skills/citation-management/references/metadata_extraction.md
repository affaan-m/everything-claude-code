# Metadata Extraction Guide

Comprehensive guide to extracting accurate citation metadata from DOIs, PMIDs, arXiv IDs, and URLs using various APIs and services.

## Overview

Accurate metadata is essential for proper citations. This guide covers:
- Identifying paper identifiers (DOI, PMID, arXiv ID)
- Querying metadata APIs (CrossRef, PubMed, arXiv, DataCite)
- Required BibTeX fields by entry type
- Handling edge cases and special situations
- Validating extracted metadata

## Paper Identifiers

### DOI (Digital Object Identifier)

**Format**: `10.XXXX/suffix`

**Examples**:
```
10.1038/s41586-021-03819-2    # Nature article
10.1126/science.aam9317       # Science article
10.1016/j.cell.2023.01.001    # Cell article
10.1371/journal.pone.0123456  # PLOS ONE article
```

**Properties**:
- Permanent identifier
- Most reliable for metadata
- Resolves to current location
- Publisher-assigned

**Where to find**:
- First page of article
- Article webpage
- CrossRef, Google Scholar, PubMed
- Usually prominent on publisher site

### PMID (PubMed ID)

**Format**: 8-digit number (typically)

**Examples**:
```
34265844
28445112
35476778
```

**Properties**:
- Specific to PubMed database
- Biomedical literature only
- Assigned by NCBI
- Permanent identifier

**Where to find**:
- PubMed search results
- Article page on PubMed
- Often in article PDF footer
- PMC (PubMed Central) pages

### PMCID (PubMed Central ID)

**Format**: PMC followed by numbers

**Examples**:
```
PMC8287551
PMC7456789
```

**Properties**:
- Free full-text articles in PMC
- Subset of PubMed articles
- Open access or author manuscripts

### arXiv ID

**Format**: YYMM.NNNNN or archive/YYMMNNN

**Examples**:
```
2103.14030        # New format (since 2007)
2401.12345        # 2024 submission
arXiv:hep-th/9901001  # Old format
```

**Properties**:
- Preprints (not peer-reviewed)
- Physics, math, CS, q-bio, etc.
- Version tracking (v1, v2, etc.)
- Free, open access

**Where to find**:
- arXiv.org
- Often cited before publication
- Paper PDF header

### Other Identifiers

**ISBN** (Books):
```
978-0-12-345678-9
0-123-45678-9
```

**arXiv category**:
```
cs.LG    # Computer Science - Machine Learning
q-bio.QM # Quantitative Biology - Quantitative Methods
math.ST  # Mathematics - Statistics
```

## Metadata APIs

### CrossRef API

**Primary source for DOIs** - Most comprehensive metadata for journal articles.

**Base URL**: `https://api.crossref.org/works/`

**No API key required**, but polite pool recommended:
- Add email to User-Agent
- Gets better service
- No rate limits

#### Basic DOI Lookup

**Request**:
```
GET https://api.crossref.org/works/10.1038/s41586-021-03819-2
```

**Response** (simplified):
```json
{
  "message": {
    "DOI": "10.1038/s41586-021-03819-2",
    "title": ["Article title here"],
    "author": [
      {"given": "John", "family": "Smith"},
      {"given": "Jane", "family": "Doe"}
    ],
    "container-title": ["Nature"],
    "volume": "595",
    "issue": "7865",
    "page": "123-128",
    "published-print": {"date-parts": [[2021, 7, 1]]},
    "publisher": "Springer Nature",
    "type": "journal-article",
    "ISSN": ["0028-0836"]
  }
}
```

#### Fields Available

**Always present**:
- `DOI`: Digital Object Identifier
- `title`: Article title (array)
- `type`: Content type (journal-article, book-chapter, etc.)

**Usually present**:
- `author`: Array of author objects
- `container-title`: Journal/book title
- `published-print` or `published-online`: Publication date
- `volume`, `issue`, `page`: Publication details
- `publisher`: Publisher name

**Sometimes present**:
- `abstract`: Article abstract
- `subject`: Subject categories
- `ISSN`: Journal ISSN
- `ISBN`: Book ISBN
- `reference`: Reference list
- `is-referenced-by-count`: Citation count

#### Content Types

CrossRef `type` field values:
- `journal-article`: Journal articles
- `book-chapter`: Book chapters
- `book`: Books
- `proceedings-article`: Conference papers
- `posted-content`: Preprints
- `dataset`: Research datasets
- `report`: Technical reports
- `dissertation`: Theses/dissertations

### PubMed E-utilities API

**Specialized for biomedical literature** - Curated metadata with MeSH terms.

**Base URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`

**API key recommended** (free):
- Higher rate limits
- Better performance

#### PMID to Metadata

**Step 1: EFetch for full record**

```
GET https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?
  db=pubmed&
  id=34265844&
  retmode=xml&
  api_key=YOUR_KEY
```

**Response**: XML with comprehensive metadata

**Step 2: Parse XML**

Key fields:
```xml
<PubmedArticle>
  <MedlineCitation>
    <PMID>34265844</PMID>
    <Article>
      <ArticleTitle>Title here</ArticleTitle>
      <AuthorList>
        <Author><LastName>Smith</LastName><ForeName>John</ForeName></Author>
      </AuthorList>
      <Journal>
        <Title>Nature</Title>
        <JournalIssue>
          <Volume>595</Volume>
          <Issue>7865</Issue>
          <PubDate><Year>2021</Year></PubDate>
        </JournalIssue>
      </Journal>
      <Pagination><MedlinePgn>123-128</MedlinePgn></Pagination>
      <Abstract><AbstractText>Abstract text here</AbstractText></Abstract>
    </Article>
  </MedlineCitation>
  <PubmedData>
    <ArticleIdList>
      <ArticleId IdType="doi">10.1038/s41586-021-03819-2</ArticleId>
      <ArticleId IdType="pmc">PMC8287551</ArticleId>
    </ArticleIdList>
  </PubmedData>
</PubmedArticle>
```

#### Unique PubMed Fields

**MeSH Terms**: Controlled vocabulary
```xml
<MeshHeadingList>
  <MeshHeading>
    <DescriptorName UI="D003920">Diabetes Mellitus</DescriptorName>
  </MeshHeading>
</MeshHeadingList>
```

**Publication Types**:
```xml
<PublicationTypeList>
  <PublicationType UI="D016428">Journal Article</PublicationType>
  <PublicationType UI="D016449">Randomized Controlled Trial</PublicationType>
</PublicationTypeList>
```

**Grant Information**:
```xml
<GrantList>
  <Grant>
    <GrantID>R01-123456</GrantID>
    <Agency>NIAID NIH HHS</Agency>
    <Country>United States</Country>
  </Grant>
</GrantList>
```

### arXiv API

**Preprints in physics, math, CS, q-bio** - Free, open access.

**Base URL**: `http://export.arxiv.org/api/query`

**No API key required**

#### arXiv ID to Metadata

**Request**:
```
GET http://export.arxiv.org/api/query?id_list=2103.14030
```

**Response**: Atom XML

```xml
<entry>
  <id>http://arxiv.org/abs/2103.14030v2</id>
  <title>Highly accurate protein structure prediction with AlphaFold</title>
  <author><name>John Jumper</name></author>
  <author><name>Richard Evans</name></author>
  <published>2021-03-26T17:47:17Z</published>
  <updated>2021-07-01T16:51:46Z</updated>
  <summary>Abstract text here...</summary>
  <arxiv:doi>10.1038/s41586-021-03819-2</arxiv:doi>
  <category term="q-bio.BM" scheme="http://arxiv.org/schemas/atom"/>
  <category term="cs.LG" scheme="http://arxiv.org/schemas/atom"/>
</entry>
```

#### Key Fields

- `id`: arXiv URL
- `title`: Preprint title
- `author`: Author list
- `published`: First version date
- `updated`: Latest version date
- `summary`: Abstract
- `arxiv:doi`: DOI if published
- `arxiv:journal_ref`: Journal reference if published
- `category`: arXiv categories

#### Version Tracking

arXiv tracks versions:
- `v1`: Initial submission
- `v2`, `v3`, etc.: Revisions

**Always check** if preprint has been published in journal (use DOI if available).

### DataCite API

**Research datasets, software, other outputs** - Assigns DOIs to non-traditional scholarly works.

**Base URL**: `https://api.datacite.org/dois/`

**Similar to CrossRef** but for datasets, software, code, etc.

**Request**:
```
GET https://api.datacite.org/dois/10.5281/zenodo.1234567
```

**Response**: JSON with metadata for dataset/software

## Required BibTeX Fields

### @article (Journal Articles)

**Required**:
- `author`: Author names
- `title`: Article title
- `journal`: Journal name
- `year`: Publication year

**Optional but recommended**:
- `volume`: Volume number
- `number`: Issue number
- `pages`: Page range (e.g., 123--145)
- `doi`: Digital Object Identifier
- `url`: URL if no DOI
- `month`: Publication month

**Example**:
```bibtex
@article{Smith2024,
  author  = {Smith, John and Doe, Jane},
  title   = {Novel Approach to Protein Folding},
  journal = {Nature},
  year    = {2024},
  volume  = {625},
  number  = {8001},
  pages   = {123--145},
  doi     = {10.1038/nature12345}
}
```

### @book (Books)

**Required**:
- `author` or `editor`: Author(s) or editor(s)
- `title`: Book title
- `publisher`: Publisher name
- `year`: Publication year

**Optional but recommended**:
- `edition`: Edition number (if not first)
- `address`: Publisher location
- `isbn`: ISBN
- `url`: URL
- `series`: Series name

**Example**:
```bibtex
@book{Kumar2021,
  author    = {Kumar, Vinay and Abbas, Abul K. and Aster, Jon C.},
  title     = {Robbins and Cotran Pathologic Basis of Disease},
  publisher = {Elsevier},
  year      = {2021},
  edition   = {10},
  isbn      = {978-0-323-53113-9}
}
```

### @inproceedings (Conference Papers)

**Required**:
- `author`: Author names
- `title`: Paper title
- `booktitle`: Conference/proceedings name
- `year`: Year

**Optional but recommended**:
- `pages`: Page range
- `organization`: Organizing body
- `publisher`: Publisher
- `address`: Conference location
- `month`: Conference month
- `doi`: DOI if available

**Example**:
```bibtex
@inproceedings{Vaswani2017,
  author    = {Vaswani, Ashish and Shazeer, Noam and others},
  title     = {Attention is All You Need},
  booktitle = {Advances in Neural Information Processing Systems},
  year      = {2017},
  pages     = {5998--6008},
  volume    = {30}
}
```

### @incollection (Book Chapters)

**Required**:
- `author`: Chapter author(s)
- `title`: Chapter title
- `booktitle`: Book title
- `publisher`: Publisher name
- `year`: Publication year

**Optional but recommended**:
- `editor`: Book editor(s)
- `pages`: Chapter page range
- `chapter`: Chapter number
- `edition`: Edition
- `address`: Publisher location

**Example**:
```bibtex
@incollection{Brown2020,
  author    = {Brown, Peter O. and Botstein, David},
  title     = {Exploring the New World of the Genome with {DNA} Microarrays},
  booktitle = {DNA Microarrays: A Molecular Cloning Manual},
  editor    = {Eisen, Michael B. and Brown, Patrick O.},
  publisher = {Cold Spring Harbor Laboratory Press},
  year      = {2020},
  pages     = {1--45}
}
```

### @phdthesis (Dissertations)

**Required**:
- `author`: Author name
- `title`: Thesis title
- `school`: Institution
- `year`: Year

**Optional**:
- `type`: Type (e.g., "PhD dissertation")
- `address`: Institution location
- `month`: Month
- `url`: URL

**Example**:
```bibtex
@phdthesis{Johnson2023,
  author = {Johnson, Mary L.},
  title  = {Novel Approaches to Cancer Immunotherapy},
  school = {Stanford University},
  year   = {2023},
  type   = {{PhD} dissertation}
}
```

### @misc (Preprints, Software, Datasets)

**Required**:
- `author`: Author(s)
- `title`: Title
- `year`: Year

**For preprints, add**:
- `howpublished`: Repository (e.g., "bioRxiv")
- `doi`: Preprint DOI
- `note`: Preprint ID

**Example (preprint)**:
```bibtex
@misc{Zhang2024,
  author       = {Zhang, Yi and Chen, Li and Wang, Hui},
  title        = {Novel Therapeutic Targets in Alzheimer's Disease},
  year         = {2024},
  howpublished = {bioRxiv},
  doi          = {10.1101/2024.01.001},
  note         = {Preprint}
}
```

**Example (software)**:
```bibtex
@misc{AlphaFold2021,
  author       = {DeepMind},
  title        = {{AlphaFold} Protein Structure Database},
  year         = {2021},
  howpublished = {Software},
  url          = {https://alphafold.ebi.ac.uk/},
  doi          = {10.5281/zenodo.5123456}
}
```

## Extraction Workflows

### From DOI

**Best practice** - Most reliable source:

```bash
# Single DOI
python scripts/extract_metadata.py --doi 10.1038/s41586-021-03819-2

# Multiple DOIs
python scripts/extract_metadata.py \
  --doi 10.1038/nature12345 \
  --doi 10.1126/science.abc1234 \
  --output refs.bib
```

**Process**:
1. Query CrossRef API with DOI
2. Parse JSON response
3. Extract required fields
4. Determine entry type (@article, @book, etc.)
5. Format as BibTeX
6. Validate completeness

### From PMID

**For biomedical literature**:

```bash
# Single PMID
python scripts/extract_metadata.py --pmid 34265844

# Multiple PMIDs
python scripts/extract_metadata.py \
  --pmid 34265844 \
  --pmid 28445112 \
  --output refs.bib
```

**Process**:
1. Query PubMed EFetch with PMID
2. Parse XML response
3. Extract metadata including MeSH terms
4. Check for DOI in response
5. If DOI exists, optionally query CrossRef for additional metadata
6. Format as BibTeX

### From arXiv ID

**For preprints**:

```bash
python scripts/extract_metadata.py --arxiv 2103.14030
```

**Process**:
1. Query arXiv API with ID
2. Parse Atom XML response
3. Check for published version (DOI in response)
4. If published: Use DOI and CrossRef
5. If not published: Use preprint metadata
6. Format as @misc with preprint note

**Important**: Always check if preprint has been published!

### From URL

**When you only have URL**:

```bash
python scripts/extract_metadata.py \
  --url "https://www.nature.com/articles/s41586-021-03819-2"
```

**Process**:
1. Parse URL to extract identifier
2. Identify type (DOI, PMID, arXiv)
3. Extract identifier from URL
4. Query appropriate API
5. Format as BibTeX

**URL patterns**:
```
# DOI URLs
https://doi.org/10.1038/nature12345
https://dx.doi.org/10.1126/science.abc123
https://www.nature.com/articles/s41586-021-03819-2

# PubMed URLs
https://pubmed.ncbi.nlm.nih.gov/34265844/
https://www.ncbi.nlm.nih.gov/pubmed/34265844

# arXiv URLs
https://arxiv.org/abs/2103.14030
https://arxiv.org/pdf/2103.14030.pdf
```

### Batch Processing

**From file with mixed identifiers**:

```bash
# Create file with one identifier per line
# identifiers.txt:
#   10.1038/nature12345
#   34265844
#   2103.14030
#   https://doi.org/10.1126/science.abc123

python scripts/extract_metadata.py \
  --input identifiers.txt \
  --output references.bib
```

**Process**:
- Script auto-detects identifier type
- Queries appropriate API
- Combines all into single BibTeX file
- Handles errors gracefully

## Special Cases and Edge Cases

### Preprints Later Published

**Issue**: Preprint cited, but journal version now available.

**Solution**:
1. Check arXiv metadata for DOI field
2. If DOI present, use published version
3. Update citation to journal article
4. Note preprint version in comments if needed

**Example**:
```bibtex
% Originally: arXiv:2103.14030
% Published as:
@article{Jumper2021,
  author  = {Jumper, John and Evans, Richard and others},
  title   = {Highly Accurate Protein Structure Prediction with {AlphaFold}},
  journal = {Nature},
  year    = {2021},
  volume  = {596},
  pages   = {583--589},
  doi     = {10.1038/s41586-021-03819-2}
}
```

### Multiple Authors (et al.)

**Issue**: Many authors (10+).

**BibTeX practice**:
- Include all authors if <10
- Use "and others" for 10+
- Or list all (journals vary)

**Example**:
```bibtex
@article{LargeCollaboration2024,
  author = {First, Author and Second, Author and Third, Author and others},
  ...
}
```

### Author Name Variations

**Issue**: Authors publish under different name formats.

**Standardization**:
```
# Common variations
John Smith
John A. Smith
John Andrew Smith
J. A. Smith
Smith, J.
Smith, J. A.

# BibTeX format (recommended)
author = {Smith, John A.}
```

**Extraction preference**:
1. Use full name if available
2. Include middle initial if available
3. Format: Last, First Middle

### No DOI Available

**Issue**: Older papers or books without DOIs.

**Solutions**:
1. Use PMID if available (biomedical)
2. Use ISBN for books
3. Use URL to stable source
4. Include full publication details

**Example**:
```bibtex
@article{OldPaper1995,
  author  = {Author, Name},
  title   = {Title Here},
  journal = {Journal Name},
  year    = {1995},
  volume  = {123},
  pages   = {45--67},
  url     = {https://stable-url-here},
  note    = {PMID: 12345678}
}
```

### Conference Papers vs Journal Articles

**Issue**: Same work published in both.

**Best practice**:
- Cite journal version if both available
- Journal version is archival
- Conference version for timeliness

**If citing conference**:
```bibtex
@inproceedings{Smith2024conf,
  author    = {Smith, John},
  title     = {Title},
  booktitle = {Proceedings of NeurIPS 2024},
  year      = {2024}
}
```

**If citing journal**:
```bibtex
@article{Smith2024journal,
  author  = {Smith, John},
  title   = {Title},
  journal = {Journal of Machine Learning Research},
  year    = {2024}
}
```

### Book Chapters vs Edited Collections

**Extract correctly**:
- Chapter: Use `@incollection`
- Whole book: Use `@book`
- Book editor: List in `editor` field
- Chapter author: List in `author` field

### Datasets and Software

**Use @misc** with appropriate fields:

```bibtex
@misc{DatasetName2024,
  author       = {Author, Name},
  title        = {Dataset Title},
  year         = {2024},
  howpublished = {Zenodo},
  doi          = {10.5281/zenodo.123456},
  note         = {Version 1.2}
}
```

## Validation After Extraction

Always validate extracted metadata:

```bash
python scripts/validate_citations.py extracted_refs.bib
```

**Check**:
- All required fields present
- DOI resolves correctly
- Author names formatted consistently
- Year is reasonable (4 digits)
- Journal/publisher names correct
- Page ranges use -- not -
- Special characters handled properly

## Best Practices

### 1. Prefer DOI When Available

DOIs provide:
- Permanent identifier
- Best metadata source
- Publisher-verified information
- Resolvable link

### 2. Verify Automatically Extracted Metadata

Spot-check:
- Author names match publication
- Title matches (including capitalization)
- Year is correct
- Journal name is complete

### 3. Handle Special Characters

**LaTeX special characters**:
- Protect capitalization: `{AlphaFold}`
- Handle accents: `M{\"u}ller` or use Unicode
- Chemical formulas: `H$_2$O` or `\ce{H2O}`

### 4. Use Consistent Citation Keys

**Convention**: `FirstAuthorYEARkeyword`
```
Smith2024protein
Doe2023machine
Johnson2024cancer
```

### 5. Include DOI for Modern Papers

All papers published after ~2000 should have DOI:
```bibtex
doi = {10.1038/nature12345}
```

### 6. Document Source

For non-standard sources, add note:
```bibtex
note = {Preprint, not peer-reviewed}
note = {Technical report}
note = {Dataset accompanying [citation]}
```

## Summary

Metadata extraction workflow:

1. **Identify**: Determine identifier type (DOI, PMID, arXiv, URL)
2. **Query**: Use appropriate API (CrossRef, PubMed, arXiv)
3. **Extract**: Parse response for required fields
4. **Format**: Create properly formatted BibTeX entry
5. **Validate**: Check completeness and accuracy
6. **Verify**: Spot-check critical citations

**Use scripts** to automate:
- `extract_metadata.py`: Universal extractor
- `doi_to_bibtex.py`: Quick DOI conversion
- `validate_citations.py`: Verify accuracy

**Always validate** extracted metadata before final submission!

