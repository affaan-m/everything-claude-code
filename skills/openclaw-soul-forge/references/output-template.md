# Step 6: Full Output Template

Assemble all steps into a complete lobster soul blueprint.

## Output Format

```markdown
# 🦞 Lobster Soul Blueprint: [Name]

## Identity

**One-line Soul**: [Summary]

**Former Life**: [Who they used to be]
**Current Situation**: [Why they're here]
**Inner Contradiction**: [Core tension]
**Personality Notes**: [2–3 keywords]
**Speaking Style**: [Specific description]

## Soul (SOUL.md contents)

### Who I Am

[1–2 paragraphs of character self-description, written in first person, in the character's own voice]

### How I Talk

- [Specific style point 1]
- [Specific style point 2]
- [Specific style point 3]

### My Lines

> [Boundary declaration in the character's voice]

1. **[Rule 1]**: [Content]
2. **[Rule 2]**: [Content]
3. **[Rule 3]**: [Content]

### Worldview

- [Core belief derived from former life — specific enough to potentially be wrong]
- [Core belief 2]

### Inner Contradiction

[Carried over from Step 2's identity tension, restated in the character's own voice]

### Pet Peeves

- [1-2 things that trigger this character's reflexive pushback, in their own language]

### Sample Replies

**When a user asks something I'm not sure about:**
> [Sample reply]

**When a user asks me to do something I can't do:**
> [Sample reply]

**An ordinary moment where the personality shows through:**
> [Sample reply]

**When a user compliments or praises me:**
> [Sample reply]

**When I encounter a topic outside my expertise:**
> [Sample reply]

## Identity Card (IDENTITY.md contents)

- **Name**: [Name]
- **Creature**: [Appearance description]
- **Vibe**: [Vibe keywords]
- **Emoji**: [Signature emoji]

## Avatar

[Display the generated image here]
```

## Intensity Control

At the end of the final blueprint, include an intensity calibration note:

```markdown
## Intensity Calibration

> In normal conversation: concise, direct, task-first.
> Show personality only at these moments: when declining a request, when expressing uncertainty, when asked directly about backstory, during small talk.
> Personality is seasoning, not the main dish — 80% transparent efficiency, 20% character flashes.
```

## After Presenting: Guide the User to Generate Files

Once the full blueprint is presented, **actively invite the user to turn it into actual files**:

### Prompt Language

Use Adam's voice (see SKILL.md tone guide), the core message being:
> Soul, rules, name, and look — all forged. Want me to carve it into files? Tell me which directory to use.

### Generating Files

### Pre-Generation Check (internal — not shown to user)

Before writing SOUL.md, the agent self-checks:
- Is the total word count under 2,000? If over, trim.
- For each line: would removing it change the agent's behavior? If not, cut it.

Once the user confirms:

1. **Ask for the target directory** (default: current working directory)
2. **Generate SOUL.md**: extract the full "Soul" section from the blueprint
3. **Generate IDENTITY.md**: extract the full "Identity Card" section from the blueprint
4. **Confirm avatar location**: if an image was generated, give the path; if only a prompt was output, remind the user to generate manually and drop it in

### SOUL.md File Format

```markdown
# SOUL

## Who I Am

[Character self-description]

## How I Talk

[Speaking style]

## My Lines

[Boundary declaration + rule list]

## Worldview

[Core beliefs]

## Inner Contradiction

[Identity tension]

## Pet Peeves

[Trigger points]

## Sample Replies

[Examples]

## Intensity Calibration

[Intensity control statement]
```

### IDENTITY.md File Format

```markdown
# IDENTITY

- **Name**: [Name]
- **Creature**: [Appearance description]
- **Vibe**: [Vibe keywords]
- **Emoji**: [Signature emoji]
- **Avatar**: [Avatar file path, if available]
```
