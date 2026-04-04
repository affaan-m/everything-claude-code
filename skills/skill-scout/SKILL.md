---
name: skill-scout
description: "Before creating a new skill, search local marketplaces, GitHub, and the web for existing skills that match the user's intent. Present findings and let the user decide: adopt, fork, or create from scratch. Use when the user says 'create a skill', 'build a skill', 'make a skill', 'new skill', or '/skill-create'."
origin: community
---

# Skill Scout

Search for existing community and marketplace skills before creating a new one. Avoid reinventing the wheel.

## When to Activate

- The user says "create a skill", "build a skill", "make a skill", "new skill", or invokes `/skill-create`
- The user asks "is there a skill for X?" or "does a skill exist that does Y?"
- The user describes a workflow they want to automate and you are about to suggest creating a skill
- The user says "I need a skill that…" or "I want a skill for…"
- The user browses or asks about the skill marketplace or community skills

Run this workflow **before** invoking `/skill-create`. If the user explicitly says "skip search" or "create from scratch", proceed directly to `/skill-create`.

## Execution Model

**Use lightweight models to minimize token cost.** Delegate all search work to `haiku`-model agents running in parallel. Only escalate to the main conversation for the final presentation and user decision.

## Workflow

### Step 1 — Capture Intent

Ask the user (if not already clear):
- What should the skill do?
- When should it trigger?
- What problem does it solve?

Distill the answer into 3-5 **search keywords** plus 2-3 **synonym expansions** (e.g., "write" → "generate", "create", "produce").

### Step 2 — Parallel Search (3 haiku agents)

Launch three agents **in parallel**, all using `model: haiku`:

#### Agent A — Local Marketplace Search

Scan these directories:

| Source | Path |
|--------|------|
| ECC marketplace | `~/.claude/plugins/marketplaces/everything-claude-code/skills/` |
| Official plugins | `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/` |
| Installed skills | `~/.claude/skills/` |

Search method:
1. `ls` each directory, match names against keywords.
2. `grep` SKILL.md frontmatter `description:` lines for keywords.
3. For each match, read the first 10 lines of SKILL.md to extract `name:` and `description:`.

Return: list of `{name, source, description}` for all matches.

#### Agent B — GitHub Search

Search GitHub for community skills not installed locally:

```bash
gh search repos "claude-code skill <keywords>" --limit 10 --sort stars
gh search repos "claude skill SKILL.md <keywords>" --limit 10 --sort stars
gh search code "name: <keyword>" --filename SKILL.md --limit 10
```

For each result, extract: repo name, stars, description, URL.

Deduplicate against Agent A results (skip anything already installed locally).

Return: list of `{name, source: "GitHub", stars, url, description}`.

#### Agent C — Web Search

Use Exa or WebSearch to find skills shared on blogs, forums, community posts:

```
"claude code skill" + <keywords>
"SKILL.md" + <keywords>
"everything-claude-code" + <keywords>
```

For each result, extract: title, URL, brief summary.

Deduplicate against Agent A and B results.

Return: list of `{name, source: "Web", url, summary}`.

### Step 3 — Merge & Rank

Collect results from all three agents. Rank by relevance:

1. **Exact keyword match in name** — highest
2. **Keyword match in description** — high
3. **High GitHub stars** — medium
4. **Web mention** — lower (less verified)

Deduplicate by skill name. Cap at **10 results max**.

### Step 4 — Present Findings

Format results as a ranked table:

```markdown
## Existing Skills Found

| # | Skill Name | Source | Description | Link |
|---|-----------|--------|-------------|------|
| 1 | skill-name | ECC (local) | one-line description | — |
| 2 | skill-name | GitHub | one-line description | url |
| 3 | skill-name | Web | one-line description | url |

### Detailed Look

#### 1. skill-name (Source)
- **Description**: full description
- **Match reason**: why this might fit
- **Gap**: what it does NOT cover vs user's intent
- **Install**: how to get it (if not local)
```

If zero matches found, state clearly: "No existing skills found that match your intent."

### Step 5 — User Decision

Ask the user:

- **Option A**: "Use existing skill `X` as-is" — show how to invoke it (or install it first).
- **Option B**: "Fork/extend skill `X`" — copy it locally and modify.
- **Option C**: "Create from scratch" — hand off to `/skill-create`.

Only proceed to creation after the user explicitly chooses Option C (or no matches were found).

## Anti-Patterns

Avoid these common mistakes:

- **Skipping search entirely** — Never jump to `/skill-create` without searching first. The whole point is to avoid reinventing existing work.
- **Trusting unverified web results** — Web hits (Agent C) are less reliable than local marketplace or GitHub results. Always verify the source before recommending adoption.
- **Searching too broadly** — If keywords are too generic (e.g., "code", "test"), results will be noisy. Narrow with domain-specific terms.
- **Searching too narrowly** — If the first search yields zero results, expand with synonyms and related concepts before concluding nothing exists.
- **Recommending abandoned projects** — Check GitHub activity (last commit date, open issues) before suggesting a repo. A skill with no updates in 2+ years may be unmaintained.
- **Presenting too many results** — Cap at 10. Users get decision fatigue with long lists. Rank and trim.

## Best Practices

- Always expand keywords with synonyms before concluding "nothing exists"
- Prefer local marketplace results over GitHub; prefer GitHub over unverified web hits
- Show the user what each match does AND does NOT cover relative to their intent
- Keep the results table short — 5-7 matches is ideal, 10 is the hard cap
- When forking, copy the skill locally first, then modify — never edit marketplace originals

## Related Skills

- `/skill-create` — Create a new skill from scratch (hand off here after Option C)
- `/search-first` — General "search before building" philosophy; skill-scout is the skill-specific implementation
- `/skill-stocktake` — Audit installed skills for health, duplicates, and gaps; complements skill-scout's discovery focus


## Cost Control

- All search agents use `model: haiku` to keep token cost low.
- Agents return only structured summaries, not full file contents.
- Full SKILL.md content is only read on-demand when the user asks for details on a specific match.
- Cap web search to 3 queries max per run.

## Code Examples

### Agent A — Local Marketplace Grep

```bash
# Search skill names matching keywords
ls ~/.claude/plugins/marketplaces/everything-claude-code/skills/ | grep -iE "blog|article|writing|content"

# Search descriptions in SKILL.md frontmatter
grep -rlE "blog|article|writing" ~/.claude/skills/*/SKILL.md \
  | xargs head -5
```

### Agent B — GitHub Search

```bash
gh search repos "claude-code skill blog writing" --limit 10 --sort stars --json name,description,stargazersCount,url
gh search code "name: blog" --filename SKILL.md --limit 10 --json repository,path
```

### Agent C — Web Search (Exa)

```python
# Exa query for community-shared skills
search("claude code skill blog writing", num_results=5)
search("SKILL.md blog article", num_results=5)
```

### Presenting Results

```markdown
| # | Skill Name      | Source      | Description                          | Link |
|---|----------------|-------------|--------------------------------------|------|
| 1 | article-writing | ECC (local) | Write articles, guides, blog posts   | —    |
| 2 | content-engine  | ECC (local) | Content creation pipeline            | —    |
| 3 | blog-writer     | GitHub      | Blog writing with SEO (42 stars)     | url  |
```

## Example

User says: "I want a skill that helps me write blog posts"

Keywords: `blog`, `post`, `article`, `writing`, `content`
Synonyms: `essay`, `guide`, `draft`, `publish`

**Agent A** finds locally:
- `article-writing` (ECC) — "Write articles, guides, blog posts..."
- `content-engine` (ECC) — "Content creation pipeline for blogs, social posts..."
- `brand-voice` (ECC) — "Build a writing style profile from real posts"

**Agent B** finds on GitHub:
- `awesome-claude-skills/blog-writer` (42 stars) — "Structured blog writing with SEO optimization"

**Agent C** finds on the web:
- Blog post: "My custom Claude skill for technical writing" — url

Present all 5 results to the user before creating anything new.
