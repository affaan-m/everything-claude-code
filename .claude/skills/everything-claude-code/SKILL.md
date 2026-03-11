# Everything Claude Code

Use this skill when working inside the `everything-claude-code` repository and you need repo-specific guidance instead of generic coding advice.

Optional companion instincts live at `.claude/homunculus/instincts/inherited/everything-claude-code-instincts.yaml` for teams using `continuous-learning-v2`.

## When to Use

Activate this skill when the task touches one or more of these areas:
- cross-platform parity across Claude Code, Cursor, Codex, and OpenCode
- hook scripts, hook docs, or hook tests
- skills, commands, agents, or rules that must stay synchronized across surfaces
- release work such as version bumps, changelog updates, or plugin metadata updates
- continuous-learning or instinct workflows inside this repository

## How It Works

### 1. Follow the repo's development contract

- Use conventional commits such as `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
- Keep commit subjects concise and close to the repo norm of about 70 characters.
- Prefer camelCase for JavaScript and TypeScript module filenames.
- Use kebab-case for skill directories and command filenames.
- Keep test files on the existing `*.test.js` pattern.

### 2. Treat the root repo as the source of truth

Start from the root implementation, then mirror changes where they are intentionally shipped.

Typical mirror targets:
- `.cursor/`
- `.codex/`
- `.opencode/`
- `.agents/`

Do not assume every `.claude/` artifact needs a cross-platform copy. Only mirror files that are part of the shipped multi-platform surface.

### 3. Update hooks with tests and docs together

When changing hook behavior:
1. update `hooks/hooks.json` or the relevant script in `scripts/hooks/`
2. update matching tests in `tests/hooks/` or `tests/integration/`
3. update `hooks/README.md` if behavior or configuration changed
4. verify parity for `.cursor/hooks/` and `.opencode/plugins/` when applicable

### 4. Keep release metadata in sync

When preparing a release, verify the same version is reflected anywhere it is surfaced:
- `package.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.opencode/package.json`
- release notes or changelog entries when the release process expects them

### 5. Be explicit about continuous-learning changes

If the task touches `skills/continuous-learning-v2/` or imported instincts:
- prefer accurate, low-noise instincts over auto-generated bulk output
- keep instinct files importable by `instinct-cli.py`
- remove duplicated or contradictory instincts instead of layering more guidance on top

## Examples

### Naming examples

```text
skills/continuous-learning-v2/SKILL.md
commands/update-docs.md
scripts/hooks/session-start.js
tests/hooks/hooks.test.js
```

### Commit examples

```text
fix: harden session summary extraction on Stop hook
docs: align Codex config examples with current schema
test: cover Windows formatter fallback behavior
```

### Skill update checklist

```text
1. Update the root skill or command.
2. Mirror it only where that surface is shipped.
3. Run targeted tests first, then the broader suite if behavior changed.
4. Review docs and release notes for user-visible changes.
```

### Release checklist

```text
1. Bump package and plugin versions.
2. Run npm test.
3. Verify platform-specific manifests.
4. Publish the release notes with a human-readable summary.
```
