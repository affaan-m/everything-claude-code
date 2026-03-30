---
name: radar-veille
description: 3 signaux marche hebdomadaires pour la videographie freelance a Paris.
version: 1.0.0
category: Deficit
priority: 3
author: Richard Cusey
---

# Radar Veille

> Livre 3 signaux marche pertinents chaque lundi pour garder Richard informe des tendances de son secteur.

## When to Use

- Chaque lundi, dans le cadre de la `weekly-review`
- Quand Richard demande "quoi de neuf sur le marche ?"
- Avant une decision strategique (positionnement, pricing, investissement)
- Quand Richard prepare une proposition client et veut des arguments marche

## How It Works

### 1. Perimetre de veille

Focus sur le marche de Richard :

| Axe | Perimetre |
|-----|-----------|
| **Geographique** | Paris / Ile-de-France |
| **Metier** | Videographie freelance |
| **Specialites** | Brand content PME, drone, corporate |
| **Horizon** | Court terme (tendances actuelles) + moyen terme (6-12 mois) |

### 2. Categories de signaux

Chaque semaine, livrer exactement 3 signaux dans ces categories :

| Categorie | Description | Exemple |
|-----------|-------------|---------|
| **Demande** | Evolution de la demande client | "Les PME tech recrutent plus de videaste Q1 2026" |
| **Concurrence** | Mouvements du marche concurrent | "Nouvelle agence low-cost video a Paris" |
| **Technologie** | Outils, formats, plateformes | "DaVinci 20 sort avec AI color auto" |
| **Tarification** | Evolution des prix du marche | "Les tarifs drone immobilier baissent de 15%" |
| **Reglementation** | Lois, normes, autorisations | "Nouvelle zone NFZ drone a Paris" |
| **Opportunite** | Niche ou segment emergent | "Les cliniques veterinaires cherchent du brand content" |

### 3. Format de livraison

```
=== RADAR VEILLE - Semaine du [date] ===

SIGNAL 1 : [Titre court]
Categorie : [categorie]
Source : [Knowledge / Inference / Document] + [confidence tag]
Resume : [2-3 phrases]
Impact pour Richard : [ce que ca change concretement]
Action suggeree : [optionnel]

SIGNAL 2 : [Titre court]
...

SIGNAL 3 : [Titre court]
...
```

### 4. Sources de signaux

Par ordre de fiabilite :

1. **Recherche web** (Exa) : articles recents, annonces, tendances
2. **Knowledge Claude** : tendances generales bien documentees
3. **Inference** : deductions a partir de multiples signaux

**Chaque signal DOIT etre tague** avec `source-checker` et `confidence-calibration`.

### 5. Objectifs strategiques

La veille alimente la strategie de Richard :

| Horizon | Objectif |
|---------|----------|
| **An 1** (actuel) | Devenir reference niche Paris brand content |
| **An 2** | Reference marche video Paris (pas seulement brand content) |

Les signaux doivent etre evalues par rapport a ces objectifs.

## Examples

### Exemple 1 : Radar hebdomadaire standard

```
=== RADAR VEILLE - Semaine du 31 mars 2026 ===

SIGNAL 1 : Les PME augmentent leur budget video social media
Categorie : Demande
Source : [Knowledge] 🔵
Resume : La tendance des short-form videos (Reels, TikTok, Shorts)
pousse les PME a investir davantage en contenu video. Le format
vertical 9:16 est desormais le standard pour le brand content social.
Impact pour Richard : Opportunite de proposer des packages "social media
content" en complement des videos classiques. Format plus court =
tournage plus rapide = plus de projets possibles.
Action suggeree : Preparer un package "3 Reels en 1 journee de tournage"
a tester sur les prospects PME.

SIGNAL 2 : Restrictions drone renforcees Paris centre (zone P23)
Categorie : Reglementation
Source : [Knowledge] 🟡 (verifier les mises a jour DGAC recentes)
Resume : Les zones de restriction drone a Paris sont regulierement
mises a jour. Les vols en zone urbaine dense necessitent des
autorisations specifiques de plus en plus complexes.
Impact pour Richard : Anticiper les delais d'autorisation dans les
devis drone. Differenciateur si tu maitrises le processus administratif.
Action suggeree : Mettre a jour ta checklist d'autorisations drone.

SIGNAL 3 : DaVinci Resolve integre des outils AI de color grading
Categorie : Technologie
Source : [Knowledge] 🔵
Resume : Les dernieres versions de DaVinci Resolve integrent des
fonctions AI pour le color matching et la correction automatique.
Ca ne remplace pas le savoir-faire mais accelere le workflow.
Impact pour Richard : Investir dans la maitrise des outils AI DaVinci
= gain de temps en post-prod = meilleure marge par projet.
Action suggeree : Planifier une session deliberate-practice sur
les outils AI de DaVinci cette semaine.
```

### Exemple 2 : Signal d'opportunite

```
SIGNAL : Les cabinets d'architectes parisiens cherchent du contenu drone
Categorie : Opportunite
Source : [Inference] 🟡 (base sur la croissance du contenu immobilier
+ besoin de differenciation des cabinets)
Resume : Les cabinets d'architecture utilisent de plus en plus la video
pour presenter leurs realisations. Le drone offre des angles impossibles
en photo. C'est un segment premium qui valorise la qualite.
Impact pour Richard : Segment a TJM potentiellement plus eleve que les
PME classiques. Combine tes competences brand content + drone.
Action suggeree : Identifier 5 cabinets d'architecture parisiens sur
LinkedIn et preparer une approche personnalisee.
```

## References

- Depend de : `notion-sync` (contexte business Richard), `weekly-review` (integration lundi)
- Interagit avec : `source-checker` (sourcer chaque signal), `confidence-calibration` (taguer chaque signal)
- Voir aussi : `anti-bias-check` (ne pas surestimer les opportunites), `prospect-coach` (actionner les opportunites detectees)
