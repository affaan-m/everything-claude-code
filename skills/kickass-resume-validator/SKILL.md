---
name: kickass-resume-validator
description: Validates and helps write resumes following "How to Write a Kickass Resume" industry-standard guidelines. Use this skill whenever you're working with resumes in Cowork—whether reviewing a .tex resume file, getting feedback on your current resume, or building a new one from scratch. Covers formatting, structure (header, education, work experience, projects, skills), action verbs, impact metrics, ATS compliance, and tailoring for specific roles. Trigger on phrases like "validate my resume", "review my resume against kickass guidelines", "help me write a kickass resume", "check my resume", or when you see a resume .tex file in the working folder.
compatibility: Requires LaTeX .tex files in the working folder; bash_tool for file operations
origin: ECC
---

# Kickass Resume Validator & Builder

A skill for validating resumes against "How to Write a Kickass Resume" industry standards and helping you write or improve resumes that get noticed.

## When to Activate

Use this skill when:
- You have a `.tex` resume file in your Cowork working folder that needs validation or feedback
- You want to check if your resume follows "How to Write a Kickass Resume" industry best practices
- You're writing a new resume and want guidance on structure, content, and formatting
- You need to understand action verbs, impact metrics, and how to tailor your resume to specific roles
- You want to ensure your resume is ATS-compliant (parseable by automated systems)
- You're applying to tech, startup, or competitive roles where the resume needs to stand out

## Core Guidelines from "How to Write a Kickass Resume"

This skill is based on the industry-standard guide that emphasizes:

### Structure & Formatting
- **One page maximum** (Letter size: 8.5 x 11 inches)
- **Consistent formatting**: fonts, styles, capitalization, punctuation, date formats
- **Clean, professional fonts**: Arial or Times New Roman (ATS-compliant)
- **Strategic section ordering**: Students → Education first; Professionals → Experience first
- **ATS compliance**: Avoid fancy templates; keep it simple and scannable

### Header
- **Legal name** (bolded, larger font)
- **Optional**: Desired role (if applying to diverse positions)
- **Email**: Professional, regularly checked
- **Phone number**: Formatted consistently
- **LinkedIn URL & Portfolio links**: Make them clickable; keep current
- **Location**: City, State (no full address needed); consider "Open to relocation" if relevant

### Education
- **University name, degree, major/minor, location**
- **GPA**: Only if 3.5 or above
- **Expected graduation date**: Include month and year for students
- **Do not list**: Transferred-from schools, incomplete degrees, high school (after sophomore year)
- **Do not list certifications as "In Progress"** — only completed certifications count

### Work Experience
- **Role Title, Company, Location, Dates** (Month Year - Month Year)
- **3-5 bullet points** per role (more for longer tenure)
- **Start with action verbs**: Led, Designed, Developed, Created, etc.
- **Include metrics**: Quantified impact (%, $, users, time saved, efficiency gains)
- **Focus on accomplishments**: What did you build? What changed? What was the outcome?
- **One-liner summary** (optional): Brief context before bullets if role is unclear
- **Self-employment**: Same format but emphasize company building, revenue, team leadership

### Projects
- **Project name, description, technologies used, outcome/impact**
- **Personal/school projects are valuable** — include if they demonstrate relevant skills
- **Can replace or supplement work experience** for students without extensive internships
- **Show completeness**: Working projects on GitHub/portfolio links are better than descriptions

### Skills
- **Keep it organized**: Group by category (Languages, Tools/Frameworks, Concepts, etc.)
- **Tailor to the role**: Include skills matching the job description
- **Balance breadth and depth**: Show both breadth (many technologies) and depth (mastery)
- **Include relevant technical AND soft skills** if space allows
- **Order by relevance**: Most relevant to target role first

### Industry Involvement
- **Hackathons, volunteering, conference speaking, mentorship, community organizing**
- **Shows initiative and passion** beyond just paid work
- **Use same action verb format** as work experience
- **Include impact**: Team mentored, attendees helped, event size, outcomes

## Skill Workflow

### 1. Validating an Existing Resume

When you have a `.tex` resume file:

1. **Read the file** to understand structure and content
2. **Check against "Kickass Resume" standards**:
   - Is it one page? Are fonts professional?
   - Is the section order strategic for your situation (student/professional)?
   - Do headers clearly delineate sections?
   - Are action verbs strong and varied?
   - Are there metrics/outcomes in every bullet?
   - Is it ATS-compliant (no fancy templates, clean structure)?
   - Are dates consistent? Is formatting uniform?
3. **Provide feedback** in structured format:
   - **Strengths**: What's working well
   - **Issues**: Specific violations of "Kickass Resume" guidelines (with section references)
   - **Suggestions**: Concrete rewrites with stronger action verbs and metrics
   - **Priority fixes**: What to address first (high/medium/low)
   - **ATS compliance**: Is it parseable by automated systems?

Output feedback as a clear, actionable report that you can reference when revising.

### 2. Writing or Improving a Resume from Scratch

When building a new resume or significantly revising one:

1. **Interview** (ask about):
   - What's your current situation? (Student, recent grad, professional, career changer?)
   - What roles/companies/industries are you targeting?
   - What are your top 3 achievements or proudest projects?
   - What internships, jobs, projects, or volunteering have you done?
   - What technical skills, tools, or languages do you know?
   - Any leadership, hackathons, speaking, or industry involvement?

2. **Structure** the resume strategically:
   - **Students**: Header → Education → Work Experience → Projects → Skills → (Industry Involvement)
   - **Professionals**: Header → Work Experience → Education → Projects → Skills → (Industry Involvement)
   - **Career changers**: Tailor section order to highlight most relevant experience

3. **Guide on best practices**:
   - Start each bullet with strong action verb (Led, Designed, Built, Created, Developed, etc.)
   - Include metrics: percentages, dollars, user numbers, time saved, efficiency gains
   - Show outcomes: What changed? What was the impact?
   - Keep bullets 1-2 lines; eliminate filler words
   - Tailor descriptions to highlight skills matching target role
   - Group skills by category for clarity and ATS readability

4. **Generate suggestions** for structure, wording, emphasis, and tailoring based on goals

### 3. Providing Targeted Feedback

For specific issues or roles:
- **Weak bullet point critique**: Rewrite with action verbs and metrics
- **Metric identification**: Help you think through what to quantify
- **Role-specific tailoring**: Suggest how to emphasize relevant skills for target industry
- **ATS optimization**: Ensure formatting won't break in automated screening
- **Comparison**: Show before/after to demonstrate improvement

## Key "Kickass Resume" Action Verbs

Organized by category for easy reference:

**Management/Leadership**: Led, Managed, Directed, Coordinated, Organized, Initiated, Established, Developed, Improved, Increased, Streamlined, Oversaw

**Communication/People**: Communicated, Presented, Collaborated, Negotiated, Resolved, Influenced, Recruited, Mentored, Coached, Facilitated

**Technical**: Built, Designed, Engineered, Programmed, Developed, Implemented, Debugged, Integrated, Deployed, Optimized, Automated

**Research/Analysis**: Analyzed, Researched, Investigated, Identified, Evaluated, Determined, Examined, Discovered, Measured, Assessed

**Financial/Data**: Managed, Reduced, Increased, Projected, Forecasted, Calculated, Analyzed, Balanced, Optimized, Improved

**Creative**: Created, Designed, Conceptualized, Developed, Initiated, Established, Revitalized, Transformed, Built

## Example: Before & After

**Weak bullet:**
- Worked on a project to help with the backend

**Strong bullet (Kickass-style):**
- Built scalable backend API using Python and PostgreSQL, supporting 10,000+ monthly active users and reducing query latency by 40%

---

**Why it's stronger:**
- Action verb: "Built" (specific and powerful)
- Technology: "Python and PostgreSQL" (concrete, technical)
- Metrics: "10,000+ users" and "40%" (quantified impact)
- Outcome: Clear deliverable and result

## CS-Specific Resume Examples

Real-world before/after examples for common CS resume bullets, applying Kickass guidelines (action verb + tech + metric + outcome):

### Backend Engineering

**Weak:**
- Worked on backend development for an internal microservice

**Strong:**
- Engineered distributed microservice architecture using Node.js and Redis, reducing payment processing latency from 2.1s to 350ms and supporting 500+ concurrent transactions per second

**Why:** Action verb (Engineered), specific tech (Node.js, Redis), quantified metrics (2.1s→350ms, 500+ TPS), clear outcome (payment processing improved)

---

### Frontend/Fullstack

**Weak:**
- Built a web app with React for displaying user data

**Strong:**
- Built interactive React dashboard with TypeScript and D3.js visualizations, improving data query load time by 65% through lazy loading and enabling 2,000+ enterprise users to run custom reports

**Why:** Action verb (Built), tech stack (React, TypeScript, D3.js), metrics (65% improvement, 2,000+ users), outcome (custom reports enabled)

---

### DevOps/Infrastructure

**Weak:**
- Set up CI/CD pipeline and managed cloud infrastructure

**Strong:**
- Designed and deployed automated CI/CD pipeline using GitHub Actions and AWS ECS, reducing deployment time from 45 minutes to 8 minutes and decreasing production incidents by 70% through improved testing coverage

**Why:** Action verb (Designed and deployed), specific tools (GitHub Actions, AWS ECS), metrics (45m→8m, 70% incident reduction), outcome (faster deployments, higher reliability)

---

### Machine Learning/Data Science

**Weak:**
- Trained machine learning models for recommendation system

**Strong:**
- Developed gradient boosting recommendation model in Python using XGBoost and scikit-learn, achieving 94% precision on test set and increasing click-through rate by 18% in production affecting 50,000+ daily active users

**Why:** Action verb (Developed), tech (Python, XGBoost, scikit-learn), metrics (94% precision, 18% CTR lift, 50K+ users), outcome (deployed, measured impact)

---

### Open Source Contribution

**Weak:**
- Contributed to open source projects

**Strong:**
- Contributed 12 merged pull requests to React core library, including refactor of reconciliation algorithm that improved initial render performance by 12% in 18% of real-world applications; contributions reviewed and approved by core maintainers

**Why:** Action verb (Contributed), specificity (12 PRs, React core), metrics (12% perf improvement, affected 18% of apps), outcome (merged, core maintainer approval)

---

## DO/DON'T Patterns

Quick reference for Kickass guidelines to remember during resume writing:

### DO

1. **Start every bullet with a strong action verb** - Led, Built, Designed, Engineered, Developed, Optimized, Deployed, Improved, Increased, Reduced, Automated, Coordinated
2. **Include at least one quantified metric per bullet** - %, $, time saved, users impacted, scale achieved, efficiency gains
3. **Show measurable outcome or impact** - What changed? How was success defined? (e.g., "reducing latency by 40%" vs. "latency was reduced")
4. **Tailor the resume to the job description** - Reorder bullets or sections to prioritize skills matching the target role
5. **Keep bullets concise** - Aim for 1-2 lines max; eliminate filler words like "helped", "responsible for", "worked on"
6. **Group related skills by category** - Languages, Frameworks, Tools, Concepts, Databases, Cloud Platforms for clarity
7. **Include technical depth and breadth** - Show both mastery of specific technologies and range of capabilities
8. **List only completed degrees and certifications** - No "In Progress" unless it's expected graduation date (for students)

### DON'T

1. **Don't use weak verbs** - Avoid: "Responsible for", "Helped with", "Worked on", "Was involved in", "Contributed to" (use specific action verbs instead)
2. **Don't exceed one page** - Every word must justify its space; cut ruthlessly and use 10.5pt font minimum for readability
3. **Don't list generic skills without context** - "Problem Solving" and "Team Player" are assumed; list specific technical skills instead
4. **Don't use fancy templates or graphics** - ATS systems may parse them incorrectly; stick to clean, simple formatting
5. **Don't include personal details** - No photo, birthday, marital status, ethnicity, political affiliation; stick to professional contact info
6. **Don't repeat the same action verb in consecutive bullets** - Vary your language; use a thesaurus for synonyms (Built, Engineered, Designed, Developed)
7. **Don't claim credit for team accomplishments without clarity** - If it was collaborative, clarify your role: "Led team of 4 engineers to..." rather than just "Built..."
8. **Don't use acronyms without context the first time** - Spell out "CI/CD" or "API" at least once if the ATS parser might not recognize them

## Quick Validation Checklist

Use this condensed section-by-section checklist for fast resume validation:

### Header
- [ ] Name is bolded and prominent
- [ ] Email is professional (no nicknames) and regularly monitored
- [ ] Phone number is formatted consistently
- [ ] LinkedIn URL and portfolio/GitHub links are current and clickable (https://)
- [ ] Location includes city and state (no full street address)

### Education
- [ ] Degree, major, university name, and location are included
- [ ] Expected graduation date (for students) or graduation date is in Month Year format
- [ ] GPA listed only if 3.5 or above
- [ ] No high school listed (if 2+ years of college completed)
- [ ] No "In Progress" certifications (only completed ones count)

### Work Experience
- [ ] Each role has Title, Company, Location, Dates (Month Year - Month Year)
- [ ] 3-5 bullets per role (scale with tenure)
- [ ] Every bullet starts with a strong action verb
- [ ] Every bullet includes at least one metric (%, $, users, time, scale)
- [ ] Bullets show outcome/impact, not just tasks performed
- [ ] Bullets are 1-2 lines max (concise, no filler)

### Projects
- [ ] Project name, description, and technologies are clear
- [ ] Include outcome or impact (shipped, users, GitHub stars, hackathon placement)
- [ ] Links to GitHub or live demo are included if available
- [ ] Action verbs and metrics follow same Kickass guidelines as work experience

### Skills
- [ ] Skills are organized by category (Languages, Frameworks, Tools, Concepts, etc.)
- [ ] Skills are ordered by relevance to target role
- [ ] No generic "soft skills" (Team Player, Communication) without context
- [ ] Technical depth and breadth are both demonstrated
- [ ] Matches 5+ skills from job description

### Formatting & ATS
- [ ] Resume is exactly one page (or close to it)
- [ ] Fonts are professional and consistent (Arial, Calibri, or Times New Roman)
- [ ] Date formats are consistent throughout (e.g., Jan 2023 - Mar 2024)
- [ ] Section headers are clear and consistent
- [ ] No fancy graphics, icons, colors, or multi-column layouts
- [ ] PDF version renders correctly (no missing text or formatting)

### Role Alignment
- [ ] Section order matches your situation (Education first for students, Experience first for professionals)
- [ ] Most relevant experience/projects appear first
- [ ] Resume emphasizes skills matching the target role
- [ ] No irrelevant experience taking up space

## LaTeX Resume Tips

Since you'll often be working with `.tex` resume files, here are key guidelines for ATS-friendly LaTeX formatting and common pitfalls:

### ATS-Friendly LaTeX Formatting

- **Use standard document classes**: article, moderncv, or res (avoid fancy custom classes)
- **Stick to simple packages**: geometry, fancyhdr for headers/footers, xcolor for basic colors (avoid tikz, PSTricks, fancy-frame packages)
- **Avoid tables for layout** - ATS parsers may miss content in table cells; use lists or newlines instead
- **Use simple section headers**: \section{} with no special formatting (no \Large, \textit{}, colored boxes)
- **Limit font styling**: Bold (\textbf{}) and italics (\textit{}) are safe; avoid small caps (\textsc{}), fancy fonts
- **Keep margins reasonable**: 0.5-1 inch on all sides; wide margins waste space on one-page resume
- **Use itemize or enumerate for bullets**: Standard LaTeX lists are ATS-safe

### Font & Package Recommendations

- **Safe fonts**: Computer Modern (default), Helvetica (via helvet), Times (via mathptmx)
- **Avoid**: Wingdings, Symbol, or non-standard fonts that ATS may not recognize
- **Package essentials**:
  - geometry: Set margins
  - enumitem: Customize bullet spacing and list formatting
  - hyperref: Create clickable links (ATS can extract URLs)
  - xcolor: For subtle accent colors (use sparingly)
- **Avoid these packages**: tikz, pstricks, fancybox, background, pgfplots (ATS may fail to parse)

### Common LaTeX Pitfalls & Solutions

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Hbox warnings (Overfull/Underfull) | Text overflow or loose spacing, causes formatting issues | Use \raggedright on long text; reduce font size; break lines manually with \\  |
| Special characters not rendering | Accents, dashes, quotes display incorrectly in ATS | Use UTF-8 encoding; escape special chars: \~{n}, \'{e}, -- (en-dash), --- (em-dash) |
| Encoding issues (encoding not declared) | Resume text may become unreadable in some parsers | Add \usepackage[utf8]{inputenc} at top; save file as UTF-8 |
| Fancy headers/footers on one page | Header/footer info may be lost in ATS parsing | Use simple \pagestyle{plain} or no header/footer; put all critical info in body |
| Multi-column layouts | ATS parser may skip entire columns | Use single column; use nested lists or indentation for hierarchy instead |
| Footnotes or references | ATS may not capture footnote text | Convert to inline text or parentheses; avoid \footnote{} |
| Micro-spacing hacks (\vspace, \hspace) | May be ignored or cause text reflow in ATS | Use enumitem margins and parskip instead; avoid hacky spacing |
| PDF-only features (transparency, images) | ATS extracts text, not images; transparency may be lost | Use only grayscale shapes if needed; no embedded images (except small icons as text) |

### LaTeX Resume Templates (ATS Safety)

**Safe/Recommended:**
- Plain article class with basic formatting (highest ATS compatibility)
- Overleaf "Simple Resume" or "Clean CV" templates (often ATS-tested)
- moderncv (some styles are ATS-safe; test the PDF)

**Caution/Test First:**
- Fancy resume classes (check PDF rendering in ATS tester)
- Color-heavy designs (ATS may drop colors but preserve text)
- Multi-column templates (verify single-column fallback works)

**Avoid:**
- TikZ-based designs
- Infographic-style resumes
- Templates requiring custom fonts not in LaTeX default
- Design templates prioritizing looks over parse-ability

**ATS Test Before Submitting:**
Use free online ATS resume checkers (e.g., Resumeworded, Jobscan, or LinkedIn's PDF parser) to verify your .tex compiled PDF is readable by automated systems.

## Output Format for Cowork

When validating a `.tex` file, provide feedback in this JSON structure:

```json
{
  "file_analyzed": "path/to/resume.tex",
  "summary": "Brief overall assessment against Kickass guidelines",
  "situation": "student|recent_grad|professional",
  "one_page": "yes|no - critical for Kickass standard",
  "sections": {
    "section_name": {
      "status": "pass|flag|rewrite",
      "issues": ["issue1", "issue2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "priority": "high|medium|low"
    }
  },
  "ats_compliance": "yes|no - explain if no",
  "top_3_fixes": [
    "Fix 1: Specific action",
    "Fix 2: Specific action",
    "Fix 3: Specific action"
  ],
  "alignment_to_kickass": "percentage or qualitative",
  "actionable_metrics": "How to quantify achievements in your resume"
}
```

If you're writing a new resume, output a `.tex` template or LaTeX snippet ready to use.

## Common Issues & How to Fix Them

| Issue | Kickass Guideline | How to Fix |
|-------|-------------------|-----------|
| Resume is 2+ pages | One page only | Remove or condense least relevant experiences; reduce font if needed |
| Inconsistent formatting | Be consistent throughout | Standardize fonts, styles, date formats, punctuation in all sections |
| No metrics on bullets | Quantify everything | Add %, $, users served, time saved, efficiency gains, people managed |
| Weak action verbs | Start with strong verbs | Replace "worked on", "helped", "responsible for" with Led, Built, Designed, etc. |
| Too generic | Tailor to role | Rewrite to emphasize skills matching job description |
| No projects listed | Add projects for students | Include school projects, hackathons, personal projects with outcomes |
| Fancy template | ATS compliance | Switch to clean, simple template (Arial/Times New Roman, simple formatting) |
| No location info | Include city, state | Add your location or "Open to relocation" to header |

## Tips for Success

- **One page is sacred**: Be ruthless about what makes the cut; tailor for each application
- **Action verbs drive impact**: Every bullet should start with a power verb from the Kickass list
- **Metrics tell the story**: Numbers make achievements memorable and credible
- **Tailor strategically**: Reorder sections based on your situation (student/professional/career changer)
- **ATS matters**: Use simple formatting so your resume doesn't get lost in automated screening
- **Section order is strategic**: Put your strongest section first (Education for students, Experience for professionals)
- **Skills should be organized**: Group by type (Languages, Tools, Concepts) for clarity
- **Industry involvement shows passion**: Hackathons, volunteering, and speaking demonstrate you care beyond just a paycheck

---

## Related Resources

- Original guide: "How to Write a Kickass Resume" (included in this skill)
- Tools: Grammarly (free grammar checking)
- Testing: Review with friends, mentors, or university career center
- ATS testing: Use online ATS resume checkers to verify formatting

---

**Skill Version**: 1.0  
**Based on**: "How to Write a Kickass Resume" industry-standard guide  
**Platform**: Cowork (LaTeX .tex files)  
**Audience**: CS/tech students and early-career professionals  
