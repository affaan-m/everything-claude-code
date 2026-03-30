---
name: confidence-calibration
description: 4 niveaux de certitude explicites sur chaque affirmation pour eviter l'incertitude cachee.
version: 1.0.0
category: Biais
priority: 1
author: Richard Cusey
---

# Confidence Calibration

> Chaque affirmation est taguee avec un niveau de certitude explicite pour que Richard sache exactement a quel point il peut faire confiance a l'information.

## When to Use

- **TOUJOURS** quand Claude donne un chiffre, une estimation ou un conseil
- Quand Richard prend une decision basee sur une information de Claude
- Sur les affirmations factuelles (prix marche, taux, statistiques)
- Sur les estimations de temps, budget ou probabilite
- Quand Richard demande "tu es sur de ca ?"

## How It Works

### 1. Les 4 niveaux de certitude

Chaque affirmation significative doit etre taguee :

| Tag | Niveau | Signification | Quand l'utiliser |
|-----|--------|---------------|------------------|
| ✅ | **Verifie** | Source documentaire identifiable | Donnee lue dans Notion, document, ou lien verifiable |
| 🔵 | **Haute confiance** | Connaissance solide du training | Fait bien etabli, largement documente |
| 🟡 | **Moderee** | Inference ou estimation | Deduit d'autres informations, approximation |
| 🔴 | **Basse** | Speculation ou supposition | Hypothese non verifiee, intuition |

### 2. Regles d'application

**Obligatoire sur :**
- Tout chiffre (montant, pourcentage, duree, quantite)
- Toute affirmation sur le marche ou la concurrence
- Toute recommandation strategique
- Toute estimation de resultat

**Optionnel sur :**
- Instructions techniques bien connues
- Reformulations de ce que Richard a dit
- Questions de clarification

### 3. Formulation

Integrer le tag naturellement dans la phrase :

```
BIEN :
"Le TJM moyen pour un videaste brand content a Paris est autour
de 350-500 EUR/j 🟡 (estimation basee sur les donnees marche 2024-2025,
pas de source specifique pour 2026)."

"Ton TJM actuel est de 200 EUR HT/j ✅ (lu dans ta base Devis Notion)."

MAUVAIS :
"Le TJM moyen est de 400 EUR/j." (pas de tag = incertitude cachee)
```

### 4. Escalade automatique

Quand le niveau de certitude est bas sur un point critique :

```
Si 🔴 sur un chiffre financier -> Proposer de verifier via :
  - Notion (donnees internes)
  - Recherche web (donnees marche)
  - Calcul Python (verification mathematique)

Si 🟡 sur une recommandation strategique -> Declencher anti-bias-check

Si plusieurs 🔴 dans une meme reponse -> Avertissement :
  "Attention : cette reponse contient plusieurs elements speculatifs.
   Je recommande de verifier avant de prendre une decision."
```

### 5. Calibration au fil du temps

Quand une information taguee est ensuite verifiee :
- ✅ confirmee -> confiance maintenue
- 🔵 confirmee -> monter en ✅ si source trouvee
- 🟡 confirmee -> noter pour ameliorer la calibration
- 🟡 ou 🔴 infirmee -> noter l'ecart, ajuster les futures estimations

## Examples

### Exemple 1 : Analyse de marche

```
Richard : "C'est quoi le prix marche pour une video drone immobilier a Paris ?"

Reponse calibree :
Le marche de la video drone immobiliere a Paris se situe dans
ces fourchettes :

- Video drone simple (1 vol, 2-3 min editee) : 300-600 EUR 🟡
  (estimation basee sur les annonces et forums pro 2024-2025)

- Package drone + video interieur : 800-1 500 EUR 🟡
  (fourchette large, depend du standing du bien)

- Ton dernier devis drone immobilier : 450 EUR ✅
  (lu dans base Devis Notion, octobre 2025)

- Tendance : les prix baissent car plus d'operateurs 🔵
  (tendance bien documentee dans le secteur)

- Part de marche des freelances vs agences a Paris : ~40/60 🔴
  (estimation non sourcee, a verifier)

Note : 2 elements en 🟡 et 1 en 🔴.
Pour affiner, je peux chercher des donnees plus recentes via Exa.
```

### Exemple 2 : Conseil strategique

```
Richard : "Je devrais investir dans un DJI Mavic 4 Pro ?"

Reponse calibree :
- Prix DJI Mavic 4 Pro : ~2 200 EUR 🔵 (prix constructeur 2025,
  verifier le prix actuel mars 2026)

- Ton CA drone sur 6 mois : 2 800 EUR ✅ (base Devis Notion)

- ROI estime : rentabilise en ~5 mois si 1 mission drone/mois 🟡
  (calcul : 2 200 / 450 = 4.9 missions)

- Le Mavic 4 Pro est meilleur que ton drone actuel 🔴
  (je ne sais pas quel drone tu utilises actuellement -
  a verifier dans Notion ou a me confirmer)

ESCALADE : 1 element 🔴 sur un point critique.
Question : quel drone utilises-tu actuellement ? Ca change
completement l'analyse du ROI.
```

## References

- Depend de : `source-checker` (distinguer les types de sources)
- Interagit avec : `anti-bias-check` (escalade sur les 🟡 strategiques), `math-verifier` (verifier les 🟡 numeriques)
- Voir aussi : `notion-sync` (source ✅ pour les donnees internes)
