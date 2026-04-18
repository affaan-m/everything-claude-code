---
name: kickass-resume-validator
description: Validate and help write resumes using industry-standard "Kickass Resume" guidelines common at tech companies and startups. Use when reviewing a .tex resume file, getting feedback, or building a new resume aimed at tech/startup roles. Covers one-page formatting, strategic section ordering (students vs professionals), strong action verbs, quantified impact metrics, ATS compliance, and tailoring to role type. Trigger on "validate my resume", "kickass resume review", "help me write a resume", or when a `.tex` resume appears in the working directory and the target is a tech/startup role.
origin: ECC
tags: [resume, latex, tech, startup]
---

# Kickass Resume Validator & Builder

Validates resumes against the industry-standard "How to Write a Kickass Resume" guide, tuned for tech and startup hiring. Helps write resumes that clear ATS gates and land interviews at competitive tech companies.

## Requires

- A LaTeX `.tex` resume file in the working directory, OR
- Resume content pasted into the conversation.

Generic resume material (action verbs, LaTeX ATS pitfalls, one-page formatting) lives in [`../_shared/resume-common.md`](../_shared/resume-common.md). This skill covers only what is **Kickass-specific**.

## When to Activate

Use this skill when:

- You have a `.tex` resume file and want validation against Kickass standards.
- You're writing a resume for tech/startup roles (SWE, ML, DevOps, product engineering).
- You want explicit ATS-compliance checking.
- You need strategic section ordering advice (student vs professional vs career-changer).
- You want metric-heavy, impact-forward framing rather than academic reserve.

## What's Kickass-Specific

| Dimension | Kickass rule |
|-----------|--------------|
| Length | One page maximum, no exceptions |
| GPA threshold | Include only if ≥3.5; otherwise omit |
| Section order (students) | Header → Education → Experience → Projects → Skills → Industry Involvement |
| Section order (professionals) | Header → Experience → Education → Projects → Skills → Industry Involvement |
| Metrics | Every bullet needs a quantified outcome (%, $, users, scale, latency, time saved) |
| Tone | Bold, impact-forward; lean on power verbs and numbers |
| Industry Involvement | Encouraged (hackathons, speaking, open-source contributions, mentorship) |
| Section ordering rule | Strategic — lead with the strongest signal for the target role |

### Differs from `harvard-resume-validator`

| Rule | Kickass | Harvard |
|------|---------|---------|
| GPA threshold | ≥3.5 | ≥3.7 |
| Section order | Strategic (student/professional/career-changer) | Education first, always, for undergrads |
| Industry Involvement | Dedicated section encouraged | Typically folded into Leadership/Activities |
| Tone | Bold, metric-heavy | Reserved, formal |
| One-page rule | Hard max at all career stages | Hard max for undergrads; professionals may flex |

If the validators disagree, follow the one matching the target role's culture: Kickass for tech/startups, Harvard for academic/consulting/finance.

## Output Format

Emit a single JSON object. Schema at `schema/output.schema.json`.

```json
{
  "file_analyzed": "resume.tex",
  "situation": "student",
  "one_page": "yes",
  "alignment_to_kickass": "76%",
  "ats_compliance": "yes — single column, standard packages, no images",
  "summary": "Strong Experience section; Projects weak on metrics; Skills section has generic soft skills.",
  "sections": {
    "experience": {
      "status": "pass",
      "issues": [],
      "suggestions": [],
      "priority": "low"
    },
    "projects": {
      "status": "rewrite",
      "issues": ["Two bullets lack metrics; one uses 'Worked on'."],
      "suggestions": ["Replace 'Worked on a chat app' with 'Built real-time chat app (React + WebSocket), scaling to 1.2K concurrent connections; open-sourced (320 GitHub stars).'"],
      "priority": "high"
    },
    "skills": {
      "status": "flag",
      "issues": ["Lists 'Team Player' and 'Communication' without context."],
      "suggestions": ["Remove generic soft skills; keep Languages, Frameworks, Tools, Databases groups."],
      "priority": "medium"
    }
  },
  "top_3_fixes": [
    "Add metrics to both Projects bullets (users, stars, benchmarks, or shipped impact).",
    "Remove generic soft skills; reorganize Skills by category (Languages / Frameworks / Tools).",
    "Move Projects above Skills so strongest technical signal appears earlier."
  ]
}
```

### Per-section status values

- `pass` — meets Kickass standard.
- `flag` — minor issue; suggest a tweak.
- `rewrite` — bullet(s) should be substantially rewritten; provide replacement text.

## Kickass-Aligned Bullet Examples

Every strong bullet has: **action verb + specific tech + quantified metric + outcome**.

**Backend engineering:**

Weak: "Worked on backend development for an internal microservice."

Strong: "Engineered distributed microservice (Node.js, Redis) that reduced payment-processing latency from 2.1s to 350ms and handled 500+ concurrent TPS."

**Frontend / full-stack:**

Weak: "Built a web app with React for displaying user data."

Strong: "Built interactive React dashboard (TypeScript, D3.js) with lazy loading that cut query load time 65% and enabled 2K+ enterprise users to run custom reports."

**DevOps / infrastructure:**

Weak: "Set up CI/CD pipeline and managed cloud infrastructure."

Strong: "Designed CI/CD pipeline (GitHub Actions, AWS ECS) that cut deployment time from 45m to 8m and reduced production incidents 70% via automated test gating."

**ML / data science:**

Weak: "Trained machine learning models for recommendation system."

Strong: "Developed gradient-boosting recommendation model (XGBoost, scikit-learn) that hit 94% test precision and lifted click-through rate 18% across 50K DAU in production."

**Open-source contribution:**

Weak: "Contributed to open source projects."

Strong: "Contributed 12 merged PRs to the React core library, including a reconciliation refactor that improved initial-render performance 12% across 18% of real-world apps; approved by core maintainers."

## Section-by-Section Validation

### Header

- [ ] Name bolded, prominent.
- [ ] Professional email; LinkedIn and GitHub/portfolio links clickable.
- [ ] Location: City, State (no street address).
- [ ] Consistent phone formatting.

### Education

- [ ] University, degree, major, location; expected/actual graduation as Month Year.
- [ ] GPA **only if ≥3.5**.
- [ ] No high school after second year of college.
- [ ] No "In progress" certifications — completed only.

### Work Experience

- [ ] Title, Company, Location, Dates (Month Year – Month Year).
- [ ] 3–5 bullets per role; scale with tenure.
- [ ] **Every bullet** starts with a strong action verb (see [shared action-verb bank](../_shared/resume-common.md#action-verb-bank)).
- [ ] **Every bullet** has a quantified metric.
- [ ] Bullets show outcome/impact, not task lists.
- [ ] No "Responsible for", "Helped with", "Worked on".

### Projects

- [ ] Project name, one-line description, technologies, outcome.
- [ ] Link to GitHub or live demo if it showcases polished work.
- [ ] Personal projects clearly labeled.
- [ ] Same action-verb + metric standard as Experience.

### Skills

- [ ] Grouped by category (Languages / Frameworks / Tools / Databases / Cloud).
- [ ] Ordered by relevance to the target role.
- [ ] No generic soft skills without evidence.
- [ ] Matches at least 5 specific skills from the job description.

### Industry Involvement (Kickass-specific)

- [ ] Hackathons, volunteering, conference talks, mentorship, community organizing.
- [ ] Include impact: team mentored, attendees, event size, outcomes.
- [ ] Use the same action-verb + metric format as Experience.

### Formatting & ATS

- [ ] One page — measured, not "about one page".
- [ ] Consistent fonts (Arial, Helvetica, Calibri, Times, or Source Sans Pro) throughout.
- [ ] Single-column layout; no sidebars or multi-column designs.
- [ ] No images, icons, or fancy graphics.
- [ ] `pdftotext resume.pdf -` extracts cleanly (see [ATS test](../_shared/resume-common.md#quick-ats-test)).

### Role Alignment

- [ ] Section order matches situation (student → Education first; professional → Experience first).
- [ ] Most relevant experience/projects appear first within each section.
- [ ] Resume emphasizes skills matching the target role.

## LaTeX Specifics

For the generic LaTeX ATS pitfalls table, safe preamble, and font recommendations, see [`../_shared/resume-common.md#latex-ats-pitfalls`](../_shared/resume-common.md#latex-ats-pitfalls). Kickass-specific notes:

- `moderncv` with `casual` or `classic` style is Kickass-compatible; avoid `oldstyle`.
- Overleaf's "Simple Resume" and "Clean CV" templates are Kickass-safe and ATS-tested.
- Prefer sans-serif fonts (Helvetica, Source Sans Pro) for the tech/startup aesthetic.

## DO / DON'T

### DO

- Lead every bullet with a power verb; never repeat a verb on consecutive bullets.
- Quantify with percentages, dollars, users, scale, time saved, or latency.
- Reorder sections strategically: strongest signal first for the target role.
- Include Industry Involvement when you have meaningful hackathon, speaking, or OSS work.
- Test the final PDF with `pdftotext` before submitting.

### DON'T

- Exceed one page. Ever.
- Use weak verbs: "Responsible for", "Helped with", "Worked on", "Was involved in".
- List generic skills without context: "Problem Solving", "Team Player", "Communication".
- Use fancy templates or infographics — ATS will drop your application.
- Mix date formats (e.g. "Jun 2024 – Aug 2024" beside "06/2024 – 08/2024").
- Claim team achievements without clarifying your role.

## Related Resources

- Industry guide: "How to Write a Kickass Resume".
- Shared resume reference material: [`../_shared/resume-common.md`](../_shared/resume-common.md).
- Sibling skills: `harvard-resume-validator` (academic variant), `resume-job-alignment` (tailor to a specific job posting).
