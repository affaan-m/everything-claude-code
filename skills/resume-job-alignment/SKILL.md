---
name: resume-job-alignment
description: Align and tailor a resume to a specific job posting. Use when both a resume (.tex) and a job description (.md or plaintext) are available — the skill extracts hard/nice-to-have requirements, scores alignment, and returns concrete before/after bullet rewrites. Designed to run alongside `harvard-resume-validator` or `kickass-resume-validator` without contradicting them. Trigger on "tailor my resume for this job", "align my resume with job posting", "does my resume match this job", or when both a `.tex` resume and a job-description file appear in the working directory.
origin: ECC
tags: [resume, latex, tailoring, job-fit]
---

# Resume-Job Alignment & Tailoring

Analyzes how well a resume matches a specific job posting and returns targeted guidance on what to emphasize, reframe, or add. Does not rewrite whole resumes — it produces **reframing suggestions** grounded in what's already true of the candidate.

## Requires

- A LaTeX `.tex` resume file in the working directory (or resume content pasted in).
- A job description as Markdown, plain text, or pasted content.

Generic resume material (action verbs, LaTeX ATS pitfalls, one-page formatting) lives in [`../_shared/resume-common.md`](../_shared/resume-common.md). Resume quality standards live in `harvard-resume-validator` and `kickass-resume-validator`. This skill covers only **alignment-to-a-specific-posting** logic.

## When to Activate

Use this skill when:

- Both a resume and a specific job posting are available in the working directory.
- The user asks: "tailor my resume for this job", "does my resume match this job", "how should I emphasize skills for this role".
- You need before/after bullet rewrites for a named role or company.
- The user is applying to multiple similar roles and wants to understand emphasis differences.

Run `harvard-resume-validator` or `kickass-resume-validator` **before** this skill to ensure the base resume is already solid. Tailoring a broken resume is wasted effort.

## How It Works

Three-dimensional analysis:

1. **Requirement matching** — what the job requires vs. what the resume shows.
2. **Emphasis** — whether relevant skills are prominent or buried.
3. **Gap identification** — what's missing, what's weak, what needs reframing.

Four outputs per run:

- An overall alignment percentage.
- A coverage breakdown by requirement type.
- Ranked gaps (high/medium/low).
- Concrete before/after bullet rewrites with explanations.

## Output Format

Single JSON object. Schema at `schema/output.schema.json`.

```json
{
  "job_title": "ML Research Engineer — Anthropic Fellows",
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
    "Strong Python and PyTorch background.",
    "Empirical ML project experience with published results.",
    "Evidence of open-source contribution (GitHub stars)."
  ],
  "gaps": [
    {
      "requirement": "Experience running empirical evaluations at scale",
      "your_status": "Some project experience but not emphasized",
      "priority": "high",
      "suggestion": "Reframe MedicalNet project to foreground empirical methodology and held-out evaluation size."
    }
  ],
  "tailoring_suggestions": [
    {
      "section": "experience",
      "current_bullet": "Built ML system using TensorFlow.",
      "job_focus": "Role emphasizes empirical rigor and reproducibility.",
      "suggested_rewrite": "Designed empirical evaluation framework for ML robustness across 50K adversarial examples; open-sourced (200 GitHub stars, adopted by 5 research groups).",
      "why_better": "Surfaces empirical methodology and community adoption — the two signals the posting asks for."
    }
  ],
  "priority_roadmap": [
    "High: Foreground empirical methodology and sharing (research labs value transparency).",
    "High: Highlight open-source contributions — make them visible in Projects, not only in Skills.",
    "Medium: Add scale metrics (dataset size, parameter count, eval volume).",
    "Medium: Surface collaboration/mentorship signals where genuine."
  ]
}
```

## Keyword Extraction

### Hard requirements (must-have)

Signals: "must have", "required", "essential", explicit year counts, named degrees.

Examples:
- "Python required" → every Python-using bullet should surface the word "Python".
- "3+ years experience" → foreground seniority signals if you have them.
- "BS in Computer Science" → mirror the program name.

Every hard requirement should map to at least one resume bullet.

### Nice-to-have (preferred)

Signals: "preferred", "nice-to-have", "a plus", "valuable", "helpful".

Examples:
- "Cloud deployment experience preferred" → mention specific cloud work if present.
- "Publications a plus" → list if you have them; don't invent.

Nice-to-haves improve alignment but don't block an application.

### Implicit requirements

Requirements hidden in narrative language. Read between the lines.

**Environment signals:**

- "Fast-paced" → context-switching, rapid iteration, shipping velocity.
- "Stable, long-term project" → deep codebase understanding, focus, depth.
- "Cross-functional teams" → communication, stakeholder management.
- "Early-stage startup" → scrappiness, multiple hats, rapid learning.

**Problem-space signals:**

- "Real-time systems" → low-latency, distributed, concurrency.
- "Research" → methodology rigor, publication mindset.
- "Production at scale" → monitoring, debugging, DevOps fluency.

**Culture signals:**

- "Open-source culture" → public code contributions, transparency.
- "Data-driven" → metrics fluency, experimentation, analytical thinking.
- "Mission-driven" → ability to articulate company values, long-term thinking.

### Tech-stack matching

Employers (and ATS systems) search for **exact keywords**:

- Job says "Python" → use "Python", not "scripting".
- Job says "AWS" → name specific services (EC2, Lambda) if you used them.
- Job says "React" → don't just say "JavaScript" or "frontend".

For competency categories (not specific tools), use the employer's terminology: "distributed systems thinking", "API design", "optimization mindset" — not the generic words.

## Common Job Types & What They Value

| Role type | Cares about | Reframe toward |
|-----------|-------------|----------------|
| AI safety research | Empirical rigor, open-source, reproducibility, publication mindset | Research methodology, public sharing, measured results |
| ML engineering | Scalable systems, performance optimization, production experience | Scale (users, throughput), optimization metrics, deployment |
| Product management | User impact, stakeholder mgmt, strategy, shipped features | User metrics, leadership, shipping velocity, revenue impact |
| Economics / policy research | Methodology, analytical thinking, clear writing | Research rigor, insights, communication, interdisciplinary scope |
| Startup SWE | Scrappy shipping, full-stack fluency, user traction | Shipped features with user metrics, rapid iteration |

## Scenarios

### CS Student → FAANG SWE Internship

**Posting excerpt:** "Internship or production experience preferred. Strong foundation in data structures and algorithms. Experience shipping production code. Cross-functional collaboration. Python or C++ required."

**Weak bullet:** "Completed Data Structures course project: implemented heap-based priority queue."

**Gap:** Shows algorithm knowledge but no production context, no collaboration, no explicit language mention.

**Rewrite:** "Implemented and deployed a production-grade priority queue in Python handling 100K+ daily requests; collaborated with two teammates through design reviews; achieved 20% latency improvement via heap restructuring."

**Why better:** "production-grade" and "deployed" signal shipping; "Python" explicit; metric on scale; explicit collaboration pattern.

---

### Researcher → ML Engineer (Tech Company)

**Posting excerpt:** "Experience scaling ML systems. Fluent in PyTorch or TensorFlow. Move quickly from research to prototype to production. MLOps, monitoring, or model deployment experience valued."

**Weak bullet:** "Published paper on adversarial robustness in computer vision. Trained deep neural networks using PyTorch."

**Gap:** Strong research signal; no production, no scaling, no MLOps visibility.

**Rewrite:** "Shipped production ML pipeline for adversarial-robustness detection in PyTorch, scaling from 10 test images to 10M production images; built monitoring dashboard surfacing model drift; cut inference latency 40% via quantization — methodology published in peer-reviewed venue."

**Why better:** "Shipped production" + scaling journey + monitoring (MLOps) + quantization (optimization) + research credibility preserved at the end.

---

### Coursework-Heavy Student → Startup SWE

**Posting excerpt:** "Scrappy builder, multiple hats. Full-stack valuable. Quick learner. Shipped features users love. Startup experience or side projects preferred."

**Weak bullet:** "Completed full-stack web dev course. Built React frontend and Node.js backend for assignment. 95/100 on final project."

**Gap:** Coursework framing, no user impact, no iteration signal.

**Rewrite:** "Built and shipped full-stack task-management app (React + Node.js) with 150+ active users in first month; iterated on user feedback to add real-time collaboration and batch operations; grew to 500+ users through word-of-mouth."

**Why better:** "Shipped" (not "completed"), real user metrics, iteration signal, organic growth.

## DO / DON'T

### DO

- Map every hard requirement to at least one resume bullet.
- Mirror the posting's language ("empirical" → use "empirical"; "shipped" → use "shipped").
- Quantify with role-appropriate units: research → publications/adoption; engineering → users/scale/latency; startup → growth/retention.
- Show progression within a bullet when honest ("Implemented → optimized → scaled").
- Address experience gaps with workarounds ("rapid learning", "production shipping") — but only when they're real.

### DON'T

- Keyword-stuff without context.
- Fabricate or exaggerate skills. Reframing is powerful; lying isn't.
- Mention irrelevant nice-to-haves when space is tight — prioritize hard requirements.
- Bury critical alignment in weak positions. If you're strong on a required skill, put it in main Experience, not in "Other Projects".
- Apply the same resume to role types that value different signals (SWE vs. research vs. PM need different framing).

## Integration With Validators

The recommended workflow is three passes:

1. **Baseline validation** — run `kickass-resume-validator` (or `harvard-resume-validator` depending on target). Fix all structural issues before tailoring.
2. **Tailoring** — this skill. Apply 2–4 high-priority rewrites; keep within the one-page limit.
3. **Re-validation** — rerun the validator. Confirm the tailored bullets still pass.

All suggestions from this skill are designed to stay compatible with both Harvard and Kickass guidelines — you won't have to choose between "tailored" and "well-formed".

## Related Skills

- `harvard-resume-validator` — academic-variant resume quality check.
- `kickass-resume-validator` — industry-variant resume quality check.
- Shared reference: [`../_shared/resume-common.md`](../_shared/resume-common.md).
