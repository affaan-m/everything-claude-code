---
name: knowledge-linker
description: Connecte les silos Notion en creant des liens croises entre bases, REX, briefs et CRM.
version: 1.0.0
category: Memoire
priority: 3
author: Richard Cusey
---

# Knowledge Linker

> Cree des liens entre les bases Notion pour transformer des donnees isolees en connaissances actionnables.

## When to Use

- Apres chaque REX (lier les apprentissages aux checklists de brief)
- Quand un pattern apparait dans plusieurs projets ou prospects
- Lors de la preparation d'un nouveau projet (recuperer les connaissances liees)
- Quand Richard cherche une information transversale ("qu'est-ce que je sais sur les tournages restaurant ?")
- En revue mensuelle pour consolider les apprentissages

## How It Works

### 1. Cartographie des connexions

Les bases Notion a connecter :

```
CRM Prospects <---> Briefs
     |                  |
     v                  v
   Devis <---------> Projets
                        |
                        v
                      REX
                        |
                        v
               Regles derivees
                        |
                        v
              Checklists Brief
```

### 2. Types de liens

| Lien | De -> Vers | Exemple |
|------|-----------|---------|
| **Prospect -> Projet** | CRM -> Brief | "Prospect Agence Bloom" -> "Brief Video Corporate Bloom" |
| **Projet -> REX** | Brief -> REX | "Brief Boulangerie" -> "REX Boulangerie - audio defaillant" |
| **REX -> Regle** | REX -> Checklist | "Audio defaillant" -> "Toujours prevoir double source audio" |
| **Regle -> Brief** | Checklist -> Brief | "Double source audio" -> integre dans template brief |
| **Pattern -> Prospects** | REX -> CRM | "PME sous-estiment le budget" -> tag sur prospects PME |

### 3. Processus de liaison

#### Apres un REX

```
1. Identifier la regle derivee du REX
2. Verifier si la regle existe deja dans les checklists
3. Si non : ajouter la regle a la checklist Brief appropriee
4. Lier le REX au Brief du projet concerne
5. Taguer le client dans le CRM avec les patterns observes
6. Chercher d'autres REX avec le meme pattern -> consolider
```

#### Avant un nouveau projet

```
1. Lire le Brief du nouveau projet
2. Identifier le type de projet (brand content, corporate, drone...)
3. Chercher tous les REX du meme type
4. Extraire les regles derivees applicables
5. Pre-remplir la checklist BAR avec les regles pertinentes
6. Lier le prospect CRM au nouveau Brief
```

#### Recherche transversale

```
1. Recevoir la question de Richard
2. Identifier les mots-cles et les bases concernees
3. Chercher dans chaque base via Notion MCP
4. Croiser les resultats pour trouver les connexions
5. Presenter une synthese avec les sources identifiees
```

### 4. Enrichissement automatique

A chaque interaction qui genere de la connaissance :

- **Nouveau pattern** -> creer un tag, l'appliquer aux entrees concernees
- **Nouvelle regle derivee** -> l'ajouter au template de checklist
- **Correlation client** -> enrichir la fiche CRM avec les observations
- **Meilleure pratique** -> documenter dans la base de connaissances

## Examples

### Exemple 1 : Liaison post-REX

```
[Apres REX "Boulangerie Tartine" - pattern audio defaillant]

LIENS CREES :
1. REX "Boulangerie Tartine" -> Brief "Video Boulangerie Tartine"
2. Regle "Double source audio" -> ajoutee a Checklist Pre-Tournage
3. CRM "Boulangerie Tartine" -> tag "audio-sensible"
4. REX "Boulangerie Tartine" -> lie a REX "Restaurant Le Comptoir"
   (meme pattern audio, mars 2026)

CONSOLIDATION :
Le pattern "audio defaillant" apparait dans 3 REX sur les 2 derniers mois.
-> Regle derivee renforcee : budget micro directionnel a prevoir
   systematiquement sur les tournages en milieu bruyant (restauration,
   evenementiel, exterieur)
```

### Exemple 2 : Recherche transversale

```
Richard : "Qu'est-ce que je sais sur les tournages pour des restaurants ?"

RECHERCHE TRANSVERSALE :
- CRM : 3 prospects restaurant (1 gagne, 1 perdu, 1 en cours)
- Briefs : 2 briefs restaurant (1 livre, 1 en production)
- REX : 2 REX restaurant
  - Audio difficile (environnement bruyant)
  - Client indecis sur le style (manque de references)
- Devis : TJM moyen restaurant = 180 EUR/j (sous le TJM cible)

SYNTHESE :
Les restaurants sont un segment recurrent mais sous-paye.
Patterns a surveiller : audio + indecision style.
Recommandation : augmenter le TJM pour ce segment ou
proposer un package avec references visuelles incluses.
```

## References

- Depend de : `notion-sync` (lecture/ecriture toutes les bases), `rex-assistant` (regles derivees)
- Alimente : `weekly-review` (consolidation mensuelle), `prospect-coach` (enrichissement CRM)
- Voir aussi : `source-checker` (distinguer donnees Notion vs inference)
