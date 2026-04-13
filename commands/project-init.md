---
description: Auto-detect tech stack, install matching ECC skills and rules, and generate CLAUDE.md and settings.local.json for the current project.
---

# Project Init

Scan the current project directory, detect the tech stack from indicator files, and set up ECC skills, rules, and configuration in one shot.

## When to Use

- Starting a new project and want ECC configured automatically
- Onboarding an existing project to Claude Code for the first time
- Want a starter CLAUDE.md with the right build/test/lint commands pre-filled
- Want settings.local.json permissions scoped to your actual tools

## Usage

```
/project-init
/project-init --dry-run
/project-init --skip-claude-md
/project-init --skip-settings
```

## Process

### Step 1: Load Stack Mappings

Read the stack mapping config from the ECC repository:

```
config/project-stack-mappings.json
```

This file maps indicator files (package.json, go.mod, Cargo.toml, etc.) to the skills, rules, commands, and permissions for each stack. It is the single source of truth for all stack-to-skill mappings. If you need to customize mappings, edit this file — not this command.

### Step 2: Scan the Project Directory

For each stack entry in the mappings, check whether any of its indicator files exist in the project root:

1. Check for the presence of each `file` pattern in the project root
2. If the indicator has a `contains` field, read the file and check whether it includes that string (e.g., check if `package.json` contains `"react"`)
3. Collect all matching stack IDs

**Priority**: More specific stacks take precedence. If both `typescript` and `nextjs` match, include both — the command file union is correct. Framework stacks (django, springboot, laravel, nextjs, android) are more specific than language stacks (python, java, php, typescript, kotlin) and should be listed first in the output.

### Step 3: Present Detected Stacks

Display the detection results and ask the user to confirm or adjust:

```
## Detected Tech Stack

Based on your project files, I detected:

| Stack | Indicator Found |
|-------|----------------|
| TypeScript | tsconfig.json |
| Next.js | next.config.js, package.json contains "next" |
| Docker | Dockerfile, docker-compose.yml |

This will install:
- **Rules**: common, typescript, web
- **Skills**: coding-standards, frontend-patterns, backend-patterns, tdd-workflow, verification-loop, docker-patterns, deployment-patterns
- **Commands**: build, test, lint, format, dev

Does this look right? (yes / adjust / add more / remove some)
```

Use `AskUserQuestion` to let the user confirm, add, or remove stacks before proceeding.

If the user says "adjust", show the full list of available stacks from the mappings config and let them pick.

### Step 4: Install Skills and Rules

Follow the same installation process as the `configure-ecc` skill:

1. Clone ECC to `/tmp/everything-claude-code` if not already present
2. Set `ECC_ROOT=/tmp/everything-claude-code`
3. Determine install target — default to project-level (`.claude/`), ask the user if they prefer user-level (`~/.claude/`)

**Install rules** (de-duplicated union of all matched stacks):

```bash
mkdir -p $TARGET/rules
# Always install common rules first
cp -r $ECC_ROOT/rules/common/* $TARGET/rules/
# Then language-specific rules
cp -r $ECC_ROOT/rules/<language>/* $TARGET/rules/
```

**Install skills** (de-duplicated union of all matched stacks):

```bash
mkdir -p $TARGET/skills
cp -r $ECC_ROOT/skills/<skill-name> $TARGET/skills/
```

### Step 5: Generate CLAUDE.md

Unless `--skip-claude-md` was passed, generate a starter `CLAUDE.md` in the project root.

**If CLAUDE.md already exists**, ask the user before overwriting:

```
A CLAUDE.md already exists. What would you like to do?
(a) Append detected commands to the existing file
(b) Replace it with the generated version
(c) Skip CLAUDE.md generation
```

**Template** — assemble from detected stacks. Pick the first available command from each category (the mappings list them in priority order):

```markdown
# CLAUDE.md

## Build

`<detected build command>`

## Test

`<detected test command>`

## Lint

`<detected lint command>`

## Format

`<detected format command>`

## Dev Server

`<detected dev command>`
```

Only include sections where a command was detected. Omit empty sections.

**Detect real commands when possible**: Before falling back to the mappings, check whether the project's package.json (or equivalent) defines actual scripts:

- If `package.json` exists and has `scripts.build`, use `npm run build` (or the appropriate package manager)
- If `package.json` exists and has `scripts.test`, use `npm test`
- If `package.json` exists and has `scripts.lint`, use `npm run lint`
- If `Makefile` exists, check for `build`, `test`, `lint` targets

This ensures the generated CLAUDE.md matches what the project actually uses rather than generic defaults.

### Step 6: Generate settings.local.json

Unless `--skip-settings` was passed, generate `.claude/settings.local.json` with permissions scoped to the detected tools.

**If settings.local.json already exists**, ask before overwriting (same options as CLAUDE.md).

**Template** — merge `permissions.allow` and `permissions.deny` from all matched stacks:

```json
{
  "permissions": {
    "allow": [
      "<merged allow list from all detected stacks>"
    ],
    "deny": [
      "<merged deny list from all detected stacks>"
    ]
  }
}
```

De-duplicate entries. Sort alphabetically within each list.

### Step 7: Clean Up and Report

Remove the cloned ECC repo:

```bash
rm -rf /tmp/everything-claude-code
```

Print a summary:

```
## Project Init Complete

### Detected Stacks
- TypeScript, Next.js, Docker

### Installed
- Rules: common, typescript, web (15 files)
- Skills: 7 skills installed to .claude/skills/

### Generated Files
- CLAUDE.md — build, test, lint, format, dev commands
- .claude/settings.local.json — 12 allow rules, 2 deny rules

### Next Steps
- Review CLAUDE.md and adjust commands if needed
- Review .claude/settings.local.json permissions
- Run the `configure-ecc` skill for additional skill categories (security, research, media, etc.)
- Run `/verify` to confirm everything works
```

## Dry Run Mode

When `--dry-run` is passed, perform Steps 1-3 (scan and detect) but skip all file writes. Show the user exactly what would be installed, generated, and configured — then stop.

## Edge Cases

**No stack detected:**

```
No tech stack indicators found in this directory.
This can happen if you're in an empty project or a non-standard layout.

Would you like to:
(a) Manually select stacks from the full list
(b) Start with just the common rules and core skills
(c) Cancel
```

**Multiple frameworks for the same language (e.g., Django + Flask):**
Install skills for all detected frameworks. The skills are additive and do not conflict.

**Monorepo with multiple stacks:**
All detected stacks are included. The merged configuration covers the full repo. Suggest the user review and trim if some stacks only apply to subdirectories.

**Project uses a package manager other than npm:**
Detect the package manager from lock files (yarn.lock, pnpm-lock.yaml, bun.lockb) and substitute the correct runner in generated commands (yarn, pnpm, bun).

## Related Commands

- `configure-ecc` skill — full interactive ECC installer with category selection
- `/verify` — verify build, tests, lint after setup
- `/skill-create` — generate skills from your git history

## Notes

- All stack-to-skill mappings live in `config/project-stack-mappings.json` — edit that file to add new stacks or change defaults
- This command complements the `configure-ecc` skill — it handles the common case (auto-detect and go) while configure-ecc handles advanced selection
- Skills are installed as full directories, not individual files
- Rules are installed as flat files into the rules directory
