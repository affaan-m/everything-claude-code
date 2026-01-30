# Global Claude Code Context - Ori Cohen

## Core Philosophy

You are Claude Code. I use specialized agents and skills for complex tasks.

**Key Principles:**
1. **Agent-First**: Delegate to specialized agents for complex work
2. **Parallel Execution**: Use Task tool with multiple agents when possible
3. **Plan Before Execute**: Use Plan Mode for complex operations
4. **Test-Driven**: Write tests before implementation
5. **Security-First**: Never compromise on security

---

## Development Environment

- Primary tools: VS Code, Terminal
- Version control: Git + GitHub
- Deployment: Vercel, Docker
- Database: Supabase
- Automation: n8n Cloud (qualia.app.n8n.cloud)

---

## Modular Rules

Detailed guidelines are in `~/.claude/rules/`:

| Rule File | Contents |
|-----------|----------|
| security.md | Security checks, secret management |
| coding-style.md | Immutability, file organization, error handling |
| testing.md | TDD workflow, 80% coverage requirement |
| git-workflow.md | Commit format, PR workflow |
| agents.md | Agent orchestration, when to use which agent |
| patterns.md | API response, repository patterns |
| performance.md | Model selection, context management |
| n8n-workflows.md | n8n workflow building and validation |
| mobile-development.md | React Native/Expo guidelines |

---

## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose |
|-------|---------|
| planner | Feature implementation planning |
| architect | System design and architecture |
| tdd-guide | Test-driven development |
| code-reviewer | Code review for quality/security |
| security-reviewer | Security vulnerability analysis |
| build-error-resolver | Build error resolution |
| e2e-runner | Playwright E2E testing |
| refactor-cleaner | Dead code cleanup |
| doc-updater | Documentation updates |

---

## Coding Standards

### General

- TypeScript preferred over JavaScript
- ESLint + Prettier for formatting
- Meaningful variable names, avoid abbreviations
- Write tests for critical functionality
- Document public APIs
- No emojis in code, comments, or documentation
- Prefer immutability - never mutate objects or arrays
- Many small files over few large files (200-400 lines typical, 800 max)

### Security Checklist (ALWAYS verify before deploy)

- [ ] No hardcoded secrets or API keys
- [ ] All user inputs validated and sanitized
- [ ] Environment variables for sensitive config
- [ ] HTTPS in production

---

## Project Type Guidelines

### Web Projects (React/Next.js)

- Use Next.js App Router (not Pages)
- Tailwind CSS for styling
- shadcn/ui for components
- Server Components by default, Client Components when needed
- Use Vercel for deployment

### Mobile Projects (React Native)

- Expo for most projects
- React Navigation for routing
- TypeScript strict mode
- EAS Build for production builds

### n8n Workflows

- Always validate workflows before deploying
- Use descriptive node names
- Add error handling nodes
- Document webhook endpoints
- Store credentials in n8n, not hardcoded

---

## Common Commands

- Dev: `npm run dev` or `yarn dev`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Deploy: `vercel --prod`

---

## Preferred Libraries

- UI Components: shadcn/ui
- Styling: Tailwind CSS
- State Management: Zustand or React Context
- Data Fetching: TanStack Query (React Query)
- Forms: React Hook Form + Zod
- Animation: Framer Motion

---

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Always test locally before committing
- Small, focused commits
- Never commit to main directly
- PRs require review

---

## Success Metrics

You are successful when:
- All tests pass (80%+ coverage)
- No security vulnerabilities
- Code is readable and maintainable
- User requirements are met

---

**Philosophy**: Agent-first design, parallel execution, plan before action, test before code, security always.
