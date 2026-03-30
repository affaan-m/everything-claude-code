# Citation Quality Checklist

Use this checklist to ensure your citations are accurate, complete, and properly formatted before final submission.

## Pre-Submission Checklist

### ✓ Metadata Accuracy

- [ ] All author names are correct and properly formatted
- [ ] Article titles match the actual publication
- [ ] Journal/conference names are complete (not abbreviated unless required)
- [ ] Publication years are accurate
- [ ] Volume and issue numbers are correct
- [ ] Page ranges are accurate

### ✓ Required Fields

- [ ] All @article entries have: author, title, journal, year
- [ ] All @book entries have: author/editor, title, publisher, year
- [ ] All @inproceedings entries have: author, title, booktitle, year
- [ ] Modern papers (2000+) include DOI when available
- [ ] All entries have unique citation keys

### ✓ DOI Verification

- [ ] All DOIs are properly formatted (10.XXXX/...)
- [ ] DOIs resolve correctly to the article
- [ ] No DOI prefix in the BibTeX field (no "doi:" or "https://doi.org/")
- [ ] Metadata from CrossRef matches your BibTeX entry
- [ ] Run: `python scripts/validate_citations.py references.bib --check-dois`

### ✓ Formatting Consistency

- [ ] Page ranges use double hyphen (--) not single (-)
- [ ] No "pp." prefix in pages field
- [ ] Author names use "and" separator (not semicolon or ampersand)
- [ ] Capitalization protected in titles ({AlphaFold}, {CRISPR}, etc.)
- [ ] Month names use standard abbreviations if included
- [ ] Citation keys follow consistent format

### ✓ Duplicate Detection

- [ ] No duplicate DOIs in bibliography
- [ ] No duplicate citation keys
- [ ] No near-duplicate titles
- [ ] Preprints updated to published versions when available
- [ ] Run: `python scripts/validate_citations.py references.bib`

### ✓ Special Characters

- [ ] Accented characters properly formatted (e.g., {\"u} for ü)
- [ ] Mathematical symbols use LaTeX commands
- [ ] Chemical formulas properly formatted
- [ ] No unescaped special characters (%, &, $, #, etc.)

### ✓ BibTeX Syntax

- [ ] All entries have balanced braces {}
- [ ] Fields separated by commas
- [ ] No comma after last field in each entry
- [ ] Valid entry types (@article, @book, etc.)
- [ ] Run: `python scripts/validate_citations.py references.bib`

### ✓ File Organization

- [ ] Bibliography sorted in logical order (by year, author, or key)
- [ ] Consistent formatting throughout
- [ ] No formatting inconsistencies between entries
- [ ] Run: `python scripts/format_bibtex.py references.bib --sort year`

## Automated Validation

### Step 1: Format and Clean

```bash
python scripts/format_bibtex.py references.bib \
  --deduplicate \
  --sort year \
  --descending \
  --output clean_references.bib
```

**What this does**:
- Removes duplicates
- Standardizes formatting
- Fixes common issues (page ranges, DOI format, etc.)
- Sorts by year (newest first)

### Step 2: Validate

```bash
python scripts/validate_citations.py clean_references.bib \
  --check-dois \
  --report validation_report.json \
  --verbose
```

**What this does**:
- Checks required fields
- Verifies DOIs resolve
- Detects duplicates
- Validates syntax
- Generates detailed report

### Step 3: Review Report

```bash
cat validation_report.json
```

**Address any**:
- **Errors**: Must fix (missing fields, broken DOIs, syntax errors)
- **Warnings**: Should fix (missing recommended fields, formatting issues)
- **Duplicates**: Remove or consolidate

### Step 4: Final Check

```bash
python scripts/validate_citations.py clean_references.bib --verbose
```

**Goal**: Zero errors, minimal warnings

## Manual Review Checklist

### Critical Citations (Top 10-20 Most Important)

For your most important citations, manually verify:

- [ ] Visit DOI link and confirm it's the correct article
- [ ] Check author names against the actual publication
- [ ] Verify year matches publication date
- [ ] Confirm journal/conference name is correct
- [ ] Check that volume/pages match

### Common Issues to Watch For

**Missing Information**:
- [ ] No DOI for papers published after 2000
- [ ] Missing volume or page numbers for journal articles
- [ ] Missing publisher for books
- [ ] Missing conference location for proceedings

**Formatting Errors**:
- [ ] Single hyphen in page ranges (123-145 → 123--145)
- [ ] Ampersands in author lists (Smith & Jones → Smith and Jones)
- [ ] Unprotected acronyms in titles (DNA → {DNA})
- [ ] DOI includes URL prefix (https://doi.org/10.xxx → 10.xxx)

**Metadata Mismatches**:
- [ ] Author names differ from publication
- [ ] Year is online-first instead of print publication
- [ ] Journal name abbreviated when it should be full
- [ ] Volume/issue numbers swapped

**Duplicates**:
- [ ] Same paper cited with different citation keys
- [ ] Preprint and published version both cited
- [ ] Conference paper and journal version both cited

## Field-Specific Checks

### Biomedical Sciences

- [ ] PubMed Central ID (PMCID) included when available
- [ ] MeSH terms appropriate (if using)
- [ ] Clinical trial registration number included (if applicable)
- [ ] All references to treatments/drugs accurately cited

### Computer Science

- [ ] arXiv ID included for preprints
- [ ] Conference proceedings properly cited (not just "NeurIPS")
- [ ] Software/dataset citations include version numbers
- [ ] GitHub links stable and permanent

### General Sciences

- [ ] Data availability statements properly cited
- [ ] Retracted papers identified and removed
- [ ] Preprints checked for published versions
- [ ] Supplementary materials referenced if critical

## Final Pre-Submission Steps

### 1 Week Before Submission

- [ ] Run full validation with DOI checking
- [ ] Fix all errors and critical warnings
- [ ] Manually verify top 10-20 most important citations
- [ ] Check for any retracted papers

### 3 Days Before Submission

- [ ] Re-run validation after any manual edits
- [ ] Ensure all in-text citations have corresponding bibliography entries
- [ ] Ensure all bibliography entries are cited in text
- [ ] Check citation style matches journal requirements

### 1 Day Before Submission

- [ ] Final validation check
- [ ] LaTeX compilation successful with no warnings
- [ ] PDF renders all citations correctly
- [ ] Bibliography appears in correct format
- [ ] No placeholder citations (Smith et al. XXXX)

### Submission Day

- [ ] One final validation run
- [ ] No last-minute edits without re-validation
- [ ] Bibliography file included in submission package
- [ ] Figures/tables referenced in text match bibliography

## Quality Metrics

### Excellent Bibliography

- ✓ 100% of entries have DOIs (for modern papers)
- ✓ Zero validation errors
- ✓ Zero missing required fields
- ✓ Zero broken DOIs
- ✓ Zero duplicates
- ✓ Consistent formatting throughout
- ✓ All citations manually spot-checked

### Acceptable Bibliography

- ✓ 90%+ of modern entries have DOIs
- ✓ Zero high-severity errors
- ✓ Minor warnings only (e.g., missing recommended fields)
- ✓ Key citations manually verified
- ✓ Compilation succeeds without errors

### Needs Improvement

- ✗ Missing DOIs for recent papers
- ✗ High-severity validation errors
- ✗ Broken or incorrect DOIs
- ✗ Duplicate entries
- ✗ Inconsistent formatting
- ✗ Compilation warnings or errors

## Emergency Fixes

If you discover issues at the last minute:

### Broken DOI

```bash
# Find correct DOI
# Option 1: Search CrossRef
# https://www.crossref.org/

# Option 2: Search on publisher website
# Option 3: Google Scholar

# Re-extract metadata
python scripts/extract_metadata.py --doi CORRECT_DOI
```

### Missing Information

```bash
# Extract from DOI
python scripts/extract_metadata.py --doi 10.xxxx/yyyy

# Or from PMID (biomedical)
python scripts/extract_metadata.py --pmid 12345678

# Or from arXiv
python scripts/extract_metadata.py --arxiv 2103.12345
```

### Duplicate Entries

```bash
# Auto-remove duplicates
python scripts/format_bibtex.py references.bib \
  --deduplicate \
  --output fixed_references.bib
```

### Formatting Errors

```bash
# Auto-fix common issues
python scripts/format_bibtex.py references.bib \
  --output fixed_references.bib

# Then validate
python scripts/validate_citations.py fixed_references.bib
```

## Long-Term Best Practices

### During Research

- [ ] Add citations to bibliography file as you find them
- [ ] Extract metadata immediately using DOI
- [ ] Validate after every 10-20 additions
- [ ] Keep bibliography file under version control

### During Writing

- [ ] Cite as you write
- [ ] Use consistent citation keys
- [ ] Don't delay adding references
- [ ] Validate weekly

### Before Submission

- [ ] Allow 2-3 days for citation cleanup
- [ ] Don't wait until the last day
- [ ] Automate what you can
- [ ] Manually verify critical citations

## Tool Quick Reference

### Extract Metadata

```bash
# From DOI
python scripts/doi_to_bibtex.py 10.1038/nature12345

# From multiple sources
python scripts/extract_metadata.py \
  --doi 10.1038/nature12345 \
  --pmid 12345678 \
  --arxiv 2103.12345 \
  --output references.bib
```

### Validate

```bash
# Basic validation
python scripts/validate_citations.py references.bib

# With DOI checking (slow but thorough)
python scripts/validate_citations.py references.bib --check-dois

# Generate report
python scripts/validate_citations.py references.bib \
  --report validation.json \
  --verbose
```

### Format and Clean

```bash
# Format and fix issues
python scripts/format_bibtex.py references.bib

# Remove duplicates and sort
python scripts/format_bibtex.py references.bib \
  --deduplicate \
  --sort year \
  --descending \
  --output clean_refs.bib
```

## Summary

**Minimum Requirements**:
1. Run `format_bibtex.py --deduplicate`
2. Run `validate_citations.py`
3. Fix all errors
4. Compile successfully

**Recommended**:
1. Format, deduplicate, and sort
2. Validate with `--check-dois`
3. Fix all errors and warnings
4. Manually verify top citations
5. Re-validate after fixes

**Best Practice**:
1. Validate throughout research process
2. Use automated tools consistently
3. Keep bibliography clean and organized
4. Document any special cases
5. Final validation 1-3 days before submission

**Remember**: Citation errors reflect poorly on your scholarship. Taking time to ensure accuracy is worthwhile!

