---
name: notion-sync
description: Lit le Dashboard Notion avant chaque reponse strategique. Source de verite = Notion, pas la memoire Claude.
version: 1.0.0
category: Context
priority: 1
author: Richard Cusey
---

# Notion Sync

> Synchronise le contexte Notion avant chaque reponse strategique pour garantir des recommandations basees sur des donnees reelles.

## When to Use

- Avant toute reponse impliquant un client, un projet, un devis ou une decision strategique
- Quand Richard demande le statut d'un prospect ou d'un projet
- Avant de generer un rapport, un bilan ou une recommandation
- Quand une question porte sur le CRM, les REX, les briefs ou les devis
- Au demarrage de chaque session de travail strategique

## How It Works

### 1. Identification du besoin de contexte

Avant de repondre, determiner quelles bases Notion sont pertinentes :

| Base Notion | Quand la lire |
|-------------|---------------|
| **CRM Prospects** | Questions sur des clients, relances, pipeline |
| **REX** | Questions sur des retours d'experience, erreurs passees |
| **Briefs** | Questions sur un projet en cours ou a venir |
| **Devis** | Questions sur la tarification, les montants, les acomptes |
| **Agents** | Questions sur l'organisation du workflow Claude |

### 2. Lecture via Notion MCP

```
1. Identifier les bases pertinentes a la question
2. Lire les entrees via Notion MCP (notion-search, notion-fetch)
3. Extraire les donnees cles (statut, dates, montants, notes)
4. Repondre en s'appuyant sur les donnees Notion, pas sur la memoire
```

### 3. Regle fondamentale

**Source de verite = Notion, jamais la memoire Claude.**

- Si une information en memoire contredit Notion, Notion gagne
- Si une donnee n'est pas dans Notion, le signaler explicitement
- Ne jamais inventer de chiffre, de date ou de statut sans verification Notion

### 4. Donnees a extraire par defaut

Pour chaque entree lue, capturer :
- **Statut** : en cours, termine, en attente, annule
- **Dates cles** : deadline, derniere modification, prochaine action
- **Montants** : si applicable (devis, facture, acompte)
- **Notes/commentaires** : contexte qualitatif

## Examples

### Exemple 1 : Question sur un prospect

```
Richard : "Ou en est le prospect Maison Dior ?"

Workflow :
1. Lire CRM Prospects via Notion MCP
2. Filtrer sur "Maison Dior"
3. Extraire : statut, dernier contact, prochaine relance, montant potentiel
4. Repondre avec les donnees Notion, pas de memoire
```

### Exemple 2 : Preparation d'un devis

```
Richard : "Je dois faire un devis pour une video corporate 2 jours"

Workflow :
1. Lire base Devis pour TJM actuel et historique
2. Lire CRM pour le contexte client
3. Lire REX pour les erreurs passees sur des projets similaires
4. Proposer un devis base sur les donnees reelles
```

### Exemple 3 : Session strategique

```
Richard : "On fait le point sur la semaine"

Workflow :
1. Lire CRM : pipeline actif, relances en retard
2. Lire Briefs : projets en cours, deadlines proches
3. Lire REX : retours d'experience recents non traites
4. Lire Devis : devis en attente de signature
5. Synthetiser en tableau de bord
```

## References

- Notion MCP : `notion-search`, `notion-fetch`, `notion-get-comments`
- Priorite 1 : cette skill doit etre activee avant toutes les autres skills strategiques
- Voir aussi : `weekly-review`, `prospect-coach`, `knowledge-linker`
