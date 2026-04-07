---
description: Add a note to a client's Notion folder. Quick-capture from Claude Code into the right client/implementation/category.
---

# Client Note Command

Capture notes directly into the correct Notion client folder without leaving Claude Code.

## Usage

```
/client-note <alias> [category]: <note content>
```

Pattern: `/client-note <alias> [category]: <note text>`

- `alias` - short client/implementation identifier (see table below)
- `category` - optional folder category (defaults to `dev`)
- Everything after the colon is the note content

### Examples

```
/client-note par: Fixed GPO discount rounding on add-on line items
/client-note par tech: Architecture doc for discount approval workflow
/client-note mcal-wp: Form timeout caused by redirect loop
/client-note dan: Container grouping needs material number check
/client-note jc meeting: Go-live cutover checklist reviewed with team
```

### Aliases

| Alias | Client | Implementation |
|-------|--------|----------------|
| `par` | Par Excellence | NetSuite CPQ |
| `bg` | Ben Guard | NetSuite Alignment |
| `mcal-wp` | McAllisters | WordPress Web Forms |
| `mcal-zoom` | McAllisters | ZoomInfo Integration |
| `mcal-fin` | McAllisters | Finance Phase 2 |
| `mcal-as400` | McAllisters | AS400/FreightPop |
| `mcal-file` | McAllisters | File Archive Migration |
| `dan` | Dansons | Inbound Shipment |
| `fl` | First Light | Docket Integration |
| `jc` | Jockey Club | NetSuite Go-Live |
| `acs` | ACS | State Contracting |
| `dh` | Delaney Hillman | NetSuite Migration |
| `ter` | Terillium Internal | General |

### Categories

| Category | Folder | When to Use |
|----------|--------|-------------|
| `dev` (default) | Development Notes | Code notes, bug findings, implementation details |
| `tech` | Technical Design Docs | Architecture, system design, data flow docs |
| `qa` / `testing` | Testing & QA | Test results, UAT findings, bug reports |
| `meeting` | Meeting Notes | Quick meeting summaries |

## Behavior

When this command is invoked:

### 1. Parse input

Split the argument on the first `:` character.

- Left side: space-separated tokens. First token is the alias. If a second token exists and matches a category name (`dev`, `tech`, `qa`, `testing`, `meeting`), use it as the category. Otherwise default to `dev`.
- Right side (after `:`): the note content (trimmed).

### 2. Load config

Read the folder config from `~/.claude/notion-folders.json`. This file maps aliases to Notion folder page IDs. It is **never committed to git** -- it contains business-sensitive workspace structure.

The config structure:

```json
{
  "aliases": {
    "<alias>": {
      "client": "Client Name",
      "impl": "Implementation Name",
      "folders": {
        "meeting": "notion-page-id",
        "tech": "notion-page-id",
        "dev": "notion-page-id",
        "qa": "notion-page-id"
      }
    }
  },
  "defaultCategory": "dev"
}
```

### 3. Resolve destination

1. Look up `alias` in `config.aliases`
2. If not found, list all available aliases and ask the user to pick one
3. Map the category to a folder key:
   - `dev` / `development` -> `dev`
   - `tech` / `technical` -> `tech`
   - `qa` / `testing` -> `qa`
   - `meeting` -> `meeting`
4. Look up the folder ID in `aliases[alias].folders[category]`
5. If that category folder does not exist for this alias, fall back to `meeting` folder (every alias has at least a meeting folder)

### 4. Create Notion page

Use the `notion-create-pages` MCP tool to create a page with:

- **Parent page ID**: the resolved folder ID
- **Title**: `[Category] Note content summary - YYYY-MM-DD` (truncate summary to ~60 chars)
- **Content** (as Notion blocks):

```markdown
## Context
- **Client:** [Client Name]
- **Implementation:** [Implementation Name]
- **Category:** [Category Name]
- **Date:** [YYYY-MM-DD]

## Note
[User's note content here]
```

### 5. Confirm

Output a confirmation message with the client, implementation, category, and a note that the page was created.

### 6. Auto-append mode

If the user runs `/client-note` multiple times for the same alias in the same session, offer to **append** to the existing note instead of creating a new page. Track the last created page ID to enable this.

## Error Handling

- **Missing config file**: Tell the user to create `~/.claude/notion-folders.json` with the required structure. Point them to `scripts/lib/notion-triage-config.example.json` in the repo for reference.
- **Unknown alias**: List all available aliases from the config.
- **Missing Notion MCP**: Tell the user the Notion MCP integration must be connected.
- **API error**: Show the error and suggest checking the folder ID in the config.
