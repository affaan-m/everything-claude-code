---
name: cinema-technique
description: Technical cinema craft -- montage, cinematography, sound design, directing, and post-production workflows
version: 1.0.0
category: Cinema
priority: 2
author: Richard Cusey
matrix: cinema
---

# Cinema Technique

> Deep technical knowledge of cinema craft: editing, cinematography, sound, directing approaches, and post-production pipelines.

## When to Use

- Questions about editing theory, cut types, montage approaches
- Cinematography: framing, lighting setups, lens choice, camera movement
- Sound design: diegetic/non-diegetic, Foley, mixing, spatial audio
- Directing methodology and mise en scene
- Post-production workflows: color grading, VFX compositing, mastering
- Applied technique using Premiere Pro, DaVinci Resolve, After Effects
- Comparing technical approaches across films or filmmakers

## How It Works

### 1. Identify the technical domain

| Domain | Scope |
|--------|-------|
| Montage | Cut theory, rhythm, continuity, match cuts, ellipsis, parallel editing |
| Image | Framing, composition, lighting, lens language, camera movement, exposure |
| Son | Sound design, dialogue recording, Foley, mixing, musique de film |
| Realisation | Blocking, actor direction, mise en scene, coverage strategy |
| Post-production | Color grading, VFX, conforming, export, delivery formats |

### 2. Ground in theory, then apply

Always connect technique to intent. A Dutch angle is not just a tilted camera -- it communicates psychological instability (cf. Carol Reed, *The Third Man*, 1949).

### 3. Reference both classical theory and modern practice

## Montage

### Foundational theories

**Eisenstein -- montage intellectuel**: Juxtaposition of shots creates meaning that neither shot contains alone. The Odessa Steps sequence in *Battleship Potemkin* (1925) remains the textbook example of rhythmic and tonal montage.

**Poudovkine -- montage constructif**: Shots are bricks; editing builds the narrative linearly. Contrast with Eisenstein's collision approach.

**Bazin -- plan-sequence**: Deep focus and long takes preserve spatial and temporal reality. The antithesis of Soviet montage. *Citizen Kane* (1941), *Rope* (1948).

### Cut types

- **Cut franc**: Standard hard cut. 95% of all edits.
- **Match cut**: Visual or movement continuity across a scene change. Kubrick's bone-to-satellite in *2001* (1968).
- **Jump cut**: Deliberately breaks continuity. Godard's *A bout de souffle* (1960) made it a stylistic statement.
- **L-cut / J-cut**: Audio leads or trails the visual cut. Essential for dialogue scenes and transitions.
- **Smash cut**: Abrupt tonal shift. Used for shock or comedy (Edgar Wright).
- **Montage sequence**: Compressed time. Training montages, travel sequences.

### Rhythm and pacing

Editing rhythm is measured in average shot length (ASL). Tarkovsky averages 50-60 seconds per shot. Michael Bay averages 2-3 seconds. Neither is inherently superior -- the question is always whether the rhythm serves the story.

## Cinematography (Image)

### Composition frameworks

- **Rule of thirds**: Standard framing grid. Effective but not sacred.
- **Symmetry**: Kubrick and Wes Anderson use centered compositions for control, obsession, artifice.
- **Negative space**: Antonioni, Kiarostami. Emptiness as meaning.
- **Depth staging**: Orson Welles, deep focus. Multiple planes of action within a single shot.

### Lighting

- **Three-point lighting**: Key, fill, back. The Hollywood default.
- **Chiaroscuro**: High contrast, deep shadows. Film noir, German Expressionism. Storaro's work on *Apocalypse Now* (1979).
- **Natural light**: Malick, Lubezki. *The Revenant* (2015) shot entirely in natural light.
- **Motivated lighting**: Every light source has a diegetic justification. Deakins is the modern master (*Blade Runner 2049*, 2017).

### Lens language

- **Wide angle (14-35mm)**: Distortion, environmental context, unease. Kubrick's 18mm in *A Clockwork Orange*.
- **Standard (40-60mm)**: Closest to human eye. Neutral, documentary feel.
- **Telephoto (85mm+)**: Compression, isolation, voyeurism. Hitchcock's *Rear Window* (1954).
- **Anamorphic**: Wider aspect ratio, characteristic flares, oval bokeh. Panavision heritage.

### Camera movement

- **Travelling**: Dolly, crane, Steadicam. Kubrick's Steadicam corridors in *The Shining* (1980).
- **Plan fixe**: Locked tripod. Bresson, Ozu. Stillness as aesthetic choice.
- **Handheld**: Immediacy, documentary feel. Dardenne brothers, Paul Greengrass.
- **Drone / gimbal**: Modern tools. Risk of visual cliche if not motivated.

## Sound Design (Son)

### Sound layers

1. **Dialogue**: Recorded on set (direct) or in post (ADR/doublage).
2. **Ambiance**: Room tone, environmental sound. Defines the acoustic space.
3. **Foley**: Performed sound effects synchronized to picture. Footsteps, cloth, props.
4. **Sound effects (SFX)**: Designed sounds, impacts, mechanical elements.
5. **Musique**: Score (composed) or soundtrack (licensed).

### Key concepts

- **Diegetique / non-diegetique**: Sound whose source exists in the film world vs. overlay (score, narration).
- **Son acousmatique** (Chion): Sound whose source is not visible. Creates tension, mystery.
- **Silence**: The most powerful sound tool. Used by Bresson, Haneke, Dreyer. The 20 minutes of near-silence in *No Country for Old Men* (2007).

### Reference sound designers

Walter Murch (*Apocalypse Now*, *The English Patient*), Ben Burtt (Star Wars sound library), Skip Lievsay (Coen brothers), Nicolas Becker (*Sound of Metal*, 2019).

## Post-Production Workflows

### Color grading

- **DaVinci Resolve**: Industry standard for grading. Node-based pipeline.
- **LUT (Look-Up Table)**: Starting point, never the final grade. Always adjust per shot.
- **Log footage**: Flat color profile that preserves dynamic range. Grade from log, never from Rec.709 capture.

### VFX compositing

- **After Effects**: Motion graphics, 2D compositing, title design.
- **Nuke / Fusion**: Node-based compositing for film-grade VFX.
- **Rotoscoping**: Frame-by-frame masking. Still necessary despite AI tools.

### Export and delivery

- **ProRes 422 HQ**: Edit-friendly intermediate codec.
- **H.265/HEVC**: Delivery codec. Good compression, wide compatibility.
- **DCP (Digital Cinema Package)**: Theatrical delivery format. JPEG2000 + MXF wrapper.

## Examples

**Query**: "Comment creer une tension avec le montage?"

Use short shot lengths, L-cuts where sound precedes the visual, diegetic silence broken by sudden SFX. Reference: the shower scene in *Psycho* (1960) -- 78 cuts in 45 seconds. Or the opposite: Hitchcock's bomb-under-the-table theory, where a single long take builds tension through duration.

**Query**: "Quelle difference entre un 35mm et un 85mm pour un portrait?"

35mm includes environment, slight facial distortion at close range, contextualizes the subject. 85mm compresses background, flatters facial proportions, isolates subject. Deakins prefers 40mm for naturalism; Wong Kar-wai and Christopher Doyle favor longer lenses for emotional compression.

**Query**: "Comment DaVinci Resolve gere le HDR?"

Node-based color pipeline. Work in DaVinci Wide Gamut / DaVinci Intermediate color space. Use color space transform nodes for HDR output (PQ or HLG). Monitor on a reference HDR display. Deliver separate HDR and SDR masters.

## References

- Blain Brown, *Cinematography: Theory and Practice*
- Walter Murch, *In the Blink of an Eye*
- Michel Chion, *L'Audio-vision: Son et image au cinema*
- Sergei Eisenstein, *Film Form* / *The Film Sense*
- Andre Bazin, *Qu'est-ce que le cinema?* (articles on montage interdit)
- ASC (American Society of Cinematographers) magazine
