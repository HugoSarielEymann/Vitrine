---
title: StocksScience Analyzer
summary: Un laboratoire d’analyse de marchés qui cherche d’abord à comprendre, et seulement ensuite à prédire.
status: alpha
order: 20
featured: true
stack: ['C#', 'Python', 'Pandas', 'WinUI 3']
glyph: '◎'
accent: 'plasma'
highlights:
  - 'Protocole scientifique avant modèle'
  - 'Crypto en groupe témoin'
  - 'Résultats négatifs conservés'
year: 2026
---

## Une posture, pas un signal

La plupart des outils d'analyse de marché partent du modèle et cherchent
ensuite les données qui le valident. StocksScience fait l'inverse : il part
d'une hypothèse formulée à l'avance, définit son critère de réfutation, puis
la confronte aux données.

Une hypothèse qui échoue n'est pas supprimée. Elle est archivée avec son
résultat — parce que savoir ce qui **ne** marche **pas** a autant de valeur,
et coûte beaucoup plus cher à redécouvrir.

## Le groupe témoin

Les marchés crypto servent de groupe témoin. Un effet qui apparaît sur les
actions et sur la crypto est probablement un artefact de méthode ; un effet
qui n'apparaît que d'un côté mérite un second regard. C'est une garde-fou
simple contre le sur-apprentissage.

## Architecture

Le noyau de calcul est en C# pour la vitesse et la sûreté de typage ;
l'exploration statistique se fait en Python, où l'outillage scientifique est
irremplaçable. Les deux communiquent par un format d'échange versionné, ce qui
permet de rejouer une analyse d'il y a six mois à l'identique.

> Une analyse qu'on ne peut pas rejouer n'est pas un résultat, c'est une anecdote.
