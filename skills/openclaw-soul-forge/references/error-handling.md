# Error Handling & Degradation Strategy

## Design Philosophy

> No error should interrupt the user's creative flow. Degrade gracefully — never break.

## Error Classification & Degradation Matrix

### Type A: Environment Missing

| Error Scenario | Detection | Degradation | User Message |
|----------------|-----------|-------------|--------------|
| Python 3 unavailable | `python3 --version` fails | Skip gacha.py; randomly select from the 10 preset directions | "The gacha engine needs Python 3 — falling back to built-in random selection" |

### Type B: Optional Dependency Unavailable

| Error Scenario | Detection | Degradation | User Message |
|----------------|-----------|-------------|--------------|
| Approved image-generation skill not installed | Check if the approved skill exists | Output full prompt text + manual platform instructions | "No approved image-generation skill found — outputting the prompt for manual use" |
| Approved image-generation call fails | Skill returns error | Retry once; if still failing, output prompt text | "Image generation failed — outputting the prompt for manual use" |

### Type C: Runtime Exception

| Error Scenario | Degradation | User Message |
|----------------|-------------|--------------|
| gacha.py output format invalid | Randomly select from the 10 preset directions | "Gacha result couldn't be parsed — switched to built-in random" |
| Any unexpected error | Log the error, skip the step, continue main flow | "Hit a snag: [brief description]. Skipped and continuing" |

## Unified Error Message Format

```markdown
> [Warning] **[Step name] degraded**
> Cause: [What happened]
> Impact: [What functionality is limited]
> Fallback: [What is being used instead]
> Recovery: [How to restore full functionality]
```

Example:

```markdown
> [Warning] **Avatar generation degraded**
> Cause: no approved image-generation skill found
> Impact: Cannot auto-generate the avatar image
> Fallback: Full prompt output — paste into Gemini / ChatGPT to generate manually
> Recovery: Install and enable an approved image-generation skill in the current environment
```

## Core Principles

1. **The text blueprint is the core value; the avatar is the bonus** — a supporting feature failing must never interrupt the main flow
2. **Degradation messages must be actionable** — don't just say "something went wrong," say "here's how to fix it"
3. **One degraded step does not affect subsequent steps** — if Step 5 degrades, Step 6 proceeds normally
