# Jessie's CLAUDE.md

Personal configuration for dual-mode workflow: programming and writing.

---

## Work Modes

### Programming Mode (default)
Full-stack development with Next.js, TypeScript, Supabase, and Vercel.

### Writing Mode
Multi-platform content creation for WeChat, Zhihu, Xiaohongshu, and Twitter/X.

Switch context with `/context writing` or `/context dev`.

---

## Programming Rules

### Code Organization
- Many small files over few large files
- 200-400 lines typical, 800 max per file
- Organize by feature/domain, not by type
- High cohesion, low coupling

### Code Style
- Immutability always - never mutate objects or arrays
- No console.log in production code
- Input validation with Zod
- Proper error handling with try/catch
- No emojis in code or comments

### Testing
- TDD: Write tests first, always
- 80% minimum coverage
- 100% for auth, payments, and core business logic
- Unit + integration + E2E for critical flows

### Security
- No hardcoded secrets
- Environment variables for sensitive data
- Validate all user inputs
- Parameterized queries only

---

## Writing Rules

### Language
- Chinese by default for WeChat, Zhihu, Xiaohongshu
- English for Twitter/X
- Cross-language adaptation is rewriting, not translation

### Process
- Outline first, wait for confirmation, then write
- Follow platform format specs (see content-creation skill)
- Output content inline unless asked to save to file

### Quality
- One core idea per piece
- Evidence-based claims
- Actionable takeaways for the reader

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| Styling | Tailwind CSS |

### File Structure

```
src/
|-- app/              # Next.js app router
|-- components/       # Reusable UI components
|-- hooks/            # Custom React hooks
|-- lib/              # Utility libraries
|-- types/            # TypeScript definitions
```

---

## Available Commands

### Programming
| Command | Purpose |
|---------|---------|
| `/plan` | Create implementation plan before coding |
| `/tdd` | Test-driven development workflow |
| `/code-review` | Review code for quality and security |
| `/build-fix` | Resolve build errors |
| `/learn` | Extract patterns from session |
| `/evolve` | Improve agent configurations |
| `/verify` | Run verification checks |
| `/checkpoint` | Save progress checkpoint |

### Writing
| Command | Purpose |
|---------|---------|
| `/write` | Start content writing workflow |
| `/adapt` | Adapt content for another platform |

---

## Available Agents

| Agent | Purpose |
|-------|---------|
| planner | Feature implementation planning |
| architect | System design and architecture |
| code-reviewer | Code review for quality and security |
| build-error-resolver | Build error resolution |
| tdd-guide | Test-driven development |
| content-writer | Multi-platform content creation |

---

## Personal Preferences

### Privacy
- Never paste secrets, API keys, tokens, passwords, or JWTs
- Redact logs before sharing
- Review output before sharing externally

### Communication
- Reply in Chinese unless the context is English
- Be concise; skip unnecessary explanations
- When in doubt, ask before acting

### Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Small, focused commits
- Never commit to main directly
- Test locally before committing

---

**Philosophy**: Plan before code, test before implementation, outline before writing. Use the right agent for the job.
