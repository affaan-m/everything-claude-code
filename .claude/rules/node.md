# Node.js Rules for everything-claude-code

> Project-specific rules for the ECC codebase. Extends common rules.

## Stack

- **Runtime**: Node.js >=18 (no transpilation, plain CommonJS)
- **Test runner**: `node tests/run-all.js` — individual files via `node tests/**/*.test.js`
- **Linter**: ESLint (`@eslint/js`, flat config)
- **Coverage**: c8
- **Lint**: markdownlint-cli for `.md` files

## File Conventions

- `scripts/` — Node.js utilities, hooks. CommonJS (`require`/`module.exports`)
- `agents/`, `commands/`, `skills/`, `rules/` — Markdown with YAML frontmatter
- `tests/` — Mirror the `scripts/` structure. Test files named `*.test.js`
- File naming: **lowercase with hyphens** (e.g. `session-start.js`, `post-edit-format.js`)

## Code Style

- CommonJS only — no ESM (`import`/`export`) unless file ends in `.mjs`
- No TypeScript — plain `.js` throughout
- Prefer `const` over `let`; never `var`
- Keep hook scripts under 200 lines — extract helpers to `scripts/lib/`
- All hooks must `exit 0` on non-critical errors (never block tool execution unexpectedly)

## Hook Development

- Hook scripts normally receive JSON on stdin, but hooks routed through `scripts/hooks/run-with-flags.js` can export `run(rawInput)` and let the wrapper handle parsing/gating
- Async hooks: mark `"async": true` in `settings.json` with a timeout ≤30s
- Blocking hooks (PreToolUse, stop): keep fast (<200ms) — no network calls
- Use `run-with-flags.js` wrapper for all hooks so `ECC_HOOK_PROFILE` and `ECC_DISABLED_HOOKS` runtime gating works
- Always exit 0 on parse errors; log to stderr with `[HookName]` prefix

## Testing Requirements

- Run `node tests/run-all.js` before committing
- New scripts in `scripts/lib/` require a matching test in `tests/lib/`
- New hooks require at least one integration test in `tests/hooks/`

## Markdown / Agent Files

- Agents: YAML frontmatter with `name`, `description`, `tools`, `model`
- Skills: sections — When to Use, How It Works, Examples
- Commands: `description:` frontmatter line required
- Run `npx markdownlint-cli '**/*.md' --ignore node_modules` before committing
