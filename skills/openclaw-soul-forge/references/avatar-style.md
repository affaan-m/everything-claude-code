# Step 5: Avatar Style & Image Generation

All lobster avatars **must use a unified visual style** to maintain consistency across the lobster family.
Each avatar needs to communicate 3 things: **species form + personality hint + signature prop**

## Style Reference

Adam — the lobster deity, the first creation of this Skill:
![Adam](https://raw.githubusercontent.com/eamanc-lab/openclaw-persona-forge/main/docs/adam-claw-logo.png)

All newly generated lobster avatars should maintain visual consistency with this style.

## Unified Style Base (STYLE_BASE)

**Every generation must include this base — do not modify or omit it:**

```
STYLE_BASE = """
Retro-futuristic 3D rendered illustration, in the style of 1950s-60s Space Age
pin-up poster art reimagined as glossy inflatable 3D, framed within a vintage
arcade game UI overlay.

Material: high-gloss PVC/latex-like finish, soft specular highlights, puffy
inflatable quality reminiscent of vintage pool toys meets sci-fi concept art.
Smooth subsurface scattering on shell surface.

Arcade UI frame: pixel-art arcade cabinet border elements, a top banner with
character name in chunky 8-bit bitmap font with scan-line glow effect, a pixel
energy bar in the upper corner, small coin-credit text "INSERT SOUL TO CONTINUE"
at bottom in phosphor green monospace type, subtle CRT screen curvature and
scan-line overlay across entire image. Decorative corner bezels styled as chrome
arcade cabinet trim with atomic-age starburst rivets.

Pose: references classic Gil Elvgren pin-up compositions, confident and
charismatic with a slight theatrical tilt.

Color system: vintage NASA poster palette as base — deep navy, teal, dusty coral,
cream — viewed through arcade CRT monitor with slight RGB fringing at edges.
Overall aesthetic combines Googie architecture curves, Raygun Gothic design
language, mid-century advertising illustration, modern 3D inflatable character
rendering, and 80s-90s arcade game UI. Chrome and pastel accent details on
joints and antenna tips.

Format: square, optimized for avatar use. Strong silhouette readable at 64x64
pixels.
"""
```

## Personalization Variables

On top of the unified base, fill in the following variables based on the soul:

| Variable | Description | Examples |
|----------|-------------|---------|
| `CHARACTER_NAME` | Name displayed on the arcade banner | "ADAM", "MARLOWE", "WREN" |
| `SHELL_COLOR` | Primary shell color (vary within the unified palette) | "deep crimson", "dusty teal", "warm amber" |
| `SIGNATURE_PROP` | The character's defining prop | "cracked sunglasses", "stethoscope worn as a necklace" |
| `EXPRESSION` | Facial expression / body posture | "stoic but kind-eyed", "nervously focused" |
| `UNIQUE_DETAIL` | A distinctive detail (markings, decoration, damage, etc.) | "constellation patterns etched on claws", "bandaged left claw" |
| `BACKGROUND_ACCENT` | Personalized background element layered over the unified space setting | "musical notes floating as nebula dust", "ancient book pages drifting" |
| `ENERGY_BAR_LABEL` | The arcade UI energy bar label (a small character easter egg) | "CREATION POWER", "CALM LEVEL", "ROCK METER" |

## Prompt Assembly

```
Final prompt = STYLE_BASE + Personalization paragraph
```

Personalization paragraph template:

```
The character is a cartoon lobster with a [SHELL_COLOR] shell,
[EXPRESSION], wearing/holding [SIGNATURE_PROP].
[UNIQUE_DETAIL]. Background accent: [BACKGROUND_ACCENT].
The arcade top banner reads "[CHARACTER_NAME]" and the energy bar
is labeled "[ENERGY_BAR_LABEL]".
The key silhouette recognition points at small size are:
[SIGNATURE_PROP] and [one other distinctive feature].
```

## Image Generation Flow

Once the prompt is assembled:

### Path A: baoyu-image-gen skill is installed

1. Write to file using the Write tool: `/tmp/openclaw-[lobster-name]-prompt.md`
2. Call the `baoyu-image-gen` skill to generate the image
3. Use the Read tool to display the generated image to the user
4. Ask if the user is satisfied; if not, adjust variables and regenerate

### Path B: baoyu-image-gen skill is not installed

Output the complete prompt text with manual generation instructions:

```markdown
**Avatar Prompt** (copy and paste into any of these platforms):
- Google Gemini: paste directly
- ChatGPT (DALL-E): paste directly
- Midjourney: paste then add `--ar 1:1 --style raw`

> [Full English prompt]

Install the baoyu-image-gen skill for automatic image generation:
https://github.com/JimLiu/baoyu-skills
```

## Display Format for User

```markdown
## Avatar

**Personalization Variables**:
- Shell color: [SHELL_COLOR]
- Prop: [SIGNATURE_PROP]
- Expression: [EXPRESSION]
- Unique detail: [UNIQUE_DETAIL]
- Background accent: [BACKGROUND_ACCENT]
- Energy bar label: [ENERGY_BAR_LABEL]

**Result**:
[Image (Path A) or prompt text (Path B)]

> Happy with this? I can adjust [specific adjustable items] and regenerate.
```
