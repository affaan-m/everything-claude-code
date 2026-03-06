Review all pending intel proposals from bookmarked articles.

## Path Safety — MANDATORY

NEVER write to paths outside `~/.claude/`. These are the ONLY allowed target directories:
- `~/.claude/homunculus/instincts/personal/` — for new_instinct proposals
- `~/.claude/skills/` — for skill_update proposals
- `~/.claude/rules/` — for new_rule proposals
- `~/.claude/commands/` — for new_command proposals
- `~/.claude/hooks/` — for new_hook proposals
- `~/.claude/agents/` — for agent-related proposals
- `~/.claude/CLAUDE.md` — for claude_md_change proposals

If ANY proposal has a target outside these directories, **DISMISS it automatically** and warn the user it was rejected for targeting a disallowed path.

For `new_hook` proposals (executable shell scripts), display a prominent warning: "⚠ This proposal writes an executable hook script. Review the content carefully before applying."

## Review Process

1. Read all JSON files in `~/.claude/intel-proposals/pending/`
2. For each proposal file, present:
   - **Source**: article title and URL from `metadata.sourceTitle` and `metadata.sourceUrl`
   - **Summary**: the `proposals[].summary` field
   - **Type**: the `proposals[].type` field (e.g., new_instinct, skill_update, claude_md_change)
   - **Target**: the `proposals[].target` file path
   - **Content**: the full `proposals[].content` that would be written
   - **Rationale**: the `proposals[].rationale` explaining why this change helps
3. After presenting each proposal, ask the user: **Apply / Dismiss / Skip**
4. **Apply**: Write the content to the target path. If the target file exists, show a diff preview first. Move the proposal JSON to `~/.claude/intel-proposals/applied/` with a timestamp prefix.
5. **Dismiss**: Move the proposal JSON to `~/.claude/intel-proposals/dismissed/` with a timestamp prefix.
6. **Skip**: Leave it in `pending/` for next review.
7. After all proposals are reviewed, report summary: N applied, N dismissed, N skipped.

When applying proposals of type `new_instinct`:
- Write to `~/.claude/homunculus/instincts/personal/{id}.md` using the content field
- The content field should contain the full instinct file including YAML frontmatter

When applying proposals of type `claude_md_change`:
- Show the current relevant section of the target file and the proposed addition
- Apply as an append or edit as appropriate

For all other types, write the content to the specified target path.
