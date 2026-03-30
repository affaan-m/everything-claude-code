# PubMed Search Syntax and Field Tags

## Boolean Operators

PubMed supports standard Boolean operators to combine search terms:

### AND
Retrieves results containing all search terms. PubMed automatically applies AND between separate concepts.

**Example**:
```
diabetes AND hypertension
```

### OR
Retrieves results containing at least one of the search terms. Useful for synonyms or related concepts.

**Example**:
```
heart attack OR myocardial infarction
```

### NOT
Excludes results containing the specified term. Use cautiously as it may eliminate relevant results.

**Example**:
```
cancer NOT lung
```

**Precedence**: Operations are processed left to right. Use parentheses to control evaluation order:
```
(heart attack OR myocardial infarction) AND treatment
```

## Phrase Searching

### Double Quotes
Enclose exact phrases in double quotes to search for terms in specific order:

```
"kidney allograft"
"machine learning"
"systematic review"
```

### Field Tags
Alternative method using field tags:
```
kidney allograft[Title]
```

## Wildcards

Use asterisk (*) to substitute for zero or more characters:

**Rules**:
- Minimum 4 characters before first wildcard
- Matches word variations and plurals

**Examples**:
```
vaccin*        → matches vaccine, vaccination, vaccines, vaccinate
pediatr*       → matches pediatric, pediatrics, pediatrician
colo*r         → matches color, colour
```

**Limitations**:
- Cannot use at beginning of search term
- May retrieve unexpected variations

## Proximity Searching

Search for terms within a specified distance from each other. Only available in Title, Title/Abstract, and Affiliation fields.

**Syntax**: `"search terms"[field:~N]`
- N = maximum number of words between terms

**Examples**:
```
"vitamin C"[Title:~3]           → vitamin within 3 words of C in title
"breast cancer screening"[TIAB:~5]  → terms within 5 words in title/abstract
```

## Search Field Tags

Field tags limit searches to specific parts of PubMed records. Format: `term[tag]`

### Author Searching

| Tag | Field | Example |
|-----|-------|---------|
| [au] | Author | smith j[au] |
| [1au] | First Author | jones m[1au] |
| [lastau] | Last Author | wilson k[lastau] |
| [fau] | Full Author Name | smith john a[fau] |

**Author Search Notes**:
- Full author names searchable from 2002 forward
- Format: last name + initials (e.g., `smith ja[au]`)
- Can search without field tag, but [au] ensures accuracy

**Corporate Authors**:
Search organizations as authors:
```
world health organization[au]
```

### Title and Abstract

| Tag | Field | Example |
|-----|-------|---------|
| [ti] | Title | diabetes[ti] |
| [ab] | Abstract | treatment[ab] |
| [tiab] | Title/Abstract | cancer screening[tiab] |
| [tw] | Text Word | cardiovascular[tw] |

**Notes**:
- [tw] searches title, abstract, and other text fields
- [tiab] is most commonly used for comprehensive searching

### Journal Information

| Tag | Field | Example |
|-----|-------|---------|
| [ta] | Journal Title Abbreviation | Science[ta] |
| [jour] | Journal | New England Journal of Medicine[jour] |
| [issn] | ISSN | 0028-4793[issn] |

### Date Fields

| Tag | Field | Format | Example |
|-----|-------|--------|---------|
| [dp] | Publication Date | YYYY/MM/DD | 2023[dp] |
| [edat] | Entrez Date | YYYY/MM/DD | 2023/01/15[edat] |
| [crdt] | Create Date | YYYY/MM/DD | 2023[crdt] |
| [mhda] | MeSH Date | YYYY/MM/DD | 2023[mhda] |

**Date Ranges**:
Use colon to specify ranges:
```
2020:2023[dp]                    → publications from 2020 to 2023
2023/01/01:2023/06/30[dp]        → first half of 2023
```

**Relative Dates**:
PubMed filters provide common ranges:
- Last 1 year
- Last 5 years
- Last 10 years
- Custom date range

### MeSH and Subject Headings

| Tag | Field | Example |
|-----|-------|---------|
| [mh] | MeSH Terms | diabetes mellitus[mh] |
| [majr] | MeSH Major Topic | hypertension[majr] |
| [mesh] | MeSH Terms | cancer[mesh] |
| [sh] | MeSH Subheading | therapy[sh] |

**MeSH Searching**:
- Medical Subject Headings provide controlled vocabulary
- [mh] includes narrower terms automatically
- [majr] limits to articles where topic is main focus
- Combine with subheadings: `diabetes mellitus/therapy[mh]`

**Common MeSH Subheadings**:
- /diagnosis
- /drug therapy
- /epidemiology
- /etiology
- /prevention & control
- /therapy

### Publication Types

| Tag | Field | Example |
|-----|-------|---------|
| [pt] | Publication Type | clinical trial[pt] |
| [ptyp] | Publication Type | review[ptyp] |

**Common Publication Types**:
- Clinical Trial
- Meta-Analysis
- Randomized Controlled Trial
- Review
- Systematic Review
- Case Reports
- Letter
- Editorial
- Guideline

**Example**:
```
cancer AND systematic review[pt]
```

### Other Useful Fields

| Tag | Field | Example |
|-----|-------|---------|
| [la] | Language | english[la] |
| [affil] | Affiliation | harvard[affil] |
| [pmid] | PubMed ID | 12345678[pmid] |
| [pmc] | PMC ID | PMC123456[pmc] |
| [doi] | DOI | 10.1234/example[doi] |
| [gr] | Grant Number | R01CA123456[gr] |
| [isbn] | ISBN | 9780123456789[isbn] |
| [pg] | Pagination | 123-145[pg] |
| [vi] | Volume | 45[vi] |
| [ip] | Issue | 3[ip] |

### Supplemental Concepts

| Tag | Field | Example |
|-----|-------|---------|
| [nm] | Substance Name | aspirin[nm] |
| [ps] | Personal Name | darwin charles[ps] |

## Automatic Term Mapping (ATM)

When searching without field tags, PubMed automatically:

1. **Searches MeSH translation table** for matching MeSH terms
2. **Searches journal translation table** for journal names
3. **Searches author index** for author names
4. **Searches full text** for remaining terms

**Bypass ATM**:
- Use double quotes: `"breast cancer"`
- Use field tags: `breast cancer[tiab]`

**View Translation**:
Use Advanced Search to see how PubMed translated your query in the Search Details box.

## Filters and Limits

### Article Types
- Clinical Trial
- Meta-Analysis
- Randomized Controlled Trial
- Review
- Systematic Review

### Text Availability
- Free full text
- Full text
- Abstract

### Publication Date
- Last 1 year
- Last 5 years
- Last 10 years
- Custom date range

### Species
- Humans
- Animals (specific species available)

### Sex
- Female
- Male

### Age Groups
- Child (0-18 years)
- Infant (birth-23 months)
- Child, Preschool (2-5 years)
- Child (6-12 years)
- Adolescent (13-18 years)
- Adult (19+ years)
- Aged (65+ years)
- 80 and over

### Languages
- English
- Spanish
- French
- German
- Chinese
- And many others

### Other Filters
- Journal categories
- Subject area
- Article attributes (e.g., has abstract, free PMC article)

## Advanced Search Strategies

### Clinical Queries
PubMed provides specialized filters for clinical research:

**Study Categories**:
- Therapy (narrow/broad)
- Diagnosis (narrow/broad)
- Etiology (narrow/broad)
- Prognosis (narrow/broad)
- Clinical prediction guides

**Medical Genetics**:
- Diagnosis
- Differential diagnosis
- Clinical description
- Management
- Genetic counseling

### Hedges and Filters
Pre-built search strategies for specific purposes:
- Systematic review filters
- Quality filters for study types
- Geographic filters

### Combining Searches
Use Advanced Search to combine previous queries:
```
#1 AND #2
#3 OR #4
#5 NOT #6
```

### Search History
- Saves up to 100 searches
- Expires after 8 hours of inactivity
- Access via Advanced Search page
- Combine using # references

## Best Practices

### 1. Start Broad, Then Narrow
Begin with general terms and add specificity:
```
diabetes                                 → too broad
diabetes mellitus type 2                 → better
diabetes mellitus type 2[mh] AND treatment[tiab] → more specific
```

### 2. Use Synonyms with OR
Include alternative terms:
```
heart attack OR myocardial infarction OR MI
```

### 3. Combine Concepts with AND
Link different aspects of your research question:
```
(heart attack OR myocardial infarction) AND (aspirin OR acetylsalicylic acid) AND prevention
```

### 4. Leverage MeSH Terms
Use MeSH for consistent indexing:
```
diabetes mellitus[mh] AND hypertension[mh]
```

### 5. Use Filters Strategically
Apply filters to refine results:
- Publication date for recent research
- Article type for specific study designs
- Free full text for accessible articles

### 6. Review Search Details
Check how PubMed interpreted your search in Advanced Search to ensure accuracy.

### 7. Save Effective Searches
Create My NCBI account to:
- Save searches
- Set up email alerts
- Create collections

## Common Search Patterns

### Systematic Review Search
```
(breast cancer[tiab] OR breast neoplasm[mh]) AND (screening[tiab] OR early detection[tiab]) AND systematic review[pt]
```

### Clinical Trial Search
```
diabetes mellitus type 2[mh] AND metformin[nm] AND randomized controlled trial[pt] AND 2020:2024[dp]
```

### Recent Research by Author
```
smith ja[au] AND cancer[tiab] AND 2023:2024[dp] AND english[la]
```

### Drug Treatment Studies
```
hypertension[mh] AND (amlodipine[nm] OR losartan[nm]) AND drug therapy[sh] AND humans[mh]
```

### Geographic-Specific Research
```
malaria[tiab] AND (africa[affil] OR african[tiab]) AND 2020:2024[dp]
```

## Special Characters

| Character | Purpose | Example |
|-----------|---------|---------|
| * | Wildcard | colo*r |
| " " | Phrase search | "breast cancer" |
| ( ) | Group terms | (A OR B) AND C |
| : | Range | 2020:2023[dp] |
| - | Hyphenated terms | COVID-19 |
| / | MeSH subheading | diabetes/therapy[mh] |

## Troubleshooting

### Too Many Results
- Add more specific terms
- Use field tags to limit search scope
- Apply date restrictions
- Use filters for article type
- Add additional concepts with AND

### Too Few Results
- Remove restrictive terms
- Use OR to add synonyms
- Check spelling and terminology
- Remove field tags for broader search
- Expand date range
- Remove filters

### No Results
- Check spelling using ESpell
- Try alternative terminology
- Remove field tags
- Verify correct database (PubMed vs. PMC)
- Broaden search terms

### Unexpected Results
- Review Search Details to see query translation
- Use field tags to prevent automatic term mapping
- Check for common synonyms that may be included
- Refine with additional limiting terms
