---
title: Standard Program Pipeliner
summary: Un designer visuel de pipelines d’interfaçage où l’on assemble des traitements sans jamais voir une ligne de configuration.
status: beta
order: 30
featured: true
stack: ['WinUI 3', 'C#', 'Interpréteur dynamique']
glyph: '⬢'
accent: 'nebula'
highlights:
  - 'Interface d’abord, format ensuite'
  - 'Interpréteur dynamique, zéro recompilation'
  - 'Aucun JSON exposé à l’utilisateur'
year: 2026
---

## Le principe directeur

Un outil de pipeline finit presque toujours par exposer sa tuyauterie :
on croit configurer un traitement, on édite en réalité du JSON dans un champ
texte. Standard Program Pipeliner interdit ce glissement. Le format de
sérialisation existe, mais **l'utilisateur ne le voit jamais** — s'il faut
ouvrir un fichier pour comprendre un pipeline, l'interface a échoué.

## Interpréteur dynamique

Les étapes sont interprétées à l'exécution, pas compilées. Un pipeline se
modifie et se relance dans la seconde, sans build, sans redémarrage.
Le coût en performance brute est réel ; il est très largement compensé par
la boucle de rétroaction, qui passe de la minute à l'instantané.

## Thème cosmos

L'interface reprend la même direction artistique que ce site : fond profond,
une source de lumière chaude, des accents froids pour les états actifs.
Ce n'est pas une coquetterie — un designer de pipelines affiche beaucoup de
nœuds et de liens, et un fond sombre avec une seule source lumineuse rend la
hiérarchie visuelle lisible sans multiplier les couleurs.
