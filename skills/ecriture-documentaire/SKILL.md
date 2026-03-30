---
name: ecriture-documentaire
description: Ecriture documentaire — portrait/thematique, ecriture sur rushes ou avant tournage
version: 1.0.0
category: Écriture Audiovisuelle
priority: 1
author: Richard Cusey
matrix: ecriture
references: Lavandier (La Dramaturgie), Truby (L'Anatomie du scénario)
---

# Écriture Documentaire

> Écriture documentaire en deux modes : avant tournage (traitement, guide d'entretien) et après tournage (écriture sur rushes).

## When to Use

- Writing a documentary treatment before shooting
- Preparing interview guides and narrative arc for a documentary project
- Writing on rushes — finding narrative structure in existing footage
- Portrait documentaries (single subject, intimate)
- Thematic documentaries (issue-driven, multi-subject)
- Extends `ecriture-script` (tronc commun) with documentary-specific methods

## How It Works

### Mode 1 — Écriture Avant Tournage

#### Treatment (Note d'intention documentaire)

Define the documentary's core before cameras roll:

```
SUJET: [Le sujet concret]
ANGLE: [Le point de vue spécifique — ce qui rend CE documentaire unique]
QUESTION CENTRALE: [La question que le film pose sans forcément y répondre]
DISPOSITIF: [Comment on filme — caméra épaule, fixe, participatif, observationnel]
PERSONNAGE(S): [Qui porte le récit]
ARC ATTENDU: [Hypothèse de transformation — ce qui pourrait changer pendant le tournage]
```

#### Guide d'Entretien

Structure interviews to serve narrative, not just information:

**Principles:**
- Start with factual/comfortable questions (build trust)
- Move to emotional/reflective questions (deepen)
- End with forward-looking or philosophical questions (open up)
- Never ask yes/no questions — always open-ended
- Prepare "relance" prompts for when subjects go shallow

**Template:**
```
ENTRETIEN: [Nom du sujet]
DURÉE PRÉVUE: [30min / 1h / 2h]

BLOC 1 — Mise en confiance (5-10min)
  - Racontez-moi votre journée type...
  - Comment êtes-vous arrivé(e) à [activité]?

BLOC 2 — Le cœur du sujet (15-30min)
  - Quel moment a tout changé pour vous?
  - Qu'est-ce que les gens ne comprennent pas de [sujet]?
  Relance: "Vous avez dit [X], qu'est-ce que vous entendez par là?"

BLOC 3 — Ouverture (5-10min)
  - Si vous pouviez revenir en arrière, que changeriez-vous?
  - Qu'est-ce que vous espérez pour la suite?
```

#### Narrative Arc Planning (Pre-shoot)

Apply Lavandier's conflict principle to documentary:
- The conflict is real — identify it before shooting
- The protagonist faces a real obstacle or tension
- Dramatic irony exists in documentary: the audience may know context the subject doesn't address
- Plan sequences around anticipated key moments

### Mode 2 — Écriture Sur Rushes

When footage exists and narrative must be found:

#### Step 1 — Dérushage Narratif

Watch all footage with a narrative lens:

```
RUSH [timestamp] — [description]
  Émotion: [ce qu'on ressent en regardant]
  Potentiel narratif: [où cela pourrait s'insérer dans une histoire]
  Valeur dramatique: haute / moyenne / basse
  Citation notable: "[verbatim si interview]"
```

#### Step 2 — Trouver le Fil

Identify the narrative thread that connects the strongest rushes:

- What question does this footage answer?
- Where is the tension? Where does it resolve?
- What is the character's arc as visible in the footage?
- What is missing? (voice-over, additional interview, context shots)

#### Step 3 — Séquencier Sur Rushes

Build a sequence breakdown from existing material:

```
SEQ 1 — [Thème/Moment] — Rushes: [références]
  Fonction narrative: Introduction du personnage / monde
  Durée estimée: 2min
  Manque identifié: Besoin d'un plan de contexte extérieur

SEQ 2 — [Thème/Moment] — Rushes: [références]
  Fonction narrative: Première tension / obstacle
  Durée estimée: 3min
  Audio: Extrait interview [timestamp]
```

### Documentary Types

#### Portrait Documentaire

Focus on one person, their world, their transformation:
- The subject IS the story — their conflict drives the film
- Intimacy is built through time, repeated visits, trust
- Visual motifs tied to the subject's daily life
- Voice-over by the subject preferred over narration

#### Documentaire Thématique

Issue or theme explored through multiple subjects/angles:
- Each subject represents a facet of the theme
- Structural principle: contrast, echo, escalation between subjects
- The filmmaker's angle is the editorial choice that gives coherence
- Data/context can be woven in via graphics, archive, voice-over

## Examples

### Portrait — Maya Tatoueuse

```
SUJET: Maya, tatoueuse indépendante à Paris
ANGLE: Le tatouage comme écriture de soi — chaque client porte une histoire sur la peau
QUESTION CENTRALE: Qu'est-ce qu'on grave quand on se fait tatouer?
DISPOSITIF: Caméra épaule, lumière naturelle atelier, pas de musique additionnelle
PERSONNAGE: Maya, 31 ans, 8 ans de métier, atelier 11e
ARC ATTENDU: Maya prépare une exposition de ses dessins non-tatoués — passage de
             l'artisane au statut d'artiste
```

### Écriture Sur Rushes — Extract

```
RUSH 03_interview_maya_45min.mp4 [12:34]
  Émotion: Vulnérabilité — elle parle de son premier tatouage raté
  Potentiel narratif: Moment de bascule — le doute fondateur
  Valeur dramatique: haute
  Citation: "Le premier que j'ai fait, il était horrible. Mais la cliente,
            elle a pleuré de joie. J'ai compris que c'était pas mon dessin qu'elle voyait."
```

## References

- **Lavandier, Yves** — *La Dramaturgie* : Le conflit dans le réel, ironie dramatique en documentaire
- **Truby, John** — *L'Anatomie du scénario* : Arc de personnage appliqué au sujet documentaire
- **Tronc commun** — `ecriture-script` fournit le pipeline brief → séquencier → script
