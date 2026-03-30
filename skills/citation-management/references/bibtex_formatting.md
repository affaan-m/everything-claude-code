# BibTeX Formatting Guide

Comprehensive guide to BibTeX entry types, required fields, formatting conventions, and best practices.

## Overview

BibTeX is the standard bibliography format for LaTeX documents. Proper formatting ensures:
- Correct citation rendering
- Consistent formatting
- Compatibility with citation styles
- No compilation errors

This guide covers all common entry types and formatting rules.

## Entry Types

### @article - Journal Articles

**Most common entry type** for peer-reviewed journal articles.

**Required fields**:
- `author`: Author names
- `title`: Article title
- `journal`: Journal name
- `year`: Publication year

**Optional fields**:
- `volume`: Volume number
- `number`: Issue number
- `pages`: Page range
- `month`: Publication month
- `doi`: Digital Object Identifier
- `url`: URL
- `note`: Additional notes

**Template**:
```bibtex
@article{CitationKey2024,
  author  = {Last1, First1 and Last2, First2},
  title   = {Article Title Here},
  journal = {Journal Name},
  year    = {2024},
  volume  = {10},
  number  = {3},
  pages   = {123--145},
  doi     = {10.1234/journal.2024.123456},
  month   = jan
}
```

**Example**:
```bibtex
@article{Jumper2021,
  author  = {Jumper, John and Evans, Richard and Pritzel, Alexander and others},
  title   = {Highly Accurate Protein Structure Prediction with {AlphaFold}},
  journal = {Nature},
  year    = {2021},
  volume  = {596},
  number  = {7873},
  pages   = {583--589},
  doi     = {10.1038/s41586-021-03819-2}
}
```

### @book - Books

**For entire books**.

**Required fields**:
- `author` OR `editor`: Author(s) or editor(s)
- `title`: Book title
- `publisher`: Publisher name
- `year`: Publication year

**Optional fields**:
- `volume`: Volume number (if multi-volume)
- `series`: Series name
- `address`: Publisher location
- `edition`: Edition number
- `isbn`: ISBN
- `url`: URL

**Template**:
```bibtex
@book{CitationKey2024,
  author    = {Last, First},
  title     = {Book Title},
  publisher = {Publisher Name},
  year      = {2024},
  edition   = {3},
  address   = {City, Country},
  isbn      = {978-0-123-45678-9}
}
```

**Example**:
```bibtex
@book{Kumar2021,
  author    = {Kumar, Vinay and Abbas, Abul K. and Aster, Jon C.},
  title     = {Robbins and Cotran Pathologic Basis of Disease},
  publisher = {Elsevier},
  year      = {2021},
  edition   = {10},
  address   = {Philadelphia, PA},
  isbn      = {978-0-323-53113-9}
}
```

### @inproceedings - Conference Papers

**For papers in conference proceedings**.

**Required fields**:
- `author`: Author names
- `title`: Paper title
- `booktitle`: Conference/proceedings name
- `year`: Year

**Optional fields**:
- `editor`: Proceedings editor(s)
- `volume`: Volume number
- `series`: Series name
- `pages`: Page range
- `address`: Conference location
- `month`: Conference month
- `organization`: Organizing body
- `publisher`: Publisher
- `doi`: DOI

**Template**:
```bibtex
@inproceedings{CitationKey2024,
  author    = {Last, First},
  title     = {Paper Title},
  booktitle = {Proceedings of Conference Name},
  year      = {2024},
  pages     = {123--145},
  address   = {City, Country},
  month     = jun
}
```

**Example**:
```bibtex
@inproceedings{Vaswani2017,
  author    = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and others},
  title     = {Attention is All You Need},
  booktitle = {Advances in Neural Information Processing Systems 30 (NeurIPS 2017)},
  year      = {2017},
  pages     = {5998--6008},
  address   = {Long Beach, CA}
}
```

**Note**: `@conference` is an alias for `@inproceedings`.

### @incollection - Book Chapters

**For chapters in edited books**.

**Required fields**:
- `author`: Chapter author(s)
- `title`: Chapter title
- `booktitle`: Book title
- `publisher`: Publisher name
- `year`: Publication year

**Optional fields**:
- `editor`: Book editor(s)
- `volume`: Volume number
- `series`: Series name
- `type`: Type of section (e.g., "chapter")
- `chapter`: Chapter number
- `pages`: Page range
- `address`: Publisher location
- `edition`: Edition
- `month`: Month

**Template**:
```bibtex
@incollection{CitationKey2024,
  author    = {Last, First},
  title     = {Chapter Title},
  booktitle = {Book Title},
  editor    = {Editor, Last and Editor2, Last},
  publisher = {Publisher Name},
  year      = {2024},
  pages     = {123--145},
  chapter   = {5}
}
```

**Example**:
```bibtex
@incollection{Brown2020,
  author    = {Brown, Peter O. and Botstein, David},
  title     = {Exploring the New World of the Genome with {DNA} Microarrays},
  booktitle = {DNA Microarrays: A Molecular Cloning Manual},
  editor    = {Eisen, Michael B. and Brown, Patrick O.},
  publisher = {Cold Spring Harbor Laboratory Press},
  year      = {2020},
  pages     = {1--45},
  address   = {Cold Spring Harbor, NY}
}
```

### @phdthesis - Doctoral Dissertations

**For PhD dissertations and theses**.

**Required fields**:
- `author`: Author name
- `title`: Thesis title
- `school`: Institution
- `year`: Year

**Optional fields**:
- `type`: Type (e.g., "PhD dissertation", "PhD thesis")
- `address`: Institution location
- `month`: Month
- `url`: URL
- `note`: Additional notes

**Template**:
```bibtex
@phdthesis{CitationKey2024,
  author = {Last, First},
  title  = {Dissertation Title},
  school = {University Name},
  year   = {2024},
  type   = {{PhD} dissertation},
  address = {City, State}
}
```

**Example**:
```bibtex
@phdthesis{Johnson2023,
  author  = {Johnson, Mary L.},
  title   = {Novel Approaches to Cancer Immunotherapy Using {CRISPR} Technology},
  school  = {Stanford University},
  year    = {2023},
  type    = {{PhD} dissertation},
  address = {Stanford, CA}
}
```

**Note**: `@mastersthesis` is similar but for Master's theses.

### @mastersthesis - Master's Theses

**For Master's theses**.

**Required fields**:
- `author`: Author name
- `title`: Thesis title
- `school`: Institution
- `year`: Year

**Template**:
```bibtex
@mastersthesis{CitationKey2024,
  author = {Last, First},
  title  = {Thesis Title},
  school = {University Name},
  year   = {2024}
}
```

### @misc - Miscellaneous

**For items that don't fit other categories** (preprints, datasets, software, websites, etc.).

**Required fields**:
- `author` (if known)
- `title`
- `year`

**Optional fields**:
- `howpublished`: Repository, website, format
- `url`: URL
- `doi`: DOI
- `note`: Additional information
- `month`: Month

**Template for preprints**:
```bibtex
@misc{CitationKey2024,
  author       = {Last, First},
  title        = {Preprint Title},
  year         = {2024},
  howpublished = {bioRxiv},
  doi          = {10.1101/2024.01.01.123456},
  note         = {Preprint}
}
```

**Template for datasets**:
```bibtex
@misc{DatasetName2024,
  author       = {Last, First},
  title        = {Dataset Title},
  year         = {2024},
  howpublished = {Zenodo},
  doi          = {10.5281/zenodo.123456},
  note         = {Version 1.2}
}
```

**Template for software**:
```bibtex
@misc{SoftwareName2024,
  author       = {Last, First},
  title        = {Software Name},
  year         = {2024},
  howpublished = {GitHub},
  url          = {https://github.com/user/repo},
  note         = {Version 2.0}
}
```

### @techreport - Technical Reports

**For technical reports**.

**Required fields**:
- `author`: Author name(s)
- `title`: Report title
- `institution`: Institution
- `year`: Year

**Optional fields**:
- `type`: Type of report
- `number`: Report number
- `address`: Institution location
- `month`: Month

**Template**:
```bibtex
@techreport{CitationKey2024,
  author      = {Last, First},
  title       = {Report Title},
  institution = {Institution Name},
  year        = {2024},
  type        = {Technical Report},
  number      = {TR-2024-01}
}
```

### @unpublished - Unpublished Work

**For unpublished works** (not preprints - use @misc for those).

**Required fields**:
- `author`: Author name(s)
- `title`: Work title
- `note`: Description

**Optional fields**:
- `month`: Month
- `year`: Year

**Template**:
```bibtex
@unpublished{CitationKey2024,
  author = {Last, First},
  title  = {Work Title},
  note   = {Unpublished manuscript},
  year   = {2024}
}
```

### @online/@electronic - Online Resources

**For web pages and online-only content**.

**Note**: Not standard BibTeX, but supported by many bibliography packages (biblatex).

**Required fields**:
- `author` OR `organization`
- `title`
- `url`
- `year`

**Template**:
```bibtex
@online{CitationKey2024,
  author = {{Organization Name}},
  title  = {Page Title},
  url    = {https://example.com/page},
  year   = {2024},
  note   = {Accessed: 2024-01-15}
}
```

## Formatting Rules

### Citation Keys

**Convention**: `FirstAuthorYEARkeyword`

**Examples**:
```bibtex
Smith2024protein
Doe2023machine
JohnsonWilliams2024cancer  % Multiple authors, no space
NatureEditorial2024        % No author, use publication
WHO2024guidelines          % Organization author
```

**Rules**:
- Alphanumeric plus: `-`, `_`, `.`, `:`
- No spaces
- Case-sensitive
- Unique within file
- Descriptive

**Avoid**:
- Special characters: `@`, `#`, `&`, `%`, `$`
- Spaces: use CamelCase or underscores
- Starting with numbers: `2024Smith` (some systems disallow)

### Author Names

**Recommended format**: `Last, First Middle`

**Single author**:
```bibtex
author = {Smith, John}
author = {Smith, John A.}
author = {Smith, John Andrew}
```

**Multiple authors** - separate with `and`:
```bibtex
author = {Smith, John and Doe, Jane}
author = {Smith, John A. and Doe, Jane M. and Johnson, Mary L.}
```

**Many authors** (10+):
```bibtex
author = {Smith, John and Doe, Jane and Johnson, Mary and others}
```

**Special cases**:
```bibtex
% Suffix (Jr., III, etc.)
author = {King, Jr., Martin Luther}

% Organization as author
author = {{World Health Organization}}
% Note: Double braces keep as single entity

% Multiple surnames
author = {Garc{\'i}a-Mart{\'i}nez, Jos{\'e}}

% Particles (van, von, de, etc.)
author = {van der Waals, Johannes}
author = {de Broglie, Louis}
```

**Wrong formats** (don't use):
```bibtex
author = {Smith, J.; Doe, J.}  % Semicolons (wrong)
author = {Smith, J., Doe, J.}  % Commas (wrong)
author = {Smith, J. & Doe, J.} % Ampersand (wrong)
author = {Smith J}             % No comma
```

### Title Capitalization

**Protect capitalization** with braces:

```bibtex
% Proper nouns, acronyms, formulas
title = {{AlphaFold}: Protein Structure Prediction}
title = {Machine Learning for {DNA} Sequencing}
title = {The {Ising} Model in Statistical Physics}
title = {{CRISPR-Cas9} Gene Editing Technology}
```

**Reason**: Citation styles may change capitalization. Braces protect.

**Examples**:
```bibtex
% Good
title = {Advances in {COVID-19} Treatment}
title = {Using {Python} for Data Analysis}
title = {The {AlphaFold} Protein Structure Database}

% Will be lowercase in title case styles
title = {Advances in COVID-19 Treatment}  % covid-19
title = {Using Python for Data Analysis}  % python
```

**Whole title protection** (rarely needed):
```bibtex
title = {{This Entire Title Keeps Its Capitalization}}
```

### Page Ranges

**Use en-dash** (double hyphen `--`):

```bibtex
pages = {123--145}     % Correct
pages = {1234--1256}   % Correct
pages = {e0123456}     % Article ID (PLOS, etc.)
pages = {123}          % Single page
```

**Wrong**:
```bibtex
pages = {123-145}      % Single hyphen (don't use)
pages = {pp. 123-145}  % "pp." not needed
pages = {123–145}      % Unicode en-dash (may cause issues)
```

### Month Names

**Use three-letter abbreviations** (unquoted):

```bibtex
month = jan
month = feb
month = mar
month = apr
month = may
month = jun
month = jul
month = aug
month = sep
month = oct
month = nov
month = dec
```

**Or numeric**:
```bibtex
month = {1}   % January
month = {12}  % December
```

**Or full name in braces**:
```bibtex
month = {January}
```

**Standard abbreviations work without quotes** because they're defined in BibTeX.

### Journal Names

**Full name** (not abbreviated):

```bibtex
journal = {Nature}
journal = {Science}
journal = {Cell}
journal = {Proceedings of the National Academy of Sciences}
journal = {Journal of the American Chemical Society}
```

**Bibliography style** will handle abbreviation if needed.

**Avoid manual abbreviation**:
```bibtex
% Don't do this in BibTeX file
journal = {Proc. Natl. Acad. Sci. U.S.A.}

% Do this instead
journal = {Proceedings of the National Academy of Sciences}
```

**Exception**: If style requires abbreviations, use full abbreviated form:
```bibtex
journal = {Proc. Natl. Acad. Sci. U.S.A.}  % If required by style
```

### DOI Formatting

**URL format** (preferred):

```bibtex
doi = {10.1038/s41586-021-03819-2}
```

**Not**:
```bibtex
doi = {https://doi.org/10.1038/s41586-021-03819-2}  % Don't include URL
doi = {doi:10.1038/s41586-021-03819-2}              % Don't include prefix
```

**LaTeX** will format as URL automatically.

**Note**: No period after DOI field!

### URL Formatting

```bibtex
url = {https://www.example.com/article}
```

**Use**:
- When DOI not available
- For web pages
- For supplementary materials

**Don't duplicate**:
```bibtex
% Don't include both if DOI URL is same as url
doi = {10.1038/nature12345}
url = {https://doi.org/10.1038/nature12345}  % Redundant!
```

### Special Characters

**Accents and diacritics**:
```bibtex
author = {M{\"u}ller, Hans}        % ü
author = {Garc{\'i}a, Jos{\'e}}    % í, é
author = {Erd{\H{o}}s, Paul}       % ő
author = {Schr{\"o}dinger, Erwin}  % ö
```

**Or use UTF-8** (with proper LaTeX setup):
```bibtex
author = {Müller, Hans}
author = {García, José}
```

**Mathematical symbols**:
```bibtex
title = {The $\alpha$-helix Structure}
title = {$\beta$-sheet Prediction}
```

**Chemical formulas**:
```bibtex
title = {H$_2$O Molecular Dynamics}
% Or with chemformula package:
title = {\ce{H2O} Molecular Dynamics}
```

### Field Order

**Recommended order** (for readability):

```bibtex
@article{Key,
  author  = {},
  title   = {},
  journal = {},
  year    = {},
  volume  = {},
  number  = {},
  pages   = {},
  doi     = {},
  url     = {},
  note    = {}
}
```

**Rules**:
- Most important fields first
- Consistent across entries
- Use formatter to standardize

## Best Practices

### 1. Consistent Formatting

Use same format throughout:
- Author name format
- Title capitalization
- Journal names
- Citation key style

### 2. Required Fields

Always include:
- All required fields for entry type
- DOI for modern papers (2000+)
- Volume and pages for articles
- Publisher for books

### 3. Protect Capitalization

Use braces for:
- Proper nouns: `{AlphaFold}`
- Acronyms: `{DNA}`, `{CRISPR}`
- Formulas: `{H2O}`
- Names: `{Python}`, `{R}`

### 4. Complete Author Lists

Include all authors when possible:
- All authors if <10
- Use "and others" for 10+
- Don't abbreviate to "et al." manually

### 5. Use Standard Entry Types

Choose correct entry type:
- Journal article → `@article`
- Book → `@book`
- Conference paper → `@inproceedings`
- Preprint → `@misc`

### 6. Validate Syntax

Check for:
- Balanced braces
- Commas after fields
- Unique citation keys
- Valid entry types

### 7. Use Formatters

Use automated tools:
```bash
python scripts/format_bibtex.py references.bib
```

Benefits:
- Consistent formatting
- Catch syntax errors
- Standardize field order
- Fix common issues

## Common Mistakes

### 1. Wrong Author Separator

**Wrong**:
```bibtex
author = {Smith, J.; Doe, J.}    % Semicolon
author = {Smith, J., Doe, J.}    % Comma
author = {Smith, J. & Doe, J.}   % Ampersand
```

**Correct**:
```bibtex
author = {Smith, John and Doe, Jane}
```

### 2. Missing Commas

**Wrong**:
```bibtex
@article{Smith2024,
  author = {Smith, John}    % Missing comma!
  title = {Title}
}
```

**Correct**:
```bibtex
@article{Smith2024,
  author = {Smith, John},   % Comma after each field
  title = {Title}
}
```

### 3. Unprotected Capitalization

**Wrong**:
```bibtex
title = {Machine Learning with Python}
% "Python" will become "python" in title case
```

**Correct**:
```bibtex
title = {Machine Learning with {Python}}
```

### 4. Single Hyphen in Pages

**Wrong**:
```bibtex
pages = {123-145}   % Single hyphen
```

**Correct**:
```bibtex
pages = {123--145}  % Double hyphen (en-dash)
```

### 5. Redundant "pp." in Pages

**Wrong**:
```bibtex
pages = {pp. 123--145}
```

**Correct**:
```bibtex
pages = {123--145}
```

### 6. DOI with URL Prefix

**Wrong**:
```bibtex
doi = {https://doi.org/10.1038/nature12345}
doi = {doi:10.1038/nature12345}
```

**Correct**:
```bibtex
doi = {10.1038/nature12345}
```

## Example Complete Bibliography

```bibtex
% Journal article
@article{Jumper2021,
  author  = {Jumper, John and Evans, Richard and Pritzel, Alexander and others},
  title   = {Highly Accurate Protein Structure Prediction with {AlphaFold}},
  journal = {Nature},
  year    = {2021},
  volume  = {596},
  number  = {7873},
  pages   = {583--589},
  doi     = {10.1038/s41586-021-03819-2}
}

% Book
@book{Kumar2021,
  author    = {Kumar, Vinay and Abbas, Abul K. and Aster, Jon C.},
  title     = {Robbins and Cotran Pathologic Basis of Disease},
  publisher = {Elsevier},
  year      = {2021},
  edition   = {10},
  address   = {Philadelphia, PA},
  isbn      = {978-0-323-53113-9}
}

% Conference paper
@inproceedings{Vaswani2017,
  author    = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and others},
  title     = {Attention is All You Need},
  booktitle = {Advances in Neural Information Processing Systems 30 (NeurIPS 2017)},
  year      = {2017},
  pages     = {5998--6008}
}

% Book chapter
@incollection{Brown2020,
  author    = {Brown, Peter O. and Botstein, David},
  title     = {Exploring the New World of the Genome with {DNA} Microarrays},
  booktitle = {DNA Microarrays: A Molecular Cloning Manual},
  editor    = {Eisen, Michael B. and Brown, Patrick O.},
  publisher = {Cold Spring Harbor Laboratory Press},
  year      = {2020},
  pages     = {1--45}
}

% PhD thesis
@phdthesis{Johnson2023,
  author  = {Johnson, Mary L.},
  title   = {Novel Approaches to Cancer Immunotherapy},
  school  = {Stanford University},
  year    = {2023},
  type    = {{PhD} dissertation}
}

% Preprint
@misc{Zhang2024,
  author       = {Zhang, Yi and Chen, Li and Wang, Hui},
  title        = {Novel Therapeutic Targets in {Alzheimer}'s Disease},
  year         = {2024},
  howpublished = {bioRxiv},
  doi          = {10.1101/2024.01.001},
  note         = {Preprint}
}

% Dataset
@misc{AlphaFoldDB2021,
  author       = {{DeepMind} and {EMBL-EBI}},
  title        = {{AlphaFold} Protein Structure Database},
  year         = {2021},
  howpublished = {Database},
  url          = {https://alphafold.ebi.ac.uk/},
  doi          = {10.1093/nar/gkab1061}
}
```

## Summary

BibTeX formatting essentials:

✓ **Choose correct entry type** (@article, @book, etc.)  
✓ **Include all required fields**  
✓ **Use `and` for multiple authors**  
✓ **Protect capitalization** with braces  
✓ **Use `--` for page ranges**  
✓ **Include DOI** for modern papers  
✓ **Validate syntax** before compilation  

Use formatting tools to ensure consistency:
```bash
python scripts/format_bibtex.py references.bib
```

Properly formatted BibTeX ensures correct, consistent citations across all bibliography styles!

