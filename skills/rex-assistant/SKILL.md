---
name: rex-assistant
description: REX post-projet (48h max) et BAR pre-projet. Identifie les patterns d'erreur recurrents.
version: 1.0.0
category: Apprentissage
priority: 2
author: Richard Cusey
---

# REX Assistant

> Retour d'Experience systematique apres chaque projet et Bilan Avant Realisation avant chaque nouveau projet.

## When to Use

- **REX** : Dans les 48h suivant la livraison d'un projet (alerte si depasse)
- **BAR** : Avant de commencer tout nouveau projet ou tournage
- Quand Richard mentionne un probleme recurrent sur ses projets
- Quand un projet s'est mal passe et qu'il faut en tirer des lecons
- Lors de la revue hebdomadaire si des REX sont en attente

## How It Works

### 1. REX (Retour d'Experience) - Post-projet

Declenche dans les 48h apres livraison. Structure obligatoire :

```
=== REX : [Nom du projet] ===
Date livraison : [date]
Client : [nom]
Type : [brand content / corporate / drone / evenementiel]

CE QUI A BIEN FONCTIONNE
- [point positif 1]
- [point positif 2]

CE QUI A MAL FONCTIONNE
- [probleme 1] -> Cause racine : [analyse]
- [probleme 2] -> Cause racine : [analyse]

PATTERN RECURRENT ?
- [ ] Oui -> Lequel : [nom du pattern]
- [ ] Non -> Nouveau probleme isole

REGLE DERIVEE
"[Regle concrete et actionnable a appliquer desormais]"
Exemple : "Toujours faire signer le brief avant J-3 du tournage"

ACTIONS CORRECTIVES
1. [Action] - Deadline [date] - Responsable [Richard / client]

METRIQUE D'IMPACT
- Temps perdu estime : [heures]
- Impact financier estime : [montant EUR] (via math-verifier)
```

### 2. BAR (Bilan Avant Realisation) - Pre-projet

Declenche avant de commencer un nouveau projet :

```
=== BAR : [Nom du projet] ===
Client : [nom]
Type : [type]
Budget : [montant EUR]

CHECKLIST PRE-TOURNAGE
- [ ] Brief signe par le client
- [ ] Devis signe et acompte recu
- [ ] Reperage fait (si applicable)
- [ ] Materiel verifie (camera, drone, audio)
- [ ] Autorisations obtenues (drone DGAC, lieu)
- [ ] Backup audio prevu (micro cravate + boom)

PATTERNS A SURVEILLER (issus des REX)
- [Pattern 1] : [mesure preventive]
- [Pattern 2] : [mesure preventive]

RISQUES IDENTIFIES
- [Risque 1] : Probabilite [haute/moyenne/basse] - Mitigation : [action]
```

### 3. Patterns dominants (mars 2026)

Patterns recurrents identifies dans les REX recents :

| Pattern | Frequence | Regle derivee |
|---------|-----------|---------------|
| **Brief non signe** | Recurrent | Toujours obtenir signature brief avant J-3 |
| **Audio defaillant** | Recurrent | Double source audio systematique (cravate + boom) |
| **Sur-disponibilite / culpabilite a dire non** | Recurrent | Dire non a tout projet qui ne respecte pas les conditions minimales |

### 4. Alimentation Notion

Chaque REX et BAR doit etre enregistre dans la base Notion REX :
- Creer une nouvelle entree via Notion MCP
- Taguer avec le type de projet et le pattern identifie
- Lier au client dans le CRM

## Examples

### Exemple 1 : REX apres livraison

```
Richard : "Je viens de livrer la video pour Boulangerie Tartine"

=== REX : Video Boulangerie Tartine ===
Date livraison : 28 mars 2026
Client : Boulangerie Tartine
Type : brand content PME

CE QUI A BIEN FONCTIONNE
- Rendu visuel valide au premier retour
- Tournage en 1 journee comme prevu

CE QUI A MAL FONCTIONNE
- Audio ambiance trop fort sur 2 plans -> Cause racine : pas de micro
  directionnel, uniquement ambiance
- Brief modifie le jour du tournage -> Cause racine : brief non signe

PATTERN RECURRENT ?
- [x] Oui -> Brief non signe + Audio defaillant

REGLE DERIVEE
"Refuser le tournage si le brief n'est pas signe 72h avant.
 Toujours prevoir un micro directionnel en complement."

ACTIONS CORRECTIVES
1. Ajouter clause brief dans template devis - 30 mars - Richard
2. Acheter/louer micro directionnel compact - 5 avril - Richard

METRIQUE D'IMPACT
- Temps perdu : 3h de post-prod audio supplementaire
- Impact financier : ~150 EUR de temps non facture
```

### Exemple 2 : BAR avant nouveau projet

```
Richard : "Je commence un tournage corporate pour Fintech Alpha lundi"

=== BAR : Corporate Fintech Alpha ===
Client : Fintech Alpha
Type : corporate
Budget : 1 200 EUR HT

CHECKLIST PRE-TOURNAGE
- [x] Brief signe par le client
- [x] Devis signe et acompte recu (600 EUR)
- [ ] Reperage fait -> A FAIRE vendredi
- [x] Materiel verifie
- [x] Pas de vol drone prevu
- [x] Backup audio prevu (cravate Rode + boom)

PATTERNS A SURVEILLER
- Brief non signe : OK, deja signe
- Audio defaillant : Backup prevu, verifier piles
- Sur-disponibilite : Budget correct, pas de concession

RISQUES IDENTIFIES
- Reperage non fait : Probabilite moyenne - Mitigation : planifier vendredi PM
```

## References

- Depend de : `notion-sync` (lecture/ecriture base REX), `math-verifier` (calculs impact financier)
- Alimente : `prospect-coach` (patterns a mentionner dans les relances), `weekly-review` (alertes REX en retard)
- Voir aussi : `anti-bias-check` (appliquer sur l'analyse des causes racines)
