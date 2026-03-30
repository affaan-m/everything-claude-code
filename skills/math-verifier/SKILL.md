---
name: math-verifier
description: Tous les calculs financiers via Python, jamais en calcul mental. Critique pour le pricing et les devis.
version: 1.0.0
category: Deficit
priority: 2
author: Richard Cusey
---

# Math Verifier

> Les LLM font des erreurs arithmetiques. Tous les calculs financiers passent par Python pour garantir l'exactitude.

## When to Use

- **TOUJOURS** pour les calculs de devis, TJM, acompte, marges
- Quand Richard demande de calculer un prix ou une rentabilite
- Pour les projections financieres (CA mensuel, objectifs)
- Pour les calculs de ROI (investissement materiel)
- Pour toute operation arithmetique impliquant de l'argent

## How It Works

### 1. Regle absolue

**Ne JAMAIS calculer mentalement.** Toujours utiliser Python/code execution.

Les erreurs courantes des LLM :
- Multiplications avec decimales (TVA, pourcentages)
- Divisions avec arrondis
- Cumuls sur plusieurs lignes
- Pourcentages de pourcentages

### 2. Contexte financier Richard

```python
# Parametres actuels (mars 2026)
TJM_ACTUEL = 200  # EUR HT/jour
TJM_CIBLE = 300   # EUR HT/jour (objectif 6 mois)
TVA = 0.20         # 20% TVA France
URSSAF_TAUX = 0.217  # Taux URSSAF micro-entreprise BNC
ACRE_ACTIF = False    # A verifier avec Richard
```

### 3. Calculs types

#### Devis

```python
def calculer_devis(jours_tournage, jours_montage, tjm, retouches_incluses=2):
    """Calcule un devis complet."""
    jours_total = jours_tournage + jours_montage
    montant_ht = jours_total * tjm
    tva = montant_ht * 0.20
    montant_ttc = montant_ht + tva
    acompte = montant_ht * 0.30  # 30% acompte standard

    return {
        "jours_total": jours_total,
        "montant_ht": montant_ht,
        "tva": tva,
        "montant_ttc": montant_ttc,
        "acompte_ht": acompte,
        "retouches_incluses": retouches_incluses,
        "tjm_effectif": montant_ht / jours_total
    }
```

#### Marge nette

```python
def marge_nette(ca_ht, charges_deductibles=0, taux_urssaf=0.217):
    """Calcule le revenu net apres charges."""
    cotisations = ca_ht * taux_urssaf
    net_avant_ir = ca_ht - cotisations - charges_deductibles
    return {
        "ca_ht": ca_ht,
        "cotisations_urssaf": cotisations,
        "charges": charges_deductibles,
        "net_avant_ir": net_avant_ir,
        "taux_prelevement_effectif": (cotisations + charges_deductibles) / ca_ht
    }
```

#### TJM effectif

```python
def tjm_effectif(montant_devis_ht, jours_travailles_reels):
    """Calcule le TJM reel apres prise en compte de tous les jours."""
    tjm = montant_devis_ht / jours_travailles_reels
    ecart_cible = tjm - 300  # ecart par rapport au TJM cible
    return {
        "tjm_effectif": round(tjm, 2),
        "ecart_vs_cible": round(ecart_cible, 2),
        "pourcentage_cible": round((tjm / 300) * 100, 1)
    }
```

### 4. Verification croisee

Pour tout calcul financier critique :

```
1. Calculer avec Python (resultat principal)
2. Verifier avec une approche differente (estimation mentale pour sanity check)
3. Si ecart > 10% entre les deux -> revoir le calcul
4. Taguer le resultat avec confidence-calibration :
   - Calcul Python verifie = ✅
   - Estimation sans calcul = 🟡 minimum
```

## Examples

### Exemple 1 : Devis projet

```
Richard : "Fais-moi un devis pour 2 jours de tournage + 3 jours de montage"

[Execution Python]
jours_tournage = 2
jours_montage = 3
tjm = 200  # TJM actuel

montant_ht = (2 + 3) * 200  # = 1000 EUR HT
tva = 1000 * 0.20            # = 200 EUR
montant_ttc = 1000 + 200     # = 1200 EUR TTC
acompte = 1000 * 0.30        # = 300 EUR HT

RESULTAT ✅ (calcul Python) :
- 5 jours total
- 1 000 EUR HT
- 200 EUR TVA
- 1 200 EUR TTC
- Acompte 30% : 300 EUR HT

ANTI-BIAS NOTE :
TJM effectif = 200 EUR/j, soit 33% en dessous de ton objectif (300 EUR).
Au TJM cible, ce devis serait a 1 500 EUR HT (1 800 EUR TTC).
```

### Exemple 2 : Projection mensuelle

```
Richard : "Si je fais 3 projets ce mois a 200 EUR/j, combien je gagne net ?"

[Execution Python]
# Hypothese : 3 projets de 3 jours en moyenne
jours = 3 * 3  # = 9 jours
ca_ht = 9 * 200  # = 1800 EUR
urssaf = 1800 * 0.217  # = 390.60 EUR
net = 1800 - 390.60  # = 1409.40 EUR

RESULTAT ✅ (calcul Python) :
- CA brut : 1 800 EUR HT (9 jours a 200 EUR)
- Cotisations URSSAF (21.7%) : 390,60 EUR
- Net avant IR : 1 409,40 EUR

CONTEXTE :
A 300 EUR/j (TJM cible), memes 9 jours = 2 700 EUR HT -> 2 114,10 EUR net.
Difference : +704,70 EUR net/mois.
```

### Exemple 3 : ROI materiel

```
Richard : "Le Mavic 4 Pro coute 2 200 EUR, en combien de temps je le rentabilise ?"

[Execution Python]
prix_drone = 2200
prix_moyen_mission_drone = 450  # estimation
missions_par_mois = 1.5  # estimation

ca_drone_mensuel = 450 * 1.5  # = 675 EUR
mois_rentabilite = 2200 / 675  # = 3.26 mois

RESULTAT :
- Prix : 2 200 EUR ✅
- CA drone/mois estime : 675 EUR 🟡 (base : 1.5 missions/mois a 450 EUR)
- Rentabilise en : 3,3 mois 🟡 (depend du rythme de missions)

SENSIBILITE :
- Si 1 mission/mois : 4,9 mois
- Si 2 missions/mois : 2,4 mois
```

## References

- Depend de : `notion-sync` (lire les donnees financieres reelles)
- Interagit avec : `confidence-calibration` (taguer les resultats), `anti-bias-check` (challenger les hypotheses de calcul)
- Voir aussi : `weekly-review` (metriques financieres hebdomadaires)
