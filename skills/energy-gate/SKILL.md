---
name: energy-gate
description: Monitoring epuisement et engagement base sur le modele JD-R. Deload obligatoire toutes les 4 semaines.
version: 1.0.0
category: Sante
priority: 2
author: Richard Cusey
---

# Energy Gate

> Protege Richard de l'epuisement en monitorant les signaux d'alerte et en imposant des deloads reguliers.

## When to Use

- Lors de chaque revue hebdomadaire (lundi)
- Quand Richard mentionne fatigue, douleurs, demotivation ou stress
- Avant d'accepter un nouveau projet (verification de la charge)
- Quand Richard hesite a dire non a un client
- Contexte marathon : preparation 12 avril 2026

## How It Works

### 1. Modele JD-R (Job Demands-Resources)

Le modele Job Demands-Resources distingue :
- **Demands (exigences)** : charge de travail, deadlines, clients difficiles, deplacement, post-prod intensive
- **Resources (ressources)** : autonomie, creativite, revenus, reconnaissance, repos, sport

L'equilibre demands/resources determine la zone :

| Zone | Signal | Action |
|------|--------|--------|
| **Verte** | Energie stable, motivation haute, sommeil OK | Continuer normalement |
| **Orange** | Fatigue au reveil, douleurs articulaires, motivation en baisse, stress chronique | Reduire la charge, planifier deload |
| **Rouge** | Epuisement, incapacite a travailler, blessure, burnout | STOP immediat, deload force |

### 2. Signaux d'alerte zone orange

Detecter ces signaux dans les echanges avec Richard :

- **Fatigue au reveil** : "je suis casse", "mal dormi", "du mal a me lever"
- **Douleurs articulaires** : "mal au dos", "douleur epaule", "genoux"
- **Motivation en baisse** : "la flemme", "pas envie", "je sais pas si ca vaut le coup"
- **Stress chronique** : "je suis deborde", "trop de trucs", "je vais pas y arriver"
- **Sur-disponibilite** : "je peux pas dire non", "ils comptent sur moi", "je me sentirais mal"

### 3. Regle du deload

**Non-negociable : 1 semaine de deload toutes les 4 semaines.**

Deload = semaine allegee :
- Pas de tournage
- Post-prod legere uniquement (si necessaire)
- Focus sur : admin, REX, deliberate-practice, prospection douce
- Sport adapte (si preparation marathon : semaine easy)

Tracking :
```
Semaines depuis dernier deload : [compteur]
Prochain deload prevu : [date]
Alerte si compteur >= 4 : DELOAD OBLIGATOIRE
```

### 4. Contexte marathon

Preparation marathon 12 avril 2026 :
- Ne pas planifier de tournage la semaine avant (6-12 avril)
- Adapter la charge les 3 semaines precedentes
- Signaler tout conflit planning/entrainement

### 5. Gate avant acceptation de projet

Avant d'accepter un nouveau projet, verifier :

```
ENERGY GATE CHECK
- Charge actuelle cette semaine : [jours occupes / jours dispo]
- Semaines depuis dernier deload : [nombre]
- Zone actuelle : [verte / orange / rouge]
- Conflits planning : [oui/non]

DECISION :
- Zone verte + charge OK -> Accepter
- Zone orange -> Accepter seulement si urgent ET bien paye
- Zone rouge -> REFUSER (pas de culpabilite)
- Deload prevu dans la periode -> REFUSER ou decaler
```

## Examples

### Exemple 1 : Signal orange detecte

```
Richard : "Je suis claque, j'ai mal dormi et j'ai un tournage demain
plus deux montages en retard"

ALERTE ENERGY GATE - ZONE ORANGE

Signaux detectes :
- Fatigue au reveil
- Surcharge (tournage + 2 montages en retard)

Semaines depuis dernier deload : 3

Recommandations :
1. Tournage demain : maintenir (deja engage)
2. Montages : negocier un delai de 2 jours avec les clients
3. Planifier deload semaine prochaine (obligatoire a S4)
4. Ce soir : coucher avant 22h30, pas d'ecran apres 21h30
```

### Exemple 2 : Gate avant nouveau projet

```
Richard : "Une agence me propose 2 jours de tournage la semaine prochaine"

ENERGY GATE CHECK
- Charge semaine prochaine : 3j deja occupes / 5j
- Semaines depuis dernier deload : 4 -> ALERTE
- Zone actuelle : orange (fatigue signalee lundi)
- Conflit : semaine de deload normalement prevue

DECISION : REFUSER ou DECALER
La semaine prochaine devait etre une semaine de deload.
Proposer la semaine suivante si possible.
Rappel : dire non n'est pas un echec, c'est proteger ta sante
et la qualite de ton travail.
```

## References

- Modele JD-R : Bakker & Demerouti (2007), Job Demands-Resources theory
- Depend de : `notion-sync` (lecture agenda et charge)
- Alimente : `weekly-review` (metriques energie), `rex-assistant` (pattern sur-disponibilite)
- Voir aussi : `anti-bias-check` (challenger le "je dois accepter")
