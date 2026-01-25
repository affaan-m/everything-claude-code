---
description: Interactive technical design quality review and validation
allowed-tools: Read, Glob, Grep
argument-hint: <feature-name>
---

# Technical Design Validation

<background_information>
- **Mission**: Conduct interactive quality review of technical design to ensure readiness for implementation
- **Success Criteria**:
  - Critical issues identified (maximum 3 most important concerns)
  - Balanced assessment with strengths recognized
  - Clear GO/NO-GO decision with rationale
  - Actionable feedback for improvements if needed
</background_information>

<instructions>
## Core Task
Interactive design quality review for feature **$1** based on approved requirements and design document.

## Execution Steps

1. **Load Context**:
   - Read `.kiro/specs/$1/spec.json` for language and metadata
   - Read `.kiro/specs/$1/requirements.md` for requirements
   - Read `.kiro/specs/$1/design.md` for design document
   - **Load ALL steering context**: Read entire `.kiro/steering/` directory including:
     - Default files: `structure.md`, `tech.md`, `product.md`
     - All custom steering files (regardless of mode settings)
     - This provides complete project memory and context

2. **Read Review Guidelines**:
   - Read `.kiro/settings/rules/design-review.md` for review criteria and process

3. **Execute Design Review**:
   - Follow design-review.md process: Analysis → Critical Issues → Strengths → GO/NO-GO
   - Limit to 3 most important concerns
   - Engage interactively with user
   - Use language specified in spec.json for output

4. **Provide Decision and Next Steps**:
   - Clear GO/NO-GO decision with rationale
   - Guide user on proceeding based on decision

## Important Constraints
- **Quality assurance, not perfection seeking**: Accept acceptable risk
- **Critical focus only**: Maximum 3 issues, only those significantly impacting success
- **Interactive approach**: Engage in dialogue, not one-way evaluation
- **Balanced assessment**: Recognize both strengths and weaknesses
- **Actionable feedback**: All suggestions must be implementable
</instructions>

## Tool Guidance
- **Read first**: Load all context (spec, steering, rules) before review
- **Grep if needed**: Search codebase for pattern validation or integration checks
- **Interactive**: Engage with user throughout the review process

## Output Description
Provide output in the language specified in spec.json with:

1. **Review Summary**: Brief overview (2-3 sentences) of design quality and readiness
2. **Critical Issues**: Maximum 3, following design-review.md format
3. **Design Strengths**: 1-2 positive aspects
4. **Final Assessment**: GO/NO-GO decision with rationale and next steps

**Format Requirements**:
- Use Markdown headings for clarity
- Follow design-review.md output format
- Keep summary concise

## Safety & Fallback

### Error Scenarios
- **Missing Design**: If design.md doesn't exist, stop with message: "Run `/kiro:spec-design $1` first to generate design document"
- **Design Not Generated**: If design phase not marked as generated in spec.json, warn but proceed with review
- **Empty Steering Directory**: Warn user that project context is missing and may affect review quality
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Phase: Task Generation

**If Design Passes Validation (GO Decision)**:
- Review feedback and apply changes if needed
- Run `/kiro:spec-tasks $1` to generate implementation tasks
- Or `/kiro:spec-tasks $1 -y` to auto-approve and proceed directly

**If Design Needs Revision (NO-GO Decision)**:
- Address critical issues identified
- Re-run `/kiro:spec-design $1` with improvements
- Re-validate with `/kiro:validate-design $1`

**Note**: Design validation is recommended but optional. Quality review helps catch issues early.
