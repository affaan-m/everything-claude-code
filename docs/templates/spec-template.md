# Technical Specification Template

Use this template as the skeleton for every BRD → Spec conversion.
Fill every section. If a section doesn't apply, write "N/A — [reason]" rather than omitting it.

---

```markdown
# [Project Name] — Technical Specification

**Platform:** Frappe Framework v16 (Web Admin) + Flutter via Dhwani Frappe Mobile SDK (Mobile App)  
**Module:** [Module Name]  
**App Name (hooks.py):** `[app_name]`  
**Server Dependency:** `frappe_mobile_control` (Dhwani Mobile Control app)  
**Client Dependency:** `frappe_mobile_sdk` (Dhwani Frappe Mobile SDK — Flutter)  
**SMS/OTP Dependency:** `frappe_msg91_integration` (Dhwani MSG91 app)  
**Source of Truth:** [BRD Document Name]  
**Prepared by:** [Author / Org]  
**Date:** [Date]  
**Status:** Draft — For Internal Technical Review

---

## Table of Contents

1. Architecture Overview
2. SDK & Controller Integration Model
3. Module & App Setup
4. Roles & Permissions Matrix
5. DocType Specifications (Complete)
6. Workflow Specifications
7. Mobile App — SDK Integration Patterns
8. Custom API Endpoints (Business Logic Only)
9. Integration Specifications
10. Admin Portal — Page & Dashboard Specs
11. Non-Functional Requirements — Implementation
12. Deployment & Environment Strategy
13. Open Questions & Assumptions

---

## 1. Architecture Overview

### 1.1 System Architecture

[Insert system diagram — ASCII art showing:
- Flutter Mobile App with frappe_mobile_sdk
- frappe_mobile_control (mobile_auth.* endpoints)
- Frappe REST API (standard endpoints)
- Custom Frappe App (business logic only)
- Frappe ORM + MariaDB
- External services (S3, Payment, Push, SMS, Email)]

### 1.2 Critical Architecture Decision: SDK-Driven Mobile

[Table: What SDK handles natively vs What needs custom code]

### 1.3 Technology Stack

[Table: Component | Technology | Notes]

---

## 2. SDK & Controller Integration Model

### 2.1 Server-Side Setup: `frappe_mobile_control`

[Installation commands, Mobile Form configuration entries]

### 2.2 Client-Side Setup: `frappe_mobile_sdk`

[pubspec.yaml, AppConfig, LoginConfig, FrappeSDK initialization]

### 2.3 Authentication Flow

[Sequence diagram: Mobile → Controller → Frappe → SMS]

### 2.4 Form Rendering Model

[How FormScreen renders DocType metadata dynamically]

### 2.5 Workflow on Mobile

[How WorkflowService surfaces Frappe workflows as action buttons]

---

## 3. Module & App Setup

### 3.1 App Configuration (hooks.py)

[Complete hooks.py with required_apps, scheduler_events, doc_events, app_include_js]

### 3.2 Module & Workspace

[Module name, workspace config, shortcuts]

---

## 4. Roles & Permissions Matrix

### 4.1 Role Definitions

[Table: Role Name | Description | Platform (Mobile/Web)]

### 4.2 Global Permissions Table

[Table: DocType × Role with R/W/C/D/S permissions, (own) for if_owner]

---

## 5. DocType Specifications

[One subsection per DocType with full field table, controller logic, list view config.
Include ALL child tables. Use the format from SKILL.md § DocType Spec Format.

CRITICAL: For every DocType with a status/workflow field, include:
1. Status Indicators table (status value → color mapping)
2. DocType JSON `states` array definition
3. `get_indicator` listview client script
4. hooks.py `doctype_list_js` entry

Standard color mapping:
- Draft/Inactive → grey
- Pending/Under Review → orange
- Approved/Active/Completed → green
- Rejected/Failed → red
- In Progress/In Transit → blue
- On Hold/Partial → purple/yellow]

---

## 6. Workflow Specifications

### 6.1 How Workflows Surface on Mobile

[Explain SDK's WorkflowService auto-rendering]

### 6.2 Workflow Definitions

[One subsection per workflow: states table + transitions table]

---

## 7. Mobile App — SDK Integration Patterns

### 7.1 App Structure (Flutter)

[Directory tree: lib/screens, lib/widgets, lib/config, lib/utils]

### 7.2 Key SDK Usage Patterns

[Dart code examples for: Registration, Create Document, List Screen, Workflow Action, Offline Draft]

### 7.3 Custom FormStyle

[FrappeFormStyle configuration for project branding]

---

## 8. Custom API Endpoints (Business Logic Only)

[ONLY endpoints that can't use standard Frappe REST.
Typical: payment gateway, bulk upload, dashboard stats, registration helpers.
Use format from SKILL.md § API Endpoint Spec Format.]

---

## 9. Integration Specifications

[SMS/OTP, File Storage, Payment Gateway, Push Notifications, PDF Generation, E-Signature]

---

## 10. Admin Portal — Page & Dashboard Specs

[Custom Frappe Pages: route, roles, UI structure, design system reference.

For EVERY custom admin page, specify:
1. Deployment pattern: Frappe Page vs Custom HTML Block vs Script Report
2. Route and allowed roles
3. UI structure (page sections top-to-bottom)
4. Data sources (which API calls / DocType queries)
5. Status chip color mapping for any status columns in tables

Reference these org skills for implementation:
- **Frappe Dashboard Design Skill** — KPI cards, status chips, charts, filter strips, 
  India heatmap, color palettes, typography, spacing. MUST READ before building any custom Page.
- **Frappe Custom HTML Block Skill** — Shadow DOM rendering, label-match rule, three-field split,
  no external CDN. MUST READ before deploying any workspace-embedded dashboard.
- **Frappe v16 Deployment Skill** — Page filesystem constraints, developer_mode gate, 
  workspace sidebar setup, Desktop Icon connectors. MUST READ before deployment.

Example custom Page spec:

### Allocation Workflow Page
**Type:** Frappe Page (standalone — requires developer_mode for deployment)
**Route:** `/app/project-allocation-workflow`
**Roles:** Manager, Finance Officer
**Design system:** Follow Frappe Dashboard Design Skill
**Status chips in tables:** Pending=orange, Accepted=green, Declined=red, In Distribution=blue

**UI Structure:**
```
Filter Strip: City | Program Type | Date Range
Step 1: City selection cards (KPI: donation count per city)
Step 2: Food Bank / NGO selection (capacity indicators)
Step 3: Quantity assignment (split donation across partners)
[Submit Allocation] button → creates Allocation DocTypes
```

**Listview client script:**
```javascript
frappe.listview_settings['DocType Name'] = {
    get_indicator: function(doc) { ... }  // colored status chips
};
```]

---

## 11. Non-Functional Requirements — Implementation

[Table: Requirement | Implementation approach]

---

## 12. Deployment & Environment Strategy

[Environment table, bench install order, mobile app pointing, release cadence]

---

## 13. Open Questions & Assumptions

### Assumptions (flagged for confirmation)

[Table: # | Assumption | Impact if Wrong]

### Open Questions

[Table: # | Question | Blocker For | Who Answers]

---

## Appendix A: Key Differences from Custom API Approach

[Table showing what SDK handles vs what was wrongly assumed to need custom code]

---

## A. mobile_auth Server Endpoints — Complete Specification

[One subsection per endpoint: A.1 through A.9 + A.10 Supporting DocTypes.
Each with: Purpose, Called by, HTTP method, Args, Returns (exact shape), Implementation notes.
Include the MSG91 integration for OTP endpoints.]

---

## B. Recommended Build Order for Claude Code

### Phase 0: frappe_mobile_control — Server Prerequisite
[Deliverables, test gate, estimated scope]

### Phase 1: [app_name] — DocTypes + Workflows + Controllers
[Deliverables, test gate, estimated scope]

### Phase 2: [app_name] — Custom API + Integrations
[Deliverables, test gate, estimated scope]

### Phase 3: [app_name] — Admin Custom Pages
[Deliverables, test gate, estimated scope]

### Phase 4: Flutter Mobile App — SDK Integration
[Deliverables, test gate, estimated scope]

### Phase Summary
[Table: Phase | What | Lines est. | Depends On | Claude Code Session]

---

## C. Claude Code Execution Notes

### C.1 Toolchain Setup — Three Repos

#### Tool 1: Everything Claude Code (ECC)
Repo: github.com/Brainmetrix/everything-claude-code
[Install commands, agent-to-phase mapping, key commands, rules]

#### Tool 2: Autoresearch
Repo: github.com/uditgoenka/autoresearch
[Install commands, command-to-phase mapping, quality chain]

#### Tool 3: Paperclip (Optional)
Repo: github.com/paperclipai/paperclip
[Setup, agent team structure, when to use vs skip]

### C.2 Per-Session Context
[What documents/repos each Claude Code session receives]

### C.3 Recommended Session Workflow
[7-step pattern: PLAN → BUILD → VERIFY → FIX → SECURE → REVIEW → SHIP]

### C.4 File Structure Expected
[Directory trees for server app(s) and Flutter app after all phases]

### C.5 Critical SDK Contract
[The doctype_meta_modifed_at typo and any other SDK-specific contracts]

### C.6 Quality Gates
[Autoresearch commands that must pass before any phase is marked complete]

### C.7 CLAUDE.md Template
[Exact content for the project's CLAUDE.md file]

---

*End of Technical Specification.*
```
