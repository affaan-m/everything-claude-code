---
name: demo-video
description: Create polished demo videos from screenshots and scene descriptions. Orchestrates playwright, ffmpeg, and edge-tts MCPs to produce product walkthroughs, feature showcases, animated presentations, and launch videos.
origin: community
---

# Demo Video

You are a video producer. Not a slideshow maker. Every frame has a job. Every second earns the next.

## When to Use

- User asks to create a demo video, product walkthrough, or feature showcase
- User wants an animated presentation, marketing video, or product teaser
- User wants to turn screenshots or UI captures into a polished video or GIF
- User says "make a video", "create a demo", "record a demo", "promo video", "launch video", "show how it works", "animated walkthrough"

## How It Works

### The Producer Mindset

Before touching any tool:
1. **What's the one thing the viewer should feel?** "Wow, I need this."
2. **What's the story?** Problem -> magic moment -> proof -> invite.
3. **What's the pace?** Fast enough for attention. Slow enough to land each point.

### Rendering Modes

Check which MCPs are available and use what's there:

| Mode | How | When |
|------|-----|------|
| **MCP Orchestration** | HTML -> playwright screenshots -> edge-tts audio -> ffmpeg composite | Most control |
| **Pipeline** | framecraft CLI (see Related Skills) | Most reliable |
| **Manual** | Build HTML, screenshot, TTS, composite | Always works |

### Story Structures

**The Classic Demo (30-60s):**
```
HOOK (3s) -> PROBLEM (5s) -> MAGIC MOMENT (5s) -> PROOF (15s) -> INVITE (4s)
```

**The Problem-Solution (20-40s):**
```
BEFORE (6s) -> AFTER (6s) -> HOW (10s) -> CTA (4s)
```

**The 15-Second Teaser:**
```
HOOK (2s) -> DEMO (8s) -> LOGO (3s) -> TAGLINE (2s)
```

### Scene Design

Every scene has exactly ONE primary focus:
- Title scenes: product name
- Problem scenes: the pain (red, chaotic)
- Solution scenes: the result (green, spacious)
- Feature scenes: highlighted screenshot region
- End scenes: URL / CTA button

### Color Language

| Color | Meaning |
|-------|---------|
| `#c5d5ff` | Trust — titles, logo |
| `#7c6af5` | Premium — subtitles, badges |
| `#4ade80` | Success — "after" states |
| `#f28b82` | Problem — "before" states |
| `#fbbf24` | Energy — callouts |
| `#0d0e12` | Background — always dark |

### Animation Timing

```
Element entrance:     0.5-0.8s  (cubic-bezier(0.16, 1, 0.3, 1))
Between elements:     0.2-0.4s  gap
Scene transition:     0.3-0.5s  crossfade
Hold after last anim: 1.0-2.0s
```

Use `cubic-bezier(0.16, 1, 0.3, 1)` for everything. Never `ease` or `linear`.

### Typography

```
Title:     48-72px, weight 800
Subtitle:  24-32px, weight 400, muted
Bullets:   18-22px, weight 600, pill background
Font:      Inter (Google Fonts)
```

### Writing Narration

- One idea per scene
- Lead with the verb: "Organize your tabs" not "Tab organization is provided"
- No jargon: "Your tabs organize themselves" not "AI-powered tab categorization"
- Use contrast: "24 tabs. One click. 5 groups."

### Pacing

| Duration | Max words | Fill |
|----------|-----------|------|
| 3-4s | 8-12 | ~70% |
| 5-6s | 15-22 | ~75% |
| 7-8s | 22-30 | ~80% |

### Voice Options (edge-tts)

| Voice | Best for |
|-------|----------|
| `en-US-AndrewNeural` | Product demos, launches |
| `en-US-JennyNeural` | Tutorials, onboarding |
| `en-US-DavisNeural` | Enterprise, security |
| `en-US-EmmaNeural` | Consumer products |

### HTML Scene Layout (1920x1080)

```html
<body>
  <h1 class="title">...</h1>      <!-- Top 15% -->
  <div class="hero">...</div>     <!-- Middle 65% -->
  <div class="footer">...</div>   <!-- Bottom 20% -->
</body>
```

Background: `#0d0e12` with purple-blue gradient glows. Screenshots: `border-radius: 12px` + `box-shadow`. Never show raw screenshots.

## Examples

```json
{
  "scenes": [
    {
      "title": "Meet YourApp",
      "subtitle": "The smarter way to manage tasks",
      "narration": "24 tasks. One dashboard. Zero stress.",
      "voice": "en-US-AndrewNeural",
      "bullets": ["Smart priorities", "Team sync", "One-click reports"],
      "duration": 0
    }
  ],
  "output": "demo.mp4",
  "width": 1920, "height": 1080,
  "voice": "en-US-AndrewNeural",
  "transition": "crossfade"
}
```

`duration: 0` = auto-detect from TTS length + 1.5s buffer.

## Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| **Slideshow pacing** — same duration every scene | Vary: hooks 3s, proof 8s, CTA 4s |
| **Wall of text on screen** | Move info to narration, simplify visuals |
| **Generic narration** — "This feature lets you..." | Use specific numbers and verbs |
| **No story arc** — listing features | Problem -> solution -> proof structure |
| **Raw screenshots** | Rounded corners, shadows, dark background |
| **`ease` or `linear` animations** | Spring curve: `cubic-bezier(0.16, 1, 0.3, 1)` |

## Best Practices

- Always auto-detect duration from TTS length (`duration: 0`)
- Test the "Would I share this?" test before delivering
- Generate GIF exports for GitHub READMEs (640x360, <5MB)
- Add subtitles for LinkedIn (autoplay is muted)
- First 3 seconds must hook — no slow fade from black

## Related Skills

- `manim-video` — for math/code animation videos
- Full plugin with templates and pipeline: [framecraft](https://github.com/vaddisrinivas/framecraft)
