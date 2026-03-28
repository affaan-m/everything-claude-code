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
| baoyu-image-gen skill not installed | Check if skill exists | Output full prompt text + manual platform instructions | "baoyu-image-gen skill not found — outputting the prompt for manual use" |
| baoyu-image-gen call fails | Skill returns error | Retry once; if still failing, output prompt text | "Image generation failed — outputting the prompt for manual use" |

### Type C: Runtime Exception

| Error Scenario | Degradation | User Message |
|----------------|-------------|--------------|
| gacha.py output format invalid | Randomly select from the 10 preset directions | "Gacha result couldn't be parsed — switched to built-in random" |
| Any unexpected error | Log the error, skip the step, continue main flow | "Hit a snag: [brief description]. Skipped and continuing" |

## Unified Error Message Format

```markdown
> ⚠️ **[Step name] degraded**
> Cause: [What happened]
> Impact: [What functionality is limited]
> Fallback: [What is being used instead]
> Fix: [How to restore full functionality]
```

Example:

```markdown
> ⚠️ **Avatar generation degraded**
> Cause: baoyu-image-gen skill not found
> Impact: Cannot auto-generate the avatar image
> Fallback: Full prompt output — paste into Gemini / ChatGPT to generate manually
> Fix: Install baoyu-image-gen skill → https://github.com/JimLiu/baoyu-skills
```

## Core Principles

1. **The text blueprint is the core value; the avatar is the bonus** — a supporting feature failing must never interrupt the main flow
2. **Degradation messages must be actionable** — don't just say "something went wrong," say "here's how to fix it"
3. **One degraded step does not affect subsequent steps** — if Step 5 degrades, Step 6 proceeds normally
