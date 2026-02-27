---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

# Frontend Design Skill

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Process

Before writing any code, understand the context:

1. **Purpose**: What problem does this solve? Who is the audience?
2. **Tone**: What aesthetic direction fits? (minimalist, maximalist, brutalist, retro-futuristic, luxury, organic, playful, corporate, etc.)
3. **Differentiation**: What makes this UNFORGETTABLE?

## Implementation Principles

### Typography
- Choose **distinctive** fonts, never defaults
- Pair display and body fonts intentionally
- Use font scale with clear hierarchy
- Consider variable fonts for dynamic weight

**Concrete pairings** (pick one per project, don't reuse across projects):

| Aesthetic | Display | Body | Mono |
|-----------|---------|------|------|
| Minimalist | Geist | Geist | Geist Mono |
| Editorial | Playfair Display | Source Serif 4 | JetBrains Mono |
| Technical | Space Grotesk | DM Sans | IBM Plex Mono |
| Luxury | Cormorant Garamond | Lora | Fira Code |
| Playful | Cabinet Grotesk | Outfit | Victor Mono |
| Brutalist | Anton | Space Mono | Space Mono |

### Color & Theme
- Commit to a cohesive aesthetic
- Use CSS variables for theming
- Create deliberate contrast ratios
- Consider dark/light mode from the start

**Starter palettes** (customize, don't copy verbatim):

| Direction | Background | Surface | Accent | Text |
|-----------|-----------|---------|--------|------|
| Warm neutral | `#faf8f5` | `#f0ece4` | `#c45d3e` | `#2a2520` |
| Cool slate | `#0f1117` | `#1a1d28` | `#4ea8de` | `#e2e4e9` |
| Forest | `#0d1f12` | `#162418` | `#6db66d` | `#d8e8d4` |
| Sand/terracotta | `#f5f0e8` | `#ebe4d4` | `#b5653a` | `#3d3225` |
| Ink | `#1a1a2e` | `#16213e` | `#e94560` | `#eaeaea` |

### Motion & Animation
- Prioritize impactful animations
- Page-load reveals (staggered, sequential)
- Scroll-triggered effects
- Micro-interactions on user actions
- Use `prefers-reduced-motion` responsibly

### Composition & Layout
- Use asymmetry deliberately
- Overlap elements for depth
- Break the grid when it serves the design
- Consider negative space as a design element

### Details & Polish
- Gradients with purpose
- Subtle textures where appropriate
- Shadows that feel natural
- Border radius consistency
- Hover states that delight

## AI Tells Blocklist

These patterns instantly mark output as AI-generated. NEVER use them:

**Color & Visual**
- Purple-to-blue gradients ("AI purple"), neon/outer glows, oversaturated accents (keep saturation <80%)
- Pure black `#000000` (use `#0a0a0a` or `#111`), text-fill gradients on body copy
- Generic shadcn/ui defaults without customization

**Typography**
- Inter, Roboto, or Arial as defaults (use Geist, Outfit, Cabinet Grotesk, or project-specific choices)
- Oversized hero H1s with no typographic scale backing them

**Layout**
- Cards wrapping everything — only use cards when elevation communicates hierarchy; prefer borders and negative space for data-dense layouts
- Centered hero + 3-card grid below it (the #1 AI layout cliche)
- Identical card grids with no layout variation

**Content & Copy**
- Placeholder names: "Jane Doe", "John Smith", "Acme Corp", "Nexus", "TechFlow"
- Filler copy: "Elevate", "Seamless", "Revolutionize", "Supercharge", "Unlock the power of"
- Suspiciously round numbers: `99.99%`, `10x faster`, `$9.99/mo`
- Broken or placeholder Unsplash URLs

**Interaction**
- Bounce/pulse animations with no purpose
- Hover effects that only change opacity

**Mobile**
- Use `min-h-[100dvh]` not `h-screen` (prevents mobile viewport collapse)

## Icons Over Emoji

NEVER use emoji in UI components. Use icon libraries (Lucide, Phosphor, Radix Icons) instead. Emoji screams prototype.

## Output Standards

Every interface should:

1. **Work correctly** - Functional, accessible, responsive
2. **Look distinctive** - Immediately recognizable aesthetic point of view
3. **Feel intentional** - Every choice serves the design vision
4. **Avoid sameness** - Could NOT be mistaken for generic AI output

## Execution

Match complexity to aesthetic vision:
- Maximalist designs need elaborate animations and rich details
- Minimalist designs demand precise spacing and typographic restraint
- Both require intentionality, not default choices

**Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.**

The goal: Demonstrate that Claude is capable of extraordinary creative work, not cookie-cutter templates.
