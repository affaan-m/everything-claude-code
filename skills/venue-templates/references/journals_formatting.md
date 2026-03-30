# Journal Formatting Requirements

Comprehensive formatting requirements and submission guidelines for major scientific journals across disciplines.

**Last Updated**: 2024

---

## Nature Portfolio

### Nature

**Journal Type**: Top-tier multidisciplinary science journal  
**Publisher**: Nature Publishing Group  
**Impact Factor**: ~64 (varies by year)

**Formatting Requirements**:
- **Length**: Articles ~3,000 words (excluding Methods, References, Figure Legends)
- **Structure**: Title, Authors, Affiliations, Abstract (≤200 words), Main text, Methods, References, Acknowledgements, Author Contributions, Competing Interests, Figure Legends
- **Format**: Single column for submission (final published version is two-column)
- **Font**: Any standard font (Times, Arial, Helvetica), 12pt
- **Line spacing**: Double-spaced
- **Margins**: 2.5 cm (1 inch) all sides
- **Page numbers**: Required on all pages
- **Citations**: Numbered sequentially in superscript¹'²'³
- **References**: Nature style (abbreviated journal names)
  - Format: Author, A. A., Author, B. B. & Author, C. C. Article title. *Journal Abbrev.* **vol**, pages (year).
  - Example: Watson, J. D. & Crick, F. H. C. Molecular structure of nucleic acids. *Nature* **171**, 737–738 (1953).
- **Figures**: 
  - Format: TIFF, EPS, PDF (vector preferred)
  - Resolution: 300-600 dpi for photos, 1000 dpi for line art
  - Color: RGB or CMYK
  - Size: Fit to single column (89 mm) or double column (183 mm)
  - Legends: Provided separately, not embedded in figure
- **Tables**: Editable format (Word, Excel), not as images
- **Supplementary Info**: Unlimited, PDF format preferred

**LaTeX Template**: `assets/journals/nature_article.tex`

**Author Guidelines**: https://www.nature.com/nature/for-authors

---

### Nature Communications

**Journal Type**: Open-access multidisciplinary journal  
**Publisher**: Nature Publishing Group

**Formatting Requirements**:
- **Length**: No strict limit (typically 5,000-8,000 words)
- **Structure**: Same as Nature (Title, Abstract, Main text, Methods, References, etc.)
- **Format**: Single column
- **Font**: Times New Roman, Arial, or similar, 12pt
- **Line spacing**: Double-spaced
- **Margins**: 2.5 cm all sides
- **Citations**: Numbered sequentially in superscript
- **References**: Nature style (same as Nature)
- **Figures**: Same requirements as Nature
- **Tables**: Same requirements as Nature
- **Open Access**: All articles are open access (APC applies)

**LaTeX Template**: `assets/journals/nature_communications.tex`

---

### Nature Methods, Nature Biotechnology, Nature Machine Intelligence

**Formatting**: Same as Nature Communications (Nature family journals share similar formatting)

**Discipline-Specific Notes**:
- **Nature Methods**: Emphasize methodological innovation and validation
- **Nature Biotechnology**: Focus on biotechnology applications and translation
- **Nature Machine Intelligence**: AI/ML applications across disciplines

---

## Science Family

### Science

**Journal Type**: Top-tier multidisciplinary science journal  
**Publisher**: American Association for the Advancement of Science (AAAS)

**Formatting Requirements**:
- **Length**: 
  - Research Articles: 2,500 words (text only, excluding refs/figs)
  - Reports: 2,500 words maximum
- **Structure**: Title, Authors, Affiliations, Abstract (≤125 words), Main text, Materials and Methods, References, Acknowledgments, Supplementary Materials
- **Format**: Single column for submission
- **Font**: Times New Roman, 12pt
- **Line spacing**: Double-spaced
- **Margins**: 1 inch all sides
- **Citations**: Numbered sequentially in parentheses (1, 2, 3)
- **References**: Science style (no article titles in main refs, moved to supplementary)
  - Format: A. Author, B. Author, *Journal Abbrev.* **vol**, pages (year).
  - Example: J. D. Watson, F. H. C. Crick, *Nature* **171**, 737 (1953).
- **Figures**: 
  - Format: PDF, EPS, TIFF
  - Resolution: 300 dpi minimum
  - Color: RGB
  - Size: Maximum width 9 cm (single column) or 18.3 cm (double column)
  - Figures count toward page limit
- **Tables**: Include in main text or as separate files
- **Supplementary Materials**: Extensive materials allowed

**LaTeX Template**: `assets/journals/science_article.tex`

**Author Guidelines**: https://www.science.org/content/page/instructions-authors

---

### Science Advances

**Journal Type**: Open-access multidisciplinary journal  
**Publisher**: AAAS

**Formatting Requirements**:
- **Length**: No strict word limit (but concise writing encouraged)
- **Structure**: Similar to Science (more flexible)
- **Format**: Single column
- **Font**: Times New Roman, 12pt
- **Citations**: Numbered in parentheses
- **References**: Science style
- **Figures**: Same as Science
- **Open Access**: All articles open access

**LaTeX Template**: `assets/journals/science_advances.tex`

---

## PLOS (Public Library of Science)

### PLOS ONE

**Journal Type**: Open-access multidisciplinary journal  
**Publisher**: Public Library of Science

**Formatting Requirements**:
- **Length**: No maximum length
- **Structure**: Title, Authors, Affiliations, Abstract, Introduction, Materials and Methods, Results, Discussion, Conclusions (optional), References, Supporting Information
- **Format**: Editable file (LaTeX, Word, RTF)
- **Font**: Times, Arial, or Helvetica, 10-12pt
- **Line spacing**: Double-spaced
- **Margins**: 1 inch (2.54 cm) all sides
- **Page numbers**: Required
- **Citations**: Vancouver style, numbered in brackets [1], [2], [3]
- **References**: Vancouver/NLM format
  - Format: Author AA, Author BB, Author CC. Article title. Journal Abbrev. Year;vol(issue):pages. doi:xx.xxxx
  - Example: Watson JD, Crick FHC. Molecular structure of nucleic acids. Nature. 1953;171(4356):737-738.
- **Figures**:
  - Format: TIFF, EPS, PDF, PNG
  - Resolution: 300-600 dpi
  - Color: RGB
  - Legends: Provided in main text after references
- **Tables**: Editable format, one per page
- **Data Availability**: Statement required
- **Open Access**: All articles open access (APC applies)

**LaTeX Template**: `assets/journals/plos_one.tex`

**Author Guidelines**: https://journals.plos.org/plosone/s/submission-guidelines

---

### PLOS Biology, PLOS Computational Biology, etc.

**Formatting**: Similar to PLOS ONE with discipline-specific variations

**Key Differences**:
- PLOS Biology: More selective, emphasizes broad significance
- PLOS Comp Bio: Focus on computational methods and models

---

## Cell Press

### Cell

**Journal Type**: Top-tier biology journal  
**Publisher**: Cell Press (Elsevier)

**Formatting Requirements**:
- **Length**: 
  - Articles: ~5,000 words (excluding Methods, References)
  - Short Articles: ~2,500 words
- **Structure**: Summary (≤150 words), Keywords, Introduction, Results, Discussion, Experimental Procedures, Acknowledgments, Author Contributions, Declaration of Interests, References
- **Format**: Double-spaced
- **Font**: 12pt
- **Margins**: 1 inch all sides
- **Citations**: Author-year format (Smith et al., 2023)
- **References**: Cell style
  - Format: Author, A.A., and Author, B.B. (Year). Title. *Journal* vol, pages.
  - Example: Watson, J.D., and Crick, F.H. (1953). Molecular structure of nucleic acids. *Nature* 171, 737-738.
- **Figures**:
  - Format: TIFF, EPS preferred
  - Resolution: 300 dpi photos, 1000 dpi line art
  - Color: RGB or CMYK
  - Multipanel figures common
- **Tables**: Editable format
- **eTOC Blurb**: 30-50 word summary required
- **Graphical Abstract**: Required

**LaTeX Template**: `assets/journals/cell_article.tex`

**Author Guidelines**: https://www.cell.com/cell/authors

---

### Neuron, Immunity, Molecular Cell, Developmental Cell

**Formatting**: Similar to Cell with discipline-specific expectations

---

## IEEE Transactions

### IEEE Transactions on [Various Topics]

**Journal Type**: Engineering and computer science journals  
**Publisher**: Institute of Electrical and Electronics Engineers

**Formatting Requirements**:
- **Length**: Varies by transaction (typically 8-12 pages in final format)
- **Structure**: Abstract, Index Terms, Introduction, [Body sections], Conclusion, Acknowledgment, References, Biographies
- **Format**: Two-column
- **Font**: Times New Roman, 10pt
- **Column spacing**: 0.17 inch (4.23 mm)
- **Margins**: 
  - Top: 19 mm (0.75 in)
  - Bottom: 25 mm (1 in)
  - Side: 17 mm (0.67 in)
- **Citations**: Numbered in square brackets [1], [2], [3]
- **References**: IEEE style
  - Format: [1] A. A. Author, "Title of paper," *Journal Abbrev.*, vol. x, no. x, pp. xxx-xxx, Mon. Year.
  - Example: [1] J. D. Watson and F. H. C. Crick, "Molecular structure of nucleic acids," *Nature*, vol. 171, pp. 737-738, Apr. 1953.
- **Figures**:
  - Format: EPS, PDF (vector), TIFF (raster)
  - Resolution: 600-1200 dpi line art, 300 dpi grayscale/color
  - Color: RGB for online, CMYK for print if needed
  - Position: Top or bottom of column
- **Tables**: LaTeX table environment, positioned at top/bottom
- **Equations**: Numbered consecutively

**LaTeX Template**: `assets/journals/ieee_trans.tex`

**Author Guidelines**: https://journals.ieeeauthorcenter.ieee.org/

---

### IEEE Access

**Journal Type**: Open-access multidisciplinary engineering journal  
**Publisher**: IEEE

**Formatting**: Similar to IEEE Transactions
- **Length**: No page limits
- **Open Access**: All articles open access
- **Rapid publication**: Faster review than Transactions

**LaTeX Template**: `assets/journals/ieee_access.tex`

---

## ACM Publications

### ACM Transactions

**Journal Type**: Computer science transactions  
**Publisher**: Association for Computing Machinery

**Formatting Requirements**:
- **Length**: No strict limit
- **Structure**: Abstract, CCS Concepts, Keywords, ACM Reference Format, Introduction, [Body], Conclusion, Acknowledgments, References
- **Format**: Two-column (final), single-column for submission OK
- **Font**: Depends on template (usually 9-10pt)
- **Class**: Use `acmart` LaTeX document class
- **Citations**: Numbered [1] or author-year depending on venue
- **References**: ACM style
  - Format: Author. Year. Title. Journal vol, issue (Year), pages. DOI
  - Example: James D. Watson and Francis H. C. Crick. 1953. Molecular structure of nucleic acids. Nature 171, 4356 (1953), 737-738. https://doi.org/10.1038/171737a0
- **Figures**: EPS, PDF (vector preferred), high-resolution raster
- **CCS Concepts**: Required (ACM Computing Classification System)
- **Keywords**: Required

**LaTeX Template**: `assets/journals/acm_article.tex`

**Author Guidelines**: https://www.acm.org/publications/authors

---

## Springer Journals

### General Springer Journals

**Publisher**: Springer Nature

**Formatting Requirements**:
- **Length**: Varies by journal (check specific journal)
- **Format**: Single column for submission (LaTeX or Word)
- **Font**: 10-12pt
- **Line spacing**: Double or 1.5
- **Citations**: Numbered or author-year (varies by journal)
- **References**: Springer style (similar to Vancouver or author-year)
  - Numbered: Author AA, Author BB (Year) Title. Journal vol:pages
  - Author-year: Author AA, Author BB (Year) Title. Journal vol:pages
- **Figures**: TIFF, EPS, PDF; 300+ dpi
- **Tables**: Editable format
- **Document Class**: `svjour3` for many Springer journals

**LaTeX Template**: `assets/journals/springer_article.tex`

**Author Guidelines**: Varies by specific journal

---

## Elsevier Journals

### General Elsevier Journals

**Publisher**: Elsevier

**Formatting Requirements**:
- **Length**: Varies widely by journal
- **Format**: Single column (LaTeX or Word)
- **Font**: 12pt
- **Line spacing**: Double-spaced
- **Citations**: Numbered or author-year (check journal guide)
- **References**: Style varies by journal (Harvard, Vancouver, numbered)
  - Check specific journal's "Guide for Authors"
- **Figures**: TIFF, EPS; 300+ dpi
- **Tables**: Editable format
- **Document Class**: `elsarticle` LaTeX class

**LaTeX Template**: `assets/journals/elsevier_article.tex`

**Author Guidelines**: https://www.elsevier.com/authors (select specific journal)

---

## BMC Journals

### BMC Biology, BMC Bioinformatics, etc.

**Publisher**: BioMed Central (Springer Nature)

**Formatting Requirements**:
- **Length**: No maximum length
- **Structure**: Abstract (structured), Keywords, Background, [Methods/Results/Discussion], Conclusions, Abbreviations, Declarations (Ethics, Consent, Availability, Competing interests, Funding, Authors' contributions, Acknowledgements), References
- **Format**: Single column
- **Font**: Arial or Times, 12pt
- **Line spacing**: Double
- **Citations**: Vancouver style, numbered in brackets [1]
- **References**: Vancouver/NLM format
- **Figures**: TIFF, EPS, PNG; 300+ dpi
- **Tables**: Editable
- **Open Access**: All BMC journals are open access
- **Data Availability**: Statement required

**LaTeX Template**: `assets/journals/bmc_article.tex`

**Author Guidelines**: https://www.biomedcentral.com/getpublished

---

## Frontiers Journals

### Frontiers in [Various Topics]

**Publisher**: Frontiers Media

**Formatting Requirements**:
- **Length**: Varies by article type (Research Article ~12 pages, Brief Research Report ~4 pages)
- **Structure**: Abstract, Keywords, Introduction, Materials and Methods, Results, Discussion, Conclusion, Data Availability Statement, Ethics Statement, Author Contributions, Funding, Acknowledgments, Conflict of Interest, References
- **Format**: Single column
- **Font**: Times New Roman, 12pt
- **Line spacing**: Double
- **Citations**: Numbered (Frontiers style)
- **References**: Frontiers format
  - Format: Author A., Author B., Author C. (Year). Title. *Journal Abbrev.* vol:pages. doi
  - Example: Watson J. D., Crick F. H. C. (1953). Molecular structure of nucleic acids. *Nature* 171:737-738. doi:10.1038/171737a0
- **Figures**: TIFF, EPS; 300 dpi minimum
- **Tables**: Editable
- **Open Access**: All Frontiers journals are open access
- **Figure Legends**: Detailed, 350 words max per figure

**LaTeX Template**: `assets/journals/frontiers_article.tex`

**Author Guidelines**: https://www.frontiersin.org/guidelines/author-guidelines

---

## Specialized Journals

### PNAS (Proceedings of the National Academy of Sciences)

**Formatting Requirements**:
- **Length**: 6 pages (text, figures, tables combined)
- **Abstract**: 250 words max
- **Significance Statement**: 120 words max (required)
- **Structure**: Abstract, Significance, Main text, Materials and Methods, Acknowledgments, References
- **Format**: Single column
- **Citations**: Numbered
- **References**: PNAS style
- **LaTeX Class**: `pnas-new`

**LaTeX Template**: `assets/journals/pnas_article.tex`

---

### Physical Review Letters (PRL)

**Publisher**: American Physical Society

**Formatting Requirements**:
- **Length**: 4 pages (including figures and references)
- **Format**: Two-column (REVTeX 4.2)
- **Abstract**: No more than 600 characters
- **Citations**: Numbered
- **References**: APS style
- **Document Class**: `revtex4-2`

**LaTeX Template**: `assets/journals/prl_article.tex`

---

### New England Journal of Medicine (NEJM)

**Formatting Requirements**:
- **Length**: Original Articles ~3,000 words
- **Structure**: Abstract (structured, 250 words), Introduction, Methods, Results, Discussion, References
- **Format**: Double-spaced
- **Citations**: Numbered
- **References**: NEJM style (modified Vancouver)
- **Figures**: High resolution, professional quality
- **Word submission preferred** (LaTeX less common)

---

### The Lancet

**Formatting Requirements**:
- **Length**: Articles ~3,000 words
- **Abstract**: Structured, 300 words
- **Structure**: Panel (summary box), Introduction, Methods, Results, Discussion, References
- **Citations**: Numbered
- **References**: Lancet style (modified Vancouver)
- **Word preferred** for submission

---

## Quick Reference Table

| Journal | Max Length | Format | Citations | Template |
|---------|-----------|--------|-----------|----------|
| **Nature** | ~3,000 words | Single col | Superscript | `nature_article.tex` |
| **Science** | 2,500 words | Single col | (1) brackets | `science_article.tex` |
| **PLOS ONE** | Unlimited | Single col | [1] Vancouver | `plos_one.tex` |
| **Cell** | ~5,000 words | Double sp | (Author, year) | `cell_article.tex` |
| **IEEE Trans** | 8-12 pages | Two col | [1] IEEE | `ieee_trans.tex` |
| **ACM Trans** | Variable | Two col | [1] or author-yr | `acm_article.tex` |
| **Springer** | Variable | Single col | Numbered/author-yr | `springer_article.tex` |
| **BMC** | Unlimited | Single col | [1] Vancouver | `bmc_article.tex` |
| **Frontiers** | ~12 pages | Single col | Numbered | `frontiers_article.tex` |

---

## Notes

1. **Always check official guidelines**: Journal requirements change; verify before submission
2. **Template currency**: These templates are updated regularly but may lag official changes
3. **Supplementary materials**: Most journals allow extensive supplementary materials
4. **Preprint policies**: Check journal's preprint policy (most allow arXiv, bioRxiv)
5. **Open access options**: Many subscription journals offer open access for a fee
6. **LaTeX vs. Word**: Most journals accept both; LaTeX preferred for math-heavy content

## Getting Official Templates

Many journals provide official LaTeX templates:
- **Nature**: Download from journal website
- **IEEE**: IEEEtran class (widely available)
- **ACM**: acmart class (CTAN)
- **Elsevier**: elsarticle class (CTAN)
- **Springer**: svjour3 class (journal website)

Check journal's "For Authors" or "Submit" page for the most current templates.

