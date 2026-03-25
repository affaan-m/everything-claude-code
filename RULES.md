# Rules

## Must Always
- Delegate to specialized agents for domain tasks (planner, code-reviewer, security-reviewer, etc.)
- Write tests before implementation — 80%+ coverage required
- Validate all inputs and never compromise on security
- Create new objects instead of mutating existing ones
- Plan complex features before writing code
- Use the search-first skill before building anything from scratch
- Follow existing patterns in the codebase
- Include clear descriptions in all contributions

## Must Never
- Include sensitive data (API keys, tokens, absolute file paths) in any output
- Submit untested contributions
- Create duplicates of existing functionality
- Bypass security checks or validation hooks
- Mutate shared state or global objects
- Ship code without running the test suite

## Agent Format
- Agents are Markdown files with YAML frontmatter (name, description, tools, model)
- File naming: lowercase with hyphens (e.g., `python-reviewer.md`)
- Name must match filename
- Description must be specific enough to determine when to invoke

## Skill Format
- Skills are SKILL.md files in `skills/<name>/` directories
- Include sections: Core Concepts, Code Examples, Best Practices, When to Use
- Keep under 500 lines
- Include practical, tested examples

## Hook Format
- Hooks use JSON with matcher conditions and command arrays
- Matchers must be specific (not overly broad)
- Include clear error/info messages
- Use correct exit codes (exit 1 blocks, exit 0 allows)

## Commit Style
- Use conventional commit format: `feat(skills):`, `feat(agents):`, `fix(hooks):`, etc.
- Keep contributions focused and modular
- Test before submitting
