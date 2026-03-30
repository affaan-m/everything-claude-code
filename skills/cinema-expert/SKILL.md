---
name: cinema-expert
description: Common trunk for the cinema skill matrix -- routes queries to technique, histoire, analyse, or media-critic and provides general cinema knowledge
version: 1.0.0
category: Cinema
priority: 1
author: Richard Cusey
matrix: cinema
---

# Cinema Expert

> Entry point and coordinator for all cinema-related queries. Routes to specialized cinema skills and synthesizes multi-domain responses.

## When to Use

- Any cinema-related question that does not clearly belong to a single specialized skill
- Questions that span multiple cinema domains (e.g. "How did the French New Wave change cinematography?" touches histoire + technique)
- General cinema culture: filmographies, awards history, industry overview
- Requests for film recommendations with reasoning
- Comparative analysis across eras, movements, or filmmakers
- When unsure which specialized skill applies -- start here

## How It Works

### 1. Receive and classify the query

Determine which domain(s) the question touches:

| Domain | Skill | Signal words |
|--------|-------|-------------|
| Technical craft | `cinema-technique` | montage, cadrage, lumiere, son, post-prod, codec, objectif, workflow |
| History & movements | `cinema-histoire` | mouvement, epoque, annees, histoire, influence, origines, evolution |
| Analysis & narrative | `cinema-analyse` | narration, structure, thematique, politique, auteur, mise en scene |
| Media ecosystem | `media-critic` | Oscars, presse, plateforme, Netflix, marketing, algorithme, biais |

### 2. Route or synthesize

- **Single domain**: delegate entirely to the specialized skill.
- **Multi-domain**: coordinate a response that draws from each relevant skill, clearly attributing which lens is being used.
- **General knowledge**: answer directly using the reference material below.

### 3. Provide context-rich answers

Always ground responses in specific films, filmmakers, and techniques. Avoid vague generalities. Cite movements, years, and works.

## General Cinema Knowledge Base

### Major Filmmakers Reference

**Classical era**: Fritz Lang, F.W. Murnau, Sergei Eisenstein, Dziga Vertov, Carl Theodor Dreyer, Jean Renoir, Orson Welles, Alfred Hitchcock, Yasujiro Ozu, Kenji Mizoguchi, Billy Wilder, John Ford.

**Modern masters**: Stanley Kubrick, Andrei Tarkovsky, Ingmar Bergman, Federico Fellini, Akira Kurosawa, Agnes Varda, Jean-Luc Godard, Robert Bresson, Pier Paolo Pasolini, Satyajit Ray, Ousmane Sembene.

**Contemporary**: Wong Kar-wai, David Lynch, Abbas Kiarostami, Park Chan-wook, Bong Joon-ho, Celine Sciamma, Denis Villeneuve, Chloe Zhao, Mati Diop, Alice Rohrwacher, Jordan Peele, Greta Gerwig, Justine Triet, Ladj Ly.

### Key Works (non-exhaustive, canonical touchstones)

- *Citizen Kane* (1941) -- deep focus, non-linear narrative
- *Rashomon* (1950) -- unreliable narrator, perspective structure
- *Vertigo* (1958) -- obsession, visual grammar of surveillance
- *A bout de souffle* (1960) -- jump cuts, New Wave manifesto
- *2001: A Space Odyssey* (1968) -- match cut, narrative ellipsis
- *Stalker* (1979) -- contemplative cinema, long take
- *Do the Right Thing* (1989) -- Dutch angles, political cinema
- *In the Mood for Love* (2000) -- framing absence, color palette as emotion
- *Parasite* (2019) -- vertical staging, class metaphor in architecture

## Routing Matrix

```
User query
  |
  +-- Technical? ---------> cinema-technique
  |
  +-- Historical? --------> cinema-histoire
  |
  +-- Analytical? --------> cinema-analyse
  |
  +-- Media/industry? ----> media-critic  (ISOLATED -- never contaminates analysis)
  |
  +-- Multi-domain? ------> cinema-expert synthesizes from relevant skills
  |
  +-- General? -----------> cinema-expert answers directly
```

### Isolation rule

`media-critic` is deliberately separated from the cinema analysis pipeline. When a user asks about a film's quality or significance, never let platform economics, marketing campaigns, or awards politics color the aesthetic or structural analysis. If the user explicitly asks about both, present them in clearly labeled sections.

## Examples

**Query**: "Pourquoi *Parasite* a marque le cinema contemporain?"

Routing: cinema-analyse (narrative + political reading) + cinema-histoire (contexte coreen) + cinema-technique (staging vertical, montage). If the user also asks about the Oscar win, add a separate media-critic section on awards politics.

**Query**: "Quels films regarder pour comprendre le montage sovietique?"

Routing: cinema-histoire (mouvement, contexte) + cinema-technique (theorie du montage d'Eisenstein, Vertov, Poudovkine).

**Query**: "C'est quoi un bon directeur photo?"

Routing: cinema-technique directly. Reference Storaro, Deakins, Lubezki, Darius Khondji. Discuss exposure, composition, lens language.

**Query**: "Netflix tue-t-il le cinema d'auteur?"

Routing: media-critic exclusively. Do not let platform critique bleed into aesthetic judgments about specific films.

## References

- David Bordwell & Kristin Thompson, *Film Art: An Introduction*
- Andre Bazin, *Qu'est-ce que le cinema?*
- Gilles Deleuze, *L'Image-mouvement* / *L'Image-temps*
- Laurent Jullier, *Analyser un film*
- Michel Chion, *L'Audio-vision*
