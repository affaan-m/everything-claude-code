---
name: ecriture-script
description: Tronc commun d'ecriture audiovisuelle — pipeline brief, sequencier, script (Lavandier + Truby)
version: 1.0.0
category: Écriture Audiovisuelle
priority: 1
author: Richard Cusey
matrix: ecriture
references: Lavandier (La Dramaturgie), Truby (L'Anatomie du scénario)
---

# Écriture Script — Tronc Commun

> Pipeline d'écriture audiovisuelle : brief → séquencier → script. Point d'entrée de la matrice écriture.

## When to Use

- Starting any audiovisual writing project (fiction, documentary, brand, social, funding)
- Converting a client brief or personal idea into a structured script
- When you need the full pipeline: brief analysis → séquencier → script
- As the entry point before routing to a specialized format skill

## How It Works

### 1. Brief Analysis

Deconstruct the input (client brief, personal note, or concept) into:

- **Intention** — What does the author want to say? What emotion or idea drives the project?
- **Public cible** — Who is the audience? What do they already know/feel?
- **Contraintes** — Duration, format, budget, delivery platform, deadline
- **Noyau dramatique** — The central conflict or tension (Lavandier: conflict as engine)

### 2. Séquencier (Sequence Breakdown)

Build the structural skeleton using both frameworks:

**Lavandier — La Dramaturgie:**
- Identify protagonist and antagonist forces (not necessarily characters)
- Map the central conflict and its escalation
- Place dramatic irony moments (audience knows more than character)
- Ensure each sequence has its own mini-conflict

**Truby — L'Anatomie du scénario:**
- Apply the 22-step structure (weakness/need → self-revelation)
- Define the moral argument threaded through the story
- Build the character web (how characters challenge each other)
- Identify the story world and how it reflects the theme

**Output format:**
```
SEQ 1 — [Lieu] — [Durée estimée]
  Action: ...
  Enjeu: ...
  Transition vers SEQ 2: ...
```

### 3. Script Writing

Transform the séquencier into a formatted script:

- Scene headers: INT/EXT — LIEU — MOMENT
- Action lines: present tense, visual, concise
- Dialogue: character voice, subtext, rhythm
- Technical notes only when essential for comprehension

### 4. Routing to Specialized Skills

Based on the project type, route to:

| Project Type | Skill | Key Addition |
|-------------|-------|-------------|
| Court métrage / fiction | `ecriture-fiction` | Dramaturgy, character arcs, dialogue |
| Documentaire | `ecriture-documentaire` | Writing on rushes, interview guides |
| Brand content / corporate | `ecriture-brand` | Client séquencier, brand storytelling |
| YouTube / Instagram / TikTok | `ecriture-reseaux` | Hooks, retention, platform rules |
| Dossier CNC / financement | `ecriture-dossier` | Note d'intention, note de réalisation |

## Examples

### Brief Analysis Output

```
PROJET: Vidéo corporate Maison Isor
INTENTION: Montrer le savoir-faire artisanal et l'identité de marque
PUBLIC: Clients potentiels PME luxe, 30-50 ans
CONTRAINTES: 2min, 5 livrables, 750€ HT
NOYAU: Tension entre tradition artisanale et modernité du marché
→ Route vers: ecriture-brand
```

### Séquencier Extract

```
SEQ 1 — INT. ATELIER — JOUR — 20s
  Action: Mains de l'artisan sur la matière. Gestes précis, lumière naturelle.
  Enjeu: Établir l'authenticité et le savoir-faire
  Transition: Le regard se lève vers la vitrine moderne

SEQ 2 — INT. SHOWROOM — JOUR — 25s
  Action: Produits exposés. Client découvre la collection.
  Enjeu: Pont entre artisanat et désir client
  Transition: Voix off lance la promesse de marque
```

## References

- **Lavandier, Yves** — *La Dramaturgie* : Conflit comme moteur, ironie dramatique, forces protagoniste/antagoniste
- **Truby, John** — *L'Anatomie du scénario* : 22 étapes, argument moral, réseau de personnages
- **Matrice écriture** — Ce skill est le tronc commun qui alimente les 5 skills spécialisés
