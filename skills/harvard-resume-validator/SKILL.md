---
name: harvard-resume-validator
description: Validates and helps write resumes against Harvard College's official guidelines. Use this skill whenever you're working with a resume—whether reviewing a .tex resume file, getting feedback on your current resume, or building a new one from scratch. Covers Harvard's standards for formatting, structure (education, experience, skills), action verbs, conciseness, tailoring to roles, and best practices. Trigger on phrases like "validate my resume", "review my resume against Harvard guidelines", "help me write a resume", "check my resume", or when you see a resume .tex file that needs evaluation or improvement.
origin: ECC
---

# Harvard Resume Validator & Builder

A skill for validating resumes against Harvard College's official guidelines and helping you write or improve resumes that follow best practices.

## When to Activate

Use this skill when:
- You have a `.tex` resume file in your Cowork working folder that needs validation or feedback
- You want to check if your resume follows Harvard College's official guidelines
- You're writing a new resume and want guidance on structure, content, and formatting
- You need to understand action verbs, bullet point construction, or how to tailor your resume to specific roles
- You want to ensure your resume follows best practices for ATS (Applicant Tracking Systems) and hiring managers

## Core Guidelines from Harvard College

Harvard's resume guide emphasizes:
- **Structure**: Education, Experience, Leadership/Activities, Skills/Interests (optional categories included)
- **Length**: Typically one page for undergraduates
- **Action verbs**: Use strong, varied action words to start each bullet point
- **Conciseness**: Eliminate unnecessary words; focus on impact and outcomes
- **Tailoring**: Customize resumes for specific roles by highlighting relevant skills and experiences
- **Formatting**: Consistent fonts, sizes, margins; clean, professional appearance
- **Avoid**: Personal pronouns (I, me, we), flowery language, vague accomplishments

## Skill Workflow

### 1. Validating an Existing Resume

When you have a `.tex` resume file:

1. **Read the file** to understand current structure and content
2. **Check against Harvard guidelines**:
   - Does it have required sections (Education, Experience)?
   - Are bullet points concise and action-verb-driven?
   - Is it properly tailored to the target role/industry?
   - Are there weaknesses in formatting, clarity, or impact?
3. **Provide feedback** in a structured format:
   - **Strengths**: What's working well
   - **Issues**: Specific violations of Harvard guidelines (with line references)
   - **Suggestions**: Concrete rewrites for problem areas
   - **Priority fixes**: What to address first

Output feedback as a clear, actionable report that you can reference when revising the file.

### 2. Writing or Improving a Resume from Scratch

When building a new resume or significantly revising one:

1. **Interview** (ask about):
   - What's your major/graduation year?
   - What types of roles/industries are you targeting?
   - What are your top 2-3 achievements or skills?
   - Any leadership roles, internships, or relevant projects?

2. **Structure** the resume with Harvard's recommended sections:
   - **Header**: Name, contact info (city/state, email, phone)
   - **Education**: School, degree, GPA (if 3.7+), relevant coursework, study abroad
   - **Experience**: Job title, organization, dates, 3-5 bullet points (outcomes, skills)
   - **Leadership/Activities**: Role, organization, impact (optional but valuable)
   - **Skills/Interests**: Technical skills, languages, tools, interests

3. **Guide on best practices**:
   - Start each bullet with a strong action verb (Led, Designed, Increased, Optimized, etc.)
   - Include metrics/outcomes where possible (e.g., "Increased engagement by 20%")
   - Avoid pronouns; use past tense
   - Keep bullets to 1-2 lines; eliminate filler words
   - Tailor descriptions to highlight skills the target role values

4. **Generate suggestions** for structure, wording, and emphasis based on their goals

### 3. Providing Targeted Feedback

For specific issues or sections:
- **Bullet point critique**: Rewrite weak bullets with action verbs and impact
- **Tailor guidance**: Suggest how to reframe experiences for specific industries (tech, finance, consulting, nonprofits, etc.)
- **ATS optimization**: Ensure formatting won't break in automated screening systems
- **Cover letter alignment**: Check that resume and cover letter tell a consistent story

## Key Harvard Action Verbs

Use these instead of generic words:

**Leadership**: Led, Directed, Managed, Spearheaded, Championed, Orchestrated
**Analysis**: Analyzed, Evaluated, Assessed, Examined, Investigated
**Creation**: Designed, Developed, Created, Built, Established, Launched
**Improvement**: Optimized, Improved, Enhanced, Refined, Strengthened, Accelerated
**Communication**: Presented, Articulated, Communicated, Advocated, Pitched
**Technical**: Implemented, Deployed, Engineered, Automated, Configured
**Quantified Impact**: Increased, Reduced, Expanded, Streamlined, Generated

## Example: Before & After

**Weak bullet:**
- Worked on a project to help students understand better

**Strong bullet (Harvard-style):**
- Designed interactive Python tutorials for 50+ CS students, resulting in 25% improvement in assignment completion rates

## CS-Specific Resume Examples

### Software Engineering Internship

**Weak:**
- Worked on backend stuff and fixed bugs during my internship at a startup

**Strong (Harvard-aligned):**
- Engineered REST API endpoints in Python/Flask serving 10K+ daily requests; reduced query latency by 40% through database indexing optimization
- Debugged and resolved 15+ production issues across payment and user authentication systems, improving system reliability to 99.8% uptime

### Research Assistant

**Weak:**
- Helped with a machine learning research project on image classification

**Strong (Harvard-aligned):**
- Implemented data preprocessing pipeline in PyTorch for 50K+ medical imaging dataset; contributed to paper achieving 94% classification accuracy
- Conducted literature review spanning 80+ papers; synthesized findings into technical memo guiding model architecture design

### Course Project

**Weak:**
- Built a web app for my CS class along with two teammates

**Strong (Harvard-aligned):**
- Architected full-stack e-commerce platform (React, Node.js, PostgreSQL) serving 200+ test users; led code review process and maintained 95%+ test coverage
- Designed responsive UI achieving 98 Lighthouse score; implemented OAuth integration reducing registration friction by 30%

### Hackathon / Side Project

**Weak:**
- Made an app at a hackathon that won a prize

**Strong (Harvard-aligned):**
- Built real-time collaboration tool (WebSocket, React, MongoDB) in 24 hours; won "Best Developer Experience" award at HackHarvard 2025 with 50+ beta users
- Open-sourced project on GitHub earning 200+ stars; managed community contributions and released three feature-complete versions

### Teaching Assistant

**Weak:**
- Helped teach CS50 and answered student questions

**Strong (Harvard-aligned):**
- Led weekly section for 30 CS50 students covering advanced C and Python concepts; improved section attendance by 45% through interactive problem-solving format
- Developed and delivered 8 custom review sessions; contributed to 12% improvement in median section assignment scores compared to prior semester

## LaTeX Resume Tips

### Common LaTeX Resume Packages

- **moderncv** — Professional, highly customizable templates; includes multiple color schemes and layouts
- **awesome-cv** — Modern, feature-rich with colored sections and icons; good for tech roles
- **altacv** — Flexible, minimalist design; excellent for creative alignment and column layouts
- **resume** — Lightweight, simple structure; easiest for ATS compatibility
- **deedy-resume** — Two-column layout with clean typography; popular in tech
- **friggeri-cv** — Elegant, sidebar layout; visually distinctive but less ATS-friendly

### ATS-Friendly LaTeX Formatting

- **Stick to basic packages** — Avoid fancy packages (pgfplots, tikz, pstricks) that create images instead of text; ATS parsers cannot extract text from images
- **Use standard commands** — Prefer `\textbf{}` and `\textit{}` over custom formatting macros; ensure text remains selectable
- **Avoid multi-column layouts** — Some ATS systems read left-to-right linearly; sidebar or two-column designs may scramble content
- **Use simple lists** — Prefer `itemize` with `\item` over custom list environments; test with `pdftotext` to verify content extraction
- **Include hyperlinks properly** — Use `\href{}{}` for clickable links; include plain text URL fallback in plain-text version
- **Consistent spacing** — Use `\vspace{}` sparingly; maintain uniform margins and line spacing for readability

### Font Choices for Professional PDFs

- **Serif fonts** (traditional) — Computer Modern, Times New Roman, Garamond; professional for consulting and finance
- **Sans-serif fonts** (modern) — Helvetica, Arial, Source Sans Pro; clean, tech-friendly appearance
- **Recommended combo** — Helvetica or Source Sans Pro with serif for section headers; 10-11pt body, 12-14pt headers
- **Avoid** — Script fonts, heavy decorative fonts, mixed font sizes without clear hierarchy
- **Compilation note** — Use pdflatex or xelatex; ensure fonts embed correctly in PDF (check properties; all fonts should be embedded, not substituted)

### Common LaTeX Resume Pitfalls

| Issue | Symptom | Fix |
|-------|---------|-----|
| Overfull hbox | Lines overflow to margin; compiler warnings | Reduce margins, break long lines, use `\raggedright` sparingly |
| Underfull hbox | Spacing feels off; weird gaps between words | Add explicit line breaks `\\` or use `\newline` |
| Image inclusions | Resume cannot be parsed; looks broken in ATS | Avoid images; use text-based icons or Unicode symbols instead |
| Custom macro nesting | Formatting breaks; unexpected bold/italics | Flatten macros; use only `\textbf`, `\textit`, `\texttt` |
| Line spacing too tight | Hard to read; ATS struggles to separate lines | Add `\linespacing{1.15}` or use `\setspacing{1.15}` from setspace |
| Itemize indentation | Bullets don't align or appear misaligned | Set `\leftmargin` and `\labelwidth` explicitly in item settings |

### File Structure for Maintainability

**Recommended structure:**
```latex
\documentclass{article}
% Preamble: packages, custom commands, formatting
\usepackage{resume}  % or moderncv, awesome-cv, etc.
\usepackage[margin=0.5in]{geometry}

% Define custom commands for repeated patterns
\newcommand{\job}[4]{\textbf{#1} | #2 \\ #3 | #4}
\newcommand{\bullet}[1]{\item #1}

\begin{document}

% Header (name, contact)
\section*{Contact}

% Education
\section{Education}

% Experience
\section{Experience}

% Projects
\section{Projects}

% Skills
\section{Skills}

\end{document}
```

**Maintainability tips:**
- Define command shortcuts (`\job{}`, `\skill{}`, `\project{}`) at the top; reuse throughout
- Separate sections with clear comments and spacing
- Keep custom formatting minimal; rely on package defaults
- Version control changes with git; track date modified
- Test PDF output with `pdftotext` before submitting; ensure all text extracts cleanly

## DO/DON'T Patterns

### DOs

- **DO** lead each bullet with a strong action verb (Led, Designed, Optimized, etc.)
- **DO** include quantified impact whenever possible (percentages, numbers, user counts)
- **DO** tailor your resume to the target role; highlight relevant skills and experiences
- **DO** use consistent formatting (fonts, sizes, margins, bullet styles) throughout
- **DO** keep your resume to one page as an undergraduate; use white space effectively
- **DO** use past tense for all roles and experiences, even if ongoing at write time
- **DO** include links to GitHub, portfolio, or relevant projects if they strengthen your candidacy
- **DO** proofread multiple times; grammatical errors or typos are immediate red flags
- **DO** test your resume in PDF form to catch formatting issues before submitting
- **DO** get feedback from peers, mentors, or MCS advisors before finalizing

### DON'Ts

- **DON'T** use personal pronouns (I, me, we, us); let action verbs speak for themselves
- **DON'T** include outdated or irrelevant experiences; prioritize recent and role-specific content
- **DON'T** use generic descriptions like "Helped the team" or "Responsible for"; be specific and measurable
- **DON'T** add unnecessary personal information (photo, age, marital status, nationality)
- **DON'T** include reasons for leaving jobs, salary info, or references (provide separately if asked)
- **DON'T** use flowery, vague language like "passionate about," "hardworking," or "team player" without evidence
- **DON'T** exceed two lines per bullet point; condense and prioritize impact
- **DON'T** use abbreviations without first explaining them (except widely recognized ones like API, AI, SQL)
- **DON'T** include GPA if below 3.7; Harvard strong emphasis on meritocracy means low GPA may hurt more than help
- **DON'T** use fancy LaTeX packages that break ATS parsing (tikz, pgfplots, custom graphics)
- **DON'T** submit a resume without verifying it extracts cleanly as plain text via pdftotext
- **DON'T** assume a one-size-fits-all resume; customize for each application

## Section-by-Section Validation Checklist

Use this checklist to quickly validate each section of your resume against Harvard standards:

### Header

- [ ] Full name is prominent (largest font on page)
- [ ] City/state included (or "Remote" if applicable)
- [ ] Email address is professional (firstname.lastname@... or similar)
- [ ] Phone number is included and formatted consistently
- [ ] Links are included (GitHub, portfolio, LinkedIn, personal website) if they add value
- [ ] All contact info fits on one line or is neatly aligned
- [ ] No unnecessary personal details (photo, age, pronouns unless you choose to include)

### Education

- [ ] School name, degree, and graduation date (or expected date) clearly listed
- [ ] Major and minor (if applicable) are specified
- [ ] GPA included only if 3.7 or above; otherwise omit
- [ ] Relevant coursework listed (e.g., "Relevant Coursework: Data Structures, Algorithms, ML")
- [ ] Awards, honors, or dean's list mentions are concise and notable
- [ ] Study abroad, exchange programs, or special experiences are relevant to target role
- [ ] No excessive course listings; select 4-6 most relevant courses

### Experience

- [ ] Each role includes: Job Title, Organization, Location (if space allows), Dates (Month Year - Month Year)
- [ ] Dates are consistent in format (e.g., "June 2024 - August 2024")
- [ ] Each role has 3-5 bullet points (no more than 6 without overflow)
- [ ] Every bullet starts with a strong, varied action verb (avoid repeating "Managed" five times)
- [ ] At least 50% of bullets include quantified impact (numbers, percentages, or measurable outcomes)
- [ ] Bullets are tailored to the target role (remove irrelevant or generic tasks)
- [ ] No personal pronouns (I, me, we); action verbs carry the narrative
- [ ] All bullets are past tense, even if the role is current
- [ ] No "Responsible for" or "Helped with" phrasing; use active achievements instead

### Projects

- [ ] Project title is clear and relevant to target role
- [ ] Technologies/stack are listed (e.g., "React, Node.js, PostgreSQL")
- [ ] Each project has 2-3 impact-focused bullets
- [ ] Outcome or result is stated (users served, award won, article published, etc.)
- [ ] Links to GitHub or live demo are included (if applicable and if they showcase polished work)
- [ ] Personal projects are clearly labeled as such (not confused with coursework)
- [ ] Dates are included (Month Year - Month Year) for clarity

### Skills

- [ ] Skills are organized into logical categories (Languages, Tools, Frameworks, etc.)
- [ ] Only include skills you can confidently discuss in an interview
- [ ] Technical skills are current and relevant to target roles
- [ ] Soft skills are omitted or kept to 1-2 (e.g., avoid "Communication," "Leadership" without context)
- [ ] No fluff like "Microsoft Word" or "Google Docs"
- [ ] Order by relevance to target role (most relevant listed first)
- [ ] Avoid generic descriptors like "Proficient in..." or "Experienced with..."; just list the skill
- [ ] Total skills section fits in 3-5 lines; no overflow

### Overall

- [ ] Resume is exactly one page (no overflow, good use of white space)
- [ ] Consistent font, size, and alignment throughout
- [ ] Margins are 0.5 inch all around (standard)
- [ ] PDF exports cleanly with all formatting intact
- [ ] Text extracts cleanly when converted to plain text via pdftotext
- [ ] No typos, grammatical errors, or inconsistent abbreviations
- [ ] Resume has been reviewed by at least one peer or advisor

## Output Format for Cowork

When validating a `.tex` file, provide feedback in this JSON structure for easy machine parsing:

```json
{
  "file_analyzed": "path/to/resume.tex",
  "summary": "Brief overall assessment",
  "sections": {
    "section_name": {
      "status": "pass|flag|rewrite",
      "issues": ["issue1", "issue2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "priority": "high|medium|low"
    }
  },
  "top_3_fixes": [
    "Fix 1: Specific action",
    "Fix 2: Specific action",
    "Fix 3: Specific action"
  ],
  "alignment_to_harvard": "percentage or qualitative"
}
```

If you're writing a new resume, output a `.tex` template or LaTeX snippet ready to use.

## Common Issues & How to Fix Them

| Issue | Harvard Guideline | How to Fix |
|-------|-------------------|-----------|
| "Responsible for X" | Use action verbs | Change to "Led X" or "Managed X" |
| "Helped the team do Y" | Show individual impact | "Designed Y that improved team efficiency by Z%" |
| Generic skills list | Tailor to target role | Select skills matching the job description |
| No metrics | Quantify outcomes | Add numbers: "Increased sales by 15%", "Served 200+ users" |
| Too wordy | Concise bullets | Remove "I was" / "We decided to" — just state the action and result |
| Inconsistent formatting | Professional appearance | Match font, size, margins, bullet style throughout |

## Tips for Success

- **Tailor every application**: Customize experience bullets to highlight skills the employer values
- **Use metrics**: Numbers make accomplishments concrete and memorable
- **Tell a story**: Your resume should reflect a coherent narrative about your skills and interests
- **Test readability**: Print it or view as PDF to catch formatting issues
- **Get feedback**: Share with peers or MCS advisors (Mignone Center for Career Success)

---

## Related Resources

- Harvard's official guide: [Create a Strong Resume](https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/)
- MCS Resume Templates: Available in Crimson Careers portal
- MCS Contact: mcs@fas.harvard.edu, 617-495-2595
