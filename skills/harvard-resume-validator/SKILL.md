---
name: harvard-resume-validator
description: Validate and help write resumes against Harvard College's official guidelines. Use when reviewing a .tex resume, getting feedback on an existing resume, or building one from scratch under Harvard standards. Covers structure (Education, Experience, Leadership/Activities, Skills), action verbs, conciseness, tailoring, and Harvard-specific rules (one-page undergrad, GPA ≥3.7 threshold, no personal pronouns). Trigger on "validate my resume", "review my resume against Harvard guidelines", "check my resume", "help me write a resume", or when a `.tex` resume appears in the working directory.
origin: ECC
tags: [resume, latex, academic, harvard]
---

# Harvard Resume Validator & Builder

Validates resumes against Harvard College's official career-services guidance and helps write resumes that follow those standards.

## Requires

- A LaTeX `.tex` resume file in the working directory, OR
- Resume content pasted into the conversation.

Much of the generic resume material (action verbs, LaTeX ATS pitfalls, one-page formatting) lives in [`../_shared/resume-common.md`](../_shared/resume-common.md). This skill covers only what is **Harvard-specific**.

## When to Activate

Use this skill when:

- You have a `.tex` resume file that needs validation against Harvard College guidelines.
- You're writing a new resume for an undergraduate or recent-grad context and want Harvard structure.
- You need targeted feedback on a specific section: bullet construction, tailoring, ATS compatibility.
- You're preparing for Harvard-centric career pipelines (MCS-supported roles, Crimson Careers listings).

## What's Harvard-Specific

| Dimension | Harvard rule |
|-----------|--------------|
| Length | Exactly one page for undergraduates |
| GPA threshold | Include only if ≥3.7; otherwise omit |
| Section order | Education → Experience → Leadership/Activities → Skills/Interests |
| Pronouns | Never use "I", "me", "we", "us"; action verbs carry the sentence |
| Voice | Past tense for every role, even current ones |
| Tone | Reserved; no flowery language ("passionate about", "hardworking") |
| Dating | Include month + year (e.g. "Jun 2024 – Aug 2024") |

### Differs from `kickass-resume-validator`

| Rule | Harvard | Kickass |
|------|---------|---------|
| GPA threshold | ≥3.7 | ≥3.5 |
| Section order | Education first (undergrad default) | Students: Education first; Professionals: Experience first |
| Industry Involvement section | Not standard | Encouraged (hackathons, speaking, open source) |
| Tone | Reserved, formal | Bold, impact-forward |

If you've run both validators and they disagree, use the one matching the target role's culture: Harvard for academic/consulting/finance, Kickass for tech/startups.

## Output Format

Emit a single JSON object (not JSONL — there's only one resume per review). Schema at `schema/output.schema.json`.

```json
{
  "file_analyzed": "resume.tex",
  "alignment_to_harvard": "82%",
  "summary": "Strong Education and Experience; two weak bullets in Projects; GPA listed below threshold.",
  "sections": {
    "education": {
      "status": "flag",
      "issues": ["GPA of 3.5 listed; Harvard guidance omits GPAs below 3.7"],
      "suggestions": ["Remove the GPA line; keep the relevant-coursework list."],
      "priority": "medium"
    },
    "experience": {
      "status": "pass",
      "issues": [],
      "suggestions": [],
      "priority": "low"
    },
    "projects": {
      "status": "rewrite",
      "issues": ["Two bullets use 'Responsible for'; one lacks metrics."],
      "suggestions": ["Replace 'Responsible for user testing' with 'Led user testing for 40 participants, identifying 12 usability issues that shaped v2 design.'"],
      "priority": "high"
    }
  },
  "top_3_fixes": [
    "Remove GPA from Education (3.5 < 3.7 threshold).",
    "Rewrite two 'Responsible for' bullets in Projects with action verbs.",
    "Add quantified impact to the hackathon bullet (users, placement, or stars)."
  ]
}
```

### Per-section status values

- `pass` — meets Harvard standard as-is.
- `flag` — minor issue; suggest a tweak.
- `rewrite` — bullet(s) should be substantially rewritten; provide replacement text.

## Harvard-Aligned Bullet Examples

Strong bullets lead with an action verb, include a metric, and end on impact.

**Software engineering internship:**

Weak: "Worked on backend stuff and fixed bugs during my internship at a startup."

Strong: "Engineered REST API endpoints in Python/Flask serving 10K+ daily requests; reduced query latency by 40% through index tuning, improving checkout uptime to 99.8%."

**Research assistant:**

Weak: "Helped with a machine learning research project on image classification."

Strong: "Implemented data-preprocessing pipeline in PyTorch for a 50K+ medical-imaging dataset; contributed to paper reaching 94% classification accuracy on held-out test set."

**Teaching assistant:**

Weak: "Helped teach CS50 and answered student questions."

Strong: "Led weekly section for 30 CS50 students on advanced C and Python; redesigned review sessions, lifting median section-assignment scores 12% vs. prior semester."

**Course project:**

Weak: "Built a web app for my CS class along with two teammates."

Strong: "Architected full-stack e-commerce platform (React, Node.js, PostgreSQL) serving 200+ test users; maintained 95% test coverage and led code review for a three-person team."

## Section-by-Section Validation

### Header

- [ ] Full name prominent (largest font on page).
- [ ] City + state (no street address).
- [ ] Professional email (ideally firstname.lastname@…).
- [ ] Phone number, formatted consistently.
- [ ] Links (GitHub, portfolio, LinkedIn) only if they add value.
- [ ] No photo, age, marital status, or personal identifiers.

### Education

- [ ] School, degree, major/minor, expected graduation (Month Year).
- [ ] GPA **only if ≥3.7**.
- [ ] 4–6 relevant courses (not an exhaustive transcript dump).
- [ ] Honors, dean's list, study abroad — concise, only if notable.
- [ ] No high school after sophomore year.

### Experience

- [ ] Each role: Title, Organization, Location (if space), Dates (Month Year – Month Year).
- [ ] 3–5 bullets per role (6 only for long tenure).
- [ ] Every bullet starts with a strong action verb (see [shared reference](../_shared/resume-common.md#action-verb-bank)).
- [ ] ≥50% of bullets include a quantified metric.
- [ ] No personal pronouns.
- [ ] Past tense throughout.
- [ ] No "Responsible for" or "Helped with".

### Leadership / Activities (Harvard-specific section)

- [ ] Role, organization, dates, 1–2 impact-focused bullets.
- [ ] Emphasize initiative and outcomes, not attendance.

### Skills / Interests

- [ ] Grouped by category (Languages / Tools / Frameworks).
- [ ] Ordered by relevance to the target role.
- [ ] No generic soft skills without evidence.
- [ ] Only list skills you'd confidently discuss in an interview.

### Overall

- [ ] Exactly one page.
- [ ] Consistent font, size, and alignment.
- [ ] 0.5" margins on all sides.
- [ ] `pdftotext resume.pdf -` extracts cleanly (see [ATS test](../_shared/resume-common.md#quick-ats-test)).

## LaTeX Specifics

For the generic LaTeX ATS pitfalls table, safe preamble, and font recommendations, see [`../_shared/resume-common.md#latex-ats-pitfalls`](../_shared/resume-common.md#latex-ats-pitfalls). Harvard-specific guidance on top of that:

- Harvard's MCS templates are conservative; avoid colored accents, icon fonts, or sidebar layouts.
- Prefer serif fonts (Computer Modern, Times) for the Harvard aesthetic; sans-serif is acceptable but less conventional for consulting/finance tracks.
- Use `\section*{}` to suppress numbering — Harvard resumes don't number sections.

## DO / DON'T

### DO

- Lead every bullet with a strong action verb.
- Quantify impact wherever plausible (percentages, user counts, latency, revenue).
- Use past tense for every role, even current ones.
- Tailor to the target role (remove irrelevant bullets rather than cramming more).
- Test the final PDF with `pdftotext` before submitting.
- Seek feedback from Harvard MCS advisors ([mcs@fas.harvard.edu](mailto:mcs@fas.harvard.edu), 617-495-2595) before a deadline.

### DON'T

- Use personal pronouns.
- Include a GPA below 3.7.
- Exceed one page (undergrad).
- Add photo, age, marital status, or nationality.
- Use flowery language ("passionate about", "team player") without evidence.
- Use TikZ/PGF or image-based layouts that break ATS parsing.

## Related Resources

- Harvard Career Services resume guide: [Create a Strong Resume](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/).
- MCS resume templates are available in the Crimson Careers portal.
- Shared resume reference material: [`../_shared/resume-common.md`](../_shared/resume-common.md).
- Sibling skills: `kickass-resume-validator` (industry-standard variant), `resume-job-alignment` (tailor to a specific job posting).
