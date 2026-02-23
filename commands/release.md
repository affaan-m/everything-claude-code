# Release Command

Automate version bumping, changelog generation, and release creation.

## Instructions

Execute release steps in this order:

1. **Detect Current Version**
   - Check `package.json`, `Cargo.toml`, `pyproject.toml`, or latest git tag
   - Report: `Current version: X.Y.Z`

2. **Analyze Changes Since Last Release**
   - Run `git log $(git describe --tags --abbrev=0 2>/dev/null || echo "")..HEAD --oneline`
   - Categorize commits using conventional commit prefixes:
     - `feat:` → Features
     - `fix:` → Bug Fixes
     - `perf:` → Performance
     - `BREAKING CHANGE` or `!:` → Breaking Changes
   - Report summary of changes

3. **Determine Version Bump**
   - If `$ARGUMENTS` contains `major`, `minor`, or `patch` → use that
   - Otherwise auto-detect:
     - Breaking changes → major
     - Features → minor
     - Fixes only → patch
   - Report: `Bumping: X.Y.Z → A.B.C`

4. **Generate Changelog Entry**
   - Format as markdown under `## [A.B.C] - YYYY-MM-DD`
   - Group by: Breaking Changes, Features, Bug Fixes, Other
   - Prepend to `CHANGELOG.md` (create if missing)

5. **Update Version**
   - Update version in detected config file(s)
   - If `package.json`: also run `npm install` to update lockfile
   - If `Cargo.toml`: run `cargo check` to update lockfile

6. **Create Release Commit & Tag**
   - Stage changed files
   - Commit: `chore(release): vA.B.C`
   - Tag: `vA.B.C`
   - Do NOT push unless `--publish` flag is present

7. **Publish (if --publish)**
   - Push commit and tag to remote
   - Create GitHub release via `gh release create vA.B.C --notes-file <changelog_section>`
   - Report release URL

## Arguments

$ARGUMENTS can be:
- `major` - Force major version bump
- `minor` - Force minor version bump
- `patch` - Force patch version bump
- `--dry-run` - Show what would happen without making changes
- `--publish` - Push and create GitHub release after tagging
- `--pre <label>` - Create pre-release (e.g., `--pre beta` → `1.2.0-beta.1`)

## Output

```
RELEASE: [SUCCESS/DRY-RUN]

Previous:  X.Y.Z
New:       A.B.C
Changes:   N features, M fixes, K breaking
Changelog: Updated
Tag:       vA.B.C
Published: [YES/NO/DRY-RUN]
```
