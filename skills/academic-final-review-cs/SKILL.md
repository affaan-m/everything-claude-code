---
name: academic-final-review-cs
description: Final pre-submission checklist for CS research papers. Verify abstract presence, all required sections, bibliography completeness, figure/table captions and citations, undefined terms, voice consistency, orphaned references, formatting standards, page counts, and venue-specific requirements. Use this skill as the final review before submission—a comprehensive yes/no/fix checklist to catch common issues. Trigger on "final review", "checklist", "before submission", "publication ready", "pre-submission check", or when the paper appears nearly complete but needs final verification.
origin: ECC
---

# Academic Final Review Checklist (JSONL Output)

You perform a final pre-submission review of CS research papers using a structured checklist. Output is JSONL — one JSON object per line, one verification item per line — aligned with the sibling CS paper-review skills (`paper-structure-cs`, `abstract-methods-results-cs`, `sentence-clarity-cs`). The machine-readable schema lives at `schema/output.schema.json`.

## When to Activate

Activate this skill when:
- Paper draft is nearly complete (all major sections written, figures drafted, bibliography nearly final)
- Author requests "final review", "pre-submission check", or "publication ready verification"
- Paper is scheduled for submission within 1-2 weeks
- Author is preparing to send to conference, journal, or archive
- Major revision round is complete and last polish is needed
- Resubmission to venue (after reviewer feedback) is in progress

Do NOT activate if:
- Paper still lacks major sections or figures
- Significant content changes are still planned
- Methods or results are not finalized
- Bibliography is incomplete or very sparse

## Your Task

When given a complete (or nearly complete) paper, verify all standard academic requirements:
- Structure completeness (all sections present)
- Bibliography and citation consistency
- Figure and table captions and placement
- Term definitions and first-use clarity
- Voice consistency throughout
- Reference completeness
- Formatting standards and venue compliance
- Metadata and administrative details
- Page count and layout compliance

Output one checklist item per line with status and guidance.

## Output Format (JSONL)

One JSON object per line. Each object is one checklist item. Fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `item` | string | yes | Canonical checklist item name from the table below |
| `status` | string | yes | `"PASS"`, `"FAIL"`, or `"WARN"` |
| `guidance` | string | yes | Empty string `""` when status is `PASS`; a specific, actionable fix otherwise |

Example output:

```jsonl
{"item": "Has abstract", "status": "PASS", "guidance": ""}
{"item": "Has introduction", "status": "PASS", "guidance": ""}
{"item": "Has methods", "status": "PASS", "guidance": ""}
{"item": "Has results", "status": "PASS", "guidance": ""}
{"item": "Has discussion", "status": "PASS", "guidance": ""}
{"item": "Has conclusion", "status": "PASS", "guidance": ""}
{"item": "Bibliography formatted", "status": "FAIL", "guidance": "Mixed APA/Chicago on lines 523, 561, 589. Reformat all to APA."}
{"item": "All figures captioned", "status": "FAIL", "guidance": "Figure 3 ('Baseline Comparison') has no caption. Add descriptive caption explaining subfigures."}
{"item": "All figures cited", "status": "FAIL", "guidance": "Figure 3 not cited in text. Add reference in Results before Figure 3 appears."}
{"item": "All tables captioned", "status": "PASS", "guidance": ""}
{"item": "All tables cited", "status": "PASS", "guidance": ""}
{"item": "No undefined terms", "status": "WARN", "guidance": "'BLEU score' used on line 142 without definition. Define on first use or cite Papineni et al. 2002."}
{"item": "Consistent voice", "status": "WARN", "guidance": "Methods 75% passive; Results 55% active; Discussion 80% passive. Pick one and normalize."}
{"item": "No orphaned references", "status": "PASS", "guidance": ""}
{"item": "Headings consistent", "status": "PASS", "guidance": ""}
{"item": "Page numbers present", "status": "PASS", "guidance": ""}
{"item": "Abstract word count", "status": "PASS", "guidance": ""}
{"item": "Author info complete", "status": "PASS", "guidance": ""}
{"item": "Keywords present", "status": "PASS", "guidance": ""}
{"item": "Acknowledgments section", "status": "PASS", "guidance": ""}
{"item": "Appendices referenced", "status": "PASS", "guidance": ""}
{"item": "Code/data availability", "status": "FAIL", "guidance": "No data-availability statement. Add a paragraph before Conclusion: 'Code and datasets are available at <URL>.'"}
{"item": "Ethical considerations", "status": "WARN", "guidance": "Paper studies ML fairness but has no ethics statement. Add a paragraph addressing fairness and deployment risks."}
{"item": "Page count within limits", "status": "PASS", "guidance": ""}
{"item": "Font and margins", "status": "PASS", "guidance": ""}
```

## Checklist Items (Extended)

| Item | What to verify |
|------|-----------------|
| Has abstract | Abstract section present and complete |
| Has introduction | Introduction section present with motivation and contributions |
| Has methods | Methods section present and reproducible |
| Has results | Results section with data/metrics and quantitative evidence |
| Has discussion | Discussion interprets results and acknowledges limitations |
| Has conclusion | Conclusion summarizes contributions and suggests future work |
| Bibliography formatted | All references use consistent citation style throughout |
| All figures captioned | Every figure has descriptive caption (not just title) |
| All figures cited | Every figure referenced in text before/near appearance |
| All tables captioned | Every table has descriptive caption and column headers |
| All tables cited | Every table referenced in text before/near appearance |
| No undefined terms | Technical terms defined on first use or well-known |
| Consistent voice | Paper doesn't switch between active/passive mid-section |
| No orphaned references | All bibliography entries cited; no unreferenced entries |
| Headings consistent | Same-level headings use same style and formatting |
| Page numbers present | All pages numbered (if required by venue) |
| Abstract word count | Abstract within venue limits (typically 150-250 words) |
| Author info complete | All author names, affiliations, and contact info present |
| Keywords present | Keywords listed (if required by venue, typically 5-8) |
| Acknowledgments section | Acknowledgments present (funding, collaborators, resources) |
| Appendices referenced | All appendices referenced in main text; no orphaned appendices |
| Code/data availability | Code/data availability statement present or explanation provided |
| Ethical considerations | Ethical statement present if applicable (fairness, privacy, harm) |
| Page count within limits | Total page count (including references) meets venue requirements |
| Font and margins | Font sizes, line spacing, and margins comply with venue standards |

## How to Evaluate

1. **Structure**: Visually scan for presence of all required sections
2. **Bibliography**: Check citation format consistency; verify all references are cited; check style matches venue
3. **Figures/Tables**: Ensure each has descriptive caption and is cited in text before/near appearance
4. **Terms**: Check that jargon is defined on first use; flag technical terms without explanation
5. **Voice**: Sample Methods, Results, Discussion; note if passive/active balance is inconsistent within sections
6. **Formatting**: Spot-check heading levels, margins, fonts, line spacing for consistency
7. **Metadata**: Verify abstract, keywords, author info, page count match venue requirements
8. **Administrative**: Check for data/code statements, ethics sections, appendix references, acknowledgments
9. **LaTeX-specific** (if applicable): Watch for overfull/underfull boxes, widow/orphan lines, float placement
10. **Final Polish**: Read title, abstract, conclusion for typos; verify PDF metadata if submitting

## Output Requirements

- One JSON object per checklist item, one object per line (JSONL).
- `status` must be exactly `"PASS"`, `"FAIL"`, or `"WARN"`.
- `guidance` is `""` for PASS; otherwise a specific, actionable fix with line numbers where relevant.
- Report the items from the extended table above in the same order. Omit an item only if it doesn't apply to the target venue.
- Do NOT add custom items; stick to the canonical list.

## LaTeX-Specific Checks (If Applicable)

If the paper is written in LaTeX, additionally check:

| Item | What to verify |
|------|-----------------|
| No overfull/underfull boxes | Compile with `pdflatex` and check `.log` for warnings; fix line breaks |
| No widow/orphan lines | Last line of paragraph appears alone; first line appears alone at page break |
| Float placement | Figures/tables appear reasonably close to first citation (same page or next) |
| Bibliography style matches | `.bst` file (plain, acm, ieeetr, etc.) matches venue requirements |
| Package conflicts | No conflicting packages (e.g., both `geometry` and `fullpage`); check console |
| PDF metadata | PDF title, author, and keywords match document content |

## Venue-Specific Checklists

Adjust emphasis depending on target venue:

### ACM Conference/Journal Submission
- CCS concepts assigned and listed
- References follow ACM reference format (author initials, venue, page ranges)
- Rights management and permissions statement present
- Author affiliations and email addresses complete
- Funding information in acknowledgments
- Do NOT include page numbers (ACM adds them during production)

### IEEE Conference/Journal Submission
- IEEE keywords present (5-7 technical terms)
- References follow IEEE citation style (author initials, title in quotes)
- Author biography section present (for some venues)
- Abstract written in third person (common in IEEE)
- Special characters properly encoded
- Font: Times New Roman or similar serif (common requirement)

### General Multi-Venue Checklist
- Venue-specific formatting template applied (margins, fonts, spacing)
- Submission deadline confirmed and calendar reminder set
- Supplemental materials (code, data, video) prepared separately
- Conflict-of-interest disclosures completed
- PDF proofread for typos and rendering issues before final submission

## DO and DON'T Patterns

### DO

- DO define all technical acronyms on first use (e.g., "Convolutional Neural Network (CNN)")
- DO cite figures and tables in text BEFORE they appear
- DO use active voice in Results (e.g., "Our method achieves 95% accuracy" not "95% accuracy is achieved")
- DO include error bars, confidence intervals, or significance tests for quantitative results
- DO provide specific page counts if venue requires (e.g., "main paper: 8 pages, appendix: 2 pages")
- DO check that all section numbering is sequential and consistent
- DO verify all external links (if any) are current and public-facing
- DO have a second author review for typos and clarity before final submission
- DO generate table of contents/outline to verify paper structure

### DON'T

- DON'T use "et al." for author citations unless there are 3+ authors
- DON'T cite figures with vague captions ("Figure 1: Results") without explaining what results
- DON'T assume readers know what "this paper" refers to; use clear pronouns
- DON'T mix citation styles (e.g., some citations with URLs, some without)
- DON'T submit PDF with track changes or comments visible
- DON'T include author names in headers/footers (unless blind review explicitly requires it)
- DON'T use footnotes for main content; use endnotes or appendix
- DON'T leave citations as "[?]", "[ref]", or placeholder text
- DON'T include figures from external sources without proper permissions/attribution
- DON'T submit without spell-check (grammar and style checkers are helpful too)

## Common Last-Minute Mistakes (Real Examples)

| Mistake | How It Happens | How to Avoid |
|---------|----------------|-------------|
| References not cited in text | Author copies bibliography without checking; ends with 20 unreferenced entries | Run bibliography against text; cite all references or remove them |
| Figure floats to wrong page | LaTeX `[h]` placement ignored; figure now 5 pages from first citation | Use `[tb]` or adjust preceding text to bring reference and figure closer |
| Abstract exceeds limit | Author adds results during revision; forgets to trim abstract to word limit | Count words in abstract; trim to 250-word max after each revision |
| Inconsistent capitalization in titles | Some references have "title case", others "sentence case" | Use BibTeX macro or manually standardize all reference titles |
| Missing affiliation for an author | Fourth author added late; no affiliation recorded | Double-check author block; every name needs affiliation |
| Undefined term on page 1 | "BLEU score" used in abstract without definition | Define all technical terms on first use, even in abstract |
| Table columns misaligned in PDF | Works in Word/Google Docs but renders poorly as PDF | Export to PDF; check table alignment before final submission |
| Orphaned heading at page break | Section heading appears alone at bottom of page | Adjust text above or use `\needspace{}` in LaTeX |
| Bibliography incomplete | Author loses track of sources added late; some references incomplete | Do final pass: check every reference has author, year, title, venue, pages |
| Author names in header (blind review) | Accidentally left author names in paper header | Search for author surnames; verify they don't appear outside author block |
| Figure caption too brief | "Figure 3: Results" without explaining which results or metrics | Write caption as 1-2 sentence summary (caption should stand alone) |
| Margin too narrow | Used default 0.5-inch margins; venue requires 1-inch | Check venue template; measure margins in document settings |

## Quick Reference: 10-Minute Pre-Submission Checklist

Use this condensed checklist right before final upload:

```
[  ] All 6+ main sections present (Intro, Methods, Results, Discussion, Conclusion, References)
[  ] Abstract word count OK (e.g., <250 words)
[  ] No [?], [ref], or placeholder citations
[  ] All figures have captions and are cited in text
[  ] All tables have captions and are cited in text
[  ] No undefined technical terms (or all defined on first use)
[  ] Bibliography style consistent (all APA or all IEEE, etc.)
[  ] No author names in headers (if blind review)
[  ] Page count within venue limits
[  ] PDF exports cleanly without rendering errors
[  ] Spell-check passed; no obvious typos
[  ] Filenames correct and match submission requirements
[  ] Keywords present (if required)
[  ] Data/code availability statement present (if required)
[  ] Ethics statement present (if applicable)
[  ] Appendices referenced (or removed)
[  ] One final proofread for clarity
[  ] SUBMIT
```

## Teaching Notes

When reviewing a paper, explain findings in concrete terms. Instead of saying "voice is inconsistent", point to specific pages/sections showing passive voice dominance. When flagging undefined terms, provide the definition the author should add. When citing formatting issues, reference both the problem (e.g., "Figure 5 not cited") and the solution (e.g., "Add 'Figure 5 shows...' in Results after line 247").

---

## Guidelines

- **Binary thinking**: Each item is binary (present/absent, consistent/inconsistent). Avoid ambiguous status.
- **Actionability**: Guidance must tell author exactly what to fix (line numbers, specific changes)
- **Completeness**: Perform the full checklist; don't skip items
- **Pre-submission focus**: This is the final check before sending to conference/journal; be thorough
- **Venue awareness**: Ask about target venue if not obvious; tailor checks (ACM vs. IEEE vs. arXiv)
- **Severity reporting**: Flag FAIL for blocking issues (missing sections, formatting violations); WARN for improvements (vague captions, minor inconsistencies)

## Related Skills

This skill is the last stop in the paper-review pipeline. Run earlier skills first; this one catches what slipped through.

1. `paper-structure-cs` — verify all sections are present and correctly ordered.
2. `abstract-methods-results-cs` — deep review of the three most-scrutinized sections.
3. `sentence-clarity-cs` — prose polish at the sentence level.
4. **`academic-final-review-cs` (this skill)** — final pre-submission checklist.

## Summary

This skill provides a comprehensive final-review checklist for CS papers before submission. Output is JSONL — one object per checklist item — so it can be diffed against prior reviews or parsed by downstream tooling. The checklist scales from 16 core items to 25+ extended items depending on paper completeness and venue requirements. Always include actionable guidance for FAIL and WARN items.
