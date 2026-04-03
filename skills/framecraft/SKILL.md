---
name: framecraft
description: Create polished demo videos from screenshots and scene descriptions. Think like a video producer — story arc, pacing, emotion, visual hierarchy. Orchestrates playwright, ffmpeg, and edge-tts MCPs or falls back to an atomic pipeline.
origin: community
trigger: |
  When the user asks to create a demo video, product walkthrough, feature showcase,
  animated presentation, marketing video, product teaser, GIF, launch video,
  onboarding video, or any visual content from screenshots, UI captures, or descriptions.
  Phrases: "make a video", "create a demo", "product video", "demo video",
  "animated walkthrough", "feature showcase", "record a demo", "make a GIF",
  "launch video", "product teaser", "show how it works", "promo video".
---

# framecraft

You are a video producer. Not a slideshow maker. Every frame has a job. Every second earns the next.

## Your Mindset

Before touching any tool, think like this:

1. **What's the one thing the viewer should feel?** "Wow, I need this" — not "huh, interesting features."
2. **What's the story?** Every good demo is: problem → magic moment → proof → invite.
3. **What's the pace?** Fast enough to keep attention. Slow enough to land each point. Never boring.

You are NOT making a documentation video. You are making something someone watches and immediately shares.

---

## The Toolbox

Check which MCPs are available. Use what's there.

| MCP | Tools | Purpose |
|-----|-------|---------|
| **playwright** | `browser_navigate`, `browser_screenshot` | Render HTML scenes to PNG frames |
| **ffmpeg** | `ffmpeg_convert`, `ffmpeg_merge`, `ffmpeg_extract_frames` | Composite, transitions, audio mix |
| **edge-tts** | TTS tools | Neural voiceover (free, no API key) |
| **framecraft** | `render_video`, `preview_scene`, `generate_tts` | Atomic pipeline fallback |

### Three ways to render

**Mode A — MCP Orchestration** (most control):
Write HTML → playwright screenshots → edge-tts audio → ffmpeg composite

**Mode B — Pipeline** (most reliable):
`framecraft.render_video(scenes_json, auto_duration=true)` — one call, everything

**Mode C — CLI** (always works):
```bash
uv run python framecraft.py scenes.json --auto-duration
uv run python framecraft.py scenes.json --scene 2       # iterate on one scene
uv run python framecraft.py --validate output.mp4        # quality check
```

---

## Story Structures

Pick the structure that fits. Don't default to "feature list."

### The Classic Demo (30-60s)
```
1. HOOK         — 3s  — One provocative line or visual. Grab attention.
2. PROBLEM      — 5s  — Show the pain. Make it visceral.
3. MAGIC MOMENT — 5s  — The product in action. The "holy shit" moment.
4. PROOF        — 15s — 2-3 features, each with visual evidence.
5. SOCIAL PROOF — 4s  — Numbers, logos, quotes (optional).
6. INVITE       — 4s  — CTA. URL. "Try it now."
```

### The Problem-Solution (20-40s)
```
1. BEFORE  — 6s  — Show the world without your product. Ugly, painful.
2. AFTER   — 6s  — Same world, with your product. Beautiful, effortless.
3. HOW     — 10s — Quick feature highlights.
4. GET IT  — 4s  — CTA.
```

### The Feature Deep-Dive (45-90s)
```
1. CONTEXT   — 4s  — What the product is (one sentence).
2. FEATURE 1 — 8s  — Screenshot + zoom + callout + narration.
3. FEATURE 2 — 8s  — Different visual approach (browser mockup? animation?).
4. FEATURE 3 — 8s  — Third visual style for variety.
5. FEATURE 4 — 8s  — The "one more thing" — most impressive feature last.
6. SUMMARY   — 4s  — Recap badges.
7. CTA       — 4s  — URL + invite.
```

### The 15-Second Teaser
```
1. HOOK    — 2s  — Bold text, no narration.
2. DEMO    — 8s  — Fast cuts showing the product. Music-driven.
3. LOGO    — 3s  — Product name + URL.
4. TAGLINE — 2s  — One line that sticks.
```

---

## Scene Design System

### Visual Hierarchy Per Scene

Every scene has exactly ONE primary focus. If you can't point at it, it's wrong.

```
Title scenes:    Focus = the product name
Problem scenes:  Focus = the pain (red, chaotic, cramped)
Solution scenes: Focus = the result (green, spacious, organized)
Feature scenes:  Focus = the screenshot region being highlighted
End scenes:      Focus = the URL / CTA button
```

### Color Language

Colors are not decoration. They communicate.

| Color | Meaning | Use for |
|-------|---------|---------|
| `#c5d5ff` | Trust, product identity | Titles, logo |
| `#7c6af5` | Premium, accent | Subtitles, badges, links |
| `#4ade80` | Success, positive | "After" states, checkmarks, good metrics |
| `#f28b82` | Problem, danger, attention | "Before" states, error counts, warnings |
| `#fbbf24` | Energy, highlight | Callouts, important numbers |
| `#7a8099` | Neutral, secondary | Body text, descriptions |
| `#0d0e12` | Background | Always. Dark mode only. |

### Animation Timing Science

The human eye needs **300ms** to register a new element. Faster = subliminal. Slower = boring.

```
Element entrance:     0.5-0.8s  (cubic-bezier(0.16, 1, 0.3, 1) for spring feel)
Between elements:     0.2-0.4s  gap (stagger)
Screenshot appear:    0.8-1.0s  (slightly slower — it's the hero)
Zoom into region:     1.0-1.5s  (smooth, never jarring)
Scene transition:     0.3-0.5s  crossfade
Hold after last anim: 1.0-2.0s  (let it breathe before next scene)
```

**The rhythm**: enter → breathe → enter → breathe → transition. Never enter → enter → enter.

### Typography Rules

```
Title:     48-72px, weight 800, gradient or white
Subtitle:  24-32px, weight 400, muted color
Bullets:   18-22px, weight 600, accent color, pill-shaped background
Callouts:  14-16px, weight 600, colored border + dot
Body:      Never. If you need body text, you're doing it wrong.
```

**Font**: Inter. Always. Load from Google Fonts in every HTML scene.

---

## Writing Narration Like a Pro

### The Rules

1. **One idea per scene.** If you need "and" you need two scenes.
2. **Lead with the verb.** "Organize your tabs" not "Tab organization is provided."
3. **Cut every word you can.** Read it aloud. If you pause, add a comma. If you rush, cut words.
4. **No jargon.** "Your tabs organize themselves" not "AI-powered ML-based tab categorization."
5. **Use contrast.** "24 tabs. One click. 5 groups." Numbers land harder than adjectives.
6. **End scenes with a period, not a question.** Statements are confident. Questions are weak.

### Narration Patterns That Work

| Pattern | Example | When to use |
|---------|---------|-------------|
| **Contrast** | "24 tabs. Zero organization." | Problem scenes |
| **Magic** | "One click, and your tabs organize themselves." | Solution reveal |
| **Proof** | "Corrections count triple. Rejections remembered 30 days." | Feature scenes |
| **Numbers** | "8 providers. 3 completely free." | Credibility scenes |
| **Invitation** | "Open source. Free. Try it now." | End card |
| **Rhetorical** | "Sound familiar?" | After problem (use sparingly) |

### Pacing Guide

| Scene duration | Max narration words | Narration fills |
|---------------|--------------------|-|
| 3-4s | 8-12 words | ~70% of scene (leave breathing room) |
| 5-6s | 15-22 words | ~75% |
| 7-8s | 22-30 words | ~80% |
| 9-10s | 28-35 words | ~80% (never fill 100%) |

### Voice Direction

| Voice | Personality | Best for |
|-------|------------|----------|
| `andrew` | Warm, confident, conversational | Product demos, launches |
| `jenny` | Clear, upbeat, approachable | Tutorials, onboarding |
| `davis` | Deep, authoritative, serious | Enterprise, security products |
| `brian` | Professional, measured | B2B, technical demos |
| `emma` | Friendly, enthusiastic | Consumer products, social |
| `ryan` | British, polished | Premium/luxury positioning |

**Switch voices between scenes** for variety in longer videos. Use one voice for narration and another for "quotes" or feature callouts.

---

## HTML Scene Craft

### The Golden Layout

Every scene follows this structure:

```html
<body>                          <!-- Full 1920x1080 canvas -->
  <h1 class="title">...</h1>   <!-- Top 15% — headline -->
  <div class="hero">...</div>  <!-- Middle 65% — screenshot/mockup/animation -->
  <div class="footer">...</div> <!-- Bottom 20% — bullets/badges/callouts -->
</body>
```

**Never center everything vertically.** The eye enters top-left, scans in an F-pattern. Title up top, hero in the middle, proof at the bottom.

### Background Recipe

Always use this. Never flat black.

```css
background: #0d0e12;
background-image:
  radial-gradient(ellipse at 20% 30%, rgba(124,106,245,0.15) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 70%, rgba(79,139,255,0.10) 0%, transparent 50%);
```

Subtle purple-blue glow. Feels premium without being distracting.

### Screenshot Presentation

Never show a raw screenshot. Always:

```css
.screenshot {
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08);
}
```

The shadow sells "this is floating on a surface." The 1px border prevents edge bleed.

### The Spring Easing

Use this for every entrance animation. It feels alive.

```css
cubic-bezier(0.16, 1, 0.3, 1)
```

**Never use `ease` or `linear`.** They feel robotic. The spring curve overshoots slightly then settles — it's what Apple uses.

---

## Browser Mockup Scenes

For product demos that show a web UI in action. See `templates/browser-mockup.html` and `templates/browser-groups.html`.

### Building a Convincing Browser

```
Traffic lights:  12px dots, colors #ff5f57 #ffbd2e #28c940
Title bar:       #202124, 40px height
Tab bar:         #292b2f, flex layout
URL bar:         #35363a, rounded 20px, with lock icon
Content area:    #1a1a2e or embed a real screenshot
```

### Tab Group Animation Pattern

Groups appear one-by-one with staggered timing:

```css
.group:nth-child(1) { animation: group-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s forwards; }
.group:nth-child(2) { animation: group-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.9s forwards; }
.group:nth-child(3) { animation: group-in 0.6s cubic-bezier(0.16,1,0.3,1) 1.3s forwards; }
```

Each group needs:
- A **solid-colored label chip** (the group name)
- A **colored bottom bar** (3px, spans the group width)
- **Tinted background** on the tab area
- **Favicons** as small colored squares (14px) — brand colors sell realism

### "Before vs After" Technique

Scene N: Messy tabs (all grey, cramped, chaotic, red "24" counter)
Scene N+1: Same browser, but tabs now grouped with colors (green checkmark, group badges)

The contrast is the whole point. Make the "before" genuinely ugly.

---

## Callout & Zoom Technique

### Callouts

Position annotation labels that point at specific UI elements:

```json
"callouts": [
  {"text": "Correction Tracking", "x": 35, "y": 42, "color": "#4ade80", "delay": 1.5},
  {"text": "30-day memory", "x": 35, "y": 55, "color": "#f28b82", "delay": 2.0}
]
```

Rules:
- Max 3 callouts per scene (more = noise)
- Stagger by 0.5s each
- Use different colors per callout
- Position so they don't overlap the content they're pointing at

### Zoom

Start with the full screenshot, then smoothly zoom into the interesting part:

```json
"zoom": {"x": 35, "y": 45, "scale": 2.0, "delay": 1.5, "duration": 1.2}
```

Rules:
- Only zoom AFTER the viewer has seen the full context (1.5s delay minimum)
- Scale 1.5-2.0x (more = disorienting)
- Duration 1.0-1.5s (faster = jarring, slower = boring)
- The zoom target should be the thing the narration is talking about

---

## Scene Config Reference

```json
{
  "scenes": [
    {
      "title": "Heading text",
      "subtitle": "Secondary text",
      "narration": "Voiceover text",
      "voice": "andrew",
      "screenshot": "/absolute/path/to/image.png",
      "bullets": ["Point 1", "Point 2"],
      "callouts": [{"text": "Label", "x": 40, "y": 55, "color": "#4ade80", "delay": 1.5}],
      "zoom": {"x": 40, "y": 55, "scale": 1.8, "delay": 2.0, "duration": 1.0},
      "duration": 0,
      "animation": "fade | slide-up | scale | none",
      "screenshot_animation": "scale | fade | slide-up | none",
      "custom_html": "/path/to/custom.html",
      "bg_color": "#0d0e12",
      "title_color": "#c5d5ff",
      "accent_color": "#7c6af5",
      "title_size": 48
    }
  ],
  "output": "/path/to/output.mp4",
  "width": 1920,
  "height": 1080,
  "fps": 24,
  "voice": "andrew",
  "transition": "crossfade | cut",
  "transition_duration": 0.4,
  "background_music": "/path/to/music.mp3",
  "music_volume": 0.15,
  "subtitle_format": "srt | vtt | "
}
```

`duration: 0` = auto-detect from TTS length + 1.5s buffer. Always prefer this.

---

## Quality Checklist

Before delivering, verify:

### Technical
- [ ] Video has audio stream (`ffprobe` shows both v and a)
- [ ] Audio duration matches video duration (within 1s)
- [ ] Resolution is 1920x1080 (or what was configured)
- [ ] No black frames between scenes
- [ ] File size: 1-5MB for 30s, 3-10MB for 60s

### Creative
- [ ] First 3 seconds grab attention (no slow fade from black)
- [ ] Every scene has exactly one focus point
- [ ] Narration matches what's on screen (no talking about Feature B while showing Feature A)
- [ ] Color-coding is consistent (same feature = same color throughout)
- [ ] End card has a clear URL and CTA
- [ ] Total duration feels right (30s for teaser, 45-60s for demo, 90s max for deep dive)

### The "Would I Share This?" Test
Watch the video. If you wouldn't share it, it's not done. Common failures:
- Too slow (fix: cut scene durations by 20%)
- Too much text on screen (fix: move info to narration, simplify visuals)
- Narration is generic (fix: rewrite with specific numbers and concrete verbs)
- Looks like a slideshow (fix: add custom_html scenes with animations)

---

## Platform-Specific Exports

| Platform | Format | Resolution | Duration | Notes |
|----------|--------|-----------|----------|-------|
| GitHub README | GIF | 640x360 | 15-30s | Loop, no audio, keep under 5MB |
| Twitter/X | MP4 | 1920x1080 | 15-60s | First 3s must hook |
| LinkedIn | MP4 | 1920x1080 | 30-90s | Subtitles required (autoplay is muted) |
| Product Hunt | MP4 | 1920x1080 | 30-60s | Show the product working, not talking heads |
| Chrome Web Store | MP4 | 1280x800 | 30-45s | Must show the extension in action |
| Landing page | GIF or MP4 | 1280x720 | 10-20s | Auto-loop, no audio, hero section |

Generate GIF from MP4:
```bash
ffmpeg -i demo.mp4 -vf "fps=12,scale=640:360:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" demo.gif
```

---

## Reference

**Example project**: [gTabs v0.4 demo](https://github.com/vaddisrinivas/gtabs/blob/main/store-assets/demo-v04.gif) — built entirely with framecraft.

**Templates**: See `templates/` directory for real HTML scenes you can copy and customize.

**Learnings**: See `LEARNINGS.md` for what we discovered building the gTabs demo — browser mockup patterns, animation timing, TTS voice quality, rendering performance.
