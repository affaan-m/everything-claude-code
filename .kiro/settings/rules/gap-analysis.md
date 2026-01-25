# Gap Analysis Process

## Objective
Analyze the gap between requirements and existing codebase to inform implementation strategy decisions.

## Analysis Framework

### 1. Current State Investigation

- Scan for domain-related assets:
  - Key files/modules and directory layout
  - Reusable components/services/utilities
  - Dominant architecture patterns and constraints

- Extract conventions:
  - Naming, layering, dependency direction
  - Import/export patterns and dependency hotspots
  - Testing placement and approach

- Note integration surfaces:
  - Data models/schemas, API clients, auth mechanisms

### 2. Requirements Feasibility Analysis

- From EARS requirements, list technical needs:
  - Data models, APIs/services, UI/components
  - Business rules/validation
  - Non-functionals: security, performance, scalability, reliability

- Identify gaps and constraints:
  - Missing capabilities in current codebase
  - Unknowns to be researched later (mark as "Research Needed")
  - Constraints from existing architecture and patterns

- Note complexity signals:
  - Simple CRUD / algorithmic logic / workflows / external integrations

### 3. Implementation Approach Options

#### Option A: Extend Existing Components
**When to consider**: Feature fits naturally into existing structure

- **Which files/modules to extend**:
  - Identify specific files requiring changes
  - Assess impact on existing functionality
  - Evaluate backward compatibility concerns

- **Compatibility assessment**:
  - Check if extension respects existing interfaces
  - Verify no breaking changes to consumers
  - Assess test coverage impact

- **Complexity and maintainability**:
  - Evaluate cognitive load of additional functionality
  - Check if single responsibility principle is maintained
  - Assess if file size remains manageable

**Trade-offs**:
- ✅ Minimal new files, faster initial development
- ✅ Leverages existing patterns and infrastructure
- ❌ Risk of bloating existing components
- ❌ May complicate existing logic

#### Option B: Create New Components
**When to consider**: Feature has distinct responsibility or existing components are already complex

- **Rationale for new creation**:
  - Clear separation of concerns justifies new file
  - Existing components are already complex
  - Feature has distinct lifecycle or dependencies

- **Integration points**:
  - How new components connect to existing system
  - APIs or interfaces exposed
  - Dependencies on existing components

- **Responsibility boundaries**:
  - Clear definition of what new component owns
  - Interfaces with existing components
  - Data flow and control flow

**Trade-offs**:
- ✅ Clean separation of concerns
- ✅ Easier to test in isolation
- ✅ Reduces complexity in existing components
- ❌ More files to navigate
- ❌ Requires careful interface design

#### Option C: Hybrid Approach
**When to consider**: Complex features requiring both extension and new creation

- **Combination strategy**:
  - Which parts extend existing components
  - Which parts warrant new components
  - How they interact

- **Phased implementation**:
  - Initial phase: minimal viable changes
  - Subsequent phases: refactoring or new components
  - Migration strategy if needed

- **Risk mitigation**:
  - Incremental rollout approach
  - Feature flags or configuration
  - Rollback strategy

**Trade-offs**:
- ✅ Balanced approach for complex features
- ✅ Allows iterative refinement
- ❌ More complex planning required
- ❌ Potential for inconsistency if not well-coordinated
### 4. Out-of-Scope for Gap Analysis

- Defer deep research activities to the design phase.
- Record unknowns as concise "Research Needed" items only.

### 5. Implementation Complexity & Risk

  - Effort:
    - S (1–3 days): existing patterns, minimal deps, straightforward integration
    - M (3–7 days): some new patterns/integrations, moderate complexity
    - L (1–2 weeks): significant functionality, multiple integrations or workflows
    - XL (2+ weeks): architectural changes, unfamiliar tech, broad impact
  - Risk:
    - High: unknown tech, complex integrations, architectural shifts, unclear perf/security path
    - Medium: new patterns with guidance, manageable integrations, known perf solutions
    - Low: extend established patterns, familiar tech, clear scope, minimal integration

### Output Checklist

- Requirement-to-Asset Map with gaps tagged (Missing / Unknown / Constraint)
- Options A/B/C with short rationale and trade-offs
- Effort (S/M/L/XL) and Risk (High/Medium/Low) with one-line justification each
- Recommendations for design phase:
  - Preferred approach and key decisions
  - Research items to carry forward

## Principles

- **Information over decisions**: Provide analysis and options, not final choices
- **Multiple viable options**: Offer credible alternatives when applicable
- **Explicit gaps and assumptions**: Flag unknowns and constraints clearly
- **Context-aware**: Align with existing patterns and architecture limits
- **Transparent effort and risk**: Justify labels succinctly
