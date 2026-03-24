# Role × Skill Recommendation Catalog

Recommended Claude Code Skills organized by user role. Covers 11 categories and 42 professional roles.

## Recommendation Principles

1. **Quality over quantity**: 5–10 role-specific Skills per role (excluding inherited universal/category-level Skills)
2. **Justify every pick**: Each recommendation includes a one-liner explaining why this role needs it
3. **Inheritance model**: Universal → Category → Role-specific. Only role-specific Skills are listed; inherited Skills are declared once, not repeated
4. **Source distinction**: External = installed via skills.sh / Official = Anthropic example-skills

## Source Legend

| Badge | Meaning | How to Install |
|-------|---------|----------------|
| 🅰️ Official | Anthropic example-skills | Bundled with Claude Code |
| 📦 External | Community Skill (GitHub / agentskills.sh) | `npx skills add <package-name>` |

---

## Level 0: Universal Skills (auto-inherited by all roles)

| Skill | Source | Why everyone needs this |
|-------|--------|------------------------|
| brainstorming | 📦 sickn33/antigravity-awesome-skills | The starting point for any creative work — ideation, requirement exploration |
| planner | 📦 am-will/codex-skills | Any non-trivial task needs a plan and task breakdown |
| baoyu-image-gen | 📦 jimliu/baoyu-skills | AI image generation supporting OpenAI/Google/DashScope APIs (13.3K installs) |
| baoyu-infographic | 📦 jimliu/baoyu-skills | Professional infographic generation with 20 layouts × 17 styles (11.2K installs) |
| find-skills | 📦 vercel-labs/skills | Discover and install new Claude Code Skills |

---

## A. Engineering & Technology

### Level 1: Engineering Universal (auto-inherited by all engineering roles)

| Skill | Source | Why every engineer needs this |
|-------|--------|------------------------------|
| tdd:test-driven-development | 📦 neolabhq/context-engineering-kit | Write tests before code — foundational engineering discipline |
| systematic-debugging | 📦 obra/superpowers | Structured bug investigation, no guesswork |
| verification-before-completion | 📦 sickn33/antigravity-awesome-skills | Run verification before declaring done to catch gaps |
| code-reviewer | 📦 alirezarezvani/claude-skills | Proactively request code reviews to raise code quality |
| pr-review-expert | 📦 alirezarezvani/claude-skills | Process incoming reviews effectively |
| conventional-commit | 📦 github/awesome-copilot | Standardized Git commit messages |
| api-documentation-generator | 📦 sickn33/antigravity-awesome-skills | Auto-generate API documentation |
| github-search | 📦 parcadei/continuous-claude-v3 | Search code on GitHub |
| changelog-maintenance | 📦 supercent-io/skills-template | Automated CHANGELOG maintenance (10.9K installs) |

---

### A1. Backend Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for backend |
|-------|--------|----------------|
| jenkins-deploy | 📦 abcfed/claude-marketplace | Manage Jenkins test environment deployments |
| performance-profiling | 📦 sickn33/antigravity-awesome-skills | Server-side performance analysis and optimization (424 installs) |
| postgresql-database-engineering | 📦 manutej/luxor-claude-marketplace | PostgreSQL engineering best practices (442 installs) |
| microservices-architect | 📦 jeffallan/claude-skills | Microservices architecture design guide (977 installs) |
| docker | 📦 bobmatnyc/claude-mpm-skills | Docker containerization best practices (456 installs) |

**Stack-specific options**:

| Stack | Skill | Source | Installs |
|-------|-------|--------|----------|
| Java / Spring | java-springboot | 📦 github/awesome-copilot | 9.1K |
| Python / Django | django-cloud-sql-postgres | 📦 jezweb/claude-skills | 277 |
| Python / Flask | flask | 📦 bobmatnyc/claude-mpm-skills | 129 |
| Go | golang-backend-development | 📦 manutej/luxor-claude-marketplace | 524 |
| Rust | rust-pro | 📦 sickn33/antigravity-awesome-skills | 187 |

---

### A2. Frontend Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for frontend |
|-------|--------|----------------|
| frontend-design | 🅰️ Anthropic Official | High-quality UI component generation, avoids generic AI aesthetics |
| webapp-testing | 🅰️ Anthropic Official | Playwright automation testing for local web apps |
| web-artifacts-builder | 🅰️ Anthropic Official | Build complex multi-component Web Artifacts |
| theme-factory | 🅰️ Anthropic Official | Theme and style systems with 10 preset themes |
| seo | 📦 addyosmani/web-quality-skills | SEO audit by a Google engineer (4.2K installs) |
| accessibility | 📦 addyosmani/web-quality-skills | WCAG accessibility compliance audit (3.9K installs) |
| nextjs-react-typescript | 📦 mindrally/skills | Next.js + React + TypeScript best practices (1.2K installs) |
| playwright-testing | 📦 alinaqi/claude-bootstrap | Playwright E2E testing framework (415 installs) |

---

### A3. Full-Stack Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

Curated picks from A1 and A2 — the skills that matter most when you work both sides of the stack.

| Skill | Source | Why for full-stack |
|-------|--------|--------------------|
| frontend-design | 🅰️ Anthropic Official | UI component generation — the frontend half of every feature |
| webapp-testing | 🅰️ Anthropic Official | End-to-end Playwright testing across the full stack |
| docker | 📦 bobmatnyc/claude-mpm-skills | Containerize both frontend and backend services (456 installs) |
| microservices-architect | 📦 jeffallan/claude-skills | Design service boundaries you'll implement yourself (977 installs) |
| performance-profiling | 📦 sickn33/antigravity-awesome-skills | Profile both server and client bottlenecks (424 installs) |
| nextjs-react-typescript | 📦 mindrally/skills | Full-stack framework of choice for many solo builders (1.2K installs) |

**Need deeper specialization?** Check A1 (Backend) and A2 (Frontend) for stack-specific skills.

---

### A4. Mobile Developer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for mobile |
|-------|--------|---------------|
| react-native | 📦 alinaqi/claude-bootstrap | React Native streaming content block rendering |
| frontend-design | 🅰️ Anthropic Official | Mobile UI component design |
| senior-mobile | 📦 borghei/claude-skills | Senior-level mobile development practices (270 installs) |

---

### A5. AI/ML Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for AI/ML |
|-------|--------|--------------|
| senior-prompt-engineer | 📦 davila7/claude-code-templates | Claude API / Anthropic SDK development |
| mcp-builder | 🅰️ Anthropic Official | Build MCP servers to integrate external services |
| mcp-builder (community) | 📦 mcp-use/skills | MCP server building (299 installs) |
| ml-model-training | 📦 aj-geddes/useful-ai-prompts | ML model training guide (135 installs) |
| ai-ml-data-science | 📦 vasilyu1983/ai-agents-public | Full-stack AI/ML/data science guide (120 installs) |
| news-summary | 📦 sundial-org/awesome-openclaw-skills | Daily AI digest tracking the latest papers and models |
| podcast-to-content-suite | 📦 onewave-ai/claude-skills | Summarize AI papers, lectures, and podcasts |
| xlsx | 🅰️ Anthropic Official | Data processing and experiment result analysis |

---

### A6. Data Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for data engineering |
|-------|--------|------------------------|
| postgresql-database-engineering | 📦 manutej/luxor-claude-marketplace | PostgreSQL engineering best practices (442 installs) |
| sqlite-database-expert | 📦 martinholovsky/claude-skills-generator | SQLite database expert (673 installs) |
| xlsx | 🅰️ Anthropic Official | Data processing and transformation |
| pdf | 🅰️ Anthropic Official | PDF data extraction |
| ci-cd-best-practices | 📦 mindrally/skills | CI/CD practices for data pipelines (341 installs) |

---

### A7. QA Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for QA |
|-------|--------|-----------|
| webapp-testing | 🅰️ Anthropic Official | Playwright automation testing |
| playwright-testing | 📦 alinaqi/claude-bootstrap | Playwright E2E testing (415 installs) |
| performance-profiling | 📦 sickn33/antigravity-awesome-skills | Performance testing and analysis (424 installs) |
| docx | 🅰️ Anthropic Official | Writing test reports |
| accessibility | 📦 addyosmani/web-quality-skills | Accessibility testing (3.9K installs) |

---

### A8. Security Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for security |
|-------|--------|----------------|
| dependency-vulnerability-checker | 📦 jeremylongshore/claude-code-plugins-plus-skills | Dependency vulnerability scanning (41 installs) |
| docx | 🅰️ Anthropic Official | Writing security audit reports |
| doc-coauthoring | 🅰️ Anthropic Official | Collaborating on security policy documents |
| the-fool | 📦 jeffallan/claude-skills | Multi-angle adversarial analysis for threat modeling |

---

### A9. DevOps / SRE

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for DevOps |
|-------|--------|---------------|
| jenkins-deploy | 📦 abcfed/claude-marketplace | Manage Jenkins test environment deployments |
| terraform-module-library | 📦 wshobson/agents | Terraform IaC module library (5.1K installs) |
| docker | 📦 bobmatnyc/claude-mpm-skills | Docker best practices (456 installs) |
| ci-cd-best-practices | 📦 mindrally/skills | CI/CD best practices (341 installs) |
| container-orchestration | 📦 0xdarkmatter/claude-mods | Container orchestration (66 installs) |

---

### A10. Embedded Engineer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for embedded |
|-------|--------|----------------|
| embedded-systems | 📦 404kidwiz/claude-supercode-skills | Embedded systems development guide (125 installs) |
| rust-pro | 📦 sickn33/antigravity-awesome-skills | Rust systems programming (187 installs) |
| firmware-analyst | 📦 sickn33/antigravity-awesome-skills | Firmware analysis (118 installs) |
| doc-coauthoring | 🅰️ Anthropic Official | Collaborating on hardware interface documentation |

---

### A11. Game Developer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for game development |
|-------|--------|------------------------|
| game-developer | 📦 jeffallan/claude-skills | Game development best practices (999 installs) |
| algorithmic-art | 🅰️ Anthropic Official | Algorithmic art and generative graphics |
| performance-profiling | 📦 sickn33/antigravity-awesome-skills | Game performance optimization (424 installs) |
| canvas-design | 🅰️ Anthropic Official | Visual design and artistic creation |

---

### A12. Blockchain / Web3 Developer

> Inherits: Level 0 + Level 1 (Engineering Universal)

| Skill | Source | Why for Web3 |
|-------|--------|-------------|
| web3-testing | 📦 wshobson/agents | Web3 testing framework (3.3K installs) |
| solidity-security-audit | 📦 mariano-aguero/solidity-security-audit-skill | Solidity security audit (23 installs) |
| frontend-design | 🅰️ Anthropic Official | DApp frontend development |
| research-by-reddit | 📦 muzhicaomingwang/ai-ideas | Track Web3 community trends |
| x-research | 📦 rohunvora/x-research-skill | Search Crypto/Web3 community discussions |

---

## B. Architecture & Technical Leadership

### Level 1: Technical Leadership Universal

| Skill | Source | Why every tech leader needs this |
|-------|--------|----------------------------------|
| planner | 📦 am-will/codex-skills | Technical planning and task decomposition |
| the-fool | 📦 jeffallan/claude-skills | Adversarial analysis for high-stakes technical decisions |
| weekly-report | 📦 claude-office-skills/skills | Automated team weekly report rollup |
| meeting-minutes | 📦 github/awesome-copilot | Auto-generated meeting minutes |
| doc-coauthoring | 🅰️ Anthropic Official | Technical documentation collaboration |
| internal-comms | 🅰️ Anthropic Official | Internal communication templates |
| pptx | 🅰️ Anthropic Official | Presentation deck creation |

---

### B1. Software Architect

> Inherits: Level 0 + B Leadership Universal + A Level 1 (Engineering Universal)

| Skill | Source | Why for architects |
|-------|--------|------------------|
| microservices-architect | 📦 jeffallan/claude-skills | Microservices architecture design (977 installs) |
| standup-meeting | 📦 supercent-io/skills-template | Architecture review and standup notes (10.5K installs) |
| elite-powerpoint-designer | 📦 willem4130/claude-code-skills | Architecture presentation decks (1.3K installs) |

---

### B2. Tech Lead / CTO

> Inherits: Level 0 + B Leadership Universal + B1 (Software Architect)

| Skill | Source | Why for CTOs |
|-------|--------|-------------|
| news-summary | 📦 sundial-org/awesome-openclaw-skills | Track AI and technology trends |
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Build technical brand and industry influence |
| x-research | 📦 rohunvora/x-research-skill | Search tech community discussions |

---

### B3. Engineering Manager

> Inherits: Level 0 + B Leadership Universal

| Skill | Source | Why for engineering managers |
|-------|--------|------------------------------|
| standup-meeting | 📦 supercent-io/skills-template | Automated standup notes (10.5K installs) |
| sprint-planner | 📦 eddiebe147/claude-settings | Sprint planning (47 installs) |
| elite-powerpoint-designer | 📦 willem4130/claude-code-skills | Management reporting decks (1.3K installs) |
| xlsx | 🅰️ Anthropic Official | Team data analysis (hours, velocity, etc.) |

---

## C. Product

### C1. Product Manager

> Inherits: Level 0

| Skill | Source | Why for product managers |
|-------|--------|------------------------|
| planner | 📦 am-will/codex-skills | Requirement decomposition and implementation planning |
| doc-coauthoring | 🅰️ Anthropic Official | PRD and technical document collaboration |
| meeting-minutes | 📦 github/awesome-copilot | Auto-generated meeting minutes |
| the-fool | 📦 jeffallan/claude-skills | Critical analysis for product decisions |
| pptx | 🅰️ Anthropic Official | Product presentation decks |
| xlsx | 🅰️ Anthropic Official | Data analysis and prioritization matrices |
| product-manager | 📦 aj-geddes/claude-code-bmad-skills | Product manager workflow (115 installs) |
| last30days | 📦 trailofbits/skills-curated | User feedback and competitive analysis |

---

### C2. Project Manager

> Inherits: Level 0

| Skill | Source | Why for project managers |
|-------|--------|------------------------|
| planner | 📦 am-will/codex-skills | Project planning and milestone tracking |
| weekly-report | 📦 claude-office-skills/skills | Automated weekly report rollup |
| meeting-minutes | 📦 github/awesome-copilot | Meeting minutes |
| standup-meeting | 📦 supercent-io/skills-template | Standup notes (10.5K installs) |
| sprint-planner | 📦 eddiebe147/claude-settings | Sprint planning (47 installs) |
| the-fool | 📦 jeffallan/claude-skills | Risk assessment and decision analysis |
| pptx | 🅰️ Anthropic Official | Project status presentations |
| docx | 🅰️ Anthropic Official | Project documentation |

---

## D. Design

### D1. UX / Product Designer

> Inherits: Level 0

| Skill | Source | Why for UX design |
|-------|--------|------------------|
| frontend-design | 🅰️ Anthropic Official | High-quality UI prototype generation |
| webapp-testing | 🅰️ Anthropic Official | Usability testing validation |
| theme-factory | 🅰️ Anthropic Official | Design systems and theme management |
| ui-design-review | 📦 mastepanoski/claude-skills | UI design review (266 installs) |
| figma-design | 📦 manutej/luxor-claude-marketplace | Figma design collaboration (103 installs) |
| accessibility | 📦 addyosmani/web-quality-skills | Accessibility design audit (3.9K installs) |
| doc-coauthoring | 🅰️ Anthropic Official | User research report collaboration |

---

### D2. UI / Visual Designer

> Inherits: Level 0

| Skill | Source | Why for UI/visual design |
|-------|--------|------------------------|
| canvas-design | 🅰️ Anthropic Official | Visual and artistic creation |
| theme-factory | 🅰️ Anthropic Official | Theme and brand visual systems |
| frontend-design | 🅰️ Anthropic Official | Design-to-frontend code conversion |
| algorithmic-art | 🅰️ Anthropic Official | Generative algorithmic art |
| ui-design-review | 📦 mastepanoski/claude-skills | UI design review (266 installs) |
| slack-gif-creator | 🅰️ Anthropic Official | Animated GIF creation |

---

## E. Data

### E1. Data Analyst

> Inherits: Level 0

| Skill | Source | Why for data analysis |
|-------|--------|----------------------|
| xlsx | 🅰️ Anthropic Official | Excel data processing and formulas |
| pdf | 🅰️ Anthropic Official | PDF data extraction |
| planner | 📦 am-will/codex-skills | Analysis plan design |
| pptx | 🅰️ Anthropic Official | Presenting analysis results |
| data-visualization | 📦 smithery.ai | Data visualization (55 installs) |
| recharts-patterns | 📦 yonatangross/orchestkit | Chart component patterns (82 installs) |

---

### E2. Data Scientist

> Inherits: Level 0 + E1 (Data Analyst)

| Skill | Source | Why for data science |
|-------|--------|---------------------|
| ml-model-training | 📦 aj-geddes/useful-ai-prompts | ML model training guide (135 installs) |
| ai-ml-data-science | 📦 vasilyu1983/ai-agents-public | Full-stack AI/ML guide (120 installs) |
| systematic-debugging | 📦 obra/superpowers | Model debugging and data pipeline troubleshooting |
| tdd:test-driven-development | 📦 neolabhq/context-engineering-kit | Data pipeline testing |
| podcast-to-content-suite | 📦 onewave-ai/claude-skills | Summarize papers and lectures |
| news-summary | 📦 sundial-org/awesome-openclaw-skills | Track AI/ML news and research |

---

## F. Content & Creative

### F1. Technical Writer

> Inherits: Level 0

| Skill | Source | Why for technical writing |
|-------|--------|--------------------------|
| api-documentation-generator | 📦 sickn33/antigravity-awesome-skills | Auto-generate API documentation |
| doc-coauthoring | 🅰️ Anthropic Official | Long-form document collaboration and iteration |
| docx | 🅰️ Anthropic Official | Professional document formatting |
| changelog-maintenance | 📦 supercent-io/skills-template | CHANGELOG maintenance (10.9K installs) |
| readme-updater | 📦 ovachiever/droid-tings | Automated README updates (57 installs) |

---

### F2. Content Creator

> Inherits: Level 0

| Skill | Source | Why for content creation |
|-------|--------|------------------------|
| podcast-to-content-suite | 📦 onewave-ai/claude-skills | Summarize podcast/video transcripts |
| baoyu-youtube-transcript | 📦 jimliu/baoyu-skills | Download videos/audio and extract transcripts |
| doc-coauthoring | 🅰️ Anthropic Official | Long-form content collaboration |
| i18n-localization | 📦 sickn33/antigravity-awesome-skills | Chinese-to-English localization in Reddit style |
| news-summary | 📦 sundial-org/awesome-openclaw-skills | Daily AI news digest |
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Twitter growth strategy |
| content-creation | 📦 anthropics/knowledge-work-plugins | Anthropic content creation guide (877 installs) |

---

### F3. Copywriter

> Inherits: Level 0

| Skill | Source | Why for copywriting |
|-------|--------|-------------------|
| doc-coauthoring | 🅰️ Anthropic Official | Copy collaboration and iteration |
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Social media copy strategy |
| i18n-localization | 📦 sickn33/antigravity-awesome-skills | Localization for international markets |
| content-creation | 📦 anthropics/knowledge-work-plugins | Content creation guide (877 installs) |
| email-marketing | 📦 claude-office-skills/skills | Email marketing copy (250 installs) |

---

## G. Marketing & Growth

### G1. Marketing Manager

> Inherits: Level 0

| Skill | Source | Why for marketing |
|-------|--------|-----------------|
| the-fool | 📦 jeffallan/claude-skills | Multi-angle analysis for marketing strategy |
| last30days | 📦 trailofbits/skills-curated | Market research and user feedback |
| pptx | 🅰️ Anthropic Official | Marketing presentations |
| internal-comms | 🅰️ Anthropic Official | Internal communications and reports |
| canvas-design | 🅰️ Anthropic Official | Marketing visuals and poster design |
| email-marketing | 📦 claude-office-skills/skills | Email marketing (250 installs) |
| elite-powerpoint-designer | 📦 willem4130/claude-code-skills | High-quality presentation decks (1.3K installs) |
| seo | 📦 addyosmani/web-quality-skills | SEO strategy (4.2K installs) |

---

### G2. Growth Hacker

> Inherits: Level 0

| Skill | Source | Why for growth |
|-------|--------|--------------|
| planner | 📦 am-will/codex-skills | Growth experiment design |
| xlsx | 🅰️ Anthropic Official | Growth data analysis |
| last30days | 📦 trailofbits/skills-curated | User feedback and community insights |
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Social media growth strategy |
| seo | 📦 addyosmani/web-quality-skills | SEO optimization (4.2K installs) |
| seo-optimizer | 📦 davila7/claude-code-templates | SEO optimizer (530 installs) |
| doc-coauthoring | 🅰️ Anthropic Official | A/B test documentation |
| n8n-workflow-automation | 📦 aaaaqwq/claude-code-skills | Growth automation workflows (43 installs) |

---

### G3. SEO Specialist

> Inherits: Level 0

| Skill | Source | Why for SEO |
|-------|--------|------------|
| seo | 📦 addyosmani/web-quality-skills | SEO audit by a Google engineer (4.2K installs) |
| seo-optimizer | 📦 davila7/claude-code-templates | SEO optimizer (530 installs) |
| accessibility | 📦 addyosmani/web-quality-skills | Accessibility compliance impacts SEO (3.9K installs) |
| xlsx | 🅰️ Anthropic Official | Keyword and ranking data analysis |
| doc-coauthoring | 🅰️ Anthropic Official | SEO content optimization |
| last30days | 📦 trailofbits/skills-curated | Competitor keyword and user intent analysis |
| brave-search | 📦 steipete/agent-scripts | Privacy-friendly search alternative for keyword research (685 installs) |

---

### G4. Social Media Manager

> Inherits: Level 0

| Skill | Source | Why for social media |
|-------|--------|--------------------|
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Complete Twitter growth methodology |
| x-research | 📦 rohunvora/x-research-skill | X/Twitter content search and trending topics |
| research-by-reddit | 📦 muzhicaomingwang/ai-ideas | Reddit community browsing and analysis |
| last30days | 📦 trailofbits/skills-curated | Deep-dive Reddit discussion analysis |
| canvas-design | 🅰️ Anthropic Official | Social media visual content design |

---

### G5. Community Manager

> Inherits: Level 0

| Skill | Source | Why for community management |
|-------|--------|------------------------------|
| research-by-reddit | 📦 muzhicaomingwang/ai-ideas | Reddit community browsing |
| last30days | 📦 trailofbits/skills-curated | Community discussion analysis |
| x-research | 📦 rohunvora/x-research-skill | X/Twitter community pulse |
| weekly-report | 📦 claude-office-skills/skills | Community weekly digest |
| community-builder | 📦 ncklrs/startup-os-skills | Community building guide (46 installs) |
| developer-advocacy | 📦 jonathimer/devmarketing-skills | Developer relations guide (15 installs) |

---

## H. Business & Management

### H1. Founder / CEO

> Inherits: Level 0

| Skill | Source | Why for CEOs |
|-------|--------|-------------|
| the-fool | 📦 jeffallan/claude-skills | Adversarial analysis for high-stakes decisions |
| planner | 📦 am-will/codex-skills | Strategic planning and decomposition |
| weekly-report | 📦 claude-office-skills/skills | Team weekly report rollup |
| meeting-minutes | 📦 github/awesome-copilot | Meeting minutes |
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Personal brand and Twitter presence |
| internal-comms | 🅰️ Anthropic Official | Internal communication templates |
| elite-powerpoint-designer | 📦 willem4130/claude-code-skills | Investor/board presentation decks (1.3K installs) |
| news-summary | 📦 sundial-org/awesome-openclaw-skills | Industry trend tracking |
| last30days | 📦 trailofbits/skills-curated | Market intelligence |
| alphaear-stock | 📦 rkiding/awesome-finance-skills | Stock and market data analysis (284 installs) |

---

### H2. Indie Hacker

> Inherits: Level 0 + Level 1 (Engineering Universal) + A3 (Full-Stack Engineer)

**The most versatile role** — you wear the hats of product, engineering, marketing, and operations.

| Skill | Source | Why for indie hackers |
|-------|--------|---------------------|
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Core Twitter growth — the primary acquisition channel for indie hackers |
| research-by-reddit | 📦 muzhicaomingwang/ai-ideas | Reddit promotion and user feedback |
| i18n-localization | 📦 sickn33/antigravity-awesome-skills | Localization for international markets |
| frontend-design | 🅰️ Anthropic Official | Landing pages and product UI |
| seo | 📦 addyosmani/web-quality-skills | Product SEO (4.2K installs) |
| product-manager | 📦 aj-geddes/claude-code-bmad-skills | Be your own PM (115 installs) |
| stripe-payments | 📦 claude-office-skills/skills | Payment integration — essential for indie SaaS (219 installs) |

---

### H3. Consultant

> Inherits: Level 0

| Skill | Source | Why for consultants |
|-------|--------|-------------------|
| the-fool | 📦 jeffallan/claude-skills | Multi-angle analytical frameworks for consulting |
| planner | 📦 am-will/codex-skills | Consulting proposal design |
| docx | 🅰️ Anthropic Official | Consulting reports |
| pptx | 🅰️ Anthropic Official | Consulting presentations |
| xlsx | 🅰️ Anthropic Official | Data analysis |
| elite-powerpoint-designer | 📦 willem4130/claude-code-skills | Premium presentation decks (1.3K installs) |
| last30days | 📦 trailofbits/skills-curated | Industry research |
| email-marketing | 📦 claude-office-skills/skills | Client communication emails (250 installs) |

---

### H4. Sales

> Inherits: Level 0

| Skill | Source | Why for sales |
|-------|--------|-------------|
| pptx | 🅰️ Anthropic Official | Client proposals |
| docx | 🅰️ Anthropic Official | Business documents |
| xlsx | 🅰️ Anthropic Official | Sales data and pipeline analysis |
| internal-comms | 🅰️ Anthropic Official | Internal reporting |
| elite-powerpoint-designer | 📦 willem4130/claude-code-skills | High-quality proposal decks (1.3K installs) |
| email-marketing | 📦 claude-office-skills/skills | Client emails (250 installs) |
| x-research | 📦 rohunvora/x-research-skill | Customer intelligence search |

---

## K. Support Functions

### K1. HR / Recruiter

> Inherits: Level 0

| Skill | Source | Why for HR |
|-------|--------|-----------|
| doc-coauthoring | 🅰️ Anthropic Official | Writing JDs, interview questions, and onboarding guides |
| xlsx | 🅰️ Anthropic Official | Recruiting data analysis and talent funnels |
| pptx | 🅰️ Anthropic Official | Org reporting and recruiting dashboards |
| internal-comms | 🅰️ Anthropic Official | Internal announcements and org change notices |
| meeting-minutes | 📦 github/awesome-copilot | Interview notes and team meeting minutes |
| the-fool | 📦 jeffallan/claude-skills | Multi-angle analysis for organizational decisions |
| x-research | 📦 rohunvora/x-research-skill | Talent market trend research |
| email-marketing | 📦 claude-office-skills/skills | Recruiting emails and candidate outreach (250 installs) |

---

### K2. Legal / Compliance

> Inherits: Level 0

| Skill | Source | Why for legal |
|-------|--------|-------------|
| docx | 🅰️ Anthropic Official | Contracts and legal document drafting |
| pdf | 🅰️ Anthropic Official | Regulatory document extraction and analysis |
| doc-coauthoring | 🅰️ Anthropic Official | Policy document collaboration |
| the-fool | 📦 jeffallan/claude-skills | Multi-angle compliance risk analysis |
| xlsx | 🅰️ Anthropic Official | Compliance audit data organization |
| planner | 📦 am-will/codex-skills | Compliance program design |

---

### K3. Finance / Accounting

> Inherits: Level 0

| Skill | Source | Why for finance |
|-------|--------|---------------|
| xlsx | 🅰️ Anthropic Official | Financial statements, budget management, data analysis |
| pdf | 🅰️ Anthropic Official | Invoice, contract, and PDF processing |
| docx | 🅰️ Anthropic Official | Financial reports |
| pptx | 🅰️ Anthropic Official | Financial review presentations |
| the-fool | 📦 jeffallan/claude-skills | Investment decision analysis |
| planner | 📦 am-will/codex-skills | Budget planning |
| alphaear-stock | 📦 rkiding/awesome-finance-skills | Stock and financial data analysis (284 installs) |

---

### K4. Customer Support

> Inherits: Level 0

| Skill | Source | Why for customer support |
|-------|--------|------------------------|
| doc-coauthoring | 🅰️ Anthropic Official | Writing FAQs and help documentation |
| internal-comms | 🅰️ Anthropic Official | Customer communication templates |
| xlsx | 🅰️ Anthropic Official | Ticket data analysis and satisfaction metrics |
| research-by-reddit | 📦 muzhicaomingwang/ai-ideas | Monitor community user feedback |
| last30days | 📦 trailofbits/skills-curated | User issue trend analysis |

---

## I. Academia & Education

### I1. Researcher

> Inherits: Level 0

| Skill | Source | Why for research |
|-------|--------|----------------|
| podcast-to-content-suite | 📦 onewave-ai/claude-skills | Summarize papers, lectures, and podcasts |
| mentoring-juniors | 📦 github/awesome-copilot | Guided learning for new domains |
| the-fool | 📦 jeffallan/claude-skills | Critical analysis of research methodology |
| doc-coauthoring | 🅰️ Anthropic Official | Paper collaboration |
| xlsx | 🅰️ Anthropic Official | Research data analysis |
| news-summary | 📦 sundial-org/awesome-openclaw-skills | Track field-specific news and publications |
| brave-search | 📦 steipete/agent-scripts | Privacy-friendly academic search (685 installs) |
| notion-mcp | 📦 dokhacgiakhoa/antigravity-ide | Research notes and knowledge base management |
| baoyu-youtube-transcript | 📦 jimliu/baoyu-skills | Download academic lectures and conference videos |

---

### I2. Educator

> Inherits: Level 0

| Skill | Source | Why for education |
|-------|--------|-----------------|
| mentoring-juniors | 📦 github/awesome-copilot | Guided instructional design |
| pptx | 🅰️ Anthropic Official | Teaching slide decks |
| docx | 🅰️ Anthropic Official | Teaching materials and exams |
| podcast-to-content-suite | 📦 onewave-ai/claude-skills | Summarize educational videos |
| doc-coauthoring | 🅰️ Anthropic Official | Curriculum design collaboration |
| elite-powerpoint-designer | 📦 willem4130/claude-code-skills | High-quality teaching decks (1.3K installs) |

---

### I3. Student

> Inherits: Level 0

| Skill | Source | Why for students |
|-------|--------|----------------|
| mentoring-juniors | 📦 github/awesome-copilot | Guided learning for new technologies |
| systematic-debugging | 📦 obra/superpowers | Learning debugging methodology |
| podcast-to-content-suite | 📦 onewave-ai/claude-skills | Course and lecture notes |
| doc-coauthoring | 🅰️ Anthropic Official | Paper and report writing |
| tdd:test-driven-development | 📦 neolabhq/context-engineering-kit | Learn programming through tests |
| baoyu-youtube-transcript | 📦 jimliu/baoyu-skills | Download educational videos and extract subtitles |

---

## J. Hybrid / Freelance

### J1. Freelancer

> Inherits: Level 0 + technical Skills depending on area of expertise

| Skill | Source | Why for freelancers |
|-------|--------|-------------------|
| planner | 📦 am-will/codex-skills | Project scoping and quotes |
| weekly-report | 📦 claude-office-skills/skills | Client weekly updates |
| docx | 🅰️ Anthropic Official | Contracts and proposal documents |
| xlsx | 🅰️ Anthropic Official | Invoicing and financial management |
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Personal brand building |
| internal-comms | 🅰️ Anthropic Official | Client communication templates |
| frontend-design | 🅰️ Anthropic Official | Portfolio and personal website |
| trello | 📦 membranedev/application-skills | Project board management (36 installs) |
| stripe-payments | 📦 claude-office-skills/skills | Payment integration (219 installs) |
| n8n-workflow-automation | 📦 aaaaqwq/claude-code-skills | Automated workflows (43 installs) |

---

### J2. Developer Advocate

> Inherits: Level 0 + A Level 1 (Engineering Universal)

| Skill | Source | Why for developer advocacy |
|-------|--------|--------------------------|
| doc-coauthoring | 🅰️ Anthropic Official | Technical blog posts and tutorials |
| pptx | 🅰️ Anthropic Official | Conference talks |
| podcast-to-content-suite | 📦 onewave-ai/claude-skills | Summarize conference and podcast content |
| baoyu-youtube-transcript | 📦 jimliu/baoyu-skills | Download technical video assets |
| x-twitter-growth | 📦 alirezarezvani/claude-skills | Amplify technical content on social media |
| x-research | 📦 rohunvora/x-research-skill | Track tech community discussions |
| research-by-reddit | 📦 muzhicaomingwang/ai-ideas | Community engagement |
| developer-advocacy | 📦 jonathimer/devmarketing-skills | DevRel work guide (15 installs) |

---

## Appendix: Recommended External Skill Repositories

The following repositories contain large collections of high-quality, role-organized Skills you can pull in as needed:

| Repository | Stars | Skills | Highlights |
|------------|-------|--------|------------|
| alirezarezvani/claude-skills | 6,267 | 205 | **Most comprehensive role coverage**: Engineering (56), Marketing (43), C-Level (28), Product (14), Regulatory Compliance (12), Project Management (6) |
| anthropics/skills | 99,617 | 16 | **Anthropic Official**: Creative, Development, Enterprise, Document |
| VoltAgent/awesome-agent-skills | 12,292 | 500+ | **Official team release**: Includes Anthropic/Vercel/Stripe/Cloudflare and more |
| addyosmani/web-quality-skills | 4,200+ | 2 | **By a Google engineer**: SEO + Accessibility |

**How to install**: `npx skills add <owner/repo@skill-name>`

**Notable highlight**: The `alirezarezvani/claude-skills` repository contains the following subsets that are particularly valuable for specific roles:
- **Marketing roles**: 43 Skills under `marketing-skill/` covering SEO, CRO, Content, Channels, Growth, Intelligence, and Sales — 7 pods
- **C-Level roles**: 28 Skills under `c-level-advisor/` covering CEO/CTO/CFO/CMO/COO/CPO/CRO/CHRO/CISO — 9 C-Suite roles
- **Regulatory compliance**: 12 Skills under `ra-qm-team/` covering GDPR, ISO 13485, FDA, MDR, and more
- **Product roles**: 14 Skills under `product-team/` including competitive teardowns, experiment design, and roadmap communication

---

## Maintenance Notes

### Update Process

1. **Add a new Skill**: Search with `npx skills find` → evaluate quality → add to the relevant role
2. **Deprecate a Skill**: Remove promptly or note a replacement
3. **Add a new role**: Append a new section at the end of the appropriate category, update inheritance relationships
4. **Update external Skills**: Run `npx skills check` periodically to check for updates
