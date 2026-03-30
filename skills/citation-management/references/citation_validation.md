# Citation Validation Guide

Comprehensive guide to validating citation accuracy, completeness, and formatting in BibTeX files.

## Overview

Citation validation ensures:
- All citations are accurate and complete
- DOIs resolve correctly
- Required fields are present
- No duplicate entries
- Proper formatting and syntax
- Links are accessible

Validation should be performed:
- After extracting metadata
- Before manuscript submission
- After manual edits to BibTeX files
- Periodically for maintained bibliographies

## Validation Categories

### 1. DOI Verification

**Purpose**: Ensure DOIs are valid and resolve correctly.

#### What to Check

**DOI format**:
```
Valid:   10.1038/s41586-021-03819-2
Valid:   10.1126/science.aam9317
Invalid: 10.1038/invalid
Invalid: doi:10.1038/... (should omit "doi:" prefix in BibTeX)
```

**DOI resolution**:
- DOI should resolve via https://doi.org/
- Should redirect to actual article
- Should not return 404 or error

**Metadata consistency**:
- CrossRef metadata should match BibTeX
- Author names should align
- Title should match
- Year should match

#### How to Validate

**Manual check**:
1. Copy DOI from BibTeX
2. Visit https://doi.org/10.1038/nature12345
3. Verify it redirects to correct article
4. Check metadata matches

**Automated check** (recommended):
```bash
python scripts/validate_citations.py references.bib --check-dois
```

**Process**:
1. Extract all DOIs from BibTeX file
2. Query doi.org resolver for each
3. Query CrossRef API for metadata
4. Compare metadata with BibTeX entry
5. Report discrepancies

#### Common Issues

**Broken DOIs**:
- Typos in DOI
- Publisher changed DOI (rare)
- Article retracted
- Solution: Find correct DOI from publisher site

**Mismatched metadata**:
- BibTeX has old/incorrect information
- Solution: Re-extract metadata from CrossRef

**Missing DOIs**:
- Older articles may not have DOIs
- Acceptable for pre-2000 publications
- Add URL or PMID instead

### 2. Required Fields

**Purpose**: Ensure all necessary information is present.

#### Required by Entry Type

**@article**:
```bibtex
author   % REQUIRED
title    % REQUIRED
journal  % REQUIRED
year     % REQUIRED
volume   % Highly recommended
pages    % Highly recommended
doi      % Highly recommended for modern papers
```

**@book**:
```bibtex
author OR editor  % REQUIRED (at least one)
title            % REQUIRED
publisher        % REQUIRED
year             % REQUIRED
isbn             % Recommended
```

**@inproceedings**:
```bibtex
author     % REQUIRED
title      % REQUIRED
booktitle  % REQUIRED (conference/proceedings name)
year       % REQUIRED
pages      % Recommended
```

**@incollection** (book chapter):
```bibtex
author     % REQUIRED
title      % REQUIRED (chapter title)
booktitle  % REQUIRED (book title)
publisher  % REQUIRED
year       % REQUIRED
editor     % Recommended
pages      % Recommended
```

**@phdthesis**:
```bibtex
author  % REQUIRED
title   % REQUIRED
school  % REQUIRED
year    % REQUIRED
```

**@misc** (preprints, datasets, etc.):
```bibtex
author  % REQUIRED
title   % REQUIRED
year    % REQUIRED
howpublished  % Recommended (bioRxiv, Zenodo, etc.)
doi OR url    % At least one required
```

#### Validation Script

```bash
python scripts/validate_citations.py references.bib --check-required-fields
```

**Output**:
```
Error: Entry 'Smith2024' missing required field 'journal'
Error: Entry 'Doe2023' missing required field 'year'
Warning: Entry 'Jones2022' missing recommended field 'volume'
```

### 3. Author Name Formatting

**Purpose**: Ensure consistent, correct author name formatting.

#### Proper Format

**Recommended BibTeX format**:
```bibtex
author = {Last1, First1 and Last2, First2 and Last3, First3}
```

**Examples**:
```bibtex
% Correct
author = {Smith, John}
author = {Smith, John A.}
author = {Smith, John Andrew}
author = {Smith, John and Doe, Jane}
author = {Smith, John and Doe, Jane and Johnson, Mary}

% For many authors
author = {Smith, John and Doe, Jane and others}

% Incorrect
author = {John Smith}  % First Last format (not recommended)
author = {Smith, J.; Doe, J.}  % Semicolon separator (wrong)
author = {Smith J, Doe J}  % Missing commas
```

#### Special Cases

**Suffixes (Jr., III, etc.)**:
```bibtex
author = {King, Jr., Martin Luther}
```

**Multiple surnames (hyphenated)**:
```bibtex
author = {Smith-Jones, Mary}
```

**Van, von, de, etc.**:
```bibtex
author = {van der Waals, Johannes}
author = {de Broglie, Louis}
```

**Organizations as authors**:
```bibtex
author = {{World Health Organization}}
% Double braces treat as single author
```

#### Validation Checks

**Automated validation**:
```bash
python scripts/validate_citations.py references.bib --check-authors
```

**Checks for**:
- Proper separator (and, not &, ; , etc.)
- Comma placement
- Empty author fields
- Malformed names

### 4. Data Consistency

**Purpose**: Ensure all fields contain valid, reasonable values.

#### Year Validation

**Valid years**:
```bibtex
year = {2024}    % Current/recent
year = {1953}    % Watson & Crick DNA structure (historical)
year = {1665}    % Hooke's Micrographia (very old)
```

**Invalid years**:
```bibtex
year = {24}      % Two digits (ambiguous)
year = {202}     % Typo
year = {2025}    % Future (unless accepted/in press)
year = {0}       % Obviously wrong
```

**Check**:
- Four digits
- Reasonable range (1600-current+1)
- Not all zeros

#### Volume/Number Validation

```bibtex
volume = {123}      % Numeric
volume = {12}       % Valid
number = {3}        % Valid
number = {S1}       % Supplement issue (valid)
```

**Invalid**:
```bibtex
volume = {Vol. 123}  % Should be just number
number = {Issue 3}   % Should be just number
```

#### Page Range Validation

**Correct format**:
```bibtex
pages = {123--145}    % En-dash (two hyphens)
pages = {e0123456}    % PLOS-style article ID
pages = {123}         % Single page
```

**Incorrect format**:
```bibtex
pages = {123-145}     % Single hyphen (use --)
pages = {pp. 123-145} % Remove "pp."
pages = {123–145}     % Unicode en-dash (may cause issues)
```

#### URL Validation

**Check**:
- URLs are accessible (return 200 status)
- HTTPS when available
- No obvious typos
- Permanent links (not temporary)

**Valid**:
```bibtex
url = {https://www.nature.com/articles/nature12345}
url = {https://arxiv.org/abs/2103.14030}
```

**Questionable**:
```bibtex
url = {http://...}  % HTTP instead of HTTPS
url = {file:///...} % Local file path
url = {bit.ly/...}  % URL shortener (not permanent)
```

### 5. Duplicate Detection

**Purpose**: Find and remove duplicate entries.

#### Types of Duplicates

**Exact duplicates** (same DOI):
```bibtex
@article{Smith2024a,
  doi = {10.1038/nature12345},
  ...
}

@article{Smith2024b,
  doi = {10.1038/nature12345},  % Same DOI!
  ...
}
```

**Near duplicates** (similar title/authors):
```bibtex
@article{Smith2024,
  title = {Machine Learning for Drug Discovery},
  ...
}

@article{Smith2024method,
  title = {Machine learning for drug discovery},  % Same, different case
  ...
}
```

**Preprint + Published**:
```bibtex
@misc{Smith2023arxiv,
  title = {AlphaFold Results},
  howpublished = {arXiv},
  ...
}

@article{Smith2024,
  title = {AlphaFold Results},  % Same paper, now published
  journal = {Nature},
  ...
}
% Keep published version only
```

#### Detection Methods

**By DOI** (most reliable):
- Same DOI = exact duplicate
- Keep one, remove other

**By title similarity**:
- Normalize: lowercase, remove punctuation
- Calculate similarity (e.g., Levenshtein distance)
- Flag if >90% similar

**By author-year-title**:
- Same first author + year + similar title
- Likely duplicate

**Automated detection**:
```bash
python scripts/validate_citations.py references.bib --check-duplicates
```

**Output**:
```
Warning: Possible duplicate entries:
  - Smith2024a (DOI: 10.1038/nature12345)
  - Smith2024b (DOI: 10.1038/nature12345)
  Recommendation: Keep one entry, remove the other.
```

### 6. Format and Syntax

**Purpose**: Ensure valid BibTeX syntax.

#### Common Syntax Errors

**Missing commas**:
```bibtex
@article{Smith2024,
  author = {Smith, John}   % Missing comma!
  title = {Title}
}
% Should be:
  author = {Smith, John},  % Comma after each field
```

**Unbalanced braces**:
```bibtex
title = {Title with {Protected} Text  % Missing closing brace
% Should be:
title = {Title with {Protected} Text}
```

**Missing closing brace for entry**:
```bibtex
@article{Smith2024,
  author = {Smith, John},
  title = {Title}
  % Missing closing brace!
% Should end with:
}
```

**Invalid characters in keys**:
```bibtex
@article{Smith&Doe2024,  % & not allowed in key
  ...
}
% Use:
@article{SmithDoe2024,
  ...
}
```

#### BibTeX Syntax Rules

**Entry structure**:
```bibtex
@TYPE{citationkey,
  field1 = {value1},
  field2 = {value2},
  ...
  fieldN = {valueN}
}
```

**Citation keys**:
- Alphanumeric and some punctuation (-, _, ., :)
- No spaces
- Case-sensitive
- Unique within file

**Field values**:
- Enclosed in {braces} or "quotes"
- Braces preferred for complex text
- Numbers can be unquoted: `year = 2024`

**Special characters**:
- `{` and `}` for grouping
- `\` for LaTeX commands
- Protect capitalization: `{AlphaFold}`
- Accents: `{\"u}`, `{\'e}`, `{\aa}`

#### Validation

```bash
python scripts/validate_citations.py references.bib --check-syntax
```

**Checks**:
- Valid BibTeX structure
- Balanced braces
- Proper commas
- Valid entry types
- Unique citation keys

## Validation Workflow

### Step 1: Basic Validation

Run comprehensive validation:

```bash
python scripts/validate_citations.py references.bib
```

**Checks all**:
- DOI resolution
- Required fields
- Author formatting
- Data consistency
- Duplicates
- Syntax

### Step 2: Review Report

Examine validation report:

```json
{
  "total_entries": 150,
  "valid_entries": 140,
  "errors": [
    {
      "entry": "Smith2024",
      "error": "missing_required_field",
      "field": "journal",
      "severity": "high"
    },
    {
      "entry": "Doe2023",
      "error": "invalid_doi",
      "doi": "10.1038/broken",
      "severity": "high"
    }
  ],
  "warnings": [
    {
      "entry": "Jones2022",
      "warning": "missing_recommended_field",
      "field": "volume",
      "severity": "medium"
    }
  ],
  "duplicates": [
    {
      "entries": ["Smith2024a", "Smith2024b"],
      "reason": "same_doi",
      "doi": "10.1038/nature12345"
    }
  ]
}
```

### Step 3: Fix Issues

**High-priority** (errors):
1. Add missing required fields
2. Fix broken DOIs
3. Remove duplicates
4. Correct syntax errors

**Medium-priority** (warnings):
1. Add recommended fields
2. Improve author formatting
3. Fix page ranges

**Low-priority**:
1. Standardize formatting
2. Add URLs for accessibility

### Step 4: Auto-Fix

Use auto-fix for safe corrections:

```bash
python scripts/validate_citations.py references.bib \
  --auto-fix \
  --output fixed_references.bib
```

**Auto-fix can**:
- Fix page range format (- to --)
- Remove "pp." from pages
- Standardize author separators
- Fix common syntax errors
- Normalize field order

**Auto-fix cannot**:
- Add missing information
- Find correct DOIs
- Determine which duplicate to keep
- Fix semantic errors

### Step 5: Manual Review

Review auto-fixed file:
```bash
# Check what changed
diff references.bib fixed_references.bib

# Review specific entries that had errors
grep -A 10 "Smith2024" fixed_references.bib
```

### Step 6: Re-Validate

Validate after fixes:

```bash
python scripts/validate_citations.py fixed_references.bib --verbose
```

Should show:
```
✓ All DOIs valid
✓ All required fields present
✓ No duplicates found
✓ Syntax valid
✓ 150/150 entries valid
```

## Validation Checklist

Use this checklist before final submission:

### DOI Validation
- [ ] All DOIs resolve correctly
- [ ] Metadata matches between BibTeX and CrossRef
- [ ] No broken or invalid DOIs

### Completeness
- [ ] All entries have required fields
- [ ] Modern papers (2000+) have DOIs
- [ ] Authors properly formatted
- [ ] Journals/conferences properly named

### Consistency
- [ ] Years are 4-digit numbers
- [ ] Page ranges use -- not -
- [ ] Volume/number are numeric
- [ ] URLs are accessible

### Duplicates
- [ ] No entries with same DOI
- [ ] No near-duplicate titles
- [ ] Preprints updated to published versions

### Formatting
- [ ] Valid BibTeX syntax
- [ ] Balanced braces
- [ ] Proper commas
- [ ] Unique citation keys

### Final Checks
- [ ] Bibliography compiles without errors
- [ ] All citations in text appear in bibliography
- [ ] All bibliography entries cited in text
- [ ] Citation style matches journal requirements

## Best Practices

### 1. Validate Early and Often

```bash
# After extraction
python scripts/extract_metadata.py --doi ... --output refs.bib
python scripts/validate_citations.py refs.bib

# After manual edits
python scripts/validate_citations.py refs.bib

# Before submission
python scripts/validate_citations.py refs.bib --strict
```

### 2. Use Automated Tools

Don't validate manually - use scripts:
- Faster
- More comprehensive
- Catches errors humans miss
- Generates reports

### 3. Keep Backup

```bash
# Before auto-fix
cp references.bib references_backup.bib

# Run auto-fix
python scripts/validate_citations.py references.bib \
  --auto-fix \
  --output references_fixed.bib

# Review changes
diff references.bib references_fixed.bib

# If satisfied, replace
mv references_fixed.bib references.bib
```

### 4. Fix High-Priority First

**Priority order**:
1. Syntax errors (prevent compilation)
2. Missing required fields (incomplete citations)
3. Broken DOIs (broken links)
4. Duplicates (confusion, wasted space)
5. Missing recommended fields
6. Formatting inconsistencies

### 5. Document Exceptions

For entries that can't be fixed:

```bibtex
@article{Old1950,
  author = {Smith, John},
  title = {Title},
  journal = {Obscure Journal},
  year = {1950},
  volume = {12},
  pages = {34--56},
  note = {DOI not available for publications before 2000}
}
```

### 6. Validate Against Journal Requirements

Different journals have different requirements:
- Citation style (numbered, author-year)
- Abbreviations (journal names)
- Maximum reference count
- Format (BibTeX, EndNote, manual)

Check journal author guidelines!

## Common Validation Issues

### Issue 1: Metadata Mismatch

**Problem**: BibTeX says 2023, CrossRef says 2024.

**Cause**:
- Online-first vs print publication
- Correction/update
- Extraction error

**Solution**:
1. Check actual article
2. Use more recent/accurate date
3. Update BibTeX entry
4. Re-validate

### Issue 2: Special Characters

**Problem**: LaTeX compilation fails on special characters.

**Cause**:
- Accented characters (é, ü, ñ)
- Chemical formulas (H₂O)
- Math symbols (α, β, ±)

**Solution**:
```bibtex
% Use LaTeX commands
author = {M{\"u}ller, Hans}  % Müller
title = {Study of H\textsubscript{2}O}  % H₂O
% Or use UTF-8 with proper LaTeX packages
```

### Issue 3: Incomplete Extraction

**Problem**: Extracted metadata missing fields.

**Cause**:
- Source doesn't provide all metadata
- Extraction error
- Incomplete record

**Solution**:
1. Check original article
2. Manually add missing fields
3. Use alternative source (PubMed vs CrossRef)

### Issue 4: Cannot Find Duplicate

**Problem**: Same paper appears twice, not detected.

**Cause**:
- Different DOIs (should be rare)
- Different titles (abbreviated, typo)
- Different citation keys

**Solution**:
- Manual search for author + year
- Check for similar titles
- Remove manually

## Summary

Validation ensures citation quality:

✓ **Accuracy**: DOIs resolve, metadata correct  
✓ **Completeness**: All required fields present  
✓ **Consistency**: Proper formatting throughout  
✓ **No duplicates**: Each paper cited once  
✓ **Valid syntax**: BibTeX compiles without errors  

**Always validate** before final submission!

Use automated tools:
```bash
python scripts/validate_citations.py references.bib
```

Follow workflow:
1. Extract metadata
2. Validate
3. Fix errors
4. Re-validate
5. Submit

