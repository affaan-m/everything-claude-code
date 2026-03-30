---
name: prospect-coach
description: Coach CRM avec relances calibrees J+5/J+14 et templates multi-canal.
version: 1.0.0
category: Prospection
priority: 2
author: Richard Cusey
---

# Prospect Coach

> Gere le pipeline de prospection avec des relances calibrees et des templates adaptes a chaque canal.

## When to Use

- Quand Richard demande le statut de son pipeline ou de ses relances
- Quand un prospect n'a pas repondu (declenchement relance J+5 ou J+14)
- Pour preparer un premier message a un nouveau prospect
- Pour rediger une relance personnalisee
- Lors de la revue hebdomadaire (prospects en retard)

## How It Works

### 1. Lecture du CRM (via notion-sync)

Lire la base CRM Prospects dans Notion et extraire :
- Nom du prospect / entreprise
- Canal de contact (Instagram, LinkedIn, email, telephone)
- Date du dernier contact
- Statut : nouveau, contacte, relance 1, relance 2, negoce, gagne, perdu
- Montant potentiel estime
- Notes contextuelles

### 2. Calendrier de relances

| Etape | Delai | Action |
|-------|-------|--------|
| Premier contact | J0 | Message personnalise (jamais automatise) |
| Relance 1 | J+5 | Relance douce, apport de valeur |
| Relance 2 | J+14 | Derniere relance, proposition concrete |
| Cloture | J+30 | Archiver si pas de reponse |

**Regle non-negociable : le premier contact n'est JAMAIS automatise.** Toujours personnalise, toujours redige par Richard avec l'aide de Claude.

### 3. Templates par canal

#### Instagram DM

```
Relance J+5 (douce) :
"Salut [prenom] ! Je reviens vers toi suite a notre echange.
J'ai vu [element recent de leur feed/story] - super rendu !
Si tu veux qu'on en reparle pour [projet evoque], je suis dispo
cette semaine. Bonne journee !"

Relance J+14 (concrete) :
"Hey [prenom], je me permets un petit message.
J'ai reflechi a [projet] et j'aurais une proposition rapide
a te partager. Ca te dit un call de 15 min cette semaine ?"
```

#### LinkedIn DM

```
Relance J+5 :
"Bonjour [prenom], je me permets de revenir vers vous suite
a notre conversation. J'ai pris le temps de reflechir a
[besoin evoque] et j'aurais quelques pistes a vous proposer.
Seriez-vous disponible pour un echange rapide cette semaine ?"

Relance J+14 :
"Bonjour [prenom], je souhaitais faire un point rapide.
J'ai prepare une proposition pour [projet]. Puis-je vous
l'envoyer par email ? Bonne journee."
```

#### Cold Email

```
Objet : [Proposition video] pour [entreprise]

Bonjour [prenom],

Je suis Richard Cusey, videaste freelance specialise en brand
content pour les PME a Paris.

[1 phrase sur pourquoi je les contacte - element specifique
de leur entreprise/communication]

Je vous propose [offre concrete avec budget approximatif].

Voici mon portfolio : [lien]

Bonne journee,
Richard
```

### 4. Personnalisation obligatoire

Avant d'envoyer tout message, verifier :
- [ ] Reference a un element specifique du prospect (pas generique)
- [ ] Ton adapte au canal (decontracte Instagram, pro LinkedIn)
- [ ] Proposition de valeur claire
- [ ] Call-to-action simple (un seul)
- [ ] Pas de faute d'orthographe

## Examples

### Exemple 1 : Pipeline hebdomadaire

```
Richard : "Quelles relances je dois faire cette semaine ?"

[Lecture CRM via Notion]

RELANCES CETTE SEMAINE :
1. Agence Bloom - J+8 (relance 1 en retard de 3j)
   -> Canal : LinkedIn - Dernier msg : 23 mars
   -> Template suggere : relance J+5 LinkedIn adaptee

2. Restaurant Le Marais - J+15 (relance 2)
   -> Canal : Instagram DM - Dernier msg : 16 mars
   -> Template suggere : relance J+14 Instagram

3. Startup GreenTech - J+5 (relance 1)
   -> Canal : Email - Premier contact : 26 mars
   -> Template suggere : relance J+5 email
```

### Exemple 2 : Premier contact

```
Richard : "Je veux contacter une agence immobiliere sur Instagram"

ATTENTION : Premier contact = toujours personnalise, jamais de template copie-colle.

Questions avant redaction :
1. Quel est le nom de l'agence ?
2. Qu'est-ce qui t'a donne envie de les contacter ?
3. Quel type de video tu leur proposerais ?
4. Tu as vu quelque chose de specifique sur leur feed ?

[Apres reponses, redaction d'un message sur mesure]
```

## References

- Depend de : `notion-sync` (lecture CRM), `math-verifier` (calcul taux de conversion)
- Alimente : `weekly-review` (metriques pipeline), `rex-assistant` (patterns prospect)
- Voir aussi : `anti-bias-check` (valider les estimations de conversion)
