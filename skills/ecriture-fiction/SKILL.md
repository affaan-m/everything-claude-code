---
name: ecriture-fiction
description: Ecriture fiction court metrage — dramaturgie, arcs, dialogues, structure impro (Lavandier + Truby)
version: 1.0.0
category: Écriture Audiovisuelle
priority: 1
author: Richard Cusey
matrix: ecriture
references: Lavandier (La Dramaturgie), Truby (L'Anatomie du scénario)
---

# Écriture Fiction

> Écriture de fiction pour court métrage : structure dramatique, arcs de personnages, dialogues, construction de scènes.

## When to Use

- Writing a short film script (court métrage)
- Developing character arcs and dramatic structure for fiction
- Writing dialogue (scripted or improv-based structure)
- Building scene-by-scene construction with subtext
- Extends `ecriture-script` (tronc commun) with fiction-specific craft

## How It Works

### 1. Structure Dramatique

Apply Lavandier and Truby to short-form fiction:

**Three-act compression for court métrage (5-20 min):**

| Act | Duration | Function |
|-----|----------|----------|
| Setup | ~15-20% | World, character, weakness, inciting incident |
| Confrontation | ~60-70% | Escalating conflict, revelations, reversals |
| Resolution | ~15-20% | Climax, self-revelation, new equilibrium |

**Lavandier keys for short film:**
- One central conflict, tightly wound — no subplots unless they mirror the main
- Dramatic irony is the most powerful tool in short format (audience knows, character doesn't)
- Antagonist force must be present from the first sequence

**Truby keys for short film:**
- Compress the 22 steps — focus on: weakness/need → desire → opponent → battle → self-revelation
- Moral argument must be clear by midpoint
- Character web: even in a 2-character film, define how they challenge each other's values

### 2. Arc de Personnage

Build each significant character with:

```
PERSONNAGE: [Nom]
  Faiblesse psychologique: [ce qui le limite intérieurement]
  Faiblesse morale: [comment cette faiblesse blesse les autres]
  Besoin: [ce qu'il doit apprendre]
  Désir: [ce qu'il croit vouloir]
  Arc: [faiblesse → confrontation → révélation de soi]
```

The gap between desire (conscious goal) and need (unconscious growth) is the engine of the arc.

### 3. Dialogue

**Scripted dialogue principles:**
- Each character has a distinct voice (vocabulary, rhythm, tics)
- Dialogue reveals character through what is NOT said (subtext)
- Avoid exposition dialogue — show through action, reveal through conflict
- Read aloud: if it sounds written, rewrite it

**Subtext techniques:**
- Character says the opposite of what they mean
- Character deflects or changes subject at key moments
- Silence and pauses carry meaning
- Physical action contradicts spoken words

### 4. Structure Impro

When the script is minimal or the project uses improvised performance:

- Write a **conducteur** (conductor sheet) instead of full script:
  ```
  SCÈNE 3 — Cuisine — Marie et Thomas
    Situation: Marie vient d'apprendre la nouvelle. Thomas ne sait pas qu'elle sait.
    Enjeu: Marie doit décider si elle confronte ou protège.
    Contrainte: La scène doit finir par un départ physique.
    Interdits: Pas de mention directe de l'événement.
  ```
- Define situation, stakes, constraints, and forbidden territory
- Let actors find the words within dramatic boundaries
- The structure is as tight as scripted — only the exact words are free

### 5. Construction de Scène

Each scene must answer:

1. **Qui veut quoi?** — Character objective in this scene
2. **Quel est l'obstacle?** — What prevents them from getting it
3. **Qu'est-ce qui change?** — What is different at scene end vs. scene start
4. **Quelle est la valeur en jeu?** — What abstract value shifts (trust→betrayal, hope→despair)

If a scene doesn't change a value, cut it.

## Examples

### Character Arc — Court Métrage

```
PERSONNAGE: Léa, 24 ans, monteuse vidéo freelance
  Faiblesse psychologique: Perfectionnisme paralysant
  Faiblesse morale: Abandonne les projets des autres quand ça ne correspond pas à sa vision
  Besoin: Apprendre que l'imparfait peut être vivant
  Désir: Livrer le montage parfait pour décrocher un CDI
  Arc: Refuse toutes les prises "imparfaites" → Le client préfère la version brute →
       Comprend que l'émotion prime sur la technique
```

### Improv Conductor Sheet

```
SCÈNE 5 — EXT. TOIT D'IMMEUBLE — NUIT
  Personnages: Léa, Karim (le client)
  Situation: Karim montre à Léa la version qu'il a remontée lui-même avec les rushes "ratés"
  Enjeu: Léa doit reconnaître que sa vision n'est pas la seule valide
  Contrainte: Pas de dialogue pendant les 30 premières secondes (ils regardent l'écran)
  Direction: La scène bascule quand Léa rit — pour la première fois du film
```

## References

- **Lavandier, Yves** — *La Dramaturgie* : Conflit, ironie dramatique, protagoniste/antagoniste
- **Truby, John** — *L'Anatomie du scénario* : 22 étapes compressées, argument moral, réseau de personnages
- **Tronc commun** — `ecriture-script` fournit le pipeline brief → séquencier → script
