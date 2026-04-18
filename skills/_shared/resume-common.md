# Resume Common Reference

Shared material used by `harvard-resume-validator`, `kickass-resume-validator`, and `resume-job-alignment`. This file is not itself a skill — it has no `SKILL.md` — it is a deduplicated reference the resume skills link to so they can focus on what makes them distinct.

## Action-Verb Bank

Group by category. Start every bullet with one of these; vary choices so the same verb doesn't appear twice in a row.

| Category | Verbs |
|----------|-------|
| Leadership | Led, Directed, Managed, Spearheaded, Championed, Orchestrated, Coordinated, Oversaw, Mentored |
| Build / Create | Built, Designed, Developed, Engineered, Architected, Implemented, Launched, Shipped, Deployed |
| Improve | Optimized, Improved, Enhanced, Refined, Strengthened, Accelerated, Streamlined, Automated |
| Analyze | Analyzed, Evaluated, Assessed, Examined, Investigated, Measured, Benchmarked, Profiled |
| Communicate | Presented, Articulated, Advocated, Pitched, Documented, Published, Open-sourced |
| Quantified impact | Increased, Reduced, Expanded, Generated, Cut, Saved, Scaled |

Avoid: "Responsible for", "Helped with", "Worked on", "Was involved in", "Contributed to" (without specifics).

## Weak-Phrase → Strong-Phrase Substitutions

| Weak | Strong |
|------|--------|
| Responsible for X | Led X / Owned X |
| Helped the team do Y | Partnered with team to ship Y, delivering Z impact |
| Worked on backend | Built [specific component] in [language/stack], handling [scale] |
| Involved in project | Drove project that achieved [measurable outcome] |
| Contributed to codebase | Shipped N pull requests merged to mainline, including [notable change] |
| Tried to improve performance | Reduced latency from Ams to Bms via [technique] |
| Used various tools | Used [named tools]: X, Y, Z |

## One-Page Formatting Rules

- Letter size 8.5" × 11"; 0.5"–1" margins all around.
- 10–11 pt body; 12–14 pt headers. Avoid < 10 pt.
- Consistent font throughout (Computer Modern, Helvetica, Times, or Source Sans Pro).
- Dates formatted uniformly (e.g. "Jun 2024 – Aug 2024" — pick one style, apply everywhere).
- Bullets 1–2 lines each. Long bullets signal you haven't cut filler.
- Every bullet starts with a strong action verb; every bullet contains a metric when plausible.
- No personal pronouns ("I", "me", "we"). Past tense for every role, even current ones.

## LaTeX ATS Pitfalls

ATS (applicant-tracking systems) parse the PDF's text layer, so anything that hides text inside an image, table cell, or multi-column region can vanish.

| Pitfall | Why it breaks ATS | Fix |
|---------|-------------------|-----|
| `\includegraphics` of resume content | ATS extracts text, not pixels | Don't embed images; use text |
| TikZ / PSTricks graphics | Renders as vector art; no text layer | Replace with text + borders |
| Multi-column layouts | Parsers read left-to-right linearly; columns scramble | Use single column |
| Tables for layout | Some parsers skip cell text | Use `\itemize` or newlines |
| Custom fonts not embedded | Parser falls back to glyph codes | Use `pdflatex`/`xelatex` defaults; verify `Fonts` tab in Preview |
| `\footnote{}` for content | Some parsers drop footnotes | Inline as parenthetical |
| Non-ASCII bullets / dingbats | Symbol substitution → garbled text | Stick to `-` or `\textbullet` |
| Header/footer metadata (name repeated) | Parsers may overwrite the main author line | Put contact info in body, not in `\fancyhdr` |

## Quick ATS Test

```bash
pdftotext resume.pdf - | less
```

If you see missing sections, scrambled column order, or no bullet characters, your layout is hiding text from ATS parsers.

## Safe LaTeX Preamble

```latex
\documentclass[11pt]{article}
\usepackage[margin=0.6in]{geometry}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{hyperref}
\usepackage{enumitem}
\setlist[itemize]{leftmargin=*, itemsep=2pt, topsep=2pt}
\pagenumbering{gobble}
```

This compiles on stock `pdflatex` and produces a single-column, ATS-parseable PDF.

## Section Inventory

Standard sections, in rough order of prevalence. Which ones are required and how they're ordered depends on which validator you're following — see the individual skill files.

- Header (name, email, phone, location, links)
- Education
- Experience (also called Work Experience, Professional Experience)
- Projects (often merged into Experience for professionals)
- Skills (technical; sometimes split into Languages / Frameworks / Tools)
- Leadership / Activities (undergrad emphasis)
- Industry Involvement (hackathons, speaking, open source)
- Awards / Honors
- Publications (research-leaning candidates)
