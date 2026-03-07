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
- Use modern CSS color: `oklch()`, `color-mix()`, `light-dark()` for perceptually uniform palettes
- Tint neutrals toward your brand hue — even a subtle hint creates subconscious cohesion
- Dominant color with sharp accents outperforms timid, evenly-distributed palettes
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
- Use exponential easing (`ease-out-quart`/`quint`/`expo`) for natural deceleration — NEVER bounce or elastic (dated and tacky)
- One well-orchestrated page load with staggered reveals > scattered micro-interactions
- For height animations, use `grid-template-rows` transitions instead of animating height directly
- Only animate `transform` and `opacity` — never `width`, `height`, `padding`, `margin`
- Use `prefers-reduced-motion` responsibly

### Composition & Layout
- Use asymmetry deliberately — left-aligned text with asymmetric layouts feels more designed than centering everything
- Overlap elements for depth
- Break the grid intentionally for emphasis
- Use varied spacing to create visual rhythm — tight groupings, generous separations
- Use `repeat(auto-fit, minmax(280px, 1fr))` for responsive grids without breakpoints

**The Squint Test**: Blur your eyes at the design. Can you identify the most important element? The second? Clear groupings? If everything looks the same weight, you have a hierarchy problem. Combine 2-3 dimensions (size + weight + space) for strong hierarchy.

### Details & Polish
- Gradients with purpose (not generic purple-to-blue)
- Subtle textures where appropriate (grain, halftone, duotone — not glassmorphism)
- Shadows that feel natural (if you can clearly see it, it's probably too strong)
- Border radius consistency
- Hover states that delight
- See [polish checklist](reference/polish-checklist.md) for final-pass quality checks

### UX Writing
- Every word must earn its place — if it doesn't add clarity, cut it
- Button labels: verb + noun ("Save changes", "Create account"), NEVER "OK", "Submit", "Yes"
- Error messages: what happened + why + how to fix ("Email needs an @ symbol", not "Invalid input")
- Empty states are onboarding moments, not dead ends
- See [UX writing reference](reference/ux-writing.md) for full patterns

## Component Vocabulary

Use precise component names. "Add a dropdown" produces generic output. "Add a combobox with typeahead" produces professional output. Reference: [component.gallery](https://component.gallery/)

### Selection & Input

| Component | Use When | NOT When |
|-----------|----------|----------|
| **Select** | Fixed list of 5-15 options | User needs to type/filter |
| **Combobox** | Filterable list, typeahead, autocomplete | Simple yes/no or <5 options |
| **Segmented control** | 2-5 mutually exclusive modes (view toggles) | >5 options |
| **Radio group** | Mutually exclusive choices shown all at once | Too many options to display |
| **Checkbox group** | Multi-select from visible options | Single on/off toggle |
| **Toggle/Switch** | Binary on/off with immediate effect | Requires form submission |
| **Slider** | Numeric range selection | Precise number entry needed |
| **Date picker** | Calendar-based date selection | Free-form date entry |
| **Color picker** | Visual color selection | Hex input sufficient |
| **Rating** | Star/score input (reviews, feedback) | Binary like/dislike |
| **File upload** | Drag-and-drop zone with preview | Simple file input |
| **Rich text editor** | Formatted content authoring | Plain text input |

### Navigation & Wayfinding

| Component | Use When | NOT When |
|-----------|----------|----------|
| **Tabs** | Switch between peer content panels | Hierarchical navigation |
| **Breadcrumbs** | Show location in hierarchy, enable backtracking | Flat site structure |
| **Sidebar navigation** | App with 5+ top-level sections | Simple marketing page |
| **Command palette / Spotlight** | Power-user keyboard-first search + actions | Browsing-oriented UI |
| **Stepper** | Multi-step linear process (wizards, checkout) | Non-linear navigation |
| **Pagination** | Large dataset split into pages | Infinite scroll appropriate |
| **Skip link** | Accessibility: skip to main content | Never skip this one |

### Feedback & Overlay

| Component | Use When | NOT When |
|-----------|----------|----------|
| **Modal/Dialog** | Blocking action requiring confirmation | Informational content |
| **Drawer** | Supplementary content, filters, side panels | Critical confirmation |
| **Popover** | Contextual info anchored to a trigger element | Standalone content |
| **Tooltip** | Brief hover hint, label clarification | Interactive content inside |
| **Toast** | Transient success/error feedback, auto-dismiss | Action required from user |
| **Alert/Banner** | Persistent important message | Transient feedback |
| **Empty state** | No data to display yet | Error state |
| **Skeleton** | Content loading, preserving layout shape | Indeterminate spinner |
| **Progress bar** | Determinate progress (upload, step completion) | Unknown duration |
| **Spinner** | Indeterminate loading, short wait | Long operations (use skeleton) |

### Data Display

| Component | Use When | NOT When |
|-----------|----------|----------|
| **Table** | Structured rows + columns, sortable/filterable | <3 columns or mobile-primary |
| **List** | Sequential items, single column | Multi-dimensional data |
| **Card** | Self-contained content units with actions | Wrapping everything (AI cliche) |
| **Accordion** | Collapsible sections, FAQ, dense content | All sections must be visible |
| **Tree view** | Hierarchical nested data (file explorer) | Flat data |
| **Avatar** | User/entity representation | Decorative images |
| **Badge** | Status indicators, counts, labels | Long text content |
| **Carousel** | Browsing images/cards in limited space | Critical content (users skip) |

### Layout Patterns

| Pattern | Use When |
|---------|----------|
| **Bento grid** | Mixed-size feature showcase, dashboard widgets |
| **Masonry** | Variable-height content (Pinterest-style) |
| **Split pane** | Side-by-side comparison, editor + preview |
| **Dashboard shell** | App chrome: sidebar + header + content area |
| **Sticky header** | Navigation must remain visible on scroll |
| **Hero section** | Landing page primary message (avoid AI cliche layout) |
| **Sidebar + content** | App layout with persistent navigation |
| **Full-bleed** | Edge-to-edge visual impact sections |

## AI Tells Blocklist

These patterns instantly mark output as AI-generated. NEVER use them.

**The AI Slop Test**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

**Color & Visual**
- Purple-to-blue gradients ("AI purple"), cyan-on-dark, neon accents on dark backgrounds
- Pure black `#000` or pure white `#fff` — always tint (pure black/white never appears in nature)
- Gradient text on headings or metrics — decorative rather than meaningful
- Gray text on colored backgrounds — use a shade of the background color instead
- Glassmorphism everywhere — blur effects, glass cards, glow borders used decoratively
- Dark mode as the default with glowing accents — looks "cool" without requiring actual design decisions
- Generic shadcn/ui defaults without customization

**Typography**
- Inter, Roboto, Arial, Open Sans, or system defaults (use Geist, Outfit, Cabinet Grotesk, or project-specific choices)
- Monospace typography as lazy shorthand for "technical/developer" vibes
- Oversized hero H1s with no typographic scale backing them

**Layout**
- Cards wrapping everything — use spacing and alignment for grouping; cards only when content is truly distinct and actionable
- Cards nested inside cards — flatten the hierarchy with spacing, typography, and dividers
- Centered hero + 3-card grid below it (the #1 AI layout cliche)
- Identical card grids — same-sized cards with icon + heading + text, repeated endlessly
- Hero metric layout — big number, small label, supporting stats, gradient accent
- Large icons with rounded corners above every heading — they rarely add value
- Centering everything — left-aligned text with asymmetric layouts feels more designed
- Rounded rectangles with generic drop shadows — safe, forgettable
- Same spacing everywhere — without rhythm, layouts feel monotonous

**Content & Copy**
- Placeholder names: "Jane Doe", "John Smith", "Acme Corp", "Nexus", "TechFlow"
- Filler copy: "Elevate", "Seamless", "Revolutionize", "Supercharge", "Unlock the power of"
- Suspiciously round numbers: `99.99%`, `10x faster`, `$9.99/mo`
- Broken or placeholder Unsplash URLs
- Redundant headers restating the intro text
- Repeating information users can already see
- See [UX writing reference](reference/ux-writing.md) for copy best practices

**Interaction**
- Bounce/elastic easing — dated and tacky; use ease-out-quart/quint/expo
- Hover effects that only change opacity
- Modals for everything — use inline expansion, drawers, or popovers first
- Making every button primary — use ghost buttons, text links, secondary styles; hierarchy matters
- Sparklines as decoration — tiny charts that look sophisticated but convey nothing

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
