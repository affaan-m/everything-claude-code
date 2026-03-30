---
name: deliberate-practice
description: Sessions de pratique structurees avec objectif et feedback pour progresser sur des competences cibles.
version: 1.0.0
category: Competences
priority: 3
author: Richard Cusey
---

# Deliberate Practice

> Pratique structuree avec objectif mesurable, exercice cible et feedback pour progresser sur les competences cles du metier.

## When to Use

- Pendant les semaines de deload (temps dedie a la pratique)
- Quand Richard veut progresser sur une competence specifique
- Apres un REX qui revele un deficit de competence
- Lors des jours "creux" sans tournage ni montage urgent
- 1 a 2 sessions par semaine recommandees

## How It Works

### 1. Competences suivies

| Competence | Niveau actuel | Objectif | Priorite |
|-----------|---------------|----------|----------|
| DaVinci Resolve - color grading | Intermediaire | Avance | Haute |
| AI tools DaVinci/Premiere | Debutant | Intermediaire | Haute |
| After Effects - motion design | Debutant | Intermediaire | Moyenne |
| Fairlight - sound design | Debutant | Intermediaire | Moyenne |
| LinkedIn personal branding | Debutant | Regulier | Moyenne |

### 2. Structure d'une session

Chaque session suit le protocole deliberate practice :

```
=== SESSION PRATIQUE ===
Competence : [nom]
Duree : [30-90 min]
Date : [date]

OBJECTIF SPECIFIQUE
"A la fin de cette session, je serai capable de [objectif mesurable]"
Exemple : "Appliquer un look film sur une sequence corporate en <10 min"

EXERCICE
[Description de l'exercice concret]
- Materiel/footage a utiliser
- Etapes a suivre
- Contraintes (temps, outils, etc.)

CRITERES DE REUSSITE
- [ ] Critere 1
- [ ] Critere 2
- [ ] Critere 3

FEEDBACK POST-SESSION
- Ce qui a fonctionne : [...]
- Difficulte principale : [...]
- Prochaine etape : [...]
- Temps reel vs estime : [...]
```

### 3. Principes du deliberate practice

Basees sur les travaux d'Anders Ericsson :

1. **Objectif specifique** : pas "s'ameliorer en color", mais "matcher une LUT specifique manuellement"
2. **Zone d'inconfort** : l'exercice doit etre difficile (pas de repetition de ce qu'on sait deja)
3. **Feedback immediat** : comparer le resultat a une reference
4. **Repetition ciblee** : retravailler les points faibles identifies
5. **Concentration totale** : pas de multitache pendant la session

### 4. Progressions par competence

#### DaVinci Resolve - Color Grading

```
Niveau 1 : Balance des blancs + exposition correcte
Niveau 2 : Appliquer et modifier des LUTs
Niveau 3 : Color matching entre plans
Niveau 4 : Creer un look film (Film Emulation)
Niveau 5 : Power windows + tracking pour correction locale
Niveau 6 : Workflow ACES complet
```

#### AI Tools (DaVinci/Premiere)

```
Niveau 1 : Utiliser les fonctions AI de base (auto-color, speech-to-text)
Niveau 2 : Magic Mask + segmentation AI dans DaVinci
Niveau 3 : Generative fill/extend dans Premiere
Niveau 4 : Workflow AI integre (script -> montage assist)
Niveau 5 : Automatisation batch avec AI
```

#### LinkedIn Personal Branding

```
Niveau 1 : Poster 1x/semaine (contenu simple)
Niveau 2 : Format storytelling structure
Niveau 3 : Carrousel video + texte optimise
Niveau 4 : Routine 3x/semaine avec engagement communaute
Niveau 5 : Thought leadership videographie Paris
```

## Examples

### Exemple 1 : Session color grading

```
Richard : "J'ai 1h de libre, je veux bosser le color grading"

=== SESSION PRATIQUE ===
Competence : DaVinci Resolve - Color Grading
Duree : 60 min
Date : 30 mars 2026

OBJECTIF SPECIFIQUE
"Color matcher 3 plans d'une sequence corporate avec des conditions
de lumiere differentes (interieur bureau, exterieur, salle de reunion)"

EXERCICE
1. Importer les 3 plans du dernier tournage corporate
2. Equilibrer chaque plan (balance des blancs, exposition)
3. Color matcher les 3 plans pour un rendu uniforme
4. Appliquer un look corporate subtil (leger warm, contrast doux)
5. Comparer avec une reference (video corporate de reference)

CRITERES DE REUSSITE
- [ ] Les 3 plans ont la meme temperature de couleur
- [ ] Les tons de peau sont naturels sur chaque plan
- [ ] Le look est subtil et professionnel
- [ ] Temps total < 30 min (objectif workflow rapide)
```

### Exemple 2 : Session LinkedIn

```
Richard : "Je veux commencer a poster sur LinkedIn"

=== SESSION PRATIQUE ===
Competence : LinkedIn Personal Branding
Duree : 45 min

OBJECTIF SPECIFIQUE
"Rediger et publier 1 post storytelling sur un apprentissage
de mon dernier tournage"

EXERCICE
1. Choisir un apprentissage du dernier REX
2. Structurer en format storytelling :
   - Hook (premiere ligne accrocheuse)
   - Contexte (2-3 phrases)
   - Probleme rencontre
   - Solution / apprentissage
   - Call-to-action
3. Ajouter 1 photo ou extrait video du tournage
4. Publier et programmer 2 interactions/commentaires

CRITERES DE REUSSITE
- [ ] Post publie avec visuel
- [ ] Hook qui donne envie de lire la suite
- [ ] Un apprentissage concret partage
- [ ] Moins de 1300 caracteres
```

## References

- Ericsson, K. A. (1993). "The Role of Deliberate Practice in the Acquisition of Expert Performance"
- Depend de : `rex-assistant` (deficits identifies dans les REX)
- Alimente : `weekly-review` (suivi des sessions realisees)
- Voir aussi : `confidence-calibration` (auto-evaluation realiste du niveau)
