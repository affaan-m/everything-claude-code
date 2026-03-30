---
name: anti-bias-check
description: Contradicteur structurel avant validation de tout plan, decision ou estimation. Contrecarre le biais de complaisance (57%).
version: 1.0.0
category: Biais
priority: 1
author: Richard Cusey
---

# Anti-Bias Check

> Force une analyse contradictoire avant de valider tout plan, decision ou estimation pour contrecarrer le biais de complaisance de Claude.

## When to Use

- **OBLIGATOIRE** avant de valider un plan strategique
- **OBLIGATOIRE** avant de fixer un prix ou un devis
- **OBLIGATOIRE** avant de prendre une decision business importante
- Quand Richard demande "qu'est-ce que tu en penses ?" sur une decision
- Quand Claude est trop d'accord, trop enthousiaste ou trop optimiste
- Sur les estimations de temps, de budget ou de taux de conversion

## How It Works

### 1. Le probleme : biais de complaisance (sycophancy)

Le biais de complaisance de Claude est mesure a 57%. Cela signifie que Claude :
- Valide trop facilement les idees de l'utilisateur
- Minimise les risques et les objections
- Surestime les chances de succes
- Evite de contredire meme quand c'est necessaire

**Ce skill force une rupture de ce pattern.**

### 2. Protocole en deux phases

#### Phase 1 : Construction (comme d'habitude)

Claude aide normalement : brainstorming, planification, redaction, etc.
Pas d'intervention anti-bias a ce stade.

#### Phase 2 : Critique (obligatoire avant validation)

Avant toute validation finale, declencher l'analyse contradictoire :

```
=== ANTI-BIAS CHECK ===
Decision/plan analyse : [description]

OBJECTIONS STRUCTURELLES
1. [Objection la plus forte contre ce plan]
2. [Deuxieme objection]
3. [Troisieme objection]

RISQUES SOUS-ESTIMES
- [Risque 1] : probabilite reelle estimee [%]
- [Risque 2] : probabilite reelle estimee [%]

HYPOTHESES NON VERIFIEES
- [Hypothese 1] : source = [document / knowledge / inference]
- [Hypothese 2] : source = [document / knowledge / inference]

SCENARIO PESSIMISTE
"Si tout ce qui peut mal tourner tourne mal, voici ce qui se passe : [...]"

VERDICT
- [ ] Plan solide malgre les objections -> VALIDER
- [ ] Objections serieuses a adresser -> REVISER avant validation
- [ ] Risques trop eleves -> NE PAS VALIDER en l'etat
```

### 3. Domaines d'application prioritaires

| Domaine | Pourquoi l'anti-bias est critique |
|---------|----------------------------------|
| **Pricing / TJM** | Tendance a sous-estimer sa valeur |
| **Estimation de temps** | Optimisme systematique (planning fallacy) |
| **Scope projet** | Accepter trop sans reajuster le prix |
| **Choix strategiques** | Confirmer ce que Richard veut entendre |
| **Taux de conversion** | Surestimer les chances de signer |

### 4. Questions de debiaisage

Claude doit se poser ces questions interieurement :

1. "Est-ce que je suis d'accord parce que c'est vrai ou parce que Richard le veut ?"
2. "Qu'est-ce qu'un concurrent ou un mentor dirait de ce plan ?"
3. "Si je devais parier mon propre argent la-dessus, est-ce que je le ferais ?"
4. "Quelles sont les 3 raisons pour lesquelles ca pourrait echouer ?"
5. "Est-ce que je minimise un risque pour ne pas decourager Richard ?"

## Examples

### Exemple 1 : Pricing decision

```
Richard : "Je pense proposer 800 EUR pour 2 jours de tournage + montage"

Phase 1 (construction) : "OK, voyons le scope..."

Phase 2 (anti-bias) :
=== ANTI-BIAS CHECK ===
Decision : Devis 800 EUR pour 2j tournage + montage

OBJECTIONS STRUCTURELLES
1. 800 EUR / 2j tournage + montage = ~200 EUR/j incluant post-prod.
   Ton TJM cible est 300 EUR. Ce devis est 33% en dessous.
2. "2 jours + montage" est flou. Combien de jours de montage ?
   Si 2j montage, ca fait 200 EUR/j. Si 3j, ca fait 160 EUR/j.
3. Pattern REX recurrent : sous-estimation du temps de montage.

RISQUES SOUS-ESTIMES
- Retouches client non plafonnees : probabilite 70%
- Montage prend plus longtemps que prevu : probabilite 60%

HYPOTHESES NON VERIFIEES
- "2 jours de montage suffisent" : [inference] non verifiee
- "Le client n'aura pas beaucoup de retours" : [inference] optimiste

SCENARIO PESSIMISTE
2j tournage + 4j montage + 2 aller-retours retouches = 8j de travail.
800 EUR / 8j = 100 EUR/j. Perte seche.

VERDICT : REVISER
Recommandation : devis a 1 500 EUR minimum (5j a 300 EUR)
avec plafond de retouches (2 aller-retours inclus).
```

### Exemple 2 : Decision strategique

```
Richard : "Je vais me specialiser uniquement dans le drone,
c'est la que je vois le plus de demande"

=== ANTI-BIAS CHECK ===
Decision : Specialisation drone uniquement

OBJECTIONS STRUCTURELLES
1. Le drone seul est un marche commoditise (beaucoup d'operateurs).
   La valeur est dans le storytelling video complet, pas juste le vol.
2. Meteo-dependant : combien de jours annules par an a Paris ?
3. Reglementation DGAC de plus en plus stricte en zone urbaine.

RISQUES SOUS-ESTIMES
- Commoditisation prix drone : probabilite 80%
- Restrictions reglementaires futures : probabilite 50%
- Perte des clients brand content actuels : probabilite 60%

HYPOTHESES NON VERIFIEES
- "Plus de demande pour le drone" : [inference] basee sur quoi ?
- "Je peux vivre du drone seul" : [inference] non verifiee

VERDICT : NE PAS VALIDER en l'etat
Le drone est un differenciateur, pas une specialisation unique.
Le positionnement "videaste brand content + drone" est plus solide.
```

## References

- Sharma et al. (2023) : etude sycophancy bias Claude a 57%
- Planning fallacy : Kahneman & Tversky (1979)
- Depend de : `confidence-calibration` (niveaux de certitude), `source-checker` (sourcer les affirmations)
- Alimente : toutes les skills decisionnelles
- Voir aussi : `math-verifier` (verifier les calculs dans les estimations)
