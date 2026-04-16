---
name: resume-job-alignment
description: Aligns and tailors resumes to specific job postings. Use this skill in Cowork when you have both a resume (.tex file) and a job description (.md file) in your working folder. The skill analyzes alignment between your resume and job requirements, identifies missing or weak areas, and provides specific reframing suggestions and before/after examples. Trigger on phrases like "tailor my resume for this job", "align my resume with job posting", "how should I emphasize skills for this role", "does my resume match this job", or when you see both resume.tex and job_description.md files in the working folder.
compatibility: Requires .tex resume file and .md job description in working folder; works with both Harvard and Kickass resume validators
origin: ECC
---

# Resume-Job Alignment & Tailoring

A skill for analyzing how well your resume matches a specific job posting and providing targeted guidance on what to emphasize, reframe, or add to improve alignment.

## When to Activate

Activate this skill when:
- You see both `resume.tex` (or `.tex` resume file) and `job_description.md` in your working folder
- You explicitly request resume tailoring ("tailor my resume for this job", "align with this job posting")
- You ask about job fit ("does my resume match this job?", "should I apply for this role?")
- You need to compare specific experience against job requirements
- You're applying to multiple roles and need guidance on emphasis differences
- You want to understand what gaps exist before investing in an application

This skill is most effective when you have both documents ready to analyze together.

## When to Use This Skill

Use this skill when:
- You have a specific job posting and want to tailor your resume to match it
- You want to understand how your experience aligns with job requirements
- You need guidance on which achievements to emphasize for a particular role
- You want to reframe existing bullets to highlight relevant skills
- You're not sure if you should apply because your resume doesn't seem to match
- You want to know what gaps exist between your background and the role
- You need before/after examples showing how to reframe bullets for the specific job
- You're applying to multiple similar roles and want to optimize your approach

## How This Skill Works (Overview)

### The Alignment Framework

This skill analyzes three dimensions:

1. **Requirement Matching**: What does the job require? What do you have?
2. **Emphasis Analysis**: What skills/experiences should be highlighted? Are they currently visible?
3. **Gap Identification**: What's missing? What's weak? What needs reframing?

Then it provides:
- **Validation**: How well aligned is your resume to this job?
- **Tailoring Suggestions**: How to reframe existing content to match job priorities
- **Before/After Examples**: Concrete rewrites showing improved alignment
- **Priority Roadmap**: What to change first, second, third for maximum impact

## Core Workflow

### Step 1: Parse Job Posting
Skill reads the job description and extracts:
- **Required qualifications**: Hard requirements (Python, X years experience, etc.)
- **Nice-to-have qualifications**: Preferred but not required
- **Key skills/technologies**: Technical stack, methodologies, tools
- **Soft skills**: Communication, collaboration, leadership, creativity
- **Domain-specific knowledge**: Industry, research areas, specific problems
- **Team/role context**: What kind of person fits? What's the working environment?

### Step 2: Analyze Your Resume
Skill reads your `.tex` resume and maps:
- **Technical skills**: What languages, tools, frameworks you have
- **Experience**: Roles, projects, achievements, impact
- **Domain knowledge**: Research areas, industries, problem spaces you've worked in
- **Soft skills**: Leadership, communication, collaboration demonstrated
- **Gaps**: What's missing relative to job requirements

### Step 3: Generate Alignment Analysis
Skill compares and produces:
- **Coverage percentage**: How many job requirements you demonstrate?
- **Strength assessment**: For each requirement, is it weak/moderate/strong?
- **Priority gaps**: What's most important to address for this specific role?
- **Reframing opportunities**: Where can existing content be repositioned?

### Step 4: Provide Tailoring Guidance

For each identified gap or weakness, skill provides:
- **Why it matters**: Why this specific skill/experience matters for the role
- **Current state**: What you have or how it's currently positioned
- **Suggested reframe**: How to emphasize/reword existing content
- **Before/after examples**: Concrete bullet rewrites
- **If missing entirely**: How to address a complete gap

## Output Format for Cowork

```json
{
  "job_title": "Anthropic Fellows Program - AI Safety",
  "resume_analyzed": "resume.tex",
  "overall_alignment": "78%",
  "alignment_breakdown": {
    "required_qualifications": "85%",
    "nice_to_have": "60%",
    "technical_skills": "80%",
    "soft_skills": "75%",
    "domain_knowledge": "70%"
  },
  "key_matches": [
    "Strong Python programming background",
    "ML research project experience",
    "Experience with large language models"
  ],
  "gaps": [
    {
      "requirement": "Experience with empirical ML research",
      "your_status": "Have some project experience but not emphasized",
      "priority": "high",
      "suggestion": "Reframe projects to highlight empirical methodology and results"
    }
  ],
  "tailoring_suggestions": [
    {
      "section": "experience",
      "current_bullet": "Built ML system using TensorFlow",
      "job_focus": "Job emphasizes empirical research and reproducibility",
      "suggested_rewrite": "Designed and conducted empirical evaluation of ML model robustness across 50K+ test cases, publishing results and open-sourcing evaluation framework",
      "why_better": "Emphasizes empirical rigor, publication/sharing (key for AI safety research)"
    }
  ],
  "priority_roadmap": [
    "High: Emphasize any research or publication work (AI safety values empirical rigor)",
    "High: Highlight open-source contributions (shows commitment to transparency)",
    "Medium: Add metrics showing scale of work (10K+ users, large models, etc.)",
    "Medium: Emphasize collaboration and mentorship (research community matters)"
  ]
}
```

## Key Principles This Skill Follows

### Doesn't Contradict Harvard or Kickass Guidelines
- All suggestions maintain **one-page format** (Kickass rule)
- All rewrites use **strong action verbs** (both Harvard & Kickass)
- All suggestions include **metrics** (both frameworks)
- Respects **strategic section ordering** (Kickass)
- Maintains **formatting consistency** (Kickass) and **professional standards** (Harvard)
- Suggestions work within resume structure, not against it

### Focus on Reframing, Not Fabrication
- **Never suggests adding false qualifications**
- Only reframes what you actually have
- Shows how to emphasize relevant aspects of real experience
- Identifies when something is genuinely missing (and suggests workarounds or alternatives)

### Context-Aware Tailoring
- Understands different job types (research vs. engineering vs. product vs. economics)
- Recognizes job-specific priorities (what matters most for this role)
- Provides role-specific action verbs and framing
- Considers company/team culture (startup vs. established, safety-focused vs. product-focused)

### Provides Concrete Examples
- Before/after bullets showing transformation
- Explains why each change improves alignment
- Shows multiple valid approaches (not one "correct" way)
- Demonstrates how same achievement can be framed differently

## Example: Job Requirement → Tailoring Suggestion

**Job Requirement**: "Experience with empirical ML research; track record of publishing or sharing work publicly"

**Your Current Resume** (weak):
"Built and trained a neural network model using PyTorch for image classification"

**Analysis**: 
- You did ML research (good), but doesn't emphasize empirical methodology or public sharing
- Doesn't show reproducibility or publication mindset

**Suggested Rewrite** (strong):
"Designed empirical evaluation framework for neural network robustness, testing 50K+ adversarial examples and publishing methodology on GitHub (200+ stars), resulting in adoption by 5+ research groups"

**Why It's Stronger**:
- "Empirical evaluation framework" → emphasizes research rigor
- "50K+ adversarial examples" → quantifies scope
- "Publishing on GitHub" → shows commitment to open science
- "200+ stars" → demonstrates community validation
- "Adoption by 5+ research groups" → shows impact on field

---

## CS-Specific Alignment Scenarios

### Scenario 1: CS Student → SWE Internship at FAANG

**Job Requirement Excerpt**:
"3+ months internship experience preferred. Strong foundation in data structures and algorithms. Experience shipping production code. Collaboration with cross-functional teams. Python or C++ required."

**Current Resume Bullet** (weak):
"Completed Data Structures course project: Implemented heap-based priority queue with sorting algorithms"

**Gap Analysis**:
- Shows algorithm knowledge but no production/shipping context
- Lacks collaboration signal
- Doesn't mention language explicitly
- Sounds academic, not engineering-focused

**Suggested Rewrite** (strong):
"Implemented and deployed production-grade priority queue system in Python handling 100K+ daily requests, collaborated with 2 teammates on design reviews, and achieved 20% latency improvement through algorithm optimization"

**Why Better**:
- "Deployed production-grade" → shipping signal
- "100K+ daily requests" → scale and real usage
- "Collaborated with 2 teammates on design reviews" → cross-functional collaboration
- "Python" → explicit tech stack match
- "20% latency improvement" → measurable optimization impact

---

### Scenario 2: Research-Focused Student → ML Engineer at Tech Company

**Job Requirement Excerpt**:
"Experience scaling ML systems. Fluent in PyTorch or TensorFlow. Ability to move quickly from research to prototype to production. Experience with MLOps, monitoring, or model deployment."

**Current Resume Bullet** (weak):
"Published paper on adversarial robustness in computer vision. Trained deep neural networks using PyTorch."

**Gap Analysis**:
- Strong research credential but no production/scaling context
- PyTorch mentioned but not emphasized for systems thinking
- No deployment or MLOps experience visible
- Missing "rapid iteration" and "shipping" signals

**Suggested Rewrite** (strong):
"Shipped production ML pipeline for adversarial robustness detection in PyTorch, scaling from 10 test images to 10M production images, implemented monitoring dashboard detecting model drift, and reduced inference latency 40% through quantization—published methodology in peer-reviewed venue"

**Why Better**:
- "Shipped production ML pipeline" → production engineer mindset, not just researcher
- "Scaling from 10 test images to 10M production images" → explicitly shows scaling journey
- "Implemented monitoring dashboard detecting model drift" → MLOps/deployment experience
- "Reduced inference latency 40% through quantization" → optimization and production constraints
- "Published methodology" → maintains research credibility while showing engineering ownership

---

### Scenario 3: Coursework-Heavy Student → Startup SWE Role

**Job Requirement Excerpt**:
"Scrappy builder comfortable wearing multiple hats. Full-stack experience valuable. Quick learning and rapid iteration. Shipped features users love. Startup experience or side projects preferred."

**Current Resume Bullets** (weak):
"Completed full-stack web development course. Built React frontend and Node.js backend for assignment. Received 95/100 on final project."

**Gap Analysis**:
- Coursework doesn't signal shipped product or user impact
- No "scrappy" or "iteration" signal
- No business/user outcome mentioned
- Sounds academic, not builder-minded
- Missing evidence of learning quickly

**Suggested Rewrite** (strong):
"Built and shipped full-stack task management app (React + Node.js) with 150+ active users in first month, iterated rapidly based on user feedback adding real-time collaboration and batch operations, and grew to 500+ users through word-of-mouth—demonstrates full-stack ownership and user-centric iteration in resource-constrained environment"

**Why Better**:
- "Built and shipped" → action verb showing shipping ownership
- "150+ active users in first month" → real impact and traction
- "Iterated rapidly based on user feedback" → scrappy/iteration signal
- "Adding real-time collaboration and batch operations" → concrete shipping examples
- "Grew to 500+ users through word-of-mouth" → user love and product quality signal
- "Resource-constrained environment" → startup mindset without explicitly saying side project

---

## Common Job Posting Types & What They Value

### AI Safety Research
**Cares About**: Empirical rigor, open-source contributions, reproducibility, publication mindset, safety-focused thinking
**Reframe Toward**: Research methodology, public sharing, measured results, collaborative spirit

### ML Engineering
**Cares About**: Scalable systems, performance optimization, production experience, cross-functional collaboration
**Reframe Toward**: Scale (users, data, throughput), optimization metrics, deployment experience, team impact

### Product Management
**Cares About**: User impact, stakeholder management, strategic thinking, communication, shipped features
**Reframe Toward**: User metrics, leadership moments, shipping velocity, revenue/business impact

### Economics/Policy Research
**Cares About**: Research methodology, analytical thinking, ability to write about findings, interdisciplinary thinking
**Reframe Toward**: Research rigor, insights/conclusions, clear communication, diverse perspectives

---

## Analysis Dimensions

The skill analyzes alignment across multiple dimensions:

### 1. Technical Skills Alignment
- Does your resume mention required technologies/languages?
- Are they emphasized with concrete usage examples?
- Suggestions: Reorder skills section, add projects using required tech, show depth in key areas

### 2. Experience Level Match
- Does your background match the seniority/type of experience needed?
- Can you demonstrate the required level of impact?
- Suggestions: Reframe to show appropriate scope, highlight relevant experience tier, add metrics

### 3. Domain Knowledge
- Do you have relevant industry/field background?
- Is your domain-specific knowledge visible?
- Suggestions: Emphasize relevant projects/roles, add context showing domain understanding

### 4. Soft Skills Demonstrated
- Are required soft skills (communication, leadership, collaboration) visible in your bullets?
- How do you demonstrate these concretely?
- Suggestions: Add context showing these skills, reframe individual achievement as team effort

### 5. Research/Output Mindset
- For research roles: Do you show research methodology, publication mindset, rigor?
- For engineering roles: Do you show shipping, performance, scale?
- Suggestions: Reframe to emphasize role-appropriate outputs and thinking

### 6. Growth/Learning Trajectory
- Does your resume show progression and growth?
- Can you demonstrate adaptability and learning in relevant areas?
- Suggestions: Highlight how you took on new challenges, learned new skills

---

## Keyword Extraction Methodology

This skill identifies job requirements using a tiered approach:

### Hard Requirements vs. Nice-to-Have Signals

**Hard Requirements** (must-haves):
- Typically in "Required Qualifications" section
- Use language like "must have", "required", "essential", "required X years of"
- Examples: "Python required", "3+ years experience", "BS in Computer Science"
- **Resume action**: Every hard requirement should map to at least one resume bullet

**Nice-to-Have Signals** (preferred):
- In "Preferred Qualifications" or "Nice-to-have" sections
- Use language like "preferred", "nice-to-have", "a plus", "valuable", "helpful"
- Examples: "Experience with cloud deployment preferred", "Publications a plus"
- **Resume action**: Nice-to-haves improve alignment but aren't blockers

**Implicit Requirements** (read between the lines):
- Requirements hidden in job description narrative
- Examples: "Fast-paced environment" = startup, high context-switching; "Cross-functional collaboration" = communication + stakeholder management skills; "Shipped products at scale" = production engineering, not just academic projects
- **Resume action**: Mirror the language and context in your bullets

### Hidden Requirement Detection Patterns

**Environment signals**:
- "Fast-paced" → expect frequent context-switching, rapid iteration, shipping velocity
- "Stable, long-term project" → depth expertise, deep codebase understanding, focus
- "Cross-functional teams" → communication, collaboration, ability to explain work to non-engineers
- "Early-stage startup" → scrappiness, wearing multiple hats, rapid learning
- "Large organization" → formal processes, documentation, mentorship/leadership

**Problem-space signals**:
- "Real-time systems" → low-latency, distributed systems, concurrency experience
- "Research" → methodology rigor, publication mindset, novel problems
- "Production at scale" → monitoring, debugging, optimization, DevOps thinking
- "Consulting" → client communication, business impact framing, broad tech exposure

**Culture signals**:
- "Diverse team" → inclusive collaboration, communication across backgrounds
- "Open-source culture" → public code contributions, community involvement, transparency
- "Data-driven" → metrics fluency, experimentation mindset, analytical thinking
- "Mission-driven" → ability to articulate company values, long-term thinking

### Tech Stack Keyword Matching Strategies

**Explicit matching**:
- Job says "Python" → your resume must mention Python
- Job says "AWS" → mention AWS (or specific services like EC2, Lambda)
- Job says "React" → mention React (not just "JavaScript" or "frontend")
- **Resume action**: If you have the tech, surface it. If missing critical tech, consider addressing in cover letter or being strategic about which bullets use required keywords

**Technology family matching**:
- Job wants "cloud deployment" → AWS, GCP, Azure all count (mention the one you have)
- Job wants "relational database" → PostgreSQL, MySQL, Oracle all fit (mention yours explicitly)
- Job wants "testing frameworks" → pytest, Jest, RSpec all demonstrate testing thinking
- **Resume action**: Use specific tech names, not generic categories; employers search for exact keywords

**Competency-based matching**:
- Job wants "distributed systems thinking" → look for bullets about scalability, handling concurrency, database replication
- Job wants "API design" → look for REST, GraphQL, or service design work (not just "API consumption")
- Job wants "optimization mindset" → look for performance improvements, latency reduction, throughput gains
- **Resume action**: Use domain-specific language matching the job posting; "optimization" beats "made it faster"

**Hidden tech/skills signals**:
- Job posting length/sophistication hints at role complexity
- Multiple specialized tools mentioned → deep technical depth expected
- Vague skills ("good communication") → likely interviews will test collaboration heavily
- Heavy emphasis on one skill → that's the bottleneck they're trying to solve
- **Resume action**: Allocate resume real estate proportional to job emphasis; if job emphasizes testing 3x, ensure you have testing visibility

---

## DO/DON'T Patterns for Strong Alignment

### DO: Strong Alignment Patterns

1. **DO map every hard requirement to a resume bullet**: If job requires Python, every mention of Python should appear somewhere in your resume. Not just "used Python once" but clear Python ownership.

2. **DO use the job posting's language**: If job says "empirical research", use "empirical"; if job says "shipped production features", use "shipped". Mirror terminology shows deep understanding.

3. **DO quantify impact using job-relevant metrics**: For research roles, quantify via publication count or citations. For engineering, quantify via users/scale/performance. For startup, quantify via growth/retention.

4. **DO show progression within bullets**: "Implemented → optimized → scaled" tells a better story than one static achievement. Shows learning and ownership progression.

5. **DO emphasize cross-functional collaboration when job values it**: "Collaborated with design team to ship feature" beats "Shipped feature". Explicitly name the collaboration pattern.

6. **DO connect past experience to future role**: If applying to AI safety research but resume shows ML engineering, reframe to show "rigorous empirical thinking" not just "fast iteration".

7. **DO highlight rare/differentiated skills prominently**: If job needs distributed systems and you built one, lead with that. Don't bury unique experience.

8. **DO address genuine gaps with workarounds**: If job wants 5 years and you have 2, emphasize "rapid learning" or "shipped production systems" showing capability despite experience delta.

### DON'T: Misalignment Anti-Patterns

1. **DON'T keyword-stuff without context**: Mentioning "Python, Java, C++, Rust, Go, Kotlin, Swift" looks unfocused. Show depth in 3-5 languages, not breadth across 10.

2. **DON'T use vague verbs for specific jobs**: "Worked on ML" fails for ML engineer role. Use "designed", "optimized", "shipped", "debugged", "scaled"—verbs that match the job's needs.

3. **DON'T mention irrelevant nice-to-haves if space-constrained**: One-page resume (Kickass rule). Don't sacrifice required skill visibility to show every nice-to-have. Prioritize hard requirements.

4. **DON'T fabricate or exaggerate skills**: "Led ML team" when you took one course appears during interviews. Stick to what's real. Reframing is powerful; dishonesty isn't.

5. **DON'T ignore soft-skill requirements**: "Communication skills" in job posting isn't filler. Show collaboration, mentorship, or clear writing in your bullets.

6. **DON'T bury critical alignment in weak position**: If you're strong in required skill, don't hide it in "Other Projects". Put it in main experience or skills section.

7. **DON'T apply identical resume to different role types**: SWE internship and ML internship require different emphasis (shipping vs. research). Same base resume, different tailoring per role.

8. **DON'T ignore the role's seniority level**: Applying to "senior engineer" role but resume shows junior-level bullets ("Completed project for class") signals misalignment. Reframe to show scope and mentorship appropriate to level.

---

## Quick Alignment Checklist

Before submitting a tailored resume, run through this rapid checklist:

**Required Skills Coverage** (5 min):
- [ ] Every hard requirement appears somewhere in resume
- [ ] Critical hard requirements appear in 2+ places (skills section + experience bullets)
- [ ] Use exact terminology from job posting (if job says "PyTorch", don't just say "deep learning")

**Emphasis & Framing** (5 min):
- [ ] Reframed bullets match job's priorities (if job emphasizes shipping, emphasize shipped features not just completed projects)
- [ ] Action verbs match job type (research = designed/analyzed; engineering = shipped/optimized; startup = shipped/scaled)
- [ ] Quantified metrics using job-relevant units (users/scale for engineering, publication count for research)

**Soft Skills Visibility** (3 min):
- [ ] Collaboration/communication explicitly mentioned if job requires it
- [ ] Leadership or mentorship visible if job emphasizes people management
- [ ] Learning agility shown if startup/fast-paced role

**Format & Standards** (2 min):
- [ ] One-page limit maintained (Kickass rule)
- [ ] All suggestions use strong action verbs (Harvard + Kickass requirement)
- [ ] Metrics present for quantifiable achievements
- [ ] No vague phrases like "worked on", "helped with", "contributed to" (replace with ownership verbs)

**Authenticity Check** (2 min):
- [ ] All reframing reflects actual achievements (no fabrication)
- [ ] Emphasis shifts are honest (you actually did these things, just highlighting them differently)
- [ ] Tone maintains your authentic voice (not jarringly different from LinkedIn/cover letter)

---

## What This Skill Doesn't Do

- **Doesn't fabricate experience**: Only reframes what you actually have
- **Doesn't violate Kickass/Harvard standards**: All suggestions maintain both frameworks
- **Doesn't write the entire resume**: Provides targeted tailoring suggestions, not a full rewrite
- **Doesn't make decisions for you**: Suggests options and explains tradeoffs; you decide
- **Doesn't guarantee outcomes**: Alignment is one factor; interview performance matters too
- **Doesn't override your authenticity**: Suggestions respect your actual background and values

## Integration with Kickass & Harvard Validators

This skill is **designed to work alongside** the Kickass and Harvard validators:

1. **First, validate your base resume**: Use the kickass-resume-validator or harvard-resume-validator to ensure one-page format, strong verbs, metrics
2. **Then, tailor for specific role**: Use this skill to reframe existing content for the job
3. **Finally, re-validate**: Run Kickass or Harvard validator again to ensure changes maintain standards

All suggestions from this skill will be compatible with both frameworks—you won't have to choose between "tailored" and "following best practices."

---

## Complete Integration Workflow with Validators

The recommended sequence uses all three skills together for maximum impact:

### Phase 1: Baseline Validation (5-10 min)

**Step 1a**: Run `kickass-resume-validator` on your resume.tex
- Validates one-page format, action verbs, metric presence
- Identifies any formatting violations or weak bullets
- Output: List of baseline improvements to make before tailoring

**Step 1b**: (Optional) Run `harvard-resume-validator` to confirm Harvard College guidelines
- Ensures compliance with Harvard standards
- May highlight different patterns than Kickass
- Output: Additional perspectives on resume quality

**Decision Point**: Fix critical formatting issues now before tailoring (don't tailor a resume that violates one-page rule)

### Phase 2: Job-Specific Tailoring (10-15 min)

**Step 2a**: Prepare job materials
- Save job description as `.md` file in working folder
- Ensure resume.tex is in same folder
- Open both documents so you can reference them

**Step 2b**: Run resume-job-alignment skill (this skill)
- Provide resume.tex and job_description.md
- Get alignment analysis with coverage %, gaps, and suggestions
- Output: Specific reframe suggestions with before/after examples

**Step 2c**: Apply tailoring suggestions to resume.tex
- Update 2-3 bullets with highest priority gaps
- Reframe using suggested language patterns
- Focus on hard requirements first, nice-to-haves second
- Keep one-page format (Kickass constraint)

### Phase 3: Quality Assurance (5 min)

**Step 3a**: Run `kickass-resume-validator` again
- Confirm tailored bullets still meet quality standards
- Check that action verbs are strong
- Verify metrics are present and meaningful
- Ensure formatting hasn't drifted

**Step 3b**: (Optional) Run resume-job-alignment skill again
- Re-check alignment % after changes
- Confirm gaps are addressed
- Identify any remaining weak spots

**Decision Point**: If alignment improved and Kickass validates, ready to submit. If still gaps, iterate Steps 2c-3b

### Phase 4: Final Polish (2-3 min)

**Step 4a**: Harvard validation (optional final check)
- Run `harvard-resume-validator` to ensure final version meets standards
- Particularly useful if applying to Harvard or similar institutions

**Step 4b**: Manual review
- Read resume aloud to catch awkward phrasing
- Verify quantification is accurate
- Check that you'd confidently explain each bullet in interview

**Decision Point**: Submit with confidence

---

## Example Workflow in Cowork

```
Step 1: Validate baseline resume
Run: kickass-resume-validator on resume.tex
Output: "8 bullets need stronger verbs, add metrics to 3 bullets"

Step 2: Fix validation issues
Update resume with better action verbs and metrics
Goal: Pass Kickass baseline

Step 3: Tailor for specific job
Put resume.tex and anthropic_job.md in working folder
Run: resume-job-alignment skill
Output: "78% aligned overall, gaps in open-source contributions, 
         publication mindset not emphasized"

Step 4: Apply tailoring suggestions
Reframe 3 bullets to emphasize research rigor and GitHub work
Update skills section to mention open-source contributions
Keep one-page format (remove lower-priority bullets)

Step 5: Re-validate tailored resume
Run: kickass-resume-validator on updated resume.tex
Output: "All bullets now have strong verbs and metrics, formatting clean"

Step 6: Confirm improved alignment
Run: resume-job-alignment skill again
Output: "Alignment improved to 88%, open-source now visible, 
         publication mindset clear, ready to submit"

Step 7: Final Harvard check (optional)
Run: harvard-resume-validator
Output: "Meets Harvard standards, professional presentation solid"

Step 8: Submit tailored resume with confidence
```

---

## Tips for Best Results

1. **Be honest about your background**: Only reframe what's real; don't fabricate
2. **Understand the role**: Read the full job posting, not just the title
3. **Prioritize**: Focus on high-priority gaps first
4. **Test multiple approaches**: Skill may suggest different ways to frame same achievement
5. **Iterate**: Run Kickass/Harvard validator after applying changes
6. **Tailor each application**: Different roles within same company may need different emphasis
7. **Know when to apply anyway**: Even 70-80% alignment can be worth applying if you're interested
8. **Don't over-tailor**: Maintain authenticity; slight emphasis shift > complete reinvention

---

## Related Skills

- **kickass-resume-validator**: Ensure resume follows best practices (one-page, metrics, verbs)
- **harvard-resume-validator**: Ensure Harvard College guidelines are followed
- **Both validators**: Run after applying tailoring suggestions to confirm changes maintain standards

---

**Skill Version**: 1.0  
**Purpose**: Resume-job alignment and tailoring guidance  
**Platform**: Cowork (.tex resume + .md job description)  
**Integrates With**: Kickass and Harvard resume validators  
**Audience**: CS/tech students and professionals tailoring resumes  
