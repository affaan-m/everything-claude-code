---
name: notion-triage
description: Reference knowledge for Notion workspace triage — workspace structure, client routing rules, TOC format, folder conventions, and MCP tool mapping. Use when triaging root pages, creating client folders, or managing the workspace hierarchy.
origin: custom
---

# Notion Triage Skill

Reference knowledge for triaging pages from the Notion workspace root into the correct folder hierarchy. This skill is consumed by the `/notion-triage` command and provides the domain knowledge Claude needs to classify, rename, and route pages.

## When to Activate

- Triaging unorganized pages from the Notion workspace root
- Creating new client or implementation folders
- Updating Table of Contents pages
- Classifying page content (client meeting, dev notes, domain knowledge, reference)
- Managing public vs private folder visibility

## Workspace Structure

```
Root
+-- Private
|   +-- Clients
|   |   +-- @drixxodev (direct clients -- get Public folders)
|   |   |   +-- Par Excellence
|   |   |   |   +-- NetSuite CPQ
|   |   |   |   |   +-- Meeting Notes
|   |   |   |   |   +-- Technical Design Docs
|   |   |   |   |   +-- Development Notes
|   |   |   |   |   +-- Testing & QA
|   |   |   |   +-- Allocation
|   |   |   +-- Ben Guard
|   |   |       +-- NetSuite Alignment
|   |   |           +-- Meeting Notes
|   |   +-- @terillium (employer clients -- NO public folders)
|   |       +-- McAllisters
|   |       |   +-- WordPress Web Forms
|   |       |   +-- ZoomInfo Integration
|   |       |   +-- Finance Phase 2
|   |       |   +-- AS400/FreightPop
|   |       |   +-- File Archive Migration
|   |       +-- Dansons
|   |       |   +-- Inbound Shipment
|   |       +-- First Light
|   |       |   +-- Docket Integration
|   |       +-- Jockey Club
|   |       |   +-- NetSuite Go-Live
|   |       +-- ACS
|   |       |   +-- State Contracting
|   |       +-- Delaney Hillman
|   |       |   +-- NetSuite Migration
|   |       +-- Terillium Internal
|   |           +-- General
|   +-- Developer Notes
|   +-- Areas (domain knowledge, ERP concepts)
|   +-- Resources (links, tutorials, tool configs)
|   +-- Templates
|   +-- Archive (empty/obsolete pages)
+-- Public (@drixxodev clients ONLY)
    +-- Par Excellence/
    +-- Ben Guard/
```

## Client Routing Rules

### @drixxodev Clients (Direct)

These are Robert's direct consulting clients. They get Public folders for client-facing shared content.

| Client | Implementations | Public Folder |
|--------|----------------|---------------|
| Par Excellence | NetSuite CPQ, Allocation | Yes |
| Ben Guard | NetSuite Alignment | Yes |

### @terillium Clients (Employer)

These are Terillium's client engagements. NO public folders -- all content stays in Private.

| Client | Implementations |
|--------|----------------|
| McAllisters | WordPress Web Forms, ZoomInfo Integration, Finance Phase 2, AS400/FreightPop, File Archive Migration |
| Dansons | Inbound Shipment |
| First Light | Docket Integration |
| Jockey Club | NetSuite Go-Live |
| ACS | State Contracting |
| Delaney Hillman | NetSuite Migration |
| Terillium Internal | General |

### Client Keyword Matching

Keywords are defined in `scripts/lib/notion-triage-config.json`. Each client has top-level keywords plus implementation-specific keywords:

| Client | Top-Level Keywords |
|--------|-------------------|
| Par Excellence | PAR, CPQ, Par Excellence, configurator, proposal, Part 360, GPO, bundle |
| Ben Guard | Ben Guard, Ship Central, Airtable, order-to-cash |
| McAllisters | McAllisters, McAllister |
| Dansons | Dansons, Danson |
| First Light | First Light, Docket |
| Jockey Club | Jockey Club, JC, TJC, Aquabase, Axis, T-Lor, PAYGO, CLEGO |
| ACS | ACS, state contracting |
| Delaney Hillman | Delaney, Hillman |
| Terillium Internal | Terillium, sprint, PEM deal, time script, service item |

When multiple clients match, prefer the implementation-specific keyword match. If ambiguous, ask the user.

## Content Classification

### Category Signals

| Category | Signals | Destination |
|----------|---------|-------------|
| Client meeting | Client keywords, participant names, action items, "we discussed", "follow up", agenda items | Client > Implementation > Meeting Notes |
| Developer notes | Code snippets, error messages, SuiteScript, troubleshooting, stack traces, field IDs | Private > Developer Notes |
| Domain knowledge | ERP concepts, business processes, accounting terms, not client-specific | Private > Areas |
| Reference material | Link collections, documentation, tutorials, tool configurations, bookmarks | Private > Resources |

### Personal Content Patterns

Pages containing ONLY these topics should be archived. Pages with mixed personal/work content should be flagged for user review.

Patterns: `golf`, `pinehurst`, `pine needles`, `bay harbor`, `car insurance`, `deductible`, `gas money`, `fantasy football`, `march madness`, `vacation`, `airbnb`

## Title Conventions

### Format by Category

| Category | Format | Example |
|----------|--------|---------|
| Client meeting | `"ClientName: Brief Description"` | "Par Excellence: GPO Discount Rounding Fix" |
| Developer notes | `"[Dev] Description"` | "[Dev] SuiteScript Search Pagination Bug" |
| Domain knowledge | `"[Area] Topic"` | "[Area] NetSuite Revenue Recognition Flow" |
| Reference material | `"[Ref] Topic"` | "[Ref] SuiteScript 2.1 API Quick Reference" |

### Title Cleanup Rules

- Strip `@` timestamp prefixes (e.g., "@Last Thursday 12:30 PM")
- Remove day names and time zones
- Capitalize properly
- Keep titles concise (under 80 characters)

## TOC Format

Table of Contents pages live inside their parent folder and follow this template:

```markdown
# [Folder Name] - Table of Contents

*Last updated: YYYY-MM-DD*

| # | Page | Summary | Created |
|---|------|---------|---------|
| 1 | Page Title | One-line AI-generated summary | YYYY-MM-DD |
| 2 | Page Title | One-line AI-generated summary | YYYY-MM-DD |

*[N] pages in this folder.*
```

- TOC title format: `"TOC: [Folder Name]"` -- keeps it visually prominent at top of folder
- Summaries are one-line, AI-generated from page content
- Sorted by creation date (newest first)
- Page count footer

## New Folder Conventions

### Naming

- Client folder: plain name (e.g., "Acme Corp")
- Implementation folder: descriptive project name (e.g., "NetSuite CPQ", "Warehouse Integration")
- Standard sub-folders: `Meeting Notes` (always created), plus `Tech Docs`, `Dev Notes`, `Testing` as needed

### Config Alias Format

- Lowercase, hyphenated (e.g., `acme-warehouse`)
- Short but unambiguous
- Consistent with existing aliases in `~/.claude/notion-folders.json`

### New Client Checklist

1. Determine ownership: @drixxodev (direct) or @terillium (employer)
2. Create client folder under correct parent
3. Create first implementation folder + Meeting Notes sub-folder
4. If @drixxodev: create Public folder for client
5. If @terillium: NO public folder
6. Update `~/.claude/notion-folders.json` with alias and folder IDs
7. Update `scripts/lib/notion-triage-config.json` with client keywords

## MCP Tool Reference

| Operation | Tool | Notes |
|-----------|------|-------|
| Search pages | `notion-search` | Find pages by title or content |
| Read page content | `notion-fetch` | Get full page content for classification |
| Create page or folder | `notion-create-pages` | New pages, folders, TOC pages |
| Move page to folder | `notion-move-pages` | Reparent pages after classification |
| Rename or update content | `notion-update-page` | Title rewrites, TOC regeneration (use `replace_content` for full replacement) |

## Config Files

### `~/.claude/notion-folders.json` (user-local, not in git)

Contains folder IDs, aliases, structural page IDs, and exclude lists. This file is business-sensitive and never committed to the repository.

### `scripts/lib/notion-triage-config.json` (in repo)

Contains client keywords, implementation keywords, personal content patterns, and the fallback folder ID. Used by both the automated GitHub Actions script and this interactive triage command.
