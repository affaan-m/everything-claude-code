---
description: Show specification status and progress
allowed-tools: Bash, Read, Glob, Write, Edit, MultiEdit, Update
argument-hint: <feature-name>
---

# Specification Status

<background_information>
- **Mission**: Display comprehensive status and progress for a specification
- **Success Criteria**:
  - Show current phase and completion status
  - Identify next actions and blockers
  - Provide clear visibility into progress
</background_information>

<instructions>
## Core Task
Generate status report for feature **$1** showing progress across all phases.

## Execution Steps

### Step 1: Load Spec Context
- Read `.kiro/specs/$1/spec.json` for metadata and phase status
- Read existing files: `requirements.md`, `design.md`, `tasks.md` (if they exist)
- Check `.kiro/specs/$1/` directory for available files

### Step 2: Analyze Status

**Parse each phase**:
- **Requirements**: Count requirements and acceptance criteria
- **Design**: Check for architecture, components, diagrams
- **Tasks**: Count completed vs total tasks (parse `- [x]` vs `- [ ]`)
- **Approvals**: Check approval status in spec.json

### Step 3: Generate Report

Create report in the language specified in spec.json covering:
1. **Current Phase & Progress**: Where the spec is in the workflow
2. **Completion Status**: Percentage complete for each phase
3. **Task Breakdown**: If tasks exist, show completed/remaining counts
4. **Next Actions**: What needs to be done next
5. **Blockers**: Any issues preventing progress

## Critical Constraints
- Use language from spec.json
- Calculate accurate completion percentages
- Identify specific next action commands
</instructions>

## Tool Guidance
- **Read**: Load spec.json first, then other spec files as needed
- **Parse carefully**: Extract completion data from tasks.md checkboxes
- Use **Glob** to check which spec files exist

## Output Description

Provide status report in the language specified in spec.json:

**Report Structure**:
1. **Feature Overview**: Name, phase, last updated
2. **Phase Status**: Requirements, Design, Tasks with completion %
3. **Task Progress**: If tasks exist, show X/Y completed
4. **Next Action**: Specific command to run next
5. **Issues**: Any blockers or missing elements

**Format**: Clear, scannable format with emojis (✅/⏳/❌) for status

## Safety & Fallback

### Error Scenarios

**Spec Not Found**:
- **Message**: "No spec found for `$1`. Check available specs in `.kiro/specs/`"
- **Action**: List available spec directories

**Incomplete Spec**:
- **Warning**: Identify which files are missing
- **Suggested Action**: Point to next phase command

### List All Specs

To see all available specs:
- Run with no argument or use wildcard
- Shows all specs in `.kiro/specs/` with their status

think
