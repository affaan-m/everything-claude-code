---
description: Interactively triage Notion root pages into the correct workspace folders using Notion MCP tools. Classifies, renames, moves pages, creates folders, and updates TOCs.
---

# Notion Triage Command

Scan the Notion workspace root for unorganized pages and interactively route them to the correct folders.

## Behavior

When this command is invoked, follow these steps sequentially.

### Step 0: Load config

1. Read `~/.claude/notion-folders.json` for folder IDs, aliases, structural IDs, and exclude list
2. Read `scripts/lib/notion-triage-config.json` from the repo for client keywords and personal content patterns
3. If either file is missing, tell the user what is needed and stop

### Step 1: Scan root pages

1. Use `notion-search` to find pages at the workspace root level
2. Exclude pages whose IDs appear in `config.excludePageIds` (Private, Public, and other structural pages)
3. Include ALL root pages -- not just `@timestamp` titles, any page sitting at root
4. Report: "Found N pages to triage" with a numbered list showing each page title

If no pages found, report that and stop.

### Step 2: Process each page

For each page from Step 1, execute sub-steps 2a through 2g:

#### 2a. Fetch content

Use `notion-fetch` to read the full page content.

#### 2b. Empty page check

If the page has no content or only whitespace:
- Move to the Archive folder using `notion-move-pages` (use `config.structural.archive` as destination)
- Report: "Archived empty page: [title]"
- Continue to next page

#### 2c. Personal content check

Scan content against patterns from `config.personalContentPatterns` in the triage config:
- `golf`, `pinehurst`, `pine needles`, `bay harbor`, `car insurance`, `deductible`, `gas money`, `fantasy football`, `march madness`, `vacation`, `airbnb`

If the page contains ONLY personal content:
- Move to Archive
- Report: "Archived personal page: [title]"

If the page has MIXED personal and work content:
- Flag to user: "This page has personal content mixed with work content. Sections about [topics] appear personal. Strip personal sections? (y/n)"
- If yes, remove personal sections via `notion-update-page` with `replace_content`, then continue classification
- If no, continue classification with full content

#### 2d. Classify

Determine the category from content signals:

| Category | Signals | Destination |
|----------|---------|-------------|
| Client meeting/conversation | Client keywords from triage config, participant names, action items, "we discussed" | Client > Implementation > Meeting Notes |
| Developer notes | Code snippets, error messages, SuiteScript references, troubleshooting | Private > Developer Notes (`config.structural.developer_notes`) |
| Domain knowledge | ERP concepts, business processes, not tied to a specific client | Private > Areas (`config.structural.areas`) |
| Reference material | Link collections, docs, tutorials, tool configs | Private > Resources (`config.structural.resources`) |

For client content, match against keywords in the triage config:
1. Check top-level client keywords first
2. Then check implementation-specific keywords to pick the right sub-folder
3. If confident from context but no exact keyword match, note your reasoning
4. If multiple clients match or ambiguous, ask the user

#### 2e. Rewrite title

Format based on category:
- Client: `"ClientName: Brief Description"` (e.g., "Par Excellence: GPO Discount Rounding Fix")
- Developer: `"[Dev] Description"` (e.g., "[Dev] SuiteScript Search Pagination Bug")
- Domain: `"[Area] Topic"` (e.g., "[Area] NetSuite Revenue Recognition Flow")
- Reference: `"[Ref] Topic"` (e.g., "[Ref] SuiteScript 2.1 API Quick Reference")

Strip any `@` timestamp prefixes, day names, or time zones from the original title.

#### 2f. Confirm with user

Show a summary for each page:

```
Page: "@Last Thursday 12:30 PM"
-> Category: Client Meeting
-> Client: Par Excellence > NetSuite CPQ
-> New Title: "Par Excellence: GPO Discount Rounding Fix"
-> Destination: Meeting Notes
Proceed? (y/n/skip/edit)
```

Options:
- `y` -- execute the move and rename
- `n` -- skip this page entirely
- `skip` -- same as n
- `edit` -- let user modify category, title, or destination before executing

After the first confirmation, offer "yes to all" (`ya`) to auto-approve remaining pages.

#### 2g. Execute

1. Use `notion-update-page` to rename the page with the new title
2. Use `notion-move-pages` to move the page to the destination folder
3. Report: "Moved: [new title] -> [destination path]"

### Step 3: New client/implementation discovery

If a page references a client or implementation not in the config:

#### New implementation for existing client

1. Ask user to confirm the implementation name
2. Use `notion-create-pages` to create the implementation folder under the client
3. Use `notion-create-pages` to create a "Meeting Notes" sub-folder under the implementation
4. Move the triaged page into the new Meeting Notes folder
5. Update `~/.claude/notion-folders.json`:
   - Add new alias entry with folder IDs
6. Update `scripts/lib/notion-triage-config.json`:
   - Add implementation under the client with keywords and meetingNotesId

#### New client entirely

1. Ask: "Is this a @drixxodev client (your direct) or @terillium client (employer engagement)?"
2. Create client folder:
   - @drixxodev: under `config.structural.drixxodev_clients`
   - @terillium: under `config.structural.terillium_clients`
3. Create implementation folder + "Meeting Notes" sub-folder
4. If @drixxodev ONLY: create a Public folder for the client under `config.structural.public`
5. @terillium clients: NO public folder
6. Update `~/.claude/notion-folders.json` with new alias and folder IDs
7. Update `scripts/lib/notion-triage-config.json` with new client, keywords, and implementation

### Step 4: TOC updates

After all pages are processed, for each folder that received a new page:

1. **Check for existing TOC**: Fetch folder children via `notion-fetch`, look for a page titled `"TOC: [Folder Name]"`
2. **If TOC exists**: Regenerate it using `notion-update-page` with `replace_content` set to the updated table
3. **If no TOC**: Create one using `notion-create-pages`

TOC format:

```markdown
# [Folder Name] - Table of Contents

*Last updated: YYYY-MM-DD*

| # | Page | Summary | Created |
|---|------|---------|---------|
| 1 | Page Title | One-line AI-generated summary | YYYY-MM-DD |
| 2 | Page Title | One-line AI-generated summary | YYYY-MM-DD |

*[N] pages in this folder.*
```

- Title the TOC page: `"TOC: [Folder Name]"`
- Generate one-line summaries by reading each page's content
- Sort by creation date (newest first)

### Step 5: Summary report

After all processing is complete, output:

```
Triage complete:
- N pages processed
- N moved to client folders
- N moved to Developer Notes
- N moved to Areas
- N moved to Resources
- N archived (empty/personal)
- N TOC pages created/updated
- N new folders created
```

## Error Handling

- **Missing config**: Tell the user which file is missing and what it needs to contain
- **Missing Notion MCP**: Tell the user the Notion MCP integration must be connected
- **Page move fails**: Report the error, skip the page, continue with remaining pages
- **Ambiguous classification**: Always ask the user rather than guessing wrong
- **API errors**: Show the error details and continue processing remaining pages

## Config File Locations

- **Folder IDs and aliases**: `~/.claude/notion-folders.json` (user-local, never in git)
- **Client keywords and patterns**: `scripts/lib/notion-triage-config.json` (in repo)
