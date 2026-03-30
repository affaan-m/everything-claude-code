---
name: weekly-review
description: Revue du lundi matin avec metriques, pipeline, energie et plan d'action hebdomadaire.
version: 1.0.0
category: Pilotage
priority: 2
author: Richard Cusey
---

# Weekly Review

> Revue structuree chaque lundi matin pour piloter l'activite freelance avec des donnees reelles.

## When to Use

- Chaque lundi matin (declenchement manuel ou via rappel)
- Quand Richard demande "on fait le point" ou "revue de la semaine"
- Apres une semaine chargee pour evaluer la charge et les resultats
- En debut de mois pour le bilan mensuel

## How It Works

### 1. Collecte des donnees (via notion-sync)

Lire systematiquement ces bases Notion :

| Base | Donnees a extraire |
|------|-------------------|
| **CRM Prospects** | Pipeline actif, relances en retard, nouveaux leads |
| **Briefs** | Projets en cours, deadlines cette semaine |
| **Devis** | Devis envoyes non signes, montants en jeu |
| **REX** | REX en attente (>48h apres livraison = alerte) |
| **Agenda** | Jours de tournage, jours post-prod, jours libres |

### 2. Metriques hebdomadaires

Generer un tableau de bord avec :

```
PIPELINE
- Prospects actifs : [nombre]
- Relances en retard : [nombre] (J+5 ou J+14 depasses)
- Devis en attente : [nombre] ([montant total] EUR)
- Taux de conversion mois en cours : [%]

PRODUCTION
- Jours tournes cette semaine : [nombre]
- Jours post-prod : [nombre]
- Projets livres : [nombre]
- REX a faire : [nombre]

ENERGIE (via energy-gate)
- Niveau fatigue : [vert/orange/rouge]
- Semaines depuis dernier deload : [nombre]
- Prochain deload prevu : [date]

FINANCIER (via math-verifier - calculs Python)
- CA facture ce mois : [montant] EUR
- CA en attente (devis signes) : [montant] EUR
- Objectif mensuel : [montant] EUR
- Ecart : [+/-montant] EUR
```

### 3. Plan d'action

Generer 5 actions prioritaires maximum pour la semaine :

```
ACTIONS SEMAINE [date]
1. [Action] - Priorite [haute/moyenne] - Deadline [date]
2. [Action] - Priorite [haute/moyenne] - Deadline [date]
3. ...
```

Regles :
- Maximum 5 actions (pas de surcharge)
- Chaque action doit etre concrete et mesurable
- Inclure les relances CRM en retard en priorite
- Inclure les REX en attente depuis >48h

### 4. Alertes automatiques

Signaler en rouge :
- REX non fait >48h apres livraison
- Relance prospect depassee de >7 jours
- Devis non signe >14 jours
- Niveau energie orange ou rouge
- Deload en retard (>4 semaines sans pause)

## Examples

### Exemple 1 : Revue lundi standard

```
Richard : "Revue du lundi"

Output :
=== REVUE HEBDO - Lundi 31 mars 2026 ===

PIPELINE
- Prospects actifs : 4
- Relances en retard : 1 (Agence Bloom - J+8, relance J+5 non faite)
- Devis en attente : 2 (3 400 EUR total)

PRODUCTION
- Tournages semaine passee : 2j
- Post-prod : 1j
- Livres : 1 projet (Video PME Batiment)
- REX a faire : 1 (Video PME Batiment - livre il y a 3j)

ENERGIE
- Fatigue : orange (reveil difficile signale vendredi)
- Semaines sans deload : 3 -> deload semaine prochaine obligatoire

ACTIONS SEMAINE
1. Faire REX Video PME Batiment - Haute - Aujourd'hui
2. Relancer Agence Bloom (J+8) - Haute - Aujourd'hui
3. Finaliser devis Corporate Luxe - Moyenne - Mercredi
4. Seance deliberate-practice DaVinci color - Moyenne - Jeudi
5. Planifier deload semaine prochaine - Haute - Vendredi
```

## References

- Depend de : `notion-sync` (lecture des bases), `energy-gate` (niveau energie), `math-verifier` (calculs financiers)
- Alimente : `radar-veille` (3 signaux marche inclus dans la revue lundi)
- Voir aussi : `rex-assistant`, `prospect-coach`
