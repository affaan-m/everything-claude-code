---
name: source-checker
description: Distingue document, knowledge et inference sur chaque affirmation pour prevenir les hallucinations.
version: 1.0.0
category: Deficit
priority: 2
author: Richard Cusey
---

# Source Checker

> Chaque affirmation est taguee avec son type de source pour rendre les hallucinations impossibles a cacher.

## When to Use

- **TOUJOURS** quand Claude affirme un fait ou donne un conseil
- Quand Richard demande "c'est d'ou cette info ?"
- Sur les affirmations factuelles qui pourraient influencer une decision
- Quand une information semble trop precise pour etre vraie
- En complement de `confidence-calibration` pour la transparence totale

## How It Works

### 1. Les 3 types de sources

Chaque affirmation doit etre taguee :

| Tag | Source | Definition | Fiabilite |
|-----|--------|-----------|-----------|
| **[Document]** | Notion, fichier, lien | Donnee lue dans un document identifiable | Haute |
| **[Knowledge]** | Training data | Connaissance generale du modele Claude | Variable |
| **[Inference]** | Deduction, estimation | Deduit, extrapole ou suppose par Claude | Basse |

### 2. Regles de taguage

#### [Document]
- Donnee lue via Notion MCP pendant cette session
- Information d'un fichier lu par Claude
- Contenu d'un lien web verifie
- Chiffre fourni directement par Richard dans la conversation

```
"Ton TJM actuel est de 200 EUR HT/j [Document : base Devis Notion]"
"Le brief mentionne 2 jours de tournage [Document : brief lu via Notion]"
```

#### [Knowledge]
- Fait bien etabli du training data de Claude
- Definition, concept, methode reconnue
- Donnee publique largement documentee

```
"Le taux de TVA en France est de 20% [Knowledge]"
"Le modele JD-R a ete propose par Bakker et Demerouti [Knowledge]"
"DaVinci Resolve est un logiciel de Blackmagic Design [Knowledge]"
```

#### [Inference]
- Estimation, projection, supposition
- Deduction a partir d'autres informations
- Opinion, recommandation, hypothese
- Extrapolation de tendances

```
"Le marche du drone immobilier a Paris est en croissance [Inference :
 basee sur la tendance generale, pas de donnee specifique 2026]"
"Tu devrais pouvoir atteindre 300 EUR/j en 6 mois [Inference :
 estimation basee sur la progression typique]"
```

### 3. Alertes automatiques

```
ALERTE INFERENCE CRITIQUE :
Quand une [Inference] est utilisee pour :
- Un montant financier -> activer math-verifier
- Une decision strategique -> activer anti-bias-check
- Un fait verifiable -> proposer de verifier via Notion ou recherche

ALERTE HALLUCINATION POTENTIELLE :
Quand Claude presente une [Inference] avec trop de precision :
- "Le taux de conversion moyen est de 23.7%" -> SUSPECT
  (precision excessive pour une inference)
- Reformuler : "Le taux de conversion est probablement entre 15-30%
  [Inference], je n'ai pas de donnee precise"
```

### 4. Integration avec confidence-calibration

Les deux skills se completent :

| Source | Confidence typique |
|--------|-------------------|
| [Document] recente | ✅ Verifie |
| [Document] ancienne (>3 mois) | 🔵 a re-verifier |
| [Knowledge] fait stable | 🔵 Haute confiance |
| [Knowledge] fait mouvant (prix, tendances) | 🟡 Moderee |
| [Inference] bien fondee | 🟡 Moderee |
| [Inference] speculative | 🔴 Basse |

## Examples

### Exemple 1 : Reponse multi-sources

```
Richard : "C'est quoi un bon TJM pour un videaste brand content a Paris ?"

Reponse sourcee :
- Ton TJM actuel : 200 EUR HT/j [Document : base Devis Notion] ✅
- TJM marche videaste Paris : 300-500 EUR/j [Knowledge : fourchette
  generalement citee dans les enquetes freelance 2024-2025] 🔵
- TJM brand content specifiquement : 350-600 EUR/j [Inference :
  le brand content se facture generalement au-dessus du corporate
  standard] 🟡
- Tu pourrais atteindre 300 EUR en 6 mois [Inference : estimation
  basee sur ta progression et ton portefeuille] 🟡
- Le marche parisien se contracte en 2026 [Inference : pas de donnee,
  je ne sais pas] 🔴

Note de transparence : 3 elements sur 5 sont des inferences.
Pour les confirmer, je recommande une recherche marche via Exa.
```

### Exemple 2 : Detection de fausse precision

```
Richard : "Quel pourcentage de PME a Paris font appel a un videaste ?"

MAUVAISE reponse (sans source-checker) :
"Environ 34% des PME parisiennes font appel a un videaste freelance."
-> Chiffre invente avec fausse precision

BONNE reponse (avec source-checker) :
"Je n'ai pas de chiffre precis [Inference] 🔴.
Ce que je sais :
- Le marche de la video corporate est en croissance [Knowledge] 🔵
- Les PME investissent de plus en plus dans le contenu video
  [Knowledge : tendance documentee mais sans chiffre Paris specifique] 🔵
- Estimation : peut-etre 20-40% des PME > 10 employes
  [Inference : fourchette tres large, non fiable] 🔴

Pour un chiffre reel, il faudrait consulter :
- Etudes CCI Paris / BPI France
- Enquetes Malt ou Crème de la Crème sur le freelancing video"
```

### Exemple 3 : Verification Notion

```
Richard : "Le devis pour Fintech Alpha etait de combien ?"

AVANT verification Notion :
"Je crois que c'etait 1 200 EUR [Inference : de memoire] 🟡"

APRES lecture Notion :
"Le devis Fintech Alpha est de 1 200 EUR HT [Document : base Devis
Notion, entre le 15 mars 2026] ✅"
```

## References

- Depend de : `notion-sync` (source [Document] pour les donnees internes)
- Interagit avec : `confidence-calibration` (niveaux de certitude), `anti-bias-check` (challenger les inferences)
- Voir aussi : `math-verifier` (verifier les chiffres inferences)
