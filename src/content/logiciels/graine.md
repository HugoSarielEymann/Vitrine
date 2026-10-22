---
title: Graine
summary: Décrire un système d’information par ses concepts, en choisir la forme selon ses priorités, le semer sur un terrain et le piloter — d’une seule fenêtre.
status: alpha
order: 35
featured: false
stack: ['WinUI 3', 'C# / .NET 10', 'Docker', 'Kubernetes']
glyph: '✣'
accent: 'plasma'
highlights:
  - 'Aucune ligne de code générée'
  - 'Un génome qui dit pourquoi'
  - 'Rien ne bouge avant « Semer »'
year: 2026
---

## Le problème

Monter un système d’information commence presque toujours par la tuyauterie :
un schéma de base, une API, un fichier Compose, des manifestes Kubernetes — et
l’idée de départ se perd sous la forme technique. Changer d’avis sur la base de
données ou sur l’hébergement, c’est tout réécrire.

## Ce que fait la Graine

Une **graine** dit *quoi* : les entités et leurs champs, ce qui appartient à
quoi, ce qui vise quoi, les listes de choix, les portes (REST, gRPC), la
croissance, les priorités. Le **génome** en déduit *comment* — hébergement,
moteur de base, nature des clés, portes — et dit pour chaque gène ce qui l’a
emporté et ce qui a été sacrifié.

L’hôte de la Graine sert alors le système tel quel, **sans code généré** : CRUD
complet, composants dans une transaction, intégrité référentielle, validation
en français, rechargement à chaud.

## Le chemin d’un système

Huit étapes, de l’idée au système qui vit : accueil, domaine, génome,
croissance et portes, facettes, vallée, données, observatoire. Chaque cellule
du chemin dit son état d’après les faits — faite, à faire, bloquée, vivante —
et la prochaine étape envoie une onde.

Dans la **vallée**, chaque terrain (ce poste, un serveur SSH, une grappe
Kubernetes, un NAS TrueNAS) pose son propre génome par-dessus celui de la
graine : SQLite et un processus en développement, Compose et PostgreSQL en
préproduction, Kubernetes et plusieurs copies en production. Ctrl+Entrée
montre le plan du semis ; rien ne bouge avant « Semer ».

Le parcours se voit en mouvement sur la page
[Le chemin d’un système](/cristal/graine).

## Le mouvement lié au réel

L’**observatoire** place chaque terrain semé en orbite autour d’un tourbillon :
chaque appel servi file le long de sa vrille, en braise s’il échoue. Au repos,
les lumières respirent à quelques images par seconde ; seul un événement vrai
se joue en fluide, puis tout se repose. Un moniteur de fluidité (Ctrl+Maj+F)
mesure en permanence images par seconde, latence et gels.

La Graine parle son propre dialecte visuel, le cristal, présenté sur
[L’œil d’ORT](/cristal).

## Les limites

La Graine est en alpha. Elle sait sonder un serveur et proposer une application
sur un NAS, mais elle ne remplace pas une plateforme d’exploitation : elle
décrit, sème et observe ce qu’elle a semé.
