# PubMed Search Guide

Comprehensive guide to searching PubMed for biomedical and life sciences literature, including MeSH terms, field tags, advanced search strategies, and E-utilities API usage.

## Overview

PubMed is the premier database for biomedical literature:
- **Coverage**: 35+ million citations
- **Scope**: Biomedical and life sciences
- **Sources**: MEDLINE, life science journals, online books
- **Authority**: Maintained by National Library of Medicine (NLM) / NCBI
- **Access**: Free, no account required
- **Updates**: Daily with new citations
- **Curation**: High-quality metadata, MeSH indexing

## Basic Search

### Simple Keyword Search

PubMed automatically maps terms to MeSH and searches multiple fields:

```
diabetes
CRISPR gene editing
Alzheimer's disease treatment
cancer immunotherapy
```

**Automatic Features**:
- Automatic MeSH mapping
- Plural/singular variants
- Abbreviation expansion
- Spell checking

### Exact Phrase Search

Use quotation marks for exact phrases:

```
"CRISPR-Cas9"
"systematic review"
"randomized controlled trial"
"machine learning"
```

## MeSH (Medical Subject Headings)

### What is MeSH?

MeSH is a controlled vocabulary thesaurus for indexing biomedical literature:
- **Hierarchical structure**: Organized in tree structures
- **Consistent indexing**: Same concept always tagged the same way
- **Comprehensive**: Covers diseases, drugs, anatomy, techniques, etc.
- **Professional curation**: NLM indexers assign MeSH terms

### Finding MeSH Terms

**MeSH Browser**: https://meshb.nlm.nih.gov/search

**Example**:
```
Search: "heart attack"
MeSH term: "Myocardial Infarction"
```

**In PubMed**:
1. Search with keyword
2. Check "MeSH Terms" in left sidebar
3. Select relevant MeSH terms
4. Add to search

### Using MeSH in Searches

**Basic MeSH search**:
```
"Diabetes Mellitus"[MeSH]
"CRISPR-Cas Systems"[MeSH]
"Alzheimer Disease"[MeSH]
"Neoplasms"[MeSH]
```

**MeSH with subheadings**:
```
"Diabetes Mellitus/drug therapy"[MeSH]
"Neoplasms/genetics"[MeSH]
"Heart Failure/prevention and control"[MeSH]
```

**Common subheadings**:
- `/drug therapy`: Drug treatment
- `/diagnosis`: Diagnostic aspects
- `/genetics`: Genetic aspects
- `/epidemiology`: Occurrence and distribution
- `/prevention and control`: Prevention methods
- `/etiology`: Causes
- `/surgery`: Surgical treatment
- `/metabolism`: Metabolic aspects

### MeSH Explosion

By default, MeSH searches include narrower terms (explosion):

```
"Neoplasms"[MeSH]
# Includes: Breast Neoplasms, Lung Neoplasms, etc.
```

**Disable explosion** (exact term only):
```
"Neoplasms"[MeSH:NoExp]
```

### MeSH Major Topic

Search only where MeSH term is a major focus:

```
"Diabetes Mellitus"[MeSH Major Topic]
# Only papers where diabetes is main topic
```

## Field Tags

Field tags specify which part of the record to search.

### Common Field Tags

**Title and Abstract**:
```
cancer[Title]                    # In title only
treatment[Title/Abstract]        # In title or abstract
"machine learning"[Title/Abstract]
```

**Author**:
```
"Smith J"[Author]
"Doudna JA"[Author]
"Collins FS"[Author]
```

**Author - Full Name**:
```
"Smith, John"[Full Author Name]
```

**Journal**:
```
"Nature"[Journal]
"Science"[Journal]
"New England Journal of Medicine"[Journal]
"Nat Commun"[Journal]           # Abbreviated form
```

**Publication Date**:
```
2023[Publication Date]
2020:2024[Publication Date]      # Date range
2023/01/01:2023/12/31[Publication Date]
```

**Date Created**:
```
2023[Date - Create]              # When added to PubMed
```

**Publication Type**:
```
"Review"[Publication Type]
"Clinical Trial"[Publication Type]
"Meta-Analysis"[Publication Type]
"Randomized Controlled Trial"[Publication Type]
```

**Language**:
```
English[Language]
French[Language]
```

**DOI**:
```
10.1038/nature12345[DOI]
```

**PMID (PubMed ID)**:
```
12345678[PMID]
```

**Article ID**:
```
PMC1234567[PMC]                  # PubMed Central ID
```

### Less Common But Useful Tags

```
humans[MeSH Terms]               # Only human studies
animals[MeSH Terms]              # Only animal studies
"United States"[Place of Publication]
nih[Grant Number]                # NIH-funded research
"Female"[Sex]                    # Female subjects
"Aged, 80 and over"[Age]        # Elderly subjects
```

## Boolean Operators

Combine search terms with Boolean logic.

### AND

Both terms must be present (default behavior):

```
diabetes AND treatment
"CRISPR-Cas9" AND "gene editing"
cancer AND immunotherapy AND "clinical trial"[Publication Type]
```

### OR

Either term must be present:

```
"heart attack" OR "myocardial infarction"
diabetes OR "diabetes mellitus"
CRISPR OR Cas9 OR "gene editing"
```

**Use case**: Synonyms and related terms

### NOT

Exclude terms:

```
cancer NOT review
diabetes NOT animal
"machine learning" NOT "deep learning"
```

**Caution**: May exclude relevant papers that mention both terms.

### Combining Operators

Use parentheses for complex logic:

```
(diabetes OR "diabetes mellitus") AND (treatment OR therapy)

("CRISPR" OR "gene editing") AND ("therapeutic" OR "therapy") 
  AND 2020:2024[Publication Date]

(cancer OR neoplasm) AND (immunotherapy OR "immune checkpoint inhibitor") 
  AND ("clinical trial"[Publication Type] OR "randomized controlled trial"[Publication Type])
```

## Advanced Search Builder

**Access**: https://pubmed.ncbi.nlm.nih.gov/advanced/

**Features**:
- Visual query builder
- Add multiple query boxes
- Select field tags from dropdowns
- Combine with AND/OR/NOT
- Preview results
- Shows final query string
- Save queries

**Workflow**:
1. Add search terms in separate boxes
2. Select field tags
3. Choose Boolean operators
4. Preview results
5. Refine as needed
6. Copy final query string
7. Use in scripts or save

**Example built query**:
```
#1: "Diabetes Mellitus, Type 2"[MeSH]
#2: "Metformin"[MeSH]
#3: "Clinical Trial"[Publication Type]
#4: 2020:2024[Publication Date]
#5: #1 AND #2 AND #3 AND #4
```

## Filters and Limits

### Article Types

```
"Review"[Publication Type]
"Systematic Review"[Publication Type]
"Meta-Analysis"[Publication Type]
"Clinical Trial"[Publication Type]
"Randomized Controlled Trial"[Publication Type]
"Case Reports"[Publication Type]
"Comparative Study"[Publication Type]
```

### Species

```
humans[MeSH Terms]
mice[MeSH Terms]
rats[MeSH Terms]
```

### Sex

```
"Female"[MeSH Terms]
"Male"[MeSH Terms]
```

### Age Groups

```
"Infant"[MeSH Terms]
"Child"[MeSH Terms]
"Adolescent"[MeSH Terms]
"Adult"[MeSH Terms]
"Aged"[MeSH Terms]
"Aged, 80 and over"[MeSH Terms]
```

### Text Availability

```
free full text[Filter]           # Free full-text available
```

### Journal Categories

```
"Journal Article"[Publication Type]
```

## E-utilities API

NCBI provides programmatic access via E-utilities (Entrez Programming Utilities).

### Overview

**Base URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`

**Main Tools**:
- **ESearch**: Search and retrieve PMIDs
- **EFetch**: Retrieve full records
- **ESummary**: Retrieve document summaries
- **ELink**: Find related articles
- **EInfo**: Database statistics

**No API key required**, but recommended for:
- Higher rate limits (10/sec vs 3/sec)
- Better performance
- Identify your project

**Get API key**: https://www.ncbi.nlm.nih.gov/account/

### ESearch - Search PubMed

Retrieve PMIDs for a query.

**Endpoint**: `/esearch.fcgi`

**Parameters**:
- `db`: Database (pubmed)
- `term`: Search query
- `retmax`: Maximum results (default 20, max 10000)
- `retstart`: Starting position (for pagination)
- `sort`: Sort order (relevance, pub_date, author)
- `api_key`: Your API key (optional but recommended)

**Example URL**:
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?
  db=pubmed&
  term=diabetes+AND+treatment&
  retmax=100&
  retmode=json&
  api_key=YOUR_API_KEY
```

**Response**:
```json
{
  "esearchresult": {
    "count": "250000",
    "retmax": "100",
    "idlist": ["12345678", "12345679", ...]
  }
}
```

### EFetch - Retrieve Records

Get full metadata for PMIDs.

**Endpoint**: `/efetch.fcgi`

**Parameters**:
- `db`: Database (pubmed)
- `id`: Comma-separated PMIDs
- `retmode`: Format (xml, json, text)
- `rettype`: Type (abstract, medline, full)
- `api_key`: Your API key

**Example URL**:
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?
  db=pubmed&
  id=12345678,12345679&
  retmode=xml&
  api_key=YOUR_API_KEY
```

**Response**: XML with complete metadata including:
- Title
- Authors (with affiliations)
- Abstract
- Journal
- Publication date
- DOI
- PMID, PMCID
- MeSH terms
- Keywords

### ESummary - Get Summaries

Lighter-weight alternative to EFetch.

**Example**:
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?
  db=pubmed&
  id=12345678&
  retmode=json&
  api_key=YOUR_API_KEY
```

**Returns**: Key metadata without full abstract and details.

### ELink - Find Related Articles

Find related articles or links to other databases.

**Example**:
```
https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?
  dbfrom=pubmed&
  db=pubmed&
  id=12345678&
  linkname=pubmed_pubmed_citedin
```

**Link types**:
- `pubmed_pubmed`: Related articles
- `pubmed_pubmed_citedin`: Papers citing this article
- `pubmed_pmc`: PMC full-text versions
- `pubmed_protein`: Related protein records

### Rate Limiting

**Without API key**:
- 3 requests per second
- Block if exceeded

**With API key**:
- 10 requests per second
- Better for programmatic access

**Best practice**:
```python
import time
time.sleep(0.34)  # ~3 requests/second
# or
time.sleep(0.11)  # ~10 requests/second with API key
```

### API Key Usage

**Get API key**:
1. Create NCBI account: https://www.ncbi.nlm.nih.gov/account/
2. Settings → API Key Management
3. Create new API key
4. Copy key

**Use in requests**:
```
&api_key=YOUR_API_KEY_HERE
```

**Store securely**:
```bash
# In environment variable
export NCBI_API_KEY="your_key_here"

# In script
import os
api_key = os.getenv('NCBI_API_KEY')
```

## Search Strategies

### Comprehensive Systematic Search

For systematic reviews and meta-analyses:

```
# 1. Identify key concepts
Concept 1: Diabetes
Concept 2: Treatment
Concept 3: Outcomes

# 2. Find MeSH terms and synonyms
Concept 1: "Diabetes Mellitus"[MeSH] OR diabetes OR diabetic
Concept 2: "Drug Therapy"[MeSH] OR treatment OR therapy OR medication
Concept 3: "Treatment Outcome"[MeSH] OR outcome OR efficacy OR effectiveness

# 3. Combine with AND
("Diabetes Mellitus"[MeSH] OR diabetes OR diabetic) 
  AND ("Drug Therapy"[MeSH] OR treatment OR therapy OR medication)
  AND ("Treatment Outcome"[MeSH] OR outcome OR efficacy OR effectiveness)

# 4. Add filters
AND 2015:2024[Publication Date]
AND ("Clinical Trial"[Publication Type] OR "Randomized Controlled Trial"[Publication Type])
AND English[Language]
AND humans[MeSH Terms]
```

### Finding Clinical Trials

```
# Specific disease + clinical trials
"Alzheimer Disease"[MeSH] 
  AND ("Clinical Trial"[Publication Type] 
       OR "Randomized Controlled Trial"[Publication Type])
  AND 2020:2024[Publication Date]

# Specific drug trials
"Metformin"[MeSH] 
  AND "Diabetes Mellitus, Type 2"[MeSH]
  AND "Randomized Controlled Trial"[Publication Type]
```

### Finding Reviews

```
# Systematic reviews on topic
"CRISPR-Cas Systems"[MeSH] 
  AND ("Systematic Review"[Publication Type] OR "Meta-Analysis"[Publication Type])

# Reviews in high-impact journals
cancer immunotherapy 
  AND "Review"[Publication Type]
  AND ("Nature"[Journal] OR "Science"[Journal] OR "Cell"[Journal])
```

### Finding Recent Papers

```
# Papers from last year
"machine learning"[Title/Abstract] 
  AND "drug discovery"[Title/Abstract]
  AND 2024[Publication Date]

# Recent papers in specific journal
"CRISPR"[Title/Abstract] 
  AND "Nature"[Journal]
  AND 2023:2024[Publication Date]
```

### Author Tracking

```
# Specific author's recent work
"Doudna JA"[Author] AND 2020:2024[Publication Date]

# Author + topic
"Church GM"[Author] AND "synthetic biology"[Title/Abstract]
```

### High-Quality Evidence

```
# Meta-analyses and systematic reviews
(diabetes OR "diabetes mellitus") 
  AND (treatment OR therapy)
  AND ("Meta-Analysis"[Publication Type] OR "Systematic Review"[Publication Type])

# RCTs only
cancer immunotherapy 
  AND "Randomized Controlled Trial"[Publication Type]
  AND 2020:2024[Publication Date]
```

## Script Integration

### search_pubmed.py Usage

**Basic search**:
```bash
python scripts/search_pubmed.py "diabetes treatment"
```

**With MeSH terms**:
```bash
python scripts/search_pubmed.py \
  --query '"Diabetes Mellitus"[MeSH] AND "Drug Therapy"[MeSH]'
```

**Date range filter**:
```bash
python scripts/search_pubmed.py "CRISPR" \
  --date-start 2020-01-01 \
  --date-end 2024-12-31 \
  --limit 200
```

**Publication type filter**:
```bash
python scripts/search_pubmed.py "cancer immunotherapy" \
  --publication-types "Clinical Trial,Randomized Controlled Trial" \
  --limit 100
```

**Export to BibTeX**:
```bash
python scripts/search_pubmed.py "Alzheimer's disease" \
  --limit 100 \
  --format bibtex \
  --output alzheimers.bib
```

**Complex query from file**:
```bash
# Save complex query in query.txt
cat > query.txt << 'EOF'
("Diabetes Mellitus, Type 2"[MeSH] OR "diabetes"[Title/Abstract])
AND ("Metformin"[MeSH] OR "metformin"[Title/Abstract])
AND "Randomized Controlled Trial"[Publication Type]
AND 2015:2024[Publication Date]
AND English[Language]
EOF

# Run search
python scripts/search_pubmed.py --query-file query.txt --limit 500
```

### Batch Searches

```bash
# Search multiple topics
TOPICS=("diabetes treatment" "cancer immunotherapy" "CRISPR gene editing")

for topic in "${TOPICS[@]}"; do
  python scripts/search_pubmed.py "$topic" \
    --limit 100 \
    --output "${topic// /_}.json"
  sleep 1
done
```

### Extract Metadata

```bash
# Search returns PMIDs
python scripts/search_pubmed.py "topic" --output results.json

# Extract full metadata
python scripts/extract_metadata.py \
  --input results.json \
  --output references.bib
```

## Tips and Best Practices

### Search Construction

1. **Start with MeSH terms**:
   - Use MeSH Browser to find correct terms
   - More precise than keyword search
   - Captures all papers on topic regardless of terminology

2. **Include text word variants**:
   ```
   # Better coverage
   ("Diabetes Mellitus"[MeSH] OR diabetes OR diabetic)
   ```

3. **Use field tags appropriately**:
   - `[MeSH]` for standardized concepts
   - `[Title/Abstract]` for specific terms
   - `[Author]` for known authors
   - `[Journal]` for specific venues

4. **Build incrementally**:
   ```
   # Step 1: Basic search
   diabetes
   
   # Step 2: Add specificity
   "Diabetes Mellitus, Type 2"[MeSH]
   
   # Step 3: Add treatment
   "Diabetes Mellitus, Type 2"[MeSH] AND "Metformin"[MeSH]
   
   # Step 4: Add study type
   "Diabetes Mellitus, Type 2"[MeSH] AND "Metformin"[MeSH] 
     AND "Clinical Trial"[Publication Type]
   
   # Step 5: Add date range
   ... AND 2020:2024[Publication Date]
   ```

### Optimizing Results

1. **Too many results**: Add filters
   - Restrict publication type
   - Narrow date range
   - Add more specific MeSH terms
   - Use Major Topic: `[MeSH Major Topic]`

2. **Too few results**: Broaden search
   - Remove restrictive filters
   - Use OR for synonyms
   - Expand date range
   - Use MeSH explosion (default)

3. **Irrelevant results**: Refine terms
   - Use more specific MeSH terms
   - Add exclusions with NOT
   - Use Title field instead of all fields
   - Add MeSH subheadings

### Quality Control

1. **Document search strategy**:
   - Save exact query string
   - Record search date
   - Note number of results
   - Save filters used

2. **Export systematically**:
   - Use consistent file naming
   - Export to JSON for flexibility
   - Convert to BibTeX as needed
   - Keep original search results

3. **Validate retrieved citations**:
   ```bash
   python scripts/validate_citations.py pubmed_results.bib
   ```

### Staying Current

1. **Set up search alerts**:
   - PubMed → Save search
   - Receive email updates
   - Daily, weekly, or monthly

2. **Track specific journals**:
   ```
   "Nature"[Journal] AND CRISPR[Title]
   ```

3. **Follow key authors**:
   ```
   "Church GM"[Author]
   ```

## Common Issues and Solutions

### Issue: MeSH Term Not Found

**Solution**: 
- Check spelling
- Use MeSH Browser
- Try related terms
- Use text word search as fallback

### Issue: Zero Results

**Solution**:
- Remove filters
- Check query syntax
- Use OR for broader search
- Try synonyms

### Issue: Poor Quality Results

**Solution**:
- Add publication type filters
- Restrict to recent years
- Use MeSH Major Topic
- Filter by journal quality

### Issue: Duplicates from Different Sources

**Solution**:
```bash
python scripts/format_bibtex.py results.bib \
  --deduplicate \
  --output clean.bib
```

### Issue: API Rate Limiting

**Solution**:
- Get API key (increases limit to 10/sec)
- Add delays in scripts
- Process in batches
- Use off-peak hours

## Summary

PubMed provides authoritative biomedical literature search:

✓ **Curated content**: MeSH indexing, quality control  
✓ **Precise search**: Field tags, MeSH terms, filters  
✓ **Programmatic access**: E-utilities API  
✓ **Free access**: No subscription required  
✓ **Comprehensive**: 35M+ citations, daily updates  

Key strategies:
- Use MeSH terms for precise searching
- Combine with text words for comprehensive coverage
- Apply appropriate field tags
- Filter by publication type and date
- Use E-utilities API for automation
- Document search strategy for reproducibility

For broader coverage across disciplines, complement with Google Scholar.

