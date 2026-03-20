---
name: brd-to-implementation-spec
description: "Convert a BRD/PRD into a complete, Claude Code-ready technical specification for Frappe v16 + Flutter projects — DocType schemas, workflows, API endpoints, SDK patterns, and phased build order with tooling config"
origin: ECC
---

# BRD → Claude Code Spec Skill

Convert any BRD into a complete technical specification that Claude Code can execute
without additional context. Produces Frappe v16 DocType schemas, workflow definitions,
API endpoints, SDK integration patterns, and a phased build order with tooling config.

**Output:** Single Markdown file — the spec IS the handoff document. No slide decks,
no separate architecture docs, no "we'll figure it out later" sections.

---

## When to Use

- User provides a BRD/PRD document (any format: .docx, .pdf, .md, pasted text)
- User wants a Frappe Framework v16 technical specification
- User wants a Flutter mobile app spec using Dhwani's `frappe_mobile_sdk`
- User says "make this Claude Code ready" or "spec this for implementation"
- User wants to go from business requirements → code without a human architect

## Prerequisites

Before generating the spec, check what's available:

| Input | Required? | How to get it |
|---|---|---|
| BRD/PRD document | **Yes** | User provides — this is the source of truth |
| Figma designs | Optional | If provided, cross-reference against BRD for gaps |
| SDK repo (`frappe_mobile_sdk`) | Optional | If building mobile app, clone and read for exact API contracts |
| Controller repo (`frappe_mobile_control`) | Optional | If mobile auth needed, read for server endpoint shapes |
| SMS/OTP provider repo | Optional | If OTP auth needed, read for integration functions |
| Existing Frappe app code | Optional | If extending an existing app, read for conventions |

---

## The Process (6 Phases)

### Phase 1: Read and Internalize the BRD

Read the entire BRD. Do not skim. Extract these artifacts into working notes:

1. **User types / personas** — who uses the system (e.g., Donor, Beneficiary, Admin)
2. **Registration flows** — what data is captured at sign-up, per user type
3. **Core transactional entities** — what gets created/submitted/approved (donations, allocations, etc.)
4. **Workflow states** — every status transition mentioned (Draft → Pending → Approved → etc.)
5. **Field-level requirements** — every field mentioned with data type, validation, conditionality
6. **Integration points** — payment gateways, SMS, email, file storage, PDF generation
7. **Role-based access** — who can do what (CRUD matrix)
8. **Non-functional requirements** — performance, security, offline, deployment
9. **Screen inventory** — every screen/page mentioned
10. **Open questions / contradictions** — flag anything ambiguous or self-contradictory

**Critical rule:** If the BRD contradicts itself (and they often do), resolve the contradiction
by using the most recent discussion note, or flag it explicitly in the spec's Open Questions section.
Never silently pick one interpretation without documenting it.

### Phase 2: Identify the Data Model

From the extracted artifacts, derive every DocType needed:

- **Master DocTypes** — entities that persist (User, Organization, Product Category)
- **Transactional DocTypes** — things that happen (Donation, Allocation, Payment)
- **Child Tables** — repeatable rows inside a parent (line items, uploaded documents)
- **Single DocTypes** — global settings
- **Lookup/Reference DocTypes** — dropdowns with managed options

For each DocType, determine:
- Is it submittable? (has a formal lifecycle with Draft → Submitted → Cancelled)
- Does it need a workflow? (multi-step approval beyond simple submit)
- What are its relationships? (Link fields, child tables, fetch_from)

### Phase 3: Read SDK/Controller Repos (If Mobile App)

If the project includes a mobile app with `frappe_mobile_sdk`:

1. **Clone and read the SDK repo** — identify:
   - Authentication methods supported (`AuthService.login`, `sendLoginOtp`, `verifyLoginOtp`, `loginWithOAuth`, `loginWithApiKey`)
   - Form rendering capabilities (`FormScreen` — what fieldtypes it handles)
   - Offline architecture (`OfflineRepository`, `SyncService`)
   - Workflow support (`WorkflowService.getTransitions`, `applyWorkflow`)
   - Permission caching (`PermissionService`)
   - The exact response shapes the SDK expects from server endpoints

2. **Clone and read the controller repo** (`frappe_mobile_control`) — determine:
   - Which `mobile_auth.*` endpoints already exist vs need to be built
   - What DocTypes it provides (Mobile Auth Token, Mobile Form, Mobile App Status)
   - The auth middleware (Bearer token validation)

3. **Clone and read any SMS/OTP provider repo** — determine:
   - Whether OTP is generated server-side (us) or provider-side (e.g., MSG91)
   - Exact function signatures for send/verify
   - Configuration requirements (API keys, templates)

**SDK contract rule:** The SDK's `MobileFormName.fromJson` reads `doctype_meta_modifed_at`
(intentional typo — "modifed" not "modified"). Document this in the spec. The server MUST
return this exact misspelled key or metadata sync breaks silently.

### Phase 4: Generate the Technical Specification

Use the template in `references/spec-template.md`. Fill every section completely.
The output document must follow this exact structure:

```
1.  Architecture Overview (system diagram, tech stack, architecture decisions)
2.  SDK & Controller Integration Model (if mobile app)
3.  Module & App Setup (hooks.py, workspace, module definition)
4.  Roles & Permissions Matrix (every role × every DocType)
5.  DocType Specifications (COMPLETE — every field, every property)
6.  Workflow Specifications (states, transitions, allowed roles, conditions)
7.  Mobile App — SDK Integration Patterns (if mobile app)
8.  Custom API Endpoints (ONLY business logic that can't use standard REST)
9.  Integration Specifications (SMS, payments, storage, push, PDF)
10. Admin Portal — Page & Dashboard Specs
11. Non-Functional Requirements — Implementation
12. Deployment & Environment Strategy
13. Open Questions & Assumptions
```

Plus the Claude Code execution addendum:

```
A. mobile_auth Server Endpoints (if mobile app — complete request/response specs)
B. Recommended Build Order (phased, with dependency chain)
C. Claude Code Execution Notes (tooling, session context, quality gates)
```

### Phase 5: Add Claude Code Tooling Section

Every spec MUST include Section C with these three tools configured:

#### Tool 1: Everything Claude Code (ECC)

```
Repo: github.com/Brainmetrix/everything-claude-code
Install: /plugin marketplace add affaan-m/everything-claude-code
         /plugin install everything-claude-code@everything-claude-code
```

Map ECC agents and commands to project phases. For Frappe projects, the key components are:
- **Agents:** frappe-planner, frappe-api-agent, frappe-architect, frappe-tdd-guide, frappe-reviewer, frappe-security-reviewer, frappe-bg-agent, frappe-integrator, frappe-perf-agent
- **Commands:** /frappe-new, /frappe-workflow, /frappe-api, /frappe-test, /frappe-permission, /frappe-hook, /frappe-fixture, /frappe-deploy, /frappe-review, /frappe-print
- **Rules:** frappe-security.md, frappe-coding-style.md, frappe-performance.md, frappe-testing.md

#### Tool 2: Autoresearch

```
Repo: github.com/uditgoenka/autoresearch
Install: /plugin marketplace add uditgoenka/autoresearch
         /plugin install autoresearch@autoresearch
```

Define quality gates per phase:
- `/autoresearch:fix` — autonomous error fixing until tests pass
- `/autoresearch:security` — STRIDE + OWASP audit after each phase
- `/autoresearch:ship --checklist-only` — readiness gate before phase completion

#### Tool 3: Paperclip (Optional — for parallel execution)

```
Repo: github.com/paperclipai/paperclip
Setup: git clone → pnpm install → pnpm dev → Dashboard at localhost:3100
```

Include agent team structure if user plans to run multiple Claude Code sessions in parallel.
Mark as optional for sequential execution.

### Phase 6: Add CLAUDE.md Template

Every spec must include a `CLAUDE.md` template for the project root. This is what Claude Code
reads first on every session. It should contain:
- Project overview (one paragraph)
- Link to the tech spec file
- Dependency chain (install order)
- Key conventions (naming, API patterns, test commands)
- Available ECC commands and Autoresearch commands
- Any critical contract notes (like the SDK typo)

---

## DocType Spec Format

For every DocType, use this exact table format (Claude Code parses these directly):

```markdown
### X.Y DocType Name (Type — Master/Submittable/Child Table/Single)

**Purpose:** What it does, who creates it, when.
**Type:** Regular (Master) | Submittable | Child Table (parent: X) | Single
**Naming:** Naming Series / By Field / UUID
**title_field:** field_name | **sort_field:** creation | **sort_order:** desc

#### Fields

| # | Label | Fieldname | Fieldtype | Options/Values | Mandatory | Default | Key Properties |
|---|---|---|---|---|---|---|---|
| 1 | *Section: Name* | | Section Break | | | | depends_on if conditional |
| 2 | Field Label | field_name | Data/Select/Link/etc | Options | Yes/No | default | in_list_view, fetch_from, etc |

#### Controller Logic
- on_validate: what validations run
- on_submit: what happens on submit
- on_update: what triggers on update

#### List View
Columns, filters, sort, status indicators

#### Status Indicators (MANDATORY for every DocType with a status/workflow field)
Map every status value to a Frappe indicator color:
- indicator-pill format: `{status_value}:{color}`

Example:
| Status Value | Indicator Color | Chip Style |
|---|---|---|
| Draft | grey | `indicator-pill grey` |
| Pending Review | orange | `indicator-pill orange` |
| Approved | green | `indicator-pill green` |
| Rejected | red | `indicator-pill red` |
| In Progress | blue | `indicator-pill blue` |
| On Hold | purple | `indicator-pill purple` |
| Completed | green | `indicator-pill green` |
| Partially Distributed | yellow | `indicator-pill yellow` |

These go into the DocType JSON as:
```json
{
  "states": [
    {"title": "Pending Review", "color": "orange"},
    {"title": "Approved", "color": "green"},
    {"title": "Rejected", "color": "red"}
  ]
}
```
Frappe renders these as colored chips automatically in list views, form headers, and
Desk sidebar filters. NEVER leave status fields as plain text — always define indicator states.

For custom dashboard pages (Frappe Page / Custom HTML Block), render status as tinted chips:
- Fully rounded (`border-radius: 9999px`), 12px font, weight 500
- Tinted background + matching dark text (e.g., green-50 bg + green-600 text)
- Optional leading dot (6px circle) for table rows
- Follow the Frappe Dashboard Design Skill color mapping (see § Frappe Skills Reference below)
```

**Every** `depends_on`, `mandatory_depends_on`, `fetch_from`, `in_list_view`, `in_filter`,
`read_only`, `hidden`, `permlevel`, `search_index`, and `unique` property matters for the SDK.
If you omit a property, the mobile form renders incorrectly. Be exhaustive.

---

## Workflow Spec Format

```markdown
**Workflow Name:** Name
**Document Type:** DocType
**Workflow State Field:** status

**States:**
| State | Doc Status | Color | Is Optional |
|---|---|---|---|

**Transitions:**
| From | Action | To | Allowed Role | Condition |
|---|---|---|---|---|
```

---

## API Endpoint Spec Format

For custom whitelisted methods (NOT standard REST — the SDK handles that):

```python
@frappe.whitelist()
def method_name(arg1, arg2):
    """
    Purpose: What this does.
    Called by: Who/what calls it.
    
    Args:
        arg1: description
        arg2: description
    
    Returns (as frappe.response["message"]):
        { exact response shape with types }
    
    Implementation notes:
        - Step-by-step implementation guidance
        - Security: frappe.has_permission() call
        - Background job: use frappe.enqueue() if > 2s
    """
```

---

## Quality Checklist (Run Before Delivering Spec)

Before presenting the spec to the user, verify:

- [ ] Every BRD field appears in exactly one DocType field table
- [ ] Every BRD workflow state appears in a Workflow States table
- [ ] Every BRD user role appears in the Permissions Matrix
- [ ] Every BRD screen maps to either a DocType form, custom Page, or Flutter screen
- [ ] No orphan DocTypes (every DocType is referenced by at least one other)
- [ ] All Link field targets exist as DocTypes in the spec
- [ ] All child table DocTypes have a parent specified
- [ ] All `fetch_from` references point to real fields on real DocTypes
- [ ] Install order is consistent everywhere it appears
- [ ] Open Questions list everything genuinely unresolved (not just "TBD")
- [ ] No "[ASSUMPTION]" markers left without explicit flagging
- [ ] Claude Code build phases have clear dependency chain
- [ ] Quality gates defined for every phase

---

## Frappe Skills Reference (MUST Consult)

When generating the spec, reference these organization/user skills for specific implementation
patterns. The generated spec should explicitly tell Claude Code to read these skills at the
relevant phase.

### Frappe Dashboard Design Skill

**When:** Phase 3 — any custom Frappe Page (allocation workflow, MIS dashboard, analytics)

This skill is a binding design contract for every dashboard, page, widget, or UI component
built on Frappe. It enforces "Refined Utility" aesthetic (Shadcn-level restraint + elevated craft).

**Key rules the spec must reference:**
- KPI cards: 28px number (Indian formatting), 14px label, icon with tinted bg, growth indicator
- Status chips: ALWAYS colored — never plain text. Fully rounded, tinted bg + dark text
- Tables: left-align text, right-align numbers, center-align status chips, sticky header, 48px min row height
- Charts: ColorBrewer palettes only, animate on first load, tooltips with full numbers
- Filter strip: every dashboard page gets Date Range + Entity + Status + Search + Reset
- India heatmap: TopoJSON, fitBounds(), state-level default, click to drill to district
- Light theme only: background #F9FAFB, card surfaces #FFFFFF
- Mock data banner when using demo data
- Empty states: icon + headline + subtext + CTA

**Standard status chip color mapping (use across all specs):**

| Status | Background | Text | Frappe Indicator |
|---|---|---|---|
| Active / Approved / Completed | green-50 | green-600 | green |
| Pending / Under Review | amber-50 | amber-600 | orange |
| Rejected / Failed | red-50 | red-600 | red |
| Draft / Inactive | gray-100 | gray-600 | grey |
| New / Info | blue-50 | blue-600 | blue |
| On Hold / Partial | purple-50 | purple-600 | purple |
| In Transit / In Progress | cyan-50 | cyan-600 | blue |
| Warning / Near Expiry | yellow-50 | yellow-700 | yellow |

### Frappe Custom HTML Block (CHB) Skill

**When:** Phase 3 — deploying dashboards inside Frappe Workspaces (not standalone Pages)

Critical deployment knowledge for workspace-embedded UI. The spec must warn about:

1. **Shadow DOM rendering** — CHBs render inside a Web Component shadow root. `document.getElementById()` 
   does NOT cross the boundary. Use `root_element` (auto-injected by Frappe) for all DOM queries.

2. **The label-match rule** — The `label` in the workspace `custom_blocks` child table MUST exactly 
   equal the `custom_block_name` in the workspace `content` JSON. Mismatch = silent blank render.

3. **Three-field split** — HTML goes in `html` field, CSS in `style` field, JS in `script` field. 
   `<style>` and `<script>` tags inside the `html` field are silently stripped.

4. **No external CDN** — CDN scripts fail in shadow DOM context. Inline all chart libraries or use 
   `frappe.Chart` (available globally). Chart.js must be loaded via Frappe's bundle, not CDN.

5. **`page_data` discovery** — CHB data is loaded via the workspace's `page_data` object. 
   The script can access `frappe.call()` for server data.

**Spec must include:** For any workspace-embedded dashboard, specify whether it's a Custom HTML 
Block (CHB) or a standalone Frappe Page. If CHB, include the label, html/style/script field split,
and the workspace content JSON structure.

### Frappe v16 Deployment Skill

**When:** Phase 3 — deploying any custom Page, workspace, or CHB

Key constraints the spec must account for:
- Custom Pages store JS/CSS on filesystem, NOT in DB — `developer_mode` must be ON for file writes
- Workspace Sidebar requires Desktop Icon connector + Module Def + Role permissions
- `add_to_apps_screen["name"]` must be all-lowercase (case-sensitive `app_data_map`)
- A workspace is invisible unless a role has read permission on at least one DocType in it

---

## Admin UI Pattern Decisions

For every admin custom Page in the spec, explicitly choose one of these deployment patterns:

| Pattern | Use When | Routing | Developer Mode Required? |
|---|---|---|---|
| **Frappe Page** (standalone) | Full-page dashboards with complex JS, allocation workflow | `/app/page-name` | Yes (for file-based JS/CSS) |
| **Custom HTML Block** (workspace-embedded) | KPI widgets, summary cards inside a workspace | Workspace tab | No (content in DB) |
| **Script Report** | Tabular data with filters, exportable | `/app/query-report/Report Name` | No |
| **Standard List + Form** | Basic CRUD — let Frappe Desk handle it | `/app/doctype-name` | No |

Most admin needs are met by standard Desk views. Only spec custom Pages/CHBs when:
- The workflow requires a multi-step wizard UI (e.g., 3-step allocation: City → Food Bank → Assign)
- Dashboard requires charts, maps, or KPI cards that standard reports can't provide
- The UX requires drag-and-drop or other interactions not available in standard Frappe forms

---

## Client Script Patterns

For DocType list views that need enhanced styling beyond Frappe's built-in indicators,
include a list view client script (`doctype_list_js` in hooks.py):

```javascript
// Example: Enhanced status chips in list view
frappe.listview_settings['IFBN Donation'] = {
    get_indicator: function(doc) {
        const status_map = {
            'Draft': [__('Draft'), 'grey', 'status,=,Draft'],
            'Pending Allocation': [__('Pending Allocation'), 'orange', 'status,=,Pending Allocation'],
            'Allocated': [__('Allocated'), 'blue', 'status,=,Allocated'],
            'In Transit': [__('In Transit'), 'purple', 'status,=,In Transit'],
            'Completed': [__('Completed'), 'green', 'status,=,Completed'],
            'Rejected': [__('Rejected'), 'red', 'status,=,Rejected'],
        };
        return status_map[doc.status] || [__(doc.status), 'grey', ''];
    },
    formatters: {
        status: function(value) {
            // Frappe auto-renders as colored pill when get_indicator is defined
            return value;
        }
    }
};
```

The spec MUST include a `get_indicator` definition for EVERY DocType that has a status or 
workflow state field. This ensures colored chip rendering in Desk list views.

For mobile list views, the SDK's `DocumentListScreen` reads the DocType's `states` JSON 
property (set via DocType JSON `"states"` array) and renders colored indicators automatically.

---

## What NOT to Do

- **Don't leave status fields as plain text.** Every Select field that represents a state/status MUST have colored indicator definitions — both in the DocType JSON `states` array and in a `get_indicator` listview client script. Plain text statuses look broken.
- **Don't build custom Pages when standard Desk views suffice.** Frappe's built-in list views, form views, and report builder handle 80% of admin needs. Only spec custom Pages for multi-step workflows, dashboards with charts/maps, or UX that requires interactions beyond standard forms.
- **Don't deploy CHBs without the label-match rule.** The workspace content JSON `custom_block_name` must EXACTLY match the child table `label`. Mismatch = silent blank render with no error.
- **Don't use external CDN scripts in Custom HTML Blocks.** Shadow DOM blocks external script loading. Inline everything or use `frappe.Chart` / `frappe.ui` utilities.
- **Don't skip the Frappe Dashboard Design Skill for admin pages.** Reference it for Phase 3. Admin custom Pages without a design system look amateur.
- **Don't include the BRD text in the spec.** The spec replaces the BRD for implementation. If both are given to Claude Code, contradictions cause hallucinations.
- **Don't spec custom API endpoints for standard CRUD.** The SDK's `FrappeClient.document.*` handles create/read/update/delete/submit/cancel via standard Frappe REST. Only spec custom endpoints for business logic (payments, bulk operations, calculations).
- **Don't assume the controller repo has working code.** Always read it. Scaffolded repos with only hooks.py and __init__.py are common — the endpoints may need to be built.
- **Don't "fix" the SDK's `doctype_meta_modifed_at` typo.** Document it. The SDK parses this exact key.
- **Don't generate the Flutter app spec in exhaustive detail.** The SDK's `FormScreen` renders most forms automatically from DocType metadata. Only spec custom screens (onboarding, dashboards, payment checkout, receipt viewer). The Figma designs handle the rest at Phase 4.
