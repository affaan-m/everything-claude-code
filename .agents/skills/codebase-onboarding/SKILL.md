---
name: codebase-onboarding
description: Analyze an unfamiliar codebase and generate a structured onboarding guide with architecture map, key entry points, conventions, and a starter CLAUDE.md. Use when joining a new project or setting up Claude Code for the first time in a repo.
origin: ECC
---

# Codebase Onboarding

Systematically analyze an unfamiliar codebase and produce a structured onboarding guide. Designed for developers joining a new project or setting up Claude Code in an existing repo for the first time.

## When to Activate

- First time opening a project with Claude Code
- Joining a new team or repository
- User asks "help me understand this codebase"
- User asks to generate a CLAUDE.md for a project
- User says "onboard me" or "walk me through this repo"

## Onboarding Workflow

### Phase 1: Reconnaissance

Gather raw signals without reading every file. Run in parallel:

1. **Package manifest detection** — package.json, go.mod, Cargo.toml, pyproject.toml, pom.xml, build.gradle, Gemfile, composer.json
2. **Framework fingerprinting** — next.config.*, nuxt.config.*, angular.json, vite.config.*, django settings, flask app factory
3. **Entry point identification** — main.*, index.*, app.*, server.*, cmd/, src/main/
4. **Directory structure** — top 2 levels, ignoring node_modules, vendor, .git, dist, build
5. **Config and tooling** — .eslintrc*, tsconfig.json, Makefile, Dockerfile, .github/workflows/
6. **Test structure** — tests/, __tests__/, *_test.go, *.spec.ts, *.test.js

### Phase 2: Architecture Mapping

Identify tech stack, architecture pattern, key directories, and trace one request end-to-end.

### Phase 3: Convention Detection

Detect naming conventions, code patterns, error handling style, and git conventions from recent history.

### Phase 4: Generate Artifacts

Produce an **Onboarding Guide** (architecture + entry points + conventions + common tasks) and a **Starter CLAUDE.md** (project-specific instructions for AI assistance).

## Best Practices

- Use Glob and Grep for reconnaissance, not exhaustive file reads
- Trust code over config when signals conflict
- Enhance existing CLAUDE.md rather than replacing it
- Keep the onboarding guide scannable in 2 minutes
- Flag unknowns explicitly rather than guessing
