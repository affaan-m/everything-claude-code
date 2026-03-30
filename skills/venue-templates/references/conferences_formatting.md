# Conference Formatting Requirements

Comprehensive formatting requirements and submission guidelines for major academic conferences across disciplines.

**Last Updated**: 2024

---

## Machine Learning & Artificial Intelligence

### NeurIPS (Neural Information Processing Systems)

**Conference Type**: Top-tier machine learning conference  
**Frequency**: Annual (December)

**Formatting Requirements**:
- **Page Limit**: 
  - Main paper: 8 pages (excluding references)
  - References: Unlimited
  - Appendix/Supplementary: Unlimited (optional, reviewed at discretion)
- **Format**: Two-column
- **Font**: Times or Times New Roman, 10pt for body text
- **Line spacing**: Single-spaced
- **Margins**: 1 inch (2.54 cm) all sides
- **Column separation**: 0.25 inch (0.635 cm)
- **Paper size**: US Letter (8.5 × 11 inches)
- **Anonymization**: **Required** for initial submission (double-blind review)
  - Remove author names, affiliations
  - Anonymize self-citations ("Author et al." → "Anonymous et al.")
  - Remove acknowledgments revealing identity
- **Citations**: Numbered in square brackets [1], [2-4]
- **References**: Any consistent style (commonly uses numbered references)
- **Figures**: 
  - High resolution (300+ dpi)
  - Colorblind-friendly palettes recommended
  - Can span both columns if needed
- **Tables**: Clear, readable at publication size
- **Equations**: Numbered if referenced
- **LaTeX Class**: `neurips_2024.sty` (updated annually)
- **Supplementary Materials**: 
  - Code strongly encouraged (GitHub, anonymous repo for review)
  - Additional experiments, proofs
  - Not counted toward page limit

**LaTeX Template**: `assets/journals/neurips_article.tex`

**Submission Notes**:
- Use official style file (changes yearly)
- Paper ID on first page (auto-generated during submission)
- Include "broader impact" statement (varies by year)
- Reproducibility checklist required

**Website**: https://neurips.cc/

---

### ICML (International Conference on Machine Learning)

**Conference Type**: Top-tier machine learning conference  
**Frequency**: Annual (July)

**Formatting Requirements**:
- **Page Limit**: 
  - Main paper: 8 pages (excluding references and appendix)
  - References: Unlimited
  - Appendix: Unlimited (optional)
- **Format**: Two-column
- **Font**: Times, 10pt
- **Line spacing**: Single-spaced
- **Margins**: 1 inch all sides
- **Paper size**: US Letter
- **Anonymization**: **Required** (double-blind)
- **Citations**: Numbered or author-year (consistent style)
- **Figures**: High resolution, colorblind-safe recommended
- **LaTeX Class**: `icml2024.sty` (updated yearly)
- **Supplementary**: Strongly encouraged (code, data, appendix)

**LaTeX Template**: `assets/journals/icml_article.tex`

**Submission Notes**:
- Must use official ICML style file
- Checklist for reproducibility
- Ethics statement if applicable

**Website**: https://icml.cc/

---

### ICLR (International Conference on Learning Representations)

**Conference Type**: Top-tier deep learning conference  
**Frequency**: Annual (April/May)

**Formatting Requirements**:
- **Page Limit**: 
  - Main paper: 8 pages (excluding references, appendix, ethics statement)
  - References: Unlimited
  - Appendix: Unlimited
- **Format**: Two-column
- **Font**: Times, 10pt
- **Anonymization**: **Required** (double-blind)
- **Citations**: Numbered [1] or author-year
- **LaTeX Class**: `iclr2024_conference.sty`
- **Supplementary**: Code and data encouraged (anonymous GitHub)
- **Open Review**: Reviews and responses are public post-decision

**LaTeX Template**: `assets/journals/iclr_article.tex`

**Unique Features**:
- OpenReview platform (transparent review process)
- Author-reviewer discussion during review
- Camera-ready can exceed 8 pages

**Website**: https://iclr.cc/

---

### CVPR (Computer Vision and Pattern Recognition)

**Conference Type**: Top-tier computer vision conference  
**Frequency**: Annual (June)

**Formatting Requirements**:
- **Page Limit**: 
  - Main paper: 8 pages (including figures and tables, excluding references)
  - References: Unlimited (separate section)
- **Format**: Two-column
- **Font**: Times Roman, 10pt
- **Anonymization**: **Required** (double-blind)
  - Blur faces in images if needed
  - Anonymize datasets if they reveal identity
- **Paper size**: US Letter
- **Citations**: Numbered [1]
- **Figures**: High resolution, can be color
- **LaTeX Template**: CVPR official template (changes yearly)
- **Supplementary Material**: 
  - Video demonstrations encouraged
  - Additional results, code
  - 100 MB limit for all supplementary files

**LaTeX Template**: `assets/journals/cvpr_article.tex`

**Website**: https://cvpr.thecvf.com/

---

### AAAI (Association for the Advancement of Artificial Intelligence)

**Conference Type**: Major AI conference  
**Frequency**: Annual (February)

**Formatting Requirements**:
- **Page Limit**: 
  - Technical papers: 7 pages (excluding references)
  - References: Unlimited
- **Format**: Two-column
- **Font**: Times Roman, 10pt
- **Anonymization**: **Required** (double-blind)
- **Paper size**: US Letter
- **Citations**: Various styles accepted (be consistent)
- **LaTeX Template**: AAAI official style
- **Supplementary**: Optional appendix

**LaTeX Template**: `assets/journals/aaai_article.tex`

**Website**: https://aaai.org/conference/aaai/

---

### IJCAI (International Joint Conference on Artificial Intelligence)

**Conference Type**: Major AI conference  
**Frequency**: Annual

**Formatting Requirements**:
- **Page Limit**: 7 pages (excluding references)
- **Format**: Two-column
- **Font**: Times, 10pt
- **Anonymization**: **Required**
- **LaTeX Template**: IJCAI official style

---

## Computer Science

### ACM CHI (Human-Computer Interaction)

**Conference Type**: Premier HCI conference  
**Frequency**: Annual (April/May)

**Formatting Requirements**:
- **Page Limit**: 
  - Papers: 10 pages (excluding references)
  - Late-Breaking Work: 4 pages
- **Format**: Single-column ACM format
- **Font**: Depends on ACM template
- **Anonymization**: **Required** for Papers track
- **LaTeX Class**: `acmart` with CHI proceedings format
- **Citations**: ACM style (numbered or author-year)
- **Figures**: High quality, accessibility considered
- **Accessibility**: Alt text for figures encouraged

**LaTeX Template**: `assets/journals/chi_article.tex`

**Website**: https://chi.acm.org/

---

### SIGKDD (Knowledge Discovery and Data Mining)

**Conference Type**: Top data mining conference  
**Frequency**: Annual (August)

**Formatting Requirements**:
- **Page Limit**: 
  - Research Track: 9 pages (excluding references)
  - Applied Data Science: 9 pages
- **Format**: Two-column
- **LaTeX Class**: `acmart` (sigconf format)
- **Font**: ACM template default
- **Anonymization**: **Required** (double-blind)
- **Citations**: ACM numbered style
- **Supplementary**: Code and data encouraged

**LaTeX Template**: `assets/journals/kdd_article.tex`

**Website**: https://kdd.org/

---

### EMNLP (Empirical Methods in Natural Language Processing)

**Conference Type**: Top NLP conference  
**Frequency**: Annual (November/December)

**Formatting Requirements**:
- **Page Limit**: 
  - Long papers: 8 pages (+ unlimited references and appendix)
  - Short papers: 4 pages (+ unlimited references)
- **Format**: Two-column
- **Font**: Times New Roman, 11pt
- **Anonymization**: **Required** (double-blind)
  - Do not include author names or affiliations
  - Self-citations should be anonymized
- **Paper size**: US Letter or A4
- **Citations**: Named style similar to ACL
- **LaTeX Template**: ACL/EMNLP official style
- **Supplementary**: Appendix unlimited, code encouraged

**LaTeX Template**: `assets/journals/emnlp_article.tex`

**Website**: https://www.emnlp.org/

---

### ACL (Association for Computational Linguistics)

**Conference Type**: Premier NLP conference  
**Frequency**: Annual (July)

**Formatting Requirements**:
- **Page Limit**: 8 pages (long), 4 pages (short), excluding references
- **Format**: Two-column
- **Font**: Times, 11pt
- **Anonymization**: **Required**
- **LaTeX Template**: ACL official style (acl.sty)

**LaTeX Template**: `assets/journals/acl_article.tex`

---

### USENIX Security Symposium

**Conference Type**: Top security conference  
**Frequency**: Annual (August)

**Formatting Requirements**:
- **Page Limit**: 
  - Papers: No strict limit (typically 15-20 pages including everything)
  - Well-written, concise papers preferred
- **Format**: Two-column
- **Font**: Times, 10pt
- **Anonymization**: **Required** (double-blind)
- **LaTeX Template**: USENIX official template
- **Citations**: Numbered
- **Paper size**: US Letter

**LaTeX Template**: `assets/journals/usenix_article.tex`

**Website**: https://www.usenix.org/conference/usenixsecurity

---

### SIGIR (Information Retrieval)

**Conference Type**: Top information retrieval conference  
**Frequency**: Annual (July)

**Formatting Requirements**:
- **Page Limit**: 
  - Full papers: 10 pages (excluding references)
  - Short papers: 4 pages (excluding references)
- **Format**: Single-column ACM format
- **LaTeX Class**: `acmart` (sigconf)
- **Anonymization**: **Required**
- **Citations**: ACM style

**LaTeX Template**: `assets/journals/sigir_article.tex`

---

## Biology & Bioinformatics

### ISMB (Intelligent Systems for Molecular Biology)

**Conference Type**: Premier computational biology conference  
**Frequency**: Annual (July)

**Formatting Requirements**:
- **Publication**: Proceedings published in *Bioinformatics* journal
- **Page Limit**: 
  - Typically 7-8 pages including figures and references
- **Format**: Two-column
- **Font**: Times, 10pt
- **Citations**: Numbered (Oxford style similar to Bioinformatics journal)
- **LaTeX Template**: Oxford Bioinformatics template
- **Anonymization**: **Not required** (single-blind)
- **Figures**: High resolution, color acceptable
- **Supplementary**: Encouraged for additional data/methods

**LaTeX Template**: `assets/journals/ismb_article.tex`

**Website**: https://www.iscb.org/ismb

---

### RECOMB (Research in Computational Molecular Biology)

**Conference Type**: Top computational biology conference  
**Frequency**: Annual (April/May)

**Formatting Requirements**:
- **Publication**: Proceedings published as Springer LNCS (Lecture Notes in Computer Science)
- **Page Limit**: 
  - Extended abstracts: 12-15 pages (including references)
- **Format**: Single-column
- **Font**: Based on Springer LNCS template
- **LaTeX Class**: `llncs` (Springer)
- **Citations**: Numbered or author-year
- **Anonymization**: **Required** (double-blind)
- **Supplementary**: Appendix can be submitted

**LaTeX Template**: `assets/journals/recomb_article.tex`

**Website**: https://www.recomb.org/

---

### PSB (Pacific Symposium on Biocomputing)

**Conference Type**: Biomedical informatics conference  
**Frequency**: Annual (January)

**Formatting Requirements**:
- **Page Limit**: 12 pages including figures and references
- **Format**: Single-column
- **Font**: Times, 11pt
- **Margins**: 1 inch all sides
- **Citations**: Numbered
- **Anonymization**: **Not required**
- **Figures**: Embedded in text
- **LaTeX Template**: PSB official template

**LaTeX Template**: `assets/journals/psb_article.tex`

**Website**: https://psb.stanford.edu/

---

## Engineering

### IEEE International Conference on Robotics and Automation (ICRA)

**Formatting Requirements**:
- **Page Limit**: 8 pages (including figures and references)
- **Format**: Two-column
- **Font**: Times, 10pt
- **LaTeX Class**: IEEEtran
- **Citations**: IEEE style [1]
- **Anonymization**: **Required** for initial submission
- **Video**: Optional video submissions encouraged

**LaTeX Template**: `assets/journals/icra_article.tex`

---

### IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)

**Formatting**: Same as ICRA (IEEE robotics template)

---

### International Conference on Computer-Aided Design (ICCAD)

**Formatting Requirements**:
- **Page Limit**: 8 pages
- **Format**: Two-column
- **LaTeX Class**: IEEE template
- **Citations**: IEEE style

---

### Design Automation Conference (DAC)

**Formatting Requirements**:
- **Page Limit**: 6 pages
- **Format**: Two-column
- **Font**: Times, 10pt
- **LaTeX Class**: ACM or IEEE template (check yearly guidelines)

---

## Multidisciplinary

### AAAS Annual Meeting

**Conference Type**: Broad scientific conference  
**Formatting**: Varies by symposium (typically extended abstracts)

---

## Quick Reference Table

| Conference | Pages | Format | Blind | Citations | Template |
|------------|-------|--------|-------|-----------|----------|
| **NeurIPS** | 8 + refs | Two-col | Double | [1] | `neurips_article.tex` |
| **ICML** | 8 + refs | Two-col | Double | [1] | `icml_article.tex` |
| **ICLR** | 8 + refs | Two-col | Double | [1] | `iclr_article.tex` |
| **CVPR** | 8 + refs | Two-col | Double | [1] | `cvpr_article.tex` |
| **AAAI** | 7 + refs | Two-col | Double | Various | `aaai_article.tex` |
| **CHI** | 10 + refs | Single-col | Double | ACM | `chi_article.tex` |
| **SIGKDD** | 9 + refs | Two-col | Double | ACM [1] | `kdd_article.tex` |
| **EMNLP** | 8 + refs | Two-col | Double | Named | `emnlp_article.tex` |
| **ISMB** | 7-8 pages | Two-col | Single | [1] | `ismb_article.tex` |
| **RECOMB** | 12-15 pages | Single-col | Double | Springer | `recomb_article.tex` |

---

## General Conference Submission Guidelines

### Anonymization Best Practices (Double-Blind Review)

**Remove**:
- Author names, affiliations, emails from title page
- Acknowledgments section
- Funding information that reveals identity
- Any "our previous work" citations that make identity obvious

**Anonymize**:
- Self-citations: "Smith et al. [5]" → "Anonymous et al. [5]" or "Prior work [5]"
- Institution-specific details: "our university" → "a large research university"
- Dataset names if they reveal identity

**Keep Anonymous**:
- Code repositories (use anonymous GitHub for review)
- Supplementary materials
- Any URLs or links

### Supplementary Materials

**Common Inclusions**:
- Source code (GitHub repository, zip file)
- Additional experimental results
- Proofs and derivations
- Extended related work
- Dataset descriptions
- Video demonstrations
- Interactive demos

**Best Practices**:
- Keep supplementary well-organized
- Reference supplementary clearly from main paper
- Ensure supplementary is anonymized for blind review
- Check file size limits (typically 50-100 MB)

### Camera-Ready Preparation

After acceptance:
1. **De-anonymize**: Add author names, affiliations
2. **Add acknowledgments**: Funding, contributions
3. **Copyright**: Add conference copyright notice
4. **Formatting**: Follow camera-ready specific guidelines
5. **Page limit**: May allow 1-2 extra pages (check guidelines)
6. **PDF/A compliance**: Some conferences require PDF/A format

### Accessibility Considerations

**For All Conferences**:
- Use colorblind-safe color palettes
- Ensure sufficient contrast
- Provide alt text for figures (where supported)
- Use clear, readable fonts
- Avoid solely color-based distinctions

---

## Common Mistakes to Avoid

1. **Wrong style file**: Using outdated conference style file
2. **Page limit violation**: Figures/tables pushing over limit
3. **Font size manipulation**: Changing fonts to fit more content
4. **Margin adjustments**: Modifying margins to gain space
5. **De-anonymization**: Accidentally revealing identity in blind review
6. **Missing references**: Not citing relevant prior work
7. **Low-quality figures**: Pixelated or illegible figures
8. **Inconsistent formatting**: Different sections using different styles

---

## Getting Official Templates

**Where to Find Official Templates**:
1. **Conference website**: "Call for Papers" or "Author Instructions"
2. **GitHub**: Many conferences host templates on GitHub
3. **Overleaf**: Many official templates available on Overleaf
4. **CTAN**: LaTeX class files often on CTAN repository

**Template Naming**:
- Conferences often update templates yearly
- Use the correct year's template (e.g., `neurips_2024.sty`)
- Check for "camera-ready" vs. "submission" versions

---

## Notes

1. **Annual updates**: Conference requirements change; always check current year's CFP
2. **Deadline types**: 
   - Abstract deadline (often 1 week before paper deadline)
   - Paper deadline (firm, no extensions typically)
   - Supplementary deadline (may be a few days after paper)
3. **Timezone**: Pay attention to deadline timezone (often AOE - Anywhere on Earth)
4. **Rebuttal**: Many conferences have author response/rebuttal periods
5. **Dual submission**: Check conference policy on concurrent submissions
6. **Poster/Oral**: Acceptance often comes with presentation format

## Conference Tiers (Informal)

**Machine Learning**:
- **Tier 1**: NeurIPS, ICML, ICLR
- **Tier 2**: AAAI, IJCAI, UAI

**Computer Vision**:
- **Tier 1**: CVPR, ICCV, ECCV

**Natural Language Processing**:
- **Tier 1**: ACL, EMNLP, NAACL

**Bioinformatics**:
- **Tier 1**: RECOMB, ISMB
- **Tier 2**: PSB, WABI

(Tiers are informal and field-dependent; not official rankings)

