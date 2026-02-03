# Exercise 3: Path-Specific Rules

## Instructions

Path-specific rules only activate when Claude is working on files matching
the specified glob patterns. This keeps rules relevant and reduces noise.

## Example 1: Python-only rules

Save this as `.claude/rules/python-style.md`:

```yaml
---
paths:
  - "**/*.py"
---

# Python-Specific Rules

- Use type hints on all function parameters and return types
- Use `pytest` style tests (not unittest)
- Prefer `dataclasses` or Pydantic `BaseModel` over plain dicts
- Handle exceptions specifically, never bare `except:`
```

## Example 2: Config file rules

Save this as `.claude/rules/config-safety.md`:

```yaml
---
paths:
  - "**/*.yaml"
  - "**/*.yml"
  - "**/*.json"
  - "**/*.toml"
  - "**/*.env*"
---

# Configuration File Rules

- NEVER add real credentials to config files
- Use placeholder values like `<YOUR_API_KEY>` or `${ENV_VAR}`
- Include comments explaining each configuration option
- Validate against a schema when one exists
```

## Example 3: Infrastructure-as-Code rules

Save this as `.claude/rules/iac-rules.md`:

```yaml
---
paths:
  - "terraform/**/*.tf"
  - "ansible/**/*.yml"
  - "cloudformation/**/*.yaml"
---

# Infrastructure Rules

- All resources must have `Name`, `Environment`, and `Owner` tags
- Use variables for region, account ID, and environment
- Never use `0.0.0.0/0` for ingress rules without justification
- Reference CIS Benchmark controls in comments
- Enable encryption at rest for all storage resources
```

## Your Task

1. Create a `.claude/rules/` directory in a test project
2. Add at least one path-specific rule file
3. Open Claude Code and edit a file matching the pattern
4. Ask Claude to review your code — it should apply the path-specific rules
5. Edit a file NOT matching the pattern — those rules should NOT apply
